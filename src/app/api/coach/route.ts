import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  createSession,
  getSession,
  addMessage,
  type CoachMode,
} from "@/lib/session-store";
import { recordCoaching } from "@/lib/progress-store";
import { getLevels, getLevelLabel } from "@/lib/level-store";

// ── System prompt ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert English language coach. Analyze the user's English and provide structured feedback.

For EVERY user message, respond in exactly this order:
🔍 **Correction** — corrected version or "Your sentence is correct!"
📖 **Explanation** — grammar/vocabulary rule, clearly stated
📝 **Examples** — 1-2 example sentences
🎯 **Next Step** — one practice exercise

Be encouraging, one concept at a time, practical examples, 1-3 sentences per section.

Mode: grammar/vocabulary/writing. Single word → vocabulary mode.`;

function buildSystemPrompt(mode: string): string {
  const levels = getLevels();
  const level = mode === "grammar" ? levels.grammar :
               mode === "vocabulary" ? levels.vocabulary : levels.writing;
  const label = getLevelLabel(level);
  return SYSTEM_PROMPT + `\n\nUser level: ${level} (${label}) for ${mode}.${level === "A1" || level === "A2" ? " Use very simple language." : level === "C1" || level === "C2" ? " Use sophisticated language." : ""}`;
}

const VOICE_PROMPT = `You are an English speaking coach. The user spoke a sentence. Give feedback:
🎙️ **What You Said** — transcription
🔊 **Pronunciation** — 1-2 difficult words, phonetic breakdown
💬 **Fluency** — naturalness comments
📝 **Key Tip** — one actionable tip. Be encouraging, 3-5 sentences total.`;

// ── Groq helper ─────────────────────────────────────────────────────────

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "YOUR_GROQ_KEY_HERE") throw new Error("GROQ_API_KEY not set");
  return new Groq({ apiKey });
}

// ── Simulated fallback ──────────────────────────────────────────────────

const SIMULATED: Record<string, string[]> = {
  grammar: [
    `🔍 **Correction**\n"I went to the store yesterday."\n\n📖 **Explanation**\nUse past tense for completed actions. "Go" is irregular: go → went → gone.\n\n📝 **Examples**\n• "She went to the gym."\n• "We went to that restaurant."\n\n🎯 **Next Step**\nFill in: "Yesterday, I ___ (walk) to the park."`,
    `🔍 **Correction**\n"She walks to school every day."\n\n📖 **Explanation**\nThird-person singular needs -s/-es in present simple.\n\n📝 **Examples**\n• "He plays football every Sunday."\n• "The dog barks at the mailman."\n\n🎯 **Next Step**\nFix: "My brother work at a hospital."`,
  ],
  vocabulary: [
    `🔍 **Your word: "meticulous"**\n\n📖 **Explanation**\nAdjective — extremely careful and precise about details.\n\n📝 **Examples**\n• "She's a meticulous editor."\n• "The chef was meticulous about plating."\n\n🎯 **Next Step**\nUse "meticulous" in a sentence about your work or studies.`,
  ],
  writing: [
    `🔍 **Correction**\nClear and well-organized!\n\n📖 **Explanation**\nVary sentence length for rhythm — mix short punchy sentences with longer detailed ones.\n\n📝 **Examples**\nBefore: "I went to the park. It was sunny. I saw a dog."\nAfter: "I went to the park on a sunny afternoon, where a brown dog chased a ball."\n\n🎯 **Next Step**\nRewrite a paragraph mixing short and long sentences. Read both aloud.`,
  ],
  voice: [
    `🎙️ **What You Said**\nI can see your transcription — good effort!\n\n🔊 **Pronunciation Notes**\nFocus on word stress — content words (nouns, verbs) get more stress.\n\n💬 **Fluency Feedback**\nYour structure is understandable. Try blending words more smoothly.\n\n📝 **Key Tip**\nPractice shadowing — repeat after a native speaker, matching rhythm and intonation.`,
  ],
};

function getSimulated(mode: string, n: number) {
  const r = SIMULATED[mode] || SIMULATED.grammar;
  return r[n % r.length];
}

// ── SSE stream helper ───────────────────────────────────────────────────

function createSSE() {
  const encoder = new TextEncoder();
  let ctrl!: ReadableStreamDefaultController;
  const stream = new ReadableStream({ start(c) { ctrl = c; } });
  return {
    stream,
    send(data: unknown) { ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); },
    close() { try { ctrl.close(); } catch {} },
    err(msg: string) { this.send({ type: "error", message: msg }); this.close(); },
  };
}

// ── POST ────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { message, mode, sessionId, stream: wantStream } = await request.json();
  if (!message) return NextResponse.json({ error: "Missing 'message'" }, { status: 400 });

  let session = sessionId ? getSession(sessionId) : null;
  if (sessionId && !session) return NextResponse.json({ error: "Session expired", code: "SESSION_EXPIRED" }, { status: 404 });

  if (!session) {
    const valid: CoachMode[] = ["grammar", "vocabulary", "writing", "voice"];
    const m: CoachMode = valid.includes(mode as CoachMode) ? (mode as CoachMode) : "grammar";
    session = createSession(m);
  }

  addMessage(session.id, "user", message);
  const labels: Record<string, string> = { grammar: "📝 Grammar", vocabulary: "📚 Vocab", writing: "✍️ Writing", voice: "🎤 Voice" };

  // ── Streaming ─────────────────────────────────────────────────────
  if (wantStream && process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "YOUR_GROQ_KEY_HERE") {
    const sse = createSSE();
    (async () => {
      try {
        const groq = getGroq();
        const sysPrompt = session!.mode === "voice" ? VOICE_PROMPT : buildSystemPrompt(session!.mode);
        const msgs: Groq.Chat.ChatCompletionMessageParam[] = [
          { role: "system", content: sysPrompt },
          ...session!.messages.slice(-20).map(m => ({ role: m.role === "assistant" ? "assistant" as const : "user" as const, content: m.content })),
        ];

        const stream = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: msgs,
          max_tokens: 1024,
          temperature: 0.7,
          stream: true,
        });

        let full = "";
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) { full += text; sse.send({ type: "token", text }); }
        }

        addMessage(session!.id, "assistant", full);
        sse.send({ type: "done", sessionId: session!.id, mode: session!.mode, label: labels[session!.mode], messageCount: session!.messageCount });
        sse.close();

        try { recordCoaching({ mode: session!.mode as any, userText: message, coachResponse: full }); } catch {}
      } catch (err: any) {
        console.error("Groq stream error:", err);
        const fallback = getSimulated(session!.mode, session!.messageCount);
        addMessage(session!.id, "assistant", fallback);
        sse.send({ type: "done", sessionId: session!.id, mode: session!.mode, label: labels[session!.mode], messageCount: session!.messageCount, fallback: true });
        sse.close();
      }
    })();
    return new Response(sse.stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
  }

  // ── Non-streaming ─────────────────────────────────────────────────
  let response: string;
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "YOUR_GROQ_KEY_HERE") {
    try {
      const groq = getGroq();
      const sysPrompt = mode === "voice" ? VOICE_PROMPT : buildSystemPrompt(mode);
      const msgs: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: sysPrompt },
        ...session.messages.slice(-20).map(m => ({ role: m.role === "assistant" ? "assistant" as const : "user" as const, content: m.content })),
      ];
      const result = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: msgs,
        max_tokens: 1024,
        temperature: 0.7,
      });
      response = result.choices[0]?.message?.content || "";
      if (!response) response = getSimulated(session.mode, session.messageCount);
      else try { recordCoaching({ mode: session.mode as any, userText: message, coachResponse: response }); } catch {}
    } catch (err: any) {
      console.error("Groq error:", err);
      response = getSimulated(session.mode, session.messageCount);
    }
  } else {
    await new Promise(r => setTimeout(r, 400));
    response = getSimulated(session.mode, session.messageCount);
  }

  addMessage(session.id, "assistant", response);
  return NextResponse.json({ sessionId: session.id, mode: session.mode, label: labels[session.mode], response, messageCount: session.messageCount });
}

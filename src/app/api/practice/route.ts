import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createSession, getSession, addMessage, type PracticeMode } from "@/lib/session-store";
import { getSystemFallbackPool } from "@/lib/multiwoz";

const SYSTEM_PROMPT = `You are a Practice Coach for the Linguify app. Run interactive practice sessions for English learners.

Session types: Role-play (real-world scenarios), Drills (grammar/vocab exercises), Guided Conversation (free dialogue with tips).

Structure: Set a clear goal → practice 5-10 min → every ~4 messages give a debrief (🟢 what went well, 🟡 one thing to improve, 🔵 tip).

Tone: Energetic and supportive. Use sandwich method: praise → correction → encouragement. 2-5 sentences. Be conversational.`;

const SIMULATED: Record<string, string[]> = {
  roleplay: ["🎭 Good! The barista hands you your coffee. \"Would you like anything else?\"", "🎭 Nice! When ordering try \"I'd like\" instead of \"I want\" — more natural."],
  drill: ["⚡ Good! Answer: \"had known\" — past perfect. Next: \"She ___ (study) English for three years before moving.\"", "⚡ Correct! ✅ Try: \"By the time we arrived, the movie ___ (already/start).\""],
  conversation: ["💬 Interesting! What got you started with this?", "💬 Tell me more — what's the best part?"],
};

function getSimulated(mode: string, n: number) {
  const pool = getSystemFallbackPool("restaurant");
  if (pool.length > 0 && n % 2 === 0) return pool[n % pool.length];
  const r = SIMULATED[mode] || SIMULATED.conversation;
  return r[n % r.length];
}

export async function POST(request: NextRequest) {
  const { message, mode, sessionId } = await request.json();
  if (!message) return NextResponse.json({ error: "Missing 'message'" }, { status: 400 });

  let session = sessionId ? getSession(sessionId) : null;
  if (sessionId && !session) return NextResponse.json({ error: "Session expired", code: "SESSION_EXPIRED" }, { status: 404 });

  if (!session) {
    const valid: PracticeMode[] = ["roleplay", "drill", "conversation", "interview", "travelling", "food", "friends", "multiwoz"];
    const m: PracticeMode = valid.includes(mode as PracticeMode) ? (mode as PracticeMode) : "conversation";
    session = createSession(m);
  }

  addMessage(session.id, "user", message);
  let response: string;

  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "YOUR_GROQ_KEY_HERE") {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const msgs: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
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
    } catch (err) {
      console.error("Groq practice error:", err);
      response = getSimulated(session.mode, session.messageCount);
    }
  } else {
    await new Promise(r => setTimeout(r, 400));
    response = getSimulated(session.mode, session.messageCount);
  }

  addMessage(session.id, "assistant", response);
  return NextResponse.json({ sessionId: session.id, mode: session.mode, response, messageCount: session.messageCount });
}

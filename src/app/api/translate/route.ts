import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are a translation coach. Compare the user's English translation to a native-language original. Respond:
🌐 **Natural Translation** — most natural English version
🔄 **Your Translation** — user's attempt
📊 **Comparison** — what's right, what to improve, missing nuances
📝 **Key Vocabulary** — 2-4 useful words/phrases with definitions
Be encouraging and constructive.`;

export async function POST(request: NextRequest) {
  try {
    const { nativeText, userTranslation, nativeLanguage } = await request.json();
    if (!nativeText || !userTranslation) return NextResponse.json({ error: "Missing nativeText or userTranslation" }, { status: 400 });

    const lang = nativeLanguage || "your native language";

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "YOUR_GROQ_KEY_HERE") {
      return NextResponse.json({
        nativeText, userTranslation,
        naturalTranslation: "[Get a free Groq API key at https://console.groq.com/keys to enable AI translation coaching]",
        comparison: "API key not configured.",
        vocabulary: [],
        fallback: true,
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `My language: ${lang}\n\nOriginal: "${nativeText}"\n\nMy English: "${userTranslation}"\n\nPlease analyze and help me improve.` },
      ],
      max_tokens: 1024,
      temperature: 0.5,
    });

    const fullResponse = result.choices[0]?.message?.content || "";
    const natMatch = fullResponse.match(/🌐\s*\*?\*?Natural Translation\*?\*?\s*\n([\s\S]*?)(?=🔄|$)/i);
    const naturalTranslation = natMatch ? natMatch[1].trim() : "";
    const vocabMatch = fullResponse.match(/📝\s*\*?\*?Key Vocabulary\*?\*?\s*\n([\s\S]*?)$/i);
    const vocabulary: string[] = [];
    if (vocabMatch) vocabMatch[1].trim().split("\n").forEach(l => { const c = l.replace(/^[-•*]\s*/, "").trim(); if (c) vocabulary.push(c); });

    return NextResponse.json({ nativeText, userTranslation, naturalTranslation, comparison: fullResponse, vocabulary });
  } catch (err: unknown) {
    console.error("Translate error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Translation failed", detail: message, hint: "Get a free key at https://console.groq.com/keys" }, { status: 502 });
  }
}

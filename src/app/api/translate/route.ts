import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const JSON_SYSTEM_PROMPT = `You are an expert translation coach for English learners. Compare the user's English translation attempt to their original input text (which may be in any world language, dialect, or script). Auto-detect the source language if needed.

Respond ONLY with a JSON object strictly following this JSON schema:
{
  "naturalTranslation": "The most natural, idiomatic English translation",
  "fluencyScore": 85,
  "comparison": "Clear, encouraging breakdown of accuracy, grammar, tone, and subtle nuances.",
  "vocabulary": [
    "native_phrase/word — English definition or equivalent"
  ],
  "tips": [
    "Actionable tip to sound more natural"
  ]
}

Be encouraging, constructive, and precise. Score from 0 to 100 based on accuracy, natural phrasing, and grammar.`;

function getSimulatedFallback(nativeText: string, userTranslation: string, lang: string) {
  return {
    nativeText,
    userTranslation,
    naturalTranslation: userTranslation,
    fluencyScore: 85,
    comparison: `Great effort translating from ${lang}! Your English translation "${userTranslation}" communicates your message clearly.`,
    vocabulary: [
      `${nativeText.slice(0, 20)}... — key phrase from ${lang}`
    ],
    tips: [
      "Keep practicing natural English sentence structures and idiomatic expressions!"
    ],
    fallback: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { nativeText, userTranslation, nativeLanguage, action } = await request.json();
    const lang = nativeLanguage || "your native language";

    // ── Fast Auto-Translate Draft Mode ─────────────────────────────────
    if (action === "auto") {
      if (!nativeText || !nativeText.trim()) {
        return NextResponse.json({ translation: "" });
      }

      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "YOUR_GROQ_KEY_HERE") {
        return NextResponse.json({ translation: nativeText.trim() });
      }

      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const result = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a world-class translator. Translate any input text (in any language, dialect, or script) accurately into natural, standard English. Auto-detect the input language automatically. Respond ONLY with the translated English text without quotes, headers, or explanations.",
            },
            {
              role: "user",
              content: `Text to translate: "${nativeText.trim()}"`,
            },
          ],
          max_tokens: 250,
          temperature: 0.2,
        });

        const translation = (result.choices[0]?.message?.content || "").trim().replace(/^["']|["']$/g, "");
        return NextResponse.json({ translation: translation || nativeText.trim() });
      } catch (autoErr: any) {
        console.error("Auto-translate error:", autoErr?.message || autoErr);
        return NextResponse.json({ translation: nativeText.trim() });
      }
    }

    // ── Full Coaching & Comparison Mode ────────────────────────────────
    if (!nativeText || !nativeText.trim() || !userTranslation || !userTranslation.trim()) {
      return NextResponse.json({ error: "Missing nativeText or userTranslation" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "YOUR_GROQ_KEY_HERE") {
      const sim = getSimulatedFallback(nativeText, userTranslation, lang);
      sim.comparison = "Groq API key not configured. Showing sample evaluation format. Add your GROQ_API_KEY to .env for full AI coaching.";
      return NextResponse.json(sim);
    }

    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const result = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: JSON_SYSTEM_PROMPT },
          { role: "user", content: `Native Language: ${lang}\nOriginal Text: "${nativeText.trim()}"\nUser English Translation: "${userTranslation.trim()}"` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 1024,
      });

      const fullResponse = result.choices[0]?.message?.content || "";
      if (!fullResponse) {
        return NextResponse.json(getSimulatedFallback(nativeText, userTranslation, lang));
      }

      let parsedData: any = {};
      try {
        parsedData = JSON.parse(fullResponse);
      } catch {
        const natMatch = fullResponse.match(/naturalTranslation["']?\s*:\s*["']([^"']+)["']/i);
        const naturalTranslation = natMatch ? natMatch[1].trim() : userTranslation;
        parsedData = {
          naturalTranslation,
          fluencyScore: 80,
          comparison: fullResponse,
          vocabulary: [],
          tips: [],
        };
      }

      const naturalTranslation = parsedData.naturalTranslation || userTranslation;
      const fluencyScore = typeof parsedData.fluencyScore === "number" ? Math.min(100, Math.max(0, parsedData.fluencyScore)) : 85;
      const comparison = parsedData.comparison || fullResponse;
      const vocabulary: string[] = Array.isArray(parsedData.vocabulary) ? parsedData.vocabulary : [];
      const tips: string[] = Array.isArray(parsedData.tips) ? parsedData.tips : [];

      return NextResponse.json({
        nativeText,
        userTranslation,
        naturalTranslation,
        fluencyScore,
        comparison,
        vocabulary,
        tips,
      });
    } catch (groqErr: any) {
      console.error("Groq API error in translate:", groqErr?.message || groqErr);
      const sim = getSimulatedFallback(nativeText, userTranslation, lang);
      return NextResponse.json(sim);
    }
  } catch (err: unknown) {
    console.error("Translate error:", err);
    return NextResponse.json(
      { error: "Translation request processing failed", hint: "Please check your inputs and try again." },
      { status: 500 }
    );
  }
}



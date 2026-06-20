import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { generateFlashcards } from "@/lib/flashcard-engine";
import { recordFlashcardReview } from "@/lib/progress-store";
import { saveUserSet } from "@/lib/user-sets-store";

/**
 * POST /api/flashcards
 * Actions:
 *   "generate"      — { mode, userText, coachResponse } → flashcards from coaching
 *   "review"        — { cardId, quality } → SM-2 ack (client-side)
 *   "review-stats"  — { quality, setId? } → server-side XP/achievement tracking
 *   "ai-generate"   — { topic, level, wordCount } → AI-generated vocabulary cards
 *   "bulk-import"   — { cards: [{front, back}] } OR { text: "front | back\n..." }
 *   "save-set"      — { name, level?, topic?, cards: [{front, back}] }
 */

function getGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "YOUR_GROQ_KEY_HERE") throw new Error("GROQ_API_KEY not set");
  return new Groq({ apiKey });
}

// ── Simulated AI fallback ────────────────────────────────────────────────

const SIMULATED_VOCAB = [
  { word: "accomplish", definition: "To achieve or complete something successfully", example: "She accomplished her goal of learning English.", partOfSpeech: "verb" },
  { word: "collaborate", definition: "To work together with others", example: "We need to collaborate on this project.", partOfSpeech: "verb" },
  { word: "efficient", definition: "Achieving maximum results with minimum waste", example: "This is a very efficient way to study.", partOfSpeech: "adjective" },
  { word: "significant", definition: "Large or important enough to have an effect", example: "There was a significant improvement in her English.", partOfSpeech: "adjective" },
  { word: "perspective", definition: "A particular way of viewing things", example: "Try to see it from a different perspective.", partOfSpeech: "noun" },
];

function toFlashcard(word: string, definition: string, example: string, partOfSpeech: string) {
  return {
    id: `vs-ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    front: `${word} (${partOfSpeech})`,
    back: `${definition}\n\n📝 Example: "${example}"`,
    topic: "vocabulary",
    mode: "vocabulary",
    created: Date.now(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
    lastQuality: 0,
  };
}

// ── POST handler ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const action = body.action || "generate";

    // ── Generate from coaching response ──────────────────────────────
    if (action === "generate") {
      const { mode, userText, coachResponse } = body;
      if (!userText || !coachResponse) {
        return NextResponse.json({ error: "Missing userText or coachResponse." }, { status: 400 });
      }
      const cards = generateFlashcards(mode || "grammar", userText, coachResponse);
      return NextResponse.json({ cards });
    }

    // ── Review ack (SM-2 is client-side) ─────────────────────────────
    if (action === "review") {
      return NextResponse.json({ success: true });
    }

    // ── Review stats (server-side XP/achievement tracking) ───────────
    if (action === "review-stats") {
      const { quality } = body;
      if (quality === undefined || quality < 0 || quality > 5) {
        return NextResponse.json({ error: "quality must be 0-5" }, { status: 400 });
      }
      const result = recordFlashcardReview(quality);
      return NextResponse.json(result);
    }

    // ── AI generate vocabulary cards ─────────────────────────────────
    if (action === "ai-generate") {
      const { topic, level, wordCount } = body;
      if (!topic || !level) {
        return NextResponse.json({ error: "Missing topic or level." }, { status: 400 });
      }
      const count = Math.min(Math.max(wordCount || 5, 1), 20);

      let vocabItems: Array<{ word: string; definition: string; example: string; partOfSpeech: string }>;

      try {
        const groq = getGroq();
        const result = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are a vocabulary flashcard generator for English learners.
Generate exactly ${count} vocabulary words about "${topic}" at CEFR level ${level}.
Return ONLY a JSON array, no other text. Each element: {"word": "...", "definition": "...", "example": "...", "partOfSpeech": "..."}
Make definitions clear and concise. Examples should show natural usage.`,
            },
            { role: "user", content: `Generate ${count} vocabulary flashcards about "${topic}" at ${level} level.` },
          ],
          max_tokens: 2048,
          temperature: 0.7,
          response_format: { type: "json_object" },
        });

        const content = result.choices[0]?.message?.content || "[]";
        const parsed = JSON.parse(content);
        vocabItems = Array.isArray(parsed) ? parsed : parsed.cards || parsed.words || [];
      } catch {
        // Fallback
        vocabItems = SIMULATED_VOCAB.slice(0, count);
      }

      const cards = vocabItems.map((item) =>
        toFlashcard(item.word, item.definition, item.example, item.partOfSpeech)
      );

      return NextResponse.json({ cards });
    }

    // ── Bulk import ──────────────────────────────────────────────────
    if (action === "bulk-import") {
      let items: Array<{ front: string; back: string }>;

      if (body.cards && Array.isArray(body.cards)) {
        items = body.cards.filter(
          (c: { front?: string; back?: string }) => c.front && c.back
        );
      } else if (body.text && typeof body.text === "string") {
        items = body.text
          .split("\n")
          .filter((line: string) => line.includes("|"))
          .map((line: string) => {
            const [front, ...rest] = line.split("|");
            return { front: front.trim(), back: rest.join("|").trim() };
          });
      } else {
        return NextResponse.json(
          { error: "Provide 'cards' array or 'text' string." },
          { status: 400 }
        );
      }

      if (items.length === 0) {
        return NextResponse.json({ error: "No valid cards found." }, { status: 400 });
      }

      const cards = items.map((item) => ({
        id: `uc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        front: item.front,
        back: item.back,
        topic: "custom",
        mode: "vocabulary",
        created: Date.now(),
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: Date.now(),
        lastQuality: 0,
      }));

      return NextResponse.json({ cards, count: cards.length });
    }

    // ── Save set ─────────────────────────────────────────────────────
    if (action === "save-set") {
      const { name, level, topic, cards } = body;
      if (!name || !cards || !Array.isArray(cards)) {
        return NextResponse.json({ error: "Missing name or cards." }, { status: 400 });
      }

      const saved = saveUserSet({
        name,
        level,
        topic,
        cards: cards.map((c: { front: string; back: string }) => ({
          front: c.front,
          back: c.back,
        })),
      });

      return NextResponse.json({ set: saved });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: "Flashcard operation failed.", detail: String(err) },
      { status: 500 }
    );
  }
}

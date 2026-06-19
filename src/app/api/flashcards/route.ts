import { NextRequest, NextResponse } from "next/server";
import { generateFlashcards } from "@/lib/flashcard-engine";

/**
 * POST /api/flashcards
 * Body: { action: "generate", mode, userText, coachResponse }
 * OR     { action: "review", cardId, quality }
 *
 * Flashcard storage is client-side (localStorage),
 * this API handles generation and server-side card creation.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const action = body.action || "generate";

    if (action === "generate") {
      const { mode, userText, coachResponse } = body;
      if (!userText || !coachResponse) {
        return NextResponse.json(
          { error: "Missing userText or coachResponse." },
          { status: 400 }
        );
      }

      const cards = generateFlashcards(mode || "grammar", userText, coachResponse);
      return NextResponse.json({ cards });
    }

    if (action === "review") {
      // SM-2 processing happens client-side, this just acknowledges
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Flashcard operation failed.", detail: String(err) },
      { status: 500 }
    );
  }
}

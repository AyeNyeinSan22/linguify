/**
 * Flashcard Engine — SM-2 spaced repetition + card extraction from coaching.
 * Client-side storage via localStorage.
 */

export interface Flashcard {
  id: string;
  front: string;       // the user's original sentence (or question)
  back: string;        // corrected sentence + rule + example
  topic: string;       // grammar topic
  mode: string;        // grammar | vocabulary | writing
  created: number;     // timestamp
  setId?: string;      // vocabulary set ID (for built-in set cards)

  // SM-2 fields
  interval: number;    // days until next review
  repetitions: number; // times successfully recalled
  easeFactor: number;  // starts at 2.5, min 1.3
  nextReview: number;  // timestamp
  lastQuality: number; // 0-5 rating from last review
}

// ── SM-2 Algorithm ──────────────────────────────────────────────────────

export function sm2(quality: number, card: Flashcard): Flashcard {
  // quality: 0 (complete blackout) to 5 (perfect recall)
  const updated = { ...card };

  if (quality >= 3) {
    // Correct response
    if (updated.repetitions === 0) {
      updated.interval = 1;
    } else if (updated.repetitions === 1) {
      updated.interval = 3;
    } else {
      updated.interval = Math.round(updated.interval * updated.easeFactor);
    }
    updated.repetitions++;
  } else {
    // Incorrect — reset
    updated.repetitions = 0;
    updated.interval = 1;
  }

  // Update ease factor
  updated.easeFactor = Math.max(
    1.3,
    updated.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  updated.nextReview = Date.now() + updated.interval * 86400000;
  updated.lastQuality = quality;

  return updated;
}

// ── Card generation from coaching ────────────────────────────────────────

export function generateFlashcards(
  mode: string,
  userText: string,
  coachResponse: string
): Flashcard[] {
  const cards: Flashcard[] = [];

  // Extract correction
  const corrMatch = coachResponse.match(
    /🔍\s*\*?\*?Correction\*?\*?\s*\n([\s\S]*?)(?=📖|$)/i
  );
  // Extract explanation
  const explMatch = coachResponse.match(
    /📖\s*\*?\*?Explanation\*?\*?\s*\n([\s\S]*?)(?=📝|$)/i
  );
  // Extract examples
  const exMatch = coachResponse.match(
    /📝\s*\*?\*?Examples?\*?\*?\s*\n([\s\S]*?)(?=🎯|$)/i
  );

  const correction = corrMatch ? corrMatch[1].trim() : "";
  const explanation = explMatch ? explMatch[1].trim() : "";
  const examples = exMatch ? exMatch[1].trim() : "";

  if (correction && explanation) {
    const topic = detectTopic(explanation + " " + coachResponse);
    cards.push({
      id: `fc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      front: userText,
      back: `${correction}\n\n📖 ${explanation}\n\n📝 ${examples}`,
      topic,
      mode,
      created: Date.now(),
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: Date.now(), // due immediately
      lastQuality: 0,
    });
  }

  return cards;
}

function detectTopic(text: string): string {
  const topics: Record<string, RegExp> = {
    "past-tense": /past\s+(tense|perfect)/i,
    "present-tense": /present\s+(tense|perfect|simple|continuous)/i,
    "future-tense": /future\s+(tense|perfect)/i,
    "prepositions": /preposition/i,
    "articles": /article\b|"a"\s+vs\s+"an"|"the"/i,
    "plurals": /plural|singular/i,
    "modal-verbs": /modal\s+verb|can|could|should|would|might/i,
    "conditionals": /conditional|if\s.*would/i,
    "subject-verb-agreement": /subject.verb\s+agreement|third.person/i,
    "word-order": /word\s+order|adjective\s+order/i,
    "phrasal-verbs": /phrasal\s+verb/i,
    "idioms": /idiom|collocation/i,
    "passive-voice": /passive\s+voice/i,
    "comparatives": /comparative|superlative/i,
    "spelling": /spelling/i,
    "punctuation": /punctuation/i,
  };

  for (const [topic, regex] of Object.entries(topics)) {
    if (regex.test(text)) return topic;
  }
  return "general";
}

// ── localStorage helpers (for client-side use) ───────────────────────────

export function getDueCards(allCards: Flashcard[]): Flashcard[] {
  const now = Date.now();
  return allCards
    .filter((c) => c.nextReview <= now)
    .sort((a, b) => a.nextReview - b.nextReview);
}

export function getCardStats(cards: Flashcard[]): {
  total: number;
  due: number;
  mastered: number;   // interval >= 30 days
  learning: number;   // interval < 30 days, not due
} {
  const now = Date.now();
  return {
    total: cards.length,
    due: cards.filter((c) => c.nextReview <= now).length,
    mastered: cards.filter((c) => c.interval >= 30).length,
    learning: cards.filter((c) => c.interval > 0 && c.interval < 30 && c.nextReview > now).length,
  };
}

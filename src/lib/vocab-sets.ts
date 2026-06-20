/**
 * Vocabulary Sets — CEFR-graded vocabulary data for flashcard study.
 * Static imports at build time (follows multiwoz.ts pattern).
 */

import manifest from "../../data/vocab-sets/index.json";

// Individual set imports
import a1DailyLife from "../../data/vocab-sets/a1-daily-life.json";
import a1Greetings from "../../data/vocab-sets/a1-greetings.json";
import a1Food from "../../data/vocab-sets/a1-food.json";
import a2Travel from "../../data/vocab-sets/a2-travel.json";
import a2Shopping from "../../data/vocab-sets/a2-shopping.json";
import a2Weather from "../../data/vocab-sets/a2-weather.json";
import b1Work from "../../data/vocab-sets/b1-work.json";
import b1Health from "../../data/vocab-sets/b1-health.json";
import b1Education from "../../data/vocab-sets/b1-education.json";
import b2Technology from "../../data/vocab-sets/b2-technology.json";
import b2Environment from "../../data/vocab-sets/b2-environment.json";
import b2Media from "../../data/vocab-sets/b2-media.json";
import c1Politics from "../../data/vocab-sets/c1-politics.json";
import c1Science from "../../data/vocab-sets/c1-science.json";
import c1Arts from "../../data/vocab-sets/c1-arts.json";
import c2Philosophy from "../../data/vocab-sets/c2-philosophy.json";
import c2Law from "../../data/vocab-sets/c2-law.json";
import c2Idioms from "../../data/vocab-sets/c2-idioms.json";

// ── Types ────────────────────────────────────────────────────────────

export interface VocabSetMeta {
  id: string;
  name: string;
  level: string;
  topic: string;
  description: string;
  wordCount: number;
  icon: string;
}

export interface VocabEntry {
  word: string;
  definition: string;
  example: string;
  partOfSpeech: string;
  phonetic?: string;
}

// ── Data map ─────────────────────────────────────────────────────────

const SET_DATA: Record<string, VocabEntry[]> = {
  "a1-daily-life": a1DailyLife as VocabEntry[],
  "a1-greetings": a1Greetings as VocabEntry[],
  "a1-food": a1Food as VocabEntry[],
  "a2-travel": a2Travel as VocabEntry[],
  "a2-shopping": a2Shopping as VocabEntry[],
  "a2-weather": a2Weather as VocabEntry[],
  "b1-work": b1Work as VocabEntry[],
  "b1-health": b1Health as VocabEntry[],
  "b1-education": b1Education as VocabEntry[],
  "b2-technology": b2Technology as VocabEntry[],
  "b2-environment": b2Environment as VocabEntry[],
  "b2-media": b2Media as VocabEntry[],
  "c1-politics": c1Politics as VocabEntry[],
  "c1-science": c1Science as VocabEntry[],
  "c1-arts": c1Arts as VocabEntry[],
  "c2-philosophy": c2Philosophy as VocabEntry[],
  "c2-law": c2Law as VocabEntry[],
  "c2-idioms": c2Idioms as unknown as VocabEntry[],
};

const ALL_SETS = manifest as VocabSetMeta[];

// ── Query functions ──────────────────────────────────────────────────

export function getAllSets(): VocabSetMeta[] {
  return ALL_SETS;
}

export function getSetsByLevel(level: string): VocabSetMeta[] {
  return ALL_SETS.filter((s) => s.level === level.toUpperCase());
}

export function getSetsByTopic(topic: string): VocabSetMeta[] {
  return ALL_SETS.filter((s) => s.topic === topic.toLowerCase());
}

export function getSetMeta(setId: string): VocabSetMeta | undefined {
  return ALL_SETS.find((s) => s.id === setId);
}

export function getSetCards(setId: string): VocabEntry[] {
  return SET_DATA[setId] || [];
}

export function searchSets(query: string): VocabSetMeta[] {
  const q = query.toLowerCase();
  return ALL_SETS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.topic.toLowerCase().includes(q)
  );
}

/**
 * Progress Store — tracks coaching interactions, errors, and mastery.
 * File-based JSON storage for persistence across server restarts.
 */

import fs from "fs";
import path from "path";

// ── Types ────────────────────────────────────────────────────────────────

export interface CoachingEntry {
  timestamp: number;
  mode: "grammar" | "vocabulary" | "writing";
  userText: string;
  coachResponse: string;
  // Extracted from response
  errorTypes: string[];   // e.g. ["past-tense", "prepositions"]
  corrections: string[];  // the corrected sentences
  wordsLearned: string[]; // vocabulary words discussed
}

export interface MasteryScore {
  topic: string;
  correct: number;
  total: number;
  lastSeen: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number;
}

export interface FlashcardStats {
  totalReviews: number;
  correctReviews: number;
  currentStreak: number;
  bestStreak: number;
  lastReviewDate: string | null;
}

export interface SetMastery {
  setId: string;
  totalCards: number;
  masteredCards: number;
  lastStudied: number;
}

export interface ProgressData {
  entries: CoachingEntry[];
  masteryScores: Record<string, MasteryScore>;
  totalSessions: number;
  totalMessages: number;
  streakDays: number;
  lastActiveDate: string | null;
  xp: number;
  level: number;
  achievements: Achievement[];
  flashcardStats: FlashcardStats;
  setMastery: Record<string, SetMastery>;
}

// ── In-memory fallback (works on Vercel + local) ─────────────────────────

const g = globalThis as Record<string, unknown>;
const MEMORY_KEY = "__linguify_progress";

function load(): ProgressData {
  // Try filesystem first, fall back to memory
  try {
    const dir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const raw = fs.readFileSync(path.join(dir, "progress.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    // Vercel serverless — use in-memory
    return (g[MEMORY_KEY] as ProgressData) || {
      entries: [],
      masteryScores: {},
      totalSessions: 0,
      totalMessages: 0,
      streakDays: 0,
      lastActiveDate: null,
      xp: 0,
      level: 1,
      achievements: [],
      flashcardStats: { totalReviews: 0, correctReviews: 0, currentStreak: 0, bestStreak: 0, lastReviewDate: null },
      setMastery: {},
    };
  }
}

function save(data: ProgressData): void {
  // Always save in-memory
  g[MEMORY_KEY] = data;
  // Try filesystem (works locally, silently fails on Vercel)
  try {
    const dir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "progress.json"), JSON.stringify(data, null, 2));
  } catch {}
}

// ── Parse coaching response for error types ──────────────────────────────

const ERROR_PATTERNS: Array<{ regex: RegExp; topic: string }> = [
  { regex: /past\s+(tense|perfect)/i, topic: "past-tense" },
  { regex: /present\s+(tense|perfect|simple|continuous)/i, topic: "present-tense" },
  { regex: /future\s+(tense|perfect)/i, topic: "future-tense" },
  { regex: /preposition/i, topic: "prepositions" },
  { regex: /article\b|"a"\s+vs\s+"an"|"the"/i, topic: "articles" },
  { regex: /plural|singular/i, topic: "plurals" },
  { regex: /modal\s+verb|can|could|should|would|might/i, topic: "modal-verbs" },
  { regex: /conditional|if\s.*would/i, topic: "conditionals" },
  { regex: /subject.verb\s+agreement|third.person|he\/she\/it/i, topic: "subject-verb-agreement" },
  { regex: /word\s+order|adjective\s+order|adverb\s+placement/i, topic: "word-order" },
  { regex: /phrasal\s+verb/i, topic: "phrasal-verbs" },
  { regex: /idiom|collocation/i, topic: "idioms" },
  { regex: /passive\s+voice/i, topic: "passive-voice" },
  { regex: /relative\s+clause/i, topic: "relative-clauses" },
  { regex: /comparative|superlative/i, topic: "comparatives" },
  { regex: /spelling/i, topic: "spelling" },
  { regex: /punctuation/i, topic: "punctuation" },
  { regex: /countable|uncountable/i, topic: "countability" },
  { regex: /infinitive|gerund|-ing\s+form/i, topic: "infinitives-gerunds" },
  { regex: /reported\s+speech/i, topic: "reported-speech" },
];

function extractErrorTypes(response: string): string[] {
  const topics = new Set<string>();
  for (const { regex, topic } of ERROR_PATTERNS) {
    if (regex.test(response)) topics.add(topic);
  }
  return Array.from(topics);
}

function extractCorrections(response: string): string[] {
  const corrections: string[] = [];
  // Find the Correction section
  const corrMatch = response.match(
    /🔍\s*\*?\*?Correction\*?\*?\s*\n([\s\S]*?)(?=📖|$)/i
  );
  if (corrMatch) {
    const text = corrMatch[1].trim();
    // Extract quoted sentences
    const quoted = text.match(/"([^"]+)"/g);
    if (quoted) {
      return quoted.map((q) => q.replace(/"/g, ""));
    }
    if (text && text !== "Your sentence is correct!") {
      corrections.push(text.split("\n")[0].replace(/^\*\*/, "").replace(/\*\*$/, ""));
    }
  }
  return corrections;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractWordsLearned(mode: string, userText: string, response: string): string[] {
  if (mode !== "vocabulary") return [];
  // Single-word queries
  const words = userText.trim().split(/\s+/);
  if (words.length <= 2) {
    return words.filter((w) => w.length > 2 && !/^(what|does|mean|the|how|use|is|a|an|in|on|to)$/i.test(w));
  }
  return [];
}

// ── Public API ───────────────────────────────────────────────────────────

export function recordCoaching(params: {
  mode: "grammar" | "vocabulary" | "writing";
  userText: string;
  coachResponse: string;
}): ProgressData {
  const data = load();
  const entry: CoachingEntry = {
    timestamp: Date.now(),
    mode: params.mode,
    userText: params.userText,
    coachResponse: params.coachResponse,
    errorTypes: extractErrorTypes(params.coachResponse),
    corrections: extractCorrections(params.coachResponse),
    wordsLearned: extractWordsLearned(params.mode, params.userText, params.coachResponse),
  };

  data.entries.push(entry);
  data.totalMessages++;

  // Update mastery scores
  for (const topic of entry.errorTypes) {
    if (!data.masteryScores[topic]) {
      data.masteryScores[topic] = { topic, correct: 0, total: 0, lastSeen: Date.now() };
    }
    data.masteryScores[topic].total++;
    data.masteryScores[topic].lastSeen = Date.now();
    // If no error type was found but corrections exist, increment correct
    if (entry.corrections.length > 0) {
      data.masteryScores[topic].correct++;
    }
  }

  // Streak tracking
  const today = new Date().toISOString().split("T")[0];
  if (data.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (data.lastActiveDate === yesterday) {
      data.streakDays++;
    } else if (data.lastActiveDate !== today) {
      data.streakDays = 1;
    }
    data.lastActiveDate = today;
    data.totalSessions++;
  }

  // Trim entries to last 500 for performance
  if (data.entries.length > 500) {
    data.entries = data.entries.slice(-500);
  }

  save(data);
  return data;
}

export function getProgress(): ProgressData {
  return load();
}

export function getMasteryScores(): MasteryScore[] {
  const data = load();
  return Object.values(data.masteryScores)
    .sort((a, b) => b.lastSeen - a.lastSeen);
}

export function getErrorSummary(): {
  totalErrors: number;
  topErrors: Array<{ topic: string; count: number; percentage: number }>;
} {
  const data = load();
  const errorCounts: Record<string, number> = {};
  let totalErrors = 0;

  for (const entry of data.entries) {
    for (const topic of entry.errorTypes) {
      errorCounts[topic] = (errorCounts[topic] || 0) + 1;
      totalErrors++;
    }
  }

  const topErrors = Object.entries(errorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([topic, count]) => ({
      topic,
      count,
      percentage: totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0,
    }));

  return { totalErrors, topErrors };
}

export function getVocabularyList(): string[] {
  const data = load();
  const words = new Set<string>();
  for (const entry of data.entries) {
    for (const word of entry.wordsLearned) {
      words.add(word.toLowerCase());
    }
  }
  return Array.from(words).sort();
}

export function getWritingStats(): {
  totalSubmissions: number;
  avgWordCount: number;
  wordCounts: number[];
} {
  const data = load();
  const writingEntries = data.entries.filter((e) => e.mode === "writing");
  const wordCounts = writingEntries.map((e) => e.userText.split(/\s+/).length);
  const avgWordCount =
    wordCounts.length > 0
      ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
      : 0;

  return {
    totalSubmissions: writingEntries.length,
    avgWordCount,
    wordCounts: wordCounts.slice(-30), // last 30 for trend
  };
}

// ── Gamification ─────────────────────────────────────────────────────────

import { XP_PER_REVIEW, STREAK_BONUS_THRESHOLD, STREAK_BONUS_XP, LEVEL_THRESHOLDS, ACHIEVEMENT_DEFS } from "./constants";

function ensureDefaults(data: ProgressData): void {
  if (data.xp === undefined) data.xp = 0;
  if (data.level === undefined) data.level = 1;
  if (!data.achievements) data.achievements = [];
  if (!data.flashcardStats) {
    data.flashcardStats = { totalReviews: 0, correctReviews: 0, currentStreak: 0, bestStreak: 0, lastReviewDate: null };
  }
  if (!data.setMastery) data.setMastery = {};
}

export function addXP(amount: number): { xp: number; level: number; levelUp: boolean } {
  const data = load();
  ensureDefaults(data);
  const oldLevel = data.level;
  data.xp += amount;
  // Calculate level from XP
  let newLevel = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (data.xp >= LEVEL_THRESHOLDS[i]) {
      newLevel = i + 1;
      break;
    }
  }
  data.level = newLevel;
  save(data);
  return { xp: data.xp, level: data.level, levelUp: newLevel > oldLevel };
}

export function recordFlashcardReview(quality: number): {
  stats: FlashcardStats;
  xpGained: number;
  level: number;
  levelUp: boolean;
  newAchievements: Achievement[];
} {
  const data = load();
  ensureDefaults(data);

  // Update stats
  data.flashcardStats.totalReviews++;
  if (quality >= 3) {
    data.flashcardStats.correctReviews++;
    data.flashcardStats.currentStreak++;
    if (data.flashcardStats.currentStreak > data.flashcardStats.bestStreak) {
      data.flashcardStats.bestStreak = data.flashcardStats.currentStreak;
    }
  } else {
    data.flashcardStats.currentStreak = 0;
  }
  data.flashcardStats.lastReviewDate = new Date().toISOString().split("T")[0];

  // Calculate XP
  let xpGained = quality >= 4 ? XP_PER_REVIEW.easy : quality >= 3 ? XP_PER_REVIEW.correct : quality >= 1 ? XP_PER_REVIEW.hard : XP_PER_REVIEW.forgot;
  if (data.flashcardStats.currentStreak >= STREAK_BONUS_THRESHOLD && quality >= 3) {
    xpGained += STREAK_BONUS_XP;
  }

  const oldLevel = data.level;
  data.xp += xpGained;
  // Calculate level
  let newLevel = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (data.xp >= LEVEL_THRESHOLDS[i]) {
      newLevel = i + 1;
      break;
    }
  }
  data.level = newLevel;
  const levelUp = newLevel > oldLevel;

  // Check achievements
  const newAchievements = checkAchievementsInternal(data);

  save(data);
  return { stats: { ...data.flashcardStats }, xpGained, level: data.level, levelUp, newAchievements };
}

function checkAchievementsInternal(data: ProgressData): Achievement[] {
  const existing = new Set(data.achievements.map((a) => a.id));
  const newlyUnlocked: Achievement[] = [];

  for (const def of ACHIEVEMENT_DEFS) {
    if (existing.has(def.id)) continue;
    if (def.check({
      flashcardStats: data.flashcardStats,
      setMastery: data.setMastery,
      xp: data.xp,
      level: data.level,
    })) {
      const achievement: Achievement = {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        unlockedAt: Date.now(),
      };
      data.achievements.push(achievement);
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

export function checkAchievements(): Achievement[] {
  const data = load();
  ensureDefaults(data);
  const newAchievements = checkAchievementsInternal(data);
  if (newAchievements.length > 0) save(data);
  return newAchievements;
}

export function updateSetMastery(setId: string, totalCards: number, masteredCards: number): void {
  const data = load();
  ensureDefaults(data);
  data.setMastery[setId] = {
    setId,
    totalCards,
    masteredCards,
    lastStudied: Date.now(),
  };
  save(data);
}

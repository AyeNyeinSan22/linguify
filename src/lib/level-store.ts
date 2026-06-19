/**
 * Level Store — CEFR level assessment and tracking per coaching mode.
 */

import fs from "fs";
import path from "path";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type CoachMode = "grammar" | "vocabulary" | "writing";

export interface LevelData {
  grammar: CEFRLevel;
  vocabulary: CEFRLevel;
  writing: CEFRLevel;
  assessedAt: number;
  messageCount: number; // messages since last assessment
}

const g = globalThis as Record<string, unknown>;
const MEMORY_KEY = "__linguify_levels";

const DEFAULT_LEVELS: LevelData = {
  grammar: "B1",
  vocabulary: "B1",
  writing: "B1",
  assessedAt: 0,
  messageCount: 0,
};

function loadFromDisk(): LevelData | null {
  try {
    const dir = path.join(process.cwd(), "data");
    const raw = fs.readFileSync(path.join(dir, "levels.json"), "utf8");
    return { ...DEFAULT_LEVELS, ...JSON.parse(raw) };
  } catch { return null; }
}

function saveToDisk(data: LevelData) {
  try {
    const dir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "levels.json"), JSON.stringify(data, null, 2));
  } catch {}
}

export function getLevels(): LevelData {
  const disk = loadFromDisk();
  if (disk) return disk;
  return ((g[MEMORY_KEY] as LevelData) || { ...DEFAULT_LEVELS });
}

export function setLevel(mode: CoachMode, level: CEFRLevel): LevelData {
  const data = getLevels();
  data[mode] = level;
  data.assessedAt = Date.now();
  data.messageCount = 0;
  g[MEMORY_KEY] = data;
  saveToDisk(data);
  return data;
}

export function incrementMessageCount(): LevelData {
  const data = getLevels();
  data.messageCount++;
  g[MEMORY_KEY] = data;
  saveToDisk(data);
  return data;
}

export function getLevelLabel(level: CEFRLevel): string {
  const labels: Record<CEFRLevel, string> = {
    A1: "Beginner",
    A2: "Elementary",
    B1: "Intermediate",
    B2: "Upper Intermediate",
    C1: "Advanced",
    C2: "Proficient",
  };
  return labels[level];
}

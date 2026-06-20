/**
 * User Sets Store — Server-side persistence for user-created flashcard sets.
 * Follows the progress-store.ts pattern (fs + globalThis fallback).
 */

import fs from "fs";
import path from "path";

export interface UserSet {
  id: string;
  name: string;
  level?: string;
  topic?: string;
  cards: Array<{ front: string; back: string }>;
  createdAt: number;
  updatedAt: number;
}

export interface UserSetsData {
  sets: UserSet[];
}

const DATA_FILE = path.join(process.cwd(), "data", "user-sets.json");

const DEFAULT_DATA: UserSetsData = { sets: [] };

const g = globalThis as typeof globalThis & {
  __linguify_user_sets?: UserSetsData;
};

export function load(): UserSetsData {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw) as UserSetsData;
    g.__linguify_user_sets = data;
    return data;
  } catch {
    if (g.__linguify_user_sets) return g.__linguify_user_sets;
    g.__linguify_user_sets = DEFAULT_DATA;
    return DEFAULT_DATA;
  }
}

function save(data: UserSetsData): void {
  g.__linguify_user_sets = data;
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch {
    // Vercel serverless — fs not writable, globalThis fallback is enough
  }
}

export function getUserSets(): UserSet[] {
  return load().sets;
}

export function getUserSet(id: string): UserSet | undefined {
  return load().sets.find((s) => s.id === id);
}

export function saveUserSet(set: Omit<UserSet, "id" | "createdAt" | "updatedAt"> & { id?: string }): UserSet {
  const data = load();
  const now = Date.now();

  if (set.id) {
    // Update existing
    const idx = data.sets.findIndex((s) => s.id === set.id);
    if (idx !== -1) {
      data.sets[idx] = { ...data.sets[idx], ...set, updatedAt: now };
      save(data);
      return data.sets[idx];
    }
  }

  // Create new
  const newSet: UserSet = {
    ...set,
    id: `us-${now}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };
  data.sets.push(newSet);
  save(data);
  return newSet;
}

export function deleteUserSet(id: string): boolean {
  const data = load();
  const idx = data.sets.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  data.sets.splice(idx, 1);
  save(data);
  return true;
}

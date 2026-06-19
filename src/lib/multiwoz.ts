/**
 * MultiWOZ 2.2 Data Utility
 *
 * Uses a pre-built compact index (multiwoz-index.json) for fast lookups
 * across 8,437 training dialogues in 7 domains. Lazy-loads full dialogue
 * JSON files only when a specific scenario is requested.
 */

import fs from "fs";
import path from "path";

// ── Types ────────────────────────────────────────────────────────────────

export interface MultiWOZSlot {
  name: string;
  description: string;
  possible_values: string[];
  is_categorical: boolean;
}

export interface MultiWOZService {
  service_name: string;
  slots: MultiWOZSlot[];
}

export interface MultiWOZTurn {
  speaker: "USER" | "SYSTEM";
  utterance: string;
}

interface IndexEntry {
  d: Record<string, Array<[string, number, number]>>; // domain -> [[file, idx, turns], ...]
  o: Record<string, string[]>; // domain -> [opening_utterances]
  f: Record<string, string[]>; // domain -> [system_fallback_responses]
}

export interface DomainInfo {
  name: string;
  label: string;
  icon: string;
  description: string;
  dialogues: number;
  openings: number;
}

export interface ScenarioPrompt {
  domain: string;
  type: "roleplay" | "drill";
  prompt: string;
  context: string;
  dialogueId: string;
  numTurns: number;
}

// ── Paths ────────────────────────────────────────────────────────────────

function getDatasetRoot(): string {
  const cacheRoot =
    process.env.KAGGLEHUB_CACHE ||
    path.join(process.env.HOME || "~", ".cache", "kagglehub");
  return path.join(
    cacheRoot,
    "datasets",
    "taejinwoo",
    "multiwoz-22",
    "versions",
    "1",
    "MultiWOZ_2.2"
  );
}

// Resolve index path relative to this file (works in both CJS and ESM)
const LIB_DIR = path.resolve(process.cwd(), "src", "lib");
const INDEX_PATH = path.join(LIB_DIR, "multiwoz-index.json");
const SCHEMA_PATH = path.join(getDatasetRoot(), "schema.json");

// ── Domain metadata ──────────────────────────────────────────────────────

const DOMAIN_META: Record<
  string,
  { label: string; icon: string; description: string }
> = {
  restaurant: {
    label: "Restaurant",
    icon: "🍽️",
    description:
      "Order food, book tables, find restaurants by cuisine, price, and location.",
  },
  hotel: {
    label: "Hotel",
    icon: "🏨",
    description:
      "Book rooms, check amenities (parking, wifi, stars), manage stay details.",
  },
  train: {
    label: "Train",
    icon: "🚂",
    description:
      "Book train tickets, check schedules, find routes between cities.",
  },
  attraction: {
    label: "Attractions",
    icon: "🎭",
    description:
      "Find museums, parks, and tourist spots. Get opening hours and tickets.",
  },
  taxi: {
    label: "Taxi",
    icon: "🚕",
    description:
      "Book taxis, specify pickup times and destinations, negotiate fares.",
  },
  hospital: {
    label: "Hospital",
    icon: "🏥",
    description:
      "Find hospitals, check departments, get addresses and contact info.",
  },
  bus: {
    label: "Bus",
    icon: "🚌",
    description:
      "Find bus routes, check schedules, book group travel in Cambridge.",
  },
};

// ── Caches (survive HMR via globalThis) ──────────────────────────────────

const g = globalThis as unknown as Record<string, unknown>;

function cacheGet<T>(key: string): T | null {
  return (g[key] as T) ?? null;
}

function cacheSet<T>(key: string, value: T): void {
  g[key] = value;
}

// ── Index ────────────────────────────────────────────────────────────────

function loadIndex(): IndexEntry {
  const cached = cacheGet<IndexEntry>("__mwz_index");
  if (cached) return cached;

  if (!fs.existsSync(INDEX_PATH)) {
    throw new Error(
      `MultiWOZ index not found at ${INDEX_PATH}. Run the preprocessing script first.`
    );
  }

  const raw = fs.readFileSync(INDEX_PATH, "utf8");
  const index: IndexEntry = JSON.parse(raw);
  cacheSet("__mwz_index", index);
  return index;
}

// ── Schema ───────────────────────────────────────────────────────────────

function loadSchema(): MultiWOZService[] {
  const cached = cacheGet<MultiWOZService[]>("__mwz_schema");
  if (cached) return cached;

  if (!fs.existsSync(SCHEMA_PATH)) {
    console.warn("[multiwoz] Schema not found at", SCHEMA_PATH);
    return [];
  }

  const raw = fs.readFileSync(SCHEMA_PATH, "utf8");
  const schema: MultiWOZService[] = JSON.parse(raw);
  cacheSet("__mwz_schema", schema);
  return schema;
}

// ── Dialogue file cache ──────────────────────────────────────────────────

const _fileDialogueCache = new Map<string, MultiWOZTurn[][]>();

function loadDialoguesFile(fileName: string): MultiWOZTurn[][] {
  const cached = _fileDialogueCache.get(fileName);
  if (cached) return cached;

  const filePath = path.join(getDatasetRoot(), "train", fileName);
  if (!fs.existsSync(filePath)) {
    console.warn("[multiwoz] Dialogue file not found:", filePath);
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const dialogues: Array<{ turns: MultiWOZTurn[] }> = JSON.parse(raw);
  const turns = dialogues.map((d) => d.turns);
  _fileDialogueCache.set(fileName, turns);
  return turns;
}

// ── Public API ───────────────────────────────────────────────────────────

const ORDERED_DOMAINS = [
  "restaurant",
  "hotel",
  "train",
  "attraction",
  "taxi",
  "hospital",
];

export function getDomains(): DomainInfo[] {
  const index = loadIndex();
  return ORDERED_DOMAINS.filter((d) => index.d[d]).map((name) => {
    const meta = DOMAIN_META[name] || {
      label: name,
      icon: "💬",
      description: `Practice conversations in the ${name} domain.`,
    };
    return {
      name,
      label: meta.label,
      icon: meta.icon,
      description: meta.description,
      dialogues: index.d[name].length,
      openings: (index.o[name] || []).length,
    };
  });
}

/**
 * Get a random opening prompt for a domain (first USER turn from a real dialogue).
 */
export function getScenarioOpening(domain: string): string | null {
  const index = loadIndex();
  const openings = index.o[domain];
  if (!openings || openings.length === 0) return null;
  return openings[Math.floor(Math.random() * openings.length)];
}

/**
 * Get a full multi-turn dialogue as a role-play scenario.
 */
export function getRoleplayScenario(domain: string): ScenarioPrompt | null {
  const index = loadIndex();
  const entries = index.d[domain];
  if (!entries || entries.length === 0) return null;

  // Pick a dialogue with at least 4 turns
  const eligible = entries.filter((e) => e[2] >= 4);
  if (eligible.length === 0) return null;

  const entry = eligible[Math.floor(Math.random() * eligible.length)];
  const [fileName, dialogueIdx, numTurns] = entry;

  // Load the full dialogue
  const allTurns = loadDialoguesFile(fileName);
  const turns = allTurns[dialogueIdx] || [];
  const firstUser = turns.find((t) => t.speaker === "USER");

  if (!firstUser) return null;

  const svcs = domain.replace(/_/g, " & ");
  const context = `You are in Cambridge, UK. This is a real-world ${svcs} conversation from the MultiWOZ dataset. Respond naturally as if you were talking to a service agent. The original conversation has ${numTurns} turns.`;

  return {
    domain,
    type: "roleplay",
    prompt: firstUser.utterance,
    context,
    dialogueId: `${fileName}#${dialogueIdx}`,
    numTurns,
  };
}

/**
 * Get a drill exercise — a random USER turn to respond to.
 */
export function getDrillExercise(domain: string): ScenarioPrompt | null {
  const index = loadIndex();
  const entries = index.d[domain];
  if (!entries || entries.length === 0) return null;

  const entry = entries[Math.floor(Math.random() * entries.length)];
  const [fileName, dialogueIdx, numTurns] = entry;

  const allTurns = loadDialoguesFile(fileName);
  const turns = allTurns[dialogueIdx] || [];
  const userTurns = turns.filter((t) => t.speaker === "USER");
  if (userTurns.length === 0) return null;

  const turn = userTurns[Math.floor(Math.random() * userTurns.length)];

  const context = `Quick drill: this is a ${domain} scenario. Read the prompt and respond correctly in English.`;

  return {
    domain,
    type: "drill",
    prompt: turn.utterance,
    context,
    dialogueId: `${fileName}#${dialogueIdx}`,
    numTurns,
  };
}

/**
 * Get fallback SYSTEM responses for a domain (used when Claude API is unavailable).
 */
export function getSystemFallbackPool(domain: string): string[] {
  const index = loadIndex();
  return index.f[domain] || [];
}

/**
 * Get the full dialogue turns for a scenario identified by dialogueId.
 */
export function getDialogueTurns(dialogueId: string): MultiWOZTurn[] {
  const [fileName, idxStr] = dialogueId.split("#");
  const dialogueIdx = parseInt(idxStr, 10);
  const allTurns = loadDialoguesFile(fileName);
  return allTurns[dialogueIdx] || [];
}

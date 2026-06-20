/**
 * MultiWOZ 2.2 Data Utility
 *
 * Uses pre-built bundled data (multiwoz-index.json + multiwoz-dialogues.json)
 * for fast lookups across 8,437 training dialogues in 7 domains.
 * No filesystem reads — all data is imported at build time.
 */

// ── Types ────────────────────────────────────────────────────────────────

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

// ── Bundled data (imported at build time, no fs reads) ───────────────────

import indexData from "./multiwoz-index.json";
import dialogueData from "./multiwoz-dialogues.json";

const index = indexData as unknown as IndexEntry;
// dialogueData maps fileName -> Array<Array<[number, string]>>  (0=USER, 1=SYSTEM)
const dialogues = dialogueData as unknown as Record<string, Array<Array<[number, string]>>>;

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

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Convert compact [speaker, utterance] pairs to MultiWOZTurn objects.
 */
function toTurns(pairs: Array<[number, string]>): MultiWOZTurn[] {
  return pairs.map(([s, u]) => ({
    speaker: s === 0 ? "USER" : "SYSTEM",
    utterance: u,
  }));
}

/**
 * Get the full dialogue turns for a file + index.
 */
function getTurnsFromFile(fileName: string, dialogueIdx: number): MultiWOZTurn[] {
  const fileDialogues = dialogues[fileName];
  if (!fileDialogues || !fileDialogues[dialogueIdx]) return [];
  return toTurns(fileDialogues[dialogueIdx]);
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
  const openings = index.o[domain];
  if (!openings || openings.length === 0) return null;
  return openings[Math.floor(Math.random() * openings.length)];
}

/**
 * Get a full multi-turn dialogue as a role-play scenario.
 */
export function getRoleplayScenario(domain: string): ScenarioPrompt | null {
  const entries = index.d[domain];
  if (!entries || entries.length === 0) return null;

  // Pick a dialogue with at least 4 turns
  const eligible = entries.filter((e) => e[2] >= 4);
  if (eligible.length === 0) return null;

  const entry = eligible[Math.floor(Math.random() * eligible.length)];
  const [fileName, dialogueIdx, numTurns] = entry;

  const turns = getTurnsFromFile(fileName, dialogueIdx);
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
  const entries = index.d[domain];
  if (!entries || entries.length === 0) return null;

  const entry = entries[Math.floor(Math.random() * entries.length)];
  const [fileName, dialogueIdx, numTurns] = entry;

  const turns = getTurnsFromFile(fileName, dialogueIdx);
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
 * Get fallback SYSTEM responses for a domain (used when LLM API is unavailable).
 */
export function getSystemFallbackPool(domain: string): string[] {
  return index.f[domain] || [];
}

/**
 * Get the full dialogue turns for a scenario identified by dialogueId.
 */
export function getDialogueTurns(dialogueId: string): MultiWOZTurn[] {
  const [fileName, idxStr] = dialogueId.split("#");
  const dialogueIdx = parseInt(idxStr, 10);
  return getTurnsFromFile(fileName, dialogueIdx);
}

import { randomUUID } from "crypto";

// ── Types ──────────────────────────────────────────────────────────────

export type PracticeMode = "roleplay" | "drill" | "conversation" | "interview" | "travelling" | "food" | "friends" | "multiwoz";
export type CoachMode = "grammar" | "vocabulary" | "writing" | "voice";
export type SessionMode = PracticeMode | CoachMode;

export interface Session {
  id: string;
  mode: SessionMode;
  messages: { role: "user" | "assistant"; content: string }[];
  createdAt: number;
  lastAccessedAt: number;
  messageCount: number;
}

// ── Store ──────────────────────────────────────────────────────────────

const store = new Map<string, Session>();

// Expire sessions after 1 hour of inactivity
const SESSION_TTL_MS = 60 * 60 * 1000;

// Clean up expired sessions every 10 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [id, session] of store) {
      if (now - session.lastAccessedAt > SESSION_TTL_MS) {
        store.delete(id);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the Node.js process to exit even if this timer is still active
  if (cleanupTimer && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

// ── Public API ─────────────────────────────────────────────────────────

export function createSession(mode: SessionMode): Session {
  ensureCleanup();

  const session: Session = {
    id: randomUUID(),
    mode,
    messages: [],
    createdAt: Date.now(),
    lastAccessedAt: Date.now(),
    messageCount: 0,
  };

  store.set(session.id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  const session = store.get(id);
  if (!session) return undefined;

  // Check expiry
  if (Date.now() - session.lastAccessedAt > SESSION_TTL_MS) {
    store.delete(id);
    return undefined;
  }

  // Touch
  session.lastAccessedAt = Date.now();
  return session;
}

export function addMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
): Session | undefined {
  const session = getSession(sessionId);
  if (!session) return undefined;

  session.messages.push({ role, content });
  session.messageCount++;
  session.lastAccessedAt = Date.now();

  return session;
}

export function deleteSession(id: string): boolean {
  return store.delete(id);
}

export function getSessionCount(): number {
  return store.size;
}

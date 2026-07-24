/**
 * Recent sessions tracking — saves last practiced domain to localStorage
 * so the Continue Learning section on the home page can display it.
 */

const STORAGE_KEY = "linguify-recent-sessions";

interface RecentSession {
  domain: string;
  lastPracticed: string;
  progress: number;
}

export function saveRecentSession(domain: string, progress: number = 0) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const sessions: RecentSession[] = raw ? JSON.parse(raw) : [];

    // Remove existing entry for this domain (if any)
    const filtered = sessions.filter((s) => s.domain !== domain);

    // Add new entry at the front
    const now = new Date();
    const timeStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    filtered.unshift({
      domain,
      lastPracticed: timeStr,
      progress,
    });

    // Keep max 5 entries
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 5)));
  } catch { /* ignore */ }
}

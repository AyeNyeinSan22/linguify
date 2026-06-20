"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DOMAIN_COLORS, DEFAULT_DOMAIN_STYLE, DOMAIN_META } from "@/lib/constants";

interface RecentSession {
  domain: string;
  lastPracticed: string;
  progress: number; // 0-100
}

const STORAGE_KEY = "linguify-recent-sessions";

function loadRecent(): RecentSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export default function ContinueLearning() {
  const [sessions, setSessions] = useState<RecentSession[]>([]);

  useEffect(() => {
    setSessions(loadRecent());
  }, []);

  if (sessions.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-text-primary">Continue Learning</h2>
          <p className="text-xs text-text-secondary mt-0.5">Pick up where you left off</p>
        </div>
        <Link href="/dashboard" className="text-xs font-medium text-accent-500 hover:text-accent-600 transition-colors">
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {sessions.slice(0, 3).map((s) => {
          const style = DOMAIN_COLORS[s.domain] || DEFAULT_DOMAIN_STYLE;
          const meta = DOMAIN_META[s.domain] || { label: s.domain, icon: "💬" };
          return (
            <Link
              key={s.domain}
              href={`/scenario/${s.domain}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${style.bg} text-xl`}>
                {meta.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{meta.label}</p>
                <p className="text-xs text-text-secondary">{s.lastPracticed}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Mini progress ring */}
                <div className="relative w-10 h-10">
                  <svg className="progress-ring w-10 h-10" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-card)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.5" fill="none"
                      stroke="var(--accent-500)" strokeWidth="3"
                      strokeDasharray={`${s.progress} ${100 - s.progress}`}
                      strokeLinecap="round"
                      className="progress-ring__circle"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-text-primary">
                    {s.progress}%
                  </span>
                </div>
                <span className="text-accent-500 text-sm">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

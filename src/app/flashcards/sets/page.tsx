"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MasteryIndicator from "@/components/flashcards/MasteryIndicator";

interface VocabSetMeta {
  id: string;
  name: string;
  level: string;
  topic: string;
  description: string;
  wordCount: number;
  icon: string;
}

const LEVEL_FILTERS = ["All", "A1", "A2", "B1", "B2", "C1", "C2"];

export default function SetsPage() {
  const [sets, setSets] = useState<VocabSetMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [setMastery, setSetMastery] = useState<Record<string, { totalCards: number; masteredCards: number }>>({});

  useEffect(() => {
    fetch("/api/vocab-sets")
      .then((r) => r.json())
      .then((d) => { setSets(d.sets || []); setLoading(false); })
      .catch(() => setLoading(false));

    // Load mastery from progress
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => setSetMastery(d.setMastery || {}))
      .catch(() => {});
  }, []);

  const filtered = filter === "All" ? sets : sets.filter((s) => s.level === filter);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">📖 Vocabulary Sets</h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          Curated CEFR vocabulary — pick a set and start learning
        </p>
      </div>

      {/* Level filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {LEVEL_FILTERS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === lvl
                ? "pill-active"
                : "pill hover:bg-[var(--glass-hover)]"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Sets grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-400 animate-bounce" />
            <span className="h-2 w-2 rounded-full bg-accent-500 animate-bounce" />
            <span className="h-2 w-2 rounded-full bg-accent-600 animate-bounce" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((set) => {
            const mastery = setMastery[set.id];
            const pct = mastery && mastery.totalCards > 0
              ? Math.round((mastery.masteredCards / mastery.totalCards) * 100)
              : 0;

            return (
              <Link
                key={set.id}
                href={`/flashcards/sets/${set.id}`}
                className="glass rounded-2xl p-5 hover:bg-[var(--glass-hover)] transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-2xl">{set.icon}</span>
                    <span className={`ml-2 pill text-[10px]`}>{set.level}</span>
                  </div>
                  {mastery && <MasteryIndicator percentage={pct} size={40} />}
                </div>
                <h3 className="font-semibold text-[var(--text)] group-hover:text-accent-500 transition-colors">
                  {set.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                  {set.description}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  {set.wordCount} words
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link href="/flashcards" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          ← Back to Flashcards
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { sm2, getDueCards, getCardStats, type Flashcard } from "@/lib/flashcard-engine";
import FlashcardViewer from "@/components/flashcards/FlashcardViewer";
import FlashcardStatsBar from "@/components/flashcards/FlashcardStatsBar";
import XPNotification from "@/components/flashcards/XPNotification";
import AchievementPopup from "@/components/flashcards/AchievementPopup";

const STORAGE_KEY = "linguify-flashcards";

function loadCards(): Flashcard[] {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
}

function saveCards(c: Flashcard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [idx, setIdx] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpGain, setXpGain] = useState(0);
  const [showXp, setShowXp] = useState(false);
  const [achievement, setAchievement] = useState<{ name: string; description: string; icon: string } | null>(null);

  useEffect(() => {
    setCards(loadCards());
    // Load XP/level from server
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => { setXp(d.xp || 0); setLevel(d.level || 1); })
      .catch(() => {});
  }, []);

  const due = getDueCards(cards);
  const stats = getCardStats(cards);
  const card = due[idx];

  const handleRate = useCallback(async (quality: number) => {
    if (!card) return;

    // SM-2 update locally
    const updated = sm2(quality, card);
    const newCards = cards.map((c) => (c.id === updated.id ? updated : c));
    setCards(newCards);
    saveCards(newCards);

    // Server-side XP/achievement tracking
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "review-stats", quality }),
      });
      const data = await res.json();
      if (data.xpGained > 0) {
        setXpGain(data.xpGained);
        setShowXp(true);
        setXp(data.stats?.totalReviews ? (prev => prev + data.xpGained) : data.xpGained);
      }
      if (data.level) setLevel(data.level);
      if (data.newAchievements?.length > 0) {
        setAchievement(data.newAchievements[0]);
      }
    } catch {}

    // Move to next card
    if (idx < due.length - 1) {
      setIdx(idx + 1);
    } else {
      setIdx(0);
      setReviewing(false);
    }
  }, [card, cards, idx, due.length]);

  const handleSkip = useCallback(() => {
    if (idx < due.length - 1) {
      setIdx(idx + 1);
    } else {
      setIdx(0);
    }
  }, [idx, due.length]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
      <XPNotification amount={xpGain} show={showXp} onDone={() => setShowXp(false)} />
      <AchievementPopup achievement={achievement} onDismiss={() => setAchievement(null)} />

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">🃏 Flashcards</h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">Spaced repetition review</p>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <FlashcardStatsBar stats={stats} xp={xp} level={level} />
      </div>

      {/* Quick Start or Review */}
      {reviewing && card ? (
        <div className="space-y-6">
          <div className="text-center text-xs text-[var(--text-muted)]">
            {idx + 1} of {due.length} due
          </div>
          <FlashcardViewer card={card} onRate={handleRate} onSkip={handleSkip} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Start */}
          {due.length > 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📚</div>
              <h2 className="text-lg font-semibold text-[var(--text)] mb-2">
                {due.length} card{due.length !== 1 ? "s" : ""} due
              </h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Review now to keep your streak going!
              </p>
              <button
                onClick={() => { setReviewing(true); setIdx(0); }}
                className="btn-gradient px-8 py-3 rounded-xl text-sm font-medium"
              >
                Quick Start — {due.length} cards
              </button>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-lg font-semibold text-[var(--text)] mb-2">
                No cards to review!
              </h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                {stats.total === 0
                  ? "Start coaching or explore vocabulary sets."
                  : "All caught up!"}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/flashcards/sets"
              className="glass rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--glass-hover)] transition-colors"
            >
              📖 Vocabulary Sets
            </Link>
            <Link
              href="/flashcards/my-cards"
              className="glass rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--glass-hover)] transition-colors"
            >
              🗂️ My Cards
            </Link>
            {stats.total === 0 && (
              <Link
                href="/skill"
                className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-medium"
              >
                Start Coaching
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

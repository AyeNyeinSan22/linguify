"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { sm2, getDueCards, getCardStats, type Flashcard } from "@/lib/flashcard-engine";
import FlashcardViewer from "@/components/flashcards/FlashcardViewer";
import XPNotification from "@/components/flashcards/XPNotification";
import AchievementPopup from "@/components/flashcards/AchievementPopup";
import AnimatedRing from "@/components/flashcards/AnimatedRing";
import XPBar from "@/components/flashcards/XPBar";
import QuickStartModal from "@/components/flashcards/QuickStartModal";

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
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCards(loadCards());
    setMounted(true);
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
    const updated = sm2(quality, card);
    const newCards = cards.map((c) => (c.id === updated.id ? updated : c));
    setCards(newCards);
    saveCards(newCards);

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
        setXp((prev) => prev + data.xpGained);
      }
      if (data.level) setLevel(data.level);
      if (data.newAchievements?.length > 0) {
        setAchievement(data.newAchievements[0]);
      }
    } catch {}

    if (idx < due.length - 1) {
      setIdx(idx + 1);
    } else {
      setIdx(0);
      setReviewing(false);
    }
  }, [card, cards, idx, due.length]);

  const handleSkip = useCallback(() => {
    if (idx < due.length - 1) setIdx(idx + 1);
    else setIdx(0);
  }, [idx, due.length]);

  const handleQuickStart = useCallback((_topic: string) => {
    setReviewing(true);
    setIdx(0);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg-root)]">
      <XPNotification amount={xpGain} show={showXp} onDone={() => setShowXp(false)} />
      <AchievementPopup achievement={achievement} onDismiss={() => setAchievement(null)} />
      <QuickStartModal open={showQuickStart} onClose={() => setShowQuickStart(false)} onStart={handleQuickStart} />

      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 sm:py-12">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl">🃏</span>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Flashcards</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            Master vocabulary with spaced repetition
          </p>
        </div>

        {/* ── XP Bar (always visible) ─────────────────────────────── */}
        <div className="mb-6">
          <XPBar xp={xp} level={level} />
        </div>

        {/* ── Review Mode ─────────────────────────────────────────── */}
        {reviewing && card ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setReviewing(false)}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                ← Back
              </button>
              <span className="text-xs text-[var(--text-muted)]">
                {idx + 1} of {due.length} due
              </span>
            </div>
            <FlashcardViewer card={card} onRate={handleRate} onSkip={handleSkip} />
          </div>
        ) : (
          <>
            {/* ── Stats Rings ───────────────────────────────────────── */}
            <div className="glass rounded-2xl p-6 mb-6">
              <div className="flex justify-around">
                <AnimatedRing
                  value={stats.due}
                  max={Math.max(stats.total, 1)}
                  color="#f97316"
                  label="Due"
                  icon="📋"
                  size={72}
                />
                <AnimatedRing
                  value={stats.learning}
                  max={Math.max(stats.total, 1)}
                  color="#3b82f6"
                  label="Learning"
                  icon="📖"
                  size={72}
                />
                <AnimatedRing
                  value={stats.mastered}
                  max={Math.max(stats.total, 1)}
                  color="#10b981"
                  label="Mastered"
                  icon="✅"
                  size={72}
                />
                <AnimatedRing
                  value={stats.total}
                  max={Math.max(stats.total, 1)}
                  color="var(--accent-500)"
                  label="Total"
                  icon="📚"
                  size={72}
                />
              </div>
            </div>

            {/* ── Due Cards CTA ─────────────────────────────────────── */}
            {due.length > 0 ? (
              <div className="glass-heavy rounded-2xl p-6 mb-6 text-center border border-[var(--accent-500)]/20">
                <div className="text-4xl mb-3">⚡</div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                  {due.length} card{due.length !== 1 ? "s" : ""} waiting
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-5">
                  Keep your streak alive — review now!
                </p>
                <button
                  onClick={() => setShowQuickStart(true)}
                  className="btn-gradient px-8 py-3 rounded-xl text-sm font-semibold"
                >
                  ⚡ Quick Start
                </button>
              </div>
            ) : (
              /* ── Empty State ───────────────────────────────────────── */
              <div className="glass-heavy rounded-2xl p-8 mb-6 text-center">
                {/* Illustration */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: "radial-gradient(circle, rgba(30,136,229,0.08), rgba(139,92,246,0.06), transparent)" }} />
                  <div className="absolute inset-4 rounded-full" style={{ background: "radial-gradient(circle, rgba(30,136,229,0.12), rgba(139,92,246,0.1), transparent)" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {stats.total === 0 ? (
                      <span className="text-5xl">🌱</span>
                    ) : (
                      <span className="text-5xl">🎉</span>
                    )}
                  </div>
                </div>

                {stats.total === 0 ? (
                  <>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                      Your flashcard journey starts here
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
                      Build your vocabulary with AI-powered flashcards. Every mistake from coaching becomes a card to review.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                      All caught up! 🎉
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
                      No cards due right now. Explore new vocabulary sets or start a coaching session to generate more cards.
                    </p>
                  </>
                )}

                {/* Action Buttons — reordered: Coaching → Sets → My Cards */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/skill"
                    className="btn-gradient inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold"
                  >
                    <span>📝</span> Start Coaching
                  </Link>
                  <Link
                    href="/flashcards/sets"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent-400)]/40 hover:bg-[var(--accent-500)]/5 transition-all"
                  >
                    <span>📖</span> Explore Sets
                  </Link>
                  <Link
                    href="/flashcards/my-cards"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent-400)]/40 hover:bg-[var(--accent-500)]/5 transition-all"
                  >
                    <span>🗂️</span> My Cards
                  </Link>
                </div>
              </div>
            )}

            {/* ── Bottom Nav (when there are cards but not reviewing) ── */}
            {stats.total > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/skill"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent-400)]/40 hover:bg-[var(--accent-500)]/5 transition-all"
                >
                  <span>📝</span> Start Coaching
                </Link>
                <Link
                  href="/flashcards/sets"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent-400)]/40 hover:bg-[var(--accent-500)]/5 transition-all"
                >
                  <span>📖</span> Explore Sets
                </Link>
                <Link
                  href="/flashcards/my-cards"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent-400)]/40 hover:bg-[var(--accent-500)]/5 transition-all"
                >
                  <span>🗂️</span> My Cards
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

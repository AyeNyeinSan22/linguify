"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { sm2, getDueCards, getCardStats, type Flashcard } from "@/lib/flashcard-engine";
import FlashcardViewer from "@/components/flashcards/FlashcardViewer";
import FlashcardStatsBar from "@/components/flashcards/FlashcardStatsBar";
import MasteryIndicator from "@/components/flashcards/MasteryIndicator";

interface VocabEntry {
  word: string;
  definition: string;
  example: string;
  partOfSpeech: string;
  phonetic?: string;
}

interface VocabSetMeta {
  id: string;
  name: string;
  level: string;
  topic: string;
  description: string;
  wordCount: number;
  icon: string;
}

const FC_STORAGE_KEY = "linguify-flashcards";

export default function SetDetailPage() {
  const params = useParams();
  const setId = params.setId as string;

  const [meta, setMeta] = useState<VocabSetMeta | null>(null);
  const [vocabCards, setVocabCards] = useState<VocabEntry[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load set data
  useEffect(() => {
    fetch(`/api/vocab-sets?setId=${setId}`)
      .then((r) => r.json())
      .then((d) => {
        setMeta(d.meta);
        setVocabCards(d.cards || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Load user's flashcards for this set
    try {
      const stored = localStorage.getItem(FC_STORAGE_KEY);
      if (stored) {
        const all: Flashcard[] = JSON.parse(stored);
        setFlashcards(all.filter((c) => c.setId === setId));
      }
    } catch {}
  }, [setId]);

  // Merge vocab cards with flashcard state
  const due = getDueCards(flashcards);
  const stats = getCardStats(flashcards);
  const card = due[idx];

  const handleRate = useCallback(async (quality: number) => {
    if (!card) return;
    const updated = sm2(quality, card);

    // Update in localStorage
    try {
      const stored = localStorage.getItem(FC_STORAGE_KEY);
      if (stored) {
        const all: Flashcard[] = JSON.parse(stored);
        const newAll = all.map((c) => (c.id === updated.id ? updated : c));
        localStorage.setItem(FC_STORAGE_KEY, JSON.stringify(newAll));
      }
    } catch {}

    const newFlashcards = flashcards.map((c) => (c.id === updated.id ? updated : c));
    setFlashcards(newFlashcards);

    // Server-side tracking
    try {
      await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "review-stats", quality }),
      });
    } catch {}

    if (idx < due.length - 1) {
      setIdx(idx + 1);
    } else {
      setIdx(0);
      setReviewing(false);
    }
  }, [card, flashcards, idx, due.length]);

  const handleSkip = useCallback(() => {
    if (idx < due.length - 1) {
      setIdx(idx + 1);
    } else {
      setIdx(0);
    }
  }, [idx, due.length]);

  // Add vocab cards to flashcards
  const addAllToFlashcards = () => {
    try {
      const stored = localStorage.getItem(FC_STORAGE_KEY);
      const existing: Flashcard[] = stored ? JSON.parse(stored) : [];
      const existingIds = new Set(existing.map((c) => c.id));

      const newCards: Flashcard[] = vocabCards
        .map((v) => ({
          id: `vs-${setId}-${v.word.toLowerCase().replace(/\s+/g, "-")}`,
          front: `${v.word}${v.phonetic ? ` ${v.phonetic}` : ""} (${v.partOfSpeech})`,
          back: `${v.definition}\n\n📝 Example: "${v.example}"`,
          topic: meta?.topic || "vocabulary",
          mode: "vocabulary",
          created: Date.now(),
          setId,
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          nextReview: Date.now(),
          lastQuality: 0,
        }))
        .filter((c) => !existingIds.has(c.id));

      const merged = [...existing, ...newCards];
      localStorage.setItem(FC_STORAGE_KEY, JSON.stringify(merged));
      setFlashcards(merged.filter((c) => c.setId === setId));
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent-400 animate-bounce" />
          <span className="h-2 w-2 rounded-full bg-accent-500 animate-bounce" />
          <span className="h-2 w-2 rounded-full bg-accent-600 animate-bounce" />
        </div>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <p className="text-[var(--text-muted)]">Set not found.</p>
        <Link href="/flashcards/sets" className="text-sm text-accent-500 mt-2 inline-block">← Back to sets</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="text-4xl">{meta.icon}</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-2">{meta.name}</h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">{meta.description}</p>
        <div className="flex justify-center gap-3 mt-3">
          <span className="pill">{meta.level}</span>
          <span className="pill">{vocabCards.length} words</span>
          {flashcards.length > 0 && (
            <span className="pill">{flashcards.length} in deck</span>
          )}
        </div>
      </div>

      {/* Stats */}
      {flashcards.length > 0 && (
        <div className="mb-6">
          <FlashcardStatsBar stats={stats} />
        </div>
      )}

      {/* Review mode */}
      {reviewing && card ? (
        <div className="space-y-6">
          <div className="text-center text-xs text-[var(--text-muted)]">
            {idx + 1} of {due.length} due
          </div>
          <FlashcardViewer card={card} onRate={handleRate} onSkip={handleSkip} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            {flashcards.length === 0 ? (
              <button
                onClick={addAllToFlashcards}
                className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-medium"
              >
                📥 Add All to My Cards
              </button>
            ) : due.length > 0 ? (
              <button
                onClick={() => { setReviewing(true); setIdx(0); }}
                className="btn-gradient px-6 py-2.5 rounded-xl text-sm font-medium"
              >
                🃏 Study — {due.length} due
              </button>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm text-[var(--text-muted)]">All caught up!</p>
              </div>
            )}
          </div>

          {/* Mastery ring */}
          {flashcards.length > 0 && (
            <div className="flex justify-center">
              <div className="glass rounded-2xl p-6 text-center">
                <MasteryIndicator
                  percentage={stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0}
                  size={80}
                />
                <p className="text-xs text-[var(--text-muted)] mt-2">Set Mastery</p>
              </div>
            </div>
          )}

          {/* Word list */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Words in this set</h2>
            <div className="space-y-3">
              {vocabCards.map((v) => (
                <div key={v.word} className="flex items-start gap-3 py-2 border-b border-[var(--border)] last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text)]">
                      {v.word}
                      {v.phonetic && <span className="text-xs text-[var(--text-muted)] ml-2">{v.phonetic}</span>}
                      <span className="text-xs text-accent-500 ml-2">({v.partOfSpeech})</span>
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">{v.definition}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 italic">&ldquo;{v.example}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Back */}
      <div className="mt-8 text-center">
        <Link href="/flashcards/sets" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          ← Back to Sets
        </Link>
      </div>
    </div>
  );
}

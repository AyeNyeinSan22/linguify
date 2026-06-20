"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { type Flashcard } from "@/lib/flashcard-engine";
import CardEditor from "@/components/flashcards/CardEditor";

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

export default function MyCardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [editing, setEditing] = useState<Flashcard | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [filter, setFilter] = useState<"all" | "coaching" | "manual" | "ai" | "set">("all");

  useEffect(() => {
    setCards(loadCards());
  }, []);

  // Group cards by source
  const getSource = (card: Flashcard) => {
    if (card.setId) return "set";
    if (card.id.startsWith("uc-")) return "manual";
    if (card.id.startsWith("vs-")) return "ai";
    return "coaching";
  };

  const filtered = filter === "all"
    ? cards
    : cards.filter((c) => getSource(c) === filter);

  const groups = {
    coaching: cards.filter((c) => getSource(c) === "coaching"),
    manual: cards.filter((c) => getSource(c) === "manual"),
    ai: cards.filter((c) => getSource(c) === "ai"),
    set: cards.filter((c) => getSource(c) === "set"),
  };

  // Add card
  const handleAdd = useCallback((card: { front: string; back: string }) => {
    const newCard: Flashcard = {
      id: `uc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      front: card.front,
      back: card.back,
      topic: "custom",
      mode: "vocabulary",
      created: Date.now(),
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: Date.now(),
      lastQuality: 0,
    };
    const updated = [...cards, newCard];
    setCards(updated);
    saveCards(updated);
    setShowAdd(false);
  }, [cards]);

  // Edit card
  const handleEdit = useCallback((card: { front: string; back: string }) => {
    if (!editing) return;
    const updated = cards.map((c) =>
      c.id === editing.id ? { ...c, front: card.front, back: card.back } : c
    );
    setCards(updated);
    saveCards(updated);
    setEditing(null);
  }, [cards, editing]);

  // Delete card
  const handleDelete = useCallback((id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    saveCards(updated);
  }, [cards]);

  // Bulk import
  const handleBulkImport = useCallback(async () => {
    if (!bulkText.trim()) return;
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk-import", text: bulkText }),
      });
      const data = await res.json();
      if (data.cards?.length > 0) {
        const updated = [...cards, ...data.cards];
        setCards(updated);
        saveCards(updated);
        setBulkText("");
        setShowBulkImport(false);
      }
    } catch {}
  }, [bulkText, cards]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">🗂️ My Cards</h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          Your flashcard collection — {cards.length} total
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <button
          onClick={() => { setShowAdd(true); setEditing(null); }}
          className="btn-gradient px-4 py-2 rounded-xl text-sm font-medium"
        >
          + Add Card
        </button>
        <button
          onClick={() => { setShowBulkImport(!showBulkImport); setShowAdd(false); }}
          className="glass rounded-xl px-4 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--glass-hover)] transition-colors"
        >
          📋 Bulk Import
        </button>
      </div>

      {/* Source filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { key: "all" as const, label: `All (${cards.length})` },
          { key: "coaching" as const, label: `Coaching (${groups.coaching.length})` },
          { key: "manual" as const, label: `Manual (${groups.manual.length})` },
          { key: "ai" as const, label: `AI (${groups.ai.length})` },
          { key: "set" as const, label: `Sets (${groups.set.length})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key ? "pill-active" : "pill hover:bg-[var(--glass-hover)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Add card form */}
      {showAdd && (
        <div className="mb-6">
          <CardEditor onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      {/* Edit card form */}
      {editing && (
        <div className="mb-6">
          <CardEditor card={editing} onSave={handleEdit} onCancel={() => setEditing(null)} />
        </div>
      )}

      {/* Bulk import */}
      {showBulkImport && (
        <div className="glass rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text)]">Bulk Import</h3>
          <p className="text-xs text-[var(--text-muted)]">
            One card per line: <code>front | back</code>
          </p>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="glass-input w-full rounded-xl px-4 py-3 text-sm text-[var(--text)] resize-none font-mono"
            rows={6}
            placeholder={"hello | A common greeting\ngoodbye | A farewell expression"}
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { setShowBulkImport(false); setBulkText(""); }}
              className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkImport}
              className="btn-gradient px-6 py-2 rounded-xl text-sm font-medium"
            >
              Import
            </button>
          </div>
        </div>
      )}

      {/* Cards list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2">No cards yet</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Add cards manually or start coaching to generate them.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((card) => (
            <div
              key={card.id}
              className="glass rounded-xl p-4 flex items-start justify-between gap-4 group"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[var(--text)] truncate">
                  {card.front}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 whitespace-pre-wrap">
                  {card.back}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] pill">{card.topic}</span>
                  {card.setId && <span className="text-[10px] pill">set: {card.setId}</span>}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditing(card); setShowAdd(false); setShowBulkImport(false); }}
                  className="p-1.5 rounded-lg hover:bg-[var(--glass-hover)] text-[var(--text-muted)] text-xs"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] text-xs"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Back */}
      <div className="mt-8 text-center">
        <Link href="/flashcards" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          ← Back to Flashcards
        </Link>
      </div>
    </div>
  );
}

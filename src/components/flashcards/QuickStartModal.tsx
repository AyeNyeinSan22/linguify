"use client";

import { useState } from "react";

interface QuickStartModalProps {
  open: boolean;
  onClose: () => void;
  onStart: (topic: string) => void;
}

const TOPICS = [
  { id: "all", icon: "📚", label: "All Due Cards", desc: "Review everything that's due" },
  { id: "grammar", icon: "📝", label: "Grammar", desc: "Tenses, articles, prepositions" },
  { id: "vocabulary", icon: "📖", label: "Vocabulary", desc: "New words and phrases" },
  { id: "writing", icon: "✍️", label: "Writing", desc: "Sentence structure and style" },
  { id: "custom", icon: "🎯", label: "Custom Set", desc: "Pick a vocabulary set to study" },
];

export default function QuickStartModal({ open, onClose, onStart }: QuickStartModalProps) {
  const [selected, setSelected] = useState("all");

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Quick Start</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-panel)] transition-colors"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-[var(--text-muted)] mb-4">
          Choose what to review:
        </p>

        <div className="space-y-2 mb-6">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelected(topic.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                selected === topic.id
                  ? "border-[var(--accent-500)] bg-[var(--accent-500)]/5 dark:bg-[var(--accent-500)]/10 shadow-sm"
                  : "border-[var(--border-card)] hover:border-[var(--accent-400)]/30 dark:hover:border-[var(--accent-400)]/20"
              }`}
            >
              <span className="text-xl">{topic.icon}</span>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{topic.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{topic.desc}</p>
              </div>
              {selected === topic.id && (
                <span className="ml-auto text-[var(--accent-500)]">✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] border border-[var(--border-card)] hover:bg-[var(--bg-panel)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onStart(selected); onClose(); }}
            className="flex-1 btn-gradient px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            Start Review →
          </button>
        </div>
      </div>
    </div>
  );
}

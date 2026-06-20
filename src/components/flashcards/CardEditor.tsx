"use client";

import { useState } from "react";

interface CardEditorProps {
  card?: { front: string; back: string };
  onSave: (card: { front: string; back: string }) => void;
  onCancel: () => void;
}

export default function CardEditor({ card, onSave, onCancel }: CardEditorProps) {
  const [front, setFront] = useState(card?.front || "");
  const [back, setBack] = useState(card?.back || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    onSave({ front: front.trim(), back: back.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-[var(--text)]">
        {card ? "Edit Card" : "New Card"}
      </h3>

      <div>
        <label className="block text-sm text-[var(--text-muted)] mb-1">
          Front (word or question)
        </label>
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          className="glass-input w-full rounded-xl px-4 py-3 text-sm text-[var(--text)] resize-none"
          rows={2}
          placeholder="e.g. accomplish (verb)"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--text-muted)] mb-1">
          Back (definition or answer)
        </label>
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          className="glass-input w-full rounded-xl px-4 py-3 text-sm text-[var(--text)] resize-none"
          rows={3}
          placeholder="e.g. To achieve or complete something successfully"
          required
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-gradient px-6 py-2 rounded-xl text-sm font-medium"
        >
          {card ? "Save Changes" : "Add Card"}
        </button>
      </div>
    </form>
  );
}

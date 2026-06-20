"use client";

import { useState } from "react";
import type { Flashcard } from "@/lib/flashcard-engine";

interface FlashcardViewerProps {
  card: Flashcard;
  onRate: (quality: number) => void;
  onSkip: () => void;
}

const RATINGS = [
  { quality: 0, label: "Forgot", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: "✕" },
  { quality: 2, label: "Hard", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: "◔" },
  { quality: 4, label: "Good", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: "✓" },
  { quality: 5, label: "Easy", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: "★" },
];

export default function FlashcardViewer({ card, onRate, onSkip }: FlashcardViewerProps) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => setFlipped(!flipped);
  const handleRate = (quality: number) => {
    setFlipped(false);
    onRate(quality);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card */}
      <div
        onClick={handleFlip}
        className="relative w-full max-w-lg min-h-[240px] cursor-pointer perspective-1000"
      >
        <div
          className={`glass-heavy rounded-2xl p-8 transition-transform duration-500 preserve-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
          style={{
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="text-sm text-[var(--text-muted)] mb-2">
              {card.topic !== "general" && (
                <span className="pill mr-2">{card.topic}</span>
              )}
            </span>
            <p className="text-xl font-medium text-center text-[var(--text)]">
              {card.front}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-4">
              Tap to reveal
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-base text-[var(--text)] whitespace-pre-wrap text-center leading-relaxed">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      {/* Rating buttons — only show when flipped */}
      {flipped && (
        <div className="flex gap-3 flex-wrap justify-center">
          {RATINGS.map((r) => (
            <button
              key={r.quality}
              onClick={() => handleRate(r.quality)}
              className={`px-4 py-2 rounded-xl border font-medium text-sm transition-all hover:scale-105 ${r.color}`}
            >
              <span className="mr-1">{r.icon}</span> {r.label}
            </button>
          ))}
        </div>
      )}

      {/* Skip */}
      <button
        onClick={onSkip}
        className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
      >
        Skip →
      </button>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";

interface FeedbackSection {
  id: string;
  icon: string;
  label: string;
  color: string;        // border + icon bg
  colorText: string;    // text color
  bg: string;           // card bg
  content: string;
}

interface FeedbackCardsProps {
  content: string;
  onComplete?: (section: string) => void;
}

function parseSections(raw: string): FeedbackSection[] {
  const sections: FeedbackSection[] = [];

  // Correction — 🔍 or ✏️
  const corrMatch = raw.match(/(?:🔍|✏️)\s*\*?\*?(?:Correction)\*?\*?\s*\n([\s\S]*?)(?=📖|ℹ️|📝|🎯|$)/i);
  if (corrMatch?.[1]?.trim()) {
    sections.push({
      id: "correction",
      icon: "✏️",
      label: "Correction",
      color: "border-emerald-400/40",
      colorText: "text-emerald-600",
      bg: "bg-emerald-500/5",
      content: corrMatch[1].trim(),
    });
  }

  // Explanation — 📖 or ℹ️
  const explMatch = raw.match(/(?:📖|ℹ️)\s*\*?\*?(?:Explanation)\*?\*?\s*\n([\s\S]*?)(?=📝|Examples|🎯|$)/i);
  if (explMatch?.[1]?.trim()) {
    sections.push({
      id: "explanation",
      icon: "ℹ️",
      label: "Explanation",
      color: "border-sky-400/40",
      colorText: "text-sky-600",
      bg: "bg-sky-500/5",
      content: explMatch[1].trim(),
    });
  }

  // Examples — 📝
  const exMatch = raw.match(/📝\s*\*?\*?(?:Examples?)\*?\*?\s*\n([\s\S]*?)(?=🎯|Next|$)/i);
  if (exMatch?.[1]?.trim()) {
    sections.push({
      id: "examples",
      icon: "📖",
      label: "Examples",
      color: "border-amber-400/40",
      colorText: "text-amber-600",
      bg: "bg-amber-500/5",
      content: exMatch[1].trim(),
    });
  }

  // Next Step — 🎯
  const nextMatch = raw.match(/🎯\s*\*?\*?(?:Next\s*Step)\*?\*?\s*\n([\s\S]*?)$/i);
  if (nextMatch?.[1]?.trim()) {
    sections.push({
      id: "next-step",
      icon: "🎯",
      label: "Next Step",
      color: "border-violet-400/40",
      colorText: "text-violet-600",
      bg: "bg-violet-500/5",
      content: nextMatch[1].trim(),
    });
  }

  return sections;
}

function hasStructuredMarkers(raw: string): boolean {
  return /🔍|✏️|📖|ℹ️|📝|🎯/.test(raw) && /Correction|Explanation|Examples?|Next\s*Step/i.test(raw);
}

export { hasStructuredMarkers };

export default function FeedbackCards({ content, onComplete }: FeedbackCardsProps) {
  const sections = useMemo(() => parseSections(content), [content]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const handleComplete = (sectionId: string) => {
    if (completed.has(sectionId)) return;
    const next = new Set(completed);
    next.add(sectionId);
    setCompleted(next);
    onComplete?.(sectionId);
  };

  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      {sections.map((section, idx) => (
        <div
          key={section.id}
          className={`feedback-card feedback-card-${idx + 1} rounded-2xl border ${section.color} ${section.bg} p-4 transition-all`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{section.icon}</span>
                <span className={`text-xs font-semibold uppercase tracking-wide ${section.colorText}`}>
                  {section.label}
                </span>
              </div>
              <div
                className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  section.id === "correction" ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                }`}
              >
                {section.content}
              </div>
            </div>
            <button
              onClick={() => handleComplete(section.id)}
              disabled={completed.has(section.id)}
              className={`feedback-section-btn feedback-check shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                completed.has(section.id)
                  ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-card)] hover:border-emerald-500/30 hover:text-emerald-500"
              }`}
            >
              {completed.has(section.id) ? "✓ Done" : "✓ Got it"}
            </button>
          </div>
        </div>
      ))}

      {/* Completion summary */}
      {completed.size === sections.length && (
        <div className="feedback-card text-center py-3">
          <span className="text-sm font-medium text-emerald-500">
            🎉 All sections reviewed — great work!
          </span>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";

interface FeedbackSection {
  id: string;
  icon: string;
  label: string;
  color: string;
  colorText: string;
  bg: string;
  content: string;
}

interface FeedbackCardsProps {
  content: string;
  onComplete?: (section: string) => void;
}

// Section definitions with all possible marker/icon combos
const SECTION_DEFS: Array<{
  id: string;
  icon: string;
  label: string;
  color: string;
  colorText: string;
  bg: string;
  markers: RegExp;
}> = [
  {
    id: "correction",
    icon: "✏️",
    label: "Correction",
    color: "border-emerald-400/40",
    colorText: "text-emerald-600",
    bg: "bg-emerald-500/5",
    markers: /🔍|✏️/,
  },
  {
    id: "explanation",
    icon: "ℹ️",
    label: "Explanation",
    color: "border-sky-400/40",
    colorText: "text-sky-600",
    bg: "bg-sky-500/5",
    markers: /📖|ℹ️/,
  },
  {
    id: "examples",
    icon: "📖",
    label: "Examples",
    color: "border-amber-400/40",
    colorText: "text-amber-600",
    bg: "bg-amber-500/5",
    markers: /📝/,
  },
  {
    id: "next-step",
    icon: "🎯",
    label: "Next Step",
    color: "border-violet-400/40",
    colorText: "text-violet-600",
    bg: "bg-violet-500/5",
    markers: /🎯/,
  },
];

function parseSections(raw: string): FeedbackSection[] {
  // Find positions of each section marker
  const found: Array<{ def: (typeof SECTION_DEFS)[number]; pos: number }> = [];

  for (const def of SECTION_DEFS) {
    // Find the FIRST occurrence of this marker
    const match = raw.match(def.markers);
    if (match?.index !== undefined) {
      found.push({ def, pos: match.index });
    }
  }

  // Sort by position in the text
  found.sort((a, b) => a.pos - b.pos);

  // Extract content between markers
  const sections: FeedbackSection[] = [];
  for (let i = 0; i < found.length; i++) {
    const start = found[i].pos;
    const end = i + 1 < found.length ? found[i + 1].pos : raw.length;
    const chunk = raw.slice(start, end);

    // Strip the marker icon and any header text (e.g., "🔍 **Correction**\n")
    // Match: emoji + optional bold/asterisk text + optional colon + optional newline
    const headerMatch = chunk.match(
      /^.{1,4}\s*\*?\*?(?:Correction|Explanation|Examples?|Next\s*Step)\*?\*?\s*:?\s*\n?/i
    );
    const body = headerMatch ? chunk.slice(headerMatch[0].length) : chunk.slice(found[i].def.markers.source.length + 2);

    const trimmed = body.trim();
    if (trimmed) {
      sections.push({
        ...found[i].def,
        content: trimmed,
      });
    }
  }

  return sections;
}

// Detect if a response has structured feedback markers
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

  // Fallback: if parsing found nothing, show raw text in a single card
  if (sections.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-panel)] dark:bg-[var(--bg-card)] p-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-primary)]">
          {content}
        </p>
      </div>
    );
  }

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
                  section.id === "correction"
                    ? "font-semibold text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)]"
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

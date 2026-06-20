"use client";

import { useState, useEffect } from "react";

interface ScenarioInstructionsProps {
  domainLabel: string;
  domainIcon: string;
  context: string;
  prompt: string;
  numTurns?: number;
  lessonFocus?: string;
  tips?: string[];
}

const DEFAULT_TIPS: Record<string, string[]> = {
  restaurant: [
    '"I\'d like to book a table for two, please."',
    '"Could I see the menu, please?"',
    '"What do you recommend?"',
    '"Could we have the bill, please?"',
  ],
  hotel: [
    '"I have a reservation under the name…"',
    '"Is breakfast included?"',
    '"Could I have a room with a view?"',
    '"What time is checkout?"',
  ],
  train: [
    '"I\'d like a single ticket to…, please."',
    '"What platform does the train leave from?"',
    '"Is there a return discount?"',
    '"Does this train have Wi-Fi?"',
  ],
  attraction: [
    '"How much is the entrance fee?"',
    '"Are there any guided tours?"',
    '"What are the opening hours?"',
    '"Is there a student discount?"',
  ],
  taxi: [
    '"Could you take me to this address?"',
    '"How long will it take?"',
    '"Do you accept card payments?"',
    '"Keep the change, please."',
  ],
  hospital: [
    '"I\'d like to make an appointment."',
    '"I\'ve been feeling unwell since…"',
    '"Could you describe the symptoms?"',
    '"Is there anything I should avoid?"',
  ],
};

export default function ScenarioInstructions({
  domainLabel,
  domainIcon,
  context,
  prompt,
  numTurns,
  lessonFocus,
  tips,
}: ScenarioInstructionsProps) {
  const [showTips, setShowTips] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const domainKey = domainLabel.toLowerCase().replace(/\s+/g, "-");
  const tipPhrases = tips || DEFAULT_TIPS[domainKey] || DEFAULT_TIPS.restaurant;

  return (
    <div className="flex flex-col gap-4">
      {/* Card 1: Scenario Context */}
      <div
        className={`rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-500)]/10 flex items-center justify-center shrink-0">
            <span className="text-xl">{domainIcon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-600)] mb-1.5">
              Scenario
            </h3>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
              {domainLabel}
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {context}
            </p>
            {numTurns && (
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-panel)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                  💬 {numTurns} turns
                </span>
                {lessonFocus && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-500)]/10 px-2.5 py-0.5 text-[10px] font-medium text-[var(--accent-600)]">
                    📌 {lessonFocus}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Task Instruction */}
      <div
        className={`rounded-2xl border-2 border-[var(--accent-500)]/20 bg-[var(--accent-500)]/5 p-5 transition-all duration-500 delay-200 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-500)]/15 flex items-center justify-center shrink-0">
            <span className="text-xl">💬</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-600)] mb-1.5">
              Your Task
            </h3>
            <p className="text-base font-bold text-[var(--text-primary)] leading-relaxed">
              {prompt}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Type your response below to start the conversation
            </p>
          </div>
        </div>
      </div>

      {/* Card 3: Tips (expandable) */}
      <div
        className={`rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] overflow-hidden transition-all duration-500 delay-400 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--bg-panel)]/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-0.5">
                Helpful Phrases
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                Example expressions for this scenario
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-[var(--text-muted)] transition-transform duration-300 ${
              showTips ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          className={`transition-all duration-300 ease-in-out ${
            showTips ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="px-5 pb-5 pt-0">
            <div className="space-y-2">
              {tipPhrases.map((phrase, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 px-4 py-2.5"
                >
                  <span className="text-amber-500 text-xs mt-0.5">→</span>
                  <p className="text-sm text-[var(--text-secondary)] italic">{phrase}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

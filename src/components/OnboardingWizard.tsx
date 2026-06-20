"use client";

import { useState } from "react";
import { LEVELS, type LevelKey } from "@/lib/constants";

interface OnboardingWizardProps {
  onComplete: (level: LevelKey, domain: string) => void;
  onSkip: () => void;
}

const SCENARIOS = [
  { key: "restaurant", label: "Restaurant", icon: "🍽️", desc: "Order food, book tables" },
  { key: "hotel", label: "Hotel", icon: "🏨", desc: "Book rooms, check amenities" },
  { key: "train", label: "Train", icon: "🚂", desc: "Buy tickets, find routes" },
  { key: "attraction", label: "Attractions", icon: "🎭", desc: "Find museums, get directions" },
  { key: "taxi", label: "Taxi", icon: "🚕", desc: "Book rides, negotiate fares" },
  { key: "hospital", label: "Hospital", icon: "🏥", desc: "Describe symptoms, get help" },
];

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<LevelKey | null>(null);
  const [domain, setDomain] = useState<string | null>(null);

  const handleLevelSelect = (key: LevelKey) => {
    setLevel(key);
    setStep(1);
  };

  const handleDomainSelect = (key: string) => {
    setDomain(key);
    setStep(2);
  };

  const handleStart = () => {
    if (level && domain) {
      localStorage.setItem("linguify-onboarded", "true");
      localStorage.setItem("linguify-level", level);
      onComplete(level, domain);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onSkip()}>
      <div className="modal-content p-6 sm:p-8">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= step ? "bg-accent-500" : "bg-gray-200 dark:bg-gray-700"}`} />
          ))}
        </div>

        {/* Step 0: Welcome + Level */}
        {step === 0 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🌍</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to Linguify</h2>
            <p className="text-sm text-text-secondary mb-6">Let&apos;s personalize your learning experience. What&apos;s your English level?</p>
            <div className="space-y-3">
              {LEVELS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => handleLevelSelect(l.key)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:border-accent-500 hover:bg-accent-500/5 transition-all text-left"
                >
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-500/10 text-accent-600 font-bold text-sm">
                    {l.cefr}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{l.label}</p>
                    <p className="text-xs text-text-secondary">{l.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={onSkip} className="mt-4 text-xs text-text-muted hover:text-text-secondary transition-colors">
              Skip for now
            </button>
          </div>
        )}

        {/* Step 1: Scenario Selection */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Pick your first scenario</h2>
            <p className="text-sm text-text-secondary mb-6">Where would you like to practice English?</p>
            <div className="grid grid-cols-2 gap-3">
              {SCENARIOS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleDomainSelect(s.key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    domain === s.key
                      ? "border-accent-500 bg-accent-500/5 ring-2 ring-accent-500/20"
                      : "border-[var(--border-card)] bg-[var(--bg-card)] hover:border-accent-500/30"
                  }`}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-sm font-semibold text-text-primary">{s.label}</span>
                  <span className="text-[11px] text-text-secondary">{s.desc}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(0)} className="flex-1 py-2.5 rounded-xl border border-[var(--border-card)] text-sm font-medium text-text-secondary hover:bg-[var(--bg-panel)] transition-colors">
                Back
              </button>
              <button onClick={onSkip} className="text-xs text-text-muted hover:text-text-secondary transition-colors self-center">
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Ready */}
        {step === 2 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">You&apos;re all set!</h2>
            <p className="text-sm text-text-secondary mb-6">
              Starting with <strong>{SCENARIOS.find((s) => s.key === domain)?.label}</strong> at <strong>{LEVELS.find((l) => l.key === level)?.label}</strong> level.
            </p>
            <button onClick={handleStart} className="btn-gradient w-full py-3 text-base">
              Start Your First Conversation →
            </button>
            <button onClick={() => setStep(1)} className="mt-3 text-xs text-text-muted hover:text-text-secondary transition-colors">
              Change scenario
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

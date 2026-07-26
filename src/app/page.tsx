"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GreetingBanner from "@/components/GreetingBanner";
import QuickStats from "@/components/QuickStats";
import FilterBar from "@/components/FilterBar";
import CourseCard from "@/components/CourseCard";
import DailyChallenge from "@/components/DailyChallenge";
import ContinueLearning from "@/components/ContinueLearning";
import OnboardingWizard from "@/components/OnboardingWizard";
import { DOMAIN_COLORS, DEFAULT_DOMAIN_STYLE, type LevelKey } from "@/lib/constants";

interface DomainData { name: string; label: string; icon: string; description: string; dialogues: number; openings: number; rating: number; level?: string; }

const FILTERS = ["All Scenarios", "Popular", "Newest", "A1-A2", "B1-B2", "C1-C2"];

const DOMAIN_LEVELS: Record<string, string> = {
  restaurant: "A2",
  hotel: "B1",
  train: "A2",
  attraction: "A2",
  taxi: "A2",
  hospital: "B1",
};

export default function Home() {
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [activeFilter, setActiveFilter] = useState("All Scenarios");
  const [streak, setStreak] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [vocabCount, setVocabCount] = useState(0);
  const [level, setLevel] = useState("B1");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load local storage data after mount
    const savedLevel = localStorage.getItem("linguify-level");
    if (savedLevel) {
      const labels: Record<string, string> = { beginner: "A1-A2", intermediate: "B1-B2", advanced: "C1-C2" };
      setLevel(labels[savedLevel] || "B1");
    }

    const onboarded = localStorage.getItem("linguify-onboarded");
    if (!onboarded) {
      setShowOnboarding(true);
    }

    fetch("/api/scenarios").then(r => r.json()).then(d => { if (d.domains) setDomains(d.domains); }).catch(() => {});
    fetch("/api/progress").then(r => r.json()).then(d => {
      if (d.streakDays) setStreak(d.streakDays);
      if (d.totalMessages) setMessageCount(d.totalMessages);
      if (d.vocabulary) setVocabCount(d.vocabulary.length);
    }).catch(() => {});
  }, []);

  const handleOnboardingComplete = (_level: LevelKey, domain: string) => {
    setShowOnboarding(false);
    window.location.href = `/scenario/${domain}`;
  };

  const filtered = activeFilter === "All Scenarios" ? domains
    : activeFilter === "Popular" ? [...domains].sort((a,b) => b.rating - a.rating)
    : activeFilter === "Newest" ? [...domains].reverse()
    : activeFilter === "A1-A2" ? domains.filter(d => (DOMAIN_LEVELS[d.name] || "B1") === "A1" || (DOMAIN_LEVELS[d.name] || "B1") === "A2")
    : activeFilter === "B1-B2" ? domains.filter(d => (DOMAIN_LEVELS[d.name] || "B1") === "B1" || (DOMAIN_LEVELS[d.name] || "B1") === "B2")
    : activeFilter === "C1-C2" ? domains.filter(d => (DOMAIN_LEVELS[d.name] || "B1") === "C1" || (DOMAIN_LEVELS[d.name] || "B1") === "C2")
    : domains;

  const recommendedDomain = domains.length > 0
    ? domains.reduce((best, d) => (d.rating || 0) > (best.rating || 0) ? d : best, domains[0]).name
    : null;

  const hasActivity = streak > 0 || messageCount > 0;

  if (!mounted) return null;

  return (
    <div className="flex flex-col flex-1">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="gradient-blob gradient-blob-1" />
        <div className="gradient-blob gradient-blob-2" />
      </div>
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col gap-8 sm:gap-10">

        <GreetingBanner userName="Learner" streak={streak} level={level} />

        <DailyChallenge />

        <ContinueLearning />

        {hasActivity ? (
          <QuickStats stats={[
            { icon: "🔥", value: String(streak), label: "Day Streak", accent: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", highlight: streak > 0 },
            { icon: "📚", value: String(vocabCount), label: "Words Learned", accent: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
            { icon: "⏱️", value: String(messageCount), label: "Messages", accent: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
            { icon: "🎯", value: level, label: "Level", accent: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
          ]} />
        ) : (
          <div className="space-y-4">
            <section className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🗺️</span>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Your Learning Path</h3>
                  <p className="text-xs text-text-secondary">Recommended for {level} level — about 15 min</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/skill" className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-panel)] hover:bg-accent-500/5 hover:border-accent-500/30 border border-transparent transition-all group">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent-500/10 text-accent-600 text-sm font-bold shrink-0">1</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary group-hover:gradient-text">Grammar Coach</p>
                    <p className="text-xs text-text-secondary mt-0.5">Write a sentence and get AI feedback on mistakes</p>
                  </div>
                </Link>
                <Link href="/agent" className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-panel)] hover:bg-accent-500/5 hover:border-accent-500/30 border border-transparent transition-all group">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent-500/10 text-accent-600 text-sm font-bold shrink-0">2</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary group-hover:gradient-text">First Conversation</p>
                    <p className="text-xs text-text-secondary mt-0.5">Practice real-world scenarios like ordering food</p>
                  </div>
                </Link>
                <Link href="/flashcards/sets" className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-panel)] hover:bg-accent-500/5 hover:border-accent-500/30 border border-transparent transition-all group">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent-500/10 text-accent-600 text-sm font-bold shrink-0">3</span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary group-hover:gradient-text">Vocabulary Sets</p>
                    <p className="text-xs text-text-secondary mt-0.5">Study {level} words with spaced-repetition flashcards</p>
                  </div>
                </Link>
              </div>
            </section>
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 text-center">
              <p className="text-sm text-text-secondary mb-4">Or jump straight into a conversation:</p>
              <Link href="/agent" className="btn-gradient inline-flex items-center gap-2">
                Quick Start — Random Scenario →
              </Link>
            </div>
          </div>
        )}

        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Choose Your Next Conversation</h2>
              <p className="mt-1 text-sm text-text-secondary">Real-world English practice from Cambridge, UK</p>
            </div>
            <Link href="/agent" className="hidden sm:inline-flex text-xs font-medium text-accent-500 hover:text-accent-600 transition-colors">
              View all →
            </Link>
          </div>
          <FilterBar filters={FILTERS} active={activeFilter} onChange={setActiveFilter} />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(d => {
              const c = DOMAIN_COLORS[d.name] || DEFAULT_DOMAIN_STYLE;
              return (
                <CourseCard
                  key={d.name}
                  icon={d.icon}
                  title={d.label}
                  dialogues={d.dialogues}
                  rating={d.rating || 4.0}
                  accentColor={c.color}
                  accentBg={c.bg}
                  accentBorder={c.border}
                  href={`/scenario/${d.name}`}
                  recommended={d.name === recommendedDomain}
                />
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <Link href="/skill" className="glass group p-5 text-center hover:shadow-lg transition-all hover:-translate-y-1">
            <span className="text-3xl block mb-2">📖</span>
            <h3 className="font-semibold text-sm text-text-primary group-hover:gradient-text transition-all">Grammar Coach</h3>
            <p className="mt-1 text-xs text-text-secondary">Fix mistakes, learn vocabulary</p>
          </Link>
          <Link href="/agent" className="glass group p-5 text-center hover:shadow-lg transition-all hover:-translate-y-1">
            <span className="text-3xl block mb-2">🎧</span>
            <h3 className="font-semibold text-sm text-text-primary group-hover:gradient-text transition-all">Conversation Practice</h3>
            <p className="mt-1 text-xs text-text-secondary">Jump straight into a session</p>
          </Link>
        </section>

        <section className="text-center space-y-3 pt-4 border-t border-[var(--border-card)]">
          <div className="flex items-center justify-center gap-6 text-xs text-text-secondary">
            <span>🌍 10,000+ learners trust Linguify</span>
            <span>·</span>
            <span>📊 8,437 real dialogues</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="achievement-badge" title="First Conversation">💬</span>
            <span className="achievement-badge" title="3-Day Streak">🔥</span>
            <span className="achievement-badge" title="50 Words Learned">📚</span>
            <span className="achievement-badge" title="B1 Level Reached">🎯</span>
          </div>
          <p className="text-xs text-text-muted">
            Powered by AI · Cambridge, UK dataset
          </p>
        </section>
      </div>

      {showOnboarding && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={() => { setShowOnboarding(false); localStorage.setItem("linguify-onboarded", "true"); }}
        />
      )}
    </div>
  );
}

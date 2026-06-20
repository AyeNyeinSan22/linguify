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

interface DomainData { name: string; label: string; icon: string; description: string; dialogues: number; openings: number; rating: number; }

const FILTERS = ["All Scenarios", "Popular", "Newest", "A1-A2", "B1-B2", "C1-C2"];

export default function Home() {
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [activeFilter, setActiveFilter] = useState("All Scenarios");
  const [streak, setStreak] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [vocabCount, setVocabCount] = useState(0);
  const [level, setLevel] = useState<string>("B1");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if first-time user
    const onboarded = localStorage.getItem("linguify-onboarded");
    if (!onboarded) setShowOnboarding(true);

    // Load saved level
    const savedLevel = localStorage.getItem("linguify-level");
    if (savedLevel) {
      const labels: Record<string, string> = { beginner: "A1-A2", intermediate: "B1-B2", advanced: "C1-C2" };
      setLevel(labels[savedLevel] || "B1");
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
    // Navigate to the selected scenario
    window.location.href = `/scenario/${domain}`;
  };

  const filtered = activeFilter === "All Scenarios" ? domains
    : activeFilter === "Popular" ? [...domains].sort((a,b) => b.rating - a.rating)
    : activeFilter === "Newest" ? [...domains].reverse()
    : [...domains].slice(0, 4);

  // Determine recommended domain (highest rating)
  const recommendedDomain = domains.length > 0
    ? domains.reduce((best, d) => (d.rating || 0) > (best.rating || 0) ? d : best, domains[0]).name
    : null;

  const hasActivity = streak > 0 || messageCount > 0;

  return (
    <div className="flex flex-col flex-1">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="gradient-blob gradient-blob-1" />
        <div className="gradient-blob gradient-blob-2" />
      </div>
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col gap-8 sm:gap-10">

        {/* Hero Section */}
        <GreetingBanner userName="Learner" streak={streak} level={level} />

        {/* Daily Challenge */}
        <DailyChallenge />

        {/* Continue Learning (for returning users) */}
        <ContinueLearning />

        {/* Stats Bar — show for returning users, or a getting-started prompt for new users */}
        {hasActivity ? (
          <QuickStats stats={[
            { icon: "🔥", value: String(streak), label: "Day Streak", accent: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", highlight: streak > 0 },
            { icon: "📚", value: String(vocabCount), label: "Words Learned", accent: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
            { icon: "⏱️", value: String(messageCount), label: "Messages", accent: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
            { icon: "🎯", value: level, label: "Level", accent: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
          ]} />
        ) : (
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-lg font-bold text-text-primary mb-1">Ready to start learning?</h3>
            <p className="text-sm text-text-secondary mb-4">Choose a scenario below and start your first conversation in 2 minutes.</p>
            <Link href="/agent" className="btn-gradient inline-flex items-center gap-2">
              Quick Start — Random Scenario →
            </Link>
          </div>
        )}

        {/* Scenario Grid */}
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

        {/* Quick Actions */}
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

        {/* Social Proof + Footer */}
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

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={() => { setShowOnboarding(false); localStorage.setItem("linguify-onboarded", "true"); }}
        />
      )}
    </div>
  );
}

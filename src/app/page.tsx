"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GreetingBanner from "@/components/GreetingBanner";
import QuickStats from "@/components/QuickStats";
import FilterBar from "@/components/FilterBar";
import CourseCard from "@/components/CourseCard";

interface DomainData { name: string; label: string; icon: string; description: string; dialogues: number; openings: number; rating: number; }

// Domain accent colors
const DOMAIN_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  restaurant: { color: "text-[#FF7043]", bg: "bg-[#FF7043]/8", border: "border-[#FF7043]" },
  hotel:      { color: "text-[#26A69A]", bg: "bg-[#26A69A]/8", border: "border-[#26A69A]" },
  train:      { color: "text-[#1E88E5]", bg: "bg-[#1E88E5]/8", border: "border-[#1E88E5]" },
  attraction: { color: "text-[#8E24AA]", bg: "bg-[#8E24AA]/8", border: "border-[#8E24AA]" },
  taxi:       { color: "text-[#FB8C00]", bg: "bg-[#FB8C00]/8", border: "border-[#FB8C00]" },
  hospital:   { color: "text-[#43A047]", bg: "bg-[#43A047]/8", border: "border-[#43A047]" },
};

const FILTERS = ["All Scenarios", "Popular", "Newest", "A1-A2", "B1-B2", "C1-C2"];

export default function Home() {
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [activeFilter, setActiveFilter] = useState("All Scenarios");
  const [streak, setStreak] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [vocabCount, setVocabCount] = useState(0);

  useEffect(() => {
    fetch("/api/scenarios").then(r => r.json()).then(d => { if (d.domains) setDomains(d.domains); }).catch(() => {});
    fetch("/api/progress").then(r => r.json()).then(d => {
      if (d.streakDays) setStreak(d.streakDays);
      if (d.totalMessages) setMessageCount(d.totalMessages);
      if (d.vocabulary) setVocabCount(d.vocabulary.length);
    }).catch(() => {});
  }, []);

  const filtered = activeFilter === "All Scenarios" ? domains
    : activeFilter === "Popular" ? [...domains].sort((a,b) => b.rating - a.rating)
    : activeFilter === "Newest" ? [...domains].reverse()
    : [...domains].slice(0, 4);

  return (
    <div className="flex flex-col flex-1">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="gradient-blob gradient-blob-1" />
        <div className="gradient-blob gradient-blob-2" />
      </div>
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-8">
        <GreetingBanner userName="Learner" streak={streak} />
        <QuickStats stats={[
          { icon: "🔥", value: String(streak), label: "Day Streak", accent: "text-amber-500", bg: "bg-amber-50" },
          { icon: "📚", value: String(vocabCount), label: "Words Learned", accent: "text-green-500", bg: "bg-green-50" },
          { icon: "⏱️", value: String(messageCount), label: "Messages", accent: "text-blue-500", bg: "bg-blue-50" },
          { icon: "🎯", value: "B1", label: "Level", accent: "text-purple-500", bg: "bg-purple-50" },
        ]} />
        <section>
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Top Scenarios</h2>
            <p className="mt-1 text-sm text-text-secondary">Choose a domain and practice with authentic English dialogues</p>
          </div>
          <FilterBar filters={FILTERS} active={activeFilter} onChange={setActiveFilter} />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(d => {
              const c = DOMAIN_COLORS[d.name] || DOMAIN_COLORS.restaurant;
              return <CourseCard key={d.name} icon={d.icon} title={d.label}
                dialogues={d.dialogues} rating={d.rating||4.0}
                accentColor={c.color} accentBg={c.bg} accentBorder={c.border}
                href={`/scenario/${d.name}`} />;
            })}
          </div>
          <p className="mt-4 text-center text-[11px] text-text-muted">Powered by <span className="font-medium text-text-secondary">MultiWOZ 2.2</span> · 8,437 dialogues · 7 domains · Cambridge, UK</p>
        </section>
        <section className="grid grid-cols-2 gap-4">
          <Link href="/skill" className="glass group p-5 text-center hover:shadow-lg transition-all hover:-translate-y-1">
            <span className="text-3xl block mb-2">📖</span>
            <h3 className="font-semibold text-sm text-text-primary group-hover:gradient-text transition-all">English Coach</h3>
            <p className="mt-1 text-[11px] text-text-secondary">Grammar, vocabulary & writing</p>
          </Link>
          <Link href="/agent" className="glass group p-5 text-center hover:shadow-lg transition-all hover:-translate-y-1">
            <span className="text-3xl block mb-2">🏙️</span>
            <h3 className="font-semibold text-sm text-text-primary group-hover:gradient-text transition-all">Quick Practice</h3>
            <p className="mt-1 text-[11px] text-text-secondary">Jump straight into a session</p>
          </Link>
        </section>
        <section className="text-center border-t border-gray-100 pt-6">
          <p className="text-xs text-text-secondary mb-1">Powered by the MultiWOZ 2.2 dataset</p>
          <p className="text-sm font-semibold gradient-text">AI-Powered English Coaching</p>
        </section>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { getDailyChallenge } from "@/lib/constants";

export default function DailyChallenge() {
  const challenge = getDailyChallenge();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-5 sm:p-6 text-white shadow-lg challenge-glow">
      {/* Decorative */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-base">🎯</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">Today&apos;s Challenge</span>
        </div>
        <h3 className="text-lg font-bold mb-1.5 leading-tight">{challenge.title}</h3>
        <div className="flex items-center gap-3 text-xs text-white/75 mb-4">
          <span>{challenge.icon} {challenge.domain.charAt(0).toUpperCase() + challenge.domain.slice(1)}</span>
          <span>·</span>
          <span>⏱️ {challenge.duration}</span>
          <span>·</span>
          <span className="font-semibold text-amber-200">+{challenge.xp} XP</span>
        </div>
        <Link
          href={`/scenario/${challenge.domain}`}
          className="inline-flex items-center gap-2 rounded-xl bg-white text-orange-600 px-5 py-2.5 text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all"
        >
          Start Challenge →
        </Link>
      </div>
    </div>
  );
}

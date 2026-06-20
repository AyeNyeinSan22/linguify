"use client";

import Link from "next/link";

interface GreetingBannerProps {
  userName?: string;
  streak?: number;
  level?: string;
}

export default function GreetingBanner({ userName, streak, level }: GreetingBannerProps) {
  const name = userName || "Learner";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-600 via-accent-700 to-[#0D47A1] p-5 sm:p-8 lg:p-10 text-white shadow-xl shadow-accent-600/20 ring-1 ring-white/10">
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-16 w-48 h-48 rounded-full bg-accent-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 right-1/3 w-40 h-40 rounded-full bg-white/3 blur-2xl pointer-events-none" />

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        <div className="flex-1">
          {/* Value-prop headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-2">
            Your AI English Coach
          </h1>
          {/* Greeting as subtitle */}
          <p className="text-sm sm:text-base text-white/75 mb-1">
            {greeting}, {name}! 👋
          </p>
          <p className="text-sm sm:text-base text-white/70 max-w-lg leading-relaxed">
            Master English through <strong className="text-white/90">real conversations</strong> from Cambridge, UK.
            Get instant feedback and improve every day.
          </p>

          {/* Compact stats chip */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {streak && streak > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/25 text-xs font-semibold text-amber-200">
                🔥 {streak}-day streak
              </span>
            )}
            {level && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white/80">
                📊 {level} level
              </span>
            )}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/agent"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-accent-700 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-bold shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            Start Practicing
            <span className="text-lg">→</span>
          </Link>
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border-2 border-white/25 px-5 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-white/8 hover:border-white/40 transition-all"
          >
            View Progress
          </Link>
        </div>
      </div>

      {/* Bottom highlight bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}

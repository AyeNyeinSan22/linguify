"use client";

import Link from "next/link";

interface GreetingBannerProps { userName?: string; streak?: number; }

export default function GreetingBanner({ userName, streak }: GreetingBannerProps) {
  const name = userName || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning ☀️" : hour < 17 ? "Good afternoon 🌤️" : "Good evening 🌙";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-600 via-accent-700 to-[#0D47A1] p-8 sm:p-10 text-white shadow-xl shadow-accent-600/25 ring-1 ring-white/10">
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/6 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-16 w-48 h-48 rounded-full bg-accent-400/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 right-1/3 w-40 h-40 rounded-full bg-white/4 blur-2xl pointer-events-none" />

      {/* Subtle dot pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          {/* Greeting */}
          <div className="flex items-center gap-4 mb-3">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/12 backdrop-blur-sm text-3xl shadow-inner shadow-white/5 ring-1 ring-white/10">
              👋
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{greeting}, {name}!</h2>
              {streak && streak > 0 ? (
                <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-xs font-semibold text-amber-200">
                  🔥 {streak}-day streak — you&apos;re on fire!
                </span>
              ) : (
                <span className="text-sm text-white/65 mt-0.5">Start your first streak today!</span>
              )}
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-base text-white/80 max-w-lg leading-relaxed">
            Master English through <strong className="text-white">real conversations</strong> from Cambridge, UK.
            Your AI coach adapts to your level with instant feedback.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/agent"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-accent-700 px-6 py-3 text-sm font-bold shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            Start Practicing
            <span className="text-lg">→</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/8 hover:border-white/40 transition-all"
          >
            View Progress
          </Link>
        </div>
      </div>

      {/* Bottom highlight bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

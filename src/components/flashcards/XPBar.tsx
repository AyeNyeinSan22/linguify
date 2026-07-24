"use client";

interface XPBarProps {
  xp: number;
  level: number;
}

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];

export default function XPBar({ xp, level }: XPBarProps) {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const xpInLevel = xp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const pct = xpNeeded > 0 ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;

  return (
    <div className="glass rounded-2xl p-4 dark:border-[var(--border-card)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
              <span className="text-white text-sm font-bold">{level}</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Level {level}</p>
            <p className="text-[10px] text-[var(--text-muted)]">
              {xpInLevel} / {xpNeeded} XP to next level
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-yellow-500">⭐ {xp}</p>
          <p className="text-[10px] text-[var(--text-muted)]">total XP</p>
        </div>
      </div>

      {/* XP Progress bar */}
      <div className="h-2.5 rounded-full bg-[var(--bg-panel)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
          }}
        />
      </div>
    </div>
  );
}

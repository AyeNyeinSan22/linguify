"use client";

interface FlashcardStatsBarProps {
  stats: { due: number; learning: number; mastered: number; total: number };
  xp?: number;
  level?: number;
}

export default function FlashcardStatsBar({ stats, xp, level }: FlashcardStatsBarProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <div className="glass rounded-xl px-4 py-2 text-center">
        <p className="text-lg font-bold text-orange-400">{stats.due}</p>
        <p className="text-xs text-[var(--text-muted)]">Due</p>
      </div>
      <div className="glass rounded-xl px-4 py-2 text-center">
        <p className="text-lg font-bold text-blue-400">{stats.learning}</p>
        <p className="text-xs text-[var(--text-muted)]">Learning</p>
      </div>
      <div className="glass rounded-xl px-4 py-2 text-center">
        <p className="text-lg font-bold text-emerald-400">{stats.mastered}</p>
        <p className="text-xs text-[var(--text-muted)]">Mastered</p>
      </div>
      <div className="glass rounded-xl px-4 py-2 text-center">
        <p className="text-lg font-bold text-[var(--text)]">{stats.total}</p>
        <p className="text-xs text-[var(--text-muted)]">Total</p>
      </div>
      {xp !== undefined && (
        <div className="glass rounded-xl px-4 py-2 text-center">
          <p className="text-lg font-bold text-yellow-400">⭐ {xp}</p>
          <p className="text-xs text-[var(--text-muted)]">XP</p>
        </div>
      )}
      {level !== undefined && (
        <div className="glass rounded-xl px-4 py-2 text-center">
          <p className="text-lg font-bold text-purple-400">Lv {level}</p>
          <p className="text-xs text-[var(--text-muted)]">Level</p>
        </div>
      )}
    </div>
  );
}

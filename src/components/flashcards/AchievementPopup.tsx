"use client";

import { useEffect, useState } from "react";

interface AchievementPopupProps {
  achievement: { name: string; description: string; icon: string } | null;
  onDismiss: () => void;
}

export default function AchievementPopup({ achievement, onDismiss }: AchievementPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  if (!visible || !achievement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="glass-heavy rounded-2xl p-8 text-center max-w-sm mx-4 pointer-events-auto border border-yellow-500/30 shadow-2xl animate-scale-in">
        <div className="text-5xl mb-3">{achievement.icon}</div>
        <p className="text-xs uppercase tracking-widest text-yellow-400 mb-1">
          Achievement Unlocked!
        </p>
        <h3 className="text-xl font-bold text-[var(--text)] mb-2">
          {achievement.name}
        </h3>
        <p className="text-sm text-[var(--text-muted)]">
          {achievement.description}
        </p>
        <button
          onClick={() => { setVisible(false); onDismiss(); }}
          className="mt-4 px-4 py-1.5 text-sm rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

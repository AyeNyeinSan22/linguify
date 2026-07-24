"use client";

import { useEffect } from "react";

interface XPNotificationProps {
  amount: number;
  show: boolean;
  onDone?: () => void;
}

export default function XPNotification({ amount, show, onDone }: XPNotificationProps) {
  useEffect(() => {
    if (show && amount > 0) {
      const timer = setTimeout(() => {
        onDone?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, amount, onDone]);

  if (!show || amount <= 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce-in">
      <div className="glass-heavy rounded-xl px-4 py-2 border border-amber-500/30">
        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
          +{amount} XP
        </p>
      </div>
    </div>
  );
}

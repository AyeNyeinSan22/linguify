"use client";

import { useEffect, useState } from "react";

interface XPNotificationProps {
  amount: number;
  show: boolean;
  onDone?: () => void;
}

export default function XPNotification({ amount, show, onDone }: XPNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show && amount > 0) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, amount, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce-in">
      <div className="glass-heavy rounded-xl px-4 py-2 border border-yellow-500/30">
        <p className="text-lg font-bold text-yellow-400">
          +{amount} XP
        </p>
      </div>
    </div>
  );
}

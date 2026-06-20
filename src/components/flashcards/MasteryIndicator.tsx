"use client";

interface MasteryIndicatorProps {
  percentage: number;
  size?: number;
}

export default function MasteryIndicator({ percentage, size = 48 }: MasteryIndicatorProps) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (pct: number) => {
    if (pct >= 80) return "#10b981"; // emerald
    if (pct >= 50) return "#3b82f6"; // blue
    if (pct >= 20) return "#f59e0b"; // amber
    return "#6b7280"; // gray
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-[var(--border)]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(percentage)}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-xs font-medium text-[var(--text)]">
        {percentage}%
      </span>
    </div>
  );
}

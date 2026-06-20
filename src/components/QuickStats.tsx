interface StatItem { icon: string; value: string; label: string; accent: string; bg: string; highlight?: boolean; }

export default function QuickStats({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl text-center py-5 px-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg group ${
            stat.highlight ? "streak-glow ring-1 ring-amber-400/20" : ""
          }`}
        >
          <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${stat.bg} text-xl mb-2 group-hover:scale-110 transition-transform`}>
            {stat.icon}
          </span>
          <div className="text-xl sm:text-2xl font-bold text-text-primary">
            {stat.value}
          </div>
          <div className="text-xs text-text-muted mt-0.5 font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

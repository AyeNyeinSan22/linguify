"use client";

export default function FilterBar({ filters, active, onChange }: { filters: string[]; active: string; onChange: (f: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {filters.map((f) => (
        <button key={f} onClick={() => onChange(f)}
          className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-medium transition-all duration-200 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-accent-500 ${
            active === f
              ? "bg-accent-500 text-white shadow-md shadow-accent-500/20"
              : "bg-[var(--bg-card)] border border-[var(--border-card)] text-text-secondary hover:border-accent-500/30 hover:bg-accent-500/5"
          }`}>
          {f}
        </button>
      ))}
    </div>
  );
}

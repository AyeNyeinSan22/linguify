"use client";

export default function FilterBar({ filters, active, onChange }: { filters: string[]; active: string; onChange: (f: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {filters.map((f) => (
        <button key={f} onClick={() => onChange(f)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap ${
            active === f
              ? "bg-accent-500 text-white shadow-md shadow-accent-500/20"
              : "bg-white border border-gray-200 text-text-secondary hover:border-accent-500/30 hover:bg-blue-50"
          }`}>
          {f}
        </button>
      ))}
    </div>
  );
}

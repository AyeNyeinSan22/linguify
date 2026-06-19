"use client";

interface PracticeCardProps { title: string; description: string; icon: string; prompt: string; active: boolean; onClick: () => void; }

export default function PracticeCard({ title, description, icon, prompt, active, onClick }: PracticeCardProps) {
  return (
    <button onClick={onClick} className={`glass w-full p-5 text-left transition-all duration-300 hover:-translate-y-0.5 ${active ? "ring-2 ring-accent-500/50 shadow-lg shadow-accent-500/10 border-accent-500/40" : ""}`}>
      <div className="flex items-start gap-4">
        <span className="icon-circle flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <h3 className={`text-sm font-semibold ${active ? "gradient-text" : "text-text-primary"}`}>{title}</h3>
          <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">{description}</p>
          <p className="mt-2 text-[11px] font-medium text-accent-500 truncate">Prompt: {prompt}</p>
        </div>
      </div>
    </button>
  );
}

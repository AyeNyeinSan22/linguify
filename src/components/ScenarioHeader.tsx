import Link from "next/link";

interface ScenarioHeaderProps {
  icon: string; title: string; subtitle: string;
  duration: string; dialogues: number; students: number;
  rating: number; reviews: number;
  accentColor?: string; accentBg: string; gradient: string;
  onStart: () => void;
}

export default function ScenarioHeader({ icon, title, subtitle, duration, dialogues, students, rating, reviews, accentBg, gradient, onStart }: ScenarioHeaderProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 sm:p-8 text-white shadow-lg`}>
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/6 blur-3xl pointer-events-none" />
      <div className="relative">
        <Link href="/agent" className="inline-flex items-center gap-1 text-xs font-medium text-white/70 hover:text-white transition-colors mb-4">← Back to Scenarios</Link>
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <span className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${accentBg} text-3xl shrink-0`}>{icon}</span>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
            <p className="mt-1 text-sm text-white/75 max-w-lg">{subtitle}</p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {[{l:"⏱️",v:duration},{l:"📝",v:`${dialogues.toLocaleString()} dialogues`},{l:"👥",v:`${students.toLocaleString()} students`},{l:"🌐",v:"English subtitles"}].map((ch,i)=>(
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-[11px] font-medium">{ch.l} {ch.v}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <div className="flex items-center gap-1.5"><span className="font-bold text-sm">⭐ {rating.toFixed(1)}</span><span className="text-[11px] text-white/65">({reviews.toLocaleString()} reviews)</span></div>
              <button onClick={onStart} className="rounded-xl bg-white text-accent-700 px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">Start Practice</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

interface CourseCardProps {
  icon: string; title: string; dialogues: number; rating: number;
  accentColor: string; accentBg: string; accentBorder: string; href: string;
}

export default function CourseCard({ icon, title, dialogues, rating, accentColor, accentBg, accentBorder, href }: CourseCardProps) {
  return (
    <Link href={href}
      className={`relative overflow-hidden bg-white rounded-2xl border ${accentBorder} border-l-4 group p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
      {/* Ghost icon */}
      <span className="absolute -bottom-2 -right-2 text-6xl opacity-[0.04] select-none pointer-events-none">{icon}</span>
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${accentBg} text-2xl group-hover:scale-110 transition-transform`}>
            {icon}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-text-primary shadow-sm">
            ⭐ {rating.toFixed(1)}
          </span>
        </div>
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11px] text-text-secondary">{dialogues.toLocaleString()} dialogues</span>
          <span className="text-text-muted">·</span>
          <span className="text-[11px] font-medium text-success">Free</span>
        </div>
        <div className={`mt-3 flex items-center gap-1.5 text-[11px] font-semibold ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
          View Details <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}

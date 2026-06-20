import Link from "next/link";

interface CourseCardProps {
  icon: string;
  title: string;
  dialogues: number;
  rating: number;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  href: string;
  recommended?: boolean;
  mastery?: number; // 0-100
}

export default function CourseCard({
  icon, title, dialogues, rating, accentColor, accentBg, accentBorder, href, recommended, mastery,
}: CourseCardProps) {
  return (
    <Link
      href={href}
      className={`relative overflow-hidden bg-[var(--bg-card)] rounded-2xl border ${accentBorder} border-l-4 group p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-accent-500`}
    >
      {/* Recommended badge */}
      {recommended && (
        <span className="badge-recommended">Recommended</span>
      )}

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${accentBg} text-2xl group-hover:scale-110 transition-transform`}>
            {icon}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-panel)] px-2.5 py-0.5 text-xs font-semibold text-text-primary shadow-sm">
            ⭐ {rating.toFixed(1)}
          </span>
        </div>
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-text-secondary">{dialogues.toLocaleString()} dialogues</span>
          <span className="text-text-muted">·</span>
          <span className="text-xs font-medium text-success">Free</span>
        </div>

        {/* Mastery progress */}
        {typeof mastery === "number" && mastery > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-text-muted">Mastery</span>
              <span className="font-semibold text-text-primary">{mastery}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--bg-panel)]">
              <div
                className="h-full rounded-full bg-accent-500 transition-all"
                style={{ width: `${mastery}%` }}
              />
            </div>
          </div>
        )}

        {/* Tap hint — always visible on mobile, hover on desktop */}
        <div className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${accentColor} opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity`}>
          Explore scenarios <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}

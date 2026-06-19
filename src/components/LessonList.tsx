interface Lesson { id: number; title: string; duration: string; completed?: boolean; }

export default function LessonList({ lessons }: { lessons: Lesson[] }) {
  return (
    <div className="glass overflow-hidden">
      {lessons.map((lesson, i) => (
        <div key={lesson.id} className={`flex items-center gap-4 px-5 py-4 transition-colors ${lesson.completed ? "bg-blue-50/50" : "hover:bg-gray-50"} ${i < lessons.length-1 ? "border-b border-gray-100" : ""}`}>
          <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${lesson.completed ? "bg-success/10 text-success" : "bg-accent-500/10 text-accent-600"}`}>
            {lesson.completed ? "✅" : "▶"}
          </span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${lesson.completed ? "text-text-muted line-through" : "text-text-primary"}`}>{lesson.id}. {lesson.title}</p>
          </div>
          <span className="shrink-0 text-[11px] text-text-muted font-medium">{lesson.duration}</span>
          <span className="shrink-0 text-sm">{lesson.completed ? <span className="text-success">✓</span> : <span className="w-5 h-5 rounded-full border-2 border-gray-200 block" />}</span>
        </div>
      ))}
    </div>
  );
}

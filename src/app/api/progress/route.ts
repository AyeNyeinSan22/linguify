import { NextResponse } from "next/server";
import { getProgress, getErrorSummary, getVocabularyList, getWritingStats, getMasteryScores } from "@/lib/progress-store";
import { getLevels } from "@/lib/level-store";

export async function GET(): Promise<NextResponse> {
  try {
    const progress = getProgress();
    const errorSummary = getErrorSummary();
    const vocabulary = getVocabularyList();
    const writingStats = getWritingStats();
    const masteryScores = getMasteryScores();
    const levels = getLevels();

    return NextResponse.json({
      totalSessions: progress.totalSessions,
      totalMessages: progress.totalMessages,
      streakDays: progress.streakDays,
      lastActiveDate: progress.lastActiveDate,
      errorSummary,
      masteryScores,
      vocabulary,
      writingStats,
      levels,
      recentEntries: progress.entries.slice(-10).reverse(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load progress.", detail: String(err) },
      { status: 500 }
    );
  }
}

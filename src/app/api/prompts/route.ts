import { NextRequest, NextResponse } from "next/server";
import { getTodayPrompt, getPromptsByLevel, getAllLevels, getLevelLabels } from "@/lib/prompts";
import { getLevels } from "@/lib/level-store";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const level = url.searchParams.get("level") || undefined;
    const count = parseInt(url.searchParams.get("count") || "1", 10);

    if (count > 1 && level) {
      const prompts = getPromptsByLevel(level, count);
      return NextResponse.json({ prompts, levels: getAllLevels(), labels: getLevelLabels() });
    }

    // Default: return today's daily prompt adapted to user's level
    const userLevels = getLevels();
    const promptLevel = level || userLevels.writing || "B1";
    const prompt = getTodayPrompt(promptLevel);

    return NextResponse.json({
      prompt,
      userLevel: promptLevel,
      levels: getAllLevels(),
      labels: getLevelLabels(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load prompts.", detail: String(err) },
      { status: 500 }
    );
  }
}

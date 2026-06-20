import { NextRequest, NextResponse } from "next/server";
import {
  getAllSets,
  getSetsByLevel,
  getSetsByTopic,
  getSetMeta,
  getSetCards,
  searchSets,
} from "@/lib/vocab-sets";

/**
 * GET /api/vocab-sets
 * ?setId=<id>       → { meta, cards }
 * ?level=<CEFR>     → filtered sets
 * ?topic=<topic>    → filtered sets
 * ?q=<query>        → search sets
 * (none)            → all sets
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const setId = searchParams.get("setId");
  const level = searchParams.get("level");
  const topic = searchParams.get("topic");
  const query = searchParams.get("q");

  // Single set detail
  if (setId) {
    const meta = getSetMeta(setId);
    if (!meta) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }
    const cards = getSetCards(setId);
    return NextResponse.json({ meta, cards });
  }

  // Filter by level
  if (level) {
    return NextResponse.json({ sets: getSetsByLevel(level) });
  }

  // Filter by topic
  if (topic) {
    return NextResponse.json({ sets: getSetsByTopic(topic) });
  }

  // Search
  if (query) {
    return NextResponse.json({ sets: searchSets(query) });
  }

  // All sets
  return NextResponse.json({ sets: getAllSets() });
}

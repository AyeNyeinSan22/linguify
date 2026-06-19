import { NextRequest, NextResponse } from "next/server";
import {
  getDomains,
  getRoleplayScenario,
  getDrillExercise,
  getSystemFallbackPool,
  type ScenarioPrompt,
  type DomainInfo,
} from "@/lib/multiwoz";

// ── Curated lesson list per domain ───────────────────────────────────────

const DOMAIN_LESSONS: Record<string, Array<{ id: number; title: string; duration: string }>> = {
  restaurant: [
    { id: 1, title: "Ordering at a Café", duration: "5 min" },
    { id: 2, title: "Asking for the Menu", duration: "8 min" },
    { id: 3, title: "Dietary Requirements", duration: "6 min" },
    { id: 4, title: "Making a Reservation", duration: "10 min" },
    { id: 5, title: "Paying the Bill", duration: "4 min" },
    { id: 6, title: "Complaining Politely", duration: "7 min" },
    { id: 7, title: "Recommending Dishes", duration: "9 min" },
  ],
  hotel: [
    { id: 1, title: "Booking a Room", duration: "8 min" },
    { id: 2, title: "Checking In", duration: "6 min" },
    { id: 3, title: "Asking About Amenities", duration: "7 min" },
    { id: 4, title: "Extending Your Stay", duration: "5 min" },
    { id: 5, title: "Reporting an Issue", duration: "9 min" },
    { id: 6, title: "Checking Out", duration: "4 min" },
  ],
  train: [
    { id: 1, title: "Buying Tickets", duration: "7 min" },
    { id: 2, title: "Asking About Schedules", duration: "8 min" },
    { id: 3, title: "Finding Your Platform", duration: "5 min" },
    { id: 4, title: "Changing Your Booking", duration: "10 min" },
    { id: 5, title: "Dealing with Delays", duration: "8 min" },
    { id: 6, title: "Group Bookings", duration: "9 min" },
  ],
  attraction: [
    { id: 1, title: "Buying Tickets", duration: "6 min" },
    { id: 2, title: "Asking About Opening Hours", duration: "5 min" },
    { id: 3, title: "Getting Directions", duration: "7 min" },
    { id: 4, title: "Museum Audio Guide", duration: "8 min" },
    { id: 5, title: "Booking a Guided Tour", duration: "10 min" },
    { id: 6, title: "Asking About Exhibits", duration: "6 min" },
  ],
  taxi: [
    { id: 1, title: "Hailing a Taxi", duration: "5 min" },
    { id: 2, title: "Giving Your Destination", duration: "6 min" },
    { id: 3, title: "Negotiating the Fare", duration: "7 min" },
    { id: 4, title: "Asking the Driver to Wait", duration: "4 min" },
    { id: 5, title: "Splitting the Fare", duration: "5 min" },
  ],
  hospital: [
    { id: 1, title: "Making an Appointment", duration: "7 min" },
    { id: 2, title: "Describing Symptoms", duration: "9 min" },
    { id: 3, title: "At the Reception Desk", duration: "5 min" },
    { id: 4, title: "Understanding Prescriptions", duration: "8 min" },
    { id: 5, title: "Emergency Room Visit", duration: "10 min" },
  ],
};

// ── Domain ratings (simulated, for UI) ───────────────────────────────────

const DOMAIN_RATINGS: Record<string, { rating: number; reviews: number; students: number }> = {
  restaurant: { rating: 4.8, reviews: 2340, students: 12450 },
  hotel: { rating: 4.6, reviews: 1890, students: 9870 },
  train: { rating: 4.7, reviews: 1540, students: 8230 },
  attraction: { rating: 4.5, reviews: 1120, students: 6780 },
  taxi: { rating: 4.4, reviews: 890, students: 4120 },
  hospital: { rating: 4.2, reviews: 340, students: 1890 },
};

const DOMAIN_SUBTITLES: Record<string, string> = {
  restaurant: "Practice ordering food, booking tables, and finding restaurants by cuisine, price range, and location — using real Cambridge dialogues.",
  hotel: "Book rooms, check amenities including parking and wifi, manage stay details, and handle hotel situations like a native speaker.",
  train: "Buy tickets, check schedules, find routes between cities, and navigate train travel with confidence.",
  attraction: "Find museums, parks, and tourist spots. Get opening hours, buy tickets, and book guided tours.",
  taxi: "Hail taxis, give destinations, negotiate fares, and handle real-world transportation conversations.",
  hospital: "Make appointments, describe symptoms, understand prescriptions, and navigate healthcare conversations.",
};

/**
 * GET /api/scenarios
 *   Returns all available MultiWOZ domains with metadata.
 *
 * GET /api/scenarios?domain=restaurant
 *   Returns detailed domain info + lesson list.
 *
 * POST /api/scenarios
 *   Body: { domain: string, type?: "roleplay" | "drill" }
 *   Returns a scenario prompt from the MultiWOZ dataset.
 */

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const domainParam = url.searchParams.get("domain");

    if (domainParam) {
      // Return detail for a single domain
      const domain = domainParam.toLowerCase().trim();
      const domains = getDomains();
      const info = domains.find((d) => d.name === domain);
      if (!info) {
        return NextResponse.json(
          { error: `Unknown domain: "${domain}"` },
          { status: 404 }
        );
      }

      const ratings = DOMAIN_RATINGS[domain] || { rating: 4.0, reviews: 100, students: 500 };
      const subtitle = DOMAIN_SUBTITLES[domain] || `Practice real-world ${domain} conversations.`;
      const lessons = DOMAIN_LESSONS[domain] || [
        { id: 1, title: "Getting Started", duration: "5 min" },
        { id: 2, title: "Basic Conversation", duration: "7 min" },
        { id: 3, title: "Advanced Scenarios", duration: "10 min" },
      ];

      return NextResponse.json({
        domain: {
          ...info,
          subtitle,
          rating: ratings.rating,
          reviews: ratings.reviews,
          students: ratings.students,
        },
        lessons,
      });
    }

    // Return all domains
    const domains: DomainInfo[] = getDomains();
    return NextResponse.json({
      domains: domains.map((d) => ({
        ...d,
        ...DOMAIN_RATINGS[d.name],
      })),
      total: domains.reduce((sum, d) => sum + d.dialogues, 0),
    });
  } catch (err) {
    console.error("[scenarios] GET error:", err);
    return NextResponse.json(
      { error: "Failed to load domains.", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const domain = (body.domain || "").toLowerCase().trim();
    const type = body.type === "drill" ? "drill" : "roleplay";

    if (!domain) {
      return NextResponse.json(
        { error: "Missing 'domain' in request body." },
        { status: 400 }
      );
    }

    const domains = getDomains();
    const validDomain = domains.find((d) => d.name === domain);
    if (!validDomain) {
      return NextResponse.json(
        { error: `Unknown domain: "${domain}". Available: ${domains.map((d) => d.name).join(", ")}` },
        { status: 400 }
      );
    }

    let scenario: ScenarioPrompt | null;
    if (type === "drill") {
      scenario = getDrillExercise(domain);
    } else {
      scenario = getRoleplayScenario(domain);
    }

    if (!scenario) {
      return NextResponse.json(
        { error: `No ${type} scenarios for "${domain}".` },
        { status: 404 }
      );
    }

    const fallback = getSystemFallbackPool(domain);
    return NextResponse.json({ scenario, fallback, domainInfo: validDomain });
  } catch (err) {
    console.error("[scenarios] POST error:", err);
    return NextResponse.json(
      { error: "Failed to generate scenario.", detail: String(err) },
      { status: 500 }
    );
  }
}

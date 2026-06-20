// ── Domain Colors & Styles ───────────────────────────────────────────
// Shared across homepage, scenario pages, agent page, and components.

export interface DomainStyle {
  color: string;
  bg: string;
  border: string;
  gradient: string;
  ring: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

export const DOMAIN_COLORS: Record<string, DomainStyle> = {
  restaurant: {
    color: "text-[#FF7043]", bg: "bg-[#FF7043]/8", border: "border-[#FF7043]",
    gradient: "from-[#FF7043] via-[#F4511E] to-[#E64A19]",
    ring: "ring-[#FF7043]/40",
    accentColor: "text-[#FF7043]", accentBg: "bg-[#FF7043]", accentBorder: "border-[#FF7043]",
  },
  hotel: {
    color: "text-[#26A69A]", bg: "bg-[#26A69A]/8", border: "border-[#26A69A]",
    gradient: "from-[#26A69A] via-[#00897B] to-[#00695C]",
    ring: "ring-[#26A69A]/40",
    accentColor: "text-[#26A69A]", accentBg: "bg-[#26A69A]", accentBorder: "border-[#26A69A]",
  },
  train: {
    color: "text-[#1E88E5]", bg: "bg-[#1E88E5]/8", border: "border-[#1E88E5]",
    gradient: "from-[#1E88E5] via-[#1565C0] to-[#0D47A1]",
    ring: "ring-[#1E88E5]/40",
    accentColor: "text-[#1E88E5]", accentBg: "bg-[#1E88E5]", accentBorder: "border-[#1E88E5]",
  },
  attraction: {
    color: "text-[#8E24AA]", bg: "bg-[#8E24AA]/8", border: "border-[#8E24AA]",
    gradient: "from-[#8E24AA] via-[#7B1FA2] to-[#6A1B9A]",
    ring: "ring-[#8E24AA]/40",
    accentColor: "text-[#8E24AA]", accentBg: "bg-[#8E24AA]", accentBorder: "border-[#8E24AA]",
  },
  taxi: {
    color: "text-[#FB8C00]", bg: "bg-[#FB8C00]/8", border: "border-[#FB8C00]",
    gradient: "from-[#FB8C00] via-[#F57C00] to-[#EF6C00]",
    ring: "ring-[#FB8C00]/40",
    accentColor: "text-[#FB8C00]", accentBg: "bg-[#FB8C00]", accentBorder: "border-[#FB8C00]",
  },
  hospital: {
    color: "text-[#43A047]", bg: "bg-[#43A047]/8", border: "border-[#43A047]",
    gradient: "from-[#43A047] via-[#388E3C] to-[#2E7D32]",
    ring: "ring-[#43A047]/40",
    accentColor: "text-[#43A047]", accentBg: "bg-[#43A047]", accentBorder: "border-[#43A047]",
  },
};

export const DEFAULT_DOMAIN_STYLE: DomainStyle = DOMAIN_COLORS.restaurant;

// ── Domain Metadata ──────────────────────────────────────────────────

export const DOMAIN_META: Record<string, { label: string; icon: string; description: string }> = {
  restaurant: { label: "Restaurant", icon: "🍽️", description: "Order food, book tables, find restaurants." },
  hotel: { label: "Hotel", icon: "🏨", description: "Book rooms, check amenities, manage stays." },
  train: { label: "Train", icon: "🚂", description: "Book tickets, check schedules, find routes." },
  attraction: { label: "Attractions", icon: "🎭", description: "Find museums, parks, and tourist spots." },
  taxi: { label: "Taxi", icon: "🚕", description: "Book taxis, negotiate fares, give directions." },
  hospital: { label: "Hospital", icon: "🏥", description: "Make appointments, describe symptoms." },
};

// ── Daily Challenges ─────────────────────────────────────────────────

export interface DailyChallenge {
  title: string;
  domain: string;
  icon: string;
  duration: string;
  xp: number;
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  { title: "Order a coffee and ask about Wi-Fi", domain: "restaurant", icon: "🍽️", duration: "2 min", xp: 50 },
  { title: "Book a hotel room for tonight", domain: "hotel", icon: "🏨", duration: "3 min", xp: 75 },
  { title: "Find the next train to London", domain: "train", icon: "🚂", duration: "2 min", xp: 50 },
  { title: "Ask for directions to a museum", domain: "attraction", icon: "🎭", duration: "2 min", xp: 50 },
  { title: "Book a taxi to the airport", domain: "taxi", icon: "🚕", duration: "2 min", xp: 50 },
  { title: "Describe your symptoms to a doctor", domain: "hospital", icon: "🏥", duration: "3 min", xp: 75 },
  { title: "Complain about a wrong order politely", domain: "restaurant", icon: "🍽️", duration: "3 min", xp: 75 },
];

export function getDailyChallenge(): DailyChallenge {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
}

// ── Level Definitions ────────────────────────────────────────────────

export const LEVELS = [
  { key: "beginner", label: "Beginner", cefr: "A1-A2", description: "Just starting out" },
  { key: "intermediate", label: "Intermediate", cefr: "B1-B2", description: "Can hold conversations" },
  { key: "advanced", label: "Advanced", cefr: "C1-C2", description: "Near-native fluency" },
] as const;

export type LevelKey = typeof LEVELS[number]["key"];

// ── Gamification Constants ────────────────────────────────────────────

export const XP_PER_REVIEW = { correct: 10, easy: 15, hard: 5, forgot: 0 } as const;
export const STREAK_BONUS_THRESHOLD = 5;
export const STREAK_BONUS_XP = 5;
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (data: {
    flashcardStats: { totalReviews: number; correctReviews: number; currentStreak: number };
    setMastery: Record<string, { masteredCards: number; totalCards: number }>;
    xp: number;
    level: number;
  }) => boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "first-card", name: "First Card", description: "Review your first flashcard", icon: "🃏",
    check: (d) => d.flashcardStats.totalReviews >= 1 },
  { id: "reviews-100", name: "Century", description: "Complete 100 flashcard reviews", icon: "💯",
    check: (d) => d.flashcardStats.totalReviews >= 100 },
  { id: "streak-7", name: "Week Warrior", description: "7 correct answers in a row", icon: "🔥",
    check: (d) => d.flashcardStats.currentStreak >= 7 },
  { id: "streak-30", name: "Monthly Master", description: "30 correct answers in a row", icon: "🏆",
    check: (d) => d.flashcardStats.currentStreak >= 30 },
  { id: "accuracy-90", name: "Sharpshooter", description: "90% accuracy over 50+ reviews", icon: "🎯",
    check: (d) => d.flashcardStats.totalReviews >= 50 && (d.flashcardStats.correctReviews / d.flashcardStats.totalReviews) >= 0.9 },
  { id: "set-complete", name: "Set Scholar", description: "Complete an entire vocabulary set", icon: "📚",
    check: (d) => Object.values(d.setMastery).some(s => s.masteredCards >= s.totalCards && s.totalCards > 0) },
  { id: "xp-1000", name: "Thousand Club", description: "Earn 1000 XP", icon: "⭐",
    check: (d) => d.xp >= 1000 },
  { id: "level-5", name: "Rising Star", description: "Reach level 5", icon: "🌟",
    check: (d) => d.level >= 5 },
];

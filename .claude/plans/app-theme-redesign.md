# Linguify — Mobile App Reference Theme Redesign

## 1. Design System / Style Guide

### Colors
```
┌─────────────────────────────────────────────────────────┐
│  Background    #FAFAF9  ████████████████████████████      │
│  Surface       #FFFFFF  ████████████████████████████      │
│  Card Bg       #F9F8F6  ████████████████████████████      │
│                                                         │
│  Accent 400    #FBBF24  ██████████████  (amber-400)      │
│  Accent 500    #F59E0B  ██████████████  (amber-500)      │
│  Accent 600    #D97706  ████████████    (amber-600)      │
│  Accent 700    #92400E  ██████████      (amber-700)      │
│                                                         │
│  Text Primary  #1C1917  ████████████████████████████      │
│  Text Second   #57534E  ████████████████████████████      │
│  Text Muted    #A8A29E  ████████████████████████████      │
│                                                         │
│  Success       #16A34A  ████████████                      │
│  Error         #DC2626  ████████████                      │
│  Warning       #D97706  ████████████                      │
└─────────────────────────────────────────────────────────┘
```

### Typography
```
┌──────────────────────────────────────────────────────┐
│  H1 (Hero)       Geist Bold   40-56px   -0.02em     │
│  H2 (Section)    Geist Bold   28-36px   -0.015em    │
│  H3 (Card Title) Geist Semibold 18-20px -0.01em    │
│  Body            Geist Regular 14-16px  0          │
│  Caption         Geist Medium  12px     0          │
│  Small           Geist Regular 10-11px  0          │
└──────────────────────────────────────────────────────┘
```

### Spacing Scale
```
┌──────────────────────────────────┐
│  xs:  4px    sm:  8px           │
│  md:  12px   lg:  16px          │
│  xl:  24px   2xl: 32px          │
│  3xl: 48px   4xl: 64px          │
└──────────────────────────────────┘
```

### Component Tokens
| Component | Radius | Padding | Shadow |
|---|---|---|---|
| Card (glass) | 16px | 20px | 0 1px 3px rgba(0,0,0,0.04) |
| Card (flat) | 12px | 16px | none, border: 1px solid rgba(0,0,0,0.06) |
| Button (primary) | 12px | 10px 24px | 0 2px 8px rgba(217,119,6,0.25) |
| Button (ghost) | 12px | 10px 16px | none |
| Input | 14px | 10px 16px | focus: 0 0 0 3px rgba(217,119,6,0.14) |
| Badge | 999px | 4px 10px | none |
| Banner | 16px | 24px | 0 2px 12px rgba(0,0,0,0.06) |

---

## 2. Site Map — Current → Redesigned

```
BEFORE                         AFTER
─────────────────────────────────────────────────
Homepage                       Homepage
├─ Hero (text + CTA)          ├─ Greeting Banner (user name, upcoming event)
├─ Calendar + Challenge       ├─ Quick Stats Row (streak, minutes, words)
├─ 6 Domain Cards             ├─ "Top Scenarios" Course Cards (6 cards)
├─ 2 Feature Links            ├─ Filter Bar (All / Popular / Newest)
└─ Footer                     ├─ Calendar Widget (compact)
                              └─ Footer

Agent Page                     Scenario Detail Page
├─ 6 Domain Cards             ├─ Scenario Header (icon, title, duration, students)
├─ Chat Panel                 ├─ "About" Description
└─ Input                      ├─ Lesson List (timestamps, titles)
                              ├─ CTA: "Start Practice"
                              └─ Chat Panel (collapsible)

Skill Page                     Coach Page
├─ Daily Prompt               ├─ Greeting "Hi [name]!"
├─ Level Badges               ├─ Level Cards (Grammar B1, Vocab B2...)
├─ Mode Selector              ├─ Daily Prompt Card
├─ Chat Panel                 ├─ Mode Pills
└─ Input                      ├─ Chat Panel
                              └─ Input

Dashboard → Dashboard (same, restyled)
Flashcards → Flashcards (same, restyled)
Voice → Voice (same, restyled)
Translate → Translate (same, restyled)
```

---

## 3. Wireframes

### 3a. Homepage

```
┌──────────────────────────────────────────────────────────┐
│ [L] LINGUIFY      Home Coach Practice Progress ...       │  ← Navbar
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 👋 Hi, [User]!                          🔔       │   │  ← Greeting Banner
│  │ English class starting in 30 min — ready?        │   │
│  │                          [Start Practicing →]    │   │  ← CTA Button
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ 🔥 7 Day │ │ 📚 156   │ │ ⏱️ 45min │ │ 🎯 B1    │  │  ← Quick Stats
│  │  Streak  │ │  Words   │ │  Today   │ │  Level   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                          │
│  Top Scenarios                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ [All] [Pop] │ │ [New]       │               │       │  ← Filter Pills
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │🍽️        │ │🏨        │ │🚂        │                │
│  │Restaurant│ │Hotel     │ │Train     │                │  ← Course Cards
│  │3,836 dial│ │3,369 dial│ │2,963 dial│                │
│  │⭐ 4.8    │ │⭐ 4.6    │ │⭐ 4.7    │                │
│  │Free      │ │Free      │ │Free      │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │🎭        │ │🚕        │ │🏥        │                │
│  │Attract   │ │Taxi      │ │Hospital  │                │
│  │2,681 dial│ │1,463 dial│ │107 dial  │                │
│  │⭐ 4.5    │ │⭐ 4.4    │ │⭐ 4.2    │                │
│  │Free      │ │Free      │ │Free      │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ 📖 English Coach │  │ 🏙️ Practice Coach│            │  ← Quick Links
│  └──────────────────┘  └──────────────────┘            │
│                                                          │
│  Powered by MultiWOZ 2.2 · 8,437 dialogues              │  ← Footer
└──────────────────────────────────────────────────────────┘
```

### 3b. Course Card Component (Detail)

```
┌─────────────────────┐
│ 🍽️                  │  ← Large emoji icon
│                     │
│ Restaurant          │  ← Title (Geist Semibold 18px)
│ 3,836 dialogues     │  ← Caption (text-muted)
│                     │
│ ⭐ 4.8              │  ← Rating
│ Free / Free         │  ← Price badge
│                     │
│ ┌─────────────────┐ │
│ │   View Details → │ │  ← CTA on hover
│ └─────────────────┘ │
└─────────────────────┘
```

### 3c. Scenario Detail Page (NEW — /scenario/[domain])

```
┌──────────────────────────────────────────────────────────┐
│ [L] LINGUIFY      Home Coach ...                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ← Back to Scenarios                                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │         🍽️  Restaurant                          │   │  ← Header
│  │     Real-World English Practice                  │   │
│  │                                                  │   │
│  │  ⏱️ 5-10 min   📝 3,836 dialogues                │   │  ← Meta
│  │  👥 12,450 students   🌐 English subtitles       │   │
│  │  ⭐ 4.8 (2.3k reviews)                           │   │
│  │                                                  │   │
│  │  [Start Practice]  [Save for Later]              │   │  ← CTAs
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  About                                                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Practice ordering food, booking tables, and       │   │
│  │ finding restaurants by cuisine, price range,      │   │  ← Description
│  │ and location — using real Cambridge dialogues.    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Lessons                                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ▶ 1. Ordering at a Café         5 min    ○       │   │
│  │ ▶ 2. Asking for the Menu        8 min    ○       │   │
│  │ ▶ 3. Dietary Requirements       6 min    ○       │   │  ← Lesson List
│  │ ▶ 4. Making a Reservation      10 min    ○       │   │
│  │ ▶ 5. Paying the Bill            4 min    ○       │   │
│  │ ▶ 6. Complaining Politely       7 min    ○       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  You Might Also Like                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │🏨 Hotel  │ │🚂 Train  │ │🎭 Attr.  │                │  ← Related
│  └──────────┘ └──────────┘ └──────────┘                │
└──────────────────────────────────────────────────────────┘
```

### 3d. Greeting Banner Component

```
┌──────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────────┐   │
│ │                                                    │   │
│ │  👋  Hi, Sarah!                        🔔 [3]      │   │
│ │                                                    │   │
│ │  Your English class starts in 30 minutes.          │   │
│ │  You're on a 7-day streak! 🔥                      │   │
│ │                                                    │   │
│ │  ┌──────────────────┐   ┌──────────────────┐      │   │
│ │  │ Start Practicing │   │   View Progress  │      │   │
│ │  └──────────────────┘   └──────────────────┘      │   │
│ │                                                    │   │
│ └────────────────────────────────────────────────────┘   │
│  Background: gradient from accent-400/10 to white        │
│  Border: 1px solid accent-200/40                         │
│  Radius: 16px  Padding: 24px                             │
└──────────────────────────────────────────────────────────┘
```

### 3e. Quick Stats Row

```
┌──────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │    🔥    │  │    📚    │  │    ⏱️    │  │    🎯    ││
│  │    7     │  │   156    │  │  45min   │  │    B1    ││
│  │  Streak  │  │  Words   │  │  Today   │  │  Level   ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                          │
│  Each: bg-white/80, rounded-xl, p-4, text-center         │
│  Value: accent gradient text, 24px bold                  │
│  Label: text-muted, 11px                                 │
└──────────────────────────────────────────────────────────┘
```

### 3f. Filter Bar

```
┌──────────────────────────────────────────────────────────┐
│  Top Scenarios                                           │
│                                                          │
│  [ All Scenarios ] [ Popular ] [ Newest ] [ A1-A2 ] [ B1-B2 ] [ C1-C2 ]
│     ^active                                          │
│                                                          │
│  Active: bg-amber-500 text-white rounded-full            │
│  Inactive: glass pill, text-text-secondary               │
│  Height: 36px, gap: 8px, scroll-x on mobile              │
└──────────────────────────────────────────────────────────┘
```

### 3g. Lesson List Item

```
┌──────────────────────────────────────────────────────────┐
│  ▶ 1.  Ordering at a Café                               │
│       ______________________________________  5 min  ○   │
│                                                          │
│  Row layout: [play icon] [number. title] [duration] [check] │
│  Hover: bg-amber-50/50, rounded-lg                        │
│  Completed: check icon green, title muted                 │
│  Locked: lock icon, title muted, no hover                 │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Component Library — Reusable Specs

### `<GreetingBanner>`
```tsx
Props: {
  userName?: string;
  streak?: number;
  upcomingEvent?: { title: string; time: string };
  onStartPractice?: () => void;
  onViewProgress?: () => void;
}
```
- Full-width card with gradient bg
- Avatar/emoji + greeting text
- Streak badge (animated fire)
- Upcoming event chip
- 2 CTA buttons
- Responsive: stacks vertically on mobile

### `<QuickStats>`
```tsx
Props: { stats: Array<{ icon: string; value: string; label: string }> }
```
- 4-column grid → 2-column on tablet → 2-column on mobile
- Each item: icon + large gradient number + small label

### `<FilterBar>`
```tsx
Props: {
  filters: string[];
  active: string;
  onChange: (filter: string) => void;
}
```
- Horizontal scrollable pill row
- Active pill: filled amber, white text
- Inactive: outline glass
- `overflow-x-auto` on mobile

### `<CourseCard>`
```tsx
Props: {
  icon: string;
  title: string;
  dialogues: number;
  rating: number;
  price: string;
  href: string;
  gradient: string;
}
```
- 280px min-width, flex-grow in grid
- Large icon + title + dialogue count + star rating + price badge
- Glass card with domain-specific gradient accent
- Hover: lift 4px, shadow increase
- Click → navigate to `/scenario/[domain]`

### `<ScenarioHeader>`
```tsx
Props: {
  icon: string;
  title: string;
  subtitle: string;
  meta: { duration: string; dialogues: string; students: string; subtitles: string };
  rating: { score: number; reviews: number };
}
```
- Full-width banner card
- Large icon + title + subtitle
- Meta chips row (duration, dialogues, etc.)
- Star rating with review count
- Two CTA buttons

### `<LessonList>`
```tsx
Props: { lessons: Array<{ id: number; title: string; duration: string; completed?: boolean }> }
```
- Vertical list with divider
- Each row: play icon → number → title → duration → status icon
- Hover state on incomplete rows
- Completed rows: green check, muted

---

## 5. New Route — `/scenario/[domain]`

### Why
Currently clicking a domain card immediately starts a chat. Users want to see what they're getting into first.

### Route structure
```
src/app/scenario/[domain]/page.tsx   ← Detail page (new)
src/app/scenario/page.tsx            ← Redirect to home (optional)
```

### Data
- GET `/api/scenarios?domain=restaurant` returns domain stats
- Uses existing `getDomains()` from multiwoz.ts
- Lesson list is static per domain (curated, not from dataset)

### API addition
Add `GET /api/scenarios?domain=<name>` that returns:
```json
{
  "domain": {
    "name": "restaurant",
    "label": "Restaurant",
    "icon": "🍽️",
    "description": "...",
    "dialogues": 3836,
    "rating": 4.8,
    "students": 12450
  },
  "lessons": [
    { "id": 1, "title": "Ordering at a Café", "duration": "5 min" },
    { "id": 2, "title": "Asking for the Menu", "duration": "8 min" },
    ...
  ]
}
```

---

## 6. Implementation Plan

### Phase 1 — Components (reusable)
1. Create `src/components/GreetingBanner.tsx`
2. Create `src/components/QuickStats.tsx`
3. Create `src/components/FilterBar.tsx`
4. Create `src/components/CourseCard.tsx`
5. Create `src/components/ScenarioHeader.tsx`
6. Create `src/components/LessonList.tsx`

### Phase 2 — Pages (views)
7. Redesign `src/app/page.tsx` (homepage)
8. Create `src/app/scenario/[domain]/page.tsx` (detail page)
9. Update API: add lesson data to scenarios route

### Phase 3 — Polish
10. Redesign `src/app/skill/page.tsx` with greeting banner + cleaner layout
11. Update Navigation if needed
12. Responsive testing

### Files Modified: 6 | Files Created: 7 | Total: 13 files

---

## 7. Responsive Breakpoints

```
Mobile (<640px)    sm:
  - Single column cards
  - Full-width banners
  - Filter bar scrolls horizontally
  - Stats: 2×2 grid
  - Nav: icons only

Tablet (640-1024px) md:
  - 2-column course cards
  - Stats: 4-column
  - Full nav labels

Desktop (>1024px)   lg:
  - 3-column course cards
  - Max width 1280px centered
  - Side padding 32px
```

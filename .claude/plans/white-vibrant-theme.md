# White + Vibrant Card Theme — Full Palette Spec

## Color Palette (all hex codes defined)

```
┌─────────────────────────────────────────────────────────────┐
│  BACKGROUND                                                   │
│  #FFFFFF  ████████████████████████████  Main background       │
│  #F5F5F5  ████████████████████████████  Section dividers      │
│  #FAFAFA  ████████████████████████████  Card hover bg         │
│                                                              │
│  TEXT                                                        │
│  #212121  ████████████████████████████  Headings              │
│  #616161  ████████████████████████████  Body text             │
│  #9E9E9E  ████████████████████████████  Muted/captions        │
│                                                              │
│  PRIMARY ACCENT                                              │
│  #1E88E5  ████████████████████████████  Buttons, links,       │
│                                         active states         │
│  #1565C0  ████████████████████████████  Button hover/focus    │
│  #42A5F5  ████████████████████████████  Light accent          │
│                                                              │
│  SCENARIO CARD ACCENTS (per domain)                          │
│  #FF7043  ████████████████████████████  Restaurant (coral)    │
│  #26A69A  ████████████████████████████  Hotel (teal)          │
│  #1E88E5  ████████████████████████████  Train (blue)          │
│  #8E24AA  ████████████████████████████  Attractions (purple)  │
│  #FB8C00  ████████████████████████████  Taxi (amber)          │
│  #43A047  ████████████████████████████  Hospital (green)      │
│                                                              │
│  STATUS/FEEDBACK                                             │
│  #43A047  ████████████████████████████  Success               │
│  #FB8C00  ████████████████████████████  Warning               │
│  #E53935  ████████████████████████████  Error                 │
│  #1E88E5  ████████████████████████████  Info                  │
└─────────────────────────────────────────────────────────────┘
```

## Card Design Spec

```
┌─────────────────────────┐
│                         │
│  ┌───┐                  │  ← Colored left border (4px) in domain accent
│  │ 🍽️│  Restaurant      │  ← Domain icon + title
│  │   │  3,836 dialogues  │
│  └───┘  ⭐ 4.8  Free     │
│                         │
│         [View Details →]│  ← Appears on hover
└─────────────────────────┘
│←─────── 280px ─────────→│

Card spec:
  Base:      bg-white, border border-gray-100, rounded-2xl
  Left bar:  4px wide colored border-left in domain accent
  Icon:      3rem colored circle (8% tint of domain accent)
  Title:     text-[#212121] font-bold
  Subtitle:  text-[#616161] text-xs
  Rating:    text-[#616161] text-[11px]
  Price:     text-green-600 font-medium
  Hover:     shadow-lg translate-y-[-2px] border colorizes
  Active:    ring-2 in domain accent color
```

## Homepage Hero Banner Spec

```
┌───────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Gradient: #1E88E5 → #1565C0 → #0D47A1                  │  │
│  │                                                         │  │
│  │  👋 Good morning, Learner!                              │  │
│  │  Ready to improve your English?                         │  │
│  │                                                         │  │
│  │  [Start Practicing]  [View Progress]                    │  │
│  │   ^filled white text  ^outlined white border            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Stats row:  🔥7  📚156  ⏱️45min  🎯B1                       │
│              ^white cards with #212121 text                   │
└───────────────────────────────────────────────────────────────┘
```

## Filter Button Spec

```
Active:    bg-[#1E88E5] text-white shadow-md shadow-blue-500/20
Inactive:  bg-white border border-gray-200 text-[#616161]
           hover: border-[#1E88E5]/30 bg-blue-50
```

## Scenario Detail Page Spec

```
Header banner:
  Gradient in domain accent (e.g., coral for restaurant)
  White text overlay
  Large domain icon
  Meta chips in white/80 glass

About:    white card with gray border
Lessons:  white card, active lesson has domain-accent left border
Related:  3 course cards in grid
```

## Typography Spec

```
H1 (Hero)       Geist Bold   40-56px    #FFFFFF (on accent bg) / #212121
H2 (Section)    Geist Bold   28-36px    #212121
H3 (Card Title) Geist Semibold 18px    #212121
Body            Geist Regular 14-16px  #616161
Caption         Geist Medium  12px     #9E9E9E
Small           Geist Regular 10-11px  #9E9E9E
Link            Geist Medium  14px     #1E88E5
```

## Files to Modify (20 files)

| # | File | Key Changes |
|---|---|---|
| 1 | globals.css | Complete theme token rewrite (white bg, blue accent, domain card colors) |
| 2 | layout.tsx | bg-white instead of bg-[#121212], remove dark class |
| 3 | Navbar.tsx | White nav glass, blue accent logo/links, gray border |
| 4 | GreetingBanner.tsx | Blue gradient banner, white text, white buttons |
| 5 | QuickStats.tsx | White cards, #212121 text, blue gradient values |
| 6 | FilterBar.tsx | Blue active pill, white outlined inactive |
| 7 | CourseCard.tsx | White base, colored left border per domain, gray text |
| 8 | ChatPanel.tsx | White/light gray bubbles, blue stream cursor |
| 9 | PracticeCard.tsx | White card, blue active ring |
| 10 | Calendar.tsx | Blue today highlight, gray hover |
| 11 | ScenarioHeader.tsx | Domain-colored gradient banner, white text |
| 12 | LessonList.tsx | White rows, domain-colored status icons |
| 13 | page.tsx | Hero banner, white-background stats, colored cards |
| 14 | skill/page.tsx | White layout, blue accents |
| 15 | agent/page.tsx | Domain-colored domain cards |
| 16 | dashboard/page.tsx | White stat cards, blue progress bars |
| 17 | flashcards/page.tsx | White cards, blue flipped state |
| 18 | voice/page.tsx | Blue mic button |
| 19 | translate/page.tsx | White cards, blue highlights |
| 20 | scenario/[domain]/page.tsx | Domain-colored header, white content |

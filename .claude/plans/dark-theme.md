# Dark+Vibrant Accent Palette — Full Site Migration

## Palette Mapping

| Role | Old (Warm White) | New (Dark Vibrant) |
|---|---|---|
| Main BG | #FAFAF9 | #121212 |
| Surface/Cards | #FFFFFF 75% glass | #1E1E1E glass |
| Primary Accent | #F59E0B / #D97706 (amber) | #1E88E5 (blue) |
| Secondary 1 | — | #26A69A (teal) |
| Secondary 2 | — | #8E24AA (purple) |
| Headings | #1C1917 | #FFFFFF |
| Body Text | #57534E | #B0BEC5 |
| Muted Text | #A8A29E | #78909C |
| Border | rgba(0,0,0,0.06) | rgba(255,255,255,0.08) |
| Glass Bg | white/75 → white/82 | #1E1E1E/75 → #1E1E1E/85 |
| Button Gradient | amber→amber→brown | blue→blue→teal |
| Loading Dots | amber-400/500/600 | blue-500 (primary), teal-500 (secondary), purple-500 (tertiary) |
| Gradients | amber-based warm | blue/teal/purple vibrant |
| Domain Cards | earthy terracotta/slate/olive... | vibrant per-domain tints using accent colors |

## Files to Modify (20)

1. **globals.css** — Full CSS variable rewrite + all utility classes
2. **layout.tsx** — Body background class
3-10. **8 component files**: Navbar, ChatPanel, PracticeCard, Calendar, GreetingBanner, QuickStats, FilterBar, CourseCard, ScenarioHeader, LessonList  
11-17. **7 page files**: home, skill, agent, dashboard, flashcards, voice, translate, scenario/[domain]

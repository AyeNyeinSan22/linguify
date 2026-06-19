# Plan: White Primary + Authentic Warm Colors Theme

## New Color Palette

| Role | Old (Purple/Indigo) | New (Warm/Authentic) |
|---|---|---|
| **Background** | `#faf9fb` (purple-tinted) | `#fafaf9` (warm white) |
| **Card glass** | Purple-tinted glass | Warm cream glass: `bg-white/75` |
| **Accent** | Purple `#7c3aed` | Amber `#d97706` |
| **Accent light** | Indigo `#4f46e5` | Gold `#f59e0b` |
| **Accent warm** | Blue `#3b82f6` | Warm slate `#78716c` |
| **Gradient** | Purple→Indigo→Blue | Amber→Gold→Sand |
| **Glow** | Purple glow | Warm amber glow |
| **Text accent** | `text-purple-600` | `text-amber-700` |
| **Badges** | Purple tinted | Warm beige tinted |
| **Cards hover** | Purple ring | Amber/gold ring |
| **Loading dots** | Purple/indigo/blue | Amber/gold/warm |
| **Domain cards** | Blue/indigo/purple tints | Terracotta, olive, slate, amber — authentic earthy colors |
| **Gradient text** | Purple→Blue gradient | Amber→Gold warm gradient |

## Domain Cards — Authentic Natural Colors
Each MultiWOZ domain gets a warm, earthy color:

| Domain | Old | New Authentic Color |
|---|---|---|
| Restaurant | orange tint | terracotta/warm red `from-red-800/5 to-orange-700/5` |
| Hotel | blue/indigo tint | warm navy/slate `from-slate-700/5 to-stone-600/5` |
| Train | emerald tint | olive/sage `from-green-800/5 to-emerald-700/5` |
| Attractions | pink tint | warm rose/plum `from-rose-800/5 to-fuchsia-700/5` |
| Taxi | yellow tint | amber/gold `from-amber-700/5 to-yellow-600/5` |
| Hospital | red tint | warm coral/brick `from-red-800/5 to-orange-700/5` |

## Files to Modify (12 files)

1. **globals.css** — New CSS variables, gradients, glow, glass, buttons, blobs, pills, bubbles, cursor
2. **Navbar.tsx** — Logo gradient, active link color, underline gradient
3. **page.tsx** — Domain card gradients/rings, badge colors, links
4. **agent/page.tsx** — Domain card gradients/rings, badge, ring colors, loading dots
5. **skill/page.tsx** — Badge colors, badge texts, border colors, links
6. **dashboard/page.tsx** — Loading dots, level badges, progress bars, vocab pills, link colors
7. **flashcards/page.tsx** — Loading dots, stats color, card bg, topic badge, skip link
8. **translate/page.tsx** — Translation bg, vocab pills, hover color
9. **voice/page.tsx** — Loading dots, mic button gradient
10. **ChatPanel.tsx** — Loading dots
11. **PracticeCard.tsx** — Ring color, link color
12. **Calendar.tsx** — Hover, today highlight, selected bg

## What stays
- All Tailwind utility classes that don't reference purple/indigo/blue
- All structural code (zero logic changes)
- White/cream base backgrounds already established
- Monochrome text colors (text-primary, text-secondary, text-muted)

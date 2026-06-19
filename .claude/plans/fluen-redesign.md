# Plan: Fluen-Style UI Redesign for Linguify

## Design System — Fluen AI Inspired

| Token | Value |
|---|---|
| **Primary** | Purple-violet gradient: `#7c3aed` → `#4f46e5` → `#3b82f6` |
| **Surface** | White glass cards with `backdrop-filter: blur(16px)` |
| **Background** | Subtle warm gray: `#faf9fb` (light mode), `#0c0a14` (dark) |
| **Accent** | Soft indigo glow shadows, gradient text on headlines |
| **Radius** | `rounded-2xl` / `rounded-3xl` (16-24px) |
| **Typography** | Geist (already loaded), tighter letter-spacing on headings |
| **Spacing** | Generous — `py-20+` hero, `gap-8` between sections |
| **Cards** | Glassmorphism: `bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl shadow-purple-500/5` |

## Files to Modify (8 files)

### 1. `src/app/globals.css`
Full theme refresh:
- Custom CSS properties for purple/blue palette
- Gradient utility classes
- Glass card utility class
- Glow shadow utilities
- Smooth scroll, anti-alias
- Animated gradient background for hero
- Button animation utilities

### 2. `src/app/layout.tsx`
- Add `Inter` or keep `Geist` but improve font-smoothing
- Gradient background on body (subtle radial gradient)
- Add viewport meta for better mobile

### 3. `src/components/Navbar.tsx`
- Purple gradient background with glassmorphism
- Logo mark: gradient purple circle with "L"
- Active links: gradient underline animation
- Softer border-b replaced with shadow

### 4. `src/app/page.tsx` (Home)
- Hero: Large gradient heading, animated badge, purple glow CTA
- Feature cards: Glassmorphism cards with gradient icon circles, hover scale + glow
- Purple gradient background element (blurred circle decoration)

### 5. `src/components/PracticeCard.tsx`
- Larger rounded cards with glass effect
- Active state: purple gradient border ring + subtle glow
- Gradient icon background circle
- Smooth scale transition on hover

### 6. `src/components/ChatPanel.tsx`
- Glassmorphism container with purple-tinted backdrop
- User messages: purple gradient bubble (right-aligned)
- Coach messages: soft white/glass bubble (left-aligned)
- Streaming cursor: purple pulse
- Smoother scroll, rounded corners

### 7. `src/app/skill/page.tsx` (English Coach)
- Header: gradient icon + title
- Mode selector: glass pill buttons with gradient active state
- Session badge: purple glow dot + glass
- Input: glass input with gradient focus ring
- Send button: gradient purple with glow hover
- Details section: glass card

### 8. `src/app/agent/page.tsx` (Practice Coach)
- Same glass/theme treatment as skill page
- Scenario picker: 3 gradient cards with icon circles
- Goal badge: purple gradient accent
- Chat + input matching skill page style
- Details section: glass card

## Approach
- **No new dependencies** — Tailwind-only, leveraging arbitrary values and CSS custom properties
- **Dark mode preserved** — All styles get dark variants with deeper purple tones
- **Zero API changes** — Visual-only, no logic touched
- **Mobile responsive** — Existing breakpoints kept, enhanced

## Order of Work
1. globals.css (theme foundation)
2. layout.tsx (background)
3. Navbar
4. PracticeCard + ChatPanel (shared components)
5. page.tsx (home)
6. skill/page.tsx + agent/page.tsx (feature pages)
7. Visual smoke test — run dev and verify all pages

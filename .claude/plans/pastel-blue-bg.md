# Plan: Pastel Blue Background + White Cards

## Color Palette Update

### Background
| Token | Before | After |
|---|---|---|
| Main BG | `#FFFFFF` | `#E3F2FD` (pastel blue) |
| Body::before blobs | blue radial at 3%/2% | deeper blue/purple tints at 4%/3% for depth |
| Nav glass | `rgba(255,255,255,0.88)` | `rgba(227,242,253,0.92)` |

### What stays white (for contrast)
- All `.glass` cards → remain `rgba(255,255,255,0.92)`
- Chat bubbles → remain white/light gray
- Inputs → remain white
- Filter pills (inactive) → remain white

### What gets adjusted
- Nav background slightly tinted to match
- Body::before blobs deeper for visibility
- `bg-card-hover` → stays `#FAFAFA`

## Mockup — Homepage

```
┌──────────────────────────────────────────────────────────────┐
│  Background: #E3F2FD (soft pastel blue)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🔵🔵🔵 NAV BAR (blue-tinted glass)                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ████████████████████████████████████████████████████████│ │
│  │ ██  👋 Good morning, Learner!  [Start] [Progress]  ████│ │
│  │ ██  Blue gradient hero banner •••••••••••••••••••• ████│ │
│  │ ████████████████████████████████████████████████████████│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│  │🟠  7 │ │🟢 156│ │🔵 45 │ │🟣 B1 │  ← WHITE cards        │
│  │Streak│ │Words │ │Msgs  │ │Level │     contrast pop       │
│  └──────┘ └──────┘ └──────┘ └──────┘                      │
│                                                              │
│  Top Scenarios                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐                                │
│  │🟠    │ │🟢    │ │🔵    │  ← WHITE with colored borders   │
│  │Rest. │ │Hotel │ │Train │     stand out clearly            │
│  └──────┘ └──────┘ └──────┘                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Files to Modify (2)

| File | Change |
|---|---|
| `src/app/globals.css` | `--bg-root: #E3F2FD`, adjust blobs, nav tint |
| `src/app/layout.tsx` | `bg-[#E3F2FD]` instead of `bg-white` |

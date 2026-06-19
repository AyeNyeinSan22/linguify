# Plan: English Coach — Tier 1 & Tier 2 Complete

## Overview
6 features across 2 tiers, all built on the existing Linguify stack (Next.js + Anthropic Claude + in-memory/file-based storage).

---

## Tier 1 — Foundational Improvements

### 1A. Error History & Progress Dashboard
**Files to create:**
- `src/lib/progress-store.ts` — file-based JSON storage for coaching history
- `src/app/api/progress/route.ts` — GET stats, POST new entry  
- `src/app/dashboard/page.tsx` — full dashboard page
- `src/components/StatsCard.tsx` — reusable stat card component

**Files to modify:**
- `src/app/api/coach/route.ts` — auto-log each coaching interaction
- `src/components/Navbar.tsx` — add Dashboard link

**What it shows:**
- Total sessions, messages sent, corrections received
- Top 5 recurring grammar mistakes (parsed from Claude responses)
- Vocabulary words learned
- Writing stats: avg sentence length, complexity trend
- Mastery scores per grammar topic (0-100%)
- Mini timeline of recent activity

### 1B. Daily Writing Prompts
**Files to create:**
- `src/lib/prompts.ts` — 90+ curated prompts organized by level (A1-C2) and category
- `src/app/api/prompts/route.ts` — GET today's prompt (rotates daily by date index)

**Files to modify:**
- `src/app/skill/page.tsx` — add "Daily Prompt" card at top when no active chat

**How it works:**
- Daily rotation: prompt index = (days since epoch) % total prompts
- User sees prompt card → clicks "Write" → switches to writing mode with prompt pre-filled
- Streak counter in localStorage (how many consecutive days)
- Prompt history: last 7 days visible as mini-cards

### 1C. Level-Aware Coaching
**Files to create:**
- `src/lib/level-store.ts` — CEFR level tracking per mode

**Files to modify:**
- `src/app/api/coach/route.ts` — level assessment system prompt + adaptive difficulty
- `src/app/skill/page.tsx` — level badge display

**How it works:**
- After 3+ user messages, Claude assesses CEFR level (A1-C2) for each mode
- System prompt adjusted: simpler explanations for A1-A2, nuanced feedback for B2-C1
- Level shows as badge: "Grammar: B1 · Vocabulary: B2 · Writing: A2"
- Level auto-updates every 10 messages

---

## Tier 2 — Deeper Engagement

### 2A. Mistake-to-Flashcard Pipeline (Spaced Repetition)
**Files to create:**
- `src/lib/flashcard-engine.ts` — SM-2 spaced repetition algorithm + card extraction from coaching
- `src/app/api/flashcards/route.ts` — GET due cards, POST review result, POST generate from session
- `src/app/flashcards/page.tsx` — flashcard review interface
- `src/components/FlashcardView.tsx` — animated flip card component

**Files to modify:**
- `src/app/api/coach/route.ts` — auto-generate flashcards after coaching responses
- `src/components/Navbar.tsx` — add Flashcards link with due-count badge

**SM-2 Algorithm:**
- Quality ratings: 0 (complete blackout) to 5 (perfect)
- Intervals: 1 day → 3 days → 7 days → 30 days → 90 days
- Ease factor starts at 2.5, adjusts based on performance
- Cards stored in localStorage, keyed by card ID

**Card structure:**
```
{ id, front: "original sentence", back: "correction + rule + example",
  topic: "past-tense", mode: "grammar", created: timestamp,
  interval: 0, repetitions: 0, easeFactor: 2.5, nextReview: now }
```

### 2B. Voice Coach
**Files to create:**
- `src/app/voice/page.tsx` — voice practice page
- `src/components/VoiceRecorder.tsx` — Web Speech API recorder/transcriber

**Files to modify:**
- `src/app/api/coach/route.ts` — add "voice" mode with pronunciation-focused system prompt
- `src/components/Navbar.tsx` — add Voice link

**How it works:**
- Uses browser SpeechRecognition API (Web Speech API, no external deps)
- User taps mic → speaks → transcription appears
- Transcription sent to coach API in "voice" mode
- Claude gives feedback focused on: fluency, filler words, vocabulary range, grammar
- SpeechSynthesis reads corrections aloud (optional, tappable)

### 2C. Translation Coach
**Files to create:**
- `src/app/translate/page.tsx` — translation practice page
- `src/app/api/translate/route.ts` — Claude-powered translation comparison

**Files to modify:**
- `src/components/Navbar.tsx` — add Translate link

**How it works:**
- User selects their native language from a list
- Types text in native language
- Writes their own English translation attempt
- Claude provides: natural translation, comparison with user's attempt, notes on idiomatic differences, key vocabulary
- Side-by-side view: Your Translation | Natural English | Notes

---

## Navbar Reorganization
```
[L] Linguify  |  Home  Coach  Practice  Dashboard  Flashcards  Voice  Translate
```
Compact on mobile — wraps or uses icons. Flashcards gets a red badge showing due count.

## File Summary

| File | Action | Lines (est) |
|---|---|---|
| `src/lib/progress-store.ts` | Create | 80 |
| `src/lib/prompts.ts` | Create | 150 |
| `src/lib/level-store.ts` | Create | 40 |
| `src/lib/flashcard-engine.ts` | Create | 120 |
| `src/app/api/progress/route.ts` | Create | 60 |
| `src/app/api/prompts/route.ts` | Create | 40 |
| `src/app/api/flashcards/route.ts` | Create | 80 |
| `src/app/api/translate/route.ts` | Create | 80 |
| `src/app/dashboard/page.tsx` | Create | 120 |
| `src/app/flashcards/page.tsx` | Create | 130 |
| `src/app/voice/page.tsx` | Create | 120 |
| `src/app/translate/page.tsx` | Create | 130 |
| `src/components/StatsCard.tsx` | Create | 30 |
| `src/components/FlashcardView.tsx` | Create | 70 |
| `src/components/VoiceRecorder.tsx` | Create | 80 |
| `src/app/api/coach/route.ts` | Modify | +50 |
| `src/app/skill/page.tsx` | Modify | +50 |
| `src/components/Navbar.tsx` | Modify | +10 |
| **Total** | **18 files** | **~1,440 lines** |

## Implementation Order
1. Progress store + progress API + dashboard page + Navbar link
2. Prompts bank + prompts API + skill page prompt card
3. Level store + adaptive coaching + level badges
4. Flashcard engine + flashcard API + flashcards page + auto-generation + Navbar
5. Voice page + voice recorder component + voice mode in coach
6. Translate page + translate API
7. Smoke test all 7 pages

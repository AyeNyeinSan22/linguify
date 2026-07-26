# Linguify

An AI-powered English language learning platform with real-world conversation practice, spaced-repetition flashcards, and CEFR-aligned vocabulary sets.

Built with **Next.js 16**, **React 19**, **Tailwind CSS 4**, and **Groq (Llama 3.3 70B)**.

**Live demo:** [https://linguify-eta.vercel.app](https://linguify-eta.vercel.app)

---

## Screenshots

| Home | AI Coach |
|:---:|:---:|
| <img src="public/images/home.png" width="500" length="800"> | <img src="public/images/coach.png" width="500" length="800"> |

| Practice Coach | Flashcards |
|:---:|:---:|
| <img src="public/images/practice.png" width="500" length="800"> | <img src="public/images/flashcards.png" width="500" length="800"> |

| Translation | Voice Coach |
|:---:|:---:|
| <img src="public/images/translate.png" width="500" length="800"> | <img src="public/images/voicecoach.png" width="500" length="800"> |
---

## Features

### AI English Coach
Three coaching modes — **Grammar**, **Vocabulary**, and **Writing** — with real-time streaming feedback. The AI analyzes your input and provides structured corrections, explanations, example sentences, and practice exercises. Coaching responses automatically generate flashcards for review.

### Conversation Practice
Real-world role-play scenarios powered by the **MultiWOZ 2.2** dataset — 8,437 authentic Cambridge, UK dialogues across 6 domains:

- 🍽️ **Restaurant** — order food, book tables
- 🏨 **Hotel** — book rooms, check amenities
- 🚂 **Train** — check schedules, find routes
- 🎭 **Attractions** — find museums, parks
- 🚕 **Taxi** — book rides, give directions
- 🏥 **Hospital** — describe symptoms, make appointments

Each domain has 5–7 lessons with scenario-based practice.

### Translation Coach
Write in your native language, get an instant English translation, then compare your own attempt with AI coaching feedback. Supports **18 native languages** including Burmese, Spanish, French, German, Japanese, Korean, Chinese, Arabic, and more.

- **Auto-translate** — debounced translation as you type
- **Compare & Learn** — fluency score, nuance analysis, vocabulary highlights, and pro tips
- **Listen** — browser text-to-speech for natural translations
- **Sample phrases** — one-click starters in Burmese, Spanish, French, Japanese, and German

### Voice Coach
Speak or upload audio and receive warm, personalised English coaching on pronunciation, grammar, and fluency.

- **Record live** — browser SpeechRecognition for quick spoken input
- **Upload audio** — drag-and-drop MP3, M4A, WAV, WEBM, OGG, FLAC, or AAC (up to 25 MB)
- **Groq Whisper ASR** — accurate transcription for uploaded files
- **Incremental TTS** — sentence-level streaming and audio queuing for ultra-low latency playback (~2s start)
- **VoiVoice TTS** — high-performance direct audio streaming (GET) with browser TTS fallback
- **Playback controls** — pause, resume, or stop coach voice while feedback is playing

### Spaced Repetition Flashcards
A full **SM-2 spaced repetition** engine for efficient vocabulary retention:

- Flip-card UI with 4 quality ratings (Forgot / Hard / Good / Easy)
- Cards auto-generated from coaching sessions
- Manual card creation and bulk import
- Source filtering (Coaching, Manual, AI, Sets)

### CEFR Vocabulary Sets
**18 curated vocabulary sets** across all CEFR levels (A1–C2), 20 words each — 360 words total:

| Level | Sets |
|-------|------|
| A1 | Daily Life, Greetings, Food |
| A2 | Travel, Shopping, Weather |
| B1 | Work, Health, Education |
| B2 | Technology, Environment, Media |
| C1 | Politics, Science, Arts |
| C2 | Philosophy, Law, Idioms |

Each word includes definition, example sentence, part of speech, and IPA phonetic transcription. Browse sets, add them to your deck, and study with spaced repetition.

### AI Card Generation
Generate vocabulary flashcards on any topic at any CEFR level using AI. Also supports bulk import via CSV-like text format.

### Gamification
- **XP system** — earn points per flashcard review (10–15 XP, streak bonuses)
- **10 levels** — progress from Level 1 (0 XP) to Level 10 (12,000 XP)
- **8 achievements** — First Card, Century, Week Warrior, Sharpshooter, Set Scholar, and more
- **Streak tracking** — consecutive days of activity
- **Mastery indicators** — circular progress rings per vocabulary set

### Progress Dashboard
Track your learning journey with:

- Session and message counts
- Day streak
- CEFR level per mode (grammar / vocabulary / writing)
- Common mistakes analysis
- Per-topic mastery scores
- Writing statistics
- Vocabulary word cloud
- Recent activity log

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| AI | Groq SDK (Llama 3.3 70B Versatile) |
| Speech | Groq Whisper (ASR), VoiVoice TTS (via VibeCode proxy) |
| Dataset | MultiWOZ 2.2 (8,437 dialogues) |
| Testing | Playwright |
| Fonts | Geist Sans + Geist Mono |
| MCP | Model Context Protocol SDK |

---

## Getting Started

### Prerequisites
- Node.js 18+


### Installation

```bash
git clone https://github.com/AyeNyeinSan22/linguify.git
cd linguify
npm install
```

### Environment

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `GROQ_API_KEY` | Optional | AI coaching, translation, Whisper ASR |

Without API keys, the app falls back to simulated coaching responses and browser speech APIs.

### Run

```bash
npm run dev          # Development server → http://localhost:3000
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run test:e2e     # Playwright end-to-end tests
npm run test:e2e:ui  # Playwright interactive UI mode
```

---

## Testing

End-to-end tests use [Playwright](https://playwright.dev/) and cover page smoke tests plus Voice Coach playback controls (pause, resume, stop).

```bash
npm run test:e2e
```

Tests mock browser speech APIs and backend routes so they run without a microphone or live API keys. The config reuses an existing dev server on port 3000 when available.

---

## Project Structure

```
linguify/
├── data/
│   ├── progress.json              # Server-side progress persistence
│   └── vocab-sets/                # 18 CEFR vocabulary sets (JSON)
│       ├── index.json             # Set manifest
│       ├── a1-daily-life.json     # 20 words per set
│       └── ...
├── e2e/
│   ├── smoke.spec.ts              # Page load smoke tests
│   ├── voice-coach.spec.ts        # Voice Coach playback control tests
│   └── helpers/
│       └── mock-browser-apis.ts   # Speech API + route mocks
├── mcp-servers/
│   ├── skill-server.js            # MCP: English coaching tools
│   └── agent-server.js            # MCP: Practice coaching tools
├── playwright.config.ts
└── src/
    ├── app/
    │   ├── page.tsx               # Home — greeting, scenarios, quick actions
    │   ├── skill/page.tsx         # AI Coach — grammar/vocab/writing
    │   ├── agent/page.tsx         # Practice — MultiWOZ role-play
    │   ├── flashcards/
    │   │   ├── page.tsx           # Flashcard review hub
    │   │   ├── sets/page.tsx      # Vocabulary sets browser
    │   │   ├── sets/[setId]/      # Set detail + study
    │   │   └── my-cards/page.tsx  # Personal card management
    │   ├── translate/page.tsx     # Translation coach
    │   ├── voice/page.tsx         # Voice coach — record, upload, TTS playback
    │   ├── dashboard/page.tsx     # Progress dashboard
    │   ├── scenario/[domain]/     # Scenario detail + practice
    │   └── api/
    │       ├── coach/             # POST — AI coaching (SSE streaming)
    │       ├── practice/          # POST — Practice sessions
    │       ├── flashcards/        # POST — generate, review, AI, bulk import
    │       ├── vocab-sets/        # GET — browse vocabulary sets
    │       ├── progress/          # GET — user progress data
    │       ├── prompts/           # GET — daily writing prompts
    │       ├── scenarios/         # GET/POST — MultiWOZ scenarios
    │       ├── translate/         # POST — translation coaching
    │       ├── tts/               # POST — Text-to-Speech (VoiVoice)
    │       └── asr/               # POST — Speech Recognition (Groq Whisper / VoiVoice)
    ├── components/
    │   ├── Navbar.tsx             # Navigation with flashcard badge
    │   ├── ChatPanel.tsx          # Reusable chat interface
    │   ├── GreetingBanner.tsx     # Hero with streak/level
    │   ├── DailyChallenge.tsx     # Rotating daily task
    │   ├── CourseCard.tsx         # Scenario card
    │   ├── OnboardingWizard.tsx   # First-time user modal
    │   ├── flashcards/
    │   │   ├── FlashcardViewer.tsx    # Flip-card with ratings
    │   │   ├── FlashcardStatsBar.tsx  # Stats display
    │   │   ├── XPNotification.tsx     # Animated XP popup
    │   │   ├── AchievementPopup.tsx   # Achievement unlock modal
    │   │   ├── MasteryIndicator.tsx   # Circular progress ring
    │   │   └── CardEditor.tsx         # Card create/edit form
    │   └── ...
    └── lib/
        ├── flashcard-engine.ts    # SM-2 algorithm + card generation
        ├── progress-store.ts      # XP, achievements, stats persistence
        ├── vocab-sets.ts          # CEFR vocabulary data queries
        ├── user-sets-store.ts     # User-created set persistence
        ├── multiwoz.ts            # MultiWOZ dataset utilities
        ├── session-store.ts       # In-memory session management
        ├── level-store.ts         # CEFR level tracking
        ├── prompts.ts             # Writing prompt bank (65 prompts)
        └── constants.ts           # Domain styles, gamification config
```

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/coach` | POST | AI coaching (grammar/vocab/writing/voice), SSE streaming |
| `/api/practice` | POST | Practice sessions (roleplay/drill/conversation) |
| `/api/flashcards` | POST | `generate` · `review-stats` · `ai-generate` · `bulk-import` · `save-set` |
| `/api/vocab-sets` | GET | Browse sets, filter by level/topic, search |
| `/api/progress` | GET | XP, level, achievements, mastery, stats |
| `/api/prompts` | GET | Daily writing prompts by CEFR level |
| `/api/scenarios` | GET/POST | MultiWOZ domain data and scenario generation |
| `/api/translate` | POST | Auto-translate and translation coaching |
| `/api/tts` | GET/POST | Text-to-Speech — VoiVoice audio stream (GET for direct playback) |
| `/api/asr` | POST | Speech-to-text — Groq Whisper (primary) or VoiVoice fallback |

---

## Storage

**Client-side (localStorage):**
- `linguify-flashcards` — flashcard array with SM-2 state
- `linguify-onboarded` — first-time user flag
- `linguify-level` — selected level
- `linguify-theme` — dark/light preference
- `linguify-recent-sessions` — recent practice sessions

**Server-side (JSON files with in-memory fallback for Vercel):**
- `data/progress.json` — coaching history, XP, achievements, mastery
- `data/levels.json` — CEFR level per mode
- `data/user-sets.json` — user-created vocabulary sets

---

## License

MIT

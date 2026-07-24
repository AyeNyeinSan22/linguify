---
marp: true
theme: default
paginate: true
size: 16:9
---

# Linguify — Tech Stack

## How it's built, automated, and delivered

**@AyeNyeinSan22** | AI Tour

---

# Tech Stack

**Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4
**Language:** TypeScript
**AI:** Groq SDK (Llama 3.3 70B Versatile)
**Dataset:** MultiWOZ 2.2 (8,437 real Cambridge, UK dialogues)
**Fonts:** Geist Sans + Geist Mono
**Deploy:** Vercel (serverless)
**MCP:** Model Context Protocol SDK

---

# Architecture

```
src/
├── app/                         # Next.js App Router pages
│   ├── page.tsx                 # Home — greeting, scenarios, quick actions
│   ├── skill/page.tsx           # AI Coach — grammar / vocab / writing
│   ├── agent/page.tsx           # Practice — MultiWOZ role-play
│   ├── translate/page.tsx       # Translation Coach (18 languages)
│   ├── voice/page.tsx           # Voice Coach (Web Speech API)
│   ├── flashcards/
│   │   ├── page.tsx             # Flashcard review hub (SM-2)
│   │   ├── sets/page.tsx        # CEFR vocabulary sets browser
│   │   └── my-cards/page.tsx    # Personal card management
│   ├── dashboard/page.tsx       # Progress dashboard
│   ├── scenario/[domain]/       # Scenario detail + practice
│   └── api/
│       ├── coach/               # POST — AI coaching (SSE streaming)
│       ├── practice/            # POST — Practice sessions
│       ├── flashcards/          # POST — generate, review, AI, bulk import
│       ├── vocab-sets/          # GET — browse vocabulary sets
│       ├── progress/            # GET — user progress data
│       ├── prompts/             # GET — daily writing prompts
│       ├── scenarios/           # GET/POST — MultiWOZ scenarios
│       └── translate/           # POST — translation coaching
├── components/                  # Reusable UI components
│   ├── Navbar.tsx               # Navigation with flashcard badge
│   ├── ChatPanel.tsx            # Reusable chat interface
│   ├── GreetingBanner.tsx       # Hero with streak/level
│   ├── DailyChallenge.tsx       # Rotating daily task
│   ├── OnboardingWizard.tsx     # First-time user modal
│   └── flashcards/
│       ├── FlashcardViewer.tsx   # Flip-card with SM-2 ratings
│       ├── FlashcardStatsBar.tsx # Stats display
│       ├── XPNotification.tsx    # Animated XP popup
│       ├── AchievementPopup.tsx  # Achievement unlock modal
│       ├── MasteryIndicator.tsx  # Circular progress ring
│       └── CardEditor.tsx        # Card create/edit form
└── lib/
    ├── flashcard-engine.ts      # SM-2 algorithm + card generation
    ├── progress-store.ts        # XP, achievements, stats persistence
    ├── vocab-sets.ts            # CEFR vocabulary data queries
    ├── multiwoz.ts              # MultiWOZ dataset utilities
    ├── session-store.ts         # In-memory session management
    └── constants.ts             # Domain styles, gamification config
```

---

# Skills

| Skill | Purpose |
|-------|---------|
| **english-coach** | Grammar explanations, vocabulary building, writing feedback, conversational practice |
| **practice-coach** | Interactive practice sessions with scoring + 3-day improvement plan |
| **deploy-checklist** | Build → lint → test → deploy steps before pushing to Vercel |
| **api-contract** | Keep API routes and docs (README, tech-stack) in sync |

**english-coach** — Coaching principles: encourage first, meet learner at their level, one concept at a time, make it practical. Session flow: warm-up → focus area → practice → feedback → preview.

**practice-coach** — Workflow: ask learner's goal (daily/interview/IELTS/travel) → 3–5 practice questions → brief correction after each → final score (grammar/fluency/vocabulary out of 10) → 3-day improvement plan.

**deploy-checklist** — `npm run lint` → `npx tsc --noEmit` → `npm run build` → smoke test pages + API → push to main → verify production on Vercel.

**api-contract** — Lists all 8 routes in `src/app/api/`, diffs against README and tech-stack.md docs, spot-checks response shapes. Run when adding or renaming routes.

---

# Agents

| Agent | Purpose |
|-------|---------|
| **practice-coach** | Guided English practice — asks learner's goal, runs 3–5 questions, scores grammar/fluency/vocabulary, gives 3-day plan |
| **security-auditor** | Codebase vulnerability scan — API key exposure, XSS in chat, insecure localStorage, dependency vulns |
| **ui-reviewer** | Accessibility + responsive design + visual consistency audit across all pages and components |
| **endpoint-tester** | Tests all 8 API routes (GET + POST) for correct status codes, error handling, and response shapes |

**security-auditor** — Checks: Groq API key leakage, XSS in ChatPanel/coach responses, localStorage safety, API validation gaps, `dangerouslySetInnerHTML` usage, dependency vulnerabilities via `npm audit`.

**ui-reviewer** — Checks: keyboard navigation + focus indicators, ARIA labels on icon buttons, color contrast (WCAG AA), mobile responsiveness at 375px, consistent use of `glass` / `btn-gradient` / `pill` classes, loading/error/empty states.

**endpoint-tester** — Starts dev server, hits all 8 routes with valid + invalid payloads, verifies 200/400/404/502 responses, confirms no stack traces leaked, tests SSE streaming on `/api/coach`.

---

# MCP Servers

| Server | File | Backend | Purpose |
|--------|------|---------|---------|
| **linguify-skill** | `mcp-servers/skill-server.js` | Groq (Llama 3.3 70B) | English Coach — grammar analysis, vocabulary explanations, writing feedback |
| **linguify-agent** | `mcp-servers/agent-server.js` | Groq (Llama 3.3 70B) | Practice Coach — role-play scenarios, quick drills, guided conversations |

**Architecture:**
- Claude desktop/CLI connects via **Model Context Protocol (MCP)**
- Both MCP servers load `.env` for the Groq API key, fall back to simulated responses
- `.mcp.json` registers both servers with `node` commands

---

# Triggers & Commands

**Skills:**
| Trigger | Skill | What happens |
|---------|-------|-------------|
| "improve my grammar" / "teach me vocabulary" | **english-coach** | Calls `linguify-skill` MCP server for AI coaching |
| "practice English" / "role-play with me" | **practice-coach** | Runs interactive session with scoring + improvement plan |
| "run deploy checklist" | **deploy-checklist** | Executes lint → type check → build → smoke test in order |
| "check api contract" | **api-contract** | Diffs actual routes against README and tech-stack docs |

**Agents:**
| Trigger | Agent | What happens |
|---------|-------|-------------|
| "audit security" / "check vulnerabilities" | **security-auditor** | Full codebase scan — API keys, XSS, localStorage, dependencies |
| "review UI" / "check accessibility" | **ui-reviewer** | Accessibility + responsive + visual audit across all components |
| "test APIs" / "check routes" | **endpoint-tester** | Starts dev server, tests all 8 routes with valid/invalid payloads |

---

# AI Coaching Features

| Feature | Mode | Description |
|---------|------|-------------|
| **AI English Coach** | Grammar / Vocabulary / Writing | Real-time streaming feedback with corrections, explanations, examples |
| **Conversation Practice** | MultiWOZ Role-play | 6 real-world domains — restaurant, hotel, train, attractions, taxi, hospital |
| **Translation Coach** | Native → English | 18 source languages, AI compares user translation vs natural English |
| **Voice Coach** | Speech recognition | Web Speech API + AI feedback + TTS readback |

---

# Spaced Repetition (SM-2)

**Flashcard Engine — SuperMemo SM-2 algorithm:**
- Flip-card UI with 4 quality ratings: Forgot / Hard / Good / Easy
- Cards auto-generated from AI coaching mistakes
- Manual card creation and bulk CSV import
- Source filtering: Coaching, Manual, AI, Sets

**18 curated CEFR vocabulary sets** (A1–C2):
- 360 words total, 20 words per set
- Each with definition, example sentence, part of speech, IPA transcription

---

# Gamification

| Feature | Details |
|---------|---------|
| **XP system** | 10–15 XP per review, streak bonuses |
| **10 levels** | Level 1 (0 XP) → Level 10 (12,000 XP) |
| **8 achievements** | First Card, Century, Week Warrior, Sharpshooter, Set Scholar, etc. |
| **Streak tracking** | Consecutive days of activity |
| **Mastery indicators** | Circular progress rings per vocabulary set |

---

# Storage

**Client-side (localStorage):**
- `linguify-flashcards` — flashcard array with SM-2 state
- `linguify-onboarded` — first-time user flag
- `linguify-level` — selected CEFR level
- `linguify-theme` — dark/light preference
- `linguify-recent-sessions` — recent practice sessions

**Server-side (JSON files with in-memory fallback for Vercel):**
- `data/progress.json` — coaching history, XP, achievements, mastery
- `data/levels.json` — CEFR level per mode
- `data/user-sets.json` — user-created vocabulary sets

---

# MultiWOZ 2.2 Dataset

**8,437 authentic Cambridge, UK dialogues across 6 domains:**

| Domain | Icon | Practice Scenarios |
|--------|------|-------------------|
| 🍽️ Restaurant | 🍽️ | Order food, book tables |
| 🏨 Hotel | 🏨 | Book rooms, check amenities |
| 🚂 Train | 🚂 | Check schedules, find routes |
| 🎭 Attractions | 🎭 | Find museums, parks |
| 🚕 Taxi | 🚕 | Book rides, give directions |
| 🏥 Hospital | 🏥 | Describe symptoms, make appointments |

Each domain has 5–7 lessons with scenario-based practice.

---

# CEFR Vocabulary Levels

| Level | Sets | Words per Set |
|-------|------|---------------|
| **A1** | Daily Life, Greetings, Food | 20 |
| **A2** | Travel, Shopping, Weather | 20 |
| **B1** | Work, Health, Education | 20 |
| **B2** | Technology, Environment, Media | 20 |
| **C1** | Politics, Science, Arts | 20 |
| **C2** | Philosophy, Law, Idioms | 20 |

**Total: 18 sets · 360 words · full IPA phonetics**

---

# Progress Dashboard

**Track your learning journey with:**
- Session and message counts
- Day streak
- CEFR level per mode (grammar / vocabulary / writing)
- Common mistakes analysis (topic, count, percentage)
- Per-topic mastery scores (correct / total)
- Writing statistics (submissions, average word count)
- Vocabulary word cloud
- Recent activity log

---

# Environment & Setup

```
GROQ_API_KEY=gsk_...          # Optional — works with simulated responses
```

```bash
git clone https://github.com/AyeNyeinSan22/linguify.git
cd linguify
npm install
npm run dev       # → http://localhost:3000
npm run build     # Production build
npm run start     # Production server
```

**Live demo:** `https://linguify-eta.vercel.app`  
**Source:** `https://github.com/AyeNyeinSan22/linguify`

---

# Lesson Learned

- MultiWOZ 2.2 gave authentic dialogue data without manual content creation
- SSE streaming (Server-Sent Events) made AI coaching feel real-time and responsive
- localStorage works for prototyping but auth + cloud sync is needed for real adoption
- SM-2 spaced repetition is the gold standard — users appreciate the science-backed approach
- LLM-generated flashcards from user mistakes creates a powerful feedback loop
- Real Cambridge dialogues made role-play feel significantly more authentic than scripted alternatives

---

# Thank You

**Linguify** — AI-powered English learning with real-world conversations.

`https://linguify-eta.vercel.app`
`https://github.com/AyeNyeinSan22/linguify`

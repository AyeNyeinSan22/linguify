# Plan: MultiWOZ 2.2 Integration for Linguify Practice Scenarios

## Dataset Summary
- **7 domains:** restaurant (3,836 openings), hotel (3,369), train (2,963), attraction (2,681), taxi (1,463), hospital (107), bus (6)
- **20,552–27,223 user turns per domain** (rich real-world dialogue)
- **8,437 training dialogues** with multi-turn USER/SYSTEM exchanges
- Each turn has slot tracking (intents, requested info, values)

## Integration Strategy

### Phase 1: Data Utility (`src/lib/multiwoz.ts`)
A module that loads the dataset from the kagglehub cache path and exposes:
- `getScenariosByDomain(domain)` — opening prompts from that domain
- `getScenarioSession(domain, numTurns)` — a full multi-turn dialogue for role-play
- `getDrillExercise(domain)` — a single user turn for quick drills
- `getDomainInfo(domain)` — schema slots and possible values (for vocabulary)
- `getDomains()` — list all available domains with stats

### Phase 2: New API Route (`src/app/api/scenarios/route.ts`)
- `GET /api/scenarios` — list domains and stats
- `POST /api/scenarios` with `{ domain, type: "roleplay" | "drill" }` — returns a scenario prompt and context
- Uses the data utility; no API key needed (dataset is local)

### Phase 3: Updated Practice Coach UI (`src/app/agent/page.tsx`)
- Add a **"Real-World Scenarios"** section above the existing 3 scenario cards
- Each domain becomes a scenario button: 🏨 Hotel, 🍽️ Restaurant, 🚂 Train, 🎭 Attraction, 🚕 Taxi, 🏥 Hospital
- Clicking a domain fetches a MultiWOZ scenario from the new API
- The practice session uses the real dialogue context + Claude for coaching
- Falls back to dataset SYSTEM responses if Claude API is unavailable

### Phase 4: Enhanced Fallback Responses (`src/app/api/practice/route.ts`)
- Replace the hardcoded `SIMULATED_RESPONSES` with MultiWOZ-derived responses
- Extract real SYSTEM utterances per domain to use as fallback coaching replies
- Much wider variety than the current 3 responses per mode

## Files to Create/Modify

| File | Action | Description |
|---|---|---|
| `src/lib/multiwoz.ts` | **Create** | Dataset loader + query functions |
| `src/app/api/scenarios/route.ts` | **Create** | Scenarios API endpoint |
| `src/app/agent/page.tsx` | **Modify** | Add real-world scenario cards, fetch from API |
| `src/app/api/practice/route.ts` | **Modify** | Use MultiWOZ responses as fallback |
| `src/lib/multiwoz-cache.ts` | **Create** | Pre-process dataset into efficient lookup structures |

## Key Design Decisions
- **Dataset stays in kagglehub cache** — no copying, just reads from `~/.cache/kagglehub/`
- **Lazy loading** — only loads dialogues for the requested domain, not all 8k at once
- **Works without API key** — scenarios from dataset don't need Claude, so the app works fully offline for scenario browsing
- **Claude enhances, not replaces** — Claude still provides coaching feedback, but the scenario content comes from real dialogues

# Plan: Deploy Linguify to Vercel

## Blockers & Fixes

### 1. File-system writes (progress-store.ts, level-store.ts)
**Problem**: Vercel serverless is read-only (except /tmp).
**Fix**: Wrap all fs.writeFileSync calls in try/catch, fall back to in-memory globalThis cache. Same for fs.mkdirSync and fs.readFileSync.

### 2. MultiWOZ dialogue files (170MB)
**Problem**: Kagglehub cache doesn't exist on Vercel.
**Already handled**: The code gracefully returns [] / null when files are missing. The 455KB index IS deployed (in src/lib/).

### 3. No git repo
**Fix**: git init, add remote, commit, push.

## Files to modify (4)
| File | Change |
|---|---|
| `src/lib/progress-store.ts` | fs ops → try/catch + in-memory fallback |
| `src/lib/level-store.ts` | fs ops → try/catch + in-memory fallback |
| `.gitignore` | Add data/ and .env |
| New: `vercel.json` | Vercel deployment config |

## What stays the same
- All 7 pages, all 3 API routes, MCP servers
- GROQ_API_KEY set via Vercel dashboard env vars
- MultiWOZ index (455KB) bundled in the build

## After deploy
- Clone the Vercel repo
- Set GROQ_API_KEY in Vercel dashboard
- App live at `<project>.vercel.app`

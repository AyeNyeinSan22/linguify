# Auth & Cloud Sync — Investigation

## Goal
Enable user accounts so progress (flashcards, XP, level, streaks, sessions) syncs across devices.

## Options considered

### 1. NextAuth.js (Auth.js) — Recommended
- **Effort:** Medium (2-3 days)
- **Pros:** Built for Next.js, supports Google/GitHub/Email magic links, works on Vercel edge
- **Cons:** Need a database (see below)
- **Data to sync:** localStorage → server DB on login, pull on every page load

### 2. Clerk
- **Effort:** Low (1 day)
- **Pros:** Drop-in auth UI, pre-built components, free tier (10k MAU)
- **Cons:** Vendor lock-in, paid beyond free tier
- **Best for:** Fastest path to MVP

### 3. Supabase Auth + Database
- **Effort:** Medium (3-4 days)
- **Pros:** Auth + DB in one service, free tier, real-time sync possible
- **Cons:** More setup than Clerk

## Database options (needed for any auth)

| Option | Free tier | Effort |
|--------|-----------|--------|
| **Supabase** (PostgreSQL) | 500 MB, 50k rows | Medium |
| **Upstash** (Redis) | 10k commands/day | Low |
| **Vercel Postgres** | 256 MB, 60 req/s | Low (same platform) |
| **MongoDB Atlas** | 512 MB | Medium |

## Data migration plan (localStorage → cloud)

Current localStorage keys to migrate:
- `linguify-flashcards` — SM-2 card data → `user_flashcards` table
- `linguify-recent-sessions` — practice history → `user_sessions` table
- `linguify-level` — CEFR level → `user_settings` table
- `linguify-onboarded` — flag → `user_settings` table
- `linguify-theme` — preference → `user_settings` table

Server-side JSON files to migrate:
- `data/progress.json` → `user_progress` table
- `data/levels.json` → `user_settings` table
- `data/user-sets.json` → `user_sets` table

## Recommended approach

1. **Add Clerk** (fastest auth integration — 1 day)
2. **Add Vercel Postgres** (same platform, minimal config — 1 day)
3. **Create sync API** (`/api/sync` — POST to push, GET to pull)
4. **Merge on login:** `localStorage + server = latest wins per field`
5. **Fall back to local** when offline (localStorage as cache)

## Effort estimate
- **Clerk auth:** 4-6 hours
- **Vercel Postgres setup + schema:** 2-3 hours
- **Sync API + client merge logic:** 6-8 hours
- **Testing + edge cases:** 4 hours
- **Total:** ~16-20 hours (spread over ~1 week)

## Blocker status
✅ No technical blockers — all services integrate well with Next.js 16 + Vercel.
⚠️ Time investment is the main constraint.

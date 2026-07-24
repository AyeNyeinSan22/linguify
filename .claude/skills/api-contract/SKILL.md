---
name: api-contract
description: Keep Linguify API routes and docs in sync — verify routes match README and tech-stack
---

# API Contract

Verify that the actual API routes in `src/app/api/` match what's documented in `README.md` and `slides/tech-stack.md`.

## Steps

1. **List actual routes**
   ```bash
   find src/app/api -name "route.ts" | sort
   ```

2. **Extract documented routes**
   - `README.md` — check the API Routes table
   - `slides/tech-stack.md` — check Architecture section

3. **Diff check**
   - Every API route in `src/app/api/` should be documented
   - Every documented route should exist in `src/app/api/`
   - Method (GET/POST) matches between code and docs

4. **Response shape check** (spot-check)
   - Pick 2-3 POST routes — does the actual response JSON match what a consumer would expect?
   - Error responses consistent across all routes

## Current Routes (from source)

| Route | Method | File |
|-------|--------|------|
| `/api/coach` | POST | `src/app/api/coach/route.ts` |
| `/api/practice` | POST | `src/app/api/practice/route.ts` |
| `/api/flashcards` | POST | `src/app/api/flashcards/route.ts` |
| `/api/vocab-sets` | GET | `src/app/api/vocab-sets/route.ts` |
| `/api/progress` | GET | `src/app/api/progress/route.ts` |
| `/api/prompts` | GET | `src/app/api/prompts/route.ts` |
| `/api/scenarios` | GET/POST | `src/app/api/scenarios/route.ts` |
| `/api/translate` | POST | `src/app/api/translate/route.ts` |

When adding a new route, update both the API route table in `README.md` and the Architecture tree in `slides/tech-stack.md`.

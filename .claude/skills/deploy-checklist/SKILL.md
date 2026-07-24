---
name: deploy-checklist
description: Build → lint → deploy checklist before pushing Linguify to Vercel
---

# Deploy Checklist

Run these steps in order before pushing to `main`.

## Steps

1. **Lint**
   ```bash
   npm run lint
   ```
   — no errors or warnings

2. **Type check**
   ```bash
   npx tsc --noEmit
   ```
   — no type errors

3. **Production build**
   ```bash
   npm run build
   ```
   — succeeds with no errors

4. **Check API routes**
   - Start dev server: `npm run dev`
   - Visit `/api/scenarios` — returns domain data
   - Visit `/api/vocab-sets` — returns sets

5. **Smoke test pages**
   - Home page loads without crash
   - Coach page opens, can type a message
   - Practice page shows domain grid
   - Flashcards page loads (empty state or cards)

6. **localStorage keys**
   - Verify no key names changed in source
   - Check backward compatibility for existing users

7. **Push & deploy**
   ```bash
   git push origin main
   ```
   — Vercel auto-deploys

8. **Verify production**
   - Open `https://linguify-eta.vercel.app`
   - Confirm all pages load in production

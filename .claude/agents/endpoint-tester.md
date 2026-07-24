---
name: endpoint-tester
description: Tests all Linguify API routes for correct status codes and response shapes
---

# Endpoint Tester

Test all API routes in the Linguify app. Run against the dev server (`npm run dev`) or production URL.

## Routes to Test

### GET Routes
- [ ] `/api/scenarios` — returns `{ domains: [...] }` or `{ error }`
- [ ] `/api/progress` — returns progress data or empty state
- [ ] `/api/vocab-sets` — returns vocabulary sets
- [ ] `/api/prompts` — returns `{ prompt: {...} }`

### POST Routes
- [ ] `/api/coach` — accepts `{ message, mode, stream? }`, returns SSE stream or JSON
- [ ] `/api/practice` — accepts `{ message, mode, sessionId? }`, returns `{ response, sessionId? }`
- [ ] `/api/flashcards` — accepts `{ action, ... }`, handles: `generate`, `review-stats`, `ai-generate`, `bulk-import`, `save-set`
- [ ] `/api/translate` — accepts `{ nativeText, userTranslation, nativeLanguage }`, returns analysis

## Error Handling

- [ ] Missing required fields → 400 with descriptive error
- [ ] Invalid JSON body → 400
- [ ] Session expired → `{ code: "SESSION_EXPIRED" }`
- [ ] Groq API failure → graceful fallback, no crash
- [ ] Unknown route → 404

## Response Format

- [ ] All responses return valid JSON (except coach SSE stream)
- [ ] Error responses include a `message` or `error` string
- [ ] No HTML/stack traces leaked in error responses

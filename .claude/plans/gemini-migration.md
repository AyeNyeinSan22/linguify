# Plan: Migrate from Claude Anthropic to Google Gemini (Free)

## Why Gemini
- Free tier: 1,500 requests/day on Gemini 2.0 Flash
- No credit card required
- Similar quality for language coaching tasks
- Fast streaming support
- SDK: `@google/generative-ai`

## Files to Modify

| File | Change |
|---|---|
| `package.json` | Remove `@anthropic-ai/sdk`, add `@google/generative-ai` |
| `.env` | Replace `ANTHROPIC_API_KEY` with `GEMINI_API_KEY` |
| `.env.example` | Update template |
| `src/app/api/coach/route.ts` | Replace Claude streaming + non-streaming with Gemini |
| `src/app/api/practice/route.ts` | Replace Claude with Gemini |
| `src/app/api/translate/route.ts` | Replace Claude with Gemini |
| `mcp-servers/skill-server.js` | Replace Anthropic REST API calls with Gemini |
| `mcp-servers/agent-server.js` | Replace Anthropic REST API calls with Gemini |

## Key API Differences

| Concept | Claude | Gemini |
|---|---|---|
| System prompt | `system` param | `systemInstruction` config |
| Messages | `[{role, content}]` | `[{role:"user"/"model", parts:[{text}]}]` |
| Streaming | `stream()` events | `generateContentStream()` async iterable |
| SDK import | `new Anthropic({apiKey})` | `new GoogleGenerativeAI(apiKey).getGenerativeModel({model})` |
| Model name | `claude-sonnet-4-6` | `gemini-2.0-flash` |
| Token limit | `max_tokens` | `maxOutputTokens` in generationConfig |

## Error Handling
- Gemini errors: `GoogleGenerativeAIError`, `GoogleGenerativeAIFetchError`
- Rate limit: 429 → fallback to simulated responses
- API key invalid: 400/403 → fallback

## Get Free API Key
1. Go to https://aistudio.google.com/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Paste into `.env` as `GEMINI_API_KEY=...`

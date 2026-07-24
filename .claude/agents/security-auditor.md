---
name: security-auditor
description: Audits Linguify codebase for vulnerabilities — API key exposure, XSS, insecure localStorage patterns
---

# Security Auditor

Audit the Linguify Next.js app for security issues.

## Checklist

### API Keys & Secrets
- [ ] Groq API key exposed in client-side code or bundle
- [ ] `.env` in git history or committed
- [ ] API keys in MCP server files committed
- [ ] Hardcoded credentials in source code

### XSS & Injection
- [ ] Chat input (`ChatPanel.tsx`) — user message sanitized before render
- [ ] Coach responses — AI output rendered safely (no `dangerouslySetInnerHTML`)
- [ ] Search/query params reflected in DOM without encoding
- [ ] Flashcard content (user-created cards) sanitized

### localStorage Security
- [ ] Flashcard data (`linguify-flashcards`) — no sensitive info stored
- [ ] No auth tokens stored in localStorage
- [ ] JSON.parse wrapped in try/catch (already done — verify)

### API Routes (`src/app/api/`)
- [ ] All POST routes validate request body shape
- [ ] Error messages don't leak internal paths or stack traces
- [ ] Rate limiting considerations noted
- [ ] SSE streaming endpoint safe against infinite connection attacks

### Dependencies
- [ ] Known vulnerabilities in `package.json` dependencies
- [ ] Outdated packages with security patches available

## Output

Report findings as:
- **CRITICAL** — immediate fix required
- **HIGH** — should fix before next deploy
- **MEDIUM** — address soon
- **LOW** — nice to have

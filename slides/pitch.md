---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
<!-- 20s -->

An English learner — someone studying for work, school, or immigration — who wants to speak confidently but doesn't have a native speaker to practice with.

---

<!-- slide 2 -->
# Their problem

Classrooms teach grammar rules but not real conversation. Textbooks don't talk back. Learners make the same mistakes repeatedly because nobody corrects them in the moment. They need practice that feels real.

---

<!-- slide 3 -->
# What I built

**Linguify** — an AI-powered English coach with:
- Real conversation practice from 8,437 Cambridge UK dialogues
- Instant AI feedback (correction, explanation, examples, next step)
- Spaced-repetition flashcards with CEFR vocabulary sets
- Translation coach, voice practice, and progress tracking

---

<!-- slide 4 -->
# How I built it
- **MCP**: Two servers — skill-server (coaching) and agent-server (practice) — both calling Groq's Llama 3.3 70B
- **Skill**: Grammar/vocabulary/writing coaching with streaming SSE responses and structured feedback cards
- **Agent**: MultiWOZ 2.2 dataset for real-world role-play across 6 domains (restaurant, hotel, train, taxi, hospital, attractions)

---

<!-- slide 5 -->
# Why it matters

Learners don't need another grammar app — they need to *practice speaking*. Linguify gives them a safe space to make mistakes, get corrected, and build muscle memory through spaced repetition. Every error becomes a flashcard. Every session builds a streak.

---

<!-- slide 6 -->
# Done checklist
- [x] repo public
- [x] MCP + skill + agent used
- [x] report.md in team repo

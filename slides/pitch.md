---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?

* **Target User:** English learners — students, professionals, and immigrants who need to speak confidently in real situations.
* **The Reality:** They study grammar rules and memorize vocabulary, but when it's time to actually talk, they freeze. No native speaker to practice with, no one to correct them in the moment.
* **Their Goal:** Build real conversational fluency through practice that feels authentic — not textbook dialogues.

---

<!-- slide 2 -->
# Their problem

* **No Real Practice:** Textbooks and apps teach grammar rules but never let you actually *talk*. Learners know the theory but can't hold a conversation.
* **No Instant Feedback:** Without a tutor present, mistakes go unnoticed and fossilize into bad habits. Learners repeat the same errors for months.
* **No Retention System:** Vocabulary is crammed and forgotten. There's no spaced repetition, no streak tracking, no way to measure progress over time.

---

<!-- slide 3 -->
# What I built

* **The Solution:** Linguify is an AI-powered English learning platform with real-world conversation practice, instant feedback, and spaced-repetition flashcards.
* **What it does:** Pulls from 8,437 authentic Cambridge UK dialogues (MultiWOZ 2.2) across 6 domains — restaurant, hotel, train, taxi, hospital, and attractions. AI coaches you through role-play with structured feedback cards (correction, explanation, examples, next step).
* **The Output:** A full-featured web app with grammar coaching, translation coach, voice practice, CEFR vocabulary sets, XP/level gamification, and a progress dashboard — all in a glassmorphism UI with dark mode.

---

<!-- slide 4 -->
# How I built it

* **MCP:** Two custom servers — a skill-server for grammar/vocabulary/writing coaching and an agent-server for multi-turn practice sessions. Both call Groq's Llama 3.3 70B via the Model Context Protocol.
* **Skill:** Built a structured feedback engine that parses AI responses into color-coded cards with progressive reveal. Each coaching session auto-generates flashcards from corrections.
* **Agent:** Integrated the MultiWOZ 2.2 dataset to power real-world role-play scenarios. Built a scenario instruction system with context cards, task cards, and expandable tip cards.

---

<!-- slide 5 -->
# Why it matters

* **Practice, Not Theory:** Learners don't need another grammar app — they need a safe space to speak, make mistakes, and get corrected in real time.
* **Every Error Becomes a Card:** Coaching corrections auto-generate flashcards. Spaced repetition ensures they're reviewed at the right moment — not too early, not too late.
* **Gamification That Works:** XP, levels, streaks, and 8 achievements keep learners coming back. The progress dashboard shows exactly where they're improving and where they need work.

---

<!-- slide 6 -->
# Done checklist

- [x] repo public
- [x] MCP + skill + agent used
- [x] report.md in team repo

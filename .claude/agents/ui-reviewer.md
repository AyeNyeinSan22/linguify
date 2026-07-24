---
name: ui-reviewer
description: Reviews Linguify UI for accessibility, responsiveness, and consistency
---

# UI Reviewer

Review the Linguify app interface across accessibility, responsive design, and visual consistency.

## Accessibility

- [ ] All interactive elements keyboard-navigable (Tab, Enter, Escape)
- [ ] Focus indicators visible on buttons, links, inputs
- [ ] ARIA labels on icon-only buttons (hamburger menu, theme toggle)
- [ ] Color contrast meets WCAG AA (text on backgrounds)
- [ ] Flashcard flip animation — no seizure triggers
- [ ] Voice Coach — SpeechRecognition result shown as text (not just audio)
- [ ] Mobile menu has `role="dialog"` and `aria-modal` (already present — verify)

## Responsive Design

- [ ] Home page — 3-column scenario grid collapses to 1 column on mobile
- [ ] Coach page — 3-column CEFR level cards fit on small screens
- [ ] Practice page — domain grid doesn't overflow horizontally
- [ ] Flashcard viewer — card fits viewport without horizontal scroll
- [ ] Dashboard — 4-column stats grid wraps on mobile
- [ ] Navbar — hamburger menu works, links are tappable (min 44px height)
- [ ] Translate page — two-column layout stacks on mobile

## Visual Consistency

- [ ] Buttons use consistent `btn-gradient` or `pill` classes (no custom inline styles)
- [ ] Cards use `glass` class consistently
- [ ] Loading states use the bounce-dot pattern (not raw text)
- [ ] Error states show a message + retry action (not silent failure)
- [ ] Empty states guide the user to next action (not blank page)
- [ ] Colors match domain color system (DOMAIN_COLORS)

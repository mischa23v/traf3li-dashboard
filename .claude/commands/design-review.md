---
name: design-review
description: Run comprehensive UI review with RTL/LTR and accessibility checks
version: 1.1.0
risk: A
reviewer:
  - accessibility_engineer
  - i18n_expert
last_updated: 2026-01-14
---

**Instructions:**

1. Make sure your dev server is running on `http://localhost:5173`

2. Invoke the design-review agent with this prompt:

"Review the TRAF3LI dashboard UI. The development server is on http://localhost:5173.

Test:
- Arabic (RTL) and English (LTR)
- Desktop (1440px), Tablet (768px), Mobile (375px)
- Keyboard navigation and accessibility
- Console for errors

Provide a report with:
- Strengths
- Blockers (must fix)
- High-Priority issues
- Suggestions
- Test summary for each check

Include screenshots for visual issues."

---

## Senior Dev Review Mode (Dual-Reviewer)

This review combines two expert perspectives:

### Accessibility Staff Engineer (Microsoft/Apple)

> "I've led accessibility programs for products with 1 billion+ users. Every interactive element must be usable by everyone - keyboard users, screen reader users, users with low vision.
> If I see these patterns, the design fails review."

**WCAG 2.1 AA Standards:**
- [ ] 4.5:1 contrast for normal text
- [ ] 3:1 contrast for large text and UI elements
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] No content conveyed by color alone
- [ ] Form fields have visible labels
- [ ] Error messages are descriptive

**Red Flags:**
```
onClick on div without keyboard handler
Missing aria-label on icon buttons
Placeholder text as only label
Auto-playing media without controls
Time limits without warnings
```

### Internationalization Architect (Google/Notion)

> "I've built i18n systems supporting 100+ locales. RTL languages aren't just 'reversed LTR' - they have their own visual logic.
> If I see these patterns, the design fails review."

**RTL/LTR Standards:**
- [ ] Using `ms-`/`me-` instead of `ml-`/`mr-`
- [ ] Using `ps-`/`pe-` instead of `pl-`/`pr-`
- [ ] Using `text-start`/`text-end` instead of `text-left`/`text-right`
- [ ] Icons that indicate direction are mirrored
- [ ] Numbers display correctly in both directions
- [ ] Text containers handle 200% expansion

**Red Flags:**
```
ml-4 instead of ms-4 (breaks RTL)
text-left instead of text-start
Hardcoded strings in JSX
Fixed-width containers with text
Icons like arrows not mirrored in RTL
```

---

## Junior Thinking vs Senior Reality

| Junior Thinking | Senior Reality | Why It Matters |
|-----------------|----------------|----------------|
| "RTL is just mirrored LTR" | RTL has its own visual logic | Some elements don't mirror |
| "Color shows the status" | Color alone fails a11y | 8% of men are colorblind |
| "Users can just click" | Many users can't use a mouse | Keyboard-only is common |
| "The contrast looks fine" | 4.5:1 is the minimum, not goal | Low vision is more common than blindness |
| "We'll add translations later" | Hardcoded strings spread | Retrofit i18n costs 5x more |

---

## Unknown Scenario Handling

**STOP and ASK if:**
- [ ] Component doesn't have clear RTL behavior
- [ ] Interactive element has ambiguous accessibility
- [ ] Design uses colors without text alternatives
- [ ] Layout breaks at different text lengths

**Accessibility Principle:** *"When in doubt, test with a screen reader."*
**i18n Principle:** *"If text can expand 200%, assume it will."*

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-14 | Added risk level, dual Senior Dev Review (A11y + i18n) |
| 1.0.0 | 2026-01-12 | Initial version |
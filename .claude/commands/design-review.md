---
name: design-review
description: Run comprehensive UI review with RTL/LTR and accessibility checks
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
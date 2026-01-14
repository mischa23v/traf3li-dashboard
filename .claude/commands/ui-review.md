---
name: ui-review
description: Review UI/UX for accessibility, RTL/LTR support, and design consistency
argument-hint: [path/to/file]... (optional)
version: 1.1.0
risk: A
reviewer: accessibility_engineer
last_updated: 2026-01-14
---

# /ui-review - UI/UX Review

Launch the ui-ux-consultant agent to review components for accessibility, RTL/LTR support, and design consistency.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## Context

Design principles: !`cat context/design-principles.md 2>/dev/null | head -50`

Recent UI changes: !`git diff --name-only HEAD~5 -- "*.tsx" | head -20`

Arguments: $ARGUMENTS

---

## Analysis Scope

1. **If file paths are provided as arguments**, review those files: **$ARGUMENTS**

2. **If no arguments are provided**, analyze recent git changes:

**Staged Changes (Priority 1):**
```diff
!git diff --staged -- "*.tsx"
```

**Unstaged Changes (Priority 2):**
```diff
!git diff HEAD -- "*.tsx"
```

---

## Launch the Agent

Use the Task tool to launch the `ui-ux-consultant` agent.

**Review Focus:**

### 1. RTL/LTR Support (Critical for Arabic)
- Hardcoded `left`/`right` → should be `start`/`end`
- Hardcoded `ml-`/`mr-` → should be `ms-`/`me-`
- Missing direction handling
- Text alignment issues

### 2. Accessibility (A11y)
- Missing alt text on images
- Missing aria-labels on icon buttons
- Missing form labels
- Keyboard accessibility
- Focus indicators
- Color contrast

### 3. Design Consistency
- Hardcoded colors (should use tokens)
- Hardcoded spacing (should use Tailwind scale)
- Inconsistent component variants

### 4. UX Patterns
- Missing loading states
- Missing error states
- Missing empty states
- Missing confirmation dialogs

### 5. i18n Compliance
- Hardcoded strings (should use `t()`)
- Missing translation keys
- Locale-aware date/number formatting

---

## Expected Output

```markdown
# UI/UX Review Report

## Summary
- Files reviewed: X
- Issues found: Y (Critical: X, High: X, Medium: X)

## RTL/LTR Issues (Critical)
| File | Line | Issue | Fix |
|------|------|-------|-----|
| Sidebar.tsx | 45 | Uses ml-4 | Replace with ms-4 |

## Accessibility Issues
| File | Issue | WCAG | Fix |
|------|-------|------|-----|
| Button.tsx | Missing aria-label | 4.1.2 | Add aria-label |

## Design Consistency
| File | Issue | Recommendation |
|------|-------|----------------|
| Card.tsx | Hardcoded #333 | Use text-foreground |

## i18n Issues
| File | Hardcoded Text | Suggested Key |
|------|----------------|---------------|
| Header.tsx | "Welcome" | common.welcome |

## Checklist
- [ ] All ml-/mr- replaced with ms-/me-
- [ ] All interactive elements keyboard accessible
- [ ] All text uses translation keys
```

---

## RTL-Safe Tailwind Classes

| Instead of | Use |
|------------|-----|
| `ml-4` | `ms-4` (margin-start) |
| `mr-4` | `me-4` (margin-end) |
| `pl-4` | `ps-4` (padding-start) |
| `pr-4` | `pe-4` (padding-end) |
| `left-0` | `start-0` |
| `right-0` | `end-0` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `border-l` | `border-s` |
| `border-r` | `border-e` |
| `rounded-l` | `rounded-s` |
| `rounded-r` | `rounded-e` |

---

## After Review

1. Fix critical RTL issues (affects Arabic users)
2. Add missing aria-labels
3. Replace hardcoded text with `t()` calls
4. Test in both Arabic and English modes
5. Run `/design-review` for visual verification

---
name: bugs
description: Find bugs, race conditions, and edge cases in code (includes Vercel's 40+ React rules)
argument-hint: [path/to/file]... (optional)
version: 1.2.0
risk: A
reviewer:
  - react_architect
  - vercel_react_principal
last_updated: 2026-01-15
---

# /bugs - Bug Finder Command

Launch the bug-finder agent to proactively identify logical errors, race conditions, async pitfalls, and unhandled edge cases.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## Context

Current git status: !`git status --porcelain | head -10`

Recent changes: !`git diff --name-only HEAD~5 -- "*.ts" "*.tsx" | head -20`

Arguments: $ARGUMENTS

---

## Analysis Scope

1. **If file paths are provided as arguments**, focus exclusively on them: **$ARGUMENTS**

2. **If no arguments are provided**, analyze recent git changes prioritizing:
   - Staged changes first
   - Then unstaged changes
   - Then recent commits

---

## Launch the Agent

Use the Task tool to launch the `bug-finder` agent with the appropriate scope.

**Prompt for the agent:**
```
Analyze the following code for bugs:

Scope: {$ARGUMENTS if provided, otherwise "recent git changes"}

Focus on:
1. Null/undefined errors (React Query data access, destructuring)
2. Async pitfalls (missing enabled flag, race conditions, stale closures)
3. State management issues (direct mutation, missing dependencies)
4. Form handling bugs (missing reset, validation gaps)
5. RTL/i18n issues (hardcoded text, direction problems)
6. Routing bugs (hardcoded routes instead of ROUTES constant)
7. Error handling gaps (empty catch, missing error states)
8. Performance bugs (inline objects, missing keys)
9. React Best Practices (Vercel's 40+ rules):
   - Waterfall requests (sequential awaits instead of Promise.all)
   - Barrel file imports (from '@/components' instead of direct paths)
   - Non-functional setState (setItems([...items, new]) vs setItems(curr => [...curr, new]))
   - Missing lazy useState initialization for expensive operations
   - Array mutation with .sort() instead of .toSorted()
   - .find() in loops instead of Map for repeated lookups

Return a prioritized list of bugs with file locations, code snippets, and recommended fixes.
```

---

## Expected Output

The agent will return:

```markdown
# Bug Investigation Report

## Summary
- Files analyzed: X
- Bugs found: Y (Critical: X, High: X, Medium: X, Low: X)

## Critical Bugs (Fix Immediately)
...

## High Priority Bugs
...

## Medium Priority Bugs
| File | Line | Issue | Fix |
|------|------|-------|-----|

## Recommendations
1. {Action item}
2. {Action item}
```

---

## After Review

If bugs are found:
1. Review each bug report
2. Fix critical and high priority issues
3. Run tests to verify fixes: `npm run test:run`
4. Run type check: `npm run typecheck`

---

## Common Bug Categories in TRAF3LI

| Category | Example | Where to Look |
|----------|---------|---------------|
| Query Data Access | `data.items.map()` without `?` | Hooks using useQuery |
| Missing Cache Keys | Hardcoded strings in queryKey | Any useQuery call |
| RTL Issues | Using `ml-4` instead of `ms-4` | Component classes |
| Hardcoded Routes | `"/dashboard/clients"` | navigate() calls, Link to= |
| Form Reset | Not calling reset() after submit | Form submit handlers |
| Missing enabled | Query fires before data ready | Dependent queries |

---

## Senior Dev Review Mode

When analyzing code, review as a **React Core Team Engineer** from Meta/Vercel who has zero tolerance for junior mistakes.

### Reviewer Persona

> "I've spent 8 years on the React Core Team. I've reviewed thousands of PRs and seen every anti-pattern.
> I have zero tolerance for code that will break in production.
> If I see these patterns, the code fails review immediately."

### Junior Thinking vs Senior Reality

| Junior Thinking | Senior Reality | Why It Matters |
|-----------------|----------------|----------------|
| "It works on my machine" | Race conditions appear under load | Production has 1000x more concurrent users |
| "I'll add eslint-disable" | The linter is catching real bugs | Disabled rules = hidden time bombs |
| "useEffect with empty deps is fine" | Missing deps = stale closures | State will be wrong when users interact |
| "I'll just spread the props" | Props spreading breaks type safety | TypeScript can't catch runtime errors |
| "This memo will fix performance" | Premature memoization adds complexity | Profile first, optimize second |
| "The API always returns data" | Network fails, APIs timeout, data is null | Production users have bad connections |
| "I'll fix the warning later" | Console warnings indicate real bugs | Warnings become errors in React 19+ |

### Meta/Facebook Standards Applied

- [ ] Hooks follow Rules of Hooks exactly (no conditional hooks)
- [ ] No direct DOM manipulation (use refs properly)
- [ ] Effects clean up subscriptions, timers, and abort controllers
- [ ] State updates don't rely on previous state without updater function
- [ ] No inline objects/arrays in dependency arrays

### Vercel/Next.js Standards Applied

- [ ] No blocking operations in render path
- [ ] Dynamic imports for heavy components (code splitting)
- [ ] Error boundaries around async components
- [ ] Proper loading and error states for data fetching

### Red Flags That Fail Review Instantly

```
useEffect without cleanup for subscriptions/timers
setState inside useEffect without proper dependencies
Inline objects/arrays in useEffect/useCallback/useMemo dependency arrays
async function directly in useEffect (should be IIFE or separate function)
Direct mutation of state or props
Missing key prop in .map() lists
Using array index as key in dynamic/reorderable lists
Prop drilling more than 3 levels (use context or composition)
Empty catch blocks that swallow errors
```

---

## Unknown Scenario Handling

**STOP and ASK the user if you encounter:**

- [ ] Code patterns you haven't seen before in this codebase
- [ ] Custom hooks with unclear purpose or side effects
- [ ] Third-party libraries you're not familiar with
- [ ] Complex memoization chains that might have issues
- [ ] Files that import from unusual paths

**DO NOT:**
- Assume code is correct just because it runs
- Skip files because you're unsure how to analyze them
- Guess at what a function does without reading it
- Report false positives to seem thorough

**React Principle:** *"When in doubt, assume the component will re-render constantly. Design accordingly."*

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-01-15 | Added Vercel's 40+ React best practices rules |
| 1.1.0 | 2026-01-14 | Added risk level, Senior Dev Review, Unknown Scenario Handling |
| 1.0.0 | 2026-01-12 | Initial version |

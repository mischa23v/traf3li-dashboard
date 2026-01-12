---
name: bugs
description: Find bugs, race conditions, and edge cases in code
argument-hint: [path/to/file]... (optional)
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

---
name: react-review
description: Vercel's 40+ React performance rules - Senior Principal Engineer review (Google/Apple/Microsoft)
argument-hint: [path/to/file]... (optional)
version: 1.0.0
risk: A
reviewer:
  - principal_engineer_google
  - principal_engineer_apple
  - principal_engineer_microsoft
last_updated: 2026-01-15
---

# /react-review - React Best Practices Review

Launch the react-best-practices-reviewer agent to analyze code against Vercel's 40+ React performance rules.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## What This Command Checks

| Category | Impact | Examples |
|----------|--------|----------|
| **Waterfalls** | CRITICAL | Sequential awaits, blocking fetches |
| **Bundle Size** | CRITICAL | Barrel files, missing lazy loading |
| **Server Performance** | HIGH | Missing caching, blocking operations |
| **Client Fetching** | MEDIUM-HIGH | Missing deduplication, cache invalidation |
| **Re-renders** | MEDIUM | Inline objects, functional setState |
| **Rendering** | MEDIUM | Virtualization, hydration mismatches |
| **JS Performance** | LOW-MEDIUM | Array mutations, repeated lookups |
| **Advanced** | LOW | Context splitting, useLatest pattern |

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
   - Then recent commits (last 5)

---

## Launch the Agent

Use the Task tool to launch the `react-best-practices-reviewer` agent with the appropriate scope.

**Prompt for the agent:**
```
Analyze the following code against Vercel's 40+ React best practices:

Scope: {$ARGUMENTS if provided, otherwise "recent git changes"}

Check ALL 8 categories:
1. CRITICAL: Waterfalls - sequential awaits, blocking fetches
2. CRITICAL: Bundle Size - barrel files, missing dynamic imports
3. HIGH: Server Performance - missing React.cache(), blocking operations
4. MEDIUM-HIGH: Client Fetching - deduplication, cache invalidation
5. MEDIUM: Re-render Optimization - functional setState, lazy init
6. MEDIUM: Rendering Performance - virtualization, content-visibility
7. LOW-MEDIUM: JS Performance - Map for lookups, toSorted vs sort
8. LOW: Advanced Patterns - useLatest, context splitting

Return a comprehensive report with:
- Violations by severity
- Quantified performance impact
- Specific code fixes
- Overall grade (A-F)
```

---

## Expected Output

The agent will return a comprehensive report:

```markdown
# React Best Practices Review

## Reviewer
**Principal Engineer** - 20 years at Google, Apple, Microsoft

## Summary
- Files analyzed: X
- Rules checked: 40+
- Violations found: Y
- Estimated performance impact: Z

## CRITICAL Violations (Fix Before Merge)
...

## HIGH Priority Violations
...

## Performance Score
| Category | Score |
|----------|-------|
| Waterfalls | A-F |
| Bundle Size | A-F |
...

**Overall Grade**: {A-F}
```

---

## The 40+ Rules Checked

### CRITICAL Impact Rules

| # | Rule | Detection |
|---|------|-----------|
| 1.1 | Parallelize independent fetches | Sequential `await` statements |
| 1.2 | Defer await until needed | Awaiting before conditionals |
| 1.3 | Dependency-based parallelization | Complex promise chains |
| 2.1 | Avoid barrel files | `from '@/components'` imports |
| 2.2 | Dynamic imports for heavy components | Direct Monaco/Chart imports |
| 2.3 | Optimize package imports | Missing Next.js config |

### HIGH Impact Rules

| # | Rule | Detection |
|---|------|-----------|
| 3.1 | React.cache() for per-request dedup | Repeated server fetches |
| 3.2 | LRU cache for cross-request | No caching layer |
| 3.3 | Non-blocking with after() | Logging in response path |

### MEDIUM Impact Rules

| # | Rule | Detection |
|---|------|-----------|
| 4.1 | SWR/Query deduplication | Manual fetch calls |
| 4.2 | Global event listener dedup | Multiple addEventListener |
| 4.3 | Proper cache invalidation | Sequential invalidation |
| 5.1 | Functional setState updates | `[...items, new]` pattern |
| 5.2 | Lazy state initialization | `useState(expensive())` |
| 5.3 | Avoid inline objects in props | `={{` pattern |
| 6.1 | content-visibility for lists | Long lists without CSS |
| 6.2 | Prevent hydration mismatches | localStorage in useEffect |
| 6.3 | Virtualization for large lists | 100+ items without virtual |

### LOW Impact Rules

| # | Rule | Detection |
|---|------|-----------|
| 7.1 | Map for repeated lookups | `.find()` in loops |
| 7.2 | Cache repeated functions | Uncached slugify/format |
| 7.3 | toSorted vs sort | `.sort()` mutations |
| 7.4 | Stable callback refs | useLatest pattern missing |
| 8.1 | Correct useCallback deps | Over-broad dependencies |
| 8.2 | useMemo for derived data | Recalculating in render |
| 8.3 | Context splitting | Monolithic context |

---

## Integration with Other Commands

This command focuses **only** on React performance patterns. For complete coverage:

| Aspect | Command |
|--------|---------|
| React Performance | `/react-review` (this) |
| Bugs & Logic | `/bugs` |
| Architecture | `/arch-review` |
| UI/Accessibility | `/ui-review` |
| Final Check | `/verify` |

---

## After Review

If violations are found:

1. **CRITICAL**: Fix immediately - these cause significant slowdowns
2. **HIGH**: Fix before merge - noticeable impact
3. **MEDIUM**: Fix when possible - cumulative impact
4. **LOW**: Consider for optimization sprints

Run the fix then re-run:
```bash
/react-review {same-files}
```

---

## Senior Dev Review Mode

This review combines expertise from three tech giants:

### Google Principal Engineer
> "We serve billions of users. Every millisecond matters. Sequential fetches are unacceptable."

**Focus**: Waterfalls, caching, network efficiency

### Apple Principal Engineer
> "Performance is a feature. If it doesn't feel instant, it's broken."

**Focus**: Render performance, perceived speed, UX

### Microsoft Principal Engineer
> "We scaled Teams to 300M users. Re-render bugs compound at scale."

**Focus**: State management, re-render optimization, bundle size

---

## Reference: Vercel Dashboard Results

When these rules were applied to Vercel Dashboard:
- Lighthouse: **51 → 94**
- Cold starts: **40% faster**
- Build time: **28% faster**
- Render time: **270ms → 90ms**

These are the standards this review enforces.

---

## Unknown Scenario Handling

**STOP and ASK if:**
- [ ] Unfamiliar third-party library patterns
- [ ] Custom caching implementations
- [ ] Complex server component patterns
- [ ] Edge runtime specific code

**Review Principle**: *"When in doubt, measure. When measured, optimize."*

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-15 | Initial version with all 40+ Vercel rules |

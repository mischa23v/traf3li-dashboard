---
name: perf-check
description: Analyze code for performance issues - re-renders, memory leaks, bundle size
argument-hint: [path/to/file]... (optional)
---

# /perf-check - Performance Analysis

Launch the performance-profiler agent to identify performance issues in React/TypeScript code.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## Context

Build info: !`npm run build 2>&1 | tail -20`

Recent changes: !`git diff --name-only HEAD~5 -- "*.ts" "*.tsx" | head -20`

Arguments: $ARGUMENTS

---

## Analysis Scope

1. **If file paths are provided as arguments**, analyze those files: **$ARGUMENTS**

2. **If no arguments are provided**, analyze recent git changes:

**Staged Changes (Priority 1):**
```diff
!git diff --staged --name-only
```

**Unstaged Changes (Priority 2):**
```diff
!git diff HEAD --name-only
```

---

## Launch the Agent

Use the Task tool to launch the `performance-profiler` agent.

**Analysis Focus:**
1. **Re-render Issues** - Inline objects/functions, missing memo
2. **React Query Misuse** - Missing staleTime, over-fetching
3. **Bundle Size** - Large imports, missing tree-shaking
4. **Memory Leaks** - Uncleaned subscriptions/listeners
5. **List Performance** - Missing virtualization, bad keys
6. **Initial Load** - Sync imports of heavy libs
7. **Form Performance** - Excessive watch() usage

---

## Expected Output

```markdown
# Performance Analysis Report

## Summary
- Files analyzed: X
- Issues found: Y
- Estimated Impact: Critical/High/Medium/Low

## Critical Issues (Major UX Impact)
### Issue 1: {Title}
**File**: `{path}:{line}`
**Category**: {category}
**Impact**: {description}

**Problematic Code**:
```typescript
{code}
```

**Recommended Fix**:
```typescript
{fixed code}
```

## Bundle Analysis
| Chunk | Size | Recommendation |
|-------|------|----------------|

## Quick Wins
1. {Easy fix with big impact}

## Long-term Optimizations
1. {Strategic improvement}
```

---

## Common Performance Issues in TRAF3LI

| Issue | Location | Impact | Fix |
|-------|----------|--------|-----|
| Inline objects in JSX | Components | Re-renders | Extract to useMemo |
| Missing staleTime | useQuery calls | Over-fetching | Add CACHE_TIMES.X |
| Full lodash import | Any file | Bundle size | Import specific function |
| Non-virtualized tables | Data tables | Slow scroll | Enable virtualization |
| Missing enabled flag | Dependent queries | Wasted requests | Add enabled condition |

---

## After Analysis

If issues found:
1. Prioritize by impact
2. Fix critical issues first
3. Run build to verify bundle: `npm run build`
4. Run tests: `npm run test:run`

---

## Performance Benchmarks

| Metric | Target | How to Check |
|--------|--------|--------------|
| Bundle Size | < 500kb initial | `npm run build` |
| LCP | < 2.5s | Chrome DevTools |
| FID | < 100ms | Chrome DevTools |
| CLS | < 0.1 | Chrome DevTools |
| TTI | < 3.8s | Lighthouse |

---
name: perf-check
description: Analyze code for performance issues - re-renders, memory leaks, bundle size
argument-hint: [path/to/file]... (optional)
version: 1.1.0
risk: A
reviewer: performance_engineer
last_updated: 2026-01-14
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

---

## Senior Dev Review Mode

When analyzing performance, review as a **Chrome Team Performance Engineer** from Google who has optimized Core Web Vitals for the top 1000 websites.

### Reviewer Persona

> "I've spent years on the Chrome team measuring real-world performance. I've seen 'fast on localhost' become unusable on 3G networks.
> If I see these patterns, the code fails performance review."

### Junior Thinking vs Senior Reality

| Junior Thinking | Senior Reality | Why It Matters |
|-----------------|----------------|----------------|
| "It's fast on my machine" | Users have older devices, slower networks | 50% of web users are on mobile |
| "useMemo will fix it" | Premature optimization adds complexity | Measure first, optimize second |
| "It's only 1MB" | Every KB costs load time | 100KB = 1s on 3G |
| "We can lazy load later" | Initial bundle determines first load | Users bounce on slow loads |
| "It renders once" | React re-renders constantly | One bad component = whole tree |

### Chrome/Google Standards Applied

- [ ] Initial bundle < 200KB compressed
- [ ] LCP < 2.5s on 4G
- [ ] CLS < 0.1 (no layout shifts)
- [ ] INP < 200ms (interaction responsiveness)
- [ ] No blocking operations in render path
- [ ] Images lazy loaded below fold
- [ ] Heavy components code-split

### Cloudflare/Vercel Standards Applied

- [ ] Edge caching utilized
- [ ] API responses cached appropriately
- [ ] Static assets on CDN
- [ ] No unnecessary network waterfalls

### Red Flags That Fail Performance Review

```
Importing entire library for one function (lodash, moment)
useEffect without cleanup (memory leak)
Creating new objects/functions in render (re-render triggers)
Missing React.memo on list items
Synchronous localStorage in render path
Unbounded list without virtualization (>100 items)
Missing staleTime on useQuery (over-fetching)
Inline styles with objects (re-render every time)
```

---

## Unknown Scenario Handling

**STOP and ASK if:**
- [ ] Performance issue has unclear cause
- [ ] Optimization would significantly change architecture
- [ ] Metrics vary significantly between runs
- [ ] Third-party library is the bottleneck

**Performance Principle:** *"Measure first, optimize second. If you can't measure it, you can't improve it."*

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-14 | Added risk level, Senior Dev Review from Chrome Team |
| 1.0.0 | 2026-01-12 | Initial version |

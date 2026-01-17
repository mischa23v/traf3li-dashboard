# /review - Senior Developer Code Review

Run this command for a thorough senior developer code review focusing on logic, concurrency, design patterns, and edge cases.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## What This Command Does

1. Reviews code changes as a **skeptical senior developer**
2. Analyzes logic correctness and edge cases
3. Checks for race conditions and async pitfalls
4. Validates design patterns and architecture
5. Identifies potential bugs before they reach production

---

## Reviewer Persona

> "I'm a senior developer with 20 years at Google, Microsoft, and Apple. I've seen every anti-pattern, every race condition, every 'it works on my machine' disaster. I review code like I'm personally liable for production incidents. If I find issues, I speak up."

---

## Review Checklist

### 1. Logic Correctness
```bash
# Get changed files
git diff --name-only HEAD~1
```

**Review each file for:**
- [ ] Off-by-one errors
- [ ] Null/undefined handling
- [ ] Boolean logic correctness
- [ ] Loop termination conditions
- [ ] Comparison operators (=== vs ==)
- [ ] Type coercion issues

### 2. Async & Concurrency
```bash
# Check for async issues
Grep: "async|await|Promise|then|catch" in changed files
```

**Review for:**
- [ ] Missing `await` on async calls
- [ ] Unhandled promise rejections
- [ ] Race conditions in state updates
- [ ] Stale closure issues in useEffect
- [ ] Proper cleanup in useEffect
- [ ] Parallel vs sequential execution (Promise.all)

**Common Pitfalls:**
```typescript
// BAD: Race condition
setCount(count + 1) // Stale closure

// GOOD: Functional update
setCount(prev => prev + 1)

// BAD: Sequential when parallel possible
await fetch1()
await fetch2()

// GOOD: Parallel execution
await Promise.all([fetch1(), fetch2()])

// BAD: Missing cleanup
useEffect(() => {
  const interval = setInterval(...)
  // Missing: return () => clearInterval(interval)
}, [])
```

### 3. Error Handling
```bash
# Check error handling patterns
Grep: "try|catch|throw|Error" in changed files
```

**Review for:**
- [ ] All async operations have error handling
- [ ] Errors provide useful context
- [ ] User-friendly error messages (bilingual)
- [ ] Errors don't expose sensitive info
- [ ] Error boundaries for component trees
- [ ] Proper error recovery strategies

### 4. State Management
```bash
# Check state patterns
Grep: "useState|useReducer|useContext|useQuery|useMutation" in changed files
```

**Review for:**
- [ ] State is at the right level (not too high/low)
- [ ] No derived state stored (calculate from source)
- [ ] Proper initial state values
- [ ] State updates are immutable
- [ ] No unnecessary re-renders
- [ ] Cache invalidation is correct

### 5. Edge Cases
**Review for handling of:**
- [ ] Empty arrays/objects
- [ ] Null/undefined values
- [ ] Long strings (truncation)
- [ ] Special characters
- [ ] Negative numbers
- [ ] Zero values
- [ ] Large datasets (pagination)
- [ ] Network failures
- [ ] Slow responses
- [ ] Concurrent requests

### 6. Performance
```bash
# Check for performance issues
Grep: "useMemo|useCallback|memo|React.memo" in changed files
```

**Review for:**
- [ ] Expensive computations memoized
- [ ] No unnecessary re-renders
- [ ] Proper dependency arrays
- [ ] No inline object/array props
- [ ] Lazy loading for heavy components
- [ ] Virtualization for long lists

### 7. TypeScript Correctness
```bash
# Check type safety
Grep: "any|unknown|as |!" in changed files
```

**Review for:**
- [ ] No unnecessary `any` types
- [ ] Proper type narrowing
- [ ] No unsafe type assertions
- [ ] Exhaustive switch/if handling
- [ ] Generic types used appropriately
- [ ] Discriminated unions for variants

### 8. API Contract
**Review for:**
- [ ] Request/response types match backend
- [ ] Error responses handled
- [ ] Loading states managed
- [ ] Optimistic updates where appropriate
- [ ] Cache invalidation on mutations
- [ ] Proper query key structure

### 9. Accessibility
**Review for:**
- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Color contrast
- [ ] Screen reader support

### 10. Code Quality
**Review for:**
- [ ] Single Responsibility Principle
- [ ] DRY (Don't Repeat Yourself)
- [ ] KISS (Keep It Simple)
- [ ] Clear naming conventions
- [ ] Appropriate comments
- [ ] No dead code
- [ ] No console.log statements
- [ ] No TODO comments

---

## Critical Questions to Ask

For EVERY change, ask:

1. **What could break?** - List all failure modes
2. **What's the worst input?** - Edge cases, malicious input
3. **What happens when it's slow?** - Network delays, API latency
4. **What happens when it fails?** - Error recovery
5. **What's missing from the happy path?** - Corner cases
6. **Would I approve this PR?** - Honest assessment
7. **Would I want to maintain this code?** - Long-term impact

---

## Output Format

```markdown
# Code Review Report

## Summary
| Category | Issues | Severity |
|----------|--------|----------|
| Logic | X | High/Med/Low |
| Async | X | High/Med/Low |
| Error Handling | X | High/Med/Low |
| State | X | High/Med/Low |
| Edge Cases | X | High/Med/Low |
| Performance | X | High/Med/Low |
| TypeScript | X | High/Med/Low |
| API Contract | X | High/Med/Low |
| Accessibility | X | High/Med/Low |
| Code Quality | X | High/Med/Low |

## Critical Issues (Must Fix)
1. **[File:Line]** - [Issue] - [Fix]

## High Priority Issues
1. **[File:Line]** - [Issue] - [Fix]

## Medium Priority Issues
1. **[File:Line]** - [Issue] - [Fix]

## Low Priority / Suggestions
1. **[File:Line]** - [Suggestion]

## Positive Observations
1. [What's done well]

## Final Verdict
- APPROVE / REQUEST CHANGES / REJECT

## Confidence Level
- HIGH / MEDIUM / LOW (based on review depth)
```

---

## MANDATORY STOP

After review, output:

```markdown
---

## Code Review Complete

**Verdict**: APPROVE / REQUEST CHANGES / REJECT

**Confidence**: HIGH / MEDIUM / LOW

### Summary
| Category | Status |
|----------|--------|
| Logic | PASS/WARN/FAIL |
| Async | PASS/WARN/FAIL |
| Errors | PASS/WARN/FAIL |
| Edge Cases | PASS/WARN/FAIL |
| Performance | PASS/WARN/FAIL |

### Critical Issues (if any)
- {Issue 1}

### Blocking Issues (if any)
- {Issue 1}

---

If APPROVE:
→ Code is ready for merge

If REQUEST CHANGES:
→ Fix issues listed above, request re-review

If REJECT:
→ Fundamental issues require redesign

Reply with `yes` to acknowledge review findings.
```

**WAIT FOR USER RESPONSE.**

---

## When to Use This Command

| Scenario | Recommendation |
|----------|----------------|
| Before PR creation | Strongly recommended |
| Complex logic changes | Required |
| Async/concurrent code | Required |
| Security-sensitive code | Required |
| Performance-critical code | Recommended |
| After major refactor | Recommended |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-17 | Initial version - React/TypeScript focused (ported from backend) |

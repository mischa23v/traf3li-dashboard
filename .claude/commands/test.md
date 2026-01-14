---
name: test
description: Run tests with the test-runner agent - unit tests, coverage, or E2E
argument-hint: [unit|coverage|e2e|all] [path/to/file] (optional)
version: 1.1.0
risk: A
reviewer: null
last_updated: 2026-01-14
---

# /test - Test Runner Command

Launch the test-runner agent to execute and analyze test suites.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

---

## Context

Available test commands:
- `npm run test` - Unit tests (watch mode)
- `npm run test:run` - Unit tests (single run)
- `npm run test:coverage` - With coverage report
- `npm run test:e2e` - Playwright E2E tests
- `npm run test:all` - All tests

Recent test files changed: !`git diff --name-only HEAD~5 -- "*.test.ts" "*.test.tsx" "*.spec.ts" | head -10`

Arguments: $ARGUMENTS

---

## Test Modes

### 1. Unit Tests (Default)
```bash
/test
/test unit
/test src/hooks/useClients.test.ts
```

### 2. Coverage Report
```bash
/test coverage
```

### 3. E2E Tests
```bash
/test e2e
/test e2e tests/auth.spec.ts
```

### 4. All Tests
```bash
/test all
```

---

## Launch the Agent

Use the Task tool to launch the `test-runner` agent.

**Agent Prompt:**
```
Run tests with the following configuration:

Mode: {$ARGUMENTS or "unit"}
Scope: {specific file if provided}

Execute the appropriate test command and report:
1. Pass/fail status with counts
2. Coverage percentages (if coverage mode)
3. Detailed failure information with stack traces
4. Warnings and deprecations
5. Actionable next steps
```

---

## Expected Output

### Passing Tests:
```markdown
# Test Results

## Summary
- **Status**: PASS
- **Tests**: 150 passed, 0 failed, 5 skipped
- **Duration**: 12.5s
- **Coverage**: 78% (threshold: 70%)

## Coverage Report
| Area | Lines | Branches | Functions |
|------|-------|----------|-----------|
| src/hooks/ | 85% | 72% | 90% |
| src/lib/ | 92% | 88% | 95% |

## Next Steps
- All tests passing, ready to proceed
```

### Failing Tests:
```markdown
# Test Results

## Summary
- **Status**: FAIL
- **Tests**: 145 passed, 5 failed

## Failed Tests

### 1. useClients.test.ts > should fetch client list
**File**: `src/hooks/__tests__/useClients.test.ts:45`
**Error**: Expected { id: '1' }, Received: undefined
**Suggested Fix**: Check MSW handler mock data

## Commands to Re-run
```bash
npm run test:run -- src/hooks/__tests__/useClients.test.ts
```
```

---

## TRAF3LI Test Structure

| Type | Location | Pattern |
|------|----------|---------|
| Unit Tests | `src/**/__tests__/` | `*.test.ts(x)` |
| E2E Tests | `tests/` | `*.spec.ts` |
| Mocks | `src/test/mocks/` | MSW handlers |
| Setup | `src/test/setup.ts` | Vitest setup |

---

## Coverage Thresholds

| Metric | Threshold | Current |
|--------|-----------|---------|
| Lines | 70% | Check with /test coverage |
| Branches | 70% | Check with /test coverage |
| Functions | 70% | Check with /test coverage |
| Statements | 70% | Check with /test coverage |

---

## After Tests

If tests fail:
1. Review failure messages
2. Check if it's a test issue or code issue
3. Fix the root cause
4. Re-run specific failing tests
5. Run full suite before committing

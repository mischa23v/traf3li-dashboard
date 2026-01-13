# /verify - Final Verification (Phase 7)

You are conducting the FINAL verification of implemented features. This is the LAST step before creating a PR.

## FIRST: Read Project Rules
**MANDATORY**: Read `CLAUDE.md` at project root to understand project standards.

## Feature to Verify
Verify implementation of: $ARGUMENTS

## Verification Checklist

### 1. Build Verification
```bash
npm run build
```

**Check:**
- [ ] No TypeScript errors
- [ ] No compilation warnings
- [ ] Build completes successfully
- [ ] Bundle size reasonable

### 2. Code Quality Review

#### Self-Review Protocol
**"Review your own code like you're a senior dev doing a code review and you HATE this implementation."**

Run `git diff` and critically analyze:
- [ ] Edge cases handled?
- [ ] Error states covered?
- [ ] Loading states implemented?
- [ ] Empty states designed?
- [ ] Input validation complete?
- [ ] Type safety maintained?

#### Enterprise Standards Check
- [ ] No hardcoded values (use constants)
- [ ] Proper error boundaries
- [ ] Consistent naming conventions
- [ ] Code comments where logic isn't obvious
- [ ] No console.log statements
- [ ] No TODO comments left behind

### 3. Centralized Constants Usage

#### Routes Check
```bash
Grep: "ROUTES\." in modified files
Grep: hardcoded route strings (e.g., "/dashboard", "/clients")
```
- [ ] All routes from `@/constants/routes`
- [ ] No hardcoded route strings

#### Query Keys Check
```bash
Grep: "QueryKeys\." in modified files
Grep: hardcoded query key arrays
```
- [ ] All query keys from `@/lib/query-keys`
- [ ] No hardcoded query key arrays

#### Cache Configuration Check
```bash
Grep: "CACHE_TIMES\." in modified files
Grep: "staleTime:" with hardcoded values
```
- [ ] All cache times from `@/config/cache`
- [ ] No magic numbers for timing

#### Cache Invalidation Check
```bash
Grep: "invalidateCache\." in modified files
Grep: "queryClient.invalidateQueries" with manual keys
```
- [ ] Using `@/lib/cache-invalidation` patterns
- [ ] Proper invalidation on mutations

### 4. i18n Verification

#### Translation Keys
- [ ] All user-facing strings use translation keys
- [ ] Both Arabic (AR) and English (EN) translations exist
- [ ] No hardcoded strings in JSX

#### RTL/LTR Testing
```
1. Navigate to feature page
2. Switch to Arabic - take screenshot
3. Switch to English - take screenshot
4. Verify layout mirrors correctly
```

**RTL Checklist:**
- [ ] Flex directions correct
- [ ] Text alignment correct
- [ ] Icons mirrored where needed
- [ ] Spacing uses logical properties
- [ ] Numbers display correctly

### 5. Browser Testing

#### Visual Verification
```
1. Navigate to the implemented feature
2. Test all interactive elements
3. Check console for errors
4. Verify network requests
```

**Take Screenshots:**
- [ ] Desktop view (1920px)
- [ ] Tablet view (768px)
- [ ] Mobile view (375px)
- [ ] Dark mode (default)
- [ ] RTL layout
- [ ] LTR layout

#### Console Check
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No failed network requests
- [ ] No memory leaks (if applicable)

### 6. Functionality Testing

#### Happy Path
- [ ] Primary user flow works
- [ ] Data displays correctly
- [ ] Forms submit successfully
- [ ] Navigation works

#### Edge Cases
- [ ] Empty data state
- [ ] Single item
- [ ] Many items (pagination)
- [ ] Long text content
- [ ] Special characters
- [ ] Network error handling
- [ ] Loading states visible

#### User Interactions
- [ ] Click handlers work
- [ ] Keyboard navigation works
- [ ] Focus management correct
- [ ] Hover states visible
- [ ] Touch targets adequate (44px min)

### 7. Accessibility Check

#### Automated
```bash
# Run in browser console or use axe-core
# Check for WCAG 2.1 AA violations
```

#### Manual
- [ ] Tab through all elements
- [ ] Screen reader announces correctly
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] No keyboard traps

### 8. Performance Check

#### Load Time
- [ ] Initial load < 3 seconds
- [ ] Subsequent loads cached
- [ ] No layout shift (CLS)

#### Bundle Impact
- [ ] No unnecessary imports
- [ ] Lazy loading where appropriate
- [ ] Tree shaking working

### 9. Security Check

#### OWASP Top 10
- [ ] No XSS vulnerabilities (sanitized inputs)
- [ ] No SQL injection (parameterized queries)
- [ ] No exposed secrets
- [ ] CSRF protection in place
- [ ] Input validation on client and server

#### Data Handling
- [ ] Sensitive data not logged
- [ ] PII handled correctly
- [ ] Auth tokens secure

### 10. Documentation Check

#### Code Documentation
- [ ] Complex logic commented
- [ ] JSDoc for exported functions
- [ ] Type exports documented

#### API Documentation (if new endpoints)
- [ ] Endpoints documented
- [ ] Request/response types clear
- [ ] Error responses defined

## Output Format

```markdown
# Verification Report: {Feature}

## Build Status
 Build successful |  Build failed with [errors]

## Code Quality
| Check | Status | Notes |
|-------|--------|-------|
| TypeScript | / | |
| Constants | / | |
| Edge Cases | / | |
| Error Handling | / | |

## Browser Testing
| Test | Status | Screenshot |
|------|--------|------------|
| Desktop | / | [link] |
| Mobile | / | [link] |
| RTL | / | [link] |
| LTR | / | [link] |

## Issues Found
1.  [Issue description] - [Fix needed]
2.  [Issue description] - [Fix needed]

## Issues Fixed
1.  [Issue] - [How fixed]
2.  [Issue] - [How fixed]

## Final Status
- [ ] All checks passed
- [ ] Ready for production
- [ ] PR can be merged

## Remaining Items (if any)
- [ ] [Item requiring follow-up]
```

## Critical Self-Review Questions

Ask yourself these questions for EVERY implementation:

1. **What would break?** - List all failure modes
2. **What's the worst input?** - Edge cases and malicious input
3. **What happens when it's slow?** - Network/API delays
4. **What happens when it fails?** - Error recovery
5. **What's missing from the happy path?** - Corner cases
6. **Would I approve this PR?** - Honest assessment

# MANDATORY STOP

After verification, output:

```markdown
---

## Final Verification Complete

**Verdict**: PASS / FAIL

### Summary
| Category | Status |
|----------|--------|
| Build | / |
| Code Quality | / |
| RTL/LTR | / |
| Accessibility | / |
| Security | / |

### Issues (if any)
- {Issue 1}

---

## WORKFLOW COMPLETE

If PASS:
→ All 7 phases complete! Ready to create PR.

If FAIL:
→ Fix issues and re-run `/verify {feature}`

**Create PR now?** (yes to proceed)
```

---

# Workflow Chain (MANDATORY)

```
PHASE 1: PLANNING
/plan {topic}
    -> STOP -> Wait for approval -> Creates .requirements-approved

PHASE 2: DESIGN
/design {topic}
    -> STOP -> Wait for approval -> Creates .design-approved

PHASE 3: TASKS
/tasks {topic}
    -> STOP -> Wait for approval -> Creates .tasks-approved

PHASE 4: IMPLEMENTATION
/complete-phase
    -> STOP after EACH task -> Wait for "continue"
    (repeat until all tasks done)

PHASE 5: STRUCTURAL REVIEW (MANDATORY)
/arewedone
    -> Fix any issues found
    -> STOP -> Wait for approval

PHASE 6: ARCHITECTURE REVIEW (MANDATORY)
/arch-review
    -> Review recommendations
    -> STOP -> Wait for approval

PHASE 7: FINAL VERIFICATION
/verify {topic}         <- YOU ARE HERE (FINAL STEP)
    -> Confirm all checks pass

DONE -> Ready for PR
```

**Congratulations! You've completed the full workflow chain.**

---

## If Verification Fails

1. Document all failures
2. Prioritize by severity
3. Fix critical issues first
4. Re-run /verify
5. Only proceed when all checks pass

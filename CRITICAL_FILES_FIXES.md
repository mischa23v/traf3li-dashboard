# Critical Files - Security Fixes

This document shows the required fixes for the 10 most critical files with ungated console statements.

---

## 1. src/components/api-key-display.tsx

### Current Issues (2 instances)
- Line 33: `console.error('Failed to copy API key:', err)`
- Line 116: `console.error('Failed to copy API key:', err)`

### Security Risk
Could expose API key in error message if error object contains the key value.

### Fix Required

**Add import:**
```typescript
import { logger } from '@/utils/logger'
```

**Replace Line 33:**
```typescript
// Before
console.error('Failed to copy API key:', err)

// After
logger.error('Failed to copy API key to clipboard', err)
```

**Replace Line 116:**
```typescript
// Before
console.error('Failed to copy API key:', err)

// After
logger.error('Failed to copy API key to clipboard', err)
```

---

## 2. src/services/setupOrchestrationService.ts

### Current Issues (8 instances)
- Line 146: `console.error('Failed to fetch setup status:', error)`
- Line 192: `console.error('Failed to mark ... as complete:', error)`
- Line 222: `console.error('Failed to mark ... as skipped:', error)`
- Line 264: `console.error('Failed to save ... progress:', error)`
- Line 295: `console.error('Failed to fetch ... progress:', error)`
- Line 335: `console.error('Failed to get next incomplete module:', error)`
- Line 369: `console.error('Failed to reset setup progress:', error)`
- Line 402: `console.error('Failed to check setup reminder:', error)`

### Security Risk
Exposes setup orchestration logic and module names to users. Could reveal onboarding flow structure.

### Fix Required

**Add import at top of file:**
```typescript
import { logger } from '@/utils/logger'
```

**Replace all console.error statements:**

```typescript
// Line 146 - Before
console.error('Failed to fetch setup status:', error)
// After
logger.error('Failed to fetch setup status', error)

// Line 192 - Before
console.error(`Failed to mark ${module} as complete:`, error)
// After
logger.error('Failed to mark module as complete', error, { module })

// Line 222 - Before
console.error(`Failed to mark ${module} as skipped:`, error)
// After
logger.error('Failed to mark module as skipped', error, { module })

// Line 264 - Before
console.error(`Failed to save ${progress.module} progress:`, error)
// After
logger.error('Failed to save module progress', error, { module: progress.module })

// Line 295 - Before
console.error(`Failed to fetch ${module} progress:`, error)
// After
logger.error('Failed to fetch module progress', error, { module })

// Line 335 - Before
console.error('Failed to get next incomplete module:', error)
// After
logger.error('Failed to get next incomplete module', error)

// Line 369 - Before
console.error('Failed to reset setup progress:', error)
// After
logger.error('Failed to reset setup progress', error)

// Line 402 - Before
console.error('Failed to check setup reminder:', error)
// After
logger.error('Failed to check setup reminder', error)
```

---

## 3. src/services/sessions.service.ts

### Current Issues (1 instance)
- Line 51: `console.error('Failed to fetch sessions:', error)`

### Security Risk
Could expose session management structure and user session data.

### Fix Required

**Add import:**
```typescript
import { logger } from '@/utils/logger'
```

**Replace Line 51:**
```typescript
// Before
console.error('Failed to fetch sessions:', error)

// After
logger.error('Failed to fetch sessions', error)
```

---

## 4. src/services/rateLimitService.ts

### Current Issues (2 instances)
- Line 108: `console.error('Failed to log account lockout:', error)`
- Line 137: `console.error('Failed to log failed attempt:', error)`

### Security Risk
Could expose rate limiting logic, thresholds, and security mechanisms to attackers.

### Fix Required

**Add import:**
```typescript
import { logger } from '@/utils/logger'
```

**Replace console statements:**
```typescript
// Line 108 - Before
console.error('Failed to log account lockout:', error)

// After
logger.error('Failed to log account lockout event', error)

// Line 137 - Before
console.error('Failed to log failed attempt:', error)

// After
logger.error('Failed to log failed login attempt', error)
```

---

## 5. src/services/consent.service.ts

### Current Issues (1 instance)
- Line 191: `console.warn('[Consent Service] Failed to sync consents with backend:', error)`

### Security Risk
Could expose consent management structure and PDPL compliance implementation details.

### Fix Required

**Add import:**
```typescript
import { logger } from '@/utils/logger'
```

**Replace Line 191:**
```typescript
// Before
console.warn('[Consent Service] Failed to sync consents with backend:', error)

// After
logger.warn('Failed to sync consents with backend', { error })
```

---

## 6. src/contexts/PermissionContext.tsx

### Current Issues (3 instances)
- Line 124: `console.warn('[Permission] Check failed:', error)`
- Line 140: `console.warn('[Permission] Relation check failed:', error)`
- Line 173: `console.warn('[Permission] Page access check failed:', error)`

### Security Risk
HIGH - Exposes permission structure and RBAC logic to users. Attackers could map permission system.

### Fix Required

**Add import:**
```typescript
import { logger } from '@/utils/logger'
```

**Replace console statements:**
```typescript
// Line 124 - Before
console.warn('[Permission] Check failed:', error)

// After
logger.warn('Permission check failed', { error })

// Line 140 - Before
console.warn('[Permission] Relation check failed:', error)

// After
logger.warn('Permission relation check failed', { error })

// Line 173 - Before
console.warn('[Permission] Page access check failed:', error)

// After
logger.warn('Page access check failed', { error })
```

---

## 7. src/components/auth/PageAccessGuard.tsx

### Current Issues (1 instance)
- Line 184: `console.warn('[PageAccessGuard] Access check failed:', error)`

### Security Risk
Could expose protected routes and access control logic.

### Fix Required

**Add import:**
```typescript
import { logger } from '@/utils/logger'
```

**Replace Line 184:**
```typescript
// Before
console.warn('[PageAccessGuard] Access check failed:', error)

// After
logger.warn('Page access guard check failed', { error })
```

---

## 8. src/components/auth/captcha-challenge.tsx

### Current Issues (2 instances)
- Line 83: `console.error('Auto-execute CAPTCHA failed:', err)`
- Additional console statements for CAPTCHA loading errors

### Security Risk
Could expose CAPTCHA implementation details and bypass strategies.

### Fix Required

**Add import:**
```typescript
import { logger } from '@/utils/logger'
```

**Replace console statements:**
```typescript
// Line 83 - Before
console.error('Auto-execute CAPTCHA failed:', err)

// After
logger.error('CAPTCHA auto-execute failed', err)
```

---

## 9. src/features/auth/sign-in/components/user-auth-form.tsx

### Current Issues (3 instances)
- CAPTCHA loading errors
- CAPTCHA execution errors
- Authentication flow logging

### Security Risk
HIGH - Could expose authentication flow, CAPTCHA bypass methods, and login logic.

### Fix Required

**Add import:**
```typescript
import { logger } from '@/utils/logger'
```

**Replace all console.error statements:**
```typescript
// Before
console.error('Failed to load CAPTCHA config:', err)
console.error('CAPTCHA error:', error)
console.error('CAPTCHA execution failed:', err)

// After
logger.error('Failed to load CAPTCHA configuration', err)
logger.error('CAPTCHA verification error', error)
logger.error('CAPTCHA execution failed', err)
```

---

## 10. src/features/case-notion/components/*.tsx

### Current Issues (20+ instances across multiple files)
- block-editor.tsx: 3 instances
- notion-page-view.tsx: 8 instances
- notion-sidebar.tsx: 5 instances
- whiteboard-view.tsx: 4 instances

### Security Risk
Could expose document structure, page management logic, and internal IDs.

### Fix Required

**Add import to each file:**
```typescript
import { logger } from '@/utils/logger'
```

### block-editor.tsx

```typescript
// Before
console.error('Failed to create block:', error)
console.error('Failed to delete block:', error)
console.error('Failed to create first block:', error)

// After
logger.error('Failed to create block', error)
logger.error('Failed to delete block', error)
logger.error('Failed to create initial block', error)
```

### notion-page-view.tsx

```typescript
// Before
console.error('Failed to update title:', error)
console.error('Failed to toggle favorite:', error)
console.error('Failed to duplicate:', error)
console.error('Failed to archive:', error)
console.error('Failed to delete:', error)
console.error('Failed to export PDF:', error)
console.error('Failed to export Markdown:', error)
console.error('Failed to save view mode:', error)

// After
logger.error('Failed to update page title', error)
logger.error('Failed to toggle favorite status', error)
logger.error('Failed to duplicate page', error)
logger.error('Failed to archive page', error)
logger.error('Failed to delete page', error)
logger.error('Failed to export page as PDF', error)
logger.error('Failed to export page as Markdown', error)
logger.error('Failed to save view mode preference', error)
```

### notion-sidebar.tsx

```typescript
// Before
console.error('Failed to create page:', error)
console.error('Failed to delete page:', error)
console.error('Failed to duplicate page:', error)
console.error('Failed to archive page:', error)
console.error('Failed to toggle favorite:', error)

// After
logger.error('Failed to create page', error)
logger.error('Failed to delete page', error)
logger.error('Failed to duplicate page', error)
logger.error('Failed to archive page', error)
logger.error('Failed to toggle favorite', error)
```

### whiteboard-view.tsx

```typescript
// Before
console.error('Failed to update block position:', error)
console.error('Failed to update block size:', error)
console.error('Failed to create block:', error)
console.error('Failed to delete block:', error)
console.error('Failed to delete blocks:', error)

// After
logger.error('Failed to update block position', error)
logger.error('Failed to update block size', error)
logger.error('Failed to create block', error)
logger.error('Failed to delete block', error)
logger.error('Failed to delete multiple blocks', error)
```

---

## Implementation Order

### Phase 1: Critical Security Files (Week 1)
1. ✅ src/contexts/PermissionContext.tsx - Permission system exposure
2. ✅ src/components/auth/PageAccessGuard.tsx - Access control
3. ✅ src/services/rateLimitService.ts - Security mechanism exposure
4. ✅ src/components/auth/captcha-challenge.tsx - CAPTCHA bypass risk
5. ✅ src/features/auth/sign-in/components/user-auth-form.tsx - Auth flow

### Phase 2: High-Value Fixes (Week 2)
6. ✅ src/components/api-key-display.tsx - API key exposure
7. ✅ src/services/sessions.service.ts - Session management
8. ✅ src/services/consent.service.ts - PDPL compliance
9. ✅ src/services/setupOrchestrationService.ts - Onboarding flow
10. ✅ src/features/case-notion/components/*.tsx - Document management

### Phase 3: Remaining Files (Week 3)
11-267. All other files with ungated console statements

---

## Testing After Fixes

### 1. Development Testing
```bash
# Start dev server
npm run dev

# Verify logs still appear in console
# Open DevTools → Console
# Should see logger output
```

### 2. Production Build Testing
```bash
# Build for production
npm run build

# Serve production build
npm run preview

# Open DevTools → Console
# Should see NO console output (except critical errors)
```

### 3. Error Monitoring Testing
```bash
# Trigger an error in production mode
# Check Sentry dashboard for error
# Verify sanitization (no passwords, tokens, etc.)
```

---

## Verification Checklist

After implementing fixes:

- [ ] All 10 critical files updated with logger import
- [ ] All console.* statements replaced with logger.*
- [ ] Tested in development mode (logs appear)
- [ ] Tested in production build (no logs in console)
- [ ] Errors sent to Sentry (if configured)
- [ ] No sensitive data in error logs
- [ ] ESLint rules enabled
- [ ] No new console statements can be added

---

## Support & Questions

If you encounter issues:

1. Review logger utility: `/src/utils/logger.ts`
2. Review error sanitizer: `/src/utils/error-sanitizer.ts`
3. Check migration guide: `/MIGRATION_GUIDE_CONSOLE_TO_LOGGER.md`
4. Read full audit: `/API_ERROR_HANDLING_SECURITY_REPORT.md`

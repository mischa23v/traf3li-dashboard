# Migration Guide: Console Statements to Logger Utility

This guide shows how to replace unsafe `console.*` statements with the secure `logger` utility.

## Why Migrate?

**Security Issues with console statements:**
- ❌ Expose internal errors in production
- ❌ Leak API structure and endpoints
- ❌ Reveal validation rules and field names
- ❌ May contain PII or sensitive data
- ❌ Not monitored or aggregated
- ❌ Cannot be disabled in production

**Benefits of logger utility:**
- ✅ No console output in production
- ✅ Automatic error sanitization
- ✅ Sends errors to Sentry for monitoring
- ✅ PII and sensitive data redaction
- ✅ Structured logging with context
- ✅ Request ID correlation

---

## Migration Patterns

### Pattern 1: Simple console.log

**Before:**
```typescript
console.log('User logged in:', userId)
```

**After:**
```typescript
import { logger } from '@/utils/logger'

logger.debug('User logged in', { userId })
```

---

### Pattern 2: console.error with error object

**Before:**
```typescript
try {
  await apiCall()
} catch (error) {
  console.error('API call failed:', error)
}
```

**After:**
```typescript
import { logger } from '@/utils/logger'

try {
  await apiCall()
} catch (error) {
  logger.error('API call failed', error)
}
```

---

### Pattern 3: console.warn with context

**Before:**
```typescript
console.warn('[Permission] Check failed:', error)
```

**After:**
```typescript
import { logger } from '@/utils/logger'

logger.warn('Permission check failed', { error })
```

---

### Pattern 4: console.error with sensitive data

**Before:**
```typescript
console.error('Failed to copy API key:', err)
```

**After:**
```typescript
import { logger } from '@/utils/logger'

// Logger automatically sanitizes errors - safe to use
logger.error('Failed to copy API key', err)
```

---

### Pattern 5: Debug logging with multiple values

**Before:**
```typescript
console.log('[CaseNotion] Component render:', {
  caseId,
  pageId,
  selectedBlockId
})
```

**After:**
```typescript
import { logger } from '@/utils/logger'

logger.debug('CaseNotion component render', {
  caseId,
  pageId,
  selectedBlockId
})
```

---

### Pattern 6: Conditional console in development

**Before:**
```typescript
if (import.meta.env.DEV) {
  console.warn('[ErrorBoundary] Caught:', error)
}
```

**After:**
```typescript
import { logger } from '@/utils/logger'

// No need for DEV check - logger handles it automatically
logger.warn('ErrorBoundary caught error', { error })
```

---

### Pattern 7: Error in catch block

**Before:**
```typescript
try {
  await someOperation()
} catch (error) {
  console.error('Operation failed:', error)
  throw error
}
```

**After:**
```typescript
import { logger } from '@/utils/logger'

try {
  await someOperation()
} catch (error) {
  logger.error('Operation failed', error)
  throw error
}
```

---

### Pattern 8: Multiple console statements

**Before:**
```typescript
console.log('Fetching data...')
const data = await fetchData()
console.log('Data received:', data)
```

**After:**
```typescript
import { logger } from '@/utils/logger'

logger.debug('Fetching data')
const data = await fetchData()
logger.debug('Data received', { dataLength: data.length })
```

---

## File-by-File Migration Examples

### Example 1: src/components/api-key-display.tsx

**Before:**
```typescript
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('API key copied')
  } catch (err) {
    console.error('Failed to copy API key:', err)
    toast.error('Failed to copy')
  }
}
```

**After:**
```typescript
import { logger } from '@/utils/logger'

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('API key copied')
  } catch (err) {
    logger.error('Failed to copy API key', err)
    toast.error('Failed to copy')
  }
}
```

---

### Example 2: src/services/setupOrchestrationService.ts

**Before:**
```typescript
async fetchSetupStatus() {
  try {
    const response = await api.get('/setup/status')
    return response.data
  } catch (error) {
    console.error('Failed to fetch setup status:', error)
    throw error
  }
}
```

**After:**
```typescript
import { logger } from '@/utils/logger'

async fetchSetupStatus() {
  try {
    const response = await api.get('/setup/status')
    return response.data
  } catch (error) {
    logger.error('Failed to fetch setup status', error)
    throw error
  }
}
```

---

### Example 3: src/contexts/PermissionContext.tsx

**Before:**
```typescript
const checkPermission = async (action: string) => {
  try {
    const result = await permissionService.check(action)
    return result.allowed
  } catch (error) {
    console.warn('[Permission] Check failed:', error)
    return false
  }
}
```

**After:**
```typescript
import { logger } from '@/utils/logger'

const checkPermission = async (action: string) => {
  try {
    const result = await permissionService.check(action)
    return result.allowed
  } catch (error) {
    logger.warn('Permission check failed', { action, error })
    return false
  }
}
```

---

## Advanced Usage

### Structured Logging with Context

```typescript
import { logger, createLogContext } from '@/utils/logger'

const context = createLogContext({
  userId: user.id,
  firmId: user.firmId,
  action: 'update_case',
  caseId: '123',
})

logger.info('Case updated successfully', context)
```

### Error with Additional Context

```typescript
try {
  await updateCase(caseId, data)
} catch (error) {
  logger.error('Failed to update case', error, {
    caseId,
    userId: currentUser.id,
    firmId: currentUser.firmId,
  })
}
```

### Accessing Logs in Production

The logger exposes utility functions via `window.__logger`:

```javascript
// In browser console (production):
window.__logger.getRecentLogs(50)  // Get last 50 logs
window.__logger.getErrorLogs()      // Get only errors
window.__logger.downloadLogs()      // Download as JSON file
```

---

## Testing

### Unit Tests

```typescript
import { logger } from '@/utils/logger'

describe('MyComponent', () => {
  it('logs errors when API fails', async () => {
    const loggerSpy = vi.spyOn(logger, 'error')

    // ... test code that triggers error

    expect(loggerSpy).toHaveBeenCalledWith(
      'API call failed',
      expect.any(Error)
    )
  })
})
```

---

## Batch Migration Script

For bulk migration, you can use this regex find & replace:

### VS Code Find & Replace

**Find (regex):**
```regex
console\.(log|error|warn|info|debug)\((.*?)\)
```

**Replace:**
```
logger.$1($2)
```

Then add the import at the top:
```typescript
import { logger } from '@/utils/logger'
```

---

## Verification

After migration, verify no console statements remain:

```bash
# Count remaining ungated console statements
grep -r "console\." src \
  --include="*.ts" \
  --include="*.tsx" \
  | grep -v "import\.meta\.env\.DEV" \
  | grep -v "logger" \
  | grep -v "__tests__" \
  | wc -l

# Should output: 0
```

---

## ESLint Integration

After migration, enable ESLint rules to prevent regression:

1. Merge `.eslintrc.console-rules.json` into your `.eslintrc.js`
2. Run ESLint: `npm run lint`
3. Fix any remaining issues: `npm run lint -- --fix`

---

## Common Pitfalls

### ❌ DON'T: Mix console and logger

```typescript
// Bad - inconsistent
console.log('Starting...')
logger.debug('Processing...')
console.log('Done')
```

### ✅ DO: Use logger consistently

```typescript
// Good - consistent
logger.debug('Starting...')
logger.debug('Processing...')
logger.debug('Done')
```

---

### ❌ DON'T: Log sensitive data directly

```typescript
// Bad - might log password
logger.error('Login failed', { email, password, error })
```

### ✅ DO: Logger sanitizes automatically

```typescript
// Good - password will be redacted automatically
logger.error('Login failed', error, { email, password })
// Output: { email: 'user@example.com', password: '[REDACTED]' }
```

---

## Migration Checklist

- [ ] Import logger utility in file
- [ ] Replace all console.log with logger.debug
- [ ] Replace all console.error with logger.error
- [ ] Replace all console.warn with logger.warn
- [ ] Replace all console.info with logger.info
- [ ] Remove import.meta.env.DEV conditionals (logger handles it)
- [ ] Add context objects where useful
- [ ] Test in development mode
- [ ] Verify no console output in production build
- [ ] Enable ESLint rules

---

## Support

If you encounter issues during migration:

1. Check the logger utility documentation in `/src/utils/logger.ts`
2. Review the security audit report in `/API_ERROR_HANDLING_SECURITY_REPORT.md`
3. Test with `npm run build` to verify production behavior

---

**Migration Status Tracking:**

| Category | Total | Migrated | Remaining |
|----------|-------|----------|-----------|
| Components | 50 | 0 | 50 |
| Features | 150 | 0 | 150 |
| Services | 30 | 0 | 30 |
| Hooks | 20 | 0 | 20 |
| Contexts | 10 | 0 | 10 |
| Utils | 7 | 0 | 7 |
| **TOTAL** | **267** | **0** | **267** |

Update this table as you migrate files.

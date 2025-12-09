# Quick Console Error Testing Guide

## TL;DR - Run This Command

```bash
npm run test:console
```

This will check all 4 pages for console errors and warnings:
- /dashboard/messages
- /dashboard/clients
- /dashboard/contacts
- /dashboard/organizations

## Alternative Methods

### Method 1: Standalone Script (Recommended)
```bash
npm run test:console
# or
node check-console.mjs
```

### Method 2: Playwright Test
```bash
npm run test:console-playwright
# or
npx playwright test console-check.spec.ts --reporter=list
```

### Method 3: Manual Testing
1. Open http://localhost:5177 in Chrome/Edge
2. Open DevTools (F12)
3. Go to Console tab
4. Navigate to each page and check for errors

## What to Look For

### Errors (Red) - MUST FIX
```
❌ Cannot read property 'map' of undefined
❌ Failed to fetch
❌ WebSocket connection failed
❌ Uncaught TypeError: ...
```

### Warnings (Yellow) - SHOULD FIX
```
⚠️ React does not recognize prop
⚠️ Memory leak detected
⚠️ Missing translation key
```

### Info (Blue) - OK TO IGNORE
```
ℹ️ [Analytics] Initialized
ℹ️ [Analytics] Page view: /dashboard/messages
ℹ️ Sentry not available
```

## Expected Clean Output

```
================================================================================
SUMMARY
================================================================================
✓ /dashboard/messages: 0 errors, 0 warnings, 2 logs
✓ /dashboard/clients: 0 errors, 0 warnings, 1 logs
✓ /dashboard/contacts: 0 errors, 0 warnings, 1 logs
✓ /dashboard/organizations: 0 errors, 0 warnings, 1 logs
================================================================================
Total: 0 errors, 0 warnings, 4 logs
================================================================================
```

## Troubleshooting

### Server Not Running
```bash
# Start the dev server first
npm run dev
# Then in another terminal
npm run test:console
```

### Port Mismatch
The test expects the server on port **5177**.
If your server is on a different port, edit `check-console.mjs`:
```javascript
const BASE_URL = 'http://localhost:YOUR_PORT';
```

## Files Created

1. **check-console.mjs** - Main test script
2. **tests/console-check.spec.ts** - Playwright version
3. **CONSOLE_CHECK_INSTRUCTIONS.md** - Detailed instructions
4. **CONSOLE_ANALYSIS_REPORT.md** - Full analysis report
5. **QUICK_TEST_GUIDE.md** - This file

## Next Steps After Testing

1. Copy all error messages from the output
2. Share them for debugging
3. Fix errors in priority order:
   - Blocking errors (prevent functionality)
   - User-facing errors (visible issues)
   - Warnings (performance/UX)
   - Info logs (can be ignored)

---

For detailed information, see **CONSOLE_ANALYSIS_REPORT.md**

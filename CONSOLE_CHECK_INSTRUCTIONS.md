# Console Error Check Instructions

## Automated Testing

I've created two ways to check for console errors on the requested pages:

### Method 1: Run the Playwright Test

```bash
npx playwright test console-check.spec.ts --reporter=list
```

This will check all four pages:
- /dashboard/messages
- /dashboard/clients
- /dashboard/contacts
- /dashboard/organizations

### Method 2: Run the Node Script

```bash
node check-console.mjs
```

This provides a more detailed console output with categorized errors, warnings, and logs.

## Manual Testing

If you prefer to check manually:

1. Open the developer console (F12 or Cmd+Option+I)
2. Clear console messages
3. Navigate to each page:
   - http://localhost:5177/dashboard/messages
   - http://localhost:5177/dashboard/clients
   - http://localhost:5177/dashboard/contacts
   - http://localhost:5177/dashboard/organizations
4. Check for errors (red) and warnings (yellow)
5. Document all messages with their full text

## Common Issues to Look For

Based on the codebase analysis, watch for:

### React/Rendering Errors
- Hydration mismatches
- Invalid prop types
- Memory leaks from useEffect
- Unmounted component state updates

### Network Errors
- Failed API calls
- CORS issues
- 404 for missing resources
- Socket connection errors

### Third-Party Library Warnings
- React Router navigation warnings
- React Query stale query warnings
- i18next translation missing warnings
- Radix UI prop warnings

### Performance Warnings
- Large lists without virtualization
- Unoptimized re-renders
- Missing React.memo on expensive components

### Accessibility Warnings
- Missing ARIA labels
- Invalid HTML structure
- Focus management issues

## Files Created

1. **tests/console-check.spec.ts** - Playwright test suite
2. **check-console.mjs** - Standalone Node.js script
3. **CONSOLE_CHECK_INSTRUCTIONS.md** - This file

## Running the Tests

Make sure the dev server is running on port 5177:

```bash
npm run dev
```

Then in another terminal, run either test method above.

## Expected Output Format

The scripts will output:

```
================================================================================
Console Report for: /dashboard/messages
================================================================================

❌ ERRORS (2):

  1. [ERROR]
     Message: Cannot read property 'map' of undefined
     Location: http://localhost:5177/src/components/DataTable.tsx:45

  2. [PAGEERROR]
     Message: Uncaught TypeError: ...
     Stack: ...

⚠️  WARNINGS (1):

  1. [WARNING]
     Message: React does not recognize the `isActive` prop on a DOM element
     Location: http://localhost:5177/src/components/Button.tsx:12

================================================================================
```

## Summary Report

At the end, you'll get a summary:

```
================================================================================
SUMMARY
================================================================================
✓ /dashboard/messages: 0 errors, 0 warnings, 5 logs
❌ /dashboard/clients: 2 errors, 1 warnings, 3 logs
⚠️ /dashboard/contacts: 0 errors, 2 warnings, 4 logs
✓ /dashboard/organizations: 0 errors, 0 warnings, 2 logs
================================================================================
Total: 2 errors, 3 warnings, 14 logs
================================================================================
```

## Next Steps

After running the tests:

1. Review all errors and warnings
2. Prioritize critical errors (blocking functionality)
3. Address warnings that affect user experience
4. Log informational messages can often be ignored
5. Fix issues in order of severity

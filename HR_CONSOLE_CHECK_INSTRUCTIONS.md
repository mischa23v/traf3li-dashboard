# HR Pages Console Error Check

## Automated Testing

I've created a Playwright test file specifically for checking console errors on HR pages:

**File**: `/mnt/c/traf3li-dashboard/tests/hr-console-check.spec.ts`

### To Run the Automated Check:

```bash
# Make sure your dev server is running on port 5177
npm run dev

# In another terminal, run the test
npx playwright test tests/hr-console-check.spec.ts --reporter=line
```

This will check all 5 HR pages:
1. `/dashboard/hr/employees`
2. `/dashboard/hr/leave`
3. `/dashboard/hr/payroll`
4. `/dashboard/hr/attendance`
5. `/dashboard/hr/recruitment`

The test will report:
- Console errors
- Console warnings
- Page errors
- Other console messages
- File locations for errors (when available)

---

## Manual Testing Instructions

If the automated test cannot run, follow these steps:

### 1. Open Developer Tools

- Open your browser
- Navigate to `http://localhost:5177`
- Press `F12` or right-click and select "Inspect"
- Go to the **Console** tab
- Clear the console (trash icon)

### 2. Check Each Page

For each of the following pages, follow this process:

#### Page 1: `/dashboard/hr/employees`
1. Navigate to `http://localhost:5177/dashboard/hr/employees`
2. Wait for the page to fully load (2-3 seconds)
3. Check the Console tab for:
   - Red errors (🔴)
   - Yellow warnings (🟡)
4. Take a screenshot if errors are found
5. Copy the full error text

#### Page 2: `/dashboard/hr/leave`
1. Clear the console
2. Navigate to `http://localhost:5177/dashboard/hr/leave`
3. Wait for the page to fully load
4. Check for errors/warnings
5. Document any issues

#### Page 3: `/dashboard/hr/payroll`
1. Clear the console
2. Navigate to `http://localhost:5177/dashboard/hr/payroll`
3. Wait for the page to fully load
4. Check for errors/warnings
5. Document any issues

#### Page 4: `/dashboard/hr/attendance`
1. Clear the console
2. Navigate to `http://localhost:5177/dashboard/hr/attendance`
3. Wait for the page to fully load
4. Check for errors/warnings
5. Document any issues

#### Page 5: `/dashboard/hr/recruitment`
1. Clear the console
2. Navigate to `http://localhost:5177/dashboard/hr/recruitment/applicants`
3. Wait for the page to fully load
4. Check for errors/warnings
5. Document any issues

---

## What to Look For

### Critical Issues (🔴 Must Fix)
- **Uncaught errors**: `Uncaught TypeError`, `Uncaught ReferenceError`
- **Failed network requests**: 404, 500 errors
- **React errors**: "Cannot read property", "undefined is not a function"
- **CORS errors**: Cross-origin request blocked

### High Priority (🟡 Important)
- **Deprecation warnings**: Features that will be removed
- **React warnings**: Key prop missing, setState on unmounted component
- **Performance warnings**: Slow operations
- **Type errors**: TypeScript type mismatches

### Low Priority (ℹ️ Nice to Fix)
- **Info messages**: General logging
- **Debug messages**: Development-only logs
- **Feature announcements**: Library update notices

---

## Common Issues to Check

### 1. Missing Dependencies
Look for errors like:
```
Cannot find module '@/components/...'
Module not found: Can't resolve '...'
```

### 2. API Errors
```
Failed to fetch
404 Not Found
500 Internal Server Error
```

### 3. React Errors
```
Cannot read property 'map' of undefined
React Hook useEffect has missing dependencies
```

### 4. Type Errors
```
Property does not exist on type
Argument of type X is not assignable to parameter of type Y
```

### 5. Routing Errors
```
No routes matched location
Failed to navigate to...
```

---

## Reporting Template

Use this template to report your findings:

```markdown
# HR Pages Console Check Report

## Test Environment
- Date: [Date]
- Time: [Time]
- Browser: [Chrome/Firefox/Safari]
- Browser Version: [Version]
- Server: http://localhost:5177

---

## Page 1: /dashboard/hr/employees

### Status: ✅ Clean / ⚠️ Warnings / ❌ Errors

### Errors Found:
[None / List errors with full text]

### Warnings Found:
[None / List warnings]

---

## Page 2: /dashboard/hr/leave

### Status: ✅ Clean / ⚠️ Warnings / ❌ Errors

### Errors Found:
[None / List errors with full text]

### Warnings Found:
[None / List warnings]

---

## Page 3: /dashboard/hr/payroll

### Status: ✅ Clean / ⚠️ Warnings / ❌ Errors

### Errors Found:
[None / List errors with full text]

### Warnings Found:
[None / List warnings]

---

## Page 4: /dashboard/hr/attendance

### Status: ✅ Clean / ⚠️ Warnings / ❌ Errors

### Errors Found:
[None / List errors with full text]

### Warnings Found:
[None / List warnings]

---

## Page 5: /dashboard/hr/recruitment

### Status: ✅ Clean / ⚠️ Warnings / ❌ Errors

### Errors Found:
[None / List errors with full text]

### Warnings Found:
[None / List warnings]

---

## Summary

- Total Pages Checked: 5
- Pages with Errors: [X]
- Pages with Warnings: [X]
- Clean Pages: [X]

## Critical Issues Requiring Immediate Attention:
[List any blockers]

## Recommended Next Steps:
[Your recommendations]
```

---

## Alternative: Browser Console Script

You can also run this JavaScript in your browser console to capture errors:

```javascript
// Paste this in your browser console before navigating to pages
const consoleErrors = [];
const consoleWarnings = [];

// Override console.error
const originalError = console.error;
console.error = function(...args) {
  consoleErrors.push(args.join(' '));
  originalError.apply(console, args);
};

// Override console.warn
const originalWarn = console.warn;
console.warn = function(...args) {
  consoleWarnings.push(args.join(' '));
  originalWarn.apply(console, args);
};

// After navigating to all pages, run this to see the summary:
console.log('=== Console Errors ===');
console.log(consoleErrors);
console.log('\n=== Console Warnings ===');
console.log(consoleWarnings);
```

---

## Questions?

If you encounter any issues or need clarification on what to check, please ask!

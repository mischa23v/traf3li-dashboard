# 🚨 URGENT: Fix Vercel API URL Configuration

## The Problem

Your frontend deployed on Vercel is calling the **WRONG API URLs**:

❌ **Current (WRONG):**
```
https://api.traf3li.com/calendar
https://api.traf3li.com/dashboard/stats
https://api.traf3li.com/tasks
```

✅ **Should be (CORRECT):**
```
https://api.traf3li.com/api/calendar
https://api.traf3li.com/api/dashboard/stats
https://api.traf3li.com/api/tasks
```

**Notice:** The `/api` prefix is MISSING!

---

## Root Cause

Your Vercel deployment has the `VITE_API_URL` environment variable set to:
```
❌ VITE_API_URL=https://api.traf3li.com
```

This overrides the correct default in your code:
```typescript
// src/lib/api.ts (line 11)
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://api.traf3li.com/api'
                                   ↑ This correct default is being overridden
```

---

## How to Fix on Vercel

### Step 1: Access Vercel Dashboard

1. Go to https://vercel.com
2. Log in to your account
3. Find your project: **traf3li-dashboard**
4. Click on it

### Step 2: Update Environment Variable

1. Click on **"Settings"** tab
2. Click on **"Environment Variables"** in left sidebar
3. Find the variable named **`VITE_API_URL`**
4. Click **"Edit"** or the three dots menu (⋮)

### Step 3: Change the Value

**Change FROM:**
```
https://api.traf3li.com
```

**Change TO:**
```
https://api.traf3li.com/api
```

⚠️ **CRITICAL:** Make sure it ends with `/api`

### Step 4: Apply to All Environments

Make sure the variable is set correctly for:
- ✅ Production
- ✅ Preview
- ✅ Development

You can set it for all environments at once or update each individually.

### Step 5: Redeploy

After updating the environment variable:

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the three dots menu (⋮)
4. Click **"Redeploy"**
5. Wait for the deployment to complete (usually 1-2 minutes)

### Step 6: Verify the Fix

After redeployment, open your Vercel app:
```
https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app
```

Open browser DevTools (F12):
1. Go to **Network** tab
2. Reload the page
3. Check the API calls

You should now see:
```
✅ https://api.traf3li.com/api/calendar
✅ https://api.traf3li.com/api/dashboard/stats
✅ https://api.traf3li.com/api/tasks
```

---

## Alternative: Remove the Environment Variable

If you want to use the default value from the code:

1. In Vercel dashboard → Settings → Environment Variables
2. Find `VITE_API_URL`
3. Click **"Delete"**
4. Redeploy

The app will then use the default: `https://api.traf3li.com/api` ✅

---

## Why This Matters

Without the `/api` prefix:
- ❌ All API calls return **403 Forbidden**
- ❌ Login doesn't work
- ❌ Dashboard shows no data
- ❌ Calendar is empty
- ❌ Nothing works!

With the correct `/api` prefix:
- ✅ API calls reach the correct endpoints
- ✅ Login works
- ✅ Dashboard loads data
- ✅ Everything works!

---

## How to Check Current Value (Before Fix)

You can check what value Vercel is using:

1. Open your Vercel app in browser
2. Open DevTools Console (F12)
3. Run this command:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

If it shows:
- `https://api.traf3li.com` → ❌ WRONG (missing /api)
- `https://api.traf3li.com/api` → ✅ CORRECT
- `undefined` → ✅ OK (will use default)

---

## For Future Deployments

Always ensure `VITE_API_URL` includes the `/api` suffix:

**Correct formats:**
```bash
✅ https://api.traf3li.com/api
✅ http://localhost:8080/api
✅ https://staging-api.traf3li.com/api
```

**Wrong formats:**
```bash
❌ https://api.traf3li.com
❌ http://localhost:8080
❌ https://staging-api.traf3li.com
```

---

## Understanding the Code

### API Client (src/lib/api.ts)

```typescript
// Line 10-11
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://api.traf3li.com/api'

// Line 21-22
export const apiClient = axios.create({
  baseURL: API_BASE_URL,  // Uses the API_BASE_URL
  // ...
})
```

### Example API Call (src/services/calendarService.ts)

```typescript
// Line 82
const response = await apiClient.get<CalendarResponse>('/calendar', {
  params: filters,
})
```

**How the URL is built:**
```
baseURL + path = final URL
```

**If VITE_API_URL is set correctly:**
```
https://api.traf3li.com/api + /calendar = https://api.traf3li.com/api/calendar ✅
```

**If VITE_API_URL is wrong (current situation):**
```
https://api.traf3li.com + /calendar = https://api.traf3li.com/calendar ❌
```

---

## Testing After Fix

Once you've fixed the environment variable and redeployed, test these:

### 1. Browser Console Test
```javascript
// Should not throw CORS errors anymore
fetch('https://api.traf3li.com/api/calendar?startDate=2025-10-25&endDate=2025-12-05', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(d => console.log('✅ Success:', d))
  .catch(e => console.error('❌ Error:', e))
```

### 2. Check Network Tab
Open DevTools → Network tab:
- ✅ All API calls should use `/api/` prefix
- ✅ Should get 200 status (after backend CORS is fixed)
- ❌ Should NOT see `/dashboard`, `/calendar` without `/api`

### 3. CORS Test (from your machine)
```bash
# Run the CORS test script
./test-cors.sh

# Or manually test
curl -H "Origin: https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app" \
     -H "Content-Type: application/json" \
     --include \
     https://api.traf3li.com/api/calendar?startDate=2025-10-25&endDate=2025-12-05
```

---

## Quick Reference

| Component | Location | Current Issue |
|-----------|----------|---------------|
| **Environment Variable** | Vercel Dashboard | Set to `https://api.traf3li.com` (missing `/api`) |
| **Code Default** | `src/lib/api.ts:11` | Correct: `https://api.traf3li.com/api` |
| **API Calls** | All services | Missing `/api` prefix in URLs |
| **Backend Endpoints** | Backend server | All require `/api` prefix |

---

## Summary

**Action Required:**
1. Log in to Vercel dashboard
2. Go to Settings → Environment Variables
3. Change `VITE_API_URL` from `https://api.traf3li.com` to `https://api.traf3li.com/api`
4. Redeploy the app
5. Test that API calls now include `/api` prefix

**Time Required:** ~5 minutes

**Impact:** This fixes ALL API calls in your application!

---

## Questions?

After fixing this:
- Run `./test-cors.sh` to check backend CORS
- Check browser console for any remaining errors
- Verify API calls in Network tab

Once this is fixed + backend CORS is configured, your app will work perfectly! 🎉

# 🔧 Complete API Connection Fix Guide

**Status:** ❌ API calls are not working
**Last Updated:** November 23, 2025

---

## 🎯 Overview

Your frontend and backend are not communicating. There are **TWO issues** that need to be fixed:

### Issue 1: Frontend is calling WRONG URLs ❌
```
Frontend calls: https://api.traf3li.com/calendar
Should call:    https://api.traf3li.com/api/calendar
                                        ↑ Missing /api prefix
```

### Issue 2: Backend is blocking all requests ❌
```
Backend returns: 403 Forbidden "Access denied"
Backend should:  Return data with CORS headers
```

---

## 📋 Fix Order (IMPORTANT!)

You need to fix BOTH issues. Here's the order:

```
┌─────────────────────────────────────────┐
│ Step 1: Fix Vercel Environment Variable │  ← START HERE
│         (Frontend configuration)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Step 2: Deploy Backend CORS Config      │
│         (Backend configuration)          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ Step 3: Test Everything                 │
└─────────────────────────────────────────┘
```

---

## 🚀 Step 1: Fix Frontend URL Configuration

### The Problem

Your Vercel deployment has the wrong `VITE_API_URL` environment variable:
```
❌ Current: VITE_API_URL=https://api.traf3li.com
✅ Correct: VITE_API_URL=https://api.traf3li.com/api
```

### How to Fix

**📖 Full Guide:** See [`VERCEL_API_URL_FIX.md`](./VERCEL_API_URL_FIX.md)

**Quick Steps:**
1. Go to https://vercel.com
2. Open your **traf3li-dashboard** project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_API_URL`
5. Change value to: `https://api.traf3li.com/api` (add `/api` at end)
6. Click **Save**
7. Go to **Deployments** → Latest → **Redeploy**

**Time:** 5 minutes

### Verification

After redeploying, open browser console on your Vercel app and check:

```javascript
// Check what URL is being used
console.log(import.meta.env.VITE_API_URL)
// Should show: https://api.traf3li.com/api

// Check Network tab - API calls should now use /api/ prefix
// Example: https://api.traf3li.com/api/calendar ✅
```

---

## 🔐 Step 2: Fix Backend CORS Configuration

### The Problem

Your backend is returning `403 Forbidden` for all requests:
```bash
$ curl https://api.traf3li.com/health
Access denied
```

Tests show:
- ❌ No CORS headers
- ❌ Server blocking all requests
- ✅ Envoy proxy is running (detected in headers)
- ✅ Backend code has CORS config (but not deployed)

### The Root Cause

One of these is true:

1. **Backend CORS code not deployed** (most likely)
   - Your git repo has the CORS configuration
   - But it's not deployed to production at api.traf3li.com

2. **Backend not running**
   - The Node.js server is not started
   - Only Envoy proxy is responding

3. **Envoy blocking requests**
   - Envoy proxy needs configuration
   - Not passing requests to backend

### How to Fix

**📖 Backend Configuration Guide:** See [`BACKEND_CORS_CONFIG.md`](./BACKEND_CORS_CONFIG.md)

**📖 Detailed Test Results:** See [`CORS_TEST_RESULTS.md`](./CORS_TEST_RESULTS.md)

**📖 Render.com Deployment Guide:** See [`RENDER_DEPLOYMENT_GUIDE.md`](./RENDER_DEPLOYMENT_GUIDE.md) ⭐ **START HERE**

### ✅ Hosting Platform: Render.com

**Backend is hosted on Render.com!**

**Quick Deploy Steps:**

1. Go to https://dashboard.render.com
2. Find your backend service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait 2-3 minutes
5. Run `./test-cors.sh` to verify

**See [`RENDER_DEPLOYMENT_GUIDE.md`](./RENDER_DEPLOYMENT_GUIDE.md) for complete step-by-step instructions!**

---

## 🧪 Step 3: Test Everything

### Test 1: Frontend URL Configuration

**From your Vercel app, open browser console:**
```javascript
// Test 1: Check API URL
console.log(import.meta.env.VITE_API_URL)
// Expected: https://api.traf3li.com/api

// Test 2: Check Network tab
// Open Network tab, reload page
// All API calls should show: /api/calendar, /api/dashboard, etc.
```

### Test 2: Backend CORS

**From your terminal:**
```bash
# Run the automated CORS test
cd /path/to/traf3li-dashboard
./test-cors.sh
```

**Expected after CORS is fixed:**
```
✅ Status: 200 (OK)
✅ Access-Control-Allow-Origin header present
✅ Access-Control-Allow-Credentials: true
✅ Access-Control-Allow-Methods header present
```

### Test 3: End-to-End

**From your Vercel app:**
```javascript
// Try to fetch calendar data
fetch('https://api.traf3li.com/api/calendar?startDate=2025-10-25&endDate=2025-12-05', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(d => console.log('✅ Success:', d))
  .catch(e => console.error('❌ Error:', e))
```

**Expected:**
- ✅ No CORS errors
- ✅ Data returned from API
- ✅ Status 200

---

## 📊 Current Status

| Component | Status | Action |
|-----------|--------|--------|
| **Frontend Config** | ❌ Wrong | Fix Vercel env var |
| **Frontend Code** | ✅ Correct | No changes needed |
| **Backend Config** | ❌ Not Active | Deploy backend |
| **Backend Code** | ✅ Ready | Already in git repo |
| **Envoy Proxy** | ⚠️ Blocking | Will work after backend deploy |

---

## 🎯 What Success Looks Like

### Before Fix (Current State)

```
User Opens App
    ↓
Frontend calls: https://api.traf3li.com/calendar ❌ (missing /api)
    ↓
Backend returns: 403 Forbidden ❌
    ↓
User sees: Empty dashboard, no data ❌
```

### After Fix

```
User Opens App
    ↓
Frontend calls: https://api.traf3li.com/api/calendar ✅
    ↓
Backend returns: Data + CORS headers ✅
    ↓
User sees: Dashboard with data, everything works! ✅
```

---

## 📁 Documentation Files

| File | Purpose |
|------|---------|
| **`VERCEL_API_URL_FIX.md`** | Step-by-step Vercel environment variable fix |
| **`BACKEND_CORS_CONFIG.md`** | Backend CORS configuration guide |
| **`CORS_TEST_RESULTS.md`** | Detailed CORS test results and analysis |
| **`test-cors.sh`** | Automated CORS testing script |
| **`.env.example`** | Example environment variables (updated) |
| **`FIXING_API_CONNECTION.md`** | This file - complete overview |

---

## 🆘 Need Help?

### If you get stuck on Step 1 (Vercel):
- Check that you're logged into the correct Vercel account
- Make sure you have access to the traf3li-dashboard project
- Environment variable changes require redeployment to take effect

### If you get stuck on Step 2 (Backend):
- Tell me where your backend is hosted
- Share how you typically deploy
- I'll provide platform-specific instructions

### To test at any point:
```bash
./test-cors.sh
```

---

## ⚡ Quick Reference

**Frontend Fix:**
```
Vercel → Settings → Environment Variables → VITE_API_URL
Change to: https://api.traf3li.com/api
Redeploy
```

**Backend Fix:**
```
[Need hosting platform info to provide steps]
```

**Test:**
```bash
./test-cors.sh
```

---

## 🎉 Once Both Are Fixed

Once both issues are resolved:
1. ✅ Frontend calls correct URLs with `/api` prefix
2. ✅ Backend responds with data + CORS headers
3. ✅ Cookies are set and sent properly
4. ✅ Login works
5. ✅ Dashboard loads data
6. ✅ Calendar shows events
7. ✅ Everything works!

**Let's get started! Begin with Step 1: Vercel Environment Variable** 🚀

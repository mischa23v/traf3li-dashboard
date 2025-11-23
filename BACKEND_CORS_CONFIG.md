# Backend CORS Configuration Guide

## Critical Issue

Your backend at `https://api.traf3li.com` is **blocking requests** from your frontend at `https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app`.

This is causing all API calls to fail with:
```
Access to XMLHttpRequest at 'https://api.traf3li.com/...' from origin 'https://traf3li-dashboard-...' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

You need to configure CORS on your backend server to allow requests from your Vercel domain.

---

## Node.js/Express Configuration

If your backend uses Express.js, add this configuration:

### 1. Install CORS package

```bash
npm install cors
# or
yarn add cors
```

### 2. Configure CORS in your Express app

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',                                                    // Local development
    'http://localhost:3000',                                                    // Alternative local port
    'https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app', // Vercel production
    'https://*.vercel.app',                                                     // All Vercel preview deployments
    'https://yourdomain.com',                                                   // Your production domain
  ],
  credentials: true, // CRITICAL: Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware BEFORE other middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Your other middleware and routes
app.use(express.json());
// ... rest of your app
```

### 3. If using cookie-based authentication

Make sure your cookie settings are correct:

```javascript
// When setting cookies
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Only over HTTPS in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin
  domain: process.env.NODE_ENV === 'production' ? '.traf3li.com' : undefined,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

---

## Alternative: Dynamic Origin Function

For more flexibility, use a dynamic origin function:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) return callback(null, true);

    // Allow all Vercel deployments
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    // Check against whitelist
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

app.use(cors(corsOptions));
```

---

## Environment Variables Approach

Store allowed origins in environment variables:

```javascript
// .env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app,https://*.vercel.app

// server.js
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};
```

---

## Testing CORS Configuration

After applying the configuration:

### 1. Test with curl

```bash
curl -H "Origin: https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     --verbose \
     https://api.traf3li.com/api/auth/me
```

You should see these headers in the response:
```
Access-Control-Allow-Origin: https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

### 2. Test in browser console

Open your Vercel app and run in console:

```javascript
fetch('https://api.traf3li.com/api/auth/me', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(res => res.json())
  .then(data => console.log('✅ CORS working!', data))
  .catch(err => console.error('❌ CORS failed:', err));
```

---

## Common Issues and Solutions

### Issue 1: CORS headers not being sent

**Problem:** Backend not sending CORS headers at all.

**Solution:** Make sure CORS middleware is applied **BEFORE** your routes:

```javascript
// CORRECT ORDER
app.use(cors(corsOptions));          // ✅ CORS first
app.use(express.json());             // Then body parser
app.use('/api', routes);             // Then routes

// WRONG ORDER ❌
app.use('/api', routes);             // Routes first - CORS won't work!
app.use(cors(corsOptions));
```

### Issue 2: Cookies not being sent/received

**Problem:** Cookies work in localhost but not in production.

**Solution:**
1. Set `sameSite: 'none'` in production
2. Set `secure: true` in production (requires HTTPS)
3. Make sure frontend has `withCredentials: true`

```javascript
// Backend - Cookie settings
res.cookie('token', value, {
  httpOnly: true,
  secure: true,              // HTTPS only
  sameSite: 'none',          // Cross-origin
  domain: '.traf3li.com',    // Allow subdomains
});

// Frontend - Already configured in api.ts
withCredentials: true,       // ✅ Already set
```

### Issue 3: Wildcard origin with credentials

**Problem:** `Access-Control-Allow-Origin: *` with credentials doesn't work.

**Solution:** You **cannot** use `*` with credentials. Must specify exact origin:

```javascript
// ❌ WRONG - doesn't work with credentials
origin: '*',
credentials: true,

// ✅ CORRECT - specify exact origin
origin: 'https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app',
credentials: true,
```

### Issue 4: Preflight OPTIONS requests failing

**Problem:** Browser sends OPTIONS request before actual request, which fails.

**Solution:** Explicitly handle OPTIONS:

```javascript
// Add OPTIONS handler
app.options('*', cors(corsOptions));

// OR handle in each route
app.route('/api/auth/login')
  .options(cors(corsOptions))  // Handle preflight
  .post(controller.login);     // Handle actual request
```

---

## Vercel-Specific Configuration

If your frontend has multiple Vercel preview URLs, use pattern matching:

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    // Allow all Vercel deployments
    if (
      origin.includes('.vercel.app') ||
      origin.includes('localhost') ||
      origin === 'https://yourdomain.com'
    ) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
```

---

## Quick Checklist

- [ ] CORS middleware installed and configured
- [ ] Frontend origin added to allowed origins list
- [ ] `credentials: true` set on backend
- [ ] `withCredentials: true` set on frontend (✅ already done)
- [ ] Cookie `sameSite: 'none'` in production
- [ ] Cookie `secure: true` in production
- [ ] OPTIONS requests handled
- [ ] CORS middleware applied BEFORE routes
- [ ] Tested with curl or browser console
- [ ] Checked browser Network tab for CORS headers

---

## Contact Backend Team

If you don't have access to the backend, send this configuration to your backend team:

**Subject: URGENT - CORS Configuration Needed for Vercel Frontend**

> Hi Team,
>
> Our frontend deployed at `https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app` is unable to connect to the backend API at `https://api.traf3li.com` due to CORS policy blocking.
>
> Please add the following CORS configuration to allow requests from our Vercel domain:
>
> ```javascript
> const corsOptions = {
>   origin: [
>     'https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app',
>     'https://*.vercel.app', // For preview deployments
>   ],
>   credentials: true,
>   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
>   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
> };
> app.use(cors(corsOptions));
> ```
>
> Also ensure cookies use `sameSite: 'none'` and `secure: true` for cross-origin requests.
>
> Thanks!

---

## Next Steps

1. Apply CORS configuration to your backend
2. Restart backend server
3. Clear browser cache and cookies
4. Test the frontend again
5. Check browser Network tab to verify CORS headers are present

Once CORS is configured, your frontend will work perfectly! 🎉

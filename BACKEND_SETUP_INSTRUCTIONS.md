# Backend Setup Instructions for Developer

## Overview

The frontend authentication has been updated to remove test credentials bypass and OTP functionality. All login requests now flow through the backend API. This document provides instructions for ensuring the backend is properly configured to handle authentication.

---

## ⚠️ Critical Issue Fixed

**Problem:** Dashboard API calls were failing with **400 Bad Request** errors because the test credentials on the frontend bypassed the backend login, preventing the `accessToken` HttpOnly cookie from being set.

**Solution:** Removed frontend test credentials bypass. All logins now call the backend `/auth/login` endpoint to properly set the authentication cookie.

---

## Backend Requirements

### 1. Create a Test User in Database

Since the frontend test credentials bypass has been removed, you need to create a real test user in your MongoDB database.

**Option A: Using MongoDB Shell**
```javascript
use traf3li_db

db.users.insertOne({
  username: "test",
  email: "test@example.com",
  password: "$2b$10$YourBcryptHashedPasswordHere", // Hash of "test123"
  role: "admin", // or "lawyer" or "client"
  country: "SA",
  phone: "+966500000000",
  isSeller: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Option B: Use Your Existing User Registration Endpoint**
```bash
curl -X POST https://api.traf3li.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@example.com",
    "password": "test123",
    "phone": "+966500000000",
    "country": "SA",
    "role": "admin"
  }'
```

**Option C: Generate Bcrypt Hash for "test123"**
```javascript
// Node.js
const bcrypt = require('bcrypt');
const password = 'test123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Then insert the user with the generated hash.

---

### 2. Verify Login Endpoint Works

**File:** `src/controllers/auth.controller.js` (line 49-99)

The login endpoint should:
1. Accept `username` (can be username OR email) and `password`
2. Find user in database
3. Verify password with bcrypt
4. Generate JWT token
5. Set `accessToken` HttpOnly cookie
6. Return user data

**Test the Login Endpoint:**
```bash
curl -X POST https://api.traf3li.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "password": "test123"
  }' \
  -v
```

**Expected Response:**
- HTTP Status: **202 Accepted**
- Cookie Set: `accessToken=eyJhbGc...` (HttpOnly, Secure if production)
- Response Body:
```json
{
  "error": false,
  "message": "Success!",
  "user": {
    "_id": "...",
    "username": "test",
    "email": "test@example.com",
    "role": "admin",
    "country": "SA",
    "phone": "+966500000000",
    "isSeller": false
  }
}
```

---

### 3. Verify Cookie Configuration

**File:** `src/controllers/auth.controller.js` (around line 72-79)

Ensure the cookie configuration is correct:

```javascript
const cookieConfig = {
  httpOnly: true, // ✅ CRITICAL: Prevents JavaScript access
  sameSite: NODE_ENV === 'production' ? 'none' : 'strict', // ✅ CRITICAL for CORS
  secure: NODE_ENV === 'production', // ✅ CRITICAL: HTTPS only in production
  maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
  path: '/', // ✅ Available to all routes
  domain: NODE_ENV === 'production' ? '.traf3li.com' : undefined // ✅ Subdomain support
}

response.cookie('accessToken', token, cookieConfig)
```

**Important Notes:**
- `sameSite: 'none'` is **required** for cross-origin requests (frontend: `localhost:5173`, backend: `api.traf3li.com`)
- `secure: true` is **required** when using `sameSite: 'none'`
- `domain: '.traf3li.com'` allows cookie to be shared across subdomains

---

### 4. Verify CORS Configuration

**File:** `src/index.js` or wherever CORS is configured

Ensure CORS allows credentials:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://dashboard.traf3li.com',
    'https://traf3li.com'
  ],
  credentials: true, // ✅ CRITICAL: Allows cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Without `credentials: true`, cookies will NOT be sent or received!**

---

### 5. Verify Authentication Middleware

**File:** `src/middlewares/userMiddleware.js` (line 5-38)

The middleware should:
1. Check for `accessToken` in cookies **OR** Authorization header
2. Verify JWT token
3. Set `request.userID` and `request.isSeller` for use in routes
4. Return **400** if no token (this is what was causing the errors)
5. Return **400** if token invalid

**Current Implementation (Correct):**
```javascript
const userMiddleware = (request, response, next) => {
  // Check for token in cookies OR Authorization header
  let token = request.cookies.accessToken;

  if (!token && request.headers.authorization) {
    const authHeader = request.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  try {
    if(!token) {
      throw CustomException('Unauthorized access!', 400); // This was causing the 400 errors
    }

    const verification = jwt.verify(token, process.env.JWT_SECRET);
    if(verification) {
      request.userID = verification._id;
      request.isSeller = verification.isSeller;
      return next();
    }

    throw CustomException('Relogin', 400);
  }
  catch({message, status = 500}) {
    return response.status(status).send({
      error: true,
      message
    })
  }
}
```

---

### 6. Verify Dashboard Routes Are Protected

**File:** `src/routes/dashboard.route.js`

All dashboard endpoints should use `userMiddleware`:

```javascript
const { userMiddleware } = require('../middlewares/userMiddleware');

// ✅ All routes protected
app.get('/hero-stats', userMiddleware, getHeroStats);
app.get('/stats', userMiddleware, getDashboardStats);
app.get('/financial-summary', userMiddleware, getFinancialSummary);
app.get('/today-events', userMiddleware, getTodayEvents);
app.get('/recent-messages', userMiddleware, getRecentMessages);
```

---

## Testing Checklist

### ✅ Step 1: Test User Exists
```bash
# MongoDB Shell
use traf3li_db
db.users.findOne({ username: "test" })
```

### ✅ Step 2: Test Login API
```bash
curl -X POST https://api.traf3li.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' \
  -v
```

**Expected:**
- Status: 202
- Cookie: `Set-Cookie: accessToken=...`
- Body: `{ "error": false, "user": {...} }`

### ✅ Step 3: Test Protected Endpoint with Cookie
```bash
# Save cookie from login
COOKIE="accessToken=eyJhbGc..."

curl -X GET https://api.traf3li.com/api/dashboard/hero-stats \
  -H "Cookie: $COOKIE" \
  -v
```

**Expected:**
- Status: 200
- Body: Dashboard data

### ✅ Step 4: Test Protected Endpoint WITHOUT Cookie
```bash
curl -X GET https://api.traf3li.com/api/dashboard/hero-stats -v
```

**Expected:**
- Status: 400
- Body: `{ "error": true, "message": "Unauthorized access!" }`

---

## Common Issues and Solutions

### Issue 1: "Unauthorized access!" (400 Error)

**Cause:** Cookie not being sent with request

**Solutions:**
1. Verify `credentials: true` in CORS config
2. Verify `withCredentials: true` in frontend API client (already set)
3. Check cookie domain matches request domain
4. Verify cookie is not expired

---

### Issue 2: CORS Error

**Cause:** CORS not allowing credentials

**Solutions:**
1. Add `credentials: true` to CORS config
2. Add frontend URL to `origin` array
3. Don't use `origin: '*'` when `credentials: true`

---

### Issue 3: Cookie Not Set

**Cause:** Cookie configuration incorrect

**Solutions:**
1. Use `sameSite: 'none'` for cross-origin requests
2. Use `secure: true` when `sameSite: 'none'`
3. Verify `path: '/'` is set
4. Check `domain` is correct (`.traf3li.com` for subdomains)

---

### Issue 4: JWT Verification Failed

**Cause:** JWT_SECRET mismatch

**Solutions:**
1. Verify `.env` file has correct `JWT_SECRET`
2. Ensure same secret used for signing and verification
3. Check token expiration (default: 7 days)

---

## Environment Variables

Ensure these are set in `.env`:

```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/traf3li_db

# Optional
COOKIE_DOMAIN=.traf3li.com
```

---

## Production Deployment Notes

### SSL/HTTPS Required

- Frontend must be on HTTPS
- Backend must be on HTTPS
- Without HTTPS, `secure: true` cookies won't work

### Cookie Domain

- Set `domain: '.traf3li.com'` to share cookies across subdomains
- Example: `dashboard.traf3li.com` and `api.traf3li.com`

### CORS Origins

Update CORS to only allow production domains:

```javascript
origin: [
  'https://dashboard.traf3li.com',
  'https://traf3li.com'
],
```

---

## Summary

**What Changed:**
1. ❌ **Removed:** Frontend test credentials bypass
2. ✅ **Required:** Backend must have a real test user
3. ✅ **Required:** All logins must call `/auth/login` API
4. ✅ **Required:** Backend must set `accessToken` HttpOnly cookie
5. ✅ **Required:** CORS must allow credentials

**What to Test:**
1. Create test user in database
2. Test login API returns cookie
3. Test dashboard APIs work with cookie
4. Test dashboard APIs fail without cookie

---

## Contact

If you encounter issues, check:
1. MongoDB user exists with correct credentials
2. CORS allows credentials
3. Cookie configuration matches environment
4. JWT_SECRET is set and consistent

**Questions?** Provide error logs and cookie values for debugging.

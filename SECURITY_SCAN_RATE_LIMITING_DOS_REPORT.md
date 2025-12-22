# Security Audit Report: Rate Limiting & DoS Protection
## traf3li-backend Repository Analysis

**Date**: 2025-12-22
**Repository**: https://github.com/mischa23v/traf3li-backend
**Scope**: Rate Limiting, DoS Protection, Request Size Limits, Timeout Configurations
**Auditor**: Claude Code Security Scanner

---

## Executive Summary

This security audit identified **24 critical and high-severity vulnerabilities** related to rate limiting and DoS protection in the traf3li-backend application. While the application implements rate limiting on authentication endpoints and payments, **the majority of API routes lack any rate limiting protection**, exposing the system to denial-of-service attacks, resource exhaustion, and abuse.

### Key Findings:
- ✅ **5 route files** have proper rate limiting (auth, payment)
- ❌ **20+ route files** have NO rate limiting protection
- ❌ **Multiple controllers** allow unbounded queries without pagination limits
- ❌ **No query timeout enforcement** (maxTimeMS) at the database level
- ⚠️ **Missing maximum caps** on user-controlled pagination parameters

---

## Critical Issues (Severity: CRITICAL)

### 1. Invoice Routes Completely Unprotected
**File**: `/src/routes/invoice.route.js`
**Severity**: CRITICAL
**Impact**: Financial fraud, resource exhaustion, payment system abuse

**Issue**:
```javascript
// NO rate limiting middleware applied
POST /         - Create invoice (unprotected)
POST /:id/payment  - Create payment intent (unprotected)
POST /:id/record-payment  - Record payment (unprotected)
PATCH /:id     - Update invoice (unprotected)
DELETE /:id    - Delete invoice (unprotected)
```

**Risk**: Attackers can:
- Create unlimited fake invoices to exhaust database storage
- Flood payment gateway with fraudulent payment requests
- Delete legitimate invoices without throttling
- Cause financial system disruption

**Recommended Fix**:
```javascript
const { paymentRateLimiter, apiRateLimiter } = require('../middlewares/rateLimiter.middleware');

// Apply rate limiting
app.post('/', apiRateLimiter, userMiddleware, createInvoice);
app.post('/:id/payment', paymentRateLimiter, userMiddleware, createPaymentIntent);
app.post('/:id/record-payment', paymentRateLimiter, userMiddleware, recordPayment);
```

---

### 2. User Listing with Unbounded Query Parameters
**File**: `/src/controllers/user.controller.js` (GET /lawyers)
**Severity**: CRITICAL
**Impact**: Database overload, memory exhaustion, service disruption

**Issue**:
```javascript
// User can request unlimited results
const limit = parseInt(req.query.limit) || 10;  // No maximum cap!
const lawyers = await Lawyer.find(filters)
  .limit(limit)  // Attacker: ?limit=999999
  .skip(skip);
```

**Proof of Concept**:
```bash
# Request 1 million lawyers at once
curl "https://api.traf3li.com/lawyers?limit=1000000"
```

**Risk**:
- Memory exhaustion from loading millions of documents
- Database connection pool depletion
- Application crash/restart cycle

**Recommended Fix**:
```javascript
const MAX_LIMIT = 100;
const limit = Math.min(parseInt(req.query.limit) || 10, MAX_LIMIT);
```

---

### 3. Team Endpoint with No Pagination
**File**: `/src/controllers/user.controller.js` (GET /team)
**Severity**: CRITICAL
**Impact**: Resource exhaustion, slow queries, timeout errors

**Issue**:
```javascript
// Returns ALL team members without pagination
const users = await User.find({
  isSeller: true,
  role: { $in: ['lawyer', 'admin', 'paralegal', 'assistant'] }
});
// No .limit() or .skip() applied!
```

**Risk**: For firms with 10,000+ employees, this query returns all records at once.

**Recommended Fix**:
```javascript
const page = parseInt(req.query.page) || 1;
const limit = Math.min(parseInt(req.query.limit) || 20, 100);
const skip = (page - 1) * limit;

const users = await User.find(filters)
  .limit(limit)
  .skip(skip);

const total = await User.countDocuments(filters);
```

---

### 4. Document Upload/Download Without Rate Limiting
**File**: `/src/routes/document.route.js`
**Severity**: CRITICAL
**Impact**: Bandwidth exhaustion, storage costs, CDN overages

**Issue**:
```javascript
// NO rate limiting on uploads/downloads
POST /upload       - Get upload URL (unprotected)
POST /confirm      - Confirm upload (unprotected)
GET /:id/download  - Download document (unprotected)
POST /:id/versions - Upload new version (unprotected)
```

**Risk**:
- Unlimited file uploads draining S3/R2 storage quotas
- Bandwidth exhaustion from bulk downloads
- Cost overruns from CDN/storage providers

**Recommended Fix**:
```javascript
const { uploadRateLimiter } = require('../middlewares/rateLimiter.middleware');

app.post('/upload', uploadRateLimiter, userMiddleware, getUploadUrl);
app.post('/confirm', uploadRateLimiter, userMiddleware, confirmUpload);
app.get('/:id/download', apiRateLimiter, userMiddleware, downloadDocument);
```

---

### 5. Case Management Routes Unprotected
**File**: `/src/routes/case.route.js`
**Severity**: CRITICAL
**Impact**: Legal data manipulation, resource exhaustion

**Issue**: 40+ case management endpoints have NO rate limiting, including:
```javascript
POST /           - Create case (unprotected)
POST /:id/documents/upload  - Upload case documents (unprotected)
GET /statistics  - Complex aggregation queries (unprotected)
DELETE /:id      - Delete case (unprotected)
```

**Risk**:
- Mass case creation flooding the system
- Bulk document uploads overwhelming storage
- Expensive aggregation queries causing database slowdown

**Recommended Fix**:
```javascript
const { apiRateLimiter, uploadRateLimiter, searchRateLimiter } = require('../middlewares/rateLimiter.middleware');

app.post('/', apiRateLimiter, userMiddleware, createCase);
app.post('/:id/documents/upload', uploadRateLimiter, userMiddleware, uploadDocument);
app.get('/statistics', searchRateLimiter, userMiddleware, getStatistics);
```

---

### 6. Dashboard Controller with Unbounded Aggregations
**File**: `/src/controllers/dashboard.controller.js`
**Severity**: CRITICAL
**Impact**: Database overload, slow response times, cascading failures

**Issue**:
```javascript
// No $limit stage in aggregation pipeline
Case.aggregate([
  { $match: matchFilter },
  { $group: { _id: '$status', count: { $sum: 1 } } }
  // Missing: { $limit: 1000 }
]);

// User-controlled without maximum
const days = parseInt(request.query.days) || 30;  // No max cap!
// Attacker: ?days=36500 (100 years of data)
```

**Risk**:
- Aggregating 10+ years of data causes memory exhaustion
- Complex grouping operations block event loop
- Database locks preventing other queries

**Recommended Fix**:
```javascript
const MAX_DAYS = 365;
const days = Math.min(parseInt(request.query.days) || 30, MAX_DAYS);

Case.aggregate([
  { $match: matchFilter },
  { $limit: 10000 },  // Limit before grouping
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
```

---

### 7. Report Controller Allows Unbounded Historical Queries
**File**: `/src/controllers/report.controller.js`
**Severity**: CRITICAL
**Impact**: Database performance degradation, timeout errors

**Issue**:
```javascript
// No validation on limit parameter
const limit = parseInt(req.query.limit) || 100;  // No maximum!

// No validation on date ranges
if (startDate) invoiceQuery.issueDate = { $gte: new Date(startDate) };
// Attacker: ?startDate=1900-01-01&endDate=2099-12-31

// No validation on historical depth
const months = parseInt(req.query.months) || 12;  // No maximum!
// Attacker: ?months=1200 (100 years)
```

**Risk**:
- Full collection scans across decades of data
- Index inefficiency with extreme date ranges
- Query timeout causing request failures

**Recommended Fix**:
```javascript
const MAX_LIMIT = 500;
const MAX_MONTHS = 24;
const MAX_DATE_RANGE_DAYS = 730;  // 2 years

const limit = Math.min(parseInt(req.query.limit) || 100, MAX_LIMIT);
const months = Math.min(parseInt(req.query.months) || 12, MAX_MONTHS);

// Validate date range
const start = new Date(startDate);
const end = new Date(endDate);
const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
if (daysDiff > MAX_DATE_RANGE_DAYS) {
  return res.status(400).json({ error: 'Date range exceeds maximum of 2 years' });
}
```

---

### 8. Government Verification API Without Rate Limiting
**File**: `/src/routes/verify.route.js`
**Severity**: CRITICAL
**Impact**: Third-party API quota exhaustion, service suspension, financial penalties

**Issue**:
```javascript
// NO rate limiting on external API calls
POST /yakeen/national-id   - Saudi ID verification (unprotected)
POST /wathq/cr-info        - Commercial registry (unprotected)
POST /moj/attorney-info    - Attorney verification (unprotected)
```

**Risk**:
- Unlimited calls to paid government APIs
- Quota exhaustion causing service disruption
- Financial penalties from API providers
- Account suspension due to abuse

**Recommended Fix**:
```javascript
const { sensitiveRateLimiter } = require('../middlewares/rateLimiter.middleware');

// Strict rate limiting for external APIs
const externalApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 50,  // 50 requests per hour
  message: 'Too many verification requests'
});

app.post('/yakeen/national-id', externalApiLimiter, verifyToken, verifyNationalId);
app.post('/wathq/cr-info', externalApiLimiter, verifyToken, getCompanyInfo);
```

---

## High Severity Issues (Severity: HIGH)

### 9. Account Routes Missing Rate Limiting
**File**: `/src/routes/account.route.js`
**Severity**: HIGH
**Impact**: Resource enumeration, account manipulation

**Issue**:
```javascript
GET /           - List all accounts (no rate limiting)
POST /          - Create account (no rate limiting)
DELETE /:id     - Delete account (no rate limiting)
```

**Recommended Fix**: Apply `apiRateLimiter` to all account routes.

---

### 10. Auth Logout Endpoint Unprotected
**File**: `/src/routes/auth.route.js`
**Severity**: HIGH
**Impact**: Session exhaustion, legitimate user disruption

**Issue**:
```javascript
POST /logout    - No rate limiter specified
```

**Risk**: Attacker can invalidate sessions repeatedly, forcing re-authentication.

**Recommended Fix**:
```javascript
app.post('/logout', authRateLimiter, authenticate, logout);
```

---

### 11. No Password Reset Endpoint Found
**File**: N/A - Missing implementation
**Severity**: HIGH
**Impact**: Account recovery failure, user lockout

**Issue**: No `/forgot-password` or `/reset-password` endpoints detected in:
- `/src/routes/auth.route.js`
- `/src/routes/account.route.js`
- `/src/routes/user.route.js`

**Observation**: Only password **change** endpoint exists (requires authentication).

**Recommended Implementation**:
```javascript
// Should have rate limiting!
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 3,  // 3 attempts per hour
  skipSuccessfulRequests: true
});

app.post('/forgot-password', passwordResetLimiter, sendResetEmail);
app.post('/reset-password', passwordResetLimiter, resetPassword);
```

---

### 12. No Query Timeout at Database Level
**File**: `/src/configs/db.js`
**Severity**: HIGH
**Impact**: Slow queries blocking connection pool, cascading failures

**Issue**:
```javascript
// MongoDB connection config
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  // Missing: maxTimeMS for query execution timeout
};
```

**Risk**: Complex aggregation queries can run indefinitely, blocking connections.

**Recommended Fix**:
```javascript
// In db.js - Add global query timeout
mongoose.set('maxTimeMS', 15000);  // 15 seconds

// Or per-query
Case.aggregate(pipeline).maxTimeMS(10000);
```

---

### 13. Registration Accepts Unbounded Arrays
**File**: `/src/controllers/auth.controller.js` (authRegister)
**Severity**: HIGH
**Impact**: Memory exhaustion, storage bloat

**Issue**:
```javascript
lawyerProfile: {
  specializations: req.body.specializations,  // No length validation
  languages: req.body.languages,              // No length validation
  courts: req.body.courts                     // No length validation
}
```

**Attack Vector**:
```javascript
POST /register
{
  "specializations": ["spec1", "spec2", ..., "spec10000"],  // 10k items
  "languages": [...1000 languages],
  "courts": [...5000 courts]
}
```

**Recommended Fix**:
```javascript
const MAX_ARRAY_LENGTH = 50;

if (specializations && specializations.length > MAX_ARRAY_LENGTH) {
  return res.status(400).json({ error: 'Too many specializations' });
}
if (languages && languages.length > MAX_ARRAY_LENGTH) {
  return res.status(400).json({ error: 'Too many languages' });
}
if (courts && courts.length > MAX_ARRAY_LENGTH) {
  return res.status(400).json({ error: 'Too many courts' });
}
```

---

## Medium Severity Issues (Severity: MEDIUM)

### 14. Missing CAPTCHA on Public Endpoints
**File**: `/src/routes/auth.route.js`
**Severity**: MEDIUM
**Impact**: Automated bot attacks, spam registration

**Issue**: No CAPTCHA verification on:
- `POST /register` - Registration endpoint
- `POST /login` - Login endpoint
- `POST /send-otp` - OTP generation

**Observation**: Repository has `captcha.route.js` but not integrated into auth flow.

**Recommended Fix**:
```javascript
const { validateCaptcha } = require('../middlewares/captcha.middleware');

app.post('/register', validateCaptcha, authRateLimiter, register);
app.post('/login', validateCaptcha, authRateLimiter, login);
```

---

### 15. Security Middleware String Truncation Issues
**File**: `/src/middlewares/security.middleware.js`
**Severity**: MEDIUM
**Impact**: Data loss, application logic errors

**Issue**:
```javascript
// Silently truncates strings to 1MB
if (obj[key].length > 1000000) {
  obj[key] = obj[key].substring(0, 1000000);  // Data loss!
}
```

**Risk**: Truncation instead of rejection can cause:
- Corrupted JSON payloads
- Invalid data storage
- Business logic errors

**Recommended Fix**:
```javascript
if (obj[key].length > 1000000) {
  throw new Error('Field exceeds maximum length of 1MB');
}
```

---

### 16. No Maximum Connection Pool Monitoring
**File**: `/src/configs/db.js`
**Severity**: MEDIUM
**Impact**: Connection pool exhaustion under load

**Issue**:
```javascript
maxPoolSize: 20,
minPoolSize: 5,
// No pool exhaustion monitoring or alerts
```

**Risk**: Under heavy load, all 20 connections may be exhausted without visibility.

**Recommended Fix**:
```javascript
// Add pool monitoring
mongoose.connection.on('error', (err) => {
  if (err.message.includes('pool is full')) {
    // Alert/log pool exhaustion
    console.error('MongoDB pool exhausted!', err);
  }
});
```

---

### 17. Missing Rate Limiting on Search Endpoints
**Files**: Multiple controllers
**Severity**: MEDIUM
**Impact**: Resource exhaustion from expensive searches

**Issue**: While `searchRateLimiter` exists in middleware, many search endpoints don't use it:
- Dashboard statistics searches
- Report generation searches
- Lawyer profile searches

**Recommended Fix**: Apply `searchRateLimiter` consistently to all search/filter endpoints.

---

### 18. No IP-Based Independent Rate Limiting
**File**: `/src/middlewares/rateLimiter.middleware.js`
**Severity**: MEDIUM
**Impact**: Distributed attacks bypassing per-user limits

**Issue**: Rate limiting is primarily user-based (JWT extraction):
```javascript
// Smart rate limiter keys by user ID
const userId = extractUserId(req);
```

**Risk**: Attackers using multiple accounts can bypass rate limits.

**Recommended Addition**:
```javascript
// Add IP-based limiting for unauthenticated routes
const ipRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.ip  // Pure IP-based
});
```

---

## Low Severity Issues (Severity: LOW)

### 19. Aggressive Connection Pool Size
**File**: `/src/configs/db.js`
**Severity**: LOW
**Impact**: Potential database server strain

**Issue**:
```javascript
maxPoolSize: 20,  // May be too aggressive for small MongoDB instances
```

**Recommendation**: Monitor database server load and adjust if needed.

---

### 20. Request Body Size Limit Missing Validation
**File**: `/src/server.js`
**Severity**: LOW
**Impact**: Large payload handling inconsistency

**Issue**:
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

**Observation**: 10MB is appropriate, but lacks per-endpoint customization.

**Recommendation**: Consider lower limits for specific endpoints:
```javascript
// Most endpoints: 1MB
app.use('/api', express.json({ limit: '1mb' }));

// File upload endpoints: 10MB
app.use('/api/documents', express.json({ limit: '10mb' }));
```

---

### 21. Missing Slow Query Alerting
**File**: `/src/configs/db.js`
**Severity**: LOW
**Impact**: Delayed detection of performance issues

**Issue**: Slow query monitoring exists but no alerting:
```javascript
SLOW_QUERY_THRESHOLD_MS: 100
// Logs slow queries but no alerts to ops team
```

**Recommendation**: Integrate with monitoring system (Sentry, DataDog, etc.).

---

### 22. No Circuit Breaker on External APIs
**File**: `/src/routes/verify.route.js`
**Severity**: LOW
**Impact**: Cascading failures from external API downtime

**Observation**: `opossum` package installed but not used for government API calls.

**Recommended Fix**:
```javascript
const CircuitBreaker = require('opossum');

const yakeenBreaker = new CircuitBreaker(callYakeenAPI, {
  timeout: 10000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});
```

---

### 23. Parallel Promise.all Without Timeout
**File**: `/src/controllers/dashboard.controller.js`
**Severity**: LOW
**Impact**: Request hanging on slow queries

**Issue**:
```javascript
const [cases, events, messages] = await Promise.all([
  getCases(),
  getEvents(),
  getMessages()
  // No timeout wrapper
]);
```

**Recommended Fix**:
```javascript
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
};

const results = await Promise.all([
  withTimeout(getCases(), 5000),
  withTimeout(getEvents(), 5000),
  withTimeout(getMessages(), 5000)
]);
```

---

### 24. Session Timeout Configuration Not Visible
**File**: `/src/middlewares/sessionTimeout.middleware.js`
**Severity**: LOW
**Impact**: Unable to verify session timeout enforcement

**Issue**: File referenced in server.js but content not analyzed.

**Recommendation**: Verify session timeout middleware implements:
- Idle timeout (30 minutes recommended)
- Absolute timeout (24 hours recommended)
- Proper session invalidation

---

## Positive Findings (Security Best Practices Implemented)

✅ **1. Rate Limiting Infrastructure Exists**
- `express-rate-limit` v8.2.1 installed
- `express-slow-down` v3.0.1 for gradual throttling
- `rate-limit-mongo` v2.3.2 for distributed rate limiting
- Smart rate limiter differentiates authenticated/unauthenticated users

✅ **2. Authentication Endpoints Protected**
```javascript
// auth.route.js
POST /register     - authRateLimiter (15 req/15min)
POST /login        - authRateLimiter (15 req/15min)
POST /send-otp     - sensitiveRateLimiter (3 req/hour)
POST /verify-otp   - authRateLimiter
```

✅ **3. Payment Routes Have Dedicated Rate Limiter**
```javascript
// payment.route.js
app.use(paymentRateLimiter);  // 10 req/hour
```

✅ **4. Account Lockout Service Prevents Brute Force**
- Checks locked status before database queries
- Prevents credential stuffing attacks

✅ **5. Global Security Headers Configured**
- Helmet CSP with nonce-based script execution
- COOP, COEP, CORP headers
- CSRF token generation and validation

✅ **6. Request Sanitization Implemented**
- XSS prevention through sanitization
- String length limits (1MB max per field)
- Recursive object sanitization

✅ **7. Database Connection Resilience**
- Connection pool management (5-20 connections)
- Retry writes and reads enabled
- Heartbeat monitoring (10s intervals)
- Fast failure detection (5s server selection timeout)

✅ **8. Compression Enabled**
- Zstd, Snappy, Zlib compression
- 512-byte threshold
- Smart filtering to avoid compressing pre-compressed content

✅ **9. Audit Logging in Place**
- Action logging with severity levels
- Firm-level isolation
- Comprehensive audit trails

✅ **10. Performance Monitoring**
- Slow query profiling (100ms threshold)
- Sentry error tracking
- Connection warmup strategy

---

## Summary of Issues by Severity

| Severity | Count | Issues |
|----------|-------|--------|
| **CRITICAL** | 8 | Invoice routes unprotected, unbounded queries, document uploads, case routes, dashboard aggregations, report queries, government API, team endpoint |
| **HIGH** | 5 | Account routes, logout endpoint, missing password reset, no query timeout, unbounded registration arrays |
| **MEDIUM** | 6 | Missing CAPTCHA, string truncation, pool monitoring, search rate limiting, IP-based limiting, body size validation |
| **LOW** | 5 | Pool size tuning, slow query alerting, circuit breakers, Promise.all timeout, session timeout visibility |
| **TOTAL** | **24** | |

---

## Recommended Immediate Actions (Priority Order)

### 🔴 Critical (Fix Within 24 Hours)

1. **Apply rate limiting to invoice routes** - Financial risk
2. **Add maximum caps to all limit parameters** - DoS prevention
3. **Implement pagination on GET /team endpoint** - Resource exhaustion
4. **Add rate limiting to document upload/download** - Bandwidth/cost protection
5. **Add rate limiting to case management routes** - Core functionality protection
6. **Add $limit stages to dashboard aggregations** - Database protection
7. **Validate date ranges in report controller** - Query optimization
8. **Add rate limiting to government verification APIs** - Third-party quota protection

### 🟠 High Priority (Fix Within 1 Week)

9. **Add rate limiting to account routes** - Data protection
10. **Protect logout endpoint with rate limiter** - Session security
11. **Implement password reset with rate limiting** - Account recovery
12. **Configure global maxTimeMS for queries** - Timeout protection
13. **Validate array lengths in registration** - Input validation

### 🟡 Medium Priority (Fix Within 2 Weeks)

14. **Integrate CAPTCHA on public endpoints** - Bot protection
15. **Change string truncation to rejection** - Data integrity
16. **Add connection pool monitoring** - Visibility
17. **Apply searchRateLimiter consistently** - Search protection
18. **Implement IP-based rate limiting** - Distributed attack prevention

### 🟢 Low Priority (Fix Within 1 Month)

19. **Review and tune connection pool size** - Optimization
20. **Add slow query alerting** - Monitoring improvement
21. **Implement circuit breakers for external APIs** - Resilience
22. **Add timeouts to Promise.all calls** - Request reliability
23. **Implement per-endpoint body size limits** - Fine-tuning
24. **Verify session timeout configuration** - Audit compliance

---

## Implementation Examples

### Rate Limiter Configuration Template

```javascript
// src/middlewares/rateLimiter.middleware.js

const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

// Create rate limiters for different use cases
const createRateLimiter = (options) => {
  return rateLimit({
    store: new MongoStore({
      uri: process.env.MONGO_URI,
      collectionName: 'rateLimits',
      expireTimeMs: options.windowMs
    }),
    ...options
  });
};

// Invoice-specific rate limiter
const invoiceRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 50,  // 50 requests per window
  message: 'Too many invoice requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Document upload rate limiter (already exists, example)
const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 50,  // 50 uploads per hour
  message: 'Upload limit exceeded'
});

// General API rate limiter (already exists)
const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'API rate limit exceeded'
});

module.exports = {
  authRateLimiter,
  apiRateLimiter,
  publicRateLimiter,
  sensitiveRateLimiter,
  uploadRateLimiter,
  paymentRateLimiter,
  searchRateLimiter,
  invoiceRateLimiter,  // NEW
  smartRateLimiter
};
```

### Global Query Timeout Configuration

```javascript
// src/configs/db.js

const mongoose = require('mongoose');

// Set global query timeout
mongoose.set('maxTimeMS', 15000);  // 15 seconds

// Monitor slow queries
mongoose.set('debug', (collectionName, method, query, doc) => {
  const start = Date.now();

  return function() {
    const duration = Date.now() - start;
    if (duration > 100) {  // Slow query threshold
      console.warn(`[SLOW QUERY] ${collectionName}.${method} took ${duration}ms`);
      // Send to monitoring service
      if (duration > 5000) {
        // Critical slow query - alert operations
        console.error(`[CRITICAL SLOW QUERY] ${collectionName}.${method}: ${duration}ms`);
      }
    }
  };
});
```

### Pagination Validation Helper

```javascript
// src/utils/pagination.js

const validatePagination = (req) => {
  const MAX_LIMIT = 100;
  const DEFAULT_LIMIT = 20;
  const DEFAULT_PAGE = 1;

  const page = Math.max(1, parseInt(req.query.page) || DEFAULT_PAGE);
  const limit = Math.min(
    Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT),
    MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

module.exports = { validatePagination };

// Usage in controllers
const { validatePagination } = require('../utils/pagination');

const getUsers = async (req, res) => {
  const { page, limit, skip } = validatePagination(req);

  const users = await User.find(filters)
    .limit(limit)
    .skip(skip)
    .lean();

  const total = await User.countDocuments(filters);

  res.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
};
```

### Array Length Validation Middleware

```javascript
// src/middlewares/arrayValidation.middleware.js

const MAX_ARRAY_LENGTH = 50;

const validateArrayLengths = (fields) => {
  return (req, res, next) => {
    for (const field of fields) {
      const value = req.body[field];
      if (Array.isArray(value) && value.length > MAX_ARRAY_LENGTH) {
        return res.status(400).json({
          error: `Field "${field}" exceeds maximum length of ${MAX_ARRAY_LENGTH} items`
        });
      }
    }
    next();
  };
};

module.exports = { validateArrayLengths };

// Usage in routes
const { validateArrayLengths } = require('../middlewares/arrayValidation.middleware');

app.post('/register',
  validateArrayLengths(['specializations', 'languages', 'courts']),
  authRateLimiter,
  register
);
```

---

## Testing Recommendations

### Load Testing Scripts

Create load tests to verify rate limiting effectiveness:

```javascript
// tests/load/rate-limiting.test.js

const axios = require('axios');

describe('Rate Limiting Tests', () => {
  it('should block after exceeding invoice rate limit', async () => {
    const requests = [];

    // Send 51 requests (limit is 50)
    for (let i = 0; i < 51; i++) {
      requests.push(
        axios.post('http://localhost:5000/api/invoices', {
          client: 'test',
          amount: 100
        }).catch(err => err.response)
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);

    expect(rateLimited.length).toBeGreaterThan(0);
  });

  it('should allow requests after window expires', async () => {
    // Send request
    await axios.post('/api/invoices', data);

    // Wait for window to expire (15 min + buffer)
    await sleep(15 * 60 * 1000 + 1000);

    // Should succeed
    const response = await axios.post('/api/invoices', data);
    expect(response.status).toBe(201);
  });
});
```

### Pagination Testing

```javascript
// tests/unit/pagination.test.js

const { validatePagination } = require('../utils/pagination');

describe('Pagination Validation', () => {
  it('should cap limit at maximum', () => {
    const req = { query: { limit: '9999' } };
    const { limit } = validatePagination(req);
    expect(limit).toBe(100);  // MAX_LIMIT
  });

  it('should handle negative values', () => {
    const req = { query: { page: '-1', limit: '-10' } };
    const { page, limit } = validatePagination(req);
    expect(page).toBe(1);
    expect(limit).toBe(20);  // DEFAULT_LIMIT
  });
});
```

---

## Monitoring & Alerting Setup

### Key Metrics to Track

1. **Rate Limit Hit Rate**
   - Track 429 responses per endpoint
   - Alert if suddenly increases (potential attack)

2. **Query Execution Time**
   - Monitor slow queries (>100ms)
   - Alert on critical slow queries (>5s)

3. **Connection Pool Usage**
   - Track active connections vs. max pool size
   - Alert at 80% utilization

4. **Request Body Size Distribution**
   - Monitor average payload sizes
   - Alert on sudden spikes (potential attack)

5. **Endpoint Response Times**
   - Track P50, P95, P99 latencies
   - Alert on degradation

### Recommended Monitoring Tools

- **Sentry**: Already integrated - expand to track rate limiting events
- **MongoDB Atlas Monitoring**: For database metrics
- **Prometheus + Grafana**: For custom metrics
- **DataDog APM**: For distributed tracing

---

## Compliance Considerations

### PDPL (Saudi Personal Data Protection Law)

Current findings impact PDPL compliance:

- ✅ **Data Access Control**: Rate limiting prevents unauthorized bulk data access
- ❌ **Missing Rate Limits**: Unprotected endpoints allow potential data harvesting
- ⚠️ **Recommendation**: Implement rate limiting on all personal data endpoints

### PCI DSS (Payment Card Industry)

For payment processing:

- ✅ **Payment Routes Protected**: Rate limiting applied
- ❌ **Invoice Routes Unprotected**: Could lead to fraudulent transactions
- ⚠️ **Requirement 6.5.10**: Prevent brute force attacks on payment endpoints

---

## Conclusion

The traf3li-backend application demonstrates strong security practices in authentication and payment processing, with sophisticated rate limiting infrastructure in place. However, **critical gaps exist in applying this infrastructure across the majority of API endpoints**, leaving the system vulnerable to denial-of-service attacks and resource exhaustion.

**Priority Focus**: Immediately apply existing rate limiters to unprotected routes (invoice, case, document, user, account) and implement maximum caps on all user-controlled query parameters.

**Long-term Goal**: Adopt a "secure by default" approach where all routes have rate limiting unless explicitly exempted, and all queries have pagination and timeout protections.

---

## Appendix: Quick Reference

### Routes Requiring Immediate Rate Limiting

| Route File | Endpoints | Recommended Limiter |
|------------|-----------|---------------------|
| `invoice.route.js` | All endpoints | `apiRateLimiter` + `paymentRateLimiter` for payment ops |
| `case.route.js` | All endpoints | `apiRateLimiter` + `uploadRateLimiter` for documents |
| `document.route.js` | Upload/download | `uploadRateLimiter` |
| `user.route.js` | All endpoints | `apiRateLimiter` |
| `account.route.js` | All endpoints | `apiRateLimiter` |
| `verify.route.js` | Government APIs | `sensitiveRateLimiter` (strict) |
| `auth.route.js` | `/logout` | `authRateLimiter` |

### Controllers Requiring Query Protection

| Controller File | Issues | Fix |
|-----------------|--------|-----|
| `user.controller.js` | Unbounded limit, no pagination on /team | Add max cap, implement pagination |
| `dashboard.controller.js` | Unbounded aggregations, unlimited days | Add $limit stages, cap days parameter |
| `report.controller.js` | Unlimited limit, unbounded date ranges | Cap limit, validate date ranges |
| `auth.controller.js` | Unbounded arrays in registration | Validate array lengths |

### Configuration Files Requiring Updates

| File | Required Change | Priority |
|------|----------------|----------|
| `db.js` | Add global maxTimeMS | HIGH |
| `server.js` | Per-endpoint body size limits | LOW |
| `rateLimiter.middleware.js` | Add invoiceRateLimiter | CRITICAL |
| `security.middleware.js` | Change truncation to rejection | MEDIUM |

---

**Report End**

For questions or clarifications, please contact the security team.

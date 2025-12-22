# MIDDLEWARE ORDER VULNERABILITIES - QUICK SUMMARY

**Status:** 🔴 CRITICAL
**Date:** 2025-12-22
**Application:** traf3li-backend

---

## TL;DR

**9 security middleware files exist, 0 are actually used in routes.**

---

## CRITICAL FINDINGS (Fix Immediately)

### 1. NO RATE LIMITING ⚠️
- **Risk:** Unlimited API requests, brute force attacks, DoS
- **Files Affected:** ALL 36 route files
- **Impact:** Service outage, account compromise, resource exhaustion

```javascript
// ❌ CURRENT: No rate limiting
app.post('/login', authLogin);

// ✅ FIX: Add rate limiter
const { authRateLimiter } = require('../middlewares/rateLimiter.middleware');
app.post('/login', authRateLimiter, authLogin);
```

### 2. NO AUTHORIZATION ⚠️
- **Risk:** Clients can access lawyer-only features, privilege escalation
- **Files Affected:** ALL 36 route files
- **Impact:** Unauthorized access, data integrity violations

```javascript
// ❌ CURRENT: Any authenticated user can create invoices
app.post('/invoices', userMiddleware, createInvoice);

// ✅ FIX: Add role check
const { authorize } = require('../middlewares/authorize.middleware');
app.post('/invoices', userMiddleware, authorize('lawyer'), createInvoice);
```

### 3. NO OWNERSHIP CHECKS ⚠️
- **Risk:** IDOR - users can access/modify ANY resource by ID
- **Files Affected:** ALL routes with /:id parameter
- **Impact:** Complete data breach, unauthorized modifications

```javascript
// ❌ CURRENT: Anyone can view any payment
app.get('/payments/:id', userMiddleware, getPayment);

// ✅ FIX: Add ownership check
const { checkOwnership } = require('../middlewares/checkOwnership.middleware');
app.get('/payments/:id', userMiddleware, checkOwnership('Payment'), getPayment);
```

---

## HIGH PRIORITY FINDINGS

### 4. NO AUDIT LOGGING
- **Risk:** PDPL non-compliance, no forensic evidence
- **Impact:** Legal liability, cannot investigate breaches

```javascript
// ✅ FIX: Add audit logging
const { auditLog } = require('../middlewares/auditLog.middleware');
app.delete('/cases/:id', userMiddleware, checkCaseAccess(), auditLog('delete_case'), deleteCase);
```

### 5. NO INPUT VALIDATION
- **Risk:** Injection attacks, data corruption, DB overload
- **Impact:** Security vulnerabilities, system instability

```javascript
// ✅ FIX: Add validation
const { body } = require('express-validator');
const validate = require('../middlewares/validation.middleware');

app.post('/payments',
    userMiddleware,
    [
        body('amount').isFloat({ min: 0.01 }),
        body('clientId').isMongoId()
    ],
    validate,
    createPayment
);
```

### 6. DB QUERIES BEFORE VALIDATION
- **Risk:** Expensive operations on invalid input
- **Impact:** Database performance degradation

```javascript
// ❌ WRONG ORDER
const createExpense = async (req, res) => {
    if (caseId) {
        const caseDoc = await Case.findById(caseId);  // DB query first
    }
    if (!amount || amount < 0) {  // Validation after
        throw error;
    }
}

// ✅ CORRECT ORDER
const createExpense = async (req, res) => {
    if (!amount || amount < 0) {  // Validation first
        throw error;
    }
    if (caseId) {
        const caseDoc = await Case.findById(caseId);  // DB query after
    }
}
```

---

## CORRECT MIDDLEWARE ORDER

### Route-Level Order (Apply to ALL routes)
```javascript
app.post('/resource',
    userMiddleware,           // 1. Authentication (who?)
    rateLimiter,             // 2. Rate limiting (too many?)
    authorize('role'),        // 3. Authorization (can they?)
    [validationRules],       // 4. Input validation (is data valid?)
    validate,                // 5. Validation handler
    checkOwnership(),        // 6. Ownership check (do they own it?)
    auditLog('action'),      // 7. Audit logging
    controllerFunction       // 8. Business logic
);
```

### Global Order (server.js)
```javascript
1. helmet()              // ✅ Security headers
2. compression()         // ✅ Compression
3. cors()                // ✅ CORS
4. globalRateLimiter     // ⚠️ ADD THIS
5. cookieParser()        // ✅ Cookies
6. express.json()        // ⚠️ Move after rate limiting
7. express.urlencoded()  // ⚠️ Move after rate limiting
8. Routes               // Application routes
9. errorHandler()       // ✅ Error handling
```

---

## QUICK FIX CHECKLIST

### DAY 1: Rate Limiting
- [ ] Import rate limiters in auth.route.js
- [ ] Apply `authRateLimiter` to /login, /register
- [ ] Import rate limiters in payment.route.js
- [ ] Apply `paymentRateLimiter` to payment routes
- [ ] Apply `uploadRateLimiter` to file upload routes

### DAY 2: Authorization
- [ ] Import `authorize` middleware in all route files
- [ ] Apply `authorize('lawyer')` to lawyer-only routes
- [ ] Apply `authorize('admin')` to admin routes
- [ ] Apply `authorize('lawyer', 'client')` to shared routes

### DAY 3: Ownership Checks
- [ ] Import ownership middleware in route files
- [ ] Apply `checkOwnership()` to all GET /:id routes
- [ ] Apply `checkOwnership()` to all PUT/PATCH /:id routes
- [ ] Apply `checkModifyPermission()` to all DELETE /:id routes

### WEEK 2: Validation & Logging
- [ ] Create validation.middleware.js
- [ ] Add validation rules to all POST routes
- [ ] Add validation rules to all PUT/PATCH routes
- [ ] Apply `auditLog()` to sensitive operations

---

## AFFECTED ROUTES BY SEVERITY

### CRITICAL (Fix Today)
```
/api/auth/login           - No rate limiting
/api/auth/register        - No rate limiting
/api/payments/*           - No rate limiting, authorization, or ownership checks
/api/payments/:id/refund  - No authorization or ownership checks
/api/cases/:id            - No ownership checks (IDOR vulnerability)
/api/invoices/*           - No authorization checks
/api/retainers/*          - No authorization or ownership checks
```

### HIGH (Fix This Week)
```
All routes with file uploads  - No rate limiting
All routes with /:id          - No ownership checks
All DELETE operations         - No audit logging
All financial operations      - No audit logging
```

---

## FILES REQUIRING CHANGES

### Immediate Changes (36 route files)
```
src/routes/auth.route.js          - Add authRateLimiter
src/routes/payment.route.js       - Add paymentRateLimiter, authorize, checkOwnership
src/routes/invoice.route.js       - Add authorize, checkOwnership
src/routes/case.route.js          - Add authorize, checkOwnership
src/routes/retainer.route.js      - Add authorize, checkOwnership
src/routes/expense.route.js       - Add authorize, checkOwnership
src/routes/task.route.js          - Add checkOwnership
src/routes/event.route.js         - Add checkOwnership
src/routes/client.route.js        - Add authorize, checkOwnership
src/routes/message.route.js       - Add uploadRateLimiter, checkOwnership
... (all other route files)
```

### New Files to Create
```
src/middlewares/validation.middleware.js  - Validation result handler
```

### Files to Modify
```
src/server.js                     - Add global rate limiting
src/middlewares/index.js          - Export all middleware
```

---

## EXPLOITATION EXAMPLES

### Example 1: Brute Force Login
```bash
# Current: Works (no rate limiting)
for i in {1..10000}; do
  curl -X POST http://api/auth/login \
    -d '{"email":"victim@email.com","password":"guess'$i'"}'
done
```

### Example 2: IDOR Attack
```bash
# Current: Works (no ownership checks)
curl -X GET http://api/payments/507f191e810c19729de860ea \
  -H "Cookie: accessToken=ATTACKER_TOKEN"
# Returns payment details of ANY user!
```

### Example 3: Privilege Escalation
```bash
# Current: Works (no authorization)
# Logged in as CLIENT
curl -X POST http://api/invoices \
  -H "Cookie: accessToken=CLIENT_TOKEN" \
  -d '{"amount":1000,"clientId":"victim_id"}'
# Client can create invoices (should be lawyer-only)!
```

### Example 4: Resource Exhaustion
```bash
# Current: Works (no rate limiting)
for i in {1..100000}; do
  curl -X POST http://api/payments \
    -d '{"amount":-1,"clientId":"invalid"}'
done
# Triggers 100k database queries with invalid data
```

---

## TESTING AFTER FIXES

### 1. Test Rate Limiting
```bash
# Should block after limit
for i in {1..10}; do curl -X POST http://api/auth/login; done
# Expected: 429 Too Many Requests after threshold
```

### 2. Test Authorization
```bash
# Client attempting lawyer-only action
curl -X POST http://api/invoices \
  -H "Cookie: accessToken=CLIENT_TOKEN"
# Expected: 403 Forbidden
```

### 3. Test Ownership
```bash
# User A accessing User B's resource
curl -X GET http://api/cases/USER_B_CASE_ID \
  -H "Cookie: accessToken=USER_A_TOKEN"
# Expected: 403 Forbidden
```

### 4. Test Validation
```bash
# Invalid input
curl -X POST http://api/payments \
  -d '{"amount":"not a number"}'
# Expected: 400 Bad Request with validation errors
```

---

## PRIORITY ORDER

1. **P0 (Today):** Rate limiting on auth routes
2. **P0 (Day 1-2):** Authorization middleware
3. **P0 (Day 2-3):** Ownership checks
4. **P1 (Week 1):** Input validation
5. **P1 (Week 1):** Audit logging
6. **P2 (Week 2):** Refactor controllers
7. **P2 (Week 2):** Global rate limiting

---

## SUCCESS CRITERIA

- [ ] All routes have appropriate middleware stack
- [ ] No route bypasses security checks
- [ ] Rate limiting prevents brute force
- [ ] Authorization prevents privilege escalation
- [ ] Ownership checks prevent IDOR
- [ ] Validation prevents injection
- [ ] Audit logs track all sensitive operations
- [ ] Penetration tests pass

---

## QUESTIONS?

See full report: `MIDDLEWARE_ORDER_SECURITY_AUDIT.md`

**Need help?** Contact security team immediately.

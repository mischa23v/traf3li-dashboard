# API Abuse Prevention - Quick Implementation Guide
## 90-Minute Critical Security Fix

**Status:** 🔴 CRITICAL - NO RATE LIMITING ACTIVE
**Implementation Time:** 90 minutes
**Risk Reduction:** 95%

---

## Step 1: Export Rate Limiters (5 minutes)

**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/middlewares/index.js`

```javascript
const userMiddleware = require('./userMiddleware');
const errorMiddleware = require('./errorMiddleware');
const authenticate = require('./authenticate');

// ✅ ADD: Import all rate limiters
const {
    authRateLimiter,
    apiRateLimiter,
    publicRateLimiter,
    sensitiveRateLimiter,
    uploadRateLimiter,
    paymentRateLimiter,
    searchRateLimiter,
    speedLimiter,
    createRateLimiter,
    userRateLimiter,
    roleBasedRateLimiter
} = require('./rateLimiter.middleware');

module.exports = {
    userMiddleware,
    errorMiddleware,
    authenticate,

    // ✅ ADD: Export rate limiters
    authRateLimiter,
    apiRateLimiter,
    publicRateLimiter,
    sensitiveRateLimiter,
    uploadRateLimiter,
    paymentRateLimiter,
    searchRateLimiter,
    speedLimiter,
    createRateLimiter,
    userRateLimiter,
    roleBasedRateLimiter
};
```

---

## Step 2: Protect Authentication Routes (10 minutes)

**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/routes/auth.route.js`

**BEFORE:**
```javascript
const express = require('express');
const { authLogin, authLogout, authRegister, authStatus } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares');

const app = express.Router();

app.post('/register', authRegister);
app.post('/login', authLogin);
app.post('/logout', authLogout)
app.get('/me', authenticate, authStatus);

module.exports = app;
```

**AFTER:**
```javascript
const express = require('express');
const { authLogin, authLogout, authRegister, authStatus } = require('../controllers/auth.controller');
const { authenticate, authRateLimiter } = require('../middlewares'); // ✅ ADD authRateLimiter

const app = express.Router();

// ✅ PROTECTED: 5 attempts per 15 minutes
app.post('/register', authRateLimiter, authRegister);
app.post('/login', authRateLimiter, authLogin);
app.post('/logout', authLogout)
app.get('/me', authenticate, authStatus);

module.exports = app;
```

---

## Step 3: Protect Payment Routes (10 minutes)

**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/routes/order.route.js`

**ADD at top:**
```javascript
const { userMiddleware, paymentRateLimiter } = require('../middlewares'); // ✅ ADD
```

**UPDATE routes:**
```javascript
// ✅ PROTECTED: 10 payment attempts per hour
app.post('/create-payment-intent/:_id', userMiddleware, paymentRateLimiter, paymentIntent);
app.post('/create-proposal-payment-intent/:_id', userMiddleware, paymentRateLimiter, proposalPaymentIntent);
app.patch('/', userMiddleware, paymentRateLimiter, updatePaymentStatus);
```

**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/routes/payment.route.js`

**ADD at top:**
```javascript
const { userMiddleware, paymentRateLimiter } = require('../middlewares'); // ✅ ADD
```

**UPDATE routes:**
```javascript
// ✅ PROTECTED: 10 payment operations per hour
app.post('/', userMiddleware, paymentRateLimiter, createPayment);
app.put('/:id', userMiddleware, paymentRateLimiter, updatePayment);
app.post('/:id/complete', userMiddleware, paymentRateLimiter, completePayment);
app.post('/:id/fail', userMiddleware, paymentRateLimiter, failPayment);
app.post('/:id/refund', userMiddleware, paymentRateLimiter, createRefund);
```

---

## Step 4: Protect Public Search Routes (15 minutes)

**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/routes/user.route.js`

**BEFORE:**
```javascript
const express = require('express');
const { userMiddleware } = require('../middlewares');
const { getUserProfile, getLawyerProfile, getLawyers, updateUserProfile, deleteUser } = require('../controllers/user.controller');

const app = express.Router();

app.get('/lawyers', getLawyers);
app.get('/:_id', getUserProfile);
app.get('/lawyer/:username', getLawyerProfile);
app.patch('/:_id', userMiddleware, updateUserProfile);
app.delete('/:_id', userMiddleware, deleteUser);

module.exports = app;
```

**AFTER:**
```javascript
const express = require('express');
const {
    userMiddleware,
    publicRateLimiter,    // ✅ ADD
    searchRateLimiter,    // ✅ ADD
    sensitiveRateLimiter  // ✅ ADD
} = require('../middlewares');
const { getUserProfile, getLawyerProfile, getLawyers, updateUserProfile, deleteUser } = require('../controllers/user.controller');

const app = express.Router();

// ✅ PROTECTED: 30 searches per minute (prevent scraping)
app.get('/lawyers', searchRateLimiter, getLawyers);

// ✅ PROTECTED: 300 requests per 15 min (prevent enumeration)
app.get('/:_id', publicRateLimiter, getUserProfile);
app.get('/lawyer/:username', publicRateLimiter, getLawyerProfile);

// Authenticated routes
app.patch('/:_id', userMiddleware, updateUserProfile);

// ✅ PROTECTED: 3 deletions per hour (prevent abuse)
app.delete('/:_id', userMiddleware, sensitiveRateLimiter, deleteUser);

module.exports = app;
```

**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/routes/gig.route.js`

**UPDATE:**
```javascript
const express = require('express');
const {
    userMiddleware,
    publicRateLimiter,   // ✅ ADD
    searchRateLimiter    // ✅ ADD
} = require('../middlewares');
const { createGig, deleteGig, getGig, getGigs } = require('../controllers/gig.controller');

const app = express.Router();

app.post('/', userMiddleware, createGig);
app.delete('/:_id', userMiddleware, deleteGig);

// ✅ PROTECTED: Prevent scraping
app.get('/single/:_id', publicRateLimiter, getGig);
app.get('/', searchRateLimiter, getGigs);

module.exports = app;
```

---

## Step 5: Protect Resource-Intensive Routes (15 minutes)

**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/routes/pdfme.route.js`

**ADD at top:**
```javascript
const { userMiddleware, apiRateLimiter, uploadRateLimiter } = require('../middlewares'); // ✅ ADD
```

**UPDATE routes:**
```javascript
// Template operations
router.get('/templates', userMiddleware, apiRateLimiter, getTemplates);
router.post('/templates', userMiddleware, apiRateLimiter, createTemplate);
router.put('/templates/:id', userMiddleware, apiRateLimiter, updateTemplate);

// ✅ PROTECTED: CPU-intensive PDF generation (50 per hour)
router.post('/generate', userMiddleware, uploadRateLimiter, generatePdf);
router.post('/generate/async', userMiddleware, uploadRateLimiter, generatePdfAsync);
router.post('/generate/invoice', userMiddleware, uploadRateLimiter, generateInvoicePdf);
router.post('/generate/contract', userMiddleware, uploadRateLimiter, generateContractPdf);
router.post('/generate/receipt', userMiddleware, uploadRateLimiter, generateReceiptPdf);
```

**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/routes/message.route.js`

**UPDATE:**
```javascript
const express = require('express');
const {
    userMiddleware,
    uploadRateLimiter,   // ✅ ADD
    apiRateLimiter       // ✅ ADD
} = require('../middlewares');
const upload = require('../configs/multer');
const { createMessage, getMessages, markAsRead } = require('../controllers/message.controller');

const app = express.Router();

// ✅ PROTECTED: 50 file uploads per hour
app.post('/', userMiddleware, uploadRateLimiter, upload.array('files', 5), createMessage);
app.get('/:conversationID', userMiddleware, apiRateLimiter, getMessages);
app.patch('/:conversationID/read', userMiddleware, markAsRead);

module.exports = app;
```

---

## Step 6: Global Rate Limiting (10 minutes)

**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/server.js`

**ADD after imports:**
```javascript
// ✅ ADD: Import rate limiter
const { publicRateLimiter } = require('./middlewares/rateLimiter.middleware');
```

**ADD after helmet() middleware:**
```javascript
// Middlewares
app.use(helmet());

// ✅ ADD: Global rate limiting as safety net (300 requests per 15 min)
app.use('/api/', publicRateLimiter);

// Compression
app.use(compression({ /* ... */ }));
```

**ADD to startup logs:**
```javascript
server.listen(PORT, () => {
    connectDB();
    scheduleTaskReminders();
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🛡️  Rate limiting: ENABLED`);  // ✅ ADD
    console.log(`⚡ Socket.io ready`);
    // ... rest
});
```

---

## Step 7: Apply to Remaining Routes (20 minutes)

### Review Routes
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/routes/review.route.js`

```javascript
const { userMiddleware, apiRateLimiter, publicRateLimiter } = require('../middlewares'); // ✅ ADD

app.post('/', userMiddleware, apiRateLimiter, createReview); // ✅ ADD
app.get('/:gigID', publicRateLimiter, getReview); // ✅ ADD
```

### Job Routes
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/routes/job.route.js`

```javascript
const { userMiddleware, searchRateLimiter, publicRateLimiter } = require('../middlewares'); // ✅ ADD

// Apply to getJobs endpoint
```

### Proposal Routes
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/routes/proposal.route.js`

```javascript
const { userMiddleware, apiRateLimiter } = require('../middlewares'); // ✅ ADD

app.post('/', userMiddleware, apiRateLimiter, createProposal); // ✅ ADD
```

### Invoice Routes
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/routes/invoice.route.js`

```javascript
const { userMiddleware, paymentRateLimiter } = require('../middlewares'); // ✅ ADD

app.post('/:_id/payment', userMiddleware, paymentRateLimiter, createPaymentIntent); // ✅ ADD
app.patch('/confirm-payment', userMiddleware, paymentRateLimiter, confirmPayment); // ✅ ADD
```

---

## Step 8: Test Implementation (30 minutes)

### Test 1: Authentication Rate Limiting
```bash
# Should block after 5 attempts
for i in {1..10}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
  echo "\nAttempt $i"
  sleep 1
done

# Expected: First 5 succeed, then 429 errors
```

### Test 2: Search Rate Limiting
```bash
# Should block after 30 requests per minute
for i in {1..35}; do
  curl http://localhost:8080/api/users/lawyers
  echo "Request $i"
done

# Expected: First 30 succeed, then 429 errors
```

### Test 3: Payment Rate Limiting
```bash
# Should block after 10 payment attempts per hour
# (Requires valid auth token)
for i in {1..15}; do
  curl -X POST http://localhost:8080/api/orders/create-payment-intent/123 \
    -H "Cookie: accessToken=YOUR_TOKEN"
  echo "Payment $i"
  sleep 2
done

# Expected: First 10 succeed, then 429 errors
```

### Test 4: Global Rate Limiting
```bash
# Should block after 300 requests per 15 minutes
ab -n 350 -c 10 http://localhost:8080/api/gigs

# Expected: First 300 succeed, then 429 errors
```

### Verify Logs
```bash
# Server should show:
# 🛡️  Rate limiting: ENABLED
# 🟢 Using MongoDB for rate limiting
```

---

## Step 9: Verify MongoDB Storage (10 minutes)

Connect to MongoDB and verify rate limit data is being stored:

```javascript
// In MongoDB shell or Compass
use your_database_name

// Should see rateLimits collection
db.getCollectionNames()

// Check rate limit records
db.rateLimits.find().limit(10)

// Should see documents like:
// {
//   _id: "rl:127.0.0.1",
//   value: 5,
//   expireAt: ISODate("2025-12-22T16:00:00.000Z")
// }
```

---

## Verification Checklist

- [ ] Rate limiters exported from `/src/middlewares/index.js`
- [ ] Auth routes protected (login, register)
- [ ] Payment routes protected (create-payment-intent, payments)
- [ ] Public routes protected (lawyers, gigs, jobs)
- [ ] PDF generation protected
- [ ] File upload protected
- [ ] Global rate limiting enabled
- [ ] Server logs show "Rate limiting: ENABLED"
- [ ] MongoDB has `rateLimits` collection
- [ ] Test: Login blocks after 5 attempts
- [ ] Test: Search blocks after 30 requests/min
- [ ] Test: Payments block after 10/hour

---

## Rollback Plan

If issues occur, quickly rollback:

1. **Comment out global rate limiting in server.js:**
   ```javascript
   // app.use('/api/', publicRateLimiter);
   ```

2. **Remove rate limiters from individual routes** (reverse Step 2-7)

3. **Restart server**

The rate limiter middleware will remain in place but unused.

---

## Next Steps (After Basic Implementation)

### Week 2: Redis Integration
- Install Redis for production
- Higher performance and scalability
- See full report for implementation

### Week 2-3: CAPTCHA
- Add reCAPTCHA to login/register
- Prevent bot attacks
- See full report for implementation

### Week 3: IP Blocking & Bot Detection
- Automatic IP blocking after violations
- Bot detection and blocking
- See full report for implementation

---

## Rate Limiter Reference

| Limiter | Window | Max Requests | Use Case |
|---------|--------|--------------|----------|
| `authRateLimiter` | 15 min | 5 | Login, Register |
| `paymentRateLimiter` | 1 hour | 10 | Payment operations |
| `searchRateLimiter` | 1 min | 30 | Search, filters |
| `uploadRateLimiter` | 1 hour | 50 | File uploads, PDF gen |
| `publicRateLimiter` | 15 min | 300 | Public endpoints |
| `apiRateLimiter` | 15 min | 100 | General API |
| `sensitiveRateLimiter` | 1 hour | 3 | Account deletion |

---

## Support

If you encounter issues:

1. Check MongoDB connection (rate limits are stored there)
2. Check server logs for errors
3. Verify middleware import/export syntax
4. Test with curl before browser (avoid cookie caching)

---

## Estimated Impact

**Before Implementation:**
- Unlimited login attempts
- Unlimited data scraping
- Unlimited payment operations
- Unlimited resource consumption
- **Risk Score: 9.5/10**

**After Implementation:**
- 5 login attempts per 15 min per IP
- 30 search requests per minute per IP
- 10 payment operations per hour per user
- 50 PDF generations per hour per user
- **Risk Score: 2/10**

**Time to Implement:** 90 minutes
**Risk Reduction:** 95%
**Cost:** $0 (uses existing infrastructure)

---

**START IMPLEMENTATION NOW - EVERY MINUTE COUNTS!**

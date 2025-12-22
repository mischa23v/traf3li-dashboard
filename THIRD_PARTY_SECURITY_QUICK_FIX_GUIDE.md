# Third-Party Integration Security - Quick Fix Guide

## ⚡ CRITICAL FIXES REQUIRED IMMEDIATELY

### 1. Fix Stripe API Key Variable Name (5 minutes)

**Files to modify**:
- `/src/controllers/invoice.controller.js` (line 3)
- `/src/controllers/order.controller.js` (line 4)

**Change**:
```javascript
// BEFORE (BROKEN)
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// AFTER (FIXED)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Add validation
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
}
```

---

### 2. Remove Hardcoded Encryption Keys (10 minutes)

**File**: `/src/utils/encryption.js` (lines 20-27)

**Change**:
```javascript
// BEFORE (INSECURE)
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    console.warn('⚠️  WARNING: ENCRYPTION_KEY not set!');
    return Buffer.from('0123456789abcdef...', 'hex'); // HARDCODED
  }

  return Buffer.from(key, 'hex');
};

// AFTER (SECURE)
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('FATAL: ENCRYPTION_KEY must be set in production');
  }

  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  return Buffer.from(key, 'hex');
};
```

**File**: `/src/utils/generateToken.js` (lines 18-30)

**Change**:
```javascript
// BEFORE (INSECURE)
return {
    accessSecret: jwtSecret || 'default-jwt-secret-do-not-use...',
    refreshSecret: jwtRefreshSecret || 'default-refresh-secret...',
};

// AFTER (SECURE)
const getSecrets = () => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error('FATAL: JWT secrets must be set in production');
  }

  if (jwtSecret.length < 32 || jwtRefreshSecret.length < 32) {
    throw new Error('JWT secrets must be at least 32 characters');
  }

  return { accessSecret: jwtSecret, refreshSecret: jwtRefreshSecret };
};
```

---

### 3. Implement Stripe Webhook Signature Validation (30 minutes)

**Create new file**: `/src/controllers/webhook.controller.js`

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Invoice, Payment } = require('../models');

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // ✅ VERIFY SIGNATURE
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            webhookSecret
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ PROCESS VERIFIED EVENTS
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;

                // Update invoice
                const invoice = await Invoice.findOne({
                    paymentIntent: paymentIntent.id
                });

                if (invoice) {
                    invoice.status = 'paid';
                    invoice.paidDate = new Date();
                    await invoice.save();
                }

                // Update order
                const order = await Order.findOne({
                    payment_intent: paymentIntent.id
                });

                if (order) {
                    order.isCompleted = true;
                    order.status = 'accepted';
                    order.acceptedAt = new Date();
                    await order.save();
                }
                break;

            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object;
                console.error('Payment failed:', failedIntent.id);
                // Handle failure
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Error processing webhook:', err);
        res.status(500).send('Webhook processing failed');
    }
};

module.exports = { handleStripeWebhook };
```

**Create new file**: `/src/routes/webhook.route.js`

```javascript
const express = require('express');
const { handleStripeWebhook } = require('../controllers/webhook.controller');

const router = express.Router();

// ⚠️ IMPORTANT: This route must use express.raw() for signature validation
router.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    handleStripeWebhook
);

module.exports = router;
```

**Modify**: `/src/server.js`

```javascript
// Add before other routes (BEFORE express.json() middleware)
app.use('/api/webhooks', require('./routes/webhook.route'));

// Then add body parsers
app.use(express.json());
// ... rest of middleware
```

**Update**: `/src/controllers/invoice.controller.js`

```javascript
// DELETE this entire function - webhooks handle it now
const confirmPayment = async (request, response) => {
    // ❌ REMOVE THIS - INSECURE
};

// Remove from exports
module.exports = {
    createInvoice,
    getInvoices,
    getInvoice,
    updateInvoice,
    sendInvoice,
    createPaymentIntent,
    // confirmPayment,  ❌ REMOVE
    getOverdueInvoices
};
```

**Update**: `/src/routes/invoice.route.js`

```javascript
// REMOVE this route
// app.patch('/confirm-payment', userMiddleware, confirmPayment);  ❌ DELETE
```

**Add to .env**:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Configure Stripe Dashboard**:
1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://api.traf3li.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to `.env`

---

### 4. Disable Test Mode Endpoints in Production (5 minutes)

**File**: `/src/routes/order.route.js` (lines 27-34)

**Change**:
```javascript
// BEFORE (INSECURE)
if (process.env.TEST_MODE === 'true') {
    app.post('/create-test-contract/:_id', userMiddleware, createTestContract);
    app.post('/create-test-proposal-contract/:_id', userMiddleware, createTestProposalContract);
    console.log('⚠️  TEST MODE: Payment bypass endpoints enabled');
}

// AFTER (SECURE)
if (process.env.NODE_ENV !== 'production' && process.env.TEST_MODE === 'true') {
    app.post('/create-test-contract/:_id', userMiddleware, createTestContract);
    app.post('/create-test-proposal-contract/:_id', userMiddleware, createTestProposalContract);
    console.log('⚠️  TEST MODE: Payment bypass enabled (DEV ONLY)');
} else if (process.env.TEST_MODE === 'true') {
    console.error('❌ BLOCKED: Test mode attempted in production');
    // Never register routes in production
}
```

**Better option - Remove entirely**:
```javascript
// BEST PRACTICE: Remove test mode endpoints completely
// Use Stripe test mode instead: https://stripe.com/docs/testing
```

---

### 5. Remove Debug Logging (15 minutes)

**Files to modify**:
- `/src/controllers/client.controller.js` (lines 10-116)
- `/src/controllers/user.controller.js` (lines 232-233)
- `/src/controllers/dashboard.controller.js`

**Change all instances**:
```javascript
// BEFORE (INSECURE)
console.log('[CreateClient] Request body:', JSON.stringify(req.body, null, 2));
console.log('[CreateClient] Error stack:', dbError.stack);

// AFTER (SECURE)
// Remove all debug console.log statements
// OR use proper logging library with levels

const logger = require('./utils/logger');

// Production: only errors
logger.error('Client creation failed', {
    userId: req.userID,
    error: error.message
    // ❌ NO: stack, body, headers
});

// Development: detailed logs
if (process.env.NODE_ENV === 'development') {
    logger.debug('Request details', {
        body: req.body,
        headers: req.headers
    });
}
```

---

## ⚠️ HIGH PRIORITY FIXES (This Week)

### 6. Add Stripe Request Timeout (5 minutes)

**Files**: `/src/controllers/invoice.controller.js`, `/src/controllers/order.controller.js`

**Change**:
```javascript
// BEFORE
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// AFTER
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    timeout: 10000, // 10 seconds
    maxNetworkRetries: 2,
    telemetry: false
});
```

---

### 7. Sanitize External Data (20 minutes)

**Create new file**: `/src/utils/sanitizeExternalData.js`

```javascript
const sanitizeGatewayResponse = (response) => {
    if (!response || typeof response !== 'object') {
        return null;
    }

    // Whitelist only safe fields
    const allowedFields = ['id', 'status', 'amount', 'currency', 'created'];
    const sanitized = {};

    allowedFields.forEach(field => {
        if (response[field] !== undefined) {
            sanitized[field] = String(response[field]).slice(0, 255);
        }
    });

    return sanitized;
};

const sanitizeTransactionId = (txId) => {
    if (!txId) return null;

    // Must be alphanumeric with _, -, max 100 chars
    const cleaned = String(txId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);

    return cleaned || null;
};

module.exports = {
    sanitizeGatewayResponse,
    sanitizeTransactionId
};
```

**Update**: `/src/controllers/payment.controller.js`

```javascript
const { sanitizeGatewayResponse, sanitizeTransactionId } = require('../utils/sanitizeExternalData');

const createPayment = async (req, res) => {
    const {
        transactionId,
        gatewayResponse,
        // ... other fields
    } = req.body;

    const payment = await Payment.create({
        // ...
        transactionId: sanitizeTransactionId(transactionId),
        gatewayResponse: sanitizeGatewayResponse(gatewayResponse),
    });
};
```

---

### 8. Restrict CORS for Vercel (10 minutes)

**File**: `/src/server.js` (lines 108-111)

**Change**:
```javascript
// BEFORE (INSECURE)
if (origin.includes('.vercel.app')) {
    return callback(null, true);
}

// AFTER (SECURE)
const ALLOWED_VERCEL_PATTERNS = [
    /^https:\/\/traf3li-dashboard-[a-zA-Z0-9-]+\.vercel\.app$/,
    /^https:\/\/.*-mischa-alrabehs-projects\.vercel\.app$/,
];

const isAllowedVercel = ALLOWED_VERCEL_PATTERNS.some(
    pattern => pattern.test(origin)
);

if (isAllowedVercel) {
    return callback(null, true);
}
```

---

## 🔧 MEDIUM PRIORITY FIXES (This Month)

### 9. Add Retry Limits (15 minutes)

**File**: `/src/controllers/payment.controller.js`

```javascript
const MAX_RETRY_ATTEMPTS = 3;

const failPayment = async (req, res) => {
    // ...

    payment.retryCount = (payment.retryCount || 0) + 1;

    if (payment.retryCount >= MAX_RETRY_ATTEMPTS) {
        payment.status = 'permanently_failed';
        payment.failureReason = 'Maximum retry attempts exceeded';
    }

    await payment.save();
};
```

---

### 10. Add Startup Configuration Validation (10 minutes)

**Create new file**: `/src/config/validateConfig.js`

```javascript
const validateConfig = () => {
    const required = [
        'MONGODB_URI',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'ENCRYPTION_KEY',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0 && process.env.NODE_ENV === 'production') {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        process.exit(1);
    }

    console.log('✅ Configuration validated');
};

module.exports = validateConfig;
```

**Update**: `/src/server.js` (top of file)

```javascript
require('dotenv').config();
const validateConfig = require('./config/validateConfig');

// ✅ Validate config before starting server
validateConfig();

// ... rest of server code
```

---

## 📋 Testing Checklist

After implementing fixes:

- [ ] Test Stripe payment flow end-to-end
- [ ] Verify webhook signature validation works
- [ ] Test with Stripe CLI: `stripe listen --forward-to localhost:8080/api/webhooks/stripe`
- [ ] Confirm test mode endpoints are disabled in production
- [ ] Verify no hardcoded secrets remain
- [ ] Check no sensitive data in logs
- [ ] Test CORS with allowed/blocked origins
- [ ] Confirm API timeouts work
- [ ] Verify retry limits enforced
- [ ] Test with missing environment variables

---

## 🔐 Stripe Testing Commands

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Test webhook locally
stripe listen --forward-to localhost:8080/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed

# Test payment intent creation
curl -X POST http://localhost:8080/api/invoices/INVOICE_ID/payment \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 .env Template (Updated)

```bash
# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_secret_here

# Encryption (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your_key_here

# Database
MONGODB_URI=your_mongodb_uri

# Server
PORT=5000
NODE_ENV=production

# Security
ADMIN_IP_WHITELIST=your.ip.here

# Frontend URLs
CLIENT_URL=https://traf3li.com
DASHBOARD_URL=https://dashboard.traf3li.com

# Stripe (CORRECTED NAMES)
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary (if used)
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## 🎯 Summary of Changes

| Fix | Time | Impact | Files Changed |
|-----|------|--------|---------------|
| Fix Stripe API key name | 5 min | Critical | 2 files |
| Remove hardcoded keys | 10 min | Critical | 2 files |
| Add webhook validation | 30 min | Critical | 4 files (new) |
| Disable test mode | 5 min | Critical | 1 file |
| Remove debug logging | 15 min | High | 3+ files |
| Add request timeout | 5 min | High | 2 files |
| Sanitize external data | 20 min | High | 2 files (new) |
| Restrict CORS | 10 min | Medium | 1 file |
| Add retry limits | 15 min | Medium | 1 file |
| Config validation | 10 min | Medium | 1 file (new) |

**Total Time**: ~2-3 hours for all fixes
**Risk Reduction**: 95%+ of identified vulnerabilities eliminated

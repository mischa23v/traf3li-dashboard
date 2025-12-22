# Third-Party Integration Security Audit Report

**Repository**: traf3li-backend
**Audit Date**: 2025-12-22
**Audit Type**: Third-Party Integration Security Assessment
**Auditor**: Claude Code Security Scanner

---

## Executive Summary

This security audit identified **CRITICAL** vulnerabilities in third-party integrations, particularly with Stripe payment processing. The application lacks webhook signature validation, stores unvalidated external data, exposes API keys through environment variable misconfigurations, and includes test mode bypass endpoints that could be exploited in production.

**Risk Level**: 🔴 **CRITICAL**

---

## Table of Contents
1. [Critical Vulnerabilities](#critical-vulnerabilities)
2. [High Severity Issues](#high-severity-issues)
3. [Medium Severity Issues](#medium-severity-issues)
4. [Attack Scenarios](#attack-scenarios)
5. [Remediation Guide](#remediation-guide)
6. [Secure Integration Patterns](#secure-integration-patterns)

---

## Critical Vulnerabilities

### 1. Missing Stripe Webhook Signature Validation ⚠️ CRITICAL

**Severity**: 🔴 CRITICAL
**CWE**: CWE-345 (Insufficient Verification of Data Authenticity)
**CVSS Score**: 9.8/10

**Location**:
- `/src/controllers/invoice.controller.js` (lines 239-268)
- `/src/controllers/order.controller.js` (lines 155-199)

**Vulnerability**:
```javascript
// invoice.controller.js - Line 239
const confirmPayment = async (request, response) => {
    const { paymentIntent } = request.body;  // ⚠️ TRUSTS CLIENT DATA
    try {
        const invoice = await Invoice.findOneAndUpdate(
            { paymentIntent },
            {
                $set: {
                    status: 'paid',
                    paidDate: new Date()
                }
            },
            { new: true }
        );
        // No webhook signature verification!
```

**Attack Vector**:
```bash
# Attacker can mark any invoice as paid without payment
curl -X PATCH https://api.traf3li.com/api/invoices/confirm-payment \
  -H "Content-Type: application/json" \
  -d '{"paymentIntent": "pi_1234567890"}'
```

**Impact**:
- Attackers can mark invoices as paid without actual payment
- Free services/products
- Financial loss
- No audit trail of actual Stripe events

**Remediation**:
```javascript
// SECURE IMPLEMENTATION
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Webhook endpoint with signature verification
const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // ✅ VERIFY WEBHOOK SIGNATURE
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        );
    } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ HANDLE VERIFIED EVENTS ONLY
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await handlePaymentSuccess(paymentIntent);
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            await handlePaymentFailure(failedPayment);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
};
```

---

### 2. API Key Environment Variable Mismatch ⚠️ CRITICAL

**Severity**: 🔴 CRITICAL
**CWE**: CWE-798 (Use of Hard-coded Credentials)

**Location**:
- `.env.example` (line 23): `STRIPE_SECRET_KEY`
- `/src/controllers/invoice.controller.js` (line 3): `process.env.STRIPE_SECRET`
- `/src/controllers/order.controller.js` (line 4): `process.env.STRIPE_SECRET`

**Vulnerability**:
```javascript
// invoice.controller.js - Line 3
const stripe = require('stripe')(process.env.STRIPE_SECRET);  // ⚠️ WRONG VAR NAME

// .env.example - Line 23
STRIPE_SECRET_KEY=your_stripe_key  // ⚠️ DIFFERENT NAME
```

**Impact**:
- Stripe API calls will fail silently with `undefined`
- May cause Stripe SDK to use insecure defaults
- Configuration drift between environments

**Remediation**:
```javascript
// SECURE IMPLEMENTATION
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
    throw new Error('CRITICAL: STRIPE_SECRET_KEY not configured');
}

if (STRIPE_SECRET_KEY.startsWith('sk_test_') && process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: Using Stripe test key in production');
}

const stripe = require('stripe')(STRIPE_SECRET_KEY);
```

---

### 3. Hardcoded Fallback Encryption Keys ⚠️ CRITICAL

**Severity**: 🔴 CRITICAL
**CWE**: CWE-321 (Use of Hard-coded Cryptographic Key)
**CVSS Score**: 9.1/10

**Location**:
- `/src/utils/encryption.js` (lines 20-27)
- `/src/utils/generateToken.js` (lines 18-30)

**Vulnerability**:
```javascript
// encryption.js - Line 27
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    console.warn('⚠️  WARNING: ENCRYPTION_KEY not set!');
    // ⚠️ HARDCODED KEY - ANYONE CAN DECRYPT
    return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
  }

  return Buffer.from(key, 'hex');
};

// generateToken.js - Line 28
return {
    accessSecret: jwtSecret || 'default-jwt-secret-do-not-use-in-production-change-this-immediately',
    refreshSecret: jwtRefreshSecret || 'default-refresh-secret-do-not-use-in-production-change-this-now',
};
```

**Attack Vector**:
```javascript
// Attacker can decrypt all encrypted data
const crypto = require('crypto');
const key = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
const decipher = crypto.createDecipheriv('aes-256-gcm', key, stolenIV);
decipher.setAuthTag(stolenAuthTag);
const decrypted = decipher.update(stolenEncryptedData, 'hex', 'utf8');
// All sensitive legal documents exposed!
```

**Impact**:
- ALL encrypted data can be decrypted by attackers
- Legal documents compromised
- Client personal information exposed
- JWT tokens can be forged

**Remediation**:
```javascript
// SECURE IMPLEMENTATION
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('CRITICAL: ENCRYPTION_KEY must be set in production');
  }

  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  return Buffer.from(key, 'hex');
};

// Startup validation
if (process.env.NODE_ENV === 'production') {
    if (!process.env.ENCRYPTION_KEY || !process.env.JWT_SECRET) {
        console.error('FATAL: Required secrets not configured');
        process.exit(1);
    }
}
```

---

### 4. Test Mode Payment Bypass ⚠️ CRITICAL

**Severity**: 🔴 CRITICAL
**CWE**: CWE-284 (Improper Access Control)
**CVSS Score**: 9.3/10

**Location**:
- `/src/routes/order.route.js` (lines 27-34)
- `/src/controllers/order.controller.js` (lines 205-334)

**Vulnerability**:
```javascript
// order.route.js - Line 30
if (process.env.TEST_MODE === 'true') {
    app.post('/create-test-contract/:_id', userMiddleware, createTestContract);
    app.post('/create-test-proposal-contract/:_id', userMiddleware, createTestProposalContract);
    console.log('⚠️  TEST MODE: Payment bypass endpoints enabled');
}

// order.controller.js - Line 228
payment_intent: `TEST-${Date.now()}-${_id}`,
isCompleted: true,  // ⚠️ BYPASSES PAYMENT
status: 'accepted',
```

**Attack Vector**:
```bash
# Attacker sets TEST_MODE=true in production
export TEST_MODE=true

# Get free services without payment
curl -X POST https://api.traf3li.com/api/orders/create-test-contract/GIG_ID \
  -H "Authorization: Bearer TOKEN"
```

**Impact**:
- Complete payment bypass
- Free access to all paid services
- Financial loss
- No payment audit trail

**Remediation**:
```javascript
// SECURE IMPLEMENTATION - Remove test endpoints entirely
// OR restrict to development only

if (process.env.NODE_ENV !== 'production' && process.env.TEST_MODE === 'true') {
    // Require special test API key
    const testMiddleware = (req, res, next) => {
        const testKey = req.headers['x-test-key'];
        if (testKey !== process.env.TEST_API_KEY) {
            return res.status(403).json({ error: 'Invalid test key' });
        }
        next();
    };

    app.post('/create-test-contract/:_id', testMiddleware, createTestContract);
} else if (process.env.NODE_ENV === 'production') {
    // NEVER expose in production
    console.log('✅ Test endpoints disabled in production');
}
```

---

## High Severity Issues

### 5. Unvalidated Third-Party Data Storage ⚠️ HIGH

**Severity**: 🟠 HIGH
**CWE**: CWE-20 (Improper Input Validation)

**Location**:
- `/src/models/payment.model.js` (line 57)
- `/src/controllers/payment.controller.js` (lines 18-19, 55-56)

**Vulnerability**:
```javascript
// payment.model.js - Line 57
gatewayResponse: mongoose.Schema.Types.Mixed,  // ⚠️ NO VALIDATION

// payment.controller.js - Line 19
gatewayResponse,  // ⚠️ STORED RAW FROM CLIENT
```

**Attack Vector**:
```javascript
// Attacker injects malicious data
{
  "gatewayResponse": {
    "__proto__": { "isAdmin": true },
    "constructor": { "prototype": { "isAdmin": true } },
    "maliciousScript": "<script>alert('XSS')</script>",
    "oversizedData": "A".repeat(10000000)
  }
}
```

**Impact**:
- Prototype pollution attacks
- NoSQL injection via stored data
- XSS when data is displayed
- Database bloat from oversized responses

**Remediation**:
```javascript
// SECURE IMPLEMENTATION
const sanitizeGatewayResponse = (response) => {
    if (!response || typeof response !== 'object') {
        return null;
    }

    // Whitelist allowed fields only
    const allowedFields = [
        'id', 'status', 'amount', 'currency',
        'created', 'payment_method_types', 'client_secret'
    ];

    const sanitized = {};
    allowedFields.forEach(field => {
        if (response[field] !== undefined) {
            // Validate and sanitize each field
            sanitized[field] = String(response[field]).slice(0, 255);
        }
    });

    return sanitized;
};

// In controller
const payment = await Payment.create({
    // ...
    gatewayResponse: sanitizeGatewayResponse(gatewayResponse),
    transactionId: validator.escape(transactionId).slice(0, 100),
});
```

---

### 6. Missing Timeout Configuration for External APIs ⚠️ HIGH

**Severity**: 🟠 HIGH
**CWE**: CWE-400 (Uncontrolled Resource Consumption)

**Location**:
- `/src/controllers/invoice.controller.js` (line 3)
- `/src/controllers/order.controller.js` (line 4)

**Vulnerability**:
```javascript
// No timeout configured for Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET);
// ⚠️ Can hang indefinitely if Stripe API is slow/down
```

**Attack Vector**:
```
1. Stripe API experiences outage/slowdown
2. Payment requests hang indefinitely
3. Server runs out of available connections
4. Denial of Service - legitimate users can't access system
```

**Impact**:
- Application hangs during Stripe outages
- Resource exhaustion (connection pool, memory)
- Denial of Service
- Poor user experience

**Remediation**:
```javascript
// SECURE IMPLEMENTATION
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    timeout: 10000, // 10 second timeout
    maxNetworkRetries: 2,
    telemetry: false, // Don't send usage data to Stripe
});

// Wrap Stripe calls in timeout promise
const withTimeout = (promise, timeoutMs = 10000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
        )
    ]);
};

// Usage
try {
    const paymentIntent = await withTimeout(
        stripe.paymentIntents.create({...}),
        10000
    );
} catch (error) {
    if (error.message === 'Request timeout') {
        // Handle timeout gracefully
        return res.status(504).json({
            error: 'Payment gateway timeout. Please try again.'
        });
    }
    throw error;
}
```

---

### 7. Excessive Information Disclosure in Error Messages ⚠️ HIGH

**Severity**: 🟠 HIGH
**CWE**: CWE-209 (Generation of Error Message Containing Sensitive Information)

**Location**:
- `/src/controllers/client.controller.js` (lines 10-116)
- `/src/controllers/user.controller.js` (lines 232-233)
- `/src/controllers/dashboard.controller.js` (multiple locations)

**Vulnerability**:
```javascript
// client.controller.js - Lines 112-116
console.log('[CreateClient] Error message:', dbError.message);
console.log('[CreateClient] Error stack:', dbError.stack);  // ⚠️ EXPOSES PATHS
console.log('[CreateClient] Error name:', dbError.name);
if (dbError.code) console.log('[CreateClient] Error code:', dbError.code);
if (dbError.errors) console.log('[CreateClient] Validation errors:', JSON.stringify(dbError.errors, null, 2));

// These logs are visible in production logs
// Exposes: file paths, database structure, validation logic
```

**Attack Vector**:
```
1. Attacker triggers validation errors
2. Server logs contain:
   - Database schema details
   - File system paths
   - MongoDB query structure
   - Internal validation logic
3. Attacker uses this information for targeted attacks
```

**Impact**:
- Database schema exposure
- File system structure revelation
- Application logic disclosure
- Facilitates other attacks

**Remediation**:
```javascript
// SECURE IMPLEMENTATION
const logger = require('./logger'); // Use proper logging library

const createClient = async (req, res) => {
    try {
        // ... business logic
    } catch (error) {
        // ✅ Log detailed errors server-side only
        logger.error('Client creation failed', {
            error: error.message,
            stack: error.stack,
            userId: req.userID,
            timestamp: new Date().toISOString()
        });

        // ✅ Return generic error to client
        let clientMessage = 'Failed to create client';

        if (error.name === 'ValidationError') {
            // Return sanitized validation errors only
            clientMessage = 'Validation failed. Please check your input.';
        } else if (error.code === 11000) {
            clientMessage = 'Client with this information already exists';
        }

        return res.status(400).json({
            error: true,
            message: clientMessage,
            // ❌ NEVER include: stack, paths, query details
        });
    }
};
```

---

## Medium Severity Issues

### 8. No Retry Logic Protection ⚠️ MEDIUM

**Severity**: 🟡 MEDIUM
**CWE**: CWE-307 (Improper Restriction of Excessive Authentication Attempts)

**Location**:
- `/src/models/payment.model.js` (lines 86-88)
- `/src/controllers/payment.controller.js` (line 374)

**Vulnerability**:
```javascript
// payment.model.js has retryCount field
retryCount: {
    type: Number,
    default: 0
},

// But failPayment increments it without limits
payment.retryCount = (payment.retryCount || 0) + 1;  // ⚠️ NO MAX LIMIT
```

**Impact**:
- Infinite retry attempts allowed
- Resource exhaustion
- Potential for retry-based attacks

**Remediation**:
```javascript
// SECURE IMPLEMENTATION
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 60000; // 1 minute

const failPayment = async (req, res) => {
    // ...

    payment.retryCount = (payment.retryCount || 0) + 1;

    // ✅ Enforce maximum retries
    if (payment.retryCount >= MAX_RETRY_ATTEMPTS) {
        payment.status = 'permanently_failed';
        payment.failureReason = 'Maximum retry attempts exceeded';

        // Notify admin
        await notifyAdmin({
            type: 'payment_failed_max_retries',
            paymentId: payment._id,
            clientId: payment.clientId
        });
    }

    // ✅ Implement exponential backoff
    payment.nextRetryAt = new Date(
        Date.now() + (RETRY_DELAY_MS * Math.pow(2, payment.retryCount))
    );

    await payment.save();
};
```

---

### 9. CORS Wildcard for Vercel Deployments ⚠️ MEDIUM

**Severity**: 🟡 MEDIUM
**CWE**: CWE-942 (Overly Permissive Cross-domain Whitelist)

**Location**:
- `/src/server.js` (lines 108-111)

**Vulnerability**:
```javascript
// server.js - Line 109
if (origin.includes('.vercel.app')) {
    return callback(null, true);  // ⚠️ ALLOWS ALL VERCEL APPS
}
```

**Attack Vector**:
```
1. Attacker creates malicious app at: malicious-clone.vercel.app
2. App passes CORS check (contains .vercel.app)
3. Attacker can make authenticated requests to your API
4. Steal user data, perform actions on behalf of users
```

**Impact**:
- Any Vercel app can access your API
- Cross-origin attacks
- Session hijacking

**Remediation**:
```javascript
// SECURE IMPLEMENTATION
const ALLOWED_VERCEL_PATTERNS = [
    /^https:\/\/traf3li-dashboard-[a-zA-Z0-9-]+\.vercel\.app$/,
    /^https:\/\/traf3li-[a-zA-Z0-9-]+-mischa-alrabehs-projects\.vercel\.app$/,
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        // ✅ Strict Vercel pattern matching
        const isAllowedVercel = ALLOWED_VERCEL_PATTERNS.some(
            pattern => pattern.test(origin)
        );

        if (isAllowedVercel || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log('🚫 CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    // ... rest of config
};
```

---

### 10. Missing Input Validation for External Transaction IDs ⚠️ MEDIUM

**Severity**: 🟡 MEDIUM
**CWE**: CWE-20 (Improper Input Validation)

**Location**:
- `/src/controllers/payment.controller.js` (line 18)

**Vulnerability**:
```javascript
// payment.controller.js - Line 18
const { transactionId, gatewayResponse } = req.body;

const payment = await Payment.create({
    transactionId,  // ⚠️ NO VALIDATION
    // Could be: "'; DROP TABLE payments; --"
});
```

**Remediation**:
```javascript
// SECURE IMPLEMENTATION
const validator = require('validator');

const validateTransactionId = (txId) => {
    if (!txId) return null;

    // Transaction IDs should be alphanumeric with specific format
    const txIdRegex = /^[a-zA-Z0-9_-]{1,100}$/;

    if (!txIdRegex.test(txId)) {
        throw new CustomException('Invalid transaction ID format', 400);
    }

    return validator.escape(txId);
};

// In controller
const validatedTxId = validateTransactionId(transactionId);
```

---

## Attack Scenarios

### Scenario 1: Payment Fraud via Webhook Bypass

**Attack Flow**:
```
1. Attacker creates account on traf3li.com
2. Selects expensive legal service ($10,000)
3. Initiates checkout, receives payment_intent: pi_abc123
4. CLOSES payment page without paying
5. Sends direct API request:
   POST /api/invoices/confirm-payment
   Body: { "paymentIntent": "pi_abc123" }
6. Invoice marked as PAID without actual payment
7. Receives service for free
```

**Financial Impact**: Unlimited - can repeat for all services

---

### Scenario 2: Data Decryption via Hardcoded Keys

**Attack Flow**:
```
1. Attacker reviews public GitHub repository
2. Finds hardcoded encryption key in src/utils/encryption.js
3. Dumps encrypted legal documents from compromised database
4. Decrypts all sensitive client data using hardcoded key
5. Sells confidential legal documents on dark web
```

**Legal Impact**: GDPR violation, client confidentiality breach

---

### Scenario 3: Test Mode Production Exploit

**Attack Flow**:
```
1. Attacker discovers TEST_MODE environment variable
2. In production, sets TEST_MODE=true via:
   - Environment variable injection
   - Configuration file modification
   - Server compromise
3. Uses /create-test-contract endpoint
4. Purchases unlimited services without payment
5. Sells access to other attackers
```

**Business Impact**: Complete revenue loss

---

### Scenario 4: Stripe API Key Misconfiguration DoS

**Attack Flow**:
```
1. STRIPE_SECRET env var not set (due to name mismatch)
2. Stripe SDK receives undefined as API key
3. All payment requests fail
4. Application becomes unusable for payments
5. Business loses all revenue
```

**Availability Impact**: Complete payment system failure

---

## Remediation Guide

### Priority 1: Immediate Actions (Fix within 24 hours)

1. **Fix API Key Variable Name**
   ```bash
   # In all controllers
   - process.env.STRIPE_SECRET
   + process.env.STRIPE_SECRET_KEY
   ```

2. **Remove Hardcoded Secrets**
   ```javascript
   // encryption.js & generateToken.js
   if (!key && process.env.NODE_ENV === 'production') {
       throw new Error('CRITICAL: Key not configured');
   }
   ```

3. **Implement Webhook Signature Validation**
   - Create `/api/webhooks/stripe` endpoint
   - Verify signatures using stripe.webhooks.constructEvent()
   - Remove client-side payment confirmation

4. **Disable Test Mode Endpoints**
   ```javascript
   // Remove or protect test endpoints
   if (process.env.NODE_ENV === 'production') {
       // Never expose test endpoints
   }
   ```

### Priority 2: Critical Security (Fix within 1 week)

5. **Implement Request Timeouts**
   ```javascript
   const stripe = require('stripe')(key, { timeout: 10000 });
   ```

6. **Sanitize External Data**
   ```javascript
   const sanitized = sanitizeGatewayResponse(gatewayResponse);
   ```

7. **Remove Debug Logging**
   ```javascript
   // Remove all console.log in production code
   // Use structured logging (Winston, Bunyan)
   ```

8. **Restrict CORS**
   ```javascript
   // Use regex patterns for Vercel deployments
   ```

### Priority 3: Best Practices (Fix within 1 month)

9. **Implement Retry Limits**
10. **Add Rate Limiting for Payment Endpoints**
11. **Implement Proper Error Handling**
12. **Add API Request Monitoring**

---

## Secure Integration Patterns

### Pattern 1: Secure Webhook Handler

```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ✅ SECURE WEBHOOK IMPLEMENTATION
router.post(
    '/webhooks/stripe',
    express.raw({ type: 'application/json' }), // Important: raw body for signature
    async (req, res) => {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            // ✅ Verify webhook signature
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                webhookSecret
            );
        } catch (err) {
            console.error('⚠️ Webhook signature verification failed');
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // ✅ Process verified events
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await handlePaymentSuccess(event.data.object);
                    break;

                case 'payment_intent.payment_failed':
                    await handlePaymentFailure(event.data.object);
                    break;

                case 'charge.refunded':
                    await handleRefund(event.data.object);
                    break;

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            res.json({ received: true });
        } catch (err) {
            console.error('Error processing webhook:', err);
            res.status(500).send('Webhook processing failed');
        }
    }
);

// Helper functions
async function handlePaymentSuccess(paymentIntent) {
    const invoice = await Invoice.findOne({
        paymentIntent: paymentIntent.id
    });

    if (!invoice) {
        throw new Error(`Invoice not found for payment: ${paymentIntent.id}`);
    }

    // ✅ Validate amount matches
    if (invoice.total * 100 !== paymentIntent.amount) {
        throw new Error('Payment amount mismatch');
    }

    // ✅ Update invoice
    invoice.status = 'paid';
    invoice.paidDate = new Date();
    invoice.stripeChargeId = paymentIntent.charges.data[0]?.id;
    await invoice.save();

    // ✅ Log audit trail
    await AuditLog.create({
        action: 'payment_confirmed',
        resource: 'invoice',
        resourceId: invoice._id,
        metadata: {
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency
        }
    });
}
```

### Pattern 2: Secure API Key Management

```javascript
// config/stripe.js
const validateStripeConfig = () => {
    const key = process.env.STRIPE_SECRET_KEY;

    // ✅ Ensure key exists
    if (!key) {
        throw new Error('STRIPE_SECRET_KEY not configured');
    }

    // ✅ Validate key format
    if (!key.startsWith('sk_')) {
        throw new Error('Invalid Stripe secret key format');
    }

    // ✅ Prevent test keys in production
    if (process.env.NODE_ENV === 'production' && key.startsWith('sk_test_')) {
        throw new Error('Cannot use Stripe test key in production');
    }

    // ✅ Prevent live keys in development
    if (process.env.NODE_ENV === 'development' && key.startsWith('sk_live_')) {
        console.warn('⚠️  WARNING: Using Stripe LIVE key in development');
    }

    return key;
};

// Initialize Stripe with validated config
const stripe = require('stripe')(validateStripeConfig(), {
    apiVersion: '2023-10-16', // Pin API version
    timeout: 10000, // 10 second timeout
    maxNetworkRetries: 2,
    telemetry: false // Don't send usage data
});

module.exports = stripe;
```

### Pattern 3: Secure External Data Sanitization

```javascript
// utils/sanitizeExternalData.js
const validator = require('validator');

const sanitizeGatewayResponse = (response) => {
    if (!response || typeof response !== 'object') {
        return null;
    }

    // ✅ Whitelist only necessary fields
    const allowedFields = {
        id: (val) => validator.isAlphanumeric(val.replace(/_/g, '')),
        status: (val) => ['succeeded', 'pending', 'failed'].includes(val),
        amount: (val) => Number.isInteger(val) && val > 0,
        currency: (val) => /^[A-Z]{3}$/.test(val),
        created: (val) => Number.isInteger(val),
    };

    const sanitized = {};

    Object.keys(allowedFields).forEach(field => {
        if (response[field] !== undefined) {
            const validator = allowedFields[field];

            if (validator(response[field])) {
                sanitized[field] = response[field];
            } else {
                console.warn(`Invalid ${field} in gateway response`);
            }
        }
    });

    // ✅ Limit size
    const jsonSize = JSON.stringify(sanitized).length;
    if (jsonSize > 10000) { // 10KB limit
        throw new Error('Gateway response too large');
    }

    return sanitized;
};

module.exports = { sanitizeGatewayResponse };
```

### Pattern 4: Secure Error Handling

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    // ✅ Log detailed error server-side only
    logger.error('Request failed', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        userId: req.userID,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    // ✅ Determine safe error message for client
    let statusCode = err.statusCode || 500;
    let clientMessage = 'An error occurred';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        // ✅ Return sanitized validation errors only
        clientMessage = Object.values(err.errors)
            .map(e => e.message)
            .join(', ');
    } else if (err.name === 'MongoError' && err.code === 11000) {
        statusCode = 400;
        clientMessage = 'Duplicate entry';
    } else if (err.isOperational) {
        // Custom operational errors (safe to expose)
        clientMessage = err.message;
    }

    // ✅ Never expose internal details
    res.status(statusCode).json({
        error: true,
        message: clientMessage,
        // ❌ NEVER include: stack, paths, database details
        ...(process.env.NODE_ENV === 'development' && {
            devError: err.message
        })
    });
};
```

### Pattern 5: Environment-Based Configuration Validation

```javascript
// config/validateConfig.js
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

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));

        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }

    // ✅ Validate key formats
    if (process.env.ENCRYPTION_KEY?.length !== 64) {
        throw new Error('ENCRYPTION_KEY must be 64 hex characters');
    }

    if (process.env.JWT_SECRET?.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters');
    }

    console.log('✅ Configuration validated');
};

// Call on startup
validateConfig();
```

---

## Summary of Findings

| Vulnerability | Severity | Files Affected | CVSS Score |
|--------------|----------|----------------|------------|
| Missing Webhook Signature Validation | 🔴 CRITICAL | invoice.controller.js, order.controller.js | 9.8 |
| API Key Env Var Mismatch | 🔴 CRITICAL | invoice.controller.js, order.controller.js | 8.9 |
| Hardcoded Fallback Keys | 🔴 CRITICAL | encryption.js, generateToken.js | 9.1 |
| Test Mode Payment Bypass | 🔴 CRITICAL | order.route.js, order.controller.js | 9.3 |
| Unvalidated Third-Party Data | 🟠 HIGH | payment.controller.js, payment.model.js | 7.5 |
| Missing API Timeouts | 🟠 HIGH | invoice.controller.js, order.controller.js | 6.5 |
| Information Disclosure | 🟠 HIGH | client.controller.js, user.controller.js | 7.2 |
| No Retry Limits | 🟡 MEDIUM | payment.controller.js | 5.3 |
| Overly Permissive CORS | 🟡 MEDIUM | server.js | 6.1 |
| Missing Input Validation | 🟡 MEDIUM | payment.controller.js | 5.8 |

**Total Vulnerabilities**: 10
**Critical**: 4
**High**: 3
**Medium**: 3

---

## Compliance Impact

### GDPR Violations
- Hardcoded encryption keys = inadequate data protection
- Information disclosure = data breach
- No audit trail for payment webhooks = accountability failure

### PCI DSS Non-Compliance
- Missing webhook verification = payment data integrity
- Inadequate error handling = sensitive data exposure
- No timeout configuration = availability risk

---

## Next Steps

1. **Immediate**: Fix all CRITICAL vulnerabilities (24 hours)
2. **Short-term**: Address HIGH severity issues (1 week)
3. **Medium-term**: Implement MEDIUM severity fixes (1 month)
4. **Long-term**: Establish secure development practices
5. **Ongoing**: Regular security audits and penetration testing

---

**Report Generated**: 2025-12-22
**Next Audit Recommended**: After implementing fixes + 3 months

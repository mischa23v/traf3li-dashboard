# INPUT VALIDATION IMPLEMENTATION GUIDE
**Step-by-Step Implementation for traf3li-backend**

---

## 🚀 QUICK START (30 Minutes)

### Step 1: Install Dependencies (2 minutes)

```bash
cd "traf3li-backend-for testing only different github"

# Install validation library
npm install joi

# Install sanitization libraries
npm install express-mongo-sanitize xss-clean

# Save to package.json
npm install --save joi express-mongo-sanitize xss-clean
```

### Step 2: Create Validation Middleware (5 minutes)

Create file: `/src/middlewares/validation.middleware.js`

```javascript
const Joi = require('joi');

/**
 * Generic validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - 'body', 'query', or 'params'
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,        // Return all errors, not just first
      stripUnknown: true,       // Remove fields not in schema
      convert: true,            // Type coercion (string to number, etc.)
      errors: {
        wrap: { label: '' }     // Remove quotes from field names
      }
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        errors
      });
    }

    // Replace request property with validated & sanitized value
    req[property] = value;
    next();
  };
};

module.exports = { validate };
```

### Step 3: Create Validation Schemas Directory (1 minute)

```bash
mkdir -p src/validations
```

### Step 4: Create Auth Validation (5 minutes)

Create file: `/src/validations/auth.validation.js`

```javascript
const Joi = require('joi');

// Password must contain: 8+ chars, uppercase, lowercase, number, special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

const registerSchema = Joi.object({
  username: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Username can only contain letters, numbers, hyphens and underscores',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 50 characters',
      'any.required': 'Username is required'
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .max(255)
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^(\+966|966|0)?5\d{8}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be a valid Saudi mobile number'
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
      'any.required': 'Password is required'
    }),

  image: Joi.string()
    .uri()
    .max(2048)
    .optional(),

  country: Joi.string()
    .trim()
    .max(100)
    .default('Saudi Arabia'),

  description: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow(''),

  isSeller: Joi.boolean()
    .default(false),

  role: Joi.string()
    .valid('client', 'lawyer')
    .optional()
    .messages({
      'any.only': 'Role must be either client or lawyer'
    })
});

const loginSchema = Joi.object({
  username: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Username or email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

module.exports = {
  registerSchema,
  loginSchema
};
```

### Step 5: Update Auth Routes (5 minutes)

Update file: `/src/routes/auth.route.js`

```javascript
const express = require('express');
const { authLogin, authLogout, authRegister, authStatus } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares');
const { validate } = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');

const app = express.Router();

// ✅ VALIDATED: Register with validation
app.post('/register', validate(registerSchema), authRegister);

// ✅ VALIDATED: Login with validation
app.post('/login', validate(loginSchema), authLogin);

// Logout (no validation needed)
app.post('/logout', authLogout);

// Check Auth status (protected route)
app.get('/me', authenticate, authStatus);

module.exports = app;
```

### Step 6: Add Global Sanitization (5 minutes)

Update file: `/src/server.js`

Find the line where you use `app.use(express.json())` and update:

```javascript
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const app = express();

// Security headers
app.use(helmet());

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize against NoSQL injection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] Sanitized NoSQL injection attempt in ${req.path}: ${key}`);
  }
}));

// Sanitize against XSS
app.use(xss());

// ... rest of your app configuration
```

### Step 7: Test (5 minutes)

**Test 1: Valid Registration**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser123",
    "email": "test@example.com",
    "password": "StrongPass123!",
    "phone": "0501234567"
  }'
```

**Expected:** ✅ Success (201)

**Test 2: Invalid Username (special chars)**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@user",
    "email": "test@example.com",
    "password": "StrongPass123!"
  }'
```

**Expected:** ❌ Validation Error (400)

**Test 3: NoSQL Injection Attempt**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": {"$ne": null},
    "password": {"$ne": null}
  }'
```

**Expected:** ❌ Validation Error (400) + Sanitized

---

## 📋 PHASE 1: CRITICAL ENDPOINTS (Week 1)

### Payment Validation

Create file: `/src/validations/payment.validation.js`

```javascript
const Joi = require('joi');

const createPaymentSchema = Joi.object({
  clientId: Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid client ID format'
    }),

  invoiceId: Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .optional(),

  caseId: Joi.string()
    .pattern(/^[a-fA-F0-9]{24}$/)
    .optional(),

  amount: Joi.number()
    .positive()
    .precision(2)
    .max(999999999.99)
    .required()
    .messages({
      'number.positive': 'Amount must be greater than zero',
      'number.max': 'Amount cannot exceed 999,999,999.99',
      'any.required': 'Amount is required'
    }),

  currency: Joi.string()
    .valid('SAR', 'USD', 'EUR', 'GBP')
    .default('SAR'),

  paymentMethod: Joi.string()
    .valid('cash', 'bank_transfer', 'check', 'credit_card', 'online_gateway', 'mada', 'stc_pay')
    .required(),

  gatewayProvider: Joi.string()
    .valid('stripe', 'paypal', 'hyperpay', 'moyasar', 'tap')
    .when('paymentMethod', {
      is: 'online_gateway',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),

  transactionId: Joi.string()
    .trim()
    .max(255)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .optional(),

  checkNumber: Joi.string()
    .trim()
    .max(50)
    .when('paymentMethod', {
      is: 'check',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),

  checkDate: Joi.date()
    .iso()
    .max('now')
    .when('paymentMethod', {
      is: 'check',
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),

  bankName: Joi.string()
    .trim()
    .max(255)
    .optional(),

  allocations: Joi.array()
    .items(
      Joi.object({
        invoiceId: Joi.string().pattern(/^[a-fA-F0-9]{24}$/),
        amount: Joi.number().positive().precision(2)
      })
    )
    .max(50)
    .optional(),

  notes: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow(''),

  internalNotes: Joi.string()
    .trim()
    .max(5000)
    .optional()
    .allow('')
});

const refundSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .optional(),

  reason: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .required()
});

module.exports = {
  createPaymentSchema,
  refundSchema
};
```

Update file: `/src/routes/payment.route.js`

```javascript
const express = require('express');
const { userMiddleware } = require('../middlewares');
const { validate } = require('../middlewares/validation.middleware');
const { createPaymentSchema, refundSchema } = require('../validations/payment.validation');
const {
  createPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
  completePayment,
  failPayment,
  createRefund,
  sendReceipt,
  getPaymentStats,
  bulkDeletePayments
} = require('../controllers/payment.controller');

const app = express.Router();

app.post('/', userMiddleware, validate(createPaymentSchema), createPayment);
app.get('/', userMiddleware, getPayments);
app.get('/stats', userMiddleware, getPaymentStats);
app.get('/:id', userMiddleware, getPayment);
app.put('/:id', userMiddleware, updatePayment);
app.delete('/:id', userMiddleware, deletePayment);

app.post('/:id/complete', userMiddleware, completePayment);
app.post('/:id/fail', userMiddleware, failPayment);
app.post('/:id/refund', userMiddleware, validate(refundSchema), createRefund);
app.post('/:id/receipt', userMiddleware, sendReceipt);

app.delete('/bulk', userMiddleware, bulkDeletePayments);

module.exports = app;
```

### Client Validation

Create file: `/src/validations/client.validation.js`

```javascript
const Joi = require('joi');

const createClientSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .optional(),

  fullNameArabic: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .pattern(/^[\u0600-\u06FF\s]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Arabic name must contain Arabic characters only'
    }),

  fullNameEnglish: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .pattern(/^[a-zA-Z\s]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'English name must contain English letters only'
    }),

  firstName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .max(255)
    .optional(),

  phone: Joi.string()
    .trim()
    .pattern(/^(\+966|966|0)?5\d{8}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid Saudi phone number format'
    }),

  alternatePhone: Joi.string()
    .trim()
    .pattern(/^(\+966|966|0)?5\d{8}$/)
    .optional(),

  nationalId: Joi.string()
    .trim()
    .length(10)
    .pattern(/^[12]\d{9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'National ID must be 10 digits starting with 1 or 2'
    }),

  companyName: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .optional(),

  companyNameEnglish: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .optional(),

  crNumber: Joi.string()
    .trim()
    .length(10)
    .pattern(/^\d{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'CR number must be exactly 10 digits'
    }),

  address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),

  city: Joi.string()
    .trim()
    .max(100)
    .optional(),

  country: Joi.string()
    .trim()
    .max(100)
    .default('Saudi Arabia'),

  notes: Joi.string()
    .trim()
    .max(5000)
    .optional()
    .allow(''),

  preferredContactMethod: Joi.string()
    .valid('email', 'phone', 'whatsapp', 'sms')
    .default('email'),

  language: Joi.string()
    .valid('ar', 'en')
    .default('ar'),

  status: Joi.string()
    .valid('active', 'inactive', 'archived')
    .default('active'),

  clientType: Joi.string()
    .valid('individual', 'company')
    .default('individual'),

  gender: Joi.string()
    .valid('male', 'female')
    .optional(),

  nationality: Joi.string()
    .trim()
    .max(100)
    .optional(),

  legalRepresentative: Joi.object({
    name: Joi.string().trim().min(2).max(255),
    position: Joi.string().trim().max(100),
    nationalId: Joi.string().trim().length(10).pattern(/^\d{10}$/),
    phone: Joi.string().trim()
  }).optional()
});

const bulkDeleteSchema = Joi.object({
  clientIds: Joi.array()
    .items(Joi.string().pattern(/^[a-fA-F0-9]{24}$/))
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'At least one client ID is required',
      'array.max': 'Cannot delete more than 100 clients at once'
    })
});

module.exports = {
  createClientSchema,
  bulkDeleteSchema
};
```

Update file: `/src/routes/client.route.js`

```javascript
const express = require('express');
const { userMiddleware } = require('../middlewares');
const { validate } = require('../middlewares/validation.middleware');
const { createClientSchema, bulkDeleteSchema } = require('../validations/client.validation');
const {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  searchClients,
  getClientStats,
  getTopClientsByRevenue,
  bulkDeleteClients
} = require('../controllers/client.controller');

const app = express.Router();

app.post('/', userMiddleware, validate(createClientSchema), createClient);
app.get('/', userMiddleware, getClients);
app.get('/stats', userMiddleware, getClientStats);
app.get('/top-revenue', userMiddleware, getTopClientsByRevenue);
app.get('/search', userMiddleware, searchClients);
app.get('/:id', userMiddleware, getClient);
app.put('/:id', userMiddleware, validate(createClientSchema), updateClient);
app.delete('/:id', userMiddleware, deleteClient);

app.delete('/bulk', userMiddleware, validate(bulkDeleteSchema), bulkDeleteClients);

module.exports = app;
```

---

## 🧪 TESTING YOUR VALIDATION

### Create Test File

Create file: `/tests/validation/validation.test.js`

```javascript
const request = require('supertest');
const app = require('../../src/server');

describe('Validation Middleware', () => {
  describe('Auth Validation', () => {
    it('should reject NoSQL injection in username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: { $ne: null },
          email: 'test@test.com',
          password: 'Test123!@#'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@test.com',
          password: 'weak'
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('password');
    });
  });

  describe('Payment Validation', () => {
    it('should reject negative amount', async () => {
      const res = await request(app)
        .post('/api/payments')
        .send({
          clientId: '507f1f77bcf86cd799439011',
          amount: -1000,
          paymentMethod: 'cash'
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('amount');
    });

    it('should reject amount exceeding max', async () => {
      const res = await request(app)
        .post('/api/payments')
        .send({
          clientId: '507f1f77bcf86cd799439011',
          amount: 9999999999999,
          paymentMethod: 'cash'
        });

      expect(res.status).toBe(400);
    });
  });
});
```

Run tests:
```bash
npm test
```

---

## 📊 VALIDATION PATTERNS REFERENCE

### Common Patterns

```javascript
// MongoDB ObjectId
Joi.string().pattern(/^[a-fA-F0-9]{24}$/)

// Saudi Phone
Joi.string().pattern(/^(\+966|966|0)?5\d{8}$/)

// Saudi National ID
Joi.string().length(10).pattern(/^[12]\d{9}$/)

// Email
Joi.string().trim().lowercase().email().max(255)

// Money Amount
Joi.number().positive().precision(2).max(999999999.99)

// Past Date Only
Joi.date().iso().max('now')

// Future Date Only
Joi.date().iso().min('now')

// Enum
Joi.string().valid('value1', 'value2', 'value3')

// Array with Limits
Joi.array().items(schema).min(1).max(100)

// Text with Length
Joi.string().trim().min(2).max(5000)

// Safe String (alphanumeric + dash/underscore)
Joi.string().pattern(/^[a-zA-Z0-9_-]+$/)

// URL
Joi.string().uri().max(2048)

// Arabic Text Only
Joi.string().pattern(/^[\u0600-\u06FF\s]+$/)
```

---

## ✅ COMPLETION CHECKLIST

### Week 1: Critical
- [x] Install Joi and sanitization packages
- [x] Create validation middleware
- [x] Implement auth validation
- [x] Implement payment validation
- [x] Implement client validation
- [x] Add global sanitization

### Week 2: High Priority
- [ ] Invoice validation
- [ ] Expense validation
- [ ] Case validation
- [ ] Transaction validation
- [ ] Query parameter validation

### Week 3: Medium Priority
- [ ] Order validation
- [ ] User validation
- [ ] Remaining controllers
- [ ] Unicode normalization

### Week 4: Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Penetration testing
- [ ] Security audit

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot find module 'joi'"
**Solution:**
```bash
npm install joi
```

### Issue: Validation always passes
**Solution:** Check that middleware is applied BEFORE controller:
```javascript
app.post('/endpoint', validate(schema), controller);  // ✅ Correct
app.post('/endpoint', controller, validate(schema));  // ❌ Wrong
```

### Issue: Validation errors not showing
**Solution:** Check error handling in middleware:
```javascript
if (error) {
  return res.status(400).json({ ... });  // Must have 'return'
}
```

### Issue: "stripUnknown" not working
**Solution:** Check schema options:
```javascript
schema.validate(data, { stripUnknown: true })  // ✅ Correct
```

---

## 📞 SUPPORT

For questions or issues:
1. Check `/INPUT_VALIDATION_SECURITY_SCAN_REPORT.md`
2. Review Joi documentation: https://joi.dev/
3. Check OWASP Input Validation: https://cheatsheetseries.owasp.org/

---

**Last Updated:** 2025-12-22
**Status:** Ready for Implementation

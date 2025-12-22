# LOG INJECTION - IMMEDIATE IMPLEMENTATION GUIDE

**Priority:** CRITICAL
**Implementation Time:** 2-4 hours
**Impact:** Eliminates log injection vulnerabilities

---

## STEP 1: Create Log Sanitizer Middleware (15 minutes)

Create file: `/src/middlewares/logSanitizer.middleware.js`

```javascript
/**
 * Log Sanitization Middleware
 * Prevents log injection attacks and sensitive data exposure
 *
 * Usage:
 *   const { safeLog } = require('./middlewares/logSanitizer.middleware');
 *   safeLog.info('User created', { userId: user._id });
 */

/**
 * Sanitize string for safe logging
 * - Removes CRLF characters (prevents log forging)
 * - Removes null bytes (prevents log truncation)
 * - Removes ANSI escape codes (prevents terminal manipulation)
 * - Limits length (prevents log flooding)
 */
const sanitizeForLog = (input) => {
  if (input === null || input === undefined) {
    return input;
  }

  // Convert to string
  let sanitized = String(input);

  // 1. Remove CRLF characters (prevents log injection)
  sanitized = sanitized.replace(/[\r\n]/g, ' ');

  // 2. Remove null bytes (prevents log truncation)
  sanitized = sanitized.replace(/\0/g, '');

  // 3. Remove ANSI escape codes (prevents terminal manipulation)
  // Matches: \x1b[...m
  sanitized = sanitized.replace(/\x1b\[[0-9;]*m/g, '');

  // 4. Remove other control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // 5. Limit length to prevent log flooding (DoS)
  const MAX_LENGTH = 500;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH) + '... [TRUNCATED]';
  }

  return sanitized;
};

/**
 * Sanitize object for safe logging
 * - Recursively sanitizes nested objects
 * - Redacts sensitive fields (passwords, tokens, PII)
 * - Prevents circular references
 * - Limits depth to prevent DoS
 */
const sanitizeObject = (obj, depth = 0, seen = new WeakSet()) => {
  // Prevent infinite recursion
  const MAX_DEPTH = 5;
  if (depth > MAX_DEPTH) {
    return '[Max depth exceeded]';
  }

  // Handle primitives
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return sanitizeForLog(obj);
  }

  // Prevent circular references
  if (seen.has(obj)) {
    return '[Circular Reference]';
  }
  seen.add(obj);

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1, seen));
  }

  // Sensitive field patterns (case-insensitive regex)
  const sensitivePatterns = [
    // Authentication
    /^password$/i,
    /^passwd$/i,
    /^pwd$/i,
    /currentPassword/i,
    /newPassword/i,
    /confirmPassword/i,
    /oldPassword/i,

    // Tokens & Keys
    /^token$/i,
    /accessToken/i,
    /refreshToken/i,
    /^apiKey$/i,
    /api[_-]?key/i,
    /^secret$/i,
    /clientSecret/i,
    /^auth$/i,
    /authorization/i,
    /^jwt$/i,
    /sessionId/i,
    /csrf/i,

    // Financial
    /creditCard/i,
    /cardNumber/i,
    /^cvv$/i,
    /^ccv$/i,
    /^pin$/i,
    /bankAccount/i,
    /accountNumber/i,
    /^iban$/i,
    /^swift$/i,
    /routingNumber/i,

    // Personal Identifiable Information (PII)
    /^ssn$/i,
    /socialSecurity/i,
    /nationalId/i,
    /^nid$/i,
    /^iqama$/i,
    /passport/i,
    /drivingLicense/i,
    /license/i,

    // Saudi Arabia specific
    /سجل.*مدني/,  // Saudi National ID
    /رقم.*الهوية/, // ID Number

    // Other sensitive
    /^otp$/i,
    /verificationCode/i,
    /resetCode/i,
    /^code$/i,
    /privateKey/i,
    /encryptionKey/i,
  ];

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    // Check if key matches sensitive pattern
    const isSensitive = sensitivePatterns.some(pattern => pattern.test(key));

    if (isSensitive) {
      // Completely redact sensitive fields
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value, depth + 1, seen);
    } else {
      // Sanitize primitive values
      sanitized[key] = sanitizeForLog(value);
    }
  }

  return sanitized;
};

/**
 * Safe logging wrapper
 * Drop-in replacement for console.log/error/warn
 */
const safeLog = {
  /**
   * Log info message
   */
  info: (...args) => {
    const sanitized = args.map(arg =>
      typeof arg === 'object' ? sanitizeObject(arg) : sanitizeForLog(arg)
    );
    console.log('[INFO]', new Date().toISOString(), ...sanitized);
  },

  /**
   * Log error message
   */
  error: (...args) => {
    const sanitized = args.map(arg => {
      // Special handling for Error objects
      if (arg instanceof Error) {
        return {
          message: sanitizeForLog(arg.message),
          name: arg.name,
          // Only include stack in development
          ...(process.env.NODE_ENV !== 'production' && {
            stack: sanitizeForLog(arg.stack)
          })
        };
      }
      return typeof arg === 'object' ? sanitizeObject(arg) : sanitizeForLog(arg);
    });
    console.error('[ERROR]', new Date().toISOString(), ...sanitized);
  },

  /**
   * Log warning message
   */
  warn: (...args) => {
    const sanitized = args.map(arg =>
      typeof arg === 'object' ? sanitizeObject(arg) : sanitizeForLog(arg)
    );
    console.warn('[WARN]', new Date().toISOString(), ...sanitized);
  },

  /**
   * Log debug message (only in development)
   */
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      const sanitized = args.map(arg =>
        typeof arg === 'object' ? sanitizeObject(arg) : sanitizeForLog(arg)
      );
      console.log('[DEBUG]', new Date().toISOString(), ...sanitized);
    }
  },
};

/**
 * Redact PII from objects (more aggressive than sanitize)
 * Use for audit logs or user-facing data
 */
const redactPII = (obj) => {
  const piiPatterns = [
    // Contact Information
    /^email$/i,
    /^phone$/i,
    /^mobile$/i,
    /alternatePhone/i,
    /^fax$/i,

    // Personal Details
    /^fullName$/i,
    /firstName/i,
    /lastName/i,
    /middleName/i,
    /^address$/i,
    /street/i,
    /^city$/i,
    /postalCode/i,
    /zipCode/i,
    /dateOfBirth/i,
    /^dob$/i,
    /birthDate/i,

    // National IDs
    /nationalId/i,
    /^nid$/i,
    /iqama/i,
    /passport/i,

    // Saudi Arabia PII
    /سجل.*مدني/,
    /رقم.*الجوال/,
    /البريد.*الإلكتروني/,
  ];

  const redacted = typeof obj === 'object' ? { ...obj } : obj;

  if (typeof redacted === 'object' && redacted !== null) {
    for (const key of Object.keys(redacted)) {
      const isPII = piiPatterns.some(pattern => pattern.test(key));
      if (isPII) {
        redacted[key] = '[PII_REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = redactPII(redacted[key]);
      }
    }
  }

  return redacted;
};

module.exports = {
  sanitizeForLog,
  sanitizeObject,
  redactPII,
  safeLog,
};
```

---

## STEP 2: Fix Error Middleware (5 minutes)

Update file: `/src/middlewares/errorMiddleware.js`

```javascript
const { safeLog } = require('./logSanitizer.middleware');

const errorMiddleware = (error, request, response, next) => {
    // Safe logging - no user input
    safeLog.error('========== BACKEND ERROR ==========');
    safeLog.error('[ErrorMiddleware] Timestamp:', new Date().toISOString());
    safeLog.error('[ErrorMiddleware] Request URL:', request.originalUrl);
    safeLog.error('[ErrorMiddleware] Request method:', request.method);
    safeLog.error('[ErrorMiddleware] Error type:', error.constructor.name);

    // Sanitize error message (may contain user input)
    safeLog.error('[ErrorMiddleware] Error message:', error.message);

    // Only log stack trace in development
    if (process.env.NODE_ENV !== 'production') {
        safeLog.error('[ErrorMiddleware] Error stack:', error.stack);
    }

    // DON'T log:
    // - Full error object (circular refs, sensitive data)
    // - Request body (user input, PII)
    // - Request headers (tokens, cookies)
    // - Validation errors (may contain user input)

    const status = error.status || 500;
    const message = error.message || 'Something went wrong!';

    return response.status(status).send({
        error: true,
        message
    });
}

module.exports = errorMiddleware;
```

---

## STEP 3: Fix Client Controller (10 minutes)

Update file: `/src/controllers/client.controller.js`

```javascript
const { safeLog } = require('../middlewares/logSanitizer.middleware');

const createClient = asyncHandler(async (req, res) => {
    // Only log in development, and only non-PII data
    if (process.env.NODE_ENV !== 'production') {
        safeLog.debug('[CreateClient] Request received from user:', req.userID);
    }

    // ❌ REMOVE ALL THESE:
    // console.log('[CreateClient] Request body:', JSON.stringify(req.body, null, 2));
    // console.log('[CreateClient] Request headers:', JSON.stringify(req.headers, null, 2));
    // console.log('  - email:', email);
    // console.log('  - phone:', phone);
    // console.log('  - nationalId:', nationalId);

    const {
        fullName,
        fullNameArabic,
        fullNameEnglish,
        firstName,
        lastName,
        email,
        phone,
        alternatePhone,
        nationalId,
        companyName,
        companyNameEnglish,
        crNumber,
        companyRegistration,
        address,
        city,
        country = 'Saudi Arabia',
        notes,
        preferredContactMethod = 'email',
        preferredContact,
        language = 'ar',
        status = 'active',
        clientType = 'individual',
        gender,
        nationality,
        legalRepresentative
    } = req.body;

    const lawyerId = req.userID;

    const computedFullName = fullName || fullNameArabic ||
        [firstName, lastName].filter(Boolean).join(' ') ||
        companyName || 'عميل جديد';

    try {
        const client = await Client.create({
            lawyerId,
            fullName: computedFullName,
            fullNameArabic,
            fullNameEnglish,
            firstName,
            lastName,
            email,
            phone,
            alternatePhone,
            nationalId,
            companyName,
            companyNameEnglish,
            crNumber,
            companyRegistration,
            address,
            city,
            country,
            notes,
            preferredContactMethod: preferredContactMethod || preferredContact,
            language,
            status,
            clientType,
            gender,
            nationality,
            legalRepresentative
        });

        // ✅ Safe logging - only log client ID (not PII)
        safeLog.info('[CreateClient] Client created successfully', {
            clientId: client._id,
            lawyerId: lawyerId,
            clientType: clientType
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء العميل بنجاح',
            client
        });
    } catch (dbError) {
        // ❌ REMOVE:
        // console.log('[CreateClient] ❌ Database error!');
        // console.log('[CreateClient] Error message:', dbError.message);
        // console.log('[CreateClient] Validation errors:', JSON.stringify(dbError.errors));

        // ✅ Safe logging - let error middleware handle it
        safeLog.error('[CreateClient] Database error:', dbError.message);
        throw dbError;
    }
});
```

---

## STEP 4: Fix Server CORS Logging (2 minutes)

Update file: `/src/server.js`

```javascript
const { safeLog } = require('./middlewares/logSanitizer.middleware');

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        if (origin.includes('.vercel.app')) {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // ✅ Safe logging - sanitize user-controlled origin
        safeLog.warn('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    // ... rest of config
};

// Update error handler
app.use((err, req, res, next) => {
    // ✅ Use safe logger instead of console.error
    safeLog.error('Global error handler:', err);
    res.status(500).send({ error: true, message: 'Something went wrong!' });
});
```

---

## STEP 5: Fix Audit Log Middleware (10 minutes)

Update file: `/src/middlewares/auditLog.middleware.js`

```javascript
const { sanitizeObject, redactPII, safeLog } = require('./logSanitizer.middleware');

const extractDetails = (req) => {
  const details = {};

  // Comprehensive sensitive fields list
  const sensitiveFields = [
    // Authentication
    'password', 'currentPassword', 'newPassword', 'confirmPassword', 'oldPassword',
    'token', 'accessToken', 'refreshToken', 'apiKey', 'secret', 'jwt',

    // Financial
    'creditCard', 'cvv', 'cardNumber', 'ccv', 'pin',
    'bankAccount', 'iban', 'swift', 'accountNumber',

    // PII (according to PDPL)
    'ssn', 'nationalId', 'iqama', 'passport', 'drivingLicense',

    // Additional sensitive
    'otp', 'code', 'verificationCode', 'resetCode',
    'privateKey', 'encryptionKey',
  ];

  // Query params
  if (req.query && Object.keys(req.query).length > 0) {
    const safeQuery = { ...req.query };
    sensitiveFields.forEach(field => delete safeQuery[field]);
    details.queryParams = sanitizeObject(safeQuery);
  }

  // Request body
  if (req.body && Object.keys(req.body).length > 0) {
    const safeBody = { ...req.body };

    // Remove sensitive fields
    sensitiveFields.forEach(field => delete safeBody[field]);

    // Redact PII for PDPL compliance
    const redactedBody = redactPII(safeBody);

    if (Object.keys(redactedBody).length > 0) {
      details.requestBody = sanitizeObject(redactedBody);
    }
  }

  return details;
};

// Update error logging
async function createAuditLog(req, status, error) {
  try {
    const user = req.user;

    if (!user) {
      // ✅ Use safe logger
      safeLog.warn('Audit log: No user found in request');
      return;
    }

    // ... audit log creation code ...

    await AuditLog.log(logData);

  } catch (error) {
    // ✅ Use safe logger
    safeLog.error('Failed to create audit log:', error.message);
  }
}
```

---

## STEP 6: Global Find & Replace (30 minutes)

Replace all unsafe console.log calls with safeLog:

```bash
# Navigate to backend directory
cd "traf3li-backend-for testing only different github/src"

# Find all files with console.log
grep -rl "console\." . --include="*.js"

# For each controller file:
# 1. Add import at top:
const { safeLog } = require('../middlewares/logSanitizer.middleware');

# 2. Replace patterns:
console.log(    →  safeLog.info(
console.error(  →  safeLog.error(
console.warn(   →  safeLog.warn(
console.debug(  →  safeLog.debug(
```

---

## STEP 7: Add Unit Tests (20 minutes)

Create file: `/test/logSanitizer.test.js`

```javascript
const { sanitizeForLog, sanitizeObject, redactPII } = require('../src/middlewares/logSanitizer.middleware');

describe('Log Sanitization', () => {
  describe('sanitizeForLog', () => {
    it('should remove CRLF characters', () => {
      const input = 'Test\r\n[ADMIN]\r\nFake';
      const output = sanitizeForLog(input);
      expect(output).not.toContain('\r');
      expect(output).not.toContain('\n');
      expect(output).toBe('Test [ADMIN] Fake');
    });

    it('should remove null bytes', () => {
      const input = 'Test\x00Hidden';
      const output = sanitizeForLog(input);
      expect(output).not.toContain('\x00');
    });

    it('should remove ANSI escape codes', () => {
      const input = '\x1b[31mRed\x1b[0m Text';
      const output = sanitizeForLog(input);
      expect(output).toBe('Red Text');
    });

    it('should truncate long strings', () => {
      const input = 'A'.repeat(1000);
      const output = sanitizeForLog(input);
      expect(output.length).toBeLessThanOrEqual(520); // 500 + "... [TRUNCATED]"
      expect(output).toContain('[TRUNCATED]');
    });
  });

  describe('sanitizeObject', () => {
    it('should redact password fields', () => {
      const input = { username: 'admin', password: 'secret123' };
      const output = sanitizeObject(input);
      expect(output.password).toBe('[REDACTED]');
      expect(output.username).toBe('admin');
    });

    it('should redact token fields', () => {
      const input = { data: 'test', accessToken: 'jwt-token-here' };
      const output = sanitizeObject(input);
      expect(output.accessToken).toBe('[REDACTED]');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          email: 'test@test.com',
          auth: {
            password: 'secret'
          }
        }
      };
      const output = sanitizeObject(input);
      expect(output.user.auth.password).toBe('[REDACTED]');
    });

    it('should prevent circular references', () => {
      const input = { name: 'test' };
      input.self = input; // Create circular reference
      const output = sanitizeObject(input);
      expect(output.self).toBe('[Circular Reference]');
    });

    it('should limit depth', () => {
      const deep = { l1: { l2: { l3: { l4: { l5: { l6: { l7: 'deep' } } } } } } };
      const output = sanitizeObject(deep);
      // Should stop at max depth
      expect(output.l1.l2.l3.l4.l5).toBe('[Max depth exceeded]');
    });
  });

  describe('redactPII', () => {
    it('should redact email addresses', () => {
      const input = { email: 'user@example.com', name: 'John' };
      const output = redactPII(input);
      expect(output.email).toBe('[PII_REDACTED]');
      expect(output.name).toBe('[PII_REDACTED]'); // firstName pattern
    });

    it('should redact phone numbers', () => {
      const input = { phone: '+966501234567' };
      const output = redactPII(input);
      expect(output.phone).toBe('[PII_REDACTED]');
    });

    it('should redact national IDs', () => {
      const input = { nationalId: '1234567890' };
      const output = redactPII(input);
      expect(output.nationalId).toBe('[PII_REDACTED]');
    });
  });
});

// Run tests
// npm test
```

---

## STEP 8: Environment Configuration (5 minutes)

Update `.env.example`:

```bash
# Logging Configuration
NODE_ENV=production
LOG_LEVEL=info  # Options: error, warn, info, debug

# Enable debug logging (development only)
DEBUG=false

# Log rotation
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14d
```

Update `package.json`:

```json
{
  "scripts": {
    "start": "NODE_ENV=production node src/server.js",
    "dev": "NODE_ENV=development nodemon src/server.js",
    "test": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  }
}
```

---

## STEP 9: Verification (10 minutes)

### Test 1: CRLF Injection Prevention
```bash
# Test endpoint with CRLF payload
curl -X POST http://localhost:8080/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test\r\n[ADMIN] Fake admin action\r\nReal User",
    "email": "test@example.com"
  }'

# Check logs - should NOT contain fake admin line
tail -f logs/combined.log
# Expected: "Test [ADMIN] Fake admin action Real User" (CRLF removed)
```

### Test 2: PII Redaction
```bash
# Create client with PII
curl -X POST http://localhost:8080/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Ahmed Mohammed",
    "nationalId": "1234567890",
    "phone": "+966501234567",
    "email": "ahmed@example.com"
  }'

# Check logs - should NOT contain PII
grep -E "(1234567890|501234567|ahmed@example.com)" logs/combined.log
# Expected: NO MATCHES (all PII redacted)
```

### Test 3: Sensitive Field Redaction
```bash
# Attempt to log password
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "MySecretPassword123"
  }'

# Check logs - password should be [REDACTED]
grep "password" logs/combined.log
# Expected: "password": "[REDACTED]"
```

---

## ROLLBACK PLAN

If issues arise after deployment:

```bash
# 1. Revert changes
git checkout HEAD~1 -- src/middlewares/logSanitizer.middleware.js
git checkout HEAD~1 -- src/middlewares/errorMiddleware.js
git checkout HEAD~1 -- src/controllers/client.controller.js

# 2. Restart server
pm2 restart traf3li-backend

# 3. Monitor logs
tail -f logs/error.log
```

---

## DEPLOYMENT CHECKLIST

- [ ] Create logSanitizer.middleware.js
- [ ] Update errorMiddleware.js
- [ ] Update client.controller.js
- [ ] Update server.js CORS logging
- [ ] Update auditLog.middleware.js
- [ ] Find & replace console.log → safeLog
- [ ] Add unit tests
- [ ] Update .env configuration
- [ ] Test CRLF injection prevention
- [ ] Test PII redaction
- [ ] Test sensitive field redaction
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Monitor logs for issues
- [ ] Deploy to production
- [ ] Verify no PII in logs

---

## NEXT STEPS (Week 2)

After implementing basic sanitization:

1. **Install Winston Logger**
   ```bash
   npm install winston winston-daily-rotate-file
   ```

2. **Implement Log Rotation**
   - Daily rotation
   - Compress old logs
   - Auto-delete after 14 days

3. **Add Structured Logging**
   - JSON format
   - Correlation IDs
   - Request tracing

4. **Set Up Log Monitoring**
   - Alert on suspicious patterns
   - Track log injection attempts
   - Monitor PII exposure

---

## SUPPORT

**Questions or Issues?**
- Review: `/LOG_INJECTION_SECURITY_REPORT.md`
- Test coverage: `npm test -- --coverage`
- Lint logs: `eslint src/middlewares/logSanitizer.middleware.js`

**Emergency Contacts:**
- Security Team: security@traf3li.com
- DevOps: devops@traf3li.com

---

**Implementation Priority:** CRITICAL
**Est. Total Time:** 2-4 hours
**Testing Time:** 1 hour
**Total:** 3-5 hours for complete implementation and verification

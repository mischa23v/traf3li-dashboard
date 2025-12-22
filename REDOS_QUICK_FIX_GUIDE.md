# ReDoS Quick Fix Implementation Guide

**Priority:** CRITICAL - Implement ASAP
**Estimated Time:** 4-6 hours
**Risk Level:** Application-wide Denial of Service

---

## Step 1: Install Required Dependencies (5 minutes)

```bash
cd /home/user/traf3li-dashboard/traf3li-backend-for\ testing\ only\ different\ github

npm install validator@13.11.0 safe-regex@2.1.1 express-rate-limit@7.1.5
```

---

## Step 2: Create Utility Files (15 minutes)

### File 1: `/src/utils/sanitizeRegex.js`

```javascript
/**
 * ReDoS Attack Prevention - Regex Input Sanitization
 *
 * SECURITY: This utility prevents Regular Expression Denial of Service (ReDoS)
 * attacks by escaping all regex metacharacters in user input before using
 * them in MongoDB $regex queries.
 */

/**
 * Sanitize user input for safe use in MongoDB regex queries
 *
 * @param {string} input - User-provided search string
 * @param {object} options - Configuration options
 * @param {number} options.maxLength - Maximum allowed input length (default: 100)
 * @param {boolean} options.allowWildcards - Allow * and ? wildcards (default: false)
 * @returns {string} - Sanitized string safe for regex use
 * @throws {Error} - If input exceeds maxLength
 */
const sanitizeRegexInput = (input, options = {}) => {
    const {
        maxLength = 100,
        allowWildcards = false
    } = options;

    // Validate input type
    if (!input || typeof input !== 'string') {
        return '';
    }

    // Trim whitespace
    const trimmed = input.trim();

    // Enforce length limit to prevent resource exhaustion
    if (trimmed.length > maxLength) {
        throw new Error(`Search input exceeds maximum length of ${maxLength} characters`);
    }

    // Escape all regex metacharacters
    // This prevents patterns like (a+)+b from causing catastrophic backtracking
    let sanitized = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Optionally convert wildcards to regex equivalents
    if (allowWildcards) {
        sanitized = sanitized
            .replace(/\\\*/g, '.*')  // * becomes .*
            .replace(/\\\?/g, '.');   // ? becomes .
    }

    return sanitized;
};

/**
 * Validate that input is safe before using in regex
 * Use for extra paranoid security checks
 */
const validateSafeInput = (input) => {
    if (!input || typeof input !== 'string') {
        return false;
    }

    // Reject inputs with excessive repeated characters
    // Pattern like "aaaaaa..." could still cause issues
    if (/(.)\1{50,}/.test(input)) {
        return false;
    }

    // Reject inputs with too many special characters
    const specialCharCount = (input.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialCharCount > input.length * 0.5) {
        return false;
    }

    return true;
};

module.exports = {
    sanitizeRegexInput,
    validateSafeInput
};
```

### File 2: `/src/middlewares/searchRateLimit.js`

```javascript
/**
 * Rate Limiting for Search Endpoints
 *
 * SECURITY: Limits the number of search requests per user to prevent
 * ReDoS attacks from overwhelming the server
 */

const rateLimit = require('express-rate-limit');

// Search endpoint rate limiter
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 20, // 20 requests per minute per IP
    message: {
        success: false,
        error: 'تم تجاوز الحد الأقصى للبحث. يرجى المحاولة بعد دقيقة.',
        error_en: 'Search rate limit exceeded. Please try again in a minute.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers

    // Custom key generator - rate limit per user ID if authenticated
    keyGenerator: (req) => {
        return req.userID || req.ip; // Use user ID if available, otherwise IP
    },

    // Skip rate limiting for localhost in development
    skip: (req) => {
        return process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1';
    },

    // Custom handler for rate limit exceeded
    handler: (req, res) => {
        console.warn('⚠️  RATE LIMIT EXCEEDED:', {
            userId: req.userID,
            ip: req.ip,
            endpoint: req.originalUrl,
            timestamp: new Date().toISOString()
        });

        res.status(429).json({
            success: false,
            error: 'تم تجاوز الحد الأقصى للبحث. يرجى المحاولة بعد دقيقة.',
            error_en: 'Search rate limit exceeded. Please try again in a minute.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: 60 // seconds
        });
    }
});

// Stricter limiter for public endpoints (no auth required)
const publicSearchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10, // Only 10 requests per minute for public
    message: {
        success: false,
        error: 'تم تجاوز الحد الأقصى للبحث. يرجى المحاولة بعد دقيقة.',
        error_en: 'Search rate limit exceeded. Please try again in a minute.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip
});

module.exports = {
    searchLimiter,
    publicSearchLimiter
};
```

---

## Step 3: Fix Critical Controllers (90 minutes)

### Fix 1: `/src/controllers/client.controller.js`

**BEFORE (VULNERABLE):**
```javascript
// Search by name, email, phone, or client ID
if (search) {
    query.$or = [
        { fullName: { $regex: search, $options: 'i' } },      // ❌ VULNERABLE
        { email: { $regex: search, $options: 'i' } },         // ❌ VULNERABLE
        { phone: { $regex: search, $options: 'i' } },         // ❌ VULNERABLE
        { clientId: { $regex: search, $options: 'i' } },      // ❌ VULNERABLE
        { companyName: { $regex: search, $options: 'i' } }    // ❌ VULNERABLE
    ];
}
```

**AFTER (FIXED):**
```javascript
// Add at top of file
const { sanitizeRegexInput } = require('../utils/sanitizeRegex');

// In getClients function:
if (search) {
    try {
        const sanitizedSearch = sanitizeRegexInput(search, { maxLength: 100 }); // ✅ SAFE
        query.$or = [
            { fullName: { $regex: sanitizedSearch, $options: 'i' } },
            { email: { $regex: sanitizedSearch, $options: 'i' } },
            { phone: { $regex: sanitizedSearch, $options: 'i' } },
            { clientId: { $regex: sanitizedSearch, $options: 'i' } },
            { companyName: { $regex: sanitizedSearch, $options: 'i' } }
        ];
    } catch (error) {
        // Input too long, return error
        throw new CustomException('مصطلح البحث طويل جداً. الحد الأقصى 100 حرف.', 400);
    }
}
```

### Fix 2: `/src/controllers/user.controller.js`

**BEFORE (VULNERABLE):**
```javascript
// Search by name or description
if (search) {
    filter.$or = [
        { username: { $regex: search, $options: 'i' } },      // ❌ VULNERABLE
        { description: { $regex: search, $options: 'i' } }    // ❌ VULNERABLE
    ];
}
```

**AFTER (FIXED):**
```javascript
// Add at top of file
const { sanitizeRegexInput } = require('../utils/sanitizeRegex');

// In getLawyers function:
if (search) {
    try {
        const sanitizedSearch = sanitizeRegexInput(search, { maxLength: 100 }); // ✅ SAFE
        filter.$or = [
            { username: { $regex: sanitizedSearch, $options: 'i' } },
            { description: { $regex: sanitizedSearch, $options: 'i' } }
        ];
    } catch (error) {
        throw new CustomException('Search input too long. Maximum 100 characters.', 400);
    }
}
```

### Fix 3: `/src/controllers/transaction.controller.js`

**BEFORE (VULNERABLE):**
```javascript
// Search
if (search) {
    query.$or = [
        { description: { $regex: search, $options: 'i' } },     // ❌ VULNERABLE
        { transactionId: { $regex: search, $options: 'i' } },   // ❌ VULNERABLE
        { referenceNumber: { $regex: search, $options: 'i' } }, // ❌ VULNERABLE
        { notes: { $regex: search, $options: 'i' } }            // ❌ VULNERABLE
    ];
}
```

**AFTER (FIXED):**
```javascript
// Add at top of file
const { sanitizeRegexInput } = require('../utils/sanitizeRegex');

// In getTransactions function:
if (search) {
    try {
        const sanitizedSearch = sanitizeRegexInput(search, { maxLength: 100 }); // ✅ SAFE
        query.$or = [
            { description: { $regex: sanitizedSearch, $options: 'i' } },
            { transactionId: { $regex: sanitizedSearch, $options: 'i' } },
            { referenceNumber: { $regex: sanitizedSearch, $options: 'i' } },
            { notes: { $regex: sanitizedSearch, $options: 'i' } }
        ];
    } catch (error) {
        throw new CustomException('مصطلح البحث طويل جداً', 400);
    }
}
```

### Fix 4: `/src/controllers/gig.controller.js`

**BEFORE (VULNERABLE):**
```javascript
const filters = {
    ...(userID && { userID }),
    ...(category && { category: { $regex: category, $options: 'i' } }),  // ❌ VULNERABLE
    ...(search && { title: { $regex: search, $options: 'i' } }),         // ❌ VULNERABLE
    ...((min || max) && {
        price: {
            ...(max && { $lte: max }),
            ...(min && { $gte: min }),
        },
    })
}
```

**AFTER (FIXED):**
```javascript
// Add at top of file
const { sanitizeRegexInput } = require('../utils/sanitizeRegex');

// In getGigs function:
const filters = {
    ...(userID && { userID }),
    ...(category && {
        category: {
            $regex: sanitizeRegexInput(category, { maxLength: 50 }),  // ✅ SAFE
            $options: 'i'
        }
    }),
    ...(search && {
        title: {
            $regex: sanitizeRegexInput(search, { maxLength: 100 }),   // ✅ SAFE
            $options: 'i'
        }
    }),
    ...((min || max) && {
        price: {
            ...(max && { $lte: max }),
            ...(min && { $gte: min }),
        },
    })
}
```

### Fix 5: `/src/controllers/benefit.controller.js`

**BEFORE (VULNERABLE):**
```javascript
if (search) {
    filters.$or = [
        { benefitName: { $regex: search, $options: 'i' } },           // ❌ VULNERABLE
        { benefitNameAr: { $regex: search, $options: 'i' } },         // ❌ VULNERABLE
        { employeeName: { $regex: search, $options: 'i' } },          // ❌ VULNERABLE
        { employeeNameAr: { $regex: search, $options: 'i' } },        // ❌ VULNERABLE
        { enrollmentNumber: { $regex: search, $options: 'i' } },      // ❌ VULNERABLE
        { benefitEnrollmentId: { $regex: search, $options: 'i' } }    // ❌ VULNERABLE
    ];
}

if (providerName) filters.providerName = { $regex: providerName, $options: 'i' };  // ❌ VULNERABLE
```

**AFTER (FIXED):**
```javascript
// Add at top of file
const { sanitizeRegexInput } = require('../utils/sanitizeRegex');

// In getBenefits function:
if (search) {
    try {
        const sanitizedSearch = sanitizeRegexInput(search, { maxLength: 100 }); // ✅ SAFE
        filters.$or = [
            { benefitName: { $regex: sanitizedSearch, $options: 'i' } },
            { benefitNameAr: { $regex: sanitizedSearch, $options: 'i' } },
            { employeeName: { $regex: sanitizedSearch, $options: 'i' } },
            { employeeNameAr: { $regex: sanitizedSearch, $options: 'i' } },
            { enrollmentNumber: { $regex: sanitizedSearch, $options: 'i' } },
            { benefitEnrollmentId: { $regex: sanitizedSearch, $options: 'i' } }
        ];
    } catch (error) {
        throw CustomException('مصطلح البحث طويل جداً', 400);
    }
}

if (providerName) {
    filters.providerName = {
        $regex: sanitizeRegexInput(providerName, { maxLength: 50 }),  // ✅ SAFE
        $options: 'i'
    };
}
```

---

## Step 4: Fix Email Validation (15 minutes)

### `/src/utils/saudi-validators.js`

**BEFORE (VULNERABLE):**
```javascript
const validateEmail = (email) => {
    if (!email) return true; // Optional field
    const cleaned = String(email).trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);  // ❌ VULNERABLE to ReDoS
};
```

**AFTER (FIXED):**
```javascript
// Add at top of file
const validator = require('validator');

const validateEmail = (email) => {
    if (!email) return true; // Optional field
    const cleaned = String(email).trim().toLowerCase();

    // ✅ SAFE - Using battle-tested validator library
    return validator.isEmail(cleaned, {
        allow_utf8_local_part: false,
        require_tld: true,
        allow_ip_domain: false,
        blacklisted_chars: ''
    });
};
```

---

## Step 5: Add Rate Limiting to Routes (30 minutes)

### Update `/src/routes/client.route.js`

```javascript
const { searchLimiter } = require('../middlewares/searchRateLimit');

// Apply rate limiter to search endpoints
router.get('/clients', authenticate, searchLimiter, getClients);           // ✅ Protected
router.get('/clients/search', authenticate, searchLimiter, searchClients); // ✅ Protected
```

### Update `/src/routes/user.route.js`

```javascript
const { publicSearchLimiter } = require('../middlewares/searchRateLimit');

// Public endpoint needs stricter limiting
router.get('/lawyers', publicSearchLimiter, getLawyers);  // ✅ Protected
```

### Update `/src/routes/transaction.route.js`

```javascript
const { searchLimiter } = require('../middlewares/searchRateLimit');

router.get('/transactions', authenticate, searchLimiter, getTransactions);  // ✅ Protected
```

### Update `/src/routes/gig.route.js`

```javascript
const { publicSearchLimiter } = require('../middlewares/searchRateLimit');

router.get('/gigs', publicSearchLimiter, getGigs);  // ✅ Protected
```

### Update `/src/routes/benefit.route.js`

```javascript
const { searchLimiter } = require('../middlewares/searchRateLimit');

router.get('/benefits', authenticate, searchLimiter, getBenefits);  // ✅ Protected
```

---

## Step 6: Testing (60 minutes)

### Test 1: Verify Sanitization Works

```javascript
// File: test-sanitization.js
const { sanitizeRegexInput } = require('./src/utils/sanitizeRegex');

const testCases = [
    // [input, expected]
    ['normal search', 'normal search'],
    ['(a+)+b', '\\(a\\+\\)\\+b'],
    ['test@email.com', 'test@email\\.com'],
    ['.*evil.*', '\\.\\*evil\\.\\*'],
    ['a'.repeat(101), 'ERROR'], // Should throw
];

testCases.forEach(([input, expected], index) => {
    try {
        const result = sanitizeRegexInput(input);
        if (result === expected) {
            console.log(`✅ Test ${index + 1} passed`);
        } else {
            console.log(`❌ Test ${index + 1} failed:`, { input, expected, result });
        }
    } catch (error) {
        if (expected === 'ERROR') {
            console.log(`✅ Test ${index + 1} passed (threw error as expected)`);
        } else {
            console.log(`❌ Test ${index + 1} failed with error:`, error.message);
        }
    }
});
```

Run test:
```bash
node test-sanitization.js
```

### Test 2: Verify Endpoints Work Correctly

```bash
# Test client search (should work)
curl "http://localhost:3000/api/clients?search=john" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test malicious pattern (should be escaped)
curl "http://localhost:3000/api/clients?search=(a%2B)%2Bb" \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return quickly with no results (pattern is escaped)

# Test rate limiting
for i in {1..25}; do
  curl "http://localhost:3000/api/clients?search=test" \
    -H "Authorization: Bearer YOUR_TOKEN"
  echo " - Request $i"
done
# Should get rate limited after 20 requests
```

### Test 3: Load Testing

```bash
# Install Apache Bench (if not installed)
# Ubuntu: sudo apt-get install apache2-utils
# Mac: brew install ab

# Test normal load (should handle easily)
ab -n 100 -c 10 "http://localhost:3000/api/clients?search=test"

# Test with authentication
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
   "http://localhost:3000/api/clients?search=test"
```

---

## Step 7: Monitoring & Alerts (30 minutes)

### Add Logging Middleware

```javascript
// File: /src/middlewares/searchMonitor.js
const searchMonitor = (req, res, next) => {
    const { search, q } = req.query;
    const searchTerm = search || q;

    if (searchTerm) {
        // Log suspicious searches
        if (searchTerm.length > 50) {
            console.warn('⚠️  LONG SEARCH QUERY:', {
                userId: req.userID,
                ip: req.ip,
                endpoint: req.originalUrl,
                searchLength: searchTerm.length,
                timestamp: new Date().toISOString()
            });
        }

        // Check for regex metacharacters (before sanitization)
        const regexChars = (searchTerm.match(/[.*+?^${}()|[\]\\]/g) || []).length;
        if (regexChars > 5) {
            console.warn('⚠️  SUSPICIOUS SEARCH PATTERN:', {
                userId: req.userID,
                ip: req.ip,
                endpoint: req.originalUrl,
                regexCharCount: regexChars,
                timestamp: new Date().toISOString()
            });
        }
    }

    next();
};

module.exports = searchMonitor;
```

Apply to routes:
```javascript
const searchMonitor = require('../middlewares/searchMonitor');

router.get('/clients', authenticate, searchMonitor, searchLimiter, getClients);
```

---

## Verification Checklist

### Before Deployment

- [ ] All dependencies installed (`validator`, `safe-regex`, `express-rate-limit`)
- [ ] `sanitizeRegex.js` utility created
- [ ] `searchRateLimit.js` middleware created
- [ ] All 5 critical controllers updated (client, user, transaction, gig, benefit)
- [ ] Email validation updated to use `validator.isEmail()`
- [ ] Rate limiting applied to all search endpoints
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Load tests show no ReDoS vulnerability
- [ ] Monitoring and logging in place

### After Deployment

- [ ] Monitor CPU usage (should stay < 50% under normal load)
- [ ] Check error logs for rate limit triggers
- [ ] Verify no legitimate searches are blocked
- [ ] Test from production environment
- [ ] Create incident response plan for future attacks

---

## Rollback Plan

If issues occur after deployment:

1. **Immediate Rollback:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Temporary Fix:**
   - Disable rate limiting temporarily
   - Keep sanitization enabled (safer)

3. **Emergency Contact:**
   - Backend team lead
   - Security team
   - DevOps for server issues

---

## Success Metrics

After implementation:
- ✅ No CPU spikes above 80% from search requests
- ✅ Average search response time < 200ms
- ✅ Rate limit triggers < 10 per hour
- ✅ Zero ReDoS attack vulnerabilities in security scans
- ✅ All legitimate user searches work correctly

---

## Additional Resources

- Full report: `REDOS_SECURITY_SCAN_REPORT.md`
- Findings JSON: `redos-findings.json`
- OWASP ReDoS Guide: https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS

---

**IMPORTANT:** Test thoroughly in development/staging before deploying to production!

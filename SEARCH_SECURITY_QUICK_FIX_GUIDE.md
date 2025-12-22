# Search Security Quick Fix Guide

**URGENT**: Follow this guide to fix CRITICAL search vulnerabilities in the next 24-48 hours.

---

## Quick Fix Checklist

- [ ] **Step 1**: Create utility functions (15 minutes)
- [ ] **Step 2**: Fix client.controller.js (20 minutes)
- [ ] **Step 3**: Fix transaction.controller.js (15 minutes)
- [ ] **Step 4**: Fix user.controller.js (15 minutes)
- [ ] **Step 5**: Fix gig.controller.js (10 minutes)
- [ ] **Step 6**: Fix benefit.controller.js (15 minutes)
- [ ] **Step 7**: Fix firm.controller.js (10 minutes)
- [ ] **Step 8**: Fix question.controller.js (10 minutes)
- [ ] **Step 9**: Fix legalDocument.controller.js (10 minutes)
- [ ] **Step 10**: Fix client.model.js (10 minutes)
- [ ] **Step 11**: Apply rate limiting to routes (20 minutes)
- [ ] **Step 12**: Test all changes (30 minutes)

**Total Time**: ~3 hours

---

## Step 1: Create Utility Functions (15 min)

Create: `/src/utils/searchValidation.js`

```javascript
/**
 * Search validation and sanitization utilities
 */

/**
 * Escape regex special characters to prevent ReDoS attacks
 * @param {string} str - Input string
 * @returns {string} - Escaped string
 */
const escapeRegex = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validate search query
 * @param {string} query - Search query
 * @param {number} minLength - Minimum length (default: 2)
 * @param {number} maxLength - Maximum length (default: 100)
 * @returns {string|null} - Validated query or null if invalid
 */
const validateSearchQuery = (query, minLength = 2, maxLength = 100) => {
    // Check type
    if (!query || typeof query !== 'string') {
        return null;
    }

    // Trim and check length
    const trimmed = query.trim();
    if (trimmed.length < minLength || trimmed.length > maxLength) {
        return null;
    }

    return trimmed;
};

/**
 * Sanitize text search query (for MongoDB $text)
 * Removes operators that could manipulate search logic
 * @param {string} query - Search query
 * @returns {string} - Sanitized query
 */
const sanitizeTextSearch = (query) => {
    if (!query || typeof query !== 'string') return '';

    return query
        .replace(/["\-]/g, '') // Remove quotes and minus (MongoDB operators)
        .trim()
        .split(/\s+/)        // Split into words
        .slice(0, 10)        // Limit to 10 words
        .join(' ');
};

/**
 * Build safe regex search query for MongoDB
 * @param {string} search - Raw search query
 * @param {Array<string>} fields - Fields to search
 * @returns {Object|null} - MongoDB $or query or null
 */
const buildSafeRegexQuery = (search, fields) => {
    const validated = validateSearchQuery(search);
    if (!validated) return null;

    const escaped = escapeRegex(validated);

    return {
        $or: fields.map(field => ({
            [field]: { $regex: escaped, $options: 'i' }
        }))
    };
};

/**
 * Build safe text search query for MongoDB
 * @param {string} search - Raw search query
 * @returns {Object|null} - MongoDB $text query or null
 */
const buildSafeTextQuery = (search) => {
    const validated = validateSearchQuery(search);
    if (!validated) return null;

    const sanitized = sanitizeTextSearch(validated);
    if (sanitized.length < 2) return null;

    return { $text: { $search: sanitized } };
};

module.exports = {
    escapeRegex,
    validateSearchQuery,
    sanitizeTextSearch,
    buildSafeRegexQuery,
    buildSafeTextQuery
};
```

---

## Step 2: Fix client.controller.js (20 min)

### Location 1: Lines 143-150 (getClients function)

**BEFORE** (❌ VULNERABLE):
```javascript
// Search by name, email, phone, or client ID
if (search) {
    query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
    ];
}
```

**AFTER** (✅ SECURE):
```javascript
// Import at top of file
const { buildSafeRegexQuery } = require('../utils/searchValidation');

// Replace search logic
const searchQuery = buildSafeRegexQuery(search, [
    'fullName',
    'email',
    'phone',
    'clientId',
    'companyName'
]);

if (searchQuery) {
    Object.assign(query, searchQuery);
}
```

### Location 2: Lines 353 (searchClients function)

**BEFORE** (❌ VULNERABLE):
```javascript
const searchClients = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const lawyerId = req.userID;

    if (!q || q.length < 2) {
        throw new CustomException('يجب أن يكون مصطلح البحث حرفين على الأقل', 400);
    }

    const clients = await Client.searchClients(lawyerId, q);
    // ...
});
```

**AFTER** (✅ SECURE):
```javascript
const { validateSearchQuery } = require('../utils/searchValidation');

const searchClients = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const lawyerId = req.userID;

    const validatedQuery = validateSearchQuery(q);
    if (!validatedQuery) {
        throw new CustomException('يجب أن يكون مصطلح البحث بين 2 و 100 حرف', 400);
    }

    const clients = await Client.searchClients(lawyerId, validatedQuery);
    // ...
});
```

---

## Step 3: Fix transaction.controller.js (15 min)

### Location: Lines 120-126 (getTransactions function)

**BEFORE** (❌ VULNERABLE):
```javascript
// Search
if (search) {
    query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
    ];
}
```

**AFTER** (✅ SECURE):
```javascript
// Import at top of file
const { buildSafeRegexQuery } = require('../utils/searchValidation');

// Replace search logic
const searchQuery = buildSafeRegexQuery(search, [
    'description',
    'transactionId',
    'referenceNumber',
    'notes'
]);

if (searchQuery) {
    Object.assign(query, searchQuery);
}
```

---

## Step 4: Fix user.controller.js (15 min)

### Location: Lines 133-137 (getLawyers function)

**BEFORE** (❌ VULNERABLE):
```javascript
// Search by name or description
if (search) {
    filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
    ];
}
```

**AFTER** (✅ SECURE):
```javascript
// Import at top of file
const { buildSafeRegexQuery } = require('../utils/searchValidation');

// Replace search logic
const searchQuery = buildSafeRegexQuery(search, [
    'username',
    'description'
]);

if (searchQuery) {
    Object.assign(filter, searchQuery);
}
```

---

## Step 5: Fix gig.controller.js (10 min)

### Location: Lines 68-73 (getGigs function)

**BEFORE** (❌ VULNERABLE):
```javascript
const filters = {
    ...(userID && { userID }),
    ...(category && { category: { $regex: category, $options: 'i' } }),
    ...(search && { title: { $regex: search, $options: 'i' } }),
    ...((min || max) && {
        price: {
            ...(max && { $lte: max }),
            ...(min && { $gte: min }),
        },
    })
}
```

**AFTER** (✅ SECURE):
```javascript
// Import at top of file
const { escapeRegex, validateSearchQuery } = require('../utils/searchValidation');

const filters = {
    ...(userID && { userID }),
    ...((min || max) && {
        price: {
            ...(max && { $lte: max }),
            ...(min && { $gte: min }),
        },
    })
};

// Safe category filter
if (category) {
    const validatedCategory = validateSearchQuery(category);
    if (validatedCategory) {
        filters.category = { $regex: escapeRegex(validatedCategory), $options: 'i' };
    }
}

// Safe search filter
if (search) {
    const validatedSearch = validateSearchQuery(search);
    if (validatedSearch) {
        filters.title = { $regex: escapeRegex(validatedSearch), $options: 'i' };
    }
}
```

---

## Step 6: Fix benefit.controller.js (15 min)

### Location: Lines 165-173 (getBenefits function)

**BEFORE** (❌ VULNERABLE):
```javascript
if (search) {
    filters.$or = [
        { benefitName: { $regex: search, $options: 'i' } },
        { benefitNameAr: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeNameAr: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } },
        { benefitEnrollmentId: { $regex: search, $options: 'i' } }
    ];
}
```

**AFTER** (✅ SECURE):
```javascript
// Import at top of file
const { buildSafeRegexQuery } = require('../utils/searchValidation');

// Replace search logic
const searchQuery = buildSafeRegexQuery(search, [
    'benefitName',
    'benefitNameAr',
    'employeeName',
    'employeeNameAr',
    'enrollmentNumber',
    'benefitEnrollmentId'
]);

if (searchQuery) {
    Object.assign(filters, searchQuery);
}
```

---

## Step 7: Fix firm.controller.js (10 min)

### Location: Lines 37-43 (getFirms function)

**BEFORE** (❌ VULNERABLE):
```javascript
const filters = {
    ...(search && { $text: { $search: search } }),
    ...(city && { city: { $regex: city, $options: 'i' } }),
    ...(practiceArea && { practiceAreas: practiceArea })
};
```

**AFTER** (✅ SECURE):
```javascript
// Import at top of file
const { buildSafeTextQuery, escapeRegex, validateSearchQuery } = require('../utils/searchValidation');

const filters = {
    ...(practiceArea && { practiceAreas: practiceArea })
};

// Safe text search
if (search) {
    const textQuery = buildSafeTextQuery(search);
    if (textQuery) {
        Object.assign(filters, textQuery);
    }
}

// Safe city filter
if (city) {
    const validatedCity = validateSearchQuery(city);
    if (validatedCity) {
        filters.city = { $regex: escapeRegex(validatedCity), $options: 'i' };
    }
}
```

---

## Step 8: Fix question.controller.js (10 min)

### Location: Lines 32-39 (getQuestions function)

**BEFORE** (❌ VULNERABLE):
```javascript
const filters = {
    ...(search && { $text: { $search: search } }),
    ...(category && { category }),
    ...(status && { status })
};
```

**AFTER** (✅ SECURE):
```javascript
// Import at top of file
const { buildSafeTextQuery } = require('../utils/searchValidation');

const filters = {
    ...(category && { category }),
    ...(status && { status })
};

// Safe text search
if (search) {
    const textQuery = buildSafeTextQuery(search);
    if (textQuery) {
        Object.assign(filters, textQuery);
    }
}
```

---

## Step 9: Fix legalDocument.controller.js (10 min)

### Location: Lines 43-53 (getDocuments function)

**BEFORE** (❌ VULNERABLE):
```javascript
const filters = {
    ...(search && { $text: { $search: search } }),
    ...(category && { category }),
    ...(type && { type }),
    ...(accessLevel && { accessLevel })
};
```

**AFTER** (✅ SECURE):
```javascript
// Import at top of file
const { buildSafeTextQuery } = require('../utils/searchValidation');

const filters = {
    ...(category && { category }),
    ...(type && { type }),
    ...(accessLevel && { accessLevel })
};

// Safe text search
if (search) {
    const textQuery = buildSafeTextQuery(search);
    if (textQuery) {
        Object.assign(filters, textQuery);
    }
}
```

---

## Step 10: Fix client.model.js (10 min)

### Location: Lines 119-140 (searchClients static method)

**BEFORE** (❌ VULNERABLE):
```javascript
clientSchema.statics.searchClients = async function(lawyerId, searchTerm, filters = {}) {
    const query = {
        lawyerId: new mongoose.Types.ObjectId(lawyerId),
        status: { $ne: 'archived' }
    };

    if (searchTerm) {
        query.$or = [
            { name: { $regex: searchTerm, $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
            { phone: { $regex: searchTerm, $options: 'i' } },
            { clientId: { $regex: searchTerm, $options: 'i' } }
        ];
    }
    // ...
};
```

**AFTER** (✅ SECURE):
```javascript
// Import at top of model file
const { escapeRegex } = require('../utils/searchValidation');

clientSchema.statics.searchClients = async function(lawyerId, searchTerm, filters = {}) {
    const query = {
        lawyerId: new mongoose.Types.ObjectId(lawyerId),
        status: { $ne: 'archived' }
    };

    if (searchTerm && typeof searchTerm === 'string' && searchTerm.length >= 2) {
        const escaped = escapeRegex(searchTerm.trim());
        query.$or = [
            { name: { $regex: escaped, $options: 'i' } },
            { email: { $regex: escaped, $options: 'i' } },
            { phone: { $regex: escaped, $options: 'i' } },
            { clientId: { $regex: escaped, $options: 'i' } }
        ];
    }
    // ...
};
```

### Also fix: Lines 101 (remove email from text index)

**BEFORE** (⚠️ PRIVACY ISSUE):
```javascript
clientSchema.index({ name: 'text', email: 'text' });
```

**AFTER** (✅ SECURE):
```javascript
// Text index for name only
clientSchema.index({ name: 'text' });

// Separate index for email lookups
clientSchema.index({ email: 1 });
```

**NOTE**: After changing indexes, run in MongoDB:
```javascript
db.clients.dropIndex("name_text_email_text");
```

---

## Step 11: Apply Rate Limiting (20 min)

### Fix client.route.js

**BEFORE** (❌ NO RATE LIMITING):
```javascript
const express = require('express');
const { userMiddleware } = require('../middlewares');
const { /* ... */ } = require('../controllers/client.controller');

const app = express.Router();

app.get('/search', userMiddleware, searchClients);
app.get('/', userMiddleware, getClients);
```

**AFTER** (✅ WITH RATE LIMITING):
```javascript
const express = require('express');
const { userMiddleware } = require('../middlewares');
const { searchRateLimiter } = require('../middlewares/rateLimiter.middleware');
const { /* ... */ } = require('../controllers/client.controller');

const app = express.Router();

// Apply rate limiting to search endpoints
app.get('/search', searchRateLimiter, userMiddleware, searchClients);
app.get('/', searchRateLimiter, userMiddleware, getClients);
```

### Fix user.route.js

**BEFORE** (❌ NO RATE LIMITING):
```javascript
app.get('/lawyers', getLawyers);
```

**AFTER** (✅ WITH RATE LIMITING):
```javascript
const { publicRateLimiter } = require('../middlewares/rateLimiter.middleware');

// Public endpoint needs rate limiting
app.get('/lawyers', publicRateLimiter, getLawyers);
```

### Fix gig.route.js

**BEFORE** (❌ NO RATE LIMITING):
```javascript
app.get('/', getGigs);
```

**AFTER** (✅ WITH RATE LIMITING):
```javascript
const { publicRateLimiter } = require('../middlewares/rateLimiter.middleware');

app.get('/', publicRateLimiter, getGigs);
```

### Apply to other routes

Add rate limiting to these routes:
- `transaction.route.js` - use `searchRateLimiter`
- `benefit.route.js` - use `searchRateLimiter`
- `question.route.js` - use `publicRateLimiter` for getQuestions
- `firm.route.js` - use `publicRateLimiter` for getFirms
- `legalDocument.route.js` - use `publicRateLimiter` for getDocuments

---

## Step 12: Testing (30 min)

### Test 1: Verify regex escaping works

```bash
# Should NOT cause ReDoS
curl -X GET "http://localhost:3000/api/clients?search=(a%2B)%2B%24"
# Should return error or empty results, NOT crash server

# Should NOT return all records
curl -X GET "http://localhost:3000/api/clients?search=.*"
# Should return limited results or empty
```

### Test 2: Verify rate limiting works

```bash
# Run 40 requests in quick succession
for i in {1..40}; do
  curl -X GET "http://localhost:3000/api/users/lawyers?search=test" &
done

# After 30 requests, should get 429 (Too Many Requests)
```

### Test 3: Verify validation works

```bash
# Query too short (< 2 characters)
curl -X GET "http://localhost:3000/api/clients?search=a"
# Should return validation error

# Query too long (> 100 characters)
curl -X GET "http://localhost:3000/api/clients?search=$(python3 -c 'print("a"*101)')"
# Should return validation error
```

### Test 4: Verify normal search still works

```bash
# Normal search should work fine
curl -X GET "http://localhost:3000/api/clients?search=john"
# Should return results

curl -X GET "http://localhost:3000/api/users/lawyers?search=lawyer"
# Should return results
```

### Test 5: Run automated tests

```bash
npm test
# All existing tests should pass
```

---

## Verification Checklist

After all fixes:

- [ ] No ReDoS vulnerability: Patterns like `(a+)+$` don't crash server
- [ ] No data leak: Pattern `.*` doesn't return all records
- [ ] Rate limiting active: 40 rapid requests result in 429 error
- [ ] Validation works: Queries < 2 or > 100 chars are rejected
- [ ] Normal searches work: Regular queries return expected results
- [ ] All tests pass: `npm test` succeeds
- [ ] No regressions: Existing functionality unchanged
- [ ] Performance OK: Search response times < 500ms

---

## Emergency Rollback

If something breaks:

```bash
# Revert changes
git checkout HEAD -- src/controllers/client.controller.js
git checkout HEAD -- src/controllers/transaction.controller.js
# ... etc for all modified files

# Restart server
pm2 restart all
# or
npm restart
```

---

## Post-Fix Actions

After deploying fixes:

1. **Monitor Logs**
   ```bash
   tail -f logs/app.log | grep "search"
   ```

2. **Check Error Rates**
   - Watch for increased 400/429 errors (expected)
   - Watch for 500 errors (investigate if any)

3. **Performance Monitoring**
   - Search response times should be similar or better
   - CPU usage should be lower (no ReDoS attacks)

4. **Security Monitoring**
   - Watch for unusual search patterns
   - Alert on rate limit triggers from single IP/user

---

## Common Issues & Solutions

### Issue 1: "escapeRegex is not defined"

**Solution**: Import the utility function
```javascript
const { escapeRegex } = require('../utils/searchValidation');
```

### Issue 2: "Cannot find module '../utils/searchValidation'"

**Solution**: Ensure you created the file in Step 1
```bash
ls -la src/utils/searchValidation.js
```

### Issue 3: Rate limiting not working

**Solution**: Check if rate limiter middleware is imported
```javascript
const { searchRateLimiter } = require('../middlewares/rateLimiter.middleware');
```

### Issue 4: All searches returning empty results

**Solution**: Check if validation is too strict
```javascript
// Debug: Log validated query
console.log('Validated query:', validatedQuery);
```

### Issue 5: Text index error after removing email

**Solution**: Drop old index in MongoDB
```javascript
use your_database_name;
db.clients.getIndexes(); // See all indexes
db.clients.dropIndex("name_text_email_text");
```

---

## Need Help?

If you encounter issues:

1. Check the full audit report: `SEARCH_SECURITY_AUDIT_REPORT.md`
2. Review findings JSON: `SEARCH_SECURITY_FINDINGS.json`
3. Check console for error messages
4. Verify imports are correct
5. Test one controller at a time
6. Use git to track changes: `git diff`

---

## Success Criteria

You've successfully fixed all vulnerabilities when:

✅ ReDoS attacks fail (server doesn't crash)
✅ Rate limiting blocks excessive requests
✅ Input validation rejects invalid queries
✅ Normal searches work as expected
✅ All tests pass
✅ No performance degradation
✅ Logs show sanitized queries

**Good luck! These fixes are critical for production security.**

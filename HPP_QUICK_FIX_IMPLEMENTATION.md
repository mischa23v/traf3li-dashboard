# HTTP Parameter Pollution (HPP) - Quick Fix Implementation Guide

**Severity:** 🔴 HIGH
**Estimated Time:** 2-4 hours for immediate fixes
**Impact:** Protects against filter bypass, unauthorized data access, and MongoDB injection

---

## Step 1: Install HPP Protection Package (5 minutes)

```bash
cd /home/user/traf3li-dashboard/traf3li-backend-for\ testing\ only\ different\ github

# Install HPP middleware
npm install hpp --save

# Verify installation
npm list hpp
```

---

## Step 2: Create Validation Middleware (10 minutes)

Create new file: `/src/middlewares/validateQuery.middleware.js`

```javascript
const CustomException = require('../utils/CustomException');

/**
 * Sanitize query parameters - take first value if array
 */
const sanitizeQuery = (req, res, next) => {
    try {
        // Convert arrays to single values (take first)
        for (const [key, value] of Object.entries(req.query)) {
            if (Array.isArray(value)) {
                console.warn(`HPP Attempt: ${key} is array, taking first value`, {
                    ip: req.ip,
                    endpoint: req.originalUrl
                });
                req.query[key] = value[0];
            }
        }

        // Validate pagination
        if (req.query.page) {
            const page = parseInt(req.query.page);
            if (isNaN(page) || page < 1) {
                throw new CustomException('Invalid page parameter', 400);
            }
            req.query.page = page;
        }

        if (req.query.limit) {
            const limit = parseInt(req.query.limit);
            if (isNaN(limit) || limit < 1 || limit > 1000) {
                throw new CustomException('Invalid limit parameter (1-1000)', 400);
            }
            req.query.limit = limit;
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Validate specific parameter types
 */
const validateParamTypes = (schema) => {
    return (req, res, next) => {
        try {
            for (const [param, rules] of Object.entries(schema)) {
                const value = req.query[param];

                if (!value && !rules.required) continue;

                if (!value && rules.required) {
                    throw new CustomException(`${param} is required`, 400);
                }

                // Type validation
                switch (rules.type) {
                    case 'number':
                        const num = Number(value);
                        if (isNaN(num)) {
                            throw new CustomException(`${param} must be a number`, 400);
                        }
                        req.query[param] = num;
                        break;

                    case 'boolean':
                        if (value !== 'true' && value !== 'false') {
                            throw new CustomException(`${param} must be true or false`, 400);
                        }
                        req.query[param] = value === 'true';
                        break;

                    case 'enum':
                        if (!rules.values.includes(value)) {
                            throw new CustomException(
                                `${param} must be one of: ${rules.values.join(', ')}`,
                                400
                            );
                        }
                        break;

                    case 'date':
                        const date = new Date(value);
                        if (isNaN(date.getTime())) {
                            throw new CustomException(`${param} must be a valid date`, 400);
                        }
                        req.query[param] = date;
                        break;
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Strict validation - reject arrays entirely
 */
const rejectArrayParams = (allowedArrayParams = []) => {
    return (req, res, next) => {
        try {
            for (const [key, value] of Object.entries(req.query)) {
                if (Array.isArray(value) && !allowedArrayParams.includes(key)) {
                    throw new CustomException(
                        `Invalid parameter: ${key} cannot be an array`,
                        400
                    );
                }
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    sanitizeQuery,
    validateParamTypes,
    rejectArrayParams
};
```

---

## Step 3: Update Server Configuration (5 minutes)

Edit file: `/src/server.js`

**Add these lines after line 6:**

```javascript
const hpp = require('hpp');
const { sanitizeQuery } = require('./middlewares/validateQuery.middleware');
```

**Add these lines after line 146 (after cookieParser):**

```javascript
// ✅ HPP Protection - Prevent parameter pollution
app.use(hpp({
    whitelist: [], // No array parameters allowed by default
    checkQuery: true,
    checkBody: true,
    checkBodyOnlyForContentType: 'urlencoded'
}));

// ✅ Global query sanitization
app.use(sanitizeQuery);
```

**Updated server.js section should look like:**

```javascript
// Line 144-155 (updated)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ✅ NEW: HPP Protection
app.use(hpp({
    whitelist: [],
    checkQuery: true,
    checkBody: true,
    checkBodyOnlyForContentType: 'urlencoded'
}));

// ✅ NEW: Global query sanitization
app.use(sanitizeQuery);

// ✅ PERFORMANCE: Static files with caching
app.use('/uploads', express.static('uploads', {
    // ... rest of config
```

---

## Step 4: Update Critical Controllers (20 minutes each)

### 4.1 Fix Client Controller

Edit: `/src/controllers/client.controller.js`

**Replace `getClients` function (lines 125-170):**

```javascript
const getClients = asyncHandler(async (req, res) => {
    let {
        status,
        search,
        city,
        country,
        page = 1,
        limit = 50
    } = req.query;

    // ✅ Validate status enum
    const validStatuses = ['active', 'inactive', 'archived'];
    if (status && !validStatuses.includes(status)) {
        throw new CustomException('Invalid status value', 400);
    }

    // ✅ Validate pagination (already handled by middleware, but double-check)
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(1000, Math.max(1, parseInt(limit) || 50));

    const lawyerId = req.userID;
    const query = { lawyerId };

    if (status) query.status = status;
    if (city) query.city = city;
    if (country) query.country = country;

    // ✅ Safe search with sanitization
    if (search && typeof search === 'string') {
        const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
            { fullName: { $regex: sanitizedSearch, $options: 'i' } },
            { email: { $regex: sanitizedSearch, $options: 'i' } },
            { phone: { $regex: sanitizedSearch, $options: 'i' } },
            { clientId: { $regex: sanitizedSearch, $options: 'i' } },
            { companyName: { $regex: sanitizedSearch, $options: 'i' } }
        ];
    }

    const clients = await Client.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

    const total = await Client.countDocuments(query);

    res.status(200).json({
        success: true,
        data: clients,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});
```

---

### 4.2 Fix Payment Controller

Edit: `/src/controllers/payment.controller.js`

**Replace `getPayments` function (lines 97-161):**

```javascript
const getPayments = asyncHandler(async (req, res) => {
    let {
        status,
        paymentMethod,
        clientId,
        invoiceId,
        caseId,
        startDate,
        endDate,
        page = 1,
        limit = 50
    } = req.query;

    // ✅ Validate enums
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (status && !validStatuses.includes(status)) {
        throw new CustomException('Invalid status value', 400);
    }

    const validMethods = ['credit_card', 'bank_transfer', 'cash', 'check', 'stripe'];
    if (paymentMethod && !validMethods.includes(paymentMethod)) {
        throw new CustomException('Invalid payment method', 400);
    }

    // ✅ Validate pagination
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(1000, Math.max(1, parseInt(limit) || 50));

    const lawyerId = req.userID;
    const query = { lawyerId };

    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (clientId) query.clientId = clientId;
    if (invoiceId) query.invoiceId = invoiceId;
    if (caseId) query.caseId = caseId;

    // ✅ Date range validation
    if (startDate || endDate) {
        query.paymentDate = {};
        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                throw new CustomException('Invalid start date', 400);
            }
            query.paymentDate.$gte = start;
        }
        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                throw new CustomException('Invalid end date', 400);
            }
            query.paymentDate.$lte = end;
        }
    }

    const payments = await Payment.find(query)
        .populate('clientId', 'username email')
        .populate('lawyerId', 'username')
        .populate('invoiceId', 'invoiceNumber totalAmount status')
        .populate('caseId', 'title caseNumber')
        .populate('createdBy', 'username')
        .populate('processedBy', 'username')
        .sort({ paymentDate: -1, createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    const totals = await Payment.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: payments,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        },
        summary: totals
    });
});
```

---

### 4.3 Fix Transaction Controller

Edit: `/src/controllers/transaction.controller.js`

**Replace amount range section (lines 112-117) in `getTransactions`:**

```javascript
// ✅ FIXED: Amount range with validation
if (minAmount || maxAmount) {
    query.amount = {};

    if (minAmount) {
        const min = parseFloat(minAmount);
        if (isNaN(min) || min < 0) {
            throw new CustomException('Invalid minimum amount', 400);
        }
        query.amount.$gte = min;
    }

    if (maxAmount) {
        const max = parseFloat(maxAmount);
        if (isNaN(max) || max < 0) {
            throw new CustomException('Invalid maximum amount', 400);
        }
        query.amount.$lte = max;
    }

    // ✅ Validate range logic
    if (query.amount.$gte && query.amount.$lte && query.amount.$gte > query.amount.$lte) {
        throw new CustomException('Minimum amount cannot be greater than maximum', 400);
    }
}
```

---

### 4.4 Fix Time Tracking Controller

Edit: `/src/controllers/timeTracking.controller.js`

**Replace line 334 in `getTimeEntries`:**

```javascript
// ❌ OLD:
// if (isBillable !== undefined) query.isBillable = isBillable === 'true';

// ✅ NEW:
if (isBillable !== undefined) {
    if (isBillable !== 'true' && isBillable !== 'false') {
        throw new CustomException('isBillable must be true or false', 400);
    }
    query.isBillable = isBillable === 'true';
}
```

---

## Step 5: Testing (15 minutes)

### 5.1 Start the server

```bash
npm run dev
```

### 5.2 Test HPP Protection

```bash
# Get your auth token first
TOKEN="your_jwt_token_here"

# Test 1: Status array (should be sanitized)
curl -X GET "http://localhost:8080/api/clients?status=active&status=deleted" \
  -H "Authorization: Bearer $TOKEN"
# Expected: Returns only 'active' clients (first value taken)

# Test 2: Invalid status value
curl -X GET "http://localhost:8080/api/clients?status=invalid_status" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 400 Bad Request - "Invalid status value"

# Test 3: Invalid pagination
curl -X GET "http://localhost:8080/api/clients?page=abc&limit=9999" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 400 Bad Request - "Invalid page parameter"

# Test 4: Boolean validation
curl -X GET "http://localhost:8080/api/time-tracking/entries?isBillable=maybe" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 400 Bad Request - "isBillable must be true or false"

# Test 5: Amount validation
curl -X GET "http://localhost:8080/api/transactions?minAmount=abc" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 400 Bad Request - "Invalid minimum amount"

# Test 6: Valid request (should work)
curl -X GET "http://localhost:8080/api/clients?status=active&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK with client data
```

---

## Step 6: Verify Protection

Check server logs for HPP warnings:

```bash
# You should see warnings like:
# "HPP Attempt: status is array, taking first value"
```

---

## Summary of Changes

| File | Changes | Time |
|------|---------|------|
| `package.json` | Add `hpp` dependency | 2 min |
| `src/middlewares/validateQuery.middleware.js` | Create validation middleware (NEW FILE) | 10 min |
| `src/server.js` | Add HPP middleware + global sanitization | 5 min |
| `src/controllers/client.controller.js` | Fix `getClients` function | 15 min |
| `src/controllers/payment.controller.js` | Fix `getPayments` function | 15 min |
| `src/controllers/transaction.controller.js` | Fix amount validation | 10 min |
| `src/controllers/timeTracking.controller.js` | Fix boolean validation | 5 min |
| **Total** | | **~1-2 hours** |

---

## What This Fixes

✅ **Prevents:**
- Status filter bypass (accessing deleted/archived records)
- Payment method array injection
- Boolean parameter pollution
- Pagination DoS attacks
- Amount range manipulation
- MongoDB operator injection
- Search parameter array attacks

✅ **Protects:**
- All GET endpoints with query parameters
- Financial data endpoints
- User data endpoints
- Reporting endpoints

✅ **Validates:**
- Enum values (status, type, category, etc.)
- Pagination parameters (page, limit)
- Boolean values (isBillable, isScheduled, etc.)
- Number ranges (minAmount, maxAmount)
- Date formats

---

## Additional Recommendations

### 1. Update remaining controllers (Phase 2)

Apply similar fixes to:
- `/src/controllers/expense.controller.js`
- `/src/controllers/retainer.controller.js`
- `/src/controllers/reminder.controller.js`
- `/src/controllers/report.controller.js`
- All other controllers with `req.query` usage

### 2. Add route-level validation

For stricter validation, add to specific routes:

```javascript
// Example: /src/routes/client.route.js
const { validateParamTypes } = require('../middlewares/validateQuery.middleware');

router.get(
    '/',
    validateParamTypes({
        status: { type: 'enum', values: ['active', 'inactive', 'archived'] },
        page: { type: 'number' },
        limit: { type: 'number' }
    }),
    clientController.getClients
);
```

### 3. Monitor HPP attempts

Add logging to track attack attempts:

```javascript
// In validateQuery.middleware.js
if (Array.isArray(value)) {
    console.warn('HPP Attempt:', {
        param: key,
        values: value,
        ip: req.ip,
        endpoint: req.originalUrl,
        user: req.userID
    });
}
```

### 4. Rate limiting

Consider adding rate limiting for endpoints that are frequently attacked:

```bash
npm install express-rate-limit
```

---

## Rollback Plan

If issues occur, rollback by:

1. Remove HPP middleware from `server.js`:
```javascript
// Comment out these lines
// app.use(hpp({ ... }));
// app.use(sanitizeQuery);
```

2. Restart server:
```bash
npm run dev
```

3. Revert controller changes from git:
```bash
git checkout src/controllers/client.controller.js
git checkout src/controllers/payment.controller.js
# etc.
```

---

## Support

If you encounter issues during implementation:

1. Check server logs for errors
2. Verify middleware order in `server.js`
3. Test with simple curl commands first
4. Review the full report: `HTTP_PARAMETER_POLLUTION_SECURITY_REPORT.md`

---

**Implementation Status:** ⏳ Ready to implement
**Priority:** 🔴 HIGH
**Estimated Time:** 1-2 hours for immediate fixes
**Next Steps:** Follow steps 1-6 in order

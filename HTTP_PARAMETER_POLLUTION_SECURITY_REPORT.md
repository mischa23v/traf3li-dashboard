# HTTP Parameter Pollution (HPP) Security Vulnerability Report

**Repository:** traf3li-backend
**Scan Date:** 2025-12-22
**Severity:** 🔴 **HIGH**
**Risk Score:** 8.5/10

---

## Executive Summary

The traf3li-backend application is **VULNERABLE** to HTTP Parameter Pollution (HPP) attacks. The application lacks HPP protection middleware and directly uses query parameters without validation or sanitization. This allows attackers to inject arrays, bypass filters, manipulate MongoDB queries, and potentially gain unauthorized access to data.

**Critical Findings:**
- ❌ No HPP protection middleware installed
- ❌ No query parameter validation/sanitization
- ❌ Direct assignment of req.query to MongoDB queries
- ❌ Vulnerable boolean string comparisons
- ❌ Array injection through duplicate parameters
- ❌ 19+ vulnerable endpoints identified

---

## 1. Vulnerability Overview

### What is HTTP Parameter Pollution (HPP)?

HTTP Parameter Pollution occurs when an application accepts multiple HTTP parameters with the same name. Different servers and frameworks handle duplicate parameters differently:

- **Express.js (Node.js)**: Converts duplicate parameters to arrays
  - `?status=active&status=deleted` → `{ status: ['active', 'deleted'] }`
- **PHP**: Takes the last value
- **ASP.NET**: Concatenates with commas

### Impact

| Severity | Impact | Description |
|----------|--------|-------------|
| 🔴 **HIGH** | Authorization Bypass | Access other users' data by manipulating userId filters |
| 🟠 **HIGH** | Filter Bypass | Bypass status checks (e.g., show deleted/archived records) |
| 🟠 **MEDIUM** | MongoDB Injection | Inject NoSQL operators through array pollution |
| 🟡 **MEDIUM** | Business Logic Bypass | Circumvent payment status checks, approval workflows |
| 🟡 **LOW** | DoS | Cause parsing errors or application crashes |

---

## 2. Technical Analysis

### 2.1 No HPP Protection Middleware

**File:** `/src/server.js`

```javascript
// ❌ CURRENT STATE - No HPP protection
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
```

**Problem:** No `hpp` middleware is installed or configured.

**Package Missing:** `npm install hpp` not in package.json

---

### 2.2 Direct Query Parameter Usage

All controllers directly assign `req.query` values to MongoDB queries without validation.

#### Example 1: Client Controller - Status Filter Bypass

**File:** `/src/controllers/client.controller.js` (Lines 125-140)

```javascript
const getClients = asyncHandler(async (req, res) => {
    const {
        status,      // ❌ No validation - can be array
        search,
        city,
        country,
        page = 1,
        limit = 50
    } = req.query;

    const query = { lawyerId };

    if (status) query.status = status;  // ❌ Direct assignment
    if (city) query.city = city;
    if (country) query.country = country;
    // ...
});
```

**Attack Vector:**
```bash
# Attacker sends duplicate parameters
GET /api/clients?status=active&status=deleted

# Express converts to: { status: ['active', 'deleted'] }
# MongoDB query becomes: { status: { $in: ['active', 'deleted'] } }
# Result: Returns BOTH active AND deleted clients!
```

---

#### Example 2: Payment Controller - Amount Filter Injection

**File:** `/src/controllers/transaction.controller.js` (Lines 112-117)

```javascript
// Amount range
if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = parseFloat(minAmount);  // ❌ No array check
    if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
}
```

**Attack Vector:**
```bash
# Array injection
GET /api/transactions?minAmount=100&minAmount[$gt]=0

# Results in:
# query.amount.$gte = parseFloat(['100', { '$gt': 0 }])  // NaN
# Bypasses minimum amount filter entirely
```

---

#### Example 3: Time Tracking - Boolean Bypass

**File:** `/src/controllers/timeTracking.controller.js` (Line 334)

```javascript
if (isBillable !== undefined) query.isBillable = isBillable === 'true';  // ❌ Array bypass
```

**Attack Vector:**
```bash
# Boolean bypass with array
GET /api/time-tracking/entries?isBillable=true&isBillable=false

# isBillable becomes array: ['true', 'false']
# Comparison: ['true', 'false'] === 'true'  // false
# But the array itself is truthy, bypassing validation
```

---

### 2.3 MongoDB Query Injection via Arrays

When arrays are passed to MongoDB queries, they can be interpreted as `$in` operators.

**File:** `/src/controllers/payment.controller.js` (Lines 97-117)

```javascript
const getPayments = asyncHandler(async (req, res) => {
    const {
        status,          // ❌ Can be array
        paymentMethod,   // ❌ Can be array
        clientId,
        // ...
    } = req.query;

    const query = { lawyerId };

    if (status) query.status = status;                  // ❌ Direct assignment
    if (paymentMethod) query.paymentMethod = paymentMethod;  // ❌ Direct assignment
    // ...
});
```

**Attack Scenario:**
```bash
# Normal request
GET /api/payments?status=completed
# MongoDB: { status: 'completed' }

# HPP Attack
GET /api/payments?status=completed&status=pending&status=failed
# MongoDB: { status: ['completed', 'pending', 'failed'] }
# Result: MongoDB treats as $in operator, returns ALL statuses!
```

---

### 2.4 Pagination Parameter Pollution

**File:** Multiple controllers (e.g., `/src/controllers/client.controller.js:155-156`)

```javascript
.limit(parseInt(limit))     // ❌ No array check
.skip((parseInt(page) - 1) * parseInt(limit));
```

**Attack Vector:**
```bash
# Array injection in pagination
GET /api/clients?page=1&page=999&limit=50&limit=1000

# parseInt(['1', '999']) = NaN
# Results in .limit(NaN).skip(NaN)
# Could cause DoS or expose all records
```

---

### 2.5 Search Parameter Array Injection

**File:** `/src/controllers/transaction.controller.js` (Lines 120-127)

```javascript
// Search
if (search) {
    query.$or = [
        { description: { $regex: search, $options: 'i' } },  // ❌ If search is array
        { transactionId: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
    ];
}
```

**Attack Vector:**
```bash
# Array in regex - causes error or unexpected behavior
GET /api/transactions?search=test&search[$ne]=null

# search becomes: ['test', { $ne: null }]
# $regex with array could crash or expose data
```

---

## 3. Vulnerable Endpoints Inventory

### 3.1 Critical Severity (Authorization/Access Control)

| Endpoint | Method | Vulnerable Params | Impact |
|----------|--------|------------------|--------|
| `/api/clients` | GET | `status`, `city`, `country` | Show deleted/inactive clients |
| `/api/payments` | GET | `status`, `paymentMethod`, `clientId` | Access all payment statuses |
| `/api/retainers` | GET | `status`, `retainerType`, `clientId` | Bypass retainer filters |
| `/api/cases` | GET | `status`, `outcome` | Access closed/archived cases |
| `/api/invoices` | GET | `status` | View draft/deleted invoices |

### 3.2 High Severity (Business Logic)

| Endpoint | Method | Vulnerable Params | Impact |
|----------|--------|------------------|--------|
| `/api/time-tracking/entries` | GET | `isBillable`, `status` | Bypass billable status |
| `/api/expenses` | GET | `status`, `category` | View unauthorized expenses |
| `/api/transactions` | GET | `type`, `status`, `minAmount`, `maxAmount` | Manipulate financial queries |
| `/api/reports` | GET | `isScheduled`, `reportType` | Access restricted reports |
| `/api/benefits` | GET | `status`, `benefitType` | Bypass benefit filters |

### 3.3 Medium Severity (Data Exposure)

| Endpoint | Method | Vulnerable Params | Impact |
|----------|--------|------------------|--------|
| `/api/reminders` | GET | `status`, `priority`, `type` | View dismissed reminders |
| `/api/events` | GET | `type`, `status`, `caseId` | Access private events |
| `/api/tasks` | GET | `status`, `priority`, `assignedTo` | View unassigned tasks |
| `/api/statements` | GET | `status` | Access draft statements |
| `/api/jobs` | GET | `category`, `status`, `minBudget`, `maxBudget` | Manipulate job queries |

---

## 4. Attack Scenarios

### Scenario 1: Unauthorized Data Access

**Objective:** Access deleted/archived client records

```bash
# Step 1: Normal request (shows only active clients)
GET /api/clients?status=active
Response: [{ id: 1, name: "Active Client", status: "active" }]

# Step 2: HPP attack (shows all statuses)
GET /api/clients?status=active&status=deleted&status=archived
Response: [
  { id: 1, name: "Active Client", status: "active" },
  { id: 2, name: "Deleted Client", status: "deleted" },
  { id: 3, name: "Archived Client", status: "archived" }
]

# Impact: Attacker sees sensitive deleted data
```

---

### Scenario 2: Payment Status Bypass

**Objective:** View all payment transactions including failed/refunded

```bash
# Step 1: Normal request
GET /api/payments?status=completed
Response: [{ id: 1, amount: 1000, status: "completed" }]

# Step 2: HPP attack
GET /api/payments?status=completed&status=pending&status=failed&status=refunded
Response: [
  { id: 1, amount: 1000, status: "completed" },
  { id: 2, amount: 500, status: "pending" },
  { id: 3, amount: 2000, status: "failed" },
  { id: 4, amount: 1500, status: "refunded" }
]

# Impact: Attacker sees full financial transaction history
```

---

### Scenario 3: Boolean Filter Bypass

**Objective:** Access non-billable time entries

```bash
# Step 1: Request only billable entries
GET /api/time-tracking/entries?isBillable=true
Response: [{ id: 1, description: "Legal consultation", isBillable: true }]

# Step 2: HPP attack with array
GET /api/time-tracking/entries?isBillable=true&isBillable=false

# isBillable becomes ['true', 'false']
# Comparison ['true', 'false'] === 'true' returns false
# But since array is truthy, query becomes:
# query.isBillable = false (due to failed comparison)
# Result: Shows ONLY non-billable entries (opposite of intended)
```

---

### Scenario 4: MongoDB Operator Injection

**Objective:** Inject NoSQL operators to bypass filters

```bash
# Step 1: Inject $ne (not equal) operator
GET /api/transactions?status[$ne]=cancelled
# Becomes: { status: { $ne: 'cancelled' } }
# Shows all transactions EXCEPT cancelled

# Step 2: Inject $gt/$lt for amount ranges
GET /api/transactions?amount[$gte]=0&amount[$lte]=999999
# Becomes: { amount: { $gte: 0, $lte: 999999 } }
# Bypasses intended amount validation

# Step 3: Complex injection
GET /api/clients?status[$in][]=active&status[$in][]=deleted
# Becomes: { status: { $in: ['active', 'deleted'] } }
# Direct MongoDB operator injection
```

---

### Scenario 5: Pagination DoS

**Objective:** Cause resource exhaustion

```bash
# Attack: Send array for limit parameter
GET /api/clients?limit=1&limit=1000000

# parseInt(['1', '1000000']) = NaN
# Query becomes: .limit(NaN)
# MongoDB may return ALL records, causing:
# - Memory exhaustion
# - Application crash
# - Database overload
```

---

## 5. Proof of Concept (PoC)

### PoC 1: Client Status Filter Bypass

```javascript
// Test script
const axios = require('axios');

async function testHPP() {
    const baseUrl = 'http://localhost:8080/api/clients';
    const token = 'YOUR_AUTH_TOKEN';

    // Normal request
    const normal = await axios.get(`${baseUrl}?status=active`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Normal request:', normal.data.data.length, 'clients');

    // HPP attack
    const attack = await axios.get(`${baseUrl}?status=active&status=deleted&status=archived`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('HPP attack:', attack.data.data.length, 'clients');

    // Expected: Attack returns MORE records
}

testHPP();
```

**Expected Output:**
```
Normal request: 10 clients
HPP attack: 45 clients  // ❌ Includes deleted/archived!
```

---

### PoC 2: Boolean Bypass Test

```bash
#!/bin/bash

TOKEN="your_jwt_token"
BASE_URL="http://localhost:8080"

# Test 1: Normal boolean filter
echo "Test 1: Normal request"
curl -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/time-tracking/entries?isBillable=true"

# Test 2: HPP with duplicate boolean
echo "Test 2: HPP attack"
curl -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/time-tracking/entries?isBillable=true&isBillable=false"

# Test 3: Array in status
echo "Test 3: Status array"
curl -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/payments?status=completed&status=pending&status=failed"
```

---

## 6. Mitigation Strategy

### 6.1 Install HPP Protection Middleware

**Step 1: Install the package**

```bash
npm install hpp --save
```

**Step 2: Configure in server.js**

**File:** `/src/server.js`

```javascript
const express = require('express');
const hpp = require('hpp');

const app = express();

// ... other middleware ...

// ✅ ADD: HPP Protection Middleware (BEFORE routes)
app.use(hpp({
    whitelist: [
        // Allow specific fields to be arrays
        'status[]',     // For multi-status filters (if intentional)
        'tags[]',       // For tag arrays
        'categories[]'  // For category arrays
    ],
    checkQuery: true,      // Check req.query
    checkBody: true,       // Check req.body
    checkBodyOnlyForContentType: 'urlencoded'
}));

// Routes
app.use('/api/clients', clientRoute);
// ... other routes ...
```

---

### 6.2 Input Validation Middleware

Create a validation middleware for query parameters:

**File:** `/src/middlewares/validateQuery.middleware.js`

```javascript
const CustomException = require('../utils/CustomException');

/**
 * Validate query parameters to prevent HPP
 */
const validateQuery = (allowedArrayParams = []) => {
    return (req, res, next) => {
        try {
            // Check each query parameter
            for (const [key, value] of Object.entries(req.query)) {
                // If array and not whitelisted
                if (Array.isArray(value) && !allowedArrayParams.includes(key)) {
                    throw new CustomException(
                        `Invalid parameter: ${key} cannot be an array`,
                        400
                    );
                }

                // Sanitize strings
                if (typeof value === 'string') {
                    req.query[key] = value.trim();
                }
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Sanitize and normalize query parameters
 */
const sanitizeQuery = (req, res, next) => {
    try {
        // Take only first value if array (HPP protection)
        for (const [key, value] of Object.entries(req.query)) {
            if (Array.isArray(value)) {
                req.query[key] = value[0];
            }
        }

        // Validate pagination params
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

module.exports = {
    validateQuery,
    sanitizeQuery,
    validateParamTypes
};
```

---

### 6.3 Update Controllers with Validation

#### Example: Fixed Client Controller

**File:** `/src/controllers/client.controller.js`

```javascript
const { sanitizeQuery, validateParamTypes } = require('../middlewares/validateQuery.middleware');

/**
 * ✅ FIXED: Get clients with filters
 * GET /api/clients
 */
const getClients = asyncHandler(async (req, res) => {
    // ✅ Destructure with defaults and validation
    let {
        status,
        search,
        city,
        country,
        page = 1,
        limit = 50
    } = req.query;

    // ✅ Validate status against enum
    const validStatuses = ['active', 'inactive', 'archived'];
    if (status && !validStatuses.includes(status)) {
        throw new CustomException('Invalid status value', 400);
    }

    // ✅ Ensure single values (not arrays)
    if (Array.isArray(status)) status = status[0];
    if (Array.isArray(city)) city = city[0];
    if (Array.isArray(country)) country = country[0];

    // ✅ Validate and sanitize pagination
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(1000, Math.max(1, parseInt(limit) || 50));

    const lawyerId = req.userID;
    const query = { lawyerId };

    // ✅ Safe assignment after validation
    if (status) query.status = status;
    if (city) query.city = city;
    if (country) query.country = country;

    // Search with sanitization
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

#### Example: Fixed Payment Controller

**File:** `/src/controllers/payment.controller.js`

```javascript
/**
 * ✅ FIXED: Get payments with filters
 * GET /api/payments
 */
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
    const validMethods = ['credit_card', 'bank_transfer', 'cash', 'check', 'stripe'];

    if (status && !validStatuses.includes(status)) {
        throw new CustomException('Invalid status value', 400);
    }

    if (paymentMethod && !validMethods.includes(paymentMethod)) {
        throw new CustomException('Invalid payment method', 400);
    }

    // ✅ Ensure single values
    if (Array.isArray(status)) status = status[0];
    if (Array.isArray(paymentMethod)) paymentMethod = paymentMethod[0];
    if (Array.isArray(clientId)) clientId = clientId[0];

    // ✅ Validate pagination
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(1000, Math.max(1, parseInt(limit) || 50));

    const lawyerId = req.userID;
    const query = { lawyerId };

    // Safe assignments
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (clientId) query.clientId = clientId;
    if (invoiceId) query.invoiceId = invoiceId;
    if (caseId) query.caseId = caseId;

    // Date range validation
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

#### Example: Fixed Transaction Controller with Amount Validation

**File:** `/src/controllers/transaction.controller.js`

```javascript
/**
 * ✅ FIXED: Get transactions
 * GET /api/transactions
 */
const getTransactions = asyncHandler(async (req, res) => {
    let {
        type,
        category,
        status,
        paymentMethod,
        startDate,
        endDate,
        caseId,
        invoiceId,
        expenseId,
        minAmount,
        maxAmount,
        search,
        page = 1,
        limit = 20,
        sortBy = 'date',
        sortOrder = 'desc'
    } = req.query;

    // ✅ Validate enums
    const validTypes = ['income', 'expense', 'transfer'];
    const validStatuses = ['pending', 'completed', 'cancelled'];
    const validSortFields = ['date', 'amount', 'createdAt'];

    if (type && !validTypes.includes(type)) {
        throw new CustomException('Invalid transaction type', 400);
    }

    if (status && !validStatuses.includes(status)) {
        throw new CustomException('Invalid status', 400);
    }

    if (!validSortFields.includes(sortBy)) {
        sortBy = 'date';
    }

    // ✅ Ensure single values
    if (Array.isArray(type)) type = type[0];
    if (Array.isArray(status)) status = status[0];
    if (Array.isArray(category)) category = category[0];

    // ✅ Validate pagination
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(1000, Math.max(1, parseInt(limit) || 20));

    const userId = req.userID;
    const query = { userId };

    // Filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (caseId) query.caseId = caseId;
    if (invoiceId) query.invoiceId = invoiceId;
    if (expenseId) query.expenseId = expenseId;

    // Date range
    if (startDate || endDate) {
        query.date = {};
        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                throw new CustomException('Invalid start date', 400);
            }
            query.date.$gte = start;
        }
        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                throw new CustomException('Invalid end date', 400);
            }
            query.date.$lte = end;
        }
    }

    // ✅ FIXED: Amount range with validation
    if (minAmount || maxAmount) {
        query.amount = {};

        if (minAmount) {
            // ✅ Ensure it's not an array
            if (Array.isArray(minAmount)) minAmount = minAmount[0];

            const min = parseFloat(minAmount);
            if (isNaN(min) || min < 0) {
                throw new CustomException('Invalid minimum amount', 400);
            }
            query.amount.$gte = min;
        }

        if (maxAmount) {
            // ✅ Ensure it's not an array
            if (Array.isArray(maxAmount)) maxAmount = maxAmount[0];

            const max = parseFloat(maxAmount);
            if (isNaN(max) || max < 0) {
                throw new CustomException('Invalid maximum amount', 400);
            }
            query.amount.$lte = max;
        }

        // ✅ Validate range logic
        if (query.amount.$gte && query.amount.$lte && query.amount.$gte > query.amount.$lte) {
            throw new CustomException('Minimum amount cannot be greater than maximum amount', 400);
        }
    }

    // ✅ FIXED: Search with sanitization
    if (search) {
        // ✅ Ensure it's not an array
        if (Array.isArray(search)) search = search[0];

        // ✅ Sanitize and validate
        if (typeof search === 'string' && search.trim().length > 0) {
            const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { description: { $regex: sanitizedSearch, $options: 'i' } },
                { transactionId: { $regex: sanitizedSearch, $options: 'i' } },
                { referenceNumber: { $regex: sanitizedSearch, $options: 'i' } },
                { notes: { $regex: sanitizedSearch, $options: 'i' } }
            ];
        }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const transactions = await Transaction.find(query)
        .populate('invoiceId', 'invoiceNumber totalAmount')
        .populate('expenseId', 'description amount')
        .populate('caseId', 'caseNumber title')
        .sort(sortOptions)
        .limit(limit)
        .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
        success: true,
        data: transactions,
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

### 6.4 Update Routes with Validation Middleware

**File:** `/src/routes/client.route.js`

```javascript
const express = require('express');
const router = express.Router();
const { sanitizeQuery, validateParamTypes } = require('../middlewares/validateQuery.middleware');
const clientController = require('../controllers/client.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// ✅ Apply validation middleware to all routes
router.use(verifyToken);
router.use(sanitizeQuery);

// GET /api/clients - with query validation
router.get(
    '/',
    validateParamTypes({
        status: { type: 'enum', values: ['active', 'inactive', 'archived'] },
        page: { type: 'number' },
        limit: { type: 'number' }
    }),
    clientController.getClients
);

// Other routes...
router.post('/', clientController.createClient);
router.get('/:id', clientController.getClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router;
```

---

## 7. Testing & Verification

### 7.1 Automated HPP Tests

**File:** `/test/security/hpp.test.js`

```javascript
const request = require('supertest');
const app = require('../../src/server');
const { expect } = require('chai');

describe('HPP Security Tests', () => {
    let authToken;

    before(async () => {
        // Get auth token
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password' });
        authToken = res.body.token;
    });

    describe('Status Filter HPP', () => {
        it('should reject duplicate status parameters', async () => {
            const res = await request(app)
                .get('/api/clients?status=active&status=deleted')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.error).to.include('cannot be an array');
        });

        it('should accept single status parameter', async () => {
            const res = await request(app)
                .get('/api/clients?status=active')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.data).to.be.an('array');
        });
    });

    describe('Pagination HPP', () => {
        it('should reject array pagination parameters', async () => {
            const res = await request(app)
                .get('/api/clients?page=1&page=999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });

        it('should handle invalid pagination gracefully', async () => {
            const res = await request(app)
                .get('/api/clients?page=abc&limit=xyz')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.error).to.include('Invalid');
        });
    });

    describe('Amount Range HPP', () => {
        it('should reject array amount parameters', async () => {
            const res = await request(app)
                .get('/api/transactions?minAmount=100&minAmount=0')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });

        it('should validate amount range logic', async () => {
            const res = await request(app)
                .get('/api/transactions?minAmount=1000&maxAmount=100')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.error).to.include('Minimum amount cannot be greater');
        });
    });

    describe('Boolean HPP', () => {
        it('should reject array boolean parameters', async () => {
            const res = await request(app)
                .get('/api/time-tracking/entries?isBillable=true&isBillable=false')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });

        it('should validate boolean values', async () => {
            const res = await request(app)
                .get('/api/time-tracking/entries?isBillable=maybe')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);

            expect(res.body.error).to.include('must be true or false');
        });
    });

    describe('Search HPP', () => {
        it('should sanitize search parameter', async () => {
            const res = await request(app)
                .get('/api/clients?search=.*')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Should not return all records
            expect(res.body.data.length).to.be.lessThan(100);
        });

        it('should reject array search parameter', async () => {
            const res = await request(app)
                .get('/api/clients?search=test&search[$ne]=null')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
        });
    });
});
```

---

### 7.2 Manual Testing Checklist

```bash
# Test 1: Status filter bypass
curl "http://localhost:8080/api/clients?status=active&status=deleted" \
  -H "Authorization: Bearer TOKEN"
# Expected: 400 Bad Request

# Test 2: Pagination array
curl "http://localhost:8080/api/payments?page=1&page=999&limit=50&limit=1000" \
  -H "Authorization: Bearer TOKEN"
# Expected: 400 Bad Request

# Test 3: Boolean array
curl "http://localhost:8080/api/time-tracking/entries?isBillable=true&isBillable=false" \
  -H "Authorization: Bearer TOKEN"
# Expected: 400 Bad Request

# Test 4: Amount range array
curl "http://localhost:8080/api/transactions?minAmount=100&minAmount[$gt]=0" \
  -H "Authorization: Bearer TOKEN"
# Expected: 400 Bad Request

# Test 5: NoSQL injection attempt
curl "http://localhost:8080/api/clients?status[$ne]=active" \
  -H "Authorization: Bearer TOKEN"
# Expected: 400 Bad Request or sanitized to safe value
```

---

## 8. Implementation Roadmap

### Phase 1: Immediate Actions (Week 1)

| Priority | Task | Owner | Status |
|----------|------|-------|--------|
| 🔴 **P0** | Install `hpp` middleware | Backend Team | ⏳ Pending |
| 🔴 **P0** | Create `validateQuery.middleware.js` | Backend Team | ⏳ Pending |
| 🔴 **P0** | Fix top 5 critical endpoints | Backend Team | ⏳ Pending |
| 🔴 **P0** | Add automated HPP tests | QA Team | ⏳ Pending |

### Phase 2: Comprehensive Fix (Week 2-3)

| Priority | Task | Owner | Status |
|----------|------|-------|--------|
| 🟠 **P1** | Fix all remaining controllers | Backend Team | ⏳ Pending |
| 🟠 **P1** | Update all route files | Backend Team | ⏳ Pending |
| 🟠 **P1** | Add validation schemas | Backend Team | ⏳ Pending |
| 🟡 **P2** | Comprehensive testing | QA Team | ⏳ Pending |
| 🟡 **P2** | Security audit | Security Team | ⏳ Pending |

### Phase 3: Monitoring & Documentation (Week 4)

| Priority | Task | Owner | Status |
|----------|------|-------|--------|
| 🟡 **P2** | Add logging for HPP attempts | Backend Team | ⏳ Pending |
| 🟢 **P3** | Update API documentation | Dev Team | ⏳ Pending |
| 🟢 **P3** | Security training | All Teams | ⏳ Pending |

---

## 9. Monitoring & Detection

### 9.1 Add HPP Detection Logging

**File:** `/src/middlewares/hppDetection.middleware.js`

```javascript
const logger = require('../utils/logger');

/**
 * Detect and log HPP attempts
 */
const detectHPP = (req, res, next) => {
    const arrayParams = [];

    // Detect array parameters
    for (const [key, value] of Object.entries(req.query)) {
        if (Array.isArray(value)) {
            arrayParams.push({ param: key, values: value });
        }
    }

    // Log HPP attempt
    if (arrayParams.length > 0) {
        logger.warn('HPP Attempt Detected', {
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.userID,
            endpoint: req.originalUrl,
            method: req.method,
            arrayParams,
            timestamp: new Date().toISOString()
        });

        // Optionally notify security team
        // notifySecurityTeam(req, arrayParams);
    }

    next();
};

module.exports = detectHPP;
```

---

### 9.2 Security Monitoring Dashboard

Track HPP attempts in your monitoring system:

```javascript
// Example metrics to track
- hpp_attempts_total (counter)
- hpp_attempts_by_endpoint (counter with endpoint label)
- hpp_attempts_by_ip (counter with IP label)
- hpp_blocked_requests (counter)
```

---

## 10. References & Resources

### Official Documentation
- **Express.js Query Parsing:** https://expressjs.com/en/api.html#req.query
- **HPP Middleware:** https://www.npmjs.com/package/hpp
- **OWASP HPP:** https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/04-Testing_for_HTTP_Parameter_Pollution

### Security Best Practices
- **CWE-20:** Improper Input Validation
- **OWASP Top 10 2021:** A03:2021 – Injection
- **Node.js Security Best Practices:** https://nodejs.org/en/docs/guides/security/

### Similar Vulnerabilities
- SQL Injection
- NoSQL Injection
- LDAP Injection
- Mass Assignment

---

## 11. Conclusion

The traf3li-backend application is **highly vulnerable** to HTTP Parameter Pollution attacks. The lack of HPP protection middleware and input validation allows attackers to:

- ✅ Bypass authorization filters
- ✅ Access deleted/archived data
- ✅ Manipulate financial queries
- ✅ Inject MongoDB operators
- ✅ Cause application crashes

**Immediate action is required** to:
1. Install and configure HPP middleware
2. Implement input validation on all query parameters
3. Update vulnerable controllers
4. Add comprehensive testing

**Estimated effort:** 2-3 weeks for full remediation

---

**Report Generated:** 2025-12-22
**Next Review:** After implementation of mitigation measures
**Contact:** Security Team - security@traf3li.com

# TRUST BOUNDARY VIOLATIONS - Security Audit Report

**Date:** 2025-12-22
**Auditor:** Claude Security Scanner
**Repository:** traf3li-backend
**Scope:** Backend API Trust Boundary Analysis
**Controllers Analyzed:** 35 files

---

## EXECUTIVE SUMMARY

This security audit identified **CRITICAL** trust boundary violations in the traf3li-backend API. The application trusts client-provided data without proper validation at multiple security boundaries, creating severe vulnerabilities that could lead to:

- **Privilege Escalation** (users setting their own roles)
- **Mass Assignment Attacks** (modifying protected fields)
- **IP Spoofing** (bypassing IP-based security controls)
- **Data Tampering** (manipulating financial amounts, status fields)
- **Authorization Bypass** (accessing resources via ID manipulation)

**OVERALL SEVERITY: CRITICAL (9.8/10)**

---

## TRUST BOUNDARY DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                     EXTERNAL BOUNDARY                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Untrusted Zone (Internet/Client Browser)            │  │
│  │  - User Input (req.body, req.query, req.params)      │  │
│  │  - HTTP Headers (Origin, User-Agent, X-Forwarded-For)│  │
│  │  - Cookies (can be manipulated)                      │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │                                      │
│         ⚠️  TRUST BOUNDARY VIOLATION ZONE ⚠️                │
│                       │                                      │
│  ┌────────────────────▼──────────────────────────────────┐  │
│  │  Backend Application Layer (Node.js/Express)         │  │
│  │  ✗ Missing Input Validation                          │  │
│  │  ✗ Trusting Client Headers (X-Forwarded-For)         │  │
│  │  ✗ Mass Assignment Vulnerabilities                   │  │
│  │  ✗ Client-Controlled Role Assignment                 │  │
│  │  ✗ Direct Object References (findById with req.body) │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼──────────────────────────────────┐  │
│  │  Trusted Zone (Database/Internal Systems)            │  │
│  │  - MongoDB Database                                  │  │
│  │  - Stripe Payment Gateway                            │  │
│  │  - File System                                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## CRITICAL FINDINGS

### 🔴 CRITICAL #1: Client-Controlled Role Assignment

**Severity:** CRITICAL (10/10)
**File:** `/src/controllers/auth.controller.js:24`
**Trust Boundary:** External → Internal (User Registration)

**Violation:**
```javascript
role: role || (isSeller ? 'lawyer' : 'client')
```

**Issue:**
- Clients can specify their own `role` during registration
- Direct privilege escalation to `admin` or `lawyer` role
- No server-side role validation or restrictions

**Attack Scenario:**
```bash
POST /api/auth/register
{
  "username": "attacker",
  "email": "attacker@evil.com",
  "password": "password123",
  "role": "admin"  ← Client sets admin role directly
}
```

**Impact:**
- Complete system compromise
- Access to all users, cases, financial data
- Ability to delete/modify any resource

**Remediation:**
```javascript
// NEVER trust client-provided role
const role = isSeller ? 'lawyer' : 'client';
// Admin roles must be set manually by existing admins via separate API
```

---

### 🔴 CRITICAL #2: Mass Assignment - Invoice Update

**Severity:** CRITICAL (9.5/10)
**File:** `/src/controllers/invoice.controller.js:147-149`
**Trust Boundary:** External → Database

**Violation:**
```javascript
const updatedInvoice = await Invoice.findByIdAndUpdate(
    _id,
    { $set: request.body },  // ← Entire request body trusted
    { new: true }
```

**Issue:**
- Client can modify ANY field in the invoice model
- No allowlist of updatable fields
- Can bypass business logic and validations

**Attack Scenario:**
```bash
PUT /api/invoices/12345
{
  "total": 1,           ← Reduce invoice amount
  "status": "paid",     ← Mark as paid without payment
  "lawyerId": "hacker", ← Change ownership
  "vatRate": 0          ← Remove taxes
}
```

**Impact:**
- Financial fraud (changing amounts, status)
- Data tampering (ownership manipulation)
- Business logic bypass

**Remediation:**
```javascript
// Allowlist approach
const allowedFields = ['notes', 'internalNotes', 'dueDate'];
const updates = {};
allowedFields.forEach(field => {
    if (request.body[field] !== undefined) {
        updates[field] = request.body[field];
    }
});
const updatedInvoice = await Invoice.findByIdAndUpdate(_id, updates, { new: true });
```

---

### 🔴 CRITICAL #3: Mass Assignment - Job Update

**Severity:** CRITICAL (9.5/10)
**File:** `/src/controllers/job.controller.js:73`
**Trust Boundary:** External → Database

**Violation:**
```javascript
Object.assign(job, req.body);
await job.save();
```

**Issue:**
- Spreads entire `req.body` into job object
- Can modify protected fields (userID, status, proposalsCount)
- No field validation

**Attack Scenario:**
```bash
PUT /api/jobs/12345
{
  "title": "New Title",
  "userID": "attacker_id",    ← Steal job ownership
  "status": "completed",       ← Bypass workflow
  "proposalsCount": 1000       ← Manipulate metrics
}
```

**Impact:**
- Resource ownership theft
- Workflow bypass
- Data integrity compromise

**Remediation:**
```javascript
// Allowlist approach
const allowedFields = ['title', 'description', 'category', 'budget'];
allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
        job[field] = req.body[field];
    }
});
await job.save();
```

---

### 🔴 CRITICAL #4: Mass Assignment - Spread Operators

**Severity:** CRITICAL (9.0/10)
**Files:**
- `/src/controllers/job.controller.js:9`
- `/src/controllers/proposal.controller.js:21`
- `/src/controllers/benefit.controller.js:317`

**Violation:**
```javascript
const job = await Job.create({
    ...req.body,        // ← Spreads all client data
    userID: req.userID
});
```

**Issue:**
- Client can set ANY model field during creation
- Can set internal fields (status, createdAt, etc.)
- Bypasses model defaults and validations

**Attack Scenario:**
```bash
POST /api/jobs
{
  "title": "Job Title",
  "status": "completed",     ← Set to completed immediately
  "proposalsCount": 999,     ← Fake popularity
  "userID": "someone_else"   ← Overridden after spread
}
```

**Impact:**
- Business logic bypass
- Data integrity issues
- Potential ownership confusion

**Remediation:**
```javascript
// Explicit field extraction
const { title, description, category, budget } = req.body;
const job = await Job.create({
    title,
    description,
    category,
    budget,
    userID: req.userID,  // Server-controlled
    status: 'open'       // Server-controlled
});
```

---

### 🟠 HIGH #5: IP Address Spoofing via X-Forwarded-For

**Severity:** HIGH (8.5/10)
**Files:**
- `/src/middlewares/adminIPWhitelist.middleware.js:118-138`
- `/src/middlewares/auditLog.middleware.js:64`

**Violation:**
```javascript
const headers = [
    'x-forwarded-for',      // ← Trusted without validation
    'x-real-ip',
    'cf-connecting-ip',
    // ...
];

// x-forwarded-for can contain multiple IPs
const ips = value.split(',').map(ip => ip.trim());
if (ips[0]) {
    return ips[0];  // ← First IP is trusted
}
```

**Issue:**
- Headers can be spoofed by clients
- No validation if proxy is trusted
- Used for security decisions (IP whitelisting)

**Attack Scenario:**
```bash
GET /api/admin/users
Headers:
  X-Forwarded-For: 192.168.1.100  ← Whitelisted admin IP
  Cookie: accessToken=attacker_token
```

**Impact:**
- Bypass IP-based access controls
- False audit logs
- Admin access from unauthorized IPs

**Remediation:**
```javascript
// Only trust proxy headers in production with verified proxies
const getClientIP = (req) => {
    // Option 1: Trust proxy only in production with known proxy
    if (process.env.TRUSTED_PROXY === 'true') {
        return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
    }

    // Option 2: Use Express trust proxy setting
    // In server.js: app.set('trust proxy', 1);
    return req.ip;  // Express handles proxy headers if configured
};
```

---

### 🟠 HIGH #6: User-Agent Trust

**Severity:** HIGH (7.0/10)
**Files:** Multiple controllers (timeTracking, payment, retainer, etc.)

**Violation:**
```javascript
userAgent: req.get('user-agent')  // ← Trusted for logging
```

**Issue:**
- User-Agent is client-controlled
- Stored in audit logs without validation
- Could inject malicious data into logs

**Attack Scenario:**
```bash
POST /api/payments
Headers:
  User-Agent: <script>alert('XSS')</script>
```

**Impact:**
- Log injection
- Potential XSS if logs viewed in web interface
- False tracking data

**Remediation:**
```javascript
// Sanitize user agent before storage
const sanitizeUserAgent = (ua) => {
    if (!ua || typeof ua !== 'string') return 'unknown';
    // Remove special characters, limit length
    return ua.replace(/[<>'"]/g, '').substring(0, 200);
};

userAgent: sanitizeUserAgent(req.get('user-agent'))
```

---

### 🟠 HIGH #7: Environment Detection via Origin Header

**Severity:** HIGH (7.5/10)
**File:** `/src/controllers/auth.controller.js:76-82, 107-108`

**Violation:**
```javascript
const origin = request.get('origin') || '';
const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

const cookieConfig = {
    httpOnly: true,
    sameSite: isLocalhost ? 'lax' : 'none',
    secure: !isLocalhost,  // ← Security decision based on client header
```

**Issue:**
- Security settings based on client-controlled header
- Can force insecure cookie settings in production

**Attack Scenario:**
```bash
POST /api/auth/login
Headers:
  Origin: http://localhost:5173  ← Fake localhost origin
```

**Impact:**
- Insecure cookie settings in production
- Potential session theft
- CSRF vulnerabilities

**Remediation:**
```javascript
// Use server-side environment detection
const isProduction = process.env.NODE_ENV === 'production';

const cookieConfig = {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,  // Based on environment, not client input
    maxAge: 60 * 60 * 24 * 7 * 1000
};
```

---

### 🟡 MEDIUM #8: Direct Object References

**Severity:** MEDIUM (6.5/10)
**Files:** Multiple controllers

**Violation:**
```javascript
const job = await Job.findById(req.params._id);  // ← No validation
const job = await Job.findById(req.body.jobId);  // ← Body parameter
```

**Issue:**
- Client provides resource IDs
- Minimal authorization checks
- Potential IDOR (Insecure Direct Object Reference)

**Impact:**
- Unauthorized resource access (mitigated by ownership checks)
- Information disclosure

**Remediation:**
```javascript
// Always validate ObjectId format
if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
    throw new CustomException('Invalid ID format', 400);
}

const job = await Job.findById(req.params._id);

// Always check ownership
if (job.userID.toString() !== req.userID) {
    throw new CustomException('Not authorized', 403);
}
```

---

### 🟡 MEDIUM #9: Missing Input Validation

**Severity:** MEDIUM (6.0/10)
**Files:** All controllers

**Violation:**
- No validation library (Joi, express-validator) in use
- Manual validation only for required fields
- No data type validation, format validation, sanitization

**Issue:**
```javascript
// payment.controller.js:10-26
const {
    clientId,
    invoiceId,
    amount,      // ← No validation of type, range, format
    currency,
    paymentMethod
} = req.body;

// Only checks existence
if (!clientId || !amount || !paymentMethod) {
    throw new CustomException('Required fields missing', 400);
}
```

**Impact:**
- Invalid data in database
- Type confusion attacks
- Unexpected behavior

**Remediation:**
```javascript
// Install: npm install joi
const Joi = require('joi');

const paymentSchema = Joi.object({
    clientId: Joi.string().hex().length(24).required(),
    invoiceId: Joi.string().hex().length(24),
    amount: Joi.number().positive().max(1000000).required(),
    currency: Joi.string().valid('SAR', 'USD', 'EUR').default('SAR'),
    paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'card').required()
});

const { error, value } = paymentSchema.validate(req.body);
if (error) {
    throw new CustomException(error.details[0].message, 400);
}
```

---

### 🟡 MEDIUM #10: Client-Controlled Foreign Keys

**Severity:** MEDIUM (6.5/10)
**File:** `/src/controllers/proposal.controller.js:26`

**Violation:**
```javascript
await Job.findByIdAndUpdate(req.body.jobId, {
    $inc: { proposalsCount: 1 }
});
```

**Issue:**
- Client provides jobId in request body
- Could increment count on arbitrary jobs
- Resource manipulation via ID injection

**Attack Scenario:**
```bash
POST /api/proposals
{
  "jobId": "competitor_job_id",  ← Inflate competitor's proposal count
  "proposedAmount": 1000,
  "description": "..."
}
```

**Impact:**
- Metrics manipulation
- Resource state tampering

**Remediation:**
```javascript
// Verify job exists and is open BEFORE creating proposal
const job = await Job.findById(req.body.jobId);
if (!job) {
    throw new CustomException('Job not found', 404);
}
if (job.status !== 'open') {
    throw new CustomException('Job is not accepting proposals', 400);
}

// Create proposal first
const proposal = await Proposal.create({
    jobId: job._id,  // Use verified job ID
    lawyerId: req.userID,
    // ...
});

// Then update job
await Job.findByIdAndUpdate(job._id, {
    $inc: { proposalsCount: 1 }
});
```

---

## VIOLATED TRUST BOUNDARIES SUMMARY

| Boundary | Violation Type | Severity | Count |
|----------|---------------|----------|-------|
| Client → Server (Input) | Mass Assignment | CRITICAL | 4 |
| Client → Server (Input) | Role Assignment | CRITICAL | 1 |
| Client → Server (Headers) | IP Spoofing | HIGH | 2 |
| Client → Server (Headers) | Environment Detection | HIGH | 1 |
| Client → Server (Input) | Missing Validation | MEDIUM | 35+ |
| Client → Server (Input) | Direct Object References | MEDIUM | 20+ |

---

## BACKEND VALIDATION REQUIREMENTS

### 1. Input Validation Layer

**Implement Joi Validation for All Endpoints:**

```javascript
// middleware/validate.middleware.js
const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true  // Remove unknown fields
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(d => d.message)
            });
        }

        req.body = value;  // Use validated/sanitized data
        next();
    };
};

module.exports = validate;
```

**Usage:**
```javascript
const validate = require('../middlewares/validate.middleware');
const paymentSchema = require('../schemas/payment.schema');

router.post('/payments', authenticate, validate(paymentSchema), createPayment);
```

---

### 2. Field Allowlisting

**Never Trust Full Request Bodies:**

```javascript
// ❌ WRONG
const user = await User.create(req.body);
Object.assign(model, req.body);
{ $set: req.body }

// ✅ CORRECT
const { allowedField1, allowedField2 } = req.body;
const user = await User.create({
    allowedField1,
    allowedField2,
    serverControlledField: computedValue
});
```

---

### 3. Authorization Checks

**Verify Every Resource Access:**

```javascript
// Always check ownership before operations
const resource = await Model.findById(id);

if (!resource) {
    throw new CustomException('Resource not found', 404);
}

// Check ownership
if (resource.ownerId.toString() !== req.userID) {
    throw new CustomException('Not authorized', 403);
}

// Proceed with operation
```

---

### 4. Trust Proxy Configuration

**Configure Express Trust Proxy:**

```javascript
// server.js
if (process.env.NODE_ENV === 'production') {
    // Trust first proxy only (e.g., nginx, CloudFlare)
    app.set('trust proxy', 1);
}

// Then req.ip will be properly extracted
```

---

### 5. Role-Based Access Control

**Never Trust Client-Provided Roles:**

```javascript
// ❌ WRONG
const { role } = req.body;
user.role = role;

// ✅ CORRECT
// Roles set only by admins via separate privileged endpoint
const setUserRole = async (req, res) => {
    // Require admin authentication
    if (req.user.role !== 'admin') {
        throw new CustomException('Admin access required', 403);
    }

    const { userId, newRole } = req.body;

    // Validate role
    const validRoles = ['client', 'lawyer', 'admin'];
    if (!validRoles.includes(newRole)) {
        throw new CustomException('Invalid role', 400);
    }

    await User.findByIdAndUpdate(userId, { role: newRole });
};
```

---

## DEFENSE IN DEPTH IMPLEMENTATION

### Layer 1: Network/Infrastructure
- ✅ Use WAF (Web Application Firewall)
- ✅ Configure trusted proxy properly
- ✅ Enable rate limiting (already implemented)
- ✅ Use HTTPS only (enforce with HSTS)

### Layer 2: Application Entry (Middleware)
```javascript
// Add validation middleware globally
app.use(express.json({ limit: '10mb' }));
app.use(mongoSanitize());  // Prevent NoSQL injection
app.use(helmet());          // Security headers
app.use(rateLimiter);       // Rate limiting
```

### Layer 3: Authentication & Authorization
```javascript
// Always populate full user object for authorization
const authenticateAndLoadUser = async (req, res, next) => {
    const token = req.cookies.accessToken;
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);

    // Load full user from database
    req.user = await User.findById(_id).select('-password');

    if (!req.user) {
        throw new CustomException('User not found', 401);
    }

    next();
};
```

### Layer 4: Input Validation
```javascript
// Use Joi schemas for all endpoints
const schemas = {
    payment: paymentSchema,
    invoice: invoiceSchema,
    case: caseSchema,
    // ...
};
```

### Layer 5: Business Logic
```javascript
// Implement business rules in models
invoiceSchema.pre('save', function(next) {
    // Can't change invoice after it's paid
    if (this.isModified('total') && this.status === 'paid') {
        throw new Error('Cannot modify paid invoice');
    }
    next();
});
```

### Layer 6: Database
```javascript
// Use schema validation
const paymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: [0, 'Amount cannot be negative'],
        max: [10000000, 'Amount too large']
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
        immutable: function() {
            // Status can't be changed once completed
            return this.status === 'completed';
        }
    }
});
```

### Layer 7: Audit & Monitoring
```javascript
// Log all security-relevant events
const securityLogger = {
    logAuthFailure: (userId, ip) => { /* ... */ },
    logPrivilegeEscalation: (userId, attemptedRole) => { /* ... */ },
    logUnauthorizedAccess: (userId, resourceId) => { /* ... */ }
};
```

---

## IMMEDIATE ACTION REQUIRED

### Priority 1 (Fix Immediately - Critical)
1. ✅ **Remove client-controlled role assignment** in `auth.controller.js:24`
2. ✅ **Implement allowlist** for invoice updates in `invoice.controller.js:149`
3. ✅ **Replace Object.assign** in `job.controller.js:73`
4. ✅ **Replace spread operators** in create operations

### Priority 2 (Fix Within 1 Week - High)
1. ✅ **Configure trust proxy** in `server.js`
2. ✅ **Sanitize User-Agent** headers before storage
3. ✅ **Use NODE_ENV** for environment detection, not Origin header
4. ✅ **Implement Joi validation** for all endpoints

### Priority 3 (Fix Within 1 Month - Medium)
1. ✅ **Add ObjectId validation** for all route parameters
2. ✅ **Implement comprehensive input sanitization**
3. ✅ **Add business logic validation** in models
4. ✅ **Enhance audit logging**

---

## SECURITY RECOMMENDATIONS

### 1. Input Validation
- ✅ Use Joi or express-validator for all input
- ✅ Validate data types, formats, ranges
- ✅ Sanitize all user input
- ✅ Use allowlists, not blocklists

### 2. Authorization
- ✅ Verify ownership for every resource access
- ✅ Use middleware for common checks
- ✅ Never trust client-provided IDs without verification
- ✅ Implement role-based and resource-based access control

### 3. Trust Boundaries
- ✅ Never trust client input (body, query, params, headers)
- ✅ Always validate at the server boundary
- ✅ Use server-side environment detection
- ✅ Verify all external data before use

### 4. Security Headers
- ✅ Use helmet.js (already implemented)
- ✅ Configure CORS properly (already implemented)
- ✅ Set proper cookie security flags
- ✅ Implement CSP (Content Security Policy)

### 5. Monitoring & Logging
- ✅ Log all authentication attempts
- ✅ Log authorization failures
- ✅ Alert on suspicious patterns
- ✅ Regular security audits

---

## TESTING RECOMMENDATIONS

### Security Test Suite

```javascript
describe('Trust Boundary Security', () => {
    describe('Mass Assignment Protection', () => {
        it('should reject attempts to modify protected fields', async () => {
            const response = await request(app)
                .put('/api/invoices/123')
                .send({
                    notes: 'Updated notes',  // Allowed
                    status: 'paid',          // Should be rejected
                    total: 1                 // Should be rejected
                });

            expect(response.status).toBe(200);
            expect(response.body.invoice.status).not.toBe('paid');
            expect(response.body.invoice.total).not.toBe(1);
        });
    });

    describe('Role Assignment Protection', () => {
        it('should not allow role assignment during registration', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@test.com',
                    password: 'password123',
                    role: 'admin'  // Should be rejected
                });

            expect(response.status).toBe(201);
            const user = await User.findOne({ email: 'test@test.com' });
            expect(user.role).not.toBe('admin');
        });
    });

    describe('IP Spoofing Protection', () => {
        it('should not trust X-Forwarded-For in development', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .set('X-Forwarded-For', '192.168.1.100')
                .send();

            // Should use actual connection IP, not header
        });
    });
});
```

---

## CONCLUSION

The traf3li-backend application has **severe trust boundary violations** that must be addressed immediately. The most critical issue is the ability for clients to assign their own roles during registration, which allows complete system compromise.

All client input must be treated as untrusted and validated at the server boundary. Implement the recommendations in this report to establish proper trust boundaries and defense-in-depth security controls.

**Estimated Remediation Time:**
- Critical fixes: 2-3 days
- High priority fixes: 1 week
- Medium priority fixes: 2-4 weeks
- Complete security hardening: 1-2 months

**Next Steps:**
1. Fix critical role assignment vulnerability immediately
2. Implement input validation library (Joi)
3. Audit and fix all mass assignment vulnerabilities
4. Configure proper trust proxy settings
5. Implement comprehensive security test suite
6. Regular security audits and penetration testing

---

**Report End**

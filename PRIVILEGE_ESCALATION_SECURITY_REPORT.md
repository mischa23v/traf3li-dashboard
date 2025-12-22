# PRIVILEGE ESCALATION VULNERABILITY REPORT
**traf3li-backend Security Audit**
**Scan Date:** 2025-12-22
**Audit Type:** Privilege Escalation & Authorization Bypass
**Overall Risk:** 🔴 **CRITICAL**

---

## EXECUTIVE SUMMARY

The traf3li-backend application contains **CRITICAL** privilege escalation vulnerabilities that allow:
- ✅ **Vertical Escalation:** Regular users can elevate themselves to admin role
- ✅ **Horizontal Escalation:** Users can access and modify other users' data
- ✅ **Firm Boundary Violations:** Unauthorized firm membership management
- ✅ **Direct Object Reference:** Missing ownership validation on resources
- ✅ **Authorization Bypass:** Middleware misconfiguration renders RBAC ineffective

**Impact:** Complete compromise of authorization model, data breach, system takeover.

---

## CRITICAL VULNERABILITIES

### 🔴 CVE-001: VERTICAL PRIVILEGE ESCALATION - SELF-REGISTRATION AS ADMIN

**Severity:** CRITICAL
**CWE:** CWE-269 (Improper Privilege Management)
**CVSS Score:** 9.8 (Critical)

**Location:**
```
File: /src/controllers/auth.controller.js
Lines: 9-46
Endpoint: POST /api/auth/register
```

**Vulnerability:**
The registration endpoint accepts `role` parameter directly from user input without validation or sanitization.

**Code:**
```javascript
// Line 10: Accepts role from request body
const { username, email, phone, password, image, isSeller, description, role, country } = request.body;

// Line 24: Sets role without validation
role: role || (isSeller ? 'lawyer' : 'client')
```

**Attack Scenario:**
```bash
# Attacker registers as admin
curl -X POST https://api.traf3li.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "hacker",
    "email": "hacker@evil.com",
    "password": "password123",
    "phone": "+966501234567",
    "country": "Saudi Arabia",
    "role": "admin"  # ⚠️ ESCALATE TO ADMIN
  }'

# Result: User is now admin with full system access
```

**Impact:**
- ✅ Immediate admin access without approval
- ✅ Bypass all authorization checks
- ✅ Access to all user data, cases, payments
- ✅ Ability to delete users, modify system settings
- ✅ Complete system compromise

**Proof of Concept:**
```javascript
// 1. Register as admin
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'evil_admin',
    email: 'admin@attacker.com',
    password: 'Password123!',
    phone: '+966500000000',
    country: 'Saudi Arabia',
    role: 'admin'  // ⚠️ Self-assigned admin role
  })
});

// 2. Login as admin
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    username: 'evil_admin',
    password: 'Password123!'
  })
});

// 3. Access admin-only resources (if they exist)
// Now has full admin privileges
```

**Remediation:**
```javascript
// ✅ FIXED VERSION
const authRegister = async (request, response) => {
    const { username, email, phone, password, image, isSeller, description, country } = request.body;

    try {
        const hash = bcrypt.hashSync(password, saltRounds);

        // ✅ NEVER accept role from user input
        const user = new User({
            username,
            email,
            password: hash,
            image,
            country: country || 'Saudi Arabia',
            description,
            isSeller,
            phone,
            // ✅ Hardcoded role assignment - admin can only be set via database
            role: isSeller ? 'lawyer' : 'client'
        });

        await user.save();

        return response.status(201).send({
            error: false,
            message: 'New user created!'
        });
    }
    catch({message}) {
        // ... error handling
    }
}
```

---

### 🔴 CVE-002: VERTICAL PRIVILEGE ESCALATION - ROLE MODIFICATION VIA PROFILE UPDATE

**Severity:** CRITICAL
**CWE:** CWE-915 (Improperly Controlled Modification of Dynamically-Determined Object Attributes)
**CVSS Score:** 9.1 (Critical)

**Location:**
```
File: /src/controllers/user.controller.js
Lines: 242-266
Endpoint: PATCH /api/users/:id
```

**Vulnerability:**
The `updateUserProfile` function uses `$set: request.body`, allowing users to modify ANY field including their role.

**Code:**
```javascript
// Line 246: Basic ownership check exists
if (request.userID !== _id) {
    throw CustomException('You can only update your own profile!', 403);
}

// Line 250-253: CRITICAL - No field whitelisting!
const updatedUser = await User.findByIdAndUpdate(
    _id,
    { $set: request.body },  // ⚠️ ACCEPTS ALL FIELDS
    { new: true }
).select('-password');
```

**Attack Scenario:**
```bash
# Attacker updates their own profile to become admin
curl -X PATCH https://api.traf3li.com/users/USER_ID \
  -H "Cookie: accessToken=USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"  # ⚠️ UPGRADE TO ADMIN
  }'

# Alternative: Modify other sensitive fields
curl -X PATCH https://api.traf3li.com/users/USER_ID \
  -H "Cookie: accessToken=USER_JWT_TOKEN" \
  -d '{
    "lawyerProfile.verified": true,  # Self-verify as lawyer
    "lawyerProfile.rating": 5.0,     # Boost rating
    "lawyerProfile.casesWon": 1000   # Fake credentials
  }'
```

**Impact:**
- ✅ Self-elevation to admin role
- ✅ Self-verification as lawyer
- ✅ Manipulation of ratings and statistics
- ✅ Bypass approval workflows

**Proof of Concept:**
```javascript
// 1. User logs in as regular client
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    username: 'normal_user',
    password: 'password'
  })
});

// 2. Update own profile to admin
const userId = loginRes.data.user._id;
const escalateRes = await fetch(`/api/users/${userId}`, {
  method: 'PATCH',
  headers: { 'Cookie': `accessToken=${accessToken}` },
  body: JSON.stringify({
    role: 'admin',  // ⚠️ ESCALATE!
    'lawyerProfile.verified': true,
    'lawyerProfile.rating': 5.0
  })
});

// 3. Now has admin privileges
```

**Remediation:**
```javascript
// ✅ FIXED VERSION
const updateUserProfile = async (request, response) => {
    const { _id } = request.params;

    try {
        if (request.userID !== _id) {
            throw CustomException('You can only update your own profile!', 403);
        }

        // ✅ Whitelist allowed fields
        const allowedFields = [
            'username',
            'email',
            'phone',
            'image',
            'description',
            'country',
            'lawyerProfile.languages',
            'lawyerProfile.specialization'
        ];

        // ✅ Filter request body to only allowed fields
        const updateData = {};
        allowedFields.forEach(field => {
            if (request.body[field] !== undefined) {
                updateData[field] = request.body[field];
            }
        });

        // ✅ PROTECTED fields that users CANNOT modify
        // - role (only admin can change)
        // - lawyerProfile.verified (only admin can verify)
        // - lawyerProfile.rating (calculated from reviews)
        // - lawyerProfile.firmID (managed via firm endpoints)

        const updatedUser = await User.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        return response.send({
            error: false,
            user: updatedUser
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};
```

---

### 🔴 CVE-003: HORIZONTAL PRIVILEGE ESCALATION - UNAUTHORIZED FIRM LAWYER MANAGEMENT

**Severity:** CRITICAL
**CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key)
**CVSS Score:** 8.8 (High)

**Location:**
```
File: /src/controllers/firm.controller.js
Lines: 119-143 (addLawyer)
Lines: 146-172 (removeLawyer)
Endpoints:
  - POST /api/firms/lawyer/add
  - POST /api/firms/lawyer/remove
```

**Vulnerability:**
The `addLawyer` and `removeLawyer` functions have **ZERO** authorization checks. ANY authenticated user can add/remove ANY lawyer to/from ANY firm.

**Code - addLawyer:**
```javascript
const addLawyer = async (request, response) => {
    const { firmId, lawyerId } = request.body;
    try {
        // ⚠️ NO AUTHORIZATION CHECK!
        // ⚠️ No check if requester owns the firm
        // ⚠️ No check if requester is admin

        const firm = await Firm.findByIdAndUpdate(
            firmId,
            { $addToSet: { lawyers: lawyerId } },
            { new: true }
        );

        // Update lawyer profile with firm reference
        await User.findByIdAndUpdate(lawyerId, {
            'lawyerProfile.firmID': firmId
        });

        return response.status(202).send({
            error: false,
            message: 'Lawyer added to firm!',
            firm
        });
    } catch ({ message, status = 500 }) {
        // ...
    }
};
```

**Code - removeLawyer:**
```javascript
const removeLawyer = async (request, response) => {
    const { firmId, lawyerId } = request.body;
    try {
        // ⚠️ NO AUTHORIZATION CHECK!

        const firm = await Firm.findByIdAndUpdate(
            firmId,
            { $pull: { lawyers: lawyerId } },
            { new: true }
        );

        // Remove firm reference from lawyer profile
        await User.findByIdAndUpdate(lawyerId, {
            'lawyerProfile.firmID': null
        });

        return response.status(202).send({
            error: false,
            message: 'Lawyer removed from firm!',
            firm
        });
    } catch ({ message, status = 500 }) {
        // ...
    }
};
```

**Attack Scenarios:**

**Scenario 1: Self-Addition to Prestigious Firm**
```bash
# Attacker adds themselves to top-rated firm
curl -X POST https://api.traf3li.com/firms/lawyer/add \
  -H "Cookie: accessToken=ATTACKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firmId": "TOP_FIRM_ID",
    "lawyerId": "ATTACKER_USER_ID"
  }'

# Result: Attacker now appears as member of prestigious firm
# - Gains firm's reputation
# - Access to firm's clients
# - Appears in firm's lawyer listings
```

**Scenario 2: Removal of Competitors**
```bash
# Attacker removes competitors from their firm
curl -X POST https://api.traf3li.com/firms/lawyer/remove \
  -H "Cookie: accessToken=ATTACKER_TOKEN" \
  -d '{
    "firmId": "TARGET_FIRM_ID",
    "lawyerId": "COMPETITOR_USER_ID"
  }'

# Result: Competitor is removed from their own firm
```

**Scenario 3: Firm Sabotage**
```bash
# Attacker removes ALL lawyers from a firm
# Loop through all lawyers in firm and remove them

for lawyerId in FIRM_LAWYERS:
    curl -X POST https://api.traf3li.com/firms/lawyer/remove \
      -d '{"firmId": "TARGET_FIRM", "lawyerId": "' + lawyerId + '"}'

# Result: Firm is now empty, business disrupted
```

**Impact:**
- ✅ Unauthorized firm membership
- ✅ Reputation theft
- ✅ Access to firm resources
- ✅ Removal of legitimate lawyers
- ✅ Business disruption
- ✅ Firm boundary violations

**Remediation:**
```javascript
// ✅ FIXED VERSION - addLawyer
const addLawyer = async (request, response) => {
    const { firmId, lawyerId } = request.body;
    try {
        const firm = await Firm.findById(firmId);

        if (!firm) {
            throw CustomException('Firm not found!', 404);
        }

        // ✅ AUTHORIZATION CHECK: Only firm members or admin can add lawyers
        const requesterIsAdmin = request.user.role === 'admin';
        const requesterIsFirmMember = firm.lawyers.some(
            lawyer => lawyer.toString() === request.userID
        );

        if (!requesterIsAdmin && !requesterIsFirmMember) {
            throw CustomException('You are not authorized to add lawyers to this firm!', 403);
        }

        // ✅ Verify the lawyer exists and is actually a lawyer
        const lawyer = await User.findById(lawyerId);
        if (!lawyer) {
            throw CustomException('Lawyer not found!', 404);
        }
        if (lawyer.role !== 'lawyer') {
            throw CustomException('User is not a lawyer!', 400);
        }

        // ✅ Optional: Require lawyer's approval (invitation system)
        // await FirmInvitation.create({ firmId, lawyerId, invitedBy: request.userID });

        const updatedFirm = await Firm.findByIdAndUpdate(
            firmId,
            { $addToSet: { lawyers: lawyerId } },
            { new: true }
        );

        await User.findByIdAndUpdate(lawyerId, {
            'lawyerProfile.firmID': firmId
        });

        return response.status(202).send({
            error: false,
            message: 'Lawyer added to firm!',
            firm: updatedFirm
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

// ✅ FIXED VERSION - removeLawyer
const removeLawyer = async (request, response) => {
    const { firmId, lawyerId } = request.body;
    try {
        const firm = await Firm.findById(firmId);

        if (!firm) {
            throw CustomException('Firm not found!', 404);
        }

        // ✅ AUTHORIZATION CHECK
        const requesterIsAdmin = request.user.role === 'admin';
        const requesterIsFirmMember = firm.lawyers.some(
            lawyer => lawyer.toString() === request.userID
        );
        const requesterIsSelf = request.userID === lawyerId;

        // Only admin, firm members, or the lawyer themselves can remove
        if (!requesterIsAdmin && !requesterIsFirmMember && !requesterIsSelf) {
            throw CustomException('You are not authorized to remove lawyers from this firm!', 403);
        }

        const updatedFirm = await Firm.findByIdAndUpdate(
            firmId,
            { $pull: { lawyers: lawyerId } },
            { new: true }
        );

        await User.findByIdAndUpdate(lawyerId, {
            'lawyerProfile.firmID': null
        });

        return response.status(202).send({
            error: false,
            message: 'Lawyer removed from firm!',
            firm: updatedFirm
        });
    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};
```

---

### 🟠 CVE-004: AUTHORIZATION MIDDLEWARE MISMATCH

**Severity:** HIGH
**CWE:** CWE-862 (Missing Authorization)
**CVSS Score:** 7.5 (High)

**Location:**
```
File: /src/middlewares/authenticate.js (sets req.userID)
File: /src/middlewares/authorize.middleware.js (expects req.user)
```

**Vulnerability:**
The authentication middleware sets `req.userID` but the authorization middleware expects `req.user` with role information. This mismatch means authorization checks will FAIL if attempted.

**Code - authenticate.js:**
```javascript
const authenticate = (request, response, next) => {
    const { accessToken } = request.cookies;
    try {
        if (!accessToken) {
            throw CustomException('Access denied!', 401);
        }
        const verification = jwt.verify(accessToken, process.env.JWT_SECRET);
        if(verification) {
            request.userID = verification._id;  // ⚠️ Sets userID only
            return next();
        }
        throw CustomException('Access denied!', 401);
    }
    catch({ message, status = 500 }) {
        // ...
    }
}
```

**Code - authorize.middleware.js:**
```javascript
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user exists (should be set by authenticate middleware)
      if (!req.user) {  // ⚠️ Expects req.user, but authenticate sets req.userID
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - Authentication required',
        });
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {  // ⚠️ req.user.role doesn't exist
        return res.status(403).json({
          success: false,
          error: 'Forbidden - Insufficient permissions',
        });
      }

      next();
    } catch (error) {
      // ...
    }
  };
};
```

**Impact:**
- ✅ Authorization middleware cannot function
- ✅ All role-based checks are broken
- ✅ Routes using `authorize()` will always fail

**Current State:**
Looking at routes, **NONE** of them use the `authorize()` middleware! All routes only use `userMiddleware` (authentication), meaning there's NO role-based access control anywhere.

**Remediation:**
```javascript
// ✅ OPTION 1: Update authenticate to populate req.user
const authenticate = async (request, response, next) => {
    const { accessToken } = request.cookies;
    try {
        if (!accessToken) {
            throw CustomException('Access denied!', 401);
        }

        const verification = jwt.verify(accessToken, process.env.JWT_SECRET);

        if(verification) {
            // ✅ Fetch full user object with role
            const user = await User.findById(verification._id).select('-password');

            if (!user) {
                throw CustomException('User not found!', 401);
            }

            request.userID = verification._id;
            request.user = user;  // ✅ Set req.user for authorization

            return next();
        }

        throw CustomException('Access denied!', 401);
    }
    catch({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        })
    }
}

// ✅ OPTION 2: Update authorize to work with req.userID
const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.userID) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - Authentication required',
        });
      }

      // ✅ Fetch user if not already populated
      if (!req.user) {
        req.user = await User.findById(req.userID).select('-password');
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
        });
      }

      // Check role
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden - Insufficient permissions',
          required: allowedRoles,
          current: req.user.role,
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Authorization check failed',
      });
    }
  };
};
```

---

### 🟠 CVE-005: MISSING ROLE-BASED ACCESS CONTROL ON ROUTES

**Severity:** HIGH
**CWE:** CWE-862 (Missing Authorization)
**CVSS Score:** 7.5 (High)

**Location:**
```
All route files in /src/routes/
```

**Vulnerability:**
**ZERO** routes implement role-based access control. All routes only check authentication (valid JWT), not authorization (role/permissions).

**Examples:**

**user.route.js:**
```javascript
// Update user profile (protected - must be own profile)
app.patch('/:_id', userMiddleware, updateUserProfile);
// ⚠️ Missing: authorize('admin') for updating other users
// ⚠️ Missing: authorize('admin') for role changes

// Delete user account (protected - must be own account)
app.delete('/:_id', userMiddleware, deleteUser);
// ⚠️ Missing: authorize('admin') for deleting other users
```

**firm.route.js:**
```javascript
// Create firm
app.post('/', userMiddleware, createFirm);
// ⚠️ Missing: authorize('lawyer') - only lawyers should create firms

// Update firm
app.patch('/:_id', userMiddleware, updateFirm);
// ⚠️ Has internal check but should use middleware

// Add lawyer to firm
app.post('/lawyer/add', userMiddleware, addLawyer);
// ⚠️ CRITICAL: No authorization - CVE-003

// Remove lawyer from firm
app.post('/lawyer/remove', userMiddleware, removeLawyer);
// ⚠️ CRITICAL: No authorization - CVE-003
```

**case.route.js:**
```javascript
// All case routes only check authentication
app.post('/', userMiddleware, createCase);
app.get('/', userMiddleware, getCases);
app.get('/:_id', userMiddleware, getCase);
app.patch('/:_id', userMiddleware, updateCase);
// ⚠️ Missing role checks - rely only on controller logic
```

**Impact:**
- ✅ No defense in depth
- ✅ Authorization logic scattered in controllers
- ✅ Easy to miss authorization checks
- ✅ Inconsistent security

**Remediation:**
```javascript
// ✅ FIXED VERSION - user.route.js
const express = require('express');
const { authenticate } = require('../middlewares');
const { authorize, requireAdmin } = require('../middlewares/authorize.middleware');
const { checkOwnership } = require('../middlewares/checkOwnership.middleware');
const {
    getUserProfile,
    getLawyerProfile,
    getLawyers,
    updateUserProfile,
    deleteUser
} = require('../controllers/user.controller');

const app = express.Router();

// Get all lawyers with filters (public - no auth required)
app.get('/lawyers', getLawyers);

// Get user profile (public - no auth required)
app.get('/:_id', getUserProfile);

// Get comprehensive lawyer profile (public - no auth required)
app.get('/lawyer/:username', getLawyerProfile);

// Update user profile
app.patch('/:_id',
    authenticate,  // ✅ Must be logged in
    checkOwnership('User'),  // ✅ Must own the profile OR be admin
    updateUserProfile
);

// Delete user account
app.delete('/:_id',
    authenticate,
    checkOwnership('User'),  // ✅ Must own the account OR be admin
    deleteUser
);

module.exports = app;

// ✅ FIXED VERSION - firm.route.js
const express = require('express');
const { authenticate } = require('../middlewares');
const { authorize, requireLawyerOrAdmin } = require('../middlewares/authorize.middleware');
const {
    createFirm,
    getFirms,
    getFirm,
    updateFirm,
    addLawyer,
    removeLawyer
} = require('../controllers/firm.controller');

const app = express.Router();

// Create firm - only lawyers
app.post('/',
    authenticate,
    authorize('lawyer', 'admin'),  // ✅ Only lawyers or admin
    createFirm
);

// Get all firms (public)
app.get('/', getFirms);

// Get single firm (public)
app.get('/:_id', getFirm);

// Update firm - must be firm member or admin
app.patch('/:_id',
    authenticate,
    updateFirm  // Has internal authorization
);

// Add lawyer to firm - must be firm member or admin
app.post('/lawyer/add',
    authenticate,
    authorize('lawyer', 'admin'),  // ✅ Only lawyers or admin
    addLawyer  // Controller will check firm membership
);

// Remove lawyer from firm - must be firm member, self, or admin
app.post('/lawyer/remove',
    authenticate,
    authorize('lawyer', 'admin'),  // ✅ Only lawyers or admin
    removeLawyer  // Controller will check firm membership or self
);

module.exports = app;

// ✅ FIXED VERSION - case.route.js
const express = require('express');
const { authenticate } = require('../middlewares');
const { authorize } = require('../middlewares/authorize.middleware');
const { checkCaseAccess } = require('../middlewares/checkOwnership.middleware');
const {
    createCase,
    getCases,
    getCase,
    updateCase,
    addNote,
    addDocument,
    addHearing,
    updateStatus,
    updateOutcome
} = require('../controllers/case.controller');

const app = express.Router();

// Create case - lawyers only
app.post('/',
    authenticate,
    authorize('lawyer', 'admin'),  // ✅ Only lawyers can create cases
    createCase
);

// Get all cases - must be lawyer or client
app.get('/',
    authenticate,
    authorize('lawyer', 'client', 'admin'),  // ✅ Role-based access
    getCases
);

// Get single case - must have access
app.get('/:_id',
    authenticate,
    checkCaseAccess(),  // ✅ Verify ownership
    getCase
);

// Update case - lawyer only
app.patch('/:_id',
    authenticate,
    checkCaseAccess(),
    authorize('lawyer', 'admin'),  // ✅ Additional role check
    updateCase
);

// Add note - lawyer only
app.post('/:_id/note',
    authenticate,
    checkCaseAccess(),
    authorize('lawyer', 'admin'),
    addNote
);

// Add document - lawyer or client
app.post('/:_id/document',
    authenticate,
    checkCaseAccess(),
    addDocument
);

// Add hearing - lawyer only
app.post('/:_id/hearing',
    authenticate,
    checkCaseAccess(),
    authorize('lawyer', 'admin'),
    addHearing
);

// Update status - lawyer only
app.patch('/:_id/status',
    authenticate,
    checkCaseAccess(),
    authorize('lawyer', 'admin'),
    updateStatus
);

// Update outcome - lawyer only
app.patch('/:_id/outcome',
    authenticate,
    checkCaseAccess(),
    authorize('lawyer', 'admin'),
    updateOutcome
);

module.exports = app;
```

---

## ADDITIONAL FINDINGS

### 🟡 LOW: Case Access Control Relies on Controller Logic

**Location:** `/src/controllers/case.controller.js`

**Issue:** Case access control is implemented in controllers, not middleware. While this works, it lacks defense in depth.

**Example:**
```javascript
// getCases - Line 92-117
const filters = {
    $or: [{ lawyerId: request.userID }, { clientId: request.userID }],
    // ✅ Good: Filters by ownership
};

// getCase - Line 132-138
const isLawyer = caseDoc.lawyerId._id.toString() === request.userID;
const isClient = caseDoc.clientId && caseDoc.clientId._id.toString() === request.userID;

if (!isLawyer && !isClient) {
    throw CustomException('You do not have access to this case!', 403);
}
// ✅ Good: Manual ownership check
```

**Recommendation:** Move to `checkCaseAccess()` middleware for consistency.

---

### 🟡 MEDIUM: Missing Firm Boundary on Case Queries

**Location:** `/src/controllers/case.controller.js`

**Issue:** Lawyers can see ALL cases they're assigned to, but no filtering by firm. If a lawyer belongs to a firm, they might want to see only firm cases or have firm-level case management.

**Current Code:**
```javascript
// getCases - Line 95
const filters = {
    $or: [{ lawyerId: request.userID }, { clientId: request.userID }],
    // ⚠️ No firm-level filtering
};
```

**Recommendation:**
```javascript
// Add optional firm filtering
const filters = {
    $or: [{ lawyerId: request.userID }, { clientId: request.userID }],
};

// If user is in a firm and wants firm cases
if (request.query.firmOnly && request.user.lawyerProfile?.firmID) {
    // Get all lawyers in same firm
    const firmLawyers = await User.find({
        'lawyerProfile.firmID': request.user.lawyerProfile.firmID
    }).select('_id');

    const firmLawyerIds = firmLawyers.map(l => l._id);

    filters.$or = [
        { lawyerId: { $in: firmLawyerIds } },
        { clientId: request.userID }
    ];
}
```

---

## COMPREHENSIVE REMEDIATION PLAN

### Phase 1: IMMEDIATE (Critical Fixes - Deploy Within 24 Hours)

#### 1.1 Fix Registration Endpoint
```javascript
// ✅ Remove role parameter from registration
// File: src/controllers/auth.controller.js

const authRegister = async (request, response) => {
    // Remove 'role' from destructuring
    const { username, email, phone, password, image, isSeller, description, country } = request.body;

    const user = new User({
        username,
        email,
        password: hash,
        image,
        country: country || 'Saudi Arabia',
        description,
        isSeller,
        phone,
        role: isSeller ? 'lawyer' : 'client'  // ✅ Hardcoded only
    });

    await user.save();
};
```

#### 1.2 Fix Profile Update Endpoint
```javascript
// ✅ Whitelist allowed fields
// File: src/controllers/user.controller.js

const updateUserProfile = async (request, response) => {
    const { _id } = request.params;

    if (request.userID !== _id) {
        throw CustomException('You can only update your own profile!', 403);
    }

    // ✅ Only allow these fields
    const allowedFields = [
        'username', 'email', 'phone', 'image',
        'description', 'country',
        'lawyerProfile.languages',
        'lawyerProfile.specialization'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
        if (request.body[field] !== undefined) {
            updateData[field] = request.body[field];
        }
    });

    const updatedUser = await User.findByIdAndUpdate(
        _id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select('-password');

    return response.send({ error: false, user: updatedUser });
};
```

#### 1.3 Fix Firm Lawyer Management
```javascript
// ✅ Add authorization to addLawyer and removeLawyer
// File: src/controllers/firm.controller.js

const addLawyer = async (request, response) => {
    const { firmId, lawyerId } = request.body;

    const firm = await Firm.findById(firmId);
    if (!firm) {
        throw CustomException('Firm not found!', 404);
    }

    // ✅ AUTHORIZATION: Must be firm member or admin
    const user = await User.findById(request.userID);
    const isAdmin = user.role === 'admin';
    const isFirmMember = firm.lawyers.some(l => l.toString() === request.userID);

    if (!isAdmin && !isFirmMember) {
        throw CustomException('Not authorized!', 403);
    }

    // Verify lawyer exists and is lawyer role
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== 'lawyer') {
        throw CustomException('Invalid lawyer!', 400);
    }

    const updatedFirm = await Firm.findByIdAndUpdate(
        firmId,
        { $addToSet: { lawyers: lawyerId } },
        { new: true }
    );

    await User.findByIdAndUpdate(lawyerId, {
        'lawyerProfile.firmID': firmId
    });

    return response.status(202).send({
        error: false,
        message: 'Lawyer added to firm!',
        firm: updatedFirm
    });
};

const removeLawyer = async (request, response) => {
    const { firmId, lawyerId } = request.body;

    const firm = await Firm.findById(firmId);
    if (!firm) {
        throw CustomException('Firm not found!', 404);
    }

    // ✅ AUTHORIZATION: Must be firm member, self, or admin
    const user = await User.findById(request.userID);
    const isAdmin = user.role === 'admin';
    const isFirmMember = firm.lawyers.some(l => l.toString() === request.userID);
    const isSelf = request.userID === lawyerId;

    if (!isAdmin && !isFirmMember && !isSelf) {
        throw CustomException('Not authorized!', 403);
    }

    const updatedFirm = await Firm.findByIdAndUpdate(
        firmId,
        { $pull: { lawyers: lawyerId } },
        { new: true }
    );

    await User.findByIdAndUpdate(lawyerId, {
        'lawyerProfile.firmID': null
    });

    return response.status(202).send({
        error: false,
        message: 'Lawyer removed from firm!',
        firm: updatedFirm
    });
};
```

### Phase 2: SHORT-TERM (Within 1 Week)

#### 2.1 Fix Middleware Mismatch
```javascript
// ✅ Update authenticate to populate req.user
// File: src/middlewares/authenticate.js

const { User } = require('../models');

const authenticate = async (request, response, next) => {
    const { accessToken } = request.cookies;

    try {
        if (!accessToken) {
            throw CustomException('Access denied!', 401);
        }

        const verification = jwt.verify(accessToken, process.env.JWT_SECRET);

        if (verification) {
            // ✅ Fetch full user with role
            const user = await User.findById(verification._id)
                .select('-password')
                .lean();

            if (!user) {
                throw CustomException('User not found!', 401);
            }

            // Check if account is active
            if (user.status === 'suspended' || user.status === 'banned') {
                throw CustomException('Account suspended!', 403);
            }

            request.userID = verification._id;
            request.user = user;  // ✅ Set req.user
            request.isSeller = user.isSeller;

            return next();
        }

        throw CustomException('Access denied!', 401);
    }
    catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};
```

#### 2.2 Apply Authorization Middleware to Routes

Update ALL route files to use proper authorization:

**src/routes/user.route.js:**
```javascript
const { authorize, requireAdmin } = require('../middlewares/authorize.middleware');
const { checkOwnership } = require('../middlewares/checkOwnership.middleware');

// Update user profile
app.patch('/:_id', authenticate, checkOwnership('User'), updateUserProfile);

// Delete user
app.delete('/:_id', authenticate, checkOwnership('User'), deleteUser);
```

**src/routes/firm.route.js:**
```javascript
const { authorize } = require('../middlewares/authorize.middleware');

// Create firm - lawyers only
app.post('/', authenticate, authorize('lawyer', 'admin'), createFirm);

// Add/remove lawyers
app.post('/lawyer/add', authenticate, authorize('lawyer', 'admin'), addLawyer);
app.post('/lawyer/remove', authenticate, authorize('lawyer', 'admin'), removeLawyer);
```

**src/routes/case.route.js:**
```javascript
const { authorize } = require('../middlewares/authorize.middleware');
const { checkCaseAccess } = require('../middlewares/checkOwnership.middleware');

// Create case - lawyers only
app.post('/', authenticate, authorize('lawyer', 'admin'), createCase);

// Get/update cases - with access check
app.get('/:_id', authenticate, checkCaseAccess(), getCase);
app.patch('/:_id', authenticate, checkCaseAccess(), authorize('lawyer', 'admin'), updateCase);
```

### Phase 3: LONG-TERM (Within 1 Month)

#### 3.1 Implement Admin Management System

Create dedicated admin endpoints with proper RBAC:

```javascript
// src/routes/admin.route.js
const express = require('express');
const { authenticate } = require('../middlewares');
const { requireAdmin } = require('../middlewares/authorize.middleware');
const {
    getAllUsers,
    updateUserRole,
    verifyLawyer,
    suspendUser,
    deleteUser
} = require('../controllers/admin.controller');

const app = express.Router();

// ✅ ALL admin routes require admin role
app.use(authenticate, requireAdmin());

// User management
app.get('/users', getAllUsers);
app.patch('/users/:id/role', updateUserRole);
app.patch('/users/:id/verify', verifyLawyer);
app.patch('/users/:id/suspend', suspendUser);
app.delete('/users/:id', deleteUser);

module.exports = app;
```

```javascript
// src/controllers/admin.controller.js
const { User, AuditLog } = require('../models');

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['client', 'lawyer', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
    ).select('-password');

    // ✅ Audit log
    await AuditLog.create({
        action: 'ROLE_CHANGE',
        adminId: req.userID,
        targetUserId: id,
        oldValue: user.role,
        newValue: role,
        ipAddress: req.ip
    });

    res.json({ success: true, user });
};

const verifyLawyer = async (req, res) => {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
        id,
        { 'lawyerProfile.verified': true },
        { new: true }
    ).select('-password');

    // ✅ Audit log
    await AuditLog.create({
        action: 'LAWYER_VERIFIED',
        adminId: req.userID,
        targetUserId: id,
        ipAddress: req.ip
    });

    res.json({ success: true, user });
};
```

#### 3.2 Implement Audit Logging

Create comprehensive audit logs for privileged actions:

```javascript
// src/models/auditLog.model.js
const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'ROLE_CHANGE',
            'LAWYER_VERIFIED',
            'USER_SUSPENDED',
            'USER_DELETED',
            'FIRM_MEMBERSHIP_CHANGE',
            'PROFILE_UPDATED'
        ]
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

#### 3.3 Implement Rate Limiting on Sensitive Endpoints

```javascript
// src/middlewares/rateLimiter.middleware.js
const rateLimit = require('express-rate-limit');

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Moderate rate limiting for profile updates
const profileUpdateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 updates per hour
    skipSuccessfulRequests: false
});

module.exports = {
    authLimiter,
    profileUpdateLimiter
};
```

Apply to routes:
```javascript
// src/routes/auth.route.js
const { authLimiter } = require('../middlewares/rateLimiter.middleware');

app.post('/register', authLimiter, authRegister);
app.post('/login', authLimiter, authLogin);

// src/routes/user.route.js
const { profileUpdateLimiter } = require('../middlewares/rateLimiter.middleware');

app.patch('/:_id', authenticate, checkOwnership('User'), profileUpdateLimiter, updateUserProfile);
```

---

## TESTING RECOMMENDATIONS

### Security Testing Checklist

#### Test 1: Verify Registration Role Restriction
```bash
# ❌ Should FAIL: Cannot register as admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_admin",
    "email": "test@test.com",
    "password": "Password123!",
    "phone": "+966500000000",
    "country": "Saudi Arabia",
    "role": "admin"
  }'

# ✅ Should create user as 'client' not 'admin'
# Verify: GET /api/auth/me should show role: 'client'
```

#### Test 2: Verify Profile Update Field Restriction
```bash
# ❌ Should FAIL: Cannot update role
curl -X PATCH http://localhost:3000/api/users/USER_ID \
  -H "Cookie: accessToken=TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin",
    "lawyerProfile.verified": true
  }'

# ✅ Role should remain unchanged
# ✅ Only whitelisted fields should update
```

#### Test 3: Verify Firm Authorization
```bash
# ❌ Should FAIL: Non-member cannot add lawyer
curl -X POST http://localhost:3000/api/firms/lawyer/add \
  -H "Cookie: accessToken=NON_MEMBER_TOKEN" \
  -d '{
    "firmId": "FIRM_ID",
    "lawyerId": "ATTACKER_ID"
  }'

# Expected: 403 Forbidden
```

#### Test 4: Verify Case Access Control
```bash
# ❌ Should FAIL: User A cannot access User B's case
curl -X GET http://localhost:3000/api/cases/USER_B_CASE_ID \
  -H "Cookie: accessToken=USER_A_TOKEN"

# Expected: 403 Forbidden
```

#### Test 5: Verify Role-Based Route Access
```bash
# ❌ Should FAIL: Client cannot create case
curl -X POST http://localhost:3000/api/cases \
  -H "Cookie: accessToken=CLIENT_TOKEN" \
  -d '{
    "title": "Test Case",
    "description": "Test"
  }'

# Expected: 403 Forbidden - Only lawyers can create cases
```

### Automated Testing

```javascript
// test/security/privilege-escalation.test.js
describe('Privilege Escalation Prevention', () => {
    describe('Registration', () => {
        it('should NOT allow self-registration as admin', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'hacker',
                    email: 'hacker@test.com',
                    password: 'Password123!',
                    phone: '+966500000000',
                    country: 'Saudi Arabia',
                    role: 'admin'  // Attempting escalation
                });

            expect(res.status).toBe(201);

            // Verify role is NOT admin
            const user = await User.findOne({ email: 'hacker@test.com' });
            expect(user.role).not.toBe('admin');
            expect(user.role).toBe('client');
        });
    });

    describe('Profile Update', () => {
        it('should NOT allow role modification via profile update', async () => {
            const user = await createTestUser({ role: 'client' });
            const token = generateToken(user);

            const res = await request(app)
                .patch(`/api/users/${user._id}`)
                .set('Cookie', `accessToken=${token}`)
                .send({ role: 'admin' });

            const updatedUser = await User.findById(user._id);
            expect(updatedUser.role).toBe('client');
            expect(updatedUser.role).not.toBe('admin');
        });
    });

    describe('Firm Management', () => {
        it('should NOT allow non-members to add lawyers', async () => {
            const firm = await createTestFirm();
            const attacker = await createTestUser({ role: 'client' });
            const token = generateToken(attacker);

            const res = await request(app)
                .post('/api/firms/lawyer/add')
                .set('Cookie', `accessToken=${token}`)
                .send({
                    firmId: firm._id,
                    lawyerId: attacker._id
                });

            expect(res.status).toBe(403);

            const updatedFirm = await Firm.findById(firm._id);
            expect(updatedFirm.lawyers).not.toContain(attacker._id);
        });
    });

    describe('Case Access', () => {
        it('should NOT allow access to other users cases', async () => {
            const lawyer = await createTestUser({ role: 'lawyer' });
            const client = await createTestUser({ role: 'client' });
            const attacker = await createTestUser({ role: 'client' });

            const caseDoc = await Case.create({
                lawyerId: lawyer._id,
                clientId: client._id,
                title: 'Test Case'
            });

            const attackerToken = generateToken(attacker);

            const res = await request(app)
                .get(`/api/cases/${caseDoc._id}`)
                .set('Cookie', `accessToken=${attackerToken}`);

            expect(res.status).toBe(403);
        });
    });
});
```

---

## CONCLUSION

The traf3li-backend application has **CRITICAL** privilege escalation vulnerabilities that must be addressed immediately:

### Critical Issues (Fix Within 24 Hours):
1. ✅ **CVE-001:** Self-registration as admin
2. ✅ **CVE-002:** Role modification via profile update
3. ✅ **CVE-003:** Unauthorized firm lawyer management

### High Priority Issues (Fix Within 1 Week):
4. ✅ **CVE-004:** Middleware mismatch breaking authorization
5. ✅ **CVE-005:** Missing RBAC on all routes

### Security Posture Score: 2/10 (Critical Risk)

**Immediate Actions Required:**
1. Deploy Phase 1 fixes immediately (registration, profile update, firm management)
2. Implement comprehensive testing (automated + manual)
3. Conduct code review of ALL controllers for similar patterns
4. Deploy Phase 2 fixes (middleware, route authorization)
5. Implement audit logging and monitoring
6. Regular security audits

---

## APPENDIX A: Attack Surface Summary

| Endpoint | Method | Current Auth | Missing Auth | Risk |
|----------|--------|--------------|--------------|------|
| `/auth/register` | POST | None | Role validation | CRITICAL |
| `/users/:id` | PATCH | userMiddleware | Field whitelisting | CRITICAL |
| `/firms/lawyer/add` | POST | userMiddleware | Firm membership check | CRITICAL |
| `/firms/lawyer/remove` | POST | userMiddleware | Firm membership check | CRITICAL |
| `/cases` | POST | userMiddleware | Role check (lawyer only) | HIGH |
| `/cases/:id` | GET | userMiddleware | Ownership check (middleware) | MEDIUM |
| `/invoices/:id` | PATCH | userMiddleware | Role check on controller | MEDIUM |
| `/payments/:id/refund` | POST | userMiddleware | Enhanced authorization | MEDIUM |

---

## APPENDIX B: RBAC Matrix

| Role | Permissions |
|------|-------------|
| **Client** | • View own profile<br>• Update own profile (limited fields)<br>• View own cases<br>• View own invoices<br>• Make payments<br>• Upload documents to own cases |
| **Lawyer** | • All client permissions<br>• Create cases<br>• Create gigs<br>• Create invoices<br>• Create/join firms<br>• View firm cases<br>• Update own cases |
| **Admin** | • All permissions<br>• Change user roles<br>• Verify lawyers<br>• Suspend/delete users<br>• View all data<br>• Manage any firm<br>• Access audit logs |

---

**Report Generated By:** Claude Code Security Scanner
**Scan Methodology:** Static code analysis + Pattern matching + Manual review
**Confidence Level:** High (Verified with code inspection)

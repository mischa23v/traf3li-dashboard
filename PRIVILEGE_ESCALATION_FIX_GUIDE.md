# PRIVILEGE ESCALATION - URGENT FIX IMPLEMENTATION GUIDE

**Repository:** traf3li-backend
**Priority:** 🔴 CRITICAL - Deploy within 24 hours
**Estimated Time:** 4-6 hours for Phase 1 fixes

---

## QUICK START - EMERGENCY FIXES (Deploy Today)

### Fix 1: Registration Endpoint (15 minutes)

**File:** `/src/controllers/auth.controller.js`

**Current Code (Lines 9-24):**
```javascript
const { username, email, phone, password, image, isSeller, description, role, country } = request.body;
// ...
role: role || (isSeller ? 'lawyer' : 'client')
```

**Fixed Code:**
```javascript
// ✅ Remove 'role' from destructuring - NEVER accept from user
const { username, email, phone, password, image, isSeller, description, country } = request.body;

try {
    const hash = bcrypt.hashSync(password, saltRounds);

    const user = new User({
        username,
        email,
        password: hash,
        image,
        country: country || 'Saudi Arabia',
        description,
        isSeller,
        phone,
        // ✅ Hardcoded role - admin can only be set via database
        role: isSeller ? 'lawyer' : 'client'
    });

    await user.save();

    return response.status(201).send({
        error: false,
        message: 'New user created!'
    });
}
```

**Test:**
```bash
# Should create user as 'client', NOT 'admin'
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@test.com",
    "password": "Password123!",
    "phone": "+966500000000",
    "country": "Saudi Arabia",
    "role": "admin"
  }'
```

---

### Fix 2: Profile Update Endpoint (30 minutes)

**File:** `/src/controllers/user.controller.js`

**Current Code (Lines 242-265):**
```javascript
const updatedUser = await User.findByIdAndUpdate(
    _id,
    { $set: request.body },  // ❌ Accepts ALL fields
    { new: true }
).select('-password');
```

**Fixed Code:**
```javascript
const updateUserProfile = async (request, response) => {
    const { _id } = request.params;

    try {
        // Existing ownership check
        if (request.userID !== _id) {
            throw CustomException('You can only update your own profile!', 403);
        }

        // ✅ Whitelist of allowed fields
        const allowedFields = [
            'username',
            'email',
            'phone',
            'image',
            'description',
            'country'
        ];

        // ✅ Whitelist for lawyer profile (nested)
        const allowedLawyerFields = [
            'lawyerProfile.languages',
            'lawyerProfile.specialization'
        ];

        // ✅ Build update object with only allowed fields
        const updateData = {};

        // Simple fields
        allowedFields.forEach(field => {
            if (request.body[field] !== undefined) {
                updateData[field] = request.body[field];
            }
        });

        // Nested lawyer profile fields
        if (request.body.lawyerProfile) {
            allowedLawyerFields.forEach(field => {
                const nestedField = field.split('.')[1]; // Get 'languages' from 'lawyerProfile.languages'
                if (request.body.lawyerProfile[nestedField] !== undefined) {
                    updateData[field] = request.body.lawyerProfile[nestedField];
                }
            });
        }

        // ✅ PROTECTED fields that users CANNOT modify:
        // - role (only admin can change via admin panel)
        // - lawyerProfile.verified (only admin can verify)
        // - lawyerProfile.rating (calculated from reviews)
        // - lawyerProfile.casesWon/casesTotal (updated by system)
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

**Test:**
```bash
# Should NOT update role
curl -X PATCH http://localhost:3000/api/users/USER_ID \
  -H "Cookie: accessToken=TOKEN" \
  -d '{
    "username": "updated_name",
    "role": "admin",
    "lawyerProfile": {
      "verified": true,
      "rating": 5.0
    }
  }'

# Verify: role should remain unchanged, username should update
```

---

### Fix 3: Firm Lawyer Management (45 minutes)

**File:** `/src/controllers/firm.controller.js`

#### Fix 3a: addLawyer (Lines 119-143)

**Current Code:**
```javascript
const addLawyer = async (request, response) => {
    const { firmId, lawyerId } = request.body;
    try {
        // ❌ NO AUTHORIZATION CHECK
        const firm = await Firm.findByIdAndUpdate(
            firmId,
            { $addToSet: { lawyers: lawyerId } },
            { new: true }
        );
        // ...
    }
}
```

**Fixed Code:**
```javascript
const addLawyer = async (request, response) => {
    const { firmId, lawyerId } = request.body;

    try {
        // ✅ Validate inputs
        if (!firmId || !lawyerId) {
            throw CustomException('Firm ID and Lawyer ID are required!', 400);
        }

        // ✅ Get firm
        const firm = await Firm.findById(firmId);
        if (!firm) {
            throw CustomException('Firm not found!', 404);
        }

        // ✅ Get requester
        const requester = await User.findById(request.userID);
        if (!requester) {
            throw CustomException('User not found!', 401);
        }

        // ✅ AUTHORIZATION CHECK
        const isAdmin = requester.role === 'admin';
        const isFirmMember = firm.lawyers.some(
            lawyer => lawyer.toString() === request.userID
        );

        if (!isAdmin && !isFirmMember) {
            throw CustomException(
                'You are not authorized to add lawyers to this firm!',
                403
            );
        }

        // ✅ Verify lawyer exists and is actually a lawyer
        const lawyer = await User.findById(lawyerId);
        if (!lawyer) {
            throw CustomException('Lawyer not found!', 404);
        }

        if (lawyer.role !== 'lawyer') {
            throw CustomException('User is not a lawyer!', 400);
        }

        // ✅ Check if already a member
        if (firm.lawyers.includes(lawyerId)) {
            throw CustomException('Lawyer is already a member of this firm!', 400);
        }

        // ✅ Add lawyer to firm
        const updatedFirm = await Firm.findByIdAndUpdate(
            firmId,
            { $addToSet: { lawyers: lawyerId } },
            { new: true }
        );

        // ✅ Update lawyer profile
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
```

#### Fix 3b: removeLawyer (Lines 146-172)

**Fixed Code:**
```javascript
const removeLawyer = async (request, response) => {
    const { firmId, lawyerId } = request.body;

    try {
        // ✅ Validate inputs
        if (!firmId || !lawyerId) {
            throw CustomException('Firm ID and Lawyer ID are required!', 400);
        }

        // ✅ Get firm
        const firm = await Firm.findById(firmId);
        if (!firm) {
            throw CustomException('Firm not found!', 404);
        }

        // ✅ Get requester
        const requester = await User.findById(request.userID);
        if (!requester) {
            throw CustomException('User not found!', 401);
        }

        // ✅ AUTHORIZATION CHECK
        const isAdmin = requester.role === 'admin';
        const isFirmMember = firm.lawyers.some(
            lawyer => lawyer.toString() === request.userID
        );
        const isSelf = request.userID === lawyerId;

        // Only admin, firm members, or the lawyer themselves can remove
        if (!isAdmin && !isFirmMember && !isSelf) {
            throw CustomException(
                'You are not authorized to remove lawyers from this firm!',
                403
            );
        }

        // ✅ Check if lawyer is actually a member
        if (!firm.lawyers.some(l => l.toString() === lawyerId)) {
            throw CustomException('Lawyer is not a member of this firm!', 400);
        }

        // ✅ Remove lawyer from firm
        const updatedFirm = await Firm.findByIdAndUpdate(
            firmId,
            { $pull: { lawyers: lawyerId } },
            { new: true }
        );

        // ✅ Remove firm reference from lawyer profile
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

**Test:**
```bash
# ❌ Should FAIL: Non-member cannot add lawyer
curl -X POST http://localhost:3000/api/firms/lawyer/add \
  -H "Cookie: accessToken=NON_MEMBER_TOKEN" \
  -d '{
    "firmId": "FIRM_ID",
    "lawyerId": "LAWYER_ID"
  }'

# Expected: 403 Forbidden

# ✅ Should SUCCEED: Firm member can add lawyer
curl -X POST http://localhost:3000/api/firms/lawyer/add \
  -H "Cookie: accessToken=FIRM_MEMBER_TOKEN" \
  -d '{
    "firmId": "FIRM_ID",
    "lawyerId": "LAWYER_ID"
  }'

# Expected: 202 Accepted
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Code changes completed
- [ ] Unit tests passing
- [ ] Manual testing completed
- [ ] Code review completed
- [ ] Backup database
- [ ] Create rollback plan

### Deployment
- [ ] Deploy to staging
- [ ] Run automated tests
- [ ] Manual smoke tests
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Verify fixes with test accounts

### Post-Deployment
- [ ] Test CVE-001: Registration with role=admin
- [ ] Test CVE-002: Profile update with role=admin
- [ ] Test CVE-003: Unauthorized firm management
- [ ] Monitor for errors
- [ ] Update security documentation
- [ ] Notify team of changes

---

## TESTING SCRIPT

Save as `test-privilege-escalation.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================="
echo "PRIVILEGE ESCALATION SECURITY TESTS"
echo "========================================="

# Test 1: Registration with admin role
echo -e "\n[TEST 1] Registration with admin role..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_admin_'$(date +%s)'",
    "email": "testadmin'$(date +%s)'@test.com",
    "password": "Password123!",
    "phone": "+966500000000",
    "country": "Saudi Arabia",
    "role": "admin"
  }')

# Should succeed but NOT create admin
if echo "$RESPONSE" | grep -q "error.*false"; then
    echo -e "${GREEN}✓ Registration succeeded${NC}"
    # Now verify role is not admin (would need to login and check)
else
    echo -e "${RED}✗ Registration failed${NC}"
fi

# Test 2: Profile update with role change
echo -e "\n[TEST 2] Profile update with role change..."
# This requires an authenticated user - implement after Phase 2

# Test 3: Unauthorized firm management
echo -e "\n[TEST 3] Unauthorized firm management..."
# This requires test data setup - implement after Phase 2

echo -e "\n========================================="
echo "Manual verification required for complete testing"
echo "========================================="
```

---

## ROLLBACK PLAN

If issues occur after deployment:

### Immediate Rollback
```bash
# 1. Revert to previous commit
git revert HEAD
git push origin main

# 2. Redeploy previous version
npm run deploy:rollback

# 3. Verify system is working
curl http://api.traf3li.com/health
```

### Partial Rollback
If only one fix causes issues, you can selectively revert:

```bash
# Revert specific file
git checkout HEAD~1 -- src/controllers/auth.controller.js
git commit -m "Rollback auth.controller changes"
git push origin main
```

---

## PHASE 2 FIXES (Week 1)

After Phase 1 is stable, implement these changes:

### Fix 4: Update Authenticate Middleware

**File:** `/src/middlewares/authenticate.js`

```javascript
const jwt = require('jsonwebtoken');
const { CustomException } = require("../utils");
const { User } = require('../models');

const authenticate = async (request, response, next) => {
    const { accessToken } = request.cookies;

    try {
        if (!accessToken) {
            throw CustomException('Access denied!', 401);
        }

        const verification = jwt.verify(accessToken, process.env.JWT_SECRET);

        if(verification) {
            // ✅ Fetch full user object with role
            const user = await User.findById(verification._id)
                .select('-password')
                .lean();  // Use lean() for better performance

            if (!user) {
                throw CustomException('User not found!', 401);
            }

            // ✅ Check account status
            if (user.status === 'suspended') {
                throw CustomException('Account suspended!', 403);
            }
            if (user.status === 'banned') {
                throw CustomException('Account banned!', 403);
            }
            if (user.status === 'deleted') {
                throw CustomException('Account deleted!', 403);
            }

            // ✅ Set both for compatibility
            request.userID = verification._id;
            request.user = user;  // For authorize middleware
            request.isSeller = user.isSeller;

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

module.exports = authenticate;
```

### Fix 5: Apply Authorization to Routes

**Example: `/src/routes/firm.route.js`**

```javascript
const express = require('express');
const { authenticate } = require('../middlewares');
const { authorize } = require('../middlewares/authorize.middleware');
const {
    createFirm,
    getFirms,
    getFirm,
    updateFirm,
    addLawyer,
    removeLawyer
} = require('../controllers/firm.controller');

const app = express.Router();

// Create firm - only lawyers or admin
app.post('/',
    authenticate,
    authorize('lawyer', 'admin'),  // ✅ Added RBAC
    createFirm
);

// Get all firms (public)
app.get('/', getFirms);

// Get single firm (public)
app.get('/:_id', getFirm);

// Update firm
app.patch('/:_id',
    authenticate,
    updateFirm  // Has internal checks
);

// Add lawyer to firm - only lawyers or admin
app.post('/lawyer/add',
    authenticate,
    authorize('lawyer', 'admin'),  // ✅ Added RBAC
    addLawyer
);

// Remove lawyer from firm - only lawyers or admin
app.post('/lawyer/remove',
    authenticate,
    authorize('lawyer', 'admin'),  // ✅ Added RBAC
    removeLawyer
);

module.exports = app;
```

Apply similar changes to:
- `/src/routes/case.route.js`
- `/src/routes/user.route.js`
- `/src/routes/invoice.route.js`
- `/src/routes/payment.route.js`

---

## MONITORING & ALERTS

After deployment, monitor these metrics:

### Error Monitoring
```javascript
// Add to error middleware
if (error.status === 403) {
    // Log authorization failures
    logger.warn('Authorization failure', {
        userId: req.userID,
        route: req.path,
        method: req.method,
        ip: req.ip
    });
}
```

### Security Alerts
Set up alerts for:
- Multiple failed authorization attempts from same IP
- Attempts to modify role field
- Attempts to access other users' resources
- Abnormal firm membership changes

---

## SUPPORT & QUESTIONS

If you encounter issues during implementation:

1. **Check the detailed report:** `PRIVILEGE_ESCALATION_SECURITY_REPORT.md`
2. **Check findings JSON:** `privilege-escalation-findings.json`
3. **Review test results:** Run the test script and check output
4. **Rollback if needed:** Follow rollback plan above

---

## SUCCESS CRITERIA

Phase 1 is successful when:
- ✅ Cannot register as admin via API
- ✅ Cannot modify role via profile update
- ✅ Cannot add/remove lawyers without authorization
- ✅ All existing functionality still works
- ✅ No increase in error rates
- ✅ Security tests pass

**Deploy immediately after verifying success criteria!**

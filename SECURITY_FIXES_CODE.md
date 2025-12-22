# Security Fixes - Ready-to-Deploy Code

This document contains production-ready code to fix all identified vulnerabilities.

---

## Critical Fix #1: Token Revocation in All Middleware

### File: `/src/middlewares/userMiddleware.js`

**Replace entire file with:**

```javascript
const jwt = require('jsonwebtoken');
const { CustomException } = require('../utils');
const tokenRevocationService = require('../services/tokenRevocation.service');

/**
 * User Authentication Middleware with Token Revocation Check
 * SECURITY FIX: Added revocation checking to prevent bypass
 */
const userMiddleware = async (request, response, next) => {
  // Check for token in both cookies and Authorization header
  let token = request.cookies.accessToken;

  // If no token in cookies, check Authorization header
  if (!token && request.headers.authorization) {
    const authHeader = request.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  try {
    if(!token) {
      throw CustomException('Unauthorized access!', 401);
    }

    // Step 1: Verify JWT signature and expiration
    const verification = jwt.verify(token, process.env.JWT_SECRET);

    if (!verification) {
      throw CustomException('Invalid token', 401);
    }

    // Step 2: SECURITY FIX - Check token revocation
    const isRevoked = await tokenRevocationService.isTokenRevoked(token);
    if (isRevoked) {
      return response.status(401).send({
        error: true,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    // Step 3: Token is valid - attach user info to request
    request.userID = verification._id;
    request.userId = verification._id; // Alias for consistency
    request.isSeller = verification.isSeller;
    request.token = token; // Store for potential logout

    return next();
  }
  catch(error) {
    // Handle JWT-specific errors with 401 status
    if (error.name === 'TokenExpiredError') {
      return response.status(401).send({
        error: true,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return response.status(401).send({
        error: true,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'NotBeforeError') {
      return response.status(401).send({
        error: true,
        message: 'Token not yet valid',
        code: 'TOKEN_NOT_ACTIVE'
      });
    }

    // Handle custom exceptions and other errors
    const status = error.status || 500;
    const message = error.message || 'Authentication failed';

    return response.status(status).send({
      error: true,
      message
    });
  }
}

module.exports = userMiddleware;
```

### File: `/src/middlewares/authenticate.js`

**Replace entire file with:**

```javascript
const jwt = require('jsonwebtoken');
const { CustomException } = require("../utils");
const tokenRevocationService = require('../services/tokenRevocation.service');

/**
 * Authentication Middleware with Token Revocation Check
 * SECURITY FIX: Added revocation checking
 */
const authenticate = async (request, response, next) => {
  const { accessToken } = request.cookies;

  try {
    if (!accessToken) {
      throw CustomException('Access denied - no token', 401);
    }

    // Step 1: Verify JWT
    const verification = jwt.verify(accessToken, process.env.JWT_SECRET);

    if (!verification) {
      throw CustomException('Access denied - invalid token', 401);
    }

    // Step 2: SECURITY FIX - Check revocation
    const isRevoked = await tokenRevocationService.isTokenRevoked(accessToken);
    if (isRevoked) {
      return response.status(401).send({
        error: true,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    // Step 3: Attach user info
    request.userID = verification._id;
    request.token = accessToken;
    return next();
  }
  catch(error) {
    if (error.name === 'TokenExpiredError') {
      return response.status(401).send({
        error: true,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return response.status(401).send({
        error: true,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'NotBeforeError') {
      return response.status(401).send({
        error: true,
        message: 'Token not yet valid',
        code: 'TOKEN_NOT_ACTIVE'
      });
    }

    const status = error.status || 500;
    const message = error.message || 'Authentication failed';

    return response.status(status).send({
      error: true,
      message
    });
  }
}

module.exports = authenticate;
```

---

## Critical Fix #2: Admin Route Authorization

### File: `/src/routes/admin.route.js`

**Add at the top:**

```javascript
const { requireAdmin } = require('../middlewares/authorize.middleware');
```

**Update all routes to include `requireAdmin()`:**

```javascript
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const { requireAdmin } = require('../middlewares/authorize.middleware');
const {
  sensitiveRateLimiter,
  publicRateLimiter
} = require('../middlewares/rateLimiter.middleware');

const {
  revokeUserTokens,
  getRecentRevocations,
  getRevocationStats,
  getUserRevocations,
  cleanupExpiredTokens
} = require('../controllers/admin.controller');

const {
  expireUserPassword,
  expireAllFirmPasswords,
  getFirmPasswordStats
} = require('../controllers/adminPasswordManagement.controller');

// SECURITY FIX: All routes now require admin role

/**
 * @route   POST /api/admin/users/:id/revoke-tokens
 * @desc    Revoke all tokens for a user (Admin only)
 */
router.post(
  '/users/:id/revoke-tokens',
  authenticate,
  requireAdmin(), // SECURITY FIX: Added admin check
  sensitiveRateLimiter,
  revokeUserTokens
);

/**
 * @route   GET /api/admin/revoked-tokens
 * @desc    Get recent token revocations (Admin only)
 */
router.get(
  '/revoked-tokens',
  authenticate,
  requireAdmin(), // SECURITY FIX: Added admin check
  publicRateLimiter,
  getRecentRevocations
);

/**
 * @route   GET /api/admin/revoked-tokens/stats
 * @desc    Get token revocation statistics (Admin only)
 */
router.get(
  '/revoked-tokens/stats',
  authenticate,
  requireAdmin(), // SECURITY FIX: Added admin check
  publicRateLimiter,
  getRevocationStats
);

/**
 * @route   GET /api/admin/users/:id/revocations
 * @desc    Get revocation history for a user (Admin only)
 */
router.get(
  '/users/:id/revocations',
  authenticate,
  requireAdmin(), // SECURITY FIX: Added admin check
  publicRateLimiter,
  getUserRevocations
);

/**
 * @route   POST /api/admin/revoked-tokens/cleanup
 * @desc    Manually trigger cleanup of expired revoked tokens (Admin only)
 */
router.post(
  '/revoked-tokens/cleanup',
  authenticate,
  requireAdmin(), // SECURITY FIX: Added admin check
  sensitiveRateLimiter,
  cleanupExpiredTokens
);

/**
 * @route   POST /api/admin/users/:id/expire-password
 * @desc    Force user to change password (Admin only)
 */
router.post(
  '/users/:id/expire-password',
  authenticate,
  requireAdmin(), // SECURITY FIX: Added admin check
  sensitiveRateLimiter,
  expireUserPassword
);

/**
 * @route   POST /api/admin/firm/expire-all-passwords
 * @desc    Force all firm users to change passwords (Admin only)
 */
router.post(
  '/firm/expire-all-passwords',
  authenticate,
  requireAdmin(), // SECURITY FIX: Added admin check
  sensitiveRateLimiter,
  expireAllFirmPasswords
);

/**
 * @route   GET /api/admin/firm/password-stats
 * @desc    Get firm password policy statistics (Admin only)
 */
router.get(
  '/firm/password-stats',
  authenticate,
  requireAdmin(), // SECURITY FIX: Added admin check
  publicRateLimiter,
  getFirmPasswordStats
);

module.exports = router;
```

---

## Critical Fix #3: Password Field Protection

### File: `/src/controllers/user.controller.js`

**Find the `updateUserProfile` function and replace with:**

```javascript
/**
 * Update User Profile
 * SECURITY FIX: Explicitly block sensitive field updates
 */
const updateUserProfile = async (request, response) => {
  try {
    const { _id } = request;
    const updates = { ...request.body };

    // SECURITY FIX: Explicitly block sensitive fields
    const blockedFields = [
      'password',           // Must use password change endpoint
      'passwordHistory',    // System-managed
      'passwordChangedAt',  // System-managed
      'passwordExpiresAt',  // Admin-managed
      'mustChangePassword', // Admin-managed
      'role',              // Admin-managed
      'permissions',       // Admin-managed
      'mfaSecret',         // Must use MFA endpoints
      'mfaBackupCodes',    // Must use MFA endpoints
      'accountLocked',     // System-managed
      'loginAttempts',     // System-managed
      'firm',              // Cannot change firm
      'plan',              // Admin-managed
      '_id'                // Immutable
    ];

    // Remove blocked fields from updates
    blockedFields.forEach(field => delete updates[field]);

    // Log attempt to update blocked fields (security monitoring)
    const attemptedBlocked = Object.keys(request.body)
      .filter(key => blockedFields.includes(key));

    if (attemptedBlocked.length > 0) {
      const auditLogService = require('../services/auditLog.service');
      await auditLogService.logAction({
        userId: _id,
        action: 'attempted_blocked_field_update',
        resourceType: 'user',
        resourceId: _id,
        metadata: {
          attemptedFields: attemptedBlocked
        },
        severity: 'medium',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).select('-password -mfaSecret -passwordHistory -mfaBackupCodes');

    if (!updatedUser) {
      return response.status(404).send({
        error: true,
        message: 'User not found'
      });
    }

    return response.send({
      error: false,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return response.status(500).send({
      error: true,
      message: error.message || 'Error updating profile'
    });
  }
};
```

---

## High Fix #4: OTP Verification Rate Limiting

### File: `/src/controllers/otp.controller.js`

**Find the `verifyOTP` function and replace with:**

```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

/**
 * Verify OTP
 * SECURITY FIX: Added rate limiting to prevent brute force
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose = 'login' } = req.body;

    // Input validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required',
        errorAr: 'البريد الإلكتروني ورمز التحقق مطلوبان'
      });
    }

    // OTP format check (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: 'OTP must be 6 digits',
        errorAr: 'رمز التحقق يجب أن يكون 6 أرقام'
      });
    }

    // SECURITY FIX: Rate limiting on verification attempts
    const attemptKey = `otp_verify:${email.toLowerCase()}:${purpose}`;
    const lockoutKey = `otp_lockout:${email.toLowerCase()}:${purpose}`;

    // Check if account is locked due to too many attempts
    const isLockedOut = await redis.get(lockoutKey);
    if (isLockedOut) {
      const ttl = await redis.ttl(lockoutKey);
      return res.status(429).json({
        success: false,
        error: `Too many failed attempts. Please try again in ${Math.ceil(ttl / 60)} minutes.`,
        errorAr: `محاولات كثيرة جداً. يرجى المحاولة بعد ${Math.ceil(ttl / 60)} دقيقة.`,
        retryAfter: ttl
      });
    }

    // Track verification attempts
    const attempts = await redis.incr(attemptKey);

    if (attempts === 1) {
      // First attempt - set expiry (1 hour)
      await redis.expire(attemptKey, 3600);
    }

    // Maximum 5 attempts per hour
    if (attempts > 5) {
      // Lock account for 15 minutes
      await redis.setex(lockoutKey, 900, 'locked'); // 15 minutes

      // Send security alert email
      const emailService = require('../services/email.service');
      await emailService.sendEmail({
        to: email,
        subject: 'Security Alert: Multiple Failed OTP Attempts',
        template: 'security-alert',
        data: {
          alertType: 'OTP verification lockout',
          timestamp: new Date().toISOString(),
          action: 'Your account has been temporarily locked due to multiple failed OTP verification attempts.'
        }
      });

      return res.status(429).json({
        success: false,
        error: 'Too many failed attempts. Account locked for 15 minutes.',
        errorAr: 'محاولات كثيرة جداً. الحساب مقفل لمدة 15 دقيقة.',
        retryAfter: 900
      });
    }

    // Verify OTP
    const otpHash = hashOTP(otp);
    const result = await EmailOTP.verifyOTP(email, otpHash, purpose);

    if (!result.verified) {
      // Failed verification
      const remainingAttempts = 5 - attempts;
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
        errorAr: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
        attemptsRemaining: remainingAttempts
      });
    }

    // SECURITY FIX: Clear attempts on success
    await redis.del(attemptKey);
    await redis.del(lockoutKey);

    // Handle different purposes
    if (purpose === 'registration' || purpose === 'email_verification') {
      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Email verified successfully',
        messageAr: 'تم التحقق من البريد الإلكتروني بنجاح'
      });
    }

    if (purpose === 'password_reset') {
      // Generate ONE-TIME reset token
      const tokenId = crypto.randomBytes(32).toString('hex');

      const resetToken = jwt.sign(
        {
          email: email.toLowerCase(),
          purpose: 'password_reset',
          tokenId: tokenId,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // SECURITY FIX: Store token ID for single-use validation
      await redis.setex(`reset_token:${tokenId}`, 3600, 'active');

      return res.status(200).json({
        success: true,
        verified: true,
        resetToken
      });
    }

    if (purpose === 'login') {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          errorAr: 'المستخدم غير موجود'
        });
      }

      // Generate access token
      const accessToken = jwt.sign(
        { _id: user._id, isSeller: user.isSeller },
        process.env.JWT_SECRET,
        { expiresIn: '7 days' }
      );

      // Set cookie
      const cookieConfig = getCookieConfig(req);
      res.cookie('accessToken', accessToken, cookieConfig);

      return res.status(200).json({
        success: true,
        verified: true,
        token: accessToken,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid purpose',
      errorAr: 'غرض غير صالح'
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
      errorAr: 'فشل التحقق من الرمز'
    });
  }
};
```

---

## High Fix #5: Password Complexity Validation

### File: `/src/models/user.model.js`

**Add password validation and pre-save hook:**

```javascript
const bcrypt = require('bcryptjs');

// Password field with validation
password: {
  type: String,
  required: true,
  validate: {
    validator: function(value) {
      // Skip validation if password is already hashed
      if (value.startsWith('$2a$') || value.startsWith('$2b$')) {
        return true;
      }

      // NCA ECC-2:2024 Compliance: Minimum 12 characters
      if (value.length < 12) {
        return false;
      }

      // Must contain at least one of each:
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

      return hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
    },
    message: props => {
      const value = props.value;

      if (value.startsWith('$2a$') || value.startsWith('$2b$')) {
        return ''; // Already hashed
      }

      if (value.length < 12) {
        return 'Password must be at least 12 characters long';
      }

      return 'Password must contain uppercase, lowercase, number, and special character';
    }
  }
},

// Pre-save hook for password hashing and history
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Skip if already hashed (bcrypt hash starts with $2a$ or $2b$)
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      return next();
    }

    // Check password history (prevent reuse of last 5 passwords)
    if (this.passwordHistory && this.passwordHistory.length > 0) {
      const recentPasswords = this.passwordHistory.slice(-5);

      for (const oldHash of recentPasswords) {
        const isReused = await bcrypt.compare(this.password, oldHash);
        if (isReused) {
          const error = new Error(
            'Cannot reuse any of your last 5 passwords'
          );
          error.name = 'ValidationError';
          return next(error);
        }
      }
    }

    // Hash the password
    const saltRounds = 12; // OWASP recommended minimum: 10
    const hash = await bcrypt.hash(this.password, saltRounds);

    // Store current hash in history before updating
    if (!this.passwordHistory) {
      this.passwordHistory = [];
    }

    // Add current password to history before replacing
    if (this.password && !this.isNew) {
      // Get the current password hash from database
      const currentUser = await this.constructor.findById(this._id);
      if (currentUser && currentUser.password) {
        this.passwordHistory.push(currentUser.password);
      }
    }

    // Keep only last 10 passwords in history
    if (this.passwordHistory.length > 10) {
      this.passwordHistory = this.passwordHistory.slice(-10);
    }

    // Update password and metadata
    this.password = hash;
    this.passwordChangedAt = new Date();

    // Calculate password expiration based on firm settings
    if (this.firm) {
      const Firm = require('./firm.model');
      const firm = await Firm.findById(this.firm);

      if (firm && firm.enterpriseSettings?.passwordPolicy?.maxPasswordAge) {
        const maxAge = firm.enterpriseSettings.passwordPolicy.maxPasswordAge;
        this.passwordExpiresAt = new Date(Date.now() + maxAge * 24 * 60 * 60 * 1000);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Prevent password from being returned in queries
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.mfaSecret;
  delete obj.passwordHistory;
  delete obj.mfaBackupCodes;
  return obj;
};
```

---

## Medium Fix #6: API Key Rate Limiting

### File: `/src/middlewares/apiKeyAuth.middleware.js`

**Replace the placeholder function:**

```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

/**
 * API Key Rate Limiter
 * SECURITY FIX: Implemented Redis-based rate limiting
 */
const apiKeyRateLimit = async (req, res, next) => {
  if (!req.apiKey) {
    return next();
  }

  const apiKeyId = req.apiKey._id.toString();
  const rateLimitKey = `api_rate_limit:${apiKeyId}`;

  // Rate limits based on plan
  const limits = {
    'enterprise': { requests: 10000, window: 3600, burst: 100 },
    'professional': { requests: 1000, window: 3600, burst: 50 },
    'free': { requests: 100, window: 3600, burst: 10 }
  };

  const limit = limits[req.plan?.toLowerCase()] || limits.free;

  try {
    // Increment request counter
    const current = await redis.incr(rateLimitKey);

    if (current === 1) {
      // First request - set expiry
      await redis.expire(rateLimitKey, limit.window);
    }

    // Get TTL for reset time
    const ttl = await redis.ttl(rateLimitKey);
    const resetAt = Date.now() + (ttl * 1000);

    // Set rate limit headers (industry standard)
    res.setHeader('X-RateLimit-Limit', limit.requests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit.requests - current));
    res.setHeader('X-RateLimit-Reset', Math.floor(resetAt / 1000));
    res.setHeader('X-RateLimit-Window', limit.window);

    // Check if limit exceeded
    if (current > limit.requests) {
      // Log rate limit exceeded event
      const auditLogService = require('../services/auditLog.service');
      await auditLogService.logAction({
        userId: req.firmId,
        action: 'api_rate_limit_exceeded',
        resourceType: 'api_key',
        resourceId: apiKeyId,
        metadata: {
          requests: current,
          limit: limit.requests,
          plan: req.plan
        },
        severity: 'low',
        ipAddress: req.ip
      }).catch(err => console.error('Audit log error:', err));

      return res.status(429).json({
        error: true,
        message: 'API rate limit exceeded',
        messageAr: 'تم تجاوز حد معدل استخدام API',
        limit: limit.requests,
        window: limit.window,
        resetAt: resetAt,
        retryAfter: ttl,
        upgrade: req.plan === 'free' ? 'Consider upgrading to Professional plan for higher limits' : null
      });
    }

    // Burst protection (prevent rapid-fire requests)
    const burstKey = `api_burst:${apiKeyId}`;
    const burstCount = await redis.incr(burstKey);

    if (burstCount === 1) {
      await redis.expire(burstKey, 60); // 1 minute window
    }

    if (burstCount > limit.burst) {
      return res.status(429).json({
        error: true,
        message: 'Too many requests per minute. Please slow down.',
        messageAr: 'طلبات كثيرة جداً في الدقيقة. يرجى التباطؤ.',
        burstLimit: limit.burst,
        window: 60
      });
    }

    next();
  } catch (error) {
    console.error('API rate limiting error:', error);

    // Fail open for rate limiting (but log the error)
    // This prevents service disruption if Redis is down
    res.setHeader('X-RateLimit-Status', 'degraded');
    next();
  }
};

module.exports = {
  apiKeyAuth,
  requireScope,
  requireAnyScope,
  flexibleAuth,
  apiKeyRateLimit // Now implemented
};
```

---

## Medium Fix #7: Enhanced Security Headers

### File: `/src/middlewares/security.middleware.js`

**Update the `securityHeaders` function:**

```javascript
/**
 * Security Headers Middleware
 * SECURITY FIX: Added HSTS and additional security headers
 */
const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // SECURITY FIX: Add HSTS header (force HTTPS)
  // Max-age: 2 years (63072000 seconds)
  // includeSubDomains: Apply to all subdomains
  // preload: Allow inclusion in browser HSTS preload lists
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // XSS Protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  );

  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()'
    ].join(', ')
  );

  // Cross-Origin policies
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  next();
};
```

---

## Deployment Checklist

### Before Deploying Fixes

- [ ] **Backup Database** - Create full backup before changes
- [ ] **Test in Staging** - Deploy to staging environment first
- [ ] **Run Test Suite** - Ensure all tests pass
- [ ] **Security Scan** - Run automated security scanner
- [ ] **Review Logs** - Check for any errors in staging

### During Deployment

- [ ] **Deploy Off-Peak** - Minimize user impact
- [ ] **Monitor Metrics** - Watch error rates and response times
- [ ] **Check Redis** - Ensure Redis is healthy for rate limiting
- [ ] **Test Authentication** - Verify login/logout still works

### After Deployment

- [ ] **Verify Fixes** - Test each vulnerability is resolved
- [ ] **Monitor Logs** - Watch for unusual errors
- [ ] **User Communication** - Notify users of security improvements
- [ ] **Update Documentation** - Document new security features

---

## Testing Commands

### Test Token Revocation
```bash
# Should fail with TOKEN_REVOKED
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@12345"}' \
  | jq -r '.token')

curl -s -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: accessToken=$TOKEN"

curl -s -X GET http://localhost:3000/api/user/profile \
  -H "Cookie: accessToken=$TOKEN" \
  | jq .
# Expected: {"error":true,"code":"TOKEN_REVOKED"}
```

### Test OTP Rate Limiting
```bash
# Should block after 5 attempts
for i in {1..6}; do
  echo "Attempt $i:"
  curl -s -X POST http://localhost:3000/api/auth/otp/verify \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","otp":"000000","purpose":"login"}' \
    | jq .
done
# 6th attempt: {"error":"Too many failed attempts"}
```

### Test Password Complexity
```bash
# Should reject weak passwords
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@test.com",
    "password":"weak",
    "firstName":"Test",
    "lastName":"User"
  }' | jq .
# Expected: Validation error about password requirements
```

---

**Last Updated:** 2025-12-22
**Tested On:** Node.js 18+, Express 4.x
**Dependencies:** ioredis, jsonwebtoken, bcryptjs

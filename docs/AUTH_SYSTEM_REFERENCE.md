# Complete Authentication System Reference

> **Quick Reference Guide** for the Traf3li Dashboard Authentication System

---

## Quick Troubleshooting Checklist (Cannot Login)

| Check | What to verify | Solution |
|-------|----------------|----------|
| JWT_SECRET not set | Check if JWT_SECRET env var exists | Set 64+ char random string |
| JWT_REFRESH_SECRET not set | Check if JWT_REFRESH_SECRET exists | Set different 64+ char string |
| Cookies not setting | Check REFRESH_TOKEN_SAMESITE | Set to `lax` if using OAuth/magic links |
| CORS issues | Check ALLOWED_ORIGINS env | Add your frontend URL |
| CSRF errors | Check ENABLE_CSRF_PROTECTION | Set to `false` to disable, or ensure X-CSRF-Token header |
| Role restriction | Non-lawyers blocked | Only role: 'lawyer' can login to dashboard |

---

## 1. API ENDPOINTS - Complete List

### Core Authentication

| Endpoint | Method | Body | Purpose |
|----------|--------|------|---------|
| `/api/auth/register` | POST | See schema below | Register new user |
| `/api/auth/login` | POST | `{email/username, password, mfaCode?, rememberMe?}` | Login with credentials |
| `/api/auth/logout` | POST | - | Logout (requires auth + CSRF) |
| `/api/auth/logout-all` | POST | - | Logout all devices |
| `/api/auth/me` | GET | - | Get current user profile |
| `/api/auth/refresh` | POST | `{refreshToken?}` | Refresh access token |
| `/api/auth/csrf` | GET | - | Get CSRF token |

### Passwordless - OTP (Email)

| Endpoint | Method | Body | Purpose |
|----------|--------|------|---------|
| `/api/auth/send-otp` | POST | `{email, purpose?}` | Send 6-digit OTP to email |
| `/api/auth/verify-otp` | POST | `{email, otp, purpose?}` | Verify OTP and login |
| `/api/auth/resend-otp` | POST | `{email, purpose?}` | Resend OTP |
| `/api/auth/otp-status` | GET | - | Check OTP rate limits |

### Passwordless - OTP (Phone/SMS)

| Endpoint | Method | Body | Purpose |
|----------|--------|------|---------|
| `/api/auth/phone/send-otp` | POST | `{phone, purpose?}` | Send SMS OTP |
| `/api/auth/phone/verify-otp` | POST | `{phone, otp, purpose?}` | Verify SMS OTP |
| `/api/auth/phone/resend-otp` | POST | `{phone, purpose?}` | Resend SMS OTP |

### Passwordless - Magic Link

| Endpoint | Method | Body | Purpose |
|----------|--------|------|---------|
| `/api/auth/magic-link/send` | POST | `{email, purpose?, redirectUrl?}` | Send magic link email |
| `/api/auth/magic-link/verify` | POST | `{token}` | Verify magic link (64 hex chars) |

### Google One Tap

| Endpoint | Method | Body | Purpose |
|----------|--------|------|---------|
| `/api/auth/google/one-tap` | POST | `{credential, firmId?}` | Authenticate with Google JWT |

### OAuth/SSO (All Providers)

| Endpoint | Method | Body/Query | Purpose |
|----------|--------|------------|---------|
| `/api/auth/sso/providers` | GET | `{firmId?}` | List enabled providers |
| `/api/auth/sso/initiate` | POST | `{provider, returnUrl?, firmId?, use_pkce?}` | Start OAuth flow |
| `/api/auth/sso/callback` | POST | `{provider, code, state}` | Handle OAuth callback |
| `/api/auth/sso/:provider/authorize` | GET | `{returnUrl?, firmId?}` | Start OAuth (redirect) |
| `/api/auth/sso/:provider/callback` | GET | `{code, state}` | OAuth callback (redirect) |
| `/api/auth/sso/detect` | POST | `{email, firmId?, returnUrl?}` | Auto-detect SSO provider |

**Supported providers:** `google`, `microsoft`, `facebook`, `apple`, `github`, `linkedin`, `twitter`, `okta`, `auth0`

### Password Management

| Endpoint | Method | Body | Auth |
|----------|--------|------|------|
| `/api/auth/forgot-password` | POST | `{email}` | Public |
| `/api/auth/reset-password` | POST | `{token, newPassword}` | Public |
| `/api/auth/change-password` | POST | `{currentPassword, newPassword}` | Required + CSRF |
| `/api/auth/password-status` | GET | - | Required |

### MFA (Multi-Factor Authentication)

| Endpoint | Method | Body | Auth |
|----------|--------|------|------|
| `/api/auth/mfa/status` | GET | - | Required |
| `/api/auth/mfa/backup-codes/generate` | POST | - | Required + Step-Up |
| `/api/auth/mfa/backup-codes/verify` | POST | `{userId, code}` | Public (login flow) |
| `/api/auth/mfa/backup-codes/regenerate` | POST | - | Required + Step-Up |
| `/api/auth/mfa/backup-codes/count` | GET | - | Required |

### Session Management

| Endpoint | Method | Body | Auth |
|----------|--------|------|------|
| `/api/auth/sessions` | GET | - | Required |
| `/api/auth/sessions` | DELETE | - | Required + CSRF |
| `/api/auth/sessions/:id` | DELETE | - | Required + CSRF |
| `/api/auth/sessions/current` | GET | - | Required |
| `/api/auth/sessions/stats` | GET | - | Required |

### Re-authentication (Step-Up Auth)

| Endpoint | Method | Body | Auth |
|----------|--------|------|------|
| `/api/auth/reauthenticate` | POST | `{method: 'password'/'totp', password?, totpCode?}` | Required + CSRF |
| `/api/auth/reauthenticate/challenge` | POST | `{method: 'email'/'sms', purpose?}` | Required + CSRF |
| `/api/auth/reauthenticate/verify` | POST | `{code, purpose?}` | Required + CSRF |
| `/api/auth/reauthenticate/status` | GET | `{maxAgeMinutes?}` | Required |

---

## 2. REQUEST/RESPONSE SCHEMAS

### Login Request

```http
POST /api/auth/login
```

```json
{
    "email": "user@example.com",     // OR "username": "john_doe"
    "password": "MyP@ssw0rd!",
    "mfaCode": "123456",             // Optional - 6-digit TOTP or backup code
    "rememberMe": true               // Optional - extends session to 30 days
}
```

### Login Response (Success)

```json
{
    "error": false,
    "message": "تم تسجيل الدخول بنجاح",
    "messageEn": "Login successful",

    // OAuth 2.0 standard (snake_case)
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 900,  // 15 minutes

    // Backwards compatibility (camelCase)
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",

    "user": {
        "id": "507f1f77bcf86cd799439011",
        "username": "john_doe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "lawyer",
        "isSoloLawyer": false,
        "lawyerWorkMode": "firm_member",
        "firmId": "507f1f77bcf86cd799439012",
        "firmRole": "lawyer",
        "firmStatus": "active",
        "permissions": {}
    }
}
```

### Login Response (MFA Required)

```json
{
    "error": false,
    "mfaRequired": true,
    "message": "يرجى إدخال رمز المصادقة الثنائية",
    "messageEn": "Please enter your MFA code",
    "userId": "507f1f77bcf86cd799439011",
    "code": "MFA_REQUIRED"
}
```

### Register Request

```http
POST /api/auth/register
```

```json
{
    // Required
    "email": "lawyer@example.com",
    "password": "MyP@ssw0rd!",
    "username": "john_lawyer",

    // Optional
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+966501234567",
    "role": "lawyer",  // 'lawyer' or 'client'

    // Lawyer-specific
    "isSeller": true,
    "lawyerWorkMode": "solo",  // 'solo' | 'create_firm' | 'join_firm'
    "lawyerMode": "dashboard",  // 'marketplace' | 'dashboard'

    // If lawyerWorkMode is 'create_firm'
    "firmData": {
        "name": "Legal Firm LLC",
        "licenseNumber": "12345",
        "email": "firm@example.com"
    },

    // If lawyerWorkMode is 'join_firm'
    "invitationCode": "ABC123"
}
```

### Password Requirements

```
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*(),.?":{}|<>)
- NOT found in HaveIBeenPwned database
- NOT same as last 12 passwords
```

---

## 3. USER MODEL - Complete Schema

```javascript
{
    // ═══════════ BASIC INFO ═══════════
    username: String,           // Unique, sparse (required except anonymous)
    email: String,              // Unique, sparse (required except anonymous)
    password: String,           // Bcrypt hashed (12 rounds)
    firstName: String,
    lastName: String,
    phone: String,              // ENCRYPTED (AES-256-GCM)
    image: String,              // Avatar URL
    description: String,

    // ═══════════ LOCATION ═══════════
    country: String,            // Default: 'Saudi Arabia'
    nationality: String,
    region: String,
    city: String,
    timezone: String,           // Default: 'Asia/Riyadh'

    // ═══════════ ROLE & TYPE ═══════════
    role: 'client' | 'lawyer' | 'admin',  // Default: 'client'
    isSeller: Boolean,          // Legacy: true for lawyers
    lawyerMode: 'marketplace' | 'dashboard' | null,

    // ═══════════ SOLO LAWYER MODE ═══════════
    isSoloLawyer: Boolean,
    lawyerWorkMode: 'solo' | 'firm_owner' | 'firm_member' | null,

    // ═══════════ FIRM MEMBERSHIP ═══════════
    firmId: ObjectId,           // Ref: Firm
    firmRole: 'owner' | 'admin' | 'partner' | 'lawyer' | 'paralegal' |
              'secretary' | 'accountant' | 'departed' | null,
    firmStatus: 'active' | 'departed' | 'suspended' | 'pending' | null,
    departedAt: Date,

    // ═══════════ ANONYMOUS AUTH ═══════════
    isAnonymous: Boolean,
    lastActivityAt: Date,
    convertedFromAnonymousId: ObjectId,
    convertedAt: Date,

    // ═══════════ EMAIL VERIFICATION ═══════════
    isEmailVerified: Boolean,
    emailVerifiedAt: Date,

    // ═══════════ PASSWORD RESET ═══════════
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordResetRequestedAt: Date,

    // ═══════════ MFA ═══════════
    mfaEnabled: Boolean,
    mfaSecret: String,          // ENCRYPTED (AES-256-GCM)
    mfaBackupCodes: [{
        code: String,           // Hashed
        used: Boolean,
        usedAt: Date
    }],
    mfaVerifiedAt: Date,

    // ═══════════ SSO/OAUTH ═══════════
    isSSOUser: Boolean,
    ssoProvider: 'azure' | 'okta' | 'google' | 'custom' | null,
    ssoExternalId: String,      // Provider's user ID
    createdViaSSO: Boolean,
    lastSSOLogin: Date,
    lastLogin: Date,

    // ═══════════ PASSWORD ROTATION ═══════════
    passwordChangedAt: Date,
    passwordExpiresAt: Date,
    mustChangePassword: Boolean,
    passwordHistory: [{ hash: String, changedAt: Date }],  // Last 12

    // ═══════════ CUSTOM JWT CLAIMS ═══════════
    customClaims: Mixed,        // Supabase-style custom claims
    customClaimsUpdatedAt: Date,
    customClaimsUpdatedBy: ObjectId
}
```

---

## 4. SESSION MODEL

```javascript
{
    userId: ObjectId,           // Ref: User
    firmId: ObjectId,           // Ref: Firm
    tokenHash: String,          // SHA-256 (never plaintext!)

    deviceInfo: {
        userAgent: String,
        ip: String,
        device: 'desktop' | 'mobile' | 'tablet' | 'unknown',
        browser: String,
        os: String,
        platform: String
    },

    location: {
        country: String,
        city: String,
        region: String,
        ip: String,
        timezone: String
    },

    // Lifecycle
    createdAt: Date,
    lastActivityAt: Date,
    expiresAt: Date,            // TTL: 30 days auto-delete

    isActive: Boolean,
    terminatedAt: Date,
    terminatedReason: 'logout' | 'expired' | 'user_terminated' |
                      'admin_terminated' | 'limit_exceeded' | 'security' | 'forced',

    // Security
    rememberMe: Boolean,
    isNewDevice: Boolean,
    isSuspicious: Boolean,
    suspiciousReasons: ['ip_mismatch', 'user_agent_mismatch', 'impossible_travel', ...]
}
```

---

## 5. JWT TOKEN STRUCTURE

### Access Token (15 min / 24h for anonymous)

```javascript
// Header
{
    "alg": "HS256",
    "typ": "JWT",
    "kid": "key-id"  // Only if key rotation enabled
}

// Payload
{
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "lawyer",
    "is_anonymous": false,
    "is_solo_lawyer": false,
    "firm_id": "507f1f77bcf86cd799439012",
    "firm_role": "lawyer",
    "user_id": "507f1f77bcf86cd799439011",

    // Standard claims
    "iss": "traf3li",
    "aud": "traf3li-users",
    "exp": 1704067200,
    "iat": 1704066300
}
```

### Refresh Token (7 days / 30 days with rememberMe)

```javascript
{
    "id": "507f1f77bcf86cd799439011",  // User ID only (minimal)
    "iss": "traf3li",
    "aud": "traf3li-users",
    "exp": 1704672000,
    "iat": 1704067200
}
```

---

## 6. COOKIES

### Cookie Names & Paths

| Cookie | httpOnly | SameSite | Path | Duration |
|--------|----------|----------|------|----------|
| `accessToken` | true | lax/none | `/` | 15 min |
| `refresh_token` | true | strict/lax | `/api/auth` | 7-30 days |
| `csrfToken` | false | lax/none | `/` | 1 hour |

### Key Environment Variables

```bash
REFRESH_TOKEN_DAYS=7              # Default refresh token duration
REMEMBER_ME_DAYS=30               # Extended duration with rememberMe
REFRESH_TOKEN_SAMESITE=strict     # Warning: 'strict' breaks OAuth! Use 'lax'
REFRESH_TOKEN_PATH=/api/auth      # Cookie path restriction
```

### CRITICAL: SameSite Issue

Default `REFRESH_TOKEN_SAMESITE=strict` will break:
- Google OAuth redirects
- Microsoft OAuth redirects
- Magic link redirects
- Any cross-site navigation

**Solution:** Set `REFRESH_TOKEN_SAMESITE=lax` in production

---

## 7. CSRF PROTECTION

### Enable/Disable

```bash
ENABLE_CSRF_PROTECTION=true   # Set to false to disable
CSRF_TOKEN_TTL=3600           # Token validity (seconds)
```

### How to Use

```javascript
// 1. Get token on login or via dedicated endpoint
GET /api/auth/csrf

// 2. Include in state-changing requests
POST /api/auth/logout
Headers: {
    "X-CSRF-Token": "your-csrf-token-here"
}

// 3. Token rotates after each validated request
// New token in response header: X-CSRF-Token
```

### Exempt Routes (No CSRF needed)

- All login/register endpoints
- Password reset
- Magic link verification
- OTP endpoints
- OAuth callbacks
- Webhooks

---

## 8. AUTHENTICATION MIDDLEWARE

### Token Sources (Priority Order)

1. Cookie: `accessToken`
2. Header: `Authorization: Bearer <token>`

### Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `NO_TOKEN` | 401 | No token provided |
| `INVALID_TOKEN` | 401 | Token malformed or signature invalid |
| `TOKEN_EXPIRED` | 401 | Token has expired |
| `TOKEN_NOT_ACTIVE` | 401 | Token not yet valid (nbf claim) |
| `AUTH_FAILED` | 401 | Generic auth failure |

---

## 9. RATE LIMITING

| Limiter | Limit | Window | Used On |
|---------|-------|--------|---------|
| `loginLimiter` | 5 | 15 min | `/login` |
| `authLimiter` | 20 | 15 min | `/register`, general auth |
| `passwordResetLimiter` | 3 | 1 hour | `/forgot-password` |
| `otpLimiter` | 5 | 15 min | OTP endpoints |
| `sensitiveRateLimiter` | 3 | 1 hour | `/check-availability`, `/resend-otp` |
| `publicRateLimiter` | 10 | 1 min | Public endpoints |

---

## 10. ENVIRONMENT VARIABLES (Auth-Related)

```bash
# ═══════════ CRITICAL - MUST SET ═══════════
JWT_SECRET=<64+ random chars>
JWT_REFRESH_SECRET=<64+ different random chars>
ENCRYPTION_KEY=<64 hex characters>

# ═══════════ TOKEN SETTINGS ═══════════
REFRESH_TOKEN_DAYS=7
REMEMBER_ME_DAYS=30
REFRESH_TOKEN_SAMESITE=lax    # 'strict' breaks OAuth!
REFRESH_TOKEN_PATH=/api/auth

# ═══════════ CSRF ═══════════
ENABLE_CSRF_PROTECTION=false  # Set true in production
CSRF_TOKEN_TTL=3600

# ═══════════ SESSION ═══════════
MAX_CONCURRENT_SESSIONS=5
SESSION_INACTIVITY_TIMEOUT=604800  # 7 days in seconds
FORCE_LOGOUT_ON_PASSWORD_CHANGE=true
NOTIFY_NEW_SESSION=true
ENABLE_SESSION_ANOMALY_DETECTION=true

# ═══════════ PASSWORD POLICY ═══════════
ENABLE_PASSWORD_BREACH_CHECK=true
PASSWORD_EXPIRATION_DAYS=90

# ═══════════ CORS ═══════════
ALLOWED_ORIGINS=https://app.example.com,http://localhost:3000

# ═══════════ GOOGLE ONE TAP ═══════════
GOOGLE_SSO_CLIENT_ID=<your-client-id>.apps.googleusercontent.com

# ═══════════ OAUTH PROVIDERS ═══════════
GOOGLE_SSO_CLIENT_ID=
GOOGLE_SSO_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=

# ═══════════ PHONE OTP ═══════════
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# ═══════════ CAPTCHA ═══════════
ENABLE_CAPTCHA=false
RECAPTCHA_SECRET_KEY=
```

---

## 11. ERROR CODE REFERENCE

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `NO_TOKEN` | 401 | No auth token provided |
| `INVALID_TOKEN` | 401 | Token malformed |
| `TOKEN_EXPIRED` | 401 | Access token expired |
| `REFRESH_TOKEN_EXPIRED` | 401 | Refresh token expired |
| `MFA_REQUIRED` | 200 | MFA code needed to continue |
| `INVALID_MFA_CODE` | 401 | Wrong MFA/backup code |
| `LAWYERS_ONLY` | 403 | Dashboard restricted to lawyers |
| `CSRF_TOKEN_MISSING` | 403 | No CSRF token in request |
| `CSRF_ORIGIN_INVALID` | 403 | Request origin not allowed |
| `ACCOUNT_LOCKED` | 401 | Too many failed attempts |
| `WEAK_PASSWORD` | 400 | Password doesn't meet policy |
| `PASSWORD_BREACHED` | 400 | Password found in data breach |
| `EMAIL_TAKEN` | 400 | Email already registered |
| `USERNAME_TAKEN` | 400 | Username already taken |

---

## 12. QUICK FIXES FOR COMMON ISSUES

### "Cannot login" - Checklist

```bash
# 1. Check JWT secrets are set
echo $JWT_SECRET
echo $JWT_REFRESH_SECRET

# 2. Check if user exists and is lawyer
db.users.findOne({ email: "your@email.com" })

# 3. Check if account is locked
db.accountLockouts.findOne({ identifier: "your@email.com" })

# 4. Check cookie SameSite (for OAuth)
# In .env:
REFRESH_TOKEN_SAMESITE=lax  # NOT 'strict'

# 5. Disable CSRF temporarily
ENABLE_CSRF_PROTECTION=false

# 6. Check CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourapp.com
```

### Token not refreshing

```bash
# Check refresh token cookie path matches
REFRESH_TOKEN_PATH=/api/auth

# Check SameSite allows cross-origin
REFRESH_TOKEN_SAMESITE=lax
```

### Google One Tap not working

```bash
# Check client ID is set
GOOGLE_SSO_CLIENT_ID=<your-id>.apps.googleusercontent.com

# Verify authorized origins in Google Console
```

---

## Related Documentation

- [Authentication API Endpoints](./api-endpoints/01-AUTHENTICATION.md)
- [HTTPONLY Cookie Auth](./HTTPONLY_COOKIE_AUTH.md)
- [CAPTCHA Integration](./CAPTCHA_INTEGRATION.md)

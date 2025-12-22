# Environment Variable and Configuration Security Scan Report

**Repository**: traf3li-backend
**Scan Date**: 2025-12-22
**Scanned By**: Claude Security Analyzer
**Scope**: Environment variables, configuration files, and secret management

---

## Executive Summary

This security scan assessed the environment variable and configuration security practices in the traf3li-backend repository. The scan evaluated:

- Environment variable configuration files (.env.example, .env.captcha.example, .env.webauthn.example)
- Hardcoded secrets and sensitive data exposure
- Configuration file security
- Secret rotation mechanisms
- Environment-specific settings
- Docker configuration security

### Overall Security Rating: ⭐⭐⭐⭐ (4/5 - Very Good)

**Key Strengths:**
- ✅ Excellent environment validation at startup
- ✅ No hardcoded secrets found in codebase
- ✅ Strong encryption and JWT secret validation
- ✅ Proper .gitignore configuration
- ✅ Comprehensive .env.example documentation
- ✅ Secure default configurations

**Areas for Improvement:**
- ⚠️ No automated secret rotation mechanism
- ⚠️ Default MongoDB credentials in docker-compose.yml
- ⚠️ Limited secret versioning strategy
- ⚠️ No secret management service integration documentation

---

## 1. Environment File Security Analysis

### 1.1 .env.example File - ✅ EXCELLENT

**Location**: `/home/user/traf3li-backend/.env.example`

**Strengths:**
- ✅ Comprehensive documentation with security warnings
- ✅ Clear instructions for generating cryptographically secure secrets
- ✅ No actual secrets or sensitive defaults
- ✅ Placeholder values are clearly marked
- ✅ Includes security best practices in comments
- ✅ Validates against placeholder values at startup

**Key Security Features:**
```bash
# Security warnings are prominently displayed
# ⚠️  SECURITY WARNING:
#   - Never commit .env file to git (it's in .gitignore)
#   - Never share your secrets in Slack, email, or other channels
#   - Never reuse secrets across environments
#   - Generate new secrets for each environment

# Provides secure generation commands
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Sensitive Variables Properly Configured:**
- `JWT_SECRET`: Placeholder with generation instructions ✅
- `JWT_REFRESH_SECRET`: Placeholder with generation instructions ✅
- `ENCRYPTION_KEY`: Placeholder with exact length requirements ✅
- `MONGODB_URI`: Generic placeholder format ✅
- `AWS_ACCESS_KEY_ID/SECRET_ACCESS_KEY`: Placeholders ✅
- `STRIPE_SECRET_KEY`: Placeholder ✅
- `RESEND_API_KEY`: Placeholder ✅
- `CLOUDINARY_API_SECRET`: Placeholder ✅

### 1.2 .env.captcha.example - ✅ GOOD

**Location**: `/home/user/traf3li-backend/.env.captcha.example`

**Analysis:**
- ✅ No default secrets
- ✅ Clear configuration examples
- ✅ Links to service providers for obtaining keys
- ✅ Optional configuration (doesn't break if not set)

### 1.3 .env.webauthn.example - ✅ GOOD

**Location**: `/home/user/traf3li-backend/.env.webauthn.example`

**Analysis:**
- ✅ Localhost defaults for development
- ✅ Clear production configuration instructions
- ✅ Comprehensive troubleshooting guide
- ✅ No sensitive data exposure

### 1.4 .gitignore Configuration - ✅ EXCELLENT

**Location**: `/home/user/traf3li-backend/.gitignore`

**Protected Files:**
```gitignore
.env                    # ✅ Main environment file excluded
security-reports/       # ✅ Security reports excluded
*.log                   # ✅ Log files excluded
```

**Verification:**
- ✅ No `.env` file found in repository root (checked)
- ✅ Only example files committed
- ✅ Test environment file properly isolated

---

## 2. Hardcoded Secrets Scan - ✅ CLEAN

### 2.1 Source Code Analysis

**Scan Coverage:**
- 112 files using `process.env`
- All configuration files
- All service files
- All middleware files

**Findings:**
- ✅ **No hardcoded passwords found**
- ✅ **No hardcoded API keys found**
- ✅ **No hardcoded secrets or tokens found**
- ✅ **No MongoDB connection strings with credentials**

**Secure Patterns Observed:**
```javascript
// All sensitive values read from environment
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Proper fallback to null when not configured
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
}

// Configuration validation before use
const key = getEncryptionKey(); // Throws if not set or invalid
```

### 2.2 Password Masking in Logs - ✅ IMPLEMENTED

**Email Settings Controller** (`src/controllers/emailSettings.controller.js`):
```javascript
safeConfig.auth.password = '********'; // Properly masked
```

**Startup Validation** (`src/utils/startupValidation.js`):
```javascript
// Only shows "Configured" or "Not configured" - never actual values
console.log(`MongoDB: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Not configured'}`);
console.log(`JWT Secrets: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
```

---

## 3. Configuration File Security - ✅ EXCELLENT

### 3.1 Startup Validation - ✅ EXCEPTIONAL

**Location**: `/home/user/traf3li-backend/src/utils/startupValidation.js`

**Security Features:**
1. **Fail-Fast Validation** - Application refuses to start if critical variables are missing
2. **Secret Length Validation** - Enforces minimum 32 characters for JWT secrets
3. **Secret Format Validation** - Validates encryption key is exactly 64 hex characters
4. **Placeholder Detection** - Detects and rejects placeholder values like "your_secret_here"
5. **Production Security Checks** - Additional validation for production environment

**Validated Variables:**
```javascript
// CRITICAL SECURITY VARIABLES (REQUIRED)
✅ JWT_SECRET (min 32 chars, must differ from refresh secret)
✅ JWT_REFRESH_SECRET (min 32 chars)
✅ ENCRYPTION_KEY (exactly 64 hex chars)
✅ MONGODB_URI (format validation)

// RECOMMENDED VARIABLES (WARNINGS)
⚠️  SENTRY_DSN
⚠️  REDIS_URL
⚠️  AWS S3 Configuration
⚠️  RESEND_API_KEY
```

**Example Validation:**
```javascript
// Encryption key validation
if (encryptionKey.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be exactly 64 hexadecimal characters');
}

if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
    throw new Error('ENCRYPTION_KEY must contain only hexadecimal characters');
}

// JWT secrets must be different
if (jwtSecret === jwtRefreshSecret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
}
```

### 3.2 JWT Token Security - ✅ EXCELLENT

**Location**: `/home/user/traf3li-backend/src/utils/generateToken.js`

**Security Features:**
- ✅ Separate secrets for access and refresh tokens
- ✅ Minimum length validation (32 characters)
- ✅ Secrets must be different from each other
- ✅ Proper error handling with helpful messages
- ✅ Token expiration: 15 minutes (access), 7 days (refresh)
- ✅ Issuer and audience validation

### 3.3 Encryption Utility - ✅ EXCELLENT

**Location**: `/home/user/traf3li-backend/src/utils/encryption.js`

**Security Features:**
- ✅ AES-256-GCM (authenticated encryption)
- ✅ Strict key validation (64 hex characters = 32 bytes)
- ✅ Random IV generation for each encryption
- ✅ Authentication tag for tamper detection
- ✅ Timing-safe comparison functions
- ✅ Separate password hashing with bcrypt (10 rounds)
- ✅ Secure random token generation
- ✅ Log data sanitization utilities

**Constants:**
```javascript
ALGORITHM: 'aes-256-gcm'
IV_LENGTH: 16 bytes
AUTH_TAG_LENGTH: 16 bytes
BCRYPT_ROUNDS: 10
```

### 3.4 Configuration Files - ✅ GOOD

**Permissions Configuration** (`src/config/permissions.config.js`):
- ✅ No sensitive data
- ✅ Role-based access control definitions
- ✅ Static configuration only

**Plans Configuration** (`src/config/plans.config.js`):
- ✅ No sensitive data
- ✅ Plan limits and features
- ✅ Static configuration only

---

## 4. Secret Rotation Mechanisms - ⚠️ LIMITED

### Current State

**No Automated Rotation Found:**
- ❌ No automated secret rotation for JWT secrets
- ❌ No automated rotation for encryption keys
- ❌ No automated rotation for API keys
- ✅ Password history tracking implemented (prevents reuse)
- ✅ Password expiration policies available per firm

**Password Rotation Features:**
```javascript
// From firm.model.js
passwordMaxAgeDays: { type: Number, default: 90 }
passwordHistoryCount: { type: Number, default: 12 }
enablePasswordExpiration: { type: Boolean, default: false }
passwordExpiryWarningDays: { type: Number, default: 7 }
```

**Token Blacklisting:**
- ✅ Revoked tokens tracked in database
- ✅ Token verification checks blacklist
- ✅ JWT refresh tokens can be invalidated

### Recommendations

**HIGH PRIORITY:**
1. **Implement JWT Secret Rotation Strategy**
   - Use versioned secrets (JWT_SECRET_V1, JWT_SECRET_V2)
   - Support multiple valid secrets during rotation period
   - Document rotation procedure

2. **API Key Rotation Policy**
   - Document rotation schedule for external service API keys
   - Implement grace period for rotating keys
   - Alert on key age

3. **Encryption Key Management**
   - Document key rotation procedure for ENCRYPTION_KEY
   - Implement key versioning (encrypt with new, decrypt with old)
   - Plan for re-encryption of existing data

**MEDIUM PRIORITY:**
4. **Secret Management Service Integration**
   - Consider AWS Secrets Manager, HashiCorp Vault, or Azure Key Vault
   - Automate secret retrieval and rotation
   - Centralize secret management

5. **Monitoring and Alerts**
   - Alert on old secrets (90+ days)
   - Track secret usage and last rotation date
   - Audit secret access

---

## 5. Environment-Specific Settings - ✅ GOOD

### 5.1 Development vs Production

**NODE_ENV Configuration:**
```javascript
// .env.example
NODE_ENV=production

// CORS middleware properly separates dev/prod
const allowedOrigins = [
    'https://traf3li.com',
    'https://dashboard.traf3li.com',
    // Development URLs (only in non-production)
    ...(process.env.NODE_ENV !== 'production' ? [
        'http://localhost:5173',
        'http://localhost:3000',
    ] : [])
];
```

**Production-Specific Checks** (`startupValidation.js`):
```javascript
if (process.env.NODE_ENV === 'production') {
    // Ensure HTTPS
    if (clientUrl && !clientUrl.startsWith('https://')) {
        warnings.push('CLIENT_URL should use HTTPS in production');
    }

    // Ensure MongoDB SSL/TLS
    if (!mongoUri.includes('ssl=true') && !mongoUri.includes('tls=true')) {
        warnings.push('MONGODB_URI should use SSL/TLS in production');
    }
}
```

### 5.2 Optional Features

**Redis Configuration:**
```javascript
DISABLE_QUEUES=false           // Can disable Bull queues
DISABLE_REDIS_CACHE=false      // Can disable Redis caching
```

**Validation Bypass** (for testing only):
```javascript
SKIP_SAUDI_VALIDATION=false    // ⚠️ IMPORTANT: Never enable in production
```

**Malware Scanning:**
```javascript
ENABLE_MALWARE_SCAN=true       // Can be disabled if ClamAV not available
```

### 5.3 Security Headers - ✅ EXCELLENT

**Location**: `/home/user/traf3li-backend/src/middlewares/securityHeaders.middleware.js`

**Implemented Headers:**
- ✅ Permissions-Policy (deny by default)
- ✅ Cross-Origin-Embedder-Policy (COEP)
- ✅ Cross-Origin-Opener-Policy (COOP)
- ✅ Cross-Origin-Resource-Policy (CORP)
- ✅ Cache-Control for sensitive endpoints
- ✅ Content Security Policy (CSP)

**CORS Security:**
- ✅ No wildcard origins with credentials
- ✅ Strict origin whitelist
- ✅ Production blocks no-origin requests
- ✅ Blocked origins are logged

---

## 6. Docker Configuration Security - ⚠️ NEEDS IMPROVEMENT

### 6.1 docker-compose.yml - ⚠️ WEAK DEFAULTS

**Location**: `/home/user/traf3li-backend/docker-compose.yml`

**CRITICAL SECURITY ISSUES:**

❌ **Default MongoDB Credentials:**
```yaml
MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER:-admin}
MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:-changeme}
```
**Impact**: Default password "changeme" is extremely weak and commonly known
**Severity**: CRITICAL
**Recommendation**: Remove defaults, require setting in .env

❌ **Optional Redis Password:**
```yaml
command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-}
```
**Impact**: Redis runs without authentication if REDIS_PASSWORD not set
**Severity**: HIGH
**Recommendation**: Require password, no empty default

**POSITIVE ASPECTS:**
- ✅ Uses env_file for .env loading
- ✅ Secrets read from environment variables
- ✅ Health checks implemented
- ✅ Proper networking with isolation

### 6.2 docker-compose.prod.yml - ✅ BETTER

**Location**: `/home/user/traf3li-backend/docker-compose.prod.yml`

**Security Features:**
- ✅ Uses external MongoDB Atlas & Redis (more secure)
- ✅ No database credentials in compose file
- ✅ All config in .env file
- ✅ Proper logging configuration
- ✅ Health checks enabled

---

## 7. Logging Security - ✅ EXCELLENT

### 7.1 Sensitive Data Masking

**Implemented Sanitization:**
```javascript
// From encryption.js
const sanitizeForLog = (data, sensitiveFields = []) => {
    const defaultSensitiveFields = [
        'password', 'passwordHash', 'secret', 'token', 'apiKey',
        'nationalId', 'iban', 'bankAccount', 'cardNumber', 'cvv',
        'ssn', 'salary', 'encryptionKey'
    ];
    // ... masks all sensitive fields with '[REDACTED]'
};
```

**Console Logging:**
- ✅ Secrets never logged directly
- ✅ Only shows "✅ Configured" or "❌ Not configured"
- ✅ No environment variable values in logs
- ✅ Proper error messages without exposing secrets

---

## 8. Vulnerability Summary

### Critical Issues (0)
None found.

### High Severity Issues (2)

1. **Default MongoDB Password in Docker Compose**
   - **File**: `docker-compose.yml`
   - **Issue**: Default password "changeme" is weak
   - **Impact**: Database compromise if deployed with defaults
   - **Fix**: Remove default, require in .env
   ```yaml
   # BAD (current)
   MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:-changeme}

   # GOOD (recommended)
   MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:?MONGO_ROOT_PASSWORD is required}
   ```

2. **Optional Redis Password**
   - **File**: `docker-compose.yml`
   - **Issue**: Redis can run without authentication
   - **Impact**: Unauthorized access to cache and queues
   - **Fix**: Require password
   ```yaml
   # BAD (current)
   --requirepass ${REDIS_PASSWORD:-}

   # GOOD (recommended)
   --requirepass ${REDIS_PASSWORD:?REDIS_PASSWORD is required}
   ```

### Medium Severity Issues (3)

3. **No Automated Secret Rotation**
   - **Impact**: Secrets may remain valid indefinitely
   - **Recommendation**: Implement rotation policy and procedures

4. **No Secret Versioning Strategy**
   - **Impact**: Difficult to rotate secrets without downtime
   - **Recommendation**: Implement versioned secrets

5. **No Secret Management Service Integration**
   - **Impact**: Manual secret management error-prone
   - **Recommendation**: Integrate AWS Secrets Manager or HashiCorp Vault

### Low Severity Issues (1)

6. **SKIP_SAUDI_VALIDATION Flag**
   - **File**: `.env.example`
   - **Issue**: Could be accidentally enabled in production
   - **Recommendation**: Add runtime check to prevent production use
   ```javascript
   if (process.env.NODE_ENV === 'production' && process.env.SKIP_SAUDI_VALIDATION === 'true') {
       throw new Error('SKIP_SAUDI_VALIDATION cannot be enabled in production');
   }
   ```

---

## 9. Best Practices Compliance

### ✅ Implemented Best Practices

1. **Principle of Least Privilege** - ✅
   - Minimal environment variable exposure
   - Only necessary services have access

2. **Separation of Concerns** - ✅
   - Config separated from code
   - Different .env files for different services

3. **Fail-Fast Validation** - ✅
   - Startup validation prevents runtime errors
   - Clear error messages

4. **Defense in Depth** - ✅
   - Multiple layers of validation
   - Encryption + authentication tags
   - Password hashing + salt

5. **Secure Defaults** - ⚠️ PARTIAL
   - Most defaults are secure
   - ❌ Docker database defaults are weak

6. **Documentation** - ✅
   - Excellent inline documentation
   - Clear setup instructions
   - Security warnings prominently displayed

### ⚠️ Missing Best Practices

1. **Secret Rotation** - Not implemented
2. **Secret Versioning** - Not implemented
3. **Centralized Secret Management** - Not implemented
4. **Secret Age Monitoring** - Not implemented
5. **Automated Security Scanning** - Limited

---

## 10. Recommendations

### Immediate Actions (High Priority)

1. **Fix Docker Compose Defaults**
   ```yaml
   # docker-compose.yml
   MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:?Error: MONGO_ROOT_PASSWORD is required}
   REDIS_PASSWORD=${REDIS_PASSWORD:?Error: REDIS_PASSWORD is required}
   ```

2. **Add Production Validation for SKIP_SAUDI_VALIDATION**
   ```javascript
   // src/utils/startupValidation.js
   if (process.env.NODE_ENV === 'production' && process.env.SKIP_SAUDI_VALIDATION === 'true') {
       throw new Error('SKIP_SAUDI_VALIDATION cannot be enabled in production environment');
   }
   ```

3. **Document Secret Rotation Procedures**
   - Create `SECURITY.md` with rotation procedures
   - Include step-by-step guides for each secret type
   - Define rotation schedules

### Short-Term Actions (Medium Priority)

4. **Implement JWT Secret Versioning**
   ```javascript
   // Support multiple active secrets
   JWT_SECRET_CURRENT=<current-secret>
   JWT_SECRET_PREVIOUS=<previous-secret>
   ```

5. **Add Secret Age Monitoring**
   - Track when secrets were last rotated
   - Alert when secrets are > 90 days old
   - Dashboard for secret health

6. **Enhance .env.example**
   - Add rotation recommendations
   - Include expiry date tracking
   - Document secret strength requirements

### Long-Term Actions (Low Priority)

7. **Integrate Secret Management Service**
   - Evaluate AWS Secrets Manager, HashiCorp Vault, Azure Key Vault
   - Implement automated secret rotation
   - Centralize secret distribution

8. **Implement Automated Security Scanning**
   - Add pre-commit hooks for secret detection
   - Integrate tools like git-secrets, truffleHog
   - CI/CD secret scanning

9. **Create Secret Audit Trail**
   - Log all secret access (without exposing values)
   - Track rotation history
   - Alert on anomalous access patterns

---

## 11. Testing Recommendations

### Security Testing Checklist

- [ ] Test application startup with missing required variables
- [ ] Verify placeholder values are rejected
- [ ] Test with invalid encryption key formats
- [ ] Verify JWT secret validation
- [ ] Test MongoDB connection with invalid URI
- [ ] Verify production-specific validations
- [ ] Test CORS with unauthorized origins
- [ ] Verify sensitive data masking in logs
- [ ] Test Docker deployment with missing .env
- [ ] Verify secret rotation procedures

### Penetration Testing Scenarios

- [ ] Attempt to access configuration endpoints without auth
- [ ] Try to extract secrets from error messages
- [ ] Test for timing attacks on secret comparison
- [ ] Verify log files don't contain secrets
- [ ] Test environment variable injection attacks
- [ ] Verify Docker container isolation

---

## 12. Compliance Considerations

### GDPR / PDPL
- ✅ Encryption of sensitive data
- ✅ Secure password policies
- ✅ Audit logging capabilities
- ⚠️ Secret retention policies not documented

### OWASP Top 10
- ✅ A02:2021 – Cryptographic Failures (Strong encryption, proper secret management)
- ✅ A05:2021 – Security Misconfiguration (Startup validation, secure defaults)
- ✅ A07:2021 – Identification and Authentication Failures (Strong password policies)
- ⚠️ A08:2021 – Software and Data Integrity Failures (No secret versioning)

### PCI DSS (if applicable)
- ✅ Encryption of cardholder data
- ⚠️ Key management procedures need documentation
- ⚠️ Quarterly key rotation not enforced

---

## 13. Conclusion

The traf3li-backend repository demonstrates **strong security practices** for environment variable and configuration management. The implementation includes:

- Comprehensive startup validation
- No hardcoded secrets
- Excellent documentation
- Strong encryption practices
- Proper separation of concerns

**Key Achievements:**
- 🏆 Zero hardcoded secrets found
- 🏆 Excellent fail-fast validation
- 🏆 Strong cryptographic implementations
- 🏆 Comprehensive security documentation

**Critical Improvement Areas:**
- 🔴 Default database credentials in Docker (HIGH)
- 🟡 No secret rotation mechanisms (MEDIUM)
- 🟡 Limited secret management automation (MEDIUM)

**Overall Assessment:** The repository is in **very good security posture** for configuration management, with some important improvements needed for production deployment, particularly around Docker default credentials and secret rotation procedures.

### Security Score Breakdown
- **Environment File Security**: 5/5 ⭐⭐⭐⭐⭐
- **Hardcoded Secrets**: 5/5 ⭐⭐⭐⭐⭐
- **Configuration Validation**: 5/5 ⭐⭐⭐⭐⭐
- **Secret Rotation**: 2/5 ⭐⭐
- **Docker Security**: 3/5 ⭐⭐⭐
- **Logging Security**: 5/5 ⭐⭐⭐⭐⭐

**Overall: 4.2/5 ⭐⭐⭐⭐**

---

## Appendix A: Files Scanned

### Environment Files
- `.env.example` (442 lines)
- `.env.captcha.example` (43 lines)
- `.env.webauthn.example` (69 lines)
- `test/.env` (empty)

### Configuration Files
- `src/config/permissions.config.js`
- `src/config/plans.config.js`
- `src/configs/s3.js`
- `src/configs/redis.js`
- `src/configs/db.js`
- `src/configs/sentry.js`

### Security Utilities
- `src/utils/startupValidation.js`
- `src/utils/generateToken.js`
- `src/utils/encryption.js`
- `src/utils/passwordPolicy.js`

### Middleware
- `src/middlewares/securityHeaders.middleware.js`
- `src/middlewares/security.middleware.js`
- `src/middlewares/cors.middleware.js`

### Docker Configuration
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `docker-compose.clamav.yml`

### Total Files Scanned: 112+ source files using process.env

---

## Appendix B: Environment Variable Inventory

### Critical Security Variables (Required)
- `JWT_SECRET` - Access token signing
- `JWT_REFRESH_SECRET` - Refresh token signing
- `ENCRYPTION_KEY` - Data encryption (AES-256-GCM)
- `MONGODB_URI` - Database connection

### Service API Keys (Optional but Recommended)
- `RESEND_API_KEY` - Email service
- `AWS_ACCESS_KEY_ID` - S3 storage
- `AWS_SECRET_ACCESS_KEY` - S3 storage
- `STRIPE_SECRET_KEY` - Payment processing
- `CLOUDINARY_API_SECRET` - Image storage
- `SENTRY_DSN` - Error tracking
- `REDIS_URL` - Cache and queues

### Third-Party Integrations (Optional)
- `RECAPTCHA_SECRET_KEY` - Google reCAPTCHA
- `HCAPTCHA_SECRET_KEY` - hCaptcha
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile
- `LEAN_APP_TOKEN` - Saudi banking
- `SADAD_API_KEY` - SADAD payment
- `ZATCA_API_KEY` - VAT invoicing
- `WHATSAPP_ACCESS_TOKEN` - WhatsApp API

### Configuration Variables
- `NODE_ENV` - Environment mode
- `PORT` - Server port
- `CLIENT_URL` - Frontend URL
- `DASHBOARD_URL` - Dashboard URL
- `ADMIN_IP_WHITELIST` - Admin IP restriction

### Feature Flags
- `ENABLE_MALWARE_SCAN` - ClamAV scanning
- `ENABLE_ACCOUNTING` - Accounting features
- `SKIP_SAUDI_VALIDATION` - ⚠️ Testing only
- `DISABLE_QUEUES` - Disable Bull queues
- `DISABLE_REDIS_CACHE` - Disable Redis cache

---

**Report Generated**: 2025-12-22
**Next Review Date**: 2026-03-22 (Quarterly)
**Reviewed By**: Claude Security Analyzer
**Classification**: Internal Security Assessment

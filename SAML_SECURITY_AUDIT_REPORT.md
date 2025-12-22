# SAML Security Audit Report
## Traf3li Backend Repository

**Repository:** https://github.com/mischa23v/traf3li-backend
**Audit Date:** 2025-12-22
**Library:** @node-saml/passport-saml v5.1.0
**Severity:** CRITICAL

---

## Executive Summary

This security audit identified **CRITICAL vulnerabilities** in the SAML/SSO implementation that could allow:
- **Replay attacks** - Attackers can reuse valid SAML assertions
- **Man-in-the-middle attacks** - Incomplete signature validation
- **Unauthorized access** - Bypassing authentication through SAML response manipulation
- **Attribute injection** - Unsanitized SAML attributes could lead to account takeover

**Overall Risk Level:** 🔴 **CRITICAL**

---

## 1. Signature Validation Vulnerabilities

### 🔴 CRITICAL: Incomplete SAML Response Signature Validation

**Location:** `/home/user/traf3li-backend/src/services/saml.service.js:136-137`

```javascript
// Security settings
wantAssertionsSigned: true,
wantAuthnResponseSigned: false,  // ❌ CRITICAL VULNERABILITY
```

**Issue:**
- Only the SAML **assertion** signature is validated (`wantAssertionsSigned: true`)
- The outer SAML **response** signature is NOT validated (`wantAuthnResponseSigned: false`)
- This allows attackers to modify the SAML response wrapper while keeping the inner assertion valid

**Attack Scenario:**
```xml
<samlp:Response>  <!-- This can be tampered with! -->
  <samlp:Status>
    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
  </samlp:Status>
  <saml:Assertion>  <!-- This is signed and validated -->
    <!-- Valid assertion content -->
  </saml:Assertion>
</samlp:Response>
```

An attacker could:
1. Intercept a valid SAML response
2. Extract the signed assertion
3. Wrap it in a new malicious response
4. Replay it to gain access

**Impact:** High - Allows SAML response tampering and potential authentication bypass

**Recommendation:**
```javascript
// Security settings
wantAssertionsSigned: true,
wantAuthnResponseSigned: true,  // ✅ MUST validate both
```

---

### 🔴 CRITICAL: SAML Requests Not Signed

**Location:** `/home/user/traf3li-backend/src/services/saml.service.js:62-109`

```xml
<md:SPSSODescriptor AuthnRequestsSigned="false"  <!-- ❌ Not signing requests -->
                    WantAssertionsSigned="true"
```

**Issue:**
- SAML authentication requests are NOT signed
- IdP cannot verify the request originated from legitimate SP
- Allows request forgery and manipulation

**Impact:** Medium - Opens door to authentication request tampering

**Recommendation:**
- Enable request signing: `AuthnRequestsSigned="true"`
- Implement SP certificate for signing
- Configure private key for signing operations

---

## 2. Replay Attack Prevention - MISSING

### 🔴 CRITICAL: No InResponseTo Validation

**Location:** `/home/user/traf3li-backend/src/services/saml.service.js:116-181`

**Missing Configurations:**
```javascript
// ❌ CRITICAL: These configurations are COMPLETELY MISSING
validateInResponseTo: 'always',        // NOT PRESENT
cacheProvider: customCacheProvider,     // NOT PRESENT
requestIdExpirationPeriodMs: 28800000  // NOT PRESENT (8 hours)
```

**Current State:**
- No validation that SAML response matches a specific request
- No request ID tracking
- No cache implementation for request/response correlation
- Default behavior: Does NOT validate InResponseTo

**Attack Scenario:**
1. Attacker intercepts valid SAML assertion for user@company.com
2. Attacker can replay this assertion unlimited times
3. Each replay grants unauthorized access
4. No expiration or single-use enforcement

**Proof from Documentation:**
According to [@node-saml/passport-saml documentation](https://github.com/node-saml/passport-saml):
> "When configured (turn validateInResponseTo to 'always' in the Node-SAML config), the InResponseTo attribute will be validated. Validation will succeed if Node-SAML previously generated a SAML request with an id that matches the value of InResponseTo."

**Multi-Server Risk:**
The default in-memory cache is insufficient for production:
> "For multiple server/process scenarios, this will not be sufficient as the server/process that generated the request id and stored in memory could be different than the server/process handling the SAML response."

**Impact:** Critical - Allows unlimited replay attacks, complete authentication bypass

**Recommendation:**
```javascript
// 1. Implement Redis-based cache provider
class RedisCacheProvider {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  async saveAsync(key, value) {
    const expiresIn = 28800000; // 8 hours
    await this.redis.setex(`saml:request:${key}`, expiresIn / 1000, value);
    return { createdAt: Date.now(), value };
  }

  async getAsync(key) {
    return await this.redis.get(`saml:request:${key}`);
  }

  async removeAsync(key) {
    const value = await this.redis.get(`saml:request:${key}`);
    await this.redis.del(`saml:request:${key}`);
    return value;
  }
}

// 2. Configure in SAML strategy
const samlOptions = {
  // ... existing options ...

  // Add replay attack protection
  validateInResponseTo: 'always',
  cacheProvider: new RedisCacheProvider(redisClient),
  requestIdExpirationPeriodMs: 28800000, // 8 hours

  // ... rest of options ...
};
```

---

## 3. Assertion Handling Vulnerabilities

### 🟡 MEDIUM: Excessive Clock Skew Tolerance

**Location:** `/home/user/traf3li-backend/src/services/saml.service.js:145`

```javascript
acceptedClockSkewMs: 5000,  // ⚠️ 5 seconds may be too permissive
```

**Issue:**
- 5-second clock skew allows assertions to be valid even if expired by 5 seconds
- Combined with missing replay protection, extends attack window
- Industry best practice: 1-2 seconds maximum

**Recommendation:**
```javascript
acceptedClockSkewMs: 2000,  // ✅ Reduce to 2 seconds
```

---

### 🟡 MEDIUM: Missing Explicit Assertion Validation

**Location:** `/home/user/traf3li-backend/src/services/saml.service.js`

**Missing Validations:**
- No explicit `NotBefore` validation
- No explicit `NotOnOrAfter` validation
- No explicit `SubjectConfirmation` validation
- No explicit `Recipient` URL validation
- No explicit `Audience` restriction validation

**Note:** While the library may perform some of these validations, they should be explicitly configured for defense in depth.

**Recommendation:**
Add explicit validation configuration:
```javascript
// Add to samlOptions
audience: `${baseUrl}/api/auth/saml/${firmId}`,
validateAudience: true,
validateRecipient: true,
```

---

## 4. Attribute Mapping Security Issues

### 🔴 HIGH: No Input Sanitization on SAML Attributes

**Location:** `/home/user/traf3li-backend/src/services/saml.service.js:189-255`

```javascript
mapSAMLAttributes(provider, profile) {
    const attributes = {};

    // ❌ Direct assignment without sanitization
    attributes.email = profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
        || profile.email || profile.nameID;
    attributes.firstName = profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname']
        || profile.firstName;
    // ... more direct assignments
}
```

**Issues:**
1. No validation of email format
2. No sanitization of name fields (could contain XSS payloads)
3. No length validation
4. No character whitelist enforcement
5. Email extracted from multiple sources without validation

**Attack Scenario:**
Malicious IdP or tampered assertion could inject:
```xml
<AttributeValue>
  <script>alert('XSS')</script>@evil.com
</AttributeValue>
```

**Impact:** High - XSS, data corruption, potential privilege escalation

**Recommendation:**
```javascript
// Add input sanitization
const sanitizeString = (str, maxLength = 255) => {
  if (!str || typeof str !== 'string') return '';

  // Remove control characters and trim
  const cleaned = str.replace(/[\x00-\x1F\x7F]/g, '').trim();

  // Limit length
  return cleaned.substring(0, maxLength);
};

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    throw CustomException('Invalid email format in SAML assertion', 400);
  }
  return email.toLowerCase();
};

// Apply in mapSAMLAttributes
attributes.email = validateEmail(rawEmail);
attributes.firstName = sanitizeString(rawFirstName, 100);
attributes.lastName = sanitizeString(rawLastName, 100);
```

---

### 🟡 MEDIUM: No Email Domain Validation

**Location:** `/home/user/traf3li-backend/src/services/saml.service.js:194`

**Issue:**
- No validation that email domain matches expected corporate domain
- Allows JIT provisioning from any email domain
- Could allow unauthorized access if IdP is compromised

**Recommendation:**
```javascript
// Validate email domain for firm
const firmDomain = firm.emailDomain; // e.g., "company.com"
if (firmDomain && !attributes.email.endsWith(`@${firmDomain}`)) {
  throw CustomException(
    `Email domain mismatch. Expected @${firmDomain}`,
    403
  );
}
```

---

### 🟡 MEDIUM: No Attribute Type Validation

**Location:** `/home/user/traf3li-backend/src/services/saml.service.js:211-212`

```javascript
attributes.groups = profile['http://schemas.microsoft.com/ws/2008/06/identity/claims/groups']
    || profile.groups || [];  // ❌ No validation that this is actually an array
```

**Issue:**
- Assumes `groups` is an array without validation
- Could cause runtime errors if malicious value provided
- No validation of group membership format

**Recommendation:**
```javascript
const rawGroups = profile['...groups'];
attributes.groups = Array.isArray(rawGroups)
  ? rawGroups.map(g => sanitizeString(g, 255)).filter(Boolean)
  : [];
```

---

## 5. Just-In-Time (JIT) Provisioning Risks

### 🟡 MEDIUM: Unrestricted Auto-Provisioning

**Location:** `/home/user/traf3li-backend/src/services/saml.service.js:278-293`

```javascript
if (!user) {
    // Create new user via JIT provisioning
    user = await this.createJITUser(firmId, attributes);  // ❌ No restrictions
}
```

**Issues:**
1. Any valid SAML assertion creates a user account
2. No domain whitelist for JIT provisioning
3. No approval workflow
4. No notification to admins
5. Default role assigned without validation

**Attack Scenario:**
1. Attacker compromises IdP credentials
2. Creates SAML assertion for fake.user@company.com
3. System automatically provisions account with 'lawyer' role
4. Attacker gains access to sensitive legal data

**Recommendation:**
```javascript
// Add JIT provisioning controls
if (!user) {
  // Check if JIT provisioning is enabled for this firm
  if (!firm.enterpriseSettings.ssoAllowJIT) {
    throw CustomException(
      'Your account does not exist. Contact your administrator.',
      403
    );
  }

  // Validate email domain whitelist
  const allowedDomains = firm.enterpriseSettings.ssoAllowedDomains || [];
  const emailDomain = attributes.email.split('@')[1];

  if (allowedDomains.length > 0 && !allowedDomains.includes(emailDomain)) {
    throw CustomException(
      `Email domain @${emailDomain} is not allowed for auto-provisioning`,
      403
    );
  }

  // Notify admins of new JIT user
  await notifyAdmins(firmId, {
    event: 'jit_user_created',
    email: attributes.email,
    timestamp: new Date()
  });

  user = await this.createJITUser(firmId, attributes);
}
```

---

## 6. Strategy Caching Issues

### 🟡 LOW: Stale Strategy Cache

**Location:** `/home/user/traf3li-backend/src/services/saml.service.js:116-120`

```javascript
async createSAMLStrategy(firmId) {
    // Check cache first
    if (this.strategies.has(firmId)) {
        return this.strategies.get(firmId);  // ⚠️ Could be stale
    }
```

**Issues:**
1. Cached strategies don't reflect configuration changes
2. Cache cleared only on manual config update
3. No TTL on cached strategies
4. Security config changes require server restart to take full effect

**Impact:** Low - Delayed security updates

**Recommendation:**
```javascript
// Add TTL to strategy cache
const STRATEGY_CACHE_TTL = 3600000; // 1 hour

async createSAMLStrategy(firmId) {
  const cached = this.strategies.get(firmId);

  if (cached && (Date.now() - cached.timestamp < STRATEGY_CACHE_TTL)) {
    return cached.strategy;
  }

  // ... create new strategy ...

  this.strategies.set(firmId, {
    strategy: strategy,
    timestamp: Date.now()
  });

  return strategy;
}
```

---

## 7. Certificate Validation

### ✅ ADEQUATE: Certificate Validation

**Location:** `/home/user/traf3li-backend/src/services/saml.service.js:365-405`

**Good:**
- Certificate format validation exists
- PEM encoding check
- Certificate storage in database

**Improvement Needed:**
- No certificate expiration check
- No certificate chain validation
- No certificate revocation checking (CRL/OCSP)

**Recommendation:**
```javascript
// Add certificate expiration check
const validateCertificate = (certPem) => {
  const forge = require('node-forge');

  try {
    const cert = forge.pki.certificateFromPem(certPem);
    const now = new Date();

    if (now < cert.validity.notBefore) {
      throw new Error('Certificate not yet valid');
    }

    if (now > cert.validity.notAfter) {
      throw new Error('Certificate has expired');
    }

    return true;
  } catch (error) {
    throw new Error(`Invalid certificate: ${error.message}`);
  }
};
```

---

## 8. Error Handling & Information Disclosure

### 🟡 MEDIUM: Verbose Error Messages

**Location:** `/home/user/traf3li-backend/src/controllers/saml.controller.js:109-127`

```javascript
if (error) {
    console.error('SAML authentication error:', error);

    // ⚠️ Exposes error details in redirect
    return response.redirect(
      `${frontendUrl}/login?error=sso_failed&message=${encodeURIComponent(error.message)}`
    );
}
```

**Issue:**
- Detailed error messages exposed to user
- Could reveal internal system information
- Helps attackers understand system behavior

**Recommendation:**
```javascript
// Use generic error messages for users, log details server-side
const userMessage = 'SSO login failed. Please try again or contact support.';

await auditLogService.log('sso_error', 'system', null, firmId, {
  errorMessage: error.message,
  errorStack: error.stack,
  firmId,
  timestamp: new Date()
});

return response.redirect(
  `${frontendUrl}/login?error=sso_failed&message=${encodeURIComponent(userMessage)}`
);
```

---

## Severity Summary

| Severity | Count | Issues |
|----------|-------|--------|
| 🔴 **CRITICAL** | 3 | No replay attack prevention, Incomplete signature validation, No input sanitization |
| 🟠 **HIGH** | 1 | Attribute injection vulnerabilities |
| 🟡 **MEDIUM** | 5 | Clock skew, Domain validation, JIT provisioning, Error disclosure, Missing validations |
| 🟢 **LOW** | 1 | Strategy caching |

---

## Compliance Impact

### OWASP Top 10 Violations

1. **A07:2021 - Identification and Authentication Failures**
   - Missing replay attack protection
   - Incomplete signature validation
   - Weak assertion validation

2. **A01:2021 - Broken Access Control**
   - Unrestricted JIT provisioning
   - No email domain validation

3. **A03:2021 - Injection**
   - No input sanitization on SAML attributes
   - Potential XSS via attribute values

### NCA ECC Framework Violations

- **ECC-2-1**: Authentication Mechanism - Incomplete implementation
- **ECC-2-2**: Session Management - Missing replay protection
- **ECC-3-1**: Input Validation - No sanitization of external data

---

## Immediate Actions Required

### Priority 1 (Deploy within 24 hours):
1. ✅ Enable `wantAuthnResponseSigned: true`
2. ✅ Implement `validateInResponseTo: 'always'`
3. ✅ Deploy Redis-based cache provider for request tracking
4. ✅ Add input sanitization to all SAML attribute mapping

### Priority 2 (Deploy within 1 week):
1. Enable SAML request signing
2. Implement email domain validation
3. Add JIT provisioning controls and admin notifications
4. Reduce clock skew to 2 seconds
5. Add certificate expiration validation

### Priority 3 (Deploy within 1 month):
1. Implement explicit assertion validation
2. Add strategy cache TTL
3. Improve error handling and reduce information disclosure
4. Add comprehensive SAML security tests
5. Implement monitoring and alerting for SAML failures

---

## Testing Recommendations

### Security Tests to Add:

1. **Replay Attack Test**
```javascript
describe('SAML Replay Attack Protection', () => {
  it('should reject replayed SAML assertions', async () => {
    const assertion = await captureValidAssertion();
    await authenticateWithAssertion(assertion); // First use - should succeed

    const result = await authenticateWithAssertion(assertion); // Replay - should fail
    expect(result.error).toBe('SAML_REPLAY_DETECTED');
  });
});
```

2. **Signature Validation Test**
```javascript
describe('SAML Signature Validation', () => {
  it('should reject tampered SAML responses', async () => {
    const response = await createValidResponse();
    const tampered = modifyResponse(response);

    const result = await authenticateWithResponse(tampered);
    expect(result.error).toBe('SIGNATURE_VALIDATION_FAILED');
  });
});
```

3. **Attribute Injection Test**
```javascript
describe('SAML Attribute Security', () => {
  it('should sanitize malicious attributes', async () => {
    const maliciousAssertion = {
      email: 'test@example.com',
      firstName: '<script>alert("XSS")</script>',
      lastName: 'User'
    };

    const user = await handleSAMLAssertion(firmId, maliciousAssertion);
    expect(user.firstName).not.toContain('<script>');
  });
});
```

---

## Monitoring & Detection

### Add Security Monitoring:

```javascript
// Detect replay attempts
await auditLogService.log('saml_replay_attempt', 'security', null, firmId, {
  requestId: inResponseTo,
  sourceIp: request.ip,
  userAgent: request.headers['user-agent'],
  severity: 'critical'
});

// Detect JIT provisioning
await auditLogService.log('saml_jit_user_created', 'security', userId, firmId, {
  email: attributes.email,
  ssoProvider: provider,
  sourceIp: request.ip,
  severity: 'medium'
});

// Detect signature failures
await auditLogService.log('saml_signature_failed', 'security', null, firmId, {
  firmId,
  ssoProvider: provider,
  errorMessage: error.message,
  severity: 'critical'
});
```

---

## Conclusion

The current SAML implementation has **CRITICAL security vulnerabilities** that could allow:
- Replay attacks enabling unlimited authentication bypasses
- SAML response tampering due to incomplete signature validation
- Attribute injection leading to XSS and data corruption
- Unrestricted account creation through JIT provisioning

**Immediate remediation is required before production deployment.**

---

## References

- [@node-saml/passport-saml Documentation](https://github.com/node-saml/passport-saml)
- [@node-saml/node-saml NPM Package](https://www.npmjs.com/package/@node-saml/node-saml)
- [SAML 2.0 Specification](http://docs.oasis-open.org/security/saml/v2.0/)
- [OWASP SAML Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html)

---

**Report Generated:** 2025-12-22
**Auditor:** Security Analysis Tool
**Classification:** Internal - Security Sensitive

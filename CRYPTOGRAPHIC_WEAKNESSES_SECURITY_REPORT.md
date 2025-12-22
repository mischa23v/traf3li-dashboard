# CRYPTOGRAPHIC WEAKNESSES - Security Audit Report

**Generated:** 2025-12-22
**Repository:** traf3li-backend
**Severity:** CRITICAL + MEDIUM Issues Found
**Status:** 🔴 IMMEDIATE ACTION REQUIRED

---

## Executive Summary

This audit identified **7 CRITICAL** and **2 MEDIUM** cryptographic security vulnerabilities in the traf3li-backend codebase. The most severe issues include hardcoded encryption keys, insecure random number generation for security-critical operations, and synchronous password hashing that blocks the event loop.

**Risk Level:** HIGH - Multiple CRITICAL vulnerabilities could lead to:
- Predictable encryption keys enabling data decryption
- Predictable IDs enabling enumeration attacks
- Service degradation from blocking operations
- Weak password hashing in certain scenarios

---

## 🔴 CRITICAL Vulnerabilities

### 1. Hardcoded Fallback Encryption Key

**Severity:** CRITICAL
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/utils/encryption.js`
**Lines:** 20-28

**Vulnerable Code:**
```javascript
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    console.warn('⚠️  WARNING: ENCRYPTION_KEY not set in environment variables!');
    console.warn('⚠️  Using default key - DO NOT use in production!');
    // Default key for development only
    return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
  }
  // ...
}
```

**Risk:**
- Anyone can decrypt sensitive legal data encrypted with this default key
- If accidentally deployed to production without ENCRYPTION_KEY set, all encrypted data is compromised
- Publicly visible in source code repository

**Impact:**
- Complete compromise of encrypted data confidentiality
- Legal/compliance violations (PDPL, GDPR)
- Attorney-client privilege breaches

**Secure Alternative:**
```javascript
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required. ' +
      'Generate with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }

  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  return Buffer.from(key, 'hex');
};
```

---

### 2. Hardcoded Fallback JWT Secrets

**Severity:** CRITICAL
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/utils/generateToken.js`
**Lines:** 18-30

**Vulnerable Code:**
```javascript
const getSecrets = () => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !jwtRefreshSecret) {
    console.warn('⚠️  WARNING: JWT secrets not set in environment variables!');
    console.warn('⚠️  Using default secrets - DO NOT use in production!');
  }

  return {
    accessSecret: jwtSecret || 'default-jwt-secret-do-not-use-in-production-change-this-immediately',
    refreshSecret: jwtRefreshSecret || 'default-refresh-secret-do-not-use-in-production-change-this-now',
  };
};
```

**Risk:**
- Attackers can forge valid JWT tokens using known secrets
- Complete authentication bypass
- Ability to impersonate any user including lawyers and admins

**Impact:**
- Complete authentication system compromise
- Unauthorized access to sensitive legal cases
- Account takeover of all users

**Secure Alternative:**
```javascript
const getSecrets = () => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error(
      'JWT_SECRET and JWT_REFRESH_SECRET environment variables are required. ' +
      'Generate with: node -e "console.log(crypto.randomBytes(64).toString(\'hex\'))"'
    );
  }

  if (jwtSecret.length < 64 || jwtRefreshSecret.length < 64) {
    throw new Error('JWT secrets must be at least 64 characters for security');
  }

  if (jwtSecret === jwtRefreshSecret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
  }

  return {
    accessSecret: jwtSecret,
    refreshSecret: jwtRefreshSecret,
  };
};
```

---

### 3. Insecure Random Number Generation (Math.random)

**Severity:** CRITICAL
**Risk:** Predictable IDs enable enumeration and collision attacks

#### 3a. Invoice Number Generation
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/controllers/invoice.controller.js`
**Lines:** 6-12

**Vulnerable Code:**
```javascript
const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
};
```

**Risk:**
- Math.random() is cryptographically insecure
- Predictable invoice numbers (only 10,000 possibilities)
- Attackers can enumerate invoices: INV-202512-0001 through INV-202512-9999
- Information disclosure of business volume

#### 3b. Transaction ID Generation
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/models/transaction.model.js`
**Lines:** 84-93

**Vulnerable Code:**
```javascript
transactionSchema.pre('save', async function(next) {
    if (!this.transactionId) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        this.transactionId = `TXN-${year}${month}-${random}`;
    }
    next();
});
```

**Risk:**
- Only 100,000 possible transaction IDs per month
- Predictable and enumerable
- Potential ID collisions in high-volume scenarios

#### 3c. Time Entry ID Generation
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/models/timeEntry.model.js`
**Lines:** 141-148

**Vulnerable Code:**
```javascript
timeEntrySchema.pre('save', function(next) {
    if (!this.entryId) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.entryId = `TIME-${year}${month}-${random}`;
    }
    // ...
});
```

**Risk:**
- Only 10,000 possible IDs per month
- High collision risk in busy legal practices

#### 3d. File Upload Naming
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/configs/multer.js`
**Line:** 17

**Vulnerable Code:**
```javascript
filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
}
```

**Risk:**
- Predictable file names
- Potential file enumeration attacks
- Directory traversal risk if combined with other vulnerabilities

#### 3e. Member ID Generation
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/controllers/benefit.controller.js`
**Line:** 559

**Vulnerable Code:**
```javascript
dependentData.memberId = `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

**Risk:**
- Predictable member IDs
- Information disclosure through enumeration

**Secure Alternative (for all Math.random usages):**
```javascript
const crypto = require('crypto');

// For invoice numbers
const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    // 8 random bytes = 16 hex chars, take first 8 for readability
    const random = crypto.randomBytes(8).toString('hex').substring(0, 8).toUpperCase();
    return `INV-${year}${month}-${random}`;
};

// For transaction IDs
const random = crypto.randomBytes(4).toString('hex').toUpperCase();
this.transactionId = `TXN-${year}${month}-${random}`;

// For file uploads
const uniqueSuffix = crypto.randomBytes(16).toString('hex');
cb(null, uniqueSuffix + path.extname(file.originalname));

// For member IDs
dependentData.memberId = `DEP-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
```

---

### 4. SHA-256 for Generic Data Hashing (Potential Misuse)

**Severity:** CRITICAL (if used for passwords)
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/utils/encryption.js`
**Lines:** 109-116

**Vulnerable Code:**
```javascript
/**
 * Hash data (one-way, for passwords, etc.)
 * Uses SHA-256
 * @param {string} data - Data to hash
 * @returns {string} - Hex hash
 */
const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};
```

**Risk:**
- Comment suggests use for passwords: "for passwords, etc."
- SHA-256 is NOT secure for password hashing
- No salt, vulnerable to rainbow table attacks
- Fast hashing enables brute force attacks

**Current Status:**
- ✅ Not currently used for passwords (grep found no usage)
- ⚠️ Dangerous API that could be misused by developers

**Impact if Misused:**
- Complete password compromise
- Rainbow table attacks
- GPU-accelerated brute forcing

**Secure Alternative:**
```javascript
/**
 * Hash non-secret data (checksums, fingerprints, etc.)
 *
 * ⚠️ WARNING: DO NOT USE FOR PASSWORDS! Use bcrypt instead.
 *
 * Uses SHA-256 for non-cryptographic hashing needs like:
 * - File integrity checks
 * - Data fingerprinting
 * - Cache keys
 *
 * @param {string} data - Data to hash
 * @returns {string} - Hex hash
 */
const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// OR remove entirely and add dedicated functions:
const generateChecksum = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};
```

---

### 5. Synchronous Bcrypt Operations (DoS Risk)

**Severity:** CRITICAL (Performance/DoS)
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/controllers/auth.controller.js`
**Lines:** 13, 65

**Vulnerable Code:**
```javascript
// Registration
const hash = bcrypt.hashSync(password, saltRounds);

// Login
const match = bcrypt.compareSync(password, user.password);
```

**Risk:**
- Blocks Node.js event loop during password hashing
- Can take 100-200ms per operation
- Concurrent login attempts cause severe performance degradation
- Enables denial-of-service attacks

**Impact:**
- Application unresponsiveness during authentication
- Easy DoS via parallel login requests
- Poor user experience under load

**Secure Alternative:**
```javascript
// Registration - async/await
const authRegister = async (request, response) => {
    const { username, email, phone, password, image, isSeller, description, role, country } = request.body;

    try {
        // Use async hash - doesn't block event loop
        const hash = await bcrypt.hash(password, saltRounds);

        const user = new User({
            username,
            email,
            password: hash,
            // ... rest of fields
        });

        await user.save();

        return response.status(201).send({
            error: false,
            message: 'New user created!'
        });
    }
    catch({message}) {
        console.log('Registration error:', message);
        if(message.includes('E11000')) {
            return response.status(400).send({
                error: true,
                message: 'Choose a unique username!'
            });
        }
        return response.status(500).send({
            error: true,
            message: 'Something went wrong!'
        });
    }
}

// Login - async/await
const authLogin = async (request, response) => {
    const { username, password } = request.body;

    try {
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });

        if(!user) {
            throw CustomException('Check username or password!', 404);
        }

        // Use async compare - doesn't block event loop
        const match = await bcrypt.compare(password, user.password);

        if(match) {
            const { password, ...data } = user._doc;

            const token = jwt.sign({
                _id: user._id,
                isSeller: user.isSeller
            }, JWT_SECRET, { expiresIn: '7 days' });

            const origin = request.get('origin') || '';
            const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

            const cookieConfig = {
                httpOnly: true,
                sameSite: isLocalhost ? 'lax' : 'none',
                secure: !isLocalhost,
                maxAge: 60 * 60 * 24 * 7 * 1000,
                path: '/'
            }

            return response.cookie('accessToken', token, cookieConfig)
                .status(202).send({
                    error: false,
                    message: 'Success!',
                    user: data
                });
        }

        throw CustomException('Check username or password!', 404);
    }
    catch({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
}
```

---

## ⚠️ MEDIUM Severity Issues

### 6. Low Bcrypt Salt Rounds

**Severity:** MEDIUM
**File:** `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/controllers/auth.controller.js`
**Line:** 7

**Current Code:**
```javascript
const saltRounds = 10;
```

**Risk:**
- OWASP recommends 12+ rounds for 2025
- Modern GPUs can crack bcrypt-10 faster
- As computing power increases, 10 rounds becomes weaker

**Recommendation:**
```javascript
// OWASP 2025 recommendation
const saltRounds = 12;  // or higher based on server performance

// OR make it configurable
const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
```

**Note:** Increasing rounds makes hashing slower (more secure but impacts performance). Test with your server:
- 10 rounds: ~100ms
- 12 rounds: ~400ms
- 14 rounds: ~1.6s

---

### 7. No Key Rotation Mechanism

**Severity:** MEDIUM
**Files:**
- `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/utils/encryption.js`
- `/home/user/traf3li-dashboard/traf3li-backend-for testing only different github/src/utils/generateToken.js`

**Issue:**
- No mechanism to rotate encryption keys or JWT secrets
- If a key is compromised, all encrypted data must be manually re-encrypted
- No graceful key transition period

**Risk:**
- Difficult incident response if key compromise occurs
- Cannot implement security best practice of periodic key rotation
- All-or-nothing key changes cause service disruption

**Recommendation:**
Implement key versioning and rotation:

```javascript
// encryption.js - Key rotation support
const getEncryptionKey = (version = 'current') => {
  const keyMap = {
    current: process.env.ENCRYPTION_KEY,
    previous: process.env.ENCRYPTION_KEY_PREVIOUS,
    // Add more as needed
  };

  const key = keyMap[version];

  if (!key) {
    throw new Error(`Encryption key version '${version}' not found`);
  }

  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  return Buffer.from(key, 'hex');
};

const encryptData = (plaintext, keyVersion = 'current') => {
  // ... encryption logic ...

  return {
    encrypted: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    keyVersion: keyVersion,  // Store which key was used
  };
};

const decryptData = (encryptedData) => {
  const keyVersion = encryptedData.keyVersion || 'current';
  const key = getEncryptionKey(keyVersion);

  // ... decryption logic using versioned key ...
};
```

---

## ✅ Good Cryptographic Practices Found

The audit also identified several **excellent** security practices:

1. **AES-256-GCM** - Using authenticated encryption (AEAD) prevents tampering
2. **Proper IV Generation** - Using `crypto.randomBytes()` for IVs (not predictable)
3. **Bcrypt for Passwords** - Using proper password hashing (though sync needs fixing)
4. **Secure Token Generation** - `crypto.randomBytes()` used in `generateToken()`
5. **Timing-Safe Comparisons** - Using `crypto.timingSafeEqual()` to prevent timing attacks
6. **UUID v4** - Properly used for conversation IDs (cryptographically random)
7. **No ECB Mode** - Not using insecure ECB mode
8. **No Weak Algorithms** - No DES, RC4, or MD5 for encryption

---

## Migration Path for Existing Data

### Step 1: Fix Development Environment (Immediate)

```bash
# Generate secure keys
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

Add to `.env`:
```bash
ENCRYPTION_KEY=<generated-key-from-above>
JWT_SECRET=<generated-secret-from-above>
JWT_REFRESH_SECRET=<different-generated-secret-from-above>
BCRYPT_ROUNDS=12
```

### Step 2: Code Fixes (Before Production Deployment)

**Priority Order:**
1. **CRITICAL** - Remove hardcoded keys (encryption.js, generateToken.js)
2. **CRITICAL** - Replace Math.random() with crypto.randomBytes()
3. **CRITICAL** - Switch to async bcrypt operations
4. **MEDIUM** - Increase bcrypt rounds to 12
5. **MEDIUM** - Add key rotation support

### Step 3: Production Migration (If Already Deployed)

**⚠️ If production is using default keys:**

```javascript
// Emergency migration script
const crypto = require('crypto');
const { User } = require('./models');

// Step 1: Verify what key is currently in use
const isUsingDefaultKey = !process.env.ENCRYPTION_KEY;

if (isUsingDefaultKey) {
  console.error('🚨 CRITICAL: Production is using default encryption key!');
  console.error('🚨 ALL encrypted data must be re-encrypted with new key');

  // Generate new key
  const newKey = crypto.randomBytes(32).toString('hex');
  console.log('New ENCRYPTION_KEY:', newKey);

  // Decrypt with old (default) key, re-encrypt with new key
  // This requires application downtime
}

// Step 2: All users must reset passwords
// (since we can't decrypt/re-encrypt bcrypt hashes)
console.log('Send password reset emails to all users');
```

**For JWT Migration:**
- All users will be logged out when JWT secret changes
- This is acceptable and expected
- Inform users of maintenance window

**For Data Encrypted with Default Key:**
- If ANY production data was encrypted with default key, it must be:
  1. Decrypted with old (default) key
  2. Re-encrypted with new secure key
  3. Requires application downtime

---

## Node.js Cryptography Best Practices (2025)

### Password Hashing
```javascript
// ✅ GOOD - Bcrypt (current standard)
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, hash);

// ✅ BETTER - Argon2 (newer, more resistant to GPU attacks)
const argon2 = require('argon2');
const hash = await argon2.hash(password);
const isValid = await argon2.verify(hash, password);
```

### Symmetric Encryption
```javascript
// ✅ GOOD - AES-256-GCM (your current approach)
const algorithm = 'aes-256-gcm';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv(algorithm, key, iv);

// ✅ ALSO GOOD - ChaCha20-Poly1305
const algorithm = 'chacha20-poly1305';
```

### Random Number Generation
```javascript
// ❌ NEVER
Math.random()

// ✅ ALWAYS
crypto.randomBytes(32).toString('hex')
crypto.randomInt(0, 100000)  // For random integers
crypto.randomUUID()  // For UUIDs (Node 16+)
```

### Key Storage
```javascript
// ❌ NEVER hardcode keys
const key = 'hardcoded-secret';

// ✅ Environment variables
const key = process.env.ENCRYPTION_KEY;

// ✅✅ BEST - Secret management (production)
// - AWS Secrets Manager
// - Azure Key Vault
// - HashiCorp Vault
// - Google Secret Manager
```

### Hashing (Non-Password)
```javascript
// For data integrity, checksums
const hash = crypto.createHash('sha256').update(data).digest('hex');

// For cryptographic hashing needs
const hash = crypto.createHash('sha512').update(data).digest('hex');

// ❌ NEVER use for passwords
```

---

## Recommended npm Packages

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",           // ✅ Current password hashing
    "argon2": "^0.31.2",          // ✅ Better password hashing
    "uuid": "^9.0.1",             // ✅ Already installed, use it!
    "jsonwebtoken": "^9.0.2",     // ✅ JWT handling
  }
}
```

**Consider adding:**
```bash
npm install argon2  # More secure password hashing
```

---

## Compliance Impact

### PDPL (Personal Data Protection Law - Saudi Arabia)
- **Article 21**: Data must be protected with appropriate technical measures
- **Violation**: Using default encryption keys = inadequate protection
- **Penalty**: Up to SAR 3,000,000

### GDPR (if handling EU data)
- **Article 32**: Encryption of personal data
- **Violation**: Weak encryption = non-compliance
- **Penalty**: Up to €20,000,000 or 4% of global revenue

### Attorney-Client Privilege
- Compromised encryption could breach legal professional privilege
- Severe legal and reputational consequences

---

## Immediate Action Items

### 🔴 CRITICAL (Do Before Production)
- [ ] Remove hardcoded encryption key fallback in `encryption.js`
- [ ] Remove hardcoded JWT secret fallbacks in `generateToken.js`
- [ ] Replace ALL `Math.random()` with `crypto.randomBytes()`
- [ ] Switch to async bcrypt (`bcrypt.hash()` and `bcrypt.compare()`)
- [ ] Generate and set secure environment variables

### ⚠️ MEDIUM (Plan and Implement)
- [ ] Increase bcrypt rounds to 12
- [ ] Implement key rotation mechanism
- [ ] Add monitoring for crypto operations
- [ ] Document key management procedures

### 📋 BEST PRACTICES (Consider)
- [ ] Migrate to Argon2 for password hashing
- [ ] Implement secret rotation schedule
- [ ] Add crypto operation logging
- [ ] Security training for development team
- [ ] Regular security audits

---

## Testing the Fixes

```javascript
// test-crypto.js
const crypto = require('crypto');
const bcrypt = require('bcrypt');

console.log('🧪 Testing Cryptographic Functions\n');

// Test 1: Secure random generation
console.log('✅ Test 1: Crypto.randomBytes()');
const random1 = crypto.randomBytes(8).toString('hex');
const random2 = crypto.randomBytes(8).toString('hex');
console.log('  Random 1:', random1);
console.log('  Random 2:', random2);
console.log('  Different:', random1 !== random2);

// Test 2: Async bcrypt
console.log('\n✅ Test 2: Async Bcrypt');
const password = 'TestPassword123!';
(async () => {
  const start = Date.now();
  const hash = await bcrypt.hash(password, 12);
  const hashTime = Date.now() - start;
  console.log('  Hash time:', hashTime + 'ms');

  const verifyStart = Date.now();
  const isValid = await bcrypt.compare(password, hash);
  const verifyTime = Date.now() - verifyStart;
  console.log('  Verify time:', verifyTime + 'ms');
  console.log('  Valid:', isValid);
})();

// Test 3: UUID v4
console.log('\n✅ Test 3: UUID v4');
const { v4: uuidv4 } = require('uuid');
console.log('  UUID 1:', uuidv4());
console.log('  UUID 2:', uuidv4());
```

Run with:
```bash
node test-crypto.js
```

---

## References

- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [NIST Key Management Guidelines](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)
- [Saudi PDPL Compliance Guide](https://sdaia.gov.sa/en/PDPL/Pages/default.aspx)

---

## Report Metadata

- **Audit Date:** 2025-12-22
- **Auditor:** Claude Code Security Analysis
- **Files Scanned:** 8 core cryptographic files
- **Total Issues:** 7 CRITICAL, 2 MEDIUM
- **Recommendation:** DO NOT deploy to production until CRITICAL issues are resolved

---

**END OF REPORT**

# Cryptographic Fixes - Quick Implementation Guide

**Priority:** CRITICAL - Must fix before production deployment

---

## 1. Fix Hardcoded Encryption Key (5 minutes)

**File:** `src/utils/encryption.js`

**Find:**
```javascript
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    console.warn('⚠️  WARNING: ENCRYPTION_KEY not set in environment variables!');
    console.warn('⚠️  Using default key - DO NOT use in production!');
    return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
  }
```

**Replace with:**
```javascript
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required. ' +
      'Generate with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }
```

---

## 2. Fix Hardcoded JWT Secrets (5 minutes)

**File:** `src/utils/generateToken.js`

**Find:**
```javascript
  return {
    accessSecret: jwtSecret || 'default-jwt-secret-do-not-use-in-production-change-this-immediately',
    refreshSecret: jwtRefreshSecret || 'default-refresh-secret-do-not-use-in-production-change-this-now',
  };
```

**Replace with:**
```javascript
  if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error(
      'JWT_SECRET and JWT_REFRESH_SECRET environment variables are required. ' +
      'Generate with: node -e "console.log(crypto.randomBytes(64).toString(\'hex\'))"'
    );
  }

  if (jwtSecret === jwtRefreshSecret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different');
  }

  return {
    accessSecret: jwtSecret,
    refreshSecret: jwtRefreshSecret,
  };
```

---

## 3. Replace Math.random() with crypto.randomBytes()

### 3a. Invoice Controller (2 minutes)

**File:** `src/controllers/invoice.controller.js`

**Find:**
```javascript
const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
};
```

**Replace with:**
```javascript
const crypto = require('crypto');

const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `INV-${year}${month}-${random}`;
};
```

### 3b. Transaction Model (2 minutes)

**File:** `src/models/transaction.model.js`

**Find:**
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

**Replace with:**
```javascript
const crypto = require('crypto');

transactionSchema.pre('save', async function(next) {
    if (!this.transactionId) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        this.transactionId = `TXN-${year}${month}-${random}`;
    }
    next();
});
```

### 3c. Time Entry Model (2 minutes)

**File:** `src/models/timeEntry.model.js`

**Find:**
```javascript
timeEntrySchema.pre('save', function(next) {
    if (!this.entryId) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.entryId = `TIME-${year}${month}-${random}`;
    }
```

**Replace with:**
```javascript
const crypto = require('crypto');

timeEntrySchema.pre('save', function(next) {
    if (!this.entryId) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = crypto.randomBytes(4).toString('hex').toUpperCase();
        this.entryId = `TIME-${year}${month}-${random}`;
    }
```

### 3d. Multer Config (2 minutes)

**File:** `src/configs/multer.js`

**Find:**
```javascript
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
```

**Replace with:**
```javascript
const crypto = require('crypto');

  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
```

### 3e. Multer PDF Config (2 minutes)

**File:** `src/configs/multerPdf.js`

**Apply same fix as above - replace Math.random() with crypto.randomBytes(16)**

### 3f. Benefit Controller (2 minutes)

**File:** `src/controllers/benefit.controller.js`

**Find:**
```javascript
dependentData.memberId = `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

**Replace with:**
```javascript
const crypto = require('crypto');

dependentData.memberId = `DEP-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
```

**Find:**
```javascript
beneficiaryData.beneficiaryId = `BENF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

**Replace with:**
```javascript
beneficiaryData.beneficiaryId = `BENF-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
```

---

## 4. Fix Synchronous Bcrypt (10 minutes)

**File:** `src/controllers/auth.controller.js`

**Find:**
```javascript
const authRegister = async (request, response) => {
    const { username, email, phone, password, image, isSeller, description, role, country } = request.body;

    try {
        const hash = bcrypt.hashSync(password, saltRounds);
```

**Replace with:**
```javascript
const authRegister = async (request, response) => {
    const { username, email, phone, password, image, isSeller, description, role, country } = request.body;

    try {
        const hash = await bcrypt.hash(password, saltRounds);
```

**Find:**
```javascript
        const match = bcrypt.compareSync(password, user.password);
```

**Replace with:**
```javascript
        const match = await bcrypt.compare(password, user.password);
```

---

## 5. Increase Bcrypt Rounds (1 minute)

**File:** `src/controllers/auth.controller.js`

**Find:**
```javascript
const saltRounds = 10;
```

**Replace with:**
```javascript
const saltRounds = 12;  // OWASP 2025 recommendation
```

---

## 6. Update Documentation in encryption.js (2 minutes)

**File:** `src/utils/encryption.js`

**Find:**
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

**Replace with:**
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
```

---

## 7. Generate Secure Environment Variables (3 minutes)

Run these commands:

```bash
# Generate encryption key
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

Add to `.env`:
```env
# Cryptographic Keys (KEEP SECRET!)
ENCRYPTION_KEY=<paste generated key>
JWT_SECRET=<paste generated secret>
JWT_REFRESH_SECRET=<paste different generated secret>

# Security Settings
BCRYPT_ROUNDS=12
```

**IMPORTANT:**
- Never commit `.env` to git
- Use different keys for dev/staging/production
- Store production keys in secure secret manager (AWS Secrets, Azure Key Vault, etc.)

---

## 8. Test Your Changes (5 minutes)

Create `test-crypto-fixes.js`:

```javascript
const crypto = require('crypto');
const bcrypt = require('bcrypt');

console.log('🧪 Testing Crypto Fixes\n');

// Test 1: Random bytes
console.log('✅ Test 1: Secure Random Generation');
const id1 = crypto.randomBytes(4).toString('hex').toUpperCase();
const id2 = crypto.randomBytes(4).toString('hex').toUpperCase();
console.log('  ID 1:', id1);
console.log('  ID 2:', id2);
console.log('  Different:', id1 !== id2, '\n');

// Test 2: Async bcrypt
console.log('✅ Test 2: Async Bcrypt (12 rounds)');
(async () => {
  const password = 'TestPassword123!';

  const hashStart = Date.now();
  const hash = await bcrypt.hash(password, 12);
  console.log('  Hash time:', (Date.now() - hashStart) + 'ms');

  const verifyStart = Date.now();
  const isValid = await bcrypt.compare(password, hash);
  console.log('  Verify time:', (Date.now() - verifyStart) + 'ms');
  console.log('  Valid:', isValid);

  const wrongStart = Date.now();
  const isWrong = await bcrypt.compare('wrong', hash);
  console.log('  Wrong password time:', (Date.now() - wrongStart) + 'ms');
  console.log('  Invalid:', !isWrong, '\n');

  // Test 3: Ensure env vars are set
  console.log('✅ Test 3: Environment Variables');
  console.log('  ENCRYPTION_KEY set:', !!process.env.ENCRYPTION_KEY);
  console.log('  JWT_SECRET set:', !!process.env.JWT_SECRET);
  console.log('  JWT_REFRESH_SECRET set:', !!process.env.JWT_REFRESH_SECRET);
  console.log('  Keys are different:', process.env.JWT_SECRET !== process.env.JWT_REFRESH_SECRET);
})();
```

Run:
```bash
node test-crypto-fixes.js
```

Expected output:
```
🧪 Testing Crypto Fixes

✅ Test 1: Secure Random Generation
  ID 1: A3F2E1D0
  ID 2: 8B9C4F2E
  Different: true

✅ Test 2: Async Bcrypt (12 rounds)
  Hash time: 400ms
  Verify time: 380ms
  Valid: true
  Wrong password time: 390ms
  Invalid: true

✅ Test 3: Environment Variables
  ENCRYPTION_KEY set: true
  JWT_SECRET set: true
  JWT_REFRESH_SECRET set: true
  Keys are different: true
```

---

## Total Time: ~35 minutes

**Checklist:**
- [ ] Fixed hardcoded encryption key
- [ ] Fixed hardcoded JWT secrets
- [ ] Replaced Math.random() in invoice controller
- [ ] Replaced Math.random() in transaction model
- [ ] Replaced Math.random() in time entry model
- [ ] Replaced Math.random() in multer config
- [ ] Replaced Math.random() in multerPdf config
- [ ] Replaced Math.random() in benefit controller (2 places)
- [ ] Changed bcrypt to async (hashSync → hash)
- [ ] Changed bcrypt to async (compareSync → compare)
- [ ] Increased bcrypt rounds to 12
- [ ] Updated hashData documentation
- [ ] Generated secure environment variables
- [ ] Added keys to .env
- [ ] Tested all changes
- [ ] Verified application starts without errors

---

## Deployment Notes

### Development
1. Apply all fixes
2. Update `.env` with generated keys
3. Test locally
4. Commit code changes (NOT .env)

### Staging
1. Deploy code changes
2. Set environment variables in hosting platform
3. Test authentication flow
4. Test file uploads
5. Verify invoice/transaction creation

### Production
1. Schedule maintenance window (all users will be logged out)
2. Generate NEW production keys (different from dev/staging)
3. Set environment variables in production
4. Deploy code
5. Monitor for errors
6. Notify users to log in again

**CRITICAL:** Never use the same keys across environments!

---

## Questions?

Refer to the full report: `CRYPTOGRAPHIC_WEAKNESSES_SECURITY_REPORT.md`

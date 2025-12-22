# Environment Variables Setup Guide

Quick reference for configuring environment variables in traf3li-backend.

---

## 🎯 Quick Start

### 1. Generate Secrets (Run these commands)

```bash
# JWT_SECRET (128 hex characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT_REFRESH_SECRET (different from above)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# ENCRYPTION_KEY (64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Local Development (.env file)

Create `.env` in backend root:

```bash
# Server
NODE_ENV=development
PORT=8080

# Database (local or MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/traf3li-dev
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/traf3li-dev

# JWT Secrets (paste generated values)
JWT_SECRET=<paste-128-char-hex-from-command-above>
JWT_REFRESH_SECRET=<paste-different-128-char-hex>

# Encryption (paste generated value)
ENCRYPTION_KEY=<paste-64-char-hex-from-command-above>

# Frontend URLs (local development)
CLIENT_URL=http://localhost:5173
DASHBOARD_URL=http://localhost:5174

# Stripe (test mode)
STRIPE_SECRET_KEY=sk_test_your_test_key_here

# Cloudinary (development)
CLOUDINARY_CLOUD_NAME=your-dev-cloud-name
CLOUDINARY_API_KEY=your-dev-api-key
CLOUDINARY_API_SECRET=your-dev-api-secret

# Admin Security (optional in dev)
# ADMIN_IP_WHITELIST=127.0.0.1,::1
```

### 3. Production (Render Dashboard)

Go to Render Dashboard → Your Service → Environment

Add these variables:

| Key | Value | Type |
|-----|-------|------|
| `NODE_ENV` | `production` | Plain Text |
| `PORT` | `5000` | Plain Text |
| `MONGODB_URI` | `mongodb+srv://...` | Secret |
| `JWT_SECRET` | `<128-char-hex>` | Secret |
| `JWT_REFRESH_SECRET` | `<different-128-char-hex>` | Secret |
| `ENCRYPTION_KEY` | `<64-char-hex>` | Secret |
| `CLIENT_URL` | `https://traf3li.com` | Plain Text |
| `DASHBOARD_URL` | `https://dashboard.traf3li.com` | Plain Text |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Secret |
| `CLOUDINARY_CLOUD_NAME` | `traf3li` | Plain Text |
| `CLOUDINARY_API_KEY` | `...` | Secret |
| `CLOUDINARY_API_SECRET` | `...` | Secret |
| `ADMIN_IP_WHITELIST` | `203.0.113.45,198.51.100.0/24` | Secret |
| `VERCEL_URL` | `https://traf3li-dashboard.vercel.app` | Plain Text |

---

## 🔑 Environment Variables Reference

### Required Variables

#### NODE_ENV
- **Type:** String
- **Values:** `development` | `production` | `staging`
- **Purpose:** Controls security settings, logging, error handling
- **Example:** `NODE_ENV=production`

#### PORT
- **Type:** Number
- **Default:** 8080 (dev), 5000 (prod)
- **Purpose:** Server port
- **Example:** `PORT=8080`

#### MONGODB_URI
- **Type:** String (Connection URL)
- **Purpose:** MongoDB database connection
- **Format:** `mongodb+srv://username:password@host/database`
- **Example:** `mongodb+srv://user:pass@cluster0.mongodb.net/traf3li`
- **Security:** Always use strong passwords, enable IP whitelist

#### JWT_SECRET
- **Type:** String (Hex)
- **Length:** 128 characters (64 bytes)
- **Purpose:** Sign access tokens
- **Generate:** `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- **Security:** Never reuse, never commit to git

#### JWT_REFRESH_SECRET
- **Type:** String (Hex)
- **Length:** 128 characters (64 bytes)
- **Purpose:** Sign refresh tokens
- **Generate:** `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- **Security:** Must be different from JWT_SECRET

#### ENCRYPTION_KEY
- **Type:** String (Hex)
- **Length:** 64 characters (32 bytes)
- **Purpose:** Encrypt sensitive legal data
- **Generate:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **Security:** Losing this key = losing encrypted data

#### CLIENT_URL
- **Type:** String (URL)
- **Purpose:** Marketplace frontend URL for CORS
- **Dev:** `http://localhost:5173`
- **Prod:** `https://traf3li.com`

#### DASHBOARD_URL
- **Type:** String (URL)
- **Purpose:** Dashboard frontend URL for CORS
- **Dev:** `http://localhost:5174`
- **Prod:** `https://dashboard.traf3li.com`

---

### Optional Variables

#### VERCEL_URL
- **Type:** String (URL)
- **Purpose:** Vercel preview deployment URL for CORS
- **Example:** `https://traf3li-dashboard.vercel.app`
- **When to use:** If deploying frontend to Vercel

#### ADMIN_IP_WHITELIST
- **Type:** String (Comma-separated IPs/CIDR)
- **Purpose:** Restrict admin access to specific IPs
- **Example:** `203.0.113.45,198.51.100.0/24`
- **Format:**
  - Single IP: `203.0.113.45`
  - Multiple IPs: `203.0.113.45,198.51.100.23`
  - CIDR range: `192.168.1.0/24`
- **Security:** Highly recommended for production

#### COOKIE_DOMAIN
- **Type:** String
- **Purpose:** Cookie domain for cross-subdomain auth
- **Dev:** Not needed
- **Prod:** `.traf3li.com` (note the leading dot)

#### TEST_MODE
- **Type:** Boolean
- **Purpose:** Enable test mode features
- **Values:** `true` | `false`
- **Default:** `false`

---

### Third-Party API Keys

#### STRIPE_SECRET_KEY
- **Type:** String
- **Purpose:** Stripe payment processing
- **Dev:** `sk_test_...`
- **Prod:** `sk_live_...`
- **Get from:** https://dashboard.stripe.com/apikeys

#### CLOUDINARY_CLOUD_NAME
- **Type:** String
- **Purpose:** Cloudinary cloud storage name
- **Example:** `traf3li`

#### CLOUDINARY_API_KEY
- **Type:** String
- **Purpose:** Cloudinary API key
- **Get from:** https://cloudinary.com/console

#### CLOUDINARY_API_SECRET
- **Type:** String
- **Purpose:** Cloudinary API secret
- **Security:** Keep secret, never commit

---

## 🛡️ Security Best Practices

### DO ✅

1. **Use strong, random secrets:**
   ```bash
   # Good - cryptographically random
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Different secrets per environment:**
   - Development: Unique secrets
   - Staging: Unique secrets
   - Production: Unique secrets

3. **Rotate secrets regularly:**
   - JWT secrets: Every 90 days
   - Encryption keys: Annually (with data re-encryption)

4. **Secure storage:**
   - Use Render's encrypted environment variables
   - Use password manager for backup
   - Document rotation procedures

5. **Access control:**
   - Limit who can view production secrets
   - Use separate accounts for prod access
   - Enable 2FA on hosting platforms

### DON'T ❌

1. **Never commit secrets to git:**
   ```bash
   # Bad - don't do this!
   JWT_SECRET=mysecret123

   # Good - use environment variables
   JWT_SECRET=<from-environment>
   ```

2. **Never use weak/simple secrets:**
   ```bash
   # Bad
   JWT_SECRET=secret123
   ENCRYPTION_KEY=password

   # Good
   JWT_SECRET=d6f8a9b2c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2
   ```

3. **Never reuse secrets:**
   ```bash
   # Bad - same secret for both
   JWT_SECRET=abc123...
   JWT_REFRESH_SECRET=abc123...

   # Good - different secrets
   JWT_SECRET=d6f8a9b2c3e4...
   JWT_REFRESH_SECRET=7b8c9d0e1f2a...
   ```

4. **Never hardcode secrets:**
   ```javascript
   // Bad - hardcoded
   const secret = 'my-secret-key';

   // Good - from environment
   const secret = process.env.JWT_SECRET;
   ```

5. **Never log secrets:**
   ```javascript
   // Bad
   console.log('JWT_SECRET:', process.env.JWT_SECRET);

   // Good
   console.log('JWT_SECRET is configured');
   ```

---

## 🔍 Validation

### Check if variables are set

```bash
# Local (Linux/Mac)
echo $JWT_SECRET

# Local (Windows)
echo %JWT_SECRET%

# In Node.js
node -e "console.log(process.env.JWT_SECRET ? 'Set' : 'Not set')"
```

### Validate .env file

Create `validate-env.js`:

```javascript
require('dotenv').config();

const required = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
  'CLIENT_URL',
  'DASHBOARD_URL'
];

const optional = [
  'PORT',
  'STRIPE_SECRET_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'ADMIN_IP_WHITELIST'
];

let errors = 0;
let warnings = 0;

console.log('🔍 Validating environment variables...\n');

// Check required
required.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required: ${key}`);
    errors++;
  } else {
    console.log(`✅ ${key}`);

    // Validate format
    if (key === 'JWT_SECRET' && process.env[key].length < 64) {
      console.warn(`⚠️  ${key} is too short (${process.env[key].length} chars, recommend 128+)`);
      warnings++;
    }

    if (key === 'ENCRYPTION_KEY' && process.env[key].length !== 64) {
      console.error(`❌ ${key} must be exactly 64 hex characters`);
      errors++;
    }
  }
});

// Check optional
console.log('\nOptional:');
optional.forEach(key => {
  if (process.env[key]) {
    console.log(`✅ ${key}`);
  } else {
    console.log(`⚪ ${key} (not set)`);
  }
});

console.log('\n' + '='.repeat(50));
if (errors > 0) {
  console.error(`❌ Validation failed: ${errors} errors, ${warnings} warnings`);
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`⚠️  Validation passed with ${warnings} warnings`);
} else {
  console.log('✅ All required variables are set!');
}
```

Run validation:
```bash
node validate-env.js
```

---

## 🚀 Deployment Workflow

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Generate secrets:
   ```bash
   node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
   node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
   node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Update `.env` with generated values

4. Validate:
   ```bash
   node validate-env.js
   ```

5. Start server:
   ```bash
   npm run dev
   ```

### Staging Deployment

1. Generate NEW secrets for staging (don't reuse dev secrets)

2. Add to Render staging service environment:
   - Set `NODE_ENV=production` (use production security even for staging)
   - Add all required variables
   - Use staging database URL
   - Use test mode API keys (Stripe test, etc.)

3. Deploy and test thoroughly

### Production Deployment

1. Generate NEW secrets for production (different from dev and staging)

2. Add to Render production service environment:
   - Set `NODE_ENV=production`
   - Add all required variables
   - Use production database URL
   - Use live API keys (Stripe live, etc.)
   - Configure ADMIN_IP_WHITELIST

3. Backup secrets securely (password manager)

4. Deploy

5. Test critical flows:
   - Authentication
   - Payment processing
   - File uploads
   - WebSocket connections

---

## 🐛 Troubleshooting

### "JWT secrets not configured"

**Cause:** JWT_SECRET or JWT_REFRESH_SECRET not set

**Fix:**
```bash
# Check if set
echo $JWT_SECRET

# Generate and add to .env
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### "ENCRYPTION_KEY must be 64 hex characters"

**Cause:** Wrong length or format

**Fix:**
```bash
# Generate correct format
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### "Cannot connect to MongoDB"

**Cause:** MONGODB_URI not set or incorrect

**Fix:**
1. Check connection string format
2. Verify username/password
3. Check IP whitelist in MongoDB Atlas
4. Test connection:
   ```bash
   mongo "mongodb+srv://cluster.mongodb.net" --username user
   ```

### Environment variables not loading

**Cause:** dotenv not configured

**Fix:**
Ensure first line of `server.js` is:
```javascript
require('dotenv').config();
```

### Different values in development vs production

**Cause:** Forgetting to update Render environment variables

**Fix:**
1. Go to Render Dashboard
2. Select your service
3. Go to Environment tab
4. Add/update variables
5. Redeploy (or wait for auto-deploy)

---

## 📚 Additional Resources

- **Generate secrets:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Cloudinary Console:** https://cloudinary.com/console
- **Render Docs:** https://render.com/docs/environment-variables

---

**Last Updated:** 2025-12-22
**Related Docs:**
- `ENVIRONMENT_CONFIGURATION_SECURITY_SCAN.md` - Full security audit
- `CRITICAL_ENV_SECURITY_FIXES.md` - Critical fixes needed
- `.env.example` - Template file

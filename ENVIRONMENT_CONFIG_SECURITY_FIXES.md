# Environment & Configuration Security - Quick Fix Guide

**Priority**: HIGH
**Estimated Time**: 2-4 hours
**Complexity**: Medium

---

## Immediate Fixes Required (Before Production)

### 🔴 CRITICAL: Fix Docker Compose Default Credentials

**Issue**: Weak default passwords in docker-compose.yml
**Risk**: Database compromise if deployed with defaults
**Time**: 15 minutes

**Fix 1: Remove MongoDB Default Password**

```yaml
# File: docker-compose.yml
# Lines 57-58

# BEFORE (INSECURE):
- MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER:-admin}
- MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:-changeme}

# AFTER (SECURE):
- MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER:?Error: MONGO_ROOT_USER must be set in .env}
- MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:?Error: MONGO_ROOT_PASSWORD must be set in .env}
```

**Fix 2: Require Redis Password**

```yaml
# File: docker-compose.yml
# Line 81

# BEFORE (INSECURE):
command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-}

# AFTER (SECURE):
command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:?Error: REDIS_PASSWORD must be set in .env}
```

**Fix 3: Update .env.example**

Add to `.env.example`:
```bash
# Docker Database Credentials (REQUIRED for docker-compose)
# Generate strong passwords:
# - openssl rand -base64 32
# - node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=GENERATE_SECURE_PASSWORD_HERE
REDIS_PASSWORD=GENERATE_SECURE_PASSWORD_HERE
```

---

### 🔴 CRITICAL: Add Production Validation Check

**Issue**: SKIP_SAUDI_VALIDATION could be accidentally enabled in production
**Risk**: Bypassing regulatory compliance validations
**Time**: 10 minutes

**File**: `src/utils/startupValidation.js`
**Add after line 204** (in production checks section):

```javascript
// Prevent validation bypass in production
if (process.env.SKIP_SAUDI_VALIDATION === 'true') {
    errors.push(
        'SKIP_SAUDI_VALIDATION cannot be enabled in production. ' +
        'This flag is for testing/development only and bypasses Saudi regulatory validations.'
    );
}
```

---

## High Priority Improvements (Next Sprint)

### 🟡 Document Secret Rotation Procedures

**Time**: 2-3 hours

**Create**: `SECURITY.md` in repository root

```markdown
# Security & Secret Management

## Secret Rotation Schedule

### Critical Secrets (Every 90 Days)
- JWT_SECRET
- JWT_REFRESH_SECRET
- ENCRYPTION_KEY

### Service API Keys (Every 180 Days)
- RESEND_API_KEY
- STRIPE_SECRET_KEY
- AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY

### Database Credentials (Every 90 Days)
- MONGODB_URI credentials
- REDIS_PASSWORD

## Rotation Procedure

### JWT Secret Rotation (Zero-Downtime)

**Step 1: Add New Secret**
\`\`\`bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
JWT_SECRET_NEW=<new-secret>
JWT_SECRET_OLD=$JWT_SECRET
\`\`\`

**Step 2: Update Code to Support Both**
\`\`\`javascript
// src/utils/generateToken.js
const getSecrets = () => {
    return {
        accessSecret: process.env.JWT_SECRET_NEW || process.env.JWT_SECRET,
        accessSecretOld: process.env.JWT_SECRET_OLD,
        // ... rest
    };
};

// Verify with both secrets (try new, fallback to old)
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, getSecrets().accessSecret);
    } catch (err1) {
        if (getSecrets().accessSecretOld) {
            try {
                return jwt.verify(token, getSecrets().accessSecretOld);
            } catch (err2) {
                throw err1; // Throw original error
            }
        }
        throw err1;
    }
};
\`\`\`

**Step 3: Deploy & Monitor**
- Deploy updated code
- Monitor for errors
- Wait 24 hours (2x token expiry)

**Step 4: Remove Old Secret**
\`\`\`bash
# Update .env
JWT_SECRET=$JWT_SECRET_NEW
# Remove JWT_SECRET_OLD and JWT_SECRET_NEW
\`\`\`

**Step 5: Rollback Code**
- Remove old secret support from code
- Deploy

### Encryption Key Rotation (Requires Data Re-encryption)

⚠️ **WARNING**: Changing ENCRYPTION_KEY requires re-encrypting all encrypted data

**Procedure**:
1. Document all encrypted fields in database
2. Create migration script to re-encrypt data
3. Test migration on staging environment
4. Schedule maintenance window
5. Execute migration
6. Verify all data accessible
7. Update ENCRYPTION_KEY

### API Key Rotation (Service-Specific)

Each service has its own rotation process:
- **Resend**: Create new key in dashboard, update .env, delete old key
- **Stripe**: Create restricted key, test, rotate
- **AWS**: Create new IAM user, update .env, delete old user

## Secret Storage

### Development
- Use `.env` file (never commit)
- Keep backups in secure password manager (1Password, LastPass)

### Staging
- Use environment variables in hosting platform
- Separate secrets from production

### Production
- Use environment variables in hosting platform
- Consider AWS Secrets Manager or HashiCorp Vault
- Enable secret versioning
- Enable access logging

## Incident Response

If a secret is compromised:
1. **Immediately** rotate the secret
2. Invalidate all issued tokens (if applicable)
3. Review access logs for suspicious activity
4. Notify security team
5. Document incident

## Audit Trail

Track rotation history in `SECURITY_AUDIT.md`:
\`\`\`
| Date       | Secret               | Rotated By | Reason    |
|------------|---------------------|------------|-----------|
| 2025-12-22 | JWT_SECRET          | Admin      | Scheduled |
| 2025-12-15 | STRIPE_SECRET_KEY   | DevOps     | Suspected |
\`\`\`
```

---

### 🟡 Add Secret Age Monitoring

**Time**: 1-2 hours

**Create**: `src/utils/secretAgeMonitor.js`

```javascript
/**
 * Secret Age Monitoring
 * Tracks when secrets were last rotated and alerts when they're old
 */

const fs = require('fs');
const path = require('path');

const SECRET_AGE_FILE = path.join(__dirname, '../../.secret-ages.json');
const MAX_AGE_DAYS = {
    JWT_SECRET: 90,
    JWT_REFRESH_SECRET: 90,
    ENCRYPTION_KEY: 90,
    RESEND_API_KEY: 180,
    STRIPE_SECRET_KEY: 180,
    AWS_ACCESS_KEY_ID: 180,
};

/**
 * Load secret age tracking file
 */
function loadSecretAges() {
    try {
        if (fs.existsSync(SECRET_AGE_FILE)) {
            return JSON.parse(fs.readFileSync(SECRET_AGE_FILE, 'utf8'));
        }
    } catch (err) {
        console.warn('Could not load secret ages:', err.message);
    }
    return {};
}

/**
 * Save secret age tracking file
 */
function saveSecretAges(ages) {
    try {
        fs.writeFileSync(SECRET_AGE_FILE, JSON.stringify(ages, null, 2));
    } catch (err) {
        console.error('Could not save secret ages:', err.message);
    }
}

/**
 * Record secret rotation
 */
function recordRotation(secretName) {
    const ages = loadSecretAges();
    ages[secretName] = {
        lastRotated: new Date().toISOString(),
        rotatedBy: process.env.USER || 'unknown'
    };
    saveSecretAges(ages);
    console.log(`✅ Recorded rotation of ${secretName}`);
}

/**
 * Check secret ages and warn if old
 */
function checkSecretAges() {
    const ages = loadSecretAges();
    const warnings = [];
    const now = new Date();

    for (const [secretName, maxAgeDays] of Object.entries(MAX_AGE_DAYS)) {
        const secretInfo = ages[secretName];

        if (!secretInfo) {
            warnings.push(`⚠️  ${secretName}: No rotation history found`);
            continue;
        }

        const lastRotated = new Date(secretInfo.lastRotated);
        const ageDays = Math.floor((now - lastRotated) / (1000 * 60 * 60 * 24));

        if (ageDays > maxAgeDays) {
            warnings.push(
                `🔴 ${secretName}: OVERDUE (${ageDays} days old, max ${maxAgeDays} days)`
            );
        } else if (ageDays > maxAgeDays * 0.8) {
            warnings.push(
                `🟡 ${secretName}: Approaching rotation (${ageDays} days old, max ${maxAgeDays} days)`
            );
        }
    }

    return warnings;
}

/**
 * Check on startup
 */
function checkOnStartup() {
    console.log('\n🔐 Checking secret ages...');
    const warnings = checkSecretAges();

    if (warnings.length === 0) {
        console.log('✅ All secrets are up to date\n');
    } else {
        console.log('⚠️  Secret rotation warnings:\n');
        warnings.forEach(w => console.log(`   ${w}`));
        console.log('');
    }
}

module.exports = {
    recordRotation,
    checkSecretAges,
    checkOnStartup
};
```

**Add to `.gitignore`**:
```
.secret-ages.json
```

**Add to `src/server.js`** (after environment validation):
```javascript
const { checkOnStartup } = require('./utils/secretAgeMonitor');
checkOnStartup();
```

---

## Testing Checklist

After applying fixes:

### Docker Security
- [ ] Test docker-compose up without .env (should fail)
- [ ] Test with missing MONGO_ROOT_PASSWORD (should fail)
- [ ] Test with missing REDIS_PASSWORD (should fail)
- [ ] Verify strong passwords required
- [ ] Test docker-compose.prod.yml still works

### Validation Security
- [ ] Test production startup with SKIP_SAUDI_VALIDATION=true (should fail)
- [ ] Test development with SKIP_SAUDI_VALIDATION=true (should work)
- [ ] Verify error message is clear

### Secret Monitoring
- [ ] Run secret age check
- [ ] Test rotation recording
- [ ] Verify warnings appear for old secrets

---

## Deployment Steps

### 1. Update Docker Configuration
```bash
cd /home/user/traf3li-backend
git checkout -b fix/docker-security

# Edit docker-compose.yml (apply Fix 1 & 2)
vim docker-compose.yml

# Update .env.example
vim .env.example
```

### 2. Update Validation
```bash
# Edit startup validation
vim src/utils/startupValidation.js
```

### 3. Create Documentation
```bash
# Create security documentation
vim SECURITY.md
```

### 4. Add Secret Monitoring
```bash
# Create monitoring script
vim src/utils/secretAgeMonitor.js

# Update .gitignore
echo ".secret-ages.json" >> .gitignore

# Update server.js
vim src/server.js
```

### 5. Test Everything
```bash
# Test docker-compose validation
docker-compose config  # Should show errors if .env missing

# Test application startup
npm start

# Verify secret age check runs
```

### 6. Commit & Deploy
```bash
git add -A
git commit -m "security: Fix Docker default credentials and add secret management

- Remove insecure default passwords for MongoDB and Redis
- Add production validation for SKIP_SAUDI_VALIDATION
- Add SECURITY.md with rotation procedures
- Add secret age monitoring
- Update .env.example with security guidelines

Fixes: Default credentials vulnerability (HIGH)
Implements: Secret rotation framework (MEDIUM)"

git push origin fix/docker-security
```

---

## Verification

After deployment, verify:

1. **Docker Security**
   ```bash
   # This should FAIL (good):
   docker-compose up
   # Error: MONGO_ROOT_PASSWORD must be set in .env
   ```

2. **Production Validation**
   ```bash
   # This should FAIL in production (good):
   NODE_ENV=production SKIP_SAUDI_VALIDATION=true npm start
   ```

3. **Secret Monitoring**
   ```bash
   # Should show secret age warnings
   npm start
   ```

---

## Impact Assessment

### Benefits
- ✅ Prevents accidental deployment with weak credentials
- ✅ Enforces regulatory compliance in production
- ✅ Provides secret rotation framework
- ✅ Enables proactive secret management
- ✅ Reduces security incidents

### Risks
- ⚠️ Existing deployments using defaults will break
- ⚠️ Requires updating deployment documentation
- ⚠️ Team needs training on new procedures

### Mitigation
- Send migration guide to ops team
- Update deployment playbooks
- Schedule knowledge transfer session

---

## Questions?

Contact: Security Team
Documentation: `SECURITY.md`
Emergency: [security-incidents channel]

---

**Created**: 2025-12-22
**Updated**: 2025-12-22
**Status**: Ready for Implementation
**Priority**: HIGH

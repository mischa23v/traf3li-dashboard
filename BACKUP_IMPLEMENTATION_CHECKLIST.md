# Backup & Disaster Recovery Implementation Checklist

**Repository**: https://github.com/mischa23v/traf3li-backend
**Created**: December 22, 2025
**Priority**: CRITICAL - START IMMEDIATELY

---

## Quick Start (First 24 Hours)

### Step 1: AWS Account Setup (2 hours)
- [ ] Create AWS account (if not exists)
- [ ] Enable MFA on root account
- [ ] Create IAM user for backups
- [ ] Generate access key ID and secret
- [ ] Install AWS CLI: `npm install -g aws-cli`
- [ ] Configure credentials: `aws configure`

### Step 2: S3 Bucket Setup (1 hour)
- [ ] Create bucket: `traf3li-backups`
- [ ] Enable versioning
- [ ] Enable server-side encryption (AES-256)
- [ ] Block public access (all settings)
- [ ] Enable access logging
- [ ] Create folders: `/mongodb/`, `/files/`, `/config/`

### Step 3: IAM Policy Configuration (1 hour)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BackupBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::traf3li-backups",
        "arn:aws:s3:::traf3li-backups/*"
      ]
    }
  ]
}
```
- [ ] Create policy named `traf3li-backup-policy`
- [ ] Attach to backup IAM user
- [ ] Test access: `aws s3 ls s3://traf3li-backups`

### Step 4: Install Dependencies (30 minutes)
```bash
cd traf3li-backend-for\ testing\ only\ different\ github/
npm install aws-sdk --save
```
- [ ] Install aws-sdk
- [ ] Verify package.json updated
- [ ] Test import: `const AWS = require('aws-sdk')`

### Step 5: Environment Variables (15 minutes)
Add to `.env`:
```bash
# Backup Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BACKUP_BUCKET=traf3li-backups
BACKUP_ENCRYPTION_KEY=generate_with_crypto_randomBytes_32_hex
```
- [ ] Add AWS credentials
- [ ] Generate backup encryption key
- [ ] Set S3 bucket name
- [ ] Test environment loading

---

## Week 1: Core Implementation

### Day 1-2: MongoDB Backup Script

**Create**: `scripts/backup-mongodb.js`
```javascript
const { exec } = require('child_process');
const util = require('util');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const fs = require('fs');
const execPromise = util.promisify(exec);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function backupMongoDB() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `/tmp/mongodb-${timestamp}.gz`;
  const encryptedFile = `${backupFile}.enc`;

  try {
    console.log('🔄 Starting MongoDB backup...');

    // Step 1: Create MongoDB dump
    await execPromise(
      `mongodump --uri="${process.env.MONGODB_URI}" --gzip --archive=${backupFile}`
    );
    console.log('✅ MongoDB dump created');

    // Step 2: Generate checksum
    const fileBuffer = fs.readFileSync(backupFile);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    console.log(`✅ Checksum: ${checksum}`);

    // Step 3: Encrypt backup
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(process.env.BACKUP_ENCRYPTION_KEY, 'hex'),
      crypto.randomBytes(16)
    );
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    fs.writeFileSync(encryptedFile, Buffer.concat([authTag, encrypted]));
    console.log('✅ Backup encrypted');

    // Step 4: Upload to S3
    await s3.putObject({
      Bucket: process.env.S3_BACKUP_BUCKET,
      Key: `mongodb/mongodb-${timestamp}.gz.enc`,
      Body: fs.readFileSync(encryptedFile),
      ServerSideEncryption: 'AES256',
      Metadata: {
        'original-checksum': checksum,
        'timestamp': new Date().toISOString()
      }
    }).promise();
    console.log('✅ Uploaded to S3');

    // Step 5: Upload checksum
    await s3.putObject({
      Bucket: process.env.S3_BACKUP_BUCKET,
      Key: `mongodb/mongodb-${timestamp}.checksum`,
      Body: checksum,
      ServerSideEncryption: 'AES256'
    }).promise();

    // Step 6: Cleanup
    fs.unlinkSync(backupFile);
    fs.unlinkSync(encryptedFile);
    console.log('✅ MongoDB backup completed successfully');

    return true;
  } catch (error) {
    console.error('❌ MongoDB backup failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  backupMongoDB()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { backupMongoDB };
```

**Checklist**:
- [ ] Create `scripts/` directory
- [ ] Create `backup-mongodb.js`
- [ ] Test manual execution: `node scripts/backup-mongodb.js`
- [ ] Verify S3 upload
- [ ] Verify encryption
- [ ] Verify checksum creation

---

### Day 3-4: File Backup Script

**Create**: `scripts/backup-files.js`
```javascript
const { exec } = require('child_process');
const util = require('util');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const execPromise = util.promisify(exec);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function backupFiles() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const uploadsDir = path.join(__dirname, '../uploads');
  const backupFile = `/tmp/uploads-${timestamp}.tar.gz`;
  const encryptedFile = `${backupFile}.enc`;

  try {
    console.log('🔄 Starting file backup...');

    // Step 1: Create tar archive
    await execPromise(`tar czf ${backupFile} -C ${uploadsDir} .`);
    console.log('✅ Archive created');

    // Step 2: Encrypt
    const fileBuffer = fs.readFileSync(backupFile);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(process.env.BACKUP_ENCRYPTION_KEY, 'hex'),
      crypto.randomBytes(16)
    );
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    fs.writeFileSync(encryptedFile, Buffer.concat([authTag, encrypted]));
    console.log('✅ Files encrypted');

    // Step 3: Upload to S3
    await s3.putObject({
      Bucket: process.env.S3_BACKUP_BUCKET,
      Key: `files/uploads-${timestamp}.tar.gz.enc`,
      Body: fs.readFileSync(encryptedFile),
      ServerSideEncryption: 'AES256',
      Metadata: {
        'original-checksum': checksum,
        'timestamp': new Date().toISOString()
      }
    }).promise();
    console.log('✅ Uploaded to S3');

    // Step 4: Cleanup
    fs.unlinkSync(backupFile);
    fs.unlinkSync(encryptedFile);
    console.log('✅ File backup completed successfully');

    return true;
  } catch (error) {
    console.error('❌ File backup failed:', error);
    throw error;
  }
}

if (require.main === module) {
  backupFiles()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { backupFiles };
```

**Checklist**:
- [ ] Create `backup-files.js`
- [ ] Test manual execution
- [ ] Verify tar creation
- [ ] Verify encryption
- [ ] Verify S3 upload

---

### Day 5-7: Automation & Scheduling

**Create**: `src/utils/backupScheduler.js`
```javascript
const cron = require('node-cron');
const { backupMongoDB } = require('../../scripts/backup-mongodb');
const { backupFiles } = require('../../scripts/backup-files');

const scheduleBackups = () => {
  // Hourly MongoDB backups (keep last 24)
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Starting hourly MongoDB backup...');
    try {
      await backupMongoDB();
      console.log('✅ Hourly MongoDB backup completed');
    } catch (error) {
      console.error('❌ Hourly backup failed:', error);
      // TODO: Send alert to admin
    }
  });

  // Daily file backups at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Starting daily file backup...');
    try {
      await backupFiles();
      console.log('✅ Daily file backup completed');
    } catch (error) {
      console.error('❌ Daily file backup failed:', error);
      // TODO: Send alert to admin
    }
  });

  console.log('✅ Backup scheduler initialized');
  console.log('   - MongoDB: Hourly backups');
  console.log('   - Files: Daily backups at 2 AM');
};

module.exports = { scheduleBackups };
```

**Update**: `src/server.js`
```javascript
// Add after line 8:
const { scheduleBackups } = require('./utils/backupScheduler');

// Add after line 228 (in server.listen):
server.listen(PORT, () => {
  connectDB();
  scheduleTaskReminders();
  scheduleBackups(); // ADD THIS LINE
  console.log(`🚀 Server running on port ${PORT}`);
  // ... rest of code
});
```

**Checklist**:
- [ ] Create `backupScheduler.js`
- [ ] Update `server.js`
- [ ] Restart server
- [ ] Wait for first scheduled backup
- [ ] Verify automated execution
- [ ] Check S3 for new backups

**Update**: `package.json`
```json
{
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "backup:db": "node scripts/backup-mongodb.js",
    "backup:files": "node scripts/backup-files.js",
    "backup:manual": "npm run backup:db && npm run backup:files"
  }
}
```

**Checklist**:
- [ ] Update package.json
- [ ] Test: `npm run backup:db`
- [ ] Test: `npm run backup:files`
- [ ] Test: `npm run backup:manual`

---

## Week 2: Verification & Recovery

### Day 8-10: Backup Verification

**Create**: `scripts/verify-backups.js`
```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function verifyBackups() {
  try {
    console.log('🔍 Verifying backup health...');

    // Check MongoDB backups
    const mongoBackups = await s3.listObjectsV2({
      Bucket: process.env.S3_BACKUP_BUCKET,
      Prefix: 'mongodb/'
    }).promise();

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMongoBackup = mongoBackups.Contents.find(
      obj => new Date(obj.LastModified) > twentyFourHoursAgo
    );

    if (!recentMongoBackup) {
      console.error('🚨 ALERT: No MongoDB backup in last 24 hours!');
      return false;
    }
    console.log('✅ MongoDB backups healthy');

    // Check file backups
    const fileBackups = await s3.listObjectsV2({
      Bucket: process.env.S3_BACKUP_BUCKET,
      Prefix: 'files/'
    }).promise();

    const recentFileBackup = fileBackups.Contents.find(
      obj => new Date(obj.LastModified) > twentyFourHoursAgo
    );

    if (!recentFileBackup) {
      console.error('🚨 ALERT: No file backup in last 24 hours!');
      return false;
    }
    console.log('✅ File backups healthy');

    console.log('✅ All backups verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Backup verification failed:', error);
    return false;
  }
}

if (require.main === module) {
  verifyBackups()
    .then(success => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}

module.exports = { verifyBackups };
```

**Checklist**:
- [ ] Create `verify-backups.js`
- [ ] Test manual execution
- [ ] Add to cron schedule (daily at 8 AM)
- [ ] Set up failure alerts

---

### Day 11-12: Recovery Scripts

**Create**: `scripts/restore-mongodb.js`
```javascript
const { exec } = require('child_process');
const util = require('util');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const fs = require('fs');
const execPromise = util.promisify(exec);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function restoreMongoDB(backupKey) {
  const encryptedFile = '/tmp/restore.gz.enc';
  const decryptedFile = '/tmp/restore.gz';

  try {
    console.log('🔄 Starting MongoDB restore...');
    console.log(`📥 Downloading: ${backupKey}`);

    // Step 1: Download from S3
    const backup = await s3.getObject({
      Bucket: process.env.S3_BACKUP_BUCKET,
      Key: backupKey
    }).promise();
    fs.writeFileSync(encryptedFile, backup.Body);
    console.log('✅ Backup downloaded');

    // Step 2: Decrypt
    const encryptedBuffer = fs.readFileSync(encryptedFile);
    const authTag = encryptedBuffer.slice(0, 16);
    const encrypted = encryptedBuffer.slice(16);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(process.env.BACKUP_ENCRYPTION_KEY, 'hex'),
      crypto.randomBytes(16)
    );
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    fs.writeFileSync(decryptedFile, decrypted);
    console.log('✅ Backup decrypted');

    // Step 3: Verify checksum
    const checksumKey = backupKey.replace('.gz.enc', '.checksum');
    const checksumData = await s3.getObject({
      Bucket: process.env.S3_BACKUP_BUCKET,
      Key: checksumKey
    }).promise();
    const expectedChecksum = checksumData.Body.toString();
    const actualChecksum = crypto
      .createHash('sha256')
      .update(decrypted)
      .digest('hex');

    if (expectedChecksum !== actualChecksum) {
      throw new Error('Checksum mismatch! Backup may be corrupted.');
    }
    console.log('✅ Checksum verified');

    // Step 4: Restore to MongoDB
    console.log('⚠️  WARNING: This will DROP existing collections!');
    console.log('⚠️  Press Ctrl+C within 10 seconds to cancel...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    await execPromise(
      `mongorestore --uri="${process.env.MONGODB_URI}" --gzip --archive=${decryptedFile} --drop`
    );
    console.log('✅ MongoDB restored successfully');

    // Step 5: Cleanup
    fs.unlinkSync(encryptedFile);
    fs.unlinkSync(decryptedFile);
    console.log('✅ Restore completed');

    return true;
  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw error;
  }
}

// Usage: node scripts/restore-mongodb.js mongodb/mongodb-2025-12-22T12-00-00.gz.enc
if (require.main === module) {
  const backupKey = process.argv[2];
  if (!backupKey) {
    console.error('Usage: node restore-mongodb.js <backup-key>');
    process.exit(1);
  }
  restoreMongoDB(backupKey)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { restoreMongoDB };
```

**Checklist**:
- [ ] Create `restore-mongodb.js`
- [ ] Create test database
- [ ] Test restore to test DB
- [ ] Verify data integrity
- [ ] Document restore procedure

---

### Day 13-14: Documentation

**Create**: `DISASTER_RECOVERY_PLAN.md`
```markdown
# Disaster Recovery Plan

## Emergency Contacts
- Primary: [Admin Name] - [Phone] - [Email]
- Secondary: [Backup Admin] - [Phone] - [Email]
- AWS Support: 1-XXX-XXX-XXXX

## Recovery Procedures

### Database Recovery (RTO: 4 hours)

1. **Identify Latest Backup**
   ```bash
   aws s3 ls s3://traf3li-backups/mongodb/ --recursive | tail -20
   ```

2. **Download & Restore**
   ```bash
   node scripts/restore-mongodb.js mongodb/mongodb-YYYY-MM-DD.gz.enc
   ```

3. **Verify Restoration**
   ```bash
   mongo --eval "db.users.countDocuments()"
   ```

### File Recovery

1. **Download Backup**
   ```bash
   aws s3 cp s3://traf3li-backups/files/latest.tar.gz.enc /tmp/
   ```

2. **Decrypt & Extract**
   ```bash
   openssl enc -aes-256-gcm -d -in /tmp/latest.tar.gz.enc -out /tmp/latest.tar.gz
   tar xzf /tmp/latest.tar.gz -C /uploads/
   ```

## Testing Schedule
- Weekly: Restore to staging
- Monthly: Full DR drill
- Quarterly: Team training
```

**Checklist**:
- [ ] Create DR plan
- [ ] Document all procedures
- [ ] Share with team
- [ ] Schedule training

---

## Week 3: Enhancement

### Lifecycle Policy Configuration

**S3 Lifecycle Rules**:
```json
{
  "Rules": [
    {
      "Id": "MongoDB-Retention-Policy",
      "Status": "Enabled",
      "Prefix": "mongodb/",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 365,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 2555,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    },
    {
      "Id": "Files-Retention-Policy",
      "Status": "Enabled",
      "Prefix": "files/",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 365,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

**Checklist**:
- [ ] Configure lifecycle policy
- [ ] Test transitions
- [ ] Verify cost reduction
- [ ] Document policy

---

## Week 4: Testing & Validation

### DR Drill Checklist

**Scenario**: Complete database loss

- [ ] **Preparation**
  - [ ] Notify team of drill
  - [ ] Create test environment
  - [ ] Document start time

- [ ] **Execution**
  - [ ] Simulate data loss
  - [ ] Identify latest backup
  - [ ] Download from S3
  - [ ] Decrypt backup
  - [ ] Verify checksum
  - [ ] Restore database
  - [ ] Verify data integrity
  - [ ] Test application
  - [ ] Document end time

- [ ] **Validation**
  - [ ] Calculate RTO (actual)
  - [ ] Calculate RPO (actual)
  - [ ] Verify data completeness
  - [ ] Check application functionality
  - [ ] Test user authentication
  - [ ] Validate API endpoints

- [ ] **Lessons Learned**
  - [ ] Document issues encountered
  - [ ] Update procedures
  - [ ] Train team on gaps
  - [ ] Schedule next drill

---

## Monitoring Dashboard

### CloudWatch Metrics to Track

- [ ] **Backup Success Rate**
  - Metric: Custom metric
  - Alarm: < 100% in 24 hours

- [ ] **Backup Size**
  - Metric: S3 bucket size
  - Alarm: Unexpected growth

- [ ] **Backup Age**
  - Metric: Latest backup timestamp
  - Alarm: > 24 hours old

- [ ] **S3 Storage Costs**
  - Metric: Billing alerts
  - Alarm: > $50/month

---

## Final Validation Checklist

### Week 4 Review

- [ ] **Backups Running**
  - [ ] Hourly MongoDB backups
  - [ ] Daily file backups
  - [ ] All encrypted
  - [ ] All in S3

- [ ] **Verification Working**
  - [ ] Daily integrity checks
  - [ ] Checksum validation
  - [ ] Age monitoring
  - [ ] Alerts configured

- [ ] **Recovery Tested**
  - [ ] Database restore successful
  - [ ] File restore successful
  - [ ] RTO < 4 hours
  - [ ] RPO < 1 hour

- [ ] **Documentation Complete**
  - [ ] DR plan written
  - [ ] Runbooks created
  - [ ] Team trained
  - [ ] Contacts updated

- [ ] **Compliance Achieved**
  - [ ] PDPL requirements met
  - [ ] GDPR requirements met
  - [ ] ISO 27001 requirements met
  - [ ] Audit trail complete

- [ ] **Cost Optimized**
  - [ ] Lifecycle policies active
  - [ ] Storage tiering configured
  - [ ] Monthly cost < $50
  - [ ] Budget alerts set

---

## Success Metrics

After completing this checklist, you should have:

✅ **100% Backup Coverage**
- All data backed up hourly/daily
- All backups encrypted
- All backups offsite (S3)

✅ **Tested Recovery**
- Successful restore from backup
- RTO < 4 hours achieved
- RPO < 1 hour achieved

✅ **Full Compliance**
- PDPL Article 19, 20, 22 ✅
- GDPR Article 30, 32 ✅
- ISO 27001 A.12.3.1, A.17.1.2 ✅

✅ **Business Continuity**
- Zero data loss risk
- Disaster recovery capability
- Legal compliance maintained
- Client trust preserved

---

## Emergency Restoration Guide

### If Data Loss Happens RIGHT NOW:

**Step 1: Don't Panic**
- Stop all write operations
- Assess damage extent
- Notify stakeholders

**Step 2: Identify Backup**
```bash
# List recent backups
aws s3 ls s3://traf3li-backups/mongodb/ | tail -5

# Choose latest before incident
```

**Step 3: Restore**
```bash
# Database
node scripts/restore-mongodb.js mongodb/[LATEST_BACKUP].gz.enc

# Files
node scripts/restore-files.js files/[LATEST_BACKUP].tar.gz.enc
```

**Step 4: Verify**
- Check data completeness
- Test application
- Notify users of recovery

---

**Document Version**: 1.0
**Last Updated**: December 22, 2025
**Next Review**: After Week 4 completion

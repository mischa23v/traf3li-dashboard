# File Security - Quick Fix Guide

## Immediate Actions (Deploy Today)

### 1. Add Authentication to Legal Document Downloads
```javascript
// FILE: src/routes/legalDocument.route.js
// CHANGE Line 30 from:
app.post('/:_id/download', incrementDownload);

// TO:
app.post('/:_id/download', userMiddleware, authenticate, incrementDownload);
```

### 2. Strengthen File Type Validation
```bash
npm install file-type
```

```javascript
// FILE: src/configs/multer.js
// ADD at top:
const FileType = require('file-type');

// REPLACE fileFilter function (lines 23-33) with:
const fileFilter = async (req, file, cb) => {
  try {
    const chunks = [];
    file.stream.on('data', chunk => chunks.push(chunk));
    await new Promise((resolve, reject) => {
      file.stream.on('end', resolve);
      file.stream.on('error', reject);
    });

    const buffer = Buffer.concat(chunks);
    const fileType = await FileType.fromBuffer(buffer);

    if (!fileType) {
      return cb(new Error('Cannot determine file type'));
    }

    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'video/mp4', 'video/webm'
    ];

    if (!allowedMimes.includes(fileType.mime)) {
      return cb(new Error('File type not allowed'));
    }

    // Restore buffer for upload
    req.fileBuffer = buffer;
    cb(null, true);
  } catch (error) {
    cb(error);
  }
};
```

### 3. Add Upload Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
// FILE: src/routes/message.route.js
// ADD at top:
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many uploads, try again later'
});

// CHANGE line 9 from:
app.post('/', userMiddleware, upload.array('files', 5), createMessage);

// TO:
app.post('/', uploadLimiter, userMiddleware, upload.array('files', 5), createMessage);
```

### 4. Secure Message Attachments
```javascript
// FILE: src/controllers/message.controller.js
// ADD at top:
const path = require('path');
const crypto = require('crypto');

const sanitizeFilename = (filename) => {
  const base = path.basename(filename);
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
};

// CHANGE lines 18-25 to:
attachments.push({
  filename: sanitizeFilename(file.filename),
  originalName: file.originalname,
  mimetype: file.mimetype,
  size: file.size,
  url: `/api/messages/attachment/${sanitizeFilename(file.filename)}`,
  type: fileType
});
```

### 5. Add Security Headers to PDF Responses
```javascript
// FILE: src/controllers/pdfme.controller.js
// CHANGE lines 491-493 to:
response.setHeader('Content-Type', 'application/pdf');
response.setHeader('Content-Disposition', `inline; filename="preview-${template.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
response.setHeader('X-Content-Type-Options', 'nosniff');
response.setHeader('X-Frame-Options', 'DENY');
response.setHeader('Content-Security-Policy', "default-src 'none'");
```

---

## Deploy Next Week

### 6. Install ClamAV Antivirus Scanner
```bash
# On Ubuntu/Debian
sudo apt-get update
sudo apt-get install clamav clamav-daemon

# Start service
sudo systemctl start clamav-daemon
sudo systemctl enable clamav-daemon

# Update virus definitions
sudo freshclam
```

```bash
# In project
npm install clamscan
```

```javascript
// FILE: src/utils/virusScanner.js (NEW FILE)
const NodeClam = require('clamscan');

let clamScanner = null;

const initScanner = async () => {
  if (clamScanner) return clamScanner;

  clamScanner = await new NodeClam().init({
    clamdscan: {
      host: process.env.CLAMAV_HOST || 'localhost',
      port: process.env.CLAMAV_PORT || 3310,
    },
    preference: 'clamdscan'
  });

  return clamScanner;
};

const scanFile = async (filePath) => {
  const scanner = await initScanner();
  const { isInfected, viruses } = await scanner.scanFile(filePath);

  if (isInfected) {
    const fs = require('fs').promises;
    await fs.unlink(filePath); // Delete infected file
    throw new Error(`Malware detected: ${viruses.join(', ')}`);
  }

  return true;
};

module.exports = { scanFile };
```

```javascript
// FILE: src/controllers/message.controller.js
// ADD at top:
const { scanFile } = require('../utils/virusScanner');

// ADD after file upload (around line 11):
if (request.files && request.files.length > 0) {
  // Scan each file
  for (const file of request.files) {
    try {
      await scanFile(file.path);
    } catch (error) {
      // Delete all uploaded files if any is infected
      for (const f of request.files) {
        await fs.promises.unlink(f.path).catch(() => {});
      }
      throw CustomException('Malware detected in uploaded file', 400);
    }
  }

  // Continue with attachment processing...
  request.files.forEach(file => {
    // ...
  });
}
```

### 7. Implement Storage Quotas
```javascript
// FILE: src/models/user.model.js
// ADD to schema:
storageUsed: {
  type: Number,
  default: 0
},
storageQuota: {
  type: Number,
  default: 100 * 1024 * 1024 // 100MB default
}
```

```javascript
// FILE: src/middlewares/checkStorageQuota.js (NEW FILE)
const { User } = require('../models');
const { CustomException } = require('../utils');

const checkStorageQuota = async (req, res, next) => {
  try {
    const user = await User.findById(req.userID);

    if (!user) {
      throw CustomException('User not found', 404);
    }

    // Calculate file size
    let uploadSize = 0;
    if (req.file) {
      uploadSize = req.file.size;
    } else if (req.files) {
      uploadSize = req.files.reduce((sum, f) => sum + f.size, 0);
    }

    // Check quota
    if (user.storageUsed + uploadSize > user.storageQuota) {
      throw CustomException('Storage quota exceeded. Please delete some files.', 413);
    }

    // Update storage used after successful upload
    req.on('finish', async () => {
      if (res.statusCode < 400) {
        await User.findByIdAndUpdate(req.userID, {
          $inc: { storageUsed: uploadSize }
        });
      }
    });

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkStorageQuota;
```

```javascript
// FILE: src/routes/message.route.js
// ADD:
const checkStorageQuota = require('../middlewares/checkStorageQuota');

// UPDATE line 9:
app.post('/', uploadLimiter, userMiddleware, checkStorageQuota, upload.array('files', 5), createMessage);
```

### 8. Add Audit Logging
```javascript
// FILE: src/models/auditLog.model.js (NEW FILE)
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'FILE_UPLOADED', 'FILE_DOWNLOADED', 'FILE_DELETED',
      'FILE_SHARED', 'UNAUTHORIZED_ACCESS_ATTEMPT',
      'MALWARE_DETECTED'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  ipAddress: String,
  userAgent: String,
  details: mongoose.Schema.Types.Mixed,
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for fast queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

```javascript
// FILE: src/utils/auditLogger.js (NEW FILE)
const AuditLog = require('../models/auditLog.model');

const logAudit = async (action, req, details = {}) => {
  try {
    await AuditLog.create({
      action,
      userId: req.userID || req.user?._id,
      documentId: details.documentId,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      details,
      severity: details.severity || 'info',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw - logging failures shouldn't break operations
  }
};

module.exports = { logAudit };
```

```javascript
// FILE: src/controllers/legalDocument.controller.js
// ADD at top:
const { logAudit } = require('../utils/auditLogger');

// ADD in getDocument function (after line 100):
await logAudit('FILE_DOWNLOADED', request, {
  documentId: document._id,
  fileName: document.title
});

// ADD in incrementDownload function (after authorization check):
await logAudit('FILE_DOWNLOADED', request, {
  documentId: document._id,
  fileName: document.title
});
```

---

## Environment Variables to Add

```bash
# Add to .env file:

# Antivirus
CLAMAV_HOST=localhost
CLAMAV_PORT=3310

# Storage
DEFAULT_STORAGE_QUOTA=104857600  # 100MB in bytes
MAX_STORAGE_QUOTA=1073741824     # 1GB in bytes

# Security
ENABLE_AUDIT_LOGGING=true
ENABLE_VIRUS_SCANNING=true
```

---

## Quick Test Commands

### Test File Upload Security
```bash
# Test 1: Try to upload an executable
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@malware.exe"
# Should return 400 error

# Test 2: Upload legitimate file
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@document.pdf"
# Should succeed

# Test 3: Test rate limiting
for i in {1..15}; do
  curl -X POST http://localhost:5000/api/messages \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -F "files=@test.pdf"
done
# Should block after 10 requests

# Test 4: Test storage quota
# Upload large file exceeding quota
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@large-file.mp4"
# Should return 413 if exceeds quota
```

### Monitor Audit Logs
```javascript
// In MongoDB shell or Compass
db.auditlogs.find().sort({ timestamp: -1 }).limit(10)

// Get failed access attempts
db.auditlogs.find({ action: 'UNAUTHORIZED_ACCESS_ATTEMPT' })

// Get malware detections
db.auditlogs.find({ action: 'MALWARE_DETECTED' })
```

---

## Deployment Checklist

- [ ] Install ClamAV on server
- [ ] Update virus definitions: `sudo freshclam`
- [ ] Add new environment variables to .env
- [ ] Deploy code changes
- [ ] Restart application
- [ ] Test file uploads (legitimate files)
- [ ] Test malware detection (use EICAR test file)
- [ ] Test rate limiting
- [ ] Test storage quotas
- [ ] Verify audit logs are being created
- [ ] Monitor for any errors in logs
- [ ] Notify users of new upload limits

---

## Migration Script for Existing Users

```javascript
// FILE: scripts/addStorageQuotas.js (NEW FILE)
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const Document = require('../src/models/document.model'); // If exists

async function addStorageQuotas() {
  await mongoose.connect(process.env.MONGODB_URI);

  const users = await User.find({});

  for (const user of users) {
    // Calculate current storage used
    const documents = await Document.find({ uploadedBy: user._id });
    const storageUsed = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

    // Set quota based on role
    let storageQuota = 100 * 1024 * 1024; // 100MB default
    if (user.role === 'admin') {
      storageQuota = 1024 * 1024 * 1024; // 1GB for admins
    } else if (user.role === 'lawyer') {
      storageQuota = 500 * 1024 * 1024; // 500MB for lawyers
    }

    await User.findByIdAndUpdate(user._id, {
      storageUsed,
      storageQuota
    });

    console.log(`Updated ${user.username}: ${storageUsed} / ${storageQuota} bytes`);
  }

  console.log('Migration complete');
  await mongoose.disconnect();
}

addStorageQuotas().catch(console.error);
```

```bash
# Run migration
node scripts/addStorageQuotas.js
```

---

## Next Steps (Month 2)

1. Migrate to AWS S3 storage (see main report)
2. Implement data retention policies
3. Add file integrity validation (checksums)
4. Implement right to erasure for PDPL compliance
5. Set up automated file cleanup
6. Enable S3 access logging
7. Schedule regular security audits

---

**Priority**: URGENT - Deploy items 1-5 immediately
**Estimated Time**: 4-6 hours for items 1-5, full week for items 6-8
**Risk Level**: Critical security vulnerabilities exist until fixed

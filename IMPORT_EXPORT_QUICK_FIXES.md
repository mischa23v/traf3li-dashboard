# Import/Export Security - Quick Fixes
**IMMEDIATE ACTION REQUIRED**

## 🔴 CRITICAL: CSV Injection Vulnerability

**File:** `traf3li-backend-for testing only different github/src/controllers/benefit.controller.js`
**Lines:** 813-836
**Severity:** HIGH
**Deploy:** IMMEDIATELY

### The Fix

Replace the vulnerable CSV export code with this secure version:

```javascript
// Add this helper function at the top of the file
const sanitizeCsvField = (value) => {
    if (value === null || value === undefined) return '';

    let sanitized = String(value);

    // Remove formula injection prefixes
    const dangerousChars = ['=', '+', '-', '@', '\t', '\r', '\n'];
    while (dangerousChars.some(char => sanitized.startsWith(char))) {
        sanitized = sanitized.substring(1);
    }

    // Escape quotes
    sanitized = sanitized.replace(/"/g, '""');

    // Remove line breaks and null bytes
    sanitized = sanitized.replace(/[\r\n]/g, ' ');
    sanitized = sanitized.replace(/\0/g, '');

    return `"${sanitized}"`;
};

// Replace lines 813-836 in exportBenefits function:
if (format === 'csv') {
    const headers = [
        'Enrollment ID', 'Employee Name', 'Employee Name (AR)',
        'Benefit Type', 'Benefit Category', 'Benefit Name',
        'Status', 'Employer Cost', 'Employee Cost', 'Total Cost',
        'Enrollment Date', 'Effective Date'
    ].map(h => sanitizeCsvField(h)).join(',');

    const rows = benefits.map(b => [
        sanitizeCsvField(b.benefitEnrollmentId),
        sanitizeCsvField(b.employeeName),
        sanitizeCsvField(b.employeeNameAr),
        sanitizeCsvField(b.benefitType),
        sanitizeCsvField(b.benefitCategory),
        sanitizeCsvField(b.benefitName),
        sanitizeCsvField(b.status),
        Number(b.employerCost) || 0,
        Number(b.employeeCost) || 0,
        Number(b.totalCost) || 0,
        b.enrollmentDate?.toISOString().split('T')[0] || '',
        b.effectiveDate?.toISOString().split('T')[0] || ''
    ].join(','));

    const csv = [headers, ...rows].join('\n');

    // Add security headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition',
        `attachment; filename="benefits-export-${Date.now()}.csv"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    return res.send(csv);
}
```

**Test:**
```javascript
// Create a test benefit with malicious formula
await EmployeeBenefit.create({
    employeeName: '=1+1',
    benefitName: '@SUM(A1:A10)',
    createdBy: testUserId
});

// Export and verify
const response = await request(app)
    .get('/api/benefits/export?format=csv')
    .set('Authorization', `Bearer ${token}`);

// Should NOT contain formulas
expect(response.text).not.toContain('=1+1');
expect(response.text).not.toContain('@SUM');
// Should contain sanitized version
expect(response.text).toContain('"1+1"');
```

---

## ⚠️ HIGH PRIORITY: Bulk Operation Limits

**Files:**
- `traf3li-backend-for testing only different github/src/controllers/benefit.controller.js` (lines 364-396)
- `traf3li-backend-for testing only different github/src/controllers/task.controller.js` (lines 426-478)

**Deploy:** Within 48 hours

### The Fix

```javascript
// Update bulkDeleteBenefits function:
const bulkDeleteBenefits = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    try {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw CustomException('يجب تحديد المزايا للحذف', 400);
        }

        // ✅ ADD: Maximum limit
        const MAX_BULK_DELETE = 100;
        if (ids.length > MAX_BULK_DELETE) {
            throw CustomException(
                `Cannot delete more than ${MAX_BULK_DELETE} items at once`,
                400
            );
        }

        // ✅ ADD: Validate all IDs
        const mongoose = require('mongoose');
        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length !== ids.length) {
            throw CustomException('Invalid IDs provided', 400);
        }

        // Verify ownership
        const benefits = await EmployeeBenefit.find({
            _id: { $in: validIds },
            createdBy: req.userID
        });

        if (benefits.length !== validIds.length) {
            throw CustomException('بعض المزايا غير موجودة...', 403);
        }

        // Delete
        const result = await EmployeeBenefit.deleteMany({
            _id: { $in: validIds },
            createdBy: req.userID
        });

        return res.json({
            success: true,
            message: `تم حذف ${result.deletedCount} ميزة بنجاح`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        throw CustomException(error.message || 'فشل حذف المزايا', error.status || 500);
    }
});
```

### Add Rate Limiting

**File:** `traf3li-backend-for testing only different github/src/routes/benefit.route.js`

```javascript
const rateLimit = require('express-rate-limit');

// Add after imports:
const bulkOperationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 bulk operations per 15 minutes
    message: 'Too many bulk operations, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

// Update route (line 40):
app.post('/bulk-delete', userMiddleware, bulkOperationLimiter, bulkDeleteBenefits);
```

Apply the same fix to `task.controller.js` and `task.route.js`.

---

## 📋 MEDIUM PRIORITY: File Upload Validation

**Deploy:** Within 1 week

### Install Dependency

```bash
npm install file-type@18.0.0
```

### Update Multer Config

**File:** `traf3li-backend-for testing only different github/src/configs/multer.js`

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fileType = require('file-type');

// ... existing storage config ...

// ✅ ENHANCED file filter with magic number verification
const fileFilter = async (req, file, cb) => {
    try {
        // Read first 4100 bytes to check magic number
        const buffer = await new Promise((resolve, reject) => {
            const chunks = [];
            let size = 0;

            file.stream.on('data', (chunk) => {
                chunks.push(chunk);
                size += chunk.length;
                if (size >= 4100) {
                    file.stream.pause();
                    resolve(Buffer.concat(chunks).slice(0, 4100));
                }
            });

            file.stream.on('end', () => resolve(Buffer.concat(chunks)));
            file.stream.on('error', reject);
        });

        // Verify actual file type
        const type = await fileType.fromBuffer(buffer);

        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'video/mp4',
            'video/webm'
        ];

        if (!type || !allowedMimeTypes.includes(type.mime)) {
            return cb(new Error('Invalid file type detected'));
        }

        // Verify extension matches content
        const ext = path.extname(file.originalname).toLowerCase().substring(1);
        const allowedExts = {
            'image/jpeg': ['jpg', 'jpeg'],
            'image/png': ['png'],
            'image/gif': ['gif'],
            'application/pdf': ['pdf'],
            'video/mp4': ['mp4'],
            'video/webm': ['webm']
        };

        if (!allowedExts[type.mime]?.includes(ext)) {
            return cb(new Error('File extension does not match content'));
        }

        cb(null, true);
    } catch (error) {
        cb(new Error('File validation failed'));
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Reduced to 5MB
        files: 3 // Reduced to 3 files
    },
    fileFilter
});

module.exports = upload;
```

---

## 🔍 TESTING CHECKLIST

Before deploying, run these tests:

```bash
# 1. Test CSV injection prevention
curl -X GET "http://localhost:8000/api/benefits/export?format=csv" \
  -H "Authorization: Bearer $TOKEN" \
  -o test-export.csv

# Verify no formulas in output:
grep -E "^[=+\-@]" test-export.csv
# Should return nothing

# 2. Test bulk delete limits
curl -X POST "http://localhost:8000/api/benefits/bulk-delete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": ['$(for i in {1..150}; do echo -n "\"$(uuidgen)\","; done | sed 's/,$//')']}'

# Should return 400 error with "Cannot delete more than 100 items"

# 3. Test rate limiting
for i in {1..12}; do
  curl -X POST "http://localhost:8000/api/benefits/bulk-delete" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"ids": []}' &
done
wait

# 11th and 12th requests should return 429 Too Many Requests
```

---

## 📦 DEPLOYMENT CHECKLIST

- [ ] Review all code changes
- [ ] Run security tests
- [ ] Update dependencies if needed
- [ ] Deploy to staging environment
- [ ] Test CSV export with malicious input
- [ ] Test bulk operations with limits
- [ ] Test rate limiting
- [ ] Monitor logs for errors
- [ ] Deploy to production
- [ ] Notify team of changes
- [ ] Update security documentation

---

## 🚨 EMERGENCY ROLLBACK

If issues occur after deployment:

```bash
# 1. Revert the CSV export changes
git revert <commit-hash>

# 2. Disable the bulk operation endpoints temporarily
# Add to routes/benefit.route.js:
app.post('/bulk-delete', (req, res) => {
    res.status(503).json({
        error: true,
        message: 'This endpoint is temporarily disabled for maintenance'
    });
});

# 3. Redeploy
npm run deploy
```

---

## 📞 SUPPORT

If you encounter issues:
1. Check application logs: `tail -f logs/app.log`
2. Check error monitoring dashboard
3. Review the full audit report: `IMPORT_EXPORT_SECURITY_AUDIT_REPORT.md`

---

**Generated:** 2025-12-22
**Priority:** CRITICAL
**Estimated Time:** 12-16 hours total
**Must Complete By:** 2025-12-29

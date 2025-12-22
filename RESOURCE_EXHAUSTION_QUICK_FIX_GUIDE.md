# RESOURCE EXHAUSTION - QUICK FIX GUIDE
## Immediate Actions Required

**Date:** 2025-12-22
**Priority:** P0 - CRITICAL

---

## 🚨 CRITICAL: Fix These First (Today)

### 1. Add Pagination to Message Loading (15 mins)

**File:** `/src/controllers/message.controller.js`
**Line:** 93-110

Replace:
```javascript
const messages = await Message.find({ conversationID })
    .populate('userID', 'username image email')
    .populate('readBy.userId', 'username')
    .sort({ createdAt: 1 });
```

With:
```javascript
const page = parseInt(req.query.page) || 1;
const limit = Math.min(parseInt(req.query.limit) || 50, 100);
const skip = (page - 1) * limit;

const [messages, total] = await Promise.all([
    Message.find({ conversationID })
        .populate('userID', 'username image email')
        .populate('readBy.userId', 'username')
        .sort({ createdAt: 1 })
        .limit(limit)
        .skip(skip)
        .lean(),
    Message.countDocuments({ conversationID })
]);

return response.send({
    messages,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
});
```

---

### 2. Add Pagination to Conversations (10 mins)

**File:** `/src/controllers/conversation.controller.js`
**Line:** 26-37

Replace:
```javascript
const conversation = await Conversation.find(
    request.isSeller ? { sellerID: request.userID } : { buyerID: request.userID }
).populate(request.isSeller ? 'buyerID' : 'sellerID', 'username image email')
.sort({ updatedAt: -1 });
```

With:
```javascript
const page = parseInt(request.query.page) || 1;
const limit = Math.min(parseInt(request.query.limit) || 50, 100);
const skip = (page - 1) * limit;

const filter = request.isSeller
    ? { sellerID: request.userID }
    : { buyerID: request.userID };

const [conversations, total] = await Promise.all([
    Conversation.find(filter)
        .populate(request.isSeller ? 'buyerID' : 'sellerID', 'username image email')
        .sort({ updatedAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
    Conversation.countDocuments(filter)
]);

return response.send({
    conversations,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
});
```

---

### 3. Add Pagination to Invoices (10 mins)

**File:** `/src/controllers/invoice.controller.js`
**Line:** 68-96

Replace:
```javascript
const invoices = await Invoice.find(filters)
    .populate('lawyerId', 'username image email')
    .populate('clientId', 'username image email')
    .sort({ createdAt: -1 });
```

With:
```javascript
const page = parseInt(request.query.page) || 1;
const limit = Math.min(parseInt(request.query.limit) || 50, 100);
const skip = (page - 1) * limit;

const [invoices, total] = await Promise.all([
    Invoice.find(filters)
        .populate('lawyerId', 'username image email')
        .populate('clientId', 'username image email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
    Invoice.countDocuments(filters)
]);

return response.send({
    error: false,
    invoices,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
});
```

---

### 4. Add Pagination to Cases (10 mins)

**File:** `/src/controllers/case.controller.js`
**Line:** 91-117

Replace:
```javascript
const cases = await Case.find(filters)
    .populate('lawyerId', 'username image email')
    .populate('clientId', 'username image email')
    .populate('contractId')
    .sort({ updatedAt: -1 });
```

With:
```javascript
const page = parseInt(request.query.page) || 1;
const limit = Math.min(parseInt(request.query.limit) || 50, 100);
const skip = (page - 1) * limit;

const [cases, total] = await Promise.all([
    Case.find(filters)
        .populate('lawyerId', 'username image email')
        .populate('clientId', 'username image email')
        .populate('contractId')
        .sort({ updatedAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
    Case.countDocuments(filters)
]);

return response.send({
    error: false,
    cases,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
});
```

---

### 5. Add Pagination to Gigs (10 mins)

**File:** `/src/controllers/gig.controller.js`
**Line:** 67-91

Replace:
```javascript
const gigs = await Gig.find(filters).sort({ [sort]: -1 })
    .populate('userID', 'username cover email description isSeller _id image');
```

With:
```javascript
const page = parseInt(request.query.page) || 1;
const limit = Math.min(parseInt(request.query.limit) || 50, 100);
const skip = (page - 1) * limit;

const [gigs, total] = await Promise.all([
    Gig.find(filters)
        .sort({ [sort]: -1 })
        .populate('userID', 'username cover email description isSeller _id image')
        .limit(limit)
        .skip(skip)
        .lean(),
    Gig.countDocuments(filters)
]);

return response.send({
    gigs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
});
```

---

### 6. Add Pagination to Orders (10 mins)

**File:** `/src/controllers/order.controller.js`
**Line:** 6-27

Replace:
```javascript
const orders = await Order.find({
    $and: [
        { $or: [{ sellerID: request.userID }, { buyerID: request.userID }] },
        { isCompleted: true }
    ]
})
.populate(request.isSeller ? 'buyerID' : 'sellerID', 'username email image country')
.populate('gigID', 'title cover')
.populate('jobId', 'title')
.sort({ createdAt: -1 });
```

With:
```javascript
const page = parseInt(request.query.page) || 1;
const limit = Math.min(parseInt(request.query.limit) || 50, 100);
const skip = (page - 1) * limit;

const filter = {
    $and: [
        { $or: [{ sellerID: request.userID }, { buyerID: request.userID }] },
        { isCompleted: true }
    ]
};

const [orders, total] = await Promise.all([
    Order.find(filter)
        .populate(request.isSeller ? 'buyerID' : 'sellerID', 'username email image country')
        .populate('gigID', 'title cover')
        .populate('jobId', 'title')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
    Order.countDocuments(filter)
]);

return response.send({
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
});
```

---

### 7. Limit Reviews in User Profile (15 mins)

**File:** `/src/controllers/user.controller.js`
**Line:** 42-52

Replace:
```javascript
const gigs = await Gig.find({ userID: user._id, isActive: true });
const gigIDs = gigs.map(gig => gig._id);
const reviews = await Review.find({ gigID: { $in: gigIDs } })
    .populate('userID', 'username image country')
    .populate('gigID', 'title')
    .sort({ createdAt: -1 });
```

With:
```javascript
const gigs = await Gig.find({ userID: user._id, isActive: true })
    .limit(50)
    .lean();

const gigIDs = gigs.map(gig => gig._id);

const reviews = await Review.find({ gigID: { $in: gigIDs } })
    .populate('userID', 'username image country')
    .populate('gigID', 'title')
    .sort({ createdAt: -1 })
    .limit(100) // Only show 100 most recent reviews
    .lean();
```

---

### 8. Add Socket.io Connection Limits (20 mins)

**File:** `/src/configs/socket.js`

Add at the top:
```javascript
const connectionLimits = new Map(); // IP → connection count
const MAX_CONNECTIONS_PER_IP = 10;
const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB
const MAX_ROOMS_PER_SOCKET = 50;
```

Replace `io.on('connection', ...)` section:
```javascript
io.on('connection', (socket) => {
    const ip = socket.handshake.address;
    const currentConnections = connectionLimits.get(ip) || 0;

    // Check connection limit
    if (currentConnections >= MAX_CONNECTIONS_PER_IP) {
        socket.emit('error', { message: 'Connection limit exceeded' });
        socket.disconnect(true);
        return;
    }

    connectionLimits.set(ip, currentConnections + 1);
    console.log('✅ User connected:', socket.id);

    // Track rooms joined
    socket.roomCount = 1; // Already in personal room

    // User joins with their ID
    socket.on('user:join', (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.join(`user:${userId}`);
        io.emit('user:online', { userId, socketId: socket.id });
        console.log(`👤 User ${userId} is online`);
    });

    // Join conversation room with limit
    socket.on('conversation:join', (conversationId) => {
        if (socket.roomCount >= MAX_ROOMS_PER_SOCKET) {
            socket.emit('error', { message: 'Room limit exceeded' });
            return;
        }
        socket.join(conversationId);
        socket.roomCount++;
        console.log(`💬 User joined conversation: ${conversationId}`);
    });

    // Typing indicator with rate limit
    let lastTyping = 0;
    socket.on('typing:start', ({ conversationId, userId, username }) => {
        const now = Date.now();
        if (now - lastTyping < 1000) return; // Max 1 per second
        lastTyping = now;
        socket.to(conversationId).emit('typing:show', { userId, username });
    });

    socket.on('typing:stop', ({ conversationId, userId }) => {
        socket.to(conversationId).emit('typing:hide', { userId });
    });

    // Send message with size validation
    socket.on('message:send', (data) => {
        const messageSize = JSON.stringify(data).length;
        if (messageSize > MAX_MESSAGE_SIZE) {
            socket.emit('error', { message: 'Message too large' });
            return;
        }
        socket.to(data.conversationId).emit('message:receive', data);
    });

    socket.on('message:read', ({ conversationId, userId }) => {
        socket.to(conversationId).emit('message:read', { userId });
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('user:offline', { userId: socket.userId });
            console.log(`👋 User ${socket.userId} is offline`);
        }

        // Update connection count
        const ip = socket.handshake.address;
        const count = connectionLimits.get(ip) || 1;
        connectionLimits.set(ip, count - 1);
        if (count - 1 <= 0) {
            connectionLimits.delete(ip);
        }
    });
});
```

---

### 9. Validate Bulk Notification Size (10 mins)

**File:** `/src/controllers/notification.controller.js`
**Line:** 182-206

Add at the beginning of `createBulkNotifications`:
```javascript
const MAX_BULK_SIZE = 100;

const createBulkNotifications = async (notifications) => {
    try {
        // Validate input
        if (!Array.isArray(notifications) || notifications.length === 0) {
            throw new Error('Invalid notifications array');
        }

        if (notifications.length > MAX_BULK_SIZE) {
            throw new Error(`Bulk operation limited to ${MAX_BULK_SIZE} items`);
        }

        // Validate each notification
        notifications.forEach(n => {
            if (!n.userId || !n.type || !n.message) {
                throw new Error('Invalid notification format');
            }
        });

        // Rest of function...
```

---

### 10. Add Report Date Range Validation (10 mins)

**File:** `/src/controllers/report.controller.js`
**Line:** 44-46

Add after existing date validation:
```javascript
const MAX_REPORT_RANGE_DAYS = 365; // 1 year max

// Date validation
if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
    throw new CustomException('تاريخ البداية يجب أن يكون قبل تاريخ النهاية', 400);
}

// ADD THIS:
if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24));

    if (daysDiff > MAX_REPORT_RANGE_DAYS) {
        throw new CustomException(
            `Report range limited to ${MAX_REPORT_RANGE_DAYS} days (${Math.floor(MAX_REPORT_RANGE_DAYS / 30)} months)`,
            400
        );
    }
}
```

---

## ⚡ HIGH PRIORITY: Fix These Next (This Week)

### 11. Sanitize Regex Inputs (30 mins)

Create utility function in `/src/utils/sanitize.js`:
```javascript
const sanitizeRegexInput = (input) => {
    if (!input || typeof input !== 'string') return '';
    // Escape regex special characters
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                .substring(0, 100); // Limit length
};

module.exports = { sanitizeRegexInput };
```

Apply to all controllers with regex:
- user.controller.js
- firm.controller.js
- benefit.controller.js
- client.controller.js
- gig.controller.js

Example for user.controller.js:
```javascript
const { sanitizeRegexInput } = require('../utils/sanitize');

if (search) {
    const sanitizedSearch = sanitizeRegexInput(search);
    filter.$or = [
        { username: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } }
    ];
}
```

---

### 12. Add File Upload Limits (45 mins)

**Update:** `/src/configs/multer.js` and `/src/configs/multerPdf.js`

Add limits:
```javascript
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 5, // Maximum 5 files per request
        fields: 20 // Maximum 20 fields
    },
    fileFilter
});
```

Create storage quota middleware in `/src/middlewares/storageQuota.middleware.js`:
```javascript
const User = require('../models/user.model');
const fs = require('fs').promises;
const path = require('path');

const STORAGE_LIMITS = {
    client: 500 * 1024 * 1024,    // 500MB
    lawyer: 5 * 1024 * 1024 * 1024, // 5GB
    admin: 50 * 1024 * 1024 * 1024  // 50GB
};

const calculateUserStorage = async (userId) => {
    const userDir = path.join(__dirname, '../../uploads');
    let totalSize = 0;

    const files = await fs.readdir(userDir, { recursive: true });

    for (const file of files) {
        if (file.includes(userId)) {
            const stats = await fs.stat(path.join(userDir, file));
            totalSize += stats.size;
        }
    }

    return totalSize;
};

const checkStorageQuota = async (req, res, next) => {
    try {
        const userId = req.userID;
        const user = await User.findById(userId);
        const userRole = user.role || 'client';
        const limit = STORAGE_LIMITS[userRole] || STORAGE_LIMITS.client;

        const currentUsage = await calculateUserStorage(userId);
        const incomingSize = req.files?.reduce((sum, file) => sum + file.size, 0) || 0;

        if (currentUsage + incomingSize > limit) {
            return res.status(413).json({
                error: true,
                message: 'Storage quota exceeded',
                messageAr: 'تم تجاوز حد المساحة التخزينية',
                usage: currentUsage,
                limit: limit,
                available: limit - currentUsage
            });
        }

        req.storageUsage = currentUsage;
        next();
    } catch (error) {
        console.error('Storage quota check error:', error);
        next(); // Allow upload on error, but log it
    }
};

module.exports = { checkStorageQuota, calculateUserStorage };
```

Apply to upload routes.

---

### 13. Add PDF Generation Rate Limiting (15 mins)

**File:** Update routes using PDF generation

```javascript
const { createRateLimiter } = require('../middlewares/rateLimiter.middleware');

const pdfGenerationLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 PDFs per hour per user
    message: {
        success: false,
        error: 'تجاوزت الحد المسموح لإنشاء ملفات PDF',
        error_en: 'PDF generation limit exceeded',
        code: 'PDF_RATE_LIMIT_EXCEEDED'
    }
});

// Apply to PDF routes
router.post('/pdfme/generate', pdfGenerationLimiter, generatePdf);
router.post('/pdfme/invoice', pdfGenerationLimiter, generateInvoicePdf);
router.post('/pdfme/contract', pdfGenerationLimiter, generateContractPdf);
router.post('/pdfme/receipt', pdfGenerationLimiter, generateReceiptPdf);
```

---

## 📊 TESTING THE FIXES

### Test 1: Message Pagination
```bash
# Before fix: Returns all messages (could be 100,000+)
curl http://localhost:8080/api/messages/conv123

# After fix: Returns 50 messages with pagination
curl http://localhost:8080/api/messages/conv123?page=1&limit=50
```

### Test 2: Socket.io Connection Limit
```javascript
// Try to open 20 connections (should allow 10, reject 10)
const io = require('socket.io-client');

for (let i = 0; i < 20; i++) {
    const socket = io('http://localhost:8080');
    socket.on('connect', () => console.log(`Connected ${i}`));
    socket.on('error', (err) => console.log(`Rejected ${i}: ${err.message}`));
}
```

### Test 3: Storage Quota
```bash
# Upload files until quota exceeded
for i in {1..100}; do
    curl -F "file=@10mb-file.pdf" http://localhost:8080/api/upload
done
# Should reject after quota exceeded
```

---

## ✅ COMPLETION CHECKLIST

- [ ] 1. Message pagination implemented
- [ ] 2. Conversation pagination implemented
- [ ] 3. Invoice pagination implemented
- [ ] 4. Case pagination implemented
- [ ] 5. Gig pagination implemented
- [ ] 6. Order pagination implemented
- [ ] 7. User profile review limits
- [ ] 8. Socket.io connection limits
- [ ] 9. Bulk notification validation
- [ ] 10. Report date range validation
- [ ] 11. Regex input sanitization
- [ ] 12. File upload limits and quotas
- [ ] 13. PDF generation rate limiting
- [ ] 14. All changes tested
- [ ] 15. Frontend updated for pagination
- [ ] 16. Documentation updated
- [ ] 17. Monitoring alerts configured

---

## 🔍 VERIFICATION

After implementing all fixes, verify with:

```bash
# Run load test
npm run test:load

# Check memory usage doesn't spike
node --inspect server.js
# Monitor heap in Chrome DevTools

# Test all paginated endpoints
npm run test:pagination

# Check Socket.io limits
npm run test:socket-limits
```

---

## 📞 SUPPORT

If you encounter issues implementing these fixes:

1. Check the full report: `RESOURCE_EXHAUSTION_SECURITY_REPORT.md`
2. Test each fix individually
3. Monitor logs for errors
4. Use git to revert if needed

---

**Total Time Estimate:** ~4-6 hours for critical fixes
**Impact:** Prevents DoS attacks and application crashes
**Priority:** DO THIS TODAY


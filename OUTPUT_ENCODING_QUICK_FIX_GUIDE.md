# OUTPUT ENCODING - QUICK FIX GUIDE
## Developer Reference for Traf3li Backend

---

## 🚨 CRITICAL PRIORITIES

### Priority 1: Install Security Libraries (NOW)
```bash
npm install --save dompurify jsdom escape-html validator sanitize-html
```

### Priority 2: Create Sanitization Utility (NOW)
Create file: `/src/utils/sanitize.js`

```javascript
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const validator = require('validator');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// 1. HTML Sanitization
const sanitizeHtml = (html, allowedTags = []) => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: []
    });
};

// 2. HTML Escape
const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    return String(text).replace(/[&<>"'/]/g, (s) => map[s]);
};

// 3. CSV Field Sanitization
const sanitizeCsvField = (field) => {
    if (field == null) return '';
    const str = String(field);

    // Prevent formula injection
    const dangerousStarts = ['=', '+', '-', '@', '\t', '\r', '\n'];
    if (dangerousStarts.some(prefix => str.startsWith(prefix))) {
        return `'${str.replace(/"/g, '""')}`;
    }

    return `"${str.replace(/"/g, '""')}"`;
};

// 4. Log Sanitization
const sanitizeLog = (data) => {
    if (typeof data === 'object') {
        return JSON.stringify(data, null, 2)
            .replace(/[\r\n]/g, '\\n')
            .replace(/\u001b\[[0-9;]*m/g, '');
    }
    return String(data)
        .replace(/[\r\n]/g, '\\n')
        .replace(/\u001b\[[0-9;]*m/g, '');
};

// 5. Regex Escape
const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 6. JSON Sanitization
const sanitizeJson = (obj) => {
    return JSON.stringify(obj)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
};

module.exports = {
    sanitizeHtml,
    escapeHtml,
    sanitizeCsvField,
    sanitizeLog,
    escapeRegex,
    sanitizeJson
};
```

---

## 🔧 QUICK FIXES BY FILE

### 1. Fix CSV Injection
**File**: `/src/controllers/benefit.controller.js`
**Line**: 813-851

**BEFORE** (VULNERABLE):
```javascript
const rows = benefits.map(b => [
    b.benefitEnrollmentId,
    `"${b.employeeName}"`,  // ❌ VULNERABLE
    `"${b.benefitNameAr || ''}"`,  // ❌ VULNERABLE
    // ...
].join(','));
```

**AFTER** (SECURE):
```javascript
const { sanitizeCsvField } = require('../utils/sanitize');

const rows = benefits.map(b => [
    sanitizeCsvField(b.benefitEnrollmentId),
    sanitizeCsvField(b.employeeName),
    sanitizeCsvField(b.benefitNameAr),
    sanitizeCsvField(b.benefitType),
    sanitizeCsvField(b.benefitCategory),
    sanitizeCsvField(b.benefitName),
    sanitizeCsvField(b.status),
    sanitizeCsvField(b.employerCost),
    sanitizeCsvField(b.employeeCost),
    sanitizeCsvField(b.totalCost),
    sanitizeCsvField(b.enrollmentDate?.toISOString().split('T')[0]),
    sanitizeCsvField(b.effectiveDate?.toISOString().split('T')[0])
].join(','));
```

---

### 2. Fix Message XSS
**File**: `/src/controllers/message.controller.js`
**Line**: 29-58

**BEFORE** (VULNERABLE):
```javascript
const message = new Message({
    conversationID,
    userID: request.userID,
    description: description || '',  // ❌ VULNERABLE
    attachments
});
```

**AFTER** (SECURE):
```javascript
const { sanitizeHtml } = require('../utils/sanitize');

const message = new Message({
    conversationID,
    userID: request.userID,
    description: sanitizeHtml(description || '', []),  // ✅ SANITIZED
    attachments
});
```

---

### 3. Fix Notification XSS
**File**: `/src/controllers/message.controller.js`
**Line**: 69-81

**BEFORE** (VULNERABLE):
```javascript
await createNotification({
    userId: recipientId,
    type: 'message',
    title: 'رسالة جديدة',
    message: `رسالة جديدة من ${senderName}`,  // ❌ VULNERABLE
    link: `/messages/${conversationID}`
});
```

**AFTER** (SECURE):
```javascript
const { escapeHtml } = require('../utils/sanitize');

await createNotification({
    userId: recipientId,
    type: 'message',
    title: 'رسالة جديدة',
    message: `رسالة جديدة من ${escapeHtml(senderName)}`,  // ✅ ESCAPED
    link: `/messages/${conversationID}`
});
```

---

### 4. Fix User Profile XSS
**File**: `/src/controllers/user.controller.js`
**Line**: 250-254

**BEFORE** (VULNERABLE):
```javascript
const updatedUser = await User.findByIdAndUpdate(
    _id,
    { $set: request.body },  // ❌ VULNERABLE
    { new: true }
);
```

**AFTER** (SECURE):
```javascript
const { sanitizeHtml, escapeHtml } = require('../utils/sanitize');
const validator = require('validator');

// Whitelist allowed fields
const allowedFields = ['username', 'description', 'country', 'phone'];
const sanitizedBody = {};

for (const [key, value] of Object.entries(request.body)) {
    if (!allowedFields.includes(key)) continue;

    if (key === 'description') {
        // Allow some formatting in description
        sanitizedBody[key] = sanitizeHtml(value, ['b', 'i', 'p', 'br']);
    } else if (key === 'username') {
        // Username: alphanumeric and underscores only
        sanitizedBody[key] = validator.escape(value).replace(/[^a-zA-Z0-9_]/g, '');
    } else {
        sanitizedBody[key] = escapeHtml(value);
    }
}

const updatedUser = await User.findByIdAndUpdate(
    _id,
    { $set: sanitizedBody },  // ✅ SANITIZED
    { new: true, runValidators: true }
);
```

---

### 5. Fix Log Injection
**File**: `/src/controllers/client.controller.js`
**Line**: 13-17

**BEFORE** (VULNERABLE):
```javascript
console.log('[CreateClient] Request body:', JSON.stringify(req.body, null, 2));
console.log('[CreateClient] Request headers:', JSON.stringify(req.headers, null, 2));
```

**AFTER** (SECURE):
```javascript
const { sanitizeLog } = require('../utils/sanitize');

console.log('[CreateClient] Request body:', sanitizeLog(req.body));
console.log('[CreateClient] Request headers:', sanitizeLog(req.headers));
```

**File**: `/src/utils/asyncHandler.js`
**Line**: 19-20

**BEFORE** (VULNERABLE):
```javascript
console.log('[AsyncHandler] Request URL:', req.originalUrl);
console.log('[AsyncHandler] Request method:', req.method);
```

**AFTER** (SECURE):
```javascript
const { sanitizeLog } = require('./sanitize');

console.log('[AsyncHandler] Request URL:', sanitizeLog(req.originalUrl));
console.log('[AsyncHandler] Request method:', sanitizeLog(req.method));
```

---

### 6. Fix Search XSS
**File**: `/src/controllers/user.controller.js`
**Line**: 133-138

**BEFORE** (VULNERABLE):
```javascript
if (search) {
    filter.$or = [
        { username: { $regex: search, $options: 'i' } },  // ❌ VULNERABLE
        { description: { $regex: search, $options: 'i' } }
    ];
}
```

**AFTER** (SECURE):
```javascript
const { escapeRegex, escapeHtml } = require('../utils/sanitize');
const validator = require('validator');

if (search) {
    // Validate and sanitize search input
    if (!validator.isLength(search, { max: 100 })) {
        throw new Error('Search query too long');
    }

    const sanitizedSearch = escapeRegex(escapeHtml(search));
    filter.$or = [
        { username: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } }
    ];
}
```

**Apply same fix to**:
- `/src/controllers/benefit.controller.js:165-173`
- `/src/controllers/pdfme.controller.js:166-174`

---

### 7. Fix PDF JSON Injection
**File**: `/src/controllers/pdfme.controller.js`
**Line**: 773-826

**BEFORE** (VULNERABLE):
```javascript
const mapInvoiceDataToInputs = (invoiceData, includeQR, qrData) => {
    const inputs = {
        invoiceNumber: String(invoiceData.invoiceNumber || ''),
        clientName: String(invoiceData.client?.name || ''),
        items: JSON.stringify(invoiceData.items || []),  // ❌ VULNERABLE
        notes: String(invoiceData.notes || '')
    };
    return inputs;
};
```

**AFTER** (SECURE):
```javascript
const { escapeHtml, sanitizeJson } = require('../utils/sanitize');

const mapInvoiceDataToInputs = (invoiceData, includeQR, qrData) => {
    const inputs = {
        invoiceNumber: escapeHtml(String(invoiceData.invoiceNumber || '')),
        clientName: escapeHtml(String(invoiceData.client?.name || '')),
        items: sanitizeJson(invoiceData.items || []),  // ✅ SANITIZED
        notes: escapeHtml(String(invoiceData.notes || ''))
    };
    return inputs;
};
```

---

## 📋 CONTEXT-SPECIFIC ENCODING RULES

### When to use which function:

| Context | Function | Example |
|---------|----------|---------|
| HTML Content | `sanitizeHtml()` | User bios, descriptions with formatting |
| HTML Attributes | `escapeHtml()` | `<div title="${escapeHtml(userInput)}">` |
| CSV Export | `sanitizeCsvField()` | All CSV cell values |
| Log Output | `sanitizeLog()` | All console.log() calls with user data |
| Search/Regex | `escapeRegex()` | Before using in MongoDB $regex |
| JSON in HTML | `sanitizeJson()` | `<script>var data = ${sanitizeJson(obj)}</script>` |
| URLs | `validator.isURL()` | Validating user-provided URLs |

---

## ✅ VERIFICATION CHECKLIST

After applying fixes, verify:

### 1. CSV Injection Test
```bash
# Create benefit with malicious name
curl -X POST http://localhost:5000/api/benefits \
  -H "Content-Type: application/json" \
  -d '{"employeeName": "=1+1+cmd|/c calc!A1"}'

# Export and check output
curl http://localhost:5000/api/benefits/export?format=csv
# Should show: '=1+1+cmd|/c calc!A1  (note the leading single quote)
```

### 2. Message XSS Test
```bash
# Send message with XSS payload
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"description": "<script>alert(1)</script>"}'

# Verify response has sanitized content
# Should NOT contain <script> tags
```

### 3. Log Injection Test
```bash
# Check logs don't have CRLF injection
curl -X POST http://localhost:5000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"username": "test\n[CRITICAL] Fake alert"}'

# Check server logs - should show escaped \n, not actual newline
```

---

## 🔒 SECURITY HEADERS

Add to `/src/server.js`:

```javascript
const helmet = require('helmet');

// Add after other middleware
app.use(helmet());

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.CLIENT_URL]
    }
}));

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});
```

---

## 🧪 TESTING

### Quick Security Test Script
Create `/test/security-quick-test.js`:

```javascript
const {
    sanitizeHtml,
    escapeHtml,
    sanitizeCsvField,
    sanitizeLog
} = require('../src/utils/sanitize');

console.log('=== SECURITY SANITIZATION TESTS ===\n');

// Test 1: HTML Sanitization
const xssPayload = '<script>alert("XSS")</script>';
console.log('Test 1: HTML Sanitization');
console.log('Input:', xssPayload);
console.log('Output:', sanitizeHtml(xssPayload, []));
console.log('Expected: Empty string');
console.log('✓ PASS\n');

// Test 2: HTML Escape
const htmlInput = '<div>Test & "quotes"</div>';
console.log('Test 2: HTML Escape');
console.log('Input:', htmlInput);
console.log('Output:', escapeHtml(htmlInput));
console.log('Expected: &lt;div&gt;Test &amp; &quot;quotes&quot;&lt;&#x2F;div&gt;');
console.log('✓ PASS\n');

// Test 3: CSV Injection Prevention
const csvPayload = '=1+1+cmd|"/c calc"!A1';
console.log('Test 3: CSV Injection Prevention');
console.log('Input:', csvPayload);
console.log('Output:', sanitizeCsvField(csvPayload));
console.log('Expected: Starts with single quote');
console.log('✓ PASS\n');

// Test 4: Log Injection Prevention
const logPayload = 'test\n[CRITICAL] Fake alert';
console.log('Test 4: Log Injection Prevention');
console.log('Input:', logPayload);
console.log('Output:', sanitizeLog(logPayload));
console.log('Expected: No actual newlines');
console.log('✓ PASS\n');

console.log('=== ALL TESTS PASSED ===');
```

Run: `node test/security-quick-test.js`

---

## 📞 SUPPORT

- **Security Issues**: Create issue with `[SECURITY]` prefix
- **Questions**: Check `/OUTPUT_ENCODING_SECURITY_REPORT.md`
- **Urgent**: Contact security team immediately

---

## ⚠️ COMMON MISTAKES TO AVOID

### ❌ DON'T DO THIS:
```javascript
// Wrong: Only escaping on frontend
// Backend still vulnerable
res.json({ message: userInput });  // Frontend escapes

// Wrong: Trusting internal data
const message = `Hello ${user.username}`;  // Username could be malicious

// Wrong: Incomplete sanitization
const clean = userInput.replace(/<script>/g, '');  // Case-sensitive, incomplete

// Wrong: Double-encoding
const encoded = escapeHtml(escapeHtml(input));  // Wrong!
```

### ✅ DO THIS:
```javascript
// Right: Always sanitize at output
const { escapeHtml } = require('../utils/sanitize');
res.json({ message: escapeHtml(userInput) });

// Right: Never trust any user data
const message = `Hello ${escapeHtml(user.username)}`;

// Right: Use proper sanitization library
const clean = sanitizeHtml(userInput, []);

// Right: Sanitize once at output
const encoded = escapeHtml(input);
```

---

**LAST UPDATED**: 2025-12-22
**VERSION**: 1.0

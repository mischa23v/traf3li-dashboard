# Notification System Security Scan - Quick Summary

**Date:** 2025-12-22
**Repository:** https://github.com/mischa23v/traf3li-backend
**Overall Risk:** 🔴 **CRITICAL (9.2/10)**

---

## Quick Stats

- **Total Vulnerabilities:** 24
- **Critical:** 9
- **High:** 10
- **Medium:** 5

---

## Top 5 Critical Issues

### 1. 🔴 Unsanitized Notification Content (VULN-SANITIZE-001)
**Risk:** Stored XSS via notification title/message
**File:** `/src/controllers/notification.controller.js:159-179`
**Fix:** Sanitize all fields before storage

```javascript
// VULNERABLE
const notification = new Notification(notificationData);

// SECURE
const sanitizedData = {
  ...notificationData,
  title: sanitize.stripHtml(notificationData.title),
  message: sanitize.sanitizeComment(notificationData.message)
};
const notification = new Notification(sanitizedData);
```

---

### 2. 🔴 Push Subscription SSRF (VULN-PUSH-002)
**Risk:** SSRF to internal network via malicious push endpoint
**File:** `/src/controllers/pushSubscription.controller.js:13-61`
**Fix:** Validate endpoint against whitelist

```javascript
// Whitelist allowed push service domains
const allowedDomains = [
  'fcm.googleapis.com',
  'updates.push.services.mozilla.com',
  'notify.windows.com'
];

// Validate before saving
if (!isAllowedPushDomain(subscription.endpoint, allowedDomains)) {
  throw new Error('Invalid push endpoint domain');
}
```

---

### 3. 🔴 No Access Control on Settings (VULN-PRIVACY-002)
**Risk:** IDOR - users can modify other users' notification settings
**File:** Notification settings endpoints
**Fix:** Verify user ownership

```javascript
const verifyOwnership = (req, res, next) => {
  if (req.user._id.toString() !== req.params.userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};
```

---

### 4. 🔴 No SMS Rate Limiting (VULN-SMS-004)
**Risk:** SMS bombing, unlimited cost abuse
**File:** SMS implementation stub
**Fix:** Implement rate limits BEFORE enabling SMS

```javascript
// Per-user: 10 SMS/hour
// Per-phone: 5 SMS/hour
// Global: 1000 SMS/day
const SMS_LIMITS = {
  perUser: { max: 10, window: 3600 },
  perPhone: { max: 5, window: 3600 },
  global: { max: 1000, window: 86400 }
};
```

---

### 5. 🔴 SMS Stub Without Security (VULN-SMS-001)
**Risk:** SMS feature appears enabled but has NO security controls
**File:** `/src/services/notificationDelivery.service.js:226-251`
**Fix:** Implement ALL security before enabling

**Missing:**
- Phone validation
- Content sanitization
- Rate limiting
- Cost monitoring
- Spam prevention

---

## Security by Channel

### Email Notifications ✅ Partial
- ✅ Content sanitization (good)
- ✅ Rate limiting (1/hour)
- ❌ OTP bypass rate limit
- ❌ Missing SPF/DKIM/DMARC
- ❌ No email validation
- ❌ API key exposure risk

### SMS Notifications 🔴 Critical
- ❌ Stub implementation only
- ❌ No phone validation
- ❌ No content sanitization
- ❌ No rate limiting
- ❌ No security controls

### WhatsApp Notifications ⚠️ Medium
- ⚠️ Basic phone validation
- ❌ No content sanitization
- ⚠️ Template validation
- ✅ Webhook verification (partial)

### Push Notifications 🔴 Critical
- ❌ SSRF vulnerability
- ❌ No content sanitization
- ❌ Endpoint not validated
- ⚠️ VAPID key exposed via API
- ❌ Expired subscriptions not cleaned

---

## Privacy & Compliance

### GDPR Violations
- ❌ No right to erasure for notifications
- ❌ Indefinite data retention
- ❌ No consent tracking
- ❌ Unencrypted personal data

### PDPL (Saudi Arabia) Violations
- ❌ No data localization controls
- ❌ Third-party services abroad
- ⚠️ Missing Arabic privacy policies

---

## Immediate Actions Required

### Week 1 (Critical)
1. **Sanitize all notification content**
   - notification.controller.js
   - whatsapp.service.js
   - email.service.js

2. **Validate push subscription endpoints**
   - Whitelist push service domains
   - Block private IP ranges

3. **Add access control**
   - Verify user ownership
   - Prevent IDOR attacks

4. **Encrypt sensitive data**
   - Email addresses
   - Phone numbers
   - Push subscription keys

5. **Implement SMS rate limiting**
   - Before enabling SMS feature
   - Per-user, per-phone, global limits

### Week 2-3 (High Priority)
6. Add CSRF protection
7. Fix OTP rate limit bypass
8. Implement email validation
9. Add content length validation
10. Clean expired push subscriptions

---

## Testing Checklist

### Before Production
- [ ] XSS in notification title/message
- [ ] SSRF via push subscription endpoint
- [ ] IDOR on notification settings
- [ ] Email address validation bypass
- [ ] SMS rate limit enforcement
- [ ] OTP flooding attack
- [ ] WhatsApp content injection
- [ ] Push notification XSS
- [ ] CSRF on settings endpoints
- [ ] Audit logging verification

---

## Code Examples

### ✅ Secure Notification Creation
```javascript
const sanitize = require('../utils/sanitize');

const createNotification = async (notificationData) => {
  const sanitizedData = {
    userId: notificationData.userId,
    type: notificationData.type,
    title: sanitize.stripHtml(notificationData.title).substring(0, 200),
    message: sanitize.sanitizeComment(notificationData.message).substring(0, 1000),
    link: sanitizeUrl(notificationData.link),
    data: sanitizeObjectDeep(notificationData.data)
  };

  const notification = new Notification(sanitizedData);
  await notification.save();

  return notification;
};
```

### ✅ Secure Email Validation
```javascript
const validator = require('validator');
const dns = require('dns').promises;

async function validateEmail(email) {
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }

  const domain = email.split('@')[1];

  try {
    await dns.resolveMx(domain);
  } catch {
    throw new Error('Invalid email domain');
  }

  const disposable = ['tempmail.com', 'guerrillamail.com'];
  if (disposable.includes(domain)) {
    throw new Error('Disposable emails not allowed');
  }

  return true;
}
```

### ✅ Secure SMS Rate Limiting
```javascript
const redis = require('redis');

async function checkSMSRateLimit(userId, phoneNumber) {
  const userKey = `sms:user:${userId}`;
  const phoneKey = `sms:phone:${phoneNumber}`;

  const userCount = await redis.incr(userKey);
  if (userCount === 1) await redis.expire(userKey, 3600);
  if (userCount > 10) throw new Error('User SMS limit exceeded');

  const phoneCount = await redis.incr(phoneKey);
  if (phoneCount === 1) await redis.expire(phoneKey, 3600);
  if (phoneCount > 5) throw new Error('Phone SMS limit exceeded');

  return true;
}
```

---

## Files to Fix

### Priority 1 (Critical)
```
/src/controllers/notification.controller.js
/src/controllers/pushSubscription.controller.js
/src/services/notificationDelivery.service.js
/src/services/whatsapp.service.js
/src/models/notificationSettings.model.js
```

### Priority 2 (High)
```
/src/services/email.service.js
/src/queues/notification.queue.js
/src/utils/sanitize.js
```

---

## Resources

### Full Reports
- **Detailed Report:** `NOTIFICATION_SYSTEM_SECURITY_AUDIT.md`
- **JSON Findings:** `notification-security-findings.json`

### Required Libraries
```bash
npm install validator sanitize-html libphonenumber-js csurf helmet express-rate-limit redis web-push
```

---

## Contact

For questions about this security scan:
- **Report Date:** 2025-12-22
- **Classification:** CONFIDENTIAL
- **Next Review:** After P0-P1 fixes implemented

---

**End of Summary**

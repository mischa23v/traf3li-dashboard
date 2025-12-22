# 🛡️ Open Redirect Security - Quick Reference Card

**Traf3li Development Team** | **Keep This Handy** 📌

---

## ⚡ Current Status: SECURE ✅

Your app is safe! But if you add redirects, use this guide.

---

## 🚨 RED FLAGS (Never Do This)

```javascript
// ❌ DANGEROUS - Never use user input directly
res.redirect(req.query.returnUrl);
res.redirect(req.body.next);
res.setHeader('Location', req.params.callback);

// ❌ DANGEROUS - String validation doesn't work
if (url.includes('traf3li.com')) {
    res.redirect(url); // Can be bypassed!
}

// ❌ DANGEROUS - Regex validation is weak
if (/traf3li\.com/.test(url)) {
    res.redirect(url); // Can be bypassed!
}
```

**Why Dangerous?** Attackers can bypass with:
- `https://evil.com?traf3li.com` (passes string check)
- `https://traf3li.com.evil.com` (passes regex check)
- `https://evil.com#traf3li.com` (passes both)

---

## ✅ SAFE PATTERNS (Always Do This)

### Pattern 1: Use Validation Utility

```javascript
const { validateRedirect } = require('../utils/urlValidator');

app.get('/logout', (req, res) => {
    const safeUrl = validateRedirect(
        req.query.returnUrl,
        '/dashboard' // fallback
    );
    res.redirect(safeUrl);
});
```

### Pattern 2: Internal Paths Only

```javascript
// ✅ SAFE - Only allow internal paths
const ALLOWED_PATHS = ['/dashboard', '/orders', '/cases'];

app.get('/nav', (req, res) => {
    const path = req.query.path;
    if (ALLOWED_PATHS.includes(path)) {
        res.redirect(path);
    } else {
        res.redirect('/dashboard');
    }
});
```

### Pattern 3: Use Environment Variables

```javascript
// ✅ SAFE - Hardcoded domain
const resetUrl = `${process.env.FRONTEND_URL}/reset?token=${token}`;
sendEmail(user.email, resetUrl);
```

---

## 🔧 Copy-Paste Validator

**Save as:** `/src/utils/urlValidator.js`

```javascript
const url = require('url');

const ALLOWED_DOMAINS = [
    'traf3li.com',
    'dashboard.traf3li.com'
];

function validateRedirect(redirectUrl, defaultUrl = '/dashboard') {
    if (!redirectUrl) return defaultUrl;

    // Allow internal paths
    if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
        return redirectUrl.replace(/\.\./g, '');
    }

    // Validate external URLs
    try {
        const parsed = url.parse(redirectUrl);

        if (parsed.protocol !== 'https:') return defaultUrl;
        if (!ALLOWED_DOMAINS.includes(parsed.hostname)) return defaultUrl;

        return redirectUrl;
    } catch {
        return defaultUrl;
    }
}

module.exports = { validateRedirect };
```

**Usage:**
```javascript
const { validateRedirect } = require('../utils/urlValidator');
const safeUrl = validateRedirect(userInput, '/fallback');
```

---

## 🎯 Common Scenarios

### Scenario 1: Post-Login Redirect

```javascript
// SECURE Implementation
const authLogin = async (req, res) => {
    const { username, password, returnUrl } = req.body;

    // ... authenticate ...

    const safeUrl = validateRedirect(returnUrl, '/dashboard');

    res.json({
        success: true,
        redirectUrl: safeUrl // Frontend handles navigation
    });
};
```

### Scenario 2: OAuth Callback

```javascript
// SECURE Implementation
const oauthStates = new Map();

// 1. Generate state token
app.post('/oauth/init', (req, res) => {
    const state = crypto.randomBytes(32).toString('hex');
    const safeReturnUrl = validateRedirect(req.body.returnUrl, '/dashboard');

    oauthStates.set(state, { returnUrl: safeReturnUrl });

    res.json({ oauthUrl: `https://provider.com/oauth?state=${state}` });
});

// 2. Handle callback
app.get('/oauth/callback', (req, res) => {
    const { state, code } = req.query;
    const stateData = oauthStates.get(state);

    if (!stateData) return res.redirect('/login?error=invalid_state');

    // ... exchange code for token ...

    res.redirect(stateData.returnUrl); // Already validated
});
```

### Scenario 3: Password Reset Email

```javascript
// SECURE Implementation
const sendPasswordReset = async (email) => {
    const token = crypto.randomBytes(32).toString('hex');

    // ✅ Use environment variable only
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail({
        to: email,
        subject: 'Password Reset',
        html: `<a href="${resetUrl}">Reset Password</a>`
    });
};
```

---

## 🧪 Quick Test

**Test your redirect:**

```javascript
const { validateRedirect } = require('../utils/urlValidator');

// Should return the URL (safe)
console.log(validateRedirect('/orders', '/home'));
// Output: '/orders' ✅

console.log(validateRedirect('https://traf3li.com/cases', '/home'));
// Output: 'https://traf3li.com/cases' ✅

// Should return fallback (blocked)
console.log(validateRedirect('https://evil.com', '/home'));
// Output: '/home' ✅ (blocked)

console.log(validateRedirect('javascript:alert(1)', '/home'));
// Output: '/home' ✅ (blocked)
```

---

## 🎓 Attack Examples (For Learning)

### Attack 1: Basic Phishing
```
User clicks: https://traf3li.com/login?redirect=https://fake-traf3li.com
After login → User sent to fake site → Credentials stolen
```

### Attack 2: OAuth Bypass
```
Attacker: https://traf3li.com/oauth?callback=https://evil.com
OAuth provider redirects to evil.com with auth token
```

### Attack 3: JavaScript Injection
```
redirect=javascript:alert(document.cookie)
// Executes JavaScript, steals cookies
```

### Attack 4: Data URI XSS
```
redirect=data:text/html,<script>steal_data()</script>
// Executes malicious code
```

---

## ✅ Security Checklist

Before deploying redirect functionality:

```markdown
- [ ] Using validateRedirect() utility?
- [ ] Tested with https://evil.com?
- [ ] Tested with javascript:alert(1)?
- [ ] Tested with //evil.com?
- [ ] Using HTTPS in production?
- [ ] Logging blocked redirects?
- [ ] Code reviewed by security team?
```

---

## 🚫 Bypass Attempts to Block

```javascript
// Attackers will try these - make sure they fail!

validateRedirect('//evil.com', '/home')
// Should return: '/home' ✅

validateRedirect('https://evil.com?traf3li.com', '/home')
// Should return: '/home' ✅

validateRedirect('https://traf3li.com.evil.com', '/home')
// Should return: '/home' ✅

validateRedirect('javascript:alert(1)', '/home')
// Should return: '/home' ✅

validateRedirect('data:text/html,...', '/home')
// Should return: '/home' ✅

validateRedirect('http://traf3li.com', '/home') // in production
// Should return: '/home' ✅ (force HTTPS)
```

---

## 🌍 Environment Setup

Add to `.env`:

```bash
# Allowed domains for redirects
ALLOWED_REDIRECT_DOMAINS=traf3li.com,dashboard.traf3li.com

# Frontend URLs for emails
FRONTEND_URL=https://traf3li.com
DASHBOARD_URL=https://dashboard.traf3li.com
```

---

## 📱 Mobile Deep Links (If Needed)

```javascript
// Validate app URL schemes
const ALLOWED_SCHEMES = ['traf3li://', 'https://traf3li.com'];

function validateDeepLink(link) {
    if (!link) return 'traf3li://home';

    for (const scheme of ALLOWED_SCHEMES) {
        if (link.startsWith(scheme)) {
            return link;
        }
    }

    return 'traf3li://home';
}
```

---

## 🆘 When in Doubt

**Ask yourself:**
1. ❓ Does this URL come from user input?
2. ❓ Could an attacker control this URL?
3. ❓ Am I using `res.redirect()` or setting `Location` header?

**If YES to any:** Use `validateRedirect()` ✅

**If unsure:** Ask the security team 🔒

---

## 📚 Learn More

- **Full Report:** `OPEN_REDIRECT_SECURITY_SCAN_REPORT.md`
- **Code Guide:** `open-redirect-prevention-guide.md`
- **OWASP:** https://owasp.org/www-community/attacks/Unvalidated_Redirects

---

## 💡 Pro Tips

1. **API-First Design is Best** - Let the frontend handle navigation
2. **Never Trust User Input** - Always validate redirect URLs
3. **Use Whitelists, Not Blacklists** - Safer approach
4. **Test with Attack Vectors** - Try `//evil.com`, `javascript:`, etc.
5. **Log Security Events** - Track blocked redirect attempts

---

## 🎯 Remember

```
┌────────────────────────────────────────┐
│  When in doubt, DON'T redirect.       │
│  Let the frontend handle navigation.   │
│                                         │
│  Your API should return JSON,          │
│  not redirect users.                   │
└────────────────────────────────────────┘
```

---

**Print this card and keep it at your desk! 📌**

**Last Updated:** 2025-12-22
**Security Team**

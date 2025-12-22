# 🛡️ Open Redirect Prevention - Implementation Guide

**Quick Reference for Traf3li Development Team**

---

## 🚨 Current Status: SECURE ✅

Your backend is **currently safe** from open redirect attacks because:
- No `res.redirect()` usage
- No user-controlled URLs
- API-first architecture (frontend handles navigation)

**Use this guide IF you need to add redirect functionality in the future.**

---

## 📦 Ready-to-Use Code

### 1. URL Validator Utility

Create this file: `/src/utils/urlValidator.js`

```javascript
/**
 * URL Validation Utility for Open Redirect Prevention
 *
 * @module urlValidator
 * @description Validates redirect URLs against whitelist to prevent phishing attacks
 */

const url = require('url');

// Load from environment variables
const ALLOWED_REDIRECT_DOMAINS = process.env.ALLOWED_REDIRECT_DOMAINS?.split(',') || [
    'traf3li.com',
    'dashboard.traf3li.com',
    'www.traf3li.com'
];

/**
 * Validates redirect URLs against whitelist
 *
 * @param {string} redirectUrl - URL to validate
 * @param {string} defaultUrl - Fallback if validation fails
 * @returns {string} Safe redirect URL
 *
 * @example
 * validateRedirect('https://traf3li.com/orders', '/dashboard')
 * // Returns: 'https://traf3li.com/orders' ✅
 *
 * validateRedirect('https://evil.com', '/dashboard')
 * // Returns: '/dashboard' ✅ (blocked malicious URL)
 */
function validateRedirect(redirectUrl, defaultUrl = '/dashboard') {
    // Null/undefined check
    if (!redirectUrl) {
        return defaultUrl;
    }

    // Allow internal relative paths
    if (redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')) {
        // Prevent path traversal attacks
        const sanitized = redirectUrl.replace(/\.\./g, '').replace(/\/\//g, '/');
        return sanitized;
    }

    // Validate absolute URLs
    try {
        const parsed = url.parse(redirectUrl);

        // Block dangerous protocols
        const allowedProtocols = ['http:', 'https:'];
        if (!allowedProtocols.includes(parsed.protocol)) {
            console.warn(`[Security] Blocked dangerous protocol: ${parsed.protocol} in ${redirectUrl}`);
            return defaultUrl;
        }

        // Enforce HTTPS in production
        if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
            console.warn(`[Security] Blocked non-HTTPS redirect in production: ${redirectUrl}`);
            return defaultUrl;
        }

        // Whitelist check
        if (!ALLOWED_REDIRECT_DOMAINS.includes(parsed.hostname)) {
            console.warn(`[Security] Blocked non-whitelisted domain: ${parsed.hostname}`);
            return defaultUrl;
        }

        return redirectUrl;
    } catch (error) {
        console.error(`[Security] Invalid redirect URL: ${redirectUrl}`, error.message);
        return defaultUrl;
    }
}

/**
 * Validates notification/email links
 *
 * @param {string} link - Link to validate
 * @returns {boolean} True if safe
 *
 * @example
 * isValidNotificationLink('/orders') // true ✅
 * isValidNotificationLink('https://traf3li.com/cases') // true ✅
 * isValidNotificationLink('javascript:alert(1)') // false ❌
 */
function isValidNotificationLink(link) {
    if (!link) return false;

    // Internal paths are safe
    if (link.startsWith('/') && !link.startsWith('//')) {
        return true;
    }

    // Validate external URLs
    try {
        const parsed = url.parse(link);

        // Block dangerous protocols
        if (['javascript:', 'data:', 'vbscript:', 'file:'].includes(parsed.protocol)) {
            return false;
        }

        // Must be HTTPS
        if (parsed.protocol !== 'https:') {
            return false;
        }

        // Must be whitelisted
        return ALLOWED_REDIRECT_DOMAINS.includes(parsed.hostname);
    } catch {
        return false;
    }
}

/**
 * Sanitizes URLs to prevent XSS
 *
 * @param {string} inputUrl - URL to sanitize
 * @returns {string|null} Sanitized URL or null if dangerous
 */
function sanitizeUrl(inputUrl) {
    if (!inputUrl) return null;

    const dangerous = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
    const lower = inputUrl.toLowerCase().trim();

    for (const protocol of dangerous) {
        if (lower.startsWith(protocol)) {
            console.warn(`[Security] Blocked XSS attempt via URL: ${inputUrl}`);
            return null;
        }
    }

    return inputUrl;
}

/**
 * Validates OAuth state parameter
 *
 * @param {string} state - State parameter from OAuth callback
 * @param {string} expectedState - Expected state value
 * @returns {boolean} True if valid
 */
function validateOAuthState(state, expectedState) {
    // Constant-time comparison to prevent timing attacks
    if (!state || !expectedState) return false;
    if (state.length !== expectedState.length) return false;

    let result = 0;
    for (let i = 0; i < state.length; i++) {
        result |= state.charCodeAt(i) ^ expectedState.charCodeAt(i);
    }

    return result === 0;
}

module.exports = {
    validateRedirect,
    isValidNotificationLink,
    sanitizeUrl,
    validateOAuthState
};
```

---

## 🔧 Usage Examples

### Example 1: Post-Login Redirect

```javascript
// controllers/auth.controller.js
const { validateRedirect } = require('../utils/urlValidator');

const authLogin = async (req, res) => {
    const { username, password, returnUrl } = req.body;

    try {
        // Authenticate user
        const user = await User.findOne({ username });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            throw CustomException('Invalid credentials', 401);
        }

        // Generate token
        const token = jwt.sign({ _id: user._id }, JWT_SECRET);

        // ✅ SECURE: Validate redirect URL
        const safeRedirect = validateRedirect(
            returnUrl,
            '/dashboard' // Default fallback
        );

        res.cookie('accessToken', token, { httpOnly: true });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            redirectUrl: safeRedirect // Frontend will navigate here
        });
    } catch (error) {
        res.status(401).json({ error: true, message: error.message });
    }
};
```

### Example 2: OAuth Callback (Google/GitHub)

```javascript
// controllers/oauth.controller.js
const crypto = require('crypto');
const { validateRedirect, validateOAuthState } = require('../utils/urlValidator');

// Store state tokens in Redis (or memory for development)
const oauthStates = new Map();

const initiateOAuth = async (req, res) => {
    const { provider, returnUrl } = req.body; // e.g., 'google', '/cases'

    // Validate return URL
    const safeReturnUrl = validateRedirect(returnUrl, '/dashboard');

    // Generate secure state token
    const state = crypto.randomBytes(32).toString('hex');
    const stateData = {
        returnUrl: safeReturnUrl,
        provider,
        expires: Date.now() + 600000 // 10 minutes
    };

    // Store state (use Redis in production)
    oauthStates.set(state, stateData);

    // Build OAuth URL
    const oauthUrl = buildOAuthUrl(provider, state);

    res.json({
        success: true,
        redirectUrl: oauthUrl
    });
};

const oauthCallback = async (req, res) => {
    const { code, state } = req.query;

    try {
        // Validate state token
        const stateData = oauthStates.get(state);
        if (!stateData) {
            throw new Error('Invalid or expired OAuth state');
        }

        // Check expiration
        if (Date.now() > stateData.expires) {
            oauthStates.delete(state);
            throw new Error('OAuth state expired');
        }

        // Exchange code for token
        const oauthToken = await exchangeOAuthCode(code, stateData.provider);

        // Get user info
        const oauthUser = await fetchOAuthUser(oauthToken, stateData.provider);

        // Create or update user
        const user = await createOrUpdateOAuthUser(oauthUser);

        // Generate JWT
        const token = jwt.sign({ _id: user._id }, JWT_SECRET);

        // Clean up state
        oauthStates.delete(state);

        // ✅ SECURE: Return validated URL to frontend
        res.cookie('accessToken', token, { httpOnly: true });
        res.redirect(stateData.returnUrl); // Safe because validated earlier
    } catch (error) {
        console.error('[OAuth] Callback error:', error);
        res.redirect('/login?error=oauth_failed');
    }
};

module.exports = { initiateOAuth, oauthCallback };
```

### Example 3: Password Reset Email

```javascript
// controllers/auth.controller.js
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists (security best practice)
            return res.json({
                success: true,
                message: 'If email exists, reset link has been sent'
            });
        }

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Store hashed token
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // ✅ SECURE: Use environment variable for frontend URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Send email
        await sendEmail({
            to: email,
            subject: 'Password Reset - Traf3li',
            html: `
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link expires in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        res.json({
            success: true,
            message: 'If email exists, reset link has been sent'
        });
    } catch (error) {
        console.error('[Password Reset] Error:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to send reset email'
        });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Hash token to compare with stored value
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw CustomException('Invalid or expired reset token', 400);
        }

        // Update password
        user.password = bcrypt.hashSync(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        res.status(400).json({
            error: true,
            message: error.message
        });
    }
};
```

### Example 4: Email Verification Link

```javascript
// controllers/auth.controller.js
const crypto = require('crypto');

const sendVerificationEmail = async (user) => {
    // Generate verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
        .createHash('sha256')
        .update(verifyToken)
        .digest('hex');

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = Date.now() + 86400000; // 24 hours
    await user.save();

    // ✅ SECURE: Hardcoded frontend URL
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

    await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - Traf3li',
        html: `
            <h2>Welcome to Traf3li!</h2>
            <p>Please verify your email address:</p>
            <a href="${verifyUrl}">Verify Email</a>
            <p>This link expires in 24 hours.</p>
        `
    });
};

const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw CustomException('Invalid or expired verification token', 400);
        }

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        res.status(400).json({
            error: true,
            message: error.message
        });
    }
};
```

---

## 🧪 Unit Tests

Create: `/src/utils/__tests__/urlValidator.test.js`

```javascript
const { validateRedirect, isValidNotificationLink, sanitizeUrl } = require('../urlValidator');

describe('URL Validator - Open Redirect Prevention', () => {
    describe('validateRedirect()', () => {
        test('allows internal paths', () => {
            expect(validateRedirect('/dashboard', '/home')).toBe('/dashboard');
            expect(validateRedirect('/orders/123', '/home')).toBe('/orders/123');
        });

        test('blocks path traversal', () => {
            expect(validateRedirect('/../../etc/passwd', '/home')).toBe('/etc/passwd');
        });

        test('blocks protocol-relative URLs', () => {
            expect(validateRedirect('//evil.com', '/home')).toBe('/home');
        });

        test('allows whitelisted domains', () => {
            const url = 'https://traf3li.com/orders';
            expect(validateRedirect(url, '/home')).toBe(url);
        });

        test('blocks non-whitelisted domains', () => {
            expect(validateRedirect('https://evil.com', '/home')).toBe('/home');
        });

        test('blocks javascript: protocol', () => {
            expect(validateRedirect('javascript:alert(1)', '/home')).toBe('/home');
        });

        test('blocks data: protocol', () => {
            expect(validateRedirect('data:text/html,<script>alert(1)</script>', '/home')).toBe('/home');
        });

        test('returns default for null/undefined', () => {
            expect(validateRedirect(null, '/home')).toBe('/home');
            expect(validateRedirect(undefined, '/home')).toBe('/home');
        });

        test('blocks HTTP in production', () => {
            process.env.NODE_ENV = 'production';
            expect(validateRedirect('http://traf3li.com', '/home')).toBe('/home');
            delete process.env.NODE_ENV;
        });
    });

    describe('isValidNotificationLink()', () => {
        test('allows internal paths', () => {
            expect(isValidNotificationLink('/orders')).toBe(true);
            expect(isValidNotificationLink('/messages/123')).toBe(true);
        });

        test('allows whitelisted HTTPS URLs', () => {
            expect(isValidNotificationLink('https://traf3li.com/orders')).toBe(true);
        });

        test('blocks HTTP URLs', () => {
            expect(isValidNotificationLink('http://traf3li.com')).toBe(false);
        });

        test('blocks non-whitelisted domains', () => {
            expect(isValidNotificationLink('https://evil.com')).toBe(false);
        });

        test('blocks dangerous protocols', () => {
            expect(isValidNotificationLink('javascript:alert(1)')).toBe(false);
            expect(isValidNotificationLink('data:text/html,<h1>XSS</h1>')).toBe(false);
        });
    });

    describe('sanitizeUrl()', () => {
        test('allows safe URLs', () => {
            expect(sanitizeUrl('https://traf3li.com')).toBe('https://traf3li.com');
            expect(sanitizeUrl('/orders')).toBe('/orders');
        });

        test('blocks javascript: URLs', () => {
            expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
        });

        test('blocks data: URLs', () => {
            expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
        });

        test('returns null for empty input', () => {
            expect(sanitizeUrl('')).toBeNull();
            expect(sanitizeUrl(null)).toBeNull();
        });
    });
});
```

Run tests:
```bash
npm test -- urlValidator.test.js
```

---

## 🌍 Environment Configuration

Add to `.env`:

```bash
# ==================================
# REDIRECT SECURITY CONFIGURATION
# ==================================

# Allowed domains for redirects (comma-separated)
ALLOWED_REDIRECT_DOMAINS=traf3li.com,dashboard.traf3li.com,www.traf3li.com

# Frontend URLs (used in emails, OAuth callbacks)
FRONTEND_URL=https://traf3li.com
DASHBOARD_URL=https://dashboard.traf3li.com

# OAuth Providers (if needed)
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_secret
GOOGLE_OAUTH_CALLBACK=https://api.traf3li.com/oauth/google/callback

# Email Service (for password reset, verification)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
FROM_EMAIL=noreply@traf3li.com
```

---

## 🔒 Security Checklist

Before deploying redirect functionality:

```markdown
## Pre-Deployment Security Checklist

### Code Review
- [ ] All redirect URLs validated with `validateRedirect()`
- [ ] No direct user input in `res.redirect()`
- [ ] Whitelist domains configured in `.env`
- [ ] OAuth state tokens properly validated
- [ ] Email links use environment variables only

### Testing
- [ ] Unit tests pass for URL validator
- [ ] Integration tests for OAuth flow
- [ ] Penetration testing completed
- [ ] XSS prevention verified

### Configuration
- [ ] `.env` configured with correct domains
- [ ] HTTPS enforced in production
- [ ] CORS whitelist updated
- [ ] Rate limiting enabled on auth endpoints

### Monitoring
- [ ] Logging configured for blocked redirects
- [ ] Alerts set up for suspicious redirect attempts
- [ ] Audit log tracks all redirect usage
```

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T DO THIS:

```javascript
// VULNERABLE: Direct user input
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect(req.query.returnUrl); // DANGEROUS!
});

// VULNERABLE: String-based validation
if (redirectUrl.includes('traf3li.com')) {
    res.redirect(redirectUrl); // Can be bypassed with evil.com?q=traf3li.com
}

// VULNERABLE: Regex validation
if (/traf3li\.com/.test(redirectUrl)) {
    res.redirect(redirectUrl); // Can be bypassed with traf3li.com.evil.com
}
```

### ✅ DO THIS INSTEAD:

```javascript
// SECURE: Validated redirect
const { validateRedirect } = require('../utils/urlValidator');

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    const safeUrl = validateRedirect(req.query.returnUrl, '/');
    res.redirect(safeUrl);
});

// SECURE: URL parsing validation
const url = require('url');
const parsed = url.parse(redirectUrl);
if (parsed.hostname === 'traf3li.com') {
    res.redirect(redirectUrl);
}
```

---

## 📚 Additional Resources

- **OWASP Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html
- **CWE-601:** https://cwe.mitre.org/data/definitions/601.html
- **PortSwigger Academy:** https://portswigger.net/web-security/open-redirection

---

## 🆘 Need Help?

If you're unsure whether a redirect implementation is secure:

1. Review this guide
2. Run the URL validator utility
3. Test with the attack scenarios in the main report
4. Conduct a security code review
5. Consider a penetration test

---

**Remember:** When in doubt, DON'T use server-side redirects. Let the frontend handle navigation with client-side routing.

---

**Guide Version:** 1.0
**Last Updated:** 2025-12-22
**Maintainer:** Security Team

# Frontend Security Implementation Guide

> **Target**: dashboard.traf3li.com
> **Hosting**: Cloudflare Pages / Render
> **Framework**: Vite + React SPA
> **Last Updated**: January 2026

---

## Implementation Status

| Security Feature | Status | Location |
|-----------------|--------|----------|
| HSTS (1 year + preload) | ✅ Implemented | `public/_headers` |
| Content Security Policy | ✅ Implemented | `public/_headers` |
| X-Frame-Options | ✅ Implemented | `public/_headers` |
| X-Content-Type-Options | ✅ Implemented | `public/_headers` |
| Referrer-Policy | ✅ Implemented | `public/_headers` |
| Permissions-Policy | ✅ Implemented | `public/_headers` |
| security.txt (RFC 9116) | ✅ Implemented | `public/.well-known/security.txt` |
| Subresource Integrity (SRI) | ✅ Implemented | `vite.config.ts` |
| Source Maps Disabled | ✅ Implemented | `vite.config.ts` |

---

## Table of Contents

1. [Security Headers](#1-security-headers)
2. [HSTS Configuration](#2-hsts-configuration)
3. [Security.txt](#3-securitytxt)
4. [Subresource Integrity (SRI)](#4-subresource-integrity-sri)
5. [Content Security Policy](#5-content-security-policy)
6. [Verification Commands](#6-verification)
7. [Maintenance Checklist](#7-maintenance-checklist)

---

## 1. Security Headers

All security headers are configured in `public/_headers` for static hosting platforms.

### Current Configuration

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
```

### Header Explanations

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | 1 year + preload | Forces HTTPS, eligible for browser preload list |
| `X-Frame-Options` | DENY | Prevents clickjacking attacks |
| `X-Content-Type-Options` | nosniff | Prevents MIME-type sniffing |
| `X-XSS-Protection` | 1; mode=block | XSS filter for legacy browsers |
| `Referrer-Policy` | strict-origin-when-cross-origin | Privacy-conscious referrer handling |
| `Permissions-Policy` | Restrictive | Disables unnecessary browser features |

---

## 2. HSTS Configuration

### Current State

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

- **max-age**: 31536000 seconds (1 year) - meets minimum for preload submission
- **includeSubDomains**: Applies to all subdomains
- **preload**: Eligible for HSTS Preload List

### HSTS Preload Submission

To submit to the browser preload list:

1. Verify HSTS is working: `curl -sI https://dashboard.traf3li.com | grep -i strict`
2. Go to: https://hstspreload.org
3. Enter domain: `traf3li.com`
4. Follow submission process
5. Timeline: 1-4 months to propagate to browsers

### Requirements for Preload

- [x] HTTPS enabled on root domain
- [x] Redirect HTTP to HTTPS
- [x] max-age >= 31536000 (1 year)
- [x] includeSubDomains directive present
- [x] preload directive present

---

## 3. Security.txt

### Location

```
public/.well-known/security.txt
```

### RFC 9116 Compliance

The security.txt file follows [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) specification:

```
Contact: mailto:security@traf3li.com
Policy: https://traf3li.com/security-policy
Expires: 2027-01-07T00:00:00.000Z
Preferred-Languages: en, ar
Canonical: https://dashboard.traf3li.com/.well-known/security.txt
```

### Required Fields

| Field | Status | Notes |
|-------|--------|-------|
| Contact | ✅ Required | Primary security email |
| Expires | ✅ Required | Must be updated annually |
| Preferred-Languages | ✅ Optional | Supports English and Arabic |
| Canonical | ✅ Optional | Prevents impersonation |
| Policy | ✅ Optional | Link to security policy |

### Annual Maintenance

**IMPORTANT**: The `Expires` field must be updated annually before expiration.

Current expiry: **January 7, 2027**

---

## 4. Subresource Integrity (SRI)

### Current Status: DISABLED BY DEFAULT

SRI is currently **disabled by default** because Cloudflare Auto Minify modifies JavaScript files at the edge, which breaks the integrity hash verification.

### Cloudflare Auto Minify Issue

When Cloudflare Auto Minify is enabled:
1. The build process computes SHA-384 hashes and embeds them in the HTML
2. Cloudflare's edge servers modify/minify the JS files
3. The browser computes a different hash from the modified files
4. The browser blocks the scripts due to hash mismatch

**Error message in browser console:**
```
Failed to find a valid digest in the 'integrity' attribute for resource
'https://dashboard.traf3li.com/assets/vendor-react-xxx.js' with computed
SHA-384 integrity '...'. The resource has been blocked.
```

### Enabling SRI

To enable SRI, follow these steps:

1. **Disable Cloudflare Auto Minify:**
   - Go to Cloudflare Dashboard → Speed → Optimization → Auto Minify
   - Uncheck "JavaScript" (CSS and HTML can remain checked)
   - Save changes

2. **Enable SRI in build:**
   ```bash
   # Set environment variable before building
   VITE_ENABLE_SRI=true npm run build
   ```

3. **Verify SRI is working:**
   ```bash
   # Check that integrity attributes are present in built HTML
   cat dist/index.html | grep -o 'integrity="sha[^"]*"' | head -5
   ```

### Implementation

SRI is implemented using [`vite-plugin-sri3`](https://github.com/yoyo930021/vite-plugin-sri3) in `vite.config.ts`:

```typescript
import { sri } from 'vite-plugin-sri3'

// SRI is disabled by default because Cloudflare Auto Minify breaks it
const enableSRI = process.env.VITE_ENABLE_SRI === 'true'

export default defineConfig({
  plugins: [
    // ... other plugins
    // SRI plugin must be placed at end of plugins array
    ...(enableSRI
      ? [
          sri({
            // Don't ignore missing assets - fail build if assets missing
            ignoreMissingAsset: false,
          }),
        ]
      : []),
  ],
})
```

**Note**: The plugin uses SHA-384 by default (W3C recommended). Only one configuration option is available: `ignoreMissingAsset` (boolean).

### How It Works

1. During build, the plugin calculates SHA-384 hashes for all JS/CSS assets
2. Adds `integrity` and `crossorigin` attributes to `<script>` and `<link>` tags
3. Browsers verify hashes before executing scripts

### Build Output Example

```html
<!-- Without SRI (default) -->
<script src="/assets/main-abc123.js"></script>

<!-- With SRI enabled (VITE_ENABLE_SRI=true) -->
<script
  src="/assets/main-abc123.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux..."
  crossorigin="anonymous"
></script>
```

### Security Benefits

- **CDN Compromise Protection**: If a CDN is hacked, tampered files won't execute
- **Supply Chain Security**: Prevents malicious script injection
- **PCI DSS Compliance**: Meets v4.0.1 requirement for payment page scripts

### Alternative Security Measures (When SRI is Disabled)

When SRI is disabled, these measures still provide protection:
- **Content Security Policy**: Restricts which domains can serve scripts
- **HTTPS/HSTS**: Prevents man-in-the-middle attacks
- **Cloudflare WAF**: Provides edge-level security
- **Regular security audits**: Ensure no compromised dependencies

### Verification After Build

```bash
# Check if SRI is enabled in built HTML
cat dist/index.html | grep -o 'integrity="sha[^"]*"' | head -5
# If no output, SRI is disabled (default)
```

---

## 5. Content Security Policy

### Current Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://cdn.jsdelivr.net
    https://static.cloudflareinsights.com
    https://www.googletagmanager.com
    https://www.google-analytics.com
    https://www.google.com
    https://www.gstatic.com
    https://js.hcaptcha.com
    https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self'
    https://api.traf3li.com
    wss://api.traf3li.com
    https://*.sentry.io
    https://cloudflareinsights.com
    https://*.workers.dev;
  frame-src https://www.google.com https://js.hcaptcha.com https://challenges.cloudflare.com;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  upgrade-insecure-requests;
```

### CSP Directives Explained

| Directive | Purpose |
|-----------|---------|
| `default-src 'self'` | Default policy for all resource types |
| `script-src` | Allowed script sources (CDN, analytics, captcha) |
| `style-src` | Stylesheets (self + Google Fonts) |
| `font-src` | Font files (self + Google Fonts) |
| `img-src` | Images (self + HTTPS + data URIs + blobs) |
| `connect-src` | XHR/Fetch destinations (API + WebSocket + monitoring) |
| `frame-src` | iframes (Google reCAPTCHA + hCaptcha) |
| `frame-ancestors 'none'` | Prevents embedding in iframes (clickjacking) |
| `form-action 'self'` | Form submission destinations |
| `upgrade-insecure-requests` | Upgrades HTTP to HTTPS automatically |

### Why `'unsafe-inline'` is Used

For SPAs built with Vite:
- `'unsafe-inline'` is required for:
  - Inline event handlers generated by React
  - CSS-in-JS libraries
  - Vite's HMR in development

**Mitigation**: Combined with SRI and other CSP rules, the attack surface is minimal.

### Future Improvement: CSP Nonces

For stricter CSP without `'unsafe-inline'`, consider implementing Cloudflare Worker for nonce injection:

```javascript
// Example Cloudflare Worker for CSP nonces
async function handleRequest(request) {
  const nonce = crypto.randomUUID();
  let html = await (await fetch(request)).text();
  html = html.replace(/<script/g, `<script nonce="${nonce}"`);
  // ... set CSP header with nonce
}
```

---

## 6. Verification

### Security Header Check Script

```bash
#!/bin/bash
DOMAIN="https://dashboard.traf3li.com"

echo "🔒 Security Header Check for $DOMAIN"
echo "=========================================="

HEADERS=$(curl -sI "$DOMAIN")

# HSTS
if echo "$HEADERS" | grep -qi "strict-transport-security.*max-age=31536000"; then
  echo "✅ HSTS: 1 year configured"
else
  echo "❌ HSTS: Not properly configured"
fi

# X-Frame-Options
if echo "$HEADERS" | grep -qi "x-frame-options.*deny"; then
  echo "✅ X-Frame-Options: DENY"
else
  echo "❌ X-Frame-Options: Missing or weak"
fi

# CSP
if echo "$HEADERS" | grep -qi "content-security-policy"; then
  echo "✅ CSP: Present"
else
  echo "❌ CSP: Missing"
fi

# security.txt
if curl -s "$DOMAIN/.well-known/security.txt" | grep -qi "contact:"; then
  echo "✅ security.txt: Present"
else
  echo "❌ security.txt: Missing"
fi
```

### Online Tools

| Tool | URL | Purpose |
|------|-----|---------|
| SecurityHeaders.com | https://securityheaders.com | Overall header grade |
| Mozilla Observatory | https://observatory.mozilla.org | Comprehensive scan |
| HSTS Preload Check | https://hstspreload.org | Preload eligibility |
| security.txt Validator | https://securitytxt.org | RFC compliance |
| SRI Hash Generator | https://www.srihash.org | Generate SRI hashes |

---

## 7. Maintenance Checklist

### Annual Tasks

- [ ] Update `security.txt` expiry date (before January 7, 2027)
- [ ] Review and update CSP allowed domains
- [ ] Verify HSTS preload status
- [ ] Run security header scan

### After Dependency Updates

- [ ] Verify SRI hashes regenerate correctly during build
- [ ] Test CSP doesn't block new resources
- [ ] Check console for blocked resources

### After Adding New Third-Party Services

1. Add domain to appropriate CSP directive
2. Update `public/_headers`
3. Test in production
4. Document in this file

---

## Related Documentation

- [Backend Security Headers](./SECURITY_HEADERS.md) - Express/Helmet configuration
- [Authentication System](./AUTH_SYSTEM_REFERENCE.md) - Auth flow and tokens
- [WebSocket Token Expiry](./WEBSOCKET_TOKEN_EXPIRY.md) - Socket authentication

---

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Subresource Integrity (MDN)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [RFC 9116 - security.txt](https://www.rfc-editor.org/rfc/rfc9116)
- [HSTS Preload List](https://hstspreload.org)

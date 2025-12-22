# Security Headers Documentation

This document provides comprehensive documentation for all security headers implemented in the Traf3li Dashboard application. These headers protect against common web vulnerabilities and ensure compliance with Personal Data Protection Law (PDPL).

## Table of Contents

- [Overview](#overview)
- [Implementation Files](#implementation-files)
- [Security Headers Reference](#security-headers-reference)
- [Content Security Policy (CSP)](#content-security-policy-csp)
- [Cache Control Strategy](#cache-control-strategy)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Security headers are HTTP response headers that instruct browsers on how to behave when handling the application's content. They provide defense-in-depth security by:

- Preventing common attacks (XSS, clickjacking, MIME-sniffing)
- Enforcing HTTPS connections
- Controlling browser features and APIs
- Protecting user privacy and data
- Ensuring PDPL compliance

## Implementation Files

Security headers are configured in multiple files for different deployment targets:

| File | Purpose | Deployment Target |
|------|---------|-------------------|
| `/vercel.json` | Production headers | Vercel deployment |
| `/public/_headers` | Production headers | Netlify, Cloudflare Pages |
| `/vite.config.ts` | Development headers | Local development |
| `/src/lib/security-headers.ts` | Constants and utilities | All environments |
| `/tests/security-headers.spec.ts` | Validation tests | CI/CD |

## Security Headers Reference

### 1. Strict-Transport-Security (HSTS)

**Purpose:** Forces browsers to only communicate with the server over HTTPS.

**Value:** `max-age=31536000; includeSubDomains; preload`

**Protection Against:**
- Protocol downgrade attacks
- Cookie hijacking
- Man-in-the-middle attacks

**Configuration:**
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Parameters:**
- `max-age=31536000`: Remember setting for 1 year (in seconds)
- `includeSubDomains`: Apply to all subdomains
- `preload`: Eligible for browser HSTS preload list

**PDPL Relevance:** Protects sensitive data in transit by ensuring all communications are encrypted.

**Notes:**
- Only works over HTTPS
- Disabled in development (HTTP)
- Submit to [HSTS Preload List](https://hstspreload.org/) for maximum protection

---

### 2. X-Frame-Options

**Purpose:** Prevents the page from being embedded in iframes, protecting against clickjacking attacks.

**Value:** `DENY`

**Protection Against:**
- Clickjacking
- UI redressing attacks
- Unauthorized page embedding

**Configuration:**
```http
X-Frame-Options: DENY
```

**Options:**
- `DENY`: Page cannot be displayed in any iframe (recommended)
- `SAMEORIGIN`: Page can only be displayed in iframe from same origin
- `ALLOW-FROM uri`: Page can only be displayed in iframe from specified URI (deprecated)

**PDPL Relevance:** Protects user interactions and prevents unauthorized data collection through embedded frames.

**Notes:**
- Modern browsers also respect CSP `frame-ancestors` directive
- We use both for defense-in-depth

---

### 3. X-Content-Type-Options

**Purpose:** Prevents browsers from MIME-sniffing responses away from the declared content-type.

**Value:** `nosniff`

**Protection Against:**
- Drive-by downloads
- MIME confusion attacks
- Content type manipulation

**Configuration:**
```http
X-Content-Type-Options: nosniff
```

**How It Works:**
- Forces browser to respect declared `Content-Type` header
- Prevents execution of files with incorrect MIME type
- Blocks resources if `Content-Type` doesn't match expected type

**PDPL Relevance:** Ensures content integrity and prevents malicious content execution.

---

### 4. X-XSS-Protection

**Purpose:** Enables the browser's built-in XSS filter (legacy browsers).

**Value:** `1; mode=block`

**Protection Against:**
- Cross-site scripting (XSS) attacks in legacy browsers
- Reflected XSS attacks

**Configuration:**
```http
X-XSS-Protection: 1; mode=block
```

**Parameters:**
- `1`: Enable XSS filtering
- `mode=block`: Block the page if XSS is detected (rather than sanitizing)

**PDPL Relevance:** Prevents data theft and unauthorized access through XSS attacks.

**Notes:**
- Modern browsers rely on CSP instead
- Kept for defense-in-depth and legacy browser support
- Some security experts recommend removing this header due to potential bypass techniques

---

### 5. Referrer-Policy

**Purpose:** Controls how much referrer information is included with requests.

**Value:** `strict-origin-when-cross-origin`

**Protection Against:**
- Privacy leaks
- Session token exposure in referrer
- Sensitive URL parameter leakage

**Configuration:**
```http
Referrer-Policy: strict-origin-when-cross-origin
```

**Behavior:**
- **Same-origin requests:** Send full URL (path and query string)
- **Cross-origin HTTPS→HTTPS:** Send only origin (no path/query)
- **Cross-origin HTTPS→HTTP:** Send nothing (downgrade)

**PDPL Relevance:** Critical for privacy - prevents leaking sensitive information to third parties.

**Other Options:**
- `no-referrer`: Never send referrer (most private)
- `origin`: Always send only origin
- `same-origin`: Only send referrer for same-origin requests

---

### 6. Permissions-Policy

**Purpose:** Controls which browser features and APIs can be used in the document.

**Value:** `camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()`

**Protection Against:**
- Unauthorized feature access
- Privacy violations
- Unwanted data collection
- Third-party tracking (FLoC)

**Configuration:**
```http
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
```

**Disabled Features:**
- `camera=()`: Camera access
- `microphone=()`: Microphone access
- `geolocation=()`: Location access
- `payment=()`: Payment Request API
- `usb=()`: USB device access
- `interest-cohort=()`: Google FLoC tracking

**PDPL Relevance:** Minimizes data collection surface and prevents unauthorized access to sensitive device features.

**Notes:**
- Formerly called `Feature-Policy` (deprecated)
- Can enable features for specific origins: `geolocation=(self)`
- Should be as restrictive as possible for security

---

### 7. Content-Security-Policy (CSP)

**Purpose:** Controls what resources can be loaded and executed on the page.

**Value:** See [Content Security Policy](#content-security-policy-csp) section below.

**Protection Against:**
- Cross-site scripting (XSS)
- Data injection attacks
- Clickjacking
- Unauthorized data exfiltration
- Malicious resource loading

**PDPL Relevance:** Prevents unauthorized data exfiltration and ensures only trusted resources can access user data.

---

## Content Security Policy (CSP)

CSP is the most complex and powerful security header. It defines a whitelist of trusted sources for different resource types.

### Current CSP Configuration

#### Production (Vercel/Netlify)

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://static.cloudflareinsights.com https://vercel.live;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' data: https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://api.traf3li.com wss://api.traf3li.com https://*.sentry.io https://cloudflareinsights.com https://vercel.live wss://vercel.live;
frame-src https://vercel.live;
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
upgrade-insecure-requests;
```

#### Development (Vite)

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' data: https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://api.traf3li.com wss://api.traf3li.com https://*.sentry.io https://*.workers.dev ws://localhost:* http://localhost:*;
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
```

### CSP Directives Explained

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Default policy for all resource types |
| `script-src` | `'self' 'unsafe-inline' ...` | JavaScript sources |
| `style-src` | `'self' 'unsafe-inline' ...` | CSS sources |
| `font-src` | `'self' data: ...` | Font file sources |
| `img-src` | `'self' data: https: blob:` | Image sources |
| `connect-src` | `'self' ...` | AJAX, WebSocket, EventSource |
| `frame-src` | `https://vercel.live` | Allowed iframe sources |
| `frame-ancestors` | `'none'` | Who can embed this page |
| `form-action` | `'self'` | Form submission targets |
| `base-uri` | `'self'` | Allowed `<base>` URLs |
| `upgrade-insecure-requests` | - | Upgrade HTTP to HTTPS |

### Allowed Domains by Category

#### Script Sources
- `https://cdn.jsdelivr.net` - CDN for open source libraries
- `https://static.cloudflareinsights.com` - Cloudflare analytics
- `https://vercel.live` - Vercel preview comments (dev/preview only)

#### Style Sources
- `https://fonts.googleapis.com` - Google Fonts CSS

#### Font Sources
- `https://fonts.gstatic.com` - Google Fonts files

#### API Connections
- `https://api.traf3li.com` - Primary API
- `wss://api.traf3li.com` - WebSocket API
- `https://*.sentry.io` - Error tracking
- `https://cloudflareinsights.com` - Analytics
- `https://vercel.live` - Preview comments (dev/preview only)
- `wss://vercel.live` - Preview WebSocket (dev/preview only)

#### Development Only
- `ws://localhost:*` - Vite HMR
- `http://localhost:*` - Local API
- `https://*.workers.dev` - Cloudflare Workers

### Security Improvements Made

1. **Removed `unsafe-eval` from Production**
   - ❌ Before: `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
   - ✅ After: `script-src 'self' 'unsafe-inline'`
   - Kept in dev for Vite HMR

2. **Added `upgrade-insecure-requests`**
   - Automatically upgrades HTTP requests to HTTPS

3. **Restricted `frame-src`**
   - Only allows specific trusted iframe sources

4. **Set `frame-ancestors` to `'none'`**
   - Prevents page embedding (clickjacking protection)

### Future Improvements (Nonce Support)

To remove `'unsafe-inline'` from `script-src`, implement CSP nonces:

```typescript
// Generate nonce on server
const nonce = crypto.randomBytes(16).toString('base64');

// Include in CSP header
`script-src 'self' 'nonce-${nonce}'`

// Add to inline scripts
<script nonce="${nonce}">...</script>
```

See `/src/lib/security-headers.ts` for nonce generation helpers.

---

## Cache Control Strategy

Proper caching improves performance while ensuring sensitive data isn't cached inappropriately.

### Cache Control Rules

| Resource Type | Cache-Control | Max Age | Rationale |
|---------------|---------------|---------|-----------|
| **Static Assets** (`/assets/*`) | `public, max-age=31536000, immutable` | 1 year | Hashed filenames, never change |
| **Fonts** (`/fonts/*`) | `public, max-age=31536000, immutable` | 1 year | Font files don't change |
| **HTML Files** (`*.html`) | `no-cache, no-store, must-revalidate` | None | Ensure users get updates |
| **Index Page** (`/`) | `no-cache, no-store, must-revalidate` | None | Critical for SPA updates |
| **Manifest** (`/manifest.json`) | `public, max-age=0, must-revalidate` | 0 | Must check for updates |
| **Service Worker** (`/sw.js`) | `public, max-age=0, must-revalidate` | 0 | Must check for updates |
| **API Responses** (`/api/*`) | `private, no-cache, no-store, must-revalidate` | None | Sensitive data |
| **Dashboard Pages** | `private, no-cache, no-store, must-revalidate` | None | User-specific data |

### Cache-Control Directives

- `public`: Can be cached by any cache (CDN, browser)
- `private`: Only browser cache, not CDN (for user-specific data)
- `no-cache`: Must revalidate with server before using cached copy
- `no-store`: Must not be cached at all
- `must-revalidate`: Must check with server when stale
- `max-age=N`: Cache for N seconds
- `immutable`: Content will never change (optimization for hashed assets)

---

## Testing

### Manual Testing

Check security headers in browser DevTools:

```bash
# Start dev server
npm run dev

# Open browser DevTools > Network tab
# Click on a request > Headers tab
# Look for security headers in Response Headers
```

### Automated Testing

Run E2E tests:

```bash
# Run all tests
npm run test:e2e

# Run only security headers tests
npm run test:e2e -- security-headers.spec.ts
```

### Online Security Scanners

Test your deployed site:

- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Security Headers](https://securityheaders.com/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

### Expected Test Results

All tests in `/tests/security-headers.spec.ts` should pass:

- ✅ HSTS header present (production only)
- ✅ X-Frame-Options set to DENY
- ✅ X-Content-Type-Options set to nosniff
- ✅ X-XSS-Protection enabled
- ✅ Referrer-Policy set correctly
- ✅ Permissions-Policy restricts features
- ✅ CSP present and configured
- ✅ No `unsafe-eval` in production CSP
- ✅ All whitelisted domains present
- ✅ No CSP violations in console

---

## Best Practices

### General Guidelines

1. **Always use HTTPS in production**
   - Required for HSTS, secure cookies, and many security features

2. **Minimize use of `unsafe-inline` and `unsafe-eval`**
   - Use nonces or hashes for inline scripts
   - Refactor code to avoid `eval()` and `new Function()`

3. **Regularly audit allowed domains**
   - Remove domains that are no longer needed
   - Verify all third-party scripts are still trusted

4. **Test in multiple environments**
   - Development, staging, and production may have different requirements

5. **Monitor CSP violations**
   - Set up CSP violation reporting
   - Review violations regularly to detect issues

6. **Keep headers in sync**
   - Ensure `/vercel.json` and `/public/_headers` match
   - Update `/vite.config.ts` when production headers change

### PDPL Compliance

1. **Use strict Referrer-Policy**
   - Prevents leaking sensitive URL parameters

2. **Disable unnecessary browser features**
   - Minimize data collection surface

3. **Ensure all connections are encrypted**
   - HSTS + `upgrade-insecure-requests` in CSP

4. **Prevent unauthorized data exfiltration**
   - Strict CSP `connect-src` whitelist

5. **Protect user interactions**
   - X-Frame-Options + CSP `frame-ancestors`

### Security Checklist

Before deploying to production:

- [ ] All security headers present in `/vercel.json` and `/public/_headers`
- [ ] HSTS configured with `max-age >= 31536000`
- [ ] CSP does not contain `unsafe-eval` (except in dev)
- [ ] CSP `connect-src` only includes necessary domains
- [ ] All third-party domains are documented and justified
- [ ] Permissions-Policy disables unnecessary features
- [ ] Cache-Control appropriate for each resource type
- [ ] Security headers tests pass
- [ ] No CSP violations in console
- [ ] Tested with online security scanners (score A or A+)

---

## Troubleshooting

### Common Issues

#### 1. CSP Violations in Console

**Symptom:** `Refused to load ... because it violates the following Content Security Policy directive`

**Solutions:**
- Check if the resource domain is whitelisted in CSP
- Add the domain to appropriate CSP directive
- For inline scripts, consider using nonces
- Review CSP violation reports to find patterns

#### 2. HSTS Not Working in Development

**Symptom:** HSTS header not present in dev environment

**Expected:** HSTS requires HTTPS, which is typically not used in development
- Use `https://localhost` with self-signed cert for testing
- Or accept that HSTS won't work in dev (HTTP)

#### 3. Fonts or Styles Not Loading

**Symptom:** Fonts from Google Fonts not loading

**Solutions:**
- Ensure `https://fonts.googleapis.com` in `style-src`
- Ensure `https://fonts.gstatic.com` in `font-src`
- Check for CSP violations in console

#### 4. WebSocket Connections Failing

**Symptom:** WebSocket connection refused by CSP

**Solutions:**
- Add WebSocket URL to `connect-src`
- Include `wss://` protocol in whitelist
- For dev, include `ws://localhost:*`

#### 5. Third-Party Scripts Blocked

**Symptom:** Analytics or monitoring scripts not working

**Solutions:**
- Add script domain to `script-src`
- Add API endpoint to `connect-src`
- Review third-party script documentation for required CSP directives

#### 6. Vercel Live Comments Not Working

**Symptom:** Preview deployment comments not loading

**Solutions:**
- Ensure `https://vercel.live` and `wss://vercel.live` in CSP
- Add `frame-src https://vercel.live`
- These should only be in preview/dev, not production

---

## Maintenance

### When to Update Headers

1. **Adding a new third-party service:**
   - Document the service and its purpose
   - Add required domains to CSP
   - Test in development first
   - Update all config files

2. **Removing a third-party service:**
   - Remove domains from CSP
   - Test to ensure nothing breaks
   - Update documentation

3. **Security vulnerability discovered:**
   - Review security advisories
   - Update headers as recommended
   - Test thoroughly
   - Deploy ASAP

4. **New browser features:**
   - Review new security header specifications
   - Evaluate if applicable to your app
   - Test in preview environment
   - Roll out gradually

### Regular Audits

Schedule regular security audits:

- **Weekly:** Review CSP violation reports
- **Monthly:** Run online security scanners
- **Quarterly:** Full security header review and update
- **Annually:** Complete security assessment

---

## References

### Official Documentation

- [MDN: HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP: Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [W3C: Content Security Policy Level 3](https://www.w3.org/TR/CSP3/)

### Tools

- [Mozilla Observatory](https://observatory.mozilla.org/) - Security scanner
- [Security Headers](https://securityheaders.com/) - Header checker
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - CSP validator
- [Report URI](https://report-uri.com/) - CSP violation reporting

### Internal Resources

- `/src/lib/security-headers.ts` - Constants and utilities
- `/tests/security-headers.spec.ts` - E2E validation tests
- `/vercel.json` - Vercel deployment headers
- `/public/_headers` - Netlify/Cloudflare headers
- `/vite.config.ts` - Development headers

---

## Support

For questions or issues with security headers:

1. Check this documentation first
2. Review CSP violations in browser console
3. Test with online security scanners
4. Consult `/src/lib/security-headers.ts` for implementation details
5. Contact the security team

**Remember:** Security is an ongoing process, not a one-time setup. Regular review and updates are essential.

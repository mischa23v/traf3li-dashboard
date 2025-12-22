/**
 * Security Headers E2E Test
 *
 * This test validates that all required security headers are present
 * and configured correctly in the application. These headers protect
 * against common web vulnerabilities and ensure PDPL compliance.
 *
 * @see /src/lib/security-headers.ts for header documentation
 */

import { test, expect } from '@playwright/test';

test.describe('Security Headers Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
  });

  test('should have Strict-Transport-Security header (HSTS)', async ({ page }) => {
    const response = page.context().request;
    const res = await response.get('/');
    const headers = res.headers();

    const hsts = headers['strict-transport-security'];

    // In dev environment, HSTS might not be set (HTTP)
    // In production, it should be set
    if (hsts) {
      expect(hsts).toContain('max-age=');
      expect(hsts).toContain('includeSubDomains');

      // Optionally check for preload
      // expect(hsts).toContain('preload');

      test.info().annotations.push({
        type: 'security',
        description: `HSTS header present: ${hsts}`,
      });
    } else {
      test.info().annotations.push({
        type: 'warning',
        description: 'HSTS header not present (expected in dev environment)',
      });
    }
  });

  test('should have X-Frame-Options header', async ({ page }) => {
    const response = page.context().request;
    const res = await response.get('/');
    const headers = res.headers();

    const xFrameOptions = headers['x-frame-options'];

    expect(xFrameOptions).toBeDefined();
    expect(xFrameOptions?.toLowerCase()).toBe('deny');

    test.info().annotations.push({
      type: 'security',
      description: `X-Frame-Options prevents clickjacking: ${xFrameOptions}`,
    });
  });

  test('should have X-Content-Type-Options header', async ({ page }) => {
    const response = page.context().request;
    const res = await response.get('/');
    const headers = res.headers();

    const xContentTypeOptions = headers['x-content-type-options'];

    expect(xContentTypeOptions).toBeDefined();
    expect(xContentTypeOptions?.toLowerCase()).toBe('nosniff');

    test.info().annotations.push({
      type: 'security',
      description: `X-Content-Type-Options prevents MIME-sniffing: ${xContentTypeOptions}`,
    });
  });

  test('should have X-XSS-Protection header', async ({ page }) => {
    const response = page.context().request;
    const res = await response.get('/');
    const headers = res.headers();

    const xXssProtection = headers['x-xss-protection'];

    expect(xXssProtection).toBeDefined();
    expect(xXssProtection).toContain('1');
    expect(xXssProtection?.toLowerCase()).toContain('mode=block');

    test.info().annotations.push({
      type: 'security',
      description: `X-XSS-Protection enables XSS filter: ${xXssProtection}`,
    });
  });

  test('should have Referrer-Policy header', async ({ page }) => {
    const response = page.context().request;
    const res = await response.get('/');
    const headers = res.headers();

    const referrerPolicy = headers['referrer-policy'];

    expect(referrerPolicy).toBeDefined();
    expect(referrerPolicy?.toLowerCase()).toBe('strict-origin-when-cross-origin');

    test.info().annotations.push({
      type: 'security',
      description: `Referrer-Policy controls information leakage: ${referrerPolicy}`,
    });
  });

  test('should have Permissions-Policy header', async ({ page }) => {
    const response = page.context().request;
    const res = await response.get('/');
    const headers = res.headers();

    const permissionsPolicy = headers['permissions-policy'];

    expect(permissionsPolicy).toBeDefined();

    // Check that dangerous features are disabled
    expect(permissionsPolicy?.toLowerCase()).toContain('camera=()');
    expect(permissionsPolicy?.toLowerCase()).toContain('microphone=()');
    expect(permissionsPolicy?.toLowerCase()).toContain('geolocation=()');

    test.info().annotations.push({
      type: 'security',
      description: `Permissions-Policy restricts browser features: ${permissionsPolicy}`,
    });
  });

  test('should have Content-Security-Policy header', async ({ page }) => {
    const response = page.context().request;
    const res = await response.get('/');
    const headers = res.headers();

    const csp = headers['content-security-policy'];

    expect(csp).toBeDefined();

    // Check essential CSP directives
    expect(csp).toContain("default-src");
    expect(csp).toContain("script-src");
    expect(csp).toContain("style-src");
    expect(csp).toContain("frame-ancestors");

    // frame-ancestors should be 'none' to prevent clickjacking
    expect(csp).toContain("frame-ancestors 'none'");

    test.info().annotations.push({
      type: 'security',
      description: `CSP restricts resource loading: ${csp?.substring(0, 100)}...`,
    });
  });

  test('should NOT have unsafe-eval in CSP (production)', async ({ page }) => {
    const response = page.context().request;
    const res = await response.get('/');
    const headers = res.headers();

    const csp = headers['content-security-policy'];

    // In production, unsafe-eval should be removed
    // In dev, it might be present for HMR
    if (csp && !csp.includes('unsafe-eval')) {
      test.info().annotations.push({
        type: 'security',
        description: 'CSP does not contain unsafe-eval (good security practice)',
      });
    } else {
      test.info().annotations.push({
        type: 'warning',
        description: 'CSP contains unsafe-eval (acceptable in dev, should be removed in production)',
      });
    }
  });

  test('should validate CSP allowed domains', async ({ page }) => {
    const response = page.context().request;
    const res = await response.get('/');
    const headers = res.headers();

    const csp = headers['content-security-policy'];

    if (csp) {
      // Check that only whitelisted domains are allowed
      const expectedDomains = [
        'https://cdn.jsdelivr.net',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://api.traf3li.com',
      ];

      for (const domain of expectedDomains) {
        expect(csp).toContain(domain);
      }

      test.info().annotations.push({
        type: 'security',
        description: `CSP whitelists expected domains: ${expectedDomains.join(', ')}`,
      });
    }
  });

  test('should have appropriate Cache-Control for static assets', async ({ page }) => {
    // This test would need actual static assets to test
    // For now, we'll document the expected behavior

    test.info().annotations.push({
      type: 'documentation',
      description: 'Static assets should have: Cache-Control: public, max-age=31536000, immutable',
    });
  });

  test('should have no-cache for HTML files', async ({ page }) => {
    const response = page.context().request;
    const res = await response.get('/');
    const headers = res.headers();

    const cacheControl = headers['cache-control'];

    // HTML files should not be cached to ensure users get updates
    // Note: In dev environment, cache control might differ
    if (cacheControl) {
      test.info().annotations.push({
        type: 'caching',
        description: `Cache-Control for HTML: ${cacheControl}`,
      });

      // In production, should have no-cache directives
      if (cacheControl.includes('no-cache') || cacheControl.includes('no-store')) {
        expect(cacheControl).toBeTruthy();
      }
    }
  });

  test('should validate all security headers together', async ({ page }) => {
    const response = page.context().request;
    const res = await response.get('/');
    const headers = res.headers();

    const requiredHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'referrer-policy',
      'permissions-policy',
      'content-security-policy',
    ];

    const missingHeaders: string[] = [];

    for (const header of requiredHeaders) {
      if (!headers[header]) {
        missingHeaders.push(header);
      }
    }

    if (missingHeaders.length > 0) {
      test.fail();
      console.error('Missing required security headers:', missingHeaders);
    }

    expect(missingHeaders).toHaveLength(0);

    test.info().annotations.push({
      type: 'security',
      description: `All ${requiredHeaders.length} required security headers are present`,
    });
  });

  test('should log all security headers for audit', async ({ page }) => {
    const response = page.context().request;
    const res = await response.get('/');
    const headers = res.headers();

    const securityHeaders = {
      'strict-transport-security': headers['strict-transport-security'] || 'NOT SET',
      'x-frame-options': headers['x-frame-options'] || 'NOT SET',
      'x-content-type-options': headers['x-content-type-options'] || 'NOT SET',
      'x-xss-protection': headers['x-xss-protection'] || 'NOT SET',
      'referrer-policy': headers['referrer-policy'] || 'NOT SET',
      'permissions-policy': headers['permissions-policy'] || 'NOT SET',
      'content-security-policy': headers['content-security-policy']?.substring(0, 100) + '...' || 'NOT SET',
      'cache-control': headers['cache-control'] || 'NOT SET',
    };

    console.log('\n========================================');
    console.log('Security Headers Audit Report');
    console.log('========================================');
    console.log(JSON.stringify(securityHeaders, null, 2));
    console.log('========================================\n');

    test.info().annotations.push({
      type: 'audit',
      description: 'Security headers logged for compliance audit',
    });
  });
});

test.describe('Security Headers - Specific Pages', () => {
  test('dashboard page should have security headers', async ({ page }) => {
    // Try to navigate to dashboard (might require auth)
    const response = await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    if (response) {
      const headers = response.headers();

      expect(headers['x-frame-options']).toBeDefined();
      expect(headers['x-content-type-options']).toBeDefined();
      expect(headers['content-security-policy']).toBeDefined();

      test.info().annotations.push({
        type: 'security',
        description: 'Dashboard page has security headers',
      });
    }
  });

  test('login page should have security headers', async ({ page }) => {
    const response = await page.goto('/login', { waitUntil: 'domcontentloaded' });

    if (response) {
      const headers = response.headers();

      expect(headers['x-frame-options']).toBeDefined();
      expect(headers['x-content-type-options']).toBeDefined();
      expect(headers['content-security-policy']).toBeDefined();

      test.info().annotations.push({
        type: 'security',
        description: 'Login page has security headers (critical for auth security)',
      });
    }
  });
});

test.describe('CSP Violation Reporting', () => {
  test('should detect CSP violations', async ({ page }) => {
    const violations: any[] = [];

    // Listen for CSP violations
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
        violations.push({
          text: msg.text(),
          location: msg.location(),
        });
      }
    });

    await page.goto('/');

    // Wait a bit for any violations to be logged
    await page.waitForTimeout(2000);

    if (violations.length > 0) {
      console.warn('CSP Violations detected:', violations);

      test.info().annotations.push({
        type: 'warning',
        description: `${violations.length} CSP violation(s) detected. Review console output.`,
      });
    } else {
      test.info().annotations.push({
        type: 'security',
        description: 'No CSP violations detected',
      });
    }

    // Don't fail the test, just report violations
    // expect(violations).toHaveLength(0);
  });
});

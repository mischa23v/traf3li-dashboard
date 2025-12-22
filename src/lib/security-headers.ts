/**
 * Security Headers Configuration and Utilities
 *
 * This module provides constants, helpers, and documentation for all security headers
 * used in the application. These headers protect against common web vulnerabilities
 * and ensure PDPL (Personal Data Protection Law) compliance.
 *
 * @module security-headers
 */

/**
 * Allowed domains for Content Security Policy
 * These domains are whitelisted for specific resource types
 */
export const CSP_DOMAINS = {
  // Script sources - External JavaScript libraries
  scripts: [
    'https://cdn.jsdelivr.net', // CDN for open source libraries
    'https://static.cloudflareinsights.com', // Cloudflare analytics
    'https://vercel.live', // Vercel preview comments
  ],

  // Style sources - External stylesheets
  styles: [
    'https://fonts.googleapis.com', // Google Fonts CSS
  ],

  // Font sources - External font files
  fonts: [
    'https://fonts.gstatic.com', // Google Fonts files
  ],

  // API connections - Backend and third-party APIs
  connect: [
    'https://api.traf3li.com', // Primary API
    'wss://api.traf3li.com', // WebSocket API
    'https://*.sentry.io', // Error tracking
    'https://cloudflareinsights.com', // Analytics
    'https://vercel.live', // Preview comments
    'wss://vercel.live', // Preview comments WebSocket
  ],

  // Frame sources - Allowed iframe sources
  frames: [
    'https://vercel.live', // Preview comments
  ],

  // Development-only domains
  dev: {
    connect: [
      'ws://localhost:*', // Vite HMR
      'http://localhost:*', // Local API
      'https://*.workers.dev', // Cloudflare Workers
    ],
  },
} as const;

/**
 * Generates a Content Security Policy string
 *
 * @param options - CSP configuration options
 * @param options.includeDevDomains - Include development domains (default: false)
 * @param options.allowUnsafeInline - Allow unsafe-inline for scripts (default: false)
 * @param options.allowUnsafeEval - Allow unsafe-eval for scripts (default: false)
 * @param options.nonce - CSP nonce for inline scripts (optional)
 * @returns CSP header value
 */
export function generateCSP(options: {
  includeDevDomains?: boolean;
  allowUnsafeInline?: boolean;
  allowUnsafeEval?: boolean;
  nonce?: string;
} = {}): string {
  const {
    includeDevDomains = false,
    allowUnsafeInline = false,
    allowUnsafeEval = false,
    nonce,
  } = options;

  const scriptSrc = [
    "'self'",
    ...CSP_DOMAINS.scripts,
    ...(allowUnsafeInline ? ["'unsafe-inline'"] : []),
    ...(allowUnsafeEval ? ["'unsafe-eval'"] : []),
    ...(nonce ? [`'nonce-${nonce}'`] : []),
  ];

  const connectSrc = [
    "'self'",
    ...CSP_DOMAINS.connect,
    ...(includeDevDomains ? CSP_DOMAINS.dev.connect : []),
  ];

  const directives = {
    'default-src': ["'self'"],
    'script-src': scriptSrc,
    'style-src': ["'self'", "'unsafe-inline'", ...CSP_DOMAINS.styles],
    'font-src': ["'self'", 'data:', ...CSP_DOMAINS.fonts],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': connectSrc,
    'frame-src': CSP_DOMAINS.frames,
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'upgrade-insecure-requests': [],
  };

  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Strict Transport Security (HSTS) Header
 *
 * Forces browsers to only communicate with the server over HTTPS.
 * This prevents protocol downgrade attacks and cookie hijacking.
 *
 * - max-age: Time in seconds the browser should remember to only use HTTPS (1 year)
 * - includeSubDomains: Apply to all subdomains
 * - preload: Eligible for browser HSTS preload list
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
 */
export const HSTS_HEADER = {
  key: 'Strict-Transport-Security',
  value: 'max-age=31536000; includeSubDomains; preload',
} as const;

/**
 * X-Frame-Options Header
 *
 * Prevents the page from being embedded in iframes, protecting against clickjacking attacks.
 *
 * - DENY: Page cannot be displayed in a frame
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
 */
export const X_FRAME_OPTIONS_HEADER = {
  key: 'X-Frame-Options',
  value: 'DENY',
} as const;

/**
 * X-Content-Type-Options Header
 *
 * Prevents browsers from MIME-sniffing responses away from the declared content-type.
 * This reduces exposure to drive-by download attacks.
 *
 * - nosniff: Blocks a request if the request destination is of type style/script
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
 */
export const X_CONTENT_TYPE_OPTIONS_HEADER = {
  key: 'X-Content-Type-Options',
  value: 'nosniff',
} as const;

/**
 * X-XSS-Protection Header
 *
 * Enables the browser's built-in XSS filter (legacy browsers).
 * Modern browsers rely on CSP instead, but this provides defense in depth.
 *
 * - 1: Enable XSS filtering
 * - mode=block: Block the page if XSS is detected
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
 */
export const X_XSS_PROTECTION_HEADER = {
  key: 'X-XSS-Protection',
  value: '1; mode=block',
} as const;

/**
 * Referrer-Policy Header
 *
 * Controls how much referrer information is included with requests.
 * Important for privacy and PDPL compliance.
 *
 * - strict-origin-when-cross-origin: Send full URL for same-origin, only origin for cross-origin
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
 */
export const REFERRER_POLICY_HEADER = {
  key: 'Referrer-Policy',
  value: 'strict-origin-when-cross-origin',
} as const;

/**
 * Permissions-Policy Header (formerly Feature-Policy)
 *
 * Controls which browser features and APIs can be used in the document.
 * Reduces attack surface and improves privacy.
 *
 * Disabled features:
 * - camera: Camera access
 * - microphone: Microphone access
 * - geolocation: Location access
 * - payment: Payment API
 * - usb: USB device access
 * - interest-cohort: FLoC (privacy protection)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy
 */
export const PERMISSIONS_POLICY_HEADER = {
  key: 'Permissions-Policy',
  value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
} as const;

/**
 * Cache-Control Headers for Different Resource Types
 *
 * Proper caching improves performance while ensuring sensitive data isn't cached.
 */
export const CACHE_CONTROL = {
  /**
   * Static Assets (JS, CSS, images with hashed filenames)
   * - public: Can be cached by any cache
   * - max-age=31536000: Cache for 1 year
   * - immutable: Content will never change
   */
  staticAssets: {
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable',
  },

  /**
   * HTML Files (SPA entry points)
   * - no-cache: Must revalidate with server
   * - no-store: Must not be cached
   * - must-revalidate: Must check with server when stale
   */
  html: {
    key: 'Cache-Control',
    value: 'no-cache, no-store, must-revalidate',
  },

  /**
   * API Responses (sensitive data)
   * - private: Only browser cache, not CDN
   * - no-cache: Must revalidate
   * - no-store: Must not be cached
   * - must-revalidate: Must check when stale
   */
  api: {
    key: 'Cache-Control',
    value: 'private, no-cache, no-store, must-revalidate',
  },

  /**
   * Manifest and Service Worker
   * - public: Can be cached
   * - max-age=0: Must revalidate immediately
   * - must-revalidate: Must check with server
   */
  manifest: {
    key: 'Cache-Control',
    value: 'public, max-age=0, must-revalidate',
  },
} as const;

/**
 * All security headers for a standard page
 *
 * @param options - CSP generation options
 * @returns Array of security headers
 */
export function getSecurityHeaders(options?: Parameters<typeof generateCSP>[0]) {
  return [
    HSTS_HEADER,
    X_FRAME_OPTIONS_HEADER,
    X_CONTENT_TYPE_OPTIONS_HEADER,
    X_XSS_PROTECTION_HEADER,
    REFERRER_POLICY_HEADER,
    PERMISSIONS_POLICY_HEADER,
    {
      key: 'Content-Security-Policy',
      value: generateCSP(options),
    },
  ];
}

/**
 * Validates if required security headers are present in a response
 *
 * @param headers - Headers object (e.g., from fetch response)
 * @returns Validation result with missing headers
 */
export function validateSecurityHeaders(headers: Headers | Record<string, string>): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const requiredHeaders = [
    'Strict-Transport-Security',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy',
    'Content-Security-Policy',
  ];

  const recommendedHeaders = [
    'X-XSS-Protection',
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  // Convert Headers object to plain object if needed
  const headersObj = headers instanceof Headers
    ? Object.fromEntries(headers.entries())
    : headers;

  // Check for required headers (case-insensitive)
  const lowerCaseHeaders = Object.keys(headersObj).reduce((acc, key) => {
    acc[key.toLowerCase()] = headersObj[key];
    return acc;
  }, {} as Record<string, string>);

  for (const header of requiredHeaders) {
    if (!lowerCaseHeaders[header.toLowerCase()]) {
      missing.push(header);
    }
  }

  for (const header of recommendedHeaders) {
    if (!lowerCaseHeaders[header.toLowerCase()]) {
      warnings.push(`Recommended header missing: ${header}`);
    }
  }

  // Validate CSP doesn't use unsafe directives
  const csp = lowerCaseHeaders['content-security-policy'];
  if (csp) {
    if (csp.includes("'unsafe-eval'")) {
      warnings.push("CSP contains 'unsafe-eval' which should be avoided");
    }
    if (csp.includes("'unsafe-inline'") && !csp.includes('nonce-')) {
      warnings.push("CSP contains 'unsafe-inline' without nonce, consider using nonces");
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Security headers documentation for the development team
 */
export const SECURITY_HEADERS_DOCS = {
  overview: 'Security headers protect against common web vulnerabilities and ensure PDPL compliance',

  headers: {
    'Strict-Transport-Security': {
      purpose: 'Force HTTPS connections',
      pdplRelevance: 'Protects data in transit',
      attacks: ['Protocol downgrade', 'Cookie hijacking', 'Man-in-the-middle'],
    },

    'X-Frame-Options': {
      purpose: 'Prevent clickjacking',
      pdplRelevance: 'Protects user interactions',
      attacks: ['Clickjacking', 'UI redressing'],
    },

    'X-Content-Type-Options': {
      purpose: 'Prevent MIME-sniffing',
      pdplRelevance: 'Ensures content integrity',
      attacks: ['Drive-by downloads', 'MIME confusion'],
    },

    'X-XSS-Protection': {
      purpose: 'Enable browser XSS filter',
      pdplRelevance: 'Prevents data theft',
      attacks: ['Cross-site scripting (legacy browsers)'],
    },

    'Referrer-Policy': {
      purpose: 'Control referrer information',
      pdplRelevance: 'Limits data leakage to third parties',
      attacks: ['Privacy leaks', 'Session token exposure'],
    },

    'Permissions-Policy': {
      purpose: 'Restrict browser features',
      pdplRelevance: 'Minimizes data collection surface',
      attacks: ['Unauthorized feature access', 'Privacy violations'],
    },

    'Content-Security-Policy': {
      purpose: 'Control resource loading',
      pdplRelevance: 'Prevents unauthorized data exfiltration',
      attacks: ['XSS', 'Data injection', 'Clickjacking'],
    },
  },

  bestPractices: [
    'Always use HTTPS in production',
    'Minimize use of unsafe-inline and unsafe-eval in CSP',
    'Use nonces or hashes for inline scripts',
    'Regularly audit and update allowed domains',
    'Test headers in development environment',
    'Monitor CSP violations in production',
  ],
} as const;

/**
 * Type definitions for security headers
 */
export interface SecurityHeader {
  key: string;
  value: string;
}

export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'font-src'?: string[];
  'img-src'?: string[];
  'connect-src'?: string[];
  'frame-src'?: string[];
  'frame-ancestors'?: string[];
  'form-action'?: string[];
  'base-uri'?: string[];
  'upgrade-insecure-requests'?: boolean;
}

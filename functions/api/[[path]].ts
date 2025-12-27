/**
 * Cloudflare Pages Function - API Proxy
 * Proxies all /api/* requests to the backend (except /api/ai/* which is handled separately)
 *
 * This function handles:
 * - /api/auth/* - Authentication routes
 * - /api/v1/* - Versioned API routes
 * - /api/currency/* - Currency routes
 * - Any other /api/* routes (except /api/ai/*)
 */

interface Env {
  // Environment bindings - set in Cloudflare Pages dashboard
  BACKEND_URL?: string;
}

// Backend URL - configurable via environment variable, defaults to production
const getBackendUrl = (env: Env): string => {
  return env.BACKEND_URL || 'https://api.traf3li.com';
};

// Headers to forward from client to backend
const FORWARDED_REQUEST_HEADERS = [
  'content-type',
  'accept',
  'accept-language',
  'authorization',
  'cookie',
  'x-csrf-token',
  'x-requested-with',
  'api-version',
  'user-agent',
  'referer',
  'origin',
];

// Headers to forward from backend to client
const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'set-cookie',
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
  'x-request-id',
  'retry-after',
  'cache-control',
  'etag',
  'last-modified',
  'x-csrf-token',
  'x-xsrf-token',
];

/**
 * Modify Set-Cookie headers to ensure proper SameSite and Secure attributes
 * for cross-origin cookie handling (fixes CSRF token cookie issues)
 */
const fixCookieSameSite = (cookie: string): string => {
  // Parse cookie to check if it's a csrf-token or XSRF-TOKEN cookie
  const lowerCookie = cookie.toLowerCase();
  const isCsrfCookie = lowerCookie.includes('csrf-token=') || lowerCookie.includes('xsrf-token=');

  if (!isCsrfCookie) {
    return cookie;
  }

  // Check if SameSite is already set
  const hasSameSite = lowerCookie.includes('samesite=');
  const hasSecure = lowerCookie.includes('; secure') || lowerCookie.endsWith('secure');

  let fixedCookie = cookie;

  // If SameSite is already set but not to None, replace it
  if (hasSameSite) {
    // Replace existing SameSite with None (case-insensitive)
    fixedCookie = fixedCookie.replace(/samesite=(strict|lax|none)/i, 'SameSite=None');
  } else {
    // Add SameSite=None
    fixedCookie += '; SameSite=None';
  }

  // Add Secure flag if not present (required for SameSite=None)
  if (!hasSecure) {
    fixedCookie += '; Secure';
  }

  return fixedCookie;
};

/**
 * Handle all HTTP methods for API proxy
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, params, env } = context;
  const url = new URL(request.url);

  // Get the path after /api/
  // params.path can be a string or array depending on the URL
  const pathSegments = params.path;
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments || '';

  // Skip /api/ai/* - those are handled by dedicated functions
  if (path.startsWith('ai/') || path === 'ai') {
    // Let it fall through to the dedicated AI functions
    return new Response('Not Found', { status: 404 });
  }

  // Construct the backend URL using environment variable or default
  const backendUrl = `${getBackendUrl(env)}/api/${path}${url.search}`;

  // Build headers to forward
  const headers = new Headers();

  // Forward relevant headers from the original request
  for (const headerName of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(headerName);
    if (value) {
      headers.set(headerName, value);
    }
  }

  // Add X-Forwarded headers for the backend
  headers.set('X-Forwarded-For', request.headers.get('cf-connecting-ip') || '');
  headers.set('X-Forwarded-Host', url.host);
  headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

  // Set origin header to match the frontend domain for CORS
  const origin = request.headers.get('origin');
  if (origin) {
    headers.set('Origin', origin);
  }

  try {
    // Prepare the fetch options
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: 'follow',
    };

    // Include body for methods that support it
    if (!['GET', 'HEAD'].includes(request.method)) {
      // Clone the request body
      const body = await request.arrayBuffer();
      if (body.byteLength > 0) {
        fetchOptions.body = body;
      }
    }

    // Make the request to the backend
    const backendResponse = await fetch(backendUrl, fetchOptions);

    // Build response headers
    const responseHeaders = new Headers();

    // Forward relevant headers from backend response
    for (const headerName of FORWARDED_RESPONSE_HEADERS) {
      const value = backendResponse.headers.get(headerName);
      if (value) {
        // Handle multiple Set-Cookie headers
        if (headerName === 'set-cookie') {
          // Get all Set-Cookie headers
          const cookies = backendResponse.headers.getSetCookie?.() || [];
          if (cookies.length > 0) {
            // Cloudflare Workers support multiple Set-Cookie headers
            // Fix SameSite for CSRF cookies to enable cross-origin cookie handling
            cookies.forEach(cookie => {
              const fixedCookie = fixCookieSameSite(cookie);
              responseHeaders.append('Set-Cookie', fixedCookie);
            });
          } else if (value) {
            // Fix SameSite for CSRF cookies
            const fixedCookie = fixCookieSameSite(value);
            responseHeaders.set('Set-Cookie', fixedCookie);
          }
        } else {
          responseHeaders.set(headerName, value);
        }
      }
    }

    // Add CORS headers for cross-origin requests
    if (origin) {
      responseHeaders.set('Access-Control-Allow-Origin', origin);
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');
    }

    // Return the proxied response
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('API Proxy Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to connect to backend',
        error_ar: 'فشل الاتصال بالخادم',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    );
  }
};

/**
 * Handle CORS preflight requests
 */
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const origin = request.headers.get('origin');

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, Accept, Accept-Language, API-Version, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
};

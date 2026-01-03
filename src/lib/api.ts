/**
 * API Client Configuration
 * Axios instance configured to communicate with Traf3li backend
 * Handles authentication, credentials, and error responses
 *
 * Gold Standard Features:
 * - Request deduplication (prevents thundering herd)
 * - Circuit breaker pattern (prevents cascading failures)
 * - Smart retry with exponential backoff + jitter
 * - Retry-After header support
 * - Tiered timeouts (auth: 5s, normal: 10s, upload: 120s)
 * - Request cancellation on navigation
 * - Idempotency keys for financial operations
 * - Dual token authentication (access + refresh tokens)
 * - Automatic token refresh on 401
 *
 * ============================================================================
 * 🚨 BACKEND_TODO: CRITICAL AUTH ISSUES DOCUMENTED
 * ============================================================================
 * Several backend issues are documented in this file with BACKEND_TODO comments.
 * See src/config/BACKEND_AUTH_ISSUES.ts for full documentation.
 *
 * CRITICAL ISSUES:
 * 1. CSRF Cookie - Must set httpOnly:false, sameSite:'none', secure:true
 * 2. Token Refresh - POST /api/auth/refresh must accept body & return both tokens
 * 3. SSO Callback - POST /api/auth/sso/callback must return tokens
 *
 * HIGH PRIORITY:
 * 4. CORS - Must allow credentials:true for dashboard.traf3li.com
 * 5. MFA Flags - Login must return mfaEnabled, mfaPending in user object
 *
 * Search for "BACKEND_TODO" in this file to find all documented issues.
 * ============================================================================
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG, getApiUrl, getTimeoutForUrl } from '@/config/api'
import { captureApiCall, completeApiCall } from './api-debug'
import { captureApiError } from './aggressive-debug'
import {
  generateRequestKey,
  getPendingRequest,
  registerPendingRequest,
  clearPendingRequests,
} from './request-deduplication'
import {
  shouldAllowRequest,
  recordSuccess,
  recordFailure,
  resetAllCircuits,
} from './circuit-breaker'
import {
  shouldAddIdempotencyKey,
  getIdempotencyKey,
  clearIdempotencyKey,
  clearAllIdempotencyKeys,
} from './idempotency'
import {
  getAbortController,
  removeAbortController,
  cancelAllRequests,
  cancelNavigationRequests,
  isAbortError,
} from './request-cancellation'
import { generateDeviceFingerprint, getStoredFingerprint, storeDeviceFingerprint } from './device-fingerprint'

// Cached device fingerprint for request headers
let cachedDeviceFingerprint: string | null = null

/**
 * Initialize device fingerprint (call on app start)
 */
export async function initDeviceFingerprint(): Promise<string> {
  if (!cachedDeviceFingerprint) {
    // Try to get stored fingerprint first
    cachedDeviceFingerprint = getStoredFingerprint()

    // If not stored, generate and store new one
    if (!cachedDeviceFingerprint) {
      cachedDeviceFingerprint = await storeDeviceFingerprint()
    }
  }
  return cachedDeviceFingerprint
}

// ==================== TOKEN MANAGEMENT ====================

/**
 * Token storage keys
 */
const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
  EXPIRES_AT: 'tokenExpiresAt',  // Timestamp when access token expires
} as const

/**
 * Token refresh scheduler
 * Automatically refreshes the access token before it expires
 */
let tokenRefreshTimeoutId: ReturnType<typeof setTimeout> | null = null
const TOKEN_REFRESH_BUFFER_SECONDS = 60 // Refresh 1 minute before expiry

// ==================== TOKEN DEBUG LOGGING ====================
// Always enabled to help diagnose auth issues on production
const tokenLog = (message: string, data?: any) => {
  console.log(`[TOKEN] ${message}`, data !== undefined ? data : '')
}
const tokenWarn = (message: string, data?: any) => {
  console.warn(`[TOKEN] ⚠️ ${message}`, data !== undefined ? data : '')
}

/**
 * Decode JWT to see its contents (without verifying signature)
 * This is safe for debugging - verification happens on backend
 */
const decodeJWTForDebug = (token: string): { payload: any; valid: boolean; isExpired: boolean } => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { payload: null, valid: false, isExpired: true }
    }
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    const isExpired = payload.exp && payload.exp < now
    return { payload, valid: true, isExpired }
  } catch {
    return { payload: null, valid: false, isExpired: true }
  }
}

/**
 * Log request token state for debugging
 */
const logRequestTokenState = (method: string, url: string, accessToken: string | null) => {
  // Only log for auth-related or important requests
  if (!url.includes('/auth/') && !url.includes('/me')) {
    return
  }

  if (!accessToken) {
    tokenWarn(`Request WITHOUT token: ${method.toUpperCase()} ${url}`)
    return
  }

  const decoded = decodeJWTForDebug(accessToken)
  if (!decoded.valid) {
    tokenWarn(`Request with INVALID token: ${method.toUpperCase()} ${url}`, {
      tokenPreview: accessToken.substring(0, 30) + '...',
    })
    return
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = decoded.payload.exp
  const expiresIn = exp ? Math.round((exp - now) / 60) : 0

  tokenLog(`Request with token: ${method.toUpperCase()} ${url}`, {
    tokenPreview: accessToken.substring(0, 20) + '...' + accessToken.substring(accessToken.length - 10),
    userId: decoded.payload.userId || decoded.payload.sub,
    isExpired: decoded.isExpired,
    expiresIn: `${expiresIn} minutes`,
  })
}

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEYS.ACCESS)
}

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEYS.REFRESH)
}

/**
 * Get refresh token from cookies (fallback when localStorage is empty)
 * Backend sets refreshToken cookie with httpOnly:false so JS can read it
 */
export const getRefreshTokenFromCookie = (): string | null => {
  const cookies = document.cookie
  const match = cookies.match(/refreshToken=([^;]+)/)
  if (match && match[1]) {
    return match[1]
  }
  return null
}

/**
 * Get refresh token from any available source (localStorage first, then cookies)
 */
export const getAnyRefreshToken = (): string | null => {
  // Try localStorage first (faster, no parsing)
  const localStorageToken = getRefreshToken()
  if (localStorageToken) {
    return localStorageToken
  }

  // Fallback to cookie
  const cookieToken = getRefreshTokenFromCookie()
  if (cookieToken) {
    tokenLog('Using refresh token from cookie (localStorage empty)')
    return cookieToken
  }

  return null
}

/**
 * Check if access token is missing or expired and needs refresh
 */
export const needsTokenRefresh = (): boolean => {
  const accessToken = getAccessToken()

  // No access token at all - definitely need refresh
  if (!accessToken) {
    return true
  }

  // Check if token is expired by decoding it
  const decoded = decodeJWTForDebug(accessToken)
  if (!decoded.valid || decoded.isExpired) {
    return true
  }

  // Check stored expiration time (more reliable if backend provided expires_in)
  if (isTokenExpiringSoon(30)) { // 30 second buffer
    return true
  }

  return false
}

/**
 * Schedule automatic token refresh before expiry
 * Called internally by storeTokens when expires_in is provided
 */
const scheduleTokenRefresh = (expiresIn: number): void => {
  // Clear any existing scheduled refresh
  if (tokenRefreshTimeoutId) {
    clearTimeout(tokenRefreshTimeoutId)
    tokenRefreshTimeoutId = null
  }

  // Calculate refresh time (expires_in - buffer, minimum 10 seconds)
  const refreshInSeconds = Math.max(expiresIn - TOKEN_REFRESH_BUFFER_SECONDS, 10)
  const refreshInMs = refreshInSeconds * 1000

  tokenLog('Scheduling automatic token refresh', {
    expiresIn: `${expiresIn}s (${Math.round(expiresIn / 60)}min)`,
    refreshIn: `${refreshInSeconds}s (${Math.round(refreshInSeconds / 60)}min)`,
    refreshAt: new Date(Date.now() + refreshInMs).toISOString(),
  })

  tokenRefreshTimeoutId = setTimeout(async () => {
    tokenLog('Executing scheduled token refresh...')
    try {
      const success = await refreshAccessToken()
      if (success) {
        tokenLog('Scheduled token refresh succeeded')
      } else {
        tokenWarn('Scheduled token refresh failed - user may need to re-authenticate')
      }
    } catch (error) {
      tokenWarn('Scheduled token refresh error:', error)
    }
  }, refreshInMs)
}

/**
 * Cancel any scheduled token refresh
 * Called on logout or when tokens are cleared
 */
export const cancelScheduledTokenRefresh = (): void => {
  if (tokenRefreshTimeoutId) {
    clearTimeout(tokenRefreshTimeoutId)
    tokenRefreshTimeoutId = null
    tokenLog('Cancelled scheduled token refresh')
  }
}

/**
 * Get token expiration time from localStorage
 */
export const getTokenExpiresAt = (): number | null => {
  const expiresAt = localStorage.getItem(TOKEN_KEYS.EXPIRES_AT)
  return expiresAt ? parseInt(expiresAt, 10) : null
}

/**
 * Check if token is expired or about to expire
 */
export const isTokenExpiringSoon = (bufferSeconds: number = TOKEN_REFRESH_BUFFER_SECONDS): boolean => {
  const expiresAt = getTokenExpiresAt()
  if (!expiresAt) return false
  return Date.now() >= (expiresAt - bufferSeconds * 1000)
}

/**
 * Store tokens in localStorage
 * @param accessToken - The access token to store
 * @param refreshToken - The refresh token to store
 * @param expiresIn - Optional: seconds until access token expires (enables automatic refresh scheduling)
 */
export const storeTokens = (accessToken: string, refreshToken: string, expiresIn?: number): void => {
  tokenLog('Storing tokens in localStorage...', {
    accessTokenLength: accessToken?.length,
    refreshTokenLength: refreshToken?.length,
    hasExpiresIn: !!expiresIn,
    expiresIn: expiresIn ? `${expiresIn}s (${Math.round(expiresIn / 60)}min)` : 'N/A',
  })

  localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken)
  localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken)

  // Store expiration time if expires_in was provided
  if (expiresIn && expiresIn > 0) {
    const expiresAt = Date.now() + (expiresIn * 1000)
    localStorage.setItem(TOKEN_KEYS.EXPIRES_AT, expiresAt.toString())

    // Schedule automatic token refresh
    scheduleTokenRefresh(expiresIn)
  }

  // Verify storage
  const storedAccess = localStorage.getItem(TOKEN_KEYS.ACCESS)
  const storedRefresh = localStorage.getItem(TOKEN_KEYS.REFRESH)

  if (storedAccess !== accessToken || storedRefresh !== refreshToken) {
    tokenWarn('Token storage verification FAILED!', {
      accessMatch: storedAccess === accessToken,
      refreshMatch: storedRefresh === refreshToken,
    })
  } else {
    tokenLog('Tokens stored successfully')
  }
}

/**
 * Clear tokens from localStorage
 */
export const clearTokens = (): void => {
  tokenLog('Clearing tokens from localStorage')
  localStorage.removeItem(TOKEN_KEYS.ACCESS)
  localStorage.removeItem(TOKEN_KEYS.REFRESH)
  localStorage.removeItem(TOKEN_KEYS.EXPIRES_AT)

  // Cancel any scheduled token refresh
  cancelScheduledTokenRefresh()
}

/**
 * Check if we have valid tokens stored
 */
export const hasTokens = (): boolean => {
  return !!getAccessToken() && !!getRefreshToken()
}

// ==================== TOKEN REFRESH MECHANISM ====================

/**
 * Token refresh state management
 * Prevents multiple concurrent refresh attempts
 */
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (error: any) => void
  config: InternalAxiosRequestConfig
}> = []

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: any = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      // Retry the request with new token
      const newToken = getAccessToken()
      if (newToken && prom.config.headers) {
        prom.config.headers.set('Authorization', `Bearer ${newToken}`)
      }
      prom.resolve(apiClient(prom.config))
    }
  })
  failedQueue = []
}

/**
 * Refresh the access token using the refresh token
 * Returns true if refresh was successful, false otherwise
 *
 * ============================================================================
 * 🚨 BACKEND_TODO: TOKEN REFRESH ENDPOINT
 * ============================================================================
 * The POST /api/auth/refresh endpoint MUST:
 *
 * 1. Accept refreshToken in REQUEST BODY (not header):
 *    Request: { "refreshToken": "jwt_token" }
 *
 * 2. Return BOTH new tokens in response:
 *    Response: { "accessToken": "new_jwt", "refreshToken": "new_jwt" }
 *
 * BACKEND IMPLEMENTATION:
 * ```javascript
 * app.post('/api/auth/refresh', async (req, res) => {
 *   const { refreshToken } = req.body;  // ← Get from BODY
 *
 *   // Validate refresh token
 *   const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
 *
 *   // Generate NEW tokens (token rotation for security)
 *   const newAccessToken = jwt.sign({ userId, email, role }, ACCESS_SECRET, { expiresIn: '15m' });
 *   const newRefreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
 *
 *   // Invalidate old refresh token (optional but recommended)
 *   // await RefreshToken.deleteOne({ token: refreshToken });
 *
 *   res.json({
 *     accessToken: newAccessToken,   // ← REQUIRED
 *     refreshToken: newRefreshToken  // ← REQUIRED
 *   });
 * });
 * ```
 *
 * See: src/config/BACKEND_AUTH_ISSUES.ts for full documentation
 * ============================================================================
 */
const refreshAccessToken = async (): Promise<boolean> => {
  // Try localStorage first, then fall back to cookie
  const refreshToken = getAnyRefreshToken()
  if (!refreshToken) {
    tokenWarn('No refresh token available (checked localStorage and cookies)')
    return false
  }

  tokenLog('Attempting token refresh...', {
    tokenSource: getRefreshToken() ? 'localStorage' : 'cookie',
    tokenPreview: refreshToken.substring(0, 20) + '...',
  })

  try {
    // Use a separate axios instance to avoid interceptor loops
    // Supports both OAuth 2.0 (snake_case) and legacy (camelCase) response format
    const response = await axios.post(
      `${API_BASE_URL_NO_VERSION}/auth/refresh`,
      { refreshToken },  // ← Sending token in body as expected by backend
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...(cachedDeviceFingerprint && { 'X-Device-Fingerprint': cachedDeviceFingerprint }),
        },
      }
    )

    // Support both OAuth 2.0 (snake_case) and legacy (camelCase) token fields
    const accessToken = response.data.access_token || response.data.accessToken
    const newRefreshToken = response.data.refresh_token || response.data.refreshToken
    const expiresIn = response.data.expires_in  // seconds until access token expires

    if (accessToken && newRefreshToken) {
      tokenLog('Token refresh successful', {
        hasExpiresIn: !!expiresIn,
        expiresIn: expiresIn ? `${expiresIn}s (${Math.round(expiresIn / 60)}min)` : 'N/A',
        tokenFormat: response.data.access_token ? 'OAuth 2.0 (snake_case)' : 'Legacy (camelCase)',
      })
      storeTokens(accessToken, newRefreshToken, expiresIn)
      return true
    }

    // If only accessToken is returned, token rotation may be broken
    tokenWarn('Token refresh response missing tokens:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!newRefreshToken,
      responseKeys: Object.keys(response.data),
    })
    return false
  } catch (error: any) {
    // Refresh failed - clear tokens
    console.error('[TOKEN] ❌ Token refresh failed:', error?.message || error)
    clearTokens()
    return false
  }
}

// API Base URL - Change based on environment
const API_BASE_URL = getApiUrl()

// Non-versioned API base URL (for routes that don't use /v1)
// In production with proxy: /api
// In development: https://api.traf3li.com/api
const API_BASE_URL_NO_VERSION = API_CONFIG.useProxy ? '/api' : `${API_CONFIG.baseUrl}/api`

// Export the base URL for use in other components (e.g., file downloads)
export const API_URL = API_BASE_URL
export const API_URL_NO_VERSION = API_BASE_URL_NO_VERSION
// API_DOMAIN is used for direct links (e.g., file downloads) - always use full URL
export const API_DOMAIN = API_CONFIG.useProxy ? 'https://api.traf3li.com' : API_CONFIG.baseUrl

// Note: No axios-level cache - TanStack Query handles caching with smarter stale-while-revalidate

/**
 * Cached CSRF token from response headers (fallback when cookie isn't accessible)
 */
let cachedCsrfToken: string | null = null

/**
 * Extract CSRF token from cookies or use cached token
 * The cookie is NOT httpOnly, so JavaScript can read it
 * Falls back to cached token from response headers for cross-origin requests
 *
 * ============================================================================
 * 🚨 BACKEND_TODO: CSRF COOKIE CONFIGURATION
 * ============================================================================
 * The CSRF cookie is often NOT accessible from JavaScript because:
 * 1. httpOnly: true - JS can't read httpOnly cookies
 * 2. sameSite: 'strict' or 'lax' - Blocks cross-origin cookies
 * 3. Missing domain - Subdomain cookies not shared
 *
 * REQUIRED cookie settings for cross-origin (frontend on different domain):
 * ```javascript
 * res.cookie('csrfToken', token, {
 *   httpOnly: false,         // ← MUST be false so JS can read it!
 *   secure: true,            // ← Required for HTTPS
 *   sameSite: 'none',        // ← Required for cross-origin
 *   domain: '.traf3li.com',  // ← Optional: share across subdomains
 *   path: '/',
 *   maxAge: 3600000
 * });
 * ```
 *
 * ALSO: Return token in response header as fallback:
 * ```javascript
 * res.setHeader('x-csrf-token', token);
 * ```
 *
 * See: src/config/BACKEND_AUTH_ISSUES.ts for full documentation
 * ============================================================================
 */
const getCsrfToken = (): string => {
  const cookies = document.cookie
  console.log('[CSRF] getCsrfToken called. Document cookies:', cookies ? cookies.substring(0, 100) + '...' : '(empty)')

  // Try cookie first (primary method) - backend uses 'csrfToken' cookie name
  const match = cookies.match(/csrfToken=([^;]+)/)
  if (match && match[1]) {
    cachedCsrfToken = match[1] // Cache it
    console.log('[CSRF] Found csrfToken cookie:', match[1].substring(0, 20) + '...')
    return match[1]
  }

  // Try legacy cookie names
  const csrfDashMatch = cookies.match(/csrf-token=([^;]+)/)
  if (csrfDashMatch && csrfDashMatch[1]) {
    cachedCsrfToken = csrfDashMatch[1]
    console.log('[CSRF] Found csrf-token cookie:', csrfDashMatch[1].substring(0, 20) + '...')
    return csrfDashMatch[1]
  }

  // Try alternative cookie names
  const xsrfMatch = cookies.match(/XSRF-TOKEN=([^;]+)/)
  if (xsrfMatch && xsrfMatch[1]) {
    cachedCsrfToken = xsrfMatch[1]
    console.log('[CSRF] Found XSRF-TOKEN cookie:', xsrfMatch[1].substring(0, 20) + '...')
    return xsrfMatch[1]
  }

  // Fallback to cached token from response headers
  if (cachedCsrfToken) {
    console.log('[CSRF] Using cached token from response headers:', cachedCsrfToken.substring(0, 20) + '...')
    return cachedCsrfToken
  }

  // Always log when no token found (important for debugging)
  const availableCookies = cookies ? cookies.split(';').map(c => c.trim().split('=')[0]).filter(Boolean) : []
  console.warn('[CSRF] ⚠️ No csrf-token found!', {
    availableCookies,
    cachedToken: cachedCsrfToken ? 'exists' : 'none',
    documentCookieLength: cookies?.length || 0,
  })

  return ''
}
getCsrfToken.hasLoggedWarning = false

/**
 * Update cached CSRF token from response headers
 * Called by response interceptor to capture token from X-CSRF-Token header
 */
export const updateCsrfTokenFromResponse = (token: string) => {
  if (token) {
    cachedCsrfToken = token
  }
}

/**
 * Refresh CSRF token from backend
 * Call this after login/OAuth to ensure we have a valid CSRF token
 * Backend endpoint: GET /api/auth/csrf
 */
export const refreshCsrfToken = async (): Promise<string | null> => {
  console.log('[CSRF] Refreshing token from backend...')
  console.log('[CSRF] Request URL:', `${API_BASE_URL_NO_VERSION}/auth/csrf`)

  try {
    // Use a separate axios instance to avoid circular interceptor issues
    const response = await axios.get(
      `${API_BASE_URL_NO_VERSION}/auth/csrf`,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...(cachedDeviceFingerprint && { 'X-Device-Fingerprint': cachedDeviceFingerprint }),
        },
      }
    )

    console.log('[CSRF] Refresh response:', {
      status: response.status,
      hasBodyToken: !!response.data?.csrfToken,
      hasHeaderToken: !!response.headers['x-csrf-token'],
      setCookieHeader: response.headers['set-cookie'] ? 'present' : 'absent',
    })

    // Token is set in cookie automatically by backend
    // Also capture from response body/header as fallback
    const token = response.data?.csrfToken || response.headers['x-csrf-token']
    if (token) {
      cachedCsrfToken = token
      console.log('[CSRF] ✅ Token refreshed successfully from response:', token.substring(0, 20) + '...')
      return token
    }

    // Try reading from cookie after the request
    const cookieToken = getCsrfToken()
    if (cookieToken) {
      console.log('[CSRF] ✅ Token available from cookie after refresh')
      return cookieToken
    }

    console.warn('[CSRF] ⚠️ Token refresh completed but no token found in response or cookies')
    return null
  } catch (error: any) {
    console.error('[CSRF] ❌ Token refresh failed:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    })
    return null
  }
}

/**
 * Main API client instance
 * Configured with credentials for HttpOnly cookie handling
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Critical: Allows HttpOnly cookies to be sent
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'API-Version': API_CONFIG.version, // API version header as fallback
  },
  timeout: API_CONFIG.timeout,
})

/**
 * Non-versioned API client instance
 * For routes that don't use /v1 prefix (e.g., bank-reconciliation, currency)
 */
export const apiClientNoVersion = axios.create({
  baseURL: API_BASE_URL_NO_VERSION,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: API_CONFIG.timeout,
})

/**
 * Check if a URL should bypass circuit breaker
 * ALL auth routes bypass - users must always be able to authenticate
 */
const shouldBypassCircuitBreaker = (url: string): boolean => {
  // All /auth/* routes bypass circuit breaker
  return url.includes('/auth/')
}

// Apply same interceptors to non-versioned client (with gold standard protections)
apiClientNoVersion.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toLowerCase()
    const url = config.url || ''

    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = getCsrfToken()
      if (csrfToken) {
        config.headers.set('X-CSRF-Token', csrfToken)
      }
    }

    // PROACTIVE TOKEN REFRESH:
    // Check if access token is missing/expired and refresh token is available
    // Skip for auth endpoints to avoid loops
    const isAuthEndpoint = url.includes('/auth/')
    if (!isAuthEndpoint && needsTokenRefresh()) {
      const hasRefreshToken = getAnyRefreshToken()
      if (hasRefreshToken && !isRefreshing) {
        tokenLog('Proactive token refresh triggered (noVersion)', {
          reason: 'Access token missing or expired',
          url,
        })

        // Only one refresh at a time
        isRefreshing = true
        try {
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            tokenLog('Proactive token refresh succeeded (noVersion)')
          } else {
            tokenWarn('Proactive token refresh failed (noVersion) - request will proceed without token')
          }
        } catch (error) {
          tokenWarn('Proactive token refresh error (noVersion):', error)
        } finally {
          isRefreshing = false
        }
      }
    }

    // Add Authorization header with access token (dual token auth)
    const accessToken = getAccessToken()

    // Log token state for auth-related requests
    logRequestTokenState(method || 'get', url, accessToken)

    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`)
    }

    // Add device fingerprint for session binding (NCA ECC 2-1-4)
    if (cachedDeviceFingerprint) {
      config.headers.set('X-Device-Fingerprint', cachedDeviceFingerprint)
    }

    // Firm ID is now in JWT token (no need to send as header)
    // Keep localStorage for caching purposes only
    const activeFirmId = localStorage.getItem('activeFirmId')
    // Note: X-Company-Id header removed - backend extracts firmId from JWT token
    if (activeFirmId) {
      // config.headers.set('X-Company-Id', activeFirmId) // Disabled: firmId is in JWT
    }

    // Apply tiered timeout based on URL pattern
    if (!config.timeout || config.timeout === API_CONFIG.timeout) {
      config.timeout = getTimeoutForUrl(url, method || 'GET')
    }

    // Add abort controller for request cancellation
    if (!config.signal) {
      const controller = getAbortController(method || 'get', url, config.params)
      config.signal = controller.signal
    }

    // Add Idempotency Key for financial mutation requests
    if (shouldAddIdempotencyKey(method, url) && !config.headers.get('Idempotency-Key')) {
      const idempotencyKey = getIdempotencyKey(method || 'POST', url, config.data)
      config.headers.set('Idempotency-Key', idempotencyKey)
    }

    // Circuit Breaker Check - skip for auth routes (users must always be able to login)
    if (!shouldBypassCircuitBreaker(url)) {
      const circuitCheck = shouldAllowRequest(url)
      if (!circuitCheck.allowed) {
        const error = new Error(`Circuit breaker open for ${url}`) as any
        error.code = 'CIRCUIT_OPEN'
        error.retryAfter = circuitCheck.retryAfter
        return Promise.reject(error)
      }
    }

    // Request Deduplication for GET requests
    if (method === 'get' && url) {
      const dedupeKey = generateRequestKey(method, url, config.params)
      const pendingRequest = getPendingRequest(dedupeKey)

      if (pendingRequest) {
        config.adapter = () => pendingRequest
        return config
      }
    }

    // Debug: Log API call source location (enable with localStorage.setItem('API_DEBUG', 'true'))
    captureApiCall(method || 'GET', url, API_BASE_URL_NO_VERSION)

    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Wrapper for apiClientNoVersion deduplication
const originalNoVersionRequest = apiClientNoVersion.request.bind(apiClientNoVersion)
apiClientNoVersion.request = function<T = any, R = AxiosResponse<T>>(config: any): Promise<R> {
  const method = config.method?.toLowerCase() || 'get'
  const url = config.url || ''

  if (method === 'get' && url) {
    const dedupeKey = generateRequestKey(method, url, config.params)
    const existingRequest = getPendingRequest(dedupeKey)
    if (existingRequest) {
      return existingRequest as Promise<R>
    }
    const requestPromise = originalNoVersionRequest<T, R>(config)
    registerPendingRequest(dedupeKey, requestPromise)
    return requestPromise
  }

  return originalNoVersionRequest<T, R>(config)
}

apiClientNoVersion.interceptors.response.use(
  (response) => {
    const url = response.config.url || ''
    const method = response.config.method?.toUpperCase() || 'GET'

    // Complete API call timing
    completeApiCall(method, url, response.status)

    // Clean up abort controller
    removeAbortController(method.toLowerCase(), url, response.config.params)

    // Record success for circuit breaker (skip auth routes)
    if (!shouldBypassCircuitBreaker(url)) {
      recordSuccess(url)
    }

    // Clear idempotency key on successful mutation (next request gets new key)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      clearIdempotencyKey(method, url, response.config.data)
    }

    // Capture CSRF token from response headers (for cross-origin requests where cookie isn't accessible)
    const csrfTokenHeader = response.headers['x-csrf-token'] || response.headers['x-xsrf-token']
    if (csrfTokenHeader) {
      updateCsrfTokenFromResponse(csrfTokenHeader)
    }

    return response
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as any
    const url = originalRequest?.url || ''
    const method = originalRequest?.method?.toLowerCase() || 'get'

    // Complete API call timing (even for errors)
    completeApiCall(method.toUpperCase(), url, error.response?.status || 0)

    // Clean up abort controller
    removeAbortController(method, url, originalRequest?.params)

    // Don't process cancelled requests
    if (isAbortError(error)) {
      return Promise.reject({
        status: 0,
        message: 'Request cancelled',
        code: 'CANCELLED',
        error: true,
      })
    }

    // Record failure for circuit breaker (skip auth routes)
    if (!shouldBypassCircuitBreaker(url) && error.response?.status &&
        (error.response.status >= 500 || error.response.status === 429)) {
      recordFailure(url)
    }

    // Handle 429 Rate Limited
    if (error.response?.status === 429) {
      const retryAfterHeader = error.response.headers['retry-after']
      let retryAfter = 60

      if (retryAfterHeader) {
        const seconds = parseInt(retryAfterHeader, 10)
        if (!isNaN(seconds)) {
          retryAfter = seconds
        }
      }

      const message = error.response?.data?.message || `طلبات كثيرة جداً. يرجى الانتظار ${formatRetryAfter(retryAfter)}.`

      if (!originalRequest._rateLimitToastShown) {
        originalRequest._rateLimitToastShown = true
        import('sonner').then(({ toast }) => {
          toast.error(message, {
            description: `سيتم إعادة المحاولة تلقائياً بعد ${formatRetryAfter(retryAfter)}`,
            duration: Math.min(retryAfter * 1000, 10000),
          })
        })
      }

      ;(error as any).retryAfter = retryAfter
    }

    // Handle 401 with detailed token logging for debugging
    if (error.response?.status === 401) {
      const currentToken = getAccessToken()
      const authHeader = originalRequest?.headers?.get?.('Authorization') || originalRequest?.headers?.Authorization

      console.error('[TOKEN] ❌ 401 UNAUTHORIZED - Full Debug Info:', {
        endpoint: `${method.toUpperCase()} ${url}`,
        errorMessage: error.response?.data?.message || error.response?.data?.error?.message,
        errorCode: error.response?.data?.code || error.response?.data?.error?.code,
        // Token info
        hasAccessToken: !!currentToken,
        accessTokenLength: currentToken?.length,
        accessTokenPreview: currentToken ? currentToken.substring(0, 30) + '...' : 'NO TOKEN',
        // Auth header info
        authHeaderSent: !!authHeader,
        authHeaderValue: authHeader ? String(authHeader).substring(0, 40) + '...' : 'NO HEADER',
        // Decoded token info
        tokenDecoded: currentToken ? (() => {
          const decoded = decodeJWTForDebug(currentToken)
          if (!decoded.valid) return { valid: false }
          return {
            valid: true,
            userId: decoded.payload.userId || decoded.payload.sub,
            email: decoded.payload.email,
            exp: decoded.payload.exp ? new Date(decoded.payload.exp * 1000).toISOString() : 'N/A',
            isExpired: decoded.isExpired,
          }
        })() : null,
        // Response details
        responseData: error.response?.data,
        responseHeaders: Object.fromEntries(
          Object.entries(error.response?.headers || {}).filter(([k]) =>
            ['content-type', 'x-request-id', 'www-authenticate'].includes(k.toLowerCase())
          )
        ),
        timestamp: new Date().toISOString(),
      })
    }

    // DON'T auto-redirect on 401 for auth routes
    // Let the auth service decide what to do based on the specific endpoint
    // Support both nested error object (error.error.message) and root-level message
    const errorObj = error.response?.data?.error
    const errorMessage = errorObj?.messageAr || errorObj?.message || error.response?.data?.message || 'حدث خطأ غير متوقع'
    const errorCode = errorObj?.code || error.response?.data?.code

    const formattedError = {
      status: error.response?.status || 500,
      message: errorMessage,
      code: errorCode,
      error: true,
      requestId: error.response?.data?.meta?.requestId || error.response?.data?.requestId,
      errors: error.response?.data?.errors,
      retryAfter: (error as any).retryAfter,
    }

    // Capture error with aggressive debug (non-versioned client)
    captureApiError(
      formattedError.status,
      formattedError.message,
      error.config?.url || '',
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      {
        requestId: formattedError.requestId,
        code: formattedError.code,
        errors: formattedError.errors,
        responseData: error.response?.data,
        client: 'apiClientNoVersion',
      }
    )

    return Promise.reject(formattedError)
  }
)

/**
 * Request Interceptor
 * Adds tiered timeouts, request cancellation, deduplication, circuit breaker, idempotency, CSRF token, and Authorization handling
 *
 * PROACTIVE TOKEN REFRESH:
 * If access token is missing/expired but refresh token exists, we proactively
 * refresh before the request to avoid a 401 round-trip.
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add CSRF token to mutating requests
    const method = config.method?.toLowerCase()
    const url = config.url || ''

    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = getCsrfToken()
      if (csrfToken) {
        config.headers.set('X-CSRF-Token', csrfToken)
      }
    }

    // PROACTIVE TOKEN REFRESH:
    // Check if access token is missing/expired and refresh token is available
    // Skip for auth endpoints to avoid loops
    const isAuthEndpoint = url.includes('/auth/')
    if (!isAuthEndpoint && needsTokenRefresh()) {
      const hasRefreshToken = getAnyRefreshToken()
      if (hasRefreshToken && !isRefreshing) {
        tokenLog('Proactive token refresh triggered', {
          reason: 'Access token missing or expired',
          url,
        })

        // Only one refresh at a time
        isRefreshing = true
        try {
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            tokenLog('Proactive token refresh succeeded')
          } else {
            tokenWarn('Proactive token refresh failed - request will proceed without token')
          }
        } catch (error) {
          tokenWarn('Proactive token refresh error:', error)
        } finally {
          isRefreshing = false
        }
      }
    }

    // Add Authorization header with access token (dual token auth)
    const accessToken = getAccessToken()

    // Log token state for auth-related requests
    logRequestTokenState(method || 'get', url, accessToken)

    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`)
    }

    // Add device fingerprint for session binding (NCA ECC 2-1-4)
    if (cachedDeviceFingerprint) {
      config.headers.set('X-Device-Fingerprint', cachedDeviceFingerprint)
    }

    // Firm ID is now in JWT token (no need to send as header)
    // Keep localStorage for caching purposes only
    const activeFirmId = localStorage.getItem('activeFirmId')
    // Note: X-Company-Id header removed - backend extracts firmId from JWT token
    if (activeFirmId) {
      // config.headers.set('X-Company-Id', activeFirmId) // Disabled: firmId is in JWT
    }

    // Apply tiered timeout based on URL pattern (auth: 5s, default: 10s, upload: 120s)
    if (!config.timeout || config.timeout === API_CONFIG.timeout) {
      config.timeout = getTimeoutForUrl(url, method || 'GET')
    }

    // Add abort controller for request cancellation
    if (!config.signal) {
      const controller = getAbortController(method || 'get', url, config.params)
      config.signal = controller.signal
    }

    // Add Idempotency Key for financial mutation requests
    if (shouldAddIdempotencyKey(method, url) && !config.headers.get('Idempotency-Key')) {
      const idempotencyKey = getIdempotencyKey(method || 'POST', url, config.data)
      config.headers.set('Idempotency-Key', idempotencyKey)
    }

    // Circuit Breaker Check - reject if circuit is open (skip for auth routes)
    if (!shouldBypassCircuitBreaker(url)) {
      const circuitCheck = shouldAllowRequest(url)
      if (!circuitCheck.allowed) {
        const error = new Error(`Circuit breaker open for ${url}`) as any
        error.code = 'CIRCUIT_OPEN'
        error.retryAfter = circuitCheck.retryAfter
        return Promise.reject(error)
      }
    }

    // Request Deduplication for GET requests
    if (method === 'get' && url) {
      const dedupeKey = generateRequestKey(method, url, config.params)
      const pendingRequest = getPendingRequest(dedupeKey)

      if (pendingRequest) {
        // Return the existing request's promise via adapter
        config.adapter = () => pendingRequest
        return config
      }
    }

    // Note: No axios-level cache - TanStack Query handles caching with stale-while-revalidate

    // Debug: Log API call source location (enable with localStorage.setItem('API_DEBUG', 'true'))
    captureApiCall(method || 'GET', url, API_BASE_URL)

    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

/**
 * Wrapper to register deduplication after request is made
 */
const originalRequest = apiClient.request.bind(apiClient)
apiClient.request = function<T = any, R = AxiosResponse<T>>(config: any): Promise<R> {
  const method = config.method?.toLowerCase() || 'get'
  const url = config.url || ''

  // Only deduplicate GET requests
  if (method === 'get' && url) {
    const dedupeKey = generateRequestKey(method, url, config.params)

    // Check if there's already a pending request
    const existingRequest = getPendingRequest(dedupeKey)
    if (existingRequest) {
      return existingRequest as Promise<R>
    }

    // Make the request and register it
    const requestPromise = originalRequest<T, R>(config)
    registerPendingRequest(dedupeKey, requestPromise)

    return requestPromise
  }

  return originalRequest<T, R>(config)
}

/**
 * Response Interceptor
 * Handles session warnings, errors, circuit breaker, idempotency, and retry logic
 * Note: No axios-level cache - TanStack Query handles caching
 */
apiClient.interceptors.response.use(
  (response) => {
    const url = response.config.url || ''
    const method = response.config.method?.toUpperCase() || 'GET'

    // Complete API call timing
    completeApiCall(method, url, response.status)

    // Clean up abort controller
    removeAbortController(method.toLowerCase(), url, response.config.params)

    // Record success for circuit breaker (skip auth routes)
    if (!shouldBypassCircuitBreaker(url)) {
      recordSuccess(url)
    }

    // Clear idempotency key on successful mutation (next request gets new key)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      clearIdempotencyKey(method, url, response.config.data)
    }

    // Capture CSRF token from response headers (for cross-origin requests where cookie isn't accessible)
    const csrfTokenHeader = response.headers['x-csrf-token'] || response.headers['x-xsrf-token']
    if (csrfTokenHeader) {
      updateCsrfTokenFromResponse(csrfTokenHeader)
    }

    // Check for session warning headers (5 minutes before expiry)
    const headers = response.headers
    const idleWarning = headers['x-session-idle-warning']
    const idleRemaining = headers['x-session-idle-remaining']
    const absoluteWarning = headers['x-session-absolute-warning']
    const absoluteRemaining = headers['x-session-absolute-remaining']

    if (idleWarning === 'true' || absoluteWarning === 'true') {
      const remaining = Math.min(
        idleRemaining ? parseInt(idleRemaining, 10) : Infinity,
        absoluteRemaining ? parseInt(absoluteRemaining, 10) : Infinity
      )

      // Dispatch custom event for session warning (components can listen to this)
      window.dispatchEvent(new CustomEvent('session-expiry-warning', {
        detail: {
          remainingSeconds: remaining,
          isIdleWarning: idleWarning === 'true',
          isAbsoluteWarning: absoluteWarning === 'true',
        }
      }))
    }

    return response
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as any
    const url = originalRequest?.url || ''
    const method = originalRequest?.method?.toLowerCase() || 'get'

    // Complete API call timing (even for errors)
    completeApiCall(method.toUpperCase(), url, error.response?.status || 0)

    // Clean up abort controller
    removeAbortController(method, url, originalRequest?.params)

    // Don't process cancelled requests
    if (isAbortError(error)) {
      return Promise.reject({
        status: 0,
        message: 'Request cancelled',
        code: 'CANCELLED',
        error: true,
      })
    }

    // Record failure for circuit breaker (only for server errors and rate limits, skip auth routes)
    if (!shouldBypassCircuitBreaker(url) && error.response?.status &&
        (error.response.status >= 500 || error.response.status === 429)) {
      recordFailure(url)
    }

    // Retry logic for network errors or 5xx errors (NOT 429 - let TanStack Query handle that)
    if (
      !originalRequest._retry &&
      (!error.response || (error.response.status >= 500 && error.response.status < 600))
    ) {
      originalRequest._retry = true
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1

      // Max retries with exponential backoff + jitter
      if (originalRequest._retryCount <= API_CONFIG.retryAttempts) {
        const baseDelay = 1000 * Math.pow(2, originalRequest._retryCount - 1)
        const jitter = baseDelay * 0.3 * Math.random() // 30% jitter
        const delay = Math.min(baseDelay + jitter, 8000)

        await new Promise(resolve => setTimeout(resolve, delay))
        return apiClient(originalRequest)
      }
    }

    // Handle 423 Account Locked
    if (error.response?.status === 423) {
      const data = error.response?.data
      const remainingTime = data?.remainingTime || 15
      const message = data?.message || `الحساب مقفل مؤقتاً. حاول مرة أخرى بعد ${remainingTime} دقيقة`

      import('sonner').then(({ toast }) => {
        toast.error(message, {
          description: `يرجى الانتظار ${remainingTime} دقيقة قبل المحاولة مرة أخرى`,
          duration: 10000,
        })
      })

      return Promise.reject({
        status: 423,
        message,
        code: 'ACCOUNT_LOCKED',
        error: true,
        remainingTime,
        requestId: error.response?.data?.requestId,
      })
    }

    // Handle 429 Rate Limited - DON'T retry here, let TanStack Query handle it with smart backoff
    if (error.response?.status === 429) {
      const retryAfterHeader = error.response.headers['retry-after']
      let retryAfter = 60 // Default 60 seconds

      if (retryAfterHeader) {
        // Could be seconds or HTTP date
        const seconds = parseInt(retryAfterHeader, 10)
        if (!isNaN(seconds)) {
          retryAfter = seconds
        } else {
          // Try parsing as date
          const date = Date.parse(retryAfterHeader)
          if (!isNaN(date)) {
            retryAfter = Math.max(1, Math.ceil((date - Date.now()) / 1000))
          }
        }
      }

      const message = error.response?.data?.message || `طلبات كثيرة جداً. يرجى الانتظار ${formatRetryAfter(retryAfter)}.`

      // Only show toast once (not on retries)
      if (!originalRequest._rateLimitToastShown) {
        originalRequest._rateLimitToastShown = true
        import('sonner').then(({ toast }) => {
          toast.error(message, {
            description: `سيتم إعادة المحاولة تلقائياً بعد ${formatRetryAfter(retryAfter)}`,
            duration: Math.min(retryAfter * 1000, 10000),
          })
        })
      }

      // Return error with retryAfter for TanStack Query to use
      const rateLimitError = {
        status: 429,
        message,
        error: true,
        requestId: error.response?.data?.requestId,
        retryAfter,
      }

      // Attach to axios error for TanStack Query retry logic
      ;(error as any).retryAfter = retryAfter

      return Promise.reject(rateLimitError)
    }

    // Handle 401 Unauthorized - Token refresh logic
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code
      const reason = error.response?.data?.reason

      // Handle specific session timeout codes (no refresh possible)
      if (errorCode === 'SESSION_IDLE_TIMEOUT' || errorCode === 'SESSION_ABSOLUTE_TIMEOUT') {
        const isIdleTimeout = reason === 'idle_timeout' || errorCode === 'SESSION_IDLE_TIMEOUT'
        const message = isIdleTimeout
          ? 'انتهت جلستك بسبب عدم النشاط'
          : 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى'

        // Clear all auth state
        localStorage.removeItem('user')
        clearTokens()

        import('sonner').then(({ toast }) => {
          toast.warning(message, {
            description: 'جارٍ إعادة التوجيه إلى صفحة تسجيل الدخول...',
            duration: 3000,
          })
        })

        // Redirect to login with reason
        setTimeout(() => {
          window.location.href = `/sign-in?reason=${reason || 'session_expired'}`
        }, 2000)

        return Promise.reject({
          status: 401,
          message,
          code: errorCode,
          error: true,
          reason,
        })
      }

      // Don't try to refresh if:
      // 1. Already tried once (_retry flag set)
      // 2. This is a refresh token request itself
      // 3. No refresh token available (check both localStorage AND cookies)
      const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh')
      const anyRefreshToken = getAnyRefreshToken()
      if (originalRequest?._retry || isRefreshRequest || !anyRefreshToken) {
        // Log and let auth system handle it
        console.warn('[API] 401 Unauthorized (no refresh possible):', {
          url: error.config?.url,
          method: error.config?.method,
          hasRefreshTokenLocalStorage: !!getRefreshToken(),
          hasRefreshTokenCookie: !!getRefreshTokenFromCookie(),
          isRetry: !!originalRequest?._retry,
          isRefreshRequest,
          timestamp: new Date().toISOString(),
        })

        // If refresh failed, clear tokens and redirect to sign-in
        if (isRefreshRequest) {
          clearTokens()
          localStorage.removeItem('user')

          import('sonner').then(({ toast }) => {
            toast.error('انتهت صلاحية الجلسة | Session expired', {
              description: 'يرجى تسجيل الدخول مرة أخرى | Please log in again',
              duration: 3000,
            })
          })

          setTimeout(() => {
            window.location.href = '/sign-in?reason=session_expired'
          }, 2000)
        }

        return Promise.reject({
          status: 401,
          message: error.response?.data?.message || 'Unauthorized',
          code: errorCode,
          error: true,
          reason,
        })
      }

      // Mark this request as a retry attempt
      originalRequest._retry = true

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      // Start refresh process
      isRefreshing = true

      try {
        const refreshSuccess = await refreshAccessToken()

        if (refreshSuccess) {
          // Update the original request with new token
          const newToken = getAccessToken()
          if (newToken && originalRequest.headers) {
            originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
          }

          // Process queued requests
          processQueue()

          // Retry the original request
          return apiClient(originalRequest)
        } else {
          // Refresh failed - reject all queued requests and redirect to login
          processQueue(new Error('Token refresh failed'))

          clearTokens()
          localStorage.removeItem('user')

          import('sonner').then(({ toast }) => {
            toast.error('انتهت صلاحية الجلسة | Session expired', {
              description: 'يرجى تسجيل الدخول مرة أخرى | Please log in again',
              duration: 3000,
            })
          })

          setTimeout(() => {
            window.location.href = '/sign-in?reason=session_expired'
          }, 2000)

          return Promise.reject({
            status: 401,
            message: 'Session expired',
            error: true,
          })
        }
      } catch (refreshError) {
        // Refresh failed - reject all queued requests
        processQueue(refreshError)

        clearTokens()
        localStorage.removeItem('user')

        return Promise.reject({
          status: 401,
          message: 'Token refresh failed',
          error: true,
        })
      } finally {
        isRefreshing = false
      }
    }

    // Handle 400 with "Unauthorized" message
    // Log but don't force redirect - let auth system handle it
    if (error.response?.status === 400) {
      const message = error.response?.data?.message?.toLowerCase() || ''
      if (message.includes('unauthorized') || message.includes('access denied') || message.includes('relogin')) {
        console.warn('[API] 400 with auth message:', {
          url: error.config?.url,
          method: error.config?.method,
          message: error.response?.data?.message,
          timestamp: new Date().toISOString(),
        })
        // Don't clear localStorage or redirect - let auth system handle it
      }
    }

    // Handle 403 Forbidden - Permission denied (including departed users) and CSRF errors
    if (error.response?.status === 403) {
      const message = error.response?.data?.message
      const errorCode = error.response?.data?.code

      // Check for CSRF token errors - retry once with fresh token
      if (errorCode === 'CSRF_TOKEN_INVALID' || errorCode === 'CSRF_TOKEN_MISSING' ||
          errorCode === 'CSRF_ORIGIN_INVALID' || errorCode?.startsWith('CSRF_')) {
        // Only retry once
        if (!originalRequest._csrfRetry) {
          originalRequest._csrfRetry = true

          try {
            // Refresh CSRF token
            await refreshCsrfToken()

            // Get the new token and retry
            const newToken = getCsrfToken()
            if (newToken && originalRequest.headers) {
              originalRequest.headers.set('X-CSRF-Token', newToken)
            }

            console.log('[CSRF] Retrying request with fresh token')
            return apiClient(originalRequest)
          } catch (csrfError) {
            console.error('[CSRF] Token refresh failed, redirecting to login:', csrfError)
            // If refresh fails, redirect to login
            import('sonner').then(({ toast }) => {
              toast.error('انتهت صلاحية الجلسة | Session expired', {
                description: 'يرجى تسجيل الدخول مرة أخرى | Please log in again',
                duration: 3000,
              })
            })

            setTimeout(() => {
              window.location.href = '/sign-in?reason=csrf_failed'
            }, 2000)
          }
        } else {
          // Already retried once, show error and redirect
          import('sonner').then(({ toast }) => {
            toast.error('انتهت صلاحية الجلسة | Session expired', {
              description: 'يرجى تسجيل الدخول مرة أخرى | Please log in again',
              duration: 3000,
            })
          })

          setTimeout(() => {
            window.location.href = '/sign-in?reason=csrf_failed'
          }, 2000)
        }

        return Promise.reject({
          status: 403,
          message: 'CSRF token invalid',
          code: errorCode,
          error: true,
          requestId: error.response?.data?.requestId,
        })
      }

      // Check for Arabic permission messages from departed user blocking
      // These messages indicate the user doesn't have permission to access a resource
      if (message?.includes('ليس لديك صلاحية')) {
        // Import toast dynamically to avoid circular dependencies
        import('sonner').then(({ toast }) => {
          toast.error(message, {
            description: 'قد تكون صلاحياتك محدودة. تواصل مع إدارة المكتب للمزيد من المعلومات.',
            duration: 5000,
          })
        })
      }
    }

    // Handle 400 Bad Request - Validation errors
    if (error.response?.status === 400) {
      const errors = error.response?.data?.errors
      // Support both nested error object and root-level message
      const errorObj = error.response?.data?.error
      const message = errorObj?.messageAr || errorObj?.message || error.response?.data?.message

      // Show validation errors as toast messages
      if (errors && Array.isArray(errors)) {
        import('sonner').then(({ toast }) => {
          errors.forEach((err: { field: string; message: string }) => {
            toast.error(`${err.field}: ${err.message}`, {
              duration: 4000,
            })
          })
        })
      } else if (message) {
        // Show generic validation message
        import('sonner').then(({ toast }) => {
          toast.error(message, {
            duration: 4000,
          })
        })
      }
    }

    // Handle CORS errors specifically
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      return Promise.reject({
        status: 0,
        message: 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        error: true,
      })
    }

    // Return formatted error with requestId and validation errors
    // Support both nested error object (error.error.message) and root-level message
    const errorObj = error.response?.data?.error
    const errorMessage = errorObj?.messageAr || errorObj?.message || error.response?.data?.message || 'حدث خطأ غير متوقع'
    const errorCode = errorObj?.code || error.response?.data?.code

    const formattedError = {
      status: error.response?.status || 500,
      message: errorMessage,
      code: errorCode,
      error: true,
      requestId: error.response?.data?.meta?.requestId || error.response?.data?.requestId,
      errors: error.response?.data?.errors, // Validation errors array
    }

    // Capture error with aggressive debug
    captureApiError(
      formattedError.status,
      formattedError.message,
      error.config?.url || '',
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      {
        requestId: formattedError.requestId,
        code: formattedError.code,
        errors: formattedError.errors,
        responseData: error.response?.data,
        requestData: error.config?.data,
        headers: error.response?.headers,
      }
    )

    return Promise.reject(formattedError)
  }
)

/**
 * API Error Type
 */
export interface ApiError {
  status: number
  message: string
  code?: string
  error: boolean
  requestId?: string
  errors?: Array<{ field: string; message: string }>
}

/**
 * Rate Limit Info Type
 */
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number // Unix timestamp
}

/**
 * Get rate limit info from response headers
 */
export const getRateLimitInfo = (headers: any): RateLimitInfo | null => {
  const limit = headers['x-ratelimit-limit']
  const remaining = headers['x-ratelimit-remaining']
  const reset = headers['x-ratelimit-reset']

  if (limit && remaining && reset) {
    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10),
    }
  }
  return null
}

/**
 * Format seconds to human-readable time
 */
export const formatRetryAfter = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} ثانية`
  }
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) {
    return `${minutes} دقيقة`
  }
  const hours = Math.ceil(minutes / 60)
  return `${hours} ساعة`
}

/**
 * Helper function to handle API errors consistently
 */
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message
  }
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
}

/**
 * Clear cache (deprecated - TanStack Query handles caching now)
 * Kept for API compatibility - use queryClient.clear() instead
 *
 * @deprecated This function is deprecated and does nothing. Use TanStack Query's queryClient methods instead:
 * - To invalidate all queries: queryClient.clear()
 * - To invalidate specific queries: queryClient.invalidateQueries({ queryKey: ['key'] })
 * - To remove queries: queryClient.removeQueries({ queryKey: ['key'] })
 *
 * @param _urlPattern - Unused parameter (kept for API compatibility)
 */
export const clearCache = (_urlPattern?: string) => {
  console.warn(
    '[DEPRECATED | قديم] clearCache() is deprecated and does nothing. | clearCache() قديم ولا يفعل شيء.\n' +
    'Use TanStack Query methods instead | استخدم طرق TanStack Query بدلاً من ذلك:\n' +
    '  - queryClient.clear() to clear all cache | لمسح جميع الذاكرة المؤقتة\n' +
    '  - queryClient.invalidateQueries({ queryKey: [...] }) to invalidate specific queries | لإبطال استعلامات محددة\n' +
    '  - queryClient.removeQueries({ queryKey: [...] }) to remove queries | لإزالة الاستعلامات\n\n' +
    'Migration example | مثال الترحيل:\n' +
    '  ❌ clearCache("/cases/123")\n' +
    '  ✅ queryClient.invalidateQueries({ queryKey: ["case", "123"] })'
  )
  // No-op: TanStack Query handles caching now
}

/**
 * Get cache size (deprecated - TanStack Query handles caching now)
 *
 * @deprecated This function is deprecated and always returns 0. Use TanStack Query's queryClient methods instead:
 * - To get query cache: queryClient.getQueryCache()
 * - To inspect queries: queryClient.getQueryData(queryKey)
 *
 * @returns 0 (no axios-level cache)
 */
export const getCacheSize = () => {
  console.warn(
    '[DEPRECATED | قديم] getCacheSize() is deprecated and always returns 0. | getCacheSize() قديم ويرجع دائماً 0.\n' +
    'Use TanStack Query methods instead | استخدم طرق TanStack Query بدلاً من ذلك:\n' +
    '  - queryClient.getQueryCache() to access the query cache | للوصول إلى ذاكرة الاستعلامات\n' +
    '  - queryClient.getQueryData(queryKey) to get specific query data | للحصول على بيانات استعلام محددة\n\n' +
    'Migration example | مثال الترحيل:\n' +
    '  ❌ const size = getCacheSize()\n' +
    '  ✅ const cache = queryClient.getQueryCache()\n' +
    '  ✅ const data = queryClient.getQueryData(["cases"])'
  )
  return 0 // No axios-level cache
}

/**
 * Reset all API state (pending requests, circuit breakers, idempotency keys, tokens, scheduled refresh)
 * Call this on logout to ensure clean state
 */
export const resetApiState = () => {
  cancelAllRequests('Logout - clearing state')
  clearPendingRequests()
  resetAllCircuits()
  clearAllIdempotencyKeys()
  clearTokens() // Clear access and refresh tokens (also cancels scheduled refresh)
  // Reset token refresh state
  isRefreshing = false
  failedQueue = []
}

// Re-export circuit breaker utilities for monitoring
export { getOpenCircuits, getCircuitStatus } from './circuit-breaker'
export { getPendingRequestCount } from './request-deduplication'

// Re-export idempotency utilities
export {
  shouldAddIdempotencyKey,
  generateIdempotencyKey,
  FINANCIAL_PATHS,
} from './idempotency'

// Re-export request cancellation utilities
export {
  cancelAllRequests,
  cancelNavigationRequests,
  isAbortError,
} from './request-cancellation'

// Alias export for compatibility with services that import 'api'
export const api = apiClient

export default apiClient
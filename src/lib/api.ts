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
import { tokenRefreshEvents } from './token-refresh-events'
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
import { ROUTES } from '@/constants/routes'
import { STORAGE_KEYS, AUTH_TIMING } from '@/constants/storage-keys'
import { authEvents } from './auth-events'
import { showErrorToast } from './toast-utils'
import {
  handleSessionExpired,
  handleSessionTimeout,
  handleCrossTabLogout,
  handleCsrfFailure,
} from './auth-redirect'

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
 * Token refresh scheduler
 * Automatically refreshes the access token before it expires
 */
let tokenRefreshTimeoutId: ReturnType<typeof setTimeout> | null = null

/**
 * In-memory token expiration tracking
 * With httpOnly cookies, we can't read the token itself, but we track when it expires
 * based on the expiresIn value from auth responses
 */
let memoryExpiresAt: number | null = null

/**
 * Session indicator - set to true when we have evidence of an active session
 * Used to determine if we should attempt token refresh when tokens are in httpOnly cookies
 */
let hasActiveSession: boolean = false

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
    // SECURITY: Don't log token preview in production - could leak tokens to logs
    tokenWarn(`Request with INVALID token: ${method.toUpperCase()} ${url}`)
    return
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = decoded.payload.exp
  const expiresIn = exp ? Math.round((exp - now) / 60) : 0

  // SECURITY: Only log non-sensitive metadata, never token content
  tokenLog(`Request with token: ${method.toUpperCase()} ${url}`, {
    userId: decoded.payload.userId || decoded.payload.sub,
    isExpired: decoded.isExpired,
    expiresIn: `${expiresIn} minutes`,
  })
}

/**
 * Get access token from localStorage
 * NOTE: With httpOnly cookies, this may return null even when authenticated.
 * The token is in the cookie and sent automatically with credentials: 'include'
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH.ACCESS_TOKEN)
}

/**
 * Get refresh token from localStorage
 * NOTE: With httpOnly cookie strategy, this returns null (refresh token is in httpOnly cookie).
 * Use hasActiveSession() to check if a session exists.
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH.REFRESH_TOKEN)
}

/**
 * Check if there's evidence of an active session
 * With httpOnly cookies, we can't read tokens, but we track session state
 */
export const hasActiveSessionIndicator = (): boolean => {
  // Check memory flag first (set by storeTokens)
  if (hasActiveSession) return true

  // Check localStorage indicators (user data, auth storage)
  const hasUserData = !!localStorage.getItem(STORAGE_KEYS.AUTH_STATE.USER_CACHE)
  const hasAuthStorage = !!localStorage.getItem(STORAGE_KEYS.AUTH_STATE.ZUSTAND_PERSIST)
  const hasExpiresAt = !!localStorage.getItem(STORAGE_KEYS.AUTH.EXPIRES_AT) || memoryExpiresAt !== null

  return hasUserData || hasAuthStorage || hasExpiresAt
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
 * With httpOnly cookies, we can't read the token, so we rely on:
 * 1. expiresAt tracking (from login/refresh responses)
 * 2. Session indicators (user data exists)
 */
export const needsTokenRefresh = (): boolean => {
  // BFF Pattern: Check expiration time from memory/localStorage
  const expiresAt = getTokenExpiresAt()
  if (expiresAt) {
    // Token is expiring soon or expired - need refresh
    if (isTokenExpiringSoon(30)) { // 30 second buffer
      return true
    }
    // Token is valid and not expiring soon
    return false
  }

  // Fallback: Try to read token from localStorage (legacy/transition)
  const accessToken = getAccessToken()
  if (accessToken) {
    // Check if token is expired by decoding it
    const decoded = decodeJWTForDebug(accessToken)
    if (!decoded.valid || decoded.isExpired) {
      return true
    }
    // Token exists and is valid
    return false
  }

  // No expiration info and no readable token
  // If we have session indicators, assume we need to verify with server
  if (hasActiveSessionIndicator()) {
    return true
  }

  // No session - don't need refresh (user should login)
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
  const refreshInSeconds = Math.max(expiresIn - AUTH_TIMING.TOKEN_REFRESH_BUFFER_SECONDS, 10)
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
 * Get token expiration time
 * Checks memory first (BFF pattern), then localStorage (legacy)
 */
export const getTokenExpiresAt = (): number | null => {
  // Memory-first for BFF pattern (httpOnly cookies)
  if (memoryExpiresAt !== null) {
    return memoryExpiresAt
  }
  // Fallback to localStorage for backward compatibility
  const expiresAt = localStorage.getItem(STORAGE_KEYS.AUTH.EXPIRES_AT)
  return expiresAt ? parseInt(expiresAt, 10) : null
}

/**
 * Check if token is expired or about to expire
 */
export const isTokenExpiringSoon = (bufferSeconds: number = AUTH_TIMING.TOKEN_REFRESH_BUFFER_SECONDS): boolean => {
  const expiresAt = getTokenExpiresAt()
  if (!expiresAt) return false
  return Date.now() >= (expiresAt - bufferSeconds * 1000)
}

/**
 * Store tokens and session state
 *
 * BFF Pattern (httpOnly cookies):
 * - accessToken and refreshToken are in httpOnly cookies (JS can't read)
 * - Backend does NOT return tokens in response body
 * - We only receive expiresIn from the response
 * - We track expiresAt in memory for refresh scheduling
 *
 * Legacy Pattern (for backward compatibility during transition):
 * - If accessToken is provided, store in localStorage
 * - If refreshToken is provided, store in localStorage
 *
 * @param accessToken - Optional: The access token (only if backend returns it in body)
 * @param refreshToken - Optional: The refresh token (only if backend returns it in body)
 * @param expiresIn - Seconds until access token expires (enables automatic refresh scheduling)
 */
export const storeTokens = (accessToken?: string | null, refreshToken?: string | null, expiresIn?: number): void => {
  const isBffPattern = !accessToken && expiresIn // No token in body, but have expiration

  tokenLog('Storing auth state...', {
    pattern: isBffPattern ? 'BFF (httpOnly cookies)' : 'Legacy (localStorage)',
    accessTokenLength: accessToken?.length || '(httpOnly cookie)',
    refreshTokenLength: refreshToken?.length || '(httpOnly cookie)',
    hasExpiresIn: !!expiresIn,
    expiresIn: expiresIn ? `${expiresIn}s (${Math.round(expiresIn / 60)}min)` : 'N/A',
  })

  // Mark session as active
  hasActiveSession = true

  // Legacy: Store tokens in localStorage if provided (for backward compatibility)
  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.AUTH.ACCESS_TOKEN, accessToken)
  }
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.AUTH.REFRESH_TOKEN, refreshToken)
  }

  // Store expiration time (primary mechanism for BFF pattern)
  if (expiresIn && expiresIn > 0) {
    const expiresAt = Date.now() + (expiresIn * 1000)

    // Store in memory (BFF pattern - primary)
    memoryExpiresAt = expiresAt

    // Also store in localStorage for cross-tab sync and page refresh recovery
    localStorage.setItem(STORAGE_KEYS.AUTH.EXPIRES_AT, expiresAt.toString())

    // Schedule automatic token refresh
    scheduleTokenRefresh(expiresIn)
  }

  tokenLog('Auth state stored successfully', {
    memoryExpiresAt: memoryExpiresAt ? new Date(memoryExpiresAt).toISOString() : 'not set',
    hasActiveSession,
  })

  // Emit token refresh event so WebSocket layer can update
  // This ensures WebSocket stays authenticated after HTTP token refresh
  // Pass accessToken if available (legacy), otherwise signal BFF pattern
  tokenRefreshEvents.emit(accessToken || 'httpOnly', expiresIn)

  // Also emit via auth events for other subscribers
  authEvents.onTokensRefreshed.emit({ accessToken: accessToken || undefined, expiresIn })
  authEvents.onAuthStateChange.emit({ isAuthenticated: true })
}

/**
 * Clear tokens and all auth state
 * Clears both memory state (BFF pattern) and localStorage (legacy)
 *
 * IMPORTANT: This function is SYNCHRONOUS. All state is cleared before it returns.
 * Subscribers to authEvents.onTokensCleared are notified synchronously.
 *
 * @param reason - Optional reason for clearing tokens (for analytics/debugging)
 */
export const clearTokens = (reason: string = 'manual'): void => {
  tokenLog('Clearing auth state', { reason })

  // Clear memory state (BFF pattern)
  memoryExpiresAt = null
  hasActiveSession = false

  // Clear localStorage token storage (legacy pattern)
  localStorage.removeItem(STORAGE_KEYS.AUTH.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.AUTH.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.AUTH.EXPIRES_AT)

  // Cancel any scheduled token refresh
  cancelScheduledTokenRefresh()

  // NOTE: We intentionally do NOT cancel pending redirects here.
  // The redirect handlers (handleSessionExpired, etc.) manage their own debouncing.
  // If we cancelled here, we'd defeat the debounce when multiple 401s happen rapidly.

  // Clear auth-storage (Zustand persisted state) to ensure isAuthenticated becomes false
  localStorage.removeItem(STORAGE_KEYS.AUTH_STATE.ZUSTAND_PERSIST)

  // Clear cached user data
  localStorage.removeItem(STORAGE_KEYS.AUTH_STATE.USER_CACHE)

  // Emit tokens cleared event - subscribers (like authService) can clear their caches
  // This is SYNCHRONOUS - all listeners run before this function returns
  authEvents.onTokensCleared.emit({ reason })

  // Emit auth state change event
  authEvents.onAuthStateChange.emit({ isAuthenticated: false })

  tokenLog('Auth state cleared', { reason })
}

/**
 * Check if we have valid auth state
 * With BFF pattern, tokens are in httpOnly cookies (JS can't read).
 * We check for session indicators instead.
 */
export const hasTokens = (): boolean => {
  // BFF Pattern: Check for session indicators
  if (hasActiveSession || memoryExpiresAt !== null) {
    return true
  }

  // Legacy: Check localStorage
  const hasLocalStorageTokens = !!getAccessToken() && !!getRefreshToken()
  if (hasLocalStorageTokens) {
    return true
  }

  // Check other session indicators
  return hasActiveSessionIndicator()
}

// ==================== TOKEN REFRESH MECHANISM ====================

/**
 * Token refresh state management
 * Uses Promise-based deduplication to prevent race conditions
 *
 * ENTERPRISE PATTERN: Promise-based deduplication
 * Instead of using a flag (isRefreshing) which can race, we use a Promise.
 * All concurrent refresh requests wait for the same Promise, ensuring only one refresh happens.
 */
let refreshPromise: Promise<boolean> | null = null
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (error: any) => void
  config: InternalAxiosRequestConfig
}> = []

/**
 * CSRF refresh state management
 * Uses Promise-based deduplication (same pattern as token refresh)
 */
let csrfRefreshPromise: Promise<boolean> | null = null
let csrfFailedQueue: Array<{
  resolve: (value: any) => void
  reject: (error: any) => void
  config: InternalAxiosRequestConfig
  client: 'versioned' | 'noVersion'
}> = []

/**
 * Process queued requests after CSRF refresh
 *
 * IMPORTANT: We clear the queue BEFORE iterating to prevent double processing.
 */
const processCsrfQueue = (error: any = null): void => {
  // CRITICAL: Capture and clear queue atomically before processing
  const queue = csrfFailedQueue
  csrfFailedQueue = []

  // Nothing to process if queue was already cleared
  if (queue.length === 0) {
    return
  }

  tokenLog(`Processing ${queue.length} queued CSRF requests`, { hasError: !!error })

  queue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      // Retry the request with new CSRF token
      const newToken = getCsrfToken()
      if (newToken && prom.config.headers) {
        prom.config.headers.set('X-CSRF-Token', newToken)
      }
      // Use appropriate client
      if (prom.client === 'noVersion') {
        prom.resolve(apiClientNoVersion(prom.config))
      } else {
        prom.resolve(apiClient(prom.config))
      }
    }
  })
}

/**
 * Process queued requests after token refresh
 *
 * IMPORTANT: We clear the queue BEFORE iterating to prevent double processing.
 * If two calls to processQueue happen concurrently, only the first processes requests.
 */
const processQueue = (error: any = null): void => {
  // CRITICAL: Capture and clear queue atomically before processing
  // This prevents double processing if processQueue is called twice
  const queue = failedQueue
  failedQueue = []

  // Nothing to process if queue was already cleared
  if (queue.length === 0) {
    return
  }

  tokenLog(`Processing ${queue.length} queued requests`, { hasError: !!error })

  queue.forEach((prom) => {
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
/**
 * Internal token refresh implementation
 * This does the actual work - refreshAccessToken() handles deduplication
 *
 * BFF Pattern: Refresh token is in httpOnly cookie, auto-attached with credentials: 'include'
 * We send an empty request body - the backend reads the refresh_token from cookies.
 *
 * Response:
 * - BFF: { expiresIn, refreshedAt } (no tokens in body)
 * - Legacy: { accessToken, refreshToken, expiresIn } (tokens in body)
 */
const performTokenRefresh = async (): Promise<boolean> => {
  // Check for session indicators
  const hasSession = hasActiveSessionIndicator()

  // Also check legacy localStorage tokens for backward compatibility
  const refreshTokenFromStorage = getRefreshToken()
  const refreshTokenFromCookie = getRefreshTokenFromCookie()
  const legacyRefreshToken = refreshTokenFromStorage || refreshTokenFromCookie

  // Enhanced debug: Show all auth sources
  console.log('[TOKEN] 🔍 Token refresh check:', {
    hasActiveSession: hasActiveSession,
    hasSessionIndicators: hasSession,
    memoryExpiresAt: memoryExpiresAt ? new Date(memoryExpiresAt).toISOString() : 'not set',
    hasRefreshTokenInLocalStorage: !!refreshTokenFromStorage,
    hasRefreshTokenInCookie: !!refreshTokenFromCookie,
    hasAccessToken: !!getAccessToken(),
    visibleCookies: document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(Boolean),
  })

  if (!hasSession && !legacyRefreshToken) {
    tokenWarn('No session indicators found - cannot refresh')
    console.error('[TOKEN] ❌ REFRESH BLOCKED - No active session!')
    console.error('[TOKEN] 💡 This usually means:')
    console.error('[TOKEN]    1. User has been fully logged out')
    console.error('[TOKEN]    2. Session expired on backend')
    console.error('[TOKEN]    3. User never completed login')
    return false
  }

  // SECURITY: Never log token content, even partial - prevents token leakage to logs
  tokenLog('Attempting token refresh...', {
    pattern: legacyRefreshToken ? 'Legacy (token in body)' : 'BFF (httpOnly cookie)',
    endpoint: `${API_BASE_URL_NO_VERSION}/auth/refresh`,
  })

  const startTime = Date.now()

  try {
    // BFF Pattern: Send empty body, refresh token is in httpOnly cookie
    // Legacy Pattern: Send refresh token in body for backward compatibility
    // withCredentials: true ensures httpOnly cookies are sent automatically
    const requestBody = legacyRefreshToken ? { refreshToken: legacyRefreshToken } : {}

    const response = await axios.post(
      `${API_BASE_URL_NO_VERSION}/auth/refresh`,
      requestBody,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...(cachedDeviceFingerprint && { 'X-Device-Fingerprint': cachedDeviceFingerprint }),
        },
      }
    )

    const duration = Date.now() - startTime

    // Support both OAuth 2.0 (snake_case) and legacy (camelCase) response format
    // BFF Pattern: No tokens in response, only expiresIn
    // Legacy Pattern: Tokens in response body
    const accessToken = response.data.access_token || response.data.accessToken
    const newRefreshToken = response.data.refresh_token || response.data.refreshToken
    const expiresIn = response.data.expires_in || response.data.expiresIn  // seconds until access token expires
    const refreshedAt = response.data.refreshedAt // BFF pattern indicator

    // Determine which pattern the backend is using
    const isBffResponse = !accessToken && expiresIn !== undefined
    const isLegacyResponse = !!accessToken

    if (isBffResponse) {
      // BFF Pattern: Tokens in httpOnly cookies, only expiresIn in response
      console.log('[TOKEN] ✅ Token refresh SUCCESS (BFF pattern)', {
        duration: `${duration}ms`,
        expiresIn: expiresIn ? `${expiresIn}s (${Math.round(expiresIn / 60)}min)` : 'N/A',
        refreshedAt: refreshedAt,
        nextRefreshAt: expiresIn ? new Date(Date.now() + (expiresIn - 60) * 1000).toISOString() : 'unknown',
        tokensIn: 'httpOnly cookies',
      })
      // Store only expiresIn - tokens are in httpOnly cookies
      storeTokens(null, null, expiresIn)
      return true
    }

    if (isLegacyResponse) {
      // Legacy Pattern: Tokens in response body
      console.log('[TOKEN] ✅ Token refresh SUCCESS (Legacy pattern)', {
        duration: `${duration}ms`,
        hasExpiresIn: !!expiresIn,
        expiresIn: expiresIn ? `${expiresIn}s (${Math.round(expiresIn / 60)}min)` : 'N/A',
        refreshTokenIn: newRefreshToken ? 'response body' : 'httpOnly cookie',
        tokenFormat: response.data.access_token ? 'OAuth 2.0 (snake_case)' : 'Legacy (camelCase)',
        nextRefreshAt: expiresIn ? new Date(Date.now() + (expiresIn - 60) * 1000).toISOString() : 'unknown',
      })
      // Store tokens from response body
      storeTokens(accessToken, newRefreshToken, expiresIn)
      return true
    }

    // Neither pattern matched - check if expiresIn is at least present (minimal BFF response)
    if (expiresIn !== undefined) {
      console.log('[TOKEN] ✅ Token refresh SUCCESS (minimal response)', {
        duration: `${duration}ms`,
        expiresIn: `${expiresIn}s (${Math.round(expiresIn / 60)}min)`,
      })
      storeTokens(null, null, expiresIn)
      return true
    }

    // No useful response - refresh failed
    tokenWarn('Token refresh response has no usable data:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!newRefreshToken,
      hasExpiresIn: expiresIn !== undefined,
      responseKeys: Object.keys(response.data),
    })
    return false
  } catch (error: any) {
    const duration = Date.now() - startTime

    // Enhanced error logging for diagnosis
    console.error('[TOKEN] ❌ Token refresh FAILED', {
      duration: `${duration}ms`,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      errorCode: error?.response?.data?.code,
      errorMessage: error?.response?.data?.message || error?.message,
      endpoint: `${API_BASE_URL_NO_VERSION}/auth/refresh`,
    })

    // Specific guidance based on error type
    if (error?.response?.status === 401) {
      console.error('[TOKEN] 💡 401 Error - Refresh token is invalid or expired')
      console.error('[TOKEN]    → User needs to log in again')
    } else if (error?.response?.status === 400) {
      console.error('[TOKEN] 💡 400 Error - Missing or malformed refresh token')
      console.error('[TOKEN]    → Check if SameSite cookie is blocking the refresh token')
    } else if (error?.response?.status === 403) {
      console.error('[TOKEN] 💡 403 Error - CSRF or security issue')
      console.error('[TOKEN]    → Check CSRF token configuration')
    } else if (!error?.response) {
      console.error('[TOKEN] 💡 Network Error - Could not reach the server')
      console.error('[TOKEN]    → Check CORS, network connectivity, or server status')
    }

    clearTokens('token_refresh_failed')
    return false
  }
}

/**
 * Refresh access token with Promise-based deduplication
 *
 * ENTERPRISE PATTERN: All concurrent refresh requests wait for the same Promise.
 * This prevents race conditions where multiple 401 responses trigger multiple refreshes.
 *
 * IMPORTANT: The assignment to refreshPromise happens SYNCHRONOUSLY before any await.
 * JavaScript is single-threaded, so between the check and assignment, no other code runs.
 *
 * Example:
 * - Request A gets 401, calls refreshAccessToken()
 * - Request A: checks refreshPromise (null), assigns new Promise, then awaits
 * - Request B gets 401, calls refreshAccessToken()
 * - Request B: checks refreshPromise (set by A), returns same Promise
 * - Both A and B wait for the SAME Promise - only ONE network request is made
 */
const refreshAccessToken = async (): Promise<boolean> => {
  // If a refresh is already in progress, return the same promise
  // This is the key to preventing race conditions
  if (refreshPromise) {
    tokenLog('Token refresh already in progress, waiting for existing request...')
    return refreshPromise
  }

  // SYNCHRONOUS: Create and assign promise BEFORE any await
  // This ensures no other call can pass the check above before we assign
  const promise = performTokenRefresh()
  refreshPromise = promise

  try {
    return await promise
  } finally {
    // Clear the promise when done (success or failure)
    // This allows future refresh attempts to start fresh
    refreshPromise = null
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

  // Try cookie first (primary method) - backend uses 'csrfToken' cookie name
  const match = cookies.match(/csrfToken=([^;]+)/)
  if (match && match[1]) {
    cachedCsrfToken = match[1] // Cache it
    return match[1]
  }

  // Try legacy cookie names
  const csrfDashMatch = cookies.match(/csrf-token=([^;]+)/)
  if (csrfDashMatch && csrfDashMatch[1]) {
    cachedCsrfToken = csrfDashMatch[1]
    return csrfDashMatch[1]
  }

  // Try alternative cookie names
  const xsrfMatch = cookies.match(/XSRF-TOKEN=([^;]+)/)
  if (xsrfMatch && xsrfMatch[1]) {
    cachedCsrfToken = xsrfMatch[1]
    return xsrfMatch[1]
  }

  // Fallback to cached token from response headers
  if (cachedCsrfToken) {
    return cachedCsrfToken
  }

  // Log warning once when no token found (for debugging, no sensitive data)
  if (import.meta.env.DEV) {
    const availableCookies = cookies ? cookies.split(';').map(c => c.trim().split('=')[0]).filter(Boolean) : []
    console.warn('[CSRF] No csrf-token found. Available cookies:', availableCookies.join(', '))
  }

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

    // Token is set in cookie automatically by backend
    // Also capture from response body/header as fallback
    const token = response.data?.csrfToken || response.headers['x-csrf-token']
    if (token) {
      cachedCsrfToken = token
      return token
    }

    // Try reading from cookie after the request
    const cookieToken = getCsrfToken()
    if (cookieToken) {
      return cookieToken
    }

    if (import.meta.env.DEV) {
      console.warn('[CSRF] Token refresh completed but no token found')
    }
    return null
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[CSRF] Token refresh failed:', error?.message)
    }
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
    // Check if access token is missing/expired and we have an active session
    // Skip for auth endpoints to avoid loops
    // Note: refreshAccessToken() handles deduplication internally via Promise-based pattern
    const isAuthEndpoint = url.includes('/auth/')
    if (!isAuthEndpoint && needsTokenRefresh()) {
      // BFF Pattern: Check for session indicators (can't read httpOnly cookies)
      // Legacy: Check for visible refresh token
      const hasSession = hasActiveSessionIndicator() || getAnyRefreshToken()
      if (hasSession) {
        tokenLog('Proactive token refresh triggered (noVersion)', {
          reason: 'Access token missing or expired',
          url,
        })

        try {
          // refreshAccessToken() handles deduplication - safe to call concurrently
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            tokenLog('Proactive token refresh succeeded (noVersion)')
          } else {
            tokenWarn('Proactive token refresh failed (noVersion) - request will proceed')
          }
        } catch (error) {
          tokenWarn('Proactive token refresh error (noVersion):', error)
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
        // Use safe toast with custom duration based on retry time
        showErrorToast(
          message,
          `سيتم إعادة المحاولة تلقائياً بعد ${formatRetryAfter(retryAfter)}`
        )
      }

      ;(error as any).retryAfter = retryAfter
    }

    // Handle 401 with minimal logging (no sensitive token data)
    if (error.response?.status === 401) {
      const currentToken = getAccessToken()

      // SECURITY: Only log non-sensitive debug info in development
      if (import.meta.env.DEV) {
        const decoded = currentToken ? decodeJWTForDebug(currentToken) : null
        console.error('[AUTH] 401 Unauthorized:', {
          endpoint: `${method.toUpperCase()} ${url}`,
          errorCode: error.response?.data?.code || error.response?.data?.error?.code,
          hasToken: !!currentToken,
          tokenValid: decoded?.valid ?? false,
          tokenExpired: decoded?.isExpired ?? true,
          userId: decoded?.payload?.userId || decoded?.payload?.sub || 'unknown',
        })
      }
    }

    // Handle 403 Forbidden - Check for email verification or CSRF token errors
    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.code

      // Handle EMAIL_VERIFICATION_REQUIRED - Redirect to email verification page
      if (errorCode === 'EMAIL_VERIFICATION_REQUIRED') {
        const blockedFeature = error.response?.data?.emailVerification?.blockedFeature
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'

        // Build redirect URL with context
        const params = new URLSearchParams({
          returnTo: currentPath,
          ...(blockedFeature && { blockedFeature }),
        })

        // Redirect to email verification page using centralized route constant
        if (typeof window !== 'undefined') {
          window.location.href = `${ROUTES.auth.verifyEmailRequired}?${params.toString()}`
        }

        return Promise.reject({
          status: 403,
          message: error.response?.data?.message || 'يرجى تفعيل بريدك الإلكتروني للوصول إلى هذه الميزة',
          code: 'EMAIL_VERIFICATION_REQUIRED',
          error: true,
          blockedFeature,
        })
      }

      const csrfErrorCode = errorCode
      const csrfErrorMessage = error.response?.data?.message?.toLowerCase() || ''

      // Check for CSRF token errors - retry once with fresh token
      // Handle various CSRF error codes and messages
      const isCsrfError = csrfErrorCode === 'CSRF_TOKEN_INVALID' ||
          csrfErrorCode === 'CSRF_TOKEN_MISSING' ||
          csrfErrorCode === 'CSRF_ORIGIN_INVALID' ||
          csrfErrorCode === 'CSRF_TOKEN_REUSED' ||
          csrfErrorCode === 'CSRF_TOKEN_EXPIRED' ||
          csrfErrorCode?.startsWith('CSRF_') ||
          csrfErrorMessage.includes('csrf') ||
          csrfErrorMessage.includes('token already used')

      if (isCsrfError) {
        // Only retry once per request
        if (!originalRequest._csrfRetry) {
          originalRequest._csrfRetry = true

          // If already refreshing CSRF, queue this request
          // Uses Promise-based deduplication (same pattern as token refresh)
          if (csrfRefreshPromise) {
            return new Promise((resolve, reject) => {
              csrfFailedQueue.push({
                resolve,
                reject,
                config: originalRequest,
                client: 'noVersion'
              })
            })
          }

          // SYNCHRONOUS: Create and assign promise BEFORE any await
          const csrfPromise = (async () => {
            try {
              // Refresh CSRF token
              await refreshCsrfToken()

              // Get the new token
              const newToken = getCsrfToken()
              if (!newToken) {
                return false
              }
              return true
            } catch {
              return false
            }
          })()
          csrfRefreshPromise = csrfPromise

          try {
            const success = await csrfPromise

            if (!success) {
              // CSRF refresh failed - fail cleanly
              const csrfFailError = {
                status: 403,
                message: 'فشل تحديث رمز الأمان | Security token refresh failed',
                code: 'CSRF_REFRESH_FAILED',
                error: true,
                requestId: error.response?.data?.requestId,
              }
              processCsrfQueue(csrfFailError)
              return Promise.reject(csrfFailError)
            }

            // Update original request with new token
            const newToken = getCsrfToken()
            if (originalRequest.headers && newToken) {
              originalRequest.headers.set('X-CSRF-Token', newToken)
            }

            // Process queued requests
            processCsrfQueue()

            // Retry original request
            return apiClientNoVersion(originalRequest)
          } catch (csrfError) {
            if (import.meta.env.DEV) {
              console.error('[CSRF] Token refresh failed (noVersion):', csrfError)
            }
            // Reject all queued requests
            const failError = {
              status: 403,
              message: 'فشل تحديث رمز الأمان | Security token refresh failed',
              code: 'CSRF_REFRESH_FAILED',
              error: true,
              requestId: error.response?.data?.requestId,
            }
            processCsrfQueue(failError)
            return Promise.reject(failError)
          } finally {
            csrfRefreshPromise = null
          }
        }

        // If CSRF retry already attempted, return bilingual error
        return Promise.reject({
          status: 403,
          message: 'رمز الأمان غير صالح. يرجى المحاولة مرة أخرى | Security token invalid. Please try again.',
          code: csrfErrorCode || 'CSRF_ERROR',
          error: true,
          requestId: error.response?.data?.requestId,
        })
      }
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
    // Check if access token is missing/expired and we have an active session
    // Skip for auth endpoints to avoid loops
    // Note: refreshAccessToken() handles deduplication internally via Promise-based pattern
    const isAuthEndpoint = url.includes('/auth/')
    if (!isAuthEndpoint && needsTokenRefresh()) {
      // BFF Pattern: Check for session indicators (can't read httpOnly cookies)
      // Legacy: Check for visible refresh token
      const hasSession = hasActiveSessionIndicator() || getAnyRefreshToken()
      if (hasSession) {
        tokenLog('Proactive token refresh triggered', {
          reason: 'Access token missing or expired',
          url,
        })

        try {
          // refreshAccessToken() handles deduplication - safe to call concurrently
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            tokenLog('Proactive token refresh succeeded')
          } else {
            tokenWarn('Proactive token refresh failed - request will proceed')
          }
        } catch (error) {
          tokenWarn('Proactive token refresh error:', error)
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
    // Guard: Skip retry if originalRequest is undefined (can happen on aborted requests)
    if (
      originalRequest &&
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

      // Use safe toast utility
      showErrorToast(message, `يرجى الانتظار ${remainingTime} دقيقة قبل المحاولة مرة أخرى`)

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
        // Use safe toast utility
        showErrorToast(
          message,
          `سيتم إعادة المحاولة تلقائياً بعد ${formatRetryAfter(retryAfter)}`
        )
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

    // Handle 403 EMAIL_VERIFICATION_REQUIRED - Redirect to email verification page
    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.code

      if (errorCode === 'EMAIL_VERIFICATION_REQUIRED') {
        const blockedFeature = error.response?.data?.emailVerification?.blockedFeature
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'

        // Build redirect URL with context
        const params = new URLSearchParams({
          returnTo: currentPath,
          ...(blockedFeature && { blockedFeature }),
        })

        // Redirect to email verification page using centralized route constant
        if (typeof window !== 'undefined') {
          window.location.href = `${ROUTES.auth.verifyEmailRequired}?${params.toString()}`
        }

        return Promise.reject({
          status: 403,
          message: error.response?.data?.message || 'يرجى تفعيل بريدك الإلكتروني للوصول إلى هذه الميزة',
          code: 'EMAIL_VERIFICATION_REQUIRED',
          error: true,
          blockedFeature,
        })
      }
    }

    // Handle 401 Unauthorized - Token refresh logic
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code
      const reason = error.response?.data?.reason

      // Handle specific session timeout codes (no refresh possible)
      if (errorCode === 'SESSION_IDLE_TIMEOUT' || errorCode === 'SESSION_ABSOLUTE_TIMEOUT') {
        const isIdleTimeout = reason === 'idle_timeout' || errorCode === 'SESSION_IDLE_TIMEOUT'

        // Clear all auth state (clearTokens handles user localStorage too)
        clearTokens(isIdleTimeout ? 'session_idle_timeout' : 'session_absolute_timeout')

        // Use centralized handler for toast + redirect
        handleSessionTimeout(isIdleTimeout)

        return Promise.reject({
          status: 401,
          message: isIdleTimeout
            ? 'انتهت جلستك بسبب عدم النشاط'
            : 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى',
          code: errorCode,
          error: true,
          reason,
        })
      }

      // Don't try to refresh if:
      // 1. Already tried once (_retry flag set)
      // 2. This is a refresh token request itself
      // 3. No session indicators (BFF pattern) and no visible refresh token (legacy)
      const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh')
      const hasSession = hasActiveSessionIndicator() || getAnyRefreshToken()
      if (originalRequest?._retry || isRefreshRequest || !hasSession) {
        // Log and let auth system handle it
        console.warn('[API] 401 Unauthorized (no refresh possible):', {
          url: error.config?.url,
          method: error.config?.method,
          hasSessionIndicators: hasActiveSessionIndicator(),
          hasRefreshTokenLocalStorage: !!getRefreshToken(),
          hasRefreshTokenCookie: !!getRefreshTokenFromCookie(),
          isRetry: !!originalRequest?._retry,
          isRefreshRequest,
          timestamp: new Date().toISOString(),
        })

        // If refresh failed, clear tokens and redirect to sign-in
        if (isRefreshRequest) {
          // clearTokens handles all auth state including user localStorage
          clearTokens('token_refresh_failed')

          // Use centralized handler for toast + redirect
          handleSessionExpired('token_refresh_failed')
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

      // If a refresh is already in progress, queue this request and wait for the refresh to complete
      // refreshPromise is set by refreshAccessToken() and cleared when done
      if (refreshPromise) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      // Start refresh process (refreshAccessToken handles deduplication via Promise)
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

          // clearTokens handles all auth state including user localStorage
          clearTokens('token_refresh_failed')

          // Use centralized handler for toast + redirect
          handleSessionExpired('token_refresh_failed')

          return Promise.reject({
            status: 401,
            message: 'Session expired',
            error: true,
          })
        }
      } catch (refreshError) {
        // Refresh failed - reject all queued requests
        processQueue(refreshError)

        // clearTokens handles all auth state including user localStorage
        clearTokens('token_refresh_error')

        // Use centralized handler for toast + redirect
        handleSessionExpired('token_refresh_failed')

        return Promise.reject({
          status: 401,
          message: 'Token refresh failed',
          error: true,
        })
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
      const csrfErrCode = error.response?.data?.code
      const messageLower = message?.toLowerCase() || ''

      // Check for CSRF token errors - retry once with fresh token
      // Handle various CSRF error codes and messages
      const isCsrfErr = csrfErrCode === 'CSRF_TOKEN_INVALID' ||
          csrfErrCode === 'CSRF_TOKEN_MISSING' ||
          csrfErrCode === 'CSRF_ORIGIN_INVALID' ||
          csrfErrCode === 'CSRF_TOKEN_REUSED' ||
          csrfErrCode === 'CSRF_TOKEN_EXPIRED' ||
          csrfErrCode?.startsWith('CSRF_') ||
          messageLower.includes('csrf') ||
          messageLower.includes('token already used')

      if (isCsrfErr) {
        // Only retry once per request
        if (!originalRequest._csrfRetry) {
          originalRequest._csrfRetry = true

          // If already refreshing CSRF, queue this request
          // Uses Promise-based deduplication (same pattern as token refresh)
          if (csrfRefreshPromise) {
            return new Promise((resolve, reject) => {
              csrfFailedQueue.push({
                resolve,
                reject,
                config: originalRequest,
                client: 'versioned'
              })
            })
          }

          // SYNCHRONOUS: Create and assign promise BEFORE any await
          const csrfPromise = (async () => {
            try {
              await refreshCsrfToken()
              const newToken = getCsrfToken()
              return !!newToken
            } catch {
              return false
            }
          })()
          csrfRefreshPromise = csrfPromise

          try {
            const success = await csrfPromise

            if (!success) {
              // CSRF refresh failed
              const csrfFailErr = {
                status: 403,
                message: 'فشل تحديث رمز الأمان | Security token refresh failed',
                code: 'CSRF_REFRESH_FAILED',
                error: true,
                requestId: error.response?.data?.requestId,
              }
              processCsrfQueue(csrfFailErr)

              // Use centralized handler for toast + redirect
              handleCsrfFailure()

              return Promise.reject(csrfFailErr)
            }

            // Update original request with new token
            const newToken = getCsrfToken()
            if (originalRequest.headers && newToken) {
              originalRequest.headers.set('X-CSRF-Token', newToken)
            }

            // Process queued requests
            processCsrfQueue()

            // Retry original request
            return apiClient(originalRequest)
          } catch (csrfError) {
            if (import.meta.env.DEV) {
              console.error('[CSRF] Token refresh failed:', csrfError)
            }
            // Reject all queued requests
            const failErr = {
              status: 403,
              message: 'فشل تحديث رمز الأمان | Security token refresh failed',
              code: 'CSRF_REFRESH_FAILED',
              error: true,
              requestId: error.response?.data?.requestId,
            }
            processCsrfQueue(failErr)

            // Use centralized handler for toast + redirect
            handleCsrfFailure()

            return Promise.reject(failErr)
          } finally {
            csrfRefreshPromise = null
          }
        }

        // If CSRF retry already attempted, use centralized handler
        handleCsrfFailure()

        return Promise.reject({
          status: 403,
          message: 'رمز الأمان غير صالح | Security token invalid',
          code: csrfErrCode || 'CSRF_ERROR',
          error: true,
          requestId: error.response?.data?.requestId,
        })
      }

      // Check for Arabic permission messages from departed user blocking
      // These messages indicate the user doesn't have permission to access a resource
      if (message?.includes('ليس لديك صلاحية')) {
        // Use safe toast utility
        showErrorToast(
          message,
          'قد تكون صلاحياتك محدودة. تواصل مع إدارة المكتب للمزيد من المعلومات.'
        )
      }
    }

    // Handle 400 Bad Request - Validation errors
    if (error.response?.status === 400) {
      const errors = error.response?.data?.errors
      // Support both nested error object and root-level message
      const errorObj = error.response?.data?.error
      const validationMessage = errorObj?.messageAr || errorObj?.message || error.response?.data?.message

      // Show validation errors as toast messages
      if (errors && Array.isArray(errors)) {
        // Show each validation error
        errors.forEach((err: { field: string; message: string }) => {
          showErrorToast(`${err.field}: ${err.message}`)
        })
      } else if (validationMessage) {
        // Show generic validation message
        showErrorToast(validationMessage)
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
 * Debug helper for browser console
 * Call window.debugAuth() to see current auth state
 *
 * Usage in browser console:
 *   debugAuth()           - Show current auth state
 *   debugAuth.refresh()   - Force a token refresh
 *   debugAuth.clear()     - Clear all tokens (logout)
 */
export const debugAuth = () => {
  const accessToken = getAccessToken()
  const refreshTokenStorage = getRefreshToken()
  const refreshTokenCookie = getRefreshTokenFromCookie()
  const expiresAt = getTokenExpiresAt()
  const hasSession = hasActiveSessionIndicator()

  // Decode access token for info (only if readable - not httpOnly)
  let tokenInfo = null
  if (accessToken) {
    const decoded = decodeJWTForDebug(accessToken)
    if (decoded.valid) {
      const now = Math.floor(Date.now() / 1000)
      tokenInfo = {
        userId: decoded.payload.id || decoded.payload.userId || decoded.payload.sub,
        email: decoded.payload.email,
        role: decoded.payload.role,
        firmId: decoded.payload.firm_id,
        issuedAt: new Date(decoded.payload.iat * 1000).toISOString(),
        expiresAt: new Date(decoded.payload.exp * 1000).toISOString(),
        expiresIn: `${Math.round((decoded.payload.exp - now) / 60)} minutes`,
        isExpired: decoded.isExpired,
      }
    }
  }

  // Determine auth pattern
  const isBffPattern = hasSession && !accessToken
  const isLegacyPattern = !!accessToken
  const pattern = isBffPattern ? 'BFF (httpOnly cookies)' : (isLegacyPattern ? 'Legacy (localStorage)' : 'No session')

  const state = {
    '🔐 Auth State': {
      pattern: pattern,
      hasActiveSession: hasActiveSession,
      hasSessionIndicators: hasSession,
      memoryExpiresAt: memoryExpiresAt ? new Date(memoryExpiresAt).toISOString() : 'not set',
      localStorageExpiresAt: expiresAt ? new Date(expiresAt).toISOString() : 'not set',
      isExpiringSoon: isTokenExpiringSoon(60),
      scheduledRefreshActive: !!tokenRefreshTimeoutId,
    },
    '📦 Legacy Storage (for backward compatibility)': {
      hasAccessToken: !!accessToken,
      hasRefreshTokenInLocalStorage: !!refreshTokenStorage,
      hasRefreshTokenInCookie: !!refreshTokenCookie,
    },
    '👤 Token Info': tokenInfo || (isBffPattern ? 'Token in httpOnly cookie (not readable by JS)' : 'No valid access token'),
    '🍪 Visible Cookies': document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(Boolean),
    '💡 Tips': {
      'Force refresh': 'debugAuth.refresh()',
      'Clear auth state': 'debugAuth.clear()',
      'Watch logs': 'Filter console by [TOKEN]',
      'Note': isBffPattern ? 'Auth tokens in httpOnly cookies - browser sends them automatically' : 'Auth tokens in localStorage',
    },
  }

  console.log('%c🔍 Auth Debug Info', 'font-size: 16px; font-weight: bold; color: #4CAF50')
  console.log('%c📋 Pattern: ' + pattern, 'font-size: 14px; font-weight: bold; color: #2196F3')
  console.table(state['🔐 Auth State'])
  console.log('%c📦 Legacy Storage', 'font-size: 14px; font-weight: bold; color: #607D8B')
  console.table(state['📦 Legacy Storage (for backward compatibility)'])
  console.log('%c👤 Token Info', 'font-size: 14px; font-weight: bold; color: #2196F3')
  console.log(state['👤 Token Info'])
  console.log('%c🍪 Visible Cookies', 'font-size: 14px; font-weight: bold; color: #FF9800')
  console.log(state['🍪 Visible Cookies'])
  console.log('%c💡 Tips', 'font-size: 14px; font-weight: bold; color: #9C27B0')
  console.log(state['💡 Tips'])

  return state
}

// Attach helper methods
debugAuth.refresh = async () => {
  console.log('%c🔄 Forcing token refresh...', 'font-size: 14px; font-weight: bold; color: #FF5722')
  const result = await refreshAccessToken()
  if (result) {
    console.log('%c✅ Token refresh successful!', 'font-size: 14px; font-weight: bold; color: #4CAF50')
  } else {
    console.log('%c❌ Token refresh failed!', 'font-size: 14px; font-weight: bold; color: #F44336')
  }
  return result
}

debugAuth.clear = () => {
  console.log('%c🗑️ Clearing all tokens...', 'font-size: 14px; font-weight: bold; color: #FF5722')
  clearTokens()
  console.log('%c✅ Tokens cleared!', 'font-size: 14px; font-weight: bold; color: #4CAF50')
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth

  // Show debug commands on app load
  console.log(
    '%c🔐 Auth Debug Commands Available',
    'font-size: 14px; font-weight: bold; color: #4CAF50; background: #E8F5E9; padding: 4px 8px; border-radius: 4px;'
  )
  console.log(
    '%c┌─────────────────────────────────────────────────────────┐\n' +
    '│  debugAuth()          → Show current auth state         │\n' +
    '│  debugAuth.refresh()  → Force token refresh             │\n' +
    '│  debugAuth.clear()    → Clear all tokens (logout)       │\n' +
    '└─────────────────────────────────────────────────────────┘',
    'font-family: monospace; color: #1976D2;'
  )
  console.log(
    '%c💡 Filter console by [TOKEN] to see all auth activity',
    'color: #9C27B0; font-style: italic;'
  )

  // ==================== CROSS-TAB LOGOUT SYNC ====================
  /**
   * Listen for storage changes from other tabs
   * When accessToken is removed in another tab, sync logout to this tab
   *
   * ENTERPRISE PATTERN: Multi-tab session sync
   * - User logs out in Tab A
   * - Tab B detects storage change
   * - Tab B redirects to login page
   */
  const handleStorageChange = (event: StorageEvent): void => {
    // Check if access token or expiresAt was removed (logout in another tab)
    // BFF Pattern: Watch for expiresAt removal (since tokens are in httpOnly cookies)
    // Legacy Pattern: Watch for accessToken removal
    const isTokenCleared = event.key === STORAGE_KEYS.AUTH.ACCESS_TOKEN && event.newValue === null && event.oldValue !== null
    const isExpiresAtCleared = event.key === STORAGE_KEYS.AUTH.EXPIRES_AT && event.newValue === null && event.oldValue !== null

    if (isTokenCleared || isExpiresAtCleared) {
      tokenLog('Auth state cleared in another tab - syncing logout', {
        clearedKey: event.key,
      })

      // Clear memory state (BFF pattern)
      memoryExpiresAt = null
      hasActiveSession = false

      // Clear local state
      refreshPromise = null
      failedQueue = []
      csrfRefreshPromise = null
      csrfFailedQueue = []
      cachedCsrfToken = null

      // Cancel any scheduled token refresh
      cancelScheduledTokenRefresh()

      // Emit cross-tab logout event for subscribers
      authEvents.onCrossTabLogout.emit({ sourceTab: 'other' })

      // Use centralized handler for toast + redirect
      handleCrossTabLogout()
    }

    // Also check if auth-storage (Zustand) was cleared
    if (event.key === STORAGE_KEYS.AUTH_STATE.ZUSTAND_PERSIST && event.newValue === null && event.oldValue !== null) {
      tokenLog('Auth storage cleared in another tab - syncing logout')
      // Clear memory state and localStorage if we have any session
      if (hasActiveSession || memoryExpiresAt || getAccessToken()) {
        clearTokens('cross_tab_sync')
      }
    }
  }

  window.addEventListener('storage', handleStorageChange)

  // Export cleanup function for testing/unmount
  ;(window as any).__cleanupAuthStorageListener = () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}

/**
 * Reset all API state (pending requests, circuit breakers, idempotency keys, tokens, scheduled refresh)
 * Call this on logout to ensure clean state
 *
 * ENTERPRISE PATTERN: Comprehensive state reset
 * This function clears ALL auth-related state to ensure no stale data remains:
 * - Memory state (BFF pattern: memoryExpiresAt, hasActiveSession)
 * - Pending requests (cancel and clear)
 * - Circuit breakers (reset all)
 * - Idempotency keys (clear all)
 * - Access/refresh tokens (clear from localStorage)
 * - Token refresh promise (clear)
 * - Failed request queues (clear)
 * - CSRF state (token, queue, flag)
 * - Token refresh event listeners (prevent stale callbacks)
 */
export const resetApiState = () => {
  cancelAllRequests('Logout - clearing state')
  clearPendingRequests()
  resetAllCircuits()
  clearAllIdempotencyKeys()
  clearTokens() // Clears both memory state and localStorage (also cancels scheduled refresh)

  // Reset token refresh state
  refreshPromise = null
  failedQueue = []

  // Reset CSRF refresh state
  csrfRefreshPromise = null
  csrfFailedQueue = []
  cachedCsrfToken = null

  // Clear token refresh event listeners (prevents stale callbacks)
  tokenRefreshEvents.clear()

  tokenLog('All API state reset')
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
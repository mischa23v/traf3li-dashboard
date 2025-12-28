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
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG, getApiUrl, getTimeoutForUrl } from '@/config/api'
import { captureApiCall } from './api-debug'
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
} as const

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
 * Store tokens in localStorage
 */
export const storeTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken)
  localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken)
}

/**
 * Clear tokens from localStorage
 */
export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS)
  localStorage.removeItem(TOKEN_KEYS.REFRESH)
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
 */
const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return false
  }

  try {
    // Use a separate axios instance to avoid interceptor loops
    const response = await axios.post(
      `${API_BASE_URL_NO_VERSION}/auth/refresh`,
      { refreshToken },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...(cachedDeviceFingerprint && { 'X-Device-Fingerprint': cachedDeviceFingerprint }),
        },
      }
    )

    if (response.data.accessToken && response.data.refreshToken) {
      storeTokens(response.data.accessToken, response.data.refreshToken)
      return true
    }

    return false
  } catch {
    // Refresh failed - clear tokens
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

  // Debug logging for CSRF token issues (only log once per session to avoid spam)
  if (!getCsrfToken.hasLoggedWarning) {
    getCsrfToken.hasLoggedWarning = true
    const availableCookies = cookies ? cookies.split(';').map(c => c.trim().split('=')[0]).filter(Boolean) : []
    console.warn('[CSRF] No csrf-token found. Available cookies:', availableCookies,
      '\nCalling refreshCsrfToken() to fetch a fresh token from the backend.')
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
      console.log('[CSRF] Token refreshed successfully')
      return token
    }

    // Try reading from cookie after the request
    const cookieToken = getCsrfToken()
    if (cookieToken) {
      console.log('[CSRF] Token available from cookie after refresh')
      return cookieToken
    }

    console.warn('[CSRF] Token refresh completed but no token found')
    return null
  } catch (error) {
    console.warn('[CSRF] Token refresh failed:', error)
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
  (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toLowerCase()
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = getCsrfToken()
      if (csrfToken) {
        config.headers.set('X-CSRF-Token', csrfToken)
      }
    }

    // Add Authorization header with access token (dual token auth)
    const accessToken = getAccessToken()
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

    const url = config.url || ''

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
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add CSRF token to mutating requests
    const method = config.method?.toLowerCase()
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = getCsrfToken()
      if (csrfToken) {
        config.headers.set('X-CSRF-Token', csrfToken)
      }
    }

    // Add Authorization header with access token (dual token auth)
    const accessToken = getAccessToken()
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

    const url = config.url || ''

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
      // 3. No refresh token available
      const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh')
      if (originalRequest?._retry || isRefreshRequest || !getRefreshToken()) {
        // Log and let auth system handle it
        console.warn('[API] 401 Unauthorized (no refresh possible):', {
          url: error.config?.url,
          method: error.config?.method,
          hasRefreshToken: !!getRefreshToken(),
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
 * Reset all API state (pending requests, circuit breakers, idempotency keys, tokens)
 * Call this on logout to ensure clean state
 */
export const resetApiState = () => {
  cancelAllRequests('Logout - clearing state')
  clearPendingRequests()
  resetAllCircuits()
  clearAllIdempotencyKeys()
  clearTokens() // Clear access and refresh tokens
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
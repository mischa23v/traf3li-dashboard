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
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG, getApiUrl } from '@/config/api'
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

// Cache for GET requests (simple in-memory cache)
const requestCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

/**
 * Extract CSRF token from cookies
 * The token is set by the backend as an HttpOnly cookie
 */
const getCsrfToken = (): string => {
  const match = document.cookie.match(/csrf-token=([^;]+)/)
  return match ? match[1] : ''
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

// Routes that should bypass circuit breaker (critical auth flows)
const CIRCUIT_BREAKER_BYPASS_ROUTES = ['/auth/login', '/auth/logout', '/auth/me', '/auth/otp']

/**
 * Check if a URL should bypass circuit breaker
 */
const shouldBypassCircuitBreaker = (url: string): boolean => {
  return CIRCUIT_BREAKER_BYPASS_ROUTES.some(route => url.includes(route))
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

    const url = config.url || ''

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
    // Record success for circuit breaker (skip auth routes)
    if (!shouldBypassCircuitBreaker(url)) {
      recordSuccess(url)
    }
    return response
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as any
    const url = originalRequest?.url || ''

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

    return Promise.reject({
      status: error.response?.status || 500,
      message: errorMessage,
      code: errorCode,
      error: true,
      requestId: error.response?.data?.meta?.requestId || error.response?.data?.requestId,
      errors: error.response?.data?.errors,
      retryAfter: (error as any).retryAfter,
    })
  }
)

/**
 * Request Interceptor
 * Adds caching, deduplication, circuit breaker, and CSRF token handling
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

    const url = config.url || ''

    // Circuit Breaker Check - reject if circuit is open
    const circuitCheck = shouldAllowRequest(url)
    if (!circuitCheck.allowed) {
      const error = new Error(`Circuit breaker open for ${url}`) as any
      error.code = 'CIRCUIT_OPEN'
      error.retryAfter = circuitCheck.retryAfter
      return Promise.reject(error)
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

    // Check cache for GET requests
    if (config.method === 'get' && config.url) {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`
      const cached = requestCache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // Return cached data
        config.adapter = () => Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK (Cached)',
          headers: {},
          config,
        } as any)
      }
    }

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
 * Handles caching, session warnings, errors, circuit breaker, and retry logic
 */
apiClient.interceptors.response.use(
  (response) => {
    const url = response.config.url || ''

    // Record success for circuit breaker
    recordSuccess(url)

    // Cache GET responses
    if (response.config.method === 'get' && response.config.url) {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      })
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

    // Record failure for circuit breaker (only for server errors and rate limits)
    if (error.response?.status && (error.response.status >= 500 || error.response.status === 429)) {
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

    // Handle 401 Unauthorized - Check for session timeout codes
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code
      const reason = error.response?.data?.reason

      // Handle specific session timeout codes
      if (errorCode === 'SESSION_IDLE_TIMEOUT' || errorCode === 'SESSION_ABSOLUTE_TIMEOUT') {
        const isIdleTimeout = reason === 'idle_timeout' || errorCode === 'SESSION_IDLE_TIMEOUT'
        const message = isIdleTimeout
          ? 'انتهت جلستك بسبب عدم النشاط'
          : 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى'

        // Clear auth state
        localStorage.removeItem('user')

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

      // Log other 401s but don't redirect - let auth system handle it
      console.warn('[API] 401 Unauthorized:', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.response?.data?.message,
        timestamp: new Date().toISOString(),
      })
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

      // Check for CSRF token errors - reload page to get new token
      if (errorCode === 'CSRF_TOKEN_INVALID' || errorCode === 'CSRF_TOKEN_MISSING') {
        import('sonner').then(({ toast }) => {
          toast.error('انتهت صلاحية الجلسة', {
            description: 'جارٍ إعادة تحميل الصفحة...',
            duration: 2000,
          })
        })

        // Reload page after a short delay to get new CSRF token
        setTimeout(() => {
          window.location.reload()
        }, 2000)

        return Promise.reject({
          status: 403,
          message: 'CSRF token invalid',
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
 * Clear request cache
 */
export const clearCache = (urlPattern?: string) => {
  if (urlPattern) {
    // Clear specific URLs matching pattern
    Array.from(requestCache.keys()).forEach(key => {
      if (key.includes(urlPattern)) {
        requestCache.delete(key)
      }
    })
  } else {
    // Clear all cache
    requestCache.clear()
  }
}

/**
 * Get cache size
 */
export const getCacheSize = () => {
  return requestCache.size
}

/**
 * Reset all rate limiting state (cache, pending requests, circuit breakers)
 * Call this on logout to ensure clean state
 */
export const resetApiState = () => {
  clearCache()
  clearPendingRequests()
  resetAllCircuits()
}

// Re-export circuit breaker utilities for monitoring
export { getOpenCircuits, getCircuitStatus } from './circuit-breaker'
export { getPendingRequestCount } from './request-deduplication'

// Alias export for compatibility with services that import 'api'
export const api = apiClient

export default apiClient
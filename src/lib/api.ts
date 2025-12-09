/**
 * API Client Configuration
 * Axios instance configured to communicate with Traf3li backend
 * Handles authentication, credentials, and error responses
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG, getApiUrl } from '@/config/api'

// API Base URL - Change based on environment
const API_BASE_URL = getApiUrl()

// Non-versioned API base URL (for routes that don't use /v1)
const API_BASE_URL_NO_VERSION = `${API_CONFIG.baseUrl}/api`

// Export the base URL for use in other components (e.g., file downloads)
export const API_URL = API_BASE_URL
export const API_URL_NO_VERSION = API_BASE_URL_NO_VERSION
export const API_DOMAIN = API_CONFIG.baseUrl

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

// Apply same interceptors to non-versioned client
apiClientNoVersion.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const method = config.method?.toLowerCase()
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = getCsrfToken()
      if (csrfToken) {
        config.headers.set('X-CSRF-Token', csrfToken)
      }
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

apiClientNoVersion.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/sign-in')) {
        window.location.href = '/sign-in'
      }
    }
    return Promise.reject({
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'حدث خطأ غير متوقع',
      error: true,
      requestId: error.response?.data?.requestId,
      errors: error.response?.data?.errors,
    })
  }
)

/**
 * Request Interceptor
 * Adds caching for GET requests, CSRF token for mutating requests, and logging
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

    // Check cache for GET requests
    if (config.method === 'get' && config.url) {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`
      const cached = requestCache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // Return cached data
        if (import.meta.env.DEV) {
        }
        // Abort request and use cached data
        config.adapter = () => Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK (Cached)',
          headers: {},
          config,
        } as any)
      }
    }

    // Log requests in development
    if (import.meta.env.DEV) {
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor
 * Handles caching, errors, and retry logic
 */
apiClient.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get' && response.config.url) {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      })
    }

    // Log successful responses in development
    if (import.meta.env.DEV) {
    }
    return response
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as any

    // Error handling is done by the calling code

    // Retry logic for network errors or 5xx errors
    if (
      !originalRequest._retry &&
      (!error.response || (error.response.status >= 500 && error.response.status < 600))
    ) {
      originalRequest._retry = true
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1

      // Max retries with exponential backoff
      if (originalRequest._retryCount <= API_CONFIG.retryAttempts) {
        const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount - 1), 4000)

        if (import.meta.env.DEV) {
        }

        await new Promise(resolve => setTimeout(resolve, delay))
        return apiClient(originalRequest)
      }
    }

    // Handle 429 Rate Limited
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] || '60', 10)
      const message = error.response?.data?.message || `طلبات كثيرة جداً. يرجى الانتظار ${formatRetryAfter(retryAfter)}.`

      // Import toast dynamically to avoid circular dependencies
      import('sonner').then(({ toast }) => {
        toast.error(message, {
          description: 'حاول مرة أخرى لاحقاً',
          duration: 5000,
        })
      })

      return Promise.reject({
        status: 429,
        message,
        error: true,
        requestId: error.response?.data?.requestId,
        retryAfter,
      })
    }

    // Handle 401 Unauthorized - User needs to login
    if (error.response?.status === 401) {
      // Clear any stored auth state
      localStorage.removeItem('user')

      // Redirect to sign-in page if not already there
      if (!window.location.pathname.includes('/sign-in')) {
        window.location.href = '/sign-in'
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
      const message = error.response?.data?.message

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
    return Promise.reject({
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'حدث خطأ غير متوقع',
      error: true,
      requestId: error.response?.data?.requestId,
      errors: error.response?.data?.errors, // Validation errors array
    })
  }
)

/**
 * API Error Type
 */
export interface ApiError {
  status: number
  message: string
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

// Alias export for compatibility with services that import 'api'
export const api = apiClient

export default apiClient
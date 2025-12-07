/**
 * API Client Configuration
 * Axios instance configured to communicate with Traf3li backend
 * Handles authentication, credentials, and error responses
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

// API Base URL - Change based on environment
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://api.traf3li.com/api'

// Export the base URL for use in other components (e.g., file downloads)
export const API_URL = API_BASE_URL
export const API_DOMAIN = API_BASE_URL.replace('/api', '')

// Cache for GET requests (simple in-memory cache)
const requestCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

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
  },
  timeout: 15000, // 15 seconds (reduced from 30)
})

/**
 * Request Interceptor
 * Adds caching for GET requests and logging
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check cache for GET requests
    if (config.method === 'get' && config.url) {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`
      const cached = requestCache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // Return cached data
        if (import.meta.env.DEV) {
          console.log(`📦 Cache Hit: ${config.url}`)
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
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error)
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
      console.log(`✅ API Response: ${response.config.url}`)
    }
    return response
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as any

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data // Log full data to see validation errors
      })
    }

    // Retry logic for network errors or 5xx errors
    if (
      !originalRequest._retry &&
      (!error.response || (error.response.status >= 500 && error.response.status < 600))
    ) {
      originalRequest._retry = true
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1

      // Max 2 retries with exponential backoff
      if (originalRequest._retryCount <= 2) {
        const delay = Math.min(1000 * Math.pow(2, originalRequest._retryCount - 1), 4000)

        if (import.meta.env.DEV) {
          console.log(`🔄 Retrying request (${originalRequest._retryCount}/2) after ${delay}ms`)
        }

        await new Promise(resolve => setTimeout(resolve, delay))
        return apiClient(originalRequest)
      }
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

    // Handle 403 Forbidden - Permission denied (including departed users)
    if (error.response?.status === 403) {
      const message = error.response?.data?.message

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

    // Handle CORS errors specifically
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      return Promise.reject({
        status: 0,
        message: 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
        error: true,
      })
    }

    // Return formatted error
    return Promise.reject({
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'حدث خطأ غير متوقع',
      error: true,
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
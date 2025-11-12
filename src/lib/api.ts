/**
 * API Client Configuration
 * Axios instance configured to communicate with Traf3li backend
 * Handles authentication, credentials, and error responses
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// API Base URL - Change based on environment
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://traf3li-backend.onrender.com'

/**
 * Main API client instance
 * Configured with credentials for HttpOnly cookie handling
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Critical: Allows HttpOnly cookies to be sent
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

/**
 * Request Interceptor
 * Adds any additional headers or logging before request is sent
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
 * Handles errors and extracts data from successful responses
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.url}`, response.data)
    }
    return response
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
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

export default apiClient
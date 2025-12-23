/**
 * Centralized API Error Handler
 * Handles all API response errors with appropriate user feedback
 * NCA ECC 2-1-2 compliant
 */

import { ERROR_CODES } from '@/constants/errorCodes'

export interface ApiError {
  error: boolean
  message: string
  messageEn?: string
  code?: string
  reason?: string
  loggedOut?: boolean
  retryAfter?: number
  attemptsRemaining?: number
  remainingTime?: number
  errors?: Record<string, string>
}

export interface ErrorHandlerResult {
  handled: boolean
  shouldRedirect: boolean
  redirectTo?: string
  retryAfter?: number
  attemptsRemaining?: number
}

/**
 * Clear all local authentication state
 * Note: Tokens are stored in httpOnly cookies and managed by the backend
 */
export function clearLocalAuthState(): void {
  localStorage.removeItem('user')
  sessionStorage.removeItem('user')
}

/**
 * Handle 401 Unauthorized errors
 */
function handle401Error(
  data: ApiError,
  navigate: (path: string) => void,
  showToast: (type: 'error' | 'warning' | 'info', message: string, options?: any) => void
): ErrorHandlerResult {
  const code = data.code

  // If server explicitly logged us out, clear local state
  if (data.loggedOut) {
    clearLocalAuthState()
  }

  switch (code) {
    case ERROR_CODES.SESSION_IDLE_TIMEOUT:
      showToast('warning', data.messageEn || 'Session expired due to inactivity. Please log in again.', {
        duration: 5000,
      })
      navigate('/sign-in?reason=idle_timeout')
      return { handled: true, shouldRedirect: true, redirectTo: '/sign-in?reason=idle_timeout' }

    case ERROR_CODES.SESSION_ABSOLUTE_TIMEOUT:
      showToast('warning', data.messageEn || 'Session expired. Please log in again.', {
        duration: 5000,
      })
      navigate('/sign-in?reason=session_expired')
      return { handled: true, shouldRedirect: true, redirectTo: '/sign-in?reason=session_expired' }

    case ERROR_CODES.TOKEN_EXPIRED:
      navigate('/sign-in?reason=token_expired')
      return { handled: true, shouldRedirect: true, redirectTo: '/sign-in?reason=token_expired' }

    case ERROR_CODES.INVALID_TOKEN:
      clearLocalAuthState()
      navigate('/sign-in')
      return { handled: true, shouldRedirect: true, redirectTo: '/sign-in' }

    default:
      // Generic 401 - let calling code decide
      return { handled: false, shouldRedirect: false }
  }
}

/**
 * Handle 423 Account Locked errors
 */
function handle423Error(
  data: ApiError,
  showToast: (type: 'error' | 'warning' | 'info', message: string, options?: any) => void
): ErrorHandlerResult {
  const remainingTime = data.remainingTime || 15
  showToast('error', data.messageEn || `Account temporarily locked. Try again in ${remainingTime} minutes.`, {
    duration: 10000,
  })
  return { handled: true, shouldRedirect: false }
}

/**
 * Handle 429 Rate Limited errors
 */
function handle429Error(
  data: ApiError,
  showToast: (type: 'error' | 'warning' | 'info', message: string, options?: any) => void
): ErrorHandlerResult {
  const retryAfter = data.retryAfter || 60
  const attemptsRemaining = data.attemptsRemaining

  let message = data.messageEn || 'Too many requests. Please wait before trying again.'

  if (attemptsRemaining !== undefined && attemptsRemaining > 0) {
    message = `${attemptsRemaining} login attempts remaining.`
  }

  showToast('warning', message, { duration: 5000 })

  return {
    handled: true,
    shouldRedirect: false,
    retryAfter,
    attemptsRemaining
  }
}

/**
 * Handle generic errors
 */
function handleGenericError(
  data: ApiError,
  showToast: (type: 'error' | 'warning' | 'info', message: string, options?: any) => void
): ErrorHandlerResult {
  showToast('error', data.messageEn || data.message || 'An error occurred')
  return { handled: true, shouldRedirect: false }
}

/**
 * Main API error handler
 * @param error - The error response from the API
 * @param navigate - Navigation function to redirect user
 * @param showToast - Toast notification function
 * @returns ErrorHandlerResult with handling status and any action data
 */
export function handleApiError(
  error: any,
  navigate: (path: string) => void,
  showToast: (type: 'error' | 'warning' | 'info', message: string, options?: any) => void
): ErrorHandlerResult {
  const response = error.response || error
  const status = response?.status || error?.status
  const data: ApiError = response?.data || error || {}

  switch (status) {
    case 401:
      return handle401Error(data, navigate, showToast)
    case 423:
      return handle423Error(data, showToast)
    case 429:
      return handle429Error(data, showToast)
    default:
      return handleGenericError(data, showToast)
  }
}

/**
 * Extract error message from API response
 */
export function getErrorMessage(error: any): string {
  if (error?.messageEn) return error.messageEn
  if (error?.message) return error.message
  if (error?.response?.data?.messageEn) return error.response.data.messageEn
  if (error?.response?.data?.message) return error.response.data.message
  return 'An unexpected error occurred'
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.message === 'Network Error' ||
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED' ||
    !error?.response
  )
}

/**
 * Check if error is retriable
 */
export function isRetriableError(error: any): boolean {
  const status = error?.response?.status || error?.status
  // 429 (rate limit), 502, 503, 504 are retriable
  return status === 429 || status === 502 || status === 503 || status === 504 || isNetworkError(error)
}

export default handleApiError

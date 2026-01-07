/**
 * Password Management Service
 * Handles password reset, change, and strength validation
 */

import { apiClientNoVersion, handleApiError, getAccessToken } from '@/lib/api'

const authApi = apiClientNoVersion

// ==================== DEBUG LOGGING ====================
const DEBUG_PASSWORD = true // Set to true to enable password change debugging

const debugLog = (message: string, data?: any) => {
  if (!DEBUG_PASSWORD) return
  console.log(
    `%c[PASSWORD DEBUG] ${message}`,
    'background: #9333ea; color: white; padding: 2px 6px; border-radius: 3px;',
    data !== undefined ? data : ''
  )
}

const debugWarn = (message: string, data?: any) => {
  if (!DEBUG_PASSWORD) return
  console.warn(
    `%c[PASSWORD DEBUG] ⚠️ ${message}`,
    'background: #f59e0b; color: black; padding: 2px 6px; border-radius: 3px;',
    data !== undefined ? data : ''
  )
}

const debugError = (message: string, data?: any) => {
  if (!DEBUG_PASSWORD) return
  console.error(
    `%c[PASSWORD DEBUG] ❌ ${message}`,
    'background: #ef4444; color: white; padding: 2px 6px; border-radius: 3px;',
    data !== undefined ? data : ''
  )
}

/**
 * Decode JWT to check its state (without verification)
 */
const decodeToken = (token: string | null): { valid: boolean; payload: any; isExpired: boolean; expiresIn: string } => {
  if (!token) {
    return { valid: false, payload: null, isExpired: true, expiresIn: 'N/A' }
  }
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { valid: false, payload: null, isExpired: true, expiresIn: 'N/A' }
    }
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    const isExpired = payload.exp ? payload.exp < now : false
    const expiresIn = payload.exp ? `${Math.round((payload.exp - now) / 60)} minutes` : 'unknown'
    return { valid: true, payload, isExpired, expiresIn }
  } catch {
    return { valid: false, payload: null, isExpired: true, expiresIn: 'N/A' }
  }
}

/**
 * Log full auth state for debugging
 */
const logAuthState = () => {
  const accessToken = getAccessToken()
  const refreshToken = localStorage.getItem('refreshToken')
  const tokenExpiresAt = localStorage.getItem('tokenExpiresAt')
  const csrfToken = document.cookie.match(/csrfToken=([^;]+)/)?.[1] ||
                   document.cookie.match(/csrf-token=([^;]+)/)?.[1] ||
                   document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1]

  const accessDecoded = decodeToken(accessToken)
  const refreshDecoded = decodeToken(refreshToken)

  console.group('%c🔐 AUTH STATE FOR PASSWORD CHANGE', 'background: #1e40af; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;')

  console.log('%cAccess Token:', 'font-weight: bold;')
  console.log('  Present:', !!accessToken)
  console.log('  Valid JWT:', accessDecoded.valid)
  console.log('  Expired:', accessDecoded.isExpired)
  console.log('  Expires In:', accessDecoded.expiresIn)
  if (accessDecoded.payload) {
    console.log('  User ID:', accessDecoded.payload.userId || accessDecoded.payload.sub)
    console.log('  Issued At:', accessDecoded.payload.iat ? new Date(accessDecoded.payload.iat * 1000).toISOString() : 'N/A')
  }

  console.log('%cRefresh Token:', 'font-weight: bold;')
  console.log('  Present:', !!refreshToken)
  console.log('  Valid JWT:', refreshDecoded.valid)
  console.log('  Expired:', refreshDecoded.isExpired)
  console.log('  Expires In:', refreshDecoded.expiresIn)

  console.log('%cCSRF Token:', 'font-weight: bold;')
  console.log('  Present:', !!csrfToken)
  console.log('  Value:', csrfToken ? `${csrfToken.substring(0, 10)}...` : 'MISSING!')

  console.log('%cToken Expiry (localStorage):', 'font-weight: bold;')
  console.log('  tokenExpiresAt:', tokenExpiresAt)
  if (tokenExpiresAt) {
    const expiryDate = new Date(parseInt(tokenExpiresAt))
    const now = new Date()
    console.log('  Expiry Date:', expiryDate.toISOString())
    console.log('  Time Until Expiry:', Math.round((expiryDate.getTime() - now.getTime()) / 60000), 'minutes')
  }

  console.log('%cAll Cookies:', 'font-weight: bold;')
  console.log('  ', document.cookie || '(no cookies)')

  console.groupEnd()

  return {
    hasAccessToken: !!accessToken,
    accessTokenValid: accessDecoded.valid && !accessDecoded.isExpired,
    hasRefreshToken: !!refreshToken,
    refreshTokenValid: refreshDecoded.valid && !refreshDecoded.isExpired,
    hasCsrfToken: !!csrfToken,
    accessPayload: accessDecoded.payload,
  }
}

/**
 * Password Strength Level
 */
export type PasswordStrengthLevel =
  | 'very_weak'
  | 'weak'
  | 'medium'
  | 'strong'
  | 'very_strong'

/**
 * Password Strength Result
 */
export interface PasswordStrength {
  score: number // 0-100
  level: PasswordStrengthLevel
  label: string
  labelAr: string
  color: string
  feedback: string[]
  feedbackAr: string[]
}

/**
 * Password Status
 */
export interface PasswordStatus {
  hasPassword: boolean
  lastChangedAt?: Date
  expiresAt?: Date
  isExpired: boolean
  mustChange: boolean
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
}

/**
 * Password Service Object
 */
const passwordService = {
  /**
   * Request password reset email
   *
   * @param params - Forgot password parameters
   * @param params.email - User email
   * @param params.captchaToken - CAPTCHA token (required by backend)
   * @param params.captchaProvider - CAPTCHA provider (default: 'turnstile')
   */
  forgotPassword: async (params: {
    email: string
    captchaToken?: string
    captchaProvider?: string
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.post<{
        success: boolean
        message: string
      }>('/auth/forgot-password', {
        email: params.email,
        captchaToken: params.captchaToken,
        captchaProvider: params.captchaToken ? (params.captchaProvider || 'turnstile') : undefined,
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reset password with token from email
   *
   * @param token - Reset token from email
   * @param newPassword - New password
   */
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.post<{
        success: boolean
        message: string
      }>('/auth/reset-password', {
        token,
        newPassword,
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Change password (requires authentication)
   *
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    console.log('')
    console.log('%c════════════════════════════════════════════════════════════════', 'color: #9333ea;')
    console.log('%c🔑 PASSWORD CHANGE REQUEST STARTING', 'background: #9333ea; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 14px;')
    console.log('%c════════════════════════════════════════════════════════════════', 'color: #9333ea;')

    // Log auth state BEFORE the request
    debugLog('Checking auth state before request...')
    const authState = logAuthState()

    // Warn about potential issues
    if (!authState.hasAccessToken) {
      debugError('NO ACCESS TOKEN! Request will likely fail with 401')
    }
    if (!authState.accessTokenValid) {
      debugWarn('Access token is INVALID or EXPIRED! This may cause 401')
    }
    if (!authState.hasCsrfToken) {
      debugWarn('NO CSRF TOKEN! This may cause 403 CSRF error')
    }

    // Log what we're sending
    debugLog('Request payload:', {
      endpoint: '/auth/change-password',
      method: 'POST',
      currentPasswordLength: currentPassword.length,
      newPasswordLength: newPassword.length,
      newPasswordStrength: passwordService.checkStrength(newPassword).level,
    })

    try {
      debugLog('Sending request...')
      const startTime = Date.now()

      const response = await authApi.post<{
        success: boolean
        message: string
      }>('/auth/change-password', {
        currentPassword,
        newPassword,
      })

      const duration = Date.now() - startTime
      debugLog(`✅ SUCCESS! Response received in ${duration}ms`, response.data)

      console.log('%c════════════════════════════════════════════════════════════════', 'color: #22c55e;')
      console.log('%c✅ PASSWORD CHANGE SUCCESSFUL', 'background: #22c55e; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;')
      console.log('%c════════════════════════════════════════════════════════════════', 'color: #22c55e;')

      return response.data
    } catch (error: any) {
      const duration = Date.now()

      console.log('')
      console.log('%c════════════════════════════════════════════════════════════════', 'color: #ef4444;')
      console.log('%c❌ PASSWORD CHANGE FAILED', 'background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 14px;')
      console.log('%c════════════════════════════════════════════════════════════════', 'color: #ef4444;')

      // Extract detailed error info
      const status = error?.response?.status
      const statusText = error?.response?.statusText
      const responseData = error?.response?.data
      const headers = error?.response?.headers
      const requestHeaders = error?.config?.headers

      console.group('%c📋 ERROR DETAILS', 'font-weight: bold; color: #ef4444;')

      console.log('%cHTTP Status:', 'font-weight: bold;', status, statusText)
      console.log('%cError Message:', 'font-weight: bold;', error.message)

      console.log('%cResponse Data:', 'font-weight: bold;')
      console.log(responseData)

      if (status === 401) {
        console.log('')
        console.log('%c🔍 401 UNAUTHORIZED ANALYSIS:', 'font-weight: bold; color: #f59e0b; font-size: 13px;')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        const errorCode = responseData?.code || responseData?.error?.code
        const errorMessage = responseData?.message || responseData?.error?.message

        if (errorMessage?.includes('Recent authentication required')) {
          console.log('%c⚠️ CAUSE: Backend requires RECENT authentication', 'color: #f59e0b; font-weight: bold;')
          console.log('')
          console.log('This means:')
          console.log('  1. Your login session is too old for sensitive operations')
          console.log('  2. Backend has a "recent auth" check (e.g., last 5-15 minutes)')
          console.log('  3. You need to RE-LOGIN before changing password')
          console.log('')
          console.log('%cPOSSIBLE SOLUTIONS:', 'font-weight: bold;')
          console.log('  A) Log out and log back in, then try again immediately')
          console.log('  B) Backend needs to implement a "re-authenticate" modal')
          console.log('  C) Check if backend has authTime/lastAuth timestamp check')
          console.log('')
          console.log('%cBACKEND CHECK:', 'font-weight: bold;')
          console.log('  Look for code like: if (now - authTime > X minutes) throw 401')
          console.log('  The backend is checking when you LAST authenticated')
        } else if (errorMessage?.includes('expired')) {
          console.log('%c⚠️ CAUSE: Token has EXPIRED', 'color: #f59e0b; font-weight: bold;')
          console.log('Token refresh may have failed or token was not refreshed in time')
        } else if (errorMessage?.includes('invalid')) {
          console.log('%c⚠️ CAUSE: Token is INVALID', 'color: #f59e0b; font-weight: bold;')
          console.log('The token signature or format is wrong')
        } else {
          console.log('%c⚠️ CAUSE: Unknown 401 reason', 'color: #f59e0b; font-weight: bold;')
          console.log('Error code:', errorCode)
          console.log('Error message:', errorMessage)
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      }

      console.log('%cRequest Headers Sent:', 'font-weight: bold;')
      console.log({
        Authorization: requestHeaders?.Authorization ? `Bearer ${requestHeaders.Authorization.substring(7, 20)}...` : 'MISSING!',
        'X-CSRF-Token': requestHeaders?.['X-CSRF-Token'] ? `${requestHeaders['X-CSRF-Token'].substring(0, 10)}...` : 'MISSING!',
        'Content-Type': requestHeaders?.['Content-Type'],
      })

      console.log('%cResponse Headers:', 'font-weight: bold;')
      if (headers) {
        console.log({
          'x-request-id': headers['x-request-id'],
          'x-csrf-token': headers['x-csrf-token'],
          'www-authenticate': headers['www-authenticate'],
        })
      }

      console.groupEnd()

      // Re-log auth state after failure to see if anything changed
      debugLog('Re-checking auth state after failure...')
      logAuthState()

      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get password status and requirements
   * Note: Endpoint is /auth/password-status (hyphen, not slash)
   */
  getStatus: async (): Promise<PasswordStatus> => {
    try {
      const response = await authApi.get<{
        hasPassword: boolean
        lastChangedAt?: string
        expiresAt?: string
        isExpired: boolean
        mustChange: boolean
        requirements: {
          minLength: number
          requireUppercase: boolean
          requireLowercase: boolean
          requireNumbers: boolean
          requireSpecialChars: boolean
        }
      }>('/auth/password-status')

      return {
        hasPassword: response.data.hasPassword,
        lastChangedAt: response.data.lastChangedAt
          ? new Date(response.data.lastChangedAt)
          : undefined,
        expiresAt: response.data.expiresAt
          ? new Date(response.data.expiresAt)
          : undefined,
        isExpired: response.data.isExpired,
        mustChange: response.data.mustChange,
        ...response.data.requirements,
      }
    } catch (error: any) {
      // Return default requirements if endpoint doesn't exist
      return {
        hasPassword: true,
        isExpired: false,
        mustChange: false,
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      }
    }
  },

  /**
   * Validate password reset token
   *
   * @param token - Reset token to validate
   */
  validateResetToken: async (
    token: string
  ): Promise<{ valid: boolean; email?: string }> => {
    try {
      const response = await authApi.get<{
        valid: boolean
        email?: string
      }>('/auth/reset-password/validate', {
        params: { token },
      })
      return response.data
    } catch {
      return { valid: false }
    }
  },

  /**
   * Check password strength
   * Client-side calculation with backend validation
   *
   * @param password - Password to check
   */
  checkStrength: (password: string): PasswordStrength => {
    if (!password) {
      return {
        score: 0,
        level: 'very_weak',
        label: 'Very Weak',
        labelAr: 'ضعيفة جداً',
        color: '#ff4444',
        feedback: ['Password is required'],
        feedbackAr: ['كلمة المرور مطلوبة'],
      }
    }

    let score = 0
    const feedback: string[] = []
    const feedbackAr: string[] = []

    // Length checks
    if (password.length >= 8) score += 20
    else {
      feedback.push('Use at least 8 characters')
      feedbackAr.push('استخدم 8 أحرف على الأقل')
    }
    if (password.length >= 12) score += 10
    if (password.length >= 16) score += 10

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 15
    else {
      feedback.push('Add uppercase letters')
      feedbackAr.push('أضف أحرف كبيرة')
    }

    // Lowercase check
    if (/[a-z]/.test(password)) score += 15
    else {
      feedback.push('Add lowercase letters')
      feedbackAr.push('أضف أحرف صغيرة')
    }

    // Number check
    if (/\d/.test(password)) score += 15
    else {
      feedback.push('Add numbers')
      feedbackAr.push('أضف أرقام')
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15
    else {
      feedback.push('Add special characters (!@#$%^&*)')
      feedbackAr.push('أضف رموز خاصة (!@#$%^&*)')
    }

    // Common patterns penalty
    const commonPatterns = [
      /^123/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /111111/,
      /letmein/i,
    ]
    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        score = Math.max(0, score - 20)
        feedback.push('Avoid common patterns')
        feedbackAr.push('تجنب الأنماط الشائعة')
        break
      }
    }

    // Determine level and labels
    let level: PasswordStrengthLevel
    let label: string
    let labelAr: string
    let color: string

    if (score < 20) {
      level = 'very_weak'
      label = 'Very Weak'
      labelAr = 'ضعيفة جداً'
      color = '#ff4444'
    } else if (score < 40) {
      level = 'weak'
      label = 'Weak'
      labelAr = 'ضعيفة'
      color = '#ff8800'
    } else if (score < 60) {
      level = 'medium'
      label = 'Medium'
      labelAr = 'متوسطة'
      color = '#ffcc00'
    } else if (score < 80) {
      level = 'strong'
      label = 'Strong'
      labelAr = 'قوية'
      color = '#88cc00'
    } else {
      level = 'very_strong'
      label = 'Very Strong'
      labelAr = 'قوية جداً'
      color = '#00cc44'
    }

    return {
      score: Math.min(100, score),
      level,
      label,
      labelAr,
      color,
      feedback,
      feedbackAr,
    }
  },

  /**
   * Check if password was breached (uses backend HaveIBeenPwned check)
   *
   * @param password - Password to check
   */
  checkBreached: async (
    password: string
  ): Promise<{ breached: boolean; count?: number }> => {
    try {
      const response = await authApi.post<{
        breached: boolean
        count?: number
      }>('/auth/password/check-breach', { password })
      return response.data
    } catch {
      // Default to not breached if check fails
      return { breached: false }
    }
  },
}

export default passwordService

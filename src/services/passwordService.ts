/**
 * Password Management Service
 * Handles password reset, change, and strength validation
 */

import { apiClientNoVersion, handleApiError } from '@/lib/api'

const authApi = apiClientNoVersion

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
        password: newPassword,
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
    try {
      const response = await authApi.post<{
        success: boolean
        message: string
      }>('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get password status and requirements
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
      }>('/auth/password/status')

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

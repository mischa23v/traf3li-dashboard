/**
 * Anonymous/Guest Authentication Service
 * Handles guest sessions and account conversion
 *
 * Anonymous users can:
 * - Browse public content
 * - Add items to cart (e-commerce)
 * - Try features before signing up
 *
 * Data is preserved when converting to a full account
 */

import { apiClientNoVersion, handleApiError, storeTokens } from '@/lib/api'
import type { User } from './authService'

const authApi = apiClientNoVersion

/**
 * Anonymous User (Guest)
 */
export interface AnonymousUser extends User {
  isAnonymous: true
  expiresAt: Date
  canConvert: boolean
}

/**
 * Account Conversion Data
 */
export interface ConvertAccountData {
  email: string
  password: string
  username?: string
  firstName?: string
  lastName?: string
  phone?: string
}

/**
 * Anonymous Auth Response
 */
interface AnonymousAuthResponse {
  error: boolean
  message: string
  user?: User
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
}

/**
 * Anonymous Auth Service Object
 */
const anonymousAuthService = {
  /**
   * Create anonymous/guest session
   * Returns a temporary user that can be converted later
   */
  loginAsGuest: async (): Promise<AnonymousUser> => {
    try {
      const response = await authApi.post<AnonymousAuthResponse>(
        '/auth/anonymous'
      )

      if (response.data.error || !response.data.user) {
        throw new Error(
          response.data.message || 'فشل إنشاء جلسة الضيف'
        )
      }

      // Store tokens if provided - supports both OAuth 2.0 (snake_case) and legacy (camelCase)
      const accessToken = (response.data as any).access_token || response.data.accessToken
      const refreshToken = (response.data as any).refresh_token || response.data.refreshToken
      const expiresIn = (response.data as any).expires_in // seconds until access token expires

      if (accessToken && refreshToken) {
        storeTokens(accessToken, refreshToken, expiresIn)
      }

      const user = response.data.user as AnonymousUser
      user.isAnonymous = true
      user.expiresAt = response.data.expiresAt
        ? new Date(response.data.expiresAt)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
      user.canConvert = true

      // Store user in localStorage with anonymous flag
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('isAnonymous', 'true')

      return user
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Convert anonymous account to full account
   * Preserves all data associated with the anonymous session
   *
   * @param data - Registration data for conversion
   */
  convertToFullAccount: async (
    data: ConvertAccountData
  ): Promise<User> => {
    try {
      const response = await authApi.post<{
        error: boolean
        message: string
        user?: User
        accessToken?: string
        refreshToken?: string
      }>('/auth/anonymous/convert', data)

      if (response.data.error || !response.data.user) {
        throw new Error(
          response.data.message || 'فشل تحويل الحساب'
        )
      }

      // Store new tokens if provided - supports both OAuth 2.0 (snake_case) and legacy (camelCase)
      const accessToken = (response.data as any).access_token || response.data.accessToken
      const refreshToken = (response.data as any).refresh_token || response.data.refreshToken
      const expiresIn = (response.data as any).expires_in // seconds until access token expires

      if (accessToken && refreshToken) {
        storeTokens(accessToken, refreshToken, expiresIn)
      }

      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user))
      localStorage.removeItem('isAnonymous')

      return response.data.user
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if current user is anonymous
   */
  isAnonymous: (): boolean => {
    const isAnonymousFlag = localStorage.getItem('isAnonymous')
    if (isAnonymousFlag === 'true') {
      return true
    }

    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.isAnonymous === true
      }
    } catch {
      // Ignore parse errors
    }

    return false
  },

  /**
   * Get anonymous session expiration
   */
  getExpiresAt: (): Date | null => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.isAnonymous && user.expiresAt) {
          return new Date(user.expiresAt)
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null
  },

  /**
   * Get days remaining for anonymous session
   */
  getDaysRemaining: (): number | null => {
    const expiresAt = anonymousAuthService.getExpiresAt()
    if (!expiresAt) return null

    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
  },

  /**
   * Check if anonymous session is about to expire
   *
   * @param warningDays - Number of days before expiry to warn (default: 7)
   */
  isAboutToExpire: (warningDays: number = 7): boolean => {
    const daysRemaining = anonymousAuthService.getDaysRemaining()
    if (daysRemaining === null) return false
    return daysRemaining <= warningDays
  },

  /**
   * Extend anonymous session
   * Requests more time before data is deleted
   */
  extendSession: async (): Promise<{ newExpiresAt: Date }> => {
    try {
      const response = await authApi.post<{ expiresAt: string }>(
        '/auth/anonymous/extend'
      )

      const newExpiresAt = new Date(response.data.expiresAt)

      // Update localStorage
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          user.expiresAt = newExpiresAt.toISOString()
          localStorage.setItem('user', JSON.stringify(user))
        }
      } catch {
        // Ignore parse errors
      }

      return { newExpiresAt }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete anonymous session and all associated data
   * Use when guest doesn't want to convert
   */
  deleteSession: async (): Promise<void> => {
    try {
      await authApi.delete('/auth/anonymous')

      // Clear localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('isAnonymous')
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default anonymousAuthService

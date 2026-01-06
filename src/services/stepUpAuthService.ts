/**
 * Step-Up Authentication Service
 * Handles reauthentication for sensitive operations
 *
 * Step-up authentication is required for:
 * - Changing password
 * - Disabling MFA
 * - Deleting account
 * - Viewing sensitive data
 * - Financial transactions above threshold
 */

import { apiClientNoVersion, handleApiError } from '@/lib/api'

const authApi = apiClientNoVersion

/**
 * Reauthentication Methods
 */
export type ReauthMethod = 'password' | 'totp' | 'email' | 'sms'

/**
 * Reauthentication Status
 */
export interface ReauthStatus {
  isRecent: boolean
  lastAuthAt: Date | null
  expiresAt: Date | null
  requiredFor: string[]
}

/**
 * Reauthentication Challenge Response
 */
export interface ReauthChallenge {
  success: boolean
  expiresIn: number
  message: string
}

/**
 * Step-Up Auth Service Object
 */
const stepUpAuthService = {
  /**
   * Check reauthentication status
   * Returns whether user has recently authenticated
   */
  checkStatus: async (): Promise<ReauthStatus> => {
    try {
      const response = await authApi.get<{
        isRecent: boolean
        lastAuthAt?: string
        expiresAt?: string
        requiredFor?: string[]
      }>('/auth/reauthenticate/status')

      return {
        isRecent: response.data.isRecent,
        lastAuthAt: response.data.lastAuthAt
          ? new Date(response.data.lastAuthAt)
          : null,
        expiresAt: response.data.expiresAt
          ? new Date(response.data.expiresAt)
          : null,
        requiredFor: response.data.requiredFor || [],
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reauthenticate with password
   *
   * @param password - Current password
   */
  withPassword: async (password: string): Promise<{ success: boolean }> => {
    try {
      const response = await authApi.post<{ success: boolean; message: string }>(
        '/auth/reauthenticate',
        {
          method: 'password',
          password,
        }
      )
      return { success: response.data.success }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reauthenticate with TOTP code
   *
   * @param totpCode - 6-digit TOTP code
   */
  withTOTP: async (totpCode: string): Promise<{ success: boolean }> => {
    try {
      const response = await authApi.post<{ success: boolean; message: string }>(
        '/auth/reauthenticate',
        {
          method: 'totp',
          totpCode,
        }
      )
      return { success: response.data.success }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Request OTP for reauthentication
   * Sends code via email or SMS
   *
   * @param method - 'email' or 'sms'
   * @param purpose - Purpose of reauthentication (for audit)
   */
  requestChallenge: async (
    method: 'email' | 'sms' = 'email',
    purpose?: string
  ): Promise<ReauthChallenge> => {
    try {
      const response = await authApi.post<ReauthChallenge>(
        '/auth/reauthenticate/challenge',
        {
          method,
          purpose,
        }
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify OTP for reauthentication
   *
   * @param code - OTP code received via email/SMS
   */
  verifyChallenge: async (code: string): Promise<{ success: boolean }> => {
    try {
      const response = await authApi.post<{ success: boolean; message: string }>(
        '/auth/reauthenticate/verify',
        { code }
      )
      return { success: response.data.success }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if reauthentication is required for an action
   *
   * @param action - Action to check
   */
  isRequiredFor: async (action: string): Promise<boolean> => {
    try {
      const status = await stepUpAuthService.checkStatus()

      // If recently authenticated, no need for reauthentication
      if (status.isRecent) {
        return false
      }

      // Check if action requires reauthentication
      return status.requiredFor.includes(action)
    } catch {
      // Default to requiring reauthentication on error
      return true
    }
  },

  /**
   * Get available reauthentication methods for current user
   */
  getAvailableMethods: async (): Promise<ReauthMethod[]> => {
    try {
      const response = await authApi.get<{ methods: ReauthMethod[] }>(
        '/auth/reauthenticate/methods'
      )
      return response.data.methods
    } catch {
      // Default to password only
      return ['password']
    }
  },
}

export default stepUpAuthService

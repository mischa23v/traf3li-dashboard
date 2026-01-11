/**
 * MFA (Multi-Factor Authentication) Service
 * Handles MFA setup, verification, and management
 *
 * Supports:
 * - TOTP (Authenticator apps like Google Authenticator, Authy)
 * - Backup codes
 * - WebAuthn (passkeys) - future
 */

import { apiClientNoVersion, handleApiError, storeTokens } from '@/lib/api'
import type { User } from './authService'

const authApi = apiClientNoVersion

/**
 * MFA Method Types
 */
export type MFAMethod = 'totp' | 'backup_code' | 'webauthn' | 'sms' | 'email'

/**
 * MFA Status Response
 */
export interface MFAStatus {
  enabled: boolean
  methods: MFAMethod[]
  backupCodesCount: number
  lastUsedAt?: string
}

/**
 * TOTP Setup Response
 */
export interface TOTPSetupResponse {
  qrCode: string // Base64 QR code image
  secret: string // Manual entry secret
  backupCodes: string[] // Array of backup codes
}

/**
 * MFA Verification Response
 */
interface MFAVerifyResponse {
  error: boolean
  message: string
  user?: User
  accessToken?: string
  refreshToken?: string
  csrfToken?: string
}

/**
 * MFA Service Object
 */
const mfaService = {
  /**
   * Get MFA status for current user
   */
  getStatus: async (): Promise<MFAStatus> => {
    try {
      const response = await authApi.get<MFAStatus>('/auth/mfa/status')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Start TOTP setup - generates QR code and secret
   */
  setupTOTP: async (): Promise<TOTPSetupResponse> => {
    try {
      const response = await authApi.post<TOTPSetupResponse>('/auth/mfa/setup')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify TOTP setup with a code from authenticator app
   * Completes the MFA setup process
   *
   * @param token - 6-digit TOTP code (backend expects 'token' field per contract)
   */
  verifySetup: async (token: string): Promise<{ success: boolean }> => {
    try {
      const response = await authApi.post<{ success: boolean; message: string }>(
        '/auth/mfa/verify-setup',
        { token }
      )
      return { success: response.data.success }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify MFA code during login
   * Called after successful password login when MFA is enabled
   *
   * @param userId - User ID from login response
   * @param token - MFA token/code (backend expects 'token' field per contract)
   * @param method - MFA method being used
   */
  verify: async (
    userId: string,
    token: string,
    method: MFAMethod = 'totp'
  ): Promise<User> => {
    try {
      const response = await authApi.post<MFAVerifyResponse>(
        '/auth/mfa/verify',
        {
          userId,
          token,
          method,
        }
      )

      if (response.data.error || !response.data.user) {
        throw new Error(response.data.message || 'فشل التحقق من رمز المصادقة')
      }

      // Store tokens/session - supports both patterns:
      // 1. BFF Pattern: Tokens in httpOnly cookies, only expiresIn in response
      // 2. Legacy Pattern: Tokens in response body (OAuth 2.0 or camelCase)
      const accessToken = (response.data as any).access_token || response.data.accessToken
      const refreshToken = (response.data as any).refresh_token || response.data.refreshToken
      const expiresIn = (response.data as any).expires_in || (response.data as any).expiresIn // seconds until access token expires

      // Determine which pattern the backend is using
      const isBffPattern = !accessToken && expiresIn !== undefined
      const isLegacyPattern = !!accessToken

      if (isBffPattern) {
        // BFF Pattern: Tokens in httpOnly cookies, only track expiresIn
        storeTokens(null, null, expiresIn)
      } else if (isLegacyPattern) {
        // Legacy Pattern: Tokens in response body
        storeTokens(accessToken, refreshToken, expiresIn)
      }
      // If neither pattern matches, session may still be valid via httpOnly cookies

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return response.data.user
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Disable MFA for current user
   * Requires password confirmation for security
   *
   * @param password - Current password for confirmation
   */
  disable: async (password: string): Promise<{ success: boolean }> => {
    try {
      const response = await authApi.post<{ success: boolean; message: string }>(
        '/auth/mfa/disable',
        { password }
      )
      return { success: response.data.success }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Generate backup codes
   * Invalidates all previous backup codes
   * POST /api/auth/mfa/backup-codes/generate
   */
  regenerateBackupCodes: async (): Promise<{ backupCodes: string[]; remainingCodes: number }> => {
    try {
      const response = await authApi.post<{
        error?: boolean
        message?: string
        codes?: string[]
        backupCodes?: string[]
        remainingCodes?: number
      }>('/auth/mfa/backup-codes/generate')

      // Backend may return 'codes' or 'backupCodes'
      const codes = response.data.codes || response.data.backupCodes || []
      return {
        backupCodes: codes,
        remainingCodes: response.data.remainingCodes || codes.length,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get remaining backup codes count
   * GET /api/auth/mfa/backup-codes/count
   */
  getBackupCodesCount: async (): Promise<number> => {
    try {
      // Try dedicated endpoint first
      const response = await authApi.get<{
        error?: boolean
        remainingCodes: number
      }>('/auth/mfa/backup-codes/count')
      return response.data.remainingCodes
    } catch {
      // Fallback to status endpoint
      try {
        const status = await mfaService.getStatus()
        return status.backupCodesCount
      } catch {
        return 0
      }
    }
  },

  /**
   * Send MFA code via SMS
   * For users who have SMS MFA enabled
   */
  sendSMSCode: async (): Promise<{ success: boolean; expiresIn: number }> => {
    try {
      const response = await authApi.post<{
        success: boolean
        expiresIn: number
      }>('/auth/mfa/sms/send')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send MFA code via Email
   * For users who have Email MFA enabled
   */
  sendEmailCode: async (): Promise<{ success: boolean; expiresIn: number }> => {
    try {
      const response = await authApi.post<{
        success: boolean
        expiresIn: number
      }>('/auth/mfa/email/send')
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if MFA is required for a specific action
   *
   * @param action - The action to check (e.g., 'change_password', 'delete_account')
   */
  isRequiredForAction: async (action: string): Promise<boolean> => {
    try {
      const response = await authApi.get<{ required: boolean }>(
        '/auth/mfa/required',
        { params: { action } }
      )
      return response.data.required
    } catch {
      // Default to not required if check fails
      return false
    }
  },
}

export default mfaService

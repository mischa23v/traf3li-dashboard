/**
 * MFA API Service
 * Integrates with backend MFA endpoints (NCA ECC 2-1-3)
 */

import { apiClient } from '@/lib/api'
import { setMFASession, clearMFASession } from '@/lib/mfa-enforcement'

/**
 * MFA setup response with QR code
 */
export interface MFASetupResponse {
  success: boolean
  data: {
    secret: string
    qrCode: string // Base64 or data URL
    backupCodes: string[]
    expiresAt: string // Setup must be completed before this
  }
}

/**
 * MFA verification response
 */
export interface MFAVerifyResponse {
  success: boolean
  data: {
    verified: boolean
    mfaEnabled: boolean
    method: 'totp' | 'sms' | 'email'
  }
}

/**
 * MFA status response
 */
export interface MFAStatusResponse {
  success: boolean
  data: {
    enabled: boolean
    method: 'totp' | 'sms' | 'email' | null
    setupRequired: boolean
    gracePeriodEndsAt: string | null
    lastVerifiedAt: string | null
  }
}

/**
 * Initiate MFA setup - generates secret and QR code
 */
export async function setupMFA(method: 'totp' | 'sms' | 'email' = 'totp'): Promise<MFASetupResponse> {
  const response = await apiClient.post('/auth/mfa/setup', { method })
  return response.data
}

/**
 * Verify MFA code during setup (enables MFA)
 */
export async function verifyMFASetup(code: string): Promise<MFAVerifyResponse> {
  const response = await apiClient.post('/auth/mfa/verify', { code })

  if (response.data.success && response.data.data.verified) {
    // Set MFA session on successful verification
    setMFASession(response.data.data.method)
  }

  return response.data
}

/**
 * Verify MFA code for protected action
 */
export async function verifyMFA(code: string, action?: string): Promise<MFAVerifyResponse> {
  const response = await apiClient.post('/auth/mfa/challenge', { code, action })

  if (response.data.success && response.data.data.verified) {
    // Extend MFA session on successful verification
    setMFASession(response.data.data.method)
  }

  return response.data
}

/**
 * Get current MFA status
 */
export async function getMFAStatus(): Promise<MFAStatusResponse> {
  const response = await apiClient.get('/auth/mfa/status')
  return response.data
}

/**
 * Disable MFA (requires current MFA code)
 */
export async function disableMFA(code: string, password: string): Promise<{
  success: boolean
  message: string
}> {
  const response = await apiClient.delete('/auth/mfa', {
    data: { code, password }
  })

  if (response.data.success) {
    clearMFASession()
  }

  return response.data
}

/**
 * Request SMS/Email MFA code
 */
export async function requestMFACode(method: 'sms' | 'email'): Promise<{
  success: boolean
  message: string
  expiresIn: number // seconds
}> {
  const response = await apiClient.post('/auth/mfa/send-code', { method })
  return response.data
}

/**
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(code: string): Promise<{
  success: boolean
  data: {
    backupCodes: string[]
  }
}> {
  const response = await apiClient.post('/auth/mfa/backup-codes', { code })
  return response.data
}

/**
 * Verify using backup code (one-time use)
 */
export async function verifyBackupCode(backupCode: string): Promise<MFAVerifyResponse> {
  const response = await apiClient.post('/auth/mfa/verify-backup', { backupCode })

  if (response.data.success && response.data.data.verified) {
    setMFASession('totp') // Backup codes are for TOTP
  }

  return response.data
}

/**
 * Check if MFA is required for the current user
 * Returns details about MFA requirement status
 */
export async function checkMFARequirement(): Promise<{
  required: boolean
  enabled: boolean
  inGracePeriod: boolean
  gracePeriodDaysRemaining: number
  message: string
}> {
  try {
    const status = await getMFAStatus()

    return {
      required: status.data.setupRequired,
      enabled: status.data.enabled,
      inGracePeriod: status.data.gracePeriodEndsAt !== null &&
                     new Date(status.data.gracePeriodEndsAt) > new Date(),
      gracePeriodDaysRemaining: status.data.gracePeriodEndsAt
        ? Math.ceil((new Date(status.data.gracePeriodEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        : 0,
      message: status.data.setupRequired && !status.data.enabled
        ? 'يجب تفعيل المصادقة الثنائية للمتابعة'
        : status.data.enabled
          ? 'المصادقة الثنائية مفعلة'
          : 'المصادقة الثنائية غير مفعلة',
    }
  } catch (error: any) {
    // Handle MFA_REQUIRED error from backend
    if (error.code === 'MFA_REQUIRED') {
      return {
        required: true,
        enabled: false,
        inGracePeriod: false,
        gracePeriodDaysRemaining: 0,
        message: 'يجب تفعيل المصادقة الثنائية للمتابعة',
      }
    }
    throw error
  }
}

/**
 * Handle MFA-related API errors
 * Returns true if error was handled, false otherwise
 */
export function handleMFAError(error: any): {
  handled: boolean
  action?: 'setup' | 'verify'
  message?: string
} {
  if (error.status === 403) {
    if (error.code === 'MFA_REQUIRED') {
      return {
        handled: true,
        action: 'setup',
        message: 'يجب تفعيل المصادقة الثنائية لدورك',
      }
    }

    if (error.code === 'MFA_VERIFICATION_REQUIRED') {
      return {
        handled: true,
        action: 'verify',
        message: 'يرجى إدخال رمز المصادقة الثنائية للمتابعة',
      }
    }
  }

  return { handled: false }
}

export default {
  setupMFA,
  verifyMFASetup,
  verifyMFA,
  getMFAStatus,
  disableMFA,
  requestMFACode,
  regenerateBackupCodes,
  verifyBackupCode,
  checkMFARequirement,
  handleMFAError,
}

/**
 * MFA API Service
 * Integrates with backend MFA endpoints (NCA ECC 2-1-3)
 *
 * Backend base: /api/auth/mfa/*
 * Auth: JWT in httpOnly cookies
 * Only TOTP supported (no SMS/email)
 */

import { apiClientNoVersion } from '@/lib/api'
import { setMFASession, clearMFASession } from '@/lib/mfa-enforcement'

// ============================================================================
// Response Types (matching backend exactly)
// ============================================================================

/**
 * MFA setup response - QR code and manual key
 */
export interface MFASetupResponse {
  error: boolean
  message: string
  messageEn: string
  qrCode: string // data:image/png;base64,...
  setupKey: string // Manual entry key
  instructions: {
    ar: string
    en: string
  }
}

/**
 * MFA verify setup response - enables MFA and returns backup codes
 */
export interface MFAVerifySetupResponse {
  error: boolean
  messageEn?: string
  enabled: boolean
  backupCodes: string[] // ["ABCD-1234", ...]
  backupCodesWarning: {
    ar: string
    en: string
  }
}

/**
 * MFA verify response - for login verification
 */
export interface MFAVerifyResponse {
  error: boolean
  valid: boolean
  message?: string
  messageEn?: string
}

/**
 * MFA status response
 */
export interface MFAStatusResponse {
  error: boolean
  mfaEnabled: boolean
  hasTOTP: boolean
  hasBackupCodes: boolean
  remainingCodes: number
}

/**
 * MFA disable response
 */
export interface MFADisableResponse {
  error: boolean
  messageEn?: string
  disabled: boolean
}

/**
 * Backup codes verify response
 */
export interface BackupCodeVerifyResponse {
  error: boolean
  valid: boolean
  remainingCodes: number
  warning: string | null
}

/**
 * Backup codes regenerate response
 */
export interface BackupCodesRegenerateResponse {
  error: boolean
  codes: string[]
  remainingCodes: number
  totalCodes: number
}

/**
 * Backup codes count response
 */
export interface BackupCodesCountResponse {
  error: boolean
  remainingCodes: number
  warning: string | null
}

/**
 * MFA error response
 */
export interface MFAErrorResponse {
  error: true
  message: string
  messageEn: string
  code: string // INVALID_TOKEN, MFA_REQUIRED, etc.
  remainingCodes?: number
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Start MFA setup - generates QR code and setup key
 * POST /api/auth/mfa/setup (no body required)
 */
export async function setupMFA(): Promise<MFASetupResponse> {
  const response = await apiClientNoVersion.post('/auth/mfa/setup')
  return response.data
}

/**
 * Complete MFA setup - submit 6-digit code to enable MFA
 * POST /api/auth/mfa/verify-setup
 */
export async function verifyMFASetup(token: string): Promise<MFAVerifySetupResponse> {
  const response = await apiClientNoVersion.post('/auth/mfa/verify-setup', { token })

  if (!response.data.error && response.data.enabled) {
    // Set MFA session on successful setup
    setMFASession('totp')
  }

  return response.data
}

/**
 * Verify MFA code during login
 * POST /api/auth/mfa/verify
 */
export async function verifyMFA(userId: string, token: string): Promise<MFAVerifyResponse> {
  const response = await apiClientNoVersion.post('/auth/mfa/verify', { userId, token })

  if (!response.data.error && response.data.valid) {
    // Set MFA session on successful verification
    setMFASession('totp')
  }

  return response.data
}

/**
 * Get current MFA status
 * GET /api/auth/mfa/status
 */
export async function getMFAStatus(): Promise<MFAStatusResponse> {
  const response = await apiClientNoVersion.get('/auth/mfa/status')
  return response.data
}

/**
 * Disable MFA (requires password only, NOT code)
 * POST /api/auth/mfa/disable
 */
export async function disableMFA(password: string): Promise<MFADisableResponse> {
  const response = await apiClientNoVersion.post('/auth/mfa/disable', { password })

  if (!response.data.error && response.data.disabled) {
    clearMFASession()
  }

  return response.data
}

/**
 * Verify using backup code for login
 * POST /api/auth/mfa/backup-codes/verify
 */
export async function verifyBackupCode(userId: string, code: string): Promise<BackupCodeVerifyResponse> {
  const response = await apiClientNoVersion.post('/auth/mfa/backup-codes/verify', { userId, code })

  if (!response.data.error && response.data.valid) {
    setMFASession('totp')
  }

  return response.data
}

/**
 * Regenerate backup codes (invalidates old ones)
 * POST /api/auth/mfa/backup-codes/regenerate (no body)
 */
export async function regenerateBackupCodes(): Promise<BackupCodesRegenerateResponse> {
  const response = await apiClientNoVersion.post('/auth/mfa/backup-codes/regenerate')
  return response.data
}

/**
 * Get remaining backup codes count
 * GET /api/auth/mfa/backup-codes/count
 */
export async function getBackupCodesCount(): Promise<BackupCodesCountResponse> {
  const response = await apiClientNoVersion.get('/auth/mfa/backup-codes/count')
  return response.data
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if MFA is required for the current user
 * Uses the status endpoint to determine requirement
 */
export async function checkMFARequirement(): Promise<{
  required: boolean
  enabled: boolean
  hasBackupCodes: boolean
  remainingCodes: number
  message: string
}> {
  try {
    const status = await getMFAStatus()

    return {
      required: !status.mfaEnabled, // If not enabled, it may be required
      enabled: status.mfaEnabled,
      hasBackupCodes: status.hasBackupCodes,
      remainingCodes: status.remainingCodes,
      message: status.mfaEnabled
        ? 'المصادقة الثنائية مفعلة'
        : 'المصادقة الثنائية غير مفعلة',
    }
  } catch (error: any) {
    // Handle MFA_REQUIRED error from backend
    if (error.response?.data?.code === 'MFA_REQUIRED') {
      return {
        required: true,
        enabled: false,
        hasBackupCodes: false,
        remainingCodes: 0,
        message: 'يجب تفعيل المصادقة الثنائية للمتابعة',
      }
    }
    throw error
  }
}

/**
 * Handle MFA-related API errors
 * Returns info about what action to take
 */
export function handleMFAError(error: any): {
  handled: boolean
  action?: 'setup' | 'verify'
  message?: string
  code?: string
} {
  const errorCode = error.response?.data?.code || error.code
  const status = error.response?.status || error.status

  if (status === 403) {
    if (errorCode === 'MFA_REQUIRED') {
      return {
        handled: true,
        action: 'setup',
        message: 'يجب تفعيل المصادقة الثنائية لدورك',
        code: errorCode,
      }
    }

    if (errorCode === 'MFA_VERIFICATION_REQUIRED' || errorCode === 'MFA_VERIFICATION_EXPIRED') {
      return {
        handled: true,
        action: 'verify',
        message: 'يرجى إدخال رمز المصادقة الثنائية للمتابعة',
        code: errorCode,
      }
    }
  }

  if (status === 401 && errorCode === 'INVALID_TOKEN') {
    return {
      handled: true,
      action: 'verify',
      message: 'رمز المصادقة غير صحيح',
      code: errorCode,
    }
  }

  if (status === 429) {
    return {
      handled: true,
      message: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً',
      code: errorCode,
    }
  }

  return { handled: false }
}

// ============================================================================
// Exports
// ============================================================================

export default {
  setupMFA,
  verifyMFASetup,
  verifyMFA,
  getMFAStatus,
  disableMFA,
  verifyBackupCode,
  regenerateBackupCodes,
  getBackupCodesCount,
  checkMFARequirement,
  handleMFAError,
}

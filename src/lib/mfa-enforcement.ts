/**
 * MFA Enforcement Configuration
 * NCA ECC 2-1-3 Compliant - Multi-Factor Authentication
 */

import type { FirmRole } from '@/lib/rbac'

/**
 * Roles that MUST have MFA enabled
 * These roles have access to sensitive financial/admin functions
 */
export const MFA_REQUIRED_ROLES: FirmRole[] = [
  'owner',
  'admin',
  'partner',
  'accountant',
]

/**
 * Roles where MFA is recommended but not mandatory
 */
export const MFA_RECOMMENDED_ROLES: FirmRole[] = [
  'lawyer',
  'paralegal',
]

/**
 * Roles exempt from MFA (limited access)
 */
export const MFA_EXEMPT_ROLES: FirmRole[] = [
  'secretary',
  'departed',
]

/**
 * Actions that require MFA verification even if already authenticated
 * These are high-risk operations that need additional confirmation
 */
export const MFA_PROTECTED_ACTIONS = [
  // Financial operations
  'payment.create',
  'payment.approve',
  'payment.delete',
  'invoice.delete',
  'expense.approve',
  'refund.create',
  'bank_transfer.create',

  // User management
  'user.create',
  'user.delete',
  'user.role_change',
  'user.password_reset',

  // Security settings
  'security.mfa_disable',
  'security.password_change',
  'security.api_key_create',

  // Data operations
  'data.export_all',
  'data.delete_bulk',
  'data.backup_download',

  // Admin operations
  'admin.settings_change',
  'admin.billing_update',
  'admin.subscription_cancel',
] as const

export type MFAProtectedAction = typeof MFA_PROTECTED_ACTIONS[number]

/**
 * MFA verification session duration (in minutes)
 */
export const MFA_SESSION_DURATION = 15 // 15 minutes

/**
 * Grace period for new users to set up MFA (in days)
 */
export const MFA_SETUP_GRACE_PERIOD = 7 // 7 days

/**
 * MFA session state
 */
interface MFASession {
  verifiedAt: string
  expiresAt: string
  method: 'otp' | 'totp' | 'sms' | 'email'
  deviceFingerprint?: string
}

const MFA_SESSION_KEY = 'mfa_session'

/**
 * Check if a role requires MFA
 */
export function isMFARequired(role: FirmRole): boolean {
  return MFA_REQUIRED_ROLES.includes(role)
}

/**
 * Check if a role is recommended to have MFA
 */
export function isMFARecommended(role: FirmRole): boolean {
  return MFA_RECOMMENDED_ROLES.includes(role)
}

/**
 * Check if an action requires MFA verification
 */
export function isActionMFAProtected(action: string): boolean {
  return MFA_PROTECTED_ACTIONS.includes(action as MFAProtectedAction)
}

/**
 * Get MFA session
 */
function getMFASession(): MFASession | null {
  try {
    const stored = sessionStorage.getItem(MFA_SESSION_KEY)
    if (!stored) return null

    const session = JSON.parse(stored) as MFASession

    // Check if session has expired
    if (new Date(session.expiresAt) < new Date()) {
      clearMFASession()
      return null
    }

    return session
  } catch {
    return null
  }
}

/**
 * Save MFA session after successful verification
 */
export function setMFASession(
  method: MFASession['method'],
  deviceFingerprint?: string
): void {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + MFA_SESSION_DURATION * 60 * 1000)

  const session: MFASession = {
    verifiedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    method,
    deviceFingerprint,
  }

  try {
    sessionStorage.setItem(MFA_SESSION_KEY, JSON.stringify(session))
  } catch {
    // Storage unavailable
  }
}

/**
 * Clear MFA session (on logout or expiry)
 */
export function clearMFASession(): void {
  try {
    sessionStorage.removeItem(MFA_SESSION_KEY)
  } catch {
    // Ignore errors
  }
}

/**
 * Check if MFA session is valid
 */
export function hasMFASession(): boolean {
  return getMFASession() !== null
}

/**
 * Get remaining MFA session time in seconds
 */
export function getMFASessionRemaining(): number {
  const session = getMFASession()
  if (!session) return 0

  const remaining = new Date(session.expiresAt).getTime() - Date.now()
  return Math.max(0, Math.floor(remaining / 1000))
}

/**
 * Extend MFA session (on activity)
 */
export function extendMFASession(): void {
  const session = getMFASession()
  if (!session) return

  const now = new Date()
  const expiresAt = new Date(now.getTime() + MFA_SESSION_DURATION * 60 * 1000)

  session.expiresAt = expiresAt.toISOString()

  try {
    sessionStorage.setItem(MFA_SESSION_KEY, JSON.stringify(session))
  } catch {
    // Storage unavailable
  }
}

/**
 * Check if user is within MFA setup grace period
 */
export function isInMFAGracePeriod(userCreatedAt: string | Date): boolean {
  const createdAt = new Date(userCreatedAt)
  const graceEndDate = new Date(
    createdAt.getTime() + MFA_SETUP_GRACE_PERIOD * 24 * 60 * 60 * 1000
  )

  return new Date() < graceEndDate
}

/**
 * Get days remaining in MFA grace period
 */
export function getMFAGracePeriodRemaining(userCreatedAt: string | Date): number {
  const createdAt = new Date(userCreatedAt)
  const graceEndDate = new Date(
    createdAt.getTime() + MFA_SETUP_GRACE_PERIOD * 24 * 60 * 60 * 1000
  )

  const remaining = graceEndDate.getTime() - Date.now()
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)))
}

/**
 * Determine MFA requirement status for a user
 */
export function getMFAStatus(
  role: FirmRole,
  hasMFAEnabled: boolean,
  userCreatedAt: string | Date
): {
  required: boolean
  recommended: boolean
  enabled: boolean
  inGracePeriod: boolean
  gracePeriodDaysRemaining: number
  canProceedWithoutMFA: boolean
  message: string
} {
  const required = isMFARequired(role)
  const recommended = isMFARecommended(role)
  const inGracePeriod = isInMFAGracePeriod(userCreatedAt)
  const gracePeriodDaysRemaining = getMFAGracePeriodRemaining(userCreatedAt)

  let canProceedWithoutMFA = false
  let message = ''

  if (required) {
    if (hasMFAEnabled) {
      canProceedWithoutMFA = false
      message = 'المصادقة الثنائية مفعلة ومطلوبة لدورك'
    } else if (inGracePeriod) {
      canProceedWithoutMFA = true
      message = `المصادقة الثنائية مطلوبة. لديك ${gracePeriodDaysRemaining} يوم لتفعيلها`
    } else {
      canProceedWithoutMFA = false
      message = 'يجب تفعيل المصادقة الثنائية للمتابعة'
    }
  } else if (recommended) {
    canProceedWithoutMFA = true
    message = hasMFAEnabled
      ? 'المصادقة الثنائية مفعلة'
      : 'ننصح بتفعيل المصادقة الثنائية لحماية حسابك'
  } else {
    canProceedWithoutMFA = true
    message = hasMFAEnabled
      ? 'المصادقة الثنائية مفعلة'
      : ''
  }

  return {
    required,
    recommended,
    enabled: hasMFAEnabled,
    inGracePeriod,
    gracePeriodDaysRemaining,
    canProceedWithoutMFA,
    message,
  }
}

/**
 * Check if MFA verification is needed for an action
 */
export function needsMFAForAction(
  action: string,
  userHasMFA: boolean
): boolean {
  // If action is protected and user has MFA, they need to verify
  if (isActionMFAProtected(action) && userHasMFA) {
    // Check if they have a valid MFA session
    return !hasMFASession()
  }

  return false
}

/**
 * Get all MFA-protected actions grouped by category
 */
export function getMFAProtectedActionsByCategory(): Record<string, string[]> {
  return {
    'العمليات المالية': [
      'payment.create',
      'payment.approve',
      'payment.delete',
      'invoice.delete',
      'expense.approve',
      'refund.create',
      'bank_transfer.create',
    ],
    'إدارة المستخدمين': [
      'user.create',
      'user.delete',
      'user.role_change',
      'user.password_reset',
    ],
    'إعدادات الأمان': [
      'security.mfa_disable',
      'security.password_change',
      'security.api_key_create',
    ],
    'عمليات البيانات': [
      'data.export_all',
      'data.delete_bulk',
      'data.backup_download',
    ],
    'عمليات المسؤول': [
      'admin.settings_change',
      'admin.billing_update',
      'admin.subscription_cancel',
    ],
  }
}

export default {
  MFA_REQUIRED_ROLES,
  MFA_RECOMMENDED_ROLES,
  MFA_EXEMPT_ROLES,
  MFA_PROTECTED_ACTIONS,
  MFA_SESSION_DURATION,
  MFA_SETUP_GRACE_PERIOD,
  isMFARequired,
  isMFARecommended,
  isActionMFAProtected,
  setMFASession,
  clearMFASession,
  hasMFASession,
  getMFASessionRemaining,
  extendMFASession,
  isInMFAGracePeriod,
  getMFAGracePeriodRemaining,
  getMFAStatus,
  needsMFAForAction,
  getMFAProtectedActionsByCategory,
}

/**
 * IP Whitelist Types
 * Type definitions for IP whitelist management endpoints
 * Matches backend API contract exactly
 */

// ═══════════════════════════════════════════════════════════════
// IP WHITELIST TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * IP address type classification
 */
export type IPType = 'IPv4' | 'IPv6' | 'CIDR' | 'Range'

/**
 * Valid duration options for temporary IP allowances
 */
export type TemporaryIPDuration = 24 | 168 | 720 // 1 day, 7 days, 30 days

/**
 * User reference in IP allowance (populated)
 */
export interface IPAllowanceUser {
  _id: string
  firstName: string
  lastName: string
  email: string
}

/**
 * Permanent IP entry
 */
export interface PermanentIPEntry {
  ip: string
  type: IPType
  description: string | null
  permanent: true
}

/**
 * Temporary IP entry with expiration
 */
export interface TemporaryIPEntry {
  ip: string
  type: IPType
  description: string | null
  expiresAt: string // ISO date
  createdBy: IPAllowanceUser
  createdAt: string // ISO date
  permanent: false
}

/**
 * Complete IP whitelist data
 */
export interface IPWhitelistData {
  success: boolean
  enabled: boolean
  permanent: PermanentIPEntry[]
  temporary: TemporaryIPEntry[]
  total: number
}

// ═══════════════════════════════════════════════════════════════
// REQUEST TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Request to add permanent IP
 */
export interface AddPermanentIPRequest {
  ip: string
  description?: string
}

/**
 * Request to add temporary IP
 */
export interface AddTemporaryIPRequest {
  ip: string
  description?: string
  temporary: true
  durationHours: TemporaryIPDuration
}

/**
 * Combined add IP request type
 */
export type AddIPRequest = AddPermanentIPRequest | AddTemporaryIPRequest

/**
 * Request to enable IP whitelist
 */
export interface EnableIPWhitelistRequest {
  autoWhitelistCurrentIP?: boolean // defaults to true
}

/**
 * Request to revoke temporary IP
 */
export interface RevokeTemporaryIPRequest {
  reason?: string
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * GET /firms/:firmId/ip-whitelist response
 */
export interface GetIPWhitelistResponse {
  success: boolean
  message: string
  data: IPWhitelistData
}

/**
 * Response after adding permanent IP
 */
export interface AddPermanentIPResponse {
  success: boolean
  message: string
  data: {
    success: boolean
    ipWhitelist: string[]
    added: string
    description: string | null
  }
}

/**
 * Response after adding temporary IP
 */
export interface AddTemporaryIPResponse {
  success: boolean
  message: string
  data: {
    success: boolean
    allowance: {
      id: string
      ip: string
      description: string | null
      expiresAt: string
      durationHours: TemporaryIPDuration
    }
  }
}

/**
 * Response after removing IP
 */
export interface RemoveIPResponse {
  success: boolean
  message: string
  data: {
    success: boolean
    ipWhitelist: string[]
    removed: string
  }
}

/**
 * IP test result reason
 */
export type IPTestReason =
  | 'IP whitelisting disabled'
  | 'IP whitelist is empty'
  | 'IP in permanent whitelist'
  | 'IP in temporary whitelist'
  | 'IP not in whitelist'
  | 'Error checking IP whitelist'

/**
 * POST /firms/:firmId/ip-whitelist/test response
 */
export interface TestIPAccessResponse {
  success: boolean
  message: string
  data: {
    clientIP: string
    allowed: boolean
    reason: IPTestReason
    expiresAt: string | null
    whitelistEnabled: boolean
  }
}

/**
 * Warning types when enabling IP whitelist
 */
export type EnableWarningType = 'current_ip_not_whitelisted' | 'auto_whitelisted'

export interface EnableWarning {
  type: EnableWarningType
  message: string
  currentIP: string
}

/**
 * Response after enabling IP whitelist
 */
export interface EnableIPWhitelistResponse {
  success: boolean
  message: string
  data: {
    success: boolean
    enabled: true
    warnings: EnableWarning[]
    ipWhitelist: string[]
  }
}

/**
 * Response after disabling IP whitelist
 */
export interface DisableIPWhitelistResponse {
  success: boolean
  message: string
  data: {
    success: boolean
    enabled: false
  }
}

/**
 * Response after revoking temporary IP
 */
export interface RevokeTemporaryIPResponse {
  success: boolean
  message: string
  data: {
    id: string
    revokedAt: string
    revokedBy: string
  }
}

// ═══════════════════════════════════════════════════════════════
// DURATION LABEL HELPERS
// ═══════════════════════════════════════════════════════════════

export const DURATION_LABELS: Record<TemporaryIPDuration, string> = {
  24: '1 day',
  168: '7 days',
  720: '30 days',
}

export const DURATION_LABELS_AR: Record<TemporaryIPDuration, string> = {
  24: 'يوم واحد',
  168: '7 أيام',
  720: '30 يوم',
}

/**
 * Duration options for UI selects
 */
export const DURATION_OPTIONS: Array<{ value: TemporaryIPDuration; labelEn: string; labelAr: string }> = [
  { value: 24, labelEn: '1 day', labelAr: 'يوم واحد' },
  { value: 168, labelEn: '7 days', labelAr: '7 أيام' },
  { value: 720, labelEn: '30 days', labelAr: '30 يوم' },
]

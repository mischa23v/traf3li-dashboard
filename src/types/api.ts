/**
 * API Type Definitions
 * Standard types for API requests and responses
 */

import { ErrorCode } from '@/constants/errorCodes'

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: true
  message: string
  messageEn?: string
  code?: ErrorCode | string

  // Rate limiting
  retryAfter?: number
  attemptsRemaining?: number

  // Account lockout
  remainingTime?: number
  lockedUntil?: string

  // Session
  reason?: 'idle_timeout' | 'absolute_timeout' | string
  loggedOut?: boolean

  // Validation
  errors?: Record<string, string> | Array<{ field: string; message: string }>

  // Request tracking
  requestId?: string
}

/**
 * Standard API success response wrapper
 */
export interface ApiSuccessResponse<T = unknown> {
  error: false
  message?: string
  data: T
  meta?: {
    requestId?: string
    timestamp?: string
    pagination?: PaginationMeta
  }
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

/**
 * Login request payload
 */
export interface LoginRequest {
  username?: string
  email?: string
  password: string
}

/**
 * Login response
 */
export interface LoginResponse {
  error: false
  message: string
  user: {
    _id: string
    email: string
    firstName: string
    lastName: string
    role: string
    firmId?: string
    avatarUrl?: string
  }
}

/**
 * Session info response from /auth/session
 */
export interface SessionInfoResponse {
  lastActivity: string | null
  idleRemaining: number // minutes
  absoluteRemaining: number // minutes
  idleTimeout: number // minutes
  absoluteTimeout: number // minutes
}

/**
 * Rate limit info from response headers
 */
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number // Unix timestamp
}

/**
 * Session warning event detail
 */
export interface SessionWarningEventDetail {
  remainingSeconds: number
  isIdleWarning: boolean
  isAbsoluteWarning: boolean
}

/**
 * Socket session expired event
 */
export interface SocketSessionExpiredEvent {
  reason: 'idle_timeout' | 'absolute_timeout' | 'forced'
  message?: string
}

/**
 * Socket force logout event
 */
export interface SocketForceLogoutEvent {
  reason: 'account_locked' | 'permission_revoked' | 'admin_action' | string
  message?: string
}

// ═══════════════════════════════════════════════════════════════
// WEBSOCKET TOKEN AUTHENTICATION EVENTS
// Server checks token validity every 60 seconds
// ═══════════════════════════════════════════════════════════════

/**
 * Socket connection error codes
 * Returned in connect_error event when authentication fails
 */
export type SocketAuthErrorCode =
  | 'AUTHENTICATION_REQUIRED'  // No token provided in handshake
  | 'INVALID_TOKEN'            // Token failed JWT verification
  | 'USER_NOT_FOUND'           // User not found in database
  | 'USER_DISABLED'            // User account is disabled
  | 'AUTHENTICATION_FAILED'    // Generic auth failure

/**
 * Server → Client: Token expired event payload
 * Emitted when token TTL exceeded during periodic check (every 60s)
 * Recoverable: Yes - refresh token and update socket
 */
export interface SocketAuthTokenExpiredPayload {
  message: string         // "Your session has expired. Please refresh to continue."
  code: 'TOKEN_EXPIRED'
}

/**
 * Server → Client: Token invalid event payload
 * Emitted when token was revoked or tampered with
 * Recoverable: No - must re-authenticate (login again)
 */
export interface SocketAuthTokenInvalidPayload {
  message: string         // "Your session is no longer valid. Please log in again."
  code: 'TOKEN_INVALID'
}

/**
 * Client → Server: Token refresh response
 * Returned from 'auth:refresh_token' emit callback
 */
export interface SocketAuthRefreshTokenResponse {
  success: boolean
  expiresAt?: string      // ISO 8601 date string (only if success: true)
  error?: string          // Error message (only if success: false)
}

/**
 * Socket auth error codes for token refresh failures
 */
export type SocketAuthRefreshErrorCode =
  | 'Invalid token provided'  // Null, undefined, or non-string token sent
  | 'Invalid token'           // Token failed JWT verification
  | 'User mismatch'           // Token belongs to different user than socket
  | 'Refresh failed'          // Unexpected server error

/**
 * Socket auth state for tracking
 */
export interface SocketAuthState {
  isAuthenticated: boolean
  tokenExpiry: Date | null
  lastRefresh: Date | null
}

/**
 * Generic API response type that can be either success or error
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return response.error === true
}

/**
 * Type guard to check if response is successful
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.error === false
}

/**
 * Extract data from API response, throws if error
 */
export function getApiData<T>(response: ApiResponse<T>): T {
  if (isApiError(response)) {
    throw new Error(response.messageEn || response.message || 'API Error')
  }
  return response.data
}

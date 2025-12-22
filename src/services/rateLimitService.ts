/**
 * Rate Limiting Service
 * Enhanced login rate limiting with audit logging
 * NCA ECC 2-1-2 Compliant - Brute Force Protection
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export interface RateLimitAttempt {
  count: number
  lastAttempt: number
  lockedUntil: number | null
  progressiveDelay: number // Current progressive delay in ms
}

export interface RateLimitStatus {
  allowed: boolean
  isLocked: boolean
  waitTime: number // Seconds to wait
  attemptsRemaining: number
  lockedUntil: Date | null
  nextAttemptAt: Date | null
  progressiveDelay: number // Seconds of current progressive delay
}

export interface RateLimitConfig {
  maxAttempts: number
  lockoutDuration: number // milliseconds
  baseDelay: number // milliseconds
  storageKey: string
}

// ==================== CONFIGURATION ====================

export const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  baseDelay: 1000, // 1 second
  storageKey: 'login_rate_limit',
}

// ==================== PRIVATE HELPERS ====================

/**
 * Get rate limit data for an identifier (email or username)
 */
function getRateLimitData(identifier: string, config: RateLimitConfig): RateLimitAttempt {
  try {
    const stored = localStorage.getItem(config.storageKey)
    if (!stored) return { count: 0, lastAttempt: 0, lockedUntil: null, progressiveDelay: 0 }

    const data = JSON.parse(stored)
    return data[identifier] || { count: 0, lastAttempt: 0, lockedUntil: null, progressiveDelay: 0 }
  } catch {
    return { count: 0, lastAttempt: 0, lockedUntil: null, progressiveDelay: 0 }
  }
}

/**
 * Save rate limit data for an identifier
 */
function saveRateLimitData(
  identifier: string,
  data: RateLimitAttempt,
  config: RateLimitConfig
): void {
  try {
    const stored = localStorage.getItem(config.storageKey)
    const allData = stored ? JSON.parse(stored) : {}
    allData[identifier] = data
    localStorage.setItem(config.storageKey, JSON.stringify(allData))
  } catch {
    // Storage full or unavailable - continue without persistence
  }
}

/**
 * Calculate progressive delay based on attempt count
 * Uses exponential backoff: 1s, 2s, 4s, 8s, 16s
 */
function calculateProgressiveDelay(attemptCount: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, Math.min(attemptCount - 1, 4))
}

/**
 * Log account lockout to audit system
 */
async function logAccountLockout(identifier: string, lockedUntil: Date): Promise<void> {
  try {
    await apiClient.post('/audit-logs', {
      action: 'account_locked',
      entityType: 'user',
      status: 'failure',
      severity: 'high',
      details: {
        identifier,
        reason: 'Too many failed login attempts',
        lockedUntil: lockedUntil.toISOString(),
        lockoutDuration: DEFAULT_CONFIG.lockoutDuration,
        maxAttempts: DEFAULT_CONFIG.maxAttempts,
      },
    })
  } catch (error) {
    // Audit logging failure shouldn't prevent rate limiting
    console.error('Failed to log account lockout:', error)
  }
}

/**
 * Log failed login attempt to audit system
 */
async function logFailedAttempt(
  identifier: string,
  attemptCount: number,
  attemptsRemaining: number
): Promise<void> {
  try {
    await apiClient.post('/audit-logs', {
      action: 'failed_login_attempt',
      entityType: 'user',
      status: 'failure',
      severity: attemptCount >= DEFAULT_CONFIG.maxAttempts - 1 ? 'high' : 'medium',
      details: {
        identifier,
        attemptCount,
        attemptsRemaining,
        maxAttempts: DEFAULT_CONFIG.maxAttempts,
      },
    })
  } catch (error) {
    // Audit logging failure shouldn't prevent rate limiting
    console.error('Failed to log failed attempt:', error)
  }
}

// ==================== PUBLIC API ====================

/**
 * Check if login is allowed for an identifier
 */
export function checkLoginAllowed(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): RateLimitStatus {
  const data = getRateLimitData(identifier, config)
  const now = Date.now()

  // Check if account is locked
  if (data.lockedUntil && data.lockedUntil > now) {
    const waitTime = Math.ceil((data.lockedUntil - now) / 1000)
    return {
      allowed: false,
      isLocked: true,
      waitTime,
      attemptsRemaining: 0,
      lockedUntil: new Date(data.lockedUntil),
      nextAttemptAt: new Date(data.lockedUntil),
      progressiveDelay: 0,
    }
  }

  // Reset if lockout has expired
  if (data.lockedUntil && data.lockedUntil <= now) {
    clearRateLimit(identifier, config)
    return {
      allowed: true,
      isLocked: false,
      waitTime: 0,
      attemptsRemaining: config.maxAttempts,
      lockedUntil: null,
      nextAttemptAt: null,
      progressiveDelay: 0,
    }
  }

  // Check progressive delay
  if (data.count > 0) {
    const delay = calculateProgressiveDelay(data.count, config.baseDelay)
    const timeSinceLastAttempt = now - data.lastAttempt
    const progressiveDelaySeconds = Math.ceil(delay / 1000)

    if (timeSinceLastAttempt < delay) {
      const waitTime = Math.ceil((delay - timeSinceLastAttempt) / 1000)
      return {
        allowed: false,
        isLocked: false,
        waitTime,
        attemptsRemaining: config.maxAttempts - data.count,
        lockedUntil: null,
        nextAttemptAt: new Date(data.lastAttempt + delay),
        progressiveDelay: progressiveDelaySeconds,
      }
    }
  }

  return {
    allowed: true,
    isLocked: false,
    waitTime: 0,
    attemptsRemaining: config.maxAttempts - data.count,
    lockedUntil: null,
    nextAttemptAt: null,
    progressiveDelay: 0,
  }
}

/**
 * Record a failed login attempt
 * Returns rate limit status and logs to audit system
 */
export async function recordFailedAttempt(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<RateLimitStatus> {
  const data = getRateLimitData(identifier, config)
  const now = Date.now()

  data.count++
  data.lastAttempt = now
  data.progressiveDelay = calculateProgressiveDelay(data.count, config.baseDelay)

  // Lock account if max attempts reached
  if (data.count >= config.maxAttempts) {
    data.lockedUntil = now + config.lockoutDuration
    saveRateLimitData(identifier, data, config)

    const lockedUntil = new Date(data.lockedUntil)

    // Log lockout to audit system (async, non-blocking)
    logAccountLockout(identifier, lockedUntil).catch(() => {
      // Ignore audit log errors
    })

    return {
      allowed: false,
      isLocked: true,
      waitTime: Math.ceil(config.lockoutDuration / 1000),
      attemptsRemaining: 0,
      lockedUntil,
      nextAttemptAt: lockedUntil,
      progressiveDelay: 0,
    }
  }

  saveRateLimitData(identifier, data, config)

  const attemptsRemaining = config.maxAttempts - data.count

  // Log failed attempt to audit system (async, non-blocking)
  logFailedAttempt(identifier, data.count, attemptsRemaining).catch(() => {
    // Ignore audit log errors
  })

  const progressiveDelaySeconds = Math.ceil(data.progressiveDelay / 1000)

  return {
    allowed: false,
    isLocked: false,
    waitTime: progressiveDelaySeconds,
    attemptsRemaining,
    lockedUntil: null,
    nextAttemptAt: new Date(now + data.progressiveDelay),
    progressiveDelay: progressiveDelaySeconds,
  }
}

/**
 * Record a successful login - clears all rate limit data
 */
export function recordSuccessfulLogin(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): void {
  clearRateLimit(identifier, config)
}

/**
 * Clear rate limit data for an identifier
 */
export function clearRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): void {
  try {
    const stored = localStorage.getItem(config.storageKey)
    if (stored) {
      const allData = JSON.parse(stored)
      delete allData[identifier]
      localStorage.setItem(config.storageKey, JSON.stringify(allData))
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Get remaining lockout time in seconds
 */
export function getRemainingLockoutTime(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): number {
  const data = getRateLimitData(identifier, config)
  const now = Date.now()

  if (data.lockedUntil && data.lockedUntil > now) {
    return Math.ceil((data.lockedUntil - now) / 1000)
  }

  return 0
}

/**
 * Get comprehensive rate limit status
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): RateLimitStatus {
  return checkLoginAllowed(identifier, config)
}

/**
 * Format time in human-readable format (supports both Arabic and English)
 */
export function formatLockoutTime(seconds: number, language: 'ar' | 'en' = 'en'): string {
  if (language === 'ar') {
    if (seconds < 60) {
      return `${seconds} ثانية`
    }
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} دقيقة`
  }

  // English
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`
  }
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`
}

/**
 * Handle 429 (Too Many Requests) response from server
 * Extracts retry-after header and returns wait time
 */
export function handle429Response(error: any): {
  isRateLimited: boolean
  retryAfter: number // seconds
  message: string
} {
  const status = error?.status || error?.response?.status

  if (status !== 429) {
    return {
      isRateLimited: false,
      retryAfter: 0,
      message: '',
    }
  }

  // Try to extract retry-after from headers or response data
  const retryAfterHeader = error?.response?.headers?.['retry-after']
  const retryAfterData = error?.response?.data?.retryAfter || error?.retryAfter

  let retryAfter = 60 // Default to 60 seconds

  if (retryAfterHeader) {
    // Retry-After can be in seconds or HTTP date
    const parsed = parseInt(retryAfterHeader, 10)
    if (!isNaN(parsed)) {
      retryAfter = parsed
    }
  } else if (retryAfterData) {
    retryAfter = parseInt(retryAfterData, 10) || 60
  }

  const message = error?.response?.data?.message || error?.message || 'Too many requests'

  return {
    isRateLimited: true,
    retryAfter,
    message,
  }
}

/**
 * Clear all rate limit data (e.g., for testing)
 */
export function clearAllRateLimits(config: RateLimitConfig = DEFAULT_CONFIG): void {
  try {
    localStorage.removeItem(config.storageKey)
  } catch {
    // Ignore errors
  }
}

// ==================== DEFAULT EXPORT ====================

export default {
  checkLoginAllowed,
  recordFailedAttempt,
  recordSuccessfulLogin,
  clearRateLimit,
  getRemainingLockoutTime,
  getRateLimitStatus,
  formatLockoutTime,
  handle429Response,
  clearAllRateLimits,
  DEFAULT_CONFIG,
}

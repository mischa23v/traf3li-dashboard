/**
 * Login Throttling for Brute Force Protection
 * NCA ECC 2-1-2 Compliant
 */

interface LoginAttempt {
  count: number
  lastAttempt: number
  lockedUntil: number | null
}

const STORAGE_KEY = 'login_throttle'
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
const BASE_DELAY = 1000 // 1 second

/**
 * Get throttle data for an identifier (email or IP)
 */
function getThrottleData(identifier: string): LoginAttempt {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return { count: 0, lastAttempt: 0, lockedUntil: null }

    const data = JSON.parse(stored)
    return data[identifier] || { count: 0, lastAttempt: 0, lockedUntil: null }
  } catch {
    return { count: 0, lastAttempt: 0, lockedUntil: null }
  }
}

/**
 * Save throttle data for an identifier
 */
function saveThrottleData(identifier: string, data: LoginAttempt): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const allData = stored ? JSON.parse(stored) : {}
    allData[identifier] = data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData))
  } catch {
    // Storage full or unavailable - continue without persistence
  }
}

/**
 * Check if login is allowed for an identifier
 * Returns: { allowed: boolean, waitTime?: number, attemptsRemaining?: number }
 */
export function checkLoginAllowed(identifier: string): {
  allowed: boolean
  waitTime?: number
  attemptsRemaining?: number
  lockedUntil?: Date
} {
  const data = getThrottleData(identifier)
  const now = Date.now()

  // Check if account is locked
  if (data.lockedUntil && data.lockedUntil > now) {
    return {
      allowed: false,
      waitTime: Math.ceil((data.lockedUntil - now) / 1000),
      lockedUntil: new Date(data.lockedUntil),
      attemptsRemaining: 0,
    }
  }

  // Reset if lockout has expired
  if (data.lockedUntil && data.lockedUntil <= now) {
    clearThrottle(identifier)
    return { allowed: true, attemptsRemaining: MAX_ATTEMPTS }
  }

  // Check progressive delay
  if (data.count > 0) {
    const delay = calculateDelay(data.count)
    const timeSinceLastAttempt = now - data.lastAttempt

    if (timeSinceLastAttempt < delay) {
      return {
        allowed: false,
        waitTime: Math.ceil((delay - timeSinceLastAttempt) / 1000),
        attemptsRemaining: MAX_ATTEMPTS - data.count,
      }
    }
  }

  return {
    allowed: true,
    attemptsRemaining: MAX_ATTEMPTS - data.count,
  }
}

/**
 * Calculate progressive delay based on attempt count
 * Uses exponential backoff: 1s, 2s, 4s, 8s, 16s
 */
function calculateDelay(attemptCount: number): number {
  return BASE_DELAY * Math.pow(2, Math.min(attemptCount - 1, 4))
}

/**
 * Record a failed login attempt
 * Returns lockout info if threshold reached
 */
export function recordFailedAttempt(identifier: string): {
  locked: boolean
  attemptsRemaining: number
  lockedUntil?: Date
  waitTime?: number
} {
  const data = getThrottleData(identifier)
  const now = Date.now()

  data.count++
  data.lastAttempt = now

  // Lock account if max attempts reached
  if (data.count >= MAX_ATTEMPTS) {
    data.lockedUntil = now + LOCKOUT_DURATION
    saveThrottleData(identifier, data)

    return {
      locked: true,
      attemptsRemaining: 0,
      lockedUntil: new Date(data.lockedUntil),
      waitTime: Math.ceil(LOCKOUT_DURATION / 1000),
    }
  }

  saveThrottleData(identifier, data)

  return {
    locked: false,
    attemptsRemaining: MAX_ATTEMPTS - data.count,
    waitTime: Math.ceil(calculateDelay(data.count) / 1000),
  }
}

/**
 * Record a successful login - clears all throttle data
 */
export function recordSuccessfulLogin(identifier: string): void {
  clearThrottle(identifier)
}

/**
 * Clear throttle data for an identifier
 */
export function clearThrottle(identifier: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const allData = JSON.parse(stored)
      delete allData[identifier]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData))
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Clear all throttle data (e.g., for testing)
 */
export function clearAllThrottles(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore errors
  }
}

/**
 * Get remaining lockout time in human-readable format (Arabic)
 */
export function formatLockoutTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} ثانية`
  }
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} دقيقة`
}

/**
 * Hook-friendly function to get throttle status
 */
export function getThrottleStatus(identifier: string): {
  isLocked: boolean
  attemptCount: number
  attemptsRemaining: number
  lockoutEndsAt: Date | null
  nextAttemptAt: Date | null
} {
  const data = getThrottleData(identifier)
  const now = Date.now()

  const isLocked = data.lockedUntil !== null && data.lockedUntil > now
  const lockoutEndsAt = data.lockedUntil && data.lockedUntil > now
    ? new Date(data.lockedUntil)
    : null

  let nextAttemptAt: Date | null = null
  if (!isLocked && data.count > 0) {
    const delay = calculateDelay(data.count)
    const nextAllowed = data.lastAttempt + delay
    if (nextAllowed > now) {
      nextAttemptAt = new Date(nextAllowed)
    }
  }

  return {
    isLocked,
    attemptCount: data.count,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - data.count),
    lockoutEndsAt,
    nextAttemptAt,
  }
}

export default {
  checkLoginAllowed,
  recordFailedAttempt,
  recordSuccessfulLogin,
  clearThrottle,
  clearAllThrottles,
  formatLockoutTime,
  getThrottleStatus,
}

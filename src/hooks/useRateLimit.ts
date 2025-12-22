/**
 * Rate Limit Hook
 * React hook for managing login rate limiting
 */

import { useState, useEffect, useCallback } from 'react'
import {
  checkLoginAllowed,
  recordFailedAttempt,
  recordSuccessfulLogin,
  getRateLimitStatus,
  handle429Response,
  type RateLimitStatus,
  type RateLimitConfig,
  DEFAULT_CONFIG,
} from '@/services/rateLimitService'

interface UseRateLimitOptions {
  identifier: string
  config?: RateLimitConfig
  onLockout?: (status: RateLimitStatus) => void
  onUnlock?: () => void
}

interface UseRateLimitReturn {
  status: RateLimitStatus
  isAllowed: boolean
  isLocked: boolean
  remainingTime: number
  attemptsRemaining: number
  progressiveDelay: number
  checkAllowed: () => RateLimitStatus
  recordFailed: () => Promise<RateLimitStatus>
  recordSuccess: () => void
  handle429: (error: any) => {
    isRateLimited: boolean
    retryAfter: number
    message: string
  }
  refreshStatus: () => void
}

/**
 * Hook to manage rate limiting for login attempts
 */
export function useRateLimit({
  identifier,
  config = DEFAULT_CONFIG,
  onLockout,
  onUnlock,
}: UseRateLimitOptions): UseRateLimitReturn {
  const [status, setStatus] = useState<RateLimitStatus>(() =>
    getRateLimitStatus(identifier, config)
  )

  // Refresh status from storage
  const refreshStatus = useCallback(() => {
    const newStatus = getRateLimitStatus(identifier, config)
    setStatus(newStatus)
  }, [identifier, config])

  // Check if login is allowed
  const checkAllowed = useCallback((): RateLimitStatus => {
    const newStatus = checkLoginAllowed(identifier, config)
    setStatus(newStatus)
    return newStatus
  }, [identifier, config])

  // Record failed attempt
  const recordFailed = useCallback(async (): Promise<RateLimitStatus> => {
    const newStatus = await recordFailedAttempt(identifier, config)
    setStatus(newStatus)

    // Trigger lockout callback if account is now locked
    if (newStatus.isLocked && onLockout) {
      onLockout(newStatus)
    }

    return newStatus
  }, [identifier, config, onLockout])

  // Record successful login
  const recordSuccess = useCallback(() => {
    recordSuccessfulLogin(identifier, config)
    const newStatus = getRateLimitStatus(identifier, config)
    setStatus(newStatus)
  }, [identifier, config])

  // Handle 429 response
  const handle429 = useCallback(
    (error: any) => {
      return handle429Response(error)
    },
    []
  )

  // Auto-refresh status when unlocked
  useEffect(() => {
    if (!status.isLocked || status.waitTime <= 0) {
      return
    }

    const timer = setInterval(() => {
      const newStatus = getRateLimitStatus(identifier, config)
      setStatus(newStatus)

      // Trigger unlock callback when lockout expires
      if (!newStatus.isLocked && status.isLocked && onUnlock) {
        onUnlock()
      }

      // Clear timer if unlocked
      if (!newStatus.isLocked) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [status.isLocked, status.waitTime, identifier, config, onUnlock])

  return {
    status,
    isAllowed: status.allowed,
    isLocked: status.isLocked,
    remainingTime: status.waitTime,
    attemptsRemaining: status.attemptsRemaining,
    progressiveDelay: status.progressiveDelay,
    checkAllowed,
    recordFailed,
    recordSuccess,
    handle429,
    refreshStatus,
  }
}

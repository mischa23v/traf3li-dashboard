import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Session Timeout Configuration
 */
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000 // 5 minutes before timeout
const WARNING_THRESHOLD = SESSION_TIMEOUT - WARNING_TIME

/**
 * Activity Events to Track
 */
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
] as const

/**
 * Session Timeout Hook Return Type
 */
interface UseSessionTimeoutReturn {
  /** Remaining time in milliseconds until auto-logout */
  remainingTime: number
  /** Whether the warning period is active (last 5 minutes) */
  isWarning: boolean
  /** Reset the inactivity timer */
  resetTimer: () => void
  /** Extend the session and reset timer */
  extendSession: () => void
}

/**
 * Session Timeout Hook
 *
 * Tracks user activity and automatically logs out after 30 minutes of inactivity.
 * Shows a warning toast 5 minutes before timeout.
 *
 * @returns Session timeout state and control functions
 *
 * @example
 * ```tsx
 * function App() {
 *   const { remainingTime, isWarning, extendSession } = useSessionTimeout()
 *
 *   return (
 *     <div>
 *       {isWarning && (
 *         <Button onClick={extendSession}>
 *           Extend Session ({Math.floor(remainingTime / 60000)} min left)
 *         </Button>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useSessionTimeout(): UseSessionTimeoutReturn {
  const { t } = useTranslation()
  const { logout } = useAuthStore()

  // Track last activity timestamp
  const lastActivityRef = useRef<number>(Date.now())

  // Track if warning has been shown
  const warningShownRef = useRef<boolean>(false)

  // Track remaining time (updated every second)
  const [remainingTime, setRemainingTime] = useState<number>(SESSION_TIMEOUT)

  // Track warning state
  const [isWarning, setIsWarning] = useState<boolean>(false)

  // Timeout references for cleanup
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /**
   * Reset the inactivity timer
   */
  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now()
    warningShownRef.current = false
    setIsWarning(false)
    setRemainingTime(SESSION_TIMEOUT)
  }, [])

  /**
   * Extend the session (same as reset but with user feedback)
   */
  const extendSession = useCallback(() => {
    resetTimer()
    toast.success(t('session.extended', 'Session extended successfully'))
  }, [resetTimer, t])

  /**
   * Handle user logout due to inactivity
   */
  const handleAutoLogout = useCallback(async () => {
    // Show logout notification
    toast.error(
      t(
        'session.timeout',
        'Your session has expired due to inactivity. Please log in again.'
      )
    )

    // Perform logout
    await logout()
  }, [logout, t])

  /**
   * Show warning notification
   */
  const showWarning = useCallback(() => {
    if (warningShownRef.current) return

    warningShownRef.current = true
    setIsWarning(true)

    toast.warning(
      t(
        'session.warning',
        'Your session will expire in 5 minutes due to inactivity.'
      ),
      {
        duration: 10000, // Show for 10 seconds
        action: {
          label: t('session.extend', 'Extend Session'),
          onClick: extendSession,
        },
      }
    )
  }, [extendSession, t])

  /**
   * Check session status and update state
   */
  const checkSessionStatus = useCallback(() => {
    const now = Date.now()
    const elapsed = now - lastActivityRef.current
    const remaining = SESSION_TIMEOUT - elapsed

    // Update remaining time
    setRemainingTime(Math.max(0, remaining))

    // Check if session has expired
    if (elapsed >= SESSION_TIMEOUT) {
      handleAutoLogout()
      return
    }

    // Check if warning should be shown
    if (elapsed >= WARNING_THRESHOLD && !warningShownRef.current) {
      showWarning()
    }

    // Update warning state
    setIsWarning(elapsed >= WARNING_THRESHOLD)
  }, [handleAutoLogout, showWarning])

  /**
   * Handle user activity
   */
  const handleActivity = useCallback(() => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current

    // Only reset if enough time has passed (throttle to avoid excessive resets)
    // Reset on any activity if in warning period
    if (timeSinceLastActivity > 1000 || isWarning) {
      lastActivityRef.current = now

      // If we were in warning state, reset it
      if (isWarning) {
        warningShownRef.current = false
        setIsWarning(false)
      }
    }
  }, [isWarning])

  /**
   * Setup activity listeners
   */
  useEffect(() => {
    // Add event listeners for user activity
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Cleanup
    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [handleActivity])

  /**
   * Setup session monitoring interval
   */
  useEffect(() => {
    // Check session status every second
    intervalRef.current = setInterval(checkSessionStatus, 1000)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkSessionStatus])

  /**
   * Setup auto-logout timeout
   */
  useEffect(() => {
    // Set timeout for auto-logout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const timeUntilLogout = SESSION_TIMEOUT - (Date.now() - lastActivityRef.current)

    if (timeUntilLogout > 0) {
      timeoutRef.current = setTimeout(handleAutoLogout, timeUntilLogout)
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleAutoLogout, isWarning]) // Re-run when warning state changes

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    remainingTime,
    isWarning,
    resetTimer,
    extendSession,
  }
}

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { apiClient } from '@/lib/api'

interface SessionWarningDetail {
  remainingSeconds: number
  isIdleWarning: boolean
  isAbsoluteWarning: boolean
}

/**
 * SessionExpiryWarning Component
 *
 * Listens for session-expiry-warning events dispatched by the API interceptor
 * and shows a modal warning the user that their session is about to expire.
 *
 * User can choose to:
 * - Stay logged in (makes an API call to refresh the idle timeout)
 * - Log out immediately
 */
export function SessionExpiryWarning() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [open, setOpen] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [isExtending, setIsExtending] = useState(false)

  // Format seconds to mm:ss
  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
  }

  // Handle session warning event
  const handleSessionWarning = useCallback((event: CustomEvent<SessionWarningDetail>) => {
    const { remainingSeconds } = event.detail
    setSeconds(remainingSeconds)
    setOpen(true)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!open || seconds <= 0) return

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Session expired, redirect to login
          localStorage.removeItem('user')
          window.location.href = '/sign-in?reason=session_expired'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, seconds])

  // Listen for session warning events
  useEffect(() => {
    const handler = (e: Event) => handleSessionWarning(e as CustomEvent<SessionWarningDetail>)
    window.addEventListener('session-expiry-warning', handler)
    return () => window.removeEventListener('session-expiry-warning', handler)
  }, [handleSessionWarning])

  // Extend session by making an API call (refreshes idle timeout)
  const handleExtendSession = async () => {
    setIsExtending(true)
    try {
      await apiClient.get('/auth/status')
      setOpen(false)
    } catch {
      // If extend fails, the session may have already expired
      localStorage.removeItem('user')
      window.location.href = '/sign-in?reason=session_expired'
    } finally {
      setIsExtending(false)
    }
  }

  // Log out immediately
  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/sign-in?reason=user_logout'
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isRTL ? 'جلستك على وشك الانتهاء' : 'Session Expiring Soon'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              {isRTL
                ? `ستنتهي جلستك خلال ${formatTime(seconds)}`
                : `Your session will expire in ${formatTime(seconds)}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {isRTL
                ? 'اضغط "البقاء متصلاً" للاستمرار في العمل'
                : 'Click "Stay Logged In" to continue working'}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
          <AlertDialogCancel onClick={handleLogout} disabled={isExtending}>
            {isRTL ? 'تسجيل الخروج' : 'Log Out'}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleExtendSession} disabled={isExtending}>
            {isExtending
              ? (isRTL ? 'جارٍ التمديد...' : 'Extending...')
              : (isRTL ? 'البقاء متصلاً' : 'Stay Logged In')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default SessionExpiryWarning

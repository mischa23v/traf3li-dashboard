/**
 * Session Warning Modal
 * Displays a modal when the user's session is about to expire
 * Allows users to extend their session (for idle timeout) or log out
 */

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconClock, IconLogout, IconRefresh } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useSessionWarning, formatRemainingTime } from '@/hooks/use-session-warning'

interface SessionWarningModalProps {
  /** Callback when user chooses to logout */
  onLogout?: () => void
}

export function SessionWarningModal({ onLogout }: SessionWarningModalProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const {
    warning,
    showModal,
    setShowModal,
    refreshSession,
    remainingTime,
    isIdle,
    isAbsolute,
  } = useSessionWarning({
    showToast: true,
    enableRefreshPrompt: true,
  })

  // Local countdown state
  const [countdown, setCountdown] = useState(remainingTime || 0)
  const [isExtending, setIsExtending] = useState(false)

  // Update countdown timer
  useEffect(() => {
    if (!showModal || !remainingTime) return

    setCountdown(remainingTime)

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Time's up - will be logged out on next request
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [showModal, remainingTime])

  // Handle extend session
  const handleExtendSession = async () => {
    setIsExtending(true)
    try {
      await refreshSession()
    } finally {
      setIsExtending(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    setShowModal(false)
    if (onLogout) {
      onLogout()
    } else {
      window.location.href = '/sign-in?reason=manual'
    }
  }

  // Format countdown display
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!showModal) return null

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent
        className="sm:max-w-md"
        dir={isRTL ? 'rtl' : 'ltr'}
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
            <IconClock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center">
            {isRTL ? 'جلستك ستنتهي قريباً' : 'Session Expiring Soon'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isIdle
              ? isRTL
                ? 'جلستك ستنتهي بسبب عدم النشاط.'
                : 'Your session will expire due to inactivity.'
              : isRTL
                ? 'جلستك ستنتهي (الحد الأقصى 24 ساعة).'
                : 'Your session will expire (24-hour limit).'}
          </DialogDescription>
        </DialogHeader>

        {/* Countdown Display */}
        <div className="my-6 text-center">
          <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
            {formatCountdown(countdown)}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRTL ? 'الوقت المتبقي' : 'Time remaining'}
          </p>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          {/* Show extend button only for idle timeout (can be extended) */}
          {isIdle && (
            <Button
              onClick={handleExtendSession}
              disabled={isExtending}
              className="flex-1"
            >
              {isExtending ? (
                <IconRefresh className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <IconRefresh className="me-2 h-4 w-4" />
              )}
              {isRTL ? 'البقاء متصلاً' : 'Stay Logged In'}
            </Button>
          )}

          <Button
            variant={isIdle ? 'outline' : 'default'}
            onClick={handleLogout}
            className="flex-1"
          >
            <IconLogout className="me-2 h-4 w-4" />
            {isRTL ? 'تسجيل الخروج' : 'Log Out'}
          </Button>
        </DialogFooter>

        {/* Additional info for absolute timeout */}
        {isAbsolute && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {isRTL
              ? 'لأسباب أمنية، لا يمكن تمديد الجلسات بعد 24 ساعة.'
              : 'For security reasons, sessions cannot be extended beyond 24 hours.'}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SessionWarningModal

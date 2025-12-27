import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface SessionWarning {
  remainingSeconds: number
  isIdleWarning: boolean
  isAbsoluteWarning: boolean
}

interface UseSessionWarningOptions {
  /** Show toast notification when warning received */
  showToast?: boolean
  /** Callback when warning is received */
  onWarning?: (warning: SessionWarning) => void
  /** Callback when session is about to expire (< 60 seconds) */
  onCritical?: (warning: SessionWarning) => void
  /** Enable auto-refresh prompt */
  enableRefreshPrompt?: boolean
}

/**
 * Hook to handle session expiry warnings
 * Listens for 'session-expiry-warning' events dispatched by the API client
 */
export function useSessionWarning(options: UseSessionWarningOptions = {}) {
  const {
    showToast = true,
    onWarning,
    onCritical,
    enableRefreshPrompt = true,
  } = options

  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [warning, setWarning] = useState<SessionWarning | null>(null)
  const [showModal, setShowModal] = useState(false)

  const refreshSession = useCallback(async () => {
    try {
      // Import dynamically to avoid circular deps
      const { apiClient } = await import('@/lib/api')
      await apiClient.post('/auth/refresh-activity')
      setWarning(null)
      setShowModal(false)

      toast.success(isRTL ? 'تم تمديد الجلسة بنجاح' : 'Session extended successfully')
    } catch (error) {
      toast.error(isRTL ? 'فشل تمديد الجلسة' : 'Failed to extend session')
    }
  }, [isRTL])

  const handleWarning = useCallback((event: CustomEvent<SessionWarning>) => {
    const warningData = event.detail
    setWarning(warningData)

    // Call user callback
    onWarning?.(warningData)

    // Check if critical (< 60 seconds remaining)
    if (warningData.remainingSeconds <= 60) {
      onCritical?.(warningData)

      if (enableRefreshPrompt) {
        setShowModal(true)
      }
    }

    // Show toast notification
    if (showToast && warningData.remainingSeconds > 60) {
      const minutes = Math.ceil(warningData.remainingSeconds / 60)
      const message = warningData.isIdleWarning
        ? (isRTL ? `جلستك ستنتهي قريباً بسبب عدم النشاط (${minutes} دقيقة)` : `Your session will expire soon due to inactivity (${minutes} minutes)`)
        : (isRTL ? `جلستك ستنتهي خلال ${minutes} دقيقة` : `Your session will expire in ${minutes} minutes`)

      toast.warning(message, {
        description: isRTL ? 'انقر على أي مكان للبقاء متصلاً' : 'Click anywhere to stay logged in',
        duration: 10000,
        action: {
          label: isRTL ? 'تمديد الجلسة' : 'Extend Session',
          onClick: () => refreshSession(),
        },
      })
    }
  }, [showToast, onWarning, onCritical, enableRefreshPrompt, refreshSession, isRTL])

  useEffect(() => {
    const handler = (event: Event) => handleWarning(event as CustomEvent<SessionWarning>)

    window.addEventListener('session-expiry-warning', handler)

    return () => {
      window.removeEventListener('session-expiry-warning', handler)
    }
  }, [handleWarning])

  const dismissWarning = useCallback(() => {
    setWarning(null)
    setShowModal(false)
  }, [])

  return {
    warning,
    showModal,
    setShowModal,
    refreshSession,
    dismissWarning,
    remainingTime: warning?.remainingSeconds ?? null,
    isIdle: warning?.isIdleWarning ?? false,
    isAbsolute: warning?.isAbsoluteWarning ?? false,
  }
}

/**
 * Format seconds to human readable Arabic time
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} ثانية`
  }
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) {
    return `${minutes} دقيقة`
  }
  const hours = Math.ceil(minutes / 60)
  return `${hours} ساعة`
}

export default useSessionWarning

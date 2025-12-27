/**
 * Progressive Delay Component
 * Shows increasing delay after failed login attempts with progress indicator
 */

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { formatLockoutTime } from '@/services/rateLimitService'

interface ProgressiveDelayProps {
  delaySeconds: number
  attemptNumber: number
  onDelayComplete?: () => void
}

export function ProgressiveDelay({
  delaySeconds: initialDelay,
  attemptNumber,
  onDelayComplete,
}: ProgressiveDelayProps) {
  const { t, i18n } = useTranslation()
  const [remainingSeconds, setRemainingSeconds] = useState(initialDelay)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setRemainingSeconds(initialDelay)
    setProgress(0)

    if (initialDelay <= 0) {
      onDelayComplete?.()
      return
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          onDelayComplete?.()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [initialDelay, onDelayComplete])

  // Update progress bar
  useEffect(() => {
    if (initialDelay > 0) {
      const progressPercent = ((initialDelay - remainingSeconds) / initialDelay) * 100
      setProgress(progressPercent)
    }
  }, [remainingSeconds, initialDelay])

  if (initialDelay <= 0 || remainingSeconds <= 0) {
    return null
  }

  // Get delay explanation message based on attempt number
  const getDelayExplanation = () => {
    if (attemptNumber === 1) {
      return t('auth.rateLimit.progressiveDelay.first')
    } else if (attemptNumber === 2) {
      return t('auth.rateLimit.progressiveDelay.second')
    } else if (attemptNumber >= 3) {
      return t('auth.rateLimit.progressiveDelay.multiple', { count: attemptNumber })
    }
    return t('auth.rateLimit.progressiveDelay.default')
  }

  return (
    <Alert className="border-blue-500/50 bg-blue-500/10">
      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="font-semibold text-blue-900 dark:text-blue-100">
        {t('auth.rateLimit.progressiveDelay.title')}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3 text-blue-800 dark:text-blue-200">
        {/* Explanation */}
        <p className="text-sm">{getDelayExplanation()}</p>

        {/* Countdown Display */}
        <div className="flex items-center gap-3 rounded-md bg-blue-500/20 p-3">
          <Clock className="h-5 w-5 animate-pulse text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {t('auth.rateLimit.progressiveDelay.pleaseWait')}
            </div>
            <div className="text-xl font-bold tabular-nums text-blue-900 dark:text-blue-100" dir="ltr">
              {formatLockoutTime(remainingSeconds, i18n.language)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-blue-700 dark:text-blue-300">
            {Math.round(progress)}% {t('auth.rateLimit.progressiveDelay.complete')}
          </p>
        </div>

        {/* Security Notice */}
        <p className="text-xs text-blue-700 dark:text-blue-300">
          {t('auth.rateLimit.progressiveDelay.securityNotice')}
        </p>
      </AlertDescription>
    </Alert>
  )
}

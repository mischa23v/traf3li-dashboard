/**
 * Account Lockout Warning Component
 * Shows warning after failed login attempts and countdown timer for unlock
 */

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Clock, HelpCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { formatLockoutTime } from '@/services/rateLimitService'

interface AccountLockoutWarningProps {
  isLocked: boolean
  remainingSeconds: number
  attemptsRemaining?: number
  onUnlock?: () => void
}

export function AccountLockoutWarning({
  isLocked,
  remainingSeconds: initialSeconds,
  attemptsRemaining,
  onUnlock,
}: AccountLockoutWarningProps) {
  const { t, i18n } = useTranslation()
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds)

  // Countdown timer
  useEffect(() => {
    setRemainingSeconds(initialSeconds)

    if (!isLocked || initialSeconds <= 0) return

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          onUnlock?.()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isLocked, initialSeconds, onUnlock])

  // Don't show if not locked and no warning needed
  if (!isLocked && (attemptsRemaining === undefined || attemptsRemaining > 2)) {
    return null
  }

  // Show lockout message
  if (isLocked) {
    return (
      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="font-semibold">
          {t('auth.rateLimit.accountLocked')}
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>{t('auth.rateLimit.accountLockedDescription')}</p>

          {/* Countdown Timer */}
          <div className="flex items-center gap-2 rounded-md bg-destructive/20 p-3">
            <Clock className="h-5 w-5 animate-pulse" aria-hidden="true" />
            <div className="flex-1">
              <div className="text-sm font-medium">
                {t('auth.rateLimit.unlockIn')}
              </div>
              <div className="text-lg font-bold tabular-nums" dir="ltr">
                {formatLockoutTime(remainingSeconds, i18n.language)}
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="flex items-start gap-2 text-sm">
            <HelpCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">{t('auth.rateLimit.needHelp')}</p>
              <Button
                variant="link"
                className="h-auto p-0 text-destructive hover:text-destructive/80"
                asChild
              >
                <a href="/contact-support">
                  {t('auth.rateLimit.contactSupport')}
                </a>
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  // Show warning before lockout
  return (
    <Alert variant="default" className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="font-semibold text-amber-900 dark:text-amber-100">
        {t('auth.rateLimit.warningTitle')}
      </AlertTitle>
      <AlertDescription className="mt-2 text-amber-800 dark:text-amber-200">
        <p>
          {t('auth.rateLimit.warningDescription', {
            count: attemptsRemaining,
          })}
        </p>
        <p className="mt-2 text-sm font-medium">
          {t('auth.rateLimit.accountWillBeLocked')}
        </p>
      </AlertDescription>
    </Alert>
  )
}

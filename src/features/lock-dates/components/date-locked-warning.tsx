/**
 * Date Locked Warning Component
 * Display warning when a date is locked
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { Lock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useDateLockCheck } from '@/hooks/useLockDates'
import { getLockTypeConfig, type LockType } from '@/types/lockDate'

interface DateLockedWarningProps {
  date: string
  lockType?: LockType
  className?: string
  compact?: boolean
}

export function DateLockedWarning({
  date,
  lockType,
  className,
  compact = false,
}: DateLockedWarningProps) {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Backend not implemented - disable the check
  const { data: check, isLoading, error } = useDateLockCheck(date, lockType, false)

  // Don't show warning if there's an error (backend not implemented) or no lock
  if (isLoading || error || !check?.is_locked) return null

  const lockConfig = check.lock_type ? getLockTypeConfig(check.lock_type as LockType) : null

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-red-600 dark:text-red-400',
          className
        )}
      >
        <Lock className="h-4 w-4" />
        <span>
          {check.messageAr && isArabic
            ? check.messageAr
            : check.message ||
              `${t('lockDates.dateLockedCompact')} (${format(new Date(check.lock_date!), 'PP', { locale: isArabic ? ar : enUS })})`}
        </span>
      </div>
    )
  }

  return (
    <Alert variant="destructive" className={cn(className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <Lock className="h-4 w-4" />
        {t('lockDates.dateLocked')}
        {lockConfig && (
          <span className="text-xs font-normal opacity-75">
            ({isArabic ? lockConfig.labelAr : lockConfig.label})
          </span>
        )}
      </AlertTitle>
      <AlertDescription>
        {check.messageAr && isArabic
          ? check.messageAr
          : check.message ||
            `${t('lockDates.cannotModify')} ${format(new Date(check.lock_date!), 'PP', {
              locale: isArabic ? ar : enUS,
            })}`}
      </AlertDescription>
    </Alert>
  )
}

export default DateLockedWarning

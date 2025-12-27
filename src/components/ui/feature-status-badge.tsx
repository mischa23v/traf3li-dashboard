/**
 * Feature Status Badge Component
 *
 * Displays the implementation status of a feature.
 * Use this to indicate when a feature is coming soon or not yet available.
 *
 * @example
 * ```tsx
 * import { FeatureStatusBadge } from '@/components/ui/feature-status-badge'
 * import { useFeatureFlag } from '@/hooks/useFeatureFlag'
 *
 * function MFASection() {
 *   const { isEnabled, status } = useFeatureFlag('MFA')
 *
 *   if (!isEnabled) {
 *     return <FeatureStatusBadge status={status} />
 *   }
 *
 *   return <MFASettings />
 * }
 * ```
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { FeatureStatus, type FeatureStatusType } from '@/config/feature-flags'
import { Clock, AlertCircle, Settings, FlaskConical, CheckCircle2 } from 'lucide-react'

interface FeatureStatusBadgeProps {
  status: FeatureStatusType
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_CONFIG: Record<
  FeatureStatusType,
  {
    label: string
    labelAr: string
    className: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  [FeatureStatus.AVAILABLE]: {
    label: 'Available',
    labelAr: 'متاح',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    icon: CheckCircle2,
  },
  [FeatureStatus.NOT_IMPLEMENTED]: {
    label: 'Coming Soon',
    labelAr: 'قريباً',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: Clock,
  },
  [FeatureStatus.NOT_MOUNTED]: {
    label: 'In Development',
    labelAr: 'قيد التطوير',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    icon: Settings,
  },
  [FeatureStatus.PARTIAL]: {
    label: 'Limited',
    labelAr: 'محدود',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    icon: AlertCircle,
  },
  [FeatureStatus.TEST_ONLY]: {
    label: 'Test Mode',
    labelAr: 'وضع الاختبار',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    icon: FlaskConical,
  },
}

const SIZE_CLASSES = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-0.5 [&>svg]:size-2.5',
  md: 'text-xs px-2 py-0.5 gap-1 [&>svg]:size-3',
  lg: 'text-sm px-2.5 py-1 gap-1.5 [&>svg]:size-4',
}

export function FeatureStatusBadge({
  status,
  className,
  showIcon = true,
  size = 'md',
}: FeatureStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border font-medium whitespace-nowrap shrink-0',
        SIZE_CLASSES[size],
        config.className,
        className
      )}
      dir="auto"
    >
      {showIcon && <Icon className="shrink-0" />}
      <span className="ltr:block rtl:hidden">{config.label}</span>
      <span className="rtl:block ltr:hidden">{config.labelAr}</span>
    </span>
  )
}

/**
 * Feature Gate Component
 *
 * Conditionally renders children based on feature availability.
 * Shows a fallback (default: FeatureStatusBadge) when feature is not enabled.
 *
 * @example
 * ```tsx
 * <FeatureGate feature="MFA">
 *   <MFASettings />
 * </FeatureGate>
 *
 * // With custom fallback
 * <FeatureGate feature="SSO" fallback={<UpgradePrompt />}>
 *   <SSOConfig />
 * </FeatureGate>
 * ```
 */
interface FeatureGateProps {
  feature: import('@/config/feature-flags').FeatureName
  children: React.ReactNode
  fallback?: React.ReactNode
  showBadge?: boolean
}

export function FeatureGate({
  feature,
  children,
  fallback,
  showBadge = true,
}: FeatureGateProps) {
  const { isFeatureEnabled, getFeatureDetails } = require('@/config/feature-flags')
  const isEnabled = isFeatureEnabled(feature)

  if (isEnabled) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showBadge) {
    const details = getFeatureDetails(feature)
    return <FeatureStatusBadge status={details?.status ?? 'not_implemented'} />
  }

  return null
}

export default FeatureStatusBadge

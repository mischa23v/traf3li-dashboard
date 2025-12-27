/**
 * PlanBadge - Badge component showing user's current plan
 *
 * Usage:
 * <PlanBadge />
 * <PlanBadge plan="professional" />
 * <PlanBadge showTrial />
 */

import React from 'react'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth-store'
import { Badge } from '@/components/ui/badge'
import { Crown, Lock, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Plan } from './plan-gate'
import { ROUTES } from '@/constants/routes'

// Plan display configuration
const PLAN_CONFIG: Record<Plan, {
  nameAr: string
  nameEn: string
  color: string
  bgColor: string
  textColor: string
  borderColor: string
  icon: React.ReactNode
}> = {
  free: {
    nameAr: 'مجانية',
    nameEn: 'Free',
    color: 'gray',
    bgColor: 'bg-gray-100 dark:bg-gray-900',
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-300 dark:border-gray-700',
    icon: <Lock className="size-3" />,
  },
  starter: {
    nameAr: 'مبتدئة',
    nameEn: 'Starter',
    color: 'blue',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-300 dark:border-blue-700',
    icon: <Sparkles className="size-3" />,
  },
  professional: {
    nameAr: 'احترافية',
    nameEn: 'Professional',
    color: 'purple',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-300 dark:border-purple-700',
    icon: <Crown className="size-3" />,
  },
  enterprise: {
    nameAr: 'مؤسسية',
    nameEn: 'Enterprise',
    color: 'amber',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-300 dark:border-amber-700',
    icon: <Crown className="size-3" />,
  },
}

interface PlanBadgeProps {
  /** Override plan (uses current user's plan if not specified) */
  plan?: Plan
  /** Show trial indicator if user is on trial */
  showTrial?: boolean
  /** Show plan icon */
  showIcon?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
  /** Clickable badge (navigates to billing) */
  clickable?: boolean
}

export function PlanBadge({
  plan,
  showTrial = true,
  showIcon = true,
  size = 'md',
  className,
  clickable = false,
}: PlanBadgeProps) {
  const user = useAuthStore((state) => state.user)
  const isArabic = i18n.language === 'ar'

  const currentPlan = plan || user?.plan || 'free'
  const config = PLAN_CONFIG[currentPlan]

  // Check if user is on trial
  const isOnTrial = showTrial && user?.trialEndsAt && new Date(user.trialEndsAt) > new Date()

  // Calculate trial days remaining
  const getTrialDaysRemaining = () => {
    if (!user?.trialEndsAt) return 0
    const trialEnd = new Date(user.trialEndsAt)
    const now = new Date()
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysRemaining)
  }

  const trialDays = isOnTrial ? getTrialDaysRemaining() : 0

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  }

  const iconSizeClasses = {
    sm: 'size-2.5',
    md: 'size-3',
    lg: 'size-3.5',
  }

  const content = (
    <div className="flex items-center gap-1">
      {showIcon && (
        <span className={iconSizeClasses[size]}>
          {config.icon}
        </span>
      )}
      <span className="font-medium">
        {isArabic ? config.nameAr : config.nameEn}
      </span>
      {isOnTrial && (
        <>
          <span className="mx-0.5">•</span>
          <Zap className={cn('shrink-0', iconSizeClasses[size])} />
          <span className="text-[0.7em] opacity-90">
            {isArabic
              ? `تجربة (${trialDays} ${trialDays === 1 ? 'يوم' : 'أيام'})`
              : `Trial (${trialDays} ${trialDays === 1 ? 'day' : 'days'})`}
          </span>
        </>
      )}
    </div>
  )

  if (clickable) {
    return (
      <Badge
        asChild
        className={cn(
          sizeClasses[size],
          config.bgColor,
          config.textColor,
          config.borderColor,
          'cursor-pointer hover:opacity-80 transition-opacity',
          className
        )}
      >
        <a href={ROUTES.settings.billing}>
          {content}
        </a>
      </Badge>
    )
  }

  return (
    <Badge
      className={cn(
        sizeClasses[size],
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {content}
    </Badge>
  )
}

/**
 * Compact plan indicator (just icon + color, no text)
 * Useful for tables or tight spaces
 */
export function PlanIndicator({
  plan,
  size = 'md',
  className,
}: {
  plan?: Plan
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const user = useAuthStore((state) => state.user)
  const currentPlan = plan || user?.plan || 'free'
  const config = PLAN_CONFIG[currentPlan]

  const sizeClasses = {
    sm: 'size-5',
    md: 'size-6',
    lg: 'size-8',
  }

  const iconSizeClasses = {
    sm: 'size-2.5',
    md: 'size-3',
    lg: 'size-4',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        sizeClasses[size],
        config.bgColor,
        config.textColor,
        className
      )}
      title={config.nameEn}
    >
      <span className={iconSizeClasses[size]}>
        {config.icon}
      </span>
    </div>
  )
}

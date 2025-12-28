/**
 * Stale Lead Indicator Component
 * Visual indicator for leads that have been stuck in a stage too long
 */

'use client'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/hooks/use-language'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertTriangle,
  Clock,
  Flame,
  Snowflake,
  TrendingDown,
} from 'lucide-react'
import { STALE_THRESHOLDS } from '@/constants/crm-constants'

interface StaleLeadIndicatorProps {
  daysInStage: number
  threshold?: number
  showDays?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'badge' | 'icon' | 'text'
  className?: string
}

type StaleLevel = 'fresh' | 'warning' | 'stale' | 'dormant'

interface StaleLevelConfig {
  level: StaleLevel
  icon: typeof Clock
  color: string
  bgColor: string
  borderColor: string
  labelAr: string
  labelEn: string
}

const STALE_LEVELS: StaleLevelConfig[] = [
  {
    level: 'fresh',
    icon: Flame,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    labelAr: 'نشط',
    labelEn: 'Active',
  },
  {
    level: 'warning',
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    labelAr: 'تحتاج متابعة',
    labelEn: 'Needs Attention',
  },
  {
    level: 'stale',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    labelAr: 'خامل',
    labelEn: 'Stale',
  },
  {
    level: 'dormant',
    icon: Snowflake,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    labelAr: 'راكد',
    labelEn: 'Dormant',
  },
]

function getStaleLevel(days: number, customThreshold?: number): StaleLevelConfig {
  const thresholds = customThreshold
    ? {
        warning: Math.floor(customThreshold * 0.5),
        stale: customThreshold,
        dormant: customThreshold * 2,
      }
    : STALE_THRESHOLDS

  if (days >= thresholds.dormant) return STALE_LEVELS[3]
  if (days >= thresholds.stale) return STALE_LEVELS[2]
  if (days >= thresholds.warning) return STALE_LEVELS[1]
  return STALE_LEVELS[0]
}

function formatDays(days: number, isRTL: boolean): string {
  if (days === 0) return isRTL ? 'اليوم' : 'Today'
  if (days === 1) return isRTL ? 'يوم واحد' : '1 day'
  if (days < 7) return isRTL ? `${days} أيام` : `${days} days`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return isRTL ? `${weeks} أسبوع` : `${weeks}w`
  }
  const months = Math.floor(days / 30)
  return isRTL ? `${months} شهر` : `${months}mo`
}

export function StaleLeadIndicator({
  daysInStage,
  threshold,
  showDays = true,
  size = 'default',
  variant = 'badge',
  className,
}: StaleLeadIndicatorProps) {
  const { isRTL } = useLanguage()
  const config = getStaleLevel(daysInStage, threshold)
  const Icon = config.icon

  const sizeClasses = {
    sm: {
      badge: 'text-xs px-1.5 py-0.5',
      icon: 'w-3 h-3',
      text: 'text-xs',
    },
    default: {
      badge: 'text-sm px-2 py-1',
      icon: 'w-4 h-4',
      text: 'text-sm',
    },
    lg: {
      badge: 'text-base px-3 py-1.5',
      icon: 'w-5 h-5',
      text: 'text-base',
    },
  }

  const tooltipContent = (
    <div className="text-center">
      <p className="font-medium">{isRTL ? config.labelAr : config.labelEn}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {isRTL
          ? `${daysInStage} يوم في هذه المرحلة`
          : `${daysInStage} days in this stage`}
      </p>
    </div>
  )

  // Icon only variant
  if (variant === 'icon') {
    // Don't show anything for fresh leads
    if (config.level === 'fresh') return null

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('inline-flex', className)}>
              <Icon className={cn(sizeClasses[size].icon, config.color)} />
            </div>
          </TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Text only variant
  if (variant === 'text') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn(
              'inline-flex items-center gap-1',
              sizeClasses[size].text,
              config.color,
              className
            )}>
              <Icon className={sizeClasses[size].icon} />
              {showDays && formatDays(daysInStage, isRTL)}
            </span>
          </TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Badge variant (default)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              'inline-flex items-center gap-1',
              config.bgColor,
              config.color,
              config.borderColor,
              sizeClasses[size].badge,
              className
            )}
          >
            <Icon className={sizeClasses[size].icon} />
            {showDays && formatDays(daysInStage, isRTL)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ═══════════════════════════════════════════════════════════════
// STALE LEAD ALERT BANNER
// ═══════════════════════════════════════════════════════════════

interface StaleLeadAlertProps {
  daysInStage: number
  threshold?: number
  onFollowUp?: () => void
  onSnooze?: () => void
  className?: string
}

export function StaleLeadAlert({
  daysInStage,
  threshold,
  onFollowUp,
  onSnooze,
  className,
}: StaleLeadAlertProps) {
  const { isRTL } = useLanguage()
  const config = getStaleLevel(daysInStage, threshold)

  // Don't show alert for fresh leads
  if (config.level === 'fresh') return null

  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          config.bgColor
        )}>
          <Icon className={cn('w-5 h-5', config.color)} />
        </div>
        <div>
          <p className={cn('font-medium', config.color)}>
            {isRTL ? config.labelAr : config.labelEn}
          </p>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? `هذا العميل في نفس المرحلة منذ ${daysInStage} يوم`
              : `This lead has been in the same stage for ${daysInStage} days`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onSnooze && (
          <button
            type="button"
            onClick={onSnooze}
            className={cn(
              'text-sm px-3 py-1.5 rounded-md border bg-background hover:bg-muted',
              config.borderColor
            )}
          >
            {isRTL ? 'تأجيل' : 'Snooze'}
          </button>
        )}
        {onFollowUp && (
          <button
            type="button"
            onClick={onFollowUp}
            className={cn(
              'text-sm px-3 py-1.5 rounded-md text-white',
              config.level === 'dormant' ? 'bg-red-600 hover:bg-red-700' :
              config.level === 'stale' ? 'bg-orange-600 hover:bg-orange-700' :
              'bg-amber-600 hover:bg-amber-700'
            )}
          >
            {isRTL ? 'متابعة الآن' : 'Follow Up Now'}
          </button>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// STALE LEADS SUMMARY
// ═══════════════════════════════════════════════════════════════

interface StaleLeadsSummaryProps {
  totalLeads: number
  staleCount: number
  dormantCount: number
  warningCount: number
  className?: string
}

export function StaleLeadsSummary({
  totalLeads,
  staleCount,
  dormantCount,
  warningCount,
  className,
}: StaleLeadsSummaryProps) {
  const { isRTL } = useLanguage()
  const freshCount = totalLeads - staleCount - dormantCount - warningCount

  const segments = [
    { count: freshCount, config: STALE_LEVELS[0] },
    { count: warningCount, config: STALE_LEVELS[1] },
    { count: staleCount, config: STALE_LEVELS[2] },
    { count: dormantCount, config: STALE_LEVELS[3] },
  ]

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
        {segments.map((segment, index) => {
          if (segment.count === 0) return null
          const percentage = (segment.count / totalLeads) * 100
          return (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn('h-full', segment.config.bgColor)}
                    style={{ width: `${percentage}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isRTL ? segment.config.labelAr : segment.config.labelEn}: {segment.count}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded', segment.config.bgColor)} />
            <span className="text-muted-foreground">
              {isRTL ? segment.config.labelAr : segment.config.labelEn}
            </span>
            <span className="font-medium">{segment.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StaleLeadIndicator

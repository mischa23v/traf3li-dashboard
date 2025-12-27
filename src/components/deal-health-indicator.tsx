import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

export interface DealHealthFactor {
  name: string
  score: number // 0-100
  weight: number
}

export interface DealHealthIndicatorProps {
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  score?: number // 0-100
  factors?: DealHealthFactor[]
  mode?: 'compact' | 'full'
  showTooltip?: boolean
  className?: string
}

const GRADE_CONFIG: Record<
  'A' | 'B' | 'C' | 'D' | 'F',
  { color: string; bgColor: string; textColor: string; progressColor: string }
> = {
  A: {
    color: '#22c55e',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    textColor: 'text-green-600 dark:text-green-400',
    progressColor: 'bg-green-600',
  },
  B: {
    color: '#3b82f6',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    textColor: 'text-blue-600 dark:text-blue-400',
    progressColor: 'bg-blue-600',
  },
  C: {
    color: '#eab308',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    progressColor: 'bg-yellow-600',
  },
  D: {
    color: '#f97316',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    textColor: 'text-orange-600 dark:text-orange-400',
    progressColor: 'bg-orange-600',
  },
  F: {
    color: '#ef4444',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    textColor: 'text-red-600 dark:text-red-400',
    progressColor: 'bg-red-600',
  },
}

export const DealHealthIndicator = memo(function DealHealthIndicator({
  grade,
  score,
  factors = [],
  mode = 'compact',
  showTooltip = true,
  className,
}: DealHealthIndicatorProps) {
  const { t } = useTranslation()
  const config = GRADE_CONFIG[grade]

  const CompactMode = () => (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-3 py-1.5 font-bold transition-all duration-200',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span className="text-lg leading-none">{grade}</span>
      {score !== undefined && (
        <span className="ms-2 text-sm font-medium opacity-75">
          {Math.round(score)}%
        </span>
      )}
    </div>
  )

  const FullMode = () => (
    <div
      className={cn(
        'rounded-xl border p-6 transition-all duration-200',
        config.bgColor,
        'border-current/20',
        className
      )}
    >
      {/* Grade Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            {t('dealHealth.label')}
          </h3>
          <div className="flex items-baseline gap-2">
            <span
              className={cn('text-5xl font-bold leading-none', config.textColor)}
            >
              {grade}
            </span>
            {score !== undefined && (
              <span className={cn('text-xl font-semibold', config.textColor)}>
                {Math.round(score)}%
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold',
            config.bgColor,
            config.textColor
          )}
          style={{ borderColor: config.color, borderWidth: 3 }}
        >
          {grade}
        </div>
      </div>

      {/* Overall Progress */}
      {score !== undefined && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {t('dealHealth.overallScore')}
            </span>
            <span className={cn('font-semibold', config.textColor)}>
              {Math.round(score)}%
            </span>
          </div>
          <Progress
            value={score}
            className="h-2"
            indicatorClassName={config.progressColor}
          />
        </div>
      )}

      {/* Factor Breakdown */}
      {factors.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t('dealHealth.factors')}
          </h4>
          {factors.map((factor, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {factor.name}
                  {factor.weight > 0 && (
                    <span className="ms-1 opacity-60">
                      ({Math.round(factor.weight * 100)}%)
                    </span>
                  )}
                </span>
                <span className={cn('font-semibold', config.textColor)}>
                  {Math.round(factor.score)}%
                </span>
              </div>
              <Progress
                value={factor.score}
                className="h-1.5"
                indicatorClassName={cn(
                  'transition-all duration-300',
                  getFactorProgressColor(factor.score)
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const TooltipFactorList = () => {
    if (!factors.length) return null

    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold opacity-90">
          {t('dealHealth.factors')}:
        </div>
        {factors.map((factor, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex-1">
              {factor.name}
              {factor.weight > 0 && (
                <span className="ms-1 opacity-70">
                  ({Math.round(factor.weight * 100)}%)
                </span>
              )}
            </span>
            <span className="font-semibold tabular-nums">
              {Math.round(factor.score)}%
            </span>
          </div>
        ))}
      </div>
    )
  }

  const content = mode === 'compact' ? <CompactMode /> : <FullMode />

  if (showTooltip && mode === 'compact') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs"
          sideOffset={8}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold">
                {t('dealHealth.grade')}: {grade}
              </span>
              {score !== undefined && (
                <span className="text-sm font-semibold tabular-nums">
                  {Math.round(score)}%
                </span>
              )}
            </div>
            <TooltipFactorList />
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
})

// Helper function to determine progress bar color based on score
function getFactorProgressColor(score: number): string {
  if (score >= 90) return 'bg-green-600'
  if (score >= 80) return 'bg-blue-600'
  if (score >= 70) return 'bg-yellow-600'
  if (score >= 60) return 'bg-orange-600'
  return 'bg-red-600'
}

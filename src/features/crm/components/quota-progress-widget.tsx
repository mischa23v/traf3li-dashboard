/**
 * Quota Progress Widget
 * Display sales quota progress with targets and achievements
 */

'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Icons
import {
  Target,
  TrendingUp,
  TrendingDown,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  FileCheck,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronRight,
} from 'lucide-react'

// Types
import type { SalesQuota } from '@/types/crm-enhanced'

interface QuotaProgressWidgetProps {
  quota?: SalesQuota
  isLoading?: boolean
  onViewDetails?: () => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════
// QUOTA STATUS HELPERS
// ═══════════════════════════════════════════════════════════════

type QuotaStatus = 'on_track' | 'at_risk' | 'behind' | 'exceeded' | 'completed'

function getQuotaStatus(achieved: number, target: number, daysRemaining: number, totalDays: number): QuotaStatus {
  const progressRate = (achieved / target) * 100
  const timeProgress = ((totalDays - daysRemaining) / totalDays) * 100

  if (achieved >= target) return 'exceeded'
  if (daysRemaining === 0 && achieved >= target * 0.9) return 'completed'
  if (progressRate >= timeProgress * 1.1) return 'on_track'
  if (progressRate >= timeProgress * 0.8) return 'at_risk'
  return 'behind'
}

function getStatusConfig(status: QuotaStatus, isRTL: boolean) {
  const configs: Record<QuotaStatus, { color: string; bgColor: string; icon: typeof Trophy; labelAr: string; labelEn: string }> = {
    exceeded: {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: Trophy,
      labelAr: 'تجاوز الهدف',
      labelEn: 'Exceeded',
    },
    completed: {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: CheckCircle2,
      labelAr: 'مكتمل',
      labelEn: 'Completed',
    },
    on_track: {
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      icon: TrendingUp,
      labelAr: 'على المسار',
      labelEn: 'On Track',
    },
    at_risk: {
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      icon: AlertTriangle,
      labelAr: 'في خطر',
      labelEn: 'At Risk',
    },
    behind: {
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: TrendingDown,
      labelAr: 'متأخر',
      labelEn: 'Behind',
    },
  }
  return configs[status]
}

// ═══════════════════════════════════════════════════════════════
// CIRCULAR PROGRESS INDICATOR
// ═══════════════════════════════════════════════════════════════

function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  status,
}: {
  value: number
  size?: number
  strokeWidth?: number
  status: QuotaStatus
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(value, 100) / 100) * circumference

  const colors: Record<QuotaStatus, string> = {
    exceeded: '#16a34a',
    completed: '#2563eb',
    on_track: '#059669',
    at_risk: '#d97706',
    behind: '#dc2626',
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={colors[status]}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(value)}%</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// METRIC CARD
// ═══════════════════════════════════════════════════════════════

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  className,
}: {
  icon: typeof DollarSign
  label: string
  value: string | number
  subValue?: string
  trend?: { value: number; isPositive: boolean }
  className?: string
}) {
  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-lg bg-muted/30', className)}>
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-lg">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        )}
      </div>
      {trend && (
        <div className={cn(
          'flex items-center gap-1 text-xs',
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          {trend.isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN WIDGET
// ═══════════════════════════════════════════════════════════════

export function QuotaProgressWidget({
  quota,
  isLoading = false,
  onViewDetails,
  className,
}: QuotaProgressWidgetProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Skeleton className="w-[120px] h-[120px] rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No quota
  if (!quota) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <h4 className="font-medium">
            {isRTL ? 'لا يوجد حصة محددة' : 'No Quota Set'}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL
              ? 'حدد أهداف المبيعات لتتبع التقدم'
              : 'Set sales targets to track progress'}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate metrics
  const progressPercent = (quota.achieved / quota.target) * 100
  const remaining = Math.max(0, quota.target - quota.achieved)

  // Calculate days remaining
  const endDate = new Date(quota.end_date)
  const startDate = new Date(quota.start_date)
  const today = new Date()
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

  const status = getQuotaStatus(quota.achieved, quota.target, daysRemaining, totalDays)
  const statusConfig = getStatusConfig(status, isRTL)
  const StatusIcon = statusConfig.icon

  // Calculate required daily/weekly pace
  const requiredDaily = daysRemaining > 0 ? remaining / daysRemaining : 0
  const requiredWeekly = requiredDaily * 7

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {isRTL ? 'حصة المبيعات' : 'Sales Quota'}
            </CardTitle>
            <CardDescription>
              {quota.period === 'monthly' && (isRTL ? 'شهري' : 'Monthly')}
              {quota.period === 'quarterly' && (isRTL ? 'ربع سنوي' : 'Quarterly')}
              {quota.period === 'yearly' && (isRTL ? 'سنوي' : 'Yearly')}
              {' • '}
              {new Date(quota.start_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short' })}
              {' - '}
              {new Date(quota.end_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', year: 'numeric' })}
            </CardDescription>
          </div>
          <Badge className={cn('gap-1', statusConfig.bgColor, statusConfig.color)}>
            <StatusIcon className="w-3 h-3" />
            {isRTL ? statusConfig.labelAr : statusConfig.labelEn}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Progress */}
        <div className="flex items-center gap-6">
          <CircularProgress value={progressPercent} status={status} />

          <div className="flex-1 space-y-4">
            {/* Achieved vs Target */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{formatCurrency(quota.achieved)}</span>
                <span className="text-muted-foreground">/ {formatCurrency(quota.target)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {remaining > 0
                  ? (isRTL ? `${formatCurrency(remaining)} متبقي` : `${formatCurrency(remaining)} remaining`)
                  : (isRTL ? 'تم تحقيق الهدف!' : 'Target achieved!')}
              </p>
            </div>

            {/* Time Progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isRTL ? 'الوقت المتبقي' : 'Time Remaining'}
                </span>
                <span className="font-medium">
                  {daysRemaining} {isRTL ? 'يوم' : 'days'}
                </span>
              </div>
              <Progress
                value={((totalDays - daysRemaining) / totalDays) * 100}
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={DollarSign}
            label={isRTL ? 'المطلوب يومياً' : 'Required Daily'}
            value={formatCurrency(requiredDaily)}
            subValue={isRTL ? 'للوصول للهدف' : 'to reach target'}
          />
          <MetricCard
            icon={Calendar}
            label={isRTL ? 'المطلوب أسبوعياً' : 'Required Weekly'}
            value={formatCurrency(requiredWeekly)}
            subValue={isRTL ? 'للوصول للهدف' : 'to reach target'}
          />
        </div>

        {/* Breakdown by Type */}
        {quota.breakdown_by_type && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {isRTL ? 'التفاصيل حسب النوع' : 'Breakdown by Type'}
            </h4>
            <div className="space-y-2">
              {Object.entries(quota.breakdown_by_type).map(([type, data]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(data.achieved)} / {formatCurrency(data.target)}
                      </span>
                    </div>
                    <Progress
                      value={(data.achieved / data.target) * 100}
                      className="h-1.5"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Details Button */}
        {onViewDetails && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onViewDetails}
          >
            {isRTL ? 'عرض التفاصيل' : 'View Details'}
            <ChevronRight className={cn('w-4 h-4', isRTL ? 'mr-2 rotate-180' : 'ml-2')} />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════
// QUOTA LEADERBOARD
// ═══════════════════════════════════════════════════════════════

interface QuotaLeaderboardProps {
  quotas?: Array<SalesQuota & { user_name: string; user_avatar?: string }>
  isLoading?: boolean
  className?: string
}

export function QuotaLeaderboard({
  quotas = [],
  isLoading = false,
  className,
}: QuotaLeaderboardProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-2 w-full" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const sortedQuotas = [...quotas].sort((a, b) =>
    (b.achieved / b.target) - (a.achieved / a.target)
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="w-4 h-4 text-amber-500" />
          {isRTL ? 'قائمة المتصدرين' : 'Leaderboard'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {sortedQuotas.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{isRTL ? 'لا توجد بيانات' : 'No data available'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedQuotas.slice(0, 5).map((quota, index) => {
              const progress = (quota.achieved / quota.target) * 100
              const isTop3 = index < 3

              return (
                <div key={quota.id} className="flex items-center gap-3">
                  {/* Rank */}
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    index === 0 && 'bg-amber-100 text-amber-600',
                    index === 1 && 'bg-gray-100 text-gray-600',
                    index === 2 && 'bg-orange-100 text-orange-600',
                    index > 2 && 'bg-muted text-muted-foreground'
                  )}>
                    {index + 1}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">{quota.user_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(quota.achieved)} / {formatCurrency(quota.target)}
                    </p>
                  </div>

                  {/* Achievement Icon */}
                  {progress >= 100 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Flame className="w-5 h-5 text-orange-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          {isRTL ? 'تجاوز الهدف!' : 'Exceeded Target!'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════
// QUOTA COMPARISON CHART
// ═══════════════════════════════════════════════════════════════

interface QuotaComparisonProps {
  periods?: Array<{
    label: string
    target: number
    achieved: number
  }>
  isLoading?: boolean
  className?: string
}

export function QuotaComparison({
  periods = [],
  isLoading = false,
  className,
}: QuotaComparisonProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 h-48">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="flex-1" style={{ height: `${40 + Math.random() * 60}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...periods.flatMap(p => [p.target, p.achieved]))

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {isRTL ? 'مقارنة الفترات' : 'Period Comparison'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {periods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{isRTL ? 'لا توجد بيانات' : 'No data available'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart */}
            <div className="flex items-end gap-2 h-40">
              {periods.map((period, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex gap-1 w-full h-full items-end">
                    {/* Target Bar */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="flex-1 bg-muted rounded-t transition-all hover:bg-muted/80"
                            style={{ height: `${(period.target / maxValue) * 100}%` }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isRTL ? 'الهدف:' : 'Target:'} {formatCurrency(period.target)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Achieved Bar */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'flex-1 rounded-t transition-all',
                              period.achieved >= period.target ? 'bg-green-500' : 'bg-primary'
                            )}
                            style={{ height: `${(period.achieved / maxValue) * 100}%` }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isRTL ? 'المحقق:' : 'Achieved:'} {formatCurrency(period.achieved)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-xs text-muted-foreground">{period.label}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted" />
                <span className="text-muted-foreground">{isRTL ? 'الهدف' : 'Target'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-muted-foreground">{isRTL ? 'المحقق' : 'Achieved'}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QuotaProgressWidget

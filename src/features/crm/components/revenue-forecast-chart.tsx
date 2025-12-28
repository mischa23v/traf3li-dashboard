/**
 * Revenue Forecast Chart Component
 * Interactive forecast visualization with probability weighting
 */

'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/hooks/use-language'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  LineChart,
} from 'lucide-react'

// Types
import type { RevenueForecast, ForecastByStage } from '@/types/crm-enhanced'

interface RevenueForecastChartProps {
  forecasts: RevenueForecast[]
  byStage?: ForecastByStage[]
  view?: 'monthly' | 'quarterly' | 'yearly'
  onViewChange?: (view: 'monthly' | 'quarterly' | 'yearly') => void
  showProbability?: boolean
  currency?: string
  className?: string
}

// Mock data for demonstration
const MOCK_FORECASTS: RevenueForecast[] = [
  {
    period: '2024-01',
    expected_revenue: 150000,
    prorated_revenue: 97500,
    best_case: 180000,
    worst_case: 75000,
    leads_count: 12,
    avg_probability: 65,
  },
  {
    period: '2024-02',
    expected_revenue: 200000,
    prorated_revenue: 140000,
    best_case: 250000,
    worst_case: 100000,
    leads_count: 15,
    avg_probability: 70,
  },
  {
    period: '2024-03',
    expected_revenue: 175000,
    prorated_revenue: 105000,
    best_case: 220000,
    worst_case: 87500,
    leads_count: 10,
    avg_probability: 60,
  },
  {
    period: '2024-04',
    expected_revenue: 225000,
    prorated_revenue: 157500,
    best_case: 280000,
    worst_case: 112500,
    leads_count: 18,
    avg_probability: 70,
  },
]

const MOCK_BY_STAGE: ForecastByStage[] = [
  { stage_id: '1', stage_name: 'Qualified', leads_count: 25, total_value: 500000, prorated_value: 125000, avg_days_in_stage: 5 },
  { stage_id: '2', stage_name: 'Proposal', leads_count: 15, total_value: 375000, prorated_value: 187500, avg_days_in_stage: 10 },
  { stage_id: '3', stage_name: 'Negotiation', leads_count: 8, total_value: 200000, prorated_value: 150000, avg_days_in_stage: 15 },
]

// ═══════════════════════════════════════════════════════════════
// FORMAT CURRENCY
// ═══════════════════════════════════════════════════════════════

function formatCurrency(value: number, currency = 'SAR', locale = 'ar-SA'): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M ${currency}`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K ${currency}`
  }
  return `${value.toLocaleString(locale)} ${currency}`
}

// ═══════════════════════════════════════════════════════════════
// SUMMARY STATS
// ═══════════════════════════════════════════════════════════════

function ForecastSummaryStats({
  forecasts,
  currency,
  isRTL,
}: {
  forecasts: RevenueForecast[]
  currency: string
  isRTL: boolean
}) {
  const totals = useMemo(() => {
    return forecasts.reduce(
      (acc, f) => ({
        expected: acc.expected + f.expected_revenue,
        prorated: acc.prorated + f.prorated_revenue,
        bestCase: acc.bestCase + f.best_case,
        worstCase: acc.worstCase + f.worst_case,
        leads: acc.leads + f.leads_count,
      }),
      { expected: 0, prorated: 0, bestCase: 0, worstCase: 0, leads: 0 }
    )
  }, [forecasts])

  const avgProbability = Math.round(
    forecasts.reduce((sum, f) => sum + f.avg_probability, 0) / forecasts.length
  )

  const stats = [
    {
      label: isRTL ? 'الإيرادات المتوقعة' : 'Expected Revenue',
      value: formatCurrency(totals.expected, currency),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: isRTL ? 'القيمة المرجحة' : 'Weighted Value',
      value: formatCurrency(totals.prorated, currency),
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: isRTL ? 'أفضل سيناريو' : 'Best Case',
      value: formatCurrency(totals.bestCase, currency),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: isRTL ? 'أسوأ سيناريو' : 'Worst Case',
      value: formatCurrency(totals.worstCase, currency),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg',
            stat.bgColor
          )}
        >
          <div className={cn('p-2 rounded-lg bg-white', stat.color)}>
            <stat.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={cn('font-bold', stat.color)}>{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BAR CHART VISUALIZATION
// ═══════════════════════════════════════════════════════════════

function ForecastBarChart({
  forecasts,
  showProbability,
  currency,
  isRTL,
}: {
  forecasts: RevenueForecast[]
  showProbability: boolean
  currency: string
  isRTL: boolean
}) {
  const maxValue = Math.max(...forecasts.map((f) => f.best_case))

  return (
    <div className="space-y-4">
      {forecasts.map((forecast, index) => {
        const expectedPercent = (forecast.expected_revenue / maxValue) * 100
        const proratedPercent = (forecast.prorated_revenue / maxValue) * 100
        const bestPercent = (forecast.best_case / maxValue) * 100
        const worstPercent = (forecast.worst_case / maxValue) * 100

        // Format period
        const [year, month] = forecast.period.split('-')
        const monthNames = isRTL
          ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
          : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const periodLabel = `${monthNames[parseInt(month) - 1]} ${year}`

        return (
          <div key={index} className="space-y-2">
            {/* Period Header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{periodLabel}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {forecast.leads_count} {isRTL ? 'عميل' : 'leads'}
                </Badge>
                {showProbability && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      forecast.avg_probability >= 70 ? 'bg-green-100 text-green-800' :
                      forecast.avg_probability >= 50 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    )}
                  >
                    {forecast.avg_probability}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Stacked Bar */}
            <TooltipProvider>
              <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
                {/* Worst Case (background) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute inset-y-0 bg-red-100"
                      style={{ width: `${bestPercent}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isRTL ? 'نطاق التوقعات' : 'Forecast Range'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(forecast.worst_case, currency)} - {formatCurrency(forecast.best_case, currency)}
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Expected (middle layer) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute inset-y-0 bg-blue-200"
                      style={{ width: `${expectedPercent}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isRTL ? 'المتوقع' : 'Expected'}</p>
                    <p className="font-bold">{formatCurrency(forecast.expected_revenue, currency)}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Prorated (top layer) */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute inset-y-0 bg-green-500 flex items-center justify-end px-2"
                      style={{ width: `${proratedPercent}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {formatCurrency(forecast.prorated_revenue, currency)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isRTL ? 'القيمة المرجحة' : 'Weighted Value'}</p>
                    <p className="font-bold">{formatCurrency(forecast.prorated_revenue, currency)}</p>
                    <p className="text-xs text-muted-foreground">
                      ({forecast.avg_probability}% {isRTL ? 'احتمالية' : 'probability'})
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 border-t text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>{isRTL ? 'القيمة المرجحة' : 'Weighted Value'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-200" />
          <span>{isRTL ? 'المتوقع' : 'Expected'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-100" />
          <span>{isRTL ? 'نطاق التوقعات' : 'Forecast Range'}</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BY STAGE VIEW
// ═══════════════════════════════════════════════════════════════

function ForecastByStageView({
  stages,
  currency,
  isRTL,
}: {
  stages: ForecastByStage[]
  currency: string
  isRTL: boolean
}) {
  const totalValue = stages.reduce((sum, s) => sum + s.total_value, 0)

  return (
    <div className="space-y-3">
      {stages.map((stage) => {
        const percentage = (stage.total_value / totalValue) * 100
        const proratedPercentage = (stage.prorated_value / stage.total_value) * 100

        return (
          <div key={stage.stage_id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{stage.stage_name}</span>
                <Badge variant="outline" className="text-xs">
                  {stage.leads_count}
                </Badge>
              </div>
              <div className="text-right">
                <span className="font-medium text-green-600">
                  {formatCurrency(stage.prorated_value, currency)}
                </span>
                <span className="text-muted-foreground mx-1">/</span>
                <span className="text-muted-foreground">
                  {formatCurrency(stage.total_value, currency)}
                </span>
              </div>
            </div>

            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 bg-blue-200"
                style={{ width: `${percentage}%` }}
              />
              <div
                className="absolute inset-y-0 bg-green-500"
                style={{ width: `${(proratedPercentage / 100) * percentage}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {isRTL
                ? `متوسط ${stage.avg_days_in_stage} يوم في المرحلة`
                : `Avg. ${stage.avg_days_in_stage} days in stage`}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function RevenueForecastChart({
  forecasts = MOCK_FORECASTS,
  byStage = MOCK_BY_STAGE,
  view = 'monthly',
  onViewChange,
  showProbability = true,
  currency = 'SAR',
  className,
}: RevenueForecastChartProps) {
  const { isRTL } = useLanguage()

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5" />
          {isRTL ? 'توقعات الإيرادات' : 'Revenue Forecast'}
        </CardTitle>

        {onViewChange && (
          <Select value={view} onValueChange={(v) => onViewChange(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">
                {isRTL ? 'شهري' : 'Monthly'}
              </SelectItem>
              <SelectItem value="quarterly">
                {isRTL ? 'ربع سنوي' : 'Quarterly'}
              </SelectItem>
              <SelectItem value="yearly">
                {isRTL ? 'سنوي' : 'Yearly'}
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <ForecastSummaryStats
          forecasts={forecasts}
          currency={currency}
          isRTL={isRTL}
        />

        {/* Main Chart */}
        <div>
          <h4 className="text-sm font-medium mb-4">
            {isRTL ? 'التوقعات حسب الفترة' : 'Forecast by Period'}
          </h4>
          <ForecastBarChart
            forecasts={forecasts}
            showProbability={showProbability}
            currency={currency}
            isRTL={isRTL}
          />
        </div>

        {/* By Stage */}
        {byStage && byStage.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-4">
              {isRTL ? 'التوقعات حسب المرحلة' : 'Forecast by Stage'}
            </h4>
            <ForecastByStageView
              stages={byStage}
              currency={currency}
              isRTL={isRTL}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RevenueForecastChart

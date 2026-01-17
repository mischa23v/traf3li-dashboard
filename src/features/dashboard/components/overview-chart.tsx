import { memo, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TFunction } from 'i18next'

interface OverviewChartProps {
  t: TFunction
  data?: { month: string; revenue: number }[]
  isLoading?: boolean
}

// Default data - always show 12 months (Jan-Dec)
const generateDefaultData = (t: TFunction) => {
  const months = [
    t('calendar.months.january', 'Jan'),
    t('calendar.months.february', 'Feb'),
    t('calendar.months.march', 'Mar'),
    t('calendar.months.april', 'Apr'),
    t('calendar.months.may', 'May'),
    t('calendar.months.june', 'Jun'),
    t('calendar.months.july', 'Jul'),
    t('calendar.months.august', 'Aug'),
    t('calendar.months.september', 'Sep'),
    t('calendar.months.october', 'Oct'),
    t('calendar.months.november', 'Nov'),
    t('calendar.months.december', 'Dec'),
  ]

  return months.map((month) => ({
    month: month.substring(0, 3),
    revenue: 0,
  }))
}

export const OverviewChart = memo(function OverviewChart({
  t,
  data,
  isLoading
}: OverviewChartProps) {
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data
    return generateDefaultData(t)
  }, [data, t])

  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.revenue))
    return max > 0 ? max : 6000 // Default max for empty data
  }, [chartData])

  // Loading state
  if (isLoading) {
    return (
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            {t('dashboard.overview.chartTitle', 'Overview')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="flex items-center justify-center h-[350px]">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Always show monthly bar chart (Jan-Dec) - like shadcn-admin
  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          {t('dashboard.overview.chartTitle', 'Overview')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[350px] flex items-end gap-2">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between h-full text-xs text-slate-400 pe-2 pb-6">
            <span>${(maxValue).toLocaleString()}</span>
            <span>${(maxValue * 0.75).toLocaleString()}</span>
            <span>${(maxValue * 0.5).toLocaleString()}</span>
            <span>${(maxValue * 0.25).toLocaleString()}</span>
            <span>$0</span>
          </div>

          {/* Bars */}
          <div className="flex-1 flex items-end gap-2 h-full">
            {chartData.map((item, index) => {
              const heightPercent = maxValue > 0 ? (item.revenue / maxValue) * 100 : 0
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full h-[300px] flex items-end">
                    <div
                      className="w-full bg-slate-900 rounded-t-sm transition-all duration-500 hover:bg-slate-700 cursor-pointer group relative"
                      style={{ height: `${heightPercent}%`, minHeight: item.revenue > 0 ? '4px' : '2px' }}
                      title={`${item.month}: $${item.revenue.toLocaleString()}`}
                    >
                      {/* Tooltip on hover */}
                      {item.revenue > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          ${item.revenue.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {item.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

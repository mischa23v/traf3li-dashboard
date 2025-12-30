import { memo, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TFunction } from 'i18next'

interface OverviewChartProps {
  t: TFunction
  data?: { month: string; revenue: number }[]
}

// Default data when no real data is available
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
    revenue: 0, // Start with zero - will be populated by real data
  }))
}

export const OverviewChart = memo(function OverviewChart({ t, data }: OverviewChartProps) {
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data
    return generateDefaultData(t)
  }, [data, t])

  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.revenue))
    return max > 0 ? max : 6000 // Default max for empty data
  }, [chartData])

  const hasData = chartData.some((d) => d.revenue > 0)

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm col-span-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          {t('dashboard.overview.chartTitle', 'Overview')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[350px] text-slate-400">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-medium">{t('dashboard.overview.noChartData', 'No data available yet')}</p>
            <p className="text-xs mt-1">{t('dashboard.overview.chartDataHint', 'Revenue data will appear here as cases are completed')}</p>
          </div>
        ) : (
          <div className="h-[350px] flex items-end gap-2">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between h-full text-xs text-slate-400 pe-2 pb-6">
              <span>{(maxValue).toLocaleString()}</span>
              <span>{(maxValue * 0.75).toLocaleString()}</span>
              <span>{(maxValue * 0.5).toLocaleString()}</span>
              <span>{(maxValue * 0.25).toLocaleString()}</span>
              <span>0</span>
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
                        style={{ height: `${heightPercent}%`, minHeight: item.revenue > 0 ? '4px' : '0' }}
                        title={`${item.month}: ${item.revenue.toLocaleString()}`}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {item.revenue.toLocaleString()}
                        </div>
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
        )}
      </CardContent>
    </Card>
  )
})

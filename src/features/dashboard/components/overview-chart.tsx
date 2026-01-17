import { memo, useMemo } from 'react'
import { Loader2, TrendingUp, TrendingDown, DollarSign, Receipt, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TFunction } from 'i18next'
import type { DashboardFinancialSummary } from '../types'

interface OverviewChartProps {
  t: TFunction
  data?: { month: string; revenue: number }[]
  financialSummary?: DashboardFinancialSummary
  isLoading?: boolean
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

export const OverviewChart = memo(function OverviewChart({
  t,
  data,
  financialSummary,
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

  const hasChartData = chartData.some((d) => d.revenue > 0)
  const hasFinancialData = financialSummary && (
    financialSummary.totalRevenue > 0 ||
    financialSummary.totalExpenses > 0 ||
    financialSummary.pendingAmount > 0
  )

  // Format currency in SAR
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100) // Convert from halalas to SAR
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="rounded-xl border-slate-200 shadow-sm col-span-4">
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

  // Has monthly chart data - show bar chart
  if (hasChartData) {
    return (
      <Card className="rounded-xl border-slate-200 shadow-sm col-span-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            {t('dashboard.overview.chartTitle', 'Overview')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
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
        </CardContent>
      </Card>
    )
  }

  // Has financial summary but no chart data - show summary cards
  if (hasFinancialData) {
    const changePercent = financialSummary.revenueChangePercent || 0
    const isPositiveChange = changePercent >= 0

    return (
      <Card className="rounded-xl border-slate-200 shadow-sm col-span-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            {t('dashboard.overview.chartTitle', 'Overview')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-2 gap-4 h-[350px] content-center">
            {/* Total Revenue */}
            <div className="bg-emerald-50 rounded-xl p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {t('dashboard.overview.totalRevenue', 'Total Revenue')}
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                {formatCurrency(financialSummary.totalRevenue)}
                <span className="text-base font-normal text-emerald-600 ms-1">
                  {t('common.currency', 'ر.س')}
                </span>
              </div>
              {changePercent !== 0 && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${isPositiveChange ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isPositiveChange ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{isPositiveChange ? '+' : ''}{changePercent}%</span>
                  <span className="text-slate-500">{t('dashboard.overview.fromLastMonth', 'from last month')}</span>
                </div>
              )}
            </div>

            {/* Total Expenses */}
            <div className="bg-red-50 rounded-xl p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <Receipt className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {t('dashboard.overview.totalExpenses', 'Total Expenses')}
                </span>
              </div>
              <div className="text-2xl font-bold text-red-700">
                {formatCurrency(financialSummary.totalExpenses)}
                <span className="text-base font-normal text-red-600 ms-1">
                  {t('common.currency', 'ر.س')}
                </span>
              </div>
            </div>

            {/* Pending Amount */}
            <div className="bg-amber-50 rounded-xl p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {t('dashboard.overview.pendingAmount', 'Pending')}
                </span>
              </div>
              <div className="text-2xl font-bold text-amber-700">
                {formatCurrency(financialSummary.pendingAmount)}
                <span className="text-base font-normal text-amber-600 ms-1">
                  {t('common.currency', 'ر.س')}
                </span>
              </div>
            </div>

            {/* Overdue Amount */}
            <div className="bg-slate-100 rounded-xl p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {t('dashboard.overview.overdueAmount', 'Overdue')}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-700">
                {formatCurrency(financialSummary.overdueAmount)}
                <span className="text-base font-normal text-slate-600 ms-1">
                  {t('common.currency', 'ر.س')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data at all - show empty state
  return (
    <Card className="rounded-xl border-slate-200 shadow-sm col-span-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          {t('dashboard.overview.chartTitle', 'Overview')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-col items-center justify-center h-[350px] text-slate-400">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm font-medium">{t('dashboard.overview.noChartData', 'No data available yet')}</p>
          <p className="text-xs mt-1">{t('dashboard.overview.chartDataHint', 'Revenue data will appear here as cases are completed')}</p>
        </div>
      </CardContent>
    </Card>
  )
})

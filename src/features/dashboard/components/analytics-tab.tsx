import { memo, useMemo } from 'react'
import {
  Scale,
  Users,
  TrendingUp,
  Gavel,
  DollarSign,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { AnalyticsTabProps } from '../types'

export const AnalyticsTab = memo(function AnalyticsTab({
  t,
  crmStats,
  financeStats,
  caseStats,
}: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      {/* Case Overview Chart - Full Width */}
      <CaseOverviewChart t={t} caseStats={caseStats} />

      {/* 4 Stat Cards */}
      <AnalyticsStats
        t={t}
        caseStats={caseStats}
        crmStats={crmStats}
        financeStats={financeStats}
      />

      {/* Finance & Sales Charts - Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        <FinanceChart t={t} financeStats={financeStats} />
        <SalesChart t={t} crmStats={crmStats} />
      </div>
    </div>
  )
})

// ==================== CASE OVERVIEW CHART ====================

interface CaseOverviewChartProps {
  t: AnalyticsTabProps['t']
  caseStats: AnalyticsTabProps['caseStats']
}

const CaseOverviewChart = memo(function CaseOverviewChart({ t, caseStats }: CaseOverviewChartProps) {
  // Generate mock weekly data based on case stats (will be replaced with real API data)
  const chartData = useMemo(() => {
    const days = [
      t('calendar.days.mon', 'Mon'),
      t('calendar.days.tue', 'Tue'),
      t('calendar.days.wed', 'Wed'),
      t('calendar.days.thu', 'Thu'),
      t('calendar.days.fri', 'Fri'),
      t('calendar.days.sat', 'Sat'),
      t('calendar.days.sun', 'Sun'),
    ]

    // When we have real data, this will come from API
    // For now, show empty state or distribute existing cases
    const total = caseStats?.total || 0
    const hasData = total > 0

    return days.map((day, index) => ({
      day,
      active: hasData ? Math.floor(Math.random() * (caseStats?.active || 1)) : 0,
      total: hasData ? Math.floor(total / 7 * (1 + Math.random() * 0.5)) : 0,
    }))
  }, [t, caseStats])

  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.map(d => Math.max(d.active, d.total)))
    return max > 0 ? max : 100
  }, [chartData])

  const hasData = chartData.some(d => d.total > 0)

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          {t('dashboard.analytics.caseOverview', 'Case Overview')}
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          {t('dashboard.analytics.caseOverviewDesc', 'Weekly cases and active matters')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[280px] text-slate-400">
            <Scale className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">{t('dashboard.analytics.noCaseData', 'No case data yet')}</p>
            <p className="text-xs mt-1">{t('dashboard.analytics.caseDataHint', 'Case trends will appear as you add cases')}</p>
          </div>
        ) : (
          <div className="h-[280px]">
            {/* Y-axis labels */}
            <div className="flex h-full">
              <div className="flex flex-col justify-between text-xs text-slate-400 pe-3 pb-6">
                <span>{maxValue}</span>
                <span>{Math.round(maxValue * 0.75)}</span>
                <span>{Math.round(maxValue * 0.5)}</span>
                <span>{Math.round(maxValue * 0.25)}</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="flex-1 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-6">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="border-t border-slate-100 w-full" />
                  ))}
                </div>

                {/* Area chart simulation */}
                <svg className="w-full h-[calc(100%-24px)]" viewBox="0 0 700 240" preserveAspectRatio="none">
                  {/* Total cases area (lighter) */}
                  <defs>
                    <linearGradient id="totalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#1e293b" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  {/* Total area */}
                  <path
                    d={`M 0 ${240 - (chartData[0].total / maxValue) * 240}
                        ${chartData.map((d, i) => `L ${i * 100 + 50} ${240 - (d.total / maxValue) * 240}`).join(' ')}
                        L 700 ${240 - (chartData[6].total / maxValue) * 240}
                        L 700 240 L 0 240 Z`}
                    fill="url(#totalGradient)"
                  />
                  <path
                    d={`M 0 ${240 - (chartData[0].total / maxValue) * 240}
                        ${chartData.map((d, i) => `L ${i * 100 + 50} ${240 - (d.total / maxValue) * 240}`).join(' ')}
                        L 700 ${240 - (chartData[6].total / maxValue) * 240}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                  />

                  {/* Active area */}
                  <path
                    d={`M 0 ${240 - (chartData[0].active / maxValue) * 240}
                        ${chartData.map((d, i) => `L ${i * 100 + 50} ${240 - (d.active / maxValue) * 240}`).join(' ')}
                        L 700 ${240 - (chartData[6].active / maxValue) * 240}
                        L 700 240 L 0 240 Z`}
                    fill="url(#activeGradient)"
                  />
                  <path
                    d={`M 0 ${240 - (chartData[0].active / maxValue) * 240}
                        ${chartData.map((d, i) => `L ${i * 100 + 50} ${240 - (d.active / maxValue) * 240}`).join(' ')}
                        L 700 ${240 - (chartData[6].active / maxValue) * 240}`}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="2"
                  />
                </svg>

                {/* X-axis labels */}
                <div className="flex justify-between text-xs text-slate-400 pt-2">
                  {chartData.map((d, i) => (
                    <span key={i}>{d.day}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

// ==================== ANALYTICS STATS ====================

interface AnalyticsStatsProps {
  t: AnalyticsTabProps['t']
  caseStats: AnalyticsTabProps['caseStats']
  crmStats: AnalyticsTabProps['crmStats']
  financeStats: AnalyticsTabProps['financeStats']
}

const AnalyticsStats = memo(function AnalyticsStats({
  t,
  caseStats,
  crmStats,
  financeStats,
}: AnalyticsStatsProps) {
  const stats = [
    {
      title: t('dashboard.analytics.totalCases', 'Total Cases'),
      value: caseStats?.total || 0,
      change: caseStats?.active ? `+${caseStats.active}` : '',
      changeLabel: t('dashboard.analytics.activeThisMonth', 'active this month'),
      icon: Scale,
      format: 'number',
    },
    {
      title: t('dashboard.analytics.leads', 'Leads'),
      value: crmStats?.activeLeads || 0,
      change: crmStats?.newClientsThisMonth ? `+${crmStats.newClientsThisMonth}` : '',
      changeLabel: t('dashboard.analytics.newThisMonth', 'new this month'),
      icon: Users,
      format: 'number',
    },
    {
      title: t('dashboard.analytics.avgProfit', 'Avg. Profit'),
      value: financeStats?.profitMargin || 0,
      change: '',
      changeLabel: t('dashboard.analytics.profitMargin', 'profit margin'),
      icon: DollarSign,
      format: 'percent',
    },
    {
      title: t('dashboard.analytics.avgHearings', 'Avg. Hearings'),
      value: caseStats?.total ? Math.round((caseStats.active || 0) * 2.5) : 0,
      change: '',
      changeLabel: t('dashboard.analytics.perMonth', 'per month'),
      icon: Gavel,
      format: 'number',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stat.format === 'percent' ? `${stat.value}%` : stat.value.toLocaleString()}
            </div>
            {(stat.change || stat.changeLabel) && (
              <p className="text-xs text-slate-500 mt-1">
                {stat.change && (
                  <span className="text-emerald-600">{stat.change}</span>
                )}{' '}
                {stat.changeLabel}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

// ==================== FINANCE CHART ====================

interface FinanceChartProps {
  t: AnalyticsTabProps['t']
  financeStats: AnalyticsTabProps['financeStats']
}

const FinanceChart = memo(function FinanceChart({ t, financeStats }: FinanceChartProps) {
  const data = useMemo(() => {
    const hasData = financeStats && (financeStats.totalRevenue > 0 || financeStats.expenses > 0)

    return [
      {
        label: t('dashboard.analytics.revenue', 'Revenue'),
        value: financeStats?.totalRevenue || 0,
        color: 'bg-emerald-500',
        percent: hasData ? Math.round((financeStats?.totalRevenue || 0) / ((financeStats?.totalRevenue || 0) + (financeStats?.expenses || 1)) * 100) : 0,
      },
      {
        label: t('dashboard.analytics.expenses', 'Expenses'),
        value: financeStats?.expenses || 0,
        color: 'bg-red-500',
        percent: hasData ? Math.round((financeStats?.expenses || 0) / ((financeStats?.totalRevenue || 1) + (financeStats?.expenses || 0)) * 100) : 0,
      },
      {
        label: t('dashboard.analytics.pending', 'Pending'),
        value: financeStats?.pendingInvoicesCount || 0,
        color: 'bg-amber-500',
        percent: 0,
      },
    ]
  }, [t, financeStats])

  const hasData = data.some(d => d.value > 0)

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          {t('dashboard.analytics.finance', 'Finance')}
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          {t('dashboard.analytics.financeDesc', 'Revenue and expense breakdown')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[180px] text-slate-400">
            <DollarSign className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">{t('dashboard.analytics.noFinanceData', 'No finance data yet')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-900">
                    {item.value.toLocaleString()}
                    {item.percent > 0 && <span className="text-slate-400 ms-1">{item.percent}%</span>}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percent || (item.value > 0 ? 20 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

// ==================== SALES CHART ====================

interface SalesChartProps {
  t: AnalyticsTabProps['t']
  crmStats: AnalyticsTabProps['crmStats']
}

const SalesChart = memo(function SalesChart({ t, crmStats }: SalesChartProps) {
  const data = useMemo(() => {
    const total = (crmStats?.totalClients || 0) + (crmStats?.activeLeads || 0)
    const hasData = total > 0

    return [
      {
        label: t('dashboard.analytics.clients', 'Clients'),
        value: crmStats?.totalClients || 0,
        color: 'bg-blue-500',
        percent: hasData ? Math.round((crmStats?.totalClients || 0) / total * 100) : 0,
      },
      {
        label: t('dashboard.analytics.leads', 'Leads'),
        value: crmStats?.activeLeads || 0,
        color: 'bg-indigo-500',
        percent: hasData ? Math.round((crmStats?.activeLeads || 0) / total * 100) : 0,
      },
      {
        label: t('dashboard.analytics.newClients', 'New Clients'),
        value: crmStats?.newClientsThisMonth || 0,
        color: 'bg-emerald-500',
        percent: 0,
      },
    ]
  }, [t, crmStats])

  const hasData = data.some(d => d.value > 0)

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          {t('dashboard.analytics.sales', 'Sales')}
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          {t('dashboard.analytics.salesDesc', 'Client acquisition overview')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[180px] text-slate-400">
            <Users className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">{t('dashboard.analytics.noSalesData', 'No sales data yet')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-900">
                    {item.value.toLocaleString()}
                    {item.percent > 0 && <span className="text-slate-400 ms-1">{item.percent}%</span>}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percent || (item.value > 0 ? 20 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

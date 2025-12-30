import { memo } from 'react'
import { DollarSign, Briefcase, Receipt, CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TFunction } from 'i18next'
import type { DashboardFinancialSummary, CaseStats } from '../types'

interface OverviewStatsProps {
  t: TFunction
  financialSummary: DashboardFinancialSummary | undefined
  caseStats: CaseStats | undefined
  upcomingEventsCount: number
  isLoading?: boolean
}

export const OverviewStats = memo(function OverviewStats({
  t,
  financialSummary,
  caseStats,
  upcomingEventsCount,
}: OverviewStatsProps) {
  const stats = [
    {
      title: t('dashboard.overview.totalRevenue', 'Total Revenue'),
      value: financialSummary?.totalRevenue || 0,
      change: '+20.1%',
      changeLabel: t('dashboard.overview.fromLastMonth', 'from last month'),
      icon: DollarSign,
      format: 'currency',
    },
    {
      title: t('dashboard.overview.activeCases', 'Active Cases'),
      value: caseStats?.active || 0,
      change: caseStats?.pending ? `+${caseStats.pending}` : '+0',
      changeLabel: t('dashboard.overview.pendingCases', 'pending'),
      icon: Briefcase,
      format: 'number',
    },
    {
      title: t('dashboard.overview.pendingInvoices', 'Pending Invoices'),
      value: financialSummary?.pendingAmount || 0,
      change: financialSummary?.overdueAmount ? `-${financialSummary.overdueAmount.toLocaleString()}` : '',
      changeLabel: t('dashboard.overview.overdue', 'overdue'),
      icon: Receipt,
      format: 'currency',
    },
    {
      title: t('dashboard.overview.upcomingEvents', 'Upcoming Events'),
      value: upcomingEventsCount,
      change: '',
      changeLabel: t('dashboard.overview.thisWeek', 'this week'),
      icon: CalendarDays,
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
              {stat.format === 'currency' ? (
                <>
                  {stat.value.toLocaleString()}
                  <span className="text-lg font-normal text-slate-500 ms-1">
                    {t('common.currency', 'ر.س')}
                  </span>
                </>
              ) : (
                stat.value.toLocaleString()
              )}
            </div>
            {(stat.change || stat.changeLabel) && (
              <p className="text-xs text-slate-500 mt-1">
                {stat.change && (
                  <span className={stat.change.startsWith('+') ? 'text-emerald-600' : stat.change.startsWith('-') ? 'text-red-500' : ''}>
                    {stat.change}
                  </span>
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

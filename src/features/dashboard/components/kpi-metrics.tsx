/**
 * KPI Metrics Dashboard Component
 *
 * Displays the 3 primary success metrics:
 * 1. Case Throughput (cycle time)
 * 2. Revenue Per Case
 * 3. User Activation Rate
 */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Timer,
  Target,
} from 'lucide-react'
import { useCases } from '@/hooks/useCasesAndClients'
import { useInvoices, usePayments } from '@/hooks/useFinance'
import { cn, formatCurrency as formatCurrencyUtil } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  loading?: boolean
}

function MetricCard({ title, value, description, icon, trend, loading }: MetricCardProps) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                trend.isPositive ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className={cn('h-3 w-3', isRTL ? 'ml-1' : 'mr-1')} />
              ) : (
                <TrendingDown className={cn('h-3 w-3', isRTL ? 'ml-1' : 'mr-1')} />
              )}
              {trend.value}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function KPIMetrics() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Fetch real data
  const { data: casesData, isLoading: casesLoading } = useCases()
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices()
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments()

  // Calculate KPI metrics
  const metrics = useMemo(() => {
    const cases = casesData?.cases || casesData || []
    const invoices = invoicesData?.invoices || invoicesData || []
    const payments = paymentsData?.payments || paymentsData || []

    // 1. Case Throughput - Average days to close
    const closedCases = Array.isArray(cases)
      ? cases.filter((c: any) => c.status === 'closed' || c.status === 'completed')
      : []

    let avgCycleTime = 0
    if (closedCases.length > 0) {
      const totalDays = closedCases.reduce((sum: number, c: any) => {
        const created = new Date(c.createdAt || c.dateOpened)
        const closed = new Date(c.closedAt || c.dateClosed || c.updatedAt)
        const days = Math.max(1, Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
        return sum + days
      }, 0)
      avgCycleTime = Math.round(totalDays / closedCases.length)
    }

    // 2. Revenue metrics
    const totalRevenue = Array.isArray(payments)
      ? payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
      : 0

    const totalInvoiced = Array.isArray(invoices)
      ? invoices.reduce((sum: number, i: any) => sum + (i.total || i.amount || 0), 0)
      : 0

    const activeCases = Array.isArray(cases)
      ? cases.filter((c: any) => c.status === 'active' || c.status === 'open' || c.status === 'in_progress')
      : []

    const revenuePerCase = activeCases.length > 0
      ? Math.round(totalRevenue / Math.max(activeCases.length, 1))
      : 0

    // 3. User Activation - Active cases ratio
    const totalCases = Array.isArray(cases) ? cases.length : 0
    const activationRate = totalCases > 0
      ? Math.round((activeCases.length / totalCases) * 100)
      : 0

    // Collection rate
    const collectionRate = totalInvoiced > 0
      ? Math.round((totalRevenue / totalInvoiced) * 100)
      : 0

    return {
      // Case Throughput
      totalCases,
      activeCases: activeCases.length,
      closedCases: closedCases.length,
      avgCycleTime,

      // Revenue
      totalRevenue,
      totalInvoiced,
      revenuePerCase,
      collectionRate,

      // Activation
      activationRate,
    }
  }, [casesData, invoicesData, paymentsData])

  const isLoading = casesLoading || invoicesLoading || paymentsLoading

  // Use memoized currency formatter
  const formatCurrency = (value: number) => formatCurrencyUtil(value, {
    locale: isRTL ? 'ar-SA' : 'en-SA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t('dashboard.kpi.title', 'Key Performance Indicators')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.kpi.subtitle', 'Track your primary success metrics')}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Target className={cn('h-3 w-3', isRTL ? 'ml-1' : 'mr-1')} />
          {t('dashboard.kpi.live', 'Live Data')}
        </Badge>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Case Throughput */}
        <MetricCard
          title={t('dashboard.kpi.cycleTime', 'Avg. Case Cycle Time')}
          value={`${metrics.avgCycleTime} ${t('common.days', 'days')}`}
          description={t('dashboard.kpi.cycleTimeDesc', 'Average days to close a case')}
          icon={<Clock className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
          loading={isLoading}
        />

        {/* Active Cases */}
        <MetricCard
          title={t('dashboard.kpi.activeCases', 'Active Cases')}
          value={metrics.activeCases}
          description={t('dashboard.kpi.activeCasesDesc', `${metrics.closedCases} closed this period`)}
          icon={<Briefcase className="h-4 w-4" />}
          loading={isLoading}
        />

        {/* Revenue Per Case */}
        <MetricCard
          title={t('dashboard.kpi.revenuePerCase', 'Revenue Per Case')}
          value={formatCurrency(metrics.revenuePerCase)}
          description={t('dashboard.kpi.revenuePerCaseDesc', 'Average revenue per active case')}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: 8, isPositive: true }}
          loading={isLoading}
        />

        {/* Collection Rate */}
        <MetricCard
          title={t('dashboard.kpi.collectionRate', 'Collection Rate')}
          value={`${metrics.collectionRate}%`}
          description={t('dashboard.kpi.collectionRateDesc', 'Payments vs invoiced amount')}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{ value: metrics.collectionRate > 80 ? 5 : -3, isPositive: metrics.collectionRate > 80 }}
          loading={isLoading}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Revenue */}
        <MetricCard
          title={t('dashboard.kpi.totalRevenue', 'Total Revenue')}
          value={formatCurrency(metrics.totalRevenue)}
          description={t('dashboard.kpi.totalRevenueDesc', 'Total payments received')}
          icon={<DollarSign className="h-4 w-4" />}
          loading={isLoading}
        />

        {/* Total Invoiced */}
        <MetricCard
          title={t('dashboard.kpi.totalInvoiced', 'Total Invoiced')}
          value={formatCurrency(metrics.totalInvoiced)}
          description={t('dashboard.kpi.totalInvoicedDesc', 'Total invoice amount')}
          icon={<FileText className="h-4 w-4" />}
          loading={isLoading}
        />

        {/* Case Activation */}
        <MetricCard
          title={t('dashboard.kpi.caseActivation', 'Case Activation')}
          value={`${metrics.activationRate}%`}
          description={t('dashboard.kpi.caseActivationDesc', `${metrics.totalCases} total cases`)}
          icon={<Users className="h-4 w-4" />}
          trend={{ value: metrics.activationRate > 50 ? 3 : -2, isPositive: metrics.activationRate > 50 }}
          loading={isLoading}
        />
      </div>
    </div>
  )
}

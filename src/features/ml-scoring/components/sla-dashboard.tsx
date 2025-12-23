/**
 * SLA Dashboard Component
 * Displays SLA metrics, performance, and current breaches
 */

import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Timer,
  Target,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useSLAMetrics, useSLABreaches } from '@/hooks/useMlScoring'
import type { PriorityTier } from '@/services/mlScoringApi'

// ==================== TYPES ====================

interface SLADashboardProps {
  className?: string
  period?: string
}

// ==================== CONSTANTS ====================

const TIER_TARGETS: Record<string, { minutes: number; label: { ar: string; en: string } }> = {
  P1_HOT: { minutes: 5, label: { ar: '5 دقائق', en: '5 min' } },
  P2_WARM: { minutes: 120, label: { ar: 'ساعتين', en: '2 hours' } },
  P3_COOL: { minutes: 1440, label: { ar: '24 ساعة', en: '24 hours' } },
  P4_NURTURE: { minutes: 10080, label: { ar: 'أسبوع', en: '1 week' } },
}

// ==================== HELPERS ====================

const formatDuration = (minutes: number, isRTL: boolean): string => {
  if (minutes < 60) {
    return isRTL ? `${minutes.toFixed(0)} دقيقة` : `${minutes.toFixed(0)}min`
  }
  const hours = minutes / 60
  if (hours < 24) {
    return isRTL ? `${hours.toFixed(1)} ساعة` : `${hours.toFixed(1)}hr`
  }
  const days = hours / 24
  return isRTL ? `${days.toFixed(1)} يوم` : `${days.toFixed(1)}d`
}

const getSuccessRateColor = (rate: number): string => {
  if (rate >= 0.9) return 'text-emerald-600'
  if (rate >= 0.7) return 'text-amber-600'
  return 'text-red-600'
}

const getSuccessRateBg = (rate: number): string => {
  if (rate >= 0.9) return 'bg-emerald-100'
  if (rate >= 0.7) return 'bg-amber-100'
  return 'bg-red-100'
}

// ==================== SUB-COMPONENTS ====================

interface MetricCardProps {
  title: string
  value: string | number
  status?: 'good' | 'warning' | 'bad' | 'neutral'
  icon: typeof Clock
}

const MetricCard = ({ title, value, status = 'neutral', icon: Icon }: MetricCardProps) => {
  const statusColors = {
    good: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    bad: 'bg-red-50 border-red-200',
    neutral: 'bg-slate-50 border-slate-200',
  }

  const iconColors = {
    good: 'text-emerald-500',
    warning: 'text-amber-500',
    bad: 'text-red-500',
    neutral: 'text-slate-500',
  }

  return (
    <div className={cn('rounded-xl p-4 border', statusColors[status])}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-5 h-5', iconColors[status])} />
        <span className="text-sm text-slate-600">{title}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  )
}

interface TierRowProps {
  tier: string
  data: { targetMinutes: number; avgResponseMinutes: number; successRate: number }
  isRTL: boolean
}

const TierRow = ({ tier, data, isRTL }: TierRowProps) => {
  const tierTarget = TIER_TARGETS[tier]
  const successPercent = (data.successRate * 100).toFixed(0)

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {tier === 'P1_HOT' && '🔥'}
            {tier === 'P2_WARM' && '☀️'}
            {tier === 'P3_COOL' && '❄️'}
            {tier === 'P4_NURTURE' && '🌱'}
          </span>
          <span className="font-medium text-slate-700">{tier.replace('_', ' ')}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-slate-600">
        {tierTarget ? (isRTL ? tierTarget.label.ar : tierTarget.label.en) : `${data.targetMinutes}min`}
      </td>
      <td className="py-3 px-4 text-slate-600">{formatDuration(data.avgResponseMinutes, isRTL)}</td>
      <td className="py-3 px-4">
        <Badge className={cn('border-0 rounded-full', getSuccessRateBg(data.successRate), getSuccessRateColor(data.successRate))}>
          {successPercent}%
        </Badge>
      </td>
    </tr>
  )
}

// ==================== MAIN COMPONENT ====================

export function SLADashboard({ className, period = '7d' }: SLADashboardProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const { data: metricsData, isLoading: metricsLoading, isError: metricsError } = useSLAMetrics(period)
  const { data: breachesData, isLoading: breachesLoading, isError: breachesError } = useSLABreaches()

  const isLoading = metricsLoading || breachesLoading
  const isError = metricsError || breachesError

  const metrics = metricsData?.data
  const breaches = breachesData?.data?.breaches || []

  if (isLoading) {
    return <SLADashboardSkeleton />
  }

  if (isError) {
    return (
      <Card className={cn('rounded-2xl border-slate-100', className)}>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-red-600">{t('mlScoring.sla.loadError', 'Failed to load SLA metrics')}</p>
        </CardContent>
      </Card>
    )
  }

  const successRate = metrics ? (1 - metrics.breachRate) * 100 : 0
  const successStatus = successRate >= 90 ? 'good' : successRate >= 70 ? 'warning' : 'bad'

  return (
    <Card className={cn('rounded-2xl border-slate-100', className)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Timer className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-navy">{t('mlScoring.sla.title', 'SLA Performance')}</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title={t('mlScoring.sla.successRate', 'SLA Success Rate')}
              value={`${successRate.toFixed(1)}%`}
              status={successStatus}
              icon={CheckCircle2}
            />
            <MetricCard
              title={t('mlScoring.sla.currentBreaches', 'Current Breaches')}
              value={breaches.length}
              status={breaches.length === 0 ? 'good' : 'bad'}
              icon={AlertTriangle}
            />
            <MetricCard
              title={t('mlScoring.sla.avgResponseTime', 'Avg Response Time')}
              value={metrics ? formatDuration(metrics.avgResponseTime, isRTL) : '-'}
              status="neutral"
              icon={Clock}
            />
          </div>

          {/* Tier Breakdown */}
          {metrics?.byTier && Object.keys(metrics.byTier).length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Target className="w-5 h-5 text-slate-500" />
                {t('mlScoring.sla.byTier', 'Performance by Priority Tier')}
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="py-3 px-4 text-start text-sm font-medium text-slate-600">
                        {t('mlScoring.sla.tier', 'Tier')}
                      </th>
                      <th className="py-3 px-4 text-start text-sm font-medium text-slate-600">
                        {t('mlScoring.sla.target', 'Target')}
                      </th>
                      <th className="py-3 px-4 text-start text-sm font-medium text-slate-600">
                        {t('mlScoring.sla.avgResponse', 'Avg Response')}
                      </th>
                      <th className="py-3 px-4 text-start text-sm font-medium text-slate-600">
                        {t('mlScoring.sla.successRate', 'Success Rate')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metrics.byTier).map(([tier, data]) => (
                      <TierRow key={tier} tier={tier} data={data} isRTL={isRTL} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active Breaches */}
          {breaches.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {t('mlScoring.sla.activeBreaches', 'Active SLA Breaches')}
              </h3>
              <div className="bg-red-50 rounded-xl border border-red-200 divide-y divide-red-200">
                {breaches.slice(0, 5).map((breach, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-red-100 text-red-700 border-0 rounded-full px-2">
                          {breach.tier.replace('_', ' ')}
                        </Badge>
                        <span className="font-medium text-slate-800">{breach.leadName || breach.leadId}</span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {t('mlScoring.sla.breachedAt', 'Breached')}: {new Date(breach.breachedAt).toLocaleString()}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="rounded-xl border-red-200 text-red-600 hover:bg-red-100">
                      <Link to={`/dashboard/crm/leads/${breach.leadId}` as any}>
                        <Eye className="w-4 h-4 me-1" />
                        {t('common.view', 'View')}
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
              {breaches.length > 5 && (
                <p className="text-sm text-center text-slate-500">
                  {t('mlScoring.sla.moreBreaches', 'And {{count}} more...', { count: breaches.length - 5 })}
                </p>
              )}
            </div>
          )}

          {/* No Breaches */}
          {breaches.length === 0 && (
            <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
              <h3 className="font-bold text-emerald-700 mb-1">{t('mlScoring.sla.noBreaches', 'No Active Breaches')}</h3>
              <p className="text-sm text-emerald-600">{t('mlScoring.sla.allOnTrack', 'All leads are on track with SLA!')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== SKELETON ====================

export function SLADashboardSkeleton() {
  return (
    <Card className="rounded-2xl border-slate-100">
      <CardContent className="p-0">
        <div className="p-6 pb-4 border-b border-slate-100">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}

export default SLADashboard

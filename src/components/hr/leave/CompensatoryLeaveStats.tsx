import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Calendar,
  TrendingUp,
  CalendarClock,
  AlertTriangle,
} from 'lucide-react'

interface CompensatoryLeaveStatsProps {
  stats: {
    totalRequests: number
    pendingApproval: number
    totalDaysEarned: number
    totalDaysUsed: number
    totalDaysRemaining: number
    utilizationRate?: number
    expiringInNext30Days: number
  }
}

export function CompensatoryLeaveStats({ stats }: CompensatoryLeaveStatsProps) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('hr.leave.compensatory.stats.totalRequests', 'Total Requests')}
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRequests}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.pendingApproval}{' '}
            {t('hr.leave.compensatory.stats.pendingApproval', 'pending approval')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('hr.leave.compensatory.stats.daysEarned', 'Days Earned')}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDaysEarned}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalDaysUsed} {t('hr.leave.compensatory.stats.used', 'used')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('hr.leave.compensatory.stats.remainingBalance', 'Remaining Balance')}
          </CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDaysRemaining}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {((stats.utilizationRate || 0) * 100).toFixed(0)}%{' '}
            {t('hr.leave.compensatory.stats.utilizationRate', 'utilization rate')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('hr.leave.compensatory.stats.expiringSoon', 'Expiring Soon')}
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.expiringInNext30Days}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('hr.leave.compensatory.stats.within30Days', 'within 30 days')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

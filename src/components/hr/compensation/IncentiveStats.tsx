import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Award, TrendingUp, Clock, CheckCircle } from 'lucide-react'

interface IncentiveStatsProps {
  stats: {
    totalIncentives: number
    totalAmount: number
    averageAmount: number
    pendingApprovals: number
    processedThisMonth: number
  }
  formatCurrency: (amount: number) => string
}

export function IncentiveStats({ stats, formatCurrency }: IncentiveStatsProps) {
  const { t } = useTranslation()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('hr.incentives.stats.total', 'Total Incentives')}
          </CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalIncentives}</div>
          <p className="text-xs text-muted-foreground">
            {t('hr.incentives.stats.totalValue', 'Total Value')}: {formatCurrency(stats.totalAmount)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('hr.incentives.stats.average', 'Average Incentive')}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.averageAmount)}</div>
          <p className="text-xs text-muted-foreground">
            {t('hr.incentives.stats.perEmployee', 'Per employee')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('hr.incentives.stats.pending', 'Pending Approval')}
          </CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
          <p className="text-xs text-muted-foreground">
            {t('hr.incentives.stats.needsApproval', 'Needs approval')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('hr.incentives.stats.processedMonth', 'Processed This Month')}
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.processedThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            {t('hr.incentives.stats.inPayroll', 'In payroll')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

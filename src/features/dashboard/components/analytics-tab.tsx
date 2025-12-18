import { memo } from 'react'
import {
  Scale,
  Users,
  UserCheck,
  Target,
  Percent,
  Clock,
  Wallet,
  Receipt,
  PiggyBank,
  BarChart3,
  TrendingUp,
  Loader2,
  CheckSquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnalyticsTabProps } from '../types'

export const AnalyticsTab = memo(function AnalyticsTab({
  t,
  crmStats,
  crmLoading,
  financeStats,
  financeStatsLoading,
  caseStats,
}: AnalyticsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CRMCard t={t} crmStats={crmStats} crmLoading={crmLoading} />
      <FinanceCard t={t} financeStats={financeStats} financeStatsLoading={financeStatsLoading} />
      <CasesCard t={t} caseStats={caseStats} />
    </div>
  )
})

// ==================== SUB-COMPONENTS ====================

interface CRMCardProps {
  t: AnalyticsTabProps['t']
  crmStats: AnalyticsTabProps['crmStats']
  crmLoading: boolean
}

const CRMCard = memo(function CRMCard({ t, crmStats, crmLoading }: CRMCardProps) {
  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          {t('dashboard.analytics.crm', 'إدارة العملاء')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {crmLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-navy" />
          </div>
        ) : (
          <div className="space-y-4">
            <StatRow
              icon={<Users className="h-4 w-4 text-blue-500" />}
              label={t('dashboard.analytics.totalClients', 'إجمالي العملاء')}
              value={crmStats?.totalClients || 0}
              bgColor="bg-blue-50"
              textColor="text-navy"
            />
            <StatRow
              icon={<UserCheck className="h-4 w-4 text-green-500" />}
              label={t('dashboard.analytics.newClients', 'عملاء جدد')}
              value={`+${crmStats?.newClientsThisMonth || 0}`}
              bgColor="bg-green-50"
              textColor="text-green-600"
            />
            <StatRow
              icon={<Target className="h-4 w-4 text-amber-500" />}
              label={t('dashboard.analytics.activeLeads', 'العملاء المحتملين')}
              value={crmStats?.activeLeads || 0}
              bgColor="bg-amber-50"
              textColor="text-amber-600"
            />
            <StatRow
              icon={<Percent className="h-4 w-4 text-purple-500" />}
              label={t('dashboard.analytics.conversionRate', 'معدل التحويل')}
              value={`${crmStats?.conversionRate || 0}%`}
              bgColor="bg-purple-50"
              textColor="text-purple-600"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
})

interface FinanceCardProps {
  t: AnalyticsTabProps['t']
  financeStats: AnalyticsTabProps['financeStats']
  financeStatsLoading: boolean
}

const FinanceCard = memo(function FinanceCard({
  t,
  financeStats,
  financeStatsLoading,
}: FinanceCardProps) {
  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-500" />
          {t('dashboard.analytics.finance', 'المالية')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {financeStatsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-navy" />
          </div>
        ) : (
          <div className="space-y-4">
            <StatRow
              icon={<TrendingUp className="h-4 w-4 text-green-500" />}
              label={t('dashboard.analytics.totalRevenue', 'إجمالي الإيرادات')}
              value={(financeStats?.totalRevenue || 0).toLocaleString('ar-SA')}
              bgColor="bg-green-50"
              textColor="text-green-600"
            />
            <StatRow
              icon={<Receipt className="h-4 w-4 text-red-500" />}
              label={t('dashboard.analytics.expenses', 'المصروفات')}
              value={(financeStats?.expenses || 0).toLocaleString('ar-SA')}
              bgColor="bg-red-50"
              textColor="text-red-600"
            />
            <StatRow
              icon={<Percent className="h-4 w-4 text-blue-500" />}
              label={t('dashboard.analytics.profitMargin', 'هامش الربح')}
              value={`${financeStats?.profitMargin || 0}%`}
              bgColor="bg-blue-50"
              textColor="text-blue-600"
            />
            <StatRow
              icon={<PiggyBank className="h-4 w-4 text-amber-500" />}
              label={t('dashboard.analytics.pendingInvoices', 'فواتير معلقة')}
              value={financeStats?.pendingInvoicesCount || 0}
              bgColor="bg-amber-50"
              textColor="text-amber-600"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
})

interface CasesCardProps {
  t: AnalyticsTabProps['t']
  caseStats: AnalyticsTabProps['caseStats']
}

const CasesCard = memo(function CasesCard({ t, caseStats }: CasesCardProps) {
  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
          <Scale className="h-5 w-5 text-amber-500" />
          {t('dashboard.analytics.cases', 'القضايا')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StatRow
            icon={<Scale className="h-4 w-4 text-amber-500" />}
            label={t('dashboard.analytics.totalCases', 'إجمالي القضايا')}
            value={caseStats?.total || 0}
            bgColor="bg-amber-50"
            textColor="text-navy"
          />
          <StatRow
            icon={<CheckSquare className="h-4 w-4 text-green-500" />}
            label={t('dashboard.analytics.activeCases', 'قضايا نشطة')}
            value={caseStats?.active || 0}
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <StatRow
            icon={<BarChart3 className="h-4 w-4 text-blue-500" />}
            label={t('dashboard.analytics.closedCases', 'قضايا مغلقة')}
            value={caseStats?.closed || 0}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatRow
            icon={<Clock className="h-4 w-4 text-purple-500" />}
            label={t('dashboard.analytics.pendingCases', 'قضايا معلقة')}
            value={caseStats?.pending || 0}
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
        </div>
      </CardContent>
    </Card>
  )
})

// ==================== SHARED COMPONENT ====================

interface StatRowProps {
  icon: React.ReactNode
  label: string
  value: string | number
  bgColor: string
  textColor: string
}

const StatRow = memo(function StatRow({
  icon,
  label,
  value,
  bgColor,
  textColor,
}: StatRowProps) {
  return (
    <div className={`flex items-center justify-between p-3 ${bgColor} rounded-xl`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
      <span className={`font-bold ${textColor}`}>{value}</span>
    </div>
  )
})

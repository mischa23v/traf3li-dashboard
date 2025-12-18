import { memo } from 'react'
import { Scale, TrendingUp, ListTodo, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import type { ReportsTabProps, CasesChartData, RevenueChartData, TasksChartData } from '../types'

export const ReportsTab = memo(function ReportsTab({
  t,
  casesChart,
  casesChartLoading,
  revenueChart,
  revenueChartLoading,
  tasksChart,
  tasksChartLoading,
}: ReportsTabProps) {
  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CasesChartCard t={t} casesChart={casesChart} casesChartLoading={casesChartLoading} />
        <RevenueChartCard t={t} revenueChart={revenueChart} revenueChartLoading={revenueChartLoading} />
      </div>

      {/* Tasks Chart - Full Width */}
      <TasksChartCard t={t} tasksChart={tasksChart} tasksChartLoading={tasksChartLoading} />
    </div>
  )
})

// ==================== SUB-COMPONENTS ====================

interface CasesChartCardProps {
  t: ReportsTabProps['t']
  casesChart: ReportsTabProps['casesChart']
  casesChartLoading: boolean
}

const CasesChartCard = memo(function CasesChartCard({
  t,
  casesChart,
  casesChartLoading,
}: CasesChartCardProps) {
  const data = casesChart?.data?.slice(-12) || []
  const maxValue = Math.max(...data.map((d: CasesChartData) => d.total), 1)

  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
          <Scale className="h-5 w-5 text-amber-500" />
          {t('dashboard.reports.casesChart', 'تقرير القضايا')}
        </CardTitle>
        <CardDescription>{t('dashboard.reports.last12Months', 'آخر 12 شهر')}</CardDescription>
      </CardHeader>
      <CardContent>
        {casesChartLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-navy" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simple Bar Chart Visualization */}
            <div className="flex items-end gap-1 h-40">
              {data.map((item: CasesChartData, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-amber-500 rounded-t-sm transition-all hover:bg-amber-600"
                    style={{ height: `${Math.max((item.total / maxValue) * 100, 5)}%` }}
                    title={`${item.label}: ${item.total}`}
                  />
                  <span className="text-[8px] text-slate-500 truncate w-full text-center">
                    {item.label?.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              <div className="text-center">
                <p className="text-xs text-slate-500">{t('dashboard.reports.opened', 'مفتوحة')}</p>
                <p className="font-bold text-green-600">
                  {data.reduce((sum: number, item: CasesChartData) => sum + (item.opened || 0), 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">{t('dashboard.reports.closed', 'مغلقة')}</p>
                <p className="font-bold text-blue-600">
                  {data.reduce((sum: number, item: CasesChartData) => sum + (item.closed || 0), 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">{t('dashboard.reports.pending', 'معلقة')}</p>
                <p className="font-bold text-amber-600">
                  {data.reduce((sum: number, item: CasesChartData) => sum + (item.pending || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

interface RevenueChartCardProps {
  t: ReportsTabProps['t']
  revenueChart: ReportsTabProps['revenueChart']
  revenueChartLoading: boolean
}

const RevenueChartCard = memo(function RevenueChartCard({
  t,
  revenueChart,
  revenueChartLoading,
}: RevenueChartCardProps) {
  const data = revenueChart?.data?.slice(-12) || []
  const maxValue = Math.max(...data.map((d: RevenueChartData) => d.revenue), 1)

  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          {t('dashboard.reports.revenueChart', 'تقرير الإيرادات')}
        </CardTitle>
        <CardDescription>{t('dashboard.reports.last12Months', 'آخر 12 شهر')}</CardDescription>
      </CardHeader>
      <CardContent>
        {revenueChartLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-navy" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simple Bar Chart Visualization */}
            <div className="flex items-end gap-1 h-40">
              {data.map((item: RevenueChartData, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-green-500 rounded-t-sm transition-all hover:bg-green-600"
                    style={{ height: `${Math.max((item.revenue / maxValue) * 100, 5)}%` }}
                    title={`${item.label}: ${item.revenue?.toLocaleString('ar-SA')}`}
                  />
                  <span className="text-[8px] text-slate-500 truncate w-full text-center">
                    {item.label?.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              <div className="text-center">
                <p className="text-xs text-slate-500">{t('dashboard.reports.totalRevenue', 'إجمالي الإيرادات')}</p>
                <p className="font-bold text-green-600">
                  {revenueChart?.summary?.totalRevenue?.toLocaleString('ar-SA') || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">{t('dashboard.reports.totalExpenses', 'إجمالي المصروفات')}</p>
                <p className="font-bold text-red-600">
                  {revenueChart?.summary?.totalExpenses?.toLocaleString('ar-SA') || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">{t('dashboard.reports.profit', 'الربح')}</p>
                <p className="font-bold text-blue-600">
                  {revenueChart?.summary?.totalProfit?.toLocaleString('ar-SA') || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

interface TasksChartCardProps {
  t: ReportsTabProps['t']
  tasksChart: ReportsTabProps['tasksChart']
  tasksChartLoading: boolean
}

const TasksChartCard = memo(function TasksChartCard({
  t,
  tasksChart,
  tasksChartLoading,
}: TasksChartCardProps) {
  const data = tasksChart?.data?.slice(-12) || []

  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-blue-500" />
          {t('dashboard.reports.tasksChart', 'تقرير المهام')}
        </CardTitle>
        <CardDescription>{t('dashboard.reports.last12Months', 'آخر 12 شهر')}</CardDescription>
      </CardHeader>
      <CardContent>
        {tasksChartLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-navy" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simple Bar Chart Visualization */}
            <div className="flex items-end gap-2 h-48">
              {data.map((item: TasksChartData, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: '160px' }}>
                    <div
                      className="w-full bg-green-500 rounded-t-sm"
                      style={{ height: `${(item.completed / Math.max(item.total, 1)) * 100}%` }}
                      title={`${t('dashboard.reports.completed', 'مكتملة')}: ${item.completed}`}
                    />
                    <div
                      className="w-full bg-blue-500"
                      style={{ height: `${(item.inProgress / Math.max(item.total, 1)) * 100}%` }}
                      title={`${t('dashboard.reports.inProgress', 'قيد التنفيذ')}: ${item.inProgress}`}
                    />
                    <div
                      className="w-full bg-amber-500"
                      style={{ height: `${(item.pending / Math.max(item.total, 1)) * 100}%` }}
                      title={`${t('dashboard.reports.pending', 'معلقة')}: ${item.pending}`}
                    />
                    <div
                      className="w-full bg-red-500 rounded-b-sm"
                      style={{ height: `${(item.overdue / Math.max(item.total, 1)) * 100}%` }}
                      title={`${t('dashboard.reports.overdue', 'متأخرة')}: ${item.overdue}`}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 truncate w-full text-center">
                    {item.label?.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
            {/* Legend & Summary */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100">
              <LegendItem color="bg-green-500" label={t('dashboard.reports.completed', 'مكتملة')} value={tasksChart?.summary?.completed || 0} />
              <LegendItem color="bg-blue-500" label={t('dashboard.reports.inProgress', 'قيد التنفيذ')} value={tasksChart?.summary?.inProgress || 0} />
              <LegendItem color="bg-amber-500" label={t('dashboard.reports.pending', 'معلقة')} value={tasksChart?.summary?.pending || 0} />
              <LegendItem color="bg-red-500" label={t('dashboard.reports.overdue', 'متأخرة')} value={tasksChart?.summary?.overdue || 0} />
            </div>
            <div className="text-center pt-2">
              <p className="text-sm text-slate-600">
                {t('dashboard.reports.overallCompletion', 'معدل الإنجاز الإجمالي')}:{' '}
                <span className="font-bold text-green-600">
                  {tasksChart?.summary?.overallCompletionRate || 0}%
                </span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

// ==================== SHARED COMPONENT ====================

interface LegendItemProps {
  color: string
  label: string
  value: number
}

const LegendItem = memo(function LegendItem({ color, label, value }: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 ${color} rounded-sm`} />
      <span className="text-xs text-slate-600">
        {label} ({value})
      </span>
    </div>
  )
})

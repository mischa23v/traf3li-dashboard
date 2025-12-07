import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Users,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  Clock,
  Target,
  Trash2,
  Phone,
  Calendar,
  FileBarChart,
  BarChart3,
} from 'lucide-react'
import { useLeadStats, useLeadsNeedingFollowUp, useUpcomingTasks } from '@/hooks/useCrm'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

interface CrmSidebarProps {
  context: 'leads' | 'pipeline' | 'referrals' | 'activities' | 'reports'
  isSelectionMode?: boolean
  onToggleSelectionMode?: () => void
  selectedCount?: number
  onDeleteSelected?: () => void
}

const links = {
  leads: {
    create: '/dashboard/crm/leads/new',
    viewAll: '/dashboard/crm/leads',
  },
  pipeline: {
    viewAll: '/dashboard/crm/pipeline',
  },
  activities: {
    viewAll: '/dashboard/crm/activities',
  },
  referrals: {
    create: '/dashboard/crm/referrals/new',
    viewAll: '/dashboard/crm/referrals',
  },
  reports: {
    create: '/dashboard/crm/reports/new',
    viewAll: '/dashboard/crm/reports',
  },
}

export function CrmSidebar({
  context,
  isSelectionMode,
  onToggleSelectionMode,
  selectedCount = 0,
  onDeleteSelected,
}: CrmSidebarProps) {
  const { t } = useTranslation()
  const { data: statsData, isLoading: statsLoading } = useLeadStats()
  const { data: followUpData, isLoading: followUpLoading } = useLeadsNeedingFollowUp(5)
  const { data: tasksData, isLoading: tasksLoading } = useUpcomingTasks({ limit: 5 })

  const stats = statsData?.stats

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-navy text-lg mb-4">{t('common.quickActions')}</h3>
        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 justify-start"
          >
            <Link to="/dashboard/crm/leads/new">
              <UserPlus className="ms-3 h-5 w-5" />
              {t('crm.leads.addNew')}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-xl h-12 justify-start border-slate-200 hover:bg-slate-50"
          >
            <Link to="/dashboard/crm/pipeline">
              <TrendingUp className="ms-3 h-5 w-5 text-emerald-600" />
              {t('crm.pipeline.view')}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-xl h-12 justify-start border-slate-200 hover:bg-slate-50"
          >
            <Link to="/dashboard/crm/activities">
              <Clock className="ms-3 h-5 w-5 text-blue-600" />
              {t('crm.activities.title')}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full rounded-xl h-12 justify-start border-slate-200 hover:bg-slate-50"
          >
            <Link to={links.reports.viewAll}>
              <BarChart3 className="ms-3 h-5 w-5 text-purple-600" />
              {t('crm.reports.title')}
            </Link>
          </Button>
          {context === 'reports' && (
            <Button
              asChild
              className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl h-12 justify-start"
            >
              <Link to={links.reports.create}>
                <FileBarChart className="ms-3 h-5 w-5" />
                {t('crm.reports.createNew')}
              </Link>
            </Button>
          )}

          {/* Selection Mode Actions */}
          {isSelectionMode && selectedCount > 0 && (
            <Button
              onClick={onDeleteSelected}
              variant="destructive"
              className="w-full rounded-xl h-12 justify-start"
            >
              <Trash2 className="ms-3 h-5 w-5" />
              {t('common.deleteSelected', { count: selectedCount })}
            </Button>
          )}

          {onToggleSelectionMode && (
            <Button
              onClick={onToggleSelectionMode}
              variant="ghost"
              className="w-full rounded-xl h-12 justify-start text-slate-600"
            >
              {isSelectionMode ? t('common.cancelSelection') : t('common.multiSelect')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-navy text-lg mb-4">{t('crm.stats.sales')}</h3>
        {statsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('crm.stats.totalLeads')}
              </span>
              <span className="font-bold text-navy text-lg">
                {stats?.total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
              <span className="text-emerald-700 flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" />
                {t('crm.stats.converted')}
              </span>
              <span className="font-bold text-emerald-700 text-lg">
                {stats?.converted || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
              <span className="text-blue-700 flex items-center gap-2">
                <Target className="h-4 w-4" />
                {t('crm.stats.conversionRate')}
              </span>
              <span className="font-bold text-blue-700 text-lg">
                {stats?.conversionRate || '0'}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Needs Follow Up */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-navy text-lg">{t('crm.leads.needsFollowUp')}</h3>
          <Button variant="ghost" size="sm" className="text-emerald-600" asChild>
            <Link to="/dashboard/crm/leads?filter=followup">{t('common.viewAll')}</Link>
          </Button>
        </div>
        {followUpLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : followUpData && followUpData.length > 0 ? (
          <div className="space-y-3">
            {followUpData.slice(0, 5).map((lead: any) => (
              <Link
                key={lead._id}
                to={`/dashboard/crm/leads/${lead._id}`}
                className="block p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-navy">{lead.displayName}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </p>
                  </div>
                  {lead.nextFollowUpDate && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
                      {formatDistanceToNow(new Date(lead.nextFollowUpDate), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">{t('crm.leads.noUpcomingFollowups')}</p>
        )}
      </div>

      {/* Upcoming Tasks */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-navy text-lg">{t('crm.tasks.upcoming')}</h3>
          <Button variant="ghost" size="sm" className="text-emerald-600" asChild>
            <Link to="/dashboard/crm/activities">{t('common.viewAll')}</Link>
          </Button>
        </div>
        {tasksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : tasksData && tasksData.length > 0 ? (
          <div className="space-y-3">
            {tasksData.slice(0, 5).map((task: any) => (
              <div
                key={task._id}
                className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <p className="font-medium text-navy">{task.title}</p>
                {task.taskData?.dueDate && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(task.taskData.dueDate).toLocaleDateString('ar-SA')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">{t('crm.tasks.noUpcoming')}</p>
        )}
      </div>
    </div>
  )
}

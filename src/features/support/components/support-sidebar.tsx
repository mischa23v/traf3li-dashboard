/**
 * Support Sidebar
 * Quick actions and widgets for support/helpdesk
 */

import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Headphones,
  Plus,
  Clock,
  BarChart3,
  Settings,
  AlertTriangle,
  MessageSquare,
  Users,
  FileText,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { useSupportStats, useTickets } from '@/hooks/use-support'

export function SupportSidebar() {
  const { t } = useTranslation()
  const { data: stats, isLoading: loadingStats } = useSupportStats()
  const { data: urgentTickets, isLoading: loadingUrgent } = useTickets({ priority: 'urgent', status: 'open' })

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Headphones className="w-5 h-5 text-emerald-600" />
            {t('support.quickActions', 'إجراءات سريعة')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/support/create">
              <Plus className="w-4 h-4 ml-2" />
              {t('support.createTicket', 'إنشاء تذكرة')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘N</kbd>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/support/slas">
              <Clock className="w-4 h-4 ml-2" />
              {t('support.manageSLAs', 'إدارة SLAs')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/support/reports">
              <BarChart3 className="w-4 h-4 ml-2" />
              {t('support.reports', 'التقارير')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Urgent Tickets */}
      <Card className="rounded-3xl border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            {t('support.urgentTickets', 'تذاكر عاجلة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUrgent ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !urgentTickets?.tickets || urgentTickets.tickets.length === 0 ? (
            <p className="text-sm text-red-600">
              {t('support.noUrgentTickets', 'لا توجد تذاكر عاجلة')}
            </p>
          ) : (
            <div className="space-y-2">
              {urgentTickets.tickets.slice(0, 5).map((ticket) => (
                <Link
                  key={ticket._id}
                  to={`/dashboard/support/${ticket._id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800 truncate max-w-[150px]">
                      {ticket.subject}
                    </span>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {t('support.priority.urgent', 'عاجل')}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support Stats */}
      {stats && (
        <Card className="rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              {t('support.performanceStats', 'إحصائيات الأداء')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('support.avgResponseTime', 'متوسط وقت الرد')}</span>
                <span className="font-bold">{stats.averageResponseTime || 0} {t('support.minutes', 'دقيقة')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('support.avgResolutionTime', 'متوسط وقت الحل')}</span>
                <span className="font-bold">{stats.averageResolutionTime || 0} {t('support.minutes', 'دقيقة')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('support.slaCompliance', 'التزام SLA')}</span>
                <Badge variant={stats.slaComplianceRate >= 90 ? 'default' : 'destructive'} className={stats.slaComplianceRate >= 90 ? 'bg-emerald-500' : ''}>
                  {stats.slaComplianceRate || 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Link */}
      <Card className="rounded-3xl">
        <CardContent className="p-4">
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link to="/dashboard/settings/support">
              <Settings className="w-4 h-4 ml-2" />
              {t('support.settings', 'إعدادات الدعم')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

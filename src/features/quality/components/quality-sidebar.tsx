/**
 * Quality Sidebar
 * Complete navigation and widgets for quality management
 */

import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ClipboardCheck,
  Plus,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  List,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { useQualityStats, useActions, useInspections } from '@/hooks/use-quality'

export function QualitySidebar() {
  const { t } = useTranslation()
  const { data: stats, isLoading: loadingStats } = useQualityStats()
  const { data: openActions, isLoading: loadingActions } = useActions({ status: 'open' })
  const { data: pendingInspections, isLoading: loadingPending } = useInspections({ status: 'pending' })
  const { data: failedInspections, isLoading: loadingFailed } = useInspections({ status: 'failed' })

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            {t('quality.quickActions', 'إجراءات سريعة')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/quality/create">
              <Plus className="w-4 h-4 ml-2" />
              {t('quality.newInspection', 'فحص جديد')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘N</kbd>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/quality/templates/create">
              <FileText className="w-4 h-4 ml-2" />
              {t('quality.newTemplate', 'قالب جديد')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/quality/actions/create">
              <AlertTriangle className="w-4 h-4 ml-2" />
              {t('quality.newAction', 'إجراء جديد')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <List className="w-5 h-5 text-emerald-600" />
            {t('quality.navigation', 'التنقل')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/quality">
              <ClipboardCheck className="w-4 h-4 ml-2" />
              {t('quality.inspections', 'الفحوصات')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/quality/templates">
              <FileText className="w-4 h-4 ml-2" />
              {t('quality.templates', 'القوالب')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/quality/actions">
              <AlertTriangle className="w-4 h-4 ml-2" />
              {t('quality.actions', 'الإجراءات')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/quality/settings">
              <Settings className="w-4 h-4 ml-2" />
              {t('quality.settings', 'الإعدادات')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Pending Inspections Widget */}
      <Card className="rounded-3xl border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
            <Clock className="w-5 h-5" />
            {t('quality.pendingInspections', 'فحوصات معلقة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPending ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !pendingInspections || pendingInspections.length === 0 ? (
            <p className="text-sm text-blue-600">
              {t('quality.noPendingInspections', 'لا توجد فحوصات معلقة')}
            </p>
          ) : (
            <div className="space-y-2">
              {pendingInspections.slice(0, 5).map((inspection) => (
                <Link
                  key={inspection._id}
                  to={`/dashboard/quality/${inspection._id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 truncate max-w-[150px]">
                      {inspection.title || inspection.templateName}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    {t('quality.pending', 'معلق')}
                  </Badge>
                </Link>
              ))}
              {pendingInspections.length > 5 && (
                <Button asChild variant="ghost" size="sm" className="w-full text-blue-700">
                  <Link to="/dashboard/quality?status=pending">
                    {t('quality.viewAll', 'عرض الكل')} ({pendingInspections.length})
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Failed Inspections Widget */}
      <Card className="rounded-3xl border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <XCircle className="w-5 h-5" />
            {t('quality.failedInspections', 'فحوصات فاشلة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingFailed ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !failedInspections || failedInspections.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              {t('quality.noFailedInspections', 'لا توجد فحوصات فاشلة')}
            </div>
          ) : (
            <div className="space-y-2">
              {failedInspections.slice(0, 5).map((inspection) => (
                <Link
                  key={inspection._id}
                  to={`/dashboard/quality/${inspection._id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800 truncate max-w-[150px]">
                      {inspection.title || inspection.templateName}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                    {t('quality.failed', 'فاشل')}
                  </Badge>
                </Link>
              ))}
              {failedInspections.length > 5 && (
                <Button asChild variant="ghost" size="sm" className="w-full text-red-700">
                  <Link to="/dashboard/quality?status=failed">
                    {t('quality.viewAll', 'عرض الكل')} ({failedInspections.length})
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Actions Widget */}
      <Card className="rounded-3xl border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            {t('quality.openActions', 'إجراءات مفتوحة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingActions ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !openActions || openActions.length === 0 ? (
            <p className="text-sm text-amber-600">
              {t('quality.noOpenActions', 'لا توجد إجراءات مفتوحة')}
            </p>
          ) : (
            <div className="space-y-2">
              {openActions.slice(0, 5).map((action) => (
                <Link
                  key={action._id}
                  to={`/dashboard/quality/actions/${action._id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800 truncate max-w-[150px]">
                      {action.description}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                    {action.type === 'corrective' ? t('quality.corrective', 'تصحيحي') : t('quality.preventive', 'وقائي')}
                  </Badge>
                </Link>
              ))}
              {openActions.length > 5 && (
                <Button asChild variant="ghost" size="sm" className="w-full text-amber-700">
                  <Link to="/dashboard/quality/actions?status=open">
                    {t('quality.viewAll', 'عرض الكل')} ({openActions.length})
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

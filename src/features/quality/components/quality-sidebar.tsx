/**
 * Quality Sidebar
 * Quick actions and widgets for quality management
 */

import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ClipboardCheck,
  Plus,
  FileText,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

import { useQualityStats, useActions } from '@/hooks/use-quality'

export function QualitySidebar() {
  const { t } = useTranslation()
  const { data: stats, isLoading: loadingStats } = useQualityStats()
  const { data: openActions, isLoading: loadingActions } = useActions({ status: 'open' })

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            {t('quality.quickActions', 'إجراءات سريعة')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/quality/create">
              <Plus className="w-4 h-4 ml-2" />
              {t('quality.createInspection', 'إنشاء فحص')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘N</kbd>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/quality/templates">
              <FileText className="w-4 h-4 ml-2" />
              {t('quality.templates', 'قوالب الفحص')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/quality/actions">
              <AlertTriangle className="w-4 h-4 ml-2" />
              {t('quality.actions', 'الإجراءات التصحيحية')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/quality/reports">
              <BarChart3 className="w-4 h-4 ml-2" />
              {t('quality.reports', 'التقارير')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Pass/Fail Rate */}
      {stats && (
        <Card className="rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              {t('quality.passFailRate', 'نسبة النجاح/الفشل')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {t('quality.passRate', 'نسبة النجاح')}
                </span>
                <span className="font-bold text-emerald-600">{stats.passRate || 0}%</span>
              </div>
              <Progress value={stats.passRate || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  {t('quality.failRate', 'نسبة الفشل')}
                </span>
                <span className="font-bold text-red-600">{stats.failRate || 0}%</span>
              </div>
              <Progress value={stats.failRate || 0} className="h-2 bg-red-100 [&>div]:bg-red-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Open Actions */}
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

      {/* Settings Link */}
      <Card className="rounded-3xl">
        <CardContent className="p-4">
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link to="/dashboard/settings/quality">
              <Settings className="w-4 h-4 ml-2" />
              {t('quality.settings', 'إعدادات الجودة')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Assets Sidebar
 * Quick actions and widgets for asset management
 */

import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  Plus,
  BarChart3,
  Settings,
  Wrench,
  TrendingDown,
  ArrowRightLeft,
  FolderOpen,
  AlertTriangle,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { useAssetStats, useMaintenanceSchedules } from '@/hooks/use-assets'

export function AssetsSidebar() {
  const { t } = useTranslation()
  const { data: stats, isLoading: loadingStats } = useAssetStats()
  const { data: upcomingMaintenance, isLoading: loadingMaintenance } = useMaintenanceSchedules({ status: 'planned' })

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            {t('assets.quickActions', 'إجراءات سريعة')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/assets/create">
              <Plus className="w-4 h-4 ml-2" />
              {t('assets.addAsset', 'إضافة أصل')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘N</kbd>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/assets/categories">
              <FolderOpen className="w-4 h-4 ml-2" />
              {t('assets.categories', 'فئات الأصول')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/assets/movements">
              <ArrowRightLeft className="w-4 h-4 ml-2" />
              {t('assets.movements', 'حركات الأصول')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/assets/depreciation">
              <TrendingDown className="w-4 h-4 ml-2" />
              {t('assets.depreciation', 'الإهلاك')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/assets/reports">
              <BarChart3 className="w-4 h-4 ml-2" />
              {t('assets.reports', 'التقارير')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Asset Value Summary */}
      {stats && (
        <Card className="rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              {t('assets.valueSummary', 'ملخص القيمة')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('assets.grossValue', 'القيمة الإجمالية')}</span>
                <span className="font-bold">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.totalValue || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('assets.totalDepreciation', 'إجمالي الإهلاك')}</span>
                <span className="font-bold text-red-600">-{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.totalDepreciation || 0)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-sm font-medium">{t('assets.netValue', 'صافي القيمة')}</span>
                <span className="font-bold text-emerald-600">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.netValue || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Maintenance */}
      <Card className="rounded-3xl border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
            <Wrench className="w-5 h-5" />
            {t('assets.upcomingMaintenance', 'صيانة قادمة')}
            {stats?.overdueMaintenance && stats.overdueMaintenance > 0 && (
              <Badge variant="destructive" className="mr-2">{stats.overdueMaintenance}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMaintenance ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !upcomingMaintenance || upcomingMaintenance.length === 0 ? (
            <p className="text-sm text-amber-600">
              {t('assets.noUpcomingMaintenance', 'لا توجد صيانة مجدولة')}
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingMaintenance.slice(0, 5).map((schedule, index) => (
                <div
                  key={schedule._id || index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800 truncate max-w-[150px]">
                      {schedule.maintenanceType}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                    {schedule.maintenanceDate}
                  </Badge>
                </div>
              ))}
              {upcomingMaintenance.length > 5 && (
                <Button asChild variant="ghost" size="sm" className="w-full text-amber-700">
                  <Link to="/dashboard/assets/maintenance">
                    {t('assets.viewAll', 'عرض الكل')} ({upcomingMaintenance.length})
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
            <Link to="/dashboard/settings/assets">
              <Settings className="w-4 h-4 ml-2" />
              {t('assets.settings', 'إعدادات الأصول')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

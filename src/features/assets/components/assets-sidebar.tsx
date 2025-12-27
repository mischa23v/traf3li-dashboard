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
  FolderOpen,
  AlertTriangle,
  Package,
  Calendar,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/constants/routes'

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
            <Link to={ROUTES.dashboard.assets.create}>
              <Plus className="w-4 h-4 ml-2" />
              {t('assets.newAsset', 'أصل جديد')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘N</kbd>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.assets.categories.create}>
              <FolderOpen className="w-4 h-4 ml-2" />
              {t('assets.newCategory', 'فئة جديدة')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.assets.maintenance.create}>
              <Calendar className="w-4 h-4 ml-2" />
              {t('assets.scheduleMaintenance', 'جدولة صيانة')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            {t('assets.navigation', 'التنقل')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.assets.list}>
              <Building2 className="w-4 h-4 ml-2" />
              {t('assets.assets', 'الأصول')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.assets.categories.list}>
              <FolderOpen className="w-4 h-4 ml-2" />
              {t('assets.categories', 'الفئات')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.assets.maintenance.list}>
              <Wrench className="w-4 h-4 ml-2" />
              {t('assets.maintenance', 'الصيانة')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.assets.settings}>
              <Settings className="w-4 h-4 ml-2" />
              {t('assets.settings', 'الإعدادات')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Total Assets Value Widget */}
      {loadingStats ? (
        <Card className="rounded-3xl">
          <CardContent className="p-4">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : stats && (
        <Card className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
              <BarChart3 className="w-5 h-5" />
              {t('assets.totalAssetsValue', 'إجمالي قيمة الأصول')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-emerald-700">{t('assets.grossValue', 'القيمة الإجمالية')}</span>
                <span className="font-bold text-emerald-900">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.totalValue || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-emerald-700">{t('assets.totalDepreciation', 'إجمالي الإهلاك')}</span>
                <span className="font-bold text-red-600">-{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.totalDepreciation || 0)}</span>
              </div>
              <div className="border-t border-emerald-200 pt-2 flex justify-between">
                <span className="text-sm font-medium text-emerald-700">{t('assets.netValue', 'صافي القيمة')}</span>
                <span className="font-bold text-emerald-600 text-lg">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.netValue || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Maintenance Widget */}
      <Card className="rounded-3xl border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            {t('assets.overdueMaintenance', 'صيانة متأخرة')}
            {stats?.overdueMaintenance && stats.overdueMaintenance > 0 && (
              <Badge variant="destructive" className="mr-2">{stats.overdueMaintenance}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <Skeleton className="h-16 w-full" />
          ) : stats?.overdueMaintenance && stats.overdueMaintenance > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-700">{t('assets.overdueItems', 'عناصر متأخرة')}</span>
                <span className="text-2xl font-bold text-amber-800">{stats.overdueMaintenance}</span>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full text-amber-700 border-amber-300 hover:bg-amber-100">
                <Link to={`${ROUTES.dashboard.assets.maintenance.list}?filter=overdue`}>
                  {t('assets.viewOverdue', 'عرض المتأخرات')}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-amber-600">{t('assets.noOverdueMaintenance', 'لا توجد صيانة متأخرة')}</p>
              <p className="text-xs text-amber-500 mt-1">{t('assets.allOnTrack', 'كل شيء على المسار الصحيح')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Depreciation This Month Widget */}
      <Card className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
            <TrendingDown className="w-5 h-5" />
            {t('assets.depreciationThisMonth', 'إهلاك هذا الشهر')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <Skeleton className="h-16 w-full" />
          ) : stats ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">{t('assets.monthlyDepreciation', 'الإهلاك الشهري')}</span>
                <span className="text-2xl font-bold text-blue-800">
                  {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.monthlyDepreciation || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-600">{t('assets.ytdDepreciation', 'الإهلاك منذ بداية العام')}</span>
                <span className="font-medium text-blue-700">
                  {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.ytdDepreciation || 0)}
                </span>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full text-blue-700 border-blue-300 hover:bg-blue-100">
                <Link to={ROUTES.dashboard.assets.depreciation.list}>
                  {t('assets.viewDepreciation', 'عرض تفاصيل الإهلاك')}
                </Link>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

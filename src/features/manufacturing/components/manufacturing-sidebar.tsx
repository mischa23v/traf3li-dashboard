/**
 * Manufacturing Sidebar
 * Quick actions and widgets for manufacturing
 */

import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Factory,
  Plus,
  FileText,
  BarChart3,
  Settings,
  Cog,
  ClipboardList,
  Layers,
  PlayCircle,
  Navigation,
  TrendingUp,
  Clock,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/constants/routes'

import { useManufacturingStats, useWorkOrders } from '@/hooks/use-manufacturing'

export function ManufacturingSidebar() {
  const { t } = useTranslation()
  const { data: stats, isLoading: loadingStats } = useManufacturingStats()
  const { data: activeOrders, isLoading: loadingActive } = useWorkOrders({ status: 'in_progress' })

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            {t('manufacturing.quickActions', 'إجراءات سريعة')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.manufacturing.create}>
              <Plus className="w-4 h-4 ml-2" />
              {t('manufacturing.newWorkOrder', 'أمر عمل جديد')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.manufacturing.bom.create}>
              <Layers className="w-4 h-4 ml-2" />
              {t('manufacturing.newBOM', 'قائمة مواد جديدة')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.manufacturing.workstations.create}>
              <Cog className="w-4 h-4 ml-2" />
              {t('manufacturing.newWorkstation', 'محطة عمل جديدة')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            {t('manufacturing.navigation', 'التنقل')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.manufacturing.list}>
              <Factory className="w-4 h-4 ml-2" />
              {t('manufacturing.workOrders', 'أوامر العمل')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.manufacturing.bom.list}>
              <Layers className="w-4 h-4 ml-2" />
              {t('manufacturing.billOfMaterials', 'قوائم المواد')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.manufacturing.workstations.list}>
              <Cog className="w-4 h-4 ml-2" />
              {t('manufacturing.workstations', 'محطات العمل')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.manufacturing.jobCards.list}>
              <ClipboardList className="w-4 h-4 ml-2" />
              {t('manufacturing.jobCards', 'بطاقات العمل')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.manufacturing.settings}>
              <Settings className="w-4 h-4 ml-2" />
              {t('manufacturing.settings', 'الإعدادات')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Active Work Orders Widget */}
      <Card className="rounded-3xl border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
            <PlayCircle className="w-5 h-5" />
            {t('manufacturing.activeWorkOrders', 'أوامر العمل النشطة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingActive ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !activeOrders?.workOrders || activeOrders.workOrders.length === 0 ? (
            <p className="text-sm text-blue-600">
              {t('manufacturing.noActiveOrders', 'لا توجد أوامر نشطة')}
            </p>
          ) : (
            <div className="space-y-2">
              {activeOrders.workOrders.slice(0, 5).map((order) => (
                <Link
                  key={order._id}
                  to={ROUTES.dashboard.manufacturing.detail(order._id)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {order.workOrderNumber}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    {order.producedQty}/{order.qty}
                  </Badge>
                </Link>
              ))}
              {activeOrders.workOrders.length > 5 && (
                <Button asChild variant="ghost" size="sm" className="w-full text-blue-700">
                  <Link to={`${ROUTES.dashboard.manufacturing.list}?status=in_progress`}>
                    {t('manufacturing.viewAll', 'عرض الكل')} ({activeOrders.workOrders.length})
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Job Cards Widget */}
      <Card className="rounded-3xl border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
            <Clock className="w-5 h-5" />
            {t('manufacturing.pendingJobCards', 'بطاقات العمل المعلقة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {stats?.pendingJobCards || 0}
              </div>
              <div className="text-sm text-amber-700">
                {t('manufacturing.cardsAwaitingAction', 'بطاقات في انتظار الإجراء')}
              </div>
              <Button asChild variant="ghost" size="sm" className="w-full mt-3 text-amber-700">
                <Link to={`${ROUTES.dashboard.manufacturing.jobCards.list}?status=pending`}>
                  {t('manufacturing.viewPending', 'عرض المعلقة')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Production Today Widget */}
      <Card className="rounded-3xl border-emerald-200 bg-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
            <TrendingUp className="w-5 h-5" />
            {t('manufacturing.productionToday', 'الإنتاج اليوم')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-700">
                  {t('manufacturing.completedOrders', 'أوامر مكتملة')}
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  {stats?.completedToday || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-700">
                  {t('manufacturing.producedQty', 'الكمية المنتجة')}
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  {stats?.producedToday || 0}
                </span>
              </div>
              <Button asChild variant="ghost" size="sm" className="w-full text-emerald-700">
                <Link to={`${ROUTES.dashboard.manufacturing.list}?date=today`}>
                  {t('manufacturing.viewDetails', 'عرض التفاصيل')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

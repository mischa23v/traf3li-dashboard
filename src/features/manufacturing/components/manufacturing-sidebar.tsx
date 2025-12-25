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
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

import { useManufacturingStats, useWorkOrders } from '@/hooks/use-manufacturing'

export function ManufacturingSidebar() {
  const { t } = useTranslation()
  const { data: stats, isLoading: loadingStats } = useManufacturingStats()
  const { data: inProgressOrders, isLoading: loadingInProgress } = useWorkOrders({ status: 'in_progress' })

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Factory className="w-5 h-5 text-emerald-600" />
            {t('manufacturing.quickActions', 'إجراءات سريعة')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/manufacturing/work-orders/create">
              <Plus className="w-4 h-4 ml-2" />
              {t('manufacturing.createWorkOrder', 'إنشاء أمر عمل')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘N</kbd>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/manufacturing/boms">
              <Layers className="w-4 h-4 ml-2" />
              {t('manufacturing.boms', 'قوائم المواد')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/manufacturing/workstations">
              <Cog className="w-4 h-4 ml-2" />
              {t('manufacturing.workstations', 'محطات العمل')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/manufacturing/job-cards">
              <ClipboardList className="w-4 h-4 ml-2" />
              {t('manufacturing.jobCards', 'بطاقات العمل')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/manufacturing/reports">
              <BarChart3 className="w-4 h-4 ml-2" />
              {t('manufacturing.reports', 'التقارير')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Production Efficiency */}
      {stats && (
        <Card className="rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              {t('manufacturing.efficiency', 'كفاءة الإنتاج')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">{stats.productionEfficiency || 0}%</div>
              <Progress value={stats.productionEfficiency || 0} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <div className="text-lg font-bold text-blue-600">{stats.totalBOMs || 0}</div>
                <div className="text-xs text-muted-foreground">{t('manufacturing.totalBOMs', 'قوائم المواد')}</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <div className="text-lg font-bold text-purple-600">{stats.totalWorkstations || 0}</div>
                <div className="text-xs text-muted-foreground">{t('manufacturing.workstations', 'محطات العمل')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Progress Orders */}
      <Card className="rounded-3xl border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
            <PlayCircle className="w-5 h-5" />
            {t('manufacturing.inProgressOrders', 'أوامر قيد التنفيذ')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingInProgress ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !inProgressOrders?.workOrders || inProgressOrders.workOrders.length === 0 ? (
            <p className="text-sm text-blue-600">
              {t('manufacturing.noInProgressOrders', 'لا توجد أوامر قيد التنفيذ')}
            </p>
          ) : (
            <div className="space-y-2">
              {inProgressOrders.workOrders.slice(0, 5).map((order) => (
                <Link
                  key={order._id}
                  to={`/dashboard/manufacturing/work-orders/${order._id}`}
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
              {inProgressOrders.workOrders.length > 5 && (
                <Button asChild variant="ghost" size="sm" className="w-full text-blue-700">
                  <Link to="/dashboard/manufacturing/work-orders?status=in_progress">
                    {t('manufacturing.viewAll', 'عرض الكل')} ({inProgressOrders.workOrders.length})
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
            <Link to="/dashboard/settings/manufacturing">
              <Settings className="w-4 h-4 ml-2" />
              {t('manufacturing.settings', 'إعدادات التصنيع')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

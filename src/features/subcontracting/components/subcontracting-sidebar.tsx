/**
 * Subcontracting Sidebar
 * Quick actions and widgets for subcontracting
 */

import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  GitBranch,
  Plus,
  BarChart3,
  Settings,
  Package,
  Users,
  Layers,
  FileText,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { useSubcontractingStats, useSubcontractingOrders } from '@/hooks/use-subcontracting'

export function SubcontractingSidebar() {
  const { t } = useTranslation()
  const { data: stats, isLoading: loadingStats } = useSubcontractingStats()
  const { data: pendingOrders, isLoading: loadingPending } = useSubcontractingOrders({ status: 'submitted' })

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-600" />
            {t('subcontracting.quickActions', 'إجراءات سريعة')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/subcontracting/orders/create">
              <Plus className="w-4 h-4 ml-2" />
              {t('subcontracting.createOrder', 'إنشاء أمر')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘N</kbd>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/subcontracting/receipts">
              <Package className="w-4 h-4 ml-2" />
              {t('subcontracting.receipts', 'إيصالات الاستلام')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/subcontracting/boms">
              <Layers className="w-4 h-4 ml-2" />
              {t('subcontracting.boms', 'قوائم المواد')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/subcontracting/reports">
              <BarChart3 className="w-4 h-4 ml-2" />
              {t('subcontracting.reports', 'التقارير')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Top Subcontractors */}
      {stats?.topSubcontractors && stats.topSubcontractors.length > 0 && (
        <Card className="rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              {t('subcontracting.topSubcontractors', 'أفضل المصنعين')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topSubcontractors.slice(0, 5).map((subcontractor, index) => (
                <div
                  key={subcontractor.supplierId}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {subcontractor.supplierName}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {subcontractor.totalOrders} {t('subcontracting.orders', 'أوامر')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Orders */}
      <Card className="rounded-3xl border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
            <FileText className="w-5 h-5" />
            {t('subcontracting.pendingOrders', 'أوامر معلقة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPending ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !pendingOrders?.orders || pendingOrders.orders.length === 0 ? (
            <p className="text-sm text-amber-600">
              {t('subcontracting.noPendingOrders', 'لا توجد أوامر معلقة')}
            </p>
          ) : (
            <div className="space-y-2">
              {pendingOrders.orders.slice(0, 5).map((order) => (
                <Link
                  key={order._id}
                  to={`/dashboard/subcontracting/orders/${order._id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      {order.orderNumber}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                    {order.percentReceived || 0}%
                  </Badge>
                </Link>
              ))}
              {pendingOrders.orders.length > 5 && (
                <Button asChild variant="ghost" size="sm" className="w-full text-amber-700">
                  <Link to="/dashboard/subcontracting/orders?status=submitted">
                    {t('subcontracting.viewAll', 'عرض الكل')} ({pendingOrders.orders.length})
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
            <Link to="/dashboard/settings/subcontracting">
              <Settings className="w-4 h-4 ml-2" />
              {t('subcontracting.settings', 'إعدادات التصنيع الخارجي')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

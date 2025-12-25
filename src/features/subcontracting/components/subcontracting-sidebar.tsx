/**
 * Subcontracting Sidebar
 * Quick actions and widgets for subcontracting
 */

import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  GitBranch,
  Plus,
  Settings,
  Package,
  FileText,
  List,
  PackageCheck,
  Boxes,
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
            <Link to="/dashboard/subcontracting/create">
              <Plus className="w-4 h-4 ml-2" />
              {t('subcontracting.newOrder', 'أمر جديد')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘N</kbd>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/subcontracting/receipts/create">
              <PackageCheck className="w-4 h-4 ml-2" />
              {t('subcontracting.newReceipt', 'إيصال استلام جديد')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <List className="w-5 h-5 text-emerald-600" />
            {t('subcontracting.navigation', 'التنقل')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/subcontracting">
              <FileText className="w-4 h-4 ml-2" />
              {t('subcontracting.orders', 'أوامر التصنيع')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/subcontracting/receipts">
              <Package className="w-4 h-4 ml-2" />
              {t('subcontracting.receipts', 'إيصالات الاستلام')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/subcontracting/settings">
              <Settings className="w-4 h-4 ml-2" />
              {t('subcontracting.settings', 'الإعدادات')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Pending Orders Widget */}
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
                  <Link to="/dashboard/subcontracting?status=submitted">
                    {t('subcontracting.viewAll', 'عرض الكل')} ({pendingOrders.orders.length})
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Receipts Widget */}
      <Card className="rounded-3xl border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
            <PackageCheck className="w-5 h-5" />
            {t('subcontracting.pendingReceipts', 'إيصالات معلقة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-3xl font-bold text-blue-700">
                {stats?.stats?.pendingReceipts || 0}
              </div>
              <p className="text-sm text-blue-600 mt-1">
                {t('subcontracting.awaitingReceipt', 'في انتظار الاستلام')}
              </p>
              <Button asChild variant="ghost" size="sm" className="mt-3 text-blue-700">
                <Link to="/dashboard/subcontracting/receipts?status=pending">
                  {t('subcontracting.viewReceipts', 'عرض الإيصالات')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials at Subcontractor Widget */}
      <Card className="rounded-3xl border-purple-200 bg-purple-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
            <Boxes className="w-5 h-5" />
            {t('subcontracting.materialsAtSubcontractor', 'مواد عند المصنع')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-100/50">
                <span className="text-sm font-medium text-purple-700">
                  {t('subcontracting.totalValue', 'القيمة الإجمالية')}
                </span>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                  {stats?.stats?.materialsValue?.toLocaleString('ar-SA') || 0} {t('common.sar', 'ر.س')}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-100/50">
                <span className="text-sm font-medium text-purple-700">
                  {t('subcontracting.totalItems', 'عدد الأصناف')}
                </span>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                  {stats?.stats?.materialsCount || 0}
                </Badge>
              </div>
              <Button asChild variant="ghost" size="sm" className="w-full text-purple-700">
                <Link to="/dashboard/subcontracting/materials">
                  {t('subcontracting.viewMaterials', 'عرض المواد')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

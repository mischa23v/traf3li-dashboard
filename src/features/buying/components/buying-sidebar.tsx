/**
 * Buying Sidebar
 * Quick actions and widgets for buying/procurement
 */

import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ShoppingCart,
  Plus,
  Users,
  FileText,
  BarChart3,
  Settings,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  MessageSquare,
  ClipboardList,
  FolderOpen,
  PieChart,
  Award,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

import { useBuyingStats, usePendingPurchaseOrders } from '@/hooks/use-buying'

export function BuyingSidebar() {
  const { t } = useTranslation()
  const { data: stats, isLoading: loadingStats } = useBuyingStats()
  const { data: pendingOrders, isLoading: loadingPending } = usePendingPurchaseOrders()

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            {t('buying.quickActions', 'إجراءات سريعة')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/buying/create">
              <Plus className="w-4 h-4 ml-2" />
              {t('buying.newSupplier', 'مورد جديد')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘N</kbd>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/buying/purchase-orders/create">
              <FileText className="w-4 h-4 ml-2" />
              {t('buying.newPurchaseOrder', 'أمر شراء جديد')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘O</kbd>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/buying/material-requests/create">
              <Package className="w-4 h-4 ml-2" />
              {t('buying.newMaterialRequest', 'طلب مواد جديد')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/buying/rfq/create">
              <MessageSquare className="w-4 h-4 ml-2" />
              {t('buying.newRFQ', 'طلب عرض سعر جديد')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            {t('buying.navigation', 'التنقل')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/buying">
              <Users className="w-4 h-4 ml-2" />
              {t('buying.suppliers', 'الموردين')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/buying/purchase-orders">
              <ClipboardList className="w-4 h-4 ml-2" />
              {t('buying.purchaseOrders', 'أوامر الشراء')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/buying/material-requests">
              <Package className="w-4 h-4 ml-2" />
              {t('buying.materialRequests', 'طلبات المواد')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/buying/rfq">
              <MessageSquare className="w-4 h-4 ml-2" />
              {t('buying.rfq', 'طلبات عروض الأسعار')}
            </Link>
          </Button>
          <Separator className="my-2" />
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/buying/settings">
              <Settings className="w-4 h-4 ml-2" />
              {t('buying.settings', 'الإعدادات')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card className="rounded-3xl border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
            <BarChart3 className="w-5 h-5" />
            {t('buying.reports', 'التقارير')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl hover:bg-purple-100">
            <Link to="/dashboard/buying/reports/analytics">
              <PieChart className="w-4 h-4 ml-2 text-purple-600" />
              <span className="text-purple-900">{t('buying.purchaseAnalytics', 'تحليلات المشتريات')}</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl hover:bg-purple-100">
            <Link to="/dashboard/buying/reports/supplier-performance">
              <Award className="w-4 h-4 ml-2 text-purple-600" />
              <span className="text-purple-900">{t('buying.supplierPerformance', 'أداء الموردين')}</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Pending Orders */}
      <Card className="rounded-3xl border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
            <Clock className="w-5 h-5" />
            {t('buying.pendingOrders', 'أوامر معلقة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPending ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !pendingOrders || pendingOrders.length === 0 ? (
            <p className="text-sm text-amber-600">
              {t('buying.noPendingOrders', 'لا توجد أوامر شراء معلقة')}
            </p>
          ) : (
            <div className="space-y-2">
              {pendingOrders.slice(0, 5).map((order) => (
                <Link
                  key={order._id}
                  to={`/dashboard/buying/purchase-orders/${order._id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      {order.orderNumber}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                    {order.status}
                  </Badge>
                </Link>
              ))}
              {pendingOrders.length > 5 && (
                <Button asChild variant="ghost" size="sm" className="w-full text-amber-700">
                  <Link to="/dashboard/buying/purchase-orders?status=pending">
                    {t('buying.viewAll', 'عرض الكل')} ({pendingOrders.length})
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Stats */}
      {stats && (
        <Card className="rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              {t('buying.purchaseStats', 'إحصائيات المشتريات')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy mb-4">
              {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.totalPurchaseValue || 0)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <div className="text-lg font-bold text-emerald-600">{stats.totalSuppliers || 0}</div>
                <div className="text-xs text-muted-foreground">{t('buying.suppliers', 'موردين')}</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <div className="text-lg font-bold text-blue-600">{stats.totalOrders || 0}</div>
                <div className="text-xs text-muted-foreground">{t('buying.orders', 'أوامر')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

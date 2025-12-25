/**
 * Inventory Sidebar
 * Quick actions and widgets for inventory management
 */

import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Plus,
  Warehouse,
  ArrowRightLeft,
  FileText,
  BarChart3,
  Settings,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Boxes,
  ListChecks,
  Clock,
  AlertCircle,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { useLowStockItems, useInventoryStats, useWarehouses } from '@/hooks/use-inventory'

interface InventorySidebarProps {
  context?: 'items' | 'warehouses' | 'stock-entries' | 'details'
}

export function InventorySidebar({ context = 'items' }: InventorySidebarProps) {
  const { t } = useTranslation()
  const { data: lowStockItems, isLoading: loadingLowStock } = useLowStockItems()
  const { data: stats, isLoading: loadingStats } = useInventoryStats()
  const { data: warehouses, isLoading: loadingWarehouses } = useWarehouses()

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-600" />
            {t('inventory.quickActions', 'إجراءات سريعة')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/inventory/create">
              <Plus className="w-4 h-4 ml-2" />
              {t('inventory.newItem', 'صنف جديد')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘N</kbd>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/inventory/warehouses/create">
              <Plus className="w-4 h-4 ml-2" />
              {t('inventory.newWarehouse', 'مستودع جديد')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/inventory/stock-entries/create">
              <Plus className="w-4 h-4 ml-2" />
              {t('inventory.newStockEntry', 'حركة مخزون جديدة')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘E</kbd>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-blue-600" />
            {t('inventory.navigation', 'التنقل')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/inventory">
              <Package className="w-4 h-4 ml-2" />
              {t('inventory.items', 'الأصناف')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/inventory/warehouses">
              <Warehouse className="w-4 h-4 ml-2" />
              {t('inventory.warehouses', 'المستودعات')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/inventory/stock-entries">
              <ArrowRightLeft className="w-4 h-4 ml-2" />
              {t('inventory.stockEntries', 'حركات المخزون')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/inventory/stock-ledger">
              <FileText className="w-4 h-4 ml-2" />
              {t('inventory.stockLedger', 'دفتر المخزون')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/inventory/settings">
              <Settings className="w-4 h-4 ml-2" />
              {t('inventory.settings', 'الإعدادات')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            {t('inventory.reports', 'التقارير')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/inventory/reports/stock-balance">
              <TrendingUp className="w-4 h-4 ml-2" />
              {t('inventory.stockBalance', 'رصيد المخزون')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/inventory/reports/stock-aging">
              <Clock className="w-4 h-4 ml-2" />
              {t('inventory.stockAging', 'أعمار المخزون')}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to="/dashboard/inventory/reports/item-shortage">
              <AlertCircle className="w-4 h-4 ml-2" />
              {t('inventory.itemShortage', 'نقص الأصناف')}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      <Card className="rounded-3xl border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            {t('inventory.lowStockAlert', 'تنبيه المخزون')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLowStock ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !lowStockItems || lowStockItems.length === 0 ? (
            <p className="text-sm text-amber-600">
              {t('inventory.noLowStock', 'لا توجد أصناف منخفضة المخزون')}
            </p>
          ) : (
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <Link
                  key={item._id}
                  to={`/dashboard/inventory/${item._id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      {item.nameAr || item.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                    {t('inventory.lowStock', 'منخفض')}
                  </Badge>
                </Link>
              ))}
              {lowStockItems.length > 5 && (
                <Button asChild variant="ghost" size="sm" className="w-full text-amber-700">
                  <Link to="/dashboard/inventory?status=low_stock">
                    {t('inventory.viewAll', 'عرض الكل')} ({lowStockItems.length})
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warehouses Summary */}
      <Card className="rounded-3xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-blue-600" />
            {t('inventory.warehouses', 'المستودعات')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingWarehouses ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !warehouses || warehouses.length === 0 ? (
            <div className="text-center py-4">
              <Warehouse className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                {t('inventory.noWarehouses', 'لا توجد مستودعات')}
              </p>
              <Button asChild size="sm" variant="outline" className="rounded-xl">
                <Link to="/dashboard/inventory/warehouses/create">
                  <Plus className="w-4 h-4 ml-1" />
                  {t('inventory.addWarehouse', 'إضافة مستودع')}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {warehouses.slice(0, 4).map((warehouse) => (
                <Link
                  key={warehouse._id}
                  to={`/dashboard/inventory/warehouses/${warehouse._id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      {warehouse.nameAr || warehouse.name}
                    </span>
                  </div>
                  {warehouse.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      {t('inventory.default', 'افتراضي')}
                    </Badge>
                  )}
                </Link>
              ))}
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link to="/dashboard/inventory/warehouses">
                  {t('inventory.manageWarehouses', 'إدارة المستودعات')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Value Summary */}
      {stats && (
        <Card className="rounded-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              {t('inventory.stockValue', 'قيمة المخزون')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy mb-4">
              {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(stats.totalStockValue || 0)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <div className="text-lg font-bold text-emerald-600">{stats.totalWarehouses || 0}</div>
                <div className="text-xs text-muted-foreground">{t('inventory.warehouses', 'مستودعات')}</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <div className="text-lg font-bold text-blue-600">{stats.totalItems || 0}</div>
                <div className="text-xs text-muted-foreground">{t('inventory.items', 'أصناف')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

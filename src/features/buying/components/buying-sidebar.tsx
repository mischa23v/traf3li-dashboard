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
  Settings,
  TrendingUp,
  FolderOpen,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'

import { useBuyingStats } from '@/hooks/use-buying'

export function BuyingSidebar() {
  const { t } = useTranslation()
  const { data: stats } = useBuyingStats()

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
            <Link to={ROUTES.dashboard.buying.create}>
              <Plus className="w-4 h-4 ml-2" />
              {t('buying.newSupplier', 'مورد جديد')}
              <kbd className="mr-auto bg-muted px-2 py-0.5 rounded text-xs">⌘N</kbd>
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
            <Link to={ROUTES.dashboard.buying.list}>
              <Users className="w-4 h-4 ml-2" />
              {t('buying.suppliers', 'الموردين')}
            </Link>
          </Button>
          <Separator className="my-2" />
          <Button asChild variant="ghost" className="w-full justify-start rounded-xl">
            <Link to={ROUTES.dashboard.buying.settings}>
              <Settings className="w-4 h-4 ml-2" />
              {t('buying.settings', 'الإعدادات')}
            </Link>
          </Button>
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

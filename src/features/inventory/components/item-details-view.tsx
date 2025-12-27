/**
 * Item Details View
 * Detailed view for a single inventory item
 */

import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Edit,
  Trash2,
  ArrowRight,
  Warehouse,
  BarChart3,
  History,
  Tag,
  DollarSign,
  Box,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import { useItem, useItemStock, useDeleteItem, useStockLedger } from '@/hooks/use-inventory'
import type { ItemStatus, ItemType } from '@/types/inventory'
import { InventorySidebar } from './inventory-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.inventory', href: ROUTES.dashboard.inventory.list },
]

export function ItemDetailsView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { itemId } = useParams({ from: '/_authenticated/dashboard/inventory/$itemId' })

  const { data: item, isLoading, error } = useItem(itemId)
  const { data: stockData } = useItemStock(itemId)
  const { data: ledgerData } = useStockLedger({ itemId, limit: 10 })
  const deleteItemMutation = useDeleteItem()

  const handleDelete = async () => {
    await deleteItemMutation.mutateAsync(itemId)
    navigate({ to: ROUTES.dashboard.inventory.list })
  }

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-emerald-500"><CheckCircle2 className="w-3 h-3 ml-1" />{t('inventory.status.active', 'نشط')}</Badge>
      case 'inactive':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 ml-1" />{t('inventory.status.inactive', 'غير نشط')}</Badge>
      case 'discontinued':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 ml-1" />{t('inventory.status.discontinued', 'متوقف')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: ItemType) => {
    switch (type) {
      case 'product':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">{t('inventory.type.product', 'منتج')}</Badge>
      case 'service':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">{t('inventory.type.service', 'خدمة')}</Badge>
      case 'consumable':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">{t('inventory.type.consumable', 'مستهلك')}</Badge>
      case 'fixed_asset':
        return <Badge variant="outline" className="border-green-500 text-green-500">{t('inventory.type.fixedAsset', 'أصل ثابت')}</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
  }

  // Calculate total stock
  const totalStock = stockData?.reduce((sum, bin) => sum + bin.actualQty, 0) || 0
  const totalValue = stockData?.reduce((sum, bin) => sum + bin.stockValue, 0) || 0

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </Main>
      </>
    )
  }

  if (error || !item) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <Card className="rounded-3xl">
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('inventory.itemNotFound', 'الصنف غير موجود')}</h3>
              <Button onClick={() => navigate({ to: ROUTES.dashboard.inventory.list })} className="rounded-xl">
                <ArrowRight className="w-4 h-4 ml-2" />
                {t('inventory.backToList', 'العودة للقائمة')}
              </Button>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('inventory.badge', 'إدارة المخزون')}
          title={item.nameAr || item.name}
          type="inventory"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Item Image */}
                  <div className="flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-32 h-32 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-muted flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-muted-foreground">{item.itemCode}</span>
                      {getTypeBadge(item.itemType)}
                      {getStatusBadge(item.status)}
                    </div>
                    <h1 className="text-2xl font-bold">{item.nameAr || item.name}</h1>
                    {item.nameAr && item.name && (
                      <p className="text-muted-foreground">{item.name}</p>
                    )}
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <div className="flex items-center gap-4 pt-2">
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(item.standardRate, item.currency)}
                      </div>
                      {item.taxRate && (
                        <Badge variant="outline">
                          {t('inventory.vat', 'ضريبة')} {item.taxRate}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => navigate({ to: `/dashboard/inventory/${itemId}/edit` })}
                      className="rounded-xl"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      {t('common.edit', 'تعديل')}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="rounded-xl">
                          <Trash2 className="w-4 h-4 ml-2" />
                          {t('common.delete', 'حذف')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('inventory.deleteConfirmTitle', 'حذف الصنف')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('inventory.deleteConfirmDesc', 'هل أنت متأكد من حذف هذا الصنف؟ لا يمكن التراجع عن هذا الإجراء.')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            {t('common.delete', 'حذف')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <Box className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{totalStock}</div>
                  <div className="text-sm text-muted-foreground">{t('inventory.totalStock', 'إجمالي المخزون')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                  <div className="text-2xl font-bold">{formatCurrency(totalValue, item.currency)}</div>
                  <div className="text-sm text-muted-foreground">{t('inventory.stockValue', 'قيمة المخزون')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <Warehouse className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{stockData?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">{t('inventory.warehouses', 'مستودعات')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <Tag className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                  <div className="text-2xl font-bold">{item.stockUom}</div>
                  <div className="text-sm text-muted-foreground">{t('inventory.uom', 'وحدة القياس')}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <Tabs defaultValue="stock" className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="grid w-full grid-cols-3 rounded-xl">
                    <TabsTrigger value="stock" className="rounded-lg">
                      <Warehouse className="w-4 h-4 ml-2" />
                      {t('inventory.stockBalance', 'رصيد المخزون')}
                    </TabsTrigger>
                    <TabsTrigger value="ledger" className="rounded-lg">
                      <History className="w-4 h-4 ml-2" />
                      {t('inventory.stockLedger', 'سجل المخزون')}
                    </TabsTrigger>
                    <TabsTrigger value="details" className="rounded-lg">
                      <BarChart3 className="w-4 h-4 ml-2" />
                      {t('inventory.details', 'التفاصيل')}
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Stock Balance Tab */}
                  <TabsContent value="stock" className="mt-0">
                    {!stockData || stockData.length === 0 ? (
                      <div className="text-center py-8">
                        <Warehouse className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t('inventory.noStockData', 'لا توجد بيانات مخزون')}</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">{t('inventory.warehouse', 'المستودع')}</TableHead>
                            <TableHead className="text-right">{t('inventory.actualQty', 'الكمية الفعلية')}</TableHead>
                            <TableHead className="text-right">{t('inventory.valuationRate', 'سعر التقييم')}</TableHead>
                            <TableHead className="text-right">{t('inventory.stockValue', 'القيمة')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockData.map((bin) => (
                            <TableRow key={bin._id}>
                              <TableCell className="font-medium">{bin.warehouseName || bin.warehouseId}</TableCell>
                              <TableCell>{bin.actualQty} {item.stockUom}</TableCell>
                              <TableCell>{formatCurrency(bin.valuationRate, item.currency)}</TableCell>
                              <TableCell className="font-mono">{formatCurrency(bin.stockValue, item.currency)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  {/* Stock Ledger Tab */}
                  <TabsContent value="ledger" className="mt-0">
                    {!ledgerData?.entries || ledgerData.entries.length === 0 ? (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t('inventory.noLedgerData', 'لا توجد حركات')}</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">{t('inventory.date', 'التاريخ')}</TableHead>
                            <TableHead className="text-right">{t('inventory.warehouse', 'المستودع')}</TableHead>
                            <TableHead className="text-right">{t('inventory.qty', 'الكمية')}</TableHead>
                            <TableHead className="text-right">{t('inventory.balance', 'الرصيد')}</TableHead>
                            <TableHead className="text-right">{t('inventory.reference', 'المرجع')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ledgerData.entries.map((entry) => (
                            <TableRow key={entry._id}>
                              <TableCell className="text-sm">{formatDate(entry.postingDate)}</TableCell>
                              <TableCell>{entry.warehouseName || entry.warehouseId}</TableCell>
                              <TableCell>
                                <span className={entry.actualQty > 0 ? 'text-emerald-600' : 'text-red-600'}>
                                  {entry.actualQty > 0 ? '+' : ''}{entry.actualQty}
                                </span>
                              </TableCell>
                              <TableCell>{entry.qtyAfterTransaction}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{entry.voucherNo || entry.voucherId}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  {/* Details Tab */}
                  <TabsContent value="details" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">{t('inventory.stockSettings', 'إعدادات المخزون')}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">{t('inventory.isStockItem', 'صنف مخزني')}</span>
                            <span>{item.isStockItem ? t('common.yes', 'نعم') : t('common.no', 'لا')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">{t('inventory.hasBatchNo', 'رقم الدفعة')}</span>
                            <span>{item.hasBatchNo ? t('common.yes', 'نعم') : t('common.no', 'لا')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">{t('inventory.hasSerialNo', 'رقم تسلسلي')}</span>
                            <span>{item.hasSerialNo ? t('common.yes', 'نعم') : t('common.no', 'لا')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">{t('inventory.valuationMethod', 'طريقة التقييم')}</span>
                            <span>{item.valuationMethod?.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-medium">{t('inventory.reorderSettings', 'إعدادات إعادة الطلب')}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">{t('inventory.safetyStock', 'مخزون الأمان')}</span>
                            <span>{item.safetyStock || 0}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">{t('inventory.reorderLevel', 'حد إعادة الطلب')}</span>
                            <span>{item.reorderLevel || 0}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">{t('inventory.reorderQty', 'كمية إعادة الطلب')}</span>
                            <span>{item.reorderQty || 0}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">{t('inventory.leadTimeDays', 'فترة التوريد')}</span>
                            <span>{item.leadTimeDays || 0} {t('common.days', 'يوم')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <InventorySidebar context="details" />
        </div>
      </Main>
    </>
  )
}

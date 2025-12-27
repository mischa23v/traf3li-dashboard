/**
 * Stock Entry Details View
 * Detailed view for a single stock entry
 */

import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ArrowRightLeft,
  Edit,
  Trash2,
  ArrowRight,
  Send,
  XCircle as CancelIcon,
  Package,
  Warehouse,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Box,
  Hash,
  Printer,
  BarChart3,
  History,
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

import {
  useStockEntry,
  useSubmitStockEntry,
  useCancelStockEntry,
  useDeleteStockEntry,
  useStockLedger,
} from '@/hooks/use-inventory'
import type { StockEntryType } from '@/types/inventory'
import { InventorySidebar } from './inventory-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.inventory', href: ROUTES.dashboard.inventory.list },
]

export function StockEntryDetailsView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { stockEntryId } = useParams({ from: '/_authenticated/dashboard/inventory/stock-entries/$stockEntryId' })

  const { data: stockEntry, isLoading, error } = useStockEntry(stockEntryId)
  const { data: ledgerData } = useStockLedger({ page: 1, limit: 100 })
  const submitMutation = useSubmitStockEntry()
  const cancelMutation = useCancelStockEntry()
  const deleteMutation = useDeleteStockEntry()

  // Filter ledger entries for this stock entry
  const entryLedgerData = ledgerData?.entries?.filter(
    (entry) => entry.voucherId === stockEntryId || entry.voucherNo === stockEntry?.stockEntryId
  ) || []

  const handleSubmit = async () => {
    await submitMutation.mutateAsync(stockEntryId)
  }

  const handleCancel = async () => {
    await cancelMutation.mutateAsync(stockEntryId)
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(stockEntryId)
    navigate({ to: ROUTES.dashboard.inventory.stockEntries.list })
  }

  const handlePrint = () => {
    // TODO: Implement print functionality
    window.print()
  }

  const getStatusBadge = (status: 'draft' | 'submitted' | 'cancelled') => {
    switch (status) {
      case 'submitted':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('inventory.status.submitted', 'مُرحل')}
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 ml-1" />
            {t('inventory.status.draft', 'مسودة')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 ml-1" />
            {t('inventory.status.cancelled', 'ملغي')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getEntryTypeBadge = (type: StockEntryType) => {
    const typeConfig = {
      receipt: { color: 'border-emerald-500 text-emerald-500', label: t('inventory.entryType.receipt', 'استلام') },
      issue: { color: 'border-red-500 text-red-500', label: t('inventory.entryType.issue', 'صرف') },
      transfer: { color: 'border-blue-500 text-blue-500', label: t('inventory.entryType.transfer', 'نقل') },
      manufacture: { color: 'border-purple-500 text-purple-500', label: t('inventory.entryType.manufacture', 'تصنيع') },
      repack: { color: 'border-orange-500 text-orange-500', label: t('inventory.entryType.repack', 'إعادة تعبئة') },
      material_consumption: { color: 'border-amber-500 text-amber-500', label: t('inventory.entryType.materialConsumption', 'استهلاك مواد') },
    }

    const config = typeConfig[type] || { color: 'border-gray-500 text-gray-500', label: type }
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
  }

  const formatDateOnly = (date: string) => {
    return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(date))
  }

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

  if (error || !stockEntry) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
          <Card className="rounded-3xl">
            <CardContent className="p-12 text-center">
              <ArrowRightLeft className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('inventory.stockEntryNotFound', 'حركة المخزون غير موجودة')}</h3>
              <Button onClick={() => navigate({ to: ROUTES.dashboard.inventory.stockEntries.list })} className="rounded-xl">
                <ArrowRight className="w-4 h-4 ml-2" />
                {t('inventory.backToList', 'العودة للقائمة')}
              </Button>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  const isDraft = stockEntry.status === 'draft'
  const isSubmitted = stockEntry.status === 'submitted'
  const isCancelled = stockEntry.status === 'cancelled'

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('inventory.badge', 'إدارة المخزون')}
          title={`${t('inventory.stockEntry', 'حركة مخزون')} ${stockEntry.stockEntryId}`}
          type="inventory"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Entry Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <ArrowRightLeft className="w-16 h-16 text-white" />
                    </div>
                  </div>

                  {/* Entry Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-muted-foreground">{stockEntry.stockEntryId}</span>
                      {getEntryTypeBadge(stockEntry.entryType)}
                      {getStatusBadge(stockEntry.status)}
                    </div>
                    <h1 className="text-2xl font-bold">
                      {t(`inventory.entryType.${stockEntry.entryType}`, stockEntry.entryType)}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateOnly(stockEntry.postingDate)}</span>
                      </div>
                      {stockEntry.postingTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{stockEntry.postingTime}</span>
                        </div>
                      )}
                    </div>
                    {stockEntry.remarks && (
                      <p className="text-sm text-muted-foreground">{stockEntry.remarks}</p>
                    )}
                    <div className="flex items-center gap-4 pt-2">
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(stockEntry.totalAmount)}
                      </div>
                      <Badge variant="outline">
                        <Box className="w-3 h-3 ml-1" />
                        {stockEntry.totalQty} {t('inventory.items', 'أصناف')}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {isDraft && (
                      <>
                        <Button onClick={handleSubmit} className="rounded-xl" disabled={submitMutation.isPending}>
                          <Send className="w-4 h-4 ml-2" />
                          {t('inventory.submit', 'ترحيل')}
                        </Button>
                        <Button
                          onClick={() => navigate({ to: `${ROUTES.dashboard.inventory.stockEntries.detail(stockEntryId)}/edit` })}
                          variant="outline"
                          className="rounded-xl"
                        >
                          <Edit className="w-4 h-4 ml-2" />
                          {t('common.edit', 'تعديل')}
                        </Button>
                      </>
                    )}
                    {isSubmitted && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="rounded-xl">
                            <CancelIcon className="w-4 h-4 ml-2" />
                            {t('inventory.cancel', 'إلغاء')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('inventory.cancelConfirmTitle', 'إلغاء حركة المخزون')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('inventory.cancelConfirmDesc', 'هل أنت متأكد من إلغاء هذه الحركة؟ سيتم عكس جميع التأثيرات على المخزون.')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                              {t('inventory.cancel', 'إلغاء')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <Button onClick={handlePrint} variant="outline" className="rounded-xl">
                      <Printer className="w-4 h-4 ml-2" />
                      {t('common.print', 'طباعة')}
                    </Button>
                    {isDraft && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="rounded-xl">
                            <Trash2 className="w-4 h-4 ml-2" />
                            {t('common.delete', 'حذف')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('inventory.deleteConfirmTitle', 'حذف حركة المخزون')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('inventory.deleteConfirmDesc', 'هل أنت متأكد من حذف هذه الحركة؟ لا يمكن التراجع عن هذا الإجراء.')}
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
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <Box className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{stockEntry.items.length}</div>
                  <div className="text-sm text-muted-foreground">{t('inventory.items', 'أصناف')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <Hash className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{stockEntry.totalQty}</div>
                  <div className="text-sm text-muted-foreground">{t('inventory.totalQty', 'الكمية الإجمالية')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                  <div className="text-2xl font-bold">{formatCurrency(stockEntry.totalAmount)}</div>
                  <div className="text-sm text-muted-foreground">{t('inventory.totalValue', 'القيمة الإجمالية')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                  <div className="text-2xl font-bold">{entryLedgerData.length}</div>
                  <div className="text-sm text-muted-foreground">{t('inventory.ledgerEntries', 'قيود المخزون')}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <Tabs defaultValue="overview" className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="grid w-full grid-cols-3 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg">
                      <FileText className="w-4 h-4 ml-2" />
                      {t('inventory.overview', 'نظرة عامة')}
                    </TabsTrigger>
                    <TabsTrigger value="items" className="rounded-lg">
                      <Package className="w-4 h-4 ml-2" />
                      {t('inventory.items', 'الأصناف')}
                    </TabsTrigger>
                    <TabsTrigger value="ledger" className="rounded-lg">
                      <History className="w-4 h-4 ml-2" />
                      {t('inventory.ledgerImpact', 'التأثير على المخزون')}
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">{t('inventory.entryDetails', 'تفاصيل الحركة')}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">{t('inventory.entryType', 'نوع الحركة')}</span>
                            <span>{getEntryTypeBadge(stockEntry.entryType)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">{t('inventory.postingDate', 'تاريخ الترحيل')}</span>
                            <span>{formatDateOnly(stockEntry.postingDate)}</span>
                          </div>
                          {stockEntry.postingTime && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('inventory.postingTime', 'وقت الترحيل')}</span>
                              <span>{stockEntry.postingTime}</span>
                            </div>
                          )}
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">{t('inventory.status', 'الحالة')}</span>
                            <span>{getStatusBadge(stockEntry.status)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">{t('inventory.createdAt', 'تاريخ الإنشاء')}</span>
                            <span className="text-sm">{formatDate(stockEntry.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-medium">{t('inventory.warehouses', 'المستودعات')}</h3>
                        <div className="space-y-2">
                          {stockEntry.fromWarehouse && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('inventory.fromWarehouse', 'من مستودع')}</span>
                              <span className="flex items-center gap-2">
                                <Warehouse className="w-4 h-4" />
                                {stockEntry.fromWarehouse}
                              </span>
                            </div>
                          )}
                          {stockEntry.toWarehouse && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('inventory.toWarehouse', 'إلى مستودع')}</span>
                              <span className="flex items-center gap-2">
                                <Warehouse className="w-4 h-4" />
                                {stockEntry.toWarehouse}
                              </span>
                            </div>
                          )}
                          {stockEntry.referenceType && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('inventory.referenceType', 'نوع المرجع')}</span>
                              <span>{stockEntry.referenceType}</span>
                            </div>
                          )}
                          {stockEntry.referenceId && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">{t('inventory.referenceId', 'رقم المرجع')}</span>
                              <span className="font-mono text-sm">{stockEntry.referenceId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Items Tab */}
                  <TabsContent value="items" className="mt-0">
                    {!stockEntry.items || stockEntry.items.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t('inventory.noItems', 'لا توجد أصناف')}</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">{t('inventory.itemCode', 'رمز الصنف')}</TableHead>
                              <TableHead className="text-right">{t('inventory.itemName', 'اسم الصنف')}</TableHead>
                              <TableHead className="text-right">{t('inventory.qty', 'الكمية')}</TableHead>
                              <TableHead className="text-right">{t('inventory.uom', 'الوحدة')}</TableHead>
                              <TableHead className="text-right">{t('inventory.rate', 'السعر')}</TableHead>
                              <TableHead className="text-right">{t('inventory.amount', 'المبلغ')}</TableHead>
                              {stockEntry.entryType === 'transfer' && (
                                <>
                                  <TableHead className="text-right">{t('inventory.source', 'المصدر')}</TableHead>
                                  <TableHead className="text-right">{t('inventory.target', 'الوجهة')}</TableHead>
                                </>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stockEntry.items.map((item, index) => (
                              <TableRow key={item._id || index}>
                                <TableCell className="font-mono text-sm">{item.itemCode || item.itemId}</TableCell>
                                <TableCell className="font-medium">{item.itemName || item.itemId}</TableCell>
                                <TableCell>{item.qty}</TableCell>
                                <TableCell>{item.uom}</TableCell>
                                <TableCell>{formatCurrency(item.rate)}</TableCell>
                                <TableCell className="font-mono">{formatCurrency(item.amount)}</TableCell>
                                {stockEntry.entryType === 'transfer' && (
                                  <>
                                    <TableCell className="text-sm">{item.sourceWarehouse || '-'}</TableCell>
                                    <TableCell className="text-sm">{item.targetWarehouse || '-'}</TableCell>
                                  </>
                                )}
                              </TableRow>
                            ))}
                            <TableRow className="font-bold bg-muted/50">
                              <TableCell colSpan={2} className="text-right">{t('inventory.total', 'الإجمالي')}</TableCell>
                              <TableCell>{stockEntry.totalQty}</TableCell>
                              <TableCell colSpan={2}></TableCell>
                              <TableCell className="font-mono">{formatCurrency(stockEntry.totalAmount)}</TableCell>
                              {stockEntry.entryType === 'transfer' && (
                                <>
                                  <TableCell></TableCell>
                                  <TableCell></TableCell>
                                </>
                              )}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>

                  {/* Ledger Impact Tab */}
                  <TabsContent value="ledger" className="mt-0">
                    {!isSubmitted ? (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('inventory.ledgerNotAvailable', 'قيود المخزون متاحة فقط بعد الترحيل')}
                        </p>
                      </div>
                    ) : entryLedgerData.length === 0 ? (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t('inventory.noLedgerEntries', 'لا توجد قيود مخزون')}</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">{t('inventory.date', 'التاريخ')}</TableHead>
                              <TableHead className="text-right">{t('inventory.item', 'الصنف')}</TableHead>
                              <TableHead className="text-right">{t('inventory.warehouse', 'المستودع')}</TableHead>
                              <TableHead className="text-right">{t('inventory.qty', 'الكمية')}</TableHead>
                              <TableHead className="text-right">{t('inventory.balance', 'الرصيد')}</TableHead>
                              <TableHead className="text-right">{t('inventory.valuationRate', 'سعر التقييم')}</TableHead>
                              <TableHead className="text-right">{t('inventory.stockValue', 'القيمة')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {entryLedgerData.map((entry) => (
                              <TableRow key={entry._id}>
                                <TableCell className="text-sm">{formatDate(entry.postingDate)}</TableCell>
                                <TableCell className="font-mono text-sm">{entry.itemCode || entry.itemId}</TableCell>
                                <TableCell>{entry.warehouseName || entry.warehouseId}</TableCell>
                                <TableCell>
                                  <span className={entry.actualQty > 0 ? 'text-emerald-600' : 'text-red-600'}>
                                    {entry.actualQty > 0 ? '+' : ''}
                                    {entry.actualQty}
                                  </span>
                                </TableCell>
                                <TableCell>{entry.qtyAfterTransaction}</TableCell>
                                <TableCell>{formatCurrency(entry.valuationRate)}</TableCell>
                                <TableCell className="font-mono">{formatCurrency(entry.stockValue)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
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

/**
 * Warehouse Details View
 * Detailed view for a single warehouse
 */

import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Warehouse,
  Edit,
  Trash2,
  ArrowRight,
  Package,
  MapPin,
  Building2,
  Phone,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  History,
  TrendingUp,
  Boxes,
  AlertTriangle,
  DollarSign,
  BarChart3,
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
  useWarehouse,
  useWarehouseStock,
  useDeleteWarehouse,
  useStockEntries,
  useWarehouses,
} from '@/hooks/use-inventory'
import { InventorySidebar } from './inventory-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.inventory', href: ROUTES.dashboard.inventory.list },
]

export function WarehouseDetailsView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { warehouseId } = useParams({ from: '/_authenticated/dashboard/inventory/warehouses/$warehouseId' })

  const { data: warehouse, isLoading, error } = useWarehouse(warehouseId)
  const { data: stockData } = useWarehouseStock(warehouseId)
  const { data: stockEntriesData } = useStockEntries({
    fromWarehouse: warehouseId,
    limit: 10,
    sortBy: 'postingDate',
    sortOrder: 'desc',
  })
  const { data: warehousesData } = useWarehouses()
  const deleteWarehouseMutation = useDeleteWarehouse()

  const handleDelete = async () => {
    await deleteWarehouseMutation.mutateAsync(warehouseId)
    navigate({ to: ROUTES.dashboard.inventory.list })
  }

  const getStatusBadge = (disabled: boolean) => {
    if (disabled) {
      return (
        <Badge variant="secondary">
          <XCircle className="w-3 h-3 ml-1" />
          {t('inventory.status.inactive', 'غير نشط')}
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="bg-emerald-500">
        <CheckCircle2 className="w-3 h-3 ml-1" />
        {t('inventory.status.active', 'نشط')}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'warehouse':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            {t('inventory.warehouseType.warehouse', 'مستودع')}
          </Badge>
        )
      case 'store':
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500">
            {t('inventory.warehouseType.store', 'متجر')}
          </Badge>
        )
      case 'transit':
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            {t('inventory.warehouseType.transit', 'عبور')}
          </Badge>
        )
      case 'virtual':
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            {t('inventory.warehouseType.virtual', 'افتراضي')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getEntryTypeBadge = (type: string) => {
    switch (type) {
      case 'receipt':
        return (
          <Badge variant="outline" className="border-emerald-500 text-emerald-500">
            {t('inventory.entryType.receipt', 'استلام')}
          </Badge>
        )
      case 'issue':
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            {t('inventory.entryType.issue', 'صرف')}
          </Badge>
        )
      case 'transfer':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            {t('inventory.entryType.transfer', 'نقل')}
          </Badge>
        )
      case 'manufacture':
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500">
            {t('inventory.entryType.manufacture', 'تصنيع')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(date)
    )
  }

  // Calculate warehouse metrics
  const totalItems = stockData?.length || 0
  const totalStock = stockData?.reduce((sum, bin) => sum + bin.actualQty, 0) || 0
  const totalValue = stockData?.reduce((sum, bin) => sum + bin.stockValue, 0) || 0

  // Get child warehouses if this is a group
  const childWarehouses = warehousesData?.data?.filter(
    (wh) => wh.parentWarehouse === warehouseId
  ) || []

  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main
          fluid={true}
          className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl"
        >
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </Main>
      </>
    )
  }

  if (error || !warehouse) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} />
          <DynamicIsland />
        </Header>
        <Main
          fluid={true}
          className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl"
        >
          <Card className="rounded-3xl">
            <CardContent className="p-12 text-center">
              <Warehouse className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t('inventory.warehouseNotFound', 'المستودع غير موجود')}
              </h3>
              <Button
                onClick={() => navigate({ to: ROUTES.dashboard.inventory.list })}
                className="rounded-xl"
              >
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

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl"
      >
        <ProductivityHero
          badge={t('inventory.badge', 'إدارة المخزون')}
          title={warehouse.nameAr || warehouse.name}
          type="inventory"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Warehouse Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Warehouse className="w-16 h-16 text-white" />
                    </div>
                  </div>

                  {/* Warehouse Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-muted-foreground">
                        {warehouse.warehouseId}
                      </span>
                      {getTypeBadge(warehouse.warehouseType)}
                      {getStatusBadge(warehouse.disabled)}
                      {warehouse.isGroup && (
                        <Badge variant="outline" className="border-indigo-500 text-indigo-500">
                          <LayoutGrid className="w-3 h-3 ml-1" />
                          {t('inventory.groupWarehouse', 'مجموعة')}
                        </Badge>
                      )}
                      {warehouse.isDefault && (
                        <Badge variant="outline" className="border-amber-500 text-amber-500">
                          {t('inventory.default', 'افتراضي')}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold">{warehouse.nameAr || warehouse.name}</h1>
                    {warehouse.nameAr && warehouse.name && (
                      <p className="text-muted-foreground">{warehouse.name}</p>
                    )}
                    {warehouse.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {warehouse.address}
                          {warehouse.city && `, ${warehouse.city}`}
                          {warehouse.region && `, ${warehouse.region}`}
                          {warehouse.country && `, ${warehouse.country}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() =>
                        navigate({ to: `${ROUTES.dashboard.inventory.warehouses.detail(warehouseId)}/edit` })
                      }
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
                          <AlertDialogTitle>
                            {t('inventory.deleteWarehouseConfirmTitle', 'حذف المستودع')}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t(
                              'inventory.deleteWarehouseConfirmDesc',
                              'هل أنت متأكد من حذف هذا المستودع؟ لا يمكن التراجع عن هذا الإجراء.'
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel', 'إلغاء')}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {t('common.delete', 'حذف')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <Package className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{totalItems}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('inventory.itemsStored', 'أصناف مخزنة')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <Boxes className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                  <div className="text-2xl font-bold">{totalStock.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('inventory.totalQuantity', 'إجمالي الكمية')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('inventory.stockValue', 'قيمة المخزون')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <LayoutGrid className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                  <div className="text-2xl font-bold">{childWarehouses.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('inventory.childWarehouses', 'مستودعات فرعية')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <Tabs defaultValue="overview" className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="grid w-full grid-cols-4 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg">
                      <Building2 className="w-4 h-4 ml-2" />
                      {t('inventory.overview', 'نظرة عامة')}
                    </TabsTrigger>
                    <TabsTrigger value="stock" className="rounded-lg">
                      <Package className="w-4 h-4 ml-2" />
                      {t('inventory.stockSummary', 'ملخص المخزون')}
                    </TabsTrigger>
                    <TabsTrigger value="entries" className="rounded-lg">
                      <History className="w-4 h-4 ml-2" />
                      {t('inventory.stockEntries', 'حركات المخزون')}
                    </TabsTrigger>
                    <TabsTrigger value="children" className="rounded-lg">
                      <LayoutGrid className="w-4 h-4 ml-2" />
                      {t('inventory.childWarehouses', 'مستودعات فرعية')}
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Warehouse Information */}
                      <div className="space-y-4">
                        <h3 className="font-medium">
                          {t('inventory.warehouseInformation', 'معلومات المستودع')}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('inventory.warehouseId', 'رقم المستودع')}
                            </span>
                            <span className="font-mono text-sm">{warehouse.warehouseId}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('inventory.warehouseType', 'نوع المستودع')}
                            </span>
                            <span>{getTypeBadge(warehouse.warehouseType)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('inventory.isGroup', 'مجموعة')}
                            </span>
                            <span>
                              {warehouse.isGroup ? t('common.yes', 'نعم') : t('common.no', 'لا')}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {t('inventory.isDefault', 'افتراضي')}
                            </span>
                            <span>
                              {warehouse.isDefault ? t('common.yes', 'نعم') : t('common.no', 'لا')}
                            </span>
                          </div>
                          {warehouse.parentWarehouse && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">
                                {t('inventory.parentWarehouse', 'المستودع الرئيسي')}
                              </span>
                              <span>{warehouse.parentWarehouse}</span>
                            </div>
                          )}
                          {warehouse.company && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">
                                {t('inventory.company', 'الشركة')}
                              </span>
                              <span>{warehouse.company}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact & Location */}
                      <div className="space-y-4">
                        <h3 className="font-medium">
                          {t('inventory.contactLocation', 'الاتصال والموقع')}
                        </h3>
                        <div className="space-y-2">
                          {warehouse.contactPerson && (
                            <div className="flex items-center gap-2 py-2 border-b">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {t('inventory.contactPerson', 'جهة الاتصال')}:
                              </span>
                              <span>{warehouse.contactPerson}</span>
                            </div>
                          )}
                          {warehouse.phone && (
                            <div className="flex items-center gap-2 py-2 border-b">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {t('inventory.phone', 'الهاتف')}:
                              </span>
                              <span className="font-mono text-sm">{warehouse.phone}</span>
                            </div>
                          )}
                          {warehouse.email && (
                            <div className="flex items-center gap-2 py-2 border-b">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {t('inventory.email', 'البريد الإلكتروني')}:
                              </span>
                              <span className="text-sm">{warehouse.email}</span>
                            </div>
                          )}
                          {warehouse.address && (
                            <div className="flex items-start gap-2 py-2 border-b">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <span className="text-muted-foreground">
                                  {t('inventory.address', 'العنوان')}:
                                </span>
                                <p className="text-sm mt-1">{warehouse.address}</p>
                                {(warehouse.city || warehouse.region || warehouse.country) && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {[warehouse.city, warehouse.region, warehouse.country]
                                      .filter(Boolean)
                                      .join(', ')}
                                  </p>
                                )}
                                {warehouse.postalCode && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {t('inventory.postalCode', 'الرمز البريدي')}:{' '}
                                    {warehouse.postalCode}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          {warehouse.accountId && (
                            <div className="flex justify-between py-2 border-b">
                              <span className="text-muted-foreground">
                                {t('inventory.accountId', 'الحساب المحاسبي')}
                              </span>
                              <span className="font-mono text-sm">{warehouse.accountId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Stock Summary Tab */}
                  <TabsContent value="stock" className="mt-0">
                    {!stockData || stockData.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('inventory.noStockData', 'لا توجد بيانات مخزون')}
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">
                              {t('inventory.itemCode', 'رمز الصنف')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.itemName', 'اسم الصنف')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.actualQty', 'الكمية الفعلية')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.valuationRate', 'سعر التقييم')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.stockValue', 'القيمة')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockData.map((bin) => (
                            <TableRow
                              key={bin._id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() =>
                                navigate({ to: ROUTES.dashboard.inventory.detail(bin.itemId) })
                              }
                            >
                              <TableCell className="font-mono text-sm">
                                {bin.itemCode || bin.itemId}
                              </TableCell>
                              <TableCell className="font-medium">
                                {bin.itemCode || bin.itemId}
                              </TableCell>
                              <TableCell>
                                {bin.actualQty > 0 ? (
                                  <span className="text-emerald-600 font-medium">
                                    {bin.actualQty}
                                  </span>
                                ) : bin.actualQty < 0 ? (
                                  <span className="text-red-600 font-medium">{bin.actualQty}</span>
                                ) : (
                                  <span className="text-muted-foreground">{bin.actualQty}</span>
                                )}
                              </TableCell>
                              <TableCell>{formatCurrency(bin.valuationRate)}</TableCell>
                              <TableCell className="font-mono">
                                {formatCurrency(bin.stockValue)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  {/* Stock Entries Tab */}
                  <TabsContent value="entries" className="mt-0">
                    {!stockEntriesData?.data || stockEntriesData.data.length === 0 ? (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('inventory.noStockEntries', 'لا توجد حركات مخزون')}
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">
                              {t('inventory.entryId', 'رقم الحركة')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.date', 'التاريخ')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.entryType', 'النوع')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.items', 'الأصناف')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.totalQty', 'الكمية')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.totalAmount', 'المبلغ')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.status', 'الحالة')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockEntriesData.data.map((entry) => (
                            <TableRow
                              key={entry._id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() =>
                                navigate({
                                  to: ROUTES.dashboard.inventory.stockEntries.detail(entry._id),
                                })
                              }
                            >
                              <TableCell className="font-mono text-sm">
                                {entry.stockEntryId}
                              </TableCell>
                              <TableCell className="text-sm">
                                {formatDate(entry.postingDate)}
                              </TableCell>
                              <TableCell>{getEntryTypeBadge(entry.entryType)}</TableCell>
                              <TableCell>{entry.items?.length || 0}</TableCell>
                              <TableCell>{entry.totalQty}</TableCell>
                              <TableCell className="font-mono">
                                {formatCurrency(entry.totalAmount)}
                              </TableCell>
                              <TableCell>
                                {entry.status === 'submitted' ? (
                                  <Badge variant="default" className="bg-emerald-500">
                                    {t('inventory.status.submitted', 'مرحّل')}
                                  </Badge>
                                ) : entry.status === 'draft' ? (
                                  <Badge variant="secondary">
                                    {t('inventory.status.draft', 'مسودة')}
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    {t('inventory.status.cancelled', 'ملغي')}
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>

                  {/* Child Warehouses Tab */}
                  <TabsContent value="children" className="mt-0">
                    {!warehouse.isGroup ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                        <p className="text-muted-foreground">
                          {t(
                            'inventory.notGroupWarehouse',
                            'هذا المستودع ليس مجموعة ولا يحتوي على مستودعات فرعية'
                          )}
                        </p>
                      </div>
                    ) : childWarehouses.length === 0 ? (
                      <div className="text-center py-8">
                        <LayoutGrid className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {t('inventory.noChildWarehouses', 'لا توجد مستودعات فرعية')}
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">
                              {t('inventory.warehouseId', 'رقم المستودع')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.warehouseName', 'اسم المستودع')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.warehouseType', 'النوع')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.location', 'الموقع')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('inventory.status', 'الحالة')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {childWarehouses.map((child) => (
                            <TableRow
                              key={child._id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() =>
                                navigate({
                                  to: ROUTES.dashboard.inventory.warehouses.detail(child._id),
                                })
                              }
                            >
                              <TableCell className="font-mono text-sm">
                                {child.warehouseId}
                              </TableCell>
                              <TableCell className="font-medium">
                                {child.nameAr || child.name}
                              </TableCell>
                              <TableCell>{getTypeBadge(child.warehouseType)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {child.city && child.region
                                  ? `${child.city}, ${child.region}`
                                  : child.city || child.region || '-'}
                              </TableCell>
                              <TableCell>{getStatusBadge(child.disabled)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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

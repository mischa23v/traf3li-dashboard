/**
 * Purchase Order List View
 * Main purchase orders list page with tabs, filters, and actions
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ShoppingCart,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Package,
  Calendar,
  Filter,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { usePurchaseOrders, useBuyingStats } from '@/hooks/use-buying'
import type { PurchaseOrder, PurchaseOrderFilters, PurchaseOrderStatus } from '@/types/buying'
import { BuyingSidebar } from './buying-sidebar'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.buying', href: '/dashboard/buying' },
  { title: 'buying.purchaseOrders', href: '/dashboard/buying/purchase-orders' },
]

export function PurchaseOrderListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null)

  // Build filters
  const filters: PurchaseOrderFilters = useMemo(() => {
    const f: PurchaseOrderFilters = {}
    if (search) f.search = search
    if (statusFilter !== 'all') f.status = statusFilter
    if (dateFrom) f.dateFrom = dateFrom
    if (dateTo) f.dateTo = dateTo
    return f
  }, [search, statusFilter, dateFrom, dateTo])

  // Queries
  const { data: posData, isLoading, error } = usePurchaseOrders(filters)
  const { data: statsData } = useBuyingStats()

  const purchaseOrders = posData?.purchaseOrders || []
  const stats = statsData

  // Stats calculations
  const totalPOs = purchaseOrders.length
  const pendingPOs = purchaseOrders.filter(po => po.status === 'submitted').length
  const approvedPOs = purchaseOrders.filter(po => po.status === 'approved').length

  // Get current month's received POs
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const receivedThisMonth = purchaseOrders.filter(po => {
    if (po.status !== 'received') return false
    const poDate = new Date(po.orderDate)
    return poDate.getMonth() === currentMonth && poDate.getFullYear() === currentYear
  }).length

  // Handlers
  const handleDelete = async () => {
    if (!poToDelete) return
    // Delete mutation would go here
    setDeleteDialogOpen(false)
    setPoToDelete(null)
  }

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            <FileText className="w-3 h-3 ml-1" />
            {t('buying.po.status.draft', 'مسودة')}
          </Badge>
        )
      case 'submitted':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Clock className="w-3 h-3 ml-1" />
            {t('buying.po.status.pendingApproval', 'بانتظار الاعتماد')}
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('buying.po.status.approved', 'معتمد')}
          </Badge>
        )
      case 'received':
        return (
          <Badge variant="default" className="bg-purple-500">
            <Package className="w-3 h-3 ml-1" />
            {t('buying.po.status.received', 'مستلم')}
          </Badge>
        )
      case 'billed':
        return (
          <Badge variant="default" className="bg-indigo-500">
            <FileText className="w-3 h-3 ml-1" />
            {t('buying.po.status.billed', 'تم الفوترة')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 ml-1" />
            {t('buying.po.status.cancelled', 'ملغي')}
          </Badge>
        )
      case 'closed':
        return (
          <Badge variant="outline">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('buying.po.status.closed', 'مغلق')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('buying.badge', 'إدارة المشتريات')}
          title={t('buying.po.title', 'أوامر الشراء')}
          type="buying"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{totalPOs}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('buying.po.stats.totalPOs', 'إجمالي الأوامر')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{pendingPOs}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('buying.po.stats.pending', 'بانتظار الاعتماد')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{approvedPOs}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('buying.po.stats.approved', 'معتمد')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{receivedThisMonth}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('buying.po.stats.receivedThisMonth', 'مستلم هذا الشهر')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as PurchaseOrderStatus | 'all')}>
                  <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="all">{t('common.all', 'الكل')}</TabsTrigger>
                    <TabsTrigger value="draft">{t('buying.po.status.draft', 'مسودة')}</TabsTrigger>
                    <TabsTrigger value="submitted">{t('buying.po.status.pendingApproval', 'بانتظار الاعتماد')}</TabsTrigger>
                    <TabsTrigger value="approved">{t('buying.po.status.approved', 'معتمد')}</TabsTrigger>
                    <TabsTrigger value="received">{t('buying.po.status.received', 'مستلم')}</TabsTrigger>
                    <TabsTrigger value="billed">{t('buying.po.status.billed', 'مفوتر')}</TabsTrigger>
                    <TabsTrigger value="cancelled">{t('buying.po.status.cancelled', 'ملغي')}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Filters & Actions */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  {/* Search and Create Button Row */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('buying.po.searchPlaceholder', 'البحث برقم الأمر أو المورد...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10 rounded-xl"
                      />
                    </div>
                    <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                      <Link to="/dashboard/buying/purchase-orders/create">
                        <Plus className="w-4 h-4 ml-2" />
                        {t('buying.po.createPO', 'إنشاء أمر شراء')}
                      </Link>
                    </Button>
                  </div>

                  {/* Date Range Filters */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          placeholder={t('buying.po.dateFrom', 'من تاريخ')}
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="pr-10 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          placeholder={t('buying.po.dateTo', 'إلى تاريخ')}
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="pr-10 rounded-xl"
                        />
                      </div>
                    </div>
                    {(dateFrom || dateTo) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDateFrom('')
                          setDateTo('')
                        }}
                        className="rounded-xl"
                      >
                        {t('common.clearFilters', 'مسح الفلاتر')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Orders Table */}
            <Card className="rounded-3xl">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-6 text-center text-red-500">
                    {t('common.error', 'حدث خطأ في تحميل البيانات')}
                  </div>
                ) : purchaseOrders.length === 0 ? (
                  <div className="p-12 text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('buying.po.noPOs', 'لا توجد أوامر شراء')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('buying.po.noPOsDesc', 'ابدأ بإنشاء أمر شراء جديد')}
                    </p>
                    <Button asChild className="rounded-xl">
                      <Link to="/dashboard/buying/purchase-orders/create">
                        <Plus className="w-4 h-4 ml-2" />
                        {t('buying.po.createPO', 'إنشاء أمر شراء')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">{t('buying.po.poNumber', 'رقم الأمر')}</TableHead>
                          <TableHead className="text-right">{t('buying.po.supplier', 'المورد')}</TableHead>
                          <TableHead className="text-right">{t('buying.po.date', 'التاريخ')}</TableHead>
                          <TableHead className="text-right">{t('buying.po.deliveryDate', 'تاريخ التسليم')}</TableHead>
                          <TableHead className="text-right">{t('buying.po.total', 'المبلغ الإجمالي')}</TableHead>
                          <TableHead className="text-right">{t('buying.po.status', 'الحالة')}</TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchaseOrders.map((po) => (
                          <TableRow
                            key={po._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate({ to: `/dashboard/buying/purchase-orders/${po._id}` })}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <div className="font-medium font-mono">{po.poNumber}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {t('buying.po.items', 'الأصناف')}: {po.items.length}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{po.supplierName || po.supplierId}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{formatDate(po.orderDate)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {po.expectedDeliveryDate ? (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span>{formatDate(po.expectedDeliveryDate)}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold">{formatCurrency(po.grandTotal, po.currency)}</div>
                              {po.taxAmount && po.taxAmount > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {t('buying.po.tax', 'الضريبة')}: {formatCurrency(po.taxAmount, po.currency)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(po.status)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate({ to: `/dashboard/buying/purchase-orders/${po._id}` })
                                    }}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    {t('common.view', 'عرض')}
                                  </DropdownMenuItem>
                                  {po.status === 'draft' && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        navigate({ to: `/dashboard/buying/purchase-orders/${po._id}/edit` })
                                      }}
                                    >
                                      <Edit className="w-4 h-4 ml-2" />
                                      {t('common.edit', 'تعديل')}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  {po.status === 'draft' && (
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setPoToDelete(po)
                                        setDeleteDialogOpen(true)
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 ml-2" />
                                      {t('common.delete', 'حذف')}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <BuyingSidebar />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('buying.po.deleteConfirmTitle', 'حذف أمر الشراء')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'buying.po.deleteConfirmDesc',
                'هل أنت متأكد من حذف أمر الشراء هذا؟ لا يمكن التراجع عن هذا الإجراء.'
              )}
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
    </>
  )
}

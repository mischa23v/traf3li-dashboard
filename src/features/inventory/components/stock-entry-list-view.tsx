/**
 * Stock Entry List View
 * Main stock entries list page for Material Receipt, Material Issue, Stock Transfer, etc.
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Warehouse,
  ArrowUpDown,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  RefreshCw,
  Clock,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

import {
  useStockEntries,
  useDeleteStockEntry,
  useInventoryStats,
  useWarehouses,
} from '@/hooks/use-inventory'
import type { StockEntry, StockEntryFilters, StockEntryType } from '@/types/inventory'
import { InventorySidebar } from './inventory-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.inventory', href: ROUTES.dashboard.inventory.list },
]

export function StockEntryListView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // State
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<StockEntryType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'draft' | 'submitted' | 'cancelled' | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<StockEntry | null>(null)

  // Build filters
  const filters: StockEntryFilters = useMemo(() => {
    const f: StockEntryFilters = {}
    if (search) f.search = search
    if (typeFilter !== 'all') f.entryType = typeFilter
    if (statusFilter !== 'all') f.status = statusFilter
    if (dateFrom) f.dateFrom = dateFrom
    if (dateTo) f.dateTo = dateTo
    return f
  }, [search, typeFilter, statusFilter, dateFrom, dateTo])

  // Queries
  const { data: entriesData, isLoading, error } = useStockEntries(filters)
  const { data: statsData } = useInventoryStats()
  const { data: warehousesData } = useWarehouses()
  const deleteEntryMutation = useDeleteStockEntry()

  const entries = entriesData?.data || []
  const stats = statsData
  const warehouses = warehousesData?.data || []

  // Calculate custom stats for stock entries
  const entryStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]

    return {
      totalEntries: entries.length,
      todayEntries: entries.filter(e => e.postingDate.startsWith(today)).length,
      pendingEntries: entries.filter(e => e.status === 'draft').length,
      completedEntries: entries.filter(e => e.status === 'submitted').length,
    }
  }, [entries])

  // Handlers
  const handleDelete = async () => {
    if (!entryToDelete) return
    await deleteEntryMutation.mutateAsync(entryToDelete._id)
    setDeleteDialogOpen(false)
    setEntryToDelete(null)
  }

  // Get warehouse name by ID
  const getWarehouseName = (warehouseId?: string) => {
    if (!warehouseId) return '-'
    const warehouse = warehouses.find(w => w._id === warehouseId || w.warehouseId === warehouseId)
    return warehouse?.nameAr || warehouse?.name || warehouseId
  }

  // Status badge
  const getStatusBadge = (status: 'draft' | 'submitted' | 'cancelled') => {
    switch (status) {
      case 'submitted':
        return (
          <Badge variant="default" className="bg-emerald-500">
            <CheckCircle2 className="w-3 h-3 ml-1" />
            {t('inventory.stockEntry.status.submitted', 'مرحّل')}
          </Badge>
        )
      case 'draft':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3 ml-1" />
            {t('inventory.stockEntry.status.draft', 'مسودة')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 ml-1" />
            {t('inventory.stockEntry.status.cancelled', 'ملغى')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Type badge with icon
  const getTypeBadge = (type: StockEntryType) => {
    switch (type) {
      case 'receipt':
        return (
          <Badge variant="outline" className="border-emerald-500 text-emerald-700">
            <Download className="w-3 h-3 ml-1" />
            {t('inventory.stockEntry.type.receipt', 'استلام')}
          </Badge>
        )
      case 'issue':
        return (
          <Badge variant="outline" className="border-red-500 text-red-700">
            <Upload className="w-3 h-3 ml-1" />
            {t('inventory.stockEntry.type.issue', 'صرف')}
          </Badge>
        )
      case 'transfer':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            <RefreshCw className="w-3 h-3 ml-1" />
            {t('inventory.stockEntry.type.transfer', 'نقل')}
          </Badge>
        )
      case 'manufacture':
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-700">
            <TrendingUp className="w-3 h-3 ml-1" />
            {t('inventory.stockEntry.type.manufacture', 'تصنيع')}
          </Badge>
        )
      case 'repack':
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-700">
            <Package className="w-3 h-3 ml-1" />
            {t('inventory.stockEntry.type.repack', 'إعادة تعبئة')}
          </Badge>
        )
      case 'material_consumption':
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-700">
            <ArrowUpDown className="w-3 h-3 ml-1" />
            {t('inventory.stockEntry.type.consumption', 'استهلاك')}
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
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
          badge={t('inventory.stockEntry.badge', 'حركات المخزون')}
          title={t('inventory.stockEntry.title', 'قيود المخزون')}
          type="inventory"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-navy">{entryStats.totalEntries}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('inventory.stockEntry.stats.totalEntries', 'إجمالي القيود')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{entryStats.todayEntries}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('inventory.stockEntry.stats.todayEntries', 'قيود اليوم')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600">{entryStats.pendingEntries}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('inventory.stockEntry.stats.pending', 'قيد الانتظار')}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-emerald-600">{entryStats.completedEntries}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('inventory.stockEntry.stats.completed', 'مكتملة')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Entry Type Tabs */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as StockEntryType | 'all')}>
                  <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
                    <TabsTrigger value="all" className="rounded-xl">
                      {t('common.all', 'الكل')}
                    </TabsTrigger>
                    <TabsTrigger value="receipt" className="rounded-xl">
                      <Download className="w-4 h-4 ml-2" />
                      {t('inventory.stockEntry.type.receipt', 'استلام')}
                    </TabsTrigger>
                    <TabsTrigger value="issue" className="rounded-xl">
                      <Upload className="w-4 h-4 ml-2" />
                      {t('inventory.stockEntry.type.issue', 'صرف')}
                    </TabsTrigger>
                    <TabsTrigger value="transfer" className="rounded-xl">
                      <RefreshCw className="w-4 h-4 ml-2" />
                      {t('inventory.stockEntry.type.transfer', 'نقل')}
                    </TabsTrigger>
                    <TabsTrigger value="manufacture" className="rounded-xl">
                      <TrendingUp className="w-4 h-4 ml-2" />
                      {t('inventory.stockEntry.type.manufacture', 'تصنيع')}
                    </TabsTrigger>
                    <TabsTrigger value="repack" className="rounded-xl hidden md:flex">
                      <Package className="w-4 h-4 ml-2" />
                      {t('inventory.stockEntry.type.repack', 'تعبئة')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Filters & Actions */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  {/* Search & Status Filter Row */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t('inventory.stockEntry.searchPlaceholder', 'البحث برقم القيد...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10 rounded-xl"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                      <SelectTrigger className="w-full md:w-40 rounded-xl">
                        <SelectValue placeholder={t('inventory.filterByStatus', 'الحالة')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                        <SelectItem value="draft">
                          {t('inventory.stockEntry.status.draft', 'مسودة')}
                        </SelectItem>
                        <SelectItem value="submitted">
                          {t('inventory.stockEntry.status.submitted', 'مرحّل')}
                        </SelectItem>
                        <SelectItem value="cancelled">
                          {t('inventory.stockEntry.status.cancelled', 'ملغى')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                      <Link to={ROUTES.dashboard.inventory.stockEntries.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('inventory.stockEntry.addEntry', 'قيد جديد')}
                      </Link>
                    </Button>
                  </div>

                  {/* Date Range Filter Row */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        placeholder={t('inventory.stockEntry.dateFrom', 'من تاريخ')}
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="pr-10 rounded-xl"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        placeholder={t('inventory.stockEntry.dateTo', 'إلى تاريخ')}
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="pr-10 rounded-xl"
                      />
                    </div>
                    {(dateFrom || dateTo) && (
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          setDateFrom('')
                          setDateTo('')
                        }}
                      >
                        <XCircle className="w-4 h-4 ml-2" />
                        {t('common.clear', 'مسح')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Entries Table */}
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
                ) : entries.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('inventory.stockEntry.noEntries', 'لا توجد قيود مخزون')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('inventory.stockEntry.noEntriesDesc', 'ابدأ بإنشاء قيد مخزون جديد')}
                    </p>
                    <Button asChild className="rounded-xl">
                      <Link to={ROUTES.dashboard.inventory.stockEntries.create}>
                        <Plus className="w-4 h-4 ml-2" />
                        {t('inventory.stockEntry.addEntry', 'قيد جديد')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            {t('inventory.stockEntry.entryNumber', 'رقم القيد')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('inventory.stockEntry.type', 'النوع')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('inventory.stockEntry.date', 'التاريخ')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('inventory.stockEntry.fromWarehouse', 'من مستودع')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('inventory.stockEntry.toWarehouse', 'إلى مستودع')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('inventory.stockEntry.totalQty', 'إجمالي الكمية')}
                          </TableHead>
                          <TableHead className="text-right">
                            {t('inventory.stockEntry.status', 'الحالة')}
                          </TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.map((entry) => (
                          <TableRow
                            key={entry._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate({ to: ROUTES.dashboard.inventory.stockEntries.detail(entry._id) })}
                          >
                            <TableCell className="font-mono text-sm font-medium">
                              {entry.stockEntryId}
                            </TableCell>
                            <TableCell>{getTypeBadge(entry.entryType)}</TableCell>
                            <TableCell className="text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {formatDate(entry.postingDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {entry.fromWarehouse ? (
                                <div className="flex items-center gap-2">
                                  <Warehouse className="w-4 h-4 text-muted-foreground" />
                                  {getWarehouseName(entry.fromWarehouse)}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {entry.toWarehouse ? (
                                <div className="flex items-center gap-2">
                                  <Warehouse className="w-4 h-4 text-muted-foreground" />
                                  {getWarehouseName(entry.toWarehouse)}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="font-mono font-medium">
                              {entry.totalQty.toLocaleString('ar-SA', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </TableCell>
                            <TableCell>{getStatusBadge(entry.status)}</TableCell>
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
                                      navigate({ to: ROUTES.dashboard.inventory.stockEntries.detail(entry._id) })
                                    }}
                                  >
                                    <Eye className="w-4 h-4 ml-2" />
                                    {t('common.view', 'عرض')}
                                  </DropdownMenuItem>
                                  {entry.status === 'draft' && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          navigate({ to: `${ROUTES.dashboard.inventory.stockEntries.detail(entry._id)}/edit` })
                                        }}
                                      >
                                        <Edit className="w-4 h-4 ml-2" />
                                        {t('common.edit', 'تعديل')}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setEntryToDelete(entry)
                                          setDeleteDialogOpen(true)
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4 ml-2" />
                                        {t('common.delete', 'حذف')}
                                      </DropdownMenuItem>
                                    </>
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
          <InventorySidebar context="stock-entries" />
        </div>
      </Main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('inventory.stockEntry.deleteConfirmTitle', 'حذف قيد المخزون')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'inventory.stockEntry.deleteConfirmDesc',
                'هل أنت متأكد من حذف هذا القيد؟ لا يمكن التراجع عن هذا الإجراء.'
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

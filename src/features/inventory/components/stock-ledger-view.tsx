/**
 * Stock Ledger View
 * Comprehensive report showing all stock movements with detailed tracking
 * ERPNext-inspired Stock Ledger with Arabic-first bilingual support
 */

import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Warehouse,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileSpreadsheet,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  useStockLedger,
  useItems,
  useWarehouses,
} from '@/hooks/use-inventory'
import type { StockLedgerEntry } from '@/types/inventory'
import { InventorySidebar } from './inventory-sidebar'
import { ROUTES } from '@/constants/routes'

const topNav = [
  { title: 'sidebar.nav.overview', href: '/' },
  { title: 'sidebar.nav.inventory', href: ROUTES.dashboard.inventory.list },
]

// Voucher types for filtering
const VOUCHER_TYPES = [
  'Stock Entry',
  'Purchase Receipt',
  'Delivery Note',
  'Purchase Invoice',
  'Sales Invoice',
  'Material Issue',
  'Material Receipt',
  'Stock Reconciliation',
  'Manufacturing',
] as const

export function StockLedgerView() {
  const { t } = useTranslation()

  // State - Filters
  const [selectedItem, setSelectedItem] = useState<string>('all')
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  // State - Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Build filters for API
  const filters = useMemo(() => {
    const f: any = {
      page: currentPage,
      limit: pageSize,
    }
    if (selectedItem !== 'all') f.itemId = selectedItem
    if (selectedWarehouse !== 'all') f.warehouseId = selectedWarehouse
    if (dateFrom) f.dateFrom = dateFrom
    if (dateTo) f.dateTo = dateTo
    if (voucherTypeFilter !== 'all') f.voucherType = voucherTypeFilter
    return f
  }, [selectedItem, selectedWarehouse, dateFrom, dateTo, voucherTypeFilter, currentPage, pageSize])

  // Queries
  const { data: ledgerData, isLoading, error, refetch } = useStockLedger(filters)
  const { data: itemsData, isLoading: loadingItems } = useItems({ limit: 1000 })
  const { data: warehousesData, isLoading: loadingWarehouses } = useWarehouses()

  const ledgerEntries = ledgerData?.data || []
  const items = itemsData?.data || []
  const warehouses = warehousesData?.data || []
  const pagination = ledgerData?.pagination

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    let totalIn = 0
    let totalOut = 0
    let currentBalance = 0
    let currentValue = 0

    ledgerEntries.forEach((entry) => {
      if (entry.actualQty > 0) {
        totalIn += entry.actualQty
      } else {
        totalOut += Math.abs(entry.actualQty)
      }
      currentBalance = entry.qtyAfterTransaction
      currentValue = entry.stockValue
    })

    return {
      totalIn,
      totalOut,
      currentBalance,
      currentValue,
    }
  }, [ledgerEntries])

  // Handlers
  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Exporting to Excel...')
  }

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    const headers = [
      'Date',
      'Item Code',
      'Item Name',
      'Warehouse',
      'Voucher Type',
      'Voucher No',
      'Qty In',
      'Qty Out',
      'Balance Qty',
      'Valuation Rate',
      'Balance Value',
    ]

    const rows = ledgerEntries.map((entry) => [
      formatDate(entry.postingDate),
      entry.itemCode || '-',
      getItemName(entry.itemId),
      getWarehouseName(entry.warehouseId),
      entry.voucherType,
      entry.voucherNo || entry.voucherId,
      entry.actualQty > 0 ? entry.actualQty.toFixed(2) : '-',
      entry.actualQty < 0 ? Math.abs(entry.actualQty).toFixed(2) : '-',
      entry.qtyAfterTransaction.toFixed(2),
      formatNumber(entry.valuationRate),
      formatCurrency(entry.stockValue),
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `stock-ledger-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handlePrint = () => {
    window.print()
  }

  const handleClearFilters = () => {
    setSelectedItem('all')
    setSelectedWarehouse('all')
    setDateFrom('')
    setDateTo('')
    setVoucherTypeFilter('all')
    setSearch('')
    setCurrentPage(1)
  }

  // Helper functions
  const getItemName = (itemId: string) => {
    const item = items.find((i) => i._id === itemId || i.itemId === itemId)
    return item?.nameAr || item?.name || itemId
  }

  const getItemCode = (itemId: string) => {
    const item = items.find((i) => i._id === itemId || i.itemId === itemId)
    return item?.itemCode || '-'
  }

  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses.find((w) => w._id === warehouseId || w.warehouseId === warehouseId)
    return warehouse?.nameAr || warehouse?.name || warehouseId
  }

  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency }).format(amount)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getVoucherTypeBadge = (voucherType: string) => {
    const type = voucherType.toLowerCase()

    if (type.includes('receipt') || type.includes('purchase')) {
      return (
        <Badge variant="outline" className="border-emerald-500 text-emerald-700">
          <TrendingUp className="w-3 h-3 ml-1" />
          {voucherType}
        </Badge>
      )
    }

    if (type.includes('issue') || type.includes('delivery') || type.includes('sales')) {
      return (
        <Badge variant="outline" className="border-red-500 text-red-700">
          <TrendingDown className="w-3 h-3 ml-1" />
          {voucherType}
        </Badge>
      )
    }

    if (type.includes('transfer')) {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-700">
          <ArrowRightLeft className="w-3 h-3 ml-1" />
          {voucherType}
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="border-gray-500 text-gray-700">
        {voucherType}
      </Badge>
    )
  }

  // Filter active check
  const hasActiveFilters =
    selectedItem !== 'all' ||
    selectedWarehouse !== 'all' ||
    dateFrom ||
    dateTo ||
    voucherTypeFilter !== 'all' ||
    search

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} />
        <DynamicIsland />
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl">
        <ProductivityHero
          badge={t('inventory.stockLedger.badge', 'تقارير المخزون')}
          title={t('inventory.stockLedger.title', 'سجل حركات المخزون')}
          type="inventory"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-700">
                    {formatNumber(summaryStats.totalIn)}
                  </div>
                  <div className="text-sm text-emerald-600">
                    {t('inventory.stockLedger.totalIn', 'إجمالي الوارد')}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-700">
                    {formatNumber(summaryStats.totalOut)}
                  </div>
                  <div className="text-sm text-red-600">
                    {t('inventory.stockLedger.totalOut', 'إجمالي الصادر')}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {formatNumber(summaryStats.currentBalance)}
                  </div>
                  <div className="text-sm text-blue-600">
                    {t('inventory.stockLedger.currentBalance', 'الرصيد الحالي')}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-xl font-bold text-purple-700">
                    {formatCurrency(summaryStats.currentValue)}
                  </div>
                  <div className="text-sm text-purple-600">
                    {t('inventory.stockLedger.currentValue', 'القيمة الحالية')}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters Card */}
            <Card className="rounded-3xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="w-5 h-5 text-emerald-600" />
                    {t('inventory.stockLedger.filters', 'تصفية البيانات')}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 ml-2" />
                        {t('common.clearFilters', 'مسح الفلاتر')}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetch()}
                      className="rounded-xl"
                    >
                      <RefreshCw className="w-4 h-4 ml-2" />
                      {t('common.refresh', 'تحديث')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Row 1: Item and Warehouse */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      {t('inventory.stockLedger.selectItem', 'اختر الصنف')}
                    </label>
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={t('inventory.allItems', 'جميع الأصناف')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                        {items.map((item) => (
                          <SelectItem key={item._id} value={item._id}>
                            {item.itemCode} - {item.nameAr || item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Warehouse className="w-4 h-4" />
                      {t('inventory.stockLedger.selectWarehouse', 'اختر المستودع')}
                    </label>
                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={t('inventory.allWarehouses', 'جميع المستودعات')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse._id} value={warehouse._id}>
                            {warehouse.nameAr || warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t('inventory.stockLedger.dateFrom', 'من تاريخ')}
                    </label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t('inventory.stockLedger.dateTo', 'إلى تاريخ')}
                    </label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Row 3: Voucher Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t('inventory.stockLedger.voucherType', 'نوع المستند')}
                  </label>
                  <Select value={voucherTypeFilter} onValueChange={setVoucherTypeFilter}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder={t('inventory.allVoucherTypes', 'جميع أنواع المستندات')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                      {VOUCHER_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="rounded-3xl">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={handleExportExcel}
                    className="rounded-xl flex-1 md:flex-none"
                  >
                    <FileSpreadsheet className="w-4 h-4 ml-2 text-emerald-600" />
                    {t('inventory.stockLedger.exportExcel', 'تصدير إلى Excel')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportCSV}
                    className="rounded-xl flex-1 md:flex-none"
                  >
                    <Download className="w-4 h-4 ml-2 text-blue-600" />
                    {t('inventory.stockLedger.exportCSV', 'تصدير إلى CSV')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="rounded-xl flex-1 md:flex-none"
                  >
                    <Printer className="w-4 h-4 ml-2 text-purple-600" />
                    {t('inventory.stockLedger.print', 'طباعة')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stock Ledger Table */}
            <Card className="rounded-3xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowUpDown className="w-5 h-5 text-emerald-600" />
                    {t('inventory.stockLedger.movements', 'حركات المخزون')}
                  </CardTitle>
                  {pagination && (
                    <Badge variant="secondary" className="rounded-xl">
                      {t('inventory.stockLedger.totalEntries', 'إجمالي السجلات')}: {pagination.total}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-12 text-center">
                    <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-red-600">
                      {t('common.error', 'حدث خطأ')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('inventory.stockLedger.errorLoading', 'حدث خطأ في تحميل البيانات')}
                    </p>
                  </div>
                ) : ledgerEntries.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {t('inventory.stockLedger.noEntries', 'لا توجد حركات مخزون')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t(
                        'inventory.stockLedger.noEntriesDesc',
                        'لا توجد حركات مخزون مطابقة للفلاتر المحددة'
                      )}
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={handleClearFilters} className="rounded-xl">
                        <XCircle className="w-4 h-4 ml-2" />
                        {t('common.clearFilters', 'مسح الفلاتر')}
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-right font-semibold">
                              {t('inventory.stockLedger.date', 'التاريخ')}
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              {t('inventory.stockLedger.itemCode', 'رمز الصنف')}
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              {t('inventory.stockLedger.itemName', 'اسم الصنف')}
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              {t('inventory.stockLedger.warehouse', 'المستودع')}
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              {t('inventory.stockLedger.voucherType', 'نوع المستند')}
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              {t('inventory.stockLedger.voucherNo', 'رقم المستند')}
                            </TableHead>
                            <TableHead className="text-right font-semibold text-emerald-700">
                              {t('inventory.stockLedger.qtyIn', 'كمية وارد')}
                            </TableHead>
                            <TableHead className="text-right font-semibold text-red-700">
                              {t('inventory.stockLedger.qtyOut', 'كمية صادر')}
                            </TableHead>
                            <TableHead className="text-right font-semibold text-blue-700">
                              {t('inventory.stockLedger.balanceQty', 'الرصيد')}
                            </TableHead>
                            <TableHead className="text-right font-semibold">
                              {t('inventory.stockLedger.valuationRate', 'سعر التقييم')}
                            </TableHead>
                            <TableHead className="text-right font-semibold text-purple-700">
                              {t('inventory.stockLedger.balanceValue', 'قيمة الرصيد')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ledgerEntries.map((entry) => (
                            <TableRow key={entry._id} className="hover:bg-muted/30">
                              <TableCell className="text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  {formatDate(entry.postingDate)}
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm font-medium">
                                {entry.itemCode || getItemCode(entry.itemId)}
                              </TableCell>
                              <TableCell className="text-sm font-medium max-w-[200px] truncate">
                                {getItemName(entry.itemId)}
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="flex items-center gap-2">
                                  <Warehouse className="w-4 h-4 text-muted-foreground" />
                                  <span className="max-w-[150px] truncate">
                                    {getWarehouseName(entry.warehouseId)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{getVoucherTypeBadge(entry.voucherType)}</TableCell>
                              <TableCell className="font-mono text-sm">
                                {entry.voucherNo || entry.voucherId}
                              </TableCell>
                              <TableCell className="text-right">
                                {entry.actualQty > 0 ? (
                                  <span className="font-mono font-semibold text-emerald-700">
                                    {formatNumber(entry.actualQty)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {entry.actualQty < 0 ? (
                                  <span className="font-mono font-semibold text-red-700">
                                    {formatNumber(Math.abs(entry.actualQty))}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-mono font-bold text-blue-700">
                                  {formatNumber(entry.qtyAfterTransaction)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                {formatNumber(entry.valuationRate)}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-mono font-semibold text-purple-700">
                                  {formatCurrency(entry.stockValue)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                      <div className="p-4 border-t">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-muted-foreground">
                              {t('inventory.stockLedger.rowsPerPage', 'عدد الصفوف')}:
                            </label>
                            <Select
                              value={pageSize.toString()}
                              onValueChange={(v) => {
                                setPageSize(Number(v))
                                setCurrentPage(1)
                              }}
                            >
                              <SelectTrigger className="w-20 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="rounded-xl"
                            >
                              <ChevronRight className="w-4 h-4" />
                              {t('common.previous', 'السابق')}
                            </Button>

                            <div className="flex items-center gap-1">
                              <span className="text-sm text-muted-foreground">
                                {t('inventory.stockLedger.page', 'صفحة')} {currentPage} {t('common.of', 'من')}{' '}
                                {pagination.pages}
                              </span>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                              disabled={currentPage === pagination.pages}
                              className="rounded-xl"
                            >
                              {t('common.next', 'التالي')}
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {t('inventory.stockLedger.showing', 'عرض')} {(currentPage - 1) * pageSize + 1} -{' '}
                            {Math.min(currentPage * pageSize, pagination.total)} {t('common.of', 'من')}{' '}
                            {pagination.total}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <InventorySidebar context="details" />
        </div>
      </Main>
    </>
  )
}

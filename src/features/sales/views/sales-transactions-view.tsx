/**
 * Sales Transactions Dashboard View
 * Comprehensive transaction log for all sales activities
 * Shows orders, quotes, payments, commissions, and analytics
 */

'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

// UI Components
import { Card, CardContent } from '@/components/ui/card'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import {
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  MoreVertical,
  ShoppingCart,
  Receipt,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  Percent,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react'

// Types
interface SalesTransaction {
  _id: string
  type: 'order' | 'quote' | 'payment' | 'refund' | 'commission' | 'shipment' | 'return' | 'discount'
  reference_number: string
  entity_type: 'customer' | 'order' | 'invoice' | 'quote'
  entity_id: string
  entity_name: string
  description: string
  description_ar?: string
  amount?: number
  currency?: string
  status: 'pending' | 'completed' | 'cancelled' | 'processing' | 'failed'
  old_status?: string
  new_status?: string
  performed_by: {
    _id: string
    name: string
  }
  metadata?: Record<string, any>
  created_at: string
}

interface FilterState {
  period: string
  startDate: string
  endDate: string
  type: string
  status: string
  search: string
  page: number
  pageSize: number
}

// Constants
const QUICK_PERIODS = [
  { value: 'today', labelAr: 'اليوم', labelEn: 'Today' },
  { value: 'yesterday', labelAr: 'أمس', labelEn: 'Yesterday' },
  { value: 'this-week', labelAr: 'هذا الأسبوع', labelEn: 'This Week' },
  { value: 'last-week', labelAr: 'الأسبوع الماضي', labelEn: 'Last Week' },
  { value: 'this-month', labelAr: 'هذا الشهر', labelEn: 'This Month' },
  { value: 'last-month', labelAr: 'الشهر الماضي', labelEn: 'Last Month' },
  { value: 'this-quarter', labelAr: 'هذا الربع', labelEn: 'This Quarter' },
  { value: 'this-year', labelAr: 'هذا العام', labelEn: 'This Year' },
]

// ═══════════════════════════════════════════════════════════════
// SUMMARY CARDS COMPONENT
// ═══════════════════════════════════════════════════════════════

function SummaryCards({ isRTL }: { isRTL: boolean }) {
  const cards = [
    {
      title: isRTL ? 'إجمالي المبيعات' : 'Total Sales',
      value: '2.4M',
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: isRTL ? 'الطلبات الجديدة' : 'New Orders',
      value: '324',
      change: '+12%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: isRTL ? 'عروض الأسعار' : 'Quotes Sent',
      value: '89',
      change: '+5%',
      trend: 'up',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: isRTL ? 'المدفوعات' : 'Payments',
      value: '1.8M',
      change: '+22%',
      trend: 'up',
      icon: CreditCard,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: isRTL ? 'المرتجعات' : 'Returns',
      value: '12',
      change: '-8%',
      trend: 'down',
      icon: RotateCcw,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: isRTL ? 'العمولات' : 'Commissions',
      value: '85K',
      change: '+15%',
      trend: 'up',
      icon: Percent,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className={cn('p-2 rounded-lg', card.bgColor)}>
                <card.icon className={cn('w-4 h-4', card.color)} />
              </div>
              <div className={cn(
                'flex items-center text-xs font-medium',
                card.trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {card.trend === 'up' ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {card.change}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TRANSACTION TYPE TABS
// ═══════════════════════════════════════════════════════════════

const TRANSACTION_TYPES = [
  { value: 'all', labelAr: 'الكل', labelEn: 'All', icon: FileText },
  { value: 'order', labelAr: 'الطلبات', labelEn: 'Orders', icon: ShoppingCart },
  { value: 'quote', labelAr: 'عروض الأسعار', labelEn: 'Quotes', icon: FileText },
  { value: 'payment', labelAr: 'المدفوعات', labelEn: 'Payments', icon: CreditCard },
  { value: 'shipment', labelAr: 'الشحنات', labelEn: 'Shipments', icon: Truck },
  { value: 'return', labelAr: 'المرتجعات', labelEn: 'Returns', icon: RotateCcw },
  { value: 'refund', labelAr: 'الاستردادات', labelEn: 'Refunds', icon: DollarSign },
  { value: 'commission', labelAr: 'العمولات', labelEn: 'Commissions', icon: Percent },
]

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const MOCK_TRANSACTIONS: SalesTransaction[] = [
  {
    _id: '1',
    type: 'order',
    reference_number: 'SO-2024-001234',
    entity_type: 'customer',
    entity_id: 'cust-1',
    entity_name: 'شركة التقنية المتقدمة',
    description: 'New sales order created - 15 items',
    description_ar: 'تم إنشاء طلب بيع جديد - 15 منتج',
    amount: 45000,
    currency: 'SAR',
    status: 'completed',
    performed_by: { _id: 'user-1', name: 'سارة أحمد' },
    created_at: new Date().toISOString(),
  },
  {
    _id: '2',
    type: 'payment',
    reference_number: 'PAY-2024-005678',
    entity_type: 'invoice',
    entity_id: 'inv-1',
    entity_name: 'فاتورة #INV-2024-001',
    description: 'Payment received via bank transfer',
    description_ar: 'تم استلام الدفعة عبر تحويل بنكي',
    amount: 32500,
    currency: 'SAR',
    status: 'completed',
    performed_by: { _id: 'user-2', name: 'محمد خالد' },
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: '3',
    type: 'quote',
    reference_number: 'QT-2024-000789',
    entity_type: 'customer',
    entity_id: 'cust-2',
    entity_name: 'مؤسسة البناء الحديث',
    description: 'Quotation sent - awaiting response',
    description_ar: 'تم إرسال عرض السعر - بانتظار الرد',
    amount: 125000,
    currency: 'SAR',
    status: 'pending',
    performed_by: { _id: 'user-1', name: 'سارة أحمد' },
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: '4',
    type: 'shipment',
    reference_number: 'SHP-2024-000456',
    entity_type: 'order',
    entity_id: 'order-1',
    entity_name: 'طلب #SO-2024-001200',
    description: 'Order shipped via Aramex',
    description_ar: 'تم شحن الطلب عبر أرامكس',
    status: 'processing',
    metadata: { tracking: 'ARX12345678SA', carrier: 'Aramex' },
    performed_by: { _id: 'user-3', name: 'نورة العتيبي' },
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    _id: '5',
    type: 'return',
    reference_number: 'RET-2024-000123',
    entity_type: 'order',
    entity_id: 'order-2',
    entity_name: 'طلب #SO-2024-001150',
    description: 'Customer initiated return - damaged item',
    description_ar: 'طلب إرجاع من العميل - منتج تالف',
    amount: 2500,
    currency: 'SAR',
    status: 'processing',
    performed_by: { _id: 'user-2', name: 'محمد خالد' },
    created_at: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    _id: '6',
    type: 'commission',
    reference_number: 'COM-2024-000567',
    entity_type: 'order',
    entity_id: 'order-3',
    entity_name: 'طلب #SO-2024-001234',
    description: 'Sales commission calculated - 5%',
    description_ar: 'تم احتساب عمولة المبيعات - 5%',
    amount: 2250,
    currency: 'SAR',
    status: 'completed',
    performed_by: { _id: 'system', name: 'النظام' },
    created_at: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    _id: '7',
    type: 'refund',
    reference_number: 'REF-2024-000089',
    entity_type: 'invoice',
    entity_id: 'inv-2',
    entity_name: 'فاتورة #INV-2024-002',
    description: 'Partial refund processed',
    description_ar: 'تم معالجة استرداد جزئي',
    amount: 5000,
    currency: 'SAR',
    status: 'completed',
    performed_by: { _id: 'user-1', name: 'سارة أحمد' },
    created_at: new Date(Date.now() - 36000000).toISOString(),
  },
]

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function SalesTransactionsView() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const dateLocale = i18n.language === 'ar' ? ar : enUS

  // State
  const [filters, setFilters] = useState<FilterState>({
    period: 'this-month',
    startDate: '',
    endDate: '',
    type: 'all',
    status: 'all',
    search: '',
    page: 1,
    pageSize: 25,
  })

  const [isLoading, setIsLoading] = useState(false)

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let result = [...MOCK_TRANSACTIONS]

    // Filter by type
    if (filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type)
    }

    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status)
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.entity_name.toLowerCase().includes(query) ||
          t.reference_number.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      )
    }

    return result
  }, [filters])

  // Get transaction icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'order':
        return ShoppingCart
      case 'quote':
        return FileText
      case 'payment':
        return CreditCard
      case 'shipment':
        return Truck
      case 'return':
        return RotateCcw
      case 'refund':
        return DollarSign
      case 'commission':
        return Percent
      case 'discount':
        return Percent
      default:
        return Receipt
    }
  }

  // Get type badge color
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'order':
        return { color: 'bg-blue-100 text-blue-800', label: isRTL ? 'طلب' : 'Order' }
      case 'quote':
        return { color: 'bg-purple-100 text-purple-800', label: isRTL ? 'عرض سعر' : 'Quote' }
      case 'payment':
        return { color: 'bg-green-100 text-green-800', label: isRTL ? 'دفعة' : 'Payment' }
      case 'shipment':
        return { color: 'bg-amber-100 text-amber-800', label: isRTL ? 'شحنة' : 'Shipment' }
      case 'return':
        return { color: 'bg-orange-100 text-orange-800', label: isRTL ? 'مرتجع' : 'Return' }
      case 'refund':
        return { color: 'bg-red-100 text-red-800', label: isRTL ? 'استرداد' : 'Refund' }
      case 'commission':
        return { color: 'bg-emerald-100 text-emerald-800', label: isRTL ? 'عمولة' : 'Commission' }
      default:
        return { color: 'bg-gray-100 text-gray-800', label: type }
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: isRTL ? 'مكتمل' : 'Completed' }
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: isRTL ? 'معلق' : 'Pending' }
      case 'processing':
        return { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: isRTL ? 'قيد المعالجة' : 'Processing' }
      case 'cancelled':
        return { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: isRTL ? 'ملغي' : 'Cancelled' }
      case 'failed':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: isRTL ? 'فشل' : 'Failed' }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: status }
    }
  }

  // Format currency
  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return '-'
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: currency || 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Export handlers
  const handleExportExcel = () => {
    console.log('Export to Excel')
  }

  const handleExportPDF = () => {
    console.log('Export to PDF')
  }

  const handleExportCSV = () => {
    console.log('Export to CSV')
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {isRTL ? 'معاملات المبيعات' : 'Sales Transactions'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL
              ? 'سجل شامل لجميع معاملات ونشاطات المبيعات'
              : 'Complete log of all sales transactions and activities'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLoading(true)}
          >
            <RefreshCw className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'تصدير' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'تصدير Excel' : 'Export Excel'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'تصدير PDF' : 'Export PDF'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileText className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'تصدير CSV' : 'Export CSV'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards isRTL={isRTL} />

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Type Tabs */}
            <div className="flex flex-wrap gap-2">
              {TRANSACTION_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={filters.type === type.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, type: type.value })}
                  className="gap-2"
                >
                  <type.icon className="w-4 h-4" />
                  {isRTL ? type.labelAr : type.labelEn}
                </Button>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className={cn(
                  'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground',
                  isRTL ? 'right-3' : 'left-3'
                )} />
                <Input
                  placeholder={isRTL ? 'بحث...' : 'Search...'}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className={cn(isRTL ? 'pr-10' : 'pl-10')}
                />
              </div>

              <Select
                value={filters.period}
                onValueChange={(val) => setFilters({ ...filters, period: val })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUICK_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {isRTL ? period.labelAr : period.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(val) => setFilters({ ...filters, status: val })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="completed">{isRTL ? 'مكتمل' : 'Completed'}</SelectItem>
                  <SelectItem value="pending">{isRTL ? 'معلق' : 'Pending'}</SelectItem>
                  <SelectItem value="processing">{isRTL ? 'قيد المعالجة' : 'Processing'}</SelectItem>
                  <SelectItem value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isRTL ? 'text-right' : ''}>
                  {isRTL ? 'التاريخ' : 'Date'}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>
                  {isRTL ? 'المرجع' : 'Reference'}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>
                  {isRTL ? 'النوع' : 'Type'}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>
                  {isRTL ? 'العميل / الكيان' : 'Customer / Entity'}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>
                  {isRTL ? 'المبلغ' : 'Amount'}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>
                  {isRTL ? 'الحالة' : 'Status'}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>
                  {isRTL ? 'بواسطة' : 'By'}
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">
                      {isRTL ? 'لا توجد معاملات' : 'No transactions found'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  const Icon = getTransactionIcon(transaction.type)
                  const typeBadge = getTypeBadge(transaction.type)
                  const statusBadge = getStatusBadge(transaction.status)
                  const StatusIcon = statusBadge.icon

                  return (
                    <TableRow key={transaction._id} className="hover:bg-muted/50">
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm">
                          {format(new Date(transaction.created_at), 'dd MMM yyyy', { locale: dateLocale })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), 'HH:mm', { locale: dateLocale })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{transaction.reference_number}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('gap-1', typeBadge.color)}>
                          <Icon className="w-3 h-3" />
                          {typeBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.entity_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL && transaction.description_ar
                            ? transaction.description_ar
                            : transaction.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          'font-semibold',
                          transaction.type === 'refund' || transaction.type === 'return'
                            ? 'text-red-600'
                            : 'text-green-600'
                        )}>
                          {transaction.type === 'refund' || transaction.type === 'return' ? '-' : '+'}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('gap-1', statusBadge.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{transaction.performed_by.name}</span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                            <DropdownMenuItem>
                              <Eye className={cn('w-4 h-4', isRTL ? 'ml-2' : 'mr-2')} />
                              {isRTL ? 'عرض التفاصيل' : 'View Details'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              {isRTL
                ? `عرض ${filteredTransactions.length} من ${MOCK_TRANSACTIONS.length}`
                : `Showing ${filteredTransactions.length} of ${MOCK_TRANSACTIONS.length}`}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(filters.pageSize)}
                onValueChange={(val) => setFilters({ ...filters, pageSize: Number(val) })}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
                <span className="text-sm px-2">
                  {filters.page}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * CRM Transactions/Reports Dashboard View
 * Similar to Finance Transactions Dashboard
 * Shows CRM activity logs, pipeline movements, and analytics
 */

'use client'

import { useState, useMemo } from 'react'
import { useLanguage } from '@/hooks/use-language'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { DatePickerWithRange } from '@/components/ui/date-range-picker'

// Icons
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  MoreVertical,
  Phone,
  Mail,
  MessageSquare,
  Video,
  Calendar,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// Constants
import {
  CRM_REPORT_TYPES,
  QUICK_PERIODS,
  ACTIVITY_TYPES,
  LEAD_STATUSES,
} from '@/constants/crm-constants'

// Types
interface CrmTransaction {
  _id: string
  type: 'activity' | 'stage_change' | 'status_change' | 'lead_created' | 'lead_converted' | 'quote_sent' | 'won' | 'lost'
  activity_type?: string
  entity_type: 'lead' | 'contact' | 'client' | 'organization'
  entity_id: string
  entity_name: string
  description: string
  description_ar?: string
  old_value?: string
  new_value?: string
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
  entity_type: string
  search: string
  page: number
  pageSize: number
}

// ═══════════════════════════════════════════════════════════════
// SUMMARY CARDS COMPONENT
// ═══════════════════════════════════════════════════════════════

function SummaryCards({ isRTL }: { isRTL: boolean }) {
  const cards = [
    {
      title: isRTL ? 'إجمالي الأنشطة' : 'Total Activities',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: isRTL ? 'العملاء الجدد' : 'New Leads',
      value: '156',
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: isRTL ? 'معدل التحويل' : 'Conversion Rate',
      value: '24.5%',
      change: '+3.2%',
      trend: 'up',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: isRTL ? 'متوسط وقت الاستجابة' : 'Avg Response Time',
      value: '2.4h',
      change: '-15%',
      trend: 'down',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: isRTL ? 'العملاء الخاملين' : 'Stale Leads',
      value: '23',
      change: '-5',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: isRTL ? 'الإيرادات المتوقعة' : 'Forecast Revenue',
      value: '850K',
      change: '+18%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
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
  { value: 'activity', labelAr: 'الأنشطة', labelEn: 'Activities', icon: CheckSquare },
  { value: 'stage_change', labelAr: 'تغيير المرحلة', labelEn: 'Stage Changes', icon: TrendingUp },
  { value: 'lead_created', labelAr: 'عميل جديد', labelEn: 'New Leads', icon: Users },
  { value: 'lead_converted', labelAr: 'تم التحويل', labelEn: 'Conversions', icon: Target },
  { value: 'won', labelAr: 'مكتسب', labelEn: 'Won', icon: TrendingUp },
  { value: 'lost', labelAr: 'خسارة', labelEn: 'Lost', icon: TrendingDown },
]

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const MOCK_TRANSACTIONS: CrmTransaction[] = [
  {
    _id: '1',
    type: 'activity',
    activity_type: 'call',
    entity_type: 'lead',
    entity_id: 'lead-1',
    entity_name: 'أحمد محمد العلي',
    description: 'Outbound call - discussed project requirements',
    description_ar: 'مكالمة صادرة - مناقشة متطلبات المشروع',
    performed_by: { _id: 'user-1', name: 'سارة أحمد' },
    created_at: new Date().toISOString(),
  },
  {
    _id: '2',
    type: 'stage_change',
    entity_type: 'lead',
    entity_id: 'lead-2',
    entity_name: 'شركة التقنية المتقدمة',
    description: 'Moved from Qualified to Proposal',
    description_ar: 'انتقل من مؤهل إلى عرض سعر',
    old_value: 'qualified',
    new_value: 'proposal',
    performed_by: { _id: 'user-2', name: 'محمد خالد' },
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: '3',
    type: 'lead_created',
    entity_type: 'lead',
    entity_id: 'lead-3',
    entity_name: 'فاطمة السعيد',
    description: 'New lead from website form',
    description_ar: 'عميل جديد من نموذج الموقع',
    performed_by: { _id: 'system', name: 'النظام' },
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: '4',
    type: 'won',
    entity_type: 'lead',
    entity_id: 'lead-4',
    entity_name: 'مؤسسة البناء الحديث',
    description: 'Deal closed - Contract signed',
    description_ar: 'تم إغلاق الصفقة - تم توقيع العقد',
    metadata: { value: 150000, currency: 'SAR' },
    performed_by: { _id: 'user-1', name: 'سارة أحمد' },
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    _id: '5',
    type: 'activity',
    activity_type: 'email',
    entity_type: 'lead',
    entity_id: 'lead-5',
    entity_name: 'عبدالله الفهد',
    description: 'Sent proposal document',
    description_ar: 'تم إرسال مستند العرض',
    performed_by: { _id: 'user-3', name: 'نورة العتيبي' },
    created_at: new Date(Date.now() - 21600000).toISOString(),
  },
]

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CrmTransactionsView() {
  const { isRTL, language } = useLanguage()
  const dateLocale = language === 'ar' ? ar : enUS

  // State
  const [filters, setFilters] = useState<FilterState>({
    period: 'this-month',
    startDate: '',
    endDate: '',
    type: 'all',
    entity_type: 'all',
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

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.entity_name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      )
    }

    return result
  }, [filters])

  // Get activity icon
  const getActivityIcon = (type: string, activityType?: string) => {
    if (activityType) {
      const config = ACTIVITY_TYPES.find((a) => a.value === activityType)
      if (config) return config.icon
    }

    switch (type) {
      case 'call':
        return Phone
      case 'email':
        return Mail
      case 'meeting':
        return Video
      case 'stage_change':
        return TrendingUp
      case 'lead_created':
        return Users
      case 'won':
        return TrendingUp
      case 'lost':
        return TrendingDown
      default:
        return CheckSquare
    }
  }

  // Get type badge color
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'activity':
        return { color: 'bg-blue-100 text-blue-800', label: isRTL ? 'نشاط' : 'Activity' }
      case 'stage_change':
        return { color: 'bg-purple-100 text-purple-800', label: isRTL ? 'تغيير مرحلة' : 'Stage Change' }
      case 'lead_created':
        return { color: 'bg-green-100 text-green-800', label: isRTL ? 'عميل جديد' : 'New Lead' }
      case 'lead_converted':
        return { color: 'bg-emerald-100 text-emerald-800', label: isRTL ? 'تحويل' : 'Conversion' }
      case 'won':
        return { color: 'bg-green-100 text-green-800', label: isRTL ? 'مكتسب' : 'Won' }
      case 'lost':
        return { color: 'bg-red-100 text-red-800', label: isRTL ? 'خسارة' : 'Lost' }
      default:
        return { color: 'bg-gray-100 text-gray-800', label: type }
    }
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
            {isRTL ? 'معاملات العملاء والتواصل' : 'CRM Transactions'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL
              ? 'سجل جميع الأنشطة والتغييرات في نظام إدارة العملاء'
              : 'Complete activity log and changes in your CRM system'}
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
                  {isRTL ? 'التاريخ والوقت' : 'Date & Time'}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>
                  {isRTL ? 'النوع' : 'Type'}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>
                  {isRTL ? 'العميل / جهة الاتصال' : 'Lead / Contact'}
                </TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>
                  {isRTL ? 'الوصف' : 'Description'}
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
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">
                      {isRTL ? 'لا توجد معاملات' : 'No transactions found'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  const Icon = getActivityIcon(transaction.type, transaction.activity_type)
                  const badge = getTypeBadge(transaction.type)

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
                        <Badge variant="secondary" className={cn('gap-1', badge.color)}>
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.entity_name}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {transaction.entity_type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm line-clamp-2">
                          {isRTL && transaction.description_ar
                            ? transaction.description_ar
                            : transaction.description}
                        </p>
                        {transaction.old_value && transaction.new_value && (
                          <div className="flex items-center gap-1 mt-1 text-xs">
                            <span className="text-muted-foreground">{transaction.old_value}</span>
                            <span>→</span>
                            <span className="font-medium">{transaction.new_value}</span>
                          </div>
                        )}
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

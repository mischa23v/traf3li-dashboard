/**
 * CRM Transactions View - Gold Standard Implementation
 * Matches planform.md design specifications
 * Shows CRM activity logs, pipeline movements, and analytics
 */

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { Main } from '@/components/layout/main'
import { ProductivityHero } from '@/components/productivity-hero'
import { CrmTransactionsSidebar } from '../components/crm-transactions-sidebar'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

// Hooks - Use real API data
import { useCrmTransactions, useCrmTransactionStats } from '@/hooks/useCrm'

// UI Components - Gosi Components (Gold Standard)
import {
  GosiCard,
  GosiInput,
  GosiSelect,
  GosiSelectContent,
  GosiSelectItem,
  GosiSelectTrigger,
  GosiSelectValue,
  GosiButton
} from '@/components/ui/gosi-ui'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  Video,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  ArrowUpRight,
  Eye,
  RefreshCw,
  X,
  Plus,
} from 'lucide-react'

// Constants
import {
  ACTIVITY_TYPES,
  QUICK_PERIODS,
} from '@/constants/crm-constants'

// Types from API
import type { CrmActivity, ActivityStats } from '@/types/crm'

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
// TRANSACTION CARD COMPONENT (Gold Standard)
// ═══════════════════════════════════════════════════════════════

interface TransactionCardProps {
  transaction: CrmActivity
  index: number
  isRTL: boolean
  dateLocale: Locale
  onClick: () => void
}

function TransactionCard({ transaction, index, isRTL, dateLocale, onClick }: TransactionCardProps) {
  // Get activity icon based on activity type
  const getActivityIcon = (type: string) => {
    const config = ACTIVITY_TYPES.find((a) => a.value === type)
    if (config) return config.icon

    switch (type) {
      case 'call':
        return Phone
      case 'email':
        return Mail
      case 'meeting':
        return Video
      case 'task':
        return CheckSquare
      case 'note':
        return FileText
      default:
        return CheckSquare
    }
  }

  // Get type badge config based on activity type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'call':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', label: isRTL ? 'مكالمة' : 'Call' }
      case 'email':
        return { color: 'bg-purple-100 text-purple-700 border-purple-200', label: isRTL ? 'بريد' : 'Email' }
      case 'meeting':
        return { color: 'bg-green-100 text-green-700 border-green-200', label: isRTL ? 'اجتماع' : 'Meeting' }
      case 'task':
        return { color: 'bg-amber-100 text-amber-700 border-amber-200', label: isRTL ? 'مهمة' : 'Task' }
      case 'note':
        return { color: 'bg-slate-100 text-slate-700 border-slate-200', label: isRTL ? 'ملاحظة' : 'Note' }
      default:
        return { color: 'bg-slate-100 text-slate-700 border-slate-200', label: type }
    }
  }

  // Get priority strip color based on activity type and status
  const getPriorityColor = (type: string, status?: string) => {
    if (status === 'completed') return 'bg-emerald-500'
    if (status === 'cancelled') return 'bg-red-500'

    switch (type) {
      case 'call':
        return 'bg-blue-500'
      case 'email':
        return 'bg-purple-500'
      case 'meeting':
        return 'bg-green-500'
      case 'task':
        return 'bg-amber-400'
      default:
        return 'bg-gray-300'
    }
  }

  // Get performer full name
  const performerName = transaction.performedBy
    ? `${transaction.performedBy.firstName} ${transaction.performedBy.lastName}`
    : isRTL ? 'النظام' : 'System'

  const Icon = getActivityIcon(transaction.type)
  const badge = getTypeBadge(transaction.type)

  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${index * 50}ms` }}
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards',
        'rounded-2xl p-3 md:p-4',
        'border-0 ring-1 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]',
        'transition-all duration-300 group',
        'hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-1',
        'cursor-pointer relative overflow-hidden',
        'bg-white ring-black/[0.03]'
      )}
    >
      {/* Priority Strip */}
      <div className={cn(
        'absolute start-0 top-0 bottom-0 w-1.5 rounded-s-2xl transition-all duration-300',
        getPriorityColor(transaction.type, transaction.status)
      )} />

      <div className="flex items-start gap-3 ps-4">
        {/* Icon Container */}
        <div className={cn(
          'w-10 h-10 rounded-xl border flex items-center justify-center shrink-0',
          'bg-slate-50 text-slate-500 border-slate-100',
          'group-hover:bg-emerald-50 group-hover:text-emerald-600'
        )}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm md:text-base text-slate-900 group-hover:text-emerald-900 truncate">
              {transaction.entityName || (isRTL ? 'بدون اسم' : 'No Name')}
            </span>
            <Badge
              variant="secondary"
              className={cn('px-2 py-0.5 text-[10px] font-bold rounded-full border', badge.color)}
            >
              <Icon className="w-3 h-3 me-1" />
              {badge.label}
            </Badge>
            {/* Status Badge */}
            {transaction.status === 'completed' && (
              <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 border-emerald-200">
                {isRTL ? 'مكتمل' : 'Completed'}
              </Badge>
            )}
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-slate-800 mt-1">
            {isRTL && transaction.titleAr ? transaction.titleAr : transaction.title}
          </p>

          {/* Description (if available) */}
          {transaction.description && (
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {transaction.description}
            </p>
          )}

          {/* Meta Row */}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="text-slate-400">@</span>
            <span>{performerName}</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(transaction.createdAt), 'dd MMM yyyy, HH:mm', { locale: dateLocale })}
            </span>
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <GosiButton variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-100">
              <MoreVertical className="w-4 h-4 text-slate-400 hover:text-navy" />
            </GosiButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48 rounded-xl shadow-xl border-0 ring-1 ring-black/5">
            <DropdownMenuItem className="py-2.5 rounded-lg cursor-pointer">
              <Eye className={cn('w-4 h-4', isRTL ? 'ms-2' : 'me-2')} />
              {isRTL ? 'عرض التفاصيل' : 'View Details'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LOADING SKELETON (Gold Standard)
// ═══════════════════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE (Gold Standard)
// ═══════════════════════════════════════════════════════════════

function EmptyState({ isRTL }: { isRTL: boolean }) {
  return (
    <div className="rounded-[2rem] p-12 text-center bg-white border border-slate-100">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
        <FileText className="w-8 h-8 text-emerald-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {isRTL ? 'لا توجد معاملات' : 'No Transactions'}
      </h3>
      <p className="text-slate-500 mb-4">
        {isRTL
          ? 'لم يتم العثور على أي معاملات تطابق معايير البحث'
          : 'No transactions found matching your search criteria'}
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CrmTransactionsView() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  const dateLocale = i18n.language === 'ar' ? ar : enUS

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

  const [showFilters, setShowFilters] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)

  // Selection mode state for bulk operations (Gold Standard)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Build API query params from filters
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page: filters.page,
      limit: filters.pageSize,
    }
    if (filters.type !== 'all') params.type = filters.type
    if (filters.entity_type !== 'all') params.entityType = filters.entity_type
    if (filters.search) params.search = filters.search
    // Period handling would need date conversion - keeping simple for now
    return params
  }, [filters])

  // Fetch real data from API
  const {
    data: transactionsData,
    isLoading,
    refetch,
  } = useCrmTransactions(queryParams)

  // Fetch stats for hero section
  const { data: statsData } = useCrmTransactionStats()

  // Get transactions from API response
  const transactions = transactionsData?.data || []
  const totalCount = transactionsData?.pagination?.total || transactions.length

  // Check if any filters are active (includes type filter now that it's inside filters section)
  const hasActiveFilters = filters.type !== 'all' || filters.period !== 'this-month' || filters.entity_type !== 'all'

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      ...filters,
      type: 'all',
      period: 'this-month',
      entity_type: 'all',
      search: '',
    })
  }

  // Visible transactions (for load more - client side pagination for now)
  const visibleTransactions = transactions.slice(0, visibleCount)

  // Load more handler
  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 10, transactions.length))
  }

  // Stats from API for hero
  const stats = {
    total: statsData?.stats?.total || 0,
    completed: statsData?.stats?.completed || 0,
    pending: statsData?.stats?.pending || 0,
    byType: statsData?.stats?.byType || [],
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

  // Refresh handler
  const handleRefresh = () => {
    refetch()
  }

  // ═══════════════════════════════════════════════════════════════
  // SELECTION MODE HANDLERS (Gold Standard)
  // ═══════════════════════════════════════════════════════════════

  // Toggle selection mode
  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      if (prev) {
        // Exiting selection mode - clear selections
        setSelectedIds([])
      }
      return !prev
    })
  }, [])

  // Select all visible transactions
  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === visibleTransactions.length) {
      // Deselect all if all are selected
      setSelectedIds([])
    } else {
      // Select all visible transactions
      setSelectedIds(visibleTransactions.map((t) => t._id))
    }
  }, [selectedIds.length, visibleTransactions])

  // Delete selected transactions (placeholder - implement with API)
  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) {
      toast.error(isRTL ? 'لم يتم تحديد أي معاملات' : 'No transactions selected')
      return
    }
    // TODO: Implement actual delete API call
    toast.info(
      isRTL
        ? `سيتم حذف ${selectedIds.length} معاملة`
        : `Would delete ${selectedIds.length} transaction(s)`
    )
    console.log('Delete selected:', selectedIds)
  }, [selectedIds, isRTL])

  // Archive selected transactions (placeholder - implement with API)
  const handleBulkArchive = useCallback(() => {
    if (selectedIds.length === 0) {
      toast.error(isRTL ? 'لم يتم تحديد أي معاملات' : 'No transactions selected')
      return
    }
    // TODO: Implement actual archive API call
    toast.info(
      isRTL
        ? `سيتم أرشفة ${selectedIds.length} معاملة`
        : `Would archive ${selectedIds.length} transaction(s)`
    )
    console.log('Archive selected:', selectedIds)
  }, [selectedIds, isRTL])

  // Mark selected as complete (placeholder - implement with API)
  const handleBulkComplete = useCallback(() => {
    if (selectedIds.length === 0) {
      toast.error(isRTL ? 'لم يتم تحديد أي معاملات' : 'No transactions selected')
      return
    }
    // TODO: Implement actual complete API call
    toast.info(
      isRTL
        ? `سيتم إكمال ${selectedIds.length} معاملة`
        : `Would complete ${selectedIds.length} transaction(s)`
    )
    console.log('Complete selected:', selectedIds)
  }, [selectedIds, isRTL])

  return (
    <Main
      fluid={true}
      className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
    >
      {/* Hero Card */}
      <ProductivityHero
        badge={isRTL ? 'إدارة العملاء' : 'CRM'}
        title={isRTL ? 'معاملات العملاء' : 'CRM Transactions'}
        type="crm"
        listMode={true}
        stats={[
          {
            label: isRTL ? 'إجمالي الأنشطة' : 'Total Activities',
            value: stats.total.toString(),
            icon: FileText,
            color: 'slate'
          },
          {
            label: isRTL ? 'مكتملة' : 'Completed',
            value: stats.completed.toString(),
            icon: CheckSquare,
            color: 'emerald'
          },
          {
            label: isRTL ? 'قيد الانتظار' : 'Pending',
            value: stats.pending.toString(),
            icon: Clock,
            color: 'amber'
          },
          {
            label: isRTL ? 'معروض' : 'Showing',
            value: `${visibleTransactions.length}/${totalCount}`,
            icon: Target,
            color: 'blue'
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <GosiButton
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-10 px-5 bg-transparent hover:bg-white/10 border-white/10 text-white rounded-xl"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin', isRTL ? 'ms-2' : 'me-2')} />
              {isRTL ? 'تحديث' : 'Refresh'}
            </GosiButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <GosiButton
                  variant="outline"
                  size="sm"
                  className="h-10 px-5 bg-emerald-500 hover:bg-emerald-600 border-0 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  <Download className={cn('w-4 h-4', isRTL ? 'ms-2' : 'me-2')} />
                  {isRTL ? 'تصدير' : 'Export'}
                </GosiButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="rounded-xl">
                <DropdownMenuItem onClick={handleExportExcel} className="rounded-lg py-2.5 cursor-pointer">
                  <FileSpreadsheet className={cn('w-4 h-4', isRTL ? 'ms-2' : 'me-2')} />
                  {isRTL ? 'تصدير Excel' : 'Export Excel'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} className="rounded-lg py-2.5 cursor-pointer">
                  <FileText className={cn('w-4 h-4', isRTL ? 'ms-2' : 'me-2')} />
                  {isRTL ? 'تصدير PDF' : 'Export PDF'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV} className="rounded-lg py-2.5 cursor-pointer">
                  <FileText className={cn('w-4 h-4', isRTL ? 'ms-2' : 'me-2')} />
                  {isRTL ? 'تصدير CSV' : 'Export CSV'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Main Grid Layout - Gold Standard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter Card - Gold Standard */}
          <GosiCard className="rounded-[2rem] p-4 md:p-6">
            {/* Search and Filter Toggle Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input - Gold Standard */}
              <div className="relative w-full sm:flex-1">
                <Search className={cn(
                  'absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400',
                  isRTL ? 'start-4' : 'end-4'
                )} />
                <GosiInput
                  type="text"
                  placeholder={isRTL ? 'بحث في المعاملات...' : 'Search transactions...'}
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className={cn('h-14 w-full text-base', isRTL ? 'ps-12' : 'pe-12')}
                />
              </div>

              {/* Filter Toggle Button - Gold Standard */}
              <GosiButton
                variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'h-14 w-full sm:w-auto px-6 whitespace-nowrap transition-all',
                  showFilters || hasActiveFilters ? 'bg-navy text-white border-navy' : ''
                )}
              >
                <Filter className="h-5 w-5 ms-2" />
                {isRTL ? 'الفلاتر' : 'Filters'}
                {hasActiveFilters && (
                  <span className="ms-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">!</span>
                )}
              </GosiButton>
            </div>

            {/* Expandable Filter Dropdowns - Gold Standard */}
            <div className={cn(
              'flex-wrap gap-4 transition-all duration-300 ease-in-out overflow-hidden',
              showFilters ? 'flex opacity-100 max-h-[500px] mt-4' : 'hidden opacity-0 max-h-0'
            )}>
              {/* Transaction Type Filter - Gold Standard (moved inside filters) */}
              <div className="flex-1 min-w-[220px]">
                <GosiSelect
                  value={filters.type}
                  onValueChange={(val) => setFilters({ ...filters, type: val })}
                >
                  <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                        {isRTL ? 'نوع المعاملة:' : 'Type:'}
                      </span>
                      <GosiSelectValue />
                    </div>
                  </GosiSelectTrigger>
                  <GosiSelectContent>
                    {TRANSACTION_TYPES.map((type) => (
                      <GosiSelectItem key={type.value} value={type.value} className="font-bold">
                        {isRTL ? type.labelAr : type.labelEn}
                      </GosiSelectItem>
                    ))}
                  </GosiSelectContent>
                </GosiSelect>
              </div>

              {/* Period Filter */}
              <div className="flex-1 min-w-[220px]">
                <GosiSelect
                  value={filters.period}
                  onValueChange={(val) => setFilters({ ...filters, period: val })}
                >
                  <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                        {isRTL ? 'الفترة:' : 'Period:'}
                      </span>
                      <GosiSelectValue />
                    </div>
                  </GosiSelectTrigger>
                  <GosiSelectContent>
                    {QUICK_PERIODS.map((period) => (
                      <GosiSelectItem key={period.value} value={period.value} className="font-bold">
                        {isRTL ? period.labelAr : period.labelEn}
                      </GosiSelectItem>
                    ))}
                  </GosiSelectContent>
                </GosiSelect>
              </div>

              {/* Entity Type Filter */}
              <div className="flex-1 min-w-[220px]">
                <GosiSelect
                  value={filters.entity_type}
                  onValueChange={(val) => setFilters({ ...filters, entity_type: val })}
                >
                  <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">
                        {isRTL ? 'النوع:' : 'Entity:'}
                      </span>
                      <GosiSelectValue />
                    </div>
                  </GosiSelectTrigger>
                  <GosiSelectContent>
                    <GosiSelectItem value="all" className="font-bold">
                      {isRTL ? 'الكل' : 'All'}
                    </GosiSelectItem>
                    <GosiSelectItem value="lead" className="font-bold">
                      {isRTL ? 'عميل محتمل' : 'Lead'}
                    </GosiSelectItem>
                    <GosiSelectItem value="contact" className="font-bold">
                      {isRTL ? 'جهة اتصال' : 'Contact'}
                    </GosiSelectItem>
                    <GosiSelectItem value="client" className="font-bold">
                      {isRTL ? 'عميل' : 'Client'}
                    </GosiSelectItem>
                  </GosiSelectContent>
                </GosiSelect>
              </div>

              {/* Clear Filters Button - Gold Standard */}
              {hasActiveFilters && (
                <GosiButton
                  variant="ghost"
                  onClick={clearFilters}
                  className="h-14 w-full md:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-dashed border-red-200 px-6 hover:shadow-lg hover:shadow-red-500/10 transition-all"
                >
                  <X className="h-5 w-5 ms-2" />
                  {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
                </GosiButton>
              )}
            </div>
          </GosiCard>

          {/* Transaction List - Gold Standard */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : transactions.length === 0 ? (
            <EmptyState isRTL={isRTL} />
          ) : (
            <div className="space-y-4">
              {visibleTransactions.map((transaction, index) => (
                <TransactionCard
                  key={transaction._id}
                  transaction={transaction}
                  index={index}
                  isRTL={isRTL}
                  dateLocale={dateLocale}
                  onClick={() => console.log('View transaction:', transaction._id)}
                />
              ))}

              {/* Load More Button - Gold Standard */}
              {visibleCount < transactions.length && (
                <div className="flex justify-center pt-4">
                  <GosiButton
                    onClick={handleLoadMore}
                    variant="outline"
                    className="w-full max-w-sm h-12 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-600 font-bold transition-all"
                  >
                    <Plus className="w-5 h-5 ms-2" />
                    {isRTL ? 'عرض المزيد' : 'Show More'}
                    <span className="text-xs text-slate-400 ms-2">
                      ({visibleCount} / {transactions.length})
                    </span>
                  </GosiButton>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Column - Gold Standard with Quick Actions + Calendar + Notifications */}
        <div className="lg:col-span-1">
          <CrmTransactionsSidebar
            mode="list"
            isSelectionMode={isSelectionMode}
            onToggleSelectionMode={handleToggleSelectionMode}
            selectedCount={selectedIds.length}
            totalCount={visibleTransactions.length}
            onDeleteSelected={handleDeleteSelected}
            onBulkArchive={handleBulkArchive}
            onBulkComplete={handleBulkComplete}
            onSelectAll={handleSelectAll}
          />
        </div>
      </div>
    </Main>
  )
}

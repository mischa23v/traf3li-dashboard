/**
 * GL Transactions View - User-Friendly Transaction History
 *
 * A simplified view of General Ledger entries without accounting jargon.
 * Shows financial transactions (Invoices, Payments, Expenses, Bills) in an easy-to-understand format.
 *
 * Features:
 * - Date filtering with period selector (today, this week, this month, etc.)
 * - Transaction type filtering (Invoice, Payment, Expense, Bill, Journal Entry)
 * - Case/Client filtering support
 * - Search by description
 * - Arabic labels for transaction types
 * - Clean table view with formatted amounts
 *
 * Usage Example:
 * ```tsx
 * import { GLTransactionsView } from '@/features/finance/components/gl-transactions-view'
 *
 * // Basic usage with default settings
 * <GLTransactionsView />
 *
 * // With custom filters
 * <GLTransactionsView
 *   defaultPeriod="this-year"
 *   defaultType="Invoice"
 *   defaultCaseId="case-123"
 *   showFilters={true}
 * />
 * ```
 *
 * Props:
 * - defaultPeriod: Initial period filter ('today' | 'this-week' | 'this-month' | 'last-month' | 'this-quarter' | 'this-year' | 'all')
 * - defaultType: Initial transaction type filter
 * - defaultCaseId: Filter by specific case ID
 * - showFilters: Show/hide filter controls (default: true)
 */

import { useState, useMemo } from 'react'
import { Calendar, Filter, Search, FileText, Receipt, Wallet, FileSpreadsheet, BookOpen, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useGLEntries } from '@/hooks/useAccounting'
import { formatSAR, halalasToSAR } from '@/lib/currency'
import type { GLReferenceModel } from '@/services/accountingService'

// Transform referenceModel to Arabic labels
const getTypeLabel = (type: GLReferenceModel): string => {
  const labels: Record<GLReferenceModel, string> = {
    'Invoice': 'فاتورة',
    'Payment': 'دفعة',
    'Expense': 'مصروف',
    'Bill': 'فاتورة مورد',
    'JournalEntry': 'تسوية',
  }
  return labels[type] || type
}

// Get type color for badges
const getTypeColor = (type: GLReferenceModel): string => {
  const colors: Record<GLReferenceModel, string> = {
    'Invoice': 'bg-blue-50 text-blue-700 border-blue-200',
    'Payment': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Expense': 'bg-red-50 text-red-700 border-red-200',
    'Bill': 'bg-orange-50 text-orange-700 border-orange-200',
    'JournalEntry': 'bg-purple-50 text-purple-700 border-purple-200',
  }
  return colors[type] || 'bg-slate-50 text-slate-700 border-slate-200'
}

// Get icon for transaction type
const getTypeIcon = (type: GLReferenceModel) => {
  const icons: Record<GLReferenceModel, any> = {
    'Invoice': FileText,
    'Payment': Wallet,
    'Expense': Receipt,
    'Bill': FileSpreadsheet,
    'JournalEntry': BookOpen,
  }
  return icons[type] || FileText
}

// Period selector options
const getPeriodDates = (period: string): { startDate?: string; endDate?: string } => {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1)
  const lastDayOfYear = new Date(today.getFullYear(), 11, 31)

  switch (period) {
    case 'today':
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      }
    case 'this-week': {
      const firstDayOfWeek = new Date(today)
      firstDayOfWeek.setDate(today.getDate() - today.getDay())
      const lastDayOfWeek = new Date(firstDayOfWeek)
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6)
      return {
        startDate: firstDayOfWeek.toISOString().split('T')[0],
        endDate: lastDayOfWeek.toISOString().split('T')[0],
      }
    }
    case 'this-month':
      return {
        startDate: firstDayOfMonth.toISOString().split('T')[0],
        endDate: lastDayOfMonth.toISOString().split('T')[0],
      }
    case 'last-month': {
      const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      return {
        startDate: firstDayOfLastMonth.toISOString().split('T')[0],
        endDate: lastDayOfLastMonth.toISOString().split('T')[0],
      }
    }
    case 'this-quarter': {
      const quarter = Math.floor(today.getMonth() / 3)
      const firstDayOfQuarter = new Date(today.getFullYear(), quarter * 3, 1)
      const lastDayOfQuarter = new Date(today.getFullYear(), quarter * 3 + 3, 0)
      return {
        startDate: firstDayOfQuarter.toISOString().split('T')[0],
        endDate: lastDayOfQuarter.toISOString().split('T')[0],
      }
    }
    case 'this-year':
      return {
        startDate: firstDayOfYear.toISOString().split('T')[0],
        endDate: lastDayOfYear.toISOString().split('T')[0],
      }
    case 'all':
    default:
      return {}
  }
}

interface GLTransactionsViewProps {
  defaultPeriod?: string
  defaultType?: GLReferenceModel
  defaultCaseId?: string
  showFilters?: boolean
}

export function GLTransactionsView({
  defaultPeriod = 'this-month',
  defaultType,
  defaultCaseId,
  showFilters = true,
}: GLTransactionsViewProps) {
  const [period, setPeriod] = useState(defaultPeriod)
  const [typeFilter, setTypeFilter] = useState<GLReferenceModel | 'all'>(defaultType || 'all')
  const [caseFilter, setCaseFilter] = useState(defaultCaseId || '')
  const [searchQuery, setSearchQuery] = useState('')

  // Build filters for API
  const filters = useMemo(() => {
    const dates = getPeriodDates(period)
    return {
      ...dates,
      referenceModel: typeFilter !== 'all' ? typeFilter : undefined,
      caseId: caseFilter || undefined,
    }
  }, [period, typeFilter, caseFilter])

  // Fetch GL entries
  const { data: entriesData, isLoading, isError, error } = useGLEntries(filters)

  // Transform and filter data
  const transactions = useMemo(() => {
    if (!entriesData?.data) return []

    let entries = entriesData.data

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      entries = entries.filter((entry: any) =>
        entry.description?.toLowerCase().includes(query) ||
        entry.entryNumber?.toLowerCase().includes(query) ||
        entry.referenceId?.toLowerCase().includes(query)
      )
    }

    return entries.map((entry: any) => {
      // Build description
      let description = entry.description || ''

      // Enhance description with reference info
      if (entry.referenceId) {
        description = `${description} - ${entry.referenceId}`
      }

      // Add client info if available
      if (entry.clientId?.firstName) {
        const clientName = `${entry.clientId.firstName} ${entry.clientId.lastName || ''}`.trim()
        description = `${description} (${clientName})`
      }

      return {
        id: entry._id,
        date: new Date(entry.transactionDate).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        description,
        type: entry.referenceModel as GLReferenceModel,
        amount: entry.amount,
        caseNumber: entry.caseId?.caseNumber || null,
        caseId: entry.caseId?._id || null,
      }
    })
  }, [entriesData, searchQuery])

  // Calculate total
  const totalAmount = useMemo(() => {
    return transactions.reduce((sum, txn) => sum + txn.amount, 0)
  }, [transactions])

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">سجل المعاملات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 flex-1" />
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (isError) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل المعاملات</h3>
            <p className="text-slate-500">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-slate-600" aria-hidden="true" />
          سجل المعاملات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4">
            {/* Period Selector */}
            <div className="flex-1 min-w-[200px]">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-full rounded-xl border-slate-200">
                  <SelectValue placeholder="اختر الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="this-week">هذا الأسبوع</SelectItem>
                  <SelectItem value="this-month">هذا الشهر</SelectItem>
                  <SelectItem value="last-month">الشهر الماضي</SelectItem>
                  <SelectItem value="this-quarter">هذا الربع</SelectItem>
                  <SelectItem value="this-year">هذه السنة</SelectItem>
                  <SelectItem value="all">جميع الفترات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="flex-1 min-w-[200px]">
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as GLReferenceModel | 'all')}>
                <SelectTrigger className="w-full rounded-xl border-slate-200">
                  <SelectValue placeholder="نوع المعاملة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="Invoice">فاتورة</SelectItem>
                  <SelectItem value="Payment">دفعة</SelectItem>
                  <SelectItem value="Expense">مصروف</SelectItem>
                  <SelectItem value="Bill">فاتورة مورد</SelectItem>
                  <SelectItem value="JournalEntry">تسوية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                <Input
                  placeholder="بحث في الوصف..."
                  className="pe-10 rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              عدد المعاملات: <span className="font-bold text-slate-900">{transactions.length}</span>
            </div>
            <div className="text-sm text-slate-600">
              الإجمالي: <span className="font-bold text-emerald-600">{formatSAR(halalasToSAR(totalAmount))}</span>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {transactions.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-12 text-center border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-400" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد معاملات</h3>
            <p className="text-slate-500">لم يتم العثور على معاملات في الفترة المحددة</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-bold text-slate-900">التاريخ</TableHead>
                  <TableHead className="font-bold text-slate-900">الوصف</TableHead>
                  <TableHead className="font-bold text-slate-900">النوع</TableHead>
                  <TableHead className="font-bold text-slate-900 text-left">المبلغ</TableHead>
                  <TableHead className="font-bold text-slate-900">القضية</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => {
                  const Icon = getTypeIcon(txn.type)
                  return (
                    <TableRow key={txn.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                        {txn.date}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="flex items-start gap-2">
                          <Icon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 line-clamp-2">{txn.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getTypeColor(txn.type)} border font-medium`}>
                          {getTypeLabel(txn.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left font-bold text-emerald-600 whitespace-nowrap">
                        {formatSAR(halalasToSAR(txn.amount))}
                      </TableCell>
                      <TableCell>
                        {txn.caseNumber ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                            {txn.caseNumber}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default GLTransactionsView

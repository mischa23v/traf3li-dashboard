import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MoreHorizontal,
  Plus,
  FileText,
  Eye,
  Edit,
  Copy,
  Send,
  FileDown,
  FileCheck,
  Trash2,
  Filter as FilterIcon,
  Calendar,
  User,
  Search as SearchIcon,
} from 'lucide-react'
import { useQuotes, useDeleteQuote, useDuplicateQuote, useSendQuote, useConvertQuoteToInvoice } from '@/hooks/useQuotes'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { Quote, QuoteStatus, CustomerType } from '@/types/crm-extended'

// Status options for filtering
const quoteStatuses: QuoteStatus[] = ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'revised']

// Customer type options
const customerTypes: CustomerType[] = ['lead', 'client']

// Valid status options
const validStatuses = [
  { value: 'all', label: 'الكل', labelEn: 'All' },
  { value: 'valid', label: 'صالح', labelEn: 'Valid' },
  { value: 'expiring_soon', label: 'ينتهي قريباً', labelEn: 'Expiring Soon' },
  { value: 'expired', label: 'منتهي', labelEn: 'Expired' },
]

interface QuotesListViewProps {
  onCreateQuote?: () => void
  onViewQuote?: (quoteId: string) => void
  onEditQuote?: (quoteId: string) => void
}

export function QuotesListView({ onCreateQuote, onViewQuote, onEditQuote }: QuotesListViewProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Local state for filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<QuoteStatus[]>([])
  const [selectedCustomerType, setSelectedCustomerType] = useState<CustomerType | 'all'>('all')
  const [selectedCreatedBy, setSelectedCreatedBy] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({})
  const [validStatus, setValidStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Selection state
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  // Prepare filters for API
  const filters = useMemo(() => {
    const f: any = {}

    if (searchQuery) f.search = searchQuery
    if (selectedStatuses.length > 0) f.status = selectedStatuses[0] // API may support array or single value
    if (selectedCustomerType !== 'all') f.customerType = selectedCustomerType
    if (dateRange.start) f.startDate = dateRange.start
    if (dateRange.end) f.endDate = dateRange.end
    if (sortBy) f.sortBy = sortBy
    if (sortOrder) f.sortOrder = sortOrder

    return f
  }, [searchQuery, selectedStatuses, selectedCustomerType, dateRange, sortBy, sortOrder])

  // Fetch quotes
  const { data: quotesData, isLoading, isError, error, refetch } = useQuotes(filters)

  // Mutations
  const { mutate: deleteQuote } = useDeleteQuote()
  const { mutate: duplicateQuote } = useDuplicateQuote()
  const { mutate: sendQuote } = useSendQuote()
  const { mutate: convertToInvoice } = useConvertQuoteToInvoice()

  // Transform API data
  const quotes = useMemo(() => {
    if (!quotesData?.data) return []

    let filtered = quotesData.data

    // Apply valid status filter (client-side)
    if (validStatus !== 'all') {
      const now = new Date()
      filtered = filtered.filter((quote: Quote) => {
        const validUntilDate = new Date(quote.validUntil)
        const daysUntilExpiry = Math.ceil((validUntilDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (validStatus === 'valid') return daysUntilExpiry > 7
        if (validStatus === 'expiring_soon') return daysUntilExpiry > 0 && daysUntilExpiry <= 7
        if (validStatus === 'expired') return daysUntilExpiry <= 0

        return true
      })
    }

    return filtered
  }, [quotesData, validStatus])

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedQuotes.size === quotes.length) {
      setSelectedQuotes(new Set())
    } else {
      setSelectedQuotes(new Set(quotes.map((q: Quote) => q.id)))
    }
  }, [quotes, selectedQuotes])

  const handleSelectQuote = useCallback((quoteId: string) => {
    const newSelected = new Set(selectedQuotes)
    if (newSelected.has(quoteId)) {
      newSelected.delete(quoteId)
    } else {
      newSelected.add(quoteId)
    }
    setSelectedQuotes(newSelected)
  }, [selectedQuotes])

  const handleBulkDelete = useCallback(() => {
    if (selectedQuotes.size === 0) return

    if (confirm(t('quotes.confirmBulkDelete', { count: selectedQuotes.size }))) {
      selectedQuotes.forEach((id) => {
        deleteQuote(id)
      })
      setSelectedQuotes(new Set())
      setIsSelectionMode(false)
    }
  }, [selectedQuotes, deleteQuote, t])

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return `${amount.toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} ${currency}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Check if quote is editable (only draft)
  const isEditable = (status: QuoteStatus) => status === 'draft'

  // Check if quote can be converted (only accepted)
  const canConvert = (status: QuoteStatus) => status === 'accepted'

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('quotes.title')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('quotes.subtitle')}</p>
        </div>
        {onCreateQuote && (
          <Button onClick={onCreateQuote} className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-4 w-4 me-2" />
            {t('quotes.create')}
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={t('quotes.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Status Multi-Select */}
          <Select
            value={selectedStatuses[0] || ''}
            onValueChange={(value) => setSelectedStatuses(value ? [value as QuoteStatus] : [])}
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50">
              <SelectValue placeholder={t('quotes.filters.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('common.all')}</SelectItem>
              {quoteStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`quotes.status.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Customer Type */}
          <Select
            value={selectedCustomerType}
            onValueChange={(value) => setSelectedCustomerType(value as CustomerType | 'all')}
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50">
              <SelectValue placeholder={t('quotes.filters.customerType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {customerTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`quotes.customerType.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Valid Status */}
          <Select value={validStatus} onValueChange={setValidStatus}>
            <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50">
              <SelectValue placeholder={t('quotes.filters.validStatus')} />
            </SelectTrigger>
            <SelectContent>
              {validStatuses.map((vs) => (
                <SelectItem key={vs.value} value={vs.value}>
                  {isArabic ? vs.label : vs.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Picker - Simplified */}
          <Button
            variant="outline"
            className="h-10 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-500"
          >
            <Calendar className="h-4 w-4 me-2" />
            {t('quotes.filters.dateRange')}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedQuotes.size > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox checked={true} onCheckedChange={handleSelectAll} />
            <span className="text-sm font-medium text-emerald-900">
              {t('quotes.selectedCount', { count: selectedQuotes.size })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 me-2" />
              {t('common.delete')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedQuotes(new Set())}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-start">
                  <Checkbox
                    checked={selectedQuotes.size === quotes.length && quotes.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-slate-600 uppercase">
                  {t('quotes.columns.quoteId')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-slate-600 uppercase">
                  {t('quotes.columns.title')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-slate-600 uppercase">
                  {t('quotes.columns.customer')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-slate-600 uppercase">
                  {t('quotes.columns.status')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-slate-600 uppercase">
                  {t('quotes.columns.totalAmount')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-slate-600 uppercase">
                  {t('quotes.columns.validUntil')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-slate-600 uppercase">
                  {t('quotes.columns.createdDate')}
                </th>
                <th className="px-4 py-3 text-start text-xs font-semibold text-slate-600 uppercase">
                  {t('quotes.columns.createdBy')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    {t('common.loading')}
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="text-red-600 mb-2">{t('quotes.loadError')}</div>
                    <Button onClick={() => refetch()} variant="outline" size="sm">
                      {t('common.retry')}
                    </Button>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && quotes.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">{t('quotes.noQuotes')}</p>
                    <p className="text-slate-400 text-sm mt-1">{t('quotes.createFirstQuote')}</p>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && quotes.map((quote: Quote) => (
                <tr
                  key={quote.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedQuotes.has(quote.id)}
                      onCheckedChange={() => handleSelectQuote(quote.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-slate-600">{quote.quoteId}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p className="font-medium text-slate-900 truncate">
                        {isArabic && quote.titleAr ? quote.titleAr : quote.title}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-700">{quote.customerName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={quote.status} type="quote" size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(quote.grandTotal, quote.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{formatDate(quote.validUntil)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">{formatDate(quote.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">
                      {quote.createdBy.firstName} {quote.createdBy.lastName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onViewQuote?.(quote.id)}>
                          <Eye className="h-4 w-4 me-2" />
                          {t('quotes.actions.view')}
                        </DropdownMenuItem>

                        {isEditable(quote.status) && onEditQuote && (
                          <DropdownMenuItem onClick={() => onEditQuote(quote.id)}>
                            <Edit className="h-4 w-4 me-2" />
                            {t('quotes.actions.edit')}
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => duplicateQuote(quote.id)}>
                          <Copy className="h-4 w-4 me-2" />
                          {t('quotes.actions.duplicate')}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => sendQuote({ quoteId: quote.id })}>
                          <Send className="h-4 w-4 me-2" />
                          {t('quotes.actions.send')}
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <FileDown className="h-4 w-4 me-2" />
                          {t('quotes.actions.downloadPDF')}
                        </DropdownMenuItem>

                        {canConvert(quote.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => convertToInvoice(quote.id)}>
                              <FileCheck className="h-4 w-4 me-2" />
                              {t('quotes.actions.convertToInvoice')}
                            </DropdownMenuItem>
                          </>
                        )}

                        {isEditable(quote.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => {
                                if (confirm(t('quotes.confirmDelete'))) {
                                  deleteQuote(quote.id)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 me-2" />
                              {t('quotes.actions.delete')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

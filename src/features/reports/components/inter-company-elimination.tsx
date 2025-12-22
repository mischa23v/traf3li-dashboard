/**
 * Inter-Company Elimination Component
 * Shows inter-company transactions and elimination entries
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowRightLeft,
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronRight,
  DollarSign,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatSAR } from '@/lib/currency'
import { useInterCompanyTransactions } from '@/hooks/useConsolidatedReport'
import type { InterCompanyTransaction } from '@/services/consolidatedReportService'

interface InterCompanyEliminationProps {
  companyIds: string[]
  startDate: string
  endDate: string
}

export function InterCompanyElimination({
  companyIds,
  startDate,
  endDate,
}: InterCompanyEliminationProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [showEliminationDetails, setShowEliminationDetails] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'purchase' | 'loan' | 'service' | 'other'>('all')

  // Fetch inter-company transactions
  const {
    data: transactions,
    isLoading,
    error,
  } = useInterCompanyTransactions(companyIds, startDate, endDate)

  // Format currency
  const formatCurrency = (amount: number) => {
    return formatSAR(amount / 100)
  }

  // Filter transactions
  const filteredTransactions = transactions?.filter(
    (t) => filterType === 'all' || t.transactionType === filterType
  ) || []

  // Calculate totals
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.convertedAmount, 0)
  const totalEliminationAmount = filteredTransactions
    .filter((t) => t.eliminationEntry)
    .reduce((sum, t) => sum + (t.eliminationEntry?.amount || 0), 0)

  // Get transaction type badge
  const getTransactionTypeBadge = (type: InterCompanyTransaction['transactionType']) => {
    const configs = {
      sale: { label: isArabic ? 'مبيعات' : 'Sale', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      purchase: { label: isArabic ? 'مشتريات' : 'Purchase', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      loan: { label: isArabic ? 'قرض' : 'Loan', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      service: { label: isArabic ? 'خدمة' : 'Service', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      other: { label: isArabic ? 'أخرى' : 'Other', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    }
    const config = configs[type] || configs.other
    return (
      <Badge variant="outline" className={cn('text-xs', config.color)}>
        {config.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8">
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent className="p-8">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8">
          <CardTitle className="text-2xl font-bold text-navy flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <ArrowRightLeft className="w-6 h-6 text-amber-600" />
            </div>
            {isArabic ? 'قيود الإلغاء بين الشركات' : 'Inter-Company Eliminations'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12">
          <div className="text-center text-slate-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-50" />
            <p className="text-lg font-semibold mb-2">
              {isArabic ? 'لا توجد معاملات بين الشركات' : 'No Inter-Company Transactions'}
            </p>
            <p className="text-sm">
              {isArabic
                ? 'لم يتم العثور على معاملات تتطلب قيود إلغاء في الفترة المحددة'
                : 'No transactions requiring elimination entries were found in the selected period'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-navy flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <ArrowRightLeft className="w-6 h-6 text-amber-600" />
            </div>
            {isArabic ? 'قيود الإلغاء بين الشركات' : 'Inter-Company Eliminations'}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Info className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  {isArabic
                    ? 'قيود الإلغاء تستبعد المعاملات بين الشركات التابعة لتجنب تضخيم الإيرادات والمصروفات في التقارير الموحدة'
                    : 'Elimination entries exclude inter-company transactions to avoid inflating revenues and expenses in consolidated reports'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-blue-700">
                {isArabic ? 'إجمالي المعاملات' : 'Total Transactions'}
              </span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-900">{filteredTransactions.length}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-purple-700">
                {isArabic ? 'مبلغ المعاملات' : 'Transaction Amount'}
              </span>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(totalAmount)}</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-amber-700">
                {isArabic ? 'مبلغ الإلغاء' : 'Elimination Amount'}
              </span>
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-900">{formatCurrency(totalEliminationAmount)}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Switch
              id="show-elimination"
              checked={showEliminationDetails}
              onCheckedChange={setShowEliminationDetails}
            />
            <Label htmlFor="show-elimination" className="text-sm cursor-pointer">
              {isArabic ? 'عرض تفاصيل الإلغاء' : 'Show Elimination Details'}
            </Label>
          </div>

          {/* Filter by type */}
          <div className="flex items-center gap-2 ms-auto">
            <span className="text-sm text-slate-600">{isArabic ? 'النوع:' : 'Type:'}</span>
            {(['all', 'sale', 'purchase', 'loan', 'service', 'other'] as const).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                className="rounded-xl h-8"
                onClick={() => setFilterType(type)}
              >
                {type === 'all' && (isArabic ? 'الكل' : 'All')}
                {type === 'sale' && (isArabic ? 'مبيعات' : 'Sales')}
                {type === 'purchase' && (isArabic ? 'مشتريات' : 'Purchases')}
                {type === 'loan' && (isArabic ? 'قروض' : 'Loans')}
                {type === 'service' && (isArabic ? 'خدمات' : 'Services')}
                {type === 'other' && (isArabic ? 'أخرى' : 'Other')}
              </Button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              isArabic={isArabic}
              formatCurrency={formatCurrency}
              showEliminationDetails={showEliminationDetails}
              getTransactionTypeBadge={getTransactionTypeBadge}
            />
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>{isArabic ? 'لا توجد معاملات من هذا النوع' : 'No transactions of this type'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== TRANSACTION ROW ====================

interface TransactionRowProps {
  transaction: InterCompanyTransaction
  isArabic: boolean
  formatCurrency: (amount: number) => string
  showEliminationDetails: boolean
  getTransactionTypeBadge: (type: InterCompanyTransaction['transactionType']) => React.ReactNode
}

function TransactionRow({
  transaction,
  isArabic,
  formatCurrency,
  showEliminationDetails,
  getTransactionTypeBadge,
}: TransactionRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-sm transition-shadow">
        {/* Main Row */}
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 h-auto justify-between hover:bg-slate-50 rounded-none"
          >
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <div className="text-start flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  {getTransactionTypeBadge(transaction.transactionType)}
                  <Badge variant="secondary" className="text-xs">
                    {transaction.date}
                  </Badge>
                  {transaction.reference && (
                    <Badge variant="outline" className="text-xs">
                      #{transaction.reference}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span className="font-medium text-slate-700">
                      {isArabic
                        ? transaction.fromCompanyNameAr || transaction.fromCompanyName
                        : transaction.fromCompanyName}
                    </span>
                  </div>
                  <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span className="font-medium text-slate-700">
                      {isArabic
                        ? transaction.toCompanyNameAr || transaction.toCompanyName
                        : transaction.toCompanyName}
                    </span>
                  </div>
                </div>
                {transaction.description && (
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    {isArabic ? transaction.descriptionAr || transaction.description : transaction.description}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {transaction.eliminationEntry && (
                <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                  {isArabic ? 'قيد إلغاء' : 'Elimination'}
                </Badge>
              )}
              <div className="font-bold text-navy text-lg">
                {formatCurrency(transaction.convertedAmount)}
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>

        {/* Expanded Details */}
        {showEliminationDetails && transaction.eliminationEntry && (
          <CollapsibleContent>
            <div className="border-t border-slate-100 bg-amber-50/30 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900 mb-1">
                    {isArabic ? 'قيد الإلغاء' : 'Elimination Entry'}
                  </h4>
                  <p className="text-xs text-amber-700">
                    {transaction.eliminationEntry.description ||
                      (isArabic
                        ? 'قيد لإلغاء المعاملة بين الشركات من التقرير الموحد'
                        : 'Entry to eliminate inter-company transaction from consolidated report')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-amber-100">
                  <div className="text-xs text-slate-500 mb-1">{isArabic ? 'مدين' : 'Debit'}</div>
                  <div className="text-sm font-semibold text-slate-700">
                    {transaction.eliminationEntry.debitAccount}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-100">
                  <div className="text-xs text-slate-500 mb-1">{isArabic ? 'دائن' : 'Credit'}</div>
                  <div className="text-sm font-semibold text-slate-700">
                    {transaction.eliminationEntry.creditAccount}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-amber-700 font-medium">
                  {isArabic ? 'مبلغ القيد:' : 'Entry Amount:'}
                </span>
                <span className="font-bold text-amber-900">
                  {formatCurrency(transaction.eliminationEntry.amount)}
                </span>
              </div>
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  )
}

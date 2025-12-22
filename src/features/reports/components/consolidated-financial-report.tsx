/**
 * Consolidated Financial Report Component
 * Displays consolidated P&L and Balance Sheet with drill-down by company
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Building2,
  DollarSign,
  PieChart,
  Activity,
  Wallet,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { formatSAR } from '@/lib/currency'
import type { ConsolidationFilters, ConsolidatedLineItem } from '@/services/consolidatedReportService'
import {
  useConsolidatedProfitLoss,
  useConsolidatedBalanceSheet,
} from '@/hooks/useConsolidatedReport'

interface ConsolidatedFinancialReportProps {
  filters: ConsolidationFilters
}

export function ConsolidatedFinancialReport({ filters }: ConsolidatedFinancialReportProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [activeTab, setActiveTab] = useState<'profit_loss' | 'balance_sheet'>('profit_loss')

  // Fetch data
  const {
    data: profitLossData,
    isLoading: isPLLoading,
    error: plError,
  } = useConsolidatedProfitLoss(filters)

  const {
    data: balanceSheetData,
    isLoading: isBSLoading,
    error: bsError,
  } = useConsolidatedBalanceSheet(filters)

  const isLoading = isPLLoading || isBSLoading

  // Format currency
  const formatCurrency = (amount: number) => {
    return formatSAR(amount / 100)
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8">
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent className="p-8">
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8">
        <CardTitle className="text-2xl font-bold text-navy flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <PieChart className="w-6 h-6 text-emerald-600" />
          </div>
          {isArabic ? 'التقارير المالية الموحدة' : 'Consolidated Financial Reports'}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="profit_loss" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              {isArabic ? 'الأرباح والخسائر' : 'Profit & Loss'}
            </TabsTrigger>
            <TabsTrigger value="balance_sheet" className="gap-2">
              <Wallet className="w-4 h-4" />
              {isArabic ? 'الميزانية العمومية' : 'Balance Sheet'}
            </TabsTrigger>
          </TabsList>

          {/* Profit & Loss Tab */}
          <TabsContent value="profit_loss" className="space-y-6">
            {profitLossData ? (
              <>
                {/* Income Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                      <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                      {isArabic ? 'الإيرادات' : 'Income'}
                    </h3>
                    <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
                      {formatCurrency(profitLossData.income.subtotal)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {profitLossData.income.items.map((item, index) => (
                      <LineItemRow
                        key={index}
                        item={item}
                        isArabic={isArabic}
                        formatCurrency={formatCurrency}
                        type="income"
                      />
                    ))}
                  </div>
                </div>

                {/* Expenses Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                      <div className="w-2 h-8 bg-rose-500 rounded-full" />
                      {isArabic ? 'المصروفات' : 'Expenses'}
                    </h3>
                    <Badge variant="outline" className="bg-rose-50 border-rose-200 text-rose-700">
                      {formatCurrency(profitLossData.expenses.subtotal)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {profitLossData.expenses.items.map((item, index) => (
                      <LineItemRow
                        key={index}
                        item={item}
                        isArabic={isArabic}
                        formatCurrency={formatCurrency}
                        type="expense"
                      />
                    ))}
                  </div>
                </div>

                {/* Net Income */}
                <div className="border-t-2 border-slate-200 pt-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {profitLossData.netIncome >= 0 ? (
                          <div className="p-2 bg-blue-500 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <div className="p-2 bg-slate-500 rounded-xl">
                            <TrendingDown className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-600">
                            {isArabic ? 'صافي الربح / الخسارة' : 'Net Income / Loss'}
                          </div>
                          <div
                            className={cn(
                              'text-3xl font-bold',
                              profitLossData.netIncome >= 0 ? 'text-blue-900' : 'text-slate-700'
                            )}
                          >
                            {formatCurrency(profitLossData.netIncome)}
                          </div>
                        </div>
                      </div>
                      {profitLossData.totalEliminations !== 0 && (
                        <div className="text-end">
                          <div className="text-xs text-slate-500">
                            {isArabic ? 'قبل الإلغاء' : 'Before Elimination'}
                          </div>
                          <div className="text-lg font-semibold text-slate-600">
                            {formatCurrency(profitLossData.netIncomeBeforeElimination)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Period Info */}
                <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
                  <span>
                    {isArabic ? 'الفترة:' : 'Period:'} {profitLossData.period.start} {isArabic ? 'إلى' : 'to'}{' '}
                    {profitLossData.period.end}
                  </span>
                  <span>
                    {isArabic ? 'العملة:' : 'Currency:'} {profitLossData.baseCurrency}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>{isArabic ? 'لا توجد بيانات متاحة' : 'No data available'}</p>
              </div>
            )}
          </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="balance_sheet" className="space-y-6">
            {balanceSheetData ? (
              <>
                {/* Assets Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                      <div className="w-2 h-8 bg-blue-500 rounded-full" />
                      {isArabic ? 'الأصول' : 'Assets'}
                    </h3>
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      {formatCurrency(balanceSheetData.assets.totalAssets)}
                    </Badge>
                  </div>

                  {/* Current Assets */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-600 px-3">
                      {isArabic ? 'الأصول المتداولة' : 'Current Assets'}
                    </h4>
                    {balanceSheetData.assets.currentAssets.map((item, index) => (
                      <LineItemRow
                        key={index}
                        item={item}
                        isArabic={isArabic}
                        formatCurrency={formatCurrency}
                        type="asset"
                      />
                    ))}
                  </div>

                  {/* Non-Current Assets */}
                  {balanceSheetData.assets.nonCurrentAssets.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-600 px-3">
                        {isArabic ? 'الأصول غير المتداولة' : 'Non-Current Assets'}
                      </h4>
                      {balanceSheetData.assets.nonCurrentAssets.map((item, index) => (
                        <LineItemRow
                          key={index}
                          item={item}
                          isArabic={isArabic}
                          formatCurrency={formatCurrency}
                          type="asset"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Liabilities Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                      <div className="w-2 h-8 bg-orange-500 rounded-full" />
                      {isArabic ? 'الالتزامات' : 'Liabilities'}
                    </h3>
                    <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                      {formatCurrency(balanceSheetData.liabilities.totalLiabilities)}
                    </Badge>
                  </div>

                  {/* Current Liabilities */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-600 px-3">
                      {isArabic ? 'الالتزامات المتداولة' : 'Current Liabilities'}
                    </h4>
                    {balanceSheetData.liabilities.currentLiabilities.map((item, index) => (
                      <LineItemRow
                        key={index}
                        item={item}
                        isArabic={isArabic}
                        formatCurrency={formatCurrency}
                        type="liability"
                      />
                    ))}
                  </div>

                  {/* Non-Current Liabilities */}
                  {balanceSheetData.liabilities.nonCurrentLiabilities.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-600 px-3">
                        {isArabic ? 'الالتزامات غير المتداولة' : 'Non-Current Liabilities'}
                      </h4>
                      {balanceSheetData.liabilities.nonCurrentLiabilities.map((item, index) => (
                        <LineItemRow
                          key={index}
                          item={item}
                          isArabic={isArabic}
                          formatCurrency={formatCurrency}
                          type="liability"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Equity Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                      <div className="w-2 h-8 bg-purple-500 rounded-full" />
                      {isArabic ? 'حقوق الملكية' : 'Equity'}
                    </h3>
                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                      {formatCurrency(balanceSheetData.equity.totalEquity)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {balanceSheetData.equity.items.map((item, index) => (
                      <LineItemRow
                        key={index}
                        item={item}
                        isArabic={isArabic}
                        formatCurrency={formatCurrency}
                        type="equity"
                      />
                    ))}
                  </div>
                </div>

                {/* Total Liabilities and Equity */}
                <div className="border-t-2 border-slate-200 pt-4">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700 rounded-xl">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-600">
                            {isArabic ? 'إجمالي الالتزامات وحقوق الملكية' : 'Total Liabilities & Equity'}
                          </div>
                          <div className="text-3xl font-bold text-slate-900">
                            {formatCurrency(balanceSheetData.totalLiabilitiesAndEquity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Info */}
                <div className="flex items-center justify-between text-sm text-slate-500 pt-4 border-t border-slate-100">
                  <span>
                    {isArabic ? 'كما في:' : 'As of:'} {balanceSheetData.asOfDate}
                  </span>
                  <span>
                    {isArabic ? 'العملة:' : 'Currency:'} {balanceSheetData.baseCurrency}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>{isArabic ? 'لا توجد بيانات متاحة' : 'No data available'}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// ==================== LINE ITEM ROW ====================

interface LineItemRowProps {
  item: ConsolidatedLineItem
  isArabic: boolean
  formatCurrency: (amount: number) => string
  type: 'income' | 'expense' | 'asset' | 'liability' | 'equity'
}

function LineItemRow({ item, isArabic, formatCurrency, type }: LineItemRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getTypeColor = () => {
    switch (type) {
      case 'income':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100'
      case 'expense':
        return 'text-rose-700 bg-rose-50 border-rose-100'
      case 'asset':
        return 'text-blue-700 bg-blue-50 border-blue-100'
      case 'liability':
        return 'text-orange-700 bg-orange-50 border-orange-100'
      case 'equity':
        return 'text-purple-700 bg-purple-50 border-purple-100'
      default:
        return 'text-slate-700 bg-slate-50 border-slate-100'
    }
  }

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
                <div className="font-semibold text-navy truncate">
                  {isArabic ? item.accountAr || item.account : item.account}
                </div>
                {item.accountCode && (
                  <div className="text-xs text-slate-500">{item.accountCode}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {item.eliminationAmount !== 0 && (
                <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 text-xs">
                  {isArabic ? 'إلغاء' : 'Elim'}: {formatCurrency(item.eliminationAmount)}
                </Badge>
              )}
              <div className={cn('font-bold px-3 py-1 rounded-lg border text-sm', getTypeColor())}>
                {formatCurrency(item.totalAfterElimination)}
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>

        {/* Expanded Details */}
        <CollapsibleContent>
          <div className="border-t border-slate-100 bg-slate-50 p-4">
            <div className="space-y-2">
              {item.byCompany.map((companyData, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {isArabic
                        ? companyData.companyNameAr || companyData.companyName
                        : companyData.companyName}
                    </span>
                    {companyData.conversionRate && companyData.conversionRate !== 1 && (
                      <Badge variant="secondary" className="text-xs">
                        {companyData.currency} @ {companyData.conversionRate.toFixed(4)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    {formatCurrency(companyData.convertedAmount)}
                  </div>
                </div>
              ))}
            </div>
            {item.eliminationAmount !== 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{isArabic ? 'قبل الإلغاء' : 'Before Elimination'}:</span>
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(item.totalBeforeElimination)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

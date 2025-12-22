/**
 * Consolidated Report Component
 * Main component with company selector, date range, and report type selection
 */

import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns'
import {
  Building2,
  Calendar,
  FileText,
  TrendingUp,
  DollarSign,
  Filter,
  Download,
  RefreshCw,
  CheckSquare,
  Square,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useCompanyContext } from '@/contexts/CompanyContext'
import type { Company } from '@/services/companyService'
import type { ConsolidationFilters } from '@/services/consolidatedReportService'
import { ConsolidatedFinancialReport } from './consolidated-financial-report'
import { InterCompanyElimination } from './inter-company-elimination'
import { CompanyComparisonChart } from './company-comparison-chart'
import { useConsolidationSummary, useExportConsolidatedReport } from '@/hooks/useConsolidatedReport'

type PeriodType = 'this-month' | 'last-month' | 'this-quarter' | 'this-year' | 'custom'
type ReportTypeOption = 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'all'

export function ConsolidatedReport() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const { accessibleCompanies } = useCompanyContext()

  // State
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([])
  const [period, setPeriod] = useState<PeriodType>('this-month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [reportType, setReportType] = useState<ReportTypeOption>('all')
  const [includeEliminationEntries, setIncludeEliminationEntries] = useState(true)
  const [baseCurrency, setBaseCurrency] = useState('SAR')
  const [consolidationMethod, setConsolidationMethod] = useState<'full' | 'proportional'>('full')
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false)

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date()
    switch (period) {
      case 'this-month':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        }
      case 'last-month':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return {
          start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          end: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
        }
      case 'this-quarter':
        return {
          start: format(startOfQuarter(now), 'yyyy-MM-dd'),
          end: format(endOfQuarter(now), 'yyyy-MM-dd'),
        }
      case 'this-year':
        return {
          start: format(startOfYear(now), 'yyyy-MM-dd'),
          end: format(endOfYear(now), 'yyyy-MM-dd'),
        }
      case 'custom':
        return {
          start: customStartDate || format(startOfMonth(now), 'yyyy-MM-dd'),
          end: customEndDate || format(endOfMonth(now), 'yyyy-MM-dd'),
        }
      default:
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        }
    }
  }, [period, customStartDate, customEndDate])

  // Build consolidation filters
  const consolidationFilters: ConsolidationFilters = useMemo(
    () => ({
      companyIds: selectedCompanyIds,
      startDate: dateRange.start,
      endDate: dateRange.end,
      reportType,
      includeEliminationEntries,
      baseCurrency,
      consolidationMethod,
    }),
    [selectedCompanyIds, dateRange, reportType, includeEliminationEntries, baseCurrency, consolidationMethod]
  )

  // Fetch consolidation summary
  const { data: summary, isLoading: isSummaryLoading } = useConsolidationSummary(consolidationFilters)
  const exportMutation = useExportConsolidatedReport()

  // Get company name
  const getCompanyName = (company: Company) => {
    return isArabic ? company.nameAr || company.name : company.name
  }

  // Handle company selection
  const toggleCompany = (companyId: string) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(companyId) ? prev.filter((id) => id !== companyId) : [...prev, companyId]
    )
  }

  const selectAllCompanies = () => {
    setSelectedCompanyIds(accessibleCompanies.map((c) => c._id))
  }

  const clearAllCompanies = () => {
    setSelectedCompanyIds([])
  }

  // Handle export
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (selectedCompanyIds.length === 0) {
      return
    }
    exportMutation.mutate({ filters: consolidationFilters, format })
  }

  // Get selected companies
  const selectedCompanies = useMemo(
    () => accessibleCompanies.filter((c) => selectedCompanyIds.includes(c._id)),
    [accessibleCompanies, selectedCompanyIds]
  )

  // Available currencies
  const currencies = ['SAR', 'USD', 'EUR', 'GBP', 'AED']

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8">
          <CardTitle className="text-2xl font-bold text-navy flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            {isArabic ? 'التقرير المالي الموحد' : 'Consolidated Financial Report'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {/* Company Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-navy">
              {isArabic ? 'اختيار الشركات' : 'Select Companies'}
              {selectedCompanyIds.length > 0 && (
                <Badge variant="secondary" className="ms-2">
                  {selectedCompanyIds.length}
                </Badge>
              )}
            </Label>
            <div className="flex flex-wrap items-center gap-3">
              <DropdownMenu open={companyDropdownOpen} onOpenChange={setCompanyDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'rounded-xl min-w-[200px] justify-between',
                      selectedCompanyIds.length === 0 && 'text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {selectedCompanyIds.length === 0
                          ? isArabic
                            ? 'اختر الشركات'
                            : 'Select companies'
                          : selectedCompanyIds.length === 1
                          ? getCompanyName(selectedCompanies[0])
                          : `${selectedCompanyIds.length} ${isArabic ? 'شركات' : 'companies'}`}
                      </span>
                    </div>
                    <CheckSquare className="w-4 h-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isArabic ? 'end' : 'start'}
                  className="w-[300px]"
                  dir={isArabic ? 'rtl' : 'ltr'}
                >
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>{isArabic ? 'الشركات المتاحة' : 'Available Companies'}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={selectAllCompanies}
                      >
                        {isArabic ? 'الكل' : 'All'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={clearAllCompanies}
                      >
                        {isArabic ? 'إلغاء' : 'Clear'}
                      </Button>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {accessibleCompanies.map((company) => (
                    <DropdownMenuCheckboxItem
                      key={company._id}
                      checked={selectedCompanyIds.includes(company._id)}
                      onCheckedChange={() => toggleCompany(company._id)}
                    >
                      <div className="flex items-center gap-2 flex-1 overflow-hidden">
                        <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate">{getCompanyName(company)}</span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quick action: Select all visible */}
              {selectedCompanyIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCompanies.slice(0, 3).map((company) => (
                    <Badge
                      key={company._id}
                      variant="secondary"
                      className="gap-1 pe-1"
                    >
                      {getCompanyName(company)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full hover:bg-slate-200"
                        onClick={() => toggleCompany(company._id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {selectedCompanies.length > 3 && (
                    <Badge variant="secondary">
                      +{selectedCompanies.length - 3} {isArabic ? 'أخرى' : 'more'}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Period & Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-navy">
                {isArabic ? 'الفترة الزمنية' : 'Time Period'}
              </Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">
                    {isArabic ? 'هذا الشهر' : 'This Month'}
                  </SelectItem>
                  <SelectItem value="last-month">
                    {isArabic ? 'الشهر الماضي' : 'Last Month'}
                  </SelectItem>
                  <SelectItem value="this-quarter">
                    {isArabic ? 'هذا الربع' : 'This Quarter'}
                  </SelectItem>
                  <SelectItem value="this-year">
                    {isArabic ? 'هذه السنة' : 'This Year'}
                  </SelectItem>
                  <SelectItem value="custom">
                    {isArabic ? 'فترة مخصصة' : 'Custom Period'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period === 'custom' && (
              <div className="space-y-3">
                <Label className="text-sm font-bold text-navy">
                  {isArabic ? 'التاريخ المخصص' : 'Custom Date Range'}
                </Label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm"
                  />
                  <span className="text-slate-500 flex items-center">
                    {isArabic ? 'إلى' : 'to'}
                  </span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Report Type */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-navy">
                {isArabic ? 'نوع التقرير' : 'Report Type'}
              </Label>
              <Select value={reportType} onValueChange={(v) => setReportType(v as ReportTypeOption)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {isArabic ? 'جميع التقارير' : 'All Reports'}
                  </SelectItem>
                  <SelectItem value="profit_loss">
                    {isArabic ? 'الأرباح والخسائر' : 'Profit & Loss'}
                  </SelectItem>
                  <SelectItem value="balance_sheet">
                    {isArabic ? 'الميزانية العمومية' : 'Balance Sheet'}
                  </SelectItem>
                  <SelectItem value="cash_flow">
                    {isArabic ? 'التدفق النقدي' : 'Cash Flow'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Base Currency */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-navy">
                {isArabic ? 'العملة الأساسية' : 'Base Currency'}
              </Label>
              <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Consolidation Method */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-navy">
                {isArabic ? 'طريقة الدمج' : 'Consolidation Method'}
              </Label>
              <Select
                value={consolidationMethod}
                onValueChange={(v) => setConsolidationMethod(v as 'full' | 'proportional')}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">
                    {isArabic ? 'دمج كامل' : 'Full Consolidation'}
                  </SelectItem>
                  <SelectItem value="proportional">
                    {isArabic ? 'دمج نسبي' : 'Proportional Consolidation'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Options */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Switch
                id="elimination-entries"
                checked={includeEliminationEntries}
                onCheckedChange={setIncludeEliminationEntries}
              />
              <Label htmlFor="elimination-entries" className="text-sm cursor-pointer">
                {isArabic ? 'عرض قيود الإلغاء' : 'Show Elimination Entries'}
              </Label>
            </div>

            <div className="flex items-center gap-2 ms-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    disabled={selectedCompanyIds.length === 0 || exportMutation.isPending}
                  >
                    <Download className="w-4 h-4 me-2" />
                    {isArabic ? 'تصدير' : 'Export'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isArabic ? 'end' : 'start'}>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    {isArabic ? 'تصدير PDF' : 'Export as PDF'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    {isArabic ? 'تصدير Excel' : 'Export as Excel'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    {isArabic ? 'تصدير CSV' : 'Export as CSV'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Summary Stats */}
          {summary && !isSummaryLoading && selectedCompanyIds.length > 0 && (
            <>
              <Separator />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy">{summary.totalCompanies}</div>
                  <div className="text-xs text-slate-500">
                    {isArabic ? 'الشركات' : 'Companies'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {summary.profitMargin.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">
                    {isArabic ? 'هامش الربح' : 'Profit Margin'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.interCompanyEliminationsCount}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isArabic ? 'قيود الإلغاء' : 'Eliminations'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {summary.currenciesInvolved.length}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isArabic ? 'العملات' : 'Currencies'}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reports Display */}
      {selectedCompanyIds.length > 0 && (
        <>
          {/* Consolidated Financial Report */}
          {(reportType === 'all' || reportType === 'profit_loss' || reportType === 'balance_sheet') && (
            <ConsolidatedFinancialReport filters={consolidationFilters} />
          )}

          {/* Inter-Company Elimination */}
          {includeEliminationEntries && (
            <InterCompanyElimination
              companyIds={selectedCompanyIds}
              startDate={dateRange.start}
              endDate={dateRange.end}
            />
          )}

          {/* Company Comparison Chart */}
          <CompanyComparisonChart
            companyIds={selectedCompanyIds}
            startDate={dateRange.start}
            endDate={dateRange.end}
          />
        </>
      )}

      {/* No Companies Selected */}
      {selectedCompanyIds.length === 0 && (
        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-12">
            <div className="text-center text-slate-500">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold mb-2">
                {isArabic ? 'لم يتم اختيار أي شركة' : 'No Companies Selected'}
              </p>
              <p className="text-sm">
                {isArabic
                  ? 'يرجى اختيار شركتين أو أكثر لعرض التقرير الموحد'
                  : 'Please select two or more companies to view the consolidated report'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

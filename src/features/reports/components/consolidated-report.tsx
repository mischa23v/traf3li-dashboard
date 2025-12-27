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
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const { accessibleCompanies } = useCompanyContext()

  // State
  const [selectedFirmIds, setSelectedFirmIds] = useState<string[]>([])
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
      firmIds: selectedFirmIds,
      startDate: dateRange.start,
      endDate: dateRange.end,
      reportType,
      includeEliminationEntries,
      baseCurrency,
      consolidationMethod,
    }),
    [selectedFirmIds, dateRange, reportType, includeEliminationEntries, baseCurrency, consolidationMethod]
  )

  // Fetch consolidation summary
  const { data: summary, isLoading: isSummaryLoading } = useConsolidationSummary(consolidationFilters)
  const exportMutation = useExportConsolidatedReport()

  // Get company name
  const getCompanyName = (company: Company) => {
    return isArabic ? company.nameAr || company.name : company.name
  }

  // Handle company selection
  const toggleCompany = (firmId: string) => {
    setSelectedFirmIds((prev) =>
      prev.includes(firmId) ? prev.filter((id) => id !== firmId) : [...prev, firmId]
    )
  }

  const selectAllCompanies = () => {
    setSelectedFirmIds(accessibleCompanies.map((c) => c._id))
  }

  const clearAllCompanies = () => {
    setSelectedFirmIds([])
  }

  // Handle export
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (selectedFirmIds.length === 0) {
      return
    }
    exportMutation.mutate({ filters: consolidationFilters, format })
  }

  // Get selected companies
  const selectedCompanies = useMemo(
    () => accessibleCompanies.filter((c) => selectedFirmIds.includes(c._id)),
    [accessibleCompanies, selectedFirmIds]
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
            {t('reports.consolidatedReport.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {/* Company Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-navy">
              {t('reports.consolidatedReport.selectCompanies')}
              {selectedFirmIds.length > 0 && (
                <Badge variant="secondary" className="ms-2">
                  {selectedFirmIds.length}
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
                      selectedFirmIds.length === 0 && 'text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {selectedFirmIds.length === 0
                          ? t('reports.consolidatedReport.selectCompaniesPlaceholder')
                          : selectedFirmIds.length === 1
                          ? getCompanyName(selectedCompanies[0])
                          : `${selectedFirmIds.length} ${t('reports.consolidatedReport.companies')}`}
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
                    <span>{t('reports.consolidatedReport.availableCompanies')}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={selectAllCompanies}
                      >
                        {t('reports.consolidatedReport.all')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={clearAllCompanies}
                      >
                        {t('reports.consolidatedReport.clear')}
                      </Button>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {accessibleCompanies.map((company) => (
                    <DropdownMenuCheckboxItem
                      key={company._id}
                      checked={selectedFirmIds.includes(company._id)}
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
              {selectedFirmIds.length > 0 && (
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
                      +{selectedCompanies.length - 3} {t('reports.consolidatedReport.more')}
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
                {t('reports.consolidatedReport.timePeriod')}
              </Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">
                    {t('reports.consolidatedReport.thisMonth')}
                  </SelectItem>
                  <SelectItem value="last-month">
                    {t('reports.consolidatedReport.lastMonth')}
                  </SelectItem>
                  <SelectItem value="this-quarter">
                    {t('reports.consolidatedReport.thisQuarter')}
                  </SelectItem>
                  <SelectItem value="this-year">
                    {t('reports.consolidatedReport.thisYear')}
                  </SelectItem>
                  <SelectItem value="custom">
                    {t('reports.consolidatedReport.customPeriod')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period === 'custom' && (
              <div className="space-y-3">
                <Label className="text-sm font-bold text-navy">
                  {t('reports.consolidatedReport.customDateRange')}
                </Label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-sm"
                  />
                  <span className="text-slate-500 flex items-center">
                    {t('reports.consolidatedReport.to')}
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
                {t('reports.consolidatedReport.reportType')}
              </Label>
              <Select value={reportType} onValueChange={(v) => setReportType(v as ReportTypeOption)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('reports.consolidatedReport.allReports')}
                  </SelectItem>
                  <SelectItem value="profit_loss">
                    {t('reports.consolidatedReport.profitLoss')}
                  </SelectItem>
                  <SelectItem value="balance_sheet">
                    {t('reports.consolidatedReport.balanceSheet')}
                  </SelectItem>
                  <SelectItem value="cash_flow">
                    {t('reports.consolidatedReport.cashFlow')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Base Currency */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-navy">
                {t('reports.consolidatedReport.baseCurrency')}
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
                {t('reports.consolidatedReport.consolidationMethod')}
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
                    {t('reports.consolidatedReport.fullConsolidation')}
                  </SelectItem>
                  <SelectItem value="proportional">
                    {t('reports.consolidatedReport.proportionalConsolidation')}
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
                {t('reports.consolidatedReport.showEliminationEntries')}
              </Label>
            </div>

            <div className="flex items-center gap-2 ms-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    disabled={selectedFirmIds.length === 0 || exportMutation.isPending}
                  >
                    <Download className="w-4 h-4 me-2" />
                    {t('reports.consolidatedReport.export')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isArabic ? 'end' : 'start'}>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    {t('reports.consolidatedReport.exportPDF')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    {t('reports.consolidatedReport.exportExcel')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    {t('reports.consolidatedReport.exportCSV')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Summary Stats */}
          {summary && !isSummaryLoading && selectedFirmIds.length > 0 && (
            <>
              <Separator />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy">{summary.totalCompanies}</div>
                  <div className="text-xs text-slate-500">
                    {t('reports.consolidatedReport.companiesLabel')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {summary.profitMargin.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">
                    {t('reports.consolidatedReport.profitMargin')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.interCompanyEliminationsCount}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t('reports.consolidatedReport.eliminations')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {summary.currenciesInvolved.length}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t('reports.consolidatedReport.currencies')}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reports Display */}
      {selectedFirmIds.length > 0 && (
        <>
          {/* Consolidated Financial Report */}
          {(reportType === 'all' || reportType === 'profit_loss' || reportType === 'balance_sheet') && (
            <ConsolidatedFinancialReport filters={consolidationFilters} />
          )}

          {/* Inter-Company Elimination */}
          {includeEliminationEntries && (
            <InterCompanyElimination
              firmIds={selectedFirmIds}
              startDate={dateRange.start}
              endDate={dateRange.end}
            />
          )}

          {/* Company Comparison Chart */}
          <CompanyComparisonChart
            firmIds={selectedFirmIds}
            startDate={dateRange.start}
            endDate={dateRange.end}
          />
        </>
      )}

      {/* No Companies Selected */}
      {selectedFirmIds.length === 0 && (
        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-12">
            <div className="text-center text-slate-500">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-semibold mb-2">
                {t('reports.consolidatedReport.noCompaniesSelected')}
              </p>
              <p className="text-sm">
                {t('reports.consolidatedReport.selectTwoOrMore')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

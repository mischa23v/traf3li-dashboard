/**
 * Company Comparison Chart Component
 * Compare metrics across companies with bar charts and ranking tables
 */

import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  TrendingUp,
  Trophy,
  Medal,
  Award,
  ChevronDown,
  Building2,
  DollarSign,
  Percent,
  TrendingDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatSAR } from '@/lib/currency'
import { useCompanyComparisons } from '@/hooks/useConsolidatedReport'
import type { CompanyMetricComparison } from '@/services/consolidatedReportService'

interface CompanyComparisonChartProps {
  firmIds: string[]
  startDate: string
  endDate: string
}

// Available metrics
const AVAILABLE_METRICS = [
  { value: 'revenue', labelEn: 'Revenue', labelAr: 'الإيرادات', type: 'currency' as const },
  { value: 'expenses', labelEn: 'Expenses', labelAr: 'المصروفات', type: 'currency' as const },
  { value: 'profit', labelEn: 'Net Profit', labelAr: 'الربح الصافي', type: 'currency' as const },
  { value: 'margin', labelEn: 'Profit Margin', labelAr: 'هامش الربح', type: 'percentage' as const },
  { value: 'growth', labelEn: 'Growth Rate', labelAr: 'معدل النمو', type: 'percentage' as const },
  { value: 'efficiency', labelEn: 'Efficiency', labelAr: 'الكفاءة', type: 'percentage' as const },
]

export function CompanyComparisonChart({
  firmIds,
  startDate,
  endDate,
}: CompanyComparisonChartProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Selected metrics to display
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue', 'profit', 'margin'])
  const [activeMetric, setActiveMetric] = useState<string>('revenue')

  // Fetch comparisons
  const {
    data: comparisons,
    isLoading,
    error,
  } = useCompanyComparisons(firmIds, startDate, endDate, selectedMetrics)

  // Format value based on type
  const formatValue = (value: number, unit: 'currency' | 'percentage' | 'number') => {
    switch (unit) {
      case 'currency':
        return formatSAR(value / 100)
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'number':
        return value.toLocaleString()
      default:
        return value.toString()
    }
  }

  // Toggle metric selection
  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      if (selectedMetrics.length > 1) {
        setSelectedMetrics(selectedMetrics.filter((m) => m !== metric))
        if (activeMetric === metric) {
          setActiveMetric(selectedMetrics.find((m) => m !== metric) || selectedMetrics[0])
        }
      }
    } else {
      setSelectedMetrics([...selectedMetrics, metric])
    }
  }

  // Get active comparison data
  const activeComparison = useMemo(() => {
    return comparisons?.find((c) => c.metric === activeMetric)
  }, [comparisons, activeMetric])

  // Get metric label
  const getMetricLabel = (metricValue: string) => {
    const metric = AVAILABLE_METRICS.find((m) => m.value === metricValue)
    return isArabic ? metric?.labelAr : metric?.labelEn
  }

  // Get rank badge
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1 text-amber-600">
          <Trophy className="w-4 h-4" />
          <span className="text-xs font-bold">{isArabic ? 'الأول' : '1st'}</span>
        </div>
      )
    } else if (rank === 2) {
      return (
        <div className="flex items-center gap-1 text-slate-500">
          <Medal className="w-4 h-4" />
          <span className="text-xs font-bold">{isArabic ? 'الثاني' : '2nd'}</span>
        </div>
      )
    } else if (rank === 3) {
      return (
        <div className="flex items-center gap-1 text-orange-600">
          <Award className="w-4 h-4" />
          <span className="text-xs font-bold">{isArabic ? 'الثالث' : '3rd'}</span>
        </div>
      )
    }
    return <span className="text-xs text-slate-500">#{rank}</span>
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

  if (!comparisons || comparisons.length === 0) {
    return null
  }

  return (
    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4 pt-6 px-8">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-navy flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            {isArabic ? 'مقارنة الشركات' : 'Company Comparison'}
          </CardTitle>

          {/* Metric Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl gap-2">
                {isArabic ? 'المؤشرات' : 'Metrics'}
                <Badge variant="secondary">{selectedMetrics.length}</Badge>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isArabic ? 'end' : 'start'} className="w-56">
              <DropdownMenuLabel>{isArabic ? 'اختر المؤشرات' : 'Select Metrics'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {AVAILABLE_METRICS.map((metric) => (
                <DropdownMenuCheckboxItem
                  key={metric.value}
                  checked={selectedMetrics.includes(metric.value)}
                  onCheckedChange={() => toggleMetric(metric.value)}
                  disabled={selectedMetrics.includes(metric.value) && selectedMetrics.length === 1}
                >
                  {isArabic ? metric.labelAr : metric.labelEn}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        {/* Metric Tabs */}
        <div className="flex flex-wrap gap-2">
          {selectedMetrics.map((metric) => {
            const metricInfo = AVAILABLE_METRICS.find((m) => m.value === metric)
            return (
              <Button
                key={metric}
                variant={activeMetric === metric ? 'default' : 'outline'}
                size="sm"
                className="rounded-xl"
                onClick={() => setActiveMetric(metric)}
              >
                {isArabic ? metricInfo?.labelAr : metricInfo?.labelEn}
              </Button>
            )
          })}
        </div>

        {activeComparison && (
          <>
            {/* Summary Stats */}
            {(activeComparison.total !== undefined || activeComparison.average !== undefined) && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {activeComparison.total !== undefined && (
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                    <div className="text-xs text-blue-600 mb-1">{isArabic ? 'الإجمالي' : 'Total'}</div>
                    <div className="text-xl font-bold text-blue-900">
                      {formatValue(activeComparison.total, activeComparison.unit)}
                    </div>
                  </div>
                )}
                {activeComparison.average !== undefined && (
                  <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                    <div className="text-xs text-purple-600 mb-1">{isArabic ? 'المتوسط' : 'Average'}</div>
                    <div className="text-xl font-bold text-purple-900">
                      {formatValue(activeComparison.average, activeComparison.unit)}
                    </div>
                  </div>
                )}
                {activeComparison.median !== undefined && (
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                    <div className="text-xs text-emerald-600 mb-1">{isArabic ? 'الوسيط' : 'Median'}</div>
                    <div className="text-xl font-bold text-emerald-900">
                      {formatValue(activeComparison.median, activeComparison.unit)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bar Chart */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700">
                {isArabic ? 'مخطط المقارنة' : 'Comparison Chart'}
              </h3>
              <div className="space-y-2">
                {activeComparison.byCompany
                  .sort((a, b) => a.rank - b.rank)
                  .map((company) => {
                    const maxValue = Math.max(...activeComparison.byCompany.map((c) => c.value))
                    const percentage = maxValue > 0 ? (company.value / maxValue) * 100 : 0

                    return (
                      <div key={company.firmId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 overflow-hidden">
                            {getRankBadge(company.rank)}
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-sm font-semibold text-slate-700 truncate">
                              {isArabic
                                ? company.companyNameAr || company.companyName
                                : company.companyName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {company.percentageOfTotal !== undefined && (
                              <Badge variant="secondary" className="text-xs">
                                {company.percentageOfTotal.toFixed(1)}%
                              </Badge>
                            )}
                            <span className="text-sm font-bold text-navy min-w-[100px] text-end">
                              {formatValue(company.value, activeComparison.unit)}
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={percentage}
                          className="h-3"
                          indicatorClassName={cn(
                            company.rank === 1
                              ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                              : company.rank === 2
                              ? 'bg-gradient-to-r from-slate-300 to-slate-500'
                              : company.rank === 3
                              ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                              : 'bg-gradient-to-r from-blue-400 to-blue-600'
                          )}
                        />
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Ranking Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700">
                {isArabic ? 'جدول الترتيب' : 'Ranking Table'}
              </h3>
              <div className="rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-start px-4 py-3 text-xs font-bold text-slate-600">
                        {isArabic ? 'الترتيب' : 'Rank'}
                      </th>
                      <th className="text-start px-4 py-3 text-xs font-bold text-slate-600">
                        {isArabic ? 'الشركة' : 'Company'}
                      </th>
                      <th className="text-end px-4 py-3 text-xs font-bold text-slate-600">
                        {getMetricLabel(activeMetric)}
                      </th>
                      {activeComparison.byCompany.some((c) => c.percentageOfTotal !== undefined) && (
                        <th className="text-end px-4 py-3 text-xs font-bold text-slate-600">
                          {isArabic ? 'النسبة' : '% of Total'}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeComparison.byCompany
                      .sort((a, b) => a.rank - b.rank)
                      .map((company) => (
                        <tr key={company.firmId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getRankBadge(company.rank)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-700">
                                {isArabic
                                  ? company.companyNameAr || company.companyName
                                  : company.companyName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-end">
                            <span className="text-sm font-bold text-navy">
                              {formatValue(company.value, activeComparison.unit)}
                            </span>
                          </td>
                          {company.percentageOfTotal !== undefined && (
                            <td className="px-4 py-3 text-end">
                              <Badge variant="secondary" className="text-xs">
                                {company.percentageOfTotal.toFixed(1)}%
                              </Badge>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

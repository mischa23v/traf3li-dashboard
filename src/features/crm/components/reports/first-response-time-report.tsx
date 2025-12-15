import { useState, useMemo, lazy, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Download,
  FileText,
  Filter,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import { ChartSkeleton } from '@/utils/lazy-import'

// Lazy load Recharts components
const BarChart = lazy(() => import('recharts').then((mod) => ({ default: mod.BarChart })))
const Bar = lazy(() => import('recharts').then((mod) => ({ default: mod.Bar })))
const XAxis = lazy(() => import('recharts').then((mod) => ({ default: mod.XAxis })))
const YAxis = lazy(() => import('recharts').then((mod) => ({ default: mod.YAxis })))
const CartesianGrid = lazy(() => import('recharts').then((mod) => ({ default: mod.CartesianGrid })))
const Tooltip = lazy(() => import('recharts').then((mod) => ({ default: mod.Tooltip })))
const ResponsiveContainer = lazy(() => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })))
const Legend = lazy(() => import('recharts').then((mod) => ({ default: mod.Legend })))

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Format duration in minutes to human-readable format
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "2h 15m", "45m", "1d 3h")
 */
const formatDuration = (minutes: number): string => {
  if (minutes < 1) return '< 1m'
  if (minutes < 60) return `${Math.round(minutes)}m`

  const days = Math.floor(minutes / (24 * 60))
  const hours = Math.floor((minutes % (24 * 60)) / 60)
  const mins = Math.round(minutes % 60)

  if (days > 0) {
    if (hours > 0) return `${days}d ${hours}h`
    return `${days}d`
  }

  if (hours > 0) {
    if (mins > 0) return `${hours}h ${mins}m`
    return `${hours}h`
  }

  return `${mins}m`
}

/**
 * Get color class based on response time performance
 */
const getResponseTimeColor = (minutes: number): string => {
  if (minutes <= 60) return 'text-emerald-600' // Within 1 hour - excellent
  if (minutes <= 240) return 'text-blue-600' // Within 4 hours - good
  if (minutes <= 1440) return 'text-amber-600' // Within 24 hours - acceptable
  return 'text-red-600' // Over 24 hours - needs improvement
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type DateGrouping = 'day' | 'week' | 'month'

interface FirstResponseTimeFilters {
  startDate: string
  endDate: string
  salesPerson?: string
  leadSource?: string
  territory?: string
  groupBy: DateGrouping
}

interface ResponseTimeMetrics {
  avgResponseTime: number // in minutes
  medianResponseTime: number // in minutes
  minResponseTime: number // in minutes
  maxResponseTime: number // in minutes
  within1Hour: number // percentage
  within24Hours: number // percentage
  totalLeads: number
}

interface SalesPersonMetrics {
  salesPersonId: string
  salesPersonName: string
  avgResponseTime: number
  medianResponseTime: number
  totalLeads: number
  within1Hour: number
  within24Hours: number
}

interface TimeDistribution {
  range: string
  rangeAr: string
  count: number
  percentage: number
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function FirstResponseTimeReport() {
  // Get default dates (last 30 days)
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [filters, setFilters] = useState<FirstResponseTimeFilters>({
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    groupBy: 'day',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'overview' | 'bySalesPerson'>('overview')

  // Mock data - will be replaced with API
  const mockMetrics: ResponseTimeMetrics = {
    avgResponseTime: 145, // 2h 25m
    medianResponseTime: 95, // 1h 35m
    minResponseTime: 5, // 5m
    maxResponseTime: 1820, // 1d 6h 20m
    within1Hour: 45.5,
    within24Hours: 87.3,
    totalLeads: 156,
  }

  const mockSalesPersonData: SalesPersonMetrics[] = [
    {
      salesPersonId: '1',
      salesPersonName: 'أحمد محمد',
      avgResponseTime: 85,
      medianResponseTime: 72,
      totalLeads: 45,
      within1Hour: 62.2,
      within24Hours: 95.6,
    },
    {
      salesPersonId: '2',
      salesPersonName: 'فاطمة علي',
      avgResponseTime: 125,
      medianResponseTime: 98,
      totalLeads: 38,
      within1Hour: 47.4,
      within24Hours: 89.5,
    },
    {
      salesPersonId: '3',
      salesPersonName: 'محمد حسن',
      avgResponseTime: 195,
      medianResponseTime: 156,
      totalLeads: 42,
      within1Hour: 31.0,
      within24Hours: 78.6,
    },
    {
      salesPersonId: '4',
      salesPersonName: 'سارة عبدالله',
      avgResponseTime: 165,
      medianResponseTime: 142,
      totalLeads: 31,
      within1Hour: 35.5,
      within24Hours: 83.9,
    },
  ]

  const mockDistribution: TimeDistribution[] = [
    { range: '0-15 min', rangeAr: '0-15 دقيقة', count: 28, percentage: 17.9 },
    { range: '15-30 min', rangeAr: '15-30 دقيقة', count: 22, percentage: 14.1 },
    { range: '30-60 min', rangeAr: '30-60 دقيقة', count: 21, percentage: 13.5 },
    { range: '1-2 hours', rangeAr: '1-2 ساعة', count: 31, percentage: 19.9 },
    { range: '2-4 hours', rangeAr: '2-4 ساعات', count: 24, percentage: 15.4 },
    { range: '4-8 hours', rangeAr: '4-8 ساعات', count: 15, percentage: 9.6 },
    { range: '8-24 hours', rangeAr: '8-24 ساعة', count: 10, percentage: 6.4 },
    { range: '> 24 hours', rangeAr: '> 24 ساعة', count: 5, percentage: 3.2 },
  ]

  const handleExport = (format: 'csv' | 'pdf') => {
    // Placeholder for export functionality
    console.log(`Exporting as ${format}`, filters)
    // In production: exportReport.mutate({ type: 'first-response-time', format, filters })
  }

  const updateFilter = (key: keyof FirstResponseTimeFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <span>العملاء والتواصل</span>
          <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
          <span>التقارير</span>
          <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
          <span className="text-foreground">زمن الاستجابة الأولى</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 ms-2" aria-hidden="true" />
            فلترة
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 ms-2" aria-hidden="true" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 ms-2" aria-hidden="true" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>من تاريخ</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateFilter('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>إلى تاريخ</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => updateFilter('endDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>موظف المبيعات</Label>
                <Select
                  value={filters.salesPerson || 'all'}
                  onValueChange={(value) => updateFilter('salesPerson', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الموظفين" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الموظفين</SelectItem>
                    {mockSalesPersonData.map((sp) => (
                      <SelectItem key={sp.salesPersonId} value={sp.salesPersonId}>
                        {sp.salesPersonName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>مصدر العميل المحتمل</Label>
                <Select
                  value={filters.leadSource || 'all'}
                  onValueChange={(value) => updateFilter('leadSource', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع المصادر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المصادر</SelectItem>
                    <SelectItem value="website">الموقع الإلكتروني</SelectItem>
                    <SelectItem value="referral">إحالة</SelectItem>
                    <SelectItem value="social">وسائل التواصل</SelectItem>
                    <SelectItem value="ads">إعلانات</SelectItem>
                    <SelectItem value="walkin">زيارة مباشرة</SelectItem>
                    <SelectItem value="cold_call">اتصال بارد</SelectItem>
                    <SelectItem value="event">حدث</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>التجميع حسب</Label>
                <Select
                  value={filters.groupBy}
                  onValueChange={(value) => updateFilter('groupBy', value as DateGrouping)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">يوم</SelectItem>
                    <SelectItem value="week">أسبوع</SelectItem>
                    <SelectItem value="month">شهر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-slate-600">متوسط زمن الاستجابة</p>
                <p className="text-2xl font-bold">
                  {formatDuration(mockMetrics.avgResponseTime)}
                </p>
                <p className="text-xs text-slate-500">
                  الوسيط: {formatDuration(mockMetrics.medianResponseTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-slate-600">خلال ساعة واحدة</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {mockMetrics.within1Hour.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">
                  {Math.round((mockMetrics.within1Hour / 100) * mockMetrics.totalLeads)} من {mockMetrics.totalLeads}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Target className="h-6 w-6 text-amber-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-slate-600">خلال 24 ساعة</p>
                <p className="text-2xl font-bold text-amber-600">
                  {mockMetrics.within24Hours.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">
                  {Math.round((mockMetrics.within24Hours / 100) * mockMetrics.totalLeads)} من {mockMetrics.totalLeads}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">النطاق الزمني</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-bold text-emerald-600">
                    {formatDuration(mockMetrics.minResponseTime)}
                  </p>
                  <span className="text-slate-400">-</span>
                  <p className="text-lg font-bold text-red-600">
                    {formatDuration(mockMetrics.maxResponseTime)}
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  الحد الأدنى - الحد الأقصى
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'overview' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('overview')}
        >
          <BarChart3 className="h-4 w-4 ms-2" />
          نظرة عامة
        </Button>
        <Button
          variant={viewMode === 'bySalesPerson' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('bySalesPerson')}
        >
          <Users className="h-4 w-4 ms-2" aria-hidden="true" />
          حسب موظف المبيعات
        </Button>
      </div>

      {/* Response Time Distribution Chart */}
      {viewMode === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              توزيع أوقات الاستجابة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={mockDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="rangeAr"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    label={{ value: 'عدد العملاء المحتملين', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                            <p className="font-medium">{payload[0].payload.rangeAr}</p>
                            <p className="text-sm text-slate-600">
                              العدد: {payload[0].value}
                            </p>
                            <p className="text-sm text-emerald-600">
                              النسبة: {payload[0].payload.percentage.toFixed(1)}%
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Suspense>
          </CardContent>
        </Card>
      )}

      {/* By Sales Person View */}
      {viewMode === 'bySalesPerson' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" aria-hidden="true" />
              الأداء حسب موظف المبيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>موظف المبيعات</TableHead>
                  <TableHead className="text-center">العملاء المحتملين</TableHead>
                  <TableHead className="text-center">متوسط الاستجابة</TableHead>
                  <TableHead className="text-center">الوسيط</TableHead>
                  <TableHead className="text-center">خلال ساعة</TableHead>
                  <TableHead className="text-center">خلال 24 ساعة</TableHead>
                  <TableHead className="text-center">التقييم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSalesPersonData
                  .sort((a, b) => a.avgResponseTime - b.avgResponseTime)
                  .map((sp) => (
                    <TableRow key={sp.salesPersonId}>
                      <TableCell className="font-medium">{sp.salesPersonName}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{sp.totalLeads}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${getResponseTimeColor(sp.avgResponseTime)}`}>
                          {formatDuration(sp.avgResponseTime)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-slate-600">
                        {formatDuration(sp.medianResponseTime)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-emerald-600">
                            {sp.within1Hour.toFixed(1)}%
                          </span>
                          <span className="text-xs text-slate-500">
                            {Math.round((sp.within1Hour / 100) * sp.totalLeads)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-medium text-amber-600">
                            {sp.within24Hours.toFixed(1)}%
                          </span>
                          <span className="text-xs text-slate-500">
                            {Math.round((sp.within24Hours / 100) * sp.totalLeads)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {sp.within1Hour >= 60 ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            ممتاز
                          </Badge>
                        ) : sp.within1Hour >= 45 ? (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            جيد
                          </Badge>
                        ) : sp.within1Hour >= 30 ? (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            مقبول
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            يحتاج تحسين
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detailed Distribution Table */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع تفصيلي لأوقات الاستجابة</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>النطاق الزمني</TableHead>
                <TableHead className="text-center">عدد العملاء المحتملين</TableHead>
                <TableHead className="text-center">النسبة المئوية</TableHead>
                <TableHead>التوزيع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDistribution.map((dist) => (
                <TableRow key={dist.range}>
                  <TableCell className="font-medium">{dist.rangeAr}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{dist.count}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {dist.percentage.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${dist.percentage}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

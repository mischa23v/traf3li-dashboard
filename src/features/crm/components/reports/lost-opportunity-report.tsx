import { useState, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'
import {
  Download,
  FileText,
  Filter,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Clock,
  Users,
  X,
} from 'lucide-react'
import { ChartSkeleton } from '@/utils/lazy-import'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'

// Lazy load Recharts components
const Pie = lazy(() => import('recharts').then((mod) => ({ default: mod.Pie })))
const PieChart = lazy(() => import('recharts').then((mod) => ({ default: mod.PieChart })))
const Cell = lazy(() => import('recharts').then((mod) => ({ default: mod.Cell })))
const ResponsiveContainer = lazy(() => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })))
const Legend = lazy(() => import('recharts').then((mod) => ({ default: mod.Legend })))
const Tooltip = lazy(() => import('recharts').then((mod) => ({ default: mod.Tooltip })))

// Types
interface LostOpportunity {
  id: string
  caseNumber: string
  leadClientName: string
  caseType: string
  lostReason: string
  lostCategory: string
  lostDetail: string
  competitor: string
  stageWhenLost: string
  estimatedValue: number
  daysInPipeline: number
  lostDate: string
  salesPerson: string
}

interface LostOpportunityFilters {
  startDate: string
  endDate: string
  lostReason: string
  competitor: string
  salesPerson: string
  caseType: string
}

interface LostOpportunitySummary {
  totalLost: number
  totalValueLost: number
  topReason: { reason: string; count: number }
  topCompetitor: { name: string; count: number }
}

// Chart colors
const CHART_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export function LostOpportunityReport() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<LostOpportunityFilters>({
    startDate: '',
    endDate: '',
    lostReason: '',
    competitor: '',
    salesPerson: '',
    caseType: '',
  })

  // Mock data for development (will be replaced by API)
  const mockSummary: LostOpportunitySummary = {
    totalLost: 42,
    totalValueLost: 2850000,
    topReason: { reason: 'السعر مرتفع', count: 15 },
    topCompetitor: { name: 'مكتب النور القانوني', count: 8 },
  }

  const mockOpportunities: LostOpportunity[] = [
    {
      id: '1',
      caseNumber: 'CASE-2025-001',
      leadClientName: 'شركة المستقبل للتجارة',
      caseType: 'قضية تجارية',
      lostReason: 'السعر مرتفع',
      lostCategory: 'التسعير',
      lostDetail: 'العميل وجد عرض أقل من منافس',
      competitor: 'مكتب النور القانوني',
      stageWhenLost: 'عرض السعر',
      estimatedValue: 120000,
      daysInPipeline: 15,
      lostDate: '2025-11-20',
      salesPerson: 'أحمد محمد',
    },
    {
      id: '2',
      caseNumber: 'CASE-2025-002',
      leadClientName: 'مؤسسة الأمان التجارية',
      caseType: 'قضية عقارية',
      lostReason: 'عدم الاستجابة',
      lostCategory: 'التواصل',
      lostDetail: 'العميل لم يرد على المتابعات',
      competitor: '-',
      stageWhenLost: 'مكالمة أولية',
      estimatedValue: 85000,
      daysInPipeline: 8,
      lostDate: '2025-11-18',
      salesPerson: 'فاطمة علي',
    },
    {
      id: '3',
      caseNumber: 'CASE-2025-003',
      leadClientName: 'شركة التقنية الحديثة',
      caseType: 'قضية تجارية',
      lostReason: 'اختار منافس آخر',
      lostCategory: 'المنافسة',
      lostDetail: 'فضل المنافس لوجود علاقة سابقة',
      competitor: 'مكتب العدالة للمحاماة',
      stageWhenLost: 'عرض السعر',
      estimatedValue: 200000,
      daysInPipeline: 22,
      lostDate: '2025-11-15',
      salesPerson: 'أحمد محمد',
    },
    {
      id: '4',
      caseNumber: 'CASE-2025-004',
      leadClientName: 'مجموعة الخليج الاستثمارية',
      caseType: 'قضية مالية',
      lostReason: 'توقيت غير مناسب',
      lostCategory: 'التوقيت',
      lostDetail: 'العميل قرر تأجيل القضية',
      competitor: '-',
      stageWhenLost: 'مفاوضات',
      estimatedValue: 150000,
      daysInPipeline: 18,
      lostDate: '2025-11-10',
      salesPerson: 'سارة أحمد',
    },
    {
      id: '5',
      caseNumber: 'CASE-2025-005',
      leadClientName: 'شركة البناء الوطنية',
      caseType: 'قضية عمالية',
      lostReason: 'السعر مرتفع',
      lostCategory: 'التسعير',
      lostDetail: 'تجاوز العرض ميزانية العميل',
      competitor: 'مكتب الشريعة والقانون',
      stageWhenLost: 'عرض السعر',
      estimatedValue: 95000,
      daysInPipeline: 12,
      lostDate: '2025-11-05',
      salesPerson: 'فاطمة علي',
    },
  ]

  // Calculate lost reasons distribution for pie chart
  const lostReasonsData = mockOpportunities.reduce((acc, opp) => {
    const existing = acc.find(item => item.name === opp.lostReason)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: opp.lostReason, value: 1 })
    }
    return acc
  }, [] as { name: string; value: number }[])

  const handleExport = (format: 'csv' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'dd/MM/yyyy', { locale: isRtl ? arSA : enUS })
  }

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      lostReason: '',
      competitor: '',
      salesPerson: '',
      caseType: '',
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy">
            {isRtl ? 'تحليل الفرص الضائعة' : 'Lost Opportunity Analysis'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isRtl
              ? 'تحليل شامل للعملاء المحتملين والفرص التي تم فقدانها'
              : 'Comprehensive analysis of lost leads and opportunities'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-slate-100' : ''}
          >
            <Filter className="h-4 w-4 ms-2" aria-hidden="true" />
            {isRtl ? 'فلترة' : 'Filter'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{isRtl ? 'من تاريخ' : 'Start Date'}</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? 'إلى تاريخ' : 'End Date'}</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? 'سبب الضياع' : 'Lost Reason'}</Label>
                <Select
                  value={filters.lostReason}
                  onValueChange={(value) => setFilters({ ...filters, lostReason: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRtl ? 'جميع الأسباب' : 'All Reasons'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{isRtl ? 'جميع الأسباب' : 'All Reasons'}</SelectItem>
                    <SelectItem value="price">{isRtl ? 'السعر مرتفع' : 'Price Too High'}</SelectItem>
                    <SelectItem value="no-response">{isRtl ? 'عدم الاستجابة' : 'No Response'}</SelectItem>
                    <SelectItem value="competitor">{isRtl ? 'اختار منافس آخر' : 'Chose Competitor'}</SelectItem>
                    <SelectItem value="timing">{isRtl ? 'توقيت غير مناسب' : 'Bad Timing'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? 'المنافس' : 'Competitor'}</Label>
                <Select
                  value={filters.competitor}
                  onValueChange={(value) => setFilters({ ...filters, competitor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRtl ? 'جميع المنافسين' : 'All Competitors'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{isRtl ? 'جميع المنافسين' : 'All Competitors'}</SelectItem>
                    <SelectItem value="noor">{isRtl ? 'مكتب النور القانوني' : 'Al Noor Law Firm'}</SelectItem>
                    <SelectItem value="adala">{isRtl ? 'مكتب العدالة للمحاماة' : 'Al Adala Law Office'}</SelectItem>
                    <SelectItem value="sharia">{isRtl ? 'مكتب الشريعة والقانون' : 'Sharia & Law Office'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? 'موظف المبيعات' : 'Sales Person'}</Label>
                <Select
                  value={filters.salesPerson}
                  onValueChange={(value) => setFilters({ ...filters, salesPerson: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRtl ? 'جميع الموظفين' : 'All Employees'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{isRtl ? 'جميع الموظفين' : 'All Employees'}</SelectItem>
                    <SelectItem value="ahmed">{isRtl ? 'أحمد محمد' : 'Ahmed Mohammed'}</SelectItem>
                    <SelectItem value="fatima">{isRtl ? 'فاطمة علي' : 'Fatima Ali'}</SelectItem>
                    <SelectItem value="sara">{isRtl ? 'سارة أحمد' : 'Sara Ahmed'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? 'نوع القضية' : 'Case Type'}</Label>
                <Select
                  value={filters.caseType}
                  onValueChange={(value) => setFilters({ ...filters, caseType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRtl ? 'جميع الأنواع' : 'All Types'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{isRtl ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                    <SelectItem value="commercial">{isRtl ? 'قضية تجارية' : 'Commercial Case'}</SelectItem>
                    <SelectItem value="real-estate">{isRtl ? 'قضية عقارية' : 'Real Estate Case'}</SelectItem>
                    <SelectItem value="financial">{isRtl ? 'قضية مالية' : 'Financial Case'}</SelectItem>
                    <SelectItem value="labor">{isRtl ? 'قضية عمالية' : 'Labor Case'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-4">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 ms-2" aria-hidden="true" />
                  {isRtl ? 'إزالة جميع الفلاتر' : 'Clear All Filters'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  {isRtl ? 'إجمالي الفرص الضائعة' : 'Total Lost Opportunities'}
                </p>
                <p className="text-2xl font-bold text-navy">{mockSummary.totalLost}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  {isRtl ? 'قيمة الفرص الضائعة' : 'Total Value Lost'}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(mockSummary.totalValueLost)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  {isRtl ? 'السبب الأكثر شيوعاً' : 'Top Lost Reason'}
                </p>
                <p className="text-base font-bold text-navy">{mockSummary.topReason.reason}</p>
                <p className="text-xs text-slate-500">
                  {mockSummary.topReason.count} {isRtl ? 'حالة' : 'cases'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  {isRtl ? 'المنافس الأكثر تأثيراً' : 'Top Competitor'}
                </p>
                <p className="text-base font-bold text-navy truncate max-w-[150px]">
                  {mockSummary.topCompetitor.name}
                </p>
                <p className="text-xs text-slate-500">
                  {mockSummary.topCompetitor.count} {isRtl ? 'حالة' : 'cases'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Lost Reasons Pie Chart */}
        <Card className="border-0 shadow-sm rounded-3xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-navy">
              {isRtl ? 'توزيع أسباب الضياع' : 'Lost Reasons Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Suspense fallback={<ChartSkeleton />}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={lostReasonsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {lostReasonsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Suspense>
            <div className="mt-4 space-y-2">
              {lostReasonsData.map((reason, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-slate-700">{reason.name}</span>
                  </div>
                  <span className="font-medium text-navy">{reason.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lost Opportunities Table */}
        <Card className="border-0 shadow-sm rounded-3xl lg:col-span-2">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-navy">
                {isRtl ? 'تفاصيل الفرص الضائعة' : 'Lost Opportunities Details'}
              </CardTitle>
              <Badge variant="outline" className="border-slate-200">
                {mockOpportunities.length} {isRtl ? 'فرصة' : 'opportunities'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="text-end font-bold text-slate-700 whitespace-nowrap">
                      {isRtl ? 'رقم القضية' : 'Case #'}
                    </TableHead>
                    <TableHead className="text-end font-bold text-slate-700 whitespace-nowrap">
                      {isRtl ? 'اسم العميل/العميل المحتمل' : 'Lead/Client Name'}
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-700 whitespace-nowrap">
                      {isRtl ? 'نوع القضية' : 'Case Type'}
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-700 whitespace-nowrap">
                      {isRtl ? 'سبب الضياع' : 'Lost Reason'}
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-700 whitespace-nowrap">
                      {isRtl ? 'المنافس' : 'Competitor'}
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-700 whitespace-nowrap">
                      {isRtl ? 'المرحلة' : 'Stage'}
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-700 whitespace-nowrap">
                      {isRtl ? 'القيمة المقدرة' : 'Est. Value'}
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-700 whitespace-nowrap">
                      {isRtl ? 'الأيام' : 'Days'}
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-700 whitespace-nowrap">
                      {isRtl ? 'تاريخ الضياع' : 'Lost Date'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOpportunities.map((opp) => (
                    <TableRow key={opp.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-navy">
                        {opp.caseNumber}
                      </TableCell>
                      <TableCell className="font-medium text-navy">
                        {opp.leadClientName}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="border-slate-200">
                          {opp.caseType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                          {opp.lostReason}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-slate-600">
                        {opp.competitor || '-'}
                      </TableCell>
                      <TableCell className="text-center text-sm text-slate-600">
                        {opp.stageWhenLost}
                      </TableCell>
                      <TableCell className="text-center font-medium text-orange-600">
                        {formatCurrency(opp.estimatedValue)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" aria-hidden="true" />
                          <span className="text-sm text-slate-600">{opp.daysInPipeline}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm text-slate-500">
                        {formatDate(opp.lostDate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card className="border-0 shadow-sm rounded-3xl">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-navy">
            {isRtl ? 'رؤى إضافية' : 'Additional Insights'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-navy mb-3">
                {isRtl ? 'أهم الفئات' : 'Top Categories'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{isRtl ? 'التسعير' : 'Pricing'}</span>
                  <Badge variant="outline">2</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{isRtl ? 'المنافسة' : 'Competition'}</span>
                  <Badge variant="outline">1</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{isRtl ? 'التواصل' : 'Communication'}</span>
                  <Badge variant="outline">1</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-navy mb-3">
                {isRtl ? 'المراحل الأكثر ضياعاً' : 'Most Common Lost Stages'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{isRtl ? 'عرض السعر' : 'Quote'}</span>
                  <Badge variant="outline">3</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{isRtl ? 'مفاوضات' : 'Negotiation'}</span>
                  <Badge variant="outline">1</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{isRtl ? 'مكالمة أولية' : 'Initial Call'}</span>
                  <Badge variant="outline">1</Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-navy mb-3">
                {isRtl ? 'موظفو المبيعات' : 'Sales Performance'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{isRtl ? 'أحمد محمد' : 'Ahmed Mohammed'}</span>
                  <Badge variant="outline">2</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{isRtl ? 'فاطمة علي' : 'Fatima Ali'}</span>
                  <Badge variant="outline">2</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{isRtl ? 'سارة أحمد' : 'Sara Ahmed'}</span>
                  <Badge variant="outline">1</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

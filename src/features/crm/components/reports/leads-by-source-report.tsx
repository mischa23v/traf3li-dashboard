import { useState, useMemo, lazy, Suspense } from 'react'
import { ROUTES } from '@/constants/routes'
import { useTranslation } from 'react-i18next'
import {
    Download,
    Filter,
    Calendar,
    TrendingUp,
    Target,
    DollarSign,
    AlertCircle,
    Users,
    Award,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    ExternalLink,
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ChartSkeleton } from '@/utils/lazy-import'

// Lazy load Recharts components
const ResponsiveContainer = lazy(() => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })))
const PieChart = lazy(() => import('recharts').then((mod) => ({ default: mod.PieChart })))
const Pie = lazy(() => import('recharts').then((mod) => ({ default: mod.Pie })))
const BarChart = lazy(() => import('recharts').then((mod) => ({ default: mod.BarChart })))
const Bar = lazy(() => import('recharts').then((mod) => ({ default: mod.Bar })))
const LineChart = lazy(() => import('recharts').then((mod) => ({ default: mod.LineChart })))
const Line = lazy(() => import('recharts').then((mod) => ({ default: mod.Line })))
const XAxis = lazy(() => import('recharts').then((mod) => ({ default: mod.XAxis })))
const YAxis = lazy(() => import('recharts').then((mod) => ({ default: mod.YAxis })))
const CartesianGrid = lazy(() => import('recharts').then((mod) => ({ default: mod.CartesianGrid })))
const Tooltip = lazy(() => import('recharts').then((mod) => ({ default: mod.Tooltip })))
const Legend = lazy(() => import('recharts').then((mod) => ({ default: mod.Legend })))
const Cell = lazy(() => import('recharts').then((mod) => ({ default: mod.Cell })))

// Mock hook - replace with actual API hook when available
const useLeadsBySourceReport = (filters: any) => {
    return {
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: () => { },
    }
}

// Mock hook for export - replace with actual hook
const useExportReport = () => {
    return {
        mutate: (params: any) => {
            console.log('Exporting report:', params)
        },
        isPending: false,
    }
}

export function LeadsBySourceReport() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    // Get first day of year and today for default dates
    const today = new Date()
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1)

    const [startDate, setStartDate] = useState(firstDayOfYear.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>('all')
    const [selectedTerritory, setSelectedTerritory] = useState<string>('all')
    const [selectedLeadStatus, setSelectedLeadStatus] = useState<string>('all')
    const [minLeadScore, setMinLeadScore] = useState<string>('')
    const [maxLeadScore, setMaxLeadScore] = useState<string>('')
    const [comparisonMode, setComparisonMode] = useState(false)
    const [selectedSource, setSelectedSource] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'overview' | 'trend' | 'comparison'>('overview')

    const filters = useMemo(() => {
        const f: any = {}
        if (startDate) f.startDate = startDate
        if (endDate) f.endDate = endDate
        if (selectedSalesPerson && selectedSalesPerson !== 'all') f.salesPersonId = selectedSalesPerson
        if (selectedTerritory && selectedTerritory !== 'all') f.territory = selectedTerritory
        if (selectedLeadStatus && selectedLeadStatus !== 'all') f.leadStatus = selectedLeadStatus
        if (minLeadScore) f.minLeadScore = parseInt(minLeadScore)
        if (maxLeadScore) f.maxLeadScore = parseInt(maxLeadScore)
        return f
    }, [startDate, endDate, selectedSalesPerson, selectedTerritory, selectedLeadStatus, minLeadScore, maxLeadScore])

    const { data: reportData, isLoading, isError, error, refetch } = useLeadsBySourceReport(filters)
    const { mutate: exportReport, isPending: isExporting } = useExportReport()

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`
    }

    const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
        exportReport({ reportType: 'leads-by-source', format, filters })
    }

    const handleSourceDrillDown = (sourceName: string) => {
        setSelectedSource(sourceName === selectedSource ? null : sourceName)
    }

    const topNav = [
        { title: isRTL ? 'العملاء المحتملين' : 'Leads', href: ROUTES.dashboard.crm.leads.list, isActive: false },
        { title: isRTL ? 'مسار المبيعات' : 'Pipeline', href: ROUTES.dashboard.crm.pipeline, isActive: false },
        { title: isRTL ? 'الإحالات' : 'Referrals', href: ROUTES.dashboard.crm.referrals.list, isActive: false },
        { title: isRTL ? 'الأنشطة' : 'Activities', href: ROUTES.dashboard.crm.activities.list, isActive: false },
        { title: isRTL ? 'التقارير' : 'Reports', href: ROUTES.dashboard.crm.reports.list, isActive: true },
    ]

    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <div className="grid grid-cols-4 gap-4">
                        <Skeleton className="h-24 rounded-2xl" />
                        <Skeleton className="h-24 rounded-2xl" />
                        <Skeleton className="h-24 rounded-2xl" />
                        <Skeleton className="h-24 rounded-2xl" />
                    </div>
                    <Skeleton className="h-96 w-full rounded-3xl" />
                </Main>
            </>
        )
    }

    if (isError) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                </Header>
                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {isRTL ? 'فشل تحميل التقرير' : 'Failed to Load Report'}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {error?.message || (isRTL ? 'حدث خطأ أثناء تحميل البيانات' : 'An error occurred while loading the data')}
                        </p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            {isRTL ? 'إعادة المحاولة' : 'Retry'}
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // Mock data for development - will be replaced by API
    const mockSummary = reportData?.summary || {
        totalLeads: 1247,
        conversionRate: 28.5,
        avgCostPerLead: 285,
        totalCost: 355495,
        bestPerformingSource: 'Google Ads',
        bestSourceConversionRate: 42.3,
        totalConverted: 356,
        totalRevenue: 17800000,
    }

    const mockSourceData = reportData?.sources || [
        {
            source: 'Google Ads',
            leadCount: 425,
            percentage: 34.1,
            convertedCount: 180,
            conversionRate: 42.3,
            avgDealValue: 52000,
            totalRevenue: 9360000,
            cost: 121000,
            costPerLead: 285,
            roi: 673.5,
            rank: 1,
            trend: 'up',
            trendPercentage: 15.2,
            color: '#3b82f6',
        },
        {
            source: 'Facebook Ads',
            leadCount: 312,
            percentage: 25.0,
            convertedCount: 87,
            conversionRate: 27.9,
            avgDealValue: 48000,
            totalRevenue: 4176000,
            cost: 93600,
            costPerLead: 300,
            roi: 346.2,
            rank: 2,
            trend: 'up',
            trendPercentage: 8.5,
            color: '#8b5cf6',
        },
        {
            source: 'Website',
            leadCount: 280,
            percentage: 22.5,
            convertedCount: 56,
            conversionRate: 20.0,
            avgDealValue: 45000,
            totalRevenue: 2520000,
            cost: 0,
            costPerLead: 0,
            roi: Infinity,
            rank: 3,
            trend: 'stable',
            trendPercentage: 2.1,
            color: '#10b981',
        },
        {
            source: 'LinkedIn',
            leadCount: 145,
            percentage: 11.6,
            convertedCount: 23,
            conversionRate: 15.9,
            avgDealValue: 55000,
            totalRevenue: 1265000,
            cost: 87000,
            costPerLead: 600,
            roi: 54.4,
            rank: 4,
            trend: 'down',
            trendPercentage: -5.3,
            color: '#f59e0b',
        },
        {
            source: 'Referrals',
            leadCount: 85,
            percentage: 6.8,
            convertedCount: 10,
            conversionRate: 11.8,
            avgDealValue: 48000,
            totalRevenue: 480000,
            cost: 0,
            costPerLead: 0,
            roi: Infinity,
            rank: 5,
            trend: 'stable',
            trendPercentage: 1.2,
            color: '#ec4899',
        },
    ]

    // Trend data by month for line chart
    const mockTrendData = reportData?.trends || [
        {
            month: isRTL ? 'يناير' : 'Jan',
            'Google Ads': 95,
            'Facebook Ads': 68,
            'Website': 52,
            'LinkedIn': 28,
            'Referrals': 15,
        },
        {
            month: isRTL ? 'فبراير' : 'Feb',
            'Google Ads': 102,
            'Facebook Ads': 72,
            'Website': 58,
            'LinkedIn': 31,
            'Referrals': 18,
        },
        {
            month: isRTL ? 'مارس' : 'Mar',
            'Google Ads': 118,
            'Facebook Ads': 85,
            'Website': 64,
            'LinkedIn': 35,
            'Referrals': 20,
        },
        {
            month: isRTL ? 'أبريل' : 'Apr',
            'Google Ads': 110,
            'Facebook Ads': 87,
            'Website': 70,
            'LinkedIn': 51,
            'Referrals': 32,
        },
    ]

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f97316']

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Hero Header */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/20 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                        <Target className="w-3 h-3 ms-2" aria-hidden="true" />
                                        {isRTL ? 'تقرير المصادر' : 'Source Report'}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    {isRTL ? 'العملاء المحتملين حسب المصدر' : 'Leads by Source'}
                                </h1>
                                <p className="text-blue-100/80">
                                    {isRTL ? 'تحليل شامل لأداء المصادر ومعدلات التحويل والعائد على الاستثمار' : 'Comprehensive analysis of source performance, conversion rates, and ROI'}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                                    onClick={() => handleExport('csv')}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                    {isRTL ? 'CSV' : 'CSV'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                                    onClick={() => handleExport('excel')}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                    {isRTL ? 'Excel' : 'Excel'}
                                </Button>
                                <Button
                                    className="bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-lg"
                                    onClick={() => handleExport('pdf')}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                    {isRTL ? 'PDF' : 'PDF'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <Card className="border-0 shadow-sm rounded-2xl bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Filter className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                <span className="text-sm font-medium text-slate-600">
                                    {isRTL ? 'الفلاتر:' : 'Filters:'}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {isRTL ? 'من تاريخ' : 'Start Date'}
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-600" aria-hidden="true" />
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {isRTL ? 'إلى تاريخ' : 'End Date'}
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-600" aria-hidden="true" />
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {isRTL ? 'موظف المبيعات' : 'Sales Person'}
                                    </Label>
                                    <Select value={selectedSalesPerson} onValueChange={setSelectedSalesPerson}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'الجميع' : 'All'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'الجميع' : 'All'}</SelectItem>
                                            <SelectItem value="1">Ahmed Hassan</SelectItem>
                                            <SelectItem value="2">Sarah Ali</SelectItem>
                                            <SelectItem value="3">Mohammed Ibrahim</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {isRTL ? 'المنطقة' : 'Territory'}
                                    </Label>
                                    <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'جميع المناطق' : 'All Territories'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'جميع المناطق' : 'All Territories'}</SelectItem>
                                            <SelectItem value="riyadh">{isRTL ? 'الرياض' : 'Riyadh'}</SelectItem>
                                            <SelectItem value="jeddah">{isRTL ? 'جدة' : 'Jeddah'}</SelectItem>
                                            <SelectItem value="dammam">{isRTL ? 'الدمام' : 'Dammam'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {isRTL ? 'حالة العميل' : 'Lead Status'}
                                    </Label>
                                    <Select value={selectedLeadStatus} onValueChange={setSelectedLeadStatus}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'جميع الحالات' : 'All Statuses'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                                            <SelectItem value="new">{isRTL ? 'جديد' : 'New'}</SelectItem>
                                            <SelectItem value="contacted">{isRTL ? 'تم التواصل' : 'Contacted'}</SelectItem>
                                            <SelectItem value="qualified">{isRTL ? 'مؤهل' : 'Qualified'}</SelectItem>
                                            <SelectItem value="converted">{isRTL ? 'محول' : 'Converted'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {isRTL ? 'نطاق نقاط العميل' : 'Lead Score Range'}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder={isRTL ? 'من' : 'Min'}
                                            value={minLeadScore}
                                            onChange={(e) => setMinLeadScore(e.target.value)}
                                            className="rounded-xl border-slate-200"
                                            min="0"
                                            max="100"
                                        />
                                        <Input
                                            type="number"
                                            placeholder={isRTL ? 'إلى' : 'Max'}
                                            value={maxLeadScore}
                                            onChange={(e) => setMaxLeadScore(e.target.value)}
                                            className="rounded-xl border-slate-200"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'إجمالي العملاء' : 'Total Leads'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.totalLeads.toLocaleString()}</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {isRTL ? 'محولين:' : 'Converted:'} {mockSummary.totalConverted} ({formatPercentage(mockSummary.conversionRate)})
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'معدل التحويل' : 'Conversion Rate'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatPercentage(mockSummary.conversionRate)}</div>
                                <div className="mt-2">
                                    <Progress
                                        value={mockSummary.conversionRate}
                                        className="h-1.5 bg-emerald-100"
                                        indicatorClassName="bg-emerald-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-purple-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'تكلفة العميل' : 'Cost per Lead'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.avgCostPerLead)}</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {isRTL ? 'إجمالي التكلفة:' : 'Total Cost:'} {formatCurrency(mockSummary.totalCost)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <Award className="w-5 h-5 text-amber-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'أفضل مصدر' : 'Best Source'}
                                    </span>
                                </div>
                                <div className="text-lg font-bold text-navy truncate">{mockSummary.bestPerformingSource}</div>
                                <div className="mt-2 text-xs text-emerald-600 font-medium">
                                    {formatPercentage(mockSummary.bestSourceConversionRate)} {isRTL ? 'معدل التحويل' : 'conversion'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content with Tabs */}
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-6">
                        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
                            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                                <PieChartIcon className="w-4 h-4 ms-2" aria-hidden="true" />
                                {isRTL ? 'نظرة عامة' : 'Overview'}
                            </TabsTrigger>
                            <TabsTrigger value="trend" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                                <Activity className="w-4 h-4 ms-2" aria-hidden="true" />
                                {isRTL ? 'الاتجاهات' : 'Trends'}
                            </TabsTrigger>
                            <TabsTrigger value="comparison" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                                <BarChart3 className="w-4 h-4 ms-2" aria-hidden="true" />
                                {isRTL ? 'المقارنة' : 'Comparison'}
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Pie Chart - Lead Distribution */}
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <PieChartIcon className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                            {isRTL ? 'توزيع العملاء حسب المصدر' : 'Lead Distribution by Source'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Suspense fallback={<ChartSkeleton />}>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={mockSourceData}
                                                        dataKey="leadCount"
                                                        nameKey="source"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={2}
                                                        label={(entry) => `${entry.percentage}%`}
                                                    >
                                                        {mockSourceData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value: number) => value.toLocaleString()}
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '12px',
                                                        }}
                                                    />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Suspense>
                                    </CardContent>
                                </Card>

                                {/* Bar Chart - Conversion Rates */}
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                            {isRTL ? 'معدلات التحويل' : 'Conversion Rates'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Suspense fallback={<ChartSkeleton />}>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={mockSourceData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                    <XAxis
                                                        dataKey="source"
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                        angle={-15}
                                                        textAnchor="end"
                                                        height={70}
                                                    />
                                                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                                                    <Tooltip
                                                        formatter={(value: number) => `${value.toFixed(1)}%`}
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '12px',
                                                        }}
                                                    />
                                                    <Bar dataKey="conversionRate" fill="#10b981" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Suspense>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detailed Table */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Target className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                            {isRTL ? 'تفاصيل المصادر' : 'Source Details'}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockSourceData.length} {isRTL ? 'مصدر' : 'sources'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {isRTL ? 'الترتيب' : 'Rank'}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {isRTL ? 'المصدر' : 'Source'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'العدد' : 'Count'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'النسبة' : '%'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'محولين' : 'Converted'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'التحويل' : 'Conv. Rate'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'متوسط القيمة' : 'Avg Deal'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'الإيرادات' : 'Revenue'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'التكلفة/عميل' : 'Cost/Lead'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'العائد' : 'ROI'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'الاتجاه' : 'Trend'}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockSourceData.map((source, index) => (
                                                    <TableRow
                                                        key={index}
                                                        className="hover:bg-slate-50 cursor-pointer"
                                                        onClick={() => handleSourceDrillDown(source.source)}
                                                    >
                                                        <TableCell>
                                                            <Badge
                                                                className={
                                                                    source.rank === 1
                                                                        ? 'bg-amber-100 text-amber-700 border-0'
                                                                        : source.rank === 2
                                                                        ? 'bg-slate-200 text-slate-700 border-0'
                                                                        : source.rank === 3
                                                                        ? 'bg-orange-100 text-orange-700 border-0'
                                                                        : 'bg-slate-100 text-slate-600 border-0'
                                                                }
                                                            >
                                                                #{source.rank}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-navy">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: source.color }}
                                                                />
                                                                {source.source}
                                                                <ExternalLink className="w-3 h-3 text-slate-400" aria-hidden="true" />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center font-medium">
                                                            {source.leadCount.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span className="font-medium">{formatPercentage(source.percentage)}</span>
                                                                <Progress
                                                                    value={source.percentage}
                                                                    className="h-1.5 w-12 bg-slate-100"
                                                                    indicatorClassName="bg-blue-500"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                                                {source.convertedCount}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                className={
                                                                    source.conversionRate >= 40
                                                                        ? 'bg-emerald-100 text-emerald-700 border-0'
                                                                        : source.conversionRate >= 25
                                                                        ? 'bg-blue-100 text-blue-700 border-0'
                                                                        : 'bg-amber-100 text-amber-700 border-0'
                                                                }
                                                            >
                                                                {formatPercentage(source.conversionRate)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center font-medium text-navy">
                                                            {formatCurrency(source.avgDealValue)}
                                                        </TableCell>
                                                        <TableCell className="text-center font-bold text-navy">
                                                            {formatCurrency(source.totalRevenue)}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {source.costPerLead > 0 ? (
                                                                <span className="text-slate-600">{formatCurrency(source.costPerLead)}</span>
                                                            ) : (
                                                                <span className="text-emerald-600 font-medium">{isRTL ? 'مجاني' : 'Free'}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {source.roi === Infinity ? (
                                                                <Badge className="bg-purple-100 text-purple-700 border-0">
                                                                    ∞
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    className={
                                                                        source.roi >= 500
                                                                            ? 'bg-emerald-100 text-emerald-700 border-0'
                                                                            : source.roi >= 200
                                                                            ? 'bg-blue-100 text-blue-700 border-0'
                                                                            : 'bg-amber-100 text-amber-700 border-0'
                                                                    }
                                                                >
                                                                    {formatPercentage(source.roi)}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {source.trend === 'up' ? (
                                                                <div className="flex items-center justify-center gap-1 text-emerald-600">
                                                                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                                                                    <span className="text-xs font-medium">{formatPercentage(source.trendPercentage)}</span>
                                                                </div>
                                                            ) : source.trend === 'down' ? (
                                                                <div className="flex items-center justify-center gap-1 text-red-600">
                                                                    <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
                                                                    <span className="text-xs font-medium">{formatPercentage(Math.abs(source.trendPercentage))}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-500">{isRTL ? 'ثابت' : 'Stable'}</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Trend Tab */}
                        <TabsContent value="trend" className="space-y-6">
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                        {isRTL ? 'اتجاهات العملاء المحتملين' : 'Lead Trends Over Time'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <Suspense fallback={<ChartSkeleton />}>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <LineChart data={mockTrendData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="month"
                                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                                />
                                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                    }}
                                                />
                                                <Legend />
                                                <Line type="monotone" dataKey="Google Ads" stroke="#3b82f6" strokeWidth={2} />
                                                <Line type="monotone" dataKey="Facebook Ads" stroke="#8b5cf6" strokeWidth={2} />
                                                <Line type="monotone" dataKey="Website" stroke="#10b981" strokeWidth={2} />
                                                <Line type="monotone" dataKey="LinkedIn" stroke="#f59e0b" strokeWidth={2} />
                                                <Line type="monotone" dataKey="Referrals" stroke="#ec4899" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Suspense>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Comparison Tab */}
                        <TabsContent value="comparison" className="space-y-6">
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                        {isRTL ? 'مقارنة الأداء' : 'Performance Comparison'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {mockSourceData.map((source, index) => (
                                            <div key={index} className="border border-slate-100 rounded-2xl p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-4 h-4 rounded-full"
                                                            style={{ backgroundColor: source.color }}
                                                        />
                                                        <h4 className="font-bold text-navy">{source.source}</h4>
                                                        <Badge
                                                            className={
                                                                source.rank === 1
                                                                    ? 'bg-amber-100 text-amber-700 border-0'
                                                                    : 'bg-slate-100 text-slate-600 border-0'
                                                            }
                                                        >
                                                            #{source.rank}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-600">
                                                        {source.leadCount.toLocaleString()} {isRTL ? 'عميل' : 'leads'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-1">{isRTL ? 'التحويل' : 'Conversion'}</p>
                                                        <p className="font-bold text-emerald-600">{formatPercentage(source.conversionRate)}</p>
                                                        <Progress
                                                            value={source.conversionRate}
                                                            className="h-1.5 mt-1 bg-slate-100"
                                                            indicatorClassName="bg-emerald-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-1">{isRTL ? 'الإيرادات' : 'Revenue'}</p>
                                                        <p className="font-bold text-navy">{formatCurrency(source.totalRevenue)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-1">{isRTL ? 'التكلفة' : 'Cost/Lead'}</p>
                                                        <p className="font-bold text-purple-600">
                                                            {source.costPerLead > 0 ? formatCurrency(source.costPerLead) : (isRTL ? 'مجاني' : 'Free')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-1">{isRTL ? 'العائد' : 'ROI'}</p>
                                                        <p className="font-bold text-blue-600">
                                                            {source.roi === Infinity ? '∞' : formatPercentage(source.roi)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                </div>
            </Main>
        </>
    )
}

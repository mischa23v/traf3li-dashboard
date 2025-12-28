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
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
    CheckCircle2,
    AlertTriangle,
    Edit3,
    FileText,
    Gauge,
    Zap,
    Percent,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { cn } from '@/lib/utils'
import { ChartSkeleton } from '@/utils/lazy-import'

// Lazy load Recharts components
const ResponsiveContainer = lazy(() => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })))
const BarChart = lazy(() => import('recharts').then((mod) => ({ default: mod.BarChart })))
const Bar = lazy(() => import('recharts').then((mod) => ({ default: mod.Bar })))
const LineChart = lazy(() => import('recharts').then((mod) => ({ default: mod.LineChart })))
const Line = lazy(() => import('recharts').then((mod) => ({ default: mod.Line })))
const ComposedChart = lazy(() => import('recharts').then((mod) => ({ default: mod.ComposedChart })))
const XAxis = lazy(() => import('recharts').then((mod) => ({ default: mod.XAxis })))
const YAxis = lazy(() => import('recharts').then((mod) => ({ default: mod.YAxis })))
const CartesianGrid = lazy(() => import('recharts').then((mod) => ({ default: mod.CartesianGrid })))
const Tooltip = lazy(() => import('recharts').then((mod) => ({ default: mod.Tooltip })))
const Legend = lazy(() => import('recharts').then((mod) => ({ default: mod.Legend })))
const ReferenceLine = lazy(() => import('recharts').then((mod) => ({ default: mod.ReferenceLine })))
const Cell = lazy(() => import('recharts').then((mod) => ({ default: mod.Cell })))

// Mock hook - replace with actual API hook when available
const useRevenueForecastReport = (filters: any) => {
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

// Mock hook for forecast override - replace with actual hook
const useUpdateForecastOverride = () => {
    return {
        mutate: (params: any) => {
            console.log('Updating forecast override:', params)
        },
        isPending: false,
    }
}

export function RevenueForecastReport() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    // Get first day of current quarter and end of quarter for default dates
    const today = new Date()
    const currentQuarter = Math.floor(today.getMonth() / 3)
    const firstDayOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1)
    const lastDayOfQuarter = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0)

    const [startDate, setStartDate] = useState(firstDayOfQuarter.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(lastDayOfQuarter.toISOString().split('T')[0])
    const [selectedPeriod, setSelectedPeriod] = useState<string>('quarter')
    const [selectedOwner, setSelectedOwner] = useState<string>('all')
    const [selectedTerritory, setSelectedTerritory] = useState<string>('all')
    const [selectedProductLine, setSelectedProductLine] = useState<string>('all')
    const [minProbability, setMinProbability] = useState<string>('0')
    const [maxProbability, setMaxProbability] = useState<string>('100')
    const [minDealSize, setMinDealSize] = useState<string>('')
    const [maxDealSize, setMaxDealSize] = useState<string>('')
    const [viewMode, setViewMode] = useState<'summary' | 'by-rep' | 'by-month'>('summary')
    const [forecastNotes, setForecastNotes] = useState<string>('')

    const filters = useMemo(() => {
        const f: any = {}
        if (startDate) f.startDate = startDate
        if (endDate) f.endDate = endDate
        if (selectedPeriod && selectedPeriod !== 'custom') f.period = selectedPeriod
        if (selectedOwner && selectedOwner !== 'all') f.ownerId = selectedOwner
        if (selectedTerritory && selectedTerritory !== 'all') f.territory = selectedTerritory
        if (selectedProductLine && selectedProductLine !== 'all') f.productLine = selectedProductLine
        if (minProbability) f.minProbability = parseInt(minProbability)
        if (maxProbability) f.maxProbability = parseInt(maxProbability)
        if (minDealSize) f.minDealSize = parseInt(minDealSize)
        if (maxDealSize) f.maxDealSize = parseInt(maxDealSize)
        return f
    }, [startDate, endDate, selectedPeriod, selectedOwner, selectedTerritory, selectedProductLine, minProbability, maxProbability, minDealSize, maxDealSize])

    const { data: reportData, isLoading, isError, error, refetch } = useRevenueForecastReport(filters)
    const { mutate: exportReport, isPending: isExporting } = useExportReport()
    const { mutate: updateOverride, isPending: isUpdatingOverride } = useUpdateForecastOverride()

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
        exportReport({ reportType: 'revenue-forecast', format, filters, viewMode })
    }

    const handleSaveForecastNotes = () => {
        updateOverride({ notes: forecastNotes, filters })
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
                    <div className="grid grid-cols-5 gap-4">
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
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
        committed: 8950000, // Won + 90%+
        bestCase: 12500000, // Committed + 50-89%
        pipeline: 15800000, // All open deals
        quota: 10000000, // Target for period
        gapToQuota: 1050000, // Quota - Committed
        quotaAttainment: 89.5, // (Committed / Quota) * 100
        trendingStatus: 'on_track', // on_track, behind, ahead
        forecastAccuracy: 87.3, // Historical accuracy
        averageDealSize: 125000,
        totalDeals: 126,
        closedWon: 3200000,
        weightedPipeline: 7850000,
    }

    // Forecast categories with probability-weighted values
    const mockForecastCategories = reportData?.categories || [
        {
            category: isRTL ? 'مغلق بنجاح' : 'Closed Won',
            categoryEn: 'Closed Won',
            probability: 100,
            dealCount: 32,
            totalValue: 3200000,
            weightedValue: 3200000,
            color: '#10b981',
            percentage: 20.3,
        },
        {
            category: isRTL ? 'ملتزم' : 'Commit',
            categoryEn: 'Commit',
            probability: 90,
            dealCount: 28,
            totalValue: 6750000,
            weightedValue: 6075000,
            color: '#3b82f6',
            percentage: 42.7,
        },
        {
            category: isRTL ? 'أفضل سيناريو' : 'Best Case',
            categoryEn: 'Best Case',
            probability: 70,
            dealCount: 35,
            totalValue: 3550000,
            weightedValue: 2485000,
            color: '#8b5cf6',
            percentage: 22.5,
        },
        {
            category: isRTL ? 'خط المبيعات' : 'Pipeline',
            categoryEn: 'Pipeline',
            probability: 35,
            dealCount: 24,
            totalValue: 1800000,
            weightedValue: 630000,
            color: '#f59e0b',
            percentage: 11.4,
        },
        {
            category: isRTL ? 'احتمالي' : 'Upside',
            categoryEn: 'Upside',
            probability: 10,
            dealCount: 7,
            totalValue: 500000,
            weightedValue: 50000,
            color: '#ec4899',
            percentage: 3.2,
        },
    ]

    // Monthly forecast breakdown
    const mockMonthlyForecast = reportData?.monthly || [
        {
            month: isRTL ? 'يناير' : 'Jan',
            monthEn: 'Jan',
            committed: 2800000,
            upside: 850000,
            pipeline: 450000,
            quota: 3333333,
            closedWon: 1200000,
            quotaAttainment: 84.0,
        },
        {
            month: isRTL ? 'فبراير' : 'Feb',
            monthEn: 'Feb',
            committed: 3150000,
            upside: 950000,
            pipeline: 550000,
            quota: 3333333,
            closedWon: 1400000,
            quotaAttainment: 94.5,
        },
        {
            month: isRTL ? 'مارس' : 'Mar',
            monthEn: 'Mar',
            committed: 3000000,
            upside: 700000,
            pipeline: 400000,
            quota: 3333334,
            closedWon: 600000,
            quotaAttainment: 90.0,
        },
    ]

    // By rep forecast
    const mockRepForecast = reportData?.byRep || [
        {
            repId: '1',
            repName: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
            committed: 2500000,
            bestCase: 3200000,
            pipeline: 4100000,
            quota: 2500000,
            gapToQuota: 0,
            quotaAttainment: 100.0,
            dealCount: 35,
            avgDealSize: 117143,
            trend: 'ahead',
        },
        {
            repId: '2',
            repName: isRTL ? 'سارة علي' : 'Sara Ali',
            committed: 2200000,
            bestCase: 2850000,
            pipeline: 3600000,
            quota: 2500000,
            gapToQuota: 300000,
            quotaAttainment: 88.0,
            dealCount: 32,
            avgDealSize: 112500,
            trend: 'on_track',
        },
        {
            repId: '3',
            repName: isRTL ? 'خالد عبدالله' : 'Khaled Abdullah',
            committed: 2100000,
            bestCase: 2800000,
            pipeline: 3500000,
            quota: 2500000,
            gapToQuota: 400000,
            quotaAttainment: 84.0,
            dealCount: 28,
            avgDealSize: 125000,
            trend: 'on_track',
        },
        {
            repId: '4',
            repName: isRTL ? 'فاطمة حسن' : 'Fatima Hassan',
            committed: 2150000,
            bestCase: 2650000,
            pipeline: 4600000,
            quota: 2500000,
            gapToQuota: 350000,
            quotaAttainment: 86.0,
            dealCount: 31,
            avgDealSize: 148387,
            trend: 'behind',
        },
    ]

    // By product line
    const mockProductForecast = reportData?.byProduct || [
        {
            product: isRTL ? 'خدمات استشارية' : 'Consulting Services',
            committed: 3500000,
            bestCase: 4800000,
            pipeline: 6200000,
            dealCount: 45,
        },
        {
            product: isRTL ? 'حلول تقنية' : 'Technology Solutions',
            committed: 2800000,
            bestCase: 3950000,
            pipeline: 5100000,
            dealCount: 38,
        },
        {
            product: isRTL ? 'تدريب وتطوير' : 'Training & Development',
            committed: 1950000,
            bestCase: 2450000,
            pipeline: 3200000,
            dealCount: 28,
        },
        {
            product: isRTL ? 'خدمات مدارة' : 'Managed Services',
            committed: 700000,
            bestCase: 1300000,
            pipeline: 1300000,
            dealCount: 15,
        },
    ]

    // Forecast deals table data
    const mockForecastDeals = reportData?.deals || [
        {
            dealId: '1',
            dealName: isRTL ? 'مشروع تحول رقمي - شركة الرياض' : 'Digital Transformation - Riyadh Corp',
            company: isRTL ? 'شركة الرياض للتقنية' : 'Riyadh Tech Corp',
            value: 850000,
            weightedValue: 765000,
            probability: 90,
            expectedCloseDate: '2024-02-15',
            daysUntilClose: 12,
            category: isRTL ? 'ملتزم' : 'Commit',
            owner: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
            productLine: isRTL ? 'خدمات استشارية' : 'Consulting Services',
        },
        {
            dealId: '2',
            dealName: isRTL ? 'تطبيق موبايل - شركة جدة' : 'Mobile App - Jeddah Company',
            company: isRTL ? 'مجموعة جدة التجارية' : 'Jeddah Commercial Group',
            value: 420000,
            weightedValue: 420000,
            probability: 100,
            expectedCloseDate: '2024-01-30',
            daysUntilClose: -3,
            category: isRTL ? 'مغلق بنجاح' : 'Closed Won',
            owner: isRTL ? 'سارة علي' : 'Sara Ali',
            productLine: isRTL ? 'حلول تقنية' : 'Technology Solutions',
        },
        {
            dealId: '3',
            dealName: isRTL ? 'برنامج تدريب قيادي' : 'Leadership Training Program',
            company: isRTL ? 'الشركة الوطنية للتطوير' : 'National Development Co',
            value: 280000,
            weightedValue: 196000,
            probability: 70,
            expectedCloseDate: '2024-03-10',
            daysUntilClose: 35,
            category: isRTL ? 'أفضل سيناريو' : 'Best Case',
            owner: isRTL ? 'خالد عبدالله' : 'Khaled Abdullah',
            productLine: isRTL ? 'تدريب وتطوير' : 'Training & Development',
        },
        {
            dealId: '4',
            dealName: isRTL ? 'خدمات سحابية مدارة' : 'Managed Cloud Services',
            company: isRTL ? 'بنك الخليج' : 'Gulf Bank',
            value: 650000,
            weightedValue: 585000,
            probability: 90,
            expectedCloseDate: '2024-02-28',
            daysUntilClose: 25,
            category: isRTL ? 'ملتزم' : 'Commit',
            owner: isRTL ? 'فاطمة حسن' : 'Fatima Hassan',
            productLine: isRTL ? 'خدمات مدارة' : 'Managed Services',
        },
        {
            dealId: '5',
            dealName: isRTL ? 'نظام إدارة الموارد' : 'ERP System Implementation',
            company: isRTL ? 'مصنع الدمام' : 'Dammam Manufacturing',
            value: 1200000,
            weightedValue: 420000,
            probability: 35,
            expectedCloseDate: '2024-04-15',
            daysUntilClose: 71,
            category: isRTL ? 'خط المبيعات' : 'Pipeline',
            owner: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
            productLine: isRTL ? 'حلول تقنية' : 'Technology Solutions',
        },
    ]

    // Waterfall chart data (how we get from current to goal)
    const mockWaterfallData = reportData?.waterfall || [
        { name: isRTL ? 'الحالي' : 'Current', value: mockSummary.closedWon, fill: '#10b981' },
        { name: isRTL ? '+ ملتزم' : '+ Commit', value: mockSummary.committed - mockSummary.closedWon, fill: '#3b82f6' },
        { name: isRTL ? '+ احتمالي' : '+ Upside', value: mockSummary.bestCase - mockSummary.committed, fill: '#8b5cf6' },
        { name: isRTL ? 'الفجوة' : 'Gap', value: mockSummary.gapToQuota, fill: '#ef4444' },
        { name: isRTL ? 'الهدف' : 'Quota', value: mockSummary.quota, fill: '#f59e0b' },
    ]

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
                    <div className="bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/20 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                        <Gauge className="w-3 h-3 ms-2" aria-hidden="true" />
                                        {t('crm.reports.forecast.badge') || (isRTL ? 'تقرير التوقعات' : 'Forecast Report')}
                                    </Badge>
                                    <Badge className={cn(
                                        "border-0 backdrop-blur-sm",
                                        mockSummary.trendingStatus === 'ahead' ? 'bg-emerald-500/20 text-white' :
                                        mockSummary.trendingStatus === 'on_track' ? 'bg-blue-500/20 text-white' :
                                        'bg-orange-500/20 text-white'
                                    )}>
                                        {mockSummary.trendingStatus === 'ahead' ? (
                                            <><TrendingUp className="w-3 h-3 ms-1" /> {isRTL ? 'متقدم' : 'Ahead'}</>
                                        ) : mockSummary.trendingStatus === 'on_track' ? (
                                            <><CheckCircle2 className="w-3 h-3 ms-1" /> {isRTL ? 'على المسار' : 'On Track'}</>
                                        ) : (
                                            <><AlertTriangle className="w-3 h-3 ms-1" /> {isRTL ? 'متأخر' : 'Behind'}</>
                                        )}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    {t('crm.reports.forecast.title') || (isRTL ? 'توقعات الإيرادات' : 'Revenue Forecast')}
                                </h1>
                                <p className="text-cyan-100/80">
                                    {t('crm.reports.forecast.subtitle') || (isRTL ? 'تحليل شامل للتوقعات المالية ومعدلات تحقيق الأهداف' : 'Comprehensive analysis of revenue projections and quota attainment')}
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
                                    CSV
                                </Button>
                                <Button
                                    variant="outline"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                                    onClick={() => handleExport('excel')}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                    Excel
                                </Button>
                                <Button
                                    className="bg-white text-teal-700 hover:bg-cyan-50 rounded-xl shadow-lg"
                                    onClick={() => handleExport('pdf')}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                    PDF
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
                                    {t('crm.reports.forecast.filters') || (isRTL ? 'الفلاتر:' : 'Filters:')}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.forecast.period') || (isRTL ? 'الفترة' : 'Period')}
                                    </Label>
                                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="month">{isRTL ? 'هذا الشهر' : 'This Month'}</SelectItem>
                                            <SelectItem value="quarter">{isRTL ? 'هذا الربع' : 'This Quarter'}</SelectItem>
                                            <SelectItem value="year">{isRTL ? 'هذه السنة' : 'This Year'}</SelectItem>
                                            <SelectItem value="custom">{isRTL ? 'مخصص' : 'Custom'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedPeriod === 'custom' && (
                                    <>
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
                                    </>
                                )}
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.forecast.owner') || (isRTL ? 'المالك' : 'Owner')}
                                    </Label>
                                    <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'الجميع' : 'All'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'الجميع' : 'All'}</SelectItem>
                                            <SelectItem value="1">{isRTL ? 'أحمد محمد' : 'Ahmed Mohammed'}</SelectItem>
                                            <SelectItem value="2">{isRTL ? 'سارة علي' : 'Sara Ali'}</SelectItem>
                                            <SelectItem value="3">{isRTL ? 'خالد عبدالله' : 'Khaled Abdullah'}</SelectItem>
                                            <SelectItem value="4">{isRTL ? 'فاطمة حسن' : 'Fatima Hassan'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.forecast.territory') || (isRTL ? 'المنطقة' : 'Territory')}
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
                                        {t('crm.reports.forecast.productLine') || (isRTL ? 'خط المنتج' : 'Product Line')}
                                    </Label>
                                    <Select value={selectedProductLine} onValueChange={setSelectedProductLine}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'جميع المنتجات' : 'All Products'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'جميع المنتجات' : 'All Products'}</SelectItem>
                                            <SelectItem value="consulting">{isRTL ? 'خدمات استشارية' : 'Consulting Services'}</SelectItem>
                                            <SelectItem value="technology">{isRTL ? 'حلول تقنية' : 'Technology Solutions'}</SelectItem>
                                            <SelectItem value="training">{isRTL ? 'تدريب وتطوير' : 'Training & Development'}</SelectItem>
                                            <SelectItem value="managed">{isRTL ? 'خدمات مدارة' : 'Managed Services'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.forecast.probabilityRange') || (isRTL ? 'نطاق الاحتمالية' : 'Probability Range')}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder={isRTL ? 'من' : 'Min'}
                                            value={minProbability}
                                            onChange={(e) => setMinProbability(e.target.value)}
                                            className="rounded-xl border-slate-200"
                                            min="0"
                                            max="100"
                                        />
                                        <Input
                                            type="number"
                                            placeholder={isRTL ? 'إلى' : 'Max'}
                                            value={maxProbability}
                                            onChange={(e) => setMaxProbability(e.target.value)}
                                            className="rounded-xl border-slate-200"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.forecast.dealSizeRange') || (isRTL ? 'نطاق حجم الصفقة' : 'Deal Size Range')}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder={isRTL ? 'من' : 'Min'}
                                            value={minDealSize}
                                            onChange={(e) => setMinDealSize(e.target.value)}
                                            className="rounded-xl border-slate-200"
                                        />
                                        <Input
                                            type="number"
                                            placeholder={isRTL ? 'إلى' : 'Max'}
                                            value={maxDealSize}
                                            onChange={(e) => setMaxDealSize(e.target.value)}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.forecast.committed') || (isRTL ? 'ملتزم' : 'Committed')}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.committed)}</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {isRTL ? 'فوز + احتمالية 90%+' : 'Won + 90%+ probability'}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.forecast.bestCase') || (isRTL ? 'أفضل سيناريو' : 'Best Case')}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.bestCase)}</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {isRTL ? 'ملتزم + احتمالية 50-89%' : 'Committed + 50-89% probability'}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-purple-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.forecast.pipeline') || (isRTL ? 'خط المبيعات' : 'Pipeline')}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.pipeline)}</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {mockSummary.totalDeals} {isRTL ? 'صفقة مفتوحة' : 'open deals'}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <Target className="w-5 h-5 text-amber-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.forecast.quota') || (isRTL ? 'الحصة' : 'Quota')}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.quota)}</div>
                                <div className="mt-2">
                                    <Progress
                                        value={mockSummary.quotaAttainment}
                                        className="h-1.5 bg-amber-100"
                                        indicatorClassName={cn(
                                            mockSummary.quotaAttainment >= 100 ? 'bg-emerald-500' :
                                            mockSummary.quotaAttainment >= 85 ? 'bg-blue-500' :
                                            'bg-amber-500'
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={cn(
                            "border-0 shadow-sm rounded-2xl",
                            mockSummary.gapToQuota > 0 ? "bg-orange-50" : "bg-emerald-50"
                        )}>
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        mockSummary.gapToQuota > 0 ? "bg-orange-100" : "bg-emerald-100"
                                    )}>
                                        {mockSummary.gapToQuota > 0 ? (
                                            <AlertTriangle className="w-5 h-5 text-orange-600" aria-hidden="true" />
                                        ) : (
                                            <Award className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                        )}
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.forecast.gapToQuota') || (isRTL ? 'الفجوة للحصة' : 'Gap to Quota')}
                                    </span>
                                </div>
                                <div className={cn(
                                    "text-2xl font-bold",
                                    mockSummary.gapToQuota > 0 ? "text-orange-700" : "text-emerald-700"
                                )}>
                                    {mockSummary.gapToQuota > 0 ? formatCurrency(mockSummary.gapToQuota) : (isRTL ? 'تم تحقيق الهدف' : 'Quota Met')}
                                </div>
                                <div className="mt-2 text-xs font-medium">
                                    {formatPercentage(mockSummary.quotaAttainment)} {isRTL ? 'من الحصة' : 'of quota'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content with Tabs */}
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-6">
                        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
                            <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                                <BarChart3 className="w-4 h-4 ms-2" aria-hidden="true" />
                                {t('crm.reports.forecast.summary') || (isRTL ? 'الملخص' : 'Summary')}
                            </TabsTrigger>
                            <TabsTrigger value="by-rep" className="rounded-lg data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                                <Users className="w-4 h-4 ms-2" aria-hidden="true" />
                                {t('crm.reports.forecast.byRep') || (isRTL ? 'حسب الممثل' : 'By Rep')}
                            </TabsTrigger>
                            <TabsTrigger value="by-month" className="rounded-lg data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                                <Activity className="w-4 h-4 ms-2" aria-hidden="true" />
                                {t('crm.reports.forecast.byMonth') || (isRTL ? 'حسب الشهر' : 'By Month')}
                            </TabsTrigger>
                        </TabsList>

                        {/* Summary Tab */}
                        <TabsContent value="summary" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Forecast Categories */}
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <PieChartIcon className="w-5 h-5 text-teal-500" aria-hidden="true" />
                                            {t('crm.reports.forecast.forecastCategories') || (isRTL ? 'فئات التوقعات' : 'Forecast Categories')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {mockForecastCategories.map((category, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{ backgroundColor: category.color }}
                                                            />
                                                            <span className="font-medium text-navy">{category.category}</span>
                                                            <Badge variant="outline" className="text-xs border-slate-200">
                                                                {category.dealCount} {isRTL ? 'صفقة' : 'deals'}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="text-sm font-bold text-navy">
                                                                {formatCurrency(category.weightedValue)}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {category.probability}% {isRTL ? 'احتمالية' : 'prob'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="absolute inset-y-0 rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${category.percentage}%`,
                                                                backgroundColor: category.color
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-slate-100">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-navy">{isRTL ? 'القيمة المرجحة الإجمالية:' : 'Total Weighted:'}</span>
                                                <span className="text-xl font-bold text-teal-600">
                                                    {formatCurrency(mockSummary.weightedPipeline)}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Monthly Forecast Stacked Bar */}
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-teal-500" aria-hidden="true" />
                                            {t('crm.reports.forecast.monthlyForecast') || (isRTL ? 'التوقعات الشهرية' : 'Monthly Forecast')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Suspense fallback={<ChartSkeleton />}>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <ComposedChart data={mockMonthlyForecast}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                    <XAxis
                                                        dataKey="month"
                                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                                    />
                                                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                                                    <Tooltip
                                                        formatter={(value: number) => formatCurrency(value)}
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '12px',
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="committed" stackId="a" fill="#10b981" name={isRTL ? 'ملتزم' : 'Committed'} radius={[0, 0, 0, 0]} />
                                                    <Bar dataKey="upside" stackId="a" fill="#3b82f6" name={isRTL ? 'احتمالي' : 'Upside'} radius={[0, 0, 0, 0]} />
                                                    <Bar dataKey="pipeline" stackId="a" fill="#8b5cf6" name={isRTL ? 'خط المبيعات' : 'Pipeline'} radius={[8, 8, 0, 0]} />
                                                    <Line type="monotone" dataKey="quota" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name={isRTL ? 'الحصة' : 'Quota'} />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </Suspense>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quota Attainment by Product Line */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Gauge className="w-5 h-5 text-teal-500" aria-hidden="true" />
                                        {t('crm.reports.forecast.byProductLine') || (isRTL ? 'التوقعات حسب خط المنتج' : 'Forecast by Product Line')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="text-start font-bold text-slate-700">
                                                    {isRTL ? 'المنتج' : 'Product'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'الصفقات' : 'Deals'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'ملتزم' : 'Committed'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'أفضل سيناريو' : 'Best Case'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'خط المبيعات' : 'Pipeline'}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockProductForecast.map((product, index) => (
                                                <TableRow key={index} className="hover:bg-slate-50">
                                                    <TableCell className="font-medium text-navy">{product.product}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="border-slate-200">
                                                            {product.dealCount}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-emerald-600">
                                                        {formatCurrency(product.committed)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-blue-600">
                                                        {formatCurrency(product.bestCase)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-purple-600">
                                                        {formatCurrency(product.pipeline)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Forecast Deals Table */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-teal-500" aria-hidden="true" />
                                            {t('crm.reports.forecast.forecastDeals') || (isRTL ? 'صفقات التوقعات' : 'Forecast Deals')}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockForecastDeals.length} {isRTL ? 'صفقة' : 'deals'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {isRTL ? 'الصفقة' : 'Deal'}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {isRTL ? 'الشركة' : 'Company'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'القيمة' : 'Value'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'الاحتمالية' : 'Probability'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'القيمة المرجحة' : 'Weighted'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'الفئة' : 'Category'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'الإغلاق المتوقع' : 'Expected Close'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'الأيام المتبقية' : 'Days Left'}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {isRTL ? 'المالك' : 'Owner'}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockForecastDeals.map((deal, index) => (
                                                    <TableRow key={index} className="hover:bg-slate-50">
                                                        <TableCell className="font-medium text-navy max-w-[200px]">
                                                            <div className="truncate" title={deal.dealName}>
                                                                {deal.dealName}
                                                            </div>
                                                            <div className="text-xs text-slate-500">{deal.productLine}</div>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">{deal.company}</TableCell>
                                                        <TableCell className="text-center font-bold text-navy">
                                                            {formatCurrency(deal.value)}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge className={cn(
                                                                "border-0",
                                                                deal.probability >= 90 ? 'bg-emerald-100 text-emerald-700' :
                                                                deal.probability >= 70 ? 'bg-blue-100 text-blue-700' :
                                                                deal.probability >= 50 ? 'bg-purple-100 text-purple-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            )}>
                                                                {deal.probability}%
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center font-bold text-teal-600">
                                                            {formatCurrency(deal.weightedValue)}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline" className="border-slate-200">
                                                                {deal.category}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center text-slate-600">
                                                            {new Date(deal.expectedCloseDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge className={cn(
                                                                "border-0",
                                                                deal.daysUntilClose < 0 ? 'bg-red-100 text-red-700' :
                                                                deal.daysUntilClose <= 7 ? 'bg-orange-100 text-orange-700' :
                                                                deal.daysUntilClose <= 30 ? 'bg-blue-100 text-blue-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            )}>
                                                                {deal.daysUntilClose < 0 ? (
                                                                    <>{Math.abs(deal.daysUntilClose)} {isRTL ? 'متأخر' : 'overdue'}</>
                                                                ) : (
                                                                    <>{deal.daysUntilClose} {isRTL ? 'يوم' : 'days'}</>
                                                                )}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">{deal.owner}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Forecast Adjustments */}
                            <Card className="border-0 shadow-sm rounded-3xl border-blue-200 bg-blue-50/30">
                                <CardHeader className="border-b border-blue-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Edit3 className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                        {t('crm.reports.forecast.adjustments') || (isRTL ? 'تعديلات التوقعات' : 'Forecast Adjustments')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                                {t('crm.reports.forecast.notes') || (isRTL ? 'ملاحظات على التوقعات والافتراضات:' : 'Forecast Notes & Assumptions:')}
                                            </Label>
                                            <Textarea
                                                value={forecastNotes}
                                                onChange={(e) => setForecastNotes(e.target.value)}
                                                placeholder={isRTL ? 'أضف ملاحظات حول التوقعات، الافتراضات، أو التعديلات اليدوية...' : 'Add notes about forecast assumptions, manual adjustments, or key insights...'}
                                                className="min-h-[100px] rounded-xl border-blue-200"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-slate-500">
                                                {isRTL ? 'التعديلات اليدوية تتطلب موافقة المدير' : 'Manual overrides require manager approval'}
                                            </p>
                                            <Button
                                                onClick={handleSaveForecastNotes}
                                                disabled={isUpdatingOverride || !forecastNotes.trim()}
                                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                            >
                                                <Edit3 className="w-4 h-4 ms-2" aria-hidden="true" />
                                                {isRTL ? 'حفظ الملاحظات' : 'Save Notes'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* By Rep Tab */}
                        <TabsContent value="by-rep" className="space-y-6">
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Users className="w-5 h-5 text-teal-500" aria-hidden="true" />
                                            {t('crm.reports.forecast.repQuotaAttainment') || (isRTL ? 'تحقيق الحصص الفردية' : 'Individual Quota Attainment')}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockRepForecast.length} {isRTL ? 'ممثل' : 'reps'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {mockRepForecast.map((rep) => (
                                        <Card key={rep.repId} className="border border-slate-100 shadow-none">
                                            <CardContent className="p-5 space-y-4">
                                                {/* Rep Header */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                                                            {rep.repName.split(' ')[0][0]}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-navy text-lg">{rep.repName}</h3>
                                                            <p className="text-sm text-slate-500">
                                                                {rep.dealCount} {isRTL ? 'صفقة' : 'deals'} • {formatCurrency(rep.avgDealSize)} {isRTL ? 'متوسط' : 'avg'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <Badge className={cn(
                                                            "border-0 mb-2",
                                                            rep.trend === 'ahead' ? 'bg-emerald-100 text-emerald-700' :
                                                            rep.trend === 'on_track' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-orange-100 text-orange-700'
                                                        )}>
                                                            {rep.trend === 'ahead' ? (
                                                                <><TrendingUp className="w-3 h-3 ms-1" /> {isRTL ? 'متقدم' : 'Ahead'}</>
                                                            ) : rep.trend === 'on_track' ? (
                                                                <><CheckCircle2 className="w-3 h-3 ms-1" /> {isRTL ? 'على المسار' : 'On Track'}</>
                                                            ) : (
                                                                <><TrendingDown className="w-3 h-3 ms-1" /> {isRTL ? 'متأخر' : 'Behind'}</>
                                                            )}
                                                        </Badge>
                                                        <div className="text-2xl font-bold text-navy">
                                                            {formatPercentage(rep.quotaAttainment)}
                                                        </div>
                                                        <div className="text-sm text-slate-500">
                                                            {isRTL ? 'من الحصة' : 'of quota'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Metrics */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <div className="bg-emerald-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                                            <span className="text-xs text-emerald-700">{isRTL ? 'ملتزم' : 'Committed'}</span>
                                                        </div>
                                                        <div className="text-sm font-bold text-emerald-700">{formatCurrency(rep.committed)}</div>
                                                    </div>
                                                    <div className="bg-blue-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <TrendingUp className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                                            <span className="text-xs text-blue-700">{isRTL ? 'أفضل سيناريو' : 'Best Case'}</span>
                                                        </div>
                                                        <div className="text-sm font-bold text-blue-700">{formatCurrency(rep.bestCase)}</div>
                                                    </div>
                                                    <div className="bg-purple-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Activity className="w-4 h-4 text-purple-600" aria-hidden="true" />
                                                            <span className="text-xs text-purple-700">{isRTL ? 'خط المبيعات' : 'Pipeline'}</span>
                                                        </div>
                                                        <div className="text-sm font-bold text-purple-700">{formatCurrency(rep.pipeline)}</div>
                                                    </div>
                                                    <div className="bg-amber-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Target className="w-4 h-4 text-amber-600" aria-hidden="true" />
                                                            <span className="text-xs text-amber-700">{isRTL ? 'الحصة' : 'Quota'}</span>
                                                        </div>
                                                        <div className="text-sm font-bold text-amber-700">{formatCurrency(rep.quota)}</div>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-slate-600">{isRTL ? 'التقدم نحو الحصة' : 'Progress to Quota'}</span>
                                                        <span className="text-sm font-medium text-navy">
                                                            {formatCurrency(rep.committed)} / {formatCurrency(rep.quota)}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={rep.quotaAttainment}
                                                        className="h-3 bg-slate-100"
                                                        indicatorClassName={cn(
                                                            rep.quotaAttainment >= 100 ? 'bg-emerald-500' :
                                                            rep.quotaAttainment >= 85 ? 'bg-blue-500' :
                                                            'bg-orange-500'
                                                        )}
                                                    />
                                                    {rep.gapToQuota > 0 && (
                                                        <p className="text-xs text-orange-600 mt-1">
                                                            {isRTL ? 'الفجوة:' : 'Gap:'} {formatCurrency(rep.gapToQuota)}
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* By Month Tab */}
                        <TabsContent value="by-month" className="space-y-6">
                            {/* Monthly Breakdown Chart */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-teal-500" aria-hidden="true" />
                                        {t('crm.reports.forecast.monthlyBreakdown') || (isRTL ? 'التفصيل الشهري' : 'Monthly Breakdown')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <Suspense fallback={<ChartSkeleton />}>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <ComposedChart data={mockMonthlyForecast}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="month"
                                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                                />
                                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                                                <Tooltip
                                                    formatter={(value: number) => formatCurrency(value)}
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                    }}
                                                />
                                                <Legend />
                                                <Bar dataKey="closedWon" fill="#10b981" name={isRTL ? 'مغلق بنجاح' : 'Closed Won'} radius={[0, 0, 0, 0]} />
                                                <Bar dataKey="committed" fill="#3b82f6" name={isRTL ? 'ملتزم' : 'Committed'} radius={[0, 0, 0, 0]} />
                                                <Bar dataKey="upside" fill="#8b5cf6" name={isRTL ? 'احتمالي' : 'Upside'} radius={[0, 0, 0, 0]} />
                                                <Bar dataKey="pipeline" fill="#f59e0b" name={isRTL ? 'خط المبيعات' : 'Pipeline'} radius={[8, 8, 0, 0]} />
                                                <ReferenceLine y={mockMonthlyForecast[0].quota} stroke="#ef4444" strokeDasharray="3 3" label={isRTL ? 'الحصة' : 'Quota'} />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </Suspense>
                                </CardContent>
                            </Card>

                            {/* Monthly Details Table */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-teal-500" aria-hidden="true" />
                                        {t('crm.reports.forecast.monthlyDetails') || (isRTL ? 'التفاصيل الشهرية' : 'Monthly Details')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="text-start font-bold text-slate-700">
                                                    {isRTL ? 'الشهر' : 'Month'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'مغلق بنجاح' : 'Closed Won'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'ملتزم' : 'Committed'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'احتمالي' : 'Upside'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'خط المبيعات' : 'Pipeline'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'الحصة' : 'Quota'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'تحقيق الحصة' : 'Attainment'}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockMonthlyForecast.map((month, index) => (
                                                <TableRow key={index} className="hover:bg-slate-50">
                                                    <TableCell className="font-medium text-navy">{month.month}</TableCell>
                                                    <TableCell className="text-center font-bold text-emerald-600">
                                                        {formatCurrency(month.closedWon)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-blue-600">
                                                        {formatCurrency(month.committed)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-purple-600">
                                                        {formatCurrency(month.upside)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-amber-600">
                                                        {formatCurrency(month.pipeline)}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-slate-700">
                                                        {formatCurrency(month.quota)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Badge className={cn(
                                                                "border-0",
                                                                month.quotaAttainment >= 100 ? 'bg-emerald-100 text-emerald-700' :
                                                                month.quotaAttainment >= 85 ? 'bg-blue-100 text-blue-700' :
                                                                'bg-orange-100 text-orange-700'
                                                            )}>
                                                                {formatPercentage(month.quotaAttainment)}
                                                            </Badge>
                                                            <Progress
                                                                value={Math.min(month.quotaAttainment, 100)}
                                                                className="h-1.5 w-16 bg-slate-100"
                                                                indicatorClassName={cn(
                                                                    month.quotaAttainment >= 100 ? 'bg-emerald-500' :
                                                                    month.quotaAttainment >= 85 ? 'bg-blue-500' :
                                                                    'bg-orange-500'
                                                                )}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                </div>
            </Main>
        </>
    )
}

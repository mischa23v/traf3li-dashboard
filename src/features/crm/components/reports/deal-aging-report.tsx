import { useState, useMemo, lazy, Suspense } from 'react'
import { ROUTES } from '@/constants/routes'
import { useTranslation } from 'react-i18next'
import {
    Download,
    Filter,
    Calendar,
    TrendingUp,
    AlertCircle,
    Clock,
    DollarSign,
    Target,
    Users,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    User,
    Building2,
    Activity,
    ArrowRight,
    BarChart3,
    PieChart as PieChartIcon,
    TrendingDown,
    Zap,
    Mail,
    Phone,
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
import { cn } from '@/lib/utils'
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
const useDealAgingReport = (filters: any) => {
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

// Aging bucket configuration
const AGING_BUCKETS = [
    {
        id: 'onTrack',
        label: { ar: 'على المسار الصحيح', en: 'On Track' },
        range: '0-7',
        days: { min: 0, max: 7 },
        color: '#10b981',
        bgColor: '#d1fae5',
        textColor: '#047857'
    },
    {
        id: 'monitor',
        label: { ar: 'تحت المراقبة', en: 'Monitor' },
        range: '8-14',
        days: { min: 8, max: 14 },
        color: '#fbbf24',
        bgColor: '#fef3c7',
        textColor: '#b45309'
    },
    {
        id: 'atRisk',
        label: { ar: 'في خطر', en: 'At Risk' },
        range: '15-30',
        days: { min: 15, max: 30 },
        color: '#f59e0b',
        bgColor: '#fed7aa',
        textColor: '#c2410c'
    },
    {
        id: 'critical',
        label: { ar: 'حرج', en: 'Critical' },
        range: '31-60',
        days: { min: 31, max: 60 },
        color: '#ef4444',
        bgColor: '#fecaca',
        textColor: '#991b1b'
    },
    {
        id: 'overdue',
        label: { ar: 'متأخر جداً', en: 'Overdue' },
        range: '60+',
        days: { min: 61, max: Infinity },
        color: '#991b1b',
        bgColor: '#fca5a5',
        textColor: '#7f1d1d'
    },
]

export function DealAgingReport() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    // Get first day of current month and today for default dates
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [selectedStage, setSelectedStage] = useState<string>('all')
    const [selectedOwner, setSelectedOwner] = useState<string>('all')
    const [selectedAgingBucket, setSelectedAgingBucket] = useState<string>('all')
    const [minValue, setMinValue] = useState<string>('')
    const [maxValue, setMaxValue] = useState<string>('')
    const [viewMode, setViewMode] = useState<'overview' | 'byStage' | 'byOwner'>('overview')

    const filters = useMemo(() => {
        const f: any = {}
        if (startDate) f.startDate = startDate
        if (endDate) f.endDate = endDate
        if (selectedStage && selectedStage !== 'all') f.stage = selectedStage
        if (selectedOwner && selectedOwner !== 'all') f.ownerId = selectedOwner
        if (selectedAgingBucket && selectedAgingBucket !== 'all') f.agingBucket = selectedAgingBucket
        if (minValue) f.minValue = parseInt(minValue)
        if (maxValue) f.maxValue = parseInt(maxValue)
        return f
    }, [startDate, endDate, selectedStage, selectedOwner, selectedAgingBucket, minValue, maxValue])

    const { data: reportData, isLoading, isError, error, refetch } = useDealAgingReport(filters)
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
        exportReport({ reportType: 'deal-aging', format, filters })
    }

    const getAgingBucketForDays = (days: number) => {
        return AGING_BUCKETS.find(bucket =>
            days >= bucket.days.min && days <= bucket.days.max
        ) || AGING_BUCKETS[AGING_BUCKETS.length - 1]
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
        totalStaleDeals: 47,
        valueAtRisk: 3250000,
        averageDaysStuck: 23.5,
        dealsNeedingAttention: 18,
        totalDeals: 98,
        stalePercentage: 48.0,
    }

    // Aging distribution by bucket
    const mockAgingDistribution = reportData?.agingDistribution || [
        {
            bucketId: 'onTrack',
            count: 51,
            value: 3515000,
            percentage: 52.0,
        },
        {
            bucketId: 'monitor',
            count: 18,
            value: 1240000,
            percentage: 18.4,
        },
        {
            bucketId: 'atRisk',
            count: 12,
            value: 826000,
            percentage: 12.2,
        },
        {
            bucketId: 'critical',
            count: 11,
            value: 758000,
            percentage: 11.2,
        },
        {
            bucketId: 'overdue',
            count: 6,
            value: 426000,
            percentage: 6.1,
        },
    ]

    // Deals by stage with aging breakdown
    const mockDealsByStage = reportData?.byStage || [
        {
            stageId: '1',
            stageName: isRTL ? 'عملاء مؤهلون' : 'Qualified Leads',
            totalDeals: 28,
            agingBreakdown: {
                onTrack: 15,
                monitor: 6,
                atRisk: 4,
                critical: 2,
                overdue: 1,
            },
            averageDaysInStage: 12.3,
            valueAtRisk: 825000,
        },
        {
            stageId: '2',
            stageName: isRTL ? 'تم إرسال العرض' : 'Proposal Sent',
            totalDeals: 24,
            agingBreakdown: {
                onTrack: 12,
                monitor: 5,
                atRisk: 3,
                critical: 3,
                overdue: 1,
            },
            averageDaysInStage: 18.7,
            valueAtRisk: 1120000,
        },
        {
            stageId: '3',
            stageName: isRTL ? 'التفاوض' : 'Negotiation',
            totalDeals: 21,
            agingBreakdown: {
                onTrack: 11,
                monitor: 4,
                atRisk: 2,
                critical: 3,
                overdue: 1,
            },
            averageDaysInStage: 25.4,
            valueAtRisk: 680000,
        },
        {
            stageId: '4',
            stageName: isRTL ? 'مراجعة العقد' : 'Contract Review',
            totalDeals: 15,
            agingBreakdown: {
                onTrack: 8,
                monitor: 2,
                atRisk: 2,
                critical: 2,
                overdue: 1,
            },
            averageDaysInStage: 31.2,
            valueAtRisk: 425000,
        },
        {
            stageId: '5',
            stageName: isRTL ? 'الإغلاق' : 'Closing',
            totalDeals: 10,
            agingBreakdown: {
                onTrack: 5,
                monitor: 1,
                atRisk: 1,
                critical: 1,
                overdue: 2,
            },
            averageDaysInStage: 42.8,
            valueAtRisk: 200000,
        },
    ]

    // Deals by owner
    const mockDealsByOwner = reportData?.byOwner || [
        {
            ownerId: '1',
            ownerName: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
            totalDeals: 28,
            staleDeals: 14,
            valueAtRisk: 965000,
            averageDaysStuck: 21.5,
            criticalDeals: 5,
        },
        {
            ownerId: '2',
            ownerName: isRTL ? 'سارة علي' : 'Sara Ali',
            totalDeals: 24,
            staleDeals: 10,
            valueAtRisk: 685000,
            averageDaysStuck: 18.3,
            criticalDeals: 3,
        },
        {
            ownerId: '3',
            ownerName: isRTL ? 'خالد عبدالله' : 'Khaled Abdullah',
            totalDeals: 22,
            staleDeals: 11,
            valueAtRisk: 780000,
            averageDaysStuck: 26.7,
            criticalDeals: 6,
        },
        {
            ownerId: '4',
            ownerName: isRTL ? 'فاطمة حسن' : 'Fatima Hassan',
            totalDeals: 16,
            staleDeals: 8,
            valueAtRisk: 540000,
            averageDaysStuck: 22.1,
            criticalDeals: 3,
        },
        {
            ownerId: '5',
            ownerName: isRTL ? 'محمد إبراهيم' : 'Mohammed Ibrahim',
            totalDeals: 8,
            staleDeals: 4,
            valueAtRisk: 280000,
            averageDaysStuck: 29.4,
            criticalDeals: 1,
        },
    ]

    // Individual deals data for table
    const mockDeals = reportData?.deals || [
        {
            id: 'D-001',
            name: isRTL ? 'مشروع التحول الرقمي' : 'Digital Transformation Project',
            company: isRTL ? 'شركة الابتكار التقني' : 'Tech Innovation Co.',
            value: 450000,
            stage: isRTL ? 'التفاوض' : 'Negotiation',
            daysInStage: 67,
            expectedDays: 21,
            owner: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
            lastActivity: '2024-11-15',
            priority: 'critical',
        },
        {
            id: 'D-002',
            name: isRTL ? 'نظام إدارة الموارد' : 'ERP System Implementation',
            company: isRTL ? 'المجموعة المتحدة' : 'United Group',
            value: 320000,
            stage: isRTL ? 'مراجعة العقد' : 'Contract Review',
            daysInStage: 45,
            expectedDays: 14,
            owner: isRTL ? 'سارة علي' : 'Sara Ali',
            lastActivity: '2024-11-28',
            priority: 'critical',
        },
        {
            id: 'D-003',
            name: isRTL ? 'منصة التجارة الإلكترونية' : 'E-commerce Platform',
            company: isRTL ? 'التسوق الذكي' : 'Smart Shopping',
            value: 280000,
            stage: isRTL ? 'تم إرسال العرض' : 'Proposal Sent',
            daysInStage: 38,
            expectedDays: 10,
            owner: isRTL ? 'خالد عبدالله' : 'Khaled Abdullah',
            lastActivity: '2024-12-01',
            priority: 'critical',
        },
        {
            id: 'D-004',
            name: isRTL ? 'نظام إدارة العملاء' : 'CRM System',
            company: isRTL ? 'الحلول المتقدمة' : 'Advanced Solutions',
            value: 180000,
            stage: isRTL ? 'التفاوض' : 'Negotiation',
            daysInStage: 28,
            expectedDays: 21,
            owner: isRTL ? 'فاطمة حسن' : 'Fatima Hassan',
            lastActivity: '2024-12-05',
            priority: 'atRisk',
        },
        {
            id: 'D-005',
            name: isRTL ? 'تطوير تطبيق الجوال' : 'Mobile App Development',
            company: isRTL ? 'التطبيقات الذكية' : 'Smart Apps',
            value: 150000,
            stage: isRTL ? 'عملاء مؤهلون' : 'Qualified Leads',
            daysInStage: 22,
            expectedDays: 7,
            owner: isRTL ? 'محمد إبراهيم' : 'Mohammed Ibrahim',
            lastActivity: '2024-12-08',
            priority: 'atRisk',
        },
        {
            id: 'D-006',
            name: isRTL ? 'استشارات الأمن السيبراني' : 'Cybersecurity Consulting',
            company: isRTL ? 'الحماية الرقمية' : 'Digital Protection',
            value: 125000,
            stage: isRTL ? 'تم إرسال العرض' : 'Proposal Sent',
            daysInStage: 18,
            expectedDays: 10,
            owner: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
            lastActivity: '2024-12-12',
            priority: 'atRisk',
        },
        {
            id: 'D-007',
            name: isRTL ? 'حلول الحوسبة السحابية' : 'Cloud Solutions',
            company: isRTL ? 'السحابة الذكية' : 'Smart Cloud',
            value: 95000,
            stage: isRTL ? 'عملاء مؤهلون' : 'Qualified Leads',
            daysInStage: 12,
            expectedDays: 7,
            owner: isRTL ? 'سارة علي' : 'Sara Ali',
            lastActivity: '2024-12-18',
            priority: 'monitor',
        },
        {
            id: 'D-008',
            name: isRTL ? 'تدريب تكنولوجيا المعلومات' : 'IT Training Program',
            company: isRTL ? 'أكاديمية التقنية' : 'Tech Academy',
            value: 75000,
            stage: isRTL ? 'التفاوض' : 'Negotiation',
            daysInStage: 9,
            expectedDays: 21,
            owner: isRTL ? 'خالد عبدالله' : 'Khaled Abdullah',
            lastActivity: '2024-12-21',
            priority: 'onTrack',
        },
    ]

    // Aging trend over time
    const mockAgingTrend = reportData?.agingTrend || [
        {
            month: isRTL ? 'أغسطس' : 'Aug',
            averageDays: 18.2,
            staleDeals: 32,
            valueAtRisk: 2150000,
        },
        {
            month: isRTL ? 'سبتمبر' : 'Sep',
            averageDays: 19.8,
            staleDeals: 35,
            valueAtRisk: 2380000,
        },
        {
            month: isRTL ? 'أكتوبر' : 'Oct',
            averageDays: 21.5,
            staleDeals: 41,
            valueAtRisk: 2850000,
        },
        {
            month: isRTL ? 'نوفمبر' : 'Nov',
            averageDays: 22.8,
            staleDeals: 44,
            valueAtRisk: 3050000,
        },
        {
            month: isRTL ? 'ديسمبر' : 'Dec',
            averageDays: 23.5,
            staleDeals: 47,
            valueAtRisk: 3250000,
        },
    ]

    // Prepare chart data for stacked bar (deals by stage and aging)
    const stackedBarData = mockDealsByStage.map(stage => ({
        stage: stage.stageName,
        [isRTL ? 'على المسار' : 'On Track']: stage.agingBreakdown.onTrack,
        [isRTL ? 'مراقبة' : 'Monitor']: stage.agingBreakdown.monitor,
        [isRTL ? 'في خطر' : 'At Risk']: stage.agingBreakdown.atRisk,
        [isRTL ? 'حرج' : 'Critical']: stage.agingBreakdown.critical,
        [isRTL ? 'متأخر' : 'Overdue']: stage.agingBreakdown.overdue,
    }))

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
                    <div className="bg-gradient-to-br from-orange-600 via-red-600 to-rose-700 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-300/20 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                        <Clock className="w-3 h-3 ms-2" aria-hidden="true" />
                                        {t('crm.reports.dealAging.badge')}
                                    </Badge>
                                    {mockSummary.dealsNeedingAttention > 0 && (
                                        <Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-0 animate-pulse">
                                            <AlertTriangle className="w-3 h-3 ms-2" aria-hidden="true" />
                                            {mockSummary.dealsNeedingAttention} {t('crm.reports.dealAging.needsAttention')}
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    {t('crm.reports.dealAging.title')}
                                </h1>
                                <p className="text-orange-100/80">
                                    {t('crm.reports.dealAging.description')}
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
                                    className="bg-white text-orange-700 hover:bg-orange-50 rounded-xl shadow-lg"
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
                                    {t('crm.reports.dealAging.filters')}:
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.dealAging.startDate')}
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
                                        {t('crm.reports.dealAging.endDate')}
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
                                        {t('crm.reports.dealAging.stage')}
                                    </Label>
                                    <Select value={selectedStage} onValueChange={setSelectedStage}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={t('crm.reports.dealAging.allStages')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('crm.reports.dealAging.allStages')}</SelectItem>
                                            <SelectItem value="qualified">{isRTL ? 'عملاء مؤهلون' : 'Qualified Leads'}</SelectItem>
                                            <SelectItem value="proposal">{isRTL ? 'تم إرسال العرض' : 'Proposal Sent'}</SelectItem>
                                            <SelectItem value="negotiation">{isRTL ? 'التفاوض' : 'Negotiation'}</SelectItem>
                                            <SelectItem value="contract">{isRTL ? 'مراجعة العقد' : 'Contract Review'}</SelectItem>
                                            <SelectItem value="closing">{isRTL ? 'الإغلاق' : 'Closing'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.dealAging.owner')}
                                    </Label>
                                    <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={t('crm.reports.dealAging.allOwners')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('crm.reports.dealAging.allOwners')}</SelectItem>
                                            {mockDealsByOwner.map((owner) => (
                                                <SelectItem key={owner.ownerId} value={owner.ownerId}>
                                                    {owner.ownerName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.dealAging.agingBucket')}
                                    </Label>
                                    <Select value={selectedAgingBucket} onValueChange={setSelectedAgingBucket}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={t('crm.reports.dealAging.allBuckets')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('crm.reports.dealAging.allBuckets')}</SelectItem>
                                            {AGING_BUCKETS.map((bucket) => (
                                                <SelectItem key={bucket.id} value={bucket.id}>
                                                    {isRTL ? bucket.label.ar : bucket.label.en} ({bucket.range} {t('crm.reports.dealAging.days')})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.dealAging.valueRange')}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder={t('crm.reports.dealAging.minValue')}
                                            value={minValue}
                                            onChange={(e) => setMinValue(e.target.value)}
                                            className="rounded-xl border-slate-200"
                                        />
                                        <Input
                                            type="number"
                                            placeholder={t('crm.reports.dealAging.maxValue')}
                                            value={maxValue}
                                            onChange={(e) => setMaxValue(e.target.value)}
                                            className="rounded-xl border-slate-200"
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
                                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.dealAging.totalStaleDeals')}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.totalStaleDeals}</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {formatPercentage(mockSummary.stalePercentage)} {t('crm.reports.dealAging.ofTotal')} ({mockSummary.totalDeals})
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-orange-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.dealAging.valueAtRisk')}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.valueAtRisk)}</div>
                                <div className="mt-2">
                                    <Progress
                                        value={mockSummary.stalePercentage}
                                        className="h-1.5 bg-orange-100"
                                        indicatorClassName="bg-orange-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-purple-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.dealAging.averageDaysStuck')}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.averageDaysStuck} {t('crm.reports.dealAging.days')}</div>
                                <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                                    <TrendingUp className="w-3 h-3" aria-hidden="true" />
                                    {t('crm.reports.dealAging.increasing')}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                                        <Target className="w-5 h-5 text-yellow-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.dealAging.dealsNeedingAttention')}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.dealsNeedingAttention}</div>
                                <div className="mt-2 text-xs text-yellow-700 font-medium flex items-center gap-1">
                                    <Zap className="w-3 h-3" aria-hidden="true" />
                                    {t('crm.reports.dealAging.actionRequired')}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Aging Buckets Legend */}
                    <Card className="border-0 shadow-sm rounded-2xl bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <span className="text-sm font-medium text-slate-600">
                                    {t('crm.reports.dealAging.agingBuckets')}:
                                </span>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {AGING_BUCKETS.map((bucket) => (
                                        <div key={bucket.id} className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: bucket.color }}
                                            />
                                            <span className="text-xs text-slate-600">
                                                {isRTL ? bucket.label.ar : bucket.label.en} ({bucket.range} {t('crm.reports.dealAging.days')})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Content with Tabs */}
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-6">
                        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
                            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                <PieChartIcon className="w-4 h-4 ms-2" aria-hidden="true" />
                                {t('crm.reports.dealAging.overview')}
                            </TabsTrigger>
                            <TabsTrigger value="byStage" className="rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                <BarChart3 className="w-4 h-4 ms-2" aria-hidden="true" />
                                {t('crm.reports.dealAging.byStage')}
                            </TabsTrigger>
                            <TabsTrigger value="byOwner" className="rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                <Users className="w-4 h-4 ms-2" aria-hidden="true" />
                                {t('crm.reports.dealAging.byOwner')}
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Donut Chart - Value Distribution by Aging Bucket */}
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <PieChartIcon className="w-5 h-5 text-orange-500" aria-hidden="true" />
                                            {t('crm.reports.dealAging.valueDistribution')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Suspense fallback={<ChartSkeleton />}>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={mockAgingDistribution}
                                                        dataKey="value"
                                                        nameKey="bucketId"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={2}
                                                        label={(entry) => formatCurrency(entry.value)}
                                                    >
                                                        {mockAgingDistribution.map((entry, index) => {
                                                            const bucket = AGING_BUCKETS.find(b => b.id === entry.bucketId)
                                                            return <Cell key={`cell-${index}`} fill={bucket?.color || '#94a3b8'} />
                                                        })}
                                                    </Pie>
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
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Suspense>
                                    </CardContent>
                                </Card>

                                {/* Aging Trend Line Chart */}
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-orange-500" aria-hidden="true" />
                                            {t('crm.reports.dealAging.agingTrend')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Suspense fallback={<ChartSkeleton />}>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={mockAgingTrend}>
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
                                                    <Line
                                                        type="monotone"
                                                        dataKey="averageDays"
                                                        stroke="#f97316"
                                                        strokeWidth={3}
                                                        name={t('crm.reports.dealAging.averageDays')}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="staleDeals"
                                                        stroke="#dc2626"
                                                        strokeWidth={2}
                                                        name={t('crm.reports.dealAging.staleDeals')}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Suspense>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Deals Table */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Target className="w-5 h-5 text-orange-500" aria-hidden="true" />
                                            {t('crm.reports.dealAging.dealDetails')}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockDeals.length} {t('crm.reports.dealAging.deals')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.dealAging.dealName')}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.dealAging.company')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.dealAging.value')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.dealAging.stage')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.dealAging.daysInStage')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.dealAging.progress')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.dealAging.owner')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.dealAging.lastActivity')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.dealAging.actions')}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockDeals.map((deal) => {
                                                    const bucket = getAgingBucketForDays(deal.daysInStage)
                                                    const progressPercentage = Math.min((deal.daysInStage / deal.expectedDays) * 100, 100)
                                                    const isOverdue = deal.daysInStage > deal.expectedDays

                                                    return (
                                                        <TableRow
                                                            key={deal.id}
                                                            className={cn(
                                                                "hover:bg-slate-50",
                                                                deal.priority === 'critical' && "bg-red-50/30"
                                                            )}
                                                        >
                                                            <TableCell className="font-medium text-navy">
                                                                <div className="flex items-center gap-2">
                                                                    {deal.priority === 'critical' && (
                                                                        <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" aria-hidden="true" />
                                                                    )}
                                                                    <div>
                                                                        <div className="font-medium">{deal.name}</div>
                                                                        <div className="text-xs text-slate-500">{deal.id}</div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Building2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
                                                                    <span className="text-sm text-slate-600">{deal.company}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-navy">
                                                                {formatCurrency(deal.value)}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant="outline" className="border-slate-200">
                                                                    {deal.stage}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge
                                                                    className="border-0"
                                                                    style={{
                                                                        backgroundColor: bucket.bgColor,
                                                                        color: bucket.textColor,
                                                                    }}
                                                                >
                                                                    {deal.daysInStage} {t('crm.reports.dealAging.days')}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <Progress
                                                                            value={progressPercentage}
                                                                            className="h-2 w-20 bg-slate-100"
                                                                            indicatorClassName={cn(
                                                                                isOverdue ? "bg-red-500" : "bg-emerald-500"
                                                                            )}
                                                                        />
                                                                        {isOverdue && (
                                                                            <AlertTriangle className="w-3 h-3 text-red-600" aria-hidden="true" />
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">
                                                                        {t('crm.reports.dealAging.expected')}: {deal.expectedDays} {t('crm.reports.dealAging.days')}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <User className="w-4 h-4 text-slate-400" aria-hidden="true" />
                                                                    <span className="text-sm text-slate-600">{deal.owner}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className="text-sm text-slate-600">
                                                                    {new Date(deal.lastActivity).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="rounded-lg text-xs h-7"
                                                                    >
                                                                        <Mail className="w-3 h-3 ms-1" aria-hidden="true" />
                                                                        {t('crm.reports.dealAging.contact')}
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="rounded-lg text-xs h-7"
                                                                    >
                                                                        <ArrowRight className="w-3 h-3 ms-1" aria-hidden="true" />
                                                                        {t('crm.reports.dealAging.view')}
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* By Stage Tab */}
                        <TabsContent value="byStage" className="space-y-6">
                            {/* Stacked Bar Chart */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-orange-500" aria-hidden="true" />
                                        {t('crm.reports.dealAging.dealsByStageAndAging')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <Suspense fallback={<ChartSkeleton />}>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart data={stackedBarData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="stage"
                                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                                    angle={-15}
                                                    textAnchor="end"
                                                    height={100}
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
                                                <Bar dataKey={isRTL ? 'على المسار' : 'On Track'} stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                                                <Bar dataKey={isRTL ? 'مراقبة' : 'Monitor'} stackId="a" fill="#fbbf24" radius={[0, 0, 0, 0]} />
                                                <Bar dataKey={isRTL ? 'في خطر' : 'At Risk'} stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                                                <Bar dataKey={isRTL ? 'حرج' : 'Critical'} stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                                                <Bar dataKey={isRTL ? 'متأخر' : 'Overdue'} stackId="a" fill="#991b1b" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Suspense>
                                </CardContent>
                            </Card>

                            {/* Stage Details Table */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Target className="w-5 h-5 text-orange-500" aria-hidden="true" />
                                        {t('crm.reports.dealAging.stageAnalysis')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="text-start font-bold text-slate-700">
                                                    {t('crm.reports.dealAging.stage')}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {t('crm.reports.dealAging.totalDeals')}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {t('crm.reports.dealAging.averageDaysInStage')}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {t('crm.reports.dealAging.valueAtRisk')}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {t('crm.reports.dealAging.criticalOverdue')}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockDealsByStage.map((stage) => (
                                                <TableRow key={stage.stageId} className="hover:bg-slate-50">
                                                    <TableCell className="font-medium text-navy">
                                                        {stage.stageName}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="border-slate-200">
                                                            {stage.totalDeals}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            className={cn(
                                                                "border-0",
                                                                stage.averageDaysInStage > 30 ? "bg-red-100 text-red-700" :
                                                                stage.averageDaysInStage > 20 ? "bg-orange-100 text-orange-700" :
                                                                stage.averageDaysInStage > 10 ? "bg-yellow-100 text-yellow-700" :
                                                                "bg-emerald-100 text-emerald-700"
                                                            )}
                                                        >
                                                            {stage.averageDaysInStage} {t('crm.reports.dealAging.days')}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-navy">
                                                        {formatCurrency(stage.valueAtRisk)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Badge className="bg-red-100 text-red-700 border-0">
                                                                {stage.agingBreakdown.critical + stage.agingBreakdown.overdue}
                                                            </Badge>
                                                            {(stage.agingBreakdown.critical + stage.agingBreakdown.overdue) > 3 && (
                                                                <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* By Owner Tab */}
                        <TabsContent value="byOwner" className="space-y-6">
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Users className="w-5 h-5 text-orange-500" aria-hidden="true" />
                                            {t('crm.reports.dealAging.ownerPerformance')}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockDealsByOwner.length} {t('crm.reports.dealAging.owners')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {mockDealsByOwner.map((owner) => (
                                        <Card key={owner.ownerId} className="border border-slate-100 shadow-none">
                                            <CardContent className="p-5 space-y-4">
                                                {/* Owner Header */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                                                            {owner.ownerName.split(' ')[0][0]}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-navy text-lg">{owner.ownerName}</h3>
                                                            <p className="text-sm text-slate-500">
                                                                {owner.totalDeals} {t('crm.reports.dealAging.totalDeals')} • {owner.staleDeals} {t('crm.reports.dealAging.stale')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {owner.criticalDeals > 0 && (
                                                        <Badge className="bg-red-100 text-red-700 border-0 animate-pulse">
                                                            <AlertCircle className="w-3 h-3 ms-1" aria-hidden="true" />
                                                            {owner.criticalDeals} {t('crm.reports.dealAging.critical')}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Performance Metrics */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="bg-orange-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <DollarSign className="w-4 h-4 text-orange-600" aria-hidden="true" />
                                                            <span className="text-xs text-orange-700">{t('crm.reports.dealAging.valueAtRisk')}</span>
                                                        </div>
                                                        <div className="text-lg font-bold text-orange-700">{formatCurrency(owner.valueAtRisk)}</div>
                                                    </div>
                                                    <div className="bg-purple-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Clock className="w-4 h-4 text-purple-600" aria-hidden="true" />
                                                            <span className="text-xs text-purple-700">{t('crm.reports.dealAging.avgDaysStuck')}</span>
                                                        </div>
                                                        <div className="text-lg font-bold text-purple-700">{owner.averageDaysStuck} {t('crm.reports.dealAging.days')}</div>
                                                    </div>
                                                    <div className="bg-red-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
                                                            <span className="text-xs text-red-700">{t('crm.reports.dealAging.staleRate')}</span>
                                                        </div>
                                                        <div className="text-lg font-bold text-red-700">
                                                            {formatPercentage((owner.staleDeals / owner.totalDeals) * 100)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stale Progress */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-slate-600">{t('crm.reports.dealAging.staleProgress')}</span>
                                                        <span className="text-sm font-medium text-navy">
                                                            {owner.staleDeals} {t('crm.reports.dealAging.of')} {owner.totalDeals}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={(owner.staleDeals / owner.totalDeals) * 100}
                                                        className="h-2 bg-slate-100"
                                                        indicatorClassName={cn(
                                                            (owner.staleDeals / owner.totalDeals) > 0.5 ? "bg-red-500" :
                                                            (owner.staleDeals / owner.totalDeals) > 0.3 ? "bg-orange-500" :
                                                            "bg-emerald-500"
                                                        )}
                                                    />
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="rounded-lg flex-1">
                                                        <Mail className="w-3 h-3 ms-1" aria-hidden="true" />
                                                        {t('crm.reports.dealAging.sendReminder')}
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="rounded-lg flex-1">
                                                        <Phone className="w-3 h-3 ms-1" aria-hidden="true" />
                                                        {t('crm.reports.dealAging.schedule1on1')}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                </div>
            </Main>
        </>
    )
}

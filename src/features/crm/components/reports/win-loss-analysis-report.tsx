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
    XCircle,
    CheckCircle2,
    Clock,
    Briefcase,
    Building2,
    Zap,
    AlertTriangle,
    CircleDashed,
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
const useWinLossReport = (filters: any) => {
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

export function WinLossAnalysisReport() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    // Get first day of year and today for default dates
    const today = new Date()
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1)

    const [startDate, setStartDate] = useState(firstDayOfYear.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [selectedOwner, setSelectedOwner] = useState<string>('all')
    const [selectedTeam, setSelectedTeam] = useState<string>('all')
    const [selectedLostReason, setSelectedLostReason] = useState<string>('all')
    const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all')
    const [minDealValue, setMinDealValue] = useState<string>('')
    const [maxDealValue, setMaxDealValue] = useState<string>('')
    const [activeTab, setActiveTab] = useState<'won' | 'lost' | 'noDecision'>('won')

    const filters = useMemo(() => {
        const f: any = {}
        if (startDate) f.startDate = startDate
        if (endDate) f.endDate = endDate
        if (selectedOwner && selectedOwner !== 'all') f.ownerId = selectedOwner
        if (selectedTeam && selectedTeam !== 'all') f.teamId = selectedTeam
        if (selectedLostReason && selectedLostReason !== 'all') f.lostReason = selectedLostReason
        if (selectedCompetitor && selectedCompetitor !== 'all') f.competitorId = selectedCompetitor
        if (minDealValue) f.minDealValue = parseInt(minDealValue)
        if (maxDealValue) f.maxDealValue = parseInt(maxDealValue)
        return f
    }, [startDate, endDate, selectedOwner, selectedTeam, selectedLostReason, selectedCompetitor, minDealValue, maxDealValue])

    const { data: reportData, isLoading, isError, error, refetch } = useWinLossReport(filters)
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
        exportReport({ reportType: 'win-loss-analysis', format, filters })
    }

    const topNav = [
        { title: t('crm.leads.title') || (isRTL ? 'العملاء المحتملين' : 'Leads'), href: ROUTES.dashboard.crm.leads.list, isActive: false },
        { title: t('crm.pipeline.title') || (isRTL ? 'مسار المبيعات' : 'Pipeline'), href: ROUTES.dashboard.crm.pipeline, isActive: false },
        { title: t('crm.referrals.title') || (isRTL ? 'الإحالات' : 'Referrals'), href: ROUTES.dashboard.crm.referrals.list, isActive: false },
        { title: t('crm.activities.title') || (isRTL ? 'الأنشطة' : 'Activities'), href: ROUTES.dashboard.crm.activities.list, isActive: false },
        { title: t('crm.reports.title') || (isRTL ? 'التقارير' : 'Reports'), href: ROUTES.dashboard.crm.reports.list, isActive: true },
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
                            {t('crm.reports.winLoss.loadError') || (isRTL ? 'فشل تحميل التقرير' : 'Failed to Load Report')}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {error?.message || (isRTL ? 'حدث خطأ أثناء تحميل البيانات' : 'An error occurred while loading the data')}
                        </p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            {t('common.retry') || (isRTL ? 'إعادة المحاولة' : 'Retry')}
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // Mock data for development - will be replaced by API
    const mockSummary = reportData?.summary || {
        totalClosedDeals: 234,
        wonDeals: 156,
        lostDeals: 62,
        noDecisionDeals: 16,
        winRate: 66.7, // 156/234 * 100
        totalWonValue: 11280000,
        totalLostValue: 4340000,
        noDecisionRate: 6.8, // 16/234 * 100
        avgWonDealSize: 72308,
        avgLostDealSize: 70000,
        avgDaysToWin: 42,
        avgDaysToLose: 38,
    }

    // Distribution data for donut chart
    const mockDistributionData = reportData?.distribution || [
        {
            name: t('crm.reports.winLoss.won') || (isRTL ? 'فائز' : 'Won'),
            value: mockSummary.wonDeals,
            percentage: mockSummary.winRate,
            color: '#10b981',
        },
        {
            name: t('crm.reports.winLoss.lost') || (isRTL ? 'خاسر' : 'Lost'),
            value: mockSummary.lostDeals,
            percentage: (mockSummary.lostDeals / mockSummary.totalClosedDeals) * 100,
            color: '#ef4444',
        },
        {
            name: t('crm.reports.winLoss.noDecision') || (isRTL ? 'لا قرار' : 'No Decision'),
            value: mockSummary.noDecisionDeals,
            percentage: mockSummary.noDecisionRate,
            color: '#94a3b8',
        },
    ]

    // Top 10 Lost Reasons
    const mockLostReasons = reportData?.lostReasons || [
        {
            reason: t('crm.reports.winLoss.reasons.priceTooHigh') || (isRTL ? 'السعر مرتفع جداً' : 'Price Too High'),
            count: 18,
            percentage: 29.0,
            avgLostValue: 78000,
            color: '#ef4444',
        },
        {
            reason: t('crm.reports.winLoss.reasons.competitorWon') || (isRTL ? 'فاز المنافس' : 'Competitor Won'),
            count: 15,
            percentage: 24.2,
            avgLostValue: 82000,
            color: '#f97316',
        },
        {
            reason: t('crm.reports.winLoss.reasons.noBudget') || (isRTL ? 'لا ميزانية' : 'No Budget'),
            count: 12,
            percentage: 19.4,
            avgLostValue: 65000,
            color: '#f59e0b',
        },
        {
            reason: t('crm.reports.winLoss.reasons.timing') || (isRTL ? 'التوقيت / لا قرار' : 'No Decision/Timing'),
            count: 8,
            percentage: 12.9,
            avgLostValue: 58000,
            color: '#eab308',
        },
        {
            reason: t('crm.reports.winLoss.reasons.productFit') || (isRTL ? 'ملاءمة المنتج' : 'Product Fit'),
            count: 4,
            percentage: 6.5,
            avgLostValue: 52000,
            color: '#84cc16',
        },
        {
            reason: t('crm.reports.winLoss.reasons.relationship') || (isRTL ? 'العلاقة / الثقة' : 'Relationship/Trust'),
            count: 3,
            percentage: 4.8,
            avgLostValue: 48000,
            color: '#22c55e',
        },
        {
            reason: t('crm.reports.winLoss.reasons.internalPolitics') || (isRTL ? 'سياسات داخلية' : 'Internal Politics'),
            count: 1,
            percentage: 1.6,
            avgLostValue: 95000,
            color: '#14b8a6',
        },
        {
            reason: t('crm.reports.winLoss.reasons.other') || (isRTL ? 'أخرى' : 'Other'),
            count: 1,
            percentage: 1.6,
            avgLostValue: 45000,
            color: '#06b6d4',
        },
    ]

    // Win rate trend over time (monthly)
    const mockWinRateTrend = reportData?.winRateTrend || [
        {
            month: isRTL ? 'يناير' : 'Jan',
            winRate: 62.5,
            wonDeals: 25,
            lostDeals: 15,
        },
        {
            month: isRTL ? 'فبراير' : 'Feb',
            winRate: 64.3,
            wonDeals: 27,
            lostDeals: 15,
        },
        {
            month: isRTL ? 'مارس' : 'Mar',
            winRate: 68.2,
            wonDeals: 30,
            lostDeals: 14,
        },
        {
            month: isRTL ? 'أبريل' : 'Apr',
            winRate: 65.0,
            wonDeals: 26,
            lostDeals: 14,
        },
        {
            month: isRTL ? 'مايو' : 'May',
            winRate: 70.0,
            wonDeals: 28,
            lostDeals: 12,
        },
        {
            month: isRTL ? 'يونيو' : 'Jun',
            winRate: 66.7,
            wonDeals: 20,
            lostDeals: 10,
        },
    ]

    // Competitor Analysis
    const mockCompetitorData = reportData?.competitors || [
        {
            competitorName: 'Competitor A',
            lostCount: 8,
            winAgainstCount: 12,
            winRate: 60.0,
            avgLostDealValue: 85000,
            commonObjections: [
                isRTL ? 'أسعار أقل' : 'Lower prices',
                isRTL ? 'علاقات أفضل' : 'Better relationships',
            ],
        },
        {
            competitorName: 'Competitor B',
            lostCount: 5,
            winAgainstCount: 8,
            winRate: 61.5,
            avgLostDealValue: 78000,
            commonObjections: [
                isRTL ? 'ميزات إضافية' : 'More features',
                isRTL ? 'شهرة العلامة' : 'Brand recognition',
            ],
        },
        {
            competitorName: 'Competitor C',
            lostCount: 2,
            winAgainstCount: 15,
            winRate: 88.2,
            avgLostDealValue: 92000,
            commonObjections: [
                isRTL ? 'تواجد محلي' : 'Local presence',
            ],
        },
    ]

    // Stage Drop-off Analysis
    const mockStageDropOff = reportData?.stageDropOff || [
        {
            stageName: isRTL ? 'مؤهل' : 'Qualified',
            lostCount: 8,
            percentage: 12.9,
            avgDaysInStage: 12,
        },
        {
            stageName: isRTL ? 'عرض تقديمي' : 'Proposal',
            lostCount: 22,
            percentage: 35.5,
            avgDaysInStage: 18,
        },
        {
            stageName: isRTL ? 'التفاوض' : 'Negotiation',
            lostCount: 18,
            percentage: 29.0,
            avgDaysInStage: 25,
        },
        {
            stageName: isRTL ? 'مراجعة العقد' : 'Contract Review',
            lostCount: 14,
            percentage: 22.6,
            avgDaysInStage: 32,
        },
    ]

    // Mock Won Deals
    const mockWonDeals = useMemo(() => reportData?.wonDeals || [
        {
            dealId: '1',
            dealName: 'Enterprise Software License',
            company: 'Acme Corporation',
            value: 125000,
            closeDate: '2024-06-15',
            daysToClose: 45,
            source: 'Referral',
            owner: 'Ahmed Hassan',
            sizeCategory: isRTL ? 'كبير' : 'Large',
        },
        {
            dealId: '2',
            dealName: 'Cloud Migration Project',
            company: 'Tech Innovations Ltd',
            value: 98000,
            closeDate: '2024-06-10',
            daysToClose: 38,
            source: 'Website',
            owner: 'Sarah Ali',
            sizeCategory: isRTL ? 'متوسط' : 'Medium',
        },
        {
            dealId: '3',
            dealName: 'Security Assessment',
            company: 'Global Finance Inc',
            value: 52000,
            closeDate: '2024-06-08',
            daysToClose: 28,
            source: 'LinkedIn',
            owner: 'Mohammed Ibrahim',
            sizeCategory: isRTL ? 'متوسط' : 'Medium',
        },
        {
            dealId: '4',
            dealName: 'Data Analytics Platform',
            company: 'Retail Chain Co',
            value: 145000,
            closeDate: '2024-06-05',
            daysToClose: 52,
            source: 'Google Ads',
            owner: 'Ahmed Hassan',
            sizeCategory: isRTL ? 'كبير' : 'Large',
        },
        {
            dealId: '5',
            dealName: 'Mobile App Development',
            company: 'StartupXYZ',
            value: 78000,
            closeDate: '2024-06-01',
            daysToClose: 35,
            source: 'Referral',
            owner: 'Sarah Ali',
            sizeCategory: isRTL ? 'متوسط' : 'Medium',
        },
    ], [reportData, isRTL])

    // Mock Lost Deals
    const mockLostDeals = useMemo(() => reportData?.lostDeals || [
        {
            dealId: '101',
            dealName: 'ERP Implementation',
            company: 'Manufacturing Corp',
            value: 185000,
            closeDate: '2024-06-12',
            lostReason: isRTL ? 'السعر مرتفع جداً' : 'Price Too High',
            competitor: 'Competitor A',
            stageWhenLost: isRTL ? 'التفاوض' : 'Negotiation',
            owner: 'Mohammed Ibrahim',
            sizeCategory: isRTL ? 'كبير' : 'Large',
        },
        {
            dealId: '102',
            dealName: 'CRM System Upgrade',
            company: 'Sales Company LLC',
            value: 68000,
            closeDate: '2024-06-08',
            lostReason: isRTL ? 'فاز المنافس' : 'Competitor Won',
            competitor: 'Competitor B',
            stageWhenLost: isRTL ? 'عرض تقديمي' : 'Proposal',
            owner: 'Ahmed Hassan',
            sizeCategory: isRTL ? 'متوسط' : 'Medium',
        },
        {
            dealId: '103',
            dealName: 'Website Redesign',
            company: 'Marketing Agency',
            value: 45000,
            closeDate: '2024-06-03',
            lostReason: isRTL ? 'لا ميزانية' : 'No Budget',
            competitor: 'N/A',
            stageWhenLost: isRTL ? 'مؤهل' : 'Qualified',
            owner: 'Sarah Ali',
            sizeCategory: isRTL ? 'صغير' : 'Small',
        },
        {
            dealId: '104',
            dealName: 'Training Program',
            company: 'Education Institute',
            value: 92000,
            closeDate: '2024-05-28',
            lostReason: isRTL ? 'التوقيت / لا قرار' : 'No Decision/Timing',
            competitor: 'N/A',
            stageWhenLost: isRTL ? 'عرض تقديمي' : 'Proposal',
            owner: 'Mohammed Ibrahim',
            sizeCategory: isRTL ? 'متوسط' : 'Medium',
        },
    ], [reportData, isRTL])

    // Mock No Decision Deals
    const mockNoDecisionDeals = useMemo(() => reportData?.noDecisionDeals || [
        {
            dealId: '201',
            dealName: 'Consulting Services',
            company: 'Professional Services',
            value: 55000,
            lastContactDate: '2024-05-15',
            daysSinceContact: 46,
            owner: 'Ahmed Hassan',
            sizeCategory: isRTL ? 'متوسط' : 'Medium',
        },
        {
            dealId: '202',
            dealName: 'IT Infrastructure',
            company: 'Healthcare Provider',
            value: 125000,
            lastContactDate: '2024-04-20',
            daysSinceContact: 71,
            owner: 'Sarah Ali',
            sizeCategory: isRTL ? 'كبير' : 'Large',
        },
        {
            dealId: '203',
            dealName: 'Software License',
            company: 'Government Agency',
            value: 88000,
            lastContactDate: '2024-03-10',
            daysSinceContact: 112,
            owner: 'Mohammed Ibrahim',
            sizeCategory: isRTL ? 'متوسط' : 'Medium',
        },
    ], [reportData, isRTL])

    const COLORS = ['#10b981', '#ef4444', '#94a3b8']

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
                    <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-300/20 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                        <Target className="w-3 h-3 ms-2" aria-hidden="true" />
                                        {t('crm.reports.winLoss.badge') || (isRTL ? 'تحليل الفوز والخسارة' : 'Win/Loss Analysis')}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    {t('crm.reports.winLoss.title') || (isRTL ? 'تقرير تحليل الفوز والخسارة' : 'Win/Loss Analysis Report')}
                                </h1>
                                <p className="text-emerald-100/80">
                                    {t('crm.reports.winLoss.subtitle') || (isRTL ? 'تحليل شامل لأسباب الفوز والخسارة ومعدلات النجاح' : 'Comprehensive analysis of win/loss reasons and success rates')}
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
                                    className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl shadow-lg"
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
                                    {t('crm.reports.winLoss.filters') || (isRTL ? 'الفلاتر:' : 'Filters:')}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.winLoss.startDate') || (isRTL ? 'من تاريخ' : 'Start Date')}
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
                                        {t('crm.reports.winLoss.endDate') || (isRTL ? 'إلى تاريخ' : 'End Date')}
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
                                        {t('crm.reports.winLoss.owner') || (isRTL ? 'المالك' : 'Owner')}
                                    </Label>
                                    <Select value={selectedOwner} onValueChange={setSelectedOwner}>
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
                                        {t('crm.reports.winLoss.team') || (isRTL ? 'الفريق' : 'Team')}
                                    </Label>
                                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'جميع الفرق' : 'All Teams'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'جميع الفرق' : 'All Teams'}</SelectItem>
                                            <SelectItem value="sales">{isRTL ? 'المبيعات' : 'Sales'}</SelectItem>
                                            <SelectItem value="enterprise">{isRTL ? 'المؤسسات' : 'Enterprise'}</SelectItem>
                                            <SelectItem value="smb">{isRTL ? 'الشركات الصغيرة' : 'SMB'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.winLoss.lostReason') || (isRTL ? 'سبب الخسارة' : 'Lost Reason')}
                                    </Label>
                                    <Select value={selectedLostReason} onValueChange={setSelectedLostReason}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'جميع الأسباب' : 'All Reasons'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'جميع الأسباب' : 'All Reasons'}</SelectItem>
                                            <SelectItem value="price">{isRTL ? 'السعر' : 'Price'}</SelectItem>
                                            <SelectItem value="competitor">{isRTL ? 'المنافس' : 'Competitor'}</SelectItem>
                                            <SelectItem value="budget">{isRTL ? 'الميزانية' : 'Budget'}</SelectItem>
                                            <SelectItem value="timing">{isRTL ? 'التوقيت' : 'Timing'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.winLoss.competitor') || (isRTL ? 'المنافس' : 'Competitor')}
                                    </Label>
                                    <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'الجميع' : 'All'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'الجميع' : 'All'}</SelectItem>
                                            <SelectItem value="a">Competitor A</SelectItem>
                                            <SelectItem value="b">Competitor B</SelectItem>
                                            <SelectItem value="c">Competitor C</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {t('crm.reports.winLoss.dealSizeRange') || (isRTL ? 'نطاق حجم الصفقة' : 'Deal Size Range')}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder={isRTL ? 'من' : 'Min'}
                                            value={minDealValue}
                                            onChange={(e) => setMinDealValue(e.target.value)}
                                            className="rounded-xl border-slate-200"
                                        />
                                        <Input
                                            type="number"
                                            placeholder={isRTL ? 'إلى' : 'Max'}
                                            value={maxDealValue}
                                            onChange={(e) => setMaxDealValue(e.target.value)}
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
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.winLoss.winRate') || (isRTL ? 'معدل الفوز' : 'Win Rate')}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatPercentage(mockSummary.winRate)}</div>
                                <div className="mt-2">
                                    <Progress
                                        value={mockSummary.winRate}
                                        className="h-1.5 bg-emerald-100"
                                        indicatorClassName="bg-emerald-500"
                                    />
                                </div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {mockSummary.wonDeals} {t('crm.reports.winLoss.of') || (isRTL ? 'من' : 'of')} {mockSummary.totalClosedDeals} {t('crm.reports.winLoss.deals') || (isRTL ? 'صفقة' : 'deals')}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.winLoss.totalWonValue') || (isRTL ? 'إجمالي قيمة الفوز' : 'Total Won Value')}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.totalWonValue)}</div>
                                <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                                    {mockSummary.wonDeals} {t('crm.reports.winLoss.wonDeals') || (isRTL ? 'صفقات فائزة' : 'won deals')}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                        <XCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.winLoss.totalLostValue') || (isRTL ? 'إجمالي قيمة الخسارة' : 'Total Lost Value')}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.totalLostValue)}</div>
                                <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                    <XCircle className="w-3 h-3" aria-hidden="true" />
                                    {mockSummary.lostDeals} {t('crm.reports.winLoss.lostDeals') || (isRTL ? 'صفقات خاسرة' : 'lost deals')}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <CircleDashed className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {t('crm.reports.winLoss.noDecisionRate') || (isRTL ? 'معدل عدم القرار' : 'No Decision Rate')}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatPercentage(mockSummary.noDecisionRate)}</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {mockSummary.noDecisionDeals} {t('crm.reports.winLoss.deals') || (isRTL ? 'صفقة' : 'deals')} {t('crm.reports.winLoss.wentCold') || (isRTL ? 'باردة' : 'went cold')}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Visualizations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Donut Chart - Won vs Lost vs No Decision */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <PieChartIcon className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                    {t('crm.reports.winLoss.distribution') || (isRTL ? 'توزيع الصفقات' : 'Deal Distribution')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Suspense fallback={<ChartSkeleton />}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={mockDistributionData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={2}
                                                label={(entry) => `${entry.percentage.toFixed(1)}%`}
                                            >
                                                {mockDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
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

                        {/* Bar Chart - Top Lost Reasons */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-red-500" aria-hidden="true" />
                                    {t('crm.reports.winLoss.topLostReasons') || (isRTL ? 'أسباب الخسارة الرئيسية' : 'Top Lost Reasons')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Suspense fallback={<ChartSkeleton />}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={mockLostReasons} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                                            <YAxis
                                                dataKey="reason"
                                                type="category"
                                                tick={{ fontSize: 10, fill: '#64748b' }}
                                                width={120}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => value.toLocaleString()}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                }}
                                            />
                                            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                                                {mockLostReasons.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Suspense>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Win Rate Trend Line */}
                    <Card className="border-0 shadow-sm rounded-3xl">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                {t('crm.reports.winLoss.winRateTrend') || (isRTL ? 'اتجاه معدل الفوز' : 'Win Rate Trend Over Time')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Suspense fallback={<ChartSkeleton />}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={mockWinRateTrend}>
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
                                            dataKey="winRate"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            name={isRTL ? 'معدل الفوز %' : 'Win Rate %'}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Suspense>
                        </CardContent>
                    </Card>

                    {/* Competitor Analysis */}
                    <Card className="border-0 shadow-sm rounded-3xl">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-purple-500" aria-hidden="true" />
                                {t('crm.reports.winLoss.competitorAnalysis') || (isRTL ? 'تحليل المنافسين' : 'Competitor Analysis')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="text-start font-bold text-slate-700">
                                            {t('crm.reports.winLoss.competitor') || (isRTL ? 'المنافس' : 'Competitor')}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {t('crm.reports.winLoss.lostTo') || (isRTL ? 'خسرنا لهم' : 'Lost To')}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {t('crm.reports.winLoss.wonAgainst') || (isRTL ? 'فزنا ضدهم' : 'Won Against')}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {t('crm.reports.winLoss.winRateVs') || (isRTL ? 'معدل الفوز ضدهم' : 'Win Rate vs')}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {t('crm.reports.winLoss.avgLostValue') || (isRTL ? 'متوسط القيمة المفقودة' : 'Avg Lost Value')}
                                        </TableHead>
                                        <TableHead className="text-start font-bold text-slate-700">
                                            {t('crm.reports.winLoss.commonObjections') || (isRTL ? 'الاعتراضات الشائعة' : 'Common Objections')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockCompetitorData.map((competitor, index) => (
                                        <TableRow key={index} className="hover:bg-slate-50">
                                            <TableCell className="font-medium text-navy">
                                                {competitor.competitorName}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className="bg-red-100 text-red-700 border-0">
                                                    {competitor.lostCount}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                                    {competitor.winAgainstCount}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className={cn(
                                                        "font-bold",
                                                        competitor.winRate >= 70 ? "text-emerald-600" :
                                                        competitor.winRate >= 50 ? "text-blue-600" :
                                                        "text-amber-600"
                                                    )}>
                                                        {formatPercentage(competitor.winRate)}
                                                    </span>
                                                    <Progress
                                                        value={competitor.winRate}
                                                        className="h-1.5 w-16 bg-slate-100"
                                                        indicatorClassName={cn(
                                                            competitor.winRate >= 70 ? "bg-emerald-500" :
                                                            competitor.winRate >= 50 ? "bg-blue-500" :
                                                            "bg-amber-500"
                                                        )}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-navy">
                                                {formatCurrency(competitor.avgLostDealValue)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {competitor.commonObjections.map((objection, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="outline"
                                                            className="border-slate-200 text-xs"
                                                        >
                                                            {objection}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Stage Drop-off Analysis */}
                    <Card className="border-0 shadow-sm rounded-3xl">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" aria-hidden="true" />
                                {t('crm.reports.winLoss.stageDropOff') || (isRTL ? 'تحليل تسرب المراحل' : 'Stage Drop-off Analysis')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {mockStageDropOff.map((stage, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-slate-700">{stage.stageName}</span>
                                            <div className="flex items-center gap-4">
                                                <Badge className="bg-red-100 text-red-700 border-0">
                                                    {stage.lostCount} {t('crm.reports.winLoss.lost') || (isRTL ? 'خاسر' : 'lost')}
                                                </Badge>
                                                <span className="text-sm text-slate-500">
                                                    {formatPercentage(stage.percentage)}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Clock className="w-3 h-3" aria-hidden="true" />
                                                    {stage.avgDaysInStage} {t('crm.reports.winLoss.days') || (isRTL ? 'يوم' : 'days')}
                                                </div>
                                            </div>
                                        </div>
                                        <Progress
                                            value={stage.percentage}
                                            className="h-2 bg-slate-100"
                                            indicatorClassName="bg-red-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Deal Tables with Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
                        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
                            <TabsTrigger value="won" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                                <CheckCircle2 className="w-4 h-4 ms-2" aria-hidden="true" />
                                {t('crm.reports.winLoss.wonDeals') || (isRTL ? 'صفقات فائزة' : 'Won Deals')}
                                <Badge className="ms-2 bg-emerald-100 text-emerald-700 border-0">
                                    {mockWonDeals.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="lost" className="rounded-lg data-[state=active]:bg-red-500 data-[state=active]:text-white">
                                <XCircle className="w-4 h-4 ms-2" aria-hidden="true" />
                                {t('crm.reports.winLoss.lostDeals') || (isRTL ? 'صفقات خاسرة' : 'Lost Deals')}
                                <Badge className="ms-2 bg-red-100 text-red-700 border-0">
                                    {mockLostDeals.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="noDecision" className="rounded-lg data-[state=active]:bg-slate-500 data-[state=active]:text-white">
                                <CircleDashed className="w-4 h-4 ms-2" aria-hidden="true" />
                                {t('crm.reports.winLoss.noDecision') || (isRTL ? 'لا قرار' : 'No Decision')}
                                <Badge className="ms-2 bg-slate-100 text-slate-700 border-0">
                                    {mockNoDecisionDeals.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>

                        {/* Won Deals Tab */}
                        <TabsContent value="won" className="space-y-6">
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                                            {t('crm.reports.winLoss.wonDealsDetails') || (isRTL ? 'تفاصيل الصفقات الفائزة' : 'Won Deals Details')}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockWonDeals.length} {t('crm.reports.winLoss.deals') || (isRTL ? 'صفقة' : 'deals')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.dealName') || (isRTL ? 'اسم الصفقة' : 'Deal Name')}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.company') || (isRTL ? 'الشركة' : 'Company')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.value') || (isRTL ? 'القيمة' : 'Value')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.closeDate') || (isRTL ? 'تاريخ الإغلاق' : 'Close Date')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.daysToClose') || (isRTL ? 'أيام للإغلاق' : 'Days to Close')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.source') || (isRTL ? 'المصدر' : 'Source')}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.owner') || (isRTL ? 'المالك' : 'Owner')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.size') || (isRTL ? 'الحجم' : 'Size')}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockWonDeals.map((deal) => (
                                                    <TableRow key={deal.dealId} className="hover:bg-slate-50">
                                                        <TableCell className="font-medium text-navy">
                                                            <div className="flex items-center gap-2">
                                                                <Briefcase className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                                {deal.dealName}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{deal.company}</TableCell>
                                                        <TableCell className="text-center font-bold text-navy">
                                                            {formatCurrency(deal.value)}
                                                        </TableCell>
                                                        <TableCell className="text-center text-slate-600">
                                                            {new Date(deal.closeDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                                                {deal.daysToClose} {t('crm.reports.winLoss.days') || (isRTL ? 'يوم' : 'days')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline" className="border-slate-200">
                                                                {deal.source}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">{deal.owner}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                className={cn(
                                                                    "border-0",
                                                                    deal.sizeCategory === (isRTL ? 'كبير' : 'Large') ? "bg-purple-100 text-purple-700" :
                                                                    deal.sizeCategory === (isRTL ? 'متوسط' : 'Medium') ? "bg-blue-100 text-blue-700" :
                                                                    "bg-slate-100 text-slate-700"
                                                                )}
                                                            >
                                                                {deal.sizeCategory}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Lost Deals Tab */}
                        <TabsContent value="lost" className="space-y-6">
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
                                            {t('crm.reports.winLoss.lostDealsDetails') || (isRTL ? 'تفاصيل الصفقات الخاسرة' : 'Lost Deals Details')}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockLostDeals.length} {t('crm.reports.winLoss.deals') || (isRTL ? 'صفقة' : 'deals')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.dealName') || (isRTL ? 'اسم الصفقة' : 'Deal Name')}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.company') || (isRTL ? 'الشركة' : 'Company')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.value') || (isRTL ? 'القيمة' : 'Value')}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.lostReason') || (isRTL ? 'سبب الخسارة' : 'Lost Reason')}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.competitor') || (isRTL ? 'المنافس' : 'Competitor')}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.stageWhenLost') || (isRTL ? 'المرحلة عند الخسارة' : 'Stage When Lost')}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.owner') || (isRTL ? 'المالك' : 'Owner')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.size') || (isRTL ? 'الحجم' : 'Size')}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockLostDeals.map((deal) => (
                                                    <TableRow key={deal.dealId} className="hover:bg-slate-50">
                                                        <TableCell className="font-medium text-navy">
                                                            <div className="flex items-center gap-2">
                                                                <Briefcase className="w-4 h-4 text-red-500" aria-hidden="true" />
                                                                {deal.dealName}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{deal.company}</TableCell>
                                                        <TableCell className="text-center font-bold text-navy">
                                                            {formatCurrency(deal.value)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className="bg-red-100 text-red-700 border-0">
                                                                {deal.lostReason}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">
                                                            {deal.competitor}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="border-slate-200">
                                                                {deal.stageWhenLost}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">{deal.owner}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                className={cn(
                                                                    "border-0",
                                                                    deal.sizeCategory === (isRTL ? 'كبير' : 'Large') ? "bg-purple-100 text-purple-700" :
                                                                    deal.sizeCategory === (isRTL ? 'متوسط' : 'Medium') ? "bg-blue-100 text-blue-700" :
                                                                    "bg-slate-100 text-slate-700"
                                                                )}
                                                            >
                                                                {deal.sizeCategory}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* No Decision Deals Tab */}
                        <TabsContent value="noDecision" className="space-y-6">
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <CircleDashed className="w-5 h-5 text-slate-500" aria-hidden="true" />
                                            {t('crm.reports.winLoss.noDecisionDetails') || (isRTL ? 'صفقات بلا قرار' : 'No Decision Deals')}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockNoDecisionDeals.length} {t('crm.reports.winLoss.deals') || (isRTL ? 'صفقة' : 'deals')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.dealName') || (isRTL ? 'اسم الصفقة' : 'Deal Name')}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.company') || (isRTL ? 'الشركة' : 'Company')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.value') || (isRTL ? 'القيمة' : 'Value')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.lastContact') || (isRTL ? 'آخر اتصال' : 'Last Contact')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.daysSinceContact') || (isRTL ? 'أيام منذ الاتصال' : 'Days Since Contact')}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.owner') || (isRTL ? 'المالك' : 'Owner')}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {t('crm.reports.winLoss.size') || (isRTL ? 'الحجم' : 'Size')}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockNoDecisionDeals.map((deal) => (
                                                    <TableRow key={deal.dealId} className="hover:bg-slate-50">
                                                        <TableCell className="font-medium text-navy">
                                                            <div className="flex items-center gap-2">
                                                                <Briefcase className="w-4 h-4 text-slate-500" aria-hidden="true" />
                                                                {deal.dealName}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{deal.company}</TableCell>
                                                        <TableCell className="text-center font-bold text-navy">
                                                            {formatCurrency(deal.value)}
                                                        </TableCell>
                                                        <TableCell className="text-center text-slate-600">
                                                            {new Date(deal.lastContactDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                className={cn(
                                                                    "border-0",
                                                                    deal.daysSinceContact > 90 ? "bg-red-100 text-red-700" :
                                                                    deal.daysSinceContact > 60 ? "bg-orange-100 text-orange-700" :
                                                                    "bg-yellow-100 text-yellow-700"
                                                                )}
                                                            >
                                                                {deal.daysSinceContact} {t('crm.reports.winLoss.days') || (isRTL ? 'يوم' : 'days')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">{deal.owner}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                className={cn(
                                                                    "border-0",
                                                                    deal.sizeCategory === (isRTL ? 'كبير' : 'Large') ? "bg-purple-100 text-purple-700" :
                                                                    deal.sizeCategory === (isRTL ? 'متوسط' : 'Medium') ? "bg-blue-100 text-blue-700" :
                                                                    "bg-slate-100 text-slate-700"
                                                                )}
                                                            >
                                                                {deal.sizeCategory}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
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

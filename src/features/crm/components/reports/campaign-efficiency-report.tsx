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
    BarChart3,
    Users,
    FileText,
    CheckCircle,
    Mail,
    MousePointer,
    ArrowRight,
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { ChartSkeleton } from '@/utils/lazy-import'

// Lazy load Recharts components
const ResponsiveContainer = lazy(() => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })))
const BarChart = lazy(() => import('recharts').then((mod) => ({ default: mod.BarChart })))
const Bar = lazy(() => import('recharts').then((mod) => ({ default: mod.Bar })))
const XAxis = lazy(() => import('recharts').then((mod) => ({ default: mod.XAxis })))
const YAxis = lazy(() => import('recharts').then((mod) => ({ default: mod.YAxis })))
const Tooltip = lazy(() => import('recharts').then((mod) => ({ default: mod.Tooltip })))
const Cell = lazy(() => import('recharts').then((mod) => ({ default: mod.Cell })))
const LabelList = lazy(() => import('recharts').then((mod) => ({ default: mod.LabelList })))

// Mock hook - replace with actual API hook when available
const useCampaignEfficiencyReport = (filters: any) => {
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

export function CampaignEfficiencyReport() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    // Get first day of year and today for default dates
    const today = new Date()
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1)

    const [startDate, setStartDate] = useState(firstDayOfYear.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [selectedCampaign, setSelectedCampaign] = useState<string>('all')
    const [selectedSource, setSelectedSource] = useState<string>('all')
    const [selectedMedium, setSelectedMedium] = useState<string>('all')
    const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>('all')

    const filters = useMemo(() => {
        const f: any = {}
        if (startDate) f.startDate = startDate
        if (endDate) f.endDate = endDate
        if (selectedCampaign && selectedCampaign !== 'all') f.campaign = selectedCampaign
        if (selectedSource && selectedSource !== 'all') f.source = selectedSource
        if (selectedMedium && selectedMedium !== 'all') f.medium = selectedMedium
        if (selectedSalesPerson && selectedSalesPerson !== 'all') f.salesPersonId = selectedSalesPerson
        return f
    }, [startDate, endDate, selectedCampaign, selectedSource, selectedMedium, selectedSalesPerson])

    const { data: reportData, isLoading, isError, error, refetch } = useCampaignEfficiencyReport(filters)
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

    const handleExport = (format: 'csv' | 'pdf') => {
        exportReport({ reportType: 'campaign-efficiency', format, filters })
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
        totalLeads: 450,
        totalCases: 180,
        totalQuotes: 90,
        totalWon: 45,
        totalRevenue: 2250000,
        totalCost: 450000,
        roi: 400,
        avgLeadToCaseRate: 40,
        avgCaseToQuoteRate: 50,
        avgQuoteToWonRate: 50,
    }

    const mockCampaigns = reportData?.campaigns || [
        {
            campaign: 'spring_sale_2025',
            source: 'google',
            medium: 'cpc',
            leads: 150,
            cases: 75,
            quotes: 40,
            won: 20,
            revenue: 1000000,
            cost: 150000,
            roi: 566.67,
            leadToCaseRate: 50,
            caseToQuoteRate: 53.33,
            quoteToWonRate: 50,
        },
        {
            campaign: 'social_media_campaign',
            source: 'facebook',
            medium: 'social',
            leads: 120,
            cases: 45,
            quotes: 20,
            won: 10,
            revenue: 500000,
            cost: 80000,
            roi: 525,
            leadToCaseRate: 37.5,
            caseToQuoteRate: 44.44,
            quoteToWonRate: 50,
        },
        {
            campaign: 'email_marketing_q1',
            source: 'newsletter',
            medium: 'email',
            leads: 100,
            cases: 35,
            quotes: 18,
            won: 9,
            revenue: 450000,
            cost: 50000,
            roi: 800,
            leadToCaseRate: 35,
            caseToQuoteRate: 51.43,
            quoteToWonRate: 50,
        },
        {
            campaign: 'linkedin_ads',
            source: 'linkedin',
            medium: 'cpc',
            leads: 80,
            cases: 25,
            quotes: 12,
            won: 6,
            revenue: 300000,
            cost: 70000,
            roi: 328.57,
            leadToCaseRate: 31.25,
            caseToQuoteRate: 48,
            quoteToWonRate: 50,
        },
    ]

    // Funnel data for visualization
    const funnelData = [
        {
            stage: isRTL ? 'عملاء محتملين' : 'Leads',
            value: mockSummary.totalLeads,
            color: '#3b82f6',
        },
        {
            stage: isRTL ? 'قضايا' : 'Cases',
            value: mockSummary.totalCases,
            color: '#8b5cf6',
        },
        {
            stage: isRTL ? 'عروض أسعار' : 'Quotes',
            value: mockSummary.totalQuotes,
            color: '#f59e0b',
        },
        {
            stage: isRTL ? 'مغلقة' : 'Won',
            value: mockSummary.totalWon,
            color: '#10b981',
        },
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
                                        {isRTL ? 'تقرير الحملات' : 'Campaign Report'}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    {isRTL ? 'كفاءة الحملات التسويقية' : 'Campaign Efficiency'}
                                </h1>
                                <p className="text-blue-100/80">
                                    {isRTL ? 'تحليل أداء الحملات ومعدلات التحويل والعائد على الاستثمار' : 'Campaign performance, conversion rates, and ROI analysis'}
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
                                    {isRTL ? 'تصدير CSV' : 'Export CSV'}
                                </Button>
                                <Button
                                    className="bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-lg"
                                    onClick={() => handleExport('pdf')}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                    {isRTL ? 'تصدير PDF' : 'Export PDF'}
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
                                        {isRTL ? 'الحملة' : 'Campaign'}
                                    </Label>
                                    <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'جميع الحملات' : 'All Campaigns'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'جميع الحملات' : 'All Campaigns'}</SelectItem>
                                            <SelectItem value="spring_sale_2025">Spring Sale 2025</SelectItem>
                                            <SelectItem value="social_media_campaign">Social Media Campaign</SelectItem>
                                            <SelectItem value="email_marketing_q1">Email Marketing Q1</SelectItem>
                                            <SelectItem value="linkedin_ads">LinkedIn Ads</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {isRTL ? 'المصدر' : 'Source'}
                                    </Label>
                                    <Select value={selectedSource} onValueChange={setSelectedSource}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'جميع المصادر' : 'All Sources'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'جميع المصادر' : 'All Sources'}</SelectItem>
                                            <SelectItem value="google">Google</SelectItem>
                                            <SelectItem value="facebook">Facebook</SelectItem>
                                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                                            <SelectItem value="newsletter">Newsletter</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {isRTL ? 'الوسيط' : 'Medium'}
                                    </Label>
                                    <Select value={selectedMedium} onValueChange={setSelectedMedium}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'جميع الوسائط' : 'All Mediums'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'جميع الوسائط' : 'All Mediums'}</SelectItem>
                                            <SelectItem value="cpc">CPC</SelectItem>
                                            <SelectItem value="social">Social</SelectItem>
                                            <SelectItem value="email">Email</SelectItem>
                                            <SelectItem value="organic">Organic</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                        {isRTL ? 'إجمالي العملاء المحتملين' : 'Total Leads'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.totalLeads}</div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'القضايا المغلقة' : 'Won Deals'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.totalWon}</div>
                                <div className="mt-2">
                                    <Progress
                                        value={(mockSummary.totalWon / mockSummary.totalLeads) * 100}
                                        className="h-1.5 bg-emerald-100"
                                        indicatorClassName="bg-emerald-500"
                                    />
                                    <span className="text-xs text-slate-500 mt-1">
                                        {formatPercentage((mockSummary.totalWon / mockSummary.totalLeads) * 100)} {isRTL ? 'من العملاء المحتملين' : 'of leads'}
                                    </span>
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
                                        {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.totalRevenue)}</div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-amber-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'العائد على الاستثمار' : 'ROI'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatPercentage(mockSummary.roi)}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {isRTL ? 'التكلفة:' : 'Cost:'} {formatCurrency(mockSummary.totalCost)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Conversion Funnel Chart */}
                        <Card className="border-0 shadow-sm rounded-3xl lg:col-span-1">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                    {isRTL ? 'مسار التحويل' : 'Conversion Funnel'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Suspense fallback={<ChartSkeleton />}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={funnelData} layout="vertical">
                                            <XAxis type="number" hide />
                                            <YAxis
                                                type="category"
                                                dataKey="stage"
                                                width={100}
                                                tick={{ fontSize: 12, fill: '#64748b' }}
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
                                            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                                {funnelData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                                <LabelList dataKey="value" position="right" fill="#1e293b" fontSize={12} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Suspense>

                                {/* Conversion Rates */}
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                                            <span className="text-sm text-slate-600">
                                                {isRTL ? 'عميل محتمل → قضية' : 'Lead → Case'}
                                            </span>
                                        </div>
                                        <span className="font-bold text-blue-600">{formatPercentage(mockSummary.avgLeadToCaseRate)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                                            <span className="text-sm text-slate-600">
                                                {isRTL ? 'قضية → عرض سعر' : 'Case → Quote'}
                                            </span>
                                        </div>
                                        <span className="font-bold text-purple-600">{formatPercentage(mockSummary.avgCaseToQuoteRate)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                                            <span className="text-sm text-slate-600">
                                                {isRTL ? 'عرض سعر → مغلقة' : 'Quote → Won'}
                                            </span>
                                        </div>
                                        <span className="font-bold text-emerald-600">{formatPercentage(mockSummary.avgQuoteToWonRate)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Campaigns Table */}
                        <Card className="border-0 shadow-sm rounded-3xl lg:col-span-2">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Target className="w-5 h-5 text-blue-500" aria-hidden="true" />
                                        {isRTL ? 'تفاصيل الحملات' : 'Campaign Details'}
                                    </CardTitle>
                                    <Badge variant="outline" className="border-slate-200">
                                        {mockCampaigns.length} {isRTL ? 'حملة' : 'campaigns'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="text-start font-bold text-slate-700">
                                                    {isRTL ? 'الحملة' : 'Campaign'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'المصدر' : 'Source'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'الوسيط' : 'Medium'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'عملاء' : 'Leads'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'قضايا' : 'Cases'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'عروض' : 'Quotes'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'مغلقة' : 'Won'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'الإيرادات' : 'Revenue'}
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">
                                                    {isRTL ? 'العائد' : 'ROI'}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockCampaigns.map((campaign, index) => (
                                                <TableRow key={index} className="hover:bg-slate-50">
                                                    <TableCell className="font-medium text-navy">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{campaign.campaign}</span>
                                                            <span className="text-xs text-slate-500">
                                                                {formatPercentage((campaign.won / campaign.leads) * 100)} {isRTL ? 'معدل التحويل' : 'conv. rate'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="border-slate-200">
                                                            {campaign.source}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="border-slate-200">
                                                            {campaign.medium}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium">{campaign.leads}</TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-medium">{campaign.cases}</span>
                                                            <span className="text-xs text-blue-600">{formatPercentage(campaign.leadToCaseRate)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-medium">{campaign.quotes}</span>
                                                            <span className="text-xs text-purple-600">{formatPercentage(campaign.caseToQuoteRate)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-medium">{campaign.won}</span>
                                                            <span className="text-xs text-emerald-600">{formatPercentage(campaign.quoteToWonRate)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-navy">
                                                        {formatCurrency(campaign.revenue)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            className={
                                                                campaign.roi >= 500
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : campaign.roi >= 300
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-amber-100 text-amber-700'
                                                            }
                                                        >
                                                            {formatPercentage(campaign.roi)}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                </div>
            </Main>
        </>
    )
}

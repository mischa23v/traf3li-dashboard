import { useState, useMemo, lazy, Suspense } from 'react'
import { ROUTES } from '@/constants/routes'
import {
    Download, Filter, Calendar, TrendingUp, TrendingDown,
    Users, DollarSign, AlertCircle, Target, Percent,
    Clock, Zap, Activity, BarChart3, ArrowRight, ArrowDown,
    Gauge, Award, FileText, AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
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
const XAxis = lazy(() => import('recharts').then((mod) => ({ default: mod.XAxis })))
const YAxis = lazy(() => import('recharts').then((mod) => ({ default: mod.YAxis })))
const Tooltip = lazy(() => import('recharts').then((mod) => ({ default: mod.Tooltip })))
const Cell = lazy(() => import('recharts').then((mod) => ({ default: mod.Cell })))
const LineChart = lazy(() => import('recharts').then((mod) => ({ default: mod.LineChart })))
const Line = lazy(() => import('recharts').then((mod) => ({ default: mod.Line })))

// Mock hook - replace with actual hook when backend is ready
const useSalesFunnelReport = (filters?: any) => {
    return {
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        refetch: () => { }
    }
}

// Mock hook - replace with actual hook when backend is ready
const useExportReport = () => {
    return {
        mutate: (params: any) => {
            console.log('Exporting report:', params)
        },
        isPending: false
    }
}

// Mock hook - replace with actual hook when backend is ready
const useUsers = () => {
    return {
        data: {
            data: [
                { _id: '1', fullName: 'أحمد محمد', name: 'Ahmed Mohammed' },
                { _id: '2', fullName: 'سارة علي', name: 'Sara Ali' },
                { _id: '3', fullName: 'خالد عبدالله', name: 'Khaled Abdullah' },
                { _id: '4', fullName: 'فاطمة حسن', name: 'Fatima Hassan' },
            ]
        }
    }
}

export function SalesFunnelReport() {
    // Get first day of current month and today for default dates
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>('')
    const [selectedTerritory, setSelectedTerritory] = useState<string>('')
    const [selectedLeadSource, setSelectedLeadSource] = useState<string>('')
    const [minDealValue, setMinDealValue] = useState<string>('')
    const [maxDealValue, setMaxDealValue] = useState<string>('')
    const [viewMode, setViewMode] = useState<'overview' | 'comparison' | 'salesperson'>('overview')

    const filters = useMemo(() => {
        const f: any = {}
        if (startDate) f.startDate = startDate
        if (endDate) f.endDate = endDate
        if (selectedSalesPerson && selectedSalesPerson !== 'all') f.salesPersonId = selectedSalesPerson
        if (selectedTerritory && selectedTerritory !== 'all') f.territory = selectedTerritory
        if (selectedLeadSource && selectedLeadSource !== 'all') f.leadSource = selectedLeadSource
        if (minDealValue) f.minDealValue = parseInt(minDealValue)
        if (maxDealValue) f.maxDealValue = parseInt(maxDealValue)
        return f
    }, [startDate, endDate, selectedSalesPerson, selectedTerritory, selectedLeadSource, minDealValue, maxDealValue])

    const { data: reportData, isLoading, isError, error, refetch } = useSalesFunnelReport(filters)
    const { data: usersData } = useUsers()
    const { mutate: exportReport, isPending: isExporting } = useExportReport()

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const handleExport = (format: 'csv' | 'pdf') => {
        exportReport({ reportType: 'sales-funnel', format, filters, viewMode })
    }

    const topNav = [
        { title: 'لوحة التحكم', href: ROUTES.dashboard.crm.pipeline, isActive: false },
        { title: 'العملاء المحتملون', href: ROUTES.dashboard.crm.leads.list, isActive: false },
        { title: 'خط المبيعات', href: ROUTES.dashboard.crm.pipeline, isActive: false },
        { title: 'الأنشطة', href: ROUTES.dashboard.crm.activities.list, isActive: false },
        { title: 'التقارير', href: ROUTES.dashboard.crm.reports.list, isActive: true },
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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل التقرير</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    // Mock data for development - will be replaced by API
    const mockSummary = reportData?.summary || {
        totalPipelineValue: 3850000,
        weightedPipelineValue: 2310000,
        overallConversionRate: 24.5,
        averageDealSize: 68750,
        winRate: 32.8,
        totalLeads: 156,
        pipelineVelocity: 14.2, // days
        activeDeals: 98
    }

    // Funnel stages data with conversion rates
    const mockFunnelStages = reportData?.funnelStages || [
        {
            stageId: '1',
            stageName: 'عملاء محتملون جدد',
            stageNameEn: 'New Leads',
            leadCount: 156,
            stageValue: 10725000,
            conversionRate: 68.6, // to next stage
            dropOffRate: 31.4,
            avgTimeInStage: 3,
            color: '#60a5fa', // blue-400
            width: 100 // for funnel visualization
        },
        {
            stageId: '2',
            stageName: 'عملاء مؤهلون (MQL)',
            stageNameEn: 'Qualified (MQL)',
            leadCount: 107,
            stageValue: 7363750,
            conversionRate: 73.8,
            dropOffRate: 26.2,
            avgTimeInStage: 5,
            color: '#818cf8', // indigo-400
            width: 85
        },
        {
            stageId: '3',
            stageName: 'عملاء مبيعات مؤهلون (SQL)',
            stageNameEn: 'Sales Qualified (SQL)',
            leadCount: 79,
            stageValue: 5432500,
            conversionRate: 65.8,
            dropOffRate: 34.2,
            avgTimeInStage: 7,
            color: '#a78bfa', // violet-400
            width: 70
        },
        {
            stageId: '4',
            stageName: 'تم إرسال العرض',
            stageNameEn: 'Proposal Sent',
            leadCount: 52,
            stageValue: 3575000,
            conversionRate: 75.0,
            dropOffRate: 25.0,
            avgTimeInStage: 10,
            color: '#c084fc', // purple-400
            width: 55
        },
        {
            stageId: '5',
            stageName: 'التفاوض',
            stageNameEn: 'Negotiation',
            leadCount: 39,
            stageValue: 2681250,
            conversionRate: 82.1,
            dropOffRate: 17.9,
            avgTimeInStage: 12,
            color: '#f0abfc', // fuchsia-300
            width: 45
        },
        {
            stageId: '6',
            stageName: 'تم الإغلاق بنجاح',
            stageNameEn: 'Closed Won',
            leadCount: 32,
            stageValue: 2200000,
            conversionRate: 100,
            dropOffRate: 0,
            avgTimeInStage: 0,
            color: '#10b981', // emerald-500
            width: 35
        }
    ]

    // Period comparison data
    const mockPeriodComparison = reportData?.periodComparison || {
        currentPeriod: {
            name: 'هذا الشهر',
            totalLeads: 156,
            convertedLeads: 32,
            conversionRate: 20.5,
            totalValue: 3850000,
            wonValue: 2200000,
            avgDealSize: 68750
        },
        previousPeriod: {
            name: 'الشهر الماضي',
            totalLeads: 142,
            convertedLeads: 28,
            conversionRate: 19.7,
            totalValue: 3420000,
            wonValue: 1960000,
            avgDealSize: 70000
        },
        change: {
            leads: 9.9,
            conversion: 4.1,
            value: 12.6,
            avgDealSize: -1.8
        }
    }

    // Sales person breakdown
    const mockSalesPersonData = reportData?.bySalesPerson || [
        {
            personId: '1',
            personName: 'أحمد محمد',
            totalLeads: 45,
            convertedLeads: 12,
            conversionRate: 26.7,
            totalValue: 1125000,
            wonValue: 720000,
            avgDealSize: 60000,
            pipelineVelocity: 12.5
        },
        {
            personId: '2',
            personName: 'سارة علي',
            totalLeads: 52,
            convertedLeads: 11,
            conversionRate: 21.2,
            totalValue: 1300000,
            wonValue: 770000,
            avgDealSize: 70000,
            pipelineVelocity: 15.8
        },
        {
            personId: '3',
            personName: 'خالد عبدالله',
            totalLeads: 38,
            convertedLeads: 6,
            conversionRate: 15.8,
            totalValue: 950000,
            wonValue: 480000,
            avgDealSize: 80000,
            pipelineVelocity: 16.2
        },
        {
            personId: '4',
            personName: 'فاطمة حسن',
            totalLeads: 21,
            convertedLeads: 3,
            conversionRate: 14.3,
            totalValue: 475000,
            wonValue: 230000,
            avgDealSize: 76667,
            pipelineVelocity: 14.9
        }
    ]

    // Territory breakdown
    const mockTerritoryData = reportData?.byTerritory || [
        { territory: 'الرياض', leads: 68, converted: 18, conversionRate: 26.5, value: 1680000 },
        { territory: 'جدة', leads: 42, converted: 8, conversionRate: 19.0, value: 980000 },
        { territory: 'الدمام', leads: 28, converted: 4, conversionRate: 14.3, value: 720000 },
        { territory: 'مكة', leads: 18, converted: 2, conversionRate: 11.1, value: 470000 }
    ]

    // Stage duration breakdown for velocity analysis
    const mockStageDuration = reportData?.stageDuration || [
        { stage: 'عملاء جدد → MQL', avgDays: 3, minDays: 1, maxDays: 7 },
        { stage: 'MQL → SQL', avgDays: 5, minDays: 2, maxDays: 12 },
        { stage: 'SQL → عرض', avgDays: 7, minDays: 3, maxDays: 15 },
        { stage: 'عرض → تفاوض', avgDays: 10, minDays: 5, maxDays: 20 },
        { stage: 'تفاوض → إغلاق', avgDays: 12, minDays: 6, maxDays: 25 }
    ]

    // Identify bottlenecks
    const bottlenecks = mockFunnelStages
        .filter(stage => stage.dropOffRate > 30 || stage.avgTimeInStage > 10)
        .map(stage => ({
            stageName: stage.stageName,
            issue: stage.dropOffRate > 30 ? 'معدل تسرب مرتفع' : 'وقت طويل في المرحلة',
            value: stage.dropOffRate > 30 ? `${stage.dropOffRate}%` : `${stage.avgTimeInStage} يوم`
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
                    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-300/20 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                        <Target className="w-3 h-3 ms-2" />
                                        قمع المبيعات
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    تقرير قمع التحويل
                                </h1>
                                <p className="text-purple-100/80">تحليل شامل لمعدلات التحويل عبر مراحل المبيعات</p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                                    onClick={() => handleExport('csv')}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                    تصدير CSV
                                </Button>
                                <Button
                                    className="bg-white text-purple-700 hover:bg-purple-50 rounded-xl shadow-lg"
                                    onClick={() => handleExport('pdf')}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                    تصدير PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                <span className="text-sm font-medium text-slate-600">الفترة:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-600" aria-hidden="true" />
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-[150px] rounded-xl border-slate-200"
                                />
                                <span className="text-slate-600">إلى</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-[150px] rounded-xl border-slate-200"
                                />
                            </div>
                            <Select value={selectedSalesPerson} onValueChange={setSelectedSalesPerson}>
                                <SelectTrigger className="w-[180px] rounded-xl border-slate-200">
                                    <SelectValue placeholder="جميع الموظفين" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الموظفين</SelectItem>
                                    {usersData?.data?.map((user: any) => (
                                        <SelectItem key={user._id} value={user._id}>
                                            {user.fullName || user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                                <SelectTrigger className="w-[150px] rounded-xl border-slate-200">
                                    <SelectValue placeholder="جميع المناطق" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع المناطق</SelectItem>
                                    <SelectItem value="riyadh">الرياض</SelectItem>
                                    <SelectItem value="jeddah">جدة</SelectItem>
                                    <SelectItem value="dammam">الدمام</SelectItem>
                                    <SelectItem value="makkah">مكة</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedLeadSource} onValueChange={setSelectedLeadSource}>
                                <SelectTrigger className="w-[150px] rounded-xl border-slate-200">
                                    <SelectValue placeholder="مصدر العميل" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع المصادر</SelectItem>
                                    <SelectItem value="website">الموقع</SelectItem>
                                    <SelectItem value="referral">إحالة</SelectItem>
                                    <SelectItem value="social">وسائل التواصل</SelectItem>
                                    <SelectItem value="ads">إعلانات</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="الحد الأدنى"
                                    value={minDealValue}
                                    onChange={(e) => setMinDealValue(e.target.value)}
                                    className="w-[120px] rounded-xl border-slate-200"
                                />
                                <span className="text-slate-600">-</span>
                                <Input
                                    type="number"
                                    placeholder="الحد الأعلى"
                                    value={maxDealValue}
                                    onChange={(e) => setMaxDealValue(e.target.value)}
                                    className="w-[120px] rounded-xl border-slate-200"
                                />
                            </div>
                        </div>
                        <div className="text-sm text-slate-500">
                            آخر تحديث: {reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString('ar-SA') : 'الآن'}
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">إجمالي القيمة</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.totalPipelineValue)}</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {mockSummary.activeDeals} صفقة نشطة
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Target className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">القيمة المرجحة</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.weightedPipelineValue)}</div>
                                <div className="mt-2">
                                    <Progress
                                        value={(mockSummary.weightedPipelineValue / mockSummary.totalPipelineValue) * 100}
                                        className="h-1.5 bg-purple-100"
                                        indicatorClassName="bg-purple-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">معدل التحويل</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.overallConversionRate}%</div>
                                <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    معدل الفوز: {mockSummary.winRate}%
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <Award className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">متوسط الصفقة</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.averageDealSize)}</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {mockSummary.totalLeads} عميل محتمل
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-cyan-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">سرعة الأنبوب</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.pipelineVelocity} يوم</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    متوسط الوقت للإغلاق
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content with Tabs */}
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-6">
                        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
                            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                                <Target className="w-4 h-4 ms-2" />
                                نظرة عامة
                            </TabsTrigger>
                            <TabsTrigger value="comparison" className="rounded-lg data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                                <BarChart3 className="w-4 h-4 ms-2" />
                                المقارنة
                            </TabsTrigger>
                            <TabsTrigger value="salesperson" className="rounded-lg data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                                <Users className="w-4 h-4 ms-2" />
                                حسب الموظف
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Custom Funnel Visualization */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-purple-500" />
                                        قمع التحويل المرئي
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="space-y-1">
                                        {mockFunnelStages.map((stage, index) => {
                                            const isLast = index === mockFunnelStages.length - 1
                                            return (
                                                <div key={stage.stageId} className="space-y-1">
                                                    {/* Stage Bar */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-32 text-sm font-medium text-slate-700 text-end">
                                                            {stage.stageName}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div
                                                                className="relative h-16 rounded-lg shadow-md transition-all duration-500 hover:shadow-lg"
                                                                style={{
                                                                    width: `${stage.width}%`,
                                                                    background: `linear-gradient(135deg, ${stage.color}dd, ${stage.color})`
                                                                }}
                                                            >
                                                                <div className="absolute inset-0 flex items-center justify-between px-4 text-white">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="text-2xl font-bold">{stage.leadCount}</div>
                                                                        <div className="text-xs opacity-90">عميل</div>
                                                                    </div>
                                                                    <div className="text-end">
                                                                        <div className="text-sm font-bold">{formatCurrency(stage.stageValue)}</div>
                                                                        {!isLast && (
                                                                            <div className="text-xs opacity-90 flex items-center gap-1">
                                                                                <ArrowDown className="w-3 h-3" />
                                                                                {stage.conversionRate}%
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-24 text-sm text-slate-600">
                                                            {stage.avgTimeInStage > 0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {stage.avgTimeInStage} يوم
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Drop-off indicator */}
                                                    {!isLast && stage.dropOffRate > 0 && (
                                                        <div className="flex items-center gap-4 me-32">
                                                            <div className="flex-1 ps-2">
                                                                <div className="flex items-center gap-2 text-xs text-red-600">
                                                                    <TrendingDown className="w-3 h-3" />
                                                                    <span>تسرب: {stage.dropOffRate}%</span>
                                                                    <span className="text-slate-400">
                                                                        ({Math.round(stage.leadCount * (stage.dropOffRate / 100))} عميل)
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stage Analysis Table */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-purple-500" />
                                        تحليل المراحل التفصيلي
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="text-end font-bold text-slate-700">المرحلة</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">العملاء</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">القيمة</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">متوسط الوقت</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">معدل التحويل</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">معدل التسرب</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">التنبيهات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockFunnelStages.map((stage, index) => {
                                                const hasBottleneck = stage.dropOffRate > 30 || stage.avgTimeInStage > 10
                                                const isLast = index === mockFunnelStages.length - 1

                                                return (
                                                    <TableRow key={stage.stageId} className="hover:bg-slate-50">
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: stage.color }}
                                                                />
                                                                {stage.stageName}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline" className="border-slate-200">
                                                                {stage.leadCount}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center font-bold text-navy">
                                                            {formatCurrency(stage.stageValue)}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className={cn(
                                                                stage.avgTimeInStage > 10 ? 'text-orange-600 font-medium' : 'text-slate-600'
                                                            )}>
                                                                {stage.avgTimeInStage > 0 ? `${stage.avgTimeInStage} يوم` : '-'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {!isLast && (
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <span className={cn(
                                                                        "font-medium",
                                                                        stage.conversionRate > 70 ? "text-emerald-600" :
                                                                        stage.conversionRate > 50 ? "text-blue-600" :
                                                                        "text-amber-600"
                                                                    )}>
                                                                        {stage.conversionRate}%
                                                                    </span>
                                                                    <Progress
                                                                        value={stage.conversionRate}
                                                                        className="h-1.5 w-16 bg-slate-100"
                                                                        indicatorClassName={cn(
                                                                            stage.conversionRate > 70 ? "bg-emerald-500" :
                                                                            stage.conversionRate > 50 ? "bg-blue-500" :
                                                                            "bg-amber-500"
                                                                        )}
                                                                    />
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {!isLast && (
                                                                <span className={cn(
                                                                    "font-medium",
                                                                    stage.dropOffRate > 30 ? "text-red-600" :
                                                                    stage.dropOffRate > 20 ? "text-orange-600" :
                                                                    "text-slate-600"
                                                                )}>
                                                                    {stage.dropOffRate}%
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {hasBottleneck && (
                                                                <Badge className="bg-orange-100 text-orange-700 border-0">
                                                                    <AlertTriangle className="w-3 h-3 ms-1" />
                                                                    اختناق
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Bottleneck Alerts */}
                            {bottlenecks.length > 0 && (
                                <Card className="border-0 shadow-sm rounded-3xl border-orange-200 bg-orange-50/50">
                                    <CardHeader className="border-b border-orange-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-orange-800 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                                            نقاط الاختناق المكتشفة
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-3">
                                            {bottlenecks.map((bottleneck, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-orange-200">
                                                    <div className="flex items-center gap-3">
                                                        <AlertCircle className="w-5 h-5 text-orange-600" />
                                                        <div>
                                                            <div className="font-medium text-slate-900">{bottleneck.stageName}</div>
                                                            <div className="text-sm text-slate-600">{bottleneck.issue}</div>
                                                        </div>
                                                    </div>
                                                    <Badge className="bg-orange-100 text-orange-700 border-0 text-lg px-3 py-1">
                                                        {bottleneck.value}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Stage Duration Analysis */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-purple-500" />
                                        مدة الانتقال بين المراحل
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {mockStageDuration.map((duration, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-slate-700">{duration.stage}</span>
                                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                                        <span>الحد الأدنى: {duration.minDays} يوم</span>
                                                        <span>الحد الأعلى: {duration.maxDays} يوم</span>
                                                    </div>
                                                </div>
                                                <div className="relative h-8 bg-slate-100 rounded-lg overflow-hidden">
                                                    <div
                                                        className="absolute h-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-medium"
                                                        style={{ width: `${(duration.avgDays / duration.maxDays) * 100}%` }}
                                                    >
                                                        متوسط: {duration.avgDays} يوم
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Comparison Tab */}
                        <TabsContent value="comparison" className="space-y-6">
                            {/* Period Comparison */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-purple-500" />
                                        مقارنة الفترات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Current Period */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-navy">{mockPeriodComparison.currentPeriod.name}</h3>
                                                <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                                    الفترة الحالية
                                                </Badge>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="p-4 bg-slate-50 rounded-xl">
                                                    <div className="text-sm text-slate-600 mb-1">إجمالي العملاء</div>
                                                    <div className="text-2xl font-bold text-navy">{mockPeriodComparison.currentPeriod.totalLeads}</div>
                                                </div>
                                                <div className="p-4 bg-emerald-50 rounded-xl">
                                                    <div className="text-sm text-slate-600 mb-1">العملاء المحولون</div>
                                                    <div className="text-2xl font-bold text-emerald-700">{mockPeriodComparison.currentPeriod.convertedLeads}</div>
                                                </div>
                                                <div className="p-4 bg-blue-50 rounded-xl">
                                                    <div className="text-sm text-slate-600 mb-1">معدل التحويل</div>
                                                    <div className="text-2xl font-bold text-blue-700">{mockPeriodComparison.currentPeriod.conversionRate}%</div>
                                                </div>
                                                <div className="p-4 bg-purple-50 rounded-xl">
                                                    <div className="text-sm text-slate-600 mb-1">القيمة الإجمالية</div>
                                                    <div className="text-xl font-bold text-purple-700">{formatCurrency(mockPeriodComparison.currentPeriod.totalValue)}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Previous Period */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-slate-600">{mockPeriodComparison.previousPeriod.name}</h3>
                                                <Badge variant="outline" className="border-slate-300 text-slate-600">
                                                    الفترة السابقة
                                                </Badge>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="p-4 bg-slate-50 rounded-xl">
                                                    <div className="text-sm text-slate-600 mb-1">إجمالي العملاء</div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-2xl font-bold text-slate-700">{mockPeriodComparison.previousPeriod.totalLeads}</div>
                                                        <Badge className={cn(
                                                            "border-0",
                                                            mockPeriodComparison.change.leads > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                        )}>
                                                            {mockPeriodComparison.change.leads > 0 ? <TrendingUp className="w-3 h-3 ms-1" /> : <TrendingDown className="w-3 h-3 ms-1" />}
                                                            {Math.abs(mockPeriodComparison.change.leads)}%
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl">
                                                    <div className="text-sm text-slate-600 mb-1">العملاء المحولون</div>
                                                    <div className="text-2xl font-bold text-slate-700">{mockPeriodComparison.previousPeriod.convertedLeads}</div>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl">
                                                    <div className="text-sm text-slate-600 mb-1">معدل التحويل</div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-2xl font-bold text-slate-700">{mockPeriodComparison.previousPeriod.conversionRate}%</div>
                                                        <Badge className={cn(
                                                            "border-0",
                                                            mockPeriodComparison.change.conversion > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                        )}>
                                                            {mockPeriodComparison.change.conversion > 0 ? <TrendingUp className="w-3 h-3 ms-1" /> : <TrendingDown className="w-3 h-3 ms-1" />}
                                                            {Math.abs(mockPeriodComparison.change.conversion)}%
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-slate-50 rounded-xl">
                                                    <div className="text-sm text-slate-600 mb-1">القيمة الإجمالية</div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xl font-bold text-slate-700">{formatCurrency(mockPeriodComparison.previousPeriod.totalValue)}</div>
                                                        <Badge className={cn(
                                                            "border-0",
                                                            mockPeriodComparison.change.value > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                        )}>
                                                            {mockPeriodComparison.change.value > 0 ? <TrendingUp className="w-3 h-3 ms-1" /> : <TrendingDown className="w-3 h-3 ms-1" />}
                                                            {Math.abs(mockPeriodComparison.change.value)}%
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Territory Comparison */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Gauge className="w-5 h-5 text-purple-500" />
                                        الأداء حسب المنطقة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="text-end font-bold text-slate-700">المنطقة</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">العملاء</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">المحولون</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">معدل التحويل</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">القيمة</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockTerritoryData.map((territory) => (
                                                <TableRow key={territory.territory} className="hover:bg-slate-50">
                                                    <TableCell className="font-medium text-navy">{territory.territory}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="border-slate-200">
                                                            {territory.leads}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                                            {territory.converted}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-bold text-navy">{territory.conversionRate}%</span>
                                                            <Progress
                                                                value={territory.conversionRate}
                                                                className="h-1.5 w-16 bg-slate-100"
                                                                indicatorClassName="bg-purple-500"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-navy">
                                                        {formatCurrency(territory.value)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Sales Person Tab */}
                        <TabsContent value="salesperson" className="space-y-6">
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Users className="w-5 h-5 text-purple-500" />
                                            أداء موظفي المبيعات
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockSalesPersonData.length} موظف
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {mockSalesPersonData.map((person) => (
                                        <Card key={person.personId} className="border border-slate-100 shadow-none">
                                            <CardContent className="p-5 space-y-4">
                                                {/* Person Header */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-lg">
                                                            {person.personName.split(' ')[0][0]}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-navy text-lg">{person.personName}</h3>
                                                            <p className="text-sm text-slate-500">{person.totalLeads} عميل محتمل</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="text-2xl font-bold text-navy">{formatCurrency(person.totalValue)}</div>
                                                        <div className="text-sm text-slate-500">
                                                            محول: {formatCurrency(person.wonValue)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Performance Metrics */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <div className="bg-emerald-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                            <span className="text-xs text-emerald-700">محول</span>
                                                        </div>
                                                        <div className="text-xl font-bold text-emerald-700">{person.convertedLeads}</div>
                                                    </div>
                                                    <div className="bg-blue-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Percent className="w-4 h-4 text-blue-600" />
                                                            <span className="text-xs text-blue-700">معدل التحويل</span>
                                                        </div>
                                                        <div className="text-xl font-bold text-blue-700">{person.conversionRate}%</div>
                                                    </div>
                                                    <div className="bg-purple-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Award className="w-4 h-4 text-purple-600" />
                                                            <span className="text-xs text-purple-700">متوسط الصفقة</span>
                                                        </div>
                                                        <div className="text-sm font-bold text-purple-700">{formatCurrency(person.avgDealSize)}</div>
                                                    </div>
                                                    <div className="bg-cyan-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Zap className="w-4 h-4 text-cyan-600" />
                                                            <span className="text-xs text-cyan-700">السرعة</span>
                                                        </div>
                                                        <div className="text-xl font-bold text-cyan-700">{person.pipelineVelocity} يوم</div>
                                                    </div>
                                                </div>

                                                {/* Conversion Progress */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-slate-600">تقدم التحويل</span>
                                                        <span className="text-sm font-medium text-navy">
                                                            {person.convertedLeads} من {person.totalLeads}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={person.conversionRate}
                                                        className="h-2 bg-slate-100"
                                                        indicatorClassName={cn(
                                                            person.conversionRate > 25 ? "bg-emerald-500" :
                                                            person.conversionRate > 20 ? "bg-blue-500" :
                                                            "bg-amber-500"
                                                        )}
                                                    />
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

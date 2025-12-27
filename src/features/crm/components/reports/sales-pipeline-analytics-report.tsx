import { useState, useMemo } from 'react'
import { ROUTES } from '@/constants/routes'
import {
    Download, Filter, Calendar, TrendingUp,
    Users, DollarSign, AlertCircle, BarChart3,
    Target, Clock, Zap, Activity, TrendingDown,
    User, MapPin, FileText, CheckCircle2, XCircle,
    Loader2, Award
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

// Mock hook - replace with actual hook when backend is ready
const useSalesPipelineReport = (filters?: any) => {
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
            ]
        }
    }
}

export function SalesPipelineAnalyticsReport() {
    // Get first day of current month and today for default dates
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>('')
    const [selectedTerritory, setSelectedTerritory] = useState<string>('')
    const [selectedCaseType, setSelectedCaseType] = useState<string>('')
    const [viewMode, setViewMode] = useState<'stage' | 'owner' | 'period'>('stage')

    const filters = useMemo(() => {
        const f: any = {}
        if (startDate) f.startDate = startDate
        if (endDate) f.endDate = endDate
        if (selectedSalesPerson && selectedSalesPerson !== 'all') f.salesPersonId = selectedSalesPerson
        if (selectedTerritory && selectedTerritory !== 'all') f.territory = selectedTerritory
        if (selectedCaseType && selectedCaseType !== 'all') f.caseType = selectedCaseType
        return f
    }, [startDate, endDate, selectedSalesPerson, selectedTerritory, selectedCaseType])

    const { data: reportData, isLoading, isError, error, refetch } = useSalesPipelineReport(filters)
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
        exportReport({ reportType: 'sales-pipeline-analytics', format, filters, viewMode })
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
        totalValue: 2450000,
        weightedValue: 1470000,
        totalOpportunities: 47,
        avgOpportunityValue: 52127,
        avgSalesCycle: 18,
        winRate: 34.5,
        conversionRate: 28.2,
        avgStageAge: 12
    }

    const mockStageData = reportData?.byStage || [
        {
            stageId: '1',
            stageName: 'تواصل أولي',
            count: 12,
            value: 480000,
            weightedValue: 96000, // 20% probability
            avgAge: 5,
            stuckCount: 2,
            probability: 20,
            conversionRate: 45,
            color: '#3b82f6'
        },
        {
            stageId: '2',
            stageName: 'تأهيل العميل',
            count: 8,
            value: 520000,
            weightedValue: 208000, // 40% probability
            avgAge: 8,
            stuckCount: 1,
            probability: 40,
            conversionRate: 52,
            color: '#8b5cf6'
        },
        {
            stageId: '3',
            stageName: 'تقديم العرض',
            count: 10,
            value: 650000,
            weightedValue: 390000, // 60% probability
            avgAge: 12,
            stuckCount: 3,
            probability: 60,
            conversionRate: 38,
            color: '#f59e0b'
        },
        {
            stageId: '4',
            stageName: 'التفاوض',
            count: 9,
            value: 580000,
            weightedValue: 464000, // 80% probability
            avgAge: 15,
            stuckCount: 2,
            probability: 80,
            conversionRate: 68,
            color: '#10b981'
        },
        {
            stageId: '5',
            stageName: 'إغلاق ناجح',
            count: 8,
            value: 220000,
            weightedValue: 220000, // 100% probability
            avgAge: 0,
            stuckCount: 0,
            probability: 100,
            conversionRate: 100,
            color: '#059669'
        }
    ]

    const mockOwnerData = reportData?.byOwner || [
        {
            ownerId: '1',
            ownerName: 'أحمد محمد',
            totalOpportunities: 15,
            totalValue: 780000,
            weightedValue: 468000,
            wonCount: 5,
            lostCount: 2,
            winRate: 38.5,
            byStage: {
                'تواصل أولي': 4,
                'تأهيل العميل': 3,
                'تقديم العرض': 3,
                'التفاوض': 3,
                'إغلاق ناجح': 2
            }
        },
        {
            ownerId: '2',
            ownerName: 'سارة علي',
            totalOpportunities: 18,
            totalValue: 920000,
            weightedValue: 552000,
            wonCount: 6,
            lostCount: 3,
            winRate: 40.0,
            byStage: {
                'تواصل أولي': 5,
                'تأهيل العميل': 3,
                'تقديم العرض': 4,
                'التفاوض': 4,
                'إغلاق ناجح': 2
            }
        },
        {
            ownerId: '3',
            ownerName: 'خالد عبدالله',
            totalOpportunities: 14,
            totalValue: 750000,
            weightedValue: 450000,
            wonCount: 4,
            lostCount: 2,
            winRate: 36.4,
            byStage: {
                'تواصل أولي': 3,
                'تأهيل العميل': 2,
                'تقديم العرض': 3,
                'التفاوض': 2,
                'إغلاق ناجح': 4
            }
        }
    ]

    const mockPeriodData = reportData?.byPeriod || [
        {
            period: 'يناير 2025',
            month: 1,
            year: 2025,
            newOpportunities: 18,
            wonCount: 5,
            lostCount: 3,
            wonValue: 285000,
            lostValue: 145000,
            winRate: 35.7,
            avgDealSize: 57000
        },
        {
            period: 'فبراير 2025',
            month: 2,
            year: 2025,
            newOpportunities: 22,
            wonCount: 8,
            lostCount: 4,
            wonValue: 420000,
            lostValue: 180000,
            winRate: 42.1,
            avgDealSize: 52500
        },
        {
            period: 'مارس 2025',
            month: 3,
            year: 2025,
            newOpportunities: 20,
            wonCount: 6,
            lostCount: 2,
            wonValue: 340000,
            lostValue: 95000,
            winRate: 46.2,
            avgDealSize: 56667
        }
    ]

    // Calculate max value for funnel scaling
    const maxStageValue = Math.max(...mockStageData.map(s => s.value))

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
                                        <Activity className="w-3 h-3 ms-2" />
                                        تحليلات خط المبيعات
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    تقرير خط المبيعات التحليلي
                                </h1>
                                <p className="text-blue-100/80">تحليل شامل لأداء المبيعات والفرص التجارية</p>
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
                                    className="bg-white text-blue-700 hover:bg-blue-50 rounded-xl shadow-lg"
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
                            <Select value={selectedCaseType} onValueChange={setSelectedCaseType}>
                                <SelectTrigger className="w-[150px] rounded-xl border-slate-200">
                                    <SelectValue placeholder="جميع الأنواع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الأنواع</SelectItem>
                                    <SelectItem value="civil">قضايا مدنية</SelectItem>
                                    <SelectItem value="commercial">قضايا تجارية</SelectItem>
                                    <SelectItem value="family">قضايا أسرية</SelectItem>
                                    <SelectItem value="labor">قضايا عمالية</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm text-slate-500">
                            آخر تحديث: {reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString('ar-SA') : 'الآن'}
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">إجمالي القيمة</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.totalValue)}</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    متوسط الفرصة: {formatCurrency(mockSummary.avgOpportunityValue)}
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
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.weightedValue)}</div>
                                <div className="mt-2">
                                    <Progress
                                        value={(mockSummary.weightedValue / mockSummary.totalValue) * 100}
                                        className="h-1.5 bg-purple-100"
                                        indicatorClassName="bg-purple-500"
                                    />
                                    <span className="text-xs text-slate-500 mt-1">
                                        {((mockSummary.weightedValue / mockSummary.totalValue) * 100).toFixed(1)}% من الإجمالي
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">معدل الفوز</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.winRate}%</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    معدل التحويل: {mockSummary.conversionRate}%
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">متوسط دورة البيع</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.avgSalesCycle} يوم</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    متوسط عمر المرحلة: {mockSummary.avgStageAge} يوم
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content with Tabs */}
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-6">
                        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
                            <TabsTrigger value="stage" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                                <BarChart3 className="w-4 h-4 ms-2" />
                                حسب المرحلة
                            </TabsTrigger>
                            <TabsTrigger value="owner" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                                <Users className="w-4 h-4 ms-2" />
                                حسب الموظف
                            </TabsTrigger>
                            <TabsTrigger value="period" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                                <Calendar className="w-4 h-4 ms-2" />
                                حسب الفترة
                            </TabsTrigger>
                        </TabsList>

                        {/* Stage View */}
                        <TabsContent value="stage" className="space-y-6">
                            {/* Pipeline Funnel Visualization */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-500" />
                                        قمع خط المبيعات
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {mockStageData.map((stage, index) => {
                                            const width = (stage.value / maxStageValue) * 100
                                            return (
                                                <div key={stage.stageId} className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: stage.color }}
                                                            />
                                                            <span className="font-medium text-slate-700">{stage.stageName}</span>
                                                            <Badge variant="outline" className="border-slate-200">
                                                                {stage.count} فرصة
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-xs text-slate-500">
                                                                احتمالية: {stage.probability}%
                                                            </span>
                                                            <span className="font-bold text-navy">{formatCurrency(stage.value)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <div className="h-12 bg-slate-100 rounded-lg overflow-hidden">
                                                            <div
                                                                className="h-full flex items-center justify-between px-4 transition-all duration-500"
                                                                style={{
                                                                    width: `${width}%`,
                                                                    background: `linear-gradient(to right, ${stage.color}dd, ${stage.color})`
                                                                }}
                                                            >
                                                                <span className="text-white text-sm font-medium">
                                                                    {formatCurrency(stage.weightedValue)}
                                                                </span>
                                                                {stage.stuckCount > 0 && (
                                                                    <Badge className="bg-white/20 text-white border-0">
                                                                        <AlertCircle className="w-3 h-3 ms-1" />
                                                                        {stage.stuckCount} متعثر
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stage Details Table */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        تفاصيل المراحل
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="text-end font-bold text-slate-700">المرحلة</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">العدد</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">القيمة الكلية</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">القيمة المرجحة</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">متوسط العمر</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">معدل التحويل</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">متعثر</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockStageData.map((stage) => (
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
                                                            {stage.count}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-navy">
                                                        {formatCurrency(stage.value)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="text-purple-600 font-medium">
                                                            {formatCurrency(stage.weightedValue)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={stage.avgAge > 14 ? 'text-orange-600 font-medium' : 'text-slate-600'}>
                                                            {stage.avgAge} يوم
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-medium">{stage.conversionRate}%</span>
                                                            <Progress
                                                                value={stage.conversionRate}
                                                                className="h-1.5 w-12 bg-slate-100"
                                                                indicatorClassName="bg-emerald-500"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {stage.stuckCount > 0 ? (
                                                            <Badge className="bg-orange-100 text-orange-700 border-0">
                                                                <AlertCircle className="w-3 h-3 ms-1" />
                                                                {stage.stuckCount}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Owner View */}
                        <TabsContent value="owner" className="space-y-6">
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Users className="w-5 h-5 text-blue-500" />
                                            أداء موظفي المبيعات
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockOwnerData.length} موظف
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {mockOwnerData.map((owner) => (
                                        <Card key={owner.ownerId} className="border border-slate-100 shadow-none">
                                            <CardContent className="p-5 space-y-4">
                                                {/* Owner Header */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                            {owner.ownerName.split(' ')[0][0]}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-navy">{owner.ownerName}</h3>
                                                            <p className="text-sm text-slate-500">{owner.totalOpportunities} فرصة نشطة</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="text-2xl font-bold text-navy">{formatCurrency(owner.totalValue)}</div>
                                                        <div className="text-sm text-slate-500">
                                                            مرجحة: {formatCurrency(owner.weightedValue)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Performance Metrics */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="bg-emerald-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                            <span className="text-xs text-emerald-700">فاز</span>
                                                        </div>
                                                        <div className="text-xl font-bold text-emerald-700">{owner.wonCount}</div>
                                                    </div>
                                                    <div className="bg-red-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <XCircle className="w-4 h-4 text-red-600" />
                                                            <span className="text-xs text-red-700">خسر</span>
                                                        </div>
                                                        <div className="text-xl font-bold text-red-700">{owner.lostCount}</div>
                                                    </div>
                                                    <div className="bg-blue-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Award className="w-4 h-4 text-blue-600" />
                                                            <span className="text-xs text-blue-700">معدل الفوز</span>
                                                        </div>
                                                        <div className="text-xl font-bold text-blue-700">{owner.winRate}%</div>
                                                    </div>
                                                </div>

                                                {/* Stage Distribution */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-slate-700 mb-3">توزيع الفرص حسب المرحلة</h4>
                                                    <div className="space-y-2">
                                                        {Object.entries(owner.byStage).map(([stage, count]) => (
                                                            <div key={stage} className="flex items-center justify-between text-sm">
                                                                <span className="text-slate-600">{stage}</span>
                                                                <Badge variant="outline" className="border-slate-200">
                                                                    {count}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Period View */}
                        <TabsContent value="period" className="space-y-6">
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-500" />
                                        الأداء حسب الفترة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="text-end font-bold text-slate-700">الفترة</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">فرص جديدة</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">صفقات ناجحة</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">قيمة النجاح</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">صفقات خاسرة</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">قيمة الخسارة</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">معدل الفوز</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">متوسط الصفقة</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockPeriodData.map((period, index) => (
                                                <TableRow key={index} className="hover:bg-slate-50">
                                                    <TableCell className="font-medium text-navy">{period.period}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="border-slate-200">
                                                            <Zap className="w-3 h-3 ms-1" />
                                                            {period.newOpportunities}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                                            <CheckCircle2 className="w-3 h-3 ms-1" />
                                                            {period.wonCount}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="text-emerald-600 font-medium">
                                                            {formatCurrency(period.wonValue)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className="bg-red-100 text-red-700 border-0">
                                                            <XCircle className="w-3 h-3 ms-1" />
                                                            {period.lostCount}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="text-red-600 font-medium">
                                                            {formatCurrency(period.lostValue)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="font-bold text-navy">{period.winRate}%</span>
                                                            <Progress
                                                                value={period.winRate}
                                                                className="h-1.5 w-16 bg-slate-100"
                                                                indicatorClassName="bg-blue-500"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center font-medium text-navy">
                                                        {formatCurrency(period.avgDealSize)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Trend Chart Placeholder */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-blue-500" />
                                        الاتجاهات الشهرية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-2xl">
                                        <div className="text-center">
                                            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500">مخطط الاتجاهات الشهرية</p>
                                            <p className="text-sm text-slate-400 mt-1">سيتم إضافة المخطط التفاعلي قريباً</p>
                                        </div>
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

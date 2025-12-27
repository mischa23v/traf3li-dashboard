import { useState, useMemo } from 'react'
import { ROUTES } from '@/constants/routes'
import {
    Download, Filter, Calendar, TrendingUp, Clock,
    Users, DollarSign, AlertCircle, Target, BarChart3,
    Zap, TrendingDown, Award, Activity
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
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { useExportReport } from '@/hooks/useReports'

interface ConversionData {
    clientId: string
    clientName: string
    originalLead: string
    leadCreatedDate: string
    caseCreatedDate: string
    wonDate: string
    leadToCaseDays: number
    caseToWonDays: number
    totalConversionDays: number
    interactionsCount: number
    caseType: string
    wonValue: number
    salesPerson: string
    territory: string
}

export function LeadConversionTimeReport() {
    // Get first day of year and today for default dates
    const today = new Date()
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1)

    const [startDate, setStartDate] = useState(firstDayOfYear.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [selectedCaseType, setSelectedCaseType] = useState<string>('')
    const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>('')
    const [selectedTerritory, setSelectedTerritory] = useState<string>('')

    const { mutate: exportReport, isPending: isExporting } = useExportReport()
    const isLoading = false
    const isError = false

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const handleExport = (format: 'csv' | 'pdf') => {
        exportReport({
            id: 'lead-conversion-time',
            format: format as any,
            parameters: { startDate, endDate, caseType: selectedCaseType, salesPerson: selectedSalesPerson, territory: selectedTerritory }
        })
    }

    const topNav = [
        { title: 'نظرة عامة', href: ROUTES.dashboard.crm.pipeline, isActive: false },
        { title: 'العملاء المحتملون', href: ROUTES.dashboard.crm.leads.list, isActive: false },
        { title: 'الأنشطة', href: ROUTES.dashboard.crm.activities.list, isActive: false },
        { title: 'الإحالات', href: ROUTES.dashboard.crm.referrals.list, isActive: false },
        { title: 'التقارير', href: ROUTES.dashboard.crm.reports.list, isActive: true },
    ]

    // Mock data for development - will be replaced by API
    const mockData: ConversionData[] = [
        {
            clientId: '1',
            clientName: 'شركة المستقبل للتجارة',
            originalLead: 'LEAD-2025-001',
            leadCreatedDate: '2025-09-15',
            caseCreatedDate: '2025-09-22',
            wonDate: '2025-11-10',
            leadToCaseDays: 7,
            caseToWonDays: 49,
            totalConversionDays: 56,
            interactionsCount: 12,
            caseType: 'تجاري',
            wonValue: 150000,
            salesPerson: 'أحمد محمد',
            territory: 'الرياض'
        },
        {
            clientId: '2',
            clientName: 'مؤسسة الأمان للمقاولات',
            originalLead: 'LEAD-2025-008',
            leadCreatedDate: '2025-08-20',
            caseCreatedDate: '2025-08-25',
            wonDate: '2025-10-15',
            leadToCaseDays: 5,
            caseToWonDays: 51,
            totalConversionDays: 56,
            interactionsCount: 15,
            caseType: 'عمالي',
            wonValue: 180000,
            salesPerson: 'سارة علي',
            territory: 'جدة'
        },
        {
            clientId: '3',
            clientName: 'شركة التقنية المتقدمة',
            originalLead: 'LEAD-2025-015',
            leadCreatedDate: '2025-07-10',
            caseCreatedDate: '2025-07-18',
            wonDate: '2025-09-20',
            leadToCaseDays: 8,
            caseToWonDays: 64,
            totalConversionDays: 72,
            interactionsCount: 18,
            caseType: 'عقاري',
            wonValue: 220000,
            salesPerson: 'محمد خالد',
            territory: 'الدمام'
        },
        {
            clientId: '4',
            clientName: 'مجموعة الخليج الاستثمارية',
            originalLead: 'LEAD-2025-022',
            leadCreatedDate: '2025-10-01',
            caseCreatedDate: '2025-10-05',
            wonDate: '2025-11-15',
            leadToCaseDays: 4,
            caseToWonDays: 41,
            totalConversionDays: 45,
            interactionsCount: 8,
            caseType: 'تجاري',
            wonValue: 120000,
            salesPerson: 'أحمد محمد',
            territory: 'الرياض'
        },
        {
            clientId: '5',
            clientName: 'شركة النور للإعلام',
            originalLead: 'LEAD-2025-030',
            leadCreatedDate: '2025-06-15',
            caseCreatedDate: '2025-06-28',
            wonDate: '2025-10-01',
            leadToCaseDays: 13,
            caseToWonDays: 95,
            totalConversionDays: 108,
            interactionsCount: 22,
            caseType: 'استشاري',
            wonValue: 95000,
            salesPerson: 'فاطمة أحمد',
            territory: 'مكة'
        },
        {
            clientId: '6',
            clientName: 'مؤسسة الرياض التجارية',
            originalLead: 'LEAD-2025-035',
            leadCreatedDate: '2025-09-01',
            caseCreatedDate: '2025-09-03',
            wonDate: '2025-10-20',
            leadToCaseDays: 2,
            caseToWonDays: 47,
            totalConversionDays: 49,
            interactionsCount: 10,
            caseType: 'تجاري',
            wonValue: 135000,
            salesPerson: 'سارة علي',
            territory: 'الرياض'
        }
    ]

    // Calculate summary statistics
    const summary = useMemo(() => {
        const totalConversions = mockData.length
        const avgLeadToCaseDays = mockData.reduce((sum, item) => sum + item.leadToCaseDays, 0) / totalConversions
        const avgCaseToWonDays = mockData.reduce((sum, item) => sum + item.caseToWonDays, 0) / totalConversions
        const avgTotalDays = mockData.reduce((sum, item) => sum + item.totalConversionDays, 0) / totalConversions
        const fastestConversion = Math.min(...mockData.map(item => item.totalConversionDays))
        const slowestConversion = Math.max(...mockData.map(item => item.totalConversionDays))
        const totalRevenue = mockData.reduce((sum, item) => sum + item.wonValue, 0)
        const avgInteractions = mockData.reduce((sum, item) => sum + item.interactionsCount, 0) / totalConversions

        return {
            totalConversions,
            avgLeadToCaseDays: Math.round(avgLeadToCaseDays),
            avgCaseToWonDays: Math.round(avgCaseToWonDays),
            avgTotalDays: Math.round(avgTotalDays),
            fastestConversion,
            slowestConversion,
            totalRevenue,
            avgInteractions: Math.round(avgInteractions)
        }
    }, [mockData])

    // Distribution data for chart
    const distributionRanges = useMemo(() => {
        const ranges = [
            { label: '0-30 يوم', min: 0, max: 30, count: 0, color: 'bg-emerald-500' },
            { label: '31-60 يوم', min: 31, max: 60, count: 0, color: 'bg-blue-500' },
            { label: '61-90 يوم', min: 61, max: 90, count: 0, color: 'bg-amber-500' },
            { label: '+90 يوم', min: 91, max: Infinity, count: 0, color: 'bg-red-500' }
        ]

        mockData.forEach(item => {
            const range = ranges.find(r => item.totalConversionDays >= r.min && item.totalConversionDays <= r.max)
            if (range) range.count++
        })

        const maxCount = Math.max(...ranges.map(r => r.count))
        return ranges.map(r => ({ ...r, percentage: maxCount > 0 ? (r.count / maxCount) * 100 : 0 }))
    }, [mockData])

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
                        <p className="text-slate-500 mb-6">حدث خطأ أثناء تحميل البيانات</p>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

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
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-300/20 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                        <Clock className="w-3 h-3 ms-2" aria-hidden="true" />
                                        تقرير التحويل
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    وقت تحويل العملاء المحتملين
                                </h1>
                                <p className="text-purple-100/80">تحليل مدة التحويل من عميل محتمل إلى قضية رابحة</p>
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
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex flex-wrap items-center gap-4">
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
                            <Select value={selectedCaseType} onValueChange={setSelectedCaseType}>
                                <SelectTrigger className="w-[180px] rounded-xl border-slate-200">
                                    <SelectValue placeholder="نوع القضية" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الأنواع</SelectItem>
                                    <SelectItem value="تجاري">تجاري</SelectItem>
                                    <SelectItem value="عمالي">عمالي</SelectItem>
                                    <SelectItem value="عقاري">عقاري</SelectItem>
                                    <SelectItem value="استشاري">استشاري</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedSalesPerson} onValueChange={setSelectedSalesPerson}>
                                <SelectTrigger className="w-[180px] rounded-xl border-slate-200">
                                    <SelectValue placeholder="موظف المبيعات" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الموظفين</SelectItem>
                                    <SelectItem value="أحمد محمد">أحمد محمد</SelectItem>
                                    <SelectItem value="سارة علي">سارة علي</SelectItem>
                                    <SelectItem value="محمد خالد">محمد خالد</SelectItem>
                                    <SelectItem value="فاطمة أحمد">فاطمة أحمد</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                                <SelectTrigger className="w-[180px] rounded-xl border-slate-200">
                                    <SelectValue placeholder="المنطقة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع المناطق</SelectItem>
                                    <SelectItem value="الرياض">الرياض</SelectItem>
                                    <SelectItem value="جدة">جدة</SelectItem>
                                    <SelectItem value="الدمام">الدمام</SelectItem>
                                    <SelectItem value="مكة">مكة</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-purple-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">متوسط الوقت الكلي</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{summary.avgTotalDays} يوم</div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                    <span>عميل → قضية: {summary.avgLeadToCaseDays} يوم</span>
                                    <span>•</span>
                                    <span>قضية → ربح: {summary.avgCaseToWonDays} يوم</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">أسرع تحويل</span>
                                </div>
                                <div className="text-2xl font-bold text-emerald-600">{summary.fastestConversion} يوم</div>
                                <div className="mt-2">
                                    <Progress value={100} className="h-1.5 bg-emerald-100" indicatorClassName="bg-emerald-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <TrendingDown className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">أبطأ تحويل</span>
                                </div>
                                <div className="text-2xl font-bold text-amber-600">{summary.slowestConversion} يوم</div>
                                <div className="mt-2">
                                    <Progress
                                        value={(summary.fastestConversion / summary.slowestConversion) * 100}
                                        className="h-1.5 bg-amber-100"
                                        indicatorClassName="bg-amber-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">إجمالي القيمة</span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(summary.totalRevenue)}</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {summary.totalConversions} تحويل ناجح
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Conversion Time Distribution Chart */}
                        <Card className="border-0 shadow-sm rounded-3xl lg:col-span-1">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-purple-500" />
                                    توزيع وقت التحويل
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {distributionRanges.map((range) => (
                                        <div key={range.label} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-slate-700">{range.label}</span>
                                                <span className="font-bold text-navy">{range.count} حالة</span>
                                            </div>
                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${range.color} rounded-full transition-all duration-500`}
                                                    style={{ width: `${range.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-slate-600">متوسط التفاعلات</span>
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-purple-600" />
                                            <span className="font-bold text-navy">{summary.avgInteractions}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Conversions Table */}
                        <Card className="border-0 shadow-sm rounded-3xl lg:col-span-2">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Target className="w-5 h-5 text-purple-500" />
                                        تفاصيل التحويلات
                                    </CardTitle>
                                    <Badge variant="outline" className="border-slate-200">
                                        {mockData.length} تحويل
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="text-end font-bold text-slate-700">العميل</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">العميل المحتمل</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">عميل→قضية</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">قضية→ربح</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">المجموع</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">التفاعلات</TableHead>
                                                <TableHead className="text-center font-bold text-slate-700">النوع</TableHead>
                                                <TableHead className="text-start font-bold text-slate-700">القيمة</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockData.map((item) => (
                                                <TableRow key={item.clientId} className="hover:bg-slate-50">
                                                    <TableCell className="font-medium text-navy">
                                                        <div className="flex flex-col">
                                                            <span>{item.clientName}</span>
                                                            <span className="text-xs text-slate-500">{item.salesPerson}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <Badge variant="outline" className="border-slate-200 mb-1">
                                                                {item.originalLead}
                                                            </Badge>
                                                            <span className="text-xs text-slate-500">{formatDate(item.leadCreatedDate)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className={`
                                                            ${item.leadToCaseDays <= 5 ? 'bg-emerald-100 text-emerald-700' :
                                                                item.leadToCaseDays <= 10 ? 'bg-blue-100 text-blue-700' :
                                                                'bg-amber-100 text-amber-700'}
                                                            border-0
                                                        `}>
                                                            {item.leadToCaseDays} يوم
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className={`
                                                            ${item.caseToWonDays <= 45 ? 'bg-emerald-100 text-emerald-700' :
                                                                item.caseToWonDays <= 60 ? 'bg-blue-100 text-blue-700' :
                                                                item.caseToWonDays <= 90 ? 'bg-amber-100 text-amber-700' :
                                                                'bg-red-100 text-red-700'}
                                                            border-0
                                                        `}>
                                                            {item.caseToWonDays} يوم
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-bold text-purple-600">{item.totalConversionDays} يوم</span>
                                                            <span className="text-xs text-slate-500">{formatDate(item.wonDate)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Activity className="w-3 h-3 text-slate-600" />
                                                            <span className="font-medium">{item.interactionsCount}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="border-slate-200">
                                                            {item.caseType}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-start font-bold text-navy">
                                                        {formatCurrency(item.wonValue)}
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

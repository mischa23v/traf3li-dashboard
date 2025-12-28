import { useState, useMemo, lazy, Suspense } from 'react'
import { ROUTES } from '@/constants/routes'
import { useTranslation } from 'react-i18next'
import {
    Download,
    Filter,
    Calendar,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Users,
    Phone,
    Mail,
    Video,
    CheckSquare,
    FileText,
    Clock,
    BarChart3,
    PieChart as PieChartIcon,
    Activity as ActivityIcon,
    Award,
    Target,
    Zap,
    MessageSquare,
    PhoneCall,
    PhoneIncoming,
    PhoneOutgoing,
    Send,
    CheckCircle2,
    XCircle,
    Timer,
    Percent,
    ArrowUpRight,
    ArrowDownRight,
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
const useActivityAnalyticsReport = (filters: any) => {
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

export function ActivityAnalyticsReport() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    // Get first day of month and today for default dates
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [selectedActivityType, setSelectedActivityType] = useState<string>('all')
    const [selectedOwner, setSelectedOwner] = useState<string>('all')
    const [selectedRelatedTo, setSelectedRelatedTo] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')
    const [viewMode, setViewMode] = useState<'overview' | 'by_rep' | 'by_deal'>('overview')

    const filters = useMemo(() => {
        const f: any = {}
        if (startDate) f.startDate = startDate
        if (endDate) f.endDate = endDate
        if (selectedActivityType && selectedActivityType !== 'all') f.activityType = selectedActivityType
        if (selectedOwner && selectedOwner !== 'all') f.ownerId = selectedOwner
        if (selectedRelatedTo && selectedRelatedTo !== 'all') f.relatedTo = selectedRelatedTo
        if (selectedStatus && selectedStatus !== 'all') f.status = selectedStatus
        return f
    }, [startDate, endDate, selectedActivityType, selectedOwner, selectedRelatedTo, selectedStatus])

    const { data: reportData, isLoading, isError, error, refetch } = useActivityAnalyticsReport(filters)
    const { mutate: exportReport, isPending: isExporting } = useExportReport()

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`
    }

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} ${isRTL ? 'دقيقة' : 'min'}`
        }
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
    }

    const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
        exportReport({ reportType: 'activity-analytics', format, filters })
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
                        <Skeleton className="h-24 rounded-2xl" />
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
        totalActivities: 1847,
        callsMade: 624,
        emailsSent: 482,
        meetingsHeld: 312,
        tasksCompleted: 429,
        callToMeetingRate: 38.5,
        emailResponseRate: 62.8,
        avgActivitiesPerDeal: 12.4,
        avgActivitiesPerStageAdvancement: 8.7,
        overdueTasksCount: 34,
    }

    // Activity type distribution for donut chart
    const mockActivityDistribution = reportData?.distribution || [
        { type: isRTL ? 'مكالمات' : 'Calls', typeEn: 'Calls', count: 624, percentage: 33.8, color: '#3b82f6' },
        { type: isRTL ? 'بريد إلكتروني' : 'Emails', typeEn: 'Emails', count: 482, percentage: 26.1, color: '#8b5cf6' },
        { type: isRTL ? 'اجتماعات' : 'Meetings', typeEn: 'Meetings', count: 312, percentage: 16.9, color: '#10b981' },
        { type: isRTL ? 'مهام' : 'Tasks', typeEn: 'Tasks', count: 429, percentage: 23.2, color: '#f59e0b' },
        { type: isRTL ? 'ملاحظات' : 'Notes', typeEn: 'Notes', count: 0, percentage: 0, color: '#ec4899' },
    ]

    // Activities per day of week
    const mockActivitiesByDay = reportData?.byDay || [
        { day: isRTL ? 'الأحد' : 'Sun', calls: 98, emails: 75, meetings: 42, tasks: 68 },
        { day: isRTL ? 'الإثنين' : 'Mon', calls: 125, emails: 95, meetings: 58, tasks: 82 },
        { day: isRTL ? 'الثلاثاء' : 'Tue', calls: 118, emails: 88, meetings: 52, tasks: 75 },
        { day: isRTL ? 'الأربعاء' : 'Wed', calls: 132, emails: 102, meetings: 64, tasks: 89 },
        { day: isRTL ? 'الخميس' : 'Thu', calls: 108, emails: 82, meetings: 56, tasks: 71 },
        { day: isRTL ? 'الجمعة' : 'Fri', calls: 43, emails: 40, meetings: 40, tasks: 44 },
    ]

    // Activity volume trend over time
    const mockActivityTrend = reportData?.trend || [
        { date: isRTL ? '1 يناير' : 'Jan 1', activities: 52 },
        { date: isRTL ? '5 يناير' : 'Jan 5', activities: 68 },
        { date: isRTL ? '10 يناير' : 'Jan 10', activities: 75 },
        { date: isRTL ? '15 يناير' : 'Jan 15', activities: 82 },
        { date: isRTL ? '20 يناير' : 'Jan 20', activities: 95 },
        { date: isRTL ? '25 يناير' : 'Jan 25', activities: 88 },
        { date: isRTL ? '30 يناير' : 'Jan 30', activities: 102 },
    ]

    // Activity by hour of day (heat map data)
    const mockActivitiesByHour = reportData?.byHour || [
        { hour: '8-9', value: 45 },
        { hour: '9-10', value: 125 },
        { hour: '10-11', value: 168 },
        { hour: '11-12', value: 195 },
        { hour: '12-1', value: 85 },
        { hour: '1-2', value: 142 },
        { hour: '2-3', value: 178 },
        { hour: '3-4', value: 165 },
        { hour: '4-5', value: 132 },
        { hour: '5-6', value: 58 },
    ]

    // Rep activity leaderboard
    const mockRepLeaderboard = reportData?.byRep || [
        {
            repId: '1',
            repName: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
            totalActivities: 524,
            calls: 185,
            emails: 152,
            meetings: 98,
            tasks: 89,
            avgPerDay: 17.5,
            callDuration: 24.5,
            emailOpenRate: 68.5,
            meetingCompletionRate: 92.3,
            rank: 1,
        },
        {
            repId: '2',
            repName: isRTL ? 'سارة علي' : 'Sarah Ali',
            totalActivities: 478,
            calls: 168,
            emails: 142,
            meetings: 82,
            tasks: 86,
            avgPerDay: 15.9,
            callDuration: 22.8,
            emailOpenRate: 71.2,
            meetingCompletionRate: 89.0,
            rank: 2,
        },
        {
            repId: '3',
            repName: isRTL ? 'خالد عبدالله' : 'Khaled Abdullah',
            totalActivities: 412,
            calls: 142,
            emails: 118,
            meetings: 72,
            tasks: 80,
            avgPerDay: 13.7,
            callDuration: 21.2,
            emailOpenRate: 64.8,
            meetingCompletionRate: 87.5,
            rank: 3,
        },
        {
            repId: '4',
            repName: isRTL ? 'فاطمة حسن' : 'Fatima Hassan',
            totalActivities: 433,
            calls: 129,
            emails: 70,
            meetings: 60,
            tasks: 174,
            avgPerDay: 14.4,
            callDuration: 26.3,
            emailOpenRate: 59.2,
            meetingCompletionRate: 85.0,
            rank: 4,
        },
    ]

    // Activity by deal stage
    const mockActivitiesByDeal = reportData?.byDeal || [
        {
            dealId: '1',
            dealName: isRTL ? 'صفقة شركة التقنية المتقدمة' : 'Advanced Tech Company Deal',
            stage: isRTL ? 'التفاوض' : 'Negotiation',
            totalActivities: 48,
            calls: 18,
            emails: 15,
            meetings: 8,
            tasks: 7,
            lastActivityDate: '2024-01-25',
            daysInStage: 12,
        },
        {
            dealId: '2',
            dealName: isRTL ? 'صفقة مؤسسة النجاح' : 'Success Foundation Deal',
            stage: isRTL ? 'عرض مرسل' : 'Proposal Sent',
            totalActivities: 35,
            calls: 12,
            emails: 14,
            meetings: 5,
            tasks: 4,
            lastActivityDate: '2024-01-24',
            daysInStage: 8,
        },
        {
            dealId: '3',
            dealName: isRTL ? 'صفقة شركة الابتكار' : 'Innovation Corp Deal',
            stage: isRTL ? 'مؤهل للمبيعات' : 'Sales Qualified',
            totalActivities: 28,
            calls: 10,
            emails: 12,
            meetings: 3,
            tasks: 3,
            lastActivityDate: '2024-01-26',
            daysInStage: 5,
        },
    ]

    // Recent activities table data
    const mockRecentActivities = reportData?.recent || [
        {
            id: '1',
            type: 'call',
            typeName: isRTL ? 'مكالمة' : 'Call',
            subject: isRTL ? 'متابعة العرض التقديمي' : 'Follow-up on Proposal',
            relatedTo: isRTL ? 'صفقة شركة التقنية المتقدمة' : 'Advanced Tech Company Deal',
            relatedType: 'deal',
            owner: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
            dateTime: '2024-01-26 10:30',
            duration: 25,
            status: 'completed',
        },
        {
            id: '2',
            type: 'email',
            typeName: isRTL ? 'بريد إلكتروني' : 'Email',
            subject: isRTL ? 'إرسال تفاصيل الأسعار' : 'Pricing Details Sent',
            relatedTo: isRTL ? 'عميل محمد أحمد' : 'Contact Mohammed Ahmed',
            relatedType: 'contact',
            owner: isRTL ? 'سارة علي' : 'Sarah Ali',
            dateTime: '2024-01-26 09:15',
            duration: 0,
            status: 'completed',
        },
        {
            id: '3',
            type: 'meeting',
            typeName: isRTL ? 'اجتماع' : 'Meeting',
            subject: isRTL ? 'عرض تجريبي للمنتج' : 'Product Demo',
            relatedTo: isRTL ? 'صفقة مؤسسة النجاح' : 'Success Foundation Deal',
            relatedType: 'deal',
            owner: isRTL ? 'خالد عبدالله' : 'Khaled Abdullah',
            dateTime: '2024-01-26 14:00',
            duration: 60,
            status: 'completed',
        },
        {
            id: '4',
            type: 'task',
            typeName: isRTL ? 'مهمة' : 'Task',
            subject: isRTL ? 'تحضير العقد' : 'Prepare Contract',
            relatedTo: isRTL ? 'صفقة شركة الابتكار' : 'Innovation Corp Deal',
            relatedType: 'deal',
            owner: isRTL ? 'فاطمة حسن' : 'Fatima Hassan',
            dateTime: '2024-01-27 09:00',
            duration: 0,
            status: 'pending',
        },
        {
            id: '5',
            type: 'task',
            typeName: isRTL ? 'مهمة' : 'Task',
            subject: isRTL ? 'مراجعة الاقتراح' : 'Review Proposal',
            relatedTo: isRTL ? 'عميل محتمل سارة' : 'Lead Sarah',
            relatedType: 'lead',
            owner: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed',
            dateTime: '2024-01-24 15:00',
            duration: 0,
            status: 'overdue',
        },
    ]

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f97316']

    // Calculate team average for comparison
    const teamAverage = mockRepLeaderboard.reduce((sum, rep) => sum + rep.avgPerDay, 0) / mockRepLeaderboard.length

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
                    <div className="bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-300/20 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                        <ActivityIcon className="w-3 h-3 ms-2" aria-hidden="true" />
                                        {isRTL ? 'تقرير الأنشطة' : 'Activity Report'}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    {isRTL ? 'تحليلات الأنشطة' : 'Activity Analytics'}
                                </h1>
                                <p className="text-cyan-100/80">
                                    {isRTL ? 'تحليل شامل لأنشطة الفريق وفعاليتها وأداء الموظفين' : 'Comprehensive analysis of team activities, effectiveness, and rep performance'}
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
                                    className="bg-white text-cyan-700 hover:bg-cyan-50 rounded-xl shadow-lg"
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
                                        {isRTL ? 'نوع النشاط' : 'Activity Type'}
                                    </Label>
                                    <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'جميع الأنواع' : 'All Types'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                                            <SelectItem value="call">{isRTL ? 'مكالمات' : 'Calls'}</SelectItem>
                                            <SelectItem value="email">{isRTL ? 'بريد إلكتروني' : 'Emails'}</SelectItem>
                                            <SelectItem value="meeting">{isRTL ? 'اجتماعات' : 'Meetings'}</SelectItem>
                                            <SelectItem value="task">{isRTL ? 'مهام' : 'Tasks'}</SelectItem>
                                            <SelectItem value="note">{isRTL ? 'ملاحظات' : 'Notes'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {isRTL ? 'المسؤول' : 'Owner'}
                                    </Label>
                                    <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'الجميع' : 'All'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'الجميع' : 'All'}</SelectItem>
                                            <SelectItem value="1">{isRTL ? 'أحمد محمد' : 'Ahmed Mohammed'}</SelectItem>
                                            <SelectItem value="2">{isRTL ? 'سارة علي' : 'Sarah Ali'}</SelectItem>
                                            <SelectItem value="3">{isRTL ? 'خالد عبدالله' : 'Khaled Abdullah'}</SelectItem>
                                            <SelectItem value="4">{isRTL ? 'فاطمة حسن' : 'Fatima Hassan'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {isRTL ? 'متعلق بـ' : 'Related To'}
                                    </Label>
                                    <Select value={selectedRelatedTo} onValueChange={setSelectedRelatedTo}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'الكل' : 'All'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                                            <SelectItem value="deals">{isRTL ? 'صفقات' : 'Deals'}</SelectItem>
                                            <SelectItem value="contacts">{isRTL ? 'جهات اتصال' : 'Contacts'}</SelectItem>
                                            <SelectItem value="leads">{isRTL ? 'عملاء محتملون' : 'Leads'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-600">
                                        {isRTL ? 'الحالة' : 'Status'}
                                    </Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="rounded-xl border-slate-200">
                                            <SelectValue placeholder={isRTL ? 'جميع الحالات' : 'All Statuses'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                                            <SelectItem value="completed">{isRTL ? 'مكتمل' : 'Completed'}</SelectItem>
                                            <SelectItem value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                                            <SelectItem value="overdue">{isRTL ? 'متأخر' : 'Overdue'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                                        <ActivityIcon className="w-5 h-5 text-cyan-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'إجمالي الأنشطة' : 'Total Activities'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.totalActivities.toLocaleString()}</div>
                                <div className="mt-2 text-xs text-slate-500">
                                    {isRTL ? 'جميع الأنواع' : 'All types'}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'مكالمات' : 'Calls Made'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.callsMade.toLocaleString()}</div>
                                <div className="mt-2 text-xs text-blue-600">
                                    {formatPercentage((mockSummary.callsMade / mockSummary.totalActivities) * 100)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-purple-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'رسائل بريد' : 'Emails Sent'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.emailsSent.toLocaleString()}</div>
                                <div className="mt-2 text-xs text-purple-600">
                                    {formatPercentage((mockSummary.emailsSent / mockSummary.totalActivities) * 100)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <Video className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'اجتماعات' : 'Meetings Held'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.meetingsHeld.toLocaleString()}</div>
                                <div className="mt-2 text-xs text-emerald-600">
                                    {formatPercentage((mockSummary.meetingsHeld / mockSummary.totalActivities) * 100)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <CheckSquare className="w-5 h-5 text-amber-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'مهام مكتملة' : 'Tasks Completed'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{mockSummary.tasksCompleted.toLocaleString()}</div>
                                <div className="mt-2 text-xs text-amber-600">
                                    {formatPercentage((mockSummary.tasksCompleted / mockSummary.totalActivities) * 100)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content with Tabs */}
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="space-y-6">
                        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl">
                            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                                <PieChartIcon className="w-4 h-4 ms-2" aria-hidden="true" />
                                {isRTL ? 'نظرة عامة' : 'Overview'}
                            </TabsTrigger>
                            <TabsTrigger value="by_rep" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                                <Users className="w-4 h-4 ms-2" aria-hidden="true" />
                                {isRTL ? 'حسب الموظف' : 'By Rep'}
                            </TabsTrigger>
                            <TabsTrigger value="by_deal" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                                <Target className="w-4 h-4 ms-2" aria-hidden="true" />
                                {isRTL ? 'حسب الصفقة' : 'By Deal'}
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Activity Distribution & Activities by Day */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Donut Chart - Activity Distribution */}
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <PieChartIcon className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                                            {isRTL ? 'توزيع الأنشطة حسب النوع' : 'Activity Type Breakdown'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Suspense fallback={<ChartSkeleton />}>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={mockActivityDistribution}
                                                        dataKey="count"
                                                        nameKey="type"
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={2}
                                                        label={(entry) => `${entry.percentage}%`}
                                                    >
                                                        {mockActivityDistribution.map((entry, index) => (
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

                                {/* Bar Chart - Activities per Day of Week */}
                                <Card className="border-0 shadow-sm rounded-3xl">
                                    <CardHeader className="border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                                            {isRTL ? 'الأنشطة حسب اليوم' : 'Activities per Day of Week'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Suspense fallback={<ChartSkeleton />}>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={mockActivitiesByDay}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                    <XAxis
                                                        dataKey="day"
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
                                                    <Bar dataKey="calls" fill="#3b82f6" radius={[8, 8, 0, 0]} name={isRTL ? 'مكالمات' : 'Calls'} />
                                                    <Bar dataKey="emails" fill="#8b5cf6" radius={[8, 8, 0, 0]} name={isRTL ? 'رسائل' : 'Emails'} />
                                                    <Bar dataKey="meetings" fill="#10b981" radius={[8, 8, 0, 0]} name={isRTL ? 'اجتماعات' : 'Meetings'} />
                                                    <Bar dataKey="tasks" fill="#f59e0b" radius={[8, 8, 0, 0]} name={isRTL ? 'مهام' : 'Tasks'} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Suspense>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Activity Volume Trend */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <ActivityIcon className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                                        {isRTL ? 'اتجاه حجم الأنشطة' : 'Activity Volume Trend Over Time'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <Suspense fallback={<ChartSkeleton />}>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={mockActivityTrend}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="date"
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
                                                <Line type="monotone" dataKey="activities" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Suspense>
                                </CardContent>
                            </Card>

                            {/* Activity by Hour - Heat Map Style */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                                        {isRTL ? 'الأنشطة حسب الساعة' : 'Activity by Hour of Day'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                                        {mockActivitiesByHour.map((hourData, index) => {
                                            const maxValue = Math.max(...mockActivitiesByHour.map(h => h.value))
                                            const intensity = (hourData.value / maxValue) * 100
                                            return (
                                                <div key={index} className="space-y-1">
                                                    <div
                                                        className="h-20 rounded-lg flex items-end justify-center p-2 cursor-pointer transition-all hover:scale-105"
                                                        style={{
                                                            backgroundColor: `rgba(6, 182, 212, ${intensity / 100})`,
                                                        }}
                                                        title={`${hourData.hour}: ${hourData.value} ${isRTL ? 'نشاط' : 'activities'}`}
                                                    >
                                                        <span className={cn(
                                                            "text-xs font-medium",
                                                            intensity > 50 ? "text-white" : "text-slate-700"
                                                        )}>
                                                            {hourData.value}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-center text-slate-600">{hourData.hour}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Activity Effectiveness Section */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                                        {isRTL ? 'فعالية الأنشطة' : 'Activity Effectiveness'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-4 bg-blue-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <PhoneCall className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                <span className="text-sm font-medium text-blue-900">
                                                    {isRTL ? 'معدل تحويل المكالمات للاجتماعات' : 'Call-to-Meeting Rate'}
                                                </span>
                                            </div>
                                            <div className="text-3xl font-bold text-blue-700 mb-2">
                                                {formatPercentage(mockSummary.callToMeetingRate)}
                                            </div>
                                            <Progress
                                                value={mockSummary.callToMeetingRate}
                                                className="h-2 bg-blue-100"
                                                indicatorClassName="bg-blue-600"
                                            />
                                        </div>

                                        <div className="p-4 bg-purple-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Send className="w-5 h-5 text-purple-600" aria-hidden="true" />
                                                <span className="text-sm font-medium text-purple-900">
                                                    {isRTL ? 'معدل استجابة البريد' : 'Email Response Rate'}
                                                </span>
                                            </div>
                                            <div className="text-3xl font-bold text-purple-700 mb-2">
                                                {formatPercentage(mockSummary.emailResponseRate)}
                                            </div>
                                            <Progress
                                                value={mockSummary.emailResponseRate}
                                                className="h-2 bg-purple-100"
                                                indicatorClassName="bg-purple-600"
                                            />
                                        </div>

                                        <div className="p-4 bg-emerald-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Target className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                                <span className="text-sm font-medium text-emerald-900">
                                                    {isRTL ? 'متوسط الأنشطة لكل صفقة مغلقة' : 'Avg Activities per Deal Won'}
                                                </span>
                                            </div>
                                            <div className="text-3xl font-bold text-emerald-700">
                                                {mockSummary.avgActivitiesPerDeal.toFixed(1)}
                                            </div>
                                            <div className="text-xs text-emerald-600 mt-2">
                                                {isRTL ? 'نشاط' : 'activities'}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-amber-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <ArrowUpRight className="w-5 h-5 text-amber-600" aria-hidden="true" />
                                                <span className="text-sm font-medium text-amber-900">
                                                    {isRTL ? 'الأنشطة لكل تقدم مرحلي' : 'Activities per Stage Advancement'}
                                                </span>
                                            </div>
                                            <div className="text-3xl font-bold text-amber-700">
                                                {mockSummary.avgActivitiesPerStageAdvancement.toFixed(1)}
                                            </div>
                                            <div className="text-xs text-amber-600 mt-2">
                                                {isRTL ? 'نشاط' : 'activities'}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Activity Quality Metrics */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                        <Award className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                                        {isRTL ? 'مقاييس جودة الأنشطة' : 'Activity Quality Metrics'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-4 border border-slate-200 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Timer className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {isRTL ? 'متوسط مدة المكالمة' : 'Avg Call Duration'}
                                                </span>
                                            </div>
                                            <div className="text-2xl font-bold text-navy">
                                                {formatDuration(23.5)}
                                            </div>
                                        </div>

                                        <div className="p-4 border border-slate-200 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Mail className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {isRTL ? 'معدل فتح البريد' : 'Email Open Rate'}
                                                </span>
                                            </div>
                                            <div className="text-2xl font-bold text-navy">
                                                {formatPercentage(65.8)}
                                            </div>
                                        </div>

                                        <div className="p-4 border border-slate-200 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {isRTL ? 'معدل إتمام الاجتماعات' : 'Meeting Completion Rate'}
                                                </span>
                                            </div>
                                            <div className="text-2xl font-bold text-navy">
                                                {formatPercentage(88.5)}
                                            </div>
                                        </div>

                                        <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <XCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                                                <span className="text-sm font-medium text-red-900">
                                                    {isRTL ? 'المهام المتأخرة' : 'Overdue Tasks'}
                                                </span>
                                            </div>
                                            <div className="text-2xl font-bold text-red-700">
                                                {mockSummary.overdueTasksCount}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activities Table */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                                            {isRTL ? 'الأنشطة الأخيرة' : 'Recent Activities'}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockRecentActivities.length} {isRTL ? 'نشاط' : 'activities'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50">
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {isRTL ? 'النوع' : 'Type'}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {isRTL ? 'الموضوع' : 'Subject'}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {isRTL ? 'متعلق بـ' : 'Related To'}
                                                    </TableHead>
                                                    <TableHead className="text-start font-bold text-slate-700">
                                                        {isRTL ? 'المسؤول' : 'Owner'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'التاريخ والوقت' : 'Date/Time'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'المدة' : 'Duration'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'الحالة' : 'Status'}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockRecentActivities.map((activity) => (
                                                    <TableRow key={activity.id} className="hover:bg-slate-50">
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {activity.type === 'call' && <Phone className="w-4 h-4 text-blue-600" aria-hidden="true" />}
                                                                {activity.type === 'email' && <Mail className="w-4 h-4 text-purple-600" aria-hidden="true" />}
                                                                {activity.type === 'meeting' && <Video className="w-4 h-4 text-emerald-600" aria-hidden="true" />}
                                                                {activity.type === 'task' && <CheckSquare className="w-4 h-4 text-amber-600" aria-hidden="true" />}
                                                                <span className="text-sm font-medium">{activity.typeName}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-navy">
                                                            {activity.subject}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="border-slate-200 text-xs">
                                                                    {activity.relatedType === 'deal' && (isRTL ? 'صفقة' : 'Deal')}
                                                                    {activity.relatedType === 'contact' && (isRTL ? 'جهة اتصال' : 'Contact')}
                                                                    {activity.relatedType === 'lead' && (isRTL ? 'عميل محتمل' : 'Lead')}
                                                                </Badge>
                                                                <span className="text-sm text-slate-600">{activity.relatedTo}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">
                                                            {activity.owner}
                                                        </TableCell>
                                                        <TableCell className="text-center text-sm text-slate-600">
                                                            {activity.dateTime}
                                                        </TableCell>
                                                        <TableCell className="text-center text-sm text-slate-600">
                                                            {activity.duration > 0 ? formatDuration(activity.duration) : '-'}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {activity.status === 'completed' && (
                                                                <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                                                    <CheckCircle2 className="w-3 h-3 me-1" aria-hidden="true" />
                                                                    {isRTL ? 'مكتمل' : 'Completed'}
                                                                </Badge>
                                                            )}
                                                            {activity.status === 'pending' && (
                                                                <Badge className="bg-blue-100 text-blue-700 border-0">
                                                                    <Clock className="w-3 h-3 me-1" aria-hidden="true" />
                                                                    {isRTL ? 'قيد الانتظار' : 'Pending'}
                                                                </Badge>
                                                            )}
                                                            {activity.status === 'overdue' && (
                                                                <Badge className="bg-red-100 text-red-700 border-0">
                                                                    <XCircle className="w-3 h-3 me-1" aria-hidden="true" />
                                                                    {isRTL ? 'متأخر' : 'Overdue'}
                                                                </Badge>
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

                        {/* By Rep Tab */}
                        <TabsContent value="by_rep" className="space-y-6">
                            {/* Rep Activity Leaderboard */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Award className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                                            {isRTL ? 'لوحة صدارة الموظفين' : 'Rep Activity Leaderboard'}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockRepLeaderboard.length} {isRTL ? 'موظف' : 'reps'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {mockRepLeaderboard.map((rep) => (
                                        <Card key={rep.repId} className="border border-slate-100 shadow-none">
                                            <CardContent className="p-5 space-y-4">
                                                {/* Rep Header */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Badge
                                                            className={cn(
                                                                "text-lg px-3 py-1",
                                                                rep.rank === 1 ? "bg-amber-100 text-amber-700 border-0" :
                                                                rep.rank === 2 ? "bg-slate-200 text-slate-700 border-0" :
                                                                rep.rank === 3 ? "bg-orange-100 text-orange-700 border-0" :
                                                                "bg-slate-100 text-slate-600 border-0"
                                                            )}
                                                        >
                                                            #{rep.rank}
                                                        </Badge>
                                                        <div>
                                                            <h3 className="font-bold text-navy text-lg">{rep.repName}</h3>
                                                            <p className="text-sm text-slate-500">
                                                                {rep.totalActivities} {isRTL ? 'نشاط إجمالي' : 'total activities'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="text-2xl font-bold text-navy">{rep.avgPerDay.toFixed(1)}</div>
                                                        <div className="text-sm text-slate-500">{isRTL ? 'متوسط يومي' : 'avg per day'}</div>
                                                        <div className="flex items-center gap-1 justify-end mt-1">
                                                            {rep.avgPerDay > teamAverage ? (
                                                                <ArrowUpRight className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                                            ) : (
                                                                <ArrowDownRight className="w-4 h-4 text-red-600" aria-hidden="true" />
                                                            )}
                                                            <span className={cn(
                                                                "text-xs font-medium",
                                                                rep.avgPerDay > teamAverage ? "text-emerald-600" : "text-red-600"
                                                            )}>
                                                                {rep.avgPerDay > teamAverage ? 'Above' : 'Below'} avg
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Activity Breakdown */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <div className="bg-blue-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Phone className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                                            <span className="text-xs text-blue-700">{isRTL ? 'مكالمات' : 'Calls'}</span>
                                                        </div>
                                                        <div className="text-xl font-bold text-blue-700">{rep.calls}</div>
                                                    </div>
                                                    <div className="bg-purple-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Mail className="w-4 h-4 text-purple-600" aria-hidden="true" />
                                                            <span className="text-xs text-purple-700">{isRTL ? 'رسائل' : 'Emails'}</span>
                                                        </div>
                                                        <div className="text-xl font-bold text-purple-700">{rep.emails}</div>
                                                    </div>
                                                    <div className="bg-emerald-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Video className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                                            <span className="text-xs text-emerald-700">{isRTL ? 'اجتماعات' : 'Meetings'}</span>
                                                        </div>
                                                        <div className="text-xl font-bold text-emerald-700">{rep.meetings}</div>
                                                    </div>
                                                    <div className="bg-amber-50 p-3 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <CheckSquare className="w-4 h-4 text-amber-600" aria-hidden="true" />
                                                            <span className="text-xs text-amber-700">{isRTL ? 'مهام' : 'Tasks'}</span>
                                                        </div>
                                                        <div className="text-xl font-bold text-amber-700">{rep.tasks}</div>
                                                    </div>
                                                </div>

                                                {/* Quality Metrics */}
                                                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">{isRTL ? 'مدة المكالمة' : 'Call Duration'}</div>
                                                        <div className="text-sm font-bold text-navy">{formatDuration(rep.callDuration)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">{isRTL ? 'فتح البريد' : 'Email Open'}</div>
                                                        <div className="text-sm font-bold text-navy">{formatPercentage(rep.emailOpenRate)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-slate-500 mb-1">{isRTL ? 'إتمام اجتماع' : 'Meeting Complete'}</div>
                                                        <div className="text-sm font-bold text-navy">{formatPercentage(rep.meetingCompletionRate)}</div>
                                                    </div>
                                                </div>

                                                {/* Activity Progress Bar */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-slate-600">{isRTL ? 'التقدم نحو الهدف' : 'Progress to Target'}</span>
                                                        <span className="text-sm font-medium text-navy">
                                                            {rep.totalActivities} / 600
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={(rep.totalActivities / 600) * 100}
                                                        className="h-2 bg-slate-100"
                                                        indicatorClassName={cn(
                                                            rep.totalActivities > 500 ? "bg-emerald-500" :
                                                            rep.totalActivities > 400 ? "bg-blue-500" :
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

                        {/* By Deal Tab */}
                        <TabsContent value="by_deal" className="space-y-6">
                            {/* Activity by Deal Stage */}
                            <Card className="border-0 shadow-sm rounded-3xl">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                            <Target className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                                            {isRTL ? 'الأنشطة حسب الصفقة' : 'Activities by Deal'}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-slate-200">
                                            {mockActivitiesByDeal.length} {isRTL ? 'صفقة' : 'deals'}
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
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'المرحلة' : 'Stage'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'إجمالي الأنشطة' : 'Total Activities'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'مكالمات' : 'Calls'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'رسائل' : 'Emails'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'اجتماعات' : 'Meetings'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'مهام' : 'Tasks'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'آخر نشاط' : 'Last Activity'}
                                                    </TableHead>
                                                    <TableHead className="text-center font-bold text-slate-700">
                                                        {isRTL ? 'أيام في المرحلة' : 'Days in Stage'}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {mockActivitiesByDeal.map((deal) => (
                                                    <TableRow key={deal.dealId} className="hover:bg-slate-50">
                                                        <TableCell className="font-medium text-navy">
                                                            {deal.dealName}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline" className="border-purple-200 text-purple-700">
                                                                {deal.stage}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge className="bg-cyan-100 text-cyan-700 border-0 text-lg px-3">
                                                                {deal.totalActivities}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Phone className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                                                <span className="font-medium">{deal.calls}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Mail className="w-4 h-4 text-purple-600" aria-hidden="true" />
                                                                <span className="font-medium">{deal.emails}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Video className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                                                <span className="font-medium">{deal.meetings}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <CheckSquare className="w-4 h-4 text-amber-600" aria-hidden="true" />
                                                                <span className="font-medium">{deal.tasks}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center text-sm text-slate-600">
                                                            {deal.lastActivityDate}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                className={cn(
                                                                    "border-0",
                                                                    deal.daysInStage <= 7 ? "bg-emerald-100 text-emerald-700" :
                                                                    deal.daysInStage <= 14 ? "bg-blue-100 text-blue-700" :
                                                                    "bg-amber-100 text-amber-700"
                                                                )}
                                                            >
                                                                {deal.daysInStage} {isRTL ? 'يوم' : 'days'}
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

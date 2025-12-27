import { useState, useMemo } from 'react'
import { ROUTES } from '@/constants/routes'
import { useTranslation } from 'react-i18next'
import {
    Download, Filter, Calendar, TrendingUp, Trophy,
    Users, DollarSign, Target, BarChart3, Award,
    CheckCircle, XCircle, FileText, TrendingDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

interface LeadOwnerMetrics {
    salesPersonId: string
    salesPersonName: string
    salesPersonAvatar?: string
    leadCount: number
    caseCount: number
    quoteCount: number
    wonCount: number
    wonValue: number
    lostCount: number
    lostValue: number
    conversionRate: number
    winRate: number
    avgDealSize: number
    targetAmount: number
    targetAchievement: number
    rank: number
}

interface ReportFilters {
    startDate: string
    endDate: string
    salesPersonId?: string
    territory?: string
    leadSource?: string
}

export function LeadOwnerEfficiencyReport() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    // Get first day of year and today for default dates
    const today = new Date()
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1)

    const [startDate, setStartDate] = useState(firstDayOfYear.toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])
    const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>('all')
    const [selectedTerritory, setSelectedTerritory] = useState<string>('all')
    const [selectedLeadSource, setSelectedLeadSource] = useState<string>('all')

    const filters: ReportFilters = useMemo(() => {
        const f: ReportFilters = {
            startDate,
            endDate,
        }
        if (selectedSalesPerson && selectedSalesPerson !== 'all') f.salesPersonId = selectedSalesPerson
        if (selectedTerritory && selectedTerritory !== 'all') f.territory = selectedTerritory
        if (selectedLeadSource && selectedLeadSource !== 'all') f.leadSource = selectedLeadSource
        return f
    }, [startDate, endDate, selectedSalesPerson, selectedTerritory, selectedLeadSource])

    // Mock data - will be replaced by API hook
    const isLoading = false
    const isError = false

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US').format(num)
    }

    const formatPercentage = (num: number) => {
        return `${num.toFixed(1)}%`
    }

    const handleExport = (format: 'csv' | 'pdf') => {
        console.log(`Exporting report as ${format}`, filters)
        // TODO: Implement export functionality
    }

    // Mock data for demonstration
    const mockSummary = {
        totalLeads: 245,
        totalCases: 89,
        totalQuotes: 156,
        totalWon: 67,
        totalWonValue: 3450000,
        totalLost: 45,
        avgConversionRate: 27.3,
        avgWinRate: 42.9,
        avgDealSize: 51500,
        salesPeopleCount: 8
    }

    const mockLeaderboard: LeadOwnerMetrics[] = [
        {
            salesPersonId: '1',
            salesPersonName: 'أحمد محمد الشمري',
            salesPersonAvatar: '',
            leadCount: 45,
            caseCount: 18,
            quoteCount: 28,
            wonCount: 15,
            wonValue: 825000,
            lostCount: 8,
            lostValue: 245000,
            conversionRate: 40.0,
            winRate: 53.6,
            avgDealSize: 55000,
            targetAmount: 800000,
            targetAchievement: 103.1,
            rank: 1
        },
        {
            salesPersonId: '2',
            salesPersonName: 'فاطمة عبدالله النصر',
            salesPersonAvatar: '',
            leadCount: 52,
            caseCount: 19,
            quoteCount: 32,
            wonCount: 14,
            wonValue: 745000,
            lostCount: 10,
            lostValue: 320000,
            conversionRate: 36.5,
            winRate: 43.8,
            avgDealSize: 53200,
            targetAmount: 750000,
            targetAchievement: 99.3,
            rank: 2
        },
        {
            salesPersonId: '3',
            salesPersonName: 'خالد سعد المطيري',
            salesPersonAvatar: '',
            leadCount: 38,
            caseCount: 15,
            quoteCount: 24,
            wonCount: 12,
            wonValue: 598000,
            lostCount: 7,
            lostValue: 185000,
            conversionRate: 39.5,
            winRate: 50.0,
            avgDealSize: 49800,
            targetAmount: 600000,
            targetAchievement: 99.7,
            rank: 3
        },
        {
            salesPersonId: '4',
            salesPersonName: 'نورة إبراهيم القحطاني',
            salesPersonAvatar: '',
            leadCount: 41,
            caseCount: 14,
            quoteCount: 26,
            wonCount: 11,
            wonValue: 542000,
            lostCount: 9,
            lostValue: 268000,
            conversionRate: 34.1,
            winRate: 42.3,
            avgDealSize: 49300,
            targetAmount: 550000,
            targetAchievement: 98.5,
            rank: 4
        },
        {
            salesPersonId: '5',
            salesPersonName: 'عبدالرحمن فهد العتيبي',
            salesPersonAvatar: '',
            leadCount: 35,
            caseCount: 11,
            quoteCount: 22,
            wonCount: 8,
            wonValue: 398000,
            lostCount: 6,
            lostValue: 175000,
            conversionRate: 31.4,
            winRate: 36.4,
            avgDealSize: 49750,
            targetAmount: 450000,
            targetAchievement: 88.4,
            rank: 5
        },
        {
            salesPersonId: '6',
            salesPersonName: 'سارة منصور الدوسري',
            salesPersonAvatar: '',
            leadCount: 28,
            caseCount: 9,
            quoteCount: 18,
            wonCount: 5,
            wonValue: 245000,
            lostCount: 4,
            lostValue: 128000,
            conversionRate: 32.1,
            winRate: 27.8,
            avgDealSize: 49000,
            targetAmount: 350000,
            targetAchievement: 70.0,
            rank: 6
        }
    ]

    const topNav = [
        { title: isRTL ? 'نظرة عامة' : 'Overview', href: '/dashboard/overview', isActive: false },
        { title: isRTL ? 'العملاء المحتملين' : 'Leads', href: ROUTES.dashboard.crm.leads.list, isActive: false },
        { title: isRTL ? 'تقارير CRM' : 'CRM Reports', href: ROUTES.dashboard.crm.reports.list, isActive: true },
    ]

    const getRankBadge = (rank: number) => {
        if (rank === 1) {
            return (
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                    <Trophy className="w-3 h-3 ms-1" />
                    {isRTL ? 'الأول' : '1st'}
                </Badge>
            )
        } else if (rank === 2) {
            return (
                <Badge className="bg-gradient-to-r from-slate-400 to-slate-500 text-white border-0">
                    <Award className="w-3 h-3 ms-1" />
                    {isRTL ? 'الثاني' : '2nd'}
                </Badge>
            )
        } else if (rank === 3) {
            return (
                <Badge className="bg-gradient-to-r from-orange-600 to-orange-700 text-white border-0">
                    <Award className="w-3 h-3 ms-1" />
                    {isRTL ? 'الثالث' : '3rd'}
                </Badge>
            )
        }
        return <Badge variant="outline">{rank}</Badge>
    }

    const getTargetColor = (achievement: number) => {
        if (achievement >= 100) return 'text-emerald-600'
        if (achievement >= 80) return 'text-blue-600'
        if (achievement >= 60) return 'text-amber-600'
        return 'text-red-600'
    }

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
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-300/20 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                        <BarChart3 className="w-3 h-3 ms-2" />
                                        {isRTL ? 'تقرير الأداء' : 'Performance Report'}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    {isRTL ? 'كفاءة مسؤولي المبيعات' : 'Lead Owner Efficiency'}
                                </h1>
                                <p className="text-emerald-100/80">
                                    {isRTL ? 'تحليل أداء فريق المبيعات ومعدلات التحويل' : 'Sales team performance and conversion metrics'}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                                    onClick={() => handleExport('csv')}
                                >
                                    <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                    {isRTL ? 'تصدير CSV' : 'Export CSV'}
                                </Button>
                                <Button
                                    className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl shadow-lg"
                                    onClick={() => handleExport('pdf')}
                                >
                                    <Download className="w-4 h-4 ms-2" aria-hidden="true" />
                                    {isRTL ? 'تصدير PDF' : 'Export PDF'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-slate-600" aria-hidden="true" />
                                <span className="text-sm font-medium text-slate-600">
                                    {isRTL ? 'الفترة:' : 'Period:'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-600" aria-hidden="true" />
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-[150px] rounded-xl border-slate-200"
                                />
                                <span className="text-slate-600">{isRTL ? 'إلى' : 'to'}</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-[150px] rounded-xl border-slate-200"
                                />
                            </div>
                            <Select value={selectedSalesPerson} onValueChange={setSelectedSalesPerson}>
                                <SelectTrigger className="w-[180px] rounded-xl border-slate-200">
                                    <SelectValue placeholder={isRTL ? 'جميع مسؤولي المبيعات' : 'All Sales People'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{isRTL ? 'جميع مسؤولي المبيعات' : 'All Sales People'}</SelectItem>
                                    {mockLeaderboard.map((sp) => (
                                        <SelectItem key={sp.salesPersonId} value={sp.salesPersonId}>
                                            {sp.salesPersonName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                                <SelectTrigger className="w-[140px] rounded-xl border-slate-200">
                                    <SelectValue placeholder={isRTL ? 'جميع المناطق' : 'All Territories'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{isRTL ? 'جميع المناطق' : 'All Territories'}</SelectItem>
                                    <SelectItem value="central">{isRTL ? 'الوسطى' : 'Central'}</SelectItem>
                                    <SelectItem value="eastern">{isRTL ? 'الشرقية' : 'Eastern'}</SelectItem>
                                    <SelectItem value="western">{isRTL ? 'الغربية' : 'Western'}</SelectItem>
                                    <SelectItem value="northern">{isRTL ? 'الشمالية' : 'Northern'}</SelectItem>
                                    <SelectItem value="southern">{isRTL ? 'الجنوبية' : 'Southern'}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedLeadSource} onValueChange={setSelectedLeadSource}>
                                <SelectTrigger className="w-[140px] rounded-xl border-slate-200">
                                    <SelectValue placeholder={isRTL ? 'جميع المصادر' : 'All Sources'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{isRTL ? 'جميع المصادر' : 'All Sources'}</SelectItem>
                                    <SelectItem value="website">{isRTL ? 'الموقع الإلكتروني' : 'Website'}</SelectItem>
                                    <SelectItem value="referral">{isRTL ? 'إحالة' : 'Referral'}</SelectItem>
                                    <SelectItem value="social">{isRTL ? 'وسائل التواصل' : 'Social Media'}</SelectItem>
                                    <SelectItem value="phone">{isRTL ? 'مكالمة هاتفية' : 'Phone'}</SelectItem>
                                    <SelectItem value="event">{isRTL ? 'فعالية' : 'Event'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

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
                                <div className="text-2xl font-bold text-navy">{formatNumber(mockSummary.totalLeads)}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {formatNumber(mockSummary.totalCases)} {isRTL ? 'حالة' : 'cases'} • {formatNumber(mockSummary.totalQuotes)} {isRTL ? 'عرض' : 'quotes'}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'الصفقات الناجحة' : 'Won Deals'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.totalWonValue)}</div>
                                <div className="text-xs text-emerald-600 mt-1">
                                    {formatNumber(mockSummary.totalWon)} {isRTL ? 'صفقة ناجحة' : 'deals won'}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'معدل التحويل' : 'Conversion Rate'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatPercentage(mockSummary.avgConversionRate)}</div>
                                <div className="mt-2">
                                    <Progress
                                        value={mockSummary.avgConversionRate}
                                        className="h-1.5 bg-purple-100"
                                        indicatorClassName="bg-purple-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl bg-white">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {isRTL ? 'متوسط حجم الصفقة' : 'Avg Deal Size'}
                                    </span>
                                </div>
                                <div className="text-2xl font-bold text-navy">{formatCurrency(mockSummary.avgDealSize)}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {formatPercentage(mockSummary.avgWinRate)} {isRTL ? 'معدل الفوز' : 'win rate'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Leaderboard */}
                    <Card className="border-0 shadow-sm rounded-3xl">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-emerald-500" />
                                    {isRTL ? 'تصنيف مسؤولي المبيعات' : 'Sales Leaderboard'}
                                </CardTitle>
                                <Badge variant="outline" className="border-slate-200">
                                    {formatNumber(mockSummary.salesPeopleCount)} {isRTL ? 'مندوب' : 'people'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {isRTL ? 'الترتيب' : 'Rank'}
                                        </TableHead>
                                        <TableHead className={`font-bold text-slate-700 ${isRTL ? 'text-end' : 'text-start'}`}>
                                            {isRTL ? 'مسؤول المبيعات' : 'Sales Person'}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {isRTL ? 'العملاء' : 'Leads'}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {isRTL ? 'الحالات' : 'Cases'}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {isRTL ? 'العروض' : 'Quotes'}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {isRTL ? 'الناجحة' : 'Won'}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {isRTL ? 'القيمة' : 'Value'}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {isRTL ? 'التحويل' : 'Conv %'}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {isRTL ? 'معدل الفوز' : 'Win %'}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {isRTL ? 'متوسط الصفقة' : 'Avg Deal'}
                                        </TableHead>
                                        <TableHead className="text-center font-bold text-slate-700">
                                            {isRTL ? 'تحقيق الهدف' : 'Target'}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockLeaderboard.map((person) => {
                                        const initials = person.salesPersonName
                                            .split(' ')
                                            .map(n => n[0])
                                            .join('')
                                            .slice(0, 2)
                                            .toUpperCase()

                                        return (
                                            <TableRow key={person.salesPersonId} className="hover:bg-slate-50">
                                                <TableCell className="text-center">
                                                    {getRankBadge(person.rank)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={person.salesPersonAvatar} alt={person.salesPersonName} />
                                                            <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                                                                {initials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-navy">{person.salesPersonName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="border-blue-200 bg-blue-50">
                                                        {formatNumber(person.leadCount)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="border-purple-200 bg-purple-50">
                                                        {formatNumber(person.caseCount)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="border-amber-200 bg-amber-50">
                                                        {formatNumber(person.quoteCount)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                                                        <span className="font-medium text-emerald-600">{formatNumber(person.wonCount)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-bold text-navy">
                                                    {formatCurrency(person.wonValue)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-medium text-purple-600">
                                                        {formatPercentage(person.conversionRate)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-medium text-blue-600">
                                                        {formatPercentage(person.winRate)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center font-medium text-slate-700">
                                                    {formatCurrency(person.avgDealSize)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`font-bold ${getTargetColor(person.targetAchievement)}`}>
                                                            {formatPercentage(person.targetAchievement)}
                                                        </span>
                                                        <Progress
                                                            value={Math.min(person.targetAchievement, 100)}
                                                            className="h-1 w-16 bg-slate-200"
                                                            indicatorClassName={
                                                                person.targetAchievement >= 100 ? 'bg-emerald-500' :
                                                                person.targetAchievement >= 80 ? 'bg-blue-500' :
                                                                person.targetAchievement >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Performance Visualization */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Performers */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    {isRTL ? 'أعلى أداء' : 'Top Performers'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {mockLeaderboard.slice(0, 5).map((person, index) => {
                                        const maxValue = mockLeaderboard[0].wonValue
                                        const percentage = (person.wonValue / maxValue) * 100

                                        return (
                                            <div key={person.salesPersonId} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-400 w-4">{index + 1}</span>
                                                        <span className="font-medium text-slate-700 truncate max-w-[150px]">
                                                            {person.salesPersonName}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-navy">{formatCurrency(person.wonValue)}</span>
                                                </div>
                                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Conversion Rates */}
                        <Card className="border-0 shadow-sm rounded-3xl">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <Target className="w-5 h-5 text-purple-500" />
                                    {isRTL ? 'معدلات التحويل' : 'Conversion Rates'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {mockLeaderboard
                                        .sort((a, b) => b.conversionRate - a.conversionRate)
                                        .slice(0, 5)
                                        .map((person, index) => {
                                            const maxConversion = mockLeaderboard
                                                .sort((a, b) => b.conversionRate - a.conversionRate)[0].conversionRate

                                            return (
                                                <div key={person.salesPersonId} className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-400 w-4">{index + 1}</span>
                                                            <span className="font-medium text-slate-700 truncate max-w-[150px]">
                                                                {person.salesPersonName}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-purple-600">
                                                            {formatPercentage(person.conversionRate)}
                                                        </span>
                                                    </div>
                                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${(person.conversionRate / maxConversion) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </Main>
        </>
    )
}

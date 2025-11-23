import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    Search, Download, Plus, MoreHorizontal,
    Clock, Play, Pause, Square, DollarSign,
    User, FileText, Check, Timer, Bell, AlertCircle
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTimerStatus, useStartTimer, usePauseTimer, useResumeTimer, useStopTimer, useTimeEntries, useTimeStats } from '@/hooks/useFinance'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'

export default function TimeEntriesDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentTime, setCurrentTime] = useState(0)
    const [timerDescription, setTimerDescription] = useState('')

    // API Filters
    const filters = useMemo(() => {
        const f: any = {}
        if (activeTab === 'unbilled') {
            f.isBilled = false
        } else if (activeTab === 'billed') {
            f.isBilled = true
        }
        return f
    }, [activeTab])

    // Fetch data
    const { data: entriesData, isLoading, isError, error, refetch } = useTimeEntries(filters)
    const { data: statsData } = useTimeStats()
    const { data: timerData } = useTimerStatus()

    // Timer mutations
    const startTimerMutation = useStartTimer()
    const pauseTimerMutation = usePauseTimer()
    const resumeTimerMutation = useResumeTimer()
    const stopTimerMutation = useStopTimer()

    // Sync timer with backend data
    useEffect(() => {
        if (timerData?.data?.isRunning && timerData.data.elapsedSeconds !== undefined) {
            setCurrentTime(timerData.data.elapsedSeconds)
        } else if (!timerData?.data?.isRunning) {
            setCurrentTime(0)
        }
    }, [timerData])

    // Local timer tick
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timerData?.data?.isRunning) {
            interval = setInterval(() => {
                setCurrentTime(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [timerData?.data?.isRunning])

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Transform API data
    const timeEntries = useMemo(() => {
        if (!entriesData?.data) return []
        return entriesData.data.map((entry: any) => ({
            id: entry._id,
            date: new Date(entry.date).toLocaleDateString('ar-SA'),
            client: entry.clientId?.name || entry.clientId?.firstName + ' ' + entry.clientId?.lastName || 'عميل غير محدد',
            caseNumber: entry.caseId?.caseNumber || 'N/A',
            task: entry.description || 'مهمة غير محددة',
            hours: entry.hours || 0,
            rate: entry.hourlyRate || 0,
            amount: entry.totalAmount || (entry.hours * entry.hourlyRate) || 0,
            status: entry.isBilled ? 'billed' : entry.isBillable ? 'unbilled' : 'non-billable',
            lawyer: entry.userId?.firstName + ' ' + entry.userId?.lastName || 'غير محدد',
            billable: entry.isBillable,
            _id: entry._id,
        }))
    }, [entriesData])

    // Filter entries by search
    const filteredEntries = useMemo(() => {
        if (!searchQuery) return timeEntries
        const query = searchQuery.toLowerCase()
        return timeEntries.filter(entry =>
            entry.client.toLowerCase().includes(query) ||
            entry.task.toLowerCase().includes(query) ||
            entry.caseNumber.toLowerCase().includes(query)
        )
    }, [timeEntries, searchQuery])

    // Stats
    const { totalBillableHours, totalUnbilledValue, thisWeekHours } = useMemo(() => {
        const billable = statsData?.data?.totalBillableHours ||
            timeEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0)

        const unbilled = statsData?.data?.totalUnbilledValue ||
            timeEntries.filter(e => e.status === 'unbilled').reduce((sum, e) => sum + e.amount, 0)

        const weekly = statsData?.data?.weeklyHours || 0

        return {
            totalBillableHours: billable,
            totalUnbilledValue: unbilled,
            thisWeekHours: weekly
        }
    }, [timeEntries, statsData])

    // Timer handlers
    const handleStartTimer = useCallback(() => {
        startTimerMutation.mutate({
            description: timerDescription || 'مهمة جديدة',
            isBillable: true
        })
    }, [timerDescription, startTimerMutation])

    const handlePauseTimer = useCallback(() => {
        pauseTimerMutation.mutate()
    }, [pauseTimerMutation])

    const handleResumeTimer = useCallback(() => {
        resumeTimerMutation.mutate()
    }, [resumeTimerMutation])

    const handleStopTimer = useCallback(() => {
        stopTimerMutation.mutate({
            notes: timerDescription,
            isBillable: true
        })
        setTimerDescription('')
    }, [timerDescription, stopTimerMutation])

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: true },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center space-x-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pr-9 pl-4 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Hero Section - Contained Navy Card */}
                    <div className="bg-[#022c22] rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-[#022c22]/20 mb-8">
                        {/* Background Effects */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[100px]"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                                            <Clock className="w-3 h-3 ml-2" />
                                            إدارة الوقت
                                        </Badge>
                                        <span className="text-blue-200 text-sm">نوفمبر 2025</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                        سجل الساعات
                                    </h1>
                                    <p className="text-blue-200/80">تتبع الوقت، الفوترة، وإدارة إنتاجية الفريق</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">
                                        <Download className="w-4 h-4 ml-2" />
                                        تصدير التقرير
                                    </Button>
                                    <Button asChild className="bg-brand-blue hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-500/20 rounded-xl">
                                        <Link to="/dashboard/finance/time-tracking/new">
                                            <Plus className="w-4 h-4 ml-2" />
                                            تسجيل يدوي
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-blue-200">ساعات هذا الأسبوع</span>
                                        <span className="font-bold text-white">{thisWeekHours} ساعة</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white">{totalBillableHours}</div>
                                    <div className="text-xs text-blue-200">إجمالي الساعات القابلة للفوترة</div>
                                    <Progress value={75} className="h-1.5 bg-white/10 mt-2" indicatorClassName="bg-brand-blue" />
                                </div>
                                <div className="flex justify-between items-center border-r border-white/10 pr-6">
                                    <div>
                                        <div className="text-blue-200 text-sm mb-1">قيمة غير مفوترة</div>
                                        <div className="text-2xl font-bold text-amber-400">{formatCurrency(totalUnbilledValue)}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-amber-400" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-r border-white/10 pr-6">
                                    <div>
                                        <div className="text-blue-200 text-sm mb-1">معدل الإنجاز</div>
                                        <div className="text-2xl font-bold text-emerald-400">94%</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Time Entries List */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Filters Bar */}
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                                    <TabsList className="justify-start bg-slate-50 p-1 rounded-xl border border-slate-200 h-auto">
                                        <TabsTrigger
                                            value="all"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-[#022c22] data-[state=active]:text-white transition-all duration-300"
                                        >
                                            الكل
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="unbilled"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            غير مفوتر
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="billed"
                                            className="rounded-lg px-4 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
                                        >
                                            تم الفوترة
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <div className="flex items-center gap-3 flex-1 justify-end">
                                    <div className="relative w-full max-w-xs">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="بحث في السجلات..."
                                            className="pr-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Entries List - Vertical Stack Cards */}
                            <div className="space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                                                <div className="flex gap-4 mb-4">
                                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-6 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-20 w-full" />
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Error State */}
                                {isError && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-red-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل السجلات</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-[#022c22] hover:bg-[#022c22]/90">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && filteredEntries.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                                                <Clock className="w-8 h-8 text-brand-blue" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد سجلات وقت</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بتتبع وقتك باستخدام المؤقت أو سجل الوقت يدوياً</p>
                                        <Button asChild className="bg-brand-blue hover:bg-blue-600">
                                            <Link to="/dashboard/finance/time-tracking/new">
                                                <Plus className="w-4 h-4 ml-2" />
                                                تسجيل يدوي
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Entries List */}
                                {!isLoading && !isError && filteredEntries.map((entry) => (
                                    <div key={entry.id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 transition-all group shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-start">
                                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shadow-sm mt-1">
                                                    <Clock className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-[#022c22] text-lg">{entry.task}</h4>
                                                        <Badge variant="outline" className={`${entry.status === 'unbilled' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                                                            entry.status === 'billed' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                                                                'text-slate-600 border-slate-200 bg-slate-50'
                                                            } border px-2 rounded-md`}>
                                                            {entry.status === 'unbilled' ? 'غير مفوتر' :
                                                                entry.status === 'billed' ? 'تم الفوترة' : 'غير قابل للفوترة'}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                        <User className="w-3 h-3" />
                                                        {entry.client}
                                                        <span className="text-slate-300">•</span>
                                                        <FileText className="w-3 h-3" />
                                                        {entry.caseNumber}
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#022c22]">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link to="/dashboard/finance/time-tracking/$entryId" params={{ entryId: entry.id }}>
                                                            عرض التفاصيل
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>تعديل السجل</DropdownMenuItem>
                                                    <DropdownMenuItem>إنشاء فاتورة</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                                                        {entry.lawyer.charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-slate-600">{entry.lawyer}</span>
                                                </div>
                                                <div className="h-4 w-px bg-slate-200"></div>
                                                <div className="text-sm text-slate-500">
                                                    {entry.date}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">المدة</div>
                                                    <div className="font-bold text-[#022c22] text-lg">{entry.hours} س</div>
                                                </div>
                                                {entry.amount > 0 && (
                                                    <div className="text-center pl-4 border-l border-slate-100">
                                                        <div className="text-xs text-slate-400 mb-1">القيمة</div>
                                                        <div className="font-bold text-emerald-600 text-lg">{formatCurrency(entry.amount)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar - Timer & Analytics */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Quick Timer Card */}
                            <Card className="border-none shadow-sm bg-[#022c22] text-white rounded-3xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <CardHeader className="pb-2 relative z-10">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Timer className="w-5 h-5 text-brand-blue" />
                                        المؤقت السريع
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 relative z-10">
                                    <div className="text-center mb-6">
                                        <div className="text-5xl font-mono font-bold tracking-wider mb-2">
                                            {formatTime(currentTime)}
                                        </div>
                                        <div className="text-blue-200 text-sm">جاري التسجيل...</div>
                                    </div>

                                    <div className="flex gap-3 mb-6">
                                        {!timerData?.data?.isRunning ? (
                                            <Button
                                                onClick={handleStartTimer}
                                                disabled={startTimerMutation.isPending}
                                                className="flex-1 bg-brand-blue hover:bg-blue-600 text-white h-12 rounded-xl text-lg"
                                            >
                                                <Play className="w-5 h-5 ml-2" />
                                                بدء
                                            </Button>
                                        ) : timerData?.data?.isPaused ? (
                                            <Button
                                                onClick={handleResumeTimer}
                                                disabled={resumeTimerMutation.isPending}
                                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl text-lg"
                                            >
                                                <Play className="w-5 h-5 ml-2" />
                                                استئناف
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handlePauseTimer}
                                                disabled={pauseTimerMutation.isPending}
                                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white h-12 rounded-xl text-lg"
                                            >
                                                <Pause className="w-5 h-5 ml-2" />
                                                إيقاف مؤقت
                                            </Button>
                                        )}
                                        <Button
                                            onClick={handleStopTimer}
                                            disabled={stopTimerMutation.isPending || !timerData?.data?.isRunning}
                                            variant="outline"
                                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-12 w-12 rounded-xl p-0"
                                        >
                                            <Square className="w-5 h-5 fill-current" />
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <Input
                                            placeholder="بماذا تعمل الآن؟"
                                            value={timerDescription}
                                            onChange={(e) => setTimerDescription(e.target.value)}
                                            className="bg-white/10 border-white/10 text-white placeholder:text-blue-200/50 rounded-xl"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Hours by Lawyer */}
                            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                                <CardHeader className="border-b border-slate-100 pb-4">
                                    <CardTitle className="text-lg font-bold text-[#022c22] flex items-center gap-2">
                                        <User className="w-5 h-5 text-purple-500" />
                                        ساعات الفريق
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {[
                                        { name: 'أحمد السالم', hours: 42.5, color: 'bg-blue-500' },
                                        { name: 'فاطمة الغامدي', hours: 38.0, color: 'bg-emerald-500' },
                                        { name: 'خالد المري', hours: 31.5, color: 'bg-amber-500' }
                                    ].map((lawyer, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-slate-700">{lawyer.name}</span>
                                                <span className="text-slate-500">{lawyer.hours} ساعة</span>
                                            </div>
                                            <Progress value={(lawyer.hours / 50) * 100} className="h-2 bg-slate-100" indicatorClassName={lawyer.color} />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}

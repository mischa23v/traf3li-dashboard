import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
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
import { formatCurrency, formatDate } from '@/lib/utils'
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
import { ProductivityHero } from '@/components/productivity-hero'
import { FinanceSidebar } from './finance-sidebar'

export default function TimeEntriesDashboard() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    // Debounced search handler
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => setSearchQuery(value),
        300
    )

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
        if (timerData?.isRunning && timerData.timer?.elapsedMinutes !== undefined) {
            setCurrentTime(timerData.timer.elapsedMinutes * 60)
        } else if (!timerData?.isRunning) {
            setCurrentTime(0)
        }
    }, [timerData])

    // Local timer tick
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timerData?.isRunning) {
            interval = setInterval(() => {
                setCurrentTime(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [timerData?.isRunning])

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
            date: formatDate(entry.date),
            client: entry.clientId?.name || entry.clientId?.firstName + ' ' + entry.clientId?.lastName || 'عميل غير محدد',
            caseNumber: entry.caseId?.caseNumber || 'غير محدد',
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
            caseId: '',
            clientId: '',
            description: timerDescription || 'مهمة جديدة'
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

                <div className='ms-auto flex items-center gap-4'>
                    <div className="relative hidden md:block">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                        <input type="text" placeholder="بحث..." className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label="الإشعارات">
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="تتبع الوقت" title="تتبع الوقت" type="time-tracking" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">
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
                                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" aria-hidden="true" />
                                        <Input
                                            placeholder="بحث في السجلات..."
                                            className="pe-10 rounded-xl border-slate-200 focus:ring-[#022c22] focus:border-[#022c22]"
                                            defaultValue={searchQuery}
                                            onChange={(e) => debouncedSetSearch(e.target.value)}
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
                                                <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
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
                                                <Clock className="w-8 h-8 text-brand-blue" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد سجلات وقت</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بتتبع وقتك باستخدام المؤقت أو سجل الوقت يدوياً</p>
                                        <Button asChild className="bg-brand-blue hover:bg-blue-600">
                                            <Link to={ROUTES.dashboard.finance.timeTracking.new}>
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
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
                                                    <Clock className="h-6 w-6" aria-hidden="true" />
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
                                                        <User className="w-3 h-3" aria-hidden="true" />
                                                        {entry.client}
                                                        <span className="text-slate-300">•</span>
                                                        <FileText className="w-3 h-3" aria-hidden="true" />
                                                        {entry.caseNumber}
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-600 hover:text-[#022c22]" aria-label="تعديل">
                                                        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link to={ROUTES.dashboard.finance.timeTracking.detail(entry.id )}>
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
                                                    <div className="text-xs text-slate-600 mb-1">المدة</div>
                                                    <div className="font-bold text-[#022c22] text-lg">{entry.hours} س</div>
                                                </div>
                                                {entry.amount > 0 && (
                                                    <div className="text-center ps-4 border-s border-slate-100">
                                                        <div className="text-xs text-slate-600 mb-1">القيمة</div>
                                                        <div className="font-bold text-emerald-600 text-lg">{formatCurrency(entry.amount)}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <FinanceSidebar context="time-tracking" />
                </div>
            </Main>
        </>
    )
}

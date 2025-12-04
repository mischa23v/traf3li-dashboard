import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    Search, Plus, MoreHorizontal,
    Clock, Play, Pause, Square, DollarSign,
    User, FileText, Check, Timer, Bell, AlertCircle,
    ChevronLeft, ChevronRight, X, Eye, Edit3, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Link, useNavigate } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { useTimerStatus, useStartTimer, usePauseTimer, useResumeTimer, useStopTimer, useTimeEntries, useTimeStats, useDeleteTimeEntry } from '@/hooks/useFinance'
import { ProductivityHero } from '@/components/productivity-hero'
import { format } from 'date-fns'
import { arSA } from 'date-fns/locale'

export default function TimeEntriesDashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('all')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [currentTime, setCurrentTime] = useState(0)
    const [timerDescription, setTimerDescription] = useState('')

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    // API Filters
    const filters = useMemo(() => {
        const f: any = { page: currentPage, limit: itemsPerPage }
        if (activeTab === 'unbilled') {
            f.isBilled = false
        } else if (activeTab === 'billed') {
            f.isBilled = true
        }
        return f
    }, [activeTab, currentPage, itemsPerPage])

    // Check if any filter is active
    const hasActiveFilters = searchQuery.length > 0

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setCurrentPage(1)
    }

    // Fetch data
    const { data: entriesData, isLoading, isError, error, refetch } = useTimeEntries(filters)
    const { data: statsData } = useTimeStats()
    const { data: timerData } = useTimerStatus()

    // Mutations
    const deleteTimeEntryMutation = useDeleteTimeEntry()
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

    // Helper function to format dates in both languages
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: 'غير محدد', english: 'Not set' }
        const date = new Date(dateString)
        return {
            arabic: format(date, 'd MMMM', { locale: arSA }),
            english: format(date, 'MMM d, yyyy')
        }
    }

    // Transform API data
    const timeEntries = useMemo(() => {
        if (!entriesData?.data) return []
        return entriesData.data.map((entry: any) => ({
            id: entry._id,
            date: entry.date,
            dateFormatted: formatDualDate(entry.date),
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

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds([])
    }

    const handleSelectItem = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return
        if (confirm(`هل أنت متأكد من حذف ${selectedIds.length} سجل؟`)) {
            selectedIds.forEach(id => deleteTimeEntryMutation.mutate(id))
            setIsSelectionMode(false)
            setSelectedIds([])
        }
    }

    // Single entry actions
    const handleViewEntry = (id: string) => {
        navigate({ to: '/dashboard/finance/time-tracking/$entryId', params: { entryId: id } })
    }

    const handleEditEntry = (id: string) => {
        navigate({ to: '/dashboard/finance/time-tracking/$entryId/edit', params: { entryId: id } })
    }

    const handleDeleteEntry = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
            deleteTimeEntryMutation.mutate(id)
        }
    }

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
        { title: 'المدفوعات', href: '/dashboard/finance/payments', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
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

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="إدارة المالية" title="تتبع الوقت" type="time-tracking" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Search and primary filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="text"
                                            placeholder="بحث في السجلات..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pr-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={activeTab} onValueChange={setActiveTab}>
                                        <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">الكل</SelectItem>
                                            <SelectItem value="unbilled">غير مفوتر</SelectItem>
                                            <SelectItem value="billed">تم الفوترة</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Clear Filters Button */}
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                        >
                                            <X className="h-4 w-4 ml-2" />
                                            مسح الفلاتر
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MAIN TIME ENTRIES LIST */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">
                                    {activeTab === 'all' ? 'جميع السجلات' :
                                        activeTab === 'unbilled' ? 'غير مفوترة' :
                                            activeTab === 'billed' ? 'تم الفوترة' : 'السجلات'}
                                </h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {filteredEntries.length} سجل
                                </Badge>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Loading State */}
                                {isLoading && (
                                    <>
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-[#F8F9FA] rounded-2xl p-6 border border-slate-100">
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
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !isError && filteredEntries.length === 0 && (
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Clock className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد سجلات وقت</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بتتبع وقتك باستخدام المؤقت أو سجل الوقت يدوياً</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/finance/time-tracking/new">
                                                <Plus className="w-4 h-4 ml-2" />
                                                تسجيل يدوي
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Time Entries List */}
                                {!isLoading && !isError && filteredEntries.map((entry) => {
                                    return (
                                        <div key={entry.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedIds.includes(entry.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4 items-center">
                                                    {isSelectionMode && (
                                                        <Checkbox
                                                            checked={selectedIds.includes(entry.id)}
                                                            onCheckedChange={() => handleSelectItem(entry.id)}
                                                            className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                        />
                                                    )}
                                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shadow-sm">
                                                        <Clock className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-navy text-lg">{entry.task}</h4>
                                                            <Badge className={`${entry.status === 'unbilled' ? 'bg-amber-100 text-amber-700' :
                                                                entry.status === 'billed' ? 'bg-emerald-100 text-emerald-700' :
                                                                    'bg-slate-100 text-slate-700'
                                                                } border-0 rounded-md px-2`}>
                                                                {entry.status === 'unbilled' ? 'غير مفوتر' :
                                                                    entry.status === 'billed' ? 'تم الفوترة' : 'غير قابل للفوترة'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                            <User className="w-3 h-3" />
                                                            {entry.client}
                                                            <span className="text-slate-300">|</span>
                                                            <FileText className="w-3 h-3" />
                                                            {entry.caseNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleEditEntry(entry.id)}>
                                                            <Edit3 className="h-4 w-4 ml-2 text-blue-500" />
                                                            تعديل السجل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleViewEntry(entry.id)}>
                                                            <Eye className="h-4 w-4 ml-2" />
                                                            عرض التفاصيل
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteEntry(entry.id)}
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 ml-2" />
                                                            حذف السجل
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                <div className="flex items-center gap-4">
                                                    {/* Hours */}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">المدة</div>
                                                        <div className="font-bold text-navy text-lg">{entry.hours} س</div>
                                                    </div>
                                                    {/* Amount */}
                                                    {entry.amount > 0 && (
                                                        <div className="text-center">
                                                            <div className="text-xs text-slate-400 mb-1">القيمة</div>
                                                            <div className="font-bold text-emerald-600 text-lg">{formatCurrency(entry.amount)}</div>
                                                        </div>
                                                    )}
                                                    {/* Date - Dual Language */}
                                                    <div className="text-center">
                                                        <div className="text-xs text-slate-400 mb-1">التاريخ</div>
                                                        <div className="font-bold text-navy text-sm">{entry.dateFormatted.arabic}</div>
                                                        <div className="text-xs text-slate-400">{entry.dateFormatted.english}</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleViewEntry(entry.id)}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20"
                                                >
                                                    عرض التفاصيل
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Pagination */}
                            {filteredEntries.length > 0 && (
                                <div className="p-4 pt-0 flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        عرض {filteredEntries.length} من {entriesData?.pagination?.total || filteredEntries.length} سجل
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="rounded-lg h-9 w-9"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                        <span className="text-sm text-slate-600 px-2">{currentPage}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            disabled={currentPage >= Math.ceil((entriesData?.pagination?.total || filteredEntries.length) / itemsPerPage)}
                                            className="rounded-lg h-9 w-9"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LEFT COLUMN (Sidebar with Timer & Analytics) */}
                    <div className="space-y-6">
                        {/* Quick Timer Card */}
                        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <CardHeader className="pb-2 relative z-10">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Timer className="w-5 h-5 text-emerald-400" />
                                    المؤقت السريع
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 relative z-10">
                                <div className="text-center mb-6">
                                    <div className="text-5xl font-mono font-bold tracking-wider mb-2">
                                        {formatTime(currentTime)}
                                    </div>
                                    <div className="text-emerald-200 text-sm">
                                        {timerData?.isRunning ? 'جاري التسجيل...' : 'اضغط بدء للتسجيل'}
                                    </div>
                                </div>

                                <div className="flex gap-3 mb-6">
                                    {!timerData?.isRunning ? (
                                        <Button
                                            onClick={handleStartTimer}
                                            disabled={startTimerMutation.isPending}
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-12 rounded-xl text-lg"
                                        >
                                            <Play className="w-5 h-5 ml-2" />
                                            بدء
                                        </Button>
                                    ) : timerData?.timer?.isPaused ? (
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
                                        disabled={stopTimerMutation.isPending || !timerData?.isRunning}
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
                                        className="bg-white/10 border-white/10 text-white placeholder:text-emerald-200/50 rounded-xl"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions Card */}
                        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold text-white">الإجراءات السريعة</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        asChild
                                        variant="ghost"
                                        className="h-auto py-4 flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border-0"
                                    >
                                        <Link to="/dashboard/finance/time-tracking/new">
                                            <Plus className="w-5 h-5" />
                                            <span className="text-xs">تسجيل يدوي</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        onClick={handleToggleSelectionMode}
                                        variant="ghost"
                                        className="h-auto py-4 flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border-0"
                                    >
                                        <Check className="w-5 h-5" />
                                        <span className="text-xs">{isSelectionMode ? 'إلغاء التحديد' : 'تحديد متعدد'}</span>
                                    </Button>
                                    {isSelectionMode && selectedIds.length > 0 && (
                                        <Button
                                            onClick={handleDeleteSelected}
                                            variant="ghost"
                                            className="h-auto py-4 flex flex-col items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border-0 col-span-2"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            <span className="text-xs">حذف المحدد ({selectedIds.length})</span>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats Card */}
                        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-bold text-navy flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-emerald-500" />
                                    ملخص الوقت
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">ساعات قابلة للفوترة</span>
                                        <span className="font-bold text-navy">{totalBillableHours} ساعة</span>
                                    </div>
                                    <Progress value={75} className="h-2 bg-slate-100" indicatorClassName="bg-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">قيمة غير مفوترة</span>
                                        <span className="font-bold text-amber-600">{formatCurrency(totalUnbilledValue)}</span>
                                    </div>
                                    <Progress value={60} className="h-2 bg-slate-100" indicatorClassName="bg-amber-500" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">ساعات هذا الأسبوع</span>
                                        <span className="font-bold text-blue-600">{thisWeekHours} ساعة</span>
                                    </div>
                                    <Progress value={40} className="h-2 bg-slate-100" indicatorClassName="bg-blue-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Main>
        </>
    )
}

import { useState, useMemo } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Filter,
    Clock,
    MapPin,
    Users,
    FileText,
    Briefcase,
    AlertTriangle,
    Gavel,
    Calendar as CalendarIcon,
    MoreHorizontal,
    Search,
    Bell,
    Loader2,
    AlertCircle,
} from 'lucide-react'
import { useCalendar } from '@/hooks/useCalendar'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Main } from '@/components/layout/main'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ConfigDrawer } from '@/components/config-drawer'
import { DynamicIsland } from '@/components/dynamic-island'

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
    const [view, setView] = useState<'month' | 'week' | 'day'>('month')

    const topNav = [
        {
            title: 'الرئيسية',
            href: '/',
            isActive: false,
            disabled: false,
        },
        {
            title: 'التقويم',
            href: '/dashboard/calendar',
            isActive: true,
            disabled: false,
        },
        {
            title: 'المهام',
            href: '/dashboard/tasks',
            isActive: false,
            disabled: false,
        },
    ]

    // Calculate date range based on current view
    const dateRange = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        // Get first and last day of month (with buffer for calendar grid)
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)

        // Add buffer days to cover calendar grid
        const startDate = new Date(firstDay)
        startDate.setDate(startDate.getDate() - firstDay.getDay())

        const endDate = new Date(lastDay)
        endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        }
    }, [currentDate])

    // Fetch calendar data from API
    const { data: calendarData, isLoading, isError, error, refetch } = useCalendar(dateRange)

    // Transform API data to component format
    const calendarItems = useMemo(() => {
        if (!calendarData?.data) return []

        const items: any[] = []

        // Map events
        calendarData.data.events?.forEach((event: any) => {
            if (!event.startDate) return
            items.push({
                id: event.id,
                type: event.eventType === 'hearing' ? 'court' : event.eventType || 'meeting',
                title: event.title,
                caseName: event.caseName,
                caseNumber: event.caseNumber,
                date: new Date(event.startDate),
                time: new Date(event.startDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
                location: event.location,
                priority: event.priority || 'normal',
                color: event.color || 'blue',
            })
        })

        // Map tasks
        calendarData.data.tasks?.forEach((task: any) => {
            if (!task.startDate) return
            items.push({
                id: task.id,
                type: 'deadline',
                title: task.title,
                caseName: task.caseName,
                caseNumber: task.caseNumber,
                date: new Date(task.startDate),
                time: new Date(task.startDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
                priority: task.priority || 'normal',
                color: 'orange',
            })
        })

        // Map reminders
        calendarData.data.reminders?.forEach((reminder: any) => {
            if (!reminder.startDate) return
            items.push({
                id: reminder.id,
                type: 'deadline',
                title: reminder.title,
                date: new Date(reminder.startDate),
                time: reminder.reminderTime || new Date(reminder.startDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
                priority: reminder.priority || 'normal',
                color: 'purple',
            })
        })

        return items
    }, [calendarData])

    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ]
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

    // --- Helpers ---
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days: Array<{ day: number | null; date: Date | null }> = []
        // Previous month filler
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({ day: null, date: null })
        }
        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, date: new Date(year, month, i) })
        }
        // Next month filler
        const remaining = 42 - days.length
        for (let i = 0; i < remaining; i++) {
            days.push({ day: null, date: null })
        }
        return days
    }

    const getWeekDays = (date: Date) => {
        const startOfWeek = new Date(date)
        const day = startOfWeek.getDay()
        const diff = startOfWeek.getDate() - day
        startOfWeek.setDate(diff)

        const days: Date[] = []
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek)
            d.setDate(startOfWeek.getDate() + i)
            days.push(d)
        }
        return days
    }

    const getItemsForDate = (date: Date | null) => {
        if (!date) return []
        return calendarItems.filter(item =>
            item.date.toDateString() === date.toDateString()
        )
    }

    const isSameDay = (d1: Date | null, d2: Date | null) => {
        if (!d1 || !d2) return false
        return d1.toDateString() === d2.toDateString()
    }

    const days = getDaysInMonth(currentDate)
    const weekDays = getWeekDays(currentDate)
    const selectedDateItems = getItemsForDate(selectedDate)

    // --- Loading State ---
    if (isLoading) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center space-x-4'>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                </Header>

                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
                    <Skeleton className="h-48 w-full rounded-3xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-3">
                            <Skeleton className="h-[700px] w-full rounded-3xl" />
                        </div>
                        <div className="lg:col-span-9 space-y-6">
                            <Skeleton className="h-20 w-full rounded-3xl" />
                            <Skeleton className="h-[750px] w-full rounded-3xl" />
                        </div>
                    </div>
                </Main>
            </>
        )
    }

    // --- Error State ---
    if (isError) {
        return (
            <>
                <Header className="bg-navy shadow-none relative">
                    <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                        <DynamicIsland />
                    </div>
                    <div className='ms-auto flex items-center space-x-4'>
                        <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
                        <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
                    </div>
                </Header>

                <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل التقويم</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                            <Loader2 className="ml-2 h-4 w-4" />
                            إعادة المحاولة
                        </Button>
                    </div>
                </Main>
            </>
        )
    }

    return (
        <>
            {/* ===== Top Heading ===== */}
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden">

                {/* HERO BANNER */}
                <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-0 px-3 py-1">
                                    <Briefcase className="w-3 h-3 ml-2" />
                                    مكتب المحاماة
                                </Badge>
                                <span className="text-slate-400 text-sm">نوفمبر 2025</span>
                            </div>
                            <h1 className="text-4xl font-bold leading-tight mb-2">جدول القضايا والجلسات</h1>
                            <p className="text-slate-300 text-lg max-w-xl">
                                لديك{' '}
                                <span className="text-white font-bold border-b-2 border-brand-blue">
                                    {calendarData?.data.summary.eventCount || 0} {calendarData?.data.summary.eventCount === 1 ? 'حدث' : 'أحداث'}
                                </span>
                                {' '}و{' '}
                                <span className="text-white font-bold border-b-2 border-orange-500">
                                    {calendarData?.data.summary.taskCount || 0} {calendarData?.data.summary.taskCount === 1 ? 'مهمة' : 'مهام'}
                                </span>
                                {' '}و{' '}
                                <span className="text-white font-bold border-b-2 border-purple-500">
                                    {calendarData?.data.summary.reminderCount || 0} {calendarData?.data.summary.reminderCount === 1 ? 'تذكير' : 'تذكيرات'}
                                </span>
                                {' '}هذا الشهر.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button className="bg-brand-blue hover:bg-blue-600 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300 border-0 text-base">
                                <Plus className="ml-2 h-5 w-5" />
                                جلسة جديدة
                            </Button>
                            <Button className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-12 px-6 font-bold backdrop-blur-md border border-white/10 transition-all duration-300">
                                <Filter className="ml-2 h-5 w-5" />
                                تصفية
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* --- Left Sidebar (Daily Agenda) --- */}
                    <div className="lg:col-span-3 flex flex-col h-full">
                        <Card className="rounded-3xl border-0 shadow-lg bg-white h-full flex flex-col overflow-hidden">
                            <div className="bg-navy p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue blur-[40px] opacity-30"></div>
                                <h3 className="text-lg font-bold relative z-10 mb-1">جدول اليوم</h3>
                                <p className="text-blue-200 text-sm relative z-10">
                                    {selectedDate ? selectedDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'اختر يوماً'}
                                </p>
                            </div>

                            <CardContent className="p-0 flex-1 bg-slate-50/50">
                                <ScrollArea className="h-[600px] p-4">
                                    {selectedDateItems.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedDateItems.map((item, i) => (
                                                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <Badge variant="outline" className={`
                                                                    text-[10px] px-2 py-0.5 border-0
                                                                    ${item.type === 'court' ? 'bg-red-50 text-red-600' :
                                                                item.type === 'deadline' ? 'bg-orange-50 text-orange-600' :
                                                                    item.type === 'meeting' ? 'bg-blue-50 text-blue-600' :
                                                                        'bg-purple-50 text-purple-600'}
                                                                `}>
                                                            {item.type === 'court' ? 'جلسة محكمة' :
                                                                item.type === 'deadline' ? 'موعد نهائي' :
                                                                    item.type === 'meeting' ? 'اجتماع' : 'إيداع'}
                                                        </Badge>
                                                        <span className="text-xs font-bold text-slate-400">{item.time}</span>
                                                    </div>

                                                    <h4 className="text-sm font-bold text-navy mb-1 leading-snug group-hover:text-brand-blue transition-colors">
                                                        {item.title}
                                                    </h4>

                                                    {item.caseName && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                                            <Briefcase className="h-3 w-3" />
                                                            <span className="truncate">{item.caseName}</span>
                                                        </div>
                                                    )}

                                                    {(item.location || item.judge) && (
                                                        <div className="pt-2 mt-2 border-t border-slate-50 flex flex-col gap-1">
                                                            {item.location && (
                                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                                                    <MapPin className="h-3 w-3" />
                                                                    <span>{typeof item.location === 'string' ? item.location : (item.location?.name || item.location?.address || 'عن بعد')}</span>
                                                                </div>
                                                            )}
                                                            {item.judge && (
                                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                                                    <Gavel className="h-3 w-3" />
                                                                    <span>{item.judge}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                <Clock className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="font-bold text-navy">لا توجد مواعيد</p>
                                            <p className="text-xs mt-1">لا توجد جلسات أو مهام مسجلة لهذا اليوم.</p>
                                            <Button variant="link" className="text-brand-blue mt-2">
                                                <Plus className="h-4 w-4 ml-1" />
                                                إضافة موعد
                                            </Button>
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- Main Calendar Area --- */}
                    <div className="lg:col-span-9 flex flex-col h-full gap-6">

                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 pr-4 rounded-[20px] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-navy flex items-center gap-2">
                                    {monthNames[currentDate.getMonth()]} <span className="text-slate-400 font-medium text-xl">{currentDate.getFullYear()}</span>
                                </h2>
                                <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-sm text-slate-600" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" className="h-9 px-4 rounded-lg hover:bg-white hover:shadow-sm text-slate-600 font-bold text-sm" onClick={() => setCurrentDate(new Date())}>
                                        اليوم
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-sm text-slate-600" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex bg-slate-50 rounded-xl p-1 w-full sm:w-auto border border-slate-100">
                                {['month', 'week', 'day'].map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v as any)}
                                        className={`
                                      flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all
                                      ${view === v ? 'bg-white text-brand-blue shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-navy hover:bg-slate-100'}
                                   `}
                                    >
                                        {v === 'month' ? 'شهر' : v === 'week' ? 'أسبوع' : 'يوم'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grid Container */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex-1 overflow-hidden flex flex-col min-h-[750px]">

                            {view === 'month' ? (
                                <>
                                    {/* Month View - Days Header */}
                                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                                        {dayNames.map(day => (
                                            <div key={day} className="py-4 text-center text-sm font-bold text-slate-500">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Month View - Grid */}
                                    <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-slate-50 gap-px border-b border-slate-100">
                                        {days.map((d, i) => {
                                            const items = getItemsForDate(d.date)
                                            const isSelected = isSameDay(d.date, selectedDate)
                                            const isTodayDate = d.date && isSameDay(d.date, new Date())

                                            return (
                                                <div
                                                    key={i}
                                                    className={`
                                                 bg-white p-2 min-h-[140px] transition-all relative group flex flex-col gap-1.5
                                                 ${!d.date ? 'bg-slate-50/30' : 'hover:bg-slate-50 cursor-pointer'}
                                                 ${isSelected ? 'bg-blue-50/30' : ''}
                                              `}
                                                    onClick={() => d.date && setSelectedDate(d.date)}
                                                >
                                                    {d.date && (
                                                        <>
                                                            <div className="flex justify-between items-start px-1 pt-1">
                                                                <span className={`
                                                          text-sm font-bold h-7 w-7 flex items-center justify-center rounded-full transition-all
                                                          ${isTodayDate ? 'bg-brand-blue text-white shadow-lg shadow-blue-500/30 scale-110' : 'text-slate-700 group-hover:bg-slate-200'}
                                                       `}>
                                                                    {d.day}
                                                                </span>
                                                            </div>

                                                            <div className="space-y-1 flex-1 px-1">
                                                                {items.slice(0, 4).map((item, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={`
                                                                text-[10px] px-2 py-1.5 rounded-lg font-bold truncate border-r-[3px] shadow-sm transition-all hover:scale-[1.02] hover:shadow-md flex items-center gap-1.5
                                                                ${item.type === 'court' ? 'bg-red-50 text-red-700 border-red-500' :
                                                                                item.type === 'deadline' ? 'bg-orange-50 text-orange-700 border-orange-500' :
                                                                                    item.type === 'meeting' ? 'bg-blue-50 text-blue-700 border-blue-500' :
                                                                                        'bg-purple-50 text-purple-700 border-purple-500'}
                                                             `}
                                                                    >
                                                                        {item.type === 'court' && <Gavel className="h-3 w-3 flex-shrink-0" />}
                                                                        {item.type === 'deadline' && <AlertTriangle className="h-3 w-3 flex-shrink-0" />}
                                                                        {item.type === 'meeting' && <Users className="h-3 w-3 flex-shrink-0" />}
                                                                        {item.type === 'filing' && <FileText className="h-3 w-3 flex-shrink-0" />}
                                                                        <span className="truncate">{item.title}</span>
                                                                    </div>
                                                                ))}
                                                                {items.length > 4 && (
                                                                    <div className="text-[10px] text-center text-slate-400 font-bold mt-auto pt-1 hover:text-brand-blue">
                                                                        +{items.length - 4} المزيد
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            ) : (
                                /* Week/Day View Implementation */
                                <div className="flex flex-col h-full">
                                    {/* Week Header */}
                                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 divide-x divide-x-reverse divide-slate-100">
                                        {weekDays.map((date, i) => {
                                            const isToday = isSameDay(date, new Date())
                                            const isSelected = isSameDay(date, selectedDate)
                                            return (
                                                <div
                                                    key={i}
                                                    className={`py-4 text-center cursor-pointer hover:bg-slate-100 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                                                    onClick={() => setSelectedDate(date)}
                                                >
                                                    <div className="text-xs font-medium text-slate-500 mb-1">{dayNames[date.getDay()]}</div>
                                                    <div className={`
                                                                text-lg font-bold w-8 h-8 mx-auto flex items-center justify-center rounded-full
                                                                ${isToday ? 'bg-brand-blue text-white shadow-md' : 'text-navy'}
                                                            `}>
                                                        {date.getDate()}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Week Columns */}
                                    <div className="grid grid-cols-7 flex-1 divide-x divide-x-reverse divide-slate-100 bg-white overflow-y-auto">
                                        {weekDays.map((date, i) => {
                                            const items = getItemsForDate(date)
                                            const isSelected = isSameDay(date, selectedDate)

                                            return (
                                                <div
                                                    key={i}
                                                    className={`min-h-[500px] p-2 space-y-2 ${isSelected ? 'bg-blue-50/10' : ''}`}
                                                    onClick={() => setSelectedDate(date)}
                                                >
                                                    {items.map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`
                                                                        p-3 rounded-xl border shadow-sm transition-all hover:shadow-md cursor-pointer group
                                                                        ${item.type === 'court' ? 'bg-red-50 border-red-100' :
                                                                    item.type === 'deadline' ? 'bg-orange-50 border-orange-100' :
                                                                        item.type === 'meeting' ? 'bg-blue-50 border-blue-100' :
                                                                            'bg-purple-50 border-purple-100'}
                                                                    `}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge className={`
                                                                            h-5 px-1.5 text-[10px] border-0
                                                                            ${item.type === 'court' ? 'bg-red-200 text-red-800' :
                                                                        item.type === 'deadline' ? 'bg-orange-200 text-orange-800' :
                                                                            item.type === 'meeting' ? 'bg-blue-200 text-blue-800' :
                                                                                'bg-purple-200 text-purple-800'}
                                                                        `}>
                                                                    {item.time}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="text-xs font-bold text-navy leading-snug mb-1 group-hover:text-brand-blue">
                                                                {item.title}
                                                            </h4>
                                                            {item.caseName && (
                                                                <p className="text-[10px] text-slate-500 truncate">
                                                                    {item.caseName}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {items.length === 0 && (
                                                        <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full border border-dashed border-slate-300 text-slate-400">
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </Main>
        </>
    )
}

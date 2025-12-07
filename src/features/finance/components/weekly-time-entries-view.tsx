import { useState, useMemo } from 'react'
import {
    ChevronLeft, ChevronRight, Plus, Clock,
    Calendar, Download, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { Link } from '@tanstack/react-router'
import { useTimeEntries } from '@/hooks/useFinance'

// Helper to get week dates
function getWeekDates(date: Date) {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
    const monday = new Date(date.setDate(diff))

    const days = []
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        days.push(d)
    }
    return days
}

// Format date for display
function formatDate(date: Date, format: 'day' | 'full' | 'short' = 'day') {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

    if (format === 'day') {
        return days[date.getDay()]
    }
    if (format === 'short') {
        return date.getDate().toString()
    }
    return date.toLocaleDateString('ar-SA')
}

// Format minutes to HH:MM
function formatMinutesToTime(minutes: number) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function WeeklyTimeEntriesView() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const weekDates = useMemo(() => getWeekDates(new Date(currentDate)), [currentDate])

    const weekStart = weekDates[0].toISOString().split('T')[0]
    const weekEnd = weekDates[6].toISOString().split('T')[0]

    // Fetch entries for the week
    const { data: entriesData, isLoading, isError, error, refetch } = useTimeEntries({
        startDate: weekStart,
        endDate: weekEnd
    })

    // Navigate weeks
    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() - 7)
        setCurrentDate(newDate)
    }

    const goToNextWeek = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + 7)
        setCurrentDate(newDate)
    }

    const goToCurrentWeek = () => {
        setCurrentDate(new Date())
    }

    // Organize entries by project and day
    const { projects, dailyTotals, weeklyTotal } = useMemo(() => {
        const entries = entriesData?.data || []
        const projectsMap = new Map<string, {
            id: string
            name: string
            client: string
            entries: { [date: string]: { duration: number; description: string }[] }
            totalMinutes: number
        }>()

        // Initialize daily totals
        const dailyTotals: { [date: string]: number } = {}
        weekDates.forEach(d => {
            dailyTotals[d.toISOString().split('T')[0]] = 0
        })

        let weeklyTotal = 0

        entries.forEach((entry: any) => {
            const projectId = entry.caseId?._id || entry.caseId || 'other'
            const projectName = entry.caseId?.caseName || entry.caseId?.caseNumber || 'أخرى'
            const clientName = entry.clientId?.name || entry.clientId?.firstName + ' ' + entry.clientId?.lastName || 'عميل غير محدد'
            const entryDate = new Date(entry.date).toISOString().split('T')[0]
            const duration = entry.duration || (entry.hours ? entry.hours * 60 : 0)

            if (!projectsMap.has(projectId)) {
                projectsMap.set(projectId, {
                    id: projectId,
                    name: projectName,
                    client: clientName,
                    entries: {},
                    totalMinutes: 0
                })
            }

            const project = projectsMap.get(projectId)!

            if (!project.entries[entryDate]) {
                project.entries[entryDate] = []
            }

            project.entries[entryDate].push({
                duration,
                description: entry.description || ''
            })

            project.totalMinutes += duration
            dailyTotals[entryDate] = (dailyTotals[entryDate] || 0) + duration
            weeklyTotal += duration
        })

        return {
            projects: Array.from(projectsMap.values()),
            dailyTotals,
            weeklyTotal
        }
    }, [entriesData, weekDates])

    // Check if date is today
    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/finance/overview', isActive: false },
        { title: 'الفواتير', href: '/dashboard/finance/invoices', isActive: false },
        { title: 'المصروفات', href: '/dashboard/finance/expenses', isActive: false },
        { title: 'كشف الحساب', href: '/dashboard/finance/statements', isActive: false },
        { title: 'المعاملات', href: '/dashboard/finance/transactions', isActive: false },
        { title: 'تتبع الوقت', href: '/dashboard/finance/time-tracking', isActive: true },
        { title: 'التقارير', href: '/dashboard/finance/reports', isActive: false },
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
                    <Skeleton className="h-24 w-full rounded-3xl" />
                    <Skeleton className="h-16 w-full rounded-2xl" />
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
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل البيانات</h3>
                        <p className="text-slate-500 mb-6">{error?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
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
                                        <Calendar className="w-3 h-3 ms-2" />
                                        عرض أسبوعي
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
                                    التقويم الأسبوعي
                                </h1>
                                <p className="text-purple-100/80">عرض وإدارة سجلات الوقت حسب الأسبوع</p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                                >
                                    <Download className="w-4 h-4 ms-2" />
                                    تصدير
                                </Button>
                                <Button asChild className="bg-white text-purple-700 hover:bg-purple-50 rounded-xl shadow-lg">
                                    <Link to="/dashboard/finance/time-tracking/new">
                                        <Plus className="w-4 h-4 ms-2" />
                                        إضافة سجل
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Week Navigation */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" onClick={goToPreviousWeek} className="rounded-xl">
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={goToNextWeek} className="rounded-xl">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" onClick={goToCurrentWeek} className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                هذا الأسبوع
                            </Button>
                        </div>
                        <div className="text-lg font-bold text-navy">
                            {formatDate(weekDates[0], 'full')} - {formatDate(weekDates[6], 'full')}
                        </div>
                        <div className="flex items-center gap-2">
                            <Link to="/dashboard/finance/time-tracking">
                                <Button variant="outline" className="rounded-xl">
                                    العرض العادي
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Weekly Calendar Grid */}
                    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                        <CardContent className="p-0">
                            {/* Header Row - Days */}
                            <div className="grid grid-cols-8 border-b border-slate-100">
                                <div className="p-4 bg-slate-50 text-sm font-bold text-slate-600 border-l border-slate-100">
                                    المشروع / العميل
                                </div>
                                {weekDates.map((date, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 text-center border-l border-slate-100 ${isToday(date) ? 'bg-purple-50' : 'bg-slate-50'}`}
                                    >
                                        <div className={`text-sm font-bold ${isToday(date) ? 'text-purple-600' : 'text-slate-600'}`}>
                                            {formatDate(date, 'day')}
                                        </div>
                                        <div className={`text-xl font-bold ${isToday(date) ? 'text-purple-600' : 'text-navy'}`}>
                                            {formatDate(date, 'short')}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Project Rows */}
                            {projects.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="h-8 w-8 text-purple-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد سجلات لهذا الأسبوع</h3>
                                    <p className="text-slate-500 mb-4">ابدأ بتسجيل وقتك</p>
                                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                                        <Link to="/dashboard/finance/time-tracking/new">
                                            <Plus className="w-4 h-4 ms-2" />
                                            إضافة سجل جديد
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {projects.map((project) => (
                                        <div key={project.id} className="grid grid-cols-8 border-b border-slate-100 hover:bg-slate-50/50">
                                            <div className="p-4 border-l border-slate-100">
                                                <div className="font-medium text-navy truncate">{project.name}</div>
                                                <div className="text-sm text-slate-500 truncate">{project.client}</div>
                                            </div>
                                            {weekDates.map((date, idx) => {
                                                const dateKey = date.toISOString().split('T')[0]
                                                const dayEntries = project.entries[dateKey] || []
                                                const totalMinutes = dayEntries.reduce((sum, e) => sum + e.duration, 0)

                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`p-4 border-l border-slate-100 text-center ${isToday(date) ? 'bg-purple-50/50' : ''}`}
                                                    >
                                                        {totalMinutes > 0 ? (
                                                            <div className="bg-purple-100 text-purple-700 rounded-xl py-2 px-3 font-bold text-sm">
                                                                {formatMinutesToTime(totalMinutes)}
                                                            </div>
                                                        ) : (
                                                            <div className="text-slate-300 text-sm">-</div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ))}

                                    {/* Totals Row */}
                                    <div className="grid grid-cols-8 bg-slate-50">
                                        <div className="p-4 border-l border-slate-100 font-bold text-navy">
                                            الإجمالي اليومي
                                        </div>
                                        {weekDates.map((date, idx) => {
                                            const dateKey = date.toISOString().split('T')[0]
                                            const total = dailyTotals[dateKey] || 0

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`p-4 border-l border-slate-100 text-center ${isToday(date) ? 'bg-purple-100/50' : ''}`}
                                                >
                                                    <div className="font-bold text-navy text-lg">
                                                        {formatMinutesToTime(total)}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Weekly Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-0 shadow-sm rounded-2xl">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                                    <Clock className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="text-3xl font-bold text-navy mb-1">
                                    {formatMinutesToTime(weeklyTotal)}
                                </div>
                                <div className="text-sm text-slate-500">إجمالي ساعات الأسبوع</div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                                    <Calendar className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div className="text-3xl font-bold text-navy mb-1">
                                    {projects.length}
                                </div>
                                <div className="text-sm text-slate-500">مشروع نشط</div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm rounded-2xl">
                            <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-3xl font-bold text-navy mb-1">
                                    {weeklyTotal > 0 ? Math.round((weeklyTotal / 60) / 7 * 10) / 10 : 0}
                                </div>
                                <div className="text-sm text-slate-500">متوسط الساعات اليومي</div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </Main>
        </>
    )
}

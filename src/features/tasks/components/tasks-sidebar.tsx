import { useState, useMemo } from 'react'
import {
    Clock, Bell, MapPin, Calendar as CalendarIcon,
    Plus, CheckSquare, Trash2, List, X, ChevronRight, Loader2, AlertCircle,
    Edit3, Eye, ListTodo, CalendarClock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useCalendar } from '@/hooks/useCalendar'
import { useUpcomingReminders, useOverdueReminders, useUpcomingEvents } from '@/hooks/useRemindersAndEvents'
import { useDueTodayTasks, useOverdueTasks } from '@/hooks/useTasks'
import { format, addDays, startOfDay, endOfDay, isSameDay } from 'date-fns'
import { arSA } from 'date-fns/locale'

interface TasksSidebarProps {
    context?: 'tasks' | 'reminders' | 'events'
    isSelectionMode?: boolean
    onToggleSelectionMode?: () => void
    selectedCount?: number
    onDeleteSelected?: () => void
    // Task details specific props
    taskId?: string
    isTaskCompleted?: boolean
    onCompleteTask?: () => void
    onDeleteTask?: () => void
    isCompletePending?: boolean
    isDeletePending?: boolean
}

export function TasksSidebar({
    context = 'tasks',
    isSelectionMode = false,
    onToggleSelectionMode,
    selectedCount = 0,
    onDeleteSelected,
    // Task details props
    taskId,
    isTaskCompleted = false,
    onCompleteTask,
    onDeleteTask,
    isCompletePending = false,
    isDeletePending = false
}: TasksSidebarProps) {
    const [activeTab, setActiveTab] = useState<'calendar' | 'notifications'>('calendar')
    const [selectedDate, setSelectedDate] = useState(new Date())

    // Calculate date range for the strip (Today + 4 days)
    const startDate = useMemo(() => startOfDay(new Date()).toISOString(), [])
    const endDate = useMemo(() => endOfDay(addDays(new Date(), 4)).toISOString(), [])

    // Fetch calendar data for the calendar tab
    const { data: calendarData, isLoading: isCalendarLoading } = useCalendar({
        startDate,
        endDate
    })

    // Fetch upcoming reminders for the notifications tab
    const { data: upcomingRemindersData, isLoading: isRemindersLoading } = useUpcomingReminders(7)
    const { data: overdueRemindersData } = useOverdueReminders()
    const { data: upcomingEventsData, isLoading: isEventsLoading } = useUpcomingEvents(7)
    const { data: dueTodayTasksData, isLoading: isTasksLoading } = useDueTodayTasks()
    const { data: overdueTasksData } = useOverdueTasks()

    // Filter events for the selected date
    const selectedDateEvents = useMemo(() => {
        if (!calendarData?.data?.combined) return []
        return calendarData.data.combined.filter(event =>
            isSameDay(new Date(event.startDate), selectedDate)
        ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    }, [calendarData, selectedDate])

    // Combine all alerts: reminders, events, tasks (limit to 8)
    const allAlerts = useMemo(() => {
        const alerts: Array<{
            id: string
            type: 'reminder' | 'event' | 'task'
            title: string
            dateTime: string
            priority?: string
            isOverdue: boolean
            link: string
        }> = []

        // Add upcoming reminders
        if (upcomingRemindersData?.data) {
            upcomingRemindersData.data.forEach((r: any) => {
                alerts.push({
                    id: r._id,
                    type: 'reminder',
                    title: r.title,
                    dateTime: r.reminderDateTime || r.reminderDate,
                    priority: r.priority,
                    isOverdue: false,
                    link: `/dashboard/tasks/reminders/${r._id}`
                })
            })
        }

        // Add overdue reminders
        if (overdueRemindersData?.data) {
            overdueRemindersData.data.forEach((r: any) => {
                alerts.push({
                    id: r._id,
                    type: 'reminder',
                    title: r.title,
                    dateTime: r.reminderDateTime || r.reminderDate,
                    priority: r.priority || 'high',
                    isOverdue: true,
                    link: `/dashboard/tasks/reminders/${r._id}`
                })
            })
        }

        // Add upcoming events
        if (upcomingEventsData?.data) {
            upcomingEventsData.data.forEach((e: any) => {
                alerts.push({
                    id: e._id,
                    type: 'event',
                    title: e.title,
                    dateTime: e.startDateTime || e.date,
                    priority: e.priority,
                    isOverdue: false,
                    link: `/dashboard/tasks/events/${e._id}`
                })
            })
        }

        // Add due today tasks
        if (dueTodayTasksData) {
            const tasks = Array.isArray(dueTodayTasksData) ? dueTodayTasksData : dueTodayTasksData?.data || []
            tasks.forEach((t: any) => {
                alerts.push({
                    id: t._id,
                    type: 'task',
                    title: t.title,
                    dateTime: t.dueDate,
                    priority: t.priority,
                    isOverdue: false,
                    link: `/dashboard/tasks/${t._id}`
                })
            })
        }

        // Add overdue tasks
        if (overdueTasksData) {
            const tasks = Array.isArray(overdueTasksData) ? overdueTasksData : overdueTasksData?.data || []
            tasks.forEach((t: any) => {
                alerts.push({
                    id: t._id,
                    type: 'task',
                    title: t.title,
                    dateTime: t.dueDate,
                    priority: t.priority || 'high',
                    isOverdue: true,
                    link: `/dashboard/tasks/${t._id}`
                })
            })
        }

        // Sort: overdue first, then by date
        alerts.sort((a, b) => {
            if (a.isOverdue && !b.isOverdue) return -1
            if (!a.isOverdue && b.isOverdue) return 1
            return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        })

        // Remove duplicates by id
        const seen = new Set<string>()
        return alerts.filter(a => {
            if (seen.has(a.id)) return false
            seen.add(a.id)
            return true
        }).slice(0, 8)
    }, [upcomingRemindersData, overdueRemindersData, upcomingEventsData, dueTodayTasksData, overdueTasksData])

    const isAlertsLoading = isRemindersLoading || isEventsLoading || isTasksLoading

    const links = {
        tasks: {
            create: '/dashboard/tasks/new',
            viewAll: '/dashboard/tasks/list'
        },
        reminders: {
            create: '/dashboard/tasks/reminders/new',
            viewAll: '/dashboard/tasks/reminders'
        },
        events: {
            create: '/dashboard/tasks/events/new',
            viewAll: '/dashboard/tasks/events'
        }
    }

    const currentLinks = links[context]

    // Generate 5 days for the strip
    const calendarStripDays = useMemo(() => {
        return Array.from({ length: 5 }).map((_, i) => {
            const date = addDays(new Date(), i)
            return {
                date,
                dayName: format(date, 'EEEE', { locale: arSA }),
                dayNumber: format(date, 'd')
            }
        })
    }, [])

    // Get color based on event type
    const getEventColor = (event: { type?: string; isOverdue?: boolean }) => {
        if (event.isOverdue) return 'red'
        if (event.type === 'event') return 'blue'
        if (event.type === 'task') return 'amber'
        return 'emerald'
    }

    // Get alert styling based on type
    const getAlertStyle = (alert: { type: 'reminder' | 'event' | 'task'; isOverdue: boolean; priority?: string }) => {
        if (alert.isOverdue) {
            return { bgColor: 'bg-red-50', textColor: 'text-red-500', hoverBg: 'group-hover:bg-red-500' }
        }
        switch (alert.type) {
            case 'event':
                return { bgColor: 'bg-blue-50', textColor: 'text-blue-500', hoverBg: 'group-hover:bg-blue-500' }
            case 'task':
                return { bgColor: 'bg-amber-50', textColor: 'text-amber-500', hoverBg: 'group-hover:bg-amber-500' }
            case 'reminder':
            default:
                return { bgColor: 'bg-emerald-50', textColor: 'text-emerald-500', hoverBg: 'group-hover:bg-emerald-500' }
        }
    }

    // Get icon based on alert type
    const getAlertIcon = (type: 'reminder' | 'event' | 'task', isOverdue: boolean) => {
        if (isOverdue) return AlertCircle
        switch (type) {
            case 'event': return CalendarClock
            case 'task': return ListTodo
            case 'reminder':
            default: return Bell
        }
    }

    // Get type label
    const getTypeLabel = (type: 'reminder' | 'event' | 'task') => {
        switch (type) {
            case 'event': return 'حدث'
            case 'task': return 'مهمة'
            case 'reminder': return 'تذكير'
        }
    }

    // Format reminder time
    const formatReminderTime = (dateString?: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return format(date, 'h:mm a', { locale: arSA })
    }

    return (
        <div className="space-y-8 lg:col-span-1">

            {/* QUICK ACTIONS WIDGET */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 shadow-xl shadow-emerald-900/20 ring-1 ring-white/10 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="font-bold text-lg text-white">إجراءات سريعة</h3>
                </div>

                {/* Content */}
                <div className="relative z-10 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {taskId ? (
                        // Task Details View - Show Complete, Edit, Delete, View All
                        <>
                            {/* Complete/Reopen Button */}
                            <Button
                                variant="ghost"
                                className={cn(
                                    "h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl transition-all duration-300 hover:scale-[1.02] shadow-lg disabled:opacity-50",
                                    isTaskCompleted
                                        ? "bg-amber-50 hover:bg-amber-100 text-amber-600 shadow-amber-500/10"
                                        : "bg-white hover:bg-emerald-50 text-emerald-600 shadow-white/10"
                                )}
                                onClick={onCompleteTask}
                                disabled={isCompletePending}
                            >
                                {isCompletePending ? (
                                    <Loader2 className="h-7 w-7 animate-spin" />
                                ) : (
                                    <CheckSquare className="h-7 w-7" />
                                )}
                                <span className="text-sm font-bold">
                                    {isTaskCompleted ? 'إعادة فتح' : 'إكمال'}
                                </span>
                            </Button>

                            {/* Edit Button */}
                            <Button asChild className="bg-white hover:bg-blue-50 text-blue-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl shadow-lg shadow-white/10 transition-all duration-300 hover:scale-[1.02] border-0">
                                <Link to="/dashboard/tasks/create" search={{ editId: taskId }}>
                                    <Edit3 className="h-7 w-7" />
                                    <span className="text-sm font-bold">تعديل</span>
                                </Link>
                            </Button>

                            {/* Delete Button */}
                            <Button
                                variant="ghost"
                                className="bg-white hover:bg-red-50 text-red-500 hover:text-red-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-white/10"
                                onClick={onDeleteTask}
                                disabled={isDeletePending}
                            >
                                {isDeletePending ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <Trash2 className="h-6 w-6" />
                                )}
                                <span className="text-sm font-bold">حذف</span>
                            </Button>

                            {/* View All Button */}
                            <Button asChild variant="ghost" className="bg-white hover:bg-slate-50 text-emerald-950 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-white/10">
                                <Link to={currentLinks.viewAll}>
                                    <List className="h-6 w-6" />
                                    <span className="text-sm font-bold">عرض جميع</span>
                                </Link>
                            </Button>
                        </>
                    ) : (
                        // List View - Show Create, Select, Delete, View All
                        <>
                            {/* Create Button - White + Green Text + Glow */}
                            <Button asChild className="bg-white hover:bg-emerald-50 text-emerald-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl shadow-lg shadow-white/10 transition-all duration-300 hover:scale-[1.02] border-0">
                                <Link to={currentLinks.create}>
                                    <Plus className="h-7 w-7" />
                                    <span className="text-sm font-bold">إنشاء</span>
                                </Link>
                            </Button>

                            {/* Select Button - White + Dark Text + Glow */}
                            <Button
                                variant="ghost"
                                className={cn(
                                    "h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl transition-all duration-300 hover:scale-[1.02] shadow-lg",
                                    isSelectionMode
                                        ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400 shadow-emerald-500/20"
                                        : "bg-white hover:bg-slate-50 text-emerald-950 shadow-white/10"
                                )}
                                onClick={onToggleSelectionMode}
                            >
                                {isSelectionMode ? <X className="h-6 w-6" /> : <CheckSquare className="h-6 w-6" />}
                                <span className="text-sm font-bold">{isSelectionMode ? 'إلغاء' : 'تحديد'}</span>
                            </Button>

                            {/* Delete Button - White + Red Text + Glow */}
                            <Button
                                variant="ghost"
                                className="bg-white hover:bg-red-50 text-red-500 hover:text-red-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-white/10"
                                onClick={onDeleteSelected}
                                disabled={!isSelectionMode || selectedCount === 0}
                            >
                                <Trash2 className="h-6 w-6" />
                                <span className="text-sm font-bold">
                                    {selectedCount > 0 ? `حذف (${selectedCount})` : 'حذف'}
                                </span>
                            </Button>

                            {/* View All Button - White + Dark Text + Glow */}
                            <Button asChild variant="ghost" className="bg-white hover:bg-slate-50 text-emerald-950 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-white/10">
                                <Link to={currentLinks.viewAll}>
                                    <List className="h-6 w-6" />
                                    <span className="text-sm font-bold">عرض جميع</span>
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* MERGED CALENDAR & AGENDA WIDGET */}
            <div className="bg-[#022c22] rounded-3xl p-6 shadow-lg shadow-emerald-900/20 group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                {/* Decorative Lines */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex bg-[#033a2d] p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={cn(
                                "px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200",
                                activeTab === 'calendar'
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                    : "text-emerald-200 hover:text-white hover:bg-emerald-500/10"
                            )}
                        >
                            التقويم
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={cn(
                                "px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200",
                                activeTab === 'notifications'
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                    : "text-emerald-200 hover:text-white hover:bg-emerald-500/10"
                            )}
                        >
                            التنبيهات
                        </button>
                    </div>
                    {activeTab === 'calendar' && (
                        <Badge className="bg-emerald-500/20 text-emerald-100 border-0 rounded-full px-3 hover:bg-emerald-500/30">
                            {format(new Date(), 'MMMM', { locale: arSA })}
                        </Badge>
                    )}
                    {activeTab === 'notifications' && allAlerts.length > 0 && (
                        <Badge className={cn(
                            "border-0 rounded-full px-3 hover:opacity-80",
                            allAlerts.some(a => a.isOverdue)
                                ? "bg-red-500/20 text-red-100"
                                : "bg-emerald-500/20 text-emerald-100"
                        )}>
                            {allAlerts.length}
                        </Badge>
                    )}
                </div>

                {/* Inner White Container */}
                <div className="bg-[#f8fafc] rounded-2xl p-4 relative z-10 min-h-[300px] border border-white/5 shadow-inner">
                    {activeTab === 'calendar' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Calendar Strip */}
                            <div className="grid grid-cols-5 gap-2 text-center mb-8">
                                {calendarStripDays.map((day, i) => {
                                    const isSelected = isSameDay(day.date, selectedDate)
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedDate(day.date)}
                                            className={cn(
                                                "rounded-xl p-2 transition-all duration-200 cursor-pointer",
                                                isSelected
                                                    ? "bg-[#022c22] text-white shadow-lg shadow-emerald-900/20 scale-105"
                                                    : "hover:bg-white text-slate-500"
                                            )}
                                        >
                                            <div className={cn("text-[10px] mb-1", isSelected && "text-emerald-200")}>{day.dayName}</div>
                                            <div className="font-bold text-lg">{day.dayNumber}</div>
                                            {isSelected && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-auto mt-1"></div>}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Timeline / Agenda */}
                            <div className="space-y-6 relative min-h-[200px]">
                                {isCalendarLoading ? (
                                    <div className="flex items-center justify-center h-full py-12">
                                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                                    </div>
                                ) : selectedDateEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                        <CalendarIcon className="h-10 w-10 mb-2 opacity-20" />
                                        <p className="text-xs font-medium">لا توجد أحداث لهذا اليوم</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Vertical Line */}
                                        <div className="absolute top-2 bottom-2 right-[3.5rem] w-[2px] bg-slate-200"></div>

                                        {selectedDateEvents.map((event) => {
                                            const eventDate = event.startDate ? new Date(event.startDate) : null
                                            const eventTime = eventDate ? eventDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'غير محدد'
                                            const timePeriod = eventDate ? (eventDate.getHours() < 12 ? 'صباحاً' : 'مساءً') : ''
                                            const colorClass = getEventColor(event)

                                            return (
                                                <div key={event.id} className="flex gap-4 relative group">
                                                    <div className="w-14 text-center shrink-0 pt-1">
                                                        <div className={cn("text-sm font-bold text-slate-700 transition-colors", `group-hover:text-${colorClass}-600`)}>
                                                            {eventTime}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400">{timePeriod}</div>
                                                    </div>
                                                    <div className={cn("absolute right-[3.25rem] top-2 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10", `bg-${colorClass}-500`)}></div>
                                                    <div className={cn("flex-1 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all", `border-r-4 border-${colorClass}-500`)}>
                                                        <div className="font-bold text-slate-800 text-sm mb-1">{event.title}</div>
                                                        {event.location && (
                                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {typeof event.location === 'string' ? event.location : (event.location?.name || event.location?.address || 'عن بعد')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </>
                                )}
                            </div>

                            <Button asChild variant="ghost" className="w-full mt-6 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 group cursor-pointer">
                                <Link to="/dashboard/calendar">
                                    <span>عرض الجدول الكامل</span>
                                    <ChevronRight className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[200px]">
                            {isAlertsLoading ? (
                                <div className="flex items-center justify-center h-full py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                                </div>
                            ) : allAlerts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                    <Bell className="h-10 w-10 mb-2 opacity-20" />
                                    <p className="text-xs font-medium">لا توجد تنبيهات قادمة</p>
                                </div>
                            ) : (
                                <>
                                    {allAlerts.map((alert) => {
                                        const style = getAlertStyle(alert)
                                        const Icon = getAlertIcon(alert.type, alert.isOverdue)

                                        return (
                                            <Link
                                                key={`${alert.type}-${alert.id}`}
                                                to={alert.link}
                                                className="flex gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                                    style.bgColor, style.textColor, style.hoverBg, "group-hover:text-white"
                                                )}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 transition-colors truncate group-hover:text-slate-900">
                                                        {alert.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-200">
                                                            {getTypeLabel(alert.type)}
                                                        </Badge>
                                                        {alert.dateTime && (
                                                            <p className="text-xs text-slate-500">
                                                                {format(new Date(alert.dateTime), 'dd MMM', { locale: arSA })}
                                                                {' - '}
                                                                {formatReminderTime(alert.dateTime)}
                                                            </p>
                                                        )}
                                                        {alert.isOverdue && (
                                                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                                                متأخر
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </>
                            )}
                            <Button asChild variant="ghost" className="w-full text-xs text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                                <Link to="/dashboard/calendar">
                                    عرض التقويم الكامل
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>


        </div>
    )
}

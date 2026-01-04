import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebouncedCallback } from 'use-debounce'
import { PERF_DEBUG, perfLog } from '@/lib/perf-debug'
import { TasksSidebar } from './tasks-sidebar'
import {
    Calendar as CalendarIcon, MoreHorizontal, Plus,
    MapPin, Clock, Search, AlertCircle, ChevronLeft, Bell, Users,
    CalendarCheck, CalendarPlus, CalendarRange, Eye, Trash2, CheckCircle, XCircle, CalendarClock,
    SortAsc, X, CheckSquare, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEvents, useDeleteEvent, useRSVPEvent, useCompleteEvent, useCancelEvent, usePostponeEvent, useEventStats } from '@/hooks/useRemindersAndEvents'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { StatCard } from '@/components/stat-card'
import { ProductivityHero } from '@/components/productivity-hero'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    GosiCard,
    GosiCardContent,
    GosiInput,
    GosiSelect,
    GosiSelectContent,
    GosiSelectItem,
    GosiSelectTrigger,
    GosiSelectValue,
    GosiButton
} from '@/components/ui/gosi-ui'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { ROUTES } from '@/constants/routes'

export function EventsView() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('upcoming')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])

    // Performance profiling
    const renderCount = useRef(0)
    const mountTime = useRef(performance.now())

    useEffect(() => {
        perfLog('EventsView MOUNTED')
        return () => perfLog('EventsView UNMOUNTED')
    }, [])

    renderCount.current++
    if (PERF_DEBUG && renderCount.current <= 5) {
        perfLog(`EventsView RENDER #${renderCount.current}`, {
            timeSinceMount: (performance.now() - mountTime.current).toFixed(2) + 'ms'
        })
    }

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('startDate')

    // Debounced search handler (enterprise-grade: 300ms debounce, min 2 chars)
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => {
            // Only search if empty (clear) or has at least 2 characters
            if (value === '' || value.trim().length >= 2) {
                setSearchQuery(value)
            }
        },
        300
    )

    // API filters - use date-based filters that backend supports
    const filters = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toISOString().split('T')[0]
        const f: any = {}

        if (activeTab === 'upcoming') {
            f.startDate = todayStr
        } else if (activeTab === 'past') {
            f.endDate = todayStr
        }

        if (searchQuery.trim()) {
            f.search = searchQuery.trim()
        }

        if (typeFilter !== 'all') {
            f.type = typeFilter
        }

        if (sortBy) {
            f.sortBy = sortBy
            f.sortOrder = 'asc'
        }

        return f
    }, [activeTab, searchQuery, typeFilter, sortBy])

    // Check if any filter is active
    const hasActiveFilters = useMemo(() =>
        searchQuery || typeFilter !== 'all',
        [searchQuery, typeFilter]
    )

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchQuery('')
        setTypeFilter('all')
    }, [])

    // Helper function to format dates based on current locale
    const formatDualDate = useCallback((dateString: string | null | undefined) => {
        if (!dateString) return { arabic: t('events.list.notSet'), english: t('events.list.notSet') }
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return { arabic: t('events.list.notSet'), english: t('events.list.notSet') }
        return {
            arabic: format(date, 'd MMMM', { locale: arSA }),
            english: format(date, 'MMM d, yyyy', { locale: enUS })
        }
    }, [t])

    // Fetch events
    const { data: eventsData, isLoading, isError, error, refetch, isFetching } = useEvents(filters)
    const { data: stats, isFetching: statsFetching } = useEventStats()
    const { mutateAsync: deleteEvent } = useDeleteEvent()
    const { mutate: rsvpEvent } = useRSVPEvent()
    const completeEventMutation = useCompleteEvent()
    const cancelEventMutation = useCancelEvent()
    const postponeEventMutation = usePostponeEvent()

    // Performance: Track API load completion
    useEffect(() => {
        if (eventsData) perfLog('API LOADED: events', { count: eventsData?.events?.length })
    }, [eventsData])

    useEffect(() => {
        if (stats) perfLog('API LOADED: eventStats', stats)
    }, [stats])

    useEffect(() => {
        const fetchingStatus = { events: isFetching, stats: statsFetching }
        const activeFetches = Object.entries(fetchingStatus).filter(([, v]) => v).map(([k]) => k)
        if (activeFetches.length > 0) {
            perfLog('EventsView FETCHING:', activeFetches)
        }
    }, [isFetching, statsFetching])

    // Postpone dialog state
    const [postponeEventId, setPostponeEventId] = useState<string | null>(null)
    const [postponeDate, setPostponeDate] = useState('')
    const [postponeTime, setPostponeTime] = useState('')
    const [postponeReason, setPostponeReason] = useState('')

    // Transform API data
    const events = useMemo(() => {
        if (!eventsData?.events) return []

        return eventsData.events.map((event: any) => {
            // Handle different date field names from API
            const eventDate = event.startDate || event.startDateTime || event.date
            const parsedDate = eventDate ? new Date(eventDate) : null

            return {
                id: event._id,
                title: event.title || 'حدث بدون عنوان',
                date: parsedDate ? parsedDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد',
                time: parsedDate ? parsedDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : (event.time || 'غير محدد'),
                location: typeof event.location === 'string' ? event.location : (event.location?.name || event.location?.address || 'عن بعد'),
                type: event.type || 'meeting',
                status: event.status || 'scheduled',
                attendees: event.attendees?.length || 0,
                startDateTime: eventDate,
                createdAt: event.createdAt,
                eventDateFormatted: formatDualDate(eventDate),
                createdAtFormatted: formatDualDate(event.createdAt),
                taskId: event.taskId, // Event ↔ Task sync
                _id: event._id,
            }
        })
    }, [eventsData])

    // Single event actions
    const handleViewEvent = useCallback((eventId: string) => {
        navigate({ to: ROUTES.dashboard.tasks.events.detail(eventId) })
    }, [navigate])

    const handleDeleteEvent = useCallback(async (eventId: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الحدث؟')) {
            try {
                await deleteEvent(eventId)
                toast.success('تم حذف الحدث بنجاح')
            } catch (error) {
                toast.error('فشل حذف الحدث')
            }
        }
    }, [deleteEvent])

    const handleCompleteEvent = useCallback((eventId: string) => {
        completeEventMutation.mutate({ id: eventId })
    }, [completeEventMutation])

    const handleCancelEvent = useCallback((eventId: string) => {
        cancelEventMutation.mutate({ id: eventId })
    }, [cancelEventMutation])

    const handlePostponeEvent = useCallback(() => {
        if (!postponeEventId || !postponeDate || !postponeTime) return
        const newDateTime = new Date(`${postponeDate}T${postponeTime}:00`).toISOString()
        postponeEventMutation.mutate(
            { id: postponeEventId, newDateTime, reason: postponeReason || undefined },
            {
                onSuccess: () => {
                    setPostponeEventId(null)
                    setPostponeDate('')
                    setPostponeTime('')
                    setPostponeReason('')
                }
            }
        )
    }, [postponeEventId, postponeDate, postponeTime, postponeReason, postponeEventMutation])

    // Selection Handlers
    const handleToggleSelectionMode = useCallback(() => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedEventIds([])
    }, [isSelectionMode])

    const handleSelectEvent = useCallback((id: string) => {
        if (selectedEventIds.includes(id)) {
            setSelectedEventIds(selectedEventIds.filter(itemId => itemId !== id))
        } else {
            setSelectedEventIds([...selectedEventIds, id])
        }
    }, [selectedEventIds])

    const handleDeleteSelected = useCallback(async () => {
        if (selectedEventIds.length === 0) return

        if (confirm(t('events.list.deleteMultipleConfirm', { count: selectedEventIds.length }))) {
            try {
                await Promise.all(selectedEventIds.map(id => deleteEvent(id)))
                toast.success(t('events.toast.deleteSuccess', { count: selectedEventIds.length }))
                setIsSelectionMode(false)
                setSelectedEventIds([])
            } catch (error) {
                toast.error(t('events.toast.deleteError'))
            }
        }
    }, [selectedEventIds, t, deleteEvent])

    const handleRSVP = useCallback((id: string, status: 'accepted' | 'declined') => {
        rsvpEvent({ id, status }, {
            onSuccess: () => {
                toast.success(status === 'accepted' ? t('events.toast.rsvpAccepted') : t('events.toast.rsvpDeclined'))
            }
        })
    }, [rsvpEvent, t])

    const topNav = [
        { title: t('events.nav.overview'), href: ROUTES.dashboard.home, isActive: false },
        { title: t('events.nav.tasks'), href: ROUTES.dashboard.tasks.list, isActive: false },
        { title: t('events.nav.reminders'), href: ROUTES.dashboard.tasks.reminders.list, isActive: false },
        { title: t('events.nav.events'), href: ROUTES.dashboard.tasks.events.list, isActive: true },
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
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder={t('tasks.list.search')} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
                        <Bell className="h-5 w-5" />
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
                <ProductivityHero badge={t('events.management')} title={t('events.title')} type="events" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR - Responsive Flex Wrap */}
                        <GosiCard className="p-4 md:p-6 rounded-[2rem]">
                            <div className="flex flex-wrap items-center gap-3 transition-all duration-300 ease-in-out">
                                {/* Search Input - Debounced for enterprise-grade performance */}
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
                                    <GosiInput
                                        type="text"
                                        placeholder={t('events.list.searchPlaceholder')}
                                        defaultValue={searchQuery}
                                        onChange={(e) => debouncedSetSearch(e.target.value)}
                                        className="pe-12 h-14 w-full text-base"
                                        aria-label={t('events.list.searchPlaceholder')}
                                    />
                                </div>

                                {/* Status Filter (Tab Switcher) */}
                                <div className="flex-1 min-w-[150px]">
                                    <GosiSelect value={activeTab} onValueChange={setActiveTab}>
                                        <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{t('events.list.status')}:</span>
                                                <GosiSelectValue />
                                            </div>
                                        </GosiSelectTrigger>
                                        <GosiSelectContent>
                                            <GosiSelectItem value="upcoming">{t('events.list.upcoming')}</GosiSelectItem>
                                            <GosiSelectItem value="past">{t('events.list.past')}</GosiSelectItem>
                                        </GosiSelectContent>
                                    </GosiSelect>
                                </div>

                                {/* Type Filter */}
                                <div className="flex-1 min-w-[180px]">
                                    <GosiSelect value={typeFilter} onValueChange={setTypeFilter}>
                                        <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{t('events.list.type')}:</span>
                                                <GosiSelectValue />
                                            </div>
                                        </GosiSelectTrigger>
                                        <GosiSelectContent>
                                            <GosiSelectItem value="all">{t('events.list.allTypes')}</GosiSelectItem>
                                            <GosiSelectItem value="meeting">{t('events.list.meeting')}</GosiSelectItem>
                                            <GosiSelectItem value="court_hearing">{t('events.list.courtHearing')}</GosiSelectItem>
                                            <GosiSelectItem value="conference">{t('events.list.conference')}</GosiSelectItem>
                                            <GosiSelectItem value="webinar">{t('events.list.webinar')}</GosiSelectItem>
                                            <GosiSelectItem value="workshop">{t('events.list.workshop')}</GosiSelectItem>
                                        </GosiSelectContent>
                                    </GosiSelect>
                                </div>

                                {/* Sort By */}
                                <div className="flex-[0.5] min-w-[160px]">
                                    <GosiSelect value={sortBy} onValueChange={setSortBy}>
                                        <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all">
                                            <div className="flex items-center gap-2 truncate">
                                                <SortAsc className="h-4 w-4 text-blue-500" />
                                                <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{t('events.list.sortBy')}:</span>
                                                <GosiSelectValue />
                                            </div>
                                        </GosiSelectTrigger>
                                        <GosiSelectContent>
                                            <GosiSelectItem value="startDate">{t('events.list.eventDate')}</GosiSelectItem>
                                            <GosiSelectItem value="createdAt">{t('events.list.creationDate')}</GosiSelectItem>
                                            <GosiSelectItem value="title">{t('events.list.name')}</GosiSelectItem>
                                        </GosiSelectContent>
                                    </GosiSelect>
                                </div>

                                {/* Clear Filters Button */}
                                {hasActiveFilters && (
                                    <GosiButton
                                        variant="ghost"
                                        onClick={clearFilters}
                                        className="h-14 w-full md:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-dashed border-red-200 px-6 hover:shadow-lg hover:shadow-red-500/10 transition-all"
                                    >
                                        <X className="h-5 w-5 ms-2" aria-hidden="true" />
                                        {t('events.list.clearFilters')}
                                    </GosiButton>
                                )}
                            </div>
                        </GosiCard>

                        {/* MAIN EVENTS LIST */}
                        <div className="flex flex-col gap-4">
                            {/* Loading State */}
                            {isLoading && (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-40 w-full rounded-[2rem] bg-slate-100" />
                                    ))}
                                </div>
                            )}

                            {/* Error State */}
                            {isError && (
                                <div className="bg-red-50 rounded-[2rem] p-12 text-center border border-red-100">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                            <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('events.list.errorLoading')}</h3>
                                    <p className="text-slate-500 mb-4">{error?.message || t('events.list.unknownError')}</p>
                                    <Button onClick={() => refetch()} className="bg-blue-500 hover:bg-blue-600">
                                        {t('events.list.retry')}
                                    </Button>
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoading && !isError && events.length === 0 && (
                                <div className="bg-white rounded-[2rem] p-12 border border-slate-100 text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                                            <CalendarIcon className="h-8 w-8 text-blue-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد فعاليات</h3>
                                    <p className="text-slate-500 mb-4">جدولك خالٍ حالياً. ابدأ بإضافة أحداث جديدة.</p>
                                    <GosiButton asChild className="bg-blue-500 hover:bg-blue-600">
                                        <Link to={ROUTES.dashboard.tasks.events.new}>
                                            <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                            إضافة حدث جديد
                                        </Link>
                                    </GosiButton>
                                </div>
                            )}

                            {/* Success State */}
                            {!isLoading && !isError && events.map((event, index) => (
                                <div
                                    key={event.id}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    onClick={() => handleViewEvent(event.id)}
                                    className={`
                                        animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards
                                        bg-white rounded-[2rem] p-5 md:p-7
                                        border-0 ring-1 ring-black/[0.03] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]
                                        transition-all duration-300 group 
                                        hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 
                                        cursor-pointer relative overflow-hidden flex flex-col
                                        ${selectedEventIds.includes(event.id) ? 'ring-2 ring-blue-500 bg-blue-50/20' : ''}
                                    `}
                                >
                                    {/* Status Strip Indicator (Blue/Red based on urgency or type could be nice, for now consistent Blue) */}
                                    <div className={`absolute start-0 top-0 bottom-0 w-1.5 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 ps-2">
                                        {/* LEFT SIDE: Checkbox + DateBox + Info */}
                                        <div className="flex gap-5 items-start w-full md:w-auto">
                                            {isSelectionMode && (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedEventIds.includes(event.id)}
                                                        onCheckedChange={() => handleSelectEvent(event.id)}
                                                        className="h-6 w-6 mt-1 rounded-md border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 flex-shrink-0 transition-all duration-200"
                                                    />
                                                </div>
                                            )}

                                            {/* Date Box (Replaces Icon Box for Events) */}
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] bg-white flex flex-col items-center justify-center shadow-inner border border-slate-100 text-center overflow-hidden group-hover:scale-105 transition-all duration-300">
                                                <div className="bg-blue-500 text-white text-[10px] w-full py-0.5 font-bold tracking-wider">
                                                    {event.date && !isNaN(new Date(event.date).getTime()) ? new Date(event.date).toLocaleDateString('ar-SA', { month: 'short' }) : 'NA'}
                                                </div>
                                                <div className="text-xl font-bold text-slate-800 pt-1 group-hover:text-blue-600">
                                                    {event.date && !isNaN(new Date(event.date).getTime()) ? new Date(event.date).toLocaleDateString('en-US', { day: 'numeric' }) : '-'}
                                                </div>
                                            </div>

                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-slate-800 text-lg md:text-xl group-hover:text-blue-800 transition-colors truncate leading-tight tracking-tight">{event.title}</h4>

                                                    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 rounded-lg px-2 text-[11px]">
                                                        {event.type}
                                                    </Badge>

                                                    {event.taskId && (
                                                        <Badge
                                                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 rounded-lg px-2 flex items-center gap-1 cursor-pointer transition-all text-[11px]"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                const taskId = typeof event.taskId === 'string' ? event.taskId : event.taskId._id
                                                                navigate({ to: ROUTES.dashboard.tasks.detail(taskId) })
                                                            }}
                                                        >
                                                            <CheckSquare className="h-3 w-3" />
                                                            مرتبط بمهمة
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
                                                    <span className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-blue-500" />
                                                        {event.time}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-blue-500" />
                                                        {event.location}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Mobile Chevron */}
                                            <div className="md:hidden ms-auto text-slate-300 group-hover:text-blue-500 group-hover:translate-x-[-4px] transition-all duration-300 rtl:rotate-180 self-center">
                                                <ChevronLeft className="h-6 w-6 rtl:rotate-0 ltr:rotate-180" />
                                            </div>
                                        </div>

                                        {/* RIGHT SIDE: Action Menu */}
                                        <div className="absolute end-4 top-4" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy hover:bg-slate-100 rounded-xl">
                                                        <MoreHorizontal className="h-6 w-6" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-0 ring-1 ring-black/5">
                                                    <DropdownMenuItem onClick={() => handleViewEvent(event.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                        <Eye className="h-4 w-4 ms-2" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {event.status !== 'completed' && (
                                                        <DropdownMenuItem onClick={() => handleCompleteEvent(event.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                            <CheckCircle className="h-4 w-4 ms-2 text-emerald-500" />
                                                            إكمال
                                                        </DropdownMenuItem>
                                                    )}
                                                    {event.status !== 'cancelled' && (
                                                        <DropdownMenuItem onClick={() => handleCancelEvent(event.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                            <XCircle className="h-4 w-4 ms-2 text-orange-500" />
                                                            إلغاء
                                                        </DropdownMenuItem>
                                                    )}
                                                    {event.status !== 'completed' && event.status !== 'cancelled' && (
                                                        <DropdownMenuItem onClick={() => setPostponeEventId(event.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                            <CalendarClock className="h-4 w-4 ms-2 text-blue-500" />
                                                            تأجيل
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="text-red-600 focus:text-red-600 rounded-lg py-2.5 cursor-pointer bg-red-50/50 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4 ms-2" />
                                                        حذف
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Desktop Action Buttons */}
                                        <div className="hidden sm:inline-flex items-center gap-2 mt-auto self-center" onClick={(e) => e.stopPropagation()}>
                                            {/* RSVP Buttons */}
                                            {event.status === 'scheduled' && (
                                                <div className="flex gap-2 me-2">
                                                    <GosiButton
                                                        variant="ghost"
                                                        onClick={() => handleRSVP(event.id, 'declined')}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 h-10 w-auto"
                                                    >
                                                        اعتذار
                                                    </GosiButton>
                                                    <GosiButton
                                                        onClick={() => handleRSVP(event.id, 'accepted')}
                                                        className="bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white border border-blue-100 hover:border-blue-500 rounded-xl px-4 h-10 w-auto shadow-sm hover:shadow-lg transition-all"
                                                    >
                                                        تأكيد
                                                    </GosiButton>
                                                </div>
                                            )}

                                            {/* View Details Button */}
                                            <GosiButton onClick={() => handleViewEvent(event.id)} className="bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white border border-slate-100 hover:border-slate-800 rounded-xl px-6 h-10 shadow-sm hover:shadow-lg w-auto transition-all duration-300 hover:scale-105 active:scale-95 group/btn">
                                                {t('events.list.viewDetails', 'التفاصيل')}
                                                <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180 transition-transform group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1" />
                                            </GosiButton>
                                        </div>
                                    </div>

                                    {/* Footer Info (Attendees, Creation Date) */}
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                                        <div className="flex items-center gap-4">
                                            {/* Attendees Avatars */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2 rtl:space-x-reverse">
                                                    {[...Array(Math.min(3, event.attendees))].map((_, i) => (
                                                        <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500">
                                                            <Users className="w-3 h-3" />
                                                        </div>
                                                    ))}
                                                    {event.attendees > 3 && (
                                                        <div className="w-6 h-6 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-400">
                                                            +{event.attendees - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                {event.attendees > 0 && <span>{event.attendees} حضور</span>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <span>تم الإنشاء:</span>
                                            <span className="font-medium text-slate-500">{event.createdAtFormatted.arabic}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 pt-0 text-center">
                            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full rounded-2xl py-6 border border-dashed border-blue-200 hover:border-blue-300">
                                عرض جميع الفعاليات
                                <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                            </Button>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <TasksSidebar
                        context="events"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedEventIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div>
            </Main>

            {/* Postpone Event Dialog */}
            <Dialog open={!!postponeEventId} onOpenChange={(open) => !open && setPostponeEventId(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>تأجيل الحدث</DialogTitle>
                        <DialogDescription>
                            حدد التاريخ والوقت الجديد للحدث
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">التاريخ الجديد</label>
                                <Input
                                    type="date"
                                    value={postponeDate}
                                    onChange={(e) => setPostponeDate(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">الوقت الجديد</label>
                                <Input
                                    type="time"
                                    value={postponeTime}
                                    onChange={(e) => setPostponeTime(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">سبب التأجيل (اختياري)</label>
                            <Textarea
                                placeholder="أدخل سبب التأجيل..."
                                value={postponeReason}
                                onChange={(e) => setPostponeReason(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPostponeEventId(null)}>
                            {t('events.postpone.cancel')}
                        </Button>
                        <Button
                            onClick={handlePostponeEvent}
                            disabled={!postponeDate || !postponeTime || postponeEventMutation.isPending}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            {postponeEventMutation.isPending ? t('events.postpone.postponing') : t('events.postpone.postpone')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

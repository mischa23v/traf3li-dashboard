import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdaptiveSearchDebounce } from '@/hooks/useAdaptiveDebounce'
import { PERF_DEBUG, perfLog } from '@/lib/perf-debug'
import { TasksSidebar } from './tasks-sidebar'
import {
    Calendar as CalendarIcon, MoreHorizontal, Plus, Filter,
    MapPin, Clock, Search, AlertCircle, ChevronLeft, Bell, Users, Briefcase, User,
    CalendarCheck, CalendarPlus, CalendarRange, Eye, Trash2, CheckCircle, XCircle, CalendarClock,
    SortAsc, X, CheckSquare, ArrowRight, Edit3, Copy, Archive, ArchiveRestore, AlertTriangle, ArrowUpDown
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
import { useEvents, useDeleteEvent, useRSVPEvent, useCompleteEvent, useCancelEvent, usePostponeEvent, useEventStats, useBulkCompleteEvents, useBulkArchiveEvents, useBulkUnarchiveEvents, useArchiveEvent, useUnarchiveEvent, useUpdateEvent } from '@/hooks/useRemindersAndEvents'
import { useTeamMembers, useCases } from '@/hooks/useCasesAndClients'
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
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

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

    // Deferred filter data loading (performance optimization)
    const [isFilterDataReady, setIsFilterDataReady] = useState(false)
    useEffect(() => {
        const timer = setTimeout(() => {
            perfLog('Filter data load TRIGGERED - loading teamMembers & cases')
            setIsFilterDataReady(true)
        }, 200)
        return () => clearTimeout(timer)
    }, [])

    // UI states
    const [showFilters, setShowFilters] = useState(false)
    const [visibleCount, setVisibleCount] = useState(10)

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [priorityFilter, setPriorityFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [assignedFilter, setAssignedFilter] = useState<string>('all')
    const [dueDateFilter, setDueDateFilter] = useState<string>('all')
    const [caseFilter, setCaseFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('startDate')

    // Adaptive debounce search handler (enterprise-grade: typing speed aware)
    const { debouncedCallback: debouncedSetSearch, recordKeypress } = useAdaptiveSearchDebounce(
        (value: string) => {
            // Only search if empty (clear) or has at least 2 characters
            if (value === '' || value.trim().length >= 2) {
                setSearchQuery(value)
            }
        }
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

        // Priority filter
        if (priorityFilter !== 'all') {
            f.priority = priorityFilter
        }

        // Assigned To filter
        if (assignedFilter === 'me') {
            f.assignedTo = 'me'
        } else if (assignedFilter === 'unassigned') {
            f.assignedTo = 'unassigned'
        } else if (assignedFilter !== 'all') {
            f.assignedTo = assignedFilter
        }

        // Due Date filter
        if (dueDateFilter === 'today') {
            f.dueDateFrom = todayStr
            f.dueDateTo = todayStr
        } else if (dueDateFilter === 'thisWeek') {
            const endOfWeek = new Date(today)
            endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
            f.dueDateFrom = todayStr
            f.dueDateTo = endOfWeek.toISOString().split('T')[0]
        } else if (dueDateFilter === 'overdue') {
            const yesterday = new Date(today)
            yesterday.setDate(today.getDate() - 1)
            f.dueDateTo = yesterday.toISOString().split('T')[0]
        } else if (dueDateFilter === 'noDueDate') {
            f.noDueDate = true
        }

        // Case filter
        if (caseFilter !== 'all') {
            f.caseId = caseFilter
        }

        if (sortBy) {
            f.sortBy = sortBy
            f.sortOrder = sortBy === 'priority' ? 'desc' : 'asc'
        }

        return f
    }, [activeTab, searchQuery, typeFilter, priorityFilter, assignedFilter, dueDateFilter, caseFilter, sortBy])

    // Check if any filter is active
    const hasActiveFilters = useMemo(() =>
        searchQuery || priorityFilter !== 'all' || typeFilter !== 'all' ||
        assignedFilter !== 'all' || dueDateFilter !== 'all' || caseFilter !== 'all',
        [searchQuery, priorityFilter, typeFilter, assignedFilter, dueDateFilter, caseFilter]
    )

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchQuery('')
        setPriorityFilter('all')
        setTypeFilter('all')
        setAssignedFilter('all')
        setDueDateFilter('all')
        setCaseFilter('all')
    }, [])

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(10)
    }, [activeTab, searchQuery, priorityFilter, typeFilter, assignedFilter, dueDateFilter, caseFilter, sortBy])

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

    // Smart date helper (like Tasks)
    const getSmartDate = useCallback((dateString: string | null | undefined) => {
        if (!dateString) return { label: t('events.list.notSet'), isOverdue: false, daysRemaining: null }
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return { label: t('events.list.notSet'), isOverdue: false, daysRemaining: null }

        const now = new Date()
        const isOverdue = isPast(date) && !isToday(date)
        const daysRemaining = differenceInDays(date, now)

        let label = ''
        if (isToday(date)) {
            label = t('events.smartDates.today', 'اليوم')
        } else if (isTomorrow(date)) {
            label = t('events.smartDates.tomorrow', 'غداً')
        } else if (isOverdue) {
            label = t('events.smartDates.overdue', 'فات الموعد')
        } else {
            label = format(date, 'd MMM', { locale: i18n.language === 'ar' ? arSA : enUS })
        }

        return { label, isOverdue, daysRemaining }
    }, [t, i18n.language])

    // Fetch events
    const { data: eventsData, isLoading, isError, error, refetch, isFetching } = useEvents(filters)
    const { data: stats, isFetching: statsFetching } = useEventStats()
    const { mutateAsync: deleteEvent } = useDeleteEvent()
    const { mutate: rsvpEvent } = useRSVPEvent()
    const completeEventMutation = useCompleteEvent()
    const cancelEventMutation = useCancelEvent()
    const postponeEventMutation = usePostponeEvent()

    // Bulk operation mutations
    const bulkCompleteMutation = useBulkCompleteEvents()
    const bulkArchiveMutation = useBulkArchiveEvents()
    const bulkUnarchiveMutation = useBulkUnarchiveEvents()

    // Single archive/unarchive mutations
    const archiveEventMutation = useArchiveEvent()
    const unarchiveEventMutation = useUnarchiveEvent()
    const updateEventMutation = useUpdateEvent()

    // Team members and cases for filter dropdowns (DEFERRED)
    const { data: teamMembers } = useTeamMembers(isFilterDataReady)
    const { data: casesData } = useCases(undefined, isFilterDataReady)

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
            const smartDate = getSmartDate(eventDate)

            return {
                id: event._id,
                title: event.title || 'حدث بدون عنوان',
                date: parsedDate ? parsedDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد',
                time: parsedDate ? parsedDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : (event.time || 'غير محدد'),
                location: typeof event.location === 'string' ? event.location : (event.location?.name || event.location?.address || 'عن بعد'),
                type: event.type || 'meeting',
                priority: event.priority || 'medium',
                status: event.status || 'scheduled',
                isArchived: event.isArchived || false,
                attendees: event.attendees?.length || 0,
                startDateTime: eventDate,
                createdAt: event.createdAt,
                eventDateFormatted: formatDualDate(eventDate),
                createdAtFormatted: formatDualDate(event.createdAt),
                smartDate,
                taskId: event.taskId, // Event ↔ Task sync
                _id: event._id,
            }
        })
    }, [eventsData, getSmartDate, formatDualDate])

    // Show all events (no pagination - "View All" link navigates to full list)
    const visibleEvents = events

    // Single event actions
    const handleViewEvent = useCallback((eventId: string) => {
        navigate({ to: ROUTES.dashboard.tasks.events.detail(eventId) })
    }, [navigate])

    const handleEditEvent = useCallback((eventId: string) => {
        navigate({ to: ROUTES.dashboard.tasks.events.edit(eventId) })
    }, [navigate])

    const handleArchiveEvent = useCallback((eventId: string) => {
        archiveEventMutation.mutate(eventId)
    }, [archiveEventMutation])

    const handleUnarchiveEvent = useCallback((eventId: string) => {
        unarchiveEventMutation.mutate(eventId)
    }, [unarchiveEventMutation])

    const handlePriorityChange = useCallback((eventId: string, priority: string) => {
        updateEventMutation.mutate({ id: eventId, data: { priority: priority as 'low' | 'medium' | 'high' | 'critical' } })
    }, [updateEventMutation])

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

    // Bulk Operation Handlers
    const handleSelectAll = useCallback(() => {
        if (!events) return
        if (selectedEventIds.length === events.length && events.length > 0) {
            setSelectedEventIds([])
        } else {
            setSelectedEventIds(events.map(e => e.id))
        }
    }, [events, selectedEventIds])

    const handleBulkComplete = useCallback(async () => {
        if (selectedEventIds.length === 0) return

        const confirmMessage = i18n.language === 'ar'
            ? `هل أنت متأكد من إكمال ${selectedEventIds.length} أحداث؟ | Are you sure you want to complete ${selectedEventIds.length} events?`
            : `Are you sure you want to complete ${selectedEventIds.length} events? | هل أنت متأكد من إكمال ${selectedEventIds.length} أحداث؟`

        if (confirm(confirmMessage)) {
            bulkCompleteMutation.mutate({ eventIds: selectedEventIds }, {
                onSuccess: () => {
                    setIsSelectionMode(false)
                    setSelectedEventIds([])
                }
            })
        }
    }, [selectedEventIds, i18n.language, bulkCompleteMutation])

    const handleBulkArchive = useCallback(async () => {
        if (selectedEventIds.length === 0) return

        const confirmMessage = i18n.language === 'ar'
            ? `هل أنت متأكد من أرشفة ${selectedEventIds.length} أحداث؟ | Are you sure you want to archive ${selectedEventIds.length} events?`
            : `Are you sure you want to archive ${selectedEventIds.length} events? | هل أنت متأكد من أرشفة ${selectedEventIds.length} أحداث؟`

        if (confirm(confirmMessage)) {
            bulkArchiveMutation.mutate(selectedEventIds, {
                onSuccess: () => {
                    setIsSelectionMode(false)
                    setSelectedEventIds([])
                }
            })
        }
    }, [selectedEventIds, i18n.language, bulkArchiveMutation])

    const handleBulkUnarchive = useCallback(async () => {
        if (selectedEventIds.length === 0) return

        const confirmMessage = i18n.language === 'ar'
            ? `هل أنت متأكد من إلغاء أرشفة ${selectedEventIds.length} أحداث؟ | Are you sure you want to unarchive ${selectedEventIds.length} events?`
            : `Are you sure you want to unarchive ${selectedEventIds.length} events? | هل أنت متأكد من إلغاء أرشفة ${selectedEventIds.length} أحداث؟`

        if (confirm(confirmMessage)) {
            bulkUnarchiveMutation.mutate(selectedEventIds, {
                onSuccess: () => {
                    setIsSelectionMode(false)
                    setSelectedEventIds([])
                }
            })
        }
    }, [selectedEventIds, i18n.language, bulkUnarchiveMutation])

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

                        {/* FILTERS BAR - Gold Standard Pattern */}
                        <GosiCard className="p-4 md:p-6 rounded-[2rem]">
                            <div className="space-y-4">
                                {/* Top Row: Search + Filter Toggle */}
                                <div className="flex flex-col lg:flex-row gap-3">
                                    {/* Search Input - Adaptive Debounce */}
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
                                        <GosiInput
                                            type="text"
                                            placeholder={t('events.list.searchPlaceholder')}
                                            defaultValue={searchQuery}
                                            onKeyDown={recordKeypress}
                                            onChange={(e) => debouncedSetSearch(e.target.value)}
                                            className="pe-12 h-14 w-full text-base"
                                            aria-label={t('events.list.searchPlaceholder')}
                                        />
                                        {/* Loading indicator when searching */}
                                        {isFetching && searchQuery && (
                                            <div className="absolute start-4 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Filter Toggle Button */}
                                    <GosiButton
                                        variant={showFilters || hasActiveFilters ? "default" : "outline"}
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`h-14 w-full sm:w-auto px-6 whitespace-nowrap transition-all ${showFilters || hasActiveFilters ? 'bg-navy text-white border-navy' : ''}`}
                                    >
                                        <Filter className="h-5 w-5 ms-2" aria-hidden="true" />
                                        {t('events.list.filters', 'تصفية')}
                                        {hasActiveFilters && (
                                            <span className="ms-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">!</span>
                                        )}
                                    </GosiButton>
                                </div>

                                {/* Collapsible Filters - Animated */}
                                <div className={`flex-wrap gap-4 transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'flex opacity-100 max-h-[500px] mt-4' : 'hidden opacity-0 max-h-0'}`}>
                                    {/* Status Filter (Tab Switcher) */}
                                    <div className="flex-1 min-w-[150px]">
                                        <GosiSelect value={activeTab} onValueChange={setActiveTab}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('events.list.status')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="upcoming" className="font-bold">{t('events.list.upcoming')}</GosiSelectItem>
                                                <GosiSelectItem value="past" className="font-bold">{t('events.list.past')}</GosiSelectItem>
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Priority Filter */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={priorityFilter} onValueChange={setPriorityFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('events.list.priority', 'الأولوية')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('events.list.allPriorities', 'كل الأولويات')}</GosiSelectItem>
                                                <GosiSelectItem value="critical" className="font-bold">{t('events.list.critical', 'حرجة')}</GosiSelectItem>
                                                <GosiSelectItem value="high" className="font-bold">{t('events.list.high', 'عالية')}</GosiSelectItem>
                                                <GosiSelectItem value="medium" className="font-bold">{t('events.list.medium', 'متوسطة')}</GosiSelectItem>
                                                <GosiSelectItem value="low" className="font-bold">{t('events.list.low', 'منخفضة')}</GosiSelectItem>
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Type Filter */}
                                    <div className="flex-1 min-w-[180px]">
                                        <GosiSelect value={typeFilter} onValueChange={setTypeFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('events.list.type')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('events.list.allTypes')}</GosiSelectItem>
                                                <GosiSelectItem value="meeting" className="font-bold">{t('events.list.meeting')}</GosiSelectItem>
                                                <GosiSelectItem value="court_hearing" className="font-bold">{t('events.list.courtHearing')}</GosiSelectItem>
                                                <GosiSelectItem value="conference" className="font-bold">{t('events.list.conference')}</GosiSelectItem>
                                                <GosiSelectItem value="webinar" className="font-bold">{t('events.list.webinar')}</GosiSelectItem>
                                                <GosiSelectItem value="workshop" className="font-bold">{t('events.list.workshop')}</GosiSelectItem>
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Assigned To Filter */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={assignedFilter} onValueChange={setAssignedFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <User className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('events.list.assignedTo', 'المسند إليه')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('events.list.allAssignees', 'الكل')}</GosiSelectItem>
                                                <GosiSelectItem value="me" className="font-bold">{t('events.list.assignedToMe', 'المسندة إليّ')}</GosiSelectItem>
                                                <GosiSelectItem value="unassigned" className="font-bold">{t('events.list.unassigned', 'غير مسندة')}</GosiSelectItem>
                                                {teamMembers?.map((member: any) => (
                                                    <GosiSelectItem key={member._id} value={member._id} className="font-bold">
                                                        {member.name || member.email}
                                                    </GosiSelectItem>
                                                ))}
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Due Date Filter */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={dueDateFilter} onValueChange={setDueDateFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <CalendarIcon className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('events.list.dueDate', 'تاريخ الاستحقاق')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('events.list.allDates', 'الكل')}</GosiSelectItem>
                                                <GosiSelectItem value="today" className="font-bold">{t('events.list.today', 'اليوم')}</GosiSelectItem>
                                                <GosiSelectItem value="thisWeek" className="font-bold">{t('events.list.thisWeek', 'هذا الأسبوع')}</GosiSelectItem>
                                                <GosiSelectItem value="overdue" className="font-bold">{t('events.list.overdue', 'فات الموعد')}</GosiSelectItem>
                                                <GosiSelectItem value="noDueDate" className="font-bold">{t('events.list.noDueDate', 'بدون تاريخ')}</GosiSelectItem>
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Case Filter */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={caseFilter} onValueChange={setCaseFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <Briefcase className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('events.list.case', 'القضية')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('events.list.allCases', 'جميع القضايا')}</GosiSelectItem>
                                                {casesData?.cases?.map((caseItem: any) => (
                                                    <GosiSelectItem key={caseItem._id} value={caseItem._id} className="font-bold">
                                                        {caseItem.title || caseItem.caseNumber}
                                                    </GosiSelectItem>
                                                ))}
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Sort By */}
                                    <div className="flex-1 min-w-[160px]">
                                        <GosiSelect value={sortBy} onValueChange={setSortBy}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <SortAsc className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('events.list.sortBy')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="startDate" className="font-bold">{t('events.list.eventDate')}</GosiSelectItem>
                                                <GosiSelectItem value="createdAt" className="font-bold">{t('events.list.creationDate')}</GosiSelectItem>
                                                <GosiSelectItem value="title" className="font-bold">{t('events.list.name')}</GosiSelectItem>
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
                            </div>
                        </GosiCard>

                        {/* MAIN EVENTS LIST */}
                        <div className="flex flex-col gap-4">
                            {/* Loading State - Gold Standard Skeleton */}
                            {isLoading && (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-5 w-5 rounded-full" />
                                                <Skeleton className="h-14 w-14 rounded-xl" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-48" />
                                                        <Skeleton className="h-5 w-16 rounded-full" />
                                                    </div>
                                                    <Skeleton className="h-3 w-32" />
                                                </div>
                                                <Skeleton className="h-8 w-8 rounded-lg" />
                                            </div>
                                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50">
                                                <Skeleton className="h-6 w-20 rounded-lg" />
                                                <Skeleton className="h-6 w-24 rounded-lg" />
                                                <div className="flex-1" />
                                                <Skeleton className="h-6 w-24 rounded-lg" />
                                            </div>
                                        </div>
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

                            {/* Success State - Using visibleEvents for pagination */}
                            {!isLoading && !isError && visibleEvents.map((event, index) => (
                                <div
                                    key={event.id}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    onClick={() => handleViewEvent(event.id)}
                                    className={`
                                        animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards
                                        rounded-2xl p-3 md:p-4
                                        border-0 ring-1 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
                                        transition-all duration-300 group
                                        hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-1
                                        cursor-pointer relative overflow-hidden
                                        ${event.smartDate.isOverdue && event.status !== 'completed'
                                            ? 'bg-red-50/50 ring-red-200/50'
                                            : selectedEventIds.includes(event.id)
                                                ? 'ring-2 ring-emerald-500 bg-emerald-50/20'
                                                : 'bg-white ring-black/[0.03]'
                                        }
                                    `}
                                >
                                    {/* Priority Strip - Always Visible */}
                                    <div className={`absolute start-0 top-0 bottom-0 w-1.5 rounded-s-2xl transition-all duration-300 ${
                                        event.priority === 'critical' ? 'bg-red-500' :
                                        event.priority === 'high' ? 'bg-orange-500' :
                                        event.priority === 'medium' ? 'bg-amber-400' :
                                        'bg-emerald-400'
                                    }`} />

                                    <div className="flex items-center gap-3 ps-4">
                                        {/* Selection Checkbox */}
                                        {isSelectionMode && (
                                            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                                                <Checkbox
                                                    checked={selectedEventIds.includes(event.id)}
                                                    onCheckedChange={() => handleSelectEvent(event.id)}
                                                    className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-navy data-[state=checked]:border-navy flex-shrink-0 transition-all duration-200"
                                                />
                                            </div>
                                        )}

                                        {/* Event Icon */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 border ${
                                            event.smartDate.isOverdue && event.status !== 'completed' ? 'bg-red-50 text-red-600 border-red-200' :
                                            event.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                            'bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600'
                                        }`}>
                                            {event.smartDate.isOverdue && event.status !== 'completed' ? <AlertTriangle className="h-5 w-5" strokeWidth={1.5} /> :
                                             event.status === 'completed' ? <CheckCircle className="h-5 w-5" strokeWidth={1.5} /> :
                                             <CalendarIcon className="h-5 w-5" strokeWidth={1.5} />}
                                        </div>

                                        {/* Event Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className={`font-bold text-sm md:text-base group-hover:text-blue-900 transition-colors truncate leading-tight ${event.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                    {event.title}
                                                </h4>

                                                {/* Status Badges */}
                                                {event.status !== 'completed' && event.smartDate.isOverdue && (
                                                    <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                        {t('events.smartDates.overdue', 'فات الموعد')}
                                                    </div>
                                                )}

                                                {event.status === 'completed' && (
                                                    <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle className="w-3 h-3" />
                                                        {t('events.statuses.completed', 'مكتمل')}
                                                    </div>
                                                )}

                                                {event.isArchived && (
                                                    <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                        <Archive className="w-3 h-3" />
                                                        {t('events.statuses.archived', 'مؤرشف')}
                                                    </div>
                                                )}

                                                {event.priority === 'critical' && event.status !== 'completed' && (
                                                    <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {t('events.list.critical', 'حرجة')}
                                                    </div>
                                                )}

                                                {/* Type Badge */}
                                                <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 rounded-lg px-2 text-[10px]">
                                                    {t(`events.types.${event.type}`, event.type)}
                                                </Badge>

                                                {event.taskId && (
                                                    <Badge
                                                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 rounded-lg px-2 flex items-center gap-1 cursor-pointer transition-all text-[10px]"
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
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-slate-500 text-xs font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-emerald-500" />
                                                    {event.time}
                                                </p>
                                                <span className="text-slate-300">•</span>
                                                <p className="text-slate-500 text-xs font-medium flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-emerald-500" />
                                                    {event.location}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Mobile Chevron */}
                                        <div className="md:hidden text-slate-400 group-hover:text-emerald-600 transition-all duration-300 rtl:rotate-180">
                                            <ChevronLeft className="h-5 w-5 rtl:rotate-0 ltr:rotate-180" />
                                        </div>

                                        {/* Quick Complete Checkbox */}
                                        <div onClick={(e) => e.stopPropagation()} className="hidden md:flex items-center">
                                            <Checkbox
                                                checked={event.status === 'completed'}
                                                onCheckedChange={(checked) => {
                                                    if (checked) handleCompleteEvent(event.id)
                                                }}
                                                disabled={event.status === 'completed'}
                                                className="h-5 w-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-all duration-200 hover:border-emerald-400 me-2"
                                            />
                                        </div>

                                        {/* RIGHT SIDE: Action Menu */}
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy hover:bg-slate-100 rounded-xl h-8 w-8">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-0 ring-1 ring-black/5">
                                                    <DropdownMenuItem onClick={() => handleViewEvent(event.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                        <Eye className="h-4 w-4 ms-2" />
                                                        {t('events.actions.viewDetails', 'عرض التفاصيل')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditEvent(event.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                        <Edit3 className="h-4 w-4 ms-2" />
                                                        {t('events.actions.edit', 'تعديل')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {event.status !== 'completed' && (
                                                        <DropdownMenuItem onClick={() => handleCompleteEvent(event.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                            <CheckCircle className="h-4 w-4 ms-2 text-emerald-500" />
                                                            {t('events.actions.complete', 'إكمال')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {event.status !== 'cancelled' && (
                                                        <DropdownMenuItem onClick={() => handleCancelEvent(event.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                            <XCircle className="h-4 w-4 ms-2 text-orange-500" />
                                                            {t('events.actions.cancel', 'إلغاء')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {event.status !== 'completed' && event.status !== 'cancelled' && (
                                                        <DropdownMenuItem onClick={() => setPostponeEventId(event.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                            <CalendarClock className="h-4 w-4 ms-2 text-blue-500" />
                                                            {t('events.actions.postpone', 'تأجيل')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    {/* Archive/Unarchive */}
                                                    {!event.isArchived ? (
                                                        <DropdownMenuItem onClick={() => handleArchiveEvent(event.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                            <Archive className="h-4 w-4 ms-2 text-slate-500" />
                                                            {t('events.actions.archive', 'أرشفة')}
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleUnarchiveEvent(event.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                            <ArchiveRestore className="h-4 w-4 ms-2 text-blue-500" />
                                                            {t('events.actions.unarchive', 'إلغاء الأرشفة')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="text-red-600 focus:text-red-600 rounded-lg py-2.5 cursor-pointer bg-red-50/50 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4 ms-2" />
                                                        {t('events.actions.delete', 'حذف')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* View All Section */}
                        <div className="flex flex-col items-center gap-3 pt-4">
                            <Link
                                to={ROUTES.dashboard.tasks.events.list}
                                className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group py-2"
                            >
                                {t('events.list.viewAllEvents', 'عرض جميع الأحداث')}
                                <span className="text-xs text-slate-400">({events.length})</span>
                                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <TasksSidebar
                        context="events"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedEventIds.length}
                        onDeleteSelected={handleDeleteSelected}
                        onBulkComplete={handleBulkComplete}
                        onBulkArchive={handleBulkArchive}
                        onBulkUnarchive={handleBulkUnarchive}
                        onSelectAll={handleSelectAll}
                        totalTaskCount={events?.length || 0}
                        isBulkCompletePending={bulkCompleteMutation.isPending}
                        isBulkArchivePending={bulkArchiveMutation.isPending}
                        isBulkUnarchivePending={bulkUnarchiveMutation.isPending}
                        isViewingArchived={false}
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

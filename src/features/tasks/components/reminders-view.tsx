import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdaptiveSearchDebounce } from '@/hooks/useAdaptiveDebounce'
import { PERF_DEBUG, perfLog } from '@/lib/perf-debug'
import { TasksSidebar } from './tasks-sidebar'
import {
    Clock, MoreHorizontal, Plus, Filter,
    Calendar as CalendarIcon, Search, AlertCircle, ChevronLeft, Bell,
    Eye, Trash2, CheckCircle, XCircle, UserPlus, Loader2, ArrowUpDown, X, ArrowRight,
    Edit3, Copy, Archive, ArchiveRestore, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link, useNavigate } from '@tanstack/react-router'
import { useReminders, useDeleteReminder, useCompleteReminder, useDismissReminder, useSnoozeReminder, useDelegateReminder, useReminderStats, useUpdateReminder, useBulkCompleteReminders, useBulkArchiveReminders, useBulkUnarchiveReminders, useArchiveReminder, useUnarchiveReminder } from '@/hooks/useRemindersAndEvents'
import { useTeamMembers, useCases } from '@/hooks/useCasesAndClients'
import { Briefcase, User } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProductivityHero } from '@/components/productivity-hero'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    GosiCard,
    GosiInput,
    GosiSelect,
    GosiSelectContent,
    GosiSelectItem,
    GosiSelectTrigger,
    GosiSelectValue,
    GosiButton
} from '@/components/ui/gosi-ui'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

export function RemindersView() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()

    // Performance profiling
    const renderCount = useRef(0)
    const mountTime = useRef(performance.now())

    useEffect(() => {
        perfLog('RemindersView MOUNTED')
        return () => perfLog('RemindersView UNMOUNTED')
    }, [])

    renderCount.current++
    if (PERF_DEBUG && renderCount.current <= 5) {
        perfLog(`RemindersView RENDER #${renderCount.current}`, {
            timeSinceMount: (performance.now() - mountTime.current).toFixed(2) + 'ms'
        })
    }

    // Performance optimization: Defer filter dropdown data loading
    const [isFilterDataReady, setIsFilterDataReady] = useState(false)

    useEffect(() => {
        perfLog('Scheduling filter data load (200ms)')
        const timer = setTimeout(() => {
            perfLog('Filter data load TRIGGERED - loading teamMembers & cases')
            setIsFilterDataReady(true)
        }, 200)
        return () => clearTimeout(timer)
    }, [])

    // State
    const [activeTab, setActiveTab] = useState('upcoming')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedReminderIds, setSelectedReminderIds] = useState<string[]>([])
    const [showFilters, setShowFilters] = useState(false)
    const [visibleCount, setVisibleCount] = useState(10)

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [priorityFilter, setPriorityFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [assignedFilter, setAssignedFilter] = useState<string>('all')
    const [dueDateFilter, setDueDateFilter] = useState<string>('all')
    const [caseFilter, setCaseFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('reminderDateTime')

    // Gold Standard: Adaptive Debounce Search
    const { debouncedCallback: debouncedSetSearch, recordKeypress } = useAdaptiveSearchDebounce(
        (value: string) => {
            // Only search if empty (clear) or has at least 2 characters
            if (value === '' || value.trim().length >= 2) {
                setSearchQuery(value)
            }
        }
    )

    // API filters
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

        if (priorityFilter !== 'all') {
            f.priority = priorityFilter
        }

        if (typeFilter !== 'all') {
            f.type = typeFilter
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
    }, [activeTab, searchQuery, priorityFilter, typeFilter, assignedFilter, dueDateFilter, caseFilter, sortBy])

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
        if (!dateString) return { arabic: t('reminders.list.notSet'), english: t('reminders.list.notSet') }
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return { arabic: t('reminders.list.notSet'), english: t('reminders.list.notSet') }
        return {
            arabic: format(date, 'd MMMM', { locale: arSA }),
            english: format(date, 'MMM d, yyyy', { locale: enUS })
        }
    }, [t])

    // Smart date helper (like Tasks)
    const getSmartDate = useCallback((dateString: string | null | undefined) => {
        if (!dateString) return { label: t('reminders.list.notSet'), isOverdue: false, daysRemaining: null }
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return { label: t('reminders.list.notSet'), isOverdue: false, daysRemaining: null }

        const now = new Date()
        const isOverdue = isPast(date) && !isToday(date)
        const daysRemaining = differenceInDays(date, now)

        let label = ''
        if (isToday(date)) {
            label = t('reminders.smartDates.today', 'اليوم')
        } else if (isTomorrow(date)) {
            label = t('reminders.smartDates.tomorrow', 'غداً')
        } else if (isOverdue) {
            label = t('reminders.smartDates.overdue', 'متأخر')
        } else {
            label = format(date, 'd MMM', { locale: i18n.language === 'ar' ? arSA : enUS })
        }

        return { label, isOverdue, daysRemaining }
    }, [t, i18n.language])

    // Fetch reminders
    const { data: remindersData, isLoading, isError, error, refetch, isFetching } = useReminders(filters)
    const { data: stats, isFetching: statsFetching } = useReminderStats()
    const { mutateAsync: deleteReminder } = useDeleteReminder()
    const completeReminderMutation = useCompleteReminder()
    const dismissReminderMutation = useDismissReminder()
    const snoozeReminderMutation = useSnoozeReminder()
    const delegateReminderMutation = useDelegateReminder()
    const updateReminderMutation = useUpdateReminder()
    const bulkCompleteMutation = useBulkCompleteReminders()
    const bulkArchiveMutation = useBulkArchiveReminders()
    const bulkUnarchiveMutation = useBulkUnarchiveReminders()
    const archiveReminderMutation = useArchiveReminder()
    const unarchiveReminderMutation = useUnarchiveReminder()

    // Team members and cases for filter dropdowns (DEFERRED)
    const { data: teamMembers } = useTeamMembers(isFilterDataReady)
    const { data: casesData } = useCases(undefined, isFilterDataReady)

    // Performance: Track API load completion
    useEffect(() => {
        if (remindersData) perfLog('API LOADED: reminders', { count: remindersData?.reminders?.length })
    }, [remindersData])

    useEffect(() => {
        if (stats) perfLog('API LOADED: reminderStats', stats)
    }, [stats])

    useEffect(() => {
        if (teamMembers) perfLog('API LOADED: teamMembers (DEFERRED)', { count: teamMembers?.length })
    }, [teamMembers])

    useEffect(() => {
        if (casesData) perfLog('API LOADED: cases (DEFERRED)', { count: casesData?.cases?.length })
    }, [casesData])

    useEffect(() => {
        const fetchingStatus = { reminders: isFetching, stats: statsFetching }
        const activeFetches = Object.entries(fetchingStatus).filter(([, v]) => v).map(([k]) => k)
        if (activeFetches.length > 0) {
            perfLog('RemindersView FETCHING:', activeFetches)
        }
    }, [isFetching, statsFetching])

    // Delegate dialog state
    const [delegateReminderId, setDelegateReminderId] = useState<string | null>(null)
    const [delegateTo, setDelegateTo] = useState('')
    const [delegateNote, setDelegateNote] = useState('')

    // Single reminder actions
    const handleViewReminder = useCallback((reminderId: string) => {
        navigate({ to: ROUTES.dashboard.tasks.reminders.detail(reminderId) })
    }, [navigate])

    const handleEditReminder = useCallback((reminderId: string) => {
        navigate({ to: ROUTES.dashboard.tasks.reminders.edit(reminderId) })
    }, [navigate])

    const handleDeleteReminder = useCallback(async (reminderId: string) => {
        const confirmMessage = i18n.language === 'ar'
            ? 'هل أنت متأكد من حذف هذا التذكير؟ | Are you sure you want to delete this reminder?'
            : 'Are you sure you want to delete this reminder? | هل أنت متأكد من حذف هذا التذكير؟'
        if (confirm(confirmMessage)) {
            try {
                await deleteReminder(reminderId)
                toast.success(t('reminders.toast.deleteSingleSuccess'))
            } catch (error) {
                toast.error(t('reminders.toast.deleteFailed'))
            }
        }
    }, [t, deleteReminder, i18n.language])

    const handleCompleteReminder = useCallback((reminderId: string) => {
        completeReminderMutation.mutate(reminderId)
    }, [completeReminderMutation])

    const handleDismissReminder = useCallback((reminderId: string) => {
        dismissReminderMutation.mutate(reminderId)
    }, [dismissReminderMutation])

    const handleSnoozeReminder = useCallback((reminderId: string, duration: number) => {
        snoozeReminderMutation.mutate({ id: reminderId, duration })
    }, [snoozeReminderMutation])

    const handleDelegateReminder = useCallback(() => {
        if (!delegateReminderId || !delegateTo) return
        delegateReminderMutation.mutate(
            { id: delegateReminderId, delegateTo, note: delegateNote || undefined },
            {
                onSuccess: () => {
                    setDelegateReminderId(null)
                    setDelegateTo('')
                    setDelegateNote('')
                }
            }
        )
    }, [delegateReminderId, delegateTo, delegateNote, delegateReminderMutation])

    const handlePriorityChange = useCallback((reminderId: string, priority: string) => {
        updateReminderMutation.mutate({ id: reminderId, data: { priority: priority as 'low' | 'medium' | 'high' | 'critical' } })
    }, [updateReminderMutation])

    const handleArchiveReminder = useCallback((reminderId: string) => {
        archiveReminderMutation.mutate(reminderId)
    }, [archiveReminderMutation])

    const handleUnarchiveReminder = useCallback((reminderId: string) => {
        unarchiveReminderMutation.mutate(reminderId)
    }, [unarchiveReminderMutation])

    // Transform API data
    const reminders = useMemo(() => {
        if (!remindersData?.data) return []

        return remindersData.data.map((reminder: any) => {
            const reminderDate = reminder.reminderDateTime || reminder.reminderDate
            const dateLocale = i18n.language === 'ar' ? 'ar-SA' : 'en-US'
            const smartDate = getSmartDate(reminderDate)
            return {
                id: reminder._id,
                title: reminder.title || reminder.description || t('reminders.list.untitledReminder'),
                date: reminderDate ? new Date(reminderDate).toLocaleDateString(dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : t('reminders.list.notSet'),
                time: reminderDate ? new Date(reminderDate).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' }) : t('reminders.list.notSet'),
                priority: reminder.priority || 'medium',
                status: reminder.status || 'pending',
                reminderType: reminder.reminderType || reminder.type || 'general',
                isArchived: reminder.isArchived || false,
                createdAt: reminder.createdAt,
                reminderDateTime: reminderDate,
                reminderDateFormatted: formatDualDate(reminderDate),
                createdAtFormatted: formatDualDate(reminder.createdAt),
                smartDate,
                _id: reminder._id,
            }
        })
    }, [remindersData, i18n.language, t, formatDualDate, getSmartDate])

    // Load More Pagination
    const visibleReminders = useMemo(() => reminders.slice(0, visibleCount), [reminders, visibleCount])
    const hasMoreReminders = reminders.length > visibleCount
    const handleLoadMore = useCallback(() => setVisibleCount(prev => prev + 10), [])

    // Selection Handlers
    const handleToggleSelectionMode = useCallback(() => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedReminderIds([])
    }, [isSelectionMode])

    const handleSelectReminder = useCallback((id: string) => {
        if (selectedReminderIds.includes(id)) {
            setSelectedReminderIds(selectedReminderIds.filter(itemId => itemId !== id))
        } else {
            setSelectedReminderIds([...selectedReminderIds, id])
        }
    }, [selectedReminderIds])

    const handleSelectAll = useCallback(() => {
        if (!reminders) return
        if (selectedReminderIds.length === reminders.length && reminders.length > 0) {
            setSelectedReminderIds([])
        } else {
            setSelectedReminderIds(reminders.map(r => r.id))
        }
    }, [reminders, selectedReminderIds])

    const handleDeleteSelected = useCallback(async () => {
        if (selectedReminderIds.length === 0) return

        const confirmMessage = i18n.language === 'ar'
            ? `هل أنت متأكد من حذف ${selectedReminderIds.length} تذكيرات؟ | Are you sure you want to delete ${selectedReminderIds.length} reminders?`
            : `Are you sure you want to delete ${selectedReminderIds.length} reminders? | هل أنت متأكد من حذف ${selectedReminderIds.length} تذكيرات؟`

        if (confirm(confirmMessage)) {
            try {
                await Promise.all(selectedReminderIds.map(id => deleteReminder(id)))
                toast.success(t('reminders.toast.deleteSuccess', { count: selectedReminderIds.length }))
                setIsSelectionMode(false)
                setSelectedReminderIds([])
            } catch (error) {
                toast.error(t('reminders.toast.deleteError'))
            }
        }
    }, [selectedReminderIds, t, deleteReminder, i18n.language])

    const handleBulkComplete = useCallback(async () => {
        if (selectedReminderIds.length === 0) return

        const confirmMessage = i18n.language === 'ar'
            ? `هل أنت متأكد من إكمال ${selectedReminderIds.length} تذكيرات؟ | Are you sure you want to complete ${selectedReminderIds.length} reminders?`
            : `Are you sure you want to complete ${selectedReminderIds.length} reminders? | هل أنت متأكد من إكمال ${selectedReminderIds.length} تذكيرات؟`

        if (confirm(confirmMessage)) {
            bulkCompleteMutation.mutate(selectedReminderIds, {
                onSuccess: () => {
                    setIsSelectionMode(false)
                    setSelectedReminderIds([])
                }
            })
        }
    }, [selectedReminderIds, i18n.language, bulkCompleteMutation])

    const handleBulkArchive = useCallback(async () => {
        if (selectedReminderIds.length === 0) return

        const confirmMessage = i18n.language === 'ar'
            ? `هل أنت متأكد من أرشفة ${selectedReminderIds.length} تذكيرات؟ | Are you sure you want to archive ${selectedReminderIds.length} reminders?`
            : `Are you sure you want to archive ${selectedReminderIds.length} reminders? | هل أنت متأكد من أرشفة ${selectedReminderIds.length} تذكيرات؟`

        if (confirm(confirmMessage)) {
            bulkArchiveMutation.mutate(selectedReminderIds, {
                onSuccess: () => {
                    setIsSelectionMode(false)
                    setSelectedReminderIds([])
                }
            })
        }
    }, [selectedReminderIds, i18n.language, bulkArchiveMutation])

    const handleBulkUnarchive = useCallback(async () => {
        if (selectedReminderIds.length === 0) return

        const confirmMessage = i18n.language === 'ar'
            ? `هل أنت متأكد من إلغاء أرشفة ${selectedReminderIds.length} تذكيرات؟ | Are you sure you want to unarchive ${selectedReminderIds.length} reminders?`
            : `Are you sure you want to unarchive ${selectedReminderIds.length} reminders? | هل أنت متأكد من إلغاء أرشفة ${selectedReminderIds.length} تذكيرات؟`

        if (confirm(confirmMessage)) {
            bulkUnarchiveMutation.mutate(selectedReminderIds, {
                onSuccess: () => {
                    setIsSelectionMode(false)
                    setSelectedReminderIds([])
                }
            })
        }
    }, [selectedReminderIds, i18n.language, bulkUnarchiveMutation])

    const topNav = [
        { title: t('reminders.nav.overview'), href: ROUTES.dashboard.overview, isActive: false },
        { title: t('reminders.nav.tasks'), href: ROUTES.dashboard.tasks.list, isActive: false },
        { title: t('reminders.nav.reminders'), href: ROUTES.dashboard.tasks.reminders.list, isActive: true },
        { title: t('reminders.nav.events'), href: ROUTES.dashboard.tasks.events.list, isActive: false },
    ]

    return (
        <>
            <Header className="bg-navy shadow-none relative">
                <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

                {/* Dynamic Island - Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <DynamicIsland />
                </div>

                <div className='ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0'>
                    <div className="relative hidden md:block min-w-0">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
                        <input type="text" placeholder={t('tasks.list.search')} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                    </div>
                    <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy"></span>
                    </Button>
                    <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                    <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
                    <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
                    <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
                </div>
                {/* Bottom Gradient Line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            </Header>

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge={t('reminders.management')} title={t('reminders.title')} type="reminders" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR - Gold Standard: Collapsible with Toggle */}
                        <GosiCard className="p-4 md:p-6 rounded-[2rem]">
                            <div className="space-y-4">
                                {/* Top Row: Search + Filter Toggle */}
                                <div className="flex flex-col lg:flex-row gap-3">
                                    <div className="relative w-full">
                                        <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
                                        <GosiInput
                                            type="text"
                                            placeholder={t('reminders.list.searchPlaceholder')}
                                            defaultValue={searchQuery}
                                            onKeyDown={recordKeypress}
                                            onChange={(e) => debouncedSetSearch(e.target.value)}
                                            className="pe-12 h-14 w-full text-base"
                                            aria-label={t('reminders.list.searchPlaceholder')}
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
                                        <Filter className="h-5 w-5 ms-2" />
                                        {t('reminders.list.filters', 'تصفية')}
                                        {hasActiveFilters && (
                                            <span className="ms-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                                                !
                                            </span>
                                        )}
                                    </GosiButton>
                                </div>

                                {/* Collapsible Filters - Animated */}
                                <div className={`flex-wrap gap-4 transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'flex opacity-100 max-h-[500px] mt-4' : 'hidden opacity-0 max-h-0'}`}>

                                    {/* Status Filter */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={activeTab} onValueChange={setActiveTab}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('reminders.list.status')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="upcoming" className="font-bold">{t('reminders.list.upcoming')}</GosiSelectItem>
                                                <GosiSelectItem value="past" className="font-bold">{t('reminders.list.past')}</GosiSelectItem>
                                                <GosiSelectItem value="all" className="font-bold">{t('reminders.list.all', 'الكل')}</GosiSelectItem>
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Priority Filter */}
                                    <div className="flex-1 min-w-[240px]">
                                        <GosiSelect value={priorityFilter} onValueChange={setPriorityFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('reminders.list.priority')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('reminders.list.allPriorities')}</GosiSelectItem>
                                                <GosiSelectItem value="critical" className="font-bold">{t('reminders.list.critical')}</GosiSelectItem>
                                                <GosiSelectItem value="high" className="font-bold">{t('reminders.list.high')}</GosiSelectItem>
                                                <GosiSelectItem value="medium" className="font-bold">{t('reminders.list.medium')}</GosiSelectItem>
                                                <GosiSelectItem value="low" className="font-bold">{t('reminders.list.low')}</GosiSelectItem>
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Type Filter */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={typeFilter} onValueChange={setTypeFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <Bell className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('reminders.list.type')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('reminders.list.allTypes')}</GosiSelectItem>
                                                <GosiSelectItem value="general" className="font-bold">{t('reminders.list.general')}</GosiSelectItem>
                                                <GosiSelectItem value="hearing" className="font-bold">{t('reminders.list.courtHearing')}</GosiSelectItem>
                                                <GosiSelectItem value="deadline" className="font-bold">{t('reminders.list.filingDeadline')}</GosiSelectItem>
                                                <GosiSelectItem value="payment" className="font-bold">{t('reminders.list.paymentDue')}</GosiSelectItem>
                                                <GosiSelectItem value="follow_up" className="font-bold">{t('reminders.list.followUp')}</GosiSelectItem>
                                                <GosiSelectItem value="meeting" className="font-bold">{t('reminders.list.meeting', 'اجتماع')}</GosiSelectItem>
                                                <GosiSelectItem value="task_due" className="font-bold">{t('reminders.list.taskDue', 'مهمة')}</GosiSelectItem>
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Assigned To Filter */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={assignedFilter} onValueChange={setAssignedFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <User className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('tasks.list.assignedTo', 'المسند إليه')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('tasks.list.allAssignees', 'الكل')}</GosiSelectItem>
                                                <GosiSelectItem value="me" className="font-bold">{t('tasks.list.assignedToMe', 'مهامي')}</GosiSelectItem>
                                                <GosiSelectItem value="unassigned" className="font-bold">{t('tasks.list.unassigned', 'غير مسند')}</GosiSelectItem>
                                                {teamMembers?.map((member: any) => (
                                                    <GosiSelectItem key={member.id} value={member.id} className="font-bold">
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
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('tasks.list.dueDate', 'تاريخ الاستحقاق')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('tasks.list.allDates', 'الكل')}</GosiSelectItem>
                                                <GosiSelectItem value="today" className="font-bold">{t('tasks.list.today', 'اليوم')}</GosiSelectItem>
                                                <GosiSelectItem value="thisWeek" className="font-bold">{t('tasks.list.thisWeek', 'هذا الأسبوع')}</GosiSelectItem>
                                                <GosiSelectItem value="overdue" className="font-bold">{t('tasks.list.overdue', 'متأخر')}</GosiSelectItem>
                                                <GosiSelectItem value="noDueDate" className="font-bold">{t('tasks.list.noDueDate', 'بدون تاريخ')}</GosiSelectItem>
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Case Filter */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={caseFilter} onValueChange={setCaseFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <Briefcase className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('tasks.list.case', 'القضية')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('tasks.list.allCases', 'كل القضايا')}</GosiSelectItem>
                                                {casesData?.cases?.map((caseItem: any) => (
                                                    <GosiSelectItem key={caseItem.id} value={caseItem.id} className="font-bold">
                                                        {caseItem.title || caseItem.caseNumber}
                                                    </GosiSelectItem>
                                                ))}
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Sort By */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={sortBy} onValueChange={setSortBy}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <ArrowUpDown className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('reminders.list.sortBy')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="reminderDateTime" className="font-bold">{t('reminders.list.reminderDate')}</GosiSelectItem>
                                                <GosiSelectItem value="priority" className="font-bold">{t('reminders.list.priority')}</GosiSelectItem>
                                                <GosiSelectItem value="createdAt" className="font-bold">{t('reminders.list.creationDate')}</GosiSelectItem>
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Clear Filters */}
                                    {hasActiveFilters && (
                                        <div className="flex items-center">
                                            <GosiButton
                                                variant="ghost"
                                                onClick={clearFilters}
                                                className="h-14 w-full md:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-dashed border-red-200 px-6 hover:shadow-lg hover:shadow-red-500/10 transition-all"
                                            >
                                                <X className="h-5 w-5 ms-2" aria-hidden="true" />
                                                {t('reminders.list.clearFilters')}
                                            </GosiButton>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GosiCard>

                        {/* REMINDERS LIST */}
                        <div className="flex flex-col gap-4">
                            {/* Loading State - Gold Standard Skeleton */}
                            {isLoading && (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-5 w-5 rounded-full" />
                                                <Skeleton className="h-10 w-10 rounded-xl" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-48" />
                                                        <Skeleton className="h-5 w-16 rounded-full" />
                                                    </div>
                                                    <Skeleton className="h-3 w-24" />
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
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        {i18n.language === 'ar' ? 'خطأ في تحميل التذكيرات' : 'Error Loading Reminders'} | {i18n.language === 'ar' ? 'Error Loading Reminders' : 'خطأ في تحميل التذكيرات'}
                                    </h3>
                                    <p className="text-slate-500 mb-4 text-sm">
                                        {error?.message || (i18n.language === 'ar' ? 'فشل الاتصال بالخادم' : 'Connection to server failed')}
                                    </p>
                                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                        {i18n.language === 'ar' ? 'إعادة المحاولة' : 'Retry'} | {i18n.language === 'ar' ? 'Retry' : 'إعادة المحاولة'}
                                    </Button>
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoading && !isError && reminders.length === 0 && (
                                <div className="bg-white rounded-[2rem] p-12 border border-slate-100 text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                            <Bell className="w-8 h-8 text-emerald-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('reminders.list.noReminders', 'لا توجد تذكيرات')}</h3>
                                    <p className="text-slate-500 mb-4">{t('reminders.list.noRemindersDesc', 'أنت جاهز تماماً! لا توجد تذكيرات في الوقت الحالي.')}</p>
                                    <GosiButton asChild className="bg-emerald-500 hover:bg-emerald-600">
                                        <Link to={ROUTES.dashboard.tasks.reminders.new}>
                                            <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                            {t('reminders.list.newReminder', 'إضافة تذكير')}
                                        </Link>
                                    </GosiButton>
                                </div>
                            )}

                            {/* Success State - Gold Standard Card Design */}
                            {!isLoading && !isError && reminders.length > 0 && (
                                <>
                                    {visibleReminders.map((reminder, index) => (
                                        <div key={reminder.id} className="mb-2">
                                            <div
                                                onClick={() => handleViewReminder(reminder.id)}
                                                style={{ animationDelay: `${index * 50}ms` }}
                                                className={`
                                                    animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards
                                                    rounded-2xl p-3 md:p-4
                                                    border-0 ring-1 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
                                                    transition-all duration-300 group
                                                    hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-1
                                                    cursor-pointer relative overflow-hidden
                                                    ${reminder.smartDate.isOverdue && reminder.status !== 'completed'
                                                        ? 'bg-red-50/50 ring-red-200/50'
                                                        : selectedReminderIds.includes(reminder.id)
                                                            ? 'ring-2 ring-emerald-500 bg-emerald-50/20'
                                                            : 'bg-white ring-black/[0.03]'
                                                    }
                                                `}
                                            >
                                                {/* Priority Strip - Always Visible */}
                                                <div className={`absolute start-0 top-0 bottom-0 w-1.5 rounded-s-2xl transition-all duration-300 ${
                                                    reminder.priority === 'critical' ? 'bg-red-500' :
                                                    reminder.priority === 'high' ? 'bg-orange-500' :
                                                    reminder.priority === 'medium' ? 'bg-amber-400' :
                                                    'bg-emerald-400'
                                                }`} />

                                                <div className="flex items-center gap-3 ps-4">
                                                    {/* Selection Checkbox */}
                                                    {isSelectionMode && (
                                                        <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                                                            <Checkbox
                                                                checked={selectedReminderIds.includes(reminder.id)}
                                                                onCheckedChange={() => handleSelectReminder(reminder.id)}
                                                                className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-navy data-[state=checked]:border-navy flex-shrink-0 transition-all duration-200"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Reminder Icon */}
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 border ${
                                                        reminder.smartDate.isOverdue && reminder.status !== 'completed' ? 'bg-red-50 text-red-600 border-red-200' :
                                                        reminder.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                        'bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                                                    }`}>
                                                        {reminder.smartDate.isOverdue && reminder.status !== 'completed' ? <AlertTriangle className="h-5 w-5" strokeWidth={1.5} /> :
                                                         reminder.status === 'completed' ? <CheckCircle className="h-5 w-5" strokeWidth={1.5} /> :
                                                         <Bell className="h-5 w-5" strokeWidth={1.5} />}
                                                    </div>

                                                    {/* Reminder Info */}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className={`font-bold text-sm md:text-base group-hover:text-emerald-900 transition-colors truncate leading-tight ${reminder.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                                {reminder.title}
                                                            </h4>

                                                            {/* Status Badges */}
                                                            {reminder.status !== 'completed' && reminder.smartDate.isOverdue && (
                                                                <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                                    {t('reminders.smartDates.overdue', 'متأخر')}
                                                                </div>
                                                            )}

                                                            {reminder.status === 'completed' && (
                                                                <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    {t('reminders.statuses.completed', 'مكتمل')}
                                                                </div>
                                                            )}

                                                            {reminder.priority === 'critical' && reminder.status !== 'completed' && (
                                                                <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                                                    <AlertCircle className="w-3 h-3" />
                                                                    {t('reminders.list.critical')}
                                                                </div>
                                                            )}

                                                            {/* Type Badge */}
                                                            {reminder.reminderType && reminder.reminderType !== 'general' && (
                                                                <div className="bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                                                    {t(`reminders.types.${reminder.reminderType}`, reminder.reminderType)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-slate-500 text-xs font-medium flex items-center gap-1">
                                                                <Clock className="w-3 h-3 text-emerald-500" />
                                                                {reminder.time}
                                                            </p>
                                                            <span className="text-slate-300">•</span>
                                                            <p className="text-slate-500 text-xs font-medium flex items-center gap-1">
                                                                <CalendarIcon className="w-3 h-3 text-emerald-500" />
                                                                {reminder.reminderDateFormatted.arabic}
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
                                                            checked={reminder.status === 'completed'}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) handleCompleteReminder(reminder.id)
                                                            }}
                                                            disabled={reminder.status === 'completed'}
                                                            className="h-5 w-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-all duration-200 hover:border-emerald-400 me-2"
                                                        />
                                                    </div>

                                                    {/* 3-Dots Menu */}
                                                    <div className="hidden md:flex" onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy hover:bg-slate-100 rounded-xl">
                                                                    <MoreHorizontal className="h-6 w-6" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-0 ring-1 ring-black/5">
                                                                <DropdownMenuItem onClick={() => handleEditReminder(reminder.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                                    <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                                                    {t('reminders.list.edit', 'تعديل')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleViewReminder(reminder.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                                    <Eye className="h-4 w-4 ms-2" />
                                                                    {t('reminders.list.viewDetails', 'عرض التفاصيل')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {reminder.status !== 'completed' && (
                                                                    <DropdownMenuItem onClick={() => handleCompleteReminder(reminder.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                                        <CheckCircle className="h-4 w-4 ms-2 text-emerald-500" />
                                                                        {t('reminders.list.complete', 'إكمال')}
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {reminder.status !== 'completed' && (
                                                                    <DropdownMenuItem onClick={() => handleDismissReminder(reminder.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                                        <XCircle className="h-4 w-4 ms-2 text-amber-500" />
                                                                        {t('reminders.list.dismiss', 'تجاهل')}
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => setDelegateReminderId(reminder.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                                    <UserPlus className="h-4 w-4 ms-2 text-purple-500" />
                                                                    {t('reminders.list.delegate', 'تفويض')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {/* Archive/Unarchive */}
                                                                {!reminder.isArchived ? (
                                                                    <DropdownMenuItem onClick={() => handleArchiveReminder(reminder.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                                        <Archive className="h-4 w-4 ms-2 text-slate-500" />
                                                                        {t('reminders.actions.archive', 'أرشفة')}
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    <DropdownMenuItem onClick={() => handleUnarchiveReminder(reminder.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                                        <ArchiveRestore className="h-4 w-4 ms-2 text-blue-500" />
                                                                        {t('reminders.actions.unarchive', 'إلغاء الأرشفة')}
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteReminder(reminder.id)}
                                                                    className="text-red-600 focus:text-red-600 rounded-lg py-2.5 cursor-pointer bg-red-50/50 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4 ms-2" />
                                                                    {t('reminders.list.delete', 'حذف')}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>

                                                {/* Card Footer */}
                                                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 ps-4">
                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        {/* Priority Chip */}
                                                        <GosiSelect
                                                            value={reminder.priority}
                                                            onValueChange={(value) => handlePriorityChange(reminder.id, value)}
                                                        >
                                                            <GosiSelectTrigger className={`w-auto min-w-[80px] h-6 text-[10px] font-bold rounded-md border-0 px-2 ${
                                                                reminder.priority === 'critical' ? 'bg-red-50 text-red-700' :
                                                                reminder.priority === 'high' ? 'bg-orange-50 text-orange-700' :
                                                                reminder.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
                                                                'bg-emerald-50 text-emerald-700'
                                                            }`}>
                                                                <GosiSelectValue />
                                                            </GosiSelectTrigger>
                                                            <GosiSelectContent>
                                                                <GosiSelectItem value="critical" className="text-red-700 focus:bg-red-50">{t('reminders.list.critical')}</GosiSelectItem>
                                                                <GosiSelectItem value="high" className="text-orange-700 focus:bg-orange-50">{t('reminders.list.high')}</GosiSelectItem>
                                                                <GosiSelectItem value="medium" className="text-amber-700 focus:bg-amber-50">{t('reminders.list.medium')}</GosiSelectItem>
                                                                <GosiSelectItem value="low" className="text-emerald-700 focus:bg-emerald-50">{t('reminders.list.low')}</GosiSelectItem>
                                                            </GosiSelectContent>
                                                        </GosiSelect>

                                                        {/* Smart Date Chip */}
                                                        <div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md font-bold ${
                                                            reminder.smartDate.isOverdue && reminder.status !== 'completed' ? 'bg-red-100 text-red-700' :
                                                            reminder.smartDate.daysRemaining !== null && reminder.smartDate.daysRemaining <= 2 ? 'bg-amber-100 text-amber-700' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {reminder.smartDate.isOverdue && reminder.status !== 'completed' ? (
                                                                <AlertTriangle className="w-3 h-3" />
                                                            ) : reminder.smartDate.daysRemaining !== null && reminder.smartDate.daysRemaining <= 2 ? (
                                                                <Clock className="w-3 h-3" />
                                                            ) : (
                                                                <CalendarIcon className="w-3 h-3" />
                                                            )}
                                                            <span>{reminder.smartDate.label}</span>
                                                        </div>
                                                    </div>

                                                    <Link to={ROUTES.dashboard.tasks.reminders.detail(reminder.id)} className="hidden sm:inline-flex" onClick={(e) => e.stopPropagation()}>
                                                        <GosiButton size="sm" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border-0 rounded-md px-3 h-6 text-[10px] transition-all group/btn">
                                                            {t('reminders.list.viewDetails', 'عرض التفاصيل')}
                                                            <ArrowRight className="w-3 h-3 ms-1 rtl:rotate-180 transition-transform group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5" />
                                                        </GosiButton>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Load More Section */}
                                    <div className="flex flex-col items-center gap-3 pt-4">
                                        {hasMoreReminders && (
                                            <GosiButton
                                                onClick={handleLoadMore}
                                                variant="outline"
                                                className="w-full max-w-sm h-12 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-600 font-bold transition-all"
                                            >
                                                <Plus className="w-5 h-5 ms-2" />
                                                {t('reminders.list.showMore', 'عرض المزيد')}
                                                <span className="text-xs text-slate-400 ms-2">
                                                    ({visibleCount} / {reminders.length})
                                                </span>
                                            </GosiButton>
                                        )}

                                        <Link
                                            to={ROUTES.dashboard.tasks.reminders.list}
                                            className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group py-2"
                                        >
                                            {t('reminders.list.viewAllReminders', 'عرض جميع التذكيرات')}
                                            <span className="text-xs text-slate-400">({reminders.length})</span>
                                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) - Gold Standard Sidebar */}
                    <TasksSidebar
                        context="reminders"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedReminderIds.length}
                        onDeleteSelected={handleDeleteSelected}
                        onBulkComplete={handleBulkComplete}
                        onBulkArchive={handleBulkArchive}
                        onBulkUnarchive={handleBulkUnarchive}
                        onSelectAll={handleSelectAll}
                        totalTaskCount={reminders?.length || 0}
                        isBulkCompletePending={bulkCompleteMutation.isPending}
                        isBulkArchivePending={bulkArchiveMutation.isPending}
                        isBulkUnarchivePending={bulkUnarchiveMutation.isPending}
                        isViewingArchived={false}
                    />
                </div>
            </Main>

            {/* Delegate Reminder Dialog */}
            <Dialog open={!!delegateReminderId} onOpenChange={(open) => !open && setDelegateReminderId(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('reminders.delegate.title')}</DialogTitle>
                        <DialogDescription>
                            {t('reminders.delegate.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('reminders.delegate.delegateTo')}</label>
                            <Select value={delegateTo} onValueChange={setDelegateTo}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder={t('reminders.delegate.selectTeamMember')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers && teamMembers.length > 0 ? (
                                        teamMembers.map((member) => (
                                            <SelectItem key={member._id} value={member._id}>
                                                {member.firstName} {member.lastName}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-slate-500 text-sm">
                                            {t('reminders.delegate.noTeamMembers')}
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('reminders.delegate.note')}</label>
                            <Textarea
                                placeholder={t('reminders.delegate.notePlaceholder')}
                                value={delegateNote}
                                onChange={(e) => setDelegateNote(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDelegateReminderId(null)}>
                            {t('reminders.delegate.cancel')}
                        </Button>
                        <Button
                            onClick={handleDelegateReminder}
                            disabled={!delegateTo || delegateReminderMutation.isPending}
                            className="bg-emerald-500 hover:bg-emerald-600"
                        >
                            {delegateReminderMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                                    {t('reminders.delegate.delegating')}
                                </>
                            ) : (
                                t('reminders.delegate.delegate')
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PERF_DEBUG, perfLog } from '@/lib/perf-debug'
import { TasksSidebar } from './tasks-sidebar'
import {
    Clock, MoreHorizontal, Plus,
    Calendar as CalendarIcon, Search, AlertCircle, ChevronLeft, Bell,
    Eye, Trash2, CheckCircle, XCircle, UserPlus, Loader2, SortAsc, X, ArrowRight
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
import { useReminders, useDeleteReminder, useCompleteReminder, useDismissReminder, useSnoozeReminder, useDelegateReminder, useReminderStats, useUpdateReminder } from '@/hooks/useRemindersAndEvents'
import { useTeamMembers } from '@/hooks/useCasesAndClients'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { StatCard } from '@/components/stat-card'
import { ProductivityHero } from '@/components/productivity-hero'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
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
    GosiCardContent,
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
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { ROUTES } from '@/constants/routes'

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

    // Performance optimization: Defer team members loading
    // Only needed when user opens the delegate dialog
    const [isDelegationDataReady, setIsDelegationDataReady] = useState(false)

    useEffect(() => {
        perfLog('Scheduling delegation data load (250ms)')
        const timer = setTimeout(() => {
            perfLog('Delegation data load TRIGGERED - loading teamMembers')
            setIsDelegationDataReady(true)
        }, 250)
        return () => clearTimeout(timer)
    }, [])

    // Snooze options with translations
    const SNOOZE_OPTIONS = [
        { value: 15, label: t('reminders.list.snoozeOptions.15min') },
        { value: 30, label: t('reminders.list.snoozeOptions.30min') },
        { value: 60, label: t('reminders.list.snoozeOptions.1hour') },
        { value: 180, label: t('reminders.list.snoozeOptions.3hours') },
        { value: 1440, label: t('reminders.list.snoozeOptions.1day') },
        { value: 10080, label: t('reminders.list.snoozeOptions.1week') },
    ]
    const [activeTab, setActiveTab] = useState('upcoming')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedReminderIds, setSelectedReminderIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [priorityFilter, setPriorityFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('reminderDateTime')

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

        if (priorityFilter !== 'all') {
            f.priority = priorityFilter
        }

        if (typeFilter !== 'all') {
            f.reminderType = typeFilter
        }

        if (sortBy) {
            f.sortBy = sortBy
            f.sortOrder = sortBy === 'priority' ? 'desc' : 'asc'
        }

        return f
    }, [activeTab, searchQuery, priorityFilter, typeFilter, sortBy])

    // Check if any filter is active
    const hasActiveFilters = useMemo(() =>
        searchQuery || priorityFilter !== 'all' || typeFilter !== 'all',
        [searchQuery, priorityFilter, typeFilter]
    )

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchQuery('')
        setPriorityFilter('all')
        setTypeFilter('all')
    }, [])

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

    // Fetch reminders
    const { data: remindersData, isLoading, isError, error, refetch, isFetching } = useReminders(filters)
    const { data: stats, isFetching: statsFetching } = useReminderStats()
    const { mutateAsync: deleteReminder } = useDeleteReminder()
    const completeReminderMutation = useCompleteReminder()
    const dismissReminderMutation = useDismissReminder()
    const snoozeReminderMutation = useSnoozeReminder()
    const delegateReminderMutation = useDelegateReminder()
    const updateReminderMutation = useUpdateReminder()

    // Team members for delegation (DEFERRED - only needed when delegate dialog opens)
    const { data: teamMembers } = useTeamMembers(isDelegationDataReady)

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

    const handleDeleteReminder = useCallback(async (reminderId: string) => {
        if (confirm(t('reminders.list.deleteConfirm'))) {
            try {
                await deleteReminder(reminderId)
                toast.success(t('reminders.toast.deleteSingleSuccess'))
            } catch (error) {
                toast.error(t('reminders.toast.deleteFailed'))
            }
        }
    }, [t, deleteReminder])

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

    // Transform API data
    const reminders = useMemo(() => {
        if (!remindersData?.data) return []

        return remindersData.data.map((reminder: any) => {
            const reminderDate = reminder.reminderDateTime || reminder.reminderDate
            const dateLocale = i18n.language === 'ar' ? 'ar-SA' : 'en-US'
            return {
                id: reminder._id,
                title: reminder.title || reminder.description || t('reminders.list.untitledReminder'),
                date: reminderDate ? new Date(reminderDate).toLocaleDateString(dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : t('reminders.list.notSet'),
                time: reminderDate ? new Date(reminderDate).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' }) : t('reminders.list.notSet'),
                priority: reminder.priority || 'medium',
                status: reminder.status || 'pending',
                reminderType: reminder.reminderType || reminder.type || 'general',
                createdAt: reminder.createdAt,
                reminderDateTime: reminderDate,
                reminderDateFormatted: formatDualDate(reminderDate),
                createdAtFormatted: formatDualDate(reminder.createdAt),
                _id: reminder._id,
            }
        })
    }, [remindersData])

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

    const handleDeleteSelected = useCallback(async () => {
        if (selectedReminderIds.length === 0) return

        if (confirm(t('reminders.list.deleteMultipleConfirm', { count: selectedReminderIds.length }))) {
            try {
                // Loop delete since no bulk API yet
                await Promise.all(selectedReminderIds.map(id => deleteReminder(id)))
                toast.success(t('reminders.toast.deleteSuccess', { count: selectedReminderIds.length }))
                setIsSelectionMode(false)
                setSelectedReminderIds([])
            } catch (error) {
                toast.error(t('reminders.toast.deleteError'))
            }
        }
    }, [selectedReminderIds, t, deleteReminder])

    const topNav = [
        { title: t('reminders.nav.overview'), href: '/dashboard/overview', isActive: false },
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
                <ProductivityHero badge={t('reminders.management')} title={t('reminders.title')} type="reminders" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR - Responsive Flex Wrap */}
                        <GosiCard className="p-4 md:p-6 rounded-[2rem]">
                            <div className="flex flex-wrap items-center gap-3 transition-all duration-300 ease-in-out">
                                {/* Search Input */}
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
                                    <GosiInput
                                        type="text"
                                        placeholder={t('reminders.list.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pe-12 h-14 w-full text-base"
                                    />
                                </div>

                                {/* Status Filter (Tab Switcher) */}
                                <div className="flex-1 min-w-[150px]">
                                    <GosiSelect value={activeTab} onValueChange={setActiveTab}>
                                        <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{t('reminders.list.status')}:</span>
                                                <GosiSelectValue />
                                            </div>
                                        </GosiSelectTrigger>
                                        <GosiSelectContent>
                                            <GosiSelectItem value="upcoming">{t('reminders.list.upcoming')}</GosiSelectItem>
                                            <GosiSelectItem value="past">{t('reminders.list.past')}</GosiSelectItem>
                                        </GosiSelectContent>
                                    </GosiSelect>
                                </div>

                                {/* Priority Filter */}
                                <div className="flex-1 min-w-[150px]">
                                    <GosiSelect value={priorityFilter} onValueChange={setPriorityFilter}>
                                        <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{t('reminders.list.priority')}:</span>
                                                <GosiSelectValue />
                                            </div>
                                        </GosiSelectTrigger>
                                        <GosiSelectContent>
                                            <GosiSelectItem value="all">{t('reminders.list.allPriorities')}</GosiSelectItem>
                                            <GosiSelectItem value="critical">{t('reminders.list.critical')}</GosiSelectItem>
                                            <GosiSelectItem value="high">{t('reminders.list.high')}</GosiSelectItem>
                                            <GosiSelectItem value="medium">{t('reminders.list.medium')}</GosiSelectItem>
                                            <GosiSelectItem value="low">{t('reminders.list.low')}</GosiSelectItem>
                                        </GosiSelectContent>
                                    </GosiSelect>
                                </div>

                                {/* Type Filter */}
                                <div className="flex-1 min-w-[180px]">
                                    <GosiSelect value={typeFilter} onValueChange={setTypeFilter}>
                                        <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{t('reminders.list.type')}:</span>
                                                <GosiSelectValue />
                                            </div>
                                        </GosiSelectTrigger>
                                        <GosiSelectContent>
                                            <GosiSelectItem value="all">{t('reminders.list.allTypes')}</GosiSelectItem>
                                            <GosiSelectItem value="general">{t('reminders.list.general')}</GosiSelectItem>
                                            <GosiSelectItem value="court_hearing">{t('reminders.list.courtHearing')}</GosiSelectItem>
                                            <GosiSelectItem value="filing_deadline">{t('reminders.list.filingDeadline')}</GosiSelectItem>
                                            <GosiSelectItem value="payment_due">{t('reminders.list.paymentDue')}</GosiSelectItem>
                                            <GosiSelectItem value="follow_up">{t('reminders.list.followUp')}</GosiSelectItem>
                                        </GosiSelectContent>
                                    </GosiSelect>
                                </div>

                                {/* Sort By */}
                                <div className="flex-[0.5] min-w-[160px]">
                                    <GosiSelect value={sortBy} onValueChange={setSortBy}>
                                        <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all">
                                            <div className="flex items-center gap-2 truncate">
                                                <SortAsc className="h-4 w-4 text-emerald-500" />
                                                <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{t('reminders.list.sortBy')}:</span>
                                                <GosiSelectValue />
                                            </div>
                                        </GosiSelectTrigger>
                                        <GosiSelectContent>
                                            <GosiSelectItem value="reminderDateTime">{t('reminders.list.reminderDate')}</GosiSelectItem>
                                            <GosiSelectItem value="priority">{t('reminders.list.priority')}</GosiSelectItem>
                                            <GosiSelectItem value="createdAt">{t('reminders.list.creationDate')}</GosiSelectItem>
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
                                        {t('reminders.list.clearFilters')}
                                    </GosiButton>
                                )}
                            </div>
                        </GosiCard>

                        {/* REMINDERS LIST */}
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
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">خطأ في التحميل</h3>
                                    <p className="text-slate-500 mb-4">{error?.message || 'تعذر تحميل التذكيرات'}</p>
                                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                        إعادة المحاولة
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
                                        <Link to="{ROUTES.dashboard.tasks.reminders.new}">
                                            <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                            {t('reminders.list.newReminder', 'إضافة تذكير')}
                                        </Link>
                                    </GosiButton>
                                </div>
                            )}

                            {/* Success State */}
                            {!isLoading && !isError && reminders.map((reminder, index) => (
                                <div
                                    key={reminder.id}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    onClick={() => handleViewReminder(reminder.id)}
                                    className={`
                                        animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards
                                        bg-white rounded-[2rem] p-5 md:p-7
                                        border-0 ring-1 ring-black/[0.03] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]
                                        transition-all duration-300 group 
                                        hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 
                                        cursor-pointer relative overflow-hidden flex flex-col
                                        ${selectedReminderIds.includes(reminder.id) ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''}
                                    `}
                                >
                                    {/* Status Strip Indicator */}
                                    <div className={`absolute start-0 top-0 bottom-0 w-1.5 ${reminder.priority === 'critical' ? 'bg-red-500' :
                                        reminder.priority === 'high' ? 'bg-orange-500' :
                                            reminder.priority === 'medium' ? 'bg-amber-400' :
                                                'bg-emerald-400'
                                        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 ps-2">
                                        {/* LEFT SIDE: Checkbox + Icon + Info */}
                                        <div className="flex gap-5 items-start w-full md:w-auto">
                                            {isSelectionMode && (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedReminderIds.includes(reminder.id)}
                                                        onCheckedChange={() => handleSelectReminder(reminder.id)}
                                                        className="h-6 w-6 mt-1 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 flex-shrink-0 transition-all duration-200"
                                                    />
                                                </div>
                                            )}
                                            {/* Clean Slate Icon Box */}
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] bg-slate-50 flex items-center justify-center shadow-inner text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:scale-105 transition-all duration-300 flex-shrink-0 border border-slate-100 group-hover:border-emerald-100">
                                                <Bell className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.5} />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-slate-800 text-lg md:text-xl group-hover:text-emerald-800 transition-colors truncate leading-tight tracking-tight">{reminder.title}</h4>

                                                    {reminder.priority === 'critical' && (
                                                        <div className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-100 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm">
                                                            <AlertCircle className="w-3 h-3" />
                                                            {t('reminders.list.critical')}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
                                                    <span className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-emerald-500" />
                                                        {reminder.time}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <CalendarIcon className="w-4 h-4 text-emerald-500" />
                                                        {reminder.reminderDateFormatted.arabic}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Mobile Chevron Indicator - Animated */}
                                            <div className="md:hidden ms-auto text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-[-4px] transition-all duration-300 rtl:rotate-180 self-center">
                                                <ChevronLeft className="h-6 w-6 rtl:rotate-0 ltr:rotate-180" />
                                            </div>
                                        </div>

                                        {/* RIGHT SIDE: Action Menu (More actions) */}
                                        <div className="absolute end-4 top-4" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy hover:bg-slate-100 rounded-xl">
                                                        <MoreHorizontal className="h-6 w-6" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-0 ring-1 ring-black/5">
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

                                        {/* Desktop Action Button */}
                                        <div className="hidden sm:inline-flex w-auto mt-auto self-center" onClick={(e) => e.stopPropagation()}>
                                            <GosiButton onClick={() => handleViewReminder(reminder.id)} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 hover:border-emerald-500 rounded-xl px-6 h-10 shadow-sm hover:shadow-lg hover:shadow-emerald-500/20 w-auto transition-all duration-300 hover:scale-105 active:scale-95 group/btn">
                                                {t('reminders.list.viewDetails', 'عرض التفاصيل')}
                                                <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180 transition-transform group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1" />
                                            </GosiButton>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 pt-0 text-center">
                            <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-2xl py-6 border border-dashed border-emerald-200 hover:border-emerald-300">
                                {t('reminders.list.viewAllReminders', 'عرض جميع التذكيرات')}
                                <ChevronLeft className="h-4 w-4 me-2" aria-hidden="true" />
                            </Button>
                        </div>
                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <TasksSidebar
                        context="reminders"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedReminderIds.length}
                        onDeleteSelected={handleDeleteSelected}
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

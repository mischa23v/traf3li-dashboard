/**
 * Tasks List View Component
 *
 * API Endpoints Status:
 * ✅ GET /api/tasks - Fetch tasks with filters (IMPLEMENTED)
 * ✅ GET /api/tasks/stats - Fetch task statistics (IMPLEMENTED)
 * ✅ PATCH /api/tasks/:id - Update task (IMPLEMENTED)
 * ✅ PATCH /api/tasks/:id/status - Update task status (IMPLEMENTED)
 * ✅ DELETE /api/tasks/:id - Delete task (IMPLEMENTED)
 * ✅ DELETE /api/tasks/bulk - Bulk delete tasks (IMPLEMENTED)
 * ✅ GET /api/cases - Fetch cases for filters (IMPLEMENTED)
 * ✅ GET /api/lawyers/team - Fetch team members (IMPLEMENTED)
 *
 * External Services:
 * ⚠️ AI Worker (VITE_AI_WORKER_URL) - External AI service for task suggestions
 *    - Gracefully disabled if not configured
 *    - Has proper error handling and timeout (30s)
 *
 * All error messages are bilingual (English | Arabic)
 */

import { TasksSidebar } from './tasks-sidebar'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebouncedCallback } from 'use-debounce'
import { PERF_DEBUG, perfLog } from '@/lib/perf-debug'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { ProductivityHero } from '@/components/productivity-hero'
import { useTasks, useTaskStats, useBulkDeleteTasks } from '@/hooks/useTasks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Search, Bell, AlertCircle, Briefcase, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2, CheckCircle, XCircle, Edit3, Calendar, SortAsc, Filter, X, ArrowRight, ArrowUpDown, Clock, AlertTriangle, User, Sparkles, Lightbulb, RefreshCw, Loader2 } from 'lucide-react'
import { differenceInDays, isToday, isTomorrow, isThisWeek, isPast, startOfDay } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { useDeleteTask, useUpdateTaskStatus, useUpdateTask } from '@/hooks/useTasks'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import { Input } from '@/components/ui/input' // Keep for types if needed, but prefer GosiInput
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCases } from '@/hooks/useCasesAndClients'
import { useTeamMembers } from '@/hooks/useStaff'

// AI Suggestion Types
interface AiTaskInput {
    title: string
    priority: string
    dueDate: string | null
    status: string
}

interface AiSuggestionRequest {
    tasks: AiTaskInput[]
    language: string
}

interface AiSuggestionResponse {
    suggestion: string
}

// AI Worker URL from environment variable (no fallback - AI disabled if not set)
const AI_WORKER_URL = import.meta.env.VITE_AI_WORKER_URL

export function TasksListView() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [activeStatusTab, setActiveStatusTab] = useState('active')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [showFilters, setShowFilters] = useState(false) // New state for mobile filters
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [visibleCount, setVisibleCount] = useState(10) // Load-more pagination: show 10 at a time

    // AI Suggestion state
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiDismissed, setAiDismissed] = useState(false)
    const [aiError, setAiError] = useState(false)
    const aiLastFetch = useRef<number>(0)
    const aiHasFetched = useRef<boolean>(false) // Track if we've successfully fetched
    const aiAbortController = useRef<AbortController | null>(null) // For cleanup

    // Performance profiling
    const renderCount = useRef(0)
    const mountTime = useRef(performance.now())

    useEffect(() => {
        perfLog('TasksListView MOUNTED')
        return () => {
            perfLog('TasksListView UNMOUNTED')
            // Cleanup: abort any in-flight AI requests
            aiAbortController.current?.abort()
        }
    }, [])

    renderCount.current++
    if (PERF_DEBUG && renderCount.current <= 5) {
        perfLog(`TasksListView RENDER #${renderCount.current}`, {
            timeSinceMount: (performance.now() - mountTime.current).toFixed(2) + 'ms'
        })
    }

    // Performance optimization: Defer filter dropdown data loading
    // These are only needed when user interacts with filters, not on initial render
    const [isFilterDataReady, setIsFilterDataReady] = useState(false)

    useEffect(() => {
        // Defer loading of filter dropdown data by 200ms
        // This allows the main task list to render first
        perfLog('Scheduling filter data load (200ms)')
        const timer = setTimeout(() => {
            perfLog('Filter data load TRIGGERED - loading teamMembers & cases')
            setIsFilterDataReady(true)
        }, 200)
        return () => clearTimeout(timer)
    }, [])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [priorityFilter, setPriorityFilter] = useState<string>('all')
    const [assignedFilter, setAssignedFilter] = useState<string>('all')
    const [dueDateFilter, setDueDateFilter] = useState<string>('all')
    const [caseFilter, setCaseFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('dueDate')

    // Debounced search handler
    const debouncedSetSearch = useDebouncedCallback(
        (value: string) => setSearchQuery(value),
        300
    )

    // Fetch team members and cases for filter dropdowns (DEFERRED)
    const { data: teamMembers } = useTeamMembers(isFilterDataReady)
    const { data: casesData } = useCases(undefined, isFilterDataReady)

    // Mutations for task actions
    const deleteTaskMutation = useDeleteTask()
    const updateTaskStatusMutation = useUpdateTaskStatus()
    const updateTaskMutation = useUpdateTask()

    // AI Suggestion fetch function with proper cleanup, timeout, and rate limiting
    const fetchAiSuggestion = useCallback(async (taskList: any[], forceRefresh = false) => {
        // Check if AI Worker URL is configured - gracefully disable AI if not set
        if (!AI_WORKER_URL) {
            console.log('AI Worker URL not configured - AI suggestions disabled')
            return
        }

        // Rate limit: only fetch once per 10 minutes (unless force refresh)
        const now = Date.now()
        if (!forceRefresh && now - aiLastFetch.current < 10 * 60 * 1000 && aiHasFetched.current) {
            return
        }

        if (taskList.length === 0) {
            setAiSuggestion(null)
            return
        }

        // Abort any in-flight request
        aiAbortController.current?.abort()
        aiAbortController.current = new AbortController()

        setAiLoading(true)
        setAiError(false)

        // Create timeout (30 seconds - AI inference can take time)
        const timeoutId = setTimeout(() => {
            aiAbortController.current?.abort()
        }, 30000)

        try {
            const requestBody: AiSuggestionRequest = {
                tasks: taskList.slice(0, 10).map((t): AiTaskInput => ({
                    title: t.title,
                    priority: t.priority,
                    dueDate: t.dueDate,
                    status: t.status
                })),
                language: i18n.language
            }

            const response = await fetch(AI_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                signal: aiAbortController.current.signal
            })

            if (!response.ok) throw new Error('AI request failed')

            const data: AiSuggestionResponse = await response.json()
            setAiSuggestion(data.suggestion)
            aiLastFetch.current = now
            aiHasFetched.current = true
        } catch (err) {
            // Don't set error state if request was aborted (user navigated away or refreshed)
            if (err instanceof Error && err.name === 'AbortError') {
                console.log('AI suggestion request aborted')
                return
            }
            console.error('AI suggestion error:', err)
            setAiError(true)
        } finally {
            clearTimeout(timeoutId)
            setAiLoading(false)
        }
    }, [i18n.language]) // Removed aiSuggestion from deps to prevent recreation

    // API Filters - Map UI tabs to actual task status values
    // TaskStatus: 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled'
    const filters = useMemo(() => {
        const f: any = {}

        // Status filter
        if (activeStatusTab === 'active') {
            f.status = ['backlog', 'todo', 'in_progress']
        } else if (activeStatusTab === 'completed') {
            f.status = 'done'
        }

        // Search
        if (searchQuery.trim()) {
            f.search = searchQuery.trim()
        }

        // Priority
        if (priorityFilter !== 'all') {
            f.priority = priorityFilter
        }

        // Assigned To
        if (assignedFilter === 'me') {
            // This would need current user ID - for now we'll pass 'me' and let the API handle it
            f.assignedTo = 'me'
        } else if (assignedFilter === 'unassigned') {
            f.assignedTo = 'unassigned'
        } else if (assignedFilter !== 'all') {
            f.assignedTo = assignedFilter
        }

        // Case
        if (caseFilter !== 'all') {
            f.caseId = caseFilter
        }

        // Due Date
        if (dueDateFilter === 'today') {
            const today = new Date()
            f.dueDateFrom = today.toISOString().split('T')[0]
            f.dueDateTo = today.toISOString().split('T')[0]
        } else if (dueDateFilter === 'thisWeek') {
            const today = new Date()
            const endOfWeek = new Date(today)
            endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
            f.dueDateFrom = today.toISOString().split('T')[0]
            f.dueDateTo = endOfWeek.toISOString().split('T')[0]
        } else if (dueDateFilter === 'thisMonth') {
            const today = new Date()
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
            f.dueDateFrom = today.toISOString().split('T')[0]
            f.dueDateTo = endOfMonth.toISOString().split('T')[0]
        } else if (dueDateFilter === 'overdue') {
            f.overdue = true
        }

        // Sort
        if (sortBy === 'dueDate') {
            f.sortBy = 'dueDate'
            f.sortOrder = 'asc'
        } else if (sortBy === 'priority') {
            f.sortBy = 'priority'
            f.sortOrder = 'desc'
        } else if (sortBy === 'createdAt') {
            f.sortBy = 'createdAt'
            f.sortOrder = 'desc'
        } else if (sortBy === 'title') {
            f.sortBy = 'title'
            f.sortOrder = 'asc'
        }

        return f
    }, [activeStatusTab, searchQuery, priorityFilter, assignedFilter, dueDateFilter, caseFilter, sortBy])

    // Check if any filter is active
    const hasActiveFilters = useMemo(() =>
        searchQuery || priorityFilter !== 'all' || assignedFilter !== 'all' || dueDateFilter !== 'all' || caseFilter !== 'all',
        [searchQuery, priorityFilter, assignedFilter, dueDateFilter, caseFilter]
    )

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchQuery('')
        setPriorityFilter('all')
        setAssignedFilter('all')
        setDueDateFilter('all')
        setCaseFilter('all')
        setVisibleCount(10) // Reset pagination when clearing filters
    }, [])

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(10)
    }, [activeStatusTab, searchQuery, priorityFilter, assignedFilter, dueDateFilter, caseFilter, sortBy])

    // Fetch tasks
    const { data: tasksData, isLoading, isError, error, refetch, isFetching } = useTasks(filters)
    const { data: stats, isFetching: statsFetching } = useTaskStats()
    const { mutate: bulkDeleteTasks } = useBulkDeleteTasks()

    // Performance: Track API load completion
    useEffect(() => {
        if (tasksData) perfLog('API LOADED: tasks', { count: tasksData?.tasks?.length })
    }, [tasksData])

    useEffect(() => {
        if (stats) perfLog('API LOADED: taskStats', stats)
    }, [stats])

    useEffect(() => {
        if (teamMembers) perfLog('API LOADED: teamMembers (DEFERRED)', { count: teamMembers?.length })
    }, [teamMembers])

    useEffect(() => {
        if (casesData) perfLog('API LOADED: cases (DEFERRED)', { count: casesData?.cases?.length })
    }, [casesData])

    useEffect(() => {
        const fetchingStatus = { tasks: isFetching, stats: statsFetching }
        const activeFetches = Object.entries(fetchingStatus).filter(([, v]) => v).map(([k]) => k)
        if (activeFetches.length > 0) {
            perfLog('TasksListView FETCHING:', activeFetches)
        }
    }, [isFetching, statsFetching])

    // Fetch AI suggestion when tasks are loaded (only once per session or on refresh)
    useEffect(() => {
        if (tasksData?.tasks && tasksData.tasks.length > 0 && !aiDismissed && !aiSuggestion && !aiLoading) {
            fetchAiSuggestion(tasksData.tasks)
        }
    }, [tasksData?.tasks, aiDismissed, aiSuggestion, aiLoading, fetchAiSuggestion])

    // Helper function to format dates based on current locale
    const formatDualDate = useCallback((dateString: string | null | undefined) => {
        if (!dateString) return { arabic: t('tasks.list.notSet'), english: t('tasks.list.notSet') }
        const date = new Date(dateString)
        const locale = i18n.language === 'ar' ? arSA : enUS
        return {
            arabic: format(date, 'd MMMM', { locale: arSA }),
            english: format(date, 'MMM d, yyyy', { locale: enUS })
        }
    }, [t, i18n.language])

    // Smart date label helper - returns "اليوم", "غداً", "هذا الأسبوع", or formatted date
    const getSmartDateLabel = useCallback((dateString: string | null | undefined) => {
        if (!dateString) return { label: t('tasks.list.notSet'), isOverdue: false, daysRemaining: null }

        const date = startOfDay(new Date(dateString))
        const today = startOfDay(new Date())
        const daysRemaining = differenceInDays(date, today)
        const isOverdue = isPast(date) && !isToday(date)

        let label: string
        if (isToday(date)) {
            label = t('tasks.smartDates.today', 'اليوم')
        } else if (isTomorrow(date)) {
            label = t('tasks.smartDates.tomorrow', 'غداً')
        } else if (isOverdue) {
            label = t('tasks.smartDates.overdue', 'متأخر')
        } else if (isThisWeek(date)) {
            label = t('tasks.smartDates.thisWeek', 'هذا الأسبوع')
        } else if (daysRemaining > 0 && daysRemaining <= 7) {
            label = t('tasks.smartDates.daysRemaining', 'متبقي {{days}} أيام', { days: daysRemaining })
        } else {
            const locale = i18n.language === 'ar' ? arSA : enUS
            label = format(date, 'd MMM', { locale })
        }

        return { label, isOverdue, daysRemaining }
    }, [t, i18n.language])

    // Timeline status helper - on track, at risk, or overdue
    const getTimelineStatus = useCallback((dateString: string | null | undefined, status: string) => {
        if (status === 'done') return { status: 'completed', color: 'emerald', icon: CheckCircle }
        if (!dateString) return { status: 'no-date', color: 'slate', icon: Calendar }

        const date = startOfDay(new Date(dateString))
        const today = startOfDay(new Date())
        const daysRemaining = differenceInDays(date, today)

        if (isPast(date) && !isToday(date)) {
            return { status: 'overdue', color: 'red', icon: AlertTriangle }
        } else if (daysRemaining <= 2) {
            return { status: 'at-risk', color: 'amber', icon: Clock }
        } else {
            return { status: 'on-track', color: 'emerald', icon: CheckCircle }
        }
    }, [])

    // Transform API data
    const tasks = useMemo(() => {
        if (!tasksData?.tasks) return []

        return tasksData.tasks.map((task: any) => {
            const smartDate = getSmartDateLabel(task.dueDate)
            const timeline = getTimelineStatus(task.dueDate, task.status)

            return {
                id: task._id,
                title: task.title || task.description || t('tasks.list.notSet'),
                client: task.caseId?.clientId?.name || task.clientId?.name || t('tasks.list.notSet'),
                dueDate: task.dueDate,
                createdAt: task.createdAt,
                dueDateFormatted: formatDualDate(task.dueDate),
                createdAtFormatted: formatDualDate(task.createdAt),
                priority: task.priority || 'medium',
                status: task.status || 'backlog',
                linkedEventId: task.linkedEventId, // Task ↔ Event sync
                eventId: task.eventId, // Manual event link
                subtaskCount: task.subtasks?.length || 0,
                completedSubtasks: task.subtasks?.filter((s: any) => s.completed)?.length || 0,
                _id: task._id,
                // New smart fields
                smartDate,
                timeline,
                assignee: task.assignedTo,
                assigneeName: task.assignedTo?.name || task.assignedTo?.username,
                assigneeAvatar: task.assignedTo?.avatar,
                tags: task.tags || [],
            }
        })
    }, [tasksData, t, i18n.language, getSmartDateLabel, getTimelineStatus])

    // Visible tasks (paginated) - only render what's needed
    const visibleTasks = useMemo(() => {
        return tasks.slice(0, visibleCount)
    }, [tasks, visibleCount])

    // Check if there are more tasks to load
    const hasMoreTasks = tasks.length > visibleCount

    // Load more handler
    const handleLoadMore = useCallback(() => {
        setVisibleCount(prev => prev + 10)
    }, [])

    // Selection Handlers
    const handleToggleSelectionMode = useCallback(() => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedTaskIds([])
    }, [isSelectionMode])

    const handleSelectTask = useCallback((taskId: string) => {
        if (selectedTaskIds.includes(taskId)) {
            setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId))
        } else {
            setSelectedTaskIds([...selectedTaskIds, taskId])
        }
    }, [selectedTaskIds])

    const handleDeleteSelected = useCallback(() => {
        if (selectedTaskIds.length === 0) return

        const confirmMessage = i18n.language === 'ar'
            ? `هل أنت متأكد من حذف ${selectedTaskIds.length} مهمة؟ | Are you sure you want to delete ${selectedTaskIds.length} tasks?`
            : `Are you sure you want to delete ${selectedTaskIds.length} tasks? | هل أنت متأكد من حذف ${selectedTaskIds.length} مهمة؟`

        if (confirm(confirmMessage)) {
            bulkDeleteTasks(selectedTaskIds, {
                onSuccess: () => {
                    setIsSelectionMode(false)
                    setSelectedTaskIds([])
                }
            })
        }
    }, [selectedTaskIds, i18n.language, bulkDeleteTasks])

    // Single task actions
    const handleViewTask = useCallback((taskId: string) => {
        navigate({ to: '/dashboard/tasks/$taskId', params: { taskId } })
    }, [navigate])

    const handleEditTask = useCallback((taskId: string) => {
        navigate({ to: '/dashboard/tasks/create', search: { editId: taskId } } as any)
    }, [navigate])

    const handleDeleteTask = useCallback((taskId: string) => {
        const confirmMessage = i18n.language === 'ar'
            ? 'هل أنت متأكد من حذف هذه المهمة؟ | Are you sure you want to delete this task?'
            : 'Are you sure you want to delete this task? | هل أنت متأكد من حذف هذه المهمة؟'

        if (confirm(confirmMessage)) {
            deleteTaskMutation.mutate(taskId)
        }
    }, [i18n.language, deleteTaskMutation])

    const handleCompleteTask = useCallback((taskId: string) => {
        // Using updateTaskStatusMutation (PATCH) instead of completeTaskMutation (POST)
        // to avoid CSRF token issues since PATCH requests work without CSRF
        updateTaskStatusMutation.mutate({ id: taskId, status: 'done' })
    }, [updateTaskStatusMutation])

    const handleReopenTask = useCallback((taskId: string) => {
        // Using updateTaskStatusMutation (PATCH) instead of reopenTaskMutation (POST)
        // to avoid CSRF token issues since PATCH requests work without CSRF
        updateTaskStatusMutation.mutate({ id: taskId, status: 'in_progress' })
    }, [updateTaskStatusMutation])

    const handlePriorityChange = useCallback((taskId: string, priority: string) => {
        updateTaskMutation.mutate({ id: taskId, data: { priority: priority as any } })
    }, [updateTaskMutation])

    const topNav = [
        { title: t('tasks.nav.overview'), href: '/dashboard/overview', isActive: false },
        { title: t('tasks.nav.tasks'), href: '/dashboard/tasks/list', isActive: true },
        { title: t('tasks.nav.cases'), href: '/dashboard/cases', isActive: false },
        { title: t('tasks.nav.clients'), href: '/dashboard/clients', isActive: false },
    ]

    return (
        <>
            {/* ... Header ... */}
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
                <ProductivityHero badge={t('tasks.management')} title={t('tasks.title')} type="tasks" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR - Responsive Collapsible Grid */}
                        <GosiCard className="p-4 md:p-6 rounded-[2rem]">
                            <div className="space-y-4">
                                {/* Top Row: Search + Mobile Filter Toggle */}
                                <div className="flex flex-col lg:flex-row gap-3">
                                    <div className="relative w-full">
                                        <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
                                        <GosiInput
                                            type="text"
                                            placeholder={t('tasks.list.searchPlaceholder')}
                                            defaultValue={searchQuery}
                                            onChange={(e) => debouncedSetSearch(e.target.value)}
                                            className="pe-12 h-14 w-full text-base"
                                        />
                                    </div>

                                    {/* Filter Toggle Button - All screen sizes */}
                                    <GosiButton
                                        variant={showFilters || hasActiveFilters ? "default" : "outline"}
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`h-14 w-full sm:w-auto px-6 whitespace-nowrap transition-all ${showFilters || hasActiveFilters ? 'bg-navy text-white border-navy' : ''}`}
                                    >
                                        <Filter className="h-5 w-5 ms-2" />
                                        {t('tasks.list.filters', 'تصفية')}
                                        {hasActiveFilters && (
                                            <span className="ms-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                                                !
                                            </span>
                                        )}
                                    </GosiButton>
                                </div>

                                {/* filters container - Animated slide with smooth transitions */}
                                <div className={`flex-wrap gap-4 transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'flex opacity-100 max-h-[500px] mt-4' : 'hidden opacity-0 max-h-0'}`}>

                                    {/* Status */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={activeStatusTab} onValueChange={setActiveStatusTab}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('tasks.list.status')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="active" className="font-bold">{t('tasks.list.active')}</GosiSelectItem>
                                                <GosiSelectItem value="completed" className="font-bold">{t('tasks.list.completed')}</GosiSelectItem>
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Priority - Extra Wide for Arabic */}
                                    <div className="flex-1 min-w-[240px]">
                                        <GosiSelect value={priorityFilter} onValueChange={setPriorityFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('tasks.list.priorityLabel')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('tasks.list.allPriorities')}</GosiSelectItem>
                                                <GosiSelectItem value="urgent" className="font-bold">{t('tasks.priorities.urgent')}</GosiSelectItem>
                                                <GosiSelectItem value="high" className="font-bold">{t('tasks.priorities.high')}</GosiSelectItem>
                                                <GosiSelectItem value="medium" className="font-bold">{t('tasks.priorities.medium')}</GosiSelectItem>
                                                <GosiSelectItem value="low" className="font-bold">{t('tasks.priorities.low')}</GosiSelectItem>
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Assigned To */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={assignedFilter} onValueChange={setAssignedFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('tasks.list.responsible')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('tasks.list.all')}</GosiSelectItem>
                                                <GosiSelectItem value="me" className="font-bold">{t('tasks.list.myTasks')}</GosiSelectItem>
                                                <GosiSelectItem value="unassigned" className="font-bold">{t('tasks.list.unassigned')}</GosiSelectItem>
                                                {teamMembers?.map((member: any) => (
                                                    <GosiSelectItem key={member._id} value={member._id} className="font-bold">
                                                        {member.name || member.email}
                                                    </GosiSelectItem>
                                                ))}
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Due Date */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={dueDateFilter} onValueChange={setDueDateFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <Calendar className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('tasks.list.dueDate')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('tasks.list.allDates')}</GosiSelectItem>
                                                <GosiSelectItem value="today" className="font-bold">{t('tasks.list.today')}</GosiSelectItem>
                                                <GosiSelectItem value="thisWeek" className="font-bold">{t('tasks.list.thisWeek')}</GosiSelectItem>
                                                <GosiSelectItem value="thisMonth" className="font-bold">{t('tasks.list.thisMonth')}</GosiSelectItem>
                                                <GosiSelectItem value="overdue" className="font-bold">{t('tasks.list.overdue')}</GosiSelectItem>
                                                <GosiSelectItem value="noDueDate" className="font-bold">{t('tasks.list.noDueDate')}</GosiSelectItem>
                                            </GosiSelectContent>
                                        </GosiSelect>
                                    </div>

                                    {/* Case Filter */}
                                    <div className="flex-1 min-w-[220px]">
                                        <GosiSelect value={caseFilter} onValueChange={setCaseFilter}>
                                            <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all text-xs font-bold text-slate-950">
                                                <div className="flex items-center gap-2 truncate">
                                                    <Briefcase className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('tasks.list.case')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="all" className="font-bold">{t('tasks.list.allCases')}</GosiSelectItem>
                                                {casesData?.cases?.map((caseItem: any) => (
                                                    <GosiSelectItem key={caseItem._id} value={caseItem._id} className="font-bold">
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
                                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">{t('tasks.list.sortBy')}:</span>
                                                    <GosiSelectValue />
                                                </div>
                                            </GosiSelectTrigger>
                                            <GosiSelectContent>
                                                <GosiSelectItem value="dueDate" className="font-bold">{t('tasks.list.dueDate')}</GosiSelectItem>
                                                <GosiSelectItem value="createdAt" className="font-bold">{t('tasks.list.creationDate')}</GosiSelectItem>
                                                <GosiSelectItem value="priority" className="font-bold">{t('tasks.list.priorityLabel')}</GosiSelectItem>
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
                                                {t('tasks.list.clearFilters')}
                                            </GosiButton>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GosiCard>

                        {/* AI SUGGESTION CARD */}
                        {!aiDismissed && (aiLoading || aiSuggestion || aiError) && (
                            <div
                                className="
                                    animate-in fade-in slide-in-from-bottom-4 duration-500
                                    rounded-2xl p-3 md:p-4
                                    border-0 ring-1 ring-black/[0.03] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
                                    transition-all duration-300 group
                                    hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-0.5
                                    bg-gradient-to-br from-white to-emerald-50/30 relative overflow-hidden
                                "
                            >
                                {/* Emerald accent strip on left */}
                                <div className="absolute start-0 top-0 bottom-0 w-1.5 rounded-s-2xl bg-gradient-to-b from-emerald-400 to-emerald-600" />

                                <div className="flex items-start gap-3 ps-4">
                                    {/* AI Icon */}
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600 border border-emerald-200 flex-shrink-0">
                                        {aiLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
                                        ) : (
                                            <Sparkles className="h-5 w-5" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    {/* AI Content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                {i18n.language === 'ar' ? 'اقتراح ذكي' : 'AI Suggestion'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {aiLoading ? (
                                                <span className="text-slate-500">
                                                    {i18n.language === 'ar' ? 'جاري تحليل المهام... | Analyzing your tasks...' : 'Analyzing your tasks... | جاري تحليل المهام...'}
                                                </span>
                                            ) : aiError ? (
                                                <span className="text-red-500">
                                                    {i18n.language === 'ar' ? 'حدث خطأ. انقر للمحاولة مرة أخرى. | Error occurred. Click to retry.' : 'Error occurred. Click to retry. | حدث خطأ. انقر للمحاولة مرة أخرى.'}
                                                </span>
                                            ) : (
                                                aiSuggestion
                                            )}
                                        </p>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 mt-3">
                                            <button
                                                onClick={() => {
                                                    setAiSuggestion(null)
                                                    setAiError(false)
                                                    if (tasksData?.tasks) fetchAiSuggestion(tasksData.tasks, true) // forceRefresh=true
                                                }}
                                                disabled={aiLoading}
                                                aria-label={i18n.language === 'ar' ? 'تحديث الاقتراح' : 'Refresh suggestion'}
                                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <RefreshCw className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                                                {i18n.language === 'ar' ? 'تحديث' : 'Refresh'}
                                            </button>
                                            <button
                                                onClick={() => setAiDismissed(true)}
                                                aria-label={i18n.language === 'ar' ? 'تجاهل الاقتراح' : 'Dismiss suggestion'}
                                                className="text-xs font-medium text-slate-500 hover:text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                {i18n.language === 'ar' ? 'تجاهل' : 'Dismiss'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dismiss X button */}
                                    <button
                                        onClick={() => setAiDismissed(true)}
                                        aria-label={i18n.language === 'ar' ? 'إغلاق الاقتراح' : 'Close suggestion'}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* LIST OF TASKS - REDESIGNED "10/10" */}
                        <div className="flex flex-col gap-4">
                            {isLoading && (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Checkbox skeleton */}
                                                <Skeleton className="h-5 w-5 rounded-full" />
                                                {/* Icon skeleton */}
                                                <Skeleton className="h-10 w-10 rounded-xl" />
                                                {/* Content skeleton */}
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-48" />
                                                        <Skeleton className="h-5 w-16 rounded-full" />
                                                    </div>
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                                {/* Action skeleton */}
                                                <Skeleton className="h-8 w-8 rounded-lg" />
                                            </div>
                                            {/* Footer skeleton */}
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

                            {isError && (
                                <div className="bg-red-50 rounded-[2rem] p-12 text-center border border-red-100">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                            <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        {i18n.language === 'ar' ? 'خطأ في تحميل المهام' : 'Error Loading Tasks'} | {i18n.language === 'ar' ? 'Error Loading Tasks' : 'خطأ في تحميل المهام'}
                                    </h3>
                                    <p className="text-slate-500 mb-4 text-sm">
                                        {error?.message ? (
                                            <span className="block">{error.message}</span>
                                        ) : (
                                            <span className="block">
                                                {i18n.language === 'ar' ? 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.' : 'Connection to server failed. Please try again.'} | {i18n.language === 'ar' ? 'Connection to server failed. Please try again.' : 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.'}
                                            </span>
                                        )}
                                    </p>
                                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                        {i18n.language === 'ar' ? 'إعادة المحاولة' : 'Retry'} | {i18n.language === 'ar' ? 'Retry' : 'إعادة المحاولة'}
                                    </Button>
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoading && !isError && tasks.length === 0 && (
                                <div className="bg-white rounded-[2rem] p-12 border border-slate-100 text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                            <Briefcase className="w-8 h-8 text-emerald-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('tasks.list.noTasks')}</h3>
                                    <p className="text-slate-500 mb-4">{t('tasks.list.noTasksDescription')}</p>
                                    <GosiButton asChild className="bg-emerald-500 hover:bg-emerald-600">
                                        <Link to="/dashboard/tasks/new">
                                            <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                            {t('tasks.list.newTask')}
                                        </Link>
                                    </GosiButton>
                                </div>
                            )}

                            {/* Success State - Tasks List with Load More Pagination */}
                            {!isLoading && !isError && tasks.length > 0 && (
                                <>
                                {visibleTasks.map((task, index) => (
                                        <div key={task.id} className="mb-2">
                                            <div
                                                onClick={() => navigate({ to: '/dashboard/tasks/$taskId', params: { taskId: task.id } })}
                                                style={{ animationDelay: `${index * 50}ms` }}
                                                className={`
                                        animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards
                                        rounded-2xl p-3 md:p-4
                                        border-0 ring-1 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]
                                        transition-all duration-300 group
                                        hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-1
                                        cursor-pointer relative overflow-hidden
                                        ${task.smartDate.isOverdue && task.status !== 'done'
                                            ? 'bg-red-50/50 ring-red-200/50'
                                            : selectedTaskIds.includes(task.id)
                                                ? 'ring-2 ring-emerald-500 bg-emerald-50/20'
                                                : 'bg-white ring-black/[0.03]'
                                        }
                                    `}
                                >
                                    {/* Priority Strip Indicator - Always visible with color coding */}
                                    <div className={`absolute start-0 top-0 bottom-0 w-1.5 rounded-s-2xl transition-all duration-300 ${
                                        task.priority === 'urgent' ? 'bg-red-500' :
                                        task.priority === 'high' ? 'bg-orange-500' :
                                        task.priority === 'medium' ? 'bg-amber-400' :
                                        'bg-emerald-400'
                                    }`} />

                                    <div className="flex items-center gap-3 ps-4">
                                        {isSelectionMode && (
                                            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                                                <Checkbox
                                                    checked={selectedTaskIds.includes(task.id)}
                                                    onCheckedChange={() => handleSelectTask(task.id)}
                                                    className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-navy data-[state=checked]:border-navy flex-shrink-0 transition-all duration-200"
                                                />
                                            </div>
                                        )}

                                        {/* Task Icon with Timeline Status */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 border ${
                                            task.timeline.status === 'overdue' ? 'bg-red-50 text-red-600 border-red-200' :
                                            task.timeline.status === 'at-risk' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                            task.timeline.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                            'bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                                        }`}>
                                            {task.timeline.status === 'overdue' ? <AlertTriangle className="h-5 w-5" strokeWidth={1.5} /> :
                                             task.timeline.status === 'at-risk' ? <Clock className="h-5 w-5" strokeWidth={1.5} /> :
                                             task.timeline.status === 'completed' ? <CheckCircle className="h-5 w-5" strokeWidth={1.5} /> :
                                             <Briefcase className="h-5 w-5" strokeWidth={1.5} />}
                                        </div>

                                        {/* Task Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className={`font-bold text-sm md:text-base group-hover:text-emerald-900 transition-colors truncate leading-tight ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                    {task.title}
                                                </h4>

                                                {/* Timeline Status Chip - only show for overdue, at-risk, or in_progress */}
                                                {task.status !== 'done' && (task.timeline.status === 'overdue' || task.timeline.status === 'at-risk' || task.status === 'in_progress') && (
                                                    <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                        task.timeline.status === 'overdue' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                        task.timeline.status === 'at-risk' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                        'bg-blue-50 text-blue-700 border border-blue-200'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            task.timeline.status === 'overdue' ? 'bg-red-500 animate-pulse' :
                                                            task.timeline.status === 'at-risk' ? 'bg-amber-500' :
                                                            'bg-blue-500 animate-pulse'
                                                        }`}></span>
                                                        {task.timeline.status === 'overdue' ? t('tasks.timeline.overdue', 'متأخر') :
                                                         task.timeline.status === 'at-risk' ? t('tasks.timeline.atRisk', 'قريب') :
                                                         t('tasks.statuses.inProgress', 'قيد التنفيذ')}
                                                    </div>
                                                )}

                                                {/* Completed Badge */}
                                                {task.status === 'done' && (
                                                    <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle className="w-3 h-3" />
                                                        {t('tasks.statuses.done', 'مكتمل')}
                                                    </div>
                                                )}

                                                {/* Task ↔ Event Sync Badge */}
                                                {(task.linkedEventId || task.eventId) && (
                                                    <div
                                                        className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-full px-2 py-0.5 flex items-center gap-1 cursor-pointer transition-all text-[10px] font-bold"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            navigate({ to: '/dashboard/tasks/events/$eventId', params: { eventId: task.linkedEventId || task.eventId } } as any)
                                                        }}
                                                    >
                                                        <Calendar className="h-3 w-3" />
                                                        {t('tasks.list.linkedEvent', 'حدث')}
                                                    </div>
                                                )}

                                                {/* Tag Chips */}
                                                {task.tags && task.tags.length > 0 && task.tags.slice(0, 2).map((tag: string, idx: number) => (
                                                    <div key={idx} className="bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                                        {tag}
                                                    </div>
                                                ))}
                                                {task.tags && task.tags.length > 2 && (
                                                    <div className="bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                                        +{task.tags.length - 2}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-slate-500 text-xs font-medium flex items-center gap-1">
                                                    <span className="text-slate-400">@</span>
                                                    {task.client}
                                                </p>

                                                {/* Assignee Avatar */}
                                                {task.assigneeName && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <span className="text-slate-300">•</span>
                                                        {task.assigneeAvatar ? (
                                                            <img src={task.assigneeAvatar} alt={task.assigneeName} className="w-4 h-4 rounded-full" />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                                                                {task.assigneeName.charAt(0)}
                                                            </div>
                                                        )}
                                                        <span className="font-medium truncate max-w-[60px]">{task.assigneeName}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mobile Chevron */}
                                        <div className="md:hidden text-slate-400 group-hover:text-emerald-600 transition-all duration-300 rtl:rotate-180">
                                            <ChevronLeft className="h-5 w-5 rtl:rotate-0 ltr:rotate-180" />
                                        </div>

                                        {/* RIGHT SIDE: Action Menu */}
                                        <div className="flex md:hidden absolute end-3 top-3" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy hover:bg-slate-100 rounded-xl">
                                                        <MoreHorizontal className="h-6 w-6" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-0 ring-1 ring-black/5">
                                                    <DropdownMenuItem onClick={() => handleEditTask(task.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                        <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                                        {t('tasks.list.editTask')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleViewTask(task.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                        <Eye className="h-4 w-4 ms-2" />
                                                        {t('tasks.list.viewDetails')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {task.status !== 'done' ? (
                                                        <DropdownMenuItem onClick={() => handleCompleteTask(task.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                            <CheckCircle className="h-4 w-4 ms-2 text-emerald-500" />
                                                            {t('tasks.list.completeTask')}
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleReopenTask(task.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                            <XCircle className="h-4 w-4 ms-2 text-amber-500" />
                                                            {t('tasks.list.reopenTask')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="text-red-600 focus:text-red-600 rounded-lg py-2.5 cursor-pointer bg-red-50/50 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4 ms-2" />
                                                        {t('tasks.list.deleteTask')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Complete Task Checkbox - Next to 3 dots menu */}
                                        <div onClick={(e) => e.stopPropagation()} className="hidden md:flex items-center">
                                            <Checkbox
                                                checked={task.status === 'done'}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        handleCompleteTask(task.id)
                                                    } else {
                                                        handleReopenTask(task.id)
                                                    }
                                                }}
                                                className="h-5 w-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-all duration-200 hover:border-emerald-400 me-2"
                                            />
                                        </div>

                                        {/* DESKTOP Action Menu */}
                                        <div className="hidden md:flex" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy hover:bg-slate-100 rounded-xl">
                                                        <MoreHorizontal className="h-6 w-6" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-0 ring-1 ring-black/5">
                                                    <DropdownMenuItem onClick={() => handleEditTask(task.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                        <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                                        {t('tasks.list.editTask')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleViewTask(task.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                        <Eye className="h-4 w-4 ms-2" />
                                                        {t('tasks.list.viewDetails')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {task.status !== 'done' ? (
                                                        <DropdownMenuItem onClick={() => handleCompleteTask(task.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                            <CheckCircle className="h-4 w-4 ms-2 text-emerald-500" />
                                                            {t('tasks.list.completeTask')}
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleReopenTask(task.id)} className="rounded-lg py-2.5 cursor-pointer">
                                                            <XCircle className="h-4 w-4 ms-2 text-amber-500" />
                                                            {t('tasks.list.reopenTask')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="text-red-600 focus:text-red-600 rounded-lg py-2.5 cursor-pointer bg-red-50/50 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4 ms-2" />
                                                        {t('tasks.list.deleteTask')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Compact Footer */}
                                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 ps-4">
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            {/* Priority Chip */}
                                            <GosiSelect
                                                value={task.priority}
                                                onValueChange={(value) => handlePriorityChange(task.id, value)}
                                            >
                                                <GosiSelectTrigger className={`w-auto min-w-[80px] h-6 text-[10px] font-bold rounded-md border-0 px-2 ${task.priority === 'urgent' ? 'bg-red-50 text-red-700' :
                                                    task.priority === 'high' ? 'bg-orange-50 text-orange-700' :
                                                        task.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
                                                            'bg-emerald-50 text-emerald-700'
                                                    }`}>
                                                    <GosiSelectValue />
                                                </GosiSelectTrigger>
                                                <GosiSelectContent>
                                                    <GosiSelectItem value="urgent" className="text-red-700 focus:bg-red-50">{t('tasks.priorities.urgent')}</GosiSelectItem>
                                                    <GosiSelectItem value="high" className="text-orange-700 focus:bg-orange-50">{t('tasks.priorities.high')}</GosiSelectItem>
                                                    <GosiSelectItem value="medium" className="text-amber-700 focus:bg-amber-50">{t('tasks.priorities.medium')}</GosiSelectItem>
                                                    <GosiSelectItem value="low" className="text-emerald-700 focus:bg-emerald-50">{t('tasks.priorities.low')}</GosiSelectItem>
                                                </GosiSelectContent>
                                            </GosiSelect>

                                            {/* Smart Due Date with countdown */}
                                            <div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md font-bold ${
                                                task.smartDate.isOverdue ? 'bg-red-100 text-red-700' :
                                                task.smartDate.daysRemaining !== null && task.smartDate.daysRemaining <= 2 ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                {task.smartDate.isOverdue ? (
                                                    <AlertTriangle className="w-3 h-3" />
                                                ) : task.smartDate.daysRemaining !== null && task.smartDate.daysRemaining <= 2 ? (
                                                    <Clock className="w-3 h-3" />
                                                ) : (
                                                    <Calendar className="w-3 h-3" />
                                                )}
                                                <span>{task.smartDate.label}</span>
                                            </div>

                                            {/* Time Remaining Countdown */}
                                            {task.smartDate.daysRemaining !== null && task.smartDate.daysRemaining > 0 && task.smartDate.daysRemaining <= 7 && task.status !== 'done' && (
                                                <div className="hidden md:flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="font-medium">{t('tasks.smartDates.remaining', 'متبقي')} {task.smartDate.daysRemaining} {t('tasks.smartDates.days', 'أيام')}</span>
                                                </div>
                                            )}

                                            {/* Subtask Progress (if available) */}
                                            {task.subtaskCount && task.subtaskCount > 0 && (
                                                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500">
                                                    <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full transition-all"
                                                            style={{ width: `${(task.completedSubtasks || 0) / task.subtaskCount * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-medium">{task.completedSubtasks || 0}/{task.subtaskCount}</span>
                                                </div>
                                            )}
                                        </div>

                                        <Link to={`/dashboard/tasks/${task.id}` as any} className="hidden sm:inline-flex" onClick={(e) => e.stopPropagation()}>
                                            <GosiButton size="sm" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border-0 rounded-md px-3 h-6 text-[10px] transition-all group/btn">
                                                {t('tasks.list.viewDetails')}
                                                <ArrowRight className="w-3 h-3 ms-1 rtl:rotate-180 transition-transform group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5" />
                                            </GosiButton>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                                    ))}

                                    {/* Load More Section */}
                                    <div className="flex flex-col items-center gap-3 pt-4">
                                        {/* Show More Button - only if there are more tasks */}
                                        {hasMoreTasks && (
                                            <GosiButton
                                                onClick={handleLoadMore}
                                                variant="outline"
                                                className="w-full max-w-sm h-12 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-600 font-bold transition-all"
                                            >
                                                <Plus className="w-5 h-5 ms-2" />
                                                {t('tasks.list.showMore', 'عرض المزيد')}
                                                <span className="text-xs text-slate-400 ms-2">
                                                    ({visibleCount} / {tasks.length})
                                                </span>
                                            </GosiButton>
                                        )}

                                        {/* View All Tasks Link - always show at bottom */}
                                        <Link
                                            to="/dashboard/tasks/list"
                                            className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group py-2"
                                        >
                                            {t('tasks.list.viewAllTasks', 'عرض جميع المهام')}
                                            <span className="text-xs text-slate-400">({tasks.length})</span>
                                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>

                    {/* LEFT COLUMN (Widgets) */}
                    <TasksSidebar
                        context="tasks"
                        isSelectionMode={isSelectionMode}
                        onToggleSelectionMode={handleToggleSelectionMode}
                        selectedCount={selectedTaskIds.length}
                        onDeleteSelected={handleDeleteSelected}
                    />
                </div >
            </Main >
        </>
    )
}

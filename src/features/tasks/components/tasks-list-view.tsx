import { TasksSidebar } from './tasks-sidebar'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
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
import { Search, Bell, AlertCircle, Briefcase, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2, CheckCircle, XCircle, Edit3, Calendar, SortAsc, Filter, X, ArrowRight, ArrowUpDown } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useDeleteTask, useCompleteTask, useReopenTask, useUpdateTask } from '@/hooks/useTasks'
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

export function TasksListView() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [activeStatusTab, setActiveStatusTab] = useState('active')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [showFilters, setShowFilters] = useState(false) // New state for mobile filters
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

    // Performance profiling
    const renderCount = useRef(0)
    const mountTime = useRef(performance.now())

    useEffect(() => {
        perfLog('TasksListView MOUNTED')
        return () => perfLog('TasksListView UNMOUNTED')
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

    // Fetch team members and cases for filter dropdowns (DEFERRED)
    const { data: teamMembers } = useTeamMembers(isFilterDataReady)
    const { data: casesData } = useCases(undefined, isFilterDataReady)

    // Mutations for task actions
    const deleteTaskMutation = useDeleteTask()
    const completeTaskMutation = useCompleteTask()
    const reopenTaskMutation = useReopenTask()
    const updateTaskMutation = useUpdateTask()

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
    const hasActiveFilters = searchQuery || priorityFilter !== 'all' || assignedFilter !== 'all' || dueDateFilter !== 'all' || caseFilter !== 'all'

    // Clear all filters
    const clearFilters = () => {
        setSearchQuery('')
        setPriorityFilter('all')
        setAssignedFilter('all')
        setDueDateFilter('all')
        setCaseFilter('all')
    }

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

    // Helper function to format dates based on current locale
    const formatDualDate = (dateString: string | null | undefined) => {
        if (!dateString) return { arabic: t('tasks.list.notSet'), english: t('tasks.list.notSet') }
        const date = new Date(dateString)
        const locale = i18n.language === 'ar' ? arSA : enUS
        return {
            arabic: format(date, 'd MMMM', { locale: arSA }),
            english: format(date, 'MMM d, yyyy', { locale: enUS })
        }
    }

    // Transform API data
    const tasks = useMemo(() => {
        if (!tasksData?.tasks) return []

        return tasksData.tasks.map((task: any) => ({
            id: task._id,
            title: task.title || task.description || t('tasks.list.notSet'),
            client: task.caseId?.clientId?.name || task.clientId?.name || t('tasks.list.notSet'),
            dueDate: task.dueDate,
            createdAt: task.createdAt,
            dueDateFormatted: formatDualDate(task.dueDate),
            createdAtFormatted: formatDualDate(task.createdAt),
            priority: task.priority || 'medium',
            status: task.status || 'pending',
            linkedEventId: task.linkedEventId, // Task ↔ Event sync
            eventId: task.eventId, // Manual event link
            _id: task._id,
        }))
    }, [tasksData, t, i18n.language])

    // Selection Handlers
    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedTaskIds([])
    }

    const handleSelectTask = (taskId: string) => {
        if (selectedTaskIds.includes(taskId)) {
            setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId))
        } else {
            setSelectedTaskIds([...selectedTaskIds, taskId])
        }
    }

    const handleDeleteSelected = () => {
        if (selectedTaskIds.length === 0) return

        if (confirm(t('tasks.list.deleteMultipleConfirm', { count: selectedTaskIds.length }))) {
            bulkDeleteTasks(selectedTaskIds, {
                onSuccess: () => {
                    setIsSelectionMode(false)
                    setSelectedTaskIds([])
                }
            })
        }
    }

    // Single task actions
    const handleViewTask = (taskId: string) => {
        navigate({ to: '/dashboard/tasks/$taskId', params: { taskId } })
    }

    const handleEditTask = (taskId: string) => {
        navigate({ to: '/dashboard/tasks/create', search: { editId: taskId } } as any)
    }

    const handleDeleteTask = (taskId: string) => {
        if (confirm(t('tasks.list.deleteConfirm'))) {
            deleteTaskMutation.mutate(taskId)
        }
    }

    const handleCompleteTask = (taskId: string) => {
        completeTaskMutation.mutate({ id: taskId })
    }

    const handleReopenTask = (taskId: string) => {
        reopenTaskMutation.mutate(taskId)
    }

    const handlePriorityChange = (taskId: string, priority: string) => {
        updateTaskMutation.mutate({ id: taskId, data: { priority: priority as any } })
    }

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
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pe-12 h-14 w-full text-base"
                                        />
                                    </div>

                                    {/* Mobile/Tablet Filter Toggle Button */}
                                    <GosiButton
                                        variant={showFilters || hasActiveFilters ? "default" : "outline"}
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`lg:hidden h-14 w-full sm:w-auto px-6 whitespace-nowrap transition-all ${showFilters || hasActiveFilters ? 'bg-navy text-white border-navy' : ''}`}
                                    >
                                        <Filter className="h-5 w-5 ms-2" />
                                        {t('tasks.list.filters', 'تصفية')}
                                        {hasActiveFilters && (
                                            <span className="ms-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                                                !
                                            </span>
                                        )}
                                    </GosiButton>

                                    {/* Clear All Button (Desktop) - Optional placement, but kept in grid for now */}
                                </div>

                                {/* filters container - Responsive Flex Wrap for Best Text Fit */}
                                <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-wrap gap-4 transition-all duration-300 ease-in-out`}>

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

                        {/* LIST OF TASKS - REDESIGNED "10/10" */}
                        <div className="flex flex-col gap-4">
                            {isLoading && (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-48 w-full rounded-[2rem] bg-slate-100" />
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
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('tasks.list.errorLoading')}</h3>
                                    <p className="text-slate-500 mb-4">{error?.message || t('tasks.list.connectionError')}</p>
                                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                        {t('tasks.list.retry')}
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

                            {/* Success State - Tasks List */}
                            {!isLoading && !isError && tasks.map((task, index) => (
                                <div
                                    key={task.id}
                                    onClick={() => navigate({ to: '/dashboard/tasks/$taskId', params: { taskId: task.id } })}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    className={`
                                        animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards
                                        bg-white rounded-[2rem] p-5 md:p-7
                                        border-0 ring-1 ring-black/[0.03] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]
                                        transition-all duration-300 group 
                                        hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 
                                        cursor-pointer relative overflow-hidden
                                        ${selectedTaskIds.includes(task.id) ? 'ring-2 ring-emerald-500 bg-emerald-50/20' : ''}
                                    `}
                                >
                                    {/* Status Strip Indicator */}
                                    <div className={`absolute start-0 top-0 bottom-0 w-1.5 ${task.priority === 'urgent' ? 'bg-red-500' :
                                        task.priority === 'high' ? 'bg-orange-500' :
                                            task.priority === 'medium' ? 'bg-amber-400' :
                                                'bg-emerald-400'
                                        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 ps-2">
                                        {/* LEFT SIDE: Checkbox + Icon + Info */}
                                        <div className="flex gap-5 items-start w-full md:w-auto">
                                            {isSelectionMode && (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedTaskIds.includes(task.id)}
                                                        onCheckedChange={() => handleSelectTask(task.id)}
                                                        className="h-6 w-6 mt-1 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 flex-shrink-0 transition-all duration-200"
                                                    />
                                                </div>
                                            )}
                                            {/* Reverted to Clean Slate/Emerald Look */}
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] bg-slate-50 flex items-center justify-center shadow-inner text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:scale-105 transition-all duration-300 flex-shrink-0 border border-slate-100 group-hover:border-emerald-100">
                                                <Briefcase className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.5} />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                                    {/* Typography Fix: Reduced from text-xl to text-lg (18px) for balanced readability */}
                                                    <h4 className="font-bold text-slate-950 text-base md:text-lg group-hover:text-emerald-900 transition-colors truncate leading-tight tracking-tight max-w-full">
                                                        {task.title}
                                                    </h4>

                                                    <div className="flex items-center gap-2">
                                                        {task.status === 'active' && (
                                                            <div className="flex items-center gap-1 bg-blue-50/80 text-blue-800 border border-blue-200 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                                                                {t('tasks.list.active')}
                                                            </div>
                                                        )}
                                                        {/* Task ↔ Event Sync Badge */}
                                                        {(task.linkedEventId || task.eventId) && (
                                                            <div
                                                                className="bg-purple-50/80 text-purple-700 hover:bg-purple-100 border border-purple-100 rounded-full px-2.5 py-0.5 flex items-center gap-1 cursor-pointer transition-all text-[10px] font-bold shadow-sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    navigate({ to: '/dashboard/tasks/events/$eventId', params: { eventId: task.linkedEventId || task.eventId } } as any)
                                                                }}
                                                            >
                                                                <Calendar className="h-3 w-3" />
                                                                {t('tasks.list.linkedEvent', 'مرتبط بحدث')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-slate-700 text-xs md:text-sm font-bold flex items-center gap-2">
                                                    <span className="text-slate-500">@</span>
                                                    {t('tasks.list.taskClient', { name: task.client })}
                                                </p>
                                            </div>

                                            {/* Mobile Chevron Indicator - Animated */}
                                            <div className="md:hidden ms-auto text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-[-4px] transition-all duration-300 rtl:rotate-180 self-center">
                                                <ChevronLeft className="h-6 w-6 rtl:rotate-0 ltr:rotate-180" />
                                            </div>
                                        </div>

                                        {/* RIGHT SIDE: Action Menu (Absolute on mobile top-right, or just stacked) */}
                                        <div className="flex md:hidden absolute end-4 top-4 pt-1" onClick={(e) => e.stopPropagation()}>
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
                                                    {/* View Details is now the card click, but keep in menu for accessibility */}
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

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-5 mt-3 border-t border-slate-50 gap-4 ps-2">
                                        <div className="flex flex-wrap items-center gap-4 sm:gap-8 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                                            {/* Priority Dropdown - WIDENED to 140px */}
                                            <div>
                                                {/* Typography Fix: Increased label from text-[10px] to text-xs (12px) for better readability */}
                                                <div className="text-xs uppercase tracking-wider text-slate-600 mb-1.5 font-bold flex items-center gap-1">
                                                    {t('tasks.list.priorityLabel')}
                                                </div>
                                                <GosiSelect
                                                    value={task.priority}
                                                    onValueChange={(value) => handlePriorityChange(task.id, value)}
                                                >
                                                    <GosiSelectTrigger className={`w-[140px] h-10 text-xs font-bold rounded-xl border-0 shadow-sm transition-all hover:scale-105 active:scale-95 ${task.priority === 'urgent' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' :
                                                        task.priority === 'high' ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' :
                                                            task.priority === 'medium' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' :
                                                                'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
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
                                            </div>
                                            {/* Due Date - Dual Language */}
                                            <div className="text-center">
                                                {/* Typography Fix: Increased label from text-[10px] to text-xs (12px) */}
                                                <div className="text-xs uppercase tracking-wider text-slate-600 mb-1.5 font-bold">{t('tasks.list.dueDate')}</div>
                                                <div className="font-bold text-slate-800 text-sm bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 h-10">
                                                    <Calendar className="w-4 h-4 text-slate-500" />
                                                    {task.dueDateFormatted.arabic}
                                                </div>
                                            </div>
                                            {/* Creation Date - Dual Language */}
                                            <div className="text-center hidden sm:block">
                                                {/* Typography Fix: Increased label from text-[10px] to text-xs (12px) */}
                                                <div className="text-xs uppercase tracking-wider text-slate-600 mb-1.5 font-bold">{t('tasks.list.createdAt')}</div>
                                                <div className="font-bold text-slate-500 text-sm px-2 py-2 h-10 flex items-center">{task.createdAtFormatted.arabic}</div>
                                            </div>
                                        </div>
                                        <Link to={`/dashboard/tasks/${task.id}` as any} className="hidden sm:inline-flex w-auto" onClick={(e) => e.stopPropagation()}>
                                            <GosiButton className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 hover:border-emerald-500 rounded-xl px-6 h-10 shadow-sm hover:shadow-lg hover:shadow-emerald-500/20 w-auto transition-all duration-300 hover:scale-105 active:scale-95 group/btn">
                                                {t('tasks.list.viewDetails')}
                                                <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180 transition-transform group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1" />
                                            </GosiButton>
                                        </Link>
                                    </div>
                                </div>
                            ))}
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

import { TasksSidebar } from './tasks-sidebar'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
import { Search, Bell, AlertCircle, Briefcase, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2, CheckCircle, XCircle, Edit3, Calendar, SortAsc, Filter, X } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useDeleteTask, useCompleteTask, useReopenTask, useUpdateTask } from '@/hooks/useTasks'
import { format } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCases } from '@/hooks/useCasesAndClients'
import { useTeamMembers } from '@/hooks/useStaff'
// Gosi Design System Components
import {
    GosiCard,
    GosiInput,
    GosiTaskCard,
    GosiFilterBar,
    GosiFilterSelect,
    GosiIconBox,
    GosiButton,
    GosiPriorityBadge,
} from '@/components/ui/gosi-ui'

export function TasksListView() {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [activeStatusTab, setActiveStatusTab] = useState('active')
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

    // Filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [priorityFilter, setPriorityFilter] = useState<string>('all')
    const [assignedFilter, setAssignedFilter] = useState<string>('all')
    const [dueDateFilter, setDueDateFilter] = useState<string>('all')
    const [caseFilter, setCaseFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('dueDate')

    // Fetch team members and cases for filter dropdowns
    const { data: teamMembers } = useTeamMembers()
    const { data: casesData } = useCases()

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
    const { data: tasksData, isLoading, isError, error, refetch } = useTasks(filters)
    const { data: stats } = useTaskStats()
    const { mutate: bulkDeleteTasks } = useBulkDeleteTasks()

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

        // DEBUG: Log task IDs being deleted
        console.log('🗑️ Attempting to delete tasks:', selectedTaskIds)
        console.log('📋 Current tasks in view:', tasks.map(t => ({ id: t.id, title: t.title })))

        if (confirm(t('tasks.list.deleteMultipleConfirm', { count: selectedTaskIds.length }))) {
            bulkDeleteTasks(selectedTaskIds, {
                onSuccess: (result) => {
                    console.log('✅ Bulk delete success:', result)
                    setIsSelectionMode(false)
                    setSelectedTaskIds([])
                },
                onError: (error: any) => {
                    console.error('❌ Bulk delete failed:', error)
                    console.error('Failed task IDs:', error?.failedIds)
                }
            })
        }
    }

    // Single task actions
    const handleViewTask = (taskId: string) => {
        navigate({ to: '/dashboard/tasks/$taskId', params: { taskId } })
    }

    const handleEditTask = (taskId: string) => {
        navigate({ to: '/dashboard/tasks/create', search: { editId: taskId } })
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
        reopenTaskMutation.mutate({ id: taskId })
    }

    const handlePriorityChange = (taskId: string, priority: string) => {
        updateTaskMutation.mutate({ id: taskId, data: { priority: priority as 'low' | 'medium' | 'high' | 'urgent' } })
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

                        {/* FILTERS BAR - Gemini Spec: bg-white rounded-[2rem] p-4 md:p-6 shadow-sm */}
                        <GosiCard className="p-4 md:p-6 shadow-sm">
                            <GosiFilterBar className="gap-4">
                                {/* Search Input - h-14 to match filters */}
                                <div className="relative flex-1 min-w-[220px] max-w-md">
                                    <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
                                    <GosiInput
                                        type="text"
                                        placeholder={t('tasks.list.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pe-12 h-14"
                                    />
                                </div>

                                {/* Status Filter - min-w-[220px] */}
                                <GosiFilterSelect
                                    value={activeStatusTab}
                                    onValueChange={setActiveStatusTab}
                                    placeholder={t('tasks.list.status')}
                                >
                                    <SelectItem value="active">{t('tasks.list.active')}</SelectItem>
                                    <SelectItem value="completed">{t('tasks.list.completed')}</SelectItem>
                                </GosiFilterSelect>

                                {/* Priority Filter - Gemini Spec: min-w-[240px] for Arabic */}
                                <GosiFilterSelect
                                    value={priorityFilter}
                                    onValueChange={setPriorityFilter}
                                    placeholder={t('tasks.list.priorityLabel')}
                                    minWidth="240px"
                                >
                                    <SelectItem value="all">{t('tasks.list.allPriorities')}</SelectItem>
                                    <SelectItem value="urgent">{t('tasks.priorities.urgent')}</SelectItem>
                                    <SelectItem value="high">{t('tasks.priorities.high')}</SelectItem>
                                    <SelectItem value="medium">{t('tasks.priorities.medium')}</SelectItem>
                                    <SelectItem value="low">{t('tasks.priorities.low')}</SelectItem>
                                </GosiFilterSelect>

                                {/* Assigned To Filter - min-w-[220px] */}
                                <GosiFilterSelect
                                    value={assignedFilter}
                                    onValueChange={setAssignedFilter}
                                    placeholder={t('tasks.list.responsible')}
                                >
                                    <SelectItem value="all">{t('tasks.list.all')}</SelectItem>
                                    <SelectItem value="me">{t('tasks.list.myTasks')}</SelectItem>
                                    <SelectItem value="unassigned">{t('tasks.list.unassigned')}</SelectItem>
                                    {teamMembers?.map((member: any) => (
                                        <SelectItem key={member._id} value={member._id}>
                                            {member.name || member.email}
                                        </SelectItem>
                                    ))}
                                </GosiFilterSelect>

                                {/* Due Date Filter - min-w-[220px] */}
                                <GosiFilterSelect
                                    value={dueDateFilter}
                                    onValueChange={setDueDateFilter}
                                    placeholder={t('tasks.list.dueDate')}
                                    icon={<Calendar className="h-4 w-4" />}
                                >
                                    <SelectItem value="all">{t('tasks.list.allDates')}</SelectItem>
                                    <SelectItem value="today">{t('tasks.list.today')}</SelectItem>
                                    <SelectItem value="thisWeek">{t('tasks.list.thisWeek')}</SelectItem>
                                    <SelectItem value="thisMonth">{t('tasks.list.thisMonth')}</SelectItem>
                                    <SelectItem value="overdue">{t('tasks.list.overdue')}</SelectItem>
                                    <SelectItem value="noDueDate">{t('tasks.list.noDueDate')}</SelectItem>
                                </GosiFilterSelect>

                                {/* Case Filter - min-w-[220px] */}
                                <GosiFilterSelect
                                    value={caseFilter}
                                    onValueChange={setCaseFilter}
                                    placeholder={t('tasks.list.case')}
                                    icon={<Briefcase className="h-4 w-4" />}
                                >
                                    <SelectItem value="all">{t('tasks.list.allCases')}</SelectItem>
                                    {casesData?.cases?.map((caseItem: any) => (
                                        <SelectItem key={caseItem._id} value={caseItem._id}>
                                            {caseItem.title || caseItem.caseNumber}
                                        </SelectItem>
                                    ))}
                                </GosiFilterSelect>

                                {/* Sort By - min-w-[220px] */}
                                <GosiFilterSelect
                                    value={sortBy}
                                    onValueChange={setSortBy}
                                    placeholder={t('tasks.list.sortBy')}
                                    icon={<SortAsc className="h-4 w-4" />}
                                >
                                    <SelectItem value="dueDate">{t('tasks.list.dueDate')}</SelectItem>
                                    <SelectItem value="priority">{t('tasks.list.priorityLabel')}</SelectItem>
                                    <SelectItem value="createdAt">{t('tasks.list.creationDate')}</SelectItem>
                                    <SelectItem value="title">{t('tasks.list.name')}</SelectItem>
                                </GosiFilterSelect>

                                {/* Clear Filters Button */}
                                {hasActiveFilters && (
                                    <GosiButton
                                        variant="danger"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                        {t('tasks.list.clearFilters')}
                                    </GosiButton>
                                )}
                            </GosiFilterBar>
                        </GosiCard>

                        {/* MAIN TASKS LIST - Clean Slate Pattern (Unboxed Floating Cards) */}
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex justify-between items-center px-2">
                                <h3 className="font-bold text-slate-900 text-xl">
                                    {activeStatusTab === 'active' ? t('tasks.list.activeTasks') : t('tasks.list.completedTasks')}
                                </h3>
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 border rounded-full px-4 py-1.5 font-semibold">
                                    {t('tasks.list.taskCount', { count: tasks.length })}
                                </Badge>
                            </div>

                            {/* Task Cards - Floating Islands */}
                            <div className="space-y-4">
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
                                    <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Briefcase className="w-8 h-8 text-emerald-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{t('tasks.list.noTasks')}</h3>
                                        <p className="text-slate-500 mb-4">{t('tasks.list.noTasksDescription')}</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/tasks/new">
                                                <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                                                {t('tasks.list.newTask')}
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Tasks List with Gosi Clean Slate Pattern */}
                                {!isLoading && !isError && tasks.map((task, index) => (
                                    <GosiTaskCard
                                        key={task.id}
                                        priority={task.priority as 'urgent' | 'high' | 'medium' | 'low'}
                                        isSelected={selectedTaskIds.includes(task.id)}
                                        animationDelay={index * 50}
                                        className="p-6 cursor-pointer"
                                        onClick={() => handleViewTask(task.id)}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedTaskIds.includes(task.id)}
                                                        onCheckedChange={(e) => {
                                                            e.preventDefault?.()
                                                            handleSelectTask(task.id)
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                {/* Gemini Spec: Icon Box - w-14 h-14 (Mobile) / w-16 h-16 (Desktop) */}
                                                <GosiIconBox variant="soft" size="md" className="sm:w-16 sm:h-16">
                                                    <Briefcase className="h-6 w-6 sm:h-7 sm:w-7" />
                                                </GosiIconBox>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <h4 className="font-bold text-slate-900 text-lg">{task.title}</h4>
                                                        {task.status === 'active' && (
                                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-full px-2.5 py-0.5 text-xs">{t('tasks.list.active')}</Badge>
                                                        )}
                                                        {/* Task ↔ Event Sync Badge */}
                                                        {(task.linkedEventId || task.eventId) && (
                                                            <Badge
                                                                className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 rounded-full px-2.5 py-0.5 text-xs flex items-center gap-1 cursor-pointer transition-all"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    navigate({ to: '/dashboard/tasks/events/$eventId', params: { eventId: task.linkedEventId || task.eventId } })
                                                                }}
                                                            >
                                                                <Calendar className="h-3 w-3" />
                                                                {t('tasks.list.linkedEvent', 'مرتبط بحدث')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 text-sm">{t('tasks.list.taskClient', { name: task.client })}</p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditTask(task.id) }}>
                                                        <Edit3 className="h-4 w-4 ms-2 text-blue-500" aria-hidden="true" />
                                                        {t('tasks.list.editTask')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewTask(task.id) }}>
                                                        <Eye className="h-4 w-4 ms-2" />
                                                        {t('tasks.list.viewDetails')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {task.status !== 'done' ? (
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCompleteTask(task.id) }}>
                                                            <CheckCircle className="h-4 w-4 ms-2 text-emerald-500" />
                                                            {t('tasks.list.completeTask')}
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleReopenTask(task.id) }}>
                                                            <XCircle className="h-4 w-4 ms-2 text-amber-500" />
                                                            {t('tasks.list.reopenTask')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id) }}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 ms-2" />
                                                        {t('tasks.list.deleteTask')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-4 flex-wrap">
                                                {/* Priority Badge - w-[140px] for Arabic */}
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <div className="text-xs text-slate-500 mb-1">{t('tasks.list.priorityLabel')}</div>
                                                    <Select
                                                        value={task.priority}
                                                        onValueChange={(value) => handlePriorityChange(task.id, value)}
                                                    >
                                                        <SelectTrigger className={`w-[140px] h-8 text-xs font-bold rounded-xl border-0 ${
                                                            task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                            task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="urgent">{t('tasks.priorities.urgent')}</SelectItem>
                                                            <SelectItem value="high">{t('tasks.priorities.high')}</SelectItem>
                                                            <SelectItem value="medium">{t('tasks.priorities.medium')}</SelectItem>
                                                            <SelectItem value="low">{t('tasks.priorities.low')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {/* Due Date - Dual Language */}
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-500 mb-1">{t('tasks.list.dueDate')}</div>
                                                    <div className="font-bold text-slate-800 text-sm">{task.dueDateFormatted.arabic}</div>
                                                    <div className="text-xs text-slate-400">{task.dueDateFormatted.english}</div>
                                                </div>
                                                {/* Creation Date - Dual Language (Hidden on mobile) */}
                                                <div className="text-center hidden sm:block">
                                                    <div className="text-xs text-slate-500 mb-1">{t('tasks.list.createdAt')}</div>
                                                    <div className="font-bold text-slate-600 text-sm">{task.createdAtFormatted.arabic}</div>
                                                    <div className="text-xs text-slate-400">{task.createdAtFormatted.english}</div>
                                                </div>
                                            </div>
                                            {/* View Details - Soft Button (Desktop) / Chevron (Mobile) */}
                                            <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
                                                <GosiButton
                                                    variant="soft"
                                                    size="sm"
                                                    onClick={() => handleViewTask(task.id)}
                                                >
                                                    {t('tasks.list.viewDetails')}
                                                </GosiButton>
                                            </div>
                                            {/* Mobile Chevron Indicator */}
                                            <div className="sm:hidden text-slate-400">
                                                <ChevronLeft className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </GosiTaskCard>
                                ))}
                            </div>
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
                </div>
            </Main>
        </>
    )
}

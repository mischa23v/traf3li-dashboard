import { TasksSidebar } from './tasks-sidebar'
import { useState, useMemo } from 'react'
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
import { Search, Bell, AlertCircle, Briefcase, Plus, MoreHorizontal, ChevronLeft, Eye, Trash2, CheckCircle, XCircle, Edit3, Calendar, SortAsc, Filter, X, List, Grid } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useDeleteTask, useCompleteTask, useReopenTask } from '@/hooks/useTasks'
import { Input } from '@/components/ui/input'
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

export function TasksListView() {
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
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

    // Fetch team members and cases for filter dropdowns
    const { data: teamMembers } = useTeamMembers()
    const { data: casesData } = useCases()

    // Mutations for task actions
    const deleteTaskMutation = useDeleteTask()
    const completeTaskMutation = useCompleteTask()
    const reopenTaskMutation = useReopenTask()

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

    // Transform API data
    const tasks = useMemo(() => {
        if (!tasksData?.tasks) return []

        return tasksData.tasks.map((task: any) => ({
            id: task._id,
            title: task.title || task.description || 'مهمة غير محددة',
            client: task.caseId?.clientId?.name || task.clientId?.name || 'غير محدد',
            deadline: task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-SA', { month: 'long', day: 'numeric' }) : 'غير محدد',
            priority: task.priority || 'medium',
            status: task.status || 'pending',
            _id: task._id,
        }))
    }, [tasksData])

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

        if (confirm(`هل أنت متأكد من حذف ${selectedTaskIds.length} مهمة؟`)) {
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
        navigate({ to: '/tasks/$taskId', params: { taskId } })
    }

    const handleEditTask = (taskId: string) => {
        navigate({ to: '/dashboard/tasks/create', search: { editId: taskId } })
    }

    const handleDeleteTask = (taskId: string) => {
        if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
            deleteTaskMutation.mutate(taskId)
        }
    }

    const handleCompleteTask = (taskId: string) => {
        completeTaskMutation.mutate({ id: taskId })
    }

    const handleReopenTask = (taskId: string) => {
        reopenTaskMutation.mutate({ id: taskId })
    }

    const topNav = [
        { title: 'نظرة عامة', href: '/dashboard/overview', isActive: false },
        { title: 'المهام', href: '/dashboard/tasks/list', isActive: true },
        { title: 'القضايا', href: '/dashboard/cases', isActive: false },
        { title: 'العملاء', href: '/dashboard/clients', isActive: false },
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

            <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

                {/* HERO CARD & STATS */}
                <ProductivityHero badge="إدارة المهام" title="المهام" type="tasks" />

                {/* MAIN GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* RIGHT COLUMN (Main Content) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* FILTERS BAR */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <div className="flex flex-col gap-4">
                                {/* Row 1: Search and primary filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Search Input */}
                                    <div className="relative flex-1 min-w-[200px] max-w-md">
                                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="text"
                                            placeholder="بحث في المهام..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pr-10 h-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Status Filter (already exists as tabs, keep it simple) */}
                                    <Select value={activeStatusTab} onValueChange={setActiveStatusTab}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">النشطة</SelectItem>
                                            <SelectItem value="completed">المكتملة</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Priority Filter */}
                                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                        <SelectTrigger className="w-[130px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="الأولوية" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الأولويات</SelectItem>
                                            <SelectItem value="urgent">عاجلة</SelectItem>
                                            <SelectItem value="high">عالية</SelectItem>
                                            <SelectItem value="medium">متوسطة</SelectItem>
                                            <SelectItem value="low">منخفضة</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Assigned To Filter */}
                                    <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                                        <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                                            <SelectValue placeholder="المسؤول" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">الكل</SelectItem>
                                            <SelectItem value="me">مهامي</SelectItem>
                                            <SelectItem value="unassigned">غير معينة</SelectItem>
                                            {teamMembers?.map((member: any) => (
                                                <SelectItem key={member._id} value={member._id}>
                                                    {member.name || member.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 2: Secondary filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Due Date Filter */}
                                    <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
                                        <SelectTrigger className="w-[150px] h-10 rounded-xl border-slate-200">
                                            <Calendar className="h-4 w-4 ml-2 text-slate-400" />
                                            <SelectValue placeholder="تاريخ الاستحقاق" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل التواريخ</SelectItem>
                                            <SelectItem value="today">اليوم</SelectItem>
                                            <SelectItem value="thisWeek">هذا الأسبوع</SelectItem>
                                            <SelectItem value="thisMonth">هذا الشهر</SelectItem>
                                            <SelectItem value="overdue">متأخرة</SelectItem>
                                            <SelectItem value="noDueDate">بدون موعد</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Case Filter */}
                                    <Select value={caseFilter} onValueChange={setCaseFilter}>
                                        <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200">
                                            <Briefcase className="h-4 w-4 ml-2 text-slate-400" />
                                            <SelectValue placeholder="القضية" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل القضايا</SelectItem>
                                            {casesData?.cases?.map((caseItem: any) => (
                                                <SelectItem key={caseItem._id} value={caseItem._id}>
                                                    {caseItem.title || caseItem.caseNumber}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Sort By */}
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200">
                                            <SortAsc className="h-4 w-4 ml-2 text-slate-400" />
                                            <SelectValue placeholder="ترتيب حسب" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dueDate">تاريخ الاستحقاق</SelectItem>
                                            <SelectItem value="priority">الأولوية</SelectItem>
                                            <SelectItem value="createdAt">تاريخ الإنشاء</SelectItem>
                                            <SelectItem value="title">الاسم</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* View Toggle */}
                                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                            className={`h-8 px-3 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                            className={`h-8 px-3 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                                        >
                                            <Grid className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Clear Filters Button (shows only when filters are active) */}
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                        >
                                            <X className="h-4 w-4 ml-2" />
                                            مسح الفلاتر
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MAIN TASKS LIST (Matches "Current Subscriptions" style) */}
                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                            <div className="p-6 pb-2 flex justify-between items-center">
                                <h3 className="font-bold text-navy text-xl">
                                    {activeStatusTab === 'active' ? 'المهام النشطة' : 'المهام المكتملة'}
                                </h3>
                                <Badge className="bg-slate-100 text-slate-600 border-0 rounded-full px-4 py-1">
                                    {tasks.length} مهمة
                                </Badge>
                            </div>

                            <div className="p-4 space-y-4">
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
                                                <AlertCircle className="w-8 h-8 text-red-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">حدث خطأ أثناء تحميل المهام</h3>
                                        <p className="text-slate-500 mb-4">{error?.message || 'تعذر الاتصال بالخادم'}</p>
                                        <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                                            إعادة المحاولة
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
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد مهام</h3>
                                        <p className="text-slate-500 mb-4">ابدأ بإضافة مهمة جديدة</p>
                                        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                                            <Link to="/dashboard/tasks/new">
                                                <Plus className="w-4 h-4 ml-2" />
                                                مهمة جديدة
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Success State - Tasks List */}
                                {!isLoading && !isError && tasks.map((task) => (
                                    <div key={task.id} className={`bg-[#F8F9FA] rounded-2xl p-6 border transition-all group ${selectedTaskIds.includes(task.id) ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                {isSelectionMode && (
                                                    <Checkbox
                                                        checked={selectedTaskIds.includes(task.id)}
                                                        onCheckedChange={() => handleSelectTask(task.id)}
                                                        className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                )}
                                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-emerald-600">
                                                    <Briefcase className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-navy text-lg">{task.title}</h4>
                                                        {task.status === 'active' && (
                                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-md px-2">نشط</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 text-sm">العميل: {task.client}</p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleEditTask(task.id)}>
                                                        <Edit3 className="h-4 w-4 ml-2 text-blue-500" />
                                                        تعديل المهمة
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleViewTask(task.id)}>
                                                        <Eye className="h-4 w-4 ml-2" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {task.status !== 'done' ? (
                                                        <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                                                            <CheckCircle className="h-4 w-4 ml-2 text-emerald-500" />
                                                            إكمال المهمة
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleReopenTask(task.id)}>
                                                            <XCircle className="h-4 w-4 ml-2 text-amber-500" />
                                                            إعادة فتح المهمة
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 ml-2" />
                                                        حذف المهمة
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">الأولوية</div>
                                                    <div className={`font-bold ${task.priority === 'high' ? 'text-red-500' : 'text-orange-500'}`}>
                                                        {task.priority === 'high' ? 'عالية' : 'متوسطة'}
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-slate-400 mb-1">الموعد</div>
                                                    <div className="font-bold text-navy">{task.deadline}</div>
                                                </div>
                                            </div>
                                            <Link to={`/tasks/${task.id}` as any}>
                                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-6 shadow-lg shadow-emerald-500/20">
                                                    عرض التفاصيل
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 pt-0 text-center">
                                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 w-full rounded-xl py-6">
                                    عرض جميع المهام
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                </Button>
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

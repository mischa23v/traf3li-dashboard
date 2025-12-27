/**
 * CRM Tasks List View
 *
 * Features:
 * - List View with DataTable (default)
 * - Kanban View by Status
 * - Filters: Search, Priority, Status, Due Date, Assigned To
 * - Actions: Create, Edit, Delete, Complete Task
 * - RTL/Arabic Support
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  LayoutList,
  LayoutGrid,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, DataTableColumnHeader, DataTableToolbar } from '@/components/data-table'
import { DataTableBulkActions } from '@/components/data-table/bulk-actions'
import { useTasks, useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import type { Task, TaskPriority, TaskStatus } from '@/services/tasksService'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { format, isPast, startOfDay } from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'

// View types
type ViewMode = 'list' | 'kanban'

// Priority badge colors - matching user requirements
const PRIORITY_COLORS: Record<TaskPriority, string> = {
  none: 'bg-slate-100 text-slate-700 border-slate-300',
  low: 'bg-slate-100 text-slate-700 border-slate-300', // gray
  medium: 'bg-blue-100 text-blue-700 border-blue-300', // blue (normal)
  high: 'bg-orange-100 text-orange-700 border-orange-300', // orange
  critical: 'bg-red-100 text-red-700 border-red-300', // urgent = critical -> red
}

// Status badge colors
const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: 'bg-slate-100 text-slate-700 border-slate-300',
  todo: 'bg-blue-100 text-blue-700 border-blue-300',
  in_progress: 'bg-purple-100 text-purple-700 border-purple-300',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  canceled: 'bg-red-100 text-red-700 border-red-300',
}

// Priority filter options
const priorityOptions = [
  { label: 'Low', labelAr: 'منخفضة', value: 'low' },
  { label: 'Normal', labelAr: 'عادية', value: 'medium' },
  { label: 'High', labelAr: 'عالية', value: 'high' },
  { label: 'Urgent', labelAr: 'عاجلة', value: 'critical' },
]

// Status filter options
const statusOptions = [
  { label: 'To Do', labelAr: 'للإنجاز', value: 'todo' },
  { label: 'In Progress', labelAr: 'قيد التنفيذ', value: 'in_progress' },
  { label: 'Done', labelAr: 'مكتملة', value: 'done' },
  { label: 'Backlog', labelAr: 'متراكمة', value: 'backlog' },
  { label: 'Canceled', labelAr: 'ملغاة', value: 'canceled' },
]

export function TasksListView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // Table state
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([{ id: 'dueDate', desc: false }])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  // Build filters for API
  const filters = useMemo(() => {
    const priorityFilter = columnFilters.find((f) => f.id === 'priority')
    const statusFilter = columnFilters.find((f) => f.id === 'status')
    const assignedToFilter = columnFilters.find((f) => f.id === 'assignedTo')
    const searchFilter = columnFilters.find((f) => f.id === 'global')

    return {
      priority: priorityFilter?.value as string | undefined,
      status: statusFilter?.value as string | undefined,
      assignedTo: assignedToFilter?.value as string | undefined,
      search: searchFilter?.value as string | undefined,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    }
  }, [columnFilters, pagination, sorting])

  // Fetch tasks
  const { data: tasksData, isLoading, isError, error } = useTasks(filters)
  const { mutate: updateTask } = useUpdateTask()
  const { mutate: deleteTask } = useDeleteTask()

  const tasks = tasksData?.tasks || []
  const totalCount = tasksData?.total || 0

  // Helper to check if task is overdue
  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'done') return false
    return isPast(startOfDay(new Date(task.dueDate)))
  }

  // Helper to get case title from task
  const getCaseTitle = (task: Task): string => {
    if (typeof task.caseId === 'object' && task.caseId) {
      return task.caseId.title || task.caseId.caseNumber || '-'
    }
    return '-'
  }

  // Helper to get assignee name
  const getAssigneeName = (task: Task): string => {
    if (typeof task.assignedTo === 'object' && task.assignedTo) {
      return `${task.assignedTo.firstName} ${task.assignedTo.lastName}`.trim()
    }
    return '-'
  }

  // Helper to format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const locale = isRTL ? arSA : enUS
    return format(date, 'MMM d, yyyy', { locale })
  }

  // Handle complete task
  const handleCompleteTask = (taskId: string) => {
    updateTask({ id: taskId, data: { status: 'done' } })
  }

  // Handle delete task
  const handleDeleteTask = (taskId: string) => {
    if (confirm(isRTL ? 'هل أنت متأكد من حذف هذه المهمة؟' : 'Are you sure you want to delete this task?')) {
      deleteTask(taskId)
    }
  }

  // Define columns
  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label={t('dataTable.selectAll')}
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t('dataTable.selectRow')}
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'completed',
        header: '',
        cell: ({ row }) => {
          const task = row.original
          return (
            <Checkbox
              checked={task.status === 'done'}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleCompleteTask(task._id)
                }
              }}
              className="h-5 w-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
            />
          )
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={isRTL ? 'العنوان' : 'Title'} />
        ),
        cell: ({ row }) => {
          const task = row.original
          const overdue = isOverdue(task)
          return (
            <div className="flex items-center gap-2">
              <span className={cn('font-medium', task.status === 'done' && 'line-through text-slate-400')}>
                {task.title}
              </span>
              {overdue && (
                <Badge className="bg-red-50 text-red-700 border-red-300 text-[10px]">
                  <AlertTriangle className="h-3 w-3 me-1" />
                  {isRTL ? 'متأخر' : 'Overdue'}
                </Badge>
              )}
            </div>
          )
        },
        enableSorting: true,
      },
      {
        id: 'relatedTo',
        accessorFn: (row) => getCaseTitle(row),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={isRTL ? 'متعلق بـ' : 'Related To'} />
        ),
        cell: ({ row }) => {
          const caseTitle = getCaseTitle(row.original)
          return (
            <span className="text-sm text-slate-600">
              {caseTitle}
            </span>
          )
        },
        enableSorting: true,
      },
      {
        accessorKey: 'dueDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={isRTL ? 'تاريخ الاستحقاق' : 'Due Date'} />
        ),
        cell: ({ row }) => {
          const task = row.original
          const overdue = isOverdue(task)
          const dateStr = formatDate(task.dueDate)

          return (
            <div className="flex items-center gap-2">
              <Calendar className={cn('h-4 w-4', overdue ? 'text-red-500' : 'text-slate-400')} />
              <span className={cn('text-sm', overdue && 'text-red-600 font-medium')}>
                {dateStr}
              </span>
            </div>
          )
        },
        enableSorting: true,
      },
      {
        accessorKey: 'priority',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={isRTL ? 'الأولوية' : 'Priority'} />
        ),
        cell: ({ row }) => {
          const priority = row.getValue('priority') as TaskPriority
          const priorityLabel = priorityOptions.find((p) => p.value === priority)
          const label = isRTL ? priorityLabel?.labelAr : priorityLabel?.label

          return (
            <Badge className={cn('text-xs', PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium)}>
              {label || priority}
            </Badge>
          )
        },
        enableSorting: true,
        filterFn: (row, id, value: string[]) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={isRTL ? 'الحالة' : 'Status'} />
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as TaskStatus
          const statusLabel = statusOptions.find((s) => s.value === status)
          const label = isRTL ? statusLabel?.labelAr : statusLabel?.label

          return (
            <Badge className={cn('text-xs', STATUS_COLORS[status] || STATUS_COLORS.todo)}>
              {label || status}
            </Badge>
          )
        },
        enableSorting: true,
        filterFn: (row, id, value: string[]) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        id: 'assignedTo',
        accessorFn: (row) => getAssigneeName(row),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={isRTL ? 'مُعيّن لـ' : 'Assigned To'} />
        ),
        cell: ({ row }) => {
          const name = getAssigneeName(row.original)
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-sm">{name}</span>
            </div>
          )
        },
        enableSorting: true,
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const task = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{isRTL ? 'الإجراءات' : 'Actions'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.dashboard.tasks.detail(task._id)}>
                    <Eye className="me-2 h-4 w-4" />
                    {isRTL ? 'عرض' : 'View'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate({ to: ROUTES.dashboard.tasks.new, search: { editId: task._id } } as any)}
                >
                  <Pencil className="me-2 h-4 w-4" />
                  {isRTL ? 'تعديل' : 'Edit'}
                </DropdownMenuItem>
                {task.status !== 'done' && (
                  <DropdownMenuItem onClick={() => handleCompleteTask(task._id)}>
                    <CheckCircle2 className="me-2 h-4 w-4 text-emerald-500" />
                    {isRTL ? 'إكمال' : 'Complete'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteTask(task._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="me-2 h-4 w-4" />
                  {isRTL ? 'حذف' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [t, isRTL, navigate]
  )

  // Create table instance
  const table = useReactTable({
    data: tasks,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
  })

  // Filter options for toolbar
  const filterOptions = useMemo(
    () => [
      {
        columnId: 'priority',
        title: isRTL ? 'الأولوية' : 'Priority',
        options: priorityOptions.map((p) => ({
          label: isRTL ? p.labelAr : p.label,
          value: p.value,
        })),
      },
      {
        columnId: 'status',
        title: isRTL ? 'الحالة' : 'Status',
        options: statusOptions.map((s) => ({
          label: isRTL ? s.labelAr : s.label,
          value: s.value,
        })),
      },
    ],
    [isRTL]
  )

  // Kanban columns data
  const kanbanColumns = useMemo(() => {
    const todoTasks = tasks.filter((t) => t.status === 'todo')
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
    const doneTasks = tasks.filter((t) => t.status === 'done')
    const overdueTasks = tasks.filter((t) => isOverdue(t) && t.status !== 'done')

    return [
      {
        id: 'todo',
        title: isRTL ? 'للإنجاز' : 'To Do',
        tasks: todoTasks,
        color: 'border-blue-500',
      },
      {
        id: 'in_progress',
        title: isRTL ? 'قيد التنفيذ' : 'In Progress',
        tasks: inProgressTasks,
        color: 'border-purple-500',
      },
      {
        id: 'done',
        title: isRTL ? 'مكتملة' : 'Completed',
        tasks: doneTasks,
        color: 'border-emerald-500',
      },
      {
        id: 'overdue',
        title: isRTL ? 'متأخرة' : 'Overdue',
        tasks: overdueTasks,
        color: 'border-red-500',
      },
    ]
  }, [tasks, isRTL])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            {isRTL ? 'المهام' : 'Tasks'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isRTL ? 'إدارة وتتبع المهام' : 'Manage and track tasks'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(viewMode === 'list' && 'bg-emerald-500 hover:bg-emerald-600')}
            >
              <LayoutList className="h-4 w-4 me-1" />
              {isRTL ? 'قائمة' : 'List'}
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={cn(viewMode === 'kanban' && 'bg-emerald-500 hover:bg-emerald-600')}
            >
              <LayoutGrid className="h-4 w-4 me-1" />
              {isRTL ? 'لوحة' : 'Kanban'}
            </Button>
          </div>

          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
            <Link to={ROUTES.dashboard.tasks.new}>
              <Plus className="h-4 w-4 ms-2" />
              {isRTL ? 'مهمة جديدة' : 'New Task'}
            </Link>
          </Button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                {isRTL ? 'فشل تحميل المهام' : 'Failed to load tasks'}
              </h3>
              <p className="text-slate-500 mb-4">
                {error?.message || (isRTL ? 'حدث خطأ في الخادم' : 'A server error occurred')}
              </p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                {isRTL ? 'لا توجد مهام' : 'No tasks found'}
              </h3>
              <p className="text-slate-500 mb-4">
                {isRTL ? 'ابدأ بإضافة مهمة جديدة' : 'Get started by adding a new task'}
              </p>
              <Button asChild className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
                <Link to={ROUTES.dashboard.tasks.new}>
                  <Plus className="h-4 w-4 ms-2" />
                  {isRTL ? 'إضافة مهمة' : 'Add Task'}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              <DataTableToolbar
                table={table}
                searchKey="title"
                searchPlaceholder={isRTL ? 'البحث عن المهام...' : 'Search tasks...'}
                filters={filterOptions}
              />

              <DataTableBulkActions table={table} entityName={isRTL ? 'مهمة' : 'task'}>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const selectedIds = table
                      .getFilteredSelectedRowModel()
                      .rows.map((row) => row.original._id)
                    if (
                      confirm(
                        isRTL
                          ? `هل أنت متأكد من حذف ${selectedIds.length} مهمة؟`
                          : `Delete ${selectedIds.length} task(s)?`
                      )
                    ) {
                      selectedIds.forEach((id) => deleteTask(id))
                    }
                  }}
                >
                  <Trash2 className="me-2 h-4 w-4" />
                  {isRTL ? 'حذف' : 'Delete'}
                </Button>
              </DataTableBulkActions>

              <DataTable table={table} />
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <Skeleton className="h-6 w-32 mb-4" />
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-24 w-full mb-2" />
                  ))}
                </div>
              ))}
            </>
          ) : (
            kanbanColumns.map((column) => (
              <div
                key={column.id}
                className={cn(
                  'bg-white rounded-2xl border-t-4 border-slate-100 shadow-sm',
                  column.color
                )}
              >
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>{column.title}</span>
                    <Badge variant="outline" className="ml-2">
                      {column.tasks.length}
                    </Badge>
                  </h3>
                </div>
                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                  {column.tasks.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">
                      {isRTL ? 'لا توجد مهام' : 'No tasks'}
                    </p>
                  ) : (
                    column.tasks.map((task) => (
                      <div
                        key={task._id}
                        className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate({ to: ROUTES.dashboard.tasks.detail(task._id) })}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={cn('font-medium text-sm', task.status === 'done' && 'line-through text-slate-400')}>
                            {task.title}
                          </h4>
                          <Checkbox
                            checked={task.status === 'done'}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleCompleteTask(task._id)
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span className={cn(isOverdue(task) && 'text-red-600 font-medium')}>
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn('text-[10px]', PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium)}>
                              {task.priority}
                            </Badge>
                            {getAssigneeName(task) !== '-' && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <User className="h-3 w-3" />
                                <span>{getAssigneeName(task)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

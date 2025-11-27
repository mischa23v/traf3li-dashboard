/**
 * Task Kanban Board
 * Drag-and-drop task management board using @hello-pangea/dnd
 * Supports column-based workflow with task cards
 */

import { useState, useMemo, useCallback } from 'react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Calendar,
  Clock,
  Flag,
  MoreHorizontal,
  Plus,
  User,
  CheckSquare,
  MessageSquare,
  Paperclip,
  AlertCircle,
  Timer,
  Circle,
  CheckCircle,
  CircleOff,
  HelpCircle,
  GripVertical,
} from 'lucide-react'
import { Task, TaskStatus, TaskPriority } from '@/services/tasksService'
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

/**
 * Column Configuration
 */
interface KanbanColumn {
  id: TaskStatus
  title: string
  titleAr: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

const columns: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    titleAr: 'قائمة الانتظار',
    icon: <HelpCircle className="h-4 w-4" />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50 dark:bg-slate-900/50',
  },
  {
    id: 'todo',
    title: 'To Do',
    titleAr: 'للتنفيذ',
    icon: <Circle className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    titleAr: 'قيد التنفيذ',
    icon: <Timer className="h-4 w-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    id: 'done',
    title: 'Done',
    titleAr: 'مكتمل',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    id: 'canceled',
    title: 'Canceled',
    titleAr: 'ملغي',
    icon: <CircleOff className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
  },
]

/**
 * Priority Configuration
 */
const priorityConfig: Record<TaskPriority, { label: string; labelAr: string; color: string; icon: React.ReactNode }> = {
  none: { label: 'None', labelAr: 'بدون', color: 'bg-gray-100 text-gray-600', icon: null },
  low: { label: 'Low', labelAr: 'منخفض', color: 'bg-green-100 text-green-700', icon: <Flag className="h-3 w-3" /> },
  medium: { label: 'Medium', labelAr: 'متوسط', color: 'bg-yellow-100 text-yellow-700', icon: <Flag className="h-3 w-3" /> },
  high: { label: 'High', labelAr: 'مرتفع', color: 'bg-orange-100 text-orange-700', icon: <Flag className="h-3 w-3" /> },
  critical: { label: 'Critical', labelAr: 'حرج', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="h-3 w-3" /> },
}

/**
 * Props Interface
 */
interface TaskKanbanBoardProps {
  tasks: Task[]
  onTaskMove?: (taskId: string, newStatus: TaskStatus) => void
  onTaskClick?: (task: Task) => void
  onAddTask?: (status: TaskStatus) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
  isLoading?: boolean
  locale?: 'ar' | 'en'
}

/**
 * Task Card Component
 */
function TaskCard({
  task,
  provided,
  snapshot,
  onClick,
  onEdit,
  onDelete,
  locale = 'ar',
}: {
  task: Task
  provided: DraggableProvided
  snapshot: DraggableStateSnapshot
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  locale?: 'ar' | 'en'
}) {
  const priority = priorityConfig[task.priority] || priorityConfig.none

  // Parse assignee info
  const assignee = typeof task.assignedTo === 'object' ? task.assignedTo : null
  const assigneeName = assignee
    ? `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim()
    : null
  const assigneeInitials = assigneeName
    ? assigneeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : null

  // Parse case info
  const caseInfo = typeof task.caseId === 'object' ? task.caseId : null

  // Calculate progress from subtasks
  const subtaskProgress = task.subtasks?.length
    ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
    : null

  // Format due date
  const formatDueDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr)
      if (isToday(date)) return locale === 'ar' ? 'اليوم' : 'Today'
      if (isTomorrow(date)) return locale === 'ar' ? 'غداً' : 'Tomorrow'
      return format(date, 'dd MMM', { locale: locale === 'ar' ? ar : undefined })
    } catch {
      return dateStr
    }
  }

  const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== 'done' && task.status !== 'canceled'

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={cn(
        'group mb-2 rounded-lg border bg-card p-3 shadow-sm transition-all',
        snapshot.isDragging && 'rotate-2 shadow-lg ring-2 ring-primary/20',
        isOverdue && 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20'
      )}
    >
      {/* Header with drag handle and actions */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            {...provided.dragHandleProps}
            className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <h4
            className="text-sm font-medium leading-tight cursor-pointer hover:text-primary truncate"
            onClick={onClick}
          >
            {task.title}
          </h4>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onClick}>
              {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              {locale === 'ar' ? 'تعديل' : 'Edit'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              {locale === 'ar' ? 'حذف' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Case reference */}
      {caseInfo && (
        <div className="mb-2">
          <Badge variant="outline" className="text-xs font-normal">
            {caseInfo.caseNumber || caseInfo.title}
          </Badge>
        </div>
      )}

      {/* Description preview */}
      {task.description && (
        <p className="mb-2 text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Progress bar for subtasks */}
      {subtaskProgress !== null && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
              {task.subtasks?.filter(s => s.completed).length}/{task.subtasks?.length}
            </span>
            <span>{subtaskProgress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer with metadata */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t mt-2">
        <div className="flex items-center gap-2">
          {/* Priority */}
          {task.priority && task.priority !== 'none' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={cn('px-1.5 py-0 text-xs', priority.color)}>
                    {priority.icon}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {locale === 'ar' ? priority.labelAr : priority.label}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Due date */}
          {task.dueDate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={cn(
                      'px-1.5 py-0 text-xs gap-1',
                      isOverdue && 'border-red-500 text-red-600 bg-red-50'
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    {formatDueDate(task.dueDate)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {format(parseISO(task.dueDate), 'PPP', { locale: locale === 'ar' ? ar : undefined })}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Comments count */}
          {task.comments && task.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              {task.comments.length}
            </span>
          )}

          {/* Attachments count */}
          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Paperclip className="h-3 w-3" />
              {task.attachments.length}
            </span>
          )}

          {/* Time tracked */}
          {task.timeTracking?.actualMinutes && task.timeTracking.actualMinutes > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {Math.floor(task.timeTracking.actualMinutes / 60)}h
            </span>
          )}

          {/* Assignee */}
          {assignee && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={assignee.avatar} alt={assigneeName || ''} />
                    <AvatarFallback className="text-xs">
                      {assigneeInitials || <User className="h-3 w-3" />}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{assigneeName}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Kanban Column Component
 */
function KanbanColumn({
  column,
  tasks,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  onAddTask,
  locale = 'ar',
}: {
  column: KanbanColumn
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
  onAddTask?: () => void
  locale?: 'ar' | 'en'
}) {
  return (
    <div className="flex flex-col h-full min-w-[280px] max-w-[320px]">
      {/* Column Header */}
      <div className={cn('flex items-center justify-between p-3 rounded-t-lg', column.bgColor)}>
        <div className="flex items-center gap-2">
          <span className={column.color}>{column.icon}</span>
          <h3 className="font-medium text-sm">
            {locale === 'ar' ? column.titleAr : column.title}
          </h3>
          <Badge variant="secondary" className="text-xs px-1.5">
            {tasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onAddTask}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided: DroppableProvided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-2 rounded-b-lg transition-colors min-h-[200px]',
              column.bgColor,
              snapshot.isDraggingOver && 'ring-2 ring-primary/20 ring-inset'
            )}
          >
            <ScrollArea className="h-[calc(100vh-280px)]">
              {tasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <TaskCard
                      task={task}
                      provided={provided}
                      snapshot={snapshot}
                      onClick={() => onTaskClick?.(task)}
                      onEdit={() => onEditTask?.(task)}
                      onDelete={() => onDeleteTask?.(task)}
                      locale={locale}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Circle className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">
                    {locale === 'ar' ? 'لا توجد مهام' : 'No tasks'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </Droppable>
    </div>
  )
}

/**
 * Main Kanban Board Component
 */
export function TaskKanbanBoard({
  tasks,
  onTaskMove,
  onTaskClick,
  onAddTask,
  onEditTask,
  onDeleteTask,
  isLoading = false,
  locale = 'ar',
}: TaskKanbanBoardProps) {
  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      done: [],
      canceled: [],
    }

    tasks.forEach(task => {
      // Handle 'in progress' vs 'in_progress' status
      const status = task.status === 'in progress' ? 'in_progress' : task.status
      if (grouped[status]) {
        grouped[status].push(task)
      }
    })

    return grouped
  }, [tasks])

  // Handle drag end
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result

      // Dropped outside a droppable area
      if (!destination) return

      // Dropped in the same position
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return
      }

      // Get the new status from the destination column
      const newStatus = destination.droppableId as TaskStatus

      // Call the move handler
      onTaskMove?.(draggableId, newStatus)
    },
    [onTaskMove]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-4 min-h-[500px]" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id] || []}
              onTaskClick={onTaskClick}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onAddTask={() => onAddTask?.(column.id)}
              locale={locale}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </DragDropContext>
  )
}

export default TaskKanbanBoard

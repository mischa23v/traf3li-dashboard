/**
 * Tasks Gantt Chart View
 *
 * A TRUE Gantt chart showing:
 * - Horizontal bars spanning from startDate to dueDate
 * - Task dependencies (blocks/blocked_by relationships)
 * - Progress indicators on each bar
 * - Assignee swimlanes for grouping
 * - Critical path awareness
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from '@tanstack/react-router'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addWeeks,
  addMonths,
  differenceInDays,
  isSameDay,
  startOfDay,
  isBefore,
  isAfter,
  isWithinInterval,
  getWeek,
  min,
  max
} from 'date-fns'
import { arSA, enUS } from 'date-fns/locale'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Bell,
  List,
  Loader2,
  AlertCircle,
  User,
  Users,
  Link as LinkIcon,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  Plus
} from 'lucide-react'
import { PERF_DEBUG, perfLog } from '@/lib/perf-debug'
import { ROUTES } from '@/constants/routes'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { DynamicIsland } from '@/components/dynamic-island'
import { Main } from '@/components/layout/main'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTasks } from '@/hooks/useTasks'
import { cn } from '@/lib/utils'

// Types
type ViewMode = 'week' | 'month' | 'quarter'
type GroupBy = 'none' | 'assignee' | 'priority' | 'status'

interface GanttTask {
  id: string
  title: string
  startDate: Date
  endDate: Date
  progress: number
  priority: string
  status: string
  assigneeId: string | null
  assigneeName: string | null
  caseName: string | null
  isOverdue: boolean
  dependencies: {
    taskId: string
    type: 'blocks' | 'blocked_by' | 'related'
  }[]
  blockedBy: string[]
  blocks: string[]
}

interface TaskGroup {
  id: string
  label: string
  tasks: GanttTask[]
}

// Constants - Enhanced for better visual design
const DAY_WIDTH = {
  week: 100,   // Wider for week view
  month: 40,   // Wider for better readability
  quarter: 16  // Slightly wider
}

const MIN_BAR_WIDTH = 32
const ROW_HEIGHT = 56  // Taller rows for prominence
const BAR_HEIGHT = 28  // Taller bars (was 24px)
const TASK_COLUMN_WIDTH = 280  // Wider task column

export function TasksTimelineView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  const locale = isRTL ? arSA : enUS
  const ganttRef = useRef<HTMLDivElement>(null)

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [groupBy, setGroupBy] = useState<GroupBy>('assignee')
  const [baseDate, setBaseDate] = useState(startOfDay(new Date()))
  const [hoveredTask, setHoveredTask] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(10) // Load-more pagination: show 10 tasks at a time

  // Performance profiling
  const renderCount = useRef(0)
  const mountTime = useRef(performance.now())

  useEffect(() => {
    perfLog('TasksTimelineView MOUNTED')
    return () => perfLog('TasksTimelineView UNMOUNTED')
  }, [])

  renderCount.current++
  if (PERF_DEBUG && renderCount.current <= 5) {
    perfLog(`TasksTimelineView RENDER #${renderCount.current}`, {
      timeSinceMount: (performance.now() - mountTime.current).toFixed(2) + 'ms'
    })
  }

  // Calculate date range based on view mode
  const { rangeStart, rangeEnd, days, weeks } = useMemo(() => {
    let start: Date
    let end: Date

    if (viewMode === 'week') {
      start = startOfWeek(baseDate, { weekStartsOn: 0 })
      end = endOfWeek(baseDate, { weekStartsOn: 0 })
    } else if (viewMode === 'month') {
      start = startOfMonth(baseDate)
      end = endOfMonth(baseDate)
    } else {
      // Quarter - 3 months
      start = startOfMonth(baseDate)
      end = endOfMonth(addMonths(baseDate, 2))
    }

    // Generate days array
    const daysArray: Date[] = []
    let current = start
    while (current <= end) {
      daysArray.push(current)
      current = addDays(current, 1)
    }

    // Generate weeks array for month/quarter view headers
    const weeksArray: { weekNum: number; startDay: number; endDay: number; daysCount: number }[] = []
    if (viewMode !== 'week') {
      let weekStart = 0
      let currentWeek = getWeek(daysArray[0], { weekStartsOn: 0 })

      daysArray.forEach((day, idx) => {
        const dayWeek = getWeek(day, { weekStartsOn: 0 })
        if (dayWeek !== currentWeek || idx === daysArray.length - 1) {
          const endIdx = idx === daysArray.length - 1 ? idx : idx - 1
          weeksArray.push({
            weekNum: currentWeek,
            startDay: weekStart,
            endDay: endIdx,
            daysCount: endIdx - weekStart + 1
          })
          weekStart = idx
          currentWeek = dayWeek
        }
      })
      // Handle last week if not added
      if (weeksArray.length === 0 || weeksArray[weeksArray.length - 1].endDay < daysArray.length - 1) {
        weeksArray.push({
          weekNum: currentWeek,
          startDay: weekStart,
          endDay: daysArray.length - 1,
          daysCount: daysArray.length - weekStart
        })
      }
    }

    return { rangeStart: start, rangeEnd: end, days: daysArray, weeks: weeksArray }
  }, [viewMode, baseDate])

  // Navigation
  const goBack = useCallback(() => {
    if (viewMode === 'week') {
      setBaseDate(prev => addWeeks(prev, -1))
    } else if (viewMode === 'month') {
      setBaseDate(prev => addMonths(prev, -1))
    } else {
      setBaseDate(prev => addMonths(prev, -3))
    }
  }, [viewMode])

  const goForward = useCallback(() => {
    if (viewMode === 'week') {
      setBaseDate(prev => addWeeks(prev, 1))
    } else if (viewMode === 'month') {
      setBaseDate(prev => addMonths(prev, 1))
    } else {
      setBaseDate(prev => addMonths(prev, 3))
    }
  }, [viewMode])

  const goToToday = useCallback(() => {
    setBaseDate(startOfDay(new Date()))
  }, [])

  // Fetch tasks - get all tasks for Gantt (not just filtered by date)
  const filters = useMemo(() => ({
    status: ['backlog', 'todo', 'in_progress'],
    isArchived: false,
    sortBy: 'startDate',
    sortOrder: 'asc'
  }), [])

  const { data: tasksData, isLoading, isError, error, refetch } = useTasks(filters)

  // Transform tasks for Gantt
  const ganttTasks = useMemo((): GanttTask[] => {
    if (!tasksData?.tasks) return []

    const today = startOfDay(new Date())

    return tasksData.tasks
      .filter((task: any) => task && task._id)
      .map((task: any) => {
        // Calculate dates
        let startDate = task.startDate ? new Date(task.startDate) : null
        let endDate = task.dueDate ? new Date(task.dueDate) : null

        // If no start date, use creation date or 3 days before due date
        if (!startDate && endDate) {
          startDate = addDays(endDate, -3)
        } else if (!startDate) {
          startDate = task.createdAt ? new Date(task.createdAt) : today
        }

        // If no end date, calculate from estimated duration or default to 3 days
        if (!endDate) {
          const estimatedMinutes = task.timeTracking?.estimatedMinutes || 0
          if (estimatedMinutes > 0) {
            // Convert minutes to days (8 hour work day)
            const estimatedDays = Math.ceil(estimatedMinutes / 480) || 1
            endDate = addDays(startDate, estimatedDays)
          } else {
            endDate = addDays(startDate, 3)
          }
        }

        // Ensure end is after start
        if (isBefore(endDate, startDate)) {
          endDate = addDays(startDate, 1)
        }

        const isOverdue = isBefore(endDate, today) && task.status !== 'done'

        return {
          id: task._id,
          title: task.title || task.description || t('tasks.list.notSet'),
          startDate,
          endDate,
          progress: task.progress || 0,
          priority: task.priority || 'medium',
          status: task.status || 'todo',
          assigneeId: task.assignedTo?._id || task.assignedTo || null,
          assigneeName: task.assignedTo?.name || task.assignedTo?.username || null,
          caseName: task.caseId?.title || task.caseId?.caseNumber || null,
          isOverdue,
          dependencies: task.dependencies || [],
          blockedBy: task.blockedBy || [],
          blocks: task.blocks || []
        }
      })
      // Filter to only tasks that overlap with the current range (strict - no buffer)
      .filter((task: GanttTask) => {
        // Task overlaps with range if:
        // 1. Task starts within range, OR
        // 2. Task ends within range, OR
        // 3. Task spans the entire range (starts before, ends after)
        return (
          isWithinInterval(task.startDate, { start: rangeStart, end: rangeEnd }) ||
          isWithinInterval(task.endDate, { start: rangeStart, end: rangeEnd }) ||
          (isBefore(task.startDate, rangeStart) && isAfter(task.endDate, rangeEnd))
        )
      })
  }, [tasksData, rangeStart, rangeEnd, t])

  // Paginated tasks - slice based on visibleCount
  const visibleGanttTasks = useMemo(() => {
    return ganttTasks.slice(0, visibleCount)
  }, [ganttTasks, visibleCount])

  // Check if there are more tasks to load
  const hasMoreTasks = ganttTasks.length > visibleCount

  // Load more handler
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + 10)
  }, [])

  // Group tasks (using visible tasks for display)
  const taskGroups = useMemo((): TaskGroup[] => {
    if (groupBy === 'none') {
      return [{
        id: 'all',
        label: t('gantt.allTasks', 'All Tasks'),
        tasks: visibleGanttTasks
      }]
    }

    const groups = new Map<string, GanttTask[]>()

    visibleGanttTasks.forEach(task => {
      let key: string
      let label: string

      if (groupBy === 'assignee') {
        key = task.assigneeId || 'unassigned'
        label = task.assigneeName || t('tasks.filters.unassigned', 'Unassigned')
      } else if (groupBy === 'priority') {
        key = task.priority
        label = t(`tasks.priorities.${task.priority}`, task.priority)
      } else {
        key = task.status
        label = t(`tasks.statuses.${task.status}`, task.status)
      }

      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(task)
    })

    // Convert to array and sort
    return Array.from(groups.entries())
      .map(([id, tasks]) => {
        let label = id
        if (groupBy === 'assignee') {
          label = tasks[0]?.assigneeName || t('tasks.filters.unassigned', 'Unassigned')
        } else if (groupBy === 'priority') {
          label = t(`tasks.priorities.${id}`, id)
        } else {
          label = t(`tasks.statuses.${id}`, id)
        }
        return { id, label, tasks }
      })
      .sort((a, b) => {
        if (groupBy === 'priority') {
          const order = ['critical', 'high', 'medium', 'low']
          return order.indexOf(a.id) - order.indexOf(b.id)
        }
        return a.label.localeCompare(b.label)
      })
  }, [visibleGanttTasks, groupBy, t])

  // Calculate bar position and width
  const getBarStyle = useCallback((task: GanttTask) => {
    const dayWidth = DAY_WIDTH[viewMode]
    const totalDays = days.length

    // Calculate position from range start
    const startOffset = Math.max(0, differenceInDays(task.startDate, rangeStart))
    const endOffset = Math.min(totalDays, differenceInDays(task.endDate, rangeStart) + 1)

    // Calculate width
    const barDays = endOffset - startOffset
    const width = Math.max(MIN_BAR_WIDTH, barDays * dayWidth)

    // Position
    const left = startOffset * dayWidth

    return {
      [isRTL ? 'right' : 'left']: `${left}px`,
      width: `${width}px`
    }
  }, [days.length, rangeStart, viewMode, isRTL])

  // Get priority color - Bold, saturated colors for visual impact
  const getPriorityColor = useCallback((priority: string, isOverdue: boolean) => {
    if (isOverdue) return 'bg-rose-500'
    switch (priority) {
      case 'critical': return 'bg-rose-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-amber-500'
      case 'low': return 'bg-emerald-500'
      default: return 'bg-slate-500'
    }
  }, [])

  // Get lighter priority color for bar background
  const getPriorityBgColor = useCallback((priority: string, isOverdue: boolean) => {
    if (isOverdue) return 'bg-rose-100'
    switch (priority) {
      case 'critical': return 'bg-rose-100'
      case 'high': return 'bg-orange-100'
      case 'medium': return 'bg-amber-100'
      case 'low': return 'bg-emerald-100'
      default: return 'bg-slate-100'
    }
  }, [])

  // Get priority gradient for bars
  const getPriorityGradient = useCallback((priority: string, isOverdue: boolean) => {
    if (isOverdue) return 'from-rose-500 to-rose-600'
    switch (priority) {
      case 'critical': return 'from-rose-500 to-rose-600'
      case 'high': return 'from-orange-400 to-orange-500'
      case 'medium': return 'from-amber-400 to-amber-500'
      case 'low': return 'from-emerald-400 to-emerald-500'
      default: return 'from-slate-400 to-slate-500'
    }
  }, [])

  // Get status icon
  const getStatusIcon = useCallback((status: string, isOverdue: boolean) => {
    if (isOverdue) return <AlertTriangle className="h-3 w-3" />
    if (status === 'in_progress') return <Loader2 className="h-3 w-3 animate-spin" />
    if (status === 'done') return <CheckCircle2 className="h-3 w-3" />
    return null
  }, [])

  const topNav = [
    { title: t('tasks.nav.overview'), href: ROUTES.dashboard.overview, isActive: false },
    { title: t('tasks.nav.tasks'), href: ROUTES.dashboard.tasks.list, isActive: false },
    { title: t('tasks.nav.cases'), href: ROUTES.dashboard.cases.list, isActive: false },
    { title: t('tasks.nav.clients'), href: ROUTES.dashboard.clients.list, isActive: false },
  ]

  // Stats
  const totalTasks = ganttTasks.length
  const overdueCount = ganttTasks.filter(t => t.isOverdue).length
  const inProgressCount = ganttTasks.filter(t => t.status === 'in_progress').length

  // Today line position
  const today = startOfDay(new Date())
  const todayOffset = differenceInDays(today, rangeStart)
  const showTodayLine = todayOffset >= 0 && todayOffset < days.length

  return (
    <>
      {/* Header */}
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

        {/* Dynamic Island - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>

        <div className="ms-auto flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white hidden sm:flex flex-shrink-0" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white hidden lg:flex flex-shrink-0" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white flex-shrink-0" />
        </div>
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Hero */}
        <ProductivityHero
          badge={t('gantt.badge', 'Gantt Chart')}
          title={t('gantt.title', 'Project Timeline')}
          type="tasks"
        />

        {/* Full Width Layout - Maximized for Gantt Chart */}
        <div className="space-y-4">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
              {/* Left: Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goBack}
                  className="h-9 w-9 rounded-xl hover:bg-slate-100"
                >
                  <ChevronLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="h-9 px-3 rounded-xl text-sm font-medium"
                  title={t('gantt.goToToday', 'Jump to today\'s date')}
                >
                  <Calendar className="h-4 w-4 me-1.5" />
                  {format(new Date(), 'd MMM', { locale })}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goForward}
                  className="h-9 w-9 rounded-xl hover:bg-slate-100"
                >
                  <ChevronRight className={cn("h-5 w-5", isRTL && "rotate-180")} />
                </Button>
              </div>

              {/* Center: View Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    viewMode === 'week'
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t('gantt.week', 'Week')}
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    viewMode === 'month'
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t('gantt.month', 'Month')}
                </button>
                <button
                  onClick={() => setViewMode('quarter')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    viewMode === 'quarter'
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t('gantt.quarter', 'Quarter')}
                </button>
              </div>

              {/* Right: Group By & List Link */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setGroupBy('none')}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      groupBy === 'none'
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    )}
                    title={t('gantt.noGrouping', 'No Grouping')}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setGroupBy('assignee')}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      groupBy === 'assignee'
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    )}
                    title={t('gantt.groupByAssignee', 'Group by Assignee')}
                  >
                    <Users className="h-4 w-4" />
                  </button>
                </div>

                <Link to={ROUTES.dashboard.tasks.list}>
                  <Button variant="ghost" size="sm" className="h-9 rounded-xl text-slate-500">
                    <List className="h-4 w-4 me-1" />
                    {t('gantt.listView', 'List')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Bar */}
            {!isLoading && !isError && (
              <div className="flex items-center gap-6 text-sm px-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-slate-500 cursor-help">
                      <Calendar className="h-4 w-4" />
                      <span>
                        <strong className="text-slate-700">{visibleGanttTasks.length}</strong>
                        {hasMoreTasks && <span className="text-slate-400">/{totalTasks}</span>}
                        {' '}{t('gantt.tasks', 'tasks')}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white border border-slate-200 shadow-lg p-3">
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-slate-700">{t('tasks.priorities.critical', 'Critical')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-slate-700">{t('tasks.priorities.high', 'High')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <span className="text-slate-700">{t('tasks.priorities.medium', 'Medium')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-700">{t('tasks.priorities.low', 'Low')}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 pt-1 border-t border-slate-100">
                        <div className="w-0.5 h-3 bg-emerald-500" />
                        <span className="text-slate-700">{t('gantt.todayLine', 'Today')}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
                {inProgressCount > 0 && (
                  <div className="flex items-center gap-2 text-blue-500">
                    <Loader2 className="h-4 w-4" />
                    <span><strong>{inProgressCount}</strong> {t('gantt.inProgress', 'in progress')}</span>
                  </div>
                )}
                {overdueCount > 0 && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="h-4 w-4" />
                    <span><strong>{overdueCount}</strong> {t('gantt.overdue', 'overdue')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
                  <p className="text-slate-500 text-sm">{t('common.loading', 'Loading...')}</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {isError && !isLoading && (
              <div className="bg-red-50 rounded-2xl p-12 text-center border border-red-100">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('gantt.loadError', 'Error Loading Chart')}</h3>
                <p className="text-slate-500 mb-4">{error?.message || t('common.tryAgain', 'Please try again')}</p>
                <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
                  {t('common.retry', 'Retry')}
                </Button>
              </div>
            )}

            {/* Gantt Chart */}
            {!isLoading && !isError && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Timeline Header - Two-row design like professional Gantt charts */}
                <div className="flex flex-col">
                  {/* Row 1: Week headers (for month/quarter) or Month header (for week view) */}
                  <div className="flex border-b border-slate-200 bg-slate-800">
                    {/* Task Column Header */}
                    <div
                      className="flex-shrink-0 bg-slate-900 border-e border-slate-700 p-3 flex items-center"
                      style={{ width: `${TASK_COLUMN_WIDTH}px` }}
                    >
                      <span className="text-sm font-bold text-white uppercase tracking-wider">
                        {t('gantt.taskName', 'Task')}
                      </span>
                    </div>

                    {/* Week/Month Headers */}
                    <div ref={ganttRef} className="flex-1 overflow-x-auto">
                      <div
                        className="flex"
                        style={{ width: `${days.length * DAY_WIDTH[viewMode]}px` }}
                      >
                        {viewMode === 'week' ? (
                          // Week view: Show single month header
                          <div
                            className="flex-1 text-center py-2 text-white font-bold text-sm"
                            style={{ width: `${days.length * DAY_WIDTH[viewMode]}px` }}
                          >
                            {format(baseDate, 'MMMM yyyy', { locale })}
                          </div>
                        ) : (
                          // Month/Quarter view: Show week headers
                          weeks.map((week, idx) => (
                            <div
                              key={`week-${week.weekNum}-${idx}`}
                              className={cn(
                                "text-center py-2 border-e border-slate-700 text-white font-semibold text-sm",
                                idx % 2 === 0 ? "bg-slate-800" : "bg-slate-700"
                              )}
                              style={{ width: `${week.daysCount * DAY_WIDTH[viewMode]}px` }}
                            >
                              {t('gantt.week', 'Week')} {week.weekNum}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Day headers - Only show for week/month views, hide for quarter */}
                  {viewMode !== 'quarter' && (
                    <div className="flex border-b-2 border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50">
                      {/* Empty space under Task column */}
                      <div
                        className="flex-shrink-0 border-e-2 border-slate-200"
                        style={{ width: `${TASK_COLUMN_WIDTH}px` }}
                      />

                      {/* Day Headers */}
                      <div className="flex-1 overflow-x-auto">
                        <div
                          className="flex"
                          style={{ width: `${days.length * DAY_WIDTH[viewMode]}px` }}
                        >
                          {days.map((day, idx) => {
                            const isToday = isSameDay(day, today)
                            const isWeekend = day.getDay() === 0 || day.getDay() === 6

                            return (
                              <div
                                key={day.toISOString()}
                                className={cn(
                                  "flex-shrink-0 text-center border-e border-slate-100 py-2",
                                  isToday && "bg-emerald-50 border-e-emerald-200",
                                  isWeekend && !isToday && "bg-slate-50"
                                )}
                                style={{ width: `${DAY_WIDTH[viewMode]}px` }}
                              >
                                {viewMode === 'week' && (
                                  <div className={cn(
                                    "text-xs mb-0.5",
                                    isToday ? "text-emerald-600 font-semibold" : isWeekend ? "text-slate-400" : "text-slate-500"
                                  )}>
                                    {format(day, 'EEE', { locale })}
                                  </div>
                                )}
                                <div className={cn(
                                  "text-xs font-bold",
                                  isToday ? "bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto" :
                                  isWeekend ? "text-slate-400" : "text-slate-600"
                                )}>
                                  {format(day, 'd', { locale })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gantt Body */}
                <div className="max-h-[600px] overflow-y-auto">
                  {taskGroups.map((group, groupIndex) => (
                    <div key={group.id}>
                      {/* Group Header - Dark navy style like professional Gantt charts */}
                      {groupBy !== 'none' && (
                        <div className="flex bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
                          <div
                            className="flex-shrink-0 p-3 border-e border-slate-700"
                            style={{ width: `${TASK_COLUMN_WIDTH}px` }}
                          >
                            <div className="flex items-center gap-3">
                              {groupBy === 'assignee' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                              )}
                              {groupBy === 'priority' && (
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
                                  group.id === 'critical' ? "bg-gradient-to-br from-rose-400 to-rose-600" :
                                  group.id === 'high' ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                                  group.id === 'medium' ? "bg-gradient-to-br from-amber-400 to-amber-600" :
                                  "bg-gradient-to-br from-emerald-400 to-emerald-600"
                                )}>
                                  <AlertTriangle className="h-4 w-4 text-white" />
                                </div>
                              )}
                              {groupBy === 'status' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                              )}
                              <div>
                                <span className="text-sm font-bold text-white">{group.label}</span>
                                <span className="text-xs text-cyan-300 ms-2 bg-slate-700 px-2 py-0.5 rounded-full">
                                  {group.tasks.length}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Dark bar extending across timeline */}
                          <div className="flex-1 bg-slate-800" />
                        </div>
                      )}

                      {/* Task Rows - Enhanced with alternating backgrounds and priority strip */}
                      {group.tasks.map((task, taskIndex) => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex border-b border-slate-100 transition-all duration-200 group relative overflow-hidden",
                            taskIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                            hoveredTask === task.id && "bg-emerald-50/70 shadow-sm",
                            selectedTask === task.id && "bg-emerald-100/70 shadow-inner"
                          )}
                          style={{ minHeight: `${ROW_HEIGHT}px` }}
                          onMouseEnter={() => setHoveredTask(task.id)}
                          onMouseLeave={() => setHoveredTask(null)}
                        >
                          {/* Priority Strip Indicator - Colored left border like task list */}
                          <div className={cn(
                            "absolute start-0 top-0 bottom-0 w-1.5 transition-all duration-300",
                            task.isOverdue ? 'bg-rose-500' :
                            task.priority === 'critical' ? 'bg-rose-500' :
                            task.priority === 'high' ? 'bg-orange-500' :
                            task.priority === 'medium' ? 'bg-amber-400' :
                            task.priority === 'low' ? 'bg-emerald-400' :
                            'bg-slate-300'
                          )} />

                          {/* Task Name - Enhanced with icon like task list */}
                          <div
                            className="flex-shrink-0 p-3 ps-5 border-e border-slate-100 cursor-pointer hover:bg-white/80 transition-colors"
                            style={{ width: `${TASK_COLUMN_WIDTH}px` }}
                            onClick={() => navigate({ to: ROUTES.dashboard.tasks.detail(task.id) })}
                          >
                            <div className="flex items-center gap-3">
                              {/* Status Icon Box - Like task list design */}
                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 border",
                                task.isOverdue ? 'bg-red-50 text-red-600 border-red-200' :
                                task.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                task.status === 'done' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                'bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                              )}>
                                {task.isOverdue ? <AlertTriangle className="h-4 w-4" strokeWidth={1.5} /> :
                                 task.status === 'in_progress' ? <Clock className="h-4 w-4" strokeWidth={1.5} /> :
                                 task.status === 'done' ? <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} /> :
                                 <Briefcase className="h-4 w-4" strokeWidth={1.5} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-slate-800 truncate block group-hover:text-emerald-600 transition-colors">
                                  {task.title}
                                </span>
                                {/* Case name if available */}
                                {task.caseName && (
                                  <span className="text-xs text-slate-400 truncate block mt-0.5">
                                    {task.caseName}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Dependencies indicator */}
                            {(task.blockedBy.length > 0 || task.blocks.length > 0) && (
                              <div className="flex items-center gap-1.5 mt-1.5 ms-12">
                                <LinkIcon className="h-3 w-3 text-slate-400" />
                                <span className="text-xs text-slate-500">
                                  {task.blockedBy.length > 0 && `${task.blockedBy.length} ${t('gantt.blockedBy', 'blocker')}`}
                                  {task.blockedBy.length > 0 && task.blocks.length > 0 && ' • '}
                                  {task.blocks.length > 0 && `${t('gantt.blocks', 'blocks')} ${task.blocks.length}`}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Gantt Bar Area - Enhanced */}
                          <div
                            className="flex-1 relative overflow-hidden"
                            style={{ minHeight: `${ROW_HEIGHT}px` }}
                          >
                            {/* Grid lines - Enhanced */}
                            <div
                              className="absolute inset-0 flex"
                              style={{ width: `${days.length * DAY_WIDTH[viewMode]}px` }}
                            >
                              {days.map((day) => {
                                const isToday = isSameDay(day, today)
                                const isWeekend = day.getDay() === 0 || day.getDay() === 6
                                return (
                                  <div
                                    key={day.toISOString()}
                                    className={cn(
                                      "flex-shrink-0 border-e border-slate-100/80",
                                      isToday && "bg-emerald-50/50",
                                      isWeekend && !isToday && "bg-slate-100/40"
                                    )}
                                    style={{ width: `${DAY_WIDTH[viewMode]}px` }}
                                  />
                                )
                              })}
                            </div>

                            {/* Today line - Enhanced with glow */}
                            {showTodayLine && (
                              <div
                                className="absolute top-0 bottom-0 z-20 flex flex-col items-center"
                                style={{ [isRTL ? 'right' : 'left']: `${todayOffset * DAY_WIDTH[viewMode] + DAY_WIDTH[viewMode] / 2 - 1}px` }}
                              >
                                <div className="w-0.5 h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              </div>
                            )}

                            {/* Task Bar - Enhanced with gradient and shadow */}
                            <div
                              className={cn(
                                "absolute cursor-pointer transition-all duration-200 z-10 rounded-lg overflow-hidden",
                                "shadow-md hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5",
                                hoveredTask === task.id && "ring-2 ring-emerald-400 ring-offset-2",
                                selectedTask === task.id && "ring-2 ring-emerald-500 ring-offset-2"
                              )}
                              style={{
                                ...getBarStyle(task),
                                top: `${(ROW_HEIGHT - BAR_HEIGHT) / 2}px`,
                                height: `${BAR_HEIGHT}px`
                              }}
                              onClick={() => {
                                setSelectedTask(task.id === selectedTask ? null : task.id)
                              }}
                              onDoubleClick={() => navigate({ to: ROUTES.dashboard.tasks.detail(task.id) })}
                            >
                              {/* Background with lighter color */}
                              <div className={cn(
                                "absolute inset-0",
                                getPriorityBgColor(task.priority, task.isOverdue)
                              )} />

                              {/* Progress fill with gradient */}
                              <div
                                className={cn(
                                  "absolute inset-y-0 bg-gradient-to-r",
                                  isRTL ? "right-0" : "left-0",
                                  getPriorityGradient(task.priority, task.isOverdue)
                                )}
                                style={{ width: `${Math.max(task.progress, 10)}%` }}
                              />

                              {/* Subtle inner shadow */}
                              <div className="absolute inset-0 rounded-lg shadow-inner pointer-events-none" />

                              {/* Bar content - Enhanced */}
                              <div className="relative h-full flex items-center px-3 gap-2">
                                {/* Progress text */}
                                <span className={cn(
                                  "text-xs font-bold drop-shadow-sm",
                                  task.progress > 30 ? "text-white" : "text-slate-700"
                                )}>
                                  {task.progress}%
                                </span>
                                {/* Overdue warning icon */}
                                {task.isOverdue && (
                                  <AlertTriangle className="h-3.5 w-3.5 text-white drop-shadow-sm" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Load More Button */}
                  {hasMoreTasks && (
                    <div className="flex justify-center py-4 border-t border-slate-100 bg-slate-50/50">
                      <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        className="h-11 px-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-600 font-bold transition-all"
                      >
                        <Plus className="w-5 h-5 me-2" />
                        {t('tasks.list.showMore', 'Show More')}
                        <span className="text-xs text-slate-400 ms-2">
                          ({visibleGanttTasks.length} / {totalTasks})
                        </span>
                      </Button>
                    </div>
                  )}

                  {/* Empty State */}
                  {taskGroups.length === 0 || taskGroups.every(g => g.tasks.length === 0) && (
                    <div className="p-12 text-center">
                      <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-700 mb-2">{t('gantt.noTasks', 'No Tasks')}</h3>
                      <p className="text-sm text-slate-500">{t('gantt.noTasksDescription', 'No tasks found in this time range')}</p>
                    </div>
                  )}
                </div>

              </div>
            )}

        </div>
      </Main>
    </>
  )
}

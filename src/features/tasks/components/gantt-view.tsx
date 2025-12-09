import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ZoomIn,
  ZoomOut,
  Calendar,
  Flag,
  Filter,
  RotateCcw,
  Bell,
  AlertCircle,
  Briefcase,
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
import { ProductivityHero } from '@/components/productivity-hero'
import { TasksSidebar } from './tasks-sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useProductivityGanttData,
  useUpdateTaskSchedule,
  useUpdateTaskProgress,
} from '@/hooks/useGantt'
import type { TimeScale, SourceType } from '@/types/gantt'

// Gantt will be loaded dynamically - use ref to ensure stable reference
let ganttInstance: any = null

export function GanttView() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const containerRef = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<any>(null)
  const [isGanttLoaded, setIsGanttLoaded] = useState(false)
  const [isGanttInitialized, setIsGanttInitialized] = useState(false)
  const [timeScale, setTimeScale] = useState<TimeScale>('day')
  const [showCriticalPath, setShowCriticalPath] = useState(false)
  const [filterType, setFilterType] = useState<SourceType | 'all'>('all')

  // Fetch productivity data (tasks + reminders + events)
  const { data: productivityData, isLoading, isError, error, refetch } = useProductivityGanttData()

  // Derived data for DHTMLX Gantt
  const ganttData = productivityData ? {
    data: filterType === 'all'
      ? productivityData.data
      : productivityData.data.filter(item => item.sourceType === filterType),
    links: productivityData.links
  } : null

  const summary = productivityData?.summary

  // Mutations
  const { mutate: updateSchedule } = useUpdateTaskSchedule()
  const { mutate: updateProgress } = useUpdateTaskProgress()

  const topNav = [
    { title: t('tasks.nav.overview'), href: '/dashboard/overview', isActive: false },
    { title: t('tasks.nav.tasks'), href: '/dashboard/tasks/list', isActive: false },
    { title: t('tasks.nav.cases'), href: '/dashboard/cases', isActive: false },
    { title: t('tasks.nav.clients'), href: '/dashboard/clients', isActive: false },
  ]

  // Load DHTMLX Gantt
  useEffect(() => {
    const loadGantt = async () => {
      try {
        // Dynamic import of dhtmlx-gantt
        const module = await import('dhtmlx-gantt')
        ganttInstance = module.gantt || module.default?.gantt || (window as any).gantt
        ganttRef.current = ganttInstance

        // Import CSS
        await import('dhtmlx-gantt/codebase/dhtmlxgantt.css')

        // Verify gantt is properly loaded with required methods
        if (ganttInstance && typeof ganttInstance.init === 'function' && typeof ganttInstance.parse === 'function') {
          setIsGanttLoaded(true)
        } else {
          if (import.meta.env.DEV) {
            console.warn('[Gantt] Library loaded but missing required methods')
          }
        }
      } catch (err) {
        // Silently handle gantt load errors - will show in UI error state
        if (import.meta.env.DEV) {
          console.warn('[Gantt] Load failed:', err)
        }
      }
    }
    loadGantt()
  }, [])

  // Initialize Gantt when loaded
  useEffect(() => {
    const gantt = ganttRef.current
    if (!isGanttLoaded || !containerRef.current || !gantt) return

    // Configure Gantt date format to match backend API
    // Backend sends: "YYYY-MM-DD HH:mm" (e.g., "2025-01-15 00:00")
    // IMPORTANT: Set this BEFORE gantt.init() and let gantt.parse() handle it natively
    gantt.config.date_format = '%Y-%m-%d %H:%i'
    gantt.config.xml_date = '%Y-%m-%d %H:%i'

    // Duration settings
    gantt.config.scale_unit = 'day'
    gantt.config.duration_unit = 'day'

    gantt.config.scale_height = 50
    gantt.config.row_height = 40
    gantt.config.min_column_width = 50
    gantt.config.fit_tasks = true
    gantt.config.auto_scheduling = true
    gantt.config.auto_scheduling_strict = true
    gantt.config.drag_progress = true
    gantt.config.drag_resize = true
    gantt.config.drag_move = true
    gantt.config.drag_links = true
    gantt.config.show_progress = true
    gantt.config.rtl = isRTL

    // Configure columns
    gantt.config.columns = [
      {
        name: 'text',
        label: t('ganttTasks.taskName'),
        tree: true,
        width: 200,
        resize: true,
      },
      {
        name: 'start_date',
        label: t('ganttTasks.startDate'),
        align: 'center',
        width: 100,
        template: (obj: any) => {
          if (!obj.start_date) return ''
          // Handle both Date objects and strings
          const date = obj.start_date instanceof Date ? obj.start_date : new Date(obj.start_date)
          if (isNaN(date.getTime())) return ''
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        },
      },
      {
        name: 'duration',
        label: t('ganttTasks.duration'),
        align: 'center',
        width: 60,
      },
      {
        name: 'assignee',
        label: t('ganttTasks.assignee'),
        align: 'center',
        width: 100,
      },
      {
        name: 'progress',
        label: '%',
        align: 'center',
        width: 50,
        template: (obj: any) => `${Math.round((obj.progress || 0) * 100)}%`,
      },
    ]

    // Configure time scales
    updateTimeScale(timeScale)

    // Enable critical path highlighting
    gantt.config.highlight_critical_path = showCriticalPath

    // Task templates - Color by source type and priority
    gantt.templates.task_class = (_start: Date, _end: Date, task: any) => {
      const classes = []
      // Source type styling
      if (task.sourceType === 'reminder') classes.push('gantt-task-reminder')
      if (task.sourceType === 'event') classes.push('gantt-task-event')
      // Priority styling for tasks
      if (task.sourceType === 'task') {
        if (task.priority === 'urgent' || task.priority === 'critical') classes.push('gantt-task-urgent')
        if (task.priority === 'high') classes.push('gantt-task-high')
      }
      // Overdue tasks
      if (task.isOverdue) classes.push('gantt-task-critical')
      // Milestones
      if (task.type === 'milestone') classes.push('gantt-milestone')
      return classes.join(' ')
    }

    // Initialize
    gantt.init(containerRef.current)
    setIsGanttInitialized(true)

    // Helper to format dates for API (YYYY-MM-DD HH:mm)
    const formatDateForAPI = gantt.date.date_to_str('%Y-%m-%d %H:%i')

    // Event handlers - only allow editing tasks (not reminders/events through Gantt drag)
    gantt.attachEvent('onAfterTaskDrag', (id: string, _mode: any) => {
      const task = gantt.getTask(id)
      // Only update if it's a task (not reminder or event)
      if (task.sourceType === 'task' && task.sourceId) {
        updateSchedule({
          taskId: task.sourceId,
          data: {
            // Format dates for API
            startDate: formatDateForAPI(task.start_date),
            endDate: formatDateForAPI(task.end_date),
            duration: task.duration,
          },
        })
      }
    })

    gantt.attachEvent('onAfterProgressDrag', (id: string, progress: number) => {
      const task = gantt.getTask(id)
      if (task.sourceType === 'task' && task.sourceId) {
        // API expects 0-100, Gantt uses 0-1
        updateProgress({ taskId: task.sourceId, progress: Math.round(progress * 100) })
      }
    })

    // Cleanup
    return () => {
      if (gantt) {
        gantt.clearAll()
        setIsGanttInitialized(false)
      }
    }
  }, [isGanttLoaded, isRTL, timeScale, showCriticalPath, t, updateSchedule, updateProgress])

  // Load data into Gantt
  useEffect(() => {
    const gantt = ganttRef.current
    if (!isGanttLoaded || !isGanttInitialized || !ganttData || !gantt) return

    try {
      // Filter out items without valid start_date
      const validData = ganttData.data.filter(item => {
        if (!item.start_date) return false
        // Validate the date string format
        if (typeof item.start_date === 'string' && item.start_date.trim() === '') return false
        return true
      })

      // Pass data directly to gantt.parse() - it handles the format automatically
      // Backend sends dates as "YYYY-MM-DD HH:mm" which matches our gantt.config.date_format
      gantt.clearAll()
      gantt.parse({
        data: validData,
        links: ganttData.links || []
      })
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[Gantt] Error parsing data:', err)
      }
    }
  }, [isGanttLoaded, isGanttInitialized, ganttData])

  // Update time scale
  const updateTimeScale = (scale: TimeScale) => {
    const gantt = ganttRef.current
    if (!gantt) return

    switch (scale) {
      case 'day':
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%F %Y' },
          { unit: 'day', step: 1, format: '%d' },
        ]
        break
      case 'week':
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%F %Y' },
          { unit: 'week', step: 1, format: t('ganttTasks.week') + ' %W' },
        ]
        break
      case 'month':
        gantt.config.scales = [
          { unit: 'year', step: 1, format: '%Y' },
          { unit: 'month', step: 1, format: '%F' },
        ]
        break
      case 'quarter':
        gantt.config.scales = [
          { unit: 'year', step: 1, format: '%Y' },
          { unit: 'quarter', step: 1, format: 'Q%q' },
        ]
        break
      case 'year':
        gantt.config.scales = [
          { unit: 'year', step: 1, format: '%Y' },
        ]
        break
    }
    gantt.render()
  }

  const handleTimeScaleChange = (scale: TimeScale) => {
    setTimeScale(scale)
    updateTimeScale(scale)
  }

  const handleZoomIn = () => {
    const scales: TimeScale[] = ['year', 'quarter', 'month', 'week', 'day']
    const currentIndex = scales.indexOf(timeScale)
    if (currentIndex < scales.length - 1) {
      handleTimeScaleChange(scales[currentIndex + 1])
    }
  }

  const handleZoomOut = () => {
    const scales: TimeScale[] = ['year', 'quarter', 'month', 'week', 'day']
    const currentIndex = scales.indexOf(timeScale)
    if (currentIndex > 0) {
      handleTimeScaleChange(scales[currentIndex - 1])
    }
  }

  const handleToggleCriticalPath = () => {
    setShowCriticalPath(!showCriticalPath)
    const gantt = ganttRef.current
    if (gantt) {
      gantt.config.highlight_critical_path = !showCriticalPath
      gantt.render()
    }
  }

  const handleFitToView = () => {
    const gantt = ganttRef.current
    if (gantt) {
      gantt.render()
    }
  }

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
        {/* ProductivityHero - Always visible */}
        <ProductivityHero
          badge={t('ganttTasks.gantt')}
          title={t('ganttTasks.title')}
          type="tasks"
        />

        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content - col-span-2 */}
          <div className="lg:col-span-2 space-y-6">

            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomOut}
                    className="h-9 w-9 rounded-xl"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomIn}
                    className="h-9 w-9 rounded-xl"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>

                  <Select value={timeScale} onValueChange={(v) => handleTimeScaleChange(v as TimeScale)}>
                    <SelectTrigger className="w-32 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">{t('ganttTasks.day')}</SelectItem>
                      <SelectItem value="week">{t('ganttTasks.week')}</SelectItem>
                      <SelectItem value="month">{t('ganttTasks.month')}</SelectItem>
                      <SelectItem value="quarter">{t('ganttTasks.quarter')}</SelectItem>
                      <SelectItem value="year">{t('ganttTasks.year')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleFitToView} className="h-9 rounded-xl">
                    <RotateCcw className="h-4 w-4 me-2" />
                    {t('ganttTasks.fitToView')}
                  </Button>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={showCriticalPath ? 'default' : 'outline'}
                    onClick={handleToggleCriticalPath}
                    className={`h-9 rounded-xl ${showCriticalPath ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  >
                    <Flag className="h-4 w-4 me-2" />
                    {t('ganttTasks.criticalPath')}
                  </Button>

                  {/* Filter by Type */}
                  <Select value={filterType} onValueChange={(v) => setFilterType(v as SourceType | 'all')}>
                    <SelectTrigger className="w-36 rounded-xl">
                      <Filter className="h-4 w-4 me-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('ganttTasks.filterAll')}</SelectItem>
                      <SelectItem value="task">{t('ganttTasks.filterTasks')}</SelectItem>
                      <SelectItem value="reminder">{t('ganttTasks.filterReminders')}</SelectItem>
                      <SelectItem value="event">{t('ganttTasks.filterEvents')}</SelectItem>
                    </SelectContent>
                  </Select>

                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Tasks */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-navy">
                      {summary?.tasks.total || 0}
                    </div>
                    <div className="text-xs text-slate-500">{t('ganttTasks.totalTasks')}</div>
                  </div>
                </div>
              </div>

              {/* Overdue/Critical Tasks */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <Flag className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-navy">
                      {summary?.tasks.overdue || 0}
                    </div>
                    <div className="text-xs text-slate-500">{t('ganttTasks.overdueTasks')}</div>
                  </div>
                </div>
              </div>

              {/* Reminders */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-navy">
                      {summary?.reminders.pending || 0}
                    </div>
                    <div className="text-xs text-slate-500">{t('ganttTasks.pendingReminders')}</div>
                  </div>
                </div>
              </div>

              {/* Events */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-navy">
                      {summary?.events.upcoming || 0}
                    </div>
                    <div className="text-xs text-slate-500">{t('ganttTasks.upcomingEvents')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gantt Chart Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Loading State */}
              {(isLoading || !isGanttLoaded) && (
                <div className="h-[500px] flex items-center justify-center">
                  <div className="text-center">
                    <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-4 w-32 mx-auto mb-2" />
                    <Skeleton className="h-3 w-24 mx-auto" />
                  </div>
                </div>
              )}

              {/* Error State */}
              {isError && !isLoading && (
                <div className="h-[500px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('ganttTasks.errors.loadError')}</h3>
                    <p className="text-slate-500 mb-4">{error?.message || t('ganttTasks.errors.connectionError')}</p>
                    <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 rounded-xl">
                      {t('common.retry')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !isError && isGanttLoaded && (!ganttData?.data || ganttData.data.length === 0) && (
                <div className="h-[500px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('ganttTasks.empty.title')}</h3>
                    <p className="text-slate-500 mb-4">{t('ganttTasks.empty.description')}</p>
                  </div>
                </div>
              )}

              {/* Gantt Chart */}
              {!isLoading && !isError && isGanttLoaded && ganttData?.data?.length > 0 && (
                <div
                  ref={containerRef}
                  className="gantt-container"
                  style={{ width: '100%', height: '500px' }}
                />
              )}
            </div>
          </div>

          {/* Sidebar - col-span-1 */}
          <TasksSidebar context="tasks" />
        </div>

        {/* Custom styles for Gantt */}
        <style>{`
          .gantt-container {
            font-family: 'IBM Plex Sans Arabic', sans-serif;
          }
          /* Default task style (emerald) */
          .gantt_task_line {
            background-color: #10b981;
            border-color: #059669;
            border-radius: 4px;
          }
          /* Reminder tasks (amber) */
          .gantt_task_line.gantt-task-reminder {
            background-color: #f59e0b !important;
            border-color: #d97706 !important;
          }
          /* Event tasks (blue) */
          .gantt_task_line.gantt-task-event {
            background-color: #3b82f6 !important;
            border-color: #2563eb !important;
          }
          /* Critical/Overdue tasks (red) */
          .gantt_task_line.gantt-task-critical {
            background-color: #ef4444 !important;
            border-color: #dc2626 !important;
          }
          /* Urgent priority tasks (orange) */
          .gantt_task_line.gantt-task-urgent {
            background-color: #f97316 !important;
            border-color: #ea580c !important;
          }
          /* High priority tasks (blue) */
          .gantt_task_line.gantt-task-high {
            background-color: #3b82f6 !important;
            border-color: #2563eb !important;
          }
          .gantt_task_progress {
            background-color: rgba(0, 0, 0, 0.2);
          }
          /* Milestones (purple) */
          .gantt_milestone {
            background-color: #8b5cf6 !important;
          }
          .gantt_link_line_right,
          .gantt_link_line_left,
          .gantt_link_line_down,
          .gantt_link_line_up {
            background-color: #64748b;
          }
          .gantt_link_arrow_right,
          .gantt_link_arrow_left {
            border-color: transparent transparent transparent #64748b;
          }
          .gantt_grid_head_cell {
            background-color: #f8fafc;
            color: #1e293b;
            font-weight: 600;
          }
          .gantt_scale_cell {
            background-color: #f8fafc;
            color: #64748b;
          }
          .gantt_row.odd {
            background-color: #fafafa;
          }
        `}</style>
      </Main>
    </>
  )
}

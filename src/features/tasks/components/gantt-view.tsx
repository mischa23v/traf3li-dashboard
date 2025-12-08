import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ZoomIn,
  ZoomOut,
  Calendar,
  Flag,
  Users,
  Download,
  Settings,
  Filter,
  ChevronDown,
  RotateCcw,
  Milestone,
  Search,
  Bell,
  Play,
  Pause,
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
import { Skeleton } from '@/components/ui/skeleton'
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  useDHtmlxGanttData,
  useUpdateTaskSchedule,
  useUpdateTaskProgress,
  useCriticalPath,
  useMilestones,
  useExportGanttPDF,
  useExportGanttExcel,
} from '@/hooks/useGantt'
import type { TimeScale } from '@/types/gantt'

// Gantt will be loaded dynamically
let gantt: any = null

export function GanttView({ caseId }: { caseId: string }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const containerRef = useRef<HTMLDivElement>(null)
  const [isGanttLoaded, setIsGanttLoaded] = useState(false)
  const [timeScale, setTimeScale] = useState<TimeScale>('day')
  const [showCriticalPath, setShowCriticalPath] = useState(false)

  // Fetch data
  const { data: ganttData, isLoading } = useDHtmlxGanttData(caseId)
  const { data: criticalPathData } = useCriticalPath(caseId)
  const { data: milestones } = useMilestones(caseId)

  // Mutations
  const { mutate: updateSchedule } = useUpdateTaskSchedule()
  const { mutate: updateProgress } = useUpdateTaskProgress()
  const { mutate: exportPDF, isPending: exportingPDF } = useExportGanttPDF()
  const { mutate: exportExcel, isPending: exportingExcel } = useExportGanttExcel()

  const topNav = [
    { title: t('tasks.list'), href: '/dashboard/tasks', isActive: false },
    { title: t('tasks.kanban'), href: '/dashboard/tasks/kanban', isActive: false },
    { title: t('tasks.gantt'), href: '/dashboard/tasks/gantt', isActive: true },
    { title: t('tasks.calendar'), href: '/dashboard/calendar', isActive: false },
  ]

  // Load DHTMLX Gantt
  useEffect(() => {
    const loadGantt = async () => {
      try {
        // Dynamic import of dhtmlx-gantt
        const module = await import('dhtmlx-gantt')
        gantt = module.gantt || module.default?.gantt || (window as any).gantt

        // Import CSS
        await import('dhtmlx-gantt/codebase/dhtmlxgantt.css')

        setIsGanttLoaded(true)
      } catch (error) {
        console.error('Failed to load DHTMLX Gantt:', error)
      }
    }
    loadGantt()
  }, [])

  // Initialize Gantt when loaded
  useEffect(() => {
    if (!isGanttLoaded || !containerRef.current || !gantt) return

    // Configure Gantt
    gantt.config.date_format = '%Y-%m-%d %H:%i'
    gantt.config.xml_date = '%Y-%m-%d %H:%i'
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
        label: t('tasks.taskName'),
        tree: true,
        width: 200,
        resize: true,
      },
      {
        name: 'start_date',
        label: t('tasks.startDate'),
        align: 'center',
        width: 100,
      },
      {
        name: 'duration',
        label: t('tasks.duration'),
        align: 'center',
        width: 60,
      },
      {
        name: 'assignee',
        label: t('tasks.assignee'),
        align: 'center',
        width: 100,
      },
      {
        name: 'progress',
        label: '%',
        align: 'center',
        width: 50,
        template: (obj: any) => `${Math.round(obj.progress * 100)}%`,
      },
    ]

    // Configure time scales
    updateTimeScale(timeScale)

    // Enable critical path highlighting
    gantt.config.highlight_critical_path = showCriticalPath

    // Task templates
    gantt.templates.task_class = (start: Date, end: Date, task: any) => {
      let classes = []
      if (task.priority === 'urgent') classes.push('gantt-task-urgent')
      if (task.priority === 'high') classes.push('gantt-task-high')
      if (task.isCritical || criticalPathData?.criticalTasks?.includes(task.id)) {
        classes.push('gantt-task-critical')
      }
      if (task.type === 'milestone') classes.push('gantt-milestone')
      return classes.join(' ')
    }

    // Initialize
    gantt.init(containerRef.current)

    // Event handlers
    gantt.attachEvent('onAfterTaskDrag', (id: string, mode: any) => {
      const task = gantt.getTask(id)
      updateSchedule({
        taskId: id,
        data: {
          startDate: task.start_date,
          endDate: task.end_date,
          duration: task.duration,
        },
      })
    })

    gantt.attachEvent('onAfterProgressDrag', (id: string, progress: number) => {
      updateProgress({ taskId: id, progress })
    })

    gantt.attachEvent('onAfterLinkAdd', (id: string, link: any) => {
      // Handle link creation
      console.log('Link added:', link)
    })

    // Cleanup
    return () => {
      gantt.clearAll()
    }
  }, [isGanttLoaded, isRTL, timeScale, showCriticalPath, t])

  // Load data into Gantt
  useEffect(() => {
    if (!isGanttLoaded || !ganttData || !gantt) return

    gantt.clearAll()
    gantt.parse(ganttData)
  }, [isGanttLoaded, ganttData])

  // Update time scale
  const updateTimeScale = (scale: TimeScale) => {
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
          { unit: 'week', step: 1, format: t('tasks.week') + ' %W' },
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
    if (gantt) {
      gantt.config.highlight_critical_path = !showCriticalPath
      gantt.render()
    }
  }

  const handleExportPDF = () => {
    exportPDF({
      caseId,
      options: {
        showCriticalPath,
        pageSize: 'A3',
        orientation: 'landscape',
      },
    })
  }

  const handleExportExcel = () => {
    exportExcel(caseId)
  }

  const handleFitToView = () => {
    if (gantt) {
      gantt.render()
    }
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />

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
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main
        fluid={true}
        className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6 rounded-tr-3xl shadow-inner border-r border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']"
      >
        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                className="h-9 w-9"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                className="h-9 w-9"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <Select value={timeScale} onValueChange={(v) => handleTimeScaleChange(v as TimeScale)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">{t('tasks.day')}</SelectItem>
                  <SelectItem value="week">{t('tasks.week')}</SelectItem>
                  <SelectItem value="month">{t('tasks.month')}</SelectItem>
                  <SelectItem value="quarter">{t('tasks.quarter')}</SelectItem>
                  <SelectItem value="year">{t('tasks.year')}</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleFitToView} className="h-9">
                <RotateCcw className="h-4 w-4 me-2" />
                {t('tasks.fitToView')}
              </Button>
            </div>

            {/* Center - Critical Path Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={showCriticalPath ? 'default' : 'outline'}
                onClick={handleToggleCriticalPath}
                className={showCriticalPath ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                <Flag className="h-4 w-4 me-2" />
                {t('tasks.criticalPath')}
              </Button>

              {criticalPathData && (
                <Badge className="bg-slate-100 text-slate-700">
                  {criticalPathData.criticalTasks?.length || 0} {t('tasks.criticalTasks')}
                </Badge>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9">
                    <Filter className="h-4 w-4 me-2" />
                    {t('common.filter')}
                    <ChevronDown className="h-4 w-4 ms-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>{t('tasks.filterByAssignee')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('tasks.filterByStatus')}</DropdownMenuItem>
                  <DropdownMenuItem>{t('tasks.filterByPriority')}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>{t('common.clearFilters')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9">
                    <Download className="h-4 w-4 me-2" />
                    {t('common.export')}
                    <ChevronDown className="h-4 w-4 ms-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportPDF} disabled={exportingPDF}>
                    {t('common.exportPDF')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel} disabled={exportingExcel}>
                    {t('common.exportExcel')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-navy">
                  {ganttData?.data?.length || 0}
                </div>
                <div className="text-xs text-slate-500">{t('tasks.totalTasks')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Flag className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-navy">
                  {criticalPathData?.criticalTasks?.length || 0}
                </div>
                <div className="text-xs text-slate-500">{t('tasks.criticalTasks')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Milestone className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-navy">
                  {milestones?.length || 0}
                </div>
                <div className="text-xs text-slate-500">{t('tasks.milestones')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-navy">
                  {criticalPathData?.totalDuration || 0}
                </div>
                <div className="text-xs text-slate-500">{t('tasks.projectDuration')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gantt Chart Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {isLoading || !isGanttLoaded ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
                <Skeleton className="h-4 w-32 mx-auto mb-2" />
                <Skeleton className="h-3 w-24 mx-auto" />
              </div>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="gantt-container"
              style={{ width: '100%', height: '600px' }}
            />
          )}
        </div>

        {/* Custom styles for Gantt */}
        <style>{`
          .gantt-container {
            font-family: 'IBM Plex Sans Arabic', sans-serif;
          }
          .gantt_task_line.gantt-task-critical {
            background-color: #ef4444 !important;
            border-color: #dc2626 !important;
          }
          .gantt_task_line.gantt-task-urgent {
            background-color: #f59e0b !important;
            border-color: #d97706 !important;
          }
          .gantt_task_line.gantt-task-high {
            background-color: #3b82f6 !important;
            border-color: #2563eb !important;
          }
          .gantt_task_line {
            background-color: #10b981;
            border-color: #059669;
            border-radius: 4px;
          }
          .gantt_task_progress {
            background-color: rgba(0, 0, 0, 0.2);
          }
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

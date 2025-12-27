/**
 * FullCalendar Integration Component
 * Production-ready calendar with drag-and-drop, events, and full features
 */

import { useState, useMemo, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { PERF_DEBUG, perfLog } from '@/lib/perf-debug'
import { ROUTES } from '@/constants/routes'
import type FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, DateSelectArg, EventDropArg, EventContentArg } from '@fullcalendar/core'

// Lazy load FullCalendar component
const FullCalendarComponent = lazy(() => import('@fullcalendar/react'))
import {
  Plus,
  Filter,
  Clock,
  MapPin,
  Users,
  Briefcase,
  AlertTriangle,
  Gavel,
  Calendar as CalendarIcon,
  Search,
  Bell,
  Loader2,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  ExternalLink,
  X,
  Check,
  ChevronDown,
} from 'lucide-react'
import {
  useCalendarGridItems,
  useCalendarGridSummary,
  useCalendarItemDetails,
  usePrefetchAdjacentMonthsOptimized,
} from '@/hooks/useCalendar'
import type { GridItem } from '@/services/calendarService'
import { useCreateEvent, useUpdateEvent } from '@/hooks/useRemindersAndEvents'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Main } from '@/components/layout/main'
import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ConfigDrawer } from '@/components/config-drawer'
import { DynamicIsland } from '@/components/dynamic-island'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { CalendarSyncDialog } from './calendar-sync-dialog'

// ==================== Module-level constants for performance ====================
// Moving these outside the component prevents re-creation on every render

// FullCalendar plugins array - must be stable reference
const CALENDAR_PLUGINS = [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]

// Navigation links - stable reference
const TOP_NAV_LINKS = [
  { title: 'الرئيسية', href: ROUTES.dashboard.home, isActive: false, disabled: false },
  { title: 'التقويم', href: ROUTES.dashboard.calendar, isActive: true, disabled: false },
  { title: 'المهام', href: ROUTES.dashboard.tasks.list, isActive: false, disabled: false },
]

// Event type colors
const EVENT_COLORS = {
  hearing: { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
  court_session: { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
  meeting: { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' },
  deadline: { bg: '#f97316', border: '#ea580c', text: '#ffffff' },
  task: { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' },
  reminder: { bg: '#a855f7', border: '#9333ea', text: '#ffffff' },
  conference: { bg: '#06b6d4', border: '#0891b2', text: '#ffffff' },
  consultation: { bg: '#10b981', border: '#059669', text: '#ffffff' },
  document_review: { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' },
  training: { bg: '#ec4899', border: '#db2777', text: '#ffffff' },
  other: { bg: '#64748b', border: '#475569', text: '#ffffff' },
}

// Event type labels in Arabic
const EVENT_TYPE_LABELS: Record<string, string> = {
  hearing: 'جلسة محكمة',
  court_session: 'جلسة محكمة',
  meeting: 'اجتماع',
  deadline: 'موعد نهائي',
  task: 'مهمة',
  reminder: 'تذكير',
  conference: 'مؤتمر',
  consultation: 'استشارة',
  document_review: 'مراجعة مستند',
  training: 'تدريب',
  other: 'أخرى',
}

// FullCalendar Library Loading Skeleton
// This is shown while the heavy FullCalendar library itself is being loaded
// (separate from the route-level CalendarSkeleton which loads the entire view)
function FullCalendarLibrarySkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {/* Header with buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Week header */}
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-12 w-full" />
        ))}
        {/* Calendar days */}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`day-${i}`} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}

interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  allDay?: boolean
  extendedProps: {
    type: string
    eventType?: string
    description?: string
    location?: string
    caseId?: string
    caseName?: string
    caseNumber?: string
    priority?: string
    status?: string
    attendees?: any[]
  }
}

interface CreateEventForm {
  title: string
  description: string
  type: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  allDay: boolean
  location: string
  caseId: string
}

export function FullCalendarView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const calendarRef = useRef<FullCalendar>(null)
  const isRTL = i18n.language === 'ar'

  // Performance profiling
  const renderCount = useRef(0)
  const mountTime = useRef(performance.now())

  useEffect(() => {
    perfLog('FullCalendarView MOUNTED')
    return () => perfLog('FullCalendarView UNMOUNTED')
  }, [])

  renderCount.current++
  if (PERF_DEBUG && renderCount.current <= 5) {
    perfLog(`FullCalendarView RENDER #${renderCount.current}`, {
      timeSinceMount: (performance.now() - mountTime.current).toFixed(2) + 'ms'
    })
  }

  // Track API calls
  const gridItemsLoadStart = useRef(performance.now())
  const summaryLoadStart = useRef(performance.now())

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<{ type: string; id: string } | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [filterTypes, setFilterTypes] = useState<string[]>([])
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)

  // Create event form state
  const [createForm, setCreateForm] = useState<CreateEventForm>({
    title: '',
    description: '',
    type: 'meeting',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    allDay: false,
    location: '',
    caseId: '',
  })

  // Calculate date range for current view
  const dateRange = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Add buffer for calendar grid
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - 7)
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + 7)

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
  }, [currentDate])

  // Fetch calendar data using optimized endpoints
  // Grid items: minimal data (~150 bytes/item) for calendar display
  const { data: gridItemsData, isLoading, isError, error, refetch } = useCalendarGridItems({
    ...dateRange,
    types: filterTypes.length > 0 ? filterTypes.join(',') : undefined,
  })

  // Grid summary: counts per day for the banner
  const { data: summaryData } = useCalendarGridSummary(dateRange)

  // Lazy load full details when user clicks an event
  const { data: itemDetailsData, isLoading: isLoadingDetails } = useCalendarItemDetails(
    selectedItemForDetails?.type ?? null,
    selectedItemForDetails?.id ?? null,
    !!selectedItemForDetails
  )

  // Track loading state
  useEffect(() => {
    if (isLoading) {
      perfLog('Calendar LOADING started - fetching grid items')
      gridItemsLoadStart.current = performance.now()
    }
  }, [isLoading])

  // API load tracking
  useEffect(() => {
    if (gridItemsData) {
      const loadTime = (performance.now() - gridItemsLoadStart.current).toFixed(2)
      perfLog('API LOADED: calendarGridItems', {
        count: gridItemsData?.data?.length,
        loadTime: loadTime + 'ms'
      })
    }
  }, [gridItemsData])

  useEffect(() => {
    if (summaryData) {
      const loadTime = (performance.now() - summaryLoadStart.current).toFixed(2)
      perfLog('API LOADED: calendarGridSummary', {
        days: summaryData?.data?.days?.length,
        loadTime: loadTime + 'ms'
      })
    }
  }, [summaryData])

  useEffect(() => {
    if (itemDetailsData) {
      perfLog('API LOADED: calendarItemDetails', { id: selectedItemForDetails?.id })
    }
  }, [itemDetailsData, selectedItemForDetails?.id])

  // Mutations
  const createEventMutation = useCreateEvent()
  const updateEventMutation = useUpdateEvent()

  // Prefetch adjacent months for smoother navigation (using optimized endpoints)
  const { prefetchPrevMonth, prefetchNextMonth } = usePrefetchAdjacentMonthsOptimized(currentDate)

  // Store refs to avoid re-querying DOM and to have stable references for cleanup
  const prevBtnRef = useRef<Element | null>(null)
  const nextBtnRef = useRef<Element | null>(null)
  const prefetchPrevRef = useRef(prefetchPrevMonth)
  const prefetchNextRef = useRef(prefetchNextMonth)

  // Update refs when prefetch functions change (without triggering DOM queries)
  useEffect(() => {
    prefetchPrevRef.current = prefetchPrevMonth
    prefetchNextRef.current = prefetchNextMonth
  }, [prefetchPrevMonth, prefetchNextMonth])

  // Attach hover listeners to navigation buttons for prefetching
  // Use requestIdleCallback to avoid forced reflow during render
  useEffect(() => {
    const attachListeners = () => {
      const wrapper = document.querySelector('.fullcalendar-wrapper')
      if (!wrapper) return

      const prevBtn = wrapper.querySelector('.fc-prev-button')
      const nextBtn = wrapper.querySelector('.fc-next-button')

      // Wrapper functions that use refs - stable references, always call current prefetch
      const handlePrevHover = () => prefetchPrevRef.current()
      const handleNextHover = () => prefetchNextRef.current()

      if (prevBtn && prevBtn !== prevBtnRef.current) {
        prevBtnRef.current = prevBtn
        prevBtn.addEventListener('mouseenter', handlePrevHover)
      }
      if (nextBtn && nextBtn !== nextBtnRef.current) {
        nextBtnRef.current = nextBtn
        nextBtn.addEventListener('mouseenter', handleNextHover)
      }
    }

    // Defer DOM queries to avoid forced reflow
    const idleCallback = 'requestIdleCallback' in window
      ? (window as any).requestIdleCallback(attachListeners, { timeout: 100 })
      : setTimeout(attachListeners, 0)

    return () => {
      if ('cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(idleCallback)
      } else {
        clearTimeout(idleCallback)
      }
    }
  }, []) // Empty deps - only run once, refs handle updates

  // Transform grid items to FullCalendar format
  // Much simpler now - backend returns minimal data with color already included
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    if (!gridItemsData?.data) return []

    return gridItemsData.data.map((item: GridItem) => ({
      id: `${item.type}-${item.id}`,
      title: item.title,
      start: item.startDate,
      end: item.endDate || item.startDate,
      allDay: item.allDay,
      extendedProps: {
        type: item.type,
        eventType: item.eventType || item.type,
        status: item.status,
        priority: item.priority,
        color: item.color,
      },
    }))
  }, [gridItemsData])

  // Calculate summary counts from grid summary
  const summaryCounts = useMemo(() => {
    if (!summaryData?.data?.days) {
      return { eventCount: 0, taskCount: 0, reminderCount: 0 }
    }
    return summaryData.data.days.reduce(
      (acc, day) => ({
        eventCount: acc.eventCount + day.events,
        taskCount: acc.taskCount + day.tasks,
        reminderCount: acc.reminderCount + day.reminders,
      }),
      { eventCount: 0, taskCount: 0, reminderCount: 0 }
    )
  }, [summaryData])

  // ==================== Memoized FullCalendar Props ====================
  // These prevent unnecessary re-initialization of FullCalendar

  // Header toolbar config - stable reference
  const headerToolbar = useMemo(() => ({
    start: 'prev,next today',
    center: 'title',
    end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  }), [])

  // Button text - depends on language direction
  const buttonText = useMemo(() => ({
    today: isRTL ? 'اليوم' : 'Today',
    month: isRTL ? 'شهر' : 'Month',
    week: isRTL ? 'أسبوع' : 'Week',
    day: isRTL ? 'يوم' : 'Day',
    list: isRTL ? 'قائمة' : 'List',
  }), [isRTL])

  // More link text callback - stable reference
  const moreLinkText = useCallback((num: number) => `+${num} المزيد`, [])

  // Event click handler - triggers lazy load for full details
  const handleEventClick = useCallback((info: EventClickArg) => {
    const event = info.event
    const [type, id] = event.id.split('-')

    // Store minimal info for immediate display
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      allDay: event.allDay,
      extendedProps: event.extendedProps as CalendarEvent['extendedProps'],
    })

    // Trigger lazy load for full details
    setSelectedItemForDetails({ type, id })
    setIsEventDialogOpen(true)
  }, [])

  // Memoized datesSet handler - prevents re-renders from inline function
  // Only update currentDate if the month actually changed to prevent double API calls
  const handleDatesSet = useCallback((dateInfo: { start: Date }) => {
    setCurrentDate(prev => {
      const newStart = dateInfo.start
      // FullCalendar's view start can be in the previous month (week display)
      // We need to find the "center" of the view to determine the actual month
      const viewCenter = new Date(newStart)
      viewCenter.setDate(viewCenter.getDate() + 15) // Move to middle of view

      // Only update if we're viewing a different month
      if (prev.getMonth() === viewCenter.getMonth() && prev.getFullYear() === viewCenter.getFullYear()) {
        perfLog('Calendar datesSet SKIPPED - same month', {
          prev: prev.toISOString().split('T')[0],
          viewStart: newStart.toISOString().split('T')[0]
        })
        return prev // Keep same reference to prevent re-render
      }

      perfLog('Calendar datesSet UPDATING month', {
        from: prev.toISOString().split('T')[0],
        to: viewCenter.toISOString().split('T')[0]
      })
      return viewCenter
    })
  }, [])

  // Date select handler (for creating new events) - use functional update to avoid dependency on createForm
  const handleDateSelect = useCallback((info: DateSelectArg) => {
    setCreateForm(prev => ({
      ...prev,
      startDate: info.startStr.split('T')[0],
      endDate: info.endStr.split('T')[0],
      allDay: info.allDay,
    }))
    setIsCreateDialogOpen(true)
  }, []) // Stable callback - no dependency on createForm

  // Event drop handler (drag and drop)
  const handleEventDrop = useCallback(async (info: EventDropArg) => {
    const eventId = info.event.id.replace(/^(event|task|reminder)-/, '')
    const eventType = info.event.extendedProps.type

    if (eventType === 'event') {
      try {
        await updateEventMutation.mutateAsync({
          id: eventId,
          data: {
            startDate: info.event.startStr,
            endDate: info.event.endStr || info.event.startStr,
          },
        })
        toast.success('تم تحديث موعد الحدث بنجاح')
      } catch (error) {
        info.revert()
        toast.error('فشل تحديث موعد الحدث')
      }
    } else {
      // For tasks and reminders, revert as they need different handling
      info.revert()
      toast.info('اسحب الأحداث فقط لتغيير موعدها')
    }
  }, [updateEventMutation])

  // Create event handler
  const handleCreateEvent = async () => {
    if (!createForm.title.trim()) {
      toast.error('يرجى إدخال عنوان الحدث')
      return
    }

    try {
      const startDateTime = createForm.allDay
        ? createForm.startDate
        : `${createForm.startDate}T${createForm.startTime}`
      const endDateTime = createForm.allDay
        ? createForm.endDate || createForm.startDate
        : `${createForm.endDate || createForm.startDate}T${createForm.endTime}`

      await createEventMutation.mutateAsync({
        title: createForm.title,
        description: createForm.description,
        type: createForm.type as any,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: createForm.allDay,
        location: createForm.location ? { type: 'physical', address: createForm.location } : undefined,
        caseId: createForm.caseId || undefined,
      })

      toast.success('تم إنشاء الحدث بنجاح')
      setIsCreateDialogOpen(false)
      setCreateForm({
        title: '',
        description: '',
        type: 'meeting',
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '10:00',
        allDay: false,
        location: '',
        caseId: '',
      })
      refetch()
    } catch (error) {
      toast.error('فشل إنشاء الحدث')
    }
  }

  // Navigate to event details
  const handleViewEventDetails = () => {
    if (!selectedEvent) return

    const [type, id] = selectedEvent.id.split('-')
    if (type === 'event') {
      navigate({ to: ROUTES.dashboard.tasks.events.detail(id) as any })
    } else if (type === 'task') {
      navigate({ to: ROUTES.dashboard.tasks.detail(id) as any })
    } else if (type === 'reminder') {
      navigate({ to: ROUTES.dashboard.tasks.reminders.detail(id) as any })
    }
    setIsEventDialogOpen(false)
  }

  // Custom event rendering - uses color from backend grid item
  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const { event } = eventInfo
    const eventType = event.extendedProps.eventType || 'other'
    // Use color from backend if available, fallback to EVENT_COLORS
    const backendColor = event.extendedProps.color
    const colors = backendColor
      ? { bg: backendColor, border: backendColor, text: '#ffffff' }
      : EVENT_COLORS[eventType as keyof typeof EVENT_COLORS] || EVENT_COLORS.other

    return (
      <div
        className="w-full h-full px-1.5 py-0.5 rounded text-xs font-medium overflow-hidden"
        style={{
          backgroundColor: colors.bg,
          borderRight: `3px solid ${colors.border}`,
          color: colors.text,
        }}
      >
        <div className="flex items-center gap-1 truncate">
          {eventType === 'hearing' || eventType === 'court_session' ? (
            <Gavel className="h-3 w-3 flex-shrink-0" />
          ) : eventType === 'meeting' ? (
            <Users className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          ) : eventType === 'deadline' || eventType === 'task' ? (
            <AlertTriangle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          ) : (
            <CalendarIcon className="h-3 w-3 flex-shrink-0" />
          )}
          <span className="truncate">{event.title}</span>
        </div>
      </div>
    )
  }, []) // Empty deps - EVENT_COLORS is static fallback, icons are stable

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={TOP_NAV_LINKS} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
          <div className="ms-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
          </div>
        </Header>
        <Main fluid className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-[700px] w-full rounded-3xl" />
        </Main>
      </>
    )
  }

  // Error state
  if (isError) {
    const errorMsg = (error as Error)?.message || ''
    const isBackendPending = errorMsg.includes('[BACKEND-PENDING]')

    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={TOP_NAV_LINKS} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <DynamicIsland />
          </div>
          <div className="ms-auto flex items-center gap-4">
            <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
            <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
          </div>
        </Header>
        <Main fluid className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className={`w-16 h-16 ${isBackendPending ? 'bg-orange-50' : 'bg-red-50'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <AlertCircle className={`h-8 w-8 ${isBackendPending ? 'text-orange-500' : 'text-red-500'}`} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isBackendPending ? (
                  <>
                    {isRTL ? '[بانتظار التطبيق] فشل تحميل التقويم' : '[BACKEND-PENDING] Failed to load calendar'}
                  </>
                ) : (
                  <>
                    {isRTL ? 'فشل تحميل التقويم' : 'Failed to load calendar'}
                  </>
                )}
              </h3>
              <p className="text-slate-500 mb-4">{errorMsg}</p>
              {isBackendPending && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-right">
                  <p className="text-sm text-orange-800 mb-2">
                    <strong className="font-bold">
                      {isRTL ? '⚠️ هذه الميزة بانتظار تطبيق الخادم' : '⚠️ This feature is pending backend implementation'}
                    </strong>
                  </p>
                  <p className="text-xs text-orange-700">
                    {isRTL
                      ? 'يستخدم التقويم حاليًا نقاط نهاية محسّنة غير مطبقة بعد في الخادم. يرجى الاتصال بفريق التطوير لتطبيق النقاط النهائية المطلوبة أو استخدام التقويم القديم مؤقتًا.'
                      : 'The calendar is currently using optimized endpoints that are not yet implemented in the backend. Please contact the development team to implement the required endpoints or use the legacy calendar temporarily.'}
                  </p>
                </div>
              )}
              <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                <RefreshCw className="ms-2 h-4 w-4" />
                {isRTL ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </CardContent>
          </Card>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={TOP_NAV_LINKS} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
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
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-6">
        {/* Hero Banner */}
        <div className="bg-navy rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-navy/20 group">
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-blue rounded-full blur-[120px] opacity-40 group-hover:opacity-50 transition-opacity duration-700"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 border-0 px-3 py-1">
                  <Briefcase className="w-3 h-3 ms-2" />
                  مكتب المحاماة
                </Badge>
                <span className="text-slate-500 text-sm">
                  {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight mb-2">جدول القضايا والجلسات</h1>
              <p className="text-slate-300 text-lg max-w-xl">
                لديك{' '}
                <span className="text-white font-bold border-b-2 border-brand-blue">
                  {summaryCounts.eventCount} أحداث
                </span>
                {' '}و{' '}
                <span className="text-white font-bold border-b-2 border-orange-500">
                  {summaryCounts.taskCount} مهام
                </span>
                {' '}و{' '}
                <span className="text-white font-bold border-b-2 border-purple-500">
                  {summaryCounts.reminderCount} تذكيرات
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-brand-blue hover:bg-blue-600 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300 border-0 text-base"
              >
                <Plus className="ms-2 h-5 w-5" aria-hidden="true" />
                حدث جديد
              </Button>
              <Button
                onClick={() => setIsSyncDialogOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 px-6 font-bold shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all duration-300 border-0"
              >
                <Settings className="ms-2 h-5 w-5" aria-hidden="true" />
                مزامنة
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-12 px-6 font-bold backdrop-blur-md border border-white/10 transition-all duration-300">
                    <Filter className="ms-2 h-5 w-5" aria-hidden="true" />
                    تصفية
                    {filterTypes.length > 0 && (
                      <Badge className="me-2 bg-brand-blue text-white">{filterTypes.length}</Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuCheckboxItem
                    checked={filterTypes.includes('hearing')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilterTypes([...filterTypes, 'hearing', 'court_session'])
                      } else {
                        setFilterTypes(filterTypes.filter(t => t !== 'hearing' && t !== 'court_session'))
                      }
                    }}
                  >
                    <Gavel className="ms-2 h-4 w-4 text-red-500" />
                    جلسات المحكمة
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterTypes.includes('meeting')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilterTypes([...filterTypes, 'meeting'])
                      } else {
                        setFilterTypes(filterTypes.filter(t => t !== 'meeting'))
                      }
                    }}
                  >
                    <Users className="ms-2 h-4 w-4 text-blue-500" aria-hidden="true" />
                    اجتماعات
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterTypes.includes('task')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilterTypes([...filterTypes, 'task'])
                      } else {
                        setFilterTypes(filterTypes.filter(t => t !== 'task'))
                      }
                    }}
                  >
                    <AlertTriangle className="ms-2 h-4 w-4 text-purple-500" aria-hidden="true" />
                    مهام
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterTypes.includes('reminder')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilterTypes([...filterTypes, 'reminder'])
                      } else {
                        setFilterTypes(filterTypes.filter(t => t !== 'reminder'))
                      }
                    }}
                  >
                    <Bell className="ms-2 h-4 w-4 text-orange-500" />
                    تذكيرات
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterTypes([])}>
                    <X className="ms-2 h-4 w-4" aria-hidden="true" />
                    إزالة الفلاتر
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <Card className="rounded-3xl border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div
              className="fullcalendar-wrapper p-4"
              style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            >
              <Suspense fallback={<FullCalendarLibrarySkeleton />}>
                <FullCalendarComponent
                  ref={calendarRef}
                  plugins={CALENDAR_PLUGINS}
                  initialView="dayGridMonth"
                  locale={isRTL ? 'ar' : 'en'}
                  direction={isRTL ? 'rtl' : 'ltr'}
                  headerToolbar={headerToolbar}
                  buttonText={buttonText}
                  events={calendarEvents}
                  eventClick={handleEventClick}
                  select={handleDateSelect}
                  eventDrop={handleEventDrop}
                  selectable={true}
                  editable={true}
                  droppable={true}
                  eventContent={renderEventContent}
                  height={700}
                  dayMaxEvents={4}
                  moreLinkText={moreLinkText}
                  nowIndicator={true}
                  weekNumbers={false}
                  firstDay={0}
                  handleWindowResize={false}
                  rerenderDelay={10}
                  progressiveEventRendering={true}
                  datesSet={handleDatesSet}
                />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </Main>

      {/* Event Details Dialog - uses lazy-loaded details */}
      <Dialog open={isEventDialogOpen} onOpenChange={(open) => {
        setIsEventDialogOpen(open)
        if (!open) setSelectedItemForDetails(null) // Clear lazy load state when closing
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.extendedProps.eventType === 'hearing' ||
              selectedEvent?.extendedProps.eventType === 'court_session' ? (
                <Gavel className="h-5 w-5 text-red-500" />
              ) : selectedEvent?.extendedProps.eventType === 'meeting' ? (
                <Users className="h-5 w-5 text-blue-500" aria-hidden="true" />
              ) : (
                <CalendarIcon className="h-5 w-5 text-purple-500" />
              )}
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.extendedProps.eventType &&
                EVENT_TYPE_LABELS[selectedEvent.extendedProps.eventType]}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              {/* Basic info - always available */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>
                  {new Date(selectedEvent.start).toLocaleDateString('ar-SA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Priority - available from grid item */}
              {selectedEvent.extendedProps.priority && (
                <Badge
                  variant={
                    selectedEvent.extendedProps.priority === 'high' ||
                    selectedEvent.extendedProps.priority === 'critical'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {selectedEvent.extendedProps.priority === 'critical'
                    ? 'حرج'
                    : selectedEvent.extendedProps.priority === 'high'
                    ? 'عالي'
                    : selectedEvent.extendedProps.priority === 'medium'
                    ? 'متوسط'
                    : 'منخفض'}
                </Badge>
              )}

              {/* Lazy-loaded details */}
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  <span className="ms-2 text-sm text-slate-500">جاري تحميل التفاصيل...</span>
                </div>
              ) : itemDetailsData?.data && (
                <>
                  {itemDetailsData.data.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      <span>{itemDetailsData.data.location}</span>
                    </div>
                  )}

                  {itemDetailsData.data.caseName && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Briefcase className="h-4 w-4" />
                      <span>
                        {itemDetailsData.data.caseName}
                        {itemDetailsData.data.caseNumber &&
                          ` (${itemDetailsData.data.caseNumber})`}
                      </span>
                    </div>
                  )}

                  {itemDetailsData.data.description && (
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {itemDetailsData.data.description}
                    </p>
                  )}

                  {itemDetailsData.data.attendees && itemDetailsData.data.attendees.length > 0 && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Users className="h-4 w-4 mt-0.5" aria-hidden="true" />
                      <div>
                        <span className="font-medium">الحضور:</span>
                        <span className="ms-1">
                          {itemDetailsData.data.attendees.map((a: any) => a.name || a.username).join('، ')}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
              إغلاق
            </Button>
            <Button onClick={handleViewEventDetails}>
              <ExternalLink className="ms-2 h-4 w-4" aria-hidden="true" />
              عرض التفاصيل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إنشاء حدث جديد</DialogTitle>
            <DialogDescription>أضف حدث جديد إلى التقويم</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">العنوان *</Label>
              <Input
                id="title"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="عنوان الحدث"
              />
            </div>

            <div>
              <Label htmlFor="type">نوع الحدث</Label>
              <Select
                value={createForm.type}
                onValueChange={(value) => setCreateForm({ ...createForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hearing">جلسة محكمة</SelectItem>
                  <SelectItem value="meeting">اجتماع</SelectItem>
                  <SelectItem value="deadline">موعد نهائي</SelectItem>
                  <SelectItem value="conference">مؤتمر</SelectItem>
                  <SelectItem value="consultation">استشارة</SelectItem>
                  <SelectItem value="document_review">مراجعة مستند</SelectItem>
                  <SelectItem value="training">تدريب</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="allDay"
                checked={createForm.allDay}
                onCheckedChange={(checked) =>
                  setCreateForm({ ...createForm, allDay: checked as boolean })
                }
              />
              <Label htmlFor="allDay" className="cursor-pointer">
                طوال اليوم
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">تاريخ البدء *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                />
              </div>
              {!createForm.allDay && (
                <div>
                  <Label htmlFor="startTime">وقت البدء</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={createForm.endDate}
                  onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                />
              </div>
              {!createForm.allDay && (
                <div>
                  <Label htmlFor="endTime">وقت الانتهاء</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={createForm.endTime}
                    onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="location">الموقع</Label>
              <Input
                id="location"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                placeholder="موقع الحدث"
              />
            </div>

            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="وصف الحدث"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={createEventMutation.isPending}
              className="bg-brand-blue hover:bg-blue-600"
            >
              {createEventMutation.isPending ? (
                <Loader2 className="ms-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="ms-2 h-4 w-4" aria-hidden="true" />
              )}
              إنشاء الحدث
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calendar Sync Dialog */}
      <CalendarSyncDialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen} />

      {/* FullCalendar Custom Styles */}
      <style>{`
        .fullcalendar-wrapper .fc {
          font-family: inherit;
        }
        /* CSS containment for performance - isolates paint/layout calculations */
        .fullcalendar-wrapper .fc-daygrid-day {
          contain: content;
        }
        .fullcalendar-wrapper .fc-timegrid-slot {
          contain: content;
          height: 3rem;
        }
        .fullcalendar-wrapper .fc-event {
          contain: layout style;
          cursor: pointer;
          border: none;
          border-radius: 0.375rem;
          will-change: opacity;
        }
        .fullcalendar-wrapper .fc-event:hover {
          opacity: 0.9;
        }
        .fullcalendar-wrapper .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }
        .fullcalendar-wrapper .fc-button {
          contain: layout style;
          background-color: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          will-change: background-color;
        }
        .fullcalendar-wrapper .fc-button:hover {
          background-color: #e2e8f0;
        }
        .fullcalendar-wrapper .fc-button-active {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: white !important;
        }
        .fullcalendar-wrapper .fc-day-today {
          background-color: #dbeafe !important;
        }
        .fullcalendar-wrapper .fc-daygrid-day-number {
          font-weight: 600;
          color: #1e293b;
        }
        .fullcalendar-wrapper .fc-col-header-cell-cushion {
          font-weight: 700;
          color: #475569;
          padding: 0.75rem;
        }
        .fullcalendar-wrapper .fc-more-link {
          color: #3b82f6;
          font-weight: 600;
        }
        .fullcalendar-wrapper .fc-popover {
          border-radius: 1rem;
          border: none;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        }
        .fullcalendar-wrapper .fc-timegrid-axis {
          font-size: 0.75rem;
          color: #64748b;
        }
        .fullcalendar-wrapper .fc-list-event:hover td {
          background-color: #f1f5f9;
        }
      `}</style>
    </>
  )
}

export default FullCalendarView

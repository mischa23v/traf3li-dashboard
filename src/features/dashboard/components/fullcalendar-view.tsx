/**
 * FullCalendar Integration Component
 * Production-ready calendar with drag-and-drop, events, and full features
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, DateSelectArg, EventDropArg, EventContentArg } from '@fullcalendar/core'
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
import { useCalendar, useCalendarByMonth, usePrefetchAdjacentMonths } from '@/hooks/useCalendar'
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

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
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

  // Fetch calendar data
  const { data: calendarData, isLoading, isError, error, refetch } = useCalendar(dateRange)

  // Mutations
  const createEventMutation = useCreateEvent()
  const updateEventMutation = useUpdateEvent()

  // Prefetch adjacent months for smoother navigation
  const { prefetchPrevMonth, prefetchNextMonth } = usePrefetchAdjacentMonths(currentDate)

  // Attach hover listeners to navigation buttons for prefetching
  useEffect(() => {
    const wrapper = document.querySelector('.fullcalendar-wrapper')
    if (!wrapper) return

    const prevBtn = wrapper.querySelector('.fc-prev-button')
    const nextBtn = wrapper.querySelector('.fc-next-button')

    if (prevBtn) {
      prevBtn.addEventListener('mouseenter', prefetchPrevMonth)
    }
    if (nextBtn) {
      nextBtn.addEventListener('mouseenter', prefetchNextMonth)
    }

    return () => {
      if (prevBtn) {
        prevBtn.removeEventListener('mouseenter', prefetchPrevMonth)
      }
      if (nextBtn) {
        nextBtn.removeEventListener('mouseenter', prefetchNextMonth)
      }
    }
  }, [prefetchPrevMonth, prefetchNextMonth])

  // Memoize filter set for O(1) lookup instead of O(n) array.includes()
  const filterTypesSet = useMemo(() => new Set(filterTypes), [filterTypes])

  // Transform API data to FullCalendar format
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    if (!calendarData?.data) return []

    const { events: apiEvents, tasks, reminders } = calendarData.data

    // Early return if no data at all
    if (!apiEvents?.length && !tasks?.length && !reminders?.length) return []

    // Pre-allocate array with estimated size for better performance
    const totalEstimate = (apiEvents?.length || 0) + (tasks?.length || 0) + (reminders?.length || 0)
    const events: CalendarEvent[] = []
    events.length = totalEstimate // Pre-allocate
    let idx = 0

    // Helper to check filter - O(1) with Set
    const shouldInclude = (eventType: string) =>
      filterTypesSet.size === 0 || filterTypesSet.has(eventType)

    // Map events
    if (apiEvents) {
      for (const event of apiEvents) {
        const eventType = event.eventType || event.type || 'other'
        if (!shouldInclude(eventType)) continue

        events[idx++] = {
          id: `event-${event.id}`,
          title: event.title,
          start: event.startDate,
          end: event.endDate || event.startDate,
          allDay: event.allDay || false,
          extendedProps: {
            type: 'event',
            eventType,
            description: event.description,
            location: event.location,
            caseId: event.caseId,
            caseName: event.caseName,
            caseNumber: event.caseNumber,
            priority: event.priority,
            status: event.status,
            attendees: event.attendees,
          },
        }
      }
    }

    // Map tasks
    if (tasks && shouldInclude('task')) {
      for (const task of tasks) {
        events[idx++] = {
          id: `task-${task.id}`,
          title: task.title,
          start: task.startDate || task.dueDate,
          end: task.startDate || task.dueDate,
          allDay: true,
          extendedProps: {
            type: 'task',
            eventType: 'task',
            description: task.description,
            caseId: task.caseId,
            caseName: task.caseName,
            caseNumber: task.caseNumber,
            priority: task.priority,
            status: task.status,
          },
        }
      }
    }

    // Map reminders
    if (reminders && shouldInclude('reminder')) {
      for (const reminder of reminders) {
        events[idx++] = {
          id: `reminder-${reminder.id}`,
          title: reminder.title,
          start: reminder.startDate || reminder.reminderDate,
          end: reminder.startDate || reminder.reminderDate,
          allDay: true,
          extendedProps: {
            type: 'reminder',
            eventType: 'reminder',
            description: reminder.description,
            caseId: reminder.caseId,
            caseName: reminder.caseName,
            priority: reminder.priority,
            status: reminder.status,
          },
        }
      }
    }

    // Trim array to actual size
    events.length = idx
    return events
  }, [calendarData, filterTypesSet])

  // Navigation links
  const topNav = [
    { title: 'الرئيسية', href: '/', isActive: false, disabled: false },
    { title: 'التقويم', href: '/dashboard/calendar', isActive: true, disabled: false },
    { title: 'المهام', href: '/dashboard/tasks', isActive: false, disabled: false },
  ]

  // Event click handler
  const handleEventClick = useCallback((info: EventClickArg) => {
    const event = info.event
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      allDay: event.allDay,
      extendedProps: event.extendedProps as CalendarEvent['extendedProps'],
    })
    setIsEventDialogOpen(true)
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
      navigate({ to: '/dashboard/tasks/events/$eventId', params: { eventId: id } })
    } else if (type === 'task') {
      navigate({ to: '/tasks/$taskId', params: { taskId: id } })
    } else if (type === 'reminder') {
      navigate({ to: '/dashboard/tasks/reminders/$reminderId', params: { reminderId: id } })
    }
    setIsEventDialogOpen(false)
  }

  // Custom event rendering - memoized to prevent recreating function on every render
  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const { event } = eventInfo
    const eventType = event.extendedProps.eventType || 'other'
    const colors = EVENT_COLORS[eventType as keyof typeof EVENT_COLORS] || EVENT_COLORS.other

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
  }, []) // Empty deps - EVENT_COLORS is static, icons are stable

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
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
    return (
      <>
        <Header className="bg-navy shadow-none relative">
          <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
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
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">فشل تحميل التقويم</h3>
              <p className="text-slate-500 mb-6">{(error as Error)?.message || 'حدث خطأ أثناء تحميل البيانات'}</p>
              <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                <RefreshCw className="ms-2 h-4 w-4" />
                إعادة المحاولة
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
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
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
                  {calendarData?.data.summary?.eventCount || 0} أحداث
                </span>
                {' '}و{' '}
                <span className="text-white font-bold border-b-2 border-orange-500">
                  {calendarData?.data.summary?.taskCount || 0} مهام
                </span>
                {' '}و{' '}
                <span className="text-white font-bold border-b-2 border-purple-500">
                  {calendarData?.data.summary?.reminderCount || 0} تذكيرات
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
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={isRTL ? 'ar' : 'en'}
                direction={isRTL ? 'rtl' : 'ltr'}
                headerToolbar={{
                  start: 'prev,next today',
                  center: 'title',
                  end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                }}
                buttonText={{
                  today: isRTL ? 'اليوم' : 'Today',
                  month: isRTL ? 'شهر' : 'Month',
                  week: isRTL ? 'أسبوع' : 'Week',
                  day: isRTL ? 'يوم' : 'Day',
                  list: isRTL ? 'قائمة' : 'List',
                }}
                events={calendarEvents}
                eventClick={handleEventClick}
                select={handleDateSelect}
                eventDrop={handleEventDrop}
                selectable={true}
                editable={true}
                droppable={true}
                eventContent={renderEventContent}
                height="auto"
                contentHeight={700}
                dayMaxEvents={4}
                moreLinkText={(num) => `+${num} المزيد`}
                nowIndicator={true}
                weekNumbers={false}
                firstDay={0}
                datesSet={(dateInfo) => {
                  setCurrentDate(dateInfo.start)
                }}
              />
            </div>
          </CardContent>
        </Card>
      </Main>

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
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

              {selectedEvent.extendedProps.location && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>{selectedEvent.extendedProps.location}</span>
                </div>
              )}

              {selectedEvent.extendedProps.caseName && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Briefcase className="h-4 w-4" />
                  <span>
                    {selectedEvent.extendedProps.caseName}
                    {selectedEvent.extendedProps.caseNumber &&
                      ` (${selectedEvent.extendedProps.caseNumber})`}
                  </span>
                </div>
              )}

              {selectedEvent.extendedProps.description && (
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {selectedEvent.extendedProps.description}
                </p>
              )}

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
        /* CSS containment for day cells - improves paint and layout performance */
        .fullcalendar-wrapper .fc-daygrid-day {
          contain: content;
        }
        .fullcalendar-wrapper .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }
        .fullcalendar-wrapper .fc-button {
          background-color: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
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
        .fullcalendar-wrapper .fc-event {
          cursor: pointer;
          border: none;
          border-radius: 0.375rem;
        }
        .fullcalendar-wrapper .fc-event:hover {
          opacity: 0.9;
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
        .fullcalendar-wrapper .fc-timegrid-slot {
          height: 3rem;
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

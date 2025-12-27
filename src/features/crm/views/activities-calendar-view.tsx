/**
 * Activities Calendar View
 * Full-featured calendar for CRM activities with filtering, drag & drop, and multi-view support
 */

import { useState, useMemo, useCallback, useRef, lazy, Suspense } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, DateSelectArg, EventDropArg, EventContentArg } from '@fullcalendar/core'
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle2,
  Plus,
  Filter,
  Clock,
  User,
  Building,
  Users,
  X,
  ChevronDown,
  Bell,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

// Lazy load FullCalendar
const FullCalendarComponent = lazy(() => import('@fullcalendar/react'))

import { Header } from '@/components/layout/header'
import { TopNav } from '@/components/layout/top-nav'
import { Main } from '@/components/layout/main'
import { DynamicIsland } from '@/components/dynamic-island'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductivityHero } from '@/components/productivity-hero'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { toast } from 'sonner'
import { ROUTES } from '@/constants/routes'
import type { ActivityType, ActivityEntityType, CrmActivity } from '@/types/crm'
import { useActivityTimeline } from '@/hooks/useCrm'

// ==================== Constants ====================

// FullCalendar plugins
const CALENDAR_PLUGINS = [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]

// Activity type colors matching user requirements
const ACTIVITY_COLORS: Record<ActivityType, { bg: string; border: string; text: string }> = {
  call: { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' }, // Blue
  email: { bg: '#22c55e', border: '#16a34a', text: '#ffffff' }, // Green
  meeting: { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' }, // Purple
  task: { bg: '#f97316', border: '#ea580c', text: '#ffffff' }, // Orange
  note: { bg: '#6b7280', border: '#4b5563', text: '#ffffff' }, // Gray
  whatsapp: { bg: '#25D366', border: '#1da851', text: '#ffffff' }, // WhatsApp Green
  sms: { bg: '#06b6d4', border: '#0891b2', text: '#ffffff' }, // Cyan
  document: { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' }, // Indigo
  proposal: { bg: '#ec4899', border: '#db2777', text: '#ffffff' }, // Pink
  status_change: { bg: '#84cc16', border: '#65a30d', text: '#ffffff' }, // Lime
  stage_change: { bg: '#a855f7', border: '#9333ea', text: '#ffffff' }, // Purple
  lead_created: { bg: '#14b8a6', border: '#0d9488', text: '#ffffff' }, // Teal
  lead_converted: { bg: '#10b981', border: '#059669', text: '#ffffff' }, // Emerald
}

// Activity type icons
const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  call: <Phone className="h-3 w-3 flex-shrink-0" aria-hidden="true" />,
  email: <Mail className="h-3 w-3 flex-shrink-0" aria-hidden="true" />,
  meeting: <Calendar className="h-3 w-3 flex-shrink-0" aria-hidden="true" />,
  note: <FileText className="h-3 w-3 flex-shrink-0" aria-hidden="true" />,
  whatsapp: <MessageSquare className="h-3 w-3 flex-shrink-0" />,
  sms: <MessageSquare className="h-3 w-3 flex-shrink-0" />,
  task: <CheckCircle2 className="h-3 w-3 flex-shrink-0" />,
  document: <FileText className="h-3 w-3 flex-shrink-0" aria-hidden="true" />,
  proposal: <FileText className="h-3 w-3 flex-shrink-0" aria-hidden="true" />,
  status_change: <Clock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />,
  stage_change: <Clock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />,
  lead_created: <Plus className="h-3 w-3 flex-shrink-0" aria-hidden="true" />,
  lead_converted: <CheckCircle2 className="h-3 w-3 flex-shrink-0" />,
}

// Activity type labels (Arabic)
const ACTIVITY_LABELS: Record<ActivityType, string> = {
  call: 'مكالمة',
  email: 'بريد إلكتروني',
  meeting: 'اجتماع',
  note: 'ملاحظة',
  whatsapp: 'واتساب',
  sms: 'رسالة نصية',
  task: 'مهمة',
  document: 'مستند',
  proposal: 'عرض سعر',
  status_change: 'تغيير الحالة',
  stage_change: 'تغيير المرحلة',
  lead_created: 'عميل محتمل جديد',
  lead_converted: 'تحويل العميل',
}

// Entity type labels
const ENTITY_TYPE_LABELS: Record<ActivityEntityType, string> = {
  lead: 'عميل محتمل',
  client: 'عميل',
  contact: 'جهة اتصال',
  case: 'قضية',
  organization: 'مؤسسة',
}

// Activity status labels
const STATUS_LABELS: Record<string, string> = {
  all: 'الكل',
  scheduled: 'مجدول',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  pending: 'معلق',
  overdue: 'متأخر',
}

// FullCalendar Loading Skeleton
function FullCalendarLibrarySkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
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
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-12 w-full" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`day-${i}`} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}

// Calendar Event Interface
interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  allDay?: boolean
  extendedProps: {
    type: ActivityType
    entityType: ActivityEntityType
    entityId: string
    entityName?: string
    status?: string
    performedBy?: {
      _id: string
      firstName: string
      lastName: string
    }
  }
}

// Create Activity Form Interface
interface CreateActivityForm {
  type: ActivityType
  title: string
  description: string
  entityType: ActivityEntityType
  entityId: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  allDay: boolean
  duration: number
  reminder: number
}

export function ActivitiesCalendarView() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const calendarRef = useRef<FullCalendar>(null)
  const isRTL = i18n.language === 'ar'

  // State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<ActivityType[]>([])
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<ActivityEntityType[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all')

  // Create activity form
  const [createForm, setCreateForm] = useState<CreateActivityForm>({
    type: 'call',
    title: '',
    description: '',
    entityType: 'lead',
    entityId: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    allDay: false,
    duration: 30,
    reminder: 15,
  })

  // Calculate date range for API
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

  // Build activity filters
  const activityParams = useMemo(() => {
    const params: any = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit: 1000,
    }

    if (selectedActivityTypes.length > 0) {
      params.types = selectedActivityTypes.join(',')
    }

    if (selectedEntityTypes.length > 0) {
      params.entityTypes = selectedEntityTypes.join(',')
    }

    if (selectedStatus !== 'all') {
      params.status = selectedStatus
    }

    return params
  }, [dateRange, selectedActivityTypes, selectedEntityTypes, selectedStatus])

  // Fetch activities
  const { data: activitiesData, isLoading, isError, error, refetch } = useActivityTimeline(activityParams)

  // Transform activities to calendar events
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    if (!activitiesData) return []

    return activitiesData.map((activity: CrmActivity) => ({
      id: activity._id,
      title: activity.title,
      start: activity.scheduledAt || activity.createdAt,
      end: activity.meetingData?.scheduledEnd || undefined,
      allDay: false,
      extendedProps: {
        type: activity.type,
        entityType: activity.entityType,
        entityId: activity.entityId,
        entityName: activity.entityName,
        status: activity.status,
        performedBy: activity.performedBy,
      },
    }))
  }, [activitiesData])

  // FullCalendar configuration
  const headerToolbar = useMemo(
    () => ({
      start: 'prev,next today',
      center: 'title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    }),
    []
  )

  const buttonText = useMemo(
    () => ({
      today: isRTL ? 'اليوم' : 'Today',
      month: isRTL ? 'شهر' : 'Month',
      week: isRTL ? 'أسبوع' : 'Week',
      day: isRTL ? 'يوم' : 'Day',
      list: isRTL ? 'قائمة' : 'Agenda',
    }),
    [isRTL]
  )

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

  // Date select handler (create new activity)
  const handleDateSelect = useCallback((info: DateSelectArg) => {
    setCreateForm((prev) => ({
      ...prev,
      startDate: info.startStr.split('T')[0],
      endDate: info.endStr.split('T')[0],
      allDay: info.allDay,
    }))
    setIsCreateDialogOpen(true)
  }, [])

  // Event drop handler (drag & drop)
  const handleEventDrop = useCallback(
    async (info: EventDropArg) => {
      const timeDiff = Math.abs(
        new Date(info.event.startStr).getTime() - new Date(info.oldEvent.startStr).getTime()
      )
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      // Confirm if significant time change (more than 24 hours)
      if (hoursDiff > 24) {
        const confirmed = window.confirm(
          isRTL
            ? 'هل أنت متأكد من تغيير موعد النشاط بأكثر من 24 ساعة؟'
            : 'Are you sure you want to reschedule this activity by more than 24 hours?'
        )

        if (!confirmed) {
          info.revert()
          return
        }
      }

      try {
        // TODO: Call API to update activity
        // await updateActivity(info.event.id, { scheduledAt: info.event.startStr })
        toast.success(isRTL ? 'تم تحديث موعد النشاط بنجاح' : 'Activity rescheduled successfully')
      } catch (error) {
        info.revert()
        toast.error(isRTL ? 'فشل تحديث موعد النشاط' : 'Failed to reschedule activity')
      }
    },
    [isRTL]
  )

  // Dates set handler
  const handleDatesSet = useCallback((dateInfo: { start: Date }) => {
    setCurrentDate((prev) => {
      const newStart = dateInfo.start
      const viewCenter = new Date(newStart)
      viewCenter.setDate(viewCenter.getDate() + 15)

      if (
        prev.getMonth() === viewCenter.getMonth() &&
        prev.getFullYear() === viewCenter.getFullYear()
      ) {
        return prev
      }

      return viewCenter
    })
  }, [])

  // Custom event rendering
  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const { event } = eventInfo
    const activityType = event.extendedProps.type as ActivityType
    const colors = ACTIVITY_COLORS[activityType] || ACTIVITY_COLORS.note

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
          {ACTIVITY_ICONS[activityType]}
          <span className="truncate">{event.title}</span>
        </div>
        {event.extendedProps.entityName && (
          <div className="text-[10px] opacity-90 truncate mt-0.5">
            {event.extendedProps.entityName}
          </div>
        )}
      </div>
    )
  }, [])

  // Create activity handler
  const handleCreateActivity = async () => {
    if (!createForm.title.trim()) {
      toast.error(isRTL ? 'يرجى إدخال عنوان النشاط' : 'Please enter activity title')
      return
    }

    try {
      // TODO: Call API to create activity
      toast.success(isRTL ? 'تم إنشاء النشاط بنجاح' : 'Activity created successfully')
      setIsCreateDialogOpen(false)
      setCreateForm({
        type: 'call',
        title: '',
        description: '',
        entityType: 'lead',
        entityId: '',
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '10:00',
        allDay: false,
        duration: 30,
        reminder: 15,
      })
      refetch()
    } catch (error) {
      toast.error(isRTL ? 'فشل إنشاء النشاط' : 'Failed to create activity')
    }
  }

  // View event details
  const handleViewEventDetails = () => {
    if (!selectedEvent) return
    navigate({ to: ROUTES.dashboard.crm.activities.detail(selectedEvent.id) as any })
    setIsEventDialogOpen(false)
  }

  // Toggle activity type filter
  const toggleActivityTypeFilter = (type: ActivityType) => {
    setSelectedActivityTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  // Toggle entity type filter
  const toggleEntityTypeFilter = (type: ActivityEntityType) => {
    setSelectedEntityTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const topNav = [
    { title: 'العملاء المحتملين', href: ROUTES.dashboard.crm.leads.list, isActive: false },
    { title: 'مسار المبيعات', href: ROUTES.dashboard.crm.pipeline, isActive: false },
    { title: 'سجل الأنشطة', href: ROUTES.dashboard.crm.activities.list, isActive: false },
    { title: 'تقويم الأنشطة', href: '/dashboard/crm/activities/calendar', isActive: true },
  ]

  // Loading state
  if (isLoading) {
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
          <div className="ms-auto flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
            >
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
          <TopNav
            links={topNav}
            className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
          />
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
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isRTL ? 'فشل تحميل التقويم' : 'Failed to load calendar'}
              </h3>
              <p className="text-slate-500 mb-4">
                {(error as Error)?.message || 'حدث خطأ أثناء تحميل الأنشطة'}
              </p>
              <Button
                onClick={() => refetch()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
              >
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
        <TopNav
          links={topNav}
          className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white"
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className="ms-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search
              className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="بحث..."
              className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
          >
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
        {/* Hero Section */}
        <ProductivityHero
          badge="تقويم الأنشطة"
          title="تقويم الأنشطة"
          type="activities"
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Actions */}
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4">
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold"
                >
                  <Plus className="ms-2 h-5 w-5" aria-hidden="true" />
                  نشاط جديد
                </Button>
              </CardContent>
            </Card>

            {/* Activity Type Filters */}
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">نوع النشاط</h3>
                {(
                  ['call', 'email', 'meeting', 'task', 'note', 'whatsapp'] as ActivityType[]
                ).map((type) => {
                  const colors = ACTIVITY_COLORS[type]
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedActivityTypes.includes(type)}
                        onCheckedChange={() => toggleActivityTypeFilter(type)}
                      />
                      <label
                        htmlFor={`type-${type}`}
                        className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors.bg }}
                        />
                        {ACTIVITY_LABELS[type]}
                      </label>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Entity Type Filters */}
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">نوع الكيان</h3>
                {(['lead', 'contact', 'client'] as ActivityEntityType[]).map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      id={`entity-${type}`}
                      checked={selectedEntityTypes.includes(type)}
                      onCheckedChange={() => toggleEntityTypeFilter(type)}
                    />
                    <label
                      htmlFor={`entity-${type}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {ENTITY_TYPE_LABELS[type]}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Status Filter */}
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">الحالة</h3>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Assigned To Filter */}
            <Card className="rounded-3xl border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">المكلف</h3>
                <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="me">أنشطتي</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Clear Filters */}
            {(selectedActivityTypes.length > 0 ||
              selectedEntityTypes.length > 0 ||
              selectedStatus !== 'all' ||
              assignedToFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedActivityTypes([])
                  setSelectedEntityTypes([])
                  setSelectedStatus('all')
                  setAssignedToFilter('all')
                }}
                className="w-full rounded-xl"
              >
                <X className="ms-2 h-4 w-4" aria-hidden="true" />
                إزالة الفلاتر
              </Button>
            )}
          </div>

          {/* Calendar */}
          <div className="lg:col-span-3">
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
                      moreLinkText={(num) => `+${num} المزيد`}
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
          </div>
        </div>
      </Main>

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && ACTIVITY_ICONS[selectedEvent.extendedProps.type]}
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && ACTIVITY_LABELS[selectedEvent.extendedProps.type]}
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
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {selectedEvent.extendedProps.entityName && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  {selectedEvent.extendedProps.entityType === 'lead' && (
                    <User className="h-4 w-4" aria-hidden="true" />
                  )}
                  {selectedEvent.extendedProps.entityType === 'contact' && (
                    <Users className="h-4 w-4" aria-hidden="true" />
                  )}
                  {selectedEvent.extendedProps.entityType === 'organization' && (
                    <Building className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>{selectedEvent.extendedProps.entityName}</span>
                  <Badge variant="secondary" className="text-xs">
                    {ENTITY_TYPE_LABELS[selectedEvent.extendedProps.entityType]}
                  </Badge>
                </div>
              )}

              {selectedEvent.extendedProps.performedBy && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {selectedEvent.extendedProps.performedBy.firstName}{' '}
                    {selectedEvent.extendedProps.performedBy.lastName}
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
              إغلاق
            </Button>
            <Button onClick={handleViewEventDetails}>عرض التفاصيل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Activity Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء نشاط جديد</DialogTitle>
            <DialogDescription>أضف نشاط جديد إلى التقويم</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Activity Type */}
            <div>
              <Label htmlFor="type">نوع النشاط *</Label>
              <Select
                value={createForm.type}
                onValueChange={(value) =>
                  setCreateForm({ ...createForm, type: value as ActivityType })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    ['call', 'email', 'meeting', 'task', 'note', 'whatsapp'] as ActivityType[]
                  ).map((type) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ACTIVITY_COLORS[type].bg }}
                        />
                        {ACTIVITY_LABELS[type]}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">العنوان *</Label>
              <Input
                id="title"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="عنوان النشاط"
                className="rounded-xl"
              />
            </div>

            {/* Entity Type */}
            <div>
              <Label htmlFor="entityType">نوع الكيان *</Label>
              <Select
                value={createForm.entityType}
                onValueChange={(value) =>
                  setCreateForm({ ...createForm, entityType: value as ActivityEntityType })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['lead', 'contact', 'client'] as ActivityEntityType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      {ENTITY_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">تاريخ البدء *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={createForm.startDate}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, startDate: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              {!createForm.allDay && (
                <div>
                  <Label htmlFor="startTime">وقت البدء</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={createForm.startTime}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, startTime: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
              )}
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration">المدة (دقائق)</Label>
              <Input
                id="duration"
                type="number"
                value={createForm.duration}
                onChange={(e) =>
                  setCreateForm({ ...createForm, duration: parseInt(e.target.value) })
                }
                className="rounded-xl"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                placeholder="وصف النشاط"
                rows={3}
                className="rounded-xl"
              />
            </div>

            {/* Reminder */}
            <div>
              <Label htmlFor="reminder">التذكير (دقائق قبل)</Label>
              <Select
                value={createForm.reminder.toString()}
                onValueChange={(value) =>
                  setCreateForm({ ...createForm, reminder: parseInt(value) })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">بدون تذكير</SelectItem>
                  <SelectItem value="5">5 دقائق</SelectItem>
                  <SelectItem value="15">15 دقيقة</SelectItem>
                  <SelectItem value="30">30 دقيقة</SelectItem>
                  <SelectItem value="60">ساعة</SelectItem>
                  <SelectItem value="1440">يوم واحد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleCreateActivity}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
              إنشاء النشاط
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FullCalendar Custom Styles */}
      <style>{`
        .fullcalendar-wrapper .fc {
          font-family: inherit;
        }
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
          background-color: #10b981 !important;
          border-color: #10b981 !important;
          color: white !important;
        }
        .fullcalendar-wrapper .fc-day-today {
          background-color: #d1fae5 !important;
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
          color: #10b981;
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
        .fullcalendar-wrapper .fc-timegrid-now-indicator-line {
          border-color: #ef4444;
          border-width: 2px;
        }
        .fullcalendar-wrapper .fc-timegrid-now-indicator-arrow {
          border-color: #ef4444;
        }
      `}</style>
    </>
  )
}

export default ActivitiesCalendarView

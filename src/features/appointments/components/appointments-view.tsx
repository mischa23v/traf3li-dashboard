/**
 * Appointments View - Weekly Calendar with Sidebar
 * عرض المواعيد - تقويم أسبوعي مع الشريط الجانبي
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { format, addDays, startOfWeek, isSameDay, isToday, addWeeks, subWeeks, isBefore, startOfDay } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  AlertCircle,
  CalendarDays,
  CalendarClock,
  Ban,
  CheckCircle,
  Trash2,
  Search,
  Bell,
  Video,
  MapPin,
  List,
  LayoutGrid,
  Settings,
  SortAsc,
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
import { ProductivityHero } from '@/components/productivity-hero'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  GosiCard,
  GosiInput,
  GosiSelect,
  GosiSelectContent,
  GosiSelectItem,
  GosiSelectTrigger,
  GosiSelectValue,
  GosiButton
} from '@/components/ui/gosi-ui'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissionsStore } from '@/stores/permissions-store'
import { useTeamMembers } from '@/hooks/useCasesAndClients'

import {
  useAppointments,
  useBookAppointment,
  useConfirmAppointment,
  useCancelAppointment,
  useCompleteAppointment,
  useMarkNoShow,
  useAppointmentStats,
  useAvailableSlots,
  useCreateBlockedTime,
  useAvailability,
  useCreateAvailability,
  useDeleteAvailability,
  useBulkConfirmAppointments,
  useBulkCompleteAppointments,
  useRescheduleAppointment,
  useUpdateAppointment,
} from '@/hooks/useAppointments'
import { maskEmail, maskPhone, INPUT_MAX_LENGTHS, isValidPhoneLenient, toE164Phone } from '@/utils/validation-patterns'

import type {
  Appointment,
  AppointmentType,
  AppointmentStatus,
  AppointmentDuration,
  DayOfWeek,
  AvailabilitySlot,
  LocationType,
} from '@/services/appointmentsService'

// ==================== Constants ====================

const DURATIONS: { value: AppointmentDuration; labelAr: string; labelEn: string }[] = [
  { value: 15, labelAr: '15 دقيقة', labelEn: '15 minutes' },
  { value: 30, labelAr: '30 دقيقة', labelEn: '30 minutes' },
  { value: 45, labelAr: '45 دقيقة', labelEn: '45 minutes' },
  { value: 60, labelAr: 'ساعة', labelEn: '1 hour' },
  { value: 90, labelAr: 'ساعة ونصف', labelEn: '1.5 hours' },
  { value: 120, labelAr: 'ساعتين', labelEn: '2 hours' },
]

const APPOINTMENT_TYPES: { value: AppointmentType; labelAr: string; labelEn: string; color: string }[] = [
  { value: 'consultation', labelAr: 'استشارة', labelEn: 'Consultation', color: 'bg-blue-500' },
  { value: 'follow_up', labelAr: 'متابعة', labelEn: 'Follow Up', color: 'bg-green-500' },
  { value: 'case_review', labelAr: 'مراجعة قضية', labelEn: 'Case Review', color: 'bg-purple-500' },
  { value: 'initial_meeting', labelAr: 'اجتماع أولي', labelEn: 'Initial Meeting', color: 'bg-orange-500' },
  { value: 'other', labelAr: 'أخرى', labelEn: 'Other', color: 'bg-gray-500' },
]

const STATUS_CONFIG: Record<AppointmentStatus, { labelAr: string; labelEn: string; color: string; bgColor: string }> = {
  pending: { labelAr: 'معلق', labelEn: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-300' },
  scheduled: { labelAr: 'مجدول', labelEn: 'Scheduled', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-300' },
  confirmed: { labelAr: 'مؤكد', labelEn: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-300' },
  completed: { labelAr: 'مكتمل', labelEn: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100 border-green-300' },
  cancelled: { labelAr: 'ملغي', labelEn: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100 border-red-300' },
  no_show: { labelAr: 'لم يحضر', labelEn: 'No Show', color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-300' },
}

// Fallback for unknown statuses to prevent crashes
const DEFAULT_STATUS_CONFIG = { labelAr: 'غير معروف', labelEn: 'Unknown', color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-300' }

const WEEKDAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const WEEKDAYS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const LOCATION_TYPES: { value: LocationType; labelAr: string; labelEn: string; icon: 'video' | 'map' | 'phone' }[] = [
  { value: 'video', labelAr: 'اجتماع عن بعد', labelEn: 'Video Call', icon: 'video' },
  { value: 'in-person', labelAr: 'حضوري', labelEn: 'In Person', icon: 'map' },
  { value: 'phone', labelAr: 'مكالمة هاتفية', labelEn: 'Phone Call', icon: 'phone' },
]

/**
 * Normalize backend location type to frontend value for form display
 * Backend stores: virtual, office, phone, client_site, other
 * Frontend uses: video, in-person, phone
 */
const normalizeLocationType = (locationType: LocationType | undefined): LocationType => {
  if (!locationType) return 'video'
  if (locationType === 'virtual') return 'video'
  if (locationType === 'office' || locationType === 'client_site') return 'in-person'
  return locationType
}

// ==================== Main Component ====================

export function AppointmentsView() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const locale = isRtl ? ar : enUS

  // Get current user from auth store
  const user = useAuthStore((state) => state.user)

  // Check if user can manage other lawyers (firm admin with full permissions)
  const { isAdminOrOwner, isSoloLawyer } = usePermissionsStore()
  const canManageOtherLawyers = isAdminOrOwner() && !isSoloLawyer

  // Fetch team members for cross-lawyer management (only if user can manage others)
  const { data: teamMembers = [] } = useTeamMembers(canManageOtherLawyers)

  // View & Filter state
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week')
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }))
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set())
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [rescheduleData, setRescheduleData] = useState<{
    date: string
    startTime: string
  }>({
    date: '',
    startTime: '',
  })
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editFormData, setEditFormData] = useState<{
    type: AppointmentType
    notes: string
    locationType: LocationType
    meetingLink: string
    location: string
  }>({
    type: 'consultation',
    notes: '',
    locationType: 'video',
    meetingLink: '',
    location: '',
  })

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('date')

  // Fetch data
  const { data: statsData } = useAppointmentStats()
  const { data: appointmentsData, isLoading, isError, error, refetch } = useAppointments({
    status: statusFilter !== 'all' ? statusFilter as AppointmentStatus : undefined,
    // Note: assignedTo filter would need backend support if not already present
  })

  const stats = statsData?.data
  const appointments = appointmentsData?.data?.appointments || []

  // Cancel mutation for delete
  const cancelMutation = useCancelAppointment()

  // Reschedule mutation
  const rescheduleMutation = useRescheduleAppointment()

  // Update mutation
  const updateMutation = useUpdateAppointment()

  // Bulk mutations
  const bulkConfirmMutation = useBulkConfirmAppointments()
  const bulkCompleteMutation = useBulkCompleteAppointments()

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    let result = [...appointments]

    // Filter by type
    if (typeFilter !== 'all') {
      result = result.filter(apt => apt.type === typeFilter)
    }

    // Filter by assigned lawyer (client-side filter since backend returns all for admins)
    if (assignedToFilter !== 'all') {
      result = result.filter(apt => apt.lawyerId === assignedToFilter)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(apt =>
        apt.clientName?.toLowerCase().includes(query) ||
        apt.clientEmail?.toLowerCase().includes(query) ||
        apt.clientPhone?.includes(query)
      )
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      return 0
    })

    return result
  }, [appointments, typeFilter, searchQuery, sortBy, assignedToFilter])

  // Get week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
  }, [currentWeekStart])

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {}
    filteredAppointments.forEach((apt) => {
      if (apt.date) {
        const dateKey = format(new Date(apt.date), 'yyyy-MM-dd')
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(apt)
      }
    })
    // Sort appointments within each day by time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        const timeA = a.startTime || '00:00'
        const timeB = b.startTime || '00:00'
        return timeA.localeCompare(timeB)
      })
    })
    return grouped
  }, [filteredAppointments])

  // Navigation handlers
  const goToPreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1))
  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1))
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))

  // Selection handlers
  const toggleSelectAppointment = (id: string) => {
    const newSelected = new Set(selectedAppointments)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedAppointments(newSelected)
  }

  const clearSelection = () => setSelectedAppointments(new Set())

  // Delete handlers
  const handleDeleteSingle = (id: string) => {
    setAppointmentToDelete(id)
    setShowDeleteConfirm(true)
  }

  const handleDeleteSelected = () => {
    if (selectedAppointments.size === 0) return
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      const idsToDelete = appointmentToDelete ? [appointmentToDelete] : Array.from(selectedAppointments)

      for (const id of idsToDelete) {
        await cancelMutation.mutateAsync({ id, reason: 'Deleted by user' })
      }

      toast.success(t('appointments.success.deleted', { count: idsToDelete.length }, `تم حذف ${idsToDelete.length} موعد بنجاح`))

      setSelectedAppointments(new Set())
      setAppointmentToDelete(null)
      setShowDeleteConfirm(false)
      refetch()
    } catch (error: any) {
      const errorMessage = error?.message || t('appointments.errors.delete', 'حدث خطأ أثناء الحذف')
      toast.error(errorMessage)
    }
  }

  // Bulk confirm handler
  const handleBulkConfirm = async () => {
    if (selectedAppointments.size === 0) return

    try {
      const ids = Array.from(selectedAppointments)
      await bulkConfirmMutation.mutateAsync(ids)

      toast.success(t('appointments.success.confirmed', { count: ids.length }, `تم تأكيد ${ids.length} موعد بنجاح`))

      setSelectedAppointments(new Set())
      refetch()
    } catch (error: any) {
      const errorMessage = error?.message || t('appointments.errors.confirm', 'حدث خطأ أثناء التأكيد')
      toast.error(errorMessage)
    }
  }

  // Bulk complete handler
  const handleBulkComplete = async () => {
    if (selectedAppointments.size === 0) return

    try {
      const ids = Array.from(selectedAppointments)
      await bulkCompleteMutation.mutateAsync(ids)

      toast.success(t('appointments.success.completed', { count: ids.length }, `تم إكمال ${ids.length} موعد بنجاح`))

      setSelectedAppointments(new Set())
      refetch()
    } catch (error: any) {
      const errorMessage = error?.message || t('appointments.errors.complete', 'حدث خطأ أثناء الإكمال')
      toast.error(errorMessage)
    }
  }

  // View appointment details
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsDialog(true)
  }

  // Reschedule handlers
  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setRescheduleData({
      date: appointment.date,
      startTime: appointment.startTime,
    })
    setShowRescheduleDialog(true)
  }

  const handleSaveReschedule = async () => {
    if (!selectedAppointment || !rescheduleData.date || !rescheduleData.startTime) return
    try {
      await rescheduleMutation.mutateAsync({
        id: selectedAppointment.id,
        data: {
          date: rescheduleData.date,
          startTime: rescheduleData.startTime,
        }
      })
      toast.success(t('appointments.success.rescheduled', 'تم إعادة جدولة الموعد بنجاح'))
      setShowRescheduleDialog(false)
      refetch()
    } catch (error: any) {
      toast.error(error?.message || t('appointments.errors.generic', 'حدث خطأ'))
    }
  }

  // Edit appointment handlers
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setEditFormData({
      type: appointment.type,
      notes: appointment.notes || '',
      // Normalize backend values (virtual → video, office → in-person) for form display
      locationType: normalizeLocationType(appointment.locationType),
      meetingLink: appointment.meetingLink || '',
      location: appointment.location || '',
    })
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedAppointment) return
    try {
      await updateMutation.mutateAsync({
        id: selectedAppointment.id,
        data: {
          type: editFormData.type,
          notes: editFormData.notes,
          meetingLink: editFormData.meetingLink,
          location: editFormData.location,
        }
      })
      toast.success(t('appointments.success.updated', 'تم تحديث الموعد بنجاح'))
      setShowEditDialog(false)
      refetch()
    } catch (error: any) {
      toast.error(error?.message || t('appointments.errors.generic', 'حدث خطأ'))
    }
  }

  // Clear filters
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || assignedToFilter !== 'all'
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setTypeFilter('all')
    setAssignedToFilter('all')
  }

  // Stats for hero
  const heroStats = useMemo(() => [
    {
      label: t('appointments.stats.today', 'مواعيد اليوم'),
      value: stats?.todayCount || 0,
      icon: CalendarDays,
      status: 'normal' as const,
    },
    {
      label: t('appointments.stats.pending', 'معلقة'),
      value: stats?.pending || 0,
      icon: Clock,
      status: (stats?.pending || 0) > 0 ? 'attention' as const : 'zero' as const,
    },
    {
      label: t('appointments.stats.confirmed', 'مؤكدة'),
      value: stats?.confirmed || 0,
      icon: CheckCircle,
      status: 'normal' as const,
    },
    {
      label: t('appointments.stats.thisWeek', 'هذا الأسبوع'),
      value: stats?.weekCount || 0,
      icon: CalendarClock,
      status: 'normal' as const,
    },
  ], [stats, isRtl, t])

  const topNav = [
    { title: t('nav.overview', 'الرئيسية'), href: ROUTES.dashboard.home, isActive: false },
    { title: t('nav.calendar', 'التقويم'), href: ROUTES.dashboard.calendar, isActive: false },
    { title: t('nav.appointments', 'المواعيد'), href: ROUTES.dashboard.appointments, isActive: true },
  ]

  // Get current month name for display
  const currentMonthName = format(currentWeekStart, 'MMMM yyyy', { locale })

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <DynamicIsland />
        </div>
        <div className='ms-auto flex items-center gap-4'>
          <div className="relative hidden md:block">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input type="text" placeholder={t('common.search', 'بحث...')} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <Button variant="ghost" size="icon" className="relative rounded-full text-slate-300 hover:bg-white/10 hover:text-white" aria-label={t('common.notifications', 'الإشعارات')}>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 end-2 h-2 w-2 bg-red-500 rounded-full border border-navy" role="status" aria-label={t('common.unreadNotifications', 'إشعارات غير مقروءة')}></span>
          </Button>
          <LanguageSwitcher className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ThemeSwitch className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ConfigDrawer className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <ProfileDropdown className="text-slate-300 hover:bg-white/10 hover:text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
        {/* HERO CARD & STATS */}
        <ProductivityHero
          badge={t('appointments.badge', 'إدارة المواعيد')}
          title={t('appointments.title', 'المواعيد')}
          type="appointments"
          stats={heroStats}
          hideButtons
        >
          <Button
            onClick={() => setShowBookingDialog(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0 text-sm"
          >
            <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
            {t('appointments.actions.newAppointment', 'موعد جديد')}
          </Button>
          <Button
            onClick={() => setShowBlockDialog(true)}
            variant="outline"
            className="h-10 px-5 rounded-xl font-bold border-white/10 text-white hover:bg-white/10 hover:text-white bg-transparent text-sm"
          >
            <Ban className="ms-2 h-4 w-4" aria-hidden="true" />
            {t('appointments.actions.blockTime', 'حظر وقت')}
          </Button>
        </ProductivityHero>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT (Week View) */}
          <div className="lg:col-span-2 space-y-6">
            {/* FILTERS BAR */}
            <GosiCard className="p-4 md:p-6 rounded-[2rem]">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute end-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
                  <GosiInput
                    type="text"
                    placeholder={t('appointments.filters.searchPlaceholder', 'بحث بالاسم أو الهاتف...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pe-12 h-14 w-full text-base"
                    maxLength={100}
                  />
                </div>

                {/* Status Filter */}
                <div className="flex-1 min-w-[150px]">
                  <GosiSelect value={statusFilter} onValueChange={setStatusFilter}>
                    <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{t('appointments.filters.status', 'الحالة')}:</span>
                        <GosiSelectValue />
                      </div>
                    </GosiSelectTrigger>
                    <GosiSelectContent>
                      <GosiSelectItem value="all">{t('common.all', 'الكل')}</GosiSelectItem>
                      <GosiSelectItem value="pending">{t('appointments.status.pending', 'معلق')}</GosiSelectItem>
                      <GosiSelectItem value="confirmed">{t('appointments.status.confirmed', 'مؤكد')}</GosiSelectItem>
                      <GosiSelectItem value="completed">{t('appointments.status.completed', 'مكتمل')}</GosiSelectItem>
                      <GosiSelectItem value="cancelled">{t('appointments.status.cancelled', 'ملغي')}</GosiSelectItem>
                    </GosiSelectContent>
                  </GosiSelect>
                </div>

                {/* Type Filter */}
                <div className="flex-1 min-w-[150px]">
                  <GosiSelect value={typeFilter} onValueChange={setTypeFilter}>
                    <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{t('appointments.filters.type', 'النوع')}:</span>
                        <GosiSelectValue />
                      </div>
                    </GosiSelectTrigger>
                    <GosiSelectContent>
                      <GosiSelectItem value="all">{t('common.all', 'الكل')}</GosiSelectItem>
                      {APPOINTMENT_TYPES.map((type) => (
                        <GosiSelectItem key={type.value} value={type.value}>
                          {isRtl ? type.labelAr : type.labelEn}
                        </GosiSelectItem>
                      ))}
                    </GosiSelectContent>
                  </GosiSelect>
                </div>

                {/* Lawyer Filter - Only for firm admins */}
                {canManageOtherLawyers && teamMembers.length > 0 && (
                  <div className="flex-1 min-w-[180px]">
                    <GosiSelect value={assignedToFilter} onValueChange={setAssignedToFilter}>
                      <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{t('appointments.filters.lawyer', 'المحامي')}:</span>
                          <GosiSelectValue />
                        </div>
                      </GosiSelectTrigger>
                      <GosiSelectContent>
                        <GosiSelectItem value="all">{t('common.all', 'الكل')}</GosiSelectItem>
                        <GosiSelectItem value={user?._id || ''}>{t('common.me', 'أنا')}</GosiSelectItem>
                        {teamMembers.filter(m => m._id !== user?._id).map((member) => (
                          <GosiSelectItem key={member._id} value={member._id}>
                            {member.firstName} {member.lastName}
                          </GosiSelectItem>
                        ))}
                      </GosiSelectContent>
                    </GosiSelect>
                  </div>
                )}

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <GosiButton
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-14 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-dashed border-red-200 px-6"
                  >
                    <X className="h-5 w-5 ms-2" aria-hidden="true" />
                    {t('appointments.actions.clearFilters', 'مسح الفلاتر')}
                  </GosiButton>
                )}
              </div>
            </GosiCard>

            {/* WEEK VIEW CONTROLS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left: Month Selector */}
                <Select value={format(currentWeekStart, 'yyyy-MM')} onValueChange={(val) => {
                  const [year, month] = val.split('-').map(Number)
                  setCurrentWeekStart(startOfWeek(new Date(year, month - 1, 1), { weekStartsOn: 0 }))
                }} aria-hidden="true">
                  <SelectTrigger className="w-40 h-10 rounded-xl border-slate-200">
                    <SelectValue>{currentMonthName}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date(new Date().getFullYear(), i, 1)
                      return (
                        <SelectItem key={i} value={format(date, 'yyyy-MM')}>
                          {format(date, 'MMMM yyyy', { locale })}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {/* Center: Navigation with Back to Today */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={goToPreviousWeek} className="h-10 w-10 rounded-xl hover:bg-slate-100" aria-label={t('appointments.actions.previousWeek', 'الأسبوع السابق')}>
                    {isRtl ? <ChevronRight className="h-5 w-5" aria-hidden="true" /> : <ChevronLeft className="h-5 w-5" aria-hidden="true" />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={goToToday}
                    className="h-10 px-4 rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-sm font-medium"
                  >
                    {t('appointments.actions.today', 'العودة لليوم')}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-10 w-10 rounded-xl hover:bg-slate-100" aria-label={t('appointments.actions.nextWeek', 'الأسبوع التالي')}>
                    {isRtl ? <ChevronLeft className="h-5 w-5" aria-hidden="true" /> : <ChevronRight className="h-5 w-5" aria-hidden="true" />}
                  </Button>
                </div>

                {/* Right: View Toggle & Bulk Actions */}
                <div className="flex items-center gap-3">
                  {selectedAppointments.size > 0 && (
                    <div className="flex items-center gap-2 pe-3 border-e border-slate-200">
                      <span className="text-sm text-slate-600">
                        {t('appointments.labels.selected', { count: selectedAppointments.size, defaultValue: '{{count}} محدد' })}
                      </span>
                      <Button variant="ghost" size="sm" onClick={clearSelection} className="h-8 text-slate-500">
                        {t('common.clear', 'إلغاء')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkConfirm}
                        disabled={bulkConfirmMutation.isPending}
                        className="h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                      >
                        {bulkConfirmMutation.isPending ? (
                          <Loader2 className="h-4 w-4 ms-1 animate-spin" aria-hidden="true" />
                        ) : (
                          <CheckCircle className="h-4 w-4 ms-1" aria-hidden="true" />
                        )}
                        {t('appointments.actions.confirm', 'تأكيد')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkComplete}
                        disabled={bulkCompleteMutation.isPending}
                        className="h-8 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                      >
                        {bulkCompleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 ms-1 animate-spin" aria-hidden="true" />
                        ) : (
                          <Check className="h-4 w-4 ms-1" aria-hidden="true" />
                        )}
                        {t('appointments.actions.complete', 'إكمال')}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="h-8 bg-red-500 hover:bg-red-600">
                        <Trash2 className="h-4 w-4 ms-1" aria-hidden="true" />
                        {t('common.delete', 'حذف')}
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center bg-slate-100 rounded-xl p-1">
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                      className={cn('h-8 px-3 rounded-lg', viewMode === 'week' ? 'bg-white shadow-sm' : 'hover:bg-slate-200')}
                    >
                      <LayoutGrid className="h-4 w-4 ms-1" aria-hidden="true" />
                      {t('appointments.views.week', 'أسبوعي')}
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={cn('h-8 px-3 rounded-lg', viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200')}
                    >
                      <List className="h-4 w-4 ms-1" aria-hidden="true" />
                      {t('appointments.views.list', 'قائمة')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white rounded-2xl p-8" aria-busy="true" aria-live="polite" aria-label={t('common.loading', 'جارٍ التحميل...')}>
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-20 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="bg-red-50 rounded-2xl p-12 text-center border border-red-100" role="alert" aria-live="assertive">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('appointments.errors.loading', 'خطأ في التحميل')}</h3>
                <p className="text-slate-500 mb-4">{error?.message}</p>
                <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                  {t('common.retry', 'إعادة المحاولة')}
                </Button>
              </div>
            )}

            {/* Week View */}
            {!isLoading && !isError && viewMode === 'week' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Week Header */}
                <div className="grid grid-cols-7 border-b border-slate-100">
                  {weekDays.map((day, idx) => {
                    const isCurrentDay = isToday(day)
                    const dateKey = format(day, 'yyyy-MM-dd')
                    const dayAppointments = appointmentsByDate[dateKey] || []

                    return (
                      <div key={idx} className={cn('p-4 text-center border-e border-slate-100 last:border-e-0', isCurrentDay && 'bg-emerald-50')}>
                        <div className={cn('text-xs font-bold uppercase tracking-wider mb-1', isCurrentDay ? 'text-emerald-600' : 'text-slate-400')}>
                          {isRtl ? WEEKDAYS_AR[day.getDay()] : WEEKDAYS_EN[day.getDay()]}
                        </div>
                        <div className={cn('text-2xl font-bold', isCurrentDay ? 'text-emerald-600' : 'text-slate-900')}>
                          {format(day, 'd')}
                        </div>
                        {dayAppointments.length > 0 && (
                          <Badge variant="secondary" className="text-xs bg-slate-100 mt-1">
                            <span className="sr-only">{t('appointments.labels.appointmentCount', 'عدد المواعيد')}: </span>
                            {dayAppointments.length}
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Week Body */}
                <div className="grid grid-cols-7 min-h-[400px]">
                  {weekDays.map((day, idx) => {
                    const dateKey = format(day, 'yyyy-MM-dd')
                    const dayAppointments = appointmentsByDate[dateKey] || []
                    const isCurrentDay = isToday(day)

                    return (
                      <div key={idx} className={cn('p-2 border-e border-slate-100 last:border-e-0 min-h-[400px]', isCurrentDay && 'bg-emerald-50/30')}>
                        <div className="space-y-2">
                          {dayAppointments.map((apt) => {
                            const typeConfig = APPOINTMENT_TYPES.find((t) => t.value === apt.type)
                            const statusConfig = STATUS_CONFIG[apt.status] || DEFAULT_STATUS_CONFIG
                            const isSelected = selectedAppointments.has(apt.id)

                            return (
                              <div
                                key={apt.id}
                                onClick={() => handleViewDetails(apt)}
                                className={cn('p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md group relative', statusConfig.bgColor, isSelected && 'ring-2 ring-emerald-500')}
                              >
                                <div
                                  className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => { e.stopPropagation(); toggleSelectAppointment(apt.id) }}
                                >
                                  <Checkbox checked={isSelected} aria-label="Select appointment" />
                                </div>

                                <div className="text-sm font-bold text-slate-900 mb-1">{apt.startTime || '00:00'}</div>
                                <div className="text-xs font-medium text-slate-700 truncate">{apt.clientName || t('appointments.labels.noName', 'بدون اسم')}</div>
                                <div className="mt-2">
                                  <span className={cn('inline-block px-2 py-0.5 rounded-full text-[10px] font-medium text-white', typeConfig?.color || 'bg-gray-500')}>
                                    <span className="sr-only">{t('appointments.labels.appointmentType', 'نوع الموعد')}: </span>
                                    {isRtl ? typeConfig?.labelAr : typeConfig?.labelEn}
                                  </span>
                                </div>

                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteSingle(apt.id) }}
                                  className="absolute bottom-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-100 text-red-500"
                                  aria-label={t('appointments.actions.deleteAppointment', 'حذف الموعد')}
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              </div>
                            )
                          })}

                          {dayAppointments.length === 0 && (
                            <div className="text-center py-8 text-slate-300">
                              <CalendarIcon className="h-6 w-6 mx-auto mb-1 opacity-50" aria-hidden="true" />
                              <span className="text-xs">{t('appointments.empty.noAppointments', 'لا مواعيد')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* List View */}
            {!isLoading && !isError && viewMode === 'list' && (
              <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                    <CalendarClock className="w-12 h-12 text-emerald-500 mx-auto mb-4" aria-hidden="true" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{t('appointments.empty.title', 'لا توجد مواعيد')}</h3>
                    <p className="text-slate-500 mb-4">{t('appointments.empty.description', 'لا توجد مواعيد حالياً')}</p>
                    <Button onClick={() => setShowBookingDialog(true)} className="bg-emerald-500 hover:bg-emerald-600">
                      <Plus className="w-4 h-4 ms-2" />
                      {t('appointments.actions.newAppointment', 'موعد جديد')}
                    </Button>
                  </div>
                ) : (
                  filteredAppointments.map((apt) => {
                    const typeConfig = APPOINTMENT_TYPES.find((t) => t.value === apt.type)
                    const statusConfig = STATUS_CONFIG[apt.status] || DEFAULT_STATUS_CONFIG
                    const isSelected = selectedAppointments.has(apt.id)

                    return (
                      <div
                        key={apt.id}
                        className={cn('bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group', isSelected && 'ring-2 ring-emerald-500')}
                        onClick={() => handleViewDetails(apt)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="pt-1" onClick={(e) => { e.stopPropagation(); toggleSelectAppointment(apt.id) }}>
                            <Checkbox checked={isSelected} aria-label="Select appointment" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={cn('px-2 py-1 rounded-lg text-xs font-medium', statusConfig.bgColor, statusConfig.color)}>
                                <span className="sr-only">{t('appointments.labels.status', 'الحالة')}: </span>
                                {isRtl ? statusConfig.labelAr : statusConfig.labelEn}
                              </span>
                              <span className={cn('px-2 py-1 rounded-lg text-xs font-medium text-white', typeConfig?.color || 'bg-gray-500')}>
                                <span className="sr-only">{t('appointments.labels.appointmentType', 'نوع الموعد')}: </span>
                                {isRtl ? typeConfig?.labelAr : typeConfig?.labelEn}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">{apt.clientName || t('appointments.labels.noName', 'بدون اسم')}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" aria-hidden="true" />{apt.date ? format(new Date(apt.date), 'MMM d, yyyy', { locale }) : '-'}</span>
                              <span className="flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden="true" />{apt.startTime || '00:00'}</span>
                              {apt.clientPhone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" aria-hidden="true" />{maskPhone(apt.clientPhone)}</span>}
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteSingle(apt.id) }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-red-50 text-red-500"
                            aria-label={t('appointments.actions.deleteAppointment', 'حذف الموعد')}
                          >
                            <Trash2 className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">{t('appointments.sidebar.quickActions', 'إجراءات سريعة')}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowBookingDialog(true)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                >
                  <Plus className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <span className="text-sm font-medium text-slate-700">{t('appointments.actions.newAppointment', 'موعد جديد')}</span>
                </button>
                <button
                  onClick={() => setShowBlockDialog(true)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-red-200 hover:border-red-400 hover:bg-red-50 transition-all group"
                >
                  <Ban className="h-6 w-6 text-red-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <span className="text-sm font-medium text-slate-700">{t('appointments.actions.blockTime', 'حظر وقت')}</span>
                </button>
              </div>
              <button
                onClick={() => setShowAvailabilityDialog(true)}
                className="w-full mt-3 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all group"
              >
                <Settings className="h-5 w-5 text-slate-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-700">{t('appointments.actions.manageAvailability', 'إدارة أوقات العمل')}</span>
              </button>
            </div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">{t('appointments.sidebar.todayAppointments', 'مواعيد اليوم')}</h3>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                  {format(new Date(), 'd MMM')}
                </Badge>
              </div>
              <div className="space-y-3">
                {appointments.filter(apt => apt.date && isToday(new Date(apt.date))).length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    {t('appointments.empty.noToday', 'لا توجد مواعيد اليوم')}
                  </div>
                ) : (
                  appointments
                    .filter(apt => apt.date && isToday(new Date(apt.date)))
                    .slice(0, 5)
                    .map((apt) => (
                      <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer" onClick={() => handleViewDetails(apt)}>
                        <div className="text-sm font-bold text-emerald-600">{apt.startTime || '00:00'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{apt.clientName}</div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </Main>

      {/* Book Appointment Dialog */}
      <BookAppointmentDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        isRtl={isRtl}
        locale={locale}
        user={user}
        canManageOtherLawyers={canManageOtherLawyers}
        teamMembers={teamMembers}
      />

      {/* Block Time Dialog */}
      <BlockTimeDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        isRtl={isRtl}
        canManageOtherLawyers={canManageOtherLawyers}
        teamMembers={teamMembers}
        currentUserId={user?._id}
      />

      {/* Manage Availability Dialog */}
      <ManageAvailabilityDialog
        open={showAvailabilityDialog}
        onOpenChange={setShowAvailabilityDialog}
        isRtl={isRtl}
        canManageOtherLawyers={canManageOtherLawyers}
        teamMembers={teamMembers}
        currentUserId={user?._id}
      />

      {/* Appointment Details Dialog */}
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        open={showDetailsDialog}
        onOpenChange={(open) => {
          setShowDetailsDialog(open)
          if (!open) setSelectedAppointment(null)
        }}
        isRtl={isRtl}
        locale={locale}
        onDelete={(id) => {
          setShowDetailsDialog(false)
          handleDeleteSingle(id)
        }}
        onReschedule={(appointment) => {
          setShowDetailsDialog(false)
          handleRescheduleAppointment(appointment)
        }}
        onEdit={handleEditAppointment}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('appointments.dialogs.delete.title', 'تأكيد الحذف')}</DialogTitle>
            <DialogDescription>
              {appointmentToDelete
                ? t('appointments.dialogs.delete.messageSingle', 'هل أنت متأكد من حذف هذا الموعد؟')
                : t('appointments.dialogs.delete.messageMultiple', { count: selectedAppointments.size }, `هل أنت متأكد من حذف ${selectedAppointments.size} موعد؟`)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel', 'إلغاء')}</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" aria-hidden="true" /> : <Trash2 className="h-4 w-4 ms-2" aria-hidden="true" />}
              {t('common.delete', 'حذف')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Appointment Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" aria-hidden="true" />
              {t('appointments.dialogs.reschedule.title', 'إعادة جدولة الموعد')}
            </DialogTitle>
            <DialogDescription>
              {t('appointments.dialogs.reschedule.description', 'اختر تاريخ ووقت جديد للموعد')}
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div
              className="space-y-4 py-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && rescheduleData.date && rescheduleData.startTime && !rescheduleMutation.isPending) {
                  e.preventDefault()
                  handleSaveReschedule()
                }
              }}
            >
              {/* Current Date/Time Info */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">{t('appointments.dialogs.reschedule.currentLabel', 'الموعد الحالي:')}</p>
                <p className="font-medium">
                  {format(new Date(selectedAppointment.date), 'EEEE, d MMMM yyyy', { locale })} - {selectedAppointment.startTime}
                </p>
              </div>

              {/* New Date */}
              <div>
                <Label htmlFor="reschedule-date">{t('appointments.labels.newDate', 'التاريخ الجديد')}</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="mt-1"
                />
              </div>

              {/* New Time */}
              <div>
                <Label htmlFor="reschedule-time">{t('appointments.labels.newTime', 'الوقت الجديد')}</Label>
                <Input
                  id="reschedule-time"
                  type="time"
                  value={rescheduleData.startTime}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Client Info */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 flex items-center gap-2">
                  <User className="h-4 w-4" aria-hidden="true" />
                  {selectedAppointment.clientName}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              {t('common.cancel', 'إلغاء')}
            </Button>
            <Button
              onClick={handleSaveReschedule}
              disabled={rescheduleMutation.isPending || !rescheduleData.date || !rescheduleData.startTime}
            >
              {rescheduleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" aria-hidden="true" /> : <CalendarClock className="h-4 w-4 me-2" aria-hidden="true" />}
              {t('appointments.actions.reschedule', 'إعادة جدولة')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('appointments.dialogs.edit.title', 'تعديل الموعد')}</DialogTitle>
          </DialogHeader>
          <div
            className="space-y-4 py-4"
            onKeyDown={(e) => {
              // Submit on Enter except in textarea (allow Shift+Enter for new lines)
              if (e.key === 'Enter' && !e.shiftKey && !updateMutation.isPending) {
                const target = e.target as HTMLElement
                if (target.tagName !== 'TEXTAREA') {
                  e.preventDefault()
                  handleSaveEdit()
                }
              }
            }}
          >
            {/* Type selector */}
            <div>
              <Label>{t('appointments.labels.type', 'نوع الموعد')}</Label>
              <Select value={editFormData.type} onValueChange={(v) => setEditFormData(prev => ({ ...prev, type: v as AppointmentType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{isRtl ? t.labelAr : t.labelEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Type */}
            <div>
              <Label>{t('appointments.labels.locationType', 'نوع الموقع')}</Label>
              <div className="flex gap-2 mt-2" role="radiogroup" aria-label={t('appointments.labels.locationType', 'نوع الموقع')}>
                {LOCATION_TYPES.map(lt => (
                  <Button
                    key={lt.value}
                    type="button"
                    role="radio"
                    aria-checked={editFormData.locationType === lt.value}
                    variant={editFormData.locationType === lt.value ? 'default' : 'outline'}
                    onClick={() => setEditFormData(prev => ({ ...prev, locationType: lt.value }))}
                    className="flex-1"
                  >
                    {lt.icon === 'video' ? <Video className="h-4 w-4 me-1" aria-hidden="true" /> : lt.icon === 'map' ? <MapPin className="h-4 w-4 me-1" aria-hidden="true" /> : <Phone className="h-4 w-4 me-1" aria-hidden="true" />}
                    {isRtl ? lt.labelAr : lt.labelEn}
                  </Button>
                ))}
              </div>
            </div>

            {/* Meeting Link (for video/virtual) */}
            {['video', 'virtual'].includes(editFormData.locationType) && (
              <div>
                <Label>{t('appointments.labels.meetingLink', 'رابط الاجتماع')}</Label>
                <Input
                  value={editFormData.meetingLink}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                  maxLength={500}
                />
              </div>
            )}

            {/* Location (for in-person/office) */}
            {['in-person', 'office'].includes(editFormData.locationType) && (
              <div>
                <Label>{t('appointments.labels.location', 'العنوان')}</Label>
                <Input
                  value={editFormData.location}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder={t('appointments.labels.locationPlaceholder', 'أدخل العنوان')}
                  maxLength={500}
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <Label>{t('appointments.labels.notes', 'ملاحظات')}</Label>
              <Textarea
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t('appointments.labels.notesPlaceholder', 'ملاحظات إضافية...')}
                maxLength={2000}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {t('common.cancel', 'إلغاء')}
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" aria-hidden="true" /> : null}
              {t('common.save', 'حفظ')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ==================== Appointment Details Dialog ====================

function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
  isRtl,
  locale,
  onDelete,
  onReschedule,
  onEdit,
}: {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isRtl: boolean
  locale: any
  onDelete: (id: string) => void
  onReschedule: (appointment: Appointment) => void
  onEdit: (appointment: Appointment) => void
}) {
  const { t } = useTranslation()
  const confirmMutation = useConfirmAppointment()
  const completeMutation = useCompleteAppointment()
  const noShowMutation = useMarkNoShow()

  if (!appointment) return null

  const typeConfig = APPOINTMENT_TYPES.find((t) => t.value === appointment.type)
  const statusConfig = STATUS_CONFIG[appointment.status] || DEFAULT_STATUS_CONFIG

  const handleAction = async (action: string) => {
    try {
      switch (action) {
        case 'confirm':
          await confirmMutation.mutateAsync(appointment.id)
          toast.success(t('appointments.success.confirmed', 'تم تأكيد الموعد'))
          break
        case 'complete':
          await completeMutation.mutateAsync({ id: appointment.id })
          toast.success(t('appointments.success.appointmentCompleted', 'تم إكمال الموعد'))
          break
        case 'no_show':
          await noShowMutation.mutateAsync(appointment.id)
          toast.success(t('appointments.success.markedNoShow', 'تم تسجيل عدم الحضور'))
          break
      }
      onOpenChange(false)
    } catch (error: any) {
      const errorMessage = error?.message || t('appointments.errors.generic', 'حدث خطأ')
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn('p-2 rounded-xl', typeConfig?.color || 'bg-gray-500')}>
              <User className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            {appointment.clientName || t('appointments.labels.noName', 'بدون اسم')}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-2">
            <span className={cn('px-2 py-1 rounded-lg text-xs font-medium', statusConfig.bgColor, statusConfig.color)}>
              {isRtl ? statusConfig.labelAr : statusConfig.labelEn}
            </span>
            <span className={cn('px-2 py-1 rounded-lg text-xs font-medium text-white', typeConfig?.color || 'bg-gray-500')}>
              {isRtl ? typeConfig?.labelAr : typeConfig?.labelEn}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 text-slate-700">
            <CalendarIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            <span>{appointment.date ? format(new Date(appointment.date), 'EEEE، d MMMM yyyy', { locale }) : '-'}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Clock className="h-5 w-5 text-slate-400" aria-hidden="true" />
            <span>{appointment.startTime || '00:00'} - {appointment.endTime || '--:--'}</span>
          </div>
          {appointment.clientEmail && (
            <div className="flex items-center gap-3 text-slate-700">
              <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
              <span>{appointment.clientEmail}</span>
            </div>
          )}
          {appointment.clientPhone && (
            <div className="flex items-center gap-3 text-slate-700">
              <Phone className="h-5 w-5 text-slate-400" aria-hidden="true" />
              <span>{appointment.clientPhone}</span>
            </div>
          )}
          {/* Location/Meeting Type Display */}
          {/* Backend stores: virtual, office, phone. Frontend sends: video, in-person, phone */}
          {(appointment.locationType || appointment.meetingLink || appointment.location) && (
            <div className="flex items-center gap-3 text-slate-700">
              {['video', 'virtual'].includes(appointment.locationType || '') || appointment.meetingLink ? (
                <Video className="h-5 w-5 text-slate-400" aria-hidden="true" />
              ) : appointment.locationType === 'phone' ? (
                <Phone className="h-5 w-5 text-slate-400" aria-hidden="true" />
              ) : (
                <MapPin className="h-5 w-5 text-slate-400" aria-hidden="true" />
              )}
              <span>
                {['video', 'virtual'].includes(appointment.locationType || '') || appointment.meetingLink
                  ? t('appointments.locationTypes.video', 'اجتماع عن بعد')
                  : appointment.locationType === 'phone'
                    ? t('appointments.locationTypes.phone', 'مكالمة هاتفية')
                    : appointment.location || t('appointments.locationTypes.inPerson', 'حضوري')}
              </span>
            </div>
          )}
          {appointment.notes && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600">{appointment.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {appointment.status === 'pending' && (
            <Button onClick={() => handleAction('confirm')} className="bg-blue-500 hover:bg-blue-600" disabled={confirmMutation.isPending}>
              <Check className="h-4 w-4 ms-2" aria-hidden="true" />
              {t('appointments.actions.confirm', 'تأكيد')}
            </Button>
          )}
          {appointment.status === 'confirmed' && (
            <>
              <Button onClick={() => handleAction('complete')} className="bg-green-500 hover:bg-green-600" disabled={completeMutation.isPending}>
                <CheckCircle className="h-4 w-4 ms-2" />
                {t('appointments.actions.complete', 'إكمال')}
              </Button>
              <Button onClick={() => handleAction('no_show')} variant="outline" disabled={noShowMutation.isPending}>
                <X className="h-4 w-4 ms-2" />
                {t('appointments.actions.noShow', 'لم يحضر')}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => onReschedule(appointment)}>
            <CalendarClock className="h-4 w-4 me-2" aria-hidden="true" />
            {t('appointments.actions.reschedule', 'إعادة جدولة')}
          </Button>
          <Button variant="outline" onClick={() => { onOpenChange(false); onEdit(appointment) }} aria-hidden="true">
            <Settings className="h-4 w-4 me-2" />
            {t('common.edit', 'تعديل')}
          </Button>
          <Button variant="destructive" onClick={() => onDelete(appointment.id)}>
            <Trash2 className="h-4 w-4 ms-2" />
            {t('common.delete', 'حذف')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Book Appointment Dialog ====================

function BookAppointmentDialog({
  open,
  onOpenChange,
  isRtl,
  locale,
  user,
  canManageOtherLawyers,
  teamMembers,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRtl: boolean
  locale: any
  user: any
  canManageOtherLawyers: boolean
  teamMembers: Array<{ _id: string; firstName: string; lastName: string }>
}) {
  const { t } = useTranslation()
  const bookMutation = useBookAppointment()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [targetLawyerId, setTargetLawyerId] = useState<string>('')
  const timeSlotRefs = useRef<(HTMLButtonElement | null)[]>([])
  // Local submission guard - prevents rapid clicks before mutation state updates
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Determine which lawyer to book for (self or selected team member)
  const effectiveLawyerId = targetLawyerId || user?._id || ''

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    duration: 30 as AppointmentDuration,
    type: 'consultation' as AppointmentType,
    locationType: 'video' as LocationType,
    notes: '',
  })

  // Validation helpers (enterprise-grade patterns)
  const isValidEmail = (email: string) => {
    if (!email) return true // Optional field
    // RFC 5322 compliant email validation with proper domain/TLD check
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
    return emailRegex.test(email)
  }

  // Use centralized phone validation - accepts Saudi formats that can be normalized to E.164
  const isValidPhone = (phone: string) => {
    if (!phone) return true // Optional field
    return isValidPhoneLenient(phone.replace(/[\s-]/g, ''))
  }

  const emailError = formData.clientEmail && !isValidEmail(formData.clientEmail)
  const phoneError = formData.clientPhone && !isValidPhone(formData.clientPhone)
  const isFormValid = formData.clientName && !emailError && !phoneError

  // Use backend API to get available slots (checks appointments, blocked times, events)
  const { data: availableSlotsData, isLoading: isSlotsLoading, isError: isSlotsError } = useAvailableSlots(
    {
      lawyerId: effectiveLawyerId,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      duration: formData.duration,
    },
    !!selectedDate && !!effectiveLawyerId
  )

  const rawAvailableSlots = availableSlotsData?.data?.slots || []
  const isWorkingDay = availableSlotsData?.data?.working ?? true
  const workingHours = availableSlotsData?.data?.workingHours

  // Filter out past time slots when today is selected
  const availableSlots = useMemo(() => {
    if (!selectedDate || !isToday(selectedDate)) {
      return rawAvailableSlots
    }

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    return rawAvailableSlots.map(slot => {
      const [slotHour, slotMinute] = slot.start.split(':').map(Number)
      const isPastTime = slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)

      // Mark past times as unavailable
      if (isPastTime && slot.available) {
        return { ...slot, available: false, reason: 'past' }
      }
      return slot
    })
  }, [rawAvailableSlots, selectedDate])

  const calendarDays = useMemo(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    const days: (Date | null)[] = []
    const startDay = start.getDay()
    for (let i = 0; i < startDay; i++) days.push(null)
    for (let d = 1; d <= end.getDate(); d++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d))
    return days
  }, [currentMonth])

  const isPastDate = (date: Date) => isBefore(date, startOfDay(new Date()))

  // Keyboard navigation handlers for time slots
  const handleTimeSlotKeyDown = useCallback(
    (e: React.KeyboardEvent, slotIndex: number, slot: any) => {
      const availableSlotIndices = availableSlots
        .map((s, i) => (s.available ? i : -1))
        .filter((i) => i !== -1)
      const currentIndexInAvailable = availableSlotIndices.indexOf(slotIndex)

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault()
          if (currentIndexInAvailable < availableSlotIndices.length - 1) {
            const nextIndex = availableSlotIndices[currentIndexInAvailable + 1]
            timeSlotRefs.current[nextIndex]?.focus()
          }
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault()
          if (currentIndexInAvailable > 0) {
            const prevIndex = availableSlotIndices[currentIndexInAvailable - 1]
            timeSlotRefs.current[prevIndex]?.focus()
          }
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (slot.available) {
            setSelectedTime(slot.start)
          }
          break
        case 'Home':
          e.preventDefault()
          if (availableSlotIndices.length > 0) {
            timeSlotRefs.current[availableSlotIndices[0]]?.focus()
          }
          break
        case 'End':
          e.preventDefault()
          if (availableSlotIndices.length > 0) {
            const lastIndex = availableSlotIndices[availableSlotIndices.length - 1]
            timeSlotRefs.current[lastIndex]?.focus()
          }
          break
      }
    },
    [availableSlots]
  )

  // Focus first available time slot when slots load
  useEffect(() => {
    if (availableSlots.length > 0 && selectedDate) {
      const firstAvailableIndex = availableSlots.findIndex((s) => s.available)
      if (firstAvailableIndex !== -1) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          timeSlotRefs.current[firstAvailableIndex]?.focus()
        }, 100)
      }
    }
  }, [availableSlots, selectedDate])

  const handleSubmit = async () => {
    // Guard against double-submission (race condition prevention)
    // Using both local state AND mutation state for maximum protection
    if (!selectedDate || !selectedTime) return
    if (isSubmitting) return // Synchronous local guard - immediate block
    if (bookMutation.isPending) return // Mutation state guard - may have slight delay

    // Set local guard IMMEDIATELY to block rapid clicks
    setIsSubmitting(true)

    try {
      // Normalize phone to E.164 format before sending (backend requires 10-15 digit format)
      const normalizedPhone = formData.clientPhone ? toE164Phone(formData.clientPhone) : ''

      await bookMutation.mutateAsync({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: normalizedPhone,
        duration: formData.duration,
        type: formData.type,
        locationType: formData.locationType,
        notes: formData.notes,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        source: 'manual',
        // Always send lawyerId - backend requires it (normalizes to assignedTo)
        lawyerId: effectiveLawyerId,
      })
      toast.success(t('appointments.success.booked', 'تم حجز الموعد بنجاح'))
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      const errorMessage = error?.message || t('appointments.errors.bookFailed', 'فشل في حجز الموعد')
      toast.error(errorMessage)
    } finally {
      // Reset local guard after a cooldown to prevent immediate re-clicks
      setTimeout(() => setIsSubmitting(false), 1500)
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedDate(null)
    setSelectedTime(null)
    setTargetLawyerId('')
    setFormData({ clientName: '', clientEmail: '', clientPhone: '', duration: 30, type: 'consultation', locationType: 'video', notes: '' })
    setIsSubmitting(false) // Reset submission guard
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 1 ? t('appointments.dialogs.book.step1Title', 'اختر التاريخ والوقت') : t('appointments.dialogs.book.step2Title', 'تفاصيل العميل')}
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? t('appointments.dialogs.book.step1Description', 'اختر تاريخ الموعد ثم اختر الوقت المناسب') : t('appointments.dialogs.book.step2Description', 'أدخل بيانات العميل لإتمام الحجز')}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6">
            {/* Skip link for keyboard navigation */}
            <a
              href="#time-selection"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('time-selection')?.focus()
              }}
            >
              {t('appointments.labels.skipToTimeSelection', 'انتقل إلى اختيار الوقت')}
            </a>
            {/* Lawyer Selector - Only show for firm admins */}
            {canManageOtherLawyers && teamMembers.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <Label className="text-sm font-medium text-blue-800">
                  {t('appointments.labels.bookFor', 'حجز موعد لـ')}
                </Label>
                <Select value={targetLawyerId} onValueChange={setTargetLawyerId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={t('appointments.labels.myselfDefault', 'نفسي (الافتراضي)')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('appointments.labels.myself', 'نفسي')}</SelectItem>
                    {teamMembers.filter(m => m._id !== user?._id).map((member) => (
                      <SelectItem key={member._id} value={member._id}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" aria-label={t('appointments.labels.previousMonth', 'الشهر السابق')} onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>
                  {isRtl ? <ChevronRight className="h-5 w-5" aria-hidden="true" /> : <ChevronLeft className="h-5 w-5" aria-hidden="true" />}
                </Button>
                <span className="font-semibold">{format(currentMonth, 'MMMM yyyy', { locale })}</span>
                <Button variant="ghost" size="icon" aria-label={t('appointments.labels.nextMonth', 'الشهر التالي')} onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>
                  {isRtl ? <ChevronLeft className="h-5 w-5" aria-hidden="true" /> : <ChevronRight className="h-5 w-5" aria-hidden="true" />}
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
                {(isRtl ? ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']).map((d) => <div key={d} className="p-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => (
                  <button
                    key={idx}
                    disabled={!day || isPastDate(day)}
                    onClick={() => day && setSelectedDate(day)}
                    className={cn(
                      'p-2 text-sm rounded-lg transition-all',
                      !day && 'invisible',
                      day && isPastDate(day) && 'text-slate-300 cursor-not-allowed',
                      day && !isPastDate(day) && 'hover:bg-emerald-50 hover:text-emerald-600',
                      day && selectedDate && isSameDay(day, selectedDate) && 'bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white',
                      day && isToday(day) && !selectedDate && 'ring-2 ring-emerald-500'
                    )}
                  >
                    {day?.getDate()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">{t('appointments.labels.availableTimes', 'الأوقات المتاحة')}</h4>
              {/* Aria-live region for screen reader announcements */}
              <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                {!selectedDate
                  ? t('appointments.messages.selectDateFirst', 'اختر تاريخاً أولاً')
                  : isSlotsLoading
                    ? t('common.loading', 'جاري التحميل...')
                    : isSlotsError
                      ? t('appointments.errors.loadingTimes', 'حدث خطأ في جلب الأوقات')
                      : !isWorkingDay
                        ? t('appointments.messages.notWorkingDay', 'هذا اليوم ليس يوم عمل')
                        : availableSlots.length === 0
                          ? t('appointments.empty.noAvailableTimes', 'لا توجد أوقات متاحة')
                          : t('appointments.messages.slotsAvailable', { count: availableSlots.filter(s => s.available).length }, `${availableSlots.filter(s => s.available).length} وقت متاح`)
                }
              </div>
              {workingHours && (
                <p className="text-xs text-slate-500">
                  {t('appointments.labels.workingHours', { start: workingHours.start, end: workingHours.end, defaultValue: 'ساعات العمل: {{start}} - {{end}}' })}
                </p>
              )}
              {!selectedDate ? (
                <div className="text-center py-12 text-slate-400">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
                  <p>{t('appointments.messages.selectDateFirst', 'اختر تاريخاً أولاً')}</p>
                </div>
              ) : isSlotsLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden="true" /></div>
              ) : isSlotsError ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" aria-hidden="true" />
                  <p className="font-medium text-sm">{t('appointments.errors.loadingTimes', 'حدث خطأ في جلب الأوقات')}</p>
                  <p className="text-xs mt-1 text-slate-400">
                    {t('appointments.messages.pleaseTryAgain', 'يرجى المحاولة مرة أخرى')}
                  </p>
                </div>
              ) : !isWorkingDay ? (
                <div className="text-center py-8 text-slate-400">
                  <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-50" aria-hidden="true" />
                  <p className="font-medium text-sm">{t('appointments.messages.notWorkingDay', 'هذا اليوم ليس يوم عمل')}</p>
                  <p className="text-xs mt-1 text-slate-400">
                    {t('appointments.messages.selectAnotherDay', 'يرجى اختيار يوم آخر')}
                  </p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" aria-hidden="true" />
                  <p className="font-medium text-sm">{t('appointments.empty.noAvailableTimes', 'لا توجد أوقات متاحة')}</p>
                  <p className="text-xs mt-1 text-slate-400">
                    {t('appointments.messages.allTimesBooked', 'جميع الأوقات محجوزة أو محظورة')}
                  </p>
                </div>
              ) : (
                <div
                  id="time-selection"
                  role="listbox"
                  aria-label={t('appointments.labels.availableTimes', 'الأوقات المتاحة')}
                  tabIndex={-1}
                  className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto focus:outline-none"
                >
                  {availableSlots.map((slot, index) => (
                    <button
                      key={slot.start}
                      ref={(el) => (timeSlotRefs.current[index] = el)}
                      role="option"
                      aria-selected={selectedTime === slot.start}
                      tabIndex={slot.available ? (index === 0 ? 0 : -1) : -1}
                      onClick={() => slot.available && setSelectedTime(slot.start)}
                      onKeyDown={(e) => handleTimeSlotKeyDown(e, index, slot)}
                      disabled={!slot.available}
                      className={cn(
                        'py-3 px-4 rounded-xl text-sm font-medium transition-all border',
                        !slot.available && 'bg-slate-100 text-slate-400 cursor-not-allowed',
                        slot.available && selectedTime !== slot.start && 'bg-white hover:bg-emerald-50 hover:border-emerald-300',
                        selectedTime === slot.start && 'bg-emerald-500 text-white border-emerald-500'
                      )}
                    >
                      {slot.start}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        ) : (
          <div
            className="space-y-4"
            onKeyDown={(e) => {
              // Submit form on Enter key (except in textareas)
              if (e.key === 'Enter' && !e.shiftKey) {
                const target = e.target as HTMLElement
                if (target.tagName !== 'TEXTAREA' && isFormValid && !bookMutation.isPending && !isSubmitting) {
                  e.preventDefault()
                  handleSubmit()
                }
              }
            }}
          >
            <div className="bg-emerald-50 p-4 rounded-xl flex items-center gap-4">
              <CalendarIcon className="h-6 w-6 text-emerald-600" aria-hidden="true" />
              <div>
                <p className="font-semibold text-emerald-900">{selectedDate && format(selectedDate, 'EEEE، d MMMM yyyy', { locale })}</p>
                <p className="text-sm text-emerald-700">{selectedTime}</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div>
                <Label>{t('appointments.labels.clientName', 'اسم العميل')}</Label>
                <Input value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} placeholder={t('appointments.labels.clientNamePlaceholder', 'أدخل اسم العميل')} maxLength={100} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('appointments.labels.email', 'البريد الإلكتروني')}</Label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className={emailError ? 'border-red-500 focus:ring-red-500' : ''}
                    placeholder="example@email.com"
                    maxLength={254}
                    aria-invalid={emailError ? 'true' : 'false'}
                    aria-describedby={emailError ? 'email-error' : undefined}
                  />
                  {emailError && (
                    <p id="email-error" className="text-xs text-red-500 mt-1" role="alert">
                      {t('appointments.errors.invalidEmail', 'البريد الإلكتروني غير صالح')}
                    </p>
                  )}
                </div>
                <div>
                  <Label>{t('appointments.labels.phone', 'رقم الهاتف')}</Label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className={phoneError ? 'border-red-500 focus:ring-red-500' : ''}
                    placeholder="05XXXXXXXX"
                    maxLength={20}
                    aria-invalid={phoneError ? 'true' : 'false'}
                    aria-describedby={phoneError ? 'phone-error' : undefined}
                  />
                  {phoneError && (
                    <p id="phone-error" className="text-xs text-red-500 mt-1" role="alert">
                      {t('appointments.errors.invalidPhone', 'رقم الهاتف غير صالح')}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('appointments.labels.type', 'نوع الموعد')}</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as AppointmentType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {APPOINTMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{isRtl ? t.labelAr : t.labelEn}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('appointments.labels.duration', 'المدة')}</Label>
                  <Select value={String(formData.duration)} onValueChange={(v) => setFormData({ ...formData, duration: Number(v) as AppointmentDuration })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((d) => <SelectItem key={d.value} value={String(d.value)}>{isRtl ? d.labelAr : d.labelEn}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{t('appointments.labels.meetingType', 'طريقة الاجتماع')}</Label>
                <div className="grid grid-cols-3 gap-2 mt-2" role="radiogroup" aria-label={t('appointments.labels.meetingType', 'طريقة الاجتماع')}>
                  {LOCATION_TYPES.map((loc) => (
                    <button
                      key={loc.value}
                      type="button"
                      role="radio"
                      aria-checked={formData.locationType === loc.value}
                      onClick={() => setFormData({ ...formData, locationType: loc.value })}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                        formData.locationType === loc.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      )}
                    >
                      {loc.icon === 'video' && <Video className="h-5 w-5" aria-hidden="true" />}
                      {loc.icon === 'map' && <MapPin className="h-5 w-5" aria-hidden="true" />}
                      {loc.icon === 'phone' && <Phone className="h-5 w-5" aria-hidden="true" />}
                      <span className="text-xs font-medium">{isRtl ? loc.labelAr : loc.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>{t('appointments.labels.notes', 'ملاحظات')}</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} maxLength={2000} />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 2 && <Button variant="outline" onClick={() => setStep(1)}>{t('common.back', 'رجوع')}</Button>}
          {step === 1 ? (
            <Button onClick={() => setStep(2)} disabled={!selectedDate || !selectedTime} className="bg-emerald-500 hover:bg-emerald-600">{t('common.next', 'التالي')}</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={bookMutation.isPending || isSubmitting || !isFormValid} className="bg-emerald-500 hover:bg-emerald-600">
              {(bookMutation.isPending || isSubmitting) && <Loader2 className="h-4 w-4 animate-spin ms-2" aria-hidden="true" />}
              {t('appointments.actions.bookAppointment', 'حجز الموعد')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Block Time Dialog ====================

function BlockTimeDialog({
  open,
  onOpenChange,
  isRtl,
  canManageOtherLawyers,
  teamMembers,
  currentUserId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRtl: boolean
  canManageOtherLawyers: boolean
  teamMembers: Array<{ _id: string; firstName: string; lastName: string }>
  currentUserId?: string
}) {
  const { t } = useTranslation()
  const createBlockedTime = useCreateBlockedTime()
  const [targetLawyerId, setTargetLawyerId] = useState<string>('')
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    reason: '',
    isAllDay: false,
  })

  const handleSubmit = async () => {
    if (!formData.startDate || !formData.endDate) return
    try {
      const startDateTime = formData.isAllDay
        ? `${formData.startDate}T00:00:00`
        : `${formData.startDate}T${formData.startTime}:00`
      const endDateTime = formData.isAllDay
        ? `${formData.endDate}T23:59:59`
        : `${formData.endDate}T${formData.endTime}:00`

      await createBlockedTime.mutateAsync({
        startDateTime,
        endDateTime,
        reason: formData.reason || undefined,
        isAllDay: formData.isAllDay,
        ...(targetLawyerId ? { targetLawyerId } : {}),
      })
      toast.success(t('appointments.success.timeBlocked', 'تم حظر الوقت بنجاح'))
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      const errorMessage = error?.message || t('appointments.errors.blockTimeFailed', 'فشل في حظر الوقت')
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setTargetLawyerId('')
    setFormData({
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '17:00',
      reason: '',
      isAllDay: false,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            {t('appointments.actions.blockTime', 'حظر وقت')}
          </DialogTitle>
          <DialogDescription>
            {t('appointments.dialogs.block.description', 'حدد الفترة التي تريد حظرها')}
          </DialogDescription>
        </DialogHeader>

        <div
          className="space-y-4"
          onKeyDown={(e) => {
            // Submit on Enter except in textarea
            if (e.key === 'Enter' && !e.shiftKey && formData.startDate && formData.endDate && !createBlockedTime.isPending) {
              const target = e.target as HTMLElement
              if (target.tagName !== 'TEXTAREA') {
                e.preventDefault()
                handleSubmit()
              }
            }
          }}
        >
          {/* Lawyer Selector - Only show for firm admins */}
          {canManageOtherLawyers && teamMembers.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <Label className="text-sm font-medium text-blue-800">
                {t('appointments.labels.blockTimeFor', 'حظر وقت لـ')}
              </Label>
              <Select value={targetLawyerId} onValueChange={setTargetLawyerId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={t('appointments.labels.myselfDefault', 'نفسي (الافتراضي)')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('appointments.labels.myself', 'نفسي')}</SelectItem>
                  {teamMembers.filter(m => m._id !== currentUserId).map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="allDay"
              checked={formData.isAllDay}
              onCheckedChange={(checked) => setFormData({ ...formData, isAllDay: checked as boolean })}
            />
            <Label htmlFor="allDay" className="cursor-pointer">
              {t('appointments.labels.allDay', 'طوال اليوم')}
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('appointments.labels.startDate', 'تاريخ البداية')}</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: formData.endDate || e.target.value })}
              />
            </div>
            <div>
              <Label>{t('appointments.labels.endDate', 'تاريخ النهاية')}</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
              />
            </div>
          </div>

          {!formData.isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('appointments.labels.startTime', 'وقت البداية')}</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('appointments.labels.endTime', 'وقت النهاية')}</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <Label>{t('appointments.labels.reasonOptional', 'السبب (اختياري)')}</Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder={t('appointments.labels.reasonPlaceholder', 'مثال: إجازة، اجتماع، تدريب...')}
              rows={2}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', 'إلغاء')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createBlockedTime.isPending || !formData.startDate || !formData.endDate}
            className="bg-red-500 hover:bg-red-600"
          >
            {createBlockedTime.isPending && <Loader2 className="h-4 w-4 animate-spin ms-2" aria-hidden="true" />}
            {t('appointments.actions.blockTime', 'حظر الوقت')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Manage Availability Dialog ====================

// Day names for working hours (keyed by API day names)
const WORKING_DAYS = [
  { key: 'sunday', labelAr: 'الأحد', labelEn: 'Sunday' },
  { key: 'monday', labelAr: 'الإثنين', labelEn: 'Monday' },
  { key: 'tuesday', labelAr: 'الثلاثاء', labelEn: 'Tuesday' },
  { key: 'wednesday', labelAr: 'الأربعاء', labelEn: 'Wednesday' },
  { key: 'thursday', labelAr: 'الخميس', labelEn: 'Thursday' },
  { key: 'friday', labelAr: 'الجمعة', labelEn: 'Friday' },
  { key: 'saturday', labelAr: 'السبت', labelEn: 'Saturday' },
] as const

type DayKey = typeof WORKING_DAYS[number]['key']

interface WorkingHoursDay {
  enabled: boolean
  start: string
  end: string
}

interface WorkingHours {
  sunday: WorkingHoursDay
  monday: WorkingHoursDay
  tuesday: WorkingHoursDay
  wednesday: WorkingHoursDay
  thursday: WorkingHoursDay
  friday: WorkingHoursDay
  saturday: WorkingHoursDay
}

// Default working hours (Sun-Thu, Sat: 9-5, Friday: off)
const DEFAULT_WORKING_HOURS: WorkingHours = {
  sunday: { enabled: true, start: '09:00', end: '17:00' },
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '09:00', end: '17:00' },
  thursday: { enabled: true, start: '09:00', end: '17:00' },
  friday: { enabled: false, start: '09:00', end: '17:00' },
  saturday: { enabled: true, start: '09:00', end: '17:00' },
}

function ManageAvailabilityDialog({
  open,
  onOpenChange,
  isRtl,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRtl: boolean
  canManageOtherLawyers?: boolean
  teamMembers?: Array<{ _id: string; firstName: string; lastName: string }>
  currentUserId?: string
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_WORKING_HOURS)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch current settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['crm-settings'],
    queryFn: async () => {
      const { crmSettingsService } = await import('@/services/crmSettingsService')
      return crmSettingsService.getSettings()
    },
    enabled: open,
  })

  // Update local state when data loads
  useEffect(() => {
    if (settingsData?.appointmentSettings?.workingHours) {
      setWorkingHours(settingsData.appointmentSettings.workingHours as WorkingHours)
      setHasChanges(false)
    }
  }, [settingsData])

  // Handle day toggle
  const handleDayToggle = (day: DayKey, enabled: boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled },
    }))
    setHasChanges(true)
  }

  // Handle time change
  const handleTimeChange = (day: DayKey, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
    setHasChanges(true)
  }

  // Save changes
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { crmSettingsService } = await import('@/services/crmSettingsService')
      await crmSettingsService.updateAllWorkingHours(workingHours)
      toast.success(t('appointments.success.workingHoursSaved', 'تم حفظ أوقات العمل'))
      setHasChanges(false)
      queryClient.invalidateQueries({ queryKey: ['crm-settings'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    } catch (error: any) {
      toast.error(error?.message || t('appointments.errors.saveSettingsFailed', 'فشل في حفظ الإعدادات'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            {t('appointments.dialogs.availability.title', 'إدارة أوقات العمل')}
          </DialogTitle>
          <DialogDescription>
            {t('appointments.dialogs.availability.description', 'حدد أيام وأوقات العمل للمواعيد')}
          </DialogDescription>
        </DialogHeader>

        <div
          className="space-y-4"
          onKeyDown={(e) => {
            // Submit on Ctrl+Enter or Cmd+Enter to save changes
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && hasChanges && !isSaving) {
              e.preventDefault()
              handleSave()
            }
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden="true" />
            </div>
          ) : (
            <div className="space-y-3">
              {WORKING_DAYS.map((day) => {
                const dayHours = workingHours[day.key]
                return (
                  <div
                    key={day.key}
                    className={cn(
                      'p-4 border rounded-xl transition-colors',
                      dayHours.enabled ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      {/* Day name and toggle */}
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={dayHours.enabled}
                          onCheckedChange={(checked) => handleDayToggle(day.key, checked)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                        <span className={cn(
                          'font-medium',
                          dayHours.enabled ? 'text-emerald-800' : 'text-slate-500'
                        )}>
                          {isRtl ? day.labelAr : day.labelEn}
                        </span>
                      </div>

                      {/* Time inputs */}
                      {dayHours.enabled ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={dayHours.start}
                            onChange={(e) => handleTimeChange(day.key, 'start', e.target.value)}
                            className="w-28 text-center bg-white"
                          />
                          <span className="text-slate-400">-</span>
                          <Input
                            type="time"
                            value={dayHours.end}
                            onChange={(e) => handleTimeChange(day.key, 'end', e.target.value)}
                            className="w-28 text-center bg-white"
                          />
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-slate-400">
                          {t('appointments.labels.dayOff', 'يوم إجازة')}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Info box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700">
              {t('appointments.dialogs.availability.infoMessage', 'هذه الإعدادات تحدد أيام وأوقات العمل المتاحة للمواعيد. يمكنك حظر أوقات محددة باستخدام "حظر وقت" في القائمة.')}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close', 'إغلاق')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin me-2" aria-hidden="true" />}
            {t('common.saveChanges', 'حفظ التغييرات')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AppointmentsView

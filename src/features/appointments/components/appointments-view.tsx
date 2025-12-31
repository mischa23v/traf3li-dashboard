/**
 * Appointments View - Weekly Calendar with Sidebar
 * عرض المواعيد - تقويم أسبوعي مع الشريط الجانبي
 */

import { useState, useMemo, useEffect } from 'react'
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
} from '@/hooks/useAppointments'

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
  confirmed: { labelAr: 'مؤكد', labelEn: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-300' },
  completed: { labelAr: 'مكتمل', labelEn: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100 border-green-300' },
  cancelled: { labelAr: 'ملغي', labelEn: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100 border-red-300' },
  no_show: { labelAr: 'لم يحضر', labelEn: 'No Show', color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-300' },
}

const WEEKDAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const WEEKDAYS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const LOCATION_TYPES: { value: LocationType; labelAr: string; labelEn: string; icon: 'video' | 'map' | 'phone' }[] = [
  { value: 'video', labelAr: 'اجتماع عن بعد', labelEn: 'Video Call', icon: 'video' },
  { value: 'in-person', labelAr: 'حضوري', labelEn: 'In Person', icon: 'map' },
  { value: 'phone', labelAr: 'مكالمة هاتفية', labelEn: 'Phone Call', icon: 'phone' },
]

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
  }, [appointments, typeFilter, searchQuery, sortBy])

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

      toast.success(isRtl
        ? `تم حذف ${idsToDelete.length} موعد بنجاح`
        : `Successfully deleted ${idsToDelete.length} appointment(s)`)

      setSelectedAppointments(new Set())
      setAppointmentToDelete(null)
      setShowDeleteConfirm(false)
      refetch()
    } catch (error: any) {
      const errorMessage = error?.message || (isRtl ? 'حدث خطأ أثناء الحذف' : 'Error deleting appointment(s)')
      toast.error(errorMessage)
    }
  }

  // View appointment details
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsDialog(true)
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
      label: isRtl ? 'مواعيد اليوم' : "Today's",
      value: stats?.todayCount || 0,
      icon: CalendarDays,
      status: 'normal' as const,
    },
    {
      label: isRtl ? 'معلقة' : 'Pending',
      value: stats?.pending || 0,
      icon: Clock,
      status: (stats?.pending || 0) > 0 ? 'attention' as const : 'zero' as const,
    },
    {
      label: isRtl ? 'مؤكدة' : 'Confirmed',
      value: stats?.confirmed || 0,
      icon: CheckCircle,
      status: 'normal' as const,
    },
    {
      label: isRtl ? 'هذا الأسبوع' : 'This Week',
      value: stats?.weekCount || 0,
      icon: CalendarClock,
      status: 'normal' as const,
    },
  ], [stats, isRtl])

  const topNav = [
    { title: isRtl ? 'الرئيسية' : 'Overview', href: ROUTES.dashboard.home, isActive: false },
    { title: isRtl ? 'التقويم' : 'Calendar', href: ROUTES.dashboard.calendar, isActive: false },
    { title: isRtl ? 'المواعيد' : 'Appointments', href: ROUTES.dashboard.appointments, isActive: true },
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
            <input type="text" placeholder={isRtl ? 'بحث...' : 'Search...'} className="h-9 w-64 rounded-xl border border-white/10 bg-white/5 pe-9 ps-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
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

      <Main fluid className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8">
        {/* HERO CARD & STATS */}
        <ProductivityHero
          badge={isRtl ? 'إدارة المواعيد' : 'Appointments Management'}
          title={isRtl ? 'المواعيد' : 'Appointments'}
          type="appointments"
          stats={heroStats}
          hideButtons
        >
          <Button
            onClick={() => setShowBookingDialog(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-0 text-sm"
          >
            <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
            {isRtl ? 'موعد جديد' : 'New Appointment'}
          </Button>
          <Button
            onClick={() => setShowBlockDialog(true)}
            variant="outline"
            className="h-10 px-5 rounded-xl font-bold border-white/10 text-white hover:bg-white/10 hover:text-white bg-transparent text-sm"
          >
            <Ban className="ms-2 h-4 w-4" />
            {isRtl ? 'حظر وقت' : 'Block Time'}
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
                    placeholder={isRtl ? 'بحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pe-12 h-14 w-full text-base"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex-1 min-w-[150px]">
                  <GosiSelect value={statusFilter} onValueChange={setStatusFilter}>
                    <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{isRtl ? 'الحالة' : 'Status'}:</span>
                        <GosiSelectValue />
                      </div>
                    </GosiSelectTrigger>
                    <GosiSelectContent>
                      <GosiSelectItem value="all">{isRtl ? 'الكل' : 'All'}</GosiSelectItem>
                      <GosiSelectItem value="pending">{isRtl ? 'معلق' : 'Pending'}</GosiSelectItem>
                      <GosiSelectItem value="confirmed">{isRtl ? 'مؤكد' : 'Confirmed'}</GosiSelectItem>
                      <GosiSelectItem value="completed">{isRtl ? 'مكتمل' : 'Completed'}</GosiSelectItem>
                      <GosiSelectItem value="cancelled">{isRtl ? 'ملغي' : 'Cancelled'}</GosiSelectItem>
                    </GosiSelectContent>
                  </GosiSelect>
                </div>

                {/* Type Filter */}
                <div className="flex-1 min-w-[150px]">
                  <GosiSelect value={typeFilter} onValueChange={setTypeFilter}>
                    <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{isRtl ? 'النوع' : 'Type'}:</span>
                        <GosiSelectValue />
                      </div>
                    </GosiSelectTrigger>
                    <GosiSelectContent>
                      <GosiSelectItem value="all">{isRtl ? 'الكل' : 'All'}</GosiSelectItem>
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
                          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">{isRtl ? 'المحامي' : 'Lawyer'}:</span>
                          <GosiSelectValue />
                        </div>
                      </GosiSelectTrigger>
                      <GosiSelectContent>
                        <GosiSelectItem value="all">{isRtl ? 'الكل' : 'All'}</GosiSelectItem>
                        <GosiSelectItem value={user?._id || ''}>{isRtl ? 'أنا' : 'Me'}</GosiSelectItem>
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
                    {isRtl ? 'مسح الفلاتر' : 'Clear Filters'}
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
                }}>
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
                  <Button variant="ghost" size="icon" onClick={goToPreviousWeek} className="h-10 w-10 rounded-xl hover:bg-slate-100">
                    {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={goToToday}
                    className="h-10 px-4 rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-sm font-medium"
                  >
                    {isRtl ? 'العودة لليوم' : 'Today'}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-10 w-10 rounded-xl hover:bg-slate-100">
                    {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </Button>
                </div>

                {/* Right: View Toggle & Bulk Actions */}
                <div className="flex items-center gap-3">
                  {selectedAppointments.size > 0 && (
                    <div className="flex items-center gap-2 pe-3 border-e border-slate-200">
                      <span className="text-sm text-slate-600">
                        {isRtl ? `${selectedAppointments.size} محدد` : `${selectedAppointments.size} selected`}
                      </span>
                      <Button variant="ghost" size="sm" onClick={clearSelection} className="h-8 text-slate-500">
                        {isRtl ? 'إلغاء' : 'Clear'}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="h-8 bg-red-500 hover:bg-red-600">
                        <Trash2 className="h-4 w-4 ms-1" />
                        {isRtl ? 'حذف' : 'Delete'}
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
                      <LayoutGrid className="h-4 w-4 ms-1" />
                      {isRtl ? 'أسبوعي' : 'Week'}
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={cn('h-8 px-3 rounded-lg', viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200')}
                    >
                      <List className="h-4 w-4 ms-1" />
                      {isRtl ? 'قائمة' : 'List'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white rounded-2xl p-8">
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
              <div className="bg-red-50 rounded-2xl p-12 text-center border border-red-100">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{isRtl ? 'خطأ في التحميل' : 'Loading Error'}</h3>
                <p className="text-slate-500 mb-4">{error?.message}</p>
                <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                  {isRtl ? 'إعادة المحاولة' : 'Retry'}
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
                          <Badge variant="secondary" className="text-xs bg-slate-100 mt-1">{dayAppointments.length}</Badge>
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
                            const statusConfig = STATUS_CONFIG[apt.status]
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
                                  <Checkbox checked={isSelected} />
                                </div>

                                <div className="text-sm font-bold text-slate-900 mb-1">{apt.startTime || '00:00'}</div>
                                <div className="text-xs font-medium text-slate-700 truncate">{apt.clientName || (isRtl ? 'بدون اسم' : 'No name')}</div>
                                <div className="mt-2">
                                  <span className={cn('inline-block px-2 py-0.5 rounded-full text-[10px] font-medium text-white', typeConfig?.color || 'bg-gray-500')}>
                                    {isRtl ? typeConfig?.labelAr : typeConfig?.labelEn}
                                  </span>
                                </div>

                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteSingle(apt.id) }}
                                  className="absolute bottom-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-100 text-red-500"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )
                          })}

                          {dayAppointments.length === 0 && (
                            <div className="text-center py-8 text-slate-300">
                              <CalendarIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                              <span className="text-xs">{isRtl ? 'لا مواعيد' : 'No appts'}</span>
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
                    <CalendarClock className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{isRtl ? 'لا توجد مواعيد' : 'No Appointments'}</h3>
                    <p className="text-slate-500 mb-4">{isRtl ? 'لا توجد مواعيد حالياً' : 'No appointments scheduled'}</p>
                    <Button onClick={() => setShowBookingDialog(true)} className="bg-emerald-500 hover:bg-emerald-600">
                      <Plus className="w-4 h-4 ms-2" />
                      {isRtl ? 'موعد جديد' : 'New Appointment'}
                    </Button>
                  </div>
                ) : (
                  filteredAppointments.map((apt) => {
                    const typeConfig = APPOINTMENT_TYPES.find((t) => t.value === apt.type)
                    const statusConfig = STATUS_CONFIG[apt.status]
                    const isSelected = selectedAppointments.has(apt.id)

                    return (
                      <div
                        key={apt.id}
                        className={cn('bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group', isSelected && 'ring-2 ring-emerald-500')}
                        onClick={() => handleViewDetails(apt)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="pt-1" onClick={(e) => { e.stopPropagation(); toggleSelectAppointment(apt.id) }}>
                            <Checkbox checked={isSelected} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={cn('px-2 py-1 rounded-lg text-xs font-medium', statusConfig.bgColor, statusConfig.color)}>
                                {isRtl ? statusConfig.labelAr : statusConfig.labelEn}
                              </span>
                              <span className={cn('px-2 py-1 rounded-lg text-xs font-medium text-white', typeConfig?.color || 'bg-gray-500')}>
                                {isRtl ? typeConfig?.labelAr : typeConfig?.labelEn}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">{apt.clientName || (isRtl ? 'بدون اسم' : 'No name')}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" />{apt.date ? format(new Date(apt.date), 'MMM d, yyyy', { locale }) : '-'}</span>
                              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{apt.startTime || '00:00'}</span>
                              {apt.clientPhone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{apt.clientPhone}</span>}
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteSingle(apt.id) }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-red-50 text-red-500"
                          >
                            <Trash2 className="h-5 w-5" />
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
              <h3 className="font-bold text-slate-900 mb-4">{isRtl ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowBookingDialog(true)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                >
                  <Plus className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-slate-700">{isRtl ? 'موعد جديد' : 'New Appointment'}</span>
                </button>
                <button
                  onClick={() => setShowBlockDialog(true)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-red-200 hover:border-red-400 hover:bg-red-50 transition-all group"
                >
                  <Ban className="h-6 w-6 text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-slate-700">{isRtl ? 'حظر وقت' : 'Block Time'}</span>
                </button>
              </div>
              <button
                onClick={() => setShowAvailabilityDialog(true)}
                className="w-full mt-3 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all group"
              >
                <Settings className="h-5 w-5 text-slate-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700">{isRtl ? 'إدارة أوقات العمل' : 'Manage Availability'}</span>
              </button>
            </div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">{isRtl ? 'مواعيد اليوم' : "Today's Appointments"}</h3>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                  {format(new Date(), 'd MMM')}
                </Badge>
              </div>
              <div className="space-y-3">
                {appointments.filter(apt => apt.date && isToday(new Date(apt.date))).length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    {isRtl ? 'لا توجد مواعيد اليوم' : 'No appointments today'}
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
        onOpenChange={setShowDetailsDialog}
        isRtl={isRtl}
        locale={locale}
        onDelete={(id) => {
          setShowDetailsDialog(false)
          handleDeleteSingle(id)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isRtl ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle>
            <DialogDescription>
              {appointmentToDelete
                ? (isRtl ? 'هل أنت متأكد من حذف هذا الموعد؟' : 'Are you sure you want to delete this appointment?')
                : (isRtl ? `هل أنت متأكد من حذف ${selectedAppointments.size} موعد؟` : `Are you sure you want to delete ${selectedAppointments.size} appointment(s)?`)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>{isRtl ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : <Trash2 className="h-4 w-4 ms-2" />}
              {isRtl ? 'حذف' : 'Delete'}
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
}: {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isRtl: boolean
  locale: any
  onDelete: (id: string) => void
}) {
  const confirmMutation = useConfirmAppointment()
  const completeMutation = useCompleteAppointment()
  const noShowMutation = useMarkNoShow()

  if (!appointment) return null

  const typeConfig = APPOINTMENT_TYPES.find((t) => t.value === appointment.type)
  const statusConfig = STATUS_CONFIG[appointment.status]

  const handleAction = async (action: string) => {
    try {
      switch (action) {
        case 'confirm':
          await confirmMutation.mutateAsync(appointment.id)
          toast.success(isRtl ? 'تم تأكيد الموعد' : 'Appointment confirmed')
          break
        case 'complete':
          await completeMutation.mutateAsync({ id: appointment.id })
          toast.success(isRtl ? 'تم إكمال الموعد' : 'Appointment completed')
          break
        case 'no_show':
          await noShowMutation.mutateAsync(appointment.id)
          toast.success(isRtl ? 'تم تسجيل عدم الحضور' : 'Marked as no-show')
          break
      }
      onOpenChange(false)
    } catch (error: any) {
      const errorMessage = error?.message || (isRtl ? 'حدث خطأ' : 'An error occurred')
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn('p-2 rounded-xl', typeConfig?.color || 'bg-gray-500')}>
              <User className="h-5 w-5 text-white" />
            </div>
            {appointment.clientName || (isRtl ? 'بدون اسم' : 'No name')}
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
            <CalendarIcon className="h-5 w-5 text-slate-400" />
            <span>{appointment.date ? format(new Date(appointment.date), 'EEEE، d MMMM yyyy', { locale }) : '-'}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Clock className="h-5 w-5 text-slate-400" />
            <span>{appointment.startTime || '00:00'} - {appointment.endTime || '--:--'}</span>
          </div>
          {appointment.clientEmail && (
            <div className="flex items-center gap-3 text-slate-700">
              <Mail className="h-5 w-5 text-slate-400" />
              <span>{appointment.clientEmail}</span>
            </div>
          )}
          {appointment.clientPhone && (
            <div className="flex items-center gap-3 text-slate-700">
              <Phone className="h-5 w-5 text-slate-400" />
              <span>{appointment.clientPhone}</span>
            </div>
          )}
          {appointment.location && (
            <div className="flex items-center gap-3 text-slate-700">
              {appointment.location.type === 'video' ? <Video className="h-5 w-5 text-slate-400" /> : <MapPin className="h-5 w-5 text-slate-400" />}
              <span>{appointment.location.type === 'video' ? (isRtl ? 'اجتماع عن بعد' : 'Video Call') : appointment.location.address}</span>
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
              <Check className="h-4 w-4 ms-2" />
              {isRtl ? 'تأكيد' : 'Confirm'}
            </Button>
          )}
          {appointment.status === 'confirmed' && (
            <>
              <Button onClick={() => handleAction('complete')} className="bg-green-500 hover:bg-green-600" disabled={completeMutation.isPending}>
                <CheckCircle className="h-4 w-4 ms-2" />
                {isRtl ? 'إكمال' : 'Complete'}
              </Button>
              <Button onClick={() => handleAction('no_show')} variant="outline" disabled={noShowMutation.isPending}>
                <X className="h-4 w-4 ms-2" />
                {isRtl ? 'لم يحضر' : 'No Show'}
              </Button>
            </>
          )}
          <Button variant="destructive" onClick={() => onDelete(appointment.id)}>
            <Trash2 className="h-4 w-4 ms-2" />
            {isRtl ? 'حذف' : 'Delete'}
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
  const bookMutation = useBookAppointment()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [targetLawyerId, setTargetLawyerId] = useState<string>('')

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

  // Validation helpers
  const isValidEmail = (email: string) => {
    if (!email) return true // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidPhone = (phone: string) => {
    if (!phone) return true // Optional field
    // Saudi phone: +966, 05, or 5 followed by 8 digits
    const phoneRegex = /^(\+966|966|05|5)?[0-9]{8,9}$/
    return phoneRegex.test(phone.replace(/[\s-]/g, ''))
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

  const availableSlots = availableSlotsData?.data?.slots || []
  const isWorkingDay = availableSlotsData?.data?.working ?? true
  const workingHours = availableSlotsData?.data?.workingHours

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

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return
    try {
      await bookMutation.mutateAsync({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        duration: formData.duration,
        type: formData.type,
        locationType: formData.locationType,
        notes: formData.notes,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        source: 'manual',
        // Include assignedTo only if booking for another lawyer
        ...(targetLawyerId ? { assignedTo: targetLawyerId } : {}),
      })
      toast.success(isRtl ? 'تم حجز الموعد بنجاح' : 'Appointment booked successfully')
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      const errorMessage = error?.message || (isRtl ? 'فشل في حجز الموعد' : 'Failed to book appointment')
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setStep(1)
    setSelectedDate(null)
    setSelectedTime(null)
    setTargetLawyerId('')
    setFormData({ clientName: '', clientEmail: '', clientPhone: '', duration: 30, type: 'consultation', locationType: 'video', notes: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 1 ? (isRtl ? 'اختر التاريخ والوقت' : 'Select Date & Time') : (isRtl ? 'تفاصيل العميل' : 'Client Details')}
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? (isRtl ? 'اختر تاريخ الموعد ثم اختر الوقت المناسب' : 'Choose the appointment date and then select a time slot') : (isRtl ? 'أدخل بيانات العميل لإتمام الحجز' : 'Enter client details to complete the booking')}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6">
            {/* Lawyer Selector - Only show for firm admins */}
            {canManageOtherLawyers && teamMembers.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <Label className="text-sm font-medium text-blue-800">
                  {isRtl ? 'حجز موعد لـ' : 'Book appointment for'}
                </Label>
                <Select value={targetLawyerId} onValueChange={setTargetLawyerId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={isRtl ? 'نفسي (الافتراضي)' : 'Myself (default)'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{isRtl ? 'نفسي' : 'Myself'}</SelectItem>
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
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>
                  {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
                <span className="font-semibold">{format(currentMonth, 'MMMM yyyy', { locale })}</span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>
                  {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
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
              <h4 className="font-semibold">{isRtl ? 'الأوقات المتاحة' : 'Available Times'}</h4>
              {workingHours && (
                <p className="text-xs text-slate-500">
                  {isRtl ? `ساعات العمل: ${workingHours.start} - ${workingHours.end}` : `Working hours: ${workingHours.start} - ${workingHours.end}`}
                </p>
              )}
              {!selectedDate ? (
                <div className="text-center py-12 text-slate-400">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isRtl ? 'اختر تاريخاً أولاً' : 'Select a date first'}</p>
                </div>
              ) : isSlotsLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
              ) : isSlotsError ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium text-sm">{isRtl ? 'حدث خطأ في جلب الأوقات' : 'Error loading times'}</p>
                  <p className="text-xs mt-1 text-slate-400">
                    {isRtl ? 'يرجى المحاولة مرة أخرى' : 'Please try again'}
                  </p>
                </div>
              ) : !isWorkingDay ? (
                <div className="text-center py-8 text-slate-400">
                  <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium text-sm">{isRtl ? 'هذا اليوم ليس يوم عمل' : 'This is not a working day'}</p>
                  <p className="text-xs mt-1 text-slate-400">
                    {isRtl ? 'يرجى اختيار يوم آخر' : 'Please select another day'}
                  </p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium text-sm">{isRtl ? 'لا توجد أوقات متاحة' : 'No available times'}</p>
                  <p className="text-xs mt-1 text-slate-400">
                    {isRtl ? 'جميع الأوقات محجوزة أو محظورة' : 'All times are booked or blocked'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => setSelectedTime(slot.start)}
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
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-xl flex items-center gap-4">
              <CalendarIcon className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-900">{selectedDate && format(selectedDate, 'EEEE، d MMMM yyyy', { locale })}</p>
                <p className="text-sm text-emerald-700">{selectedTime}</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div>
                <Label>{isRtl ? 'اسم العميل' : 'Client Name'}</Label>
                <Input value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} placeholder={isRtl ? 'أدخل اسم العميل' : 'Enter client name'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRtl ? 'البريد الإلكتروني' : 'Email'}</Label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className={emailError ? 'border-red-500 focus:ring-red-500' : ''}
                    placeholder={isRtl ? 'example@email.com' : 'example@email.com'}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 mt-1">
                      {isRtl ? 'البريد الإلكتروني غير صالح' : 'Invalid email format'}
                    </p>
                  )}
                </div>
                <div>
                  <Label>{isRtl ? 'رقم الهاتف' : 'Phone'}</Label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className={phoneError ? 'border-red-500 focus:ring-red-500' : ''}
                    placeholder={isRtl ? '05XXXXXXXX' : '05XXXXXXXX'}
                  />
                  {phoneError && (
                    <p className="text-xs text-red-500 mt-1">
                      {isRtl ? 'رقم الهاتف غير صالح' : 'Invalid phone number'}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRtl ? 'نوع الموعد' : 'Type'}</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as AppointmentType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {APPOINTMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{isRtl ? t.labelAr : t.labelEn}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRtl ? 'المدة' : 'Duration'}</Label>
                  <Select value={String(formData.duration)} onValueChange={(v) => setFormData({ ...formData, duration: Number(v) as AppointmentDuration })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((d) => <SelectItem key={d.value} value={String(d.value)}>{isRtl ? d.labelAr : d.labelEn}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{isRtl ? 'طريقة الاجتماع' : 'Meeting Type'}</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {LOCATION_TYPES.map((loc) => (
                    <button
                      key={loc.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, locationType: loc.value })}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                        formData.locationType === loc.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      )}
                    >
                      {loc.icon === 'video' && <Video className="h-5 w-5" />}
                      {loc.icon === 'map' && <MapPin className="h-5 w-5" />}
                      {loc.icon === 'phone' && <Phone className="h-5 w-5" />}
                      <span className="text-xs font-medium">{isRtl ? loc.labelAr : loc.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>{isRtl ? 'ملاحظات' : 'Notes'}</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 2 && <Button variant="outline" onClick={() => setStep(1)}>{isRtl ? 'رجوع' : 'Back'}</Button>}
          {step === 1 ? (
            <Button onClick={() => setStep(2)} disabled={!selectedDate || !selectedTime} className="bg-emerald-500 hover:bg-emerald-600">{isRtl ? 'التالي' : 'Next'}</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={bookMutation.isPending || !isFormValid} className="bg-emerald-500 hover:bg-emerald-600">
              {bookMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ms-2" />}
              {isRtl ? 'حجز الموعد' : 'Book Appointment'}
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
      toast.success(isRtl ? 'تم حظر الوقت بنجاح' : 'Time blocked successfully')
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      const errorMessage = error?.message || (isRtl ? 'فشل في حظر الوقت' : 'Failed to block time')
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
            {isRtl ? 'حظر وقت' : 'Block Time'}
          </DialogTitle>
          <DialogDescription>
            {isRtl ? 'حدد الفترة التي تريد حظرها' : 'Specify the time period to block'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lawyer Selector - Only show for firm admins */}
          {canManageOtherLawyers && teamMembers.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <Label className="text-sm font-medium text-blue-800">
                {isRtl ? 'حظر وقت لـ' : 'Block time for'}
              </Label>
              <Select value={targetLawyerId} onValueChange={setTargetLawyerId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={isRtl ? 'نفسي (الافتراضي)' : 'Myself (default)'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{isRtl ? 'نفسي' : 'Myself'}</SelectItem>
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
              {isRtl ? 'طوال اليوم' : 'All day'}
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{isRtl ? 'تاريخ البداية' : 'Start Date'}</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: formData.endDate || e.target.value })}
              />
            </div>
            <div>
              <Label>{isRtl ? 'تاريخ النهاية' : 'End Date'}</Label>
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
                <Label>{isRtl ? 'وقت البداية' : 'Start Time'}</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label>{isRtl ? 'وقت النهاية' : 'End Time'}</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <Label>{isRtl ? 'السبب (اختياري)' : 'Reason (optional)'}</Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder={isRtl ? 'مثال: إجازة، اجتماع، تدريب...' : 'e.g., Vacation, Meeting, Training...'}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createBlockedTime.isPending || !formData.startDate || !formData.endDate}
            className="bg-red-500 hover:bg-red-600"
          >
            {createBlockedTime.isPending && <Loader2 className="h-4 w-4 animate-spin ms-2" />}
            {isRtl ? 'حظر الوقت' : 'Block Time'}
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
      toast.success(isRtl ? 'تم حفظ أوقات العمل' : 'Working hours saved')
      setHasChanges(false)
      queryClient.invalidateQueries({ queryKey: ['crm-settings'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    } catch (error: any) {
      toast.error(error?.message || (isRtl ? 'فشل في حفظ الإعدادات' : 'Failed to save settings'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-500" />
            {isRtl ? 'إدارة أوقات العمل' : 'Manage Working Hours'}
          </DialogTitle>
          <DialogDescription>
            {isRtl ? 'حدد أيام وأوقات العمل للمواعيد' : 'Set your working days and hours for appointments'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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
                          {isRtl ? 'يوم إجازة' : 'Day Off'}
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
              {isRtl
                ? 'هذه الإعدادات تحدد أيام وأوقات العمل المتاحة للمواعيد. يمكنك حظر أوقات محددة باستخدام "حظر وقت" في القائمة.'
                : 'These settings define your available days and hours for appointments. You can block specific times using "Block Time" from the menu.'}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isRtl ? 'إغلاق' : 'Close'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
            {isRtl ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AppointmentsView

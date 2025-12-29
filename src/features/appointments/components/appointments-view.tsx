/**
 * Appointments View
 * Redesigned appointments management page matching the reminders page design
 *
 * عرض المواعيد
 * صفحة إدارة المواعيد المعاد تصميمها بنفس تصميم صفحة التذكيرات
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO, isToday, isBefore, startOfDay, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
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
  MoreHorizontal,
  Loader2,
  AlertCircle,
  CalendarDays,
  CalendarClock,
  Ban,
  CheckCircle,
  XCircle,
  UserX,
  Trash2,
  Search,
  Bell,
  SortAsc,
  ArrowRight,
  Video,
  MapPin,
  Eye,
  Settings,
  Filter,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { Switch } from '@/components/ui/switch'
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
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

import {
  useAvailability,
  useCreateAvailability,
  useDeleteAvailability,
  useBlockedTimes,
  useCreateBlockedTime,
  useDeleteBlockedTime,
  useAppointments,
  useBookAppointment,
  useConfirmAppointment,
  useCancelAppointment,
  useCompleteAppointment,
  useMarkNoShow,
  useAppointmentStats,
  useAvailableSlots,
} from '@/hooks/useAppointments'

import type {
  Appointment,
  AppointmentType,
  AppointmentStatus,
  DayOfWeek,
  AppointmentDuration,
} from '@/services/appointmentsService'

// ==================== Constants ====================

const DAYS_OF_WEEK: { value: DayOfWeek; labelAr: string; labelEn: string }[] = [
  { value: 0, labelAr: 'الأحد', labelEn: 'Sunday' },
  { value: 1, labelAr: 'الإثنين', labelEn: 'Monday' },
  { value: 2, labelAr: 'الثلاثاء', labelEn: 'Tuesday' },
  { value: 3, labelAr: 'الأربعاء', labelEn: 'Wednesday' },
  { value: 4, labelAr: 'الخميس', labelEn: 'Thursday' },
  { value: 5, labelAr: 'الجمعة', labelEn: 'Friday' },
  { value: 6, labelAr: 'السبت', labelEn: 'Saturday' },
]

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = i % 2 === 0 ? '00' : '30'
  return `${hours.toString().padStart(2, '0')}:${minutes}`
})

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

const STATUS_CONFIG: Record<AppointmentStatus, { labelAr: string; labelEn: string; color: string; bgColor: string; icon: any }> = {
  pending: { labelAr: 'معلق', labelEn: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200', icon: Clock },
  confirmed: { labelAr: 'مؤكد', labelEn: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: CheckCircle },
  completed: { labelAr: 'مكتمل', labelEn: 'Completed', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: Check },
  cancelled: { labelAr: 'ملغي', labelEn: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', icon: XCircle },
  no_show: { labelAr: 'لم يحضر', labelEn: 'No Show', color: 'text-gray-700', bgColor: 'bg-gray-50 border-gray-200', icon: UserX },
}

// ==================== Main Component ====================

export function AppointmentsView() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRtl = i18n.language === 'ar'
  const locale = isRtl ? ar : enUS

  // Get current user from auth store
  const user = useAuthStore((state) => state.user)

  // State
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('date')
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false)

  // Fetch data
  const { data: statsData, isLoading: isStatsLoading } = useAppointmentStats()
  const { data: appointmentsData, isLoading: isAppointmentsLoading, isError, error, refetch } = useAppointments({
    status: statusFilter !== 'all' ? statusFilter as AppointmentStatus : undefined,
  })

  const stats = statsData?.data
  const appointments = appointmentsData?.data?.appointments || []

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    let result = [...appointments]

    // Filter by type
    if (typeFilter !== 'all') {
      result = result.filter(apt => apt.type === typeFilter)
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
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status)
      }
      return 0
    })

    return result
  }, [appointments, typeFilter, searchQuery, sortBy])

  // Check if any filter is active
  const hasActiveFilters = useMemo(() =>
    searchQuery || statusFilter !== 'all' || typeFilter !== 'all',
    [searchQuery, statusFilter, typeFilter]
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setTypeFilter('all')
  }, [])

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

  return (
    <>
      <Header className="bg-navy shadow-none relative">
        <TopNav links={topNav} className="[&>a]:text-slate-300 [&>a:hover]:text-white [&>a[aria-current='page']]:text-white" />

        {/* Dynamic Island - Centered */}
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
        {/* Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </Header>

      <Main fluid={true} className="bg-[#f8f9fa] flex-1 w-full p-6 lg:p-8 space-y-8 rounded-tr-3xl shadow-inner border-e border-white/5 overflow-hidden font-['IBM_Plex_Sans_Arabic']">

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

          {/* RIGHT COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-6">

            {/* FILTERS BAR */}
            <GosiCard className="p-4 md:p-6 rounded-[2rem]">
              <div className="flex flex-wrap items-center gap-3 transition-all duration-300 ease-in-out">
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
                    <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all">
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
                    <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all">
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

                {/* Sort By */}
                <div className="flex-[0.5] min-w-[140px]">
                  <GosiSelect value={sortBy} onValueChange={setSortBy}>
                    <GosiSelectTrigger className="w-full h-14 bg-white border-slate-100 hover:bg-slate-50 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all">
                      <div className="flex items-center gap-2 truncate">
                        <SortAsc className="h-4 w-4 text-emerald-500" />
                        <GosiSelectValue />
                      </div>
                    </GosiSelectTrigger>
                    <GosiSelectContent>
                      <GosiSelectItem value="date">{isRtl ? 'التاريخ' : 'Date'}</GosiSelectItem>
                      <GosiSelectItem value="status">{isRtl ? 'الحالة' : 'Status'}</GosiSelectItem>
                    </GosiSelectContent>
                  </GosiSelect>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <GosiButton
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-14 w-full md:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-dashed border-red-200 px-6 hover:shadow-lg hover:shadow-red-500/10 transition-all"
                  >
                    <X className="h-5 w-5 ms-2" aria-hidden="true" />
                    {isRtl ? 'مسح الفلاتر' : 'Clear Filters'}
                  </GosiButton>
                )}
              </div>
            </GosiCard>

            {/* APPOINTMENTS LIST */}
            <div className="flex flex-col gap-4">
              {/* Loading State */}
              {isAppointmentsLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-[2rem] bg-slate-100" />
                  ))}
                </div>
              )}

              {/* Error State */}
              {isError && (
                <div className="bg-red-50 rounded-[2rem] p-12 text-center border border-red-100">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{isRtl ? 'خطأ في التحميل' : 'Loading Error'}</h3>
                  <p className="text-slate-500 mb-4">{error?.message || (isRtl ? 'تعذر تحميل المواعيد' : 'Failed to load appointments')}</p>
                  <Button onClick={() => refetch()} className="bg-emerald-500 hover:bg-emerald-600">
                    {isRtl ? 'إعادة المحاولة' : 'Retry'}
                  </Button>
                </div>
              )}

              {/* Empty State */}
              {!isAppointmentsLoading && !isError && filteredAppointments.length === 0 && (
                <div className="bg-white rounded-[2rem] p-12 border border-slate-100 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                      <CalendarClock className="w-8 h-8 text-emerald-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{isRtl ? 'لا توجد مواعيد' : 'No Appointments'}</h3>
                  <p className="text-slate-500 mb-4">{isRtl ? 'لا توجد مواعيد حالياً. أضف موعداً جديداً!' : 'No appointments yet. Add a new one!'}</p>
                  <GosiButton onClick={() => setShowBookingDialog(true)} className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="w-4 h-4 ms-2" aria-hidden="true" />
                    {isRtl ? 'موعد جديد' : 'New Appointment'}
                  </GosiButton>
                </div>
              )}

              {/* Appointments Cards */}
              {!isAppointmentsLoading && !isError && filteredAppointments.map((appointment, index) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  isRtl={isRtl}
                  locale={locale}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* LEFT COLUMN (Sidebar) */}
          <AppointmentsSidebar
            isRtl={isRtl}
            onNewAppointment={() => setShowBookingDialog(true)}
            onBlockTime={() => setShowBlockDialog(true)}
            onManageAvailability={() => setShowAvailabilityDialog(true)}
          />
        </div>
      </Main>

      {/* Dialogs */}
      <BookAppointmentDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        isRtl={isRtl}
        locale={locale}
      />

      <BlockTimeDialog
        open={showBlockDialog}
        onOpenChange={setShowBlockDialog}
        isRtl={isRtl}
      />

      <ManageAvailabilityDialog
        open={showAvailabilityDialog}
        onOpenChange={setShowAvailabilityDialog}
        isRtl={isRtl}
      />
    </>
  )
}

// ==================== Appointment Card ====================

function AppointmentCard({
  appointment,
  isRtl,
  locale,
  index,
}: {
  appointment: Appointment
  isRtl: boolean
  locale: any
  index: number
}) {
  const statusConfig = STATUS_CONFIG[appointment.status]
  const typeConfig = APPOINTMENT_TYPES.find((t) => t.value === appointment.type)
  const StatusIcon = statusConfig.icon

  const confirmMutation = useConfirmAppointment()
  const cancelMutation = useCancelAppointment()
  const completeMutation = useCompleteAppointment()
  const noShowMutation = useMarkNoShow()

  const handleAction = async (action: string) => {
    try {
      switch (action) {
        case 'confirm':
          await confirmMutation.mutateAsync(appointment.id)
          toast.success(isRtl ? 'تم تأكيد الموعد' : 'Appointment confirmed')
          break
        case 'cancel':
          await cancelMutation.mutateAsync({ id: appointment.id })
          toast.success(isRtl ? 'تم إلغاء الموعد' : 'Appointment cancelled')
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
    } catch (error) {
      toast.error(isRtl ? 'حدث خطأ' : 'An error occurred')
    }
  }

  const appointmentDate = appointment.date ? new Date(appointment.date) : null
  const formattedDate = appointmentDate
    ? format(appointmentDate, 'EEEE، d MMMM yyyy', { locale })
    : ''

  return (
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      className={`
        animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards
        bg-white rounded-[2rem] p-5 md:p-7
        border-0 ring-1 ring-black/[0.03] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]
        transition-all duration-300 group
        hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1),0_8px_24px_-8px_rgba(0,0,0,0.04)] hover:-translate-y-1.5
        relative overflow-hidden flex flex-col
      `}
    >
      {/* Status Strip Indicator */}
      <div className={cn(
        'absolute start-0 top-0 bottom-0 w-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        appointment.status === 'pending' ? 'bg-yellow-500' :
          appointment.status === 'confirmed' ? 'bg-blue-500' :
            appointment.status === 'completed' ? 'bg-green-500' :
              appointment.status === 'cancelled' ? 'bg-red-500' :
                'bg-gray-500'
      )} />

      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 ps-2">
        {/* LEFT SIDE: Icon + Info */}
        <div className="flex gap-5 items-start w-full md:w-auto">
          {/* Clean Icon Box */}
          <div className={cn(
            'w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] flex items-center justify-center shadow-inner flex-shrink-0 border transition-all duration-300',
            statusConfig.bgColor,
            'group-hover:scale-105'
          )}>
            <StatusIcon className={cn('h-7 w-7 md:h-8 md:w-8', statusConfig.color)} strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h4 className="font-bold text-slate-800 text-lg md:text-xl group-hover:text-emerald-800 transition-colors truncate leading-tight tracking-tight">
                {appointment.clientName}
              </h4>
              <Badge className={cn('text-[11px] font-bold px-3 py-1', statusConfig.bgColor, statusConfig.color)}>
                {isRtl ? statusConfig.labelAr : statusConfig.labelEn}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs mt-2">
              {appointment.clientPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {appointment.clientPhone}
                </span>
              )}
              {appointment.clientEmail && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {appointment.clientEmail}
                </span>
              )}
              {typeConfig && (
                <Badge variant="outline" className="text-[10px]">
                  {isRtl ? typeConfig.labelAr : typeConfig.labelEn}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Action Menu */}
        <div className="absolute end-4 top-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-navy hover:bg-slate-100 rounded-xl">
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? 'start' : 'end'} className="w-48 rounded-xl shadow-xl border-0 ring-1 ring-black/5">
              {appointment.status === 'pending' && (
                <DropdownMenuItem onClick={() => handleAction('confirm')} className="rounded-lg py-2.5 cursor-pointer">
                  <CheckCircle className="h-4 w-4 ms-2 text-green-500" />
                  {isRtl ? 'تأكيد' : 'Confirm'}
                </DropdownMenuItem>
              )}
              {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                <>
                  <DropdownMenuItem onClick={() => handleAction('complete')} className="rounded-lg py-2.5 cursor-pointer">
                    <Check className="h-4 w-4 ms-2 text-blue-500" />
                    {isRtl ? 'إكمال' : 'Complete'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('no_show')} className="rounded-lg py-2.5 cursor-pointer">
                    <UserX className="h-4 w-4 ms-2 text-gray-500" />
                    {isRtl ? 'لم يحضر' : 'No Show'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleAction('cancel')}
                    className="text-red-600 focus:text-red-600 rounded-lg py-2.5 cursor-pointer bg-red-50/50 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 ms-2" />
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Action Button */}
        <div className="hidden sm:inline-flex w-auto mt-auto self-center">
          <GosiButton
            variant="ghost"
            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 hover:border-emerald-500 rounded-xl px-6 h-10 shadow-sm hover:shadow-lg hover:shadow-emerald-500/20 w-auto transition-all duration-300 hover:scale-105 active:scale-95 group/btn"
          >
            {isRtl ? 'عرض التفاصيل' : 'View Details'}
            <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180 transition-transform group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1" />
          </GosiButton>
        </div>
      </div>
    </div>
  )
}

// ==================== Appointments Sidebar ====================

function AppointmentsSidebar({
  isRtl,
  onNewAppointment,
  onBlockTime,
  onManageAvailability,
}: {
  isRtl: boolean
  onNewAppointment: () => void
  onBlockTime: () => void
  onManageAvailability: () => void
}) {
  return (
    <div className="space-y-8 lg:col-span-1">
      {/* QUICK ACTIONS WIDGET */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 shadow-xl shadow-emerald-900/20 ring-1 ring-white/10 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -me-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ms-32 -mb-32 pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="font-bold text-lg text-white">{isRtl ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
        </div>

        {/* Content */}
        <div className="relative z-10 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* New Appointment */}
          <Button
            onClick={onNewAppointment}
            className="bg-white hover:bg-emerald-50 text-emerald-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl shadow-lg shadow-white/10 transition-all duration-300 hover:scale-[1.02] border-0"
          >
            <Plus className="h-7 w-7" aria-hidden="true" />
            <span className="flex items-center gap-1.5 text-sm font-bold">
              <kbd className="text-[10px] font-mono bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">N</kbd>
              {isRtl ? 'موعد جديد' : 'New'}
            </span>
          </Button>

          {/* Block Time */}
          <Button
            onClick={onBlockTime}
            className="bg-white hover:bg-red-50 text-red-500 hover:text-red-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl shadow-lg shadow-white/10 transition-all duration-300 hover:scale-[1.02] border-0"
          >
            <Ban className="h-7 w-7" aria-hidden="true" />
            <span className="flex items-center gap-1.5 text-sm font-bold">
              <kbd className="text-[10px] font-mono bg-red-100 text-red-600 px-1.5 py-0.5 rounded">B</kbd>
              {isRtl ? 'حظر وقت' : 'Block'}
            </span>
          </Button>

          {/* Manage Availability */}
          <Button
            onClick={onManageAvailability}
            className="bg-white hover:bg-blue-50 text-blue-600 h-auto py-6 flex flex-col items-center justify-center gap-2 rounded-3xl shadow-lg shadow-white/10 transition-all duration-300 hover:scale-[1.02] border-0 col-span-2"
          >
            <Settings className="h-7 w-7" aria-hidden="true" />
            <span className="flex items-center gap-1.5 text-sm font-bold">
              <kbd className="text-[10px] font-mono bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">A</kbd>
              {isRtl ? 'إدارة أوقات العمل' : 'Manage Availability'}
            </span>
          </Button>
        </div>
      </div>

      {/* TODAY'S APPOINTMENTS */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">{isRtl ? 'مواعيد اليوم' : "Today's Appointments"}</h3>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
            {format(new Date(), 'd MMM')}
          </Badge>
        </div>
        <div className="space-y-3">
          <div className="text-center py-6 text-slate-400 text-sm">
            {isRtl ? 'جاري التحميل...' : 'Loading...'}
          </div>
        </div>
      </div>

      {/* KEYBOARD SHORTCUTS */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
        <h3 className="font-bold text-slate-900 mb-4">{isRtl ? 'اختصارات لوحة المفاتيح' : 'Keyboard Shortcuts'}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">{isRtl ? 'موعد جديد' : 'New Appointment'}</span>
            <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">N</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">{isRtl ? 'حظر وقت' : 'Block Time'}</span>
            <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">B</kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">{isRtl ? 'إدارة الأوقات' : 'Availability'}</span>
            <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">A</kbd>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Book Appointment Dialog ====================

function BookAppointmentDialog({
  open,
  onOpenChange,
  isRtl,
  locale,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRtl: boolean
  locale: any
}) {
  const bookMutation = useBookAppointment()
  const [step, setStep] = useState<1 | 2>(1) // 1: Select date/time, 2: Enter details
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    duration: 30 as AppointmentDuration,
    type: 'consultation' as AppointmentType,
    notes: '',
  })

  // Fetch available slots for selected date
  const { data: availableSlotsData, isLoading: isSlotsLoading } = useAvailableSlots(
    {
      lawyerId: user?._id || '', // Use actual user ID from auth store
      startDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      endDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      duration: formData.duration,
    },
    !!selectedDate && !!user?._id // Only fetch when user is authenticated
  )

  const availableSlots = availableSlotsData?.data || []

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })

    // Add padding for first week
    const startPadding = getDay(start)
    const paddedDays: (Date | null)[] = Array(startPadding).fill(null)

    return [...paddedDays, ...days]
  }, [currentMonth])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleNext = () => {
    if (selectedDate && selectedTime) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return

    try {
      await bookMutation.mutateAsync({
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        source: 'manual',
      })
      toast.success(isRtl ? 'تم حجز الموعد بنجاح' : 'Appointment booked successfully')
      onOpenChange(false)
      // Reset
      setStep(1)
      setSelectedDate(null)
      setSelectedTime(null)
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        duration: 30,
        type: 'consultation',
        notes: '',
      })
    } catch {
      toast.error(isRtl ? 'فشل في حجز الموعد' : 'Failed to book appointment')
    }
  }

  const isPastDate = (date: Date) => isBefore(date, startOfDay(new Date()))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 1
              ? (isRtl ? 'اختر التاريخ والوقت' : 'Select Date & Time')
              : (isRtl ? 'تفاصيل العميل' : 'Client Details')
            }
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? (isRtl ? 'اختر تاريخ الموعد ثم اختر الوقت المناسب' : 'Choose the appointment date and then select a time slot')
              : (isRtl ? 'أدخل بيانات العميل لإتمام الحجز' : 'Enter client details to complete the booking')
            }
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="space-y-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                >
                  {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
                <h3 className="text-lg font-semibold">
                  {format(currentMonth, 'MMMM yyyy', { locale })}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </Button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="py-2">
                    {isRtl ? day.labelAr.slice(0, 2) : day.labelEn.slice(0, 3)}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    disabled={!day || isPastDate(day)}
                    onClick={() => day && handleDateSelect(day)}
                    className={cn(
                      'h-10 w-10 rounded-xl text-sm font-medium transition-all mx-auto',
                      !day && 'invisible',
                      day && isPastDate(day) && 'text-slate-300 cursor-not-allowed',
                      day && !isPastDate(day) && 'hover:bg-emerald-50 hover:text-emerald-600',
                      day && isToday(day) && 'bg-blue-50 text-blue-600',
                      day && selectedDate && isSameDay(day, selectedDate) && 'bg-emerald-500 text-white hover:bg-emerald-600'
                    )}
                  >
                    {day ? format(day, 'd') : ''}
                  </button>
                ))}
              </div>

              {/* Duration Selection */}
              <div className="space-y-2 pt-4 border-t">
                <Label>{isRtl ? 'مدة الموعد' : 'Appointment Duration'}</Label>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(v) => setFormData({ ...formData, duration: parseInt(v) as AppointmentDuration })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value.toString()}>
                        {isRtl ? d.labelAr : d.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">
                {selectedDate
                  ? format(selectedDate, 'EEEE، d MMMM', { locale })
                  : (isRtl ? 'اختر تاريخاً' : 'Select a date')
                }
              </h3>

              {!selectedDate ? (
                <div className="text-center py-12 text-slate-400">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isRtl ? 'اختر تاريخاً لعرض الأوقات المتاحة' : 'Select a date to see available times'}</p>
                </div>
              ) : isSlotsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isRtl ? 'لا توجد أوقات متاحة في هذا اليوم' : 'No available times on this day'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pe-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className={cn(
                        'py-3 px-4 rounded-xl text-sm font-medium transition-all border',
                        !slot.available && 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200',
                        slot.available && selectedTime !== slot.time && 'bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 border-slate-200',
                        selectedTime === slot.time && 'bg-emerald-500 text-white border-emerald-500'
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Step 2: Client Details */
          <div className="space-y-4">
            {/* Selected Date/Time Summary */}
            <div className="bg-emerald-50 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CalendarIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900">
                  {selectedDate && format(selectedDate, 'EEEE، d MMMM yyyy', { locale })}
                </p>
                <p className="text-emerald-700 text-sm">{selectedTime}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleBack} className="ms-auto text-emerald-600">
                {isRtl ? 'تغيير' : 'Change'}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>{isRtl ? 'اسم العميل' : 'Client Name'} *</Label>
              <Input
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder={isRtl ? 'أدخل اسم العميل' : 'Enter client name'}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRtl ? 'البريد الإلكتروني' : 'Email'}</Label>
                <Input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  placeholder="email@example.com"
                  dir="ltr"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRtl ? 'رقم الهاتف' : 'Phone'} *</Label>
                <Input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isRtl ? 'نوع الموعد' : 'Appointment Type'}</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as AppointmentType })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {isRtl ? t.labelAr : t.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isRtl ? 'ملاحظات' : 'Notes'}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={isRtl ? 'ملاحظات إضافية...' : 'Additional notes...'}
                rows={3}
                className="rounded-xl"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                {isRtl ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedDate || !selectedTime}
                className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
              >
                {isRtl ? 'التالي' : 'Next'}
                <ArrowRight className="h-4 w-4 ms-2 rtl:rotate-180" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack} className="rounded-xl">
                <ChevronRight className="h-4 w-4 me-2 rtl:rotate-180" />
                {isRtl ? 'السابق' : 'Back'}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={bookMutation.isPending || !formData.clientName || !formData.clientPhone}
                className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
              >
                {bookMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : null}
                {isRtl ? 'تأكيد الحجز' : 'Confirm Booking'}
              </Button>
            </>
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
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRtl: boolean
}) {
  const createMutation = useCreateBlockedTime()
  const [formData, setFormData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endDate: format(new Date(), 'yyyy-MM-dd'),
    endTime: '17:00',
    isAllDay: false,
    reason: '',
  })

  const handleSubmit = async () => {
    try {
      await createMutation.mutateAsync({
        startDateTime: formData.isAllDay
          ? `${formData.startDate}T00:00:00`
          : `${formData.startDate}T${formData.startTime}:00`,
        endDateTime: formData.isAllDay
          ? `${formData.endDate}T23:59:59`
          : `${formData.endDate}T${formData.endTime}:00`,
        isAllDay: formData.isAllDay,
        reason: formData.reason || undefined,
      })
      toast.success(isRtl ? 'تم حظر الوقت بنجاح' : 'Time blocked successfully')
      onOpenChange(false)
    } catch {
      toast.error(isRtl ? 'فشل في حظر الوقت' : 'Failed to block time')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isRtl ? 'حظر وقت' : 'Block Time'}</DialogTitle>
          <DialogDescription>
            {isRtl ? 'حدد الوقت الذي لا تريد استقبال مواعيد فيه' : 'Select the time you want to block from bookings'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{isRtl ? 'طوال اليوم' : 'All Day'}</Label>
            <Switch
              checked={formData.isAllDay}
              onCheckedChange={(checked) => setFormData({ ...formData, isAllDay: checked })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isRtl ? 'تاريخ البداية' : 'Start Date'}</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                dir="ltr"
                className="rounded-xl"
              />
            </div>
            {!formData.isAllDay && (
              <div className="space-y-2">
                <Label>{isRtl ? 'وقت البداية' : 'Start Time'}</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(v) => setFormData({ ...formData, startTime: v })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isRtl ? 'تاريخ النهاية' : 'End Date'}</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                dir="ltr"
                className="rounded-xl"
              />
            </div>
            {!formData.isAllDay && (
              <div className="space-y-2">
                <Label>{isRtl ? 'وقت النهاية' : 'End Time'}</Label>
                <Select
                  value={formData.endTime}
                  onValueChange={(v) => setFormData({ ...formData, endTime: v })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{isRtl ? 'السبب (اختياري)' : 'Reason (optional)'}</Label>
            <Input
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder={isRtl ? 'مثال: إجازة، اجتماع...' : 'e.g., Vacation, Meeting...'}
              className="rounded-xl"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-red-500 hover:bg-red-600 rounded-xl"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <Ban className="h-4 w-4 me-2" />
            )}
            {isRtl ? 'حظر الوقت' : 'Block Time'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Manage Availability Dialog ====================

function ManageAvailabilityDialog({
  open,
  onOpenChange,
  isRtl,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRtl: boolean
}) {
  const { data: availabilityData, isLoading } = useAvailability()
  const createMutation = useCreateAvailability()
  const deleteMutation = useDeleteAvailability()

  const availability = availabilityData?.data || []

  const [formData, setFormData] = useState({
    dayOfWeek: 0 as DayOfWeek,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30 as AppointmentDuration,
  })

  const handleAdd = async () => {
    try {
      await createMutation.mutateAsync({
        ...formData,
        isActive: true,
        breakBetweenSlots: 0,
      })
      toast.success(isRtl ? 'تم إضافة فترة التوفر' : 'Availability added')
    } catch {
      toast.error(isRtl ? 'فشل في الإضافة' : 'Failed to add')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success(isRtl ? 'تم الحذف' : 'Deleted')
    } catch {
      toast.error(isRtl ? 'فشل في الحذف' : 'Failed to delete')
    }
  }

  // Group by day
  const availabilityByDay = useMemo(() => {
    const grouped: Record<DayOfWeek, typeof availability> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
    availability.forEach((slot) => {
      grouped[slot.dayOfWeek].push(slot)
    })
    return grouped
  }, [availability])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isRtl ? 'إدارة أوقات العمل' : 'Manage Working Hours'}</DialogTitle>
          <DialogDescription>
            {isRtl ? 'حدد الأيام والأوقات المتاحة لحجز المواعيد' : 'Set the days and times available for appointments'}
          </DialogDescription>
        </DialogHeader>

        {/* Add New Slot */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
          <h4 className="font-semibold text-slate-900">{isRtl ? 'إضافة فترة جديدة' : 'Add New Slot'}</h4>
          <div className="grid grid-cols-4 gap-3">
            <Select
              value={formData.dayOfWeek.toString()}
              onValueChange={(v) => setFormData({ ...formData, dayOfWeek: parseInt(v) as DayOfWeek })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {isRtl ? day.labelAr : day.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={formData.startTime}
              onValueChange={(v) => setFormData({ ...formData, startTime: v })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={isRtl ? 'من' : 'From'} />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.slice(0, 36).map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={formData.endTime}
              onValueChange={(v) => setFormData({ ...formData, endTime: v })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={isRtl ? 'إلى' : 'To'} />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.slice(0, 36).map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleAdd}
              disabled={createMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Current Availability */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            DAYS_OF_WEEK.map((day) => {
              const slots = availabilityByDay[day.value]
              return (
                <div key={day.value} className="flex items-start gap-4 p-4 bg-white rounded-xl border">
                  <div className="w-24 shrink-0">
                    <p className="font-semibold text-slate-900">
                      {isRtl ? day.labelAr : day.labelEn}
                    </p>
                  </div>
                  <div className="flex-1">
                    {slots.length === 0 ? (
                      <p className="text-sm text-slate-400">{isRtl ? 'غير متاح' : 'Not available'}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200"
                          >
                            <Clock className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm font-medium text-emerald-700">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-emerald-400 hover:text-red-500"
                              onClick={() => handleDelete(slot.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="rounded-xl">
            {isRtl ? 'تم' : 'Done'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AppointmentsView

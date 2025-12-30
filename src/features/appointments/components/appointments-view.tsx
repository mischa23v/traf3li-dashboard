/**
 * Appointments View - Redesigned with Week View
 * Weekly calendar view for easy appointment management
 *
 * عرض المواعيد - إعادة تصميم مع عرض أسبوعي
 * عرض تقويم أسبوعي لإدارة المواعيد بسهولة
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, addWeeks, subWeeks, isBefore, startOfDay, parseISO } from 'date-fns'
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
import { Checkbox } from '@/components/ui/checkbox'
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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth-store'

import {
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
  AppointmentDuration,
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

// ==================== Main Component ====================

export function AppointmentsView() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const locale = isRtl ? ar : enUS

  // Get current user from auth store
  const user = useAuthStore((state) => state.user)

  // View state
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week')
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }))
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set())
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null)

  // Fetch data
  const { data: statsData } = useAppointmentStats()
  const { data: appointmentsData, isLoading, isError, error, refetch } = useAppointments({})

  const stats = statsData?.data
  const appointments = appointmentsData?.data?.appointments || []

  // Cancel mutation for delete
  const cancelMutation = useCancelAppointment()

  // Get week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
  }, [currentWeekStart])

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {}
    appointments.forEach((apt) => {
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
  }, [appointments])

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

  const selectAllInDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayAppointments = appointmentsByDate[dateKey] || []
    const newSelected = new Set(selectedAppointments)
    dayAppointments.forEach((apt) => newSelected.add(apt.id))
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
    } catch {
      toast.error(isRtl ? 'حدث خطأ أثناء الحذف' : 'Error deleting appointment(s)')
    }
  }

  // View appointment details
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsDialog(true)
  }

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
        {/* Hero Banner - Dashboard Style */}
        <div className="bg-[#022c22] rounded-2xl p-6 relative overflow-hidden text-white shadow-lg">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(-45deg, #022c22, #064e3b, #022c22, #0f766e)',
                backgroundSize: '400% 400%',
                animation: 'gradientShift 20s ease infinite'
              }}
            />
            <style>{`
              @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
            `}</style>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/hero-wave.png"
              alt=""
              className="w-full h-full object-cover opacity-25 mix-blend-overlay"
            />
          </div>

          {/* Accent glow */}
          <div className="absolute top-0 end-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl -me-32 -mt-32 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Title Section */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <CalendarDays className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    {isRtl ? 'إدارة المواعيد' : 'Appointments'}
                  </h1>
                  <p className="text-sm text-white/60 mt-0.5">
                    {isRtl
                      ? `${stats?.todayCount || 0} مواعيد اليوم • ${stats?.pending || 0} معلقة`
                      : `${stats?.todayCount || 0} today • ${stats?.pending || 0} pending`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowBookingDialog(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-5 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 border-0 text-sm"
                >
                  <Plus className="ms-2 h-4 w-4" aria-hidden="true" />
                  {isRtl ? 'موعد جديد' : 'New Appointment'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Week View Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left: Month & Navigation */}
            <div className="flex items-center gap-4">
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

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={goToPreviousWeek} className="h-10 w-10 rounded-xl hover:bg-slate-100">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-10 w-10 rounded-xl hover:bg-slate-100">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <Button variant="link" onClick={goToToday} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                {isRtl ? 'العودة لليوم' : 'Back to Today'}
              </Button>
            </div>

            {/* Right: View Toggle & Bulk Actions */}
            <div className="flex items-center gap-3">
              {selectedAppointments.size > 0 && (
                <div className="flex items-center gap-2 pe-3 border-e border-slate-200">
                  <span className="text-sm text-slate-600">
                    {isRtl ? `${selectedAppointments.size} محدد` : `${selectedAppointments.size} selected`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="h-8 text-slate-500 hover:text-slate-700"
                  >
                    {isRtl ? 'إلغاء' : 'Clear'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="h-8 bg-red-500 hover:bg-red-600"
                  >
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
                  className={cn(
                    'h-8 px-3 rounded-lg',
                    viewMode === 'week' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                  )}
                >
                  <LayoutGrid className="h-4 w-4 ms-1" />
                  {isRtl ? 'أسبوعي' : 'Week'}
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'h-8 px-3 rounded-lg',
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                  )}
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
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {isRtl ? 'خطأ في التحميل' : 'Loading Error'}
            </h3>
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
                const hasAppointments = dayAppointments.length > 0

                return (
                  <div
                    key={idx}
                    className={cn(
                      'p-4 text-center border-e border-slate-100 last:border-e-0',
                      isCurrentDay && 'bg-emerald-50'
                    )}
                  >
                    <div className={cn(
                      'text-xs font-bold uppercase tracking-wider mb-1',
                      isCurrentDay ? 'text-emerald-600' : 'text-slate-400'
                    )}>
                      {isRtl ? WEEKDAYS_AR[idx] : WEEKDAYS_EN[idx]}
                    </div>
                    <div className={cn(
                      'text-2xl font-bold',
                      isCurrentDay ? 'text-emerald-600' : 'text-slate-900'
                    )}>
                      {format(day, 'd')}
                    </div>
                    {hasAppointments && (
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-xs bg-slate-100">
                          {dayAppointments.length}
                        </Badge>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Week Body - Appointments */}
            <div className="grid grid-cols-7 min-h-[400px]">
              {weekDays.map((day, idx) => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const dayAppointments = appointmentsByDate[dateKey] || []
                const isCurrentDay = isToday(day)

                return (
                  <div
                    key={idx}
                    className={cn(
                      'p-2 border-e border-slate-100 last:border-e-0 min-h-[400px]',
                      isCurrentDay && 'bg-emerald-50/30'
                    )}
                  >
                    <div className="space-y-2">
                      {dayAppointments.map((apt) => {
                        const typeConfig = APPOINTMENT_TYPES.find((t) => t.value === apt.type)
                        const statusConfig = STATUS_CONFIG[apt.status]
                        const isSelected = selectedAppointments.has(apt.id)

                        return (
                          <div
                            key={apt.id}
                            onClick={() => handleViewDetails(apt)}
                            className={cn(
                              'p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md group relative',
                              statusConfig.bgColor,
                              isSelected && 'ring-2 ring-emerald-500'
                            )}
                          >
                            {/* Selection checkbox */}
                            <div
                              className="absolute top-2 end-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleSelectAppointment(apt.id)
                              }}
                            >
                              <Checkbox checked={isSelected} />
                            </div>

                            {/* Time */}
                            <div className="text-sm font-bold text-slate-900 mb-1">
                              {apt.startTime || '00:00'}
                            </div>

                            {/* Client Name */}
                            <div className="text-xs font-medium text-slate-700 truncate">
                              {apt.clientName || (isRtl ? 'بدون اسم' : 'No name')}
                            </div>

                            {/* Type badge */}
                            <div className="mt-2">
                              <span className={cn(
                                'inline-block px-2 py-0.5 rounded-full text-[10px] font-medium text-white',
                                typeConfig?.color || 'bg-gray-500'
                              )}>
                                {isRtl ? typeConfig?.labelAr : typeConfig?.labelEn}
                              </span>
                            </div>

                            {/* Delete button on hover */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSingle(apt.id)
                              }}
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
            {appointments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <CalendarClock className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {isRtl ? 'لا توجد مواعيد' : 'No Appointments'}
                </h3>
                <p className="text-slate-500 mb-4">
                  {isRtl ? 'لا توجد مواعيد حالياً' : 'No appointments scheduled'}
                </p>
                <Button onClick={() => setShowBookingDialog(true)} className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="w-4 h-4 ms-2" />
                  {isRtl ? 'موعد جديد' : 'New Appointment'}
                </Button>
              </div>
            ) : (
              appointments.map((apt) => {
                const typeConfig = APPOINTMENT_TYPES.find((t) => t.value === apt.type)
                const statusConfig = STATUS_CONFIG[apt.status]
                const isSelected = selectedAppointments.has(apt.id)

                return (
                  <div
                    key={apt.id}
                    className={cn(
                      'bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group',
                      isSelected && 'ring-2 ring-emerald-500'
                    )}
                    onClick={() => handleViewDetails(apt)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div
                        className="pt-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSelectAppointment(apt.id)
                        }}
                      >
                        <Checkbox checked={isSelected} />
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={cn(
                            'px-2 py-1 rounded-lg text-xs font-medium',
                            statusConfig.bgColor,
                            statusConfig.color
                          )}>
                            {isRtl ? statusConfig.labelAr : statusConfig.labelEn}
                          </span>
                          <span className={cn(
                            'px-2 py-1 rounded-lg text-xs font-medium text-white',
                            typeConfig?.color || 'bg-gray-500'
                          )}>
                            {isRtl ? typeConfig?.labelAr : typeConfig?.labelEn}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 mb-1">
                          {apt.clientName || (isRtl ? 'بدون اسم' : 'No name')}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {apt.date ? format(new Date(apt.date), 'MMM d, yyyy', { locale }) : '-'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {apt.startTime || '00:00'}
                          </span>
                          {apt.clientPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {apt.clientPhone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSingle(apt.id)
                        }}
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
      </Main>

      {/* Book Appointment Dialog */}
      <BookAppointmentDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        isRtl={isRtl}
        locale={locale}
        user={user}
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
                : (isRtl
                    ? `هل أنت متأكد من حذف ${selectedAppointments.size} موعد؟`
                    : `Are you sure you want to delete ${selectedAppointments.size} appointment(s)?`)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              {isRtl ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin ms-2" />
              ) : (
                <Trash2 className="h-4 w-4 ms-2" />
              )}
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
    } catch {
      toast.error(isRtl ? 'حدث خطأ' : 'An error occurred')
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
            <span className={cn(
              'px-2 py-1 rounded-lg text-xs font-medium',
              statusConfig.bgColor,
              statusConfig.color
            )}>
              {isRtl ? statusConfig.labelAr : statusConfig.labelEn}
            </span>
            <span className={cn(
              'px-2 py-1 rounded-lg text-xs font-medium text-white',
              typeConfig?.color || 'bg-gray-500'
            )}>
              {isRtl ? typeConfig?.labelAr : typeConfig?.labelEn}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date & Time */}
          <div className="flex items-center gap-3 text-slate-700">
            <CalendarIcon className="h-5 w-5 text-slate-400" />
            <span>
              {appointment.date
                ? format(new Date(appointment.date), 'EEEE، d MMMM yyyy', { locale })
                : '-'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Clock className="h-5 w-5 text-slate-400" />
            <span>{appointment.startTime || '00:00'} - {appointment.endTime || '--:--'}</span>
          </div>

          {/* Contact Info */}
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

          {/* Location */}
          {appointment.location && (
            <div className="flex items-center gap-3 text-slate-700">
              {appointment.location.type === 'video' ? (
                <Video className="h-5 w-5 text-slate-400" />
              ) : (
                <MapPin className="h-5 w-5 text-slate-400" />
              )}
              <span>
                {appointment.location.type === 'video'
                  ? (isRtl ? 'اجتماع عن بعد' : 'Video Call')
                  : appointment.location.address}
              </span>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600">{appointment.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {appointment.status === 'pending' && (
            <Button
              onClick={() => handleAction('confirm')}
              className="bg-blue-500 hover:bg-blue-600"
              disabled={confirmMutation.isPending}
            >
              <Check className="h-4 w-4 ms-2" />
              {isRtl ? 'تأكيد' : 'Confirm'}
            </Button>
          )}
          {appointment.status === 'confirmed' && (
            <>
              <Button
                onClick={() => handleAction('complete')}
                className="bg-green-500 hover:bg-green-600"
                disabled={completeMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 ms-2" />
                {isRtl ? 'إكمال' : 'Complete'}
              </Button>
              <Button
                onClick={() => handleAction('no_show')}
                variant="outline"
                disabled={noShowMutation.isPending}
              >
                <X className="h-4 w-4 ms-2" />
                {isRtl ? 'لم يحضر' : 'No Show'}
              </Button>
            </>
          )}
          <Button
            variant="destructive"
            onClick={() => onDelete(appointment.id)}
          >
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
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRtl: boolean
  locale: any
  user: any
}) {
  const bookMutation = useBookAppointment()
  const [step, setStep] = useState<1 | 2>(1)
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
      lawyerId: user?._id || '',
      startDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      endDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      duration: formData.duration,
    },
    !!selectedDate && !!user?._id
  )

  const availableSlots = availableSlotsData?.data?.slots || []

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    const days: (Date | null)[] = []

    // Add padding for first week
    const startDay = start.getDay()
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    // Add days of month
    for (let d = 1; d <= end.getDate(); d++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d))
    }

    return days
  }, [currentMonth])

  const isPastDate = (date: Date) => isBefore(date, startOfDay(new Date()))

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === 1
              ? (isRtl ? 'اختر التاريخ والوقت' : 'Select Date & Time')
              : (isRtl ? 'تفاصيل العميل' : 'Client Details')}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? (isRtl ? 'اختر تاريخ الموعد ثم اختر الوقت المناسب' : 'Choose the appointment date and then select a time slot')
              : (isRtl ? 'أدخل بيانات العميل لإتمام الحجز' : 'Enter client details to complete the booking')}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="font-semibold">{format(currentMonth, 'MMMM yyyy', { locale })}</span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
                {(isRtl ? ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']).map((d) => (
                  <div key={d} className="p-2">{d}</div>
                ))}
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

            {/* Time Slots */}
            <div className="space-y-4">
              <h4 className="font-semibold">{isRtl ? 'الأوقات المتاحة' : 'Available Times'}</h4>

              {!selectedDate ? (
                <div className="text-center py-12 text-slate-400">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isRtl ? 'اختر تاريخاً أولاً' : 'Select a date first'}</p>
                </div>
              ) : isSlotsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isRtl ? 'لا توجد أوقات متاحة' : 'No available times'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={cn(
                        'py-3 px-4 rounded-xl text-sm font-medium transition-all border',
                        !slot.available && 'bg-slate-100 text-slate-400 cursor-not-allowed',
                        slot.available && selectedTime !== slot.time && 'bg-white hover:bg-emerald-50 hover:border-emerald-300',
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
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-xl flex items-center gap-4">
              <CalendarIcon className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-900">
                  {selectedDate && format(selectedDate, 'EEEE، d MMMM yyyy', { locale })}
                </p>
                <p className="text-sm text-emerald-700">{selectedTime}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <Label>{isRtl ? 'اسم العميل' : 'Client Name'}</Label>
                <Input
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder={isRtl ? 'أدخل اسم العميل' : 'Enter client name'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRtl ? 'البريد الإلكتروني' : 'Email'}</Label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{isRtl ? 'رقم الهاتف' : 'Phone'}</Label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isRtl ? 'نوع الموعد' : 'Type'}</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as AppointmentType })}>
                    <SelectTrigger>
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
                <div>
                  <Label>{isRtl ? 'المدة' : 'Duration'}</Label>
                  <Select value={String(formData.duration)} onValueChange={(v) => setFormData({ ...formData, duration: Number(v) as AppointmentDuration })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((d) => (
                        <SelectItem key={d.value} value={String(d.value)}>
                          {isRtl ? d.labelAr : d.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{isRtl ? 'ملاحظات' : 'Notes'}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              {isRtl ? 'رجوع' : 'Back'}
            </Button>
          )}
          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedDate || !selectedTime}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {isRtl ? 'التالي' : 'Next'}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={bookMutation.isPending || !formData.clientName}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {bookMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ms-2" />}
              {isRtl ? 'حجز الموعد' : 'Book Appointment'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AppointmentsView

/**
 * Appointments View
 * Main appointments management page for lawyers
 *
 * عرض المواعيد
 * صفحة إدارة المواعيد الرئيسية للمحامين
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO, isToday, isBefore, startOfDay } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Settings,
  User,
  Phone,
  Mail,
  MapPin,
  Video,
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
  Edit3,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import {
  useAvailability,
  useCreateAvailability,
  useUpdateAvailability,
  useDeleteAvailability,
  useBulkUpdateAvailability,
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
} from '@/hooks/useAppointments'

import type {
  AvailabilitySlot,
  BlockedTime,
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

const STATUS_CONFIG: Record<AppointmentStatus, { labelAr: string; labelEn: string; color: string; icon: any }> = {
  pending: { labelAr: 'معلق', labelEn: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { labelAr: 'مؤكد', labelEn: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  completed: { labelAr: 'مكتمل', labelEn: 'Completed', color: 'bg-green-100 text-green-800', icon: Check },
  cancelled: { labelAr: 'ملغي', labelEn: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  no_show: { labelAr: 'لم يحضر', labelEn: 'No Show', color: 'bg-gray-100 text-gray-800', icon: UserX },
}

// ==================== Components ====================

export function AppointmentsView() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const locale = isRtl ? ar : enUS

  const [activeTab, setActiveTab] = useState<'appointments' | 'availability' | 'blocked'>('appointments')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false)

  // Fetch data
  const { data: statsData, isLoading: isStatsLoading } = useAppointmentStats()
  const { data: availabilityData, isLoading: isAvailabilityLoading } = useAvailability()
  const { data: blockedTimesData, isLoading: isBlockedLoading } = useBlockedTimes()
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useAppointments({
    startDate: startOfWeek(selectedDate, { weekStartsOn: 0 }).toISOString(),
    endDate: endOfWeek(selectedDate, { weekStartsOn: 0 }).toISOString(),
  })

  const stats = statsData?.data
  const availability = availabilityData?.data || []
  const blockedTimes = blockedTimesData?.data || []
  const appointments = appointmentsData?.data || []

  return (
    <div className="min-h-screen bg-slate-50" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isRtl ? 'إدارة المواعيد' : 'Appointments Management'}
            </h1>
            <p className="text-slate-500 mt-1">
              {isRtl ? 'إدارة جدولك ومواعيد العملاء' : 'Manage your schedule and client appointments'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowBlockDialog(true)}
              className="gap-2"
            >
              <Ban className="h-4 w-4" />
              {isRtl ? 'حظر وقت' : 'Block Time'}
            </Button>
            <Button
              onClick={() => setShowBookingDialog(true)}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4" />
              {isRtl ? 'حجز موعد' : 'Book Appointment'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title={isRtl ? 'مواعيد اليوم' : "Today's"}
            value={stats?.todayCount || 0}
            icon={CalendarDays}
            color="bg-blue-500"
            isLoading={isStatsLoading}
          />
          <StatsCard
            title={isRtl ? 'معلقة' : 'Pending'}
            value={stats?.pending || 0}
            icon={Clock}
            color="bg-yellow-500"
            isLoading={isStatsLoading}
          />
          <StatsCard
            title={isRtl ? 'مؤكدة' : 'Confirmed'}
            value={stats?.confirmed || 0}
            icon={CheckCircle}
            color="bg-emerald-500"
            isLoading={isStatsLoading}
          />
          <StatsCard
            title={isRtl ? 'هذا الأسبوع' : 'This Week'}
            value={stats?.weekCount || 0}
            icon={CalendarClock}
            color="bg-purple-500"
            isLoading={isStatsLoading}
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="appointments" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {isRtl ? 'المواعيد' : 'Appointments'}
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-2">
              <Clock className="h-4 w-4" />
              {isRtl ? 'أوقات العمل' : 'Availability'}
            </TabsTrigger>
            <TabsTrigger value="blocked" className="gap-2">
              <Ban className="h-4 w-4" />
              {isRtl ? 'الأوقات المحظورة' : 'Blocked Times'}
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <AppointmentsCalendar
              appointments={appointments}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              isLoading={isAppointmentsLoading}
              isRtl={isRtl}
              locale={locale}
            />
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-6">
            <AvailabilityManager
              availability={availability}
              isLoading={isAvailabilityLoading}
              isRtl={isRtl}
              onAddSlot={() => setShowAvailabilityDialog(true)}
            />
          </TabsContent>

          {/* Blocked Times Tab */}
          <TabsContent value="blocked" className="space-y-6">
            <BlockedTimesManager
              blockedTimes={blockedTimes}
              isLoading={isBlockedLoading}
              isRtl={isRtl}
              onAddBlock={() => setShowBlockDialog(true)}
            />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <BookAppointmentDialog
          open={showBookingDialog}
          onOpenChange={setShowBookingDialog}
          isRtl={isRtl}
        />

        <BlockTimeDialog
          open={showBlockDialog}
          onOpenChange={setShowBlockDialog}
          isRtl={isRtl}
        />

        <AddAvailabilityDialog
          open={showAvailabilityDialog}
          onOpenChange={setShowAvailabilityDialog}
          isRtl={isRtl}
        />
      </div>
    </div>
  )
}

// ==================== Stats Card ====================

function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  isLoading,
}: {
  title: string
  value: number
  icon: any
  color: string
  isLoading?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-xl', color)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== Appointments Calendar ====================

function AppointmentsCalendar({
  appointments,
  selectedDate,
  onDateChange,
  isLoading,
  isRtl,
  locale,
}: {
  appointments: Appointment[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  isLoading: boolean
  isRtl: boolean
  locale: any
}) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const confirmMutation = useConfirmAppointment()
  const cancelMutation = useCancelAppointment()
  const completeMutation = useCompleteAppointment()
  const noShowMutation = useMarkNoShow()

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt) => isSameDay(parseISO(apt.date), date))
  }

  const handleAction = async (action: string, appointment: Appointment) => {
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

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(addDays(selectedDate, -7))}
        >
          {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
        <h3 className="text-lg font-semibold text-slate-900">
          {format(weekStart, 'd MMMM', { locale })} - {format(addDays(weekStart, 6), 'd MMMM yyyy', { locale })}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDateChange(addDays(selectedDate, 7))}
        >
          {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayAppointments = getAppointmentsForDay(day)
          const isPast = isBefore(day, startOfDay(new Date()))

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'bg-white rounded-xl border p-3 min-h-[200px]',
                isToday(day) && 'ring-2 ring-emerald-500',
                isPast && 'opacity-60'
              )}
            >
              {/* Day Header */}
              <div className="text-center mb-3 pb-2 border-b">
                <p className="text-xs text-slate-500">
                  {format(day, 'EEEE', { locale })}
                </p>
                <p className={cn(
                  'text-lg font-bold',
                  isToday(day) ? 'text-emerald-600' : 'text-slate-900'
                )}>
                  {format(day, 'd', { locale })}
                </p>
              </div>

              {/* Appointments */}
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : dayAppointments.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    {isRtl ? 'لا مواعيد' : 'No appointments'}
                  </p>
                ) : (
                  dayAppointments.map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      isRtl={isRtl}
                      onAction={handleAction}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== Appointment Card ====================

function AppointmentCard({
  appointment,
  isRtl,
  onAction,
}: {
  appointment: Appointment
  isRtl: boolean
  onAction: (action: string, appointment: Appointment) => void
}) {
  const statusConfig = STATUS_CONFIG[appointment.status]
  const typeConfig = APPOINTMENT_TYPES.find((t) => t.value === appointment.type)
  const StatusIcon = statusConfig.icon

  return (
    <div className={cn(
      'p-2 rounded-lg border text-xs',
      typeConfig?.color.replace('bg-', 'border-l-4 border-l-')
    )}>
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">
            {appointment.clientName}
          </p>
          <p className="text-slate-500">
            {appointment.startTime} - {appointment.endTime}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRtl ? 'start' : 'end'}>
            {appointment.status === 'pending' && (
              <DropdownMenuItem onClick={() => onAction('confirm', appointment)}>
                <CheckCircle className="h-4 w-4 me-2 text-green-500" />
                {isRtl ? 'تأكيد' : 'Confirm'}
              </DropdownMenuItem>
            )}
            {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
              <>
                <DropdownMenuItem onClick={() => onAction('complete', appointment)}>
                  <Check className="h-4 w-4 me-2 text-blue-500" />
                  {isRtl ? 'إكمال' : 'Complete'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('no_show', appointment)}>
                  <UserX className="h-4 w-4 me-2 text-gray-500" />
                  {isRtl ? 'لم يحضر' : 'No Show'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onAction('cancel', appointment)}
                  className="text-red-600"
                >
                  <XCircle className="h-4 w-4 me-2" />
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Badge className={cn('mt-1 text-[10px]', statusConfig.color)}>
        <StatusIcon className="h-3 w-3 me-1" />
        {isRtl ? statusConfig.labelAr : statusConfig.labelEn}
      </Badge>
    </div>
  )
}

// ==================== Availability Manager ====================

function AvailabilityManager({
  availability,
  isLoading,
  isRtl,
  onAddSlot,
}: {
  availability: AvailabilitySlot[]
  isLoading: boolean
  isRtl: boolean
  onAddSlot: () => void
}) {
  const deleteMutation = useDeleteAvailability()
  const updateMutation = useUpdateAvailability()

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success(isRtl ? 'تم حذف فترة التوفر' : 'Availability slot deleted')
    } catch {
      toast.error(isRtl ? 'حدث خطأ' : 'An error occurred')
    }
  }

  const handleToggle = async (slot: AvailabilitySlot) => {
    try {
      await updateMutation.mutateAsync({
        id: slot.id,
        data: { isActive: !slot.isActive },
      })
      toast.success(isRtl ? 'تم تحديث الحالة' : 'Status updated')
    } catch {
      toast.error(isRtl ? 'حدث خطأ' : 'An error occurred')
    }
  }

  // Group availability by day
  const availabilityByDay = useMemo(() => {
    const grouped: Record<DayOfWeek, AvailabilitySlot[]> = {
      0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    }
    availability.forEach((slot) => {
      grouped[slot.dayOfWeek].push(slot)
    })
    return grouped
  }, [availability])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{isRtl ? 'جدول أوقات العمل' : 'Working Hours Schedule'}</CardTitle>
          <CardDescription>
            {isRtl ? 'حدد الأوقات التي تكون فيها متاحًا للمواعيد' : 'Set the times you are available for appointments'}
          </CardDescription>
        </div>
        <Button onClick={onAddSlot} className="gap-2">
          <Plus className="h-4 w-4" />
          {isRtl ? 'إضافة فترة' : 'Add Slot'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => {
              const slots = availabilityByDay[day.value]
              return (
                <div
                  key={day.value}
                  className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl"
                >
                  <div className="w-24 shrink-0">
                    <p className="font-semibold text-slate-900">
                      {isRtl ? day.labelAr : day.labelEn}
                    </p>
                  </div>
                  <div className="flex-1">
                    {slots.length === 0 ? (
                      <p className="text-sm text-slate-400">
                        {isRtl ? 'غير متاح' : 'Not available'}
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => (
                          <div
                            key={slot.id}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 rounded-lg border',
                              slot.isActive
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-slate-100 border-slate-200 opacity-50'
                            )}
                          >
                            <Clock className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-medium">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className="text-xs text-slate-500">
                              ({slot.slotDuration}{isRtl ? ' د' : 'm'})
                            </span>
                            <Switch
                              checked={slot.isActive}
                              onCheckedChange={() => handleToggle(slot)}
                              className="ms-2"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-red-500"
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
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== Blocked Times Manager ====================

function BlockedTimesManager({
  blockedTimes,
  isLoading,
  isRtl,
  onAddBlock,
}: {
  blockedTimes: BlockedTime[]
  isLoading: boolean
  isRtl: boolean
  onAddBlock: () => void
}) {
  const deleteMutation = useDeleteBlockedTime()

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success(isRtl ? 'تم حذف الوقت المحظور' : 'Blocked time deleted')
    } catch {
      toast.error(isRtl ? 'حدث خطأ' : 'An error occurred')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{isRtl ? 'الأوقات المحظورة' : 'Blocked Times'}</CardTitle>
          <CardDescription>
            {isRtl ? 'الأوقات التي لا تستطيع فيها استقبال المواعيد' : 'Times when you cannot accept appointments'}
          </CardDescription>
        </div>
        <Button onClick={onAddBlock} className="gap-2">
          <Plus className="h-4 w-4" />
          {isRtl ? 'إضافة حظر' : 'Add Block'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : blockedTimes.length === 0 ? (
          <div className="text-center py-8">
            <Ban className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {isRtl ? 'لا توجد أوقات محظورة' : 'No blocked times'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedTimes.map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Ban className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {format(parseISO(block.startDateTime), 'PPP', { locale: isRtl ? ar : enUS })}
                    </p>
                    <p className="text-sm text-slate-500">
                      {block.isAllDay
                        ? (isRtl ? 'طوال اليوم' : 'All day')
                        : `${format(parseISO(block.startDateTime), 'HH:mm')} - ${format(parseISO(block.endDateTime), 'HH:mm')}`
                      }
                    </p>
                    {block.reason && (
                      <p className="text-xs text-slate-400 mt-1">{block.reason}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => handleDelete(block.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== Book Appointment Dialog ====================

function BookAppointmentDialog({
  open,
  onOpenChange,
  isRtl,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRtl: boolean
}) {
  const bookMutation = useBookAppointment()
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    duration: 30 as AppointmentDuration,
    type: 'consultation' as AppointmentType,
    notes: '',
  })

  const handleSubmit = async () => {
    try {
      await bookMutation.mutateAsync({
        ...formData,
        source: 'manual',
      })
      toast.success(isRtl ? 'تم حجز الموعد بنجاح' : 'Appointment booked successfully')
      onOpenChange(false)
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isRtl ? 'حجز موعد جديد' : 'Book New Appointment'}</DialogTitle>
          <DialogDescription>
            {isRtl ? 'أدخل بيانات العميل والموعد' : 'Enter client and appointment details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{isRtl ? 'اسم العميل' : 'Client Name'}</Label>
            <Input
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder={isRtl ? 'أدخل اسم العميل' : 'Enter client name'}
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
              />
            </div>
            <div className="space-y-2">
              <Label>{isRtl ? 'رقم الهاتف' : 'Phone'}</Label>
              <Input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="05XXXXXXXX"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isRtl ? 'التاريخ' : 'Date'}</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{isRtl ? 'الوقت' : 'Time'}</Label>
              <Select
                value={formData.startTime}
                onValueChange={(v) => setFormData({ ...formData, startTime: v })}
              >
                <SelectTrigger>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isRtl ? 'المدة' : 'Duration'}</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(v) => setFormData({ ...formData, duration: parseInt(v) as AppointmentDuration })}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>{isRtl ? 'نوع الموعد' : 'Type'}</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as AppointmentType })}
              >
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
          </div>

          <div className="space-y-2">
            <Label>{isRtl ? 'ملاحظات' : 'Notes'}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={isRtl ? 'ملاحظات إضافية...' : 'Additional notes...'}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={bookMutation.isPending || !formData.clientName || !formData.clientPhone}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {bookMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : null}
            {isRtl ? 'حجز الموعد' : 'Book Appointment'}
          </Button>
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
            {isRtl ? 'حدد الوقت الذي لا تريد استقبال مواعيد فيه' : 'Select the time you want to block'}
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
              />
            </div>
            {!formData.isAllDay && (
              <div className="space-y-2">
                <Label>{isRtl ? 'وقت البداية' : 'Start Time'}</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(v) => setFormData({ ...formData, startTime: v })}
                >
                  <SelectTrigger>
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
              />
            </div>
            {!formData.isAllDay && (
              <div className="space-y-2">
                <Label>{isRtl ? 'وقت النهاية' : 'End Time'}</Label>
                <Select
                  value={formData.endTime}
                  onValueChange={(v) => setFormData({ ...formData, endTime: v })}
                >
                  <SelectTrigger>
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
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-red-500 hover:bg-red-600"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : null}
            {isRtl ? 'حظر الوقت' : 'Block Time'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Add Availability Dialog ====================

function AddAvailabilityDialog({
  open,
  onOpenChange,
  isRtl,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRtl: boolean
}) {
  const createMutation = useCreateAvailability()
  const [formData, setFormData] = useState({
    dayOfWeek: 0 as DayOfWeek,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30 as AppointmentDuration,
    breakBetweenSlots: 0,
  })

  const handleSubmit = async () => {
    try {
      await createMutation.mutateAsync({
        ...formData,
        isActive: true,
      })
      toast.success(isRtl ? 'تم إضافة فترة التوفر' : 'Availability slot added')
      onOpenChange(false)
    } catch {
      toast.error(isRtl ? 'فشل في إضافة الفترة' : 'Failed to add slot')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isRtl ? 'إضافة فترة توفر' : 'Add Availability Slot'}</DialogTitle>
          <DialogDescription>
            {isRtl ? 'حدد الأيام والأوقات التي تكون فيها متاحًا' : 'Set the days and times you are available'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{isRtl ? 'اليوم' : 'Day'}</Label>
            <Select
              value={formData.dayOfWeek.toString()}
              onValueChange={(v) => setFormData({ ...formData, dayOfWeek: parseInt(v) as DayOfWeek })}
            >
              <SelectTrigger>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isRtl ? 'من' : 'From'}</Label>
              <Select
                value={formData.startTime}
                onValueChange={(v) => setFormData({ ...formData, startTime: v })}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>{isRtl ? 'إلى' : 'To'}</Label>
              <Select
                value={formData.endTime}
                onValueChange={(v) => setFormData({ ...formData, endTime: v })}
              >
                <SelectTrigger>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isRtl ? 'مدة الموعد' : 'Slot Duration'}</Label>
              <Select
                value={formData.slotDuration.toString()}
                onValueChange={(v) => setFormData({ ...formData, slotDuration: parseInt(v) as AppointmentDuration })}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>{isRtl ? 'فترة راحة (دقائق)' : 'Break (minutes)'}</Label>
              <Select
                value={formData.breakBetweenSlots.toString()}
                onValueChange={(v) => setFormData({ ...formData, breakBetweenSlots: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : null}
            {isRtl ? 'إضافة' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AppointmentsView

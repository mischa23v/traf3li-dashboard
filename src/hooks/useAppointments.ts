/**
 * Appointments Hooks
 * React Query hooks for appointment management
 *
 * خطافات المواعيد
 * خطافات React Query لإدارة المواعيد
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import appointmentsService, {
  type AvailabilitySlot,
  type BlockedTime,
  type Appointment,
  type AppointmentSettings,
  type AppointmentStatus,
  type CreateAvailabilityRequest,
  type UpdateAvailabilityRequest,
  type CreateBlockedTimeRequest,
  type BookAppointmentRequest,
  type UpdateAppointmentRequest,
  type GetAvailableSlotsRequest,
  type UpdateSettingsRequest,
} from '@/services/appointmentsService'

// ==================== Query Keys ====================

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,

  availability: ['appointments', 'availability'] as const,
  availabilityByLawyer: (lawyerId?: string) => [...appointmentKeys.availability, lawyerId] as const,

  blockedTimes: ['appointments', 'blocked-times'] as const,
  blockedTimesFiltered: (filters: Record<string, any>) => [...appointmentKeys.blockedTimes, filters] as const,

  availableSlots: ['appointments', 'available-slots'] as const,
  availableSlotsFiltered: (params: GetAvailableSlotsRequest) => [...appointmentKeys.availableSlots, params] as const,

  settings: ['appointments', 'settings'] as const,
  stats: ['appointments', 'stats'] as const,
  statsFiltered: (filters: Record<string, any>) => [...appointmentKeys.stats, filters] as const,
}

// ==================== Availability Hooks ====================

/**
 * Get lawyer's availability schedule
 * الحصول على جدول توفر المحامي
 */
export function useAvailability(lawyerId?: string) {
  return useQuery({
    queryKey: appointmentKeys.availabilityByLawyer(lawyerId),
    queryFn: () => appointmentsService.getAvailability(lawyerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Create availability slot
 * إنشاء فترة توفر
 */
export function useCreateAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAvailabilityRequest) => appointmentsService.createAvailability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availability })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
    },
  })
}

/**
 * Update availability slot
 * تحديث فترة التوفر
 */
export function useUpdateAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAvailabilityRequest }) =>
      appointmentsService.updateAvailability(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availability })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
    },
  })
}

/**
 * Delete availability slot
 * حذف فترة التوفر
 */
export function useDeleteAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => appointmentsService.deleteAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availability })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
    },
  })
}

/**
 * Bulk update availability
 * تحديث التوفر بالجملة
 */
export function useBulkUpdateAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slots: CreateAvailabilityRequest[]) => appointmentsService.bulkUpdateAvailability(slots),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availability })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
    },
  })
}

// ==================== Blocked Times Hooks ====================

/**
 * Get blocked times
 * الحصول على الأوقات المحجوبة
 */
export function useBlockedTimes(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: appointmentKeys.blockedTimesFiltered(params || {}),
    queryFn: () => appointmentsService.getBlockedTimes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Create blocked time
 * إنشاء وقت محجوب
 */
export function useCreateBlockedTime() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBlockedTimeRequest) => appointmentsService.createBlockedTime(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.blockedTimes })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
    },
  })
}

/**
 * Delete blocked time
 * حذف الوقت المحجوب
 */
export function useDeleteBlockedTime() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => appointmentsService.deleteBlockedTime(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.blockedTimes })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
    },
  })
}

// ==================== Appointments Hooks ====================

/**
 * Get appointments with filters
 * الحصول على المواعيد مع الفلاتر
 */
export function useAppointments(params?: {
  status?: AppointmentStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  clientId?: string
  caseId?: string
}) {
  return useQuery({
    queryKey: appointmentKeys.list(params || {}),
    queryFn: () => appointmentsService.getAppointments(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Get appointments with infinite scroll
 * الحصول على المواعيد مع التمرير اللانهائي
 */
export function useInfiniteAppointments(params?: {
  status?: AppointmentStatus
  startDate?: string
  endDate?: string
  limit?: number
  clientId?: string
  caseId?: string
}) {
  return useInfiniteQuery({
    queryKey: appointmentKeys.list({ ...params, infinite: true }),
    queryFn: ({ pageParam = 1 }) =>
      appointmentsService.getAppointments({ ...params, page: pageParam, limit: params?.limit || 20 }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 1 * 60 * 1000,
  })
}

/**
 * Get single appointment
 * الحصول على موعد واحد
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentsService.getAppointment(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Book appointment
 * حجز موعد
 */
export function useBookAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BookAppointmentRequest) => appointmentsService.bookAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

/**
 * Update appointment
 * تحديث الموعد
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentRequest }) =>
      appointmentsService.updateAppointment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

/**
 * Cancel appointment
 * إلغاء الموعد
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentsService.cancelAppointment(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

/**
 * Confirm appointment
 * تأكيد الموعد
 */
export function useConfirmAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => appointmentsService.confirmAppointment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

/**
 * Complete appointment
 * إكمال الموعد
 */
export function useCompleteAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      appointmentsService.completeAppointment(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

/**
 * Mark as no-show
 * وضع علامة عدم الحضور
 */
export function useMarkNoShow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => appointmentsService.markNoShow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

/**
 * Reschedule appointment
 * إعادة جدولة الموعد
 */
export function useRescheduleAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { date: string; startTime: string } }) =>
      appointmentsService.rescheduleAppointment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

// ==================== Available Slots Hook ====================

/**
 * Get available time slots for booking
 * الحصول على الفترات الزمنية المتاحة للحجز
 */
export function useAvailableSlots(params: GetAvailableSlotsRequest, enabled = true) {
  return useQuery({
    queryKey: appointmentKeys.availableSlotsFiltered(params),
    queryFn: () => appointmentsService.getAvailableSlots(params),
    enabled: enabled && !!params.lawyerId && !!params.startDate && !!params.endDate,
    staleTime: 1 * 60 * 1000, // 1 minute - slots can change quickly
  })
}

// ==================== Settings Hooks ====================

/**
 * Get appointment settings
 * الحصول على إعدادات المواعيد
 */
export function useAppointmentSettings() {
  return useQuery({
    queryKey: appointmentKeys.settings,
    queryFn: () => appointmentsService.getSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Update appointment settings
 * تحديث إعدادات المواعيد
 */
export function useUpdateAppointmentSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSettingsRequest) => appointmentsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.settings })
    },
  })
}

// ==================== Stats Hook ====================

/**
 * Get appointment statistics
 * الحصول على إحصائيات المواعيد
 */
export function useAppointmentStats(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: appointmentKeys.statsFiltered(params || {}),
    queryFn: () => appointmentsService.getStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

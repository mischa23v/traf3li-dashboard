/**
 * Appointments Hooks - Enterprise Edition
 * React Query hooks for appointment management
 *
 * خطافات المواعيد - النسخة المؤسسية
 * خطافات React Query لإدارة المواعيد
 *
 * Features:
 * - Primitive query keys for stable cache (Google/Apple standard)
 * - Smart retry with exponential backoff (Microsoft standard)
 * - Optimistic updates for instant feedback (SAP standard)
 * - Proper gcTime and staleTime configuration
 * - Placeholder data for smooth loading states
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
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
  type SlotsResponse,
  type AppointmentsResponse,
  type AppointmentResponse,
} from '@/services/appointmentsService'
import { queryRetryConfig, mutationRetryConfig } from '@/lib/query-retry-config'

// ==================== Data Normalization ====================

/**
 * Normalize appointment data from backend
 * Backend may return scheduledTime as ISO datetime, but frontend expects date/startTime/endTime
 * تطبيع بيانات الموعد من الخادم
 */
function normalizeAppointment(apt: any): Appointment {
  // Debug: Log ALL fields the backend returns
  console.log('[NORMALIZE] Raw appointment fields:', {
    id: apt.id,
    date: apt.date,
    startTime: apt.startTime,
    endTime: apt.endTime,
    scheduledTime: apt.scheduledTime,
    timeRange: apt.timeRange,
    // Check for any time-related fields
    time: apt.time,
    start: apt.start,
    end: apt.end,
    appointmentTime: apt.appointmentTime,
    allFields: Object.keys(apt),
  })

  // If date and startTime already exist and are valid, return as-is
  if (apt.date && apt.startTime && apt.startTime !== '00:00') {
    console.log(`[NORMALIZE] Using existing date/startTime: ${apt.date} ${apt.startTime}`)
    return apt
  }

  // If scheduledTime exists, extract date and time from it (use UTC to avoid timezone issues)
  if (apt.scheduledTime) {
    const scheduledDate = new Date(apt.scheduledTime)

    // Check if date is valid
    if (!isNaN(scheduledDate.getTime())) {
      const date = scheduledDate.toISOString().split('T')[0] // YYYY-MM-DD in UTC
      // Use UTC hours/minutes to match the stored time
      const hours = scheduledDate.getUTCHours().toString().padStart(2, '0')
      const minutes = scheduledDate.getUTCMinutes().toString().padStart(2, '0')
      const startTime = `${hours}:${minutes}` // HH:MM

      // Calculate endTime based on duration (default 30 min if not provided)
      const duration = apt.duration || 30
      const endDate = new Date(scheduledDate.getTime() + duration * 60000)
      const endHours = endDate.getUTCHours().toString().padStart(2, '0')
      const endMinutes = endDate.getUTCMinutes().toString().padStart(2, '0')
      const endTime = `${endHours}:${endMinutes}`

      console.log(`[NORMALIZE] Converted scheduledTime "${apt.scheduledTime}" → date: "${date}", startTime: "${startTime}", endTime: "${endTime}"`)

      return {
        ...apt,
        date,
        startTime,
        endTime: apt.endTime || endTime,
      }
    }
  }

  // If timeRange exists (alternative format from backend), extract times
  if (apt.timeRange) {
    const [startTime, endTime] = apt.timeRange.split(' - ')
    console.log(`[NORMALIZE] Extracted from timeRange "${apt.timeRange}" → startTime: "${startTime}", endTime: "${endTime}"`)
    return {
      ...apt,
      startTime: startTime || apt.startTime || '00:00',
      endTime: endTime || apt.endTime || '--:--',
    }
  }

  console.warn('[NORMALIZE] ⚠️ Appointment missing ALL time fields:', {
    id: apt.id,
    clientName: apt.clientName,
    availableFields: Object.keys(apt),
  })

  // Return with fallback values to prevent crashes
  return {
    ...apt,
    date: apt.date || new Date().toISOString().split('T')[0],
    startTime: apt.startTime || '00:00',
    endTime: apt.endTime || '--:--',
  }
}

/**
 * Normalize array of appointments
 */
function normalizeAppointments(appointments: any[]): Appointment[] {
  if (!Array.isArray(appointments)) {
    console.warn('[NORMALIZE] Expected array, got:', typeof appointments)
    return []
  }
  return appointments.map(normalizeAppointment)
}

// ==================== Filter Types (Strict, No Record<string, any>) ====================

export interface AppointmentFilters {
  status?: AppointmentStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  clientId?: string
  caseId?: string
}

export interface BlockedTimeFilters {
  startDate?: string
  endDate?: string
  targetLawyerId?: string
}

export interface StatsFilters {
  startDate?: string
  endDate?: string
}

// ==================== Query Keys (Primitive Values Only) ====================

export const appointmentKeys = {
  all: ['appointments'] as const,

  // Lists with primitive values for stable cache keys
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters?: AppointmentFilters) => [
    ...appointmentKeys.lists(),
    filters?.status ?? '',
    filters?.startDate ?? '',
    filters?.endDate ?? '',
    filters?.page ?? 1,
    filters?.limit ?? 20,
    filters?.clientId ?? '',
    filters?.caseId ?? '',
  ] as const,

  // Infinite list
  listInfinite: (filters?: AppointmentFilters) => [
    ...appointmentKeys.lists(),
    'infinite',
    filters?.status ?? '',
    filters?.startDate ?? '',
    filters?.endDate ?? '',
    filters?.limit ?? 20,
    filters?.clientId ?? '',
    filters?.caseId ?? '',
  ] as const,

  // Details
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,

  // Availability
  availability: ['appointments', 'availability'] as const,
  availabilityByLawyer: (lawyerId?: string) => [
    ...appointmentKeys.availability,
    lawyerId ?? '',
  ] as const,

  // Blocked times with primitive values
  blockedTimes: ['appointments', 'blocked-times'] as const,
  blockedTimesFiltered: (filters?: BlockedTimeFilters) => [
    ...appointmentKeys.blockedTimes,
    filters?.startDate ?? '',
    filters?.endDate ?? '',
    filters?.targetLawyerId ?? '',
  ] as const,

  // Available slots with primitive values
  availableSlots: ['appointments', 'available-slots'] as const,
  availableSlotsFiltered: (params: GetAvailableSlotsRequest) => [
    ...appointmentKeys.availableSlots,
    params.lawyerId ?? '',
    params.date,
    params.duration ?? 30,
  ] as const,

  // Settings
  settings: ['appointments', 'settings'] as const,

  // Stats with primitive values
  stats: ['appointments', 'stats'] as const,
  statsFiltered: (filters?: StatsFilters) => [
    ...appointmentKeys.stats,
    filters?.startDate ?? '',
    filters?.endDate ?? '',
  ] as const,
}

// ==================== Default Query Options ====================

const defaultQueryOptions = {
  ...queryRetryConfig,
  gcTime: 60 * 60 * 1000, // 1 hour garbage collection
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
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
    ...defaultQueryOptions,
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
    ...mutationRetryConfig,
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
    ...mutationRetryConfig,
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
    ...mutationRetryConfig,
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
    ...mutationRetryConfig,
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
export function useBlockedTimes(params?: BlockedTimeFilters) {
  return useQuery({
    queryKey: appointmentKeys.blockedTimesFiltered(params),
    queryFn: () => appointmentsService.getBlockedTimes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...defaultQueryOptions,
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
    ...mutationRetryConfig,
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
    ...mutationRetryConfig,
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
export function useAppointments(params?: AppointmentFilters) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: async () => {
      console.group('🔍 [QUERY-DEBUG] useAppointments queryFn called')
      console.log('⏰ Time:', new Date().toISOString())
      console.log('📋 Query Key:', JSON.stringify(appointmentKeys.list(params)))
      console.log('🔍 Params:', JSON.stringify(params))
      console.trace('📍 Call stack:')
      console.groupEnd()

      try {
        const result = await appointmentsService.getAppointments(params)

        // Normalize appointments to ensure date/startTime/endTime fields exist
        if (result?.data?.appointments) {
          console.log('[NORMALIZE] Processing', result.data.appointments.length, 'appointments')
          result.data.appointments = normalizeAppointments(result.data.appointments)
        }

        console.group('✅ [QUERY-DEBUG] useAppointments SUCCESS')
        console.log('⏰ Time:', new Date().toISOString())
        console.log('📊 Response Structure:', {
          success: result?.success,
          hasData: !!result?.data,
          appointmentsCount: result?.data?.appointments?.length ?? 'undefined',
          total: result?.data?.total,
          page: result?.data?.page,
          limit: result?.data?.limit,
        })
        if (result?.data?.appointments?.length > 0) {
          console.log('📝 First Appointment (normalized):', JSON.stringify(result.data.appointments[0], null, 2))
        }
        console.groupEnd()
        return result
      } catch (error: any) {
        console.group('❌ [QUERY-DEBUG] useAppointments ERROR')
        console.log('⏰ Time:', new Date().toISOString())
        console.error('💥 Error:', error)
        console.error('📋 Error Details:', {
          message: error?.message,
          status: error?.status || error?.response?.status,
        })
        console.groupEnd()
        throw error
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    placeholderData: (previousData) => previousData, // Keep previous data while refetching
    ...defaultQueryOptions,
  })
}

/**
 * Get appointments with infinite scroll
 * الحصول على المواعيد مع التمرير اللانهائي
 */
export function useInfiniteAppointments(params?: Omit<AppointmentFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: appointmentKeys.listInfinite(params),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await appointmentsService.getAppointments({ ...params, page: pageParam, limit: params?.limit || 20 })
      // Normalize appointments
      if (result?.data?.appointments) {
        result.data.appointments = normalizeAppointments(result.data.appointments)
      }
      return result
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.data) return undefined
      const { page, total, limit } = lastPage.data
      const totalPages = Math.ceil(total / limit)
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 1 * 60 * 1000,
    ...defaultQueryOptions,
  })
}

/**
 * Get single appointment
 * الحصول على موعد واحد
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: async () => {
      const result = await appointmentsService.getAppointment(id)
      // Normalize single appointment
      if (result?.data) {
        result.data = normalizeAppointment(result.data)
      }
      return result
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...defaultQueryOptions,
  })
}

/**
 * Book appointment
 * حجز موعد
 *
 * IMPORTANT: Uses onSettled instead of just onSuccess to handle edge cases where
 * the backend creates the appointment but returns 500 due to secondary failures
 * (e.g., email notification failed, calendar sync failed). This ensures the
 * appointment list is refreshed even on error, preventing "ghost" appointments
 * that exist in the database but don't show in the UI.
 */
export function useBookAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BookAppointmentRequest) => {
      console.group('📤 [MUTATION-DEBUG] bookAppointment mutationFn called')
      console.log('⏰ Time:', new Date().toISOString())
      console.log('📦 Request Data:', JSON.stringify(data, null, 2))
      console.groupEnd()

      try {
        const result = await appointmentsService.bookAppointment(data)
        console.group('✅ [MUTATION-DEBUG] bookAppointment SUCCESS')
        console.log('⏰ Time:', new Date().toISOString())
        console.log('📦 Response:', JSON.stringify(result, null, 2))
        console.groupEnd()
        return result
      } catch (error: any) {
        console.group('❌ [MUTATION-DEBUG] bookAppointment ERROR in mutationFn')
        console.log('⏰ Time:', new Date().toISOString())
        console.error('💥 Error:', error)
        console.error('📋 Error Details:', {
          message: error?.message,
          status: error?.status || error?.response?.status,
          data: error?.response?.data,
        })
        console.groupEnd()
        throw error
      }
    },
    // Don't retry POST mutations - they may have succeeded on server
    retry: false,

    onMutate: (variables) => {
      console.log('🔄 [MUTATION-DEBUG] onMutate called at:', new Date().toISOString())
      console.log('📦 Variables:', JSON.stringify(variables, null, 2))
    },

    onSuccess: (data, variables) => {
      console.group('✅ [MUTATION-DEBUG] onSuccess callback')
      console.log('⏰ Time:', new Date().toISOString())
      console.log('📦 Data:', JSON.stringify(data, null, 2))
      console.log('🔄 Invalidating queries...')
      console.groupEnd()

      // On success, invalidate immediately
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },

    onError: (error: any, variables) => {
      console.group('❌ [MUTATION-DEBUG] onError callback')
      console.log('⏰ Time:', new Date().toISOString())
      console.error('💥 Error:', error)
      console.error('📋 Error Details:', {
        message: error?.message,
        status: error?.status || error?.response?.status,
        code: error?.code,
      })
      console.log('📦 Variables that failed:', JSON.stringify(variables, null, 2))
      console.groupEnd()

      // On 500 error, the appointment might have been created but secondary
      // operations failed (email, calendar sync, etc.). Invalidate cache to
      // ensure any created appointment shows up.
      const status = error?.status || error?.response?.status
      if (status === 500) {
        console.log('⚠️ [MUTATION-DEBUG] 500 error detected - will invalidate after 1s')
        // Delay invalidation slightly to allow backend to commit
        setTimeout(() => {
          console.log('🔄 [MUTATION-DEBUG] Delayed invalidation for 500 error')
          queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
          queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
          queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
        }, 1000)
      }
    },

    // onSettled runs regardless of success/error - acts as safety net
    onSettled: (data, error) => {
      console.group('🏁 [MUTATION-DEBUG] onSettled callback')
      console.log('⏰ Time:', new Date().toISOString())
      console.log('📊 Result:', error ? 'ERROR' : 'SUCCESS')
      console.log('🔄 Scheduling delayed invalidation in 2s...')
      console.groupEnd()

      // Additional invalidation after a delay to catch any edge cases
      setTimeout(() => {
        console.log('🔄 [MUTATION-DEBUG] Delayed invalidation from onSettled')
        queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
        queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
      }, 2000)
    },
  })
}

/**
 * Update appointment with optimistic update
 * تحديث الموعد مع تحديث متفائل
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentRequest }) =>
      appointmentsService.updateAppointment(id, data),
    ...mutationRetryConfig,

    // Optimistic update for instant feedback
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: appointmentKeys.detail(id) })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<AppointmentResponse>(appointmentKeys.detail(id))

      // Optimistically update the appointment
      if (previousData?.data) {
        queryClient.setQueryData<AppointmentResponse>(appointmentKeys.detail(id), {
          ...previousData,
          data: { ...previousData.data, ...data, updatedAt: new Date().toISOString() },
        })
      }

      return { previousData }
    },

    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(appointmentKeys.detail(id), context.previousData)
      }
      toast.error('فشل في تحديث الموعد | Failed to update appointment')
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

/**
 * Cancel appointment with optimistic update
 * إلغاء الموعد مع تحديث متفائل
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentsService.cancelAppointment(id, reason),
    ...mutationRetryConfig,

    // Optimistic update for instant feedback
    onMutate: async ({ id, reason }) => {
      await queryClient.cancelQueries({ queryKey: appointmentKeys.detail(id) })

      const previousDetail = queryClient.getQueryData<AppointmentResponse>(appointmentKeys.detail(id))
      const previousLists = queryClient.getQueriesData<AppointmentsResponse>({ queryKey: appointmentKeys.lists() })

      // Optimistically update detail
      if (previousDetail?.data) {
        queryClient.setQueryData<AppointmentResponse>(appointmentKeys.detail(id), {
          ...previousDetail,
          data: {
            ...previousDetail.data,
            status: 'cancelled' as AppointmentStatus,
            cancelledAt: new Date().toISOString(),
            cancellationReason: reason,
          },
        })
      }

      // Optimistically update lists
      previousLists.forEach(([key, data]) => {
        if (data?.data?.appointments) {
          queryClient.setQueryData<AppointmentsResponse>(key, {
            ...data,
            data: {
              ...data.data,
              appointments: data.data.appointments.map((apt) =>
                apt.id === id ? { ...apt, status: 'cancelled' as AppointmentStatus } : apt
              ),
            },
          })
        }
      })

      return { previousDetail, previousLists }
    },

    onError: (error, { id }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(appointmentKeys.detail(id), context.previousDetail)
      }
      context?.previousLists?.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data)
      })
      toast.error('فشل في إلغاء الموعد | Failed to cancel appointment')
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

/**
 * Confirm appointment with optimistic update
 * تأكيد الموعد مع تحديث متفائل
 */
export function useConfirmAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => appointmentsService.confirmAppointment(id),
    ...mutationRetryConfig,

    // Optimistic update for instant feedback (Google Calendar standard)
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: appointmentKeys.detail(id) })

      const previousDetail = queryClient.getQueryData<AppointmentResponse>(appointmentKeys.detail(id))
      const previousLists = queryClient.getQueriesData<AppointmentsResponse>({ queryKey: appointmentKeys.lists() })

      // Optimistically update detail
      if (previousDetail?.data) {
        queryClient.setQueryData<AppointmentResponse>(appointmentKeys.detail(id), {
          ...previousDetail,
          data: { ...previousDetail.data, status: 'confirmed' as AppointmentStatus },
        })
      }

      // Optimistically update all lists
      previousLists.forEach(([key, data]) => {
        if (data?.data?.appointments) {
          queryClient.setQueryData<AppointmentsResponse>(key, {
            ...data,
            data: {
              ...data.data,
              appointments: data.data.appointments.map((apt) =>
                apt.id === id ? { ...apt, status: 'confirmed' as AppointmentStatus } : apt
              ),
            },
          })
        }
      })

      return { previousDetail, previousLists }
    },

    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousDetail) {
        queryClient.setQueryData(appointmentKeys.detail(id), context.previousDetail)
      }
      context?.previousLists?.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data)
      })
      toast.error('فشل في تأكيد الموعد | Failed to confirm appointment')
    },

    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

/**
 * Complete appointment with optimistic update
 * إكمال الموعد مع تحديث متفائل
 */
export function useCompleteAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      appointmentsService.completeAppointment(id, notes),
    ...mutationRetryConfig,

    // Optimistic update for instant feedback
    onMutate: async ({ id, notes }) => {
      await queryClient.cancelQueries({ queryKey: appointmentKeys.detail(id) })

      const previousDetail = queryClient.getQueryData<AppointmentResponse>(appointmentKeys.detail(id))
      const previousLists = queryClient.getQueriesData<AppointmentsResponse>({ queryKey: appointmentKeys.lists() })

      // Optimistically update detail
      if (previousDetail?.data) {
        queryClient.setQueryData<AppointmentResponse>(appointmentKeys.detail(id), {
          ...previousDetail,
          data: {
            ...previousDetail.data,
            status: 'completed' as AppointmentStatus,
            notes: notes || previousDetail.data.notes,
          },
        })
      }

      // Optimistically update lists
      previousLists.forEach(([key, data]) => {
        if (data?.data?.appointments) {
          queryClient.setQueryData<AppointmentsResponse>(key, {
            ...data,
            data: {
              ...data.data,
              appointments: data.data.appointments.map((apt) =>
                apt.id === id ? { ...apt, status: 'completed' as AppointmentStatus } : apt
              ),
            },
          })
        }
      })

      return { previousDetail, previousLists }
    },

    onError: (error, { id }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(appointmentKeys.detail(id), context.previousDetail)
      }
      context?.previousLists?.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data)
      })
      toast.error('فشل في إكمال الموعد | Failed to complete appointment')
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

/**
 * Mark as no-show with optimistic update
 * وضع علامة عدم الحضور مع تحديث متفائل
 */
export function useMarkNoShow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => appointmentsService.markNoShow(id),
    ...mutationRetryConfig,

    // Optimistic update for instant feedback
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: appointmentKeys.detail(id) })

      const previousDetail = queryClient.getQueryData<AppointmentResponse>(appointmentKeys.detail(id))
      const previousLists = queryClient.getQueriesData<AppointmentsResponse>({ queryKey: appointmentKeys.lists() })

      // Optimistically update detail
      if (previousDetail?.data) {
        queryClient.setQueryData<AppointmentResponse>(appointmentKeys.detail(id), {
          ...previousDetail,
          data: { ...previousDetail.data, status: 'no_show' as AppointmentStatus },
        })
      }

      // Optimistically update lists
      previousLists.forEach(([key, data]) => {
        if (data?.data?.appointments) {
          queryClient.setQueryData<AppointmentsResponse>(key, {
            ...data,
            data: {
              ...data.data,
              appointments: data.data.appointments.map((apt) =>
                apt.id === id ? { ...apt, status: 'no_show' as AppointmentStatus } : apt
              ),
            },
          })
        }
      })

      return { previousDetail, previousLists }
    },

    onError: (error, id, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(appointmentKeys.detail(id), context.previousDetail)
      }
      context?.previousLists?.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data)
      })
      toast.error('فشل في وضع علامة عدم الحضور | Failed to mark as no-show')
    },

    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

/**
 * Reschedule appointment with optimistic update
 * إعادة جدولة الموعد مع تحديث متفائل
 */
export function useRescheduleAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { date: string; startTime: string } }) =>
      appointmentsService.rescheduleAppointment(id, data),
    ...mutationRetryConfig,

    // Optimistic update for instant feedback
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: appointmentKeys.detail(id) })

      const previousDetail = queryClient.getQueryData<AppointmentResponse>(appointmentKeys.detail(id))

      // Optimistically update detail
      if (previousDetail?.data) {
        queryClient.setQueryData<AppointmentResponse>(appointmentKeys.detail(id), {
          ...previousDetail,
          data: {
            ...previousDetail.data,
            date: data.date,
            startTime: data.startTime,
            updatedAt: new Date().toISOString(),
          },
        })
      }

      return { previousDetail }
    },

    onError: (error, { id }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(appointmentKeys.detail(id), context.previousDetail)
      }
      toast.error('فشل في إعادة جدولة الموعد | Failed to reschedule appointment')
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.availableSlots })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

// ==================== Bulk Operations (Enterprise Feature) ====================

/**
 * Bulk confirm appointments
 * تأكيد مواعيد متعددة
 */
export function useBulkConfirmAppointments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) => appointmentsService.confirmAppointment(id))
      )
      const successful = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.filter((r) => r.status === 'rejected').length
      return { successful, failed, total: ids.length }
    },
    ...mutationRetryConfig,

    onMutate: async (ids) => {
      const previousLists = queryClient.getQueriesData<AppointmentsResponse>({ queryKey: appointmentKeys.lists() })

      // Optimistically update all lists
      previousLists.forEach(([key, data]) => {
        if (data?.data?.appointments) {
          queryClient.setQueryData<AppointmentsResponse>(key, {
            ...data,
            data: {
              ...data.data,
              appointments: data.data.appointments.map((apt) =>
                ids.includes(apt.id) ? { ...apt, status: 'confirmed' as AppointmentStatus } : apt
              ),
            },
          })
        }
      })

      return { previousLists }
    },

    onError: (error, ids, context) => {
      context?.previousLists?.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data)
      })
      toast.error('فشل في تأكيد بعض المواعيد | Failed to confirm some appointments')
    },

    onSuccess: (result) => {
      if (result.failed > 0) {
        toast.warning(`تم تأكيد ${result.successful} من ${result.total} مواعيد | Confirmed ${result.successful} of ${result.total} appointments`)
      } else {
        toast.success(`تم تأكيد ${result.successful} مواعيد بنجاح | Successfully confirmed ${result.successful} appointments`)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.stats })
    },
  })
}

/**
 * Bulk complete appointments
 * إكمال مواعيد متعددة
 */
export function useBulkCompleteAppointments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map((id) => appointmentsService.completeAppointment(id))
      )
      const successful = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.filter((r) => r.status === 'rejected').length
      return { successful, failed, total: ids.length }
    },
    ...mutationRetryConfig,

    onMutate: async (ids) => {
      const previousLists = queryClient.getQueriesData<AppointmentsResponse>({ queryKey: appointmentKeys.lists() })

      previousLists.forEach(([key, data]) => {
        if (data?.data?.appointments) {
          queryClient.setQueryData<AppointmentsResponse>(key, {
            ...data,
            data: {
              ...data.data,
              appointments: data.data.appointments.map((apt) =>
                ids.includes(apt.id) ? { ...apt, status: 'completed' as AppointmentStatus } : apt
              ),
            },
          })
        }
      })

      return { previousLists }
    },

    onError: (error, ids, context) => {
      context?.previousLists?.forEach(([key, data]) => {
        if (data) queryClient.setQueryData(key, data)
      })
      toast.error('فشل في إكمال بعض المواعيد | Failed to complete some appointments')
    },

    onSuccess: (result) => {
      if (result.failed > 0) {
        toast.warning(`تم إكمال ${result.successful} من ${result.total} مواعيد | Completed ${result.successful} of ${result.total} appointments`)
      } else {
        toast.success(`تم إكمال ${result.successful} مواعيد بنجاح | Successfully completed ${result.successful} appointments`)
      }
    },

    onSettled: () => {
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
    enabled: enabled && !!params.date,
    staleTime: 1 * 60 * 1000, // 1 minute - slots can change quickly
    placeholderData: (previousData) => previousData,
    ...defaultQueryOptions,
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
    ...defaultQueryOptions,
  })
}

/**
 * Update appointment settings with optimistic update
 * تحديث إعدادات المواعيد مع تحديث متفائل
 */
export function useUpdateAppointmentSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSettingsRequest) => appointmentsService.updateSettings(data),
    ...mutationRetryConfig,

    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: appointmentKeys.settings })

      const previousSettings = queryClient.getQueryData(appointmentKeys.settings)

      // Optimistically update settings
      queryClient.setQueryData(appointmentKeys.settings, (old: any) => ({
        ...old,
        data: { ...old?.data, ...data },
      }))

      return { previousSettings }
    },

    onError: (error, data, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(appointmentKeys.settings, context.previousSettings)
      }
      toast.error('فشل في تحديث الإعدادات | Failed to update settings')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.settings })
    },
  })
}

// ==================== Stats Hook ====================

/**
 * Get appointment statistics
 * الحصول على إحصائيات المواعيد
 */
export function useAppointmentStats(params?: StatsFilters) {
  return useQuery({
    queryKey: appointmentKeys.statsFiltered(params),
    queryFn: () => appointmentsService.getStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
    ...defaultQueryOptions,
  })
}

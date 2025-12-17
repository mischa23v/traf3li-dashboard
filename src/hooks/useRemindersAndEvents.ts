/**
 * Reminders and Events Hooks
 * TanStack Query hooks for reminders and events
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import remindersService, {
  ReminderFilters,
  CreateReminderData,
  Reminder,
} from '@/services/remindersService'
import eventsService, {
  EventFilters,
  CreateEventData,
  Event,
} from '@/services/eventsService'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/lib/apiClient'

// ==================== Cache Configuration ====================
// Cache data for 30 minutes to reduce API calls
// Data is refreshed automatically when reminders/events are created/updated/deleted
const STATS_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const STATS_GC_TIME = 60 * 60 * 1000 // 1 hour (keep in cache)
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes for lists (more dynamic)

// ==================== REMINDERS ====================

export const useReminders = (filters?: ReminderFilters) => {
  return useQuery({
    queryKey: ['reminders', filters],
    queryFn: () => remindersService.getReminders(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useReminder = (id: string) => {
  return useQuery({
    queryKey: ['reminders', id],
    queryFn: () => remindersService.getReminder(id),
    enabled: !!id,
    staleTime: LIST_STALE_TIME,
  })
}

export const useCreateReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReminderData) =>
      remindersService.createReminder(data),
    // Update cache on success - instant appearance in list
    onSuccess: (data) => {
      toast.success('تم إنشاء التذكير بنجاح')

      // Manually update the cache with the REAL reminder from server
      queryClient.setQueriesData({ queryKey: ['reminders'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...] } structure (API response format)
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: [data, ...old.data],
            total: (old.total || old.data.length) + 1
          }
        }

        // Handle { reminders: [...] } structure
        if (old.reminders && Array.isArray(old.reminders)) {
          return {
            ...old,
            reminders: [data, ...old.reminders],
            total: (old.total || old.reminders.length) + 1
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return [data, ...old]
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء التذكير')
    },
  })
}

// ... (skipping update/delete for brevity, but ideally should be updated too)

export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventData) => eventsService.createEvent(data),
    // Update cache on success - instant appearance in list
    onSuccess: (data) => {
      toast.success('تم إنشاء الحدث بنجاح')

      // Manually update the cache with the REAL event from server
      queryClient.setQueriesData({ queryKey: ['events'] }, (old: any) => {
        if (!old) return old

        // Handle { events: [...] } structure
        if (old.events && Array.isArray(old.events)) {
          return {
            ...old,
            events: [data, ...old.events],
            total: (old.total || old.events.length) + 1
          }
        }

        // Handle { data: [...] } structure (API response format)
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: [data, ...old.data],
            total: (old.total || old.data.length) + 1
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return [data, ...old]
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الحدث')
    },
  })
}

export const useUpdateReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReminderData> }) =>
      remindersService.updateReminder(id, data),
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['reminders'] })

      const previousQueries = queryClient.getQueriesData({ queryKey: ['reminders'] })
      const previousReminder = queryClient.getQueryData(['reminders', id])

      queryClient.setQueriesData({ queryKey: ['reminders'] }, (old: any) => {
        if (!old) return old

        const list = Array.isArray(old) ? old : (old.reminders || old.data || [])
        const updatedList = list.map((item: any) => item._id === id ? { ...item, ...data } : item)

        if (Array.isArray(old)) {
          return updatedList
        }

        return {
          ...old,
          reminders: updatedList
        }
      })

      if (previousReminder) {
        queryClient.setQueryData(['reminders', id], { ...previousReminder, ...data })
      }

      return { previousQueries, previousReminder }
    },
    onSuccess: () => {
      toast.success('تم تحديث التذكير بنجاح')
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousReminder) {
        queryClient.setQueryData(['reminders', id], context.previousReminder)
      }
      toast.error(error.message || 'فشل تحديث التذكير')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
      await queryClient.invalidateQueries({ queryKey: ['reminders', id] })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useDeleteReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => remindersService.deleteReminder(id),
    // Update cache on success - instant removal from list
    onSuccess: (_, id) => {
      toast.success('تم حذف التذكير بنجاح')

      // Optimistically remove reminder from all lists
      queryClient.setQueriesData({ queryKey: ['reminders'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...] } structure (API response format)
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.data.length) - 1)
          }
        }

        // Handle { reminders: [...] } structure
        if (old.reminders && Array.isArray(old.reminders)) {
          return {
            ...old,
            reminders: old.reminders.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.reminders.length) - 1)
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return old.filter((item: any) => item._id !== id)
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف التذكير')
    },
  })
}

export const useUpcomingReminders = (days: number = 7, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['reminders', 'upcoming', days],
    queryFn: () => remindersService.getUpcoming(days),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useOverdueReminders = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['reminders', 'overdue'],
    queryFn: () => remindersService.getOverdue(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useReminderStats = (options?: { assignedTo?: string; dateFrom?: string; dateTo?: string; enabled?: boolean }) => {
  const { enabled = true, ...filters } = options || {}
  const hasFilters = Object.keys(filters).length > 0
  return useQuery({
    queryKey: ['reminders', 'stats', hasFilters ? filters : undefined],
    queryFn: () => remindersService.getStats(hasFilters ? filters : undefined),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useCompleteReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => remindersService.completeReminder(id),
    onSuccess: () => {
      toast.success('تم إكمال التذكير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال التذكير')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
      await queryClient.invalidateQueries({ queryKey: ['reminders', id] })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useDismissReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => remindersService.dismissReminder(id),
    onSuccess: () => {
      toast.success('تم تجاهل التذكير')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تجاهل التذكير')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
      await queryClient.invalidateQueries({ queryKey: ['reminders', id] })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useSnoozeReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, duration }: { id: string; duration: number }) =>
      remindersService.snoozeReminder(id, { minutes: duration }),
    onSuccess: () => {
      toast.success('تم تأجيل التذكير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تأجيل التذكير')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
      await queryClient.invalidateQueries({ queryKey: ['reminders', id] })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useReopenReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => remindersService.reopenReminder(id),
    onSuccess: () => {
      toast.success('تم إعادة فتح التذكير')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إعادة فتح التذكير')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
      await queryClient.invalidateQueries({ queryKey: ['reminders', id] })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useDelegateReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, delegateTo, note }: { id: string; delegateTo: string; note?: string }) =>
      remindersService.delegateReminder(id, delegateTo, note),
    onSuccess: () => {
      toast.success('تم تفويض التذكير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تفويض التذكير')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
      await queryClient.invalidateQueries({ queryKey: ['reminders', id] })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

// ==================== EVENTS ====================

export const useEvents = (filters?: EventFilters) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsService.getEvents(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventsService.getEvent(id),
    enabled: !!id,
  })
}



export const useUpdateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventData> }) =>
      eventsService.updateEvent(id, data),
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['events'] })

      const previousQueries = queryClient.getQueriesData({ queryKey: ['events'] })
      const previousEvent = queryClient.getQueryData(['events', id])

      queryClient.setQueriesData({ queryKey: ['events'] }, (old: any) => {
        if (!old) return old

        const list = Array.isArray(old) ? old : (old.events || old.data || [])
        const updatedList = list.map((item: any) => item._id === id ? { ...item, ...data } : item)

        if (Array.isArray(old)) {
          return updatedList
        }

        return {
          ...old,
          events: updatedList
        }
      })

      if (previousEvent) {
        queryClient.setQueryData(['events', id], { ...previousEvent, ...data })
      }

      return { previousQueries, previousEvent }
    },
    onSuccess: () => {
      toast.success('تم تحديث الحدث بنجاح')
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousEvent) {
        queryClient.setQueryData(['events', id], context.previousEvent)
      }
      toast.error(error.message || 'فشل تحديث الحدث')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['events', id] })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => eventsService.deleteEvent(id),
    // Update cache on success - instant removal from list
    onSuccess: (_, id) => {
      toast.success('تم حذف الحدث بنجاح')

      // Optimistically remove event from all lists
      queryClient.setQueriesData({ queryKey: ['events'] }, (old: any) => {
        if (!old) return old

        // Handle { events: [...] } structure
        if (old.events && Array.isArray(old.events)) {
          return {
            ...old,
            events: old.events.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.events.length) - 1)
          }
        }

        // Handle { data: [...] } structure (API response format)
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.data.length) - 1)
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return old.filter((item: any) => item._id !== id)
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الحدث')
    },
  })
}

export const useCompleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, minutesNotes }: { id: string; minutesNotes?: string }) =>
      eventsService.completeEvent(id, minutesNotes),
    onSuccess: () => {
      toast.success('تم إكمال الحدث بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال الحدث')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['events', id] })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useCancelEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      eventsService.cancelEvent(id, reason),
    onSuccess: () => {
      toast.success('تم إلغاء الحدث بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء الحدث')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['events', id] })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const usePostponeEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newDateTime, reason }: { id: string; newDateTime: string; reason?: string }) =>
      eventsService.postponeEvent(id, newDateTime, reason),
    onSuccess: () => {
      toast.success('تم تأجيل الحدث بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تأجيل الحدث')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['events', id] })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useRSVPEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: 'accepted' | 'declined' | 'tentative'; notes?: string }) =>
      eventsService.rsvpToEvent(id, { status, note: notes }),
    onSuccess: () => {
      toast.success('تم تسجيل الحضور بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل الحضور')
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['events', id] })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useUpcomingEvents = (days: number = 7, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['events', 'upcoming', days],
    queryFn: () => eventsService.getUpcoming(days),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useEventStats = (filters?: { dateFrom?: string; dateTo?: string; caseId?: string }, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['events', 'stats', filters],
    queryFn: () => eventsService.getStats(filters),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useCheckAvailability = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attendeeIds, startDate, endDate }: { attendeeIds: string[]; startDate: string; endDate: string }) =>
      eventsService.checkAvailability(attendeeIds, startDate, endDate),
    onError: (error: Error) => {
      toast.error(error.message || 'فشل التحقق من التوفر')
    },
  })
}

// ==================== BULK OPERATIONS ====================

export const useBulkUpdateReminders = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reminderIds, data }: { reminderIds: string[]; data: Partial<CreateReminderData> }) =>
      remindersService.bulkUpdate(reminderIds, data),
    onSuccess: () => {
      toast.success('تم تحديث التذكيرات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث التذكيرات')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useBulkDeleteReminders = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reminderIds: string[]) => remindersService.bulkDelete(reminderIds),
    onSuccess: () => {
      toast.success('تم حذف التذكيرات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف التذكيرات')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useBulkCompleteReminders = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reminderIds: string[]) => remindersService.bulkComplete(reminderIds),
    onSuccess: () => {
      toast.success('تم إكمال التذكيرات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال التذكيرات')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reminders'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useBulkUpdateEvents = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventIds, data }: { eventIds: string[]; data: Partial<CreateEventData> }) =>
      eventsService.bulkUpdate(eventIds, data),
    onSuccess: () => {
      toast.success('تم تحديث الأحداث بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الأحداث')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useBulkDeleteEvents = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventIds: string[]) => eventsService.bulkDelete(eventIds),
    onSuccess: () => {
      toast.success('تم حذف الأحداث بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الأحداث')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useBulkCancelEvents = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventIds, reason }: { eventIds: string[]; reason?: string }) =>
      eventsService.bulkCancel(eventIds, reason),
    onSuccess: () => {
      toast.success('تم إلغاء الأحداث بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء الأحداث')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

// ==================== AGGREGATED EVENTS WITH STATS ====================
// Single API call for events list + stats

export interface EventsWithStats {
  events: Event[]
  stats: {
    total: number
    upcoming: number
    past: number
    today: number
    byType: {
      meeting: number
      session: number
      deadline: number
    }
  }
}

export const useEventsWithStats = (filters: EventFilters = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery<EventsWithStats>({
    queryKey: ['events', 'with-stats', filters],
    queryFn: async () => {
      const response = await apiClient.get('/events', {
        params: { ...filters, includeStats: true }
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: isAuthenticated,
    retry: false,
  })
}

// ==================== AGGREGATED REMINDERS WITH STATS ====================
// Single API call for reminders list + stats

export interface RemindersWithStats {
  reminders: Reminder[]
  stats: {
    total: number
    pending: number
    completed: number
    snoozed: number
    overdue: number
  }
}

export const useRemindersWithStats = (filters: ReminderFilters = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery<RemindersWithStats>({
    queryKey: ['reminders', 'with-stats', filters],
    queryFn: async () => {
      const response = await apiClient.get('/reminders', {
        params: { ...filters, includeStats: true }
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: isAuthenticated,
    retry: false,
  })
}

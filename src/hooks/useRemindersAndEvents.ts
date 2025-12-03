/**
 * Reminders and Events Hooks
 * TanStack Query hooks for reminders and events
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import remindersService, {
  ReminderFilters,
  CreateReminderData,
} from '@/services/remindersService'
import eventsService, {
  EventFilters,
  CreateEventData,
} from '@/services/eventsService'

// ==================== REMINDERS ====================

export const useReminders = (filters?: ReminderFilters) => {
  return useQuery({
    queryKey: ['reminders', filters],
    queryFn: () => remindersService.getReminders(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useReminder = (id: string) => {
  return useQuery({
    queryKey: ['reminders', id],
    queryFn: () => remindersService.getReminder(id),
    enabled: !!id,
  })
}

export const useCreateReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReminderData) =>
      remindersService.createReminder(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء التذكير بنجاح')

      // Manually update the cache with the REAL reminder from server
      queryClient.setQueriesData({ queryKey: ['reminders'] }, (old: any) => {
        if (!old) return old

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
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['reminders'], refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'], refetchType: 'all' })
    },
  })
}

// ... (skipping update/delete for brevity, but ideally should be updated too)

export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventData) => eventsService.createEvent(data),
    // Update cache on success (Stable & Correct)
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
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'], refetchType: 'all' })
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
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast.success('تم حذف التذكير بنجاح')

      // Optimistically remove reminder from all lists
      queryClient.setQueriesData({ queryKey: ['reminders'] }, (old: any) => {
        if (!old) return old

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
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['reminders'], refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'], refetchType: 'all' })
    },
  })
}

export const useUpcomingReminders = (days: number = 7) => {
  return useQuery({
    queryKey: ['reminders', 'upcoming', days],
    queryFn: () => remindersService.getUpcoming(days),
    staleTime: 1 * 60 * 1000,
  })
}

export const useOverdueReminders = () => {
  return useQuery({
    queryKey: ['reminders', 'overdue'],
    queryFn: () => remindersService.getOverdue(),
    staleTime: 1 * 60 * 1000,
  })
}

export const useReminderStats = (filters?: { assignedTo?: string; dateFrom?: string; dateTo?: string }) => {
  return useQuery({
    queryKey: ['reminders', 'stats', filters],
    queryFn: () => remindersService.getStats(filters),
    staleTime: 5 * 60 * 1000,
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
    staleTime: 2 * 60 * 1000,
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
    // Update cache on success (Stable & Correct)
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
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'all' })
      return await queryClient.invalidateQueries({ queryKey: ['calendar'], refetchType: 'all' })
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

export const useUpcomingEvents = (days: number = 7) => {
  return useQuery({
    queryKey: ['events', 'upcoming', days],
    queryFn: () => eventsService.getUpcoming(days),
    staleTime: 1 * 60 * 1000,
  })
}

export const useEventStats = (filters?: { dateFrom?: string; dateTo?: string; caseId?: string }) => {
  return useQuery({
    queryKey: ['events', 'stats', filters],
    queryFn: () => eventsService.getStats(filters),
    staleTime: 5 * 60 * 1000,
  })
}

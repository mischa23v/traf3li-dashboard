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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم إنشاء التذكير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء التذكير')
    },
  })
}

export const useUpdateReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReminderData> }) =>
      remindersService.updateReminder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['reminders', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم تحديث التذكير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث التذكير')
    },
  })
}

export const useDeleteReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => remindersService.deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم حذف التذكير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف التذكير')
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

export const useCompleteReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => remindersService.completeReminder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['reminders', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم إكمال التذكير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال التذكير')
    },
  })
}

export const useDismissReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => remindersService.dismissReminder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['reminders', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم تجاهل التذكير')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تجاهل التذكير')
    },
  })
}

export const useSnoozeReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, duration }: { id: string; duration: number }) =>
      remindersService.snoozeReminder(id, duration),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['reminders', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم تأجيل التذكير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تأجيل التذكير')
    },
  })
}

export const useReopenReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => remindersService.reopenReminder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] })
      queryClient.invalidateQueries({ queryKey: ['reminders', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم إعادة فتح التذكير')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إعادة فتح التذكير')
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

export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventData) => eventsService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم إنشاء الحدث بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الحدث')
    },
  })
}

export const useUpdateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventData> }) =>
      eventsService.updateEvent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم تحديث الحدث بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الحدث')
    },
  })
}

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => eventsService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم حذف الحدث بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الحدث')
    },
  })
}

export const useCompleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => eventsService.completeEvent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم إكمال الحدث بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال الحدث')
    },
  })
}

export const useCancelEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      eventsService.cancelEvent(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم إلغاء الحدث بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء الحدث')
    },
  })
}

export const useRSVPEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: 'accepted' | 'declined' | 'tentative'; notes?: string }) =>
      eventsService.rsvpEvent(id, status, notes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', id] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('تم تسجيل الحضور بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل الحضور')
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

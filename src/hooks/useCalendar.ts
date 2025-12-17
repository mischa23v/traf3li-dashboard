/**
 * Calendar Hooks
 * TanStack Query hooks for calendar operations
 */

import { useQuery } from '@tanstack/react-query'
import calendarService, { CalendarFilters } from '@/services/calendarService'

// ==================== Cache Configuration ====================
// Cache data for 30 minutes to reduce API calls
// Data is refreshed automatically when tasks/reminders/events are created/updated/deleted
const CALENDAR_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const CALENDAR_GC_TIME = 60 * 60 * 1000 // 1 hour (keep in cache)

/**
 * Get unified calendar view
 */
export const useCalendar = (filters: CalendarFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['calendar', filters],
    queryFn: () => calendarService.getCalendar(filters),
    staleTime: CALENDAR_STALE_TIME,
    gcTime: CALENDAR_GC_TIME,
    enabled: enabled && !!(filters.startDate && filters.endDate),
    retry: 1,
  })
}

/**
 * Get calendar by specific date
 */
export const useCalendarByDate = (date: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['calendar', 'date', date],
    queryFn: () => calendarService.getCalendarByDate(date),
    staleTime: CALENDAR_STALE_TIME,
    gcTime: CALENDAR_GC_TIME,
    enabled: enabled && !!date,
    retry: 1,
  })
}

/**
 * Get calendar by month
 */
export const useCalendarByMonth = (year: number, month: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['calendar', 'month', year, month],
    queryFn: () => calendarService.getCalendarByMonth(year, month),
    staleTime: CALENDAR_STALE_TIME,
    gcTime: CALENDAR_GC_TIME,
    enabled: enabled && !!(year && month),
    retry: 1,
  })
}

/**
 * Get upcoming items
 */
export const useUpcomingCalendar = (days: number = 7, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['calendar', 'upcoming', days],
    queryFn: () => calendarService.getUpcoming(days),
    staleTime: CALENDAR_STALE_TIME,
    gcTime: CALENDAR_GC_TIME,
    enabled,
    retry: 1,
  })
}

/**
 * Get overdue items
 */
export const useOverdueCalendar = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['calendar', 'overdue'],
    queryFn: () => calendarService.getOverdue(),
    staleTime: CALENDAR_STALE_TIME,
    gcTime: CALENDAR_GC_TIME,
    enabled,
    retry: 1,
  })
}

/**
 * Get calendar statistics
 */
export const useCalendarStats = (filters?: {
  startDate?: string
  endDate?: string
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['calendar', 'stats', filters],
    queryFn: () => calendarService.getStats(filters),
    staleTime: CALENDAR_STALE_TIME,
    gcTime: CALENDAR_GC_TIME,
    enabled,
    retry: 1,
  })
}

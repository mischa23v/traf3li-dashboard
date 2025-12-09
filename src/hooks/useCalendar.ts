/**
 * Calendar Hooks
 * TanStack Query hooks for calendar operations
 */

import { useQuery } from '@tanstack/react-query'
import calendarService, { CalendarFilters } from '@/services/calendarService'

/**
 * Get unified calendar view
 */
export const useCalendar = (filters: CalendarFilters) => {
  // ============ DEBUG LOGGING ============
  console.log('%c[useCalendar] Hook called with:', 'color: #f80; font-weight: bold;', {
    filters,
    filtersStringified: JSON.stringify(filters),
    enabled: !!(filters.startDate && filters.endDate),
  })
  // ============ DEBUG END ============

  return useQuery({
    queryKey: ['calendar', filters],
    queryFn: () => {
      console.log('%c[useCalendar] queryFn EXECUTING', 'background: #f80; color: #000;', { filters })
      return calendarService.getCalendar(filters)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!(filters.startDate && filters.endDate),
    retry: 1,
  })
}

/**
 * Get calendar by specific date
 */
export const useCalendarByDate = (date: string) => {
  return useQuery({
    queryKey: ['calendar', 'date', date],
    queryFn: () => calendarService.getCalendarByDate(date),
    staleTime: 2 * 60 * 1000,
    enabled: !!date,
    retry: 1,
  })
}

/**
 * Get calendar by month
 */
export const useCalendarByMonth = (year: number, month: number) => {
  return useQuery({
    queryKey: ['calendar', 'month', year, month],
    queryFn: () => calendarService.getCalendarByMonth(year, month),
    staleTime: 2 * 60 * 1000,
    enabled: !!(year && month),
    retry: 1,
  })
}

/**
 * Get upcoming items
 */
export const useUpcomingCalendar = (days: number = 7) => {
  return useQuery({
    queryKey: ['calendar', 'upcoming', days],
    queryFn: () => calendarService.getUpcoming(days),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
  })
}

/**
 * Get overdue items
 */
export const useOverdueCalendar = () => {
  return useQuery({
    queryKey: ['calendar', 'overdue'],
    queryFn: () => calendarService.getOverdue(),
    staleTime: 1 * 60 * 1000,
    retry: 1,
  })
}

/**
 * Get calendar statistics
 */
export const useCalendarStats = (filters?: {
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ['calendar', 'stats', filters],
    queryFn: () => calendarService.getStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

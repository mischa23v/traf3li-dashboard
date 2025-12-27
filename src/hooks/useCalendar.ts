/**
 * Calendar Hooks
 * TanStack Query hooks for calendar operations
 */

import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { CACHE_TIMES } from '@/config'
import calendarService, { CalendarFilters, ListFilters, CalendarEvent } from '@/services/calendarService'
import { Reminder } from '@/services/remindersService'
import { apiClientNoVersion as apiClient } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

// ==================== Cache Configuration ====================
// Cache data for 30 minutes to reduce API calls
// Data is refreshed automatically when tasks/reminders/events are created/updated/deleted
const CALENDAR_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const CALENDAR_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour (keep in cache)

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
    retry: false,
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
    retry: false,
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
    retry: false,
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
    retry: false,
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
    retry: false,
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
    retry: false,
  })
}

/**
 * Hook to prefetch adjacent months for smoother navigation
 * Returns callbacks to prefetch prev/next months on hover
 */
export const usePrefetchAdjacentMonths = (currentDate: Date) => {
  const queryClient = useQueryClient()

  const prefetchMonth = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Add buffer for calendar grid (same as fullcalendar-view)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - 7)
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + 7)

    const filters: CalendarFilters = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }

    // Only prefetch if not already in cache
    const cached = queryClient.getQueryData(['calendar', filters])
    if (!cached) {
      queryClient.prefetchQuery({
        queryKey: ['calendar', filters],
        queryFn: () => calendarService.getCalendar(filters),
        staleTime: CALENDAR_STALE_TIME,
      })
    }
  }, [queryClient])

  const prefetchPrevMonth = useCallback(() => {
    const prevDate = new Date(currentDate)
    prevDate.setMonth(prevDate.getMonth() - 1)
    prefetchMonth(prevDate)
  }, [currentDate, prefetchMonth])

  const prefetchNextMonth = useCallback(() => {
    const nextDate = new Date(currentDate)
    nextDate.setMonth(nextDate.getMonth() + 1)
    prefetchMonth(nextDate)
  }, [currentDate, prefetchMonth])

  return { prefetchPrevMonth, prefetchNextMonth }
}

// ==================== Optimized Calendar Hooks ====================

// Shorter cache times for optimized endpoints (backend handles caching)
const GRID_STALE_TIME = CACHE_TIMES.CALENDAR.GRID // 1 minute
const GRID_ITEMS_STALE_TIME = CACHE_TIMES.CALENDAR.ITEMS // 2 minutes
const ITEM_DETAILS_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes
const LIST_STALE_TIME = CACHE_TIMES.CALENDAR.GRID // 1 minute

/**
 * Get grid summary - counts per day for calendar badges
 * Use this for showing event counts on calendar cells
 */
export const useCalendarGridSummary = (
  filters: { startDate: string; endDate: string; types?: string },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['calendar', 'grid-summary', filters],
    queryFn: () => calendarService.getGridSummary(filters),
    staleTime: GRID_STALE_TIME,
    gcTime: CALENDAR_GC_TIME,
    enabled: enabled && !!(filters.startDate && filters.endDate),
    retry: false,
  })
}

/**
 * Get grid items - minimal event data for calendar display
 * ~150 bytes per item vs 2-5KB for full objects
 */
export const useCalendarGridItems = (
  filters: { startDate: string; endDate: string; types?: string; caseId?: string },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['calendar', 'grid-items', filters],
    queryFn: () => calendarService.getGridItems(filters),
    staleTime: GRID_ITEMS_STALE_TIME,
    gcTime: CALENDAR_GC_TIME,
    enabled: enabled && !!(filters.startDate && filters.endDate),
    retry: false,
  })
}

/**
 * Get full item details - lazy loaded on click
 * Only fetches when user clicks an event
 */
export const useCalendarItemDetails = (
  type: string | null,
  id: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['calendar', 'item', type, id],
    queryFn: () => calendarService.getItemDetails(type!, id!),
    staleTime: ITEM_DETAILS_STALE_TIME,
    gcTime: CALENDAR_GC_TIME,
    enabled: enabled && !!type && !!id,
    retry: false,
  })
}

/**
 * Get list view with infinite scroll
 * Uses cursor-based pagination for efficient loading
 */
export const useCalendarList = (
  filters: Omit<ListFilters, 'cursor'>,
  enabled: boolean = true
) => {
  return useInfiniteQuery({
    queryKey: ['calendar', 'list', filters],
    queryFn: ({ pageParam }) =>
      calendarService.getList({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.cursor : undefined,
    staleTime: LIST_STALE_TIME,
    gcTime: CALENDAR_GC_TIME,
    enabled,
    retry: false,
  })
}

/**
 * Hook to prefetch adjacent months using optimized grid endpoints
 */
export const usePrefetchAdjacentMonthsOptimized = (currentDate: Date) => {
  const queryClient = useQueryClient()

  const prefetchMonth = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - 7)
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + 7)

    const filters = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }

    // Prefetch both summary and items in parallel
    const summaryKey = ['calendar', 'grid-summary', filters]
    const itemsKey = ['calendar', 'grid-items', filters]

    if (!queryClient.getQueryData(summaryKey)) {
      queryClient.prefetchQuery({
        queryKey: summaryKey,
        queryFn: () => calendarService.getGridSummary(filters),
        staleTime: GRID_STALE_TIME,
      })
    }

    if (!queryClient.getQueryData(itemsKey)) {
      queryClient.prefetchQuery({
        queryKey: itemsKey,
        queryFn: () => calendarService.getGridItems(filters),
        staleTime: GRID_ITEMS_STALE_TIME,
      })
    }
  }, [queryClient])

  const prefetchPrevMonth = useCallback(() => {
    const prevDate = new Date(currentDate)
    prevDate.setMonth(prevDate.getMonth() - 1)
    prefetchMonth(prevDate)
  }, [currentDate, prefetchMonth])

  const prefetchNextMonth = useCallback(() => {
    const nextDate = new Date(currentDate)
    nextDate.setMonth(nextDate.getMonth() + 1)
    prefetchMonth(nextDate)
  }, [currentDate, prefetchMonth])

  return { prefetchPrevMonth, prefetchNextMonth }
}

// ==================== Sidebar Data Hook ====================

// Sidebar data - combines calendar and reminders for sidebar components
export interface SidebarData {
  calendarEvents: CalendarEvent[]
  upcomingReminders: Reminder[]
}

/**
 * [BACKEND-PENDING] Get sidebar data for dashboard
 *
 * ⚠️ [BACKEND-PENDING] WARNING: This endpoint (/calendar/sidebar-data) does NOT exist in the backend yet!
 * ⚠️ [BACKEND-PENDING] تحذير: هذه النقطة النهائية (/calendar/sidebar-data) غير موجودة في الخادم بعد!
 *
 * Required Implementation:
 * - Endpoint: GET /calendar/sidebar-data
 * - Query params: startDate, endDate, reminderDays
 * - Returns: { calendarEvents: CalendarEvent[], upcomingReminders: Reminder[] }
 *
 * Workaround: Use separate endpoints for events and reminders until this is implemented
 */
export const useSidebarData = (isEnabled = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 5)

  return useQuery<SidebarData>({
    queryKey: ['sidebar', 'data', today.toISOString().split('T')[0]],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/calendar/sidebar-data', {
          params: {
            startDate: today.toISOString(),
            endDate: endDate.toISOString(),
            reminderDays: 7
          }
        })
        return response.data
      } catch (error: any) {
        console.error('[Calendar Hook] [BACKEND-PENDING] Sidebar Data Error:', error?.message || '[BACKEND-PENDING] Failed to fetch sidebar data. This endpoint is not implemented yet. | [BACKEND-PENDING] فشل في جلب بيانات الشريط الجانبي. هذه النقطة النهائية غير مطبقة بعد.')
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: isAuthenticated && isEnabled,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

/**
 * Calendar Hooks
 * TanStack Query hooks for calendar operations
 */

import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { CACHE_TIMES } from '@/config'
import calendarService, { CalendarFilters, ListFilters, CalendarEvent } from '@/services/calendarService'
import remindersService, { Reminder } from '@/services/remindersService'
import eventsService from '@/services/eventsService'
import tasksService from '@/services/tasksService'
import { apiClientNoVersion as apiClient } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'

import { QueryKeys } from '@/lib/query-keys'
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
    queryKey: QueryKeys.calendar.list(filters),
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
    queryKey: QueryKeys.calendar.date(date),
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
    queryKey: QueryKeys.calendar.month(year, month),
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
    queryKey: QueryKeys.calendar.upcoming(days),
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
    queryKey: QueryKeys.calendar.overdue(),
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
    queryKey: QueryKeys.calendar.stats(filters),
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
    const cached = queryClient.getQueryData(QueryKeys.calendar.list(filters))
    if (!cached) {
      queryClient.prefetchQuery({
        queryKey: QueryKeys.calendar.list(filters),
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
 *
 * Falls back to legacy /calendar endpoint if optimized endpoint is not available
 */
export const useCalendarGridSummary = (
  filters: { startDate: string; endDate: string; types?: string },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QueryKeys.calendar.gridSummary(filters),
    queryFn: async () => {
      try {
        // Try optimized endpoint first
        return await calendarService.getGridSummary(filters)
      } catch (error) {
        // Fallback to legacy endpoint and transform the data
        console.log('[Calendar] Grid summary endpoint not available, using legacy fallback')
        const legacyData = await calendarService.getCalendar({
          startDate: filters.startDate,
          endDate: filters.endDate,
        })

        // Transform legacy data to grid summary format
        const dayMap = new Map<string, { events: number; tasks: number; reminders: number; hasHighPriority: boolean; hasOverdue: boolean }>()

        // Process events
        legacyData.data.events?.forEach((item) => {
          const date = item.startDate.split('T')[0]
          const existing = dayMap.get(date) || { events: 0, tasks: 0, reminders: 0, hasHighPriority: false, hasOverdue: false }
          existing.events++
          if (item.priority === 'high' || item.priority === 'critical') existing.hasHighPriority = true
          if (item.isOverdue) existing.hasOverdue = true
          dayMap.set(date, existing)
        })

        // Process tasks
        legacyData.data.tasks?.forEach((item) => {
          const date = item.startDate.split('T')[0]
          const existing = dayMap.get(date) || { events: 0, tasks: 0, reminders: 0, hasHighPriority: false, hasOverdue: false }
          existing.tasks++
          if (item.priority === 'high' || item.priority === 'critical') existing.hasHighPriority = true
          if (item.isOverdue) existing.hasOverdue = true
          dayMap.set(date, existing)
        })

        // Process reminders
        legacyData.data.reminders?.forEach((item) => {
          const date = item.startDate.split('T')[0]
          const existing = dayMap.get(date) || { events: 0, tasks: 0, reminders: 0, hasHighPriority: false, hasOverdue: false }
          existing.reminders++
          if (item.priority === 'high' || item.priority === 'critical') existing.hasHighPriority = true
          if (item.isOverdue) existing.hasOverdue = true
          dayMap.set(date, existing)
        })

        const days = Array.from(dayMap.entries()).map(([date, counts]) => ({
          date,
          total: counts.events + counts.tasks + counts.reminders,
          events: counts.events,
          tasks: counts.tasks,
          reminders: counts.reminders,
          caseDocuments: 0,
          hasHighPriority: counts.hasHighPriority,
          hasOverdue: counts.hasOverdue,
        }))

        return {
          success: true,
          data: {
            days,
            totalDays: days.length,
            dateRange: { start: filters.startDate, end: filters.endDate },
          },
          cached: false,
        }
      }
    },
    staleTime: GRID_STALE_TIME,
    gcTime: CALENDAR_GC_TIME,
    enabled: enabled && !!(filters.startDate && filters.endDate),
    retry: false,
  })
}

/**
 * Get grid items - minimal event data for calendar display
 * ~150 bytes per item vs 2-5KB for full objects
 *
 * Falls back to legacy /calendar endpoint if optimized endpoint is not available
 */
export const useCalendarGridItems = (
  filters: { startDate: string; endDate: string; types?: string; caseId?: string },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QueryKeys.calendar.gridItems(filters),
    queryFn: async () => {
      try {
        // Try optimized endpoint first
        return await calendarService.getGridItems(filters)
      } catch (error) {
        // Fallback to legacy endpoint and transform the data
        console.log('[Calendar] Grid items endpoint not available, using legacy fallback')
        const legacyData = await calendarService.getCalendar({
          startDate: filters.startDate,
          endDate: filters.endDate,
          caseId: filters.caseId,
        })

        // Color mapping for event types
        const typeColors: Record<string, string> = {
          hearing: '#ef4444',
          court_session: '#ef4444',
          meeting: '#3b82f6',
          deadline: '#f97316',
          task: '#8b5cf6',
          reminder: '#a855f7',
          conference: '#06b6d4',
          consultation: '#10b981',
          document_review: '#6366f1',
          training: '#ec4899',
          other: '#64748b',
        }

        // Transform legacy calendar items to grid items format
        const transformItem = (item: CalendarEvent, type: 'event' | 'task' | 'reminder') => ({
          id: item.id,
          type,
          title: item.title,
          startDate: item.startDate,
          endDate: item.endDate,
          allDay: item.allDay,
          eventType: item.eventType || type,
          status: item.status,
          priority: item.priority,
          color: item.color || typeColors[item.eventType as string] || typeColors[type] || typeColors.other,
        })

        const gridItems = [
          ...(legacyData.data.events?.map((item) => transformItem(item, 'event')) || []),
          ...(legacyData.data.tasks?.map((item) => transformItem(item, 'task')) || []),
          ...(legacyData.data.reminders?.map((item) => transformItem(item, 'reminder')) || []),
        ]

        // Filter by types if specified
        const filteredItems = filters.types
          ? gridItems.filter((item) => {
              const types = filters.types!.split(',')
              return types.includes(item.type) || types.includes(item.eventType || '')
            })
          : gridItems

        return {
          success: true,
          data: filteredItems,
          count: filteredItems.length,
          dateRange: { start: filters.startDate, end: filters.endDate },
        }
      }
    },
    staleTime: GRID_ITEMS_STALE_TIME,
    gcTime: CALENDAR_GC_TIME,
    enabled: enabled && !!(filters.startDate && filters.endDate),
    retry: false,
  })
}

/**
 * Get full item details - lazy loaded on click
 * Only fetches when user clicks an event
 *
 * Falls back to individual service endpoints if unified endpoint is not available
 */
export const useCalendarItemDetails = (
  type: string | null,
  id: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QueryKeys.calendar.item(type!, id!),
    queryFn: async () => {
      try {
        // Try unified endpoint first
        return await calendarService.getItemDetails(type!, id!)
      } catch (error) {
        // Fallback to individual service endpoints
        console.log('[Calendar] Item details endpoint not available, using legacy fallback')

        let data: CalendarEvent | null = null

        if (type === 'event') {
          const event = await eventsService.getEvent(id!)
          data = {
            id: event._id || event.id,
            type: 'event',
            title: event.title,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            allDay: event.allDay || false,
            eventType: event.type,
            location: event.location?.address || event.location?.name,
            status: event.status,
            color: '',
            caseId: event.caseId?._id || event.caseId,
            caseName: event.caseId?.title,
            caseNumber: event.caseId?.caseNumber,
            attendees: event.attendees,
            priority: event.priority,
          }
        } else if (type === 'task') {
          const task = await tasksService.getTask(id!)
          data = {
            id: task._id || task.id,
            type: 'task',
            title: task.title,
            description: task.description,
            startDate: task.dueDate || task.startDate,
            endDate: task.dueDate,
            allDay: true,
            eventType: 'task',
            status: task.status,
            color: '#8b5cf6',
            caseId: task.caseId?._id || task.caseId,
            caseName: task.caseId?.title,
            caseNumber: task.caseId?.caseNumber,
            priority: task.priority,
          }
        } else if (type === 'reminder') {
          const reminder = await remindersService.getReminder(id!)
          data = {
            id: reminder._id || reminder.id,
            type: 'reminder',
            title: reminder.title,
            description: reminder.description || reminder.notes,
            startDate: reminder.reminderTime || reminder.dueDate,
            endDate: reminder.reminderTime || reminder.dueDate,
            allDay: false,
            eventType: 'reminder',
            status: reminder.status,
            color: '#a855f7',
            caseId: reminder.caseId?._id || reminder.caseId,
            caseName: reminder.caseId?.title,
            caseNumber: reminder.caseId?.caseNumber,
            priority: reminder.priority,
          }
        }

        if (!data) {
          throw new Error(`Unknown item type: ${type}`)
        }

        return { success: true, data }
      }
    },
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
    queryKey: QueryKeys.calendar.infiniteList(filters),
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
    const summaryKey = QueryKeys.calendar.gridSummary(filters)
    const itemsKey = QueryKeys.calendar.gridItems(filters)

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
    queryKey: QueryKeys.sidebar.data(today.toISOString().split('T')[0]),
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
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.GC_LONG,
    enabled: isAuthenticated && isEnabled,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

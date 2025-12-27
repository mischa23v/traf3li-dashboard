/**
 * Dashboard Hooks
 * TanStack Query hooks for dashboard data operations
 *
 * These hooks only run when the user is authenticated to prevent
 * unnecessary 401 errors during auth state transitions.
 */

import { useQuery } from '@tanstack/react-query'
import dashboardService from '@/services/dashboardService'
import type { DashboardSummary } from '@/services/dashboardService'
import { useAuthStore } from '@/stores/auth-store'
import { CACHE_TIMES } from '@/config/cache'
import { QueryKeys } from '@/lib/query-keys'

// ==================== DASHBOARD SUMMARY (GOLD STANDARD) ====================
// Single API call for all dashboard data - replaces 7 separate calls

// Default fallback values for dashboard summary when API fails
const DEFAULT_DASHBOARD_SUMMARY: DashboardSummary = {
  caseStats: { total: 0, active: 0, closed: 0, pending: 0 },
  taskStats: { total: 0, byStatus: { todo: 0, in_progress: 0, completed: 0, cancelled: 0 } },
  reminderStats: { total: 0, byStatus: { pending: 0, completed: 0, snoozed: 0 } },
  todayEvents: [],
  financialSummary: { totalRevenue: 0, totalExpenses: 0, pendingAmount: 0, overdueAmount: 0 },
}

export const useDashboardSummary = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery<DashboardSummary>({
    queryKey: QueryKeys.dashboard.summary(),
    queryFn: () => dashboardService.getDashboardSummary(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes - dashboard stats don't change frequently
    gcTime: CACHE_TIMES.GC_MEDIUM,   // 10 minutes garbage collection
    enabled: isAuthenticated,
    retry: false, // NO retry on 429 - prevents rate limit cascade
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    // Provide placeholder data to prevent UI crashes when backend returns 500
    placeholderData: DEFAULT_DASHBOARD_SUMMARY,
  })
}

// ==================== DASHBOARD STATS ====================

export const useDashboardStats = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.dashboard.stats(),
    queryFn: () => dashboardService.getDashboardStats(),
    staleTime: CACHE_TIMES.SHORT, // 2 minutes
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: false, // NO retry on 429 - prevents rate limit cascade
  })
}

export const useDashboardHeroStats = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.dashboard.heroStats(),
    queryFn: () => dashboardService.getDashboardHeroStats(),
    staleTime: CACHE_TIMES.CALENDAR.GRID, // 1 minute
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: false, // NO retry on 429 - prevents rate limit cascade
  })
}

export const useTodayEvents = (isEnabled = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.dashboard.todayEvents(),
    queryFn: () => dashboardService.getTodayEvents(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    enabled: isAuthenticated && isEnabled, // Only fetch when authenticated and enabled
    retry: false, // NO retry on 429 - prevents rate limit cascade
    // Provide empty array when API fails to prevent UI crashes
    placeholderData: [],
  })
}

export const useFinancialSummary = (isEnabled = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.dashboard.financialSummary(),
    queryFn: () => dashboardService.getFinancialSummary(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    enabled: isAuthenticated && isEnabled, // Only fetch when authenticated and enabled
    retry: false, // NO retry on 429 - prevents rate limit cascade
    // Provide zero values when API fails to prevent UI crashes
    placeholderData: { totalRevenue: 0, totalExpenses: 0, pendingAmount: 0, overdueAmount: 0 },
  })
}

export const useRecentMessages = (limit = 5, isEnabled = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.dashboard.recentMessages(limit),
    queryFn: () => dashboardService.getRecentMessages(limit),
    staleTime: CACHE_TIMES.SHORT, // 2 minutes (increased from 30s)
    enabled: isAuthenticated && isEnabled, // Only fetch when authenticated and enabled
    retry: false, // NO retry on 429 - prevents rate limit cascade
  })
}

export const useMessageStats = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.messages.stats(),
    queryFn: () => dashboardService.getMessageStats(),
    staleTime: CACHE_TIMES.SHORT, // 2 minutes (increased from 1min)
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: false, // NO retry on 429 - prevents rate limit cascade
  })
}

// ==================== ANALYTICS TAB STATS ====================
// These hooks accept an `isTabActive` parameter to only fetch when the analytics tab is visible

export const useCRMStats = (isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.dashboard.crmStats(),
    queryFn: () => dashboardService.getCRMStats(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    enabled: isAuthenticated && isTabActive,
    retry: false,
  })
}

export const useHRStats = (isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.dashboard.hrStats(),
    queryFn: () => dashboardService.getHRStats(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    enabled: isAuthenticated && isTabActive,
    retry: false,
  })
}

export const useFinanceStats = (isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.dashboard.financeStats(),
    queryFn: () => dashboardService.getFinanceStats(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    enabled: isAuthenticated && isTabActive,
    retry: false,
  })
}

// ==================== REPORTS TAB CHARTS ====================
// These hooks accept an `isTabActive` parameter to only fetch when the reports tab is visible

export const useCasesChart = (months = 12, isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.reports.casesChart(months),
    queryFn: () => dashboardService.getCasesChart(months),
    staleTime: CACHE_TIMES.LONG, // 30 minutes (was 10 minutes)
    enabled: isAuthenticated && isTabActive,
    retry: false,
  })
}

export const useRevenueChart = (months = 12, isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.reports.revenueChart(months),
    queryFn: () => dashboardService.getRevenueChart(months),
    staleTime: CACHE_TIMES.LONG, // 30 minutes (was 10 minutes)
    enabled: isAuthenticated && isTabActive,
    retry: false,
  })
}

export const useTasksChart = (months = 12, isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.reports.tasksChart(months),
    queryFn: () => dashboardService.getTasksChart(months),
    staleTime: CACHE_TIMES.LONG, // 30 minutes (was 10 minutes)
    enabled: isAuthenticated && isTabActive,
    retry: false,
  })
}

// ==================== LAWYER-FOCUSED HOOKS ====================

/**
 * Get upcoming hearings
 * ⚠️ [BACKEND-PENDING] This endpoint is not implemented in backend yet
 * GET /dashboard/hearings/upcoming
 * Returns empty data until backend implements the endpoint
 */
export const useUpcomingHearings = (days = 7) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.dashboard.hearings.upcoming(days),
    queryFn: () => dashboardService.getUpcomingHearings(days),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    enabled: isAuthenticated,
    retry: false,
  })
}

export const useUpcomingDeadlines = (days = 14) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.dashboard.deadlines.upcoming(days),
    queryFn: () => dashboardService.getUpcomingDeadlines(days),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    enabled: isAuthenticated,
    retry: false,
  })
}

export const useTimeEntrySummary = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.dashboard.timeEntries.summary(),
    queryFn: () => dashboardService.getTimeEntrySummary(),
    staleTime: CACHE_TIMES.SHORT, // 2 minutes
    enabled: isAuthenticated,
    retry: false,
  })
}

export const usePendingDocuments = (isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: QueryKeys.dashboard.documents.pending(),
    queryFn: () => dashboardService.getPendingDocuments(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    enabled: isAuthenticated && isTabActive,
    retry: false,
  })
}

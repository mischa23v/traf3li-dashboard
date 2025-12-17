/**
 * Dashboard Hooks
 * TanStack Query hooks for dashboard data operations
 *
 * These hooks only run when the user is authenticated to prevent
 * unnecessary 401 errors during auth state transitions.
 */

import { useQuery } from '@tanstack/react-query'
import dashboardService from '@/services/dashboardService'
import { useAuthStore } from '@/stores/auth-store'

// ==================== DASHBOARD STATS ====================

export const useDashboardStats = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: 1, // Reduce retries to minimize 401 spam
  })
}

export const useDashboardHeroStats = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'hero-stats'],
    queryFn: () => dashboardService.getDashboardHeroStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: 1, // Reduce retries to minimize 401 spam
  })
}

export const useTodayEvents = (isEnabled = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'today-events'],
    queryFn: () => dashboardService.getTodayEvents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated && isEnabled, // Only fetch when authenticated and enabled
    retry: 1, // Reduce retries to minimize 401 spam
  })
}

export const useFinancialSummary = (isEnabled = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'financial-summary'],
    queryFn: () => dashboardService.getFinancialSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated && isEnabled, // Only fetch when authenticated and enabled
    retry: 1, // Reduce retries to minimize 401 spam
  })
}

export const useRecentMessages = (limit = 5, isEnabled = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'recent-messages', limit],
    queryFn: () => dashboardService.getRecentMessages(limit),
    staleTime: 30 * 1000, // 30 seconds
    enabled: isAuthenticated && isEnabled, // Only fetch when authenticated and enabled
    retry: 1, // Reduce retries to minimize 401 spam
  })
}

export const useMessageStats = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['messages', 'stats'],
    queryFn: () => dashboardService.getMessageStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: 1, // Reduce retries to minimize 401 spam
  })
}

// ==================== ANALYTICS TAB STATS ====================
// These hooks accept an `isTabActive` parameter to only fetch when the analytics tab is visible

export const useCRMStats = (isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'crm-stats'],
    queryFn: () => dashboardService.getCRMStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated && isTabActive,
    retry: 1,
  })
}

export const useHRStats = (isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'hr-stats'],
    queryFn: () => dashboardService.getHRStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated && isTabActive,
    retry: 1,
  })
}

export const useFinanceStats = (isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'finance-stats'],
    queryFn: () => dashboardService.getFinanceStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated && isTabActive,
    retry: 1,
  })
}

// ==================== REPORTS TAB CHARTS ====================
// These hooks accept an `isTabActive` parameter to only fetch when the reports tab is visible

export const useCasesChart = (months = 12, isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['reports', 'cases-chart', months],
    queryFn: () => dashboardService.getCasesChart(months),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: isAuthenticated && isTabActive,
    retry: 1,
  })
}

export const useRevenueChart = (months = 12, isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['reports', 'revenue-chart', months],
    queryFn: () => dashboardService.getRevenueChart(months),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: isAuthenticated && isTabActive,
    retry: 1,
  })
}

export const useTasksChart = (months = 12, isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['reports', 'tasks-chart', months],
    queryFn: () => dashboardService.getTasksChart(months),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: isAuthenticated && isTabActive,
    retry: 1,
  })
}

// ==================== LAWYER-FOCUSED HOOKS ====================

export const useUpcomingHearings = (days = 7) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'hearings', 'upcoming', days],
    queryFn: () => dashboardService.getUpcomingHearings(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated,
    retry: 1,
  })
}

export const useUpcomingDeadlines = (days = 14) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'deadlines', 'upcoming', days],
    queryFn: () => dashboardService.getUpcomingDeadlines(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated,
    retry: 1,
  })
}

export const useTimeEntrySummary = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'time-entries', 'summary'],
    queryFn: () => dashboardService.getTimeEntrySummary(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: isAuthenticated,
    retry: 1,
  })
}

export const usePendingDocuments = (isTabActive = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'documents', 'pending'],
    queryFn: () => dashboardService.getPendingDocuments(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated && isTabActive,
    retry: 1,
  })
}

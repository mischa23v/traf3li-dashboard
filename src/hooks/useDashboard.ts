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

export const useTodayEvents = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'today-events'],
    queryFn: () => dashboardService.getTodayEvents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: 1, // Reduce retries to minimize 401 spam
  })
}

export const useFinancialSummary = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'financial-summary'],
    queryFn: () => dashboardService.getFinancialSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated, // Only fetch when authenticated
    retry: 1, // Reduce retries to minimize 401 spam
  })
}

export const useRecentMessages = (limit = 5) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['dashboard', 'recent-messages', limit],
    queryFn: () => dashboardService.getRecentMessages(limit),
    staleTime: 30 * 1000, // 30 seconds
    enabled: isAuthenticated, // Only fetch when authenticated
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

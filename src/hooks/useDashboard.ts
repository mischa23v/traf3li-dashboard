/**
 * Dashboard Hooks
 * TanStack Query hooks for dashboard data operations
 */

import { useQuery } from '@tanstack/react-query'
import dashboardService from '@/services/dashboardService'

// ==================== DASHBOARD STATS ====================

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useDashboardHeroStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'hero-stats'],
    queryFn: () => dashboardService.getDashboardHeroStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useTodayEvents = () => {
  return useQuery({
    queryKey: ['dashboard', 'today-events'],
    queryFn: () => dashboardService.getTodayEvents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useFinancialSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'financial-summary'],
    queryFn: () => dashboardService.getFinancialSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useRecentMessages = (limit = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-messages', limit],
    queryFn: () => dashboardService.getRecentMessages(limit),
    staleTime: 30 * 1000, // 30 seconds
  })
}

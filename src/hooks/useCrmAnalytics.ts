/**
 * CRM Analytics Hooks
 * React Query hooks for CRM Analytics (Dashboard, Revenue, Funnel, Performance, etc.)
 */

import { useQuery } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import crmAnalyticsService from '@/services/crmAnalyticsService'
import type {
  CrmDashboardData,
  RevenueAnalytics,
  SalesFunnel,
  LeadAnalytics,
  PipelineAnalytics,
  TeamPerformance,
  ActivityAnalytics,
  WinLossAnalysis,
} from '@/services/crmAnalyticsService'

// ==================== Cache Configuration ====================
// Analytics queries use longer cache times since they're expensive operations
// and data doesn't change as frequently as transactional data
const ANALYTICS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const ANALYTICS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour (keep in cache)

// ==================== Query Keys ====================
export const crmAnalyticsKeys = {
  all: ['crm-analytics'] as const,
  dashboard: (params?: DashboardParams) => [...crmAnalyticsKeys.all, 'dashboard', params] as const,
  revenue: (params?: RevenueParams) => [...crmAnalyticsKeys.all, 'revenue', params] as const,
  funnel: (params?: FunnelParams) => [...crmAnalyticsKeys.all, 'funnel', params] as const,
  leads: (params?: DateRangeParams) => [...crmAnalyticsKeys.all, 'leads', params] as const,
  pipeline: (params?: PipelineParams) => [...crmAnalyticsKeys.all, 'pipeline', params] as const,
  team: (params?: TeamParams) => [...crmAnalyticsKeys.all, 'team', params] as const,
  activities: (params?: DateRangeParams) => [...crmAnalyticsKeys.all, 'activities', params] as const,
  winLoss: (params?: DateRangeParams) => [...crmAnalyticsKeys.all, 'win-loss', params] as const,
}

// ==================== Type Definitions ====================
export interface DashboardParams {
  dateRange?: 'today' | 'last_7_days' | 'last_30_days' | 'this_quarter' | 'custom'
  startDate?: string
  endDate?: string
}

export interface RevenueParams {
  period?: 'daily' | 'weekly' | 'monthly'
  startDate?: string
  endDate?: string
}

export interface FunnelParams {
  pipelineId?: string
  startDate?: string
  endDate?: string
}

export interface DateRangeParams {
  startDate?: string
  endDate?: string
}

export interface PipelineParams {
  pipelineId?: string
}

export interface TeamParams {
  teamId?: string
  startDate?: string
  endDate?: string
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS HOOKS (QUERY ONLY - NO MUTATIONS)
// ═══════════════════════════════════════════════════════════════

/**
 * Get CRM dashboard data with overview, trends, and top performers
 */
export function useCrmDashboard(params?: DashboardParams, enabled: boolean = true) {
  return useQuery<CrmDashboardData>({
    queryKey: crmAnalyticsKeys.dashboard(params),
    queryFn: () => crmAnalyticsService.getDashboard(params),
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    enabled,
  })
}

/**
 * Get revenue analytics by period (daily, weekly, monthly)
 */
export function useRevenueAnalytics(params?: RevenueParams, enabled: boolean = true) {
  return useQuery<RevenueAnalytics>({
    queryKey: crmAnalyticsKeys.revenue(params),
    queryFn: () => crmAnalyticsService.getRevenueAnalytics(params),
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    enabled,
  })
}

/**
 * Get sales funnel visualization data
 */
export function useSalesFunnel(params?: FunnelParams, enabled: boolean = true) {
  return useQuery<SalesFunnel>({
    queryKey: crmAnalyticsKeys.funnel(params),
    queryFn: () => crmAnalyticsService.getSalesFunnel(params),
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    enabled,
  })
}

/**
 * Get lead analytics including sources, status distribution, and trends
 */
export function useLeadAnalytics(params?: DateRangeParams, enabled: boolean = true) {
  return useQuery<LeadAnalytics>({
    queryKey: crmAnalyticsKeys.leads(params),
    queryFn: () => crmAnalyticsService.getLeadAnalytics(params),
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    enabled,
  })
}

/**
 * Get pipeline analytics including stage metrics, velocity, and conversion rates
 */
export function usePipelineAnalytics(params?: PipelineParams, enabled: boolean = true) {
  return useQuery<PipelineAnalytics>({
    queryKey: crmAnalyticsKeys.pipeline(params),
    queryFn: () => crmAnalyticsService.getPipelineAnalytics(params),
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    enabled,
  })
}

/**
 * Get team performance metrics
 */
export function useTeamPerformance(params?: TeamParams, enabled: boolean = true) {
  return useQuery<TeamPerformance>({
    queryKey: crmAnalyticsKeys.team(params),
    queryFn: () => crmAnalyticsService.getTeamPerformance(params),
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    enabled,
  })
}

/**
 * Get activity analytics by type, user, and trends
 */
export function useActivityAnalytics(params?: DateRangeParams, enabled: boolean = true) {
  return useQuery<ActivityAnalytics>({
    queryKey: crmAnalyticsKeys.activities(params),
    queryFn: () => crmAnalyticsService.getActivityAnalytics(params),
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    enabled,
  })
}

/**
 * Get win/loss analysis with reasons and competitor insights
 */
export function useWinLossAnalysis(params?: DateRangeParams, enabled: boolean = true) {
  return useQuery<WinLossAnalysis>({
    queryKey: crmAnalyticsKeys.winLoss(params),
    queryFn: () => crmAnalyticsService.getWinLossAnalysis(params),
    staleTime: ANALYTICS_STALE_TIME,
    gcTime: ANALYTICS_GC_TIME,
    enabled,
  })
}

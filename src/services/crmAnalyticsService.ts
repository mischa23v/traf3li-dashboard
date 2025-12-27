/**
 * CRM Analytics Service
 * Handles all CRM Analytics API calls (Dashboard, Revenue, Funnel, Performance, etc.)
 *
 * ERROR HANDLING:
 * - All errors return bilingual messages (English | Arabic)
 * - Sensitive backend details are not exposed to users
 * - Endpoint mismatches are handled gracefully with user-friendly messages
 */

import apiClient from '@/lib/api'
import { throwBilingualError } from '@/lib/bilingualErrorHandler'

// ═══════════════════════════════════════════════════════════════
// ANALYTICS TYPES
// ═══════════════════════════════════════════════════════════════

export interface CrmDashboardData {
  overview: {
    totalLeads: number
    activeLeads: number
    wonLeads: number
    lostLeads: number
    conversionRate: number
    totalRevenue: number
    averageDealSize: number
    averageSalesCycle: number
  }
  recentActivity: {
    newLeads: number
    wonDeals: number
    lostDeals: number
    activities: number
  }
  trends: {
    leadsGrowth: number
    revenueGrowth: number
    conversionGrowth: number
  }
  topPerformers: Array<{
    userId: string
    name: string
    leads: number
    won: number
    revenue: number
  }>
}

export interface SalesFunnel {
  stages: Array<{
    stageId: string
    name: string
    nameAr?: string
    count: number
    value: number
    conversionRate: number
    dropoffRate: number
  }>
  totalLeads: number
  totalValue: number
  overallConversionRate: number
}

export interface RevenueByPeriod {
  period: string
  revenue: number
  count: number
}

export interface RevenueAnalytics {
  byPeriod: RevenueByPeriod[]
  total: number
  average: number
}

export interface LeadSource {
  source: string
  count: number
  conversion: number
}

export interface LeadStatusCount {
  status: string
  count: number
}

export interface LeadTrend {
  date: string
  new: number
  won: number
  lost: number
}

export interface LeadAnalytics {
  bySource: LeadSource[]
  byStatus: LeadStatusCount[]
  trend: LeadTrend[]
}

export interface PipelineStageAnalytics {
  stage: string
  count: number
  value: number
  avgDays: number
}

export interface PipelineVelocity {
  stage: string
  avgDays: number
}

export interface PipelineConversion {
  stage: string
  rate: number
}

export interface PipelineAnalytics {
  byStage: PipelineStageAnalytics[]
  velocity: PipelineVelocity[]
  conversion: PipelineConversion[]
}

export interface TeamMemberPerformance {
  userId: string
  name: string
  leads: number
  won: number
  revenue: number
}

export interface TeamPerformanceTotals {
  leads: number
  won: number
  revenue: number
}

export interface TeamPerformance {
  byUser: TeamMemberPerformance[]
  totals: TeamPerformanceTotals
}

export interface ActivityByType {
  type: string
  count: number
}

export interface ActivityByUser {
  userId: string
  name: string
  count: number
}

export interface ActivityTrend {
  date: string
  count: number
}

export interface ActivityAnalytics {
  byType: ActivityByType[]
  byUser: ActivityByUser[]
  trend: ActivityTrend[]
}

export interface LostReason {
  reason: string
  count: number
  percentage: number
}

export interface CompetitorAnalysis {
  competitor: string
  wins: number
  losses: number
}

export interface WinLossAnalysis {
  winRate: number
  avgDealSize: number
  avgSalesCycle: number
  lostReasons: LostReason[]
  competitorAnalysis: CompetitorAnalysis[]
}

// ═══════════════════════════════════════════════════════════════
// CRM ANALYTICS SERVICE
// ═══════════════════════════════════════════════════════════════

export const crmAnalyticsService = {
  /**
   * Get CRM dashboard data with overview, trends, and top performers
   */
  getDashboard: async (params?: {
    dateRange?: 'today' | 'last_7_days' | 'last_30_days' | 'this_quarter' | 'custom'
    startDate?: string
    endDate?: string
  }): Promise<CrmDashboardData> => {
    try {
      const response = await apiClient.get('/crm-analytics/dashboard', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get revenue analytics by period (daily, weekly, monthly)
   */
  getRevenueAnalytics: async (params?: {
    period?: 'daily' | 'weekly' | 'monthly'
    startDate?: string
    endDate?: string
  }): Promise<RevenueAnalytics> => {
    try {
      const response = await apiClient.get('/crm-analytics/revenue', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get sales funnel visualization data
   */
  getSalesFunnel: async (params?: {
    pipelineId?: string
    startDate?: string
    endDate?: string
  }): Promise<SalesFunnel> => {
    try {
      const response = await apiClient.get('/crm-analytics/sales-funnel', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get lead analytics including sources, status distribution, and trends
   */
  getLeadAnalytics: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<LeadAnalytics> => {
    try {
      const response = await apiClient.get('/crm-analytics/leads', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get pipeline analytics including stage metrics, velocity, and conversion rates
   */
  getPipelineAnalytics: async (params?: {
    pipelineId?: string
  }): Promise<PipelineAnalytics> => {
    try {
      const response = await apiClient.get('/crm-analytics/pipeline', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get team performance metrics
   */
  getTeamPerformance: async (params?: {
    teamId?: string
    startDate?: string
    endDate?: string
  }): Promise<TeamPerformance> => {
    try {
      const response = await apiClient.get('/crm-analytics/team-performance', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get activity analytics by type, user, and trends
   */
  getActivityAnalytics: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<ActivityAnalytics> => {
    try {
      const response = await apiClient.get('/crm-analytics/activities', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get win/loss analysis with reasons and competitor insights
   */
  getWinLossAnalysis: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<WinLossAnalysis> => {
    try {
      const response = await apiClient.get('/crm-analytics/win-loss', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

export default crmAnalyticsService

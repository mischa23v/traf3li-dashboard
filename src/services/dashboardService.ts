/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 * Adapted to match backend API response structure
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Backend Hero Stats Response
 */
export interface DashboardHeroStatsResponse {
  cases: { total: number; active: number; closed: number }
  tasks: { total: number; active: number; completed: number }
  invoices: { total: number; paid: number; pending: number }
  orders: { total: number; completed: number; active: number }
}

/**
 * Dashboard Stats Interface (derived from hero-stats)
 */
export interface DashboardStats {
  cases: { total: number; active: number; closed: number }
  tasks: { total: number; active: number; completed: number }
  invoices: { total: number; paid: number; pending: number }
  orders: { total: number; completed: number; active: number }
}

/**
 * Dashboard Hero Stats Interface (for hero banner)
 */
export interface DashboardHeroStats {
  upcomingSessions: number
  urgentTasks: number
  newMessages: number
}

/**
 * Dashboard Event Interface (from backend)
 */
export interface DashboardEvent {
  _id: string
  title: string
  startDate: string
  endDate: string
  location: string
  type: 'meeting' | 'session' | 'deadline'
  status: string
}

/**
 * Dashboard Financial Summary Interface (from backend)
 */
export interface DashboardFinancialSummary {
  revenue: number
  expenses: number
  profit: number
  pendingInvoices: number
  paidInvoices: number
  netIncome: number
}

/**
 * Dashboard Recent Message Interface (from backend)
 */
export interface DashboardRecentMessage {
  _id: string
  text: string
  conversationID: string
  userID: {
    username: string
    image?: string
  }
  createdAt: string
}

/**
 * Get Dashboard Statistics (uses hero-stats endpoint)
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get('/dashboard/hero-stats')
    return response.data.stats
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Dashboard Hero Statistics
 * Transforms backend stats into hero banner format
 */
export const getDashboardHeroStats = async (): Promise<DashboardHeroStats> => {
  try {
    const response = await apiClient.get('/dashboard/hero-stats')
    const stats = response.data.stats as DashboardHeroStatsResponse

    // Transform to hero format
    return {
      upcomingSessions: stats.cases?.active || 0,
      urgentTasks: stats.tasks?.active || 0,
      newMessages: stats.orders?.active || 0,
    }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Today's Events
 */
export const getTodayEvents = async (): Promise<DashboardEvent[]> => {
  try {
    const response = await apiClient.get('/dashboard/today-events')
    return response.data.events || []
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Financial Summary
 */
export const getFinancialSummary =
  async (): Promise<DashboardFinancialSummary> => {
    try {
      const response = await apiClient.get('/dashboard/financial-summary')
      return response.data.summary
    } catch (error) {
      throw handleApiError(error)
    }
  }

/**
 * Get Recent Messages
 */
export const getRecentMessages = async (
  limit = 5
): Promise<DashboardRecentMessage[]> => {
  try {
    const response = await apiClient.get('/dashboard/recent-messages', {
      params: { limit },
    })
    return response.data.messages || []
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Activity Overview
 */
export const getActivityOverview = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/dashboard/activity')
    return response.data.activity || response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Detailed Dashboard Stats (alternative endpoint)
 * GET /dashboard/stats
 */
export const getDetailedDashboardStats = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/dashboard/stats')
    return response.data.stats || response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

const dashboardService = {
  getDashboardStats,
  getDashboardHeroStats,
  getTodayEvents,
  getFinancialSummary,
  getRecentMessages,
  getActivityOverview,
  getDetailedDashboardStats,
}

export default dashboardService

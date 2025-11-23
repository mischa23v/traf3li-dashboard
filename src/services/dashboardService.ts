/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Dashboard Stats Interface
 */
export interface DashboardStats {
  revenue: {
    current: number
    previous: number
    percentageChange: number
  }
  activeCases: {
    total: number
    requiresAction: number
  }
  newClients: {
    total: number
    thisWeek: number
  }
  unreadMessages: {
    total: number
    uniqueClients: number
  }
}

/**
 * Dashboard Hero Stats Interface
 */
export interface DashboardHeroStats {
  upcomingSessions: number
  urgentTasks: number
  newMessages: number
}

/**
 * Dashboard Event Interface
 */
export interface DashboardEvent {
  _id: string
  time: string
  title: string
  type: 'session' | 'meeting' | 'deadline'
  location: string
  color: string
}

/**
 * Dashboard Financial Summary Interface
 */
export interface DashboardFinancialSummary {
  expectedIncome: number
  pendingInvoices: Array<{
    _id: string
    clientName: string
    amount: number
    dueDate: string
    isOverdue: boolean
  }>
}

/**
 * Dashboard Recent Message Interface
 */
export interface DashboardRecentMessage {
  _id: string
  name: string
  message: string
  timestamp: string
  isOnline: boolean
  avatar?: string
}

/**
 * Get Dashboard Statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get('/dashboard/stats')
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Dashboard Hero Statistics
 */
export const getDashboardHeroStats = async (): Promise<DashboardHeroStats> => {
  try {
    const response = await apiClient.get('/dashboard/hero-stats')
    return response.data.data
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
    return response.data.data
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
      return response.data.data
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
    return response.data.data
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
}

export default dashboardService

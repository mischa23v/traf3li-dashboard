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
 * Message Stats Interface (from /api/messages/stats)
 */
export interface MessageStats {
  unreadMessages: number
  unreadConversations: number
  totalConversations: number
  totalMessages: number
}

/**
 * CRM Stats Interface (from /api/dashboard/crm-stats)
 */
export interface CRMStats {
  totalClients: number
  newClientsThisMonth: number
  activeLeads: number
  conversionRate: number
  clientsByStatus: { active: number; inactive: number }
  leadsByStatus: { new: number; qualified: number; converted: number }
}

/**
 * HR Stats Interface (from /api/dashboard/hr-stats)
 */
export interface HRStats {
  totalEmployees: number
  attendanceRate: number
  pendingLeaves: number
  openPositions: number
  activeEmployees: number
  presentToday: number
}

/**
 * Finance Stats Interface (from /api/dashboard/finance-stats)
 */
export interface FinanceStats {
  totalRevenue: number
  expenses: number
  profitMargin: number
  pendingInvoices: number
  pendingInvoicesCount: number
  paidInvoicesCount: number
  netProfit: number
}

/**
 * Chart Data Point Interface
 */
export interface ChartDataPoint {
  month: string
  label: string
}

/**
 * Cases Chart Data Interface
 */
export interface CasesChartData extends ChartDataPoint {
  total: number
  opened: number
  closed: number
  pending: number
}

/**
 * Revenue Chart Data Interface
 */
export interface RevenueChartData extends ChartDataPoint {
  revenue: number
  collected: number
  expenses: number
  profit: number
  invoiceCount: number
  collectionRate: number
}

/**
 * Tasks Chart Data Interface
 */
export interface TasksChartData extends ChartDataPoint {
  total: number
  completed: number
  inProgress: number
  pending: number
  overdue: number
  completionRate: number
}

/**
 * Chart Response Interface
 */
export interface ChartResponse<T> {
  success: boolean
  report: string
  period: { months: number; startDate: string }
  data: T[]
  summary?: Record<string, number>
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

/**
 * Get Message Statistics
 * GET /messages/stats
 */
export const getMessageStats = async (): Promise<MessageStats> => {
  try {
    const response = await apiClient.get('/messages/stats')
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get CRM Statistics
 * GET /dashboard/crm-stats
 */
export const getCRMStats = async (): Promise<CRMStats> => {
  try {
    const response = await apiClient.get('/dashboard/crm-stats')
    return response.data.stats
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get HR Statistics
 * GET /dashboard/hr-stats
 */
export const getHRStats = async (): Promise<HRStats> => {
  try {
    const response = await apiClient.get('/dashboard/hr-stats')
    return response.data.stats
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Finance Statistics
 * GET /dashboard/finance-stats
 */
export const getFinanceStats = async (): Promise<FinanceStats> => {
  try {
    const response = await apiClient.get('/dashboard/finance-stats')
    return response.data.stats
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Cases Chart Data
 * GET /reports/cases-chart
 */
export const getCasesChart = async (months = 12): Promise<ChartResponse<CasesChartData>> => {
  try {
    const response = await apiClient.get('/reports/cases-chart', { params: { months } })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Revenue Chart Data
 * GET /reports/revenue-chart
 */
export const getRevenueChart = async (months = 12): Promise<ChartResponse<RevenueChartData>> => {
  try {
    const response = await apiClient.get('/reports/revenue-chart', { params: { months } })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Tasks Chart Data
 * GET /reports/tasks-chart
 */
export const getTasksChart = async (months = 12): Promise<ChartResponse<TasksChartData>> => {
  try {
    const response = await apiClient.get('/reports/tasks-chart', { params: { months } })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// ==================== LAWYER-FOCUSED ENDPOINTS ====================

/**
 * Upcoming Hearing Interface
 */
export interface UpcomingHearing {
  _id: string
  caseId: string
  caseName: string
  caseNumber: string
  court: string
  courtRoom?: string
  date: string
  type: string
  notes?: string
  status: string
  source: 'case' | 'event'
}

/**
 * Upcoming Hearings Response
 */
export interface UpcomingHearingsResponse {
  hearings: UpcomingHearing[]
  total: number
}

/**
 * Deadline Interface
 */
export interface Deadline {
  _id: string
  caseId: string
  caseName: string
  caseNumber: string
  title: string
  description?: string
  dueDate: string
  type: string
  priority: 'high' | 'medium' | 'low'
  daysRemaining: number
  status: string
}

/**
 * Deadlines Response
 */
export interface DeadlinesResponse {
  deadlines: Deadline[]
  total: number
}

/**
 * Time Entry Summary Interface
 */
export interface TimeEntrySummary {
  today: { hours: number; amount: number }
  thisWeek: { hours: number; amount: number }
  thisMonth: { hours: number; amount: number }
  unbilled: { hours: number; amount: number }
  hourlyRate: number
}

/**
 * Pending Document Interface
 */
export interface PendingDocument {
  _id: string
  name: string
  caseId?: string
  caseName?: string
  clientName?: string
  category: string
  status: 'awaiting_signature' | 'awaiting_review' | 'awaiting_client'
  createdAt: string
  daysWaiting: number
}

/**
 * Pending Documents Response
 */
export interface PendingDocumentsResponse {
  documents: PendingDocument[]
  counts: {
    awaitingSignature: number
    awaitingReview: number
    awaitingClient: number
  }
  total: number
}

/**
 * Get Upcoming Hearings
 * GET /dashboard/hearings/upcoming
 */
export const getUpcomingHearings = async (days = 7): Promise<UpcomingHearingsResponse> => {
  try {
    const response = await apiClient.get('/dashboard/hearings/upcoming', { params: { days } })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Upcoming Deadlines
 * GET /dashboard/deadlines/upcoming
 */
export const getUpcomingDeadlines = async (days = 14): Promise<DeadlinesResponse> => {
  try {
    const response = await apiClient.get('/dashboard/deadlines/upcoming', { params: { days } })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Time Entry Summary (Billable Hours)
 * GET /dashboard/time-entries/summary
 */
export const getTimeEntrySummary = async (): Promise<TimeEntrySummary> => {
  try {
    const response = await apiClient.get('/dashboard/time-entries/summary')
    return response.data.summary
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get Pending Documents
 * GET /dashboard/documents/pending
 */
export const getPendingDocuments = async (): Promise<PendingDocumentsResponse> => {
  try {
    const response = await apiClient.get('/dashboard/documents/pending')
    return response.data
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
  getMessageStats,
  getCRMStats,
  getHRStats,
  getFinanceStats,
  getCasesChart,
  getRevenueChart,
  getTasksChart,
  getUpcomingHearings,
  getUpcomingDeadlines,
  getTimeEntrySummary,
  getPendingDocuments,
}

export default dashboardService

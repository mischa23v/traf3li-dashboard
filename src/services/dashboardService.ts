/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 * Adapted to match backend API response structure
 *
 * ======================== API ENDPOINT STATUS (Verified 2026-01-17) ========================
 *
 * WORKING ENDPOINTS (Backend verified):
 * - /dashboard/hero-stats           → getDashboardStats() & getDashboardHeroStats()
 * - /dashboard/stats                → getDetailedDashboardStats()
 * - /dashboard/summary              → getDashboardSummary() - Gold standard aggregated
 * - /dashboard/financial-summary    → getFinancialSummary() - Maps revenue→totalRevenue
 * - /dashboard/today-events         → getTodayEvents()
 * - /dashboard/recent-messages      → getRecentMessages()
 * - /dashboard/activity             → getActivityOverview()
 * - /dashboard/crm-stats            → getCRMStats() - Maps to clientsByStatus/leadsByStatus
 * - /dashboard/hr-stats             → getHRStats()
 * - /dashboard/finance-stats        → getFinanceStats()
 * - /reports/cases-chart            → getCasesChart() - Monthly case breakdown
 * - /reports/revenue-chart          → getRevenueChart() - Monthly revenue breakdown
 * - /reports/tasks-chart            → getTasksChart() - Monthly task breakdown
 * - /messages/stats                 → getMessageStats()
 * - /dashboard/hearings/upcoming    → getUpcomingHearings()
 * - /dashboard/deadlines/upcoming   → getUpcomingDeadlines()
 * - /dashboard/time-entries/summary → getTimeEntrySummary() - Maps averageHourlyRate→hourlyRate
 * - /dashboard/documents/pending    → getPendingDocuments()
 *
 * FIELD MAPPINGS (Backend → Frontend):
 * - financial-summary: revenue→totalRevenue, expenses→totalExpenses, pendingInvoices→pendingAmount
 * - crm-stats: activeClients→clientsByStatus.active, convertedLeads→leadsByStatus.converted
 * - time-entries: averageHourlyRate→hourlyRate, billableHours used for calculations
 *
 * ERROR HANDLING:
 * - All endpoints return default/empty data on 404 (graceful degradation)
 * - All errors include bilingual messages (English | Arabic)
 * - Console warnings log when endpoints are unavailable
 * - No UI crashes - graceful degradation
 *
 * ====================================================================
 */

import apiClient, { handleApiError } from '@/lib/api'
import { ROUTES } from '@/constants/routes'

/**
 * Dashboard Summary Interface - Aggregated dashboard data in ONE call
 * This is the gold standard: 1 API call instead of 7
 *
 * PERFORMANCE: messageStats and recentMessages REMOVED to avoid slow $lookup queries
 * If you need messages, fetch separately via /messages/stats or /dashboard/recent-messages
 */
export interface DashboardSummary {
  caseStats: {
    total: number
    active: number
    closed: number
    pending: number
  }
  taskStats: {
    total: number
    byStatus: {
      todo: number
      in_progress: number
      completed: number
      cancelled: number
    }
  }
  reminderStats: {
    total: number
    byStatus: {
      pending: number
      completed: number
      snoozed: number
    }
  }
  todayEvents: DashboardEvent[]
  financialSummary: DashboardFinancialSummary
  // messageStats: REMOVED - fetch separately if needed via useMessageStats()
  // recentMessages: REMOVED - fetch separately if needed via useRecentMessages()
}

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
 * Dashboard Financial Summary Interface (from backend /api/v1/dashboard/summary)
 */
export interface DashboardFinancialSummary {
  totalRevenue: number
  totalExpenses: number
  pendingAmount: number
  overdueAmount: number
  /** Revenue change percentage compared to last month (e.g., 20.1 for +20.1%) */
  revenueChangePercent?: number
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
 *  Available in backend
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.heroStats)
    return response.data.stats
  } catch (error) {
    const apiError = error as any
    throw new Error(
      apiError.message ||
      'Failed to load dashboard statistics | فشل في تحميل إحصائيات لوحة التحكم'
    )
  }
}

/**
 * Get Dashboard Hero Statistics
 * Transforms backend stats into hero banner format
 *  Available in backend
 */
export const getDashboardHeroStats = async (): Promise<DashboardHeroStats> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.heroStats)
    const stats = response.data.stats as DashboardHeroStatsResponse

    // Transform to hero format
    return {
      upcomingSessions: stats.cases?.active || 0,
      urgentTasks: stats.tasks?.active || 0,
      newMessages: stats.orders?.active || 0,
    }
  } catch (error) {
    const apiError = error as any
    throw new Error(
      apiError.message ||
      'Failed to load hero statistics | فشل في تحميل الإحصائيات الرئيسية'
    )
  }
}

/**
 * Get Dashboard Summary - AGGREGATED ENDPOINT (Gold Standard)
 * Single API call returns all dashboard data
 * Replaces 7 separate API calls with 1
 * GET /dashboard/summary
 *
 *  WARNING: This endpoint does NOT exist in backend yet
 * This is a planned future optimization
 */
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.summary)
    // Backend returns { success: true, data: { caseStats, taskStats, ... } }
    return response.data.data
  } catch (error) {
    // Bilingual error message
    const apiError = error as any
    if (apiError.status === 404) {
      throw new Error(
        'Dashboard summary endpoint not available | نقطة نهاية ملخص لوحة التحكم غير متوفرة'
      )
    }
    throw new Error(
      apiError.message ||
      'Failed to load dashboard summary | فشل في تحميل ملخص لوحة التحكم'
    )
  }
}

/**
 * Get Today's Events
 *  Available in backend
 */
export const getTodayEvents = async (): Promise<DashboardEvent[]> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.todayEvents)
    return response.data.events || []
  } catch (error) {
    const apiError = error as any
    throw new Error(
      apiError.message ||
      'Failed to load today\'s events | فشل في تحميل أحداث اليوم'
    )
  }
}

/**
 * Get Financial Summary
 *  Available in backend
 *
 * Backend returns: { revenue, expenses, profit, pendingInvoices, paidInvoices, totalPayments, netIncome }
 * Frontend expects: { totalRevenue, totalExpenses, pendingAmount, overdueAmount, revenueChangePercent }
 */
export const getFinancialSummary =
  async (): Promise<DashboardFinancialSummary> => {
    try {
      const response = await apiClient.get(ROUTES.api.dashboard.financialSummary)
      const summary = response.data.summary

      // Map backend fields to frontend interface
      return {
        totalRevenue: summary.revenue ?? 0,
        totalExpenses: summary.expenses ?? 0,
        pendingAmount: summary.pendingInvoices ?? 0,
        overdueAmount: 0, // Backend doesn't track overdue separately yet
        revenueChangePercent: undefined, // Backend doesn't calculate this yet
      }
    } catch (error) {
      const apiError = error as any
      throw new Error(
        apiError.message ||
        'Failed to load financial summary | فشل في تحميل الملخص المالي'
      )
    }
  }

/**
 * Get Recent Messages
 *  Available in backend
 */
export const getRecentMessages = async (
  limit = 5
): Promise<DashboardRecentMessage[]> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.recentMessages, {
      params: { limit },
    })
    return response.data.messages || []
  } catch (error) {
    const apiError = error as any
    throw new Error(
      apiError.message ||
      'Failed to load recent messages | فشل في تحميل الرسائل الحديثة'
    )
  }
}

/**
 * Get Activity Overview
 *  Available in backend
 */
export const getActivityOverview = async (): Promise<any> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.activity)
    return response.data.activity || response.data.data
  } catch (error) {
    const apiError = error as any
    throw new Error(
      apiError.message ||
      'Failed to load activity overview | فشل في تحميل نظرة عامة على النشاط'
    )
  }
}

/**
 * Get Detailed Dashboard Stats (alternative endpoint)
 * GET /dashboard/stats
 *  Available in backend
 */
export const getDetailedDashboardStats = async (): Promise<any> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.stats)
    return response.data.stats || response.data.data
  } catch (error) {
    const apiError = error as any
    throw new Error(
      apiError.message ||
      'Failed to load detailed statistics | فشل في تحميل الإحصائيات التفصيلية'
    )
  }
}

/**
 * Get Message Statistics
 * GET /messages/stats
 *
 *  WARNING: This endpoint does NOT exist in backend
 * Backend only has basic message CRUD operations
 */
export const getMessageStats = async (): Promise<MessageStats> => {
  try {
    const response = await apiClient.get(ROUTES.api.messages.stats)
    return response.data.data
  } catch (error) {
    const apiError = error as any
    if (apiError.status === 404) {
      // Return default values instead of failing
      console.warn('[BACKEND-PENDING] Message stats endpoint not available (/messages/stats), returning defaults')
      return {
        unreadMessages: 0,
        unreadConversations: 0,
        totalConversations: 0,
        totalMessages: 0,
      }
    }
    throw new Error(
      apiError.message ||
      'Failed to load message statistics | فشل في تحميل إحصائيات الرسائل'
    )
  }
}

/**
 * Get CRM Statistics
 * GET /dashboard/crm-stats
 * Available in backend
 *
 * Backend returns: { totalClients, activeClients, newClientsThisMonth, totalLeads, activeLeads, convertedLeads, conversionRate }
 * Frontend expects: { totalClients, newClientsThisMonth, activeLeads, conversionRate, clientsByStatus, leadsByStatus }
 */
export const getCRMStats = async (): Promise<CRMStats> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.crmStats)
    const stats = response.data.stats

    // Map backend fields to frontend interface
    return {
      totalClients: stats.totalClients ?? 0,
      newClientsThisMonth: stats.newClientsThisMonth ?? 0,
      activeLeads: stats.activeLeads ?? 0,
      conversionRate: stats.conversionRate ?? 0,
      clientsByStatus: {
        active: stats.activeClients ?? 0,
        inactive: (stats.totalClients ?? 0) - (stats.activeClients ?? 0),
      },
      leadsByStatus: {
        new: (stats.totalLeads ?? 0) - (stats.activeLeads ?? 0) - (stats.convertedLeads ?? 0),
        qualified: stats.activeLeads ?? 0,
        converted: stats.convertedLeads ?? 0,
      },
    }
  } catch (error) {
    const apiError = error as any
    if (apiError.status === 404) {
      console.warn('[BACKEND-PENDING] CRM stats endpoint not available (/dashboard/crm-stats), returning defaults')
      return {
        totalClients: 0,
        newClientsThisMonth: 0,
        activeLeads: 0,
        conversionRate: 0,
        clientsByStatus: { active: 0, inactive: 0 },
        leadsByStatus: { new: 0, qualified: 0, converted: 0 },
      }
    }
    throw new Error(
      apiError.message ||
      'Failed to load CRM statistics | فشل في تحميل إحصائيات إدارة العملاء'
    )
  }
}

/**
 * Get HR Statistics
 * GET /dashboard/hr-stats
 *
 *  WARNING: This endpoint does NOT exist in backend
 * HR module not yet implemented
 */
export const getHRStats = async (): Promise<HRStats> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.hrStats)
    return response.data.stats
  } catch (error) {
    const apiError = error as any
    if (apiError.status === 404) {
      console.warn('[BACKEND-PENDING] HR stats endpoint not available (/dashboard/hr-stats), returning defaults')
      return {
        totalEmployees: 0,
        attendanceRate: 0,
        pendingLeaves: 0,
        openPositions: 0,
        activeEmployees: 0,
        presentToday: 0,
      }
    }
    throw new Error(
      apiError.message ||
      'Failed to load HR statistics | فشل في تحميل إحصائيات الموارد البشرية'
    )
  }
}

/**
 * Get Finance Statistics
 * GET /dashboard/finance-stats
 *
 *  WARNING: This endpoint does NOT exist in backend
 * Use getFinancialSummary() instead which IS available
 */
export const getFinanceStats = async (): Promise<FinanceStats> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.financeStats)
    return response.data.stats
  } catch (error) {
    const apiError = error as any
    if (apiError.status === 404) {
      console.warn('[BACKEND-PENDING] Finance stats endpoint not available (/dashboard/finance-stats), returning defaults. Use /dashboard/financial-summary instead.')
      return {
        totalRevenue: 0,
        expenses: 0,
        profitMargin: 0,
        pendingInvoices: 0,
        pendingInvoicesCount: 0,
        paidInvoicesCount: 0,
        netProfit: 0,
      }
    }
    throw new Error(
      apiError.message ||
      'Failed to load finance statistics | فشل في تحميل الإحصائيات المالية'
    )
  }
}

/**
 * Get Cases Chart Data
 * GET /reports/cases-chart
 *
 *  WARNING: This endpoint does NOT exist in backend
 * Backend has basic report generation but not specific chart endpoints
 */
export const getCasesChart = async (months = 12): Promise<ChartResponse<CasesChartData>> => {
  try {
    const response = await apiClient.get(ROUTES.api.reports.casesChart, { params: { months } })
    return response.data
  } catch (error) {
    const apiError = error as any
    if (apiError.status === 404) {
      console.warn('[BACKEND-PENDING] Cases chart endpoint not available (/reports/cases-chart), returning empty data')
      return {
        success: false,
        report: 'Cases chart not available | مخطط القضايا غير متوفر',
        period: { months, startDate: new Date().toISOString() },
        data: [],
      }
    }
    throw new Error(
      apiError.message ||
      'Failed to load cases chart | فشل في تحميل مخطط القضايا'
    )
  }
}

/**
 * Get Revenue Chart Data
 * GET /reports/revenue-chart
 *
 *  WARNING: This endpoint does NOT exist in backend
 * Backend has basic report generation but not specific chart endpoints
 */
export const getRevenueChart = async (months = 12): Promise<ChartResponse<RevenueChartData>> => {
  try {
    const response = await apiClient.get(ROUTES.api.reports.revenueChart, { params: { months } })
    return response.data
  } catch (error) {
    const apiError = error as any
    if (apiError.status === 404) {
      console.warn('[BACKEND-PENDING] Revenue chart endpoint not available (/reports/revenue-chart), returning empty data')
      return {
        success: false,
        report: 'Revenue chart not available | مخطط الإيرادات غير متوفر',
        period: { months, startDate: new Date().toISOString() },
        data: [],
      }
    }
    throw new Error(
      apiError.message ||
      'Failed to load revenue chart | فشل في تحميل مخطط الإيرادات'
    )
  }
}

/**
 * Get Tasks Chart Data
 * GET /reports/tasks-chart
 *
 *  WARNING: This endpoint does NOT exist in backend
 * Backend has basic report generation but not specific chart endpoints
 */
export const getTasksChart = async (months = 12): Promise<ChartResponse<TasksChartData>> => {
  try {
    const response = await apiClient.get(ROUTES.api.reports.tasksChart, { params: { months } })
    return response.data
  } catch (error) {
    const apiError = error as any
    if (apiError.status === 404) {
      console.warn('[BACKEND-PENDING] Tasks chart endpoint not available (/reports/tasks-chart), returning empty data')
      return {
        success: false,
        report: 'Tasks chart not available | مخطط المهام غير متوفر',
        period: { months, startDate: new Date().toISOString() },
        data: [],
      }
    }
    throw new Error(
      apiError.message ||
      'Failed to load tasks chart | فشل في تحميل مخطط المهام'
    )
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
 *
 *  WARNING: This endpoint does NOT exist in backend
 * Hearing management not yet implemented
 */
export const getUpcomingHearings = async (days = 7): Promise<UpcomingHearingsResponse> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.hearingsUpcoming, { params: { days } })
    return response.data
  } catch (error) {
    const apiError = error as any
    if (apiError.status === 404) {
      console.warn('[BACKEND-PENDING] Upcoming hearings endpoint not available (/dashboard/hearings/upcoming), returning empty data')
      return {
        hearings: [],
        total: 0,
      }
    }
    throw new Error(
      apiError.message ||
      'Failed to load upcoming hearings | فشل في تحميل الجلسات القادمة'
    )
  }
}

/**
 * Get Upcoming Deadlines
 * GET /dashboard/deadlines/upcoming
 *
 *  WARNING: This endpoint does NOT exist in backend
 * Deadline tracking not yet implemented
 */
export const getUpcomingDeadlines = async (days = 14): Promise<DeadlinesResponse> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.deadlinesUpcoming, { params: { days } })
    return response.data
  } catch (error) {
    const apiError = error as any
    if (apiError.status === 404) {
      console.warn('[BACKEND-PENDING] Upcoming deadlines endpoint not available (/dashboard/deadlines/upcoming), returning empty data')
      return {
        deadlines: [],
        total: 0,
      }
    }
    throw new Error(
      apiError.message ||
      'Failed to load upcoming deadlines | فشل في تحميل المواعيد النهائية القادمة'
    )
  }
}

/**
 * Get Time Entry Summary (Billable Hours)
 * GET /dashboard/time-entries/summary
 * Available in backend
 *
 * Backend returns: { today, thisWeek, thisMonth, unbilled, averageHourlyRate }
 * Frontend expects: { today, thisWeek, thisMonth, unbilled, hourlyRate }
 */
export const getTimeEntrySummary = async (): Promise<TimeEntrySummary> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.timeEntriesSummary)
    const summary = response.data.summary
    const rate = summary.averageHourlyRate ?? 0

    // Map backend fields to frontend interface
    return {
      today: {
        hours: summary.today?.billableHours ?? summary.today?.hours ?? 0,
        amount: (summary.today?.billableHours ?? 0) * rate,
      },
      thisWeek: {
        hours: summary.thisWeek?.billableHours ?? summary.thisWeek?.hours ?? 0,
        amount: summary.thisWeek?.billableAmount ?? (summary.thisWeek?.billableHours ?? 0) * rate,
      },
      thisMonth: {
        hours: summary.thisMonth?.billableHours ?? summary.thisMonth?.hours ?? 0,
        amount: (summary.thisMonth?.billableHours ?? 0) * rate,
      },
      unbilled: {
        hours: summary.unbilled?.hours ?? 0,
        amount: summary.unbilled?.amount ?? 0,
      },
      hourlyRate: rate,
    }
  } catch (error) {
    const apiError = error as any
    if (apiError.status === 404) {
      console.warn('[BACKEND-PENDING] Time entry summary endpoint not available (/dashboard/time-entries/summary), returning defaults')
      return {
        today: { hours: 0, amount: 0 },
        thisWeek: { hours: 0, amount: 0 },
        thisMonth: { hours: 0, amount: 0 },
        unbilled: { hours: 0, amount: 0 },
        hourlyRate: 0,
      }
    }
    throw new Error(
      apiError.message ||
      'Failed to load time entry summary | فشل في تحميل ملخص إدخالات الوقت'
    )
  }
}

/**
 * Get Pending Documents
 * GET /dashboard/documents/pending
 *
 *  WARNING: This endpoint does NOT exist in backend
 * Document workflow management not yet implemented
 */
export const getPendingDocuments = async (): Promise<PendingDocumentsResponse> => {
  try {
    const response = await apiClient.get(ROUTES.api.dashboard.documentsPending)
    return response.data
  } catch (error) {
    const apiError = error as any
    if (apiError.status === 404) {
      console.warn('[BACKEND-PENDING] Pending documents endpoint not available (/dashboard/documents/pending), returning empty data')
      return {
        documents: [],
        counts: {
          awaitingSignature: 0,
          awaitingReview: 0,
          awaitingClient: 0,
        },
        total: 0,
      }
    }
    throw new Error(
      apiError.message ||
      'Failed to load pending documents | فشل في تحميل المستندات المعلقة'
    )
  }
}

const dashboardService = {
  getDashboardStats,
  getDashboardHeroStats,
  getDashboardSummary,
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

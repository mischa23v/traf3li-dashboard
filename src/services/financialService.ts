/**
 * Financial Service
 * Handles all financial and analytics-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Financial Dashboard Overview Interface
 */
export interface FinancialOverview {
  totalRevenue: number
  revenueThisMonth: number
  monthlyGrowth: number
  outstandingBalance: number
  overdueAmount: number
  collectionRate: number
  averagePaymentTime: number
  monthlyExpenses: number
  netProfit: number
  profitMargin: number
}

/**
 * Revenue Trend Data Point
 */
export interface RevenueTrend {
  month: string
  year: number
  revenue: number
  expenses: number
  profit: number
}

/**
 * Cash Flow Data Point
 */
export interface CashFlowData {
  month: string
  year: number
  income: number
  expenses: number
}

/**
 * Revenue by Area
 */
export interface RevenueByArea {
  area: string
  amount: number
  percentage: number
  cases: number
}

/**
 * Practice Area Performance
 */
export interface PracticeAreaPerformance {
  name: string
  revenue: number
  percentage: number
  cases: number
  avgValue: number
  profit: number
  growth: number
}

/**
 * Top Client
 */
export interface TopClient {
  name: string
  totalPaid: number
  cases: number
  lastPayment: string
}

/**
 * Top Client Profitability
 */
export interface TopClientProfitability {
  name: string
  revenue: number
  expenses: number
  profit: number
  margin: number
  cases: number
  avgInvoice: number
  paymentSpeed: number
  trend: 'up' | 'down' | 'stable'
}

/**
 * Outstanding Invoice
 */
export interface OutstandingInvoice {
  id: string
  client: string
  amount: number
  dueDate: Date
  daysOverdue: number
  urgent: boolean
}

/**
 * Expense Breakdown by Category
 */
export interface ExpenseBreakdown {
  category: string
  amount: number
  percentage: number
  change: number
}

/**
 * Collection Performance Range
 */
export interface CollectionPerformance {
  range: string
  amount: number
  percentage: number
  count: number
  color: 'green' | 'blue' | 'yellow' | 'red'
}

/**
 * Key Metrics Summary
 */
export interface KeyMetrics {
  totalRevenue: number
  revenueGrowth: number
  totalExpenses: number
  expenseGrowth: number
  netProfit: number
  profitMargin: number
  averageInvoice: number
  clientRetention: number
  collectionRate: number
  averagePaymentDays: number
}

/**
 * API Response Interface
 */
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

/**
 * Financial Service Object
 */
const financialService = {
  /**
   * Get financial dashboard overview
   */
  getDashboardOverview: async (): Promise<FinancialOverview> => {
    try {
      const response = await apiClient.get<ApiResponse<FinancialOverview>>(
        '/api/financial/dashboard'
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في جلب بيانات لوحة التحكم')
      }

      return response.data.data
    } catch (error: any) {
      console.error('Get dashboard overview error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get revenue trends
   * @param months - Number of months to fetch (default: 12)
   */
  getRevenueTrends: async (months: number = 12): Promise<RevenueTrend[]> => {
    try {
      const response = await apiClient.get<ApiResponse<RevenueTrend[]>>(
        '/api/financial/revenue-trends',
        { params: { months } }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في جلب بيانات الإيرادات')
      }

      return response.data.data
    } catch (error: any) {
      console.error('Get revenue trends error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get cash flow data
   * @param months - Number of months to fetch (default: 6)
   */
  getCashFlow: async (months: number = 6): Promise<CashFlowData[]> => {
    try {
      const response = await apiClient.get<ApiResponse<CashFlowData[]>>(
        '/api/financial/cash-flow',
        { params: { months } }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في جلب بيانات التدفق النقدي')
      }

      return response.data.data
    } catch (error: any) {
      console.error('Get cash flow error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get revenue by practice area
   */
  getRevenueByArea: async (): Promise<RevenueByArea[]> => {
    try {
      const response = await apiClient.get<ApiResponse<RevenueByArea[]>>(
        '/api/financial/revenue-by-area'
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في جلب بيانات الإيرادات حسب المجال')
      }

      return response.data.data
    } catch (error: any) {
      console.error('Get revenue by area error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get practice area performance (detailed)
   */
  getPracticeAreaPerformance: async (): Promise<PracticeAreaPerformance[]> => {
    try {
      const response = await apiClient.get<ApiResponse<PracticeAreaPerformance[]>>(
        '/api/financial/practice-area-performance'
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في جلب بيانات أداء المجالات')
      }

      return response.data.data
    } catch (error: any) {
      console.error('Get practice area performance error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get top clients by revenue
   * @param limit - Number of clients to fetch (default: 10)
   */
  getTopClients: async (limit: number = 10): Promise<TopClient[]> => {
    try {
      const response = await apiClient.get<ApiResponse<TopClient[]>>(
        '/api/financial/top-clients',
        { params: { limit } }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في جلب بيانات أفضل العملاء')
      }

      return response.data.data
    } catch (error: any) {
      console.error('Get top clients error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get top clients profitability analysis
   * @param limit - Number of clients to fetch (default: 10)
   */
  getTopClientsProfitability: async (
    limit: number = 10
  ): Promise<TopClientProfitability[]> => {
    try {
      const response = await apiClient.get<ApiResponse<TopClientProfitability[]>>(
        '/api/financial/top-clients-profitability',
        { params: { limit } }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في جلب بيانات ربحية العملاء')
      }

      return response.data.data
    } catch (error: any) {
      console.error('Get top clients profitability error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get outstanding invoices
   */
  getOutstandingInvoices: async (): Promise<OutstandingInvoice[]> => {
    try {
      const response = await apiClient.get<ApiResponse<OutstandingInvoice[]>>(
        '/api/financial/outstanding-invoices'
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في جلب الفواتير المعلقة')
      }

      return response.data.data
    } catch (error: any) {
      console.error('Get outstanding invoices error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get expense breakdown by category
   */
  getExpenseBreakdown: async (): Promise<ExpenseBreakdown[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ExpenseBreakdown[]>>(
        '/api/financial/expense-breakdown'
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في جلب تفصيل المصروفات')
      }

      return response.data.data
    } catch (error: any) {
      console.error('Get expense breakdown error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get collection performance by time range
   */
  getCollectionPerformance: async (): Promise<CollectionPerformance[]> => {
    try {
      const response = await apiClient.get<ApiResponse<CollectionPerformance[]>>(
        '/api/financial/collection-performance'
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في جلب بيانات التحصيل')
      }

      return response.data.data
    } catch (error: any) {
      console.error('Get collection performance error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get key metrics summary
   */
  getKeyMetrics: async (): Promise<KeyMetrics> => {
    try {
      const response = await apiClient.get<ApiResponse<KeyMetrics>>(
        '/api/financial/key-metrics'
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في جلب المؤشرات الرئيسية')
      }

      return response.data.data
    } catch (error: any) {
      console.error('Get key metrics error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

export default financialService

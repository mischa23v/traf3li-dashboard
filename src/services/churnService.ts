/**
 * Churn Service
 * Customer Churn & Retention System API
 *
 * Backend Routes:
 * Health Scores:
 * ✅ GET    /churn/health-scores                          - List all customer health scores
 * ✅ GET    /churn/health-scores/:customerId              - Get health score for specific customer
 * ✅ POST   /churn/health-scores/:customerId/calculate    - Trigger health score calculation
 * ✅ GET    /churn/health-scores/:customerId/history      - Get health score history
 *
 * Churn Events:
 * ✅ GET    /churn/events                                 - List all churn events
 * ✅ POST   /churn/events                                 - Record a new churn event
 * ✅ GET    /churn/events/:id                             - Get specific churn event
 *
 * Analytics:
 * ✅ GET    /churn/analytics/dashboard                    - Get churn dashboard metrics
 * ✅ GET    /churn/analytics/rate                         - Get churn rate over time
 * ✅ GET    /churn/analytics/cohort                       - Get cohort analysis
 * ✅ GET    /churn/analytics/risk-distribution            - Get risk tier distribution
 *
 * Interventions:
 * ✅ GET    /churn/interventions                          - List all interventions
 * ✅ POST   /churn/interventions/:customerId              - Trigger intervention for customer
 * ✅ PUT    /churn/interventions/:id/outcome              - Update intervention outcome
 *
 * Reports:
 * ✅ GET    /churn/reports/weekly                         - Get weekly churn report
 * ✅ GET    /churn/reports/monthly                        - Get monthly churn report
 * ✅ POST   /churn/reports/generate                       - Generate custom report
 *
 * Segments:
 * ✅ GET    /churn/segments/at-risk                       - Get at-risk customers
 * ✅ POST   /churn/segments/:customerId/retain            - Mark customer as retained
 */

import { apiClient, handleApiError } from '@/lib/api'

// ==================== TYPES ====================

// Risk tiers based on health score
export type RiskTier = 'healthy' | 'monitor' | 'at_risk' | 'critical'

// Health score trend direction
export type HealthTrend = 'improving' | 'stable' | 'declining'

// Churn event types
export type ChurnEventType = 'churned' | 'downgraded' | 'reactivated' | 'retained'

// Intervention types
export type InterventionType = 'email' | 'call' | 'discount' | 'feature_unlock' | 'meeting'

// Intervention status
export type InterventionStatus = 'pending' | 'sent' | 'completed' | 'failed'

// Intervention outcome
export type InterventionOutcome = 'retained' | 'churned' | 'pending'

// Health score component
export interface HealthScoreComponent {
  score: number
  weight: number
  weightedScore: number
}

// Health score components breakdown
export interface HealthScoreComponents {
  usage: HealthScoreComponent
  financial: HealthScoreComponent
  engagement: HealthScoreComponent
  contract: HealthScoreComponent
}

// Customer health score
export interface HealthScore {
  id: string
  customerId: string
  customerName?: string
  overallScore: number
  riskTier: RiskTier
  churnProbability: number
  components: HealthScoreComponents
  trend: HealthTrend
  lastCalculatedAt: string
  createdAt: string
  updatedAt: string
}

// Exit survey data
export interface ExitSurvey {
  primaryReason: string
  additionalFeedback?: string
  wouldRecommend: number // 1-10
}

// Churn event
export interface ChurnEvent {
  id: string
  customerId: string
  customerName?: string
  eventType: ChurnEventType
  reason?: string
  revenueImpact: number
  exitSurvey?: ExitSurvey
  createdAt: string
  updatedAt: string
}

// Dashboard metrics
export interface DashboardMetrics {
  currentChurnRate: number
  predictedChurnRate: number
  atRiskCustomers: number
  criticalCustomers: number
  healthScoreDistribution: Record<RiskTier, number>
  revenueAtRisk: number
  interventionSuccessRate: number
  totalCustomers: number
  averageHealthScore: number
}

// Risk distribution data
export interface RiskDistribution {
  distribution: Record<RiskTier, number>
  percentages: Record<RiskTier, number>
  totalCustomers: number
}

// Churn rate data point
export interface ChurnRateDataPoint {
  date: string
  rate: number
  customersLost: number
  totalCustomers: number
}

// Cohort retention data
export interface CohortRetention {
  name: string
  startDate: string
  initialSize: number
  retention: number[]
}

// Cohort analysis result
export interface CohortAnalysis {
  periods: string[]
  cohorts: CohortRetention[]
}

// Intervention
export interface Intervention {
  id: string
  customerId: string
  customerName?: string
  type: InterventionType
  status: InterventionStatus
  outcome?: InterventionOutcome
  notes?: string
  sentAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// Weekly report
export interface WeeklyReport {
  period: {
    start: string
    end: string
  }
  churnRate: number
  customersLost: number
  revenueLost: number
  customersRetained: number
  interventionsSent: number
  interventionSuccessRate: number
  topChurnReasons: Array<{ reason: string; count: number }>
}

// Monthly report
export interface MonthlyReport {
  period: {
    month: number
    year: number
  }
  netRevenueRetention: number
  grossRevenueRetention: number
  churnRate: number
  customersLost: number
  revenueLost: number
  customersGained: number
  revenueGained: number
  topChurnReasons: Array<{ reason: string; count: number; revenueImpact: number }>
  interventionMetrics: {
    totalSent: number
    successful: number
    successRate: number
    byType: Record<InterventionType, { sent: number; successful: number }>
  }
}

// Custom report
export interface CustomReport {
  id: string
  type: string
  period: {
    start: string
    end: string
  }
  generatedAt: string
  data: Record<string, unknown>
}

// Pagination
export interface PaginationInfo {
  page: number
  limit: number
  totalPages: number
  totalItems: number
  hasNext: boolean
  hasPrev: boolean
}

// API response wrapper
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  messageAr?: string
}

// Paginated response
interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: PaginationInfo
}

// ==================== REQUEST TYPES ====================

export interface HealthScoreListParams {
  riskTier?: RiskTier
  trend?: HealthTrend
  minScore?: number
  maxScore?: number
  page?: number
  limit?: number
}

export interface HealthScoreHistoryParams {
  startDate?: string
  endDate?: string
}

export interface ChurnEventListParams {
  eventType?: ChurnEventType
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface CreateChurnEventData {
  customerId: string
  eventType: ChurnEventType
  reason?: string
  revenueImpact?: number
  exitSurvey?: ExitSurvey
}

export interface ChurnRateParams {
  startDate?: string
  endDate?: string
  granularity?: 'daily' | 'weekly' | 'monthly'
}

export interface CohortAnalysisParams {
  cohortType?: 'monthly' | 'quarterly'
  periods?: number
}

export interface InterventionListParams {
  status?: InterventionStatus
  type?: InterventionType
  customerId?: string
  page?: number
  limit?: number
}

export interface TriggerInterventionData {
  type: InterventionType
  notes?: string
}

export interface UpdateInterventionOutcomeData {
  outcome: InterventionOutcome
  notes?: string
}

export interface GenerateReportData {
  type: string
  startDate: string
  endDate: string
  filters?: Record<string, unknown>
}

export interface AtRiskCustomersParams {
  minChurnProbability?: number
  riskTier?: RiskTier
  page?: number
  limit?: number
}

export interface RetainCustomerData {
  retentionMethod: string
  notes?: string
  interventionId?: string
}

// ==================== SERVICE ====================

const churnService = {
  // ==================== HEALTH SCORES ====================

  /**
   * Get all customer health scores
   * Health scores are weighted: Usage 40%, Financial 25%, Engagement 20%, Contract 15%
   */
  getHealthScores: async (
    params?: HealthScoreListParams
  ): Promise<{ data: HealthScore[]; pagination: PaginationInfo }> => {
    try {
      const response = await apiClient.get<PaginatedResponse<HealthScore>>(
        '/churn/health-scores',
        { params }
      )
      return { data: response.data.data, pagination: response.data.pagination }
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get health score for specific customer
   */
  getCustomerHealthScore: async (customerId: string): Promise<HealthScore> => {
    try {
      const response = await apiClient.get<ApiResponse<HealthScore>>(
        `/churn/health-scores/${customerId}`
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Calculate/recalculate health score for customer
   * Triggers a fresh calculation of all score components
   */
  calculateHealthScore: async (customerId: string): Promise<HealthScore> => {
    try {
      const response = await apiClient.post<ApiResponse<HealthScore>>(
        `/churn/health-scores/${customerId}/calculate`
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get health score history for a customer
   * Useful for trending and visualization
   */
  getHealthScoreHistory: async (
    customerId: string,
    params?: HealthScoreHistoryParams
  ): Promise<HealthScore[]> => {
    try {
      const response = await apiClient.get<ApiResponse<HealthScore[]>>(
        `/churn/health-scores/${customerId}/history`,
        { params }
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== CHURN EVENTS ====================

  /**
   * Get all churn events
   */
  getChurnEvents: async (
    params?: ChurnEventListParams
  ): Promise<{ data: ChurnEvent[]; pagination: PaginationInfo }> => {
    try {
      const response = await apiClient.get<PaginatedResponse<ChurnEvent>>(
        '/churn/events',
        { params }
      )
      return { data: response.data.data, pagination: response.data.pagination }
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Record a new churn event
   * Event types: churned, downgraded, reactivated, retained
   */
  recordChurnEvent: async (data: CreateChurnEventData): Promise<ChurnEvent> => {
    try {
      const response = await apiClient.post<ApiResponse<ChurnEvent>>(
        '/churn/events',
        data
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get specific churn event by ID
   */
  getChurnEvent: async (eventId: string): Promise<ChurnEvent> => {
    try {
      const response = await apiClient.get<ApiResponse<ChurnEvent>>(
        `/churn/events/${eventId}`
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== ANALYTICS ====================

  /**
   * Get churn dashboard metrics
   * Includes current/predicted churn rate, at-risk customers, revenue at risk, etc.
   */
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const response = await apiClient.get<ApiResponse<DashboardMetrics>>(
        '/churn/analytics/dashboard'
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get churn rate over time
   * Supports daily, weekly, or monthly granularity
   */
  getChurnRate: async (
    params?: ChurnRateParams
  ): Promise<ChurnRateDataPoint[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ChurnRateDataPoint[]>>(
        '/churn/analytics/rate',
        { params }
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get cohort analysis
   * Track retention by customer cohort (monthly or quarterly)
   */
  getCohortAnalysis: async (
    params?: CohortAnalysisParams
  ): Promise<CohortAnalysis> => {
    try {
      const response = await apiClient.get<ApiResponse<CohortAnalysis>>(
        '/churn/analytics/cohort',
        { params }
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get risk tier distribution
   * Shows count and percentage of customers in each risk tier
   */
  getRiskDistribution: async (): Promise<RiskDistribution> => {
    try {
      const response = await apiClient.get<ApiResponse<RiskDistribution>>(
        '/churn/analytics/risk-distribution'
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== INTERVENTIONS ====================

  /**
   * Get all interventions
   */
  getInterventions: async (
    params?: InterventionListParams
  ): Promise<{ data: Intervention[]; pagination: PaginationInfo }> => {
    try {
      const response = await apiClient.get<PaginatedResponse<Intervention>>(
        '/churn/interventions',
        { params }
      )
      return { data: response.data.data, pagination: response.data.pagination }
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Trigger intervention for a customer
   * Types: email, call, discount, feature_unlock, meeting
   */
  triggerIntervention: async (
    customerId: string,
    data: TriggerInterventionData
  ): Promise<Intervention> => {
    try {
      const response = await apiClient.post<ApiResponse<Intervention>>(
        `/churn/interventions/${customerId}`,
        data
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update intervention outcome
   * Record whether the intervention was successful
   */
  updateInterventionOutcome: async (
    interventionId: string,
    data: UpdateInterventionOutcomeData
  ): Promise<Intervention> => {
    try {
      const response = await apiClient.put<ApiResponse<Intervention>>(
        `/churn/interventions/${interventionId}/outcome`,
        data
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== REPORTS ====================

  /**
   * Get weekly churn report
   * Summary of churn metrics for the current/previous week
   */
  getWeeklyReport: async (): Promise<WeeklyReport> => {
    try {
      const response = await apiClient.get<ApiResponse<WeeklyReport>>(
        '/churn/reports/weekly'
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get monthly churn report
   * Comprehensive monthly analysis including NRR, GRR, and intervention metrics
   */
  getMonthlyReport: async (): Promise<MonthlyReport> => {
    try {
      const response = await apiClient.get<ApiResponse<MonthlyReport>>(
        '/churn/reports/monthly'
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Generate custom report
   * Create a report for a specific date range and filters
   */
  generateReport: async (data: GenerateReportData): Promise<CustomReport> => {
    try {
      const response = await apiClient.post<ApiResponse<CustomReport>>(
        '/churn/reports/generate',
        data
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== SEGMENTS ====================

  /**
   * Get at-risk customers
   * Filter by minimum churn probability threshold
   */
  getAtRiskCustomers: async (
    params?: AtRiskCustomersParams
  ): Promise<{ data: HealthScore[]; pagination: PaginationInfo }> => {
    try {
      const response = await apiClient.get<PaginatedResponse<HealthScore>>(
        '/churn/segments/at-risk',
        { params }
      )
      return { data: response.data.data, pagination: response.data.pagination }
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark customer as retained
   * Record successful retention with method used
   */
  markAsRetained: async (
    customerId: string,
    data: RetainCustomerData
  ): Promise<ChurnEvent> => {
    try {
      const response = await apiClient.post<ApiResponse<ChurnEvent>>(
        `/churn/segments/${customerId}/retain`,
        data
      )
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== UTILITIES ====================

  /**
   * Get risk tier from health score
   * Healthy: 80+, Monitor: 60-79, At Risk: 40-59, Critical: <40
   */
  getRiskTierFromScore: (score: number): RiskTier => {
    if (score >= 80) return 'healthy'
    if (score >= 60) return 'monitor'
    if (score >= 40) return 'at_risk'
    return 'critical'
  },

  /**
   * Get risk tier color for UI
   */
  getRiskTierColor: (tier: RiskTier): string => {
    const colors: Record<RiskTier, string> = {
      healthy: '#10b981',
      monitor: '#f59e0b',
      at_risk: '#f97316',
      critical: '#ef4444',
    }
    return colors[tier]
  },

  /**
   * Get trend icon/indicator
   */
  getTrendIndicator: (trend: HealthTrend): { icon: string; color: string } => {
    const indicators: Record<HealthTrend, { icon: string; color: string }> = {
      improving: { icon: '↑', color: '#10b981' },
      stable: { icon: '→', color: '#6b7280' },
      declining: { icon: '↓', color: '#ef4444' },
    }
    return indicators[trend]
  },

  /**
   * Format churn rate as percentage
   */
  formatChurnRate: (rate: number): string => {
    return `${(rate * 100).toFixed(1)}%`
  },

  /**
   * Format revenue for display
   */
  formatRevenue: (amount: number, currency: string = 'SAR'): string => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  },
}

export default churnService

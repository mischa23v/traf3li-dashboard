/**
 * HR Analytics Service
 * Handles all HR analytics and AI prediction API calls
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  WorkforceOverview,
  HeadcountTrend,
  DepartmentBreakdown,
  TenureDistribution,
  AttendanceAnalytics,
  LeaveAnalytics,
  PayrollAnalytics,
  PerformanceAnalytics,
  RecruitmentAnalytics,
  DiversityAnalytics,
  AttritionAnalytics,
  AttritionRiskPrediction,
  AttritionRiskSummary,
  WorkforceForecast,
  PromotionReadiness,
} from '@/types/biometric'

// ═══════════════════════════════════════════════════════════════
// WORKFORCE ANALYTICS SERVICE
// ═══════════════════════════════════════════════════════════════
export const hrAnalyticsService = {
  /**
   * Get workforce overview
   */
  getWorkforceOverview: async (): Promise<WorkforceOverview> => {
    try {
      const response = await apiClient.get('/hr-analytics/workforce-overview')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get headcount trends
   */
  getHeadcountTrends: async (params: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year'
  }): Promise<HeadcountTrend[]> => {
    try {
      const response = await apiClient.get('/hr-analytics/headcount-trends', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get department breakdown
   */
  getDepartmentBreakdown: async (): Promise<DepartmentBreakdown[]> => {
    try {
      const response = await apiClient.get('/hr-analytics/department-breakdown')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get tenure distribution
   */
  getTenureDistribution: async (): Promise<TenureDistribution[]> => {
    try {
      const response = await apiClient.get('/hr-analytics/tenure-distribution')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get attendance analytics
   */
  getAttendanceAnalytics: async (params?: {
    startDate?: string
    endDate?: string
    departmentId?: string
  }): Promise<AttendanceAnalytics> => {
    try {
      const response = await apiClient.get('/hr-analytics/attendance', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get leave analytics
   */
  getLeaveAnalytics: async (params?: {
    startDate?: string
    endDate?: string
    departmentId?: string
  }): Promise<LeaveAnalytics> => {
    try {
      const response = await apiClient.get('/hr-analytics/leave', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get payroll analytics
   */
  getPayrollAnalytics: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<PayrollAnalytics> => {
    try {
      const response = await apiClient.get('/hr-analytics/payroll', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics: async (params?: {
    year?: number
    departmentId?: string
  }): Promise<PerformanceAnalytics> => {
    try {
      const response = await apiClient.get('/hr-analytics/performance', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get recruitment analytics
   */
  getRecruitmentAnalytics: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<RecruitmentAnalytics> => {
    try {
      const response = await apiClient.get('/hr-analytics/recruitment', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get diversity analytics
   */
  getDiversityAnalytics: async (): Promise<DiversityAnalytics> => {
    try {
      const response = await apiClient.get('/hr-analytics/diversity')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get attrition analytics
   */
  getAttritionAnalytics: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<AttritionAnalytics> => {
    try {
      const response = await apiClient.get('/hr-analytics/attrition', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get executive summary
   */
  getExecutiveSummary: async (): Promise<{
    workforce: WorkforceOverview
    attendance: AttendanceAnalytics
    payroll: PayrollAnalytics
    performance: PerformanceAnalytics
    highlights: string[]
    alerts: Array<{ type: string; message: string; severity: string }>
  }> => {
    try {
      const response = await apiClient.get('/hr-analytics/executive-summary')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Save analytics snapshot
   */
  saveSnapshot: async (data: {
    type: string
    name?: string
    period?: { start: Date; end: Date }
  }): Promise<{ id: string }> => {
    try {
      const response = await apiClient.post('/hr-analytics/snapshot', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get saved snapshots
   */
  getSnapshots: async (type?: string): Promise<Array<{
    _id: string
    type: string
    name?: string
    period: { start: Date; end: Date }
    createdAt: Date
    createdBy: string
  }>> => {
    try {
      const response = await apiClient.get('/hr-analytics/snapshots', { params: { type } })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// AI PREDICTIONS SERVICE
// ═══════════════════════════════════════════════════════════════
export const hrPredictionsService = {
  /**
   * Get attrition risk predictions
   */
  getAttritionRisk: async (): Promise<AttritionRiskSummary> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/attrition-risk')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get attrition risk for specific employee
   */
  getEmployeeAttritionRisk: async (employeeId: string): Promise<AttritionRiskPrediction> => {
    try {
      const response = await apiClient.get(`/hr-analytics/predictions/attrition-risk/${employeeId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get workforce forecast
   */
  getWorkforceForecast: async (months: number = 12): Promise<WorkforceForecast[]> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/workforce-forecast', {
        params: { months }
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get promotion readiness
   */
  getPromotionReadiness: async (threshold: number = 75): Promise<PromotionReadiness[]> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/promotion-readiness', {
        params: { threshold }
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Recalculate predictions
   */
  recalculate: async (): Promise<{ success: boolean; calculatedAt: Date }> => {
    try {
      const response = await apiClient.post('/hr-analytics/predictions/recalculate')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get hiring needs forecast
   */
  getHiringNeedsForecast: async (months: number = 12): Promise<Array<{
    month: string
    department: string
    estimatedOpenings: number
    reason: string
    confidence: number
  }>> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/hiring-needs', {
        params: { months }
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

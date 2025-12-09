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
   * Get comprehensive dashboard with all key metrics
   */
  getDashboard: async (params?: {
    startDate?: string
    endDate?: string
    department?: string
    status?: string
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/hr-analytics/dashboard', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get workforce demographics
   */
  getDemographics: async (params?: {
    department?: string
    status?: string
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/hr-analytics/demographics', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get turnover analysis
   */
  getTurnover: async (params?: {
    startDate?: string
    endDate?: string
    department?: string
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/hr-analytics/turnover', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get absenteeism tracking
   */
  getAbsenteeism: async (params?: {
    startDate?: string
    endDate?: string
    department?: string
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/hr-analytics/absenteeism', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get attendance analytics
   */
  getAttendance: async (params?: {
    startDate?: string
    endDate?: string
    department?: string
  }): Promise<AttendanceAnalytics> => {
    try {
      const response = await apiClient.get('/hr-analytics/attendance', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get performance analytics
   */
  getPerformance: async (params?: {
    startDate?: string
    endDate?: string
    department?: string
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
  getRecruitment: async (params?: {
    startDate?: string
    endDate?: string
    department?: string
  }): Promise<RecruitmentAnalytics> => {
    try {
      const response = await apiClient.get('/hr-analytics/recruitment', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get compensation analytics
   */
  getCompensation: async (params?: {
    department?: string
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/hr-analytics/compensation', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get training analytics
   */
  getTraining: async (params?: {
    startDate?: string
    endDate?: string
    department?: string
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/hr-analytics/training', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get leave analytics
   */
  getLeave: async (params?: {
    startDate?: string
    endDate?: string
    department?: string
  }): Promise<LeaveAnalytics> => {
    try {
      const response = await apiClient.get('/hr-analytics/leave', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get Saudization compliance metrics
   */
  getSaudization: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/hr-analytics/saudization')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Take a snapshot of current HR metrics
   */
  takeSnapshot: async (data: {
    snapshotType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  }): Promise<{ id: string }> => {
    try {
      const response = await apiClient.post('/hr-analytics/snapshot', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get historical trends from snapshots
   */
  getTrends: async (params?: {
    snapshotType?: string
    limit?: number
  }): Promise<any[]> => {
    try {
      const response = await apiClient.get('/hr-analytics/trends', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export analytics report
   */
  exportReport: async (params: {
    startDate?: string
    endDate?: string
    department?: string
    format: 'json' | 'excel' | 'pdf'
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/hr-analytics/export', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// AI PREDICTIONS SERVICE
// ═══════════════════════════════════════════════════════════════
export const hrPredictionsService = {
  /**
   * Get attrition risk scores for all employees
   */
  getAttritionRisk: async (params?: {
    department?: string
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/attrition', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get detailed attrition risk analysis for specific employee
   */
  getEmployeeAttritionRisk: async (employeeId: string): Promise<AttritionRiskPrediction> => {
    try {
      const response = await apiClient.get(`/hr-analytics/predictions/attrition/${employeeId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get workforce forecast
   */
  getWorkforceForecast: async (params?: {
    months?: number
  }): Promise<WorkforceForecast[]> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/workforce', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Identify high-potential employees and promotion readiness
   */
  getHighPotential: async (params?: {
    limit?: number
  }): Promise<any[]> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/high-potential', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get employees at high flight risk
   */
  getFlightRisk: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/flight-risk')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Predict likely absence days and identify at-risk employees
   */
  getAbsencePredictions: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/absence')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Predict engagement trends and identify disengaged employees
   */
  getEngagementPredictions: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/engagement')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  }
}

/**
 * HR Analytics Service
 * Handles all HR analytics and AI prediction API calls
 * Base URL: https://api.traf3li.com/api/v1/hr-analytics
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  AttendanceAnalytics,
  LeaveAnalytics,
  PerformanceAnalytics,
  RecruitmentAnalytics,
  AttritionRiskPrediction,
} from '@/types/biometric'

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export interface HRDashboardData {
  summary: {
    totalEmployees: number
    activeEmployees: number
    newHires: number
    terminations: number
    turnoverRate: number
    averageTenure: number
  }
  demographics: DemographicsData
  attendance: AttendanceSummary
  performance: PerformanceSummary
}

export interface DemographicsData {
  byDepartment: Array<{ department: string; count: number; percentage: number }>
  byGender: Array<{ gender: string; count: number; percentage: number }>
  byAgeGroup: Array<{ ageGroup: string; count: number; percentage: number }>
  byNationality: Array<{ nationality: string; count: number; percentage: number }>
  byTenure: Array<{ tenureRange: string; count: number; percentage: number }>
}

export interface AttendanceSummary {
  presentRate: number
  absentRate: number
  lateRate: number
  overtimeHours: number
}

export interface PerformanceSummary {
  averageRating: number
  highPerformers: number
  needsImprovement: number
}

export interface TurnoverData {
  rate: number
  voluntary: number
  involuntary: number
  byDepartment: Array<{ department: string; rate: number }>
  byReason: Array<{ reason: string; count: number }>
  trends: Array<{ month: string; rate: number }>
}

export interface CompensationData {
  averageSalary: number
  salaryRanges: Array<{ range: string; count: number }>
  byDepartment: Array<{ department: string; averageSalary: number }>
  byGrade: Array<{ grade: string; averageSalary: number; minSalary: number; maxSalary: number }>
}

export interface TrainingData {
  totalHours: number
  completionRate: number
  byDepartment: Array<{ department: string; hours: number; completionRate: number }>
  courses: Array<{ courseName: string; enrolled: number; completed: number }>
}

export interface SaudizationData {
  currentRate: number
  targetRate: number
  byDepartment: Array<{ department: string; rate: number; target: number }>
  trendData: Array<{ month: string; rate: number }>
}

export interface TrendSnapshot {
  snapshotId: string
  snapshotType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  date: string
  metrics: Record<string, any>
}

// Prediction Types
export interface AttritionRiskData {
  summary: {
    totalAnalyzed: number
    highRisk: number
    mediumRisk: number
    lowRisk: number
    averageRiskScore: number
  }
  employees: Array<{
    employeeId: string
    employeeName: string
    department: string
    position: string
    riskScore: number
    riskLevel: 'high' | 'medium' | 'low'
    factors: string[]
    recommendations: string[]
  }>
  riskDistribution: Array<{ level: string; count: number }>
  byDepartment: Array<{ department: string; highRisk: number; mediumRisk: number; lowRisk: number }>
}

export interface WorkforceForecastData {
  summary: {
    currentHeadcount: number
    projectedHeadcount: number
    expectedGrowth: number
    expectedAttrition: number
  }
  forecast: Array<{
    month: string
    headcount: number
    hires: number
    exits: number
    growth: number
  }>
  byDepartment: Array<{
    department: string
    currentCount: number
    projectedCount: number
  }>
}

export interface HighPotentialData {
  summary: {
    totalIdentified: number
    readyForPromotion: number
    needsDevelopment: number
  }
  employees: Array<{
    employeeId: string
    employeeName: string
    department: string
    currentPosition: string
    potentialScore: number
    readinessScore: number
    suggestedPosition: string
    developmentAreas: string[]
  }>
}

export interface FlightRiskData {
  summary: {
    totalAtRisk: number
    criticalRoles: number
    estimatedCost: number
  }
  employees: Array<{
    employeeId: string
    employeeName: string
    department: string
    position: string
    riskScore: number
    tenure: number
    lastRaise: string
    factors: string[]
  }>
}

export interface AbsencePredictionData {
  summary: {
    predictedAbsences: number
    highRiskEmployees: number
    peakAbsenceDays: string[]
  }
  employees: Array<{
    employeeId: string
    employeeName: string
    predictedDays: number
    riskLevel: 'high' | 'medium' | 'low'
    patterns: string[]
  }>
  byDayOfWeek: Array<{ day: string; predictedAbsences: number }>
  byMonth: Array<{ month: string; predictedAbsences: number }>
}

export interface EngagementPredictionData {
  summary: {
    averageEngagement: number
    atRiskCount: number
    trendDirection: 'up' | 'down' | 'stable'
  }
  employees: Array<{
    employeeId: string
    employeeName: string
    engagementScore: number
    trendDirection: 'up' | 'down' | 'stable'
    riskFactors: string[]
  }>
  byDepartment: Array<{ department: string; averageScore: number; trend: string }>
  trends: Array<{ month: string; score: number }>
}

export interface HiringNeedsForecastData {
  summary: {
    totalPositions: number
    urgentPositions: number
    estimatedBudget: number
  }
  forecast: Array<{
    month: string
    positions: number
  }>
  byDepartment: Array<{
    department: string
    positions: number
    urgency: 'high' | 'medium' | 'low'
    roles: string[]
  }>
}

export interface PromotionReadinessData {
  summary: {
    readyCount: number
    developingCount: number
    averageReadinessScore: number
  }
  employees: Array<{
    employeeId: string
    employeeName: string
    currentPosition: string
    suggestedPosition: string
    readinessScore: number
    strengths: string[]
    developmentAreas: string[]
  }>
  scoreDistribution: Array<{ range: string; count: number }>
  byDepartment: Array<{ department: string; readyCount: number; total: number }>
}

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
  }): Promise<HRDashboardData> => {
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
  }): Promise<DemographicsData> => {
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
  }): Promise<TurnoverData> => {
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
  }): Promise<CompensationData> => {
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
  }): Promise<TrainingData> => {
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
  getSaudization: async (): Promise<SaudizationData> => {
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
  }): Promise<TrendSnapshot[]> => {
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
  }): Promise<Blob | any> => {
    try {
      const response = await apiClient.get('/hr-analytics/export', {
        params,
        responseType: params.format !== 'json' ? 'blob' : 'json'
      })
      return response.data
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
  }): Promise<AttritionRiskData> => {
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
   * Get workforce forecast (headcount projections)
   */
  getWorkforceForecast: async (params?: {
    months?: number
  }): Promise<WorkforceForecastData> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/workforce', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Identify high-potential employees
   */
  getHighPotential: async (params?: {
    limit?: number
  }): Promise<HighPotentialData> => {
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
  getFlightRisk: async (): Promise<FlightRiskData> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/flight-risk')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Predict likely absence days
   */
  getAbsencePredictions: async (): Promise<AbsencePredictionData> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/absence')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Predict engagement trends
   */
  getEngagementPredictions: async (): Promise<EngagementPredictionData> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/engagement')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get hiring needs forecast
   * This combines workforce forecast with hiring specific projections
   */
  getHiringNeedsForecast: async (months: number = 12): Promise<HiringNeedsForecastData> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/workforce', { params: { months } })
      // Transform workforce forecast into hiring needs format
      const workforceData = response.data.data
      return {
        summary: {
          totalPositions: workforceData?.summary?.expectedGrowth || 0,
          urgentPositions: Math.ceil((workforceData?.summary?.expectedGrowth || 0) * 0.3),
          estimatedBudget: 0
        },
        forecast: workforceData?.forecast?.map((item: any) => ({
          month: item.month,
          positions: item.hires || 0
        })) || [],
        byDepartment: workforceData?.byDepartment?.map((dept: any) => ({
          department: dept.department,
          positions: Math.max(0, dept.projectedCount - dept.currentCount),
          urgency: 'medium' as const,
          roles: []
        })) || []
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get promotion readiness assessment
   */
  getPromotionReadiness: async (threshold: number = 75): Promise<PromotionReadinessData> => {
    try {
      const response = await apiClient.get('/hr-analytics/predictions/high-potential', {
        params: { limit: 50 }
      })
      const highPotentialData = response.data.data

      // Filter employees by readiness score threshold
      const readyEmployees = highPotentialData?.employees?.filter(
        (emp: any) => emp.readinessScore >= threshold
      ) || []

      return {
        summary: {
          readyCount: readyEmployees.length,
          developingCount: (highPotentialData?.employees?.length || 0) - readyEmployees.length,
          averageReadinessScore: highPotentialData?.employees?.reduce(
            (sum: number, emp: any) => sum + (emp.readinessScore || 0), 0
          ) / (highPotentialData?.employees?.length || 1) || 0
        },
        employees: highPotentialData?.employees?.map((emp: any) => ({
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          currentPosition: emp.currentPosition,
          suggestedPosition: emp.suggestedPosition,
          readinessScore: emp.readinessScore || emp.potentialScore || 0,
          strengths: [],
          developmentAreas: emp.developmentAreas || []
        })) || [],
        scoreDistribution: [
          { range: '90-100', count: highPotentialData?.employees?.filter((e: any) => e.readinessScore >= 90).length || 0 },
          { range: '80-89', count: highPotentialData?.employees?.filter((e: any) => e.readinessScore >= 80 && e.readinessScore < 90).length || 0 },
          { range: '70-79', count: highPotentialData?.employees?.filter((e: any) => e.readinessScore >= 70 && e.readinessScore < 80).length || 0 },
          { range: '60-69', count: highPotentialData?.employees?.filter((e: any) => e.readinessScore >= 60 && e.readinessScore < 70).length || 0 },
          { range: '<60', count: highPotentialData?.employees?.filter((e: any) => e.readinessScore < 60).length || 0 }
        ],
        byDepartment: []
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Recalculate all predictions (trigger backend recalculation)
   */
  recalculate: async (): Promise<void> => {
    try {
      // This triggers a snapshot which causes recalculation
      await apiClient.post('/hr-analytics/snapshot', { snapshotType: 'daily' })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  }
}

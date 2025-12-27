/**
 * HR Analytics Hooks
 * React Query hooks for HR analytics and AI predictions
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  hrAnalyticsService,
  hrPredictionsService,
  type HRDashboardData,
  type DemographicsData,
  type TurnoverData,
  type CompensationData,
  type TrainingData,
  type SaudizationData,
  type TrendSnapshot,
  type AttritionRiskData,
  type WorkforceForecastData,
  type HighPotentialData,
  type FlightRiskData,
  type AbsencePredictionData,
  type EngagementPredictionData,
  type HiringNeedsForecastData,
  type PromotionReadinessData
} from '@/services/hrAnalyticsService'
import { useAuthStore } from '@/stores/auth-store'
import apiClient from '@/lib/api'
import { CACHE_TIMES } from '@/config/cache'
import { invalidateCache } from '@/lib/cache-invalidation'

import { QueryKeys } from '@/lib/query-keys'
// ═══════════════════════════════════════════════════════════════
// WORKFORCE ANALYTICS HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Hook to get comprehensive HR dashboard data
 */
export const useHRDashboard = (params?: {
  startDate?: string
  endDate?: string
  department?: string
  status?: string
}) => {
  return useQuery<HRDashboardData>({
    queryKey: QueryKeys.hrAnalytics.dashboard(params),
    queryFn: () => hrAnalyticsService.getDashboard(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get workforce overview (uses dashboard endpoint)
 */
export const useWorkforceOverview = () => {
  return useQuery<HRDashboardData>({
    queryKey: QueryKeys.hrAnalytics.workforceOverview(),
    queryFn: () => hrAnalyticsService.getDashboard(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get headcount trends (uses trends endpoint)
 */
export const useHeadcountTrends = (params?: {
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year'
}) => {
  return useQuery({
    queryKey: QueryKeys.hrAnalytics.headcountTrends(params),
    queryFn: () => hrAnalyticsService.getTrends({ limit: 12 }),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get department breakdown (uses demographics endpoint)
 */
export const useDepartmentBreakdown = () => {
  return useQuery<DemographicsData>({
    queryKey: QueryKeys.hrAnalytics.departmentBreakdown(),
    queryFn: () => hrAnalyticsService.getDemographics(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get tenure distribution (uses demographics endpoint)
 */
export const useTenureDistribution = () => {
  return useQuery<DemographicsData>({
    queryKey: QueryKeys.hrAnalytics.tenureDistribution(),
    queryFn: () => hrAnalyticsService.getDemographics(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get payroll analytics (uses compensation endpoint)
 */
export const usePayrollAnalytics = (params?: {
  startDate?: string
  endDate?: string
}) => {
  return useQuery<CompensationData>({
    queryKey: QueryKeys.hrAnalytics.payrollAnalytics(params),
    queryFn: () => hrAnalyticsService.getCompensation(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get diversity analytics (uses demographics endpoint)
 */
export const useDiversityAnalytics = () => {
  return useQuery<DemographicsData>({
    queryKey: QueryKeys.hrAnalytics.diversityAnalytics(),
    queryFn: () => hrAnalyticsService.getDemographics(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get workforce demographics
 */
export const useDemographics = (params?: {
  department?: string
  status?: string
}) => {
  return useQuery<DemographicsData>({
    queryKey: QueryKeys.hrAnalytics.demographics(params),
    queryFn: () => hrAnalyticsService.getDemographics(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get turnover analysis
 */
export const useTurnover = (params?: {
  startDate?: string
  endDate?: string
  department?: string
}) => {
  return useQuery<TurnoverData>({
    queryKey: QueryKeys.hrAnalytics.turnover(params),
    queryFn: () => hrAnalyticsService.getTurnover(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get absenteeism tracking
 */
export const useAbsenteeism = (params?: {
  startDate?: string
  endDate?: string
  department?: string
}) => {
  return useQuery({
    queryKey: QueryKeys.hrAnalytics.absenteeism(params),
    queryFn: () => hrAnalyticsService.getAbsenteeism(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get attendance analytics
 */
export const useAttendanceAnalytics = (params?: {
  startDate?: string
  endDate?: string
  department?: string
}) => {
  return useQuery({
    queryKey: QueryKeys.hrAnalytics.attendanceAnalytics(params),
    queryFn: () => hrAnalyticsService.getAttendance(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get performance analytics
 */
export const usePerformanceAnalytics = (params?: {
  startDate?: string
  endDate?: string
  department?: string
}) => {
  return useQuery({
    queryKey: QueryKeys.hrAnalytics.performanceAnalytics(params),
    queryFn: () => hrAnalyticsService.getPerformance(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get recruitment analytics
 */
export const useRecruitmentAnalytics = (params?: {
  startDate?: string
  endDate?: string
  department?: string
}) => {
  return useQuery({
    queryKey: QueryKeys.hrAnalytics.recruitmentAnalytics(params),
    queryFn: () => hrAnalyticsService.getRecruitment(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get compensation analytics
 */
export const useCompensationAnalytics = (params?: {
  department?: string
}) => {
  return useQuery<CompensationData>({
    queryKey: QueryKeys.hrAnalytics.compensationAnalytics(params),
    queryFn: () => hrAnalyticsService.getCompensation(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get training analytics
 */
export const useTrainingAnalytics = (params?: {
  startDate?: string
  endDate?: string
  department?: string
}) => {
  return useQuery<TrainingData>({
    queryKey: QueryKeys.hrAnalytics.trainingAnalytics(params),
    queryFn: () => hrAnalyticsService.getTraining(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get leave analytics
 */
export const useLeaveAnalytics = (params?: {
  startDate?: string
  endDate?: string
  department?: string
}) => {
  return useQuery({
    queryKey: QueryKeys.hrAnalytics.leaveAnalytics(params),
    queryFn: () => hrAnalyticsService.getLeave(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to get Saudization compliance metrics
 */
export const useSaudization = () => {
  return useQuery<SaudizationData>({
    queryKey: QueryKeys.hrAnalytics.saudization(),
    queryFn: () => hrAnalyticsService.getSaudization(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to take a snapshot of current HR metrics
 */
export const useTakeSnapshot = () => {
  return useMutation({
    mutationFn: (data: { snapshotType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' }) =>
      hrAnalyticsService.takeSnapshot(data),
    onSuccess: () => {
      invalidateCache.hrAnalytics.trends()
      toast.success('تم حفظ اللقطة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حفظ اللقطة')
    },
  })
}

/**
 * Hook to get historical trends from snapshots
 */
export const useTrends = (params?: {
  snapshotType?: string
  limit?: number
}) => {
  return useQuery<TrendSnapshot[]>({
    queryKey: QueryKeys.hrAnalytics.trends(params),
    queryFn: () => hrAnalyticsService.getTrends(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Hook to export analytics report
 */
export const useExportReport = () => {
  return useMutation({
    mutationFn: (params: {
      startDate?: string
      endDate?: string
      department?: string
      format: 'json' | 'excel' | 'pdf'
    }) => hrAnalyticsService.exportReport(params),
    onSuccess: (data, variables) => {
      if (variables.format !== 'json' && data instanceof Blob) {
        // Create download link for file exports
        const url = window.URL.createObjectURL(data)
        const a = document.createElement('a')
        a.href = url
        a.download = `hr-analytics-report.${variables.format === 'excel' ? 'xlsx' : variables.format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
      toast.success('تم تصدير التقرير بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في تصدير التقرير')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// AI PREDICTIONS HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Hook to get attrition risk scores for all employees
 */
export const useAttritionRisk = (params?: { department?: string }) => {
  return useQuery<AttritionRiskData>({
    queryKey: QueryKeys.hrAnalytics.attritionRisk(params),
    queryFn: () => hrPredictionsService.getAttritionRisk(params),
    staleTime: CACHE_TIMES.GC_MEDIUM,
  })
}

/**
 * Hook to get detailed attrition risk for a specific employee
 */
export const useEmployeeAttritionRisk = (employeeId: string) => {
  return useQuery({
    queryKey: QueryKeys.hrAnalytics.employeeAttritionRisk(employeeId),
    queryFn: () => hrPredictionsService.getEmployeeAttritionRisk(employeeId),
    enabled: !!employeeId,
    staleTime: CACHE_TIMES.GC_MEDIUM,
  })
}

/**
 * Hook to get workforce forecast (headcount projections)
 */
export const useWorkforceForecast = (months: number = 12) => {
  return useQuery<WorkforceForecastData>({
    queryKey: QueryKeys.hrAnalytics.workforceForecast(months),
    queryFn: () => hrPredictionsService.getWorkforceForecast({ months }),
    staleTime: CACHE_TIMES.GC_MEDIUM,
  })
}

/**
 * Hook to identify high-potential employees
 */
export const useHighPotential = (limit: number = 20) => {
  return useQuery<HighPotentialData>({
    queryKey: QueryKeys.hrAnalytics.highPotential(limit),
    queryFn: () => hrPredictionsService.getHighPotential({ limit }),
    staleTime: CACHE_TIMES.GC_MEDIUM,
  })
}

/**
 * Hook to get employees at high flight risk
 */
export const useFlightRisk = () => {
  return useQuery<FlightRiskData>({
    queryKey: QueryKeys.hrAnalytics.flightRisk(),
    queryFn: () => hrPredictionsService.getFlightRisk(),
    staleTime: CACHE_TIMES.GC_MEDIUM,
  })
}

/**
 * Hook to predict likely absence days
 */
export const useAbsencePredictions = () => {
  return useQuery<AbsencePredictionData>({
    queryKey: QueryKeys.hrAnalytics.absencePredictions(),
    queryFn: () => hrPredictionsService.getAbsencePredictions(),
    staleTime: CACHE_TIMES.GC_MEDIUM,
  })
}

/**
 * Hook to predict engagement trends
 */
export const useEngagementPredictions = () => {
  return useQuery<EngagementPredictionData>({
    queryKey: QueryKeys.hrAnalytics.engagementPredictions(),
    queryFn: () => hrPredictionsService.getEngagementPredictions(),
    staleTime: CACHE_TIMES.GC_MEDIUM,
  })
}

/**
 * Hook to get hiring needs forecast
 */
export const useHiringNeedsForecast = (months: number = 12) => {
  return useQuery<HiringNeedsForecastData>({
    queryKey: QueryKeys.hrAnalytics.hiringNeedsForecast(months),
    queryFn: () => hrPredictionsService.getHiringNeedsForecast(months),
    staleTime: CACHE_TIMES.GC_MEDIUM,
  })
}

/**
 * Hook to get promotion readiness assessment
 */
export const usePromotionReadiness = (threshold: number = 75) => {
  return useQuery<PromotionReadinessData>({
    queryKey: QueryKeys.hrAnalytics.promotionReadiness(threshold),
    queryFn: () => hrPredictionsService.getPromotionReadiness(threshold),
    staleTime: CACHE_TIMES.GC_MEDIUM,
  })
}

/**
 * Hook to recalculate all predictions
 */
export const useRecalculatePredictions = () => {
  return useMutation({
    mutationFn: () => hrPredictionsService.recalculate(),
    onSuccess: () => {
      invalidateCache.hrAnalytics.allPredictions()
      toast.success('تم إعادة حساب التنبؤات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إعادة الحساب')
    },
  })
}

// ==================== AGGREGATED HR ANALYTICS DASHBOARD ====================
// Single API call for all HR analytics - replaces 8 separate calls

export interface HRAnalyticsDashboardData {
  workforce: any
  headcountTrends: any
  departmentBreakdown: any
  tenureDistribution: any
  attendanceAnalytics: any
  payrollAnalytics: any
  performanceAnalytics: any
  diversityAnalytics: any
}

export const useHRAnalyticsDashboard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery<HRAnalyticsDashboardData>({
    queryKey: QueryKeys.hrAnalytics.analyticsDashboard(),
    queryFn: async () => {
      const response = await apiClient.get('/hr/analytics/dashboard')
      return response.data
    },
    staleTime: CACHE_TIMES.GC_MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

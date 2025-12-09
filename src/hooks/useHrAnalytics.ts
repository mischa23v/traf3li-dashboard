/**
 * HR Analytics Hooks
 * React Query hooks for HR analytics and AI predictions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
    queryKey: ['hr-dashboard', params],
    queryFn: () => hrAnalyticsService.getDashboard(params),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get workforce overview (uses dashboard endpoint)
 */
export const useWorkforceOverview = () => {
  return useQuery<HRDashboardData>({
    queryKey: ['hr-workforce-overview'],
    queryFn: () => hrAnalyticsService.getDashboard(),
    staleTime: 5 * 60 * 1000,
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
    queryKey: ['hr-headcount-trends', params],
    queryFn: () => hrAnalyticsService.getTrends({ limit: 12 }),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get department breakdown (uses demographics endpoint)
 */
export const useDepartmentBreakdown = () => {
  return useQuery<DemographicsData>({
    queryKey: ['hr-department-breakdown'],
    queryFn: () => hrAnalyticsService.getDemographics(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get tenure distribution (uses demographics endpoint)
 */
export const useTenureDistribution = () => {
  return useQuery<DemographicsData>({
    queryKey: ['hr-tenure-distribution'],
    queryFn: () => hrAnalyticsService.getDemographics(),
    staleTime: 5 * 60 * 1000,
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
    queryKey: ['hr-payroll-analytics', params],
    queryFn: () => hrAnalyticsService.getCompensation(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get diversity analytics (uses demographics endpoint)
 */
export const useDiversityAnalytics = () => {
  return useQuery<DemographicsData>({
    queryKey: ['hr-diversity-analytics'],
    queryFn: () => hrAnalyticsService.getDemographics(),
    staleTime: 5 * 60 * 1000,
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
    queryKey: ['hr-demographics', params],
    queryFn: () => hrAnalyticsService.getDemographics(params),
    staleTime: 5 * 60 * 1000,
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
    queryKey: ['hr-turnover', params],
    queryFn: () => hrAnalyticsService.getTurnover(params),
    staleTime: 5 * 60 * 1000,
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
    queryKey: ['hr-absenteeism', params],
    queryFn: () => hrAnalyticsService.getAbsenteeism(params),
    staleTime: 5 * 60 * 1000,
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
    queryKey: ['hr-attendance-analytics', params],
    queryFn: () => hrAnalyticsService.getAttendance(params),
    staleTime: 5 * 60 * 1000,
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
    queryKey: ['hr-performance-analytics', params],
    queryFn: () => hrAnalyticsService.getPerformance(params),
    staleTime: 5 * 60 * 1000,
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
    queryKey: ['hr-recruitment-analytics', params],
    queryFn: () => hrAnalyticsService.getRecruitment(params),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get compensation analytics
 */
export const useCompensationAnalytics = (params?: {
  department?: string
}) => {
  return useQuery<CompensationData>({
    queryKey: ['hr-compensation-analytics', params],
    queryFn: () => hrAnalyticsService.getCompensation(params),
    staleTime: 5 * 60 * 1000,
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
    queryKey: ['hr-training-analytics', params],
    queryFn: () => hrAnalyticsService.getTraining(params),
    staleTime: 5 * 60 * 1000,
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
    queryKey: ['hr-leave-analytics', params],
    queryFn: () => hrAnalyticsService.getLeave(params),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get Saudization compliance metrics
 */
export const useSaudization = () => {
  return useQuery<SaudizationData>({
    queryKey: ['hr-saudization'],
    queryFn: () => hrAnalyticsService.getSaudization(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to take a snapshot of current HR metrics
 */
export const useTakeSnapshot = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { snapshotType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' }) =>
      hrAnalyticsService.takeSnapshot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-trends'] })
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
    queryKey: ['hr-trends', params],
    queryFn: () => hrAnalyticsService.getTrends(params),
    staleTime: 5 * 60 * 1000,
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
    queryKey: ['hr-attrition-risk', params],
    queryFn: () => hrPredictionsService.getAttritionRisk(params),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to get detailed attrition risk for a specific employee
 */
export const useEmployeeAttritionRisk = (employeeId: string) => {
  return useQuery({
    queryKey: ['hr-employee-attrition-risk', employeeId],
    queryFn: () => hrPredictionsService.getEmployeeAttritionRisk(employeeId),
    enabled: !!employeeId,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to get workforce forecast (headcount projections)
 */
export const useWorkforceForecast = (months: number = 12) => {
  return useQuery<WorkforceForecastData>({
    queryKey: ['hr-workforce-forecast', months],
    queryFn: () => hrPredictionsService.getWorkforceForecast({ months }),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to identify high-potential employees
 */
export const useHighPotential = (limit: number = 20) => {
  return useQuery<HighPotentialData>({
    queryKey: ['hr-high-potential', limit],
    queryFn: () => hrPredictionsService.getHighPotential({ limit }),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to get employees at high flight risk
 */
export const useFlightRisk = () => {
  return useQuery<FlightRiskData>({
    queryKey: ['hr-flight-risk'],
    queryFn: () => hrPredictionsService.getFlightRisk(),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to predict likely absence days
 */
export const useAbsencePredictions = () => {
  return useQuery<AbsencePredictionData>({
    queryKey: ['hr-absence-predictions'],
    queryFn: () => hrPredictionsService.getAbsencePredictions(),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to predict engagement trends
 */
export const useEngagementPredictions = () => {
  return useQuery<EngagementPredictionData>({
    queryKey: ['hr-engagement-predictions'],
    queryFn: () => hrPredictionsService.getEngagementPredictions(),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to get hiring needs forecast
 */
export const useHiringNeedsForecast = (months: number = 12) => {
  return useQuery<HiringNeedsForecastData>({
    queryKey: ['hr-hiring-needs-forecast', months],
    queryFn: () => hrPredictionsService.getHiringNeedsForecast(months),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to get promotion readiness assessment
 */
export const usePromotionReadiness = (threshold: number = 75) => {
  return useQuery<PromotionReadinessData>({
    queryKey: ['hr-promotion-readiness', threshold],
    queryFn: () => hrPredictionsService.getPromotionReadiness(threshold),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to recalculate all predictions
 */
export const useRecalculatePredictions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => hrPredictionsService.recalculate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-attrition-risk'] })
      queryClient.invalidateQueries({ queryKey: ['hr-workforce-forecast'] })
      queryClient.invalidateQueries({ queryKey: ['hr-promotion-readiness'] })
      queryClient.invalidateQueries({ queryKey: ['hr-hiring-needs-forecast'] })
      queryClient.invalidateQueries({ queryKey: ['hr-high-potential'] })
      queryClient.invalidateQueries({ queryKey: ['hr-flight-risk'] })
      queryClient.invalidateQueries({ queryKey: ['hr-absence-predictions'] })
      queryClient.invalidateQueries({ queryKey: ['hr-engagement-predictions'] })
      toast.success('تم إعادة حساب التنبؤات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إعادة الحساب')
    },
  })
}

/**
 * HR Analytics Hooks
 * React Query hooks for HR analytics and AI predictions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { hrAnalyticsService, hrPredictionsService } from '@/services/hrAnalyticsService'

// ═══════════════════════════════════════════════════════════════
// WORKFORCE ANALYTICS HOOKS
// ═══════════════════════════════════════════════════════════════

export const useWorkforceOverview = () => {
  return useQuery({
    queryKey: ['hr-workforce-overview'],
    queryFn: () => hrAnalyticsService.getWorkforceOverview(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useHeadcountTrends = (params?: {
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year'
}) => {
  return useQuery({
    queryKey: ['hr-headcount-trends', params],
    queryFn: () => hrAnalyticsService.getHeadcountTrends(params || {}),
    staleTime: 5 * 60 * 1000,
  })
}

export const useDepartmentBreakdown = () => {
  return useQuery({
    queryKey: ['hr-department-breakdown'],
    queryFn: () => hrAnalyticsService.getDepartmentBreakdown(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useTenureDistribution = () => {
  return useQuery({
    queryKey: ['hr-tenure-distribution'],
    queryFn: () => hrAnalyticsService.getTenureDistribution(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useAttendanceAnalytics = (params?: {
  startDate?: string
  endDate?: string
  departmentId?: string
}) => {
  return useQuery({
    queryKey: ['hr-attendance-analytics', params],
    queryFn: () => hrAnalyticsService.getAttendanceAnalytics(params),
    staleTime: 5 * 60 * 1000,
  })
}

export const useLeaveAnalytics = (params?: {
  startDate?: string
  endDate?: string
  departmentId?: string
}) => {
  return useQuery({
    queryKey: ['hr-leave-analytics', params],
    queryFn: () => hrAnalyticsService.getLeaveAnalytics(params),
    staleTime: 5 * 60 * 1000,
  })
}

export const usePayrollAnalytics = (params?: {
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ['hr-payroll-analytics', params],
    queryFn: () => hrAnalyticsService.getPayrollAnalytics(params),
    staleTime: 5 * 60 * 1000,
  })
}

export const usePerformanceAnalytics = (params?: {
  year?: number
  departmentId?: string
}) => {
  return useQuery({
    queryKey: ['hr-performance-analytics', params],
    queryFn: () => hrAnalyticsService.getPerformanceAnalytics(params),
    staleTime: 5 * 60 * 1000,
  })
}

export const useRecruitmentAnalytics = (params?: {
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ['hr-recruitment-analytics', params],
    queryFn: () => hrAnalyticsService.getRecruitmentAnalytics(params),
    staleTime: 5 * 60 * 1000,
  })
}

export const useDiversityAnalytics = () => {
  return useQuery({
    queryKey: ['hr-diversity-analytics'],
    queryFn: () => hrAnalyticsService.getDiversityAnalytics(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useAttritionAnalytics = (params?: {
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ['hr-attrition-analytics', params],
    queryFn: () => hrAnalyticsService.getAttritionAnalytics(params),
    staleTime: 5 * 60 * 1000,
  })
}

export const useExecutiveSummary = () => {
  return useQuery({
    queryKey: ['hr-executive-summary'],
    queryFn: () => hrAnalyticsService.getExecutiveSummary(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useSaveSnapshot = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      type: string
      name?: string
      period?: { start: Date; end: Date }
    }) => hrAnalyticsService.saveSnapshot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-snapshots'] })
      toast.success('تم حفظ اللقطة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في حفظ اللقطة')
    },
  })
}

export const useSnapshots = (type?: string) => {
  return useQuery({
    queryKey: ['hr-snapshots', type],
    queryFn: () => hrAnalyticsService.getSnapshots(type),
    staleTime: 5 * 60 * 1000,
  })
}

// ═══════════════════════════════════════════════════════════════
// AI PREDICTIONS HOOKS
// ═══════════════════════════════════════════════════════════════

export const useAttritionRisk = () => {
  return useQuery({
    queryKey: ['hr-attrition-risk'],
    queryFn: () => hrPredictionsService.getAttritionRisk(),
    staleTime: 10 * 60 * 1000,
  })
}

export const useEmployeeAttritionRisk = (employeeId: string) => {
  return useQuery({
    queryKey: ['hr-employee-attrition-risk', employeeId],
    queryFn: () => hrPredictionsService.getEmployeeAttritionRisk(employeeId),
    enabled: !!employeeId,
    staleTime: 10 * 60 * 1000,
  })
}

export const useWorkforceForecast = (months: number = 12) => {
  return useQuery({
    queryKey: ['hr-workforce-forecast', months],
    queryFn: () => hrPredictionsService.getWorkforceForecast(months),
    staleTime: 10 * 60 * 1000,
  })
}

export const usePromotionReadiness = (threshold: number = 75) => {
  return useQuery({
    queryKey: ['hr-promotion-readiness', threshold],
    queryFn: () => hrPredictionsService.getPromotionReadiness(threshold),
    staleTime: 10 * 60 * 1000,
  })
}

export const useHiringNeedsForecast = (months: number = 12) => {
  return useQuery({
    queryKey: ['hr-hiring-needs-forecast', months],
    queryFn: () => hrPredictionsService.getHiringNeedsForecast(months),
    staleTime: 10 * 60 * 1000,
  })
}

export const useRecalculatePredictions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => hrPredictionsService.recalculate(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-attrition-risk'] })
      queryClient.invalidateQueries({ queryKey: ['hr-workforce-forecast'] })
      queryClient.invalidateQueries({ queryKey: ['hr-promotion-readiness'] })
      queryClient.invalidateQueries({ queryKey: ['hr-hiring-needs-forecast'] })
      toast.success('تم إعادة حساب التنبؤات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إعادة الحساب')
    },
  })
}

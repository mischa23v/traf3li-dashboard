import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { invalidateCache } from '@/lib/cache-invalidation'
import performanceReviewService, {
  type PerformanceReview,
  type PerformanceReviewFilters,
  type ReviewType,
  type SelfAssessment,
  type ManagerAssessment,
  type DevelopmentPlan,
  type DevelopmentPlanItem,
  type FeedbackProvider,
  type FeedbackResponse,
  type OverallRating,
  type ReviewTemplate,
  type CalibrationSession,
  type ReviewPeriod,
  type Goal,
  type KPI,
  type AttorneyMetrics,
  type RatingScale,
} from '@/services/performanceReviewService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// Query Keys
export const performanceReviewKeys = {
  all: ['performance-reviews'] as const,
  lists: () => [...performanceReviewKeys.all, 'list'] as const,
  list: (filters?: PerformanceReviewFilters) => [...performanceReviewKeys.lists(), filters] as const,
  details: () => [...performanceReviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...performanceReviewKeys.details(), id] as const,
  templates: () => [...performanceReviewKeys.all, 'templates'] as const,
  templatesByType: (type?: ReviewType) => [...performanceReviewKeys.templates(), type] as const,
  calibrationSessions: () => [...performanceReviewKeys.all, 'calibration-sessions'] as const,
  calibrationSessionsFiltered: (filters?: { periodYear?: number; status?: string; departmentId?: string }) =>
    [...performanceReviewKeys.calibrationSessions(), filters] as const,
  stats: (filters?: { periodYear?: number; departmentId?: string }) =>
    [...performanceReviewKeys.all, 'stats', filters] as const,
  employeeHistory: (employeeId: string) => [...performanceReviewKeys.all, 'employee-history', employeeId] as const,
  teamSummary: (managerId: string, periodYear?: number) =>
    [...performanceReviewKeys.all, 'team-summary', managerId, periodYear] as const,
}

// Hooks for Performance Reviews
export function usePerformanceReviews(filters?: PerformanceReviewFilters) {
  return useQuery({
    queryKey: performanceReviewKeys.list(filters),
    queryFn: () => performanceReviewService.getPerformanceReviews(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function usePerformanceReview(reviewId: string) {
  return useQuery({
    queryKey: performanceReviewKeys.detail(reviewId),
    queryFn: () => performanceReviewService.getPerformanceReview(reviewId),
    enabled: !!reviewId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function useCreatePerformanceReview() {
  return useMutation({
    mutationFn: (data: {
      employeeId: string
      reviewType: ReviewType
      reviewPeriod: ReviewPeriod
      templateId?: string
      goals?: Omit<Goal, 'goalId' | 'status' | 'selfRating' | 'managerRating'>[]
      kpis?: Omit<KPI, 'kpiId' | 'actual' | 'achievement' | 'rating'>[]
      include360Feedback?: boolean
      feedbackProviders?: Omit<FeedbackProvider, 'status' | 'requestedAt' | 'completedAt'>[]
    }) => performanceReviewService.createPerformanceReview(data),
    onSuccess: () => {
      invalidateCache.performanceReviews.lists()
    },
  })
}

export function useUpdatePerformanceReview() {
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: Partial<PerformanceReview> }) =>
      performanceReviewService.updatePerformanceReview(reviewId, data),
    onSuccess: (_, { reviewId }) => {
      invalidateCache.performanceReviews.detail(reviewId)
      invalidateCache.performanceReviews.lists()
    },
  })
}

export function useSubmitSelfAssessment() {
  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string
      data: SelfAssessment & {
        competencyRatings: { competencyId: string; rating: RatingScale; comments: string }[]
        goalRatings: { goalId: string; rating: RatingScale; actualResult: string; comments: string }[]
      }
    }) => performanceReviewService.submitSelfAssessment(reviewId, data),
    onSuccess: (_, { reviewId }) => {
      invalidateCache.performanceReviews.detail(reviewId)
      invalidateCache.performanceReviews.lists()
    },
  })
}

export function useSubmitManagerAssessment() {
  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string
      data: ManagerAssessment & {
        competencyRatings: { competencyId: string; rating: RatingScale; comments: string; examples: string[] }[]
        goalRatings: { goalId: string; rating: RatingScale; comments: string }[]
        kpiRatings?: { kpiId: string; actual: number }[]
        attorneyMetrics?: AttorneyMetrics
      }
    }) => performanceReviewService.submitManagerAssessment(reviewId, data),
    onSuccess: (_, { reviewId }) => {
      invalidateCache.performanceReviews.detail(reviewId)
      invalidateCache.performanceReviews.lists()
    },
  })
}

export function useRequest360Feedback() {
  return useMutation({
    mutationFn: ({
      reviewId,
      providers,
    }: {
      reviewId: string
      providers: Omit<FeedbackProvider, 'status' | 'requestedAt' | 'completedAt'>[]
    }) => performanceReviewService.request360Feedback(reviewId, providers),
    onSuccess: (_, { reviewId }) => {
      invalidateCache.performanceReviews.detail(reviewId)
    },
  })
}

export function useSubmit360Feedback() {
  return useMutation({
    mutationFn: ({
      reviewId,
      providerId,
      data,
    }: {
      reviewId: string
      providerId: string
      data: Omit<FeedbackResponse, 'providerId' | 'submittedAt'>
    }) => performanceReviewService.submit360Feedback(reviewId, providerId, data),
    onSuccess: (_, { reviewId }) => {
      invalidateCache.performanceReviews.detail(reviewId)
    },
  })
}

export function useCreateDevelopmentPlan() {
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: DevelopmentPlan }) =>
      performanceReviewService.createDevelopmentPlan(reviewId, data),
    onSuccess: (_, { reviewId }) => {
      invalidateCache.performanceReviews.detail(reviewId)
    },
  })
}

export function useUpdateDevelopmentPlanItem() {
  return useMutation({
    mutationFn: ({
      reviewId,
      itemId,
      data,
    }: {
      reviewId: string
      itemId: string
      data: Partial<DevelopmentPlanItem>
    }) => performanceReviewService.updateDevelopmentPlanItem(reviewId, itemId, data),
    onSuccess: (_, { reviewId }) => {
      invalidateCache.performanceReviews.detail(reviewId)
    },
  })
}

export function useSubmitForCalibration() {
  return useMutation({
    mutationFn: ({ reviewId, calibrationSessionId }: { reviewId: string; calibrationSessionId: string }) =>
      performanceReviewService.submitForCalibration(reviewId, calibrationSessionId),
    onSuccess: (_, { reviewId }) => {
      invalidateCache.performanceReviews.detail(reviewId)
      invalidateCache.performanceReviews.lists()
      invalidateCache.performanceReviews.calibrationSessions()
    },
  })
}

export function useApplyCalibration() {
  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string
      data: {
        finalRating: OverallRating
        adjustmentReason?: string
        comparativeRanking?: number
      }
    }) => performanceReviewService.applyCalibration(reviewId, data),
    onSuccess: (_, { reviewId }) => {
      invalidateCache.performanceReviews.detail(reviewId)
      invalidateCache.performanceReviews.lists()
    },
  })
}

export function useCompleteReview() {
  return useMutation({
    mutationFn: (reviewId: string) => performanceReviewService.completeReview(reviewId),
    onSuccess: (_, reviewId) => {
      invalidateCache.performanceReviews.detail(reviewId)
      invalidateCache.performanceReviews.lists()
    },
  })
}

export function useAcknowledgeReview() {
  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: string
      data: {
        employeeComments?: string
        disputeRaised?: boolean
        disputeReason?: string
      }
    }) => performanceReviewService.acknowledgeReview(reviewId, data),
    onSuccess: (_, { reviewId }) => {
      invalidateCache.performanceReviews.detail(reviewId)
      invalidateCache.performanceReviews.lists()
    },
  })
}

export function useApproveReviewStep() {
  return useMutation({
    mutationFn: ({
      reviewId,
      stepNumber,
      comments,
    }: {
      reviewId: string
      stepNumber: number
      comments?: string
    }) => performanceReviewService.approveReviewStep(reviewId, stepNumber, { comments }),
    onSuccess: (_, { reviewId }) => {
      invalidateCache.performanceReviews.detail(reviewId)
      invalidateCache.performanceReviews.lists()
    },
  })
}

export function useRejectReviewStep() {
  return useMutation({
    mutationFn: ({
      reviewId,
      stepNumber,
      comments,
    }: {
      reviewId: string
      stepNumber: number
      comments: string
    }) => performanceReviewService.rejectReviewStep(reviewId, stepNumber, { comments }),
    onSuccess: (_, { reviewId }) => {
      invalidateCache.performanceReviews.detail(reviewId)
      invalidateCache.performanceReviews.lists()
    },
  })
}

// Template Hooks
export function useReviewTemplates(reviewType?: ReviewType) {
  return useQuery({
    queryKey: performanceReviewKeys.templatesByType(reviewType),
    queryFn: () => performanceReviewService.getReviewTemplates(reviewType),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function useCreateReviewTemplate() {
  return useMutation({
    mutationFn: (data: Omit<ReviewTemplate, '_id' | 'templateId'>) =>
      performanceReviewService.createReviewTemplate(data),
    onSuccess: () => {
      invalidateCache.performanceReviews.templates()
    },
  })
}

// Calibration Session Hooks
export function useCalibrationSessions(filters?: { periodYear?: number; status?: string; departmentId?: string }) {
  return useQuery({
    queryKey: performanceReviewKeys.calibrationSessionsFiltered(filters),
    queryFn: () => performanceReviewService.getCalibrationSessions(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function useCreateCalibrationSession() {
  return useMutation({
    mutationFn: (
      data: Omit<CalibrationSession, '_id' | 'sessionId' | 'status' | 'ratingDistribution' | 'completedAt'>
    ) => performanceReviewService.createCalibrationSession(data),
    onSuccess: () => {
      invalidateCache.performanceReviews.calibrationSessions()
    },
  })
}

export function useCompleteCalibrationSession() {
  return useMutation({
    mutationFn: (sessionId: string) => performanceReviewService.completeCalibrationSession(sessionId),
    onSuccess: () => {
      invalidateCache.performanceReviews.calibrationSessions()
      invalidateCache.performanceReviews.lists()
    },
  })
}

// Statistics Hooks
export function usePerformanceStats(filters?: { periodYear?: number; departmentId?: string }) {
  return useQuery({
    queryKey: performanceReviewKeys.stats(filters),
    queryFn: () => performanceReviewService.getPerformanceStats(filters),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function useEmployeePerformanceHistory(employeeId: string) {
  return useQuery({
    queryKey: performanceReviewKeys.employeeHistory(employeeId),
    queryFn: () => performanceReviewService.getEmployeePerformanceHistory(employeeId),
    enabled: !!employeeId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export function useTeamPerformanceSummary(managerId: string, periodYear?: number) {
  return useQuery({
    queryKey: performanceReviewKeys.teamSummary(managerId, periodYear),
    queryFn: () => performanceReviewService.getTeamPerformanceSummary(managerId, periodYear),
    enabled: !!managerId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Bulk Operations
export function useBulkCreateReviews() {
  return useMutation({
    mutationFn: (data: {
      departmentId?: string
      employeeIds?: string[]
      reviewType: ReviewType
      reviewPeriod: ReviewPeriod
      templateId: string
    }) => performanceReviewService.bulkCreateReviews(data),
    onSuccess: () => {
      invalidateCache.performanceReviews.lists()
    },
  })
}

export function useSendReminder() {
  return useMutation({
    mutationFn: ({
      reviewId,
      reminderType,
    }: {
      reviewId: string
      reminderType: 'self_assessment' | 'manager_review' | '360_feedback' | 'acknowledgement'
    }) => performanceReviewService.sendReminder(reviewId, reminderType),
  })
}

export function useExportReviews() {
  return useMutation({
    mutationFn: ({ filters, format }: { filters?: PerformanceReviewFilters; format?: 'pdf' | 'excel' }) =>
      performanceReviewService.exportReviews(filters, format),
  })
}

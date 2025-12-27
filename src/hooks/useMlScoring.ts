/**
 * ML Lead Scoring Hooks
 * React Query hooks for ML scoring, priority queue, SLA management, and analytics
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { CACHE_TIMES } from '@/config/cache'
import {
  getMLScores,
  getMLScore,
  calculateMLScore,
  batchCalculateScores,
  getScoreExplanation,
  getHybridScore,
  getPriorityQueue,
  getTeamWorkload,
  recordContact,
  assignLead,
  getSLAMetrics,
  getSLABreaches,
  getMLDashboard,
  getFeatureImportance,
  getScoreDistribution,
  trainModel,
  getModelMetrics,
  exportTrainingData,
  type MLScore,
  type PriorityQueueItem,
  type TeamWorkloadItem,
  type SLABreachItem,
  type SLAMetrics,
  type MLDashboardData,
  type FeatureImportance,
  type ScoreDistribution,
  type ModelMetrics,
  type ContactData,
  type GetMLScoresParams,
  type GetPriorityQueueParams,
  type GetMLDashboardParams,
  type HybridScoreWeights,
  type TrainModelOptions,
  type PaginationMeta,
  type SHAPExplanation,
  type SalesExplanation,
} from '@/services/mlScoringApi'

// ==================== QUERY KEYS ====================

export const mlScoringKeys = {
  all: ['ml-scoring'] as const,
  scores: () => [...mlScoringKeys.all, 'scores'] as const,
  scoresList: (params?: GetMLScoresParams) => [...mlScoringKeys.scores(), 'list', params] as const,
  score: (leadId: string) => [...mlScoringKeys.scores(), 'detail', leadId] as const,
  explanation: (leadId: string) => [...mlScoringKeys.scores(), 'explanation', leadId] as const,
  hybrid: (leadId: string) => [...mlScoringKeys.scores(), 'hybrid', leadId] as const,
  priorityQueue: () => [...mlScoringKeys.all, 'priority-queue'] as const,
  priorityQueueList: (params?: GetPriorityQueueParams) => [...mlScoringKeys.priorityQueue(), 'list', params] as const,
  teamWorkload: () => [...mlScoringKeys.priorityQueue(), 'workload'] as const,
  sla: () => [...mlScoringKeys.all, 'sla'] as const,
  slaMetrics: (period?: string) => [...mlScoringKeys.sla(), 'metrics', period] as const,
  slaBreaches: () => [...mlScoringKeys.sla(), 'breaches'] as const,
  analytics: () => [...mlScoringKeys.all, 'analytics'] as const,
  dashboard: (params?: GetMLDashboardParams) => [...mlScoringKeys.analytics(), 'dashboard', params] as const,
  featureImportance: () => [...mlScoringKeys.analytics(), 'feature-importance'] as const,
  scoreDistribution: () => [...mlScoringKeys.analytics(), 'score-distribution'] as const,
  modelMetrics: () => [...mlScoringKeys.all, 'model-metrics'] as const,
}

// ==================== SCORE HOOKS ====================

/**
 * Get paginated list of ML scores
 */
export const useMLScores = (params?: GetMLScoresParams) => {
  return useQuery<{ data: MLScore[]; pagination: PaginationMeta }>({
    queryKey: mlScoringKeys.scoresList(params),
    queryFn: () => getMLScores(params),
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Get ML score for a specific lead
 */
export const useMLScore = (leadId: string, enabled = true) => {
  return useQuery<{ data: MLScore }>({
    queryKey: mlScoringKeys.score(leadId),
    queryFn: () => getMLScore(leadId),
    enabled: enabled && !!leadId,
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Get SHAP explanation for a lead
 */
export const useScoreExplanation = (leadId: string, enabled = true) => {
  return useQuery<{ data: { shap: SHAPExplanation; salesExplanation: SalesExplanation } }>({
    queryKey: mlScoringKeys.explanation(leadId),
    queryFn: () => getScoreExplanation(leadId),
    enabled: enabled && !!leadId,
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get hybrid score for a lead
 */
export const useHybridScore = (leadId: string, weights?: HybridScoreWeights, enabled = true) => {
  return useQuery({
    queryKey: mlScoringKeys.hybrid(leadId),
    queryFn: () => getHybridScore(leadId, weights),
    enabled: enabled && !!leadId,
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Calculate/refresh ML score for a lead
 */
export const useCalculateMLScore = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (leadId: string) => calculateMLScore(leadId),
    onSuccess: (data, leadId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.score(leadId) })
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.scoresList() })
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.priorityQueueList() })
      toast.success(t('mlScoring.scoreCalculated', 'Score calculated successfully'))
    },
    onError: (error: any) => {
      toast.error(error?.message || t('mlScoring.scoreCalculationFailed', 'Failed to calculate score'))
    },
  })
}

/**
 * Batch calculate scores for multiple leads
 */
export const useBatchCalculateScores = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (leadIds: string[]) => batchCalculateScores(leadIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.scores() })
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.priorityQueueList() })
      const successCount = data.data.results.length
      const failedCount = data.data.failed.length
      if (failedCount > 0) {
        toast.warning(
          t('mlScoring.batchPartialSuccess', 'Calculated {{success}} scores, {{failed}} failed', {
            success: successCount,
            failed: failedCount,
          })
        )
      } else {
        toast.success(t('mlScoring.batchSuccess', 'Calculated {{count}} scores', { count: successCount }))
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || t('mlScoring.batchFailed', 'Batch calculation failed'))
    },
  })
}

// ==================== PRIORITY QUEUE HOOKS ====================

/**
 * Get prioritized leads queue
 */
export const usePriorityQueue = (params?: GetPriorityQueueParams) => {
  return useQuery<{ data: PriorityQueueItem[] }>({
    queryKey: mlScoringKeys.priorityQueueList(params),
    queryFn: () => getPriorityQueue(params),
    staleTime: CACHE_TIMES.CALENDAR.GRID, // 1 minute - more frequent updates for queue
    refetchInterval: CACHE_TIMES.MEDIUM, // Auto-refresh every 5 minutes
  })
}

/**
 * Get team workload distribution
 */
export const useTeamWorkload = () => {
  return useQuery<{ data: { workload: TeamWorkloadItem[] } }>({
    queryKey: mlScoringKeys.teamWorkload(),
    queryFn: () => getTeamWorkload(),
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Record contact with a lead
 */
export const useRecordContact = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: ContactData }) => recordContact(leadId, data),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.priorityQueueList() })
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.score(leadId) })
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.slaBreaches() })
      toast.success(t('mlScoring.contactRecorded', 'Contact recorded successfully'))
    },
    onError: (error: any) => {
      toast.error(error?.message || t('mlScoring.contactFailed', 'Failed to record contact'))
    },
  })
}

/**
 * Assign lead to a sales rep
 */
export const useAssignLead = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ leadId, userId }: { leadId: string; userId: string }) => assignLead(leadId, userId),
    onSuccess: (_, { leadId }) => {
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.priorityQueueList() })
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.score(leadId) })
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.teamWorkload() })
      toast.success(t('mlScoring.leadAssigned', 'Lead assigned successfully'))
    },
    onError: (error: any) => {
      toast.error(error?.message || t('mlScoring.assignFailed', 'Failed to assign lead'))
    },
  })
}

// ==================== SLA HOOKS ====================

/**
 * Get SLA metrics
 */
export const useSLAMetrics = (period?: string) => {
  return useQuery<{ data: SLAMetrics }>({
    queryKey: mlScoringKeys.slaMetrics(period),
    queryFn: () => getSLAMetrics(period),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get current SLA breaches
 */
export const useSLABreaches = () => {
  return useQuery<{ data: { breaches: SLABreachItem[] } }>({
    queryKey: mlScoringKeys.slaBreaches(),
    queryFn: () => getSLABreaches(),
    staleTime: CACHE_TIMES.CALENDAR.GRID, // 1 minute - important to keep updated
    refetchInterval: CACHE_TIMES.SHORT, // Auto-refresh every 2 minutes
  })
}

// ==================== ANALYTICS HOOKS ====================

/**
 * Get ML dashboard analytics
 */
export const useMLDashboard = (params?: GetMLDashboardParams) => {
  return useQuery<{ data: MLDashboardData }>({
    queryKey: mlScoringKeys.dashboard(params),
    queryFn: () => getMLDashboard(params),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get feature importance
 */
export const useFeatureImportance = () => {
  return useQuery<{ data: { features: FeatureImportance[] } }>({
    queryKey: mlScoringKeys.featureImportance(),
    queryFn: () => getFeatureImportance(),
    staleTime: CACHE_TIMES.LONG, // 30 minutes - doesn't change often
  })
}

/**
 * Get score distribution
 */
export const useScoreDistribution = () => {
  return useQuery<{ data: ScoreDistribution }>({
    queryKey: mlScoringKeys.scoreDistribution(),
    queryFn: () => getScoreDistribution(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

// ==================== ADMIN/TRAINING HOOKS ====================

/**
 * Get model metrics
 */
export const useModelMetrics = () => {
  return useQuery<{ data: ModelMetrics }>({
    queryKey: mlScoringKeys.modelMetrics(),
    queryFn: () => getModelMetrics(),
    staleTime: CACHE_TIMES.LONG, // 30 minutes (was 10 minutes)
  })
}

/**
 * Train the ML model
 */
export const useTrainModel = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (options?: TrainModelOptions) => trainModel(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.modelMetrics() })
      queryClient.invalidateQueries({ queryKey: mlScoringKeys.featureImportance() })
      toast.success(t('mlScoring.modelTrained', 'Model trained successfully'))
    },
    onError: (error: any) => {
      toast.error(error?.message || t('mlScoring.trainingFailed', 'Model training failed'))
    },
  })
}

/**
 * Export training data
 */
export const useExportTrainingData = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (format: 'json' | 'csv') => exportTrainingData(format),
    onSuccess: (blob, format) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `training-data.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success(t('mlScoring.dataExported', 'Training data exported'))
    },
    onError: (error: any) => {
      toast.error(error?.message || t('mlScoring.exportFailed', 'Export failed'))
    },
  })
}

// ==================== UTILITY HOOKS ====================

/**
 * Prefetch ML score for a lead (useful for hover states)
 */
export const usePrefetchMLScore = () => {
  const queryClient = useQueryClient()

  return (leadId: string) => {
    queryClient.prefetchQuery({
      queryKey: mlScoringKeys.score(leadId),
      queryFn: () => getMLScore(leadId),
      staleTime: CACHE_TIMES.SHORT,
    })
  }
}

/**
 * Invalidate all ML scoring queries (useful after major changes)
 */
export const useInvalidateMLScoring = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: mlScoringKeys.all })
  }
}

export default {
  // Keys
  mlScoringKeys,
  // Score hooks
  useMLScores,
  useMLScore,
  useScoreExplanation,
  useHybridScore,
  useCalculateMLScore,
  useBatchCalculateScores,
  // Priority queue hooks
  usePriorityQueue,
  useTeamWorkload,
  useRecordContact,
  useAssignLead,
  // SLA hooks
  useSLAMetrics,
  useSLABreaches,
  // Analytics hooks
  useMLDashboard,
  useFeatureImportance,
  useScoreDistribution,
  // Training hooks
  useModelMetrics,
  useTrainModel,
  useExportTrainingData,
  // Utility hooks
  usePrefetchMLScore,
  useInvalidateMLScoring,
}

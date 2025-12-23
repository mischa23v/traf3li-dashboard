/**
 * ML Lead Scoring API Service
 * Endpoints for ML scoring, priority queue, SLA management, and analytics
 */

import { apiClientNoVersion as api } from '@/lib/api'

// ==================== TYPES ====================

export interface MLScoreFeatures {
  engagementVelocity: number
  responseSpeedPercentile: number
  meetingReliability: number
  urgencySignal: number
  activitiesLast7d: number
  activityTrend: number
  sourceConversionRate: number
}

export interface SHAPExplanation {
  baseValue: number
  featureContributions: Record<string, number>
  topPositiveFactors: Array<{ feature: string; impact: number; value: any }>
  topNegativeFactors: Array<{ feature: string; impact: number; value: any }>
}

export interface SalesExplanation {
  keyStrengths: string[]
  keyWeaknesses: string[]
  recommendedActions: string[]
  urgencyLevel: 'immediate' | 'soon' | 'scheduled' | 'nurture'
}

export type PriorityTier = 'P1_HOT' | 'P2_WARM' | 'P3_COOL' | 'P4_NURTURE'

export interface MLScoreData {
  enabled: boolean
  probability: number
  calibrated: boolean
  modelVersion: string
  method: 'batch' | 'realtime'
  confidence: number
  lastScoredAt: string
  shap?: SHAPExplanation
  salesExplanation?: SalesExplanation
}

export interface SalesPriority {
  tier: PriorityTier
  expectedValue: number
  slaDeadline: string
  assignedTo?: string
  escalationLevel: number
}

export interface MLScore {
  leadId: string
  mlScore: MLScoreData
  salesPriority: SalesPriority
  features: MLScoreFeatures
}

export type SLAStatus = 'on_track' | 'at_risk' | 'breached'

export interface PriorityQueueItem {
  leadId: string
  leadName: string
  score: number
  mlProbability: number
  tier: PriorityTier
  expectedValue: number
  slaDeadline: string
  slaStatus: SLAStatus
  timeUntilSLA: string
  urgencyScore: number
}

export interface TeamWorkloadItem {
  userId: string
  name: string
  leadCount: number
  totalValue: number
}

export interface SLABreachItem {
  leadId: string
  leadName?: string
  tier: PriorityTier
  breachedAt: string
}

export interface SLATierMetrics {
  targetMinutes: number
  avgResponseMinutes: number
  successRate: number
}

export interface SLAMetrics {
  breachRate: number
  avgResponseTime: number
  byTier: Record<string, SLATierMetrics>
}

export interface FeatureImportance {
  name: string
  importance: number
}

export interface ScoreDistribution {
  high: number
  medium: number
  low: number
  buckets?: Array<{ range: string; count: number }>
}

export interface MLDashboardData {
  modelAccuracy: number
  precision: number
  recall: number
  f1Score: number
  totalScored: number
  avgScore: number
  conversionRate: number
  topPerformingTier: PriorityTier
}

export interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  auc: number
  lastTrainedAt: string
  trainingDataSize: number
  modelVersion: string
}

export type ContactType = 'call' | 'email' | 'meeting' | 'whatsapp'

export interface ContactData {
  contactType: ContactType
  notes?: string
  duration?: number
  outcome?: string
}

// ==================== PAGINATION ====================

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// ==================== API PARAMS ====================

export interface GetMLScoresParams {
  page?: number
  limit?: number
  minScore?: number
  maxScore?: number
  tier?: PriorityTier
}

export interface GetPriorityQueueParams {
  limit?: number
  filterBy?: 'all' | 'mine' | 'unassigned' | 'overdue'
  tier?: PriorityTier
}

export interface GetMLDashboardParams {
  period?: number
  groupBy?: 'day' | 'week' | 'month'
}

export interface HybridScoreWeights {
  ml?: number
  rules?: number
}

export interface TrainModelOptions {
  algorithm?: 'neural' | 'gradient_boost' | 'random_forest'
  testSize?: number
}

// ==================== SCORE ENDPOINTS ====================

/**
 * Get paginated list of ML scores
 */
export const getMLScores = async (params?: GetMLScoresParams) => {
  const response = await api.get<{ data: MLScore[]; pagination: PaginationMeta }>('/ml/scores', { params })
  return response.data
}

/**
 * Get ML score for a specific lead
 */
export const getMLScore = async (leadId: string) => {
  const response = await api.get<{ data: MLScore }>(`/ml/scores/${leadId}`)
  return response.data
}

/**
 * Calculate or refresh ML score for a lead
 */
export const calculateMLScore = async (leadId: string) => {
  const response = await api.post<{ data: MLScore }>(`/ml/scores/${leadId}/calculate`)
  return response.data
}

/**
 * Batch calculate scores for multiple leads (max 100)
 */
export const batchCalculateScores = async (leadIds: string[]) => {
  const response = await api.post<{ data: { results: MLScore[]; failed: string[] } }>('/ml/scores/batch', { leadIds })
  return response.data
}

/**
 * Get SHAP explanation for a lead score
 */
export const getScoreExplanation = async (leadId: string) => {
  const response = await api.get<{ data: { shap: SHAPExplanation; salesExplanation: SalesExplanation } }>(`/ml/scores/${leadId}/explanation`)
  return response.data
}

/**
 * Get hybrid ML + rules score
 */
export const getHybridScore = async (leadId: string, weights?: HybridScoreWeights) => {
  const response = await api.get<{ data: { hybridScore: number; mlScore: number; rulesScore: number; weights: HybridScoreWeights } }>(
    `/ml/scores/${leadId}/hybrid`,
    { params: weights }
  )
  return response.data
}

// ==================== PRIORITY QUEUE ENDPOINTS ====================

/**
 * Get prioritized leads queue
 */
export const getPriorityQueue = async (params?: GetPriorityQueueParams) => {
  const response = await api.get<{ data: PriorityQueueItem[] }>('/ml/priority-queue', { params })
  return response.data
}

/**
 * Get team workload distribution
 */
export const getTeamWorkload = async () => {
  const response = await api.get<{ data: { workload: TeamWorkloadItem[] } }>('/ml/priority-queue/workload')
  return response.data
}

/**
 * Record contact with a lead (resets SLA timer)
 */
export const recordContact = async (leadId: string, data: ContactData) => {
  const response = await api.post<{ data: { success: boolean; newSlaDeadline: string } }>(`/ml/priority/${leadId}/contact`, data)
  return response.data
}

/**
 * Assign lead to a sales rep
 */
export const assignLead = async (leadId: string, userId: string) => {
  const response = await api.put<{ data: { success: boolean } }>(`/ml/priority/${leadId}/assign`, { userId })
  return response.data
}

// ==================== SLA ENDPOINTS ====================

/**
 * Get SLA metrics for a period
 */
export const getSLAMetrics = async (period?: string) => {
  const response = await api.get<{ data: SLAMetrics }>('/ml/sla/metrics', { params: { period } })
  return response.data
}

/**
 * Get current SLA breaches
 */
export const getSLABreaches = async () => {
  const response = await api.get<{ data: { breaches: SLABreachItem[] } }>('/ml/sla/breaches')
  return response.data
}

// ==================== ANALYTICS ENDPOINTS ====================

/**
 * Get ML dashboard analytics
 */
export const getMLDashboard = async (params?: GetMLDashboardParams) => {
  const response = await api.get<{ data: MLDashboardData }>('/ml/analytics/dashboard', { params })
  return response.data
}

/**
 * Get feature importance from the model
 */
export const getFeatureImportance = async () => {
  const response = await api.get<{ data: { features: FeatureImportance[] } }>('/ml/analytics/feature-importance')
  return response.data
}

/**
 * Get score distribution across leads
 */
export const getScoreDistribution = async () => {
  const response = await api.get<{ data: ScoreDistribution }>('/ml/analytics/score-distribution')
  return response.data
}

// ==================== ADMIN/TRAINING ENDPOINTS ====================

/**
 * Train the ML model (admin only)
 */
export const trainModel = async (options?: TrainModelOptions) => {
  const response = await api.post<{ data: { success: boolean; metrics: ModelMetrics } }>('/ml/train', options)
  return response.data
}

/**
 * Get model performance metrics (admin only)
 */
export const getModelMetrics = async () => {
  const response = await api.get<{ data: ModelMetrics }>('/ml/model/metrics')
  return response.data
}

/**
 * Export training data (admin only)
 */
export const exportTrainingData = async (format: 'json' | 'csv') => {
  const response = await api.post<Blob>('/ml/model/export', { format }, { responseType: 'blob' })
  return response.data
}

// ==================== EXPORT ====================

export default {
  // Scores
  getMLScores,
  getMLScore,
  calculateMLScore,
  batchCalculateScores,
  getScoreExplanation,
  getHybridScore,
  // Priority Queue
  getPriorityQueue,
  getTeamWorkload,
  recordContact,
  assignLead,
  // SLA
  getSLAMetrics,
  getSLABreaches,
  // Analytics
  getMLDashboard,
  getFeatureImportance,
  getScoreDistribution,
  // Training
  trainModel,
  getModelMetrics,
  exportTrainingData,
}

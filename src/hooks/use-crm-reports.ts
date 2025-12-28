/**
 * CRM Reports Hooks
 * TanStack Query hooks for CRM analytics and reporting operations
 *
 * Follows the pattern established in useAccounting.ts with:
 * - Proper query keys for cache management
 * - Filter parameters for flexible reporting
 * - Appropriate staleTime and gcTime
 * - TypeScript types for type safety
 * - Bilingual error handling
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { QueryKeys } from '@/lib/query-keys'
import { invalidateCache } from '@/lib/cache-invalidation'
import apiClient from '@/lib/api'
import { throwBilingualError } from '@/lib/bilingualErrorHandler'

// ==================== CACHE CONFIGURATION ====================
const REPORTS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes - reports are expensive
const REPORTS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const REALTIME_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for frequently viewed reports

// ==================== QUERY KEYS ====================
export const crmReportKeys = {
  all: () => ['crm-reports'] as const,

  // Pipeline Reports
  pipeline: () => [...crmReportKeys.all(), 'pipeline'] as const,
  pipelineOverview: (filters?: PipelineFilters) => [...crmReportKeys.pipeline(), 'overview', filters] as const,
  pipelineVelocity: (filters?: PipelineFilters) => [...crmReportKeys.pipeline(), 'velocity', filters] as const,
  stageDuration: (filters?: PipelineFilters) => [...crmReportKeys.pipeline(), 'stage-duration', filters] as const,
  dealAging: (filters?: PipelineFilters) => [...crmReportKeys.pipeline(), 'deal-aging', filters] as const,
  pipelineMovement: (filters?: PipelineFilters) => [...crmReportKeys.pipeline(), 'movement', filters] as const,

  // Lead Reports
  leads: () => [...crmReportKeys.all(), 'leads'] as const,
  leadsBySource: (filters?: DateRangeFilters) => [...crmReportKeys.leads(), 'by-source', filters] as const,
  leadConversionFunnel: (filters?: DateRangeFilters) => [...crmReportKeys.leads(), 'conversion-funnel', filters] as const,
  leadResponseTime: (filters?: DateRangeFilters) => [...crmReportKeys.leads(), 'response-time', filters] as const,
  leadVelocityRate: (filters?: DateRangeFilters) => [...crmReportKeys.leads(), 'velocity-rate', filters] as const,
  leadDistribution: (filters?: DateRangeFilters) => [...crmReportKeys.leads(), 'distribution', filters] as const,

  // Activity Reports
  activities: () => [...crmReportKeys.all(), 'activities'] as const,
  activitySummary: (filters?: DateRangeFilters) => [...crmReportKeys.activities(), 'summary', filters] as const,
  callAnalytics: (filters?: DateRangeFilters) => [...crmReportKeys.activities(), 'calls', filters] as const,
  emailEngagement: (filters?: DateRangeFilters) => [...crmReportKeys.activities(), 'emails', filters] as const,
  meetingAnalytics: (filters?: DateRangeFilters) => [...crmReportKeys.activities(), 'meetings', filters] as const,
  taskCompletion: (filters?: DateRangeFilters) => [...crmReportKeys.activities(), 'tasks', filters] as const,

  // Revenue Reports
  revenue: () => [...crmReportKeys.all(), 'revenue'] as const,
  salesForecast: (filters?: ForecastFilters) => [...crmReportKeys.revenue(), 'forecast', filters] as const,
  revenueAnalysis: (filters?: DateRangeFilters) => [...crmReportKeys.revenue(), 'analysis', filters] as const,
  quotaAttainment: (filters?: QuotaFilters) => [...crmReportKeys.revenue(), 'quota-attainment', filters] as const,
  winRateAnalysis: (filters?: DateRangeFilters) => [...crmReportKeys.revenue(), 'win-rate', filters] as const,
  dealSizeAnalysis: (filters?: DateRangeFilters) => [...crmReportKeys.revenue(), 'deal-size', filters] as const,

  // Performance Reports
  performance: () => [...crmReportKeys.all(), 'performance'] as const,
  salesLeaderboard: (filters?: LeaderboardFilters) => [...crmReportKeys.performance(), 'leaderboard', filters] as const,
  teamPerformance: (filters?: TeamFilters) => [...crmReportKeys.performance(), 'team', filters] as const,
  repScorecard: (filters?: RepFilters) => [...crmReportKeys.performance(), 'rep-scorecard', filters] as const,
  activityMetricsByRep: (filters?: RepFilters) => [...crmReportKeys.performance(), 'activity-metrics', filters] as const,

  // Customer Reports
  customers: () => [...crmReportKeys.all(), 'customers'] as const,
  customerLifetimeValue: (filters?: DateRangeFilters) => [...crmReportKeys.customers(), 'ltv', filters] as const,
  churnAnalysis: (filters?: DateRangeFilters) => [...crmReportKeys.customers(), 'churn', filters] as const,
  customerHealthScore: (filters?: HealthScoreFilters) => [...crmReportKeys.customers(), 'health-score', filters] as const,
  accountEngagement: (filters?: DateRangeFilters) => [...crmReportKeys.customers(), 'engagement', filters] as const,

  // Win/Loss Reports
  winLoss: () => [...crmReportKeys.all(), 'win-loss'] as const,
  winLossAnalysis: (filters?: DateRangeFilters) => [...crmReportKeys.winLoss(), 'analysis', filters] as const,
  lostDealsAnalysis: (filters?: DateRangeFilters) => [...crmReportKeys.winLoss(), 'lost-deals', filters] as const,
  competitorTracking: (filters?: DateRangeFilters) => [...crmReportKeys.winLoss(), 'competitors', filters] as const,

  // Territory Reports
  territory: () => [...crmReportKeys.all(), 'territory'] as const,
  territoryPerformance: (filters?: TerritoryFilters) => [...crmReportKeys.territory(), 'performance', filters] as const,
  regionalSales: (filters?: TerritoryFilters) => [...crmReportKeys.territory(), 'regional-sales', filters] as const,
  geographicPipeline: (filters?: TerritoryFilters) => [...crmReportKeys.territory(), 'geographic-pipeline', filters] as const,

  // Transaction Log
  transactions: () => [...crmReportKeys.all(), 'transactions'] as const,
  transactionsList: (filters?: TransactionFilters) => [...crmReportKeys.transactions(), 'list', filters] as const,
  transactionSummary: (filters?: DateRangeFilters) => [...crmReportKeys.transactions(), 'summary', filters] as const,
} as const

// ==================== TYPE DEFINITIONS ====================

// Base Filters
export interface DateRangeFilters {
  startDate?: string
  endDate?: string
  dateRange?: 'today' | 'last_7_days' | 'last_30_days' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'this_year' | 'last_year' | 'custom'
}

export interface PipelineFilters extends DateRangeFilters {
  pipelineId?: string
  stageId?: string
  salesPersonId?: string
  teamId?: string
}

export interface ForecastFilters extends DateRangeFilters {
  pipelineId?: string
  salesPersonId?: string
  teamId?: string
  period?: 'monthly' | 'quarterly' | 'yearly'
}

export interface QuotaFilters extends DateRangeFilters {
  salesPersonId?: string
  teamId?: string
  period?: 'monthly' | 'quarterly' | 'yearly'
}

export interface LeaderboardFilters extends DateRangeFilters {
  teamId?: string
  limit?: number
  metric?: 'revenue' | 'deals_won' | 'activities' | 'conversion_rate'
}

export interface TeamFilters extends DateRangeFilters {
  teamId?: string
}

export interface RepFilters extends DateRangeFilters {
  salesPersonId: string
}

export interface HealthScoreFilters extends DateRangeFilters {
  scoreRange?: 'critical' | 'at_risk' | 'healthy' | 'excellent'
  accountId?: string
}

export interface TerritoryFilters extends DateRangeFilters {
  territoryId?: string
  region?: string
}

export interface TransactionFilters extends DateRangeFilters {
  entityType?: 'lead' | 'deal' | 'contact' | 'account'
  entityId?: string
  userId?: string
  actionType?: string
  page?: number
  limit?: number
}

// Response Types
export interface PipelineOverview {
  totalDeals: number
  totalValue: number
  weightedValue: number
  averageDealSize: number
  winRate: number
  averageSalesCycle: number
  byStage: Array<{
    stageId: string
    stageName: string
    stageNameAr?: string
    dealCount: number
    totalValue: number
    conversionRate: number
    averageDaysInStage: number
  }>
  trends: {
    dealsGrowth: number
    valueGrowth: number
    winRateChange: number
  }
}

export interface PipelineVelocity {
  overallVelocity: number // Days from lead to close
  byStage: Array<{
    stageId: string
    stageName: string
    stageNameAr?: string
    averageDays: number
    medianDays: number
    minDays: number
    maxDays: number
  }>
  bottlenecks: Array<{
    stageId: string
    stageName: string
    stageNameAr?: string
    averageDays: number
    impact: 'high' | 'medium' | 'low'
  }>
}

export interface StageDuration {
  stages: Array<{
    stageId: string
    stageName: string
    stageNameAr?: string
    averageDuration: number
    medianDuration: number
    dealCount: number
    stuckDeals: number // Deals exceeding normal duration
  }>
  recommendations: Array<{
    stageId: string
    suggestion: string
    suggestionAr?: string
  }>
}

export interface DealAging {
  agingBuckets: Array<{
    range: string // e.g., "0-7 days", "8-14 days"
    rangeAr?: string
    dealCount: number
    totalValue: number
    deals: Array<{
      dealId: string
      dealName: string
      value: number
      daysInStage: number
      currentStage: string
      assignedTo: string
    }>
  }>
  overageDeals: Array<{
    dealId: string
    dealName: string
    daysInStage: number
    expectedDays: number
    overageDays: number
  }>
}

export interface PipelineMovement {
  period: string
  movements: Array<{
    date: string
    entered: number
    advanced: number
    regressed: number
    won: number
    lost: number
    totalValue: number
  }>
  stageTransitions: Array<{
    fromStage: string
    toStage: string
    count: number
    averageTime: number
  }>
}

export interface LeadsBySource {
  sources: Array<{
    source: string
    sourceAr?: string
    leadCount: number
    conversionRate: number
    averageValue: number
    totalRevenue: number
    cost?: number
    roi?: number
  }>
  topSources: string[]
  worstSources: string[]
}

export interface LeadConversionFunnel {
  stages: Array<{
    stage: string
    stageAr?: string
    count: number
    conversionRate: number
    dropoffRate: number
    averageTime: number
  }>
  overallConversionRate: number
  averageConversionTime: number
  bottleneck?: {
    stage: string
    dropoffRate: number
  }
}

export interface LeadResponseTime {
  averageResponseTime: number // seconds
  medianResponseTime: number
  bySource: Array<{
    source: string
    averageResponseTime: number
    meetsSLA: boolean
  }>
  byRep: Array<{
    repId: string
    repName: string
    averageResponseTime: number
    fastestResponse: number
    slowestResponse: number
  }>
  slaCompliance: number // percentage
}

export interface LeadVelocityRate {
  period: string
  velocityRate: number // Leads per day
  trend: 'increasing' | 'decreasing' | 'stable'
  byPeriod: Array<{
    date: string
    newLeads: number
    qualifiedLeads: number
    convertedLeads: number
  }>
}

export interface LeadDistribution {
  byRep: Array<{
    repId: string
    repName: string
    totalLeads: number
    activeLeads: number
    wonLeads: number
    lostLeads: number
    conversionRate: number
  }>
  byTeam: Array<{
    teamId: string
    teamName: string
    totalLeads: number
    conversionRate: number
  }>
  balance: {
    isBalanced: boolean
    coefficient: number // Gini coefficient or similar
  }
}

export interface ActivitySummary {
  totalActivities: number
  byType: Array<{
    type: 'call' | 'email' | 'meeting' | 'task' | 'note'
    typeAr?: string
    count: number
    percentage: number
  }>
  byStatus: Array<{
    status: 'completed' | 'scheduled' | 'overdue' | 'cancelled'
    statusAr?: string
    count: number
  }>
  completionRate: number
  averageActivitiesPerDeal: number
  topPerformers: Array<{
    userId: string
    userName: string
    activityCount: number
  }>
}

export interface CallAnalytics {
  totalCalls: number
  totalDuration: number // seconds
  averageDuration: number
  answerRate: number
  byOutcome: Array<{
    outcome: 'answered' | 'no_answer' | 'voicemail' | 'busy'
    outcomeAr?: string
    count: number
    percentage: number
  }>
  byRep: Array<{
    repId: string
    repName: string
    callCount: number
    totalDuration: number
    answerRate: number
  }>
  peakHours: Array<{
    hour: number
    callCount: number
    answerRate: number
  }>
}

export interface EmailEngagement {
  totalSent: number
  openRate: number
  clickRate: number
  replyRate: number
  bounceRate: number
  byTemplate: Array<{
    templateId: string
    templateName: string
    sent: number
    opened: number
    clicked: number
    replied: number
  }>
  byRep: Array<{
    repId: string
    repName: string
    sent: number
    openRate: number
    replyRate: number
  }>
}

export interface MeetingAnalytics {
  totalMeetings: number
  completedMeetings: number
  cancelledMeetings: number
  noShowRate: number
  averageDuration: number
  byType: Array<{
    type: 'demo' | 'discovery' | 'proposal' | 'negotiation' | 'other'
    typeAr?: string
    count: number
    averageDuration: number
    outcomeRate: number
  }>
  conversionImpact: {
    withMeetings: number // conversion rate
    withoutMeetings: number
  }
}

export interface TaskCompletion {
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  completionRate: number
  averageCompletionTime: number
  byPriority: Array<{
    priority: 'high' | 'medium' | 'low'
    priorityAr?: string
    total: number
    completed: number
    overdue: number
  }>
  byRep: Array<{
    repId: string
    repName: string
    totalTasks: number
    completionRate: number
    averageCompletionTime: number
  }>
}

export interface SalesForecast {
  period: string
  forecastType: 'committed' | 'best_case' | 'worst_case' | 'pipeline'
  totalForecast: number
  byPeriod: Array<{
    period: string
    committed: number
    bestCase: number
    worstCase: number
    pipeline: number
    quota?: number
    attainment?: number
  }>
  byRep: Array<{
    repId: string
    repName: string
    forecast: number
    quota?: number
    attainment?: number
  }>
  confidence: number // percentage
}

export interface RevenueAnalysis {
  totalRevenue: number
  recurringRevenue: number
  newBusinessRevenue: number
  expansionRevenue: number
  byPeriod: Array<{
    period: string
    revenue: number
    growth: number
    dealCount: number
  }>
  byProduct: Array<{
    productId: string
    productName: string
    revenue: number
    percentage: number
  }>
  bySegment: Array<{
    segment: string
    revenue: number
    dealCount: number
    averageDealSize: number
  }>
}

export interface QuotaAttainment {
  overallAttainment: number
  byRep: Array<{
    repId: string
    repName: string
    quota: number
    actual: number
    attainment: number
    trend: 'on_track' | 'at_risk' | 'exceeded'
  }>
  byTeam: Array<{
    teamId: string
    teamName: string
    quota: number
    actual: number
    attainment: number
  }>
  onTrack: number // percentage of reps on track
  atRisk: number // percentage at risk
}

export interface WinRateAnalysis {
  overallWinRate: number
  byStage: Array<{
    stageId: string
    stageName: string
    stageNameAr?: string
    winRate: number
    dealCount: number
  }>
  byRep: Array<{
    repId: string
    repName: string
    winRate: number
    dealsWon: number
    dealsLost: number
  }>
  bySource: Array<{
    source: string
    winRate: number
  }>
  trends: Array<{
    period: string
    winRate: number
  }>
}

export interface DealSizeAnalysis {
  averageDealSize: number
  medianDealSize: number
  largestDeal: number
  smallestDeal: number
  distribution: Array<{
    range: string // e.g., "0-10k", "10k-50k"
    rangeAr?: string
    count: number
    percentage: number
  }>
  byRep: Array<{
    repId: string
    repName: string
    averageDealSize: number
    largestDeal: number
  }>
  trends: Array<{
    period: string
    averageDealSize: number
  }>
}

export interface SalesLeaderboard {
  period: string
  metric: string
  leaders: Array<{
    rank: number
    repId: string
    repName: string
    avatar?: string
    value: number
    change: number // change from previous period
    deals: number
    revenue: number
    activities: number
    winRate: number
  }>
}

export interface TeamPerformance {
  teamId?: string
  teamName?: string
  overview: {
    totalRevenue: number
    totalDeals: number
    winRate: number
    averageDealSize: number
    quotaAttainment: number
  }
  members: Array<{
    repId: string
    repName: string
    revenue: number
    deals: number
    winRate: number
    activities: number
    quota?: number
    attainment?: number
  }>
  comparison: {
    vsLastPeriod: number
    vsOtherTeams?: number
  }
}

export interface RepScorecard {
  repId: string
  repName: string
  period: string
  metrics: {
    revenue: {
      value: number
      quota: number
      attainment: number
      rank: number
    }
    deals: {
      won: number
      lost: number
      winRate: number
      rank: number
    }
    pipeline: {
      value: number
      dealCount: number
      averageDealSize: number
    }
    activities: {
      total: number
      calls: number
      emails: number
      meetings: number
      rank: number
    }
    velocity: {
      averageSalesCycle: number
      responseTime: number
    }
  }
  strengths: string[]
  areasForImprovement: string[]
}

export interface ActivityMetricsByRep {
  repId: string
  repName: string
  period: string
  activities: {
    total: number
    calls: number
    emails: number
    meetings: number
    tasks: number
  }
  performance: {
    callAnswerRate: number
    emailResponseRate: number
    meetingShowRate: number
    taskCompletionRate: number
  }
  productivity: {
    activitiesPerDay: number
    activitiesPerDeal: number
    bestDay: string
    worstDay: string
  }
  impact: {
    dealsInfluenced: number
    revenueInfluenced: number
  }
}

export interface CustomerLifetimeValue {
  averageLTV: number
  medianLTV: number
  bySegment: Array<{
    segment: string
    averageLTV: number
    customerCount: number
  }>
  topCustomers: Array<{
    customerId: string
    customerName: string
    ltv: number
    firstPurchase: string
    totalRevenue: number
    dealCount: number
  }>
  ltvToCAC: number // LTV to Customer Acquisition Cost ratio
}

export interface ChurnAnalysis {
  churnRate: number
  churnedCustomers: number
  retentionRate: number
  byReason: Array<{
    reason: string
    reasonAr?: string
    count: number
    percentage: number
  }>
  bySegment: Array<{
    segment: string
    churnRate: number
  }>
  atRiskCustomers: Array<{
    customerId: string
    customerName: string
    riskScore: number
    lastActivity: string
    revenue: number
  }>
  trends: Array<{
    period: string
    churnRate: number
    retentionRate: number
  }>
}

export interface CustomerHealthScore {
  distribution: Array<{
    score: 'critical' | 'at_risk' | 'healthy' | 'excellent'
    scoreAr?: string
    count: number
    percentage: number
  }>
  accounts: Array<{
    accountId: string
    accountName: string
    healthScore: number
    scoreCategory: 'critical' | 'at_risk' | 'healthy' | 'excellent'
    factors: {
      engagement: number
      revenue: number
      satisfaction: number
      usage: number
    }
    lastActivity: string
    assignedTo: string
  }>
  trending: {
    improving: number
    declining: number
    stable: number
  }
}

export interface AccountEngagement {
  overallEngagement: number
  byAccount: Array<{
    accountId: string
    accountName: string
    engagementScore: number
    activityCount: number
    lastActivity: string
    topActivities: string[]
  }>
  engagementTrend: Array<{
    period: string
    averageEngagement: number
  }>
  disengagedAccounts: Array<{
    accountId: string
    accountName: string
    daysSinceLastActivity: number
    previousEngagement: number
  }>
}

export interface WinLossAnalysis {
  winRate: number
  totalWon: number
  totalLost: number
  wonRevenue: number
  lostRevenue: number
  byStage: Array<{
    stageId: string
    stageName: string
    stageNameAr?: string
    won: number
    lost: number
    winRate: number
  }>
  lostReasons: Array<{
    reason: string
    reasonAr?: string
    count: number
    percentage: number
    averageDealSize: number
  }>
  trends: Array<{
    period: string
    winRate: number
    wonCount: number
    lostCount: number
  }>
}

export interface LostDealsAnalysis {
  totalLostDeals: number
  totalLostValue: number
  byReason: Array<{
    reason: string
    reasonAr?: string
    count: number
    value: number
    percentage: number
    averageDealSize: number
  }>
  byStage: Array<{
    stageId: string
    stageName: string
    lostCount: number
    averageStageTime: number
  }>
  byRep: Array<{
    repId: string
    repName: string
    lostCount: number
    lostValue: number
    topReason: string
  }>
  recoveryOpportunities: Array<{
    dealId: string
    dealName: string
    value: number
    lostDate: string
    reason: string
    recoveryScore: number
  }>
}

export interface CompetitorTracking {
  competitors: Array<{
    competitorId: string
    competitorName: string
    encounters: number
    won: number
    lost: number
    winRate: number
    averageDealSize: number
    commonReasons: string[]
  }>
  marketPosition: {
    rank: number
    marketShare: number
  }
  competitiveTrends: Array<{
    period: string
    competitorId: string
    competitorName: string
    winRate: number
  }>
  strengthsWeaknesses: Array<{
    competitorId: string
    competitorName: string
    strengths: string[]
    weaknesses: string[]
  }>
}

export interface TerritoryPerformance {
  territories: Array<{
    territoryId: string
    territoryName: string
    territoryNameAr?: string
    revenue: number
    dealCount: number
    winRate: number
    quota?: number
    attainment?: number
    growth: number
  }>
  topTerritories: string[]
  underperformingTerritories: string[]
  coverage: {
    covered: number
    uncovered: number
  }
}

export interface RegionalSales {
  regions: Array<{
    region: string
    regionAr?: string
    revenue: number
    dealCount: number
    averageDealSize: number
    winRate: number
    growth: number
  }>
  heatmap: Array<{
    region: string
    intensity: number // 0-100
  }>
  opportunities: Array<{
    region: string
    potentialRevenue: number
    penetration: number
  }>
}

export interface GeographicPipeline {
  byRegion: Array<{
    region: string
    regionAr?: string
    pipelineValue: number
    dealCount: number
    averageDealSize: number
    velocity: number
  }>
  concentration: {
    topRegion: string
    percentage: number
  }
  expansion: Array<{
    region: string
    currentDeals: number
    potentialDeals: number
    growthOpportunity: number
  }>
}

export interface CrmTransaction {
  _id: string
  timestamp: string
  entityType: 'lead' | 'deal' | 'contact' | 'account'
  entityId: string
  entityName: string
  actionType: string
  actionTypeAr?: string
  userId: string
  userName: string
  changes?: Record<string, { old: any; new: any }>
  metadata?: Record<string, any>
}

export interface CrmTransactionsList {
  transactions: CrmTransaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CrmTransactionSummary {
  totalTransactions: number
  byType: Array<{
    type: string
    typeAr?: string
    count: number
  }>
  byUser: Array<{
    userId: string
    userName: string
    count: number
  }>
  byEntity: Array<{
    entityType: string
    count: number
  }>
  recentActivity: CrmTransaction[]
}

export interface ExportOptions {
  format?: 'csv' | 'xlsx' | 'pdf'
  filters?: any
}

// ==================== PIPELINE REPORTS HOOKS ====================

export const usePipelineOverview = (filters?: PipelineFilters) => {
  return useQuery({
    queryKey: crmReportKeys.pipelineOverview(filters),
    queryFn: async (): Promise<PipelineOverview> => {
      try {
        const response = await apiClient.get('/crm-reports/pipeline/overview', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REALTIME_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const usePipelineVelocity = (filters?: PipelineFilters) => {
  return useQuery({
    queryKey: crmReportKeys.pipelineVelocity(filters),
    queryFn: async (): Promise<PipelineVelocity> => {
      try {
        const response = await apiClient.get('/crm-reports/pipeline/velocity', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useStageDuration = (filters?: PipelineFilters) => {
  return useQuery({
    queryKey: crmReportKeys.stageDuration(filters),
    queryFn: async (): Promise<StageDuration> => {
      try {
        const response = await apiClient.get('/crm-reports/pipeline/stage-duration', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useDealAging = (filters?: PipelineFilters) => {
  return useQuery({
    queryKey: crmReportKeys.dealAging(filters),
    queryFn: async (): Promise<DealAging> => {
      try {
        const response = await apiClient.get('/crm-reports/pipeline/deal-aging', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REALTIME_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const usePipelineMovement = (filters?: PipelineFilters) => {
  return useQuery({
    queryKey: crmReportKeys.pipelineMovement(filters),
    queryFn: async (): Promise<PipelineMovement> => {
      try {
        const response = await apiClient.get('/crm-reports/pipeline/movement', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

// ==================== LEAD REPORTS HOOKS ====================

export const useLeadsBySource = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.leadsBySource(filters),
    queryFn: async (): Promise<LeadsBySource> => {
      try {
        const response = await apiClient.get('/crm-reports/leads/by-source', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useLeadConversionFunnel = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.leadConversionFunnel(filters),
    queryFn: async (): Promise<LeadConversionFunnel> => {
      try {
        const response = await apiClient.get('/crm-reports/leads/conversion-funnel', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useLeadResponseTime = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.leadResponseTime(filters),
    queryFn: async (): Promise<LeadResponseTime> => {
      try {
        const response = await apiClient.get('/crm-reports/leads/response-time', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useLeadVelocityRate = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.leadVelocityRate(filters),
    queryFn: async (): Promise<LeadVelocityRate> => {
      try {
        const response = await apiClient.get('/crm-reports/leads/velocity-rate', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useLeadDistribution = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.leadDistribution(filters),
    queryFn: async (): Promise<LeadDistribution> => {
      try {
        const response = await apiClient.get('/crm-reports/leads/distribution', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

// ==================== ACTIVITY REPORTS HOOKS ====================

export const useActivitySummary = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.activitySummary(filters),
    queryFn: async (): Promise<ActivitySummary> => {
      try {
        const response = await apiClient.get('/crm-reports/activities/summary', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useCallAnalytics = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.callAnalytics(filters),
    queryFn: async (): Promise<CallAnalytics> => {
      try {
        const response = await apiClient.get('/crm-reports/activities/calls', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useEmailEngagement = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.emailEngagement(filters),
    queryFn: async (): Promise<EmailEngagement> => {
      try {
        const response = await apiClient.get('/crm-reports/activities/emails', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useMeetingAnalytics = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.meetingAnalytics(filters),
    queryFn: async (): Promise<MeetingAnalytics> => {
      try {
        const response = await apiClient.get('/crm-reports/activities/meetings', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useTaskCompletion = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.taskCompletion(filters),
    queryFn: async (): Promise<TaskCompletion> => {
      try {
        const response = await apiClient.get('/crm-reports/activities/tasks', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

// ==================== REVENUE REPORTS HOOKS ====================

export const useSalesForecast = (filters?: ForecastFilters) => {
  return useQuery({
    queryKey: crmReportKeys.salesForecast(filters),
    queryFn: async (): Promise<SalesForecast> => {
      try {
        const response = await apiClient.get('/crm-reports/revenue/forecast', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useRevenueAnalysis = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.revenueAnalysis(filters),
    queryFn: async (): Promise<RevenueAnalysis> => {
      try {
        const response = await apiClient.get('/crm-reports/revenue/analysis', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useQuotaAttainment = (filters?: QuotaFilters) => {
  return useQuery({
    queryKey: crmReportKeys.quotaAttainment(filters),
    queryFn: async (): Promise<QuotaAttainment> => {
      try {
        const response = await apiClient.get('/crm-reports/revenue/quota-attainment', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useWinRateAnalysis = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.winRateAnalysis(filters),
    queryFn: async (): Promise<WinRateAnalysis> => {
      try {
        const response = await apiClient.get('/crm-reports/revenue/win-rate', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useDealSizeAnalysis = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.dealSizeAnalysis(filters),
    queryFn: async (): Promise<DealSizeAnalysis> => {
      try {
        const response = await apiClient.get('/crm-reports/revenue/deal-size', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

// ==================== PERFORMANCE REPORTS HOOKS ====================

export const useSalesLeaderboard = (filters?: LeaderboardFilters) => {
  return useQuery({
    queryKey: crmReportKeys.salesLeaderboard(filters),
    queryFn: async (): Promise<SalesLeaderboard> => {
      try {
        const response = await apiClient.get('/crm-reports/performance/leaderboard', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REALTIME_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useTeamPerformance = (filters?: TeamFilters) => {
  return useQuery({
    queryKey: crmReportKeys.teamPerformance(filters),
    queryFn: async (): Promise<TeamPerformance> => {
      try {
        const response = await apiClient.get('/crm-reports/performance/team', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useRepScorecard = (filters: RepFilters) => {
  return useQuery({
    queryKey: crmReportKeys.repScorecard(filters),
    queryFn: async (): Promise<RepScorecard> => {
      try {
        const response = await apiClient.get('/crm-reports/performance/rep-scorecard', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    enabled: !!filters.salesPersonId,
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useActivityMetricsByRep = (filters: RepFilters) => {
  return useQuery({
    queryKey: crmReportKeys.activityMetricsByRep(filters),
    queryFn: async (): Promise<ActivityMetricsByRep> => {
      try {
        const response = await apiClient.get('/crm-reports/performance/activity-metrics', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    enabled: !!filters.salesPersonId,
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

// ==================== CUSTOMER REPORTS HOOKS ====================

export const useCustomerLifetimeValue = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.customerLifetimeValue(filters),
    queryFn: async (): Promise<CustomerLifetimeValue> => {
      try {
        const response = await apiClient.get('/crm-reports/customers/ltv', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useChurnAnalysis = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.churnAnalysis(filters),
    queryFn: async (): Promise<ChurnAnalysis> => {
      try {
        const response = await apiClient.get('/crm-reports/customers/churn', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useCustomerHealthScore = (filters?: HealthScoreFilters) => {
  return useQuery({
    queryKey: crmReportKeys.customerHealthScore(filters),
    queryFn: async (): Promise<CustomerHealthScore> => {
      try {
        const response = await apiClient.get('/crm-reports/customers/health-score', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REALTIME_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useAccountEngagement = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.accountEngagement(filters),
    queryFn: async (): Promise<AccountEngagement> => {
      try {
        const response = await apiClient.get('/crm-reports/customers/engagement', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

// ==================== WIN/LOSS REPORTS HOOKS ====================

export const useWinLossAnalysis = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.winLossAnalysis(filters),
    queryFn: async (): Promise<WinLossAnalysis> => {
      try {
        const response = await apiClient.get('/crm-reports/win-loss/analysis', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useLostDealsAnalysis = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.lostDealsAnalysis(filters),
    queryFn: async (): Promise<LostDealsAnalysis> => {
      try {
        const response = await apiClient.get('/crm-reports/win-loss/lost-deals', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useCompetitorTracking = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.competitorTracking(filters),
    queryFn: async (): Promise<CompetitorTracking> => {
      try {
        const response = await apiClient.get('/crm-reports/win-loss/competitors', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

// ==================== TERRITORY REPORTS HOOKS ====================

export const useTerritoryPerformance = (filters?: TerritoryFilters) => {
  return useQuery({
    queryKey: crmReportKeys.territoryPerformance(filters),
    queryFn: async (): Promise<TerritoryPerformance> => {
      try {
        const response = await apiClient.get('/crm-reports/territory/performance', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useRegionalSales = (filters?: TerritoryFilters) => {
  return useQuery({
    queryKey: crmReportKeys.regionalSales(filters),
    queryFn: async (): Promise<RegionalSales> => {
      try {
        const response = await apiClient.get('/crm-reports/territory/regional-sales', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useGeographicPipeline = (filters?: TerritoryFilters) => {
  return useQuery({
    queryKey: crmReportKeys.geographicPipeline(filters),
    queryFn: async (): Promise<GeographicPipeline> => {
      try {
        const response = await apiClient.get('/crm-reports/territory/geographic-pipeline', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REPORTS_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

// ==================== TRANSACTION LOG HOOKS ====================

export const useCrmTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: crmReportKeys.transactionsList(filters),
    queryFn: async (): Promise<CrmTransactionsList> => {
      try {
        const response = await apiClient.get('/crm-reports/transactions', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REALTIME_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

export const useTransactionSummary = (filters?: DateRangeFilters) => {
  return useQuery({
    queryKey: crmReportKeys.transactionSummary(filters),
    queryFn: async (): Promise<CrmTransactionSummary> => {
      try {
        const response = await apiClient.get('/crm-reports/transactions/summary', { params: filters })
        return response.data.data || response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    staleTime: REALTIME_STALE_TIME,
    gcTime: REPORTS_GC_TIME,
  })
}

// ==================== EXPORT MUTATION ====================

export const useExportCrmTransactions = () => {
  return useMutation({
    mutationFn: async (options?: ExportOptions): Promise<Blob> => {
      try {
        const { format = 'pdf', filters } = options || {}
        const response = await apiClient.get('/crm-reports/transactions/export', {
          params: { ...filters, format },
          responseType: 'blob',
        })
        return response.data
      } catch (error: any) {
        throwBilingualError(error)
      }
    },
    onSuccess: (blob, variables) => {
      const format = variables?.format || 'pdf'
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `crm-transactions-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('تم تصدير المعاملات بنجاح | Transactions exported successfully')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to export transactions | فشل في تصدير المعاملات'
      toast.error(message)
    },
  })
}

// ==================== CACHE INVALIDATION UTILITIES ====================

export const invalidateCrmReports = {
  all: () => invalidateCache.all(),

  pipeline: () => {
    const queryClient = useQueryClient()
    queryClient.invalidateQueries({ queryKey: crmReportKeys.pipeline() })
  },

  leads: () => {
    const queryClient = useQueryClient()
    queryClient.invalidateQueries({ queryKey: crmReportKeys.leads() })
  },

  activities: () => {
    const queryClient = useQueryClient()
    queryClient.invalidateQueries({ queryKey: crmReportKeys.activities() })
  },

  revenue: () => {
    const queryClient = useQueryClient()
    queryClient.invalidateQueries({ queryKey: crmReportKeys.revenue() })
  },

  performance: () => {
    const queryClient = useQueryClient()
    queryClient.invalidateQueries({ queryKey: crmReportKeys.performance() })
  },

  customers: () => {
    const queryClient = useQueryClient()
    queryClient.invalidateQueries({ queryKey: crmReportKeys.customers() })
  },

  winLoss: () => {
    const queryClient = useQueryClient()
    queryClient.invalidateQueries({ queryKey: crmReportKeys.winLoss() })
  },

  territory: () => {
    const queryClient = useQueryClient()
    queryClient.invalidateQueries({ queryKey: crmReportKeys.territory() })
  },

  transactions: () => {
    const queryClient = useQueryClient()
    queryClient.invalidateQueries({ queryKey: crmReportKeys.transactions() })
  },
}

export default {
  // Pipeline Reports
  usePipelineOverview,
  usePipelineVelocity,
  useStageDuration,
  useDealAging,
  usePipelineMovement,

  // Lead Reports
  useLeadsBySource,
  useLeadConversionFunnel,
  useLeadResponseTime,
  useLeadVelocityRate,
  useLeadDistribution,

  // Activity Reports
  useActivitySummary,
  useCallAnalytics,
  useEmailEngagement,
  useMeetingAnalytics,
  useTaskCompletion,

  // Revenue Reports
  useSalesForecast,
  useRevenueAnalysis,
  useQuotaAttainment,
  useWinRateAnalysis,
  useDealSizeAnalysis,

  // Performance Reports
  useSalesLeaderboard,
  useTeamPerformance,
  useRepScorecard,
  useActivityMetricsByRep,

  // Customer Reports
  useCustomerLifetimeValue,
  useChurnAnalysis,
  useCustomerHealthScore,
  useAccountEngagement,

  // Win/Loss Reports
  useWinLossAnalysis,
  useLostDealsAnalysis,
  useCompetitorTracking,

  // Territory Reports
  useTerritoryPerformance,
  useRegionalSales,
  useGeographicPipeline,

  // Transaction Log
  useCrmTransactions,
  useTransactionSummary,
  useExportCrmTransactions,

  // Utilities
  crmReportKeys,
  invalidateCrmReports,
}

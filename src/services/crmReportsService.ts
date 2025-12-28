/**
 * CRM Reports Service
 * Handles all CRM-related reporting and analytics API calls
 *
 * Provides comprehensive reporting capabilities including:
 * - Pipeline analytics and velocity tracking
 * - Lead conversion and source analysis
 * - Activity tracking and engagement metrics
 * - Revenue forecasting and quota management
 * - Sales performance and leaderboards
 * - Customer lifetime value and churn analysis
 * - Win/loss analysis and competitor tracking
 * - Territory and geographic performance
 * - Transaction logging and audit trails
 *
 * Pattern: Follows financeService.ts and accountingService.ts architecture
 * - Production-ready error handling
 * - Comprehensive TypeScript typing
 * - Consistent response unwrapping
 * - Filter-based querying
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== COMMON TYPES ====================

/**
 * Date range filter used across all reports
 */
export interface DateRange {
  startDate: string // ISO 8601 format (YYYY-MM-DD)
  endDate: string   // ISO 8601 format (YYYY-MM-DD)
}

/**
 * User reference for assignment and ownership
 */
export interface UserRef {
  userId?: string
  teamId?: string
  departmentId?: string
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
}

/**
 * Common response metadata
 */
export interface ReportMetadata {
  generatedAt: string
  generatedBy?: string
  reportType: string
  filters?: Record<string, any>
}

// ==================== PIPELINE REPORTS ====================

/**
 * Pipeline overview filters
 */
export interface PipelineOverviewFilters extends Partial<DateRange>, UserRef, PaginationParams {
  stageId?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  minValue?: number
  maxValue?: number
}

/**
 * Pipeline overview response
 */
export interface PipelineOverviewReport {
  summary: {
    totalDeals: number
    totalValue: number
    averageDealSize: number
    conversionRate: number
    averageTimeToClose: number // in days
  }
  byStage: Array<{
    stageId: string
    stageName: string
    dealCount: number
    totalValue: number
    averageValue: number
    winProbability: number
  }>
  byOwner: Array<{
    userId: string
    userName: string
    dealCount: number
    totalValue: number
    averageDealSize: number
  }>
  trends: Array<{
    date: string
    newDeals: number
    closedDeals: number
    totalValue: number
  }>
  metadata: ReportMetadata
}

/**
 * Pipeline velocity filters
 */
export interface PipelineVelocityFilters extends Partial<DateRange>, UserRef {
  stageId?: string
  includeStalled?: boolean
}

/**
 * Pipeline velocity response
 */
export interface PipelineVelocityReport {
  summary: {
    averageVelocity: number // deals per day
    medianVelocity: number
    velocityTrend: 'increasing' | 'decreasing' | 'stable'
    trendPercentage: number
  }
  byStage: Array<{
    stageId: string
    stageName: string
    averageTimeInStage: number // in hours
    exitRate: number // percentage
    conversionRate: number
  }>
  velocityOverTime: Array<{
    period: string
    velocity: number
    dealsProcessed: number
  }>
  bottlenecks: Array<{
    stageId: string
    stageName: string
    averageStallTime: number
    stalledDeals: number
  }>
  metadata: ReportMetadata
}

/**
 * Stage duration filters
 */
export interface StageDurationFilters extends Partial<DateRange>, UserRef {
  stageId?: string
  status?: 'won' | 'lost' | 'active'
}

/**
 * Stage duration response
 */
export interface StageDurationReport {
  summary: {
    averageTotalDuration: number // in days
    medianTotalDuration: number
    shortestDeal: number
    longestDeal: number
  }
  byStage: Array<{
    stageId: string
    stageName: string
    averageDuration: number // in hours
    medianDuration: number
    minDuration: number
    maxDuration: number
    dealCount: number
  }>
  stageTransitions: Array<{
    fromStage: string
    toStage: string
    averageDuration: number
    transitionCount: number
  }>
  metadata: ReportMetadata
}

/**
 * Deal aging filters
 */
export interface DealAgingFilters extends UserRef {
  stageId?: string
  includeWon?: boolean
  includeLost?: boolean
}

/**
 * Deal aging response
 */
export interface DealAgingReport {
  summary: {
    totalActiveDeals: number
    averageAge: number // in days
    stalledDeals: number
    atRiskDeals: number
  }
  agingBuckets: {
    zeroToThirty: number
    thirtyToSixty: number
    sixtyToNinety: number
    ninetyPlus: number
  }
  deals: Array<{
    dealId: string
    dealName: string
    stageId: string
    stageName: string
    ageInDays: number
    lastActivity: string
    value: number
    owner: string
    risk: 'low' | 'medium' | 'high'
  }>
  metadata: ReportMetadata
}

/**
 * Pipeline movement filters
 */
export interface PipelineMovementFilters extends Partial<DateRange>, UserRef {
  includeBackwardMovement?: boolean
}

/**
 * Pipeline movement response
 */
export interface PipelineMovementReport {
  summary: {
    totalMovements: number
    forwardMovements: number
    backwardMovements: number
    dealsProgressed: number
    dealsRegressed: number
  }
  movements: Array<{
    date: string
    fromStage: string
    toStage: string
    dealCount: number
    totalValue: number
    direction: 'forward' | 'backward' | 'lateral'
  }>
  progressionAnalysis: {
    healthyProgression: number // percentage
    concerningRegression: number // percentage
    stagnant: number // percentage
  }
  metadata: ReportMetadata
}

// ==================== LEAD REPORTS ====================

/**
 * Lead source filters
 */
export interface LeadsBySourceFilters extends Partial<DateRange>, UserRef, PaginationParams {
  status?: string
  converted?: boolean
}

/**
 * Lead source response
 */
export interface LeadsBySourceReport {
  summary: {
    totalLeads: number
    totalConverted: number
    overallConversionRate: number
    averageTimeToConvert: number // in days
  }
  bySource: Array<{
    source: string
    leadCount: number
    convertedCount: number
    conversionRate: number
    averageValue: number
    roi: number
  }>
  topPerformingSources: Array<{
    source: string
    metric: string
    value: number
    rank: number
  }>
  metadata: ReportMetadata
}

/**
 * Lead conversion funnel filters
 */
export interface LeadConversionFunnelFilters extends Partial<DateRange>, UserRef {
  source?: string
}

/**
 * Lead conversion funnel response
 */
export interface LeadConversionFunnelReport {
  summary: {
    totalEntered: number
    totalConverted: number
    overallConversionRate: number
    dropoffRate: number
  }
  funnelStages: Array<{
    stage: string
    stageOrder: number
    entered: number
    exited: number
    converted: number
    conversionRate: number
    dropoffRate: number
    averageTimeInStage: number // in days
  }>
  conversionPaths: Array<{
    path: string[]
    count: number
    averageTime: number
    successRate: number
  }>
  dropoffPoints: Array<{
    fromStage: string
    toStage: string
    dropoffCount: number
    dropoffRate: number
  }>
  metadata: ReportMetadata
}

/**
 * Lead response time filters
 */
export interface LeadResponseTimeFilters extends Partial<DateRange>, UserRef {
  source?: string
  priority?: string
}

/**
 * Lead response time response
 */
export interface LeadResponseTimeReport {
  summary: {
    averageResponseTime: number // in minutes
    medianResponseTime: number
    within1Hour: number // percentage
    within24Hours: number // percentage
    over24Hours: number // percentage
  }
  bySource: Array<{
    source: string
    averageResponseTime: number
    medianResponseTime: number
    fastestResponse: number
    slowestResponse: number
  }>
  byOwner: Array<{
    userId: string
    userName: string
    averageResponseTime: number
    leadsHandled: number
    slaCompliance: number // percentage
  }>
  responseDistribution: Array<{
    timeRange: string // "0-15m", "15-30m", etc.
    count: number
    percentage: number
  }>
  metadata: ReportMetadata
}

/**
 * Lead velocity filters
 */
export interface LeadVelocityFilters extends Partial<DateRange>, UserRef {
  source?: string
}

/**
 * Lead velocity response
 */
export interface LeadVelocityRateReport {
  summary: {
    currentVelocity: number // leads per day
    previousVelocity: number
    velocityChange: number // percentage
    trend: 'increasing' | 'decreasing' | 'stable'
  }
  velocityOverTime: Array<{
    period: string
    newLeads: number
    qualifiedLeads: number
    convertedLeads: number
    velocity: number
  }>
  bySource: Array<{
    source: string
    velocity: number
    trend: 'up' | 'down' | 'stable'
  }>
  metadata: ReportMetadata
}

/**
 * Lead distribution filters
 */
export interface LeadDistributionFilters extends Partial<DateRange> {
  groupBy?: 'owner' | 'team' | 'source' | 'status'
}

/**
 * Lead distribution response
 */
export interface LeadDistributionReport {
  summary: {
    totalLeads: number
    totalOwners: number
    averageLeadsPerOwner: number
    distributionBalance: number // 0-100, higher is more balanced
  }
  distribution: Array<{
    key: string
    label: string
    leadCount: number
    percentage: number
    convertedCount: number
    conversionRate: number
  }>
  loadAnalysis: {
    underutilized: string[] // owner IDs with capacity
    balanced: string[]
    overloaded: string[] // owner IDs over capacity
  }
  metadata: ReportMetadata
}

// ==================== ACTIVITY REPORTS ====================

/**
 * Activity summary filters
 */
export interface ActivitySummaryFilters extends Partial<DateRange>, UserRef {
  activityType?: 'call' | 'email' | 'meeting' | 'task' | 'note'
  relatedTo?: 'deal' | 'lead' | 'contact' | 'account'
}

/**
 * Activity summary response
 */
export interface ActivitySummaryReport {
  summary: {
    totalActivities: number
    completedActivities: number
    completionRate: number
    averageActivitiesPerDay: number
  }
  byType: Array<{
    activityType: string
    count: number
    percentage: number
    completionRate: number
  }>
  byUser: Array<{
    userId: string
    userName: string
    totalActivities: number
    completedActivities: number
    completionRate: number
  }>
  dailyActivity: Array<{
    date: string
    activities: number
    completed: number
  }>
  metadata: ReportMetadata
}

/**
 * Call analytics filters
 */
export interface CallAnalyticsFilters extends Partial<DateRange>, UserRef {
  outcome?: 'completed' | 'no_answer' | 'voicemail' | 'busy'
  direction?: 'inbound' | 'outbound'
}

/**
 * Call analytics response
 */
export interface CallAnalyticsReport {
  summary: {
    totalCalls: number
    totalDuration: number // in minutes
    averageDuration: number
    successRate: number
    conversionRate: number
  }
  byOutcome: Array<{
    outcome: string
    callCount: number
    percentage: number
    averageDuration: number
  }>
  byUser: Array<{
    userId: string
    userName: string
    callsMade: number
    totalDuration: number
    averageDuration: number
    successRate: number
  }>
  callVolume: Array<{
    period: string
    inbound: number
    outbound: number
    totalDuration: number
  }>
  peakHours: Array<{
    hour: number
    callCount: number
    successRate: number
  }>
  metadata: ReportMetadata
}

/**
 * Email engagement filters
 */
export interface EmailEngagementFilters extends Partial<DateRange>, UserRef {
  campaignId?: string
  templateId?: string
}

/**
 * Email engagement response
 */
export interface EmailEngagementReport {
  summary: {
    totalSent: number
    totalDelivered: number
    totalOpened: number
    totalClicked: number
    deliveryRate: number
    openRate: number
    clickRate: number
    responseRate: number
  }
  byCampaign: Array<{
    campaignId: string
    campaignName: string
    sent: number
    opened: number
    clicked: number
    openRate: number
    clickRate: number
  }>
  byUser: Array<{
    userId: string
    userName: string
    sent: number
    opened: number
    clicked: number
    replied: number
    engagementScore: number
  }>
  engagementOverTime: Array<{
    date: string
    sent: number
    opened: number
    clicked: number
  }>
  topPerformingEmails: Array<{
    subject: string
    sent: number
    openRate: number
    clickRate: number
    conversions: number
  }>
  metadata: ReportMetadata
}

/**
 * Meeting analytics filters
 */
export interface MeetingAnalyticsFilters extends Partial<DateRange>, UserRef {
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  meetingType?: 'demo' | 'consultation' | 'follow_up' | 'negotiation'
}

/**
 * Meeting analytics response
 */
export interface MeetingAnalyticsReport {
  summary: {
    totalMeetings: number
    completedMeetings: number
    cancelledMeetings: number
    noShowRate: number
    averageDuration: number // in minutes
    conversionRate: number
  }
  byType: Array<{
    meetingType: string
    count: number
    completionRate: number
    averageDuration: number
    conversionRate: number
  }>
  byUser: Array<{
    userId: string
    userName: string
    meetingsHeld: number
    averageDuration: number
    noShowRate: number
    conversionRate: number
  }>
  meetingOutcomes: Array<{
    outcome: string
    count: number
    percentage: number
    averageFollowUpTime: number // in days
  }>
  metadata: ReportMetadata
}

/**
 * Task completion filters
 */
export interface TaskCompletionFilters extends Partial<DateRange>, UserRef {
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'pending' | 'completed' | 'overdue'
}

/**
 * Task completion response
 */
export interface TaskCompletionReport {
  summary: {
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    completionRate: number
    averageCompletionTime: number // in hours
    onTimeCompletionRate: number
  }
  byPriority: Array<{
    priority: string
    totalTasks: number
    completedTasks: number
    completionRate: number
    averageCompletionTime: number
  }>
  byUser: Array<{
    userId: string
    userName: string
    assignedTasks: number
    completedTasks: number
    overdueTasks: number
    completionRate: number
  }>
  completionTrend: Array<{
    period: string
    assigned: number
    completed: number
    overdue: number
    completionRate: number
  }>
  metadata: ReportMetadata
}

// ==================== REVENUE REPORTS ====================

/**
 * Sales forecast filters
 */
export interface SalesForecastFilters extends Partial<DateRange>, UserRef {
  forecastPeriod?: 'week' | 'month' | 'quarter' | 'year'
  confidenceLevel?: 'conservative' | 'realistic' | 'optimistic'
}

/**
 * Sales forecast response
 */
export interface SalesForecastReport {
  summary: {
    totalForecast: number
    weightedForecast: number
    bestCase: number
    worstCase: number
    forecastAccuracy: number // based on historical data
  }
  byPeriod: Array<{
    period: string
    forecast: number
    weighted: number
    closed: number
    accuracy: number
  }>
  byStage: Array<{
    stageId: string
    stageName: string
    dealCount: number
    totalValue: number
    weightedValue: number
    probability: number
  }>
  byOwner: Array<{
    userId: string
    userName: string
    forecast: number
    quota: number
    attainment: number // percentage
  }>
  confidenceIntervals: {
    conservative: number
    realistic: number
    optimistic: number
  }
  metadata: ReportMetadata
}

/**
 * Revenue analysis filters
 */
export interface RevenueAnalysisFilters extends Partial<DateRange>, UserRef {
  groupBy?: 'product' | 'service' | 'customer_segment' | 'region'
}

/**
 * Revenue analysis response
 */
export interface RevenueAnalysisReport {
  summary: {
    totalRevenue: number
    recurringRevenue: number
    oneTimeRevenue: number
    averageDealSize: number
    revenueGrowth: number // percentage
  }
  revenueBreakdown: Array<{
    category: string
    revenue: number
    percentage: number
    growth: number
    dealCount: number
  }>
  revenueOverTime: Array<{
    period: string
    revenue: number
    recurringRevenue: number
    newRevenue: number
    expansionRevenue: number
  }>
  topRevenueGenerators: Array<{
    type: 'product' | 'customer' | 'owner'
    id: string
    name: string
    revenue: number
    percentage: number
  }>
  metadata: ReportMetadata
}

/**
 * Quota attainment filters
 */
export interface QuotaAttainmentFilters extends Partial<DateRange>, UserRef {
  quotaPeriod?: 'monthly' | 'quarterly' | 'annual'
}

/**
 * Quota attainment response
 */
export interface QuotaAttainmentReport {
  summary: {
    totalQuota: number
    totalAchieved: number
    overallAttainment: number // percentage
    repsAtQuota: number
    repsAboveQuota: number
    repsBelowQuota: number
  }
  byUser: Array<{
    userId: string
    userName: string
    quota: number
    achieved: number
    attainment: number // percentage
    gap: number
    trend: 'up' | 'down' | 'stable'
  }>
  byTeam: Array<{
    teamId: string
    teamName: string
    quota: number
    achieved: number
    attainment: number
    memberCount: number
  }>
  attainmentDistribution: Array<{
    range: string // "0-25%", "25-50%", etc.
    count: number
    percentage: number
  }>
  metadata: ReportMetadata
}

/**
 * Win rate analysis filters
 */
export interface WinRateAnalysisFilters extends Partial<DateRange>, UserRef {
  stageId?: string
  dealSize?: 'small' | 'medium' | 'large' | 'enterprise'
}

/**
 * Win rate analysis response
 */
export interface WinRateAnalysisReport {
  summary: {
    totalDeals: number
    wonDeals: number
    lostDeals: number
    winRate: number
    averageWinTime: number // in days
    averageLossTime: number
  }
  byStage: Array<{
    stageId: string
    stageName: string
    enteredDeals: number
    wonDeals: number
    lostDeals: number
    winRate: number
  }>
  byOwner: Array<{
    userId: string
    userName: string
    totalDeals: number
    wonDeals: number
    winRate: number
    averageDealSize: number
  }>
  byDealSize: Array<{
    sizeRange: string
    dealCount: number
    wonDeals: number
    winRate: number
    averageValue: number
  }>
  winRateTrend: Array<{
    period: string
    totalDeals: number
    wonDeals: number
    winRate: number
  }>
  metadata: ReportMetadata
}

/**
 * Deal size analysis filters
 */
export interface DealSizeAnalysisFilters extends Partial<DateRange>, UserRef {
  includeOpen?: boolean
}

/**
 * Deal size analysis response
 */
export interface DealSizeAnalysisReport {
  summary: {
    averageDealSize: number
    medianDealSize: number
    smallestDeal: number
    largestDeal: number
    totalValue: number
  }
  sizeDistribution: Array<{
    range: string
    count: number
    percentage: number
    totalValue: number
    winRate: number
  }>
  byProduct: Array<{
    productId: string
    productName: string
    averageDealSize: number
    dealCount: number
    totalValue: number
  }>
  byCustomerSegment: Array<{
    segment: string
    averageDealSize: number
    dealCount: number
    totalValue: number
  }>
  trendAnalysis: Array<{
    period: string
    averageDealSize: number
    medianDealSize: number
    dealCount: number
  }>
  metadata: ReportMetadata
}

// ==================== PERFORMANCE REPORTS ====================

/**
 * Sales leaderboard filters
 */
export interface SalesLeaderboardFilters extends Partial<DateRange> {
  metric?: 'revenue' | 'deals_closed' | 'conversion_rate' | 'quota_attainment'
  teamId?: string
  topN?: number
}

/**
 * Sales leaderboard response
 */
export interface SalesLeaderboardReport {
  summary: {
    totalReps: number
    totalRevenue: number
    totalDeals: number
    averageQuotaAttainment: number
  }
  leaderboard: Array<{
    rank: number
    userId: string
    userName: string
    revenue: number
    dealsClosed: number
    conversionRate: number
    quotaAttainment: number
    score: number
    trend: 'up' | 'down' | 'same'
    previousRank?: number
  }>
  topPerformers: Array<{
    userId: string
    userName: string
    category: string
    value: number
    achievement: string
  }>
  metadata: ReportMetadata
}

/**
 * Team performance filters
 */
export interface TeamPerformanceFilters extends Partial<DateRange> {
  teamId?: string
  includeIndividuals?: boolean
}

/**
 * Team performance response
 */
export interface TeamPerformanceReport {
  summary: {
    totalTeams: number
    bestPerformingTeam: string
    averageTeamRevenue: number
    averageTeamQuotaAttainment: number
  }
  teams: Array<{
    teamId: string
    teamName: string
    memberCount: number
    totalRevenue: number
    totalDeals: number
    quotaAttainment: number
    winRate: number
    averageDealSize: number
    rank: number
  }>
  teamComparison: Array<{
    teamId: string
    teamName: string
    metrics: {
      revenue: { value: number; rank: number }
      deals: { value: number; rank: number }
      winRate: { value: number; rank: number }
      quota: { value: number; rank: number }
    }
  }>
  metadata: ReportMetadata
}

/**
 * Rep scorecard filters
 */
export interface RepScorecardFilters extends Partial<DateRange> {
  compareToTeam?: boolean
  compareToCompany?: boolean
}

/**
 * Rep scorecard response
 */
export interface RepScorecardReport {
  overview: {
    userId: string
    userName: string
    teamName: string
    overallScore: number
    rank: number
    totalReps: number
  }
  performance: {
    revenue: {
      value: number
      quota: number
      attainment: number
      vsTeamAverage: number
      vsCompanyAverage: number
    }
    deals: {
      closed: number
      quota: number
      attainment: number
      vsTeamAverage: number
      vsCompanyAverage: number
    }
    activity: {
      calls: number
      emails: number
      meetings: number
      vsTeamAverage: number
    }
    efficiency: {
      winRate: number
      conversionRate: number
      averageDealSize: number
      salesCycle: number // in days
    }
  }
  strengths: string[]
  improvements: string[]
  metadata: ReportMetadata
}

/**
 * Activity metrics by rep filters
 */
export interface ActivityMetricsByRepFilters extends Partial<DateRange> {
  userId?: string
  teamId?: string
}

/**
 * Activity metrics by rep response
 */
export interface ActivityMetricsByRepReport {
  summary: {
    totalActivities: number
    averageActivitiesPerRep: number
    topPerformer: string
  }
  byRep: Array<{
    userId: string
    userName: string
    totalActivities: number
    calls: number
    emails: number
    meetings: number
    tasks: number
    conversionRate: number
    revenuePerActivity: number
  }>
  activityCorrelation: {
    callsToRevenue: number
    emailsToRevenue: number
    meetingsToRevenue: number
    tasksToRevenue: number
  }
  metadata: ReportMetadata
}

// ==================== CUSTOMER REPORTS ====================

/**
 * Customer lifetime value filters
 */
export interface CustomerLifetimeValueFilters extends Partial<DateRange> {
  segment?: string
  minValue?: number
  includeProjected?: boolean
}

/**
 * Customer lifetime value response
 */
export interface CustomerLifetimeValueReport {
  summary: {
    averageLTV: number
    medianLTV: number
    totalCustomerValue: number
    topTierCustomers: number
  }
  bySegment: Array<{
    segment: string
    customerCount: number
    averageLTV: number
    totalValue: number
    retentionRate: number
  }>
  ltvDistribution: Array<{
    range: string
    customerCount: number
    percentage: number
    totalValue: number
  }>
  topCustomers: Array<{
    customerId: string
    customerName: string
    lifetimeValue: number
    dealCount: number
    averageDealSize: number
    tenure: number // in months
  }>
  ltvTrend: Array<{
    period: string
    averageLTV: number
    newCustomers: number
    churnedCustomers: number
  }>
  metadata: ReportMetadata
}

/**
 * Churn analysis filters
 */
export interface ChurnAnalysisFilters extends Partial<DateRange> {
  segment?: string
  includeRisk?: boolean
}

/**
 * Churn analysis response
 */
export interface ChurnAnalysisReport {
  summary: {
    churnRate: number
    customersLost: number
    revenueLost: number
    averageCustomerLifespan: number // in months
    retentionRate: number
  }
  churnBySegment: Array<{
    segment: string
    customerCount: number
    churnedCount: number
    churnRate: number
    revenueLost: number
  }>
  churnReasons: Array<{
    reason: string
    count: number
    percentage: number
    averageValue: number
  }>
  atRiskCustomers: Array<{
    customerId: string
    customerName: string
    riskScore: number
    riskFactors: string[]
    lastActivity: string
    value: number
  }>
  churnTrend: Array<{
    period: string
    customersStart: number
    customersLost: number
    churnRate: number
  }>
  metadata: ReportMetadata
}

/**
 * Customer health score filters
 */
export interface CustomerHealthScoreFilters {
  segment?: string
  minScore?: number
  maxScore?: number
  riskLevel?: 'low' | 'medium' | 'high'
}

/**
 * Customer health score response
 */
export interface CustomerHealthScoreReport {
  summary: {
    averageHealthScore: number
    healthyCustomers: number // score >= 70
    atRiskCustomers: number // score < 50
    improvingCustomers: number
    decliningCustomers: number
  }
  scoreDistribution: Array<{
    range: string
    customerCount: number
    percentage: number
    averageRevenue: number
  }>
  customers: Array<{
    customerId: string
    customerName: string
    healthScore: number
    previousScore: number
    trend: 'improving' | 'declining' | 'stable'
    factors: {
      engagement: number
      usage: number
      support: number
      payment: number
    }
    recommendations: string[]
  }>
  healthTrend: Array<{
    period: string
    averageScore: number
    healthyCount: number
    atRiskCount: number
  }>
  metadata: ReportMetadata
}

/**
 * Account engagement filters
 */
export interface AccountEngagementFilters extends Partial<DateRange> {
  accountId?: string
  engagementLevel?: 'low' | 'medium' | 'high'
}

/**
 * Account engagement response
 */
export interface AccountEngagementReport {
  summary: {
    totalAccounts: number
    highlyEngaged: number
    lowEngagement: number
    averageEngagementScore: number
  }
  accounts: Array<{
    accountId: string
    accountName: string
    engagementScore: number
    lastActivity: string
    activityCount: number
    responseRate: number
    meetingAcceptance: number
    contentEngagement: number
  }>
  engagementTrend: Array<{
    period: string
    averageScore: number
    activeAccounts: number
    inactiveAccounts: number
  }>
  engagementByChannel: Array<{
    channel: string
    engagementRate: number
    accountsEngaged: number
  }>
  metadata: ReportMetadata
}

// ==================== WIN/LOSS REPORTS ====================

/**
 * Win/loss analysis filters
 */
export interface WinLossAnalysisFilters extends Partial<DateRange>, UserRef {
  dealSize?: string
  competitorId?: string
}

/**
 * Win/loss analysis response
 */
export interface WinLossAnalysisReport {
  summary: {
    totalDeals: number
    wonDeals: number
    lostDeals: number
    winRate: number
    totalWonValue: number
    totalLostValue: number
  }
  winReasons: Array<{
    reason: string
    count: number
    percentage: number
    averageValue: number
  }>
  lossReasons: Array<{
    reason: string
    count: number
    percentage: number
    averageValue: number
  }>
  competitiveWins: Array<{
    competitorId: string
    competitorName: string
    winsAgainst: number
    lossesAgainst: number
    winRate: number
  }>
  dealSizeImpact: Array<{
    sizeRange: string
    wonDeals: number
    lostDeals: number
    winRate: number
  }>
  metadata: ReportMetadata
}

/**
 * Lost deals analysis filters
 */
export interface LostDealsAnalysisFilters extends Partial<DateRange>, UserRef {
  stageId?: string
  lossReason?: string
}

/**
 * Lost deals analysis response
 */
export interface LostDealsAnalysisReport {
  summary: {
    totalLostDeals: number
    totalLostValue: number
    averageLostDealSize: number
    recoverableDeals: number
    recoverableValue: number
  }
  lostByStage: Array<{
    stageId: string
    stageName: string
    lostCount: number
    lostValue: number
    percentage: number
  }>
  lostByReason: Array<{
    reason: string
    count: number
    percentage: number
    averageValue: number
    recoverable: boolean
  }>
  lostToCompetitors: Array<{
    competitorId: string
    competitorName: string
    dealsLost: number
    valueLost: number
    commonReasons: string[]
  }>
  lostDealDetails: Array<{
    dealId: string
    dealName: string
    value: number
    stageReached: string
    lostReason: string
    lostDate: string
    owner: string
  }>
  metadata: ReportMetadata
}

/**
 * Competitor tracking filters
 */
export interface CompetitorTrackingFilters extends Partial<DateRange> {
  competitorId?: string
  dealSize?: string
}

/**
 * Competitor tracking response
 */
export interface CompetitorTrackingReport {
  summary: {
    totalCompetitors: number
    totalCompetedDeals: number
    overallWinRate: number
    mainCompetitor: string
  }
  competitors: Array<{
    competitorId: string
    competitorName: string
    dealsEncountered: number
    dealsWon: number
    dealsLost: number
    winRate: number
    averageWonValue: number
    averageLostValue: number
  }>
  competitiveAdvantages: Array<{
    advantage: string
    effectiveness: number
    usageCount: number
  }>
  competitiveWeaknesses: Array<{
    weakness: string
    impact: number
    occurrenceCount: number
  }>
  winStrategies: Array<{
    strategy: string
    successRate: number
    recommendedFor: string[]
  }>
  metadata: ReportMetadata
}

// ==================== TERRITORY REPORTS ====================

/**
 * Territory performance filters
 */
export interface TerritoryPerformanceFilters extends Partial<DateRange> {
  territoryId?: string
  region?: string
}

/**
 * Territory performance response
 */
export interface TerritoryPerformanceReport {
  summary: {
    totalTerritories: number
    totalRevenue: number
    averageRevenuePerTerritory: number
    topTerritory: string
  }
  territories: Array<{
    territoryId: string
    territoryName: string
    region: string
    revenue: number
    dealCount: number
    accountCount: number
    quotaAttainment: number
    growth: number // percentage
    assignedReps: number
  }>
  territoryComparison: Array<{
    territoryId: string
    territoryName: string
    rank: number
    revenuePerAccount: number
    revenuePerRep: number
    efficiency: number
  }>
  metadata: ReportMetadata
}

/**
 * Regional sales filters
 */
export interface RegionalSalesFilters extends Partial<DateRange> {
  region?: string
  country?: string
}

/**
 * Regional sales response
 */
export interface RegionalSalesReport {
  summary: {
    totalRegions: number
    totalRevenue: number
    topRegion: string
    fastestGrowingRegion: string
  }
  regions: Array<{
    region: string
    country?: string
    revenue: number
    dealCount: number
    accountCount: number
    marketShare: number
    growth: number
    penetration: number // percentage of addressable market
  }>
  revenueByRegion: Array<{
    region: string
    revenue: number
    percentage: number
  }>
  growthOpportunities: Array<{
    region: string
    opportunitySize: number
    penetration: number
    recommendedAction: string
  }>
  metadata: ReportMetadata
}

/**
 * Geographic pipeline filters
 */
export interface GeographicPipelineFilters extends UserRef {
  region?: string
  stageId?: string
}

/**
 * Geographic pipeline response
 */
export interface GeographicPipelineReport {
  summary: {
    totalPipelineValue: number
    totalDeals: number
    averageDealSize: number
    topRegion: string
  }
  pipelineByRegion: Array<{
    region: string
    dealCount: number
    totalValue: number
    averageDealSize: number
    winRate: number
    averageCycleTime: number // in days
  }>
  pipelineByStage: Array<{
    stageId: string
    stageName: string
    regions: Array<{
      region: string
      dealCount: number
      totalValue: number
    }>
  }>
  coverage: Array<{
    region: string
    assignedReps: number
    dealsPerRep: number
    valuePerRep: number
  }>
  metadata: ReportMetadata
}

// ==================== TRANSACTION LOG ====================

/**
 * CRM transaction filters
 */
export interface CrmTransactionFilters extends Partial<DateRange>, PaginationParams {
  entityType?: 'deal' | 'lead' | 'contact' | 'account' | 'activity'
  entityId?: string
  action?: 'create' | 'update' | 'delete' | 'status_change' | 'stage_change'
  userId?: string
}

/**
 * CRM transaction response
 */
export interface CrmTransactionsReport {
  summary: {
    totalTransactions: number
    uniqueUsers: number
    mostActiveUser: string
    mostModifiedEntity: string
  }
  transactions: Array<{
    transactionId: string
    timestamp: string
    userId: string
    userName: string
    entityType: string
    entityId: string
    entityName: string
    action: string
    changes: Array<{
      field: string
      oldValue: any
      newValue: any
    }>
    metadata?: Record<string, any>
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  metadata: ReportMetadata
}

/**
 * Transaction summary filters
 */
export interface TransactionSummaryFilters extends Partial<DateRange> {
  groupBy?: 'user' | 'entity_type' | 'action' | 'date'
}

/**
 * Transaction summary response
 */
export interface TransactionSummaryReport {
  summary: {
    totalTransactions: number
    averagePerDay: number
    peakDay: string
    mostCommonAction: string
  }
  breakdown: Array<{
    key: string
    label: string
    transactionCount: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }>
  activityTrend: Array<{
    date: string
    transactions: number
    uniqueUsers: number
  }>
  topUsers: Array<{
    userId: string
    userName: string
    transactionCount: number
    entities: number
  }>
  metadata: ReportMetadata
}

/**
 * Export format for transactions
 */
export type TransactionExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf'

// ==================== SERVICE METHODS ====================

/**
 * CRM Reports Service
 * All methods follow the pattern:
 * 1. Accept optional filter parameters
 * 2. Make API call with apiClient
 * 3. Unwrap response data (response.data.data || response.data)
 * 4. Handle errors with handleApiError
 * 5. Return strongly-typed response
 */
const crmReportsService = {
  // ==================== PIPELINE REPORTS ====================

  /**
   * Get pipeline overview report
   * GET /api/crm/reports/pipeline/overview
   */
  getPipelineOverview: async (filters?: PipelineOverviewFilters): Promise<PipelineOverviewReport> => {
    try {
      const response = await apiClient.get('/crm/reports/pipeline/overview', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get pipeline velocity report
   * GET /api/crm/reports/pipeline/velocity
   */
  getPipelineVelocity: async (filters?: PipelineVelocityFilters): Promise<PipelineVelocityReport> => {
    try {
      const response = await apiClient.get('/crm/reports/pipeline/velocity', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get stage duration analysis
   * GET /api/crm/reports/pipeline/stage-duration
   */
  getStageDuration: async (filters?: StageDurationFilters): Promise<StageDurationReport> => {
    try {
      const response = await apiClient.get('/crm/reports/pipeline/stage-duration', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get deal aging report
   * GET /api/crm/reports/pipeline/deal-aging
   */
  getDealAging: async (filters?: DealAgingFilters): Promise<DealAgingReport> => {
    try {
      const response = await apiClient.get('/crm/reports/pipeline/deal-aging', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get pipeline movement report
   * GET /api/crm/reports/pipeline/movement
   */
  getPipelineMovement: async (filters?: PipelineMovementFilters): Promise<PipelineMovementReport> => {
    try {
      const response = await apiClient.get('/crm/reports/pipeline/movement', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== LEAD REPORTS ====================

  /**
   * Get leads by source report
   * GET /api/crm/reports/leads/by-source
   */
  getLeadsBySource: async (filters?: LeadsBySourceFilters): Promise<LeadsBySourceReport> => {
    try {
      const response = await apiClient.get('/crm/reports/leads/by-source', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get lead conversion funnel
   * GET /api/crm/reports/leads/conversion-funnel
   */
  getLeadConversionFunnel: async (filters?: LeadConversionFunnelFilters): Promise<LeadConversionFunnelReport> => {
    try {
      const response = await apiClient.get('/crm/reports/leads/conversion-funnel', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get lead response time analysis
   * GET /api/crm/reports/leads/response-time
   */
  getLeadResponseTime: async (filters?: LeadResponseTimeFilters): Promise<LeadResponseTimeReport> => {
    try {
      const response = await apiClient.get('/crm/reports/leads/response-time', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get lead velocity rate
   * GET /api/crm/reports/leads/velocity
   */
  getLeadVelocityRate: async (filters?: LeadVelocityFilters): Promise<LeadVelocityRateReport> => {
    try {
      const response = await apiClient.get('/crm/reports/leads/velocity', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get lead distribution report
   * GET /api/crm/reports/leads/distribution
   */
  getLeadDistribution: async (filters?: LeadDistributionFilters): Promise<LeadDistributionReport> => {
    try {
      const response = await apiClient.get('/crm/reports/leads/distribution', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== ACTIVITY REPORTS ====================

  /**
   * Get activity summary
   * GET /api/crm/reports/activity/summary
   */
  getActivitySummary: async (filters?: ActivitySummaryFilters): Promise<ActivitySummaryReport> => {
    try {
      const response = await apiClient.get('/crm/reports/activity/summary', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get call analytics
   * GET /api/crm/reports/activity/calls
   */
  getCallAnalytics: async (filters?: CallAnalyticsFilters): Promise<CallAnalyticsReport> => {
    try {
      const response = await apiClient.get('/crm/reports/activity/calls', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get email engagement analytics
   * GET /api/crm/reports/activity/emails
   */
  getEmailEngagement: async (filters?: EmailEngagementFilters): Promise<EmailEngagementReport> => {
    try {
      const response = await apiClient.get('/crm/reports/activity/emails', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get meeting analytics
   * GET /api/crm/reports/activity/meetings
   */
  getMeetingAnalytics: async (filters?: MeetingAnalyticsFilters): Promise<MeetingAnalyticsReport> => {
    try {
      const response = await apiClient.get('/crm/reports/activity/meetings', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get task completion analytics
   * GET /api/crm/reports/activity/tasks
   */
  getTaskCompletion: async (filters?: TaskCompletionFilters): Promise<TaskCompletionReport> => {
    try {
      const response = await apiClient.get('/crm/reports/activity/tasks', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== REVENUE REPORTS ====================

  /**
   * Get sales forecast
   * GET /api/crm/reports/revenue/forecast
   */
  getSalesForecast: async (filters?: SalesForecastFilters): Promise<SalesForecastReport> => {
    try {
      const response = await apiClient.get('/crm/reports/revenue/forecast', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get revenue analysis
   * GET /api/crm/reports/revenue/analysis
   */
  getRevenueAnalysis: async (filters?: RevenueAnalysisFilters): Promise<RevenueAnalysisReport> => {
    try {
      const response = await apiClient.get('/crm/reports/revenue/analysis', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get quota attainment report
   * GET /api/crm/reports/revenue/quota-attainment
   */
  getQuotaAttainment: async (filters?: QuotaAttainmentFilters): Promise<QuotaAttainmentReport> => {
    try {
      const response = await apiClient.get('/crm/reports/revenue/quota-attainment', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get win rate analysis
   * GET /api/crm/reports/revenue/win-rate
   */
  getWinRateAnalysis: async (filters?: WinRateAnalysisFilters): Promise<WinRateAnalysisReport> => {
    try {
      const response = await apiClient.get('/crm/reports/revenue/win-rate', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get deal size analysis
   * GET /api/crm/reports/revenue/deal-size
   */
  getDealSizeAnalysis: async (filters?: DealSizeAnalysisFilters): Promise<DealSizeAnalysisReport> => {
    try {
      const response = await apiClient.get('/crm/reports/revenue/deal-size', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== PERFORMANCE REPORTS ====================

  /**
   * Get sales leaderboard
   * GET /api/crm/reports/performance/leaderboard
   */
  getSalesLeaderboard: async (filters?: SalesLeaderboardFilters): Promise<SalesLeaderboardReport> => {
    try {
      const response = await apiClient.get('/crm/reports/performance/leaderboard', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get team performance report
   * GET /api/crm/reports/performance/team
   */
  getTeamPerformance: async (filters?: TeamPerformanceFilters): Promise<TeamPerformanceReport> => {
    try {
      const response = await apiClient.get('/crm/reports/performance/team', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get individual rep scorecard
   * GET /api/crm/reports/performance/rep-scorecard/:userId
   */
  getRepScorecard: async (userId: string, filters?: RepScorecardFilters): Promise<RepScorecardReport> => {
    try {
      const response = await apiClient.get(`/crm/reports/performance/rep-scorecard/${userId}`, { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get activity metrics by rep
   * GET /api/crm/reports/performance/activity-metrics
   */
  getActivityMetricsByRep: async (filters?: ActivityMetricsByRepFilters): Promise<ActivityMetricsByRepReport> => {
    try {
      const response = await apiClient.get('/crm/reports/performance/activity-metrics', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== CUSTOMER REPORTS ====================

  /**
   * Get customer lifetime value report
   * GET /api/crm/reports/customer/lifetime-value
   */
  getCustomerLifetimeValue: async (filters?: CustomerLifetimeValueFilters): Promise<CustomerLifetimeValueReport> => {
    try {
      const response = await apiClient.get('/crm/reports/customer/lifetime-value', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get churn analysis report
   * GET /api/crm/reports/customer/churn
   */
  getChurnAnalysis: async (filters?: ChurnAnalysisFilters): Promise<ChurnAnalysisReport> => {
    try {
      const response = await apiClient.get('/crm/reports/customer/churn', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get customer health score report
   * GET /api/crm/reports/customer/health-score
   */
  getCustomerHealthScore: async (filters?: CustomerHealthScoreFilters): Promise<CustomerHealthScoreReport> => {
    try {
      const response = await apiClient.get('/crm/reports/customer/health-score', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get account engagement report
   * GET /api/crm/reports/customer/engagement
   */
  getAccountEngagement: async (filters?: AccountEngagementFilters): Promise<AccountEngagementReport> => {
    try {
      const response = await apiClient.get('/crm/reports/customer/engagement', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== WIN/LOSS REPORTS ====================

  /**
   * Get win/loss analysis
   * GET /api/crm/reports/win-loss/analysis
   */
  getWinLossAnalysis: async (filters?: WinLossAnalysisFilters): Promise<WinLossAnalysisReport> => {
    try {
      const response = await apiClient.get('/crm/reports/win-loss/analysis', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get lost deals analysis
   * GET /api/crm/reports/win-loss/lost-deals
   */
  getLostDealsAnalysis: async (filters?: LostDealsAnalysisFilters): Promise<LostDealsAnalysisReport> => {
    try {
      const response = await apiClient.get('/crm/reports/win-loss/lost-deals', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get competitor tracking report
   * GET /api/crm/reports/win-loss/competitors
   */
  getCompetitorTracking: async (filters?: CompetitorTrackingFilters): Promise<CompetitorTrackingReport> => {
    try {
      const response = await apiClient.get('/crm/reports/win-loss/competitors', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== TERRITORY REPORTS ====================

  /**
   * Get territory performance report
   * GET /api/crm/reports/territory/performance
   */
  getTerritoryPerformance: async (filters?: TerritoryPerformanceFilters): Promise<TerritoryPerformanceReport> => {
    try {
      const response = await apiClient.get('/crm/reports/territory/performance', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get regional sales report
   * GET /api/crm/reports/territory/regional-sales
   */
  getRegionalSales: async (filters?: RegionalSalesFilters): Promise<RegionalSalesReport> => {
    try {
      const response = await apiClient.get('/crm/reports/territory/regional-sales', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get geographic pipeline report
   * GET /api/crm/reports/territory/geographic-pipeline
   */
  getGeographicPipeline: async (filters?: GeographicPipelineFilters): Promise<GeographicPipelineReport> => {
    try {
      const response = await apiClient.get('/crm/reports/territory/geographic-pipeline', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== TRANSACTION LOG ====================

  /**
   * Get CRM transactions log
   * GET /api/crm/reports/transactions
   */
  getCrmTransactions: async (filters?: CrmTransactionFilters): Promise<CrmTransactionsReport> => {
    try {
      const response = await apiClient.get('/crm/reports/transactions', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get transaction summary
   * GET /api/crm/reports/transactions/summary
   */
  getTransactionSummary: async (filters?: TransactionSummaryFilters): Promise<TransactionSummaryReport> => {
    try {
      const response = await apiClient.get('/crm/reports/transactions/summary', { params: filters })
      return response.data.report || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export transactions
   * GET /api/crm/reports/transactions/export
   * Returns a Blob for download
   */
  exportTransactions: async (filters: CrmTransactionFilters, format: TransactionExportFormat = 'csv'): Promise<Blob> => {
    try {
      const response = await apiClient.get('/crm/reports/transactions/export', {
        params: { ...filters, format },
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== UTILITY METHODS ====================

  /**
   * Export any report to specified format
   * GET /api/crm/reports/{reportType}/export
   */
  exportReport: async (
    reportType: string,
    format: 'csv' | 'xlsx' | 'pdf' = 'pdf',
    filters?: Record<string, any>
  ): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/crm/reports/${reportType}/export`, {
        params: { ...filters, format },
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Schedule recurring report delivery
   * POST /api/crm/reports/schedule
   */
  scheduleReport: async (data: {
    reportType: string
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
    filters?: Record<string, any>
    format?: 'csv' | 'xlsx' | 'pdf'
  }): Promise<{ scheduleId: string; nextRun: string }> => {
    try {
      const response = await apiClient.post('/crm/reports/schedule', data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get report metadata and available filters
   * GET /api/crm/reports/{reportType}/metadata
   */
  getReportMetadata: async (reportType: string): Promise<{
    availableFilters: Array<{
      name: string
      type: string
      required: boolean
      options?: any[]
    }>
    description: string
    estimatedExecutionTime: number
  }> => {
    try {
      const response = await apiClient.get(`/crm/reports/${reportType}/metadata`)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default crmReportsService

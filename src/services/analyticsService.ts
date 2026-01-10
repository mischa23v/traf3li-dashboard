import api from './api'

// ==================== TYPES & ENUMS ====================

// Metric Type
export type MetricType =
  | 'count'
  | 'sum'
  | 'average'
  | 'percentage'
  | 'ratio'
  | 'rate'
  | 'growth'
  | 'trend'
  | 'distribution'

// Time Granularity
export type TimeGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

// Chart Type
export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'heatmap'
  | 'funnel'
  | 'gauge'
  | 'table'
  | 'kpi'

// Comparison Type
export type ComparisonType = 'previous_period' | 'previous_year' | 'target' | 'benchmark'

// Alert Condition
export type AlertCondition =
  | 'greater_than'
  | 'less_than'
  | 'equals'
  | 'greater_than_or_equals'
  | 'less_than_or_equals'
  | 'change_by_percent'
  | 'change_by_value'

// Event Category
export type EventCategory =
  | 'page_view'
  | 'user_action'
  | 'transaction'
  | 'system'
  | 'error'
  | 'conversion'
  | 'engagement'
  | 'retention'

// ==================== LABELS ====================

export const METRIC_TYPE_LABELS: Record<MetricType, { ar: string; en: string }> = {
  count: { ar: 'عدد', en: 'Count' },
  sum: { ar: 'مجموع', en: 'Sum' },
  average: { ar: 'متوسط', en: 'Average' },
  percentage: { ar: 'نسبة مئوية', en: 'Percentage' },
  ratio: { ar: 'نسبة', en: 'Ratio' },
  rate: { ar: 'معدل', en: 'Rate' },
  growth: { ar: 'نمو', en: 'Growth' },
  trend: { ar: 'اتجاه', en: 'Trend' },
  distribution: { ar: 'توزيع', en: 'Distribution' },
}

export const TIME_GRANULARITY_LABELS: Record<TimeGranularity, { ar: string; en: string }> = {
  hourly: { ar: 'بالساعة', en: 'Hourly' },
  daily: { ar: 'يومي', en: 'Daily' },
  weekly: { ar: 'أسبوعي', en: 'Weekly' },
  monthly: { ar: 'شهري', en: 'Monthly' },
  quarterly: { ar: 'ربع سنوي', en: 'Quarterly' },
  yearly: { ar: 'سنوي', en: 'Yearly' },
}

export const CHART_TYPE_LABELS: Record<ChartType, { ar: string; en: string; icon: string }> = {
  line: { ar: 'خطي', en: 'Line', icon: 'TrendingUp' },
  bar: { ar: 'أعمدة', en: 'Bar', icon: 'BarChart' },
  area: { ar: 'مساحة', en: 'Area', icon: 'AreaChart' },
  pie: { ar: 'دائري', en: 'Pie', icon: 'PieChart' },
  donut: { ar: 'حلقي', en: 'Donut', icon: 'Circle' },
  scatter: { ar: 'نقطي', en: 'Scatter', icon: 'ScatterChart' },
  heatmap: { ar: 'خريطة حرارية', en: 'Heatmap', icon: 'Grid' },
  funnel: { ar: 'قمع', en: 'Funnel', icon: 'Filter' },
  gauge: { ar: 'مقياس', en: 'Gauge', icon: 'Gauge' },
  table: { ar: 'جدول', en: 'Table', icon: 'Table' },
  kpi: { ar: 'مؤشر أداء', en: 'KPI Card', icon: 'Activity' },
}

export const EVENT_CATEGORY_LABELS: Record<EventCategory, { ar: string; en: string; color: string }> = {
  page_view: { ar: 'عرض صفحة', en: 'Page View', color: 'blue' },
  user_action: { ar: 'إجراء مستخدم', en: 'User Action', color: 'green' },
  transaction: { ar: 'معاملة', en: 'Transaction', color: 'purple' },
  system: { ar: 'نظام', en: 'System', color: 'gray' },
  error: { ar: 'خطأ', en: 'Error', color: 'red' },
  conversion: { ar: 'تحويل', en: 'Conversion', color: 'teal' },
  engagement: { ar: 'تفاعل', en: 'Engagement', color: 'orange' },
  retention: { ar: 'احتفاظ', en: 'Retention', color: 'indigo' },
}

// ==================== INTERFACES ====================

// Dashboard Summary
export interface DashboardSummary {
  period: {
    startDate: string
    endDate: string
    granularity: TimeGranularity
  }

  // Key Metrics
  keyMetrics: Array<{
    id: string
    name: string
    nameAr?: string
    value: number
    previousValue?: number
    change?: number
    changePercent?: number
    trend: 'up' | 'down' | 'stable'
    format: 'number' | 'currency' | 'percentage'
    currency?: string
    target?: number
    targetProgress?: number
  }>

  // Summary Stats
  summary: {
    totalRevenue: number
    revenueTrend: number
    totalTransactions: number
    transactionsTrend: number
    activeUsers: number
    usersTrend: number
    conversionRate: number
    conversionTrend: number
    averageOrderValue: number
    aovTrend: number
  }

  // Quick Charts
  charts: Array<{
    id: string
    title: string
    titleAr?: string
    chartType: ChartType
    data: Array<{ label: string; value: number; labelAr?: string }>
  }>

  // Alerts
  alerts: Array<{
    id: string
    severity: 'info' | 'warning' | 'critical'
    message: string
    messageAr?: string
    metric: string
    timestamp: string
  }>
}

// Time Series Data
export interface TimeSeriesData {
  metric: string
  metricName: string
  metricNameAr?: string
  granularity: TimeGranularity
  period: {
    startDate: string
    endDate: string
  }

  // Data Points
  dataPoints: Array<{
    timestamp: string
    value: number
    formattedValue?: string
    label?: string
    labelAr?: string
  }>

  // Statistics
  statistics: {
    min: number
    max: number
    average: number
    sum: number
    count: number
    standardDeviation?: number
    percentile95?: number
  }

  // Comparison
  comparison?: {
    type: ComparisonType
    previousData: Array<{
      timestamp: string
      value: number
    }>
    change: number
    changePercent: number
  }
}

// Funnel Analysis
export interface FunnelAnalysis {
  funnelId: string
  funnelName: string
  funnelNameAr?: string
  period: {
    startDate: string
    endDate: string
  }

  // Steps
  steps: Array<{
    stepNumber: number
    stepName: string
    stepNameAr?: string
    eventName: string
    count: number
    percentage: number
    conversionFromPrevious?: number
    dropoffFromPrevious?: number
    dropoffCount?: number
    averageTimeToNext?: number // seconds
  }>

  // Summary
  summary: {
    totalEntered: number
    totalCompleted: number
    overallConversionRate: number
    averageTimeToComplete: number
    biggestDropoff: {
      stepNumber: number
      stepName: string
      dropoffRate: number
    }
  }

  // Segments
  bySegment?: Array<{
    segmentName: string
    segmentNameAr?: string
    conversionRate: number
    avgTimeToComplete: number
  }>
}

// Cohort Analysis
export interface CohortAnalysis {
  cohortType: 'acquisition' | 'behavior' | 'custom'
  metric: string
  metricName: string
  metricNameAr?: string
  granularity: TimeGranularity
  period: {
    startDate: string
    endDate: string
  }

  // Cohorts
  cohorts: Array<{
    cohortId: string
    cohortName: string
    cohortNameAr?: string
    cohortDate: string
    size: number

    // Retention by Period
    periods: Array<{
      periodNumber: number
      periodLabel: string
      value: number
      percentage: number
      retained: number
    }>
  }>

  // Summary
  summary: {
    averageRetention: Record<number, number> // period number -> average %
    bestCohort: {
      cohortId: string
      cohortName: string
      retention: number
    }
    worstCohort: {
      cohortId: string
      cohortName: string
      retention: number
    }
  }
}

// Event Analytics
export interface EventAnalytics {
  period: {
    startDate: string
    endDate: string
  }

  // Top Events
  topEvents: Array<{
    eventName: string
    eventNameAr?: string
    category: EventCategory
    count: number
    uniqueUsers: number
    percentage: number
    trend: number
    avgPerUser: number
  }>

  // By Category
  byCategory: Record<
    EventCategory,
    {
      totalEvents: number
      uniqueUsers: number
      topEvent: string
    }
  >

  // Event Flow
  eventFlow?: Array<{
    fromEvent: string
    toEvent: string
    count: number
    percentage: number
    avgTimeBetween: number
  }>
}

// User Analytics
export interface UserAnalytics {
  period: {
    startDate: string
    endDate: string
  }

  // Overview
  overview: {
    totalUsers: number
    newUsers: number
    returningUsers: number
    activeUsers: number
    churned: number
    reactivated: number
  }

  // Trends
  trends: {
    dau: Array<{ date: string; value: number }>
    wau: Array<{ date: string; value: number }>
    mau: Array<{ date: string; value: number }>
    dauMauRatio: number
  }

  // Segments
  segments: Array<{
    segmentId: string
    segmentName: string
    segmentNameAr?: string
    userCount: number
    percentage: number
    avgSessionDuration: number
    avgEventsPerSession: number
    avgRevenue: number
  }>

  // Demographics
  demographics?: {
    byCountry: Array<{ country: string; users: number; percentage: number }>
    byCity: Array<{ city: string; users: number; percentage: number }>
    byDevice: Array<{ device: string; users: number; percentage: number }>
    byBrowser: Array<{ browser: string; users: number; percentage: number }>
  }
}

// CRM Analytics
export interface CrmAnalytics {
  period: {
    startDate: string
    endDate: string
  }

  // Pipeline
  pipeline: {
    totalDeals: number
    totalValue: number
    currency: string
    averageDealSize: number
    winRate: number
    avgSalesCycle: number // days

    byStage: Array<{
      stage: string
      stageAr?: string
      count: number
      value: number
      percentage: number
      avgDaysInStage: number
      conversionToNext: number
    }>
  }

  // Activity
  activity: {
    totalActivities: number
    callsMade: number
    emailsSent: number
    meetingsHeld: number
    tasksCompleted: number

    byRep: Array<{
      repId: string
      repName: string
      repNameAr?: string
      activities: number
      dealsWon: number
      revenue: number
      conversionRate: number
    }>
  }

  // Leads
  leads: {
    totalLeads: number
    newLeads: number
    qualifiedLeads: number
    convertedLeads: number
    conversionRate: number

    bySource: Array<{
      source: string
      sourceAr?: string
      count: number
      qualified: number
      converted: number
      conversionRate: number
      costPerLead?: number
    }>
  }

  // Revenue
  revenue: {
    total: number
    recurring: number
    oneTime: number
    currency: string

    byProduct: Array<{
      productId: string
      productName: string
      productNameAr?: string
      revenue: number
      quantity: number
      avgPrice: number
    }>

    byCustomerSegment: Array<{
      segment: string
      segmentAr?: string
      revenue: number
      customers: number
      avgRevenue: number
    }>
  }
}

// HR Analytics
export interface HrAnalytics {
  period: {
    startDate: string
    endDate: string
  }

  // Headcount
  headcount: {
    total: number
    active: number
    onLeave: number
    remote: number

    byDepartment: Array<{
      departmentId: string
      departmentName: string
      departmentNameAr?: string
      count: number
      percentage: number
    }>

    byGrade: Array<{
      grade: string
      count: number
      percentage: number
    }>

    byNationality: Array<{
      nationality: string
      nationalityAr?: string
      count: number
      percentage: number
    }>
  }

  // Turnover
  turnover: {
    hires: number
    terminations: number
    turnoverRate: number
    voluntaryRate: number
    involuntaryRate: number
    avgTenure: number

    byDepartment: Array<{
      departmentName: string
      departmentNameAr?: string
      hires: number
      terminations: number
      turnoverRate: number
    }>

    byReason: Array<{
      reason: string
      reasonAr?: string
      count: number
      percentage: number
    }>
  }

  // Attendance
  attendance: {
    avgAttendanceRate: number
    avgLateRate: number
    avgAbsenceRate: number
    totalOvertimeHours: number

    trend: Array<{
      date: string
      attendanceRate: number
      lateRate: number
      absenceRate: number
    }>
  }

  // Leave
  leave: {
    totalDaysTaken: number
    avgDaysPerEmployee: number

    byType: Array<{
      leaveType: string
      leaveTypeAr?: string
      days: number
      percentage: number
    }>

    pendingRequests: number
  }

  // Compliance
  compliance: {
    saudizationRate: number
    saudizationTarget: number
    nitaqatBand: string
    gosiCompliance: boolean
    wpsCompliance: boolean
    expiringDocuments: number
  }
}

// Financial Analytics
export interface FinancialAnalytics {
  period: {
    startDate: string
    endDate: string
  }

  // Summary
  summary: {
    totalRevenue: number
    totalExpenses: number
    grossProfit: number
    netProfit: number
    grossMargin: number
    netMargin: number
    currency: string
  }

  // Revenue
  revenue: {
    total: number
    recurring: number
    services: number
    products: number

    trend: Array<{
      period: string
      value: number
    }>

    byCategory: Array<{
      category: string
      categoryAr?: string
      amount: number
      percentage: number
    }>
  }

  // Expenses
  expenses: {
    total: number
    operatingExpenses: number
    payroll: number
    marketing: number
    administrative: number

    trend: Array<{
      period: string
      value: number
    }>

    byCategory: Array<{
      category: string
      categoryAr?: string
      amount: number
      percentage: number
      budget?: number
      variance?: number
    }>
  }

  // Cash Flow
  cashFlow: {
    operatingCashFlow: number
    investingCashFlow: number
    financingCashFlow: number
    netCashFlow: number
    closingBalance: number

    trend: Array<{
      period: string
      inflow: number
      outflow: number
      netFlow: number
    }>
  }

  // Ratios
  ratios: {
    currentRatio: number
    quickRatio: number
    debtToEquity: number
    returnOnAssets: number
    returnOnEquity: number
    inventoryTurnover?: number
    receivablesDays?: number
    payablesDays?: number
  }
}

// Custom Metric
export interface CustomMetric {
  _id: string
  metricId: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string

  // Definition
  formula: string // e.g., "SUM(revenue) / COUNT(transactions)"
  metricType: MetricType
  format: 'number' | 'currency' | 'percentage' | 'duration'
  currency?: string
  decimals?: number

  // Data Source
  dataSource: string
  filters?: Record<string, unknown>
  groupBy?: string[]

  // Display
  chartType?: ChartType
  color?: string

  // Thresholds
  warningThreshold?: number
  criticalThreshold?: number
  target?: number

  // Access
  isPublic: boolean
  createdBy: string
  createdAt: string
  updatedAt?: string
}

// Alert Configuration
export interface AnalyticsAlert {
  _id: string
  alertId: string
  name: string
  nameAr?: string
  description?: string

  // Condition
  metric: string
  condition: AlertCondition
  threshold: number
  comparisonPeriod?: string

  // Notification
  severity: 'info' | 'warning' | 'critical'
  channels: Array<'email' | 'sms' | 'push' | 'slack' | 'webhook'>
  recipients: string[]
  webhookUrl?: string

  // Status
  isActive: boolean
  lastTriggered?: string
  triggerCount: number

  // Audit
  createdBy: string
  createdAt: string
  updatedAt?: string
}

// Analytics Query
export interface AnalyticsQuery {
  metrics: string[]
  dimensions?: string[]
  filters?: Record<string, unknown>
  startDate: string
  endDate: string
  granularity?: TimeGranularity
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

// ==================== API FUNCTIONS ====================

/**
 * Get dashboard summary
 * GET /analytics/dashboard
 */
export const getDashboardSummary = async (
  startDate: string,
  endDate: string,
  granularity: TimeGranularity = 'daily'
): Promise<DashboardSummary> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  params.append('granularity', granularity)

  const response = await api.get(`/analytics/dashboard?${params.toString()}`)
  return response.data
}

/**
 * Get time series data
 * GET /analytics/timeseries/:metric
 */
export const getTimeSeriesData = async (
  metric: string,
  startDate: string,
  endDate: string,
  granularity: TimeGranularity = 'daily',
  comparison?: ComparisonType
): Promise<TimeSeriesData> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  params.append('granularity', granularity)
  if (comparison) params.append('comparison', comparison)

  const response = await api.get(`/analytics/timeseries/${metric}?${params.toString()}`)
  return response.data
}

/**
 * Get funnel analysis
 * GET /analytics/funnel/:funnelId
 */
export const getFunnelAnalysis = async (
  funnelId: string,
  startDate: string,
  endDate: string,
  segmentBy?: string
): Promise<FunnelAnalysis> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  if (segmentBy) params.append('segmentBy', segmentBy)

  const response = await api.get(`/analytics/funnel/${funnelId}?${params.toString()}`)
  return response.data
}

/**
 * Get cohort analysis
 * GET /analytics/cohorts
 */
export const getCohortAnalysis = async (
  cohortType: 'acquisition' | 'behavior' | 'custom',
  metric: string,
  startDate: string,
  endDate: string,
  granularity: TimeGranularity = 'weekly'
): Promise<CohortAnalysis> => {
  const params = new URLSearchParams()
  params.append('cohortType', cohortType)
  params.append('metric', metric)
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  params.append('granularity', granularity)

  const response = await api.get(`/analytics/cohorts?${params.toString()}`)
  return response.data
}

/**
 * Get event analytics
 * GET /analytics/events
 */
export const getEventAnalytics = async (
  startDate: string,
  endDate: string,
  category?: EventCategory,
  limit: number = 20
): Promise<EventAnalytics> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  if (category) params.append('category', category)
  params.append('limit', limit.toString())

  const response = await api.get(`/analytics/events?${params.toString()}`)
  return response.data
}

/**
 * Get user analytics
 * GET /analytics/users
 */
export const getUserAnalytics = async (
  startDate: string,
  endDate: string,
  includeDemo: boolean = false
): Promise<UserAnalytics> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  params.append('includeDemographics', includeDemo.toString())

  const response = await api.get(`/analytics/users?${params.toString()}`)
  return response.data
}

/**
 * Get CRM analytics
 * GET /analytics/crm
 */
export const getCrmAnalytics = async (
  startDate: string,
  endDate: string,
  pipelineId?: string
): Promise<CrmAnalytics> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  if (pipelineId) params.append('pipelineId', pipelineId)

  const response = await api.get(`/analytics/crm?${params.toString()}`)
  return response.data
}

/**
 * Get HR analytics
 * GET /analytics/hr
 */
export const getHrAnalytics = async (
  startDate: string,
  endDate: string,
  departmentId?: string
): Promise<HrAnalytics> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  if (departmentId) params.append('departmentId', departmentId)

  const response = await api.get(`/analytics/hr?${params.toString()}`)
  return response.data
}

/**
 * Get financial analytics
 * GET /analytics/financial
 */
export const getFinancialAnalytics = async (
  startDate: string,
  endDate: string,
  currency?: string
): Promise<FinancialAnalytics> => {
  const params = new URLSearchParams()
  params.append('startDate', startDate)
  params.append('endDate', endDate)
  if (currency) params.append('currency', currency)

  const response = await api.get(`/analytics/financial?${params.toString()}`)
  return response.data
}

/**
 * Run custom query
 * POST /analytics/query
 */
export const runAnalyticsQuery = async (
  query: AnalyticsQuery
): Promise<{
  columns: Array<{ name: string; type: string; label: string; labelAr?: string }>
  rows: Array<Record<string, unknown>>
  summary?: Record<string, number>
  metadata: {
    executionTime: number
    rowCount: number
    cached: boolean
  }
}> => {
  const response = await api.post('/analytics/query', query)
  return response.data
}

/**
 * Get available metrics
 * GET /analytics/metrics
 */
export const getAvailableMetrics = async (): Promise<
  Array<{
    id: string
    name: string
    nameAr?: string
    category: string
    categoryAr?: string
    metricType: MetricType
    format: string
    description?: string
    descriptionAr?: string
  }>
> => {
  const response = await api.get('/analytics/metrics')
  return response.data
}

/**
 * Create custom metric
 * POST /analytics/metrics/custom
 */
export const createCustomMetric = async (data: {
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  formula: string
  metricType: MetricType
  format: 'number' | 'currency' | 'percentage' | 'duration'
  currency?: string
  decimals?: number
  dataSource: string
  filters?: Record<string, unknown>
  chartType?: ChartType
  warningThreshold?: number
  criticalThreshold?: number
  target?: number
  isPublic?: boolean
}): Promise<CustomMetric> => {
  const response = await api.post('/analytics/metrics/custom', data)
  return response.data
}

/**
 * Update custom metric
 * PATCH /analytics/metrics/custom/:id
 */
export const updateCustomMetric = async (
  metricId: string,
  data: Partial<{
    name: string
    nameAr?: string
    description?: string
    descriptionAr?: string
    formula: string
    metricType: MetricType
    format: 'number' | 'currency' | 'percentage' | 'duration'
    chartType?: ChartType
    warningThreshold?: number
    criticalThreshold?: number
    target?: number
    isPublic?: boolean
  }>
): Promise<CustomMetric> => {
  const response = await api.patch(`/analytics/metrics/custom/${metricId}`, data)
  return response.data
}

/**
 * Delete custom metric
 * DELETE /analytics/metrics/custom/:id
 */
export const deleteCustomMetric = async (metricId: string): Promise<void> => {
  await api.delete(`/analytics/metrics/custom/${metricId}`)
}

/**
 * Get my custom metrics
 * GET /analytics/metrics/custom
 */
export const getMyCustomMetrics = async (): Promise<CustomMetric[]> => {
  const response = await api.get('/analytics/metrics/custom')
  return response.data
}

/**
 * Create alert
 * POST /analytics/alerts
 */
export const createAlert = async (data: {
  name: string
  nameAr?: string
  description?: string
  metric: string
  condition: AlertCondition
  threshold: number
  comparisonPeriod?: string
  severity: 'info' | 'warning' | 'critical'
  channels: Array<'email' | 'sms' | 'push' | 'slack' | 'webhook'>
  recipients: string[]
  webhookUrl?: string
  isActive?: boolean
}): Promise<AnalyticsAlert> => {
  const response = await api.post('/analytics/alerts', data)
  return response.data
}

/**
 * Get alerts
 * GET /analytics/alerts
 */
export const getAlerts = async (): Promise<AnalyticsAlert[]> => {
  const response = await api.get('/analytics/alerts')
  return response.data
}

/**
 * Update alert
 * PATCH /analytics/alerts/:id
 */
export const updateAlert = async (
  alertId: string,
  data: Partial<{
    name: string
    nameAr?: string
    description?: string
    metric: string
    condition: AlertCondition
    threshold: number
    severity: 'info' | 'warning' | 'critical'
    channels: Array<'email' | 'sms' | 'push' | 'slack' | 'webhook'>
    recipients: string[]
    webhookUrl?: string
    isActive?: boolean
  }>
): Promise<AnalyticsAlert> => {
  const response = await api.patch(`/analytics/alerts/${alertId}`, data)
  return response.data
}

/**
 * Delete alert
 * DELETE /analytics/alerts/:id
 */
export const deleteAlert = async (alertId: string): Promise<void> => {
  await api.delete(`/analytics/alerts/${alertId}`)
}

/**
 * Get alert history
 * GET /analytics/alerts/:id/history
 */
export const getAlertHistory = async (
  alertId: string,
  limit: number = 50
): Promise<
  Array<{
    triggeredAt: string
    metric: string
    value: number
    threshold: number
    condition: AlertCondition
    severity: 'info' | 'warning' | 'critical'
    notificationsSent: number
    acknowledgedAt?: string
    acknowledgedBy?: string
  }>
> => {
  const response = await api.get(`/analytics/alerts/${alertId}/history?limit=${limit}`)
  return response.data
}

/**
 * Export analytics data
 * POST /analytics/export
 */
export const exportAnalyticsData = async (data: {
  type: 'dashboard' | 'timeseries' | 'funnel' | 'cohort' | 'events' | 'users' | 'crm' | 'hr' | 'financial' | 'custom'
  startDate: string
  endDate: string
  format: 'xlsx' | 'csv' | 'pdf'
  query?: AnalyticsQuery
  options?: Record<string, unknown>
}): Promise<Blob> => {
  const response = await api.post('/analytics/export', data, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Get real-time stats
 * GET /analytics/realtime
 */
export const getRealtimeStats = async (): Promise<{
  activeUsers: number
  activeUsersTrend: Array<{ timestamp: string; value: number }>
  topPages: Array<{ page: string; activeUsers: number }>
  topEvents: Array<{ event: string; count: number; lastOccurred: string }>
  recentTransactions: Array<{
    transactionId: string
    amount: number
    currency: string
    timestamp: string
  }>
  serverHealth: {
    responseTime: number
    errorRate: number
    uptime: number
  }
}> => {
  const response = await api.get('/analytics/realtime')
  return response.data
}

/**
 * Compare periods
 * POST /analytics/compare
 */
export const comparePeriods = async (data: {
  metrics: string[]
  period1: { startDate: string; endDate: string }
  period2: { startDate: string; endDate: string }
  dimensions?: string[]
}): Promise<{
  metrics: Array<{
    metric: string
    metricName: string
    metricNameAr?: string
    period1Value: number
    period2Value: number
    change: number
    changePercent: number
    trend: 'up' | 'down' | 'stable'
  }>
  byDimension?: Record<
    string,
    Array<{
      dimension: string
      dimensionAr?: string
      period1Value: number
      period2Value: number
      change: number
      changePercent: number
    }>
  >
}> => {
  const response = await api.post('/analytics/compare', data)
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const analyticsService = {
  // Dashboard
  getDashboardSummary,

  // Time Series
  getTimeSeriesData,

  // Advanced Analysis
  getFunnelAnalysis,
  getCohortAnalysis,

  // Domain Analytics
  getEventAnalytics,
  getUserAnalytics,
  getCrmAnalytics,
  getHrAnalytics,
  getFinancialAnalytics,

  // Custom Queries
  runAnalyticsQuery,
  getAvailableMetrics,

  // Custom Metrics
  createCustomMetric,
  updateCustomMetric,
  deleteCustomMetric,
  getMyCustomMetrics,

  // Alerts
  createAlert,
  getAlerts,
  updateAlert,
  deleteAlert,
  getAlertHistory,

  // Export
  exportAnalyticsData,

  // Real-time
  getRealtimeStats,

  // Comparison
  comparePeriods,

  // Constants
  METRIC_TYPE_LABELS,
  TIME_GRANULARITY_LABELS,
  CHART_TYPE_LABELS,
  EVENT_CATEGORY_LABELS,
}

export default analyticsService

import api from './api'

// ==================== TYPES & ENUMS ====================

// Report Type
export type ReportType =
  | 'dashboard'
  | 'standard'
  | 'custom'
  | 'scheduled'
  | 'ad_hoc'
  | 'compliance'
  | 'executive'
  | 'operational'

// Report Category
export type ReportCategory =
  | 'finance'
  | 'hr'
  | 'crm'
  | 'operations'
  | 'sales'
  | 'marketing'
  | 'compliance'
  | 'executive'
  | 'custom'

// Report Format
export type ReportFormat = 'pdf' | 'xlsx' | 'csv' | 'html' | 'json' | 'pptx'

// Report Status
export type ReportStatus =
  | 'draft'
  | 'active'
  | 'scheduled'
  | 'running'
  | 'completed'
  | 'failed'
  | 'archived'

// Schedule Frequency
export type ScheduleFrequency = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'

// Widget Type
export type WidgetType =
  | 'kpi_card'
  | 'line_chart'
  | 'bar_chart'
  | 'area_chart'
  | 'pie_chart'
  | 'donut_chart'
  | 'table'
  | 'data_grid'
  | 'heatmap'
  | 'funnel'
  | 'gauge'
  | 'text'
  | 'image'
  | 'spacer'

// ==================== LABELS ====================

export const REPORT_TYPE_LABELS: Record<ReportType, { ar: string; en: string; icon: string }> = {
  dashboard: { ar: 'لوحة معلومات', en: 'Dashboard', icon: 'LayoutDashboard' },
  standard: { ar: 'تقرير قياسي', en: 'Standard Report', icon: 'FileText' },
  custom: { ar: 'تقرير مخصص', en: 'Custom Report', icon: 'Wrench' },
  scheduled: { ar: 'تقرير مجدول', en: 'Scheduled Report', icon: 'Calendar' },
  ad_hoc: { ar: 'تقرير فوري', en: 'Ad-hoc Report', icon: 'Zap' },
  compliance: { ar: 'تقرير الامتثال', en: 'Compliance Report', icon: 'Shield' },
  executive: { ar: 'تقرير تنفيذي', en: 'Executive Report', icon: 'Briefcase' },
  operational: { ar: 'تقرير تشغيلي', en: 'Operational Report', icon: 'Settings' },
}

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, { ar: string; en: string; color: string }> = {
  finance: { ar: 'المالية', en: 'Finance', color: 'green' },
  hr: { ar: 'الموارد البشرية', en: 'Human Resources', color: 'blue' },
  crm: { ar: 'إدارة العملاء', en: 'CRM', color: 'purple' },
  operations: { ar: 'العمليات', en: 'Operations', color: 'orange' },
  sales: { ar: 'المبيعات', en: 'Sales', color: 'cyan' },
  marketing: { ar: 'التسويق', en: 'Marketing', color: 'pink' },
  compliance: { ar: 'الامتثال', en: 'Compliance', color: 'red' },
  executive: { ar: 'تنفيذي', en: 'Executive', color: 'indigo' },
  custom: { ar: 'مخصص', en: 'Custom', color: 'gray' },
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, { ar: string; en: string; color: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'gray' },
  active: { ar: 'نشط', en: 'Active', color: 'green' },
  scheduled: { ar: 'مجدول', en: 'Scheduled', color: 'blue' },
  running: { ar: 'قيد التشغيل', en: 'Running', color: 'yellow' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'teal' },
  failed: { ar: 'فشل', en: 'Failed', color: 'red' },
  archived: { ar: 'مؤرشف', en: 'Archived', color: 'gray' },
}

export const SCHEDULE_FREQUENCY_LABELS: Record<ScheduleFrequency, { ar: string; en: string }> = {
  once: { ar: 'مرة واحدة', en: 'Once' },
  daily: { ar: 'يومي', en: 'Daily' },
  weekly: { ar: 'أسبوعي', en: 'Weekly' },
  biweekly: { ar: 'كل أسبوعين', en: 'Bi-weekly' },
  monthly: { ar: 'شهري', en: 'Monthly' },
  quarterly: { ar: 'ربع سنوي', en: 'Quarterly' },
  yearly: { ar: 'سنوي', en: 'Yearly' },
}

export const WIDGET_TYPE_LABELS: Record<WidgetType, { ar: string; en: string; icon: string }> = {
  kpi_card: { ar: 'بطاقة مؤشر', en: 'KPI Card', icon: 'Activity' },
  line_chart: { ar: 'رسم بياني خطي', en: 'Line Chart', icon: 'TrendingUp' },
  bar_chart: { ar: 'رسم بياني شريطي', en: 'Bar Chart', icon: 'BarChart' },
  area_chart: { ar: 'رسم بياني مساحي', en: 'Area Chart', icon: 'AreaChart' },
  pie_chart: { ar: 'رسم بياني دائري', en: 'Pie Chart', icon: 'PieChart' },
  donut_chart: { ar: 'رسم بياني حلقي', en: 'Donut Chart', icon: 'Circle' },
  table: { ar: 'جدول', en: 'Table', icon: 'Table' },
  data_grid: { ar: 'شبكة بيانات', en: 'Data Grid', icon: 'Grid' },
  heatmap: { ar: 'خريطة حرارية', en: 'Heatmap', icon: 'Map' },
  funnel: { ar: 'قمع', en: 'Funnel', icon: 'Filter' },
  gauge: { ar: 'مقياس', en: 'Gauge', icon: 'Gauge' },
  text: { ar: 'نص', en: 'Text', icon: 'Type' },
  image: { ar: 'صورة', en: 'Image', icon: 'Image' },
  spacer: { ar: 'فاصل', en: 'Spacer', icon: 'Square' },
}

// ==================== INTERFACES ====================

// Report Widget Configuration
export interface ReportWidget {
  widgetId: string
  type: WidgetType
  title?: string
  titleAr?: string
  description?: string
  descriptionAr?: string

  // Layout
  position: {
    x: number
    y: number
    width: number
    height: number
  }

  // Data Configuration
  dataSource?: {
    type: 'metric' | 'query' | 'static'
    metricId?: string
    query?: {
      metrics: string[]
      dimensions?: string[]
      filters?: Record<string, unknown>
    }
    staticData?: unknown
  }

  // Display Options
  options?: {
    showLegend?: boolean
    showLabels?: boolean
    showGrid?: boolean
    showTooltip?: boolean
    colorScheme?: string
    format?: string
    currency?: string
    decimals?: number
    targetValue?: number
    thresholds?: Array<{ value: number; color: string }>
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    limit?: number
  }

  // Styling
  style?: {
    backgroundColor?: string
    borderColor?: string
    borderRadius?: number
    padding?: number
    fontSize?: number
    fontColor?: string
  }
}

// Report Definition
export interface ReportDefinition {
  _id: string
  reportId: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string

  // Classification
  type: ReportType
  category: ReportCategory
  tags?: string[]

  // Configuration
  config: {
    layout: 'portrait' | 'landscape'
    pageSize: 'A4' | 'A3' | 'letter' | 'legal'
    margins?: {
      top: number
      right: number
      bottom: number
      left: number
    }
    header?: {
      showLogo: boolean
      showTitle: boolean
      showDate: boolean
      customText?: string
      customTextAr?: string
    }
    footer?: {
      showPageNumbers: boolean
      showGeneratedDate: boolean
      customText?: string
      customTextAr?: string
    }
  }

  // Content
  widgets: ReportWidget[]
  defaultFilters?: Record<string, unknown>
  defaultDateRange?: {
    type: 'fixed' | 'relative'
    startDate?: string
    endDate?: string
    relativePeriod?: string // e.g., 'last_30_days'
  }

  // Access
  visibility: 'private' | 'team' | 'organization' | 'public'
  allowedRoles?: string[]
  allowedUsers?: string[]

  // Status
  status: ReportStatus
  version: number

  // Audit
  createdBy: string
  createdByName?: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
  lastGeneratedAt?: string
}

// Report Schedule
export interface ReportSchedule {
  _id: string
  scheduleId: string
  reportId: string
  reportName: string
  reportNameAr?: string

  // Schedule Configuration
  frequency: ScheduleFrequency
  nextRunAt: string
  lastRunAt?: string
  lastRunStatus?: 'success' | 'failed'

  // Timing
  runTime: string // HH:mm format
  timezone: string
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  monthOfYear?: number // 1-12 for yearly

  // Parameters
  parameters?: Record<string, unknown>
  dateRange?: {
    type: 'relative'
    relativePeriod: string
  }

  // Delivery
  delivery: {
    format: ReportFormat
    recipients: Array<{
      type: 'email' | 'user' | 'role' | 'webhook'
      value: string
      name?: string
    }>
    emailSubject?: string
    emailSubjectAr?: string
    emailBody?: string
    emailBodyAr?: string
    webhookUrl?: string
    webhookHeaders?: Record<string, string>
  }

  // Status
  isActive: boolean
  errorCount: number
  lastError?: string

  // Audit
  createdBy: string
  createdAt: string
  updatedAt?: string
}

// Generated Report
export interface GeneratedReport {
  _id: string
  generationId: string
  reportId: string
  reportName: string
  reportNameAr?: string

  // Generation Details
  format: ReportFormat
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number // 0-100
  startedAt: string
  completedAt?: string
  duration?: number // milliseconds

  // Parameters
  parameters?: Record<string, unknown>
  dateRange: {
    startDate: string
    endDate: string
  }

  // Result
  fileUrl?: string
  fileName?: string
  fileSize?: number
  previewUrl?: string
  error?: string

  // Metadata
  pageCount?: number
  rowCount?: number
  dataTimestamp?: string

  // Delivery
  deliveredTo?: Array<{
    type: 'email' | 'user' | 'webhook'
    value: string
    deliveredAt: string
    status: 'sent' | 'failed'
  }>

  // Source
  source: 'manual' | 'scheduled' | 'api'
  scheduleId?: string

  // Audit
  generatedBy: string
  generatedByName?: string
}

// Dashboard Configuration
export interface DashboardConfig {
  _id: string
  dashboardId: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string

  // Layout
  layout: {
    columns: number
    rowHeight: number
    margin: [number, number]
    compactType: 'vertical' | 'horizontal' | null
  }

  // Widgets
  widgets: Array<
    ReportWidget & {
      refreshInterval?: number // seconds
      cacheEnabled?: boolean
      cacheTtl?: number // seconds
    }
  >

  // Filters
  globalFilters?: Array<{
    filterId: string
    name: string
    nameAr?: string
    type: 'select' | 'multiselect' | 'date' | 'daterange' | 'text' | 'number'
    options?: Array<{ value: string; label: string; labelAr?: string }>
    defaultValue?: unknown
    affectsWidgets: string[]
  }>

  // Settings
  settings: {
    autoRefresh?: boolean
    refreshInterval?: number // seconds
    theme?: 'light' | 'dark' | 'system'
    showFilters?: boolean
    allowExport?: boolean
    allowFullscreen?: boolean
  }

  // Access
  visibility: 'private' | 'team' | 'organization' | 'public'
  isDefault?: boolean
  isFavorite?: boolean

  // Status
  status: 'draft' | 'active' | 'archived'

  // Audit
  createdBy: string
  createdByName?: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
}

// Report Template
export interface ReportTemplate {
  _id: string
  templateId: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  category: ReportCategory
  previewImageUrl?: string

  // Template Definition
  template: {
    config: ReportDefinition['config']
    widgets: ReportWidget[]
    defaultFilters?: Record<string, unknown>
  }

  // Parameters
  parameters: Array<{
    paramId: string
    name: string
    nameAr?: string
    type: 'string' | 'number' | 'date' | 'daterange' | 'select' | 'multiselect'
    required: boolean
    defaultValue?: unknown
    options?: Array<{ value: string; label: string; labelAr?: string }>
    description?: string
    descriptionAr?: string
  }>

  // Metadata
  isBuiltIn: boolean
  popularity: number
  usageCount: number

  // Audit
  createdBy?: string
  createdAt: string
  updatedAt?: string
}

// Report Filters
export interface ReportFilters {
  category?: ReportCategory
  type?: ReportType
  status?: ReportStatus
  search?: string
  tags?: string[]
  createdBy?: string
  visibility?: 'private' | 'team' | 'organization' | 'public'
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ==================== API FUNCTIONS ====================

/**
 * Get all reports
 * GET /analytics/reports
 */
export const getReports = async (
  filters?: ReportFilters
): Promise<{
  data: ReportDefinition[]
  pagination: { total: number; page: number; limit: number; pages: number }
}> => {
  const params = new URLSearchParams()
  if (filters?.category) params.append('category', filters.category)
  if (filters?.type) params.append('type', filters.type)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.tags) params.append('tags', filters.tags.join(','))
  if (filters?.createdBy) params.append('createdBy', filters.createdBy)
  if (filters?.visibility) params.append('visibility', filters.visibility)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get(`/analytics/reports?${params.toString()}`)
  return response.data
}

/**
 * Get single report
 * GET /analytics/reports/:id
 */
export const getReport = async (reportId: string): Promise<ReportDefinition> => {
  const response = await api.get(`/analytics/reports/${reportId}`)
  return response.data
}

/**
 * Create report
 * POST /analytics/reports
 */
export const createReport = async (data: {
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  type: ReportType
  category: ReportCategory
  tags?: string[]
  config: ReportDefinition['config']
  widgets: ReportWidget[]
  defaultFilters?: Record<string, unknown>
  defaultDateRange?: ReportDefinition['defaultDateRange']
  visibility?: 'private' | 'team' | 'organization' | 'public'
  allowedRoles?: string[]
  allowedUsers?: string[]
}): Promise<ReportDefinition> => {
  const response = await api.post('/analytics/reports', data)
  return response.data
}

/**
 * Update report
 * PATCH /analytics/reports/:id
 */
export const updateReport = async (
  reportId: string,
  data: Partial<{
    name: string
    nameAr?: string
    description?: string
    descriptionAr?: string
    type: ReportType
    category: ReportCategory
    tags?: string[]
    config: ReportDefinition['config']
    widgets: ReportWidget[]
    defaultFilters?: Record<string, unknown>
    defaultDateRange?: ReportDefinition['defaultDateRange']
    visibility?: 'private' | 'team' | 'organization' | 'public'
    allowedRoles?: string[]
    allowedUsers?: string[]
    status?: ReportStatus
  }>
): Promise<ReportDefinition> => {
  const response = await api.patch(`/analytics/reports/${reportId}`, data)
  return response.data
}

/**
 * Delete report
 * DELETE /analytics/reports/:id
 */
export const deleteReport = async (reportId: string): Promise<void> => {
  await api.delete(`/analytics/reports/${reportId}`)
}

/**
 * Duplicate report
 * POST /analytics/reports/:id/duplicate
 */
export const duplicateReport = async (
  reportId: string,
  newName?: string
): Promise<ReportDefinition> => {
  const response = await api.post(`/analytics/reports/${reportId}/duplicate`, { newName })
  return response.data
}

/**
 * Generate report
 * POST /analytics/reports/:id/generate
 */
export const generateReport = async (
  reportId: string,
  options: {
    format: ReportFormat
    parameters?: Record<string, unknown>
    dateRange?: { startDate: string; endDate: string }
    deliverTo?: Array<{ type: 'email' | 'user' | 'webhook'; value: string }>
  }
): Promise<GeneratedReport> => {
  const response = await api.post(`/analytics/reports/${reportId}/generate`, options)
  return response.data
}

/**
 * Get generated reports
 * GET /analytics/reports/:id/generations
 */
export const getGeneratedReports = async (
  reportId: string,
  limit: number = 20
): Promise<GeneratedReport[]> => {
  const response = await api.get(`/analytics/reports/${reportId}/generations?limit=${limit}`)
  return response.data
}

/**
 * Get generation status
 * GET /analytics/reports/generations/:generationId
 */
export const getGenerationStatus = async (generationId: string): Promise<GeneratedReport> => {
  const response = await api.get(`/analytics/reports/generations/${generationId}`)
  return response.data
}

/**
 * Download generated report
 * GET /analytics/reports/generations/:generationId/download
 */
export const downloadGeneratedReport = async (generationId: string): Promise<Blob> => {
  const response = await api.get(`/analytics/reports/generations/${generationId}/download`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Get report schedules
 * GET /analytics/reports/schedules
 */
export const getReportSchedules = async (
  reportId?: string
): Promise<ReportSchedule[]> => {
  const params = reportId ? `?reportId=${reportId}` : ''
  const response = await api.get(`/analytics/reports/schedules${params}`)
  return response.data
}

/**
 * Create report schedule
 * POST /analytics/reports/:id/schedule
 */
export const createReportSchedule = async (
  reportId: string,
  data: {
    frequency: ScheduleFrequency
    runTime: string
    timezone: string
    dayOfWeek?: number
    dayOfMonth?: number
    monthOfYear?: number
    parameters?: Record<string, unknown>
    dateRange?: { type: 'relative'; relativePeriod: string }
    delivery: ReportSchedule['delivery']
  }
): Promise<ReportSchedule> => {
  const response = await api.post(`/analytics/reports/${reportId}/schedule`, data)
  return response.data
}

/**
 * Update report schedule
 * PATCH /analytics/reports/schedules/:scheduleId
 */
export const updateReportSchedule = async (
  scheduleId: string,
  data: Partial<{
    frequency: ScheduleFrequency
    runTime: string
    timezone: string
    dayOfWeek?: number
    dayOfMonth?: number
    monthOfYear?: number
    parameters?: Record<string, unknown>
    dateRange?: { type: 'relative'; relativePeriod: string }
    delivery: ReportSchedule['delivery']
    isActive: boolean
  }>
): Promise<ReportSchedule> => {
  const response = await api.patch(`/analytics/reports/schedules/${scheduleId}`, data)
  return response.data
}

/**
 * Delete report schedule
 * DELETE /analytics/reports/schedules/:scheduleId
 */
export const deleteReportSchedule = async (scheduleId: string): Promise<void> => {
  await api.delete(`/analytics/reports/schedules/${scheduleId}`)
}

/**
 * Run schedule now
 * POST /analytics/reports/schedules/:scheduleId/run
 */
export const runScheduleNow = async (scheduleId: string): Promise<GeneratedReport> => {
  const response = await api.post(`/analytics/reports/schedules/${scheduleId}/run`)
  return response.data
}

/**
 * Get dashboards
 * GET /analytics/dashboards
 */
export const getDashboards = async (): Promise<DashboardConfig[]> => {
  const response = await api.get('/analytics/dashboards')
  return response.data
}

/**
 * Get dashboard
 * GET /analytics/dashboards/:id
 */
export const getDashboard = async (dashboardId: string): Promise<DashboardConfig> => {
  const response = await api.get(`/analytics/dashboards/${dashboardId}`)
  return response.data
}

/**
 * Create dashboard
 * POST /analytics/dashboards
 */
export const createDashboard = async (data: {
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  layout: DashboardConfig['layout']
  widgets: DashboardConfig['widgets']
  globalFilters?: DashboardConfig['globalFilters']
  settings?: DashboardConfig['settings']
  visibility?: 'private' | 'team' | 'organization' | 'public'
}): Promise<DashboardConfig> => {
  const response = await api.post('/analytics/dashboards', data)
  return response.data
}

/**
 * Update dashboard
 * PATCH /analytics/dashboards/:id
 */
export const updateDashboard = async (
  dashboardId: string,
  data: Partial<{
    name: string
    nameAr?: string
    description?: string
    descriptionAr?: string
    layout: DashboardConfig['layout']
    widgets: DashboardConfig['widgets']
    globalFilters?: DashboardConfig['globalFilters']
    settings?: DashboardConfig['settings']
    visibility?: 'private' | 'team' | 'organization' | 'public'
    status?: 'draft' | 'active' | 'archived'
  }>
): Promise<DashboardConfig> => {
  const response = await api.patch(`/analytics/dashboards/${dashboardId}`, data)
  return response.data
}

/**
 * Delete dashboard
 * DELETE /analytics/dashboards/:id
 */
export const deleteDashboard = async (dashboardId: string): Promise<void> => {
  await api.delete(`/analytics/dashboards/${dashboardId}`)
}

/**
 * Duplicate dashboard
 * POST /analytics/dashboards/:id/duplicate
 */
export const duplicateDashboard = async (
  dashboardId: string,
  newName?: string
): Promise<DashboardConfig> => {
  const response = await api.post(`/analytics/dashboards/${dashboardId}/duplicate`, { newName })
  return response.data
}

/**
 * Set default dashboard
 * POST /analytics/dashboards/:id/set-default
 */
export const setDefaultDashboard = async (dashboardId: string): Promise<{ message: string }> => {
  const response = await api.post(`/analytics/dashboards/${dashboardId}/set-default`)
  return response.data
}

/**
 * Toggle favorite dashboard
 * POST /analytics/dashboards/:id/favorite
 */
export const toggleFavoriteDashboard = async (
  dashboardId: string
): Promise<{ isFavorite: boolean }> => {
  const response = await api.post(`/analytics/dashboards/${dashboardId}/favorite`)
  return response.data
}

/**
 * Get widget data
 * POST /analytics/dashboards/:id/widgets/:widgetId/data
 */
export const getWidgetData = async (
  dashboardId: string,
  widgetId: string,
  filters?: Record<string, unknown>
): Promise<{
  data: unknown
  metadata: {
    lastUpdated: string
    cacheHit: boolean
    executionTime: number
  }
}> => {
  const response = await api.post(
    `/analytics/dashboards/${dashboardId}/widgets/${widgetId}/data`,
    { filters }
  )
  return response.data
}

/**
 * Export dashboard
 * POST /analytics/dashboards/:id/export
 */
export const exportDashboard = async (
  dashboardId: string,
  format: 'pdf' | 'png' | 'xlsx'
): Promise<Blob> => {
  const response = await api.post(
    `/analytics/dashboards/${dashboardId}/export`,
    { format },
    { responseType: 'blob' }
  )
  return response.data
}

/**
 * Get report templates
 * GET /analytics/reports/templates
 */
export const getReportTemplates = async (
  category?: ReportCategory
): Promise<ReportTemplate[]> => {
  const params = category ? `?category=${category}` : ''
  const response = await api.get(`/analytics/reports/templates${params}`)
  return response.data
}

/**
 * Get template details
 * GET /analytics/reports/templates/:id
 */
export const getReportTemplate = async (templateId: string): Promise<ReportTemplate> => {
  const response = await api.get(`/analytics/reports/templates/${templateId}`)
  return response.data
}

/**
 * Create report from template
 * POST /analytics/reports/templates/:id/create
 */
export const createReportFromTemplate = async (
  templateId: string,
  data: {
    name: string
    nameAr?: string
    description?: string
    descriptionAr?: string
    parameters: Record<string, unknown>
    visibility?: 'private' | 'team' | 'organization' | 'public'
  }
): Promise<ReportDefinition> => {
  const response = await api.post(`/analytics/reports/templates/${templateId}/create`, data)
  return response.data
}

/**
 * Get my recent reports
 * GET /analytics/reports/recent
 */
export const getMyRecentReports = async (limit: number = 10): Promise<GeneratedReport[]> => {
  const response = await api.get(`/analytics/reports/recent?limit=${limit}`)
  return response.data
}

/**
 * Get shared reports
 * GET /analytics/reports/shared
 */
export const getSharedReports = async (): Promise<ReportDefinition[]> => {
  const response = await api.get('/analytics/reports/shared')
  return response.data
}

/**
 * Share report
 * POST /analytics/reports/:id/share
 */
export const shareReport = async (
  reportId: string,
  data: {
    shareWith: Array<{
      type: 'user' | 'role' | 'team'
      id: string
      permission: 'view' | 'edit'
    }>
    message?: string
    notifyRecipients?: boolean
  }
): Promise<{ message: string; shareUrl?: string }> => {
  const response = await api.post(`/analytics/reports/${reportId}/share`, data)
  return response.data
}

/**
 * Get report usage statistics
 * GET /analytics/reports/:id/usage
 */
export const getReportUsage = async (
  reportId: string
): Promise<{
  totalViews: number
  uniqueViewers: number
  totalGenerations: number
  avgGenerationTime: number
  lastViewed: string
  lastGenerated: string
  viewsByPeriod: Array<{ period: string; views: number }>
  topViewers: Array<{ userId: string; userName: string; views: number }>
}> => {
  const response = await api.get(`/analytics/reports/${reportId}/usage`)
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const analyticsReportsService = {
  // Reports CRUD
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  duplicateReport,

  // Report Generation
  generateReport,
  getGeneratedReports,
  getGenerationStatus,
  downloadGeneratedReport,

  // Schedules
  getReportSchedules,
  createReportSchedule,
  updateReportSchedule,
  deleteReportSchedule,
  runScheduleNow,

  // Dashboards
  getDashboards,
  getDashboard,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  duplicateDashboard,
  setDefaultDashboard,
  toggleFavoriteDashboard,
  getWidgetData,
  exportDashboard,

  // Templates
  getReportTemplates,
  getReportTemplate,
  createReportFromTemplate,

  // User Reports
  getMyRecentReports,
  getSharedReports,
  shareReport,
  getReportUsage,

  // Constants
  REPORT_TYPE_LABELS,
  REPORT_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
  SCHEDULE_FREQUENCY_LABELS,
  WIDGET_TYPE_LABELS,
}

export default analyticsReportsService

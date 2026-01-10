import api from './api'

// ==================== TYPES & ENUMS ====================

// Compliance Area
export type ComplianceArea = 'gosi' | 'nitaqat' | 'wps' | 'labor_law' | 'tax' | 'immigration' | 'safety' | 'data_protection'

// Compliance Status
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'at_risk' | 'pending' | 'not_applicable'

// Nitaqat Band
export type NitaqatBand = 'platinum' | 'high_green' | 'low_green' | 'yellow' | 'red'

// WPS Status
export type WpsStatus = 'submitted' | 'validated' | 'rejected' | 'pending' | 'overdue'

// Violation Severity
export type ViolationSeverity = 'minor' | 'major' | 'critical'

// ==================== LABELS ====================

export const COMPLIANCE_AREA_LABELS: Record<ComplianceArea, { ar: string; en: string; icon: string }> = {
  gosi: { ar: 'التأمينات الاجتماعية', en: 'GOSI', icon: 'Shield' },
  nitaqat: { ar: 'نطاقات', en: 'Nitaqat', icon: 'BarChart' },
  wps: { ar: 'حماية الأجور', en: 'WPS', icon: 'Wallet' },
  labor_law: { ar: 'نظام العمل', en: 'Labor Law', icon: 'Scale' },
  tax: { ar: 'الضرائب', en: 'Tax', icon: 'Receipt' },
  immigration: { ar: 'الهجرة', en: 'Immigration', icon: 'Plane' },
  safety: { ar: 'السلامة', en: 'Safety', icon: 'HardHat' },
  data_protection: { ar: 'حماية البيانات', en: 'Data Protection', icon: 'Lock' },
}

export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, { ar: string; en: string; color: string }> = {
  compliant: { ar: 'متوافق', en: 'Compliant', color: 'green' },
  non_compliant: { ar: 'غير متوافق', en: 'Non-Compliant', color: 'red' },
  at_risk: { ar: 'معرض للخطر', en: 'At Risk', color: 'yellow' },
  pending: { ar: 'قيد المراجعة', en: 'Pending', color: 'blue' },
  not_applicable: { ar: 'غير منطبق', en: 'Not Applicable', color: 'gray' },
}

export const NITAQAT_BAND_LABELS: Record<NitaqatBand, { ar: string; en: string; color: string; minPercentage: number }> = {
  platinum: { ar: 'بلاتيني', en: 'Platinum', color: 'slate', minPercentage: 40 },
  high_green: { ar: 'أخضر مرتفع', en: 'High Green', color: 'green', minPercentage: 27 },
  low_green: { ar: 'أخضر منخفض', en: 'Low Green', color: 'lime', minPercentage: 17 },
  yellow: { ar: 'أصفر', en: 'Yellow', color: 'yellow', minPercentage: 7 },
  red: { ar: 'أحمر', en: 'Red', color: 'red', minPercentage: 0 },
}

export const WPS_STATUS_LABELS: Record<WpsStatus, { ar: string; en: string; color: string }> = {
  submitted: { ar: 'مقدم', en: 'Submitted', color: 'blue' },
  validated: { ar: 'معتمد', en: 'Validated', color: 'green' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'yellow' },
  overdue: { ar: 'متأخر', en: 'Overdue', color: 'red' },
}

// ==================== INTERFACES ====================

// GOSI Contribution
export interface GosiContribution {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  gosiNumber: string
  nationality: 'saudi' | 'non_saudi'
  basicSalary: number
  housingAllowance: number
  contributionBase: number
  employeeContribution: number
  employerContribution: number
  totalContribution: number
  employeeRate: number // 9.75% for Saudi
  employerRate: number // 11.75% for Saudi
  month: string
  year: number
  status: 'calculated' | 'submitted' | 'paid' | 'error'
  submissionDate?: string
  paymentDate?: string
  referenceNumber?: string
  errorMessage?: string
}

// GOSI Summary
export interface GosiSummary {
  period: { month: number; year: number }
  totalEmployees: number
  saudiEmployees: number
  nonSaudiEmployees: number
  totalContributionBase: number
  totalEmployeeContribution: number
  totalEmployerContribution: number
  totalContribution: number
  status: 'pending' | 'calculated' | 'submitted' | 'paid'
  submissionDeadline: string
  submissionDate?: string
  paymentDate?: string
  referenceNumber?: string
  employees: GosiContribution[]
}

// Nitaqat Status
export interface NitaqatStatus {
  companyId: string
  companyName: string
  economicActivity: string
  economicActivityCode: string
  companySize: 'micro' | 'small' | 'medium' | 'large' | 'giant'
  sizeCategory: string
  currentBand: NitaqatBand
  targetBand?: NitaqatBand
  saudizationPercentage: number
  requiredPercentage: number
  totalEmployees: number
  saudiEmployees: number
  nonSaudiEmployees: number
  saudiMale: number
  saudiFemale: number
  saudiDisabled: number
  studentWorkers: number
  pointsEarned: number
  pointsRequired: number
  benefits: string[]
  restrictions: string[]
  lastUpdated: string
  nextReviewDate?: string
  trend: Array<{
    date: string
    percentage: number
    band: NitaqatBand
  }>
  recommendations?: Array<{
    action: string
    impact: string
    priority: 'high' | 'medium' | 'low'
  }>
}

// WPS Record
export interface WpsRecord {
  _id: string
  recordId: string
  period: { month: number; year: number }
  submissionDate: string
  submissionDeadline: string
  status: WpsStatus
  totalEmployees: number
  totalAmount: number
  currency: string
  bank: string
  fileReference: string
  fileUrl?: string
  validationResult?: {
    isValid: boolean
    errors: Array<{
      employeeId: string
      employeeName: string
      errorCode: string
      errorMessage: string
    }>
    warnings: Array<{
      employeeId: string
      employeeName: string
      warningCode: string
      warningMessage: string
    }>
  }
  payments: Array<{
    employeeId: string
    employeeName: string
    nationalId: string
    iban: string
    amount: number
    status: 'pending' | 'paid' | 'failed'
    paymentDate?: string
    failureReason?: string
  }>
  createdAt: string
  createdBy: string
  updatedAt?: string
}

// Labor Law Compliance Item
export interface LaborLawComplianceItem {
  articleId: string
  articleNumber: string
  articleTitle: string
  articleTitleAr: string
  category: 'contracts' | 'wages' | 'leave' | 'termination' | 'working_hours' | 'safety' | 'discrimination' | 'other'
  description: string
  descriptionAr?: string
  requirements: string[]
  requirementsAr?: string[]
  complianceStatus: ComplianceStatus
  lastReviewDate: string
  nextReviewDate?: string
  evidenceRequired: string[]
  evidenceProvided: string[]
  issues: Array<{
    issueId: string
    description: string
    severity: ViolationSeverity
    status: 'open' | 'in_progress' | 'resolved'
    resolution?: string
    dueDate?: string
  }>
  notes?: string
}

// Compliance Violation
export interface ComplianceViolation {
  _id: string
  violationId: string
  violationNumber: string
  area: ComplianceArea
  category: string
  title: string
  titleAr?: string
  description: string
  descriptionAr?: string
  severity: ViolationSeverity
  status: 'open' | 'investigating' | 'remediation' | 'resolved' | 'closed'
  discoveredDate: string
  discoveredBy: string
  affectedEmployees?: Array<{
    employeeId: string
    employeeName: string
    impact: string
  }>
  rootCause?: string
  remediation?: {
    plan: string
    assignedTo: string
    dueDate: string
    status: 'pending' | 'in_progress' | 'completed'
    completedDate?: string
  }
  preventiveMeasures?: string[]
  attachments?: Array<{
    name: string
    url: string
    uploadedAt: string
  }>
  fineAmount?: number
  finePaid?: boolean
  resolvedDate?: string
  resolvedBy?: string
  createdAt: string
  updatedAt?: string
}

// Compliance Alert
export interface ComplianceAlert {
  _id: string
  alertId: string
  area: ComplianceArea
  type: 'deadline' | 'expiry' | 'threshold' | 'violation' | 'update'
  severity: 'info' | 'warning' | 'critical'
  title: string
  titleAr?: string
  message: string
  messageAr?: string
  dueDate?: string
  status: 'active' | 'acknowledged' | 'resolved' | 'expired'
  acknowledgedBy?: string
  acknowledgedAt?: string
  relatedEntityType?: string
  relatedEntityId?: string
  action?: {
    label: string
    url: string
  }
  createdAt: string
}

// Compliance Dashboard
export interface ComplianceDashboard {
  overallStatus: ComplianceStatus
  complianceScore: number
  lastUpdated: string

  // GOSI
  gosi: {
    status: ComplianceStatus
    currentMonth: {
      status: GosiSummary['status']
      totalContribution: number
      daysUntilDeadline: number
    }
    lastSubmission?: {
      month: string
      status: string
      amount: number
    }
    trend: Array<{ month: string; amount: number; status: string }>
  }

  // Nitaqat
  nitaqat: {
    status: ComplianceStatus
    currentBand: NitaqatBand
    saudizationPercentage: number
    requiredPercentage: number
    gap: number
    trend: Array<{ date: string; percentage: number }>
  }

  // WPS
  wps: {
    status: ComplianceStatus
    currentMonth: {
      status: WpsStatus
      totalAmount: number
      employeesCount: number
      daysUntilDeadline: number
    }
    lastSubmission?: {
      month: string
      status: string
      amount: number
    }
    rejectionRate: number
  }

  // Labor Law
  laborLaw: {
    status: ComplianceStatus
    totalArticles: number
    compliantArticles: number
    nonCompliantArticles: number
    atRiskArticles: number
    openViolations: number
    criticalIssues: number
  }

  // Alerts
  alerts: {
    critical: number
    warning: number
    info: number
    recentAlerts: ComplianceAlert[]
  }

  // Violations
  violations: {
    total: number
    open: number
    investigating: number
    resolved: number
    byArea: Array<{ area: ComplianceArea; count: number }>
    bySeverity: Array<{ severity: ViolationSeverity; count: number }>
  }

  // Upcoming Deadlines
  upcomingDeadlines: Array<{
    area: ComplianceArea
    deadline: string
    description: string
    daysRemaining: number
  }>
}

// Compliance Report
export interface ComplianceReport {
  reportId: string
  reportType: 'monthly' | 'quarterly' | 'annual' | 'custom'
  period: { from: string; to: string }
  generatedAt: string
  generatedBy: string

  summary: {
    overallScore: number
    previousScore: number
    change: number
    areasReviewed: number
    issuesFound: number
    issuesResolved: number
  }

  byArea: Array<{
    area: ComplianceArea
    status: ComplianceStatus
    score: number
    previousScore: number
    issues: number
    resolved: number
    details: string
  }>

  violations: Array<{
    violationId: string
    area: ComplianceArea
    severity: ViolationSeverity
    status: string
    description: string
    impact: string
    remediation: string
  }>

  recommendations: Array<{
    area: ComplianceArea
    recommendation: string
    priority: 'high' | 'medium' | 'low'
    expectedImpact: string
  }>

  attachments?: Array<{
    name: string
    url: string
  }>
}

// ==================== FILTER INTERFACES ====================

export interface GosiFilters {
  month?: number
  year?: number
  status?: GosiSummary['status']
  nationality?: 'saudi' | 'non_saudi'
}

export interface WpsFilters {
  month?: number
  year?: number
  status?: WpsStatus
  page?: number
  limit?: number
}

export interface ViolationFilters {
  area?: ComplianceArea
  severity?: ViolationSeverity
  status?: ComplianceViolation['status']
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
}

export interface AlertFilters {
  area?: ComplianceArea
  type?: ComplianceAlert['type']
  severity?: ComplianceAlert['severity']
  status?: ComplianceAlert['status']
  page?: number
  limit?: number
}

// ==================== RESPONSE INTERFACES ====================

export interface ViolationResponse {
  data: ComplianceViolation[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface AlertResponse {
  data: ComplianceAlert[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface WpsResponse {
  data: WpsRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// ==================== API FUNCTIONS ====================

// ----- Dashboard -----

/**
 * Get compliance dashboard
 * GET /hr/compliance/dashboard
 */
export const getComplianceDashboard = async (): Promise<ComplianceDashboard> => {
  const response = await api.get('/hr/compliance/dashboard')
  return response.data
}

// ----- GOSI -----

/**
 * Get GOSI summary for a period
 * GET /hr/compliance/gosi
 */
export const getGosiSummary = async (month: number, year: number): Promise<GosiSummary> => {
  const response = await api.get(`/hr/compliance/gosi?month=${month}&year=${year}`)
  return response.data
}

/**
 * Calculate GOSI contributions
 * POST /hr/compliance/gosi/calculate
 */
export const calculateGosiContributions = async (month: number, year: number): Promise<GosiSummary> => {
  const response = await api.post('/hr/compliance/gosi/calculate', { month, year })
  return response.data
}

/**
 * Submit GOSI contributions
 * POST /hr/compliance/gosi/submit
 */
export const submitGosiContributions = async (month: number, year: number): Promise<GosiSummary> => {
  const response = await api.post('/hr/compliance/gosi/submit', { month, year })
  return response.data
}

/**
 * Get GOSI contribution history
 * GET /hr/compliance/gosi/history
 */
export const getGosiHistory = async (year?: number): Promise<GosiSummary[]> => {
  const params = new URLSearchParams()
  if (year) params.append('year', year.toString())

  const response = await api.get(`/hr/compliance/gosi/history?${params.toString()}`)
  return response.data
}

/**
 * Export GOSI report
 * GET /hr/compliance/gosi/export
 */
export const exportGosiReport = async (month: number, year: number): Promise<Blob> => {
  const response = await api.get(`/hr/compliance/gosi/export?month=${month}&year=${year}`, {
    responseType: 'blob',
  })
  return response.data
}

// ----- Nitaqat -----

/**
 * Get Nitaqat status
 * GET /hr/compliance/nitaqat
 */
export const getNitaqatStatus = async (): Promise<NitaqatStatus> => {
  const response = await api.get('/hr/compliance/nitaqat')
  return response.data
}

/**
 * Calculate Nitaqat projection
 * POST /hr/compliance/nitaqat/project
 */
export const projectNitaqat = async (changes: {
  hiresSaudi?: number
  hiresNonSaudi?: number
  terminationsSaudi?: number
  terminationsNonSaudi?: number
}): Promise<{
  current: NitaqatStatus
  projected: NitaqatStatus
  difference: {
    percentage: number
    band: NitaqatBand
    benefits: string[]
    restrictions: string[]
  }
}> => {
  const response = await api.post('/hr/compliance/nitaqat/project', changes)
  return response.data
}

/**
 * Get Nitaqat history
 * GET /hr/compliance/nitaqat/history
 */
export const getNitaqatHistory = async (months?: number): Promise<Array<{
  date: string
  percentage: number
  band: NitaqatBand
  totalEmployees: number
  saudiEmployees: number
}>> => {
  const params = new URLSearchParams()
  if (months) params.append('months', months.toString())

  const response = await api.get(`/hr/compliance/nitaqat/history?${params.toString()}`)
  return response.data
}

/**
 * Get Nitaqat recommendations
 * GET /hr/compliance/nitaqat/recommendations
 */
export const getNitaqatRecommendations = async (): Promise<Array<{
  action: string
  actionAr?: string
  impact: string
  impactAr?: string
  priority: 'high' | 'medium' | 'low'
  estimatedTimeframe: string
}>> => {
  const response = await api.get('/hr/compliance/nitaqat/recommendations')
  return response.data
}

// ----- WPS -----

/**
 * Get WPS records
 * GET /hr/compliance/wps
 */
export const getWpsRecords = async (filters?: WpsFilters): Promise<WpsResponse> => {
  const params = new URLSearchParams()
  if (filters?.month) params.append('month', filters.month.toString())
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.status) params.append('status', filters.status)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/compliance/wps?${params.toString()}`)
  return response.data
}

/**
 * Get single WPS record
 * GET /hr/compliance/wps/:id
 */
export const getWpsRecord = async (recordId: string): Promise<WpsRecord> => {
  const response = await api.get(`/hr/compliance/wps/${recordId}`)
  return response.data
}

/**
 * Generate WPS file
 * POST /hr/compliance/wps/generate
 */
export const generateWpsFile = async (month: number, year: number): Promise<WpsRecord> => {
  const response = await api.post('/hr/compliance/wps/generate', { month, year })
  return response.data
}

/**
 * Validate WPS file
 * POST /hr/compliance/wps/:id/validate
 */
export const validateWpsFile = async (recordId: string): Promise<WpsRecord> => {
  const response = await api.post(`/hr/compliance/wps/${recordId}/validate`)
  return response.data
}

/**
 * Submit WPS file
 * POST /hr/compliance/wps/:id/submit
 */
export const submitWpsFile = async (recordId: string): Promise<WpsRecord> => {
  const response = await api.post(`/hr/compliance/wps/${recordId}/submit`)
  return response.data
}

/**
 * Download WPS file
 * GET /hr/compliance/wps/:id/download
 */
export const downloadWpsFile = async (recordId: string): Promise<Blob> => {
  const response = await api.get(`/hr/compliance/wps/${recordId}/download`, {
    responseType: 'blob',
  })
  return response.data
}

// ----- Labor Law -----

/**
 * Get labor law compliance status
 * GET /hr/compliance/labor-law
 */
export const getLaborLawCompliance = async (): Promise<{
  overallStatus: ComplianceStatus
  complianceScore: number
  totalArticles: number
  byCategory: Array<{
    category: string
    status: ComplianceStatus
    compliant: number
    nonCompliant: number
    atRisk: number
  }>
  items: LaborLawComplianceItem[]
}> => {
  const response = await api.get('/hr/compliance/labor-law')
  return response.data
}

/**
 * Get specific article compliance
 * GET /hr/compliance/labor-law/:articleId
 */
export const getLaborLawArticle = async (articleId: string): Promise<LaborLawComplianceItem> => {
  const response = await api.get(`/hr/compliance/labor-law/${articleId}`)
  return response.data
}

/**
 * Update article compliance status
 * PATCH /hr/compliance/labor-law/:articleId
 */
export const updateLaborLawArticle = async (
  articleId: string,
  data: Partial<LaborLawComplianceItem>
): Promise<LaborLawComplianceItem> => {
  const response = await api.patch(`/hr/compliance/labor-law/${articleId}`, data)
  return response.data
}

/**
 * Upload evidence for article
 * POST /hr/compliance/labor-law/:articleId/evidence
 */
export const uploadLaborLawEvidence = async (
  articleId: string,
  file: File,
  evidenceType: string
): Promise<LaborLawComplianceItem> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('evidenceType', evidenceType)

  const response = await api.post(`/hr/compliance/labor-law/${articleId}/evidence`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

// ----- Violations -----

/**
 * Get compliance violations
 * GET /hr/compliance/violations
 */
export const getViolations = async (filters?: ViolationFilters): Promise<ViolationResponse> => {
  const params = new URLSearchParams()
  if (filters?.area) params.append('area', filters.area)
  if (filters?.severity) params.append('severity', filters.severity)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/compliance/violations?${params.toString()}`)
  return response.data
}

/**
 * Get single violation
 * GET /hr/compliance/violations/:id
 */
export const getViolation = async (violationId: string): Promise<ComplianceViolation> => {
  const response = await api.get(`/hr/compliance/violations/${violationId}`)
  return response.data
}

/**
 * Create violation
 * POST /hr/compliance/violations
 */
export const createViolation = async (data: Partial<ComplianceViolation>): Promise<ComplianceViolation> => {
  const response = await api.post('/hr/compliance/violations', data)
  return response.data
}

/**
 * Update violation
 * PATCH /hr/compliance/violations/:id
 */
export const updateViolation = async (
  violationId: string,
  data: Partial<ComplianceViolation>
): Promise<ComplianceViolation> => {
  const response = await api.patch(`/hr/compliance/violations/${violationId}`, data)
  return response.data
}

/**
 * Resolve violation
 * POST /hr/compliance/violations/:id/resolve
 */
export const resolveViolation = async (
  violationId: string,
  resolution: string
): Promise<ComplianceViolation> => {
  const response = await api.post(`/hr/compliance/violations/${violationId}/resolve`, { resolution })
  return response.data
}

/**
 * Close violation
 * POST /hr/compliance/violations/:id/close
 */
export const closeViolation = async (violationId: string): Promise<ComplianceViolation> => {
  const response = await api.post(`/hr/compliance/violations/${violationId}/close`)
  return response.data
}

// ----- Alerts -----

/**
 * Get compliance alerts
 * GET /hr/compliance/alerts
 */
export const getAlerts = async (filters?: AlertFilters): Promise<AlertResponse> => {
  const params = new URLSearchParams()
  if (filters?.area) params.append('area', filters.area)
  if (filters?.type) params.append('type', filters.type)
  if (filters?.severity) params.append('severity', filters.severity)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/compliance/alerts?${params.toString()}`)
  return response.data
}

/**
 * Acknowledge alert
 * POST /hr/compliance/alerts/:id/acknowledge
 */
export const acknowledgeAlert = async (alertId: string): Promise<ComplianceAlert> => {
  const response = await api.post(`/hr/compliance/alerts/${alertId}/acknowledge`)
  return response.data
}

/**
 * Resolve alert
 * POST /hr/compliance/alerts/:id/resolve
 */
export const resolveAlert = async (alertId: string): Promise<ComplianceAlert> => {
  const response = await api.post(`/hr/compliance/alerts/${alertId}/resolve`)
  return response.data
}

// ----- Reports -----

/**
 * Generate compliance report
 * POST /hr/compliance/reports/generate
 */
export const generateComplianceReport = async (params: {
  reportType: ComplianceReport['reportType']
  periodFrom: string
  periodTo: string
  areas?: ComplianceArea[]
}): Promise<ComplianceReport> => {
  const response = await api.post('/hr/compliance/reports/generate', params)
  return response.data
}

/**
 * Get compliance reports
 * GET /hr/compliance/reports
 */
export const getComplianceReports = async (filters?: {
  reportType?: ComplianceReport['reportType']
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}): Promise<{
  data: ComplianceReport[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}> => {
  const params = new URLSearchParams()
  if (filters?.reportType) params.append('reportType', filters.reportType)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/compliance/reports?${params.toString()}`)
  return response.data
}

/**
 * Export compliance report
 * GET /hr/compliance/reports/:id/export
 */
export const exportComplianceReport = async (reportId: string, format?: 'pdf' | 'excel'): Promise<Blob> => {
  const params = new URLSearchParams()
  if (format) params.append('format', format)

  const response = await api.get(`/hr/compliance/reports/${reportId}/export?${params.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}

// ==================== DEFAULT EXPORT ====================

const complianceService = {
  // Dashboard
  getComplianceDashboard,

  // GOSI
  getGosiSummary,
  calculateGosiContributions,
  submitGosiContributions,
  getGosiHistory,
  exportGosiReport,

  // Nitaqat
  getNitaqatStatus,
  projectNitaqat,
  getNitaqatHistory,
  getNitaqatRecommendations,

  // WPS
  getWpsRecords,
  getWpsRecord,
  generateWpsFile,
  validateWpsFile,
  submitWpsFile,
  downloadWpsFile,

  // Labor Law
  getLaborLawCompliance,
  getLaborLawArticle,
  updateLaborLawArticle,
  uploadLaborLawEvidence,

  // Violations
  getViolations,
  getViolation,
  createViolation,
  updateViolation,
  resolveViolation,
  closeViolation,

  // Alerts
  getAlerts,
  acknowledgeAlert,
  resolveAlert,

  // Reports
  generateComplianceReport,
  getComplianceReports,
  exportComplianceReport,

  // Labels
  COMPLIANCE_AREA_LABELS,
  COMPLIANCE_STATUS_LABELS,
  NITAQAT_BAND_LABELS,
  WPS_STATUS_LABELS,
}

export default complianceService

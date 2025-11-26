import { api } from '@/lib/api'

// Report Types
export type ReportType =
  | 'revenue'
  | 'cases'
  | 'clients'
  | 'staff'
  | 'time-tracking'
  | 'billing'
  | 'collections'
  | 'custom'

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'

export type ReportFormat = 'table' | 'chart' | 'summary' | 'detailed'

// Report Configuration
export interface ReportConfig {
  _id: string
  name: string
  type: ReportType
  description?: string
  period: ReportPeriod
  startDate?: string
  endDate?: string
  filters: ReportFilters
  columns: string[]
  groupBy?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  format: ReportFormat
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'donut'
  isScheduled: boolean
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly'
  recipients?: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ReportFilters {
  clientIds?: string[]
  caseIds?: string[]
  staffIds?: string[]
  caseTypes?: string[]
  caseStatuses?: string[]
  practiceAreas?: string[]
  dateRange?: {
    start: string
    end: string
  }
  minAmount?: number
  maxAmount?: number
  tags?: string[]
}

// Revenue Report
export interface RevenueReport {
  totalRevenue: number
  totalBilled: number
  totalCollected: number
  outstandingAmount: number
  writeOffs: number
  revenueByPeriod: {
    period: string
    billed: number
    collected: number
    outstanding: number
  }[]
  revenueByClient: {
    clientId: string
    clientName: string
    billed: number
    collected: number
    outstanding: number
  }[]
  revenueByPracticeArea: {
    practiceArea: string
    billed: number
    collected: number
    percentage: number
  }[]
  revenueByStaff: {
    staffId: string
    staffName: string
    billed: number
    collected: number
    hours: number
  }[]
}

// Case Report
export interface CaseReport {
  totalCases: number
  openCases: number
  closedCases: number
  pendingCases: number
  averageDuration: number
  casesByStatus: {
    status: string
    count: number
    percentage: number
  }[]
  casesByType: {
    type: string
    count: number
    percentage: number
  }[]
  casesByPracticeArea: {
    practiceArea: string
    count: number
    revenue: number
  }[]
  caseTimeline: {
    period: string
    opened: number
    closed: number
    pending: number
  }[]
  topCasesByRevenue: {
    caseId: string
    caseNumber: string
    clientName: string
    revenue: number
    status: string
  }[]
}

// Client Report
export interface ClientReport {
  totalClients: number
  activeClients: number
  newClients: number
  inactiveClients: number
  clientsByType: {
    type: string
    count: number
    percentage: number
  }[]
  topClientsByRevenue: {
    clientId: string
    clientName: string
    totalCases: number
    totalRevenue: number
    outstandingBalance: number
  }[]
  clientAcquisition: {
    period: string
    newClients: number
    lostClients: number
    netGrowth: number
  }[]
  clientRetention: {
    period: string
    retentionRate: number
  }[]
  clientsBySource: {
    source: string
    count: number
    revenue: number
  }[]
}

// Staff Report
export interface StaffReport {
  totalStaff: number
  activeStaff: number
  staffByRole: {
    role: string
    count: number
  }[]
  performanceMetrics: {
    staffId: string
    staffName: string
    role: string
    totalHours: number
    billableHours: number
    utilizationRate: number
    totalBilled: number
    totalCollected: number
    casesHandled: number
    avgCaseValue: number
  }[]
  timeTracking: {
    staffId: string
    staffName: string
    period: string
    billableHours: number
    nonBillableHours: number
    totalHours: number
  }[]
  topPerformers: {
    staffId: string
    staffName: string
    metric: string
    value: number
  }[]
}

// Time Tracking Report
export interface TimeTrackingReport {
  totalHours: number
  billableHours: number
  nonBillableHours: number
  utilizationRate: number
  averageHourlyRate: number
  timeByActivity: {
    activity: string
    hours: number
    percentage: number
  }[]
  timeByClient: {
    clientId: string
    clientName: string
    hours: number
    billableHours: number
    amount: number
  }[]
  timeByCase: {
    caseId: string
    caseNumber: string
    clientName: string
    hours: number
    amount: number
  }[]
  timeByStaff: {
    staffId: string
    staffName: string
    hours: number
    billableHours: number
    rate: number
    amount: number
  }[]
  timeByPeriod: {
    period: string
    billableHours: number
    nonBillableHours: number
    totalHours: number
  }[]
}

// Billing Report
export interface BillingReport {
  totalInvoices: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  overdueAmount: number
  averageInvoiceValue: number
  averagePaymentTime: number
  invoicesByStatus: {
    status: string
    count: number
    amount: number
  }[]
  invoicesByPeriod: {
    period: string
    count: number
    amount: number
    collected: number
  }[]
  agingReport: {
    range: string
    count: number
    amount: number
    percentage: number
  }[]
  paymentMethods: {
    method: string
    count: number
    amount: number
  }[]
}

// Collections Report
export interface CollectionsReport {
  totalOutstanding: number
  currentDue: number
  overdue30: number
  overdue60: number
  overdue90Plus: number
  collectionRate: number
  agingSummary: {
    range: string
    amount: number
    count: number
    percentage: number
  }[]
  topDebtors: {
    clientId: string
    clientName: string
    totalDue: number
    overdueDays: number
    lastPaymentDate?: string
  }[]
  collectionTrend: {
    period: string
    collected: number
    outstanding: number
    writeOff: number
  }[]
}

// Saved Report
export interface SavedReport {
  _id: string
  name: string
  description?: string
  type: ReportType
  config: ReportConfig
  lastRun?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Dashboard Widget
export interface DashboardWidget {
  _id: string
  type: 'metric' | 'chart' | 'table' | 'list'
  title: string
  reportType: ReportType
  config: Partial<ReportConfig>
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  refreshInterval?: number
}

// API Response Types
export interface ReportsListResponse {
  data: SavedReport[]
  total: number
  page: number
  pageSize: number
}

export interface ReportDataResponse<T> {
  data: T
  generatedAt: string
  period: {
    start: string
    end: string
  }
}

// API Functions
export const reportsService = {
  // Get saved reports list
  getSavedReports: async (params?: {
    type?: ReportType
    page?: number
    pageSize?: number
    search?: string
  }): Promise<ReportsListResponse> => {
    const response = await api.get('/reports', { params })
    return response.data
  },

  // Get single saved report
  getSavedReport: async (id: string): Promise<SavedReport> => {
    const response = await api.get(`/reports/${id}`)
    return response.data
  },

  // Create saved report
  createSavedReport: async (data: Omit<SavedReport, '_id' | 'createdAt' | 'updatedAt'>): Promise<SavedReport> => {
    const response = await api.post('/reports', data)
    return response.data
  },

  // Update saved report
  updateSavedReport: async (id: string, data: Partial<SavedReport>): Promise<SavedReport> => {
    const response = await api.put(`/reports/${id}`, data)
    return response.data
  },

  // Delete saved report
  deleteSavedReport: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}`)
  },

  // Generate revenue report
  getRevenueReport: async (config: Partial<ReportConfig>): Promise<ReportDataResponse<RevenueReport>> => {
    const response = await api.post('/reports/revenue', config)
    return response.data
  },

  // Generate case report
  getCaseReport: async (config: Partial<ReportConfig>): Promise<ReportDataResponse<CaseReport>> => {
    const response = await api.post('/reports/cases', config)
    return response.data
  },

  // Generate client report
  getClientReport: async (config: Partial<ReportConfig>): Promise<ReportDataResponse<ClientReport>> => {
    const response = await api.post('/reports/clients', config)
    return response.data
  },

  // Generate staff report
  getStaffReport: async (config: Partial<ReportConfig>): Promise<ReportDataResponse<StaffReport>> => {
    const response = await api.post('/reports/staff', config)
    return response.data
  },

  // Generate time tracking report
  getTimeTrackingReport: async (config: Partial<ReportConfig>): Promise<ReportDataResponse<TimeTrackingReport>> => {
    const response = await api.post('/reports/time-tracking', config)
    return response.data
  },

  // Generate billing report
  getBillingReport: async (config: Partial<ReportConfig>): Promise<ReportDataResponse<BillingReport>> => {
    const response = await api.post('/reports/billing', config)
    return response.data
  },

  // Generate collections report
  getCollectionsReport: async (config: Partial<ReportConfig>): Promise<ReportDataResponse<CollectionsReport>> => {
    const response = await api.post('/reports/collections', config)
    return response.data
  },

  // Export report
  exportReport: async (
    reportType: ReportType,
    config: Partial<ReportConfig>,
    format: 'pdf' | 'xlsx' | 'csv'
  ): Promise<Blob> => {
    const response = await api.post(`/reports/${reportType}/export`, { ...config, format }, {
      responseType: 'blob'
    })
    return response.data
  },

  // Schedule report
  scheduleReport: async (data: {
    reportId: string
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
    format: 'pdf' | 'xlsx'
  }): Promise<SavedReport> => {
    const response = await api.post('/reports/schedule', data)
    return response.data
  },

  // Get dashboard widgets
  getDashboardWidgets: async (): Promise<DashboardWidget[]> => {
    const response = await api.get('/reports/dashboard/widgets')
    return response.data
  },

  // Update dashboard widgets
  updateDashboardWidgets: async (widgets: DashboardWidget[]): Promise<DashboardWidget[]> => {
    const response = await api.put('/reports/dashboard/widgets', { widgets })
    return response.data
  },

  // Get report summary (for dashboard)
  getReportSummary: async (): Promise<{
    revenue: { current: number; previous: number; change: number }
    cases: { open: number; closed: number; total: number }
    clients: { active: number; new: number; total: number }
    billing: { billed: number; collected: number; outstanding: number }
  }> => {
    const response = await api.get('/reports/summary')
    return response.data
  },
}

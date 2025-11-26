import { z } from 'zod'

/**
 * Report Type Schema
 */
export const reportTypeSchema = z.enum([
  'revenue',
  'cases',
  'clients',
  'staff',
  'time-tracking',
  'billing',
  'collections',
  'custom',
])
export type ReportType = z.infer<typeof reportTypeSchema>

/**
 * Report Period Schema
 */
export const reportPeriodSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'custom',
])
export type ReportPeriod = z.infer<typeof reportPeriodSchema>

/**
 * Report Format Schema
 */
export const reportFormatSchema = z.enum(['table', 'chart', 'summary', 'detailed'])
export type ReportFormat = z.infer<typeof reportFormatSchema>

/**
 * Chart Type Schema
 */
export const chartTypeSchema = z.enum(['bar', 'line', 'pie', 'area', 'donut'])
export type ChartType = z.infer<typeof chartTypeSchema>

/**
 * Schedule Frequency Schema
 */
export const scheduleFrequencySchema = z.enum(['daily', 'weekly', 'monthly'])
export type ScheduleFrequency = z.infer<typeof scheduleFrequencySchema>

/**
 * Report Filters Schema
 */
export const reportFiltersSchema = z.object({
  clientIds: z.array(z.string()).optional(),
  caseIds: z.array(z.string()).optional(),
  staffIds: z.array(z.string()).optional(),
  caseTypes: z.array(z.string()).optional(),
  caseStatuses: z.array(z.string()).optional(),
  practiceAreas: z.array(z.string()).optional(),
  dateRange: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  tags: z.array(z.string()).optional(),
})
export type ReportFilters = z.infer<typeof reportFiltersSchema>

/**
 * Report Config Schema
 */
export const reportConfigSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, 'Report name is required'),
  type: reportTypeSchema,
  description: z.string().optional(),
  period: reportPeriodSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  filters: reportFiltersSchema,
  columns: z.array(z.string()),
  groupBy: z.array(z.string()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  format: reportFormatSchema,
  chartType: chartTypeSchema.optional(),
  isScheduled: z.boolean(),
  scheduleFrequency: scheduleFrequencySchema.optional(),
  recipients: z.array(z.string()).optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type ReportConfig = z.infer<typeof reportConfigSchema>

/**
 * Saved Report Schema
 */
export const savedReportSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, 'Report name is required'),
  description: z.string().optional(),
  type: reportTypeSchema,
  config: reportConfigSchema,
  lastRun: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type SavedReport = z.infer<typeof savedReportSchema>

/**
 * Dashboard Widget Size Schema
 */
export const widgetSizeSchema = z.enum(['small', 'medium', 'large'])
export type WidgetSize = z.infer<typeof widgetSizeSchema>

/**
 * Dashboard Widget Type Schema
 */
export const widgetTypeSchema = z.enum(['metric', 'chart', 'table', 'list'])
export type WidgetType = z.infer<typeof widgetTypeSchema>

/**
 * Dashboard Widget Schema
 */
export const dashboardWidgetSchema = z.object({
  _id: z.string(),
  type: widgetTypeSchema,
  title: z.string(),
  reportType: reportTypeSchema,
  config: reportConfigSchema.partial(),
  size: widgetSizeSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  refreshInterval: z.number().optional(),
})
export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>

/**
 * Revenue Report Data Schema
 */
export const revenueByPeriodSchema = z.object({
  period: z.string(),
  billed: z.number(),
  collected: z.number(),
  outstanding: z.number(),
})

export const revenueByClientSchema = z.object({
  clientId: z.string(),
  clientName: z.string(),
  billed: z.number(),
  collected: z.number(),
  outstanding: z.number(),
})

export const revenueReportSchema = z.object({
  totalRevenue: z.number(),
  totalBilled: z.number(),
  totalCollected: z.number(),
  outstandingAmount: z.number(),
  writeOffs: z.number(),
  revenueByPeriod: z.array(revenueByPeriodSchema),
  revenueByClient: z.array(revenueByClientSchema),
  revenueByPracticeArea: z.array(
    z.object({
      practiceArea: z.string(),
      billed: z.number(),
      collected: z.number(),
      percentage: z.number(),
    })
  ),
  revenueByStaff: z.array(
    z.object({
      staffId: z.string(),
      staffName: z.string(),
      billed: z.number(),
      collected: z.number(),
      hours: z.number(),
    })
  ),
})
export type RevenueReport = z.infer<typeof revenueReportSchema>

/**
 * Case Report Data Schema
 */
export const caseReportSchema = z.object({
  totalCases: z.number(),
  openCases: z.number(),
  closedCases: z.number(),
  pendingCases: z.number(),
  averageDuration: z.number(),
  casesByStatus: z.array(
    z.object({
      status: z.string(),
      count: z.number(),
      percentage: z.number(),
    })
  ),
  casesByType: z.array(
    z.object({
      type: z.string(),
      count: z.number(),
      percentage: z.number(),
    })
  ),
  casesByPracticeArea: z.array(
    z.object({
      practiceArea: z.string(),
      count: z.number(),
      revenue: z.number(),
    })
  ),
  caseTimeline: z.array(
    z.object({
      period: z.string(),
      opened: z.number(),
      closed: z.number(),
      pending: z.number(),
    })
  ),
  topCasesByRevenue: z.array(
    z.object({
      caseId: z.string(),
      caseNumber: z.string(),
      clientName: z.string(),
      revenue: z.number(),
      status: z.string(),
    })
  ),
})
export type CaseReport = z.infer<typeof caseReportSchema>

/**
 * Report Summary Schema
 */
export const reportSummarySchema = z.object({
  revenue: z.object({
    current: z.number(),
    previous: z.number(),
    change: z.number(),
  }),
  cases: z.object({
    open: z.number(),
    closed: z.number(),
    total: z.number(),
  }),
  clients: z.object({
    active: z.number(),
    new: z.number(),
    total: z.number(),
  }),
  billing: z.object({
    billed: z.number(),
    collected: z.number(),
    outstanding: z.number(),
  }),
})
export type ReportSummary = z.infer<typeof reportSummarySchema>

/**
 * Create Report Config Schema (for form validation)
 */
export const createReportConfigSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  type: reportTypeSchema,
  description: z.string().optional(),
  period: reportPeriodSchema,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  filters: reportFiltersSchema.optional(),
  columns: z.array(z.string()).optional(),
  groupBy: z.array(z.string()).optional(),
  format: reportFormatSchema.optional(),
  chartType: chartTypeSchema.optional(),
  isScheduled: z.boolean().optional(),
  scheduleFrequency: scheduleFrequencySchema.optional(),
  recipients: z.array(z.string()).optional(),
})
export type CreateReportConfigData = z.infer<typeof createReportConfigSchema>

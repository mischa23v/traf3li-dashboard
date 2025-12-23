/**
 * Prepared Reports Service
 * Handles report caching and pre-computed heavy reports
 * Base route: /api/prepared-reports
 *
 * Use Case: Pre-compute heavy reports for faster access
 *
 * Backend Routes (IMPLEMENTED):
 * ✅ GET    /prepared-reports              - List cached reports
 * ✅ GET    /prepared-reports/:id          - Get cached report
 * ✅ POST   /prepared-reports              - Request new report
 * ✅ POST   /prepared-reports/:id/refresh  - Force refresh
 * ✅ DELETE /prepared-reports/:id          - Delete cached
 * ✅ GET    /prepared-reports/stats        - Cache statistics
 */

import { apiClient, handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export type PreparedReportStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'expired'

export type ReportType =
  | 'trial_balance'
  | 'balance_sheet'
  | 'profit_loss'
  | 'general_ledger'
  | 'accounts_receivable'
  | 'accounts_payable'
  | 'cash_flow'
  | 'aging_report'
  | 'budget_variance'
  | 'consolidated_statement'
  | 'custom'

export interface ReportParameters {
  startDate?: string
  endDate?: string
  accountIds?: string[]
  firmIds?: string[]
  departmentIds?: string[]
  currency?: string
  includeZeroBalances?: boolean
  groupBy?: string
  customFilters?: Record<string, any>
}

export interface PreparedReport {
  _id: string
  reportId: string
  reportType: ReportType
  name: string
  nameAr?: string
  parameters: ReportParameters
  status: PreparedReportStatus
  data?: any // The actual report data when status is 'ready'
  error?: string
  errorAr?: string
  ttlMinutes: number
  expiresAt: string
  generatedAt?: string
  generationDuration?: number // in milliseconds
  dataSize?: number // in bytes
  requestedBy: string
  createdAt: string
  updatedAt: string
}

export interface PreparedReportFilters {
  reportType?: ReportType
  status?: PreparedReportStatus
  requestedBy?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CreatePreparedReportData {
  reportType: ReportType
  name?: string
  nameAr?: string
  parameters: ReportParameters
  ttlMinutes?: number // Time to live, defaults to 60 minutes
  priority?: 'low' | 'normal' | 'high'
}

export interface CacheStats {
  totalReports: number
  readyReports: number
  pendingReports: number
  failedReports: number
  expiredReports: number
  totalDataSize: number
  averageGenerationTime: number
  hitRate: number
  byReportType: {
    type: ReportType
    count: number
    averageTime: number
  }[]
}

// ==================== SERVICE ====================

const preparedReportsService = {
  /**
   * Get all prepared reports
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/prepared-reports
   */
  getReports: async (filters?: PreparedReportFilters): Promise<{
    reports: PreparedReport[]
    total: number
    page: number
    limit: number
  }> => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value))
          }
        })
      }
      const response = await apiClient.get(`/prepared-reports?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch reports | فشل جلب التقارير: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get a prepared report (with data if ready)
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/prepared-reports/:id
   */
  getReport: async (id: string): Promise<PreparedReport> => {
    try {
      const response = await apiClient.get(`/prepared-reports/${id}`)
      return response.data.report || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch report | فشل جلب التقرير: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Request a new prepared report
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/prepared-reports
   *
   * Returns immediately, generates in background. Poll for status.
   */
  requestReport: async (data: CreatePreparedReportData): Promise<PreparedReport> => {
    try {
      const response = await apiClient.post('/prepared-reports', data)
      return response.data.report || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to request report | فشل طلب التقرير: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Force refresh a cached report
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/prepared-reports/:id/refresh
   */
  refreshReport: async (id: string): Promise<PreparedReport> => {
    try {
      const response = await apiClient.post(`/prepared-reports/${id}/refresh`)
      return response.data.report || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to refresh report | فشل تحديث التقرير: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Delete a cached report
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * DELETE /api/prepared-reports/:id
   */
  deleteReport: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/prepared-reports/${id}`)
    } catch (error: any) {
      throw new Error(
        `Failed to delete report | فشل حذف التقرير: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get cache statistics
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/prepared-reports/stats
   */
  getStats: async (): Promise<CacheStats> => {
    try {
      const response = await apiClient.get('/prepared-reports/stats')
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch stats | فشل جلب الإحصائيات: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Poll for report completion
   * Helper function that polls until report is ready or failed
   */
  waitForReport: async (
    id: string,
    options?: {
      pollInterval?: number // default 2000ms
      maxAttempts?: number // default 60 (2 minutes with default interval)
      onProgress?: (report: PreparedReport) => void
    }
  ): Promise<PreparedReport> => {
    const pollInterval = options?.pollInterval || 2000
    const maxAttempts = options?.maxAttempts || 60

    let attempts = 0

    const poll = async (): Promise<PreparedReport> => {
      attempts++
      const report = await preparedReportsService.getReport(id)

      if (options?.onProgress) {
        options.onProgress(report)
      }

      if (report.status === 'ready') {
        return report
      }

      if (report.status === 'failed') {
        throw new Error(
          report.error || 'Report generation failed | فشل إنشاء التقرير'
        )
      }

      if (attempts >= maxAttempts) {
        throw new Error(
          'Report generation timed out | انتهت مهلة إنشاء التقرير'
        )
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval))
      return poll()
    }

    return poll()
  },
}

export default preparedReportsService

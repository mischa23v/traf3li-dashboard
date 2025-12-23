/**
 * Time Tracking Service
 * Handles time entry approval workflow API calls
 * Base route: /api/time-tracking
 *
 * Backend Routes (IMPLEMENTED):
 * ✅ GET    /entries/pending-approval     - Get entries awaiting approval with summary
 * ✅ POST   /entries/:id/submit           - Submit single entry for approval
 * ✅ POST   /entries/bulk-submit          - Bulk submit entries for approval
 * ✅ POST   /entries/:id/request-changes  - Request changes on entry
 * ✅ POST   /entries/bulk-reject          - Bulk reject entries with reason
 */

import { apiClient } from '@/lib/api'
import { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export type TimeEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'changes_requested'

export interface TimeEntry {
  _id: string
  entryId: string
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  projectId?: string
  projectName?: string
  projectNameAr?: string
  caseId?: string
  caseNumber?: string
  caseName?: string
  taskId?: string
  taskName?: string
  taskNameAr?: string
  date: string
  startTime: string
  endTime: string
  hoursWorked: number
  billableHours: number
  isBillable: boolean
  hourlyRate?: number
  billableAmount?: number
  description: string
  descriptionAr?: string
  status: TimeEntryStatus
  submittedAt?: string
  submittedBy?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectionReason?: string
  changesRequestedAt?: string
  changesRequestedBy?: string
  changesRequestedReason?: string
  createdAt: string
  updatedAt: string
}

export interface PendingApprovalSummary {
  totalEntries: number
  totalHours: number
  totalBillable: number
  totalBillableAmount: number
  byEmployee: {
    employeeId: string
    employeeName: string
    entries: number
    hours: number
  }[]
  byProject: {
    projectId: string
    projectName: string
    entries: number
    hours: number
  }[]
}

export interface PendingApprovalResponse {
  entries: TimeEntry[]
  summary: PendingApprovalSummary
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface TimeEntryFilters {
  employeeId?: string
  projectId?: string
  caseId?: string
  status?: TimeEntryStatus | TimeEntryStatus[]
  startDate?: string
  endDate?: string
  isBillable?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface BulkSubmitResult {
  success: boolean
  submitted: number
  failed: number
  errors?: { id: string; error: string }[]
}

export interface BulkRejectResult {
  success: boolean
  rejected: number
  failed: number
  errors?: { id: string; error: string }[]
}

// ==================== SERVICE ====================

const timeTrackingService = {
  /**
   * Get time entries pending approval
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/time-tracking/entries/pending-approval
   *
   * Returns entries awaiting approval with summary statistics
   */
  getPendingApproval: async (filters?: TimeEntryFilters): Promise<PendingApprovalResponse> => {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v))
            } else {
              params.append(key, String(value))
            }
          }
        })
      }
      const response = await apiClient.get(`/time-tracking/entries/pending-approval?${params.toString()}`)
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch pending approvals | فشل جلب الموافقات المعلقة: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Submit a time entry for approval
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/time-tracking/entries/:id/submit
   */
  submitForApproval: async (entryId: string): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post(`/time-tracking/entries/${entryId}/submit`)
      return response.data.entry || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to submit entry for approval | فشل تقديم الإدخال للموافقة: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Bulk submit time entries for approval
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/time-tracking/entries/bulk-submit
   */
  bulkSubmitForApproval: async (ids: string[]): Promise<BulkSubmitResult> => {
    try {
      const response = await apiClient.post('/time-tracking/entries/bulk-submit', { ids })
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to bulk submit entries | فشل التقديم المجمع للإدخالات: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Request changes on a time entry
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/time-tracking/entries/:id/request-changes
   */
  requestChanges: async (entryId: string, reason: string): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post(`/time-tracking/entries/${entryId}/request-changes`, { reason })
      return response.data.entry || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to request changes | فشل طلب التغييرات: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Bulk reject time entries
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/time-tracking/entries/bulk-reject
   */
  bulkReject: async (ids: string[], reason: string): Promise<BulkRejectResult> => {
    try {
      const response = await apiClient.post('/time-tracking/entries/bulk-reject', { ids, reason })
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to bulk reject entries | فشل الرفض المجمع للإدخالات: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Approve a time entry
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/time-tracking/entries/:id/approve
   */
  approveEntry: async (entryId: string): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post(`/time-tracking/entries/${entryId}/approve`)
      return response.data.entry || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to approve entry | فشل الموافقة على الإدخال: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Bulk approve time entries
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/time-tracking/entries/bulk-approve
   */
  bulkApprove: async (ids: string[]): Promise<{ success: boolean; approved: number }> => {
    try {
      const response = await apiClient.post('/time-tracking/entries/bulk-approve', { ids })
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to bulk approve entries | فشل الموافقة المجمعة على الإدخالات: ${handleApiError(error)}`
      )
    }
  },
}

export default timeTrackingService

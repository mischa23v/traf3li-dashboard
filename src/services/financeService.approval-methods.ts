/**
 * Time Entry Approval Methods
 * Add these methods to the financeService object in financeService.ts
 * After the rejectTimeEntry method and before the PAYMENTS section
 */

import apiClient, { handleApiError } from '@/lib/api'
import { TimeEntry } from './financeService'

export const timeEntryApprovalMethods = {
  /**
   * Submit time entry for approval
   * POST /api/time-tracking/entries/:id/submit
   */
  submitTimeEntryForApproval: async (id: string): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post(`/time-tracking/entries/${id}/submit`)
      return response.data.timeEntry || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk submit time entries for approval
   * POST /api/time-tracking/entries/bulk-submit
   */
  bulkSubmitTimeEntries: async (entryIds: string[]): Promise<{
    submitted: number
    failed: number
  }> => {
    try {
      const response = await apiClient.post('/time-tracking/entries/bulk-submit', {
        entryIds
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk reject time entries
   * POST /api/time-tracking/entries/bulk-reject
   */
  bulkRejectTimeEntries: async (entryIds: string[], reason: string): Promise<{
    rejected: number
    failed: number
  }> => {
    try {
      const response = await apiClient.post('/time-tracking/entries/bulk-reject', {
        entryIds,
        reason
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get pending time entries (for approval queue)
   * GET /api/time-tracking/entries/pending
   */
  getPendingTimeEntries: async (filters?: {
    userId?: string
    startDate?: string
    endDate?: string
    caseId?: string
  }): Promise<{ data: TimeEntry[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/time-tracking/entries/pending', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Request changes on time entry
   * POST /api/time-tracking/entries/:id/request-changes
   */
  requestTimeEntryChanges: async (id: string, comments: string): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post(`/time-tracking/entries/${id}/request-changes`, {
        comments
      })
      return response.data.timeEntry || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

/**
 * INSTRUCTIONS FOR MERGING:
 *
 * 1. Open src/services/financeService.ts
 * 2. Find the rejectTimeEntry method (around line 1299)
 * 3. After the closing brace of rejectTimeEntry and before the PAYMENTS section comment,
 *    add all the methods from timeEntryApprovalMethods above
 * 4. Make sure to maintain proper indentation (2 spaces)
 */

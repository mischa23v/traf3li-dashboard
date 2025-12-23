/**
 * Invoice Workflow Service
 * Handles Temporal-powered invoice approval workflows
 *
 * Backend Routes (Temporal Integration):
 * ✅ POST   /temporal-invoices/:id/submit-approval    - Submit invoice for approval
 * ✅ POST   /temporal-invoices/:id/approve            - Approve invoice (as approver)
 * ✅ POST   /temporal-invoices/:id/reject             - Reject invoice (as approver)
 * ✅ GET    /temporal-invoices/:id/approval-status    - Get approval workflow status
 * ✅ POST   /temporal-invoices/:id/cancel-approval    - Cancel approval workflow
 * ✅ GET    /temporal-invoices/pending-approvals      - Get pending approvals for current user
 */

import { apiClient, handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface ApprovalDecision {
  level: number
  approved: boolean
  comment?: string
  approvedBy?: string
  approvedByName?: string
  timestamp: string
}

export interface InvoiceApprovalStatus {
  invoiceId: string
  workflowId?: string
  currentLevel: number
  maxLevel: number
  status: ApprovalStatus
  decisions: ApprovalDecision[]
  escalated: boolean
  escalatedAt?: string
  escalationReason?: string
  createdAt: string
  updatedAt: string
}

export interface PendingApproval {
  invoiceId: string
  invoiceNumber: string
  clientName: string
  amount: number
  currency: string
  submittedAt: string
  submittedBy: string
  currentLevel: number
  dueDate?: string
}

export interface SubmitApprovalData {
  notes?: string
}

export interface ApproveData {
  comment?: string
}

export interface RejectData {
  reason: string
}

export interface CancelApprovalData {
  reason: string
}

// ==================== SERVICE ====================

const invoiceWorkflowService = {
  /**
   * Submit invoice for approval
   * Starts a Temporal workflow for multi-level approval
   * Approval levels are determined by invoice amount:
   * - < 10,000 SAR: 1 level
   * - 10,000-99,999 SAR: 2 levels
   * - >= 100,000 SAR: 3 levels
   */
  submitForApproval: async (
    invoiceId: string,
    data?: SubmitApprovalData
  ): Promise<InvoiceApprovalStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: InvoiceApprovalStatus
        message?: string
      }>(`/temporal-invoices/${invoiceId}/submit-approval`, data || {})

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Approve invoice at current level
   * Only works if user is the designated approver for current level
   */
  approve: async (
    invoiceId: string,
    data?: ApproveData
  ): Promise<InvoiceApprovalStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: InvoiceApprovalStatus
        message?: string
      }>(`/temporal-invoices/${invoiceId}/approve`, data || {})

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reject invoice
   * Rejection at any level cancels the entire workflow
   */
  reject: async (
    invoiceId: string,
    data: RejectData
  ): Promise<InvoiceApprovalStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: InvoiceApprovalStatus
        message?: string
      }>(`/temporal-invoices/${invoiceId}/reject`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get current approval status for an invoice
   */
  getApprovalStatus: async (invoiceId: string): Promise<InvoiceApprovalStatus> => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: InvoiceApprovalStatus
      }>(`/temporal-invoices/${invoiceId}/approval-status`)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel an ongoing approval workflow
   * Only the submitter or admin can cancel
   */
  cancelApproval: async (
    invoiceId: string,
    data: CancelApprovalData
  ): Promise<InvoiceApprovalStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: InvoiceApprovalStatus
        message?: string
      }>(`/temporal-invoices/${invoiceId}/cancel-approval`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all invoices pending approval by the current user
   */
  getPendingApprovals: async (): Promise<PendingApproval[]> => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: PendingApproval[]
      }>('/temporal-invoices/pending-approvals')

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if an invoice has an active approval workflow
   */
  hasActiveWorkflow: async (invoiceId: string): Promise<boolean> => {
    try {
      const status = await invoiceWorkflowService.getApprovalStatus(invoiceId)
      return status.status === 'pending'
    } catch {
      return false
    }
  },

  /**
   * Calculate required approval levels based on amount
   * Matches backend logic for consistency
   */
  calculateApprovalLevels: (amount: number): number => {
    if (amount >= 100000) return 3
    if (amount >= 10000) return 2
    return 1
  },
}

export default invoiceWorkflowService

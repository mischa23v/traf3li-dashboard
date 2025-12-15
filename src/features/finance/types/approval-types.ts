/**
 * Invoice Approval Workflow Types
 */

export type InvoiceStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'sent'
  | 'paid'
  | 'partial'
  | 'overdue'
  | 'cancelled'

export type ApprovalAction = 'approve' | 'reject' | 'request_changes' | 'escalate'

export interface ApprovalStep {
  level: number
  approverId: string | { _id: string; firstName: string; lastName: string }
  approverName: string
  action: ApprovalAction | 'pending'
  comments?: string
  timestamp?: string
  rejectionReason?: string
}

export interface ApprovalHistory extends ApprovalStep {
  performedBy: string
  performedAt: string
}

export interface ApprovalWorkflowConfig {
  enabled: boolean
  thresholdAmount: number // Invoices above this amount need approval
  approvalLevels: number // 1, 2, or 3 level approval
  approvers: {
    level1: string[] // User IDs
    level2: string[] // User IDs
    level3: string[] // User IDs
  }
  autoApproveBelow?: boolean // Auto-approve invoices below threshold
  requireAllApprovers?: boolean // All approvers at a level must approve
  escalationTimeout?: number // Hours before auto-escalation
  notifyCreatorOnApproval?: boolean
  notifyCreatorOnRejection?: boolean
}

export interface InvoiceApprovalData {
  invoiceId: string
  approvalLevel: number
  currentApprover: string
  approvalHistory: ApprovalHistory[]
  submittedForApprovalAt?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectionReason?: string
  requiresApproval: boolean
  status: InvoiceStatus
}

export interface ApprovalQueueFilters {
  status?: 'pending' | 'approved' | 'rejected'
  clientId?: string
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
  approverId?: string
  level?: number
}

export interface SubmitForApprovalData {
  invoiceId: string
  comments?: string
}

export interface ApproveInvoiceData {
  invoiceId: string
  comments?: string
  approverLevel: number
}

export interface RejectInvoiceData {
  invoiceId: string
  reason: string
  comments?: string
}

export interface RequestChangesData {
  invoiceId: string
  requestedChanges: string
  comments?: string
}

export interface EscalateApprovalData {
  invoiceId: string
  reason: string
  comments?: string
}

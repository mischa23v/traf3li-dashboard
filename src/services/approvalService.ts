/**
 * Approval Service
 * Handles all approval workflow API calls matching the backend API
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export interface ApprovalRule {
  _id?: string
  ruleId?: string
  action: string
  resourceType: string
  condition?: {
    field?: string
    operator?: string
    value?: any
  }
  approvers: string[]
  requiredApprovals: number
  autoApprove?: boolean
  notifyApprovers?: boolean
  escalationTime?: number
  enabled?: boolean
}

export interface ApprovalRequest {
  _id?: string
  id?: string
  action: string
  resourceType: string
  resourceId: string
  requestedBy: {
    _id: string
    name: string
    email: string
  }
  requestData?: any
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approvers: string[]
  requiredApprovals: number
  approvals: Array<{
    userId: string
    userName: string
    decision: 'approved' | 'rejected'
    comment?: string
    timestamp: string
  }>
  rejections: Array<{
    userId: string
    userName: string
    comment?: string
    timestamp: string
  }>
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface ApprovalTemplate {
  name: string
  description: string
  action: string
  resourceType: string
  defaultApprovers: string[]
  requiredApprovals: number
}

export interface ApprovalStats {
  pending: number
  approved: number
  rejected: number
  cancelled: number
  myRequests: {
    pending: number
    approved: number
    rejected: number
  }
  myApprovals: {
    pending: number
    actioned: number
  }
}

export interface CheckApprovalRequiredPayload {
  action: string
  resourceType: string
  resourceId?: string
  data?: any
}

export interface CheckApprovalRequiredResponse {
  required: boolean
  rules?: ApprovalRule[]
  message?: string
}

// ==================== API FUNCTIONS ====================

/**
 * Get all approval rules for the firm
 * GET /api/approvals/rules
 */
export const getApprovalRules = async (): Promise<ApprovalRule[]> => {
  try {
    const response = await apiClient.get('/approvals/rules')
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Update all approval rules
 * PUT /api/approvals/rules
 */
export const updateApprovalRules = async (rules: ApprovalRule[]): Promise<ApprovalRule[]> => {
  try {
    const response = await apiClient.put('/approvals/rules', { rules })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Add a new approval rule
 * POST /api/approvals/rules
 */
export const addApprovalRule = async (rule: ApprovalRule): Promise<ApprovalRule> => {
  try {
    const response = await apiClient.post('/approvals/rules', rule)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Delete an approval rule
 * DELETE /api/approvals/rules/:ruleId
 */
export const deleteApprovalRule = async (ruleId: string): Promise<void> => {
  try {
    await apiClient.delete(`/approvals/rules/${ruleId}`)
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get default rule templates
 * GET /api/approvals/templates
 */
export const getRuleTemplates = async (): Promise<ApprovalTemplate[]> => {
  try {
    const response = await apiClient.get('/approvals/templates')
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get pending approvals for current user
 * GET /api/approvals/pending
 */
export const getPendingApprovals = async (): Promise<ApprovalRequest[]> => {
  try {
    const response = await apiClient.get('/approvals/pending')
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get my submitted requests
 * GET /api/approvals/my-requests
 */
export const getMyRequests = async (): Promise<ApprovalRequest[]> => {
  try {
    const response = await apiClient.get('/approvals/my-requests')
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get approval statistics
 * GET /api/approvals/stats
 */
export const getApprovalStats = async (): Promise<ApprovalStats> => {
  try {
    const response = await apiClient.get('/approvals/stats')
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Check if action requires approval
 * POST /api/approvals/check
 */
export const checkApprovalRequired = async (
  payload: CheckApprovalRequiredPayload
): Promise<CheckApprovalRequiredResponse> => {
  try {
    const response = await apiClient.post('/approvals/check', payload)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get approval request details
 * GET /api/approvals/:id
 */
export const getApprovalRequest = async (id: string): Promise<ApprovalRequest> => {
  try {
    const response = await apiClient.get(`/approvals/${id}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Approve a request
 * POST /api/approvals/:id/approve
 */
export const approveRequest = async (id: string, comment?: string): Promise<ApprovalRequest> => {
  try {
    const response = await apiClient.post(`/approvals/${id}/approve`, { comment })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Reject a request
 * POST /api/approvals/:id/reject
 */
export const rejectRequest = async (id: string, comment?: string): Promise<ApprovalRequest> => {
  try {
    const response = await apiClient.post(`/approvals/${id}/reject`, { comment })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Cancel a request (by requester)
 * POST /api/approvals/:id/cancel
 */
export const cancelRequest = async (id: string): Promise<ApprovalRequest> => {
  try {
    const response = await apiClient.post(`/approvals/${id}/cancel`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// ==================== DEFAULT EXPORT ====================

export default {
  getApprovalRules,
  updateApprovalRules,
  addApprovalRule,
  deleteApprovalRule,
  getRuleTemplates,
  getPendingApprovals,
  getMyRequests,
  getApprovalStats,
  checkApprovalRequired,
  getApprovalRequest,
  approveRequest,
  rejectRequest,
  cancelRequest,
}

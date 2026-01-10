/**
 * Overtime Service
 * API endpoints for overtime management per HR API Documentation Part 2 - Section 6
 * Compliant with Saudi Labor Law Article 107
 */

import api from './api'
import type {
  OvertimeRecord,
  OvertimeRequestData,
  OvertimeSummary,
  OvertimeFilters,
  OvertimeStatus,
  OvertimeType,
  OvertimeCompensationType,
} from '@/types/hr'

// ==================== RESPONSE TYPES ====================

export interface OvertimeListResponse {
  data: {
    records: OvertimeRecord[]
    summary: OvertimeSummary
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface OvertimeStats {
  totalRecords: number
  totalHours: number
  totalAmount: number
  pendingApproval: number
  approved: number
  rejected: number
  paid: number
  byType: Record<OvertimeType, { hours: number; amount: number }>
  byMonth: Array<{
    month: number
    year: number
    hours: number
    amount: number
  }>
  averageHoursPerEmployee: number
}

// ==================== LABELS ====================

export const OVERTIME_TYPE_LABELS: Record<OvertimeType, { ar: string; en: string; rate: number }> = {
  regular: { ar: 'عمل إضافي عادي', en: 'Regular Overtime', rate: 1.5 },
  weekend: { ar: 'عمل إضافي نهاية الأسبوع', en: 'Weekend Overtime', rate: 2.0 },
  holiday: { ar: 'عمل إضافي عطلة', en: 'Holiday Overtime', rate: 2.0 },
}

export const OVERTIME_STATUS_LABELS: Record<OvertimeStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد المراجعة', en: 'Pending', color: 'amber' },
  approved: { ar: 'موافق عليه', en: 'Approved', color: 'emerald' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  paid: { ar: 'مدفوع', en: 'Paid', color: 'blue' },
}

export const COMPENSATION_TYPE_LABELS: Record<OvertimeCompensationType, { ar: string; en: string }> = {
  payment: { ar: 'دفع نقدي', en: 'Payment' },
  time_off: { ar: 'إجازة تعويضية', en: 'Time Off' },
  both: { ar: 'مختلط', en: 'Both' },
}

// ==================== API FUNCTIONS ====================

/**
 * Get overtime records
 * GET /overtime
 */
export const getOvertimeRecords = async (filters?: OvertimeFilters): Promise<OvertimeListResponse> => {
  const params = new URLSearchParams()
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.month) params.append('month', filters.month.toString())
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/overtime?${params.toString()}`)
  return response.data
}

/**
 * Get single overtime record
 * GET /overtime/:id
 */
export const getOvertimeRecord = async (id: string): Promise<OvertimeRecord> => {
  const response = await api.get(`/hr/overtime/${id}`)
  return response.data
}

/**
 * Request overtime approval (pre-approval)
 * POST /overtime/request
 */
export const requestOvertime = async (data: OvertimeRequestData): Promise<OvertimeRecord> => {
  const response = await api.post('/hr/overtime/request', data)
  return response.data
}

/**
 * Approve overtime request
 * POST /overtime/:id/approve
 */
export const approveOvertime = async (id: string, approvalNotes?: string): Promise<OvertimeRecord> => {
  const response = await api.post(`/hr/overtime/${id}/approve`, { approvalNotes })
  return response.data
}

/**
 * Reject overtime request
 * POST /overtime/:id/reject
 */
export const rejectOvertime = async (id: string, rejectionReason: string): Promise<OvertimeRecord> => {
  const response = await api.post(`/hr/overtime/${id}/reject`, { rejectionReason })
  return response.data
}

/**
 * Get overtime statistics
 * GET /overtime/stats
 */
export const getOvertimeStats = async (filters?: {
  month?: number
  year?: number
  department?: string
}): Promise<OvertimeStats> => {
  const params = new URLSearchParams()
  if (filters?.month) params.append('month', filters.month.toString())
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.department) params.append('department', filters.department)

  const response = await api.get(`/hr/overtime/stats?${params.toString()}`)
  return response.data
}

/**
 * Get pending overtime approvals
 * GET /overtime?status=pending
 */
export const getPendingOvertimeApprovals = async (): Promise<OvertimeRecord[]> => {
  const response = await api.get('/hr/overtime?status=pending')
  return response.data.data?.records || response.data.records || []
}

/**
 * Get employee overtime summary
 * GET /overtime/employee/:employeeId/summary
 */
export const getEmployeeOvertimeSummary = async (
  employeeId: string,
  filters?: { month?: number; year?: number }
): Promise<{
  employee: {
    _id: string
    employeeId: string
    name: string
  }
  summary: OvertimeSummary
  records: OvertimeRecord[]
  compliance: {
    monthlyLimit: number
    usedHours: number
    remainingHours: number
    isCompliant: boolean
  }
}> => {
  const params = new URLSearchParams()
  if (filters?.month) params.append('month', filters.month.toString())
  if (filters?.year) params.append('year', filters.year.toString())

  const response = await api.get(`/hr/overtime/employee/${employeeId}/summary?${params.toString()}`)
  return response.data
}

/**
 * Mark overtime as paid
 * POST /overtime/:id/mark-paid
 */
export const markOvertimeAsPaid = async (
  id: string,
  payrollRunId?: string
): Promise<OvertimeRecord> => {
  const response = await api.post(`/hr/overtime/${id}/mark-paid`, { payrollRunId })
  return response.data
}

/**
 * Bulk approve overtime records
 * POST /overtime/bulk-approve
 */
export const bulkApproveOvertime = async (
  ids: string[],
  approvalNotes?: string
): Promise<{
  success: number
  failed: number
  results: Array<{
    id: string
    status: 'approved' | 'failed'
    error?: string
  }>
}> => {
  const response = await api.post('/hr/overtime/bulk-approve', { ids, approvalNotes })
  return response.data
}

/**
 * Bulk reject overtime records
 * POST /overtime/bulk-reject
 */
export const bulkRejectOvertime = async (
  ids: string[],
  rejectionReason: string
): Promise<{
  success: number
  failed: number
  results: Array<{
    id: string
    status: 'rejected' | 'failed'
    error?: string
  }>
}> => {
  const response = await api.post('/hr/overtime/bulk-reject', { ids, rejectionReason })
  return response.data
}

/**
 * Get overtime report
 * GET /overtime/report
 */
export const getOvertimeReport = async (filters: {
  month: number
  year: number
  department?: string
}): Promise<{
  period: {
    month: number
    year: number
  }
  summary: OvertimeSummary
  byEmployee: Array<{
    employeeId: string
    employeeName: string
    department: string
    totalHours: number
    totalAmount: number
    records: number
  }>
  byDepartment: Array<{
    department: string
    totalHours: number
    totalAmount: number
    employeeCount: number
  }>
  compliance: {
    totalViolations: number
    employeesExceedingLimit: number
  }
}> => {
  const params = new URLSearchParams()
  params.append('month', filters.month.toString())
  params.append('year', filters.year.toString())
  if (filters.department) params.append('department', filters.department)

  const response = await api.get(`/hr/overtime/report?${params.toString()}`)
  return response.data
}

/**
 * Cancel overtime request
 * POST /overtime/:id/cancel
 */
export const cancelOvertimeRequest = async (id: string, reason?: string): Promise<OvertimeRecord> => {
  const response = await api.post(`/hr/overtime/${id}/cancel`, { reason })
  return response.data
}

/**
 * Export overtime records
 * GET /overtime/export
 */
export const exportOvertimeRecords = async (filters?: OvertimeFilters): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.month) params.append('month', filters.month.toString())
  if (filters?.year) params.append('year', filters.year.toString())

  const response = await api.get(`/hr/overtime/export?${params.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}

// Default export
export default {
  getOvertimeRecords,
  getOvertimeRecord,
  requestOvertime,
  approveOvertime,
  rejectOvertime,
  getOvertimeStats,
  getPendingOvertimeApprovals,
  getEmployeeOvertimeSummary,
  markOvertimeAsPaid,
  bulkApproveOvertime,
  bulkRejectOvertime,
  getOvertimeReport,
  cancelOvertimeRequest,
  exportOvertimeRecords,
}

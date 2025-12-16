import { apiClient } from '@/lib/api'

// ==================== ENUMS & TYPES ====================

export type IncentiveType =
  | 'spot_bonus'
  | 'performance_bonus'
  | 'sales_commission'
  | 'referral_bonus'
  | 'innovation_award'
  | 'attendance_bonus'
  | 'overtime_bonus'
  | 'other'

export type IncentiveStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'processed'
  | 'cancelled'

export type ReferenceType =
  | 'sales_target'
  | 'performance_review'
  | 'referral'
  | 'project'
  | 'other'

// ==================== LABELS ====================

export const incentiveTypeLabels: Record<IncentiveType, { ar: string; en: string }> = {
  spot_bonus: { ar: 'مكافأة فورية', en: 'Spot Bonus' },
  performance_bonus: { ar: 'مكافأة أداء', en: 'Performance Bonus' },
  sales_commission: { ar: 'عمولة مبيعات', en: 'Sales Commission' },
  referral_bonus: { ar: 'مكافأة إحالة', en: 'Referral Bonus' },
  innovation_award: { ar: 'جائزة الابتكار', en: 'Innovation Award' },
  attendance_bonus: { ar: 'مكافأة الحضور', en: 'Attendance Bonus' },
  overtime_bonus: { ar: 'مكافأة عمل إضافي', en: 'Overtime Bonus' },
  other: { ar: 'أخرى', en: 'Other' },
}

export const incentiveStatusLabels: Record<IncentiveStatus, { ar: string; en: string }> = {
  draft: { ar: 'مسودة', en: 'Draft' },
  pending_approval: { ar: 'بانتظار الموافقة', en: 'Pending Approval' },
  approved: { ar: 'معتمد', en: 'Approved' },
  processed: { ar: 'تمت المعالجة', en: 'Processed' },
  cancelled: { ar: 'ملغى', en: 'Cancelled' },
}

export const referenceTypeLabels: Record<ReferenceType, { ar: string; en: string }> = {
  sales_target: { ar: 'هدف مبيعات', en: 'Sales Target' },
  performance_review: { ar: 'تقييم الأداء', en: 'Performance Review' },
  referral: { ar: 'إحالة', en: 'Referral' },
  project: { ar: 'مشروع', en: 'Project' },
  other: { ar: 'أخرى', en: 'Other' },
}

// ==================== INTERFACES ====================

export interface EmployeeIncentive {
  _id: string
  incentiveId: string

  // Employee information
  employeeId: string
  employeeName: string
  employeeNameAr: string
  employeeNumber?: string
  departmentId: string
  departmentName?: string
  departmentNameAr?: string

  // Incentive details
  incentiveType: IncentiveType

  incentiveAmount: number
  currency: string

  // Link to salary component
  salaryComponentId?: string
  salaryComponentName?: string
  salaryComponentNameAr?: string

  // Payment
  payrollDate: string // the payroll period this will be added to
  payrollEntryId?: string

  // Reason
  incentiveReason: string
  incentiveReasonAr: string

  // Reference (e.g., sales target, referral ID)
  referenceType?: ReferenceType
  referenceId?: string
  referenceName?: string
  referenceNameAr?: string

  // Status
  status: IncentiveStatus

  // Approval
  approvedBy?: string
  approvedByName?: string
  approvedByNameAr?: string
  approvalDate?: string
  approverComments?: string

  // Rejection (if cancelled)
  rejectionReason?: string
  rejectionReasonAr?: string
  rejectedBy?: string
  rejectedByName?: string
  rejectionDate?: string

  // Audit
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName?: string
  updatedBy?: string

  // Office
  officeId: string
}

export interface CreateEmployeeIncentiveData {
  // Employee information
  employeeId: string
  employeeName: string
  employeeNameAr: string
  employeeNumber?: string
  departmentId: string
  departmentName?: string
  departmentNameAr?: string

  // Incentive details
  incentiveType: IncentiveType

  incentiveAmount: number
  currency?: string

  // Link to salary component
  salaryComponentId?: string
  salaryComponentName?: string
  salaryComponentNameAr?: string

  // Payment
  payrollDate: string

  // Reason
  incentiveReason: string
  incentiveReasonAr: string

  // Reference
  referenceType?: ReferenceType
  referenceId?: string
  referenceName?: string
  referenceNameAr?: string

  // Office
  officeId: string
}

export type UpdateEmployeeIncentiveData = Partial<CreateEmployeeIncentiveData>

export interface EmployeeIncentiveFilters {
  employeeId?: string
  departmentId?: string
  incentiveType?: IncentiveType | IncentiveType[]
  status?: IncentiveStatus | IncentiveStatus[]
  payrollDate?: string
  payrollDateFrom?: string
  payrollDateTo?: string
  referenceType?: ReferenceType
  referenceId?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface EmployeeIncentivesResponse {
  incentives: EmployeeIncentive[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface IncentiveStatistics {
  totalIncentives: number
  totalAmount: number
  averageAmount: number
  byType: {
    type: IncentiveType
    typeLabel: string
    typeLabelAr: string
    count: number
    totalAmount: number
    averageAmount: number
  }[]
  byStatus: {
    status: IncentiveStatus
    statusLabel: string
    statusLabelAr: string
    count: number
    totalAmount: number
  }[]
  byDepartment: {
    departmentId: string
    departmentName: string
    departmentNameAr: string
    count: number
    totalAmount: number
  }[]
  recentIncentives: EmployeeIncentive[]
  pendingApprovals: number
  processedThisMonth: number
  topEmployees: {
    employeeId: string
    employeeName: string
    employeeNameAr: string
    count: number
    totalAmount: number
  }[]
}

export interface EmployeeIncentiveHistory {
  employeeId: string
  employeeName: string
  employeeNameAr: string
  incentives: EmployeeIncentive[]
  totalIncentives: number
  totalAmount: number
  averageAmount: number
  byType: {
    type: IncentiveType
    count: number
    totalAmount: number
  }[]
}

export interface BulkIncentiveData {
  incentives: CreateEmployeeIncentiveData[]
}

export interface BulkIncentiveResult {
  created: number
  failed: number
  errors?: {
    index: number
    employeeId: string
    error: string
  }[]
  incentives: EmployeeIncentive[]
}

export interface ApproveIncentiveData {
  comments?: string
}

export interface RejectIncentiveData {
  reason: string
  reasonAr?: string
}

// ==================== API FUNCTIONS ====================

export const employeeIncentiveService = {
  // ==================== CRUD OPERATIONS ====================

  /**
   * Get all employee incentives with filters
   */
  getEmployeeIncentives: async (
    filters?: EmployeeIncentiveFilters
  ): Promise<EmployeeIncentivesResponse> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)))
          } else {
            params.append(key, String(value))
          }
        }
      })
    }
    const queryString = params.toString()
    const url = queryString
      ? `/hr/employee-incentives?${queryString}`
      : '/hr/employee-incentives'
    const response = await apiClient.get(url)
    return response.data
  },

  /**
   * Get a single employee incentive by ID
   */
  getEmployeeIncentive: async (id: string): Promise<EmployeeIncentive> => {
    const response = await apiClient.get(`/hr/employee-incentives/${id}`)
    return response.data
  },

  /**
   * Create a new employee incentive
   */
  createEmployeeIncentive: async (
    data: CreateEmployeeIncentiveData
  ): Promise<EmployeeIncentive> => {
    const response = await apiClient.post('/hr/employee-incentives', data)
    return response.data
  },

  /**
   * Update an existing employee incentive
   */
  updateEmployeeIncentive: async (
    id: string,
    data: UpdateEmployeeIncentiveData
  ): Promise<EmployeeIncentive> => {
    const response = await apiClient.patch(`/hr/employee-incentives/${id}`, data)
    return response.data
  },

  /**
   * Delete an employee incentive
   */
  deleteEmployeeIncentive: async (id: string): Promise<void> => {
    await apiClient.delete(`/hr/employee-incentives/${id}`)
  },

  /**
   * Bulk delete employee incentives
   */
  bulkDeleteEmployeeIncentives: async (ids: string[]): Promise<{ deleted: number }> => {
    const response = await apiClient.post('/hr/employee-incentives/bulk-delete', { ids })
    return response.data
  },

  // ==================== APPROVAL OPERATIONS ====================

  /**
   * Submit incentive for approval
   */
  submitForApproval: async (id: string): Promise<EmployeeIncentive> => {
    const response = await apiClient.post(`/hr/employee-incentives/${id}/submit`)
    return response.data
  },

  /**
   * Approve an incentive
   */
  approveIncentive: async (
    id: string,
    data?: ApproveIncentiveData
  ): Promise<EmployeeIncentive> => {
    const response = await apiClient.post(`/hr/employee-incentives/${id}/approve`, data)
    return response.data
  },

  /**
   * Reject/Cancel an incentive
   */
  rejectIncentive: async (
    id: string,
    data: RejectIncentiveData
  ): Promise<EmployeeIncentive> => {
    const response = await apiClient.post(`/hr/employee-incentives/${id}/reject`, data)
    return response.data
  },

  // ==================== PAYROLL OPERATIONS ====================

  /**
   * Get incentives for a specific payroll period
   */
  getIncentivesForPayroll: async (payrollDate: string): Promise<EmployeeIncentive[]> => {
    const response = await apiClient.get(
      `/hr/employee-incentives/payroll/${payrollDate}`
    )
    return response.data
  },

  /**
   * Mark incentive as processed (linked to payroll)
   */
  markAsProcessed: async (
    id: string,
    payrollEntryId: string
  ): Promise<EmployeeIncentive> => {
    const response = await apiClient.post(`/hr/employee-incentives/${id}/process`, {
      payrollEntryId,
    })
    return response.data
  },

  // ==================== EMPLOYEE HISTORY ====================

  /**
   * Get incentive history for a specific employee
   */
  getEmployeeIncentiveHistory: async (
    employeeId: string
  ): Promise<EmployeeIncentiveHistory> => {
    const response = await apiClient.get(
      `/hr/employee-incentives/employee/${employeeId}/history`
    )
    return response.data
  },

  /**
   * Get all incentives for a specific employee
   */
  getEmployeeIncentives: async (
    employeeId: string,
    filters?: Omit<EmployeeIncentiveFilters, 'employeeId'>
  ): Promise<EmployeeIncentivesResponse> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)))
          } else {
            params.append(key, String(value))
          }
        }
      })
    }
    const queryString = params.toString()
    const url = queryString
      ? `/hr/employee-incentives/employee/${employeeId}?${queryString}`
      : `/hr/employee-incentives/employee/${employeeId}`
    const response = await apiClient.get(url)
    return response.data
  },

  // ==================== BULK OPERATIONS ====================

  /**
   * Create multiple incentives at once
   */
  bulkCreateIncentives: async (
    data: BulkIncentiveData
  ): Promise<BulkIncentiveResult> => {
    const response = await apiClient.post('/hr/employee-incentives/bulk-create', data)
    return response.data
  },

  /**
   * Bulk approve incentives
   */
  bulkApproveIncentives: async (
    ids: string[],
    data?: ApproveIncentiveData
  ): Promise<{ approved: number; incentives: EmployeeIncentive[] }> => {
    const response = await apiClient.post('/hr/employee-incentives/bulk-approve', {
      ids,
      ...data,
    })
    return response.data
  },

  // ==================== STATISTICS ====================

  /**
   * Get incentive statistics
   */
  getIncentiveStatistics: async (
    filters?: Omit<EmployeeIncentiveFilters, 'page' | 'limit'>
  ): Promise<IncentiveStatistics> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)))
          } else {
            params.append(key, String(value))
          }
        }
      })
    }
    const queryString = params.toString()
    const url = queryString
      ? `/hr/employee-incentives/stats?${queryString}`
      : '/hr/employee-incentives/stats'
    const response = await apiClient.get(url)
    return response.data
  },

  /**
   * Get pending incentives (requiring approval)
   */
  getPendingIncentives: async (): Promise<EmployeeIncentive[]> => {
    const response = await apiClient.get('/hr/employee-incentives/pending')
    return response.data
  },

  /**
   * Get approved incentives awaiting processing
   */
  getApprovedAwaitingProcessing: async (): Promise<EmployeeIncentive[]> => {
    const response = await apiClient.get('/hr/employee-incentives/awaiting-processing')
    return response.data
  },

  // ==================== EXPORT ====================

  /**
   * Export incentives to Excel/CSV
   */
  exportIncentives: async (filters?: EmployeeIncentiveFilters): Promise<Blob> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)))
          } else {
            params.append(key, String(value))
          }
        }
      })
    }
    const queryString = params.toString()
    const url = queryString
      ? `/hr/employee-incentives/export?${queryString}`
      : '/hr/employee-incentives/export'
    const response = await apiClient.get(url, { responseType: 'blob' })
    return response.data
  },
}

export default employeeIncentiveService

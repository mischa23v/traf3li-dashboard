import { apiClient } from '@/lib/api'
import { isValidObjectId } from '@/utils/validation-patterns'

// ==================== ENUMS & TYPES ====================

export type TransferType = 'internal' | 'external' | 'temporary' | 'permanent'
export type TransferStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'completed'
export type TransferProperty = 'branch' | 'department' | 'designation' | 'reporting_manager'

// ==================== LABELS ====================

export const TRANSFER_TYPE_LABELS: Record<TransferType, { ar: string; en: string; color: string }> = {
  internal: { ar: 'نقل داخلي', en: 'Internal', color: 'blue' },
  external: { ar: 'نقل خارجي', en: 'External', color: 'purple' },
  temporary: { ar: 'نقل مؤقت', en: 'Temporary', color: 'amber' },
  permanent: { ar: 'نقل دائم', en: 'Permanent', color: 'emerald' },
}

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, { ar: string; en: string; color: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'slate' },
  pending_approval: { ar: 'قيد الموافقة', en: 'Pending Approval', color: 'blue' },
  approved: { ar: 'معتمد', en: 'Approved', color: 'emerald' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'green' },
}

export const TRANSFER_PROPERTY_LABELS: Record<TransferProperty, { ar: string; en: string }> = {
  branch: { ar: 'الفرع', en: 'Branch' },
  department: { ar: 'القسم', en: 'Department' },
  designation: { ar: 'المسمى الوظيفي', en: 'Designation' },
  reporting_manager: { ar: 'المدير المباشر', en: 'Reporting Manager' },
}

// ==================== INTERFACES ====================

export interface ApprovalStep {
  approverName: string
  approverId: string
  approverRole: string
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
  actionDate?: string
  order: number
}

export interface TransferDetail {
  property: TransferProperty
  currentValue: string
  newValue: string
}

export interface HandoverChecklistItem {
  item: string
  itemAr?: string
  completed: boolean
  completedAt?: string
  completedBy?: string
}

export interface EmployeeTransfer {
  _id: string
  transferId: string

  // Employee Info
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  employeeNumber?: string

  // Transfer Details
  transferDate: string
  effectiveDate: string
  endDate?: string // for temporary transfers

  // From
  fromBranch?: string
  fromDepartmentId?: string
  fromDepartmentName?: string
  fromDesignation?: string
  fromReportingManager?: string

  // To
  toBranch?: string
  toDepartmentId?: string
  toDepartmentName?: string
  toDesignation?: string
  toReportingManager?: string

  // Transfer Type and Details
  transferType: TransferType
  transferDetails: TransferDetail[]

  // Reason
  reason: string
  reasonAr?: string

  // For external transfers
  newCompany?: string
  createNewEmployeeId: boolean

  // Status and Approval
  status: TransferStatus
  approvalWorkflow: ApprovalStep[]

  // Handover
  handoverRequired: boolean
  handoverChecklist?: HandoverChecklistItem[]

  // Notification
  notifyEmployee: boolean

  // Audit
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName?: string
  lastModifiedBy?: string
}

// ==================== API TYPES ====================

export interface CreateEmployeeTransferData {
  employeeId: string
  transferDate: string
  effectiveDate: string
  endDate?: string

  fromBranch?: string
  fromDepartmentId?: string
  fromDepartmentName?: string
  fromDesignation?: string
  fromReportingManager?: string

  toBranch?: string
  toDepartmentId?: string
  toDepartmentName?: string
  toDesignation?: string
  toReportingManager?: string

  transferType: TransferType
  transferDetails?: TransferDetail[]

  reason: string
  reasonAr?: string

  newCompany?: string
  createNewEmployeeId?: boolean

  approvalWorkflow?: Partial<ApprovalStep>[]

  handoverRequired?: boolean
  handoverChecklist?: Partial<HandoverChecklistItem>[]

  notifyEmployee?: boolean
}

export interface UpdateEmployeeTransferData extends Partial<CreateEmployeeTransferData> {
  status?: TransferStatus
}

export interface EmployeeTransferFilters {
  search?: string
  employeeId?: string
  transferType?: TransferType | TransferType[]
  status?: TransferStatus | TransferStatus[]
  fromDepartment?: string
  toDepartment?: string
  fromBranch?: string
  toBranch?: string
  transferDateFrom?: string
  transferDateTo?: string
  effectiveDateFrom?: string
  effectiveDateTo?: string
  pendingApproval?: boolean
  pendingHandover?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface EmployeeTransfersResponse {
  data: EmployeeTransfer[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface EmployeeTransferStats {
  totalTransfers: number
  byType: Array<{ type: TransferType; count: number }>
  byStatus: Array<{ status: TransferStatus; count: number }>
  pendingApprovals: number
  pendingHandovers: number
  completedThisMonth: number
  scheduledTransfers: number
  temporaryTransfers: number
}

export interface EmployeeTransferHistory {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  transfers: EmployeeTransfer[]
  totalTransfers: number
}

// ==================== API FUNCTIONS ====================

const employeeTransferService = {
  // ==================== CRUD OPERATIONS ====================

  getTransfers: async (filters?: EmployeeTransferFilters): Promise<EmployeeTransfersResponse> => {
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
    const response = await apiClient.get(`/hr/transfers?${params.toString()}`)
    return response.data
  },

  getTransfer: async (id: string): Promise<EmployeeTransfer> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف النقل غير صالح / Invalid transfer ID')
    }
    const response = await apiClient.get(`/hr/transfers/${id}`)
    return response.data
  },

  createTransfer: async (data: CreateEmployeeTransferData): Promise<EmployeeTransfer> => {
    const response = await apiClient.post('/hr/transfers', data)
    return response.data?.transfer || response.data?.data || response.data
  },

  updateTransfer: async (id: string, data: UpdateEmployeeTransferData): Promise<EmployeeTransfer> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف النقل غير صالح / Invalid transfer ID')
    }
    const response = await apiClient.put(`/hr/transfers/${id}`, data)
    return response.data
  },

  deleteTransfer: async (id: string): Promise<void> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف النقل غير صالح / Invalid transfer ID')
    }
    await apiClient.delete(`/hr/transfers/${id}`)
  },

  bulkDeleteTransfers: async (ids: string[]): Promise<void> => {
    await apiClient.post('/hr/transfers/bulk-delete', { ids })
  },

  // ==================== TRANSFER OPERATIONS ====================

  applyTransfer: async (id: string): Promise<EmployeeTransfer> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف النقل غير صالح / Invalid transfer ID')
    }
    const response = await apiClient.post(`/hr/transfers/${id}/apply`)
    return response.data
  },

  approveTransfer: async (id: string, comments?: string): Promise<EmployeeTransfer> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف النقل غير صالح / Invalid transfer ID')
    }
    const response = await apiClient.post(`/hr/transfers/${id}/approve`, { comments })
    return response.data
  },

  rejectTransfer: async (id: string, comments: string): Promise<EmployeeTransfer> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف النقل غير صالح / Invalid transfer ID')
    }
    const response = await apiClient.post(`/hr/transfers/${id}/reject`, { comments })
    return response.data
  },

  updateTransferStatus: async (id: string, status: TransferStatus): Promise<EmployeeTransfer> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف النقل غير صالح / Invalid transfer ID')
    }
    const response = await apiClient.patch(`/hr/transfers/${id}/status`, { status })
    return response.data
  },

  // ==================== HANDOVER ====================

  updateHandoverItem: async (
    id: string,
    itemIndex: number,
    completed: boolean
  ): Promise<EmployeeTransfer> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف النقل غير صالح / Invalid transfer ID')
    }
    const response = await apiClient.patch(`/hr/transfers/${id}/handover/${itemIndex}`, { completed })
    return response.data
  },

  addHandoverItem: async (
    id: string,
    item: Partial<HandoverChecklistItem>
  ): Promise<EmployeeTransfer> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف النقل غير صالح / Invalid transfer ID')
    }
    const response = await apiClient.post(`/hr/transfers/${id}/handover`, item)
    return response.data
  },

  getPendingHandovers: async (): Promise<EmployeeTransfer[]> => {
    const response = await apiClient.get('/hr/transfers/pending-handovers')
    return response.data
  },

  // ==================== HISTORY & STATS ====================

  getTransferHistory: async (employeeId: string): Promise<EmployeeTransferHistory> => {
    if (!isValidObjectId(employeeId)) {
      throw new Error('معرّف الموظف غير صالح / Invalid employee ID')
    }
    const response = await apiClient.get(`/hr/transfers/history/${employeeId}`)
    return response.data
  },

  getTransferStats: async (): Promise<EmployeeTransferStats> => {
    const response = await apiClient.get('/hr/transfers/stats')
    return response.data
  },

  // ==================== APPROVAL WORKFLOW ====================

  addApprovalStep: async (
    id: string,
    approver: Partial<ApprovalStep>
  ): Promise<EmployeeTransfer> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف النقل غير صالح / Invalid transfer ID')
    }
    const response = await apiClient.post(`/hr/transfers/${id}/approvals`, approver)
    return response.data
  },

  updateApprovalStep: async (
    id: string,
    stepIndex: number,
    data: Partial<ApprovalStep>
  ): Promise<EmployeeTransfer> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف النقل غير صالح / Invalid transfer ID')
    }
    const response = await apiClient.patch(`/hr/transfers/${id}/approvals/${stepIndex}`, data)
    return response.data
  },

  getPendingApprovals: async (approverId?: string): Promise<EmployeeTransfer[]> => {
    const params = new URLSearchParams()
    if (approverId) params.append('approverId', approverId)
    const response = await apiClient.get(`/hr/transfers/pending-approvals?${params.toString()}`)
    return response.data
  },

  // ==================== NOTIFICATIONS ====================

  notifyEmployee: async (id: string): Promise<void> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف النقل غير صالح / Invalid transfer ID')
    }
    await apiClient.post(`/hr/transfers/${id}/notify`)
  },
}

export default employeeTransferService

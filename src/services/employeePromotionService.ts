import api from './api'

// ==================== ENUMS ====================

export enum PromotionStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum PromotionProperty {
  DEPARTMENT = 'department',
  DESIGNATION = 'designation',
  GRADE = 'grade',
  SALARY = 'salary',
  BRANCH = 'branch'
}

export enum ApprovalStepStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SKIPPED = 'skipped'
}

// ==================== LABELS ====================

export const promotionStatusLabels: Record<PromotionStatus, { ar: string; en: string }> = {
  [PromotionStatus.DRAFT]: { ar: 'مسودة', en: 'Draft' },
  [PromotionStatus.PENDING_APPROVAL]: { ar: 'بانتظار الموافقة', en: 'Pending Approval' },
  [PromotionStatus.APPROVED]: { ar: 'معتمد', en: 'Approved' },
  [PromotionStatus.REJECTED]: { ar: 'مرفوض', en: 'Rejected' },
  [PromotionStatus.CANCELLED]: { ar: 'ملغى', en: 'Cancelled' }
}

export const promotionPropertyLabels: Record<PromotionProperty, { ar: string; en: string }> = {
  [PromotionProperty.DEPARTMENT]: { ar: 'القسم', en: 'Department' },
  [PromotionProperty.DESIGNATION]: { ar: 'المسمى الوظيفي', en: 'Designation' },
  [PromotionProperty.GRADE]: { ar: 'الدرجة', en: 'Grade' },
  [PromotionProperty.SALARY]: { ar: 'الراتب', en: 'Salary' },
  [PromotionProperty.BRANCH]: { ar: 'الفرع', en: 'Branch' }
}

// ==================== INTERFACES ====================

export interface PromotionDetail {
  property: PromotionProperty
  propertyLabel?: string
  propertyLabelAr?: string
  currentValue: string
  newValue: string
  changeDescription?: string
}

export interface ApprovalStep {
  stepNumber: number
  approverRole: string
  approverRoleAr?: string
  approverId?: string
  approverName?: string
  approverNameAr?: string
  status: ApprovalStepStatus
  actionDate?: string
  comments?: string
  notificationSent?: boolean
}

export interface EmployeePromotion {
  _id: string
  promotionId: string

  // Employee Information
  employeeId: string
  employeeNumber?: string
  employeeName: string
  employeeNameAr?: string

  // Dates
  promotionDate: string
  effectiveDate: string

  // Previous position
  previousDepartmentId?: string
  previousDepartmentName?: string
  previousDepartmentNameAr?: string
  previousDesignation: string
  previousDesignationAr?: string
  previousGrade?: string
  previousSalary: number
  previousBranch?: string

  // New position
  newDepartmentId?: string
  newDepartmentName?: string
  newDepartmentNameAr?: string
  newDesignation: string
  newDesignationAr?: string
  newGrade?: string
  newSalary: number
  newBranch?: string

  // Promotion Details
  promotionDetails: PromotionDetail[]

  // Reason & Justification
  reason: string
  reasonAr?: string
  justification?: string
  justificationAr?: string
  performanceRating?: number
  attachments?: {
    fileName: string
    fileUrl: string
    fileType: string
    uploadedAt: string
  }[]

  // Status & Workflow
  status: PromotionStatus
  approvalWorkflow: ApprovalStep[]

  // Saudi Labor Law Compliance
  compliance?: {
    saudiLaborLawCompliant: boolean
    minWageCompliant?: boolean
    contractUpdated?: boolean
    gosiUpdated?: boolean
    violations?: string[]
    complianceNotes?: string
  }

  // Notification
  notifyEmployee: boolean
  employeeNotified?: boolean
  employeeNotifiedAt?: string
  employeeAcknowledged?: boolean
  employeeAcknowledgedAt?: string
  employeeComments?: string

  // Applied Status
  applied: boolean
  appliedAt?: string
  appliedBy?: string

  // Audit Fields
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName?: string
  updatedBy?: string

  // Office
  officeId: string
}

// ==================== API TYPES ====================

export interface PromotionFilters {
  status?: PromotionStatus | PromotionStatus[]
  employeeId?: string
  departmentId?: string
  effectiveDateFrom?: string
  effectiveDateTo?: string
  applied?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PromotionsResponse {
  promotions: EmployeePromotion[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreatePromotionInput {
  // Employee Information
  employeeId: string
  employeeNumber?: string
  employeeName: string
  employeeNameAr?: string

  // Dates
  promotionDate: string
  effectiveDate: string

  // Previous position
  previousDepartmentId?: string
  previousDepartmentName?: string
  previousDepartmentNameAr?: string
  previousDesignation: string
  previousDesignationAr?: string
  previousGrade?: string
  previousSalary: number
  previousBranch?: string

  // New position
  newDepartmentId?: string
  newDepartmentName?: string
  newDepartmentNameAr?: string
  newDesignation: string
  newDesignationAr?: string
  newGrade?: string
  newSalary: number
  newBranch?: string

  // Promotion Details
  promotionDetails: PromotionDetail[]

  // Reason & Justification
  reason: string
  reasonAr?: string
  justification?: string
  justificationAr?: string
  performanceRating?: number

  // Workflow
  approvalWorkflow?: ApprovalStep[]

  // Notification
  notifyEmployee?: boolean

  // Office
  officeId: string
}

export type UpdatePromotionInput = Partial<CreatePromotionInput>

export interface PromotionStats {
  total: number
  byStatus: { status: PromotionStatus; count: number }[]
  pending: number
  approved: number
  rejected: number
  averageSalaryIncrease: number
  averageSalaryIncreasePercentage: number
  byDepartment: { department: string; departmentAr?: string; count: number }[]
  recentPromotions: EmployeePromotion[]
}

export interface PromotionHistory {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  promotions: EmployeePromotion[]
  totalPromotions: number
  averageTimeBeforePromotion?: number // in months
  latestPromotion?: EmployeePromotion
}

// ==================== SERVICE ====================

const employeePromotionService = {
  // ==================== CRUD OPERATIONS ====================

  /**
   * Get all promotions with optional filters
   */
  getPromotions: async (filters?: PromotionFilters): Promise<PromotionsResponse> => {
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
    const queryString = params.toString()
    const url = queryString ? `/hr/employee-promotions?${queryString}` : '/hr/employee-promotions'
    const response = await api.get(url)
    return response.data
  },

  /**
   * Get a single promotion by ID
   */
  getPromotion: async (id: string): Promise<EmployeePromotion> => {
    const response = await api.get(`/hr/employee-promotions/${id}`)
    return response.data
  },

  /**
   * Create a new promotion
   */
  createPromotion: async (data: CreatePromotionInput): Promise<EmployeePromotion> => {
    const response = await api.post('/hr/employee-promotions', data)
    return response.data
  },

  /**
   * Update an existing promotion
   */
  updatePromotion: async (id: string, data: UpdatePromotionInput): Promise<EmployeePromotion> => {
    const response = await api.patch(`/hr/employee-promotions/${id}`, data)
    return response.data
  },

  /**
   * Delete a promotion
   */
  deletePromotion: async (id: string): Promise<void> => {
    await api.delete(`/hr/employee-promotions/${id}`)
  },

  /**
   * Bulk delete promotions
   */
  bulkDeletePromotions: async (ids: string[]): Promise<void> => {
    await api.post('/hr/employee-promotions/bulk-delete', { ids })
  },

  // ==================== WORKFLOW OPERATIONS ====================

  /**
   * Submit promotion for approval
   */
  submitForApproval: async (id: string): Promise<EmployeePromotion> => {
    const response = await api.post(`/hr/employee-promotions/${id}/submit`)
    return response.data
  },

  /**
   * Approve a promotion (for approvers)
   */
  approvePromotion: async (id: string, data: {
    stepNumber: number
    comments?: string
  }): Promise<EmployeePromotion> => {
    const response = await api.post(`/hr/employee-promotions/${id}/approve`, data)
    return response.data
  },

  /**
   * Reject a promotion (for approvers)
   */
  rejectPromotion: async (id: string, data: {
    stepNumber: number
    comments: string
  }): Promise<EmployeePromotion> => {
    const response = await api.post(`/hr/employee-promotions/${id}/reject`, data)
    return response.data
  },

  /**
   * Cancel a promotion
   */
  cancelPromotion: async (id: string, reason: string): Promise<EmployeePromotion> => {
    const response = await api.post(`/hr/employee-promotions/${id}/cancel`, { reason })
    return response.data
  },

  // ==================== APPLY PROMOTION ====================

  /**
   * Apply promotion - updates employee record with new position/salary
   * This should be done after final approval
   */
  applyPromotion: async (id: string): Promise<{
    promotion: EmployeePromotion
    employee: any // Updated employee record
  }> => {
    const response = await api.post(`/hr/employee-promotions/${id}/apply`)
    return response.data
  },

  // ==================== EMPLOYEE HISTORY ====================

  /**
   * Get promotion history for a specific employee
   */
  getPromotionHistory: async (employeeId: string): Promise<PromotionHistory> => {
    const response = await api.get(`/hr/employee-promotions/employee/${employeeId}/history`)
    return response.data
  },

  /**
   * Get all promotions for a specific employee
   */
  getEmployeePromotions: async (employeeId: string, filters?: Omit<PromotionFilters, 'employeeId'>): Promise<PromotionsResponse> => {
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
    const queryString = params.toString()
    const url = queryString
      ? `/hr/employee-promotions/employee/${employeeId}?${queryString}`
      : `/hr/employee-promotions/employee/${employeeId}`
    const response = await api.get(url)
    return response.data
  },

  // ==================== STATISTICS ====================

  /**
   * Get promotion statistics
   */
  getPromotionStats: async (filters?: {
    departmentId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<PromotionStats> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const queryString = params.toString()
    const url = queryString ? `/hr/employee-promotions/stats?${queryString}` : '/hr/employee-promotions/stats'
    const response = await api.get(url)
    return response.data
  },

  /**
   * Get pending promotions (requiring approval)
   */
  getPendingPromotions: async (): Promise<EmployeePromotion[]> => {
    const response = await api.get('/hr/employee-promotions/pending')
    return response.data
  },

  /**
   * Get promotions awaiting application (approved but not yet applied)
   */
  getPromotionsAwaitingApplication: async (): Promise<EmployeePromotion[]> => {
    const response = await api.get('/hr/employee-promotions/awaiting-application')
    return response.data
  },

  // ==================== NOTIFICATIONS ====================

  /**
   * Send notification to employee about their promotion
   */
  notifyEmployee: async (id: string): Promise<EmployeePromotion> => {
    const response = await api.post(`/hr/employee-promotions/${id}/notify`)
    return response.data
  },

  /**
   * Employee acknowledgement of promotion
   */
  acknowledgePromotion: async (id: string, comments?: string): Promise<EmployeePromotion> => {
    const response = await api.post(`/hr/employee-promotions/${id}/acknowledge`, { comments })
    return response.data
  },

  // ==================== EXPORT ====================

  /**
   * Export promotions to Excel/CSV
   */
  exportPromotions: async (filters?: PromotionFilters): Promise<Blob> => {
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
    const queryString = params.toString()
    const url = queryString ? `/hr/employee-promotions/export?${queryString}` : '/hr/employee-promotions/export'
    const response = await api.get(url, { responseType: 'blob' })
    return response.data
  },
}

export default employeePromotionService

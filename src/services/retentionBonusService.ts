import api from './api'

// ==================== ENUMS ====================

export enum BonusType {
  RETENTION = 'retention',
  SIGNING = 'signing',
  PROJECT_COMPLETION = 'project_completion',
  PERFORMANCE = 'performance',
  LOYALTY = 'loyalty',
  REFERRAL = 'referral'
}

export enum BonusStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  PAID = 'paid',
  CLAWED_BACK = 'clawed_back',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  PAYROLL = 'payroll',
  SEPARATE_PAYMENT = 'separate_payment'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// ==================== LABELS ====================

export const bonusTypeLabels: Record<BonusType, { ar: string; en: string }> = {
  [BonusType.RETENTION]: { ar: 'مكافأة استبقاء', en: 'Retention Bonus' },
  [BonusType.SIGNING]: { ar: 'مكافأة توقيع', en: 'Signing Bonus' },
  [BonusType.PROJECT_COMPLETION]: { ar: 'مكافأة إنجاز مشروع', en: 'Project Completion' },
  [BonusType.PERFORMANCE]: { ar: 'مكافأة أداء', en: 'Performance Bonus' },
  [BonusType.LOYALTY]: { ar: 'مكافأة ولاء', en: 'Loyalty Bonus' },
  [BonusType.REFERRAL]: { ar: 'مكافأة إحالة', en: 'Referral Bonus' }
}

export const bonusStatusLabels: Record<BonusStatus, { ar: string; en: string }> = {
  [BonusStatus.DRAFT]: { ar: 'مسودة', en: 'Draft' },
  [BonusStatus.PENDING_APPROVAL]: { ar: 'بانتظار الموافقة', en: 'Pending Approval' },
  [BonusStatus.APPROVED]: { ar: 'معتمد', en: 'Approved' },
  [BonusStatus.PAID]: { ar: 'مدفوع', en: 'Paid' },
  [BonusStatus.CLAWED_BACK]: { ar: 'مسترد', en: 'Clawed Back' },
  [BonusStatus.CANCELLED]: { ar: 'ملغى', en: 'Cancelled' }
}

export const paymentMethodLabels: Record<PaymentMethod, { ar: string; en: string }> = {
  [PaymentMethod.PAYROLL]: { ar: 'كشف رواتب', en: 'Payroll' },
  [PaymentMethod.SEPARATE_PAYMENT]: { ar: 'دفعة منفصلة', en: 'Separate Payment' }
}

// ==================== INTERFACES ====================

export interface ApprovalWorkflowStep {
  stepNumber: number
  approverRole: string
  approverId?: string
  status: ApprovalStatus
  comments?: string
  actionDate?: string
}

export interface RetentionBonus {
  _id: string
  bonusId: string

  // Employee information
  employeeId: string
  employeeName: string
  employeeNameAr: string
  departmentId: string
  designation: string

  // Bonus details
  bonusType: BonusType
  bonusAmount: number
  currency: string

  // Payment schedule
  paymentDate: string
  paymentMethod: PaymentMethod

  // For retention bonus - vesting
  vestingPeriod?: number // months
  vestingStartDate?: string
  vestingEndDate?: string
  vestedAmount?: number

  // Conditions
  conditionsForPayment: string
  conditionsForPaymentAr: string

  // Clawback
  clawbackApplicable: boolean
  clawbackConditions?: string
  clawbackPeriod?: number // months after payment

  // Reason
  reasonForGiving: string
  reasonForGivingAr: string

  // Status
  status: BonusStatus

  // Approval
  approvalWorkflow: ApprovalWorkflowStep[]

  // Payment tracking
  payrollEntryId?: string
  paymentReference?: string
  paidAt?: string

  // Clawback tracking
  clawedBackAmount?: number
  clawbackReason?: string
  clawbackDate?: string

  // Audit fields
  createdAt: string
  updatedAt: string
  createdBy: string
}

// ==================== API TYPES ====================

export interface RetentionBonusFilters {
  employeeId?: string
  departmentId?: string
  bonusType?: BonusType
  status?: BonusStatus
  paymentMethod?: PaymentMethod
  fromDate?: string
  toDate?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CreateRetentionBonusInput {
  // Required fields
  employeeId: string
  employeeName: string
  employeeNameAr: string
  departmentId: string
  designation: string
  bonusType: BonusType
  bonusAmount: number
  currency: string
  paymentDate: string
  paymentMethod: PaymentMethod
  conditionsForPayment: string
  conditionsForPaymentAr: string
  reasonForGiving: string
  reasonForGivingAr: string

  // Optional fields
  vestingPeriod?: number
  vestingStartDate?: string
  vestingEndDate?: string
  clawbackApplicable?: boolean
  clawbackConditions?: string
  clawbackPeriod?: number
  approvalWorkflow?: Omit<ApprovalWorkflowStep, 'actionDate'>[]
}

export type UpdateRetentionBonusInput = Partial<CreateRetentionBonusInput>

export interface RetentionBonusesResponse {
  bonuses: RetentionBonus[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface RetentionBonusStats {
  totalBonuses: number
  totalAmount: number
  byStatus: Record<BonusStatus, number>
  byType: Record<BonusType, number>
  pendingApprovals: number
  dueForPayment: number
  averageBonusAmount: number
  vestingBonuses: number
  clawbackApplicable: number
}

export interface BonusPaymentData {
  paymentReference: string
  payrollEntryId?: string
  paidAt?: string
}

export interface BonusClawbackData {
  clawbackAmount: number
  clawbackReason: string
}

export interface ApprovalActionData {
  approverId: string
  comments?: string
}

export interface VestingStatus {
  bonusId: string
  employeeName: string
  employeeNameAr: string
  totalAmount: number
  vestedAmount: number
  unvestedAmount: number
  vestingPeriod: number
  vestingStartDate: string
  vestingEndDate: string
  monthsElapsed: number
  monthsRemaining: number
  vestingPercentage: number
  isFullyVested: boolean
}

export interface EmployeeBonusHistory {
  employeeId: string
  employeeName: string
  employeeNameAr: string
  totalBonuses: number
  totalAmount: number
  bonuses: RetentionBonus[]
}

// ==================== API FUNCTIONS ====================

export const retentionBonusApi = {
  // Get all retention bonuses with optional filters
  getAll: async (filters?: RetentionBonusFilters): Promise<RetentionBonusesResponse> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const queryString = params.toString()
    const url = queryString ? `/hr/retention-bonuses?${queryString}` : '/hr/retention-bonuses'
    const response = await api.get(url)
    return response.data
  },

  // Get a single retention bonus by ID
  getById: async (id: string): Promise<RetentionBonus> => {
    const response = await api.get(`/hr/retention-bonuses/${id}`)
    return response.data
  },

  // Create a new retention bonus
  create: async (data: CreateRetentionBonusInput): Promise<RetentionBonus> => {
    const response = await api.post('/hr/retention-bonuses', data)
    return response.data
  },

  // Update an existing retention bonus
  update: async (id: string, data: UpdateRetentionBonusInput): Promise<RetentionBonus> => {
    const response = await api.patch(`/hr/retention-bonuses/${id}`, data)
    return response.data
  },

  // Delete a retention bonus
  delete: async (id: string): Promise<void> => {
    await api.delete(`/hr/retention-bonuses/${id}`)
  },

  // Bulk delete retention bonuses
  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post('/hr/retention-bonuses/bulk-delete', { ids })
  },

  // Approve bonus
  approveBonus: async (id: string, data: ApprovalActionData): Promise<RetentionBonus> => {
    const response = await api.post(`/hr/retention-bonuses/${id}/approve`, data)
    return response.data
  },

  // Reject bonus
  rejectBonus: async (id: string, data: ApprovalActionData): Promise<RetentionBonus> => {
    const response = await api.post(`/hr/retention-bonuses/${id}/reject`, data)
    return response.data
  },

  // Mark as paid
  markAsPaid: async (id: string, data: BonusPaymentData): Promise<RetentionBonus> => {
    const response = await api.post(`/hr/retention-bonuses/${id}/mark-paid`, data)
    return response.data
  },

  // Process clawback
  processClawback: async (id: string, data: BonusClawbackData): Promise<RetentionBonus> => {
    const response = await api.post(`/hr/retention-bonuses/${id}/clawback`, data)
    return response.data
  },

  // Get employee bonus history
  getEmployeeBonusHistory: async (employeeId: string): Promise<EmployeeBonusHistory> => {
    const response = await api.get(`/hr/retention-bonuses/employee/${employeeId}/history`)
    return response.data
  },

  // Get bonuses due for payment
  getBonusesDueForPayment: async (date?: string): Promise<RetentionBonus[]> => {
    const url = date
      ? `/hr/retention-bonuses/due-for-payment?date=${date}`
      : '/hr/retention-bonuses/due-for-payment'
    const response = await api.get(url)
    return response.data
  },

  // Get vesting status
  getVestingStatus: async (id: string): Promise<VestingStatus> => {
    const response = await api.get(`/hr/retention-bonuses/${id}/vesting-status`)
    return response.data
  },

  // Get statistics
  getStats: async (filters?: Pick<RetentionBonusFilters, 'departmentId' | 'fromDate' | 'toDate'>): Promise<RetentionBonusStats> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const queryString = params.toString()
    const url = queryString ? `/hr/retention-bonuses/stats?${queryString}` : '/hr/retention-bonuses/stats'
    const response = await api.get(url)
    return response.data
  },

  // Get pending approvals
  getPendingApprovals: async (): Promise<Array<{
    bonusId: string
    employeeName: string
    employeeNameAr: string
    bonusType: BonusType
    bonusAmount: number
    currency: string
    submissionDate: string
    currentStep: number
  }>> => {
    const response = await api.get('/hr/retention-bonuses/pending-approvals')
    return response.data
  },

  // Get department summary
  getDepartmentSummary: async (departmentId?: string): Promise<Array<{
    department: string
    departmentId: string
    employeeCount: number
    totalBonuses: number
    totalAmount: number
    averageBonus: number
    pendingApprovals: number
  }>> => {
    const url = departmentId
      ? `/hr/retention-bonuses/department-summary?departmentId=${departmentId}`
      : '/hr/retention-bonuses/department-summary'
    const response = await api.get(url)
    return response.data
  },

  // Export retention bonuses
  exportBonuses: async (filters?: RetentionBonusFilters): Promise<Blob> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const queryString = params.toString()
    const url = queryString ? `/hr/retention-bonuses/export?${queryString}` : '/hr/retention-bonuses/export'
    const response = await api.get(url, { responseType: 'blob' })
    return response.data
  },

  // Cancel bonus
  cancelBonus: async (id: string, reason: string): Promise<RetentionBonus> => {
    const response = await api.post(`/hr/retention-bonuses/${id}/cancel`, { reason })
    return response.data
  },

  // Submit for approval
  submitForApproval: async (id: string): Promise<RetentionBonus> => {
    const response = await api.post(`/hr/retention-bonuses/${id}/submit`)
    return response.data
  },

  // Calculate vested amount
  calculateVestedAmount: async (id: string, asOfDate?: string): Promise<{
    bonusId: string
    totalAmount: number
    vestedAmount: number
    unvestedAmount: number
    vestingPercentage: number
    asOfDate: string
  }> => {
    const url = asOfDate
      ? `/hr/retention-bonuses/${id}/calculate-vested?asOfDate=${asOfDate}`
      : `/hr/retention-bonuses/${id}/calculate-vested`
    const response = await api.get(url)
    return response.data
  }
}

export default retentionBonusApi

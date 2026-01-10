/**
 * Bonus & Incentive Service
 * Handles bonus management per HR API Documentation Part 4 - Section 6
 * API Base: /api/hr/payroll/bonuses
 *
 * Bonus Types:
 * - performance: Based on individual/team performance reviews
 * - annual: Yearly bonus (e.g., 13th month salary)
 * - project: Completion bonus for specific projects
 * - retention: For retaining key employees
 * - signing: One-time new hire bonus
 * - referral: Employee referral bonus
 * - spot: Immediate recognition bonus
 * - profit_sharing: Share of company profits
 */

import api from './api'

// ==================== TYPES ====================

export type BonusType = 'performance' | 'annual' | 'project' | 'retention' | 'signing' | 'referral' | 'spot' | 'profit_sharing'
export type BonusStatus = 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'processing' | 'paid' | 'cancelled' | 'rejected'
export type CalculationMethod = 'fixed_amount' | 'percentage_of_salary' | 'performance_multiplier' | 'target_based' | 'discretionary'
export type PaymentTiming = 'immediate' | 'next_payroll' | 'scheduled_date' | 'with_salary'

// ==================== INTERFACES ====================

export interface BonusRecord {
  _id: string
  bonusId: string
  referenceNumber: string

  // Employee details
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  department?: string
  departmentAr?: string
  jobTitle?: string
  jobTitleAr?: string

  // Bonus details
  bonusType: BonusType
  bonusName: string
  bonusNameAr?: string
  description?: string
  descriptionAr?: string

  // Financial
  calculationMethod: CalculationMethod
  baseAmount?: number           // For fixed_amount
  percentage?: number           // For percentage_of_salary
  baseSalary?: number           // Reference salary used for calculation
  performanceRating?: number    // For performance_multiplier
  performanceMultiplier?: number
  targetAmount?: number         // For target_based
  achievementPercentage?: number
  calculatedAmount: number
  taxable: boolean
  taxAmount?: number
  netAmount: number

  // Period
  bonusPeriod?: {
    startDate: string
    endDate: string
    fiscalYear?: string
    quarter?: number
  }

  // Payment
  paymentTiming: PaymentTiming
  scheduledPaymentDate?: string
  actualPaymentDate?: string
  payrollRunId?: string
  transactionReference?: string

  // Approval workflow
  status: BonusStatus
  submittedBy?: string
  submittedAt?: string
  approvalChain?: Array<{
    approverRole: string
    approverId?: string
    approverName?: string
    status: 'pending' | 'approved' | 'rejected'
    actionDate?: string
    comments?: string
  }>
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string

  // Additional info
  notes?: string
  notesAr?: string
  attachments?: Array<{
    fileName: string
    fileUrl: string
    uploadedAt: string
    uploadedBy: string
  }>

  // Vesting (for retention/signing bonuses)
  vesting?: {
    vestingSchedule: Array<{
      vestingDate: string
      percentage: number
      amount: number
      status: 'pending' | 'vested' | 'forfeited'
      vestedAt?: string
    }>
    totalVested: number
    totalForfeited: number
    cliffPeriodMonths?: number
    vestingPeriodMonths?: number
  }

  // Clawback provisions (for signing/retention bonuses)
  clawback?: {
    eligible: boolean
    clawbackPeriodMonths: number
    clawbackEndDate: string
    clawbackPercentage: number
    triggered?: boolean
    triggeredAt?: string
    triggeredReason?: string
    clawbackAmount?: number
  }

  // Timestamps
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
}

export interface BonusBatch {
  _id: string
  batchId: string
  batchName: string
  batchNameAr?: string

  bonusType: BonusType
  description?: string
  descriptionAr?: string

  // Period
  bonusPeriod: {
    startDate: string
    endDate: string
    fiscalYear?: string
  }

  // Summary
  summary: {
    totalEmployees: number
    totalAmount: number
    averageAmount: number
    minAmount: number
    maxAmount: number
    byDepartment?: Array<{
      department: string
      employeeCount: number
      totalAmount: number
    }>
  }

  // Status
  status: BonusStatus
  bonuses: BonusRecord[]

  // Approval
  approvedBy?: string
  approvedAt?: string

  // Payment
  paymentTiming: PaymentTiming
  scheduledPaymentDate?: string
  payrollRunId?: string

  createdAt: string
  createdBy: string
}

export interface CreateBonusData {
  employeeId: string
  bonusType: BonusType
  bonusName?: string
  bonusNameAr?: string
  description?: string
  descriptionAr?: string
  calculationMethod: CalculationMethod
  baseAmount?: number
  percentage?: number
  performanceRating?: number
  targetAmount?: number
  achievementPercentage?: number
  taxable?: boolean
  bonusPeriod?: {
    startDate: string
    endDate: string
    fiscalYear?: string
  }
  paymentTiming: PaymentTiming
  scheduledPaymentDate?: string
  notes?: string
  notesAr?: string
  // For retention/signing bonuses
  vestingSchedule?: Array<{
    vestingDate: string
    percentage: number
  }>
  clawbackPeriodMonths?: number
  clawbackPercentage?: number
}

export interface BulkBonusData {
  bonusType: BonusType
  bonusName: string
  bonusNameAr?: string
  description?: string
  descriptionAr?: string
  calculationMethod: CalculationMethod
  bonusPeriod: {
    startDate: string
    endDate: string
    fiscalYear?: string
  }
  paymentTiming: PaymentTiming
  scheduledPaymentDate?: string
  taxable?: boolean
  // Employee-specific data
  employees: Array<{
    employeeId: string
    amount?: number           // For fixed_amount
    percentage?: number       // For percentage_of_salary
    performanceRating?: number
    targetAmount?: number
    achievementPercentage?: number
    notes?: string
  }>
}

export interface BonusFilters {
  employeeId?: string
  bonusType?: BonusType
  status?: BonusStatus
  department?: string
  startDate?: string
  endDate?: string
  fiscalYear?: string
  minAmount?: number
  maxAmount?: number
  payrollRunId?: string
  page?: number
  limit?: number
}

export interface BonusStats {
  currentYear: {
    year: number
    totalBonuses: number
    totalAmount: number
    averageAmount: number
    byType: Record<BonusType, { count: number; amount: number }>
    byStatus: Record<BonusStatus, { count: number; amount: number }>
  }
  comparison: {
    previousYear: number
    amountChange: number
    amountChangePercentage: number
    countChange: number
  }
  byMonth: Array<{
    month: number
    year: number
    count: number
    totalAmount: number
  }>
  byDepartment: Array<{
    department: string
    employeeCount: number
    totalAmount: number
    averageAmount: number
  }>
  topRecipients: Array<{
    employeeId: string
    employeeName: string
    department: string
    totalBonuses: number
    totalAmount: number
  }>
}

export interface BonusCalculationPreview {
  employeeId: string
  employeeName: string
  baseSalary: number
  calculationMethod: CalculationMethod
  calculatedAmount: number
  taxAmount: number
  netAmount: number
  breakdown: {
    baseValue: number
    multiplier?: number
    percentage?: number
    adjustments?: number
  }
}

// ==================== LABELS ====================

export const BONUS_TYPE_LABELS: Record<BonusType, { ar: string; en: string; color: string }> = {
  performance: { ar: 'مكافأة أداء', en: 'Performance Bonus', color: 'blue' },
  annual: { ar: 'مكافأة سنوية', en: 'Annual Bonus', color: 'purple' },
  project: { ar: 'مكافأة مشروع', en: 'Project Bonus', color: 'teal' },
  retention: { ar: 'مكافأة استبقاء', en: 'Retention Bonus', color: 'amber' },
  signing: { ar: 'مكافأة توقيع', en: 'Signing Bonus', color: 'green' },
  referral: { ar: 'مكافأة إحالة', en: 'Referral Bonus', color: 'cyan' },
  spot: { ar: 'مكافأة فورية', en: 'Spot Bonus', color: 'orange' },
  profit_sharing: { ar: 'مشاركة أرباح', en: 'Profit Sharing', color: 'emerald' },
}

export const BONUS_STATUS_LABELS: Record<BonusStatus, { ar: string; en: string; color: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'gray' },
  pending_approval: { ar: 'بانتظار الموافقة', en: 'Pending Approval', color: 'amber' },
  approved: { ar: 'معتمد', en: 'Approved', color: 'blue' },
  scheduled: { ar: 'مجدول', en: 'Scheduled', color: 'purple' },
  processing: { ar: 'قيد المعالجة', en: 'Processing', color: 'cyan' },
  paid: { ar: 'مدفوع', en: 'Paid', color: 'emerald' },
  cancelled: { ar: 'ملغى', en: 'Cancelled', color: 'gray' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'red' },
}

export const CALCULATION_METHOD_LABELS: Record<CalculationMethod, { ar: string; en: string }> = {
  fixed_amount: { ar: 'مبلغ ثابت', en: 'Fixed Amount' },
  percentage_of_salary: { ar: 'نسبة من الراتب', en: 'Percentage of Salary' },
  performance_multiplier: { ar: 'مضاعف الأداء', en: 'Performance Multiplier' },
  target_based: { ar: 'مبني على الأهداف', en: 'Target Based' },
  discretionary: { ar: 'تقديري', en: 'Discretionary' },
}

export const PAYMENT_TIMING_LABELS: Record<PaymentTiming, { ar: string; en: string }> = {
  immediate: { ar: 'فوري', en: 'Immediate' },
  next_payroll: { ar: 'مع الراتب القادم', en: 'Next Payroll' },
  scheduled_date: { ar: 'تاريخ محدد', en: 'Scheduled Date' },
  with_salary: { ar: 'مع الراتب', en: 'With Salary' },
}

// ==================== API FUNCTIONS ====================

/**
 * Get bonuses list
 * GET /hr/payroll/bonuses
 */
export const getBonuses = async (
  filters?: BonusFilters
): Promise<{
  data: BonusRecord[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}> => {
  const params = new URLSearchParams()
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.bonusType) params.append('bonusType', filters.bonusType)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.department) params.append('department', filters.department)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.fiscalYear) params.append('fiscalYear', filters.fiscalYear)
  if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString())
  if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString())
  if (filters?.payrollRunId) params.append('payrollRunId', filters.payrollRunId)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/payroll/bonuses?${params.toString()}`)
  return response.data
}

/**
 * Get single bonus record
 * GET /hr/payroll/bonuses/:id
 */
export const getBonus = async (bonusId: string): Promise<BonusRecord> => {
  const response = await api.get(`/hr/payroll/bonuses/${bonusId}`)
  return response.data
}

/**
 * Create bonus
 * POST /hr/payroll/bonuses
 */
export const createBonus = async (data: CreateBonusData): Promise<BonusRecord> => {
  const response = await api.post('/hr/payroll/bonuses', data)
  return response.data
}

/**
 * Update bonus
 * PATCH /hr/payroll/bonuses/:id
 */
export const updateBonus = async (
  bonusId: string,
  data: Partial<CreateBonusData>
): Promise<BonusRecord> => {
  const response = await api.patch(`/hr/payroll/bonuses/${bonusId}`, data)
  return response.data
}

/**
 * Delete bonus
 * DELETE /hr/payroll/bonuses/:id
 */
export const deleteBonus = async (bonusId: string): Promise<void> => {
  await api.delete(`/hr/payroll/bonuses/${bonusId}`)
}

/**
 * Create bulk bonuses
 * POST /hr/payroll/bonuses/bulk
 */
export const createBulkBonuses = async (data: BulkBonusData): Promise<BonusBatch> => {
  const response = await api.post('/hr/payroll/bonuses/bulk', data)
  return response.data
}

/**
 * Submit bonus for approval
 * POST /hr/payroll/bonuses/:id/submit
 */
export const submitBonusForApproval = async (bonusId: string): Promise<BonusRecord> => {
  const response = await api.post(`/hr/payroll/bonuses/${bonusId}/submit`)
  return response.data
}

/**
 * Approve bonus
 * POST /hr/payroll/bonuses/:id/approve
 */
export const approveBonus = async (
  bonusId: string,
  comments?: string
): Promise<BonusRecord> => {
  const response = await api.post(`/hr/payroll/bonuses/${bonusId}/approve`, { comments })
  return response.data
}

/**
 * Reject bonus
 * POST /hr/payroll/bonuses/:id/reject
 */
export const rejectBonus = async (
  bonusId: string,
  reason: string
): Promise<BonusRecord> => {
  const response = await api.post(`/hr/payroll/bonuses/${bonusId}/reject`, { reason })
  return response.data
}

/**
 * Bulk approve bonuses
 * POST /hr/payroll/bonuses/bulk-approve
 */
export const bulkApproveBonuses = async (
  bonusIds: string[],
  comments?: string
): Promise<{
  success: number
  failed: number
  results: Array<{
    bonusId: string
    status: 'approved' | 'failed'
    error?: string
  }>
}> => {
  const response = await api.post('/hr/payroll/bonuses/bulk-approve', { bonusIds, comments })
  return response.data
}

/**
 * Cancel bonus
 * POST /hr/payroll/bonuses/:id/cancel
 */
export const cancelBonus = async (
  bonusId: string,
  reason: string
): Promise<BonusRecord> => {
  const response = await api.post(`/hr/payroll/bonuses/${bonusId}/cancel`, { reason })
  return response.data
}

/**
 * Process bonus payment
 * POST /hr/payroll/bonuses/:id/process-payment
 */
export const processBonusPayment = async (
  bonusId: string,
  payrollRunId?: string
): Promise<BonusRecord> => {
  const response = await api.post(`/hr/payroll/bonuses/${bonusId}/process-payment`, { payrollRunId })
  return response.data
}

/**
 * Preview bonus calculation
 * POST /hr/payroll/bonuses/calculate-preview
 */
export const previewBonusCalculation = async (
  data: Omit<CreateBonusData, 'paymentTiming'>
): Promise<BonusCalculationPreview> => {
  const response = await api.post('/hr/payroll/bonuses/calculate-preview', data)
  return response.data
}

/**
 * Get bonus statistics
 * GET /hr/payroll/bonuses/stats
 */
export const getBonusStats = async (
  year?: number,
  department?: string
): Promise<BonusStats> => {
  const params = new URLSearchParams()
  if (year) params.append('year', year.toString())
  if (department) params.append('department', department)

  const response = await api.get(`/hr/payroll/bonuses/stats?${params.toString()}`)
  return response.data
}

/**
 * Get employee bonus history
 * GET /hr/payroll/bonuses/employee/:employeeId/history
 */
export const getEmployeeBonusHistory = async (
  employeeId: string,
  year?: number
): Promise<BonusRecord[]> => {
  const params = new URLSearchParams()
  if (year) params.append('year', year.toString())

  const response = await api.get(`/hr/payroll/bonuses/employee/${employeeId}/history?${params.toString()}`)
  return response.data
}

/**
 * Get pending bonus approvals
 * GET /hr/payroll/bonuses/pending-approvals
 */
export const getPendingBonusApprovals = async (): Promise<BonusRecord[]> => {
  const response = await api.get('/hr/payroll/bonuses/pending-approvals')
  return response.data
}

/**
 * Get bonus batches
 * GET /hr/payroll/bonuses/batches
 */
export const getBonusBatches = async (
  filters?: {
    bonusType?: BonusType
    status?: BonusStatus
    fiscalYear?: string
    page?: number
    limit?: number
  }
): Promise<{
  data: BonusBatch[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}> => {
  const params = new URLSearchParams()
  if (filters?.bonusType) params.append('bonusType', filters.bonusType)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.fiscalYear) params.append('fiscalYear', filters.fiscalYear)
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/hr/payroll/bonuses/batches?${params.toString()}`)
  return response.data
}

/**
 * Trigger clawback for a bonus
 * POST /hr/payroll/bonuses/:id/clawback
 */
export const triggerBonusClawback = async (
  bonusId: string,
  reason: string
): Promise<BonusRecord> => {
  const response = await api.post(`/hr/payroll/bonuses/${bonusId}/clawback`, { reason })
  return response.data
}

/**
 * Update vesting status for a bonus
 * POST /hr/payroll/bonuses/:id/vest
 */
export const vestBonus = async (
  bonusId: string,
  vestingDate: string
): Promise<BonusRecord> => {
  const response = await api.post(`/hr/payroll/bonuses/${bonusId}/vest`, { vestingDate })
  return response.data
}

/**
 * Export bonuses report
 * GET /hr/payroll/bonuses/export
 */
export const exportBonusesReport = async (
  filters?: BonusFilters,
  format: 'xlsx' | 'csv' | 'pdf' = 'xlsx'
): Promise<Blob> => {
  const params = new URLSearchParams()
  if (filters?.bonusType) params.append('bonusType', filters.bonusType)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.fiscalYear) params.append('fiscalYear', filters.fiscalYear)
  params.append('format', format)

  const response = await api.get(`/hr/payroll/bonuses/export?${params.toString()}`, {
    responseType: 'blob',
  })
  return response.data
}

// Default export
export default {
  getBonuses,
  getBonus,
  createBonus,
  updateBonus,
  deleteBonus,
  createBulkBonuses,
  submitBonusForApproval,
  approveBonus,
  rejectBonus,
  bulkApproveBonuses,
  cancelBonus,
  processBonusPayment,
  previewBonusCalculation,
  getBonusStats,
  getEmployeeBonusHistory,
  getPendingBonusApprovals,
  getBonusBatches,
  triggerBonusClawback,
  vestBonus,
  exportBonusesReport,
  BONUS_TYPE_LABELS,
  BONUS_STATUS_LABELS,
  CALCULATION_METHOD_LABELS,
  PAYMENT_TIMING_LABELS,
}

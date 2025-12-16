import api from './api'

// ==================== ENUMS & TYPES ====================

export type PlanStatus = 'draft' | 'active' | 'closed'
export type PlanPriority = 'high' | 'medium' | 'low'

// ==================== LABELS ====================

export const PLAN_STATUS_LABELS: Record<PlanStatus, { ar: string; en: string; color: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'slate' },
  active: { ar: 'نشط', en: 'Active', color: 'emerald' },
  closed: { ar: 'مغلق', en: 'Closed', color: 'red' },
}

export const PLAN_PRIORITY_LABELS: Record<PlanPriority, { ar: string; en: string; color: string }> = {
  high: { ar: 'عالي', en: 'High', color: 'red' },
  medium: { ar: 'متوسط', en: 'Medium', color: 'amber' },
  low: { ar: 'منخفض', en: 'Low', color: 'blue' },
}

// ==================== INTERFACES ====================

export interface StaffingPlanDetail {
  detailId: string

  // Department & Position
  departmentId: string
  departmentName: string
  departmentNameAr?: string

  designation: string
  designationAr?: string

  // Headcount
  numberOfPositions: number // planned
  currentCount: number // existing employees
  vacancies: number // calculated: planned - current

  // Budget
  estimatedCostPerPosition: number
  totalEstimatedBudget: number // calculated

  // Job opening link
  jobOpeningId?: string
  jobOpeningStatus?: string

  // Timeline
  expectedHireDate?: string
  priority: PlanPriority

  // Justification
  justification: string
  justificationAr?: string
}

export interface StaffingPlan {
  _id: string
  planId: string
  name: string
  nameAr?: string

  company?: string

  // Plan period
  fromDate: string
  toDate: string

  status: PlanStatus

  // Plan details (child table)
  staffingPlanDetails: StaffingPlanDetail[]

  // Totals
  totalVacancies: number
  totalEstimatedBudget: number
  totalCurrentCount: number

  // Approval
  approvedBy?: string
  approvedAt?: string

  notes: string
  notesAr?: string

  createdAt: string
  updatedAt: string
  createdBy: string
}

// ==================== FILTER INTERFACES ====================

export interface StaffingPlanFilters {
  status?: PlanStatus
  departmentId?: string
  fromDate?: string
  toDate?: string
  search?: string
  page?: number
  limit?: number
}

export interface VacanciesSummary {
  totalVacancies: number
  totalBudget: number
  byDepartment: Array<{
    departmentId: string
    departmentName: string
    departmentNameAr?: string
    vacancies: number
    budget: number
  }>
  byPriority: Array<{
    priority: PlanPriority
    count: number
    budget: number
  }>
  urgent: Array<{
    detailId: string
    planId: string
    planName: string
    departmentName: string
    designation: string
    vacancies: number
    expectedHireDate?: string
  }>
}

export interface PlanProgress {
  planId: string
  planName: string
  totalPositions: number
  currentFilled: number
  remainingVacancies: number
  progressPercentage: number
  details: Array<{
    detailId: string
    departmentName: string
    designation: string
    planned: number
    current: number
    vacancies: number
    hasJobOpening: boolean
    jobOpeningStatus?: string
  }>
}

export interface HeadcountData {
  departmentId: string
  designation: string
  currentCount: number
  activePositions: number
  filledPositions: number
}

// ==================== API FUNCTIONS ====================

export const staffingPlanService = {
  // ==================== STAFFING PLANS ====================

  // Get all staffing plans
  getStaffingPlans: async (filters?: StaffingPlanFilters) => {
    const response = await api.get<{ data: StaffingPlan[]; total: number; page: number; limit: number }>(
      '/hr/staffing-plans',
      { params: filters }
    )
    return response.data
  },

  // Get single staffing plan
  getStaffingPlan: async (planId: string) => {
    const response = await api.get<StaffingPlan>(`/hr/staffing-plans/${planId}`)
    return response.data
  },

  // Create staffing plan
  createStaffingPlan: async (data: Partial<StaffingPlan>) => {
    const response = await api.post<StaffingPlan>('/hr/staffing-plans', data)
    return response.data
  },

  // Update staffing plan
  updateStaffingPlan: async (planId: string, data: Partial<StaffingPlan>) => {
    const response = await api.patch<StaffingPlan>(`/hr/staffing-plans/${planId}`, data)
    return response.data
  },

  // Delete staffing plan
  deleteStaffingPlan: async (planId: string) => {
    const response = await api.delete(`/hr/staffing-plans/${planId}`)
    return response.data
  },

  // ==================== PLAN DETAILS ====================

  // Add plan detail
  addPlanDetail: async (planId: string, detail: Omit<StaffingPlanDetail, 'detailId' | 'vacancies' | 'totalEstimatedBudget'>) => {
    const response = await api.post<StaffingPlan>(`/hr/staffing-plans/${planId}/details`, detail)
    return response.data
  },

  // Update plan detail
  updatePlanDetail: async (planId: string, detailId: string, detail: Partial<StaffingPlanDetail>) => {
    const response = await api.patch<StaffingPlan>(`/hr/staffing-plans/${planId}/details/${detailId}`, detail)
    return response.data
  },

  // Remove plan detail
  removePlanDetail: async (planId: string, detailId: string) => {
    const response = await api.delete<StaffingPlan>(`/hr/staffing-plans/${planId}/details/${detailId}`)
    return response.data
  },

  // ==================== HEADCOUNT & VACANCIES ====================

  // Get current headcount for department & designation
  getCurrentHeadcount: async (departmentId: string, designation: string) => {
    const response = await api.get<HeadcountData>('/hr/staffing-plans/headcount', {
      params: { departmentId, designation }
    })
    return response.data
  },

  // Calculate vacancies (auto-calculated on backend, but can be triggered)
  calculateVacancies: async (planId: string) => {
    const response = await api.post<StaffingPlan>(`/hr/staffing-plans/${planId}/calculate-vacancies`)
    return response.data
  },

  // Get vacancies summary
  getVacanciesSummary: async () => {
    const response = await api.get<VacanciesSummary>('/hr/staffing-plans/vacancies-summary')
    return response.data
  },

  // Get plan progress
  getPlanProgress: async (planId: string) => {
    const response = await api.get<PlanProgress>(`/hr/staffing-plans/${planId}/progress`)
    return response.data
  },

  // ==================== JOB OPENINGS ====================

  // Create job opening from plan detail
  createJobOpeningFromPlan: async (planId: string, detailId: string) => {
    const response = await api.post<{ jobOpening: any; updatedPlan: StaffingPlan }>(
      `/hr/staffing-plans/${planId}/details/${detailId}/create-job-opening`
    )
    return response.data
  },

  // Link existing job opening to plan detail
  linkJobOpening: async (planId: string, detailId: string, jobOpeningId: string) => {
    const response = await api.post<StaffingPlan>(
      `/hr/staffing-plans/${planId}/details/${detailId}/link-job-opening`,
      { jobOpeningId }
    )
    return response.data
  },

  // Unlink job opening from plan detail
  unlinkJobOpening: async (planId: string, detailId: string) => {
    const response = await api.post<StaffingPlan>(
      `/hr/staffing-plans/${planId}/details/${detailId}/unlink-job-opening`
    )
    return response.data
  },

  // ==================== STATUS MANAGEMENT ====================

  // Activate plan
  activatePlan: async (planId: string) => {
    const response = await api.post<StaffingPlan>(`/hr/staffing-plans/${planId}/activate`)
    return response.data
  },

  // Close plan
  closePlan: async (planId: string, reason?: string) => {
    const response = await api.post<StaffingPlan>(`/hr/staffing-plans/${planId}/close`, { reason })
    return response.data
  },

  // Approve plan
  approvePlan: async (planId: string, notes?: string) => {
    const response = await api.post<StaffingPlan>(`/hr/staffing-plans/${planId}/approve`, { notes })
    return response.data
  },

  // ==================== STATS & REPORTING ====================

  // Get staffing plan stats
  getStaffingPlanStats: async () => {
    const response = await api.get<{
      totalPlans: number
      activePlans: number
      totalVacancies: number
      totalBudget: number
      byStatus: { status: PlanStatus; count: number }[]
      byDepartment: Array<{
        departmentId: string
        departmentName: string
        vacancies: number
        budget: number
      }>
    }>('/hr/staffing-plans/stats')
    return response.data
  },

  // Get active plans
  getActivePlans: async () => {
    const response = await api.get<StaffingPlan[]>('/hr/staffing-plans/active')
    return response.data
  },

  // Get plans by department
  getPlansByDepartment: async (departmentId: string) => {
    const response = await api.get<StaffingPlan[]>(`/hr/staffing-plans/department/${departmentId}`)
    return response.data
  },

  // Get urgent vacancies (high priority & soon expected hire date)
  getUrgentVacancies: async () => {
    const response = await api.get<Array<{
      planId: string
      planName: string
      detail: StaffingPlanDetail
      daysUntilHireDate: number
    }>>('/hr/staffing-plans/urgent-vacancies')
    return response.data
  },

  // Export staffing plans
  exportStaffingPlans: async (filters?: StaffingPlanFilters, format: 'pdf' | 'excel' = 'excel') => {
    const response = await api.get('/hr/staffing-plans/export', {
      params: { ...filters, format },
      responseType: 'blob'
    })
    return response.data
  },

  // Export vacancies report
  exportVacanciesReport: async (format: 'pdf' | 'excel' = 'excel') => {
    const response = await api.get('/hr/staffing-plans/vacancies-report', {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  },

  // ==================== BULK OPERATIONS ====================

  // Bulk update plan details
  bulkUpdateDetails: async (planId: string, updates: Array<{ detailId: string; data: Partial<StaffingPlanDetail> }>) => {
    const response = await api.post<StaffingPlan>(`/hr/staffing-plans/${planId}/bulk-update-details`, { updates })
    return response.data
  },

  // Bulk create job openings from plan
  bulkCreateJobOpenings: async (planId: string, detailIds: string[]) => {
    const response = await api.post<{ created: number; jobOpenings: any[] }>(
      `/hr/staffing-plans/${planId}/bulk-create-job-openings`,
      { detailIds }
    )
    return response.data
  },

  // Duplicate staffing plan
  duplicateStaffingPlan: async (planId: string, newPlanData?: { name: string; nameAr?: string; fromDate: string; toDate: string }) => {
    const response = await api.post<StaffingPlan>(`/hr/staffing-plans/${planId}/duplicate`, newPlanData)
    return response.data
  },
}

export default staffingPlanService

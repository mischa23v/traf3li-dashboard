import api from './api'

// ==================== TYPES & ENUMS ====================

// Benefit Type
export type BenefitType = 'health_insurance' | 'life_insurance' | 'disability_insurance' |
  'dental_insurance' | 'vision_insurance' | 'pension' | 'savings_plan' |
  'education_allowance' | 'transportation' | 'housing' | 'meal_allowance' |
  'mobile_allowance' | 'gym_membership' | 'professional_membership' | 'other'

// Benefit Category
export type BenefitCategory = 'insurance' | 'allowance' | 'retirement' | 'perks' |
  'flexible_benefits' | 'mandatory' | 'voluntary'

// Benefit Status
export type BenefitStatus = 'pending' | 'active' | 'suspended' | 'terminated' | 'expired'

// Enrollment Type
export type EnrollmentType = 'new_hire' | 'annual_enrollment' | 'qualifying_event' |
  'mid_year_change' | 're_enrollment'

// Coverage Level
export type CoverageLevel = 'employee_only' | 'employee_spouse' | 'employee_children' |
  'employee_family' | 'employee_parents'

// Provider Type
export type ProviderType = 'insurance_company' | 'fund' | 'company_managed' | 'third_party'

// Payment Frequency
export type PaymentFrequency = 'monthly' | 'quarterly' | 'annual' | 'one_time' | 'as_incurred'

// ==================== LABELS ====================

export const BENEFIT_TYPE_LABELS: Record<BenefitType, { ar: string; en: string; color: string; icon: string }> = {
  health_insurance: { ar: 'تأمين صحي', en: 'Health Insurance', color: 'blue', icon: 'Heart' },
  life_insurance: { ar: 'تأمين على الحياة', en: 'Life Insurance', color: 'purple', icon: 'Shield' },
  disability_insurance: { ar: 'تأمين ضد العجز', en: 'Disability Insurance', color: 'indigo', icon: 'Accessibility' },
  dental_insurance: { ar: 'تأمين أسنان', en: 'Dental Insurance', color: 'teal', icon: 'Smile' },
  vision_insurance: { ar: 'تأمين بصر', en: 'Vision Insurance', color: 'cyan', icon: 'Eye' },
  pension: { ar: 'معاش تقاعدي', en: 'Pension', color: 'amber', icon: 'Wallet' },
  savings_plan: { ar: 'خطة ادخار', en: 'Savings Plan', color: 'emerald', icon: 'PiggyBank' },
  education_allowance: { ar: 'بدل تعليم', en: 'Education Allowance', color: 'orange', icon: 'GraduationCap' },
  transportation: { ar: 'بدل مواصلات', en: 'Transportation', color: 'slate', icon: 'Car' },
  housing: { ar: 'بدل سكن', en: 'Housing', color: 'rose', icon: 'Home' },
  meal_allowance: { ar: 'بدل وجبات', en: 'Meal Allowance', color: 'lime', icon: 'Utensils' },
  mobile_allowance: { ar: 'بدل اتصالات', en: 'Mobile Allowance', color: 'sky', icon: 'Phone' },
  gym_membership: { ar: 'عضوية نادي رياضي', en: 'Gym Membership', color: 'red', icon: 'Dumbbell' },
  professional_membership: { ar: 'عضوية مهنية', en: 'Professional Membership', color: 'violet', icon: 'Award' },
  other: { ar: 'أخرى', en: 'Other', color: 'gray', icon: 'Package' },
}

export const BENEFIT_CATEGORY_LABELS: Record<BenefitCategory, { ar: string; en: string; color: string }> = {
  insurance: { ar: 'تأمين', en: 'Insurance', color: 'blue' },
  allowance: { ar: 'بدل', en: 'Allowance', color: 'emerald' },
  retirement: { ar: 'تقاعد', en: 'Retirement', color: 'amber' },
  perks: { ar: 'امتيازات', en: 'Perks', color: 'purple' },
  flexible_benefits: { ar: 'مزايا مرنة', en: 'Flexible Benefits', color: 'teal' },
  mandatory: { ar: 'إلزامي', en: 'Mandatory', color: 'red' },
  voluntary: { ar: 'اختياري', en: 'Voluntary', color: 'slate' },
}

export const BENEFIT_STATUS_LABELS: Record<BenefitStatus, { ar: string; en: string; color: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'slate' },
  active: { ar: 'نشط', en: 'Active', color: 'emerald' },
  suspended: { ar: 'موقوف', en: 'Suspended', color: 'amber' },
  terminated: { ar: 'منتهي', en: 'Terminated', color: 'red' },
  expired: { ar: 'منتهي الصلاحية', en: 'Expired', color: 'gray' },
}

export const ENROLLMENT_TYPE_LABELS: Record<EnrollmentType, { ar: string; en: string }> = {
  new_hire: { ar: 'موظف جديد', en: 'New Hire' },
  annual_enrollment: { ar: 'تسجيل سنوي', en: 'Annual Enrollment' },
  qualifying_event: { ar: 'حدث مؤهل', en: 'Qualifying Event' },
  mid_year_change: { ar: 'تغيير منتصف السنة', en: 'Mid-Year Change' },
  re_enrollment: { ar: 'إعادة تسجيل', en: 'Re-enrollment' },
}

export const COVERAGE_LEVEL_LABELS: Record<CoverageLevel, { ar: string; en: string }> = {
  employee_only: { ar: 'الموظف فقط', en: 'Employee Only' },
  employee_spouse: { ar: 'الموظف والزوج/ة', en: 'Employee + Spouse' },
  employee_children: { ar: 'الموظف والأطفال', en: 'Employee + Children' },
  employee_family: { ar: 'الموظف والعائلة', en: 'Employee + Family' },
  employee_parents: { ar: 'الموظف والوالدين', en: 'Employee + Parents' },
}

export const PAYMENT_FREQUENCY_LABELS: Record<PaymentFrequency, { ar: string; en: string }> = {
  monthly: { ar: 'شهري', en: 'Monthly' },
  quarterly: { ar: 'ربع سنوي', en: 'Quarterly' },
  annual: { ar: 'سنوي', en: 'Annual' },
  one_time: { ar: 'مرة واحدة', en: 'One Time' },
  as_incurred: { ar: 'عند الحدوث', en: 'As Incurred' },
}

// ==================== INTERFACES ====================

// Covered Dependent
export interface CoveredDependent {
  memberId: string
  name: string
  nameAr?: string
  relationship: 'spouse' | 'child' | 'parent' | 'other'
  dateOfBirth: string
  age: number
  startDate: string
  endDate?: string
  active: boolean
  documentsVerified: boolean
  verificationDate?: string
}

// Beneficiary
export interface Beneficiary {
  beneficiaryId: string
  beneficiaryType: 'primary' | 'contingent'
  name: string
  nameAr?: string
  relationship: string
  dateOfBirth?: string
  nationalId?: string
  contactPhone?: string
  contactEmail?: string
  percentage: number
  designation: number
}

// Health Insurance Details
export interface HealthInsuranceDetails {
  insuranceProvider: string
  policyNumber: string
  groupNumber?: string
  memberNumber: string
  memberId: string
  cardNumber?: string
  cardExpiryDate?: string
  coverageType: 'individual' | 'family'
  planType: 'basic' | 'standard' | 'premium' | 'executive'
  networkType: 'in_network' | 'out_of_network' | 'both'
  annualDeductible?: number
  copayPercentage?: number
  annualMaximum?: number
  inpatientCoverage: boolean
  inpatientLimit?: number
  outpatientCoverage: boolean
  outpatientLimit?: number
  maternityCoverage: boolean
  dentalCoverage: boolean
  visionCoverage: boolean
  preAuthRequired: boolean
  geographicCoverage: 'saudi_only' | 'gcc' | 'mena' | 'worldwide'
}

// Life Insurance Details
export interface LifeInsuranceDetails {
  insuranceProvider: string
  policyNumber: string
  certificateNumber?: string
  coverageAmount: number
  coverageMultiple?: number
  coverageType: 'term' | 'whole_life' | 'group_term'
  accidentalDeath: boolean
  accidentalDeathMultiplier?: number
  criticalIllness: boolean
  criticalIllnessBenefit?: number
  primaryBeneficiaries: number
  contingentBeneficiaries: number
}

// Allowance Details
export interface AllowanceDetails {
  allowanceType: string
  allowanceName: string
  allowanceNameAr?: string
  allowanceAmount: number
  calculationType: 'fixed' | 'percentage_of_salary' | 'tiered' | 'reimbursement'
  percentageOfSalary?: number
  paymentFrequency: PaymentFrequency
  annualLimit?: number
  usedToDate: number
  remainingLimit?: number
  taxable: boolean
  includedInGOSI: boolean
  includedInEOSB: boolean
}

// Cost Breakdown
export interface CostBreakdown {
  employeeCost: {
    monthlyDeduction: number
    annualCost: number
    preTaxDeduction: boolean
    deductedFromPayroll: boolean
    ytdDeductions: number
  }
  employerCost: {
    monthlyCost: number
    annualCost: number
    ytdCost: number
  }
  totalBenefitValue: number
  employerSharePercentage: number
  employeeSharePercentage: number
}

// Employee Benefit
export interface EmployeeBenefit {
  _id: string
  benefitEnrollmentId: string
  enrollmentNumber: string

  // Employee
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  department?: string

  // Benefit Details
  benefitType: BenefitType
  benefitCategory: BenefitCategory
  benefitName: string
  benefitNameAr?: string
  benefitDescription?: string
  benefitDescriptionAr?: string

  // Plan Details
  planId?: string
  planCode?: string
  planName?: string
  planNameAr?: string

  // Provider
  providerType?: ProviderType
  providerName?: string
  providerNameAr?: string
  providerContact?: {
    contactPerson?: string
    email?: string
    phone?: string
    website?: string
  }

  // Enrollment
  enrollmentType: EnrollmentType
  enrollmentDate: string
  effectiveDate: string
  coverageEndDate?: string

  // Coverage Level
  coverageLevel?: CoverageLevel
  coveredDependents?: CoveredDependent[]
  beneficiaries?: Beneficiary[]

  // Status
  status: BenefitStatus
  statusDate: string
  statusReason?: string

  // Cost
  employerCost: number
  employeeCost: number
  totalCost?: number
  currency: string
  costBreakdown?: CostBreakdown

  // Type-specific details
  healthInsurance?: HealthInsuranceDetails
  lifeInsurance?: LifeInsuranceDetails
  allowance?: AllowanceDetails

  // Compliance
  cchiCompliant?: boolean
  cchiRegistrationNumber?: string
  gosiReported?: boolean

  // Notes
  notes?: {
    employeeNotes?: string
    hrNotes?: string
    internalNotes?: string
  }

  // Audit
  createdOn: string
  createdBy: string
  updatedOn?: string
  updatedBy?: string
}

// Filters
export interface BenefitFilters {
  search?: string
  employeeId?: string
  benefitType?: BenefitType
  benefitCategory?: BenefitCategory
  status?: BenefitStatus
  enrollmentType?: EnrollmentType
  providerName?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Stats
export interface BenefitStats {
  totalBenefits: number
  activeEnrollments: number
  pendingEnrollments: number
  totalEmployerCost: number
  totalEmployeeCost: number
  byType: Record<BenefitType, number>
  byCategory: Record<BenefitCategory, number>
  byStatus: Record<BenefitStatus, number>
  mostPopularBenefits: Array<{ type: BenefitType; count: number }>
  coverageRate: number
  averageBenefitValue: number
}

// Create Benefit Data
export interface CreateBenefitData {
  employeeId: string
  employeeName: string
  employeeNameAr?: string
  employeeNumber?: string
  department?: string

  benefitType: BenefitType
  benefitCategory?: BenefitCategory
  benefitName: string
  benefitNameAr?: string
  benefitDescription?: string
  benefitDescriptionAr?: string

  planId?: string
  planName?: string
  planNameAr?: string

  providerType?: ProviderType
  providerName?: string
  providerNameAr?: string
  providerContact?: {
    contactPerson?: string
    email?: string
    phone?: string
  }

  enrollmentType: EnrollmentType
  enrollmentDate: string
  effectiveDate: string
  coverageEndDate?: string

  coverageLevel?: CoverageLevel
  coveredDependents?: Omit<CoveredDependent, 'memberId'>[]
  beneficiaries?: Omit<Beneficiary, 'beneficiaryId'>[]

  employerCost: number
  employeeCost: number
  currency?: string

  healthInsurance?: Partial<HealthInsuranceDetails>
  lifeInsurance?: Partial<LifeInsuranceDetails>
  allowance?: Partial<AllowanceDetails>

  notes?: {
    employeeNotes?: string
    hrNotes?: string
  }
}

// Update Benefit Data
export interface UpdateBenefitData extends Partial<CreateBenefitData> {
  status?: BenefitStatus
  statusReason?: string
}

// ==================== API FUNCTIONS ====================

// Get all benefits
export const getBenefits = async (filters?: BenefitFilters) => {
  const response = await api.get<{ data: EmployeeBenefit[]; total: number; page: number; totalPages: number }>('/hr/employee-benefits', { params: filters })
  return response.data
}

// Get single benefit
export const getBenefit = async (benefitId: string) => {
  const response = await api.get<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}`)
  return response.data
}

// Get benefit stats
export const getBenefitStats = async () => {
  const response = await api.get<BenefitStats>('/hr/employee-benefits/stats')
  return response.data
}

// Get expiring benefits
export const getExpiringBenefits = async (days: number = 30) => {
  const response = await api.get<EmployeeBenefit[]>(`/hr/employee-benefits/expiring?days=${days}`)
  return response.data
}

// Get cost summary
export const getBenefitCostSummary = async () => {
  const response = await api.get<any>('/hr/employee-benefits/cost-summary')
  return response.data
}

// Get employee benefits
export const getEmployeeBenefits = async (employeeId: string) => {
  const response = await api.get<EmployeeBenefit[]>(`/hr/employee-benefits/employee/${employeeId}`)
  return response.data
}

// Create benefit enrollment
export const createBenefit = async (data: CreateBenefitData) => {
  const response = await api.post<EmployeeBenefit>('/hr/employee-benefits', data)
  return response.data
}

// Update benefit
export const updateBenefit = async (benefitId: string, data: UpdateBenefitData) => {
  const response = await api.patch<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}`, data)
  return response.data
}

// Delete benefit
export const deleteBenefit = async (benefitId: string) => {
  const response = await api.delete(`/hr/employee-benefits/${benefitId}`)
  return response.data
}

// Bulk delete benefits
export const bulkDeleteBenefits = async (ids: string[]) => {
  const response = await api.post('/hr/employee-benefits/bulk-delete', { ids })
  return response.data
}

// Activate benefit
export const activateBenefit = async (benefitId: string, data?: { notes?: string }) => {
  const response = await api.post<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}/activate`, data)
  return response.data
}

// Suspend benefit
export const suspendBenefit = async (benefitId: string, data: { reason: string }) => {
  const response = await api.post<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}/suspend`, data)
  return response.data
}

// Terminate benefit
export const terminateBenefit = async (benefitId: string, data: { reason: string; terminationDate?: string }) => {
  const response = await api.post<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}/terminate`, data)
  return response.data
}

// Add dependent
export const addDependent = async (benefitId: string, data: Omit<CoveredDependent, 'memberId'>) => {
  const response = await api.post<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}/dependents`, data)
  return response.data
}

// Remove dependent
export const removeDependent = async (benefitId: string, memberId: string) => {
  const response = await api.delete<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}/dependents/${memberId}`)
  return response.data
}

// Add beneficiary
export const addBeneficiary = async (benefitId: string, data: Omit<Beneficiary, 'beneficiaryId'>) => {
  const response = await api.post<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}/beneficiaries`, data)
  return response.data
}

// Update beneficiary
export const updateBeneficiary = async (benefitId: string, beneficiaryId: string, data: Partial<Beneficiary>) => {
  const response = await api.patch<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}/beneficiaries/${beneficiaryId}`, data)
  return response.data
}

// Remove beneficiary
export const removeBeneficiary = async (benefitId: string, beneficiaryId: string) => {
  const response = await api.delete<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}/beneficiaries/${beneficiaryId}`)
  return response.data
}

// Submit claim
export const submitClaim = async (benefitId: string, data: any) => {
  const response = await api.post<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}/claims`, data)
  return response.data
}

// Update claim status
export const updateClaimStatus = async (benefitId: string, claimId: string, data: any) => {
  const response = await api.patch<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}/claims/${claimId}`, data)
  return response.data
}

// Request pre-authorization
export const requestPreAuth = async (benefitId: string, data: any) => {
  const response = await api.post<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}/pre-auth`, data)
  return response.data
}

// Report qualifying event
export const reportQualifyingEvent = async (benefitId: string, data: any) => {
  const response = await api.post<EmployeeBenefit>(`/hr/employee-benefits/${benefitId}/qualifying-events`, data)
  return response.data
}

// Export benefits
export const exportBenefits = async (filters?: BenefitFilters) => {
  const response = await api.get('/hr/employee-benefits/export', {
    params: filters,
    responseType: 'blob'
  })
  return response.data
}

export default {
  getBenefits,
  getBenefit,
  getBenefitStats,
  getExpiringBenefits,
  getBenefitCostSummary,
  getEmployeeBenefits,
  createBenefit,
  updateBenefit,
  deleteBenefit,
  bulkDeleteBenefits,
  activateBenefit,
  suspendBenefit,
  terminateBenefit,
  addDependent,
  removeDependent,
  addBeneficiary,
  updateBeneficiary,
  removeBeneficiary,
  submitClaim,
  updateClaimStatus,
  requestPreAuth,
  reportQualifyingEvent,
  exportBenefits,
}

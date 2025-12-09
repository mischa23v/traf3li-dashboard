import api from './api'

// ==================== ENUMS ====================

export enum CompensationStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  HISTORICAL = 'historical',
  CANCELLED = 'cancelled'
}

export enum PaymentFrequency {
  MONTHLY = 'monthly',
  BI_WEEKLY = 'bi_weekly',
  WEEKLY = 'weekly'
}

export enum SalaryBasis {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  HOURLY = 'hourly',
  DAILY = 'daily'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CHECK = 'check'
}

export enum CalculationType {
  FIXED = 'fixed',
  PERCENTAGE_OF_BASIC = 'percentage_of_basic'
}

export enum AllowanceType {
  HOUSING = 'housing',
  TRANSPORTATION = 'transportation',
  MOBILE = 'mobile',
  EDUCATION = 'education',
  MEAL = 'meal',
  COST_OF_LIVING = 'cost_of_living',
  SHIFT = 'shift',
  HAZARD = 'hazard',
  PROFESSIONAL = 'professional',
  LANGUAGE = 'language',
  CLOTHING = 'clothing',
  RELOCATION = 'relocation',
  UTILITIES = 'utilities',
  OTHER = 'other'
}

export enum BonusType {
  DISCRETIONARY = 'discretionary',
  PERFORMANCE_BASED = 'performance_based',
  PROFIT_SHARING = 'profit_sharing',
  GUARANTEED = 'guaranteed'
}

export enum ChangeType {
  NEW_HIRE = 'new_hire',
  MERIT_INCREASE = 'merit_increase',
  PROMOTION = 'promotion',
  MARKET_ADJUSTMENT = 'market_adjustment',
  COST_OF_LIVING = 'cost_of_living',
  RETENTION = 'retention',
  EQUITY_ADJUSTMENT = 'equity_adjustment',
  RECLASSIFICATION = 'reclassification',
  DEMOTION = 'demotion',
  CORRECTION = 'correction',
  OTHER = 'other'
}

export enum ReviewStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  IMPLEMENTED = 'implemented',
  DEFERRED = 'deferred',
  DECLINED = 'declined'
}

export enum CompaRatioCategory {
  BELOW_RANGE = 'below_range',
  IN_RANGE_LOW = 'in_range_low',
  IN_RANGE_MID = 'in_range_mid',
  IN_RANGE_HIGH = 'in_range_high',
  ABOVE_RANGE = 'above_range'
}

export enum CompensationModel {
  SALARY = 'salary',
  SALARY_PLUS_BONUS = 'salary_plus_bonus',
  EAT_WHAT_YOU_KILL = 'eat_what_you_kill',
  LOCKSTEP = 'lockstep',
  MODIFIED_LOCKSTEP = 'modified_lockstep',
  HYBRID = 'hybrid'
}

export enum PartnershipTier {
  EQUITY_PARTNER = 'equity_partner',
  NON_EQUITY_PARTNER = 'non_equity_partner',
  INCOME_PARTNER = 'income_partner',
  OF_COUNSEL = 'of_counsel'
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract'
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed'
}

// ==================== LABELS ====================

export const compensationStatusLabels: Record<CompensationStatus, { ar: string; en: string }> = {
  [CompensationStatus.ACTIVE]: { ar: 'نشط', en: 'Active' },
  [CompensationStatus.PENDING]: { ar: 'قيد الانتظار', en: 'Pending' },
  [CompensationStatus.HISTORICAL]: { ar: 'تاريخي', en: 'Historical' },
  [CompensationStatus.CANCELLED]: { ar: 'ملغى', en: 'Cancelled' }
}

export const paymentFrequencyLabels: Record<PaymentFrequency, { ar: string; en: string }> = {
  [PaymentFrequency.MONTHLY]: { ar: 'شهري', en: 'Monthly' },
  [PaymentFrequency.BI_WEEKLY]: { ar: 'نصف شهري', en: 'Bi-Weekly' },
  [PaymentFrequency.WEEKLY]: { ar: 'أسبوعي', en: 'Weekly' }
}

export const salaryBasisLabels: Record<SalaryBasis, { ar: string; en: string }> = {
  [SalaryBasis.MONTHLY]: { ar: 'شهري', en: 'Monthly' },
  [SalaryBasis.ANNUAL]: { ar: 'سنوي', en: 'Annual' },
  [SalaryBasis.HOURLY]: { ar: 'بالساعة', en: 'Hourly' },
  [SalaryBasis.DAILY]: { ar: 'يومي', en: 'Daily' }
}

export const paymentMethodLabels: Record<PaymentMethod, { ar: string; en: string }> = {
  [PaymentMethod.BANK_TRANSFER]: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
  [PaymentMethod.CASH]: { ar: 'نقدي', en: 'Cash' },
  [PaymentMethod.CHECK]: { ar: 'شيك', en: 'Check' }
}

export const calculationTypeLabels: Record<CalculationType, { ar: string; en: string }> = {
  [CalculationType.FIXED]: { ar: 'ثابت', en: 'Fixed' },
  [CalculationType.PERCENTAGE_OF_BASIC]: { ar: 'نسبة من الراتب', en: 'Percentage of Basic' }
}

export const allowanceTypeLabels: Record<AllowanceType, { ar: string; en: string }> = {
  [AllowanceType.HOUSING]: { ar: 'سكن', en: 'Housing' },
  [AllowanceType.TRANSPORTATION]: { ar: 'مواصلات', en: 'Transportation' },
  [AllowanceType.MOBILE]: { ar: 'جوال', en: 'Mobile' },
  [AllowanceType.EDUCATION]: { ar: 'تعليم', en: 'Education' },
  [AllowanceType.MEAL]: { ar: 'وجبات', en: 'Meal' },
  [AllowanceType.COST_OF_LIVING]: { ar: 'غلاء معيشة', en: 'Cost of Living' },
  [AllowanceType.SHIFT]: { ar: 'نوبات', en: 'Shift' },
  [AllowanceType.HAZARD]: { ar: 'مخاطر', en: 'Hazard' },
  [AllowanceType.PROFESSIONAL]: { ar: 'مهني', en: 'Professional' },
  [AllowanceType.LANGUAGE]: { ar: 'لغة', en: 'Language' },
  [AllowanceType.CLOTHING]: { ar: 'ملابس', en: 'Clothing' },
  [AllowanceType.RELOCATION]: { ar: 'انتقال', en: 'Relocation' },
  [AllowanceType.UTILITIES]: { ar: 'خدمات', en: 'Utilities' },
  [AllowanceType.OTHER]: { ar: 'أخرى', en: 'Other' }
}

export const bonusTypeLabels: Record<BonusType, { ar: string; en: string }> = {
  [BonusType.DISCRETIONARY]: { ar: 'تقديري', en: 'Discretionary' },
  [BonusType.PERFORMANCE_BASED]: { ar: 'مبني على الأداء', en: 'Performance Based' },
  [BonusType.PROFIT_SHARING]: { ar: 'مشاركة أرباح', en: 'Profit Sharing' },
  [BonusType.GUARANTEED]: { ar: 'مضمون', en: 'Guaranteed' }
}

export const changeTypeLabels: Record<ChangeType, { ar: string; en: string }> = {
  [ChangeType.NEW_HIRE]: { ar: 'تعيين جديد', en: 'New Hire' },
  [ChangeType.MERIT_INCREASE]: { ar: 'زيادة استحقاقية', en: 'Merit Increase' },
  [ChangeType.PROMOTION]: { ar: 'ترقية', en: 'Promotion' },
  [ChangeType.MARKET_ADJUSTMENT]: { ar: 'تعديل سوقي', en: 'Market Adjustment' },
  [ChangeType.COST_OF_LIVING]: { ar: 'غلاء معيشة', en: 'Cost of Living' },
  [ChangeType.RETENTION]: { ar: 'استبقاء', en: 'Retention' },
  [ChangeType.EQUITY_ADJUSTMENT]: { ar: 'تعديل عدالة', en: 'Equity Adjustment' },
  [ChangeType.RECLASSIFICATION]: { ar: 'إعادة تصنيف', en: 'Reclassification' },
  [ChangeType.DEMOTION]: { ar: 'تخفيض', en: 'Demotion' },
  [ChangeType.CORRECTION]: { ar: 'تصحيح', en: 'Correction' },
  [ChangeType.OTHER]: { ar: 'أخرى', en: 'Other' }
}

export const reviewStatusLabels: Record<ReviewStatus, { ar: string; en: string }> = {
  [ReviewStatus.NOT_STARTED]: { ar: 'لم يبدأ', en: 'Not Started' },
  [ReviewStatus.IN_PROGRESS]: { ar: 'قيد التنفيذ', en: 'In Progress' },
  [ReviewStatus.PENDING_APPROVAL]: { ar: 'بانتظار الموافقة', en: 'Pending Approval' },
  [ReviewStatus.APPROVED]: { ar: 'معتمد', en: 'Approved' },
  [ReviewStatus.IMPLEMENTED]: { ar: 'منفذ', en: 'Implemented' },
  [ReviewStatus.DEFERRED]: { ar: 'مؤجل', en: 'Deferred' },
  [ReviewStatus.DECLINED]: { ar: 'مرفوض', en: 'Declined' }
}

export const compaRatioCategoryLabels: Record<CompaRatioCategory, { ar: string; en: string }> = {
  [CompaRatioCategory.BELOW_RANGE]: { ar: 'أقل من النطاق', en: 'Below Range' },
  [CompaRatioCategory.IN_RANGE_LOW]: { ar: 'في النطاق (منخفض)', en: 'In Range (Low)' },
  [CompaRatioCategory.IN_RANGE_MID]: { ar: 'في النطاق (متوسط)', en: 'In Range (Mid)' },
  [CompaRatioCategory.IN_RANGE_HIGH]: { ar: 'في النطاق (عالي)', en: 'In Range (High)' },
  [CompaRatioCategory.ABOVE_RANGE]: { ar: 'أعلى من النطاق', en: 'Above Range' }
}

export const compensationModelLabels: Record<CompensationModel, { ar: string; en: string }> = {
  [CompensationModel.SALARY]: { ar: 'راتب ثابت', en: 'Salary' },
  [CompensationModel.SALARY_PLUS_BONUS]: { ar: 'راتب + مكافأة', en: 'Salary + Bonus' },
  [CompensationModel.EAT_WHAT_YOU_KILL]: { ar: 'حسب الإنتاج', en: 'Eat What You Kill' },
  [CompensationModel.LOCKSTEP]: { ar: 'تدريجي', en: 'Lockstep' },
  [CompensationModel.MODIFIED_LOCKSTEP]: { ar: 'تدريجي معدل', en: 'Modified Lockstep' },
  [CompensationModel.HYBRID]: { ar: 'هجين', en: 'Hybrid' }
}

export const partnershipTierLabels: Record<PartnershipTier, { ar: string; en: string }> = {
  [PartnershipTier.EQUITY_PARTNER]: { ar: 'شريك حصة', en: 'Equity Partner' },
  [PartnershipTier.NON_EQUITY_PARTNER]: { ar: 'شريك بدون حصة', en: 'Non-Equity Partner' },
  [PartnershipTier.INCOME_PARTNER]: { ar: 'شريك دخل', en: 'Income Partner' },
  [PartnershipTier.OF_COUNSEL]: { ar: 'مستشار', en: 'Of Counsel' }
}

export const employmentTypeLabels: Record<EmploymentType, { ar: string; en: string }> = {
  [EmploymentType.FULL_TIME]: { ar: 'دوام كامل', en: 'Full Time' },
  [EmploymentType.PART_TIME]: { ar: 'دوام جزئي', en: 'Part Time' },
  [EmploymentType.CONTRACT]: { ar: 'عقد', en: 'Contract' }
}

export const maritalStatusLabels: Record<MaritalStatus, { ar: string; en: string }> = {
  [MaritalStatus.SINGLE]: { ar: 'أعزب', en: 'Single' },
  [MaritalStatus.MARRIED]: { ar: 'متزوج', en: 'Married' },
  [MaritalStatus.DIVORCED]: { ar: 'مطلق', en: 'Divorced' },
  [MaritalStatus.WIDOWED]: { ar: 'أرمل', en: 'Widowed' }
}

// ==================== INTERFACES ====================

export interface Allowance {
  allowanceId?: string
  allowanceType: AllowanceType
  allowanceName: string
  allowanceNameAr?: string
  amount: number
  calculationType: CalculationType
  percentage?: number
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one_time'
  taxable: boolean
  includedInGOSI: boolean
  includedInEOSB: boolean
  eligibilityCriteria?: string
  startDate: string
  endDate?: string
  temporary: boolean
}

export interface SalaryHistoryItem {
  historyId?: string
  effectiveDate: string
  endDate?: string
  basicSalary: number
  allowances: number
  grossSalary: number
  changeType: ChangeType
  changeReason?: string
  increaseAmount?: number
  increasePercentage?: number
  previousSalary?: number
  performanceRating?: number
  promotionToJobTitle?: string
  approvedBy?: string
  approvalDate?: string
  annualizedImpact?: number
  notes?: string
}

export interface BonusHistory {
  year: number
  fiscalYear?: string
  targetBonus: number
  actualBonus: number
  payoutPercentage: number
  individualPerformance?: number
  departmentPerformance?: number
  companyPerformance?: number
  paymentDate?: string
  paid: boolean
}

export interface RecognitionAward {
  programId?: string
  programName: string
  programNameAr?: string
  programType: 'peer_recognition' | 'manager_recognition' | 'service_award' |
               'performance_award' | 'innovation_award' | 'values_award' | 'spot_award'
  awardDate: string
  awardedBy?: string
  awardCategory?: string
  awardDescription?: string
  monetaryValue?: number
  publicRecognition: boolean
  certificateUrl?: string
  notes?: string
}

export interface CompensationDocument {
  documentType: 'employment_contract' | 'offer_letter' | 'salary_review_form' |
                'increase_letter' | 'bonus_statement' | 'total_rewards_statement' |
                'compensation_plan' | 'commission_agreement' | 'stock_option_agreement' |
                'partner_agreement' | 'other'
  documentName: string
  documentNameAr?: string
  fileUrl: string
  version?: string
  effectiveDate?: string
  expiryDate?: string
  uploadedOn: string
  uploadedBy?: string
  signed: boolean
  signedDate?: string
  confidential: boolean
}

// ==================== MAIN INTERFACE ====================

export interface CompensationReward {
  // Identifiers
  compensationId: string
  recordNumber: string

  // Employee Information
  employeeId: string
  employeeNumber: string
  employeeName: string
  employeeNameAr?: string
  department?: string
  departmentId?: string
  jobTitle?: string
  jobTitleAr?: string

  // Current Compensation
  basicSalary: number
  totalAllowances: number
  grossSalary: number
  currency: string

  // Pay Grade
  payGrade: string
  salaryRangeMin: number
  salaryRangeMid?: number
  salaryRangeMax: number

  // Position in Range
  compaRatio: number
  compaRatioCategory?: CompaRatioCategory
  rangePenetration?: number

  // Status & Dates
  status: CompensationStatus
  effectiveDate: string
  reviewDate?: string
  nextReviewDate?: string

  // Payment Details
  paymentFrequency?: PaymentFrequency
  paymentMethod?: PaymentMethod
  salaryBasis?: SalaryBasis

  // Office
  officeId: string

  // Audit Fields
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string

  // ==================== ADVANCED FIELDS ====================

  // Employee Details
  employeeDetails?: {
    nationalId?: string
    jobLevel?: string
    jobGrade?: string
    location?: string
    employmentType?: EmploymentType
    contractType?: 'indefinite' | 'fixed_term'
    hireDate?: string
    tenure?: {
      years: number
      months: number
      totalMonths: number
    }
    employmentStatus?: 'active' | 'on_notice' | 'on_leave' | 'suspended'
    isSaudi?: boolean
    nationality?: string
    maritalStatus?: MaritalStatus
    numberOfDependents?: number
    managerId?: string
    managerName?: string
  }

  // Allowances
  allowances?: Allowance[]

  // Housing Allowance Details
  housingAllowance?: {
    provided: boolean
    amount: number
    calculationType: CalculationType
    percentage?: number
    taxable: boolean
    includedInGOSI: boolean
    includedInEOSB: boolean
    companyHousing?: boolean
    rentSubsidy?: boolean
  }

  // Transportation Allowance Details
  transportationAllowance?: {
    provided: boolean
    amount: number
    calculationType: CalculationType
    percentage?: number
    companyVehicle?: boolean
    fuelCard?: boolean
  }

  // Variable Compensation
  variableCompensation?: {
    eligibleForVariablePay: boolean
    annualBonus?: {
      eligible: boolean
      bonusType?: BonusType
      targetAmount?: number
      targetPercentage?: number
      bonusHistory?: BonusHistory[]
    }
    commission?: {
      eligible: boolean
      commissionRate?: number
      commissionBase?: string
      ytdCommission?: number
    }
    profitSharing?: {
      eligible: boolean
      allocationPercentage?: number
    }
    totalVariableTarget?: number
    totalVariableActual?: number
  }

  // Attorney Compensation
  attorneyCompensation?: {
    isAttorney: boolean
    compensationModel?: CompensationModel
    partnershipTier?: PartnershipTier
    equityPercentage?: number
    billableHoursTarget?: number
    ytdBillableHours?: number
    averageHourlyRate?: number
    realizationRate?: number
    collectionRate?: number
    originationCredits?: number
    bookOfBusinessValue?: number
    partnerDraw?: number
  }

  // Salary History
  salaryHistory?: SalaryHistoryItem[]

  // Salary Review
  salaryReview?: {
    eligibleForReview: boolean
    reviewStatus?: ReviewStatus
    lastReviewDate?: string
    nextReviewDate?: string
    recommendedIncrease?: number
    recommendedPercentage?: number
    approvedIncrease?: number
    approvedPercentage?: number
  }

  // Total Rewards
  totalRewards?: {
    totalCashCompensation: number
    totalDirectCompensation?: number
    benefitsValue?: number
    perksValue?: number
    totalRewardsValue?: number
  }

  // Recognition & Awards
  recognitionAwards?: RecognitionAward[]

  // Deductions
  deductions?: {
    gosiEmployeeContribution?: number
    gosiEmployerContribution?: number
    gosiContributionBase?: number
    totalStatutoryDeductions?: number
    totalVoluntaryDeductions?: number
    totalDeductions?: number
    netPay?: number
  }

  // Compliance
  compliance?: {
    saudiLaborLawCompliant: boolean
    minimumWageCompliant?: boolean
    eosbCompliant?: boolean
    timelyPayment?: boolean
    payEquityCompliant?: boolean
    violations?: string[]
  }

  // Documents
  documents?: CompensationDocument[]

  // Notes
  notes?: {
    compensationNotes?: string
    hrNotes?: string
    managerNotes?: string
    confidentialNotes?: string
    specialArrangements?: string
  }
}

// ==================== API FUNCTIONS ====================

export interface CompensationFilters {
  status?: CompensationStatus
  departmentId?: string
  payGrade?: string
  compaRatioCategory?: CompaRatioCategory
  officeId?: string
  eligibleForReview?: boolean
  hasBonus?: boolean
  isAttorney?: boolean
  search?: string
}

export interface CreateCompensationInput {
  // Required fields
  employeeId: string
  employeeNumber: string
  employeeName: string
  basicSalary: number
  totalAllowances: number
  grossSalary: number
  currency: string
  payGrade: string
  salaryRangeMin: number
  salaryRangeMax: number
  compaRatio: number
  status: CompensationStatus
  effectiveDate: string
  officeId: string

  // Optional basic fields
  employeeNameAr?: string
  department?: string
  departmentId?: string
  jobTitle?: string
  jobTitleAr?: string
  salaryRangeMid?: number
  compaRatioCategory?: CompaRatioCategory
  rangePenetration?: number
  reviewDate?: string
  nextReviewDate?: string
  paymentFrequency?: PaymentFrequency
  paymentMethod?: PaymentMethod
  salaryBasis?: SalaryBasis

  // Optional advanced fields
  employeeDetails?: CompensationReward['employeeDetails']
  allowances?: Allowance[]
  housingAllowance?: CompensationReward['housingAllowance']
  transportationAllowance?: CompensationReward['transportationAllowance']
  variableCompensation?: CompensationReward['variableCompensation']
  attorneyCompensation?: CompensationReward['attorneyCompensation']
  salaryHistory?: SalaryHistoryItem[]
  salaryReview?: CompensationReward['salaryReview']
  totalRewards?: CompensationReward['totalRewards']
  recognitionAwards?: RecognitionAward[]
  deductions?: CompensationReward['deductions']
  compliance?: CompensationReward['compliance']
  documents?: CompensationDocument[]
  notes?: CompensationReward['notes']
}

export type UpdateCompensationInput = Partial<CreateCompensationInput>

// API Functions
export const compensationApi = {
  // Get all compensation records with optional filters
  getAll: async (filters?: CompensationFilters): Promise<CompensationReward[]> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const queryString = params.toString()
    const url = queryString ? `/hr/compensation-rewards?${queryString}` : '/hr/compensation-rewards'
    const response = await api.get(url)
    return response.data
  },

  // Get a single compensation record by ID
  getById: async (id: string): Promise<CompensationReward> => {
    const response = await api.get(`/hr/compensation-rewards/${id}`)
    return response.data
  },

  // Get compensation by employee ID
  getByEmployee: async (employeeId: string): Promise<CompensationReward> => {
    const response = await api.get(`/hr/compensation-rewards/employee/${employeeId}`)
    return response.data
  },

  // Create a new compensation record
  create: async (data: CreateCompensationInput): Promise<CompensationReward> => {
    const response = await api.post('/hr/compensation-rewards', data)
    return response.data
  },

  // Update an existing compensation record
  update: async (id: string, data: UpdateCompensationInput): Promise<CompensationReward> => {
    const response = await api.patch(`/hr/compensation-rewards/${id}`, data)
    return response.data
  },

  // Delete a compensation record
  delete: async (id: string): Promise<void> => {
    await api.delete(`/hr/compensation-rewards/${id}`)
  },

  // Bulk delete compensation records
  bulkDelete: async (ids: string[]): Promise<void> => {
    await api.post('/hr/compensation-rewards/bulk-delete', { ids })
  },

  // Process salary increase
  processSalaryIncrease: async (id: string, data: {
    increaseAmount?: number
    increasePercentage?: number
    changeType: ChangeType
    changeReason?: string
    effectiveDate: string
  }): Promise<CompensationReward> => {
    const response = await api.post(`/hr/compensation-rewards/${id}/salary-increase`, data)
    return response.data
  },

  // Add allowance
  addAllowance: async (id: string, allowance: Omit<Allowance, 'allowanceId'>): Promise<CompensationReward> => {
    const response = await api.post(`/hr/compensation-rewards/${id}/allowances`, allowance)
    return response.data
  },

  // Update allowance
  updateAllowance: async (id: string, allowanceId: string, data: Partial<Allowance>): Promise<CompensationReward> => {
    const response = await api.patch(`/hr/compensation-rewards/${id}/allowances/${allowanceId}`, data)
    return response.data
  },

  // Remove allowance
  removeAllowance: async (id: string, allowanceId: string): Promise<CompensationReward> => {
    const response = await api.delete(`/hr/compensation-rewards/${id}/allowances/${allowanceId}`)
    return response.data
  },

  // Process bonus
  processBonus: async (id: string, data: {
    bonusType: BonusType
    targetAmount: number
    actualAmount: number
    year: number
    paymentDate?: string
  }): Promise<CompensationReward> => {
    const response = await api.post(`/hr/compensation-rewards/${id}/bonus`, data)
    return response.data
  },

  // Submit for salary review
  submitForReview: async (id: string): Promise<CompensationReward> => {
    const response = await api.post(`/hr/compensation-rewards/${id}/submit-review`)
    return response.data
  },

  // Approve salary review
  approveReview: async (id: string, data: {
    approvedIncrease: number
    approvedPercentage: number
    effectiveDate: string
    comments?: string
  }): Promise<CompensationReward> => {
    const response = await api.post(`/hr/compensation-rewards/${id}/approve-review`, data)
    return response.data
  },

  // Decline salary review
  declineReview: async (id: string, data: {
    reason: string
    comments?: string
  }): Promise<CompensationReward> => {
    const response = await api.post(`/hr/compensation-rewards/${id}/decline-review`, data)
    return response.data
  },

  // Add recognition award
  addRecognition: async (id: string, award: Omit<RecognitionAward, 'programId'>): Promise<CompensationReward> => {
    const response = await api.post(`/hr/compensation-rewards/${id}/recognition`, award)
    return response.data
  },

  // Get statistics
  getStats: async (officeId?: string): Promise<{
    totalRecords: number
    activeRecords: number
    averageBasicSalary: number
    averageGrossSalary: number
    averageCompaRatio: number
    pendingReviews: number
    belowRangeCount: number
    aboveRangeCount: number
    totalPayrollCost: number
    avgBonusPayout: number
  }> => {
    const url = officeId ? `/hr/compensation-rewards/stats?officeId=${officeId}` : '/hr/compensation-rewards/stats'
    const response = await api.get(url)
    return response.data
  },

  // Get pending reviews
  getPendingReviews: async (): Promise<Array<{
    compensationId: string
    employeeId: string
    employeeName: string
    employeeNameAr?: string
    department?: string
    currentSalary: number
    recommendedIncrease?: number
    recommendedPercentage?: number
    reviewStatus: ReviewStatus
    submissionDate: string
  }>> => {
    const response = await api.get('/hr/compensation-rewards/pending-reviews')
    return response.data
  },

  // Get department summary
  getDepartmentSummary: async (departmentId?: string): Promise<Array<{
    department: string
    employeeCount: number
    averageSalary: number
    totalPayroll: number
    averageCompaRatio: number
    pendingReviews: number
  }>> => {
    const url = departmentId
      ? `/hr/compensation-rewards/department-summary?departmentId=${departmentId}`
      : '/hr/compensation-rewards/department-summary'
    const response = await api.get(url)
    return response.data
  },

  // Get pay grade analysis
  getPayGradeAnalysis: async (payGrade: string): Promise<{
    payGrade: string
    employeeCount: number
    salaryRange: { min: number; mid: number; max: number }
    avgSalary: number
    avgCompaRatio: number
    distribution: { category: CompaRatioCategory; count: number }[]
  }> => {
    const response = await api.get(`/hr/compensation-rewards/pay-grade-analysis/${payGrade}`)
    return response.data
  },

  // Generate total rewards statement
  generateTotalRewardsStatement: async (id: string): Promise<{ statementUrl: string }> => {
    const response = await api.post(`/hr/compensation-rewards/${id}/total-rewards-statement`)
    return response.data
  },

  // Export compensation records
  exportCompensation: async (filters?: CompensationFilters): Promise<Blob> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const queryString = params.toString()
    const url = queryString ? `/hr/compensation-rewards/export?${queryString}` : '/hr/compensation-rewards/export'
    const response = await api.get(url, { responseType: 'blob' })
    return response.data
  }
}

export default compensationApi

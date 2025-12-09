import { apiClient } from '@/lib/api'

// ==================== ENUMS & TYPES ====================

export type NationalIdType = 'saudi_id' | 'iqama' | 'gcc_id' | 'passport'
export type Gender = 'male' | 'female'
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed'
export type EmploymentStatus = 'active' | 'on_leave' | 'suspended' | 'terminated'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'temporary'
export type ContractType = 'indefinite' | 'fixed_term'
export type ProbationStatus = 'active' | 'passed' | 'failed' | 'extended'
export type PaymentFrequency = 'monthly' | 'bi_weekly' | 'weekly'
export type PaymentMethod = 'bank_transfer' | 'cash' | 'check'
export type DocumentType = 'national_id' | 'iqama' | 'passport' | 'degree' | 'certificate' |
                          'contract' | 'bank_letter' | 'medical' | 'vaccine_certificate' |
                          'bar_admission' | 'driving_license' | 'other'

// ==================== INTERFACES ====================

export interface Address {
  city: string
  region: string
  country: string
  postalCode?: string
  streetAddress?: string
  district?: string
  buildingNumber?: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  alternatePhone?: string
}

export interface PersonalInfo {
  fullNameArabic: string
  fullNameEnglish?: string
  nationalId: string
  nationalIdType: NationalIdType
  nationalIdExpiry?: string
  nationality: string
  isSaudi: boolean
  gender: Gender
  dateOfBirth: string
  age?: number
  mobile: string
  email: string
  personalEmail?: string
  currentAddress: Address
  emergencyContact: EmergencyContact
  maritalStatus?: MaritalStatus
  numberOfDependents?: number
}

export interface WorkSchedule {
  weeklyHours: number
  dailyHours: number
  workDays: string[]
  restDay: string
  ramadanWeeklyHours?: number
  ramadanDailyHours?: number
  shiftBased?: boolean
  defaultShift?: string
}

export interface Tenure {
  years: number
  months: number
  totalMonths: number
  totalDays: number
}

export interface Employment {
  employmentStatus: EmploymentStatus
  jobTitle: string
  jobTitleArabic?: string
  employmentType: EmploymentType
  contractType: ContractType
  contractStartDate: string
  contractEndDate?: string
  contractDuration?: number
  contractNumber?: string
  probationPeriod: number
  probationStartDate?: string
  probationEndDate?: string
  onProbation: boolean
  probationStatus?: ProbationStatus
  hireDate: string
  confirmationDate?: string
  tenure?: Tenure
  workSchedule: WorkSchedule
  reportsTo?: string
  managerName?: string
  departmentId?: string
  departmentName?: string
}

export interface Allowance {
  allowanceName: string
  allowanceNameAr?: string
  amount: number
  taxable: boolean
  includedInEOSB: boolean
  includedInGOSI: boolean
}

export interface Allowances {
  housingAllowance?: number
  transportationAllowance?: number
  foodAllowance?: number
  mobileAllowance?: number
  otherAllowances?: Allowance[]
  totalAllowances: number
}

export interface BankDetails {
  bankName: string
  iban: string
  accountNumber?: string
  swiftCode?: string
}

export interface WPS {
  registered: boolean
  wpsMolId?: string
  wpsEstablishmentId?: string
}

export interface Compensation {
  basicSalary: number
  currency: string
  allowances: Allowances
  grossSalary: number
  paymentFrequency: PaymentFrequency
  paymentMethod: PaymentMethod
  paymentDay?: number
  bankDetails: BankDetails
  wps: WPS
}

export interface AnnualLeave {
  entitlement: number
  used: number
  pending: number
  remaining: number
  carryForward?: number
  maxCarryForward?: number
  lastResetDate?: string
}

export interface SickLeave {
  fullPayDaysUsed: number
  partialPayDaysUsed: number
  unpaidDaysUsed: number
  totalUsed: number
  remaining: number
  currentYearStart?: string
}

export interface HajjLeave {
  eligible: boolean
  taken: boolean
  takenDate?: string
}

export interface OtherLeaves {
  marriageLeaveUsed: boolean
  birthLeaveCount: number
  deathLeaveCount: number
  examLeaveUsed: number
  unpaidLeaveUsed: number
}

export interface Leave {
  annualLeave: AnnualLeave
  sickLeave: SickLeave
  hajjLeave: HajjLeave
  otherLeaves: OtherLeaves
}

export interface GOSI {
  registered: boolean
  gosiNumber?: string
  registrationDate?: string
  employeeContribution: number
  employerContribution: number
  lastContributionMonth?: string
}

export interface EmployeeDocument {
  _id?: string
  documentType: DocumentType
  documentName: string
  fileUrl: string
  uploadDate: string
  expiryDate?: string
  verified: boolean
  verifiedBy?: string
  verifiedOn?: string
}

export interface Audit {
  createdAt: string
  createdBy: string
  lastModifiedAt?: string
  lastModifiedBy?: string
}

// ==================== MAIN EMPLOYEE INTERFACE ====================

export interface Employee {
  _id: string
  employeeId: string
  employeeNumber: string
  personalInfo: PersonalInfo
  employment: Employment
  compensation: Compensation
  leave: Leave
  gosi: GOSI
  documents: EmployeeDocument[]
  isActive: boolean
  audit: Audit

  // Virtual fields
  fullName?: string
  avatar?: string
}

// ==================== API TYPES ====================

export interface EmployeeFilters {
  search?: string
  status?: EmploymentStatus | EmploymentStatus[]
  department?: string
  employmentType?: EmploymentType
  nationality?: string
  isSaudi?: boolean
  onProbation?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface EmployeesResponse {
  employees: Employee[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateEmployeeData {
  employeeNumber?: string
  personalInfo: Partial<PersonalInfo>
  employment: Partial<Employment>
  compensation?: Partial<Compensation>
  leave?: Partial<Leave>
  gosi?: Partial<GOSI>
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {}

export interface EmployeeStats {
  total: number
  active: number
  onLeave: number
  suspended: number
  terminated: number
  saudiCount: number
  nonSaudiCount: number
  saudizationRate: number
  onProbation: number
  byDepartment: { department: string; count: number }[]
  byEmploymentType: { type: string; count: number }[]
}

// ==================== SERVICE ====================

const hrService = {
  // ==================== EMPLOYEES ====================

  getEmployees: async (filters?: EmployeeFilters): Promise<EmployeesResponse> => {
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
    const response = await apiClient.get(`/hr/employees?${params.toString()}`)
    return response.data
  },

  getEmployee: async (id: string): Promise<Employee> => {
    const response = await apiClient.get(`/hr/employees/${id}`)
    return response.data
  },

  createEmployee: async (data: CreateEmployeeData): Promise<Employee> => {
    const response = await apiClient.post('/hr/employees', data)
    return response.data
  },

  updateEmployee: async (id: string, data: UpdateEmployeeData): Promise<Employee> => {
    const response = await apiClient.patch(`/hr/employees/${id}`, data)
    return response.data
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await apiClient.delete(`/hr/employees/${id}`)
  },

  getEmployeeStats: async (): Promise<EmployeeStats> => {
    const response = await apiClient.get('/hr/employees/stats')
    return response.data
  },

  bulkDeleteEmployees: async (ids: string[]): Promise<void> => {
    await apiClient.post('/hr/employees/bulk-delete', { ids })
  },

  // ==================== FORM OPTIONS ====================

  getFormOptions: async (): Promise<any> => {
    const response = await apiClient.get('/hr/options')
    return response.data
  },

  // ==================== ALLOWANCES ====================

  addAllowance: async (id: string, data: Allowance): Promise<Employee> => {
    const response = await apiClient.post(`/hr/employees/${id}/allowances`, data)
    return response.data
  },

  removeAllowance: async (id: string, allowanceId: string): Promise<Employee> => {
    const response = await apiClient.delete(`/hr/employees/${id}/allowances/${allowanceId}`)
    return response.data
  },

  // ==================== DOCUMENTS ====================

  uploadDocument: async (employeeId: string, file: File, documentType: DocumentType): Promise<EmployeeDocument> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)
    const response = await apiClient.post(`/hr/employees/${employeeId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  deleteDocument: async (employeeId: string, documentId: string): Promise<void> => {
    await apiClient.delete(`/hr/employees/${employeeId}/documents/${documentId}`)
  },

  verifyDocument: async (employeeId: string, documentId: string): Promise<EmployeeDocument> => {
    const response = await apiClient.patch(`/hr/employees/${employeeId}/documents/${documentId}/verify`)
    return response.data
  },
}

export default hrService

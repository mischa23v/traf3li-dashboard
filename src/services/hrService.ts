/**
 * HR Service
 * Handles all HR/employee management API calls
 * Base route: /api/hr
 *
 * ⚠️ WARNING: HR endpoints are not yet implemented in the backend
 * All endpoints in this service are [BACKEND-PENDING]
 *
 * The backend currently supports legal practice management (cases, clients, invoices),
 * but does not have HR module implementation yet. These endpoints will need to be
 * created in the backend before this service can function properly.
 *
 * Expected backend endpoints to implement:
 * - GET/POST /hr/employees - Employee CRUD
 * - GET /hr/employees/stats - Employee statistics
 * - POST /hr/employees/bulk-delete - Bulk operations
 * - GET /hr/options - Form options
 * - POST/DELETE /hr/employees/:id/allowances - Allowance management
 * - POST/DELETE /hr/employees/:id/documents - Document management
 */

import { apiClient } from '@/lib/api'
import { isValidObjectId } from '@/utils/validation-patterns'

/**
 * Helper function to throw bilingual error message for not-yet-implemented endpoints
 */
const throwNotImplementedError = (operation: string, endpoint: string): never => {
  throw new Error(
    `❌ Backend Not Implemented | الخلفية غير مطبقة\n\n` +
    `EN: The HR backend endpoint '${endpoint}' is not yet implemented. ` +
    `This operation (${operation}) cannot be performed until the backend endpoint is created.\n\n` +
    `AR: نقطة نهاية الموارد البشرية '${endpoint}' غير مطبقة بعد. ` +
    `لا يمكن تنفيذ هذه العملية (${operation}) حتى يتم إنشاء نقطة النهاية الخلفية.`
  )
}

/**
 * Helper function to format bilingual error messages for API errors
 */
const formatBilingualError = (error: any, operation: string): string => {
  const defaultMsg = `فشلت العملية | Operation failed: ${operation}`
  if (error.response?.data?.message) {
    return `${error.response.data.message} | ${defaultMsg}`
  }
  return `${error.message || 'خطأ غير معروف | Unknown error'} | ${defaultMsg}`
}

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
export type EducationLevel = 'high_school' | 'diploma' | 'bachelors' | 'masters' | 'doctorate' | 'professional'
export type ChangeType = 'joined' | 'promoted' | 'transferred' | 'redesignated' | 'demoted'

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

export interface Education {
  educationId: string
  schoolUniversity: string
  schoolUniversityAr: string
  qualification: string
  qualificationAr: string
  level: EducationLevel
  fieldOfStudy: string
  fieldOfStudyAr: string
  yearOfPassing: number
  classPercentage?: number
  gpa?: number
  gpaScale?: number
  country: string
  verified: boolean
  verificationDate?: string
  certificateAttachment?: string
}

export interface ExternalWorkHistory {
  historyId: string
  companyName: string
  companyNameAr: string
  designation: string
  designationAr: string
  fromDate: string
  toDate: string
  salary?: number
  currency?: string
  totalExperience: string
  address?: string
  contactPerson?: string
  contactPhone?: string
  reasonForLeaving?: string
  verified: boolean
  verificationDate?: string
  referenceLetterAttachment?: string
}

export interface InternalWorkHistory {
  historyId: string
  branch: string
  departmentId: string
  departmentName: string
  designation: string
  designationAr: string
  fromDate: string
  toDate: string
  changeType: ChangeType
  remarks?: string
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
  education: Education[]
  externalWorkHistory: ExternalWorkHistory[]
  internalWorkHistory: InternalWorkHistory[]
  familyBackground?: string
  familyBackgroundAr?: string
  healthDetails?: string
  healthDetailsAr?: string
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

// Compensation data for create/update - allowances as array (backend API format)
export interface CompensationInput {
  basicSalary?: number
  currency?: string
  allowances?: Allowance[] // Backend expects array format
  totalAllowances?: number
  grossSalary?: number
  paymentFrequency?: PaymentFrequency
  paymentMethod?: PaymentMethod
  paymentDay?: number
  bankDetails?: Partial<BankDetails>
  wps?: Partial<WPS>
}

export interface CreateEmployeeData {
  employeeNumber?: string
  personalInfo: Partial<PersonalInfo>
  employment: Partial<Employment>
  compensation?: CompensationInput
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

  /**
   * Get all employees with optional filtering
   * GET /api/hr/employees
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails
   */
  getEmployees: async (filters?: EmployeeFilters): Promise<EmployeesResponse> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement GET /hr/employees with filtering, pagination, sorting
    try {
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
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'getEmployees'))
    }
  },

  /**
   * Get single employee by ID
   * GET /api/hr/employees/:id
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails or ID is invalid
   */
  getEmployee: async (id: string): Promise<Employee> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement GET /hr/employees/:id
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.get(`/hr/employees/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'getEmployee'))
    }
  },

  /**
   * Create new employee
   * POST /api/hr/employees
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails
   */
  createEmployee: async (data: CreateEmployeeData): Promise<Employee> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement POST /hr/employees
    try {
      const response = await apiClient.post('/hr/employees', data)
      // Handle different response structures: direct employee, { employee: ... }, or { data: ... }
      return response.data?.employee || response.data?.data || response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'createEmployee'))
    }
  },

  /**
   * Update employee by ID
   * PUT /api/hr/employees/:id
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails or ID is invalid
   */
  updateEmployee: async (id: string, data: UpdateEmployeeData): Promise<Employee> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement PUT /hr/employees/:id
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.put(`/hr/employees/${id}`, data)
      return response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'updateEmployee'))
    }
  },

  /**
   * Delete employee by ID
   * DELETE /api/hr/employees/:id
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails or ID is invalid
   */
  deleteEmployee: async (id: string): Promise<void> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement DELETE /hr/employees/:id
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      await apiClient.delete(`/hr/employees/${id}`)
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'deleteEmployee'))
    }
  },

  /**
   * Get employee statistics
   * GET /api/hr/employees/stats
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails
   */
  getEmployeeStats: async (): Promise<EmployeeStats> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement GET /hr/employees/stats
    try {
      const response = await apiClient.get('/hr/employees/stats')
      return response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'getEmployeeStats'))
    }
  },

  /**
   * Bulk delete employees
   * POST /api/hr/employees/bulk-delete
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails
   */
  bulkDeleteEmployees: async (ids: string[]): Promise<void> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement POST /hr/employees/bulk-delete
    try {
      await apiClient.post('/hr/employees/bulk-delete', { ids })
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'bulkDeleteEmployees'))
    }
  },

  // ==================== FORM OPTIONS ====================

  /**
   * Get form options for dropdowns (departments, positions, etc.)
   * GET /api/hr/options
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails
   */
  getFormOptions: async (): Promise<any> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement GET /hr/options
    try {
      const response = await apiClient.get('/hr/options')
      return response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'getFormOptions'))
    }
  },

  // ==================== ALLOWANCES ====================

  /**
   * Add allowance to employee
   * POST /api/hr/employees/:id/allowances
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails or ID is invalid
   */
  addAllowance: async (id: string, data: Allowance): Promise<Employee> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement POST /hr/employees/:id/allowances
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.post(`/hr/employees/${id}/allowances`, data)
      return response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'addAllowance'))
    }
  },

  /**
   * Remove allowance from employee
   * DELETE /api/hr/employees/:id/allowances/:allowanceId
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails or ID is invalid
   */
  removeAllowance: async (id: string, allowanceId: string): Promise<Employee> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement DELETE /hr/employees/:id/allowances/:allowanceId
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.delete(`/hr/employees/${id}/allowances/${allowanceId}`)
      return response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'removeAllowance'))
    }
  },

  // ==================== DOCUMENTS ====================

  /**
   * Upload document for employee
   * POST /api/hr/employees/:id/documents
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails or ID is invalid
   */
  uploadDocument: async (employeeId: string, file: File, documentType: DocumentType): Promise<EmployeeDocument> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement POST /hr/employees/:id/documents with file upload support
    if (!isValidObjectId(employeeId)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)
      const response = await apiClient.post(`/hr/employees/${employeeId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'uploadDocument'))
    }
  },

  /**
   * Delete employee document
   * DELETE /api/hr/employees/:id/documents/:documentId
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails or ID is invalid
   */
  deleteDocument: async (employeeId: string, documentId: string): Promise<void> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement DELETE /hr/employees/:id/documents/:documentId
    if (!isValidObjectId(employeeId)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      await apiClient.delete(`/hr/employees/${employeeId}/documents/${documentId}`)
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'deleteDocument'))
    }
  },

  /**
   * Verify employee document
   * PATCH /api/hr/employees/:id/documents/:documentId/verify
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message when API call fails or ID is invalid
   */
  verifyDocument: async (employeeId: string, documentId: string): Promise<EmployeeDocument> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement PATCH /hr/employees/:id/documents/:documentId/verify
    if (!isValidObjectId(employeeId)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.patch(`/hr/employees/${employeeId}/documents/${documentId}/verify`)
      return response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'verifyDocument'))
    }
  },
}

export default hrService

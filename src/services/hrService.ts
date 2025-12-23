/**
 * HR Service
 * Handles all HR/employee management API calls
 * Base route: /api/hr
 *
 * Backend Routes (IMPLEMENTED):
 * ✅ GET    /hr/employees                              - List employees
 * ✅ GET    /hr/employees/:id                          - Get single employee
 * ✅ POST   /hr/employees                              - Create employee
 * ✅ PUT    /hr/employees/:id                          - Update employee
 * ✅ DELETE /hr/employees/:id                          - Delete employee
 * ✅ GET    /hr/employees/stats                        - Employee statistics
 * ✅ POST   /hr/employees/bulk-delete                  - Bulk delete
 * ✅ GET    /hr/options                                - Form options
 * ✅ POST   /hr/employees/:id/allowances               - Add allowance
 * ✅ DELETE /hr/employees/:id/allowances/:allowanceId  - Remove allowance
 *
 * Employee Documents (IMPLEMENTED):
 * ✅ GET    /hr/employees/:id/documents                - List documents
 * ✅ POST   /hr/employees/:id/documents                - Upload document
 * ✅ DELETE /hr/employees/:id/documents/:docId         - Delete document
 * ✅ POST   /hr/employees/:id/documents/:docId/verify  - Verify document
 */

import { apiClient, handleApiError } from '@/lib/api'
import { isValidObjectId } from '@/utils/validation-patterns'

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
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/hr/employees
   */
  getEmployees: async (filters?: EmployeeFilters): Promise<EmployeesResponse> => {
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
      throw new Error(
        `Failed to fetch employees | فشل جلب الموظفين: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get single employee by ID
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/hr/employees/:id
   */
  getEmployee: async (id: string): Promise<Employee> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.get(`/hr/employees/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch employee | فشل جلب الموظف: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Create new employee
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/hr/employees
   */
  createEmployee: async (data: CreateEmployeeData): Promise<Employee> => {
    try {
      const response = await apiClient.post('/hr/employees', data)
      return response.data?.employee || response.data?.data || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to create employee | فشل إنشاء الموظف: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Update employee by ID
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * PUT /api/hr/employees/:id
   */
  updateEmployee: async (id: string, data: UpdateEmployeeData): Promise<Employee> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.put(`/hr/employees/${id}`, data)
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to update employee | فشل تحديث الموظف: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Delete employee by ID
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * DELETE /api/hr/employees/:id
   */
  deleteEmployee: async (id: string): Promise<void> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      await apiClient.delete(`/hr/employees/${id}`)
    } catch (error: any) {
      throw new Error(
        `Failed to delete employee | فشل حذف الموظف: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Get employee statistics
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/hr/employees/stats
   */
  getEmployeeStats: async (): Promise<EmployeeStats> => {
    try {
      const response = await apiClient.get('/hr/employees/stats')
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch employee stats | فشل جلب إحصائيات الموظفين: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Bulk delete employees
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/hr/employees/bulk-delete
   */
  bulkDeleteEmployees: async (ids: string[]): Promise<void> => {
    try {
      await apiClient.post('/hr/employees/bulk-delete', { ids })
    } catch (error: any) {
      throw new Error(
        `Failed to delete employees | فشل حذف الموظفين: ${handleApiError(error)}`
      )
    }
  },

  // ==================== FORM OPTIONS ====================

  /**
   * Get form options for dropdowns (departments, positions, etc.)
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/hr/options
   */
  getFormOptions: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/hr/options')
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch form options | فشل جلب خيارات النموذج: ${handleApiError(error)}`
      )
    }
  },

  // ==================== ALLOWANCES ====================

  /**
   * Add allowance to employee
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/hr/employees/:id/allowances
   */
  addAllowance: async (id: string, data: Allowance): Promise<Employee> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.post(`/hr/employees/${id}/allowances`, data)
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to add allowance | فشل إضافة البدل: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Remove allowance from employee
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * DELETE /api/hr/employees/:id/allowances/:allowanceId
   */
  removeAllowance: async (id: string, allowanceId: string): Promise<Employee> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.delete(`/hr/employees/${id}/allowances/${allowanceId}`)
      return response.data
    } catch (error: any) {
      throw new Error(
        `Failed to remove allowance | فشل إزالة البدل: ${handleApiError(error)}`
      )
    }
  },

  // ==================== DOCUMENTS ====================

  /**
   * Get all documents for an employee
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * GET /api/hr/employees/:id/documents
   */
  getDocuments: async (employeeId: string): Promise<EmployeeDocument[]> => {
    if (!isValidObjectId(employeeId)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.get(`/hr/employees/${employeeId}/documents`)
      return response.data.documents || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to fetch documents | فشل جلب المستندات: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Upload document for employee
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/hr/employees/:id/documents
   */
  uploadDocument: async (
    employeeId: string,
    file: File,
    documentType: DocumentType,
    expiryDate?: string
  ): Promise<EmployeeDocument> => {
    if (!isValidObjectId(employeeId)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)
      if (expiryDate) {
        formData.append('expiryDate', expiryDate)
      }
      const response = await apiClient.post(`/hr/employees/${employeeId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data.document || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to upload document | فشل تحميل المستند: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Delete employee document
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * DELETE /api/hr/employees/:id/documents/:documentId
   */
  deleteDocument: async (employeeId: string, documentId: string): Promise<void> => {
    if (!isValidObjectId(employeeId)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      await apiClient.delete(`/hr/employees/${employeeId}/documents/${documentId}`)
    } catch (error: any) {
      throw new Error(
        `Failed to delete document | فشل حذف المستند: ${handleApiError(error)}`
      )
    }
  },

  /**
   * Verify employee document
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/hr/employees/:id/documents/:documentId/verify
   */
  verifyDocument: async (
    employeeId: string,
    documentId: string,
    verificationData?: { verifiedBy?: string; verificationNotes?: string }
  ): Promise<EmployeeDocument> => {
    if (!isValidObjectId(employeeId)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.post(
        `/hr/employees/${employeeId}/documents/${documentId}/verify`,
        verificationData
      )
      return response.data.document || response.data
    } catch (error: any) {
      throw new Error(
        `Failed to verify document | فشل التحقق من المستند: ${handleApiError(error)}`
      )
    }
  },
}

export default hrService

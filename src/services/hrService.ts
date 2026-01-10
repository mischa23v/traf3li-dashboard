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
export type EmploymentStatus = 'active' | 'on_leave' | 'suspended' | 'terminated' | 'resigned'
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

// Department types per API contract
export type DepartmentStatus = 'active' | 'inactive' | 'restructuring'

// Branch types per API contract
export type BranchStatus = 'active' | 'inactive' | 'temporary_closed' | 'under_renovation'
export type BranchType = 'headquarters' | 'regional_office' | 'branch' | 'satellite_office' | 'remote_site'

// Job Description types per API contract
export type JobDescriptionStatus = 'draft' | 'active' | 'under_review' | 'obsolete' | 'archived'
export type WorkLocationType = 'office' | 'remote' | 'hybrid' | 'field'

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

// ==================== DEPARTMENT INTERFACE (API Contract Section 2) ====================

export interface Department {
  _id: string
  departmentId: string
  departmentCode: string
  departmentName: string
  departmentNameAr: string
  description?: string
  descriptionAr?: string
  status: DepartmentStatus
  parentDepartmentId?: string
  parentDepartmentName?: string
  managerId?: string
  managerName?: string
  managerNameAr?: string
  headcount: number
  approvedHeadcount: number
  vacancies: number
  saudizationTarget: number
  currentSaudization: number
  budget?: number
  budgetUtilization?: number
  currency?: string
  location?: string
  locationAr?: string
  costCenter?: string
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

export interface DepartmentFilters {
  search?: string
  status?: DepartmentStatus
  parentDepartmentId?: string
  managerId?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DepartmentStats {
  totalDepartments: number
  activeDepartments: number
  totalHeadcount: number
  totalApprovedHeadcount: number
  totalVacancies: number
  avgSaudization: number
  totalBudget: number
  avgBudgetUtilization: number
}

export interface CreateDepartmentData {
  departmentCode: string
  departmentName: string
  departmentNameAr: string
  description?: string
  descriptionAr?: string
  parentDepartmentId?: string
  managerId?: string
  approvedHeadcount?: number
  saudizationTarget?: number
  budget?: number
  currency?: string
  location?: string
  locationAr?: string
  costCenter?: string
}

export interface UpdateDepartmentData extends Partial<CreateDepartmentData> {
  status?: DepartmentStatus
}

// ==================== BRANCH INTERFACE (API Contract Section 3) ====================

export interface BranchWorkingHours {
  dayOfWeek: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
  isWorkingDay: boolean
  openTime?: string
  closeTime?: string
  breakStart?: string
  breakEnd?: string
}

export interface Branch {
  _id: string
  branchId: string
  branchCode: string
  branchName: string
  branchNameAr: string
  branchType: BranchType
  status: BranchStatus
  description?: string
  descriptionAr?: string

  // Address
  address: {
    streetAddress: string
    streetAddressAr?: string
    district?: string
    districtAr?: string
    city: string
    cityAr?: string
    region: string
    regionAr?: string
    postalCode?: string
    country: string
    countryAr?: string
  }

  // Location coordinates
  coordinates?: {
    latitude: number
    longitude: number
  }

  // Contact
  phone?: string
  fax?: string
  email?: string

  // Manager
  managerId?: string
  managerName?: string
  managerNameAr?: string

  // Headcount
  headcount: number
  approvedHeadcount: number

  // Working hours
  workingHours?: BranchWorkingHours[]
  timezone?: string

  // Commercial registration
  commercialRegistration?: string
  commercialRegistrationExpiry?: string

  // Audit
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

export interface BranchFilters {
  search?: string
  status?: BranchStatus
  branchType?: BranchType
  city?: string
  region?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface BranchStats {
  totalBranches: number
  activeBranches: number
  totalHeadcount: number
  byType: Record<BranchType, number>
  byStatus: Record<BranchStatus, number>
  byCity: { city: string; count: number }[]
}

export interface CreateBranchData {
  branchCode: string
  branchName: string
  branchNameAr: string
  branchType: BranchType
  description?: string
  descriptionAr?: string
  address: Branch['address']
  coordinates?: Branch['coordinates']
  phone?: string
  fax?: string
  email?: string
  managerId?: string
  approvedHeadcount?: number
  workingHours?: BranchWorkingHours[]
  timezone?: string
  commercialRegistration?: string
  commercialRegistrationExpiry?: string
}

export interface UpdateBranchData extends Partial<CreateBranchData> {
  status?: BranchStatus
}

// ==================== JOB DESCRIPTION INTERFACE (API Contract Section 4) ====================

export interface JobRequirements {
  education: {
    minimumLevel: EducationLevel
    preferredLevel?: EducationLevel
    fieldOfStudy?: string[]
    preferredFieldOfStudy?: string[]
  }
  experience: {
    minimumYears: number
    preferredYears?: number
    specificExperience?: string[]
  }
  skills: {
    required: string[]
    preferred?: string[]
  }
  certifications?: {
    required?: string[]
    preferred?: string[]
  }
  languages?: {
    language: string
    proficiency: 'basic' | 'intermediate' | 'advanced' | 'native'
    required: boolean
  }[]
}

export interface JobDescription {
  _id: string
  jobDescriptionId: string
  jobCode: string
  jobTitle: string
  jobTitleAr: string
  status: JobDescriptionStatus

  // Classification
  jobFamily?: string
  jobFamilyAr?: string
  jobLevel?: string
  jobGrade?: string

  // Description
  summary?: string
  summaryAr?: string
  responsibilities: string[]
  responsibilitiesAr?: string[]

  // Requirements
  requirements: JobRequirements

  // Compensation
  salaryGrade?: string
  salaryRangeMin?: number
  salaryRangeMax?: number
  currency?: string

  // Work conditions
  workLocationType: WorkLocationType
  travelRequired?: boolean
  travelPercentage?: number
  physicalRequirements?: string[]

  // Saudization
  saudiOnly?: boolean

  // Department association
  departmentId?: string
  departmentName?: string

  // Approval
  approvedBy?: string
  approvedAt?: string
  effectiveDate?: string
  expiryDate?: string

  // Version control
  version: number
  previousVersionId?: string

  // Audit
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

export interface JobDescriptionFilters {
  search?: string
  status?: JobDescriptionStatus
  jobFamily?: string
  jobLevel?: string
  departmentId?: string
  workLocationType?: WorkLocationType
  saudiOnly?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface JobDescriptionStats {
  totalJobDescriptions: number
  activeJobDescriptions: number
  draftJobDescriptions: number
  byStatus: Record<JobDescriptionStatus, number>
  byJobFamily: { jobFamily: string; count: number }[]
  byWorkLocation: Record<WorkLocationType, number>
}

export interface CreateJobDescriptionData {
  jobCode: string
  jobTitle: string
  jobTitleAr: string
  jobFamily?: string
  jobFamilyAr?: string
  jobLevel?: string
  jobGrade?: string
  summary?: string
  summaryAr?: string
  responsibilities: string[]
  responsibilitiesAr?: string[]
  requirements: JobRequirements
  salaryGrade?: string
  salaryRangeMin?: number
  salaryRangeMax?: number
  currency?: string
  workLocationType: WorkLocationType
  travelRequired?: boolean
  travelPercentage?: number
  physicalRequirements?: string[]
  saudiOnly?: boolean
  departmentId?: string
  effectiveDate?: string
  expiryDate?: string
}

export interface UpdateJobDescriptionData extends Partial<CreateJobDescriptionData> {
  status?: JobDescriptionStatus
}

// ==================== ORGANIZATION CHART INTERFACE (API Contract Section 5) ====================

export interface OrgChartNode {
  employeeId: string
  employeeNumber: string
  fullName: string
  fullNameAr?: string
  avatar?: string
  jobTitle: string
  jobTitleAr?: string
  departmentId?: string
  departmentName?: string
  departmentNameAr?: string
  branchId?: string
  branchName?: string
  email?: string
  phone?: string
  status: EmploymentStatus
  reportsTo?: string
  directReports: OrgChartNode[]
  directReportsCount: number
  level: number
}

export interface ReportingLine {
  employee: {
    employeeId: string
    employeeNumber: string
    fullName: string
    fullNameAr?: string
    avatar?: string
    jobTitle: string
    jobTitleAr?: string
    departmentName?: string
    status: EmploymentStatus
  }
  managers: {
    employeeId: string
    employeeNumber: string
    fullName: string
    fullNameAr?: string
    avatar?: string
    jobTitle: string
    jobTitleAr?: string
    departmentName?: string
    level: number
  }[]
  directReports: {
    employeeId: string
    employeeNumber: string
    fullName: string
    fullNameAr?: string
    avatar?: string
    jobTitle: string
    jobTitleAr?: string
    departmentName?: string
  }[]
}

// ==================== PAGINATION RESPONSE (API Contract format) ====================

export interface HRPaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
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

// ==================== DEPARTMENT SERVICE (API Contract Section 2) ====================

export const departmentService = {
  /**
   * Get all departments with optional filtering
   * GET /api/hr/departments
   */
  getDepartments: async (filters?: DepartmentFilters): Promise<HRPaginatedResponse<Department>> => {
    try {
      const response = await apiClient.get('/hr/departments', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch departments | فشل جلب الأقسام: ${handleApiError(error)}`)
    }
  },

  /**
   * Get single department by ID
   * GET /api/hr/departments/:id
   */
  getDepartment: async (id: string): Promise<Department> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف القسم غير صالح | Invalid department ID')
    }
    try {
      const response = await apiClient.get(`/hr/departments/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch department | فشل جلب القسم: ${handleApiError(error)}`)
    }
  },

  /**
   * Get department statistics
   * GET /api/hr/departments/stats
   */
  getDepartmentStats: async (): Promise<DepartmentStats> => {
    try {
      const response = await apiClient.get('/hr/departments/stats')
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch department stats | فشل جلب إحصائيات الأقسام: ${handleApiError(error)}`)
    }
  },

  /**
   * Get department hierarchy (tree structure)
   * GET /api/hr/departments/hierarchy
   */
  getDepartmentHierarchy: async (): Promise<Department[]> => {
    try {
      const response = await apiClient.get('/hr/departments/hierarchy')
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch department hierarchy | فشل جلب الهيكل التنظيمي: ${handleApiError(error)}`)
    }
  },

  /**
   * Create new department
   * POST /api/hr/departments
   */
  createDepartment: async (data: CreateDepartmentData): Promise<Department> => {
    try {
      const response = await apiClient.post('/hr/departments', data)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to create department | فشل إنشاء القسم: ${handleApiError(error)}`)
    }
  },

  /**
   * Update department by ID
   * PUT /api/hr/departments/:id
   */
  updateDepartment: async (id: string, data: UpdateDepartmentData): Promise<Department> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف القسم غير صالح | Invalid department ID')
    }
    try {
      const response = await apiClient.put(`/hr/departments/${id}`, data)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to update department | فشل تحديث القسم: ${handleApiError(error)}`)
    }
  },

  /**
   * Delete department by ID
   * DELETE /api/hr/departments/:id
   */
  deleteDepartment: async (id: string): Promise<void> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف القسم غير صالح | Invalid department ID')
    }
    try {
      await apiClient.delete(`/hr/departments/${id}`)
    } catch (error: any) {
      throw new Error(`Failed to delete department | فشل حذف القسم: ${handleApiError(error)}`)
    }
  },

  /**
   * Bulk delete departments
   * POST /api/hr/departments/bulk-delete
   */
  bulkDeleteDepartments: async (ids: string[]): Promise<void> => {
    try {
      await apiClient.post('/hr/departments/bulk-delete', { ids })
    } catch (error: any) {
      throw new Error(`Failed to delete departments | فشل حذف الأقسام: ${handleApiError(error)}`)
    }
  },

  /**
   * Get employees in department
   * GET /api/hr/departments/:id/employees
   */
  getDepartmentEmployees: async (departmentId: string): Promise<Employee[]> => {
    if (!isValidObjectId(departmentId)) {
      throw new Error('معرّف القسم غير صالح | Invalid department ID')
    }
    try {
      const response = await apiClient.get(`/hr/departments/${departmentId}/employees`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch department employees | فشل جلب موظفي القسم: ${handleApiError(error)}`)
    }
  },
}

// ==================== BRANCH SERVICE (API Contract Section 3) ====================

export const branchService = {
  /**
   * Get all branches with optional filtering
   * GET /api/hr/branches
   */
  getBranches: async (filters?: BranchFilters): Promise<HRPaginatedResponse<Branch>> => {
    try {
      const response = await apiClient.get('/hr/branches', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch branches | فشل جلب الفروع: ${handleApiError(error)}`)
    }
  },

  /**
   * Get single branch by ID
   * GET /api/hr/branches/:id
   */
  getBranch: async (id: string): Promise<Branch> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الفرع غير صالح | Invalid branch ID')
    }
    try {
      const response = await apiClient.get(`/hr/branches/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch branch | فشل جلب الفرع: ${handleApiError(error)}`)
    }
  },

  /**
   * Get branch statistics
   * GET /api/hr/branches/stats
   */
  getBranchStats: async (): Promise<BranchStats> => {
    try {
      const response = await apiClient.get('/hr/branches/stats')
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch branch stats | فشل جلب إحصائيات الفروع: ${handleApiError(error)}`)
    }
  },

  /**
   * Create new branch
   * POST /api/hr/branches
   */
  createBranch: async (data: CreateBranchData): Promise<Branch> => {
    try {
      const response = await apiClient.post('/hr/branches', data)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to create branch | فشل إنشاء الفرع: ${handleApiError(error)}`)
    }
  },

  /**
   * Update branch by ID
   * PUT /api/hr/branches/:id
   */
  updateBranch: async (id: string, data: UpdateBranchData): Promise<Branch> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الفرع غير صالح | Invalid branch ID')
    }
    try {
      const response = await apiClient.put(`/hr/branches/${id}`, data)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to update branch | فشل تحديث الفرع: ${handleApiError(error)}`)
    }
  },

  /**
   * Delete branch by ID
   * DELETE /api/hr/branches/:id
   */
  deleteBranch: async (id: string): Promise<void> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الفرع غير صالح | Invalid branch ID')
    }
    try {
      await apiClient.delete(`/hr/branches/${id}`)
    } catch (error: any) {
      throw new Error(`Failed to delete branch | فشل حذف الفرع: ${handleApiError(error)}`)
    }
  },

  /**
   * Bulk delete branches
   * POST /api/hr/branches/bulk-delete
   */
  bulkDeleteBranches: async (ids: string[]): Promise<void> => {
    try {
      await apiClient.post('/hr/branches/bulk-delete', { ids })
    } catch (error: any) {
      throw new Error(`Failed to delete branches | فشل حذف الفروع: ${handleApiError(error)}`)
    }
  },

  /**
   * Get employees in branch
   * GET /api/hr/branches/:id/employees
   */
  getBranchEmployees: async (branchId: string): Promise<Employee[]> => {
    if (!isValidObjectId(branchId)) {
      throw new Error('معرّف الفرع غير صالح | Invalid branch ID')
    }
    try {
      const response = await apiClient.get(`/hr/branches/${branchId}/employees`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch branch employees | فشل جلب موظفي الفرع: ${handleApiError(error)}`)
    }
  },
}

// ==================== JOB DESCRIPTION SERVICE (API Contract Section 4) ====================

export const jobDescriptionService = {
  /**
   * Get all job descriptions with optional filtering
   * GET /api/hr/job-descriptions
   */
  getJobDescriptions: async (filters?: JobDescriptionFilters): Promise<HRPaginatedResponse<JobDescription>> => {
    try {
      const response = await apiClient.get('/hr/job-descriptions', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch job descriptions | فشل جلب الوصف الوظيفي: ${handleApiError(error)}`)
    }
  },

  /**
   * Get single job description by ID
   * GET /api/hr/job-descriptions/:id
   */
  getJobDescription: async (id: string): Promise<JobDescription> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الوصف الوظيفي غير صالح | Invalid job description ID')
    }
    try {
      const response = await apiClient.get(`/hr/job-descriptions/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch job description | فشل جلب الوصف الوظيفي: ${handleApiError(error)}`)
    }
  },

  /**
   * Get job description statistics
   * GET /api/hr/job-descriptions/stats
   */
  getJobDescriptionStats: async (): Promise<JobDescriptionStats> => {
    try {
      const response = await apiClient.get('/hr/job-descriptions/stats')
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch job description stats | فشل جلب إحصائيات الوصف الوظيفي: ${handleApiError(error)}`)
    }
  },

  /**
   * Create new job description
   * POST /api/hr/job-descriptions
   */
  createJobDescription: async (data: CreateJobDescriptionData): Promise<JobDescription> => {
    try {
      const response = await apiClient.post('/hr/job-descriptions', data)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to create job description | فشل إنشاء الوصف الوظيفي: ${handleApiError(error)}`)
    }
  },

  /**
   * Update job description by ID
   * PUT /api/hr/job-descriptions/:id
   */
  updateJobDescription: async (id: string, data: UpdateJobDescriptionData): Promise<JobDescription> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الوصف الوظيفي غير صالح | Invalid job description ID')
    }
    try {
      const response = await apiClient.put(`/hr/job-descriptions/${id}`, data)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to update job description | فشل تحديث الوصف الوظيفي: ${handleApiError(error)}`)
    }
  },

  /**
   * Delete job description by ID
   * DELETE /api/hr/job-descriptions/:id
   */
  deleteJobDescription: async (id: string): Promise<void> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الوصف الوظيفي غير صالح | Invalid job description ID')
    }
    try {
      await apiClient.delete(`/hr/job-descriptions/${id}`)
    } catch (error: any) {
      throw new Error(`Failed to delete job description | فشل حذف الوصف الوظيفي: ${handleApiError(error)}`)
    }
  },

  /**
   * Bulk delete job descriptions
   * POST /api/hr/job-descriptions/bulk-delete
   */
  bulkDeleteJobDescriptions: async (ids: string[]): Promise<void> => {
    try {
      await apiClient.post('/hr/job-descriptions/bulk-delete', { ids })
    } catch (error: any) {
      throw new Error(`Failed to delete job descriptions | فشل حذف الوصف الوظيفي: ${handleApiError(error)}`)
    }
  },

  /**
   * Approve job description
   * POST /api/hr/job-descriptions/:id/approve
   */
  approveJobDescription: async (id: string): Promise<JobDescription> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الوصف الوظيفي غير صالح | Invalid job description ID')
    }
    try {
      const response = await apiClient.post(`/hr/job-descriptions/${id}/approve`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to approve job description | فشل اعتماد الوصف الوظيفي: ${handleApiError(error)}`)
    }
  },

  /**
   * Archive job description
   * POST /api/hr/job-descriptions/:id/archive
   */
  archiveJobDescription: async (id: string): Promise<JobDescription> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الوصف الوظيفي غير صالح | Invalid job description ID')
    }
    try {
      const response = await apiClient.post(`/hr/job-descriptions/${id}/archive`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to archive job description | فشل أرشفة الوصف الوظيفي: ${handleApiError(error)}`)
    }
  },

  /**
   * Get job description version history
   * GET /api/hr/job-descriptions/:id/versions
   */
  getJobDescriptionVersions: async (id: string): Promise<JobDescription[]> => {
    if (!isValidObjectId(id)) {
      throw new Error('معرّف الوصف الوظيفي غير صالح | Invalid job description ID')
    }
    try {
      const response = await apiClient.get(`/hr/job-descriptions/${id}/versions`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch job description versions | فشل جلب إصدارات الوصف الوظيفي: ${handleApiError(error)}`)
    }
  },
}

// ==================== ORGANIZATION CHART SERVICE (API Contract Section 5) ====================

export const organizationChartService = {
  /**
   * Get full organization chart
   * GET /api/hr/organization/chart
   */
  getOrganizationChart: async (params?: {
    departmentId?: string
    branchId?: string
    maxLevel?: number
  }): Promise<OrgChartNode[]> => {
    try {
      const response = await apiClient.get('/hr/organization/chart', { params })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch organization chart | فشل جلب الهيكل التنظيمي: ${handleApiError(error)}`)
    }
  },

  /**
   * Get reporting line for an employee
   * GET /api/hr/organization/reporting-line/:employeeId
   */
  getReportingLine: async (employeeId: string): Promise<ReportingLine> => {
    if (!isValidObjectId(employeeId)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.get(`/hr/organization/reporting-line/${employeeId}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch reporting line | فشل جلب خط التقارير: ${handleApiError(error)}`)
    }
  },

  /**
   * Get direct reports for an employee
   * GET /api/hr/organization/direct-reports/:employeeId
   */
  getDirectReports: async (employeeId: string): Promise<OrgChartNode[]> => {
    if (!isValidObjectId(employeeId)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      const response = await apiClient.get(`/hr/organization/direct-reports/${employeeId}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to fetch direct reports | فشل جلب التابعين المباشرين: ${handleApiError(error)}`)
    }
  },

  /**
   * Update employee reporting relationship
   * PUT /api/hr/organization/reporting-line/:employeeId
   */
  updateReportingLine: async (
    employeeId: string,
    data: { reportsTo: string; effectiveDate?: string }
  ): Promise<void> => {
    if (!isValidObjectId(employeeId)) {
      throw new Error('معرّف الموظف غير صالح | Invalid employee ID')
    }
    try {
      await apiClient.put(`/hr/organization/reporting-line/${employeeId}`, data)
    } catch (error: any) {
      throw new Error(`Failed to update reporting line | فشل تحديث خط التقارير: ${handleApiError(error)}`)
    }
  },
}

export default hrService

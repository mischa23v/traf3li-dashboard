import { apiClient } from '@/lib/api'

// ==================== TYPES ====================

export interface Department {
  name: string
  nameAr: string
  parentDepartment?: string
  managerId?: string
  description?: string
}

export interface Designation {
  title: string
  titleAr: string
  departmentId?: string
  level?: number
  description?: string
}

export interface LeaveType {
  name: string
  nameAr: string
  maxDays: number
  applicableAfter?: number // months
  carryForward: boolean
  maxCarryForward?: number
  isPaid: boolean
  requiresApproval: boolean
  allowNegativeBalance: boolean
  color?: string
}

export interface LeavePolicy {
  name: string
  nameAr: string
  leaveTypes: string[]
  applicableToAll: boolean
  applicableDepartments?: string[]
  applicableDesignations?: string[]
}

export interface ShiftType {
  name: string
  nameAr: string
  startTime: string
  endTime: string
  breakDuration?: number // minutes
  workingHours: number
  isDefault: boolean
}

export interface AttendanceRule {
  name: string
  nameAr: string
  graceTimeLate: number // minutes
  graceTimeEarly: number // minutes
  halfDayThreshold: number // hours
  markAbsentAfter: number // hours late
  overtimeEnabled: boolean
  minimumOvertimeHours?: number
}

export interface SalaryComponent {
  name: string
  nameAr: string
  type: 'earning' | 'deduction'
  calculationType: 'fixed' | 'percentage'
  amount?: number
  percentage?: number
  taxable: boolean
  includedInGOSI: boolean
  includedInEOSB: boolean
  isDefault: boolean
}

export interface GOSISettings {
  enabled: boolean
  employeeContributionRate: number // percentage
  employerContributionRate: number // percentage
  minimumWage?: number
  maximumWage?: number
}

export interface WPSSettings {
  enabled: boolean
  molId?: string
  establishmentId?: string
  bankCode?: string
  fileFormat?: 'SIF' | 'WPS'
}

export interface EmailTemplate {
  name: string
  nameAr: string
  subject: string
  subjectAr: string
  body: string
  bodyAr: string
  type: 'welcome' | 'leave_approval' | 'leave_rejection' | 'payslip' | 'attendance_alert' | 'birthday' | 'anniversary'
  variables: string[]
}

export interface CompanySettings {
  companyName: string
  companyNameAr: string
  companyLogo?: string
  defaultWorkingDays: string[]
  defaultWorkingHoursStart: string
  defaultWorkingHoursEnd: string
  fiscalYearStart: string
  weekendDays: string[]
  currency: string
  timezone: string
}

export interface HRSetupWizardData {
  // Step 1: Company Information
  companySettings: CompanySettings

  // Step 2: Organizational Structure
  departments: Department[]
  designations: Designation[]

  // Step 3: Leave Configuration
  leaveTypes: LeaveType[]
  leavePolicies: LeavePolicy[]

  // Step 4: Attendance Settings
  shiftTypes: ShiftType[]
  attendanceRules: AttendanceRule[]

  // Step 5: Payroll Setup
  salaryComponents: SalaryComponent[]
  gosiSettings: GOSISettings
  wpsSettings: WPSSettings

  // Step 6: Email Templates
  emailTemplates: EmailTemplate[]

  // Completion
  completed: boolean
}

// ==================== SERVICE ====================

const hrSetupWizardService = {
  // ==================== COMPANY SETTINGS ====================

  updateCompanySettings: async (settings: CompanySettings): Promise<any> => {
    const response = await apiClient.put('/hr/settings/company', settings)
    return response.data
  },

  uploadCompanyLogo: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('logo', file)
    const response = await apiClient.post('/hr/settings/company/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.logoUrl
  },

  // ==================== DEPARTMENTS ====================

  createDepartments: async (departments: Department[]): Promise<any> => {
    const response = await apiClient.post('/hr/departments/bulk', { departments })
    return response.data
  },

  getDepartments: async (): Promise<Department[]> => {
    const response = await apiClient.get('/hr/departments')
    return response.data
  },

  // ==================== DESIGNATIONS ====================

  createDesignations: async (designations: Designation[]): Promise<any> => {
    const response = await apiClient.post('/hr/designations/bulk', { designations })
    return response.data
  },

  getDesignations: async (): Promise<Designation[]> => {
    const response = await apiClient.get('/hr/designations')
    return response.data
  },

  // ==================== LEAVE TYPES ====================

  createLeaveTypes: async (leaveTypes: LeaveType[]): Promise<any> => {
    const response = await apiClient.post('/hr/leave-types/bulk', { leaveTypes })
    return response.data
  },

  getLeaveTypes: async (): Promise<LeaveType[]> => {
    const response = await apiClient.get('/hr/leave-types')
    return response.data
  },

  // ==================== LEAVE POLICIES ====================

  createLeavePolicies: async (policies: LeavePolicy[]): Promise<any> => {
    const response = await apiClient.post('/hr/leave-policies/bulk', { policies })
    return response.data
  },

  getLeavePolicies: async (): Promise<LeavePolicy[]> => {
    const response = await apiClient.get('/hr/leave-policies')
    return response.data
  },

  // ==================== SHIFT TYPES ====================

  createShiftTypes: async (shifts: ShiftType[]): Promise<any> => {
    const response = await apiClient.post('/hr/shift-types/bulk', { shifts })
    return response.data
  },

  getShiftTypes: async (): Promise<ShiftType[]> => {
    const response = await apiClient.get('/hr/shift-types')
    return response.data
  },

  // ==================== ATTENDANCE RULES ====================

  createAttendanceRules: async (rules: AttendanceRule[]): Promise<any> => {
    const response = await apiClient.post('/hr/attendance-rules/bulk', { rules })
    return response.data
  },

  getAttendanceRules: async (): Promise<AttendanceRule[]> => {
    const response = await apiClient.get('/hr/attendance-rules')
    return response.data
  },

  // ==================== SALARY COMPONENTS ====================

  createSalaryComponents: async (components: SalaryComponent[]): Promise<any> => {
    const response = await apiClient.post('/hr/salary-components/bulk', { components })
    return response.data
  },

  getSalaryComponents: async (): Promise<SalaryComponent[]> => {
    const response = await apiClient.get('/hr/salary-components')
    return response.data
  },

  // ==================== GOSI SETTINGS ====================

  updateGOSISettings: async (settings: GOSISettings): Promise<any> => {
    const response = await apiClient.put('/hr/settings/gosi', settings)
    return response.data
  },

  // ==================== WPS SETTINGS ====================

  updateWPSSettings: async (settings: WPSSettings): Promise<any> => {
    const response = await apiClient.put('/hr/settings/wps', settings)
    return response.data
  },

  // ==================== EMAIL TEMPLATES ====================

  createEmailTemplates: async (templates: EmailTemplate[]): Promise<any> => {
    const response = await apiClient.post('/hr/email-templates/bulk', { templates })
    return response.data
  },

  getEmailTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await apiClient.get('/hr/email-templates')
    return response.data
  },

  // ==================== COMPLETE SETUP ====================

  completeSetup: async (data: HRSetupWizardData): Promise<any> => {
    const response = await apiClient.post('/hr/setup/complete', data)
    return response.data
  },
}

export default hrSetupWizardService

/**
 * HR Settings Service
 * Handles all HR settings related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== EMPLOYEE SETTINGS ====================

export interface EmployeeSettings {
  retirementAge: number
  employeeNamingSeries: 'emp_number' | 'name_based'
  sendBirthdayEmails: boolean
  autoCreateUserForEmployee: boolean
}

// ==================== LEAVE SETTINGS ====================

export interface LeaveSettings {
  workingDaysCalculationMethod: 'leave_type' | 'attendance_based'
  includeHolidaysInWorkingDays: boolean
  halfDayFraction: number
  defaultLeaveApprover?: string
  leaveApprovalNotification: boolean
}

// ==================== ATTENDANCE SETTINGS ====================

export interface AttendanceSettings {
  timesheetMaxHours: number
  strictPunchTime: boolean
  allowManualAttendance: boolean
  autoMarkAbsent: boolean
  graceMinutesLate: number
  graceMinutesEarly: number
}

// ==================== PAYROLL SETTINGS ====================

export interface PayrollSettings {
  payrollBankAccount: string
  roundingMethod: 'round' | 'floor' | 'ceil'
  autoLockPayslips: boolean
  wpsEnabled: boolean
  gosiCalculationAutomatic: boolean
}

// ==================== EXPENSE SETTINGS ====================

export interface ExpenseSettings {
  expenseApproverMandatory: boolean
  maxExpenseAmountWithoutApproval: number
  expenseCategories: string[]
}

// ==================== MAIN HR SETTINGS ====================

export interface HRSettings {
  _id: string
  organizationId: string
  employee: EmployeeSettings
  leave: LeaveSettings
  attendance: AttendanceSettings
  payroll: PayrollSettings
  expense: ExpenseSettings
  createdAt: string
  updatedAt: string
}

export interface UpdateEmployeeSettings {
  retirementAge?: number
  employeeNamingSeries?: 'emp_number' | 'name_based'
  sendBirthdayEmails?: boolean
  autoCreateUserForEmployee?: boolean
}

export interface UpdateLeaveSettings {
  workingDaysCalculationMethod?: 'leave_type' | 'attendance_based'
  includeHolidaysInWorkingDays?: boolean
  halfDayFraction?: number
  defaultLeaveApprover?: string
  leaveApprovalNotification?: boolean
}

export interface UpdateAttendanceSettings {
  timesheetMaxHours?: number
  strictPunchTime?: boolean
  allowManualAttendance?: boolean
  autoMarkAbsent?: boolean
  graceMinutesLate?: number
  graceMinutesEarly?: number
}

export interface UpdatePayrollSettings {
  payrollBankAccount?: string
  roundingMethod?: 'round' | 'floor' | 'ceil'
  autoLockPayslips?: boolean
  wpsEnabled?: boolean
  gosiCalculationAutomatic?: boolean
}

export interface UpdateExpenseSettings {
  expenseApproverMandatory?: boolean
  maxExpenseAmountWithoutApproval?: number
  expenseCategories?: string[]
}

export interface UpdateHRSettingsData {
  employee?: UpdateEmployeeSettings
  leave?: UpdateLeaveSettings
  attendance?: UpdateAttendanceSettings
  payroll?: UpdatePayrollSettings
  expense?: UpdateExpenseSettings
}

const hrSettingsService = {
  // ==================== GET HR SETTINGS ====================

  getHRSettings: async (): Promise<HRSettings> => {
    try {
      const response = await apiClient.get('/settings/hr')
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // ==================== UPDATE HR SETTINGS ====================

  updateHRSettings: async (data: UpdateHRSettingsData): Promise<HRSettings> => {
    try {
      const response = await apiClient.patch('/settings/hr', data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // ==================== UPDATE INDIVIDUAL SECTIONS ====================

  updateEmployeeSettings: async (data: UpdateEmployeeSettings): Promise<HRSettings> => {
    try {
      const response = await apiClient.patch('/settings/hr/employee', data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateLeaveSettings: async (data: UpdateLeaveSettings): Promise<HRSettings> => {
    try {
      const response = await apiClient.patch('/settings/hr/leave', data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateAttendanceSettings: async (data: UpdateAttendanceSettings): Promise<HRSettings> => {
    try {
      const response = await apiClient.patch('/settings/hr/attendance', data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updatePayrollSettings: async (data: UpdatePayrollSettings): Promise<HRSettings> => {
    try {
      const response = await apiClient.patch('/settings/hr/payroll', data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  updateExpenseSettings: async (data: UpdateExpenseSettings): Promise<HRSettings> => {
    try {
      const response = await apiClient.patch('/settings/hr/expense', data)
      return response.data.data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // ==================== GET MANAGERS FOR LEAVE APPROVER ====================

  getManagers: async (): Promise<Array<{ value: string; label: string }>> => {
    try {
      const response = await apiClient.get('/hr/employees', {
        params: {
          role: 'manager',
          status: 'active',
        },
      })
      return response.data.data.map((employee: any) => ({
        value: employee._id,
        label: employee.personalInfo.fullNameEnglish || employee.personalInfo.fullNameArabic,
      }))
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

export default hrSettingsService

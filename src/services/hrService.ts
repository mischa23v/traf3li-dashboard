/**
 * HR Service
 * Handles all HR-related API calls (Employees, Salaries, Leaves, Attendance, Payroll, Evaluations)
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  // Employee types
  Employee,
  CreateEmployeeData,
  EmployeeFilters,
  EmployeeStats,
  // Salary types
  Salary,
  CreateSalaryData,
  SalaryFilters,
  SalaryStats,
  Allowance,
  Deduction,
  // Leave types
  LeaveRequest,
  CreateLeaveData,
  LeaveFilters,
  LeaveBalance,
  LeaveStats,
  // Attendance types
  AttendanceRecord,
  CheckInData,
  CheckOutData,
  AttendanceFilters,
  TodayAttendance,
  AttendanceSummary,
  // Payroll types
  Payroll,
  GeneratePayrollData,
  UpdatePayrollItemData,
  PayrollFilters,
  PayrollSummary,
  // Evaluation types
  Evaluation,
  CreateEvaluationData,
  EvaluationFilters,
  EvaluationStats,
  EvaluationGoal,
  EvaluationCompetency,
} from '@/types/hr'

// ═══════════════════════════════════════════════════════════════
// EMPLOYEE SERVICE
// ═══════════════════════════════════════════════════════════════
export const employeeService = {
  /**
   * Get all employees with optional filters
   */
  getEmployees: async (
    filters?: EmployeeFilters
  ): Promise<{ data: Employee[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/employees', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Get employees error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single employee
   */
  getEmployee: async (id: string): Promise<Employee> => {
    try {
      const response = await apiClient.get(`/employees/${id}`)
      return response.data.data
    } catch (error: any) {
      console.error('Get employee error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new employee
   */
  createEmployee: async (data: CreateEmployeeData): Promise<Employee> => {
    try {
      const response = await apiClient.post('/employees', data)
      return response.data.data
    } catch (error: any) {
      console.error('Create employee error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update employee
   */
  updateEmployee: async (
    id: string,
    data: Partial<CreateEmployeeData>
  ): Promise<Employee> => {
    try {
      const response = await apiClient.put(`/employees/${id}`, data)
      return response.data.data
    } catch (error: any) {
      console.error('Update employee error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete employee
   */
  deleteEmployee: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/employees/${id}`)
    } catch (error: any) {
      console.error('Delete employee error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Search employees
   */
  searchEmployees: async (query: string): Promise<Employee[]> => {
    try {
      const response = await apiClient.get('/employees/search', {
        params: { q: query },
      })
      return response.data.data
    } catch (error: any) {
      console.error('Search employees error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get employee statistics
   */
  getStats: async (): Promise<EmployeeStats> => {
    try {
      const response = await apiClient.get('/employees/stats')
      return response.data.data
    } catch (error: any) {
      console.error('Get employee stats error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get organization chart
   */
  getOrgChart: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/employees/org-chart')
      return response.data.data
    } catch (error: any) {
      console.error('Get org chart error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update leave balance
   */
  updateLeaveBalance: async (
    id: string,
    data: { leaveType: string; balance: number }
  ): Promise<Employee> => {
    try {
      const response = await apiClient.patch(
        `/employees/${id}/leave-balance`,
        data
      )
      return response.data.data
    } catch (error: any) {
      console.error('Update leave balance error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add document to employee
   */
  addDocument: async (
    id: string,
    data: { name: string; type: string; url: string }
  ): Promise<Employee> => {
    try {
      const response = await apiClient.post(`/employees/${id}/documents`, data)
      return response.data.data
    } catch (error: any) {
      console.error('Add document error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete document from employee
   */
  deleteDocument: async (id: string, docId: string): Promise<void> => {
    try {
      await apiClient.delete(`/employees/${id}/documents/${docId}`)
    } catch (error: any) {
      console.error('Delete document error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// SALARY SERVICE
// ═══════════════════════════════════════════════════════════════
export const salaryService = {
  /**
   * Get all salaries
   */
  getSalaries: async (
    filters?: SalaryFilters
  ): Promise<{ data: Salary[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/salaries', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Get salaries error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single salary
   */
  getSalary: async (id: string): Promise<Salary> => {
    try {
      const response = await apiClient.get(`/salaries/${id}`)
      return response.data.data
    } catch (error: any) {
      console.error('Get salary error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new salary structure
   */
  createSalary: async (data: CreateSalaryData): Promise<Salary> => {
    try {
      const response = await apiClient.post('/salaries', data)
      return response.data.data
    } catch (error: any) {
      console.error('Create salary error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update salary
   */
  updateSalary: async (
    id: string,
    data: Partial<CreateSalaryData>
  ): Promise<Salary> => {
    try {
      const response = await apiClient.put(`/salaries/${id}`, data)
      return response.data.data
    } catch (error: any) {
      console.error('Update salary error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete salary
   */
  deleteSalary: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/salaries/${id}`)
    } catch (error: any) {
      console.error('Delete salary error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get current salary for employee
   */
  getCurrentSalary: async (employeeId: string): Promise<Salary> => {
    try {
      const response = await apiClient.get(
        `/salaries/employee/${employeeId}/current`
      )
      return response.data.data
    } catch (error: any) {
      console.error('Get current salary error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get salary history for employee
   */
  getSalaryHistory: async (employeeId: string): Promise<Salary[]> => {
    try {
      const response = await apiClient.get(
        `/salaries/employee/${employeeId}/history`
      )
      return response.data.data
    } catch (error: any) {
      console.error('Get salary history error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add allowance
   */
  addAllowance: async (
    id: string,
    data: Omit<Allowance, '_id'>
  ): Promise<Salary> => {
    try {
      const response = await apiClient.post(`/salaries/${id}/allowances`, data)
      return response.data.data
    } catch (error: any) {
      console.error('Add allowance error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add deduction
   */
  addDeduction: async (
    id: string,
    data: Omit<Deduction, '_id'>
  ): Promise<Salary> => {
    try {
      const response = await apiClient.post(`/salaries/${id}/deductions`, data)
      return response.data.data
    } catch (error: any) {
      console.error('Add deduction error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get salary statistics
   */
  getStats: async (): Promise<SalaryStats> => {
    try {
      const response = await apiClient.get('/salaries/stats')
      return response.data.data
    } catch (error: any) {
      console.error('Get salary stats error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// LEAVE SERVICE
// ═══════════════════════════════════════════════════════════════
export const leaveService = {
  /**
   * Get all leave requests
   */
  getLeaves: async (
    filters?: LeaveFilters
  ): Promise<{ data: LeaveRequest[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/leaves', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Get leaves error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single leave request
   */
  getLeave: async (id: string): Promise<LeaveRequest> => {
    try {
      const response = await apiClient.get(`/leaves/${id}`)
      return response.data.data
    } catch (error: any) {
      console.error('Get leave error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create leave request
   */
  createLeave: async (data: CreateLeaveData): Promise<LeaveRequest> => {
    try {
      const response = await apiClient.post('/leaves', data)
      return response.data.data
    } catch (error: any) {
      console.error('Create leave error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update leave request
   */
  updateLeave: async (
    id: string,
    data: Partial<CreateLeaveData>
  ): Promise<LeaveRequest> => {
    try {
      const response = await apiClient.put(`/leaves/${id}`, data)
      return response.data.data
    } catch (error: any) {
      console.error('Update leave error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete leave request
   */
  deleteLeave: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/leaves/${id}`)
    } catch (error: any) {
      console.error('Delete leave error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Approve leave request
   */
  approveLeave: async (id: string): Promise<LeaveRequest> => {
    try {
      const response = await apiClient.post(`/leaves/${id}/approve`)
      return response.data.data
    } catch (error: any) {
      console.error('Approve leave error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reject leave request
   */
  rejectLeave: async (id: string, reason: string): Promise<LeaveRequest> => {
    try {
      const response = await apiClient.post(`/leaves/${id}/reject`, { reason })
      return response.data.data
    } catch (error: any) {
      console.error('Reject leave error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel leave request
   */
  cancelLeave: async (id: string): Promise<LeaveRequest> => {
    try {
      const response = await apiClient.post(`/leaves/${id}/cancel`)
      return response.data.data
    } catch (error: any) {
      console.error('Cancel leave error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get leave balance for employee
   */
  getLeaveBalance: async (employeeId: string): Promise<LeaveBalance> => {
    try {
      const response = await apiClient.get(`/leaves/balance/${employeeId}`)
      return response.data.data
    } catch (error: any) {
      console.error('Get leave balance error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get employees on leave today
   */
  getTodayLeaves: async (): Promise<LeaveRequest[]> => {
    try {
      const response = await apiClient.get('/leaves/today')
      return response.data.data
    } catch (error: any) {
      console.error('Get today leaves error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get leave statistics
   */
  getStats: async (): Promise<LeaveStats> => {
    try {
      const response = await apiClient.get('/leaves/stats')
      return response.data.data
    } catch (error: any) {
      console.error('Get leave stats error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add attachment to leave request
   */
  addAttachment: async (
    id: string,
    data: { url: string; name: string }
  ): Promise<LeaveRequest> => {
    try {
      const response = await apiClient.post(`/leaves/${id}/attachments`, data)
      return response.data.data
    } catch (error: any) {
      console.error('Add attachment error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// ATTENDANCE SERVICE
// ═══════════════════════════════════════════════════════════════
export const attendanceService = {
  /**
   * Check in
   */
  checkIn: async (data: CheckInData): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post('/attendance/check-in', data)
      return response.data.data
    } catch (error: any) {
      console.error('Check in error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check out
   */
  checkOut: async (data: CheckOutData): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post('/attendance/check-out', data)
      return response.data.data
    } catch (error: any) {
      console.error('Check out error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all attendance records
   */
  getAttendance: async (
    filters?: AttendanceFilters
  ): Promise<{ data: AttendanceRecord[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/attendance', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Get attendance error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single attendance record
   */
  getAttendanceRecord: async (id: string): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.get(`/attendance/${id}`)
      return response.data.data
    } catch (error: any) {
      console.error('Get attendance record error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update attendance record
   */
  updateAttendance: async (
    id: string,
    data: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.put(`/attendance/${id}`, data)
      return response.data.data
    } catch (error: any) {
      console.error('Update attendance error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete attendance record
   */
  deleteAttendance: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/attendance/${id}`)
    } catch (error: any) {
      console.error('Delete attendance error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get today's attendance
   */
  getTodayAttendance: async (): Promise<TodayAttendance> => {
    try {
      const response = await apiClient.get('/attendance/today')
      return response.data.data
    } catch (error: any) {
      console.error('Get today attendance error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get attendance summary
   */
  getSummary: async (params?: {
    employeeId?: string
    startDate?: string
    endDate?: string
  }): Promise<AttendanceSummary[]> => {
    try {
      const response = await apiClient.get('/attendance/summary', { params })
      return response.data.data
    } catch (error: any) {
      console.error('Get attendance summary error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get late arrivals report
   */
  getLateReport: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<AttendanceRecord[]> => {
    try {
      const response = await apiClient.get('/attendance/late-report', {
        params,
      })
      return response.data.data
    } catch (error: any) {
      console.error('Get late report error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create manual attendance entry
   */
  createManualEntry: async (data: {
    employeeId: string
    date: string
    checkInTime?: string
    checkOutTime?: string
    status: string
    notes?: string
  }): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post('/attendance/manual', data)
      return response.data.data
    } catch (error: any) {
      console.error('Create manual entry error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark absent
   */
  markAbsent: async (
    employeeId: string,
    date: string
  ): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post('/attendance/mark-absent', {
        employeeId,
        date,
      })
      return response.data.data
    } catch (error: any) {
      console.error('Mark absent error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Start break
   */
  startBreak: async (id: string): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post(`/attendance/${id}/break/start`)
      return response.data.data
    } catch (error: any) {
      console.error('Start break error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * End break
   */
  endBreak: async (id: string): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post(`/attendance/${id}/break/end`)
      return response.data.data
    } catch (error: any) {
      console.error('End break error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Approve overtime
   */
  approveOvertime: async (
    id: string,
    hours: number
  ): Promise<AttendanceRecord> => {
    try {
      const response = await apiClient.post(
        `/attendance/${id}/overtime/approve`,
        { hours }
      )
      return response.data.data
    } catch (error: any) {
      console.error('Approve overtime error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// PAYROLL SERVICE
// ═══════════════════════════════════════════════════════════════
export const payrollService = {
  /**
   * Get all payrolls
   */
  getPayrolls: async (
    filters?: PayrollFilters
  ): Promise<{ data: Payroll[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/payroll', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Get payrolls error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single payroll
   */
  getPayroll: async (id: string): Promise<Payroll> => {
    try {
      const response = await apiClient.get(`/payroll/${id}`)
      return response.data.data
    } catch (error: any) {
      console.error('Get payroll error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Generate payroll
   */
  generatePayroll: async (data: GeneratePayrollData): Promise<Payroll> => {
    try {
      const response = await apiClient.post('/payroll', data)
      return response.data.data
    } catch (error: any) {
      console.error('Generate payroll error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete payroll
   */
  deletePayroll: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/payroll/${id}`)
    } catch (error: any) {
      console.error('Delete payroll error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get payroll by period
   */
  getByPeriod: async (year: number, month: number): Promise<Payroll> => {
    try {
      const response = await apiClient.get(`/payroll/period/${year}/${month}`)
      return response.data.data
    } catch (error: any) {
      console.error('Get payroll by period error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get yearly summary
   */
  getYearlySummary: async (year: number): Promise<PayrollSummary> => {
    try {
      const response = await apiClient.get(`/payroll/summary/${year}`)
      return response.data.data
    } catch (error: any) {
      console.error('Get yearly summary error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update payroll item
   */
  updatePayrollItem: async (
    payrollId: string,
    itemId: string,
    data: UpdatePayrollItemData
  ): Promise<Payroll> => {
    try {
      const response = await apiClient.patch(
        `/payroll/${payrollId}/items/${itemId}`,
        data
      )
      return response.data.data
    } catch (error: any) {
      console.error('Update payroll item error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Submit payroll for approval
   */
  submitPayroll: async (id: string): Promise<Payroll> => {
    try {
      const response = await apiClient.post(`/payroll/${id}/submit`)
      return response.data.data
    } catch (error: any) {
      console.error('Submit payroll error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Approve payroll
   */
  approvePayroll: async (id: string): Promise<Payroll> => {
    try {
      const response = await apiClient.post(`/payroll/${id}/approve`)
      return response.data.data
    } catch (error: any) {
      console.error('Approve payroll error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reject payroll
   */
  rejectPayroll: async (id: string, reason?: string): Promise<Payroll> => {
    try {
      const response = await apiClient.post(`/payroll/${id}/reject`, { reason })
      return response.data.data
    } catch (error: any) {
      console.error('Reject payroll error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Process payroll payment
   */
  processPayroll: async (
    id: string,
    data: { paymentMethod: string; paymentReference: string }
  ): Promise<Payroll> => {
    try {
      const response = await apiClient.post(`/payroll/${id}/process`, data)
      return response.data.data
    } catch (error: any) {
      console.error('Process payroll error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// EVALUATION SERVICE
// ═══════════════════════════════════════════════════════════════
export const evaluationService = {
  /**
   * Get all evaluations
   */
  getEvaluations: async (
    filters?: EvaluationFilters
  ): Promise<{ data: Evaluation[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/evaluations', { params: filters })
      return response.data
    } catch (error: any) {
      console.error('Get evaluations error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single evaluation
   */
  getEvaluation: async (id: string): Promise<Evaluation> => {
    try {
      const response = await apiClient.get(`/evaluations/${id}`)
      return response.data.data
    } catch (error: any) {
      console.error('Get evaluation error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create evaluation
   */
  createEvaluation: async (data: CreateEvaluationData): Promise<Evaluation> => {
    try {
      const response = await apiClient.post('/evaluations', data)
      return response.data.data
    } catch (error: any) {
      console.error('Create evaluation error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update evaluation
   */
  updateEvaluation: async (
    id: string,
    data: Partial<Evaluation>
  ): Promise<Evaluation> => {
    try {
      const response = await apiClient.put(`/evaluations/${id}`, data)
      return response.data.data
    } catch (error: any) {
      console.error('Update evaluation error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete evaluation
   */
  deleteEvaluation: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/evaluations/${id}`)
    } catch (error: any) {
      console.error('Delete evaluation error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get pending evaluations
   */
  getPendingEvaluations: async (): Promise<Evaluation[]> => {
    try {
      const response = await apiClient.get('/evaluations/pending')
      return response.data.data
    } catch (error: any) {
      console.error('Get pending evaluations error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get evaluation statistics
   */
  getStats: async (): Promise<EvaluationStats> => {
    try {
      const response = await apiClient.get('/evaluations/stats')
      return response.data.data
    } catch (error: any) {
      console.error('Get evaluation stats error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get employee evaluation history
   */
  getEmployeeHistory: async (employeeId: string): Promise<Evaluation[]> => {
    try {
      const response = await apiClient.get(
        `/evaluations/employee/${employeeId}/history`
      )
      return response.data.data
    } catch (error: any) {
      console.error('Get employee evaluation history error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add goal
   */
  addGoal: async (
    id: string,
    data: Omit<EvaluationGoal, '_id'>
  ): Promise<Evaluation> => {
    try {
      const response = await apiClient.post(`/evaluations/${id}/goals`, data)
      return response.data.data
    } catch (error: any) {
      console.error('Add goal error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update goal
   */
  updateGoal: async (
    id: string,
    goalId: string,
    data: Partial<EvaluationGoal>
  ): Promise<Evaluation> => {
    try {
      const response = await apiClient.patch(
        `/evaluations/${id}/goals/${goalId}`,
        data
      )
      return response.data.data
    } catch (error: any) {
      console.error('Update goal error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add competency
   */
  addCompetency: async (
    id: string,
    data: Omit<EvaluationCompetency, '_id'>
  ): Promise<Evaluation> => {
    try {
      const response = await apiClient.post(
        `/evaluations/${id}/competencies`,
        data
      )
      return response.data.data
    } catch (error: any) {
      console.error('Add competency error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add 360 feedback
   */
  addFeedback360: async (
    id: string,
    data: {
      reviewerId: string
      relationship: string
      ratings: any[]
      overallComments?: string
    }
  ): Promise<Evaluation> => {
    try {
      const response = await apiClient.post(`/evaluations/${id}/feedback`, data)
      return response.data.data
    } catch (error: any) {
      console.error('Add 360 feedback error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Submit self-assessment
   */
  submitSelfAssessment: async (
    id: string,
    data: {
      goalsComments?: string
      competenciesComments?: string
      overallComments?: string
    }
  ): Promise<Evaluation> => {
    try {
      const response = await apiClient.post(
        `/evaluations/${id}/self-assessment`,
        data
      )
      return response.data.data
    } catch (error: any) {
      console.error('Submit self-assessment error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Submit evaluation for review
   */
  submitEvaluation: async (id: string): Promise<Evaluation> => {
    try {
      const response = await apiClient.post(`/evaluations/${id}/submit`)
      return response.data.data
    } catch (error: any) {
      console.error('Submit evaluation error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Complete evaluation
   */
  completeEvaluation: async (id: string): Promise<Evaluation> => {
    try {
      const response = await apiClient.post(`/evaluations/${id}/complete`)
      return response.data.data
    } catch (error: any) {
      console.error('Complete evaluation error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Acknowledge evaluation
   */
  acknowledgeEvaluation: async (id: string): Promise<Evaluation> => {
    try {
      const response = await apiClient.post(`/evaluations/${id}/acknowledge`)
      return response.data.data
    } catch (error: any) {
      console.error('Acknowledge evaluation error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

// Export all services as default object
const hrService = {
  employee: employeeService,
  salary: salaryService,
  leave: leaveService,
  attendance: attendanceService,
  payroll: payrollService,
  evaluation: evaluationService,
}

export default hrService

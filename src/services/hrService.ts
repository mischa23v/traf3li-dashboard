/**
 * HR Services
 * Production-ready services for Human Resources management
 */

import { apiClient } from '@/lib/api'
import {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeFilters,
  EmployeeStats,
  LeaveRequest,
  CreateLeaveRequestData,
  UpdateLeaveRequestData,
  LeaveFilters,
  LeaveStats,
  AttendanceRecord,
  CreateAttendanceData,
  UpdateAttendanceData,
  AttendanceFilters,
  AttendanceStats,
  SalaryRecord,
  CreateSalaryData,
  UpdateSalaryData,
  SalaryFilters,
  Payroll,
  CreatePayrollData,
  UpdatePayrollData,
  PayrollFilters,
  PayrollStats,
  PerformanceEvaluation,
  CreateEvaluationData,
  UpdateEvaluationData,
  EvaluationFilters,
} from '@/types/hr'

// ==================== EMPLOYEE SERVICE ====================

export const employeeService = {
  // Get all employees
  async getEmployees(filters?: EmployeeFilters): Promise<Employee[]> {
    const { data } = await apiClient.get('/hr/employees', { params: filters })
    return data.data || data
  },

  // Get single employee
  async getEmployee(id: string): Promise<Employee> {
    const { data } = await apiClient.get(`/hr/employees/${id}`)
    return data.data || data
  },

  // Create employee
  async createEmployee(employeeData: CreateEmployeeData): Promise<Employee> {
    const { data } = await apiClient.post('/hr/employees', employeeData)
    return data.data || data
  },

  // Update employee
  async updateEmployee(id: string, employeeData: UpdateEmployeeData): Promise<Employee> {
    const { data } = await apiClient.put(`/hr/employees/${id}`, employeeData)
    return data.data || data
  },

  // Delete employee
  async deleteEmployee(id: string): Promise<void> {
    await apiClient.delete(`/hr/employees/${id}`)
  },

  // Update employee status
  async updateStatus(id: string, status: Employee['status']): Promise<Employee> {
    const { data } = await apiClient.patch(`/hr/employees/${id}/status`, { status })
    return data.data || data
  },

  // Get employee stats
  async getStats(): Promise<EmployeeStats> {
    const { data } = await apiClient.get('/hr/employees/stats')
    return data.data || data
  },

  // Upload employee document
  async uploadDocument(id: string, file: File): Promise<Employee> {
    const formData = new FormData()
    formData.append('document', file)
    const { data } = await apiClient.post(`/hr/employees/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data || data
  },
}

// ==================== LEAVE SERVICE ====================

export const leaveService = {
  // Get all leave requests
  async getLeaves(filters?: LeaveFilters): Promise<LeaveRequest[]> {
    const { data } = await apiClient.get('/hr/leaves', { params: filters })
    return data.data || data
  },

  // Get single leave request
  async getLeave(id: string): Promise<LeaveRequest> {
    const { data } = await apiClient.get(`/hr/leaves/${id}`)
    return data.data || data
  },

  // Create leave request
  async createLeave(leaveData: CreateLeaveRequestData): Promise<LeaveRequest> {
    const { data } = await apiClient.post('/hr/leaves', leaveData)
    return data.data || data
  },

  // Update leave request
  async updateLeave(id: string, leaveData: UpdateLeaveRequestData): Promise<LeaveRequest> {
    const { data } = await apiClient.put(`/hr/leaves/${id}`, leaveData)
    return data.data || data
  },

  // Delete leave request
  async deleteLeave(id: string): Promise<void> {
    await apiClient.delete(`/hr/leaves/${id}`)
  },

  // Approve leave request
  async approveLeave(id: string): Promise<LeaveRequest> {
    const { data } = await apiClient.patch(`/hr/leaves/${id}/approve`)
    return data.data || data
  },

  // Reject leave request
  async rejectLeave(id: string, reason: string): Promise<LeaveRequest> {
    const { data } = await apiClient.patch(`/hr/leaves/${id}/reject`, { reason })
    return data.data || data
  },

  // Get leave stats
  async getStats(): Promise<LeaveStats> {
    const { data } = await apiClient.get('/hr/leaves/stats')
    return data.data || data
  },

  // Get employee leave balance
  async getBalance(employeeId: string): Promise<{ annual: number; sick: number; used: number }> {
    const { data } = await apiClient.get(`/hr/leaves/balance/${employeeId}`)
    return data.data || data
  },
}

// ==================== ATTENDANCE SERVICE ====================

export const attendanceService = {
  // Get all attendance records
  async getRecords(filters?: AttendanceFilters): Promise<AttendanceRecord[]> {
    const { data } = await apiClient.get('/hr/attendance', { params: filters })
    return data.data || data
  },

  // Get single attendance record
  async getRecord(id: string): Promise<AttendanceRecord> {
    const { data } = await apiClient.get(`/hr/attendance/${id}`)
    return data.data || data
  },

  // Create attendance record
  async createRecord(attendanceData: CreateAttendanceData): Promise<AttendanceRecord> {
    const { data } = await apiClient.post('/hr/attendance', attendanceData)
    return data.data || data
  },

  // Update attendance record
  async updateRecord(id: string, attendanceData: UpdateAttendanceData): Promise<AttendanceRecord> {
    const { data } = await apiClient.put(`/hr/attendance/${id}`, attendanceData)
    return data.data || data
  },

  // Delete attendance record
  async deleteRecord(id: string): Promise<void> {
    await apiClient.delete(`/hr/attendance/${id}`)
  },

  // Clock in
  async clockIn(employeeId: string, location?: string): Promise<AttendanceRecord> {
    const { data } = await apiClient.post('/hr/attendance/clock-in', { employeeId, location })
    return data.data || data
  },

  // Clock out
  async clockOut(employeeId: string, location?: string): Promise<AttendanceRecord> {
    const { data } = await apiClient.post('/hr/attendance/clock-out', { employeeId, location })
    return data.data || data
  },

  // Get attendance stats
  async getStats(filters?: AttendanceFilters): Promise<AttendanceStats> {
    const { data } = await apiClient.get('/hr/attendance/stats', { params: filters })
    return data.data || data
  },

  // Get today's attendance
  async getTodayAttendance(): Promise<AttendanceRecord[]> {
    const { data } = await apiClient.get('/hr/attendance/today')
    return data.data || data
  },
}

// ==================== SALARY SERVICE ====================

export const salaryService = {
  // Get all salary records
  async getSalaries(filters?: SalaryFilters): Promise<SalaryRecord[]> {
    const { data } = await apiClient.get('/hr/salaries', { params: filters })
    return data.data || data
  },

  // Get single salary record
  async getSalary(id: string): Promise<SalaryRecord> {
    const { data } = await apiClient.get(`/hr/salaries/${id}`)
    return data.data || data
  },

  // Create salary record
  async createSalary(salaryData: CreateSalaryData): Promise<SalaryRecord> {
    const { data } = await apiClient.post('/hr/salaries', salaryData)
    return data.data || data
  },

  // Update salary record
  async updateSalary(id: string, salaryData: UpdateSalaryData): Promise<SalaryRecord> {
    const { data } = await apiClient.put(`/hr/salaries/${id}`, salaryData)
    return data.data || data
  },

  // Delete salary record
  async deleteSalary(id: string): Promise<void> {
    await apiClient.delete(`/hr/salaries/${id}`)
  },

  // Approve salary
  async approveSalary(id: string): Promise<SalaryRecord> {
    const { data } = await apiClient.patch(`/hr/salaries/${id}/approve`)
    return data.data || data
  },

  // Mark as paid
  async markAsPaid(id: string, paymentDetails: { paymentDate: string; paymentMethod: string; paymentReference?: string }): Promise<SalaryRecord> {
    const { data } = await apiClient.patch(`/hr/salaries/${id}/paid`, paymentDetails)
    return data.data || data
  },

  // Generate salary slip PDF
  async generateSlip(id: string): Promise<Blob> {
    const { data } = await apiClient.get(`/hr/salaries/${id}/slip`, { responseType: 'blob' })
    return data
  },
}

// ==================== PAYROLL SERVICE ====================

export const payrollService = {
  // Get all payrolls
  async getPayrolls(filters?: PayrollFilters): Promise<Payroll[]> {
    const { data } = await apiClient.get('/hr/payroll', { params: filters })
    return data.data || data
  },

  // Get single payroll
  async getPayroll(id: string): Promise<Payroll> {
    const { data } = await apiClient.get(`/hr/payroll/${id}`)
    return data.data || data
  },

  // Create payroll
  async createPayroll(payrollData: CreatePayrollData): Promise<Payroll> {
    const { data } = await apiClient.post('/hr/payroll', payrollData)
    return data.data || data
  },

  // Update payroll
  async updatePayroll(id: string, payrollData: UpdatePayrollData): Promise<Payroll> {
    const { data } = await apiClient.put(`/hr/payroll/${id}`, payrollData)
    return data.data || data
  },

  // Delete payroll
  async deletePayroll(id: string): Promise<void> {
    await apiClient.delete(`/hr/payroll/${id}`)
  },

  // Process payroll (generate salary records)
  async processPayroll(id: string): Promise<Payroll> {
    const { data } = await apiClient.post(`/hr/payroll/${id}/process`)
    return data.data || data
  },

  // Complete payroll
  async completePayroll(id: string): Promise<Payroll> {
    const { data } = await apiClient.patch(`/hr/payroll/${id}/complete`)
    return data.data || data
  },

  // Get payroll stats
  async getStats(year?: number): Promise<PayrollStats> {
    const { data } = await apiClient.get('/hr/payroll/stats', { params: { year } })
    return data.data || data
  },

  // Export payroll to Excel
  async exportPayroll(id: string): Promise<Blob> {
    const { data } = await apiClient.get(`/hr/payroll/${id}/export`, { responseType: 'blob' })
    return data
  },
}

// ==================== EVALUATION SERVICE ====================

export const evaluationService = {
  // Get all evaluations
  async getEvaluations(filters?: EvaluationFilters): Promise<PerformanceEvaluation[]> {
    const { data } = await apiClient.get('/hr/evaluations', { params: filters })
    return data.data || data
  },

  // Get single evaluation
  async getEvaluation(id: string): Promise<PerformanceEvaluation> {
    const { data } = await apiClient.get(`/hr/evaluations/${id}`)
    return data.data || data
  },

  // Create evaluation
  async createEvaluation(evaluationData: CreateEvaluationData): Promise<PerformanceEvaluation> {
    const { data } = await apiClient.post('/hr/evaluations', evaluationData)
    return data.data || data
  },

  // Update evaluation
  async updateEvaluation(id: string, evaluationData: UpdateEvaluationData): Promise<PerformanceEvaluation> {
    const { data } = await apiClient.put(`/hr/evaluations/${id}`, evaluationData)
    return data.data || data
  },

  // Delete evaluation
  async deleteEvaluation(id: string): Promise<void> {
    await apiClient.delete(`/hr/evaluations/${id}`)
  },

  // Complete evaluation
  async completeEvaluation(id: string): Promise<PerformanceEvaluation> {
    const { data } = await apiClient.patch(`/hr/evaluations/${id}/complete`)
    return data.data || data
  },

  // Employee sign evaluation
  async employeeSign(id: string): Promise<PerformanceEvaluation> {
    const { data } = await apiClient.patch(`/hr/evaluations/${id}/employee-sign`)
    return data.data || data
  },

  // Manager sign evaluation
  async managerSign(id: string): Promise<PerformanceEvaluation> {
    const { data } = await apiClient.patch(`/hr/evaluations/${id}/manager-sign`)
    return data.data || data
  },

  // Generate evaluation PDF
  async generatePDF(id: string): Promise<Blob> {
    const { data } = await apiClient.get(`/hr/evaluations/${id}/pdf`, { responseType: 'blob' })
    return data
  },
}

export default {
  employee: employeeService,
  leave: leaveService,
  attendance: attendanceService,
  salary: salaryService,
  payroll: payrollService,
  evaluation: evaluationService,
}

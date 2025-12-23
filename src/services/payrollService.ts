/**
 * Payroll Service
 * Handles all payroll-related API calls
 * Base route: /api/payroll (salary slips)
 * Base route: /api/hr/payroll-runs (payroll runs management)
 *
 * Salary Slip Routes (IMPLEMENTED):
 * ✅ GET    /payroll                    - Get all salary slips
 * ✅ GET    /payroll/:id                - Get single salary slip
 * ✅ POST   /payroll                    - Create salary slip
 * ✅ PUT    /payroll/:id                - Update salary slip
 * ✅ DELETE /payroll/:id                - Delete salary slip
 * ✅ POST   /payroll/:id/approve        - Approve salary slip
 * ✅ POST   /payroll/:id/pay            - Mark as paid
 * ✅ GET    /payroll/stats              - Get payroll statistics
 * ✅ POST   /payroll/generate           - Generate bulk payroll
 * ✅ POST   /payroll/approve            - Bulk approve
 * ✅ POST   /payroll/pay                - Bulk pay
 * ✅ POST   /payroll/wps/submit         - Submit to WPS
 *
 * Payroll Run Routes (IMPLEMENTED):
 * ✅ POST   /hr/payroll-runs/:id/employees/:empId/exclude     - Exclude employee
 * ✅ POST   /hr/payroll-runs/:id/employees/:empId/include     - Re-include employee
 * ✅ POST   /hr/payroll-runs/:id/employees/:empId/recalculate - Recalculate employee
 * ✅ GET    /hr/payroll-runs/:id/export                       - Export payroll report
 */

import { apiClient } from '@/lib/api'
import { handleApiError } from '@/lib/api'

// ==================== ENUMS & TYPES ====================

export type PaymentStatus = 'draft' | 'approved' | 'processing' | 'paid' | 'failed' | 'cancelled'
export type PaymentMethod = 'bank_transfer' | 'cash' | 'check'
export type CalendarType = 'hijri' | 'gregorian'

// ==================== INTERFACES ====================

export interface PayPeriod {
    month: number
    year: number
    calendarType: CalendarType
    periodStart: string
    periodEnd: string
    paymentDate: string
    workingDays: number
    daysWorked: number
}

export interface Allowance {
    name: string
    nameAr: string
    amount: number
}

export interface Earnings {
    basicSalary: number
    allowances: Allowance[]
    totalAllowances: number
    overtime?: {
        hours: number
        rate: number
        amount: number
    }
    bonus?: number
    commission?: number
    arrears?: number
    totalEarnings: number
}

export interface Deductions {
    gosi: number
    gosiEmployer?: number
    loans?: number
    advances?: number
    absences?: number
    lateDeductions?: number
    violations?: number
    otherDeductions?: number
    totalDeductions: number
}

export interface Payment {
    paymentMethod: PaymentMethod
    bankName?: string
    iban?: string
    accountNumber?: string
    checkNumber?: string
    checkDate?: string
    status: PaymentStatus
    paidOn?: string
    paidBy?: string
    transactionReference?: string
    failureReason?: string
}

export interface WPS {
    required: boolean
    submitted: boolean
    submissionDate?: string
    wpsReferenceNumber?: string
    status: 'pending' | 'accepted' | 'rejected'
}

export interface SalarySlip {
    _id: string
    slipId: string
    slipNumber: string

    // Employee Reference
    employeeId: string
    employeeNumber: string
    employeeName: string
    employeeNameAr?: string
    nationalId: string
    jobTitle: string
    department?: string

    // Period
    payPeriod: PayPeriod

    // Earnings & Deductions
    earnings: Earnings
    deductions: Deductions

    // Net Pay
    netPay: number
    netPayInWords?: string
    netPayInWordsAr?: string

    // Payment
    payment: Payment

    // WPS
    wps?: WPS

    // Metadata
    generatedOn: string
    generatedBy: string
    approvedBy?: string
    approvedOn?: string

    // Timestamps
    createdAt: string
    updatedAt: string
}

export interface CreateSalarySlipData {
    employeeId: string
    payPeriod: {
        month: number
        year: number
        calendarType?: CalendarType
        periodStart?: string
        periodEnd?: string
        paymentDate?: string
        workingDays?: number
        daysWorked?: number
    }
    earnings: {
        basicSalary: number
        allowances?: Allowance[]
        overtime?: {
            hours: number
            rate: number
        }
        bonus?: number
        commission?: number
        arrears?: number
    }
    deductions?: {
        loans?: number
        advances?: number
        absences?: number
        lateDeductions?: number
        violations?: number
        otherDeductions?: number
    }
    payment?: {
        paymentMethod?: PaymentMethod
        bankName?: string
        iban?: string
    }
}

export interface SalarySlipFilters {
    employeeId?: string
    month?: number
    year?: number
    status?: PaymentStatus
    department?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
}

export interface SalarySlipStats {
    total: number
    draft: number
    approved: number
    processing: number
    paid: number
    failed: number
    cancelled: number
    totalNetPay: number
    totalGrossPay: number
    totalDeductions: number
}

export interface SalarySlipsResponse {
    salarySlips: SalarySlip[]
    pagination: {
        total: number
        page: number
        limit: number
        pages: number
    }
}

// ==================== PAYROLL RUN TYPES ====================

export type PayrollRunStatus = 'draft' | 'processing' | 'completed' | 'cancelled'

export interface PayrollRunEmployee {
    employeeId: string
    employeeName: string
    employeeNameAr?: string
    employeeNumber: string
    department?: string
    basicSalary: number
    totalEarnings: number
    totalDeductions: number
    netPay: number
    status: PaymentStatus
    isExcluded: boolean
    exclusionReason?: string
    excludedAt?: string
    excludedBy?: string
}

export interface PayrollRun {
    _id: string
    runId: string
    runNumber: string
    month: number
    year: number
    calendarType: CalendarType
    periodStart: string
    periodEnd: string
    paymentDate: string
    status: PayrollRunStatus
    employees: PayrollRunEmployee[]
    totalEmployees: number
    excludedCount: number
    totalGross: number
    totalDeductions: number
    totalNetPay: number
    processedAt?: string
    processedBy?: string
    createdAt: string
    updatedAt: string
}

export interface ExcludeEmployeeData {
    reason: string
}

export interface RecalculateResult {
    employee: PayrollRunEmployee
    previousNetPay: number
    newNetPay: number
    difference: number
}

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf'

// ==================== API FUNCTIONS ====================

export const payrollService = {
    // Get all salary slips with filters
    getSalarySlips: async (filters?: SalarySlipFilters): Promise<SalarySlipsResponse> => {
        const params = new URLSearchParams()
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, String(value))
                }
            })
        }
        const response = await apiClient.get(`/payroll?${params.toString()}`)
        return response.data
    },

    // Get single salary slip
    getSalarySlip: async (id: string): Promise<SalarySlip> => {
        const response = await apiClient.get(`/payroll/${id}`)
        return response.data
    },

    // Get salary slips for an employee
    getEmployeeSalarySlips: async (employeeId: string): Promise<SalarySlip[]> => {
        const response = await apiClient.get(`/payroll?employeeId=${employeeId}`)
        return response.data.salarySlips || response.data
    },

    // Create salary slip
    createSalarySlip: async (data: CreateSalarySlipData): Promise<SalarySlip> => {
        const response = await apiClient.post('/payroll', data)
        return response.data
    },

    // Update salary slip
    updateSalarySlip: async (id: string, data: Partial<CreateSalarySlipData>): Promise<SalarySlip> => {
        const response = await apiClient.put(`/payroll/${id}`, data)
        return response.data
    },

    // Delete salary slip
    deleteSalarySlip: async (id: string): Promise<void> => {
        await apiClient.delete(`/payroll/${id}`)
    },

    // Approve salary slip
    approveSalarySlip: async (id: string): Promise<SalarySlip> => {
        const response = await apiClient.post(`/payroll/${id}/approve`)
        return response.data
    },

    // Mark as paid
    markAsPaid: async (id: string, transactionReference?: string): Promise<SalarySlip> => {
        const response = await apiClient.post(`/payroll/${id}/pay`, { transactionReference })
        return response.data
    },

    // Get payroll stats
    getPayrollStats: async (month?: number, year?: number): Promise<SalarySlipStats> => {
        const params = new URLSearchParams()
        if (month) params.append('month', String(month))
        if (year) params.append('year', String(year))
        const response = await apiClient.get(`/payroll/stats?${params.toString()}`)
        return response.data
    },

    // Generate bulk payroll
    generateBulkPayroll: async (month: number, year: number, employeeIds?: string[]): Promise<SalarySlip[]> => {
        const response = await apiClient.post('/payroll/generate', { month, year, employeeIds })
        return response.data
    },

    /**
     * Download salary slip PDF
     * @deprecated Backend endpoint not implemented - GET /payroll/:id/pdf
     * @throws Error indicating the endpoint is not implemented
     * TODO: [BACKEND-PENDING] Implement GET /payroll/:id/pdf endpoint OR use PDFme service for client-side PDF generation
     */
    downloadSalarySlipPDF: async (id: string): Promise<Blob> => {
        throw new Error(
            'PDF download not available: Salary slip PDF generation is not yet implemented. | تنزيل PDF غير متاح: إنشاء PDF لقسيمة الراتب غير مطبق حالياً.\n' +
            'Endpoint: GET /payroll/:id/pdf\n' +
            'Alternative: Use PDFme service to generate PDF on client-side. | البديل: استخدم خدمة PDFme لإنشاء PDF من جانب العميل.'
        )
    },

    // Bulk approve salary slips
    bulkApproveSalarySlips: async (ids: string[]): Promise<{ approved: number }> => {
        const response = await apiClient.post('/payroll/approve', { ids })
        return response.data
    },

    // Bulk pay salary slips
    bulkPaySalarySlips: async (ids: string[]): Promise<{ paid: number }> => {
        const response = await apiClient.post('/payroll/pay', { ids })
        return response.data
    },

    // Submit to WPS
    submitToWPS: async (ids: string[]): Promise<{ success: boolean; reference: string }> => {
        const response = await apiClient.post('/payroll/wps/submit', { ids })
        return response.data
    },

    // ==================== PAYROLL RUN MANAGEMENT ====================

    /**
     * Exclude employee from payroll run
     * ✅ ENDPOINT IMPLEMENTED IN BACKEND
     * POST /api/hr/payroll-runs/:id/employees/:empId/exclude
     */
    excludeEmployee: async (runId: string, employeeId: string, data: ExcludeEmployeeData): Promise<PayrollRun> => {
        try {
            const response = await apiClient.post(`/hr/payroll-runs/${runId}/employees/${employeeId}/exclude`, data)
            return response.data.payrollRun || response.data
        } catch (error: any) {
            throw new Error(
                `Failed to exclude employee from payroll | فشل استبعاد الموظف من كشف الرواتب: ${handleApiError(error)}`
            )
        }
    },

    /**
     * Re-include employee in payroll run
     * ✅ ENDPOINT IMPLEMENTED IN BACKEND
     * POST /api/hr/payroll-runs/:id/employees/:empId/include
     */
    includeEmployee: async (runId: string, employeeId: string): Promise<PayrollRun> => {
        try {
            const response = await apiClient.post(`/hr/payroll-runs/${runId}/employees/${employeeId}/include`)
            return response.data.payrollRun || response.data
        } catch (error: any) {
            throw new Error(
                `Failed to include employee in payroll | فشل إضافة الموظف إلى كشف الرواتب: ${handleApiError(error)}`
            )
        }
    },

    /**
     * Recalculate employee in payroll run
     * ✅ ENDPOINT IMPLEMENTED IN BACKEND
     * POST /api/hr/payroll-runs/:id/employees/:empId/recalculate
     */
    recalculateEmployee: async (runId: string, employeeId: string): Promise<RecalculateResult> => {
        try {
            const response = await apiClient.post(`/hr/payroll-runs/${runId}/employees/${employeeId}/recalculate`)
            return response.data
        } catch (error: any) {
            throw new Error(
                `Failed to recalculate employee payroll | فشل إعادة حساب راتب الموظف: ${handleApiError(error)}`
            )
        }
    },

    /**
     * Export payroll run report
     * ✅ ENDPOINT IMPLEMENTED IN BACKEND
     * GET /api/hr/payroll-runs/:id/export?format=csv|json|xlsx|pdf
     *
     * Returns a Blob for file download
     */
    exportPayrollRun: async (runId: string, format: ExportFormat = 'csv'): Promise<Blob> => {
        try {
            const response = await apiClient.get(`/hr/payroll-runs/${runId}/export`, {
                params: { format },
                responseType: 'blob',
            })
            return response.data
        } catch (error: any) {
            throw new Error(
                `Failed to export payroll report | فشل تصدير تقرير الرواتب: ${handleApiError(error)}`
            )
        }
    },
}

export default payrollService

import { apiClient } from '@/lib/api'

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
}

export default payrollService

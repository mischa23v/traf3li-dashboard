import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { CACHE_TIMES } from '@/config'
import { invalidateCache } from '@/lib/cache-invalidation'
import { payrollService } from '@/services/payrollService'
import type { SalarySlipFilters, CreateSalarySlipData } from '@/services/payrollService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// Query Keys
export const payrollKeys = {
    all: ['payroll'] as const,
    lists: () => [...payrollKeys.all, 'list'] as const,
    list: (filters?: SalarySlipFilters) => [...payrollKeys.lists(), filters] as const,
    details: () => [...payrollKeys.all, 'detail'] as const,
    detail: (id: string) => [...payrollKeys.details(), id] as const,
    stats: (month?: number, year?: number) => [...payrollKeys.all, 'stats', month, year] as const,
    employee: (employeeId: string) => [...payrollKeys.all, 'employee', employeeId] as const,
}

// Get all salary slips
export function useSalarySlips(filters?: SalarySlipFilters) {
    return useQuery({
        queryKey: payrollKeys.list(filters),
        queryFn: () => payrollService.getSalarySlips(filters),
        staleTime: LIST_STALE_TIME,
        gcTime: STATS_GC_TIME,
    })
}

// Get single salary slip
export function useSalarySlip(id: string) {
    return useQuery({
        queryKey: payrollKeys.detail(id),
        queryFn: () => payrollService.getSalarySlip(id),
        enabled: !!id,
        staleTime: LIST_STALE_TIME,
        gcTime: STATS_GC_TIME,
    })
}

// Get employee salary slips
export function useEmployeeSalarySlips(employeeId: string) {
    return useQuery({
        queryKey: payrollKeys.employee(employeeId),
        queryFn: () => payrollService.getEmployeeSalarySlips(employeeId),
        enabled: !!employeeId,
        staleTime: LIST_STALE_TIME,
        gcTime: STATS_GC_TIME,
    })
}

// Get payroll stats
export function usePayrollStats(month?: number, year?: number) {
    return useQuery({
        queryKey: payrollKeys.stats(month, year),
        queryFn: () => payrollService.getPayrollStats(month, year),
        staleTime: STATS_STALE_TIME,
        gcTime: STATS_GC_TIME,
    })
}

// Create salary slip
export function useCreateSalarySlip() {
    return useMutation({
        mutationFn: (data: CreateSalarySlipData) => payrollService.createSalarySlip(data),
        onSuccess: () => {
            invalidateCache.payroll.all()
        },
    })
}

// Update salary slip
export function useUpdateSalarySlip() {
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateSalarySlipData> }) =>
            payrollService.updateSalarySlip(id, data),
        onSuccess: (_, variables) => {
            Promise.all([
                invalidateCache.payroll.detail(variables.id),
                invalidateCache.payroll.all()
            ])
        },
    })
}

// Delete salary slip
export function useDeleteSalarySlip() {
    return useMutation({
        mutationFn: (id: string) => payrollService.deleteSalarySlip(id),
        onSuccess: () => {
            invalidateCache.payroll.all()
        },
    })
}

// Approve salary slip
export function useApproveSalarySlip() {
    return useMutation({
        mutationFn: (id: string) => payrollService.approveSalarySlip(id),
        onSuccess: (_, id) => {
            Promise.all([
                invalidateCache.payroll.detail(id),
                invalidateCache.payroll.all()
            ])
        },
    })
}

// Mark as paid
export function useMarkAsPaid() {
    return useMutation({
        mutationFn: ({ id, transactionReference }: { id: string; transactionReference?: string }) =>
            payrollService.markAsPaid(id, transactionReference),
        onSuccess: (_, variables) => {
            Promise.all([
                invalidateCache.payroll.detail(variables.id),
                invalidateCache.payroll.all()
            ])
        },
    })
}

// Generate bulk payroll
export function useGenerateBulkPayroll() {
    return useMutation({
        mutationFn: ({ month, year, employeeIds }: { month: number; year: number; employeeIds?: string[] }) =>
            payrollService.generateBulkPayroll(month, year, employeeIds),
        onSuccess: () => {
            invalidateCache.payroll.all()
        },
    })
}

// Submit to WPS
export function useSubmitToWPS() {
    return useMutation({
        mutationFn: (ids: string[]) => payrollService.submitToWPS(ids),
        onSuccess: () => {
            invalidateCache.payroll.all()
        },
    })
}

/**
 * Download salary slip PDF
 * @deprecated Backend endpoint not implemented - GET /payroll/:id/pdf
 * This hook will throw an error when called. Use PDFme service for client-side PDF generation instead.
 * TODO: [BACKEND-PENDING] Implement GET /payroll/:id/pdf endpoint OR implement client-side PDF generation using PDFme
 */
export function useDownloadSalarySlipPDF() {
    return useMutation({
        mutationFn: (id: string) => {
            console.warn(
                '[DEPRECATED] useDownloadSalarySlipPDF: Backend endpoint not implemented | [منتهي الصلاحية] استخدام تنزيل PDF: نقطة النهاية غير مطبقة',
                '\nEndpoint: GET /payroll/:id/pdf',
                '\nSalary Slip ID:', id,
                '\nSuggestion: Use PDFme service for client-side PDF generation | اقتراح: استخدم خدمة PDFme لإنشاء PDF من جانب العميل'
            )
            return payrollService.downloadSalarySlipPDF(id)
        },
        onError: (error) => {
            console.error(
                '[ERROR] Failed to download salary slip PDF | [خطأ] فشل تنزيل PDF لقسيمة الراتب:',
                error instanceof Error ? error.message : 'Unknown error | خطأ غير معروف'
            )
            // Show bilingual user-facing error alert
            toast.error(
                'PDF download not available | تنزيل PDF غير متاح',
                {
                    description: 'Salary slip PDF generation is not yet implemented. Please use the print function or contact support. | إنشاء PDF لقسيمة الراتب غير مطبق حالياً. يرجى استخدام وظيفة الطباعة أو التواصل مع الدعم الفني.',
                }
            )
        },
    })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { payrollService } from '@/services/payrollService'
import type { SalarySlipFilters, CreateSalarySlipData } from '@/services/payrollService'

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
    })
}

// Get single salary slip
export function useSalarySlip(id: string) {
    return useQuery({
        queryKey: payrollKeys.detail(id),
        queryFn: () => payrollService.getSalarySlip(id),
        enabled: !!id,
    })
}

// Get employee salary slips
export function useEmployeeSalarySlips(employeeId: string) {
    return useQuery({
        queryKey: payrollKeys.employee(employeeId),
        queryFn: () => payrollService.getEmployeeSalarySlips(employeeId),
        enabled: !!employeeId,
    })
}

// Get payroll stats
export function usePayrollStats(month?: number, year?: number) {
    return useQuery({
        queryKey: payrollKeys.stats(month, year),
        queryFn: () => payrollService.getPayrollStats(month, year),
    })
}

// Create salary slip
export function useCreateSalarySlip() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateSalarySlipData) => payrollService.createSalarySlip(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: payrollKeys.all })
        },
    })
}

// Update salary slip
export function useUpdateSalarySlip() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateSalarySlipData> }) =>
            payrollService.updateSalarySlip(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: payrollKeys.detail(variables.id) })
            queryClient.invalidateQueries({ queryKey: payrollKeys.lists() })
        },
    })
}

// Delete salary slip
export function useDeleteSalarySlip() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => payrollService.deleteSalarySlip(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: payrollKeys.all })
        },
    })
}

// Approve salary slip
export function useApproveSalarySlip() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => payrollService.approveSalarySlip(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: payrollKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: payrollKeys.lists() })
        },
    })
}

// Mark as paid
export function useMarkAsPaid() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, transactionReference }: { id: string; transactionReference?: string }) =>
            payrollService.markAsPaid(id, transactionReference),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: payrollKeys.detail(variables.id) })
            queryClient.invalidateQueries({ queryKey: payrollKeys.lists() })
        },
    })
}

// Generate bulk payroll
export function useGenerateBulkPayroll() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ month, year, employeeIds }: { month: number; year: number; employeeIds?: string[] }) =>
            payrollService.generateBulkPayroll(month, year, employeeIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: payrollKeys.all })
        },
    })
}

// Submit to WPS
export function useSubmitToWPS() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (ids: string[]) => payrollService.submitToWPS(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: payrollKeys.all })
        },
    })
}

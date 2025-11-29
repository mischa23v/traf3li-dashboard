/**
 * Payroll Hooks
 * React Query hooks for Payroll management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { payrollService } from '@/services/hrService'
import type { PayrollFilters, GeneratePayrollData, UpdatePayrollItemData } from '@/types/hr'

// ═══════════════════════════════════════════════════════════════
// QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all payrolls with optional filters
 */
export const usePayrolls = (filters?: PayrollFilters) => {
  return useQuery({
    queryKey: ['payrolls', filters],
    queryFn: () => payrollService.getPayrolls(filters),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get single payroll
 */
export const usePayroll = (payrollId: string) => {
  return useQuery({
    queryKey: ['payrolls', payrollId],
    queryFn: () => payrollService.getPayroll(payrollId),
    enabled: !!payrollId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get payroll by period
 */
export const usePayrollByPeriod = (year: number, month: number) => {
  return useQuery({
    queryKey: ['payrolls', 'period', year, month],
    queryFn: () => payrollService.getByPeriod(year, month),
    enabled: !!year && !!month,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get yearly summary
 */
export const usePayrollYearlySummary = (year: number) => {
  return useQuery({
    queryKey: ['payrolls', 'summary', year],
    queryFn: () => payrollService.getYearlySummary(year),
    enabled: !!year,
    staleTime: 10 * 60 * 1000,
  })
}

// ═══════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Generate payroll
 */
export const useGeneratePayroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GeneratePayrollData) =>
      payrollService.generatePayroll(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] })
      toast.success('تم إنشاء مسير الرواتب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء مسير الرواتب')
    },
  })
}

/**
 * Delete payroll
 */
export const useDeletePayroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payrollId: string) => payrollService.deletePayroll(payrollId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] })
      toast.success('تم حذف مسير الرواتب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف مسير الرواتب')
    },
  })
}

/**
 * Update payroll item
 */
export const useUpdatePayrollItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payrollId,
      itemId,
      data,
    }: {
      payrollId: string
      itemId: string
      data: UpdatePayrollItemData
    }) => payrollService.updatePayrollItem(payrollId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['payrolls', variables.payrollId],
      })
      toast.success('تم تحديث بند الراتب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث بند الراتب')
    },
  })
}

/**
 * Submit payroll for approval
 */
export const useSubmitPayroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payrollId: string) => payrollService.submitPayroll(payrollId),
    onSuccess: (_, payrollId) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] })
      queryClient.invalidateQueries({ queryKey: ['payrolls', payrollId] })
      toast.success('تم تقديم مسير الرواتب للاعتماد')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تقديم مسير الرواتب')
    },
  })
}

/**
 * Approve payroll
 */
export const useApprovePayroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payrollId: string) => payrollService.approvePayroll(payrollId),
    onSuccess: (_, payrollId) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] })
      queryClient.invalidateQueries({ queryKey: ['payrolls', payrollId] })
      toast.success('تم اعتماد مسير الرواتب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل اعتماد مسير الرواتب')
    },
  })
}

/**
 * Reject payroll
 */
export const useRejectPayroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payrollId,
      reason,
    }: {
      payrollId: string
      reason?: string
    }) => payrollService.rejectPayroll(payrollId, reason),
    onSuccess: (_, { payrollId }) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] })
      queryClient.invalidateQueries({ queryKey: ['payrolls', payrollId] })
      toast.success('تم رفض مسير الرواتب')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفض مسير الرواتب')
    },
  })
}

/**
 * Process payroll payment
 */
export const useProcessPayroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payrollId,
      paymentMethod,
      paymentReference,
    }: {
      payrollId: string
      paymentMethod: string
      paymentReference: string
    }) =>
      payrollService.processPayroll(payrollId, {
        paymentMethod,
        paymentReference,
      }),
    onSuccess: (_, { payrollId }) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] })
      queryClient.invalidateQueries({ queryKey: ['payrolls', payrollId] })
      toast.success('تم معالجة الدفعات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل معالجة الدفعات')
    },
  })
}

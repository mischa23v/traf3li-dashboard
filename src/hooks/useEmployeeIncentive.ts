import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeIncentiveService } from '@/services/employeeIncentiveService'
import type {
  EmployeeIncentiveFilters,
  CreateEmployeeIncentiveData,
  UpdateEmployeeIncentiveData,
  BulkIncentiveData,
  ApproveIncentiveData,
  RejectIncentiveData,
} from '@/services/employeeIncentiveService'
import { toast } from 'sonner'

// ==================== QUERY KEYS ====================

export const employeeIncentiveKeys = {
  all: ['employee-incentives'] as const,
  lists: () => [...employeeIncentiveKeys.all, 'list'] as const,
  list: (filters?: EmployeeIncentiveFilters) =>
    [...employeeIncentiveKeys.lists(), filters] as const,
  details: () => [...employeeIncentiveKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeIncentiveKeys.details(), id] as const,
  stats: (filters?: Omit<EmployeeIncentiveFilters, 'page' | 'limit'>) =>
    [...employeeIncentiveKeys.all, 'stats', filters] as const,
  employeeHistory: (employeeId: string) =>
    [...employeeIncentiveKeys.all, 'employee-history', employeeId] as const,
  payroll: (payrollDate: string) =>
    [...employeeIncentiveKeys.all, 'payroll', payrollDate] as const,
  pending: () => [...employeeIncentiveKeys.all, 'pending'] as const,
  awaitingProcessing: () =>
    [...employeeIncentiveKeys.all, 'awaiting-processing'] as const,
}

// ==================== QUERY HOOKS ====================

/**
 * Get all employee incentives with filters
 */
export function useEmployeeIncentives(filters?: EmployeeIncentiveFilters) {
  return useQuery({
    queryKey: employeeIncentiveKeys.list(filters),
    queryFn: () => employeeIncentiveService.getEmployeeIncentives(filters),
  })
}

/**
 * Get a single employee incentive by ID
 */
export function useEmployeeIncentive(id: string) {
  return useQuery({
    queryKey: employeeIncentiveKeys.detail(id),
    queryFn: () => employeeIncentiveService.getEmployeeIncentive(id),
    enabled: !!id,
  })
}

/**
 * Get incentive statistics
 */
export function useIncentiveStatistics(
  filters?: Omit<EmployeeIncentiveFilters, 'page' | 'limit'>
) {
  return useQuery({
    queryKey: employeeIncentiveKeys.stats(filters),
    queryFn: () => employeeIncentiveService.getIncentiveStatistics(filters),
  })
}

/**
 * Get employee incentive history
 */
export function useEmployeeIncentiveHistory(employeeId: string) {
  return useQuery({
    queryKey: employeeIncentiveKeys.employeeHistory(employeeId),
    queryFn: () => employeeIncentiveService.getEmployeeIncentiveHistory(employeeId),
    enabled: !!employeeId,
  })
}

/**
 * Get incentives for a specific payroll period
 */
export function useIncentivesForPayroll(payrollDate: string) {
  return useQuery({
    queryKey: employeeIncentiveKeys.payroll(payrollDate),
    queryFn: () => employeeIncentiveService.getIncentivesForPayroll(payrollDate),
    enabled: !!payrollDate,
  })
}

/**
 * Get pending incentives (requiring approval)
 */
export function usePendingIncentives() {
  return useQuery({
    queryKey: employeeIncentiveKeys.pending(),
    queryFn: () => employeeIncentiveService.getPendingIncentives(),
  })
}

/**
 * Get approved incentives awaiting processing
 */
export function useApprovedAwaitingProcessing() {
  return useQuery({
    queryKey: employeeIncentiveKeys.awaitingProcessing(),
    queryFn: () => employeeIncentiveService.getApprovedAwaitingProcessing(),
  })
}

// ==================== MUTATION HOOKS ====================

/**
 * Create a new employee incentive
 */
export function useCreateEmployeeIncentive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEmployeeIncentiveData) =>
      employeeIncentiveService.createEmployeeIncentive(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeIncentiveKeys.all })
      toast.success('تم إنشاء الحافز بنجاح')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل إنشاء الحافز')
    },
  })
}

/**
 * Update an employee incentive
 */
export function useUpdateEmployeeIncentive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeIncentiveData }) =>
      employeeIncentiveService.updateEmployeeIncentive(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: employeeIncentiveKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: employeeIncentiveKeys.lists() })
      toast.success('تم تحديث الحافز بنجاح')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل تحديث الحافز')
    },
  })
}

/**
 * Delete an employee incentive
 */
export function useDeleteEmployeeIncentive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeeIncentiveService.deleteEmployeeIncentive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeIncentiveKeys.all })
      toast.success('تم حذف الحافز بنجاح')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل حذف الحافز')
    },
  })
}

/**
 * Bulk delete employee incentives
 */
export function useBulkDeleteEmployeeIncentives() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) =>
      employeeIncentiveService.bulkDeleteEmployeeIncentives(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: employeeIncentiveKeys.all })
      toast.success(`تم حذف ${result.deleted} حافز بنجاح`)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل حذف الحوافز')
    },
  })
}

/**
 * Submit incentive for approval
 */
export function useSubmitIncentiveForApproval() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeeIncentiveService.submitForApproval(id),
    onSuccess: (incentive) => {
      queryClient.invalidateQueries({
        queryKey: employeeIncentiveKeys.detail(incentive._id),
      })
      queryClient.invalidateQueries({ queryKey: employeeIncentiveKeys.lists() })
      toast.success('تم إرسال الحافز للموافقة بنجاح')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل إرسال الحافز للموافقة')
    },
  })
}

/**
 * Approve an incentive
 */
export function useApproveIncentive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveIncentiveData }) =>
      employeeIncentiveService.approveIncentive(id, data),
    onSuccess: (incentive) => {
      queryClient.invalidateQueries({
        queryKey: employeeIncentiveKeys.detail(incentive._id),
      })
      queryClient.invalidateQueries({ queryKey: employeeIncentiveKeys.lists() })
      queryClient.invalidateQueries({ queryKey: employeeIncentiveKeys.pending() })
      toast.success('تم الموافقة على الحافز بنجاح')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشلت الموافقة على الحافز')
    },
  })
}

/**
 * Reject/Cancel an incentive
 */
export function useRejectIncentive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectIncentiveData }) =>
      employeeIncentiveService.rejectIncentive(id, data),
    onSuccess: (incentive) => {
      queryClient.invalidateQueries({
        queryKey: employeeIncentiveKeys.detail(incentive._id),
      })
      queryClient.invalidateQueries({ queryKey: employeeIncentiveKeys.lists() })
      queryClient.invalidateQueries({ queryKey: employeeIncentiveKeys.pending() })
      toast.success('تم رفض الحافز بنجاح')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل رفض الحافز')
    },
  })
}

/**
 * Mark incentive as processed
 */
export function useMarkIncentiveAsProcessed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payrollEntryId }: { id: string; payrollEntryId: string }) =>
      employeeIncentiveService.markAsProcessed(id, payrollEntryId),
    onSuccess: (incentive) => {
      queryClient.invalidateQueries({
        queryKey: employeeIncentiveKeys.detail(incentive._id),
      })
      queryClient.invalidateQueries({ queryKey: employeeIncentiveKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: employeeIncentiveKeys.awaitingProcessing(),
      })
      toast.success('تم تحديث حالة الحافز بنجاح')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل تحديث حالة الحافز')
    },
  })
}

/**
 * Bulk create incentives
 */
export function useBulkCreateIncentives() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkIncentiveData) =>
      employeeIncentiveService.bulkCreateIncentives(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: employeeIncentiveKeys.all })
      if (result.failed > 0) {
        toast.warning(
          `تم إنشاء ${result.created} حافز بنجاح. فشل ${result.failed} حافز`
        )
      } else {
        toast.success(`تم إنشاء ${result.created} حافز بنجاح`)
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل الإنشاء الجماعي للحوافز')
    },
  })
}

/**
 * Bulk approve incentives
 */
export function useBulkApproveIncentives() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data?: ApproveIncentiveData }) =>
      employeeIncentiveService.bulkApproveIncentives(ids, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: employeeIncentiveKeys.all })
      toast.success(`تم الموافقة على ${result.approved} حافز بنجاح`)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشلت الموافقة الجماعية على الحوافز')
    },
  })
}

/**
 * Export incentives
 */
export function useExportIncentives() {
  return useMutation({
    mutationFn: (filters?: EmployeeIncentiveFilters) =>
      employeeIncentiveService.exportIncentives(filters),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `employee-incentives-${new Date().toISOString()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('تم تصدير البيانات بنجاح')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل تصدير البيانات')
    },
  })
}

import { useQuery, useMutation } from '@tanstack/react-query'
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
import { invalidateCache } from '@/lib/cache-invalidation'

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
  return useMutation({
    mutationFn: (data: CreateEmployeeIncentiveData) =>
      employeeIncentiveService.createEmployeeIncentive(data),
    onSuccess: () => {
      invalidateCache.employeeIncentives.all()
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
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeIncentiveData }) =>
      employeeIncentiveService.updateEmployeeIncentive(id, data),
    onSuccess: (_, variables) => {
      invalidateCache.employeeIncentives.detail(variables.id)
      invalidateCache.employeeIncentives.lists()
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
  return useMutation({
    mutationFn: (id: string) => employeeIncentiveService.deleteEmployeeIncentive(id),
    onSuccess: () => {
      invalidateCache.employeeIncentives.all()
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
  return useMutation({
    mutationFn: (ids: string[]) =>
      employeeIncentiveService.bulkDeleteEmployeeIncentives(ids),
    onSuccess: (result) => {
      invalidateCache.employeeIncentives.all()
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
  return useMutation({
    mutationFn: (id: string) => employeeIncentiveService.submitForApproval(id),
    onSuccess: (incentive) => {
      invalidateCache.employeeIncentives.detail(incentive._id)
      invalidateCache.employeeIncentives.lists()
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
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveIncentiveData }) =>
      employeeIncentiveService.approveIncentive(id, data),
    onSuccess: (incentive) => {
      invalidateCache.employeeIncentives.detail(incentive._id)
      invalidateCache.employeeIncentives.lists()
      invalidateCache.employeeIncentives.pending()
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
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectIncentiveData }) =>
      employeeIncentiveService.rejectIncentive(id, data),
    onSuccess: (incentive) => {
      invalidateCache.employeeIncentives.detail(incentive._id)
      invalidateCache.employeeIncentives.lists()
      invalidateCache.employeeIncentives.pending()
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
  return useMutation({
    mutationFn: ({ id, payrollEntryId }: { id: string; payrollEntryId: string }) =>
      employeeIncentiveService.markAsProcessed(id, payrollEntryId),
    onSuccess: (incentive) => {
      invalidateCache.employeeIncentives.detail(incentive._id)
      invalidateCache.employeeIncentives.lists()
      invalidateCache.employeeIncentives.awaitingProcessing()
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
  return useMutation({
    mutationFn: (data: BulkIncentiveData) =>
      employeeIncentiveService.bulkCreateIncentives(data),
    onSuccess: (result) => {
      invalidateCache.employeeIncentives.all()
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
  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data?: ApproveIncentiveData }) =>
      employeeIncentiveService.bulkApproveIncentives(ids, data),
    onSuccess: (result) => {
      invalidateCache.employeeIncentives.all()
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

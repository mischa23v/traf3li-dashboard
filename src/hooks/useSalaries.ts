/**
 * Salary Hooks
 * React Query hooks for Salary management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { salaryService } from '@/services/hrService'
import type { SalaryFilters, CreateSalaryData, Allowance, Deduction } from '@/types/hr'

// ═══════════════════════════════════════════════════════════════
// QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all salaries with optional filters
 */
export const useSalaries = (filters?: SalaryFilters) => {
  return useQuery({
    queryKey: ['salaries', filters],
    queryFn: () => salaryService.getSalaries(filters),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get single salary
 */
export const useSalary = (salaryId: string) => {
  return useQuery({
    queryKey: ['salaries', salaryId],
    queryFn: () => salaryService.getSalary(salaryId),
    enabled: !!salaryId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get current salary for employee
 */
export const useCurrentSalary = (employeeId: string) => {
  return useQuery({
    queryKey: ['salaries', 'employee', employeeId, 'current'],
    queryFn: () => salaryService.getCurrentSalary(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get salary history for employee
 */
export const useSalaryHistory = (employeeId: string) => {
  return useQuery({
    queryKey: ['salaries', 'employee', employeeId, 'history'],
    queryFn: () => salaryService.getSalaryHistory(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get salary statistics
 */
export const useSalaryStats = () => {
  return useQuery({
    queryKey: ['salaries', 'stats'],
    queryFn: () => salaryService.getStats(),
    staleTime: 5 * 60 * 1000,
  })
}

// ═══════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create new salary structure
 */
export const useCreateSalary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSalaryData) => salaryService.createSalary(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
      queryClient.invalidateQueries({
        queryKey: ['salaries', 'employee', variables.employeeId],
      })
      toast.success('تم إنشاء هيكل الراتب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء هيكل الراتب')
    },
  })
}

/**
 * Update salary
 */
export const useUpdateSalary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      salaryId,
      data,
    }: {
      salaryId: string
      data: Partial<CreateSalaryData>
    }) => salaryService.updateSalary(salaryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
      queryClient.invalidateQueries({
        queryKey: ['salaries', variables.salaryId],
      })
      toast.success('تم تحديث الراتب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الراتب')
    },
  })
}

/**
 * Delete salary
 */
export const useDeleteSalary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (salaryId: string) => salaryService.deleteSalary(salaryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
      toast.success('تم حذف الراتب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الراتب')
    },
  })
}

/**
 * Add allowance
 */
export const useAddAllowance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      salaryId,
      data,
    }: {
      salaryId: string
      data: Omit<Allowance, '_id'>
    }) => salaryService.addAllowance(salaryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['salaries', variables.salaryId],
      })
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
      toast.success('تم إضافة البدل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة البدل')
    },
  })
}

/**
 * Add deduction
 */
export const useAddDeduction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      salaryId,
      data,
    }: {
      salaryId: string
      data: Omit<Deduction, '_id'>
    }) => salaryService.addDeduction(salaryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['salaries', variables.salaryId],
      })
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
      toast.success('تم إضافة الخصم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الخصم')
    },
  })
}

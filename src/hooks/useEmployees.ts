/**
 * Employee Hooks
 * React Query hooks for Employee management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { employeeService } from '@/services/hrService'
import type { EmployeeFilters, CreateEmployeeData, Employee } from '@/types/hr'

// ═══════════════════════════════════════════════════════════════
// QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all employees with optional filters
 */
export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeeService.getEmployees(filters),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get single employee
 */
export const useEmployee = (employeeId: string) => {
  return useQuery({
    queryKey: ['employees', employeeId],
    queryFn: () => employeeService.getEmployee(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get employee statistics
 */
export const useEmployeeStats = () => {
  return useQuery({
    queryKey: ['employees', 'stats'],
    queryFn: () => employeeService.getStats(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get organization chart
 */
export const useOrgChart = () => {
  return useQuery({
    queryKey: ['employees', 'org-chart'],
    queryFn: () => employeeService.getOrgChart(),
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Search employees
 */
export const useSearchEmployees = (query: string) => {
  return useQuery({
    queryKey: ['employees', 'search', query],
    queryFn: () => employeeService.searchEmployees(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  })
}

// ═══════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create new employee
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEmployeeData) =>
      employeeService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('تم إضافة الموظف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الموظف')
    },
  })
}

/**
 * Update employee
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      employeeId,
      data,
    }: {
      employeeId: string
      data: Partial<CreateEmployeeData>
    }) => employeeService.updateEmployee(employeeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({
        queryKey: ['employees', variables.employeeId],
      })
      toast.success('تم تحديث بيانات الموظف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث بيانات الموظف')
    },
  })
}

/**
 * Delete employee
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (employeeId: string) =>
      employeeService.deleteEmployee(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('تم حذف الموظف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الموظف')
    },
  })
}

/**
 * Update employee status
 */
export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      employeeId,
      status,
    }: {
      employeeId: string
      status: Employee['status']
    }) => employeeService.updateEmployee(employeeId, { status } as any),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({
        queryKey: ['employees', variables.employeeId],
      })
      toast.success('تم تحديث حالة الموظف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث حالة الموظف')
    },
  })
}

/**
 * Update leave balance
 */
export const useUpdateLeaveBalance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      employeeId,
      leaveType,
      balance,
    }: {
      employeeId: string
      leaveType: string
      balance: number
    }) => employeeService.updateLeaveBalance(employeeId, { leaveType, balance }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employees', variables.employeeId],
      })
      toast.success('تم تحديث رصيد الإجازات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث رصيد الإجازات')
    },
  })
}

/**
 * Add document
 */
export const useAddEmployeeDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      employeeId,
      data,
    }: {
      employeeId: string
      data: { name: string; type: string; url: string }
    }) => employeeService.addDocument(employeeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employees', variables.employeeId],
      })
      toast.success('تم إضافة المستند بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة المستند')
    },
  })
}

/**
 * Delete document
 */
export const useDeleteEmployeeDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      employeeId,
      documentId,
    }: {
      employeeId: string
      documentId: string
    }) => employeeService.deleteDocument(employeeId, documentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['employees', variables.employeeId],
      })
      toast.success('تم حذف المستند بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المستند')
    },
  })
}

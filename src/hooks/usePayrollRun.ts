import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getPayrollRuns,
  getPayrollRun,
  createPayrollRun,
  updatePayrollRun,
  deletePayrollRun,
  calculatePayrollRun,
  validatePayrollRun,
  approvePayrollRun,
  processPayments,
  generateWPSFile,
  submitWPS,
  sendPayslipNotifications,
  cancelPayrollRun,
  getPayrollRunStats,
  holdEmployee,
  unholdEmployee,
  excludeEmployee,
  includeEmployee,
  recalculateEmployee,
  exportPayrollRunReport,
  PayrollRunFilters,
  CreatePayrollRunData,
  UpdatePayrollRunData,
} from '@/services/payrollRunService'

// Query keys
export const payrollRunKeys = {
  all: ['payroll-runs'] as const,
  lists: () => [...payrollRunKeys.all, 'list'] as const,
  list: (filters: PayrollRunFilters) => [...payrollRunKeys.lists(), filters] as const,
  details: () => [...payrollRunKeys.all, 'detail'] as const,
  detail: (id: string) => [...payrollRunKeys.details(), id] as const,
  stats: () => [...payrollRunKeys.all, 'stats'] as const,
}

// Get payroll runs list
export const usePayrollRuns = (filters?: PayrollRunFilters) => {
  return useQuery({
    queryKey: payrollRunKeys.list(filters || {}),
    queryFn: () => getPayrollRuns(filters),
  })
}

// Get single payroll run
export const usePayrollRun = (runId: string) => {
  return useQuery({
    queryKey: payrollRunKeys.detail(runId),
    queryFn: () => getPayrollRun(runId),
    enabled: !!runId,
  })
}

// Get payroll run stats
export const usePayrollRunStats = () => {
  return useQuery({
    queryKey: payrollRunKeys.stats(),
    queryFn: getPayrollRunStats,
  })
}

// Create payroll run
export const useCreatePayrollRun = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePayrollRunData) => createPayrollRun(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.lists() })
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.stats() })
    },
  })
}

// Update payroll run
export const useUpdatePayrollRun = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ runId, data }: { runId: string; data: UpdatePayrollRunData }) =>
      updatePayrollRun(runId, data),
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.lists() })
    },
  })
}

// Delete payroll run
export const useDeletePayrollRun = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (runId: string) => deletePayrollRun(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.lists() })
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.stats() })
    },
  })
}

// Calculate payroll run
export const useCalculatePayrollRun = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (runId: string) => calculatePayrollRun(runId),
    onSuccess: (_, runId) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.lists() })
    },
  })
}

// Validate payroll run
export const useValidatePayrollRun = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (runId: string) => validatePayrollRun(runId),
    onSuccess: (_, runId) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
    },
  })
}

// Approve payroll run
export const useApprovePayrollRun = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ runId, comments }: { runId: string; comments?: string }) =>
      approvePayrollRun(runId, comments),
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.lists() })
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.stats() })
    },
  })
}

// Process payments
export const useProcessPayments = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (runId: string) => processPayments(runId),
    onSuccess: (_, runId) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.lists() })
    },
  })
}

// Generate WPS file
export const useGenerateWPSFile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (runId: string) => generateWPSFile(runId),
    onSuccess: (_, runId) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
    },
  })
}

// Submit WPS
export const useSubmitWPS = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (runId: string) => submitWPS(runId),
    onSuccess: (_, runId) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
    },
  })
}

// Send payslip notifications
export const useSendPayslipNotifications = () => {
  return useMutation({
    mutationFn: (runId: string) => sendPayslipNotifications(runId),
  })
}

// Cancel payroll run
export const useCancelPayrollRun = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ runId, reason }: { runId: string; reason: string }) =>
      cancelPayrollRun(runId, reason),
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.lists() })
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.stats() })
    },
  })
}

// Hold employee
export const useHoldEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ runId, employeeId, reason }: { runId: string; employeeId: string; reason: string }) =>
      holdEmployee(runId, employeeId, reason),
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
    },
  })
}

// Unhold employee
export const useUnholdEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ runId, employeeId }: { runId: string; employeeId: string }) =>
      unholdEmployee(runId, employeeId),
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
    },
  })
}

/**
 * Exclude employee from payroll run
 * @deprecated Backend endpoint not implemented - POST /payroll-runs/:id/employees/:empId/exclude
 * This hook will throw an error when called. Use alternative methods for excluding employees.
 * TODO: [BACKEND-PENDING] Implement POST /payroll-runs/:id/employees/:empId/exclude endpoint
 */
export const useExcludeEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ runId, employeeId, reason }: { runId: string; employeeId: string; reason: string }) => {
      console.warn(
        '[DEPRECATED] useExcludeEmployee: Backend endpoint not implemented | [منتهي الصلاحية] استخدام استبعاد الموظف: نقطة النهاية غير مطبقة',
        '\nEndpoint: POST /payroll-runs/:id/employees/:empId/exclude',
        '\nEmployee ID:', employeeId,
        '\nReason:', reason
      )
      return excludeEmployee(runId, employeeId, reason)
    },
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
    },
    onError: (error) => {
      console.error(
        '[ERROR] Failed to exclude employee | [خطأ] فشل استبعاد الموظف:',
        error instanceof Error ? error.message : 'Unknown error | خطأ غير معروف'
      )
      // Show bilingual user-facing error alert
      toast.error(
        'Feature not available | الميزة غير متاحة',
        {
          description: 'Employee exclusion is not yet implemented. Please contact support. | استبعاد الموظف غير مطبق حالياً. يرجى التواصل مع الدعم الفني.',
        }
      )
    },
  })
}

/**
 * Include employee back in payroll run
 * @deprecated Backend endpoint not implemented - POST /payroll-runs/:id/employees/:empId/include
 * This hook will throw an error when called. Use alternative methods for including employees.
 * TODO: [BACKEND-PENDING] Implement POST /payroll-runs/:id/employees/:empId/include endpoint
 */
export const useIncludeEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ runId, employeeId }: { runId: string; employeeId: string }) => {
      console.warn(
        '[DEPRECATED] useIncludeEmployee: Backend endpoint not implemented | [منتهي الصلاحية] استخدام تضمين الموظف: نقطة النهاية غير مطبقة',
        '\nEndpoint: POST /payroll-runs/:id/employees/:empId/include',
        '\nEmployee ID:', employeeId
      )
      return includeEmployee(runId, employeeId)
    },
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
    },
    onError: (error) => {
      console.error(
        '[ERROR] Failed to include employee | [خطأ] فشل تضمين الموظف:',
        error instanceof Error ? error.message : 'Unknown error | خطأ غير معروف'
      )
      // Show bilingual user-facing error alert
      toast.error(
        'Feature not available | الميزة غير متاحة',
        {
          description: 'Employee inclusion is not yet implemented. Please contact support. | تضمين الموظف غير مطبق حالياً. يرجى التواصل مع الدعم الفني.',
        }
      )
    },
  })
}

/**
 * Recalculate single employee in payroll run
 * @deprecated Backend endpoint not implemented - POST /payroll-runs/:id/employees/:empId/recalculate
 * This hook will throw an error when called. Use the full payroll run recalculation instead.
 * TODO: [BACKEND-PENDING] Implement POST /payroll-runs/:id/employees/:empId/recalculate endpoint
 */
export const useRecalculateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ runId, employeeId }: { runId: string; employeeId: string }) => {
      console.warn(
        '[DEPRECATED] useRecalculateEmployee: Backend endpoint not implemented | [منتهي الصلاحية] استخدام إعادة حساب الموظف: نقطة النهاية غير مطبقة',
        '\nEndpoint: POST /payroll-runs/:id/employees/:empId/recalculate',
        '\nEmployee ID:', employeeId,
        '\nSuggestion: Use useCalculatePayrollRun() to recalculate the entire payroll run | اقتراح: استخدم إعادة حساب جميع الموظفين'
      )
      return recalculateEmployee(runId, employeeId)
    },
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
    },
    onError: (error) => {
      console.error(
        '[ERROR] Failed to recalculate employee | [خطأ] فشل إعادة حساب الموظف:',
        error instanceof Error ? error.message : 'Unknown error | خطأ غير معروف'
      )
      // Show bilingual user-facing error alert
      toast.error(
        'Feature not available | الميزة غير متاحة',
        {
          description: 'Individual employee recalculation is not yet implemented. Please recalculate the entire payroll run instead. | إعادة حساب الموظف الفردي غير مطبق حالياً. يرجى إعادة حساب دورة الرواتب بالكامل.',
        }
      )
    },
  })
}

/**
 * Export payroll run report
 * @deprecated Backend endpoint not implemented - GET /payroll-runs/:id/export
 * This hook will throw an error when called. Report export functionality is not yet available.
 * TODO: [BACKEND-PENDING] Implement GET /payroll-runs/:id/export endpoint with support for multiple formats
 */
export const useExportPayrollRunReport = () => {
  return useMutation({
    mutationFn: ({
      runId,
      reportType,
      format,
    }: {
      runId: string
      reportType: 'summary' | 'detailed' | 'bank_file' | 'wps_sif' | 'journal_entry'
      format: 'pdf' | 'excel' | 'csv'
    }) => {
      console.warn(
        '[DEPRECATED] useExportPayrollRunReport: Backend endpoint not implemented | [منتهي الصلاحية] استخدام تصدير تقرير الرواتب: نقطة النهاية غير مطبقة',
        '\nEndpoint: GET /payroll-runs/:id/export',
        '\nReport Type:', reportType,
        '\nFormat:', format
      )
      return exportPayrollRunReport(runId, reportType, format)
    },
    onError: (error) => {
      console.error(
        '[ERROR] Failed to export payroll run report | [خطأ] فشل تصدير تقرير الرواتب:',
        error instanceof Error ? error.message : 'Unknown error | خطأ غير معروف'
      )
      // Show bilingual user-facing error alert
      toast.error(
        'Export not available | التصدير غير متاح',
        {
          description: 'Payroll report export is not yet implemented. Please contact support. | تصدير تقرير الرواتب غير مطبق حالياً. يرجى التواصل مع الدعم الفني.',
        }
      )
    },
  })
}

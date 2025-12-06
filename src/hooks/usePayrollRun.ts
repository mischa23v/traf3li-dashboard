import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

// Exclude employee
export const useExcludeEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ runId, employeeId, reason }: { runId: string; employeeId: string; reason: string }) =>
      excludeEmployee(runId, employeeId, reason),
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
    },
  })
}

// Include employee
export const useIncludeEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ runId, employeeId }: { runId: string; employeeId: string }) =>
      includeEmployee(runId, employeeId),
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
    },
  })
}

// Recalculate employee
export const useRecalculateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ runId, employeeId }: { runId: string; employeeId: string }) =>
      recalculateEmployee(runId, employeeId),
    onSuccess: (_, { runId }) => {
      queryClient.invalidateQueries({ queryKey: payrollRunKeys.detail(runId) })
    },
  })
}

// Export payroll run report
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
    }) => exportPayrollRunReport(runId, reportType, format),
  })
}

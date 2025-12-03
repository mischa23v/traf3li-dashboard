/**
 * HR Hooks
 * Production-ready TanStack Query hooks for Human Resources management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import {
  employeeService,
  leaveService,
  attendanceService,
  salaryService,
  payrollService,
  evaluationService,
} from '@/services/hrService'
import {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeFilters,
  LeaveRequest,
  CreateLeaveRequestData,
  UpdateLeaveRequestData,
  LeaveFilters,
  AttendanceRecord,
  CreateAttendanceData,
  UpdateAttendanceData,
  AttendanceFilters,
  SalaryRecord,
  CreateSalaryData,
  UpdateSalaryData,
  SalaryFilters,
  Payroll,
  CreatePayrollData,
  UpdatePayrollData,
  PayrollFilters,
  PerformanceEvaluation,
  CreateEvaluationData,
  UpdateEvaluationData,
  EvaluationFilters,
} from '@/types/hr'

// ==================== EMPLOYEE HOOKS ====================

export const useEmployees = (filters?: EmployeeFilters) => {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeeService.getEmployees(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeeService.getEmployee(id),
    enabled: !!id,
  })
}

export const useEmployeeStats = () => {
  return useQuery({
    queryKey: ['employees', 'stats'],
    queryFn: () => employeeService.getStats(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEmployeeData) => employeeService.createEmployee(data),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم إضافة الموظف بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إضافة الموظف',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeData }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم تحديث بيانات الموظف بنجاح',
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
      return await queryClient.invalidateQueries({ queryKey: ['employees', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث بيانات الموظف',
        variant: 'destructive',
      })
    },
  })
}

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف الموظف بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف الموظف',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Employee['status'] }) =>
      employeeService.updateStatus(id, status),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم تحديث حالة الموظف',
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
      return await queryClient.invalidateQueries({ queryKey: ['employees', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث الحالة',
        variant: 'destructive',
      })
    },
  })
}

export const useBulkDeleteEmployees = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (employeeIds: string[]) => {
      const results = await Promise.allSettled(
        employeeIds.map((id) => employeeService.deleteEmployee(id))
      )
      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        throw new Error(`فشل حذف ${failed.length} من ${employeeIds.length} موظف`)
      }
      return results
    },
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف الموظفين المحددين بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف الموظفين',
        variant: 'destructive',
      })
    },
  })
}

// ==================== LEAVE HOOKS ====================

export const useLeaves = (filters?: LeaveFilters) => {
  return useQuery({
    queryKey: ['leaves', filters],
    queryFn: () => leaveService.getLeaves(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useLeave = (id: string) => {
  return useQuery({
    queryKey: ['leaves', id],
    queryFn: () => leaveService.getLeave(id),
    enabled: !!id,
  })
}

export const useLeaveStats = () => {
  return useQuery({
    queryKey: ['leaves', 'stats'],
    queryFn: () => leaveService.getStats(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useLeaveBalance = (employeeId: string) => {
  return useQuery({
    queryKey: ['leaves', 'balance', employeeId],
    queryFn: () => leaveService.getBalance(employeeId),
    enabled: !!employeeId,
  })
}

export const useCreateLeave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeaveRequestData) => leaveService.createLeave(data),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم تقديم طلب الإجازة بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['leaves'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تقديم طلب الإجازة',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdateLeave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeaveRequestData }) =>
      leaveService.updateLeave(id, data),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم تحديث طلب الإجازة بنجاح',
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['leaves'] })
      return await queryClient.invalidateQueries({ queryKey: ['leaves', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث طلب الإجازة',
        variant: 'destructive',
      })
    },
  })
}

export const useDeleteLeave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => leaveService.deleteLeave(id),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف طلب الإجازة بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['leaves'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف طلب الإجازة',
        variant: 'destructive',
      })
    },
  })
}

export const useApproveLeave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => leaveService.approveLeave(id),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تمت الموافقة على الإجازة',
      })
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['leaves'] })
      return await queryClient.invalidateQueries({ queryKey: ['leaves', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في الموافقة على الإجازة',
        variant: 'destructive',
      })
    },
  })
}

export const useRejectLeave = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      leaveService.rejectLeave(id, reason),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم رفض طلب الإجازة',
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['leaves'] })
      return await queryClient.invalidateQueries({ queryKey: ['leaves', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في رفض طلب الإجازة',
        variant: 'destructive',
      })
    },
  })
}

export const useBulkDeleteLeaves = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (leaveIds: string[]) => {
      const results = await Promise.allSettled(
        leaveIds.map((id) => leaveService.deleteLeave(id))
      )
      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        throw new Error(`فشل حذف ${failed.length} من ${leaveIds.length} طلب`)
      }
      return results
    },
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف الطلبات المحددة بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['leaves'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف الطلبات',
        variant: 'destructive',
      })
    },
  })
}

// ==================== ATTENDANCE HOOKS ====================

export const useAttendanceRecords = (filters?: AttendanceFilters) => {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => attendanceService.getRecords(filters),
    staleTime: 1 * 60 * 1000,
  })
}

export const useAttendanceRecord = (id: string) => {
  return useQuery({
    queryKey: ['attendance', id],
    queryFn: () => attendanceService.getRecord(id),
    enabled: !!id,
  })
}

export const useTodayAttendance = () => {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => attendanceService.getTodayAttendance(),
    staleTime: 1 * 60 * 1000,
  })
}

export const useAttendanceStats = (filters?: AttendanceFilters) => {
  return useQuery({
    queryKey: ['attendance', 'stats', filters],
    queryFn: () => attendanceService.getStats(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAttendanceData) => attendanceService.createRecord(data),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم تسجيل الحضور بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تسجيل الحضور',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceData }) =>
      attendanceService.updateRecord(id, data),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم تحديث سجل الحضور بنجاح',
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['attendance'] })
      return await queryClient.invalidateQueries({ queryKey: ['attendance', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث سجل الحضور',
        variant: 'destructive',
      })
    },
  })
}

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => attendanceService.deleteRecord(id),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف سجل الحضور بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف سجل الحضور',
        variant: 'destructive',
      })
    },
  })
}

export const useClockIn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ employeeId, location }: { employeeId: string; location?: string }) =>
      attendanceService.clockIn(employeeId, location),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم تسجيل الدخول بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تسجيل الدخول',
        variant: 'destructive',
      })
    },
  })
}

export const useClockOut = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ employeeId, location }: { employeeId: string; location?: string }) =>
      attendanceService.clockOut(employeeId, location),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم تسجيل الخروج بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تسجيل الخروج',
        variant: 'destructive',
      })
    },
  })
}

export const useBulkDeleteAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (recordIds: string[]) => {
      const results = await Promise.allSettled(
        recordIds.map((id) => attendanceService.deleteRecord(id))
      )
      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        throw new Error(`فشل حذف ${failed.length} من ${recordIds.length} سجل`)
      }
      return results
    },
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف السجلات المحددة بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف السجلات',
        variant: 'destructive',
      })
    },
  })
}

// ==================== SALARY HOOKS ====================

export const useSalaries = (filters?: SalaryFilters) => {
  return useQuery({
    queryKey: ['salaries', filters],
    queryFn: () => salaryService.getSalaries(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useSalary = (id: string) => {
  return useQuery({
    queryKey: ['salaries', id],
    queryFn: () => salaryService.getSalary(id),
    enabled: !!id,
  })
}

export const useCreateSalary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSalaryData) => salaryService.createSalary(data),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم إنشاء سجل الراتب بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['salaries'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إنشاء سجل الراتب',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdateSalary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalaryData }) =>
      salaryService.updateSalary(id, data),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم تحديث سجل الراتب بنجاح',
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['salaries'] })
      return await queryClient.invalidateQueries({ queryKey: ['salaries', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث سجل الراتب',
        variant: 'destructive',
      })
    },
  })
}

export const useDeleteSalary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salaryService.deleteSalary(id),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف سجل الراتب بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['salaries'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف سجل الراتب',
        variant: 'destructive',
      })
    },
  })
}

export const useApproveSalary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salaryService.approveSalary(id),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تمت الموافقة على الراتب',
      })
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['salaries'] })
      return await queryClient.invalidateQueries({ queryKey: ['salaries', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في الموافقة على الراتب',
        variant: 'destructive',
      })
    },
  })
}

export const useMarkSalaryPaid = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, paymentDetails }: { id: string; paymentDetails: { paymentDate: string; paymentMethod: string; paymentReference?: string } }) =>
      salaryService.markAsPaid(id, paymentDetails),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم تسجيل الدفع بنجاح',
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['salaries'] })
      return await queryClient.invalidateQueries({ queryKey: ['salaries', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تسجيل الدفع',
        variant: 'destructive',
      })
    },
  })
}

export const useBulkDeleteSalaries = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (salaryIds: string[]) => {
      const results = await Promise.allSettled(
        salaryIds.map((id) => salaryService.deleteSalary(id))
      )
      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        throw new Error(`فشل حذف ${failed.length} من ${salaryIds.length} سجل`)
      }
      return results
    },
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف السجلات المحددة بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['salaries'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف السجلات',
        variant: 'destructive',
      })
    },
  })
}

// ==================== PAYROLL HOOKS ====================

export const usePayrolls = (filters?: PayrollFilters) => {
  return useQuery({
    queryKey: ['payroll', filters],
    queryFn: () => payrollService.getPayrolls(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const usePayroll = (id: string) => {
  return useQuery({
    queryKey: ['payroll', id],
    queryFn: () => payrollService.getPayroll(id),
    enabled: !!id,
  })
}

export const usePayrollStats = (year?: number) => {
  return useQuery({
    queryKey: ['payroll', 'stats', year],
    queryFn: () => payrollService.getStats(year),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreatePayroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePayrollData) => payrollService.createPayroll(data),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم إنشاء مسير الرواتب بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['payroll'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إنشاء مسير الرواتب',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdatePayroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePayrollData }) =>
      payrollService.updatePayroll(id, data),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم تحديث مسير الرواتب بنجاح',
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['payroll'] })
      return await queryClient.invalidateQueries({ queryKey: ['payroll', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث مسير الرواتب',
        variant: 'destructive',
      })
    },
  })
}

export const useDeletePayroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => payrollService.deletePayroll(id),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف مسير الرواتب بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['payroll'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف مسير الرواتب',
        variant: 'destructive',
      })
    },
  })
}

export const useProcessPayroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => payrollService.processPayroll(id),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تتم معالجة مسير الرواتب',
      })
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['payroll'] })
      await queryClient.invalidateQueries({ queryKey: ['payroll', id] })
      return await queryClient.invalidateQueries({ queryKey: ['salaries'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في معالجة مسير الرواتب',
        variant: 'destructive',
      })
    },
  })
}

export const useCompletePayroll = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => payrollService.completePayroll(id),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم اكتمال مسير الرواتب',
      })
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['payroll'] })
      return await queryClient.invalidateQueries({ queryKey: ['payroll', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في اكتمال مسير الرواتب',
        variant: 'destructive',
      })
    },
  })
}

export const useBulkDeletePayrolls = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payrollIds: string[]) => {
      const results = await Promise.allSettled(
        payrollIds.map((id) => payrollService.deletePayroll(id))
      )
      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        throw new Error(`فشل حذف ${failed.length} من ${payrollIds.length} مسير`)
      }
      return results
    },
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف المسيرات المحددة بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['payroll'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف المسيرات',
        variant: 'destructive',
      })
    },
  })
}

// ==================== EVALUATION HOOKS ====================

export const useEvaluations = (filters?: EvaluationFilters) => {
  return useQuery({
    queryKey: ['evaluations', filters],
    queryFn: () => evaluationService.getEvaluations(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useEvaluation = (id: string) => {
  return useQuery({
    queryKey: ['evaluations', id],
    queryFn: () => evaluationService.getEvaluation(id),
    enabled: !!id,
  })
}

export const useCreateEvaluation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEvaluationData) => evaluationService.createEvaluation(data),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم إنشاء التقييم بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إنشاء التقييم',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdateEvaluation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEvaluationData }) =>
      evaluationService.updateEvaluation(id, data),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم تحديث التقييم بنجاح',
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      return await queryClient.invalidateQueries({ queryKey: ['evaluations', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث التقييم',
        variant: 'destructive',
      })
    },
  })
}

export const useDeleteEvaluation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => evaluationService.deleteEvaluation(id),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف التقييم بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف التقييم',
        variant: 'destructive',
      })
    },
  })
}

export const useCompleteEvaluation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => evaluationService.completeEvaluation(id),
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم اكتمال التقييم',
      })
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: ['evaluations'] })
      return await queryClient.invalidateQueries({ queryKey: ['evaluations', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في اكتمال التقييم',
        variant: 'destructive',
      })
    },
  })
}

export const useBulkDeleteEvaluations = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (evaluationIds: string[]) => {
      const results = await Promise.allSettled(
        evaluationIds.map((id) => evaluationService.deleteEvaluation(id))
      )
      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        throw new Error(`فشل حذف ${failed.length} من ${evaluationIds.length} تقييم`)
      }
      return results
    },
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم حذف التقييمات المحددة بنجاح',
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في حذف التقييمات',
        variant: 'destructive',
      })
    },
  })
}

// ==================== ALIAS EXPORTS ====================
// These aliases provide alternative naming conventions for hooks

// Leave aliases
export const useLeaveRequest = useLeave
export const useDeleteLeaveRequest = useDeleteLeave
export const useUpdateLeaveRequestStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      if (status === 'approved') {
        return leaveService.approveLeave(id)
      } else {
        return leaveService.rejectLeave(id, '')
      }
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['leaves'] })
      return await queryClient.invalidateQueries({ queryKey: ['leaves', id] })
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تحديث حالة الإجازة',
        variant: 'destructive',
      })
    },
  })
}

// Attendance aliases
export const useDeleteAttendanceRecord = useDeleteAttendance

// Salary aliases
export const useSalaryRecord = useSalary
export const useDeleteSalaryRecord = useDeleteSalary

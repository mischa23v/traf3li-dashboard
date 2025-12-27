import { useQuery, useMutation } from '@tanstack/react-query'
import {
  retentionBonusApi,
  RetentionBonus,
  RetentionBonusFilters,
  CreateRetentionBonusInput,
  UpdateRetentionBonusInput,
  BonusPaymentData,
  BonusClawbackData,
  ApprovalActionData
} from '@/services/retentionBonusService'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'

// Query Keys
export const retentionBonusKeys = {
  all: ['retention-bonuses'] as const,
  lists: () => [...retentionBonusKeys.all, 'list'] as const,
  list: (filters?: RetentionBonusFilters) => [...retentionBonusKeys.lists(), filters] as const,
  details: () => [...retentionBonusKeys.all, 'detail'] as const,
  detail: (id: string) => [...retentionBonusKeys.details(), id] as const,
  employeeHistory: (employeeId: string) => [...retentionBonusKeys.all, 'employee-history', employeeId] as const,
  vestingStatus: (id: string) => [...retentionBonusKeys.all, 'vesting-status', id] as const,
  dueForPayment: (date?: string) => [...retentionBonusKeys.all, 'due-for-payment', date] as const,
  stats: (filters?: RetentionBonusFilters) => [...retentionBonusKeys.all, 'stats', filters] as const,
  pendingApprovals: () => [...retentionBonusKeys.all, 'pending-approvals'] as const,
  departmentSummary: (departmentId?: string) => [...retentionBonusKeys.all, 'department-summary', departmentId] as const
}

// ==================== QUERY HOOKS ====================

// Get all retention bonuses
export function useRetentionBonuses(filters?: RetentionBonusFilters) {
  return useQuery({
    queryKey: retentionBonusKeys.list(filters),
    queryFn: () => retentionBonusApi.getAll(filters)
  })
}

// Get single retention bonus
export function useRetentionBonus(id: string) {
  return useQuery({
    queryKey: retentionBonusKeys.detail(id),
    queryFn: () => retentionBonusApi.getById(id),
    enabled: !!id
  })
}

// Get employee bonus history
export function useEmployeeBonusHistory(employeeId: string) {
  return useQuery({
    queryKey: retentionBonusKeys.employeeHistory(employeeId),
    queryFn: () => retentionBonusApi.getEmployeeBonusHistory(employeeId),
    enabled: !!employeeId
  })
}

// Get vesting status
export function useVestingStatus(id: string) {
  return useQuery({
    queryKey: retentionBonusKeys.vestingStatus(id),
    queryFn: () => retentionBonusApi.getVestingStatus(id),
    enabled: !!id
  })
}

// Get bonuses due for payment
export function useBonusesDueForPayment(date?: string) {
  return useQuery({
    queryKey: retentionBonusKeys.dueForPayment(date),
    queryFn: () => retentionBonusApi.getBonusesDueForPayment(date)
  })
}

// Get statistics
export function useRetentionBonusStats(filters?: RetentionBonusFilters) {
  return useQuery({
    queryKey: retentionBonusKeys.stats(filters),
    queryFn: () => retentionBonusApi.getStats(filters)
  })
}

// Get pending approvals
export function usePendingApprovals() {
  return useQuery({
    queryKey: retentionBonusKeys.pendingApprovals(),
    queryFn: () => retentionBonusApi.getPendingApprovals()
  })
}

// Get department summary
export function useDepartmentSummary(departmentId?: string) {
  return useQuery({
    queryKey: retentionBonusKeys.departmentSummary(departmentId),
    queryFn: () => retentionBonusApi.getDepartmentSummary(departmentId)
  })
}

// ==================== MUTATION HOOKS ====================

// Create retention bonus
export function useCreateRetentionBonus() {
  return useMutation({
    mutationFn: (data: CreateRetentionBonusInput) => retentionBonusApi.create(data),
    onSuccess: () => {
      invalidateCache.retentionBonus.all()
      toast.success('تم إنشاء مكافأة الاستبقاء بنجاح', {
        description: 'تم حفظ البيانات بنجاح'
      })
    },
    onError: (error: Error) => {
      toast.error('فشل إنشاء مكافأة الاستبقاء', {
        description: error.message
      })
    }
  })
}

// Update retention bonus
export function useUpdateRetentionBonus() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRetentionBonusInput }) =>
      retentionBonusApi.update(id, data),
    onSuccess: (_, variables) => {
      invalidateCache.retentionBonus.all()
      invalidateCache.retentionBonus.detail(variables.id)
      toast.success('تم تحديث مكافأة الاستبقاء بنجاح', {
        description: 'تم حفظ التعديلات بنجاح'
      })
    },
    onError: (error: Error) => {
      toast.error('فشل تحديث مكافأة الاستبقاء', {
        description: error.message
      })
    }
  })
}

// Delete retention bonus
export function useDeleteRetentionBonus() {
  return useMutation({
    mutationFn: (id: string) => retentionBonusApi.delete(id),
    onSuccess: () => {
      invalidateCache.retentionBonus.all()
      toast.success('تم حذف مكافأة الاستبقاء بنجاح', {
        description: 'تم حذف السجل بنجاح'
      })
    },
    onError: (error: Error) => {
      toast.error('فشل حذف مكافأة الاستبقاء', {
        description: error.message
      })
    }
  })
}

// Bulk delete retention bonuses
export function useBulkDeleteRetentionBonuses() {
  return useMutation({
    mutationFn: (ids: string[]) => retentionBonusApi.bulkDelete(ids),
    onSuccess: () => {
      invalidateCache.retentionBonus.all()
      toast.success('تم حذف المكافآت المحددة بنجاح', {
        description: 'تم حذف السجلات بنجاح'
      })
    },
    onError: (error: Error) => {
      toast.error('فشل حذف المكافآت', {
        description: error.message
      })
    }
  })
}

// ==================== APPROVAL MUTATION HOOKS ====================

// Submit for approval
export function useSubmitForApproval() {
  return useMutation({
    mutationFn: (id: string) => retentionBonusApi.submitForApproval(id),
    onSuccess: (_, id) => {
      invalidateCache.retentionBonus.detail(id)
      invalidateCache.retentionBonus.all()
      toast.success('تم إرسال المكافأة للموافقة', {
        description: 'تم تقديم الطلب للموافقة بنجاح'
      })
    },
    onError: (error: Error) => {
      toast.error('فشل إرسال المكافأة للموافقة', {
        description: error.message
      })
    }
  })
}

// Approve bonus
export function useApproveBonus() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApprovalActionData }) =>
      retentionBonusApi.approveBonus(id, data),
    onSuccess: (_, variables) => {
      invalidateCache.retentionBonus.detail(variables.id)
      invalidateCache.retentionBonus.all()
      invalidateCache.retentionBonus.pendingApprovals()
      toast.success('تم الموافقة على المكافأة بنجاح', {
        description: 'تمت الموافقة بنجاح'
      })
    },
    onError: (error: Error) => {
      toast.error('فشلت الموافقة على المكافأة', {
        description: error.message
      })
    }
  })
}

// Reject bonus
export function useRejectBonus() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApprovalActionData }) =>
      retentionBonusApi.rejectBonus(id, data),
    onSuccess: (_, variables) => {
      invalidateCache.retentionBonus.detail(variables.id)
      invalidateCache.retentionBonus.all()
      invalidateCache.retentionBonus.pendingApprovals()
      toast.success('تم رفض المكافأة', {
        description: 'تم رفض الطلب بنجاح'
      })
    },
    onError: (error: Error) => {
      toast.error('فشل رفض المكافأة', {
        description: error.message
      })
    }
  })
}

// ==================== PAYMENT MUTATION HOOKS ====================

// Mark as paid
export function useMarkBonusAsPaid() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BonusPaymentData }) =>
      retentionBonusApi.markAsPaid(id, data),
    onSuccess: (_, variables) => {
      invalidateCache.retentionBonus.detail(variables.id)
      invalidateCache.retentionBonus.all()
      invalidateCache.retentionBonus.dueForPayment()
      toast.success('تم تسجيل الدفعة بنجاح', {
        description: 'تم تحديث حالة المكافأة إلى مدفوعة'
      })
    },
    onError: (error: Error) => {
      toast.error('فشل تسجيل الدفعة', {
        description: error.message
      })
    }
  })
}

// Process clawback
export function useProcessClawback() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BonusClawbackData }) =>
      retentionBonusApi.processClawback(id, data),
    onSuccess: (_, variables) => {
      invalidateCache.retentionBonus.detail(variables.id)
      invalidateCache.retentionBonus.all()
      toast.success('تم معالجة الاسترداد بنجاح', {
        description: 'تم استرداد المكافأة بنجاح'
      })
    },
    onError: (error: Error) => {
      toast.error('فشلت معالجة الاسترداد', {
        description: error.message
      })
    }
  })
}

// Cancel bonus
export function useCancelBonus() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      retentionBonusApi.cancelBonus(id, reason),
    onSuccess: (_, variables) => {
      invalidateCache.retentionBonus.detail(variables.id)
      invalidateCache.retentionBonus.all()
      toast.success('تم إلغاء المكافأة بنجاح', {
        description: 'تم إلغاء المكافأة'
      })
    },
    onError: (error: Error) => {
      toast.error('فشل إلغاء المكافأة', {
        description: error.message
      })
    }
  })
}

// ==================== CALCULATION HOOKS ====================

// Calculate vested amount
export function useCalculateVestedAmount() {
  return useMutation({
    mutationFn: ({ id, asOfDate }: { id: string; asOfDate?: string }) =>
      retentionBonusApi.calculateVestedAmount(id, asOfDate),
    onError: (error: Error) => {
      toast.error('فشل حساب المبلغ المكتسب', {
        description: error.message
      })
    }
  })
}

// ==================== EXPORT HOOKS ====================

// Export bonuses
export function useExportBonuses() {
  return useMutation({
    mutationFn: (filters?: RetentionBonusFilters) => retentionBonusApi.exportBonuses(filters),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `retention-bonuses-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('تم تصدير البيانات بنجاح', {
        description: 'تم تنزيل الملف بنجاح'
      })
    },
    onError: (error: Error) => {
      toast.error('فشل تصدير البيانات', {
        description: error.message
      })
    }
  })
}

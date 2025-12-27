import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import employeeTransferService, {
  type EmployeeTransferFilters,
  type CreateEmployeeTransferData,
  type UpdateEmployeeTransferData,
  type TransferStatus,
  type HandoverChecklistItem,
  type ApprovalStep,
} from '@/services/employeeTransferService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ==================== QUERY KEYS ====================

export const employeeTransferKeys = {
  all: ['employee-transfers'] as const,
  lists: () => [...employeeTransferKeys.all, 'list'] as const,
  list: (filters?: EmployeeTransferFilters) => [...employeeTransferKeys.lists(), filters] as const,
  details: () => [...employeeTransferKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeTransferKeys.details(), id] as const,
  stats: () => [...employeeTransferKeys.all, 'stats'] as const,
  history: (employeeId: string) => [...employeeTransferKeys.all, 'history', employeeId] as const,
  pendingApprovals: (approverId?: string) => [...employeeTransferKeys.all, 'pending-approvals', approverId] as const,
  pendingHandovers: () => [...employeeTransferKeys.all, 'pending-handovers'] as const,
}

// ==================== QUERIES ====================

export const useEmployeeTransfers = (filters?: EmployeeTransferFilters) => {
  return useQuery({
    queryKey: employeeTransferKeys.list(filters),
    queryFn: () => employeeTransferService.getTransfers(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

export const useEmployeeTransfer = (id: string) => {
  return useQuery({
    queryKey: employeeTransferKeys.detail(id),
    queryFn: () => employeeTransferService.getTransfer(id),
    enabled: !!id,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

export const useEmployeeTransferStats = () => {
  return useQuery({
    queryKey: employeeTransferKeys.stats(),
    queryFn: () => employeeTransferService.getTransferStats(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

export const useEmployeeTransferHistory = (employeeId: string) => {
  return useQuery({
    queryKey: employeeTransferKeys.history(employeeId),
    queryFn: () => employeeTransferService.getTransferHistory(employeeId),
    enabled: !!employeeId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

export const usePendingApprovals = (approverId?: string) => {
  return useQuery({
    queryKey: employeeTransferKeys.pendingApprovals(approverId),
    queryFn: () => employeeTransferService.getPendingApprovals(approverId),
    staleTime: 2 * 60 * 1000,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

export const usePendingHandovers = () => {
  return useQuery({
    queryKey: employeeTransferKeys.pendingHandovers(),
    queryFn: () => employeeTransferService.getPendingHandovers(),
    staleTime: 2 * 60 * 1000,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

// ==================== MUTATIONS ====================

export const useCreateEmployeeTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEmployeeTransferData) => employeeTransferService.createTransfer(data),
    onSuccess: () => {
      toast.success('تم إنشاء طلب النقل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء طلب النقل')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.stats() })
    },
  })
}

export const useUpdateEmployeeTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeTransferData }) =>
      employeeTransferService.updateTransfer(id, data),
    onSuccess: () => {
      toast.success('تم تحديث طلب النقل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث طلب النقل')
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.detail(variables.id) })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.stats() })
    },
  })
}

export const useDeleteEmployeeTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeeTransferService.deleteTransfer(id),
    onSuccess: () => {
      toast.success('تم حذف طلب النقل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف طلب النقل')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.stats() })
    },
  })
}

export const useBulkDeleteEmployeeTransfers = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => employeeTransferService.bulkDeleteTransfers(ids),
    onSuccess: (_, variables) => {
      toast.success(`تم حذف ${variables.length} طلب نقل بنجاح`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف طلبات النقل')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.stats() })
    },
  })
}

// ==================== TRANSFER OPERATIONS ====================

export const useApplyTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeeTransferService.applyTransfer(id),
    onSuccess: () => {
      toast.success('تم تطبيق النقل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تطبيق النقل')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.detail(id) })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.stats() })
      await queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export const useApproveTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      employeeTransferService.approveTransfer(id, comments),
    onSuccess: () => {
      toast.success('تم الموافقة على طلب النقل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل الموافقة على طلب النقل')
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.detail(variables.id) })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.pendingApprovals() })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.stats() })
    },
  })
}

export const useRejectTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) =>
      employeeTransferService.rejectTransfer(id, comments),
    onSuccess: () => {
      toast.success('تم رفض طلب النقل')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفض طلب النقل')
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.detail(variables.id) })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.pendingApprovals() })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.stats() })
    },
  })
}

export const useUpdateTransferStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TransferStatus }) =>
      employeeTransferService.updateTransferStatus(id, status),
    onSuccess: () => {
      toast.success('تم تحديث حالة النقل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث حالة النقل')
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.detail(variables.id) })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.stats() })
    },
  })
}

// ==================== HANDOVER ====================

export const useUpdateHandoverItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, itemIndex, completed }: { id: string; itemIndex: number; completed: boolean }) =>
      employeeTransferService.updateHandoverItem(id, itemIndex, completed),
    onSuccess: () => {
      toast.success('تم تحديث عنصر التسليم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث عنصر التسليم')
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.detail(variables.id) })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.pendingHandovers() })
    },
  })
}

export const useAddHandoverItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, item }: { id: string; item: Partial<HandoverChecklistItem> }) =>
      employeeTransferService.addHandoverItem(id, item),
    onSuccess: () => {
      toast.success('تم إضافة عنصر التسليم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة عنصر التسليم')
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.detail(variables.id) })
    },
  })
}

// ==================== APPROVAL WORKFLOW ====================

export const useAddApprovalStep = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, approver }: { id: string; approver: Partial<ApprovalStep> }) =>
      employeeTransferService.addApprovalStep(id, approver),
    onSuccess: () => {
      toast.success('تم إضافة خطوة الموافقة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة خطوة الموافقة')
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.detail(variables.id) })
    },
  })
}

export const useUpdateApprovalStep = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, stepIndex, data }: { id: string; stepIndex: number; data: Partial<ApprovalStep> }) =>
      employeeTransferService.updateApprovalStep(id, stepIndex, data),
    onSuccess: () => {
      toast.success('تم تحديث خطوة الموافقة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث خطوة الموافقة')
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.detail(variables.id) })
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.pendingApprovals() })
    },
  })
}

// ==================== NOTIFICATIONS ====================

export const useNotifyEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeeTransferService.notifyEmployee(id),
    onSuccess: () => {
      toast.success('تم إرسال الإشعار للموظف بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الإشعار')
    },
    onSettled: async (_, __, id) => {
      await queryClient.invalidateQueries({ queryKey: employeeTransferKeys.detail(id) })
    },
  })
}

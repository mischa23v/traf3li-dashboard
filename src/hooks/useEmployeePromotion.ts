import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import { QueryKeys } from '@/lib/query-keys'
import employeePromotionService, {
  PromotionFilters,
  CreatePromotionInput,
  UpdatePromotionInput,
} from '@/services/employeePromotionService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ==================== PROMOTIONS ====================

/**
 * Get all promotions with optional filters
 */
export const usePromotions = (filters?: PromotionFilters) => {
  return useQuery({
    queryKey: QueryKeys.employeePromotion.list(filters),
    queryFn: () => employeePromotionService.getPromotions(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

/**
 * Get a single promotion by ID
 */
export const usePromotion = (id: string) => {
  return useQuery({
    queryKey: QueryKeys.employeePromotion.detail(id),
    queryFn: () => employeePromotionService.getPromotion(id),
    enabled: !!id,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

/**
 * Get promotion statistics
 */
export const usePromotionStats = (filters?: {
  departmentId?: string
  dateFrom?: string
  dateTo?: string
}) => {
  return useQuery({
    queryKey: QueryKeys.employeePromotion.stats(filters),
    queryFn: () => employeePromotionService.getPromotionStats(filters),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

/**
 * Get pending promotions (requiring approval)
 */
export const usePendingPromotions = () => {
  return useQuery({
    queryKey: QueryKeys.employeePromotion.pending(),
    queryFn: () => employeePromotionService.getPendingPromotions(),
    staleTime: CACHE_TIMES.SHORT,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

/**
 * Get promotions awaiting application
 */
export const usePromotionsAwaitingApplication = () => {
  return useQuery({
    queryKey: QueryKeys.employeePromotion.awaitingApplication(),
    queryFn: () => employeePromotionService.getPromotionsAwaitingApplication(),
    staleTime: CACHE_TIMES.SHORT,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

/**
 * Get promotion history for a specific employee
 */
export const usePromotionHistory = (employeeId: string) => {
  return useQuery({
    queryKey: QueryKeys.employeePromotion.history(employeeId),
    queryFn: () => employeePromotionService.getPromotionHistory(employeeId),
    enabled: !!employeeId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

/**
 * Get all promotions for a specific employee
 */
export const useEmployeePromotions = (
  employeeId: string,
  filters?: Omit<PromotionFilters, 'employeeId'>
) => {
  return useQuery({
    queryKey: QueryKeys.employeePromotion.employee(employeeId, filters),
    queryFn: () => employeePromotionService.getEmployeePromotions(employeeId, filters),
    enabled: !!employeeId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false,
  })
}

// ==================== MUTATIONS ====================

/**
 * Create a new promotion
 */
export const useCreatePromotion = () => {
  return useMutation({
    mutationFn: (data: CreatePromotionInput) => employeePromotionService.createPromotion(data),
    onSuccess: () => {
      toast.success('تم إنشاء الترقية بنجاح / Promotion created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الترقية / Failed to create promotion')
    },
    onSettled: async () => {
      await invalidateCache.employeePromotions.all()
    },
  })
}

/**
 * Update an existing promotion
 */
export const useUpdatePromotion = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromotionInput }) =>
      employeePromotionService.updatePromotion(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الترقية بنجاح / Promotion updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الترقية / Failed to update promotion')
    },
    onSettled: async (_, __, variables) => {
      await invalidateCache.employeePromotions.all()
      await invalidateCache.employeePromotions.detail(variables.id)
    },
  })
}

/**
 * Delete a promotion
 */
export const useDeletePromotion = () => {
  return useMutation({
    mutationFn: (id: string) => employeePromotionService.deletePromotion(id),
    onSuccess: () => {
      toast.success('تم حذف الترقية بنجاح / Promotion deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الترقية / Failed to delete promotion')
    },
    onSettled: async () => {
      await invalidateCache.employeePromotions.all()
    },
  })
}

/**
 * Bulk delete promotions
 */
export const useBulkDeletePromotions = () => {
  return useMutation({
    mutationFn: (ids: string[]) => employeePromotionService.bulkDeletePromotions(ids),
    onSuccess: (_, variables) => {
      toast.success(`تم حذف ${variables.length} ترقية بنجاح / ${variables.length} promotions deleted successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الترقيات / Failed to delete promotions')
    },
    onSettled: async () => {
      await invalidateCache.employeePromotions.all()
    },
  })
}

// ==================== WORKFLOW MUTATIONS ====================

/**
 * Submit promotion for approval
 */
export const useSubmitPromotionForApproval = () => {
  return useMutation({
    mutationFn: (id: string) => employeePromotionService.submitForApproval(id),
    onSuccess: () => {
      toast.success('تم إرسال الترقية للموافقة / Promotion submitted for approval')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الترقية للموافقة / Failed to submit promotion')
    },
    onSettled: async (_, __, id) => {
      await invalidateCache.employeePromotions.all()
      await invalidateCache.employeePromotions.detail(id)
    },
  })
}

/**
 * Approve a promotion
 */
export const useApprovePromotion = () => {
  return useMutation({
    mutationFn: ({ id, stepNumber, comments }: { id: string; stepNumber: number; comments?: string }) =>
      employeePromotionService.approvePromotion(id, { stepNumber, comments }),
    onSuccess: () => {
      toast.success('تم الموافقة على الترقية / Promotion approved')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل الموافقة على الترقية / Failed to approve promotion')
    },
    onSettled: async (_, __, variables) => {
      await invalidateCache.employeePromotions.all()
      await invalidateCache.employeePromotions.detail(variables.id)
    },
  })
}

/**
 * Reject a promotion
 */
export const useRejectPromotion = () => {
  return useMutation({
    mutationFn: ({ id, stepNumber, comments }: { id: string; stepNumber: number; comments: string }) =>
      employeePromotionService.rejectPromotion(id, { stepNumber, comments }),
    onSuccess: () => {
      toast.success('تم رفض الترقية / Promotion rejected')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفض الترقية / Failed to reject promotion')
    },
    onSettled: async (_, __, variables) => {
      await invalidateCache.employeePromotions.all()
      await invalidateCache.employeePromotions.detail(variables.id)
    },
  })
}

/**
 * Cancel a promotion
 */
export const useCancelPromotion = () => {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      employeePromotionService.cancelPromotion(id, reason),
    onSuccess: () => {
      toast.success('تم إلغاء الترقية / Promotion cancelled')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء الترقية / Failed to cancel promotion')
    },
    onSettled: async (_, __, variables) => {
      await invalidateCache.employeePromotions.all()
      await invalidateCache.employeePromotions.detail(variables.id)
    },
  })
}

/**
 * Apply promotion - updates employee record
 */
export const useApplyPromotion = () => {
  return useMutation({
    mutationFn: (id: string) => employeePromotionService.applyPromotion(id),
    onSuccess: () => {
      toast.success('تم تطبيق الترقية بنجاح / Promotion applied successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تطبيق الترقية / Failed to apply promotion')
    },
    onSettled: async (data, __, id) => {
      await invalidateCache.employeePromotions.all()
      await invalidateCache.employeePromotions.detail(id)
      // Also invalidate employee queries since employee record was updated
      if (data?.employee) {
        await invalidateCache.staff.employees()
        await invalidateCache.staff.employee(data.employee._id)
      }
    },
  })
}

// ==================== NOTIFICATION MUTATIONS ====================

/**
 * Notify employee about their promotion
 */
export const useNotifyEmployee = () => {
  return useMutation({
    mutationFn: (id: string) => employeePromotionService.notifyEmployee(id),
    onSuccess: () => {
      toast.success('تم إرسال إشعار للموظف / Employee notified successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الإشعار / Failed to notify employee')
    },
    onSettled: async (_, __, id) => {
      await invalidateCache.employeePromotions.detail(id)
    },
  })
}

/**
 * Employee acknowledgement of promotion
 */
export const useAcknowledgePromotion = () => {
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      employeePromotionService.acknowledgePromotion(id, comments),
    onSuccess: () => {
      toast.success('تم الإقرار بالترقية / Promotion acknowledged')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل الإقرار بالترقية / Failed to acknowledge promotion')
    },
    onSettled: async (_, __, variables) => {
      await invalidateCache.employeePromotions.detail(variables.id)
    },
  })
}

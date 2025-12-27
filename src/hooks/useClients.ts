import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import clientsService, {
  type ClientFilters,
  type CreateClientData,
} from '@/services/clientsService'
import { toast } from 'sonner'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

export const useClients = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientsService.getClients(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useClient = (clientId: string) => {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: () => clientsService.getClient(clientId),
    enabled: !!clientId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClientData) => clientsService.createClient(data),
    onSuccess: () => {
      toast.success('تم إنشاء العميل بنجاح | Client created successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل إنشاء العميل | Failed to create client'
      )
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      clientId,
      data,
    }: {
      clientId: string
      data: Partial<CreateClientData>
    }) => clientsService.updateClient(clientId, data),
    onSuccess: () => {
      toast.success('تم تحديث العميل بنجاح | Client updated successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل تحديث العميل | Failed to update client'
      )
    },
    onSettled: async (_, __, { clientId }) => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

export const useDeleteClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clientId: string) => clientsService.deleteClient(clientId),
    onSuccess: () => {
      toast.success('تم حذف العميل بنجاح | Client deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل حذف العميل | Failed to delete client'
      )
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export const useSearchClients = (query: string) => {
  return useQuery({
    queryKey: ['clients', 'search', query],
    queryFn: () => clientsService.searchClients(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: STATS_GC_TIME,
  })
}

export const useClientStats = () => {
  return useQuery({
    queryKey: ['clients', 'stats'],
    queryFn: () => clientsService.getStats(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useTopRevenueClients = (limit: number = 10) => {
  return useQuery({
    queryKey: ['clients', 'top-revenue', limit],
    queryFn: () => clientsService.getTopRevenue(limit),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useBulkDeleteClients = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clientIds: string[]) => clientsService.bulkDelete(clientIds),
    onSuccess: () => {
      toast.success('تم حذف العملاء بنجاح | Clients deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل حذف العملاء | Failed to delete clients'
      )
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

/**
 * @deprecated Backend endpoint may not be implemented - GET /clients/:id/payments
 * Consider using invoices endpoint instead: /clients/:id/invoices
 */
export const useClientPayments = (clientId: string) => {
  if (import.meta.env.DEV) {
    console.warn(
      '⚠️ [DEPRECATED] useClientPayments: Backend endpoint may not be implemented. ' +
      'Consider using client invoices instead. | ' +
      '[منتهي الصلاحية] استخدام مدفوعات العميل: نقطة النهاية قد تكون غير مطبقة. ' +
      'يُفضل استخدام فواتير العميل بدلاً من ذلك.'
    )
  }

  return useQuery({
    queryKey: ['clients', clientId, 'payments'],
    queryFn: () => clientsService.getClientPayments(clientId),
    enabled: !!clientId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false, // Don't retry potentially unimplemented endpoints
  })
}

/**
 * @deprecated Backend endpoint may not be implemented - GET /clients/:id/billing-info
 */
export const useClientBillingInfo = (clientId: string) => {
  if (import.meta.env.DEV) {
    console.warn(
      '⚠️ [DEPRECATED] useClientBillingInfo: Backend endpoint may not be implemented. | ' +
      '[منتهي الصلاحية] استخدام معلومات فوترة العميل: نقطة النهاية قد تكون غير مطبقة.'
    )
  }

  return useQuery({
    queryKey: ['clients', clientId, 'billing-info'],
    queryFn: () => clientsService.getBillingInfo(clientId),
    enabled: !!clientId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false, // Don't retry potentially unimplemented endpoints
  })
}

/**
 * @deprecated Backend endpoint may not be implemented - POST /clients/:id/verify/wathq
 */
export const useVerifyWathq = () => {
  const queryClient = useQueryClient()

  if (import.meta.env.DEV) {
    console.warn(
      '⚠️ [DEPRECATED] useVerifyWathq: Backend endpoint may not be implemented. | ' +
      '[منتهي الصلاحية] استخدام التحقق عبر وثق: نقطة النهاية قد تكون غير مطبقة.'
    )
  }

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data?: any }) =>
      clientsService.verifyWithWathq(clientId, data),
    onSuccess: () => {
      toast.success('تم التحقق من البيانات عبر وثق بنجاح | Wathq verification successful')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل التحقق من البيانات عبر وثق | Wathq verification failed'
      )
    },
    onSettled: async (_, __, { clientId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

/**
 * @deprecated Backend endpoint may not be implemented - GET /clients/:id/wathq/:dataType
 */
export const useWathqData = (clientId: string, dataType: string) => {
  if (import.meta.env.DEV) {
    console.warn(
      '⚠️ [DEPRECATED] useWathqData: Backend endpoint may not be implemented. | ' +
      '[منتهي الصلاحية] استخدام بيانات وثق: نقطة النهاية قد تكون غير مطبقة.'
    )
  }

  return useQuery({
    queryKey: ['clients', clientId, 'wathq', dataType],
    queryFn: () => clientsService.getWathqData(clientId, dataType),
    enabled: !!clientId && !!dataType,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    retry: false, // Don't retry potentially unimplemented endpoints
  })
}

/**
 * @deprecated Backend endpoint may not be implemented - POST /clients/:id/attachments
 * Consider using /clients/:id/documents instead
 */
export const useUploadClientAttachments = () => {
  const queryClient = useQueryClient()

  if (import.meta.env.DEV) {
    console.warn(
      '⚠️ [DEPRECATED] useUploadClientAttachments: Backend endpoint may not be implemented. ' +
      'Consider using client documents endpoint instead. | ' +
      '[منتهي الصلاحية] استخدام رفع مرفقات العميل: نقطة النهاية قد تكون غير مطبقة. ' +
      'يُفضل استخدام نقطة نهاية مستندات العميل بدلاً من ذلك.'
    )
  }

  return useMutation({
    mutationFn: ({ clientId, files }: { clientId: string; files: File[] }) =>
      clientsService.uploadAttachments(clientId, files),
    onSuccess: () => {
      toast.success('تم رفع المرفقات بنجاح | Attachments uploaded successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل رفع المرفقات | Failed to upload attachments'
      )
    },
    onSettled: async (_, __, { clientId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

/**
 * @deprecated Backend endpoint may not be implemented - DELETE /clients/:id/attachments/:attachmentId
 */
export const useDeleteClientAttachment = () => {
  const queryClient = useQueryClient()

  if (import.meta.env.DEV) {
    console.warn(
      '⚠️ [DEPRECATED] useDeleteClientAttachment: Backend endpoint may not be implemented. | ' +
      '[منتهي الصلاحية] استخدام حذف مرفق العميل: نقطة النهاية قد تكون غير مطبقة.'
    )
  }

  return useMutation({
    mutationFn: ({ clientId, attachmentId }: { clientId: string; attachmentId: string }) =>
      clientsService.deleteAttachment(clientId, attachmentId),
    onSuccess: () => {
      toast.success('تم حذف المرفق بنجاح | Attachment deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل حذف المرفق | Failed to delete attachment'
      )
    },
    onSettled: async (_, __, { clientId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

/**
 * @deprecated Backend endpoint may not be implemented - POST /clients/:id/conflict-check
 */
export const useRunConflictCheck = () => {
  const queryClient = useQueryClient()

  if (import.meta.env.DEV) {
    console.warn(
      '⚠️ [DEPRECATED] useRunConflictCheck: Backend endpoint may not be implemented. | ' +
      '[منتهي الصلاحية] استخدام فحص التعارض: نقطة النهاية قد تكون غير مطبقة.'
    )
  }

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: any }) =>
      clientsService.runConflictCheck(clientId, data),
    onSuccess: () => {
      toast.success('تم إجراء فحص التعارض بنجاح | Conflict check completed successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل فحص التعارض | Conflict check failed'
      )
    },
    onSettled: async (_, __, { clientId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

/**
 * @deprecated Backend endpoint may not be implemented - PATCH /clients/:id/status
 * Consider using PUT /clients/:id with status field instead
 */
export const useUpdateClientStatus = () => {
  const queryClient = useQueryClient()

  if (import.meta.env.DEV) {
    console.warn(
      '⚠️ [DEPRECATED] useUpdateClientStatus: Backend endpoint may not be implemented. ' +
      'Consider using PUT /clients/:id with status field instead. | ' +
      '[منتهي الصلاحية] استخدام تحديث حالة العميل: نقطة النهاية قد تكون غير مطبقة. ' +
      'يُفضل استخدام PUT /clients/:id مع حقل الحالة بدلاً من ذلك.'
    )
  }

  return useMutation({
    mutationFn: ({ clientId, status }: { clientId: string; status: string }) =>
      clientsService.updateStatus(clientId, status),
    onSuccess: () => {
      toast.success('تم تحديث حالة العميل بنجاح | Client status updated successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل تحديث حالة العميل | Failed to update client status'
      )
    },
    onSettled: async (_, __, { clientId }) => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

/**
 * @deprecated Backend endpoint may not be implemented - PATCH /clients/:id/flags
 * Consider using PUT /clients/:id with flags field instead
 */
export const useUpdateClientFlags = () => {
  const queryClient = useQueryClient()

  if (import.meta.env.DEV) {
    console.warn(
      '⚠️ [DEPRECATED] useUpdateClientFlags: Backend endpoint may not be implemented. ' +
      'Consider using PUT /clients/:id with flags field instead. | ' +
      '[منتهي الصلاحية] استخدام تحديث علامات العميل: نقطة النهاية قد تكون غير مطبقة. ' +
      'يُفضل استخدام PUT /clients/:id مع حقل العلامات بدلاً من ذلك.'
    )
  }

  return useMutation({
    mutationFn: ({ clientId, flags }: { clientId: string; flags: any }) =>
      clientsService.updateFlags(clientId, flags),
    onSuccess: () => {
      toast.success('تم تحديث علامات العميل بنجاح | Client flags updated successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
        'فشل تحديث علامات العميل | Failed to update client flags'
      )
    },
    onSettled: async (_, __, { clientId }) => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

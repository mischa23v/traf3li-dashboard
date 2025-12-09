import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import clientsService, {
  type ClientFilters,
  type CreateClientData,
} from '@/services/clientsService'
import { toast } from 'sonner'

export const useClients = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientsService.getClients(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useClient = (clientId: string) => {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: () => clientsService.getClient(clientId),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
  })
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClientData) => clientsService.createClient(data),
    onSuccess: () => {
      toast.success('تم إنشاء العميل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء العميل')
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
      toast.success('تم تحديث العميل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث العميل')
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
      toast.success('تم حذف العميل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف العميل')
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
  })
}

export const useClientStats = () => {
  return useQuery({
    queryKey: ['clients', 'stats'],
    queryFn: () => clientsService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useTopRevenueClients = (limit: number = 10) => {
  return useQuery({
    queryKey: ['clients', 'top-revenue', limit],
    queryFn: () => clientsService.getTopRevenue(limit),
    staleTime: 5 * 60 * 1000,
  })
}

export const useBulkDeleteClients = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clientIds: string[]) => clientsService.bulkDelete(clientIds),
    onSuccess: () => {
      toast.success('تم حذف العملاء بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف العملاء')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export const useClientPayments = (clientId: string) => {
  return useQuery({
    queryKey: ['clients', clientId, 'payments'],
    queryFn: () => clientsService.getClientPayments(clientId),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
  })
}

export const useClientBillingInfo = (clientId: string) => {
  return useQuery({
    queryKey: ['clients', clientId, 'billing-info'],
    queryFn: () => clientsService.getBillingInfo(clientId),
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000,
  })
}

export const useVerifyWathq = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data?: any }) =>
      clientsService.verifyWithWathq(clientId, data),
    onSuccess: () => {
      toast.success('تم التحقق من البيانات عبر وثق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل التحقق من البيانات عبر وثق')
    },
    onSettled: async (_, __, { clientId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

export const useWathqData = (clientId: string, dataType: string) => {
  return useQuery({
    queryKey: ['clients', clientId, 'wathq', dataType],
    queryFn: () => clientsService.getWathqData(clientId, dataType),
    enabled: !!clientId && !!dataType,
    staleTime: 5 * 60 * 1000,
  })
}

export const useUploadClientAttachments = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, files }: { clientId: string; files: File[] }) =>
      clientsService.uploadAttachments(clientId, files),
    onSuccess: () => {
      toast.success('تم رفع المرفقات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفع المرفقات')
    },
    onSettled: async (_, __, { clientId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

export const useDeleteClientAttachment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, attachmentId }: { clientId: string; attachmentId: string }) =>
      clientsService.deleteAttachment(clientId, attachmentId),
    onSuccess: () => {
      toast.success('تم حذف المرفق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المرفق')
    },
    onSettled: async (_, __, { clientId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

export const useRunConflictCheck = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: any }) =>
      clientsService.runConflictCheck(clientId, data),
    onSuccess: () => {
      toast.success('تم إجراء فحص التعارض بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل فحص التعارض')
    },
    onSettled: async (_, __, { clientId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

export const useUpdateClientStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, status }: { clientId: string; status: string }) =>
      clientsService.updateStatus(clientId, status),
    onSuccess: () => {
      toast.success('تم تحديث حالة العميل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث حالة العميل')
    },
    onSettled: async (_, __, { clientId }) => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

export const useUpdateClientFlags = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, flags }: { clientId: string; flags: any }) =>
      clientsService.updateFlags(clientId, flags),
    onSuccess: () => {
      toast.success('تم تحديث علامات العميل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث علامات العميل')
    },
    onSettled: async (_, __, { clientId }) => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      return await queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
    },
  })
}

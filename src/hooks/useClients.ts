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
      queryClient.refetchQueries({ queryKey: ['clients'] })
      toast.success('تم إنشاء العميل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء العميل')
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
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: ['clients'] })
      queryClient.refetchQueries({ queryKey: ['clients', variables.clientId] })
      toast.success('تم تحديث العميل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث العميل')
    },
  })
}

export const useDeleteClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clientId: string) => clientsService.deleteClient(clientId),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['clients'] })
      toast.success('تم حذف العميل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف العميل')
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
      queryClient.refetchQueries({ queryKey: ['clients'] })
      toast.success('تم حذف العملاء بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف العملاء')
    },
  })
}

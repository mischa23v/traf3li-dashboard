/**
 * Cases and Clients Hooks
 * TanStack Query hooks for cases and clients operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import casesService, {
  CaseFilters,
  CreateCaseData,
} from '@/services/casesService'
import clientsService, {
  ClientFilters,
  CreateClientData,
} from '@/services/clientsService'

// ==================== CASES ====================

export const useCases = (filters?: CaseFilters) => {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: () => casesService.getCases(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useCase = (id: string) => {
  return useQuery({
    queryKey: ['cases', id],
    queryFn: () => casesService.getCase(id),
    enabled: !!id,
  })
}

export const useCreateCase = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCaseData) => casesService.createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('تم إنشاء القضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء القضية')
    },
  })
}

export const useUpdateCase = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCaseData> }) =>
      casesService.updateCase(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['cases', id] })
      toast.success('تم تحديث القضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث القضية')
    },
  })
}

export const useDeleteCase = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => casesService.deleteCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('تم حذف القضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف القضية')
    },
  })
}

// ==================== CLIENTS ====================

export const useClients = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientsService.getClients(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useClient = (id: string) => {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsService.getClient(id),
    enabled: !!id,
  })
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClientData) => clientsService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
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
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientData> }) =>
      clientsService.updateClient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['clients', id] })
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
    mutationFn: (id: string) => clientsService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
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
    staleTime: 1 * 60 * 1000,
  })
}

export const useClientStats = () => {
  return useQuery({
    queryKey: ['clients', 'stats'],
    queryFn: () => clientsService.getStats(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useTopRevenueClients = (limit: number = 10) => {
  return useQuery({
    queryKey: ['clients', 'top-revenue', limit],
    queryFn: () => clientsService.getTopRevenue(limit),
    staleTime: 5 * 60 * 1000,
  })
}

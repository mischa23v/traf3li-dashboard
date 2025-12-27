/**
 * Client Hooks
 * React Query hooks for Client management and related entities
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import { QueryKeys } from '@/lib/query-keys'
import { clientService } from '@/services/clientService'
import type { Client, CreateClientData, ClientFilters } from '@/services/clientsService'
import type { Case, CaseFilters } from '@/services/casesService'
import type { Invoice, InvoiceFilters } from '@/services/financeService'
import type { Quote } from '@/services/quoteService'
import type { Payment } from '@/services/financeService'
import type { CrmActivity } from '@/types/crm'

// ==================== Cache Configuration ====================
// Cache data for 30 minutes to reduce API calls
// Data is refreshed automatically when mutations occur
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour (keep in cache)
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ═══════════════════════════════════════════════════════════════
// QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all clients with optional filters
 */
export const useClients = (filters?: ClientFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.clients.list(filters),
    queryFn: () => clientService.getClients(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get single client with details
 */
export const useClient = (clientId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.clients.detail(clientId),
    queryFn: () => clientService.getClient(clientId),
    enabled: !!clientId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get client cases with filtering and pagination
 */
export const useClientCases = (
  clientId: string,
  params?: CaseFilters,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QueryKeys.clients.cases(clientId, params),
    queryFn: () => clientService.getClientCases(clientId, params),
    enabled: !!clientId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get client invoices with financial summary
 */
export const useClientInvoices = (
  clientId: string,
  params?: InvoiceFilters,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QueryKeys.clients.invoices(clientId, params),
    queryFn: () => clientService.getClientInvoices(clientId, params),
    enabled: !!clientId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get client quotes with pagination
 */
export const useClientQuotes = (
  clientId: string,
  params?: { page?: number; limit?: number },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QueryKeys.clients.quotes(clientId, params),
    queryFn: () => clientService.getClientQuotes(clientId, params),
    enabled: !!clientId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get client activities (CRM timeline)
 */
export const useClientActivities = (
  clientId: string,
  params?: { page?: number; limit?: number },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QueryKeys.clients.activities(clientId, params),
    queryFn: () => clientService.getClientActivities(clientId, params),
    enabled: !!clientId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get client payment history
 */
export const useClientPayments = (
  clientId: string,
  params?: { page?: number; limit?: number },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QueryKeys.clients.payments(clientId, params),
    queryFn: () => clientService.getClientPayments(clientId, params),
    enabled: !!clientId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create new client
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClientData) => clientService.createClient(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء العميل بنجاح')

      // Manually update the cache with the REAL client from server
      queryClient.setQueriesData({ queryKey: ['clients'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total: ... } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: [data, ...old.data],
            total: (old.total || old.data.length) + 1,
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return [data, ...old]
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء العميل')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await invalidateCache.clients.all()
    },
  })
}

/**
 * Update client
 */
export const useUpdateClient = () => {
  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: Partial<Client> }) =>
      clientService.updateClient(clientId, data),
    onSuccess: () => {
      toast.success('تم تحديث العميل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث العميل')
    },
    onSettled: async (_, __, { clientId }) => {
      await invalidateCache.clients.all()
      return await invalidateCache.clients.detail(clientId)
    },
  })
}

/**
 * Delete client
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clientId: string) => clientService.deleteClient(clientId),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, clientId) => {
      toast.success('تم حذف العميل بنجاح')

      // Optimistically remove client from all lists
      queryClient.setQueriesData({ queryKey: ['clients'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total: ... } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter((item: any) => item._id !== clientId),
            total: Math.max(0, (old.total || old.data.length) - 1),
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return old.filter((item: any) => item._id !== clientId)
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف العميل')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await invalidateCache.clients.all()
    },
  })
}

/**
 * Update client credit status
 */
export const useUpdateClientCreditStatus = () => {
  return useMutation({
    mutationFn: ({
      clientId,
      status,
      reason,
    }: {
      clientId: string
      status: string
      reason?: string
    }) => clientService.updateCreditStatus(clientId, status, reason),
    onSuccess: () => {
      toast.success('تم تحديث حالة الائتمان بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث حالة الائتمان')
    },
    onSettled: async (_, __, { clientId }) => {
      await invalidateCache.clients.all()
      return await invalidateCache.clients.detail(clientId)
    },
  })
}

/**
 * Convert lead to client
 */
export const useConvertLeadToClient = () => {
  return useMutation({
    mutationFn: ({
      leadId,
      additionalData,
    }: {
      leadId: string
      additionalData?: Partial<Client>
    }) => clientService.convertFromLead(leadId, additionalData),
    onSuccess: () => {
      toast.success('تم تحويل العميل المحتمل إلى عميل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحويل العميل المحتمل')
    },
    onSettled: async () => {
      await invalidateCache.leads.all()
      return await invalidateCache.clients.all()
    },
  })
}

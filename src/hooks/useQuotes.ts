/**
 * Quote Hooks
 * TanStack Query hooks for all quote operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import quoteService, { QuoteFilters, CreateQuoteData, QuoteStatus } from '@/services/quoteService'

// ==================== Cache Configuration ====================
// Cache data for 30 minutes to reduce API calls
// Data is refreshed automatically when mutations occur
const STATS_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const STATS_GC_TIME = 60 * 60 * 1000 // 1 hour (keep in cache)
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes for lists

// Get all quotes
export const useQuotes = (filters?: QuoteFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['quotes', filters],
    queryFn: () => quoteService.getQuotes(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

// Get single quote
export const useQuote = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['quotes', id],
    queryFn: () => quoteService.getQuote(id),
    enabled: !!id && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create quote
export const useCreateQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuoteData) => quoteService.createQuote(data),
    onSuccess: (data) => {
      toast.success('تم إنشاء عرض السعر بنجاح')
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ['quotes'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        // Handle paginated response if applicable, otherwise just return old
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء عرض السعر')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['quotes'], refetchType: 'all' })
    },
  })
}

// Update quote
export const useUpdateQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateQuoteData> }) =>
      quoteService.updateQuote(id, data),
    onSuccess: (data) => {
      toast.success('تم تحديث عرض السعر بنجاح')
      // Update specific quote in cache
      queryClient.setQueryData(['quotes', data.id], data)
      // Update list cache
      queryClient.setQueriesData({ queryKey: ['quotes'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((item: any) => (item.id === data.id ? data : item))
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث عرض السعر')
    },
    onSettled: async (_, __, { id }) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['quotes'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['quotes', id], refetchType: 'all' })
    },
  })
}

// Delete quote
export const useDeleteQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quoteService.deleteQuote(id),
    onSuccess: (_, id) => {
      toast.success('تم حذف عرض السعر بنجاح')
      // Remove from cache
      queryClient.setQueriesData({ queryKey: ['quotes'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.filter((item: any) => item.id !== id)
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف عرض السعر')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['quotes'], refetchType: 'all' })
    },
  })
}

// Send quote
export const useSendQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quoteService.sendQuote(id),
    onSuccess: () => {
      toast.success('تم إرسال عرض السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال عرض السعر')
    },
    onSettled: async (_, __, id) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['quotes'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['quotes', id], refetchType: 'all' })
    },
  })
}

// Update quote status
export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) =>
      quoteService.updateQuoteStatus(id, status),
    onSuccess: () => {
      toast.success('تم تحديث حالة عرض السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث حالة عرض السعر')
    },
    onSettled: async (_, __, { id }) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['quotes'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['quotes', id], refetchType: 'all' })
    },
  })
}

// Convert quote to invoice
export const useConvertQuoteToInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quoteService.convertToInvoice(id),
    onSuccess: () => {
      toast.success('تم تحويل عرض السعر إلى فاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحويل عرض السعر إلى فاتورة')
    },
    onSettled: async (_, __, id) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['quotes'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['quotes', id], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['invoices'], refetchType: 'all' })
    },
  })
}

// Get quotes summary
export const useQuotesSummary = (filters?: QuoteFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['quotes', 'summary', filters],
    queryFn: () => quoteService.getQuotesSummary(filters),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

// Duplicate quote
export const useDuplicateQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quoteService.duplicateQuote(id),
    onSuccess: (data) => {
      toast.success('تم نسخ عرض السعر بنجاح')
      // Add to cache
      queryClient.setQueriesData({ queryKey: ['quotes'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نسخ عرض السعر')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['quotes'], refetchType: 'all' })
    },
  })
}

/**
 * Quote Hooks
 * React Query hooks for Quote management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import { QueryKeys } from '@/lib/query-keys'
import { quoteService } from '@/services/quoteService'
import type {
  Quote,
  CreateQuoteData,
  QuoteFilters,
} from '@/services/quoteService'

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
 * Get all quotes with optional filters
 */
export const useQuotes = (params?: QuoteFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.quotes.list(params),
    queryFn: () => quoteService.getQuotes(params),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get single quote by ID
 */
export const useQuote = (quoteId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.quotes.detail(quoteId),
    queryFn: () => quoteService.getQuote(quoteId),
    enabled: !!quoteId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get quote history/timeline
 */
export const useQuoteHistory = (quoteId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.quotes.history(quoteId),
    queryFn: () => quoteService.getQuoteHistory(quoteId),
    enabled: !!quoteId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create new quote
 */
export const useCreateQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuoteData) => quoteService.createQuote(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء عرض السعر بنجاح')

      // Manually update the cache with the REAL quote from server
      queryClient.setQueriesData({ queryKey: ['quotes'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total: number } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: [data, ...old.data],
            total: (old.total || old.data.length) + 1
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
      toast.error(error.message || 'فشل إنشاء عرض السعر')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await invalidateCache.quotes.all()
    },
  })
}

/**
 * Update quote
 */
export const useUpdateQuote = () => {
  return useMutation({
    mutationFn: ({ quoteId, data }: { quoteId: string; data: Partial<Quote> }) =>
      quoteService.updateQuote(quoteId, data),
    onSuccess: () => {
      toast.success('تم تحديث عرض السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث عرض السعر')
    },
    onSettled: async (_, __, { quoteId }) => {
      await invalidateCache.quotes.all()
      return await invalidateCache.quotes.detail(quoteId)
    },
  })
}

/**
 * Delete quote
 */
export const useDeleteQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (quoteId: string) => quoteService.deleteQuote(quoteId),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, quoteId) => {
      toast.success('تم حذف عرض السعر بنجاح')

      // Optimistically remove quote from all lists
      queryClient.setQueriesData({ queryKey: ['quotes'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total: number } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter((item: any) => item._id !== quoteId),
            total: Math.max(0, (old.total || old.data.length) - 1)
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return old.filter((item: any) => item._id !== quoteId)
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف عرض السعر')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await invalidateCache.quotes.all()
    },
  })
}

/**
 * Duplicate quote
 */
export const useDuplicateQuote = () => {
  return useMutation({
    mutationFn: (quoteId: string) => quoteService.duplicateQuote(quoteId),
    onSuccess: () => {
      toast.success('تم نسخ عرض السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نسخ عرض السعر')
    },
    onSettled: async () => {
      return await invalidateCache.quotes.all()
    },
  })
}

/**
 * Send quote to customer
 */
export const useSendQuote = () => {
  return useMutation({
    mutationFn: ({ quoteId, data }: { quoteId: string; data?: { email?: string; message?: string } }) =>
      quoteService.sendQuote(quoteId, data),
    onSuccess: () => {
      toast.success('تم إرسال عرض السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال عرض السعر')
    },
    onSettled: async (_, __, { quoteId }) => {
      await invalidateCache.quotes.detail(quoteId)
      return await invalidateCache.quotes.all()
    },
  })
}

/**
 * Accept quote
 */
export const useAcceptQuote = () => {
  return useMutation({
    mutationFn: ({ quoteId, signature }: { quoteId: string; signature?: string }) =>
      quoteService.acceptQuote(quoteId, signature),
    onSuccess: () => {
      toast.success('تم قبول عرض السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل قبول عرض السعر')
    },
    onSettled: async (_, __, { quoteId }) => {
      await invalidateCache.quotes.all()
      return await invalidateCache.quotes.detail(quoteId)
    },
  })
}

/**
 * Reject quote
 */
export const useRejectQuote = () => {
  return useMutation({
    mutationFn: ({ quoteId, reason }: { quoteId: string; reason?: string }) =>
      quoteService.rejectQuote(quoteId, reason),
    onSuccess: () => {
      toast.success('تم رفض عرض السعر')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل رفض عرض السعر')
    },
    onSettled: async (_, __, { quoteId }) => {
      await invalidateCache.quotes.all()
      return await invalidateCache.quotes.detail(quoteId)
    },
  })
}

/**
 * Convert quote to invoice
 */
export const useConvertQuoteToInvoice = () => {
  return useMutation({
    mutationFn: (quoteId: string) => quoteService.convertToInvoice(quoteId),
    onSuccess: () => {
      toast.success('تم تحويل عرض السعر إلى فاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحويل عرض السعر إلى فاتورة')
    },
    onSettled: async () => {
      await invalidateCache.quotes.all()
      return await invalidateCache.invoices.all()
    },
  })
}

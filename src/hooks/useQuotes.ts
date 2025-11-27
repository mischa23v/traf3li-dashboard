/**
 * Quote Hooks
 * TanStack Query hooks for all quote operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import quoteService, { QuoteFilters, CreateQuoteData, QuoteStatus } from '@/services/quoteService'

// Get all quotes
export const useQuotes = (filters?: QuoteFilters) => {
  return useQuery({
    queryKey: ['quotes', filters],
    queryFn: () => quoteService.getQuotes(filters),
    staleTime: 2 * 60 * 1000,
  })
}

// Get single quote
export const useQuote = (id: string) => {
  return useQuery({
    queryKey: ['quotes', id],
    queryFn: () => quoteService.getQuote(id),
    enabled: !!id,
  })
}

// Create quote
export const useCreateQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuoteData) => quoteService.createQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      toast.success('تم إنشاء عرض السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء عرض السعر')
    },
  })
}

// Update quote
export const useUpdateQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateQuoteData> }) =>
      quoteService.updateQuote(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quotes', id] })
      toast.success('تم تحديث عرض السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث عرض السعر')
    },
  })
}

// Delete quote
export const useDeleteQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quoteService.deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      toast.success('تم حذف عرض السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف عرض السعر')
    },
  })
}

// Send quote
export const useSendQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quoteService.sendQuote(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quotes', id] })
      toast.success('تم إرسال عرض السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال عرض السعر')
    },
  })
}

// Update quote status
export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) =>
      quoteService.updateQuoteStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quotes', id] })
      toast.success('تم تحديث حالة عرض السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث حالة عرض السعر')
    },
  })
}

// Convert quote to invoice
export const useConvertQuoteToInvoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quoteService.convertToInvoice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quotes', id] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('تم تحويل عرض السعر إلى فاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحويل عرض السعر إلى فاتورة')
    },
  })
}

// Get quotes summary
export const useQuotesSummary = (filters?: QuoteFilters) => {
  return useQuery({
    queryKey: ['quotes', 'summary', filters],
    queryFn: () => quoteService.getQuotesSummary(filters),
    staleTime: 2 * 60 * 1000,
  })
}

// Duplicate quote
export const useDuplicateQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => quoteService.duplicateQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      toast.success('تم نسخ عرض السعر بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نسخ عرض السعر')
    },
  })
}

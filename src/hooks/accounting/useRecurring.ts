/**
 * Recurring Transaction Hooks
 * TanStack Query hooks for recurring transaction management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  accountingService,
  RecurringTransaction,
  CreateRecurringTransactionData,
  RecurringStatus,
  RecurringTransactionType,
} from '@/services/accountingService'

// ==================== QUERY KEYS ====================

export const recurringKeys = {
  all: ['accounting'] as const,
  recurring: () => [...recurringKeys.all, 'recurring'] as const,
  recurringList: (filters?: { status?: RecurringStatus; transactionType?: RecurringTransactionType }) =>
    [...recurringKeys.recurring(), 'list', filters] as const,
  recurringItem: (id: string) => [...recurringKeys.recurring(), id] as const,
  recurringUpcoming: () => [...recurringKeys.recurring(), 'upcoming'] as const,
}

// ==================== RECURRING TRANSACTION QUERY HOOKS ====================

/**
 * Fetch recurring transactions with optional filtering
 * @param filters - Optional filters for recurring transactions
 * @returns Query result with recurring transactions data
 */
export const useRecurringTransactions = (filters?: { status?: RecurringStatus; transactionType?: RecurringTransactionType }) => {
  return useQuery({
    queryKey: recurringKeys.recurringList(filters),
    queryFn: () => accountingService.getRecurringTransactions(filters),
  })
}

/**
 * Fetch upcoming recurring transactions
 * @returns Query result with upcoming recurring transactions
 */
export const useUpcomingRecurring = () => {
  return useQuery({
    queryKey: recurringKeys.recurringUpcoming(),
    queryFn: accountingService.getUpcomingRecurring,
  })
}

/**
 * Fetch a single recurring transaction by ID
 * @param id - Recurring Transaction ID
 * @returns Query result with recurring transaction data
 */
export const useRecurringTransaction = (id: string) => {
  return useQuery({
    queryKey: recurringKeys.recurringItem(id),
    queryFn: () => accountingService.getRecurringTransaction(id),
    enabled: !!id,
  })
}

// ==================== RECURRING TRANSACTION MUTATION HOOKS ====================

/**
 * Create a new recurring transaction
 * @returns Mutation for creating a recurring transaction
 */
export const useCreateRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRecurringTransactionData) => accountingService.createRecurringTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.recurring() })
      toast.success('تم إنشاء المعاملة المتكررة بنجاح')
    },
    onError: () => {
      toast.error('فشل في إنشاء المعاملة المتكررة')
    },
  })
}

/**
 * Update an existing recurring transaction
 * @returns Mutation for updating a recurring transaction
 */
export const useUpdateRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRecurringTransactionData> }) =>
      accountingService.updateRecurringTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.recurring() })
      toast.success('تم تحديث المعاملة المتكررة')
    },
    onError: () => {
      toast.error('فشل في تحديث المعاملة المتكررة')
    },
  })
}

/**
 * Pause a recurring transaction
 * @returns Mutation for pausing a recurring transaction
 */
export const usePauseRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.pauseRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.recurring() })
      toast.success('تم إيقاف المعاملة المتكررة مؤقتاً')
    },
    onError: () => {
      toast.error('فشل في إيقاف المعاملة المتكررة')
    },
  })
}

/**
 * Resume a paused recurring transaction
 * @returns Mutation for resuming a recurring transaction
 */
export const useResumeRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.resumeRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.recurring() })
      toast.success('تم استئناف المعاملة المتكررة')
    },
    onError: () => {
      toast.error('فشل في استئناف المعاملة المتكررة')
    },
  })
}

/**
 * Cancel a recurring transaction
 * @returns Mutation for canceling a recurring transaction
 */
export const useCancelRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.cancelRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.recurring() })
      toast.success('تم إلغاء المعاملة المتكررة')
    },
    onError: () => {
      toast.error('فشل في إلغاء المعاملة المتكررة')
    },
  })
}

/**
 * Generate a transaction from a recurring template
 * @returns Mutation for generating a recurring transaction
 */
export const useGenerateRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.generateRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.recurring() })
      toast.success('تم إنشاء المعاملة بنجاح')
    },
    onError: () => {
      toast.error('فشل في إنشاء المعاملة')
    },
  })
}

/**
 * Delete a recurring transaction
 * @returns Mutation for deleting a recurring transaction
 */
export const useDeleteRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.recurring() })
      toast.success('تم حذف المعاملة المتكررة')
    },
    onError: () => {
      toast.error('فشل في حذف المعاملة المتكررة')
    },
  })
}

/**
 * Retainer Account Hooks
 * TanStack Query hooks for retainer account management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  accountingService,
  Retainer,
  RetainerStatus,
  CreateRetainerData,
  RetainerDepositData,
  RetainerConsumeData,
} from '@/services/accountingService'
import { accountKeys } from './useAccounts'

// ==================== QUERY KEYS ====================

export const retainerKeys = {
  all: ['accounting'] as const,
  retainers: () => [...retainerKeys.all, 'retainers'] as const,
  retainersList: (filters?: { clientId?: string; status?: RetainerStatus }) =>
    [...retainerKeys.retainers(), 'list', filters] as const,
  retainer: (id: string) => [...retainerKeys.retainers(), id] as const,
  retainerTransactions: (id: string) => [...retainerKeys.retainers(), id, 'transactions'] as const,
}

// ==================== RETAINER QUERY HOOKS ====================

/**
 * Fetch retainers with optional filtering
 * @param filters - Optional filters for retainers
 * @returns Query result with retainers data
 */
export const useRetainers = (filters?: { clientId?: string; status?: RetainerStatus }) => {
  return useQuery({
    queryKey: retainerKeys.retainersList(filters),
    queryFn: () => accountingService.getRetainers(filters),
  })
}

/**
 * Fetch a single retainer by ID
 * @param id - Retainer ID
 * @returns Query result with retainer data
 */
export const useRetainer = (id: string) => {
  return useQuery({
    queryKey: retainerKeys.retainer(id),
    queryFn: () => accountingService.getRetainer(id),
    enabled: !!id,
  })
}

/**
 * Fetch transactions for a retainer account
 * @param id - Retainer ID
 * @returns Query result with retainer transactions
 */
export const useRetainerTransactions = (id: string) => {
  return useQuery({
    queryKey: retainerKeys.retainerTransactions(id),
    queryFn: () => accountingService.getRetainerTransactions(id),
    enabled: !!id,
  })
}

// ==================== RETAINER MUTATION HOOKS ====================

/**
 * Create a new retainer account
 * @returns Mutation for creating a retainer
 */
export const useCreateRetainer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRetainerData) => accountingService.createRetainer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.retainers() })
      toast.success('تم إنشاء حساب الأمانة بنجاح')
    },
    onError: () => {
      toast.error('فشل في إنشاء حساب الأمانة')
    },
  })
}

/**
 * Deposit funds to a retainer account
 * @returns Mutation for depositing to retainer
 */
export const useDepositToRetainer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RetainerDepositData }) =>
      accountingService.depositToRetainer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.retainers() })
      queryClient.invalidateQueries({ queryKey: accountKeys.glEntries() })
      toast.success('تم إيداع المبلغ بنجاح')
    },
    onError: () => {
      toast.error('فشل في إيداع المبلغ')
    },
  })
}

/**
 * Consume funds from a retainer account
 * @returns Mutation for consuming from retainer
 */
export const useConsumeFromRetainer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RetainerConsumeData }) =>
      accountingService.consumeFromRetainer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: retainerKeys.retainers() })
      queryClient.invalidateQueries({ queryKey: accountKeys.glEntries() })
      toast.success('تم السحب من حساب الأمانة')
    },
    onError: () => {
      toast.error('فشل في السحب من حساب الأمانة')
    },
  })
}

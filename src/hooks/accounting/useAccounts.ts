/**
 * Account Management Hooks
 * TanStack Query hooks for account and GL entry operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  accountingService,
  Account,
  AccountFilters,
  GLEntry,
  GLEntryFilters,
} from '@/services/accountingService'

// ==================== QUERY KEYS ====================

export const accountKeys = {
  all: ['accounting'] as const,
  // Accounts
  accounts: () => [...accountKeys.all, 'accounts'] as const,
  accountsList: (filters?: AccountFilters) => [...accountKeys.accounts(), 'list', filters] as const,
  account: (id: string) => [...accountKeys.accounts(), id] as const,
  accountTypes: () => [...accountKeys.accounts(), 'types'] as const,
  // GL Entries
  glEntries: () => [...accountKeys.all, 'gl-entries'] as const,
  glEntriesList: (filters?: GLEntryFilters) => [...accountKeys.glEntries(), 'list', filters] as const,
  glEntry: (id: string) => [...accountKeys.glEntries(), id] as const,
}

// ==================== ACCOUNT TYPE HOOKS ====================

/**
 * Fetch all available account types
 * @returns Query result with account types data
 */
export const useAccountTypes = () => {
  return useQuery({
    queryKey: accountKeys.accountTypes(),
    queryFn: accountingService.getAccountTypes,
  })
}

// ==================== ACCOUNT HOOKS ====================

/**
 * Fetch accounts with optional filtering
 * @param filters - Optional filters for account list
 * @returns Query result with accounts data
 */
export const useAccounts = (filters?: AccountFilters) => {
  return useQuery({
    queryKey: accountKeys.accountsList(filters),
    queryFn: () => accountingService.getAccounts(filters),
  })
}

/**
 * Fetch a single account by ID
 * @param id - Account ID
 * @returns Query result with account data
 */
export const useAccount = (id: string) => {
  return useQuery({
    queryKey: accountKeys.account(id),
    queryFn: () => accountingService.getAccount(id),
    enabled: !!id,
  })
}

/**
 * Create a new account
 * @returns Mutation for creating an account
 */
export const useCreateAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Account>) => accountingService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.accounts() })
      toast.success('تم إنشاء الحساب بنجاح')
    },
    onError: () => {
      toast.error('فشل في إنشاء الحساب')
    },
  })
}

/**
 * Update an existing account
 * @returns Mutation for updating an account
 */
export const useUpdateAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) =>
      accountingService.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.accounts() })
      toast.success('تم تحديث الحساب بنجاح')
    },
    onError: () => {
      toast.error('فشل في تحديث الحساب')
    },
  })
}

/**
 * Delete an account
 * @returns Mutation for deleting an account
 */
export const useDeleteAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.accounts() })
      toast.success('تم حذف الحساب بنجاح')
    },
    onError: () => {
      toast.error('فشل في حذف الحساب')
    },
  })
}

// ==================== GL ENTRIES HOOKS ====================

/**
 * Fetch GL entries with optional filtering
 * @param filters - Optional filters for GL entries
 * @returns Query result with GL entries data
 */
export const useGLEntries = (filters?: GLEntryFilters) => {
  return useQuery({
    queryKey: accountKeys.glEntriesList(filters),
    queryFn: () => accountingService.getGLEntries(filters),
  })
}

/**
 * Fetch a single GL entry by ID
 * @param id - GL Entry ID
 * @returns Query result with GL entry data
 */
export const useGLEntry = (id: string) => {
  return useQuery({
    queryKey: accountKeys.glEntry(id),
    queryFn: () => accountingService.getGLEntry(id),
    enabled: !!id,
  })
}

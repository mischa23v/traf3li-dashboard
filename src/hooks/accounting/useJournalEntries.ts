/**
 * Journal Entry Hooks
 * TanStack Query hooks for journal entry operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  accountingService,
  JournalEntry,
  CreateJournalEntryData,
  SimpleJournalEntryData,
} from '@/services/accountingService'
import { accountKeys } from './useAccounts'

// ==================== QUERY KEYS ====================

export const journalEntryKeys = {
  all: ['accounting'] as const,
  journalEntries: () => [...journalEntryKeys.all, 'journal-entries'] as const,
  journalEntriesList: (filters?: { status?: string }) => [...journalEntryKeys.journalEntries(), 'list', filters] as const,
  journalEntry: (id: string) => [...journalEntryKeys.journalEntries(), id] as const,
}

// ==================== JOURNAL ENTRY QUERY HOOKS ====================

/**
 * Fetch journal entries with optional filtering
 * @param filters - Optional filters for journal entries
 * @returns Query result with journal entries data
 */
export const useJournalEntries = (filters?: { status?: string }) => {
  return useQuery({
    queryKey: journalEntryKeys.journalEntriesList(filters),
    queryFn: () => accountingService.getJournalEntries(filters),
  })
}

/**
 * Fetch a single journal entry by ID
 * @param id - Journal Entry ID
 * @returns Query result with journal entry data
 */
export const useJournalEntry = (id: string) => {
  return useQuery({
    queryKey: journalEntryKeys.journalEntry(id),
    queryFn: () => accountingService.getJournalEntry(id),
    enabled: !!id,
  })
}

// ==================== JOURNAL ENTRY MUTATION HOOKS ====================

/**
 * Create a new journal entry
 * @returns Mutation for creating a journal entry
 */
export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateJournalEntryData) => accountingService.createJournalEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.journalEntries() })
      toast.success('تم إنشاء القيد بنجاح')
    },
    onError: () => {
      toast.error('فشل في إنشاء القيد')
    },
  })
}

/**
 * Create a simple journal entry (2-line entry)
 * @returns Mutation for creating a simple journal entry
 */
export const useCreateSimpleJournalEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SimpleJournalEntryData) => accountingService.createSimpleJournalEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.journalEntries() })
      toast.success('تم إنشاء القيد بنجاح')
    },
    onError: () => {
      toast.error('فشل في إنشاء القيد')
    },
  })
}

/**
 * Post a journal entry to the general ledger
 * @returns Mutation for posting a journal entry
 */
export const usePostJournalEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.postJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.journalEntries() })
      queryClient.invalidateQueries({ queryKey: accountKeys.glEntries() })
      toast.success('تم ترحيل القيد بنجاح')
    },
    onError: () => {
      toast.error('فشل في ترحيل القيد')
    },
  })
}

/**
 * Void a journal entry
 * @returns Mutation for voiding a journal entry
 */
export const useVoidJournalEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.voidJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.journalEntries() })
      toast.success('تم إلغاء القيد بنجاح')
    },
    onError: () => {
      toast.error('فشل في إلغاء القيد')
    },
  })
}

/**
 * Delete a journal entry
 * @returns Mutation for deleting a journal entry
 */
export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.journalEntries() })
      toast.success('تم حذف القيد بنجاح')
    },
    onError: () => {
      toast.error('فشل في حذف القيد')
    },
  })
}

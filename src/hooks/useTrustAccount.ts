import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  trustAccountService,
  type TrustAccount,
  type TrustAccountType,
  type TransactionType,
  type TransactionStatus,
  type ReconciliationAdjustment,
} from '@/services/trustAccountService'

// Query key factory
export const trustAccountKeys = {
  all: ['trust-accounts'] as const,
  lists: () => [...trustAccountKeys.all, 'list'] as const,
  list: (filters?: { type?: string; status?: string }) =>
    [...trustAccountKeys.lists(), filters] as const,
  details: () => [...trustAccountKeys.all, 'detail'] as const,
  detail: (id: string) => [...trustAccountKeys.details(), id] as const,
  clientBalances: () => [...trustAccountKeys.all, 'client-balances'] as const,
  clientBalance: (accountId: string, clientId: string) =>
    [...trustAccountKeys.clientBalances(), accountId, clientId] as const,
  transactions: () => [...trustAccountKeys.all, 'transactions'] as const,
  transactionList: (filters?: Record<string, unknown>) =>
    [...trustAccountKeys.transactions(), filters] as const,
  transaction: (id: string) => [...trustAccountKeys.transactions(), id] as const,
  reconciliations: () => [...trustAccountKeys.all, 'reconciliations'] as const,
  reconciliationList: (filters?: Record<string, unknown>) =>
    [...trustAccountKeys.reconciliations(), filters] as const,
  reconciliation: (id: string) => [...trustAccountKeys.reconciliations(), id] as const,
  threeWay: (accountId: string) => [...trustAccountKeys.all, 'three-way', accountId] as const,
  clientLedger: (accountId: string, clientId: string) =>
    [...trustAccountKeys.all, 'ledger', accountId, clientId] as const,
}

// Trust Accounts
export function useTrustAccounts(params?: {
  type?: TrustAccountType
  status?: 'active' | 'inactive' | 'closed'
}) {
  return useQuery({
    queryKey: trustAccountKeys.list(params),
    queryFn: () => trustAccountService.getTrustAccounts(params),
  })
}

export function useTrustAccount(id: string) {
  return useQuery({
    queryKey: trustAccountKeys.detail(id),
    queryFn: () => trustAccountService.getTrustAccount(id),
    enabled: !!id,
  })
}

export function useCreateTrustAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      data: Omit<
        TrustAccount,
        '_id' | 'balance' | 'availableBalance' | 'pendingBalance' | 'createdAt' | 'updatedAt'
      >
    ) => trustAccountService.createTrustAccount(data),
    onSuccess: (data) => {
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: trustAccountKeys.lists() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.lists(), refetchType: 'all' })
    },
  })
}

export function useUpdateTrustAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TrustAccount> }) =>
      trustAccountService.updateTrustAccount(id, data),
    onSuccess: (data) => {
      // Update specific account in cache
      queryClient.setQueryData(trustAccountKeys.detail(data._id), data)
      // Update list cache
      queryClient.setQueriesData({ queryKey: trustAccountKeys.lists() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((item: any) => (item._id === data._id ? data : item))
        }
        return old
      })
    },
    onSettled: async (_, __, variables) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.lists(), refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.detail(variables.id), refetchType: 'all' })
    },
  })
}

export function useCloseTrustAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      trustAccountService.closeTrustAccount(id, reason),
    onSuccess: (data) => {
      // Update specific account in cache
      queryClient.setQueryData(trustAccountKeys.detail(data._id), data)
      // Update list cache
      queryClient.setQueriesData({ queryKey: trustAccountKeys.lists() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((item: any) => (item._id === data._id ? data : item))
        }
        return old
      })
    },
    onSettled: async (_, __, variables) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.lists(), refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.detail(variables.id), refetchType: 'all' })
    },
  })
}

// Client Trust Balances
export function useClientTrustBalances(params?: {
  accountId?: string
  clientId?: string
  caseId?: string
  minBalance?: number
  maxBalance?: number
}) {
  return useQuery({
    queryKey: [...trustAccountKeys.clientBalances(), params],
    queryFn: () => trustAccountService.getClientTrustBalances(params),
  })
}

export function useClientTrustBalance(accountId: string, clientId: string) {
  return useQuery({
    queryKey: trustAccountKeys.clientBalance(accountId, clientId),
    queryFn: () => trustAccountService.getClientTrustBalance(accountId, clientId),
    enabled: !!accountId && !!clientId,
  })
}

// Transactions
export function useTrustTransactions(params?: {
  accountId?: string
  clientId?: string
  caseId?: string
  type?: TransactionType
  status?: TransactionStatus
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: trustAccountKeys.transactionList(params),
    queryFn: () => trustAccountService.getTrustTransactions(params),
  })
}

export function useTrustTransaction(id: string) {
  return useQuery({
    queryKey: trustAccountKeys.transaction(id),
    queryFn: () => trustAccountService.getTrustTransaction(id),
    enabled: !!id,
  })
}

export function useCreateTrustDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      accountId: string
      clientId: string
      caseId?: string
      amount: number
      transactionDate: string
      reference: string
      description: string
      payor: string
      notes?: string
    }) => trustAccountService.createTrustDeposit(data),
    onSuccess: (data) => {
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: trustAccountKeys.transactions() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async (_, __, variables) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.transactions(), refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.clientBalances(), refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.detail(variables.accountId), refetchType: 'all' })
    },
  })
}

export function useCreateTrustWithdrawal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      accountId: string
      clientId: string
      caseId?: string
      amount: number
      transactionDate: string
      reference: string
      description: string
      payee: string
      checkNumber?: string
      relatedInvoiceId?: string
      relatedExpenseId?: string
      notes?: string
    }) => trustAccountService.createTrustWithdrawal(data),
    onSuccess: (data) => {
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: trustAccountKeys.transactions() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async (_, __, variables) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.transactions(), refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.clientBalances(), refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.detail(variables.accountId), refetchType: 'all' })
    },
  })
}

export function useCreateTrustTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      fromAccountId: string
      toAccountId: string
      fromClientId: string
      toClientId: string
      amount: number
      transactionDate: string
      reference: string
      description: string
      notes?: string
    }) => trustAccountService.createTrustTransfer(data),
    onSuccess: (data) => {
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: trustAccountKeys.transactions() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.transactions(), refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.clientBalances(), refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.lists(), refetchType: 'all' })
    },
  })
}

export function useVoidTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      trustAccountService.voidTransaction(id, reason),
    onSuccess: (data) => {
      // Update specific transaction in cache
      queryClient.setQueryData(trustAccountKeys.transaction(data._id), data)
      // Update list cache
      queryClient.setQueriesData({ queryKey: trustAccountKeys.transactions() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((item: any) => (item._id === data._id ? data : item))
        }
        return old
      })
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.transactions(), refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.clientBalances(), refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.lists(), refetchType: 'all' })
    },
  })
}

export function useMarkTransactionCleared() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, clearedDate }: { id: string; clearedDate: string }) =>
      trustAccountService.markTransactionCleared(id, clearedDate),
    onSuccess: (data) => {
      // Update specific transaction in cache
      queryClient.setQueryData(trustAccountKeys.transaction(data._id), data)
      // Update list cache
      queryClient.setQueriesData({ queryKey: trustAccountKeys.transactions() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((item: any) => (item._id === data._id ? data : item))
        }
        return old
      })
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.transactions(), refetchType: 'all' })
    },
  })
}

// Reconciliation
export function useTrustReconciliations(params?: {
  accountId?: string
  status?: 'in_progress' | 'completed' | 'exception'
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: trustAccountKeys.reconciliationList(params),
    queryFn: () => trustAccountService.getReconciliations(params),
  })
}

export function useTrustReconciliation(id: string) {
  return useQuery({
    queryKey: trustAccountKeys.reconciliation(id),
    queryFn: () => trustAccountService.getReconciliation(id),
    enabled: !!id,
  })
}

export function useStartReconciliation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      accountId: string
      periodStart: string
      periodEnd: string
      bankStatementBalance: number
    }) => trustAccountService.startReconciliation(data),
    onSuccess: (data) => {
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: trustAccountKeys.reconciliations() }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.reconciliations(), refetchType: 'all' })
    },
  })
}

export function useUpdateReconciliation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Parameters<typeof trustAccountService.updateReconciliation>[1]
    }) => trustAccountService.updateReconciliation(id, data),
    onSuccess: (data) => {
      // Update specific reconciliation in cache
      queryClient.setQueryData(trustAccountKeys.reconciliation(data._id), data)
    },
    onSettled: async (_, __, variables) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({
        queryKey: trustAccountKeys.reconciliation(variables.id),
        refetchType: 'all'
      })
    },
  })
}

export function useCompleteReconciliation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      trustAccountService.completeReconciliation(id, notes),
    onSuccess: (data) => {
      // Update specific reconciliation in cache
      queryClient.setQueryData(trustAccountKeys.reconciliation(data._id), data)
    },
    onSettled: async (_, __, variables) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.reconciliations(), refetchType: 'all' })
      await queryClient.invalidateQueries({
        queryKey: trustAccountKeys.reconciliation(variables.id),
        refetchType: 'all'
      })
    },
  })
}

export function useAddReconciliationAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      adjustment,
    }: {
      id: string
      adjustment: ReconciliationAdjustment
    }) => trustAccountService.addReconciliationAdjustment(id, adjustment),
    onSuccess: (data) => {
      // Update specific reconciliation in cache
      queryClient.setQueryData(trustAccountKeys.reconciliation(data._id), data)
    },
    onSettled: async (_, __, variables) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({
        queryKey: trustAccountKeys.reconciliation(variables.id),
        refetchType: 'all'
      })
    },
  })
}

// Three-Way Reconciliation
export function useThreeWayReconciliation(accountId: string) {
  return useQuery({
    queryKey: trustAccountKeys.threeWay(accountId),
    queryFn: () => trustAccountService.getThreeWayReconciliationHistory(accountId),
    enabled: !!accountId,
  })
}

export function useRunThreeWayReconciliation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountId: string) =>
      trustAccountService.runThreeWayReconciliation(accountId),
    onSuccess: (data, accountId) => {
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: trustAccountKeys.threeWay(accountId) }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async (_, __, accountId) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({
        queryKey: trustAccountKeys.threeWay(accountId),
        refetchType: 'all'
      })
    },
  })
}

// Reports
export function useClientLedgerReport(
  accountId: string,
  clientId: string,
  params?: { startDate?: string; endDate?: string }
) {
  return useQuery({
    queryKey: [...trustAccountKeys.clientLedger(accountId, clientId), params],
    queryFn: () =>
      trustAccountService.getClientLedgerReport(accountId, clientId, params),
    enabled: !!accountId && !!clientId,
  })
}

export function useExportTrustReport() {
  return useMutation({
    mutationFn: ({
      accountId,
      params,
    }: {
      accountId: string
      params: Parameters<typeof trustAccountService.exportTrustReport>[1]
    }) => trustAccountService.exportTrustReport(accountId, params),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trust-${variables.params.type}-report.${variables.params.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
  })
}

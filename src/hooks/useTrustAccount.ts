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
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.lists() })
    },
  })
}

export function useUpdateTrustAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TrustAccount> }) =>
      trustAccountService.updateTrustAccount(id, data),
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.detail(variables.id) })
    },
  })
}

export function useCloseTrustAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      trustAccountService.closeTrustAccount(id, reason),
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.lists() })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.detail(variables.id) })
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
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.transactions() })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.clientBalances() })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.detail(variables.accountId) })
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
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.transactions() })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.clientBalances() })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.detail(variables.accountId) })
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
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.transactions() })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.clientBalances() })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.lists() })
    },
  })
}

export function useVoidTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      trustAccountService.voidTransaction(id, reason),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.transactions() })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.clientBalances() })
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.lists() })
    },
  })
}

export function useMarkTransactionCleared() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, clearedDate }: { id: string; clearedDate: string }) =>
      trustAccountService.markTransactionCleared(id, clearedDate),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.transactions() })
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
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.reconciliations() })
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
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({
        queryKey: trustAccountKeys.reconciliation(variables.id),
      })
    },
  })
}

export function useCompleteReconciliation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      trustAccountService.completeReconciliation(id, notes),
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: trustAccountKeys.reconciliations() })
      await queryClient.invalidateQueries({
        queryKey: trustAccountKeys.reconciliation(variables.id),
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
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({
        queryKey: trustAccountKeys.reconciliation(variables.id),
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
    onSettled: async (_, __, accountId) => {
      await queryClient.invalidateQueries({
        queryKey: trustAccountKeys.threeWay(accountId),
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

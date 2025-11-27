/**
 * Bank Accounts Hooks
 * TanStack Query hooks for bank account management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import bankAccountsService, {
  BankAccount,
  BankTransfer,
  BankTransaction,
  BankReconciliation,
  CreateBankAccountData,
  CreateTransferData,
  BankAccountFilters,
  BankTransactionFilters,
} from '@/services/bankAccountsService'

const QUERY_KEYS = {
  accounts: 'bank-accounts',
  account: 'bank-account',
  summary: 'bank-accounts-summary',
  balanceHistory: 'bank-balance-history',
  transfers: 'bank-transfers',
  transfer: 'bank-transfer',
  transactions: 'bank-transactions',
  reconciliations: 'bank-reconciliations',
  reconciliation: 'bank-reconciliation',
}

// ==================== ACCOUNTS ====================

export const useBankAccounts = (filters?: BankAccountFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.accounts, filters],
    queryFn: () => bankAccountsService.getAccounts(filters),
  })
}

export const useBankAccount = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.account, id],
    queryFn: () => bankAccountsService.getAccount(id),
    enabled: !!id,
  })
}

export const useBankAccountsSummary = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.summary],
    queryFn: () => bankAccountsService.getSummary(),
  })
}

export const useBankBalanceHistory = (id: string, period: 'week' | 'month' | 'quarter' | 'year') => {
  return useQuery({
    queryKey: [QUERY_KEYS.balanceHistory, id, period],
    queryFn: () => bankAccountsService.getBalanceHistory(id, period),
    enabled: !!id,
  })
}

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBankAccountData) => bankAccountsService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.summary] })
    },
  })
}

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBankAccountData> }) =>
      bankAccountsService.updateAccount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.account, id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.summary] })
    },
  })
}

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bankAccountsService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.summary] })
    },
  })
}

export const useSetDefaultAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bankAccountsService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] })
    },
  })
}

// ==================== TRANSFERS ====================

export const useBankTransfers = (filters?: Parameters<typeof bankAccountsService.getTransfers>[0]) => {
  return useQuery({
    queryKey: [QUERY_KEYS.transfers, filters],
    queryFn: () => bankAccountsService.getTransfers(filters),
  })
}

export const useBankTransfer = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.transfer, id],
    queryFn: () => bankAccountsService.getTransfer(id),
    enabled: !!id,
  })
}

export const useCreateBankTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransferData) => bankAccountsService.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transfers] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.summary] })
    },
  })
}

export const useCancelBankTransfer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bankAccountsService.cancelTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transfers] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] })
    },
  })
}

// ==================== TRANSACTIONS ====================

export const useBankTransactions = (filters?: BankTransactionFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.transactions, filters],
    queryFn: () => bankAccountsService.getTransactions(filters),
  })
}

export const useImportTransactions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ accountId, file }: { accountId: string; file: File }) =>
      bankAccountsService.importTransactions(accountId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] })
    },
  })
}

export const useMatchTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      transactionId,
      matchData,
    }: {
      transactionId: string
      matchData: { type: 'invoice' | 'expense' | 'payment' | 'transfer'; recordId: string }
    }) => bankAccountsService.matchTransaction(transactionId, matchData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] })
    },
  })
}

export const useUnmatchTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transactionId: string) => bankAccountsService.unmatchTransaction(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] })
    },
  })
}

export const useCreateBankTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Parameters<typeof bankAccountsService.createTransaction>[0]) =>
      bankAccountsService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] })
    },
  })
}

// ==================== RECONCILIATION ====================

export const useBankReconciliations = (accountId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.reconciliations, accountId],
    queryFn: () => bankAccountsService.getReconciliations(accountId),
  })
}

export const useBankReconciliation = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.reconciliation, id],
    queryFn: () => bankAccountsService.getReconciliation(id),
    enabled: !!id,
  })
}

export const useStartReconciliation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Parameters<typeof bankAccountsService.startReconciliation>[0]) =>
      bankAccountsService.startReconciliation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.reconciliations] })
    },
  })
}

export const useClearReconciliationTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reconciliationId,
      transactionId,
    }: {
      reconciliationId: string
      transactionId: string
    }) => bankAccountsService.clearTransaction(reconciliationId, transactionId),
    onSuccess: (_, { reconciliationId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.reconciliation, reconciliationId] })
    },
  })
}

export const useUnclearReconciliationTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      reconciliationId,
      transactionId,
    }: {
      reconciliationId: string
      transactionId: string
    }) => bankAccountsService.unclearTransaction(reconciliationId, transactionId),
    onSuccess: (_, { reconciliationId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.reconciliation, reconciliationId] })
    },
  })
}

export const useCompleteReconciliation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bankAccountsService.completeReconciliation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.reconciliations] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] })
    },
  })
}

export const useCancelReconciliation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bankAccountsService.cancelReconciliation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.reconciliations] })
    },
  })
}

// ==================== BANK CONNECTIONS ====================

export const useSyncBankAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountId: string) => bankAccountsService.syncAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] })
    },
  })
}

export const useConnectBank = () => {
  return useMutation({
    mutationFn: (provider: string) => bankAccountsService.connectBank(provider),
  })
}

export const useDisconnectBank = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountId: string) => bankAccountsService.disconnectBank(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] })
    },
  })
}

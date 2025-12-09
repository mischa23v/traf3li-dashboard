import { api } from '@/lib/api'

// Trust Account Types
export type TrustAccountType = 'iolta' | 'client_trust' | 'escrow' | 'retainer'

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer_in'
  | 'transfer_out'
  | 'fee_disbursement'
  | 'expense_disbursement'
  | 'interest_credit'
  | 'adjustment'

export type TransactionStatus = 'pending' | 'cleared' | 'reconciled' | 'void'

// Trust Account
export interface TrustAccount {
  _id: string
  accountNumber: string
  accountName: string
  type: TrustAccountType
  bankName: string
  bankAccountNumber: string
  routingNumber?: string
  swiftCode?: string
  currency: string
  balance: number
  availableBalance: number
  pendingBalance: number
  status: 'active' | 'inactive' | 'closed'
  interestBearing: boolean
  interestRate?: number
  lastReconciled?: string
  reconciledBalance?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// Client Trust Balance
export interface ClientTrustBalance {
  _id: string
  clientId: string
  clientName: string
  accountId: string
  caseId?: string
  caseNumber?: string
  balance: number
  availableBalance: number
  pendingBalance: number
  lastTransaction?: string
  lastTransactionType?: TransactionType
  lastTransactionAmount?: number
}

// Trust Transaction
export interface TrustTransaction {
  _id: string
  accountId: string
  accountName: string
  clientId: string
  clientName: string
  caseId?: string
  caseNumber?: string
  transactionDate: string
  type: TransactionType
  amount: number
  runningBalance: number
  reference: string
  description: string
  payee?: string
  payor?: string
  checkNumber?: string
  status: TransactionStatus
  clearedDate?: string
  reconciledDate?: string
  relatedInvoiceId?: string
  relatedExpenseId?: string
  notes?: string
  attachments?: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Trust Reconciliation
export interface TrustReconciliation {
  _id: string
  accountId: string
  accountName: string
  reconciliationDate: string
  periodStart: string
  periodEnd: string
  openingBalance: number
  closingBalance: number
  bankStatementBalance: number
  clearedDeposits: number
  clearedWithdrawals: number
  outstandingDeposits: number
  outstandingWithdrawals: number
  difference: number
  status: 'in_progress' | 'completed' | 'exception'
  reconciledBy: string
  reconciledAt?: string
  notes?: string
  adjustments?: ReconciliationAdjustment[]
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface ReconciliationAdjustment {
  description: string
  amount: number
  type: 'bank_adjustment' | 'book_adjustment'
  reference?: string
}

// Three-Way Reconciliation
export interface ThreeWayReconciliation {
  _id: string
  accountId: string
  reconciliationDate: string
  bankBalance: number
  bookBalance: number
  clientLedgerBalance: number
  isBalanced: boolean
  discrepancies?: {
    bankToBook: number
    bookToLedger: number
    bankToLedger: number
  }
  details?: {
    clientId: string
    clientName: string
    ledgerBalance: number
    bookBalance: number
    difference: number
  }[]
  status: 'balanced' | 'unbalanced' | 'exception'
  verifiedBy?: string
  verifiedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// API Response Types
export interface TrustAccountListResponse {
  data: TrustAccount[]
  total: number
}

export interface ClientTrustBalanceListResponse {
  data: ClientTrustBalance[]
  total: number
  totalBalance: number
}

export interface TrustTransactionListResponse {
  data: TrustTransaction[]
  total: number
  page: number
  pageSize: number
}

export interface TrustReconciliationListResponse {
  data: TrustReconciliation[]
  total: number
  page: number
  pageSize: number
}

// API Functions
export const trustAccountService = {
  // Trust Accounts
  getTrustAccounts: async (params?: {
    type?: TrustAccountType
    status?: 'active' | 'inactive' | 'closed'
  }): Promise<TrustAccountListResponse> => {
    const response = await api.get('/trust-accounts', { params })
    return response.data
  },

  getTrustAccount: async (id: string): Promise<TrustAccount> => {
    const response = await api.get(`/trust-accounts/${id}`)
    return response.data
  },

  createTrustAccount: async (
    data: Omit<TrustAccount, '_id' | 'balance' | 'availableBalance' | 'pendingBalance' | 'createdAt' | 'updatedAt'>
  ): Promise<TrustAccount> => {
    const response = await api.post('/trust-accounts', data)
    return response.data
  },

  updateTrustAccount: async (id: string, data: Partial<TrustAccount>): Promise<TrustAccount> => {
    const response = await api.patch(`/trust-accounts/${id}`, data)
    return response.data
  },

  closeTrustAccount: async (id: string, reason: string): Promise<TrustAccount> => {
    const response = await api.put(`/trust-accounts/${id}/close`, { reason })
    return response.data
  },

  // Client Trust Balances
  getClientTrustBalances: async (accountId: string, params?: {
    clientId?: string
    caseId?: string
    minBalance?: number
    maxBalance?: number
  }): Promise<ClientTrustBalanceListResponse> => {
    const response = await api.get(`/trust-accounts/${accountId}/balances`, { params })
    return response.data
  },

  getClientTrustBalance: async (
    accountId: string,
    clientId: string
  ): Promise<ClientTrustBalance> => {
    const response = await api.get(`/trust-accounts/${accountId}/balances/${clientId}`)
    return response.data
  },

  // Trust Transactions
  getTrustTransactions: async (accountId: string, params?: {
    clientId?: string
    caseId?: string
    type?: TransactionType
    status?: TransactionStatus
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }): Promise<TrustTransactionListResponse> => {
    const response = await api.get(`/trust-accounts/${accountId}/transactions`, { params })
    return response.data
  },

  getTrustTransaction: async (accountId: string, transactionId: string): Promise<TrustTransaction> => {
    const response = await api.get(`/trust-accounts/${accountId}/transactions/${transactionId}`)
    return response.data
  },

  createTrustDeposit: async (data: {
    accountId: string
    clientId: string
    caseId?: string
    amount: number
    transactionDate: string
    reference: string
    description: string
    payor: string
    notes?: string
  }): Promise<TrustTransaction> => {
    const { accountId, ...transactionData } = data
    const response = await api.post(`/trust-accounts/${accountId}/transactions`, transactionData)
    return response.data
  },

  createTrustWithdrawal: async (data: {
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
  }): Promise<TrustTransaction> => {
    const { accountId, ...transactionData } = data
    const response = await api.post(`/trust-accounts/${accountId}/transactions`, transactionData)
    return response.data
  },

  createTrustTransfer: async (data: {
    fromAccountId: string
    toAccountId: string
    fromClientId: string
    toClientId: string
    amount: number
    transactionDate: string
    reference: string
    description: string
    notes?: string
  }): Promise<{ fromTransaction: TrustTransaction; toTransaction: TrustTransaction }> => {
    const { fromAccountId, ...transferData } = data
    const response = await api.post(`/trust-accounts/${fromAccountId}/transfer`, transferData)
    return response.data
  },

  voidTransaction: async (accountId: string, transactionId: string, reason: string): Promise<TrustTransaction> => {
    const response = await api.post(`/trust-accounts/${accountId}/transactions/${transactionId}/void`, { reason })
    return response.data
  },

  markTransactionCleared: async (id: string, clearedDate: string): Promise<TrustTransaction> => {
    const response = await api.put(`/trust-transactions/${id}/clear`, { clearedDate })
    return response.data
  },

  // Reconciliation
  getReconciliations: async (accountId: string, params?: {
    status?: 'in_progress' | 'completed' | 'exception'
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }): Promise<TrustReconciliationListResponse> => {
    const response = await api.get(`/trust-accounts/${accountId}/reconciliations`, { params })
    return response.data
  },

  getReconciliation: async (accountId: string, reconciliationId: string): Promise<TrustReconciliation> => {
    // Note: Backend doesn't have a specific endpoint for getting a single reconciliation
    // Use getReconciliations and filter by ID instead
    const response = await api.get(`/trust-accounts/${accountId}/reconciliations`)
    const reconciliations = response.data.data || []
    const reconciliation = reconciliations.find((r: any) => r._id === reconciliationId)
    if (!reconciliation) {
      throw new Error(`Reconciliation ${reconciliationId} not found`)
    }
    return reconciliation
  },

  startReconciliation: async (data: {
    accountId: string
    periodStart: string
    periodEnd: string
    bankStatementBalance: number
  }): Promise<TrustReconciliation> => {
    const { accountId, ...reconciliationData } = data
    const response = await api.post(`/trust-accounts/${accountId}/reconciliations`, reconciliationData)
    return response.data
  },

  updateReconciliation: async (
    accountId: string,
    reconciliationId: string,
    data: Partial<TrustReconciliation>
  ): Promise<TrustReconciliation> => {
    // Note: Backend doesn't have an update reconciliation endpoint
    throw new Error('Endpoint not available')
  },

  completeReconciliation: async (
    accountId: string,
    reconciliationId: string,
    notes?: string
  ): Promise<TrustReconciliation> => {
    // Note: Backend doesn't have a complete reconciliation endpoint
    throw new Error('Endpoint not available')
  },

  addReconciliationAdjustment: async (
    accountId: string,
    reconciliationId: string,
    adjustment: ReconciliationAdjustment
  ): Promise<TrustReconciliation> => {
    // Note: Backend doesn't have an adjustment endpoint
    throw new Error('Endpoint not available')
  },

  // Three-Way Reconciliation
  runThreeWayReconciliation: async (accountId: string): Promise<ThreeWayReconciliation> => {
    const response = await api.post(`/trust-accounts/${accountId}/three-way-reconciliations`)
    return response.data
  },

  getThreeWayReconciliationHistory: async (
    accountId: string
  ): Promise<ThreeWayReconciliation[]> => {
    const response = await api.get(`/trust-accounts/${accountId}/three-way-reconciliations`)
    return response.data
  },

  // Reports
  getClientLedgerReport: async (
    accountId: string,
    clientId: string,
    params?: {
      startDate?: string
      endDate?: string
    }
  ): Promise<{
    client: { id: string; name: string }
    openingBalance: number
    closingBalance: number
    transactions: TrustTransaction[]
  }> => {
    const response = await api.get(
      `/trust-accounts/${accountId}/clients/${clientId}/ledger`,
      { params }
    )
    return response.data
  },

  exportTrustReport: async (
    accountId: string,
    params: {
      type: 'transactions' | 'reconciliation' | 'client_ledger' | 'three_way'
      startDate?: string
      endDate?: string
      clientId?: string
      format: 'pdf' | 'xlsx'
    }
  ): Promise<Blob> => {
    const response = await api.get(`/trust-accounts/${accountId}/export`, {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}

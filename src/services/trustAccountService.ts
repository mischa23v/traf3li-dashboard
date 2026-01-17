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

  // Note: Backend doesn't have a close endpoint - use updateTrustAccount with status: 'closed'
  closeTrustAccount: async (id: string, reason: string): Promise<TrustAccount> => {
    const response = await api.patch(`/trust-accounts/${id}`, { status: 'closed', notes: reason })
    return response.data
  },

  deleteTrustAccount: async (id: string): Promise<void> => {
    await api.delete(`/trust-accounts/${id}`)
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

  /**
   * Mark transaction as cleared
   * POST /trust-accounts/transactions/:id/clear
   */
  markTransactionCleared: async (accountId: string, transactionId: string, clearedDate: string): Promise<TrustTransaction> => {
    const response = await api.post(`/trust-accounts/${accountId}/transactions/${transactionId}/clear`, { clearedDate })
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

  /**
   * Get single reconciliation
   * GET /trust-accounts/:accountId/reconciliations/:reconciliationId
   */
  getReconciliation: async (accountId: string, reconciliationId: string): Promise<TrustReconciliation> => {
    const response = await api.get(`/trust-accounts/${accountId}/reconciliations/${reconciliationId}`)
    return response.data
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

  /**
   * Update reconciliation
   * PATCH /trust-accounts/:accountId/reconciliations/:reconciliationId
   */
  updateReconciliation: async (
    accountId: string,
    reconciliationId: string,
    data: Partial<TrustReconciliation>
  ): Promise<TrustReconciliation> => {
    const response = await api.patch(`/trust-accounts/${accountId}/reconciliations/${reconciliationId}`, data)
    return response.data
  },

  /**
   * Complete reconciliation
   * POST /trust-accounts/:accountId/reconciliations/:reconciliationId/complete
   */
  completeReconciliation: async (
    accountId: string,
    reconciliationId: string,
    notes?: string
  ): Promise<TrustReconciliation> => {
    const response = await api.post(`/trust-accounts/${accountId}/reconciliations/${reconciliationId}/complete`, { notes })
    return response.data
  },

  /**
   * Add reconciliation adjustment
   * POST /trust-accounts/:accountId/reconciliations/:reconciliationId/adjustments
   */
  addReconciliationAdjustment: async (
    accountId: string,
    reconciliationId: string,
    adjustment: ReconciliationAdjustment
  ): Promise<TrustReconciliation> => {
    const response = await api.post(`/trust-accounts/${accountId}/reconciliations/${reconciliationId}/adjustments`, adjustment)
    return response.data
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

  /**
   * Get client ledger report
   * GET /trust-accounts/:accountId/reports/client-ledger/:clientId
   */
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
    const response = await api.get(`/trust-accounts/${accountId}/reports/client-ledger/${clientId}`, { params })
    return response.data
  },

  /**
   * Export trust report
   * GET /trust-accounts/:accountId/reports/export
   */
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
    const response = await api.get(`/trust-accounts/${accountId}/reports/export`, {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // Get account summary
  getAccountSummary: async (id: string): Promise<any> => {
    const response = await api.get(`/trust-accounts/${id}/summary`)
    return response.data
  },
}

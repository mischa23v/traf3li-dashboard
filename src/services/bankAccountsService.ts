/**
 * Bank Accounts Service
 * Akaunting-inspired bank account management
 * Features: accounts, transfers, reconciliation, connections
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== TYPES ====================
 */

export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan' | 'other'
export type TransferStatus = 'pending' | 'completed' | 'failed' | 'cancelled'
export type ReconciliationStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

/**
 * Bank Account Interface
 */
export interface BankAccount {
  _id: string
  accountNumber: string
  name: string
  nameAr?: string
  type: AccountType
  bankName: string
  bankCode?: string
  currency: string
  balance: number
  availableBalance?: number
  openingBalance: number
  isDefault: boolean
  isActive: boolean
  // Bank details
  iban?: string
  swiftCode?: string
  routingNumber?: string
  branchName?: string
  branchCode?: string
  // Holder info
  accountHolder: string
  accountHolderAddress?: string
  // Settings
  minBalance?: number
  overdraftLimit?: number
  interestRate?: number
  // Metadata
  description?: string
  notes?: string
  color?: string
  icon?: string
  // Connection (for bank syncing)
  connection?: BankConnection
  lastSyncedAt?: string
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Bank Connection for automated syncing
 */
export interface BankConnection {
  _id: string
  provider: string // e.g., 'plaid', 'yodlee', 'saltedge'
  institutionId: string
  institutionName: string
  status: 'connected' | 'disconnected' | 'error' | 'expired'
  lastSyncedAt?: string
  accessToken?: string // Encrypted
  refreshToken?: string // Encrypted
  expiresAt?: string
  error?: string
}

/**
 * Bank Transfer Interface
 */
export interface BankTransfer {
  _id: string
  transferNumber: string
  fromAccountId: string
  fromAccount?: BankAccount
  toAccountId: string
  toAccount?: BankAccount
  amount: number
  fromCurrency: string
  toCurrency: string
  exchangeRate?: number
  fee?: number
  date: string
  status: TransferStatus
  reference?: string
  description?: string
  notes?: string
  // Audit
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Bank Transaction (for reconciliation)
 */
export interface BankTransaction {
  _id: string
  accountId: string
  transactionId: string
  date: string
  type: 'credit' | 'debit'
  amount: number
  balance?: number
  description: string
  reference?: string
  category?: string
  payee?: string
  // Matching
  matched: boolean
  matchedTransactionId?: string
  matchedType?: 'invoice' | 'expense' | 'payment' | 'transfer'
  // Reconciliation
  reconciliationId?: string
  isReconciled: boolean
  // Import info
  importBatchId?: string
  rawData?: any
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Bank Reconciliation Interface
 */
export interface BankReconciliation {
  _id: string
  reconciliationNumber: string
  accountId: string
  account?: BankAccount
  startDate: string
  endDate: string
  openingBalance: number
  closingBalance: number
  statementBalance: number
  difference: number
  status: ReconciliationStatus
  // Transactions
  transactions: {
    transactionId: string
    amount: number
    date: string
    type: 'credit' | 'debit'
    description: string
    isCleared: boolean
    clearedAt?: string
  }[]
  // Summary
  totalCredits: number
  totalDebits: number
  clearedCredits: number
  clearedDebits: number
  // Audit
  startedBy: string
  startedAt: string
  completedBy?: string
  completedAt?: string
  notes?: string
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Create Bank Account Data
 */
export interface CreateBankAccountData {
  name: string
  nameAr?: string
  type: AccountType
  bankName: string
  accountNumber?: string
  currency?: string
  openingBalance?: number
  iban?: string
  swiftCode?: string
  accountHolder: string
  accountHolderAddress?: string
  branchName?: string
  isDefault?: boolean
  description?: string
  color?: string
}

/**
 * Create Transfer Data
 */
export interface CreateTransferData {
  fromAccountId: string
  toAccountId: string
  amount: number
  date: string
  exchangeRate?: number
  fee?: number
  reference?: string
  description?: string
}

/**
 * Bank Account Filters
 */
export interface BankAccountFilters {
  type?: AccountType
  currency?: string
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
}

/**
 * Transaction Filters
 */
export interface BankTransactionFilters {
  accountId?: string
  startDate?: string
  endDate?: string
  type?: 'credit' | 'debit'
  matched?: boolean
  isReconciled?: boolean
  search?: string
  page?: number
  limit?: number
}

/**
 * ==================== SERVICE ====================
 */

const bankAccountsService = {
  // ==================== ACCOUNTS ====================

  /**
   * Get all bank accounts
   */
  getAccounts: async (filters?: BankAccountFilters): Promise<{ accounts: BankAccount[]; total: number }> => {
    try {
      const response = await apiClient.get('/bank-accounts', { params: filters })
      return {
        accounts: response.data.accounts || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      console.error('Get bank accounts error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single bank account
   */
  getAccount: async (id: string): Promise<BankAccount> => {
    try {
      const response = await apiClient.get(`/bank-accounts/${id}`)
      return response.data.account || response.data.data
    } catch (error: any) {
      console.error('Get bank account error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create bank account
   */
  createAccount: async (data: CreateBankAccountData): Promise<BankAccount> => {
    try {
      const response = await apiClient.post('/bank-accounts', data)
      return response.data.account || response.data.data
    } catch (error: any) {
      console.error('Create bank account error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update bank account
   */
  updateAccount: async (id: string, data: Partial<CreateBankAccountData>): Promise<BankAccount> => {
    try {
      const response = await apiClient.put(`/bank-accounts/${id}`, data)
      return response.data.account || response.data.data
    } catch (error: any) {
      console.error('Update bank account error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete bank account
   */
  deleteAccount: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/bank-accounts/${id}`)
    } catch (error: any) {
      console.error('Delete bank account error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Set default account
   */
  setDefault: async (id: string): Promise<BankAccount> => {
    try {
      const response = await apiClient.post(`/bank-accounts/${id}/set-default`)
      return response.data.account || response.data.data
    } catch (error: any) {
      console.error('Set default account error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get account balance history
   */
  getBalanceHistory: async (id: string, period: 'week' | 'month' | 'quarter' | 'year'): Promise<{
    data: { date: string; balance: number }[]
  }> => {
    try {
      const response = await apiClient.get(`/bank-accounts/${id}/balance-history`, { params: { period } })
      return response.data
    } catch (error: any) {
      console.error('Get balance history error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get accounts summary
   */
  getSummary: async (): Promise<{
    totalBalance: number
    totalAccounts: number
    byType: { type: AccountType; count: number; balance: number }[]
    byCurrency: { currency: string; balance: number }[]
  }> => {
    try {
      const response = await apiClient.get('/bank-accounts/summary')
      return response.data.summary || response.data.data || response.data
    } catch (error: any) {
      console.error('Get accounts summary error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== TRANSFERS ====================

  /**
   * Get all transfers
   */
  getTransfers: async (filters?: {
    fromAccountId?: string
    toAccountId?: string
    startDate?: string
    endDate?: string
    status?: TransferStatus
    page?: number
    limit?: number
  }): Promise<{ transfers: BankTransfer[]; total: number }> => {
    try {
      const response = await apiClient.get('/bank-transfers', { params: filters })
      return {
        transfers: response.data.transfers || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      console.error('Get transfers error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single transfer
   */
  getTransfer: async (id: string): Promise<BankTransfer> => {
    try {
      const response = await apiClient.get(`/bank-transfers/${id}`)
      return response.data.transfer || response.data.data
    } catch (error: any) {
      console.error('Get transfer error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create transfer
   */
  createTransfer: async (data: CreateTransferData): Promise<BankTransfer> => {
    try {
      const response = await apiClient.post('/bank-transfers', data)
      return response.data.transfer || response.data.data
    } catch (error: any) {
      console.error('Create transfer error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel transfer
   */
  cancelTransfer: async (id: string): Promise<BankTransfer> => {
    try {
      const response = await apiClient.post(`/bank-transfers/${id}/cancel`)
      return response.data.transfer || response.data.data
    } catch (error: any) {
      console.error('Cancel transfer error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== TRANSACTIONS ====================

  /**
   * Get bank transactions
   */
  getTransactions: async (filters?: BankTransactionFilters): Promise<{ transactions: BankTransaction[]; total: number }> => {
    try {
      const response = await apiClient.get('/bank-transactions', { params: filters })
      return {
        transactions: response.data.transactions || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      console.error('Get bank transactions error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Import transactions from file (CSV, OFX, QIF)
   */
  importTransactions: async (accountId: string, file: File): Promise<{
    imported: number
    duplicates: number
    errors: any[]
  }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post(`/bank-accounts/${accountId}/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (error: any) {
      console.error('Import transactions error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Match transaction with system record
   */
  matchTransaction: async (transactionId: string, matchData: {
    type: 'invoice' | 'expense' | 'payment' | 'transfer'
    recordId: string
  }): Promise<BankTransaction> => {
    try {
      const response = await apiClient.post(`/bank-transactions/${transactionId}/match`, matchData)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      console.error('Match transaction error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unmatch transaction
   */
  unmatchTransaction: async (transactionId: string): Promise<BankTransaction> => {
    try {
      const response = await apiClient.post(`/bank-transactions/${transactionId}/unmatch`)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      console.error('Unmatch transaction error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create transaction (manual entry)
   */
  createTransaction: async (data: {
    accountId: string
    date: string
    type: 'credit' | 'debit'
    amount: number
    description: string
    reference?: string
    category?: string
    payee?: string
  }): Promise<BankTransaction> => {
    try {
      const response = await apiClient.post('/bank-transactions', data)
      return response.data.transaction || response.data.data
    } catch (error: any) {
      console.error('Create transaction error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== RECONCILIATION ====================

  /**
   * Get reconciliations
   */
  getReconciliations: async (accountId?: string): Promise<{ reconciliations: BankReconciliation[] }> => {
    try {
      const response = await apiClient.get('/bank-reconciliations', {
        params: { accountId },
      })
      return {
        reconciliations: response.data.reconciliations || response.data.data || [],
      }
    } catch (error: any) {
      console.error('Get reconciliations error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single reconciliation
   */
  getReconciliation: async (id: string): Promise<BankReconciliation> => {
    try {
      const response = await apiClient.get(`/bank-reconciliations/${id}`)
      return response.data.reconciliation || response.data.data
    } catch (error: any) {
      console.error('Get reconciliation error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Start reconciliation
   */
  startReconciliation: async (data: {
    accountId: string
    endDate: string
    statementBalance: number
  }): Promise<BankReconciliation> => {
    try {
      const response = await apiClient.post('/bank-reconciliations', data)
      return response.data.reconciliation || response.data.data
    } catch (error: any) {
      console.error('Start reconciliation error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Clear transaction in reconciliation
   */
  clearTransaction: async (reconciliationId: string, transactionId: string): Promise<BankReconciliation> => {
    try {
      const response = await apiClient.post(`/bank-reconciliations/${reconciliationId}/clear`, {
        transactionId,
      })
      return response.data.reconciliation || response.data.data
    } catch (error: any) {
      console.error('Clear transaction error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unclear transaction in reconciliation
   */
  unclearTransaction: async (reconciliationId: string, transactionId: string): Promise<BankReconciliation> => {
    try {
      const response = await apiClient.post(`/bank-reconciliations/${reconciliationId}/unclear`, {
        transactionId,
      })
      return response.data.reconciliation || response.data.data
    } catch (error: any) {
      console.error('Unclear transaction error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Complete reconciliation
   */
  completeReconciliation: async (id: string): Promise<BankReconciliation> => {
    try {
      const response = await apiClient.post(`/bank-reconciliations/${id}/complete`)
      return response.data.reconciliation || response.data.data
    } catch (error: any) {
      console.error('Complete reconciliation error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel reconciliation
   */
  cancelReconciliation: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/bank-reconciliations/${id}/cancel`)
    } catch (error: any) {
      console.error('Cancel reconciliation error:', error)
      throw new Error(handleApiError(error))
    }
  },

  // ==================== BANK CONNECTIONS ====================

  /**
   * Connect bank account (initiate OAuth flow)
   */
  connectBank: async (provider: string): Promise<{ authUrl: string }> => {
    try {
      const response = await apiClient.post('/bank-connections/connect', { provider })
      return response.data
    } catch (error: any) {
      console.error('Connect bank error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Complete bank connection
   */
  completeConnection: async (code: string, state: string): Promise<BankConnection> => {
    try {
      const response = await apiClient.post('/bank-connections/callback', { code, state })
      return response.data.connection || response.data.data
    } catch (error: any) {
      console.error('Complete connection error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Sync bank account
   */
  syncAccount: async (accountId: string): Promise<{
    synced: number
    newTransactions: number
    lastSyncedAt: string
  }> => {
    try {
      const response = await apiClient.post(`/bank-accounts/${accountId}/sync`)
      return response.data
    } catch (error: any) {
      console.error('Sync account error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Disconnect bank account
   */
  disconnectBank: async (accountId: string): Promise<void> => {
    try {
      await apiClient.post(`/bank-accounts/${accountId}/disconnect`)
    } catch (error: any) {
      console.error('Disconnect bank error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

export default bankAccountsService

/**
 * Account Service
 * Handles all account-related API calls (chart of accounts)
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== TYPES ====================
 */

export interface Account {
  _id: string
  accountCode: string
  accountName: string
  accountNameAr?: string
  accountType: string
  parentAccountId?: string | Account
  description?: string
  isActive: boolean
  balance?: number
  debit?: number
  credit?: number
  currency?: string
  taxSettings?: {
    isTaxable: boolean
    taxRate?: number
    taxCode?: string
  }
  createdAt: string
  updatedAt: string
  children?: Account[]
}

export interface AccountType {
  value: string
  label: string
  labelAr?: string
  category: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
}

export interface CreateAccountData {
  accountCode: string
  accountName: string
  accountNameAr?: string
  accountType: string
  parentAccountId?: string
  description?: string
  isActive?: boolean
  currency?: string
  taxSettings?: {
    isTaxable: boolean
    taxRate?: number
    taxCode?: string
  }
}

export interface AccountBalance {
  accountId: string
  accountCode: string
  accountName: string
  balance: number
  debit: number
  credit: number
  currency: string
  asOfDate: string
  transactions?: Array<{
    transactionId: string
    date: string
    description: string
    debit: number
    credit: number
    balance: number
  }>
}

export interface AccountFilters {
  accountType?: string
  isActive?: boolean
  parentAccountId?: string
  search?: string
  includeHierarchy?: boolean
}

export interface BalanceFilters {
  startDate?: string
  endDate?: string
  includeTransactions?: boolean
}

/**
 * Account Service Object
 */
const accountService = {
  /**
   * Get all accounts
   * GET /api/accounts
   * Supports ?includeHierarchy=true for hierarchical structure
   */
  getAccounts: async (filters?: AccountFilters): Promise<{ accounts: Account[]; total: number }> => {
    try {
      const response = await apiClient.get('/accounts', { params: filters })
      return {
        accounts: response.data.accounts || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single account with balance
   * GET /api/accounts/:id
   */
  getAccount: async (id: string): Promise<Account> => {
    try {
      const response = await apiClient.get(`/accounts/${id}`)
      return response.data.account || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get account balance with filters
   * GET /api/accounts/:id/balance
   */
  getAccountBalance: async (id: string, filters?: BalanceFilters): Promise<AccountBalance> => {
    try {
      const response = await apiClient.get(`/accounts/${id}/balance`, { params: filters })
      return response.data.balance || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get account types (dropdown data)
   * GET /api/accounts/types
   */
  getAccountTypes: async (): Promise<AccountType[]> => {
    try {
      const response = await apiClient.get('/accounts/types')
      return response.data.types || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new account
   * POST /api/accounts
   */
  createAccount: async (data: CreateAccountData): Promise<Account> => {
    try {
      const response = await apiClient.post('/accounts', data)
      return response.data.account || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update account
   * PATCH /api/accounts/:id
   */
  updateAccount: async (id: string, data: Partial<CreateAccountData>): Promise<Account> => {
    try {
      const response = await apiClient.patch(`/accounts/${id}`, data)
      return response.data.account || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete account
   * DELETE /api/accounts/:id
   */
  deleteAccount: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/accounts/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default accountService

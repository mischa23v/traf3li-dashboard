/**
 * Account Service
 * Handles all account-related API calls (chart of accounts)
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== TYPES ====================
 * Matches contract: contract2/types/accounting.ts
 */

/**
 * Account Type enum
 */
export type AccountTypeEnum = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'

/**
 * Account Sub Type enum
 */
export type AccountSubType =
  | 'Current Asset'
  | 'Fixed Asset'
  | 'Other Asset'
  | 'Current Liability'
  | 'Long-term Liability'
  | 'Other Liability'
  | "Owner's Equity"
  | 'Retained Earnings'
  | 'Operating Income'
  | 'Other Income'
  | 'Cost of Goods Sold'
  | 'Operating Expense'
  | 'Other Expense'

/**
 * Account Balance structure
 */
export interface AccountBalanceData {
  debit: number
  credit: number
  balance: number
}

/**
 * Account Interface
 * Matches contract: contract2/types/accounting.ts - Account
 */
export interface Account {
  _id: string
  code: string
  name: string
  nameAr?: string
  type: AccountTypeEnum
  subType?: AccountSubType
  parentAccountId?: string | Account
  description?: string
  descriptionAr?: string
  isActive: boolean
  isSystem: boolean
  firmId?: string
  lawyerId?: string
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
  children?: Account[]
  balance?: AccountBalanceData
}

/**
 * Account Type Option (for dropdown data)
 */
export interface AccountTypeOption {
  value: AccountTypeEnum
  label: string
  labelAr: string
}

/**
 * Account Sub Type Option (for dropdown data)
 */
export interface AccountSubTypeOption {
  value: AccountSubType
  label: string
  type: AccountTypeEnum
}

/**
 * Create Account Data
 * Matches contract: contract2/types/accounting.ts - CreateAccountRequest
 */
export interface CreateAccountData {
  code: string
  name: string
  nameAr?: string
  type: AccountTypeEnum
  subType?: AccountSubType
  parentAccountId?: string
  description?: string
  descriptionAr?: string
}

/**
 * Account Balance Response (for getAccountBalance endpoint)
 */
export interface AccountBalance {
  debit: number
  credit: number
  balance: number
}

/**
 * Account Filters
 * Matches contract: contract2/types/accounting.ts - GetAccountsQuery
 */
export interface AccountFilters {
  type?: AccountTypeEnum
  isActive?: boolean
  includeHierarchy?: boolean
}

/**
 * Balance Filters
 * Matches contract: contract2/types/accounting.ts - GetAccountBalanceQuery
 */
export interface BalanceFilters {
  asOfDate?: string
  caseId?: string
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
   * Matches contract: contract2/types/accounting.ts - GetAccountTypesResponse
   */
  getAccountTypes: async (): Promise<{ types: AccountTypeOption[]; subTypes: AccountSubTypeOption[] }> => {
    try {
      const response = await apiClient.get('/accounts/types')
      return {
        types: response.data.data?.types || response.data.types || [],
        subTypes: response.data.data?.subTypes || response.data.subTypes || [],
      }
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

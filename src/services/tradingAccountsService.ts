/**
 * Trading Accounts Service
 * Handles all trading account-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Trading Account Interface
 */
export interface TradingAccount {
  _id: string
  accountNumber: string
  accountName: string
  brokerId: string
  brokerName?: string
  accountType: 'demo' | 'live' | 'cent'
  platform?: string
  currency: string
  initialBalance: number
  currentBalance: number
  equity?: number
  margin?: number
  freeMargin?: number
  marginLevel?: number
  leverage?: number
  serverAddress?: string
  loginId?: string
  password?: string
  investorPassword?: string
  isDefault?: boolean
  status: 'active' | 'inactive' | 'suspended'
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Create Trading Account Data
 */
export interface CreateTradingAccountData {
  accountNumber: string
  accountName: string
  brokerId: string
  accountType: 'demo' | 'live' | 'cent'
  platform?: string
  currency: string
  initialBalance: number
  leverage?: number
  serverAddress?: string
  loginId?: string
  password?: string
  investorPassword?: string
  notes?: string
  status?: 'active' | 'inactive' | 'suspended'
}

/**
 * Trading Account Filters
 */
export interface TradingAccountFilters {
  status?: string
  accountType?: string
  brokerId?: string
  currency?: string
  search?: string
  page?: number
  limit?: number
}

/**
 * Account Balance Response
 */
export interface AccountBalance {
  accountId: string
  currentBalance: number
  equity: number
  margin: number
  freeMargin: number
  marginLevel: number
  openPositions: number
  totalProfit: number
  totalDeposits: number
  totalWithdrawals: number
  updatedAt: string
}

/**
 * Transaction Data
 */
export interface TransactionData {
  type: 'deposit' | 'withdrawal'
  amount: number
  date: string
  description?: string
  referenceNumber?: string
}

/**
 * Trading Accounts Service Object
 */
const tradingAccountsService = {
  /**
   * Get all trading accounts
   * GET /api/trading-accounts
   */
  getTradingAccounts: async (filters?: TradingAccountFilters): Promise<{ data: TradingAccount[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/trading-accounts', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single trading account
   * GET /api/trading-accounts/:id
   */
  getTradingAccount: async (id: string): Promise<TradingAccount> => {
    try {
      const response = await apiClient.get(`/trading-accounts/${id}`)
      return response.data.data || response.data.account
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create trading account
   * POST /api/trading-accounts
   */
  createTradingAccount: async (data: CreateTradingAccountData): Promise<TradingAccount> => {
    try {
      const response = await apiClient.post('/trading-accounts', data)
      return response.data.account || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update trading account
   * PATCH /api/trading-accounts/:id
   */
  updateTradingAccount: async (id: string, data: Partial<CreateTradingAccountData>): Promise<TradingAccount> => {
    try {
      const response = await apiClient.patch(`/trading-accounts/${id}`, data)
      return response.data.account || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete trading account
   * DELETE /api/trading-accounts/:id
   */
  deleteTradingAccount: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/trading-accounts/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get account balance
   * GET /api/trading-accounts/:id/balance
   */
  getAccountBalance: async (id: string): Promise<AccountBalance> => {
    try {
      const response = await apiClient.get(`/trading-accounts/${id}/balance`)
      return response.data.data || response.data.balance
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Set trading account as default
   * POST /api/trading-accounts/:id/set-default
   */
  setDefaultAccount: async (id: string): Promise<TradingAccount> => {
    try {
      const response = await apiClient.post(`/trading-accounts/${id}/set-default`)
      return response.data.account || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add deposit or withdrawal transaction
   * POST /api/trading-accounts/:id/transaction
   */
  addTransaction: async (id: string, data: TransactionData): Promise<TradingAccount> => {
    try {
      const response = await apiClient.post(`/trading-accounts/${id}/transaction`, data)
      return response.data.account || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default tradingAccountsService

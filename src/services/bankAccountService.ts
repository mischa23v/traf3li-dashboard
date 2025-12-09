/**
 * Bank Account Service
 * Handles all bank account-related API calls
 */

import { api } from '@/lib/api'

export interface BankAccount {
  _id: string
  accountName: string
  accountNumber: string
  bankName: string
  accountType: 'checking' | 'savings' | 'credit_card' | 'line_of_credit' | 'money_market'
  currency: string
  currentBalance: number
  availableBalance?: number
  isDefault: boolean
  isActive: boolean
  lastSynced?: string
  plaidAccessToken?: string
  plaidItemId?: string
  plaidAccountId?: string
  createdAt: string
  updatedAt: string
}

export interface BankAccountSummary {
  totalAccounts: number
  totalBalance: number
  activeAccounts: number
  defaultAccount?: BankAccount
  balanceByType: Record<string, number>
}

export interface BalanceHistory {
  date: string
  balance: number
}

export const bankAccountService = {
  // Collection routes
  createBankAccount: async (data: Partial<BankAccount>): Promise<BankAccount> => {
    const response = await api.post('/bank-accounts', data)
    return response.data
  },

  getBankAccounts: async (): Promise<BankAccount[]> => {
    const response = await api.get('/bank-accounts')
    return response.data
  },

  // Summary route
  getSummary: async (): Promise<BankAccountSummary> => {
    const response = await api.get('/bank-accounts/summary')
    return response.data
  },

  // Single account routes
  getBankAccount: async (id: string): Promise<BankAccount> => {
    const response = await api.get(`/bank-accounts/${id}`)
    return response.data
  },

  updateBankAccount: async (id: string, data: Partial<BankAccount>): Promise<BankAccount> => {
    const response = await api.put(`/bank-accounts/${id}`, data)
    return response.data
  },

  deleteBankAccount: async (id: string): Promise<void> => {
    await api.delete(`/bank-accounts/${id}`)
  },

  // Account actions
  setDefault: async (id: string): Promise<BankAccount> => {
    const response = await api.post(`/bank-accounts/${id}/set-default`)
    return response.data
  },

  getBalanceHistory: async (id: string, params?: {
    startDate?: string
    endDate?: string
  }): Promise<BalanceHistory[]> => {
    const response = await api.get(`/bank-accounts/${id}/balance-history`, { params })
    return response.data
  },

  syncAccount: async (id: string): Promise<BankAccount> => {
    const response = await api.post(`/bank-accounts/${id}/sync`)
    return response.data
  },

  disconnectAccount: async (id: string): Promise<BankAccount> => {
    const response = await api.post(`/bank-accounts/${id}/disconnect`)
    return response.data
  },
}

export default bankAccountService

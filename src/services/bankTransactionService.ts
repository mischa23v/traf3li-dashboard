/**
 * Bank Transaction Service
 * Handles all bank transaction-related API calls
 */

import { api } from '@/lib/api'

export interface BankTransaction {
  _id: string
  accountId: string
  transactionDate: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  category?: string
  vendor?: string
  reference?: string
  isCleared: boolean
  isReconciled: boolean
  matchedTransactionId?: string
  importedFrom?: 'csv' | 'ofx' | 'qif' | 'plaid' | 'manual'
  createdAt: string
  updatedAt: string
}

export const bankTransactionService = {
  // Collection routes
  createTransaction: async (data: Partial<BankTransaction>): Promise<BankTransaction> => {
    const response = await api.post('/bank-transactions', data)
    return response.data
  },

  getTransactions: async (params?: {
    accountId?: string
    startDate?: string
    endDate?: string
    isCleared?: boolean
    isReconciled?: boolean
    page?: number
    limit?: number
  }): Promise<{ transactions: BankTransaction[]; total: number }> => {
    const response = await api.get('/bank-transactions', { params })
    return response.data
  },

  // Single transaction routes
  getTransaction: async (id: string): Promise<BankTransaction> => {
    const response = await api.get(`/bank-transactions/${id}`)
    return response.data
  },

  // Transaction matching
  matchTransaction: async (transactionId: string, data: {
    matchedTransactionId: string
  }): Promise<BankTransaction> => {
    const response = await api.post(`/bank-transactions/${transactionId}/match`, data)
    return response.data
  },

  unmatchTransaction: async (transactionId: string): Promise<BankTransaction> => {
    const response = await api.post(`/bank-transactions/${transactionId}/unmatch`)
    return response.data
  },

  // Import route
  importTransactions: async (accountId: string, file: File): Promise<{
    imported: number
    duplicates: number
    errors: string[]
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/bank-transactions/import/${accountId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
}

export default bankTransactionService

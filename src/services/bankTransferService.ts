/**
 * Bank Transfer Service
 * Handles all bank transfer-related API calls
 */

import { api } from '@/lib/api'

export interface BankTransfer {
  _id: string
  fromAccountId: string
  toAccountId: string
  amount: number
  currency: string
  transferDate: string
  description?: string
  reference?: string
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  fromTransactionId?: string
  toTransactionId?: string
  createdAt: string
  updatedAt: string
}

export const bankTransferService = {
  // Collection routes
  createTransfer: async (data: {
    fromAccountId: string
    toAccountId: string
    amount: number
    currency?: string
    transferDate: string
    description?: string
    reference?: string
  }): Promise<BankTransfer> => {
    const response = await api.post('/bank-transfers', data)
    return response.data
  },

  getTransfers: async (params?: {
    accountId?: string
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{ transfers: BankTransfer[]; total: number }> => {
    const response = await api.get('/bank-transfers', { params })
    return response.data
  },

  // Single transfer routes
  getTransfer: async (id: string): Promise<BankTransfer> => {
    const response = await api.get(`/bank-transfers/${id}`)
    return response.data
  },

  // Transfer actions
  cancelTransfer: async (id: string): Promise<BankTransfer> => {
    const response = await api.post(`/bank-transfers/${id}/cancel`)
    return response.data
  },
}

export default bankTransferService

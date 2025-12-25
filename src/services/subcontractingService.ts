/**
 * Subcontracting Service
 * API client for Subcontracting operations
 */

import api from '@/lib/api'
import type {
  SubcontractingOrder,
  SubcontractingReceipt,
  SubcontractingBom,
  SubcontractingSettings,
  SubcontractingFilters,
  SubcontractingStats,
  CreateSubcontractingOrderData,
} from '@/types/subcontracting'

// Subcontracting Orders
export const getOrders = async (filters?: SubcontractingFilters) => {
  const response = await api.get<{ orders: SubcontractingOrder[]; total: number; page: number; limit: number }>('/subcontracting/orders', { params: filters })
  return response.data
}

export const getOrderById = async (id: string) => {
  const response = await api.get<SubcontractingOrder>(`/subcontracting/orders/${id}`)
  return response.data
}

export const createOrder = async (data: CreateSubcontractingOrderData) => {
  const response = await api.post<SubcontractingOrder>('/subcontracting/orders', data)
  return response.data
}

export const updateOrder = async (id: string, data: Partial<CreateSubcontractingOrderData>) => {
  const response = await api.put<SubcontractingOrder>(`/subcontracting/orders/${id}`, data)
  return response.data
}

export const deleteOrder = async (id: string) => {
  const response = await api.delete(`/subcontracting/orders/${id}`)
  return response.data
}

export const submitOrder = async (id: string) => {
  const response = await api.patch<SubcontractingOrder>(`/subcontracting/orders/${id}/submit`)
  return response.data
}

export const cancelOrder = async (id: string) => {
  const response = await api.patch<SubcontractingOrder>(`/subcontracting/orders/${id}/cancel`)
  return response.data
}

// Subcontracting Receipts
export const getReceipts = async (filters?: { orderId?: string; status?: string }) => {
  const response = await api.get<SubcontractingReceipt[]>('/subcontracting/receipts', { params: filters })
  return response.data
}

export const getReceiptById = async (id: string) => {
  const response = await api.get<SubcontractingReceipt>(`/subcontracting/receipts/${id}`)
  return response.data
}

export const createReceipt = async (data: Omit<SubcontractingReceipt, '_id' | 'receiptId' | 'receiptNumber' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<SubcontractingReceipt>('/subcontracting/receipts', data)
  return response.data
}

export const updateReceipt = async (id: string, data: Partial<SubcontractingReceipt>) => {
  const response = await api.put<SubcontractingReceipt>(`/subcontracting/receipts/${id}`, data)
  return response.data
}

export const submitReceipt = async (id: string) => {
  const response = await api.patch<SubcontractingReceipt>(`/subcontracting/receipts/${id}/submit`)
  return response.data
}

// Subcontracting BOMs
export const getBoms = async (filters?: { serviceItemId?: string; isActive?: boolean }) => {
  const response = await api.get<SubcontractingBom[]>('/subcontracting/boms', { params: filters })
  return response.data
}

export const getBomById = async (id: string) => {
  const response = await api.get<SubcontractingBom>(`/subcontracting/boms/${id}`)
  return response.data
}

export const createBom = async (data: Omit<SubcontractingBom, '_id' | 'bomId' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<SubcontractingBom>('/subcontracting/boms', data)
  return response.data
}

export const updateBom = async (id: string, data: Partial<SubcontractingBom>) => {
  const response = await api.put<SubcontractingBom>(`/subcontracting/boms/${id}`, data)
  return response.data
}

export const deleteBom = async (id: string) => {
  const response = await api.delete(`/subcontracting/boms/${id}`)
  return response.data
}

// Stats
export const getSubcontractingStats = async () => {
  const response = await api.get<SubcontractingStats>('/subcontracting/stats')
  return response.data
}

// Settings
export const getSubcontractingSettings = async () => {
  const response = await api.get<SubcontractingSettings>('/subcontracting/settings')
  return response.data
}

export const updateSubcontractingSettings = async (data: Partial<SubcontractingSettings>) => {
  const response = await api.put<SubcontractingSettings>('/subcontracting/settings', data)
  return response.data
}

export const subcontractingService = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  submitOrder,
  cancelOrder,
  getReceipts,
  getReceiptById,
  createReceipt,
  updateReceipt,
  submitReceipt,
  getBoms,
  getBomById,
  createBom,
  updateBom,
  deleteBom,
  getSubcontractingStats,
  getSubcontractingSettings,
  updateSubcontractingSettings,
}

export default subcontractingService

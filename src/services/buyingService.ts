/**
 * Buying Service
 * Frontend API client for Buying/Procurement management
 * Calls backend API endpoints at /api/buying/*
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  Supplier,
  CreateSupplierData,
  SupplierFilters,
  SupplierGroup,
  PurchaseOrder,
  CreatePurchaseOrderData,
  PurchaseOrderFilters,
  PurchaseReceipt,
  CreatePurchaseReceiptData,
  PurchaseInvoice,
  CreatePurchaseInvoiceData,
  MaterialRequest,
  CreateMaterialRequestData,
  RequestForQuotation,
  SupplierQuotation,
  BuyingSettings,
  BuyingStats,
} from '@/types/buying'

const bilingualError = (enMsg: string, arMsg: string): string => `${enMsg} | ${arMsg}`

const buyingService = {
  // ==================== SUPPLIERS ====================

  getSuppliers: async (filters?: SupplierFilters): Promise<{ suppliers: Supplier[]; total: number; pagination: any }> => {
    try {
      const response = await apiClient.get('/buying/suppliers', { params: filters })
      return {
        suppliers: response.data.suppliers || response.data.data || [],
        total: response.data.total || 0,
        pagination: response.data.pagination || {},
      }
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch suppliers: ${handleApiError(error)}`, `فشل في جلب الموردين`))
    }
  },

  getSupplier: async (id: string): Promise<Supplier> => {
    try {
      const response = await apiClient.get(`/buying/suppliers/${id}`)
      return response.data.supplier || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch supplier: ${handleApiError(error)}`, `فشل في جلب المورد`))
    }
  },

  createSupplier: async (data: CreateSupplierData): Promise<Supplier> => {
    try {
      const response = await apiClient.post('/buying/suppliers', data)
      return response.data.supplier || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to create supplier: ${handleApiError(error)}`, `فشل في إنشاء المورد`))
    }
  },

  updateSupplier: async (id: string, data: Partial<CreateSupplierData>): Promise<Supplier> => {
    try {
      const response = await apiClient.put(`/buying/suppliers/${id}`, data)
      return response.data.supplier || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to update supplier: ${handleApiError(error)}`, `فشل في تحديث المورد`))
    }
  },

  deleteSupplier: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/buying/suppliers/${id}`)
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to delete supplier: ${handleApiError(error)}`, `فشل في حذف المورد`))
    }
  },

  getSupplierGroups: async (): Promise<SupplierGroup[]> => {
    try {
      const response = await apiClient.get('/buying/supplier-groups')
      return response.data.groups || response.data.data || []
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch supplier groups: ${handleApiError(error)}`, `فشل في جلب مجموعات الموردين`))
    }
  },

  // ==================== PURCHASE ORDERS ====================

  getPurchaseOrders: async (filters?: PurchaseOrderFilters): Promise<{ orders: PurchaseOrder[]; total: number; pagination: any }> => {
    try {
      const response = await apiClient.get('/buying/purchase-orders', { params: filters })
      return {
        orders: response.data.orders || response.data.data || [],
        total: response.data.total || 0,
        pagination: response.data.pagination || {},
      }
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch purchase orders: ${handleApiError(error)}`, `فشل في جلب أوامر الشراء`))
    }
  },

  getPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    try {
      const response = await apiClient.get(`/buying/purchase-orders/${id}`)
      return response.data.order || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch purchase order: ${handleApiError(error)}`, `فشل في جلب أمر الشراء`))
    }
  },

  createPurchaseOrder: async (data: CreatePurchaseOrderData): Promise<PurchaseOrder> => {
    try {
      const response = await apiClient.post('/buying/purchase-orders', data)
      return response.data.order || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to create purchase order: ${handleApiError(error)}`, `فشل في إنشاء أمر الشراء`))
    }
  },

  submitPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    try {
      const response = await apiClient.post(`/buying/purchase-orders/${id}/submit`)
      return response.data.order || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to submit purchase order: ${handleApiError(error)}`, `فشل في ترحيل أمر الشراء`))
    }
  },

  approvePurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    try {
      const response = await apiClient.post(`/buying/purchase-orders/${id}/approve`)
      return response.data.order || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to approve purchase order: ${handleApiError(error)}`, `فشل في اعتماد أمر الشراء`))
    }
  },

  cancelPurchaseOrder: async (id: string): Promise<PurchaseOrder> => {
    try {
      const response = await apiClient.post(`/buying/purchase-orders/${id}/cancel`)
      return response.data.order || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to cancel purchase order: ${handleApiError(error)}`, `فشل في إلغاء أمر الشراء`))
    }
  },

  deletePurchaseOrder: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/buying/purchase-orders/${id}`)
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to delete purchase order: ${handleApiError(error)}`, `فشل في حذف أمر الشراء`))
    }
  },

  // ==================== PURCHASE RECEIPTS ====================

  getPurchaseReceipts: async (filters?: any): Promise<{ receipts: PurchaseReceipt[]; total: number }> => {
    try {
      const response = await apiClient.get('/buying/purchase-receipts', { params: filters })
      return {
        receipts: response.data.receipts || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch purchase receipts: ${handleApiError(error)}`, `فشل في جلب إيصالات الاستلام`))
    }
  },

  getPurchaseReceipt: async (id: string): Promise<PurchaseReceipt> => {
    try {
      const response = await apiClient.get(`/buying/purchase-receipts/${id}`)
      return response.data.receipt || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch purchase receipt: ${handleApiError(error)}`, `فشل في جلب إيصال الاستلام`))
    }
  },

  createPurchaseReceipt: async (data: CreatePurchaseReceiptData): Promise<PurchaseReceipt> => {
    try {
      const response = await apiClient.post('/buying/purchase-receipts', data)
      return response.data.receipt || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to create purchase receipt: ${handleApiError(error)}`, `فشل في إنشاء إيصال الاستلام`))
    }
  },

  submitPurchaseReceipt: async (id: string): Promise<PurchaseReceipt> => {
    try {
      const response = await apiClient.post(`/buying/purchase-receipts/${id}/submit`)
      return response.data.receipt || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to submit purchase receipt: ${handleApiError(error)}`, `فشل في ترحيل إيصال الاستلام`))
    }
  },

  // ==================== PURCHASE INVOICES ====================

  getPurchaseInvoices: async (filters?: any): Promise<{ invoices: PurchaseInvoice[]; total: number }> => {
    try {
      const response = await apiClient.get('/buying/purchase-invoices', { params: filters })
      return {
        invoices: response.data.invoices || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch purchase invoices: ${handleApiError(error)}`, `فشل في جلب فواتير الشراء`))
    }
  },

  getPurchaseInvoice: async (id: string): Promise<PurchaseInvoice> => {
    try {
      const response = await apiClient.get(`/buying/purchase-invoices/${id}`)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch purchase invoice: ${handleApiError(error)}`, `فشل في جلب فاتورة الشراء`))
    }
  },

  createPurchaseInvoice: async (data: CreatePurchaseInvoiceData): Promise<PurchaseInvoice> => {
    try {
      const response = await apiClient.post('/buying/purchase-invoices', data)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to create purchase invoice: ${handleApiError(error)}`, `فشل في إنشاء فاتورة الشراء`))
    }
  },

  submitPurchaseInvoice: async (id: string): Promise<PurchaseInvoice> => {
    try {
      const response = await apiClient.post(`/buying/purchase-invoices/${id}/submit`)
      return response.data.invoice || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to submit purchase invoice: ${handleApiError(error)}`, `فشل في ترحيل فاتورة الشراء`))
    }
  },

  // ==================== MATERIAL REQUESTS ====================

  getMaterialRequests: async (filters?: any): Promise<{ requests: MaterialRequest[]; total: number }> => {
    try {
      const response = await apiClient.get('/buying/material-requests', { params: filters })
      return {
        requests: response.data.requests || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch material requests: ${handleApiError(error)}`, `فشل في جلب طلبات المواد`))
    }
  },

  getMaterialRequest: async (id: string): Promise<MaterialRequest> => {
    try {
      const response = await apiClient.get(`/buying/material-requests/${id}`)
      return response.data.request || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch material request: ${handleApiError(error)}`, `فشل في جلب طلب المواد`))
    }
  },

  createMaterialRequest: async (data: CreateMaterialRequestData): Promise<MaterialRequest> => {
    try {
      const response = await apiClient.post('/buying/material-requests', data)
      return response.data.request || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to create material request: ${handleApiError(error)}`, `فشل في إنشاء طلب المواد`))
    }
  },

  // ==================== STATS & SETTINGS ====================

  getStats: async (): Promise<BuyingStats> => {
    try {
      const response = await apiClient.get('/buying/stats')
      return response.data.stats || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch buying stats: ${handleApiError(error)}`, `فشل في جلب إحصائيات المشتريات`))
    }
  },

  getSettings: async (): Promise<BuyingSettings> => {
    try {
      const response = await apiClient.get('/buying/settings')
      return response.data.settings || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to fetch buying settings: ${handleApiError(error)}`, `فشل في جلب إعدادات المشتريات`))
    }
  },

  updateSettings: async (data: Partial<BuyingSettings>): Promise<BuyingSettings> => {
    try {
      const response = await apiClient.put('/buying/settings', data)
      return response.data.settings || response.data.data
    } catch (error: any) {
      throw new Error(bilingualError(`Failed to update buying settings: ${handleApiError(error)}`, `فشل في تحديث إعدادات المشتريات`))
    }
  },
}

export default buyingService

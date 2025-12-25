/**
 * Inventory Service
 * Frontend API client for Inventory/Stock management
 * Calls backend API endpoints at /api/inventory/*
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  Item,
  CreateItemData,
  ItemFilters,
  Warehouse,
  CreateWarehouseData,
  StockEntry,
  CreateStockEntryData,
  StockEntryFilters,
  StockLedgerEntry,
  Batch,
  SerialNumber,
  StockReconciliation,
  ItemGroup,
  UnitOfMeasure,
  PriceList,
  ItemPrice,
  Bin,
  InventoryStats,
  InventorySettings,
} from '@/types/inventory'

/**
 * Create bilingual error message
 */
const bilingualError = (enMsg: string, arMsg: string): string => {
  return `${enMsg} | ${arMsg}`
}

const inventoryService = {
  // ==================== ITEMS ====================

  /**
   * Get all items with filters and pagination
   */
  getItems: async (filters?: ItemFilters): Promise<{ items: Item[]; total: number; pagination: any }> => {
    try {
      const response = await apiClient.get('/inventory/items', { params: filters })
      return {
        items: response.data.items || response.data.data || [],
        total: response.data.total || 0,
        pagination: response.data.pagination || {},
      }
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch items: ${errorMsg}`, `فشل في جلب الأصناف: ${errorMsg}`))
    }
  },

  /**
   * Get single item by ID
   */
  getItem: async (id: string): Promise<Item> => {
    try {
      const response = await apiClient.get(`/inventory/items/${id}`)
      return response.data.item || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch item: ${errorMsg}`, `فشل في جلب الصنف: ${errorMsg}`))
    }
  },

  /**
   * Create new item
   */
  createItem: async (data: CreateItemData): Promise<Item> => {
    try {
      const response = await apiClient.post('/inventory/items', data)
      return response.data.item || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to create item: ${errorMsg}`, `فشل في إنشاء الصنف: ${errorMsg}`))
    }
  },

  /**
   * Update item
   */
  updateItem: async (id: string, data: Partial<CreateItemData>): Promise<Item> => {
    try {
      const response = await apiClient.put(`/inventory/items/${id}`, data)
      return response.data.item || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to update item: ${errorMsg}`, `فشل في تحديث الصنف: ${errorMsg}`))
    }
  },

  /**
   * Delete item
   */
  deleteItem: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/inventory/items/${id}`)
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to delete item: ${errorMsg}`, `فشل في حذف الصنف: ${errorMsg}`))
    }
  },

  /**
   * Get item stock balance across all warehouses
   */
  getItemStock: async (itemId: string): Promise<Bin[]> => {
    try {
      const response = await apiClient.get(`/inventory/items/${itemId}/stock`)
      return response.data.bins || response.data.data || []
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch item stock: ${errorMsg}`, `فشل في جلب مخزون الصنف: ${errorMsg}`))
    }
  },

  // ==================== WAREHOUSES ====================

  /**
   * Get all warehouses
   */
  getWarehouses: async (): Promise<Warehouse[]> => {
    try {
      const response = await apiClient.get('/inventory/warehouses')
      return response.data.warehouses || response.data.data || []
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch warehouses: ${errorMsg}`, `فشل في جلب المستودعات: ${errorMsg}`))
    }
  },

  /**
   * Get single warehouse by ID
   */
  getWarehouse: async (id: string): Promise<Warehouse> => {
    try {
      const response = await apiClient.get(`/inventory/warehouses/${id}`)
      return response.data.warehouse || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch warehouse: ${errorMsg}`, `فشل في جلب المستودع: ${errorMsg}`))
    }
  },

  /**
   * Create new warehouse
   */
  createWarehouse: async (data: CreateWarehouseData): Promise<Warehouse> => {
    try {
      const response = await apiClient.post('/inventory/warehouses', data)
      return response.data.warehouse || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to create warehouse: ${errorMsg}`, `فشل في إنشاء المستودع: ${errorMsg}`))
    }
  },

  /**
   * Update warehouse
   */
  updateWarehouse: async (id: string, data: Partial<CreateWarehouseData>): Promise<Warehouse> => {
    try {
      const response = await apiClient.put(`/inventory/warehouses/${id}`, data)
      return response.data.warehouse || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to update warehouse: ${errorMsg}`, `فشل في تحديث المستودع: ${errorMsg}`))
    }
  },

  /**
   * Delete warehouse
   */
  deleteWarehouse: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/inventory/warehouses/${id}`)
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to delete warehouse: ${errorMsg}`, `فشل في حذف المستودع: ${errorMsg}`))
    }
  },

  /**
   * Get warehouse stock summary
   */
  getWarehouseStock: async (warehouseId: string): Promise<Bin[]> => {
    try {
      const response = await apiClient.get(`/inventory/warehouses/${warehouseId}/stock`)
      return response.data.bins || response.data.data || []
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch warehouse stock: ${errorMsg}`, `فشل في جلب مخزون المستودع: ${errorMsg}`))
    }
  },

  // ==================== STOCK ENTRIES ====================

  /**
   * Get all stock entries with filters
   */
  getStockEntries: async (filters?: StockEntryFilters): Promise<{ entries: StockEntry[]; total: number; pagination: any }> => {
    try {
      const response = await apiClient.get('/inventory/stock-entries', { params: filters })
      return {
        entries: response.data.entries || response.data.data || [],
        total: response.data.total || 0,
        pagination: response.data.pagination || {},
      }
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch stock entries: ${errorMsg}`, `فشل في جلب حركات المخزون: ${errorMsg}`))
    }
  },

  /**
   * Get single stock entry by ID
   */
  getStockEntry: async (id: string): Promise<StockEntry> => {
    try {
      const response = await apiClient.get(`/inventory/stock-entries/${id}`)
      return response.data.entry || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch stock entry: ${errorMsg}`, `فشل في جلب حركة المخزون: ${errorMsg}`))
    }
  },

  /**
   * Create new stock entry
   */
  createStockEntry: async (data: CreateStockEntryData): Promise<StockEntry> => {
    try {
      const response = await apiClient.post('/inventory/stock-entries', data)
      return response.data.entry || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to create stock entry: ${errorMsg}`, `فشل في إنشاء حركة المخزون: ${errorMsg}`))
    }
  },

  /**
   * Submit stock entry (changes status from draft to submitted)
   */
  submitStockEntry: async (id: string): Promise<StockEntry> => {
    try {
      const response = await apiClient.post(`/inventory/stock-entries/${id}/submit`)
      return response.data.entry || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to submit stock entry: ${errorMsg}`, `فشل في ترحيل حركة المخزون: ${errorMsg}`))
    }
  },

  /**
   * Cancel stock entry
   */
  cancelStockEntry: async (id: string): Promise<StockEntry> => {
    try {
      const response = await apiClient.post(`/inventory/stock-entries/${id}/cancel`)
      return response.data.entry || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to cancel stock entry: ${errorMsg}`, `فشل في إلغاء حركة المخزون: ${errorMsg}`))
    }
  },

  /**
   * Delete stock entry (only draft entries)
   */
  deleteStockEntry: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/inventory/stock-entries/${id}`)
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to delete stock entry: ${errorMsg}`, `فشل في حذف حركة المخزون: ${errorMsg}`))
    }
  },

  // ==================== STOCK LEDGER ====================

  /**
   * Get stock ledger entries
   */
  getStockLedger: async (filters?: {
    itemId?: string
    warehouseId?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }): Promise<{ entries: StockLedgerEntry[]; total: number }> => {
    try {
      const response = await apiClient.get('/inventory/stock-ledger', { params: filters })
      return {
        entries: response.data.entries || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch stock ledger: ${errorMsg}`, `فشل في جلب سجل المخزون: ${errorMsg}`))
    }
  },

  // ==================== BATCHES ====================

  /**
   * Get all batches for an item
   */
  getBatches: async (itemId?: string): Promise<Batch[]> => {
    try {
      const response = await apiClient.get('/inventory/batches', { params: { itemId } })
      return response.data.batches || response.data.data || []
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch batches: ${errorMsg}`, `فشل في جلب الدفعات: ${errorMsg}`))
    }
  },

  /**
   * Create new batch
   */
  createBatch: async (data: {
    batchNo: string
    itemId: string
    manufacturingDate?: string
    expiryDate?: string
    supplierId?: string
    description?: string
  }): Promise<Batch> => {
    try {
      const response = await apiClient.post('/inventory/batches', data)
      return response.data.batch || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to create batch: ${errorMsg}`, `فشل في إنشاء الدفعة: ${errorMsg}`))
    }
  },

  // ==================== SERIAL NUMBERS ====================

  /**
   * Get all serial numbers for an item
   */
  getSerialNumbers: async (itemId?: string): Promise<SerialNumber[]> => {
    try {
      const response = await apiClient.get('/inventory/serial-numbers', { params: { itemId } })
      return response.data.serialNumbers || response.data.data || []
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch serial numbers: ${errorMsg}`, `فشل في جلب الأرقام التسلسلية: ${errorMsg}`))
    }
  },

  /**
   * Create new serial number
   */
  createSerialNumber: async (data: {
    serialNo: string
    itemId: string
    warehouseId?: string
    batchNo?: string
    warrantyExpiryDate?: string
    description?: string
  }): Promise<SerialNumber> => {
    try {
      const response = await apiClient.post('/inventory/serial-numbers', data)
      return response.data.serialNumber || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to create serial number: ${errorMsg}`, `فشل في إنشاء الرقم التسلسلي: ${errorMsg}`))
    }
  },

  // ==================== STOCK RECONCILIATION ====================

  /**
   * Get all stock reconciliations
   */
  getReconciliations: async (): Promise<StockReconciliation[]> => {
    try {
      const response = await apiClient.get('/inventory/reconciliations')
      return response.data.reconciliations || response.data.data || []
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch reconciliations: ${errorMsg}`, `فشل في جلب تسويات المخزون: ${errorMsg}`))
    }
  },

  /**
   * Create stock reconciliation
   */
  createReconciliation: async (data: {
    postingDate: string
    purpose: 'opening_stock' | 'stock_reconciliation'
    items: any[]
    remarks?: string
  }): Promise<StockReconciliation> => {
    try {
      const response = await apiClient.post('/inventory/reconciliations', data)
      return response.data.reconciliation || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to create reconciliation: ${errorMsg}`, `فشل في إنشاء تسوية المخزون: ${errorMsg}`))
    }
  },

  /**
   * Submit stock reconciliation
   */
  submitReconciliation: async (id: string): Promise<StockReconciliation> => {
    try {
      const response = await apiClient.post(`/inventory/reconciliations/${id}/submit`)
      return response.data.reconciliation || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to submit reconciliation: ${errorMsg}`, `فشل في ترحيل تسوية المخزون: ${errorMsg}`))
    }
  },

  // ==================== ITEM GROUPS ====================

  /**
   * Get all item groups
   */
  getItemGroups: async (): Promise<ItemGroup[]> => {
    try {
      const response = await apiClient.get('/inventory/item-groups')
      return response.data.groups || response.data.data || []
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch item groups: ${errorMsg}`, `فشل في جلب مجموعات الأصناف: ${errorMsg}`))
    }
  },

  /**
   * Create item group
   */
  createItemGroup: async (data: {
    name: string
    nameAr?: string
    parentGroup?: string
    isGroup?: boolean
    description?: string
  }): Promise<ItemGroup> => {
    try {
      const response = await apiClient.post('/inventory/item-groups', data)
      return response.data.group || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to create item group: ${errorMsg}`, `فشل في إنشاء مجموعة الأصناف: ${errorMsg}`))
    }
  },

  // ==================== UNITS OF MEASURE ====================

  /**
   * Get all units of measure
   */
  getUnitsOfMeasure: async (): Promise<UnitOfMeasure[]> => {
    try {
      const response = await apiClient.get('/inventory/uom')
      return response.data.uoms || response.data.data || []
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch UOMs: ${errorMsg}`, `فشل في جلب وحدات القياس: ${errorMsg}`))
    }
  },

  /**
   * Create unit of measure
   */
  createUnitOfMeasure: async (data: {
    name: string
    nameAr?: string
    mustBeWholeNumber?: boolean
  }): Promise<UnitOfMeasure> => {
    try {
      const response = await apiClient.post('/inventory/uom', data)
      return response.data.uom || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to create UOM: ${errorMsg}`, `فشل في إنشاء وحدة القياس: ${errorMsg}`))
    }
  },

  // ==================== PRICE LISTS ====================

  /**
   * Get all price lists
   */
  getPriceLists: async (): Promise<PriceList[]> => {
    try {
      const response = await apiClient.get('/inventory/price-lists')
      return response.data.priceLists || response.data.data || []
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch price lists: ${errorMsg}`, `فشل في جلب قوائم الأسعار: ${errorMsg}`))
    }
  },

  /**
   * Get item prices
   */
  getItemPrices: async (filters?: {
    itemId?: string
    priceListId?: string
  }): Promise<ItemPrice[]> => {
    try {
      const response = await apiClient.get('/inventory/item-prices', { params: filters })
      return response.data.prices || response.data.data || []
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch item prices: ${errorMsg}`, `فشل في جلب أسعار الأصناف: ${errorMsg}`))
    }
  },

  // ==================== STATS & REPORTS ====================

  /**
   * Get inventory statistics
   */
  getStats: async (): Promise<InventoryStats> => {
    try {
      const response = await apiClient.get('/inventory/stats')
      return response.data.stats || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch inventory stats: ${errorMsg}`, `فشل في جلب إحصائيات المخزون: ${errorMsg}`))
    }
  },

  /**
   * Get stock balance report
   */
  getStockBalance: async (filters?: {
    itemId?: string
    warehouseId?: string
    itemGroup?: string
  }): Promise<Bin[]> => {
    try {
      const response = await apiClient.get('/inventory/reports/stock-balance', { params: filters })
      return response.data.bins || response.data.data || []
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch stock balance: ${errorMsg}`, `فشل في جلب رصيد المخزون: ${errorMsg}`))
    }
  },

  /**
   * Get low stock items
   */
  getLowStockItems: async (): Promise<Item[]> => {
    try {
      const response = await apiClient.get('/inventory/reports/low-stock')
      return response.data.items || response.data.data || []
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch low stock items: ${errorMsg}`, `فشل في جلب الأصناف منخفضة المخزون: ${errorMsg}`))
    }
  },

  /**
   * Get stock movement report
   */
  getStockMovement: async (filters?: {
    itemId?: string
    warehouseId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<any> => {
    try {
      const response = await apiClient.get('/inventory/reports/stock-movement', { params: filters })
      return response.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch stock movement: ${errorMsg}`, `فشل في جلب حركة المخزون: ${errorMsg}`))
    }
  },

  // ==================== SETTINGS ====================

  /**
   * Get inventory settings
   */
  getSettings: async (): Promise<InventorySettings> => {
    try {
      const response = await apiClient.get('/inventory/settings')
      return response.data.settings || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to fetch inventory settings: ${errorMsg}`, `فشل في جلب إعدادات المخزون: ${errorMsg}`))
    }
  },

  /**
   * Update inventory settings
   */
  updateSettings: async (data: Partial<InventorySettings>): Promise<InventorySettings> => {
    try {
      const response = await apiClient.put('/inventory/settings', data)
      return response.data.settings || response.data.data
    } catch (error: any) {
      const errorMsg = handleApiError(error)
      throw new Error(bilingualError(`Failed to update inventory settings: ${errorMsg}`, `فشل في تحديث إعدادات المخزون: ${errorMsg}`))
    }
  },
}

export default inventoryService

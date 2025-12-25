/**
 * Inventory/Stock Management Types
 * Types for Item, Warehouse, Stock Entry, and Inventory management
 * Inspired by ERPNext Stock module
 */

import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════════

export type ItemType = 'product' | 'service' | 'consumable' | 'fixed_asset'
export type ItemStatus = 'active' | 'inactive' | 'discontinued'
export type StockEntryType = 'receipt' | 'issue' | 'transfer' | 'manufacture' | 'repack' | 'material_consumption'
export type ValuationMethod = 'fifo' | 'moving_average' | 'lifo'
export type ReconciliationStatus = 'draft' | 'submitted' | 'cancelled'

// ═══════════════════════════════════════════════════════════════
// UNIT OF MEASURE
// ═══════════════════════════════════════════════════════════════

export interface UnitOfMeasure {
  _id: string
  uomId: string
  name: string
  nameAr?: string
  mustBeWholeNumber: boolean
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface UOMConversion {
  _id?: string
  fromUom: string
  toUom: string
  conversionFactor: number
}

// ═══════════════════════════════════════════════════════════════
// ITEM GROUP / CATEGORY
// ═══════════════════════════════════════════════════════════════

export interface ItemGroup {
  _id: string
  groupId: string
  name: string
  nameAr?: string
  parentGroup?: string
  isGroup: boolean
  description?: string
  defaultWarehouse?: string
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// ITEM / PRODUCT
// ═══════════════════════════════════════════════════════════════

export interface Item {
  _id: string
  itemId: string
  itemCode: string
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string

  // Classification
  itemType: ItemType
  itemGroup?: string
  brand?: string
  manufacturer?: string

  // Identification
  sku?: string
  barcode?: string
  hsnCode?: string // Harmonized System Nomenclature

  // Units
  stockUom: string
  purchaseUom?: string
  salesUom?: string
  uomConversions?: UOMConversion[]

  // Pricing
  standardRate: number
  valuationRate?: number
  lastPurchaseRate?: number
  currency: string

  // Tax
  taxRate?: number
  taxTemplateId?: string
  isZeroRated?: boolean
  isExempt?: boolean

  // Stock Settings
  isStockItem: boolean
  hasVariants: boolean
  hasBatchNo: boolean
  hasSerialNo: boolean
  hasExpiryDate: boolean
  shelfLifeInDays?: number
  warrantyPeriod?: number

  // Inventory
  safetyStock?: number
  reorderLevel?: number
  reorderQty?: number
  leadTimeDays?: number

  // Valuation
  valuationMethod: ValuationMethod

  // Status
  status: ItemStatus
  disabled: boolean

  // Images
  image?: string
  images?: string[]

  // Weights & Dimensions
  weightPerUnit?: number
  weightUom?: string

  // Supplier
  defaultSupplier?: string
  supplierItems?: {
    supplierId: string
    supplierPartNo?: string
    supplierName?: string
  }[]

  // Metadata
  tags?: string[]
  customFields?: Record<string, any>
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateItemData {
  itemCode: string
  name: string
  nameAr?: string
  description?: string
  itemType: ItemType
  itemGroup?: string
  sku?: string
  barcode?: string
  stockUom: string
  standardRate: number
  currency?: string
  taxRate?: number
  isStockItem?: boolean
  hasBatchNo?: boolean
  hasSerialNo?: boolean
  valuationMethod?: ValuationMethod
  safetyStock?: number
  reorderLevel?: number
  reorderQty?: number
  status?: ItemStatus
  image?: string
  tags?: string[]
}

// ═══════════════════════════════════════════════════════════════
// WAREHOUSE
// ═══════════════════════════════════════════════════════════════

export interface Warehouse {
  _id: string
  warehouseId: string
  name: string
  nameAr?: string
  warehouseType: 'warehouse' | 'store' | 'transit' | 'virtual'

  // Location
  parentWarehouse?: string
  isGroup: boolean
  company?: string

  // Address
  address?: string
  city?: string
  region?: string
  country?: string
  postalCode?: string
  latitude?: number
  longitude?: number

  // Contact
  contactPerson?: string
  phone?: string
  email?: string

  // Settings
  isDefault: boolean
  disabled: boolean

  // Accounting
  accountId?: string

  createdAt: string
  updatedAt: string
}

export interface CreateWarehouseData {
  name: string
  nameAr?: string
  warehouseType?: 'warehouse' | 'store' | 'transit' | 'virtual'
  parentWarehouse?: string
  isGroup?: boolean
  address?: string
  city?: string
  region?: string
  country?: string
  contactPerson?: string
  phone?: string
  email?: string
  isDefault?: boolean
}

// ═══════════════════════════════════════════════════════════════
// STOCK ENTRY
// ═══════════════════════════════════════════════════════════════

export interface StockEntryItem {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  qty: number
  uom: string
  conversionFactor?: number
  stockQty?: number
  rate: number
  amount: number
  sourceWarehouse?: string
  targetWarehouse?: string
  batchNo?: string
  serialNo?: string
  expiryDate?: string
}

export interface StockEntry {
  _id: string
  stockEntryId: string
  entryType: StockEntryType
  postingDate: string
  postingTime?: string

  // Warehouses
  fromWarehouse?: string
  toWarehouse?: string

  // Items
  items: StockEntryItem[]
  totalQty: number
  totalAmount: number

  // Reference
  referenceType?: string
  referenceId?: string
  purchaseOrderId?: string
  salesOrderId?: string

  // Status
  status: 'draft' | 'submitted' | 'cancelled'
  docStatus: 0 | 1 | 2 // 0=Draft, 1=Submitted, 2=Cancelled

  // Additional
  remarks?: string
  company?: string

  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateStockEntryData {
  entryType: StockEntryType
  postingDate: string
  postingTime?: string
  fromWarehouse?: string
  toWarehouse?: string
  items: Omit<StockEntryItem, '_id'>[]
  remarks?: string
  referenceType?: string
  referenceId?: string
}

// ═══════════════════════════════════════════════════════════════
// STOCK LEDGER ENTRY
// ═══════════════════════════════════════════════════════════════

export interface StockLedgerEntry {
  _id: string
  ledgerId: string
  itemId: string
  itemCode?: string
  warehouseId: string
  warehouseName?: string

  postingDate: string
  postingTime?: string

  // Quantities
  actualQty: number // Change in quantity (+/-)
  qtyAfterTransaction: number

  // Valuation
  incomingRate?: number
  outgoingRate?: number
  valuationRate: number
  stockValue: number
  stockValueDifference: number

  // Batch/Serial
  batchNo?: string
  serialNo?: string

  // Reference
  voucherType: string
  voucherId: string
  voucherNo?: string

  // Fiscal
  fiscalYear?: string
  company?: string

  createdAt: string
}

// ═══════════════════════════════════════════════════════════════
// BATCH & SERIAL NUMBER
// ═══════════════════════════════════════════════════════════════

export interface Batch {
  _id: string
  batchId: string
  batchNo: string
  itemId: string
  itemCode?: string

  // Manufacturing
  manufacturingDate?: string
  expiryDate?: string

  // Supplier
  supplierId?: string
  supplierBatchNo?: string

  // Status
  disabled: boolean

  // Reference
  referenceDocType?: string
  referenceDocId?: string

  description?: string
  createdAt: string
  updatedAt: string
}

export interface SerialNumber {
  _id: string
  serialId: string
  serialNo: string
  itemId: string
  itemCode?: string

  // Location
  warehouseId?: string

  // Status
  status: 'available' | 'delivered' | 'maintenance' | 'scrapped'

  // Batch
  batchNo?: string

  // Warranty
  warrantyExpiryDate?: string
  amc_expiry_date?: string // Annual Maintenance Contract

  // Supplier
  supplierId?: string
  purchaseDate?: string
  purchaseRate?: number

  // Customer
  customerId?: string
  deliveryDate?: string

  // Reference
  purchaseDocType?: string
  purchaseDocId?: string
  deliveryDocType?: string
  deliveryDocId?: string

  description?: string
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// STOCK RECONCILIATION
// ═══════════════════════════════════════════════════════════════

export interface StockReconciliationItem {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  warehouseId: string
  warehouseName?: string
  batchNo?: string
  serialNo?: string
  currentQty: number
  qty: number // New quantity
  valuationRate: number
  currentAmount: number
  amount: number // New amount
  quantityDifference: number
  amountDifference: number
}

export interface StockReconciliation {
  _id: string
  reconciliationId: string
  postingDate: string
  postingTime?: string

  purpose: 'opening_stock' | 'stock_reconciliation'

  items: StockReconciliationItem[]

  // Totals
  totalQuantityDifference: number
  totalAmountDifference: number

  // Status
  status: ReconciliationStatus
  docStatus: 0 | 1 | 2

  // Expense Account for difference
  expenseAccount?: string
  differenceAmount?: number

  remarks?: string
  company?: string

  createdBy?: string
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// ITEM PRICE
// ═══════════════════════════════════════════════════════════════

export interface PriceList {
  _id: string
  priceListId: string
  name: string
  nameAr?: string
  currency: string
  buying: boolean
  selling: boolean
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ItemPrice {
  _id: string
  itemPriceId: string
  itemId: string
  itemCode?: string
  itemName?: string
  priceListId: string
  priceListName?: string

  rate: number
  currency: string
  uom?: string

  // Validity
  validFrom?: string
  validUpto?: string

  // Quantity-based pricing
  minQty?: number

  // Packing
  packingUnit?: string

  // Lead time
  leadTimeDays?: number

  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// BIN (Stock Balance per Warehouse)
// ═══════════════════════════════════════════════════════════════

export interface Bin {
  _id: string
  binId: string
  itemId: string
  itemCode?: string
  warehouseId: string
  warehouseName?: string

  // Quantities
  actualQty: number
  plannedQty: number
  orderedQty: number
  reservedQty: number
  projectedQty: number

  // Valuation
  stockValue: number
  valuationRate: number

  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY FILTERS & STATS
// ═══════════════════════════════════════════════════════════════

export interface ItemFilters {
  itemType?: ItemType
  itemGroup?: string
  status?: ItemStatus
  isStockItem?: boolean
  hasBatchNo?: boolean
  hasSerialNo?: boolean
  search?: string
  brand?: string
  manufacturer?: string
  tags?: string[]
  sortBy?: 'name' | 'itemCode' | 'createdAt' | 'updatedAt' | 'standardRate'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface StockEntryFilters {
  entryType?: StockEntryType
  status?: 'draft' | 'submitted' | 'cancelled'
  fromWarehouse?: string
  toWarehouse?: string
  itemId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  sortBy?: 'postingDate' | 'createdAt' | 'totalAmount'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface InventoryStats {
  totalItems: number
  activeItems: number
  lowStockItems: number
  outOfStockItems: number
  totalWarehouses: number
  totalStockValue: number
  recentStockEntries: number
  pendingReconciliations: number

  // By Item Type
  byItemType: Record<ItemType, number>

  // Top Items
  topMovingItems: {
    itemId: string
    itemName: string
    totalQty: number
  }[]

  // Warehouse Stats
  warehouseStats: {
    warehouseId: string
    warehouseName: string
    itemCount: number
    stockValue: number
  }[]
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY SETTINGS
// ═══════════════════════════════════════════════════════════════

export interface InventorySettings {
  _id: string
  // Valuation
  defaultValuationMethod: ValuationMethod
  allowNegativeStock: boolean

  // Auto-creation
  autoCreateSerialAndBatch: boolean

  // Naming
  itemNamingSeries?: string
  batchNamingSeries?: string

  // Default Warehouse
  defaultWarehouse?: string

  // Stock Freeze
  stockFrozenUpTo?: string

  // Show Barcode Field
  showBarcodeField: boolean

  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// ═══════════════════════════════════════════════════════════════
// ZOD SCHEMAS FOR VALIDATION
// ═══════════════════════════════════════════════════════════════

export const createItemSchema = z.object({
  itemCode: z.string().min(1, 'رمز الصنف مطلوب'),
  name: z.string().min(1, 'اسم الصنف مطلوب'),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  itemType: z.enum(['product', 'service', 'consumable', 'fixed_asset']),
  itemGroup: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  stockUom: z.string().min(1, 'وحدة القياس مطلوبة'),
  standardRate: z.number().min(0, 'السعر يجب أن يكون موجبًا'),
  currency: z.string().default('SAR'),
  taxRate: z.number().min(0).max(100).optional(),
  isStockItem: z.boolean().default(true),
  hasBatchNo: z.boolean().default(false),
  hasSerialNo: z.boolean().default(false),
  valuationMethod: z.enum(['fifo', 'moving_average', 'lifo']).default('fifo'),
  safetyStock: z.number().min(0).optional(),
  reorderLevel: z.number().min(0).optional(),
  reorderQty: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
  image: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
})

export const createWarehouseSchema = z.object({
  name: z.string().min(1, 'اسم المستودع مطلوب'),
  nameAr: z.string().optional(),
  warehouseType: z.enum(['warehouse', 'store', 'transit', 'virtual']).default('warehouse'),
  parentWarehouse: z.string().optional(),
  isGroup: z.boolean().default(false),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isDefault: z.boolean().default(false),
})

export const createStockEntrySchema = z.object({
  entryType: z.enum(['receipt', 'issue', 'transfer', 'manufacture', 'repack', 'material_consumption']),
  postingDate: z.string().min(1, 'تاريخ الترحيل مطلوب'),
  postingTime: z.string().optional(),
  fromWarehouse: z.string().optional(),
  toWarehouse: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string().min(1),
    qty: z.number().min(0.001, 'الكمية يجب أن تكون أكبر من صفر'),
    uom: z.string().min(1),
    rate: z.number().min(0),
    amount: z.number().min(0),
    sourceWarehouse: z.string().optional(),
    targetWarehouse: z.string().optional(),
    batchNo: z.string().optional(),
    serialNo: z.string().optional(),
  })).min(1, 'يجب إضافة صنف واحد على الأقل'),
  remarks: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
})

export type CreateItemInput = z.infer<typeof createItemSchema>
export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>
export type CreateStockEntryInput = z.infer<typeof createStockEntrySchema>

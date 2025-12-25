/**
 * Subcontracting Types
 * Types for Subcontracted Items and Orders
 */

import { z } from 'zod'

export type SubcontractingOrderStatus = 'draft' | 'submitted' | 'partially_received' | 'completed' | 'cancelled'
export type SubcontractingReceiptStatus = 'draft' | 'submitted' | 'cancelled'

export interface SubcontractingOrder {
  _id: string
  subcontractingOrderId: string
  orderNumber: string
  supplierId: string
  supplierName?: string

  // Service Items (what supplier provides)
  serviceItems: SubcontractingServiceItem[]

  // Raw Materials (sent to supplier)
  rawMaterials: SubcontractingRawMaterial[]

  // Finished Goods (received from supplier)
  finishedGoods: SubcontractingFinishedGood[]

  // Dates
  orderDate: string
  requiredDate?: string

  // Warehouses
  supplierWarehouse?: string
  rawMaterialWarehouse?: string
  finishedGoodsWarehouse?: string

  // Totals
  totalServiceCost: number
  totalRawMaterialCost: number
  grandTotal: number

  // Currency
  currency: string

  // Status
  status: SubcontractingOrderStatus
  docStatus: 0 | 1 | 2

  // Progress
  percentReceived: number

  // Reference
  purchaseOrderId?: string

  // Metadata
  remarks?: string
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface SubcontractingServiceItem {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  description?: string
  qty: number
  uom: string
  rate: number
  amount: number
}

export interface SubcontractingRawMaterial {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  requiredQty: number
  transferredQty: number
  consumedQty: number
  returnedQty: number
  uom: string
  rate: number
  amount: number
  sourceWarehouse?: string
  batchNo?: string
  serialNo?: string
}

export interface SubcontractingFinishedGood {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  qty: number
  receivedQty: number
  uom: string
  rate: number
  amount: number
  targetWarehouse?: string
  batchNo?: string
  serialNo?: string
}

export interface SubcontractingReceipt {
  _id: string
  receiptId: string
  receiptNumber: string
  subcontractingOrderId: string
  orderNumber?: string
  supplierId: string
  supplierName?: string

  // Items received
  items: {
    itemId: string
    itemCode?: string
    itemName?: string
    orderedQty: number
    receivedQty: number
    rejectedQty?: number
    acceptedQty: number
    uom: string
    rate: number
    amount: number
    warehouse: string
    batchNo?: string
    serialNo?: string
  }[]

  // Raw materials consumed/returned
  rawMaterialConsumption: {
    itemId: string
    itemCode?: string
    itemName?: string
    consumedQty: number
    returnedQty: number
    uom: string
    rate: number
    amount: number
    warehouse?: string
  }[]

  // Dates
  postingDate: string
  postingTime?: string

  // Totals
  totalQty: number
  totalAmount: number

  // Status
  status: SubcontractingReceiptStatus
  docStatus: 0 | 1 | 2

  // Metadata
  remarks?: string
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface SubcontractingBom {
  _id: string
  bomId: string
  serviceItemId: string
  serviceItemCode?: string
  serviceItemName?: string
  finishedItemId: string
  finishedItemCode?: string
  finishedItemName?: string
  qty: number
  uom: string
  rawMaterials: {
    itemId: string
    itemCode?: string
    itemName?: string
    qty: number
    uom: string
  }[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SubcontractingSettings {
  _id: string
  defaultSupplierWarehouse?: string
  defaultRawMaterialWarehouse?: string
  defaultFinishedGoodsWarehouse?: string
  subcontractingOrderNamingSeries?: string
  subcontractingReceiptNamingSeries?: string
  autoCreateStockEntry?: boolean
  updatedAt: string
}

export interface SubcontractingFilters {
  status?: SubcontractingOrderStatus
  supplierId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  sortBy?: 'orderDate' | 'grandTotal' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SubcontractingStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalValue: number
  topSubcontractors: {
    supplierId: string
    supplierName: string
    totalOrders: number
    totalValue: number
  }[]
}

export interface CreateSubcontractingOrderData {
  supplierId: string
  serviceItems: Omit<SubcontractingServiceItem, '_id'>[]
  rawMaterials: Omit<SubcontractingRawMaterial, '_id' | 'transferredQty' | 'consumedQty' | 'returnedQty'>[]
  finishedGoods: Omit<SubcontractingFinishedGood, '_id' | 'receivedQty'>[]
  orderDate: string
  requiredDate?: string
  supplierWarehouse?: string
  rawMaterialWarehouse?: string
  finishedGoodsWarehouse?: string
  currency?: string
  remarks?: string
}

export const createSubcontractingOrderSchema = z.object({
  supplierId: z.string().min(1, 'المورد مطلوب'),
  serviceItems: z.array(z.object({
    itemId: z.string().min(1),
    qty: z.number().min(0.001),
    uom: z.string().min(1),
    rate: z.number().min(0),
    amount: z.number().min(0),
  })).min(1, 'يجب إضافة خدمة واحدة على الأقل'),
  rawMaterials: z.array(z.object({
    itemId: z.string().min(1),
    requiredQty: z.number().min(0.001),
    uom: z.string().min(1),
    rate: z.number().min(0),
    amount: z.number().min(0),
  })),
  finishedGoods: z.array(z.object({
    itemId: z.string().min(1),
    qty: z.number().min(0.001),
    uom: z.string().min(1),
    rate: z.number().min(0),
    amount: z.number().min(0),
  })),
  orderDate: z.string().min(1, 'تاريخ الطلب مطلوب'),
  requiredDate: z.string().optional(),
  currency: z.string().default('SAR'),
  remarks: z.string().optional(),
})

export type CreateSubcontractingOrderInput = z.infer<typeof createSubcontractingOrderSchema>

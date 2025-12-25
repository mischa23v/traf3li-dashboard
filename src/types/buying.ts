/**
 * Buying/Procurement Types
 * Types for Supplier, Purchase Order, Purchase Receipt, and Purchase Invoice
 * Inspired by ERPNext Buying module
 */

import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════════

export type SupplierType = 'company' | 'individual'
export type SupplierStatus = 'active' | 'inactive' | 'blocked'
export type PurchaseOrderStatus = 'draft' | 'submitted' | 'approved' | 'received' | 'billed' | 'cancelled' | 'closed'
export type PurchaseReceiptStatus = 'draft' | 'submitted' | 'cancelled'
export type PurchaseInvoiceStatus = 'draft' | 'submitted' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'
export type MaterialRequestType = 'purchase' | 'transfer' | 'material_issue' | 'manufacture'
export type MaterialRequestStatus = 'draft' | 'submitted' | 'ordered' | 'transferred' | 'issued' | 'cancelled'
export type RfqStatus = 'draft' | 'submitted' | 'quoted' | 'ordered' | 'cancelled'

// ═══════════════════════════════════════════════════════════════
// SUPPLIER GROUP
// ═══════════════════════════════════════════════════════════════

export interface SupplierGroup {
  _id: string
  groupId: string
  name: string
  nameAr?: string
  parentGroup?: string
  paymentTerms?: string
  accounts?: {
    company: string
    account: string
  }[]
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// SUPPLIER
// ═══════════════════════════════════════════════════════════════

export interface Supplier {
  _id: string
  supplierId: string
  name: string
  nameAr?: string
  supplierType: SupplierType
  supplierGroup?: string

  // Tax & Registration
  taxId?: string
  crNumber?: string
  vatNumber?: string

  // Contact
  email?: string
  phone?: string
  mobile?: string
  fax?: string
  website?: string

  // Address
  address?: string
  city?: string
  region?: string
  country?: string
  postalCode?: string

  // Banking
  bankName?: string
  bankAccountNo?: string
  iban?: string

  // Terms
  paymentTerms?: string
  currency: string
  defaultPriceList?: string

  // Status
  status: SupplierStatus
  disabled: boolean

  // Contacts
  contacts?: {
    name: string
    designation?: string
    email?: string
    phone?: string
    isPrimary?: boolean
  }[]

  // Metadata
  tags?: string[]
  notes?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateSupplierData {
  name: string
  nameAr?: string
  supplierType: SupplierType
  supplierGroup?: string
  taxId?: string
  crNumber?: string
  vatNumber?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  region?: string
  country?: string
  paymentTerms?: string
  currency?: string
  status?: SupplierStatus
  notes?: string
}

// ═══════════════════════════════════════════════════════════════
// PURCHASE ORDER
// ═══════════════════════════════════════════════════════════════

export interface PurchaseOrderItem {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  description?: string
  qty: number
  uom: string
  rate: number
  amount: number
  discount?: number
  taxRate?: number
  taxAmount?: number
  netAmount: number
  receivedQty: number
  billedQty: number
  warehouse?: string
  requiredDate?: string
}

export interface PurchaseOrder {
  _id: string
  purchaseOrderId: string
  poNumber: string
  supplierId: string
  supplierName?: string

  // Items
  items: PurchaseOrderItem[]

  // Dates
  orderDate: string
  requiredDate?: string
  expectedDeliveryDate?: string

  // Totals
  totalQty: number
  totalAmount: number
  discountAmount?: number
  taxAmount?: number
  grandTotal: number

  // Tax
  taxTemplateId?: string

  // Currency
  currency: string
  exchangeRate?: number

  // Status
  status: PurchaseOrderStatus
  docStatus: 0 | 1 | 2

  // Billing & Receipt Status
  percentReceived: number
  percentBilled: number

  // Terms
  paymentTerms?: string
  termsAndConditions?: string

  // References
  materialRequestId?: string
  rfqId?: string
  quotationId?: string

  // Metadata
  remarks?: string
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePurchaseOrderData {
  supplierId: string
  items: Omit<PurchaseOrderItem, '_id' | 'receivedQty' | 'billedQty'>[]
  orderDate: string
  requiredDate?: string
  currency?: string
  taxTemplateId?: string
  paymentTerms?: string
  termsAndConditions?: string
  remarks?: string
  materialRequestId?: string
}

// ═══════════════════════════════════════════════════════════════
// PURCHASE RECEIPT
// ═══════════════════════════════════════════════════════════════

export interface PurchaseReceiptItem {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  qty: number
  receivedQty: number
  rejectedQty?: number
  acceptedQty: number
  uom: string
  rate: number
  amount: number
  warehouse: string
  batchNo?: string
  serialNo?: string
  expiryDate?: string
  purchaseOrderItem?: string
}

export interface PurchaseReceipt {
  _id: string
  purchaseReceiptId: string
  receiptNumber: string
  supplierId: string
  supplierName?: string

  // Reference
  purchaseOrderId?: string
  poNumber?: string

  // Items
  items: PurchaseReceiptItem[]

  // Dates
  postingDate: string
  postingTime?: string

  // Totals
  totalQty: number
  totalAmount: number
  grandTotal: number

  // Status
  status: PurchaseReceiptStatus
  docStatus: 0 | 1 | 2

  // Metadata
  remarks?: string
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePurchaseReceiptData {
  supplierId: string
  purchaseOrderId?: string
  items: Omit<PurchaseReceiptItem, '_id'>[]
  postingDate: string
  postingTime?: string
  remarks?: string
}

// ═══════════════════════════════════════════════════════════════
// PURCHASE INVOICE
// ═══════════════════════════════════════════════════════════════

export interface PurchaseInvoiceItem {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  qty: number
  uom: string
  rate: number
  amount: number
  discount?: number
  taxRate?: number
  taxAmount?: number
  netAmount: number
  purchaseOrderItem?: string
  purchaseReceiptItem?: string
}

export interface PurchaseInvoice {
  _id: string
  purchaseInvoiceId: string
  invoiceNumber: string
  supplierId: string
  supplierName?: string
  supplierInvoiceNo?: string

  // References
  purchaseOrderId?: string
  purchaseReceiptId?: string

  // Items
  items: PurchaseInvoiceItem[]

  // Dates
  postingDate: string
  dueDate: string

  // Totals
  totalQty: number
  totalAmount: number
  discountAmount?: number
  taxAmount?: number
  grandTotal: number
  outstandingAmount: number
  paidAmount: number

  // Currency
  currency: string
  exchangeRate?: number

  // Status
  status: PurchaseInvoiceStatus
  docStatus: 0 | 1 | 2

  // Payment
  paymentTerms?: string
  modeOfPayment?: string

  // Metadata
  remarks?: string
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePurchaseInvoiceData {
  supplierId: string
  supplierInvoiceNo?: string
  purchaseOrderId?: string
  purchaseReceiptId?: string
  items: Omit<PurchaseInvoiceItem, '_id'>[]
  postingDate: string
  dueDate: string
  currency?: string
  paymentTerms?: string
  remarks?: string
}

// ═══════════════════════════════════════════════════════════════
// MATERIAL REQUEST
// ═══════════════════════════════════════════════════════════════

export interface MaterialRequestItem {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  qty: number
  uom: string
  warehouse?: string
  requiredDate?: string
  orderedQty?: number
  receivedQty?: number
}

export interface MaterialRequest {
  _id: string
  materialRequestId: string
  mrNumber: string
  requestType: MaterialRequestType
  purpose?: string

  // Items
  items: MaterialRequestItem[]

  // Dates
  transactionDate: string
  requiredDate?: string

  // Totals
  totalQty: number

  // Status
  status: MaterialRequestStatus
  docStatus: 0 | 1 | 2

  // Metadata
  remarks?: string
  company?: string
  requestedBy?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateMaterialRequestData {
  requestType: MaterialRequestType
  purpose?: string
  items: Omit<MaterialRequestItem, '_id' | 'orderedQty' | 'receivedQty'>[]
  transactionDate: string
  requiredDate?: string
  remarks?: string
}

// ═══════════════════════════════════════════════════════════════
// REQUEST FOR QUOTATION (RFQ)
// ═══════════════════════════════════════════════════════════════

export interface RfqItem {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  qty: number
  uom: string
  requiredDate?: string
}

export interface RfqSupplier {
  supplierId: string
  supplierName?: string
  email?: string
  sendEmail?: boolean
  quotationId?: string
}

export interface RequestForQuotation {
  _id: string
  rfqId: string
  rfqNumber: string

  // Items
  items: RfqItem[]

  // Suppliers
  suppliers: RfqSupplier[]

  // Dates
  transactionDate: string
  validTill?: string

  // Message
  messageForSupplier?: string

  // Status
  status: RfqStatus
  docStatus: 0 | 1 | 2

  // Reference
  materialRequestId?: string

  // Metadata
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// SUPPLIER QUOTATION
// ═══════════════════════════════════════════════════════════════

export interface SupplierQuotationItem {
  _id?: string
  itemId: string
  itemCode?: string
  itemName?: string
  qty: number
  uom: string
  rate: number
  amount: number
}

export interface SupplierQuotation {
  _id: string
  quotationId: string
  quotationNumber: string
  supplierId: string
  supplierName?: string

  // Reference
  rfqId?: string

  // Items
  items: SupplierQuotationItem[]

  // Dates
  quotationDate: string
  validTill?: string

  // Totals
  totalAmount: number
  grandTotal: number

  // Currency
  currency: string

  // Status
  status: 'draft' | 'submitted' | 'ordered' | 'rejected' | 'expired' | 'cancelled'
  docStatus: 0 | 1 | 2

  // Metadata
  termsAndConditions?: string
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// BUYING SETTINGS
// ═══════════════════════════════════════════════════════════════

export interface BuyingSettings {
  _id: string
  // Default Values
  defaultPaymentTerms?: string
  defaultTaxTemplate?: string
  defaultBuyingPriceList?: string

  // Allowances
  overDeliveryAllowance: number
  underDeliveryAllowance: number

  // Naming Series
  supplierNamingSeries?: string
  purchaseOrderNamingSeries?: string
  purchaseReceiptNamingSeries?: string
  purchaseInvoiceNamingSeries?: string

  // Settings
  maintainSameRate: boolean
  allowMultiplePOs: boolean

  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// FILTERS & STATS
// ═══════════════════════════════════════════════════════════════

export interface SupplierFilters {
  supplierType?: SupplierType
  supplierGroup?: string
  status?: SupplierStatus
  search?: string
  city?: string
  country?: string
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PurchaseOrderFilters {
  supplierId?: string
  status?: PurchaseOrderStatus
  dateFrom?: string
  dateTo?: string
  search?: string
  sortBy?: 'orderDate' | 'grandTotal' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface RfqFilters {
  status?: RfqStatus | 'all' | 'expired'
  search?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'transactionDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface BuyingStats {
  totalSuppliers: number
  activeSuppliers: number
  pendingOrders: number
  pendingReceipts: number
  unpaidInvoices: number
  totalPurchaseValue: number
  topSuppliers: {
    supplierId: string
    supplierName: string
    totalPurchases: number
  }[]
}

// ═══════════════════════════════════════════════════════════════
// ZOD SCHEMAS FOR VALIDATION
// ═══════════════════════════════════════════════════════════════

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'اسم المورد مطلوب'),
  nameAr: z.string().optional(),
  supplierType: z.enum(['company', 'individual']),
  supplierGroup: z.string().optional(),
  taxId: z.string().optional(),
  crNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  email: z.string().email('بريد إلكتروني غير صالح').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  paymentTerms: z.string().optional(),
  currency: z.string().default('SAR'),
  status: z.enum(['active', 'inactive', 'blocked']).default('active'),
  notes: z.string().optional(),
})

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'المورد مطلوب'),
  items: z.array(z.object({
    itemId: z.string().min(1),
    qty: z.number().min(0.001, 'الكمية يجب أن تكون أكبر من صفر'),
    uom: z.string().min(1),
    rate: z.number().min(0),
    amount: z.number().min(0),
    netAmount: z.number().min(0),
    warehouse: z.string().optional(),
  })).min(1, 'يجب إضافة صنف واحد على الأقل'),
  orderDate: z.string().min(1, 'تاريخ الطلب مطلوب'),
  requiredDate: z.string().optional(),
  currency: z.string().default('SAR'),
  taxTemplateId: z.string().optional(),
  paymentTerms: z.string().optional(),
  remarks: z.string().optional(),
})

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>

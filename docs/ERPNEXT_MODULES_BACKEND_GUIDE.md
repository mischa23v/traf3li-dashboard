# ERPNext-Style Modules - Backend Implementation Guide

**Last Updated:** December 25, 2025
**Status:** Verified against frontend code

This guide covers the 7 ERPNext-style modules added to the Traf3li Dashboard frontend. All information has been verified against the actual frontend types, services, and hooks.

---

## Quick Reference

| Module | Base Route | Collections |
|--------|-----------|-------------|
| Inventory | `/api/inventory` | items, warehouses, stockEntries, stockLedger, batches, serialNumbers |
| Buying | `/api/buying` | suppliers, purchaseOrders, materialRequests, rfqs, purchaseReceipts, purchaseInvoices |
| Support | `/api/support` | tickets, ticketCommunications, slas |
| Quality | `/api/quality` | inspections, templates, parameters, actions |
| Manufacturing | `/api/manufacturing` | boms, workstations, workOrders, jobCards |
| Assets | `/api/assets` | assets, assetCategories, maintenanceSchedules, movements |
| Subcontracting | `/api/subcontracting` | orders, receipts |

---

## 1. Inventory Module

### Frontend Source Files
- Types: `src/types/inventory.ts`
- Service: `src/services/inventoryService.ts`
- Hooks: `src/hooks/use-inventory.ts`

### API Endpoints (Required)

```
# Items
GET    /api/inventory/items                    # Query: status, itemType, itemGroup, search, page, limit
GET    /api/inventory/items/:id
POST   /api/inventory/items
PUT    /api/inventory/items/:id
DELETE /api/inventory/items/:id
GET    /api/inventory/items/:id/stock          # Returns stock by warehouse (Bin[])

# Warehouses
GET    /api/inventory/warehouses
GET    /api/inventory/warehouses/:id
POST   /api/inventory/warehouses
PUT    /api/inventory/warehouses/:id
DELETE /api/inventory/warehouses/:id
GET    /api/inventory/warehouses/:id/stock     # Returns all items in warehouse (Bin[])

# Stock Entries
GET    /api/inventory/stock-entries            # Query: entryType, status, fromWarehouse, toWarehouse, dateFrom, dateTo
GET    /api/inventory/stock-entries/:id
POST   /api/inventory/stock-entries
POST   /api/inventory/stock-entries/:id/submit # Changes status draft->submitted, updates stock ledger
POST   /api/inventory/stock-entries/:id/cancel # Reverses stock changes
DELETE /api/inventory/stock-entries/:id        # Only draft entries

# Stock Ledger (Read-only, populated by stock entries)
GET    /api/inventory/stock-ledger             # Query: itemId, warehouseId, dateFrom, dateTo, page, limit

# Batches
GET    /api/inventory/batches                  # Query: itemId
POST   /api/inventory/batches

# Serial Numbers
GET    /api/inventory/serial-numbers           # Query: itemId
POST   /api/inventory/serial-numbers

# Reconciliation
GET    /api/inventory/reconciliations
POST   /api/inventory/reconciliations
POST   /api/inventory/reconciliations/:id/submit

# Master Data
GET    /api/inventory/item-groups
POST   /api/inventory/item-groups
GET    /api/inventory/uom
POST   /api/inventory/uom
GET    /api/inventory/price-lists
GET    /api/inventory/item-prices              # Query: itemId, priceListId

# Reports & Stats
GET    /api/inventory/stats
GET    /api/inventory/reports/stock-balance    # Query: itemId, warehouseId, itemGroup
GET    /api/inventory/reports/low-stock
GET    /api/inventory/reports/stock-movement   # Query: itemId, warehouseId, dateFrom, dateTo

# Settings
GET    /api/inventory/settings
PUT    /api/inventory/settings
```

### Item Schema

```typescript
interface Item {
  _id: string
  itemId: string          // Auto-generate: "ITM-YYYYMMDD-XXXX"
  itemCode: string        // Unique, user-defined
  name: string            // Required
  nameAr?: string
  description?: string
  descriptionAr?: string

  // Classification
  itemType: 'product' | 'service' | 'consumable' | 'fixed_asset'
  itemGroup?: string
  brand?: string
  manufacturer?: string

  // Identification
  sku?: string
  barcode?: string
  hsnCode?: string

  // Units
  stockUom: string        // Required, e.g., "Units", "Kg", "Pcs"
  purchaseUom?: string
  salesUom?: string
  uomConversions?: { fromUom: string; toUom: string; conversionFactor: number }[]

  // Pricing
  standardRate: number    // Required
  valuationRate?: number
  lastPurchaseRate?: number
  currency: string        // Default: "SAR"

  // Tax
  taxRate?: number
  taxTemplateId?: string
  isZeroRated?: boolean
  isExempt?: boolean

  // Stock Settings
  isStockItem: boolean    // Default: true for products
  hasVariants: boolean
  hasBatchNo: boolean
  hasSerialNo: boolean
  hasExpiryDate: boolean
  shelfLifeInDays?: number
  warrantyPeriod?: number

  // Inventory Levels
  safetyStock?: number
  reorderLevel?: number
  reorderQty?: number
  leadTimeDays?: number

  // Valuation
  valuationMethod: 'fifo' | 'moving_average' | 'lifo'

  // Status
  status: 'active' | 'inactive' | 'discontinued'
  disabled: boolean

  // Media
  image?: string
  images?: string[]

  // Weights
  weightPerUnit?: number
  weightUom?: string

  // Supplier
  defaultSupplier?: string
  supplierItems?: { supplierId: string; supplierPartNo?: string; supplierName?: string }[]

  // Metadata
  tags?: string[]
  customFields?: Record<string, any>
  createdBy?: string
  createdAt: string
  updatedAt: string
}
```

### Warehouse Schema

```typescript
interface Warehouse {
  _id: string
  warehouseId: string     // Auto-generate: "WH-YYYYMMDD-XXXX"
  name: string            // Required
  nameAr?: string
  warehouseType: 'warehouse' | 'store' | 'transit' | 'virtual'

  // Hierarchy
  parentWarehouse?: string
  isGroup: boolean
  company?: string

  // Location
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
```

### Stock Entry Schema

```typescript
interface StockEntry {
  _id: string
  stockEntryId: string    // Auto-generate: "SE-YYYYMMDD-XXXX"
  entryType: 'receipt' | 'issue' | 'transfer' | 'manufacture' | 'repack' | 'material_consumption'
  postingDate: string     // Required
  postingTime?: string

  // Warehouses (depends on entryType)
  fromWarehouse?: string
  toWarehouse?: string

  // Items
  items: {
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
  }[]

  totalQty: number
  totalAmount: number

  // Reference
  referenceType?: string
  referenceId?: string
  purchaseOrderId?: string
  salesOrderId?: string

  // Status
  status: 'draft' | 'submitted' | 'cancelled'
  docStatus: 0 | 1 | 2    // 0=Draft, 1=Submitted, 2=Cancelled

  remarks?: string
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}
```

### Response Formats

```typescript
// GET /api/inventory/items
{
  items: Item[],           // or "data": Item[]
  total: number,
  pagination: { page: number, limit: number, total: number, pages: number }
}

// GET /api/inventory/items/:id
{
  item: Item              // or "data": Item
}

// GET /api/inventory/stats
{
  stats: {
    totalItems: number,
    activeItems: number,
    lowStockItems: number,
    outOfStockItems: number,
    totalWarehouses: number,
    totalStockValue: number,
    recentStockEntries: number,
    pendingReconciliations: number,
    byItemType: Record<ItemType, number>,
    topMovingItems: { itemId: string, itemName: string, totalQty: number }[],
    warehouseStats: { warehouseId: string, warehouseName: string, itemCount: number, stockValue: number }[]
  }
}
```

---

## 2. Buying Module

### Frontend Source Files
- Types: `src/types/buying.ts`
- Service: `src/services/buyingService.ts`
- Hooks: `src/hooks/use-buying.ts`

### API Endpoints (Required)

```
# Suppliers
GET    /api/buying/suppliers                   # Query: supplierType, supplierGroup, status, search, city, country
GET    /api/buying/suppliers/:id
POST   /api/buying/suppliers
PUT    /api/buying/suppliers/:id
DELETE /api/buying/suppliers/:id
GET    /api/buying/supplier-groups

# Purchase Orders
GET    /api/buying/purchase-orders             # Query: supplierId, status, dateFrom, dateTo, search
GET    /api/buying/purchase-orders/:id
POST   /api/buying/purchase-orders
POST   /api/buying/purchase-orders/:id/submit
POST   /api/buying/purchase-orders/:id/approve
POST   /api/buying/purchase-orders/:id/cancel
DELETE /api/buying/purchase-orders/:id

# Purchase Receipts
GET    /api/buying/purchase-receipts
GET    /api/buying/purchase-receipts/:id
POST   /api/buying/purchase-receipts
POST   /api/buying/purchase-receipts/:id/submit

# Purchase Invoices
GET    /api/buying/purchase-invoices
GET    /api/buying/purchase-invoices/:id
POST   /api/buying/purchase-invoices
POST   /api/buying/purchase-invoices/:id/submit

# Material Requests
GET    /api/buying/material-requests
GET    /api/buying/material-requests/:id
POST   /api/buying/material-requests

# RFQs (Request for Quotation)
GET    /api/buying/rfqs                        # Query: status, search, dateFrom, dateTo
GET    /api/buying/rfqs/:id
POST   /api/buying/rfqs
PUT    /api/buying/rfqs/:id
POST   /api/buying/rfqs/:id/submit
DELETE /api/buying/rfqs/:id

# Stats & Settings
GET    /api/buying/stats
GET    /api/buying/settings
PUT    /api/buying/settings
```

### Supplier Schema

```typescript
interface Supplier {
  _id: string
  supplierId: string       // Auto-generate: "SUP-YYYYMMDD-XXXX"
  name: string             // Required
  nameAr?: string
  supplierType: 'company' | 'individual'
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
  currency: string         // Default: "SAR"
  defaultPriceList?: string

  // Status
  status: 'active' | 'inactive' | 'blocked'
  disabled: boolean

  // Contacts
  contacts?: { name: string; designation?: string; email?: string; phone?: string; isPrimary?: boolean }[]

  // Metadata
  tags?: string[]
  notes?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}
```

### Purchase Order Schema

```typescript
interface PurchaseOrder {
  _id: string
  purchaseOrderId: string  // Auto-generate: "PO-YYYYMMDD-XXXX"
  poNumber: string
  supplierId: string
  supplierName?: string

  // Items
  items: {
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
  }[]

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
  status: 'draft' | 'submitted' | 'approved' | 'received' | 'billed' | 'cancelled' | 'closed'
  docStatus: 0 | 1 | 2

  // Progress
  percentReceived: number
  percentBilled: number

  // Terms
  paymentTerms?: string
  termsAndConditions?: string

  // References
  materialRequestId?: string
  rfqId?: string
  quotationId?: string

  remarks?: string
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}
```

### Material Request Schema

```typescript
interface MaterialRequest {
  _id: string
  materialRequestId: string // Auto-generate: "MR-YYYYMMDD-XXXX"
  mrNumber: string
  requestType: 'purchase' | 'transfer' | 'material_issue' | 'manufacture'
  purpose?: string

  items: {
    itemId: string
    itemCode?: string
    itemName?: string
    qty: number
    uom: string
    warehouse?: string
    requiredDate?: string
    orderedQty?: number
    receivedQty?: number
  }[]

  transactionDate: string
  requiredDate?: string
  totalQty: number

  status: 'draft' | 'submitted' | 'ordered' | 'transferred' | 'issued' | 'cancelled'
  docStatus: 0 | 1 | 2

  remarks?: string
  company?: string
  requestedBy?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}
```

### RFQ Schema

```typescript
interface RequestForQuotation {
  _id: string
  rfqId: string           // Auto-generate: "RFQ-YYYYMMDD-XXXX"
  rfqNumber: string

  items: {
    itemId: string
    itemCode?: string
    itemName?: string
    qty: number
    uom: string
    requiredDate?: string
  }[]

  suppliers: {
    supplierId: string
    supplierName?: string
    email?: string
    sendEmail?: boolean
    quotationId?: string
  }[]

  transactionDate: string
  validTill?: string
  messageForSupplier?: string

  status: 'draft' | 'submitted' | 'quoted' | 'ordered' | 'cancelled'
  docStatus: 0 | 1 | 2

  materialRequestId?: string
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}
```

---

## 3. Support Module

### Frontend Source Files
- Types: `src/types/support.ts`
- Service: `src/services/supportService.ts`
- Hooks: `src/hooks/use-support.ts`

### API Endpoints (Required)

```
# Tickets
GET    /api/support/tickets                    # Query: status, priority, ticketType, assignedTo, raisedBy, clientId
GET    /api/support/tickets/:id
POST   /api/support/tickets
PUT    /api/support/tickets/:id
DELETE /api/support/tickets/:id
POST   /api/support/tickets/:id/reply
POST   /api/support/tickets/:id/resolve
POST   /api/support/tickets/:id/close

# SLAs
GET    /api/support/slas
GET    /api/support/slas/:id
POST   /api/support/slas
PUT    /api/support/slas/:id
DELETE /api/support/slas/:id

# Stats & Settings
GET    /api/support/stats
GET    /api/support/settings
PUT    /api/support/settings
```

### Ticket Schema

```typescript
interface Ticket {
  _id: string
  ticketId: string        // Auto-generate: "TKT-YYYYMMDD-XXXX"
  ticketNumber: string
  subject: string
  description: string

  status: 'open' | 'replied' | 'resolved' | 'closed' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  ticketType: 'question' | 'problem' | 'feature_request' | 'incident' | 'service_request'

  raisedBy: string
  raisedByName?: string
  raisedByEmail?: string
  assignedTo?: string
  assignedToName?: string

  clientId?: string
  clientName?: string

  // SLA
  slaId?: string
  slaStatus?: 'within_sla' | 'warning' | 'breached'
  firstResponseTime?: string
  resolutionTime?: string
  firstResponseDue?: string
  resolutionDue?: string

  communications?: {
    communicationId: string
    ticketId: string
    sender: string
    senderName?: string
    senderType: 'customer' | 'agent' | 'system'
    content: string
    contentType?: 'text' | 'html'
    attachments?: { fileName: string; fileUrl: string }[]
    sentVia: 'email' | 'portal' | 'phone' | 'chat'
    isInternal?: boolean
    timestamp: string
  }[]

  attachments?: { fileName: string; fileUrl: string; uploadedAt: string }[]
  tags?: string[]
  customFields?: Record<string, any>

  resolvedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
}
```

### SLA Schema

```typescript
interface ServiceLevelAgreement {
  _id: string
  slaId: string
  name: string
  nameAr?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  supportType?: string

  firstResponseMinutes: number
  resolutionMinutes: number

  workingHours?: { start: string; end: string }
  workingDays?: number[]  // 0=Sunday, 6=Saturday
  holidays?: string[]     // ISO date strings

  isDefault: boolean
  status: 'active' | 'inactive'

  createdAt: string
  updatedAt: string
}
```

---

## 4. Quality Module

### Frontend Source Files
- Types: `src/types/quality.ts`
- Service: `src/services/qualityService.ts`
- Hooks: `src/hooks/use-quality.ts`

### API Endpoints (Required)

```
# Inspections
GET    /api/quality/inspections                # Query: inspectionType, status, itemId, referenceType, dateFrom, dateTo
GET    /api/quality/inspections/:id
POST   /api/quality/inspections
PUT    /api/quality/inspections/:id
POST   /api/quality/inspections/:id/submit
DELETE /api/quality/inspections/:id

# Templates
GET    /api/quality/templates
GET    /api/quality/templates/:id
POST   /api/quality/templates
PUT    /api/quality/templates/:id
DELETE /api/quality/templates/:id

# Actions
GET    /api/quality/actions
GET    /api/quality/actions/:id
POST   /api/quality/actions
PUT    /api/quality/actions/:id
DELETE /api/quality/actions/:id

# Stats & Settings
GET    /api/quality/stats
GET    /api/quality/settings
PUT    /api/quality/settings
```

### Quality Inspection Schema

```typescript
interface QualityInspection {
  _id: string
  inspectionId: string    // Auto-generate: "QI-YYYYMMDD-XXXX"
  inspectionNumber: string

  referenceType: 'purchase_receipt' | 'delivery_note' | 'stock_entry' | 'production'
  referenceId: string
  referenceNumber?: string

  itemId: string
  itemCode?: string
  itemName?: string
  batchNo?: string

  inspectionType: 'incoming' | 'outgoing' | 'in_process'
  sampleSize: number

  inspectedBy?: string
  inspectedByName?: string
  inspectionDate: string

  templateId?: string
  templateName?: string

  readings: {
    parameterName: string
    parameterNameAr?: string
    specification?: string
    acceptanceCriteria?: string
    minValue?: number
    maxValue?: number
    value?: number | string
    status: 'accepted' | 'rejected'
    remarks?: string
  }[]

  status: 'pending' | 'accepted' | 'rejected' | 'partially_accepted'
  acceptedQty?: number
  rejectedQty?: number

  remarks?: string
  createdAt: string
  updatedAt: string
}
```

---

## 5. Manufacturing Module

### Frontend Source Files
- Types: `src/types/manufacturing.ts`
- Service: `src/services/manufacturingService.ts`
- Hooks: `src/hooks/use-manufacturing.ts`

### API Endpoints (Required)

```
# BOMs (Bill of Materials)
GET    /api/manufacturing/boms
GET    /api/manufacturing/boms/:id
POST   /api/manufacturing/boms
PUT    /api/manufacturing/boms/:id
DELETE /api/manufacturing/boms/:id

# Workstations
GET    /api/manufacturing/workstations
GET    /api/manufacturing/workstations/:id
POST   /api/manufacturing/workstations
PUT    /api/manufacturing/workstations/:id
DELETE /api/manufacturing/workstations/:id

# Work Orders
GET    /api/manufacturing/work-orders          # Query: status, itemId, bomId, dateFrom, dateTo
GET    /api/manufacturing/work-orders/:id
POST   /api/manufacturing/work-orders
PUT    /api/manufacturing/work-orders/:id
POST   /api/manufacturing/work-orders/:id/submit
POST   /api/manufacturing/work-orders/:id/start
POST   /api/manufacturing/work-orders/:id/complete
POST   /api/manufacturing/work-orders/:id/cancel
DELETE /api/manufacturing/work-orders/:id

# Job Cards
GET    /api/manufacturing/job-cards
GET    /api/manufacturing/job-cards/:id
POST   /api/manufacturing/job-cards
PUT    /api/manufacturing/job-cards/:id
POST   /api/manufacturing/job-cards/:id/start
POST   /api/manufacturing/job-cards/:id/complete

# Stats & Settings
GET    /api/manufacturing/stats
GET    /api/manufacturing/settings
PUT    /api/manufacturing/settings
```

### BOM Schema

```typescript
interface BillOfMaterials {
  _id: string
  bomId: string           // Auto-generate: "BOM-YYYYMMDD-XXXX"
  bomNumber: string

  itemId: string
  itemCode?: string
  itemName?: string

  bomType: 'standard' | 'template' | 'subcontract'
  quantity: number
  uom: string

  isActive: boolean
  isDefault: boolean

  items: {
    itemId: string
    itemCode?: string
    itemName?: string
    qty: number
    uom: string
    rate?: number
    amount?: number
    sourceWarehouse?: string
    includeInManufacturing?: boolean
  }[]

  operations?: {
    operation: string
    operationAr?: string
    workstation?: string
    timeInMins: number
    operatingCost?: number
    description?: string
    sequence: number
  }[]

  routingId?: string
  totalCost?: number
  remarks?: string

  createdAt: string
  updatedAt: string
}
```

### Work Order Schema

```typescript
interface WorkOrder {
  _id: string
  workOrderId: string     // Auto-generate: "WO-YYYYMMDD-XXXX"
  workOrderNumber: string

  itemId: string
  itemCode?: string
  itemName?: string

  bomId: string
  bomNumber?: string

  qty: number
  producedQty: number
  uom: string

  plannedStartDate: string
  plannedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string

  targetWarehouse: string
  workInProgressWarehouse?: string
  sourceWarehouse?: string

  status: 'draft' | 'submitted' | 'not_started' | 'in_progress' | 'completed' | 'stopped' | 'cancelled'
  docStatus: 0 | 1 | 2

  salesOrderId?: string
  materialRequestId?: string

  requiredItems?: {
    itemId: string
    itemCode?: string
    itemName?: string
    requiredQty: number
    transferredQty: number
    consumedQty: number
    uom: string
    sourceWarehouse?: string
    rate?: number
    amount?: number
  }[]

  operations?: {
    operation: string
    workstation?: string
    plannedTime: number
    actualTime?: number
    status: 'pending' | 'in_progress' | 'completed'
    completedQty: number
    sequence: number
  }[]

  remarks?: string
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}
```

---

## 6. Assets Module

### Frontend Source Files
- Types: `src/types/assets.ts`
- Service: `src/services/assetsService.ts`
- Hooks: `src/hooks/use-assets.ts`

### API Endpoints (Required)

```
# Assets
GET    /api/assets                             # Query: status, assetCategory, location, custodian, department
GET    /api/assets/:id
POST   /api/assets
PUT    /api/assets/:id
POST   /api/assets/:id/submit
DELETE /api/assets/:id

# Categories
GET    /api/assets/categories
GET    /api/assets/categories/:id
POST   /api/assets/categories
PUT    /api/assets/categories/:id
DELETE /api/assets/categories/:id

# Maintenance
GET    /api/assets/maintenance
GET    /api/assets/maintenance/:id
POST   /api/assets/maintenance
PUT    /api/assets/maintenance/:id
POST   /api/assets/maintenance/:id/complete

# Movements
GET    /api/assets/movements
POST   /api/assets/movements

# Stats & Settings
GET    /api/assets/stats
GET    /api/assets/settings
PUT    /api/assets/settings
```

### Asset Schema

```typescript
interface Asset {
  _id: string
  assetId: string         // Auto-generate: "AST-YYYYMMDD-XXXX"
  assetNumber: string
  assetName: string
  assetNameAr?: string

  assetCategory?: string
  itemId?: string
  itemCode?: string

  status: 'draft' | 'submitted' | 'partially_depreciated' | 'fully_depreciated' | 'sold' | 'scrapped' | 'in_maintenance'

  isExistingAsset?: boolean
  location?: string
  custodian?: string
  custodianName?: string
  department?: string
  company?: string

  purchaseDate?: string
  purchaseInvoiceId?: string
  supplierId?: string
  supplierName?: string

  grossPurchaseAmount: number
  purchaseReceiptAmount?: number
  currency: string        // Default: "SAR"
  assetQuantity: number

  availableForUseDate?: string
  depreciationMethod: 'straight_line' | 'double_declining_balance' | 'written_down_value'
  totalNumberOfDepreciations?: number
  frequencyOfDepreciation?: number
  depreciationStartDate?: string
  expectedValueAfterUsefulLife?: number
  openingAccumulatedDepreciation?: number

  currentValue?: number
  accumulatedDepreciation?: number
  valueAfterDepreciation?: number

  serialNo?: string
  warrantyExpiryDate?: string

  insuranceDetails?: {
    insurer?: string
    policyNo?: string
    startDate?: string
    endDate?: string
    insuredValue?: number
  }

  maintenanceSchedule?: MaintenanceSchedule[]
  depreciationSchedule?: DepreciationEntry[]
  movementHistory?: AssetMovement[]

  image?: string
  description?: string
  tags?: string[]

  createdAt: string
  updatedAt: string
}
```

---

## 7. Subcontracting Module

### Frontend Source Files
- Types: `src/types/subcontracting.ts`
- Service: `src/services/subcontractingService.ts`
- Hooks: `src/hooks/use-subcontracting.ts`

### API Endpoints (Required)

```
# Orders
GET    /api/subcontracting/orders              # Query: status, supplierId, dateFrom, dateTo
GET    /api/subcontracting/orders/:id
POST   /api/subcontracting/orders
PUT    /api/subcontracting/orders/:id
POST   /api/subcontracting/orders/:id/submit
POST   /api/subcontracting/orders/:id/cancel
DELETE /api/subcontracting/orders/:id

# Receipts
GET    /api/subcontracting/receipts
GET    /api/subcontracting/receipts/:id
POST   /api/subcontracting/receipts
POST   /api/subcontracting/receipts/:id/submit

# Stats & Settings
GET    /api/subcontracting/stats
GET    /api/subcontracting/settings
PUT    /api/subcontracting/settings
```

### Subcontracting Order Schema

```typescript
interface SubcontractingOrder {
  _id: string
  subcontractingOrderId: string  // Auto-generate: "SCO-YYYYMMDD-XXXX"
  orderNumber: string

  supplierId: string
  supplierName?: string

  serviceItems: {
    itemId: string
    itemCode?: string
    itemName?: string
    description?: string
    qty: number
    uom: string
    rate: number
    amount: number
  }[]

  rawMaterials: {
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
  }[]

  finishedGoods: {
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
  }[]

  orderDate: string
  requiredDate?: string

  supplierWarehouse?: string
  rawMaterialWarehouse?: string
  finishedGoodsWarehouse?: string

  totalServiceCost: number
  totalRawMaterialCost: number
  grandTotal: number
  currency: string

  status: 'draft' | 'submitted' | 'partially_received' | 'completed' | 'cancelled'
  docStatus: 0 | 1 | 2
  percentReceived: number

  purchaseOrderId?: string
  remarks?: string
  company?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
}
```

---

## Common Patterns

### Auto-ID Generation

```javascript
// Generate IDs like "ITM-20251225-0001"
function generateId(prefix) {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const seq = await getNextSequence(prefix)
  return `${prefix}-${dateStr}-${String(seq).padStart(4, '0')}`
}
```

### Pagination Response

```javascript
// Standard pagination response
{
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    pages: 5
  }
}
```

### Document Status

```javascript
// docStatus convention
0 = Draft      // Editable, not processed
1 = Submitted  // Processed, affects stock/accounts
2 = Cancelled  // Reversed, no longer valid
```

### Soft Delete

Use `isDeleted: Boolean` field instead of hard delete. Filter `{ isDeleted: { $ne: true } }` in queries.

---

## Database Indexes

```javascript
// Inventory
db.items.createIndex({ itemCode: 1 }, { unique: true })
db.items.createIndex({ status: 1, itemType: 1 })
db.warehouses.createIndex({ name: 1 }, { unique: true })
db.stockEntries.createIndex({ postingDate: -1, status: 1 })
db.stockLedger.createIndex({ itemId: 1, warehouseId: 1, postingDate: -1 })

// Buying
db.suppliers.createIndex({ name: 1 }, { unique: true })
db.purchaseOrders.createIndex({ supplierId: 1, status: 1 })
db.materialRequests.createIndex({ status: 1, transactionDate: -1 })

// Support
db.tickets.createIndex({ status: 1, priority: 1 })
db.tickets.createIndex({ assignedTo: 1, status: 1 })

// Quality
db.qualityInspections.createIndex({ referenceType: 1, referenceId: 1 })
db.qualityInspections.createIndex({ itemId: 1, inspectionDate: -1 })

// Manufacturing
db.boms.createIndex({ itemId: 1, isDefault: 1 })
db.workOrders.createIndex({ status: 1, plannedStartDate: 1 })

// Assets
db.assets.createIndex({ assetCategory: 1, status: 1 })
db.assets.createIndex({ custodian: 1 })

// Subcontracting
db.subcontractingOrders.createIndex({ supplierId: 1, status: 1 })
```

---

## Implementation Priority

### Week 1-2: Inventory
- Items CRUD with stock settings
- Warehouses CRUD
- Stock Entries with submit/cancel
- Stock Ledger (auto-populated)

### Week 3-4: Buying
- Suppliers CRUD
- Purchase Orders with workflow
- Material Requests
- RFQs

### Week 5: Support
- Tickets with communications
- SLAs with time tracking

### Week 6: Quality & Manufacturing
- Quality Inspections
- BOMs and Work Orders

### Week 7: Assets & Subcontracting
- Assets with depreciation
- Subcontracting Orders

# Backend Implementation Guide - Part 1: Sales Module

This guide provides complete backend API specifications for all new Sales & Finance features implemented in the TRAF3LI Dashboard.

---

## Table of Contents - Part 1

1. [Sales Orders](#1-sales-orders)
2. [Delivery Notes](#2-delivery-notes)
3. [Price Lists](#3-price-lists)
4. [Pricing Rules](#4-pricing-rules)
5. [Down Payments](#5-down-payments)
6. [Returns/RMA](#6-returnsrma)
7. [Commission Management](#7-commission-management)
8. [Sales Settings](#8-sales-settings)

---

## 1. Sales Orders

### Database Schema

```javascript
// MongoDB Schema: SalesOrder
const SalesOrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  orderDate: { type: Date, required: true, default: Date.now },

  // Source
  quoteId: { type: Schema.Types.ObjectId, ref: 'Quote' },
  quoteNumber: String,

  // Customer
  customerId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  customerName: String,
  customerNameAr: String,
  billingAddressId: Schema.Types.ObjectId,
  billingAddress: {
    addressLine1: String,
    addressLine1Ar: String,
    city: String,
    cityAr: String,
    country: String,
    postalCode: String
  },
  shippingAddressId: Schema.Types.ObjectId,
  shippingAddress: {
    addressLine1: String,
    addressLine1Ar: String,
    city: String,
    cityAr: String,
    country: String,
    postalCode: String
  },
  contactPersonId: Schema.Types.ObjectId,
  contactPerson: String,

  // Status
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'in_progress', 'partially_shipped', 'shipped',
           'partially_invoiced', 'invoiced', 'completed', 'cancelled', 'on_hold'],
    default: 'draft'
  },

  // Items
  items: [{
    _id: Schema.Types.ObjectId,
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    productNameAr: String,
    description: String,
    descriptionAr: String,
    quantity: { type: Number, required: true },
    unit: String,
    unitPrice: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 15 },
    taxAmount: Number,
    total: Number,
    quantityDelivered: { type: Number, default: 0 },
    quantityInvoiced: { type: Number, default: 0 },
    quantityRemaining: Number,
    warehouseId: Schema.Types.ObjectId,
    expectedDeliveryDate: Date,
    notes: String
  }],

  // Pricing
  subtotal: { type: Number, required: true },
  discountType: { type: String, enum: ['percentage', 'amount'], default: 'percentage' },
  discountValue: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxableAmount: Number,
  taxRate: { type: Number, default: 15 },
  taxAmount: Number,
  shippingCost: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },

  // Payment
  paymentTerms: String,
  paymentTermsDays: Number,
  advancePaid: { type: Number, default: 0 },
  advanceInvoiceId: Schema.Types.ObjectId,
  balanceDue: Number,

  // Delivery
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  deliveryMethod: String,
  shippingCarrier: String,
  incoterms: String,

  // Sales
  salesPersonId: { type: Schema.Types.ObjectId, ref: 'SalesPerson' },
  salesPersonName: String,
  salesTeamId: Schema.Types.ObjectId,
  territoryId: Schema.Types.ObjectId,
  campaignId: Schema.Types.ObjectId,

  // Linked Documents
  deliveryNoteIds: [{ type: Schema.Types.ObjectId, ref: 'DeliveryNote' }],
  invoiceIds: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }],
  downPaymentInvoiceIds: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }],

  // Progress (calculated)
  deliveryProgress: { type: Number, default: 0 },
  invoicingProgress: { type: Number, default: 0 },

  // Notes
  notes: String,
  notesAr: String,
  internalNotes: String,
  termsAndConditions: String,
  termsAndConditionsAr: String,

  // Cancellation
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: Schema.Types.ObjectId,

  // Metadata
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: Schema.Types.ObjectId
}, { timestamps: true });

// Indexes
SalesOrderSchema.index({ firmId: 1, orderNumber: 1 });
SalesOrderSchema.index({ firmId: 1, customerId: 1 });
SalesOrderSchema.index({ firmId: 1, status: 1 });
SalesOrderSchema.index({ firmId: 1, orderDate: -1 });
```

### API Endpoints

```
Base URL: /api/v1/sales-orders
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all sales orders with filters |
| GET | `/:id` | Get sales order by ID |
| POST | `/` | Create new sales order |
| PUT | `/:id` | Update sales order |
| DELETE | `/:id` | Delete sales order (draft only) |
| POST | `/:id/confirm` | Confirm sales order |
| POST | `/:id/cancel` | Cancel sales order |
| POST | `/from-quote/:quoteId` | Create from quote |
| POST | `/:id/delivery-note` | Create delivery note |
| POST | `/:id/invoice` | Create invoice |
| GET | `/stats` | Get statistics |
| GET | `/:id/pdf` | Generate PDF |

### Request/Response Examples

#### GET /api/v1/sales-orders

**Query Parameters:**
```
?status=confirmed,in_progress
&customerId=64abc123...
&salesPersonId=64def456...
&startDate=2024-01-01
&endDate=2024-12-31
&search=SO-2024
&page=1
&limit=20
&sortBy=orderDate
&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "64abc123...",
        "orderNumber": "SO-2024-0001",
        "orderDate": "2024-01-15T10:30:00Z",
        "customerId": "64cust123...",
        "customerName": "Acme Corp",
        "customerNameAr": "شركة أكمي",
        "status": "confirmed",
        "totalAmount": 15000,
        "currency": "SAR",
        "deliveryProgress": 50,
        "invoicingProgress": 25,
        "items": [...],
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### POST /api/v1/sales-orders

**Request Body:**
```json
{
  "quoteId": "64quote123...",
  "customerId": "64cust123...",
  "billingAddressId": "64addr123...",
  "shippingAddressId": "64addr456...",
  "items": [
    {
      "productId": "64prod123...",
      "quantity": 10,
      "unitPrice": 1000,
      "discountPercent": 5,
      "taxRate": 15
    }
  ],
  "paymentTerms": "net_30",
  "expectedDeliveryDate": "2024-02-15",
  "salesPersonId": "64sales123...",
  "notes": "Rush order",
  "notesAr": "طلب عاجل"
}
```

#### POST /api/v1/sales-orders/:id/confirm

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64abc123...",
      "orderNumber": "SO-2024-0001",
      "status": "confirmed",
      "confirmedAt": "2024-01-15T11:00:00Z"
    }
  },
  "message": "Order confirmed successfully",
  "messageAr": "تم تأكيد الطلب بنجاح"
}
```

#### POST /api/v1/sales-orders/from-quote/:quoteId

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64neworder...",
      "orderNumber": "SO-2024-0002",
      "quoteId": "64quote123...",
      "quoteNumber": "QT-2024-0015",
      "status": "draft",
      "items": [...],
      "totalAmount": 15000
    }
  },
  "message": "Sales order created from quote",
  "messageAr": "تم إنشاء أمر البيع من عرض السعر"
}
```

---

## 2. Delivery Notes

### Database Schema

```javascript
// MongoDB Schema: DeliveryNote
const DeliveryNoteSchema = new Schema({
  deliveryNumber: { type: String, required: true, unique: true },
  deliveryDate: { type: Date, required: true, default: Date.now },

  // Source
  salesOrderId: { type: Schema.Types.ObjectId, ref: 'SalesOrder', required: true },
  salesOrderNumber: String,

  // Customer
  customerId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  customerName: String,
  customerNameAr: String,
  shippingAddressId: Schema.Types.ObjectId,
  shippingAddress: {
    addressLine1: String,
    addressLine1Ar: String,
    city: String,
    cityAr: String,
    country: String,
    postalCode: String,
    latitude: Number,
    longitude: Number
  },
  contactPersonId: Schema.Types.ObjectId,
  contactPerson: String,
  contactPhone: String,

  // Status
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'picking', 'packed', 'in_transit',
           'delivered', 'partially_delivered', 'cancelled', 'returned'],
    default: 'draft'
  },

  // Items
  items: [{
    _id: Schema.Types.ObjectId,
    salesOrderItemId: Schema.Types.ObjectId,
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    productNameAr: String,
    description: String,
    quantityOrdered: Number,
    quantityToDeliver: { type: Number, required: true },
    quantityDelivered: { type: Number, default: 0 },
    unit: String,
    warehouseId: Schema.Types.ObjectId,
    warehouseName: String,
    serialNumbers: [String],
    batchNumber: String,
    notes: String
  }],

  // Shipping
  carrier: String,
  carrierService: String,
  trackingNumber: String,
  trackingUrl: String,
  shippingMethod: String,
  shippingCost: Number,
  weight: Number,
  weightUnit: { type: String, default: 'kg' },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm' }
  },
  numberOfPackages: { type: Number, default: 1 },

  // Dates
  scheduledDate: Date,
  shippedDate: Date,
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,

  // Proof of Delivery
  receivedBy: String,
  receivedByTitle: String,
  signatureUrl: String,
  deliveryProofUrl: String,
  deliveryPhotos: [String],

  // Vehicle (if own fleet)
  vehicleId: Schema.Types.ObjectId,
  vehiclePlate: String,
  driverId: Schema.Types.ObjectId,
  driverName: String,
  driverPhone: String,

  // Notes
  notes: String,
  notesAr: String,
  internalNotes: String,
  specialInstructions: String,

  // Link to invoice
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  invoiceNumber: String,

  // History
  history: [{
    action: String,
    performedBy: Schema.Types.ObjectId,
    performedByName: String,
    timestamp: { type: Date, default: Date.now },
    details: String,
    location: {
      lat: Number,
      lng: Number
    }
  }],

  // Metadata
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Indexes
DeliveryNoteSchema.index({ firmId: 1, deliveryNumber: 1 });
DeliveryNoteSchema.index({ firmId: 1, salesOrderId: 1 });
DeliveryNoteSchema.index({ firmId: 1, status: 1 });
DeliveryNoteSchema.index({ firmId: 1, deliveryDate: -1 });
```

### API Endpoints

```
Base URL: /api/v1/delivery-notes
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all delivery notes |
| GET | `/:id` | Get delivery note by ID |
| POST | `/` | Create delivery note |
| PUT | `/:id` | Update delivery note |
| DELETE | `/:id` | Delete (draft only) |
| POST | `/:id/confirm` | Confirm for shipping |
| POST | `/:id/ship` | Mark as shipped |
| POST | `/:id/deliver` | Mark as delivered |
| POST | `/:id/cancel` | Cancel delivery |
| PUT | `/:id/tracking` | Update tracking info |
| GET | `/stats` | Get statistics |
| GET | `/:id/pdf` | Generate PDF |

### Request/Response Examples

#### POST /api/v1/delivery-notes/:id/deliver

**Request Body:**
```json
{
  "receivedBy": "Ahmed Mohammed",
  "receivedByTitle": "Warehouse Manager",
  "signatureUrl": "https://storage.example.com/signatures/sig123.png",
  "deliveryPhotos": [
    "https://storage.example.com/photos/photo1.jpg"
  ],
  "actualDeliveryDate": "2024-01-20T14:30:00Z",
  "notes": "Delivered to main gate"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deliveryNote": {
      "_id": "64del123...",
      "deliveryNumber": "DN-2024-0001",
      "status": "delivered",
      "actualDeliveryDate": "2024-01-20T14:30:00Z",
      "receivedBy": "Ahmed Mohammed"
    }
  },
  "message": "Delivery confirmed",
  "messageAr": "تم تأكيد التسليم"
}
```

---

## 3. Price Lists

### Database Schema

```javascript
// MongoDB Schema: PriceList
const PriceListSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  nameAr: String,
  description: String,
  descriptionAr: String,

  type: { type: String, enum: ['selling', 'buying', 'both'], default: 'selling' },
  currency: { type: String, default: 'SAR' },

  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Validity
  validFrom: Date,
  validTo: Date,

  // Inheritance
  basedOnPriceListId: { type: Schema.Types.ObjectId, ref: 'PriceList' },
  basedOnPriceListName: String,

  // Modifiers
  discountPercent: { type: Number, default: 0 },
  markupPercent: { type: Number, default: 0 },
  roundingMethod: { type: String, enum: ['none', 'up', 'down', 'nearest'], default: 'none' },
  roundingPrecision: { type: Number, default: 2 },

  // Restrictions
  customerGroupIds: [Schema.Types.ObjectId],
  customerIds: [Schema.Types.ObjectId],
  territoryIds: [Schema.Types.ObjectId],

  priority: { type: Number, default: 10 },

  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// MongoDB Schema: PriceListItem
const PriceListItemSchema = new Schema({
  priceListId: { type: Schema.Types.ObjectId, ref: 'PriceList', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  productCode: String,

  price: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },

  // Quantity breaks
  minQuantity: { type: Number, default: 1 },
  maxQuantity: Number,

  // Validity
  validFrom: Date,
  validTo: Date,

  // Overrides
  discountPercent: Number,
  marginPercent: Number,

  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true }
}, { timestamps: true });

// Indexes
PriceListItemSchema.index({ priceListId: 1, productId: 1, minQuantity: 1 });
```

### API Endpoints

```
Base URL: /api/v1/price-lists
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all price lists |
| GET | `/:id` | Get price list by ID |
| POST | `/` | Create price list |
| PUT | `/:id` | Update price list |
| DELETE | `/:id` | Delete price list |
| POST | `/:id/duplicate` | Duplicate price list |
| PATCH | `/:id/toggle-active` | Toggle active status |
| GET | `/:id/items` | Get price list items |
| POST | `/:id/items` | Add item to list |
| PUT | `/:id/items/:itemId` | Update item |
| DELETE | `/:id/items/:itemId` | Remove item |
| POST | `/:id/items/bulk` | Bulk import items |
| POST | `/calculate` | Calculate price |
| GET | `/applicable` | Get applicable lists for customer |

### Price Calculation Logic

```javascript
// POST /api/v1/price-lists/calculate
// Request:
{
  "productId": "64prod123...",
  "quantity": 10,
  "customerId": "64cust123...",
  "customerGroupId": "64group123...",
  "priceListId": null, // Optional: force specific list
  "date": "2024-01-15",
  "currency": "SAR"
}

// Response:
{
  "success": true,
  "data": {
    "basePrice": 1000,
    "finalPrice": 900,
    "discount": 100,
    "discountPercent": 10,
    "priceListId": "64pl123...",
    "priceListName": "VIP Customer List",
    "appliedRules": [
      "VIP discount: 10%",
      "Quantity break: 5% for 10+ units"
    ],
    "currency": "SAR",
    "quantityBreak": {
      "min": 10,
      "max": 50
    }
  }
}
```

---

## 4. Pricing Rules

### Database Schema

```javascript
// MongoDB Schema: PricingRule
const PricingRuleSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  nameAr: String,
  description: String,
  descriptionAr: String,

  type: {
    type: String,
    enum: ['discount', 'price_override', 'markup', 'promotional'],
    default: 'discount'
  },
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 10 },

  // What it applies to
  applyOn: {
    type: String,
    enum: ['item_code', 'item_group', 'brand', 'all_items'],
    default: 'all_items'
  },
  itemCodes: [String],
  itemGroups: [String],
  brands: [String],

  // Conditions
  conditions: [{
    field: {
      type: String,
      enum: ['quantity', 'amount', 'customer', 'customer_group',
             'territory', 'campaign', 'date', 'day_of_week']
    },
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'greater_than', 'less_than',
             'between', 'in', 'not_in']
    },
    value: Schema.Types.Mixed,
    value2: Schema.Types.Mixed
  }],
  matchAllConditions: { type: Boolean, default: true },

  // Discount/Markup
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'fixed_price'],
    default: 'percentage'
  },
  discountValue: { type: Number, required: true },
  maxDiscountAmount: Number,

  // Quantity/Amount thresholds
  minQuantity: Number,
  maxQuantity: Number,
  minAmount: Number,
  maxAmount: Number,

  // Validity
  validFrom: Date,
  validTo: Date,

  // Applicability
  applicableToCustomerGroups: [Schema.Types.ObjectId],
  applicableToCustomers: [Schema.Types.ObjectId],
  applicableToTerritories: [Schema.Types.ObjectId],
  applicableToPriceLists: [Schema.Types.ObjectId],

  // Exclusions
  excludeItemCodes: [String],
  excludeItemGroups: [String],
  excludeCustomers: [Schema.Types.ObjectId],

  // Usage limits
  usageLimit: Number,
  usageCount: { type: Number, default: 0 },
  usageLimitPerCustomer: Number,

  // Stacking
  canStackWithOtherRules: { type: Boolean, default: true },

  // Promo code
  promotionCode: String,
  requiresPromoCode: { type: Boolean, default: false },

  // Buy X Get Y
  rewardType: { type: String, enum: ['free_item', 'discount_on_item'] },
  rewardItemCode: String,
  rewardQuantity: Number,
  rewardDiscount: Number,

  notes: String,
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

### API Endpoints

```
Base URL: /api/v1/pricing-rules
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all pricing rules |
| GET | `/:id` | Get rule by ID |
| POST | `/` | Create rule |
| PUT | `/:id` | Update rule |
| DELETE | `/:id` | Delete rule |
| PATCH | `/:id/toggle-active` | Toggle active |
| POST | `/:id/duplicate` | Duplicate rule |
| POST | `/apply` | Apply rules to cart |
| POST | `/validate-promo` | Validate promo code |
| GET | `/stats` | Get rule statistics |

---

## 5. Down Payments

### Database Schema

```javascript
// MongoDB Schema: DownPayment
const DownPaymentSchema = new Schema({
  downPaymentNumber: { type: String, required: true, unique: true },

  // Type
  type: { type: String, enum: ['percentage', 'fixed_amount'], required: true },
  percentageValue: Number,
  fixedAmount: Number,

  // Calculated amount
  amount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },

  // Source document
  sourceType: { type: String, enum: ['quote', 'sales_order'], required: true },
  sourceId: { type: Schema.Types.ObjectId, required: true },
  sourceNumber: String,
  sourceTotalAmount: Number,

  // Customer
  customerId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  customerName: String,
  customerNameAr: String,

  // Invoice for down payment
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  invoiceNumber: String,
  invoiceDate: Date,

  // Payment tracking
  status: {
    type: String,
    enum: ['draft', 'pending', 'paid', 'partially_applied',
           'fully_applied', 'refunded', 'cancelled'],
    default: 'draft'
  },
  paidAmount: { type: Number, default: 0 },
  paidDate: Date,
  paymentMethod: String,
  paymentReference: String,

  // Application to invoices
  applications: [{
    _id: Schema.Types.ObjectId,
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    invoiceNumber: String,
    invoiceDate: Date,
    invoiceTotal: Number,
    appliedAmount: Number,
    appliedDate: Date,
    appliedBy: Schema.Types.ObjectId
  }],
  appliedAmount: { type: Number, default: 0 },
  remainingAmount: Number,

  // Dates
  requestedDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },

  // VAT
  vatRate: { type: Number, default: 15 },
  vatAmount: Number,
  amountExcludingVat: Number,

  // Terms
  termsAndConditions: String,
  termsAndConditionsAr: String,

  // Notes
  notes: String,
  notesAr: String,
  internalNotes: String,

  // Refund
  refundAmount: Number,
  refundDate: Date,
  refundReason: String,
  refundInvoiceId: Schema.Types.ObjectId,

  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

### API Endpoints

```
Base URL: /api/v1/down-payments
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all down payments |
| GET | `/:id` | Get by ID |
| POST | `/` | Create down payment |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Delete (draft only) |
| POST | `/:id/generate-invoice` | Generate invoice |
| POST | `/:id/record-payment` | Record payment |
| POST | `/:id/apply` | Apply to invoice |
| POST | `/:id/refund` | Process refund |
| GET | `/stats` | Get statistics |
| GET | `/customer/:customerId` | Get customer's down payments |
| GET | `/available-for/:invoiceId` | Get available for invoice |

---

## 6. Returns/RMA

### Database Schema

```javascript
// MongoDB Schema: ReturnOrder
const ReturnOrderSchema = new Schema({
  returnNumber: { type: String, required: true, unique: true },

  // Source
  sourceType: { type: String, enum: ['sales_order', 'invoice', 'delivery_note'], required: true },
  sourceId: { type: Schema.Types.ObjectId, required: true },
  sourceNumber: String,
  sourceDate: Date,

  // Customer
  customerId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  customerName: String,
  customerNameAr: String,
  customerEmail: String,
  customerPhone: String,

  // Status
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'rejected', 'received',
           'inspected', 'processed', 'refunded', 'cancelled'],
    default: 'draft'
  },

  // Items
  items: [{
    _id: Schema.Types.ObjectId,
    originalLineItemId: Schema.Types.ObjectId,
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    productNameAr: String,
    productCode: String,
    orderedQuantity: Number,
    returnQuantity: { type: Number, required: true },
    unitPrice: Number,
    totalPrice: Number,
    itemReason: String,
    itemReasonDetail: String,
    inspectionResult: {
      type: String,
      enum: ['acceptable', 'damaged', 'used', 'missing_parts', 'different_item']
    },
    inspectionNotes: String,
    resolution: String,
    refundAmount: Number,
    serialNumbers: [String],
    batchNumbers: [String],
    disposition: {
      type: String,
      enum: ['return_to_stock', 'scrap', 'vendor_return', 'refurbish']
    }
  }],

  // Reason
  reason: {
    type: String,
    enum: ['defective', 'wrong_item', 'not_as_described', 'changed_mind',
           'duplicate_order', 'late_delivery', 'quality_issue', 'other'],
    required: true
  },
  reasonDetail: String,
  reasonDetailAr: String,

  // Resolution
  requestedResolution: {
    type: String,
    enum: ['refund', 'replacement', 'credit_note', 'repair', 'exchange', 'reject'],
    required: true
  },
  actualResolution: String,
  resolutionNotes: String,

  // Amounts
  originalAmount: Number,
  returnAmount: Number,
  restockingFee: Number,
  restockingFeePercent: Number,
  refundAmount: Number,
  currency: { type: String, default: 'SAR' },

  // Logistics
  returnShippingMethod: String,
  returnTrackingNumber: String,
  returnCarrier: String,
  returnShippingCost: Number,
  returnShippingPaidBy: { type: String, enum: ['customer', 'company'], default: 'customer' },

  // Pickup
  pickupRequired: { type: Boolean, default: false },
  pickupAddress: {
    addressLine1: String,
    city: String,
    country: String,
    postalCode: String
  },
  pickupScheduledDate: Date,
  pickupCompletedDate: Date,

  // Receipt
  receivedDate: Date,
  receivedBy: Schema.Types.ObjectId,
  receivedCondition: String,
  receivedPhotos: [String],

  // Inspection
  inspectionDate: Date,
  inspectedBy: Schema.Types.ObjectId,
  inspectionResult: String,
  inspectionNotes: String,
  inspectionPhotos: [String],

  // Approval
  approvalRequired: { type: Boolean, default: true },
  approvedBy: Schema.Types.ObjectId,
  approvedDate: Date,
  rejectedBy: Schema.Types.ObjectId,
  rejectedDate: Date,
  rejectionReason: String,

  // Generated Documents
  creditNoteId: { type: Schema.Types.ObjectId, ref: 'CreditNote' },
  creditNoteNumber: String,
  replacementOrderId: { type: Schema.Types.ObjectId, ref: 'SalesOrder' },
  replacementOrderNumber: String,
  refundPaymentId: Schema.Types.ObjectId,

  // Dates
  requestedDate: { type: Date, default: Date.now },
  expiryDate: Date,
  processedDate: Date,

  // Notes
  customerNotes: String,
  internalNotes: String,

  // History
  history: [{
    action: String,
    performedBy: Schema.Types.ObjectId,
    performedByName: String,
    timestamp: { type: Date, default: Date.now },
    details: String,
    oldStatus: String,
    newStatus: String
  }],

  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

### API Endpoints

```
Base URL: /api/v1/returns
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all returns |
| GET | `/:id` | Get return by ID |
| POST | `/` | Create return |
| PUT | `/:id` | Update return |
| DELETE | `/:id` | Delete (draft only) |
| POST | `/:id/submit` | Submit for approval |
| POST | `/:id/approve` | Approve return |
| POST | `/:id/reject` | Reject return |
| POST | `/:id/receive` | Mark as received |
| POST | `/:id/inspect` | Record inspection |
| POST | `/:id/process` | Process return |
| POST | `/:id/generate-credit-note` | Generate credit note |
| POST | `/:id/create-replacement` | Create replacement order |
| POST | `/:id/refund` | Process refund |
| POST | `/:id/cancel` | Cancel return |
| GET | `/stats` | Get statistics |
| GET | `/policies` | Get return policies |
| POST | `/policies` | Create policy |
| PUT | `/policies/:id` | Update policy |
| POST | `/check-eligibility` | Check return eligibility |

---

## 7. Commission Management

### Database Schema

```javascript
// MongoDB Schema: CommissionPlan
const CommissionPlanSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  nameAr: String,
  description: String,

  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },

  basis: {
    type: String,
    enum: ['invoice_amount', 'payment_received', 'order_amount', 'gross_profit'],
    default: 'invoice_amount'
  },

  // Rate structure
  rateType: { type: String, enum: ['flat', 'tiered', 'product_based'], default: 'flat' },
  flatRate: Number,

  // Tiered rates
  tiers: [{
    minAmount: Number,
    maxAmount: Number,
    rate: Number
  }],

  // Product-based rates
  productRates: [{
    productId: Schema.Types.ObjectId,
    productName: String,
    rate: Number
  }],
  categoryRates: [{
    categoryId: Schema.Types.ObjectId,
    categoryName: String,
    rate: Number
  }],

  // Caps and floors
  minCommission: Number,
  maxCommission: Number,

  // Team split
  enableTeamSplit: { type: Boolean, default: false },
  managerSharePercent: Number,

  // Applicable to
  applicableToSalesPersons: [Schema.Types.ObjectId],
  applicableToTeams: [Schema.Types.ObjectId],
  applicableToTerritories: [Schema.Types.ObjectId],

  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// MongoDB Schema: CommissionSettlement
const CommissionSettlementSchema = new Schema({
  settlementNumber: { type: String, required: true, unique: true },

  // Period
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  periodLabel: String,

  status: {
    type: String,
    enum: ['pending', 'calculated', 'approved', 'paid', 'cancelled'],
    default: 'pending'
  },

  // Sales Person
  salesPersonId: { type: Schema.Types.ObjectId, ref: 'SalesPerson', required: true },
  salesPersonName: String,
  salesPersonNameAr: String,

  // Plan
  commissionPlanId: { type: Schema.Types.ObjectId, ref: 'CommissionPlan', required: true },
  commissionPlanName: String,

  // Amounts
  totalSalesAmount: Number,
  totalCommissionableAmount: Number,
  grossCommission: Number,
  adjustments: [{
    type: { type: String, enum: ['bonus', 'deduction', 'clawback', 'manual'] },
    description: String,
    amount: Number,
    approvedBy: Schema.Types.ObjectId
  }],
  netCommission: Number,
  currency: { type: String, default: 'SAR' },

  // Line items
  lineItems: [{
    sourceType: { type: String, enum: ['invoice', 'payment', 'order'] },
    sourceId: Schema.Types.ObjectId,
    sourceNumber: String,
    sourceDate: Date,
    customerId: Schema.Types.ObjectId,
    customerName: String,
    productId: Schema.Types.ObjectId,
    productName: String,
    amount: Number,
    commissionRate: Number,
    commissionAmount: Number,
    isIncluded: { type: Boolean, default: true },
    exclusionReason: String
  }],

  // Team split
  teamSplit: {
    managerSalesPersonId: Schema.Types.ObjectId,
    managerName: String,
    managerShare: Number,
    representativeShare: Number
  },

  // Approval
  submittedAt: Date,
  submittedBy: Schema.Types.ObjectId,
  approvedAt: Date,
  approvedBy: Schema.Types.ObjectId,
  approverComments: String,

  // Payment
  paidAt: Date,
  paidBy: Schema.Types.ObjectId,
  paymentMethod: String,
  paymentReference: String,
  paymentInvoiceId: Schema.Types.ObjectId,

  notes: String,
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

### API Endpoints

```
Base URL: /api/v1/commissions
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/plans` | Get all commission plans |
| GET | `/plans/:id` | Get plan by ID |
| POST | `/plans` | Create plan |
| PUT | `/plans/:id` | Update plan |
| DELETE | `/plans/:id` | Delete plan |
| GET | `/settlements` | Get all settlements |
| GET | `/settlements/:id` | Get settlement by ID |
| POST | `/settlements/calculate` | Calculate settlement |
| POST | `/settlements/:id/recalculate` | Recalculate |
| POST | `/settlements/:id/adjustments` | Add adjustment |
| DELETE | `/settlements/:id/adjustments/:adjId` | Remove adjustment |
| POST | `/settlements/:id/submit` | Submit for approval |
| POST | `/settlements/:id/approve` | Approve |
| POST | `/settlements/:id/reject` | Reject |
| POST | `/settlements/:id/pay` | Mark as paid |
| GET | `/stats` | Get commission statistics |
| GET | `/salesperson/:id/history` | Get salesperson history |
| POST | `/settlements/bulk-generate` | Bulk generate |

---

## 8. Sales Settings

### Database Schema

```javascript
// MongoDB Schema: SalesSettings
const SalesSettingsSchema = new Schema({
  firmId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true, unique: true },

  general: {
    defaultCurrency: { type: String, default: 'SAR' },
    defaultPaymentTerms: { type: String, default: 'net_30' },
    defaultPaymentTermsDays: { type: Number, default: 30 },
    requireCustomerOnQuote: { type: Boolean, default: true },
    requireCustomerOnOrder: { type: Boolean, default: true },
    allowNegativePrices: { type: Boolean, default: false },
    roundingMethod: { type: String, enum: ['none', 'up', 'down', 'nearest'], default: 'nearest' },
    roundingPrecision: { type: Number, default: 2 }
  },

  quotes: {
    defaultValidityDays: { type: Number, default: 30 },
    autoNumbering: { type: Boolean, default: true },
    numberPrefix: { type: String, default: 'QT-' },
    numberFormat: { type: String, default: 'YYYY-NNNN' },
    requireApproval: { type: Boolean, default: false },
    approvalThreshold: Number,
    approvers: [Schema.Types.ObjectId],
    sendReminderBeforeExpiry: { type: Boolean, default: true },
    reminderDaysBefore: { type: Number, default: 3 },
    allowConvertToOrder: { type: Boolean, default: true },
    allowConvertToInvoice: { type: Boolean, default: true }
  },

  orders: {
    autoNumbering: { type: Boolean, default: true },
    numberPrefix: { type: String, default: 'SO-' },
    numberFormat: { type: String, default: 'YYYY-NNNN' },
    requireApproval: { type: Boolean, default: false },
    approvalThreshold: Number,
    approvers: [Schema.Types.ObjectId],
    allowPartialDelivery: { type: Boolean, default: true },
    allowPartialInvoicing: { type: Boolean, default: true },
    autoCreateDeliveryNote: { type: Boolean, default: false },
    requireDeliveryBeforeInvoice: { type: Boolean, default: false },
    allowBackorders: { type: Boolean, default: true }
  },

  pricing: {
    defaultPriceListId: Schema.Types.ObjectId,
    allowPriceOverride: { type: Boolean, default: true },
    requirePriceOverrideReason: { type: Boolean, default: false },
    showCostPrice: { type: Boolean, default: false },
    showMargin: { type: Boolean, default: true },
    minimumMarginPercent: { type: Number, default: 10 },
    warnBelowMinimumMargin: { type: Boolean, default: true },
    enforcePriceList: { type: Boolean, default: false }
  },

  discounts: {
    maxLineDiscountPercent: { type: Number, default: 20 },
    maxOrderDiscountPercent: { type: Number, default: 15 },
    requireDiscountApproval: { type: Boolean, default: false },
    discountApprovalThreshold: { type: Number, default: 10 },
    discountApprovers: [Schema.Types.ObjectId],
    allowCouponCodes: { type: Boolean, default: true },
    allowLoyaltyRedemption: { type: Boolean, default: false }
  },

  commissions: {
    enabled: { type: Boolean, default: true },
    defaultPlanId: Schema.Types.ObjectId,
    calculateOn: { type: String, enum: ['invoice', 'payment', 'order'], default: 'invoice' },
    autoCalculate: { type: Boolean, default: true },
    settlementFrequency: { type: String, enum: ['monthly', 'quarterly'], default: 'monthly' },
    requireApproval: { type: Boolean, default: true },
    approvers: [Schema.Types.ObjectId]
  },

  delivery: {
    defaultShippingMethod: String,
    defaultCarrier: String,
    trackDeliveries: { type: Boolean, default: true },
    requireDeliveryConfirmation: { type: Boolean, default: true },
    allowPartialDelivery: { type: Boolean, default: true },
    calculateShippingCost: { type: Boolean, default: false },
    freeShippingThreshold: Number
  },

  returns: {
    enabled: { type: Boolean, default: true },
    defaultReturnWindowDays: { type: Number, default: 30 },
    requireApproval: { type: Boolean, default: true },
    approvalThreshold: Number,
    approvers: [Schema.Types.ObjectId],
    defaultRestockingFeePercent: { type: Number, default: 10 },
    autoCreateCreditNote: { type: Boolean, default: true },
    requireInspection: { type: Boolean, default: true }
  },

  tax: {
    defaultTaxRate: { type: Number, default: 15 },
    taxIncludedInPrice: { type: Boolean, default: false },
    calculateTaxOnDiscount: { type: Boolean, default: true },
    roundTaxPerLine: { type: Boolean, default: false },
    taxRoundingMethod: { type: String, enum: ['up', 'down', 'nearest'], default: 'nearest' }
  },

  documents: {
    quoteTemplate: String,
    orderTemplate: String,
    deliveryNoteTemplate: String,
    invoiceTemplate: String,
    defaultLanguage: { type: String, enum: ['en', 'ar', 'both'], default: 'both' },
    showLogo: { type: Boolean, default: true },
    showTermsAndConditions: { type: Boolean, default: true },
    defaultTermsAndConditions: String,
    defaultTermsAndConditionsAr: String
  },

  sequences: {
    quoteSequence: {
      prefix: { type: String, default: 'QT-' },
      suffix: String,
      padding: { type: Number, default: 4 },
      currentNumber: { type: Number, default: 0 },
      resetPeriod: { type: String, enum: ['never', 'yearly', 'monthly'], default: 'yearly' },
      includeYear: { type: Boolean, default: true },
      includeMonth: { type: Boolean, default: false }
    },
    orderSequence: {
      prefix: { type: String, default: 'SO-' },
      suffix: String,
      padding: { type: Number, default: 4 },
      currentNumber: { type: Number, default: 0 },
      resetPeriod: { type: String, enum: ['never', 'yearly', 'monthly'], default: 'yearly' },
      includeYear: { type: Boolean, default: true },
      includeMonth: { type: Boolean, default: false }
    },
    deliverySequence: {
      prefix: { type: String, default: 'DN-' },
      suffix: String,
      padding: { type: Number, default: 4 },
      currentNumber: { type: Number, default: 0 },
      resetPeriod: { type: String, enum: ['never', 'yearly', 'monthly'], default: 'yearly' },
      includeYear: { type: Boolean, default: true },
      includeMonth: { type: Boolean, default: false }
    },
    returnSequence: {
      prefix: { type: String, default: 'RMA-' },
      suffix: String,
      padding: { type: Number, default: 4 },
      currentNumber: { type: Number, default: 0 },
      resetPeriod: { type: String, enum: ['never', 'yearly', 'monthly'], default: 'yearly' },
      includeYear: { type: Boolean, default: true },
      includeMonth: { type: Boolean, default: false }
    }
  }
}, { timestamps: true });
```

### API Endpoints

```
Base URL: /api/v1/settings/sales
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all sales settings |
| PUT | `/` | Update all settings |
| PUT | `/:section` | Update specific section |
| PUT | `/reset/:section` | Reset section to defaults |
| GET | `/history` | Get settings change history |
| POST | `/export` | Export settings as JSON |
| POST | `/import` | Import settings from JSON |
| POST | `/validate` | Validate settings |

---

*Continue to Part 2 for Finance Module backend specifications...*

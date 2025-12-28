/**
 * Enhanced Product Types
 * Extended product/service model with variants, barcodes, UoM, suppliers, and more
 */

// ═══════════════════════════════════════════════════════════════
// PRODUCT ENHANCED TYPES
// ═══════════════════════════════════════════════════════════════

export type ProductType = 'product' | 'service' | 'subscription' | 'retainer' | 'bundle'
export type PriceType = 'fixed' | 'range' | 'calculated'
export type BillingType = 'hourly' | 'fixed' | 'milestone'
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type BarcodeType = 'EAN13' | 'EAN8' | 'UPC' | 'CODE128' | 'CODE39' | 'QR'
export type VariantDisplayType = 'dropdown' | 'color' | 'buttons' | 'images'
export type WarrantyType = 'manufacturer' | 'seller' | 'extended'
export type UomCategory = 'quantity' | 'weight' | 'volume' | 'length' | 'time' | 'area'

export interface ProductPricing {
  basePrice: number
  costPrice: number
  minPrice?: number
  maxPrice?: number
  currency: string
  priceType: PriceType
  marginPercent?: number // Calculated from cost
  markupPercent?: number
}

export interface ProductUom {
  salesUnit: string // e.g., "piece", "hour", "kg"
  salesUnitAr?: string
  purchaseUnit?: string
  purchaseUnitAr?: string
  conversionFactor?: number // Purchase to Sales conversion
}

export interface ProductBarcode {
  _id: string
  barcode: string
  type: BarcodeType
  isPrimary: boolean
  variantId?: string // If barcode is for specific variant
}

export interface VariantAttributeValue {
  _id: string
  value: string
  valueAr?: string
  colorCode?: string // For color display
  imageUrl?: string // For image display
}

export interface VariantAttribute {
  _id: string
  name: string
  nameAr: string
  values: VariantAttributeValue[]
  displayType: VariantDisplayType
}

export interface ProductImage {
  _id: string
  url: string
  thumbnailUrl?: string
  alt?: string
  altAr?: string
  isPrimary: boolean
  sortOrder: number
}

export interface ProductVariant {
  _id: string
  productId: string
  sku: string
  name: string
  nameAr?: string

  // Attribute combination
  attributes: { attributeId: string; valueId: string; value: string }[]

  // Variant-specific pricing
  priceAdjustment: number // Add to base price
  costPrice?: number

  // Variant-specific barcode
  barcode?: string

  // Variant-specific images
  images?: ProductImage[]

  // Variant-specific stock
  stockQuantity?: number

  isActive: boolean
}

export interface ProductSupplier {
  supplierId: string
  supplierName: string
  supplierProductCode?: string
  purchasePrice: number
  currency: string
  leadTimeDays?: number
  minimumOrderQuantity?: number
  isPrimary: boolean
}

export interface ProductWarranty {
  hasWarranty: boolean
  warrantyPeriodMonths?: number
  warrantyType?: WarrantyType
  warrantyTerms?: string
  warrantyTermsAr?: string
}

export interface ProductRecurring {
  interval: RecurringInterval
  intervalCount: number
  trialDays?: number
  setupFee?: number
}

export interface ServiceSettings {
  billingType: BillingType
  defaultHours?: number
  requireTimeTracking: boolean
}

export interface StockSettings {
  defaultWarehouseId?: string
  reorderLevel?: number
  reorderQuantity?: number
  minOrderQuantity?: number
  maxOrderQuantity?: number
  leadTimeDays?: number
}

export interface ProductStatistics {
  timesSold: number
  totalRevenue: number
  averageRating?: number
  reviewCount?: number
}

export interface ProductEnhanced {
  _id: string
  code: string
  sku?: string

  // Names
  name: string
  nameAr: string
  shortName?: string
  shortNameAr?: string

  // Descriptions
  description?: string
  descriptionAr?: string

  // Type & Category
  type: ProductType
  categoryId?: string
  categoryName?: string
  subcategoryId?: string
  brandId?: string
  brandName?: string

  // Pricing
  pricing: ProductPricing

  // Tax
  taxRate: number
  taxInclusive: boolean
  taxCategoryId?: string
  hsnSacCode?: string // HSN/SAC code for tax

  // Unit of Measure
  uom: ProductUom

  // Barcodes
  barcodes: ProductBarcode[]
  primaryBarcode?: string

  // Variants
  hasVariants: boolean
  variantAttributes?: VariantAttribute[]
  variants?: ProductVariant[]

  // Images
  images: ProductImage[]
  primaryImageUrl?: string

  // Inventory (if applicable)
  maintainStock: boolean
  stockSettings?: StockSettings

  // Serial/Batch tracking
  trackSerialNumbers: boolean
  trackBatchNumbers: boolean

  // Supplier
  suppliers?: ProductSupplier[]
  defaultSupplierId?: string

  // Warranty
  warranty?: ProductWarranty

  // Recurring (for subscriptions)
  recurring?: ProductRecurring

  // Service-specific
  serviceSettings?: ServiceSettings

  // Tags & Custom Fields
  tags: string[]
  customFields?: Record<string, any>

  // Status
  isActive: boolean
  isSellable: boolean
  isPurchasable: boolean

  // Statistics
  statistics: ProductStatistics

  // Metadata
  createdBy: string
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// UNIT OF MEASURE TYPES
// ═══════════════════════════════════════════════════════════════

export interface UnitOfMeasure {
  _id: string
  code: string
  name: string
  nameAr: string
  symbol: string
  symbolAr?: string
  category: UomCategory
  baseUnit?: string // Reference to base unit
  conversionToBase?: number
  isActive: boolean
}

export interface CreateUomData {
  code: string
  name: string
  nameAr: string
  symbol: string
  symbolAr?: string
  category: UomCategory
  baseUnit?: string
  conversionToBase?: number
  isActive?: boolean
}

export interface UpdateUomData extends Partial<CreateUomData> {}

// ═══════════════════════════════════════════════════════════════
// BRAND TYPES
// ═══════════════════════════════════════════════════════════════

export interface Brand {
  _id: string
  code: string
  name: string
  nameAr: string
  logoUrl?: string
  description?: string
  descriptionAr?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBrandData {
  code: string
  name: string
  nameAr: string
  logoUrl?: string
  description?: string
  descriptionAr?: string
  isActive?: boolean
}

export interface UpdateBrandData extends Partial<CreateBrandData> {}

// ═══════════════════════════════════════════════════════════════
// VARIANT TYPES
// ═══════════════════════════════════════════════════════════════

export interface CreateVariantData {
  productId: string
  sku: string
  name: string
  nameAr?: string
  attributes: { attributeId: string; valueId: string; value: string }[]
  priceAdjustment?: number
  costPrice?: number
  barcode?: string
  images?: Omit<ProductImage, '_id'>[]
  stockQuantity?: number
  isActive?: boolean
}

export interface UpdateVariantData extends Partial<Omit<CreateVariantData, 'productId'>> {}

export interface GenerateVariantsData {
  productId: string
  attributes: VariantAttribute[]
}

// ═══════════════════════════════════════════════════════════════
// BARCODE TYPES
// ═══════════════════════════════════════════════════════════════

export interface CreateBarcodeData {
  productId: string
  barcode: string
  type: BarcodeType
  isPrimary?: boolean
  variantId?: string
}

export interface BarcodeSearchResult {
  productId: string
  variantId?: string
  product: ProductEnhanced
  variant?: ProductVariant
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT ENHANCED CREATE/UPDATE DATA
// ═══════════════════════════════════════════════════════════════

export interface CreateProductEnhancedData {
  code: string
  sku?: string
  name: string
  nameAr: string
  shortName?: string
  shortNameAr?: string
  description?: string
  descriptionAr?: string
  type: ProductType
  categoryId?: string
  subcategoryId?: string
  brandId?: string

  // Pricing
  pricing: ProductPricing

  // Tax
  taxRate?: number
  taxInclusive?: boolean
  taxCategoryId?: string
  hsnSacCode?: string

  // UOM
  uom: ProductUom

  // Barcodes
  barcodes?: Omit<ProductBarcode, '_id'>[]

  // Variants
  hasVariants?: boolean
  variantAttributes?: VariantAttribute[]

  // Images
  images?: Omit<ProductImage, '_id'>[]

  // Inventory
  maintainStock?: boolean
  stockSettings?: StockSettings
  trackSerialNumbers?: boolean
  trackBatchNumbers?: boolean

  // Suppliers
  suppliers?: ProductSupplier[]
  defaultSupplierId?: string

  // Warranty
  warranty?: ProductWarranty

  // Recurring
  recurring?: ProductRecurring

  // Service
  serviceSettings?: ServiceSettings

  // Tags & Custom Fields
  tags?: string[]
  customFields?: Record<string, any>

  // Status
  isActive?: boolean
  isSellable?: boolean
  isPurchasable?: boolean
}

export interface UpdateProductEnhancedData extends Partial<CreateProductEnhancedData> {}

// ═══════════════════════════════════════════════════════════════
// FILTERS
// ═══════════════════════════════════════════════════════════════

export interface ProductEnhancedFilters {
  type?: ProductType
  categoryId?: string
  brandId?: string
  isActive?: boolean
  isSellable?: boolean
  isPurchasable?: boolean
  hasVariants?: boolean
  maintainStock?: boolean
  search?: string
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface BrandFilters {
  isActive?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface UomFilters {
  category?: UomCategory
  isActive?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
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

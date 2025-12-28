/**
 * Sales Settings Types
 *
 * Comprehensive sales configuration settings for pricing, discounts, commissions, returns, etc.
 * Supports bilingual configuration (Arabic/English)
 *
 * @module types/salesSettings
 */

// ═══════════════════════════════════════════════════════════════════════════
// GENERAL SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface GeneralSettings {
  /**
   * Default currency for sales transactions
   */
  defaultCurrency: string

  /**
   * Default payment terms label
   */
  defaultPaymentTerms: string

  /**
   * Default payment terms in days
   */
  defaultPaymentTermsDays: number

  /**
   * Require customer selection on quote creation
   */
  requireCustomerOnQuote: boolean

  /**
   * Require customer selection on order creation
   */
  requireCustomerOnOrder: boolean

  /**
   * Allow negative prices in line items
   */
  allowNegativePrices: boolean

  /**
   * Rounding method for calculations
   */
  roundingMethod: 'none' | 'up' | 'down' | 'nearest'

  /**
   * Number of decimal places for rounding
   */
  roundingPrecision: number
}

// ═══════════════════════════════════════════════════════════════════════════
// QUOTE SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface QuoteSettings {
  /**
   * Default validity period in days
   */
  defaultValidityDays: number

  /**
   * Enable automatic numbering for quotes
   */
  autoNumbering: boolean

  /**
   * Prefix for quote numbers
   */
  numberPrefix: string

  /**
   * Format for quote numbers (e.g., "YYYY-####")
   */
  numberFormat: string

  /**
   * Require manager approval before sending
   */
  requireApproval: boolean

  /**
   * Amount threshold that triggers approval requirement
   */
  approvalThreshold: number

  /**
   * User IDs who can approve quotes
   */
  approvers: string[]

  /**
   * Send reminder email before quote expires
   */
  sendReminderBeforeExpiry: boolean

  /**
   * Days before expiry to send reminder
   */
  reminderDaysBefore: number

  /**
   * Allow converting quote to sales order
   */
  allowConvertToOrder: boolean

  /**
   * Allow converting quote directly to invoice
   */
  allowConvertToInvoice: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface OrderSettings {
  /**
   * Enable automatic numbering for orders
   */
  autoNumbering: boolean

  /**
   * Prefix for order numbers
   */
  numberPrefix: string

  /**
   * Format for order numbers (e.g., "YYYY-####")
   */
  numberFormat: string

  /**
   * Require manager approval before processing
   */
  requireApproval: boolean

  /**
   * Amount threshold that triggers approval requirement
   */
  approvalThreshold: number

  /**
   * User IDs who can approve orders
   */
  approvers: string[]

  /**
   * Allow partial delivery of order items
   */
  allowPartialDelivery: boolean

  /**
   * Allow partial invoicing of orders
   */
  allowPartialInvoicing: boolean

  /**
   * Automatically create delivery note when order is placed
   */
  autoCreateDeliveryNote: boolean

  /**
   * Require delivery confirmation before invoicing
   */
  requireDeliveryBeforeInvoice: boolean

  /**
   * Allow backorders when items are out of stock
   */
  allowBackorders: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// PRICING SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface PricingSettings {
  /**
   * Default price list ID to use
   */
  defaultPriceListId: string

  /**
   * Allow sales reps to override prices
   */
  allowPriceOverride: boolean

  /**
   * Require reason when overriding price
   */
  requirePriceOverrideReason: boolean

  /**
   * Show cost price to sales reps
   */
  showCostPrice: boolean

  /**
   * Show margin percentage to sales reps
   */
  showMargin: boolean

  /**
   * Minimum acceptable margin percentage
   */
  minimumMarginPercent: number

  /**
   * Show warning when margin is below minimum
   */
  warnBelowMinimumMargin: boolean

  /**
   * Enforce strict price list (no overrides allowed)
   */
  enforcePriceList: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCOUNT SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface DiscountSettings {
  /**
   * Maximum discount percentage allowed per line item
   */
  maxLineDiscountPercent: number

  /**
   * Maximum discount percentage allowed on entire order
   */
  maxOrderDiscountPercent: number

  /**
   * Require approval for discounts above threshold
   */
  requireDiscountApproval: boolean

  /**
   * Discount percentage threshold for approval
   */
  discountApprovalThreshold: number

  /**
   * User IDs who can approve discount requests
   */
  discountApprovers: string[]

  /**
   * Allow customers to use coupon codes
   */
  allowCouponCodes: boolean

  /**
   * Allow loyalty points redemption
   */
  allowLoyaltyRedemption: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMISSION SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface CommissionSettings {
  /**
   * Enable commission tracking and calculation
   */
  enabled: boolean

  /**
   * Default commission plan ID
   */
  defaultPlanId: string

  /**
   * Calculate commission based on
   */
  calculateOn: 'invoice' | 'payment' | 'order'

  /**
   * Automatically calculate commissions
   */
  autoCalculate: boolean

  /**
   * How often to settle commissions
   */
  settlementFrequency: 'monthly' | 'quarterly'

  /**
   * Require manager approval before payout
   */
  requireApproval: boolean

  /**
   * User IDs who can approve commission payouts
   */
  approvers: string[]
}

// ═══════════════════════════════════════════════════════════════════════════
// DELIVERY SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface DeliverySettings {
  /**
   * Default shipping method
   */
  defaultShippingMethod: string

  /**
   * Default carrier/courier service
   */
  defaultCarrier: string

  /**
   * Enable delivery tracking
   */
  trackDeliveries: boolean

  /**
   * Require customer signature on delivery
   */
  requireDeliveryConfirmation: boolean

  /**
   * Allow partial delivery of orders
   */
  allowPartialDelivery: boolean

  /**
   * Automatically calculate shipping costs
   */
  calculateShippingCost: boolean

  /**
   * Minimum order amount for free shipping
   */
  freeShippingThreshold?: number
}

// ═══════════════════════════════════════════════════════════════════════════
// RETURN SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface ReturnSettings {
  /**
   * Enable returns functionality
   */
  enabled: boolean

  /**
   * Default return window in days
   */
  defaultReturnWindowDays: number

  /**
   * Require approval for returns
   */
  requireApproval: boolean

  /**
   * Return amount threshold for approval
   */
  approvalThreshold: number

  /**
   * User IDs who can approve returns
   */
  approvers: string[]

  /**
   * Default restocking fee percentage
   */
  defaultRestockingFeePercent: number

  /**
   * Automatically create credit note on return
   */
  autoCreateCreditNote: boolean

  /**
   * Require physical inspection before processing
   */
  requireInspection: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// TAX SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface TaxSettings {
  /**
   * Default tax rate percentage (e.g., 15 for Saudi VAT)
   */
  defaultTaxRate: number

  /**
   * Prices include tax already
   */
  taxIncludedInPrice: boolean

  /**
   * Calculate tax on discounted amount
   */
  calculateTaxOnDiscount: boolean

  /**
   * Round tax per line item instead of total
   */
  roundTaxPerLine: boolean

  /**
   * Tax rounding method
   */
  taxRoundingMethod: 'up' | 'down' | 'nearest'
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT SETTINGS
// ═══════════════════════════════════════════════════════════════════════════

export interface DocumentSettings {
  /**
   * Template ID for quote documents
   */
  quoteTemplate: string

  /**
   * Template ID for order documents
   */
  orderTemplate: string

  /**
   * Template ID for delivery note documents
   */
  deliveryNoteTemplate: string

  /**
   * Template ID for invoice documents
   */
  invoiceTemplate: string

  /**
   * Default language for documents
   */
  defaultLanguage: 'en' | 'ar' | 'both'

  /**
   * Show company logo on documents
   */
  showLogo: boolean

  /**
   * Show terms and conditions section
   */
  showTermsAndConditions: boolean

  /**
   * Default terms and conditions text (English)
   */
  defaultTermsAndConditions: string

  /**
   * Default terms and conditions text (Arabic)
   */
  defaultTermsAndConditionsAr: string
}

// ═══════════════════════════════════════════════════════════════════════════
// NUMBERING SEQUENCES
// ═══════════════════════════════════════════════════════════════════════════

export interface SequenceConfig {
  /**
   * Prefix for the sequence (e.g., "QT-")
   */
  prefix: string

  /**
   * Suffix for the sequence
   */
  suffix: string

  /**
   * Number of digits with zero padding
   */
  padding: number

  /**
   * Current sequence number
   */
  currentNumber: number

  /**
   * When to reset the sequence
   */
  resetPeriod: 'never' | 'yearly' | 'monthly'

  /**
   * Include year in the number (e.g., 2025)
   */
  includeYear: boolean

  /**
   * Include month in the number (e.g., 01)
   */
  includeMonth: boolean
}

export interface SequencesSettings {
  /**
   * Quote numbering sequence
   */
  quoteSequence: SequenceConfig

  /**
   * Order numbering sequence
   */
  orderSequence: SequenceConfig

  /**
   * Delivery note numbering sequence
   */
  deliverySequence: SequenceConfig

  /**
   * Return numbering sequence
   */
  returnSequence: SequenceConfig
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SALES SETTINGS INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

export interface SalesSettings {
  /**
   * General sales settings
   */
  general: GeneralSettings

  /**
   * Quote-specific settings
   */
  quotes: QuoteSettings

  /**
   * Order-specific settings
   */
  orders: OrderSettings

  /**
   * Pricing rules and configurations
   */
  pricing: PricingSettings

  /**
   * Discount limits and approval rules
   */
  discounts: DiscountSettings

  /**
   * Commission calculation settings
   */
  commissions: CommissionSettings

  /**
   * Delivery and shipping settings
   */
  delivery: DeliverySettings

  /**
   * Return policy settings
   */
  returns: ReturnSettings

  /**
   * Tax configuration
   */
  tax: TaxSettings

  /**
   * Document templates and formatting
   */
  documents: DocumentSettings

  /**
   * Numbering sequences for sales documents
   */
  sequences: SequencesSettings
}

// ═══════════════════════════════════════════════════════════════════════════
// UI CONFIGURATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SalesSettingsFieldOption {
  value: string
  label: string
  labelAr: string
}

export interface SalesSettingsField {
  key: string
  label: string
  labelAr: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'currency' | 'percent'
  options?: SalesSettingsFieldOption[]
  placeholder?: string
  placeholderAr?: string
  helpText?: string
  helpTextAr?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  dependsOn?: {
    field: string
    value: any
  }
}

export interface SalesSettingsSection {
  key: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  icon: string
  fields: SalesSettingsField[]
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_SEQUENCE_CONFIG: SequenceConfig = {
  prefix: '',
  suffix: '',
  padding: 4,
  currentNumber: 1,
  resetPeriod: 'yearly',
  includeYear: true,
  includeMonth: false,
}

export const DEFAULT_SALES_SETTINGS: SalesSettings = {
  general: {
    defaultCurrency: 'SAR',
    defaultPaymentTerms: 'Net 30',
    defaultPaymentTermsDays: 30,
    requireCustomerOnQuote: true,
    requireCustomerOnOrder: true,
    allowNegativePrices: false,
    roundingMethod: 'nearest',
    roundingPrecision: 2,
  },
  quotes: {
    defaultValidityDays: 30,
    autoNumbering: true,
    numberPrefix: 'QT-',
    numberFormat: 'YYYY-####',
    requireApproval: false,
    approvalThreshold: 100000,
    approvers: [],
    sendReminderBeforeExpiry: true,
    reminderDaysBefore: 7,
    allowConvertToOrder: true,
    allowConvertToInvoice: false,
  },
  orders: {
    autoNumbering: true,
    numberPrefix: 'SO-',
    numberFormat: 'YYYY-####',
    requireApproval: false,
    approvalThreshold: 100000,
    approvers: [],
    allowPartialDelivery: true,
    allowPartialInvoicing: true,
    autoCreateDeliveryNote: false,
    requireDeliveryBeforeInvoice: false,
    allowBackorders: true,
  },
  pricing: {
    defaultPriceListId: '',
    allowPriceOverride: true,
    requirePriceOverrideReason: true,
    showCostPrice: false,
    showMargin: true,
    minimumMarginPercent: 10,
    warnBelowMinimumMargin: true,
    enforcePriceList: false,
  },
  discounts: {
    maxLineDiscountPercent: 20,
    maxOrderDiscountPercent: 15,
    requireDiscountApproval: true,
    discountApprovalThreshold: 10,
    discountApprovers: [],
    allowCouponCodes: true,
    allowLoyaltyRedemption: false,
  },
  commissions: {
    enabled: true,
    defaultPlanId: '',
    calculateOn: 'invoice',
    autoCalculate: true,
    settlementFrequency: 'monthly',
    requireApproval: true,
    approvers: [],
  },
  delivery: {
    defaultShippingMethod: 'Standard',
    defaultCarrier: '',
    trackDeliveries: true,
    requireDeliveryConfirmation: true,
    allowPartialDelivery: true,
    calculateShippingCost: false,
    freeShippingThreshold: 1000,
  },
  returns: {
    enabled: true,
    defaultReturnWindowDays: 30,
    requireApproval: true,
    approvalThreshold: 5000,
    approvers: [],
    defaultRestockingFeePercent: 10,
    autoCreateCreditNote: true,
    requireInspection: true,
  },
  tax: {
    defaultTaxRate: 15, // Saudi VAT
    taxIncludedInPrice: false,
    calculateTaxOnDiscount: true,
    roundTaxPerLine: false,
    taxRoundingMethod: 'nearest',
  },
  documents: {
    quoteTemplate: 'default',
    orderTemplate: 'default',
    deliveryNoteTemplate: 'default',
    invoiceTemplate: 'default',
    defaultLanguage: 'both',
    showLogo: true,
    showTermsAndConditions: true,
    defaultTermsAndConditions: 'Payment is due within 30 days. Late payments may incur additional fees.',
    defaultTermsAndConditionsAr: 'الدفع مستحق خلال 30 يومًا. قد تتحمل المدفوعات المتأخرة رسومًا إضافية.',
  },
  sequences: {
    quoteSequence: {
      ...DEFAULT_SEQUENCE_CONFIG,
      prefix: 'QT-',
    },
    orderSequence: {
      ...DEFAULT_SEQUENCE_CONFIG,
      prefix: 'SO-',
    },
    deliverySequence: {
      ...DEFAULT_SEQUENCE_CONFIG,
      prefix: 'DN-',
    },
    returnSequence: {
      ...DEFAULT_SEQUENCE_CONFIG,
      prefix: 'RET-',
    },
  },
}

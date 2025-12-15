/**
 * Corporate Card Types
 * Type definitions for corporate card management and reconciliation
 */

export interface CorporateCard {
  _id: string
  cardNumber: string  // Last 4 digits only
  cardholderName: string
  employeeId: string
  cardType: 'visa' | 'mastercard' | 'amex' | 'mada'
  expiryDate: string
  creditLimit: number
  currentBalance: number
  availableCredit?: number
  status: 'active' | 'blocked' | 'expired' | 'cancelled'
  issuedDate?: string
  activatedDate?: string
  lastUsedDate?: string
  monthlySpend?: number
  createdAt?: string
  updatedAt?: string
}

export interface CardTransaction {
  _id: string
  cardId: string
  transactionDate: string
  postingDate?: string
  merchantName: string
  merchantCategory: string
  merchantCategoryCode?: string
  amount: number
  currency: string
  originalAmount?: number
  originalCurrency?: string
  exchangeRate?: number
  status: 'pending' | 'posted' | 'reconciled' | 'disputed' | 'void'
  expenseClaimId?: string
  notes?: string
  receiptAttached?: boolean
  receiptUrl?: string
  authorizationCode?: string
  referenceNumber?: string
  // Reconciliation fields
  reconciledBy?: string
  reconciledAt?: string
  reconciliationType?: 'expense_claim' | 'personal' | 'corporate' | 'disputed'
  disputeReason?: string
  disputeStatus?: 'open' | 'pending' | 'resolved' | 'rejected'
  disputedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface ReconciliationMatch {
  transactionId: string
  expenseClaimId: string
  matchType: 'exact' | 'partial' | 'manual'
  matchScore?: number
  matchedFields?: string[]
  amountDifference?: number
}

export interface CardStatistics {
  totalCards: number
  activeCards: number
  blockedCards: number
  totalSpend: number
  monthlySpend: number
  unReconciledTransactions: number
  disputedTransactions: number
  pendingTransactions: number
  averageTransactionAmount: number
  topMerchants: Array<{
    merchant: string
    totalSpend: number
    transactionCount: number
  }>
  spendingByCategory: Array<{
    category: string
    amount: number
    percentage: number
  }>
  spendingByCard: Array<{
    cardId: string
    cardNumber: string
    cardholderName: string
    totalSpend: number
  }>
}

export interface CSVImportResult {
  success: boolean
  totalRecords: number
  importedRecords: number
  duplicateRecords: number
  errorRecords: number
  errors?: Array<{
    row: number
    error: string
    data?: any
  }>
}

export interface CreateCorporateCardData {
  cardNumber: string
  cardholderName: string
  employeeId: string
  cardType: 'visa' | 'mastercard' | 'amex' | 'mada'
  expiryDate: string
  creditLimit: number
}

export interface UpdateCorporateCardData {
  cardholderName?: string
  employeeId?: string
  expiryDate?: string
  creditLimit?: number
  status?: 'active' | 'blocked' | 'expired' | 'cancelled'
}

export interface CreateCardTransactionData {
  cardId: string
  transactionDate: string
  merchantName: string
  merchantCategory: string
  amount: number
  currency: string
  originalAmount?: number
  originalCurrency?: string
  exchangeRate?: number
  notes?: string
}

export interface ReconcileTransactionData {
  transactionId: string
  reconciliationType: 'expense_claim' | 'personal' | 'corporate' | 'disputed'
  expenseClaimId?: string
  notes?: string
  disputeReason?: string
}

export interface CardTransactionFilters {
  cardId?: string
  status?: 'pending' | 'posted' | 'reconciled' | 'disputed' | 'void'
  startDate?: string
  endDate?: string
  merchantName?: string
  merchantCategory?: string
  minAmount?: number
  maxAmount?: number
  reconciled?: boolean
  page?: number
  limit?: number
}

export interface CorporateCardFilters {
  status?: 'active' | 'blocked' | 'expired' | 'cancelled'
  employeeId?: string
  cardType?: 'visa' | 'mastercard' | 'amex' | 'mada'
  page?: number
  limit?: number
}

// Merchant Categories (Saudi Arabia specific)
export const MERCHANT_CATEGORIES = [
  { code: '5411', name: 'محلات البقالة والسوبر ماركت', nameEn: 'Grocery Stores, Supermarkets' },
  { code: '5541', name: 'محطات الوقود', nameEn: 'Service Stations (Fuel)' },
  { code: '5812', name: 'مطاعم', nameEn: 'Restaurants' },
  { code: '5814', name: 'مطاعم سريعة', nameEn: 'Fast Food Restaurants' },
  { code: '5912', name: 'صيدليات', nameEn: 'Pharmacies' },
  { code: '4111', name: 'نقل محلي', nameEn: 'Local Transportation' },
  { code: '3000', name: 'طيران', nameEn: 'Airlines' },
  { code: '7011', name: 'فنادق', nameEn: 'Hotels, Motels' },
  { code: '5311', name: 'متاجر', nameEn: 'Department Stores' },
  { code: '5943', name: 'قرطاسية', nameEn: 'Stationery, Office Supplies' },
  { code: '5734', name: 'متاجر حاسوب', nameEn: 'Computer Software Stores' },
  { code: '7372', name: 'خدمات برمجيات', nameEn: 'Computer Programming Services' },
  { code: '8011', name: 'خدمات طبية', nameEn: 'Medical Services' },
  { code: '7399', name: 'خدمات تجارية', nameEn: 'Business Services' },
  { code: '4789', name: 'خدمات نقل', nameEn: 'Transportation Services' },
  { code: '7523', name: 'مواقف سيارات', nameEn: 'Parking Lots, Garages' },
  { code: '9399', name: 'خدمات حكومية', nameEn: 'Government Services' },
  { code: '8999', name: 'خدمات مهنية', nameEn: 'Professional Services' },
  { code: '0000', name: 'أخرى', nameEn: 'Other' },
] as const

export const CARD_TYPES = [
  { value: 'visa', label: 'فيزا', labelEn: 'Visa' },
  { value: 'mastercard', label: 'ماستركارد', labelEn: 'Mastercard' },
  { value: 'amex', label: 'أمريكان إكسبريس', labelEn: 'American Express' },
  { value: 'mada', label: 'مدى', labelEn: 'Mada' },
] as const

export const CARD_STATUSES = [
  { value: 'active', label: 'نشط', labelEn: 'Active', color: 'green' },
  { value: 'blocked', label: 'محظور', labelEn: 'Blocked', color: 'red' },
  { value: 'expired', label: 'منتهي', labelEn: 'Expired', color: 'gray' },
  { value: 'cancelled', label: 'ملغي', labelEn: 'Cancelled', color: 'orange' },
] as const

export const TRANSACTION_STATUSES = [
  { value: 'pending', label: 'معلق', labelEn: 'Pending', color: 'yellow' },
  { value: 'posted', label: 'مرحل', labelEn: 'Posted', color: 'blue' },
  { value: 'reconciled', label: 'متطابق', labelEn: 'Reconciled', color: 'green' },
  { value: 'disputed', label: 'متنازع عليه', labelEn: 'Disputed', color: 'red' },
  { value: 'void', label: 'ملغي', labelEn: 'Void', color: 'gray' },
] as const

export const RECONCILIATION_TYPES = [
  { value: 'expense_claim', label: 'مطالبة مصروفات', labelEn: 'Expense Claim' },
  { value: 'personal', label: 'شخصي (يتطلب السداد)', labelEn: 'Personal (Requires Reimbursement)' },
  { value: 'corporate', label: 'شركة', labelEn: 'Corporate' },
  { value: 'disputed', label: 'متنازع عليه', labelEn: 'Disputed' },
] as const

/**
 * Idempotency Key Management
 *
 * Gold Standard: Ensures financial operations are not duplicated
 * even if the user accidentally clicks submit multiple times or
 * network issues cause retries.
 *
 * How it works:
 * - Generates unique idempotency keys for mutation requests
 * - Server stores the key and returns cached response for duplicates
 * - Keys are typically valid for 24 hours on the server
 */

/**
 * Generate a unique idempotency key
 * Uses crypto.randomUUID() for true randomness
 */
export const generateIdempotencyKey = (): string => {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Financial paths that require idempotency keys
 * These are paths where duplicate requests could cause financial issues
 */
export const FINANCIAL_PATHS = [
  // Payments
  '/payments',
  '/payments/',
  '/record-payment',
  '/process-payment',
  '/confirm-payment',

  // Transactions
  '/transactions',
  '/transactions/',
  '/recurring-transactions',

  // Bills
  '/bills',
  '/bills/',
  '/debit-notes',

  // Bank transfers
  '/bank-transfers',
  '/bank-transfers/',

  // Invoices (financial operations only)
  '/invoices',
  '/credit-notes',

  // Expenses & Claims
  '/expenses',
  '/expense-claims',
  '/expense-policies',

  // Loans
  '/employee-loans',
  '/loans/',

  // Payroll
  '/payroll',
  '/payroll-run',
  '/salary',
  '/salary-advance',

  // Advances
  '/advances',

  // Refunds
  '/refund',
  '/refunds',

  // Reconciliation
  '/reconcile',
  '/reconciliation',
  '/bank-reconciliation',

  // Saudi Banking
  '/saudi-banking',
  '/sadad',
  '/lean/payments',

  // Trust accounts
  '/trust-accounts',

  // Investments & Trading
  '/investments',
  '/trading-accounts',

  // Corporate cards
  '/corporate-cards',

  // Accounting entries
  '/journal-entries',
  '/journal-entry',
  '/chart-of-accounts',

  // Tax
  '/tax-payments',
  '/vat',
  '/zatca',

  // Quotes (can convert to invoices)
  '/quotes',

  // Purchase orders
  '/purchase-orders',

  // Vendor payments
  '/vendor-payments',
  '/vendor-credits',
]

/**
 * HTTP methods that require idempotency keys
 */
export const IDEMPOTENT_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

/**
 * Check if a request should have an idempotency key
 */
export const shouldAddIdempotencyKey = (
  method: string | undefined,
  url: string | undefined
): boolean => {
  if (!method || !url) return false

  const upperMethod = method.toUpperCase()

  // Only mutation methods need idempotency
  if (!IDEMPOTENT_METHODS.includes(upperMethod)) {
    return false
  }

  // Check if the URL matches any financial path
  const normalizedUrl = url.toLowerCase()
  return FINANCIAL_PATHS.some((path) => normalizedUrl.includes(path.toLowerCase()))
}

/**
 * Store for idempotency keys by request signature
 * This helps reuse keys for retries of the same request
 */
const idempotencyKeyStore = new Map<string, { key: string; timestamp: number }>()

// Clean up old keys after 5 minutes (they're only needed for retries)
const KEY_EXPIRY = 5 * 60 * 1000

/**
 * Generate a request signature for key reuse
 */
const getRequestSignature = (
  method: string,
  url: string,
  data?: any
): string => {
  const dataStr = data ? JSON.stringify(data) : ''
  return `${method}:${url}:${dataStr}`
}

/**
 * Get or create an idempotency key for a request
 * Reuses keys for identical requests (important for retries)
 */
export const getIdempotencyKey = (
  method: string,
  url: string,
  data?: any
): string => {
  const signature = getRequestSignature(method, url, data)
  const now = Date.now()

  // Check if we have a valid cached key
  const cached = idempotencyKeyStore.get(signature)
  if (cached && now - cached.timestamp < KEY_EXPIRY) {
    return cached.key
  }

  // Generate new key
  const key = generateIdempotencyKey()
  idempotencyKeyStore.set(signature, { key, timestamp: now })

  return key
}

/**
 * Clear idempotency key after successful request
 * (So next request gets a new key)
 */
export const clearIdempotencyKey = (
  method: string,
  url: string,
  data?: any
): void => {
  const signature = getRequestSignature(method, url, data)
  idempotencyKeyStore.delete(signature)
}

/**
 * Clear all stored idempotency keys
 * Call on logout to clean up
 */
export const clearAllIdempotencyKeys = (): void => {
  idempotencyKeyStore.clear()
}

/**
 * Cleanup expired keys (runs periodically)
 */
export const cleanupExpiredKeys = (): number => {
  const now = Date.now()
  let cleaned = 0

  idempotencyKeyStore.forEach((value, key) => {
    if (now - value.timestamp > KEY_EXPIRY) {
      idempotencyKeyStore.delete(key)
      cleaned++
    }
  })

  return cleaned
}

// Run cleanup every minute
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredKeys, 60 * 1000)
}

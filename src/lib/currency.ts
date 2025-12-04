/**
 * Currency Utilities for SAR/Halalas handling
 *
 * Backend stores all amounts as integers in HALALAS (1 SAR = 100 halalas)
 * Frontend displays in SAR with proper formatting
 */

/**
 * Convert halalas (backend) to SAR (display)
 */
export const halalasToSAR = (halalas: number): number => {
  return halalas / 100
}

/**
 * Convert SAR (user input) to halalas (backend)
 */
export const SARToHalalas = (sar: number): number => {
  return Math.round(sar * 100)
}

/**
 * Format halalas as SAR currency string (Arabic locale)
 */
export const formatCurrency = (halalas: number, options?: {
  showSymbol?: boolean
  locale?: 'ar-SA' | 'en-SA'
}): string => {
  const sar = halalasToSAR(halalas)
  const { showSymbol = true, locale = 'ar-SA' } = options || {}

  if (showSymbol) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(sar)
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(sar)
}

/**
 * Format SAR amount (already in SAR, not halalas)
 */
export const formatSAR = (amount: number, options?: {
  showSymbol?: boolean
  locale?: 'ar-SA' | 'en-SA'
}): string => {
  const { showSymbol = true, locale = 'ar-SA' } = options || {}

  if (showSymbol) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format currency with compact notation for large amounts
 * e.g., 1,500,000 -> 1.5M
 */
export const formatCompactCurrency = (halalas: number, locale: 'ar-SA' | 'en-SA' = 'ar-SA'): string => {
  const sar = halalasToSAR(halalas)

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'SAR',
    notation: 'compact',
    compactDisplay: 'short',
  }).format(sar)
}

/**
 * Parse user input to halalas
 * Handles formats like "1,500.00" or "1500" or "1.5k"
 */
export const parseCurrencyInput = (input: string): number => {
  // Remove currency symbols and spaces
  let cleaned = input.replace(/[ر.س\s,]/g, '').trim()

  // Handle k/K for thousands, m/M for millions
  const multipliers: Record<string, number> = {
    k: 1000,
    K: 1000,
    m: 1000000,
    M: 1000000,
  }

  for (const [suffix, multiplier] of Object.entries(multipliers)) {
    if (cleaned.endsWith(suffix)) {
      cleaned = cleaned.slice(0, -1)
      const value = parseFloat(cleaned) * multiplier
      return SARToHalalas(value)
    }
  }

  const value = parseFloat(cleaned)
  if (isNaN(value)) return 0

  return SARToHalalas(value)
}

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Calculate VAT amount
 * @param amount Amount in halalas before VAT
 * @param vatRate VAT rate as percentage (e.g., 15 for 15%)
 * @returns VAT amount in halalas
 */
export const calculateVAT = (amount: number, vatRate: number = 15): number => {
  return Math.round(amount * (vatRate / 100))
}

/**
 * Calculate total with VAT
 * @param amount Amount in halalas before VAT
 * @param vatRate VAT rate as percentage (e.g., 15 for 15%)
 * @returns Total amount in halalas including VAT
 */
export const calculateTotalWithVAT = (amount: number, vatRate: number = 15): number => {
  return amount + calculateVAT(amount, vatRate)
}

/**
 * Extract amount from total (reverse VAT)
 * @param totalWithVAT Total amount in halalas including VAT
 * @param vatRate VAT rate as percentage (e.g., 15 for 15%)
 * @returns Original amount before VAT in halalas
 */
export const extractAmountBeforeVAT = (totalWithVAT: number, vatRate: number = 15): number => {
  return Math.round(totalWithVAT / (1 + vatRate / 100))
}

/**
 * Currency input props helper for form fields
 * Use with controlled inputs to handle halalas conversion
 */
export const currencyInputHelpers = {
  /**
   * Convert halalas to display value (SAR)
   */
  toDisplayValue: (halalas: number | undefined | null): string => {
    if (halalas === undefined || halalas === null) return ''
    return halalasToSAR(halalas).toFixed(2)
  },

  /**
   * Convert display value (SAR) to halalas
   */
  fromDisplayValue: (displayValue: string): number => {
    const value = parseFloat(displayValue)
    if (isNaN(value)) return 0
    return SARToHalalas(value)
  },
}

export default {
  halalasToSAR,
  SARToHalalas,
  formatCurrency,
  formatSAR,
  formatCompactCurrency,
  parseCurrencyInput,
  formatPercentage,
  calculateVAT,
  calculateTotalWithVAT,
  extractAmountBeforeVAT,
  currencyInputHelpers,
}

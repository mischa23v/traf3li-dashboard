/**
 * Tax Configuration
 * Centralized tax rates and tax-related constants
 */

export const TAX_CONFIG = {
  /**
   * Saudi Arabia VAT Rate (15%)
   * Used for invoice calculations, expense claims, and financial reports
   */
  SAUDI_VAT_RATE: 0.15,

  /**
   * VAT Rate as Percentage
   * For display purposes (e.g., "15%")
   */
  SAUDI_VAT_RATE_PERCENT: 15,

  /**
   * Default tax rate used when no specific rate is provided
   */
  DEFAULT_TAX_RATE: 0.15,

  /**
   * Zero-rated items (VAT exemptions)
   */
  ZERO_RATED: 0,

  /**
   * Tax number validation
   */
  VAT_NUMBER_LENGTH: 15,
  VAT_NUMBER_PREFIX: '3', // Saudi VAT numbers start with 3
} as const

export default TAX_CONFIG

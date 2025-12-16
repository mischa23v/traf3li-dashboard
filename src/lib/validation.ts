/**
 * Validation utility functions for form inputs
 */

import {
  validationPatterns,
  isValidIbanWithChecksum,
  formatSaudiIban,
  errorMessages
} from '@/utils/validation-patterns';

/**
 * Validate amount (positive number with max 2 decimal places)
 */
export function validateAmount(value: number | string): { valid: boolean; error?: string } {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return { valid: false, error: 'المبلغ يجب أن يكون رقماً' }
  }

  if (numValue <= 0) {
    return { valid: false, error: 'المبلغ يجب أن يكون أكبر من صفر' }
  }

  // Check for max 2 decimal places
  const decimalPart = value.toString().split('.')[1]
  if (decimalPart && decimalPart.length > 2) {
    return { valid: false, error: 'المبلغ يجب ألا يحتوي على أكثر من منزلتين عشريتين' }
  }

  return { valid: true }
}

/**
 * Validate Saudi IBAN format (SA followed by 22 digits)
 * Format: SA + 2 check digits + 22 account digits = 24 characters total
 * Uses validation-patterns.ts for consistent validation across the app
 */
export function validateSaudiIBAN(iban: string): { valid: boolean; error?: string } {
  if (!iban || !iban.trim()) {
    return { valid: false, error: errorMessages.iban.ar }
  }

  // Use the centralized IBAN validation with checksum
  const isValid = isValidIbanWithChecksum(iban, true)

  if (!isValid) {
    return { valid: false, error: errorMessages.iban.ar }
  }

  return { valid: true }
}

/**
 * Validate reference number format (alphanumeric, hyphens, underscores)
 */
export function validateReferenceNumber(refNumber: string): { valid: boolean; error?: string } {
  if (!refNumber || refNumber.trim().length === 0) {
    return { valid: true } // Optional field
  }

  // Allow alphanumeric, hyphens, underscores, and spaces
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(refNumber)) {
    return { valid: false, error: 'رقم المرجع يجب أن يحتوي على أحرف وأرقام فقط' }
  }

  if (refNumber.length > 50) {
    return { valid: false, error: 'رقم المرجع يجب ألا يتجاوز 50 حرفاً' }
  }

  return { valid: true }
}

/**
 * Format IBAN for display (adds spaces every 4 characters)
 * Uses validation-patterns.ts for consistent formatting across the app
 */
export function formatIBAN(iban: string): string {
  return formatSaudiIban(iban)
}

/**
 * Validation utility functions for form inputs
 */
import i18n from '@/i18n'

/**
 * Validate amount (positive number with max 2 decimal places)
 */
export function validateAmount(value: number | string): { valid: boolean; error?: string } {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return { valid: false, error: i18n.t('validation.amount.mustBeNumber') }
  }

  if (numValue <= 0) {
    return { valid: false, error: i18n.t('validation.amount.mustBePositive') }
  }

  // Check for max 2 decimal places
  const decimalPart = value.toString().split('.')[1]
  if (decimalPart && decimalPart.length > 2) {
    return { valid: false, error: i18n.t('validation.amount.maxDecimals') }
  }

  return { valid: true }
}

/**
 * Validate Saudi IBAN format (SA followed by 22 digits)
 * Format: SA + 2 check digits + 22 account digits = 24 characters total
 */
export function validateSaudiIBAN(iban: string): { valid: boolean; error?: string } {
  // Remove spaces and convert to uppercase
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase()

  // Check if it starts with SA
  if (!cleanIBAN.startsWith('SA')) {
    return { valid: false, error: i18n.t('validation.iban.mustStartWithSA') }
  }

  // Check length (SA + 22 digits = 24 characters)
  if (cleanIBAN.length !== 24) {
    return { valid: false, error: i18n.t('validation.iban.length') }
  }

  // Check if the rest are digits
  const digits = cleanIBAN.slice(2)
  if (!/^\d{22}$/.test(digits)) {
    return { valid: false, error: i18n.t('validation.iban.digitsOnly') }
  }

  // Basic IBAN checksum validation
  const isValidChecksum = validateIBANChecksum(cleanIBAN)
  if (!isValidChecksum) {
    return { valid: false, error: i18n.t('validation.iban.invalidChecksum') }
  }

  return { valid: true }
}

/**
 * Validate IBAN checksum using mod-97 algorithm
 */
function validateIBANChecksum(iban: string): boolean {
  // Move first 4 characters to end
  const rearranged = iban.slice(4) + iban.slice(0, 4)

  // Replace letters with numbers (A=10, B=11, ..., Z=35)
  const numericString = rearranged
    .split('')
    .map(char => {
      const code = char.charCodeAt(0)
      if (code >= 65 && code <= 90) {
        // A-Z
        return (code - 55).toString()
      }
      return char
    })
    .join('')

  // Calculate mod 97
  let remainder = 0
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i])) % 97
  }

  return remainder === 1
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
    return { valid: false, error: i18n.t('validation.reference.alphanumeric') }
  }

  if (refNumber.length > 50) {
    return { valid: false, error: i18n.t('validation.reference.maxLength') }
  }

  return { valid: true }
}

/**
 * Format IBAN for display (adds spaces every 4 characters)
 */
export function formatIBAN(iban: string): string {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase()
  return cleanIBAN.replace(/(.{4})/g, '$1 ').trim()
}

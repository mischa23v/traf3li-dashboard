/**
 * Saudi Banking Validation Utilities
 *
 * Validation functions for:
 * - IBAN (International Bank Account Number) - ISO 7064 Mod 97
 * - Saudi National ID (Luhn algorithm)
 * - Iqama Number (Resident ID)
 * - Bank codes and other identifiers
 */

import { SARIE_BANK_IDS, type SarieBankId } from '@/constants/saudi-banking'

// =============================================================================
// IBAN VALIDATION
// =============================================================================

/**
 * Saudi IBAN format: SA + 2 check digits + 2 bank code + 18 account number = 24 chars
 * Example: SA0380000000608010167519
 */
const SAUDI_IBAN_REGEX = /^SA\d{22}$/

/**
 * Validates an IBAN using ISO 7064 Mod 97 algorithm
 *
 * Steps:
 * 1. Move first 4 chars to end
 * 2. Replace letters with numbers (A=10, B=11, etc.)
 * 3. Calculate mod 97 - result should be 1
 *
 * @param iban - The IBAN to validate (with or without spaces)
 * @returns Validation result with details
 */
export function validateIban(iban: string): IbanValidationResult {
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase()

  // Check basic format
  if (!cleanIban) {
    return {
      isValid: false,
      error: 'IBAN is required',
      errorCode: 'IBAN_EMPTY',
    }
  }

  // Check length (Saudi IBANs are 24 characters)
  if (cleanIban.length !== 24) {
    return {
      isValid: false,
      error: `Invalid IBAN length: expected 24 characters, got ${cleanIban.length}`,
      errorCode: 'IBAN_INVALID_LENGTH',
    }
  }

  // Check Saudi IBAN format
  if (!SAUDI_IBAN_REGEX.test(cleanIban)) {
    return {
      isValid: false,
      error: 'Invalid Saudi IBAN format. Must start with SA followed by 22 digits',
      errorCode: 'IBAN_INVALID_FORMAT',
    }
  }

  // Extract bank code (positions 5-6)
  const bankCode = cleanIban.substring(4, 6)

  // Validate bank code
  const validBankCodes = Object.values(SARIE_BANK_IDS)
  if (!validBankCodes.includes(bankCode as SarieBankId)) {
    return {
      isValid: false,
      error: `Unknown bank code: ${bankCode}`,
      errorCode: 'IBAN_INVALID_BANK_CODE',
      bankCode,
    }
  }

  // ISO 7064 Mod 97 validation
  // Step 1: Move first 4 characters to end
  const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4)

  // Step 2: Replace letters with numbers (A=10, B=11, ..., Z=35)
  let numericString = ''
  for (const char of rearranged) {
    if (char >= 'A' && char <= 'Z') {
      numericString += (char.charCodeAt(0) - 55).toString()
    } else {
      numericString += char
    }
  }

  // Step 3: Calculate mod 97 using BigInt for precision
  // Process in chunks to avoid overflow
  let remainder = BigInt(0)
  for (let i = 0; i < numericString.length; i += 7) {
    const chunk = numericString.substring(i, i + 7)
    remainder = BigInt(remainder.toString() + chunk) % BigInt(97)
  }

  if (remainder !== BigInt(1)) {
    return {
      isValid: false,
      error: 'Invalid IBAN checksum',
      errorCode: 'IBAN_CHECKSUM_FAILED',
      bankCode,
    }
  }

  // Get bank name
  const bankName = getBankNameByCode(bankCode)

  return {
    isValid: true,
    bankCode,
    bankName,
    accountNumber: cleanIban.substring(6),
    formattedIban: formatIban(cleanIban),
  }
}

export interface IbanValidationResult {
  isValid: boolean
  error?: string
  errorCode?: string
  bankCode?: string
  bankName?: string
  accountNumber?: string
  formattedIban?: string
}

/**
 * Format IBAN with spaces for display (SA03 8000 0000 6080 1016 7519)
 */
export function formatIban(iban: string): string {
  const clean = iban.replace(/\s/g, '').toUpperCase()
  return clean.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Get bank name from SARIE code
 */
export function getBankNameByCode(code: string): string | undefined {
  const bankNames: Record<string, string> = {
    '05': 'Alinma Bank',
    '10': 'Saudi National Bank (SNB)',
    '15': 'Bank Albilad',
    '20': 'Riyad Bank',
    '30': 'Arab National Bank',
    '40': 'Saudi National Bank (Samba)',
    '45': 'Saudi British Bank (SABB)',
    '55': 'Banque Saudi Fransi',
    '60': 'Bank AlJazira',
    '65': 'Gulf International Bank',
    '70': 'Emirates NBD',
    '75': 'First Abu Dhabi Bank',
    '80': 'Al Rajhi Bank',
  }
  return bankNames[code]
}

// =============================================================================
// SAUDI NATIONAL ID VALIDATION
// =============================================================================

/**
 * Saudi National ID format:
 * - 10 digits
 * - Starts with 1 (Saudi citizen) or 2 (resident/Iqama)
 * - Uses Luhn algorithm for checksum
 */
const SAUDI_ID_REGEX = /^[12]\d{9}$/

/**
 * Validates a Saudi National ID or Iqama number using Luhn algorithm
 *
 * The Luhn algorithm (mod 10):
 * 1. From right to left, double every second digit
 * 2. If doubling results in > 9, subtract 9
 * 3. Sum all digits
 * 4. If sum % 10 === 0, number is valid
 *
 * @param id - The 10-digit ID number
 * @returns Validation result with details
 */
export function validateSaudiId(id: string): SaudiIdValidationResult {
  // Remove spaces and dashes
  const cleanId = id.replace(/[\s-]/g, '')

  if (!cleanId) {
    return {
      isValid: false,
      error: 'ID number is required',
      errorCode: 'ID_EMPTY',
    }
  }

  if (cleanId.length !== 10) {
    return {
      isValid: false,
      error: `Invalid ID length: expected 10 digits, got ${cleanId.length}`,
      errorCode: 'ID_INVALID_LENGTH',
    }
  }

  if (!SAUDI_ID_REGEX.test(cleanId)) {
    return {
      isValid: false,
      error: 'Invalid ID format. Must be 10 digits starting with 1 or 2',
      errorCode: 'ID_INVALID_FORMAT',
    }
  }

  // Determine type based on first digit
  const idType = cleanId[0] === '1' ? 'national_id' : 'iqama'

  // Luhn algorithm validation
  if (!luhnCheck(cleanId)) {
    return {
      isValid: false,
      error: 'Invalid ID checksum',
      errorCode: 'ID_CHECKSUM_FAILED',
      idType,
    }
  }

  return {
    isValid: true,
    idType,
    formattedId: formatSaudiId(cleanId),
  }
}

export interface SaudiIdValidationResult {
  isValid: boolean
  error?: string
  errorCode?: string
  idType?: 'national_id' | 'iqama'
  formattedId?: string
}

/**
 * Luhn algorithm implementation
 */
function luhnCheck(value: string): boolean {
  let sum = 0
  let isEven = false

  // Process from right to left
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = parseInt(value[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Format Saudi ID for display (1234-5678-90)
 */
export function formatSaudiId(id: string): string {
  const clean = id.replace(/[\s-]/g, '')
  if (clean.length !== 10) return id
  return `${clean.substring(0, 4)}-${clean.substring(4, 8)}-${clean.substring(8)}`
}

// =============================================================================
// IQAMA NUMBER VALIDATION
// =============================================================================

/**
 * Validates an Iqama (resident permit) number
 * Iqama numbers start with 2 and are 10 digits
 */
export function validateIqamaNumber(iqama: string): SaudiIdValidationResult {
  const result = validateSaudiId(iqama)

  if (result.isValid && result.idType !== 'iqama') {
    return {
      isValid: false,
      error: 'This is a Saudi National ID, not an Iqama number',
      errorCode: 'NOT_IQAMA',
      idType: result.idType,
    }
  }

  return result
}

/**
 * Validates a Saudi National ID (citizen ID)
 * National IDs start with 1 and are 10 digits
 */
export function validateNationalId(nationalId: string): SaudiIdValidationResult {
  const result = validateSaudiId(nationalId)

  if (result.isValid && result.idType !== 'national_id') {
    return {
      isValid: false,
      error: 'This is an Iqama number, not a Saudi National ID',
      errorCode: 'NOT_NATIONAL_ID',
      idType: result.idType,
    }
  }

  return result
}

// =============================================================================
// SALARY VALIDATION
// =============================================================================

import { GOSI_SALARY_CONSTRAINTS, NITAQAT_SALARY_CONSTRAINTS } from '@/constants/saudi-banking'

export interface SalaryValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  cappedSalary?: number
  nitaqatWeight?: number
}

/**
 * Validates salary for GOSI and Nitaqat compliance
 */
export function validateSalaryForCompliance(
  basicSalary: number,
  housingAllowance?: number,
  isSaudi?: boolean
): SalaryValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Calculate total base for GOSI
  const housing = housingAllowance ?? basicSalary * 0.25
  const totalBase = basicSalary + housing

  // Check minimum GOSI requirement
  if (totalBase < GOSI_SALARY_CONSTRAINTS.MIN_BASE) {
    errors.push(
      `Total base salary (${totalBase.toLocaleString()} SAR) is below GOSI minimum (${GOSI_SALARY_CONSTRAINTS.MIN_BASE.toLocaleString()} SAR)`
    )
  }

  // Check if salary exceeds GOSI max (not an error, just capped)
  let cappedSalary = totalBase
  if (totalBase > GOSI_SALARY_CONSTRAINTS.MAX_BASE) {
    cappedSalary = GOSI_SALARY_CONSTRAINTS.MAX_BASE
    warnings.push(
      `Total base salary exceeds GOSI maximum. Contributions will be calculated on ${GOSI_SALARY_CONSTRAINTS.MAX_BASE.toLocaleString()} SAR cap`
    )
  }

  // Nitaqat weight calculation for Saudi employees
  let nitaqatWeight: number | undefined
  if (isSaudi) {
    const totalSalary = basicSalary + (housingAllowance ?? 0)

    if (totalSalary < NITAQAT_SALARY_CONSTRAINTS.MIN_HALF_POINT_WAGE) {
      warnings.push(
        `Salary below ${NITAQAT_SALARY_CONSTRAINTS.MIN_HALF_POINT_WAGE.toLocaleString()} SAR - employee will not count toward Nitaqat`
      )
      nitaqatWeight = 0
    } else if (totalSalary < NITAQAT_SALARY_CONSTRAINTS.MIN_FULL_POINT_WAGE) {
      warnings.push(
        `Salary below ${NITAQAT_SALARY_CONSTRAINTS.MIN_FULL_POINT_WAGE.toLocaleString()} SAR - employee counts as 0.5 for Nitaqat`
      )
      nitaqatWeight = 0.5
    } else {
      nitaqatWeight = 1.0
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    cappedSalary,
    nitaqatWeight,
  }
}

// =============================================================================
// BATCH VALIDATION
// =============================================================================

export interface BatchValidationResult<T> {
  valid: T[]
  invalid: Array<{ item: T; errors: string[] }>
  summary: {
    total: number
    validCount: number
    invalidCount: number
  }
}

/**
 * Validates a batch of IBANs
 */
export function validateIbanBatch(ibans: string[]): BatchValidationResult<string> {
  const valid: string[] = []
  const invalid: Array<{ item: string; errors: string[] }> = []

  for (const iban of ibans) {
    const result = validateIban(iban)
    if (result.isValid) {
      valid.push(iban)
    } else {
      invalid.push({ item: iban, errors: [result.error ?? 'Unknown error'] })
    }
  }

  return {
    valid,
    invalid,
    summary: {
      total: ibans.length,
      validCount: valid.length,
      invalidCount: invalid.length,
    },
  }
}

/**
 * Validates a batch of Saudi IDs
 */
export function validateSaudiIdBatch(ids: string[]): BatchValidationResult<string> {
  const valid: string[] = []
  const invalid: Array<{ item: string; errors: string[] }> = []

  for (const id of ids) {
    const result = validateSaudiId(id)
    if (result.isValid) {
      valid.push(id)
    } else {
      invalid.push({ item: id, errors: [result.error ?? 'Unknown error'] })
    }
  }

  return {
    valid,
    invalid,
    summary: {
      total: ids.length,
      validCount: valid.length,
      invalidCount: invalid.length,
    },
  }
}

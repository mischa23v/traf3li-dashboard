/**
 * Reusable Zod Validators for Saudi-Specific Fields
 * Provides pre-configured Zod schemas with Saudi validation patterns
 */

import { z } from 'zod'
import { validationPatterns, errorMessages } from '@/utils/validation-patterns'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates Saudi IBAN checksum using mod-97 algorithm
 * @param iban - The IBAN string to validate
 * @returns true if checksum is valid, false otherwise
 */
function validateIbanChecksum(iban: string): boolean {
  // Remove SA prefix and get the numeric part
  const numericPart = iban.substring(2)

  // Move first 4 characters to end: SA00 1234... -> 1234...SA00
  const rearranged = numericPart.substring(2) + 'SA' + numericPart.substring(0, 2)

  // Replace letters with numbers (A=10, B=11, ..., Z=35)
  const numericString = rearranged
    .split('')
    .map(char => {
      const code = char.charCodeAt(0)
      if (code >= 65 && code <= 90) { // A-Z
        return (code - 55).toString()
      }
      return char
    })
    .join('')

  // Calculate mod 97
  let remainder = numericString
  while (remainder.length > 2) {
    const block = remainder.substring(0, 9)
    remainder = (parseInt(block, 10) % 97).toString() + remainder.substring(block.length)
  }

  return parseInt(remainder, 10) % 97 === 1
}

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Saudi National ID Schema
 * Validates: 10 digits starting with 1 or 2
 */
export const saudiNationalIdSchema = z
  .string()
  .trim()
  .regex(
    validationPatterns.nationalId,
    errorMessages.nationalId.ar
  )
  .describe('Saudi National ID (10 digits starting with 1 or 2)')

/**
 * Saudi Phone Number Schema
 * Validates: +966, 966, or 05 prefix followed by 8-9 digits
 */
export const saudiPhoneSchema = z
  .string()
  .trim()
  .regex(
    validationPatterns.phone,
    errorMessages.phone.ar
  )
  .describe('Saudi phone number (+966501234567 or 0501234567)')

/**
 * Saudi IBAN Schema
 * Validates: SA + 22 digits with checksum validation
 */
export const saudiIbanSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    validationPatterns.iban,
    errorMessages.iban.ar
  )
  .refine(
    (iban) => validateIbanChecksum(iban),
    { message: 'رقم الآيبان غير صحيح (فشل التحقق من المجموع الاختباري)' }
  )
  .describe('Saudi IBAN (SA followed by 22 digits)')

/**
 * Saudi Commercial Registration Number Schema
 * Validates: Exactly 10 digits
 */
export const saudiCrNumberSchema = z
  .string()
  .trim()
  .regex(
    validationPatterns.crNumber,
    errorMessages.crNumber.ar
  )
  .describe('Saudi Commercial Registration Number (10 digits)')

/**
 * Saudi VAT Number Schema
 * Validates: 15 digits starting with 3
 */
export const saudiVatNumberSchema = z
  .string()
  .trim()
  .regex(
    validationPatterns.vatNumber,
    errorMessages.vatNumber.ar
  )
  .describe('Saudi VAT Number (15 digits starting with 3)')

// ============================================================================
// Optional Variants (for optional fields)
// ============================================================================

/**
 * Optional Saudi National ID Schema
 */
export const saudiNationalIdSchemaOptional = saudiNationalIdSchema.optional()

/**
 * Optional Saudi Phone Number Schema
 */
export const saudiPhoneSchemaOptional = saudiPhoneSchema.optional()

/**
 * Optional Saudi IBAN Schema
 */
export const saudiIbanSchemaOptional = saudiIbanSchema.optional()

/**
 * Optional Saudi Commercial Registration Number Schema
 */
export const saudiCrNumberSchemaOptional = saudiCrNumberSchema.optional()

/**
 * Optional Saudi VAT Number Schema
 */
export const saudiVatNumberSchemaOptional = saudiVatNumberSchema.optional()

// ============================================================================
// Conditional Validators (with custom logic)
// ============================================================================

/**
 * Creates a conditional National ID validator
 * @param condition - Function that determines if validation should be applied
 * @returns Zod schema that validates only when condition is true
 */
export const conditionalNationalId = (condition: (data: any) => boolean) =>
  z.string().superRefine((val, ctx) => {
    if (condition(ctx) && !validationPatterns.nationalId.test(val.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessages.nationalId.ar,
      })
    }
  })

/**
 * Creates a conditional Phone validator
 * @param condition - Function that determines if validation should be applied
 * @returns Zod schema that validates only when condition is true
 */
export const conditionalPhone = (condition: (data: any) => boolean) =>
  z.string().superRefine((val, ctx) => {
    if (condition(ctx) && val && !validationPatterns.phone.test(val.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessages.phone.ar,
      })
    }
  })

/**
 * Creates a conditional IBAN validator
 * @param condition - Function that determines if validation should be applied
 * @returns Zod schema that validates only when condition is true
 */
export const conditionalIban = (condition: (data: any) => boolean) =>
  z.string().superRefine((val, ctx) => {
    if (condition(ctx)) {
      const upper = val.trim().toUpperCase()
      if (!validationPatterns.iban.test(upper)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorMessages.iban.ar,
        })
      } else if (!validateIbanChecksum(upper)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'رقم الآيبان غير صحيح (فشل التحقق من المجموع الاختباري)',
        })
      }
    }
  })

// ============================================================================
// Export All
// ============================================================================

export default {
  saudiNationalIdSchema,
  saudiPhoneSchema,
  saudiIbanSchema,
  saudiCrNumberSchema,
  saudiVatNumberSchema,
  saudiNationalIdSchemaOptional,
  saudiPhoneSchemaOptional,
  saudiIbanSchemaOptional,
  saudiCrNumberSchemaOptional,
  saudiVatNumberSchemaOptional,
  conditionalNationalId,
  conditionalPhone,
  conditionalIban,
}

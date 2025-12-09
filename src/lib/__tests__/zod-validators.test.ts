import { describe, it, expect } from 'vitest'
import {
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
} from '../zod-validators'

describe('saudiNationalIdSchema', () => {
  it('should validate correct National IDs starting with 1', () => {
    const validIds = ['1234567890', '1000000000', '1999999999']

    validIds.forEach(id => {
      const result = saudiNationalIdSchema.safeParse(id)
      expect(result.success).toBe(true)
    })
  })

  it('should validate correct National IDs starting with 2', () => {
    const validIds = ['2234567890', '2000000000', '2999999999']

    validIds.forEach(id => {
      const result = saudiNationalIdSchema.safeParse(id)
      expect(result.success).toBe(true)
    })
  })

  it('should reject National IDs not starting with 1 or 2', () => {
    const invalidIds = ['0234567890', '3234567890', '9234567890']

    invalidIds.forEach(id => {
      const result = saudiNationalIdSchema.safeParse(id)
      expect(result.success).toBe(false)
    })
  })

  it('should reject National IDs with incorrect length', () => {
    const invalidIds = ['123456789', '12345678901', '1234']

    invalidIds.forEach(id => {
      const result = saudiNationalIdSchema.safeParse(id)
      expect(result.success).toBe(false)
    })
  })

  it('should trim whitespace before validation', () => {
    const result = saudiNationalIdSchema.safeParse('  1234567890  ')
    expect(result.success).toBe(true)
  })

  it('should reject non-numeric National IDs', () => {
    const invalidIds = ['12345678ab', '1234567-90', '1 234567890']

    invalidIds.forEach(id => {
      const result = saudiNationalIdSchema.safeParse(id)
      expect(result.success).toBe(false)
    })
  })

  it('should reject empty string', () => {
    const result = saudiNationalIdSchema.safeParse('')
    expect(result.success).toBe(false)
  })
})

describe('saudiPhoneSchema', () => {
  it('should validate phone numbers with +966 prefix', () => {
    const validPhones = ['+966501234567', '+966512345678', '+966599999999']

    validPhones.forEach(phone => {
      const result = saudiPhoneSchema.safeParse(phone)
      expect(result.success).toBe(true)
    })
  })

  it('should validate phone numbers with 966 prefix', () => {
    const validPhones = ['966501234567', '966512345678']

    validPhones.forEach(phone => {
      const result = saudiPhoneSchema.safeParse(phone)
      expect(result.success).toBe(true)
    })
  })

  it('should validate phone numbers with 05 prefix', () => {
    const validPhones = ['0501234567', '0512345678', '0599999999']

    validPhones.forEach(phone => {
      const result = saudiPhoneSchema.safeParse(phone)
      expect(result.success).toBe(true)
    })
  })

  it('should reject invalid phone numbers', () => {
    const invalidPhones = [
      '1234567890',      // Wrong prefix
      '+967501234567',   // Wrong country code
      '05012345',        // Too short
      '050123456789012', // Too long
      '+966-50-1234567', // Contains dashes
      '',                // Empty
    ]

    invalidPhones.forEach(phone => {
      const result = saudiPhoneSchema.safeParse(phone)
      expect(result.success).toBe(false)
    })
  })

  it('should trim whitespace before validation', () => {
    const result = saudiPhoneSchema.safeParse('  +966501234567  ')
    expect(result.success).toBe(true)
  })

  it('should handle 8-digit and 9-digit phone numbers', () => {
    const validPhones = ['+96650123456', '+966501234567']

    validPhones.forEach(phone => {
      const result = saudiPhoneSchema.safeParse(phone)
      expect(result.success).toBe(true)
    })
  })
})

describe('saudiIbanSchema', () => {
  it('should validate correct IBAN with valid checksum', () => {
    // Valid Saudi IBAN with correct checksum
    const validIban = 'SA0380000000608010167519'
    const result = saudiIbanSchema.safeParse(validIban)
    expect(result.success).toBe(true)
  })

  it('should convert lowercase to uppercase', () => {
    const result = saudiIbanSchema.safeParse('sa0380000000608010167519')
    expect(result.success).toBe(true)
  })

  it('should reject IBAN with invalid checksum', () => {
    // Invalid checksum (changed last digit)
    const invalidIban = 'SA0380000000608010167518'
    const result = saudiIbanSchema.safeParse(invalidIban)

    // Should fail validation
    expect(result.success).toBe(false)
  })

  it('should reject IBAN with incorrect length', () => {
    const invalidIbans = [
      'SA038000000060801016751',   // Too short
      'SA03800000006080101675199', // Too long
    ]

    invalidIbans.forEach(iban => {
      const result = saudiIbanSchema.safeParse(iban)
      expect(result.success).toBe(false)
    })
  })

  it('should reject IBAN not starting with SA', () => {
    const invalidIbans = [
      'AE0380000000608010167519',
      'KW0380000000608010167519',
      '0380000000608010167519',
    ]

    invalidIbans.forEach(iban => {
      const result = saudiIbanSchema.safeParse(iban)
      expect(result.success).toBe(false)
    })
  })

  it('should trim whitespace and convert to uppercase', () => {
    const result = saudiIbanSchema.safeParse('  sa0380000000608010167519  ')
    expect(result.success).toBe(true)
  })

  it('should reject IBAN with non-numeric characters after SA', () => {
    const invalidIban = 'SA03800000006080101675AB'
    const result = saudiIbanSchema.safeParse(invalidIban)
    expect(result.success).toBe(false)
  })

  it('should validate multiple valid IBANs', () => {
    const validIbans = [
      'SA0380000000608010167519',
      'SA4420000001234567891234',
    ]

    validIbans.forEach(iban => {
      const result = saudiIbanSchema.safeParse(iban)
      expect(result.success).toBe(true)
    })
  })
})

describe('saudiCrNumberSchema', () => {
  it('should validate correct CR numbers', () => {
    const validCRs = ['1234567890', '0000000000', '9999999999']

    validCRs.forEach(cr => {
      const result = saudiCrNumberSchema.safeParse(cr)
      expect(result.success).toBe(true)
    })
  })

  it('should reject CR numbers with incorrect length', () => {
    const invalidCRs = ['123456789', '12345678901', '12345']

    invalidCRs.forEach(cr => {
      const result = saudiCrNumberSchema.safeParse(cr)
      expect(result.success).toBe(false)
    })
  })

  it('should reject non-numeric CR numbers', () => {
    const invalidCRs = ['12345678ab', '1234567-90', '1 234567890']

    invalidCRs.forEach(cr => {
      const result = saudiCrNumberSchema.safeParse(cr)
      expect(result.success).toBe(false)
    })
  })

  it('should trim whitespace before validation', () => {
    const result = saudiCrNumberSchema.safeParse('  1234567890  ')
    expect(result.success).toBe(true)
  })

  it('should reject empty string', () => {
    const result = saudiCrNumberSchema.safeParse('')
    expect(result.success).toBe(false)
  })
})

describe('saudiVatNumberSchema', () => {
  it('should validate correct VAT numbers starting with 3', () => {
    const validVATs = ['300000000000000', '311111111111111', '399999999999999']

    validVATs.forEach(vat => {
      const result = saudiVatNumberSchema.safeParse(vat)
      expect(result.success).toBe(true)
    })
  })

  it('should reject VAT numbers not starting with 3', () => {
    const invalidVATs = ['100000000000000', '200000000000000', '900000000000000']

    invalidVATs.forEach(vat => {
      const result = saudiVatNumberSchema.safeParse(vat)
      expect(result.success).toBe(false)
    })
  })

  it('should reject VAT numbers with incorrect length', () => {
    const invalidVATs = ['30000000000000', '3000000000000001', '3000']

    invalidVATs.forEach(vat => {
      const result = saudiVatNumberSchema.safeParse(vat)
      expect(result.success).toBe(false)
    })
  })

  it('should reject non-numeric VAT numbers', () => {
    const invalidVATs = ['30000000000000a', '300000000000-00', '3 00000000000000']

    invalidVATs.forEach(vat => {
      const result = saudiVatNumberSchema.safeParse(vat)
      expect(result.success).toBe(false)
    })
  })

  it('should trim whitespace before validation', () => {
    const result = saudiVatNumberSchema.safeParse('  300000000000000  ')
    expect(result.success).toBe(true)
  })

  it('should reject empty string', () => {
    const result = saudiVatNumberSchema.safeParse('')
    expect(result.success).toBe(false)
  })
})

describe('Optional Schemas', () => {
  it('should allow undefined for optional National ID', () => {
    const result = saudiNationalIdSchemaOptional.safeParse(undefined)
    expect(result.success).toBe(true)
  })

  it('should allow undefined for optional Phone', () => {
    const result = saudiPhoneSchemaOptional.safeParse(undefined)
    expect(result.success).toBe(true)
  })

  it('should allow undefined for optional IBAN', () => {
    const result = saudiIbanSchemaOptional.safeParse(undefined)
    expect(result.success).toBe(true)
  })

  it('should allow undefined for optional CR Number', () => {
    const result = saudiCrNumberSchemaOptional.safeParse(undefined)
    expect(result.success).toBe(true)
  })

  it('should allow undefined for optional VAT Number', () => {
    const result = saudiVatNumberSchemaOptional.safeParse(undefined)
    expect(result.success).toBe(true)
  })

  it('should still validate when value is provided for optional schemas', () => {
    const invalidId = '0234567890'
    const result = saudiNationalIdSchemaOptional.safeParse(invalidId)
    expect(result.success).toBe(false)
  })
})

describe('Conditional Validators', () => {
  it('should validate conditionally based on condition function', () => {
    const schema = conditionalNationalId(() => true)
    const result = schema.safeParse('1234567890')
    expect(result.success).toBe(true)
  })

  it('should skip validation when condition is false', () => {
    const schema = conditionalNationalId(() => false)
    // Even invalid ID should pass when condition is false
    const result = schema.safeParse('invalid')
    expect(result.success).toBe(true)
  })

  it('should validate conditional phone when condition is true', () => {
    const schema = conditionalPhone(() => true)
    const result = schema.safeParse('+966501234567')
    expect(result.success).toBe(true)
  })

  it('should fail conditional phone validation with invalid number when condition is true', () => {
    const schema = conditionalPhone(() => true)
    const result = schema.safeParse('invalid')
    expect(result.success).toBe(false)
  })

  it('should validate conditional IBAN with checksum when condition is true', () => {
    const schema = conditionalIban(() => true)
    const result = schema.safeParse('SA0380000000608010167519')
    expect(result.success).toBe(true)
  })

  it('should fail conditional IBAN with invalid checksum when condition is true', () => {
    const schema = conditionalIban(() => true)
    const result = schema.safeParse('SA0380000000608010167518')
    expect(result.success).toBe(false)
  })

  it('should allow empty conditional phone when condition is false', () => {
    const schema = conditionalPhone(() => false)
    const result = schema.safeParse('')
    expect(result.success).toBe(true)
  })
})

describe('Edge Cases', () => {
  it('should handle very long strings for National ID', () => {
    const result = saudiNationalIdSchema.safeParse('1'.repeat(100))
    expect(result.success).toBe(false)
  })

  it('should handle special characters in phone number', () => {
    const result = saudiPhoneSchema.safeParse('+966-50-1234567')
    expect(result.success).toBe(false)
  })

  it('should handle IBAN with spaces', () => {
    // Spaces should be trimmed, but internal spaces should fail
    const result = saudiIbanSchema.safeParse('SA03 8000 0000 6080 1016 7519')
    expect(result.success).toBe(false)
  })

  it('should handle mixed case IBAN', () => {
    const result = saudiIbanSchema.safeParse('Sa0380000000608010167519')
    expect(result.success).toBe(true)
  })

  it('should reject null values', () => {
    const result = saudiNationalIdSchema.safeParse(null)
    expect(result.success).toBe(false)
  })

  it('should handle leading zeros in CR number', () => {
    const result = saudiCrNumberSchema.safeParse('0000000001')
    expect(result.success).toBe(true)
  })

  it('should handle leading zeros in VAT number but reject if not starting with 3', () => {
    const result = saudiVatNumberSchema.safeParse('000000000000003')
    expect(result.success).toBe(false)
  })
})

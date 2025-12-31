/**
 * Validation Patterns Utility
 * Saudi-specific validation patterns and helper functions for client-side form validation
 */

// ============================================================================
// Types
// ============================================================================

export type ValidationPatternKey =
  | 'nationalId'
  | 'iban'
  | 'phone'
  | 'crNumber'
  | 'password'
  | 'otp'
  | 'email'
  | 'vatNumber';

export type ValidationResult = {
  isValid: boolean;
  error?: {
    en: string;
    ar: string;
  };
};

export type ErrorMessages = {
  en: string;
  ar: string;
};

// ============================================================================
// Validation Patterns
// ============================================================================

export const validationPatterns = {
  // MongoDB ObjectId (24 hexadecimal characters)
  objectId: /^[0-9a-fA-F]{24}$/,

  // Saudi National ID (starts with 1 or 2, 10 digits)
  nationalId: /^[12]\d{9}$/,

  // Saudi IBAN (SA + 22 digits)
  iban: /^SA\d{22}$/,

  // Saudi phone - Strict E.164 format (+9665XXXXXXXX)
  phone: /^\+966[5][0-9]{8}$/,

  // Saudi phone - Lenient format (accepts various inputs for transformation)
  phoneLenient: /^(\+966|966|0)?5[0-9]{8}$/,

  // Commercial Registration (10 digits)
  crNumber: /^\d{10}$/,

  // Password (min 8, uppercase, lowercase, number)
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,

  // OTP (6 digits)
  otp: /^[0-9]{6}$/,

  // Email - RFC 5322 compliant
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

  // Saudi VAT number (15 digits starting with 3)
  vatNumber: /^3\d{14}$/,
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const errorMessages: Record<ValidationPatternKey, ErrorMessages> = {
  nationalId: {
    en: 'National ID must be 10 digits starting with 1 or 2',
    ar: 'رقم الهوية الوطنية يجب أن يكون 10 أرقام تبدأ بـ 1 أو 2',
  },
  iban: {
    en: 'IBAN must start with SA followed by 22 digits',
    ar: 'رقم الآيبان يجب أن يبدأ بـ SA متبوعاً بـ 22 رقماً',
  },
  phone: {
    en: 'Phone number must be a valid Saudi number (e.g., +966501234567 or 0501234567)',
    ar: 'رقم الهاتف يجب أن يكون رقم سعودي صالح (مثال: +966501234567 أو 0501234567)',
  },
  crNumber: {
    en: 'Commercial Registration must be exactly 10 digits',
    ar: 'رقم السجل التجاري يجب أن يكون 10 أرقام بالضبط',
  },
  password: {
    en: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    ar: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حروف كبيرة وصغيرة وأرقام',
  },
  otp: {
    en: 'OTP must be exactly 6 digits',
    ar: 'رمز التحقق يجب أن يكون 6 أرقام بالضبط',
  },
  email: {
    en: 'Please enter a valid email address',
    ar: 'يرجى إدخال عنوان بريد إلكتروني صالح',
  },
  vatNumber: {
    en: 'VAT number must be 15 digits starting with 3',
    ar: 'رقم الضريبة يجب أن يكون 15 رقماً يبدأ بـ 3',
  },
};

// ============================================================================
// Validator Functions
// ============================================================================

/**
 * Validates a Saudi National ID
 * @param value - The national ID to validate
 * @returns true if valid, false otherwise
 */
export const isValidNationalId = (value: string): boolean => {
  if (!value) return false;
  return validationPatterns.nationalId.test(value.trim());
};

/**
 * Validates IBAN checksum using mod-97 algorithm
 * @param iban - The IBAN to validate (should be clean, uppercase)
 * @returns true if checksum is valid, false otherwise
 */
const validateIBANChecksum = (iban: string): boolean => {
  // Move first 4 characters to end
  const rearranged = iban.slice(4) + iban.slice(0, 4);

  // Replace letters with numbers (A=10, B=11, ..., Z=35)
  const numericString = rearranged
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        // A-Z
        return (code - 55).toString();
      }
      return char;
    })
    .join('');

  // Calculate mod 97
  let remainder = 0;
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
  }

  return remainder === 1;
};

/**
 * Validates a Saudi IBAN (basic format check only)
 * @param value - The IBAN to validate
 * @returns true if valid format, false otherwise
 */
export const isValidIban = (value: string): boolean => {
  if (!value) return false;
  return validationPatterns.iban.test(value.trim().toUpperCase());
};

/**
 * Validates a Saudi IBAN with checksum verification
 * @param value - The IBAN to validate
 * @param checkChecksum - Whether to validate the checksum (default: true)
 * @returns true if valid, false otherwise
 */
export const isValidIbanWithChecksum = (value: string, checkChecksum: boolean = true): boolean => {
  if (!value) return false;

  const cleanIBAN = value.replace(/\s/g, '').toUpperCase();

  // First check the format
  if (!validationPatterns.iban.test(cleanIBAN)) {
    return false;
  }

  // Then check the checksum if requested
  if (checkChecksum) {
    return validateIBANChecksum(cleanIBAN);
  }

  return true;
};

/**
 * Validates a Saudi phone number
 * @param value - The phone number to validate
 * @returns true if valid, false otherwise
 */
export const isValidPhone = (value: string): boolean => {
  if (!value) return false;
  return validationPatterns.phone.test(value.trim());
};

/**
 * Validates a Commercial Registration number
 * @param value - The CR number to validate
 * @returns true if valid, false otherwise
 */
export const isValidCrNumber = (value: string): boolean => {
  if (!value) return false;
  return validationPatterns.crNumber.test(value.trim());
};

/**
 * Validates a password
 * @param value - The password to validate
 * @returns true if valid, false otherwise
 */
export const isValidPassword = (value: string): boolean => {
  if (!value) return false;
  return validationPatterns.password.test(value);
};

/**
 * Validates an OTP code
 * @param value - The OTP to validate
 * @returns true if valid, false otherwise
 */
export const isValidOtp = (value: string): boolean => {
  if (!value) return false;
  return validationPatterns.otp.test(value.trim());
};

/**
 * Validates an email address
 * @param value - The email to validate
 * @returns true if valid, false otherwise
 */
export const isValidEmail = (value: string): boolean => {
  if (!value) return false;
  return validationPatterns.email.test(value.trim());
};

/**
 * Validates a Saudi VAT number
 * @param value - The VAT number to validate
 * @returns true if valid, false otherwise
 */
export const isValidVatNumber = (value: string): boolean => {
  if (!value) return false;
  return validationPatterns.vatNumber.test(value.trim());
};

/**
 * Validates a MongoDB ObjectId
 * @param value - The ID to validate
 * @returns true if valid 24-character hex string, false otherwise
 */
export const isValidObjectId = (value: string | undefined | null): boolean => {
  if (!value || typeof value !== 'string') return false;
  return validationPatterns.objectId.test(value.trim());
};

// Map of validator functions
export const validators: Record<ValidationPatternKey, (value: string) => boolean> = {
  nationalId: isValidNationalId,
  iban: isValidIban,
  phone: isValidPhone,
  crNumber: isValidCrNumber,
  password: isValidPassword,
  otp: isValidOtp,
  email: isValidEmail,
  vatNumber: isValidVatNumber,
};

// ============================================================================
// Error Message Functions
// ============================================================================

/**
 * Gets the error message for a specific validation pattern
 * @param patternKey - The validation pattern key
 * @param language - The language for the error message ('en' or 'ar')
 * @returns The error message in the specified language
 */
export const getErrorMessage = (
  patternKey: ValidationPatternKey,
  language: 'en' | 'ar' = 'en'
): string => {
  return errorMessages[patternKey][language];
};

/**
 * Gets both Arabic and English error messages for a pattern
 * @param patternKey - The validation pattern key
 * @returns Object containing error messages in both languages
 */
export const getErrorMessages = (patternKey: ValidationPatternKey): ErrorMessages => {
  return errorMessages[patternKey];
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates a value against a specific validation pattern
 * @param value - The value to validate
 * @param patternKey - The validation pattern to use
 * @returns ValidationResult object with isValid flag and optional error messages
 */
export const validate = (
  value: string,
  patternKey: ValidationPatternKey
): ValidationResult => {
  const isValid = validators[patternKey](value);

  if (isValid) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: errorMessages[patternKey],
  };
};

/**
 * Validates a value against a custom regex pattern
 * @param value - The value to validate
 * @param pattern - The regex pattern to test against
 * @returns true if valid, false otherwise
 */
export const validatePattern = (value: string, pattern: RegExp): boolean => {
  if (!value) return false;
  return pattern.test(value.trim());
};

/**
 * Validates multiple fields at once
 * @param fields - Object with field names as keys and their values
 * @param patterns - Object mapping field names to validation pattern keys
 * @returns Object with field names as keys and ValidationResult as values
 */
export const validateMultiple = (
  fields: Record<string, string>,
  patterns: Record<string, ValidationPatternKey>
): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};

  Object.keys(fields).forEach((fieldName) => {
    const patternKey = patterns[fieldName];
    if (patternKey) {
      results[fieldName] = validate(fields[fieldName], patternKey);
    }
  });

  return results;
};

/**
 * Checks if all validation results are valid
 * @param results - Object containing validation results
 * @returns true if all results are valid, false otherwise
 */
export const isAllValid = (results: Record<string, ValidationResult>): boolean => {
  return Object.values(results).every((result) => result.isValid);
};

/**
 * Formats a phone number to Saudi standard format
 * @param value - The phone number to format
 * @returns Formatted phone number starting with +966
 */
export const formatSaudiPhone = (value: string): string => {
  if (!value) return '';

  let cleaned = value.replace(/\D/g, '');

  // Remove leading 966 or 0
  if (cleaned.startsWith('966')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  return `+966${cleaned}`;
};

/**
 * Formats an IBAN to Saudi standard format
 * @param value - The IBAN to format
 * @returns Formatted IBAN starting with SA
 */
export const formatSaudiIban = (value: string): string => {
  if (!value) return '';

  let cleaned = value.replace(/\s/g, '').toUpperCase();

  // Ensure it starts with SA
  if (!cleaned.startsWith('SA')) {
    cleaned = 'SA' + cleaned;
  }

  // Add spaces for readability (SA00 0000 0000 0000 0000 0000)
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

// ============================================================================
// Export All
// ============================================================================

// ============================================================================
// Input Length Constants (Enterprise Security Standard)
// ============================================================================

export const INPUT_MAX_LENGTHS = {
  // Person fields
  name: 100,
  firstName: 50,
  lastName: 50,

  // Contact fields
  email: 254,       // RFC 5321 max
  phone: 20,        // +9665XXXXXXXX = 13 chars

  // Text fields
  notes: 2000,
  description: 5000,
  address: 500,

  // Short text
  title: 200,
  subject: 200,

  // IDs
  nationalId: 10,
  crNumber: 10,
  iban: 24,
  vatNumber: 15,

  // Misc
  otp: 6,
  password: 128,
  meetingLink: 500,
} as const;

// ============================================================================
// Data Masking Functions (PDPL Compliance)
// ============================================================================

/**
 * Masks an email address for privacy
 * Example: "ahmed.mohammed@example.com" → "a***@e******.com"
 *
 * @param email - The email to mask
 * @returns Masked email string
 */
export const maskEmail = (email: string | undefined | null): string => {
  if (!email || typeof email !== 'string') return '***@***.***';

  const atIndex = email.indexOf('@');
  if (atIndex === -1) return '***@***.***';

  const local = email.substring(0, atIndex);
  const domain = email.substring(atIndex + 1);

  // Mask local part: show first character + asterisks
  const maskedLocal = local.length > 1
    ? local[0] + '*'.repeat(Math.min(local.length - 1, 5))
    : '*';

  // Mask domain: show first character + asterisks before TLD
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return `${maskedLocal}@***.*`;

  const domainName = domainParts.slice(0, -1).join('.');
  const tld = domainParts[domainParts.length - 1];

  const maskedDomain = domainName.length > 1
    ? domainName[0] + '*'.repeat(Math.min(domainName.length - 1, 6))
    : '*';

  return `${maskedLocal}@${maskedDomain}.${tld}`;
};

/**
 * Masks a phone number for privacy
 * Example: "+966501234567" → "+966***4567"
 *
 * @param phone - The phone number to mask
 * @returns Masked phone string
 */
export const maskPhone = (phone: string | undefined | null): string => {
  if (!phone || typeof phone !== 'string') return '***';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length < 6) return '***';

  // Show country code + first digit + last 4 digits
  if (phone.startsWith('+')) {
    // E.164 format: +966XXXXXXXXX
    const countryCode = phone.substring(0, 4); // +966
    const lastFour = cleaned.slice(-4);
    return `${countryCode}***${lastFour}`;
  } else if (cleaned.startsWith('966')) {
    const lastFour = cleaned.slice(-4);
    return `+966***${lastFour}`;
  } else if (cleaned.startsWith('0')) {
    const lastFour = cleaned.slice(-4);
    return `0***${lastFour}`;
  }

  // Default masking
  const lastFour = cleaned.slice(-4);
  return `***${lastFour}`;
};

/**
 * Masks a national ID for privacy
 * Example: "1234567890" → "1***7890"
 *
 * @param nationalId - The national ID to mask
 * @returns Masked national ID string
 */
export const maskNationalId = (nationalId: string | undefined | null): string => {
  if (!nationalId || typeof nationalId !== 'string') return '***';

  const cleaned = nationalId.replace(/\D/g, '');
  if (cleaned.length < 6) return '***';

  return cleaned[0] + '***' + cleaned.slice(-4);
};

/**
 * Masks an IBAN for privacy
 * Example: "SA0380000000608010167519" → "SA03****7519"
 *
 * @param iban - The IBAN to mask
 * @returns Masked IBAN string
 */
export const maskIban = (iban: string | undefined | null): string => {
  if (!iban || typeof iban !== 'string') return '***';

  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  if (cleaned.length < 8) return '***';

  return cleaned.substring(0, 4) + '****' + cleaned.slice(-4);
};

/**
 * Checks if a phone number is valid for lenient input (before transformation)
 * Accepts: +966501234567, 966501234567, 0501234567, 501234567
 *
 * @param value - The phone number to validate
 * @returns true if valid for transformation
 */
export const isValidPhoneLenient = (value: string): boolean => {
  if (!value) return false;
  return validationPatterns.phoneLenient.test(value.trim().replace(/\s/g, ''));
};

/**
 * Transforms a phone number to E.164 format
 * @param value - The phone number to transform
 * @returns E.164 formatted phone (+9665XXXXXXXX) or original if invalid
 */
export const toE164Phone = (value: string): string => {
  if (!value) return '';

  const cleaned = value.replace(/\D/g, '');

  // Already has 966 prefix
  if (cleaned.startsWith('966') && cleaned.length === 12) {
    return '+' + cleaned;
  }

  // Starts with 0
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '+966' + cleaned.substring(1);
  }

  // Just the 9-digit number starting with 5
  if (cleaned.startsWith('5') && cleaned.length === 9) {
    return '+966' + cleaned;
  }

  // Already correct
  if (value.startsWith('+966') && cleaned.length === 12) {
    return value;
  }

  return value;
};

// ============================================================================
// Export All
// ============================================================================

export default {
  patterns: validationPatterns,
  validators,
  errorMessages,
  validate,
  validatePattern,
  validateMultiple,
  isAllValid,
  getErrorMessage,
  getErrorMessages,
  formatSaudiPhone,
  formatSaudiIban,
  // Individual validators
  isValidNationalId,
  isValidIban,
  isValidIbanWithChecksum,
  isValidPhone,
  isValidPhoneLenient,
  isValidCrNumber,
  isValidPassword,
  isValidOtp,
  isValidEmail,
  isValidVatNumber,
  isValidObjectId,
  // Data masking (PDPL)
  maskEmail,
  maskPhone,
  maskNationalId,
  maskIban,
  // Transformers
  toE164Phone,
  // Constants
  INPUT_MAX_LENGTHS,
};

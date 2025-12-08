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
  // Saudi National ID (starts with 1 or 2, 10 digits)
  nationalId: /^[12]\d{9}$/,

  // Saudi IBAN (SA + 22 digits)
  iban: /^SA\d{22}$/,

  // Saudi phone (+966 or 966 or 05 prefix)
  phone: /^(\+966|966|05)[0-9]{8,9}$/,

  // Commercial Registration (10 digits)
  crNumber: /^\d{10}$/,

  // Password (min 8, uppercase, lowercase, number)
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,

  // OTP (6 digits)
  otp: /^[0-9]{6}$/,

  // Email
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

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
 * Validates a Saudi IBAN
 * @param value - The IBAN to validate
 * @returns true if valid, false otherwise
 */
export const isValidIban = (value: string): boolean => {
  if (!value) return false;
  return validationPatterns.iban.test(value.trim().toUpperCase());
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
  isValidPhone,
  isValidCrNumber,
  isValidPassword,
  isValidOtp,
  isValidEmail,
  isValidVatNumber,
};

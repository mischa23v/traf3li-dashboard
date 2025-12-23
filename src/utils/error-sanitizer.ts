/**
 * Error Sanitization Utility
 *
 * Removes sensitive information from error objects before logging
 * Prevents PII, secrets, and confidential data from being exposed
 *
 * Security Compliance:
 * - PDPL (Saudi Arabia Personal Data Protection Law)
 * - GDPR Article 32 (Security of Processing)
 * - NCA ECC 13-1 (Information Classification)
 *
 * Usage:
 * ```typescript
 * import { sanitizeError } from '@/utils/error-sanitizer'
 *
 * try {
 *   await api.login({ email, password })
 * } catch (error) {
 *   // Sanitize before logging - removes password, tokens, etc.
 *   logger.error('Login failed', sanitizeError(error))
 * }
 * ```
 */

/**
 * List of field names that contain sensitive data
 * These will be redacted in error logs
 */
const SENSITIVE_FIELD_NAMES = [
  // Authentication & Authorization
  'password',
  'newPassword',
  'oldPassword',
  'currentPassword',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'idToken',
  'apiKey',
  'api_key',
  'secret',
  'secretKey',
  'privateKey',
  'authorization',
  'auth',
  'bearer',

  // Session & Cookies
  'cookie',
  'cookies',
  'sessionId',
  'session_id',
  'csrf',
  'csrfToken',
  'xsrf',

  // Personal Identifiable Information (PII)
  'ssn',
  'socialSecurityNumber',
  'nationalId',
  'nationalIdNumber',
  'passport',
  'passportNumber',
  'drivingLicense',
  'taxId',

  // Financial Information
  'creditCard',
  'creditCardNumber',
  'cardNumber',
  'cvv',
  'cvc',
  'cardCvv',
  'iban',
  'accountNumber',
  'bankAccount',
  'routingNumber',

  // Healthcare
  'medicalRecord',
  'diagnosis',
  'prescription',

  // Biometric
  'fingerprint',
  'faceData',
  'biometric',

  // Security Codes
  'otp',
  'mfaCode',
  'verificationCode',
  'pin',
  'securityCode',

  // Encryption Keys
  'encryptionKey',
  'decryptionKey',
  'publicKey',
] as const

/**
 * Patterns to detect sensitive data in string values
 */
const SENSITIVE_PATTERNS = [
  // Credit card numbers (basic pattern)
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,

  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Phone numbers (international format)
  /\+?\d{1,4}?[\s.-]?\(?\d{1,3}?\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g,

  // Saudi National ID (10 digits)
  /\b[12]\d{9}\b/g,

  // JWT tokens (basic pattern)
  /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,

  // API keys (common patterns)
  /[a-zA-Z0-9_-]{32,}/g,
] as const

/**
 * Redaction marker
 */
const REDACTED = '[REDACTED]'

/**
 * Check if a field name is sensitive
 */
function isSensitiveField(fieldName: string): boolean {
  const lowerFieldName = fieldName.toLowerCase()
  return SENSITIVE_FIELD_NAMES.some(
    sensitive => lowerFieldName.includes(sensitive.toLowerCase())
  )
}

/**
 * Sanitize a string value by removing sensitive patterns
 */
function sanitizeString(value: string): string {
  let sanitized = value

  // Apply all sensitive patterns
  SENSITIVE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, REDACTED)
  })

  return sanitized
}

/**
 * Sanitize an object by removing sensitive fields
 * Recursively sanitizes nested objects and arrays
 */
function sanitizeObject(obj: any, depth: number = 0): any {
  // Prevent infinite recursion
  if (depth > 10) return '[MAX_DEPTH_EXCEEDED]'

  // Handle null/undefined
  if (obj === null || obj === undefined) return obj

  // Handle primitives
  if (typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1))
  }

  // Handle Error objects specially
  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: sanitizeString(obj.message),
      // Don't include stack trace in sanitized version
      // stack: obj.stack, // Commented out for security
    }
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString()
  }

  // Handle regular objects
  const sanitized: any = {}

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue

    // Check if field name is sensitive
    if (isSensitiveField(key)) {
      sanitized[key] = REDACTED
      continue
    }

    // Recursively sanitize nested objects
    const value = obj[key]

    if (value === null || value === undefined) {
      sanitized[key] = value
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, depth + 1)
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Main sanitization function
 * Accepts any type and returns sanitized version
 */
export function sanitizeError(error: any): any {
  try {
    return sanitizeObject(error, 0)
  } catch (sanitizationError) {
    // If sanitization fails, return a safe error object
    return {
      error: 'SANITIZATION_FAILED',
      message: 'Could not sanitize error object',
    }
  }
}

/**
 * Sanitize for logging - additional safety for console logs
 * Removes stack traces and limits depth
 */
export function sanitizeForLogging(error: any): any {
  const sanitized = sanitizeError(error)

  // Remove stack trace for production logs
  if (import.meta.env.PROD && sanitized && typeof sanitized === 'object') {
    delete sanitized.stack
    delete sanitized.componentStack
  }

  return sanitized
}

/**
 * Sanitize error message only
 * Useful when you only need the message
 */
export function sanitizeErrorMessage(error: any): string {
  if (!error) return 'Unknown error'

  if (typeof error === 'string') {
    return sanitizeString(error)
  }

  if (error.message) {
    return sanitizeString(error.message)
  }

  if (error.error && typeof error.error === 'string') {
    return sanitizeString(error.error)
  }

  return 'An error occurred'
}

/**
 * Check if an object contains sensitive data
 * Useful for validation before logging
 */
export function containsSensitiveData(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (isSensitiveField(key)) return true

      // Check nested objects
      if (typeof obj[key] === 'object') {
        if (containsSensitiveData(obj[key])) return true
      }
    }
  }

  return false
}

/**
 * Add custom sensitive field names
 * Useful for domain-specific fields
 */
const customSensitiveFields: string[] = []

export function addSensitiveField(fieldName: string): void {
  if (!customSensitiveFields.includes(fieldName)) {
    customSensitiveFields.push(fieldName)
  }
}

/**
 * Remove custom sensitive field names
 */
export function removeSensitiveField(fieldName: string): void {
  const index = customSensitiveFields.indexOf(fieldName)
  if (index > -1) {
    customSensitiveFields.splice(index, 1)
  }
}

/**
 * Get all sensitive field names (including custom)
 */
export function getSensitiveFields(): readonly string[] {
  return [...SENSITIVE_FIELD_NAMES, ...customSensitiveFields]
}

export default sanitizeError

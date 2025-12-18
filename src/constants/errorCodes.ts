/**
 * API Error Codes Reference
 * Centralized error code definitions for consistent handling
 * Aligned with backend error responses
 */

// Error code string constants
export const ERROR_CODES = {
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  AUTH_RATE_LIMIT: 'AUTH_RATE_LIMIT',

  // Authentication
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_NOT_ACTIVE: 'TOKEN_NOT_ACTIVE',

  // Session
  SESSION_IDLE_TIMEOUT: 'SESSION_IDLE_TIMEOUT',
  SESSION_ABSOLUTE_TIMEOUT: 'SESSION_ABSOLUTE_TIMEOUT',

  // Account Lockout
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',

  // Login Errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',

  // CSRF
  CSRF_TOKEN_INVALID: 'CSRF_TOKEN_INVALID',
  CSRF_TOKEN_MISSING: 'CSRF_TOKEN_MISSING',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Circuit Breaker
  CIRCUIT_OPEN: 'CIRCUIT_OPEN',

  // Request
  CANCELLED: 'CANCELLED',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

/**
 * Error metadata for UI handling
 */
export interface ErrorMetadata {
  code: ErrorCode
  action: 'redirect_login' | 'show_lockout_timer' | 'show_retry_timer' | 'show_error' | 'show_field_errors' | 'reload'
  messageAr: string
  messageEn: string
}

/**
 * Error code definitions with actions and default messages
 */
export const API_ERROR_CODES: Record<ErrorCode, ErrorMetadata> = {
  // HTTP 401 - Unauthorized
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    action: 'redirect_login',
    messageAr: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
    messageEn: 'Your session has expired. Please log in again.',
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    action: 'redirect_login',
    messageAr: 'مصادقة غير صالحة. يرجى تسجيل الدخول مرة أخرى.',
    messageEn: 'Invalid authentication. Please log in again.',
  },
  TOKEN_NOT_ACTIVE: {
    code: 'TOKEN_NOT_ACTIVE',
    action: 'redirect_login',
    messageAr: 'الرمز غير نشط. يرجى تسجيل الدخول مرة أخرى.',
    messageEn: 'Token not active. Please log in again.',
  },
  SESSION_IDLE_TIMEOUT: {
    code: 'SESSION_IDLE_TIMEOUT',
    action: 'redirect_login',
    messageAr: 'انتهت جلستك بسبب عدم النشاط.',
    messageEn: 'Session expired due to inactivity.',
  },
  SESSION_ABSOLUTE_TIMEOUT: {
    code: 'SESSION_ABSOLUTE_TIMEOUT',
    action: 'redirect_login',
    messageAr: 'انتهت جلستك (الحد الأقصى 24 ساعة).',
    messageEn: 'Session expired (24-hour limit).',
  },

  // HTTP 423 - Locked
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    action: 'show_lockout_timer',
    messageAr: 'الحساب مقفل مؤقتاً بسبب محاولات تسجيل دخول فاشلة متعددة.',
    messageEn: 'Account temporarily locked due to too many failed attempts.',
  },

  // HTTP 429 - Too Many Requests
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    action: 'show_retry_timer',
    messageAr: 'طلبات كثيرة جداً. يرجى الانتظار قبل المحاولة مرة أخرى.',
    messageEn: 'Too many requests. Please wait before trying again.',
  },
  AUTH_RATE_LIMIT: {
    code: 'AUTH_RATE_LIMIT',
    action: 'show_retry_timer',
    messageAr: 'محاولات تسجيل دخول كثيرة جداً. يرجى الانتظار.',
    messageEn: 'Too many login attempts. Please wait.',
  },

  // HTTP 400 - Bad Request
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    action: 'show_error',
    messageAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    messageEn: 'Invalid email or password.',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    action: 'show_error',
    messageAr: 'المستخدم غير موجود.',
    messageEn: 'User not found.',
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    action: 'show_field_errors',
    messageAr: 'يرجى التحقق من المدخلات.',
    messageEn: 'Please check your input.',
  },

  // CSRF
  CSRF_TOKEN_INVALID: {
    code: 'CSRF_TOKEN_INVALID',
    action: 'reload',
    messageAr: 'انتهت صلاحية الجلسة. جارٍ إعادة التحميل...',
    messageEn: 'Session expired. Reloading...',
  },
  CSRF_TOKEN_MISSING: {
    code: 'CSRF_TOKEN_MISSING',
    action: 'reload',
    messageAr: 'خطأ في الجلسة. جارٍ إعادة التحميل...',
    messageEn: 'Session error. Reloading...',
  },

  // Circuit Breaker
  CIRCUIT_OPEN: {
    code: 'CIRCUIT_OPEN',
    action: 'show_retry_timer',
    messageAr: 'الخدمة غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.',
    messageEn: 'Service temporarily unavailable. Please try again later.',
  },

  // Request Cancelled
  CANCELLED: {
    code: 'CANCELLED',
    action: 'show_error',
    messageAr: 'تم إلغاء الطلب.',
    messageEn: 'Request cancelled.',
  },
}

/**
 * Logout reason messages for sign-in page
 */
export const LOGOUT_REASONS: Record<string, { messageAr: string; messageEn: string }> = {
  idle_timeout: {
    messageAr: 'تم تسجيل خروجك بسبب عدم النشاط.',
    messageEn: 'You were logged out due to inactivity.',
  },
  session_expired: {
    messageAr: 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.',
    messageEn: 'Your session has expired. Please log in again.',
  },
  token_expired: {
    messageAr: 'انتهت صلاحية جلستك.',
    messageEn: 'Your session has expired.',
  },
  socket_auth_failed: {
    messageAr: 'انقطع الاتصال. يرجى تسجيل الدخول مرة أخرى.',
    messageEn: 'Connection lost. Please log in again.',
  },
  account_locked: {
    messageAr: 'تم قفل حسابك مؤقتاً.',
    messageEn: 'Your account was temporarily locked.',
  },
  manual: {
    messageAr: 'تم تسجيل خروجك.',
    messageEn: 'You have been logged out.',
  },
}

/**
 * Get error metadata by code
 */
export function getErrorMetadata(code: string | undefined): ErrorMetadata | undefined {
  if (!code) return undefined
  return API_ERROR_CODES[code as ErrorCode]
}

/**
 * Get logout reason message
 */
export function getLogoutReasonMessage(reason: string | undefined, lang: 'ar' | 'en' = 'ar'): string | undefined {
  if (!reason) return undefined
  const messages = LOGOUT_REASONS[reason]
  return messages ? (lang === 'ar' ? messages.messageAr : messages.messageEn) : undefined
}

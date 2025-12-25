/**
 * Auth Error Codes and Messages
 * Centralized error handling for authentication
 */

/**
 * Authentication Error Codes
 */
export const AUTH_ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  PHONE_NOT_VERIFIED: 'PHONE_NOT_VERIFIED',

  // MFA errors
  MFA_REQUIRED: 'MFA_REQUIRED',
  MFA_INVALID_CODE: 'MFA_INVALID_CODE',
  MFA_NOT_ENABLED: 'MFA_NOT_ENABLED',
  MFA_ALREADY_ENABLED: 'MFA_ALREADY_ENABLED',

  // Session errors
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_IDLE_TIMEOUT: 'SESSION_IDLE_TIMEOUT',
  SESSION_ABSOLUTE_TIMEOUT: 'SESSION_ABSOLUTE_TIMEOUT',
  REAUTHENTICATION_REQUIRED: 'REAUTHENTICATION_REQUIRED',
  CONCURRENT_SESSION_LIMIT: 'CONCURRENT_SESSION_LIMIT',

  // Token errors
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',

  // CAPTCHA errors
  CAPTCHA_REQUIRED: 'CAPTCHA_REQUIRED',
  CAPTCHA_INVALID: 'CAPTCHA_INVALID',
  CAPTCHA_EXPIRED: 'CAPTCHA_EXPIRED',

  // Password errors
  PASSWORD_BREACHED: 'PASSWORD_BREACHED',
  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  PASSWORD_RECENTLY_USED: 'PASSWORD_RECENTLY_USED',
  PASSWORD_EXPIRED: 'PASSWORD_EXPIRED',
  PASSWORD_RESET_REQUIRED: 'PASSWORD_RESET_REQUIRED',
  PASSWORD_RESET_INVALID_TOKEN: 'PASSWORD_RESET_INVALID_TOKEN',

  // OTP errors
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_INVALID: 'OTP_INVALID',
  OTP_TOO_MANY_ATTEMPTS: 'OTP_TOO_MANY_ATTEMPTS',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  LOGIN_RATE_LIMITED: 'LOGIN_RATE_LIMITED',

  // CSRF
  CSRF_INVALID: 'CSRF_INVALID',
  CSRF_TOKEN_MISSING: 'CSRF_TOKEN_MISSING',

  // OAuth errors
  OAUTH_FAILED: 'OAUTH_FAILED',
  OAUTH_CANCELLED: 'OAUTH_CANCELLED',
  OAUTH_EMAIL_IN_USE: 'OAUTH_EMAIL_IN_USE',
  OAUTH_PROVIDER_NOT_LINKED: 'OAUTH_PROVIDER_NOT_LINKED',

  // Anonymous/Guest errors
  ANONYMOUS_EXPIRED: 'ANONYMOUS_EXPIRED',
  CONVERSION_FAILED: 'CONVERSION_FAILED',

  // General
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES]

/**
 * Error Message Data
 */
interface ErrorMessageData {
  retryAfter?: number
  breachCount?: number
  minLength?: number
  lockoutDuration?: number
  remainingAttempts?: number
  expiresAt?: string
}

/**
 * Get error message in Arabic
 *
 * @param code - Error code
 * @param data - Optional data for dynamic messages
 */
export const getErrorMessageAr = (
  code: AuthErrorCode | string,
  data: ErrorMessageData = {}
): string => {
  const messages: Record<string, string> = {
    // Authentication errors
    INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    ACCOUNT_LOCKED: `الحساب مقفل. حاول مرة أخرى بعد ${data.lockoutDuration || 15} دقيقة`,
    ACCOUNT_DISABLED: 'تم تعطيل هذا الحساب. تواصل مع الدعم',
    ACCOUNT_SUSPENDED: 'تم تعليق هذا الحساب. تواصل مع الدعم',
    EMAIL_NOT_VERIFIED: 'يرجى تأكيد بريدك الإلكتروني أولاً',
    PHONE_NOT_VERIFIED: 'يرجى تأكيد رقم الجوال أولاً',

    // MFA errors
    MFA_REQUIRED: 'يرجى إدخال رمز المصادقة الثنائية',
    MFA_INVALID_CODE: 'رمز التحقق غير صحيح',
    MFA_NOT_ENABLED: 'المصادقة الثنائية غير مفعلة',
    MFA_ALREADY_ENABLED: 'المصادقة الثنائية مفعلة بالفعل',

    // Session errors
    SESSION_EXPIRED: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
    SESSION_IDLE_TIMEOUT: 'انتهت جلستك بسبب عدم النشاط',
    SESSION_ABSOLUTE_TIMEOUT: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
    REAUTHENTICATION_REQUIRED: 'يرجى تأكيد هويتك للمتابعة',
    CONCURRENT_SESSION_LIMIT: 'تم تسجيل الدخول من جهاز آخر',

    // Token errors
    TOKEN_EXPIRED: 'انتهت صلاحية الرمز',
    TOKEN_INVALID: 'رمز غير صالح',
    TOKEN_REVOKED: 'تم إلغاء الرمز',
    REFRESH_TOKEN_EXPIRED: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',

    // CAPTCHA errors
    CAPTCHA_REQUIRED: 'يرجى إكمال التحقق من أنك لست روبوت',
    CAPTCHA_INVALID: 'فشل التحقق. يرجى المحاولة مرة أخرى',
    CAPTCHA_EXPIRED: 'انتهت صلاحية التحقق. يرجى المحاولة مرة أخرى',

    // Password errors
    PASSWORD_BREACHED: `كلمة المرور هذه موجودة في ${data.breachCount || ''} تسريب بيانات. اختر كلمة مرور أخرى`,
    PASSWORD_TOO_WEAK: 'كلمة المرور ضعيفة جداً',
    PASSWORD_TOO_SHORT: `كلمة المرور يجب أن تكون ${data.minLength || 8} أحرف على الأقل`,
    PASSWORD_RECENTLY_USED: 'لا يمكن استخدام كلمة مرور سابقة',
    PASSWORD_EXPIRED: 'انتهت صلاحية كلمة المرور. يرجى تغييرها',
    PASSWORD_RESET_REQUIRED: 'يرجى إعادة تعيين كلمة المرور',
    PASSWORD_RESET_INVALID_TOKEN: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية',

    // OTP errors
    OTP_EXPIRED: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد',
    OTP_INVALID: 'رمز التحقق غير صحيح',
    OTP_TOO_MANY_ATTEMPTS: 'محاولات كثيرة جداً. يرجى الانتظار',

    // Rate limiting
    RATE_LIMITED: `تم تجاوز الحد المسموح. حاول بعد ${data.retryAfter || 60} ثانية`,
    TOO_MANY_REQUESTS: 'طلبات كثيرة جداً. يرجى الانتظار',
    LOGIN_RATE_LIMITED: `محاولات تسجيل دخول كثيرة. حاول بعد ${data.retryAfter || 60} ثانية`,

    // CSRF
    CSRF_INVALID: 'انتهت صلاحية الجلسة. يرجى تحديث الصفحة',
    CSRF_TOKEN_MISSING: 'خطأ في الأمان. يرجى تحديث الصفحة',

    // OAuth errors
    OAUTH_FAILED: 'فشل المصادقة عبر المزود الخارجي',
    OAUTH_CANCELLED: 'تم إلغاء تسجيل الدخول',
    OAUTH_EMAIL_IN_USE: 'البريد الإلكتروني مستخدم بالفعل بحساب آخر',
    OAUTH_PROVIDER_NOT_LINKED: 'هذا المزود غير مربوط بحسابك',

    // Anonymous/Guest errors
    ANONYMOUS_EXPIRED: 'انتهت صلاحية جلسة الضيف. بياناتك محذوفة',
    CONVERSION_FAILED: 'فشل تحويل الحساب',

    // General
    UNAUTHORIZED: 'غير مصرح لك بالوصول',
    FORBIDDEN: 'ليس لديك صلاحية لهذا الإجراء',
    NETWORK_ERROR: 'لا يمكن الاتصال بالخادم. تحقق من اتصال الإنترنت',
    SERVER_ERROR: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً',
    UNKNOWN_ERROR: 'حدث خطأ غير متوقع',
  }

  return messages[code] || messages.UNKNOWN_ERROR
}

/**
 * Get error message in English
 *
 * @param code - Error code
 * @param data - Optional data for dynamic messages
 */
export const getErrorMessageEn = (
  code: AuthErrorCode | string,
  data: ErrorMessageData = {}
): string => {
  const messages: Record<string, string> = {
    // Authentication errors
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_LOCKED: `Account locked. Try again in ${data.lockoutDuration || 15} minutes`,
    ACCOUNT_DISABLED: 'This account has been disabled. Contact support',
    ACCOUNT_SUSPENDED: 'This account has been suspended. Contact support',
    EMAIL_NOT_VERIFIED: 'Please verify your email first',
    PHONE_NOT_VERIFIED: 'Please verify your phone number first',

    // MFA errors
    MFA_REQUIRED: 'Please enter your two-factor authentication code',
    MFA_INVALID_CODE: 'Invalid verification code',
    MFA_NOT_ENABLED: 'Two-factor authentication is not enabled',
    MFA_ALREADY_ENABLED: 'Two-factor authentication is already enabled',

    // Session errors
    SESSION_EXPIRED: 'Session expired. Please log in again',
    SESSION_IDLE_TIMEOUT: 'Your session ended due to inactivity',
    SESSION_ABSOLUTE_TIMEOUT: 'Session expired. Please log in again',
    REAUTHENTICATION_REQUIRED: 'Please confirm your identity to continue',
    CONCURRENT_SESSION_LIMIT: 'Logged in from another device',

    // Token errors
    TOKEN_EXPIRED: 'Token expired',
    TOKEN_INVALID: 'Invalid token',
    TOKEN_REVOKED: 'Token revoked',
    REFRESH_TOKEN_EXPIRED: 'Session expired. Please log in again',

    // CAPTCHA errors
    CAPTCHA_REQUIRED: 'Please complete the verification',
    CAPTCHA_INVALID: 'Verification failed. Please try again',
    CAPTCHA_EXPIRED: 'Verification expired. Please try again',

    // Password errors
    PASSWORD_BREACHED: `This password appears in ${data.breachCount || ''} data breaches. Choose a different password`,
    PASSWORD_TOO_WEAK: 'Password is too weak',
    PASSWORD_TOO_SHORT: `Password must be at least ${data.minLength || 8} characters`,
    PASSWORD_RECENTLY_USED: 'Cannot use a recent password',
    PASSWORD_EXPIRED: 'Password expired. Please change it',
    PASSWORD_RESET_REQUIRED: 'Please reset your password',
    PASSWORD_RESET_INVALID_TOKEN: 'Reset link is invalid or expired',

    // OTP errors
    OTP_EXPIRED: 'Verification code expired. Please request a new one',
    OTP_INVALID: 'Invalid verification code',
    OTP_TOO_MANY_ATTEMPTS: 'Too many attempts. Please wait',

    // Rate limiting
    RATE_LIMITED: `Rate limited. Try again in ${data.retryAfter || 60} seconds`,
    TOO_MANY_REQUESTS: 'Too many requests. Please wait',
    LOGIN_RATE_LIMITED: `Too many login attempts. Try again in ${data.retryAfter || 60} seconds`,

    // CSRF
    CSRF_INVALID: 'Session expired. Please refresh the page',
    CSRF_TOKEN_MISSING: 'Security error. Please refresh the page',

    // OAuth errors
    OAUTH_FAILED: 'Authentication with provider failed',
    OAUTH_CANCELLED: 'Login cancelled',
    OAUTH_EMAIL_IN_USE: 'Email already in use with another account',
    OAUTH_PROVIDER_NOT_LINKED: 'This provider is not linked to your account',

    // Anonymous/Guest errors
    ANONYMOUS_EXPIRED: 'Guest session expired. Your data has been deleted',
    CONVERSION_FAILED: 'Account conversion failed',

    // General
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'You do not have permission for this action',
    NETWORK_ERROR: 'Cannot connect to server. Check your internet connection',
    SERVER_ERROR: 'Server error. Please try again later',
    UNKNOWN_ERROR: 'An unexpected error occurred',
  }

  return messages[code] || messages.UNKNOWN_ERROR
}

/**
 * Get error message based on current locale
 *
 * @param code - Error code
 * @param data - Optional data for dynamic messages
 * @param locale - Locale ('ar' or 'en')
 */
export const getErrorMessage = (
  code: AuthErrorCode | string,
  data: ErrorMessageData = {},
  locale: 'ar' | 'en' = 'ar'
): string => {
  return locale === 'ar'
    ? getErrorMessageAr(code, data)
    : getErrorMessageEn(code, data)
}

/**
 * Check if error code requires user action
 */
export const requiresUserAction = (code: AuthErrorCode | string): boolean => {
  const actionRequiredCodes = [
    AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED,
    AUTH_ERROR_CODES.PHONE_NOT_VERIFIED,
    AUTH_ERROR_CODES.MFA_REQUIRED,
    AUTH_ERROR_CODES.REAUTHENTICATION_REQUIRED,
    AUTH_ERROR_CODES.PASSWORD_RESET_REQUIRED,
    AUTH_ERROR_CODES.PASSWORD_EXPIRED,
    AUTH_ERROR_CODES.CAPTCHA_REQUIRED,
  ]
  return actionRequiredCodes.includes(code as AuthErrorCode)
}

/**
 * Check if error should redirect to login
 */
export const shouldRedirectToLogin = (code: AuthErrorCode | string): boolean => {
  const redirectCodes = [
    AUTH_ERROR_CODES.SESSION_EXPIRED,
    AUTH_ERROR_CODES.SESSION_IDLE_TIMEOUT,
    AUTH_ERROR_CODES.SESSION_ABSOLUTE_TIMEOUT,
    AUTH_ERROR_CODES.TOKEN_EXPIRED,
    AUTH_ERROR_CODES.TOKEN_REVOKED,
    AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED,
  ]
  return redirectCodes.includes(code as AuthErrorCode)
}

/**
 * Check if error is retryable
 */
export const isRetryable = (code: AuthErrorCode | string): boolean => {
  const retryableCodes = [
    AUTH_ERROR_CODES.NETWORK_ERROR,
    AUTH_ERROR_CODES.SERVER_ERROR,
    AUTH_ERROR_CODES.RATE_LIMITED,
    AUTH_ERROR_CODES.TOO_MANY_REQUESTS,
    AUTH_ERROR_CODES.CAPTCHA_EXPIRED,
  ]
  return retryableCodes.includes(code as AuthErrorCode)
}

/**
 * Extract error code from API error response
 */
export const extractErrorCode = (error: any): AuthErrorCode => {
  // Check for code in error object
  if (error?.code && Object.values(AUTH_ERROR_CODES).includes(error.code)) {
    return error.code
  }

  // Check response data
  const responseCode = error?.response?.data?.code
  if (responseCode && Object.values(AUTH_ERROR_CODES).includes(responseCode)) {
    return responseCode
  }

  // Infer from status code
  const status = error?.status || error?.response?.status
  switch (status) {
    case 401:
      return AUTH_ERROR_CODES.UNAUTHORIZED
    case 403:
      return AUTH_ERROR_CODES.FORBIDDEN
    case 429:
      return AUTH_ERROR_CODES.RATE_LIMITED
    case 423:
      return AUTH_ERROR_CODES.ACCOUNT_LOCKED
    default:
      if (status >= 500) return AUTH_ERROR_CODES.SERVER_ERROR
      return AUTH_ERROR_CODES.UNKNOWN_ERROR
  }
}

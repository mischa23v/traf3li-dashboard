/**
 * Bilingual Error Handler Utility
 * Provides English and Arabic error messages for API errors
 * Prevents exposure of sensitive backend details to users
 */

import type { AxiosError } from 'axios'

/**
 * Bilingual error message type
 */
export interface BilingualError {
  en: string
  ar: string
  code?: string
  status?: number
  requestId?: string
}

/**
 * Common error messages in both languages
 */
const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: {
    en: 'Unable to connect to server. Please check your internet connection.',
    ar: 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
  },
  // 404 Not Found
  NOT_FOUND: {
    en: 'The requested resource was not found.',
    ar: 'المورد المطلوب غير موجود.',
  },
  // 404 Endpoint Not Implemented
  ENDPOINT_NOT_IMPLEMENTED: {
    en: 'This feature is not available yet. Please contact support.',
    ar: 'هذه الميزة غير متاحة حالياً. يرجى التواصل مع الدعم.',
  },
  // 401 Unauthorized
  UNAUTHORIZED: {
    en: 'Unauthorized access. Please log in again.',
    ar: 'وصول غير مصرح به. يرجى تسجيل الدخول مرة أخرى.',
  },
  // 403 Forbidden
  FORBIDDEN: {
    en: 'You do not have permission to perform this action.',
    ar: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
  },
  // 429 Rate Limited
  RATE_LIMITED: {
    en: 'Too many requests. Please try again later.',
    ar: 'طلبات كثيرة جداً. يرجى المحاولة مرة أخرى لاحقاً.',
  },
  // 500 Server Error
  SERVER_ERROR: {
    en: 'An internal server error occurred. Please try again.',
    ar: 'حدث خطأ داخلي في الخادم. يرجى المحاولة مرة أخرى.',
  },
  // 503 Service Unavailable
  SERVICE_UNAVAILABLE: {
    en: 'Service temporarily unavailable. Please try again later.',
    ar: 'الخدمة غير متاحة مؤقتاً. يرجى المحاولة مرة أخرى لاحقاً.',
  },
  // Generic error
  GENERIC_ERROR: {
    en: 'An unexpected error occurred. Please try again.',
    ar: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  },
  // Validation error
  VALIDATION_ERROR: {
    en: 'Please check your input and try again.',
    ar: 'يرجى التحقق من المدخلات والمحاولة مرة أخرى.',
  },
  // Timeout error
  TIMEOUT_ERROR: {
    en: 'Request timeout. Please try again.',
    ar: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
  },
} as const

/**
 * Entity-specific error messages
 */
const ENTITY_ERRORS = {
  // Lead errors
  LEAD_NOT_FOUND: {
    en: 'Lead not found.',
    ar: 'العميل المحتمل غير موجود.',
  },
  LEAD_CREATE_FAILED: {
    en: 'Failed to create lead. Please try again.',
    ar: 'فشل إنشاء العميل المحتمل. يرجى المحاولة مرة أخرى.',
  },
  LEAD_UPDATE_FAILED: {
    en: 'Failed to update lead. Please try again.',
    ar: 'فشل تحديث العميل المحتمل. يرجى المحاولة مرة أخرى.',
  },
  LEAD_DELETE_FAILED: {
    en: 'Failed to delete lead. Please try again.',
    ar: 'فشل حذف العميل المحتمل. يرجى المحاولة مرة أخرى.',
  },
  // Pipeline errors
  PIPELINE_NOT_FOUND: {
    en: 'Pipeline not found.',
    ar: 'المسار الإداري غير موجود.',
  },
  PIPELINE_CREATE_FAILED: {
    en: 'Failed to create pipeline. Please try again.',
    ar: 'فشل إنشاء المسار الإداري. يرجى المحاولة مرة أخرى.',
  },
  // Contact errors
  CONTACT_NOT_FOUND: {
    en: 'Contact not found.',
    ar: 'جهة الاتصال غير موجودة.',
  },
  CONTACT_CREATE_FAILED: {
    en: 'Failed to create contact. Please try again.',
    ar: 'فشل إنشاء جهة الاتصال. يرجى المحاولة مرة أخرى.',
  },
  CONTACT_UPDATE_FAILED: {
    en: 'Failed to update contact. Please try again.',
    ar: 'فشل تحديث جهة الاتصال. يرجى المحاولة مرة أخرى.',
  },
  // Referral errors
  REFERRAL_NOT_FOUND: {
    en: 'Referral not found.',
    ar: 'الإحالة غير موجودة.',
  },
  // Activity errors
  ACTIVITY_NOT_FOUND: {
    en: 'Activity not found.',
    ar: 'النشاط غير موجود.',
  },
  // Campaign errors
  CAMPAIGN_NOT_FOUND: {
    en: 'Campaign not found.',
    ar: 'الحملة غير موجودة.',
  },
  CAMPAIGN_SEND_FAILED: {
    en: 'Failed to send campaign. Please try again.',
    ar: 'فشل إرسال الحملة. يرجى المحاولة مرة أخرى.',
  },
  // Template errors
  TEMPLATE_NOT_FOUND: {
    en: 'Template not found.',
    ar: 'القالب غير موجود.',
  },
  // Conversation errors
  CONVERSATION_NOT_FOUND: {
    en: 'Conversation not found.',
    ar: 'المحادثة غير موجودة.',
  },
  MESSAGE_SEND_FAILED: {
    en: 'Failed to send message. Please try again.',
    ar: 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.',
  },
  // Client errors
  CLIENT_NOT_FOUND: {
    en: 'Client not found.',
    ar: 'العميل غير موجود.',
  },
  CLIENT_CREATE_FAILED: {
    en: 'Failed to create client. Please try again.',
    ar: 'فشل إنشاء العميل. يرجى المحاولة مرة أخرى.',
  },
  CLIENT_UPDATE_FAILED: {
    en: 'Failed to update client. Please try again.',
    ar: 'فشل تحديث العميل. يرجى المحاولة مرة أخرى.',
  },
  CLIENT_DELETE_FAILED: {
    en: 'Failed to delete client. Please try again.',
    ar: 'فشل حذف العميل. يرجى المحاولة مرة أخرى.',
  },
  CLIENT_SEARCH_FAILED: {
    en: 'Client search failed. Please try again.',
    ar: 'فشل البحث عن العميل. يرجى المحاولة مرة أخرى.',
  },
  CLIENT_STATS_FAILED: {
    en: 'Failed to load client statistics. Please try again.',
    ar: 'فشل تحميل إحصائيات العملاء. يرجى المحاولة مرة أخرى.',
  },
  CLIENT_VERIFICATION_FAILED: {
    en: 'Client verification failed. Please try again.',
    ar: 'فشل التحقق من العميل. يرجى المحاولة مرة أخرى.',
  },
  CLIENT_ATTACHMENT_FAILED: {
    en: 'Failed to process attachment. Please try again.',
    ar: 'فشلت معالجة المرفق. يرجى المحاولة مرة أخرى.',
  },
  CLIENT_CONFLICT_CHECK_FAILED: {
    en: 'Conflict check failed. Please try again.',
    ar: 'فشل فحص التعارض. يرجى المحاولة مرة أخرى.',
  },
} as const

/**
 * Handle API errors and return bilingual error messages
 * Prevents exposure of sensitive backend error details
 */
export function handleBilingualApiError(error: any, entityType?: keyof typeof ENTITY_ERRORS): BilingualError {
  // Check if error is from axios
  const axiosError = error as AxiosError<any>
  const status = axiosError.response?.status || error.status || 0
  const errorCode = axiosError.response?.data?.code || error.code
  const requestId = axiosError.response?.data?.requestId || error.requestId

  // Handle specific HTTP status codes
  let errorMessage: { en: string; ar: string }

  if (status === 0 || error.code === 'ERR_NETWORK') {
    // Network error
    errorMessage = ERROR_MESSAGES.NETWORK_ERROR
  } else if (status === 404) {
    // Check if it's an endpoint not implemented
    const errorMsg = axiosError.response?.data?.message?.toLowerCase() || ''
    if (errorMsg.includes('cannot') || errorMsg.includes('not found') || errorMsg.includes('does not exist')) {
      // Entity-specific 404
      if (entityType && ENTITY_ERRORS[entityType]) {
        errorMessage = ENTITY_ERRORS[entityType]
      } else {
        errorMessage = ERROR_MESSAGES.NOT_FOUND
      }
    } else {
      errorMessage = ERROR_MESSAGES.ENDPOINT_NOT_IMPLEMENTED
    }
  } else if (status === 401) {
    errorMessage = ERROR_MESSAGES.UNAUTHORIZED
  } else if (status === 403) {
    errorMessage = ERROR_MESSAGES.FORBIDDEN
  } else if (status === 429) {
    errorMessage = ERROR_MESSAGES.RATE_LIMITED
  } else if (status === 400) {
    // Validation error - check if backend provided message
    const backendMessage = axiosError.response?.data?.message
    if (backendMessage && typeof backendMessage === 'string') {
      // Use backend message if it looks safe (no stack traces, no SQL, no file paths)
      if (!backendMessage.includes('Error:') &&
          !backendMessage.includes('at ') &&
          !backendMessage.includes('SELECT') &&
          !backendMessage.includes('INSERT') &&
          !backendMessage.includes('/') &&
          backendMessage.length < 200) {
        errorMessage = {
          en: backendMessage,
          ar: backendMessage,
        }
      } else {
        errorMessage = ERROR_MESSAGES.VALIDATION_ERROR
      }
    } else {
      errorMessage = ERROR_MESSAGES.VALIDATION_ERROR
    }
  } else if (status === 503) {
    errorMessage = ERROR_MESSAGES.SERVICE_UNAVAILABLE
  } else if (status >= 500) {
    errorMessage = ERROR_MESSAGES.SERVER_ERROR
  } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    errorMessage = ERROR_MESSAGES.TIMEOUT_ERROR
  } else {
    errorMessage = ERROR_MESSAGES.GENERIC_ERROR
  }

  return {
    en: errorMessage.en,
    ar: errorMessage.ar,
    code: errorCode,
    status,
    requestId,
  }
}

/**
 * Format bilingual error for display
 * Returns a string with both English and Arabic messages
 */
export function formatBilingualError(error: BilingualError): string {
  return `${error.en} | ${error.ar}`
}

/**
 * Throw a bilingual error (for use in catch blocks)
 */
export function throwBilingualError(error: any, entityType?: keyof typeof ENTITY_ERRORS): never {
  const bilingualError = handleBilingualApiError(error, entityType)
  throw new Error(formatBilingualError(bilingualError))
}

/**
 * Safe error wrapper for API calls
 * Automatically handles errors and returns bilingual messages
 */
export async function withBilingualErrorHandling<T>(
  apiCall: () => Promise<T>,
  entityType?: keyof typeof ENTITY_ERRORS
): Promise<T> {
  try {
    return await apiCall()
  } catch (error: any) {
    throwBilingualError(error, entityType)
  }
}

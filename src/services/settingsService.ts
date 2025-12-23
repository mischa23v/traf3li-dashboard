/**
 * Settings Service
 * Handles all user settings-related API calls
 *
 * [BACKEND-PENDING] API Endpoints Status:
 * These endpoints are defined but may not be fully implemented in the backend yet.
 * The service includes proper error handling for 404 responses.
 *
 * Expected API Endpoints:
 * - GET    /settings                   - Get all settings
 * - PATCH  /settings/account          - Update account settings
 * - PATCH  /settings/appearance       - Update appearance settings
 * - PATCH  /settings/display          - Update display settings
 * - PATCH  /settings/notifications    - Update notification settings
 *
 * Note: These endpoints are NOT listed in docs/API_ENDPOINTS_ACTUAL.md,
 * which suggests they may not be implemented yet. The service will handle
 * 404 errors gracefully with bilingual error messages.
 */

import apiClient from '@/lib/api'

/**
 * Bilingual error messages for settings operations
 */
const ERROR_MESSAGES = {
  FETCH_FAILED: {
    en: 'Failed to fetch settings. Please try again.',
    ar: 'فشل في تحميل الإعدادات. يرجى المحاولة مرة أخرى.'
  },
  UPDATE_ACCOUNT_FAILED: {
    en: 'Failed to update account settings. Please try again.',
    ar: 'فشل في تحديث إعدادات الحساب. يرجى المحاولة مرة أخرى.'
  },
  UPDATE_APPEARANCE_FAILED: {
    en: 'Failed to update appearance settings. Please try again.',
    ar: 'فشل في تحديث إعدادات المظهر. يرجى المحاولة مرة أخرى.'
  },
  UPDATE_DISPLAY_FAILED: {
    en: 'Failed to update display settings. Please try again.',
    ar: 'فشل في تحديث إعدادات العرض. يرجى المحاولة مرة أخرى.'
  },
  UPDATE_NOTIFICATIONS_FAILED: {
    en: 'Failed to update notification settings. Please try again.',
    ar: 'فشل في تحديث إعدادات الإشعارات. يرجى المحاولة مرة أخرى.'
  },
  ENDPOINT_NOT_FOUND: {
    en: 'Settings endpoint not found. Please contact support.',
    ar: 'نقطة النهاية للإعدادات غير موجودة. يرجى التواصل مع الدعم الفني.'
  },
  VALIDATION_ERROR: {
    en: 'Invalid data provided. Please check your input.',
    ar: 'البيانات المقدمة غير صحيحة. يرجى التحقق من المدخلات.'
  },
  NETWORK_ERROR: {
    en: 'Network error. Please check your connection.',
    ar: 'خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.'
  },
  UNAUTHORIZED: {
    en: 'Unauthorized. Please log in again.',
    ar: 'غير مصرح. يرجى تسجيل الدخول مرة أخرى.'
  },
  SERVER_ERROR: {
    en: 'Server error. Please try again later.',
    ar: 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
  }
} as const

/**
 * Format bilingual error message
 */
const formatBilingualError = (errorType: keyof typeof ERROR_MESSAGES, customMessage?: string): string => {
  const { en, ar } = ERROR_MESSAGES[errorType]
  if (customMessage) {
    return `${en} | ${ar}\n${customMessage}`
  }
  return `${en} | ${ar}`
}

/**
 * Enhanced error handler for settings service
 * Provides bilingual error messages and handles different error scenarios
 */
const handleSettingsError = (error: any, operation: keyof typeof ERROR_MESSAGES): never => {
  // Check if it's a network error
  if (!error.response && (error.message === 'Network Error' || error.code === 'ERR_NETWORK')) {
    throw new Error(formatBilingualError('NETWORK_ERROR'))
  }

  const status = error.response?.status || error.status

  // Handle specific HTTP status codes
  switch (status) {
    case 401:
      throw new Error(formatBilingualError('UNAUTHORIZED'))

    case 404:
      // Endpoint doesn't exist on backend
      console.error(`[Settings Service] Endpoint not found: ${error.config?.url}`)
      throw new Error(formatBilingualError('ENDPOINT_NOT_FOUND'))

    case 400:
      // Validation error
      const validationErrors = error.response?.data?.errors
      let validationMessage = ''
      if (validationErrors && Array.isArray(validationErrors)) {
        validationMessage = validationErrors.map((err: any) =>
          `${err.field}: ${err.message}`
        ).join(', ')
      }
      throw new Error(formatBilingualError('VALIDATION_ERROR', validationMessage))

    case 500:
    case 502:
    case 503:
    case 504:
      throw new Error(formatBilingualError('SERVER_ERROR'))

    default:
      // Use backend error message if available (supports bilingual)
      const backendMessage = error.response?.data?.message || error.message
      const backendMessageAr = error.response?.data?.messageAr

      if (backendMessageAr && backendMessage) {
        throw new Error(`${backendMessage} | ${backendMessageAr}`)
      } else if (backendMessage) {
        throw new Error(backendMessage)
      }

      // Fallback to operation-specific error
      throw new Error(formatBilingualError(operation))
  }
}

export interface UserSettings {
  _id: string
  userId: string
  account: {
    name: string
    email: string
    dob?: string
    language: string
    timezone: string
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    accentColor: string
    fontSize: 'small' | 'medium' | 'large'
    sidebarCollapsed: boolean
  }
  display: {
    dateFormat: string
    timeFormat: '12h' | '24h'
    currency: string
    startOfWeek: 'sunday' | 'monday'
    compactMode: boolean
  }
  notifications: {
    email: {
      enabled: boolean
      newMessages: boolean
      taskReminders: boolean
      caseUpdates: boolean
      financialAlerts: boolean
    }
    push: {
      enabled: boolean
      newMessages: boolean
      taskReminders: boolean
      caseUpdates: boolean
    }
    inApp: {
      enabled: boolean
      sound: boolean
      desktop: boolean
    }
  }
  createdAt: string
  updatedAt: string
}

export interface UpdateAccountSettings {
  name?: string
  dob?: string
  language?: string
  timezone?: string
}

export interface UpdateAppearanceSettings {
  theme?: 'light' | 'dark' | 'system'
  accentColor?: string
  fontSize?: 'small' | 'medium' | 'large'
  sidebarCollapsed?: boolean
}

export interface UpdateDisplaySettings {
  dateFormat?: string
  timeFormat?: '12h' | '24h'
  currency?: string
  startOfWeek?: 'sunday' | 'monday'
  compactMode?: boolean
}

export interface UpdateNotificationSettings {
  email?: {
    enabled?: boolean
    newMessages?: boolean
    taskReminders?: boolean
    caseUpdates?: boolean
    financialAlerts?: boolean
  }
  push?: {
    enabled?: boolean
    newMessages?: boolean
    taskReminders?: boolean
    caseUpdates?: boolean
  }
  inApp?: {
    enabled?: boolean
    sound?: boolean
    desktop?: boolean
  }
}

/**
 * Get all user settings
 * Endpoint: GET /settings
 */
export const getSettings = async (): Promise<UserSettings> => {
  try {
    const response = await apiClient.get('/settings')
    return response.data.data
  } catch (error) {
    handleSettingsError(error, 'FETCH_FAILED')
  }
}

/**
 * Update account settings (name, email, language, timezone)
 * Endpoint: PATCH /settings/account
 */
export const updateAccountSettings = async (data: UpdateAccountSettings): Promise<UserSettings> => {
  try {
    const response = await apiClient.patch('/settings/account', data)
    return response.data.data
  } catch (error) {
    handleSettingsError(error, 'UPDATE_ACCOUNT_FAILED')
  }
}

/**
 * Update appearance settings (theme, accent color, font size)
 * Endpoint: PATCH /settings/appearance
 */
export const updateAppearanceSettings = async (data: UpdateAppearanceSettings): Promise<UserSettings> => {
  try {
    const response = await apiClient.patch('/settings/appearance', data)
    return response.data.data
  } catch (error) {
    handleSettingsError(error, 'UPDATE_APPEARANCE_FAILED')
  }
}

/**
 * Update display settings (date format, time format, currency)
 * Endpoint: PATCH /settings/display
 */
export const updateDisplaySettings = async (data: UpdateDisplaySettings): Promise<UserSettings> => {
  try {
    const response = await apiClient.patch('/settings/display', data)
    return response.data.data
  } catch (error) {
    handleSettingsError(error, 'UPDATE_DISPLAY_FAILED')
  }
}

/**
 * Update notification settings (email, push, in-app)
 * Endpoint: PATCH /settings/notifications
 */
export const updateNotificationSettings = async (data: UpdateNotificationSettings): Promise<UserSettings> => {
  try {
    const response = await apiClient.patch('/settings/notifications', data)
    return response.data.data
  } catch (error) {
    handleSettingsError(error, 'UPDATE_NOTIFICATIONS_FAILED')
  }
}

const settingsService = {
  getSettings,
  updateAccountSettings,
  updateAppearanceSettings,
  updateDisplaySettings,
  updateNotificationSettings,
}

export default settingsService

/**
 * Integrations Service
 * Handles all integration/API-related operations
 */

import apiClient, { handleApiError, ApiError } from '@/lib/api'

/**
 * API Error Handler with Bilingual Messages
 * Returns formatted error messages in both English and Arabic
 */
interface BilingualError {
  messageEn: string
  messageAr: string
  status?: number
  code?: string
}

/**
 * Handle API errors with proper bilingual messages
 */
const handleIntegrationError = (error: any, context: string): BilingualError => {
  // Network or timeout errors
  if (!error.response && (error.message === 'Network Error' || error.code === 'ECONNABORTED')) {
    return {
      messageEn: `Network error: Unable to connect to the server. Please check your internet connection.`,
      messageAr: `خطأ في الشبكة: تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.`,
      status: 0,
      code: 'NETWORK_ERROR'
    }
  }

  const status = error.response?.status || error.status || 500
  const apiError = error as ApiError

  // Handle specific HTTP status codes
  switch (status) {
    case 404:
      return {
        messageEn: `Integrations API endpoint not found. This feature may not be available on the backend yet.`,
        messageAr: `نقطة نهاية واجهة برمجة التطبيقات للتكاملات غير موجودة. قد لا تكون هذه الميزة متاحة على الخادم بعد.`,
        status,
        code: 'ENDPOINT_NOT_FOUND'
      }

    case 400:
      return {
        messageEn: error.message || `Invalid request: Please check your integration settings.`,
        messageAr: `طلب غير صالح: يرجى التحقق من إعدادات التكامل.`,
        status,
        code: apiError.code || 'BAD_REQUEST'
      }

    case 401:
      return {
        messageEn: `Unauthorized: Please log in again to access integrations.`,
        messageAr: `غير مصرح: يرجى تسجيل الدخول مرة أخرى للوصول إلى التكاملات.`,
        status,
        code: 'UNAUTHORIZED'
      }

    case 403:
      return {
        messageEn: `Access denied: You don't have permission to access integrations.`,
        messageAr: `تم رفض الوصول: ليس لديك صلاحية للوصول إلى التكاملات.`,
        status,
        code: 'FORBIDDEN'
      }

    case 429:
      return {
        messageEn: `Too many requests: Please wait a moment before trying again.`,
        messageAr: `طلبات كثيرة جداً: يرجى الانتظار لحظة قبل المحاولة مرة أخرى.`,
        status,
        code: 'RATE_LIMITED'
      }

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        messageEn: `Server error: The integrations service is temporarily unavailable. Please try again later.`,
        messageAr: `خطأ في الخادم: خدمة التكاملات غير متاحة مؤقتاً. يرجى المحاولة مرة أخرى لاحقاً.`,
        status,
        code: 'SERVER_ERROR'
      }

    default:
      // Use the error message from API if available
      const message = error.message || apiError.message || 'Unknown error occurred'
      return {
        messageEn: `Failed to ${context}: ${message}`,
        messageAr: `فشل في ${getContextAr(context)}: ${message}`,
        status,
        code: apiError.code || 'UNKNOWN_ERROR'
      }
  }
}

/**
 * Helper to get Arabic context translation
 */
const getContextAr = (context: string): string => {
  const contextMap: Record<string, string> = {
    'load integrations': 'تحميل التكاملات',
    'load integration': 'تحميل التكامل',
    'get status': 'الحصول على الحالة',
    'connect': 'الاتصال',
    'disconnect': 'قطع الاتصال',
    'update settings': 'تحديث الإعدادات',
    'test connection': 'اختبار الاتصال'
  }
  return contextMap[context] || context
}

/**
 * Integration Status
 */
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending'

/**
 * Integration Category
 */
export type IntegrationCategory =
  | 'payment'
  | 'communication'
  | 'storage'
  | 'calendar'
  | 'accounting'

/**
 * Integration Interface
 */
export interface Integration {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  category: IntegrationCategory
  status: IntegrationStatus
  logo: string
  provider: string
  isPopular?: boolean
  requiredFields?: string[]
  connectedAt?: string
  lastSyncedAt?: string
  config?: Record<string, any>
}

/**
 * Integration Connection Data
 */
export interface ConnectIntegrationData {
  integrationId: string
  credentials: Record<string, string>
  config?: Record<string, any>
}

/**
 * Integration Settings
 */
export interface IntegrationSettings {
  integrationId: string
  config: Record<string, any>
  webhookUrl?: string
  apiKey?: string
}

/**
 * Integration Service Object
 */
const integrationsService = {
  /**
   * Get all available integrations
   * GET /api/integrations
   */
  getIntegrations: async (): Promise<Integration[]> => {
    try {
      const response = await apiClient.get('/integrations')
      return response.data.data || response.data.integrations || []
    } catch (error: any) {
      const bilingualError = handleIntegrationError(error, 'load integrations')

      // If endpoint doesn't exist (404), return mock data with a console warning
      if (bilingualError.code === 'ENDPOINT_NOT_FOUND') {
        console.warn(
          `[Integrations API] ${bilingualError.messageEn}\n` +
          `[Integrations API] ${bilingualError.messageAr}\n` +
          `Returning mock data for development.`
        )
        return getMockIntegrations()
      }

      // For other errors, throw with bilingual message
      const errorMessage = `${bilingualError.messageEn} | ${bilingualError.messageAr}`
      const err = new Error(errorMessage) as any
      err.messageEn = bilingualError.messageEn
      err.messageAr = bilingualError.messageAr
      err.status = bilingualError.status
      err.code = bilingualError.code
      throw err
    }
  },

  /**
   * Get integrations by category
   * GET /api/integrations?category=:category
   */
  getIntegrationsByCategory: async (category: IntegrationCategory): Promise<Integration[]> => {
    try {
      const response = await apiClient.get(`/integrations?category=${category}`)
      return response.data.data || response.data.integrations || []
    } catch (error: any) {
      const bilingualError = handleIntegrationError(error, 'load integrations')

      // If endpoint doesn't exist (404), return mock data with a console warning
      if (bilingualError.code === 'ENDPOINT_NOT_FOUND') {
        console.warn(
          `[Integrations API] ${bilingualError.messageEn}\n` +
          `[Integrations API] ${bilingualError.messageAr}\n` +
          `Returning filtered mock data for development.`
        )
        return getMockIntegrations().filter(int => int.category === category)
      }

      // For other errors, throw with bilingual message
      const errorMessage = `${bilingualError.messageEn} | ${bilingualError.messageAr}`
      const err = new Error(errorMessage) as any
      err.messageEn = bilingualError.messageEn
      err.messageAr = bilingualError.messageAr
      err.status = bilingualError.status
      err.code = bilingualError.code
      throw err
    }
  },

  /**
   * Get single integration
   * GET /api/integrations/:id
   */
  getIntegration: async (id: string): Promise<Integration> => {
    try {
      const response = await apiClient.get(`/integrations/${id}`)
      return response.data.data || response.data.integration
    } catch (error: any) {
      const bilingualError = handleIntegrationError(error, 'load integration')

      // If endpoint doesn't exist (404), try to find in mock data
      if (bilingualError.code === 'ENDPOINT_NOT_FOUND') {
        const mockIntegration = getMockIntegrations().find(int => int.id === id)
        if (mockIntegration) {
          console.warn(
            `[Integrations API] ${bilingualError.messageEn}\n` +
            `[Integrations API] ${bilingualError.messageAr}\n` +
            `Returning mock data for integration: ${id}`
          )
          return mockIntegration
        }
      }

      // Throw with bilingual message
      const errorMessage = `${bilingualError.messageEn} | ${bilingualError.messageAr}`
      const err = new Error(errorMessage) as any
      err.messageEn = bilingualError.messageEn
      err.messageAr = bilingualError.messageAr
      err.status = bilingualError.status
      err.code = bilingualError.code
      throw err
    }
  },

  /**
   * Get integration status
   * GET /api/integrations/:id/status
   */
  getIntegrationStatus: async (id: string): Promise<IntegrationStatus> => {
    try {
      const response = await apiClient.get(`/integrations/${id}/status`)
      return response.data.status
    } catch (error: any) {
      const bilingualError = handleIntegrationError(error, 'get status')

      // If endpoint doesn't exist (404), return mock status
      if (bilingualError.code === 'ENDPOINT_NOT_FOUND') {
        const mockIntegration = getMockIntegrations().find(int => int.id === id)
        if (mockIntegration) {
          console.warn(
            `[Integrations API] ${bilingualError.messageEn}\n` +
            `[Integrations API] ${bilingualError.messageAr}\n` +
            `Returning mock status for integration: ${id}`
          )
          return mockIntegration.status
        }
      }

      // Throw with bilingual message
      const errorMessage = `${bilingualError.messageEn} | ${bilingualError.messageAr}`
      const err = new Error(errorMessage) as any
      err.messageEn = bilingualError.messageEn
      err.messageAr = bilingualError.messageAr
      err.status = bilingualError.status
      err.code = bilingualError.code
      throw err
    }
  },

  /**
   * Connect integration
   * POST /api/integrations/:id/connect
   */
  connectIntegration: async (data: ConnectIntegrationData): Promise<Integration> => {
    try {
      const response = await apiClient.post(`/integrations/${data.integrationId}/connect`, {
        credentials: data.credentials,
        config: data.config,
      })
      return response.data.data || response.data.integration
    } catch (error: any) {
      const bilingualError = handleIntegrationError(error, 'connect')

      // Throw with bilingual message
      const errorMessage = `${bilingualError.messageEn} | ${bilingualError.messageAr}`
      const err = new Error(errorMessage) as any
      err.messageEn = bilingualError.messageEn
      err.messageAr = bilingualError.messageAr
      err.status = bilingualError.status
      err.code = bilingualError.code
      throw err
    }
  },

  /**
   * Disconnect integration
   * POST /api/integrations/:id/disconnect
   */
  disconnectIntegration: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/integrations/${id}/disconnect`)
    } catch (error: any) {
      const bilingualError = handleIntegrationError(error, 'disconnect')

      // Throw with bilingual message
      const errorMessage = `${bilingualError.messageEn} | ${bilingualError.messageAr}`
      const err = new Error(errorMessage) as any
      err.messageEn = bilingualError.messageEn
      err.messageAr = bilingualError.messageAr
      err.status = bilingualError.status
      err.code = bilingualError.code
      throw err
    }
  },

  /**
   * Update integration settings
   * PUT /api/integrations/:id/settings
   */
  updateIntegrationSettings: async (id: string, settings: Partial<IntegrationSettings>): Promise<Integration> => {
    try {
      const response = await apiClient.put(`/integrations/${id}/settings`, settings)
      return response.data.data || response.data.integration
    } catch (error: any) {
      const bilingualError = handleIntegrationError(error, 'update settings')

      // Throw with bilingual message
      const errorMessage = `${bilingualError.messageEn} | ${bilingualError.messageAr}`
      const err = new Error(errorMessage) as any
      err.messageEn = bilingualError.messageEn
      err.messageAr = bilingualError.messageAr
      err.status = bilingualError.status
      err.code = bilingualError.code
      throw err
    }
  },

  /**
   * Test integration connection
   * POST /api/integrations/:id/test
   */
  testIntegration: async (id: string): Promise<boolean> => {
    try {
      const response = await apiClient.post(`/integrations/${id}/test`)
      return response.data.success
    } catch (error: any) {
      const bilingualError = handleIntegrationError(error, 'test connection')

      // Throw with bilingual message
      const errorMessage = `${bilingualError.messageEn} | ${bilingualError.messageAr}`
      const err = new Error(errorMessage) as any
      err.messageEn = bilingualError.messageEn
      err.messageAr = bilingualError.messageAr
      err.status = bilingualError.status
      err.code = bilingualError.code
      throw err
    }
  },
}

/**
 * Mock integrations data
 */
function getMockIntegrations(): Integration[] {
  return [
    // Payment
    {
      id: 'stripe',
      name: 'Stripe',
      nameAr: 'سترايب',
      description: 'Accept payments online with Stripe',
      descriptionAr: 'قبول المدفوعات عبر الإنترنت مع سترايب',
      category: 'payment',
      status: 'connected',
      logo: '💳',
      provider: 'Stripe Inc.',
      isPopular: true,
      requiredFields: ['apiKey', 'secretKey'],
      connectedAt: '2024-01-15T10:30:00Z',
      lastSyncedAt: '2024-12-22T08:15:00Z',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      nameAr: 'باي بال',
      description: 'Process payments with PayPal',
      descriptionAr: 'معالجة المدفوعات مع باي بال',
      category: 'payment',
      status: 'disconnected',
      logo: '💰',
      provider: 'PayPal Holdings',
      isPopular: true,
      requiredFields: ['clientId', 'clientSecret'],
    },
    // Communication
    {
      id: 'twilio',
      name: 'Twilio',
      nameAr: 'تويليو',
      description: 'Send SMS and voice messages',
      descriptionAr: 'إرسال رسائل SMS والمكالمات الصوتية',
      category: 'communication',
      status: 'connected',
      logo: '📱',
      provider: 'Twilio Inc.',
      isPopular: true,
      requiredFields: ['accountSid', 'authToken'],
      connectedAt: '2024-02-10T14:20:00Z',
      lastSyncedAt: '2024-12-22T07:45:00Z',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      nameAr: 'واتساب للأعمال',
      description: 'Send messages via WhatsApp Business API',
      descriptionAr: 'إرسال الرسائل عبر واتساب للأعمال',
      category: 'communication',
      status: 'disconnected',
      logo: '💬',
      provider: 'Meta Platforms',
      isPopular: true,
      requiredFields: ['phoneNumberId', 'accessToken'],
    },
    // Storage
    {
      id: 'google-drive',
      name: 'Google Drive',
      nameAr: 'جوجل درايف',
      description: 'Store and share files in Google Drive',
      descriptionAr: 'تخزين ومشاركة الملفات في جوجل درايف',
      category: 'storage',
      status: 'connected',
      logo: '📁',
      provider: 'Google LLC',
      isPopular: true,
      requiredFields: ['clientId', 'clientSecret', 'refreshToken'],
      connectedAt: '2024-01-20T09:15:00Z',
      lastSyncedAt: '2024-12-22T08:00:00Z',
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      nameAr: 'دروب بوكس',
      description: 'Sync files with Dropbox',
      descriptionAr: 'مزامنة الملفات مع دروب بوكس',
      category: 'storage',
      status: 'disconnected',
      logo: '📦',
      provider: 'Dropbox Inc.',
      requiredFields: ['accessToken'],
    },
    // Calendar
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      nameAr: 'تقويم جوجل',
      description: 'Sync events with Google Calendar',
      descriptionAr: 'مزامنة الأحداث مع تقويم جوجل',
      category: 'calendar',
      status: 'connected',
      logo: '📅',
      provider: 'Google LLC',
      isPopular: true,
      requiredFields: ['clientId', 'clientSecret', 'refreshToken'],
      connectedAt: '2024-01-25T11:00:00Z',
      lastSyncedAt: '2024-12-22T07:30:00Z',
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      nameAr: 'مايكروسوفت أوت لوك',
      description: 'Integrate with Outlook Calendar',
      descriptionAr: 'التكامل مع تقويم أوت لوك',
      category: 'calendar',
      status: 'disconnected',
      logo: '📧',
      provider: 'Microsoft Corporation',
      requiredFields: ['clientId', 'clientSecret', 'tenantId'],
    },
    // Accounting
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      nameAr: 'كويك بوكس',
      description: 'Sync accounting data with QuickBooks',
      descriptionAr: 'مزامنة البيانات المحاسبية مع كويك بوكس',
      category: 'accounting',
      status: 'disconnected',
      logo: '💼',
      provider: 'Intuit Inc.',
      isPopular: true,
      requiredFields: ['clientId', 'clientSecret', 'realmId'],
    },
    {
      id: 'xero',
      name: 'Xero',
      nameAr: 'زيرو',
      description: 'Connect to Xero accounting platform',
      descriptionAr: 'الاتصال بمنصة زيرو المحاسبية',
      category: 'accounting',
      status: 'disconnected',
      logo: '📊',
      provider: 'Xero Limited',
      requiredFields: ['clientId', 'clientSecret'],
    },
  ]
}

export default integrationsService

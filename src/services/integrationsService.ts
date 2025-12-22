/**
 * Integrations Service
 * Handles all integration/API-related operations
 */

import apiClient, { handleApiError } from '@/lib/api'

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
      return response.data.data || response.data.integrations
    } catch (error: any) {
      // Return mock data for now
      return getMockIntegrations()
    }
  },

  /**
   * Get integrations by category
   * GET /api/integrations?category=:category
   */
  getIntegrationsByCategory: async (category: IntegrationCategory): Promise<Integration[]> => {
    try {
      const response = await apiClient.get(`/integrations?category=${category}`)
      return response.data.data || response.data.integrations
    } catch (error: any) {
      // Return mock data for now
      return getMockIntegrations().filter(int => int.category === category)
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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

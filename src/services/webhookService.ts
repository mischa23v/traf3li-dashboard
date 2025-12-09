/**
 * Webhook Service
 * Handles all webhook-related API calls for third-party integrations
 * Base route: /api/webhooks
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Webhook Interface
 */
export interface Webhook {
  _id: string
  firmId: string
  url: string
  events: string[]
  isActive: boolean
  secret?: string
  description?: string
  createdAt: string
  updatedAt: string
}

/**
 * Webhook Delivery Interface
 */
export interface WebhookDelivery {
  _id: string
  webhookId: string
  event: string
  payload: any
  status: 'pending' | 'success' | 'failed'
  response?: any
  error?: string
  attempts: number
  createdAt: string
  updatedAt: string
}

/**
 * Webhook Stats Interface
 */
export interface WebhookStats {
  totalWebhooks: number
  activeWebhooks: number
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  successRate: number
}

/**
 * Available Events Interface
 */
export interface WebhookEvent {
  name: string
  description: string
  category: string
}

/**
 * Create/Update Webhook Data
 */
export interface WebhookFormData {
  url: string
  events: string[]
  description?: string
  isActive?: boolean
}

/**
 * Webhook Service Object
 */
const webhookService = {
  /**
   * Get webhook statistics
   * GET /api/webhooks/stats
   */
  getStats: async (): Promise<WebhookStats> => {
    try {
      const response = await apiClient.get('/webhooks/stats')
      return response.data.stats || response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get available webhook events
   * GET /api/webhooks/events
   */
  getAvailableEvents: async (): Promise<WebhookEvent[]> => {
    try {
      const response = await apiClient.get('/webhooks/events')
      return response.data.events || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Register a new webhook
   * POST /api/webhooks
   */
  registerWebhook: async (data: WebhookFormData): Promise<Webhook> => {
    try {
      const response = await apiClient.post('/webhooks', data)
      return response.data.webhook || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all webhooks for the firm
   * GET /api/webhooks
   */
  getWebhooks: async (params?: {
    page?: number
    limit?: number
  }): Promise<{ webhooks: Webhook[]; total: number }> => {
    try {
      const response = await apiClient.get('/webhooks', { params })
      return {
        webhooks: response.data.webhooks || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single webhook by ID
   * GET /api/webhooks/:id
   */
  getWebhook: async (id: string): Promise<Webhook> => {
    try {
      const response = await apiClient.get(`/webhooks/${id}`)
      return response.data.webhook || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update webhook (PUT)
   * PUT /api/webhooks/:id
   */
  updateWebhook: async (id: string, data: WebhookFormData): Promise<Webhook> => {
    try {
      const response = await apiClient.put(`/webhooks/${id}`, data)
      return response.data.webhook || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update webhook (PATCH for partial updates)
   * PATCH /api/webhooks/:id
   */
  patchWebhook: async (id: string, data: Partial<WebhookFormData>): Promise<Webhook> => {
    try {
      const response = await apiClient.patch(`/webhooks/${id}`, data)
      return response.data.webhook || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete webhook
   * DELETE /api/webhooks/:id
   */
  deleteWebhook: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/webhooks/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Test webhook - send test event
   * POST /api/webhooks/:id/test
   */
  testWebhook: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(`/webhooks/${id}/test`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Enable webhook
   * POST /api/webhooks/:id/enable
   */
  enableWebhook: async (id: string): Promise<Webhook> => {
    try {
      const response = await apiClient.post(`/webhooks/${id}/enable`)
      return response.data.webhook || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Disable webhook
   * POST /api/webhooks/:id/disable
   */
  disableWebhook: async (id: string): Promise<Webhook> => {
    try {
      const response = await apiClient.post(`/webhooks/${id}/disable`)
      return response.data.webhook || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get webhook secret (should be restricted to admins)
   * GET /api/webhooks/:id/secret
   */
  getWebhookSecret: async (id: string): Promise<{ secret: string }> => {
    try {
      const response = await apiClient.get(`/webhooks/${id}/secret`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Regenerate webhook secret
   * POST /api/webhooks/:id/regenerate-secret
   */
  regenerateSecret: async (id: string): Promise<{ secret: string }> => {
    try {
      const response = await apiClient.post(`/webhooks/${id}/regenerate-secret`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get webhook deliveries (history)
   * GET /api/webhooks/:id/deliveries
   */
  getWebhookDeliveries: async (
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ deliveries: WebhookDelivery[]; total: number }> => {
    try {
      const response = await apiClient.get(`/webhooks/${id}/deliveries`, { params })
      return {
        deliveries: response.data.deliveries || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single delivery details
   * GET /api/webhooks/:id/deliveries/:deliveryId
   */
  getDeliveryDetails: async (id: string, deliveryId: string): Promise<WebhookDelivery> => {
    try {
      const response = await apiClient.get(`/webhooks/${id}/deliveries/${deliveryId}`)
      return response.data.delivery || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Retry failed delivery
   * POST /api/webhooks/:id/deliveries/:deliveryId/retry
   */
  retryDelivery: async (id: string, deliveryId: string): Promise<WebhookDelivery> => {
    try {
      const response = await apiClient.post(`/webhooks/${id}/deliveries/${deliveryId}/retry`)
      return response.data.delivery || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default webhookService

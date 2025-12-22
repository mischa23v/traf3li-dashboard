/**
 * Webhook Service
 *
 * Comprehensive webhook management service for third-party integrations.
 * Provides full CRUD operations, testing, delivery tracking, and security features.
 *
 * @module webhookService
 * @baseRoute /api/webhooks
 *
 * ## Features
 *
 * ### Webhook Management
 * - Create, read, update, and delete webhook configurations
 * - Enable/disable webhooks without deleting configuration
 * - Subscribe to multiple event types per webhook
 * - Automatic firm-scoped access control
 *
 * ### Security
 * - Automatic secret generation for signature verification
 * - Secret retrieval and regeneration endpoints
 * - HMAC-based payload signing
 * - Firm-isolated data access
 *
 * ### Testing & Monitoring
 * - Test webhook endpoints before activation
 * - Comprehensive delivery history
 * - Success/failure tracking with detailed error messages
 * - Delivery statistics and analytics
 *
 * ### Delivery Management
 * - Automatic retry mechanism for failed deliveries
 * - Manual retry for individual failed deliveries
 * - Detailed delivery logs with request/response data
 * - Attempt counting and status tracking
 *
 * ## Available Endpoints (16 total)
 *
 * ### Statistics & Discovery
 * - GET /api/webhooks/stats - Get webhook statistics
 * - GET /api/webhooks/events - Get available event types
 *
 * ### CRUD Operations
 * - POST /api/webhooks - Create new webhook
 * - GET /api/webhooks - List all webhooks (paginated)
 * - GET /api/webhooks/:id - Get single webhook
 * - PUT /api/webhooks/:id - Full update webhook
 * - PATCH /api/webhooks/:id - Partial update webhook
 * - DELETE /api/webhooks/:id - Delete webhook
 *
 * ### Control Operations
 * - POST /api/webhooks/:id/test - Send test event
 * - POST /api/webhooks/:id/enable - Enable webhook
 * - POST /api/webhooks/:id/disable - Disable webhook
 *
 * ### Secret Management
 * - GET /api/webhooks/:id/secret - Get webhook secret
 * - POST /api/webhooks/:id/regenerate-secret - Regenerate secret
 *
 * ### Delivery History & Retry
 * - GET /api/webhooks/:id/deliveries - List delivery history
 * - GET /api/webhooks/:id/deliveries/:deliveryId - Get delivery details
 * - POST /api/webhooks/:id/deliveries/:deliveryId/retry - Retry failed delivery
 *
 * ## Event Types
 *
 * The service supports various event categories including:
 * - Payment events (payment.success, payment.failed, etc.)
 * - Invoice events (invoice.created, invoice.paid, etc.)
 * - Client events (client.created, client.updated, etc.)
 * - And more... (use getAvailableEvents() for complete list)
 *
 * ## Authentication
 *
 * All endpoints require authentication via the apiClient.
 * Webhooks are automatically scoped to the authenticated user's firm (firmId).
 *
 * @see {@link Webhook} for webhook data structure
 * @see {@link WebhookDelivery} for delivery data structure
 * @see {@link WebhookStats} for statistics data structure
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
 *
 * This service provides comprehensive webhook management capabilities including:
 * - CRUD operations for webhook configurations
 * - Webhook testing, enabling, and disabling
 * - Secret generation and management for webhook security
 * - Delivery history tracking and retry mechanisms
 * - Statistics and analytics
 *
 * All endpoints require authentication and are scoped to the user's firm (firmId).
 * The backend automatically associates webhooks with the authenticated user's firm.
 */
const webhookService = {
  /**
   * Get webhook statistics for the current firm
   *
   * Retrieves comprehensive statistics including total webhooks, active webhooks,
   * delivery counts, and success rates.
   *
   * @endpoint GET /api/webhooks/stats
   * @returns {Promise<WebhookStats>} Statistics object containing webhook metrics
   * @throws {Error} If the API request fails or user is not authenticated
   *
   * @example
   * ```ts
   * const stats = await webhookService.getStats()
   * console.log(`Success rate: ${stats.successRate}%`)
   * ```
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
   *
   * Retrieves the list of all event types that can be subscribed to via webhooks.
   * Events are categorized (e.g., payment, invoice, client) and include descriptions
   * to help users understand when each event is triggered.
   *
   * @endpoint GET /api/webhooks/events
   * @returns {Promise<WebhookEvent[]>} Array of available webhook events with names, descriptions, and categories
   * @throws {Error} If the API request fails
   *
   * @example
   * ```ts
   * const events = await webhookService.getAvailableEvents()
   * const paymentEvents = events.filter(e => e.category === 'payment')
   * ```
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
   *
   * Creates a new webhook configuration for the current firm. The webhook will be
   * automatically associated with the authenticated user's firm. A unique secret
   * is generated for signature verification.
   *
   * @endpoint POST /api/webhooks
   * @param {WebhookFormData} data - Webhook configuration data
   * @param {string} data.url - The endpoint URL where webhook events will be sent
   * @param {string[]} data.events - Array of event types to subscribe to (e.g., ['payment.success', 'invoice.created'])
   * @param {string} [data.description] - Optional description for the webhook
   * @param {boolean} [data.isActive=true] - Whether the webhook should be active upon creation
   * @returns {Promise<Webhook>} The created webhook object with generated ID and secret
   * @throws {Error} If validation fails or the URL is not reachable
   *
   * @example
   * ```ts
   * const webhook = await webhookService.registerWebhook({
   *   url: 'https://myapp.com/webhooks/trafeli',
   *   events: ['payment.success', 'payment.failed'],
   *   description: 'Production payment notifications',
   *   isActive: true
   * })
   * console.log('Secret:', webhook.secret) // Store this securely
   * ```
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
   *
   * Retrieves a paginated list of all webhook configurations for the current firm.
   * Results are automatically filtered by firmId on the backend.
   *
   * @endpoint GET /api/webhooks
   * @param {Object} [params] - Query parameters for pagination
   * @param {number} [params.page=1] - Page number for pagination
   * @param {number} [params.limit=10] - Number of webhooks per page
   * @returns {Promise<{webhooks: Webhook[], total: number}>} Paginated webhook list and total count
   * @throws {Error} If the API request fails or user is not authenticated
   *
   * @example
   * ```ts
   * const { webhooks, total } = await webhookService.getWebhooks({ page: 1, limit: 20 })
   * console.log(`Showing ${webhooks.length} of ${total} webhooks`)
   * ```
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
   *
   * Retrieves detailed information about a specific webhook configuration.
   * Access is restricted to webhooks belonging to the current firm.
   *
   * @endpoint GET /api/webhooks/:id
   * @param {string} id - The webhook ID
   * @returns {Promise<Webhook>} The webhook object with full details
   * @throws {Error} If webhook not found, doesn't belong to firm, or user is not authenticated
   *
   * @example
   * ```ts
   * const webhook = await webhookService.getWebhook('webhook_123')
   * console.log(`Webhook URL: ${webhook.url}`)
   * console.log(`Subscribed to: ${webhook.events.join(', ')}`)
   * ```
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
   *
   * Performs a full replacement update of a webhook configuration. All fields must be provided.
   * Use patchWebhook() for partial updates. The webhook secret is not modified by this endpoint.
   *
   * @endpoint PUT /api/webhooks/:id
   * @param {string} id - The webhook ID
   * @param {WebhookFormData} data - Complete webhook configuration data
   * @param {string} data.url - The endpoint URL where webhook events will be sent
   * @param {string[]} data.events - Array of event types to subscribe to
   * @param {string} [data.description] - Optional description
   * @param {boolean} [data.isActive] - Whether the webhook is active
   * @returns {Promise<Webhook>} The updated webhook object
   * @throws {Error} If webhook not found, validation fails, or user lacks permission
   *
   * @example
   * ```ts
   * const updated = await webhookService.updateWebhook('webhook_123', {
   *   url: 'https://myapp.com/webhooks/trafeli-v2',
   *   events: ['payment.success', 'payment.failed', 'invoice.paid'],
   *   description: 'Updated production webhook',
   *   isActive: true
   * })
   * ```
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
   *
   * Performs a partial update of a webhook configuration. Only provided fields are updated,
   * other fields remain unchanged. Useful for updating specific properties without
   * affecting the rest of the configuration.
   *
   * @endpoint PATCH /api/webhooks/:id
   * @param {string} id - The webhook ID
   * @param {Partial<WebhookFormData>} data - Partial webhook data with fields to update
   * @param {string} [data.url] - Updated endpoint URL
   * @param {string[]} [data.events] - Updated event subscriptions
   * @param {string} [data.description] - Updated description
   * @param {boolean} [data.isActive] - Updated active status
   * @returns {Promise<Webhook>} The updated webhook object
   * @throws {Error} If webhook not found, validation fails, or user lacks permission
   *
   * @example
   * ```ts
   * // Only update the description
   * const updated = await webhookService.patchWebhook('webhook_123', {
   *   description: 'New description'
   * })
   * ```
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
   *
   * Permanently deletes a webhook configuration and all associated delivery history.
   * This action cannot be undone. The webhook must belong to the current firm.
   *
   * @endpoint DELETE /api/webhooks/:id
   * @param {string} id - The webhook ID to delete
   * @returns {Promise<void>}
   * @throws {Error} If webhook not found, user lacks permission, or deletion fails
   *
   * @example
   * ```ts
   * await webhookService.deleteWebhook('webhook_123')
   * console.log('Webhook deleted successfully')
   * ```
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
   *
   * Sends a test event to the webhook URL to verify it's configured correctly.
   * The test event includes sample data and uses the webhook's secret for signature.
   * This is useful for validating webhook endpoints before going live.
   *
   * @endpoint POST /api/webhooks/:id/test
   * @param {string} id - The webhook ID to test
   * @returns {Promise<{success: boolean, message: string}>} Test result with success status and message
   * @throws {Error} If webhook not found, URL is unreachable, or test fails
   *
   * @example
   * ```ts
   * const result = await webhookService.testWebhook('webhook_123')
   * if (result.success) {
   *   console.log('Webhook test successful:', result.message)
   * } else {
   *   console.error('Webhook test failed:', result.message)
   * }
   * ```
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
   *
   * Activates a webhook so it will receive events. Once enabled, the webhook
   * will start receiving real-time notifications for subscribed events.
   * This is a convenience method equivalent to patchWebhook with isActive: true.
   *
   * @endpoint POST /api/webhooks/:id/enable
   * @param {string} id - The webhook ID to enable
   * @returns {Promise<Webhook>} The updated webhook object with isActive set to true
   * @throws {Error} If webhook not found or user lacks permission
   *
   * @example
   * ```ts
   * const webhook = await webhookService.enableWebhook('webhook_123')
   * console.log('Webhook enabled:', webhook.isActive) // true
   * ```
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
   *
   * Deactivates a webhook so it will stop receiving events. The webhook configuration
   * is preserved and can be re-enabled later. No events will be sent while disabled.
   * This is a convenience method equivalent to patchWebhook with isActive: false.
   *
   * @endpoint POST /api/webhooks/:id/disable
   * @param {string} id - The webhook ID to disable
   * @returns {Promise<Webhook>} The updated webhook object with isActive set to false
   * @throws {Error} If webhook not found or user lacks permission
   *
   * @example
   * ```ts
   * const webhook = await webhookService.disableWebhook('webhook_123')
   * console.log('Webhook disabled:', !webhook.isActive) // true
   * ```
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
   * Get webhook secret
   *
   * Retrieves the webhook's signing secret used for verifying webhook signatures.
   * This endpoint should be restricted to users with appropriate permissions.
   * The secret is used to generate HMAC signatures for webhook payloads.
   *
   * @security Restricted to admin users or webhook owners
   * @endpoint GET /api/webhooks/:id/secret
   * @param {string} id - The webhook ID
   * @returns {Promise<{secret: string}>} Object containing the webhook secret
   * @throws {Error} If webhook not found, user lacks permission, or not authenticated
   *
   * @example
   * ```ts
   * const { secret } = await webhookService.getWebhookSecret('webhook_123')
   * // Store securely - never expose in client-side code or logs
   * console.log('Secret retrieved (length):', secret.length)
   * ```
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
   *
   * Generates a new signing secret for the webhook. The old secret is immediately
   * invalidated, so you must update your webhook receiver to use the new secret.
   * Use this if the secret has been compromised or for regular security rotation.
   *
   * @security Restricted to admin users or webhook owners
   * @endpoint POST /api/webhooks/:id/regenerate-secret
   * @param {string} id - The webhook ID
   * @returns {Promise<{secret: string}>} Object containing the new webhook secret
   * @throws {Error} If webhook not found, user lacks permission, or not authenticated
   *
   * @example
   * ```ts
   * const { secret } = await webhookService.regenerateSecret('webhook_123')
   * // IMPORTANT: Update your webhook receiver with the new secret immediately
   * console.log('New secret generated - update your receiver now!')
   * ```
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
   *
   * Retrieves the delivery history for a webhook, showing all events that were sent,
   * their status (pending, success, failed), and response details. Useful for debugging
   * webhook issues and monitoring delivery success rates.
   *
   * @endpoint GET /api/webhooks/:id/deliveries
   * @param {string} id - The webhook ID
   * @param {Object} [params] - Query parameters for pagination
   * @param {number} [params.page=1] - Page number for pagination
   * @param {number} [params.limit=10] - Number of deliveries per page
   * @returns {Promise<{deliveries: WebhookDelivery[], total: number}>} Paginated delivery list and total count
   * @throws {Error} If webhook not found or user lacks permission
   *
   * @example
   * ```ts
   * const { deliveries, total } = await webhookService.getWebhookDeliveries('webhook_123', {
   *   page: 1,
   *   limit: 50
   * })
   * const failedDeliveries = deliveries.filter(d => d.status === 'failed')
   * console.log(`${failedDeliveries.length} failed out of ${total} total deliveries`)
   * ```
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
   *
   * Retrieves detailed information about a specific webhook delivery, including
   * the full payload that was sent, the response received, error details if failed,
   * and the number of delivery attempts.
   *
   * @endpoint GET /api/webhooks/:id/deliveries/:deliveryId
   * @param {string} id - The webhook ID
   * @param {string} deliveryId - The delivery ID
   * @returns {Promise<WebhookDelivery>} Complete delivery details including payload and response
   * @throws {Error} If webhook or delivery not found, or user lacks permission
   *
   * @example
   * ```ts
   * const delivery = await webhookService.getDeliveryDetails('webhook_123', 'delivery_456')
   * console.log('Event:', delivery.event)
   * console.log('Status:', delivery.status)
   * console.log('Attempts:', delivery.attempts)
   * if (delivery.error) {
   *   console.error('Error:', delivery.error)
   * }
   * ```
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
   *
   * Manually triggers a retry of a failed webhook delivery. The same payload will be
   * sent again to the webhook URL. The delivery's attempt count will be incremented.
   * Useful for recovering from temporary failures or after fixing webhook receiver issues.
   *
   * @endpoint POST /api/webhooks/:id/deliveries/:deliveryId/retry
   * @param {string} id - The webhook ID
   * @param {string} deliveryId - The delivery ID to retry
   * @returns {Promise<WebhookDelivery>} Updated delivery object with new status and attempt count
   * @throws {Error} If webhook/delivery not found, delivery already succeeded, or user lacks permission
   *
   * @example
   * ```ts
   * const delivery = await webhookService.retryDelivery('webhook_123', 'delivery_456')
   * if (delivery.status === 'success') {
   *   console.log('Retry successful!')
   * } else {
   *   console.log(`Retry failed. Total attempts: ${delivery.attempts}`)
   * }
   * ```
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

/**
 * Email Marketing Service
 * Handles all email marketing API calls for campaigns, templates, subscribers, and segments
 * Base route: /api/email-marketing
 *
 * ⚠️ WARNING: Some endpoints are not yet implemented in the backend
 * - All segment-related endpoints [BACKEND-PENDING]
 * - Analytics endpoints (overview, trends) [BACKEND-PENDING]
 * - Subscriber unsubscribe endpoint [BACKEND-PENDING]
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Helper function to throw bilingual error message for not-yet-implemented endpoints
 */
const throwNotImplementedError = (operation: string, endpoint: string): never => {
  throw new Error(
    `❌ Backend Not Implemented | الخلفية غير مطبقة\n\n` +
    `EN: The email marketing backend endpoint '${endpoint}' is not yet implemented. ` +
    `This operation (${operation}) cannot be performed until the backend endpoint is created.\n\n` +
    `AR: نقطة نهاية التسويق عبر البريد الإلكتروني '${endpoint}' غير مطبقة بعد. ` +
    `لا يمكن تنفيذ هذه العملية (${operation}) حتى يتم إنشاء نقطة النهاية الخلفية.`
  )
}

/**
 * Helper function to format bilingual error messages for API errors
 */
const formatBilingualError = (error: any, operation: string): string => {
  const errorMessage = handleApiError(error)
  return `${errorMessage} | فشلت العملية: ${operation}`
}

/**
 * Email Campaign Interface
 */
export interface EmailCampaign {
  _id: string
  firmId: string
  name: string
  subject: string
  fromName: string
  fromEmail: string
  replyTo?: string
  templateId?: string
  content: string
  segmentIds?: string[]
  scheduledAt?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  stats?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
  }
  createdAt: string
  updatedAt: string
}

/**
 * Email Template Interface
 */
export interface EmailTemplate {
  _id: string
  firmId?: string
  name: string
  description?: string
  category: string
  isPublic: boolean
  thumbnail?: string
  html: string
  css?: string
  variables?: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Email Subscriber Interface
 */
export interface EmailSubscriber {
  _id: string
  firmId: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  status: 'active' | 'unsubscribed' | 'bounced'
  tags?: string[]
  customFields?: Record<string, any>
  subscribedAt: string
  unsubscribedAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * Email Segment Interface
 */
export interface EmailSegment {
  _id: string
  firmId: string
  name: string
  description?: string
  conditions: any[]
  subscriberCount?: number
  createdAt: string
  updatedAt: string
}

/**
 * Campaign Analytics Interface
 */
export interface CampaignAnalytics {
  campaignId: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
  topLinks?: Array<{ url: string; clicks: number }>
  deviceBreakdown?: Record<string, number>
  locationBreakdown?: Record<string, number>
}

/**
 * Overview Analytics Interface
 */
export interface OverviewAnalytics {
  totalCampaigns: number
  totalSubscribers: number
  activeSubscribers: number
  totalSent: number
  averageOpenRate: number
  averageClickRate: number
  recentCampaigns: Array<{
    id: string
    name: string
    sentAt: string
    openRate: number
    clickRate: number
  }>
}

/**
 * Trends Analytics Interface
 */
export interface TrendsAnalytics {
  period: string
  data: Array<{
    date: string
    sent: number
    opened: number
    clicked: number
  }>
}

/**
 * Create Campaign Data
 */
export interface CreateCampaignData {
  name: string
  subject: string
  fromName: string
  fromEmail: string
  replyTo?: string
  templateId?: string
  content: string
  segmentIds?: string[]
}

/**
 * Email Marketing Service Object
 */
const emailMarketingService = {
  // ==================== CAMPAIGNS ====================

  /**
   * Create new campaign
   * POST /api/email-marketing/campaigns
   */
  createCampaign: async (data: CreateCampaignData): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post('/email-marketing/campaigns', data)
      return response.data.campaign || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Create Campaign | إنشاء حملة'))
    }
  },

  /**
   * Get all campaigns
   * GET /api/email-marketing/campaigns
   */
  getCampaigns: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<{ campaigns: EmailCampaign[]; total: number }> => {
    try {
      const response = await apiClient.get('/email-marketing/campaigns', { params })
      return {
        campaigns: response.data.campaigns || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Get Campaigns | الحصول على الحملات'))
    }
  },

  /**
   * Get single campaign
   * GET /api/email-marketing/campaigns/:id
   */
  getCampaign: async (id: string): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.get(`/email-marketing/campaigns/${id}`)
      return response.data.campaign || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Get Campaign | الحصول على الحملة'))
    }
  },

  /**
   * Update campaign
   * PUT /api/email-marketing/campaigns/:id
   */
  updateCampaign: async (id: string, data: Partial<CreateCampaignData>): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.put(`/email-marketing/campaigns/${id}`, data)
      return response.data.campaign || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Update Campaign | تحديث الحملة'))
    }
  },

  /**
   * Delete campaign
   * DELETE /api/email-marketing/campaigns/:id
   */
  deleteCampaign: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/email-marketing/campaigns/${id}`)
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Delete Campaign | حذف الحملة'))
    }
  },

  /**
   * Duplicate campaign
   * POST /api/email-marketing/campaigns/:id/duplicate
   */
  duplicateCampaign: async (id: string): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/duplicate`)
      return response.data.campaign || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Duplicate Campaign | تكرار الحملة'))
    }
  },

  /**
   * Schedule campaign
   * POST /api/email-marketing/campaigns/:id/schedule
   */
  scheduleCampaign: async (id: string, scheduledAt: string): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/schedule`, { scheduledAt })
      return response.data.campaign || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Schedule Campaign | جدولة الحملة'))
    }
  },

  /**
   * Send campaign immediately
   * POST /api/email-marketing/campaigns/:id/send
   */
  sendCampaign: async (id: string): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/send`)
      return response.data.campaign || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Send Campaign | إرسال الحملة'))
    }
  },

  /**
   * Pause campaign
   * POST /api/email-marketing/campaigns/:id/pause
   */
  pauseCampaign: async (id: string): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/pause`)
      return response.data.campaign || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Pause Campaign | إيقاف الحملة مؤقتاً'))
    }
  },

  /**
   * Resume campaign
   * POST /api/email-marketing/campaigns/:id/resume
   */
  resumeCampaign: async (id: string): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/resume`)
      return response.data.campaign || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Resume Campaign | استئناف الحملة'))
    }
  },

  /**
   * Cancel campaign
   * POST /api/email-marketing/campaigns/:id/cancel
   */
  cancelCampaign: async (id: string): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/cancel`)
      return response.data.campaign || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Cancel Campaign | إلغاء الحملة'))
    }
  },

  /**
   * Send test email
   * POST /api/email-marketing/campaigns/:id/test
   */
  sendTestEmail: async (id: string, testEmails: string[]): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/test`, { testEmails })
      return response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Send Test Email | إرسال بريد اختباري'))
    }
  },

  /**
   * Get campaign analytics
   * GET /api/email-marketing/campaigns/:id/analytics
   */
  getCampaignAnalytics: async (id: string): Promise<CampaignAnalytics> => {
    try {
      const response = await apiClient.get(`/email-marketing/campaigns/${id}/analytics`)
      return response.data.analytics || response.data.data || response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Email Marketing Operation | عملية التسويق عبر البريد الإلكتروني'))
    }
  },

  // ==================== TEMPLATES ====================

  /**
   * Create new template
   * POST /api/email-marketing/templates
   */
  createTemplate: async (data: {
    name: string
    description?: string
    category: string
    html: string
    css?: string
    isPublic?: boolean
  }): Promise<EmailTemplate> => {
    try {
      const response = await apiClient.post('/email-marketing/templates', data)
      return response.data.template || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Create Template | إنشاء قالب'))
    }
  },

  /**
   * Get all templates
   * GET /api/email-marketing/templates
   */
  getTemplates: async (params?: {
    page?: number
    limit?: number
    category?: string
  }): Promise<{ templates: EmailTemplate[]; total: number }> => {
    try {
      const response = await apiClient.get('/email-marketing/templates', { params })
      return {
        templates: response.data.templates || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Get Templates | الحصول على القوالب'))
    }
  },

  /**
   * Get public templates
   * GET /api/email-marketing/templates/public
   */
  getPublicTemplates: async (params?: {
    page?: number
    limit?: number
    category?: string
  }): Promise<{ templates: EmailTemplate[]; total: number }> => {
    try {
      const response = await apiClient.get('/email-marketing/templates/public', { params })
      return {
        templates: response.data.templates || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Email Marketing Operation | عملية التسويق عبر البريد الإلكتروني'))
    }
  },

  /**
   * Get single template
   * GET /api/email-marketing/templates/:id
   */
  getTemplate: async (id: string): Promise<EmailTemplate> => {
    try {
      const response = await apiClient.get(`/email-marketing/templates/${id}`)
      return response.data.template || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Email Marketing Operation | عملية التسويق عبر البريد الإلكتروني'))
    }
  },

  /**
   * Update template
   * PUT /api/email-marketing/templates/:id
   */
  updateTemplate: async (id: string, data: Partial<{
    name: string
    description?: string
    category: string
    html: string
    css?: string
  }>): Promise<EmailTemplate> => {
    try {
      const response = await apiClient.put(`/email-marketing/templates/${id}`, data)
      return response.data.template || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Email Marketing Operation | عملية التسويق عبر البريد الإلكتروني'))
    }
  },

  /**
   * Delete template
   * DELETE /api/email-marketing/templates/:id
   */
  deleteTemplate: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/email-marketing/templates/${id}`)
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Email Marketing Operation | عملية التسويق عبر البريد الإلكتروني'))
    }
  },

  /**
   * Preview template
   * POST /api/email-marketing/templates/:id/preview
   */
  previewTemplate: async (id: string, variables?: Record<string, any>): Promise<{ html: string }> => {
    try {
      const response = await apiClient.post(`/email-marketing/templates/${id}/preview`, { variables })
      return response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Email Marketing Operation | عملية التسويق عبر البريد الإلكتروني'))
    }
  },

  // ==================== SUBSCRIBERS ====================

  /**
   * Create new subscriber
   * POST /api/email-marketing/subscribers
   */
  createSubscriber: async (data: {
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    tags?: string[]
    customFields?: Record<string, any>
  }): Promise<EmailSubscriber> => {
    try {
      const response = await apiClient.post('/email-marketing/subscribers', data)
      return response.data.subscriber || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Email Marketing Operation | عملية التسويق عبر البريد الإلكتروني'))
    }
  },

  /**
   * Get all subscribers
   * GET /api/email-marketing/subscribers
   */
  getSubscribers: async (params?: {
    page?: number
    limit?: number
    status?: string
    tags?: string
  }): Promise<{ subscribers: EmailSubscriber[]; total: number }> => {
    try {
      const response = await apiClient.get('/email-marketing/subscribers', { params })
      return {
        subscribers: response.data.subscribers || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Email Marketing Operation | عملية التسويق عبر البريد الإلكتروني'))
    }
  },

  /**
   * Update subscriber
   * PUT /api/email-marketing/subscribers/:id
   */
  updateSubscriber: async (id: string, data: Partial<{
    firstName?: string
    lastName?: string
    phone?: string
    tags?: string[]
    customFields?: Record<string, any>
  }>): Promise<EmailSubscriber> => {
    try {
      const response = await apiClient.put(`/email-marketing/subscribers/${id}`, data)
      return response.data.subscriber || response.data.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Email Marketing Operation | عملية التسويق عبر البريد الإلكتروني'))
    }
  },

  /**
   * Delete subscriber
   * DELETE /api/email-marketing/subscribers/:id
   */
  deleteSubscriber: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/email-marketing/subscribers/${id}`)
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Email Marketing Operation | عملية التسويق عبر البريد الإلكتروني'))
    }
  },

  /**
   * Import subscribers from CSV/file
   * POST /api/email-marketing/subscribers/import
   */
  importSubscribers: async (file: File, fieldMapping?: Record<string, string>): Promise<{
    imported: number
    failed: number
    errors?: any[]
  }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (fieldMapping) {
        formData.append('fieldMapping', JSON.stringify(fieldMapping))
      }

      const response = await apiClient.post('/email-marketing/subscribers/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Email Marketing Operation | عملية التسويق عبر البريد الإلكتروني'))
    }
  },

  /**
   * Export subscribers to CSV
   * POST /api/email-marketing/subscribers/export
   */
  exportSubscribers: async (params?: {
    status?: string
    tags?: string[]
  }): Promise<{ url: string; filename: string }> => {
    try {
      const response = await apiClient.post('/email-marketing/subscribers/export', params)
      return response.data
    } catch (error: any) {
      throw new Error(formatBilingualError(error, 'Email Marketing Operation | عملية التسويق عبر البريد الإلكتروني'))
    }
  },

  /**
   * Unsubscribe subscriber
   * POST /api/email-marketing/subscribers/:id/unsubscribe
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message indicating the endpoint is not implemented
   */
  unsubscribe: async (id: string): Promise<EmailSubscriber> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement POST /email-marketing/subscribers/:id/unsubscribe
    throwNotImplementedError('unsubscribe', 'POST /email-marketing/subscribers/:id/unsubscribe')
  },

  // ==================== SEGMENTS ====================
  // ⚠️ [BACKEND-PENDING] All segment endpoints are not yet implemented in the backend

  /**
   * Create new segment
   * POST /api/email-marketing/segments
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message indicating the endpoint is not implemented
   */
  createSegment: async (data: {
    name: string
    description?: string
    conditions: any[]
  }): Promise<EmailSegment> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement POST /email-marketing/segments
    throwNotImplementedError('createSegment', 'POST /email-marketing/segments')
  },

  /**
   * Get all segments
   * GET /api/email-marketing/segments
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message indicating the endpoint is not implemented
   */
  getSegments: async (params?: {
    page?: number
    limit?: number
  }): Promise<{ segments: EmailSegment[]; total: number }> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement GET /email-marketing/segments
    throwNotImplementedError('getSegments', 'GET /email-marketing/segments')
  },

  /**
   * Get single segment
   * GET /api/email-marketing/segments/:id
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message indicating the endpoint is not implemented
   */
  getSegment: async (id: string): Promise<EmailSegment> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement GET /email-marketing/segments/:id
    throwNotImplementedError('getSegment', 'GET /email-marketing/segments/:id')
  },

  /**
   * Update segment
   * PUT /api/email-marketing/segments/:id
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message indicating the endpoint is not implemented
   */
  updateSegment: async (id: string, data: Partial<{
    name: string
    description?: string
    conditions: any[]
  }>): Promise<EmailSegment> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement PUT /email-marketing/segments/:id
    throwNotImplementedError('updateSegment', 'PUT /email-marketing/segments/:id')
  },

  /**
   * Delete segment
   * DELETE /api/email-marketing/segments/:id
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message indicating the endpoint is not implemented
   */
  deleteSegment: async (id: string): Promise<void> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement DELETE /email-marketing/segments/:id
    throwNotImplementedError('deleteSegment', 'DELETE /email-marketing/segments/:id')
  },

  /**
   * Get subscribers in a segment
   * GET /api/email-marketing/segments/:id/subscribers
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message indicating the endpoint is not implemented
   */
  getSegmentSubscribers: async (
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ subscribers: EmailSubscriber[]; total: number }> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement GET /email-marketing/segments/:id/subscribers
    throwNotImplementedError('getSegmentSubscribers', 'GET /email-marketing/segments/:id/subscribers')
  },

  /**
   * Refresh segment (recalculate subscribers based on conditions)
   * POST /api/email-marketing/segments/:id/refresh
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message indicating the endpoint is not implemented
   */
  refreshSegment: async (id: string): Promise<EmailSegment> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement POST /email-marketing/segments/:id/refresh
    throwNotImplementedError('refreshSegment', 'POST /email-marketing/segments/:id/refresh')
  },

  // ==================== ANALYTICS ====================
  // ⚠️ [BACKEND-PENDING] Analytics endpoints are not yet implemented in the backend

  /**
   * Get overview analytics
   * GET /api/email-marketing/analytics/overview
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message indicating the endpoint is not implemented
   */
  getOverviewAnalytics: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<OverviewAnalytics> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement GET /email-marketing/analytics/overview
    throwNotImplementedError('getOverviewAnalytics', 'GET /email-marketing/analytics/overview')
  },

  /**
   * Get trends analytics
   * GET /api/email-marketing/analytics/trends
   *
   * ⚠️ [BACKEND-PENDING] This endpoint is not yet implemented in the backend
   * @throws Error with bilingual message indicating the endpoint is not implemented
   */
  getTrendsAnalytics: async (params?: {
    period?: 'week' | 'month' | 'year'
    startDate?: string
    endDate?: string
  }): Promise<TrendsAnalytics> => {
    // TODO: [BACKEND-PENDING] Backend needs to implement GET /email-marketing/analytics/trends
    throwNotImplementedError('getTrendsAnalytics', 'GET /email-marketing/analytics/trends')
  },
}

export default emailMarketingService

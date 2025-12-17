/**
 * Advanced CRM Service
 * Handles email marketing, lead scoring, and WhatsApp integration API calls
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  // Email Template types
  EmailTemplate,
  CreateEmailTemplateData,
  // Campaign types
  EmailCampaign,
  CreateCampaignData,
  CampaignFilters,
  CampaignAnalytics,
  // Drip Campaign types
  DripCampaign,
  CreateDripCampaignData,
  // Subscriber/Segment types
  EmailSubscriber,
  EmailSegment,
  CreateSegmentData,
  // Lead Scoring types
  LeadScore,
  LeadScoreConfig,
  LeadScoreDistribution,
  TrackBehaviorData,
  // WhatsApp types
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppTemplate,
  CreateTemplateData,
  SendMessageData,
  SendTemplateMessageData,
  WhatsAppBroadcast,
  CreateBroadcastData,
  ConversationFilters,
} from '@/types/crm-advanced'

// ═══════════════════════════════════════════════════════════════
// EMAIL TEMPLATE SERVICE
// ═══════════════════════════════════════════════════════════════
export const emailTemplateService = {
  /**
   * Get all templates
   */
  getTemplates: async (category?: string): Promise<EmailTemplate[]> => {
    try {
      const response = await apiClient.get('/email-marketing/templates', {
        params: { category }
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single template
   */
  getTemplate: async (id: string): Promise<EmailTemplate> => {
    try {
      const response = await apiClient.get(`/email-marketing/templates/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create template
   */
  createTemplate: async (data: CreateEmailTemplateData): Promise<EmailTemplate> => {
    try {
      const response = await apiClient.post('/email-marketing/templates', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update template
   */
  updateTemplate: async (id: string, data: Partial<CreateEmailTemplateData>): Promise<EmailTemplate> => {
    try {
      const response = await apiClient.put(`/email-marketing/templates/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete template
   */
  deleteTemplate: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/email-marketing/templates/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Preview template with sample data
   */
  previewTemplate: async (id: string, sampleData?: Record<string, string>): Promise<{
    html: string
    subject: string
  }> => {
    try {
      const response = await apiClient.post(`/email-marketing/templates/${id}/preview`, {
        sampleData
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Duplicate template
   */
  duplicateTemplate: async (id: string, newName: string): Promise<EmailTemplate> => {
    try {
      const response = await apiClient.post(`/email-marketing/templates/${id}/duplicate`, {
        name: newName
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// EMAIL CAMPAIGN SERVICE
// ═══════════════════════════════════════════════════════════════
export const emailCampaignService = {
  /**
   * Get all campaigns
   */
  getCampaigns: async (
    filters?: CampaignFilters
  ): Promise<{ data: EmailCampaign[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/email-marketing/campaigns', { params: filters })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single campaign
   */
  getCampaign: async (id: string): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.get(`/email-marketing/campaigns/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create campaign
   */
  createCampaign: async (data: CreateCampaignData): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post('/email-marketing/campaigns', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update campaign
   */
  updateCampaign: async (id: string, data: Partial<CreateCampaignData>): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.put(`/email-marketing/campaigns/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete campaign
   */
  deleteCampaign: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/email-marketing/campaigns/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send campaign immediately
   */
  sendCampaign: async (id: string): Promise<{ sent: number }> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/send`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Schedule campaign
   */
  scheduleCampaign: async (id: string, sendAt: Date, timezone: string): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/schedule`, {
        sendAt,
        timezone
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Pause campaign
   */
  pauseCampaign: async (id: string): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/pause`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resume campaign
   */
  resumeCampaign: async (id: string): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/resume`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get campaign analytics
   */
  getAnalytics: async (id: string): Promise<CampaignAnalytics> => {
    try {
      const response = await apiClient.get(`/email-marketing/campaigns/${id}/analytics`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Setup A/B test
   */
  setupABTest: async (id: string, config: {
    variants: Array<{ name: string; subject?: string; templateId?: string; weight: number }>
    winnerCriteria: 'open_rate' | 'click_rate' | 'conversion'
    testDuration: number
    testPercentage: number
  }): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/ab-test`, config)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get A/B test results
   */
  getABTestResults: async (id: string): Promise<{
    variants: Array<{ name: string; sent: number; opened: number; clicked: number; rate: number }>
    winner?: string
    confidence: number
  }> => {
    try {
      const response = await apiClient.get(`/email-marketing/campaigns/${id}/ab-test/results`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Pick A/B test winner
   */
  pickABWinner: async (id: string, variantId: string): Promise<EmailCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/campaigns/${id}/ab-test/pick-winner`, {
        variantId
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// DRIP CAMPAIGN SERVICE
// ═══════════════════════════════════════════════════════════════
export const dripCampaignService = {
  /**
   * Get all drip campaigns
   */
  getCampaigns: async (): Promise<DripCampaign[]> => {
    try {
      const response = await apiClient.get('/email-marketing/drip-campaigns')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single drip campaign
   */
  getCampaign: async (id: string): Promise<DripCampaign> => {
    try {
      const response = await apiClient.get(`/email-marketing/drip-campaigns/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create drip campaign
   */
  createCampaign: async (data: CreateDripCampaignData): Promise<DripCampaign> => {
    try {
      const response = await apiClient.post('/email-marketing/drip-campaigns', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update drip campaign
   */
  updateCampaign: async (id: string, data: Partial<CreateDripCampaignData>): Promise<DripCampaign> => {
    try {
      const response = await apiClient.put(`/email-marketing/drip-campaigns/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete drip campaign
   */
  deleteCampaign: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/email-marketing/drip-campaigns/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Activate drip campaign
   */
  activateCampaign: async (id: string): Promise<DripCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/drip-campaigns/${id}/activate`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Pause drip campaign
   */
  pauseCampaign: async (id: string): Promise<DripCampaign> => {
    try {
      const response = await apiClient.post(`/email-marketing/drip-campaigns/${id}/pause`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Manually enroll subscriber
   */
  enrollSubscriber: async (id: string, subscriberId: string): Promise<void> => {
    try {
      await apiClient.post(`/email-marketing/drip-campaigns/${id}/enroll`, { subscriberId })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove subscriber from drip
   */
  removeSubscriber: async (id: string, subscriberId: string): Promise<void> => {
    try {
      await apiClient.post(`/email-marketing/drip-campaigns/${id}/remove`, { subscriberId })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// SUBSCRIBER SERVICE
// ═══════════════════════════════════════════════════════════════
export const subscriberService = {
  /**
   * Get all subscribers
   */
  getSubscribers: async (params?: {
    status?: string
    tags?: string[]
    search?: string
    page?: number
    limit?: number
  }): Promise<{ data: EmailSubscriber[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/email-marketing/subscribers', { params })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single subscriber
   */
  getSubscriber: async (id: string): Promise<EmailSubscriber> => {
    try {
      const response = await apiClient.get(`/email-marketing/subscribers/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create subscriber
   */
  createSubscriber: async (data: {
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    company?: string
    tags?: string[]
    customFields?: Record<string, unknown>
  }): Promise<EmailSubscriber> => {
    try {
      const response = await apiClient.post('/email-marketing/subscribers', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Import subscribers from CSV
   */
  importSubscribers: async (file: File, options?: {
    tags?: string[]
    updateExisting?: boolean
  }): Promise<{ imported: number; updated: number; errors: number }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (options?.tags) formData.append('tags', JSON.stringify(options.tags))
      if (options?.updateExisting) formData.append('updateExisting', 'true')

      const response = await apiClient.post('/email-marketing/subscribers/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unsubscribe
   */
  unsubscribe: async (id: string, reason?: string): Promise<void> => {
    try {
      await apiClient.post(`/email-marketing/subscribers/${id}/unsubscribe`, { reason })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add tags to subscriber
   */
  addTags: async (id: string, tags: string[]): Promise<EmailSubscriber> => {
    try {
      const response = await apiClient.post(`/email-marketing/subscribers/${id}/tags`, { tags })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove tags from subscriber
   */
  removeTags: async (id: string, tags: string[]): Promise<EmailSubscriber> => {
    try {
      const response = await apiClient.delete(`/email-marketing/subscribers/${id}/tags`, {
        data: { tags }
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// SEGMENT SERVICE
// ═══════════════════════════════════════════════════════════════
export const segmentService = {
  /**
   * Get all segments
   */
  getSegments: async (): Promise<EmailSegment[]> => {
    try {
      const response = await apiClient.get('/email-marketing/segments')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single segment
   */
  getSegment: async (id: string): Promise<EmailSegment> => {
    try {
      const response = await apiClient.get(`/email-marketing/segments/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create segment
   */
  createSegment: async (data: CreateSegmentData): Promise<EmailSegment> => {
    try {
      const response = await apiClient.post('/email-marketing/segments', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update segment
   */
  updateSegment: async (id: string, data: Partial<CreateSegmentData>): Promise<EmailSegment> => {
    try {
      const response = await apiClient.put(`/email-marketing/segments/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete segment
   */
  deleteSegment: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/email-marketing/segments/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Preview segment members
   */
  previewSegment: async (id: string, limit: number = 10): Promise<EmailSubscriber[]> => {
    try {
      const response = await apiClient.get(`/email-marketing/segments/${id}/preview`, {
        params: { limit }
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Refresh segment count
   */
  refreshCount: async (id: string): Promise<{ count: number }> => {
    try {
      const response = await apiClient.post(`/email-marketing/segments/${id}/refresh`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// LEAD SCORING SERVICE
// ═══════════════════════════════════════════════════════════════
export const leadScoringService = {
  // ───────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ───────────────────────────────────────────────────────────────

  /**
   * Get scoring config
   */
  getConfig: async (): Promise<LeadScoreConfig> => {
    try {
      const response = await apiClient.get('/lead-scoring/config')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update scoring config
   */
  updateConfig: async (data: Partial<LeadScoreConfig>): Promise<LeadScoreConfig> => {
    try {
      const response = await apiClient.put('/lead-scoring/config', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ───────────────────────────────────────────────────────────────
  // SCORE CALCULATION
  // ───────────────────────────────────────────────────────────────

  /**
   * Calculate score for specific lead
   */
  calculateScore: async (leadId: string): Promise<LeadScore> => {
    try {
      const response = await apiClient.post(`/lead-scoring/calculate/${leadId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Calculate scores for all leads (admin only)
   */
  calculateAllScores: async (): Promise<{ calculated: number }> => {
    try {
      const response = await apiClient.post('/lead-scoring/calculate-all')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Calculate scores for batch of leads
   */
  calculateBatch: async (leadIds: string[]): Promise<{ calculated: number; results: LeadScore[] }> => {
    try {
      const response = await apiClient.post('/lead-scoring/calculate-batch', { leadIds })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ───────────────────────────────────────────────────────────────
  // REPORTING & ANALYTICS
  // ───────────────────────────────────────────────────────────────

  /**
   * Get all lead scores with filters
   */
  getScores: async (params?: {
    grade?: string
    minScore?: number
    maxScore?: number
    page?: number
    limit?: number
  }): Promise<{ data: LeadScore[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/lead-scoring/scores', { params })
      // API returns: { success: true, data: { scores: [...], pagination: {...} } }
      return {
        data: response.data.data.scores,
        pagination: response.data.data.pagination
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get leaderboard (top scoring leads)
   */
  getLeaderboard: async (limit: number = 10): Promise<LeadScore[]> => {
    try {
      const response = await apiClient.get('/lead-scoring/leaderboard', { params: { limit } })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get score distribution by grade
   */
  getDistribution: async (): Promise<LeadScoreDistribution[]> => {
    try {
      const response = await apiClient.get('/lead-scoring/distribution')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get top leads (highest scoring)
   */
  getTopLeads: async (limit: number = 20): Promise<LeadScore[]> => {
    try {
      const response = await apiClient.get('/lead-scoring/top-leads', { params: { limit } })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get leads by grade (A, B, C, D, F)
   */
  getLeadsByGrade: async (grade: string, params?: { page?: number; limit?: number }): Promise<{ data: LeadScore[]; pagination: any }> => {
    try {
      const response = await apiClient.get(`/lead-scoring/by-grade/${grade}`, { params })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get detailed insights for a specific lead
   */
  getLeadInsights: async (leadId: string): Promise<{
    score: LeadScore
    scoreHistory: Array<{ date: string; score: number; grade: string }>
    recentActivities: Array<{ type: string; points: number; date: string }>
    recommendations: string[]
  }> => {
    try {
      const response = await apiClient.get(`/lead-scoring/insights/${leadId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get score trends over time
   */
  getScoreTrends: async (params?: {
    startDate?: string
    endDate?: string
    interval?: 'day' | 'week' | 'month'
  }): Promise<{
    trends: Array<{ date: string; avgScore: number; count: number }>
    gradeDistribution: Record<string, number>
  }> => {
    try {
      const response = await apiClient.get('/lead-scoring/trends', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get conversion analysis by score/grade
   */
  getConversionAnalysis: async (): Promise<{
    byGrade: Record<string, { total: number; converted: number; conversionRate: number }>
    byScoreRange: Array<{ range: string; total: number; converted: number; conversionRate: number }>
    avgScoreConverted: number
    avgScoreNotConverted: number
  }> => {
    try {
      const response = await apiClient.get('/lead-scoring/conversion-analysis')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ───────────────────────────────────────────────────────────────
  // BEHAVIORAL TRACKING
  // ───────────────────────────────────────────────────────────────

  /**
   * Track email open
   */
  trackEmailOpen: async (data: { leadId: string; campaignId?: string; emailId?: string }): Promise<LeadScore> => {
    try {
      const response = await apiClient.post('/lead-scoring/track/email-open', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Track email click
   */
  trackEmailClick: async (data: { leadId: string; campaignId?: string; emailId?: string; linkUrl?: string }): Promise<LeadScore> => {
    try {
      const response = await apiClient.post('/lead-scoring/track/email-click', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Track document view
   */
  trackDocumentView: async (data: { leadId: string; documentId: string; documentType?: string }): Promise<LeadScore> => {
    try {
      const response = await apiClient.post('/lead-scoring/track/document-view', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Track website visit
   */
  trackWebsiteVisit: async (data: { leadId: string; pageUrl: string; duration?: number }): Promise<LeadScore> => {
    try {
      const response = await apiClient.post('/lead-scoring/track/website-visit', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Track form submission
   */
  trackFormSubmit: async (data: { leadId: string; formId: string; formType?: string }): Promise<LeadScore> => {
    try {
      const response = await apiClient.post('/lead-scoring/track/form-submit', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Track meeting
   */
  trackMeeting: async (data: { leadId: string; meetingId?: string; duration?: number; outcome?: string }): Promise<LeadScore> => {
    try {
      const response = await apiClient.post('/lead-scoring/track/meeting', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Track call
   */
  trackCall: async (data: { leadId: string; callId?: string; duration?: number; outcome?: string }): Promise<LeadScore> => {
    try {
      const response = await apiClient.post('/lead-scoring/track/call', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ───────────────────────────────────────────────────────────────
  // DECAY MANAGEMENT
  // ───────────────────────────────────────────────────────────────

  /**
   * Process score decay (admin only)
   */
  processDecay: async (): Promise<{ processed: number; affected: number }> => {
    try {
      const response = await apiClient.post('/lead-scoring/process-decay')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// WHATSAPP SERVICE
// ═══════════════════════════════════════════════════════════════
export const whatsAppService = {
  /**
   * Get all conversations
   */
  getConversations: async (
    filters?: ConversationFilters
  ): Promise<{ data: WhatsAppConversation[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/whatsapp/conversations', { params: filters })
      // Normalize response - handle different API response structures
      const responseData = response.data

      // Handle various API response formats:
      // Format 1: { data: [...], pagination: {...} }
      // Format 2: { conversations: [...], total: X }
      // Format 3: { success: true, data: { conversations: [...] } }
      // Format 4: { success: true, data: [...] }
      let conversations: WhatsAppConversation[] = []
      let pagination: any = { total: 0 }

      if (Array.isArray(responseData)) {
        // Direct array response
        conversations = responseData
        pagination = { total: responseData.length }
      } else if (responseData?.data) {
        if (Array.isArray(responseData.data)) {
          // { data: [...] }
          conversations = responseData.data
        } else if (responseData.data?.conversations) {
          // { data: { conversations: [...] } }
          conversations = responseData.data.conversations
          pagination = responseData.data.pagination || { total: responseData.data.total || conversations.length }
        } else if (Array.isArray(responseData.data?.data)) {
          // { data: { data: [...] } }
          conversations = responseData.data.data
          pagination = responseData.data.pagination || { total: conversations.length }
        }
        pagination = responseData.pagination || pagination
      } else if (responseData?.conversations) {
        // { conversations: [...], total: X }
        conversations = responseData.conversations
        pagination = responseData.pagination || { total: responseData.total || conversations.length }
      }

      return { data: conversations, pagination }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single conversation with messages
   */
  getConversation: async (id: string): Promise<{
    conversation: WhatsAppConversation
    messages: WhatsAppMessage[]
  }> => {
    try {
      const response = await apiClient.get(`/whatsapp/conversations/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send message
   * Supports both phoneNumber-based and conversationId-based messaging
   */
  sendMessage: async (data: SendMessageData): Promise<WhatsAppMessage> => {
    try {
      // Build request with multiple field name options for backend compatibility
      const messageContent = data.message || data.content || ''
      const phoneNum = data.phoneNumber || ''

      const normalizedData = {
        // Phone number - try multiple field names
        ...(data.conversationId && { conversationId: data.conversationId }),
        ...(phoneNum && {
          phoneNumber: phoneNum,
          to: phoneNum,  // Alternative field name
        }),
        // Message content - try multiple field names
        text: messageContent,
        message: messageContent,  // Alternative field name
        body: messageContent,     // Alternative field name
        // Message type
        type: data.type || data.messageType || 'text',
        ...(data.mediaUrl && { mediaUrl: data.mediaUrl }),
      }

      const response = await apiClient.post('/whatsapp/messages/send', normalizedData)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send template message
   */
  sendTemplateMessage: async (data: SendTemplateMessageData): Promise<WhatsAppMessage> => {
    try {
      const response = await apiClient.post('/whatsapp/send/template', data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark conversation as read
   */
  markAsRead: async (conversationId: string): Promise<void> => {
    try {
      await apiClient.post(`/whatsapp/conversations/${conversationId}/read`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Assign conversation
   */
  assignConversation: async (conversationId: string, userId: string): Promise<WhatsAppConversation> => {
    try {
      const response = await apiClient.post(`/whatsapp/conversations/${conversationId}/assign`, {
        userId
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Close conversation
   */
  closeConversation: async (conversationId: string): Promise<WhatsAppConversation> => {
    try {
      const response = await apiClient.post(`/whatsapp/conversations/${conversationId}/close`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all templates
   */
  getTemplates: async (): Promise<WhatsAppTemplate[]> => {
    try {
      const response = await apiClient.get('/whatsapp/templates')
      // Normalize response - handle different API response structures
      const responseData = response.data
      return responseData.data || responseData.templates || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create template (submit for approval)
   */
  createTemplate: async (data: CreateTemplateData): Promise<WhatsAppTemplate> => {
    try {
      const response = await apiClient.post('/whatsapp/templates', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get template status
   */
  getTemplateStatus: async (id: string): Promise<{ status: string; rejectedReason?: string }> => {
    try {
      const response = await apiClient.get(`/whatsapp/templates/${id}/status`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create broadcast
   */
  createBroadcast: async (data: CreateBroadcastData): Promise<WhatsAppBroadcast> => {
    try {
      const response = await apiClient.post('/whatsapp/broadcasts', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get broadcast history
   */
  getBroadcasts: async (): Promise<WhatsAppBroadcast[]> => {
    try {
      const response = await apiClient.get('/whatsapp/broadcasts')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send broadcast
   */
  sendBroadcast: async (id: string): Promise<WhatsAppBroadcast> => {
    try {
      const response = await apiClient.post(`/whatsapp/broadcasts/${id}/send`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

/**
 * CRM Service
 * Handles all CRM-related API calls (Leads, Pipelines, Referrals, Activities)
 * Includes Najiz (Ministry of Justice) integration support
 *
 * ERROR HANDLING:
 * - All errors return bilingual messages (English | Arabic)
 * - Sensitive backend details are not exposed to users
 * - Endpoint mismatches are handled gracefully with user-friendly messages
 */

import apiClient from '@/lib/api'
import { throwBilingualError } from '@/lib/bilingualErrorHandler'
import type {
  // Lead types
  Lead,
  CreateLeadData,
  LeadFilters,
  LeadStats,
  LeadStatus,
  // Pipeline types
  Pipeline,
  CreatePipelineData,
  CreateStageData,
  PipelineStage,
  PipelineFilters,
  PipelineView,
  PipelineStats,
  // Referral types
  Referral,
  CreateReferralData,
  ReferralFilters,
  ReferralStats,
  FeePaymentData,
  // Activity types
  CrmActivity,
  CreateActivityData,
  ActivityFilters,
  ActivityStats,
  LogCallData,
  LogEmailData,
  LogMeetingData,
  AddNoteData,
  // Transaction types - API contract Section 5
  CrmTransaction,
  CrmTransactionFilters,
  CrmTransactionStats,
} from '@/types/crm'
import type { NationalAddress } from '@/types/najiz'

/**
 * Map frontend source types to backend format
 * Frontend aliases: social_media, advertising, walk_in
 * Backend expects: social, ads, walkin
 */
const mapSourceToBackend = (source?: string): string | undefined => {
  if (!source) return source
  const sourceMap: Record<string, string> = {
    'social_media': 'social',
    'advertising': 'ads',
    'walk_in': 'walkin',
  }
  return sourceMap[source] || source
}

/**
 * Map backend source types to frontend format
 * Backend values: social, ads, walkin
 * Frontend displays: social_media, advertising, walk_in
 */
const mapSourceFromBackend = (source?: string): string | undefined => {
  if (!source) return source
  const sourceMap: Record<string, string> = {
    'social': 'social_media',
    'ads': 'advertising',
    'walkin': 'walk_in',
  }
  return sourceMap[source] || source
}

// ═══════════════════════════════════════════════════════════════
// LEAD SERVICE
// ═══════════════════════════════════════════════════════════════
export const leadService = {
  /**
   * Get all leads with optional filters
   */
  getLeads: async (
    filters?: LeadFilters
  ): Promise<{ data: Lead[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/leads', { params: filters })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single lead with activities
   */
  getLead: async (
    id: string
  ): Promise<{ lead: Lead; activities: CrmActivity[] }> => {
    try {
      const response = await apiClient.get(`/leads/${id}`)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error, 'LEAD_NOT_FOUND')
    }
  },

  /**
   * Create new lead
   */
  createLead: async (data: CreateLeadData): Promise<Lead> => {
    try {
      const response = await apiClient.post('/leads', data)
      // Backend returns: { success, message, data: { lead, automation } }
      return response.data.data?.lead || response.data.data || response.data.lead
    } catch (error: any) {
      throwBilingualError(error, 'LEAD_CREATE_FAILED')
    }
  },

  /**
   * Update lead
   */
  updateLead: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    try {
      const response = await apiClient.put(`/leads/${id}`, data)
      // Backend returns: { success, message, data: lead }
      return response.data.data || response.data.lead
    } catch (error: any) {
      throwBilingualError(error, 'LEAD_UPDATE_FAILED')
    }
  },

  /**
   * Delete lead
   */
  deleteLead: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/leads/${id}`)
    } catch (error: any) {
      throwBilingualError(error, 'LEAD_DELETE_FAILED')
    }
  },

  /**
   * Update lead status
   */
  updateLeadStatus: async (
    id: string,
    data: { status: LeadStatus; notes?: string; lostReason?: string }
  ): Promise<Lead> => {
    try {
      const response = await apiClient.post(`/leads/${id}/status`, data)
      // Backend returns: { success, message, data: lead }
      return response.data.data || response.data.lead
    } catch (error: any) {
      throwBilingualError(error, 'LEAD_UPDATE_FAILED')
    }
  },

  /**
   * Move lead to different pipeline stage
   */
  moveLeadToStage: async (
    id: string,
    data: { stageId: string; notes?: string }
  ): Promise<Lead> => {
    try {
      const response = await apiClient.post(`/leads/${id}/move`, data)
      // Backend returns: { success, message, data: lead }
      return response.data.data || response.data.lead
    } catch (error: any) {
      throwBilingualError(error, 'LEAD_UPDATE_FAILED')
    }
  },

  /**
   * Preview lead conversion (before actual conversion)
   */
  previewConversion: async (
    id: string
  ): Promise<{ lead: Lead; clientPreview: any }> => {
    try {
      const response = await apiClient.get(`/leads/${id}/conversion-preview`)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error, 'LEAD_NOT_FOUND')
    }
  },

  /**
   * Convert lead to client
   */
  convertToClient: async (
    id: string
  ): Promise<{ lead: Lead; client: any }> => {
    try {
      const response = await apiClient.post(`/leads/${id}/convert`)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error, 'LEAD_UPDATE_FAILED')
    }
  },

  /**
   * Get lead statistics
   */
  getStats: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<LeadStats> => {
    try {
      const response = await apiClient.get('/leads/stats', { params })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get leads by pipeline (Kanban view)
   */
  getByPipeline: async (pipelineId?: string): Promise<PipelineView> => {
    try {
      const url = pipelineId
        ? `/leads/pipeline/${pipelineId}`
        : '/leads/pipeline'
      const response = await apiClient.get(url)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get leads needing follow-up
   */
  getNeedingFollowUp: async (limit?: number): Promise<Lead[]> => {
    try {
      const response = await apiClient.get('/leads/follow-up', {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get lead activities
   */
  getActivities: async (
    id: string,
    params?: { type?: string; page?: number }
  ): Promise<CrmActivity[]> => {
    try {
      const response = await apiClient.get(`/leads/${id}/activities`, {
        params,
      })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error, 'LEAD_NOT_FOUND')
    }
  },

  /**
   * Log activity for lead
   */
  logActivity: async (
    id: string,
    data: CreateActivityData
  ): Promise<CrmActivity> => {
    try {
      const response = await apiClient.post(`/leads/${id}/activities`, data)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error, 'ACTIVITY_NOT_FOUND')
    }
  },

  /**
   * Schedule follow-up for lead
   */
  scheduleFollowUp: async (
    id: string,
    data: { date: string; note?: string }
  ): Promise<Lead> => {
    try {
      const response = await apiClient.post(`/leads/${id}/follow-up`, data)
      // Backend returns: { success, message, data: lead }
      return response.data.data || response.data.lead
    } catch (error: any) {
      throwBilingualError(error, 'LEAD_UPDATE_FAILED')
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // NAJIZ VERIFICATION ENDPOINTS [BACKEND-PENDING]
  // ═══════════════════════════════════════════════════════════════
  // ⚠️ WARNING: These endpoints are NOT YET IMPLEMENTED in the backend
  // ⚠️ تحذير: هذه النقاط النهائية لم يتم تنفيذها بعد في الخادم
  // These will return 404 errors until backend implementation is complete
  // ═══════════════════════════════════════════════════════════════

  /**
   * [BACKEND-PENDING] Verify company with Wathq API (Saudi CR verification)
   * POST /api/leads/:id/verify/wathq
   *
   * @throws Will show user-friendly bilingual error message
   * English: "This feature is not available yet. Please contact support."
   * Arabic: "هذه الميزة غير متاحة حالياً. يرجى التواصل مع الدعم."
   */
  verifyWithWathq: async (id: string, data?: any): Promise<{ verified: boolean; data?: any }> => {
    try {
      const response = await apiClient.post(`/leads/${id}/verify/wathq`, data)
      return response.data.data || response.data
    } catch (error: any) {
      // Will automatically show bilingual error for 404 endpoint not implemented
      throwBilingualError(error, 'LEAD_UPDATE_FAILED')
    }
  },

  /**
   * [BACKEND-PENDING] Verify identity with Absher/NIC (National ID verification)
   * POST /api/leads/:id/verify/absher
   *
   * @throws Will show user-friendly bilingual error message
   * English: "This feature is not available yet. Please contact support."
   * Arabic: "هذه الميزة غير متاحة حالياً. يرجى التواصل مع الدعم."
   */
  verifyWithAbsher: async (id: string, data?: { nationalId?: string }): Promise<{ verified: boolean; data?: any }> => {
    try {
      const response = await apiClient.post(`/leads/${id}/verify/absher`, data)
      return response.data.data || response.data
    } catch (error: any) {
      // Will automatically show bilingual error for 404 endpoint not implemented
      throwBilingualError(error, 'LEAD_UPDATE_FAILED')
    }
  },

  /**
   * [BACKEND-PENDING] Verify national address with Saudi Post
   * POST /api/leads/:id/verify/address
   *
   * @throws Will show user-friendly bilingual error message
   * English: "This feature is not available yet. Please contact support."
   * Arabic: "هذه الميزة غير متاحة حالياً. يرجى التواصل مع الدعم."
   */
  verifyNationalAddress: async (id: string, address?: NationalAddress): Promise<{ verified: boolean; data?: any }> => {
    try {
      const response = await apiClient.post(`/leads/${id}/verify/address`, address)
      return response.data.data || response.data
    } catch (error: any) {
      // Will automatically show bilingual error for 404 endpoint not implemented
      throwBilingualError(error, 'LEAD_UPDATE_FAILED')
    }
  },

  /**
   * [BACKEND-PENDING] Run conflict check for a lead
   * POST /api/leads/:id/conflict-check
   *
   * @throws Will show user-friendly bilingual error message
   * English: "This feature is not available yet. Please contact support."
   * Arabic: "هذه الميزة غير متاحة حالياً. يرجى التواصل مع الدعم."
   */
  runConflictCheck: async (id: string, data: any): Promise<any> => {
    try {
      const response = await apiClient.post(`/leads/${id}/conflict-check`, data)
      return response.data.data || response.data
    } catch (error: any) {
      // Will automatically show bilingual error for 404 endpoint not implemented
      throwBilingualError(error)
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// PIPELINE SERVICE
// ═══════════════════════════════════════════════════════════════
/**
 * Pipeline Service - Manages CRM pipelines and stages
 *
 * IMPORTANT: Base path is `/crm-pipelines` NOT `/pipelines`
 *
 * API Endpoints:
 * - GET    /crm-pipelines                      - List all pipelines
 * - GET    /crm-pipelines/:id                  - Get single pipeline with stage counts
 * - POST   /crm-pipelines                      - Create new pipeline
 * - PUT    /crm-pipelines/:id                  - Update pipeline
 * - DELETE /crm-pipelines/:id                  - Delete pipeline
 * - POST   /crm-pipelines/:id/stages           - Add stage to pipeline
 * - PUT    /crm-pipelines/:id/stages/:stageId  - Update stage
 * - DELETE /crm-pipelines/:id/stages/:stageId  - Remove stage
 * - POST   /crm-pipelines/:id/stages/reorder   - Reorder stages (NOTE: Uses POST not PUT)
 * - GET    /crm-pipelines/:id/stats            - Get pipeline statistics
 * - POST   /crm-pipelines/:id/default          - Set as default pipeline
 * - POST   /crm-pipelines/:id/duplicate        - Duplicate pipeline
 */
export const pipelineService = {
  /**
   * Get all pipelines
   */
  getPipelines: async (
    params?: PipelineFilters
  ): Promise<{ data: Pipeline[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/crm-pipelines', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single pipeline with stage counts
   */
  getPipeline: async (
    id: string
  ): Promise<{ pipeline: Pipeline; stageCounts: Record<string, number> }> => {
    try {
      const response = await apiClient.get(`/crm-pipelines/${id}`)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Create new pipeline
   */
  createPipeline: async (data: CreatePipelineData): Promise<Pipeline> => {
    try {
      const response = await apiClient.post('/crm-pipelines', data)
      // Backend returns: { success, message, data: pipeline }
      return response.data.data || response.data.pipeline
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update pipeline
   */
  updatePipeline: async (
    id: string,
    data: Partial<Pipeline>
  ): Promise<Pipeline> => {
    try {
      const response = await apiClient.put(`/crm-pipelines/${id}`, data)
      // Backend returns: { success, message, data: pipeline }
      return response.data.data || response.data.pipeline
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Delete pipeline
   */
  deletePipeline: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/crm-pipelines/${id}`)
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Add stage to pipeline
   */
  addStage: async (id: string, data: CreateStageData): Promise<Pipeline> => {
    try {
      const response = await apiClient.post(`/crm-pipelines/${id}/stages`, data)
      // Backend returns: { success, message, data: pipeline }
      return response.data.data || response.data.pipeline
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update pipeline stage
   */
  updateStage: async (
    id: string,
    stageId: string,
    data: Partial<PipelineStage>
  ): Promise<Pipeline> => {
    try {
      const response = await apiClient.put(
        `/crm-pipelines/${id}/stages/${stageId}`,
        data
      )
      // Backend returns: { success, message, data: pipeline }
      return response.data.data || response.data.pipeline
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Remove stage from pipeline
   */
  removeStage: async (id: string, stageId: string): Promise<void> => {
    try {
      await apiClient.delete(`/crm-pipelines/${id}/stages/${stageId}`)
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Reorder pipeline stages
   */
  reorderStages: async (
    id: string,
    stageOrders: { stageId: string; order: number }[]
  ): Promise<Pipeline> => {
    try {
      const response = await apiClient.post(
        `/crm-pipelines/${id}/stages/reorder`,
        { stageOrders }
      )
      // Backend returns: { success, message, data: pipeline }
      return response.data.data || response.data.pipeline
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get pipeline statistics
   */
  getStats: async (id: string): Promise<PipelineStats> => {
    try {
      const response = await apiClient.get(`/crm-pipelines/${id}/stats`)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Set pipeline as default
   */
  setDefault: async (id: string): Promise<Pipeline> => {
    try {
      const response = await apiClient.post(`/crm-pipelines/${id}/default`)
      // Backend returns: { success, message, data: pipeline }
      return response.data.data || response.data.pipeline
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Duplicate pipeline
   */
  duplicate: async (
    id: string,
    data?: { name?: string; nameAr?: string }
  ): Promise<Pipeline> => {
    try {
      const response = await apiClient.post(
        `/crm-pipelines/${id}/duplicate`,
        data
      )
      // Backend returns: { success, message, data: pipeline }
      return response.data.data || response.data.pipeline
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// REFERRAL SERVICE
// ═══════════════════════════════════════════════════════════════
export const referralService = {
  /**
   * Get all referrals
   */
  getReferrals: async (
    filters?: ReferralFilters
  ): Promise<{ data: Referral[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/referrals', { params: filters })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single referral
   */
  getReferral: async (id: string): Promise<Referral> => {
    try {
      const response = await apiClient.get(`/referrals/${id}`)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Create new referral
   */
  createReferral: async (data: CreateReferralData): Promise<Referral> => {
    try {
      const response = await apiClient.post('/referrals', data)
      // Backend returns: { success, message, data: referral }
      return response.data.data || response.data.referral
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update referral
   */
  updateReferral: async (
    id: string,
    data: Partial<Referral>
  ): Promise<Referral> => {
    try {
      const response = await apiClient.put(`/referrals/${id}`, data)
      // Backend returns: { success, message, data: referral }
      return response.data.data || response.data.referral
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Delete referral
   */
  deleteReferral: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/referrals/${id}`)
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get referral statistics
   */
  getStats: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<ReferralStats> => {
    try {
      const response = await apiClient.get('/referrals/stats', { params })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get top referrers
   */
  getTopReferrers: async (limit?: number): Promise<Referral[]> => {
    try {
      const response = await apiClient.get('/referrals/top', {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Add lead referral
   */
  addLeadReferral: async (
    id: string,
    data: { leadId: string; caseValue?: number }
  ): Promise<Referral> => {
    try {
      const response = await apiClient.post(`/referrals/${id}/leads`, data)
      // Backend returns: { success, message, data: referral }
      return response.data.data || response.data.referral
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Mark lead as converted
   */
  markConverted: async (
    id: string,
    leadId: string,
    clientId: string
  ): Promise<Referral> => {
    try {
      const response = await apiClient.post(
        `/referrals/${id}/leads/${leadId}/convert`,
        { clientId }
      )
      // Backend returns: { success, message, data: referral }
      return response.data.data || response.data.referral
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Record fee payment
   */
  recordPayment: async (
    id: string,
    data: FeePaymentData
  ): Promise<Referral> => {
    try {
      const response = await apiClient.post(`/referrals/${id}/payments`, data)
      // Backend returns: { success, message, data: referral }
      return response.data.data || response.data.referral
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Calculate referral fee
   */
  calculateFee: async (
    id: string,
    caseValue: number
  ): Promise<{ feeAmount: number }> => {
    try {
      const response = await apiClient.get(`/referrals/${id}/calculate-fee`, {
        params: { caseValue },
      })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY SERVICE
// ═══════════════════════════════════════════════════════════════
export const crmActivityService = {
  /**
   * Get all activities
   */
  getActivities: async (
    params?: ActivityFilters
  ): Promise<{ data: CrmActivity[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/crm-activities', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single activity
   */
  getActivity: async (id: string): Promise<CrmActivity> => {
    try {
      const response = await apiClient.get(`/crm-activities/${id}`)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Create activity
   */
  createActivity: async (data: CreateActivityData): Promise<CrmActivity> => {
    try {
      const response = await apiClient.post('/crm-activities', data)
      // Backend returns: { success, message, data: activity }
      return response.data.data || response.data.activity
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update activity
   */
  updateActivity: async (
    id: string,
    data: Partial<CrmActivity>
  ): Promise<CrmActivity> => {
    try {
      const response = await apiClient.put(`/crm-activities/${id}`, data)
      // Backend returns: { success, message, data: activity }
      return response.data.data || response.data.activity
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Delete activity
   */
  deleteActivity: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/crm-activities/${id}`)
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get activity timeline
   */
  getTimeline: async (params?: {
    entityTypes?: string
    types?: string
    limit?: number
  }): Promise<CrmActivity[]> => {
    try {
      const response = await apiClient.get('/crm-activities/timeline', {
        params,
      })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get activity statistics
   */
  getStats: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<ActivityStats> => {
    try {
      const response = await apiClient.get('/crm-activities/stats', { params })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get entity activities
   */
  getEntityActivities: async (
    entityType: string,
    entityId: string,
    params?: { type?: string }
  ): Promise<CrmActivity[]> => {
    try {
      const response = await apiClient.get(
        `/crm-activities/entity/${entityType}/${entityId}`,
        { params }
      )
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get upcoming tasks
   */
  getUpcomingTasks: async (params?: {
    assignedTo?: string
    endDate?: string
    limit?: number
  }): Promise<CrmActivity[]> => {
    try {
      const response = await apiClient.get('/crm-activities/tasks/upcoming', {
        params,
      })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Complete task
   */
  completeTask: async (
    id: string,
    outcomeNotes?: string
  ): Promise<CrmActivity> => {
    try {
      const response = await apiClient.post(`/crm-activities/${id}/complete`, {
        outcomeNotes,
      })
      // Backend returns: { success, message, data: activity }
      return response.data.data || response.data.activity
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Log call activity
   */
  logCall: async (data: LogCallData): Promise<CrmActivity> => {
    try {
      const response = await apiClient.post('/crm-activities/log/call', data)
      // Backend returns: { success, message, data: activity }
      return response.data.data || response.data.activity
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Log email activity
   */
  logEmail: async (data: LogEmailData): Promise<CrmActivity> => {
    try {
      const response = await apiClient.post('/crm-activities/log/email', data)
      // Backend returns: { success, message, data: activity }
      return response.data.data || response.data.activity
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Log meeting activity
   */
  logMeeting: async (data: LogMeetingData): Promise<CrmActivity> => {
    try {
      const response = await apiClient.post('/crm-activities/log/meeting', data)
      // Backend returns: { success, message, data: activity }
      return response.data.data || response.data.activity
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Add note
   */
  addNote: async (data: AddNoteData): Promise<CrmActivity> => {
    try {
      const response = await apiClient.post('/crm-activities/log/note', data)
      // Backend returns: { success, message, data: activity }
      return response.data.data || response.data.activity
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// CRM TRANSACTIONS SERVICE - API Contract Section 5
// ═══════════════════════════════════════════════════════════════
/**
 * CRM Transactions Service - Manages transaction logs
 *
 * API Endpoints (per API Contract Section 5):
 * - GET    /transactions                     - List all transactions
 * - GET    /transactions/:id                 - Get single transaction
 * - GET    /transactions/stats               - Get transaction statistics
 * - GET    /transactions/entity/:type/:id    - Get transactions for entity
 */
export const crmTransactionService = {
  /**
   * Get all transactions with optional filters
   */
  getTransactions: async (
    params?: CrmTransactionFilters
  ): Promise<{ data: CrmTransaction[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/transactions', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single transaction
   */
  getTransaction: async (id: string): Promise<CrmTransaction> => {
    try {
      const response = await apiClient.get(`/transactions/${id}`)
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get transaction statistics
   */
  getStats: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<CrmTransactionStats> => {
    try {
      const response = await apiClient.get('/transactions/stats', { params })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get transactions for a specific entity
   */
  getEntityTransactions: async (
    entityType: string,
    entityId: string,
    params?: { type?: string }
  ): Promise<CrmTransaction[]> => {
    try {
      const response = await apiClient.get(
        `/transactions/entity/${entityType}/${entityId}`,
        { params }
      )
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

// Export all services as default object
const crmService = {
  lead: leadService,
  pipeline: pipelineService,
  referral: referralService,
  activity: crmActivityService,
  transaction: crmTransactionService,
}

export default crmService

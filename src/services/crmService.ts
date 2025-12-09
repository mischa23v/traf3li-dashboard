/**
 * CRM Service
 * Handles all CRM-related API calls (Leads, Pipelines, Referrals, Activities)
 */

import apiClient, { handleApiError } from '@/lib/api'
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
} from '@/types/crm'

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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete lead
   */
  deleteLead: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/leads/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// PIPELINE SERVICE
// ═══════════════════════════════════════════════════════════════
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete pipeline
   */
  deletePipeline: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/crm-pipelines/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove stage from pipeline
   */
  removeStage: async (id: string, stageId: string): Promise<void> => {
    try {
      await apiClient.delete(`/crm-pipelines/${id}/stages/${stageId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete referral
   */
  deleteReferral: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/referrals/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete activity
   */
  deleteActivity: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/crm-activities/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
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
      throw new Error(handleApiError(error))
    }
  },
}

// Export all services as default object
const crmService = {
  lead: leadService,
  pipeline: pipelineService,
  referral: referralService,
  activity: crmActivityService,
}

export default crmService

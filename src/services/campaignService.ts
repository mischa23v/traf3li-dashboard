/**
 * Campaign Service
 * Handles all marketing campaign-related API calls
 * Supports multi-channel campaigns (email, SMS, social media, etc.)
 *
 * ERROR HANDLING:
 * - All errors return bilingual messages (English | Arabic)
 * - Sensitive backend details are not exposed to users
 * - Endpoint mismatches are handled gracefully with user-friendly messages
 *
 * TYPES:
 * - Campaign types should be defined in @/types/campaign.ts
 * - Required types: Campaign, CreateCampaignData, CampaignStatistics, CampaignAnalytics
 * - Lead type is imported from @/types/crm
 */

import apiClient from '@/lib/api'
import { throwBilingualError } from '@/lib/bilingualErrorHandler'
import type { Lead } from '@/types/crm'

// TODO: Create @/types/campaign.ts with these type definitions:
// - Campaign
// - CreateCampaignData
// - CampaignStatistics
// - CampaignAnalytics

// Temporary type definitions (should be moved to @/types/campaign.ts)
export interface Campaign {
  _id: string
  firmId: string
  name: string
  type: string
  channel: string
  status: string
  ownerId: string
  startDate?: string
  endDate?: string
  budget?: number
  spent?: number
  leads?: number
  conversions?: number
  createdAt: string
  updatedAt: string
}

export interface CreateCampaignData {
  name: string
  type: string
  channel: string
  ownerId?: string
  startDate?: string
  endDate?: string
  budget?: number
  description?: string
  targetAudience?: string
  goals?: string[]
}

export interface CampaignStatistics {
  totalLeads: number
  qualifiedLeads: number
  conversions: number
  conversionRate: number
  totalSpent: number
  costPerLead: number
  costPerConversion: number
  roi: number
  impressions?: number
  clicks?: number
  ctr?: number
}

export interface CampaignAnalytics {
  performance: {
    timeline: Array<{
      date: string
      leads: number
      conversions: number
      spent: number
    }>
  }
  leadSources: Array<{
    source: string
    count: number
    percentage: number
  }>
  conversionFunnel: Array<{
    stage: string
    count: number
    percentage: number
  }>
  demographics?: {
    age?: Record<string, number>
    location?: Record<string, number>
    industry?: Record<string, number>
  }
}

// ═══════════════════════════════════════════════════════════════
// CAMPAIGN SERVICE
// ═══════════════════════════════════════════════════════════════
export const campaignService = {
  /**
   * Get all campaigns with optional filters
   */
  getCampaigns: async (params?: {
    search?: string
    type?: string
    channel?: string
    status?: string[]
    ownerId?: string
    startAfter?: string
    endBefore?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{ data: Campaign[]; total: number; page: number; limit: number }> => {
    try {
      const response = await apiClient.get('/campaigns', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single campaign
   */
  getCampaign: async (campaignId: string): Promise<Campaign> => {
    try {
      const response = await apiClient.get(`/campaigns/${campaignId}`)
      return response.data.data || response.data.campaign
    } catch (error: any) {
      throwBilingualError(error, 'CAMPAIGN_NOT_FOUND')
    }
  },

  /**
   * Create new campaign
   */
  createCampaign: async (data: CreateCampaignData): Promise<Campaign> => {
    try {
      const response = await apiClient.post('/campaigns', data)
      // Backend returns: { success, message, data: campaign }
      return response.data.data || response.data.campaign
    } catch (error: any) {
      throwBilingualError(error, 'CAMPAIGN_CREATE_FAILED')
    }
  },

  /**
   * Update campaign
   */
  updateCampaign: async (
    campaignId: string,
    data: Partial<Campaign>
  ): Promise<Campaign> => {
    try {
      const response = await apiClient.put(`/campaigns/${campaignId}`, data)
      // Backend returns: { success, message, data: campaign }
      return response.data.data || response.data.campaign
    } catch (error: any) {
      throwBilingualError(error, 'CAMPAIGN_UPDATE_FAILED')
    }
  },

  /**
   * Delete campaign
   */
  deleteCampaign: async (campaignId: string): Promise<void> => {
    try {
      await apiClient.delete(`/campaigns/${campaignId}`)
    } catch (error: any) {
      throwBilingualError(error, 'CAMPAIGN_DELETE_FAILED')
    }
  },

  /**
   * Duplicate campaign
   */
  duplicateCampaign: async (campaignId: string): Promise<Campaign> => {
    try {
      const response = await apiClient.post(`/campaigns/${campaignId}/duplicate`)
      // Backend returns: { success, message, data: campaign }
      return response.data.data || response.data.campaign
    } catch (error: any) {
      throwBilingualError(error, 'CAMPAIGN_UPDATE_FAILED')
    }
  },

  /**
   * Pause campaign
   */
  pauseCampaign: async (campaignId: string): Promise<Campaign> => {
    try {
      const response = await apiClient.post(`/campaigns/${campaignId}/pause`)
      // Backend returns: { success, message, data: campaign }
      return response.data.data || response.data.campaign
    } catch (error: any) {
      throwBilingualError(error, 'CAMPAIGN_UPDATE_FAILED')
    }
  },

  /**
   * Resume campaign
   */
  resumeCampaign: async (campaignId: string): Promise<Campaign> => {
    try {
      const response = await apiClient.post(`/campaigns/${campaignId}/resume`)
      // Backend returns: { success, message, data: campaign }
      return response.data.data || response.data.campaign
    } catch (error: any) {
      throwBilingualError(error, 'CAMPAIGN_UPDATE_FAILED')
    }
  },

  /**
   * Complete campaign
   */
  completeCampaign: async (campaignId: string): Promise<Campaign> => {
    try {
      const response = await apiClient.post(`/campaigns/${campaignId}/complete`)
      // Backend returns: { success, message, data: campaign }
      return response.data.data || response.data.campaign
    } catch (error: any) {
      throwBilingualError(error, 'CAMPAIGN_UPDATE_FAILED')
    }
  },

  /**
   * Get campaign leads
   */
  getCampaignLeads: async (
    campaignId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ data: Lead[]; total: number }> => {
    try {
      const response = await apiClient.get(`/campaigns/${campaignId}/leads`, {
        params,
      })
      return response.data
    } catch (error: any) {
      throwBilingualError(error, 'CAMPAIGN_NOT_FOUND')
    }
  },

  /**
   * Get campaign statistics
   */
  getCampaignStats: async (campaignId: string): Promise<CampaignStatistics> => {
    try {
      const response = await apiClient.get(`/campaigns/${campaignId}/stats`)
      return response.data.data || response.data.stats
    } catch (error: any) {
      throwBilingualError(error, 'CAMPAIGN_NOT_FOUND')
    }
  },

  /**
   * Get campaign analytics (charts data)
   */
  getCampaignAnalytics: async (campaignId: string): Promise<CampaignAnalytics> => {
    try {
      const response = await apiClient.get(`/campaigns/${campaignId}/analytics`)
      return response.data.data || response.data.analytics
    } catch (error: any) {
      throwBilingualError(error, 'CAMPAIGN_NOT_FOUND')
    }
  },
}

export default campaignService

/**
 * CRM Settings Service
 * Handles all CRM settings-related API calls
 * (Sales Teams, Territories, Lost Reasons, Tags, Email Templates, Competitors, General Settings)
 *
 * ERROR HANDLING:
 * - All errors return bilingual messages (English | Arabic)
 * - Sensitive backend details are not exposed to users
 * - Endpoint mismatches are handled gracefully with user-friendly messages
 */

import apiClient from '@/lib/api'
import { throwBilingualError } from '@/lib/bilingualErrorHandler'

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

// Sales Team Types
export interface SalesTeam {
  id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  leaderId?: string
  leaderName?: string
  members?: SalesTeamMember[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SalesTeamMember {
  id: string
  userId: string
  userName: string
  role: 'leader' | 'member'
  joinedAt: string
}

export interface CreateSalesTeamData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  leaderId?: string
  isActive?: boolean
}

export interface AddMemberData {
  userId: string
  role: 'leader' | 'member'
}

// Territory Types
export interface Territory {
  id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  type: 'geographic' | 'industry' | 'account_size' | 'custom'
  parentId?: string
  order: number
  assignedUsers?: string[]
  assignedTeams?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTerritoryData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  type: 'geographic' | 'industry' | 'account_size' | 'custom'
  parentId?: string
  isActive?: boolean
}

export interface ReorderTerritoryData {
  territoryId: string
  order: number
}

export interface AssignUserData {
  userId: string
}

export interface AssignTeamData {
  teamId: string
}

// Lost Reason Types
export interface LostReason {
  id: string
  reason: string
  reasonAr: string
  category: 'price' | 'competitor' | 'timing' | 'no_response' | 'other'
  order: number
  isActive: boolean
  usageCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateLostReasonData {
  reason: string
  reasonAr: string
  category: 'price' | 'competitor' | 'timing' | 'no_response' | 'other'
  isActive?: boolean
}

export interface ReorderLostReasonData {
  lostReasonId: string
  order: number
}

// CRM Tag Types
export interface CrmTag {
  id: string
  name: string
  nameAr: string
  color: string
  category?: string
  usageCount?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCrmTagData {
  name: string
  nameAr: string
  color: string
  category?: string
  isActive?: boolean
}

export interface MergeTagsData {
  sourceTagIds: string[]
  targetTagId: string
}

// Email Template Types
export interface EmailTemplate {
  id: string
  name: string
  nameAr: string
  subject: string
  subjectAr: string
  body: string
  bodyAr: string
  category: 'lead' | 'follow_up' | 'proposal' | 'thank_you' | 'other'
  variables?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEmailTemplateData {
  name: string
  nameAr: string
  subject: string
  subjectAr: string
  body: string
  bodyAr: string
  category: 'lead' | 'follow_up' | 'proposal' | 'thank_you' | 'other'
  isActive?: boolean
}

export interface PreviewEmailData {
  templateId: string
  variables?: Record<string, string>
}

export interface EmailPreview {
  subject: string
  subjectAr: string
  body: string
  bodyAr: string
}

// Competitor Types
export interface Competitor {
  id: string
  name: string
  nameAr: string
  website?: string
  description?: string
  descriptionAr?: string
  strengths?: string
  strengthsAr?: string
  weaknesses?: string
  weaknessesAr?: string
  isActive: boolean
  lostDealsCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateCompetitorData {
  name: string
  nameAr: string
  website?: string
  description?: string
  descriptionAr?: string
  strengths?: string
  strengthsAr?: string
  weaknesses?: string
  weaknessAr?: string
  isActive?: boolean
}

export interface CompetitorStats {
  competitorId: string
  competitorName: string
  lostDealsCount: number
  totalValue: number
  avgDealSize: number
  winRate: number
}

// Working Hours Types (for Appointments)
export interface WorkingHoursDay {
  enabled: boolean
  start: string  // "HH:mm" format
  end: string    // "HH:mm" format
}

export interface WorkingHours {
  sunday: WorkingHoursDay
  monday: WorkingHoursDay
  tuesday: WorkingHoursDay
  wednesday: WorkingHoursDay
  thursday: WorkingHoursDay
  friday: WorkingHoursDay
  saturday: WorkingHoursDay
}

export interface AppointmentSettings {
  enabled: boolean
  defaultDuration: number
  allowedDurations: number[]
  bufferBetweenAppointments: number
  workingHours: WorkingHours
}

// CRM Settings Types
export interface CrmSettings {
  id: string
  _id?: string
  firmId?: string
  lawyerId?: string
  leadSettings: LeadSettings
  opportunitySettings: OpportunitySettings
  quoteSettings: QuoteSettings
  generalSettings: GeneralSettings
  appointmentSettings?: AppointmentSettings
  updatedAt: string
}

export interface LeadSettings {
  autoAssignEnabled: boolean
  autoAssignMethod?: 'round_robin' | 'territory' | 'team'
  duplicateCheckEnabled: boolean
  duplicateCheckFields?: string[]
  followUpReminderDays?: number
  inactivityThresholdDays?: number
}

export interface OpportunitySettings {
  requireProbability: boolean
  requireExpectedCloseDate: boolean
  autoCreateActivities: boolean
  probabilityByStage?: Record<string, number>
}

export interface QuoteSettings {
  autoNumbering: boolean
  numberPrefix?: string
  numberFormat?: string
  expiryDays?: number
  requireApproval: boolean
  approvalThreshold?: number
}

export interface GeneralSettings {
  fiscalYearStart?: string
  defaultCurrency?: string
  timezone?: string
}

export interface UpdateLeadSettingsData {
  autoAssignEnabled?: boolean
  autoAssignMethod?: 'round_robin' | 'territory' | 'team'
  duplicateCheckEnabled?: boolean
  duplicateCheckFields?: string[]
  followUpReminderDays?: number
  inactivityThresholdDays?: number
}

export interface UpdateOpportunitySettingsData {
  requireProbability?: boolean
  requireExpectedCloseDate?: boolean
  autoCreateActivities?: boolean
  probabilityByStage?: Record<string, number>
}

export interface UpdateQuoteSettingsData {
  autoNumbering?: boolean
  numberPrefix?: string
  numberFormat?: string
  expiryDays?: number
  requireApproval?: boolean
  approvalThreshold?: number
}

// ═══════════════════════════════════════════════════════════════
// SALES TEAM SERVICE
// ═══════════════════════════════════════════════════════════════
export const salesTeamService = {
  /**
   * Get all sales teams
   */
  getTeams: async (params?: {
    isActive?: boolean
    search?: string
  }): Promise<{ data: SalesTeam[]; pagination?: any }> => {
    try {
      const response = await apiClient.get('/sales-teams', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single sales team
   */
  getTeam: async (id: string): Promise<SalesTeam> => {
    try {
      const response = await apiClient.get(`/sales-teams/${id}`)
      return response.data.data || response.data.team
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Create new sales team
   */
  createTeam: async (data: CreateSalesTeamData): Promise<SalesTeam> => {
    try {
      const response = await apiClient.post('/sales-teams', data)
      return response.data.data || response.data.team
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update sales team
   */
  updateTeam: async (
    id: string,
    data: Partial<CreateSalesTeamData>
  ): Promise<SalesTeam> => {
    try {
      const response = await apiClient.put(`/sales-teams/${id}`, data)
      return response.data.data || response.data.team
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Delete sales team
   */
  deleteTeam: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/sales-teams/${id}`)
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Add member to sales team
   */
  addMember: async (id: string, data: AddMemberData): Promise<SalesTeam> => {
    try {
      const response = await apiClient.post(`/sales-teams/${id}/members`, data)
      return response.data.data || response.data.team
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Remove member from sales team
   */
  removeMember: async (id: string, userId: string): Promise<SalesTeam> => {
    try {
      const response = await apiClient.delete(
        `/sales-teams/${id}/members/${userId}`
      )
      return response.data.data || response.data.team
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update member role in sales team
   */
  updateMemberRole: async (
    id: string,
    userId: string,
    role: 'leader' | 'member'
  ): Promise<SalesTeam> => {
    try {
      const response = await apiClient.put(
        `/sales-teams/${id}/members/${userId}`,
        { role }
      )
      return response.data.data || response.data.team
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// TERRITORY SERVICE
// ═══════════════════════════════════════════════════════════════
export const territoryService = {
  /**
   * Get all territories
   */
  getTerritories: async (params?: {
    type?: string
    isActive?: boolean
    search?: string
  }): Promise<{ data: Territory[]; pagination?: any }> => {
    try {
      const response = await apiClient.get('/territories', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single territory
   */
  getTerritory: async (id: string): Promise<Territory> => {
    try {
      const response = await apiClient.get(`/territories/${id}`)
      return response.data.data || response.data.territory
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Create new territory
   */
  createTerritory: async (data: CreateTerritoryData): Promise<Territory> => {
    try {
      const response = await apiClient.post('/territories', data)
      return response.data.data || response.data.territory
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update territory
   */
  updateTerritory: async (
    id: string,
    data: Partial<CreateTerritoryData>
  ): Promise<Territory> => {
    try {
      const response = await apiClient.put(`/territories/${id}`, data)
      return response.data.data || response.data.territory
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Delete territory
   */
  deleteTerritory: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/territories/${id}`)
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Reorder territories
   */
  reorderTerritories: async (
    territoryOrders: ReorderTerritoryData[]
  ): Promise<void> => {
    try {
      await apiClient.post('/territories/reorder', { territoryOrders })
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Assign user to territory
   */
  assignUser: async (id: string, data: AssignUserData): Promise<Territory> => {
    try {
      const response = await apiClient.post(`/territories/${id}/users`, data)
      return response.data.data || response.data.territory
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Assign team to territory
   */
  assignTeam: async (id: string, data: AssignTeamData): Promise<Territory> => {
    try {
      const response = await apiClient.post(`/territories/${id}/teams`, data)
      return response.data.data || response.data.territory
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// LOST REASON SERVICE
// ═══════════════════════════════════════════════════════════════
export const lostReasonService = {
  /**
   * Get all lost reasons
   */
  getLostReasons: async (params?: {
    category?: string
    isActive?: boolean
  }): Promise<{ data: LostReason[]; pagination?: any }> => {
    try {
      const response = await apiClient.get('/lost-reasons', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Create new lost reason
   */
  createLostReason: async (data: CreateLostReasonData): Promise<LostReason> => {
    try {
      const response = await apiClient.post('/lost-reasons', data)
      return response.data.data || response.data.lostReason
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update lost reason
   */
  updateLostReason: async (
    id: string,
    data: Partial<CreateLostReasonData>
  ): Promise<LostReason> => {
    try {
      const response = await apiClient.put(`/lost-reasons/${id}`, data)
      return response.data.data || response.data.lostReason
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Delete lost reason
   */
  deleteLostReason: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/lost-reasons/${id}`)
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Reorder lost reasons
   */
  reorderLostReasons: async (
    lostReasonOrders: ReorderLostReasonData[]
  ): Promise<void> => {
    try {
      await apiClient.post('/lost-reasons/reorder', { lostReasonOrders })
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// CRM TAG SERVICE
// ═══════════════════════════════════════════════════════════════
export const crmTagService = {
  /**
   * Get all CRM tags
   */
  getTags: async (params?: {
    category?: string
    isActive?: boolean
    search?: string
  }): Promise<{ data: CrmTag[]; pagination?: any }> => {
    try {
      const response = await apiClient.get('/crm-tags', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Create new CRM tag
   */
  createTag: async (data: CreateCrmTagData): Promise<CrmTag> => {
    try {
      const response = await apiClient.post('/crm-tags', data)
      return response.data.data || response.data.tag
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update CRM tag
   */
  updateTag: async (
    id: string,
    data: Partial<CreateCrmTagData>
  ): Promise<CrmTag> => {
    try {
      const response = await apiClient.put(`/crm-tags/${id}`, data)
      return response.data.data || response.data.tag
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Delete CRM tag
   */
  deleteTag: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/crm-tags/${id}`)
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Merge multiple tags into one
   */
  mergeTags: async (data: MergeTagsData): Promise<CrmTag> => {
    try {
      const response = await apiClient.post('/crm-tags/merge', data)
      return response.data.data || response.data.tag
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// EMAIL TEMPLATE SERVICE
// ═══════════════════════════════════════════════════════════════
export const emailTemplateService = {
  /**
   * Get all email templates
   */
  getTemplates: async (params?: {
    category?: string
    isActive?: boolean
    search?: string
  }): Promise<{ data: EmailTemplate[]; pagination?: any }> => {
    try {
      const response = await apiClient.get('/email-templates', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get single email template
   */
  getTemplate: async (id: string): Promise<EmailTemplate> => {
    try {
      const response = await apiClient.get(`/email-templates/${id}`)
      return response.data.data || response.data.template
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Create new email template
   */
  createTemplate: async (
    data: CreateEmailTemplateData
  ): Promise<EmailTemplate> => {
    try {
      const response = await apiClient.post('/email-templates', data)
      return response.data.data || response.data.template
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update email template
   */
  updateTemplate: async (
    id: string,
    data: Partial<CreateEmailTemplateData>
  ): Promise<EmailTemplate> => {
    try {
      const response = await apiClient.put(`/email-templates/${id}`, data)
      return response.data.data || response.data.template
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Delete email template
   */
  deleteTemplate: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/email-templates/${id}`)
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Duplicate email template
   */
  duplicateTemplate: async (
    id: string,
    data?: { name?: string; nameAr?: string }
  ): Promise<EmailTemplate> => {
    try {
      const response = await apiClient.post(
        `/email-templates/${id}/duplicate`,
        data
      )
      return response.data.data || response.data.template
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Preview email template with variables
   */
  previewTemplate: async (data: PreviewEmailData): Promise<EmailPreview> => {
    try {
      const response = await apiClient.post('/email-templates/preview', data)
      return response.data.data || response.data.preview
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// COMPETITOR SERVICE
// ═══════════════════════════════════════════════════════════════
export const competitorService = {
  /**
   * Get all competitors
   */
  getCompetitors: async (params?: {
    isActive?: boolean
    search?: string
  }): Promise<{ data: Competitor[]; pagination?: any }> => {
    try {
      const response = await apiClient.get('/competitors', { params })
      return response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Create new competitor
   */
  createCompetitor: async (data: CreateCompetitorData): Promise<Competitor> => {
    try {
      const response = await apiClient.post('/competitors', data)
      return response.data.data || response.data.competitor
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update competitor
   */
  updateCompetitor: async (
    id: string,
    data: Partial<CreateCompetitorData>
  ): Promise<Competitor> => {
    try {
      const response = await apiClient.put(`/competitors/${id}`, data)
      return response.data.data || response.data.competitor
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Delete competitor
   */
  deleteCompetitor: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/competitors/${id}`)
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get competitor statistics
   */
  getCompetitorStats: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<CompetitorStats[]> => {
    try {
      const response = await apiClient.get('/competitors/stats', { params })
      return response.data.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// CRM GENERAL SETTINGS SERVICE
// ═══════════════════════════════════════════════════════════════
export const crmSettingsService = {
  /**
   * Get all CRM settings
   */
  getSettings: async (): Promise<CrmSettings> => {
    const startTime = performance.now()
    console.log('[CRM-SETTINGS-DEBUG] ========== GET SETTINGS START ==========')
    console.log('[CRM-SETTINGS-DEBUG] Endpoint: GET /crm-settings')
    console.log('[CRM-SETTINGS-DEBUG] Request started at:', new Date().toISOString())

    try {
      const response = await apiClient.get('/crm-settings')
      const endTime = performance.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)

      console.log('[CRM-SETTINGS-DEBUG] ✅ Response received')
      console.log('[CRM-SETTINGS-DEBUG] Duration:', duration, 'seconds')
      console.log('[CRM-SETTINGS-DEBUG] Response status:', response.status)
      console.log('[CRM-SETTINGS-DEBUG] Response headers:', JSON.stringify(response.headers, null, 2))
      console.log('[CRM-SETTINGS-DEBUG] Raw response.data:', JSON.stringify(response.data, null, 2))
      console.log('[CRM-SETTINGS-DEBUG] Has data.data?', !!response.data?.data)
      console.log('[CRM-SETTINGS-DEBUG] Has data.settings?', !!response.data?.settings)
      console.log('[CRM-SETTINGS-DEBUG] appointmentSettings:', JSON.stringify(response.data?.data?.appointmentSettings || response.data?.settings?.appointmentSettings, null, 2))
      console.log('[CRM-SETTINGS-DEBUG] workingHours:', JSON.stringify(response.data?.data?.appointmentSettings?.workingHours || response.data?.settings?.appointmentSettings?.workingHours, null, 2))
      console.log('[CRM-SETTINGS-DEBUG] ========== GET SETTINGS END ==========')

      return response.data.data || response.data.settings
    } catch (error: any) {
      const endTime = performance.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)

      console.error('[CRM-SETTINGS-DEBUG] ❌ ERROR in getSettings')
      console.error('[CRM-SETTINGS-DEBUG] Duration until error:', duration, 'seconds')
      console.error('[CRM-SETTINGS-DEBUG] Error name:', error?.name)
      console.error('[CRM-SETTINGS-DEBUG] Error message:', error?.message)
      console.error('[CRM-SETTINGS-DEBUG] Error response status:', error?.response?.status)
      console.error('[CRM-SETTINGS-DEBUG] Error response statusText:', error?.response?.statusText)
      console.error('[CRM-SETTINGS-DEBUG] Error response data:', JSON.stringify(error?.response?.data, null, 2))
      console.error('[CRM-SETTINGS-DEBUG] Error config URL:', error?.config?.url)
      console.error('[CRM-SETTINGS-DEBUG] Error config method:', error?.config?.method)
      console.error('[CRM-SETTINGS-DEBUG] Full error:', error)
      console.error('[CRM-SETTINGS-DEBUG] ========== GET SETTINGS ERROR END ==========')

      throwBilingualError(error)
    }
  },

  /**
   * Update CRM settings
   */
  updateSettings: async (data: Partial<CrmSettings>): Promise<CrmSettings> => {
    try {
      const response = await apiClient.put('/crm-settings', data)
      return response.data.data || response.data.settings
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get lead settings
   */
  getLeadSettings: async (): Promise<LeadSettings> => {
    try {
      const response = await apiClient.get('/crm-settings/lead')
      return response.data.data || response.data.settings
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update lead settings
   */
  updateLeadSettings: async (
    data: UpdateLeadSettingsData
  ): Promise<LeadSettings> => {
    try {
      const response = await apiClient.put('/crm-settings/lead', data)
      return response.data.data || response.data.settings
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get opportunity settings
   */
  getOpportunitySettings: async (): Promise<OpportunitySettings> => {
    try {
      const response = await apiClient.get('/crm-settings/opportunity')
      return response.data.data || response.data.settings
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update opportunity settings
   */
  updateOpportunitySettings: async (
    data: UpdateOpportunitySettingsData
  ): Promise<OpportunitySettings> => {
    try {
      const response = await apiClient.put('/crm-settings/opportunity', data)
      return response.data.data || response.data.settings
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get quote settings
   */
  getQuoteSettings: async (): Promise<QuoteSettings> => {
    try {
      const response = await apiClient.get('/crm-settings/quote')
      return response.data.data || response.data.settings
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update quote settings
   */
  updateQuoteSettings: async (
    data: UpdateQuoteSettingsData
  ): Promise<QuoteSettings> => {
    try {
      const response = await apiClient.put('/crm-settings/quote', data)
      return response.data.data || response.data.settings
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Get appointment settings (including working hours)
   */
  getAppointmentSettings: async (): Promise<AppointmentSettings | null> => {
    try {
      const response = await apiClient.get('/crm-settings')
      const data = response.data.data || response.data.settings || response.data
      return data?.appointmentSettings || null
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update working hours for a specific day
   */
  updateWorkingHours: async (
    day: keyof WorkingHours,
    hours: Partial<WorkingHoursDay>
  ): Promise<CrmSettings> => {
    try {
      const response = await apiClient.put('/crm-settings', {
        appointmentSettings: {
          workingHours: {
            [day]: hours,
          },
        },
      })
      return response.data.data || response.data.settings || response.data
    } catch (error: any) {
      throwBilingualError(error)
    }
  },

  /**
   * Update all working hours at once
   */
  updateAllWorkingHours: async (
    workingHours: Partial<WorkingHours>
  ): Promise<CrmSettings> => {
    const startTime = performance.now()
    const payload = {
      appointmentSettings: {
        workingHours,
      },
    }

    console.log('[CRM-SETTINGS-DEBUG] ========== UPDATE WORKING HOURS START ==========')
    console.log('[CRM-SETTINGS-DEBUG] Endpoint: PUT /crm-settings')
    console.log('[CRM-SETTINGS-DEBUG] Request started at:', new Date().toISOString())
    console.log('[CRM-SETTINGS-DEBUG] Payload being sent:', JSON.stringify(payload, null, 2))
    console.log('[CRM-SETTINGS-DEBUG] Working hours data:', JSON.stringify(workingHours, null, 2))

    try {
      const response = await apiClient.put('/crm-settings', payload)
      const endTime = performance.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)

      console.log('[CRM-SETTINGS-DEBUG] ✅ Update successful')
      console.log('[CRM-SETTINGS-DEBUG] Duration:', duration, 'seconds')
      console.log('[CRM-SETTINGS-DEBUG] Response status:', response.status)
      console.log('[CRM-SETTINGS-DEBUG] Response data:', JSON.stringify(response.data, null, 2))
      console.log('[CRM-SETTINGS-DEBUG] ========== UPDATE WORKING HOURS END ==========')

      return response.data.data || response.data.settings || response.data
    } catch (error: any) {
      const endTime = performance.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)

      console.error('[CRM-SETTINGS-DEBUG] ❌ ERROR in updateAllWorkingHours')
      console.error('[CRM-SETTINGS-DEBUG] Duration until error:', duration, 'seconds')
      console.error('[CRM-SETTINGS-DEBUG] Payload that failed:', JSON.stringify(payload, null, 2))
      console.error('[CRM-SETTINGS-DEBUG] Error name:', error?.name)
      console.error('[CRM-SETTINGS-DEBUG] Error message:', error?.message)
      console.error('[CRM-SETTINGS-DEBUG] Error response status:', error?.response?.status)
      console.error('[CRM-SETTINGS-DEBUG] Error response statusText:', error?.response?.statusText)
      console.error('[CRM-SETTINGS-DEBUG] Error response data:', JSON.stringify(error?.response?.data, null, 2))
      console.error('[CRM-SETTINGS-DEBUG] Full error:', error)
      console.error('[CRM-SETTINGS-DEBUG] ========== UPDATE WORKING HOURS ERROR END ==========')

      throwBilingualError(error)
    }
  },

  /**
   * Reset CRM settings to defaults
   */
  resetSettings: async (): Promise<void> => {
    try {
      await apiClient.delete('/crm-settings/reset')
    } catch (error: any) {
      throwBilingualError(error)
    }
  },
}

// Export all services as default object
const crmSettings = {
  salesTeam: salesTeamService,
  territory: territoryService,
  lostReason: lostReasonService,
  crmTag: crmTagService,
  emailTemplate: emailTemplateService,
  competitor: competitorService,
  settings: crmSettingsService,
}

export default crmSettings

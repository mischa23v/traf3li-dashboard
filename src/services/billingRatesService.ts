/**
 * Billing Rates Service
 * Handles billing rates, rate groups, and rate cards management
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Rate Type - How charges are calculated
 */
export type RateType = 'hourly' | 'flat' | 'contingency' | 'retainer' | 'task_based' | 'milestone'

/**
 * Rate Category - What the rate applies to
 */
export type RateCategory = 'consultation' | 'court_appearance' | 'document_preparation' | 'research' | 'meeting' | 'travel' | 'administrative' | 'other'

/**
 * Currency Type
 */
export type Currency = 'SAR' | 'USD' | 'EUR' | 'GBP' | 'AED'

/**
 * Billing Rate
 */
export interface BillingRate {
  _id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  type: RateType
  category: RateCategory
  amount: number
  currency: Currency
  unit?: string // 'hour', 'day', 'document', 'task', etc.
  minimumCharge?: number
  roundingIncrement?: number // e.g., 15 minutes
  isActive: boolean
  groupId?: string
  order: number
  createdAt: string
  updatedAt: string
}

/**
 * Rate Group - Collection of rates for pricing tiers
 */
export interface RateGroup {
  _id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  color: string
  isDefault: boolean
  isActive: boolean
  discount?: number // percentage discount
  rates: BillingRate[]
  applicableTo: ('clients' | 'cases' | 'services')[]
  createdAt: string
  updatedAt: string
}

/**
 * Rate Card Entry
 */
export interface RateCardEntry {
  _id?: string
  rateId: string
  rate: BillingRate
  customAmount?: number // override default rate amount
  customCurrency?: Currency
  notes?: string
}

/**
 * Rate Card - Custom rate sheet for client/case
 */
export interface RateCard {
  _id: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  entityType: 'client' | 'case' | 'contract'
  entityId: string
  entries: RateCardEntry[]
  effectiveFrom: string
  effectiveTo?: string
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

/**
 * Time Entry for billing
 */
export interface TimeEntry {
  _id: string
  userId: string
  caseId?: string
  clientId?: string
  rateId: string
  rate?: BillingRate
  description: string
  duration: number // in minutes
  startTime: string
  endTime?: string
  date: string
  isBillable: boolean
  billedAmount?: number
  invoiceId?: string
  status: 'draft' | 'approved' | 'billed' | 'paid'
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Create Rate Data
 */
export interface CreateRateData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  type: RateType
  category: RateCategory
  amount: number
  currency: Currency
  unit?: string
  minimumCharge?: number
  roundingIncrement?: number
  groupId?: string
}

/**
 * Update Rate Data
 */
export interface UpdateRateData {
  name?: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  type?: RateType
  category?: RateCategory
  amount?: number
  currency?: Currency
  unit?: string
  minimumCharge?: number
  roundingIncrement?: number
  isActive?: boolean
  groupId?: string
  order?: number
}

/**
 * Create Rate Group Data
 */
export interface CreateRateGroupData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  color: string
  isDefault?: boolean
  discount?: number
  applicableTo: ('clients' | 'cases' | 'services')[]
}

/**
 * Update Rate Group Data
 */
export interface UpdateRateGroupData {
  name?: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  color?: string
  isDefault?: boolean
  isActive?: boolean
  discount?: number
  applicableTo?: ('clients' | 'cases' | 'services')[]
}

/**
 * Create Rate Card Data
 */
export interface CreateRateCardData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  entityType: 'client' | 'case' | 'contract'
  entityId: string
  entries: Omit<RateCardEntry, '_id' | 'rate'>[]
  effectiveFrom: string
  effectiveTo?: string
}

/**
 * Update Rate Card Data
 */
export interface UpdateRateCardData {
  name?: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  entries?: Omit<RateCardEntry, '_id' | 'rate'>[]
  effectiveFrom?: string
  effectiveTo?: string
  isActive?: boolean
}

/**
 * Create Time Entry Data
 */
export interface CreateTimeEntryData {
  caseId?: string
  clientId?: string
  rateId: string
  description: string
  duration: number
  startTime?: string
  endTime?: string
  date: string
  isBillable?: boolean
  notes?: string
}

/**
 * Update Time Entry Data
 */
export interface UpdateTimeEntryData {
  description?: string
  duration?: number
  startTime?: string
  endTime?: string
  date?: string
  isBillable?: boolean
  status?: 'draft' | 'approved' | 'billed' | 'paid'
  notes?: string
}

/**
 * Rate Filters
 */
export interface RateFilters {
  type?: RateType
  category?: RateCategory
  groupId?: string
  isActive?: boolean
  search?: string
  page?: number
  limit?: number
}

/**
 * Rate Group Filters
 */
export interface RateGroupFilters {
  isActive?: boolean
  isDefault?: boolean
  search?: string
  page?: number
  limit?: number
}

/**
 * Time Entry Filters
 */
export interface TimeEntryFilters {
  caseId?: string
  clientId?: string
  userId?: string
  rateId?: string
  status?: string
  isBillable?: boolean
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

/**
 * Billing Statistics
 */
export interface BillingStatistics {
  totalRates: number
  activeRates: number
  totalGroups: number
  totalRateCards: number
  unbilledTime: number // in minutes
  unbilledAmount: number
  thisMonthBilled: number
  avgHourlyRate: number
}

// ==================== API RESPONSES ====================

interface BackendResponse<T> {
  success: boolean
  message?: string
  data?: T
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Legacy response formats (for single items that don't use 'data' wrapper)
interface LegacyRateResponse {
  success: boolean
  billingRate: BillingRate
}

// ==================== SERVICE ====================

const billingRatesService = {
  // ==================== BILLING RATES ====================

  /**
   * Get all billing rates
   * GET /api/billing/rates
   */
  getRates: async (filters?: RateFilters): Promise<{ rates: BillingRate[]; total: number }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.groupId) params.append('groupId', filters.groupId)
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
      if (filters?.search) params.append('search', filters.search)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const queryString = params.toString()
      const url = queryString ? `/billing/rates?${queryString}` : '/billing/rates'

      const response = await apiClient.get<BackendResponse<BillingRate[]>>(url)
      return {
        rates: response.data.data || [],
        total: response.data.pagination?.total || response.data.data?.length || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single rate by ID
   * GET /api/billing/rates/:id
   */
  getRate: async (id: string): Promise<BillingRate> => {
    try {
      const response = await apiClient.get<BackendResponse<BillingRate>>(`/billing/rates/${id}`)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new billing rate
   * POST /api/billing/rates
   */
  createRate: async (data: CreateRateData): Promise<BillingRate> => {
    try {
      const response = await apiClient.post<LegacyRateResponse>('/billing/rates', data)
      return response.data.billingRate
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update billing rate
   * PUT /api/billing/rates/:id
   */
  updateRate: async (id: string, data: UpdateRateData): Promise<BillingRate> => {
    try {
      const response = await apiClient.put<LegacyRateResponse>(`/billing/rates/${id}`, data)
      return response.data.billingRate
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete billing rate
   * DELETE /api/billing/rates/:id
   */
  deleteRate: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/billing/rates/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get rate statistics
   * GET /api/billing/rates/stats
   */
  getRateStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get<BackendResponse<any>>('/billing/rates/stats')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get applicable rate for a user/case/client
   * GET /api/billing/rates/applicable
   */
  getApplicableRate: async (params: { userId?: string; caseId?: string; clientId?: string; category?: RateCategory }): Promise<BillingRate | null> => {
    try {
      const queryParams = new URLSearchParams()
      if (params.userId) queryParams.append('userId', params.userId)
      if (params.caseId) queryParams.append('caseId', params.caseId)
      if (params.clientId) queryParams.append('clientId', params.clientId)
      if (params.category) queryParams.append('category', params.category)

      const queryString = queryParams.toString()
      const url = queryString ? `/billing/rates/applicable?${queryString}` : '/billing/rates/applicable'

      const response = await apiClient.get<BackendResponse<BillingRate>>(url)
      return response.data.data || null
    } catch (error: any) {
      if (error.response?.status === 404) return null
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Set standard rate (quick setup)
   * POST /api/billing/rates/standard
   */
  setStandardRate: async (data: { amount: number; currency: Currency }): Promise<BillingRate> => {
    try {
      const response = await apiClient.post<LegacyRateResponse>('/billing/rates/standard', data)
      return response.data.billingRate
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== RATE GROUPS ====================

  /**
   * Get default rate group
   * GET /api/billing/groups/default
   */
  getDefaultRateGroup: async (): Promise<RateGroup | null> => {
    try {
      const response = await apiClient.get<BackendResponse<RateGroup>>('/billing/groups/default')
      return response.data.data || null
    } catch (error: any) {
      if (error.response?.status === 404) return null
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all rate groups
   * GET /api/billing/groups
   */
  getRateGroups: async (filters?: RateGroupFilters): Promise<{ groups: RateGroup[]; total: number }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
      if (filters?.isDefault !== undefined) params.append('isDefault', filters.isDefault.toString())
      if (filters?.search) params.append('search', filters.search)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const queryString = params.toString()
      const url = queryString ? `/billing/groups?${queryString}` : '/billing/groups'

      const response = await apiClient.get<BackendResponse<RateGroup[]>>(url)
      return {
        groups: response.data.data || [],
        total: response.data.pagination?.total || response.data.data?.length || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single rate group by ID
   * GET /api/billing/groups/:id
   */
  getRateGroup: async (id: string): Promise<RateGroup> => {
    try {
      const response = await apiClient.get<BackendResponse<RateGroup>>(`/billing/groups/${id}`)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new rate group
   * POST /api/billing/groups
   */
  createRateGroup: async (data: CreateRateGroupData): Promise<RateGroup> => {
    try {
      const response = await apiClient.post<BackendResponse<RateGroup>>('/billing/groups', data)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update rate group
   * PATCH /api/billing/groups/:id
   */
  updateRateGroup: async (id: string, data: UpdateRateGroupData): Promise<RateGroup> => {
    try {
      const response = await apiClient.patch<BackendResponse<RateGroup>>(`/billing/groups/${id}`, data)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete rate group
   * DELETE /api/billing/groups/:id
   */
  deleteRateGroup: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/billing/groups/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add rate to group
   * POST /api/billing/groups/:groupId/rates
   */
  addRateToGroup: async (groupId: string, rateId: string): Promise<RateGroup> => {
    try {
      const response = await apiClient.post<BackendResponse<RateGroup>>(`/billing/groups/${groupId}/rates`, { rateId })
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove rate from group
   * DELETE /api/billing/groups/:groupId/rates/:rateId
   */
  removeRateFromGroup: async (groupId: string, rateId: string): Promise<RateGroup> => {
    try {
      const response = await apiClient.delete<BackendResponse<RateGroup>>(`/billing/groups/${groupId}/rates/${rateId}`)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Duplicate rate group
   * POST /api/billing/groups/:id/duplicate
   */
  duplicateRateGroup: async (id: string, name: string, nameAr: string): Promise<RateGroup> => {
    try {
      const response = await apiClient.post<BackendResponse<RateGroup>>(`/billing/groups/${id}/duplicate`, { name, nameAr })
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== RATE CARDS ====================

  /**
   * Get all rate cards
   * GET /api/rate-cards
   */
  getRateCards: async (filters?: { entityType?: string; entityId?: string; isActive?: boolean }): Promise<{ rateCards: RateCard[]; total: number }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.entityType) params.append('entityType', filters.entityType)
      if (filters?.entityId) params.append('entityId', filters.entityId)
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())

      const queryString = params.toString()
      const url = queryString ? `/rate-cards?${queryString}` : '/rate-cards'

      const response = await apiClient.get<BackendResponse<RateCard[]>>(url)
      return {
        rateCards: response.data.data || [],
        total: response.data.pagination?.total || response.data.data?.length || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get rate card for client
   * GET /api/rate-cards/client/:clientId
   */
  getRateCardForClient: async (clientId: string): Promise<RateCard | null> => {
    try {
      const response = await apiClient.get<BackendResponse<RateCard>>(`/rate-cards/client/${clientId}`)
      return response.data.data || null
    } catch (error: any) {
      if (error.response?.status === 404) return null
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get rate card for case
   * GET /api/rate-cards/case/:caseId
   */
  getRateCardForCase: async (caseId: string): Promise<RateCard | null> => {
    try {
      const response = await apiClient.get<BackendResponse<RateCard>>(`/rate-cards/case/${caseId}`)
      return response.data.data || null
    } catch (error: any) {
      if (error.response?.status === 404) return null
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get rate card for entity (unified method for client or case)
   * GET /api/rate-cards/client/:clientId or GET /api/rate-cards/case/:caseId
   */
  getRateCardForEntity: async (entityType: string, entityId: string): Promise<RateCard | null> => {
    if (entityType === 'client') {
      return billingRatesService.getRateCardForClient(entityId)
    } else if (entityType === 'case') {
      return billingRatesService.getRateCardForCase(entityId)
    }
    throw new Error(`Invalid entity type: ${entityType}. Must be 'client' or 'case'.`)
  },

  /**
   * Create rate card
   * POST /api/rate-cards
   */
  createRateCard: async (data: CreateRateCardData): Promise<RateCard> => {
    try {
      const response = await apiClient.post<BackendResponse<RateCard>>('/rate-cards', data)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update rate card
   * PATCH /api/rate-cards/:id
   */
  updateRateCard: async (id: string, data: UpdateRateCardData): Promise<RateCard> => {
    try {
      const response = await apiClient.patch<BackendResponse<RateCard>>(`/rate-cards/${id}`, data)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete rate card
   * DELETE /api/rate-cards/:id
   */
  deleteRateCard: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/rate-cards/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Calculate rate for billing
   * POST /api/rate-cards/calculate
   */
  calculateRate: async (data: { caseId?: string; clientId?: string; category: RateCategory; duration?: number }): Promise<{ amount: number; rate: BillingRate }> => {
    try {
      const response = await apiClient.post<BackendResponse<{ amount: number; rate: BillingRate }>>('/rate-cards/calculate', data)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add custom rate to rate card
   * POST /api/rate-cards/:id/rates
   */
  addCustomRate: async (id: string, data: { rateId: string; customAmount?: number; customCurrency?: Currency; notes?: string }): Promise<RateCard> => {
    try {
      const response = await apiClient.post<BackendResponse<RateCard>>(`/rate-cards/${id}/rates`, data)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update custom rate in rate card
   * PATCH /api/rate-cards/:id/rates/:rateId
   */
  updateCustomRate: async (id: string, rateId: string, data: { customAmount?: number; customCurrency?: Currency; notes?: string }): Promise<RateCard> => {
    try {
      const response = await apiClient.patch<BackendResponse<RateCard>>(`/rate-cards/${id}/rates/${rateId}`, data)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove custom rate from rate card
   * DELETE /api/rate-cards/:id/rates/:rateId
   */
  removeCustomRate: async (id: string, rateId: string): Promise<RateCard> => {
    try {
      const response = await apiClient.delete<BackendResponse<RateCard>>(`/rate-cards/${id}/rates/${rateId}`)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== TIME ENTRIES ====================

  /**
   * Get time entries
   * GET /api/billing/time-entries
   */
  getTimeEntries: async (filters?: TimeEntryFilters): Promise<{ entries: TimeEntry[]; total: number }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.caseId) params.append('caseId', filters.caseId)
      if (filters?.clientId) params.append('clientId', filters.clientId)
      if (filters?.userId) params.append('userId', filters.userId)
      if (filters?.rateId) params.append('rateId', filters.rateId)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.isBillable !== undefined) params.append('isBillable', filters.isBillable.toString())
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.append('dateTo', filters.dateTo)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const queryString = params.toString()
      const url = queryString ? `/billing/time-entries?${queryString}` : '/billing/time-entries'

      const response = await apiClient.get<BackendResponse<TimeEntry[]>>(url)
      return {
        entries: response.data.data || [],
        total: response.data.pagination?.total || response.data.data?.length || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create time entry
   * POST /api/billing/time-entries
   */
  createTimeEntry: async (data: CreateTimeEntryData): Promise<TimeEntry> => {
    try {
      const response = await apiClient.post<BackendResponse<TimeEntry>>('/billing/time-entries', data)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update time entry
   * PATCH /api/billing/time-entries/:id
   */
  updateTimeEntry: async (id: string, data: UpdateTimeEntryData): Promise<TimeEntry> => {
    try {
      const response = await apiClient.patch<BackendResponse<TimeEntry>>(`/billing/time-entries/${id}`, data)
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete time entry
   * DELETE /api/billing/time-entries/:id
   */
  deleteTimeEntry: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/billing/time-entries/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Approve time entries
   * POST /api/billing/time-entries/approve
   */
  approveTimeEntries: async (ids: string[]): Promise<TimeEntry[]> => {
    try {
      const response = await apiClient.post<BackendResponse<TimeEntry[]>>('/billing/time-entries/approve', { ids })
      return response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== STATISTICS ====================

  /**
   * Get billing statistics
   * GET /api/billing/statistics
   */
  getStatistics: async (): Promise<BillingStatistics> => {
    try {
      const response = await apiClient.get<BackendResponse<BillingStatistics>>('/billing/statistics')
      return response.data.data!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== UTILITIES ====================

  /**
   * Calculate billing amount
   */
  calculateBillingAmount: (rate: BillingRate, duration: number): number => {
    let amount = 0

    switch (rate.type) {
      case 'hourly':
        // Duration is in minutes, convert to hours
        const hours = duration / 60
        const roundedHours = rate.roundingIncrement
          ? Math.ceil(duration / rate.roundingIncrement) * (rate.roundingIncrement / 60)
          : hours
        amount = roundedHours * rate.amount
        break
      case 'flat':
        amount = rate.amount
        break
      case 'task_based':
        amount = rate.amount
        break
      case 'milestone':
        amount = rate.amount
        break
      default:
        amount = rate.amount
    }

    // Apply minimum charge if applicable
    if (rate.minimumCharge && amount < rate.minimumCharge) {
      amount = rate.minimumCharge
    }

    return amount
  },

  /**
   * Format duration (minutes to hours:minutes)
   */
  formatDuration: (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}`
  },

  /**
   * Format currency
   */
  formatCurrency: (amount: number, currency: Currency): string => {
    const formatters: Record<Currency, Intl.NumberFormat> = {
      SAR: new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }),
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
      GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
      AED: new Intl.NumberFormat('ar-AE', { style: 'currency', currency: 'AED' }),
    }
    return formatters[currency].format(amount)
  },
}

export default billingRatesService

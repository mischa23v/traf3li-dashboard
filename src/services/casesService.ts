/**
 * Cases Service
 * Handles all case-related API calls matching the backend API
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Plaintiff (Labor Case)
 */
export interface Plaintiff {
  name?: string
  nationalId?: string
  phone?: string
  address?: string
  city?: string
}

/**
 * Company (Labor Case)
 */
export interface Company {
  name?: string
  registrationNumber?: string
  address?: string
  city?: string
}

/**
 * Labor Case Details
 */
export interface LaborCaseDetails {
  plaintiff?: Plaintiff
  company?: Company
}

/**
 * Claim Item
 */
export interface Claim {
  _id?: string
  type: string
  amount: number
  period?: string
  description?: string
}

/**
 * Timeline Event
 */
export interface TimelineEvent {
  _id?: string
  event: string
  date: string
  type: 'court' | 'filing' | 'deadline' | 'general'
  status: 'upcoming' | 'completed'
}

/**
 * Case Note
 */
export interface CaseNote {
  _id?: string
  text: string
  date: string
}

/**
 * Case Document
 */
export interface CaseDocument {
  _id?: string
  filename: string
  url: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: string
  category: 'contract' | 'evidence' | 'correspondence' | 'other'
}

/**
 * Case Hearing
 */
export interface CaseHearing {
  _id?: string
  date: string
  location: string
  notes?: string
  attended: boolean
}

/**
 * Lawyer Reference
 */
export interface LawyerRef {
  _id: string
  username?: string
  firstName?: string
  lastName?: string
  image?: string
  email?: string
}

/**
 * Client Reference
 */
export interface ClientRef {
  _id: string
  username?: string
  firstName?: string
  lastName?: string
  name?: string
  image?: string
  email?: string
}

/**
 * Case Status Type
 */
export type CaseStatus = 'active' | 'closed' | 'appeal' | 'settlement' | 'on-hold' | 'completed' | 'won' | 'lost' | 'settled'

/**
 * Case Outcome Type
 */
export type CaseOutcome = 'won' | 'lost' | 'settled' | 'ongoing'

/**
 * Case Priority Type
 */
export type CasePriority = 'low' | 'medium' | 'high' | 'critical'

/**
 * Case Category Type
 */
export type CaseCategory = 'labor' | 'commercial' | 'civil' | 'criminal' | 'family' | 'administrative' | 'other'

/**
 * Full Case Interface - Matches Backend
 */
export interface Case {
  _id: string

  // Basic Info
  title: string
  description?: string
  category: CaseCategory
  startDate?: string
  endDate?: string

  // Parties
  lawyerId: LawyerRef | string
  clientId?: ClientRef | string
  clientName?: string
  clientPhone?: string
  contractId?: string

  // Labor Case Details
  laborCaseDetails?: LaborCaseDetails

  // Court Info
  caseNumber?: string
  court?: string
  judge?: string
  nextHearing?: string

  // Status & Progress
  status: CaseStatus
  outcome: CaseOutcome
  progress: number
  priority: CasePriority

  // Financial
  claimAmount: number
  expectedWinAmount: number

  // Arrays
  claims: Claim[]
  timeline: TimelineEvent[]
  notes: CaseNote[]
  documents: CaseDocument[]
  hearings: CaseHearing[]

  // Metadata
  source: 'platform' | 'external'
  createdAt: string
  updatedAt: string
}

/**
 * Create Case Data - For External Clients
 */
export interface CreateCaseData {
  title: string
  category: CaseCategory
  description?: string
  clientName?: string
  clientPhone?: string
  laborCaseDetails?: LaborCaseDetails
  caseNumber?: string
  court?: string
  startDate?: string
  priority?: CasePriority
}

/**
 * Create Case Data - From Platform Contract
 */
export interface CreateCaseFromContractData {
  contractId: string
  title: string
  category: CaseCategory
  description?: string
}

/**
 * Update Case Data
 */
export interface UpdateCaseData {
  title?: string
  description?: string
  category?: CaseCategory
  status?: CaseStatus
  priority?: CasePriority
  progress?: number
  claimAmount?: number
  expectedWinAmount?: number
  caseNumber?: string
  court?: string
  judge?: string
  nextHearing?: string
  laborCaseDetails?: LaborCaseDetails
}

/**
 * Add Note Data
 */
export interface AddNoteData {
  text: string
}

/**
 * Add Document Data
 */
export interface AddDocumentData {
  name: string
  url: string
  type: string
  size: number
  category: 'contract' | 'evidence' | 'correspondence' | 'other'
}

/**
 * Add Hearing Data
 */
export interface AddHearingData {
  date: string
  location: string
  notes?: string
}

/**
 * Add Claim Data
 */
export interface AddClaimData {
  type: string
  amount: number
  period?: string
  description?: string
}

/**
 * Case Filters
 */
export interface CaseFilters {
  status?: CaseStatus
  outcome?: CaseOutcome
  category?: CaseCategory
  priority?: CasePriority
  page?: number
  limit?: number
}

/**
 * Case Statistics (for dashboard)
 */
export interface CaseStatistics {
  total: number
  active: number
  closed: number
  won: number
  lost: number
  settled: number
  onHold: number
  highPriority: number
  totalClaimAmount: number
  avgProgress: number
}

// ==================== API RESPONSES ====================

interface CasesResponse {
  error: boolean
  cases: Case[]
}

interface CaseResponse {
  error: boolean
  case: Case
}

interface MessageResponse {
  error: boolean
  message: string
  case?: Case
}

// ==================== SERVICE ====================

const casesService = {
  /**
   * Get all cases with optional filters
   * GET /api/cases/
   */
  getCases: async (filters?: CaseFilters): Promise<{ cases: Case[]; total: number }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.outcome) params.append('outcome', filters.outcome)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.priority) params.append('priority', filters.priority)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const queryString = params.toString()
      const url = queryString ? `/cases/?${queryString}` : '/cases/'

      const response = await apiClient.get<CasesResponse>(url)
      return {
        cases: response.data.cases || [],
        total: response.data.cases?.length || 0,
      }
    } catch (error: any) {
      console.error('Get cases error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single case by ID
   * GET /api/cases/:id
   */
  getCase: async (id: string): Promise<Case> => {
    try {
      const response = await apiClient.get<CaseResponse>(`/cases/${id}`)
      return response.data.case
    } catch (error: any) {
      console.error('Get case error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new case (external client)
   * POST /api/cases/
   */
  createCase: async (data: CreateCaseData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>('/cases/', data)
      return response.data.case
    } catch (error: any) {
      console.error('Create case error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create case from platform contract
   * POST /api/cases/
   */
  createCaseFromContract: async (data: CreateCaseFromContractData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>('/cases/', data)
      return response.data.case
    } catch (error: any) {
      console.error('Create case from contract error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update case
   * PATCH /api/cases/:id
   */
  updateCase: async (id: string, data: UpdateCaseData): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${id}`, data)
      return response.data.case
    } catch (error: any) {
      console.error('Update case error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add note to case
   * POST /api/cases/:id/note
   */
  addNote: async (id: string, data: AddNoteData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(`/cases/${id}/note`, data)
      return response.data.case
    } catch (error: any) {
      console.error('Add note error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add document to case
   * POST /api/cases/:id/document
   */
  addDocument: async (id: string, data: AddDocumentData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(`/cases/${id}/document`, data)
      return response.data.case
    } catch (error: any) {
      console.error('Add document error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add hearing to case
   * POST /api/cases/:id/hearing
   */
  addHearing: async (id: string, data: AddHearingData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(`/cases/${id}/hearing`, data)
      return response.data.case
    } catch (error: any) {
      console.error('Add hearing error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update case status
   * PATCH /api/cases/:id/status
   */
  updateStatus: async (id: string, status: CaseStatus): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${id}/status`, { status })
      return response.data.case
    } catch (error: any) {
      console.error('Update status error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update case outcome
   * PATCH /api/cases/:id/outcome
   */
  updateOutcome: async (id: string, outcome: CaseOutcome): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${id}/outcome`, { outcome })
      return response.data.case
    } catch (error: any) {
      console.error('Update outcome error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete case (if supported)
   * DELETE /api/cases/:id
   */
  deleteCase: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/cases/${id}`)
    } catch (error: any) {
      console.error('Delete case error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Calculate case statistics from cases array
   */
  calculateStatistics: (cases: Case[]): CaseStatistics => {
    const stats: CaseStatistics = {
      total: cases.length,
      active: 0,
      closed: 0,
      won: 0,
      lost: 0,
      settled: 0,
      onHold: 0,
      highPriority: 0,
      totalClaimAmount: 0,
      avgProgress: 0,
    }

    let totalProgress = 0

    cases.forEach((c) => {
      // Status counts
      if (c.status === 'active') stats.active++
      if (c.status === 'closed' || c.status === 'completed') stats.closed++
      if (c.status === 'won') stats.won++
      if (c.status === 'lost') stats.lost++
      if (c.status === 'settled' || c.status === 'settlement') stats.settled++
      if (c.status === 'on-hold') stats.onHold++

      // Priority counts
      if (c.priority === 'high' || c.priority === 'critical') stats.highPriority++

      // Financial
      stats.totalClaimAmount += c.claimAmount || 0

      // Progress
      totalProgress += c.progress || 0
    })

    stats.avgProgress = cases.length > 0 ? Math.round(totalProgress / cases.length) : 0

    return stats
  },
}

export default casesService

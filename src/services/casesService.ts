/**
 * Cases Service
 * Handles all case-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Case Interface
 */
export interface Case {
  _id: string
  caseNumber: string
  title: string
  status: string
  clientId: { _id: string; name: string } | string
  lawyerId: string
  caseType?: string
  court?: string
  priority?: string
  description?: string
  opposingParty?: string
  judge?: string
  assignedTo?: { firstName: string; lastName: string }
  filingDate?: string
  nextHearingDate?: string
  claimAmount?: number
  progress?: number
  documents?: any[]
  tasks?: any[]
  history?: any[]
  createdAt: string
  updatedAt: string
}

/**
 * Create Case Data
 */
export interface CreateCaseData {
  title: string
  clientId: string
  caseType?: string
  court?: string
  priority?: string
  description?: string
  status?: string
}

/**
 * Case Filters
 */
export interface CaseFilters {
  status?: string
  clientId?: string
  caseType?: string
  priority?: string
  page?: number
  limit?: number
  select?: string
}

/**
 * Cases Service Object
 */
const casesService = {
  /**
   * Get all cases
   */
  getCases: async (filters?: CaseFilters): Promise<{ cases: Case[]; total: number }> => {
    try {
      const response = await apiClient.get('/cases', { params: filters })
      return {
        cases: response.data.cases || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      console.error('Get cases error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single case
   */
  getCase: async (id: string): Promise<Case> => {
    try {
      const response = await apiClient.get(`/cases/${id}`)
      return response.data.case || response.data.data
    } catch (error: any) {
      console.error('Get case error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create case
   */
  createCase: async (data: CreateCaseData): Promise<Case> => {
    try {
      const response = await apiClient.post('/cases', data)
      return response.data.case || response.data.data
    } catch (error: any) {
      console.error('Create case error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update case
   */
  updateCase: async (id: string, data: Partial<CreateCaseData>): Promise<Case> => {
    try {
      const response = await apiClient.put(`/cases/${id}`, data)
      return response.data.case || response.data.data
    } catch (error: any) {
      console.error('Update case error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete case
   */
  deleteCase: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/cases/${id}`)
    } catch (error: any) {
      console.error('Delete case error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

export default casesService

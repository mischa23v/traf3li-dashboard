/**
 * Lawyers/Team Service
 * Handles fetching team members for task assignment
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Lawyer/Team Member Interface
 */
export interface Lawyer {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'admin' | 'lawyer' | 'paralegal' | 'assistant'
  avatar?: string
  specialization?: string
  status: 'active' | 'inactive'
  createdAt: string
}

/**
 * Lawyer Filters
 */
export interface LawyerFilters {
  role?: string
  status?: string
  search?: string
}

/**
 * API Response Types
 */
interface LawyersResponse {
  lawyers: Lawyer[]
  total: number
}

interface LawyerResponse {
  lawyer: Lawyer
}

/**
 * Lawyers Service
 */
const lawyersService = {
  /**
   * Get all team members/lawyers
   * GET /api/lawyers
   */
  getAll: async (filters?: LawyerFilters): Promise<Lawyer[]> => {
    try {
      const response = await apiClient.get<LawyersResponse>('/lawyers', {
        params: filters,
      })
      return response.data.lawyers
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single lawyer by ID
   * GET /api/lawyers/:id
   */
  getById: async (id: string): Promise<Lawyer> => {
    try {
      const response = await apiClient.get<LawyerResponse>(`/lawyers/${id}`)
      return response.data.lawyer
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get team members available for task assignment
   * GET /api/lawyers/team
   */
  getTeamMembers: async (): Promise<Lawyer[]> => {
    try {
      const response = await apiClient.get<LawyersResponse>('/lawyers/team')
      return response.data.lawyers
    } catch {
      // Fallback to getAll if team endpoint doesn't exist
      return lawyersService.getAll({ status: 'active' })
    }
  },
}

export default lawyersService

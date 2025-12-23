/**
 * Lawyers/Team Service
 * Handles fetching team members for task assignment
 */

import apiClient, { handleApiError } from '@/lib/api'
import axios from 'axios'

// Request deduplication for team members - prevents parallel duplicate requests
let pendingTeamMembersRequest: Promise<Lawyer[]> | null = null

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
   * Uses request deduplication to prevent parallel duplicate requests
   * Only falls back to /lawyers?status=active on 404 (endpoint not found)
   */
  getTeamMembers: async (): Promise<Lawyer[]> => {
    // Deduplicate parallel requests - return existing pending request if one exists
    if (pendingTeamMembersRequest) {
      return pendingTeamMembersRequest
    }

    pendingTeamMembersRequest = (async () => {
      try {
        const response = await apiClient.get<LawyersResponse>('/lawyers/team')
        return response.data.lawyers
      } catch (error: any) {
        // Graceful fallback for backend compatibility:
        // The /lawyers/team endpoint may not exist in all backend versions.
        // If we get a 404 (endpoint not found), fall back to the standard /lawyers endpoint
        // with active status filter for backward compatibility.
        // Don't fallback on rate limiting (429) or other errors - let them propagate.
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return lawyersService.getAll({ status: 'active' })
        }
        // Re-throw all other errors (including 429) so React Query can handle retries
        throw new Error(handleApiError(error))
      } finally {
        // Clear the pending request so future calls can proceed
        pendingTeamMembersRequest = null
      }
    })()

    return pendingTeamMembersRequest
  },
}

export default lawyersService

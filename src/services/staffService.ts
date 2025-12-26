/**
 * Staff Service
 * Handles all staff-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Staff Member Interface
 */
export interface StaffMember {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  department?: string
  position?: string
  hireDate?: string
  status: 'active' | 'departed' | 'suspended' | 'pending' | 'pending_approval'
  avatar?: string
  createdAt: string
  updatedAt: string
}

/**
 * Staff Filters
 */
export interface StaffFilters {
  role?: string
  department?: string
  status?: string
  search?: string
}

/**
 * Staff Stats
 */
export interface StaffStats {
  total: number
  active: number
  departed: number
  suspended: number
  pending: number
  pendingApproval: number
  byDepartment?: Record<string, number>
  byRole?: Record<string, number>
}

/**
 * API Response Types
 */
interface StaffResponse {
  success: boolean
  data: StaffMember[]
  total?: number
}

interface StaffMemberResponse {
  success: boolean
  data: StaffMember
}

interface StaffStatsResponse {
  success: boolean
  data: StaffStats
}

interface TeamResponse {
  success: boolean
  data: StaffMember[]
}

/**
 * Staff Service
 */
const staffService = {
  /**
   * Get all staff members
   * GET /api/staff
   */
  getAll: async (filters?: StaffFilters): Promise<{ staff: StaffMember[]; total: number }> => {
    try {
      const response = await apiClient.get<StaffResponse>('/staff', {
        params: filters,
      })
      return {
        staff: response.data.data,
        total: response.data.total || response.data.data.length,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single staff member by ID
   * GET /api/staff/:id
   */
  getById: async (id: string): Promise<StaffMember> => {
    try {
      const response = await apiClient.get<StaffMemberResponse>(`/staff/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new staff member
   * POST /api/staff
   */
  create: async (data: Partial<StaffMember>): Promise<StaffMember> => {
    try {
      const response = await apiClient.post<StaffMemberResponse>('/staff', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update staff member (PUT)
   * PUT /api/staff/:id
   */
  update: async (id: string, data: Partial<StaffMember>): Promise<StaffMember> => {
    try {
      const response = await apiClient.put<StaffMemberResponse>(`/staff/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update staff member (PATCH)
   * PATCH /api/staff/:id
   */
  patch: async (id: string, data: Partial<StaffMember>): Promise<StaffMember> => {
    try {
      const response = await apiClient.patch<StaffMemberResponse>(`/staff/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete staff member
   * DELETE /api/staff/:id
   */
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/staff/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get team members
   * GET /api/staff/team
   */
  getTeam: async (): Promise<StaffMember[]> => {
    try {
      const response = await apiClient.get<TeamResponse>('/staff/team')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get staff statistics
   * GET /api/staff/stats
   */
  getStats: async (): Promise<StaffStats> => {
    try {
      const response = await apiClient.get<StaffStatsResponse>('/staff/stats')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default staffService

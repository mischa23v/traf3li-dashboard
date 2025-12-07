/**
 * Firm Service
 * Handles all firm-related API calls including RBAC and team management
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  UserPermissions,
  PermissionsResponse,
  TeamResponse,
  DepartedMembersResponse,
  RoleDefinition,
  FirmMember,
  ProcessDepartureRequest,
  ReinstateMemberResponse,
} from '@/types/rbac'

/**
 * Generic API Response
 */
interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

/**
 * Firm Service Object
 */
const firmService = {
  /**
   * Get current user's permissions
   * GET /api/firms/my/permissions
   */
  getMyPermissions: async (): Promise<UserPermissions> => {
    try {
      const response = await apiClient.get<PermissionsResponse>(
        '/firms/my/permissions'
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get available roles
   * GET /api/firms/roles
   */
  getAvailableRoles: async (): Promise<RoleDefinition[]> => {
    try {
      const response = await apiClient.get<ApiResponse<RoleDefinition[]>>(
        '/firms/roles'
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get team members
   * GET /api/firms/:id/team
   */
  getTeamMembers: async (
    firmId: string,
    options?: { showDeparted?: boolean }
  ): Promise<{ members: FirmMember[]; total: number }> => {
    try {
      const params = options?.showDeparted ? { showDeparted: true } : {}
      const response = await apiClient.get<TeamResponse>(
        `/firms/${firmId}/team`,
        { params }
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get departed members list (Admin only)
   * GET /api/firms/:id/departed
   */
  getDepartedMembers: async (
    firmId: string
  ): Promise<{ members: FirmMember[]; total: number }> => {
    try {
      const response = await apiClient.get<DepartedMembersResponse>(
        `/firms/${firmId}/departed`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Process member departure (Admin only)
   * POST /api/firms/:id/members/:memberId/depart
   */
  processDeparture: async (
    firmId: string,
    memberId: string,
    data: ProcessDepartureRequest
  ): Promise<FirmMember> => {
    try {
      const response = await apiClient.post<ApiResponse<FirmMember>>(
        `/firms/${firmId}/members/${memberId}/depart`,
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reinstate departed member (Admin only)
   * POST /api/firms/:id/members/:memberId/reinstate
   */
  reinstateMember: async (
    firmId: string,
    memberId: string
  ): Promise<FirmMember> => {
    try {
      const response = await apiClient.post<ReinstateMemberResponse>(
        `/firms/${firmId}/members/${memberId}/reinstate`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update member role (Admin/Owner only)
   * PATCH /api/firms/:id/members/:memberId/role
   */
  updateMemberRole: async (
    firmId: string,
    memberId: string,
    role: string
  ): Promise<FirmMember> => {
    try {
      const response = await apiClient.patch<ApiResponse<FirmMember>>(
        `/firms/${firmId}/members/${memberId}/role`,
        { role }
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Invite new team member
   * POST /api/firms/:id/invite
   */
  inviteTeamMember: async (
    firmId: string,
    data: {
      email: string
      firstName: string
      lastName: string
      role: string
    }
  ): Promise<FirmMember> => {
    try {
      const response = await apiClient.post<ApiResponse<FirmMember>>(
        `/firms/${firmId}/invite`,
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove team member (Admin/Owner only)
   * DELETE /api/firms/:id/members/:memberId
   */
  removeTeamMember: async (firmId: string, memberId: string): Promise<void> => {
    try {
      await apiClient.delete(`/firms/${firmId}/members/${memberId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get firm details
   * GET /api/firms/:id
   */
  getFirmDetails: async (firmId: string): Promise<any> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/firms/${firmId}`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get current user's firm
   * GET /api/firms/my
   */
  getMyFirm: async (): Promise<any> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/firms/my')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default firmService

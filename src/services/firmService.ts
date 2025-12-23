/**
 * Firm Service
 *
 * This service handles RBAC (Role-Based Access Control), team management, invitations,
 * and firm-level operations within the Traf3li system. It manages roles, permissions,
 * team members, and firm-specific settings.
 *
 * ## Dual-Service Architecture
 *
 * The Traf3li platform uses two services that interact with the same backend endpoints
 * but serve different domain concerns:
 *
 * ### firmService.ts (this file)
 * - **Domain**: RBAC, team management, and firm operations
 * - **Concerns**:
 *   - Role and permission management (getMyPermissions, getAvailableRoles)
 *   - Team member operations (getTeamMembers, inviteTeamMember, updateMemberRole)
 *   - Member lifecycle (processDeparture, reinstateMember, getDepartedMembers)
 *   - Invitations (createInvitation, resendInvitation, cancelInvitation)
 *   - Firm settings and configuration (updateFirm, updateBillingSettings)
 *   - Firm ownership (transferOwnership, leaveFirm)
 * - **Data Models**: FirmMember, Role, Permission, Invitation, Team
 *
 * ### companyService.ts
 * - **Domain**: Multi-company hierarchy and organizational structure
 * - **Concerns**:
 *   - Company tree management (parent-child relationships)
 *   - Multi-company access control
 *   - Company switching and context
 *   - Hierarchical permissions (canAccessChildren, canAccessParent)
 * - **Data Models**: Company, UserCompanyAccess, CompanyTreeNode
 *
 * ## Shared Backend
 *
 * Both services call `/api/firms/*` endpoints because:
 * - The backend uses "firm" as the primary entity name
 * - A "Company" in the UI is represented as a "Firm" in the database
 * - The services separate concerns at the application layer while sharing the same backend API
 *
 * ## Usage Guidelines
 *
 * - Use **firmService** for RBAC, team/member operations, and firm-specific features
 * - Use **companyService** for organizational hierarchy, multi-company features, and access control
 * - Both services can be used together when features require both permissions and hierarchy
 *
 * @example
 * // Get current user's permissions
 * const permissions = await firmService.getMyPermissions();
 *
 * // Invite a team member
 * await firmService.inviteTeamMember(firmId, {
 *   email: 'user@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   role: 'admin'
 * });
 *
 * // Get team members with departed members
 * const { members } = await firmService.getTeamMembers(firmId, { showDeparted: true });
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
 * Switch Firm Response
 */
interface SwitchFirmResponse {
  activeFirm: {
    id: string
    name: string
    nameArabic: string
    logo?: string
    role: string
  }
  token: string
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
   * Response format: { success, data: FirmMember[], meta: { total, activeCount, departedCount } }
   */
  getTeamMembers: async (
    firmId: string,
    options?: { showDeparted?: boolean }
  ): Promise<{ members: FirmMember[]; total: number; activeCount?: number; departedCount?: number }> => {
    try {
      const params = options?.showDeparted ? { showDeparted: true } : {}
      const response = await apiClient.get<TeamResponse>(
        `/firms/${firmId}/team`,
        { params }
      )
      // data is the array of members directly, meta contains the counts
      return {
        members: response.data.data || [],
        total: response.data.meta?.total || 0,
        activeCount: response.data.meta?.activeCount,
        departedCount: response.data.meta?.departedCount,
      }
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
   * Update member role/permissions (Admin/Owner only)
   * PUT /api/firms/:id/members/:memberId
   */
  updateMemberRole: async (
    firmId: string,
    memberId: string,
    role: string
  ): Promise<FirmMember> => {
    try {
      const response = await apiClient.put<ApiResponse<FirmMember>>(
        `/firms/${firmId}/members/${memberId}`,
        { role }
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update member (Admin/Owner only)
   * PUT /api/firms/:id/members/:memberId
   */
  updateMember: async (
    firmId: string,
    memberId: string,
    data: Partial<FirmMember>
  ): Promise<FirmMember> => {
    try {
      const response = await apiClient.put<ApiResponse<FirmMember>>(
        `/firms/${firmId}/members/${memberId}`,
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get members (legacy endpoint)
   * GET /api/firms/:id/members
   */
  getMembers: async (firmId: string): Promise<FirmMember[]> => {
    try {
      const response = await apiClient.get<ApiResponse<FirmMember[]>>(
        `/firms/${firmId}/members`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Invite new team member
   * POST /api/firms/:id/members/invite
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
        `/firms/${firmId}/members/invite`,
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

  /**
   * Create new firm
   * POST /api/firms
   */
  createFirm: async (data: {
    name: string
    description?: string
    website?: string
    phone?: string
    address?: string
  }): Promise<any> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/firms', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update firm settings
   * PUT /api/firms/:id
   */
  updateFirm: async (firmId: string, data: any): Promise<any> => {
    try {
      const response = await apiClient.put<ApiResponse<any>>(
        `/firms/${firmId}`,
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update firm settings (PATCH)
   * PATCH /api/firms/:id
   */
  patchFirm: async (firmId: string, data: any): Promise<any> => {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(
        `/firms/${firmId}`,
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update billing settings
   * PATCH /api/firms/:id/billing
   */
  updateBillingSettings: async (
    firmId: string,
    data: any
  ): Promise<any> => {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(
        `/firms/${firmId}/billing`,
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Leave firm (with solo conversion option)
   * POST /api/firms/:id/leave
   */
  leaveFirm: async (
    firmId: string,
    data?: { convertToSolo?: boolean }
  ): Promise<void> => {
    try {
      await apiClient.post(`/firms/${firmId}/leave`, data)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Transfer ownership (owner only)
   * POST /api/firms/:id/transfer-ownership
   */
  transferOwnership: async (
    firmId: string,
    data: { newOwnerId: string }
  ): Promise<void> => {
    try {
      await apiClient.post(`/firms/${firmId}/transfer-ownership`, data)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get firm statistics
   * GET /api/firms/:id/stats
   */
  getFirmStats: async (firmId: string): Promise<any> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/firms/${firmId}/stats`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create invitation
   * POST /api/firms/:firmId/invitations
   */
  createInvitation: async (
    firmId: string,
    data: {
      email: string
      role: string
      firstName?: string
      lastName?: string
    }
  ): Promise<any> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/firms/${firmId}/invitations`,
        data
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get firm invitations
   * GET /api/firms/:firmId/invitations
   */
  getInvitations: async (firmId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(
        `/firms/${firmId}/invitations`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel invitation
   * DELETE /api/firms/:firmId/invitations/:invitationId
   */
  cancelInvitation: async (
    firmId: string,
    invitationId: string
  ): Promise<void> => {
    try {
      await apiClient.delete(`/firms/${firmId}/invitations/${invitationId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resend invitation email
   * POST /api/firms/:firmId/invitations/:invitationId/resend
   */
  resendInvitation: async (
    firmId: string,
    invitationId: string
  ): Promise<void> => {
    try {
      await apiClient.post(
        `/firms/${firmId}/invitations/${invitationId}/resend`
      )
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all firms (admin only)
   * GET /api/firms
   */
  getFirms: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/firms')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add lawyer to firm
   * POST /api/firms/lawyer/add
   */
  addLawyer: async (lawyerId: string, firmId: string): Promise<void> => {
    try {
      await apiClient.post('/firms/lawyer/add', { lawyerId, firmId })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove lawyer from firm
   * POST /api/firms/lawyer/remove
   */
  removeLawyer: async (lawyerId: string, firmId: string): Promise<void> => {
    try {
      await apiClient.post('/firms/lawyer/remove', { lawyerId, firmId })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Switch active firm
   * POST /api/firms/switch
   * Switches the user's active firm and returns a new JWT token
   */
  switchFirm: async (firmId: string): Promise<SwitchFirmResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<SwitchFirmResponse>>(
        '/firms/switch',
        { firmId }
      )

      // Token is securely stored in httpOnly cookie by the backend
      // No client-side token storage needed to prevent XSS vulnerabilities

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default firmService

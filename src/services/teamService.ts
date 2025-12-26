/**
 * Team Service
 *
 * Handles team management operations for the RBAC system.
 * This service works with the /api/team endpoints for team member management.
 *
 * For firm-level operations (permissions, roles, invitations), use firmService.ts
 */

import apiClient, { handleApiError } from '@/lib/api'
import type { FirmRole, DepartureReason, PermissionLevel, ModuleKey, SpecialPermissionKey } from '@/types/rbac'

// ==================== TYPES ====================

/**
 * Team Member Status - aligned with backend RBAC
 */
export type TeamMemberStatus =
  | 'pending'
  | 'pending_approval'
  | 'active'
  | 'suspended'
  | 'departed'

/**
 * Team Member Role - aligned with backend 8 roles
 */
export type TeamMemberRole = FirmRole

/**
 * Module permission entry
 */
export interface ModulePermission {
  name: ModuleKey
  access: PermissionLevel
}

/**
 * Special permissions object
 */
export type SpecialPermissions = {
  [K in SpecialPermissionKey]?: boolean
}

/**
 * Team Member interface - aligned with backend FirmMember
 */
export interface TeamMember {
  _id: string
  id?: string // alias for _id

  // User info
  userId?: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string

  // Role and status
  role: TeamMemberRole
  previousRole?: TeamMemberRole
  status: TeamMemberStatus

  // Permissions
  permissions?: ModulePermission[]
  specialPermissions?: SpecialPermissions

  // Timestamps
  invitedAt?: string
  joinedAt?: string
  suspendedAt?: string
  departedAt?: string

  // Departure info
  departureReason?: DepartureReason
  departureNotes?: string

  // Metadata
  invitedBy?: string
  department?: string
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'intern'
  activityLog?: TeamActivity[]
  createdAt: string
  updatedAt: string
}

/**
 * Team Activity log entry
 */
export interface TeamActivity {
  _id: string
  action: string
  performedBy: string
  timestamp: string
  details?: Record<string, unknown>
}

/**
 * Team Statistics
 */
export interface TeamStats {
  total: number
  byStatus: Record<TeamMemberStatus, number>
  byRole: Record<TeamMemberRole, number>
  pendingInvitations: number
  recentJoins: number
  activeCount?: number
  departedCount?: number
}

/**
 * Team Option for dropdowns
 */
export interface TeamOption {
  value: string
  label: string
  labelAr?: string
  role?: TeamMemberRole
  status?: TeamMemberStatus
}

/**
 * Invite Team Member Request
 */
export interface InviteTeamMemberData {
  email: string
  firstName?: string
  lastName?: string
  role: TeamMemberRole
  phone?: string
  department?: string
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'intern'
  message?: string
}

/**
 * Update Team Member Request
 */
export interface UpdateTeamMemberData {
  firstName?: string
  lastName?: string
  role?: TeamMemberRole
  phone?: string
  department?: string
}

/**
 * Update Permissions Request
 */
export interface UpdatePermissionsData {
  modules?: ModulePermission[]
  specialPermissions?: SpecialPermissions
}

/**
 * Change Role Request
 */
export interface ChangeRoleData {
  role: TeamMemberRole
}

/**
 * Process Departure Request
 */
export interface ProcessDepartureData {
  reason: DepartureReason
  notes?: string
  effectiveDate?: string
}

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  meta?: {
    total?: number
    activeCount?: number
    departedCount?: number
  }
}

// ==================== SERVICE ====================

const teamService = {
  /**
   * Get all team members
   * GET /api/team
   */
  getTeam: async (options?: {
    showDeparted?: boolean
    role?: TeamMemberRole
    status?: TeamMemberStatus
    department?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ members: TeamMember[]; total: number; activeCount?: number; departedCount?: number }> => {
    try {
      const response = await apiClient.get<ApiResponse<TeamMember[]>>('/team', { params: options })
      return {
        members: response.data.data || [],
        total: response.data.meta?.total || response.data.data?.length || 0,
        activeCount: response.data.meta?.activeCount,
        departedCount: response.data.meta?.departedCount,
      }
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get team statistics
   * GET /api/team/stats
   */
  getTeamStats: async (): Promise<TeamStats> => {
    try {
      const response = await apiClient.get<ApiResponse<TeamStats>>('/team/stats')
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get team options for dropdowns
   * GET /api/team/options
   */
  getTeamOptions: async (): Promise<TeamOption[]> => {
    try {
      const response = await apiClient.get<ApiResponse<TeamOption[]>>('/team/options')
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single team member by ID
   * GET /api/team/:id
   */
  getTeamMember: async (id: string): Promise<TeamMember> => {
    try {
      const response = await apiClient.get<ApiResponse<TeamMember>>(`/team/${id}`)
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Invite new team member
   * POST /api/team/invite
   */
  inviteTeamMember: async (data: InviteTeamMemberData): Promise<TeamMember> => {
    try {
      const response = await apiClient.post<ApiResponse<TeamMember>>('/team/invite', data)
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resend invitation email
   * POST /api/team/:id/resend-invite
   */
  resendInvitation: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/team/${id}/resend-invite`)
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Revoke/cancel invitation
   * DELETE /api/team/:id/revoke-invite
   */
  revokeInvitation: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/team/${id}/revoke-invite`)
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update team member details
   * PATCH /api/team/:id
   */
  updateTeamMember: async (id: string, data: UpdateTeamMemberData): Promise<TeamMember> => {
    try {
      const response = await apiClient.patch<ApiResponse<TeamMember>>(`/team/${id}`, data)
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update member permissions
   * PATCH /api/team/:id/permissions
   */
  updatePermissions: async (id: string, data: UpdatePermissionsData): Promise<TeamMember> => {
    try {
      const response = await apiClient.patch<ApiResponse<TeamMember>>(`/team/${id}/permissions`, data)
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Change member role
   * PATCH /api/team/:id/role
   */
  changeRole: async (id: string, data: ChangeRoleData): Promise<TeamMember> => {
    try {
      const response = await apiClient.patch<ApiResponse<TeamMember>>(`/team/${id}/role`, data)
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Suspend member
   * POST /api/team/:id/suspend
   */
  suspendMember: async (id: string): Promise<TeamMember> => {
    try {
      const response = await apiClient.post<ApiResponse<TeamMember>>(`/team/${id}/suspend`)
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Activate/reactivate member
   * POST /api/team/:id/activate
   */
  activateMember: async (id: string): Promise<TeamMember> => {
    try {
      const response = await apiClient.post<ApiResponse<TeamMember>>(`/team/${id}/activate`)
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Process member departure
   * POST /api/team/:id/depart
   */
  processDeparture: async (id: string, data: ProcessDepartureData): Promise<TeamMember> => {
    try {
      const response = await apiClient.post<ApiResponse<TeamMember>>(`/team/${id}/depart`, data)
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reinstate departed member
   * POST /api/team/:id/reinstate
   */
  reinstateMember: async (id: string): Promise<TeamMember> => {
    try {
      const response = await apiClient.post<ApiResponse<TeamMember>>(`/team/${id}/reinstate`)
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove team member (hard delete)
   * DELETE /api/team/:id
   */
  removeTeamMember: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/team/${id}`)
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get member activity log
   * GET /api/team/:id/activity
   */
  getMemberActivity: async (id: string): Promise<TeamActivity[]> => {
    try {
      const response = await apiClient.get<ApiResponse<TeamActivity[]>>(`/team/${id}/activity`)
      return response.data.data
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get departed members list
   * GET /api/team/departed
   */
  getDepartedMembers: async (): Promise<{ members: TeamMember[]; total: number }> => {
    try {
      const response = await apiClient.get<ApiResponse<TeamMember[]>>('/team/departed')
      return {
        members: response.data.data || [],
        total: response.data.meta?.total || response.data.data?.length || 0,
      }
    } catch (error: unknown) {
      throw new Error(handleApiError(error))
    }
  },
}

export default teamService

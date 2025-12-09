import api from './api'

export type TeamMemberStatus = 'pending' | 'active' | 'suspended' | 'departed'
export type TeamMemberRole = 'admin' | 'manager' | 'member' | 'viewer'

export interface TeamMember {
  _id: string
  userId?: string
  email: string
  firstName?: string
  lastName?: string
  role: TeamMemberRole
  status: TeamMemberStatus
  permissions: string[]
  invitedAt?: string
  joinedAt?: string
  suspendedAt?: string
  departedAt?: string
  invitedBy?: string
  departureReason?: string
  departureNotes?: string
  activityLog: TeamActivity[]
  createdAt: string
  updatedAt: string
}

export interface TeamActivity {
  _id: string
  action: string
  performedBy: string
  timestamp: string
  details?: Record<string, any>
}

export interface TeamStats {
  total: number
  byStatus: Record<TeamMemberStatus, number>
  byRole: Record<TeamMemberRole, number>
  pendingInvitations: number
  recentJoins: number
}

export interface TeamOption {
  value: string
  label: string
  role?: TeamMemberRole
  status?: TeamMemberStatus
}

export interface InviteTeamMemberData {
  email: string
  firstName?: string
  lastName?: string
  role: TeamMemberRole
  permissions?: string[]
}

export interface UpdateTeamMemberData {
  firstName?: string
  lastName?: string
  role?: TeamMemberRole
  permissions?: string[]
}

export interface UpdatePermissionsData {
  permissions: string[]
}

export interface ChangeRoleData {
  role: TeamMemberRole
}

export interface ProcessDepartureData {
  reason: string
  notes?: string
  effectiveDate?: string
}

const teamService = {
  // Get all team members
  getTeam: async (): Promise<TeamMember[]> => {
    const response = await api.get('/team')
    return response.data
  },

  // Get team statistics
  getTeamStats: async (): Promise<TeamStats> => {
    const response = await api.get('/team/stats')
    return response.data
  },

  // Get team options (for dropdowns)
  getTeamOptions: async (): Promise<TeamOption[]> => {
    const response = await api.get('/team/options')
    return response.data
  },

  // Get single team member
  getTeamMember: async (id: string): Promise<TeamMember> => {
    const response = await api.get(`/team/${id}`)
    return response.data
  },

  // Invite team member
  inviteTeamMember: async (data: InviteTeamMemberData): Promise<TeamMember> => {
    const response = await api.post('/team/invite', data)
    return response.data
  },

  // Resend invitation
  resendInvitation: async (id: string): Promise<void> => {
    await api.post(`/team/${id}/resend-invite`)
  },

  // Revoke invitation
  revokeInvitation: async (id: string): Promise<void> => {
    await api.delete(`/team/${id}/revoke-invite`)
  },

  // Update team member
  updateTeamMember: async (id: string, data: UpdateTeamMemberData): Promise<TeamMember> => {
    const response = await api.patch(`/team/${id}`, data)
    return response.data
  },

  // Update permissions
  updatePermissions: async (id: string, data: UpdatePermissionsData): Promise<TeamMember> => {
    const response = await api.patch(`/team/${id}/permissions`, data)
    return response.data
  },

  // Change role
  changeRole: async (id: string, data: ChangeRoleData): Promise<TeamMember> => {
    const response = await api.patch(`/team/${id}/role`, data)
    return response.data
  },

  // Suspend member
  suspendMember: async (id: string): Promise<TeamMember> => {
    const response = await api.post(`/team/${id}/suspend`)
    return response.data
  },

  // Activate member
  activateMember: async (id: string): Promise<TeamMember> => {
    const response = await api.post(`/team/${id}/activate`)
    return response.data
  },

  // Process departure
  processDeparture: async (id: string, data: ProcessDepartureData): Promise<TeamMember> => {
    const response = await api.post(`/team/${id}/depart`, data)
    return response.data
  },

  // Remove team member (hard delete)
  removeTeamMember: async (id: string): Promise<void> => {
    await api.delete(`/team/${id}`)
  },

  // Get member activity log
  getMemberActivity: async (id: string): Promise<TeamActivity[]> => {
    const response = await api.get(`/team/${id}/activity`)
    return response.data
  },
}

export default teamService

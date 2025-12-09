/**
 * Invitation Service
 * Handles firm invitation endpoints for lawyers joining law firms
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== INTERFACES ====================
 */

/**
 * Invitation data structure
 */
export interface Invitation {
  _id: string
  code: string
  firmId: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expiresAt: string
  createdAt: string
  updatedAt: string
}

/**
 * Invitation validation response
 */
export interface InvitationValidation {
  valid: boolean
  invitation?: Invitation
  firm?: {
    _id: string
    name: string
    description?: string
  }
  message?: string
}

/**
 * Generic API Response
 */
interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

/**
 * ==================== INVITATION SERVICE ====================
 */

const invitationService = {
  /**
   * Validate invitation code (public endpoint - for checking before registration)
   * GET /api/invitations/:code
   */
  validateInvitationCode: async (code: string): Promise<InvitationValidation> => {
    try {
      const response = await apiClient.get<ApiResponse<InvitationValidation>>(
        `/invitations/${code}`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Accept invitation (join firm) - requires authentication
   * POST /api/invitations/:code/accept
   */
  acceptInvitation: async (code: string): Promise<any> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/invitations/${code}/accept`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default invitationService

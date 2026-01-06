/**
 * Invitation Service
 *
 * Handles firm invitation endpoints for lawyers joining law firms.
 * This service manages both admin-side invitation management and
 * public invitation acceptance flows.
 *
 * ## Features
 * - Create invitations (Admin)
 * - List pending/cancelled invitations (Admin)
 * - Cancel invitations (Admin)
 * - Resend invitation emails (Admin)
 * - Validate invitation codes (Public)
 * - Accept invitations (Authenticated)
 *
 * ## Authentication
 * - Admin endpoints require Admin/Owner role
 * - Validate: Public endpoint
 * - Accept: Requires authentication
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  FirmRole,
  Invitation as RBACInvitation,
  InvitationStatus,
  InvitationValidation as RBACInvitationValidation,
} from '@/types/rbac'

/**
 * ==================== INTERFACES ====================
 */

/**
 * Invitation data structure (legacy - for backward compatibility)
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
 * Invitation validation response (legacy - for backward compatibility)
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
 * Create invitation request payload
 */
export interface CreateInvitationRequest {
  email: string
  role: FirmRole
  firstName?: string
  lastName?: string
  message?: string
}

/**
 * Create invitation response
 */
export interface CreateInvitationResponse {
  success: boolean
  message: string
  data: {
    invitation: RBACInvitation
    emailSent: boolean
  }
}

/**
 * List invitations response
 */
export interface ListInvitationsResponse {
  success: boolean
  data: RBACInvitation[]
}

/**
 * Cancel invitation response
 */
export interface CancelInvitationResponse {
  success: boolean
  message: string
}

/**
 * Resend invitation response
 */
export interface ResendInvitationResponse {
  success: boolean
  message: string
  data: {
    emailSent: boolean
    newExpiresAt: string
  }
}

/**
 * Accept invitation response
 */
export interface AcceptInvitationResponse {
  success: boolean
  message: string
  data: {
    firmId: string
    firmName: string
    role: FirmRole
  }
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
  // =================================================================
  // PUBLIC ENDPOINTS
  // =================================================================

  /**
   * Validate invitation code (public endpoint - for checking before registration)
   * GET /api/invitations/:code
   *
   * @param code - The invitation code to validate
   * @returns Validation result with invitation details if valid
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
   * Validate invitation code using RBAC types
   * GET /api/invitations/:code/validate
   *
   * @param code - The invitation code to validate
   * @returns Validation result matching gold standard types
   */
  validateCode: async (code: string): Promise<RBACInvitationValidation> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: RBACInvitationValidation }>(
        `/invitations/${code}/validate`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // =================================================================
  // AUTHENTICATED USER ENDPOINTS
  // =================================================================

  /**
   * Accept invitation (join firm) - requires authentication
   * POST /api/invitations/:code/accept
   *
   * @param code - The invitation code to accept
   * @returns Acceptance result with firm details
   */
  acceptInvitation: async (code: string): Promise<AcceptInvitationResponse['data']> => {
    try {
      const response = await apiClient.post<AcceptInvitationResponse>(
        `/invitations/${code}/accept`
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // =================================================================
  // ADMIN ENDPOINTS (Firm-based)
  // =================================================================

  /**
   * Create a new invitation for a firm
   * POST /api/firms/:firmId/invitations
   *
   * @param firmId - The firm ID to create invitation for
   * @param payload - Invitation details (email, role, optional name/message)
   * @returns Created invitation with email status
   *
   * @example
   * await invitationService.createInvitation(firmId, {
   *   email: 'lawyer@example.com',
   *   role: 'lawyer',
   *   firstName: 'Ahmed',
   *   lastName: 'Al-Rashid',
   *   message: 'Welcome to our firm!'
   * });
   */
  createInvitation: async (
    firmId: string,
    payload: CreateInvitationRequest
  ): Promise<CreateInvitationResponse> => {
    try {
      const response = await apiClient.post<CreateInvitationResponse>(
        `/firms/${firmId}/invitations`,
        payload
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all invitations for a firm
   * GET /api/firms/:firmId/invitations
   *
   * @param firmId - The firm ID to get invitations for
   * @param options - Optional filters (status: pending, accepted, expired, cancelled)
   * @returns List of invitations
   *
   * @example
   * // Get all invitations
   * await invitationService.getInvitations(firmId);
   *
   * @example
   * // Get only pending invitations
   * await invitationService.getInvitations(firmId, { status: 'pending' });
   */
  getInvitations: async (
    firmId: string,
    options?: { status?: InvitationStatus }
  ): Promise<RBACInvitation[]> => {
    try {
      const params = options?.status ? { status: options.status } : {}
      const response = await apiClient.get<ListInvitationsResponse>(
        `/firms/${firmId}/invitations`,
        { params }
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel an invitation
   * DELETE /api/firms/:firmId/invitations/:invitationId
   *
   * @param firmId - The firm ID
   * @param invitationId - The invitation ID to cancel
   * @returns Success response
   */
  cancelInvitation: async (
    firmId: string,
    invitationId: string
  ): Promise<CancelInvitationResponse> => {
    try {
      const response = await apiClient.delete<CancelInvitationResponse>(
        `/firms/${firmId}/invitations/${invitationId}`
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resend an invitation email
   * POST /api/firms/:firmId/invitations/:invitationId/resend
   *
   * @param firmId - The firm ID
   * @param invitationId - The invitation ID to resend
   * @returns Resend result with new expiration date
   */
  resendInvitation: async (
    firmId: string,
    invitationId: string
  ): Promise<ResendInvitationResponse> => {
    try {
      const response = await apiClient.post<ResendInvitationResponse>(
        `/firms/${firmId}/invitations/${invitationId}/resend`
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default invitationService

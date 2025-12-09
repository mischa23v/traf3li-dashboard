/**
 * Peer Review Service
 * Handles peer review system API calls for lawyer evaluations
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Peer Review Interface
 */
export interface PeerReview {
  _id: string
  reviewerId: {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
    avatar?: string
    role?: string
  } | string
  lawyerId: {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
    avatar?: string
    role?: string
  } | string
  rating: number // 1-5
  expertise: number // 1-5
  professionalism: number // 1-5
  communication: number // 1-5
  reliability: number // 1-5
  comment?: string
  isVerified: boolean
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Create Peer Review Data
 */
export interface CreatePeerReviewData {
  lawyerId: string
  rating: number
  expertise: number
  professionalism: number
  communication: number
  reliability: number
  comment?: string
  isAnonymous?: boolean
}

/**
 * Peer Review Statistics
 */
export interface PeerReviewStats {
  averageRating: number
  totalReviews: number
  verifiedReviews: number
  averageExpertise: number
  averageProfessionalism: number
  averageCommunication: number
  averageReliability: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

// ==================== API RESPONSES ====================

interface PeerReviewsResponse {
  error: boolean
  reviews: PeerReview[]
  total?: number
  stats?: PeerReviewStats
}

interface PeerReviewResponse {
  error: boolean
  review: PeerReview
}

interface MessageResponse {
  error: boolean
  message: string
}

// ==================== SERVICE ====================

const peerReviewService = {
  /**
   * Get peer reviews for a specific lawyer
   * GET /api/peerReview/:lawyerId
   */
  getByLawyerId: async (lawyerId: string): Promise<{ reviews: PeerReview[]; stats?: PeerReviewStats }> => {
    try {
      const response = await apiClient.get<PeerReviewsResponse>(`/peerReview/${lawyerId}`)
      return {
        reviews: response.data.reviews || [],
        stats: response.data.stats,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new peer review
   * POST /api/peerReview
   * Requires authentication
   */
  create: async (data: CreatePeerReviewData): Promise<PeerReview> => {
    try {
      const response = await apiClient.post<PeerReviewResponse>('/peerReview', data)
      return response.data.review
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify peer review (admin only)
   * PATCH /api/peerReview/verify/:_id
   * Requires authentication (admin)
   */
  verify: async (id: string, isVerified: boolean = true): Promise<PeerReview> => {
    try {
      const response = await apiClient.patch<PeerReviewResponse>(`/peerReview/verify/${id}`, { isVerified })
      return response.data.review
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default peerReviewService

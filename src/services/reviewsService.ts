/**
 * Reviews Service
 * Handles all review-related API calls for client feedback on lawyer services
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Review Rating Categories
 */
export interface ReviewRating {
  overall: number // 1-5
  communication?: number // 1-5
  quality?: number // 1-5
  professionalism?: number // 1-5
  value?: number // 1-5
  timeliness?: number // 1-5
}

/**
 * Review Response (from lawyer)
 */
export interface ReviewResponse {
  text: string
  respondedAt: string
}

/**
 * Review Interface
 */
export interface Review {
  _id: string

  // Related IDs
  gigId: string
  orderId?: string
  clientId: string
  lawyerId: string

  // Review Content
  rating: number // Overall rating 1-5
  ratings?: ReviewRating
  comment: string

  // Response
  response?: ReviewResponse

  // Verification
  verified?: boolean // Order-based review = verified

  // Moderation
  flagged?: boolean
  flagReason?: string
  moderatedAt?: string

  // Helpful Votes
  helpfulCount?: number
  notHelpfulCount?: number

  // Timestamps
  createdAt: string
  updatedAt: string

  // Populated fields (when populated)
  client?: {
    _id: string
    username: string
    firstName?: string
    lastName?: string
    image?: string
  }
  lawyer?: {
    _id: string
    username: string
    firstName?: string
    lastName?: string
    image?: string
  }
  gig?: {
    _id: string
    title: string
    titleEn?: string
  }
}

/**
 * Create Review Data
 */
export interface CreateReviewData {
  gigId: string
  orderId?: string
  rating: number
  ratings?: Omit<ReviewRating, 'overall'>
  comment: string
}

/**
 * Update Review Data
 */
export interface UpdateReviewData {
  rating?: number
  ratings?: Omit<ReviewRating, 'overall'>
  comment?: string
}

/**
 * Add Review Response Data
 */
export interface AddReviewResponseData {
  text: string
}

/**
 * Get Reviews Query Parameters
 */
export interface GetReviewsParams {
  gigId?: string
  lawyerId?: string
  clientId?: string
  orderId?: string
  minRating?: number
  maxRating?: number
  verified?: boolean
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * Review Statistics
 */
export interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  verifiedReviews: number
}

/**
 * API Response for Reviews List
 */
interface GetReviewsResponse {
  error: boolean
  message?: string
  reviews: Review[]
  stats?: ReviewStats
  pagination?: {
    total: number
    page: number
    pages: number
    limit: number
  }
}

/**
 * API Response for Single Review
 */
interface GetReviewResponse {
  error: boolean
  message?: string
  review: Review
}

/**
 * API Response for Review Actions
 */
interface ReviewActionResponse {
  error: boolean
  message: string
  review?: Review
}

// ==================== SERVICE ====================

const reviewsService = {
  /**
   * Create a new review
   * POST /api/review
   */
  createReview: async (data: CreateReviewData): Promise<Review> => {
    try {
      const response = await apiClient.post<ReviewActionResponse>('/review', data)

      if (response.data.error || !response.data.review) {
        throw new Error(response.data.message || 'Failed to create review')
      }

      return response.data.review
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get reviews for a specific gig
   * GET /api/review/:gigID
   */
  getReviewsByGig: async (gigId: string, params?: Omit<GetReviewsParams, 'gigId'>): Promise<GetReviewsResponse> => {
    try {
      const response = await apiClient.get<GetReviewsResponse>(`/review/${gigId}`, { params })

      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to fetch reviews')
      }

      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete a review
   * DELETE /api/review/:_id
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    try {
      const response = await apiClient.delete<ReviewActionResponse>(`/review/${reviewId}`)

      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to delete review')
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get reviews by lawyer ID
   * Helper method to get all reviews for a lawyer's services
   */
  getReviewsByLawyer: async (lawyerId: string, params?: Omit<GetReviewsParams, 'lawyerId'>): Promise<Review[]> => {
    try {
      // Note: This might need to be implemented on backend if not exists
      // For now, assuming it's handled via query params
      const response = await apiClient.get<GetReviewsResponse>('/review', {
        params: { lawyerId, ...params }
      })

      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to fetch lawyer reviews')
      }

      return response.data.reviews
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get reviews by client ID
   * Helper method to get all reviews written by a client
   */
  getReviewsByClient: async (clientId: string, params?: Omit<GetReviewsParams, 'clientId'>): Promise<Review[]> => {
    try {
      const response = await apiClient.get<GetReviewsResponse>('/review', {
        params: { clientId, ...params }
      })

      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to fetch client reviews')
      }

      return response.data.reviews
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get review statistics for a gig
   */
  getGigReviewStats: async (gigId: string): Promise<ReviewStats> => {
    try {
      const response = await reviewsService.getReviewsByGig(gigId)

      if (response.stats) {
        return response.stats
      }

      // Fallback: Calculate stats from reviews if not provided by backend
      const reviews = response.reviews
      const totalReviews = reviews.length
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      reviews.forEach(r => {
        const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5
        ratingDistribution[rating]++
      })

      const verifiedReviews = reviews.filter(r => r.verified).length

      return {
        totalReviews,
        averageRating,
        ratingDistribution,
        verifiedReviews
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get review statistics for a lawyer
   */
  getLawyerReviewStats: async (lawyerId: string): Promise<ReviewStats> => {
    try {
      const reviews = await reviewsService.getReviewsByLawyer(lawyerId)

      const totalReviews = reviews.length
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      reviews.forEach(r => {
        const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5
        ratingDistribution[rating]++
      })

      const verifiedReviews = reviews.filter(r => r.verified).length

      return {
        totalReviews,
        averageRating,
        ratingDistribution,
        verifiedReviews
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if user can review an order
   */
  canReviewOrder: async (orderId: string): Promise<boolean> => {
    try {
      // This would need backend support to check if:
      // 1. Order is completed
      // 2. User hasn't already reviewed
      // 3. Review window hasn't expired
      const response = await apiClient.get<{ canReview: boolean }>(`/review/can-review/${orderId}`)
      return response.data.canReview
    } catch (error: any) {
      // If endpoint doesn't exist, default to true and let backend validate
      return true
    }
  },
}

export default reviewsService

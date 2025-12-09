/**
 * Gigs Service
 * Handles all gig/service offering-related API calls for lawyer marketplace
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Gig Category
 */
export type GigCategory =
  | 'legal_consultation'
  | 'contract_drafting'
  | 'legal_research'
  | 'document_review'
  | 'court_representation'
  | 'mediation'
  | 'notary_services'
  | 'other'

/**
 * Gig Delivery Time
 */
export type GigDeliveryTime = '1_day' | '3_days' | '7_days' | '14_days' | '30_days' | 'custom'

/**
 * Gig Status
 */
export type GigStatus = 'draft' | 'active' | 'paused' | 'deleted'

/**
 * Gig Pricing Tier
 */
export interface GigPricingTier {
  _id?: string
  name: string
  description: string
  price: number
  deliveryTime: number // in days
  revisions: number
  features: string[]
}

/**
 * Gig FAQ Item
 */
export interface GigFAQ {
  _id?: string
  question: string
  answer: string
}

/**
 * Gig Requirements
 */
export interface GigRequirements {
  description?: string
  items?: string[]
}

/**
 * Gig Interface
 */
export interface Gig {
  _id: string
  lawyerId: string
  title: string
  titleEn?: string
  description: string
  descriptionEn?: string
  category: GigCategory
  subcategory?: string
  tags?: string[]

  // Pricing
  price: number
  currency?: string
  pricingTiers?: GigPricingTier[]

  // Delivery & Service Details
  deliveryTime: GigDeliveryTime
  deliveryDays?: number
  revisions?: number

  // Media
  images?: string[]
  video?: string

  // Additional Information
  requirements?: GigRequirements
  faq?: GigFAQ[]

  // Status & Visibility
  status: GigStatus
  featured?: boolean

  // Stats
  totalOrders?: number
  rating?: number
  totalReviews?: number

  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Create Gig Data
 */
export interface CreateGigData {
  title: string
  titleEn?: string
  description: string
  descriptionEn?: string
  category: GigCategory
  subcategory?: string
  tags?: string[]
  price: number
  currency?: string
  pricingTiers?: Omit<GigPricingTier, '_id'>[]
  deliveryTime: GigDeliveryTime
  deliveryDays?: number
  revisions?: number
  images?: string[]
  video?: string
  requirements?: GigRequirements
  faq?: Omit<GigFAQ, '_id'>[]
  status?: GigStatus
}

/**
 * Update Gig Data
 */
export type UpdateGigData = Partial<CreateGigData>

/**
 * Get Gigs Query Parameters
 */
export interface GetGigsParams {
  lawyerId?: string
  category?: GigCategory
  minPrice?: number
  maxPrice?: number
  search?: string
  status?: GigStatus
  featured?: boolean
  sortBy?: 'createdAt' | 'price' | 'rating' | 'totalOrders'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * API Response for Gigs List
 */
interface GetGigsResponse {
  error: boolean
  message?: string
  gigs: Gig[]
  pagination?: {
    total: number
    page: number
    pages: number
    limit: number
  }
}

/**
 * API Response for Single Gig
 */
interface GetGigResponse {
  error: boolean
  message?: string
  gig: Gig
}

/**
 * API Response for Create/Update/Delete
 */
interface GigActionResponse {
  error: boolean
  message: string
  gig?: Gig
}

// ==================== SERVICE ====================

const gigsService = {
  /**
   * Create a new gig
   * POST /api/gig
   */
  createGig: async (data: CreateGigData): Promise<Gig> => {
    try {
      const response = await apiClient.post<GigActionResponse>('/gig', data)

      if (response.data.error || !response.data.gig) {
        throw new Error(response.data.message || 'Failed to create gig')
      }

      return response.data.gig
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete a gig
   * DELETE /api/gig/:_id
   */
  deleteGig: async (gigId: string): Promise<void> => {
    try {
      const response = await apiClient.delete<GigActionResponse>(`/gig/${gigId}`)

      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to delete gig')
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get a single gig by ID
   * GET /api/gig/single/:_id
   */
  getGig: async (gigId: string): Promise<Gig> => {
    try {
      const response = await apiClient.get<GetGigResponse>(`/gig/single/${gigId}`)

      if (response.data.error || !response.data.gig) {
        throw new Error(response.data.message || 'Failed to fetch gig')
      }

      return response.data.gig
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all gigs with optional filters
   * GET /api/gig
   */
  getGigs: async (params?: GetGigsParams): Promise<GetGigsResponse> => {
    try {
      const response = await apiClient.get<GetGigsResponse>('/gig', { params })

      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to fetch gigs')
      }

      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get gigs by lawyer ID
   */
  getLawyerGigs: async (lawyerId: string): Promise<Gig[]> => {
    try {
      const response = await gigsService.getGigs({ lawyerId })
      return response.gigs
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get featured gigs
   */
  getFeaturedGigs: async (limit?: number): Promise<Gig[]> => {
    try {
      const response = await gigsService.getGigs({ featured: true, limit })
      return response.gigs
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Search gigs by query
   */
  searchGigs: async (search: string, params?: Omit<GetGigsParams, 'search'>): Promise<Gig[]> => {
    try {
      const response = await gigsService.getGigs({ search, ...params })
      return response.gigs
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default gigsService

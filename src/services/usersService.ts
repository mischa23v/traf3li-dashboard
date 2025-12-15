/**
 * Users Service
 * Handles all user-related API calls matching backend user.route.js
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Lawyer Profile Interface
 */
export interface LawyerProfile {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  country: string
  image?: string
  description?: string
  lawyerProfile?: {
    specialization: string[]
    licenseNumber?: string
    barAssociation?: string
    yearsExperience: number
    verified: boolean
    rating: number
    totalReviews: number
    casesWon: number
    casesTotal: number
    languages: string[]
    firmID?: string
  }
  createdAt: string
  updatedAt: string
}

/**
 * Get Lawyers Params
 */
export interface GetLawyersParams {
  page?: number
  limit?: number
  specialization?: string
  country?: string
  minRating?: number
  verified?: boolean
  search?: string
}

/**
 * Team Member Interface
 */
export interface TeamMember {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  image?: string
  firmRole?: 'owner' | 'admin' | 'partner' | 'lawyer' | 'paralegal' | 'secretary' | 'accountant' | 'departed'
  firmStatus?: 'active' | 'departed' | 'suspended' | 'pending'
  createdAt: string
}

/**
 * Update User Profile Data
 */
export interface UpdateUserProfileData {
  firstName?: string
  lastName?: string
  firstNameAr?: string
  lastNameAr?: string
  phone?: string
  country?: string
  description?: string
  image?: string
  lawyerProfile?: {
    specialization?: string[]
    licenseNumber?: string
    barAssociation?: string
    yearsExperience?: number
    languages?: string[]
  }
}

/**
 * Push Subscription Data
 */
export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Push Subscription Status
 */
export interface PushSubscriptionStatus {
  subscribed: boolean
  preferences?: NotificationPreferences
}

/**
 * Notification Preferences
 */
export interface NotificationPreferences {
  caseUpdates?: boolean
  messages?: boolean
  appointments?: boolean
  payments?: boolean
  marketing?: boolean
}

/**
 * Convert to Firm Data
 */
export interface ConvertToFirmData {
  firmName: string
  firmNameEn?: string
  description?: string
  licenseNumber?: string
}

/**
 * Get Users Params (for admin/internal user management)
 */
export interface GetUsersParams {
  page?: number
  pageSize?: number
  status?: string
  role?: string
  username?: string
  search?: string
}

/**
 * User (admin view)
 */
export interface User {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  image?: string
  role?: string
  status?: string
  firmRole?: string
  firmStatus?: string
  createdAt: string
  updatedAt: string
}

/**
 * Users Response (paginated)
 */
export interface UsersResponse {
  users: User[]
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

const usersService = {
  /**
   * Get users with pagination and filters (admin/internal)
   * Uses the team endpoint for firm users
   */
  getUsers: async (params?: GetUsersParams): Promise<UsersResponse> => {
    try {
      const response = await apiClient.get('/users/team', { params })
      const data = response.data.data || response.data
      // Normalize to expected format
      if (Array.isArray(data)) {
        return {
          users: data,
          pagination: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
            total: data.length,
            totalPages: 1,
          },
        }
      }
      return data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all lawyers with optional filters (public)
   */
  getLawyers: async (params?: GetLawyersParams): Promise<LawyerProfile[]> => {
    try {
      const response = await apiClient.get('/users/lawyers', { params })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get team members (protected - firm members only)
   */
  getTeamMembers: async (): Promise<TeamMember[]> => {
    try {
      const response = await apiClient.get('/users/team')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get user profile by ID (public)
   */
  getUserProfile: async (userId: string): Promise<LawyerProfile> => {
    try {
      const response = await apiClient.get(`/users/${userId}`)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get comprehensive lawyer profile by username (public)
   */
  getLawyerProfile: async (username: string): Promise<LawyerProfile> => {
    try {
      const response = await apiClient.get(`/users/lawyer/${username}`)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update user profile (protected - own profile only)
   */
  updateUserProfile: async (userId: string, data: UpdateUserProfileData): Promise<LawyerProfile> => {
    try {
      const response = await apiClient.patch(`/users/${userId}`, data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete user account (protected - own account only)
   */
  deleteUser: async (userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${userId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get VAPID public key for push notifications (public)
   */
  getVapidPublicKey: async (): Promise<string> => {
    try {
      const response = await apiClient.get('/users/vapid-public-key')
      return response.data.publicKey || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get push subscription status (protected)
   */
  getPushSubscriptionStatus: async (): Promise<PushSubscriptionStatus> => {
    try {
      const response = await apiClient.get('/users/push-subscription')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Save push subscription (protected)
   */
  savePushSubscription: async (subscription: PushSubscriptionData): Promise<void> => {
    try {
      await apiClient.post('/users/push-subscription', subscription)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete push subscription (protected)
   */
  deletePushSubscription: async (): Promise<void> => {
    try {
      await apiClient.delete('/users/push-subscription')
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get notification preferences (protected)
   */
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    try {
      const response = await apiClient.get('/users/notification-preferences')
      return response.data.data || response.data.preferences
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update notification preferences (protected)
   */
  updateNotificationPreferences: async (preferences: NotificationPreferences): Promise<NotificationPreferences> => {
    try {
      const response = await apiClient.put('/users/notification-preferences', preferences)
      return response.data.data || response.data.preferences
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Convert solo lawyer to firm owner (protected)
   */
  convertToFirm: async (data: ConvertToFirmData): Promise<any> => {
    try {
      const response = await apiClient.post('/users/convert-to-firm', data)
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default usersService

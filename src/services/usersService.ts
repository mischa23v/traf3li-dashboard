/**
 * Users Service
 * Handles all user-related API calls matching backend user.route.js
 *
 * BACKEND ENDPOINT STATUS:
 * ✅ GET  /api/users/lawyers - Get all lawyers with filters
 * ✅ GET  /api/users/:_id - Get user profile by ID
 * ✅ GET  /api/users/lawyer/:username - Get comprehensive lawyer profile
 * ✅ PATCH /api/users/:_id - Update user profile (protected)
 * ✅ DELETE /api/users/:_id - Delete user account (protected)
 *
 * ⚠️ NOT IMPLEMENTED IN BACKEND YET:
 * ❌ GET  /api/users/team - Get team members (returns 404)
 * ❌ GET  /api/users/vapid-public-key - Push notification VAPID key (returns 404)
 * ❌ GET  /api/users/push-subscription - Get push subscription status (returns 404)
 * ❌ POST /api/users/push-subscription - Save push subscription (returns 404)
 * ❌ DELETE /api/users/push-subscription - Delete push subscription (returns 404)
 * ❌ GET  /api/users/notification-preferences - Get notification preferences (returns 404)
 * ❌ PUT  /api/users/notification-preferences - Update notification preferences (returns 404)
 * ❌ POST /api/users/convert-to-firm - Convert solo lawyer to firm owner (returns 404)
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Bilingual error messages
 */
const ERROR_MESSAGES = {
  ENDPOINT_NOT_IMPLEMENTED: 'This feature is not yet implemented | هذه الميزة غير متوفرة حالياً',
  TEAM_NOT_AVAILABLE: 'Team features are not yet available | ميزات الفريق غير متوفرة حالياً',
  PUSH_NOT_AVAILABLE: 'Push notifications are not yet available | الإشعارات الفورية غير متوفرة حالياً',
  CONVERT_FIRM_NOT_AVAILABLE: 'Convert to firm feature is not yet available | ميزة التحويل إلى مكتب غير متوفرة حالياً',
  NETWORK_ERROR: 'Network error. Please check your connection | خطأ في الشبكة. يرجى التحقق من الاتصال',
  UNAUTHORIZED: 'Unauthorized access. Please login again | غير مصرح. يرجى تسجيل الدخول مرة أخرى',
  FORBIDDEN: 'Access forbidden. You do not have permission | الوصول محظور. ليس لديك صلاحية',
  NOT_FOUND: 'Resource not found | المورد غير موجود',
  SERVER_ERROR: 'Server error. Please try again later | خطأ في الخادم. يرجى المحاولة لاحقاً',
  UNKNOWN_ERROR: 'An unexpected error occurred | حدث خطأ غير متوقع',
}

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
  firmStatus?: 'active' | 'departed' | 'suspended' | 'pending' | 'pending_approval'
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
 * Enhanced error handler with bilingual messages
 */
const handleUserServiceError = (error: any, fallbackMessage: string): never => {
  // Handle network errors
  if (!error.status || error.status === 0) {
    throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
  }

  // Handle 404 - Endpoint not implemented
  if (error.status === 404) {
    throw new Error(fallbackMessage)
  }

  // Handle 401 - Unauthorized
  if (error.status === 401) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  // Handle 403 - Forbidden
  if (error.status === 403) {
    throw new Error(ERROR_MESSAGES.FORBIDDEN)
  }

  // Handle 500+ - Server errors
  if (error.status >= 500) {
    throw new Error(ERROR_MESSAGES.SERVER_ERROR)
  }

  // Use the error message from API if available (already bilingual from api.ts)
  if (error.message) {
    throw new Error(error.message)
  }

  // Fallback to generic error message
  throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR)
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
   * ⚠️ WARNING: /users/team endpoint not implemented in backend yet
   * Returns empty array as graceful fallback
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
      // Graceful fallback for 404 - return empty array instead of throwing
      if (error.status === 404) {
        console.warn('[usersService] Team endpoint not implemented yet, returning empty array')
        return {
          users: [],
          pagination: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 10,
            total: 0,
            totalPages: 0,
          },
        }
      }
      handleUserServiceError(error, ERROR_MESSAGES.TEAM_NOT_AVAILABLE)
    }
  },

  /**
   * Get all lawyers with optional filters (public)
   * ✅ IMPLEMENTED: Backend endpoint exists
   */
  getLawyers: async (params?: GetLawyersParams): Promise<LawyerProfile[]> => {
    try {
      const response = await apiClient.get('/users/lawyers', { params })
      return response.data.data || response.data
    } catch (error: any) {
      handleUserServiceError(error, ERROR_MESSAGES.NOT_FOUND)
    }
  },

  /**
   * Get team members (protected - firm members only)
   * ⚠️ WARNING: /users/team endpoint not implemented in backend yet
   * Returns empty array as graceful fallback
   */
  getTeamMembers: async (): Promise<TeamMember[]> => {
    try {
      const response = await apiClient.get('/users/team')
      return response.data.data || response.data
    } catch (error: any) {
      // Graceful fallback for 404 - return empty array instead of throwing
      if (error.status === 404) {
        console.warn('[usersService] Team members endpoint not implemented yet, returning empty array')
        return []
      }
      handleUserServiceError(error, ERROR_MESSAGES.TEAM_NOT_AVAILABLE)
    }
  },

  /**
   * Get user profile by ID (public)
   * ✅ IMPLEMENTED: Backend endpoint exists
   */
  getUserProfile: async (userId: string): Promise<LawyerProfile> => {
    try {
      const response = await apiClient.get(`/users/${userId}`)
      return response.data.data || response.data
    } catch (error: any) {
      handleUserServiceError(error, ERROR_MESSAGES.NOT_FOUND)
    }
  },

  /**
   * Get comprehensive lawyer profile by username (public)
   * ✅ IMPLEMENTED: Backend endpoint exists
   */
  getLawyerProfile: async (username: string): Promise<LawyerProfile> => {
    try {
      const response = await apiClient.get(`/users/lawyer/${username}`)
      return response.data.data || response.data
    } catch (error: any) {
      handleUserServiceError(error, ERROR_MESSAGES.NOT_FOUND)
    }
  },

  /**
   * Update user profile (protected - own profile only)
   * ✅ IMPLEMENTED: Backend endpoint exists
   */
  updateUserProfile: async (userId: string, data: UpdateUserProfileData): Promise<LawyerProfile> => {
    try {
      const response = await apiClient.patch(`/users/${userId}`, data)
      return response.data.data || response.data
    } catch (error: any) {
      handleUserServiceError(error, ERROR_MESSAGES.UNKNOWN_ERROR)
    }
  },

  /**
   * Delete user account (protected - own account only)
   * ✅ IMPLEMENTED: Backend endpoint exists
   */
  deleteUser: async (userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/users/${userId}`)
    } catch (error: any) {
      handleUserServiceError(error, ERROR_MESSAGES.UNKNOWN_ERROR)
    }
  },

  /**
   * Get VAPID public key for push notifications (public)
   * ⚠️ WARNING: Endpoint not implemented in backend yet
   * Returns empty string as graceful fallback
   */
  getVapidPublicKey: async (): Promise<string> => {
    try {
      const response = await apiClient.get('/users/vapid-public-key')
      return response.data.publicKey || response.data.data
    } catch (error: any) {
      // Graceful fallback for 404 - return empty string instead of throwing
      if (error.status === 404) {
        console.warn('[usersService] VAPID public key endpoint not implemented yet')
        return ''
      }
      handleUserServiceError(error, ERROR_MESSAGES.PUSH_NOT_AVAILABLE)
    }
  },

  /**
   * Get push subscription status (protected)
   * ⚠️ WARNING: Endpoint not implemented in backend yet
   * Returns default status as graceful fallback
   */
  getPushSubscriptionStatus: async (): Promise<PushSubscriptionStatus> => {
    try {
      const response = await apiClient.get('/users/push-subscription')
      return response.data.data || response.data
    } catch (error: any) {
      // Graceful fallback for 404 - return default status
      if (error.status === 404) {
        console.warn('[usersService] Push subscription status endpoint not implemented yet')
        return { subscribed: false }
      }
      handleUserServiceError(error, ERROR_MESSAGES.PUSH_NOT_AVAILABLE)
    }
  },

  /**
   * Save push subscription (protected)
   * ⚠️ WARNING: Endpoint not implemented in backend yet
   * Silently fails with warning
   */
  savePushSubscription: async (subscription: PushSubscriptionData): Promise<void> => {
    try {
      await apiClient.post('/users/push-subscription', subscription)
    } catch (error: any) {
      // Graceful fallback for 404 - log warning but don't throw
      if (error.status === 404) {
        console.warn('[usersService] Save push subscription endpoint not implemented yet')
        return
      }
      handleUserServiceError(error, ERROR_MESSAGES.PUSH_NOT_AVAILABLE)
    }
  },

  /**
   * Delete push subscription (protected)
   * ⚠️ WARNING: Endpoint not implemented in backend yet
   * Silently fails with warning
   */
  deletePushSubscription: async (): Promise<void> => {
    try {
      await apiClient.delete('/users/push-subscription')
    } catch (error: any) {
      // Graceful fallback for 404 - log warning but don't throw
      if (error.status === 404) {
        console.warn('[usersService] Delete push subscription endpoint not implemented yet')
        return
      }
      handleUserServiceError(error, ERROR_MESSAGES.PUSH_NOT_AVAILABLE)
    }
  },

  /**
   * Get notification preferences (protected)
   * ⚠️ WARNING: Endpoint not implemented in backend yet
   * Returns default preferences as graceful fallback
   */
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    try {
      const response = await apiClient.get('/users/notification-preferences')
      return response.data.data || response.data.preferences
    } catch (error: any) {
      // Graceful fallback for 404 - return default preferences
      if (error.status === 404) {
        console.warn('[usersService] Notification preferences endpoint not implemented yet')
        return {
          caseUpdates: true,
          messages: true,
          appointments: true,
          payments: true,
          marketing: false,
        }
      }
      handleUserServiceError(error, ERROR_MESSAGES.PUSH_NOT_AVAILABLE)
    }
  },

  /**
   * Update notification preferences (protected)
   * ⚠️ WARNING: Endpoint not implemented in backend yet
   * Returns input preferences as graceful fallback
   */
  updateNotificationPreferences: async (preferences: NotificationPreferences): Promise<NotificationPreferences> => {
    try {
      const response = await apiClient.put('/users/notification-preferences', preferences)
      return response.data.data || response.data.preferences
    } catch (error: any) {
      // Graceful fallback for 404 - return the preferences that were sent
      if (error.status === 404) {
        console.warn('[usersService] Update notification preferences endpoint not implemented yet')
        return preferences
      }
      handleUserServiceError(error, ERROR_MESSAGES.PUSH_NOT_AVAILABLE)
    }
  },

  /**
   * Convert solo lawyer to firm owner (protected)
   * ⚠️ WARNING: Endpoint not implemented in backend yet
   */
  convertToFirm: async (data: ConvertToFirmData): Promise<any> => {
    try {
      const response = await apiClient.post('/users/convert-to-firm', data)
      return response.data.data || response.data
    } catch (error: any) {
      handleUserServiceError(error, ERROR_MESSAGES.CONVERT_FIRM_NOT_AVAILABLE)
    }
  },
}

export default usersService

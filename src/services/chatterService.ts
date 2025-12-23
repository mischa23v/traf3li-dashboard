/**
 * Chatter Service
 * Handles followers, activities, and file attachments for record communication
 * Based on Odoo's mail.followers and mail.activity models
 *
 * ⚠️ IMPLEMENTATION STATUS: [BACKEND-PENDING]
 * These endpoints are documented but their implementation status is UNCONFIRMED.
 * The backend may not have fully implemented all chatter-related endpoints.
 *
 * EXPECTED API ENDPOINTS:
 * Followers: /api/chatter/followers/* - [BACKEND-PENDING]
 * Activities: /api/chatter/activities/* - [BACKEND-PENDING]
 * Attachments: /api/chatter/attachments/* - [BACKEND-PENDING]
 *
 * If you encounter 404 or unexpected errors, the backend implementation may be incomplete.
 */

import apiClient, { handleApiError } from '@/lib/api'
import { toast } from 'sonner'
import type { ThreadResModel } from '@/types/message'

// ==================== TYPES ====================

export interface Follower {
  _id: string
  userId: string
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  resModel: ThreadResModel
  resId: string
  subtypeIds?: string[] // Which message subtypes to follow
  notificationPreferences?: {
    email: boolean
    push: boolean
    sms: boolean
  }
  createdAt: string
}

export interface ActivityType {
  _id: string
  name: string
  nameAr: string
  icon: string
  color: string
  sequence: number
  summary?: string
  summaryAr?: string
}

export interface ScheduledActivity {
  _id: string
  activityTypeId: string
  activityType?: ActivityType
  resModel: ThreadResModel
  resId: string
  summary: string
  summaryAr?: string
  note?: string
  dueDate: string
  userId: string // Assigned user
  user?: {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  createdByUserId: string
  createdBy?: {
    _id: string
    firstName: string
    lastName: string
  }
  state: 'planned' | 'today' | 'overdue' | 'done' | 'cancelled'
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface FileAttachment {
  _id: string
  name: string
  filename: string
  mimetype: string
  size: number
  url: string
  resModel: ThreadResModel
  resId: string
  uploadedBy: string
  createdAt: string
}

export interface CreateFollowerData {
  userId: string
  resModel: ThreadResModel
  resId: string
  subtypeIds?: string[]
  notificationPreferences?: {
    email?: boolean
    push?: boolean
    sms?: boolean
  }
}

export interface CreateActivityData {
  activityTypeId: string
  resModel: ThreadResModel
  resId: string
  summary: string
  summaryAr?: string
  note?: string
  dueDate: string
  userId: string
}

export interface UpdateActivityData {
  summary?: string
  summaryAr?: string
  note?: string
  dueDate?: string
  userId?: string
  state?: 'planned' | 'today' | 'overdue' | 'done' | 'cancelled'
}

export interface FollowersResponse {
  followers: Follower[]
  total: number
}

export interface ActivitiesResponse {
  activities: ScheduledActivity[]
  total: number
}

// ==================== FOLLOWERS ====================

/**
 * Get followers for a record
 *
 * @endpoint GET /chatter/followers/:resModel/:resId
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @description Retrieves all followers for a specific record
 * @param resModel - The resource model type (e.g., 'Lead', 'Client')
 * @param resId - The ID of the record
 * @returns Promise containing followers list and total count
 */
export const getFollowers = async (
  resModel: ThreadResModel,
  resId: string
): Promise<FollowersResponse> => {
  try {
    const response = await apiClient.get(`/chatter/followers/${resModel}/${resId}`)
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error('[BACKEND-PENDING] Followers not implemented | المتابعون غير متاحين')
    } else {
      toast.error('Failed to load followers | فشل تحميل المتابعين')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Add a follower to a record
 *
 * @endpoint POST /chatter/followers
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @description Creates a new follower relationship for a record
 * @param data - Follower data including userId, resModel, resId, and preferences
 * @returns Promise containing the created follower record
 */
export const addFollower = async (data: CreateFollowerData): Promise<Follower> => {
  try {
    const response = await apiClient.post('/chatter/followers', data)
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error('[BACKEND-PENDING] Add follower not implemented | إضافة المتابع غير متاحة')
    } else {
      toast.error('Failed to add follower | فشل إضافة المتابع')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Remove a follower from a record
 *
 * @endpoint DELETE /chatter/followers/:followerId
 * @description Removes a follower relationship by ID
 * @param followerId - The ID of the follower record to delete
 * @returns Promise that resolves when the follower is removed
 */
export const removeFollower = async (followerId: string): Promise<void> => {
  await apiClient.delete(`/chatter/followers/${followerId}`)
}

/**
 * Update follower notification preferences
 *
 * @endpoint PATCH /chatter/followers/:followerId/preferences
 * @description Updates notification preferences (email, push, SMS) for a follower
 * @param followerId - The ID of the follower record to update
 * @param preferences - Notification preferences to update (email, push, sms)
 * @returns Promise containing the updated follower record
 */
export const updateFollowerPreferences = async (
  followerId: string,
  preferences: {
    email?: boolean
    push?: boolean
    sms?: boolean
  }
): Promise<Follower> => {
  const response = await apiClient.patch(`/chatter/followers/${followerId}/preferences`, {
    notificationPreferences: preferences,
  })
  return response.data?.data || response.data
}

/**
 * Check if current user is following a record
 *
 * @endpoint GET /chatter/followers/:resModel/:resId/me
 * @description Checks if the current authenticated user is following a specific record
 * @param resModel - The resource model type (e.g., 'Lead', 'Client')
 * @param resId - The ID of the record
 * @returns Promise containing following status and follower record if following
 */
export const isFollowing = async (
  resModel: ThreadResModel,
  resId: string
): Promise<{ following: boolean; follower?: Follower }> => {
  const response = await apiClient.get(`/chatter/followers/${resModel}/${resId}/me`)
  return response.data?.data || response.data
}

/**
 * Toggle follow status for current user
 *
 * @endpoint POST /chatter/followers/:resModel/:resId/toggle
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @description Toggles the current user's follow status for a record (follow if not following, unfollow if following)
 * @param resModel - The resource model type (e.g., 'Lead', 'Client')
 * @param resId - The ID of the record
 * @returns Promise containing updated following status and follower record
 */
export const toggleFollow = async (
  resModel: ThreadResModel,
  resId: string
): Promise<{ following: boolean; follower?: Follower }> => {
  try {
    const response = await apiClient.post(`/chatter/followers/${resModel}/${resId}/toggle`)
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error('[BACKEND-PENDING] Follow toggle not implemented | تبديل المتابعة غير متاح')
    } else {
      toast.error('Failed to toggle follow | فشل تبديل المتابعة')
    }
    throw new Error(errorMsg)
  }
}

// ==================== ACTIVITIES ====================

/**
 * Get activity types
 *
 * @endpoint GET /chatter/activity-types
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @description Retrieves all available activity types (e.g., Call, Meeting, Email)
 * @returns Promise containing an array of activity types
 */
export const getActivityTypes = async (): Promise<ActivityType[]> => {
  try {
    const response = await apiClient.get('/chatter/activity-types')
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error(
        '[BACKEND-PENDING] Activity types not implemented | أنواع الأنشطة غير متاحة'
      )
    } else {
      toast.error('Failed to load activity types | فشل تحميل أنواع الأنشطة')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Get scheduled activities for a record
 *
 * @endpoint GET /chatter/activities/:resModel/:resId
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @description Retrieves all scheduled activities for a specific record, optionally filtered by state
 * @param resModel - The resource model type (e.g., 'Lead', 'Client')
 * @param resId - The ID of the record
 * @param state - Optional state filter (planned, today, overdue, done, cancelled)
 * @returns Promise containing activities list and total count
 */
export const getActivities = async (
  resModel: ThreadResModel,
  resId: string,
  state?: string
): Promise<ActivitiesResponse> => {
  try {
    const params = new URLSearchParams()
    if (state) params.append('state', state)

    const response = await apiClient.get(
      `/chatter/activities/${resModel}/${resId}?${params.toString()}`
    )
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error('[BACKEND-PENDING] Activities not implemented | الأنشطة غير متاحة')
    } else {
      toast.error('Failed to load activities | فشل تحميل الأنشطة')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Get all activities assigned to current user
 *
 * @endpoint GET /chatter/activities/me
 * @description Retrieves all activities assigned to the current authenticated user
 * @param state - Optional state filter (planned, today, overdue, done, cancelled)
 * @param limit - Optional limit on number of activities to return
 * @returns Promise containing activities list and total count
 */
export const getMyActivities = async (
  state?: string,
  limit?: number
): Promise<ActivitiesResponse> => {
  const params = new URLSearchParams()
  if (state) params.append('state', state)
  if (limit) params.append('limit', String(limit))

  const response = await apiClient.get(`/chatter/activities/me?${params.toString()}`)
  return response.data?.data || response.data
}

/**
 * Schedule a new activity
 *
 * @endpoint POST /chatter/activities
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @description Creates a new scheduled activity for a record
 * @param data - Activity data including type, record reference, summary, due date, and assigned user
 * @returns Promise containing the created activity
 */
export const scheduleActivity = async (
  data: CreateActivityData
): Promise<ScheduledActivity> => {
  try {
    const response = await apiClient.post('/chatter/activities', data)
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error(
        '[BACKEND-PENDING] Schedule activity not implemented | جدولة النشاط غير متاحة'
      )
    } else {
      toast.error('Failed to schedule activity | فشل جدولة النشاط')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Update an activity
 *
 * @endpoint PATCH /chatter/activities/:activityId
 * @description Updates an existing activity's details (summary, due date, assigned user, state)
 * @param activityId - The ID of the activity to update
 * @param data - Updated activity data (partial updates supported)
 * @returns Promise containing the updated activity
 */
export const updateActivity = async (
  activityId: string,
  data: UpdateActivityData
): Promise<ScheduledActivity> => {
  const response = await apiClient.patch(`/chatter/activities/${activityId}`, data)
  return response.data?.data || response.data
}

/**
 * Mark activity as done
 *
 * @endpoint POST /chatter/activities/:activityId/done
 * @description Marks an activity as completed with optional feedback
 * @param activityId - The ID of the activity to mark as done
 * @param feedback - Optional feedback or completion notes
 * @returns Promise containing the updated activity with 'done' state
 */
export const markActivityDone = async (
  activityId: string,
  feedback?: string
): Promise<ScheduledActivity> => {
  const response = await apiClient.post(`/chatter/activities/${activityId}/done`, {
    feedback,
  })
  return response.data?.data || response.data
}

/**
 * Cancel an activity
 *
 * @endpoint DELETE /chatter/activities/:activityId
 * @description Deletes or cancels a scheduled activity
 * @param activityId - The ID of the activity to cancel
 * @returns Promise that resolves when the activity is deleted
 */
export const cancelActivity = async (activityId: string): Promise<void> => {
  await apiClient.delete(`/chatter/activities/${activityId}`)
}

// ==================== FILE ATTACHMENTS ====================

/**
 * Upload file attachment
 *
 * @endpoint POST /chatter/attachments
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @description Uploads a single file attachment to a record
 * @param file - The file to upload
 * @param resModel - The resource model type (e.g., 'Lead', 'Client')
 * @param resId - The ID of the record to attach the file to
 * @returns Promise containing the created file attachment record
 */
export const uploadAttachment = async (
  file: File,
  resModel: ThreadResModel,
  resId: string
): Promise<FileAttachment> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('resModel', resModel)
    formData.append('resId', resId)

    const response = await apiClient.post('/chatter/attachments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error('[BACKEND-PENDING] File upload not implemented | رفع الملفات غير متاح')
    } else {
      toast.error('Failed to upload file | فشل رفع الملف')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Upload multiple file attachments
 *
 * @endpoint POST /chatter/attachments/bulk
 * @description Uploads multiple file attachments to a record in a single request
 * @param files - Array of files to upload
 * @param resModel - The resource model type (e.g., 'Lead', 'Client')
 * @param resId - The ID of the record to attach the files to
 * @returns Promise containing an array of created file attachment records
 */
export const uploadAttachments = async (
  files: File[],
  resModel: ThreadResModel,
  resId: string
): Promise<FileAttachment[]> => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  formData.append('resModel', resModel)
  formData.append('resId', resId)

  const response = await apiClient.post('/chatter/attachments/bulk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data?.data || response.data
}

/**
 * Get attachments for a record
 *
 * @endpoint GET /chatter/attachments/:resModel/:resId
 * ⚠️ [BACKEND-PENDING] - Implementation status unknown
 * @description Retrieves all file attachments for a specific record
 * @param resModel - The resource model type (e.g., 'Lead', 'Client')
 * @param resId - The ID of the record
 * @returns Promise containing an array of file attachments
 */
export const getAttachments = async (
  resModel: ThreadResModel,
  resId: string
): Promise<FileAttachment[]> => {
  try {
    const response = await apiClient.get(`/chatter/attachments/${resModel}/${resId}`)
    return response.data?.data || response.data
  } catch (error: any) {
    const errorMsg = handleApiError(error)
    if (error?.response?.status === 404) {
      toast.error('[BACKEND-PENDING] Attachments not implemented | المرفقات غير متاحة')
    } else {
      toast.error('Failed to load attachments | فشل تحميل المرفقات')
    }
    throw new Error(errorMsg)
  }
}

/**
 * Delete an attachment
 *
 * @endpoint DELETE /chatter/attachments/:attachmentId
 * @description Deletes a file attachment by ID
 * @param attachmentId - The ID of the attachment to delete
 * @returns Promise that resolves when the attachment is deleted
 */
export const deleteAttachment = async (attachmentId: string): Promise<void> => {
  await apiClient.delete(`/chatter/attachments/${attachmentId}`)
}

// ==================== SERVICE OBJECT ====================

const chatterService = {
  // Followers
  getFollowers,
  addFollower,
  removeFollower,
  updateFollowerPreferences,
  isFollowing,
  toggleFollow,

  // Activities
  getActivityTypes,
  getActivities,
  getMyActivities,
  scheduleActivity,
  updateActivity,
  markActivityDone,
  cancelActivity,

  // Attachments
  uploadAttachment,
  uploadAttachments,
  getAttachments,
  deleteAttachment,
}

export default chatterService

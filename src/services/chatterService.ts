/**
 * Chatter Service
 * Handles followers, activities, and file attachments for record communication
 * Based on Odoo's mail.followers and mail.activity models
 */

import apiClient from '@/lib/api'
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
 */
export const getFollowers = async (
  resModel: ThreadResModel,
  resId: string
): Promise<FollowersResponse> => {
  const response = await apiClient.get(`/chatter/followers/${resModel}/${resId}`)
  return response.data?.data || response.data
}

/**
 * Add a follower to a record
 */
export const addFollower = async (data: CreateFollowerData): Promise<Follower> => {
  const response = await apiClient.post('/chatter/followers', data)
  return response.data?.data || response.data
}

/**
 * Remove a follower from a record
 */
export const removeFollower = async (followerId: string): Promise<void> => {
  await apiClient.delete(`/chatter/followers/${followerId}`)
}

/**
 * Update follower notification preferences
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
 */
export const toggleFollow = async (
  resModel: ThreadResModel,
  resId: string
): Promise<{ following: boolean; follower?: Follower }> => {
  const response = await apiClient.post(`/chatter/followers/${resModel}/${resId}/toggle`)
  return response.data?.data || response.data
}

// ==================== ACTIVITIES ====================

/**
 * Get activity types
 */
export const getActivityTypes = async (): Promise<ActivityType[]> => {
  const response = await apiClient.get('/chatter/activity-types')
  return response.data?.data || response.data
}

/**
 * Get scheduled activities for a record
 */
export const getActivities = async (
  resModel: ThreadResModel,
  resId: string,
  state?: string
): Promise<ActivitiesResponse> => {
  const params = new URLSearchParams()
  if (state) params.append('state', state)

  const response = await apiClient.get(
    `/chatter/activities/${resModel}/${resId}?${params.toString()}`
  )
  return response.data?.data || response.data
}

/**
 * Get all activities assigned to current user
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
 */
export const scheduleActivity = async (
  data: CreateActivityData
): Promise<ScheduledActivity> => {
  const response = await apiClient.post('/chatter/activities', data)
  return response.data?.data || response.data
}

/**
 * Update an activity
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
 */
export const cancelActivity = async (activityId: string): Promise<void> => {
  await apiClient.delete(`/chatter/activities/${activityId}`)
}

// ==================== FILE ATTACHMENTS ====================

/**
 * Upload file attachment
 */
export const uploadAttachment = async (
  file: File,
  resModel: ThreadResModel,
  resId: string
): Promise<FileAttachment> => {
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
}

/**
 * Upload multiple file attachments
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
 */
export const getAttachments = async (
  resModel: ThreadResModel,
  resId: string
): Promise<FileAttachment[]> => {
  const response = await apiClient.get(`/chatter/attachments/${resModel}/${resId}`)
  return response.data?.data || response.data
}

/**
 * Delete an attachment
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

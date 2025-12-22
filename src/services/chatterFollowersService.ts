import { apiClient } from '@/lib/api'

// Types
export interface Follower {
  _id: string
  res_model: string
  res_id: string
  user_id: {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  notification_type: 'all' | 'mentions' | 'none'
  follow_type: 'manual' | 'auto'
  createdAt: string
}

export interface AddFollowerData {
  user_id: string
  notification_type?: 'all' | 'mentions' | 'none'
}

export interface BulkAddFollowersData {
  user_ids: string[]
  notification_type?: 'all' | 'mentions' | 'none'
}

export interface UpdateFollowerPreferencesData {
  notification_type: 'all' | 'mentions' | 'none'
}

export interface MyFollowedRecord {
  res_model: string
  res_id: string
  notification_type: 'all' | 'mentions' | 'none'
  follow_type: 'manual' | 'auto'
  createdAt: string
}

// API Service
export const chatterFollowersService = {
  /**
   * Get followers for a specific record
   * GET /api/chatter-followers/:model/:recordId/followers
   */
  async getFollowers(model: string, recordId: string): Promise<Follower[]> {
    const response = await apiClient.get(`/chatter-followers/${model}/${recordId}/followers`)
    return response.data.data
  },

  /**
   * Add a follower to a record
   * POST /api/chatter-followers/:model/:recordId/followers
   */
  async addFollower(model: string, recordId: string, data: AddFollowerData): Promise<Follower> {
    const response = await apiClient.post(`/chatter-followers/${model}/${recordId}/followers`, data)
    return response.data.data
  },

  /**
   * Add multiple followers at once
   * POST /api/chatter-followers/:model/:recordId/followers/bulk
   */
  async addFollowersBulk(model: string, recordId: string, data: BulkAddFollowersData): Promise<Follower[]> {
    const response = await apiClient.post(`/chatter-followers/${model}/${recordId}/followers/bulk`, data)
    return response.data.data
  },

  /**
   * Remove a follower from a record
   * DELETE /api/chatter-followers/:model/:recordId/followers/:userId
   */
  async removeFollower(model: string, recordId: string, userId: string): Promise<void> {
    await apiClient.delete(`/chatter-followers/${model}/${recordId}/followers/${userId}`)
  },

  /**
   * Update follower notification preferences
   * PATCH /api/chatter-followers/:model/:recordId/followers/:userId/preferences
   */
  async updatePreferences(
    model: string,
    recordId: string,
    userId: string,
    data: UpdateFollowerPreferencesData
  ): Promise<Follower> {
    const response = await apiClient.patch(
      `/chatter-followers/${model}/${recordId}/followers/${userId}/preferences`,
      data
    )
    return response.data.data
  },

  /**
   * Toggle follow status for current user
   * POST /api/chatter-followers/:model/:recordId/toggle-follow
   */
  async toggleFollow(model: string, recordId: string): Promise<{ isFollowing: boolean }> {
    const response = await apiClient.post(`/chatter-followers/${model}/${recordId}/toggle-follow`)
    return response.data.data
  },

  /**
   * Get all records the current user is following
   * GET /api/chatter-followers/my-followed
   */
  async getMyFollowedRecords(): Promise<MyFollowedRecord[]> {
    const response = await apiClient.get('/chatter-followers/my-followed')
    return response.data.data
  },
}

export default chatterFollowersService

/**
 * Answer Service
 * Handles all answer-related API calls for Q&A platform
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * ==================== TYPES ====================
 */

export interface Answer {
  _id: string
  questionId: string
  userId: string | {
    _id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
  }
  content: string
  isVerified: boolean
  verifiedBy?: string | {
    _id: string
    firstName: string
    lastName: string
  }
  verifiedAt?: string
  likes: number
  likedBy?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateAnswerData {
  questionId: string
  content: string
}

export interface UpdateAnswerData {
  content: string
}

export interface AnswerFilters {
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'likes' | 'verified'
  order?: 'asc' | 'desc'
}

/**
 * Answer Service Object
 */
const answerService = {
  /**
   * Create answer
   * POST /api/answers
   */
  createAnswer: async (data: CreateAnswerData): Promise<Answer> => {
    try {
      const response = await apiClient.post('/answers', data)
      return response.data.answer || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get answers for question
   * GET /api/answers/:questionId
   */
  getAnswers: async (questionId: string, filters?: AnswerFilters): Promise<{ answers: Answer[]; total: number }> => {
    try {
      const response = await apiClient.get(`/answers/${questionId}`, { params: filters })
      return {
        answers: response.data.answers || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update answer
   * PATCH /api/answers/:_id
   */
  updateAnswer: async (id: string, data: UpdateAnswerData): Promise<Answer> => {
    try {
      const response = await apiClient.patch(`/answers/${id}`, data)
      return response.data.answer || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete answer
   * DELETE /api/answers/:_id
   */
  deleteAnswer: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/answers/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Like answer
   * POST /api/answers/like/:_id
   */
  likeAnswer: async (id: string): Promise<Answer> => {
    try {
      const response = await apiClient.post(`/answers/like/${id}`)
      return response.data.answer || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify answer (admin)
   * PATCH /api/answers/verify/:_id
   */
  verifyAnswer: async (id: string): Promise<Answer> => {
    try {
      const response = await apiClient.patch(`/answers/verify/${id}`)
      return response.data.answer || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default answerService

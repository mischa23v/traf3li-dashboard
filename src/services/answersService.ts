/**
 * Answers Service
 * Handles all answer-related API calls for the legal Q&A platform
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Answer Interface
 */
export interface Answer {
  _id: string
  questionId: string
  content: string
  authorId: {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
    avatar?: string
    role?: string
  } | string
  upvotes: number
  downvotes: number
  isVerified: boolean
  isBestAnswer: boolean
  likedBy: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Create Answer Data
 */
export interface CreateAnswerData {
  questionId: string
  content: string
}

/**
 * Update Answer Data
 */
export interface UpdateAnswerData {
  content?: string
}

// ==================== API RESPONSES ====================

interface AnswersResponse {
  error: boolean
  answers: Answer[]
  total?: number
}

interface AnswerResponse {
  error: boolean
  answer: Answer
}

interface MessageResponse {
  error: boolean
  message: string
}

// ==================== SERVICE ====================

const answersService = {
  /**
   * Get answers for a specific question
   * GET /api/answers/:questionId
   */
  getByQuestionId: async (questionId: string): Promise<Answer[]> => {
    try {
      const response = await apiClient.get<AnswersResponse>(`/answers/${questionId}`)
      return response.data.answers || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new answer
   * POST /api/answers
   * Requires authentication
   */
  create: async (data: CreateAnswerData): Promise<Answer> => {
    try {
      const response = await apiClient.post<AnswerResponse>('/answers', data)
      return response.data.answer
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update answer
   * PATCH /api/answers/:_id
   * Requires authentication
   */
  update: async (id: string, data: UpdateAnswerData): Promise<Answer> => {
    try {
      const response = await apiClient.patch<AnswerResponse>(`/answers/${id}`, data)
      return response.data.answer
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete answer
   * DELETE /api/answers/:_id
   * Requires authentication
   */
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<MessageResponse>(`/answers/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Like/Unlike answer
   * POST /api/answers/like/:_id
   * Requires authentication
   */
  like: async (id: string): Promise<Answer> => {
    try {
      const response = await apiClient.post<AnswerResponse>(`/answers/like/${id}`)
      return response.data.answer
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify answer (admin only)
   * PATCH /api/answers/verify/:_id
   * Requires authentication (admin)
   */
  verify: async (id: string, isVerified: boolean = true): Promise<Answer> => {
    try {
      const response = await apiClient.patch<AnswerResponse>(`/answers/verify/${id}`, { isVerified })
      return response.data.answer
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default answersService

/**
 * Questions Service
 * Handles all question-related API calls for the legal Q&A platform
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Question Interface
 */
export interface Question {
  _id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  authorId: {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
    avatar?: string
  } | string
  status: 'open' | 'answered' | 'closed'
  views: number
  upvotes: number
  downvotes: number
  answerCount: number
  bestAnswerId?: string
  createdAt: string
  updatedAt: string
}

/**
 * Create Question Data
 */
export interface CreateQuestionData {
  title: string
  content: string
  category?: string
  tags?: string[]
}

/**
 * Update Question Data
 */
export interface UpdateQuestionData {
  title?: string
  content?: string
  category?: string
  tags?: string[]
  status?: 'open' | 'answered' | 'closed'
  bestAnswerId?: string
}

/**
 * Question Filters
 */
export interface QuestionFilters {
  status?: 'open' | 'answered' | 'closed'
  category?: string
  authorId?: string
  search?: string
  tags?: string[]
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ==================== API RESPONSES ====================

interface QuestionsResponse {
  error: boolean
  questions: Question[]
  total?: number
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface QuestionResponse {
  error: boolean
  question: Question
}

interface MessageResponse {
  error: boolean
  message: string
}

// ==================== SERVICE ====================

const questionsService = {
  /**
   * Get all questions with optional filters
   * GET /api/questions
   */
  getAll: async (filters?: QuestionFilters): Promise<{ questions: Question[]; total: number }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.authorId) params.append('authorId', filters.authorId)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.tags) {
        filters.tags.forEach(tag => params.append('tags', tag))
      }
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

      const queryString = params.toString()
      const url = queryString ? `/questions?${queryString}` : '/questions'

      const response = await apiClient.get<QuestionsResponse>(url)
      return {
        questions: response.data.questions || [],
        total: response.data.total || response.data.questions?.length || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single question by ID
   * GET /api/questions/:_id
   */
  getById: async (id: string): Promise<Question> => {
    try {
      const response = await apiClient.get<QuestionResponse>(`/questions/${id}`)
      return response.data.question
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new question
   * POST /api/questions
   * Requires authentication
   */
  create: async (data: CreateQuestionData): Promise<Question> => {
    try {
      const response = await apiClient.post<QuestionResponse>('/questions', data)
      return response.data.question
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update question
   * PATCH /api/questions/:_id
   * Requires authentication
   */
  update: async (id: string, data: UpdateQuestionData): Promise<Question> => {
    try {
      const response = await apiClient.patch<QuestionResponse>(`/questions/${id}`, data)
      return response.data.question
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete question
   * DELETE /api/questions/:_id
   * Requires authentication
   */
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<MessageResponse>(`/questions/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default questionsService

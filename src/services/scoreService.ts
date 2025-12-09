/**
 * Score Service
 * Handles lawyer scoring and rating system API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Lawyer Score Interface
 */
export interface LawyerScore {
  _id: string
  lawyerId: {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
    avatar?: string
    role?: string
  } | string
  totalScore: number
  questionScore: number
  answerScore: number
  verifiedAnswersCount: number
  bestAnswersCount: number
  totalAnswers: number
  totalQuestions: number
  upvotesReceived: number
  downvotesReceived: number
  reputation: number
  rank: number
  badges: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Top Lawyer Interface
 */
export interface TopLawyer {
  lawyerId: {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
    avatar?: string
    role?: string
    specialization?: string
  }
  totalScore: number
  reputation: number
  verifiedAnswersCount: number
  bestAnswersCount: number
  rank: number
  badges: string[]
}

// ==================== API RESPONSES ====================

interface ScoreResponse {
  error: boolean
  score: LawyerScore
}

interface TopLawyersResponse {
  error: boolean
  lawyers: TopLawyer[]
  total?: number
}

interface MessageResponse {
  error: boolean
  message: string
}

// ==================== SERVICE ====================

const scoreService = {
  /**
   * Get lawyer score by lawyer ID
   * GET /api/score/:lawyerId
   */
  getByLawyerId: async (lawyerId: string): Promise<LawyerScore> => {
    try {
      const response = await apiClient.get<ScoreResponse>(`/score/${lawyerId}`)
      return response.data.score
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Recalculate lawyer score
   * POST /api/score/recalculate/:lawyerId
   * Requires authentication
   */
  recalculate: async (lawyerId: string): Promise<LawyerScore> => {
    try {
      const response = await apiClient.post<ScoreResponse>(`/score/recalculate/${lawyerId}`)
      return response.data.score
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get top lawyers by score
   * GET /api/score/top/lawyers
   */
  getTopLawyers: async (limit?: number): Promise<TopLawyer[]> => {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())

      const queryString = params.toString()
      const url = queryString ? `/score/top/lawyers?${queryString}` : '/score/top/lawyers'

      const response = await apiClient.get<TopLawyersResponse>(url)
      return response.data.lawyers || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default scoreService

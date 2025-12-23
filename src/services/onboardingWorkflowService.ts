/**
 * Employee Onboarding Workflow Service
 * Handles Temporal-powered employee onboarding workflows
 *
 * Workflow Phases:
 * 1. Pre-boarding - Welcome email, account setup, equipment ordering
 * 2. Documentation - Collect and verify required documents
 * 3. Training - Complete required training sessions
 * 4. Probation - Performance reviews during probation period
 * 5. Completed - Full employee status
 *
 * Backend Routes (Temporal Integration):
 * ✅ POST   /employees/:id/start-onboarding              - Start onboarding workflow
 * ✅ POST   /employees/:id/onboarding/complete-documents - Signal documents submitted
 * ✅ POST   /employees/:id/onboarding/complete-training  - Signal training completed
 * ✅ POST   /employees/:id/onboarding/complete-review    - Signal review completed
 * ✅ GET    /employees/:id/onboarding/status             - Get onboarding status
 * ✅ POST   /employees/:id/onboarding/skip-phase         - Skip a phase (HR only)
 * ✅ DELETE /employees/:id/onboarding/cancel             - Cancel onboarding
 */

import { apiClient, handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export type OnboardingPhase =
  | 'pre-boarding'
  | 'documentation'
  | 'training'
  | 'probation'
  | 'completed'

export interface OnboardingProgress {
  completedTasks: string[]
  pendingTasks: string[]
  documentsSubmitted: boolean
  documentsVerified: boolean
  trainingCompleted: boolean
  trainingSessions: {
    total: number
    completed: number
  }
  reviewsCompleted: string[]
  probationReviews: {
    total: number
    completed: number
    passed: number
  }
}

export interface OnboardingStatus {
  employeeId: string
  workflowId?: string
  phase: OnboardingPhase
  progress: OnboardingProgress
  startDate: string
  expectedCompletion: string
  actualCompletion?: string
  isPaused: boolean
  pauseReason?: string
  createdAt: string
  updatedAt: string
}

export interface StartOnboardingConfig {
  role?: string
  department?: string
  skipPreBoarding?: boolean
  customTasks?: string[]
  probationDays?: number
}

export interface CompleteDocumentsData {
  verifiedCount: number
  pendingCount: number
  notes?: string
}

export interface CompleteTrainingData {
  sessionsCompleted: number
  totalSessions?: number
  notes?: string
}

export interface CompleteReviewData {
  reviewType: 'week1' | 'week2' | 'month1' | 'month2' | 'month3' | 'final'
  outcome: 'pass' | 'fail' | 'needs_improvement'
  feedback?: string
  nextSteps?: string[]
}

export interface SkipPhaseData {
  phase: OnboardingPhase
  reason: string
}

// ==================== SERVICE ====================

const onboardingWorkflowService = {
  /**
   * Start onboarding workflow for a new employee
   * Initiates a Temporal workflow that manages the entire onboarding process
   */
  start: async (
    employeeId: string,
    config?: StartOnboardingConfig
  ): Promise<OnboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OnboardingStatus
        message?: string
      }>(`/employees/${employeeId}/start-onboarding`, config || {})

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Signal that document collection phase is complete
   * Moves workflow to next phase if all documents are verified
   */
  completeDocuments: async (
    employeeId: string,
    data: CompleteDocumentsData
  ): Promise<OnboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OnboardingStatus
        message?: string
      }>(`/employees/${employeeId}/onboarding/complete-documents`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Signal that training phase is complete
   * Moves workflow to probation phase
   */
  completeTraining: async (
    employeeId: string,
    data: CompleteTrainingData
  ): Promise<OnboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OnboardingStatus
        message?: string
      }>(`/employees/${employeeId}/onboarding/complete-training`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Signal that a probation review is complete
   * Final review completion moves employee to full status
   */
  completeReview: async (
    employeeId: string,
    data: CompleteReviewData
  ): Promise<OnboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OnboardingStatus
        message?: string
      }>(`/employees/${employeeId}/onboarding/complete-review`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get current onboarding status for an employee
   */
  getStatus: async (employeeId: string): Promise<OnboardingStatus> => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: OnboardingStatus
      }>(`/employees/${employeeId}/onboarding/status`)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Skip a phase in the onboarding workflow
   * HR/Admin only - requires justification
   */
  skipPhase: async (
    employeeId: string,
    data: SkipPhaseData
  ): Promise<OnboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OnboardingStatus
        message?: string
      }>(`/employees/${employeeId}/onboarding/skip-phase`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel an ongoing onboarding workflow
   * Used when employee leaves before completing onboarding
   */
  cancel: async (
    employeeId: string,
    reason: string
  ): Promise<void> => {
    try {
      await apiClient.delete(`/employees/${employeeId}/onboarding/cancel`, {
        data: { reason },
      })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Pause onboarding workflow
   * Used for extended leave or other temporary holds
   */
  pause: async (
    employeeId: string,
    reason: string
  ): Promise<OnboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OnboardingStatus
        message?: string
      }>(`/employees/${employeeId}/onboarding/pause`, { reason })

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resume a paused onboarding workflow
   */
  resume: async (employeeId: string): Promise<OnboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OnboardingStatus
        message?: string
      }>(`/employees/${employeeId}/onboarding/resume`)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if employee has an active onboarding workflow
   */
  hasActiveWorkflow: async (employeeId: string): Promise<boolean> => {
    try {
      const status = await onboardingWorkflowService.getStatus(employeeId)
      return status.phase !== 'completed' && !status.isPaused
    } catch {
      return false
    }
  },

  /**
   * Get phase order for progress display
   */
  getPhaseOrder: (): OnboardingPhase[] => {
    return ['pre-boarding', 'documentation', 'training', 'probation', 'completed']
  },

  /**
   * Get phase index for progress calculation
   */
  getPhaseIndex: (phase: OnboardingPhase): number => {
    const phases = onboardingWorkflowService.getPhaseOrder()
    return phases.indexOf(phase)
  },
}

export default onboardingWorkflowService

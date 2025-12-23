/**
 * Case Lifecycle Workflow Service
 * Handles Temporal-powered legal case lifecycle workflows
 *
 * Features:
 * - Multi-stage case progression
 * - Automatic deadline reminders
 * - Court date management
 * - Requirement tracking per stage
 * - Pause/resume capabilities
 *
 * Backend Routes (Temporal Integration):
 * ✅ POST   /cases/:id/start-workflow              - Start case workflow
 * ✅ POST   /cases/:id/workflow/complete-requirement - Complete a requirement
 * ✅ POST   /cases/:id/workflow/transition-stage   - Move to next/specific stage
 * ✅ GET    /cases/:id/workflow/status             - Get workflow status
 * ✅ POST   /cases/:id/workflow/add-deadline       - Add a deadline
 * ✅ POST   /cases/:id/workflow/add-court-date     - Add a court date
 * ✅ POST   /cases/:id/workflow/pause              - Pause workflow
 * ✅ POST   /cases/:id/workflow/resume             - Resume workflow
 * ✅ POST   /cases/:id/workflow/cancel             - Cancel workflow
 */

import { apiClient, handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export interface CaseStage {
  id: string
  name: string
  nameAr: string
  order: number
  description?: string
  requiredDocuments?: string[]
  estimatedDuration?: number // days
}

export interface CaseRequirement {
  id: string
  name: string
  nameAr: string
  stageId: string
  completed: boolean
  completedAt?: string
  completedBy?: string
  dueDate?: string
  isOverdue?: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
}

export interface CaseDeadline {
  id: string
  title: string
  titleAr?: string
  date: string
  description?: string
  remindersSent: number
  isOverdue: boolean
  linkedRequirementId?: string
}

export interface CourtDate {
  id: string
  title: string
  titleAr?: string
  date: string
  time?: string
  location: string
  courtName?: string
  caseNumber?: string
  judge?: string
  notes?: string
  remindersSent: number
  outcome?: 'pending' | 'adjourned' | 'ruling' | 'settled'
}

export interface CaseWorkflowStatus {
  caseId: string
  workflowId?: string
  workflowTemplateId: string
  workflowTemplateName: string
  currentStage: CaseStage
  stages: CaseStage[]
  requirements: CaseRequirement[]
  deadlines: CaseDeadline[]
  courtDates: CourtDate[]
  isPaused: boolean
  pauseReason?: string
  pausedAt?: string
  progress: {
    totalRequirements: number
    completedRequirements: number
    percentComplete: number
  }
  createdAt: string
  updatedAt: string
}

export interface StartWorkflowData {
  workflowTemplateId: string
  startDate?: string
  initialStageId?: string
}

export interface CompleteRequirementData {
  requirementId: string
  notes?: string
  metadata?: Record<string, any>
}

export interface TransitionStageData {
  targetStageId?: string // If not provided, moves to next stage
  force?: boolean // Skip requirement validation
  notes?: string
}

export interface AddDeadlineData {
  title: string
  titleAr?: string
  date: string
  description?: string
  reminderDaysBefore?: number[]
  linkedRequirementId?: string
}

export interface AddCourtDateData {
  title: string
  titleAr?: string
  date: string
  time?: string
  location: string
  courtName?: string
  caseNumber?: string
  judge?: string
  notes?: string
  reminderDaysBefore?: number[]
}

export interface UpdateCourtDateData {
  outcome?: 'pending' | 'adjourned' | 'ruling' | 'settled'
  notes?: string
  nextDate?: string
}

// ==================== SERVICE ====================

const caseWorkflowService = {
  /**
   * Start a workflow for a case
   * Uses workflow templates to define stages and requirements
   */
  start: async (
    caseId: string,
    data: StartWorkflowData
  ): Promise<CaseWorkflowStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: CaseWorkflowStatus
        message?: string
      }>(`/cases/${caseId}/start-workflow`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Complete a requirement in the current stage
   */
  completeRequirement: async (
    caseId: string,
    data: CompleteRequirementData
  ): Promise<CaseWorkflowStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: CaseWorkflowStatus
        message?: string
      }>(`/cases/${caseId}/workflow/complete-requirement`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Transition to next stage or a specific stage
   */
  transitionStage: async (
    caseId: string,
    data?: TransitionStageData
  ): Promise<CaseWorkflowStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: CaseWorkflowStatus
        message?: string
      }>(`/cases/${caseId}/workflow/transition-stage`, data || {})

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get current workflow status for a case
   */
  getStatus: async (caseId: string): Promise<CaseWorkflowStatus> => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: CaseWorkflowStatus
      }>(`/cases/${caseId}/workflow/status`)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add a deadline to the case workflow
   */
  addDeadline: async (
    caseId: string,
    data: AddDeadlineData
  ): Promise<CaseWorkflowStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: CaseWorkflowStatus
        message?: string
      }>(`/cases/${caseId}/workflow/add-deadline`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove a deadline from the case workflow
   */
  removeDeadline: async (
    caseId: string,
    deadlineId: string
  ): Promise<CaseWorkflowStatus> => {
    try {
      const response = await apiClient.delete<{
        success: boolean
        data: CaseWorkflowStatus
        message?: string
      }>(`/cases/${caseId}/workflow/deadlines/${deadlineId}`)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add a court date to the case workflow
   */
  addCourtDate: async (
    caseId: string,
    data: AddCourtDateData
  ): Promise<CaseWorkflowStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: CaseWorkflowStatus
        message?: string
      }>(`/cases/${caseId}/workflow/add-court-date`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update a court date (e.g., record outcome)
   */
  updateCourtDate: async (
    caseId: string,
    courtDateId: string,
    data: UpdateCourtDateData
  ): Promise<CaseWorkflowStatus> => {
    try {
      const response = await apiClient.patch<{
        success: boolean
        data: CaseWorkflowStatus
        message?: string
      }>(`/cases/${caseId}/workflow/court-dates/${courtDateId}`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove a court date from the case workflow
   */
  removeCourtDate: async (
    caseId: string,
    courtDateId: string
  ): Promise<CaseWorkflowStatus> => {
    try {
      const response = await apiClient.delete<{
        success: boolean
        data: CaseWorkflowStatus
        message?: string
      }>(`/cases/${caseId}/workflow/court-dates/${courtDateId}`)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Pause the case workflow
   * Useful for cases on hold due to client request, settlement negotiations, etc.
   */
  pause: async (
    caseId: string,
    reason: string
  ): Promise<CaseWorkflowStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: CaseWorkflowStatus
        message?: string
      }>(`/cases/${caseId}/workflow/pause`, { reason })

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resume a paused workflow
   */
  resume: async (caseId: string): Promise<CaseWorkflowStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: CaseWorkflowStatus
        message?: string
      }>(`/cases/${caseId}/workflow/resume`)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel the case workflow
   * Used when case is closed, dismissed, or settled
   */
  cancel: async (
    caseId: string,
    reason: string
  ): Promise<void> => {
    try {
      await apiClient.post(`/cases/${caseId}/workflow/cancel`, { reason })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if case has an active workflow
   */
  hasActiveWorkflow: async (caseId: string): Promise<boolean> => {
    try {
      const status = await caseWorkflowService.getStatus(caseId)
      return !status.isPaused
    } catch {
      return false
    }
  },

  /**
   * Get all available workflow templates
   */
  getTemplates: async (): Promise<
    Array<{
      id: string
      name: string
      nameAr: string
      description?: string
      stages: CaseStage[]
    }>
  > => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: Array<{
          id: string
          name: string
          nameAr: string
          description?: string
          stages: CaseStage[]
        }>
      }>('/workflow-templates')

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get upcoming deadlines across all cases
   */
  getUpcomingDeadlines: async (
    daysAhead: number = 7
  ): Promise<
    Array<CaseDeadline & { caseId: string; caseName: string }>
  > => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: Array<CaseDeadline & { caseId: string; caseName: string }>
      }>('/workflow/upcoming-deadlines', {
        params: { daysAhead },
      })

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get upcoming court dates across all cases
   */
  getUpcomingCourtDates: async (
    daysAhead: number = 30
  ): Promise<
    Array<CourtDate & { caseId: string; caseName: string }>
  > => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: Array<CourtDate & { caseId: string; caseName: string }>
      }>('/workflow/upcoming-court-dates', {
        params: { daysAhead },
      })

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if a deadline is overdue
   */
  isDeadlineOverdue: (deadline: CaseDeadline): boolean => {
    return new Date(deadline.date) < new Date()
  },

  /**
   * Calculate days until deadline
   */
  daysUntilDeadline: (deadline: CaseDeadline): number => {
    const now = new Date()
    const deadlineDate = new Date(deadline.date)
    const diffTime = deadlineDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },
}

export default caseWorkflowService

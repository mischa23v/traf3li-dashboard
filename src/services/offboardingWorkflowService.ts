/**
 * Employee Offboarding Workflow Service
 * Handles Temporal-powered employee offboarding workflows
 *
 * Workflow Phases:
 * 1. Notification - Inform relevant parties, schedule exit
 * 2. Knowledge Transfer - Document handover, train replacement
 * 3. Access Revocation - Revoke system access, credentials
 * 4. Equipment Return - Collect company assets
 * 5. Exit Interview - Conduct exit interview
 * 6. Clearance - Get departmental clearances
 * 7. Completed - Final processing, archive records
 *
 * Backend Routes (Temporal Integration):
 * ✅ POST   /employees/:id/start-offboarding         - Start offboarding workflow
 * ✅ POST   /employees/:id/offboarding/complete-task - Complete a task/phase
 * ✅ GET    /employees/:id/offboarding/status        - Get offboarding status
 * ✅ POST   /employees/:id/offboarding/escalate      - Escalate an issue
 * ✅ POST   /employees/:id/offboarding/cancel        - Cancel offboarding
 */

import { apiClient, handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export type OffboardingPhase =
  | 'notification'
  | 'knowledge_transfer'
  | 'access_revocation'
  | 'equipment_return'
  | 'exit_interview'
  | 'clearance'
  | 'completed'

export type ExitType =
  | 'resignation'
  | 'termination'
  | 'retirement'
  | 'contract_end'
  | 'mutual_agreement'

export interface ClearanceStatus {
  it: boolean
  hr: boolean
  finance: boolean
  department: boolean
  legal?: boolean
  facilities?: boolean
}

export interface OffboardingTask {
  id: string
  name: string
  nameAr: string
  phase: OffboardingPhase
  completed: boolean
  completedAt?: string
  completedBy?: string
  required: boolean
  notes?: string
}

export interface OffboardingStatus {
  employeeId: string
  workflowId?: string
  phase: OffboardingPhase
  exitType: ExitType
  completedTasks: string[]
  pendingTasks: string[]
  tasks: OffboardingTask[]
  clearanceStatus: ClearanceStatus
  lastWorkingDay: string
  noticeDate: string
  exitInterviewScheduled?: string
  exitInterviewCompleted: boolean
  finalSettlementAmount?: number
  finalSettlementPaid: boolean
  escalations: Array<{
    issue: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    createdAt: string
    resolvedAt?: string
  }>
  createdAt: string
  updatedAt: string
}

export interface StartOffboardingData {
  exitType: ExitType
  lastWorkingDay: string
  reason?: string
  noticePeriodDays?: number
  skipNotification?: boolean
}

export interface CompleteTaskData {
  taskId: string
  notes?: string
  metadata?: Record<string, any>
}

export interface EscalateData {
  issue: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignTo?: string
}

export interface GrantClearanceData {
  department: keyof ClearanceStatus
  notes?: string
}

// ==================== SERVICE ====================

const offboardingWorkflowService = {
  /**
   * Start offboarding workflow for an employee
   * Initiates a Temporal workflow that manages the entire offboarding process
   */
  start: async (
    employeeId: string,
    data: StartOffboardingData
  ): Promise<OffboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OffboardingStatus
        message?: string
      }>(`/employees/${employeeId}/start-offboarding`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Complete a task in the offboarding workflow
   */
  completeTask: async (
    employeeId: string,
    data: CompleteTaskData
  ): Promise<OffboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OffboardingStatus
        message?: string
      }>(`/employees/${employeeId}/offboarding/complete-task`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get current offboarding status for an employee
   */
  getStatus: async (employeeId: string): Promise<OffboardingStatus> => {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: OffboardingStatus
      }>(`/employees/${employeeId}/offboarding/status`)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Escalate an issue during offboarding
   * Notifies HR and management of blocking issues
   */
  escalate: async (
    employeeId: string,
    data: EscalateData
  ): Promise<OffboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OffboardingStatus
        message?: string
      }>(`/employees/${employeeId}/offboarding/escalate`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Cancel an ongoing offboarding workflow
   * Used when employee decides to stay or termination is reversed
   */
  cancel: async (
    employeeId: string,
    reason: string
  ): Promise<void> => {
    try {
      await apiClient.post(`/employees/${employeeId}/offboarding/cancel`, { reason })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Grant clearance from a department
   */
  grantClearance: async (
    employeeId: string,
    data: GrantClearanceData
  ): Promise<OffboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OffboardingStatus
        message?: string
      }>(`/employees/${employeeId}/offboarding/grant-clearance`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Schedule exit interview
   */
  scheduleExitInterview: async (
    employeeId: string,
    scheduledDate: string
  ): Promise<OffboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OffboardingStatus
        message?: string
      }>(`/employees/${employeeId}/offboarding/schedule-exit-interview`, {
        scheduledDate,
      })

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Complete exit interview
   */
  completeExitInterview: async (
    employeeId: string,
    data: {
      feedback?: string
      wouldRecommend?: boolean
      improvementSuggestions?: string[]
    }
  ): Promise<OffboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OffboardingStatus
        message?: string
      }>(`/employees/${employeeId}/offboarding/complete-exit-interview`, data)

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Calculate and finalize settlement
   */
  finalizeSettlement: async (
    employeeId: string,
    amount: number
  ): Promise<OffboardingStatus> => {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: OffboardingStatus
        message?: string
      }>(`/employees/${employeeId}/offboarding/finalize-settlement`, { amount })

      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if employee has an active offboarding workflow
   */
  hasActiveWorkflow: async (employeeId: string): Promise<boolean> => {
    try {
      const status = await offboardingWorkflowService.getStatus(employeeId)
      return status.phase !== 'completed'
    } catch {
      return false
    }
  },

  /**
   * Get phase order for progress display
   */
  getPhaseOrder: (): OffboardingPhase[] => {
    return [
      'notification',
      'knowledge_transfer',
      'access_revocation',
      'equipment_return',
      'exit_interview',
      'clearance',
      'completed',
    ]
  },

  /**
   * Get phase index for progress calculation
   */
  getPhaseIndex: (phase: OffboardingPhase): number => {
    const phases = offboardingWorkflowService.getPhaseOrder()
    return phases.indexOf(phase)
  },

  /**
   * Check if all clearances are complete
   */
  areAllClearancesComplete: (clearanceStatus: ClearanceStatus): boolean => {
    return (
      clearanceStatus.it &&
      clearanceStatus.hr &&
      clearanceStatus.finance &&
      clearanceStatus.department
    )
  },
}

export default offboardingWorkflowService

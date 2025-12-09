/**
 * Gantt Chart Service
 * Handles Gantt chart data, dependencies, milestones, and real-time collaboration
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  GanttData,
  GanttTask,
  GanttLink,
  Milestone,
  CreateMilestoneData,
  Baseline,
  CreateBaselineData,
  CriticalPathResult,
  ResourceLoading,
  UpdateScheduleData,
  AddDependencyData,
  AutoScheduleOptions,
  AutoScheduleResult,
  ProductivityResponse,
  ProductivityFilters,
} from '@/types/gantt'

// ═══════════════════════════════════════════════════════════════
// GANTT DATA SERVICE
// ═══════════════════════════════════════════════════════════════
export const ganttService = {
  /**
   * Get Gantt data for a case (internal format)
   */
  getGanttData: async (caseId: string): Promise<{
    tasks: GanttTask[]
    links: GanttLink[]
    milestones: Milestone[]
  }> => {
    try {
      const response = await apiClient.get(`/gantt/case/${caseId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get Gantt data in DHTMLX format
   */
  getDHtmlxData: async (caseId: string): Promise<GanttData> => {
    try {
      const response = await apiClient.get(`/gantt/case/${caseId}/dhtmlx`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get productivity Gantt data (tasks + reminders + events)
   */
  getProductivityData: async (filters?: ProductivityFilters): Promise<ProductivityResponse> => {
    try {
      const params = new URLSearchParams()
      if (filters?.startDate) params.set('startDate', filters.startDate)
      if (filters?.endDate) params.set('endDate', filters.endDate)

      const response = await apiClient.get(`/gantt/productivity?${params}`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update task dates (for drag-drop)
   * PUT /api/gantt/task/:id/dates
   * Body: { startDate, endDate } in "YYYY-MM-DD HH:mm" format
   */
  updateTaskSchedule: async (taskId: string, data: UpdateScheduleData): Promise<GanttTask> => {
    try {
      const response = await apiClient.put(`/gantt/task/${taskId}/dates`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update task progress
   */
  updateTaskProgress: async (taskId: string, progress: number): Promise<GanttTask> => {
    try {
      const response = await apiClient.put(`/gantt/task/${taskId}/progress`, { progress })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create dependency link
   * POST /api/gantt/link
   * Body: { source, target, type } where type is 0=FS, 1=SS, 2=FF, 3=SF
   */
  addDependency: async (taskId: string, data: AddDependencyData): Promise<GanttLink> => {
    try {
      // Transform to backend format
      const linkData = {
        source: taskId,
        target: data.targetTaskId,
        type: data.type
      }
      const response = await apiClient.post(`/gantt/link`, linkData)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete dependency link
   * DELETE /api/gantt/link/:source/:target
   */
  removeDependency: async (sourceTaskId: string, targetTaskId: string): Promise<void> => {
    try {
      await apiClient.delete(`/gantt/link/${sourceTaskId}/${targetTaskId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update dependency
   */
  updateDependency: async (linkId: string, data: {
    type?: string
    lag?: number
  }): Promise<GanttLink> => {
    try {
      const response = await apiClient.put(`/gantt/links/${linkId}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get critical path
   */
  getCriticalPath: async (caseId: string): Promise<CriticalPathResult> => {
    try {
      const response = await apiClient.get(`/gantt/case/${caseId}/critical-path`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Auto-schedule tasks
   */
  autoSchedule: async (caseId: string, options: AutoScheduleOptions): Promise<AutoScheduleResult> => {
    try {
      const response = await apiClient.post(`/gantt/case/${caseId}/auto-schedule`, options)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Validate dependencies (check for circular references)
   */
  validateDependencies: async (caseId: string): Promise<{
    valid: boolean
    errors: Array<{ taskId: string; message: string }>
  }> => {
    try {
      const response = await apiClient.get(`/gantt/case/${caseId}/validate`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// MILESTONE SERVICE
// ═══════════════════════════════════════════════════════════════
export const milestoneService = {
  /**
   * Get milestones for a case
   */
  getMilestones: async (caseId: string): Promise<Milestone[]> => {
    try {
      const response = await apiClient.get(`/gantt/case/${caseId}/milestones`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create milestone
   */
  createMilestone: async (data: CreateMilestoneData): Promise<Milestone> => {
    try {
      const response = await apiClient.post(`/gantt/case/${data.caseId}/milestones`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update milestone
   */
  updateMilestone: async (milestoneId: string, data: Partial<CreateMilestoneData>): Promise<Milestone> => {
    try {
      const response = await apiClient.put(`/gantt/milestones/${milestoneId}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete milestone
   */
  deleteMilestone: async (milestoneId: string): Promise<void> => {
    try {
      await apiClient.delete(`/gantt/milestones/${milestoneId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark milestone as complete
   */
  completeMilestone: async (milestoneId: string): Promise<Milestone> => {
    try {
      const response = await apiClient.post(`/gantt/milestones/${milestoneId}/complete`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Link tasks to milestone
   */
  linkTasks: async (milestoneId: string, taskIds: string[]): Promise<Milestone> => {
    try {
      const response = await apiClient.post(`/gantt/milestones/${milestoneId}/link-tasks`, {
        taskIds
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// BASELINE SERVICE
// ═══════════════════════════════════════════════════════════════
export const baselineService = {
  /**
   * Get baselines for a case
   */
  getBaselines: async (caseId: string): Promise<Baseline[]> => {
    try {
      const response = await apiClient.get(`/gantt/case/${caseId}/baselines`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Save current schedule as baseline
   */
  saveBaseline: async (data: CreateBaselineData): Promise<Baseline> => {
    try {
      const response = await apiClient.post(`/gantt/case/${data.caseId}/baseline`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get baseline details
   */
  getBaseline: async (baselineId: string): Promise<Baseline> => {
    try {
      const response = await apiClient.get(`/gantt/baselines/${baselineId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete baseline
   */
  deleteBaseline: async (baselineId: string): Promise<void> => {
    try {
      await apiClient.delete(`/gantt/baselines/${baselineId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Compare current schedule with baseline
   */
  compareWithBaseline: async (caseId: string, baselineId: string): Promise<{
    variance: Array<{
      taskId: string
      taskName: string
      baselineStart: Date
      currentStart: Date
      baselineEnd: Date
      currentEnd: Date
      daysVariance: number
    }>
    summary: {
      tasksOnTrack: number
      tasksBehind: number
      tasksAhead: number
      totalVarianceDays: number
    }
  }> => {
    try {
      const response = await apiClient.get(`/gantt/case/${caseId}/compare/${baselineId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// RESOURCE SERVICE
// ═══════════════════════════════════════════════════════════════
export const ganttResourceService = {
  /**
   * Get resource loading for a case
   */
  getResourceLoading: async (caseId: string): Promise<ResourceLoading[]> => {
    try {
      const response = await apiClient.get(`/gantt/case/${caseId}/resource-loading`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get workload for specific resource
   */
  getResourceWorkload: async (resourceId: string, params?: {
    startDate?: string
    endDate?: string
  }): Promise<{
    totalAllocated: number
    totalAvailable: number
    utilizationRate: number
    dailyWorkload: Array<{
      date: string
      allocated: number
      available: number
      tasks: Array<{ taskId: string; taskName: string; hours: number }>
    }>
  }> => {
    try {
      const response = await apiClient.get(`/gantt/resources/${resourceId}/workload`, {
        params
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Level resources (redistribute work to avoid overallocation)
   */
  levelResources: async (caseId: string): Promise<{
    success: boolean
    adjustedTasks: number
    newEndDate: Date
  }> => {
    try {
      const response = await apiClient.post(`/gantt/case/${caseId}/level-resources`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Assign resource to task
   */
  assignResource: async (taskId: string, resourceId: string, hoursPerDay?: number): Promise<GanttTask> => {
    try {
      const response = await apiClient.post(`/gantt/task/${taskId}/assign`, {
        resourceId,
        hoursPerDay
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unassign resource from task
   */
  unassignResource: async (taskId: string): Promise<GanttTask> => {
    try {
      const response = await apiClient.post(`/gantt/task/${taskId}/unassign`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// EXPORT SERVICE
// ═══════════════════════════════════════════════════════════════
export const ganttExportService = {
  /**
   * Export Gantt to PDF
   */
  exportToPDF: async (caseId: string, options?: {
    showCriticalPath?: boolean
    showBaseline?: boolean
    pageSize?: 'A4' | 'A3' | 'Letter'
    orientation?: 'portrait' | 'landscape'
  }): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/gantt/case/${caseId}/export/pdf`, {
        params: options,
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export Gantt to Excel
   */
  exportToExcel: async (caseId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/gantt/case/${caseId}/export/xlsx`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export to MS Project format
   */
  exportToMSProject: async (caseId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/gantt/case/${caseId}/export/mpp`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Import from MS Project
   */
  importFromMSProject: async (caseId: string, file: File): Promise<{
    imported: number
    errors: string[]
  }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(`/gantt/case/${caseId}/import/mpp`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

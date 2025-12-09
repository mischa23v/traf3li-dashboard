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
   * Backend route: GET /gantt/data/case/:caseId
   */
  getGanttData: async (caseId: string): Promise<{
    tasks: GanttTask[]
    links: GanttLink[]
    milestones: Milestone[]
  }> => {
    try {
      const response = await apiClient.get(`/gantt/data/case/${caseId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all Gantt data for firm
   * Backend route: GET /gantt/data
   */
  getAllGanttData: async (): Promise<{
    tasks: GanttTask[]
    links: GanttLink[]
    milestones: Milestone[]
  }> => {
    try {
      const response = await apiClient.get('/gantt/data')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get Gantt data by assignee
   * Backend route: GET /gantt/data/assigned/:userId
   */
  getGanttDataByAssignee: async (userId: string): Promise<{
    tasks: GanttTask[]
    links: GanttLink[]
    milestones: Milestone[]
  }> => {
    try {
      const response = await apiClient.get(`/gantt/data/assigned/${userId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Filter Gantt data with complex criteria
   * Backend route: POST /gantt/data/filter
   */
  filterGanttData: async (filters: any): Promise<{
    tasks: GanttTask[]
    links: GanttLink[]
    milestones: Milestone[]
  }> => {
    try {
      const response = await apiClient.post('/gantt/data/filter', filters)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get task hierarchy
   * Backend route: GET /gantt/hierarchy/:taskId
   */
  getTaskHierarchy: async (taskId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/gantt/hierarchy/${taskId}`)
      return response.data.data
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
   * Backend route: PUT /gantt/task/:id/progress
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
   * Update task duration
   * Backend route: PUT /gantt/task/:id/duration
   */
  updateTaskDuration: async (taskId: string, duration: number): Promise<GanttTask> => {
    try {
      const response = await apiClient.put(`/gantt/task/${taskId}/duration`, { duration })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update task parent (change hierarchy)
   * Backend route: PUT /gantt/task/:id/parent
   */
  updateTaskParent: async (taskId: string, parentId: string | null): Promise<GanttTask> => {
    try {
      const response = await apiClient.put(`/gantt/task/${taskId}/parent`, { parentId })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Reorder tasks
   * Backend route: POST /gantt/task/reorder
   */
  reorderTasks: async (taskIds: string[]): Promise<void> => {
    try {
      await apiClient.post('/gantt/task/reorder', { taskIds })
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
   * Backend route: DELETE /gantt/link/:source/:target
   */
  removeDependency: async (sourceTaskId: string, targetTaskId: string): Promise<void> => {
    try {
      await apiClient.delete(`/gantt/link/${sourceTaskId}/${targetTaskId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get dependency chain for a task
   * Backend route: GET /gantt/dependencies/:taskId
   */
  getDependencyChain: async (taskId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/gantt/dependencies/${taskId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get critical path for project
   * Backend route: GET /gantt/critical-path/:projectId
   */
  getCriticalPath: async (projectId: string): Promise<CriticalPathResult> => {
    try {
      const response = await apiClient.get(`/gantt/critical-path/${projectId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get slack time for a task
   * Backend route: GET /gantt/slack/:taskId
   */
  getSlackTime: async (taskId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/gantt/slack/${taskId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get bottleneck tasks
   * Backend route: GET /gantt/bottlenecks/:projectId
   */
  getBottlenecks: async (projectId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/gantt/bottlenecks/${projectId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get project timeline summary
   * Backend route: GET /gantt/timeline/:projectId
   */
  getProjectTimeline: async (projectId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/gantt/timeline/${projectId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Auto-schedule project
   * Backend route: POST /gantt/auto-schedule/:projectId
   */
  autoSchedule: async (projectId: string, options: AutoScheduleOptions): Promise<AutoScheduleResult> => {
    try {
      const response = await apiClient.post(`/gantt/auto-schedule/${projectId}`, options)
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
   * Get milestones for a project
   * Backend route: GET /gantt/milestones/:projectId
   */
  getMilestones: async (projectId: string): Promise<Milestone[]> => {
    try {
      const response = await apiClient.get(`/gantt/milestones/${projectId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create milestone
   * Backend route: POST /gantt/milestone
   */
  createMilestone: async (data: CreateMilestoneData): Promise<Milestone> => {
    try {
      const response = await apiClient.post('/gantt/milestone', data)
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
   * Create baseline for project
   * Backend route: POST /gantt/baseline/:projectId
   */
  createBaseline: async (projectId: string, data: CreateBaselineData): Promise<Baseline> => {
    try {
      const response = await apiClient.post(`/gantt/baseline/${projectId}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get baseline for project
   * Backend route: GET /gantt/baseline/:projectId
   */
  getBaseline: async (projectId: string): Promise<Baseline> => {
    try {
      const response = await apiClient.get(`/gantt/baseline/${projectId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Compare current to baseline
   * Backend route: GET /gantt/baseline/:projectId/compare
   */
  compareToBaseline: async (projectId: string): Promise<{
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
      const response = await apiClient.get(`/gantt/baseline/${projectId}/compare`)
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
   * Get resource allocation overview
   * Backend route: GET /gantt/resources
   */
  getResourceAllocation: async (): Promise<ResourceLoading[]> => {
    try {
      const response = await apiClient.get('/gantt/resources')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get resource conflicts
   * Backend route: GET /gantt/resources/conflicts
   */
  getResourceConflicts: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/gantt/resources/conflicts')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Suggest optimal assignee for task
   * Backend route: POST /gantt/resources/suggest
   */
  suggestAssignee: async (data: any): Promise<any> => {
    try {
      const response = await apiClient.post('/gantt/resources/suggest', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get specific user workload
   * Backend route: GET /gantt/resources/:userId/workload
   */
  getUserWorkload: async (userId: string, params?: {
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
      const response = await apiClient.get(`/gantt/resources/${userId}/workload`, {
        params
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Level resources for project
   * Backend route: POST /gantt/level-resources/:projectId
   */
  levelResources: async (projectId: string): Promise<{
    success: boolean
    adjustedTasks: number
    newEndDate: Date
  }> => {
    try {
      const response = await apiClient.post(`/gantt/level-resources/${projectId}`)
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
   * Export to MS Project XML
   * Backend route: GET /gantt/export/:projectId/msproject
   */
  exportToMSProject: async (projectId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/gantt/export/${projectId}/msproject`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export to PDF
   * Backend route: GET /gantt/export/:projectId/pdf
   */
  exportToPDF: async (projectId: string, options?: {
    showCriticalPath?: boolean
    showBaseline?: boolean
    pageSize?: 'A4' | 'A3' | 'Letter'
    orientation?: 'portrait' | 'landscape'
  }): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/gantt/export/${projectId}/pdf`, {
        params: options,
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export to Excel
   * Backend route: GET /gantt/export/:projectId/excel
   */
  exportToExcel: async (projectId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/gantt/export/${projectId}/excel`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

// ═══════════════════════════════════════════════════════════════
// COLLABORATION SERVICE
// ═══════════════════════════════════════════════════════════════
export const ganttCollaborationService = {
  /**
   * Get active users for resource
   * Backend route: GET /gantt/collaboration/presence/:resourceId
   */
  getActiveUsers: async (resourceId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/gantt/collaboration/presence/${resourceId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update user presence
   * Backend route: POST /gantt/collaboration/presence
   */
  updatePresence: async (data: any): Promise<any> => {
    try {
      const response = await apiClient.post('/gantt/collaboration/presence', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get recent activities
   * Backend route: GET /gantt/collaboration/activities/:firmId
   */
  getRecentActivities: async (firmId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/gantt/collaboration/activities/${firmId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get collaboration stats
   * Backend route: GET /gantt/collaboration/stats
   */
  getCollaborationStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/gantt/collaboration/stats')
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

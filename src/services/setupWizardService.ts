import { apiClient } from '@/lib/api'

// Types
export interface SetupTask {
  taskId: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  isRequired: boolean
  actionUrl: string
  estimatedMinutes: number
  isCompleted: boolean
  skipped: boolean
  completedAt?: string
  skippedAt?: string
}

export interface SetupSection {
  sectionId: string
  name: string
  nameAr: string
  icon: string
  isRequired: boolean
  tasks: SetupTask[]
  completedCount: number
  totalCount: number
  percentage: number
}

export interface SetupStatus {
  sections: SetupSection[]
  overall: {
    completedTasks: number
    totalTasks: number
    requiredCompleted: number
    requiredTotal: number
    percentage: number
    isComplete: boolean
  }
}

export interface ProgressPercentage {
  completed: number
  total: number
  percentage: number
  requiredCompleted: number
  requiredTotal: number
}

// API Service
export const setupWizardService = {
  /**
   * Get full setup status with all sections and tasks
   * GET /api/setup/status
   */
  async getStatus(): Promise<SetupStatus> {
    const response = await apiClient.get('/setup/status')
    return response.data.data
  },

  /**
   * Get all sections with their tasks
   * GET /api/setup/sections
   */
  async getSections(): Promise<SetupSection[]> {
    const response = await apiClient.get('/setup/sections')
    return response.data.data
  },

  /**
   * Mark a task as completed
   * POST /api/setup/tasks/:taskId/complete
   */
  async completeTask(taskId: string): Promise<SetupTask> {
    const response = await apiClient.post(`/setup/tasks/${taskId}/complete`)
    return response.data.data
  },

  /**
   * Skip a task
   * POST /api/setup/tasks/:taskId/skip
   */
  async skipTask(taskId: string): Promise<SetupTask> {
    const response = await apiClient.post(`/setup/tasks/${taskId}/skip`)
    return response.data.data
  },

  /**
   * Get the next task to complete
   * GET /api/setup/next-task
   */
  async getNextTask(): Promise<SetupTask | null> {
    const response = await apiClient.get('/setup/next-task')
    return response.data.data
  },

  /**
   * Get progress percentage stats
   * GET /api/setup/progress-percentage
   */
  async getProgressPercentage(): Promise<ProgressPercentage> {
    const response = await apiClient.get('/setup/progress-percentage')
    return response.data.data
  },

  /**
   * Reset all progress (admin only)
   * POST /api/setup/reset
   */
  async resetProgress(): Promise<void> {
    await apiClient.post('/setup/reset')
  },
}

export default setupWizardService

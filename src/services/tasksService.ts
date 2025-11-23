/**
 * Tasks Service
 * Handles all task-related API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Task Interface
 */
export interface Task {
  _id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'backlog' | 'todo' | 'in progress' | 'done' | 'canceled'
  label?: 'bug' | 'feature' | 'documentation' | 'enhancement' | 'question'
  dueDate?: string
  assignedTo: string | { firstName: string; lastName: string; role?: string; avatar?: string }
  createdBy: string
  caseId?: string | { caseNumber?: string; title?: string; court?: string }
  clientId?: string | { _id?: string; name?: string; phone?: string }
  recurring?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
  }
  tags?: string[]
  notes?: string
  subtasks?: Subtask[]
  attachments?: Attachment[]
  comments?: Comment[]
  history?: any[]
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Subtask {
  title: string
  completed: boolean
}

export interface Attachment {
  fileName: string
  fileUrl: string
  fileType: string
  uploadedBy: string
  uploadedAt: string
}

export interface Comment {
  id?: string
  userId: string
  user?: string
  avatar?: string
  text: string
  time?: string
  createdAt: string
}

/**
 * Create Task Data
 */
export interface CreateTaskData {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'backlog' | 'todo' | 'in progress' | 'done' | 'canceled'
  label?: 'bug' | 'feature' | 'documentation' | 'enhancement' | 'question'
  dueDate?: string
  assignedTo: string
  caseId?: string
  clientId?: string
  tags?: string[]
  notes?: string
  subtasks?: Subtask[]
}

/**
 * Task Filters
 */
export interface TaskFilters {
  status?: string
  priority?: string
  assignedTo?: string
  caseId?: string
  overdue?: boolean
  page?: number
  limit?: number
}

/**
 * Tasks Service Object
 */
const tasksService = {
  /**
   * Get all tasks
   */
  getTasks: async (filters?: TaskFilters): Promise<{ tasks: Task[]; total: number }> => {
    try {
      const response = await apiClient.get('/tasks', { params: filters })
      return {
        tasks: response.data.tasks || response.data.data || [],
        total: response.data.total || 0,
      }
    } catch (error: any) {
      console.error('Get tasks error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single task
   */
  getTask: async (id: string): Promise<Task> => {
    try {
      const response = await apiClient.get(`/tasks/${id}`)
      return response.data.task || response.data.data
    } catch (error: any) {
      console.error('Get task error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create task
   */
  createTask: async (data: CreateTaskData): Promise<Task> => {
    try {
      const response = await apiClient.post('/tasks', data)
      return response.data.task || response.data.data
    } catch (error: any) {
      console.error('Create task error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update task
   */
  updateTask: async (id: string, data: Partial<CreateTaskData>): Promise<Task> => {
    try {
      const response = await apiClient.put(`/tasks/${id}`, data)
      return response.data.task || response.data.data
    } catch (error: any) {
      console.error('Update task error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete task
   */
  deleteTask: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/tasks/${id}`)
    } catch (error: any) {
      console.error('Delete task error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get upcoming tasks
   */
  getUpcoming: async (): Promise<Task[]> => {
    try {
      const response = await apiClient.get('/tasks/upcoming')
      return response.data.tasks || response.data.data || []
    } catch (error: any) {
      console.error('Get upcoming tasks error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get overdue tasks
   */
  getOverdue: async (): Promise<Task[]> => {
    try {
      const response = await apiClient.get('/tasks/overdue')
      return response.data.tasks || response.data.data || []
    } catch (error: any) {
      console.error('Get overdue tasks error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Mark task as complete
   */
  completeTask: async (id: string): Promise<Task> => {
    try {
      const response = await apiClient.post(`/tasks/${id}/complete`)
      return response.data.task || response.data.data
    } catch (error: any) {
      console.error('Complete task error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Upload attachment
   */
  uploadAttachment: async (id: string, file: File): Promise<Attachment> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post(`/tasks/${id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.attachment || response.data.data
    } catch (error: any) {
      console.error('Upload attachment error:', error)
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Import tasks from CSV
   */
  importTasks: async (file: File): Promise<{ imported: number; failed: number; errors: any[] }> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post('/tasks/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error: any) {
      console.error('Import tasks error:', error)
      throw new Error(handleApiError(error))
    }
  },
}

export default tasksService

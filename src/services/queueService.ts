/**
 * Queue Service
 * Handles all queue management API calls matching the backend API
 * Admin-only routes for managing background job queues
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export interface QueueStats {
  name: string
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  paused: boolean
}

export interface JobData {
  id: string
  name?: string
  data: any
  opts?: any
  progress?: number
  delay?: number
  timestamp?: number
  attemptsMade?: number
  failedReason?: string
  stacktrace?: string[]
  returnvalue?: any
  finishedOn?: number
  processedOn?: number
}

export interface JobCounts {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  paused: number
}

export interface AddJobPayload {
  data: any
  options?: {
    delay?: number
    priority?: number
    attempts?: number
    backoff?: number | { type: string; delay: number }
    lifo?: boolean
    timeout?: number
    jobId?: string
    removeOnComplete?: boolean | number
    removeOnFail?: boolean | number
  }
}

export interface BulkJobPayload {
  name?: string
  data: any
  opts?: AddJobPayload['options']
}

export interface CleanJobsPayload {
  gracePeriod?: number // milliseconds
  type?: 'completed' | 'failed' | 'delayed' | 'active' | 'wait'
}

// ==================== API FUNCTIONS ====================

/**
 * Get all queues with statistics
 * GET /api/queues
 */
export const getAllQueuesStats = async (): Promise<QueueStats[]> => {
  try {
    const response = await apiClient.get('/queues')
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get specific queue statistics
 * GET /api/queues/:name
 */
export const getQueueStats = async (name: string): Promise<QueueStats> => {
  try {
    const response = await apiClient.get(`/queues/${name}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get jobs from a queue
 * GET /api/queues/:name/jobs?status=waiting&start=0&end=20
 */
export const getJobs = async (
  name: string,
  status: string = 'waiting',
  start: number = 0,
  end: number = 20
): Promise<JobData[]> => {
  try {
    const response = await apiClient.get(`/queues/${name}/jobs`, {
      params: { status, start, end },
    })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get specific job status
 * GET /api/queues/:name/jobs/:jobId
 */
export const getJobStatus = async (name: string, jobId: string): Promise<JobData> => {
  try {
    const response = await apiClient.get(`/queues/${name}/jobs/${jobId}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get job counts by status
 * GET /api/queues/:name/counts
 */
export const getJobCounts = async (name: string): Promise<JobCounts> => {
  try {
    const response = await apiClient.get(`/queues/${name}/counts`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Retry a failed job
 * POST /api/queues/:name/retry/:jobId
 */
export const retryJob = async (name: string, jobId: string): Promise<JobData> => {
  try {
    const response = await apiClient.post(`/queues/${name}/retry/${jobId}`)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Remove a job from queue
 * DELETE /api/queues/:name/jobs/:jobId
 */
export const removeJob = async (name: string, jobId: string): Promise<void> => {
  try {
    await apiClient.delete(`/queues/${name}/jobs/${jobId}`)
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Pause a queue
 * POST /api/queues/:name/pause
 */
export const pauseQueue = async (name: string): Promise<void> => {
  try {
    await apiClient.post(`/queues/${name}/pause`)
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Resume a paused queue
 * POST /api/queues/:name/resume
 */
export const resumeQueue = async (name: string): Promise<void> => {
  try {
    await apiClient.post(`/queues/${name}/resume`)
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Clean old jobs from queue
 * POST /api/queues/:name/clean
 */
export const cleanJobs = async (
  name: string,
  payload: CleanJobsPayload = {}
): Promise<{ cleanedCount: number }> => {
  try {
    const response = await apiClient.post(`/queues/${name}/clean`, payload)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Empty a queue (remove all jobs)
 * POST /api/queues/:name/empty
 */
export const emptyQueue = async (name: string): Promise<void> => {
  try {
    await apiClient.post(`/queues/${name}/empty`)
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Add a job to a queue
 * POST /api/queues/:name/jobs
 */
export const addJob = async (name: string, payload: AddJobPayload): Promise<JobData> => {
  try {
    const response = await apiClient.post(`/queues/${name}/jobs`, payload)
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Add multiple jobs to a queue
 * POST /api/queues/:name/jobs/bulk
 */
export const addBulkJobs = async (name: string, jobs: BulkJobPayload[]): Promise<JobData[]> => {
  try {
    const response = await apiClient.post(`/queues/${name}/jobs/bulk`, { jobs })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// ==================== DEFAULT EXPORT ====================

export default {
  getAllQueuesStats,
  getQueueStats,
  getJobs,
  getJobStatus,
  getJobCounts,
  retryJob,
  removeJob,
  pauseQueue,
  resumeQueue,
  cleanJobs,
  emptyQueue,
  addJob,
  addBulkJobs,
}

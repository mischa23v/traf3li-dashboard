/**
 * Jobs Service
 * API service for managing jobs/services in the platform
 * Handles both "My Services" (jobs posted by user) and "Browse Jobs" (all available jobs)
 */

import { apiClient } from '@/lib/api'

// ==================== TYPES ====================

export interface Job {
  _id: string
  userID: {
    _id: string
    username: string
    image?: string
    country?: string
    email?: string
    phone?: string
    createdAt?: string
  }
  title: string
  description: string
  category: 'labor' | 'commercial' | 'personal-status' | 'criminal' | 'real-estate' | 'traffic' | 'administrative' | 'other'
  budget: {
    min: number
    max: number
  }
  deadline: string
  location?: string
  requirements?: string[]
  attachments?: {
    name: string
    url: string
    uploadedAt: string
  }[]
  status: 'open' | 'in-progress' | 'completed' | 'cancelled'
  proposalsCount: number
  acceptedProposal?: string
  views: number
  createdAt: string
  updatedAt: string
}

export interface CreateJobData {
  title: string
  description: string
  category: string
  budget: {
    min: number
    max: number
  }
  deadline: string
  location?: string
  requirements?: string[]
}

export interface UpdateJobData {
  title?: string
  description?: string
  category?: string
  budget?: {
    min: number
    max: number
  }
  deadline?: string
  location?: string
  requirements?: string[]
  status?: string
}

export interface JobFilters {
  category?: string
  status?: string
  minBudget?: number
  maxBudget?: number
}

// ==================== API CALLS ====================

/**
 * Get all jobs (public - for browsing)
 */
export const getJobs = async (filters?: JobFilters): Promise<Job[]> => {
  const params: any = {}

  if (filters?.category) params.category = filters.category
  if (filters?.status) params.status = filters.status
  if (filters?.minBudget) params.minBudget = filters.minBudget
  if (filters?.maxBudget) params.maxBudget = filters.maxBudget

  const response = await apiClient.get('/jobs', { params })
  return response.data
}

/**
 * Get my jobs (jobs created by the current user)
 */
export const getMyJobs = async (): Promise<Job[]> => {
  const response = await apiClient.get('/jobs/my-jobs')
  return response.data
}

/**
 * Get single job by ID
 */
export const getJob = async (id: string): Promise<Job> => {
  const response = await apiClient.get(`/jobs/${id}`)
  return response.data
}

/**
 * Create new job
 */
export const createJob = async (data: CreateJobData): Promise<Job> => {
  const response = await apiClient.post('/jobs', data)
  return response.data
}

/**
 * Update job
 */
export const updateJob = async (id: string, data: UpdateJobData): Promise<Job> => {
  const response = await apiClient.patch(`/jobs/${id}`, data)
  return response.data
}

/**
 * Delete job
 */
export const deleteJob = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/jobs/${id}`)
  return response.data
}

// ==================== SERVICE OBJECT ====================

const jobsService = {
  getJobs,
  getMyJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
}

export default jobsService

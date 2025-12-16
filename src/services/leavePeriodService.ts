/**
 * Leave Period Service
 * Handles leave period management API calls
 * Based on ERPNext Leave Period DocType
 */

import api from './api'

// ==================== TYPES ====================

export interface LeavePeriod {
  _id: string
  periodId: string
  name: string
  nameAr: string

  fromDate: string
  toDate: string

  company?: string

  isActive: boolean

  // Auto-allocation settings
  autoAllocateLeaves: boolean
  allocateOnDayOfPeriodStart: boolean

  // Statistics
  totalEmployeesAllocated?: number
  totalLeavesAllocated?: number

  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface LeavePeriodStatistics {
  periodId: string
  periodName: string
  periodNameAr: string
  dateRange: {
    fromDate: string
    toDate: string
  }

  // Employee statistics
  employeeStats: {
    totalEmployees: number
    employeesAllocated: number
    employeesPending: number
    allocationPercentage: number
  }

  // Leave allocation statistics
  allocationStats: {
    totalAllocations: number
    totalLeaveDaysAllocated: number
    averageDaysPerEmployee: number
    byLeaveType: Array<{
      leaveType: string
      leaveTypeName: string
      leaveTypeNameAr: string
      totalAllocations: number
      totalDays: number
    }>
  }

  // Leave usage statistics
  usageStats: {
    totalLeavesTaken: number
    totalDaysUsed: number
    totalDaysPending: number
    totalDaysRemaining: number
    usagePercentage: number
  }

  // Department breakdown
  departmentBreakdown: Array<{
    department: string
    employeeCount: number
    allocatedCount: number
    totalDaysAllocated: number
    totalDaysUsed: number
  }>
}

export interface CreateLeavePeriodData {
  name: string
  nameAr: string
  fromDate: string
  toDate: string
  company?: string
  isActive: boolean
  autoAllocateLeaves: boolean
  allocateOnDayOfPeriodStart: boolean
}

export interface UpdateLeavePeriodData extends Partial<CreateLeavePeriodData> {}

export interface LeavePeriodsResponse {
  data: LeavePeriod[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface LeavePeriodFilters {
  company?: string
  isActive?: boolean
  year?: number
  page?: number
  limit?: number
}

export interface AllocateLeavesRequest {
  periodId: string
  employeeIds?: string[] // If not provided, allocate for all eligible employees
  leaveTypes?: string[] // If not provided, allocate all applicable leave types
  overwriteExisting?: boolean
}

export interface AllocateLeavesResponse {
  success: boolean
  periodId: string
  allocationsCreated: number
  employeesProcessed: number
  errors?: Array<{
    employeeId: string
    employeeName: string
    error: string
  }>
  allocations: Array<{
    employeeId: string
    employeeName: string
    leaveType: string
    daysAllocated: number
    allocationId: string
  }>
}

// ==================== API FUNCTIONS ====================

/**
 * Get all leave periods with optional filters
 * GET /leave-periods
 */
export const getLeavePeriods = async (filters?: LeavePeriodFilters): Promise<LeavePeriodsResponse> => {
  const params = new URLSearchParams()
  if (filters?.company) params.append('company', filters.company)
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())

  const response = await api.get(`/leave-periods?${params.toString()}`)
  return response.data
}

/**
 * Get single leave period by ID
 * GET /leave-periods/:id
 */
export const getLeavePeriod = async (id: string): Promise<LeavePeriod> => {
  const response = await api.get(`/leave-periods/${id}`)
  return response.data
}

/**
 * Create a new leave period
 * POST /leave-periods
 */
export const createLeavePeriod = async (data: CreateLeavePeriodData): Promise<LeavePeriod> => {
  const response = await api.post('/leave-periods', data)
  return response.data
}

/**
 * Update an existing leave period
 * PATCH /leave-periods/:id
 */
export const updateLeavePeriod = async (id: string, data: UpdateLeavePeriodData): Promise<LeavePeriod> => {
  const response = await api.patch(`/leave-periods/${id}`, data)
  return response.data
}

/**
 * Delete a leave period
 * DELETE /leave-periods/:id
 */
export const deleteLeavePeriod = async (id: string): Promise<void> => {
  await api.delete(`/leave-periods/${id}`)
}

/**
 * Get the currently active leave period
 * GET /leave-periods/active
 */
export const getActivePeriod = async (): Promise<LeavePeriod | null> => {
  const response = await api.get('/leave-periods/active')
  return response.data
}

/**
 * Allocate leaves for a period
 * POST /leave-periods/:id/allocate
 */
export const allocateLeavesForPeriod = async (
  periodId: string,
  data?: Omit<AllocateLeavesRequest, 'periodId'>
): Promise<AllocateLeavesResponse> => {
  const response = await api.post(`/leave-periods/${periodId}/allocate`, data || {})
  return response.data
}

/**
 * Get statistics for a specific period
 * GET /leave-periods/:id/statistics
 */
export const getPeriodStatistics = async (periodId: string): Promise<LeavePeriodStatistics> => {
  const response = await api.get(`/leave-periods/${periodId}/statistics`)
  return response.data
}

/**
 * Activate a leave period
 * POST /leave-periods/:id/activate
 */
export const activateLeavePeriod = async (id: string): Promise<LeavePeriod> => {
  const response = await api.post(`/leave-periods/${id}/activate`)
  return response.data
}

/**
 * Deactivate a leave period
 * POST /leave-periods/:id/deactivate
 */
export const deactivateLeavePeriod = async (id: string): Promise<LeavePeriod> => {
  const response = await api.post(`/leave-periods/${id}/deactivate`)
  return response.data
}

/**
 * Get all leave periods for a specific year
 * GET /leave-periods/year/:year
 */
export const getLeavePeriodsByYear = async (year: number): Promise<LeavePeriod[]> => {
  const response = await api.get(`/leave-periods/year/${year}`)
  return response.data
}

/**
 * Check if a date falls within an active leave period
 * GET /leave-periods/check-date
 */
export const checkDateInPeriod = async (date: string): Promise<{
  inPeriod: boolean
  period?: LeavePeriod
}> => {
  const response = await api.get('/leave-periods/check-date', {
    params: { date }
  })
  return response.data
}

/**
 * Get leave allocation summary for a period
 * GET /leave-periods/:id/allocation-summary
 */
export const getAllocationSummary = async (periodId: string): Promise<{
  totalAllocations: number
  totalDays: number
  byLeaveType: Array<{
    leaveType: string
    count: number
    totalDays: number
  }>
  byDepartment: Array<{
    department: string
    count: number
    totalDays: number
  }>
}> => {
  const response = await api.get(`/leave-periods/${periodId}/allocation-summary`)
  return response.data
}

export default {
  getLeavePeriods,
  getLeavePeriod,
  createLeavePeriod,
  updateLeavePeriod,
  deleteLeavePeriod,
  getActivePeriod,
  allocateLeavesForPeriod,
  getPeriodStatistics,
  activateLeavePeriod,
  deactivateLeavePeriod,
  getLeavePeriodsByYear,
  checkDateInPeriod,
  getAllocationSummary,
}

import api from './api'
import type { LeaveType } from './leaveService'

// Leave Allocation Status
export type LeaveAllocationStatus = 'active' | 'expired'

// Leave Allocation Interface
export interface LeaveAllocation {
  _id: string
  allocationId: string

  // Employee Info
  employeeId: string
  employeeName: string
  employeeNameAr: string
  departmentId: string
  departmentName?: string

  // Leave Type
  leaveType: LeaveType
  leaveTypeName: string
  leaveTypeNameAr: string

  // Period & Policy
  leavePeriodId?: string
  leavePeriodName?: string
  leavePolicyId?: string
  leavePolicyName?: string

  // Date Range
  fromDate: string
  toDate: string

  // Allocation
  newLeavesAllocated: number
  unusedLeaves: number // from previous period

  // Carry Forward
  carryForward: boolean
  carryForwardedLeaves: number
  carryForwardExpiryDate?: string

  // Total & Balance
  totalLeavesAllocated: number // calculated: new + carry forward
  leavesUsed: number
  leavesPending: number // pending approval
  leaveBalance: number // calculated: total - used - pending

  // Encashment
  leavesEncashed: number

  // Status
  status: LeaveAllocationStatus

  // Audit
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName?: string
  lastModifiedBy?: string
  lastModifiedByName?: string
  notes?: string
}

// Create Leave Allocation Data
export interface CreateLeaveAllocationData {
  employeeId: string
  leaveType: LeaveType
  fromDate: string
  toDate: string
  newLeavesAllocated: number
  unusedLeaves?: number
  carryForward?: boolean
  carryForwardedLeaves?: number
  carryForwardExpiryDate?: string
  leavePeriodId?: string
  leavePolicyId?: string
  notes?: string
}

// Update Leave Allocation Data
export interface UpdateLeaveAllocationData extends Partial<CreateLeaveAllocationData> {
  status?: LeaveAllocationStatus
  leavesUsed?: number
  leavesPending?: number
  leavesEncashed?: number
}

// Bulk Allocation Data
export interface BulkAllocationData {
  employeeIds: string[]
  leaveType: LeaveType
  fromDate: string
  toDate: string
  newLeavesAllocated: number
  carryForward?: boolean
  leavePeriodId?: string
  leavePolicyId?: string
  notes?: string
}

// Carry Forward Data
export interface CarryForwardData {
  employeeId: string
  leaveType: LeaveType
  fromPeriodId: string
  toPeriodId: string
  carryForwardDays: number
  expiryDate?: string
}

// Process All Carry Forward Data
export interface ProcessAllCarryForwardData {
  fromPeriodId: string
  toPeriodId: string
  leaveType?: LeaveType
  departmentId?: string
  maxCarryForwardDays?: number
  expiryMonths?: number
}

// Leave Allocation Filters
export interface LeaveAllocationFilters {
  employeeId?: string
  departmentId?: string
  leaveType?: LeaveType
  status?: LeaveAllocationStatus
  leavePeriodId?: string
  fromDate?: string
  toDate?: string
  hasBalance?: boolean
  page?: number
  limit?: number
  sortBy?: 'employeeName' | 'leaveType' | 'fromDate' | 'leaveBalance' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// Leave Allocations Response
export interface LeaveAllocationsResponse {
  data: LeaveAllocation[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  summary?: {
    totalAllocations: number
    totalLeavesAllocated: number
    totalLeavesUsed: number
    totalLeavesBalance: number
    byLeaveType: Record<LeaveType, {
      count: number
      allocated: number
      used: number
      balance: number
    }>
  }
}

// Employee Leave Balance (across all leave types)
export interface EmployeeLeaveBalance {
  employeeId: string
  employeeName: string
  employeeNameAr: string
  departmentId: string
  departmentName?: string
  allocations: Array<{
    leaveType: LeaveType
    leaveTypeName: string
    leaveTypeNameAr: string
    totalAllocated: number
    used: number
    pending: number
    balance: number
    carryForwarded: number
    encashed: number
    fromDate: string
    toDate: string
    status: LeaveAllocationStatus
  }>
  totalBalance: number
}

// Carry Forward Summary
export interface CarryForwardSummary {
  totalEmployees: number
  totalCarryForwarded: number
  byLeaveType: Record<LeaveType, {
    employeeCount: number
    totalDays: number
    averageDays: number
  }>
  byDepartment: Record<string, {
    employeeCount: number
    totalDays: number
  }>
}

// Allocation Summary
export interface AllocationSummary {
  period: {
    id: string
    name: string
    fromDate: string
    toDate: string
  }
  totalEmployees: number
  totalAllocations: number
  totalDaysAllocated: number
  totalDaysUsed: number
  totalDaysBalance: number
  utilizationRate: number // percentage
  byLeaveType: Record<LeaveType, {
    allocations: number
    daysAllocated: number
    daysUsed: number
    daysBalance: number
    utilizationRate: number
  }>
  byDepartment: Record<string, {
    employees: number
    allocations: number
    daysAllocated: number
    daysUsed: number
    daysBalance: number
  }>
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get leave allocations with filters
 */
export const getLeaveAllocations = async (
  filters?: LeaveAllocationFilters
): Promise<LeaveAllocationsResponse> => {
  const params = new URLSearchParams()

  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.leaveType) params.append('leaveType', filters.leaveType)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.leavePeriodId) params.append('leavePeriodId', filters.leavePeriodId)
  if (filters?.fromDate) params.append('fromDate', filters.fromDate)
  if (filters?.toDate) params.append('toDate', filters.toDate)
  if (filters?.hasBalance !== undefined) params.append('hasBalance', String(filters.hasBalance))
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.sortBy) params.append('sortBy', filters.sortBy)
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await api.get(`/leave-allocations?${params.toString()}`)
  return response.data
}

/**
 * Get single leave allocation by ID
 */
export const getLeaveAllocation = async (allocationId: string): Promise<LeaveAllocation> => {
  const response = await api.get(`/leave-allocations/${allocationId}`)
  return response.data
}

/**
 * Create a new leave allocation
 */
export const createLeaveAllocation = async (
  data: CreateLeaveAllocationData
): Promise<LeaveAllocation> => {
  const response = await api.post('/leave-allocations', data)
  return response.data
}

/**
 * Update an existing leave allocation
 */
export const updateLeaveAllocation = async (
  allocationId: string,
  data: UpdateLeaveAllocationData
): Promise<LeaveAllocation> => {
  const response = await api.patch(`/leave-allocations/${allocationId}`, data)
  return response.data
}

/**
 * Delete a leave allocation
 */
export const deleteLeaveAllocation = async (allocationId: string): Promise<void> => {
  await api.delete(`/leave-allocations/${allocationId}`)
}

/**
 * Get employee leave balance for a specific leave type
 */
export const getEmployeeLeaveBalance = async (
  employeeId: string,
  leaveType?: LeaveType
): Promise<{
  employeeId: string
  employeeName: string
  leaveType?: LeaveType
  totalAllocated: number
  used: number
  pending: number
  balance: number
  carryForwarded: number
  encashed: number
}> => {
  const params = new URLSearchParams()
  if (leaveType) params.append('leaveType', leaveType)

  const response = await api.get(
    `/leave-allocations/balance/${employeeId}?${params.toString()}`
  )
  return response.data
}

/**
 * Get all leave allocations for an employee (all leave types)
 */
export const getEmployeeAllAllocations = async (
  employeeId: string
): Promise<EmployeeLeaveBalance> => {
  const response = await api.get(`/leave-allocations/employee/${employeeId}/all`)
  return response.data
}

/**
 * Bulk allocate leaves to multiple employees
 */
export const bulkAllocateLeaves = async (
  data: BulkAllocationData
): Promise<{
  success: boolean
  created: number
  failed: number
  allocations: LeaveAllocation[]
  errors?: Array<{
    employeeId: string
    error: string
  }>
}> => {
  const response = await api.post('/leave-allocations/bulk', data)
  return response.data
}

/**
 * Carry forward leaves from one period to another for a specific employee
 */
export const carryForwardLeaves = async (
  data: CarryForwardData
): Promise<LeaveAllocation> => {
  const response = await api.post('/leave-allocations/carry-forward', data)
  return response.data
}

/**
 * Process carry forward for all eligible employees
 */
export const processCarryForwardForAll = async (
  data: ProcessAllCarryForwardData
): Promise<{
  success: boolean
  processed: number
  failed: number
  totalCarryForwarded: number
  summary: CarryForwardSummary
  errors?: Array<{
    employeeId: string
    error: string
  }>
}> => {
  const response = await api.post('/leave-allocations/carry-forward/process-all', data)
  return response.data
}

/**
 * Expire carry forwarded leaves that have passed their expiry date
 */
export const expireCarryForwardedLeaves = async (
  asOfDate?: string
): Promise<{
  success: boolean
  expired: number
  totalDaysExpired: number
  affectedEmployees: number
}> => {
  const params = new URLSearchParams()
  if (asOfDate) params.append('asOfDate', asOfDate)

  const response = await api.post(
    `/leave-allocations/carry-forward/expire?${params.toString()}`
  )
  return response.data
}

/**
 * Update leave balance when a leave request is approved/used
 * This is called internally when leave requests are approved
 */
export const updateLeaveBalance = async (
  allocationId: string,
  usedDays: number,
  pendingDays?: number
): Promise<LeaveAllocation> => {
  const response = await api.patch(`/leave-allocations/${allocationId}/update-balance`, {
    usedDays,
    pendingDays,
  })
  return response.data
}

/**
 * Encash unused leaves
 */
export const encashLeaves = async (
  allocationId: string,
  daysToEncash: number,
  reason?: string
): Promise<LeaveAllocation> => {
  const response = await api.post(`/leave-allocations/${allocationId}/encash`, {
    daysToEncash,
    reason,
  })
  return response.data
}

/**
 * Get allocation summary for a period
 */
export const getAllocationSummary = async (
  leavePeriodId: string,
  filters?: {
    departmentId?: string
    leaveType?: LeaveType
  }
): Promise<AllocationSummary> => {
  const params = new URLSearchParams()
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.leaveType) params.append('leaveType', filters.leaveType)

  const response = await api.get(
    `/leave-allocations/summary/${leavePeriodId}?${params.toString()}`
  )
  return response.data
}

/**
 * Get carry forward summary
 */
export const getCarryForwardSummary = async (
  fromPeriodId: string,
  toPeriodId: string,
  filters?: {
    departmentId?: string
    leaveType?: LeaveType
  }
): Promise<CarryForwardSummary> => {
  const params = new URLSearchParams()
  params.append('fromPeriodId', fromPeriodId)
  params.append('toPeriodId', toPeriodId)
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.leaveType) params.append('leaveType', filters.leaveType)

  const response = await api.get(`/leave-allocations/carry-forward/summary?${params.toString()}`)
  return response.data
}

/**
 * Get employees with low leave balance
 */
export const getEmployeesWithLowBalance = async (
  leaveType: LeaveType,
  threshold: number = 5
): Promise<Array<{
  employeeId: string
  employeeName: string
  employeeNameAr: string
  departmentId: string
  departmentName: string
  leaveType: LeaveType
  balance: number
  totalAllocated: number
  used: number
}>> => {
  const params = new URLSearchParams()
  params.append('leaveType', leaveType)
  params.append('threshold', threshold.toString())

  const response = await api.get(`/leave-allocations/low-balance?${params.toString()}`)
  return response.data
}

/**
 * Get employees with expiring carry forward
 */
export const getExpiringCarryForward = async (
  daysBeforeExpiry: number = 30
): Promise<Array<{
  employeeId: string
  employeeName: string
  employeeNameAr: string
  departmentId: string
  departmentName: string
  leaveType: LeaveType
  carryForwardedLeaves: number
  expiryDate: string
  daysUntilExpiry: number
}>> => {
  const params = new URLSearchParams()
  params.append('daysBeforeExpiry', daysBeforeExpiry.toString())

  const response = await api.get(`/leave-allocations/expiring-carry-forward?${params.toString()}`)
  return response.data
}

/**
 * Adjust allocation (for corrections)
 */
export const adjustAllocation = async (
  allocationId: string,
  adjustment: {
    reason: string
    adjustmentType: 'add' | 'deduct'
    days: number
    affectField: 'newLeavesAllocated' | 'carryForwardedLeaves' | 'leavesUsed'
  }
): Promise<LeaveAllocation> => {
  const response = await api.post(`/leave-allocations/${allocationId}/adjust`, adjustment)
  return response.data
}

/**
 * Get allocation history for an employee
 */
export const getAllocationHistory = async (
  employeeId: string,
  leaveType?: LeaveType
): Promise<Array<{
  allocationId: string
  period: string
  fromDate: string
  toDate: string
  leaveType: LeaveType
  allocated: number
  used: number
  balance: number
  carryForwarded: number
  encashed: number
  status: LeaveAllocationStatus
}>> => {
  const params = new URLSearchParams()
  if (leaveType) params.append('leaveType', leaveType)

  const response = await api.get(
    `/leave-allocations/history/${employeeId}?${params.toString()}`
  )
  return response.data
}

/**
 * Get allocation statistics
 */
export const getAllocationStatistics = async (
  filters?: {
    year?: number
    departmentId?: string
    leaveType?: LeaveType
  }
): Promise<{
  totalAllocations: number
  totalEmployees: number
  totalDaysAllocated: number
  totalDaysUsed: number
  totalDaysBalance: number
  averageUtilization: number
  byMonth: Array<{
    month: string
    allocations: number
    daysAllocated: number
    daysUsed: number
  }>
  byLeaveType: Record<LeaveType, {
    allocations: number
    daysAllocated: number
    daysUsed: number
    utilizationRate: number
  }>
  topUtilizers: Array<{
    employeeId: string
    employeeName: string
    daysUsed: number
    utilizationRate: number
  }>
}> => {
  const params = new URLSearchParams()
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.departmentId) params.append('departmentId', filters.departmentId)
  if (filters?.leaveType) params.append('leaveType', filters.leaveType)

  const response = await api.get(`/leave-allocations/statistics?${params.toString()}`)
  return response.data
}

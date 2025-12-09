/**
 * Audit Service
 * Handles firm-specific audit log API calls matching the backend API
 * Activity Log & Compliance API
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export interface AuditEntry {
  _id?: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  userId: string
  userName?: string
  userEmail?: string
  userRole?: string
  firmId: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  details?: any
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
}

export interface AuditLogFilters {
  page?: number
  limit?: number
  action?: string
  entityType?: string
  userId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface AuditLogResponse {
  data: AuditEntry[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuditStats {
  totalActions: number
  todayActions: number
  weekActions: number
  monthActions: number
  topActions: Array<{
    action: string
    count: number
  }>
  topUsers: Array<{
    userId: string
    userName: string
    count: number
  }>
  topEntities: Array<{
    entityType: string
    count: number
  }>
  recentActivity: AuditEntry[]
}

export interface AuditOptions {
  actions: string[]
  entityTypes: string[]
  users: Array<{
    id: string
    name: string
    email: string
  }>
}

export interface UserAuditLog {
  userId: string
  userName?: string
  userEmail?: string
  activities: AuditEntry[]
  totalActions: number
}

export interface ExportAuditParams {
  format?: 'json' | 'csv' | 'pdf'
  action?: string
  entityType?: string
  userId?: string
  startDate?: string
  endDate?: string
}

// ==================== API FUNCTIONS ====================

/**
 * Get firm-wide audit log
 * GET /api/audit
 */
export const getAuditLog = async (filters: AuditLogFilters = {}): Promise<AuditLogResponse> => {
  try {
    const response = await apiClient.get('/audit', { params: filters })
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination,
    }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Export audit log for compliance
 * GET /api/audit/export
 */
export const exportAuditLog = async (params: ExportAuditParams = {}): Promise<any> => {
  try {
    const response = await apiClient.get('/audit/export', {
      params,
      responseType: params.format === 'csv' || params.format === 'pdf' ? 'blob' : 'json',
    })

    // If CSV or PDF, return blob
    if (params.format === 'csv' || params.format === 'pdf') {
      return response.data
    }

    // If JSON, return the data
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get audit statistics
 * GET /api/audit/stats
 */
export const getAuditStats = async (): Promise<AuditStats> => {
  try {
    const response = await apiClient.get('/audit/stats')
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get filter options (available actions, entity types, users)
 * GET /api/audit/options
 */
export const getAuditOptions = async (): Promise<AuditOptions> => {
  try {
    const response = await apiClient.get('/audit/options')
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get user-specific activity
 * GET /api/audit/user/:userId
 */
export const getUserAuditLog = async (
  userId: string,
  filters?: {
    startDate?: string
    endDate?: string
    action?: string
    entityType?: string
    limit?: number
    page?: number
  }
): Promise<UserAuditLog> => {
  try {
    const response = await apiClient.get(`/audit/user/${userId}`, { params: filters })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// ==================== DEFAULT EXPORT ====================

export default {
  getAuditLog,
  exportAuditLog,
  getAuditStats,
  getAuditOptions,
  getUserAuditLog,
}

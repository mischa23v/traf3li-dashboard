/**
 * Audit Log Service
 * Handles all comprehensive audit log API calls matching the backend API
 * System-Wide Compliance & Security Audit Trail
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export interface AuditLog {
  _id?: string
  action: string
  entityType: string
  entityId?: string
  userId: string
  userEmail?: string
  userRole?: string
  firmId?: string
  ipAddress?: string
  userAgent?: string
  method?: string
  endpoint?: string
  timestamp: string
  status?: 'success' | 'failure'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  details?: any
  changes?: {
    before?: any
    after?: any
    fields?: string[]
  }
}

export interface AuditLogFilters {
  page?: number
  limit?: number
  action?: string
  entityType?: string
  userId?: string
  startDate?: string
  endDate?: string
  status?: 'success' | 'failure'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  firmId?: string
}

export interface AuditLogPaginatedResponse {
  data: AuditLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UserActivity {
  userId: string
  activities: AuditLog[]
  totalActions: number
  dateRange?: {
    startDate?: string
    endDate?: string
  }
}

export interface SecurityEvent {
  _id: string
  action: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  userId?: string
  userEmail?: string
  ipAddress?: string
  details?: any
  status: 'success' | 'failure'
}

export interface FailedLogin {
  timestamp: string
  email?: string
  ipAddress: string
  userAgent?: string
  reason?: string
}

export interface BruteForceCheck {
  identifier: string
  failedAttempts: number
  timeWindow: string
  isSuspicious: boolean
}

export interface ExportAuditLogParams {
  format?: 'json' | 'csv'
  action?: string
  entityType?: string
  userId?: string
  startDate?: string
  endDate?: string
  status?: string
  severity?: string
  firmId?: string
}

// ==================== API FUNCTIONS ====================

/**
 * List all audit logs with filters
 * GET /api/audit-logs
 */
export const getAuditLogs = async (
  filters: AuditLogFilters = {}
): Promise<AuditLogPaginatedResponse> => {
  try {
    const response = await apiClient.get('/audit-logs', { params: filters })
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination || {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total: response.data.data?.length || 0,
        totalPages: 1,
      },
    }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get audit trail for a specific entity
 * GET /api/audit-logs/entity/:type/:id
 */
export const getAuditTrail = async (
  type: string,
  id: string,
  params?: { limit?: number; page?: number }
): Promise<AuditLog[]> => {
  try {
    const response = await apiClient.get(`/audit-logs/entity/${type}/${id}`, { params })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get activity for a specific user
 * GET /api/audit-logs/user/:id
 */
export const getUserActivity = async (
  id: string,
  params?: {
    startDate?: string
    endDate?: string
    action?: string
    entityType?: string
    limit?: number
    page?: number
  }
): Promise<AuditLog[]> => {
  try {
    const response = await apiClient.get(`/audit-logs/user/${id}`, { params })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get security events (failed logins, permission changes, etc.)
 * GET /api/audit-logs/security
 */
export const getSecurityEvents = async (params?: {
  startDate?: string
  endDate?: string
  severity?: string
  limit?: number
  page?: number
}): Promise<SecurityEvent[]> => {
  try {
    const response = await apiClient.get('/audit-logs/security', { params })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Export audit logs to CSV or JSON
 * GET /api/audit-logs/export
 */
export const exportAuditLog = async (params: ExportAuditLogParams = {}): Promise<any> => {
  try {
    const response = await apiClient.get('/audit-logs/export', { params })

    // If CSV, return the data directly
    if (params.format === 'csv') {
      return response.data
    }

    // If JSON, return the data with metadata
    return {
      data: response.data.data || response.data,
      meta: response.data.meta,
    }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get recent failed login attempts
 * GET /api/audit-logs/failed-logins
 */
export const getFailedLogins = async (hours: number = 1): Promise<FailedLogin[]> => {
  try {
    const response = await apiClient.get('/audit-logs/failed-logins', {
      params: { hours },
    })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get suspicious activity
 * GET /api/audit-logs/suspicious
 */
export const getSuspiciousActivity = async (limit: number = 100): Promise<AuditLog[]> => {
  try {
    const response = await apiClient.get('/audit-logs/suspicious', {
      params: { limit },
    })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Check for brute force attempts
 * POST /api/audit-logs/check-brute-force
 */
export const checkBruteForce = async (
  identifier: string,
  timeWindow: number = 900000
): Promise<BruteForceCheck> => {
  try {
    const response = await apiClient.post('/audit-logs/check-brute-force', {
      identifier,
      timeWindow,
    })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// ==================== DEFAULT EXPORT ====================

export default {
  getAuditLogs,
  getAuditTrail,
  getUserActivity,
  getSecurityEvents,
  exportAuditLog,
  getFailedLogins,
  getSuspiciousActivity,
  checkBruteForce,
}

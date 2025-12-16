/**
 * Complete Audit Trail Service
 * Enterprise feature for comprehensive audit logging
 * Handles both READING and WRITING audit log entries
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Audit Action Types
 * Comprehensive list of all auditable actions in the system
 */
export type AuditAction =
  // CRUD Operations
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'list'
  // Authentication & Session
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_reset'
  | 'password_changed'
  | 'session_expired'
  | 'mfa_enabled'
  | 'mfa_disabled'
  // Permissions & Access
  | 'permission_change'
  | 'role_assigned'
  | 'role_removed'
  | 'access_granted'
  | 'access_denied'
  | 'access_revoked'
  // Settings & Configuration
  | 'settings_change'
  | 'configuration_update'
  | 'system_setting_changed'
  | 'preference_updated'
  // Data Operations
  | 'export'
  | 'import'
  | 'bulk_update'
  | 'bulk_delete'
  | 'restore'
  | 'archive'
  // Approval Workflows
  | 'approve'
  | 'reject'
  | 'submit_for_approval'
  // Financial Operations
  | 'payment_processed'
  | 'invoice_generated'
  | 'refund_issued'
  // Document Operations
  | 'document_uploaded'
  | 'document_downloaded'
  | 'document_shared'
  | 'document_signed'
  // Communication
  | 'email_sent'
  | 'notification_sent'
  | 'message_sent'
  // Integration
  | 'api_key_created'
  | 'api_key_revoked'
  | 'webhook_triggered'
  | 'integration_connected'
  | 'integration_disconnected'
  // Security Events
  | 'security_alert'
  | 'suspicious_activity'
  | 'brute_force_detected'
  | 'ip_blocked'

/**
 * Resource Types
 * All entities that can be audited
 */
export type ResourceType =
  | 'case'
  | 'client'
  | 'invoice'
  | 'payment'
  | 'document'
  | 'task'
  | 'event'
  | 'user'
  | 'team'
  | 'firm'
  | 'contract'
  | 'timesheet'
  | 'expense'
  | 'leave'
  | 'attendance'
  | 'asset'
  | 'bill'
  | 'account'
  | 'transaction'
  | 'report'
  | 'template'
  | 'workflow'
  | 'permission'
  | 'role'
  | 'setting'
  | 'integration'
  | 'webhook'
  | 'api_key'
  | 'notification'
  | 'email'
  | 'message'
  | 'system'

/**
 * Complete Audit Log Entry
 */
export interface AuditLogEntry {
  id?: string
  _id?: string
  timestamp: Date | string
  // User Information
  userId: string
  userName: string
  userEmail?: string
  userRole?: string
  // Action Details
  action: AuditAction
  resource: ResourceType
  resourceId: string
  resourceName?: string
  // Firm/Tenant Context
  firmId?: string
  firmName?: string
  tenantId?: string
  // Technical Details
  ipAddress?: string
  userAgent?: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  endpoint?: string
  // Status & Severity
  status?: 'success' | 'failure' | 'pending'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  // Change Tracking
  details?: Record<string, any>
  changes?: AuditChange[]
  // Metadata
  duration?: number // in milliseconds
  metadata?: Record<string, any>
}

/**
 * Change Tracking for Updates
 */
export interface AuditChange {
  field: string
  oldValue: any
  newValue: any
  displayName?: string
}

/**
 * Filters for querying audit logs
 */
export interface AuditLogFilters {
  page?: number
  limit?: number
  action?: AuditAction | string
  resource?: ResourceType | string
  resourceId?: string
  userId?: string
  firmId?: string
  startDate?: string | Date
  endDate?: string | Date
  status?: 'success' | 'failure' | 'pending'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated response for audit logs
 */
export interface AuditLogResponse {
  data: AuditLogEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Audit statistics
 */
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
  topResources: Array<{
    resource: string
    count: number
  }>
  recentActivity: AuditLogEntry[]
  securityEvents: number
  failedActions: number
}

/**
 * Export parameters
 */
export interface ExportAuditParams {
  format: 'json' | 'csv' | 'pdf'
  filters?: AuditLogFilters
  includeDetails?: boolean
}

/**
 * Audit trail for a specific resource
 */
export interface ResourceAuditTrail {
  resource: ResourceType
  resourceId: string
  resourceName?: string
  totalEvents: number
  events: AuditLogEntry[]
  timeline: Array<{
    date: string
    count: number
  }>
}

/**
 * User activity summary
 */
export interface UserActivitySummary {
  userId: string
  userName: string
  userEmail?: string
  totalActions: number
  lastActivity?: Date | string
  topActions: Array<{
    action: string
    count: number
  }>
  recentActivities: AuditLogEntry[]
}

// ==================== API FUNCTIONS - WRITE OPERATIONS ====================

/**
 * Log an audit event
 * POST /api/audit-logs
 */
export const logAuditEvent = async (entry: Omit<AuditLogEntry, 'id' | '_id' | 'timestamp'>): Promise<AuditLogEntry> => {
  try {
    const response = await apiClient.post('/audit-logs', {
      ...entry,
      timestamp: new Date().toISOString(),
    })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Batch log multiple audit events
 * POST /api/audit-logs/batch
 */
export const logAuditEventsBatch = async (
  entries: Array<Omit<AuditLogEntry, 'id' | '_id' | 'timestamp'>>
): Promise<AuditLogEntry[]> => {
  try {
    const response = await apiClient.post('/audit-logs/batch', {
      entries: entries.map(entry => ({
        ...entry,
        timestamp: new Date().toISOString(),
      })),
    })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// ==================== API FUNCTIONS - READ OPERATIONS ====================

/**
 * Get audit logs with filters and pagination
 * GET /api/audit-logs
 */
export const getAuditLogs = async (filters: AuditLogFilters = {}): Promise<AuditLogResponse> => {
  try {
    const response = await apiClient.get('/audit-logs', { params: filters })
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination || {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      },
    }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get audit trail for a specific resource
 * GET /api/audit-logs/resource/:type/:id
 */
export const getResourceAuditTrail = async (
  resource: ResourceType,
  resourceId: string,
  filters?: Partial<AuditLogFilters>
): Promise<ResourceAuditTrail> => {
  try {
    const response = await apiClient.get(`/audit-logs/resource/${resource}/${resourceId}`, {
      params: filters,
    })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get user activity summary
 * GET /api/audit-logs/user/:userId
 */
export const getUserActivity = async (
  userId: string,
  filters?: Partial<AuditLogFilters>
): Promise<UserActivitySummary> => {
  try {
    const response = await apiClient.get(`/audit-logs/user/${userId}`, {
      params: filters,
    })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get audit statistics
 * GET /api/audit-logs/stats
 */
export const getAuditStats = async (filters?: {
  startDate?: string | Date
  endDate?: string | Date
  firmId?: string
}): Promise<AuditStats> => {
  try {
    const response = await apiClient.get('/audit-logs/stats', { params: filters })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get security events (failed logins, permission changes, etc.)
 * GET /api/audit-logs/security
 */
export const getSecurityEvents = async (filters?: {
  startDate?: string | Date
  endDate?: string | Date
  severity?: 'low' | 'medium' | 'high' | 'critical'
  limit?: number
  page?: number
}): Promise<AuditLogResponse> => {
  try {
    const response = await apiClient.get('/audit-logs/security', { params: filters })
    return {
      data: response.data.data || response.data,
      pagination: response.data.pagination || {
        page: filters?.page || 1,
        limit: filters?.limit || 50,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 1,
      },
    }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Export audit logs to CSV or PDF
 * GET /api/audit-logs/export
 */
export const exportAuditLogs = async (params: ExportAuditParams): Promise<Blob | any> => {
  try {
    const response = await apiClient.get('/audit-logs/export', {
      params: {
        ...params.filters,
        format: params.format,
        includeDetails: params.includeDetails,
      },
      responseType: params.format === 'json' ? 'json' : 'blob',
    })

    // For CSV/PDF, return blob for download
    if (params.format === 'csv' || params.format === 'pdf') {
      return response.data
    }

    // For JSON, return the data
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get failed login attempts (security monitoring)
 * GET /api/audit-logs/failed-logins
 */
export const getFailedLogins = async (params?: {
  hours?: number
  limit?: number
}): Promise<AuditLogEntry[]> => {
  try {
    const response = await apiClient.get('/audit-logs/failed-logins', { params })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get suspicious activities (security monitoring)
 * GET /api/audit-logs/suspicious
 */
export const getSuspiciousActivity = async (params?: {
  limit?: number
  severity?: 'medium' | 'high' | 'critical'
}): Promise<AuditLogEntry[]> => {
  try {
    const response = await apiClient.get('/audit-logs/suspicious', { params })
    return response.data.data || response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Helper to create a change record for updates
 */
export const createChangeRecord = (
  field: string,
  oldValue: any,
  newValue: any,
  displayName?: string
): AuditChange => {
  return {
    field,
    oldValue,
    newValue,
    displayName: displayName || field,
  }
}

/**
 * Helper to detect changes between two objects
 */
export const detectChanges = (
  oldObject: Record<string, any>,
  newObject: Record<string, any>,
  fieldDisplayNames?: Record<string, string>
): AuditChange[] => {
  const changes: AuditChange[] = []

  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(oldObject), ...Object.keys(newObject)])

  allKeys.forEach(key => {
    const oldValue = oldObject[key]
    const newValue = newObject[key]

    // Skip if values are the same
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      return
    }

    // Skip internal/system fields
    if (key.startsWith('_') || key === 'updatedAt' || key === 'createdAt') {
      return
    }

    changes.push(createChangeRecord(
      key,
      oldValue,
      newValue,
      fieldDisplayNames?.[key]
    ))
  })

  return changes
}

/**
 * Helper to download exported audit logs
 */
export const downloadAuditExport = (
  blob: Blob,
  filename: string,
  format: 'csv' | 'pdf'
) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.${format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// ==================== DEFAULT EXPORT ====================

export default {
  // Write operations
  logAuditEvent,
  logAuditEventsBatch,
  // Read operations
  getAuditLogs,
  getResourceAuditTrail,
  getUserActivity,
  getAuditStats,
  getSecurityEvents,
  exportAuditLogs,
  getFailedLogins,
  getSuspiciousActivity,
  // Helpers
  createChangeRecord,
  detectChanges,
  downloadAuditExport,
}

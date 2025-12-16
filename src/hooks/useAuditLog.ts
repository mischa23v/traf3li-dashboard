/**
 * Audit Log Hooks
 * React hooks for audit trail operations - Enterprise feature
 * Provides hooks for logging actions and querying audit logs
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import auditService, {
  AuditLogEntry,
  AuditLogFilters,
  AuditAction,
  ResourceType,
  AuditChange,
  ExportAuditParams,
} from '@/services/auditService'

// ==================== QUERY KEYS ====================

export const auditKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (filters: AuditLogFilters) => [...auditKeys.lists(), filters] as const,
  stats: () => [...auditKeys.all, 'stats'] as const,
  security: () => [...auditKeys.all, 'security'] as const,
  resource: (resource: ResourceType, resourceId: string) =>
    [...auditKeys.all, 'resource', resource, resourceId] as const,
  user: (userId: string) => [...auditKeys.all, 'user', userId] as const,
  failedLogins: () => [...auditKeys.all, 'failed-logins'] as const,
  suspicious: () => [...auditKeys.all, 'suspicious'] as const,
}

// ==================== WRITE HOOKS (Mutations) ====================

/**
 * Hook to log a single audit event
 * Usage: const { mutate: logEvent } = useLogAuditEvent()
 */
export const useLogAuditEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (entry: Omit<AuditLogEntry, 'id' | '_id' | 'timestamp'>) =>
      auditService.logAuditEvent(entry),
    onSuccess: () => {
      // Invalidate audit log queries to refetch latest data
      queryClient.invalidateQueries({ queryKey: auditKeys.all })
    },
    onError: (error: Error) => {
      // Silent fail for audit logs - don't disrupt user experience
      console.error('[Audit] Failed to log event:', error.message)
    },
  })
}

/**
 * Hook to log multiple audit events in batch
 * Usage: const { mutate: logBatch } = useLogAuditEventsBatch()
 */
export const useLogAuditEventsBatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (entries: Array<Omit<AuditLogEntry, 'id' | '_id' | 'timestamp'>>) =>
      auditService.logAuditEventsBatch(entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditKeys.all })
    },
    onError: (error: Error) => {
      console.error('[Audit] Failed to log batch events:', error.message)
    },
  })
}

// ==================== READ HOOKS (Queries) ====================

/**
 * Hook to get audit logs with filters and pagination
 * Usage: const { data, isLoading } = useAuditLogs({ page: 1, limit: 50 })
 */
export const useAuditLogs = (filters: AuditLogFilters = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: () => auditService.getAuditLogs(filters),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to get audit trail for a specific resource
 * Usage: const { data } = useResourceAuditTrail('case', 'case-123')
 */
export const useResourceAuditTrail = (
  resource: ResourceType,
  resourceId: string,
  filters?: Partial<AuditLogFilters>,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: auditKeys.resource(resource, resourceId),
    queryFn: () => auditService.getResourceAuditTrail(resource, resourceId, filters),
    enabled: enabled && !!resourceId,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Hook to get user activity summary
 * Usage: const { data } = useUserActivity('user-123')
 */
export const useUserActivity = (
  userId: string,
  filters?: Partial<AuditLogFilters>,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: auditKeys.user(userId),
    queryFn: () => auditService.getUserActivity(userId, filters),
    enabled: enabled && !!userId,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Hook to get audit statistics
 * Usage: const { data } = useAuditStats()
 */
export const useAuditStats = (
  filters?: {
    startDate?: string | Date
    endDate?: string | Date
    firmId?: string
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: auditKeys.stats(),
    queryFn: () => auditService.getAuditStats(filters),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to get security events
 * Usage: const { data } = useSecurityEvents()
 */
export const useSecurityEvents = (
  filters?: {
    startDate?: string | Date
    endDate?: string | Date
    severity?: 'low' | 'medium' | 'high' | 'critical'
    limit?: number
    page?: number
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: auditKeys.security(),
    queryFn: () => auditService.getSecurityEvents(filters),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to get failed login attempts
 * Usage: const { data } = useFailedLogins({ hours: 24 })
 */
export const useFailedLogins = (
  params?: {
    hours?: number
    limit?: number
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: auditKeys.failedLogins(),
    queryFn: () => auditService.getFailedLogins(params),
    enabled,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })
}

/**
 * Hook to get suspicious activities
 * Usage: const { data } = useSuspiciousActivity()
 */
export const useSuspiciousActivity = (
  params?: {
    limit?: number
    severity?: 'medium' | 'high' | 'critical'
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: auditKeys.suspicious(),
    queryFn: () => auditService.getSuspiciousActivity(params),
    enabled,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })
}

// ==================== EXPORT HOOKS ====================

/**
 * Hook to export audit logs
 * Usage: const { mutate: exportLogs } = useExportAuditLogs()
 */
export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: (params: ExportAuditParams) => auditService.exportAuditLogs(params),
    onSuccess: (data, variables) => {
      if (variables.format === 'csv' || variables.format === 'pdf') {
        // Download the file
        const filename = `audit-logs-${new Date().toISOString().split('T')[0]}`
        auditService.downloadAuditExport(data as Blob, filename, variables.format)
        toast.success('تم تصدير سجلات التدقيق بنجاح')
      } else {
        toast.success('تم تصدير سجلات التدقيق بنجاح')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصدير سجلات التدقيق')
    },
  })
}

// ==================== HELPER HOOKS & UTILITIES ====================

/**
 * Hook that returns a function to log actions with automatic user context
 * This is the most convenient way to log audit events
 *
 * Usage:
 * ```
 * const logAction = useLogAction()
 *
 * // Log an action
 * logAction('create', 'case', caseId, {
 *   caseName: 'New Case',
 *   caseNumber: 'C-2024-001'
 * })
 * ```
 */
export const useLogAction = () => {
  const { mutate } = useLogAuditEvent()
  const user = useAuthStore((state) => state.user)

  return (
    action: AuditAction,
    resource: ResourceType,
    resourceId: string,
    details?: {
      resourceName?: string
      changes?: AuditChange[]
      details?: Record<string, any>
      status?: 'success' | 'failure' | 'pending'
      severity?: 'low' | 'medium' | 'high' | 'critical'
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      endpoint?: string
    }
  ) => {
    if (!user) {
      console.warn('[Audit] Cannot log action: No user context')
      return
    }

    const entry: Omit<AuditLogEntry, 'id' | '_id' | 'timestamp'> = {
      userId: user._id,
      userName: user.username,
      userEmail: user.email,
      userRole: user.role,
      action,
      resource,
      resourceId,
      resourceName: details?.resourceName,
      firmId: user.firmId,
      firmName: user.firm?.name,
      status: details?.status || 'success',
      severity: details?.severity || 'low',
      details: details?.details,
      changes: details?.changes,
      method: details?.method,
      endpoint: details?.endpoint,
      userAgent: navigator.userAgent,
    }

    mutate(entry)
  }
}

/**
 * Specialized hook for logging CRUD operations
 * Automatically determines the action based on the operation type
 *
 * Usage:
 * ```
 * const logCRUD = useLogCRUD()
 *
 * // After creating a case
 * logCRUD.create('case', newCase._id, { resourceName: newCase.name })
 *
 * // After updating with change tracking
 * logCRUD.update('case', caseId, {
 *   resourceName: caseName,
 *   changes: detectChanges(oldData, newData)
 * })
 * ```
 */
export const useLogCRUD = () => {
  const logAction = useLogAction()

  return {
    create: (
      resource: ResourceType,
      resourceId: string,
      details?: Omit<Parameters<typeof logAction>[3], 'method'>
    ) => logAction('create', resource, resourceId, { ...details, method: 'POST' }),

    update: (
      resource: ResourceType,
      resourceId: string,
      details?: Omit<Parameters<typeof logAction>[3], 'method'>
    ) => logAction('update', resource, resourceId, { ...details, method: 'PUT' }),

    delete: (
      resource: ResourceType,
      resourceId: string,
      details?: Omit<Parameters<typeof logAction>[3], 'method'>
    ) => logAction('delete', resource, resourceId, { ...details, method: 'DELETE' }),

    view: (
      resource: ResourceType,
      resourceId: string,
      details?: Omit<Parameters<typeof logAction>[3], 'method'>
    ) => logAction('view', resource, resourceId, { ...details, method: 'GET' }),

    list: (
      resource: ResourceType,
      filters?: Record<string, any>,
      details?: Omit<Parameters<typeof logAction>[3], 'method'>
    ) => logAction('list', resource, 'list', {
      ...details,
      method: 'GET',
      details: { filters },
    }),
  }
}

/**
 * Hook for logging authentication events
 *
 * Usage:
 * ```
 * const logAuth = useLogAuth()
 *
 * // After successful login
 * logAuth.login(userId, { email: userEmail })
 *
 * // After logout
 * logAuth.logout(userId)
 *
 * // After failed login
 * logAuth.loginFailed(email, { reason: 'Invalid password' })
 * ```
 */
export const useLogAuth = () => {
  const logAction = useLogAction()

  return {
    login: (userId: string, details?: { email?: string; method?: string }) =>
      logAction('login', 'user', userId, {
        details,
        status: 'success',
        severity: 'low',
      }),

    logout: (userId: string) =>
      logAction('logout', 'user', userId, {
        status: 'success',
        severity: 'low',
      }),

    loginFailed: (identifier: string, details?: { reason?: string; attempts?: number }) =>
      logAction('login_failed', 'user', identifier, {
        details,
        status: 'failure',
        severity: details?.attempts && details.attempts > 3 ? 'high' : 'medium',
      }),

    passwordChanged: (userId: string) =>
      logAction('password_changed', 'user', userId, {
        status: 'success',
        severity: 'medium',
      }),

    sessionExpired: (userId: string) =>
      logAction('session_expired', 'user', userId, {
        status: 'success',
        severity: 'low',
      }),
  }
}

/**
 * Hook for logging permission and access changes
 *
 * Usage:
 * ```
 * const logPermission = useLogPermission()
 *
 * logPermission.change(userId, {
 *   changes: [{ field: 'role', oldValue: 'user', newValue: 'admin' }]
 * })
 * ```
 */
export const useLogPermission = () => {
  const logAction = useLogAction()

  return {
    change: (
      userId: string,
      details: {
        resourceName?: string
        changes?: AuditChange[]
        details?: Record<string, any>
      }
    ) =>
      logAction('permission_change', 'permission', userId, {
        ...details,
        severity: 'high',
      }),

    roleAssigned: (userId: string, role: string) =>
      logAction('role_assigned', 'role', userId, {
        details: { role },
        severity: 'high',
      }),

    roleRemoved: (userId: string, role: string) =>
      logAction('role_removed', 'role', userId, {
        details: { role },
        severity: 'high',
      }),

    accessGranted: (userId: string, resource: ResourceType, resourceId: string) =>
      logAction('access_granted', resource, resourceId, {
        details: { grantedTo: userId },
        severity: 'medium',
      }),

    accessRevoked: (userId: string, resource: ResourceType, resourceId: string) =>
      logAction('access_revoked', resource, resourceId, {
        details: { revokedFrom: userId },
        severity: 'high',
      }),
  }
}

/**
 * Hook for logging data export operations
 *
 * Usage:
 * ```
 * const logExport = useLogExport()
 *
 * logExport('case', { format: 'csv', filters: { status: 'active' } })
 * ```
 */
export const useLogExport = () => {
  const logAction = useLogAction()

  return (
    resource: ResourceType,
    details: {
      format: 'csv' | 'pdf' | 'json' | 'xlsx'
      filters?: Record<string, any>
      recordCount?: number
    }
  ) =>
    logAction('export', resource, 'export', {
      details,
      severity: 'medium',
    })
}

/**
 * Hook for logging settings changes
 *
 * Usage:
 * ```
 * const logSettings = useLogSettings()
 *
 * logSettings.change('billing', 'billing-settings', {
 *   changes: detectChanges(oldSettings, newSettings)
 * })
 * ```
 */
export const useLogSettings = () => {
  const logAction = useLogAction()

  return {
    change: (
      settingName: string,
      settingId: string,
      details: {
        changes?: AuditChange[]
        details?: Record<string, any>
      }
    ) =>
      logAction('settings_change', 'setting', settingId, {
        resourceName: settingName,
        ...details,
        severity: 'medium',
      }),

    configurationUpdate: (
      configName: string,
      configId: string,
      details: {
        changes?: AuditChange[]
        details?: Record<string, any>
      }
    ) =>
      logAction('configuration_update', 'setting', configId, {
        resourceName: configName,
        ...details,
        severity: 'high',
      }),
  }
}

// ==================== RE-EXPORT UTILITIES ====================

export { detectChanges, createChangeRecord } from '@/services/auditService'

// ==================== DEFAULT EXPORT ====================

export default {
  // Mutation hooks
  useLogAuditEvent,
  useLogAuditEventsBatch,
  useExportAuditLogs,
  // Query hooks
  useAuditLogs,
  useResourceAuditTrail,
  useUserActivity,
  useAuditStats,
  useSecurityEvents,
  useFailedLogins,
  useSuspiciousActivity,
  // Helper hooks
  useLogAction,
  useLogCRUD,
  useLogAuth,
  useLogPermission,
  useLogExport,
  useLogSettings,
}

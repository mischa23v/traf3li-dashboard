/**
 * Enterprise Permission Context Provider
 * Provides permission checking capabilities throughout the application
 */

import React, { createContext, useContext, useCallback, useMemo } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { useCheckPermission, useCheckRelation } from '@/hooks/useEnterprisePermissions'
import type { ModuleKey, PermissionLevel } from '@/types/rbac'
import type { CheckPermissionRequest, PolicyResource, RelationCheck } from '@/types/permissions'

// ==================== TYPES ====================

interface PermissionContextValue {
  // From base permissions hook
  permissions: ReturnType<typeof usePermissions>['permissions']
  isLoading: boolean
  error: string | null

  // Role & Status
  role: string | undefined
  status: string | undefined
  isDeparted: boolean
  isAdminOrOwner: boolean

  // Module-level checks (from existing RBAC)
  canView: (module: ModuleKey) => boolean
  canEdit: (module: ModuleKey) => boolean
  canDelete: (module: ModuleKey) => boolean
  hasPermission: (module: ModuleKey, level?: PermissionLevel) => boolean

  // Enterprise permission checks
  checkPermission: (request: CheckPermissionRequest) => Promise<{ allowed: boolean; reason: string }>
  checkRelation: (check: RelationCheck) => Promise<{ allowed: boolean; path?: string[] }>

  // Utility
  canAccessResource: (resourceType: string, resourceId: string, action: string) => Promise<boolean>
  canManageTeam: boolean
  canViewFinances: boolean
  accessibleModules: ModuleKey[]
}

// ==================== CONTEXT ====================

const PermissionContext = createContext<PermissionContextValue | null>(null)

// ==================== PROVIDER ====================

interface PermissionProviderProps {
  children: React.ReactNode
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const {
    permissions,
    isLoading,
    error,
    role,
    status,
    isDeparted,
    isAdminOrOwner,
    canView: baseCanView,
    canEdit: baseCanEdit,
    canDelete: baseCanDelete,
    hasPermission: baseHasPermission,
    canManageTeam,
    canViewFinances,
    accessibleModules,
  } = usePermissions()

  const checkPermissionMutation = useCheckPermission()
  const checkRelationMutation = useCheckRelation()

  // Wrap module-level checks to ensure they return boolean
  const canView = useCallback(
    (module: ModuleKey) => baseCanView(module),
    [baseCanView]
  )

  const canEdit = useCallback(
    (module: ModuleKey) => baseCanEdit(module),
    [baseCanEdit]
  )

  const canDelete = useCallback(
    (module: ModuleKey) => baseCanDelete(module),
    [baseCanDelete]
  )

  const hasPermission = useCallback(
    (module: ModuleKey, level: PermissionLevel = 'view') => baseHasPermission(module, level),
    [baseHasPermission]
  )

  // Enterprise permission check
  const checkPermission = useCallback(
    async (request: CheckPermissionRequest): Promise<{ allowed: boolean; reason: string }> => {
      try {
        const result = await checkPermissionMutation.mutateAsync(request)
        return {
          allowed: result.allowed,
          reason: result.reason || 'permission_check',
        }
      } catch (error) {
        console.error('Permission check failed:', error)
        return { allowed: false, reason: 'system_error' }
      }
    },
    [checkPermissionMutation]
  )

  // Relation check
  const checkRelation = useCallback(
    async (check: RelationCheck): Promise<{ allowed: boolean; path?: string[] }> => {
      try {
        const result = await checkRelationMutation.mutateAsync(check)
        return result
      } catch (error) {
        console.error('Relation check failed:', error)
        return { allowed: false }
      }
    },
    [checkRelationMutation]
  )

  // Convenience method to check resource access
  const canAccessResource = useCallback(
    async (resourceType: string, resourceId: string, action: string): Promise<boolean> => {
      const request: CheckPermissionRequest = {
        action,
        resource: {
          type: 'entity',
          entityType: resourceType,
          entityId: resourceId,
        },
      }
      const result = await checkPermission(request)
      return result.allowed
    },
    [checkPermission]
  )

  const value = useMemo<PermissionContextValue>(
    () => ({
      permissions,
      isLoading,
      error,
      role,
      status,
      isDeparted: isDeparted(),
      isAdminOrOwner: isAdminOrOwner(),
      canView,
      canEdit,
      canDelete,
      hasPermission,
      checkPermission,
      checkRelation,
      canAccessResource,
      canManageTeam: canManageTeam(),
      canViewFinances: canViewFinances(),
      accessibleModules,
    }),
    [
      permissions,
      isLoading,
      error,
      role,
      status,
      isDeparted,
      isAdminOrOwner,
      canView,
      canEdit,
      canDelete,
      hasPermission,
      checkPermission,
      checkRelation,
      canAccessResource,
      canManageTeam,
      canViewFinances,
      accessibleModules,
    ]
  )

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

// ==================== HOOKS ====================

/**
 * Hook to access the permission context
 */
export function usePermissionContext() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermissionContext must be used within a PermissionProvider')
  }
  return context
}

/**
 * Hook for checking if user can perform action on resource
 */
export function useCanAccess(resourceType: string, resourceId: string, action: string) {
  const { canAccessResource, isLoading } = usePermissionContext()
  const [canAccess, setCanAccess] = React.useState<boolean | null>(null)
  const [checking, setChecking] = React.useState(false)

  React.useEffect(() => {
    if (!resourceType || !resourceId || !action) {
      setCanAccess(null)
      return
    }

    setChecking(true)
    canAccessResource(resourceType, resourceId, action)
      .then(setCanAccess)
      .finally(() => setChecking(false))
  }, [resourceType, resourceId, action, canAccessResource])

  return {
    canAccess,
    isLoading: isLoading || checking,
  }
}

/**
 * Hook for module-level access check
 */
export function useModulePermission(module: ModuleKey) {
  const { canView, canEdit, canDelete, hasPermission, isLoading } = usePermissionContext()

  return {
    canView: canView(module),
    canEdit: canEdit(module),
    canDelete: canDelete(module),
    hasPermission: (level: PermissionLevel) => hasPermission(module, level),
    isLoading,
  }
}

export default PermissionContext

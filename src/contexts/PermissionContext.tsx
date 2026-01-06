/**
 * Enterprise Permission Context Provider
 * Provides permission checking capabilities throughout the application
 * Integrates RBAC, enterprise policies, and UI access control
 */

import React, { createContext, useContext, useCallback, useMemo } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { useCheckPermission, useCheckRelation } from '@/hooks/useEnterprisePermissions'
import { useVisibleSidebar, usePageAccess } from '@/hooks/useUIAccess'
import type { ModuleKey, PermissionLevel } from '@/types/rbac'
import type { CheckPermissionRequest, RelationCheck } from '@/types/permissions'
import type { SidebarItem, PageAccessResult } from '@/types/uiAccess'

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

  // UI Access Control
  sidebarItems: SidebarItem[]
  sidebarLoading: boolean
  checkPageAccess: (path: string) => Promise<PageAccessResult>
  refetchSidebar: () => void

  // Utility
  canAccessResource: (resourceType: string, resourceId: string, action: string) => Promise<boolean>
  canManageTeam: boolean
  canViewFinances: boolean
  accessibleModules: ModuleKey[]
  refetchPermissions: () => void
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
    fetchPermissions,
  } = usePermissions()

  const checkPermissionMutation = useCheckPermission()
  const checkRelationMutation = useCheckRelation()

  // UI Access Control
  const {
    data: sidebarItems,
    isLoading: sidebarLoading,
    refetch: refetchSidebar,
  } = useVisibleSidebar()

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
        if (import.meta.env.DEV) {
          console.warn('[Permission] Check failed:', error)
        }
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
        if (import.meta.env.DEV) {
          console.warn('[Permission] Relation check failed:', error)
        }
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

  // Check page access (UI access control)
  // SECURITY: Fail-closed by default - deny access on error
  const checkPageAccess = useCallback(
    async (path: string): Promise<PageAccessResult> => {
      try {
        const { default: uiAccessService } = await import('@/services/uiAccessService')
        return await uiAccessService.checkPageAccess(path)
      } catch (error) {
        // SECURITY FIX: Fail-closed - deny access on error (was fail-open!)
        // This prevents unauthorized access when permission service is unavailable
        if (import.meta.env.DEV) {
          console.warn('[Permission] Page access check failed - denying access:', error)
        }
        return {
          allowed: false,
          reason: 'permission_check_failed',
          message: 'Unable to verify access permissions. Please try again.',
          messageAr: 'تعذر التحقق من صلاحيات الوصول. يرجى المحاولة مرة أخرى.'
        }
      }
    },
    []
  )

  // Refetch all permissions
  const refetchPermissions = useCallback(() => {
    fetchPermissions()
    refetchSidebar()
  }, [fetchPermissions, refetchSidebar])

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
      sidebarItems: sidebarItems || [],
      sidebarLoading,
      checkPageAccess,
      refetchSidebar,
      canAccessResource,
      canManageTeam: canManageTeam(),
      canViewFinances: canViewFinances(),
      accessibleModules,
      refetchPermissions,
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
      sidebarItems,
      sidebarLoading,
      checkPageAccess,
      refetchSidebar,
      canAccessResource,
      canManageTeam,
      canViewFinances,
      accessibleModules,
      refetchPermissions,
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
 * Includes proper cleanup to prevent memory leaks
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

    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true
    setChecking(true)

    canAccessResource(resourceType, resourceId, action)
      .then((result) => {
        // Only update state if component is still mounted
        if (isMounted) {
          setCanAccess(result)
        }
      })
      .catch(() => {
        // SECURITY: Fail-closed on error
        if (isMounted) {
          setCanAccess(false)
        }
      })
      .finally(() => {
        if (isMounted) {
          setChecking(false)
        }
      })

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false
    }
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

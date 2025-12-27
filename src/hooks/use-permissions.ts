/**
 * Permissions Hook
 * Custom hook for accessing user permissions throughout the application
 * Now uses the Zustand store as the single source of truth
 */

import { useCallback, useEffect } from 'react'
import { usePermissionsStore } from '@/stores/permissions-store'
import { useAuthStore } from '@/stores/auth-store'
import type { ModuleKey, PermissionLevel, SpecialPermissionKey } from '@/types/rbac'
import {
  canManageTeam as canManageTeamHelper,
  canViewFinances as canViewFinancesHelper,
  canAccessHR as canAccessHRHelper,
  getAccessibleModules,
  getPermissionLevel,
} from '@/lib/permissions'

/**
 * Main permissions hook
 * Provides access to user permissions and helper functions
 * All permission checks use the Zustand store methods directly
 */
export function usePermissions() {
  // Get state from store
  const permissions = usePermissionsStore((state) => state.permissions)
  const isLoading = usePermissionsStore((state) => state.isLoading)
  const error = usePermissionsStore((state) => state.error)
  const noFirmAssociated = usePermissionsStore((state) => state.noFirmAssociated)

  // Get actions from store
  const fetchPermissions = usePermissionsStore((state) => state.fetchPermissions)

  // Get permission check methods from store (single source of truth)
  const hasPermissionStore = usePermissionsStore((state) => state.hasPermission)
  const canViewStore = usePermissionsStore((state) => state.canView)
  const canEditStore = usePermissionsStore((state) => state.canEdit)
  const canDeleteStore = usePermissionsStore((state) => state.canDelete)
  const hasSpecialPermissionStore = usePermissionsStore((state) => state.hasSpecialPermission)
  const isDepartedStore = usePermissionsStore((state) => state.isDeparted)
  const isAdminOrOwnerStore = usePermissionsStore((state) => state.isAdminOrOwner)

  const user = useAuthStore((state) => state.user)

  // Fetch permissions on mount if user is authenticated and has a firm
  useEffect(() => {
    if (user && (user.firmId || user.role === 'lawyer') && !permissions && !isLoading) {
      fetchPermissions()
    }
  }, [user, permissions, isLoading, fetchPermissions])

  // Memoized wrappers for store methods
  // These maintain the same interface as before but use the store methods
  const hasPermission = useCallback(
    (module: ModuleKey, level: PermissionLevel = 'view') => {
      return hasPermissionStore(module, level)
    },
    [hasPermissionStore]
  )

  const canView = useCallback(
    (module: ModuleKey) => canViewStore(module),
    [canViewStore]
  )

  const canEdit = useCallback(
    (module: ModuleKey) => canEditStore(module),
    [canEditStore]
  )

  const canDelete = useCallback(
    (module: ModuleKey) => canDeleteStore(module),
    [canDeleteStore]
  )

  const hasSpecial = useCallback(
    (permission: SpecialPermissionKey) =>
      hasSpecialPermissionStore(permission),
    [hasSpecialPermissionStore]
  )

  const isDeparted = useCallback(() => isDepartedStore(), [isDepartedStore])

  const isAdminOrOwner = useCallback(
    () => isAdminOrOwnerStore(),
    [isAdminOrOwnerStore]
  )

  // These helpers use the lib/permissions functions since they're not in the store
  // They still use the permissions from the store, so there's only one source of truth for data
  const canManageTeam = useCallback(
    () => canManageTeamHelper(permissions),
    [permissions]
  )

  const canViewFinances = useCallback(
    () => canViewFinancesHelper(permissions),
    [permissions]
  )

  const canAccessHR = useCallback(
    () => canAccessHRHelper(permissions),
    [permissions]
  )

  const getModuleLevel = useCallback(
    (module: ModuleKey) => getPermissionLevel(permissions, module),
    [permissions]
  )

  const accessibleModules = getAccessibleModules(permissions)

  return {
    // Raw state
    permissions,
    isLoading,
    error,
    noFirmAssociated,

    // Actions
    fetchPermissions,

    // Permission checks (using store methods)
    hasPermission,
    canView,
    canEdit,
    canDelete,
    hasSpecial,
    isDeparted,
    isAdminOrOwner,
    canManageTeam,
    canViewFinances,
    canAccessHR,

    // Utility
    getModuleLevel,
    accessibleModules,

    // Role info
    role: permissions?.role,
    status: permissions?.status,
  }
}

/**
 * Hook to check if a specific module is accessible
 * Useful for conditional rendering
 */
export function useModuleAccess(module: ModuleKey) {
  const { canView, canEdit, canDelete, getModuleLevel, isLoading } = usePermissions()

  return {
    canView: canView(module),
    canEdit: canEdit(module),
    canDelete: canDelete(module),
    level: getModuleLevel(module),
    isLoading,
  }
}

/**
 * Hook to check admin/owner status
 */
export function useIsAdmin() {
  const { isAdminOrOwner, role, isLoading } = usePermissions()
  return {
    isAdmin: isAdminOrOwner(),
    role,
    isLoading,
  }
}

/**
 * Hook specifically for departed users
 */
export function useDepartedStatus() {
  const { permissions, isDeparted, isLoading } = usePermissions()

  return {
    isDeparted: isDeparted(),
    restrictions: permissions?.restrictions,
    assignedCaseIds: permissions?.restrictions?.assignedCaseIds || [],
    isLoading,
  }
}

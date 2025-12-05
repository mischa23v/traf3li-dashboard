/**
 * Permissions Hook
 * Custom hook for accessing user permissions throughout the application
 */

import { useCallback, useEffect } from 'react'
import { usePermissionsStore } from '@/stores/permissions-store'
import { useAuthStore } from '@/stores/auth-store'
import type { ModuleKey, PermissionLevel, SpecialPermissionKey } from '@/types/rbac'
import {
  hasPermission as hasPermissionHelper,
  canView as canViewHelper,
  canEdit as canEditHelper,
  canDelete as canDeleteHelper,
  hasSpecialPermission as hasSpecialPermissionHelper,
  isDepartedUser,
  isAdminOrOwner as isAdminOrOwnerHelper,
  canManageTeam as canManageTeamHelper,
  canViewFinances as canViewFinancesHelper,
  getAccessibleModules,
  getPermissionLevel,
} from '@/lib/permissions'

/**
 * Main permissions hook
 * Provides access to user permissions and helper functions
 */
export function usePermissions() {
  const permissions = usePermissionsStore((state) => state.permissions)
  const isLoading = usePermissionsStore((state) => state.isLoading)
  const error = usePermissionsStore((state) => state.error)
  const fetchPermissions = usePermissionsStore((state) => state.fetchPermissions)
  const user = useAuthStore((state) => state.user)

  // Fetch permissions on mount if user is authenticated and has a firm
  useEffect(() => {
    if (user && (user.firmId || user.role === 'lawyer') && !permissions && !isLoading) {
      fetchPermissions()
    }
  }, [user, permissions, isLoading, fetchPermissions])

  // Memoized helper functions
  const hasPermission = useCallback(
    (module: ModuleKey, level: PermissionLevel = 'view') => {
      return hasPermissionHelper(permissions, module, level)
    },
    [permissions]
  )

  const canView = useCallback(
    (module: ModuleKey) => canViewHelper(permissions, module),
    [permissions]
  )

  const canEdit = useCallback(
    (module: ModuleKey) => canEditHelper(permissions, module),
    [permissions]
  )

  const canDelete = useCallback(
    (module: ModuleKey) => canDeleteHelper(permissions, module),
    [permissions]
  )

  const hasSpecial = useCallback(
    (permission: SpecialPermissionKey) =>
      hasSpecialPermissionHelper(permissions, permission),
    [permissions]
  )

  const isDeparted = useCallback(() => isDepartedUser(permissions), [permissions])

  const isAdminOrOwner = useCallback(
    () => isAdminOrOwnerHelper(permissions),
    [permissions]
  )

  const canManageTeam = useCallback(
    () => canManageTeamHelper(permissions),
    [permissions]
  )

  const canViewFinances = useCallback(
    () => canViewFinancesHelper(permissions),
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

    // Actions
    fetchPermissions,

    // Permission checks
    hasPermission,
    canView,
    canEdit,
    canDelete,
    hasSpecial,
    isDeparted,
    isAdminOrOwner,
    canManageTeam,
    canViewFinances,

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

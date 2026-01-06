/**
 * PermissionGuard Component
 * Conditionally renders children based on permission checks
 */

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import type { ModuleKey, PermissionLevel } from '@/types/rbac'
import type { CheckPermissionRequest, PolicyResource } from '@/types/permissions'
import { useCheckPermission } from '@/hooks/useEnterprisePermissions'

// ==================== TYPES ====================

interface BasePermissionGuardProps {
  /** Content to show while checking permissions */
  fallback?: React.ReactNode
  /** Content to show when permission is denied */
  unauthorized?: React.ReactNode
  /** Whether to render null instead of unauthorized content */
  hideOnUnauthorized?: boolean
  children: React.ReactNode
}

interface ModulePermissionGuardProps extends BasePermissionGuardProps {
  /** Module to check permission for */
  module: ModuleKey
  /** Required permission level */
  level?: PermissionLevel
  /** Don't check permission - just render children */
  bypass?: boolean
}

interface ActionPermissionGuardProps extends BasePermissionGuardProps {
  /** Action to check (e.g., 'create', 'read', 'update', 'delete') */
  action: string
  /** Resource to check permission for */
  resource: PolicyResource
}

interface RoleGuardProps extends BasePermissionGuardProps {
  /** Roles that are allowed */
  allowedRoles: string[]
}

interface SpecialPermissionGuardProps extends BasePermissionGuardProps {
  /** Special permission to check */
  permission: 'canApproveInvoices' | 'canManageRetainers' | 'canExportData' | 'canDeleteRecords' | 'canViewFinance' | 'canManageTeam' | 'canAccessHR'
}

// ==================== COMPONENTS ====================

/**
 * Guard based on module permission level
 */
export function ModuleGuard({
  module,
  level = 'view',
  bypass = false,
  fallback = null,
  unauthorized = null,
  hideOnUnauthorized = true,
  children,
}: ModulePermissionGuardProps) {
  const { hasPermission, isLoading } = usePermissions()

  if (bypass) {
    return <>{children}</>
  }

  if (isLoading) {
    return <>{fallback}</>
  }

  const hasAccess = hasPermission(module, level)

  if (!hasAccess) {
    return hideOnUnauthorized ? null : <>{unauthorized}</>
  }

  return <>{children}</>
}

/**
 * Guard for view permission
 */
export function ViewGuard({
  module,
  children,
  ...props
}: Omit<ModulePermissionGuardProps, 'level'>) {
  return (
    <ModuleGuard module={module} level="view" {...props}>
      {children}
    </ModuleGuard>
  )
}

/**
 * Guard for edit permission
 */
export function EditGuard({
  module,
  children,
  ...props
}: Omit<ModulePermissionGuardProps, 'level'>) {
  return (
    <ModuleGuard module={module} level="edit" {...props}>
      {children}
    </ModuleGuard>
  )
}

/**
 * Guard for full/delete permission
 */
export function DeleteGuard({
  module,
  children,
  ...props
}: Omit<ModulePermissionGuardProps, 'level'>) {
  return (
    <ModuleGuard module={module} level="full" {...props}>
      {children}
    </ModuleGuard>
  )
}

/**
 * Guard based on action/resource (enterprise permission check)
 */
export function ActionGuard({
  action,
  resource,
  fallback = null,
  unauthorized = null,
  hideOnUnauthorized = true,
  children,
}: ActionPermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const checkPermission = useCheckPermission()
  // Track if permission check was already initiated to prevent infinite loops
  const hasCheckedRef = useRef(false)
  // Create a stable key for the permission request
  const requestKey = `${action}:${resource}`

  useEffect(() => {
    // Reset check flag when request key changes
    hasCheckedRef.current = false
    setHasAccess(null)
  }, [requestKey])

  useEffect(() => {
    // Prevent infinite API calls - only check once per request key
    if (hasCheckedRef.current) return
    hasCheckedRef.current = true

    const request: CheckPermissionRequest = { action, resource }
    checkPermission.mutateAsync(request)
      .then((result) => setHasAccess(result.allowed))
      .catch(() => setHasAccess(false))
    // Only depend on action and resource, not checkPermission (which changes on every render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, resource])

  if (hasAccess === null) {
    return <>{fallback}</>
  }

  if (!hasAccess) {
    return hideOnUnauthorized ? null : <>{unauthorized}</>
  }

  return <>{children}</>
}

/**
 * Guard based on user role
 */
export function RoleGuard({
  allowedRoles,
  fallback = null,
  unauthorized = null,
  hideOnUnauthorized = true,
  children,
}: RoleGuardProps) {
  const { role, isLoading } = usePermissions()

  if (isLoading) {
    return <>{fallback}</>
  }

  const hasAccess = role && allowedRoles.includes(role)

  if (!hasAccess) {
    return hideOnUnauthorized ? null : <>{unauthorized}</>
  }

  return <>{children}</>
}

/**
 * Guard for admin or owner only
 */
export function AdminGuard({
  children,
  ...props
}: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['owner', 'admin']} {...props}>
      {children}
    </RoleGuard>
  )
}

/**
 * Guard for owner only
 */
export function OwnerGuard({
  children,
  ...props
}: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['owner']} {...props}>
      {children}
    </RoleGuard>
  )
}

/**
 * Guard based on special permission
 */
export function SpecialPermissionGuard({
  permission,
  fallback = null,
  unauthorized = null,
  hideOnUnauthorized = true,
  children,
}: SpecialPermissionGuardProps) {
  const { hasSpecial, isLoading } = usePermissions()

  if (isLoading) {
    return <>{fallback}</>
  }

  const hasAccess = hasSpecial(permission)

  if (!hasAccess) {
    return hideOnUnauthorized ? null : <>{unauthorized}</>
  }

  return <>{children}</>
}

/**
 * Guard for non-departed users only
 */
export function ActiveUserGuard({
  children,
  fallback = null,
  unauthorized = null,
  hideOnUnauthorized = true,
}: BasePermissionGuardProps) {
  const { isDeparted, isLoading } = usePermissions()

  if (isLoading) {
    return <>{fallback}</>
  }

  if (isDeparted()) {
    return hideOnUnauthorized ? null : <>{unauthorized}</>
  }

  return <>{children}</>
}

/**
 * Main PermissionGuard - flexible guard that can check different permission types
 */
export function PermissionGuard({
  module,
  level,
  action,
  resource,
  roles,
  specialPermission,
  requireActive = false,
  requireAdmin = false,
  fallback = null,
  unauthorized = null,
  hideOnUnauthorized = true,
  children,
}: {
  module?: ModuleKey
  level?: PermissionLevel
  action?: string
  resource?: PolicyResource
  roles?: string[]
  specialPermission?: SpecialPermissionGuardProps['permission']
  requireActive?: boolean
  requireAdmin?: boolean
  fallback?: React.ReactNode
  unauthorized?: React.ReactNode
  hideOnUnauthorized?: boolean
  children: React.ReactNode
}) {
  const { hasPermission, hasSpecial, isDeparted, isAdminOrOwner, role, isLoading } = usePermissions()
  const checkPermission = useCheckPermission()
  const [actionAllowed, setActionAllowed] = useState<boolean | null>(action ? null : true)

  // Check action permission if provided
  useEffect(() => {
    if (action && resource) {
      const request: CheckPermissionRequest = { action, resource }
      checkPermission.mutateAsync(request)
        .then((result) => setActionAllowed(result.allowed))
        .catch(() => setActionAllowed(false))
    }
  }, [action, resource, checkPermission])

  if (isLoading || actionAllowed === null) {
    return <>{fallback}</>
  }

  // Check all conditions
  let hasAccess = true

  // Check active user requirement
  if (requireActive && isDeparted()) {
    hasAccess = false
  }

  // Check admin requirement
  if (requireAdmin && !isAdminOrOwner()) {
    hasAccess = false
  }

  // Check module permission
  if (module && !hasPermission(module, level || 'view')) {
    hasAccess = false
  }

  // Check roles
  if (roles && role && !roles.includes(role)) {
    hasAccess = false
  }

  // Check special permission
  if (specialPermission && !hasSpecial(specialPermission)) {
    hasAccess = false
  }

  // Check action permission
  if (action && !actionAllowed) {
    hasAccess = false
  }

  if (!hasAccess) {
    return hideOnUnauthorized ? null : <>{unauthorized}</>
  }

  return <>{children}</>
}

export default PermissionGuard

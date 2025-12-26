/**
 * Permission Helper Utilities
 * Functions for checking and managing user permissions
 */

import type {
  UserPermissions,
  ModuleKey,
  PermissionLevel,
  SpecialPermissionKey,
  FirmRole,
  FirmMemberStatus,
} from '@/types/rbac'
import { PERMISSION_LEVELS } from '@/types/rbac'

/**
 * Check if user has at least the specified permission level for a module
 * @param permissions - User's permissions object
 * @param module - The module to check
 * @param level - The minimum required permission level (default: 'view')
 * @returns boolean - Whether the user has the required permission
 */
export function hasPermission(
  permissions: UserPermissions | null,
  module: ModuleKey,
  level: PermissionLevel = 'view'
): boolean {
  if (!permissions) return false

  const userLevel = permissions.modules[module] || 'none'
  return PERMISSION_LEVELS[userLevel] >= PERMISSION_LEVELS[level]
}

/**
 * Check if user can view a module
 * @param permissions - User's permissions object
 * @param module - The module to check
 * @returns boolean - Whether the user can view the module
 */
export function canView(
  permissions: UserPermissions | null,
  module: ModuleKey
): boolean {
  return hasPermission(permissions, module, 'view')
}

/**
 * Check if user can edit in a module
 * @param permissions - User's permissions object
 * @param module - The module to check
 * @returns boolean - Whether the user can edit in the module
 */
export function canEdit(
  permissions: UserPermissions | null,
  module: ModuleKey
): boolean {
  return hasPermission(permissions, module, 'edit')
}

/**
 * Check if user has full access to a module (can delete)
 * @param permissions - User's permissions object
 * @param module - The module to check
 * @returns boolean - Whether the user has full access
 */
export function canDelete(
  permissions: UserPermissions | null,
  module: ModuleKey
): boolean {
  return hasPermission(permissions, module, 'full')
}

/**
 * Check if user has a special permission
 * @param permissions - User's permissions object
 * @param permission - The special permission to check
 * @returns boolean - Whether the user has the special permission
 */
export function hasSpecialPermission(
  permissions: UserPermissions | null,
  permission: SpecialPermissionKey
): boolean {
  if (!permissions) return false
  return permissions.special?.[permission] === true
}

/**
 * Check if user is departed
 * @param permissions - User's permissions object
 * @returns boolean - Whether the user is departed
 */
export function isDepartedUser(permissions: UserPermissions | null): boolean {
  if (!permissions) return false
  return permissions.isDeparted || permissions.role === 'departed'
}

/**
 * Check if user has admin-level access (owner or admin)
 * @param permissions - User's permissions object
 * @returns boolean - Whether the user is an admin or owner
 */
export function isAdminOrOwner(permissions: UserPermissions | null): boolean {
  if (!permissions) return false
  return permissions.role === 'owner' || permissions.role === 'admin'
}

/**
 * Check if user can manage team members
 * @param permissions - User's permissions object
 * @returns boolean - Whether the user can manage team
 */
export function canManageTeam(permissions: UserPermissions | null): boolean {
  if (!permissions) return false
  return (
    isAdminOrOwner(permissions) ||
    hasSpecialPermission(permissions, 'canManageTeam')
  )
}

/**
 * Check if user can view financial data
 * @param permissions - User's permissions object
 * @returns boolean - Whether the user can view finances
 */
export function canViewFinances(permissions: UserPermissions | null): boolean {
  if (!permissions) return false
  return (
    hasSpecialPermission(permissions, 'canViewFinance') ||
    canView(permissions, 'invoices') ||
    canView(permissions, 'payments') ||
    canView(permissions, 'expenses')
  )
}

/**
 * Check if user can approve invoices
 * @param permissions - User's permissions object
 * @returns boolean - Whether the user can approve invoices
 */
export function canApproveInvoices(permissions: UserPermissions | null): boolean {
  return hasSpecialPermission(permissions, 'canApproveInvoices')
}

/**
 * Check if user can export data
 * @param permissions - User's permissions object
 * @returns boolean - Whether the user can export data
 */
export function canExportData(permissions: UserPermissions | null): boolean {
  return hasSpecialPermission(permissions, 'canExportData')
}

/**
 * Check if user can access HR module
 * @param permissions - User's permissions object
 * @returns boolean - Whether the user can access HR
 */
export function canAccessHR(permissions: UserPermissions | null): boolean {
  if (!permissions) return false
  return (
    isAdminOrOwner(permissions) ||
    hasSpecialPermission(permissions, 'canAccessHR') ||
    canView(permissions, 'hr')
  )
}

/**
 * Get the permission level for a module
 * @param permissions - User's permissions object
 * @param module - The module to check
 * @returns PermissionLevel - The user's permission level for the module
 */
export function getPermissionLevel(
  permissions: UserPermissions | null,
  module: ModuleKey
): PermissionLevel {
  if (!permissions) return 'none'
  return permissions.modules[module] || 'none'
}

/**
 * Check if user role is one of the specified roles
 * @param permissions - User's permissions object
 * @param roles - Array of roles to check against
 * @returns boolean - Whether the user has one of the specified roles
 */
export function hasRole(
  permissions: UserPermissions | null,
  roles: FirmRole[]
): boolean {
  if (!permissions) return false
  return roles.includes(permissions.role)
}

/**
 * Check if user status is active
 * @param permissions - User's permissions object
 * @returns boolean - Whether the user is active
 */
export function isActiveUser(permissions: UserPermissions | null): boolean {
  if (!permissions) return false
  return permissions.status === 'active'
}

/**
 * Get list of accessible modules for the user
 * @param permissions - User's permissions object
 * @returns ModuleKey[] - Array of accessible module keys
 */
export function getAccessibleModules(
  permissions: UserPermissions | null
): ModuleKey[] {
  if (!permissions) return []

  const modules = Object.entries(permissions.modules) as [ModuleKey, PermissionLevel][]
  return modules
    .filter(([_, level]) => level !== 'none')
    .map(([key]) => key)
}

/**
 * Check if a case is accessible to a departed user
 * @param permissions - User's permissions object
 * @param caseId - The case ID to check
 * @returns boolean - Whether the case is accessible
 */
export function canAccessCase(
  permissions: UserPermissions | null,
  caseId: string
): boolean {
  if (!permissions) return false

  // Non-departed users with case view permission can access
  if (!permissions.isDeparted && canView(permissions, 'cases')) {
    return true
  }

  // Departed users can only access their assigned cases
  if (permissions.isDeparted && permissions.restrictions) {
    return permissions.restrictions.assignedCaseIds.includes(caseId)
  }

  return false
}

/**
 * Create default permissions for a given role
 * Useful for UI previews or fallback values
 */
export function getDefaultPermissionsForRole(role: FirmRole): UserPermissions {
  const basePermissions: UserPermissions = {
    role,
    status: 'active',
    isDeparted: false,
    modules: {
      clients: 'none',
      cases: 'none',
      leads: 'none',
      invoices: 'none',
      payments: 'none',
      expenses: 'none',
      documents: 'none',
      tasks: 'none',
      events: 'none',
      timeTracking: 'none',
      reports: 'none',
      settings: 'none',
      team: 'none',
      hr: 'none',
    },
    special: {
      canApproveInvoices: false,
      canManageRetainers: false,
      canExportData: false,
      canDeleteRecords: false,
      canViewFinance: false,
      canManageTeam: false,
      canAccessHR: false,
    },
    restrictions: null,
  }

  switch (role) {
    case 'owner':
    case 'admin':
      return {
        ...basePermissions,
        modules: {
          clients: 'full',
          cases: 'full',
          leads: 'full',
          invoices: 'full',
          payments: 'full',
          expenses: 'full',
          documents: 'full',
          tasks: 'full',
          events: 'full',
          timeTracking: 'full',
          reports: 'full',
          settings: 'full',
          team: 'full',
          hr: 'full',
        },
        special: {
          canApproveInvoices: true,
          canManageRetainers: true,
          canExportData: true,
          canDeleteRecords: true,
          canViewFinance: true,
          canManageTeam: true,
        },
      }

    case 'partner':
      return {
        ...basePermissions,
        modules: {
          clients: 'full',
          cases: 'full',
          leads: 'full',
          invoices: 'full',
          payments: 'edit',
          expenses: 'edit',
          documents: 'full',
          tasks: 'full',
          events: 'full',
          timeTracking: 'full',
          reports: 'full',
          settings: 'view',
          team: 'view',
          hr: 'view',
        },
        special: {
          canApproveInvoices: true,
          canManageRetainers: true,
          canExportData: true,
          canDeleteRecords: false,
          canViewFinance: true,
          canManageTeam: false,
        },
      }

    case 'lawyer':
      return {
        ...basePermissions,
        modules: {
          clients: 'edit',
          cases: 'edit',
          leads: 'edit',
          invoices: 'edit',
          payments: 'view',
          expenses: 'edit',
          documents: 'edit',
          tasks: 'full',
          events: 'full',
          timeTracking: 'full',
          reports: 'view',
          settings: 'none',
          team: 'view',
          hr: 'none',
        },
        special: {
          canApproveInvoices: false,
          canManageRetainers: false,
          canExportData: false,
          canDeleteRecords: false,
          canViewFinance: false,
          canManageTeam: false,
        },
      }

    case 'paralegal':
      return {
        ...basePermissions,
        modules: {
          clients: 'view',
          cases: 'edit',
          leads: 'view',
          invoices: 'view',
          payments: 'none',
          expenses: 'none',
          documents: 'edit',
          tasks: 'full',
          events: 'edit',
          timeTracking: 'full',
          reports: 'none',
          settings: 'none',
          team: 'view',
          hr: 'none',
        },
        special: {
          canApproveInvoices: false,
          canManageRetainers: false,
          canExportData: false,
          canDeleteRecords: false,
          canViewFinance: false,
          canManageTeam: false,
        },
      }

    case 'secretary':
      return {
        ...basePermissions,
        modules: {
          clients: 'edit',
          cases: 'view',
          leads: 'edit',
          invoices: 'view',
          payments: 'view',
          expenses: 'none',
          documents: 'edit',
          tasks: 'edit',
          events: 'full',
          timeTracking: 'view',
          reports: 'none',
          settings: 'none',
          team: 'view',
          hr: 'none',
        },
        special: {
          canApproveInvoices: false,
          canManageRetainers: false,
          canExportData: false,
          canDeleteRecords: false,
          canViewFinance: false,
          canManageTeam: false,
        },
      }

    case 'accountant':
      return {
        ...basePermissions,
        modules: {
          clients: 'view',
          cases: 'none',
          leads: 'none',
          invoices: 'full',
          payments: 'full',
          expenses: 'full',
          documents: 'view',
          tasks: 'edit',
          events: 'edit',
          timeTracking: 'view',
          reports: 'full',
          settings: 'none',
          team: 'view',
          hr: 'view',
        },
        special: {
          canApproveInvoices: true,
          canManageRetainers: true,
          canExportData: true,
          canDeleteRecords: false,
          canViewFinance: true,
          canManageTeam: false,
        },
      }

    case 'departed':
      return {
        ...basePermissions,
        status: 'departed',
        isDeparted: true,
        modules: {
          clients: 'none',
          cases: 'view',
          leads: 'none',
          invoices: 'none',
          payments: 'none',
          expenses: 'none',
          documents: 'view',
          tasks: 'view',
          events: 'view',
          timeTracking: 'view',
          reports: 'none',
          settings: 'none',
          team: 'none',
          hr: 'none',
        },
        restrictions: {
          canOnlyViewOwnData: true,
          blockedModules: ['clients', 'leads', 'invoices', 'payments', 'expenses', 'reports', 'settings', 'team', 'hr'],
          readOnlyModules: ['cases', 'documents', 'tasks', 'events', 'timeTracking'],
          assignedCaseIds: [],
        },
      }

    default:
      return basePermissions
  }
}

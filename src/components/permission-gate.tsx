/**
 * Permission Gate Components
 * Components for conditionally rendering UI based on user permissions
 */

import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { usePermissions, useModuleAccess, useDepartedStatus } from '@/hooks/use-permissions'
import type { ModuleKey, PermissionLevel, SpecialPermissionKey, FirmRole } from '@/types/rbac'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ShieldX, Lock, AlertTriangle } from 'lucide-react'

interface PermissionGateProps {
  children: ReactNode
  /**
   * Fallback content to show when permission is denied
   * If not provided, nothing will be rendered
   */
  fallback?: ReactNode
  /**
   * Show an access denied message instead of hiding content
   */
  showDeniedMessage?: boolean
}

interface ModuleGateProps extends PermissionGateProps {
  /**
   * The module to check permissions for
   */
  module: ModuleKey
  /**
   * The minimum permission level required (default: 'view')
   */
  level?: PermissionLevel
}

interface SpecialPermissionGateProps extends PermissionGateProps {
  /**
   * The special permission to check
   */
  permission: SpecialPermissionKey
}

interface RoleGateProps extends PermissionGateProps {
  /**
   * Roles that are allowed to see the content
   */
  roles: FirmRole[]
}

/**
 * Access Denied Component
 * Displayed when a user doesn't have permission
 */
function AccessDenied({ message }: { message?: string }) {
  const { t } = useTranslation()
  return (
    <Alert variant="destructive" className="my-4">
      <ShieldX className="h-4 w-4" />
      <AlertTitle>{t('permissionGate.unauthorized')}</AlertTitle>
      <AlertDescription>
        {message || t('permissionGate.noAccess')}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Departed User Warning
 * Displayed for departed users trying to access restricted content
 */
function DepartedWarning() {
  const { t } = useTranslation()
  return (
    <Alert className="my-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">
        {t('permissionGate.limitedAccount')}
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
        {t('permissionGate.restrictedAccess')}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Module Gate
 * Shows content only if user has the required permission level for a module
 */
export function ModuleGate({
  children,
  module,
  level = 'view',
  fallback,
  showDeniedMessage,
}: ModuleGateProps) {
  const { hasPermission, isLoading } = usePermissions()

  // Don't render anything while loading
  if (isLoading) {
    return null
  }

  const hasAccess = hasPermission(module, level)

  if (!hasAccess) {
    if (showDeniedMessage) {
      return <AccessDenied />
    }
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

/**
 * View Gate
 * Shows content only if user can view the module
 */
export function ViewGate({
  children,
  module,
  fallback,
  showDeniedMessage,
}: Omit<ModuleGateProps, 'level'>) {
  return (
    <ModuleGate
      module={module}
      level="view"
      fallback={fallback}
      showDeniedMessage={showDeniedMessage}
    >
      {children}
    </ModuleGate>
  )
}

/**
 * Edit Gate
 * Shows content only if user can edit in the module
 */
export function EditGate({
  children,
  module,
  fallback,
  showDeniedMessage,
}: Omit<ModuleGateProps, 'level'>) {
  return (
    <ModuleGate
      module={module}
      level="edit"
      fallback={fallback}
      showDeniedMessage={showDeniedMessage}
    >
      {children}
    </ModuleGate>
  )
}

/**
 * Delete Gate
 * Shows content only if user has full access to the module
 */
export function DeleteGate({
  children,
  module,
  fallback,
  showDeniedMessage,
}: Omit<ModuleGateProps, 'level'>) {
  return (
    <ModuleGate
      module={module}
      level="full"
      fallback={fallback}
      showDeniedMessage={showDeniedMessage}
    >
      {children}
    </ModuleGate>
  )
}

/**
 * Special Permission Gate
 * Shows content only if user has the specified special permission
 */
export function SpecialPermissionGate({
  children,
  permission,
  fallback,
  showDeniedMessage,
}: SpecialPermissionGateProps) {
  const { hasSpecial, isLoading } = usePermissions()

  if (isLoading) {
    return null
  }

  const hasAccess = hasSpecial(permission)

  if (!hasAccess) {
    if (showDeniedMessage) {
      return <AccessDenied />
    }
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

/**
 * Role Gate
 * Shows content only if user has one of the specified roles
 */
export function RoleGate({
  children,
  roles,
  fallback,
  showDeniedMessage,
}: RoleGateProps) {
  const { role, isLoading } = usePermissions()

  if (isLoading) {
    return null
  }

  const hasRole = role && roles.includes(role)

  if (!hasRole) {
    if (showDeniedMessage) {
      return <AccessDenied />
    }
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

/**
 * Admin Gate
 * Shows content only for admin or owner roles
 */
export function AdminGate({
  children,
  fallback,
  showDeniedMessage,
}: PermissionGateProps) {
  return (
    <RoleGate
      roles={['owner', 'admin']}
      fallback={fallback}
      showDeniedMessage={showDeniedMessage}
    >
      {children}
    </RoleGate>
  )
}

/**
 * Owner Gate
 * Shows content only for owner role
 */
export function OwnerGate({
  children,
  fallback,
  showDeniedMessage,
}: PermissionGateProps) {
  return (
    <RoleGate
      roles={['owner']}
      fallback={fallback}
      showDeniedMessage={showDeniedMessage}
    >
      {children}
    </RoleGate>
  )
}

/**
 * Not Departed Gate
 * Shows content only if user is NOT departed
 */
export function NotDepartedGate({
  children,
  fallback,
  showDeniedMessage,
}: PermissionGateProps) {
  const { isDeparted, isLoading } = usePermissions()

  if (isLoading) {
    return null
  }

  if (isDeparted()) {
    if (showDeniedMessage) {
      return <DepartedWarning />
    }
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

/**
 * Finance Gate
 * Shows content only if user can view financial data
 */
export function FinanceGate({
  children,
  fallback,
  showDeniedMessage,
}: PermissionGateProps) {
  const { t } = useTranslation()
  const { canViewFinances, isLoading } = usePermissions()

  if (isLoading) {
    return null
  }

  if (!canViewFinances()) {
    if (showDeniedMessage) {
      return <AccessDenied message={t('permissionGate.noFinanceAccess')} />
    }
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

/**
 * Team Management Gate
 * Shows content only if user can manage team members
 */
export function TeamManagementGate({
  children,
  fallback,
  showDeniedMessage,
}: PermissionGateProps) {
  const { t } = useTranslation()
  const { canManageTeam, isLoading } = usePermissions()

  if (isLoading) {
    return null
  }

  if (!canManageTeam()) {
    if (showDeniedMessage) {
      return <AccessDenied message={t('permissionGate.noTeamAccess')} />
    }
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}

/**
 * Conditional Disable Wrapper
 * Renders children with disabled styling if user doesn't have permission
 */
interface ConditionalDisableProps {
  children: ReactNode
  module: ModuleKey
  level?: PermissionLevel
  /**
   * When disabled, wrap children with this styling
   */
  disabledClassName?: string
}

export function ConditionalDisable({
  children,
  module,
  level = 'edit',
  disabledClassName = 'opacity-50 pointer-events-none cursor-not-allowed',
}: ConditionalDisableProps) {
  const { t } = useTranslation()
  const { hasPermission } = usePermissions()
  const hasAccess = hasPermission(module, level)

  if (!hasAccess) {
    return (
      <div className={disabledClassName} title={t('permissionGate.noActionAccess')}>
        {children}
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Read-Only Wrapper
 * Makes form elements read-only for departed users or those without edit permission
 */
interface ReadOnlyWrapperProps {
  children: ReactNode
  module: ModuleKey
}

export function ReadOnlyWrapper({ children, module }: ReadOnlyWrapperProps) {
  const { canEdit } = usePermissions()
  const hasEditAccess = canEdit(module)

  if (!hasEditAccess) {
    return (
      <div className="pointer-events-none">
        <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 rounded cursor-not-allowed" />
        {children}
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Permission Components
 * Enterprise permission system UI components
 */

// Guards
export {
  PermissionGuard,
  ModuleGuard,
  ViewGuard,
  EditGuard,
  DeleteGuard,
  ActionGuard,
  RoleGuard,
  AdminGuard,
  OwnerGuard,
  SpecialPermissionGuard,
  ActiveUserGuard,
} from './PermissionGuard'

// Management Components
export { PolicyManager } from './PolicyManager'
export { ResourceAccessManager } from './ResourceAccessManager'
export { DecisionLogs } from './DecisionLogs'

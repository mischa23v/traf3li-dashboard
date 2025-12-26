/**
 * UI Access Control Types
 * Types for sidebar visibility and page access control system
 */

// ═══════════════════════════════════════════════════════════════
// SIDEBAR TYPES
// ═══════════════════════════════════════════════════════════════

export interface SidebarItem {
  itemId: string
  name: string
  nameAr?: string
  label: string
  labelEn: string
  icon: string
  path: string
  namespace?: string
  parentId?: string
  order: number
  badgeNamespace?: string
  requiredPermission?: string
  roleVisibility: Record<string, boolean>
  isActive: boolean
  children?: SidebarItem[]
}

// ═══════════════════════════════════════════════════════════════
// PAGE ACCESS TYPES
// ═══════════════════════════════════════════════════════════════

export interface LockScreenConfig {
  enabled: boolean
  title: string
  titleEn: string
  message: string
  messageEn: string
  showRequestAccess?: boolean
  redirectPath?: string
}

export interface PageAccessRule {
  pageId: string
  name: string
  nameAr?: string
  nameEn: string
  path: string
  routePattern: string
  pathPattern?: string
  namespace?: string
  requiredAction: 'view' | 'create' | 'edit' | 'delete' | 'manage' | '*'
  roleAccess: Record<string, boolean>
  requiredPermission?: string
  defaultAccess: boolean
  isSystem: boolean
  isActive: boolean
  lockScreen?: LockScreenConfig
}

export interface PageAccessResult {
  allowed: boolean
  pageId?: string
  reason?: string
  lockScreen?: LockScreenConfig
  redirectPath?: string
}

// ═══════════════════════════════════════════════════════════════
// USER OVERRIDE TYPES
// ═══════════════════════════════════════════════════════════════

export interface SidebarOverride {
  itemId: string
  action: 'show' | 'hide'
}

export interface PageOverride {
  pageId: string
  action: 'grant' | 'deny'
}

export interface UserOverride {
  userId: string
  showSidebarItems?: string[]
  hideSidebarItems?: string[]
  grantPageAccess?: string[]
  denyPageAccess?: string[]
  sidebarOverrides?: SidebarOverride[]
  pageOverrides?: PageOverride[]
  reason?: string
  expiresAt?: string
  createdBy?: string
  createdAt?: string
}

// ═══════════════════════════════════════════════════════════════
// UI ACCESS CONFIG
// ═══════════════════════════════════════════════════════════════

export interface UIAccessSettings {
  useLockScreen: boolean
  defaultLockMessage: {
    title: string
    titleEn: string
    message: string
    messageEn: string
  }
  redirectPath: string
  showDisabledItems: boolean
  logAccessDenials: boolean
}

export interface UIAccessConfig {
  _id: string
  firmId: string
  sidebarItems: SidebarItem[]
  pageAccess: PageAccessRule[]
  userOverrides: UserOverride[]
  settings: UIAccessSettings
  version: number
}

// ═══════════════════════════════════════════════════════════════
// ACCESS MATRIX
// ═══════════════════════════════════════════════════════════════

export interface AccessMatrixItem {
  name: string
  nameAr?: string
  path?: string
  routePattern?: string
  isSystem: boolean
  roles: Record<string, boolean>
}

export interface AccessMatrix {
  roles: string[]
  sidebar: Record<string, AccessMatrixItem>
  pages: Record<string, AccessMatrixItem>
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSES
// ═══════════════════════════════════════════════════════════════

export interface VisibleSidebarResponse {
  success: boolean
  data: {
    items: SidebarItem[]
  }
}

export interface AllSidebarItemsResponse {
  success: boolean
  data: {
    items: SidebarItem[]
  }
}

export interface PageAccessCheckResponse {
  success: boolean
  data: PageAccessResult
}

export interface AllPageAccessResponse {
  success: boolean
  data: {
    pages: PageAccessRule[]
  }
}

export interface UIAccessConfigResponse {
  success: boolean
  data: UIAccessConfig
}

export interface AccessMatrixResponse {
  success: boolean
  data: AccessMatrix
}

// ═══════════════════════════════════════════════════════════════
// AVAILABLE ROLES
// ═══════════════════════════════════════════════════════════════

export type UserRole =
  | 'owner'
  | 'admin'
  | 'partner'
  | 'lawyer'
  | 'paralegal'
  | 'secretary'
  | 'accountant'
  | 'departed'

export const USER_ROLES: { value: UserRole; label: string; labelEn: string }[] = [
  { value: 'owner', label: 'المالك', labelEn: 'Owner' },
  { value: 'admin', label: 'مدير النظام', labelEn: 'Admin' },
  { value: 'partner', label: 'شريك', labelEn: 'Partner' },
  { value: 'lawyer', label: 'محامي', labelEn: 'Lawyer' },
  { value: 'paralegal', label: 'مساعد قانوني', labelEn: 'Paralegal' },
  { value: 'secretary', label: 'سكرتير', labelEn: 'Secretary' },
  { value: 'accountant', label: 'محاسب', labelEn: 'Accountant' },
  { value: 'departed', label: 'موظف مغادر', labelEn: 'Departed' },
]

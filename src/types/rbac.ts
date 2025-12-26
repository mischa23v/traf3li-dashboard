/**
 * RBAC (Role-Based Access Control) Types
 * Comprehensive type definitions for firm-based permissions system
 */

// ==================== ENUMS & CONSTANTS ====================

/**
 * Firm Member Roles
 */
export type FirmRole =
  | 'owner'
  | 'admin'
  | 'partner'
  | 'lawyer'
  | 'paralegal'
  | 'secretary'
  | 'accountant'
  | 'departed'

/**
 * Firm Member Status
 */
export type FirmMemberStatus =
  | 'active'
  | 'departed'
  | 'suspended'
  | 'pending'

/**
 * Permission Levels (ordered from least to most access)
 */
export type PermissionLevel = 'none' | 'view' | 'edit' | 'full'

/**
 * Module Keys for Permission Mapping
 */
export type ModuleKey =
  | 'clients'
  | 'cases'
  | 'leads'
  | 'invoices'
  | 'payments'
  | 'expenses'
  | 'documents'
  | 'tasks'
  | 'events'
  | 'timeTracking'
  | 'reports'
  | 'settings'
  | 'team'
  | 'hr'

/**
 * Special Permission Keys
 */
export type SpecialPermissionKey =
  | 'canApproveInvoices'
  | 'canManageRetainers'
  | 'canExportData'
  | 'canDeleteRecords'
  | 'canViewFinance'
  | 'canManageTeam'
  | 'canAccessHR'

/**
 * Departure Reasons
 */
export type DepartureReason =
  | 'resignation'
  | 'termination'
  | 'retirement'
  | 'transfer'
  | 'other'

// ==================== INTERFACES ====================

/**
 * Module Permissions Map
 */
export type ModulePermissions = Record<ModuleKey, PermissionLevel>

/**
 * Special Permissions Map
 */
export type SpecialPermissions = Record<SpecialPermissionKey, boolean>

/**
 * Departed User Restrictions
 */
export interface DepartedRestrictions {
  canOnlyViewOwnData: boolean
  blockedModules: ModuleKey[]
  readOnlyModules: ModuleKey[]
  assignedCaseIds: string[]
}

/**
 * User Permissions Response
 * Returned from GET /api/firms/my/permissions
 */
export interface UserPermissions {
  role: FirmRole
  status: FirmMemberStatus
  isDeparted: boolean
  modules: ModulePermissions
  special: SpecialPermissions
  restrictions: DepartedRestrictions | null
}

/**
 * Role Definition with Arabic Labels
 */
export interface RoleDefinition {
  key: FirmRole
  labelAr: string
  labelEn: string
  description?: string
}

/**
 * Available Roles Response
 * Returned from GET /api/firms/roles
 */
export interface AvailableRolesResponse {
  success: boolean
  data: RoleDefinition[]
}

/**
 * Firm Member
 */
export interface FirmMember {
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  role: FirmRole
  previousRole?: FirmRole
  status: FirmMemberStatus
  joinedAt: string
  departedAt?: string | null
  departureReason?: DepartureReason | null
  departureNotes?: string | null
  assignedCases?: string[]
  permissions?: {
    modules?: Partial<ModulePermissions>
    special?: Partial<SpecialPermissions>
  }
}

/**
 * Team Response Meta
 * Metadata returned with team members
 */
export interface TeamResponseMeta {
  total: number
  activeCount: number
  departedCount: number
}

/**
 * Team Response
 * Returned from GET /api/firms/:id/team
 * data is the array of members directly, meta contains counts
 */
export interface TeamResponse {
  success: boolean
  data: FirmMember[]
  meta: TeamResponseMeta
}

/**
 * Departed Members Response
 * Returned from GET /api/firms/:id/departed
 */
export interface DepartedMembersResponse {
  success: boolean
  data: {
    members: FirmMember[]
    total: number
  }
}

/**
 * Process Departure Request Body
 * POST /api/firms/:id/members/:memberId/depart
 */
export interface ProcessDepartureRequest {
  reason: DepartureReason
  notes?: string
}

/**
 * Reinstate Member Response
 * POST /api/firms/:id/members/:memberId/reinstate
 */
export interface ReinstateMemberResponse {
  success: boolean
  message: string
  data: FirmMember
}

/**
 * Permissions Response
 * Returned from GET /api/firms/my/permissions
 */
export interface PermissionsResponse {
  success: boolean
  data: UserPermissions
}

// ==================== CONSTANTS ====================

/**
 * Role Labels in Arabic
 */
export const ROLE_LABELS: Record<FirmRole, string> = {
  owner: 'المالك',
  admin: 'مدير النظام',
  partner: 'شريك',
  lawyer: 'محامي',
  paralegal: 'مساعد قانوني',
  secretary: 'سكرتير',
  accountant: 'محاسب',
  departed: 'موظف مغادر',
}

/**
 * Role Labels in English
 */
export const ROLE_LABELS_EN: Record<FirmRole, string> = {
  owner: 'Owner',
  admin: 'Administrator',
  partner: 'Partner',
  lawyer: 'Lawyer',
  paralegal: 'Paralegal',
  secretary: 'Secretary',
  accountant: 'Accountant',
  departed: 'Departed Employee',
}

/**
 * Member Status Labels in Arabic
 */
export const STATUS_LABELS: Record<FirmMemberStatus, string> = {
  active: 'فعال',
  departed: 'مغادر',
  suspended: 'معلق',
  pending: 'معلق',
}

/**
 * Member Status Labels in English
 */
export const STATUS_LABELS_EN: Record<FirmMemberStatus, string> = {
  active: 'Active',
  departed: 'Departed',
  suspended: 'Suspended',
  pending: 'Pending',
}

/**
 * Departure Reason Labels in Arabic
 */
export const DEPARTURE_REASON_LABELS: Record<DepartureReason, string> = {
  resignation: 'استقالة',
  termination: 'إنهاء خدمات',
  retirement: 'تقاعد',
  transfer: 'نقل',
  other: 'أخرى',
}

/**
 * Departure Reason Labels in English
 */
export const DEPARTURE_REASON_LABELS_EN: Record<DepartureReason, string> = {
  resignation: 'Resignation',
  termination: 'Termination',
  retirement: 'Retirement',
  transfer: 'Transfer',
  other: 'Other',
}

/**
 * Permission Level Numeric Values
 * Used for comparison operations
 */
export const PERMISSION_LEVELS: Record<PermissionLevel, number> = {
  none: 0,
  view: 1,
  edit: 2,
  full: 3,
}

/**
 * Default Permissions for Departed Users
 */
export const DEPARTED_DEFAULT_PERMISSIONS: ModulePermissions = {
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
}

/**
 * Modules blocked for departed users
 */
export const DEPARTED_BLOCKED_MODULES: ModuleKey[] = [
  'clients',
  'leads',
  'invoices',
  'payments',
  'expenses',
  'reports',
  'settings',
  'team',
  'hr',
]

/**
 * Modules with read-only access for departed users
 */
export const DEPARTED_READ_ONLY_MODULES: ModuleKey[] = [
  'cases',
  'documents',
  'tasks',
  'events',
  'timeTracking',
]

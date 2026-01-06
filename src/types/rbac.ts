/**
 * RBAC (Role-Based Access Control) Types
 * Comprehensive type definitions for firm-based permissions system
 */

// ═══════════════════════════════════════════════════════════════
// ROLE TYPES
// ═══════════════════════════════════════════════════════════════

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
 * Cross-company access roles (UserCompanyAccess)
 */
export type AccessRole = 'owner' | 'admin' | 'manager' | 'employee' | 'viewer'

/**
 * Firm Member Status
 */
export type FirmMemberStatus =
  | 'active'
  | 'departed'
  | 'suspended'
  | 'pending'
  | 'pending_approval'

/**
 * Member status (alias for FirmMemberStatus for convenience)
 */
export type MemberStatus = 'active' | 'departed' | 'suspended' | 'pending'

/**
 * Access status (UserCompanyAccess)
 */
export type AccessStatus = 'active' | 'inactive' | 'pending' | 'revoked'

/**
 * Invitation status
 */
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'

/**
 * Permission Levels (ordered from least to most access)
 */
export type PermissionLevel = 'none' | 'view' | 'edit' | 'full'

// ═══════════════════════════════════════════════════════════════
// MODULE PERMISSIONS
// ═══════════════════════════════════════════════════════════════

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
  | 'appointments'
  | 'timeTracking'
  | 'reports'
  | 'settings'
  | 'team'

/**
 * Permission module keys (alias for ModuleKey)
 */
export type PermissionModule = ModuleKey

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

// ═══════════════════════════════════════════════════════════════
// CROSS-COMPANY ACCESS PERMISSIONS
// ═══════════════════════════════════════════════════════════════

/**
 * UserCompanyAccess specific permissions
 */
export type CompanyAccessPermission =
  | 'view_clients'
  | 'edit_clients'
  | 'view_cases'
  | 'edit_cases'
  | 'view_invoices'
  | 'edit_invoices'
  | 'view_reports'
  | 'view_team'
  | 'manage_settings'

/**
 * Departure Reasons
 */
export type DepartureReason =
  | 'resignation'
  | 'termination'
  | 'retirement'
  | 'transfer'
  | 'other'

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

/**
 * Module Permissions Object
 */
export interface ModulePermissions {
  clients: PermissionLevel
  cases: PermissionLevel
  leads: PermissionLevel
  invoices: PermissionLevel
  payments: PermissionLevel
  expenses: PermissionLevel
  documents: PermissionLevel
  tasks: PermissionLevel
  events: PermissionLevel
  appointments: PermissionLevel
  timeTracking: PermissionLevel
  reports: PermissionLevel
  settings: PermissionLevel
  team: PermissionLevel
}

/**
 * Special Permissions (boolean flags)
 */
export interface SpecialPermissions {
  canApproveInvoices: boolean
  canManageRetainers: boolean
  canExportData: boolean
  canDeleteRecords: boolean
  canViewFinance: boolean
  canManageTeam: boolean
}

/**
 * Complete Permissions Object (Module + Special combined)
 */
export interface Permissions extends ModulePermissions, SpecialPermissions {}

/**
 * Populated user reference
 */
export interface PopulatedUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  image?: string
  lawyerProfile?: {
    licenseNumber?: string
    specializations?: string[]
  }
}

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
 * Firm Member (for API responses with populated user data)
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
  title?: string // Job title within firm
  department?: string // Department
  joinedAt: string
  departedAt?: string | null
  departureReason?: DepartureReason | null
  departureNotes?: string | null
  departureProcessedBy?: string // User ID who processed departure
  assignedCases?: string[]
  permissions?: {
    modules?: Partial<ModulePermissions>
    special?: Partial<SpecialPermissions>
  }
}

/**
 * Team member in firm (with full permissions object)
 */
export interface TeamMember {
  _id: string
  userId: string | PopulatedUser
  role: FirmRole
  previousRole: FirmRole | null
  permissions: Permissions
  title?: string
  department?: string
  joinedAt: string
  status: FirmMemberStatus
  departedAt?: string | null
  departureReason?: string | null
  departureNotes?: string | null
  assignedCases?: string[]
  departureProcessedBy?: string | null
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

// ═══════════════════════════════════════════════════════════════
// ROLE INFO (for UI)
// ═══════════════════════════════════════════════════════════════

/**
 * Role with metadata and default permissions
 */
export interface RoleInfo {
  id: FirmRole
  name: string // Arabic
  nameEn: string // English
  description: string // Arabic
  defaultPermissions: Permissions
}

// ═══════════════════════════════════════════════════════════════
// MY PERMISSIONS RESPONSE
// ═══════════════════════════════════════════════════════════════

/**
 * Solo lawyer permissions response
 */
export interface SoloLawyerPermissions {
  isSoloLawyer: true
  firmId: null
  firmName: null
  role: null
  status: 'active'
  isDeparted: false
  permissions: {
    modules: {
      cases: 'full'
      clients: 'full'
      calendar: 'full'
      tasks: 'full'
      documents: 'full'
      finance: 'full'
      time_tracking: 'full'
      investments: 'full'
    }
    special: {
      canInviteMembers: false
      canManageBilling: true
      canAccessReports: true
      canExportData: true
    }
  }
  accessibleModules: ModulePermissions
  specialPermissions: SpecialPermissions
}

/**
 * Firm member permissions response
 */
export interface FirmMemberPermissions {
  isSoloLawyer: false
  firmId: string
  firmName: string
  role: FirmRole
  status: MemberStatus
  isDeparted: boolean
  permissions: {
    modules: Record<string, PermissionLevel>
    special: SpecialPermissions
  }
  accessibleModules: ModulePermissions
  specialPermissions: SpecialPermissions
}

export type MyPermissionsData = SoloLawyerPermissions | FirmMemberPermissions

// ═══════════════════════════════════════════════════════════════
// INVITATION
// ═══════════════════════════════════════════════════════════════

/**
 * Invitation details
 */
export interface Invitation {
  id: string
  code: string
  email: string
  role: FirmRole
  status: InvitationStatus
  expiresAt: string
  invitedBy: {
    id: string
    name: string
  } | null
  createdAt: string
}

/**
 * Invitation validation result (public endpoint)
 */
export interface InvitationValidation {
  valid: boolean
  invitation?: {
    email: string
    firmName: string
    role: FirmRole
    expiresAt: string
    invitedBy: string
  }
  error?: string
  code?: 'INVITATION_INVALID' | 'INVITATION_EXPIRED'
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
 * Role Labels (bilingual object format)
 */
export const ROLE_LABELS_BILINGUAL: Record<FirmRole, { ar: string; en: string }> = {
  owner: { ar: 'مالك', en: 'Owner' },
  admin: { ar: 'مسؤول', en: 'Admin' },
  partner: { ar: 'شريك', en: 'Partner' },
  lawyer: { ar: 'محامي', en: 'Lawyer' },
  paralegal: { ar: 'مساعد قانوني', en: 'Paralegal' },
  secretary: { ar: 'سكرتير', en: 'Secretary' },
  accountant: { ar: 'محاسب', en: 'Accountant' },
  departed: { ar: 'مغادر', en: 'Departed' },
}

/**
 * Member Status Labels in Arabic
 */
export const STATUS_LABELS: Record<FirmMemberStatus, string> = {
  active: 'فعال',
  departed: 'مغادر',
  suspended: 'معلق',
  pending: 'معلق',
  pending_approval: 'في انتظار الموافقة',
}

/**
 * Member Status Labels in English
 */
export const STATUS_LABELS_EN: Record<FirmMemberStatus, string> = {
  active: 'Active',
  departed: 'Departed',
  suspended: 'Suspended',
  pending: 'Pending',
  pending_approval: 'Pending Approval',
}

/**
 * Member Status Labels (bilingual object format)
 */
export const MEMBER_STATUS_LABELS: Record<MemberStatus, { ar: string; en: string }> = {
  active: { ar: 'نشط', en: 'Active' },
  departed: { ar: 'مغادر', en: 'Departed' },
  suspended: { ar: 'موقوف', en: 'Suspended' },
  pending: { ar: 'معلق', en: 'Pending' },
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

// ═══════════════════════════════════════════════════════════════
// DEFAULT PERMISSIONS BY ROLE
// ═══════════════════════════════════════════════════════════════

/**
 * Default permissions for each role
 */
export const DEFAULT_PERMISSIONS: Record<FirmRole, Permissions> = {
  owner: {
    clients: 'full',
    cases: 'full',
    leads: 'full',
    invoices: 'full',
    payments: 'full',
    expenses: 'full',
    documents: 'full',
    tasks: 'full',
    events: 'full',
    appointments: 'full',
    timeTracking: 'full',
    reports: 'full',
    settings: 'full',
    team: 'full',
    canApproveInvoices: true,
    canManageRetainers: true,
    canExportData: true,
    canDeleteRecords: true,
    canViewFinance: true,
    canManageTeam: true,
  },
  admin: {
    clients: 'full',
    cases: 'full',
    leads: 'full',
    invoices: 'full',
    payments: 'full',
    expenses: 'full',
    documents: 'full',
    tasks: 'full',
    events: 'full',
    appointments: 'full',
    timeTracking: 'full',
    reports: 'full',
    settings: 'edit',
    team: 'full',
    canApproveInvoices: true,
    canManageRetainers: true,
    canExportData: true,
    canDeleteRecords: true,
    canViewFinance: true,
    canManageTeam: true,
  },
  partner: {
    clients: 'full',
    cases: 'full',
    leads: 'edit',
    invoices: 'full',
    payments: 'full',
    expenses: 'edit',
    documents: 'full',
    tasks: 'full',
    events: 'full',
    appointments: 'full',
    timeTracking: 'full',
    reports: 'view',
    settings: 'view',
    team: 'view',
    canApproveInvoices: true,
    canManageRetainers: true,
    canExportData: true,
    canDeleteRecords: false,
    canViewFinance: true,
    canManageTeam: false,
  },
  lawyer: {
    clients: 'edit',
    cases: 'edit',
    leads: 'edit',
    invoices: 'view',
    payments: 'view',
    expenses: 'edit',
    documents: 'edit',
    tasks: 'edit',
    events: 'edit',
    appointments: 'edit',
    timeTracking: 'edit',
    reports: 'none',
    settings: 'none',
    team: 'view',
    canApproveInvoices: false,
    canManageRetainers: false,
    canExportData: false,
    canDeleteRecords: false,
    canViewFinance: false,
    canManageTeam: false,
  },
  paralegal: {
    clients: 'edit',
    cases: 'view',
    leads: 'edit',
    invoices: 'view',
    payments: 'view',
    expenses: 'view',
    documents: 'edit',
    tasks: 'edit',
    events: 'edit',
    appointments: 'edit',
    timeTracking: 'edit',
    reports: 'none',
    settings: 'none',
    team: 'view',
    canApproveInvoices: false,
    canManageRetainers: false,
    canExportData: false,
    canDeleteRecords: false,
    canViewFinance: false,
    canManageTeam: false,
  },
  secretary: {
    clients: 'view',
    cases: 'view',
    leads: 'view',
    invoices: 'view',
    payments: 'view',
    expenses: 'view',
    documents: 'view',
    tasks: 'edit',
    events: 'edit',
    appointments: 'edit',
    timeTracking: 'view',
    reports: 'none',
    settings: 'none',
    team: 'view',
    canApproveInvoices: false,
    canManageRetainers: false,
    canExportData: false,
    canDeleteRecords: false,
    canViewFinance: false,
    canManageTeam: false,
  },
  accountant: {
    clients: 'view',
    cases: 'view',
    leads: 'none',
    invoices: 'full',
    payments: 'full',
    expenses: 'full',
    documents: 'view',
    tasks: 'edit',
    events: 'edit',
    appointments: 'view',
    timeTracking: 'full',
    reports: 'view',
    settings: 'none',
    team: 'view',
    canApproveInvoices: true,
    canManageRetainers: true,
    canExportData: true,
    canDeleteRecords: false,
    canViewFinance: true,
    canManageTeam: false,
  },
  departed: {
    clients: 'view',
    cases: 'view',
    leads: 'none',
    invoices: 'none',
    payments: 'none',
    expenses: 'none',
    documents: 'view',
    tasks: 'none',
    events: 'none',
    appointments: 'none',
    timeTracking: 'none',
    reports: 'none',
    settings: 'none',
    team: 'none',
    canApproveInvoices: false,
    canManageRetainers: false,
    canExportData: false,
    canDeleteRecords: false,
    canViewFinance: false,
    canManageTeam: false,
  },
}

/**
 * Default Permissions for Departed Users (Module only)
 */
export const DEPARTED_DEFAULT_PERMISSIONS: ModulePermissions = {
  clients: 'view',
  cases: 'view',
  leads: 'none',
  invoices: 'none',
  payments: 'none',
  expenses: 'none',
  documents: 'view',
  tasks: 'none',
  events: 'none',
  appointments: 'none',
  timeTracking: 'none',
  reports: 'none',
  settings: 'none',
  team: 'none',
}

/**
 * Modules blocked for departed users
 */
export const DEPARTED_BLOCKED_MODULES: ModuleKey[] = [
  'leads',
  'invoices',
  'payments',
  'expenses',
  'tasks',
  'events',
  'appointments',
  'timeTracking',
  'reports',
  'settings',
  'team',
]

/**
 * Modules with read-only access for departed users
 */
export const DEPARTED_READ_ONLY_MODULES: ModuleKey[] = ['clients', 'cases', 'documents']

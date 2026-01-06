/**
 * Firm Types
 * Complete type definitions for firm entities matching backend API contract
 */

import type { FirmRole, FirmMemberStatus, DepartureReason, PermissionLevel, ModulePermissions, SpecialPermissions } from './rbac'

// ==================== ENUMS ====================

/**
 * Firm Status
 */
export type FirmStatus = 'active' | 'inactive' | 'suspended'

/**
 * Subscription Plans
 */
export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise'

/**
 * Subscription Status
 */
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled'

/**
 * Billing Cycle
 */
export type BillingCycle = 'monthly' | 'annual'

/**
 * ZATCA Environment
 */
export type ZatcaEnvironment = 'sandbox' | 'production'

/**
 * Numbering Format for cases/clients/invoices
 */
export type NumberingFormat = 'sequential' | 'yearly'

/**
 * Cross-Company Access Role
 */
export type AccessRole = 'owner' | 'admin' | 'manager' | 'employee' | 'viewer'

/**
 * Cross-Company Access Permission (Granular)
 */
export type AccessPermission =
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
 * Cross-Company Access Status
 */
export type AccessStatus = 'active' | 'inactive' | 'pending' | 'revoked'

// ==================== SUB-INTERFACES ====================

/**
 * Firm Address (Saudi format)
 */
export interface FirmAddress {
  street?: string
  building?: string // NEW - Building number
  district?: string // NEW - District/neighborhood
  city?: string
  region?: string // NEW - Province/region
  postalCode?: string
  country: string // Default: "Saudi Arabia"
  additionalNumber?: string // NEW - الرقم الإضافي
}

/**
 * Firm Branch
 */
export interface Branch {
  name: string
  city: string
  address: string
  phone: string
  isHeadquarters: boolean
}

/**
 * Bank Account
 */
export interface BankAccount {
  bankName: string
  accountName: string
  accountNumber: string
  iban: string
  swiftCode?: string
  isDefault: boolean
}

/**
 * VAT Registration
 */
export interface VATRegistration {
  isRegistered: boolean
  vatNumber?: string // 15-digit Saudi VAT
  registrationDate?: string
}

/**
 * Hierarchy Settings
 */
export interface HierarchySettings {
  allowConsolidatedView: boolean // Parent can view child data
  allowCrossCompanyTransactions: boolean
  requireApprovalForCrossCompany: boolean
}

/**
 * Billing Settings
 */
export interface BillingSettings {
  defaultCurrency: string // Default: "SAR"
  defaultPaymentTerms: number // Days, default: 30
  invoicePrefix: string // Default: "INV"
  invoiceStartNumber: number
  currentInvoiceNumber: number
  zatcaEnabled: boolean
  zatcaEnvironment: ZatcaEnvironment // NEW
  showLogo: boolean
  invoiceFooter?: string
  invoiceFooterArabic?: string
  bankAccounts: BankAccount[]
}

/**
 * Firm Settings
 */
export interface FirmSettings {
  timezone: string // Default: "Asia/Riyadh"
  language: string // Default: "ar"
  dateFormat: string // Default: "DD/MM/YYYY"
  fiscalYearStart: number // Month (1-12)
  defaultCasePrefix: string
  currentCaseNumber: number
  defaultClientPrefix: string
  currentClientNumber: number
  numberingFormat: NumberingFormat // NEW - 'sequential' | 'yearly'
}

/**
 * Subscription Features
 */
export interface SubscriptionFeatures {
  zatcaIntegration: boolean
  advancedReports: boolean
  multiCurrency: boolean
  apiAccess: boolean
  customBranding: boolean
}

/**
 * Subscription
 */
export interface Subscription {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  trialEndsAt?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  billingCycle: BillingCycle
  maxUsers: number
  maxCases: number
  maxClients: number
  maxStorageGB: number
  features: SubscriptionFeatures
}

/**
 * Firm Member Permissions (Combined Module + Special)
 */
export interface FirmMemberPermissions {
  // Module permissions
  clients: PermissionLevel
  cases: PermissionLevel
  leads: PermissionLevel
  invoices: PermissionLevel
  payments: PermissionLevel
  expenses: PermissionLevel
  documents: PermissionLevel
  tasks: PermissionLevel
  events: PermissionLevel
  appointments: PermissionLevel // NEW - added in backend
  timeTracking: PermissionLevel
  reports: PermissionLevel
  settings: PermissionLevel
  team: PermissionLevel
  // Special permissions
  canApproveInvoices: boolean
  canManageRetainers: boolean
  canExportData: boolean
  canDeleteRecords: boolean
  canViewFinance: boolean
  canManageTeam: boolean
}

// ==================== MAIN INTERFACES ====================

/**
 * Firm Member
 * A user's membership in a firm with role and permissions
 */
export interface FirmMember {
  _id: string
  userId: string
  role: FirmRole
  previousRole?: FirmRole // Original role before departure
  status: FirmMemberStatus
  title?: string // NEW - Job title within firm
  department?: string // NEW
  joinedAt: string
  departedAt?: string
  departureReason?: DepartureReason
  departureNotes?: string
  departureProcessedBy?: string // NEW - who processed departure
  assignedCases?: string[] // Cases member had access to (for departed)
  permissions: FirmMemberPermissions
}

/**
 * Firm (Complete Schema)
 * Main firm/company entity
 */
export interface Firm {
  _id: string

  // Basic Info
  name: string // Required
  nameArabic?: string
  nameEnglish?: string
  description?: string
  descriptionArabic?: string
  logo?: string
  website?: string

  // Hierarchy
  parentFirmId?: string | null // Parent firm ID (null = root)
  level: number // 0 = root, 1 = child, etc.
  code?: string // Company code (e.g., "HQ", "RIYADH-01")
  industry?: string
  hierarchySettings: HierarchySettings

  // Saudi Business Info
  crNumber?: string // Commercial Registration
  unifiedNumber?: string // NEW - الرقم الموحد (700 number)
  licenseNumber?: string // NEW - رقم ترخيص المحاماة
  vatRegistration: VATRegistration

  // Contact
  email?: string
  phone?: string
  fax?: string // NEW
  address: FirmAddress

  // Branches
  branches: Branch[] // NEW

  // Practice Areas
  practiceAreas: string[] // NEW

  // Team
  ownerId: string
  members: FirmMember[]

  // Settings
  billingSettings: BillingSettings
  settings: FirmSettings
  subscription: Subscription

  // Status
  status: FirmStatus

  // Timestamps
  createdAt: string
  updatedAt: string
  createdBy?: string
}

/**
 * User Company Access (Cross-Company Access)
 * Grants a user access to a company they're not a direct member of
 */
export interface UserCompanyAccess {
  _id: string
  userId: string
  firmId: string
  role: AccessRole
  permissions: AccessPermission[]
  canAccessChildren: boolean // Can access child companies
  canAccessParent: boolean // Can access parent company
  isDefault: boolean // User's default company
  status: AccessStatus
  grantedBy?: string
  grantedAt: string
  expiresAt?: string // Optional expiration
  notes?: string
  createdAt: string
  updatedAt: string
}

/**
 * Accessible Company
 * Company with access metadata for current user
 */
export interface AccessibleCompany {
  _id: string
  name: string
  nameArabic?: string
  nameEnglish?: string
  code?: string
  logo?: string
  level: number
  status: FirmStatus
  industry?: string
  parentFirmId?: string
  accessRole: FirmRole | AccessRole
  accessType: 'member' | 'cross-company'
  canAccessChildren?: boolean
  canAccessParent?: boolean
  isDefault: boolean
}

// ==================== REQUEST TYPES ====================

/**
 * Grant Access Request
 */
export interface GrantAccessRequest {
  userId: string // Required - target user
  role?: AccessRole // Default: 'viewer'
  permissions?: AccessPermission[]
  canAccessChildren?: boolean // Default: false
  canAccessParent?: boolean // Default: false
  expiresAt?: string // Optional expiration
  notes?: string
}

/**
 * Update Access Request
 */
export interface UpdateAccessRequest {
  role?: AccessRole
  permissions?: AccessPermission[]
  canAccessChildren?: boolean
  canAccessParent?: boolean
  isDefault?: boolean
  status?: AccessStatus
  expiresAt?: string
  notes?: string
}

/**
 * Create Firm Request
 */
export interface CreateFirmRequest {
  name: string
  nameArabic?: string
  nameEnglish?: string
  description?: string
  descriptionArabic?: string
  logo?: string
  website?: string
  parentFirmId?: string | null
  code?: string
  industry?: string
  crNumber?: string
  unifiedNumber?: string
  licenseNumber?: string
  email?: string
  phone?: string
  fax?: string
  address?: Partial<FirmAddress>
  branches?: Branch[]
  practiceAreas?: string[]
  vatRegistration?: Partial<VATRegistration>
  billingSettings?: Partial<BillingSettings>
  settings?: Partial<FirmSettings>
  hierarchySettings?: Partial<HierarchySettings>
}

/**
 * Update Firm Request
 */
export interface UpdateFirmRequest extends Partial<CreateFirmRequest> {}

/**
 * Delete Firm Request
 */
export interface DeleteFirmRequest {
  confirmDelete: boolean
}

/**
 * Transfer Ownership Request
 */
export interface TransferOwnershipRequest {
  newOwnerId: string
}

// ==================== RESPONSE TYPES ====================

/**
 * Firm Response
 */
export interface FirmResponse {
  success: boolean
  data: Firm
}

/**
 * Firms List Response
 */
export interface FirmsListResponse {
  success: boolean
  data: Firm[]
  total?: number
}

/**
 * Active Company Response
 */
export interface ActiveCompanyResponse {
  success: boolean
  data: {
    type: 'firm' | 'solo'
    firm?: Partial<Firm>
    role?: string
    permissions?: Record<string, string | boolean>
    user?: {
      firstName: string
      lastName: string
      email: string
    }
  }
}

/**
 * Accessible Companies Response
 */
export interface AccessibleCompaniesResponse {
  success: boolean
  data: AccessibleCompany[]
}

/**
 * User Company Access Response
 */
export interface UserCompanyAccessResponse {
  success: boolean
  data: UserCompanyAccess
}

/**
 * Company Access List Response
 */
export interface CompanyAccessListResponse {
  success: boolean
  data: Array<
    UserCompanyAccess & {
      userId: {
        _id: string
        firstName: string
        lastName: string
        email: string
        image?: string
      }
      grantedBy?: {
        _id: string
        firstName: string
        lastName: string
      }
    }
  >
}

/**
 * Delete Firm Response
 */
export interface DeleteFirmResponse {
  success: boolean
  message: string
  data: {
    deletedFirmId: string
    affectedMembers: number
    clientCount: number
    caseCount: number
    invoiceCount: number
    note: string
  }
}

/**
 * Firm Statistics Response
 */
export interface FirmStatsResponse {
  success: boolean
  data: {
    membersCount: number
    activeMembersCount: number
    clientsCount: number
    casesCount: number
    activeCasesCount: number
    invoicesCount: number
    totalRevenue: number
    pendingRevenue: number
  }
}

/**
 * Switch Firm Response
 */
export interface SwitchFirmResponse {
  success: boolean
  data: {
    activeFirm: {
      id: string
      name: string
      nameArabic: string
      logo?: string
      role: string
    }
    token: string
  }
}

// ==================== CONSTANTS ====================

/**
 * Access Role Labels in Arabic
 */
export const ACCESS_ROLE_LABELS: Record<AccessRole, string> = {
  owner: 'المالك',
  admin: 'مدير',
  manager: 'مشرف',
  employee: 'موظف',
  viewer: 'مشاهد',
}

/**
 * Access Role Labels in English
 */
export const ACCESS_ROLE_LABELS_EN: Record<AccessRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
  viewer: 'Viewer',
}

/**
 * Access Status Labels in Arabic
 */
export const ACCESS_STATUS_LABELS: Record<AccessStatus, string> = {
  active: 'فعال',
  inactive: 'غير فعال',
  pending: 'معلق',
  revoked: 'ملغى',
}

/**
 * Access Status Labels in English
 */
export const ACCESS_STATUS_LABELS_EN: Record<AccessStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  revoked: 'Revoked',
}

/**
 * Access Permission Labels in Arabic
 */
export const ACCESS_PERMISSION_LABELS: Record<AccessPermission, string> = {
  view_clients: 'عرض العملاء',
  edit_clients: 'تعديل العملاء',
  view_cases: 'عرض القضايا',
  edit_cases: 'تعديل القضايا',
  view_invoices: 'عرض الفواتير',
  edit_invoices: 'تعديل الفواتير',
  view_reports: 'عرض التقارير',
  view_team: 'عرض الفريق',
  manage_settings: 'إدارة الإعدادات',
}

/**
 * Access Permission Labels in English
 */
export const ACCESS_PERMISSION_LABELS_EN: Record<AccessPermission, string> = {
  view_clients: 'View Clients',
  edit_clients: 'Edit Clients',
  view_cases: 'View Cases',
  edit_cases: 'Edit Cases',
  view_invoices: 'View Invoices',
  edit_invoices: 'Edit Invoices',
  view_reports: 'View Reports',
  view_team: 'View Team',
  manage_settings: 'Manage Settings',
}

/**
 * Subscription Plan Labels in Arabic
 */
export const SUBSCRIPTION_PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: 'مجاني',
  starter: 'مبتدئ',
  professional: 'احترافي',
  enterprise: 'مؤسسي',
}

/**
 * Subscription Plan Labels in English
 */
export const SUBSCRIPTION_PLAN_LABELS_EN: Record<SubscriptionPlan, string> = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

/**
 * Subscription Status Labels in Arabic
 */
export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'فعال',
  trial: 'تجريبي',
  expired: 'منتهي',
  cancelled: 'ملغى',
}

/**
 * Subscription Status Labels in English
 */
export const SUBSCRIPTION_STATUS_LABELS_EN: Record<SubscriptionStatus, string> = {
  active: 'Active',
  trial: 'Trial',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

/**
 * Firm Status Labels in Arabic
 */
export const FIRM_STATUS_LABELS: Record<FirmStatus, string> = {
  active: 'فعال',
  inactive: 'غير فعال',
  suspended: 'معلق',
}

/**
 * Firm Status Labels in English
 */
export const FIRM_STATUS_LABELS_EN: Record<FirmStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
}

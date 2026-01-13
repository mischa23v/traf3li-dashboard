/**
 * Feature Access Types
 * Unified system for handling feature access based on user state
 *
 * Replaces the old allowedFeatures/blockedFeatures arrays with a
 * state-machine approach that matches the backend featureAccess.config.js
 */

/**
 * User state enum - matches backend featureAccess.config.js
 * Calculated from user.isEmailVerified and user.subscription.status
 */
export enum UserState {
  ANONYMOUS = 'ANONYMOUS',
  UNVERIFIED_FREE = 'UNVERIFIED_FREE',
  UNVERIFIED_TRIAL = 'UNVERIFIED_TRIAL',
  VERIFIED_FREE = 'VERIFIED_FREE',
  VERIFIED_TRIAL = 'VERIFIED_TRIAL',
  VERIFIED_PAID = 'VERIFIED_PAID',
  PAST_DUE = 'PAST_DUE',
}

/**
 * Required action types - what the user needs to do to access a feature
 */
export enum RequiredActionType {
  LOGIN = 'login',
  VERIFY_EMAIL = 'verify_email',
  SUBSCRIBE = 'subscribe',
  UPGRADE_TIER = 'upgrade_tier',
  RETRY_PAYMENT = 'retry_payment',
}

/**
 * Required action object from backend 403 FEATURE_ACCESS_DENIED response
 */
export interface RequiredAction {
  type: RequiredActionType
  redirectTo: string
}

/**
 * 403 FEATURE_ACCESS_DENIED response from backend
 * This replaces the old EMAIL_VERIFICATION_REQUIRED error code
 */
export interface FeatureAccessDeniedResponse {
  success: false
  code: 'FEATURE_ACCESS_DENIED'
  message: string
  messageAr: string
  currentState: UserState
  feature: string
  requiredAction: RequiredAction
  emailVerification: {
    isVerified: boolean
    requiresVerification: boolean
  }
  subscription: {
    status: 'none' | 'trial' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused' | 'incomplete'
    tier: 'free' | 'starter' | 'professional' | 'enterprise'
    requiresSubscription: boolean
  }
}

/**
 * Access level helper constants - reduces duplication in FEATURE_ACCESS matrix
 * Each constant defines which user states can access features at that level
 */

/** Any authenticated user, including PAST_DUE - for critical account features */
const ALWAYS_ALLOWED: UserState[] = [
  UserState.UNVERIFIED_FREE,
  UserState.UNVERIFIED_TRIAL,
  UserState.VERIFIED_FREE,
  UserState.VERIFIED_TRIAL,
  UserState.VERIFIED_PAID,
  UserState.PAST_DUE,
]

/** All active users except PAST_DUE - no email verification required */
const NO_VERIFICATION: UserState[] = [
  UserState.UNVERIFIED_FREE,
  UserState.UNVERIFIED_TRIAL,
  UserState.VERIFIED_FREE,
  UserState.VERIFIED_TRIAL,
  UserState.VERIFIED_PAID,
]

/** Only verified users - email verification required */
const REQUIRES_VERIFICATION: UserState[] = [
  UserState.VERIFIED_FREE,
  UserState.VERIFIED_TRIAL,
  UserState.VERIFIED_PAID,
]

/** Only paid users - requires active paid subscription */
const REQUIRES_PAID: UserState[] = [UserState.VERIFIED_PAID]

/**
 * Feature access matrix - which user states can access which features
 * Matches backend featureAccess.config.js FEATURE_ACCESS
 *
 * Note: Frontend uses this for optimistic UI (hiding nav groups, etc.)
 * Backend is the source of truth and enforces access via middleware
 *
 * Feature counts: 6 always + 6 no-verification + 35 verification + 4 paid = 51 total
 */
export const FEATURE_ACCESS: Record<string, UserState[]> = {
  // 
  // ALWAYS ALLOWED (6 features) - Any authenticated user, including PAST_DUE
  // 
  auth: ALWAYS_ALLOWED,
  profile_view: ALWAYS_ALLOWED,
  billing_view: ALWAYS_ALLOWED,
  notifications: ALWAYS_ALLOWED,
  upgrade: ALWAYS_ALLOWED,
  health: ALWAYS_ALLOWED,

  // 
  // NO VERIFICATION REQUIRED (6 features) - Allowed without email verification
  // 
  tasks: NO_VERIFICATION,
  reminders: NO_VERIFICATION,
  events: NO_VERIFICATION,
  calendar: NO_VERIFICATION,
  appointments: NO_VERIFICATION,
  gantt: NO_VERIFICATION,

  // 
  // REQUIRES EMAIL VERIFICATION (35 features) - Must have verified email
  // 
  // Core business features
  cases: REQUIRES_VERIFICATION,
  clients: REQUIRES_VERIFICATION,
  contacts: REQUIRES_VERIFICATION,
  invoices: REQUIRES_VERIFICATION,
  documents: REQUIRES_VERIFICATION,
  templates: REQUIRES_VERIFICATION,
  team: REQUIRES_VERIFICATION,
  integrations: REQUIRES_VERIFICATION,
  reports: REQUIRES_VERIFICATION,
  analytics: REQUIRES_VERIFICATION,
  settings: REQUIRES_VERIFICATION,
  crm: REQUIRES_VERIFICATION,
  hr: REQUIRES_VERIFICATION,
  dashboard: REQUIRES_VERIFICATION,
  // Finance features
  billing_manage: REQUIRES_VERIFICATION,
  payments: REQUIRES_VERIFICATION,
  expenses: REQUIRES_VERIFICATION,
  retainers: REQUIRES_VERIFICATION,
  statements: REQUIRES_VERIFICATION,
  // Legal features
  legal_documents: REQUIRES_VERIFICATION,
  matters: REQUIRES_VERIFICATION,
  contracts: REQUIRES_VERIFICATION,
  // CRM/Sales features
  leads: REQUIRES_VERIFICATION,
  territories: REQUIRES_VERIFICATION,
  sales: REQUIRES_VERIFICATION,
  // HR features
  payroll: REQUIRES_VERIFICATION,
  leave: REQUIRES_VERIFICATION,
  attendance: REQUIRES_VERIFICATION,
  // System features
  automation: REQUIRES_VERIFICATION,
  webhooks: REQUIRES_VERIFICATION,
  api_access: REQUIRES_VERIFICATION,
  workflow: REQUIRES_VERIFICATION,
  files: REQUIRES_VERIFICATION,
  storage: REQUIRES_VERIFICATION,

  // 
  // REQUIRES PAID SUBSCRIPTION (4 features) - Knowledge Center
  // 
  knowledge_center: REQUIRES_PAID,
  knowledge_articles: REQUIRES_PAID,
  knowledge_categories: REQUIRES_PAID,
  knowledge_search: REQUIRES_PAID,
}

/**
 * Nav groups that require email verification
 * Maps to sidebar nav group translation keys
 *
 * Unverified users (UNVERIFIED_FREE, UNVERIFIED_TRIAL) will not see these nav groups
 */
export const BLOCKED_NAV_GROUPS_UNVERIFIED = [
  'sidebar.nav.messagesGroup',
  'sidebar.nav.clientsGroup',
  'sidebar.nav.salesGroup',
  'sidebar.nav.businessGroup',
  'sidebar.nav.financeGroup',
  'sidebar.nav.operationsGroup',
  'sidebar.nav.assetsGroup',
  'sidebar.nav.supportGroup',
  'sidebar.nav.hrGroup',
  'sidebar.nav.libraryGroup',
  'sidebar.nav.excellenceGroup',
] as const

/**
 * Nav groups that require subscription (paid tier)
 * Users with free/trial status will not see these nav groups
 */
export const BLOCKED_NAV_GROUPS_UNSUBSCRIBED = [
  'sidebar.nav.libraryGroup', // Knowledge center
] as const

/**
 * Type for blocked nav group keys (for type safety in isNavGroupBlocked)
 */
export type BlockedNavGroupUnverified = (typeof BLOCKED_NAV_GROUPS_UNVERIFIED)[number]
export type BlockedNavGroupUnsubscribed = (typeof BLOCKED_NAV_GROUPS_UNSUBSCRIBED)[number]

/**
 * Route patterns that are blocked for unverified users
 * Any route starting with these patterns will be blocked
 *
 * CENTRALIZED CONSTANT: Import this from here instead of duplicating
 */
export const BLOCKED_ROUTE_PATTERNS = [
  '/dashboard/messages',
  '/dashboard/clients',
  '/dashboard/contacts',
  '/dashboard/organizations',
  '/dashboard/crm',
  '/dashboard/cases',
  '/dashboard/documents',
  '/dashboard/finance',
  '/dashboard/inventory',
  '/dashboard/buying',
  '/dashboard/assets',
  '/dashboard/support',
  '/dashboard/hr',
  '/dashboard/knowledge',
  '/dashboard/reputation',
  '/dashboard/staff',
  '/dashboard/jobs',
  '/dashboard/apps',
  '/dashboard/data-export',
  '/dashboard/notion',
] as const

/**
 * Type for blocked route patterns
 */
export type BlockedRoutePattern = (typeof BLOCKED_ROUTE_PATTERNS)[number]

/**
 * 
 * TIER-SPECIFIC FEATURES (Future Implementation Reference)
 * 
 *
 * These features require specific subscription tiers beyond just VERIFIED_PAID.
 * They are documented here for future implementation reference when these
 * enterprise/professional features are built.
 *
 * ENTERPRISE TIER ONLY:
 * - sso: Single Sign-On integration (SAML, OIDC)
 * - saml: SAML authentication configuration
 * - custom_branding: Custom branding/white-label UI
 * - ip_whitelist: IP whitelist access restrictions
 *
 * PROFESSIONAL OR ENTERPRISE TIER:
 * - audit_logs: Audit log viewing and export
 *
 * Implementation pattern for tier-specific features:
 * ```typescript
 * const TIER_SPECIFIC_FEATURES: Record<string, SubscriptionTier[]> = {
 *   sso: ['enterprise'],
 *   saml: ['enterprise'],
 *   audit_logs: ['professional', 'enterprise'],
 *   custom_branding: ['enterprise'],
 *   ip_whitelist: ['enterprise'],
 * }
 * ```
 *
 * To check tier access:
 * ```typescript
 * function canAccessTierFeature(feature: string, userTier: SubscriptionTier): boolean {
 *   const requiredTiers = TIER_SPECIFIC_FEATURES[feature]
 *   if (!requiredTiers) return false
 *   return requiredTiers.includes(userTier)
 * }
 * ```
 */

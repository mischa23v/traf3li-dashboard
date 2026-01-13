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
    status: 'none' | 'trial' | 'trialing' | 'active' | 'past_due' | 'canceled'
    tier: 'free' | 'starter' | 'professional' | 'enterprise'
    requiresSubscription: boolean
  }
}

/**
 * Feature access matrix - which user states can access which features
 * Matches backend featureAccess.config.js FEATURE_ACCESS
 *
 * Note: Frontend uses this for optimistic UI (hiding nav groups, etc.)
 * Backend is the source of truth and enforces access via middleware
 */
export const FEATURE_ACCESS: Record<string, UserState[]> = {
  // Always allowed (any authenticated user, even past_due)
  auth: [
    UserState.UNVERIFIED_FREE,
    UserState.UNVERIFIED_TRIAL,
    UserState.VERIFIED_FREE,
    UserState.VERIFIED_TRIAL,
    UserState.VERIFIED_PAID,
    UserState.PAST_DUE,
  ],
  profile_view: [
    UserState.UNVERIFIED_FREE,
    UserState.UNVERIFIED_TRIAL,
    UserState.VERIFIED_FREE,
    UserState.VERIFIED_TRIAL,
    UserState.VERIFIED_PAID,
    UserState.PAST_DUE,
  ],
  billing_view: [
    UserState.UNVERIFIED_FREE,
    UserState.UNVERIFIED_TRIAL,
    UserState.VERIFIED_FREE,
    UserState.VERIFIED_TRIAL,
    UserState.VERIFIED_PAID,
    UserState.PAST_DUE,
  ],
  notifications: [
    UserState.UNVERIFIED_FREE,
    UserState.UNVERIFIED_TRIAL,
    UserState.VERIFIED_FREE,
    UserState.VERIFIED_TRIAL,
    UserState.VERIFIED_PAID,
    UserState.PAST_DUE,
  ],

  // Allowed without email verification (but not for past_due)
  tasks: [
    UserState.UNVERIFIED_FREE,
    UserState.UNVERIFIED_TRIAL,
    UserState.VERIFIED_FREE,
    UserState.VERIFIED_TRIAL,
    UserState.VERIFIED_PAID,
  ],
  reminders: [
    UserState.UNVERIFIED_FREE,
    UserState.UNVERIFIED_TRIAL,
    UserState.VERIFIED_FREE,
    UserState.VERIFIED_TRIAL,
    UserState.VERIFIED_PAID,
  ],
  events: [
    UserState.UNVERIFIED_FREE,
    UserState.UNVERIFIED_TRIAL,
    UserState.VERIFIED_FREE,
    UserState.VERIFIED_TRIAL,
    UserState.VERIFIED_PAID,
  ],
  calendar: [
    UserState.UNVERIFIED_FREE,
    UserState.UNVERIFIED_TRIAL,
    UserState.VERIFIED_FREE,
    UserState.VERIFIED_TRIAL,
    UserState.VERIFIED_PAID,
  ],
  appointments: [
    UserState.UNVERIFIED_FREE,
    UserState.UNVERIFIED_TRIAL,
    UserState.VERIFIED_FREE,
    UserState.VERIFIED_TRIAL,
    UserState.VERIFIED_PAID,
  ],
  gantt: [
    UserState.UNVERIFIED_FREE,
    UserState.UNVERIFIED_TRIAL,
    UserState.VERIFIED_FREE,
    UserState.VERIFIED_TRIAL,
    UserState.VERIFIED_PAID,
  ],

  // Requires email verification (not subscription)
  cases: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  clients: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  contacts: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  invoices: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  documents: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  templates: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  team: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  integrations: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  reports: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  analytics: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  settings: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  crm: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],
  hr: [UserState.VERIFIED_FREE, UserState.VERIFIED_TRIAL, UserState.VERIFIED_PAID],

  // Requires subscription (knowledge center features)
  knowledge_center: [UserState.VERIFIED_PAID],
  knowledge_articles: [UserState.VERIFIED_PAID],
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

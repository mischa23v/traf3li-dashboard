/**
 * Feature Flags Configuration
 *
 * Controls feature availability based on backend endpoint implementation status.
 * Use these flags to hide/show UI elements for features that aren't fully implemented.
 *
 * Status Types:
 * - AVAILABLE: Backend endpoint exists and is working
 * - NOT_IMPLEMENTED: Backend endpoint does not exist yet
 * - NOT_MOUNTED: Backend route file exists but is not registered in server.js
 * - PARTIAL: Some functionality works, but not all features
 *
 * @see docs/api-endpoints/09-MISSING-MISMATCH-ENDPOINTS.md for full list
 *
 * @example
 * ```tsx
 * import { FEATURES, isFeatureEnabled } from '@/config/feature-flags'
 *
 * // In component
 * {isFeatureEnabled('MFA') && <MFASettings />}
 *
 * // Or check directly
 * {FEATURES.AUTH.MFA.enabled && <MFAToggle />}
 * ```
 */

/**
 * Feature status enum
 */
export const FeatureStatus = {
  AVAILABLE: 'available',
  NOT_IMPLEMENTED: 'not_implemented',
  NOT_MOUNTED: 'not_mounted',
  PARTIAL: 'partial',
  TEST_ONLY: 'test_only',
} as const

export type FeatureStatusType = (typeof FeatureStatus)[keyof typeof FeatureStatus]

/**
 * Feature flag interface
 */
export interface FeatureFlag {
  enabled: boolean
  status: FeatureStatusType
  description: string
  descriptionAr: string
  endpoints?: string[]
}

/**
 * Feature Flags by Category
 *
 * Based on API endpoint scan from December 27, 2025
 * @see docs/api-endpoints/09-MISSING-MISMATCH-ENDPOINTS.md
 */
export const FEATURES = {
  // ==================== AUTHENTICATION ====================
  AUTH: {
    /** Basic login/register - Available */
    BASIC: {
      enabled: true,
      status: FeatureStatus.AVAILABLE,
      description: 'Login, Register, Logout, Get Profile',
      descriptionAr: 'تسجيل الدخول، التسجيل، تسجيل الخروج، الملف الشخصي',
      endpoints: ['/auth/login', '/auth/register', '/auth/logout', '/auth/me'],
    },
    /** OTP Authentication - Not Implemented */
    OTP: {
      enabled: false,
      status: FeatureStatus.NOT_IMPLEMENTED,
      description: 'OTP Send, Verify, Resend',
      descriptionAr: 'إرسال رمز التحقق، التحقق، إعادة الإرسال',
      endpoints: ['/auth/send-otp', '/auth/verify-otp', '/auth/resend-otp', '/auth/otp-status'],
    },
    /** Password Reset - Test Only */
    PASSWORD_RESET: {
      enabled: false,
      status: FeatureStatus.TEST_ONLY,
      description: 'Password Reset Flow',
      descriptionAr: 'استعادة كلمة المرور',
      endpoints: ['/auth/forgot-password', '/auth/reset-password', '/auth/change-password'],
    },
    /** Multi-Factor Authentication - Not Implemented */
    MFA: {
      enabled: false,
      status: FeatureStatus.NOT_IMPLEMENTED,
      description: 'Multi-Factor Authentication Setup & Verify',
      descriptionAr: 'المصادقة الثنائية',
      endpoints: ['/auth/mfa/status', '/auth/mfa/setup', '/auth/mfa/verify-setup', '/auth/mfa/verify'],
    },
    /** SSO Login - Not Implemented */
    SSO: {
      enabled: false,
      status: FeatureStatus.NOT_IMPLEMENTED,
      description: 'Single Sign-On (Google, Microsoft)',
      descriptionAr: 'تسجيل الدخول الموحد',
      endpoints: ['/auth/sso/providers', '/auth/sso/:provider/authorize', '/auth/sso/:provider/callback'],
    },
    /** Magic Link - Not Implemented */
    MAGIC_LINK: {
      enabled: false,
      status: FeatureStatus.NOT_IMPLEMENTED,
      description: 'Passwordless Login via Email',
      descriptionAr: 'الدخول بدون كلمة مرور',
      endpoints: ['/auth/magic-link/send', '/auth/magic-link/verify'],
    },
    /** Session Management - Not Implemented */
    SESSIONS: {
      enabled: false,
      status: FeatureStatus.NOT_IMPLEMENTED,
      description: 'View and Manage Active Sessions',
      descriptionAr: 'إدارة الجلسات النشطة',
      endpoints: ['/auth/sessions'],
    },
    /** Token Refresh - Test Only */
    REFRESH_TOKEN: {
      enabled: false,
      status: FeatureStatus.TEST_ONLY,
      description: 'Refresh Access Token',
      descriptionAr: 'تجديد رمز الوصول',
      endpoints: ['/auth/refresh-token'],
    },
  },

  // ==================== SETTINGS ====================
  SETTINGS: {
    /** General Settings - Not Implemented */
    GENERAL: {
      enabled: false,
      status: FeatureStatus.NOT_IMPLEMENTED,
      description: 'General User Settings',
      descriptionAr: 'الإعدادات العامة',
      endpoints: ['/settings', '/settings/account', '/settings/appearance', '/settings/display', '/settings/notifications'],
    },
    /** HR Settings - Not Implemented */
    HR: {
      enabled: false,
      status: FeatureStatus.NOT_IMPLEMENTED,
      description: 'HR Configuration Settings',
      descriptionAr: 'إعدادات الموارد البشرية',
      endpoints: ['/settings/hr', '/settings/hr/employee', '/settings/hr/leave', '/settings/hr/attendance'],
    },
    /** Email/SMTP Settings - Not Implemented */
    EMAIL: {
      enabled: false,
      status: FeatureStatus.NOT_IMPLEMENTED,
      description: 'SMTP Configuration, Email Templates',
      descriptionAr: 'إعدادات البريد الإلكتروني',
      endpoints: ['/settings/email/smtp', '/settings/email/signatures', '/settings/email/templates'],
    },
    /** Billing Settings - Not Implemented */
    BILLING: {
      enabled: false,
      status: FeatureStatus.NOT_IMPLEMENTED,
      description: 'Billing Configuration',
      descriptionAr: 'إعدادات الفوترة',
      endpoints: ['/settings/billing'],
    },
    /** CRM Settings - Not Implemented */
    CRM: {
      enabled: false,
      status: FeatureStatus.NOT_IMPLEMENTED,
      description: 'CRM Configuration (Sales Teams, Territories)',
      descriptionAr: 'إعدادات إدارة العملاء',
      endpoints: ['/crm-settings/*'],
    },
  },

  // ==================== NOT MOUNTED ROUTES ====================
  NOT_MOUNTED: {
    /** Firms API - Exists but not mounted */
    FIRMS: {
      enabled: false,
      status: FeatureStatus.NOT_MOUNTED,
      description: 'Law Firm Management',
      descriptionAr: 'إدارة مكاتب المحاماة',
      endpoints: ['/firms', '/firms/:id', '/firms/lawyer/add', '/firms/lawyer/remove'],
    },
    /** Legal Documents - Exists but not mounted */
    LEGAL_DOCUMENTS: {
      enabled: false,
      status: FeatureStatus.NOT_MOUNTED,
      description: 'Legal Document Repository',
      descriptionAr: 'مستودع الوثائق القانونية',
      endpoints: ['/legal-documents', '/legal-documents/:id', '/legal-documents/:id/download'],
    },
    /** Peer Reviews - Exists but not mounted */
    PEER_REVIEWS: {
      enabled: false,
      status: FeatureStatus.NOT_MOUNTED,
      description: 'Lawyer Peer Review System',
      descriptionAr: 'نظام تقييم المحامين',
      endpoints: ['/peerReview', '/peerReview/:lawyerId', '/peerReview/verify/:id'],
    },
    /** Score/Ranking - Exists but not mounted */
    SCORES: {
      enabled: false,
      status: FeatureStatus.NOT_MOUNTED,
      description: 'Lawyer Scoring & Ranking',
      descriptionAr: 'نظام تصنيف المحامين',
      endpoints: ['/score/:lawyerId', '/score/recalculate/:lawyerId', '/score/top/lawyers'],
    },
  },

  // ==================== CORE FEATURES (Available) ====================
  CORE: {
    /** Dashboard - Available */
    DASHBOARD: {
      enabled: true,
      status: FeatureStatus.AVAILABLE,
      description: 'Dashboard Statistics',
      descriptionAr: 'لوحة التحكم',
      endpoints: ['/dashboard/hero-stats', '/dashboard/stats', '/dashboard/financial-summary'],
    },
    /** Cases - Available */
    CASES: {
      enabled: true,
      status: FeatureStatus.AVAILABLE,
      description: 'Case Management',
      descriptionAr: 'إدارة القضايا',
      endpoints: ['/cases', '/cases/:id'],
    },
    /** Clients - Available */
    CLIENTS: {
      enabled: true,
      status: FeatureStatus.AVAILABLE,
      description: 'Client Management',
      descriptionAr: 'إدارة العملاء',
      endpoints: ['/clients', '/clients/:id'],
    },
    /** Tasks - Available */
    TASKS: {
      enabled: true,
      status: FeatureStatus.AVAILABLE,
      description: 'Task Management',
      descriptionAr: 'إدارة المهام',
      endpoints: ['/tasks', '/tasks/:id'],
    },
    /** Calendar - Available */
    CALENDAR: {
      enabled: true,
      status: FeatureStatus.AVAILABLE,
      description: 'Calendar & Events',
      descriptionAr: 'التقويم والأحداث',
      endpoints: ['/calendar', '/events', '/reminders'],
    },
    /** Invoices - Available */
    INVOICES: {
      enabled: true,
      status: FeatureStatus.AVAILABLE,
      description: 'Invoice Management',
      descriptionAr: 'إدارة الفواتير',
      endpoints: ['/invoices', '/invoices/:id'],
    },
    /** Time Tracking - Available */
    TIME_TRACKING: {
      enabled: true,
      status: FeatureStatus.AVAILABLE,
      description: 'Time Entry & Tracking',
      descriptionAr: 'تتبع الوقت',
      endpoints: ['/time-tracking/timer/*', '/time-tracking/entries/*'],
    },
    /** HR - Available */
    HR: {
      enabled: true,
      status: FeatureStatus.AVAILABLE,
      description: 'HR & Employee Management',
      descriptionAr: 'إدارة الموارد البشرية',
      endpoints: ['/hr/employees/*', '/hr/payroll/*', '/hr/leave/*', '/hr/attendance/*'],
    },
    /** Marketplace - Available */
    MARKETPLACE: {
      enabled: true,
      status: FeatureStatus.AVAILABLE,
      description: 'Gigs, Jobs, Proposals',
      descriptionAr: 'السوق والعروض',
      endpoints: ['/gigs', '/jobs', '/proposals'],
    },
  },
} as const

/**
 * Flat map of feature names for quick lookup
 */
export type FeatureName =
  // Auth
  | 'BASIC_AUTH'
  | 'OTP'
  | 'PASSWORD_RESET'
  | 'MFA'
  | 'SSO'
  | 'MAGIC_LINK'
  | 'SESSIONS'
  | 'REFRESH_TOKEN'
  // Settings
  | 'SETTINGS'
  | 'HR_SETTINGS'
  | 'EMAIL_SETTINGS'
  | 'BILLING_SETTINGS'
  | 'CRM_SETTINGS'
  // Not Mounted
  | 'FIRMS'
  | 'LEGAL_DOCUMENTS'
  | 'PEER_REVIEWS'
  | 'SCORES'
  // Core
  | 'DASHBOARD'
  | 'CASES'
  | 'CLIENTS'
  | 'TASKS'
  | 'CALENDAR'
  | 'INVOICES'
  | 'TIME_TRACKING'
  | 'HR'
  | 'MARKETPLACE'

/**
 * Quick lookup map for isFeatureEnabled()
 */
const FEATURE_MAP: Record<FeatureName, FeatureFlag> = {
  // Auth
  BASIC_AUTH: FEATURES.AUTH.BASIC,
  OTP: FEATURES.AUTH.OTP,
  PASSWORD_RESET: FEATURES.AUTH.PASSWORD_RESET,
  MFA: FEATURES.AUTH.MFA,
  SSO: FEATURES.AUTH.SSO,
  MAGIC_LINK: FEATURES.AUTH.MAGIC_LINK,
  SESSIONS: FEATURES.AUTH.SESSIONS,
  REFRESH_TOKEN: FEATURES.AUTH.REFRESH_TOKEN,
  // Settings
  SETTINGS: FEATURES.SETTINGS.GENERAL,
  HR_SETTINGS: FEATURES.SETTINGS.HR,
  EMAIL_SETTINGS: FEATURES.SETTINGS.EMAIL,
  BILLING_SETTINGS: FEATURES.SETTINGS.BILLING,
  CRM_SETTINGS: FEATURES.SETTINGS.CRM,
  // Not Mounted
  FIRMS: FEATURES.NOT_MOUNTED.FIRMS,
  LEGAL_DOCUMENTS: FEATURES.NOT_MOUNTED.LEGAL_DOCUMENTS,
  PEER_REVIEWS: FEATURES.NOT_MOUNTED.PEER_REVIEWS,
  SCORES: FEATURES.NOT_MOUNTED.SCORES,
  // Core
  DASHBOARD: FEATURES.CORE.DASHBOARD,
  CASES: FEATURES.CORE.CASES,
  CLIENTS: FEATURES.CORE.CLIENTS,
  TASKS: FEATURES.CORE.TASKS,
  CALENDAR: FEATURES.CORE.CALENDAR,
  INVOICES: FEATURES.CORE.INVOICES,
  TIME_TRACKING: FEATURES.CORE.TIME_TRACKING,
  HR: FEATURES.CORE.HR,
  MARKETPLACE: FEATURES.CORE.MARKETPLACE,
}

/**
 * Check if a feature is enabled
 *
 * @param featureName - The feature to check
 * @returns boolean - true if feature is enabled
 *
 * @example
 * ```tsx
 * if (isFeatureEnabled('MFA')) {
 *   showMFASettings()
 * }
 * ```
 */
export function isFeatureEnabled(featureName: FeatureName): boolean {
  return FEATURE_MAP[featureName]?.enabled ?? false
}

/**
 * Get feature status and details
 *
 * @param featureName - The feature to check
 * @returns FeatureFlag or undefined
 */
export function getFeatureDetails(featureName: FeatureName): FeatureFlag | undefined {
  return FEATURE_MAP[featureName]
}

/**
 * Get all enabled features
 *
 * @returns Array of enabled feature names
 */
export function getEnabledFeatures(): FeatureName[] {
  return (Object.keys(FEATURE_MAP) as FeatureName[]).filter((name) => FEATURE_MAP[name].enabled)
}

/**
 * Get all disabled features
 *
 * @returns Array of disabled feature names
 */
export function getDisabledFeatures(): FeatureName[] {
  return (Object.keys(FEATURE_MAP) as FeatureName[]).filter((name) => !FEATURE_MAP[name].enabled)
}

/**
 * Get features by status
 *
 * @param status - The status to filter by
 * @returns Array of feature names with that status
 */
export function getFeaturesByStatus(status: FeatureStatusType): FeatureName[] {
  return (Object.keys(FEATURE_MAP) as FeatureName[]).filter(
    (name) => FEATURE_MAP[name].status === status
  )
}

export default FEATURES

/**
 * Security Utilities Barrel Export
 * NCA ECC & PDPL Compliant Security Components
 */

// Cookie Security (NCA ECC 2-2-3)
export {
  setCookie,
  getCookie,
  deleteCookie,
  areCookiesEnabled,
  getAllCookies,
  validateCookieSecurity,
  type SecureCookieOptions,
} from '../cookies'

// Login Throttling (NCA ECC 2-1-2)
export {
  checkLoginAllowed,
  recordFailedAttempt,
  recordSuccessfulLogin,
  clearThrottle,
  clearAllThrottles,
  formatLockoutTime,
  getThrottleStatus,
} from '../login-throttle'

// Device Fingerprinting (NCA ECC 2-1-4)
export {
  generateDeviceFingerprint,
  getShortFingerprint,
  storeDeviceFingerprint,
  getStoredFingerprint,
  validateDeviceFingerprint,
  clearStoredFingerprint,
  getDeviceInfoSummary,
} from '../device-fingerprint'

// Audit Log Integrity (NCA ECC 2-9-3)
export {
  addToIntegrityChain,
  verifyEntry,
  verifyChainIntegrity,
  generateIntegrityReport,
  clearIntegrityChain,
  exportIntegrityChain,
  importIntegrityChain,
  getChainStats,
} from '../audit-integrity'

// PDPL Consent Management
export {
  hasConsent,
  hasAllConsents,
  getAllConsents,
  grantConsent,
  withdrawConsent,
  updateConsents,
  acceptAllConsents,
  rejectAllConsents,
  getConsentHistory,
  exportConsentData,
  shouldShowConsentDialog,
  needsReConsent,
  setConsentUserId,
  clearAllConsentData,
  getConsentCategoryName,
  getConsentCategoryDescription,
  type ConsentCategory,
  type ConsentRecord,
  type ConsentState,
} from '../consent-manager'

// MFA Enforcement (NCA ECC 2-1-3)
export {
  MFA_REQUIRED_ROLES,
  MFA_RECOMMENDED_ROLES,
  MFA_EXEMPT_ROLES,
  MFA_PROTECTED_ACTIONS,
  MFA_SESSION_DURATION,
  MFA_SETUP_GRACE_PERIOD,
  isMFARequired,
  isMFARecommended,
  isActionMFAProtected,
  setMFASession,
  clearMFASession,
  hasMFASession,
  getMFASessionRemaining,
  extendMFASession,
  isInMFAGracePeriod,
  getMFAGracePeriodRemaining,
  getMFAStatus,
  needsMFAForAction,
  getMFAProtectedActionsByCategory,
  type MFAProtectedAction,
} from '../mfa-enforcement'

// Data Retention (PDPL Article 14)
export {
  RETENTION_PERIODS,
  calculateExpiryDate,
  registerDataItem,
  touchDataItem,
  getExpiredItems,
  getExpiringItems,
  cleanupExpiredData,
  deleteDataItem,
  getRetentionStats,
  generateRetentionReport,
  startAutomaticCleanup,
  stopAutomaticCleanup,
  formatRetentionPeriod,
  type RetentionCategory,
  type RetainedDataItem,
} from '../data-retention'

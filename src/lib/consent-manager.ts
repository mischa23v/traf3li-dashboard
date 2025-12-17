/**
 * PDPL Consent Management System
 * Saudi Arabia Personal Data Protection Law Compliant
 */

export type ConsentCategory =
  | 'essential'      // Required for basic functionality
  | 'functional'     // Enhanced features (preferences, settings)
  | 'analytics'      // Usage analytics and performance
  | 'marketing'      // Marketing and promotional content
  | 'third_party'    // Third-party service integrations

export interface ConsentRecord {
  category: ConsentCategory
  granted: boolean
  timestamp: string
  version: string
  method: 'explicit' | 'implicit' | 'withdrawn'
  ipHash?: string // Hashed IP for audit
  userAgent?: string
}

export interface ConsentState {
  userId?: string
  consents: Record<ConsentCategory, ConsentRecord>
  history: ConsentHistoryEntry[]
  lastUpdated: string
  policyVersion: string
  expiresAt?: string
}

export interface ConsentHistoryEntry {
  timestamp: string
  action: 'granted' | 'withdrawn' | 'updated'
  category: ConsentCategory
  previousValue: boolean
  newValue: boolean
  reason?: string
}

// Current privacy policy version
const POLICY_VERSION = '2.0.0'
const CONSENT_STORAGE_KEY = 'pdpl_consent'
const CONSENT_EXPIRY_DAYS = 365 // 1 year

/**
 * Default consent state (all non-essential disabled)
 */
const DEFAULT_CONSENTS: Record<ConsentCategory, ConsentRecord> = {
  essential: {
    category: 'essential',
    granted: true, // Always required
    timestamp: new Date().toISOString(),
    version: POLICY_VERSION,
    method: 'implicit',
  },
  functional: {
    category: 'functional',
    granted: false,
    timestamp: new Date().toISOString(),
    version: POLICY_VERSION,
    method: 'implicit',
  },
  analytics: {
    category: 'analytics',
    granted: false,
    timestamp: new Date().toISOString(),
    version: POLICY_VERSION,
    method: 'implicit',
  },
  marketing: {
    category: 'marketing',
    granted: false,
    timestamp: new Date().toISOString(),
    version: POLICY_VERSION,
    method: 'implicit',
  },
  third_party: {
    category: 'third_party',
    granted: false,
    timestamp: new Date().toISOString(),
    version: POLICY_VERSION,
    method: 'implicit',
  },
}

/**
 * Get consent state from storage
 */
function getConsentState(): ConsentState {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (stored) {
      const state = JSON.parse(stored) as ConsentState

      // Check if consent has expired
      if (state.expiresAt && new Date(state.expiresAt) < new Date()) {
        // Consent expired, reset to defaults
        return createDefaultState()
      }

      // Check if policy version changed
      if (state.policyVersion !== POLICY_VERSION) {
        // Policy updated, need to re-consent
        return createDefaultState()
      }

      return state
    }
  } catch {
    // Storage error
  }

  return createDefaultState()
}

/**
 * Create default consent state
 */
function createDefaultState(): ConsentState {
  const now = new Date()
  const expiry = new Date(now.getTime() + CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  return {
    consents: { ...DEFAULT_CONSENTS },
    history: [],
    lastUpdated: now.toISOString(),
    policyVersion: POLICY_VERSION,
    expiresAt: expiry.toISOString(),
  }
}

/**
 * Save consent state to storage
 */
function saveConsentState(state: ConsentState): void {
  try {
    state.lastUpdated = new Date().toISOString()
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state))
  } catch {
    console.warn('[Consent Manager] Failed to save consent state')
  }
}

/**
 * Check if a specific consent is granted
 */
export function hasConsent(category: ConsentCategory): boolean {
  const state = getConsentState()
  return state.consents[category]?.granted ?? false
}

/**
 * Check if all required consents for a feature are granted
 */
export function hasAllConsents(categories: ConsentCategory[]): boolean {
  return categories.every(cat => hasConsent(cat))
}

/**
 * Get all current consent statuses
 */
export function getAllConsents(): Record<ConsentCategory, boolean> {
  const state = getConsentState()
  const result: Record<ConsentCategory, boolean> = {} as any

  for (const [cat, record] of Object.entries(state.consents)) {
    result[cat as ConsentCategory] = record.granted
  }

  return result
}

/**
 * Grant consent for a category
 */
export function grantConsent(
  category: ConsentCategory,
  method: 'explicit' | 'implicit' = 'explicit'
): void {
  if (category === 'essential') return // Always granted

  const state = getConsentState()
  const previousValue = state.consents[category]?.granted ?? false

  const record: ConsentRecord = {
    category,
    granted: true,
    timestamp: new Date().toISOString(),
    version: POLICY_VERSION,
    method,
    userAgent: navigator.userAgent,
  }

  state.consents[category] = record

  // Add to history
  state.history.push({
    timestamp: record.timestamp,
    action: 'granted',
    category,
    previousValue,
    newValue: true,
  })

  saveConsentState(state)

  // Dispatch event for components to react
  window.dispatchEvent(new CustomEvent('consent-changed', {
    detail: { category, granted: true }
  }))
}

/**
 * Withdraw consent for a category (PDPL Article 5 - Right to Withdraw)
 */
export function withdrawConsent(
  category: ConsentCategory,
  reason?: string
): void {
  if (category === 'essential') return // Cannot withdraw essential

  const state = getConsentState()
  const previousValue = state.consents[category]?.granted ?? true

  const record: ConsentRecord = {
    category,
    granted: false,
    timestamp: new Date().toISOString(),
    version: POLICY_VERSION,
    method: 'withdrawn',
    userAgent: navigator.userAgent,
  }

  state.consents[category] = record

  // Add to history
  state.history.push({
    timestamp: record.timestamp,
    action: 'withdrawn',
    category,
    previousValue,
    newValue: false,
    reason,
  })

  saveConsentState(state)

  // Dispatch event for components to react
  window.dispatchEvent(new CustomEvent('consent-changed', {
    detail: { category, granted: false }
  }))
}

/**
 * Update multiple consents at once
 */
export function updateConsents(
  consents: Partial<Record<ConsentCategory, boolean>>
): void {
  for (const [category, granted] of Object.entries(consents)) {
    if (granted) {
      grantConsent(category as ConsentCategory)
    } else {
      withdrawConsent(category as ConsentCategory)
    }
  }
}

/**
 * Accept all consents
 */
export function acceptAllConsents(): void {
  const categories: ConsentCategory[] = ['functional', 'analytics', 'marketing', 'third_party']
  categories.forEach(cat => grantConsent(cat))
}

/**
 * Reject all optional consents
 */
export function rejectAllConsents(): void {
  const categories: ConsentCategory[] = ['functional', 'analytics', 'marketing', 'third_party']
  categories.forEach(cat => withdrawConsent(cat, 'User rejected all'))
}

/**
 * Get consent history (for audit/compliance)
 */
export function getConsentHistory(): ConsentHistoryEntry[] {
  const state = getConsentState()
  return [...state.history].reverse() // Most recent first
}

/**
 * Export consent data for user request (PDPL Article 15)
 */
export function exportConsentData(): {
  currentConsents: Record<ConsentCategory, ConsentRecord>
  history: ConsentHistoryEntry[]
  policyVersion: string
  lastUpdated: string
  expiresAt?: string
} {
  const state = getConsentState()

  return {
    currentConsents: state.consents,
    history: state.history,
    policyVersion: state.policyVersion,
    lastUpdated: state.lastUpdated,
    expiresAt: state.expiresAt,
  }
}

/**
 * Check if consent dialog should be shown
 */
export function shouldShowConsentDialog(): boolean {
  const state = getConsentState()

  // Show if no explicit consent given yet
  const hasExplicitConsent = Object.values(state.consents).some(
    c => c.method === 'explicit' || c.method === 'withdrawn'
  )

  return !hasExplicitConsent
}

/**
 * Check if policy version requires re-consent
 */
export function needsReConsent(): boolean {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!stored) return true

    const state = JSON.parse(stored) as ConsentState
    return state.policyVersion !== POLICY_VERSION
  } catch {
    return true
  }
}

/**
 * Set user ID for consent tracking
 */
export function setConsentUserId(userId: string): void {
  const state = getConsentState()
  state.userId = userId
  saveConsentState(state)
}

/**
 * Clear all consent data (PDPL Article 14 - Right to Deletion)
 */
export function clearAllConsentData(): void {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY)
  } catch {
    // Ignore errors
  }

  // Dispatch event
  window.dispatchEvent(new CustomEvent('consent-cleared'))
}

/**
 * Get human-readable consent category names (Arabic)
 */
export function getConsentCategoryName(category: ConsentCategory): string {
  const names: Record<ConsentCategory, string> = {
    essential: 'الأساسية (مطلوبة)',
    functional: 'الوظيفية',
    analytics: 'التحليلات',
    marketing: 'التسويق',
    third_party: 'الخدمات الخارجية',
  }
  return names[category]
}

/**
 * Get consent category descriptions (Arabic)
 */
export function getConsentCategoryDescription(category: ConsentCategory): string {
  const descriptions: Record<ConsentCategory, string> = {
    essential: 'ملفات تعريف الارتباط الضرورية لتشغيل الموقع بشكل صحيح',
    functional: 'تذكر تفضيلاتك وإعداداتك لتحسين تجربتك',
    analytics: 'مساعدتنا في فهم كيفية استخدامك للموقع لتحسينه',
    marketing: 'عرض إعلانات ومحتوى مخصص لك',
    third_party: 'السماح بدمج خدمات الطرف الثالث مثل الخرائط والمدفوعات',
  }
  return descriptions[category]
}

export default {
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
}

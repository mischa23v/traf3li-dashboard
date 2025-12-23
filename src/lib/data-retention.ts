/**
 * Data Retention Policy Automation
 * PDPL Article 14 Compliant - Data Retention and Deletion
 */

/**
 * Data category retention periods (in days)
 * Based on Saudi Arabia PDPL requirements and business needs
 */
export const RETENTION_PERIODS = {
  // Session/temporary data - short retention
  session_data: 1,              // 1 day
  temp_files: 7,                // 7 days
  failed_login_attempts: 30,    // 30 days

  // User activity - medium retention
  search_history: 90,           // 90 days
  browsing_history: 90,         // 90 days
  notification_history: 180,    // 6 months

  // Business data - standard retention
  audit_logs: 365 * 2,          // 2 years (NCA ECC requirement)
  access_logs: 365,             // 1 year
  api_logs: 180,                // 6 months

  // Financial data - extended retention
  invoices: 365 * 7,            // 7 years (Saudi tax requirement)
  payments: 365 * 7,            // 7 years
  financial_reports: 365 * 7,   // 7 years
  receipts: 365 * 7,            // 7 years

  // Legal data - case-based retention
  case_files: 365 * 10,         // 10 years after closure
  contracts: 365 * 10,          // 10 years after expiry
  client_data: 365 * 7,         // 7 years after relationship end

  // Consent data - indefinite (for compliance proof)
  consent_records: -1,          // -1 = keep indefinitely

  // Departed user data
  departed_user_data: 365 * 2,  // 2 years
} as const

export type RetentionCategory = keyof typeof RETENTION_PERIODS

/**
 * Data item with retention metadata
 */
export interface RetainedDataItem {
  key: string
  category: RetentionCategory
  createdAt: string
  expiresAt: string | null // null = never expires
  lastAccessed?: string
  metadata?: Record<string, any>
}

/**
 * Retention tracking state
 */
interface RetentionState {
  items: RetainedDataItem[]
  lastCleanup: string
  version: string
}

const RETENTION_STORAGE_KEY = 'data_retention_state'
const RETENTION_VERSION = '1.0.0'

/**
 * Get retention state from storage
 */
function getRetentionState(): RetentionState {
  try {
    const stored = localStorage.getItem(RETENTION_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Storage error
  }

  return {
    items: [],
    lastCleanup: new Date().toISOString(),
    version: RETENTION_VERSION,
  }
}

/**
 * Save retention state
 */
function saveRetentionState(state: RetentionState): void {
  try {
    localStorage.setItem(RETENTION_STORAGE_KEY, JSON.stringify(state))
  } catch {
    if (import.meta.env.DEV) {
      console.warn('[Data Retention] Failed to save retention state')
    }
  }
}

/**
 * Calculate expiry date for a category
 */
export function calculateExpiryDate(
  category: RetentionCategory,
  fromDate: Date = new Date()
): Date | null {
  const days = RETENTION_PERIODS[category]

  if (days === -1) {
    return null // Never expires
  }

  const expiryDate = new Date(fromDate)
  expiryDate.setDate(expiryDate.getDate() + days)
  return expiryDate
}

/**
 * Register data item for retention tracking
 */
export function registerDataItem(
  key: string,
  category: RetentionCategory,
  metadata?: Record<string, any>
): RetainedDataItem {
  const state = getRetentionState()
  const now = new Date()
  const expiryDate = calculateExpiryDate(category, now)

  const item: RetainedDataItem = {
    key,
    category,
    createdAt: now.toISOString(),
    expiresAt: expiryDate?.toISOString() || null,
    lastAccessed: now.toISOString(),
    metadata,
  }

  // Check if item already exists
  const existingIndex = state.items.findIndex(i => i.key === key)
  if (existingIndex >= 0) {
    // Update existing item
    state.items[existingIndex] = item
  } else {
    state.items.push(item)
  }

  saveRetentionState(state)
  return item
}

/**
 * Update last accessed time for an item
 */
export function touchDataItem(key: string): void {
  const state = getRetentionState()
  const item = state.items.find(i => i.key === key)

  if (item) {
    item.lastAccessed = new Date().toISOString()
    saveRetentionState(state)
  }
}

/**
 * Get all expired items
 */
export function getExpiredItems(): RetainedDataItem[] {
  const state = getRetentionState()
  const now = new Date()

  return state.items.filter(item => {
    if (!item.expiresAt) return false // Never expires
    return new Date(item.expiresAt) < now
  })
}

/**
 * Get items expiring soon (within N days)
 */
export function getExpiringItems(withinDays: number = 30): RetainedDataItem[] {
  const state = getRetentionState()
  const now = new Date()
  const futureDate = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)

  return state.items.filter(item => {
    if (!item.expiresAt) return false
    const expiryDate = new Date(item.expiresAt)
    return expiryDate > now && expiryDate <= futureDate
  })
}

/**
 * Remove expired items (cleanup)
 */
export function cleanupExpiredData(): {
  removedCount: number
  removedItems: string[]
} {
  const state = getRetentionState()
  const expiredItems = getExpiredItems()
  const removedItems: string[] = []

  for (const item of expiredItems) {
    // Remove from localStorage if it exists there
    try {
      localStorage.removeItem(item.key)
    } catch {
      // Item might not be in localStorage
    }

    // Remove from sessionStorage too
    try {
      sessionStorage.removeItem(item.key)
    } catch {
      // Item might not be in sessionStorage
    }

    removedItems.push(item.key)

    // Remove from tracking
    const index = state.items.findIndex(i => i.key === item.key)
    if (index >= 0) {
      state.items.splice(index, 1)
    }
  }

  state.lastCleanup = new Date().toISOString()
  saveRetentionState(state)

  return {
    removedCount: removedItems.length,
    removedItems,
  }
}

/**
 * Force delete a specific item (for user deletion requests)
 */
export function deleteDataItem(key: string): boolean {
  const state = getRetentionState()

  // Remove from storage
  try {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  } catch {
    // Ignore errors
  }

  // Remove from tracking
  const index = state.items.findIndex(i => i.key === key)
  if (index >= 0) {
    state.items.splice(index, 1)
    saveRetentionState(state)
    return true
  }

  return false
}

/**
 * Get retention statistics
 */
export function getRetentionStats(): {
  totalItems: number
  expiredItems: number
  expiringSoon: number
  byCategory: Record<string, number>
  lastCleanup: string
  oldestItem: string | null
  newestItem: string | null
} {
  const state = getRetentionState()
  const expiredItems = getExpiredItems()
  const expiringSoon = getExpiringItems(30)

  const byCategory: Record<string, number> = {}
  for (const item of state.items) {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1
  }

  // Find oldest and newest items
  let oldestItem: string | null = null
  let newestItem: string | null = null
  let oldestDate: Date | null = null
  let newestDate: Date | null = null

  for (const item of state.items) {
    const createdAt = new Date(item.createdAt)
    if (!oldestDate || createdAt < oldestDate) {
      oldestDate = createdAt
      oldestItem = item.key
    }
    if (!newestDate || createdAt > newestDate) {
      newestDate = createdAt
      newestItem = item.key
    }
  }

  return {
    totalItems: state.items.length,
    expiredItems: expiredItems.length,
    expiringSoon: expiringSoon.length,
    byCategory,
    lastCleanup: state.lastCleanup,
    oldestItem,
    newestItem,
  }
}

/**
 * Generate retention compliance report
 */
export function generateRetentionReport(): {
  generatedAt: string
  version: string
  stats: ReturnType<typeof getRetentionStats>
  categories: Array<{
    category: RetentionCategory
    retentionDays: number
    itemCount: number
    description: string
  }>
  expiredItems: RetainedDataItem[]
  expiringItems: RetainedDataItem[]
} {
  const stats = getRetentionStats()
  const expiredItems = getExpiredItems()
  const expiringItems = getExpiringItems(30)

  const categoryDescriptions: Record<RetentionCategory, string> = {
    session_data: 'بيانات الجلسة المؤقتة',
    temp_files: 'الملفات المؤقتة',
    failed_login_attempts: 'محاولات تسجيل الدخول الفاشلة',
    search_history: 'سجل البحث',
    browsing_history: 'سجل التصفح',
    notification_history: 'سجل الإشعارات',
    audit_logs: 'سجلات التدقيق',
    access_logs: 'سجلات الوصول',
    api_logs: 'سجلات API',
    invoices: 'الفواتير',
    payments: 'المدفوعات',
    financial_reports: 'التقارير المالية',
    receipts: 'الإيصالات',
    case_files: 'ملفات القضايا',
    contracts: 'العقود',
    client_data: 'بيانات العملاء',
    consent_records: 'سجلات الموافقة',
    departed_user_data: 'بيانات المستخدمين المغادرين',
  }

  const categories = Object.entries(RETENTION_PERIODS).map(([category, days]) => ({
    category: category as RetentionCategory,
    retentionDays: days,
    itemCount: stats.byCategory[category] || 0,
    description: categoryDescriptions[category as RetentionCategory],
  }))

  return {
    generatedAt: new Date().toISOString(),
    version: RETENTION_VERSION,
    stats,
    categories,
    expiredItems,
    expiringItems,
  }
}

/**
 * Schedule automatic cleanup (should be called on app init)
 */
let cleanupInterval: NodeJS.Timeout | null = null

export function startAutomaticCleanup(intervalHours: number = 24): void {
  // Run initial cleanup
  cleanupExpiredData()

  // Schedule periodic cleanup
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }

  cleanupInterval = setInterval(() => {
    cleanupExpiredData()
  }, intervalHours * 60 * 60 * 1000)
}

export function stopAutomaticCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
}

/**
 * Get human-readable retention period (Arabic)
 */
export function formatRetentionPeriod(days: number): string {
  if (days === -1) return 'غير محدد (دائم)'
  if (days === 1) return 'يوم واحد'
  if (days < 30) return `${days} يوم`
  if (days < 365) return `${Math.round(days / 30)} شهر`
  return `${Math.round(days / 365)} سنة`
}

export default {
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
}

/**
 * Lost Reason Types
 * Types for tracking why deals/cases are lost in CRM
 * Part of ERPNext CRM feature parity enhancement
 */

// ═══════════════════════════════════════════════════════════════
// LOST REASON TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Categories for lost reasons
 */
export type LostReasonCategory =
  | 'price'        // Price-related issues (too high, budget constraints)
  | 'competitor'   // Lost to a competitor
  | 'timing'       // Timing not right for client
  | 'scope'        // Scope mismatch or misalignment
  | 'relationship' // Communication or relationship issues
  | 'internal'     // Client's internal decisions
  | 'other'        // Other reasons

/**
 * Lost Reason Master Data
 * Tracks standardized reasons for losing cases/opportunities
 */
export interface LostReason {
  _id: string

  // Reason text (bilingual)
  reason: string           // English reason
  reasonAr: string        // Arabic reason (السبب بالعربية)

  // Category
  category: LostReasonCategory

  // Status
  enabled: boolean

  // Metadata
  createdAt: Date
  updatedAt: Date
}

/**
 * Data for creating a new lost reason
 */
export interface CreateLostReasonData {
  reason: string
  reasonAr: string
  category: LostReasonCategory
  enabled?: boolean
}

/**
 * Data for updating a lost reason
 */
export interface UpdateLostReasonData {
  reason?: string
  reasonAr?: string
  category?: LostReasonCategory
  enabled?: boolean
}

/**
 * Filters for querying lost reasons
 */
export interface LostReasonFilters {
  category?: LostReasonCategory
  enabled?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT LOST REASONS
// ═══════════════════════════════════════════════════════════════

/**
 * Default lost reasons created during CRM setup
 * Based on common reasons law firms lose cases/opportunities
 */
export const DEFAULT_LOST_REASONS: Omit<LostReason, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    reason: 'Price too high',
    reasonAr: 'السعر مرتفع جداً',
    category: 'price',
    enabled: true,
  },
  {
    reason: 'Chose competitor',
    reasonAr: 'اختار منافساً',
    category: 'competitor',
    enabled: true,
  },
  {
    reason: 'Budget constraints',
    reasonAr: 'قيود الميزانية',
    category: 'price',
    enabled: true,
  },
  {
    reason: 'Timing not right',
    reasonAr: 'التوقيت غير مناسب',
    category: 'timing',
    enabled: true,
  },
  {
    reason: 'Scope mismatch',
    reasonAr: 'عدم تطابق النطاق',
    category: 'scope',
    enabled: true,
  },
  {
    reason: 'No response',
    reasonAr: 'لا يوجد رد',
    category: 'relationship',
    enabled: true,
  },
  {
    reason: 'Internal decision',
    reasonAr: 'قرار داخلي',
    category: 'internal',
    enabled: true,
  },
  {
    reason: 'Other',
    reasonAr: 'أخرى',
    category: 'other',
    enabled: true,
  },
]

// ═══════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Lost reason category labels for UI display
 */
export const LOST_REASON_CATEGORY_LABELS: Record<LostReasonCategory, { en: string; ar: string }> = {
  price: {
    en: 'Price',
    ar: 'السعر',
  },
  competitor: {
    en: 'Competitor',
    ar: 'منافس',
  },
  timing: {
    en: 'Timing',
    ar: 'التوقيت',
  },
  scope: {
    en: 'Scope',
    ar: 'النطاق',
  },
  relationship: {
    en: 'Relationship',
    ar: 'العلاقة',
  },
  internal: {
    en: 'Internal',
    ar: 'داخلي',
  },
  other: {
    en: 'Other',
    ar: 'أخرى',
  },
}

/**
 * Category colors for UI display
 */
export const LOST_REASON_CATEGORY_COLORS: Record<LostReasonCategory, string> = {
  price: '#F59E0B',      // Amber
  competitor: '#EF4444', // Red
  timing: '#8B5CF6',     // Purple
  scope: '#3B82F6',      // Blue
  relationship: '#EC4899', // Pink
  internal: '#6B7280',   // Gray
  other: '#64748B',      // Slate
}

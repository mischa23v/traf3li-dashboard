/**
 * CRM Master Data Types
 *
 * This file contains all master data type definitions for the CRM module
 * based on the CRM Enhancement Plan - ERPNext Feature Parity
 */

// ═══════════════════════════════════════════════════════════════════════════
// TERRITORY (Phase 2.1)
// ═══════════════════════════════════════════════════════════════════════════

export interface Territory {
  _id: string
  name: string
  nameAr: string
  parentTerritoryId?: string   // For hierarchy
  isGroup: boolean

  // Tree structure
  level: number
  path: string                 // e.g., "saudi-arabia/riyadh/north-riyadh"

  // Targets
  targets?: {
    year: number
    quarter?: number
    targetAmount: number
    achievedAmount: number
  }[]

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════════════════════
// SALES PERSON (Phase 2.2)
// ═══════════════════════════════════════════════════════════════════════════

export interface SalesPerson {
  _id: string
  name: string
  nameAr: string
  parentSalesPersonId?: string  // For hierarchy
  isGroup: boolean

  // Employee link
  employeeId?: string
  userId?: string

  // Commission
  commissionRate: number        // Percentage

  // Territory assignment
  territoryIds: string[]

  // Targets
  targets?: {
    year: number
    quarter?: number
    month?: number
    targetAmount: number
    achievedAmount: number
    targetLeads?: number
    achievedLeads?: number
    targetCases?: number
    achievedCases?: number
  }[]

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════════════════════
// LEAD SOURCE (Phase 2.3)
// ═══════════════════════════════════════════════════════════════════════════

export interface LeadSource {
  _id: string
  name: string
  nameAr: string
  slug: string                  // URL-friendly
  description?: string

  // UTM mapping
  utmSource?: string
  utmMedium?: string

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════════════════════
// SALES STAGE (Phase 2.4)
// ═══════════════════════════════════════════════════════════════════════════

export interface SalesStage {
  _id: string
  name: string
  nameAr: string
  order: number

  // Default probability at this stage
  defaultProbability: number

  // Stage type
  type: 'open' | 'won' | 'lost'

  // Color for UI
  color: string

  // Actions
  requiresConflictCheck?: boolean
  requiresQualification?: boolean
  autoCreateQuote?: boolean

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════════════════════
// LOST REASON (Phase 2.5)
// ═══════════════════════════════════════════════════════════════════════════

export interface LostReason {
  _id: string
  reason: string
  reasonAr: string
  category: 'price' | 'competitor' | 'timing' | 'scope' | 'relationship' | 'internal' | 'other'

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR (Phase 2.6)
// ═══════════════════════════════════════════════════════════════════════════

export interface Competitor {
  _id: string
  name: string
  nameAr: string
  website?: string
  description?: string

  // Tracking
  casesLostTo: number
  casesWonAgainst: number

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════════════════════
// MARKET SEGMENT (Phase 2.7)
// ═══════════════════════════════════════════════════════════════════════════

export interface MarketSegment {
  _id: string
  name: string
  nameAr: string
  description?: string

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════════════════════
// INDUSTRY (Phase 2.8)
// ═══════════════════════════════════════════════════════════════════════════

export interface Industry {
  _id: string
  name: string
  nameAr: string

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CONSTANTS (Phase 4.4)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Default Lead Sources for CRM Setup Wizard (Step 2)
 */
export const DEFAULT_LEAD_SOURCES = [
  { name: 'Website', nameAr: 'الموقع الإلكتروني', utmSource: 'website' },
  { name: 'Referral', nameAr: 'إحالة', utmSource: 'referral' },
  { name: 'Social Media', nameAr: 'وسائل التواصل الاجتماعي', utmSource: 'social' },
  { name: 'Advertisement', nameAr: 'إعلان', utmSource: 'ads' },
  { name: 'Walk-in', nameAr: 'زيارة مباشرة', utmSource: 'walkin' },
  { name: 'Phone Call', nameAr: 'مكالمة هاتفية', utmSource: 'phone' },
  { name: 'Email Campaign', nameAr: 'حملة بريد إلكتروني', utmSource: 'email' },
  { name: 'Event', nameAr: 'فعالية', utmSource: 'event' },
] as const

/**
 * Default Sales Stages for CRM Setup Wizard (Step 3)
 */
export const DEFAULT_SALES_STAGES = [
  {
    name: 'Intake',
    nameAr: 'الاستقبال',
    order: 1,
    probability: 10,
    color: '#6B7280',
    type: 'open' as const
  },
  {
    name: 'Conflict Check',
    nameAr: 'فحص التعارض',
    order: 2,
    probability: 20,
    color: '#F59E0B',
    type: 'open' as const,
    requiresConflictCheck: true
  },
  {
    name: 'Qualified',
    nameAr: 'مؤهل',
    order: 3,
    probability: 40,
    color: '#3B82F6',
    type: 'open' as const,
    requiresQualification: true
  },
  {
    name: 'Proposal Sent',
    nameAr: 'تم إرسال العرض',
    order: 4,
    probability: 60,
    color: '#8B5CF6',
    type: 'open' as const
  },
  {
    name: 'Negotiation',
    nameAr: 'التفاوض',
    order: 5,
    probability: 80,
    color: '#EC4899',
    type: 'open' as const
  },
  {
    name: 'Won',
    nameAr: 'تم الفوز',
    order: 6,
    probability: 100,
    color: '#10B981',
    type: 'won' as const
  },
  {
    name: 'Lost',
    nameAr: 'خسارة',
    order: 7,
    probability: 0,
    color: '#EF4444',
    type: 'lost' as const
  },
] as const

/**
 * Default Lost Reasons for CRM Setup Wizard (Step 4)
 */
export const DEFAULT_LOST_REASONS = [
  { reason: 'Price too high', reasonAr: 'السعر مرتفع جداً', category: 'price' as const },
  { reason: 'Chose competitor', reasonAr: 'اختار منافساً', category: 'competitor' as const },
  { reason: 'Budget constraints', reasonAr: 'قيود الميزانية', category: 'price' as const },
  { reason: 'Timing not right', reasonAr: 'التوقيت غير مناسب', category: 'timing' as const },
  { reason: 'Scope mismatch', reasonAr: 'عدم تطابق النطاق', category: 'scope' as const },
  { reason: 'No response', reasonAr: 'لا يوجد رد', category: 'relationship' as const },
  { reason: 'Internal decision', reasonAr: 'قرار داخلي', category: 'internal' as const },
  { reason: 'Other', reasonAr: 'أخرى', category: 'other' as const },
] as const

/**
 * Default Territories for Saudi Arabia (CRM Setup Wizard Step 5)
 */
export const DEFAULT_TERRITORIES_SA = [
  { name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', isGroup: true, level: 0 },
  { name: 'Riyadh Region', nameAr: 'منطقة الرياض', isGroup: true, level: 1, parentName: 'Saudi Arabia' },
  { name: 'Makkah Region', nameAr: 'منطقة مكة المكرمة', isGroup: true, level: 1, parentName: 'Saudi Arabia' },
  { name: 'Eastern Region', nameAr: 'المنطقة الشرقية', isGroup: true, level: 1, parentName: 'Saudi Arabia' },
  { name: 'Madinah Region', nameAr: 'منطقة المدينة المنورة', isGroup: true, level: 1, parentName: 'Saudi Arabia' },
  { name: 'Riyadh City', nameAr: 'مدينة الرياض', isGroup: false, level: 2, parentName: 'Riyadh Region' },
  { name: 'Jeddah', nameAr: 'جدة', isGroup: false, level: 2, parentName: 'Makkah Region' },
  { name: 'Dammam', nameAr: 'الدمام', isGroup: false, level: 2, parentName: 'Eastern Region' },
] as const

/**
 * Default Customer Groups for CRM Setup Wizard (Step 6)
 */
export const DEFAULT_CUSTOMER_GROUPS = [
  { name: 'Individual', nameAr: 'فرد' },
  { name: 'Commercial', nameAr: 'تجاري' },
  { name: 'Government', nameAr: 'حكومي' },
  { name: 'Non-Profit', nameAr: 'غير ربحي' },
  { name: 'VIP', nameAr: 'كبار العملاء' },
] as const

// ═══════════════════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Type for territory default data
 */
export type TerritoryDefaultData = {
  name: string
  nameAr: string
  isGroup: boolean
  level: number
  parentName?: string
}

/**
 * Type for customer group default data
 */
export type CustomerGroupDefaultData = {
  name: string
  nameAr: string
}

/**
 * Type for lead source default data
 */
export type LeadSourceDefaultData = {
  name: string
  nameAr: string
  utmSource: string
}

/**
 * Type for sales stage default data
 */
export type SalesStageDefaultData = {
  name: string
  nameAr: string
  order: number
  probability: number
  color: string
  type: 'open' | 'won' | 'lost'
  requiresConflictCheck?: boolean
  requiresQualification?: boolean
}

/**
 * Type for lost reason default data
 */
export type LostReasonDefaultData = {
  reason: string
  reasonAr: string
  category: 'price' | 'competitor' | 'timing' | 'scope' | 'relationship' | 'internal' | 'other'
}

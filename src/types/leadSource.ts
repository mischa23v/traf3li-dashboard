/**
 * Lead Source Type Definitions
 *
 * Based on CRM Enhancement Plan - Phase 2.3
 * Tracks where leads originate from with UTM mapping support
 */

/**
 * Lead Source Interface
 *
 * Represents a source from which leads can originate (e.g., Website, Referral, Social Media).
 * Includes UTM parameter mapping for marketing attribution tracking.
 */
export interface LeadSource {
  /** Unique identifier */
  _id: string

  /** Lead source name (English) */
  name: string

  /** Lead source name (Arabic) */
  nameAr: string

  /** URL-friendly identifier for the lead source */
  slug: string

  /** Optional description of the lead source */
  description?: string

  /** UTM source parameter mapping for analytics tracking */
  utmSource?: string

  /** UTM medium parameter mapping for analytics tracking */
  utmMedium?: string

  /** Whether this lead source is active and available for selection */
  enabled: boolean

  /** Timestamp when the lead source was created */
  createdAt: Date

  /** Timestamp when the lead source was last updated */
  updatedAt: Date
}

/**
 * Default Lead Sources
 *
 * Pre-configured lead sources commonly used in CRM systems.
 * These are used during CRM setup wizard initialization.
 */
export const DEFAULT_LEAD_SOURCES: Omit<LeadSource, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Website',
    nameAr: 'الموقع الإلكتروني',
    slug: 'website',
    utmSource: 'website',
    enabled: true,
  },
  {
    name: 'Referral',
    nameAr: 'إحالة',
    slug: 'referral',
    utmSource: 'referral',
    enabled: true,
  },
  {
    name: 'Social Media',
    nameAr: 'وسائل التواصل الاجتماعي',
    slug: 'social-media',
    utmSource: 'social',
    enabled: true,
  },
  {
    name: 'Advertisement',
    nameAr: 'إعلان',
    slug: 'advertisement',
    utmSource: 'ads',
    enabled: true,
  },
  {
    name: 'Walk-in',
    nameAr: 'زيارة مباشرة',
    slug: 'walk-in',
    utmSource: 'walkin',
    enabled: true,
  },
  {
    name: 'Phone Call',
    nameAr: 'مكالمة هاتفية',
    slug: 'phone-call',
    utmSource: 'phone',
    enabled: true,
  },
  {
    name: 'Email Campaign',
    nameAr: 'حملة بريد إلكتروني',
    slug: 'email-campaign',
    utmSource: 'email',
    enabled: true,
  },
  {
    name: 'Event',
    nameAr: 'فعالية',
    slug: 'event',
    utmSource: 'event',
    enabled: true,
  },
]

/**
 * Type for creating a new Lead Source (without system-generated fields)
 */
export type CreateLeadSourceInput = Omit<LeadSource, '_id' | 'createdAt' | 'updatedAt'>

/**
 * Type for updating an existing Lead Source (all fields optional except _id)
 */
export type UpdateLeadSourceInput = Partial<Omit<LeadSource, '_id' | 'createdAt' | 'updatedAt'>> & {
  _id: string
}

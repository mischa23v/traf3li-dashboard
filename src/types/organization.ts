/**
 * Organization Types
 * Comprehensive types for the Organization entity
 * Supports hierarchy, financial, tax, and Saudi-specific fields
 */

import type { NationalAddress } from './najiz'
import type { OfficeType } from '@/constants/crm-constants'

// ═══════════════════════════════════════════════════════════════
// ORGANIZATION STATUS
// ═══════════════════════════════════════════════════════════════

export type OrganizationStatus = 'active' | 'inactive' | 'suspended' | 'dissolved'

export type OrganizationType =
  | 'company'
  | 'partnership'
  | 'sole_proprietorship'
  | 'non_profit'
  | 'government'
  | 'court'
  | 'law_firm'
  | 'other'

// ═══════════════════════════════════════════════════════════════
// BANK ACCOUNT
// ═══════════════════════════════════════════════════════════════

export interface BankAccount {
  bank_name: string
  bank_name_ar?: string
  account_number: string
  iban?: string
  swift_code?: string
  branch_name?: string
  is_primary: boolean
  currency?: string
}

// ═══════════════════════════════════════════════════════════════
// SOCIAL NETWORKS
// ═══════════════════════════════════════════════════════════════

export interface SocialNetworks {
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  youtube?: string
  website?: string
  other?: Record<string, string>
}

// ═══════════════════════════════════════════════════════════════
// ORGANIZATION INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface Organization {
  _id: string
  organizationId: string
  lawyerId: string

  // ─── Identity ───
  legal_name: string
  legal_name_ar?: string
  trade_name?: string
  trade_name_ar?: string
  short_name?: string
  display_name: string

  // ─── Type & Classification ───
  organization_type: OrganizationType
  office_type: OfficeType

  // ─── Hierarchy ───
  parent_organization_id?: string
  parent_organization?: {
    _id: string
    legal_name: string
  }
  subsidiary_ids?: string[]
  subsidiaries_count?: number

  // ─── Industry Classification ───
  industry_id?: string
  industry_name?: string
  industry_name_ar?: string
  sector_id?: string
  sector_name?: string
  sector_name_ar?: string
  sic_code?: string
  naics_code?: string

  // ─── Size & Revenue ───
  employee_count?: string // '1', '2-10', '11-50', '51-200', '201-500', '500+'
  annual_revenue?: number
  annual_revenue_range?: string
  fiscal_year_end?: number // Month 1-12

  // ─── Financial ───
  bank_accounts?: BankAccount[]
  primary_bank_account?: BankAccount
  payment_terms?: string // 'immediate', 'net_15', 'net_30', 'net_45', 'net_60'
  credit_limit?: number
  credit_used?: number
  credit_available?: number
  credit_rating?: string // 'excellent', 'good', 'fair', 'poor'
  credit_status?: 'good' | 'warning' | 'hold' | 'blacklisted'
  currency?: string

  // ─── Tax Information ───
  tax_exempt: boolean
  tax_exempt_reason?: string
  vat_number?: string
  vat_registered: boolean
  tax_id?: string

  // ─── Saudi-Specific Fields ───
  cr_number?: string // Commercial Registration
  cr_expiry_date?: string
  unified_number?: string // Unified National Number
  municipality_license?: string
  municipality_license_expiry?: string
  chamber_number?: string // Chamber of Commerce
  legal_form?: string
  legal_form_ar?: string
  capital?: number
  capital_currency?: string
  establishment_date?: string

  // ─── Authorized Person ───
  authorized_person?: string
  authorized_person_ar?: string
  authorized_person_title?: string
  authorized_person_id_type?: string
  authorized_person_id_number?: string

  // ─── Primary Contact ───
  primary_contact_id?: string
  primary_contact?: {
    _id: string
    firstName: string
    lastName?: string
    email?: string
    phone?: string
  }

  // ─── Linked Contacts ───
  contact_ids?: string[]
  contacts_count?: number

  // ─── Linked Leads ───
  lead_ids?: string[]
  leads_count?: number

  // ─── Linked Clients ───
  client_ids?: string[]
  clients_count?: number

  // ─── Address ───
  headquarters_address?: NationalAddress
  mailing_address?: NationalAddress
  branch_addresses?: NationalAddress[]

  // ─── Legacy Address (simple) ───
  address?: string
  city?: string
  district?: string
  postal_code?: string
  country?: string
  region?: string

  // ─── Communication ───
  phone?: string
  phone_secondary?: string
  fax?: string
  email?: string
  email_secondary?: string
  website?: string
  social_networks?: SocialNetworks

  // ─── Preferences ───
  preferred_language?: 'ar' | 'en'
  preferred_contact_method?: 'email' | 'phone' | 'fax' | 'mail'
  do_not_contact?: boolean
  do_not_email?: boolean
  do_not_call?: boolean

  // ─── Status & Flags ───
  status: OrganizationStatus
  is_customer: boolean
  is_vendor: boolean
  is_partner: boolean
  is_competitor: boolean
  is_verified: boolean
  verification_date?: string
  verification_source?: string

  // ─── Relationship ───
  account_manager_id?: string
  account_manager_name?: string
  territory_id?: string
  territory_name?: string
  sales_team_id?: string
  sales_team_name?: string

  // ─── Statistics ───
  total_cases?: number
  active_cases?: number
  total_revenue?: number
  lifetime_value?: number
  last_activity_date?: string
  days_since_last_activity?: number

  // ─── Risk & Compliance ───
  risk_level?: 'low' | 'medium' | 'high'
  is_blacklisted: boolean
  blacklist_reason?: string
  conflict_check_status?: 'not_checked' | 'clear' | 'potential_conflict' | 'confirmed_conflict'
  conflict_notes?: string

  // ─── Meta ───
  notes?: string
  tags?: string[]
  priority?: 'low' | 'normal' | 'high' | 'vip'
  logo?: string
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

// ═══════════════════════════════════════════════════════════════
// CREATE/UPDATE DATA
// ═══════════════════════════════════════════════════════════════

export interface CreateOrganizationData {
  // Required
  legal_name: string
  organization_type: OrganizationType
  office_type: OfficeType

  // Optional
  legal_name_ar?: string
  trade_name?: string
  trade_name_ar?: string
  short_name?: string

  // Hierarchy
  parent_organization_id?: string

  // Classification
  industry_id?: string
  sector_id?: string
  sic_code?: string
  naics_code?: string

  // Size
  employee_count?: string
  annual_revenue?: number

  // Financial
  bank_accounts?: BankAccount[]
  payment_terms?: string
  credit_limit?: number
  currency?: string

  // Tax
  tax_exempt?: boolean
  tax_exempt_reason?: string
  vat_number?: string
  tax_id?: string

  // Saudi
  cr_number?: string
  cr_expiry_date?: string
  unified_number?: string
  municipality_license?: string
  chamber_number?: string
  legal_form?: string
  capital?: number
  establishment_date?: string

  // Authorized Person
  authorized_person?: string
  authorized_person_ar?: string
  authorized_person_title?: string

  // Contact
  primary_contact_id?: string
  contact_ids?: string[]

  // Address
  headquarters_address?: NationalAddress
  address?: string
  city?: string
  country?: string

  // Communication
  phone?: string
  fax?: string
  email?: string
  website?: string

  // Preferences
  preferred_language?: 'ar' | 'en'
  preferred_contact_method?: 'email' | 'phone' | 'fax' | 'mail'

  // Status
  is_customer?: boolean
  is_vendor?: boolean
  is_partner?: boolean

  // Meta
  notes?: string
  tags?: string[]
  priority?: 'low' | 'normal' | 'high' | 'vip'
}

export type UpdateOrganizationData = Partial<CreateOrganizationData> & {
  status?: OrganizationStatus
}

// ═══════════════════════════════════════════════════════════════
// FILTERS
// ═══════════════════════════════════════════════════════════════

export interface OrganizationFilters {
  search?: string
  status?: OrganizationStatus
  organization_type?: OrganizationType
  office_type?: OfficeType
  industry_id?: string
  sector_id?: string
  is_customer?: boolean
  is_vendor?: boolean
  is_partner?: boolean
  parent_organization_id?: string
  territory_id?: string
  sales_team_id?: string
  account_manager_id?: string
  city?: string
  country?: string
  risk_level?: string
  is_blacklisted?: boolean
  tags?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// ═══════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════

export interface OrganizationStats {
  total: number
  active: number
  inactive: number
  customers: number
  vendors: number
  partners: number
  by_type: { _id: OrganizationType; count: number }[]
  by_industry: { _id: string; name: string; count: number }[]
  by_size: { _id: string; count: number }[]
  total_revenue: number
  avg_lifetime_value: number
}

// ═══════════════════════════════════════════════════════════════
// MERGE
// ═══════════════════════════════════════════════════════════════

export interface MergeOrganizationsData {
  source_ids: string[]
  target_id: string
  merge_strategy: 'keep_target' | 'keep_newest' | 'merge_all'
  merge_contacts?: boolean
  merge_leads?: boolean
  merge_clients?: boolean
}

export interface MergeOrganizationsResult {
  success: boolean
  target_organization: Organization
  merged_count: number
  contacts_merged: number
  leads_merged: number
  clients_merged: number
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSES
// ═══════════════════════════════════════════════════════════════

export interface OrganizationListResponse {
  success: boolean
  data: Organization[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface OrganizationResponse {
  success: boolean
  data: Organization
}

export interface OrganizationContactsResponse {
  success: boolean
  data: Array<{
    _id: string
    firstName: string
    lastName?: string
    email?: string
    phone?: string
    role?: string
    is_primary: boolean
  }>
}

export interface OrganizationSubsidiariesResponse {
  success: boolean
  data: Organization[]
}

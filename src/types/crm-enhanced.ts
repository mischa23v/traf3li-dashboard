/**
 * Enhanced CRM Types
 * Extends base CRM types with all missing fields from the audit
 *
 * This file adds advanced features:
 * - Revenue & Forecasting
 * - Email/Phone Validation
 * - Duplicate Detection
 * - Lead Enrichment
 * - Stale Detection
 * - Multiple Communications
 * - Activity Plans & Recurring Activities
 * - Sales Quotas
 * - Competitor Tracking
 */

import type {
  Lead,
  Contact,
  PipelineStage,
  CrmActivity,
  ActivityType,
  LeadStatus,
} from '@/types/crm'
import type { OfficeType } from '@/constants/crm-constants'

// ═══════════════════════════════════════════════════════════════
// ENHANCED LEAD TYPE
// ═══════════════════════════════════════════════════════════════

export interface LeadEnhanced extends Lead {
  // ─── Revenue & Forecasting ───
  recurring_revenue?: number
  recurring_plan?: 'monthly' | 'quarterly' | 'yearly'
  prorated_revenue?: number // calculated: expectedValue * probability

  // ─── Validation ───
  email_state?: 'unknown' | 'valid' | 'invalid' | 'bounced'
  phone_state?: 'unknown' | 'valid' | 'invalid'

  // ─── Duplicate Detection ───
  duplicate_lead_ids?: string[]
  duplicate_count?: number
  is_duplicate?: boolean

  // ─── Enrichment ───
  annual_revenue?: number
  employee_count?: string
  industry_id?: string
  sector_id?: string
  first_response_time?: number // seconds

  // ─── Qualification Enhancement ───
  qualified_by?: string
  qualified_on?: string

  // ─── Stale Detection ───
  days_in_stage?: number
  is_stale?: boolean
  stale_since?: string

  // ─── Office Type ───
  office_type?: OfficeType

  // ─── Commercial Status ───
  commercial_status?: 'cold' | 'warm' | 'hot' | 'customer' | 'inactive'
  prospect_level?: 'PL_NONE' | 'PL_LOW' | 'PL_MEDIUM' | 'PL_HIGH' | 'PL_EXCELLENT'

  // ─── Competitor Tracking ───
  competitors?: Array<{
    name: string
    notes?: string
  }>
}

// ═══════════════════════════════════════════════════════════════
// ENHANCED CONTACT TYPE
// ═══════════════════════════════════════════════════════════════

export interface ContactEnhanced extends Omit<Contact, 'email' | 'phone'> {
  // ─── Multiple Communications ───
  email_addresses?: Array<{
    email: string
    type: 'work' | 'personal' | 'other'
    is_primary: boolean
    validation_state?: 'unknown' | 'valid' | 'invalid' | 'bounced'
  }>

  phone_numbers?: Array<{
    number: string
    type: 'work' | 'mobile' | 'home' | 'fax'
    is_primary: boolean
    validation_state?: 'unknown' | 'valid' | 'invalid'
  }>

  // Keep legacy single email/phone for backward compatibility
  email?: string
  phone?: string

  // ─── Roles per Organization ───
  organization_roles?: Array<{
    organization_id: string
    organization_name?: string
    role: 'decision_maker' | 'influencer' | 'technical' | 'billing' | 'legal' | 'executive' | 'primary' | 'secondary'
    is_primary: boolean
  }>

  // ─── Birthday & Alerts ───
  birthday?: string
  birthday_alert?: boolean
  days_to_birthday?: number

  // ─── Sync ───
  google_contact_id?: string
  sync_with_google?: boolean
  last_synced_at?: string

  // ─── Office Type ───
  office_type?: OfficeType
}

// ═══════════════════════════════════════════════════════════════
// ENHANCED PIPELINE STAGE
// ═══════════════════════════════════════════════════════════════

export interface PipelineStageEnhanced extends PipelineStage {
  // ─── Stale Detection ───
  rotting_threshold_days?: number
  is_rotting_enabled?: boolean

  // ─── Requirements ───
  requirements?: string
  stage_checklist?: Array<{
    item: string
    item_ar?: string
    required: boolean
  }>

  // ─── Display ───
  fold?: boolean
  team_ids?: string[]
}

// ═══════════════════════════════════════════════════════════════
// ENHANCED ACTIVITY TYPE
// ═══════════════════════════════════════════════════════════════

export interface ActivityEnhanced extends CrmActivity {
  // ─── Recurring ───
  is_recurring?: boolean
  recurrence_rule?: string // RRULE format (RFC 5545)
  recurrence_end_date?: string
  parent_activity_id?: string

  // ─── Chaining ───
  chaining_type?: 'suggest' | 'trigger' | 'none'
  suggested_activity_ids?: string[]
  next_activity_template_id?: string

  // ─── Reminders ───
  reminders?: Array<{
    offset_value: number
    offset_unit: 'minutes' | 'hours' | 'days'
    type: 'email' | 'browser' | 'sms' | 'whatsapp'
    sent?: boolean
  }>

  // ─── Feedback ───
  feedback?: string

  // ─── Busy Status (Calendar Integration) ───
  transparency?: 'available' | 'busy' | 'tentative'
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY PLAN TYPES
// ═══════════════════════════════════════════════════════════════

export interface ActivityPlan {
  _id: string
  plan_id: string
  lawyer_id: string
  name: string
  name_ar?: string
  description?: string
  description_ar?: string
  steps: ActivityPlanStep[]
  trigger_on?: 'stage_enter' | 'stage_exit' | 'lead_created' | 'manual'
  trigger_stage_id?: string // If triggered by stage
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface ActivityPlanStep {
  step_id: string
  activity_type: ActivityType
  title: string
  title_ar?: string
  description?: string
  description_ar?: string
  delay_days: number
  delay_hours?: number
  assigned_to?: 'lead_owner' | string // user_id or 'lead_owner'
  is_required: boolean
  order: number
  template_config?: {
    // Pre-fill activity fields
    duration?: number
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    tags?: string[]
  }
}

export interface CreateActivityPlanData {
  name: string
  name_ar?: string
  description?: string
  description_ar?: string
  trigger_on?: 'stage_enter' | 'stage_exit' | 'lead_created' | 'manual'
  trigger_stage_id?: string
  steps: Omit<ActivityPlanStep, 'step_id'>[]
}

export interface ActivityPlanExecution {
  _id: string
  execution_id: string
  plan_id: string
  lead_id: string
  started_at: string
  completed_at?: string
  cancelled_at?: string
  status: 'active' | 'completed' | 'cancelled'
  steps_completed: number
  total_steps: number
  created_activities: string[] // activity_ids
}

// ═══════════════════════════════════════════════════════════════
// SALES QUOTA TYPES
// ═══════════════════════════════════════════════════════════════

export type QuotaPeriod = 'monthly' | 'quarterly' | 'yearly'
export type QuotaStatus = 'on_track' | 'behind' | 'ahead' | 'completed'

export interface SalesQuota {
  _id: string
  quota_id: string
  lawyer_id: string
  user_id: string
  user_name?: string
  period: QuotaPeriod
  period_start: string
  period_end: string

  // Targets
  target_revenue: number
  target_leads: number
  target_conversions: number

  // Actuals (computed)
  actual_revenue?: number
  actual_leads?: number
  actual_conversions?: number

  // Progress
  progress_percentage?: number
  status: QuotaStatus

  // Meta
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CreateQuotaData {
  user_id: string
  period: QuotaPeriod
  period_start: string
  period_end: string
  target_revenue: number
  target_leads: number
  target_conversions: number
}

export interface QuotaProgress {
  quota: SalesQuota
  revenue_progress: number
  leads_progress: number
  conversions_progress: number
  overall_progress: number
  days_remaining: number
  daily_pace_required: {
    revenue: number
    leads: number
    conversions: number
  }
  is_on_track: boolean
}

// ═══════════════════════════════════════════════════════════════
// DUPLICATE DETECTION TYPES
// ═══════════════════════════════════════════════════════════════

export interface DuplicateMatch {
  lead_id: string
  match_score: number // 0-100
  match_reasons: Array<{
    field: string
    similarity: number
  }>
  display_name: string
  email?: string
  phone?: string
  status: LeadStatus
  created_at: string
  last_contacted_at?: string
}

export interface DuplicateDetectionResult {
  lead_id: string
  duplicates: DuplicateMatch[]
  has_duplicates: boolean
  highest_score: number
}

export type MergeStrategy = 'keep_target' | 'keep_newest' | 'merge_all'

export interface MergeLeadsData {
  source_ids: string[]
  target_id: string
  merge_strategy: MergeStrategy
  field_preferences?: Record<string, 'source' | 'target'>
}

export interface MergeResult {
  merged_lead_id: string
  archived_lead_ids: string[]
  merged_fields: string[]
  conflicts_resolved: number
}

// ═══════════════════════════════════════════════════════════════
// REVENUE FORECAST TYPES
// ═══════════════════════════════════════════════════════════════

export interface RevenueForecast {
  period: string // ISO date or 'YYYY-MM'
  period_start: string
  period_end: string
  expected_revenue: number // Sum of all lead values
  prorated_revenue: number // probability weighted (sum of expectedValue * probability)
  best_case: number // Sum of high-probability leads
  worst_case: number // Sum of only near-certain leads
  leads_count: number
  avg_probability: number
}

export interface ForecastByStage {
  stage_id: string
  stage_name: string
  stage_name_ar?: string
  leads_count: number
  total_value: number
  prorated_value: number // total_value * avg_probability
  avg_probability: number
  avg_days_in_stage: number
}

export interface ForecastBySource {
  source: string
  leads_count: number
  total_value: number
  prorated_value: number
  avg_probability: number
  conversion_rate: number
}

export interface ForecastByOwner {
  user_id: string
  user_name: string
  leads_count: number
  total_value: number
  prorated_value: number
  avg_probability: number
  quota_achievement?: number // percentage
}

export interface ComprehensiveForecast {
  overall: RevenueForecast
  by_stage: ForecastByStage[]
  by_source: ForecastBySource[]
  by_owner: ForecastByOwner[]
  trends: {
    week_over_week?: number
    month_over_month?: number
  }
}

export interface ForecastFilters {
  period?: QuotaPeriod
  start_date?: string
  end_date?: string
  pipeline_id?: string
  user_id?: string
  include_archived?: boolean
}

// ═══════════════════════════════════════════════════════════════
// STALE LEAD DETECTION
// ═══════════════════════════════════════════════════════════════

export interface StaleLeadConfig {
  warning_threshold_days: number // Default: 14
  stale_threshold_days: number // Default: 30
  dormant_threshold_days: number // Default: 60
  auto_notify_owner: boolean
  auto_change_status?: boolean
  exclude_statuses?: LeadStatus[]
}

export interface StaleLead {
  lead_id: string
  display_name: string
  status: LeadStatus
  stage_name?: string
  days_without_activity: number
  days_in_current_stage: number
  last_activity_date?: string
  assigned_to?: string
  severity: 'warning' | 'stale' | 'dormant'
  estimated_value: number
}

export interface StaleLeadReport {
  warning_leads: StaleLead[]
  stale_leads: StaleLead[]
  dormant_leads: StaleLead[]
  total_at_risk_value: number
  summary: {
    warning_count: number
    stale_count: number
    dormant_count: number
    total_count: number
  }
}

// ═══════════════════════════════════════════════════════════════
// LEAD ENRICHMENT
// ═══════════════════════════════════════════════════════════════

export interface LeadEnrichmentData {
  lead_id: string
  enrichment_source: 'clearbit' | 'hunter' | 'linkedin' | 'manual' | 'crm_lookup'
  enriched_fields: string[]
  enriched_at: string
  data: {
    // Company data
    company_name?: string
    company_domain?: string
    company_industry?: string
    company_sector?: string
    employee_count?: string
    annual_revenue?: number

    // Location
    country?: string
    city?: string
    region?: string

    // Social
    linkedin_url?: string
    twitter_url?: string
    facebook_url?: string

    // Contact
    verified_email?: string
    verified_phone?: string
  }
}

// ═══════════════════════════════════════════════════════════════
// COMPETITOR TRACKING
// ═══════════════════════════════════════════════════════════════

export interface Competitor {
  name: string
  notes?: string
  added_at?: string
  added_by?: string
}

export interface CompetitorAnalysis {
  competitor_name: string
  leads_count: number
  won_count: number
  lost_count: number
  win_rate: number
  total_value_won: number
  total_value_lost: number
  common_objections: string[]
  avg_deal_size: number
}

// ═══════════════════════════════════════════════════════════════
// FIRST RESPONSE TIME TRACKING
// ═══════════════════════════════════════════════════════════════

export interface FirstResponseMetrics {
  lead_id: string
  created_at: string
  first_response_at?: string
  first_response_time?: number // seconds
  first_response_by?: string
  sla_met?: boolean
  sla_target?: number // seconds
}

export interface FirstResponseReport {
  avg_response_time: number
  median_response_time: number
  sla_compliance_rate: number
  fastest_response: number
  slowest_response: number
  by_user: Array<{
    user_id: string
    user_name: string
    avg_response_time: number
    leads_count: number
    sla_compliance_rate: number
  }>
  by_source: Array<{
    source: string
    avg_response_time: number
    leads_count: number
  }>
}

// ═══════════════════════════════════════════════════════════════
// PIPELINE VELOCITY
// ═══════════════════════════════════════════════════════════════

export interface PipelineVelocity {
  stage_id: string
  stage_name: string
  avg_time_in_stage: number // days
  median_time_in_stage: number // days
  leads_entered: number
  leads_exited: number
  leads_stuck: number // in stage > threshold
  conversion_rate: number // to next stage
  bottleneck_score: number // 0-100, higher = more bottleneck
}

export interface VelocityReport {
  overall_avg_cycle_time: number
  overall_median_cycle_time: number
  by_stage: PipelineVelocity[]
  bottlenecks: PipelineVelocity[]
  fastest_conversions: number
  slowest_conversions: number
}

// ═══════════════════════════════════════════════════════════════
// API REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface ForecastRequest {
  period: QuotaPeriod
  start_date?: string
  end_date?: string
  pipeline_id?: string
  user_id?: string
}

export interface DuplicateCheckRequest {
  lead_id?: string
  email?: string
  phone?: string
  company_name?: string
  threshold?: number // minimum match score (0-100)
}

export interface StaleLeadRequest {
  warning_threshold?: number
  stale_threshold?: number
  dormant_threshold?: number
  pipeline_id?: string
  assigned_to?: string
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export type {
  // Base extensions
  LeadEnhanced,
  ContactEnhanced,
  PipelineStageEnhanced,
  ActivityEnhanced,

  // Activity Plans
  ActivityPlan,
  ActivityPlanStep,
  CreateActivityPlanData,
  ActivityPlanExecution,

  // Quotas
  SalesQuota,
  CreateQuotaData,
  QuotaProgress,
  QuotaPeriod,
  QuotaStatus,

  // Duplicates
  DuplicateMatch,
  DuplicateDetectionResult,
  MergeLeadsData,
  MergeResult,
  MergeStrategy,

  // Forecasting
  RevenueForecast,
  ForecastByStage,
  ForecastBySource,
  ForecastByOwner,
  ComprehensiveForecast,
  ForecastFilters,

  // Stale Leads
  StaleLeadConfig,
  StaleLead,
  StaleLeadReport,

  // Enrichment
  LeadEnrichmentData,

  // Competitors
  Competitor,
  CompetitorAnalysis,

  // Response Times
  FirstResponseMetrics,
  FirstResponseReport,

  // Velocity
  PipelineVelocity,
  VelocityReport,

  // Requests
  ForecastRequest,
  DuplicateCheckRequest,
  StaleLeadRequest,
}

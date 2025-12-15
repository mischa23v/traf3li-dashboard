/**
 * Sales Person Types
 * Types for Sales Person hierarchy, commission tracking, territory assignments, and targets
 * Part of CRM Enhancement Plan - Phase 2.2
 */

// ═══════════════════════════════════════════════════════════════
// SALES PERSON TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Sales Person Status
 */
export type SalesPersonStatus = 'active' | 'inactive'

/**
 * Target Period Type
 * Defines the time period for sales targets
 */
export type TargetPeriodType = 'yearly' | 'quarterly' | 'monthly'

/**
 * Commission Calculation Method
 */
export type CommissionCalculationType =
  | 'percentage'        // Percentage of deal value
  | 'fixed'            // Fixed amount per deal
  | 'tiered'           // Different rates based on thresholds
  | 'team_split'       // Split commission across team

/**
 * Sales Person Target
 * Tracks goals and achievements for a specific time period
 */
export interface SalesPersonTarget {
  _id?: string
  salesPersonId: string

  // Time period
  year: number
  quarter?: number              // 1-4
  month?: number                // 1-12
  periodType: TargetPeriodType

  // Financial targets
  targetAmount: number
  achievedAmount: number
  targetAmountCurrency?: string // Defaults to SAR

  // Activity targets
  targetLeads?: number
  achievedLeads?: number
  targetCases?: number
  achievedCases?: number
  targetQuotes?: number
  achievedQuotes?: number
  targetWins?: number
  achievedWins?: number

  // Metrics
  achievementPercentage: number  // Calculated: (achievedAmount / targetAmount) * 100
  leadsConversionRate?: number   // Percentage of leads converted to cases
  winRate?: number               // Percentage of cases won

  // Status
  isActive: boolean
  notes?: string

  createdAt: Date
  updatedAt: Date
}

/**
 * Commission Tier
 * Used for tiered commission calculation
 */
export interface CommissionTier {
  minAmount: number
  maxAmount?: number             // Undefined means no upper limit
  rate: number                   // Percentage or fixed amount
}

/**
 * Sales Person Commission Settings
 * Commission structure and calculation rules
 */
export interface SalesPersonCommission {
  enabled: boolean
  calculationType: CommissionCalculationType

  // Simple commission (percentage or fixed)
  commissionRate?: number        // Percentage (0-100) or fixed amount

  // Tiered commission structure
  tiers?: CommissionTier[]

  // Team split configuration
  teamSplitPercentage?: number   // This person's share of team commission

  // Restrictions
  minDealValue?: number          // Minimum deal value to earn commission
  maxCommissionAmount?: number   // Cap on commission per deal

  // Payment
  paymentFrequency?: 'immediate' | 'monthly' | 'quarterly' | 'annually'

  notes?: string
}

/**
 * Sales Person Statistics
 * Real-time performance metrics
 */
export interface SalesPersonStats {
  salesPersonId: string

  // Current period (month)
  currentMonthLeads: number
  currentMonthCases: number
  currentMonthQuotes: number
  currentMonthWins: number
  currentMonthRevenue: number

  // Current quarter
  currentQuarterLeads: number
  currentQuarterCases: number
  currentQuarterWins: number
  currentQuarterRevenue: number

  // Current year
  currentYearLeads: number
  currentYearCases: number
  currentYearWins: number
  currentYearRevenue: number

  // All-time
  totalLeads: number
  totalCases: number
  totalQuotes: number
  totalWins: number
  totalLost: number
  totalRevenue: number

  // Conversion metrics
  leadToCaseConversionRate: number      // Percentage
  caseToQuoteConversionRate: number     // Percentage
  quoteToWinConversionRate: number      // Percentage
  overallWinRate: number                // Percentage

  // Averages
  avgDealSize: number
  avgDaysToClose: number
  avgResponseTime: number                // Hours

  // Rankings (if applicable)
  rankThisMonth?: number
  rankThisQuarter?: number
  rankThisYear?: number

  lastUpdated: Date
}

/**
 * Sales Person Hierarchy Node
 * Represents position in organizational hierarchy
 */
export interface SalesPersonHierarchy {
  _id: string
  name: string
  nameAr: string
  isGroup: boolean
  level: number
  path: string                   // e.g., "sales-manager/team-lead/rep"
  parentSalesPersonId?: string
  children: SalesPersonHierarchy[]

  // Quick stats for hierarchy view
  totalLeads?: number
  totalCases?: number
  totalRevenue?: number
}

/**
 * Main Sales Person Interface
 */
export interface SalesPerson {
  _id: string

  // Basic Information
  name: string
  nameAr: string
  code?: string                  // Unique identifier code (e.g., SP-001)

  // Hierarchy
  parentSalesPersonId?: string   // For reporting structure
  isGroup: boolean               // True for teams/managers, false for individual reps
  level: number                  // Hierarchy level (0 = top)
  path: string                   // Full hierarchy path

  // Employee/User Links
  employeeId?: string            // Link to HR employee record
  userId?: string                // Link to system user account

  // Commission Configuration
  commission: SalesPersonCommission
  commissionRate: number         // Default/primary commission rate (for backward compatibility)

  // Territory Assignments
  territoryIds: string[]         // Array of Territory IDs assigned to this person
  isPrimaryTerritory?: {         // Track primary territory for each assigned territory
    [territoryId: string]: boolean
  }

  // Targets (embedded for quick access)
  targets?: SalesPersonTarget[]
  currentMonthTarget?: SalesPersonTarget
  currentQuarterTarget?: SalesPersonTarget
  currentYearTarget?: SalesPersonTarget

  // Contact Information
  email?: string
  phone?: string
  whatsapp?: string

  // Role & Permissions
  role?: 'sales_representative' | 'senior_representative' | 'team_lead' | 'sales_manager' | 'director'
  department?: string

  // Work Information
  startDate?: Date               // When they started in sales
  endDate?: Date                 // If no longer active

  // Performance Tracking
  performanceRating?: number     // 1-5 scale
  lastReviewDate?: Date
  nextReviewDate?: Date

  // Team Management (if isGroup = true)
  teamMembers?: string[]         // Array of Sales Person IDs reporting to this person
  teamSize?: number              // Calculated from teamMembers

  // Availability
  availableForNewLeads: boolean  // Auto-assignment eligibility
  maxLeadsPerMonth?: number      // Capacity limit
  workingHours?: {
    [day: string]: {             // sunday, monday, tuesday, etc.
      enabled: boolean
      start: string              // "09:00"
      end: string                // "17:00"
    }
  }

  // Specializations
  specializations?: string[]     // Practice areas or case types
  languages?: string[]           // Languages spoken

  // Metadata
  enabled: boolean
  notes?: string
  tags?: string[]

  // Audit
  createdBy?: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Sales Person Assignment
 * Track assignment of leads/cases to sales persons
 */
export interface SalesPersonAssignment {
  _id: string
  salesPersonId: string

  // What is assigned
  entityType: 'lead' | 'case' | 'quote' | 'client'
  entityId: string

  // Assignment details
  assignedAt: Date
  assignedBy: string             // User ID who made the assignment
  assignmentReason?: 'manual' | 'round_robin' | 'territory' | 'load_balance' | 'expertise'

  // Status
  isActive: boolean
  reassignedTo?: string          // If reassigned, ID of new sales person
  reassignedAt?: Date
  reassignmentReason?: string

  // Performance on this assignment
  firstContactAt?: Date
  firstResponseTime?: number     // Seconds
  status?: string                // Current status of entity
  outcome?: 'won' | 'lost' | 'in_progress'
  outcomeDate?: Date

  createdAt: Date
  updatedAt: Date
}

/**
 * Sales Person Activity Log
 * Track all activities by sales person
 */
export interface SalesPersonActivity {
  _id: string
  salesPersonId: string

  // Activity details
  activityType: 'call' | 'email' | 'meeting' | 'whatsapp' | 'note' | 'task' | 'follow_up'
  entityType: 'lead' | 'case' | 'quote' | 'client'
  entityId: string

  // Content
  subject?: string
  description?: string
  duration?: number              // Minutes

  // Outcome
  outcome?: 'positive' | 'neutral' | 'negative' | 'no_response'
  nextSteps?: string
  followUpDate?: Date

  // Metadata
  completedAt?: Date
  createdAt: Date
}

/**
 * Sales Person Performance Report
 * Comprehensive performance data for reporting
 */
export interface SalesPersonPerformanceReport {
  salesPersonId: string
  salesPersonName: string

  // Period
  periodStart: Date
  periodEnd: Date
  periodType: TargetPeriodType

  // Targets vs Actuals
  target: SalesPersonTarget

  // Detailed breakdowns
  leadsBySource: { [source: string]: number }
  casesByType: { [type: string]: number }
  winsByStage: { [stage: string]: number }
  lostByReason: { [reason: string]: number }

  // Timeline
  dailyActivity: {
    date: Date
    leads: number
    cases: number
    quotes: number
    revenue: number
  }[]

  // Rankings
  teamRank?: number
  territoryRank?: number
  officeRank?: number

  // Generated at
  generatedAt: Date
}

/**
 * Sales Team
 * Group of sales persons working together
 */
export interface SalesTeam {
  _id: string
  name: string
  nameAr: string

  // Leadership
  managerId: string              // Sales Person ID of team manager

  // Members
  memberIds: string[]            // Array of Sales Person IDs

  // Territory coverage
  territoryIds: string[]

  // Team targets
  targets?: SalesPersonTarget[]

  // Team commission split
  teamCommissionEnabled: boolean
  teamCommissionSplit?: {
    [salesPersonId: string]: number  // Percentage of team commission
  }

  // Metadata
  enabled: boolean
  notes?: string

  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════════
// FORM & INPUT TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Create Sales Person Input
 */
export interface CreateSalesPersonInput {
  name: string
  nameAr: string
  code?: string
  parentSalesPersonId?: string
  isGroup: boolean
  employeeId?: string
  userId?: string
  commissionRate: number
  commission?: Partial<SalesPersonCommission>
  territoryIds?: string[]
  email?: string
  phone?: string
  role?: string
  startDate?: Date
  availableForNewLeads?: boolean
  specializations?: string[]
  languages?: string[]
  enabled?: boolean
  notes?: string
}

/**
 * Update Sales Person Input
 */
export interface UpdateSalesPersonInput {
  name?: string
  nameAr?: string
  code?: string
  parentSalesPersonId?: string
  isGroup?: boolean
  employeeId?: string
  userId?: string
  commissionRate?: number
  commission?: Partial<SalesPersonCommission>
  territoryIds?: string[]
  email?: string
  phone?: string
  role?: string
  startDate?: Date
  endDate?: Date
  availableForNewLeads?: boolean
  maxLeadsPerMonth?: number
  specializations?: string[]
  languages?: string[]
  enabled?: boolean
  notes?: string
}

/**
 * Sales Person Filter Options
 */
export interface SalesPersonFilterOptions {
  search?: string                // Search by name
  territoryId?: string
  isGroup?: boolean
  enabled?: boolean
  role?: string
  availableForNewLeads?: boolean
  hasTargets?: boolean
  parentSalesPersonId?: string
  level?: number
}

/**
 * Sales Person Sort Options
 */
export type SalesPersonSortField =
  | 'name'
  | 'code'
  | 'commissionRate'
  | 'currentMonthRevenue'
  | 'winRate'
  | 'createdAt'

export interface SalesPersonSortOptions {
  field: SalesPersonSortField
  order: 'asc' | 'desc'
}

// ═══════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Sales Person with populated references
 */
export interface SalesPersonPopulated extends Omit<SalesPerson, 'parentSalesPersonId' | 'userId' | 'employeeId'> {
  parentSalesPerson?: SalesPerson
  user?: {
    _id: string
    name: string
    email: string
  }
  employee?: {
    _id: string
    name: string
    employeeId: string
  }
  territories?: Array<{
    _id: string
    name: string
    nameAr: string
  }>
  stats?: SalesPersonStats
}

/**
 * Sales Person Leaderboard Entry
 */
export interface SalesPersonLeaderboardEntry {
  rank: number
  salesPersonId: string
  salesPersonName: string
  metric: number                 // The value being ranked by
  target?: number
  achievementPercentage?: number
  change?: number                // Change from previous period
}

/**
 * Sales Person Assignment Rule
 * Rules for auto-assignment of leads/cases
 */
export interface SalesPersonAssignmentRule {
  _id: string
  name: string
  nameAr: string

  // Conditions
  leadSourceIds?: string[]       // Assign leads from these sources
  territoryIds?: string[]        // Assign leads from these territories
  caseTypes?: string[]           // Assign cases of these types

  // Assignment method
  assignmentMethod: 'round_robin' | 'load_balance' | 'territory' | 'specific'

  // Sales persons eligible
  salesPersonIds: string[]

  // Round robin state
  lastAssignedIndex?: number     // For round robin

  // Priority
  priority: number               // Higher number = higher priority

  // Status
  enabled: boolean

  createdAt: Date
  updatedAt: Date
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export type {
  SalesPerson,
  SalesPersonTarget,
  SalesPersonCommission,
  CommissionTier,
  SalesPersonStats,
  SalesPersonHierarchy,
  SalesPersonAssignment,
  SalesPersonActivity,
  SalesPersonPerformanceReport,
  SalesTeam,
  CreateSalesPersonInput,
  UpdateSalesPersonInput,
  SalesPersonFilterOptions,
  SalesPersonSortOptions,
  SalesPersonPopulated,
  SalesPersonLeaderboardEntry,
  SalesPersonAssignmentRule,
}

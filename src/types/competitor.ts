/**
 * Competitor Types
 * Types for tracking competitors in the CRM system
 * Used for lost opportunity analysis and competitive intelligence
 */

// ═══════════════════════════════════════════════════════════════
// COMPETITOR TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Competitor
 * Represents a competing law firm or legal service provider
 * Tracks cases lost to and won against this competitor
 */
export interface Competitor {
  /** Unique identifier */
  _id: string

  /** Competitor name in English */
  name: string

  /** Competitor name in Arabic */
  nameAr: string

  /** Competitor website URL */
  website?: string

  /** Additional notes or description about the competitor */
  description?: string

  // ─── Tracking Fields ───
  /** Number of cases lost to this competitor */
  casesLostTo: number

  /** Number of cases won against this competitor */
  casesWonAgainst: number

  // ─── Status & Timestamps ───
  /** Whether this competitor is active/enabled */
  enabled: boolean

  /** When this competitor record was created */
  createdAt: Date

  /** When this competitor record was last updated */
  updatedAt: Date
}

/**
 * Create Competitor Input
 * Data required to create a new competitor
 */
export interface CreateCompetitorInput {
  name: string
  nameAr: string
  website?: string
  description?: string
  enabled?: boolean
}

/**
 * Update Competitor Input
 * Data that can be updated on an existing competitor
 */
export interface UpdateCompetitorInput {
  name?: string
  nameAr?: string
  website?: string
  description?: string
  enabled?: boolean
}

/**
 * Competitor Statistics
 * Win/loss statistics for a competitor
 */
export interface CompetitorStats {
  competitorId: string
  competitorName: string
  competitorNameAr: string
  casesLostTo: number
  casesWonAgainst: number
  totalCases: number
  winRate: number // Percentage (0-100)
  lossRate: number // Percentage (0-100)
  lastCaseLostDate?: Date
  lastCaseWonDate?: Date
}

/**
 * Competitor Filter Options
 * Available filters for competitor queries
 */
export interface CompetitorFilterOptions {
  enabled?: boolean
  search?: string // Search in name, nameAr, or description
  sortBy?: 'name' | 'nameAr' | 'casesLostTo' | 'casesWonAgainst' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

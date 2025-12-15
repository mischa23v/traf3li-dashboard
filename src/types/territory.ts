/**
 * Territory Types
 * Types for Territory management including hierarchy support and target tracking
 * Used for geographical organization in CRM module
 */

// ═══════════════════════════════════════════════════════════════
// TERRITORY TYPES
// ═══════════════════════════════════════════════════════════════

/**
 * Territory Target
 * Defines sales targets for a territory by year and quarter
 */
export interface TerritoryTarget {
  year: number
  quarter?: number
  targetAmount: number
  achievedAmount: number
}

/**
 * Territory
 * Represents a geographical territory with hierarchical support
 */
export interface Territory {
  _id: string
  name: string
  nameAr: string

  // Hierarchy
  parentTerritoryId?: string   // For hierarchy
  isGroup: boolean
  managerId?: string           // Sales Person ID

  // Tree structure
  level: number
  path: string                 // e.g., "saudi-arabia/riyadh/north-riyadh"

  // Targets
  targets?: TerritoryTarget[]

  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Create Territory Data
 * Data required to create a new territory
 */
export interface CreateTerritoryData {
  name: string
  nameAr: string
  parentTerritoryId?: string
  isGroup: boolean
  managerId?: string
  enabled?: boolean
  targets?: Omit<TerritoryTarget, never>[]
}

/**
 * Update Territory Data
 * Data that can be updated for an existing territory
 */
export interface UpdateTerritoryData {
  name?: string
  nameAr?: string
  parentTerritoryId?: string
  isGroup?: boolean
  managerId?: string
  enabled?: boolean
  targets?: TerritoryTarget[]
}

/**
 * Territory Filters
 * Filters for querying territories
 */
export interface TerritoryFilters {
  parentTerritoryId?: string
  isGroup?: boolean
  managerId?: string
  enabled?: boolean
  level?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * Territory Tree Node
 * Represents a territory in a hierarchical tree structure
 */
export interface TerritoryTreeNode extends Territory {
  children?: TerritoryTreeNode[]
  parentTerritory?: {
    _id: string
    name: string
    nameAr: string
  }
  manager?: {
    _id: string
    name: string
    nameAr: string
  }
}

/**
 * Territory Stats
 * Statistical information for a territory
 */
export interface TerritoryStats {
  territoryId: string
  name: string
  nameAr: string
  totalLeads: number
  totalCases: number
  totalValue: number
  currentYearTarget?: number
  currentYearAchieved?: number
  targetAchievement?: number  // Percentage
  subTerritories?: number
}

/**
 * Territory with Stats
 * Territory combined with its statistical data
 */
export interface TerritoryWithStats extends Territory {
  stats: TerritoryStats
}

/**
 * Territory Summary
 * Summary data for territory reports
 */
export interface TerritorySummary {
  total: number
  active: number
  groups: number
  territories: number
  totalTarget: number
  totalAchieved: number
  avgAchievement: number
}

/**
 * API Response Types
 */
export interface TerritoryApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PaginatedTerritoryResponse {
  data: Territory[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * Sidebar Types
 * Type definitions for the dynamic sidebar system
 * Matches backend API contract from GET /api/sidebar/config
 */

import type { ModuleKey } from './rbac'

// 
// FIRM TYPE
// 

/**
 * Firm size tiers for sidebar module filtering
 * - solo: Solo lawyers or firms with 1 person
 * - small: Firms with 2-50 employees
 * - large: Firms with 50+ employees (enterprise features)
 */
export type FirmType = 'solo' | 'small' | 'large'

// 
// SIDEBAR ITEMS
// 

/**
 * Base sidebar navigation item (leaf node)
 * Used in Basic, Footer, and as children of SidebarModule
 */
export interface SidebarItem {
  /** Unique identifier for the item */
  id: string
  /** Display label (English) */
  label: string
  /** Display label (Arabic) */
  labelAr: string
  /** Lucide icon name */
  icon: string
  /** Navigation path (use ROUTES constants) */
  path: string
  /** Sort order within section */
  order: number
  /** Optional description for tooltips */
  description?: string
  /** Optional badge (notification count, "New", etc.) */
  badge?: string | number
  /** Module key for permission checking */
  module?: ModuleKey
}

/**
 * Sidebar module (collapsible group)
 * Contains multiple SidebarItems
 */
export interface SidebarModule {
  /** Unique identifier for the module */
  id: string
  /** Display label (English) */
  label: string
  /** Display label (Arabic) */
  labelAr: string
  /** Lucide icon name for the module header */
  icon: string
  /** Sort order within Modules section */
  order: number
  /** Whether this module is optional (e.g., Market) */
  isOptional?: boolean
  /** Whether to expand by default */
  defaultExpanded?: boolean
  /** Child navigation items */
  items: SidebarItem[]
}

// 
// RECENTS
// 

/**
 * Recently visited page item
 * Stored in localStorage for quick navigation
 */
export interface RecentItem {
  /** Unique identifier (usually path-based) */
  id: string
  /** Display title (translated) */
  title: string
  /** Navigation path */
  path: string
  /** Lucide icon name */
  icon: string
  /** Timestamp when visited */
  visitedAt: number
}

// 
// SIDEBAR SECTIONS
// 

/**
 * Basic section configuration
 * Always visible, not collapsible
 */
export interface SidebarBasicSection {
  /** Section label (English) */
  label: string
  /** Section label (Arabic) */
  labelAr?: string
  /** Basic navigation items */
  items: SidebarItem[]
}

/**
 * Recents section configuration
 */
export interface SidebarRecentsSection {
  /** Section identifier */
  id: 'recents'
  /** Section label (English) */
  label: string
  /** Section label (Arabic) */
  labelAr?: string
  /** Lucide icon name */
  icon: string
  /** Maximum items to display */
  maxItems: number
  /** Recent items (populated from localStorage, not API) */
  items: RecentItem[]
}

/**
 * Modules section configuration
 * Collapsible module groups
 */
export interface SidebarModulesSection {
  /** Section label (English) */
  label: string
  /** Section label (Arabic) */
  labelAr?: string
  /** Module groups (filtered by firm type) */
  items: SidebarModule[]
}

/**
 * Footer section configuration
 * Settings, Help, etc.
 */
export interface SidebarFooterSection {
  /** Footer navigation items */
  items: SidebarItem[]
}

// 
// SIDEBAR CONFIG
// 

/**
 * Complete sidebar configuration from API
 * Response from GET /api/sidebar/config
 */
export interface SidebarConfig {
  /** User's firm type (determines visible modules) */
  firmType: FirmType
  /** Current language preference */
  language: 'en' | 'ar'
  /** Sidebar sections */
  sections: {
    basic: SidebarBasicSection
    recents: SidebarRecentsSection
    modules: SidebarModulesSection
    footer: SidebarFooterSection
  }
  /** Metadata for debugging/analytics */
  meta: {
    totalBaseItems: number
    totalModules: number
    totalModuleItems: number
    totalItems: number
  }
}

// 
// API RESPONSE
// 

/**
 * API response wrapper for sidebar config
 */
export interface SidebarConfigResponse {
  success: boolean
  data: SidebarConfig
  message?: string
}

// 
// COLLAPSE STATE
// 

/**
 * Collapsed module IDs stored in localStorage
 */
export type CollapsedModules = string[]

// 
// MODULE TIER MAPPING
// 

/**
 * Mapping of module IDs to their available tiers
 * Used for client-side filtering when API is unavailable
 */
export type ModuleTierMap = Record<string, FirmType[]>

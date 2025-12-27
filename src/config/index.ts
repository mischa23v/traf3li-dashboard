/**
 * Centralized Configuration Exports
 *
 * This file provides a single entry point for all configuration constants.
 * Import what you need to replace magic numbers throughout the codebase.
 *
 * @example
 * ```typescript
 * import { TAX_CONFIG, PAGINATION, CACHE_TIMES } from '@/config'
 *
 * // Instead of: const vatAmount = subtotal * 0.15
 * const vatAmount = subtotal * TAX_CONFIG.SAUDI_VAT_RATE
 *
 * // Instead of: const pageSize = 20
 * const pageSize = PAGINATION.DEFAULT
 *
 * // Instead of: staleTime: 5 * 60 * 1000
 * staleTime: CACHE_TIMES.MEDIUM
 * ```
 */

// Tax configuration
import { TAX_CONFIG, default as TAX } from './tax'
export { TAX_CONFIG, TAX }

// Pagination configuration
import { PAGINATION, default as PAGINATION_CONFIG } from './pagination'
export { PAGINATION, PAGINATION_CONFIG }

// Cache configuration
import {
  CACHE_TIMES,
  CACHE_CONFIG,
  MEMORY_CACHE,
  default as CACHE,
} from './cache'
export { CACHE_TIMES, CACHE_CONFIG, MEMORY_CACHE, CACHE }

// UI constants
import {
  CANVAS,
  MAP,
  FILE_LIMITS,
  TIMEOUTS,
  CALENDAR,
  RETENTION,
  RATE_LIMITS,
  EXPORT,
  ANIMATION,
  default as UI_CONSTANTS,
} from './ui-constants'
export {
  CANVAS,
  MAP,
  FILE_LIMITS,
  TIMEOUTS,
  CALENDAR,
  RETENTION,
  RATE_LIMITS,
  EXPORT,
  ANIMATION,
  UI_CONSTANTS,
}

// Business rules
import {
  MILEAGE_RATES,
  SCORE_THRESHOLDS,
  WORK_HOURS,
  FINANCIAL,
  COMPLIANCE,
  LEAVE,
  PERFORMANCE,
  MATCHING,
  NOTIFICATIONS,
  INVENTORY,
  VALIDATION,
  default as BUSINESS_RULES,
} from './business'
export {
  MILEAGE_RATES,
  SCORE_THRESHOLDS,
  WORK_HOURS,
  FINANCIAL,
  COMPLIANCE,
  LEAVE,
  PERFORMANCE,
  MATCHING,
  NOTIFICATIONS,
  INVENTORY,
  VALIDATION,
  BUSINESS_RULES,
}

// Re-export everything as a single object for convenience
export const CONFIG = {
  TAX: TAX_CONFIG,
  PAGINATION,
  CACHE: { TIMES: CACHE_TIMES, CONFIG: CACHE_CONFIG, MEMORY: MEMORY_CACHE },
  UI: {
    CANVAS,
    MAP,
    FILE_LIMITS,
    TIMEOUTS,
    CALENDAR,
    RETENTION,
    RATE_LIMITS,
    EXPORT,
    ANIMATION,
  },
  BUSINESS: {
    MILEAGE_RATES,
    SCORE_THRESHOLDS,
    WORK_HOURS,
    FINANCIAL,
    COMPLIANCE,
    LEAVE,
    PERFORMANCE,
    MATCHING,
    NOTIFICATIONS,
    INVENTORY,
    VALIDATION,
  },
} as const

export default CONFIG

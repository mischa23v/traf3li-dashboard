/**
 * Pagination Configuration
 * Centralized pagination sizes for tables, lists, and data grids
 */

export const PAGINATION = {
  /**
   * Default pagination size for most lists and tables
   */
  DEFAULT: 20,

  /**
   * Small pagination for compact lists (e.g., recent items, notifications)
   */
  SMALL: 5,

  /**
   * Medium pagination for moderate lists
   */
  MEDIUM: 10,

  /**
   * Large pagination for extensive data tables
   */
  LARGE: 50,

  /**
   * Extra large pagination for bulk operations
   */
  EXTRA_LARGE: 100,

  /**
   * Maximum items per page (prevent performance issues)
   */
  MAX: 1000,

  /**
   * Common page size options for dropdowns
   */
  OPTIONS: [10, 20, 30, 40, 50] as const,

  /**
   * Default page sizes for specific features
   */
  FEATURES: {
    DOCUMENTS: 10,
    CLIENTS: 12,
    STAFF: 10,
    ORGANIZATIONS: 10,
    TAGS: 10,
    INVOICE_TEMPLATES: 10,
    FOLLOWUPS: 10,
    CONTACTS: 10,
    CASES: 10,
    TRANSACTIONS: 25,
    STOCK_LEDGER: 25,
    ACTIVITY_FEED: 50,
    BIOMETRIC_LIVE_FEED: 20,
    PRIORITY_QUEUE: 20,
  },
} as const

export default PAGINATION

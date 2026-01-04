/**
 * Cache Configuration
 * Centralized cache times for React Query and other caching mechanisms
 */

export const CACHE_TIMES = {
  // ==================== STALE TIMES ====================
  /**
   * Instant - Data considered stale immediately (always refetch)
   */
  INSTANT: 0,

  /**
   * Short - For frequently changing data (2 minutes)
   * Use for: real-time notifications, live feeds, active sessions
   */
  SHORT: 2 * 60 * 1000,

  /**
   * Medium - For moderately changing data (5 minutes)
   * Use for: lists, details, general queries
   */
  MEDIUM: 5 * 60 * 1000,

  /**
   * Long - For relatively stable data (30 minutes)
   * Use for: statistics, aggregations, reports
   */
  LONG: 30 * 60 * 1000,

  /**
   * Hour - For very stable data (1 hour)
   * Use for: company settings, configurations, master data
   */
  HOUR: 60 * 60 * 1000,

  /**
   * Two Hours - For infrequently changing data
   */
  TWO_HOURS: 2 * 60 * 60 * 1000,

  // ==================== GC (Garbage Collection) TIMES ====================
  /**
   * Short GC - Clean up after 5 minutes
   */
  GC_SHORT: 5 * 60 * 1000,

  /**
   * Medium GC - Clean up after 30 minutes
   */
  GC_MEDIUM: 30 * 60 * 1000,

  /**
   * Long GC - Clean up after 1 hour
   */
  GC_LONG: 60 * 60 * 1000,

  /**
   * Extended GC - Clean up after 2 hours
   */
  GC_EXTENDED: 2 * 60 * 60 * 1000,

  // ==================== SPECIFIC USE CASES ====================
  /**
   * Authentication and session data
   */
  AUTH: {
    SESSION: 5 * 60 * 1000,
    PROFILE: 5 * 60 * 1000,
    PERMISSIONS: 5 * 60 * 1000,
  },

  /**
   * Real-time data (notifications, live feeds)
   */
  REALTIME: {
    NOTIFICATIONS: 2 * 60 * 1000,
    UNREAD_COUNT: 2 * 60 * 1000, // Batched updates
    LIVE_FEED: 30 * 1000, // 30 seconds
  },

  /**
   * Lists and collections
   */
  LISTS: 5 * 60 * 1000,

  /**
   * Statistics and aggregations
   */
  STATS: 30 * 60 * 1000,

  /**
   * Configuration and settings
   */
  CONFIG: 5 * 60 * 1000,

  /**
   * Audit logs and history
   */
  AUDIT: {
    LOGS: 30 * 1000, // 30 seconds
    STATS: 60 * 1000, // 1 minute
    ACTIVITY: 2 * 60 * 1000, // 2 minutes
  },

  /**
   * Calendar and grid data
   */
  CALENDAR: {
    GRID: 1 * 60 * 1000, // 1 minute
    ITEMS: 2 * 60 * 1000, // 2 minutes
  },

  /**
   * Search caching (Gold Standard - Algolia/AWS pattern)
   * Uses aggressive caching with stale-while-revalidate for instant UX
   */
  SEARCH: {
    /** How long search results are considered fresh (1 minute) */
    STALE_TIME: 1 * 60 * 1000,
    /** How long to keep search results in cache (5 minutes) */
    GC_TIME: 5 * 60 * 1000,
    /** Prefix cache - shorter for partial queries (30 seconds) */
    PREFIX_STALE: 30 * 1000,
    /** Prefix cache GC (2 minutes) */
    PREFIX_GC: 2 * 60 * 1000,
  },
} as const

/**
 * Pre-configured cache settings for common query patterns
 */
export const CACHE_CONFIG = {
  queries: {
    /**
     * Statistics queries (slow to change, expensive to compute)
     */
    stats: {
      staleTime: CACHE_TIMES.LONG,
      gcTime: CACHE_TIMES.GC_LONG,
    },

    /**
     * List queries (moderate refresh rate)
     */
    lists: {
      staleTime: CACHE_TIMES.MEDIUM,
      gcTime: CACHE_TIMES.GC_MEDIUM,
    },

    /**
     * Detail queries (moderate refresh rate)
     */
    details: {
      staleTime: CACHE_TIMES.MEDIUM,
      gcTime: CACHE_TIMES.GC_MEDIUM,
    },

    /**
     * Real-time queries (frequent updates)
     */
    realtime: {
      staleTime: CACHE_TIMES.SHORT,
      gcTime: CACHE_TIMES.GC_SHORT,
    },

    /**
     * Configuration queries (infrequent changes)
     */
    config: {
      staleTime: CACHE_TIMES.HOUR,
      gcTime: CACHE_TIMES.GC_LONG,
    },

    /**
     * Session and auth queries
     */
    auth: {
      staleTime: CACHE_TIMES.AUTH.SESSION,
      gcTime: CACHE_TIMES.GC_MEDIUM,
    },

    /**
     * Search queries (Gold Standard - stale-while-revalidate)
     * Shows cached results instantly, refreshes in background
     */
    search: {
      staleTime: CACHE_TIMES.SEARCH.STALE_TIME,
      gcTime: CACHE_TIMES.SEARCH.GC_TIME,
    },

    /**
     * Prefix search queries (shorter cache for partial matches)
     */
    searchPrefix: {
      staleTime: CACHE_TIMES.SEARCH.PREFIX_STALE,
      gcTime: CACHE_TIMES.SEARCH.PREFIX_GC,
    },
  },
} as const

/**
 * In-memory cache settings
 */
export const MEMORY_CACHE = {
  /**
   * Default TTL for in-memory cache entries (5 minutes)
   */
  DEFAULT_TTL: 5 * 60 * 1000,

  /**
   * Maximum cache size (50 MB)
   */
  MAX_SIZE: 50 * 1024 * 1024,

  /**
   * Permissions cache duration
   */
  PERMISSIONS_DURATION: 5 * 60 * 1000,
} as const

export default CACHE_TIMES

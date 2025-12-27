/**
 * UI Constants Configuration
 * Centralized UI-related constants and dimensions
 */

// ==================== WHITEBOARD/CANVAS DIMENSIONS ====================
export const CANVAS = {
  /**
   * Block dimensions (text blocks, sticky notes)
   */
  BLOCK: {
    MIN_WIDTH: 150,
    MIN_HEIGHT: 100,
    DEFAULT_WIDTH: 200,
    DEFAULT_HEIGHT: 150,
  },

  /**
   * Frame dimensions (grouping container)
   */
  FRAME: {
    MIN_WIDTH: 300,
    MIN_HEIGHT: 200,
    DEFAULT_WIDTH: 600,
    DEFAULT_HEIGHT: 400,
  },

  /**
   * Shape dimensions (rectangles, circles, etc.)
   */
  SHAPE: {
    MIN_WIDTH: 50,
    MIN_HEIGHT: 50,
    DEFAULT_WIDTH: 200,
    DEFAULT_HEIGHT: 150,
  },

  /**
   * Grid layout settings for auto-arrange
   */
  GRID: {
    PADDING: 30,
    X_OFFSET: 100,
    Y_OFFSET: 100,
    X_SPACING: 220,
    Y_SPACING: 180,
    COLUMNS: 5,
  },
} as const

// ==================== MAP DEFAULTS ====================
export const MAP = {
  /**
   * Default geofencing radius in meters
   */
  DEFAULT_RADIUS: 500,

  /**
   * Default map zoom level
   */
  DEFAULT_ZOOM: 15,

  /**
   * Common radius options for geofencing (meters)
   */
  RADIUS_OPTIONS: [100, 250, 500, 1000, 2000, 5000] as const,
} as const

// ==================== FILE LIMITS ====================
export const FILE_LIMITS = {
  /**
   * Maximum file size for general uploads (50MB)
   */
  MAX_SIZE: 50 * 1024 * 1024,

  /**
   * Maximum file size for bulk uploads (100MB)
   */
  MAX_UPLOAD_SIZE: 100 * 1024 * 1024,

  /**
   * Recommended file sizes by category
   */
  RECOMMENDED: {
    /**
     * Documents (PDFs, Word files) - 10MB
     */
    DOCUMENTS: 10 * 1024 * 1024,

    /**
     * Images (JPG, PNG) - 5MB
     */
    IMAGES: 5 * 1024 * 1024,

    /**
     * Templates and exports - 5MB
     */
    TEMPLATES: 5 * 1024 * 1024,

    /**
     * General files - 10MB
     */
    GENERAL: 10 * 1024 * 1024,
  },

  /**
   * Storage quotas by user role
   */
  STORAGE_QUOTA: {
    CLIENT: 500 * 1024 * 1024, // 500MB
    LAWYER: 5 * 1024 * 1024 * 1024, // 5GB
    ADMIN: 50 * 1024 * 1024 * 1024, // 50GB
    DEFAULT: 100 * 1024 * 1024, // 100MB
  },
} as const

// ==================== SESSION/TIMEOUT ====================
export const TIMEOUTS = {
  /**
   * OTP resend cooldown in seconds
   */
  OTP_RESEND_COOLDOWN: 60,

  /**
   * OTP validity in milliseconds (10 minutes)
   */
  OTP_VALIDITY: 10 * 60 * 1000,

  /**
   * Session warning time before expiry (5 minutes)
   */
  SESSION_WARNING: 5 * 60 * 1000,

  /**
   * Session warning time (alternate - 25 minutes if 30 min session)
   */
  SESSION_WARNING_ALTERNATE: 25 * 60 * 1000,

  /**
   * Inactivity timeout (30 minutes)
   */
  INACTIVITY: 30 * 60 * 1000,

  /**
   * Access token expiry (15 minutes)
   */
  ACCESS_TOKEN: 15 * 60 * 1000,

  /**
   * Refresh token expiry (7 days)
   */
  REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000,
} as const

// ==================== CALENDAR ====================
export const CALENDAR = {
  /**
   * Grid cells for calendar view (6 weeks × 7 days)
   */
  GRID_CELLS: 42,

  /**
   * Default calendar view range
   */
  DEFAULT_DAYS_BACK: 90, // 3 months
  DEFAULT_DAYS_FORWARD: 365, // 1 year
} as const

// ==================== RETENTION PERIODS ====================
export const RETENTION = {
  /**
   * Data retention periods in milliseconds
   */
  FINANCIAL_REPORTS: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years (tax law)
  OPERATIONAL_REPORTS: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years
  TEMPORARY_REPORTS: 30 * 24 * 60 * 60 * 1000, // 30 days
  CACHE_CLEANUP: 7 * 24 * 60 * 60 * 1000, // 7 days
  BACKUP_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
  OLD_BACKUPS: 90 * 24 * 60 * 60 * 1000, // 90 days
} as const

// ==================== RATE LIMITING ====================
export const RATE_LIMITS = {
  /**
   * Window duration for rate limiting (15 minutes)
   */
  WINDOW_MS: 15 * 60 * 1000,

  /**
   * Hour window for severe rate limiting
   */
  HOUR_WINDOW_MS: 60 * 60 * 1000,

  /**
   * Minute window for strict rate limiting
   */
  MINUTE_WINDOW_MS: 1 * 60 * 1000,

  /**
   * Monitoring interval (5 minutes)
   */
  MONITORING_INTERVAL: 5 * 60 * 1000,
} as const

// ==================== PDF/EXPORT SETTINGS ====================
export const EXPORT = {
  /**
   * Page sizes for PDF export
   */
  PAGE_SIZES: ['a4', 'letter', 'A3', 'legal'] as const,

  /**
   * Default page size
   */
  DEFAULT_PAGE_SIZE: 'a4',

  /**
   * Default orientation
   */
  DEFAULT_ORIENTATION: 'portrait',

  /**
   * Report expiry times
   */
  REPORT_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
} as const

// ==================== ANIMATION DELAYS ====================
export const ANIMATION = {
  /**
   * Stagger delays for list animations (in seconds)
   */
  STAGGER: {
    DELAY_1: 0.05,
    DELAY_2: 0.1,
    DELAY_3: 0.15,
  },
} as const

export default {
  CANVAS,
  MAP,
  FILE_LIMITS,
  TIMEOUTS,
  CALENDAR,
  RETENTION,
  RATE_LIMITS,
  EXPORT,
  ANIMATION,
} as const

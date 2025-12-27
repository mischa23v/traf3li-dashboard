/**
 * Business Rules Configuration
 * Centralized business logic constants that shouldn't be hardcoded
 */

// ==================== MILEAGE RATES ====================
export const MILEAGE_RATES = {
  /**
   * Default mileage rate (SAR per km)
   * Used when no specific rate is configured
   */
  DEFAULT: 0.5,

  /**
   * Mileage rates by vehicle type
   */
  BY_VEHICLE: {
    PERSONAL_CAR: 0.5,
    COMPANY_CAR: 0.5,
    RENTAL: 0.5,
  },
} as const

// ==================== SCORE THRESHOLDS ====================
export const SCORE_THRESHOLDS = {
  /**
   * Thresholds for ML/risk scoring, performance reviews, etc.
   */
  HIGH: 70,
  MEDIUM: 50,
  LOW: 30,

  /**
   * Lead scoring thresholds
   */
  LEAD: {
    HOT: 80,
    WARM: 60,
    COLD: 40,
  },

  /**
   * Performance review thresholds
   */
  PERFORMANCE: {
    EXCELLENT: 90,
    GOOD: 75,
    SATISFACTORY: 60,
    NEEDS_IMPROVEMENT: 50,
  },
} as const

// ==================== WORK HOURS ====================
export const WORK_HOURS = {
  /**
   * Default working hours (24-hour format)
   */
  START: 9,
  END: 17,

  /**
   * Default work hours per day
   */
  HOURS_PER_DAY: 8,

  /**
   * Default work days per week
   */
  DAYS_PER_WEEK: 5,

  /**
   * Default work hours per week
   */
  HOURS_PER_WEEK: 40,
} as const

// ==================== FINANCIAL CALCULATIONS ====================
export const FINANCIAL = {
  /**
   * Number of decimal places for currency calculations
   */
  CURRENCY_DECIMALS: 2,

  /**
   * Minimum halala value (smallest Saudi currency unit)
   */
  MIN_HALALA: 1,

  /**
   * Halalas per Riyal
   */
  HALALAS_PER_SAR: 100,

  /**
   * Default discount thresholds (percentage)
   */
  DISCOUNT: {
    MAX_ALLOWED: 30, // Maximum discount without approval
    WARNING_THRESHOLD: 20, // Show warning above this
  },

  /**
   * Credit limits and payment terms
   */
  CREDIT: {
    DEFAULT_DAYS: 30,
    EARLY_PAYMENT_DISCOUNT: 2, // 2% discount
    EARLY_PAYMENT_DAYS: 10, // If paid within 10 days
  },
} as const

// ==================== COMPLIANCE & GDPR ====================
export const COMPLIANCE = {
  /**
   * Data breach notification deadline (hours)
   */
  BREACH_NOTIFICATION_HOURS: 72,

  /**
   * Data retention periods (days)
   */
  RETENTION: {
    FINANCIAL: 365 * 10, // 10 years
    EMPLOYEE: 365 * 7, // 7 years
    CUSTOMER: 365 * 3, // 3 years
    TEMPORARY: 90, // 90 days
  },

  /**
   * Consent validity (days)
   */
  CONSENT_VALIDITY: 365, // 1 year

  /**
   * Minimum age for consent
   */
  MIN_CONSENT_AGE: 18,
} as const

// ==================== LEAVE & ATTENDANCE ====================
export const LEAVE = {
  /**
   * Annual leave days (Saudi Labor Law)
   */
  ANNUAL_DAYS: 21,

  /**
   * Sick leave days allowed
   */
  SICK_DAYS: 30,

  /**
   * Notice period for resignation (days)
   */
  NOTICE_PERIOD_DAYS: 60,

  /**
   * Probation period (days)
   */
  PROBATION_DAYS: 90,

  /**
   * Compensatory leave validity (days from overtime)
   */
  COMPENSATORY_VALIDITY: 90,
} as const

// ==================== PERFORMANCE & ANALYTICS ====================
export const PERFORMANCE = {
  /**
   * Churn prediction - health score weights
   */
  HEALTH_SCORE_WEIGHTS: {
    USAGE: 0.4, // 40%
    FINANCIAL: 0.25, // 25%
    ENGAGEMENT: 0.2, // 20%
    CONTRACT: 0.15, // 15%
  },

  /**
   * Experience weight in overall score calculation
   */
  EXPERIENCE_WEIGHT: 0.15, // 15%

  /**
   * High potential employee threshold
   */
  HIGH_POTENTIAL_LIMIT: 20,
} as const

// ==================== MATCHING & RECONCILIATION ====================
export const MATCHING = {
  /**
   * Bank transaction matching tolerance (days)
   */
  BANK_MATCH_TOLERANCE_DAYS: 5,

  /**
   * Amount matching tolerance (percentage)
   */
  AMOUNT_TOLERANCE_PERCENT: 1, // 1% variance allowed
} as const

// ==================== EMAIL & NOTIFICATIONS ====================
export const NOTIFICATIONS = {
  /**
   * Email delay settings (milliseconds)
   */
  EMAIL_DELAY: {
    PER_DAY: 24 * 60 * 60 * 1000,
    PER_HOUR: 60 * 60 * 1000,
  },

  /**
   * Activity freshness threshold (hours)
   */
  FRESH_ACTIVITY_HOURS: 24,

  /**
   * Default task duration when none specified (days)
   */
  DEFAULT_TASK_DURATION_DAYS: 7,
} as const

// ==================== INVENTORY & ASSETS ====================
export const INVENTORY = {
  /**
   * Low stock warning thresholds
   */
  LOW_STOCK: {
    CRITICAL: 5,
    WARNING: 10,
    REORDER: 20,
  },

  /**
   * Asset depreciation (annual percentage)
   */
  DEPRECIATION: {
    EQUIPMENT: 20, // 20% per year
    FURNITURE: 10, // 10% per year
    VEHICLES: 25, // 25% per year
    COMPUTERS: 33.33, // 3-year lifespan
  },
} as const

// ==================== VALIDATION ====================
export const VALIDATION = {
  /**
   * Saudi-specific validation lengths
   */
  SAUDI: {
    NATIONAL_ID_LENGTH: 10,
    IQAMA_LENGTH: 10,
    CR_LENGTH: 10,
    VAT_NUMBER_LENGTH: 15,
    IBAN_LENGTH: 24,
  },

  /**
   * Phone number validation
   */
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },

  /**
   * Password requirements
   */
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
} as const

export default {
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
} as const

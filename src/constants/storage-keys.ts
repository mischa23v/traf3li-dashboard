/**
 * Centralized Storage Keys
 *
 * ENTERPRISE PATTERN: Single Source of Truth
 * All localStorage/sessionStorage keys are defined here.
 * This prevents "keep in sync" comments and ensures consistency.
 *
 * Usage:
 *   import { STORAGE_KEYS } from '@/constants/storage-keys'
 *   localStorage.getItem(STORAGE_KEYS.AUTH.ACCESS_TOKEN)
 */

/**
 * Authentication-related storage keys
 */
export const STORAGE_KEYS = {
  /**
   * Auth token storage
   * Used by: src/lib/api.ts
   */
  AUTH: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    EXPIRES_AT: 'tokenExpiresAt',
  },

  /**
   * Auth state persistence
   * Used by: src/stores/auth-store.ts, src/lib/api.ts, src/services/authService.ts
   */
  AUTH_STATE: {
    /** Zustand persist key - MUST match auth-store.ts persist config */
    ZUSTAND_PERSIST: 'auth-storage',
    /** Direct user cache from authService */
    USER_CACHE: 'user',
  },

  /**
   * Firm/company related storage
   * Used by: various components
   */
  FIRM: {
    ACTIVE_FIRM_ID: 'activeFirmId',
  },

  /**
   * UI preferences
   */
  UI: {
    SIDEBAR_STATE: 'sidebar:state',
    THEME: 'theme',
    LOCALE: 'locale',
  },
} as const

/**
 * Type helper for storage key values
 */
export type StorageKey =
  | (typeof STORAGE_KEYS.AUTH)[keyof typeof STORAGE_KEYS.AUTH]
  | (typeof STORAGE_KEYS.AUTH_STATE)[keyof typeof STORAGE_KEYS.AUTH_STATE]
  | (typeof STORAGE_KEYS.FIRM)[keyof typeof STORAGE_KEYS.FIRM]
  | (typeof STORAGE_KEYS.UI)[keyof typeof STORAGE_KEYS.UI]

/**
 * Timing constants for auth operations
 */
export const AUTH_TIMING = {
  /** Delay before redirect to allow toast to show (ms) */
  REDIRECT_DELAY_AFTER_TOAST: 1500,
  /** Delay before redirect after error (ms) */
  REDIRECT_DELAY_AFTER_ERROR: 2000,
  /** Toast display duration for info messages (ms) */
  TOAST_DURATION_INFO: 3000,
  /** Toast display duration for error messages (ms) */
  TOAST_DURATION_ERROR: 5000,
  /** Buffer before token expiry to trigger refresh (seconds) */
  TOKEN_REFRESH_BUFFER_SECONDS: 60,
} as const

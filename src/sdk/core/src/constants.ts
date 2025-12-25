/**
 * Constants for Traf3li Auth SDK
 */

// API Endpoints
export const AUTH_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',
  CHECK_AVAILABILITY: '/auth/check-availability',

  // OAuth
  OAUTH_GOOGLE: '/auth/oauth/google',
  OAUTH_MICROSOFT: '/auth/oauth/microsoft',
  OAUTH_CALLBACK: '/auth/oauth/callback',
  GOOGLE_ONE_TAP: '/auth/google/one-tap',

  // SSO
  SSO_DETECT: '/auth/sso/detect',
  SSO_INITIATE: '/auth/sso/initiate',
  SSO_CALLBACK: '/auth/sso/callback',

  // OTP
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  RESEND_OTP: '/auth/resend-otp',
  OTP_STATUS: '/auth/otp-status',

  // Magic Link
  MAGIC_LINK_SEND: '/auth/magic-link/send',
  MAGIC_LINK_VERIFY: '/auth/magic-link/verify',

  // Email Verification
  EMAIL_SEND_VERIFICATION: '/auth/email/send-verification',
  EMAIL_VERIFY: '/auth/email/verify',
  EMAIL_RESEND_VERIFICATION: '/auth/email/resend-verification',

  // Password
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  CHECK_PASSWORD_STRENGTH: '/auth/check-password-strength',

  // MFA
  MFA_SETUP: '/auth/mfa/setup',
  MFA_VERIFY_SETUP: '/auth/mfa/verify-setup',
  MFA_VERIFY: '/auth/mfa/verify',
  MFA_DISABLE: '/auth/mfa/disable',
  MFA_BACKUP_CODES: '/auth/mfa/backup-codes',
  MFA_REGENERATE_BACKUP: '/auth/mfa/regenerate-backup-codes',

  // Sessions
  SESSIONS_LIST: '/auth/sessions',
  SESSIONS_REVOKE: '/auth/sessions/revoke',
  SESSIONS_REVOKE_ALL: '/auth/sessions/revoke-all',
  SESSIONS_CURRENT: '/auth/sessions/current',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'traf3li_access_token',
  REFRESH_TOKEN: 'traf3li_refresh_token',
  USER: 'traf3li_user',
  DEVICE_ID: 'traf3li_device_id',
  MFA_PENDING: 'traf3li_mfa_pending',
} as const;

// Error Codes
export const ERROR_CODES = {
  // Auth Errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  MFA_REQUIRED: 'MFA_REQUIRED',
  MFA_INVALID: 'MFA_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',

  // Rate Limit Errors
  RATE_LIMITED: 'RATE_LIMITED',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',

  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  PHONE_TAKEN: 'PHONE_TAKEN',
  WEAK_PASSWORD: 'WEAK_PASSWORD',

  // OTP Errors
  OTP_INVALID: 'OTP_INVALID',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_MAX_ATTEMPTS: 'OTP_MAX_ATTEMPTS',

  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Default Config
export const DEFAULT_CONFIG = {
  autoRefreshToken: true,
  refreshThresholdSeconds: 300, // 5 minutes before expiry
  storage: 'localStorage' as const,
  requestTimeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

// Plan Hierarchy
export const PLAN_HIERARCHY = {
  free: 0,
  starter: 1,
  professional: 2,
  enterprise: 3,
} as const;

// Rate Limit Defaults
export const RATE_LIMITS = {
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION: 15 * 60, // 15 minutes in seconds
  OTP_MAX_REQUESTS: 5,
  OTP_COOLDOWN: 60, // 60 seconds
  PASSWORD_RESET_COOLDOWN: 60, // 60 seconds
} as const;

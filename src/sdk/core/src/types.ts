/**
 * Core Types for Traf3li Auth SDK
 */

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  _id?: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  firstNameAr?: string;
  lastNameAr?: string;
  phone?: string;
  country?: string;
  image?: string;
  role: UserRole;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string | null;
  isMfaEnabled?: boolean;
  mfaMethod?: MfaMethod | null;
  firmId?: string;
  firm?: UserFirm | null;
  firmRole?: FirmRole;
  firmStatus?: FirmStatus;
  isSoloLawyer?: boolean;
  lawyerWorkMode?: LawyerWorkMode;
  plan?: Plan;
  planExpiresAt?: string | null;
  trialEndsAt?: string | null;
  features?: string[];
  permissions?: UserPermissions | null;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'client' | 'lawyer' | 'admin';

export type FirmRole =
  | 'owner'
  | 'admin'
  | 'partner'
  | 'lawyer'
  | 'paralegal'
  | 'secretary'
  | 'accountant'
  | 'departed';

export type FirmStatus = 'active' | 'departed' | 'suspended' | 'pending' | null;

export type LawyerWorkMode = 'solo' | 'firm_owner' | 'firm_member' | null;

export type Plan = 'free' | 'starter' | 'professional' | 'enterprise';

export type MfaMethod = 'totp' | 'sms' | 'email';

export interface UserFirm {
  id: string;
  name: string;
  nameEn?: string;
  status: 'active' | 'suspended' | 'inactive';
}

export interface UserPermissions {
  modules?: {
    clients?: string;
    cases?: string;
    leads?: string;
    invoices?: string;
    payments?: string;
    expenses?: string;
    documents?: string;
    tasks?: string;
    events?: string;
    timeTracking?: string;
    reports?: string;
    settings?: string;
    team?: string;
    hr?: string;
    [key: string]: string | undefined;
  };
  special?: {
    canApproveInvoices?: boolean;
    canManageRetainers?: boolean;
    canExportData?: boolean;
    canDeleteRecords?: boolean;
    canViewFinance?: boolean;
    canManageTeam?: boolean;
    canCreateFirm?: boolean;
    canJoinFirm?: boolean;
    [key: string]: boolean | undefined;
  };
}

// ============================================
// Auth Types
// ============================================

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
  captchaToken?: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  role?: 'client' | 'lawyer';
  captchaToken?: string;
}

export interface AuthResult {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  mfaRequired?: boolean;
  mfaMethod?: MfaMethod;
  isNewUser?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ============================================
// MFA Types
// ============================================

export interface MfaSetupResult {
  secret: string;
  qrCode: string;
  backupCodes?: string[];
}

export interface MfaVerifyResult {
  success: boolean;
  backupCodes?: string[];
}

export interface MfaChallengeData {
  code: string;
  method?: MfaMethod;
  useBackupCode?: boolean;
}

// ============================================
// Session Types
// ============================================

export interface Session {
  id: string;
  device: string;
  browser: string;
  os?: string;
  location?: string;
  ip: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

// ============================================
// OAuth Types
// ============================================

export type OAuthProvider = 'google' | 'microsoft' | 'apple' | 'github';

export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  redirectUri?: string;
  scope?: string[];
}

export interface GoogleOneTapConfig {
  clientId: string;
  autoSelect?: boolean;
  cancelOnTapOutside?: boolean;
  context?: 'signin' | 'signup' | 'use';
  itp_support?: boolean;
}

export interface GoogleOneTapResponse {
  credential: string;
  select_by: string;
  clientId?: string;
}

// ============================================
// SSO Types
// ============================================

export interface SSOProvider {
  id: string;
  provider: 'google' | 'microsoft' | 'saml' | 'oidc';
  name: string;
  displayName?: string;
  displayNameAr?: string;
  autoRedirect?: boolean;
  domainVerified?: boolean;
}

export interface SSODetectionResult {
  detected: boolean;
  provider?: SSOProvider;
  authUrl?: string;
  message?: string;
}

// ============================================
// Password Types
// ============================================

export interface PasswordStrength {
  score: number; // 0-4
  feedback: {
    warning?: string;
    suggestions: string[];
  };
  isStrong: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// ============================================
// OTP Types
// ============================================

export type OtpPurpose = 'login' | 'registration' | 'password_reset' | 'email_verification';

export interface SendOtpData {
  email: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface OtpResult {
  success: boolean;
  message: string;
  expiresIn?: number;
  attemptsLeft?: number;
}

// ============================================
// Magic Link Types
// ============================================

export interface MagicLinkData {
  email: string;
  redirectUrl?: string;
}

export interface MagicLinkResult {
  success: boolean;
  message: string;
  expiresIn?: number;
}

// ============================================
// Config Types
// ============================================

export interface TrafAuthConfig {
  apiUrl: string;
  firmId?: string;
  autoRefreshToken?: boolean;
  refreshThresholdSeconds?: number;
  storage?: 'localStorage' | 'sessionStorage' | 'memory';
  onAuthStateChange?: (user: User | null) => void;
  onTokenRefresh?: (tokens: AuthTokens) => void;
  onError?: (error: TrafAuthError) => void;
}

// ============================================
// Error Types
// ============================================

export interface TrafAuthError extends Error {
  code: string;
  status?: number;
  details?: Record<string, unknown>;
  isRateLimited?: boolean;
  waitTime?: number;
  attemptsLeft?: number;
}

export class AuthError extends Error implements TrafAuthError {
  code: string;
  status?: number;
  details?: Record<string, unknown>;
  isRateLimited?: boolean;
  waitTime?: number;
  attemptsLeft?: number;

  constructor(
    message: string,
    code: string,
    options?: {
      status?: number;
      details?: Record<string, unknown>;
      isRateLimited?: boolean;
      waitTime?: number;
      attemptsLeft?: number;
    }
  ) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = options?.status;
    this.details = options?.details;
    this.isRateLimited = options?.isRateLimited;
    this.waitTime = options?.waitTime;
    this.attemptsLeft = options?.attemptsLeft;
  }
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: boolean;
  message?: string;
  messageAr?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

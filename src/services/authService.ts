/**
 * Authentication Service
 * Handles all authentication-related API calls
 *
 * Supports:
 * - Password-based login with dual tokens (access + refresh)
 * - Magic link authentication (passwordless)
 * - OTP-based authentication
 * - Email verification
 * - Token refresh
 *
 * ============================================================================
 * 🚨 BACKEND_TODO: AUTH ENDPOINT REQUIREMENTS
 * ============================================================================
 * See src/config/BACKEND_AUTH_ISSUES.ts for full documentation.
 *
 * CRITICAL - All auth endpoints must return:
 * 1. accessToken - JWT for API authorization (15min expiry)
 * 2. refreshToken - JWT for token refresh (7 day expiry)
 * 3. user - Complete user object with MFA flags
 *
 * REQUIRED user object fields:
 * {
 *   _id, email, role,
 *   mfaEnabled: boolean,     // ← Is MFA enabled for this user?
 *   mfaPending: boolean,     // ← Does user need to verify MFA now?
 *   mfaMethod?: 'totp'|'sms'|'email',
 *   firmId?: string,         // ← For firm members
 *   firm?: { id, name, status },
 *   isSoloLawyer?: boolean,  // ← For solo lawyers
 *   permissions?: { ... }    // ← For RBAC
 * }
 *
 * Endpoints that MUST return tokens:
 * - POST /api/auth/login
 * - POST /api/auth/sso/callback
 * - POST /api/auth/verify-otp
 * - POST /api/auth/mfa/verify
 * - POST /api/auth/magic-link/verify
 * ============================================================================
 */

import { apiClientNoVersion, handleApiError, storeTokens, clearTokens, resetApiState, refreshCsrfToken, getAccessToken, getRefreshToken } from '@/lib/api'

// Auth routes are NOT versioned - they're at /api/auth/*, not /api/v1/auth/*
// So we use apiClientNoVersion (baseURL: https://api.traf3li.com/api)
const authApi = apiClientNoVersion

// ==================== AUTH DEBUG LOGGING ====================
// Always enabled to help diagnose auth issues on production
const authLog = (message: string, data?: any) => {
  console.log(`[AUTH-SVC] ${message}`, data !== undefined ? data : '')
}
const authWarn = (message: string, data?: any) => {
  console.warn(`[AUTH-SVC] ⚠️ ${message}`, data !== undefined ? data : '')
}
const authError = (message: string, error?: any) => {
  console.error(`[AUTH-SVC] ❌ ${message}`, error || '')
}

/**
 * Firm info returned with user
 */
export interface UserFirm {
  id: string
  name: string
  nameEn?: string
  status: 'active' | 'suspended' | 'inactive'
}

/**
 * Tenant info for multi-tenant support
 */
export interface UserTenant {
  id: string
  name: string
  nameEn?: string
  status: string
  subscription?: {
    plan: string
    status: string
  }
}

/**
 * Permissions returned with login for solo lawyers and firm members
 */
export interface UserPermissions {
  modules?: {
    clients?: string
    cases?: string
    leads?: string
    invoices?: string
    payments?: string
    expenses?: string
    documents?: string
    tasks?: string
    events?: string
    timeTracking?: string
    reports?: string
    settings?: string
    team?: string
    hr?: string
    [key: string]: string | undefined
  }
  special?: {
    canApproveInvoices?: boolean
    canManageRetainers?: boolean
    canExportData?: boolean
    canDeleteRecords?: boolean
    canViewFinance?: boolean
    canManageTeam?: boolean
    canAccessHR?: boolean
    canCreateFirm?: boolean
    canJoinFirm?: boolean
    [key: string]: boolean | undefined
  }
}

/**
 * User Interface matching backend response
 */
export interface User {
  _id: string
  username: string
  firstName?: string
  lastName?: string
  firstNameAr?: string
  lastNameAr?: string
  email: string
  role: 'client' | 'lawyer' | 'admin'
  image?: string
  country: string
  phone: string
  description?: string
  isSeller: boolean
  // Solo lawyer support
  isSoloLawyer?: boolean
  lawyerWorkMode?: 'solo' | 'firm_owner' | 'firm_member' | null
  // Firm-related fields for RBAC
  firmId?: string
  firm?: UserFirm | null
  firmRole?: 'owner' | 'admin' | 'partner' | 'lawyer' | 'paralegal' | 'secretary' | 'accountant' | 'departed'
  firmStatus?: 'active' | 'departed' | 'suspended' | 'pending' | 'pending_approval' | null
  // Tenant for multi-tenant support
  tenant?: UserTenant | null
  // Permissions returned directly from login (for solo lawyers)
  permissions?: UserPermissions | null
  // Plan/Subscription fields
  plan?: 'free' | 'starter' | 'professional' | 'enterprise'
  planExpiresAt?: string | null
  trialEndsAt?: string | null
  maxUsers?: number
  features?: string[]
  lawyerProfile?: {
    specialization: string[]
    licenseNumber?: string
    barAssociation?: string
    yearsExperience: number
    verified: boolean
    rating: number
    totalReviews: number
    casesWon: number
    casesTotal: number
    languages: string[]
    firmID?: string
  }
  // MFA-related fields
  mfaEnabled?: boolean
  mfaMethod?: 'totp' | 'sms' | 'email' | null
  mfaRequired?: boolean
  mfaPending?: boolean // True when login succeeded but MFA verification is needed
  // Email verification fields
  isEmailVerified?: boolean
  emailVerifiedAt?: string | null
  // Password breach fields (from backend breach check)
  mustChangePassword?: boolean
  passwordBreached?: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Password Breach Warning returned from login when password is compromised
 * Matches backend API response format from HaveIBeenPwned integration
 */
export interface PasswordBreachWarning {
  breached: boolean    // Whether password was found in breaches
  count: number        // Number of times password was found in breaches
  message: string      // Localized warning message from backend
}

/**
 * Security Warning returned with OTP required response
 * When password is compromised but login can proceed with OTP
 */
export interface SecurityWarning {
  type: 'PASSWORD_COMPROMISED'
  message: string
  messageEn: string
  breachCount?: number
  requirePasswordChange: boolean
}

/**
 * Login Credentials Interface
 */
export interface LoginCredentials {
  username: string // Can be username OR email
  password: string
  captchaToken?: string
  rememberMe?: boolean // Extended session (30 days vs 24 hours)
}

/**
 * Login OTP Required Response
 * Returned when password login succeeds but email OTP verification is needed
 * The loginSessionToken MUST be passed to /verify-otp to prove password was verified
 */
export interface LoginOTPRequiredResponse {
  requiresOtp: true
  code: 'OTP_REQUIRED'
  message: string               // Arabic message
  messageEn: string             // English message
  email: string                 // Masked email: "u***r@example.com"
  fullEmail: string             // Full email for OTP verification (stored securely)
  expiresIn: number             // OTP expiry in seconds (300 = 5 min)
  loginSessionToken: string     // CRITICAL: Must pass to /verify-otp
  loginSessionExpiresIn: number // Session expiry in seconds (600 = 10 min)
  securityWarning?: SecurityWarning

  // Backend nested format support
  requires?: {
    otp?: boolean
    mfa?: boolean
  }
}

/**
 * Email Verification State from backend
 * Returned in login/OTP responses to indicate feature access restrictions
 */
export interface EmailVerificationResponse {
  isVerified: boolean
  requiresVerification: boolean
  verificationSentAt?: string
  allowedFeatures: string[]
  blockedFeatures: string[]
}

/**
 * Login Result Interface
 * Contains user and optional breach warning
 * Used when login completes directly (SSO, One-Tap) without requiring OTP
 */
export interface LoginResult {
  user: User
  warning?: PasswordBreachWarning
  emailVerification?: EmailVerificationResponse
}

/**
 * Union type for login response - either OTP required or direct login success
 */
export type LoginResponse = LoginOTPRequiredResponse | LoginResult

/**
 * Type guard to check if login response requires OTP
 * Supports both nested format (requires.otp) and flat format (requiresOtp)
 */
export function isOTPRequired(response: LoginResponse): response is LoginOTPRequiredResponse {
  // Check nested format first (new backend format)
  if ('requires' in response && typeof response.requires === 'object' && response.requires?.otp === true) {
    return true
  }
  // Fall back to flat format (legacy)
  return 'requiresOtp' in response && response.requiresOtp === true
}

/**
 * Register Data Interface
 */
export interface RegisterData {
  // Required fields
  email: string
  password: string
  firstName: string
  lastName: string

  // Role - set isSeller: true for lawyers
  isSeller: boolean

  // Lawyer Work Mode (required if isSeller: true)
  lawyerWorkMode?: 'solo' | 'create_firm' | 'join_firm'

  // Optional fields
  username?: string
  phone?: string
  country?: string // Default: "Saudi Arabia"
  nationality?: string
  region?: string
  city?: string
  image?: string
  description?: string
  captchaToken?: string
  role?: 'client' | 'lawyer'

  // If lawyerWorkMode is 'create_firm'
  firmData?: {
    name: string // Required
    licenseNumber: string // Required
    nameEn?: string
    email?: string
    phone?: string
    region?: string
    city?: string
    address?: string
    website?: string
    description?: string
    specializations?: string[]
  }

  // If lawyerWorkMode is 'join_firm'
  invitationCode?: string // Required for join_firm

  // Lawyer Profile (optional, for lawyers)
  isLicensed?: boolean
  licenseNumber?: string
  yearsOfExperience?: number
  workType?: string
  firmName?: string
  specializations?: string[]
  languages?: string[]
  courts?: Record<string, { selected?: boolean; caseCount?: string }>
  isRegisteredKhebra?: boolean
  serviceType?: string
  pricingModel?: string[]
  hourlyRateMin?: number
  hourlyRateMax?: number
  acceptsRemote?: boolean
}

/**
 * Check Availability Data Interface
 */
export interface CheckAvailabilityData {
  field: 'email' | 'username' | 'phone'
  value: string
}

/**
 * Check Availability Response
 */
export interface CheckAvailabilityResponse {
  available: boolean
  message?: string
}

/**
 * OTP Purpose types
 * Used to specify why the OTP is being requested
 */
export type OTPPurpose = 'login' | 'registration' | 'verify_email'

/**
 * Send OTP Data Interface
 * Backend expects 'purpose' field per documentation
 */
export interface SendOTPData {
  email: string
  purpose?: OTPPurpose  // login | registration | verify_email
}

/**
 * OTP Response Interface
 */
export interface OTPResponse {
  success: boolean
  message: string
  messageEn?: string
  expiresIn?: number
  email?: string  // Backend echoes back the email
}

/**
 * Verify OTP Data Interface
 * Note: Backend expects 'otp' field, not 'code'
 *
 * SECURITY: For purpose='login', loginSessionToken is REQUIRED
 * This token proves the password was actually verified before OTP
 * and prevents OTP-only bypass attacks
 */
export interface VerifyOTPData {
  email: string
  otp: string
  purpose?: OTPPurpose  // login | registration | verify_email
  loginSessionToken?: string  // REQUIRED for purpose='login' - proves password was verified
}

/**
 * OTP Status Response
 */
export interface OTPStatusResponse {
  attemptsRemaining: number
  resetTime?: string
}

/**
 * Magic Link Request Data
 */
export interface MagicLinkData {
  email: string
}

/**
 * Magic Link Response
 */
export interface MagicLinkResponse {
  success: boolean
  message: string
  expiresIn?: number // seconds until link expires
}

/**
 * Magic Link Verification Data
 */
export interface MagicLinkVerifyData {
  token: string
}

/**
 * Email Verification Response
 */
export interface EmailVerificationResponse {
  success: boolean
  message: string
}

/**
 * API Response Interface with optional tokens
 * Supports both OAuth 2.0 standard fields (snake_case) and backwards-compatible fields (camelCase)
 */
interface AuthResponse {
  // Standard response fields
  success?: boolean
  error?: boolean
  message?: string
  messageAr?: string  // Arabic message from backend
  messageEn?: string
  user?: User

  // OTP/MFA Required Response - Backend uses nested "requires" object
  // Example: { "requires": { "otp": true, "mfa": false } }
  requires?: {
    otp?: boolean
    mfa?: boolean
  }

  // Legacy flat fields (for backwards compatibility)
  requiresOtp?: boolean  // Legacy: prefer requires.otp
  code?: string  // 'OTP_REQUIRED' when OTP is needed (legacy)

  // OTP session fields
  email?: string  // Masked email for display
  loginSessionToken?: string  // Token to pass to verify-otp
  loginSessionExpiresIn?: number  // Session expiry in seconds

  // OAuth 2.0 Standard (snake_case) - recommended for new code
  access_token?: string
  refresh_token?: string
  token_type?: 'Bearer'
  expires_in?: number  // seconds until access token expires

  // Backwards compatibility (camelCase) - existing code continues to work
  accessToken?: string
  refreshToken?: string
  expiresIn?: number

  // Password breach warning (only present if password was found in breaches)
  // Backend returns this as 'passwordWarning' from HaveIBeenPwned check
  passwordWarning?: PasswordBreachWarning

  // Security warning for OTP flow (breach detected but allowing OTP verification)
  securityWarning?: SecurityWarning

  // Email verification state (returned by login, OTP verification, /auth/me)
  emailVerification?: EmailVerificationResponse
}

/**
 * SECURITY: Test credentials removed from production code
 * Test credentials should be loaded from environment variables in test environments only
 * See: src/test/auth-fixtures.ts for test-only auth helpers
 */
// TEST_CREDENTIALS and TEST_USER have been removed for security
// If you need test auth, use the test fixtures or environment variables

/**
 * Helper to normalize user data from backend
 * Extracts firmId from firm.id or tenant.id if not directly provided
 */
const normalizeUser = (user: User): User => {
  // If firmId is already set, return as-is
  if (user.firmId) return user

  // Extract firmId from firm.id or tenant.id
  const firmId = user.firm?.id || user.tenant?.id
  if (firmId) {
    return { ...user, firmId }
  }

  return user
}

/**
 * Track auth state for resilience against intermittent failures
 *
 * SECURITY FIX: Reduced grace period from 30 minutes to 2 minutes
 * SECURITY FIX: Reduced max consecutive 401s from 10 to 3
 *
 * Previous values were too permissive and could allow attackers to maintain
 * access after token revocation.
 */
let lastSuccessfulAuth: number = 0
let consecutive401Count: number = 0
let memoryCachedUser: User | null = null // Keep user in memory as backup to localStorage
const AUTH_GRACE_PERIOD = 2 * 60 * 1000 // 2 minutes - SECURITY: reduced from 30 minutes
const MAX_CONSECUTIVE_401 = 3 // SECURITY: reduced from 10 - prompt re-auth after 3 failures

/**
 * Request deduplication for getCurrentUser
 * Prevents multiple concurrent /auth/me calls when multiple routes preload simultaneously
 */
let pendingAuthRequest: Promise<User | null> | null = null

/**
 * Time-based request caching for getCurrentUser
 * Prevents making new /auth/me requests if we recently verified auth
 * This is critical for route preloading where multiple routes call beforeLoad in sequence
 */
let lastAuthRequestTime: number = 0
let lastAuthRequestResult: User | null = null
const AUTH_REQUEST_CACHE_MS = 10 * 1000 // Cache auth result for 10 seconds

/**
 * Auth event logger - only logs in development mode
 * In production, this is a no-op for performance
 */
const logAuthEvent = import.meta.env.DEV
  ? (event: string, data: Record<string, any>) => {
      console.log('[AUTH]', event, data)
    }
  : () => {} // No-op in production

/**
 * Auth Service Object
 */
const authService = {
  /**
   * Login user
   * Backend returns access and refresh tokens for dual token auth
   * Also sets HttpOnly cookie for backward compatibility
   *
   * =========================================================================
   * 🚨 BACKEND_TODO: LOGIN ENDPOINT REQUIREMENTS
   * =========================================================================
   * POST /api/auth/login MUST return:
   *
   * SUCCESS (normal login):
   * {
   *   "error": false,
   *   "message": "Success",
   *   "user": {
   *     "_id": "...",
   *     "email": "...",
   *     "role": "lawyer",
   *     "mfaEnabled": true,       // ← REQUIRED
   *     "mfaPending": false,      // ← REQUIRED
   *     "firmId": "...",          // ← REQUIRED for firm members
   *     "firm": { "id": "...", "name": "...", "status": "active" },
   *     "isSoloLawyer": false,    // ← REQUIRED
   *     "permissions": { ... }    // ← REQUIRED for RBAC
   *   },
   *   "accessToken": "eyJhbG...",  // ← REQUIRED
   *   "refreshToken": "eyJhbG..." // ← REQUIRED
   * }
   *
   * SUCCESS (MFA required):
   * {
   *   "error": false,
   *   "mfaRequired": true,       // ← Triggers MFA verification
   *   "userId": "...",            // ← Needed for MFA verify call
   *   "user": null,               // ← No user until MFA verified
   *   "accessToken": null,
   *   "refreshToken": null
   * }
   *
   * See: src/config/BACKEND_AUTH_ISSUES.ts for full documentation
   * =========================================================================
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      // NOTE: TanStack Query automatically invalidates queries on auth state change
      // No manual cache clearing needed - query invalidation happens via queryClient

      // Call backend login API
      const response = await authApi.post<AuthResponse>(
        '/auth/login',
        credentials
      )

      // Check if OTP verification is required (email-based 2FA for password login)
      // This is the normal flow for password-based login: password verified, now needs OTP
      // Backend uses nested format: { requires: { otp: true } }
      // Also support legacy flat format for backwards compatibility: { requiresOtp: true }
      const otpRequired = response.data.requires?.otp === true || response.data.requiresOtp === true
      const hasLoginSessionToken = !!response.data.loginSessionToken

      if (otpRequired && hasLoginSessionToken) {
        authLog('Password verified, OTP required for login', {
          email: response.data.email, // Masked email
          expiresIn: response.data.expiresIn,
          hasSecurityWarning: !!response.data.securityWarning,
          format: response.data.requires ? 'nested' : 'legacy',
        })

        // Return OTP required response - caller must redirect to OTP page
        // Backend sends messageAr for Arabic, message for English
        const otpResponse: LoginOTPRequiredResponse = {
          requiresOtp: true,
          code: 'OTP_REQUIRED',
          message: response.data.messageAr || response.data.message || 'يرجى إدخال رمز التحقق المرسل إلى بريدك الإلكتروني',
          messageEn: response.data.message || response.data.messageEn || 'Please enter the verification code sent to your email',
          email: response.data.email || '', // Masked email for display
          fullEmail: credentials.username, // Use the email they logged in with
          expiresIn: response.data.expiresIn || 300, // Default 5 min
          loginSessionToken: response.data.loginSessionToken || '',
          loginSessionExpiresIn: response.data.loginSessionExpiresIn || 600, // Default 10 min
          securityWarning: response.data.securityWarning,
        }

        // Validate critical field
        if (!otpResponse.loginSessionToken) {
          authError('Backend did not return loginSessionToken for OTP flow!')
          throw new Error('خطأ في نظام التحقق. يرجى المحاولة مرة أخرى. | Authentication system error. Please try again.')
        }

        return otpResponse
      }

      // Normal login flow (SSO, One-Tap, or if backend doesn't require OTP)
      if (response.data.error || !response.data.user) {
        throw new Error(response.data.message || 'فشل تسجيل الدخول')
      }

      // Store tokens if provided - supports both OAuth 2.0 (snake_case) and backwards-compatible (camelCase)
      // Note: refreshToken may be in httpOnly cookie (more secure) rather than response body
      const accessToken = response.data.access_token || response.data.accessToken
      const refreshToken = response.data.refresh_token || response.data.refreshToken
      const expiresIn = response.data.expires_in || response.data.expiresIn // seconds until access token expires

      if (accessToken) {
        storeTokens(accessToken, refreshToken, expiresIn)
        authLog('Login tokens stored successfully', {
          hasExpiresIn: !!expiresIn,
          expiresIn: expiresIn ? `${expiresIn}s (${Math.round(expiresIn / 60)}min)` : 'N/A',
          refreshTokenIn: refreshToken ? 'response body' : 'httpOnly cookie',
          tokenFormat: response.data.access_token ? 'OAuth 2.0 (snake_case)' : 'Legacy (camelCase)',
        })
      } else {
        authWarn('Login response did not include accessToken!')
        authLog('Response keys:', Object.keys(response.data))
      }

      // Normalize user data to ensure firmId is set
      let user = normalizeUser(response.data.user)

      // Check for password breach warning and set user flags accordingly
      // Backend returns passwordWarning: { breached, count, message } from HaveIBeenPwned check
      const warning = response.data.passwordWarning
      if (warning?.breached) {
        authWarn('Password breach detected!', { count: warning.count })
        user = {
          ...user,
          mustChangePassword: true,
          passwordBreached: true,
        }
      }

      // Store minimal user data in localStorage for persistence
      // SECURITY NOTE: Role stored here is for UI display only
      // All authorization must be enforced on the backend
      localStorage.setItem('user', JSON.stringify(user))

      // Also keep in memory as backup (localStorage can be cleared by other tabs/race conditions)
      memoryCachedUser = user

      // Mark successful authentication
      lastSuccessfulAuth = Date.now()
      consecutive401Count = 0
      logAuthEvent('LOGIN_SUCCESS', {
        username: user.username,
        userId: user._id,
        firmId: user.firmId,
        hasBreachWarning: !!warning,
      })

      // Initialize CSRF token after successful login
      // This ensures we have a valid token for subsequent API calls
      refreshCsrfToken().catch((err) => {
        console.warn('[AUTH] CSRF token initialization after login failed:', err)
      })

      // Extract emailVerification from response (for SSO/One-Tap direct login)
      const emailVerification = response.data.emailVerification

      return { user, warning, emailVerification }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData): Promise<void> => {
    try {
      const response = await authApi.post<AuthResponse>(
        '/auth/register',
        data
      )

      if (response.data.error) {
        throw new Error(response.data.message || 'فشل التسجيل')
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Logout user
   * Clears tokens, HttpOnly cookie, localStorage, AND memory cache
   *
   * IMPORTANT: This is the ONLY place that should clear auth state.
   * getCurrentUser() should NEVER clear localStorage/memory - only logout() does.
   */
  logout: async (): Promise<void> => {
    try {
      await authApi.post('/auth/logout')
    } catch {
      // Ignore logout API errors - we clear state anyway
    }
    // Clear ALL auth state regardless of API result
    localStorage.removeItem('user')
    memoryCachedUser = null
    lastSuccessfulAuth = 0
    consecutive401Count = 0
    // Clear time-based request cache so next auth check makes a fresh request
    lastAuthRequestTime = 0
    lastAuthRequestResult = null
    // Clear tokens and reset all API state (includes token refresh queue)
    resetApiState()
  },

  /**
   * Get current authenticated user
   * Verifies token validity with backend
   *
   * IMPORTANT: Only returns null for explicit auth failures (401)
   * For other errors (500, network), returns cached user to prevent unnecessary logout
   *
   * Uses request deduplication to prevent multiple concurrent /auth/me calls
   * when multiple routes preload simultaneously (e.g., TanStack Router's beforeLoad)
   *
   * Also uses time-based caching to prevent sequential route preloads from
   * each making a new /auth/me request (10 second cache window)
   */
  getCurrentUser: async (): Promise<User | null> => {
    const now = Date.now()

    // TIME-BASED CACHE: If we successfully verified auth recently, return cached result
    // This prevents sequential route preloads from each making a new /auth/me request
    if (lastAuthRequestResult !== null && (now - lastAuthRequestTime) < AUTH_REQUEST_CACHE_MS) {
      logAuthEvent('GET_CURRENT_USER_CACHED', {
        action: 'returning cached result',
        cacheAge: now - lastAuthRequestTime,
        cacheMaxAge: AUTH_REQUEST_CACHE_MS,
        userId: lastAuthRequestResult._id,
      })
      return lastAuthRequestResult
    }

    // If there's already a pending request, return the same promise
    // This prevents multiple concurrent /auth/me calls
    if (pendingAuthRequest) {
      logAuthEvent('GET_CURRENT_USER_DEDUPE', { action: 'reusing pending request' })
      return pendingAuthRequest
    }

    authLog('=== GET CURRENT USER START ===')
    authLog('Token state before /auth/me:', {
      hasAccessToken: !!getAccessToken(),
      hasRefreshToken: !!getRefreshToken(),
      accessTokenPreview: getAccessToken() ? getAccessToken()!.substring(0, 20) + '...' : 'NONE',
    })

    logAuthEvent('GET_CURRENT_USER_START', { action: 'calling /auth/me' })

    // Create the actual request and store the promise
    pendingAuthRequest = (async (): Promise<User | null> => {
    try {
      authLog('Calling GET /auth/me...')
      const response = await authApi.get<AuthResponse>('/auth/me')

      if (response.data.error || !response.data.user) {
        // Backend said no user - but DON'T immediately logout!
        // Apply same resilience as 401 errors
        const cachedUser = authService.getCachedUser()
        const timeSinceLastSuccess = Date.now() - lastSuccessfulAuth
        const recentlyAuthenticated = timeSinceLastSuccess < AUTH_GRACE_PERIOD

        consecutive401Count++

        const decision = recentlyAuthenticated && cachedUser && consecutive401Count < MAX_CONSECUTIVE_401
          ? 'USING_CACHED_USER'
          : 'WILL_CLEAR_AUTH'

        logAuthEvent('GET_CURRENT_USER_NO_USER', {
          backendMessage: response.data.message,
          backendError: response.data.error,
          decision,
          willUseCachedUser: decision === 'USING_CACHED_USER',
          reason: decision === 'USING_CACHED_USER'
            ? 'Recently authenticated, have cached user, under failure threshold'
            : `recentlyAuth=${recentlyAuthenticated}, hasCached=${!!cachedUser}, count=${consecutive401Count}/${MAX_CONSECUTIVE_401}`,
        })

        // If recently authenticated and have cached user, DON'T logout
        if (decision === 'USING_CACHED_USER') {
          return cachedUser
        }

        // IMPORTANT: Even if we decide to "clear auth", DON'T actually clear localStorage
        // or reset lastSuccessfulAuth! Multiple parallel route preloads race and clearing
        // state here causes ALL of them to fail. Just return null to redirect to sign-in.
        // Only explicit logout() should clear localStorage.
        logAuthEvent('AUTH_CHECK_FAILED_NO_CLEAR', {
          reason: 'Backend returned no user, conditions not met for using cache',
          consecutive401Count,
          recentlyAuthenticated,
          hasCachedUser: !!cachedUser,
          note: 'NOT clearing localStorage - only logout() does that',
        })
        return null
      }

      // SUCCESS! Reset failure tracking
      lastSuccessfulAuth = Date.now()
      consecutive401Count = 0

      // Normalize user data to ensure firmId is set
      const user = normalizeUser(response.data.user)

      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(user))

      // Also keep in memory as backup
      memoryCachedUser = user

      // Update time-based request cache (prevents sequential route preloads from making new requests)
      lastAuthRequestTime = Date.now()
      lastAuthRequestResult = user

      logAuthEvent('GET_CURRENT_USER_SUCCESS', {
        username: user.username,
        userId: user._id,
      })

      // Ensure CSRF token is available for authenticated session
      // This helps when restoring session on page refresh
      if (!document.cookie.includes('csrfToken=')) {
        refreshCsrfToken().catch((err) => {
          console.warn('[AUTH] CSRF token initialization on session restore failed:', err)
        })
      }

      return user
    } catch (error: any) {
      const cachedUser = authService.getCachedUser()
      const timeSinceLastSuccess = Date.now() - lastSuccessfulAuth
      const recentlyAuthenticated = timeSinceLastSuccess < AUTH_GRACE_PERIOD

      logAuthEvent('GET_CURRENT_USER_ERROR', {
        status: error?.status,
        message: error?.message,
        url: '/auth/me',
        timestamp: new Date().toISOString(),
        consecutive401Count,
        recentlyAuthenticated,
        timeSinceLastSuccess: Math.round(timeSinceLastSuccess / 1000) + 's',
        hasCachedUser: !!cachedUser,
      })

      // Handle 401 with resilience
      if (error?.status === 401) {
        consecutive401Count++

        const decision = recentlyAuthenticated && cachedUser && consecutive401Count < MAX_CONSECUTIVE_401
          ? 'USING_CACHED_USER'
          : 'WILL_CLEAR_AUTH'

        logAuthEvent('GET_CURRENT_USER_401', {
          decision,
          reason: decision === 'USING_CACHED_USER'
            ? 'Recently authenticated, have cached user, under failure threshold'
            : `recentlyAuth=${recentlyAuthenticated}, hasCached=${!!cachedUser}, count=${consecutive401Count}/${MAX_CONSECUTIVE_401}`,
        })

        if (decision === 'USING_CACHED_USER') {
          return cachedUser
        }

        // DON'T clear localStorage here! Race conditions with parallel route preloads.
        logAuthEvent('AUTH_401_FAILED_NO_CLEAR', {
          trigger: '401_conditions_not_met',
          note: 'NOT clearing localStorage - only logout() does that',
        })
        return null
      }

      // For 400 with specific auth error messages, also treat as auth failure
      if (error?.status === 400) {
        const message = error?.message?.toLowerCase() || ''
        if (message.includes('unauthorized') || message.includes('access denied') || message.includes('token')) {
          consecutive401Count++

          const decision = recentlyAuthenticated && cachedUser && consecutive401Count < MAX_CONSECUTIVE_401
            ? 'USING_CACHED_USER'
            : 'WILL_CLEAR_AUTH'

          logAuthEvent('GET_CURRENT_USER_400_AUTH', {
            decision,
            errorMessage: message,
          })

          if (decision === 'USING_CACHED_USER') {
            return cachedUser
          }

          // DON'T clear localStorage here! Race conditions with parallel route preloads.
          logAuthEvent('AUTH_400_FAILED_NO_CLEAR', {
            trigger: '400_conditions_not_met',
            note: 'NOT clearing localStorage - only logout() does that',
          })
          return null
        }
      }

      // For other errors (500, network issues, etc.), DON'T log out
      // Return the cached user instead - they might still be authenticated
      if (cachedUser) {
        logAuthEvent('GET_CURRENT_USER_OTHER_ERROR_USING_CACHE', {
          errorStatus: error?.status,
          errorMessage: error?.message,
        })
        return cachedUser
      }

      // No cached user and error - return null but don't redirect
      logAuthEvent('GET_CURRENT_USER_NO_CACHE_RETURNING_NULL', {
        errorStatus: error?.status,
        errorMessage: error?.message,
      })
      return null
    }
    })()

    // Wait for the request to complete
    try {
      return await pendingAuthRequest
    } finally {
      // Clear the pending request so future calls make a new request
      pendingAuthRequest = null
    }
  },

  /**
   * Get cached user from localStorage (with multiple fallbacks)
   * Use this for initial load, then verify with getCurrentUser()
   *
   * Fallback chain (in order):
   * 1. localStorage.user (direct authService storage)
   * 2. memoryCachedUser (in-memory backup)
   * 3. localStorage.auth-storage (Zustand persist storage)
   *
   * This prevents logout during race conditions or mysterious localStorage clears.
   */
  getCachedUser: (): User | null => {
    try {
      // 1. Try direct localStorage first
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        // Keep memory cache in sync
        memoryCachedUser = user
        return user
      }

      // 2. localStorage.user is empty - try memory cache
      if (memoryCachedUser) {
        logAuthEvent('USING_MEMORY_CACHE_FALLBACK', {
          reason: 'localStorage.user empty but memoryCachedUser exists',
          userId: memoryCachedUser._id,
        })
        // Restore to localStorage since it was empty
        localStorage.setItem('user', JSON.stringify(memoryCachedUser))
        return memoryCachedUser
      }

      // 3. Last resort - check Zustand's auth-storage (different localStorage key)
      // This catches cases where localStorage.user got cleared but auth-storage didn't
      const authStorageStr = localStorage.getItem('auth-storage')
      if (authStorageStr) {
        try {
          const authStorage = JSON.parse(authStorageStr)
          if (authStorage?.state?.user) {
            const user = authStorage.state.user
            logAuthEvent('USING_ZUSTAND_STORAGE_FALLBACK', {
              reason: 'localStorage.user and memoryCachedUser empty, but auth-storage has user',
              userId: user._id,
            })
            // Restore to both localStorage and memory
            localStorage.setItem('user', JSON.stringify(user))
            memoryCachedUser = user
            return user
          }
        } catch {
          // Ignore parse errors for auth-storage
        }
      }

      return null
    } catch (error) {
      // JSON parse error - try memory cache and Zustand storage
      if (memoryCachedUser) {
        logAuthEvent('USING_MEMORY_CACHE_AFTER_PARSE_ERROR', {
          reason: 'localStorage.user parse failed but memoryCachedUser exists',
          userId: memoryCachedUser._id,
        })
        localStorage.setItem('user', JSON.stringify(memoryCachedUser))
        return memoryCachedUser
      }

      // Try Zustand storage as last resort
      try {
        const authStorageStr = localStorage.getItem('auth-storage')
        if (authStorageStr) {
          const authStorage = JSON.parse(authStorageStr)
          if (authStorage?.state?.user) {
            const user = authStorage.state.user
            logAuthEvent('USING_ZUSTAND_STORAGE_AFTER_PARSE_ERROR', {
              reason: 'localStorage.user corrupted, using auth-storage fallback',
              userId: user._id,
            })
            localStorage.setItem('user', JSON.stringify(user))
            memoryCachedUser = user
            return user
          }
        }
      } catch {
        // Ignore
      }

      localStorage.removeItem('user')
      return null
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return authService.getCachedUser() !== null
  },

  /**
   * Check if user has specific role
   */
  hasRole: (role: 'client' | 'lawyer' | 'admin'): boolean => {
    const user = authService.getCachedUser()
    return user?.role === role
  },

  /**
   * Check if user is admin
   */
  isAdmin: (): boolean => {
    return authService.hasRole('admin')
  },

  /**
   * Check if user is lawyer
   */
  isLawyer: (): boolean => {
    return authService.hasRole('lawyer')
  },

  /**
   * Check if user is client
   */
  isClient: (): boolean => {
    return authService.hasRole('client')
  },

  /**
   * Check availability of email, username, or phone
   */
  checkAvailability: async (data: CheckAvailabilityData): Promise<CheckAvailabilityResponse> => {
    try {
      const response = await authApi.post<{ error: boolean; available: boolean; message?: string }>(
        '/auth/check-availability',
        data
      )

      if (response.data.error) {
        throw new Error(response.data.message || 'فشل التحقق من التوفر')
      }

      return {
        available: response.data.available,
        message: response.data.message
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Send OTP to email for passwordless authentication
   * POST /api/auth/send-otp
   * @param data.email - Email address to send OTP to
   * @param data.purpose - Purpose of OTP: 'login' | 'registration' | 'verify_email' (default: 'login')
   */
  sendOTP: async (data: SendOTPData): Promise<OTPResponse> => {
    try {
      const response = await authApi.post<{
        success: boolean
        message: string
        messageEn?: string
        expiresIn?: number
        email?: string
      }>(
        '/auth/send-otp',
        {
          email: data.email,
          purpose: data.purpose || 'login',  // Default to 'login' if not specified
        }
      )

      return {
        success: response.data.success,
        message: response.data.message,
        messageEn: response.data.messageEn,
        expiresIn: response.data.expiresIn,
        email: response.data.email,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify OTP code and login
   *
   * =========================================================================
   * 🚨 BACKEND_TODO: OTP VERIFY ENDPOINT MUST RETURN TOKENS
   * =========================================================================
   * POST /api/auth/verify-otp MUST return:
   *
   * SUCCESS:
   * {
   *   "error": false,
   *   "message": "Success",
   *   "user": { "_id": "...", "email": "...", ... },
   *   "accessToken": "eyJhbG...",  // ← REQUIRED
   *   "refreshToken": "eyJhbG..." // ← REQUIRED
   * }
   *
   * FAILURE (wrong code):
   * {
   *   "error": true,
   *   "message": "Invalid OTP",
   *   "attemptsLeft": 2          // ← Remaining attempts before lockout
   * }
   *
   * See: src/config/BACKEND_AUTH_ISSUES.ts for full documentation
   * =========================================================================
   */
  verifyOTP: async (data: VerifyOTPData): Promise<{ user: User; emailVerification?: EmailVerificationResponse }> => {
    try {
      // SECURITY: For login purpose, loginSessionToken is REQUIRED
      // This proves the password was verified before OTP
      if (data.purpose === 'login' && !data.loginSessionToken) {
        authError('verifyOTP called for login without loginSessionToken!')
        throw new Error('جلسة تسجيل الدخول منتهية. يرجى إعادة تسجيل الدخول. | Login session expired. Please sign in again.')
      }

      authLog('Verifying OTP', {
        email: data.email,
        purpose: data.purpose,
        hasLoginSessionToken: !!data.loginSessionToken,
      })

      const response = await authApi.post<AuthResponse>(
        '/auth/verify-otp',
        {
          email: data.email,
          otp: data.otp,
          purpose: data.purpose || 'login',
          ...(data.loginSessionToken && { loginSessionToken: data.loginSessionToken }),
        }
      )

      if (response.data.error || !response.data.user) {
        throw new Error(response.data.message || 'فشل التحقق من رمز OTP')
      }

      // Store tokens if provided - supports both OAuth 2.0 (snake_case) and backwards-compatible (camelCase)
      // Note: refreshToken may be in httpOnly cookie (more secure) rather than response body
      const accessToken = response.data.access_token || response.data.accessToken
      const refreshToken = response.data.refresh_token || response.data.refreshToken
      const expiresIn = response.data.expires_in || response.data.expiresIn // seconds until access token expires

      if (accessToken) {
        storeTokens(accessToken, refreshToken, expiresIn)
        authLog('OTP verify tokens stored successfully', {
          hasExpiresIn: !!expiresIn,
          expiresIn: expiresIn ? `${expiresIn}s (${Math.round(expiresIn / 60)}min)` : 'N/A',
          refreshTokenIn: refreshToken ? 'response body' : 'httpOnly cookie',
          tokenFormat: response.data.access_token ? 'OAuth 2.0 (snake_case)' : 'Legacy (camelCase)',
        })
      } else {
        authWarn('OTP verify did not return accessToken!')
      }

      // Normalize user data to ensure firmId is set
      const user = normalizeUser(response.data.user)

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user))

      // Also keep in memory as backup
      memoryCachedUser = user

      // Mark successful authentication (OTP is also a login method)
      lastSuccessfulAuth = Date.now()
      consecutive401Count = 0
      logAuthEvent('VERIFY_OTP_SUCCESS', {
        username: user.username,
        userId: user._id,
      })

      // Initialize CSRF token after successful OTP verification
      refreshCsrfToken().catch((err) => {
        console.warn('[AUTH] CSRF token initialization after OTP failed:', err)
      })

      // Extract emailVerification from response (if provided by backend)
      const emailVerification = response.data.emailVerification as EmailVerificationResponse | undefined

      return { user, emailVerification }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resend OTP code
   * Uses the same endpoint as sendOTP
   * POST /api/auth/send-otp
   */
  resendOTP: async (data: SendOTPData): Promise<OTPResponse> => {
    // Resend uses the same endpoint as send
    return authService.sendOTP(data)
  },

  /**
   * Check OTP rate limit status
   */
  checkOTPStatus: async (): Promise<OTPStatusResponse> => {
    try {
      const response = await authApi.get<{
        success: boolean
        data: {
          attemptsRemaining: number
          resetTime?: string
        }
      }>('/auth/otp-status')

      return {
        attemptsRemaining: response.data.data.attemptsRemaining,
        resetTime: response.data.data.resetTime
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== MAGIC LINK AUTHENTICATION ====================

  /**
   * Send magic link to email for passwordless authentication
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/auth/magic-link/send
   */
  sendMagicLink: async (data: MagicLinkData): Promise<MagicLinkResponse> => {
    try {
      const response = await authApi.post<{
        success: boolean
        message: string
        expiresIn?: number
      }>('/auth/magic-link/send', data)

      return {
        success: response.data.success,
        message: response.data.message,
        expiresIn: response.data.expiresIn,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify magic link token and login
   * ✅ ENDPOINT IMPLEMENTED IN BACKEND
   * POST /api/auth/magic-link/verify
   */
  verifyMagicLink: async (data: MagicLinkVerifyData): Promise<User> => {
    try {
      const response = await authApi.post<AuthResponse>(
        '/auth/magic-link/verify',
        data
      )

      if (response.data.error || !response.data.user) {
        throw new Error(
          response.data.message || 'فشل التحقق من رابط الدخول | Magic link verification failed'
        )
      }

      // Store tokens if provided - supports both OAuth 2.0 (snake_case) and backwards-compatible (camelCase)
      // Note: refreshToken may be in httpOnly cookie (more secure) rather than response body
      const accessToken = response.data.access_token || response.data.accessToken
      const refreshToken = response.data.refresh_token || response.data.refreshToken
      const expiresIn = response.data.expires_in || response.data.expiresIn // seconds until access token expires

      if (accessToken) {
        storeTokens(accessToken, refreshToken, expiresIn)
        authLog('Magic link tokens stored successfully', {
          hasExpiresIn: !!expiresIn,
          expiresIn: expiresIn ? `${expiresIn}s (${Math.round(expiresIn / 60)}min)` : 'N/A',
          refreshTokenIn: refreshToken ? 'response body' : 'httpOnly cookie',
          tokenFormat: response.data.access_token ? 'OAuth 2.0 (snake_case)' : 'Legacy (camelCase)',
        })
      } else {
        authWarn('Magic link verify did not return accessToken!')
      }

      // Normalize user data to ensure firmId is set
      const user = normalizeUser(response.data.user)

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user))

      // Also keep in memory as backup
      memoryCachedUser = user

      // Mark successful authentication
      lastSuccessfulAuth = Date.now()
      consecutive401Count = 0
      logAuthEvent('VERIFY_MAGIC_LINK_SUCCESS', {
        username: user.username,
        userId: user._id,
      })

      // Initialize CSRF token after successful magic link verification
      refreshCsrfToken().catch((err) => {
        console.warn('[AUTH] CSRF token initialization after magic link failed:', err)
      })

      return user
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== EMAIL VERIFICATION ====================

  /**
   * Send email verification link to user's email
   * POST /api/auth/resend-verification
   * Note: Backend uses same endpoint for initial send and resend
   */
  sendVerificationEmail: async (): Promise<EmailVerificationResponse> => {
    try {
      const response = await authApi.post<{
        error: boolean
        success?: boolean
        message: string
        messageEn?: string
        expiresAt?: string
      }>('/auth/resend-verification')

      return {
        success: !response.data.error && response.data.success !== false,
        message: response.data.message,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify email using token from verification link
   * POST /api/auth/verify-email
   */
  verifyEmail: async (token: string): Promise<EmailVerificationResponse> => {
    try {
      const response = await authApi.post<{
        error: boolean
        success?: boolean
        message: string
        messageEn?: string
        user?: {
          id: string
          email: string
          isEmailVerified: boolean
          emailVerifiedAt: string
        }
      }>('/auth/verify-email', { token })

      // If verification successful, update cached user
      if (!response.data.error) {
        const cachedUser = authService.getCachedUser()
        if (cachedUser) {
          const updatedUser = {
            ...cachedUser,
            isEmailVerified: true,
            emailVerifiedAt: response.data.user?.emailVerifiedAt || new Date().toISOString(),
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          memoryCachedUser = updatedUser
        }
      }

      return {
        success: !response.data.error,
        message: response.data.message,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resend email verification link
   * POST /api/auth/resend-verification
   */
  resendVerificationEmail: async (): Promise<EmailVerificationResponse> => {
    try {
      const response = await authApi.post<{
        error: boolean
        success?: boolean
        message: string
        messageEn?: string
        expiresAt?: string
      }>('/auth/resend-verification')

      return {
        success: !response.data.error && response.data.success !== false,
        message: response.data.message,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Check if current user's email is verified
   * Helper method that returns cached value
   */
  isEmailVerified: (): boolean => {
    const user = authService.getCachedUser()
    return user?.isEmailVerified === true
  },

  /**
   * Request verification email - PUBLIC endpoint (NO authentication required)
   * POST /api/auth/request-verification-email
   *
   * Use this when user is blocked from login due to unverified email.
   * This solves the circular dependency where users couldn't resend
   * verification because they weren't logged in.
   *
   * Note: Response is always the same regardless of email existence
   * to prevent user enumeration attacks.
   */
  requestVerificationEmail: async (email: string): Promise<{
    success: boolean
    message: string
    messageEn?: string
    waitSeconds?: number
    waitMinutes?: number
    code?: string
  }> => {
    try {
      const response = await authApi.post<{
        error: boolean
        message: string
        messageEn?: string
        email?: string
        code?: string
        waitSeconds?: number
        waitMinutes?: number
      }>('/auth/request-verification-email', { email })

      return {
        success: !response.data.error,
        message: response.data.message,
        messageEn: response.data.messageEn,
        code: response.data.code,
      }
    } catch (error: any) {
      // Handle rate limiting specifically
      if (error?.response?.status === 429) {
        const data = error.response.data
        return {
          success: false,
          message: data?.message || 'يرجى الانتظار قبل إعادة الإرسال',
          messageEn: data?.messageEn || 'Please wait before resending',
          waitSeconds: data?.waitSeconds,
          waitMinutes: data?.waitMinutes,
          code: 'RATE_LIMITED',
        }
      }

      // For other errors, still return a response (don't throw)
      // This maintains the same UX regardless of error type
      return {
        success: true, // Always show success to prevent enumeration
        message: 'إذا كان هذا البريد مسجلاً وغير مُفعّل، سيتم إرسال رابط التفعيل.',
        messageEn: 'If this email is registered and not verified, a verification link will be sent.',
      }
    }
  },
}

/**
 * Plan hierarchy helper
 * Defines the order of plans from lowest to highest
 */
const PLAN_HIERARCHY: Record<'free' | 'starter' | 'professional' | 'enterprise', number> = {
  free: 0,
  starter: 1,
  professional: 2,
  enterprise: 3,
}

/**
 * Check if user's plan meets or exceeds the required plan level
 * Returns true if userPlan >= requiredPlan in the hierarchy
 *
 * @param userPlan - The user's current plan
 * @param requiredPlan - The minimum required plan
 * @returns boolean indicating if user's plan is at least the required level
 *
 * @example
 * isPlanAtLeast('professional', 'starter') // true
 * isPlanAtLeast('free', 'enterprise') // false
 * isPlanAtLeast('professional', 'professional') // true
 */
export const isPlanAtLeast = (
  userPlan: 'free' | 'starter' | 'professional' | 'enterprise' | undefined,
  requiredPlan: 'free' | 'starter' | 'professional' | 'enterprise'
): boolean => {
  // If no plan is specified, default to 'free'
  const currentPlan = userPlan || 'free'
  return PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[requiredPlan]
}

/**
 * Get the plan level number for a given plan
 * Useful for custom comparisons
 *
 * @param plan - The plan to get the level for
 * @returns number representing the plan level (0-3)
 */
export const getPlanLevel = (plan: 'free' | 'starter' | 'professional' | 'enterprise' | undefined): number => {
  return PLAN_HIERARCHY[plan || 'free']
}

/**
 * Check if a user has access to a specific feature
 *
 * @param user - The user object
 * @param featureName - The name of the feature to check
 * @returns boolean indicating if user has access to the feature
 */
export const hasFeature = (user: User | null, featureName: string): boolean => {
  if (!user) return false
  return user.features?.includes(featureName) || false
}

export default authService
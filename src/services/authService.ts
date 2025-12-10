/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClientNoVersion, handleApiError, clearCache } from '@/lib/api'

// Auth routes are NOT versioned - they're at /api/auth/*, not /api/v1/auth/*
// So we use apiClientNoVersion (baseURL: https://api.traf3li.com/api)
const authApi = apiClientNoVersion

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
  firmStatus?: 'active' | 'departed' | 'suspended' | 'pending' | null
  // Tenant for multi-tenant support
  tenant?: UserTenant | null
  // Permissions returned directly from login (for solo lawyers)
  permissions?: UserPermissions | null
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
  createdAt: string
  updatedAt: string
}

/**
 * Login Credentials Interface
 */
export interface LoginCredentials {
  username: string // Can be username OR email
  password: string
}

/**
 * Register Data Interface
 */
export interface RegisterData {
  username: string
  email: string
  password: string
  phone: string
  country?: string
  role?: 'client' | 'lawyer'
  isSeller?: boolean
  description?: string
  image?: string
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
 * Send OTP Data Interface
 */
export interface SendOTPData {
  email: string
}

/**
 * OTP Response Interface
 */
export interface OTPResponse {
  success: boolean
  message: string
  expiresIn?: number
}

/**
 * Verify OTP Data Interface
 */
export interface VerifyOTPData {
  email: string
  code: string
}

/**
 * OTP Status Response
 */
export interface OTPStatusResponse {
  attemptsRemaining: number
  resetTime?: string
}

/**
 * API Response Interface
 */
interface AuthResponse {
  error: boolean
  message: string
  user?: User
}

/**
 * DEVELOPMENT ONLY: Test credentials
 * Only available in development mode - automatically stripped in production builds
 */
const TEST_CREDENTIALS = import.meta.env.DEV ? {
  username: 'test',
  email: 'test@example.com',
  password: 'test123',
} : null

const TEST_USER: User | null = import.meta.env.DEV ? {
  _id: 'test-user-id',
  username: 'test',
  email: 'test@example.com',
  role: 'admin',
  country: 'SA',
  phone: '+966500000000',
  description: 'Test user account',
  isSeller: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} : null

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
 * PRINCIPLE: NEVER auto-logout on errors. Only logout on explicit user action.
 * If auth is truly expired, backend will reject all requests and user can
 * manually refresh or logout. Random errors should NEVER kick users out.
 */
let lastSuccessfulAuth: number = 0
let consecutive401Count: number = 0
const AUTH_GRACE_PERIOD = 30 * 60 * 1000 // 30 minutes - trust cached user for extended period
const MAX_CONSECUTIVE_401 = 10 // Very high threshold - almost never auto-logout

/**
 * DEBUG: Comprehensive auth state logger
 * Logs to console with full context to help debug logout issues
 */
const logAuthEvent = (event: string, data: Record<string, any>) => {
  const authState = {
    event,
    timestamp: new Date().toISOString(),
    lastSuccessfulAuth: lastSuccessfulAuth ? new Date(lastSuccessfulAuth).toISOString() : 'never',
    timeSinceLastSuccess: lastSuccessfulAuth ? `${Math.round((Date.now() - lastSuccessfulAuth) / 1000)}s ago` : 'N/A',
    consecutive401Count,
    gracePeriodRemaining: lastSuccessfulAuth ? `${Math.round((AUTH_GRACE_PERIOD - (Date.now() - lastSuccessfulAuth)) / 1000)}s` : 'N/A',
    hasLocalStorageUser: !!localStorage.getItem('user'),
    currentPath: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    ...data,
  }

  // Use a distinctive prefix for easy filtering in console/logs
  console.log('%c[AUTH-DEBUG]', 'background: #007bff; color: white; padding: 2px 6px; border-radius: 3px;', event, authState)

  // Also log to Sentry if available (will show in Render logs via Sentry)
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.addBreadcrumb({
      category: 'auth',
      message: event,
      data: authState,
      level: 'info',
    })
  }

  return authState
}

/**
 * Auth Service Object
 */
const authService = {
  /**
   * Login user
   * Backend sets HttpOnly cookie automatically
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    try {
      // Clear any cached API responses before login
      // This ensures fresh data is fetched after authentication
      clearCache()

      // Call backend login API
      const response = await authApi.post<AuthResponse>(
        '/auth/login',
        credentials
      )

      if (response.data.error || !response.data.user) {
        throw new Error(response.data.message || 'فشل تسجيل الدخول')
      }

      // Normalize user data to ensure firmId is set
      const user = normalizeUser(response.data.user)

      // Store minimal user data in localStorage for persistence
      // SECURITY NOTE: Role stored here is for UI display only
      // All authorization must be enforced on the backend
      localStorage.setItem('user', JSON.stringify(user))

      // Mark successful authentication
      lastSuccessfulAuth = Date.now()
      consecutive401Count = 0
      logAuthEvent('LOGIN_SUCCESS', {
        username: user.username,
        userId: user._id,
        firmId: user.firmId,
      })

      return user
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
   * Clears HttpOnly cookie and localStorage
   */
  logout: async (): Promise<void> => {
    // CRITICAL: Log the FULL stack trace to find what's calling logout
    const stackTrace = new Error().stack?.split('\n').slice(1, 8).join('\n') || 'unknown'
    logAuthEvent('LOGOUT_CALLED', {
      stackTrace,
      calledFrom: stackTrace.split('\n')[1]?.trim() || 'unknown',
    })

    try {
      await authApi.post('/auth/logout')
      localStorage.removeItem('user')
      logAuthEvent('LOGOUT_SUCCESS', { apiCallSucceeded: true })
    } catch (error: any) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('user')
      logAuthEvent('LOGOUT_API_FAILED', {
        error: error?.message,
        status: error?.status,
        clearedLocalStorageAnyway: true,
      })
    }
  },

  /**
   * Get current authenticated user
   * Verifies token validity with backend
   *
   * IMPORTANT: Only returns null for explicit auth failures (401)
   * For other errors (500, network), returns cached user to prevent unnecessary logout
   */
  getCurrentUser: async (): Promise<User | null> => {
    logAuthEvent('GET_CURRENT_USER_START', { action: 'calling /auth/me' })

    try {
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

        // Only clear if this is NOT a transient issue
        logAuthEvent('CLEARING_AUTH_STATE', {
          reason: 'Too many failures or not recently authenticated',
          consecutive401Count,
          recentlyAuthenticated,
        })
        localStorage.removeItem('user')
        lastSuccessfulAuth = 0
        consecutive401Count = 0
        return null
      }

      // SUCCESS! Reset failure tracking
      lastSuccessfulAuth = Date.now()
      consecutive401Count = 0

      // Normalize user data to ensure firmId is set
      const user = normalizeUser(response.data.user)

      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(user))

      logAuthEvent('GET_CURRENT_USER_SUCCESS', {
        username: user.username,
        userId: user._id,
      })

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

        logAuthEvent('CLEARING_AUTH_STATE', { trigger: '401_exceeded_threshold' })
        localStorage.removeItem('user')
        lastSuccessfulAuth = 0
        consecutive401Count = 0
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

          logAuthEvent('CLEARING_AUTH_STATE', { trigger: '400_auth_error' })
          localStorage.removeItem('user')
          lastSuccessfulAuth = 0
          consecutive401Count = 0
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
  },

  /**
   * Get cached user from localStorage
   * Use this for initial load, then verify with getCurrentUser()
   */
  getCachedUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) return null
      return JSON.parse(userStr)
    } catch (error) {
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
   */
  sendOTP: async (data: SendOTPData): Promise<OTPResponse> => {
    try {
      const response = await authApi.post<{ success: boolean; message: string; expiresIn?: number }>(
        '/auth/send-otp',
        data
      )

      return {
        success: response.data.success,
        message: response.data.message,
        expiresIn: response.data.expiresIn
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Verify OTP code and login
   */
  verifyOTP: async (data: VerifyOTPData): Promise<User> => {
    try {
      const response = await authApi.post<AuthResponse>(
        '/auth/verify-otp',
        data
      )

      if (response.data.error || !response.data.user) {
        throw new Error(response.data.message || 'فشل التحقق من رمز OTP')
      }

      // Normalize user data to ensure firmId is set
      const user = normalizeUser(response.data.user)

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user))

      return user
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Resend OTP code
   */
  resendOTP: async (data: SendOTPData): Promise<OTPResponse> => {
    try {
      const response = await authApi.post<{ success: boolean; message: string; expiresIn?: number }>(
        '/auth/resend-otp',
        data
      )

      return {
        success: response.data.success,
        message: response.data.message,
        expiresIn: response.data.expiresIn
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
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
}

export default authService
/**
 * Authentication Store
 * Global state management for authentication using Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setUser as setSentryUser } from '@/lib/sentry'
import { Analytics, identifyUser, clearUser as clearAnalyticsUser } from '@/lib/analytics'
import authService, { User, LoginCredentials, isPlanAtLeast, getPlanLevel, hasFeature, PasswordBreachWarning, isOTPRequired, LoginOTPRequiredResponse } from '@/services/authService'
import { usePermissionsStore } from './permissions-store'

/**
 * Email verification state from backend
 * Returned in login response, /auth/me, and after email verification
 */
export interface EmailVerificationState {
  isVerified: boolean
  requiresVerification: boolean
  verificationSentAt?: string
  allowedFeatures: string[]
  blockedFeatures: string[]
}

interface AuthState {
  // State
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  passwordBreachWarning: PasswordBreachWarning | null

  // OTP Login State (for email-based 2FA after password verification)
  otpRequired: boolean
  otpData: LoginOTPRequiredResponse | null

  // Email Verification State (for feature-based blocking)
  emailVerification: EmailVerificationState | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
  clearPasswordBreachWarning: () => void
  clearOtpData: () => void
  setEmailVerification: (emailVerification: EmailVerificationState | null) => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial State - Start with unauthenticated state
      // Auth will be checked via checkAuth() on app load
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      passwordBreachWarning: null,

      // OTP Login State
      otpRequired: false,
      otpData: null,

      // Email Verification State
      emailVerification: null,

      /**
       * Login Action
       * Handles both direct login (SSO, One-Tap) and OTP-required flow (password login)
       *
       * RACE CONDITION FIX: We don't clear otpRequired/otpData at the start of login.
       * If a second login request is made while OTP verification is in progress,
       * we preserve the OTP state. This prevents the issue where:
       * 1. First login succeeds, sets otpRequired=true
       * 2. Navigation to OTP page starts (async)
       * 3. User clicks login again (or double-click)
       * 4. Second login clears otpRequired before navigation completes
       * 5. OTP page redirects back to sign-in because loginSessionToken is missing
       */
      login: async (credentials: LoginCredentials) => {
        console.log('[AUTH-STORE] Login called with credentials:', {
          username: credentials.username,
          hasPassword: !!credentials.password,
          hasCaptcha: !!credentials.captchaToken,
        })

        // SECURITY: If we already have valid OTP data, don't allow another login to interfere
        // User should complete OTP verification or navigate away first
        const currentState = useAuthStore.getState()
        console.log('[AUTH-STORE] Current state before login:', {
          otpRequired: currentState.otpRequired,
          hasOtpData: !!currentState.otpData,
          hasLoginSessionToken: !!currentState.otpData?.loginSessionToken,
          isLoading: currentState.isLoading,
        })

        if (currentState.otpRequired && currentState.otpData?.loginSessionToken) {
          console.warn('[AUTH-STORE] Login blocked - OTP verification already in progress')
          return
        }

        // Only clear error and loading state, preserve OTP data until we get a new response
        set({ isLoading: true, error: null, passwordBreachWarning: null })
        console.log('[AUTH-STORE] Set isLoading=true, calling authService.login...')

        try {
          const response = await authService.login(credentials)
          console.log('[AUTH-STORE] authService.login returned:', {
            responseType: typeof response,
            hasRequiresOtp: 'requiresOtp' in response,
            requiresOtpValue: (response as any).requiresOtp,
            hasOtpRequired: 'otpRequired' in response,
            otpRequiredValue: (response as any).otpRequired,
            hasUser: 'user' in response,
            hasLoginSessionToken: !!(response as any).loginSessionToken,
            isOTPRequiredCheck: isOTPRequired(response),
            allKeys: Object.keys(response),
          })

          // Check if OTP verification is required (email-based 2FA for password login)
          if (isOTPRequired(response)) {
            console.log('[AUTH-STORE] OTP IS REQUIRED! Setting otpRequired=true and otpData')
            // Password verified, but email OTP needed - store OTP data and let form handle redirect
            set({
              isLoading: false,
              otpRequired: true,
              otpData: response,
              // Don't set error - this is an expected flow, not an error
            })

            // Verify state was set
            const newState = useAuthStore.getState()
            console.log('[AUTH-STORE] State AFTER setting OTP data:', {
              otpRequired: newState.otpRequired,
              hasOtpData: !!newState.otpData,
              hasLoginSessionToken: !!newState.otpData?.loginSessionToken,
              fullEmail: newState.otpData?.fullEmail,
            })

            // Return early - form will redirect to OTP page
            console.log('[AUTH-STORE] Returning from login - form should now navigate to OTP page')
            return
          }

          console.log('[AUTH-STORE] OTP NOT required, proceeding with direct login')

          // Direct login success (SSO, One-Tap, or backend doesn't require OTP)
          const { user, warning } = response

          // Check if MFA verification is required
          // SECURITY FIX: Trust backend's mfaPending flag - don't override it
          // Previously, this incorrectly set mfaPending=true whenever mfaEnabled=true,
          // which broke login for users with MFA enabled who had already verified
          const mfaPending = user.mfaPending ?? false

          set({
            user: { ...user, mfaPending },
            isAuthenticated: !mfaPending, // Not fully authenticated until MFA verified
            isLoading: false,
            error: null,
            passwordBreachWarning: warning || null,
            otpRequired: false,
            otpData: null,
          })

          // Set Sentry user context
          setSentryUser({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            firmId: user.firmId,
          })

          // Track analytics
          Analytics.login(credentials.email ? 'email' : 'username')
          identifyUser(user._id, {
            role: user.role,
            firm_id: user.firmId,
            plan: user.plan || 'free',
          })

          // Handle permissions based on user type
          // PERFORMANCE FIX: Don't await permissions - fetch in parallel
          if (user.role === 'lawyer') {
            if (user.firmId) {
              // Firm member - fetch permissions from firm API (non-blocking)
              usePermissionsStore.getState().fetchPermissions().catch((err) => {
                // Don't fail login if permissions fetch fails, but log it
                if (import.meta.env.DEV) {
                  console.warn('[Auth] Non-blocking permissions fetch failed:', err)
                }
              })
            } else {
              // No firm = solo lawyer
              // Set permissions from login response if available, otherwise mark as solo
              usePermissionsStore.getState().setPermissionsFromLogin(user.permissions || null, true)
            }
          }
          // Clients don't need permissions
        } catch (error: any) {
          // Only clear OTP data on auth failures (wrong credentials), NOT on rate limits
          // This allows the OTP flow to continue even if a duplicate request gets 429
          const status = error?.status || error?.response?.status
          const isAuthFailure = status === 401 || status === 400

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'فشل تسجيل الدخول',
            // Clear OTP data only on auth failures (wrong password, etc.)
            // Preserve OTP data on rate limits (429) so user can still proceed to OTP page
            ...(isAuthFailure ? { otpRequired: false, otpData: null } : {}),
          })
          throw error
        }
      },

      /**
       * Logout Action
       */
      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
        } catch {
          // Ignore - authService.logout already clears state
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          otpRequired: false,
          otpData: null,
          emailVerification: null,
        })
        setSentryUser(null)
        usePermissionsStore.getState().clearPermissions()

        // Track analytics
        Analytics.logout()
        clearAnalyticsUser()
      },

      /**
       * Set User Action
       */
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: user !== null && !user?.mfaPending,
          error: null,
        })
      },

      /**
       * Clear Error Action
       */
      clearError: () => {
        set({ error: null })
      },

      /**
       * Clear Password Breach Warning
       * Call this after user has changed their password
       */
      clearPasswordBreachWarning: () => {
        set({ passwordBreachWarning: null })
        // Also clear the breach flags from the user object
        const currentUser = useAuthStore.getState().user
        if (currentUser && (currentUser.mustChangePassword || currentUser.passwordBreached)) {
          set({
            user: {
              ...currentUser,
              mustChangePassword: false,
              passwordBreached: false,
            },
          })
        }
      },

      /**
       * Clear OTP Data
       * Call this after successful OTP verification or when user navigates away
       */
      clearOtpData: () => {
        set({ otpRequired: false, otpData: null })
      },

      /**
       * Set Email Verification State
       * Call this after login, OTP verification, or email verification
       */
      setEmailVerification: (emailVerification: EmailVerificationState | null) => {
        set({ emailVerification })
      },

      /**
       * Check Authentication Status
       * Verifies with backend that token is still valid
       *
       * IMPORTANT: getCurrentUser now returns cached user on non-auth errors,
       * so we only clear auth state when user is explicitly null (401 from backend)
       */
      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const user = await authService.getCurrentUser()
          set({
            user,
            isAuthenticated: user !== null && !user?.mfaPending,
            isLoading: false,
            error: null,
          })

          // Set Sentry user context if user is authenticated
          if (user) {
            setSentryUser({
              id: user._id,
              username: user.username,
              email: user.email,
              role: user.role,
              firmId: user.firmId,
            })
          } else {
            setSentryUser(null)
          }

          // Handle permissions based on user type
          // PERFORMANCE FIX: Don't await permissions - fetch in parallel
          if (user && user.role === 'lawyer') {
            if (user.firmId) {
              // Firm member - fetch permissions from firm API (non-blocking)
              usePermissionsStore.getState().fetchPermissions().catch(() => {
                // Don't fail auth check if permissions fetch fails
              })
            } else {
              // No firm = solo lawyer
              usePermissionsStore.getState().setPermissionsFromLogin(user.permissions || null, true)
            }
          }
        } catch {
          // getCurrentUser shouldn't throw - but if it does, try cached user
          const cachedUser = authService.getCachedUser()
          if (cachedUser) {
            set({
              user: cachedUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
            setSentryUser(null)
            usePermissionsStore.getState().clearPermissions()
          }
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        // Only persist user data, not loading/error states
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

/**
 * Selectors for easy access to specific state
 */
export const selectUser = (state: AuthState) => state.user
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated
export const selectIsLoading = (state: AuthState) => state.isLoading
export const selectError = (state: AuthState) => state.error
export const selectUserRole = (state: AuthState) => state.user?.role

/**
 * Role-based selectors
 */
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin'
export const selectIsLawyer = (state: AuthState) =>
  state.user?.role === 'lawyer'
export const selectIsClient = (state: AuthState) =>
  state.user?.role === 'client'

/**
 * Firm-related selectors
 */
export const selectFirmId = (state: AuthState) => state.user?.firmId
export const selectFirmRole = (state: AuthState) => state.user?.firmRole
export const selectFirmStatus = (state: AuthState) => state.user?.firmStatus
export const selectIsDeparted = (state: AuthState) =>
  state.user?.firmRole === 'departed' || state.user?.firmStatus === 'departed'
export const selectIsFirmOwner = (state: AuthState) =>
  state.user?.firmRole === 'owner'
export const selectIsFirmAdmin = (state: AuthState) =>
  state.user?.firmRole === 'admin' || state.user?.firmRole === 'owner'

/**
 * Solo lawyer selectors
 */
export const selectIsSoloLawyer = (state: AuthState) =>
  state.user?.isSoloLawyer === true
export const selectLawyerWorkMode = (state: AuthState) =>
  state.user?.lawyerWorkMode

/**
 * Plan/Subscription selectors
 */
export const selectPlan = (state: AuthState) => state.user?.plan || 'free'
export const selectPlanExpiresAt = (state: AuthState) => state.user?.planExpiresAt
export const selectTrialEndsAt = (state: AuthState) => state.user?.trialEndsAt
export const selectMaxUsers = (state: AuthState) => state.user?.maxUsers
export const selectFeatures = (state: AuthState) => state.user?.features || []

/**
 * Plan comparison helper selectors
 * Check if user's plan meets or exceeds a required plan level
 */
export const selectIsPlanAtLeast = (requiredPlan: 'free' | 'starter' | 'professional' | 'enterprise') =>
  (state: AuthState) => isPlanAtLeast(state.user?.plan, requiredPlan)

export const selectPlanLevel = (state: AuthState) => getPlanLevel(state.user?.plan)

/**
 * Feature access selector
 * Check if user has access to a specific feature
 */
export const selectHasFeature = (featureName: string) =>
  (state: AuthState) => hasFeature(state.user, featureName)

/**
 * Email verification selectors
 */
export const selectIsEmailVerified = (state: AuthState) =>
  state.user?.isEmailVerified === true
export const selectEmailVerifiedAt = (state: AuthState) =>
  state.user?.emailVerifiedAt
export const selectEmailVerification = (state: AuthState) =>
  state.emailVerification

/**
 * Password breach selectors
 */
export const selectPasswordBreachWarning = (state: AuthState) =>
  state.passwordBreachWarning
export const selectMustChangePassword = (state: AuthState) =>
  state.user?.mustChangePassword === true || state.user?.passwordBreached === true
export const selectIsPasswordBreached = (state: AuthState) =>
  state.user?.passwordBreached === true

/**
 * OTP Login selectors
 * Used for email-based 2FA after password verification
 */
export const selectOtpRequired = (state: AuthState) => state.otpRequired
export const selectOtpData = (state: AuthState) => state.otpData
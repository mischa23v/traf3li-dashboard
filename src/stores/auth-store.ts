/**
 * Authentication Store
 * Global state management for authentication using Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setUser as setSentryUser } from '@/lib/sentry'
import { Analytics, identifyUser, clearUser as clearAnalyticsUser } from '@/lib/analytics'
import authService, { User, LoginCredentials, isPlanAtLeast, getPlanLevel, hasFeature } from '@/services/authService'
import { usePermissionsStore } from './permissions-store'

interface AuthState {
  // State
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
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

      /**
       * Login Action
       */
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.login(credentials)

          // Check if MFA verification is required
          // Backend may return mfaEnabled or mfaPending flag
          const mfaPending = user.mfaEnabled && !user.mfaPending ? true : user.mfaPending

          set({
            user: { ...user, mfaPending },
            isAuthenticated: !mfaPending, // Not fully authenticated until MFA verified
            isLoading: false,
            error: null,
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
              usePermissionsStore.getState().fetchPermissions().catch(() => {
                // Don't fail login if permissions fetch fails
              })
            } else {
              // No firm = solo lawyer
              // Set permissions from login response if available, otherwise mark as solo
              usePermissionsStore.getState().setPermissionsFromLogin(user.permissions || null, true)
            }
          }
          // Clients don't need permissions
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'فشل تسجيل الدخول',
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
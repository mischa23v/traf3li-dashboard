/**
 * Authentication Store
 * Global state management for authentication using Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authService, { User, LoginCredentials } from '@/services/authService'
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
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          // Fetch user permissions after successful login
          // Only fetch if user has a firm (lawyer/firm member)
          if (user.firmId || user.role === 'lawyer') {
            try {
              await usePermissionsStore.getState().fetchPermissions()
            } catch (permError) {
              console.warn('Could not fetch permissions:', permError)
              // Don't fail login if permissions fetch fails
            }
          }
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
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          // Clear permissions on logout
          usePermissionsStore.getState().clearPermissions()
        } catch (error: any) {
          console.error('Logout error:', error)
          // Even if API fails, clear state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
          // Also clear permissions
          usePermissionsStore.getState().clearPermissions()
        }
      },

      /**
       * Set User Action
       */
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: user !== null,
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
       */
      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const user = await authService.getCurrentUser()
          set({
            user,
            isAuthenticated: user !== null,
            isLoading: false,
            error: null,
          })

          // Fetch permissions if user is authenticated and has a firm
          if (user && (user.firmId || user.role === 'lawyer')) {
            try {
              await usePermissionsStore.getState().fetchPermissions()
            } catch (permError) {
              console.warn('Could not fetch permissions:', permError)
              // Don't fail auth check if permissions fetch fails
            }
          }
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null, // Don't show error on initial auth check
          })
          // Clear permissions if auth failed
          usePermissionsStore.getState().clearPermissions()
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
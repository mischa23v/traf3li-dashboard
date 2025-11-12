/**
 * Authentication Store
 * Global state management for authentication using Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authService, { User, LoginCredentials } from '@/services/authService'

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
      // Initial State
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
        } catch (error: any) {
          console.error('Logout error:', error)
          // Even if API fails, clear state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
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
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null, // Don't show error on initial auth check
          })
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
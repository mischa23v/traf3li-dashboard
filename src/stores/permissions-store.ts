/**
 * Permissions Store
 * Global state management for user permissions using Zustand
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserPermissions, ModuleKey, PermissionLevel, SpecialPermissionKey } from '@/types/rbac'
import { PERMISSION_LEVELS } from '@/types/rbac'
import firmService from '@/services/firmService'

interface PermissionsState {
  // State
  permissions: UserPermissions | null
  isLoading: boolean
  error: string | null
  lastFetched: number | null
  noFirmAssociated: boolean // Track if user has no firm associated

  // Actions
  fetchPermissions: () => Promise<void>
  clearPermissions: () => void
  setPermissions: (permissions: UserPermissions | null) => void

  // Permission Checks (for convenience)
  hasPermission: (module: ModuleKey, level?: PermissionLevel) => boolean
  canView: (module: ModuleKey) => boolean
  canEdit: (module: ModuleKey) => boolean
  canDelete: (module: ModuleKey) => boolean
  hasSpecialPermission: (permission: SpecialPermissionKey) => boolean
  isDeparted: () => boolean
  isAdminOrOwner: () => boolean
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      // Initial State
      permissions: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      noFirmAssociated: false,

      /**
       * Fetch permissions from API
       */
      fetchPermissions: async () => {
        const state = get()

        // Check if we have cached permissions that are still valid
        if (
          state.permissions &&
          state.lastFetched &&
          Date.now() - state.lastFetched < CACHE_DURATION
        ) {
          return
        }

        set({ isLoading: true, error: null, noFirmAssociated: false })
        try {
          const permissions = await firmService.getMyPermissions()
          set({
            permissions,
            isLoading: false,
            error: null,
            lastFetched: Date.now(),
            noFirmAssociated: false,
          })
        } catch (error: any) {
          console.error('Fetch permissions error:', error)
          // Check if error indicates no firm associated (404 with specific message)
          const isNoFirmError =
            error.message?.includes('لا يوجد مكتب') ||
            error.message?.includes('no firm') ||
            error.message?.toLowerCase().includes('not found')

          set({
            permissions: null,
            isLoading: false,
            error: isNoFirmError ? null : (error.message || 'فشل في جلب الصلاحيات'),
            lastFetched: null,
            noFirmAssociated: isNoFirmError,
          })
        }
      },

      /**
       * Clear permissions (on logout)
       */
      clearPermissions: () => {
        set({
          permissions: null,
          isLoading: false,
          error: null,
          lastFetched: null,
          noFirmAssociated: false,
        })
      },

      /**
       * Set permissions directly
       */
      setPermissions: (permissions: UserPermissions | null) => {
        set({
          permissions,
          lastFetched: permissions ? Date.now() : null,
        })
      },

      /**
       * Check if user has at least the specified permission level for a module
       */
      hasPermission: (module: ModuleKey, level: PermissionLevel = 'view') => {
        const { permissions } = get()
        if (!permissions) return false

        const userLevel = permissions.modules[module] || 'none'
        return PERMISSION_LEVELS[userLevel] >= PERMISSION_LEVELS[level]
      },

      /**
       * Check if user can view a module
       */
      canView: (module: ModuleKey) => {
        return get().hasPermission(module, 'view')
      },

      /**
       * Check if user can edit in a module
       */
      canEdit: (module: ModuleKey) => {
        return get().hasPermission(module, 'edit')
      },

      /**
       * Check if user can delete in a module
       */
      canDelete: (module: ModuleKey) => {
        return get().hasPermission(module, 'full')
      },

      /**
       * Check if user has a special permission
       */
      hasSpecialPermission: (permission: SpecialPermissionKey) => {
        const { permissions } = get()
        if (!permissions) return false
        return permissions.special?.[permission] === true
      },

      /**
       * Check if user is departed
       */
      isDeparted: () => {
        const { permissions } = get()
        if (!permissions) return false
        return permissions.isDeparted || permissions.role === 'departed'
      },

      /**
       * Check if user is admin or owner
       */
      isAdminOrOwner: () => {
        const { permissions } = get()
        if (!permissions) return false
        return permissions.role === 'owner' || permissions.role === 'admin'
      },
    }),
    {
      name: 'permissions-storage',
      partialize: (state) => ({
        // Only persist permissions, lastFetched, and noFirmAssociated
        permissions: state.permissions,
        lastFetched: state.lastFetched,
        noFirmAssociated: state.noFirmAssociated,
      }),
    }
  )
)

/**
 * Selectors for easy access to specific state
 */
export const selectPermissions = (state: PermissionsState) => state.permissions
export const selectIsLoading = (state: PermissionsState) => state.isLoading
export const selectError = (state: PermissionsState) => state.error
export const selectIsDeparted = (state: PermissionsState) => state.isDeparted()
export const selectIsAdminOrOwner = (state: PermissionsState) => state.isAdminOrOwner()
export const selectNoFirmAssociated = (state: PermissionsState) => state.noFirmAssociated

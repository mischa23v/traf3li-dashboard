/**
 * UI Access Control Service
 * API functions for sidebar visibility and page access control
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  SidebarItem,
  PageAccessRule,
  PageAccessResult,
  UIAccessConfig,
  UIAccessSettings,
  AccessMatrix,
  UserOverride,
  SidebarOverride,
  PageOverride,
} from '@/types/uiAccess'

const uiAccessService = {
  // ═══════════════════════════════════════════════════════════════
  // SIDEBAR APIs
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get visible sidebar items for current user
   * Called on app load to build navigation
   */
  getVisibleSidebar: async (): Promise<SidebarItem[]> => {
    try {
      const response = await apiClient.get('/permissions/ui/sidebar')
      return response.data.data?.items || response.data.items || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all sidebar items (admin only)
   */
  getAllSidebarItems: async (): Promise<SidebarItem[]> => {
    try {
      const response = await apiClient.get('/permissions/ui/sidebar/all')
      return response.data.data?.items || response.data.items || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update sidebar visibility for a role
   */
  updateSidebarVisibility: async (
    itemId: string,
    role: string,
    visible: boolean
  ): Promise<void> => {
    try {
      await apiClient.put(`/permissions/ui/sidebar/${itemId}/visibility`, { role, visible })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // PAGE ACCESS APIs
  // ═══════════════════════════════════════════════════════════════

  /**
   * Check if current user has access to a page
   * Called on route navigation
   */
  checkPageAccess: async (routePath: string): Promise<PageAccessResult> => {
    try {
      const response = await apiClient.post('/permissions/ui/check-page', { path: routePath })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all page access rules (admin only)
   */
  getAllPageAccess: async (): Promise<PageAccessRule[]> => {
    try {
      const response = await apiClient.get('/permissions/ui/pages/all')
      return response.data.data?.pages || response.data.pages || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update page access for a role
   */
  updatePageAccess: async (
    pageId: string,
    role: string,
    hasAccess: boolean
  ): Promise<void> => {
    try {
      await apiClient.put(`/permissions/ui/pages/${pageId}/access`, { role, allowed: hasAccess })
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // CONFIG & MATRIX APIs
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get full UI access configuration (admin only)
   */
  getUIAccessConfig: async (): Promise<UIAccessConfig> => {
    try {
      const response = await apiClient.get('/permissions/ui/config')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update UI access settings
   */
  updateUIAccessConfig: async (
    settings: Partial<UIAccessSettings>
  ): Promise<UIAccessConfig> => {
    try {
      const response = await apiClient.put('/permissions/ui/config', { settings })
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get access matrix for all roles (admin only)
   */
  getAccessMatrix: async (): Promise<AccessMatrix> => {
    try {
      const response = await apiClient.get('/permissions/ui/matrix')
      return response.data.data || response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Bulk update role access
   */
  bulkUpdateRoleAccess: async (
    role: string,
    updates: {
      sidebar?: Record<string, boolean>
      sidebarItems?: Record<string, boolean>
      pages?: Record<string, boolean>
      pageAccess?: Record<string, boolean>
    }
  ): Promise<void> => {
    try {
      await apiClient.put(`/permissions/ui/roles/${role}/bulk`, updates)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // USER OVERRIDE APIs
  // ═══════════════════════════════════════════════════════════════

  /**
   * Add user-specific override
   */
  addUserOverride: async (override: {
    userId: string
    showSidebarItems?: string[]
    hideSidebarItems?: string[]
    grantPageAccess?: string[]
    denyPageAccess?: string[]
    sidebarOverrides?: SidebarOverride[]
    pageOverrides?: PageOverride[]
    reason?: string
    expiresAt?: string
  }): Promise<void> => {
    try {
      await apiClient.post('/permissions/ui/overrides', override)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Remove user-specific override
   */
  removeUserOverride: async (userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/permissions/ui/overrides/${userId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get user overrides
   */
  getUserOverrides: async (): Promise<UserOverride[]> => {
    try {
      const response = await apiClient.get('/permissions/ui/overrides')
      return response.data.data?.overrides || response.data.overrides || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default uiAccessService

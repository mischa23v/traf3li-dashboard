/**
 * UI Access Control Hooks
 * React Query hooks for sidebar visibility and page access control
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import uiAccessService from '@/services/uiAccessService'
import apiClient from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { CACHE_TIMES } from '@/config/cache'
import type {
  SidebarItem,
  PageAccessRule,
  PageAccessResult,
  UIAccessConfig,
  UIAccessSettings,
  AccessMatrix,
  SidebarOverride,
  PageOverride,
} from '@/types/uiAccess'

// ═══════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════

export const uiAccessKeys = {
  all: ['ui-access'] as const,
  sidebar: () => [...uiAccessKeys.all, 'sidebar'] as const,
  visibleSidebar: () => [...uiAccessKeys.sidebar(), 'visible'] as const,
  allSidebarItems: () => [...uiAccessKeys.sidebar(), 'all'] as const,
  pages: () => [...uiAccessKeys.all, 'pages'] as const,
  pageAccess: (path: string) => [...uiAccessKeys.pages(), 'check', path] as const,
  allPageAccess: () => [...uiAccessKeys.pages(), 'all'] as const,
  config: () => [...uiAccessKeys.all, 'config'] as const,
  matrix: () => [...uiAccessKeys.all, 'matrix'] as const,
  overrides: () => [...uiAccessKeys.all, 'overrides'] as const,
}

// ═══════════════════════════════════════════════════════════════
// SIDEBAR HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get visible sidebar items for current user
 */
export const useVisibleSidebar = () => {
  return useQuery({
    queryKey: uiAccessKeys.visibleSidebar(),
    queryFn: uiAccessService.getVisibleSidebar,
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.GC_MEDIUM,
  })
}

/**
 * Get all sidebar items (admin only)
 */
export const useAllSidebarItems = () => {
  return useQuery({
    queryKey: uiAccessKeys.allSidebarItems(),
    queryFn: uiAccessService.getAllSidebarItems,
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Update sidebar visibility for a role
 */
export const useUpdateSidebarVisibility = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, role, visible }: { itemId: string; role: string; visible: boolean }) =>
      uiAccessService.updateSidebarVisibility(itemId, role, visible),
    onSuccess: () => {
      toast.success('تم تحديث إظهار القائمة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث إظهار القائمة')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: uiAccessKeys.sidebar() })
      queryClient.invalidateQueries({ queryKey: uiAccessKeys.matrix() })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// PAGE ACCESS HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Check if current user can access a page
 */
export const usePageAccess = (routePath: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: uiAccessKeys.pageAccess(routePath),
    queryFn: () => uiAccessService.checkPageAccess(routePath),
    enabled: options?.enabled !== false && !!routePath,
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get all page access rules (admin only)
 */
export const useAllPageAccess = () => {
  return useQuery({
    queryKey: uiAccessKeys.allPageAccess(),
    queryFn: uiAccessService.getAllPageAccess,
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Update page access for a role
 */
export const useUpdatePageAccess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pageId, role, hasAccess }: { pageId: string; role: string; hasAccess: boolean }) =>
      uiAccessService.updatePageAccess(pageId, role, hasAccess),
    onSuccess: () => {
      toast.success('تم تحديث صلاحية الصفحة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث صلاحية الصفحة')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: uiAccessKeys.pages() })
      queryClient.invalidateQueries({ queryKey: uiAccessKeys.matrix() })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// CONFIG & MATRIX HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get UI access configuration (admin only)
 */
export const useUIAccessConfig = () => {
  return useQuery({
    queryKey: uiAccessKeys.config(),
    queryFn: uiAccessService.getUIAccessConfig,
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Update UI access settings
 */
export const useUpdateUIAccessConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Partial<UIAccessSettings>) =>
      uiAccessService.updateUIAccessConfig(settings),
    onSuccess: () => {
      toast.success('تم تحديث إعدادات الوصول بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث إعدادات الوصول')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: uiAccessKeys.config() })
    },
  })
}

/**
 * Get access matrix for all roles (admin only)
 */
export const useAccessMatrix = () => {
  return useQuery({
    queryKey: uiAccessKeys.matrix(),
    queryFn: uiAccessService.getAccessMatrix,
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Bulk update role access
 */
export const useBulkUpdateRoleAccess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      role,
      updates,
    }: {
      role: string
      updates: {
        sidebar?: Record<string, boolean>
        sidebarItems?: Record<string, boolean>
        pages?: Record<string, boolean>
        pageAccess?: Record<string, boolean>
      }
    }) => uiAccessService.bulkUpdateRoleAccess(role, updates),
    onSuccess: () => {
      toast.success('تم تحديث صلاحيات الدور بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث صلاحيات الدور')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: uiAccessKeys.all })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// USER OVERRIDE HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Add user-specific override
 */
export const useAddUserOverride = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (override: {
      userId: string
      showSidebarItems?: string[]
      hideSidebarItems?: string[]
      grantPageAccess?: string[]
      denyPageAccess?: string[]
      sidebarOverrides?: SidebarOverride[]
      pageOverrides?: PageOverride[]
      reason?: string
      expiresAt?: string
    }) => uiAccessService.addUserOverride(override),
    onSuccess: () => {
      toast.success('تم إضافة استثناء المستخدم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة استثناء المستخدم')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: uiAccessKeys.config() })
      queryClient.invalidateQueries({ queryKey: uiAccessKeys.overrides() })
    },
  })
}

/**
 * Remove user-specific override
 */
export const useRemoveUserOverride = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => uiAccessService.removeUserOverride(userId),
    onSuccess: () => {
      toast.success('تم حذف استثناء المستخدم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف استثناء المستخدم')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: uiAccessKeys.config() })
      queryClient.invalidateQueries({ queryKey: uiAccessKeys.overrides() })
    },
  })
}

// ==================== AGGREGATED ADMIN DASHBOARD ====================
// Single API call for admin features - replaces 4 separate calls

export interface AdminDashboardData {
  accessMatrix: any
  sidebarItems: any[]
  pageAccess: any[]
  uiAccessConfig: any
}

export const useAdminDashboardData = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return useQuery<AdminDashboardData>({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/dashboard')
      return response.data
    },
    staleTime: CACHE_TIMES.SHORT,
    gcTime: CACHE_TIMES.GC_SHORT,
    enabled: isAuthenticated,
    retry: false,
  })
}

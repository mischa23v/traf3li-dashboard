/**
 * Sidebar Service
 * Handles sidebar configuration API calls
 *
 * API Endpoints:
 * - GET  /sidebar/config                    - Get sidebar config for current user
 * - GET  /sidebar/config/:firmType          - Preview config for specific firm type
 * - GET  /sidebar/recommend                 - Get recommended firm type
 * - GET  /sidebar/module/:moduleId/available - Check module availability
 * - PATCH /sidebar/firm-type                - Update firm type (owner/admin only)
 */

import apiClient from '@/lib/api'
import { ROUTES } from '@/constants/routes'
import type { SidebarConfig, SidebarConfigResponse, FirmType } from '@/types/sidebar'

// 
// ERROR MESSAGES (Bilingual)
// 

const ERROR_MESSAGES = {
  FETCH_CONFIG_FAILED: {
    en: 'Failed to load sidebar configuration.',
    ar: 'فشل في تحميل إعدادات الشريط الجانبي.',
  },
  FETCH_RECOMMEND_FAILED: {
    en: 'Failed to get recommended firm type.',
    ar: 'فشل في الحصول على نوع المكتب الموصى به.',
  },
  UPDATE_FIRM_TYPE_FAILED: {
    en: 'Failed to update firm type.',
    ar: 'فشل في تحديث نوع المكتب.',
  },
  MODULE_CHECK_FAILED: {
    en: 'Failed to check module availability.',
    ar: 'فشل في التحقق من توفر الوحدة.',
  },
  NETWORK_ERROR: {
    en: 'Network error. Please check your connection.',
    ar: 'خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.',
  },
  UNAUTHORIZED: {
    en: 'Session expired. Please log in again.',
    ar: 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.',
  },
} as const

/**
 * Format bilingual error message
 */
const formatBilingualError = (
  errorType: keyof typeof ERROR_MESSAGES,
  details?: string
): string => {
  const { en, ar } = ERROR_MESSAGES[errorType]
  return details ? `${en} | ${ar}\n${details}` : `${en} | ${ar}`
}

// 
// API FUNCTIONS
// 

/**
 * Get sidebar configuration for the current user
 * Returns config based on user's firm type and permissions
 *
 * @returns SidebarConfig or null on error
 */
export async function getSidebarConfig(): Promise<SidebarConfig | null> {
  try {
    const response = await apiClient.get<SidebarConfigResponse>(ROUTES.api.sidebar.config)

    if (response.data?.success && response.data?.data) {
      return response.data.data
    }

    // Handle unexpected response format
    if (import.meta.env.DEV) {
      console.warn('[SidebarService] Unexpected response format:', response.data)
    }
    return null
  } catch (error: unknown) {
    // Don't throw - return null to trigger fallback
    // This allows the hook to use placeholderData gracefully
    if (import.meta.env.DEV) {
      console.warn('[SidebarService] getSidebarConfig failed:', error)
    }
    return null
  }
}

/**
 * Get sidebar configuration preview for a specific firm type
 * Used for admin preview or onboarding wizard
 *
 * @param firmType - The firm type to preview
 * @returns SidebarConfig or null on error
 */
export async function getSidebarConfigPreview(
  firmType: FirmType
): Promise<SidebarConfig | null> {
  try {
    const response = await apiClient.get<SidebarConfigResponse>(
      ROUTES.api.sidebar.configPreview(firmType)
    )

    if (response.data?.success && response.data?.data) {
      return response.data.data
    }

    return null
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.warn('[SidebarService] getSidebarConfigPreview failed:', error)
    }
    return null
  }
}

/**
 * Get recommended firm type based on employee count
 * Used during onboarding or firm settings
 *
 * @returns Recommended FirmType or null on error
 */
export async function getRecommendedFirmType(): Promise<FirmType | null> {
  try {
    const response = await apiClient.get<{
      success: boolean
      data: { recommendedType: FirmType; employeeCount: number }
    }>(ROUTES.api.sidebar.recommend)

    if (response.data?.success && response.data?.data?.recommendedType) {
      return response.data.data.recommendedType
    }

    return null
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.warn('[SidebarService] getRecommendedFirmType failed:', error)
    }
    return null
  }
}

/**
 * Check if a specific module is available for the current user
 *
 * @param moduleId - The module ID to check
 * @returns boolean indicating availability, or null on error
 */
export async function checkModuleAvailability(
  moduleId: string
): Promise<boolean | null> {
  try {
    const response = await apiClient.get<{
      success: boolean
      data: { available: boolean; reason?: string }
    }>(ROUTES.api.sidebar.moduleAvailable(moduleId))

    if (response.data?.success) {
      return response.data.data?.available ?? false
    }

    return null
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.warn('[SidebarService] checkModuleAvailability failed:', error)
    }
    return null
  }
}

/**
 * Update the firm type (owner/admin only)
 * Used in firm settings to change sidebar tier
 *
 * @param firmType - The new firm type
 * @throws Error with bilingual message on failure
 */
export async function updateFirmType(firmType: FirmType): Promise<void> {
  try {
    const response = await apiClient.patch<{ success: boolean; message?: string }>(
      ROUTES.api.sidebar.updateFirmType,
      { firmType }
    )

    if (!response.data?.success) {
      throw new Error(
        formatBilingualError('UPDATE_FIRM_TYPE_FAILED', response.data?.message)
      )
    }
  } catch (error: unknown) {
    // Re-throw with bilingual message for mutations
    // Mutations should show error to user, unlike queries
    if (error instanceof Error && error.message.includes('|')) {
      throw error // Already formatted
    }

    const isNetworkError =
      error instanceof Error &&
      (error.message.includes('Network') || error.message.includes('fetch'))

    throw new Error(
      formatBilingualError(
        isNetworkError ? 'NETWORK_ERROR' : 'UPDATE_FIRM_TYPE_FAILED'
      )
    )
  }
}

// 
// SERVICE EXPORT
// 

const sidebarService = {
  getSidebarConfig,
  getSidebarConfigPreview,
  getRecommendedFirmType,
  checkModuleAvailability,
  updateFirmType,
}

export default sidebarService

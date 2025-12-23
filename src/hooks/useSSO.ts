/**
 * SSO Hooks
 * React Query hooks for SSO operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import ssoService, {
  SSOSettings,
  SaveProviderRequest,
  TestConnectionRequest,
} from '@/services/ssoService'
import { isValidOAuthUrl } from '@/utils/redirectValidation'

// ==================== QUERY KEYS ====================

export const ssoKeys = {
  all: ['sso'] as const,
  settings: () => [...ssoKeys.all, 'settings'] as const,
  availableProviders: () => [...ssoKeys.all, 'available-providers'] as const,
  provider: (id: string) => [...ssoKeys.all, 'provider', id] as const,
  enabledProviders: () => [...ssoKeys.all, 'enabled-providers'] as const,
}

// ==================== SSO SETTINGS HOOKS ====================

/**
 * Hook to get SSO settings
 */
export const useSSOSettings = () => {
  return useQuery({
    queryKey: ssoKeys.settings(),
    queryFn: () => ssoService.getSSOSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to update SSO settings
 */
export const useUpdateSSOSettings = () => {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMutation({
    mutationFn: (data: Partial<SSOSettings>) => ssoService.updateSSOSettings(data),
    onSuccess: () => {
      toast.success(isRTL ? 'تم تحديث إعدادات SSO بنجاح' : 'SSO settings updated successfully')
      queryClient.invalidateQueries({ queryKey: ssoKeys.settings() })
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل تحديث إعدادات SSO' : 'Failed to update SSO settings'))
    },
  })
}

// ==================== PROVIDER HOOKS ====================

/**
 * Hook to get available SSO providers
 */
export const useAvailableProviders = () => {
  return useQuery({
    queryKey: ssoKeys.availableProviders(),
    queryFn: () => ssoService.getAvailableProviders(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to get a specific SSO provider
 */
export const useSSOProvider = (providerId: string, enabled = true) => {
  return useQuery({
    queryKey: ssoKeys.provider(providerId),
    queryFn: () => ssoService.getSSOProvider(providerId),
    enabled: enabled && !!providerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get enabled SSO providers for login
 */
export const useEnabledSSOProviders = () => {
  return useQuery({
    queryKey: ssoKeys.enabledProviders(),
    queryFn: () => ssoService.getEnabledSSOProviders(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  })
}

/**
 * Hook to create SSO provider
 */
export const useCreateSSOProvider = () => {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMutation({
    mutationFn: (data: SaveProviderRequest) => ssoService.createSSOProvider(data),
    onSuccess: () => {
      toast.success(isRTL ? 'تمت إضافة مزود SSO بنجاح' : 'SSO provider added successfully')
      queryClient.invalidateQueries({ queryKey: ssoKeys.settings() })
      queryClient.invalidateQueries({ queryKey: ssoKeys.enabledProviders() })
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشلت إضافة مزود SSO' : 'Failed to add SSO provider'))
    },
  })
}

/**
 * Hook to update SSO provider
 */
export const useUpdateSSOProvider = () => {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMutation({
    mutationFn: ({ providerId, data }: { providerId: string; data: Partial<SaveProviderRequest> }) =>
      ssoService.updateSSOProvider(providerId, data),
    onSuccess: (_, variables) => {
      toast.success(isRTL ? 'تم تحديث مزود SSO بنجاح' : 'SSO provider updated successfully')
      queryClient.invalidateQueries({ queryKey: ssoKeys.settings() })
      queryClient.invalidateQueries({ queryKey: ssoKeys.provider(variables.providerId) })
      queryClient.invalidateQueries({ queryKey: ssoKeys.enabledProviders() })
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل تحديث مزود SSO' : 'Failed to update SSO provider'))
    },
  })
}

/**
 * Hook to delete SSO provider
 */
export const useDeleteSSOProvider = () => {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMutation({
    mutationFn: (providerId: string) => ssoService.deleteSSOProvider(providerId),
    onSuccess: () => {
      toast.success(isRTL ? 'تم حذف مزود SSO بنجاح' : 'SSO provider deleted successfully')
      queryClient.invalidateQueries({ queryKey: ssoKeys.settings() })
      queryClient.invalidateQueries({ queryKey: ssoKeys.enabledProviders() })
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل حذف مزود SSO' : 'Failed to delete SSO provider'))
    },
  })
}

/**
 * Hook to test SSO connection
 */
export const useTestSSOConnection = () => {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMutation({
    mutationFn: (data: TestConnectionRequest) => ssoService.testSSOConnection(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(isRTL ? response.messageAr : response.message)
      } else {
        toast.error(isRTL ? response.messageAr : response.message)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل اختبار الاتصال' : 'Failed to test connection'))
    },
  })
}

/**
 * Hook to initiate SSO login
 */
export const useInitiateSSOLogin = () => {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMutation({
    mutationFn: (provider: 'google' | 'microsoft' | 'custom') => ssoService.initiateSSOLogin(provider),
    onSuccess: (response) => {
      // Validate authorization URL to prevent open redirect attacks
      if (!isValidOAuthUrl(response.authorizationUrl)) {
        toast.error(isRTL ? 'عنوان URL غير صالح للمصادقة' : 'Invalid OAuth authorization URL')
        console.error('[SSO] Invalid authorization URL:', response.authorizationUrl)
        return
      }
      // Redirect to SSO provider's authorization URL
      window.location.href = response.authorizationUrl
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل بدء تسجيل الدخول' : 'Failed to initiate login'))
    },
  })
}

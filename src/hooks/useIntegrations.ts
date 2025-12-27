import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config/cache'
import integrationsService, {
  Integration,
  IntegrationCategory,
  ConnectIntegrationData,
  IntegrationSettings,
} from '@/services/integrationsService'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { invalidateCache } from '@/lib/cache-invalidation'

/**
 * Helper to extract bilingual error message from error object
 */
const getBilingualErrorMessage = (error: any, i18nLanguage: string): string => {
  // Check if error has bilingual properties
  if (error?.messageEn && error?.messageAr) {
    return i18nLanguage === 'ar' ? error.messageAr : error.messageEn
  }

  // Check if error message contains both languages (format: "English | Arabic")
  if (error?.message && typeof error.message === 'string' && error.message.includes(' | ')) {
    const [en, ar] = error.message.split(' | ')
    return i18nLanguage === 'ar' ? ar : en
  }

  // Fallback to error message or generic message
  return error?.message || error?.toString() || (
    i18nLanguage === 'ar'
      ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
      : 'An unexpected error occurred. Please try again.'
  )
}

/**
 * Hook to fetch all integrations
 */
export const useIntegrations = () => {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => integrationsService.getIntegrations(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

/**
 * Hook to fetch integrations by category
 */
export const useIntegrationsByCategory = (category: IntegrationCategory) => {
  return useQuery({
    queryKey: ['integrations', 'category', category],
    queryFn: () => integrationsService.getIntegrationsByCategory(category),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

/**
 * Hook to fetch a single integration
 */
export const useIntegration = (id: string) => {
  return useQuery({
    queryKey: ['integrations', id],
    queryFn: () => integrationsService.getIntegration(id),
    enabled: !!id,
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

/**
 * Hook to fetch integration status
 */
export const useIntegrationStatus = (id: string) => {
  return useQuery({
    queryKey: ['integrations', id, 'status'],
    queryFn: () => integrationsService.getIntegrationStatus(id),
    enabled: !!id,
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

/**
 * Hook to connect an integration
 */
export const useConnectIntegration = () => {
  const { t, i18n } = useTranslation()

  return useMutation({
    mutationFn: (data: ConnectIntegrationData) => integrationsService.connectIntegration(data),
    onSuccess: () => {
      toast.success(t('integrations.connectSuccess'))
    },
    onError: (error: any) => {
      const errorMessage = getBilingualErrorMessage(error, i18n.language)
      toast.error(errorMessage)
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await invalidateCache.integrations.all()
    },
  })
}

/**
 * Hook to disconnect an integration
 */
export const useDisconnectIntegration = () => {
  const { t, i18n } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => integrationsService.disconnectIntegration(id),
    onSuccess: () => {
      toast.success(t('integrations.disconnectSuccess'))
    },
    onError: (error: any) => {
      const errorMessage = getBilingualErrorMessage(error, i18n.language)
      toast.error(errorMessage)
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await invalidateCache.integrations.all()
    },
  })
}

/**
 * Hook to update integration settings
 */
export const useUpdateIntegrationSettings = () => {
  const { t, i18n } = useTranslation()

  return useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: Partial<IntegrationSettings> }) =>
      integrationsService.updateIntegrationSettings(id, settings),
    onSuccess: () => {
      toast.success(t('integrations.updateSuccess'))
    },
    onError: (error: any) => {
      const errorMessage = getBilingualErrorMessage(error, i18n.language)
      toast.error(errorMessage)
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await invalidateCache.integrations.all()
    },
  })
}

/**
 * Hook to test integration connection
 */
export const useTestIntegration = () => {
  const { t, i18n } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => integrationsService.testIntegration(id),
    onSuccess: (success) => {
      if (success) {
        toast.success(t('integrations.testSuccess'))
      } else {
        toast.error(t('integrations.testError'))
      }
    },
    onError: (error: any) => {
      const errorMessage = getBilingualErrorMessage(error, i18n.language)
      toast.error(errorMessage)
    },
  })
}

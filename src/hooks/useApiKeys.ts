import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config/cache'
import apiKeysService, {
  CreateApiKeyRequest,
} from '@/services/apiKeysService'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { invalidateCache } from '@/lib/cache-invalidation'

/**
 * Hook to fetch all API keys for the current user
 */
export const useApiKeys = () => {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysService.getUserApiKeys(),
    staleTime: CACHE_TIMES.SHORT, // 2 minutes
  })
}

/**
 * Hook to fetch API key statistics
 */
export const useApiKeyStats = () => {
  return useQuery({
    queryKey: ['api-keys', 'stats'],
    queryFn: () => apiKeysService.getApiKeyStats(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

/**
 * Hook to create a new API key
 */
export const useCreateApiKey = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) => apiKeysService.createApiKey(data),
    onSuccess: () => {
      toast.success(t('apiKeys.createSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('apiKeys.createError'))
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await invalidateCache.apiKeys.all()
    },
  })
}

/**
 * Hook to revoke an API key
 */
export const useRevokeApiKey = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (keyId: string) => apiKeysService.revokeApiKey(keyId),
    onSuccess: () => {
      toast.success(t('apiKeys.revokeSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('apiKeys.revokeError'))
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await invalidateCache.apiKeys.all()
    },
  })
}

/**
 * Hook to update API key metadata
 *
 * @deprecated [BACKEND-PENDING] This endpoint is scheduled for removal in Q2 2025.
 * The backend API endpoint /api-keys/:id (PATCH) will be removed.
 *
 * Migration Plan:
 * - Delete old API key and create a new one with updated settings
 * - Use useRevokeApiKey() + useCreateApiKey() instead
 *
 * Current Status: Not used in any components (safe to remove after migration period)
 */
export const useUpdateApiKey = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ keyId, data }: { keyId: string; data: { name?: string; description?: string } }) => {
      // [BACKEND-PENDING] Show deprecation warning to users
      console.warn(
        '⚠️ DEPRECATED FEATURE: Updating API keys will be removed in Q2 2025. ' +
        'Please delete and recreate the API key instead.\n' +
        'تحذير: تحديث مفاتيح API سيتم إزالته في الربع الثاني من 2025. ' +
        'يرجى حذف وإعادة إنشاء مفتاح API بدلاً من ذلك.'
      )

      // Show user-facing toast warning
      toast.warning(
        t('apiKeys.deprecationWarning') ||
        'This feature will be removed soon. Please delete and recreate your API key instead. | ' +
        'ستتم إزالة هذه الميزة قريباً. يرجى حذف وإعادة إنشاء مفتاح API الخاص بك.',
        { duration: 8000 }
      )

      return apiKeysService.updateApiKey(keyId, data)
    },
    onSuccess: () => {
      toast.success(t('apiKeys.updateSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('apiKeys.updateError'))
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await invalidateCache.apiKeys.all()
    },
  })
}

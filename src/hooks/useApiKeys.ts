import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiKeysService, {
  CreateApiKeyRequest,
} from '@/services/apiKeysService'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

/**
 * Hook to fetch all API keys for the current user
 */
export const useApiKeys = () => {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysService.getUserApiKeys(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch API key statistics
 */
export const useApiKeyStats = () => {
  return useQuery({
    queryKey: ['api-keys', 'stats'],
    queryFn: () => apiKeysService.getApiKeyStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to create a new API key
 */
export const useCreateApiKey = () => {
  const queryClient = useQueryClient()
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
      await queryClient.invalidateQueries({ queryKey: ['api-keys'], refetchType: 'all' })
    },
  })
}

/**
 * Hook to revoke an API key
 */
export const useRevokeApiKey = () => {
  const queryClient = useQueryClient()
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
      await queryClient.invalidateQueries({ queryKey: ['api-keys'], refetchType: 'all' })
    },
  })
}

/**
 * Hook to update API key metadata
 */
export const useUpdateApiKey = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ keyId, data }: { keyId: string; data: { name?: string; description?: string } }) =>
      apiKeysService.updateApiKey(keyId, data),
    onSuccess: () => {
      toast.success(t('apiKeys.updateSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('apiKeys.updateError'))
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await queryClient.invalidateQueries({ queryKey: ['api-keys'], refetchType: 'all' })
    },
  })
}

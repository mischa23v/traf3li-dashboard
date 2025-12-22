import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import integrationsService, {
  Integration,
  IntegrationCategory,
  ConnectIntegrationData,
  IntegrationSettings,
} from '@/services/integrationsService'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

/**
 * Hook to fetch all integrations
 */
export const useIntegrations = () => {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => integrationsService.getIntegrations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch integrations by category
 */
export const useIntegrationsByCategory = (category: IntegrationCategory) => {
  return useQuery({
    queryKey: ['integrations', 'category', category],
    queryFn: () => integrationsService.getIntegrationsByCategory(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: ConnectIntegrationData) => integrationsService.connectIntegration(data),
    onSuccess: () => {
      toast.success(t('integrations.connectSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('integrations.connectError'))
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await queryClient.invalidateQueries({ queryKey: ['integrations'], refetchType: 'all' })
    },
  })
}

/**
 * Hook to disconnect an integration
 */
export const useDisconnectIntegration = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => integrationsService.disconnectIntegration(id),
    onSuccess: () => {
      toast.success(t('integrations.disconnectSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('integrations.disconnectError'))
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await queryClient.invalidateQueries({ queryKey: ['integrations'], refetchType: 'all' })
    },
  })
}

/**
 * Hook to update integration settings
 */
export const useUpdateIntegrationSettings = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: Partial<IntegrationSettings> }) =>
      integrationsService.updateIntegrationSettings(id, settings),
    onSuccess: () => {
      toast.success(t('integrations.updateSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('integrations.updateError'))
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await queryClient.invalidateQueries({ queryKey: ['integrations'], refetchType: 'all' })
    },
  })
}

/**
 * Hook to test integration connection
 */
export const useTestIntegration = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => integrationsService.testIntegration(id),
    onSuccess: (success) => {
      if (success) {
        toast.success(t('integrations.testSuccess'))
      } else {
        toast.error(t('integrations.testError'))
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t('integrations.testError'))
    },
  })
}

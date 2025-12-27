import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CACHE_TIMES } from '@/config/cache'
import webhookService, {
  Webhook,
  WebhookFormData,
  WebhookDelivery,
  WebhookEvent,
  WebhookStats,
} from '@/services/webhookService'
import { toast } from 'sonner'

/**
 * Get webhook statistics
 */
export const useWebhookStats = () => {
  return useQuery({
    queryKey: ['webhooks', 'stats'],
    queryFn: () => webhookService.getStats(),
    staleTime: CACHE_TIMES.SHORT, // 2 minutes
  })
}

/**
 * Get available webhook events
 */
export const useWebhookEvents = () => {
  return useQuery({
    queryKey: ['webhooks', 'events'],
    queryFn: () => webhookService.getAvailableEvents(),
    staleTime: CACHE_TIMES.LONG, // 30 minutes (was 10 minutes, events don't change often)
  })
}

/**
 * Get all webhooks
 */
export const useWebhooks = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['webhooks', 'list', params],
    queryFn: () => webhookService.getWebhooks(params),
    staleTime: CACHE_TIMES.CALENDAR.GRID, // 1 minute
  })
}

/**
 * Get single webhook by ID
 */
export const useWebhook = (id: string) => {
  return useQuery({
    queryKey: ['webhooks', 'detail', id],
    queryFn: () => webhookService.getWebhook(id),
    enabled: !!id,
    staleTime: CACHE_TIMES.CALENDAR.GRID,
  })
}

/**
 * Get webhook deliveries/logs
 */
export const useWebhookDeliveries = (
  id: string,
  params?: { page?: number; limit?: number }
) => {
  return useQuery({
    queryKey: ['webhooks', 'deliveries', id, params],
    queryFn: () => webhookService.getWebhookDeliveries(id, params),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds (logs should be fresh)
  })
}

/**
 * Get webhook secret
 */
export const useWebhookSecret = (id: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['webhooks', 'secret', id],
    queryFn: () => webhookService.getWebhookSecret(id),
    enabled: !!id && enabled,
    staleTime: 0, // Never cache secrets
    gcTime: 0, // Don't keep in cache
  })
}

/**
 * Create webhook mutation
 */
export const useCreateWebhook = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: WebhookFormData) => webhookService.registerWebhook(data),
    onSuccess: () => {
      toast.success(t('webhooks.created'))
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('webhooks.createError'))
    },
  })
}

/**
 * Update webhook mutation
 */
export const useUpdateWebhook = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WebhookFormData }) =>
      webhookService.updateWebhook(id, data),
    onSuccess: (_, variables) => {
      toast.success(t('webhooks.updated'))
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'detail', variables.id] })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('webhooks.updateError'))
    },
  })
}

/**
 * Delete webhook mutation
 */
export const useDeleteWebhook = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => webhookService.deleteWebhook(id),
    onSuccess: () => {
      toast.success(t('webhooks.deleted'))
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('webhooks.deleteError'))
    },
  })
}

/**
 * Test webhook mutation
 */
export const useTestWebhook = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => webhookService.testWebhook(id),
    onSuccess: (data) => {
      toast.success(data.message || t('webhooks.testSuccess'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('webhooks.testError'))
    },
  })
}

/**
 * Enable webhook mutation
 */
export const useEnableWebhook = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => webhookService.enableWebhook(id),
    onSuccess: (_, id) => {
      toast.success(t('webhooks.enabled'))
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'detail', id] })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('webhooks.enableError'))
    },
  })
}

/**
 * Disable webhook mutation
 */
export const useDisableWebhook = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => webhookService.disableWebhook(id),
    onSuccess: (_, id) => {
      toast.success(t('webhooks.disabled'))
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'detail', id] })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('webhooks.disableError'))
    },
  })
}

/**
 * Regenerate webhook secret mutation
 */
export const useRegenerateSecret = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => webhookService.regenerateSecret(id),
    onSuccess: (_, id) => {
      toast.success(t('webhooks.secretRegenerated'))
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'secret', id] })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('webhooks.secretRegenerateError'))
    },
  })
}

/**
 * Retry delivery mutation
 */
export const useRetryDelivery = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ webhookId, deliveryId }: { webhookId: string; deliveryId: string }) =>
      webhookService.retryDelivery(webhookId, deliveryId),
    onSuccess: (_, variables) => {
      toast.success(t('webhooks.retrySuccess'))
      queryClient.invalidateQueries({
        queryKey: ['webhooks', 'deliveries', variables.webhookId],
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('webhooks.retryError'))
    },
  })
}

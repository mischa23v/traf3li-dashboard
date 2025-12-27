import { useQuery, useMutation } from '@tanstack/react-query'
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
import { invalidateCache } from '@/lib/cache-invalidation'

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
    staleTime: CACHE_TIMES.AUDIT.LOGS, // 30 seconds (logs should be fresh)
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
    staleTime: CACHE_TIMES.INSTANT, // Never cache secrets
    gcTime: CACHE_TIMES.INSTANT, // Don't keep in cache
  })
}

/**
 * Create webhook mutation
 */
export const useCreateWebhook = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: WebhookFormData) => webhookService.registerWebhook(data),
    onSuccess: () => {
      toast.success(t('webhooks.created'))
      invalidateCache.webhooks.all()
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
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WebhookFormData }) =>
      webhookService.updateWebhook(id, data),
    onSuccess: (_, variables) => {
      toast.success(t('webhooks.updated'))
      invalidateCache.webhooks.all()
      invalidateCache.webhooks.detail(variables.id)
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
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => webhookService.deleteWebhook(id),
    onSuccess: () => {
      toast.success(t('webhooks.deleted'))
      invalidateCache.webhooks.all()
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
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => webhookService.enableWebhook(id),
    onSuccess: (_, id) => {
      toast.success(t('webhooks.enabled'))
      invalidateCache.webhooks.all()
      invalidateCache.webhooks.detail(id)
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
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => webhookService.disableWebhook(id),
    onSuccess: (_, id) => {
      toast.success(t('webhooks.disabled'))
      invalidateCache.webhooks.all()
      invalidateCache.webhooks.detail(id)
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
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => webhookService.regenerateSecret(id),
    onSuccess: (_, id) => {
      toast.success(t('webhooks.secretRegenerated'))
      invalidateCache.webhooks.secret(id)
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
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ webhookId, deliveryId }: { webhookId: string; deliveryId: string }) =>
      webhookService.retryDelivery(webhookId, deliveryId),
    onSuccess: (_, variables) => {
      toast.success(t('webhooks.retrySuccess'))
      invalidateCache.webhooks.deliveries(variables.webhookId)
    },
    onError: (error: Error) => {
      toast.error(error.message || t('webhooks.retryError'))
    },
  })
}

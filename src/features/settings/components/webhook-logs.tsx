import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Activity,
  Calendar,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWebhookDeliveries, useRetryDelivery } from '@/hooks/useWebhooks'
import { Webhook, WebhookDelivery } from '@/services/webhookService'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface WebhookLogsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  webhook: Webhook
}

export function WebhookLogs({ open, onOpenChange, webhook }: WebhookLogsProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { data: deliveriesData, isLoading } = useWebhookDeliveries(webhook._id, { limit: 50 })
  const retryMutation = useRetryDelivery()

  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null)

  const deliveries = deliveriesData?.deliveries || []

  const handleRetry = async (delivery: WebhookDelivery) => {
    await retryMutation.mutateAsync({
      webhookId: webhook._id,
      deliveryId: delivery._id,
    })
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPp', { locale: isRTL ? ar : undefined })
  }

  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: isRTL ? ar : undefined,
    })
  }

  const getStatusIcon = (status: WebhookDelivery['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: WebhookDelivery['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-500">
            {t('webhooks.success', 'Success')}
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            {t('webhooks.failed', 'Failed')}
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            {t('webhooks.pending', 'Pending')}
          </Badge>
        )
    }
  }

  const getResponseStatusColor = (code?: number) => {
    if (!code) return 'text-gray-500'
    if (code >= 200 && code < 300) return 'text-green-600'
    if (code >= 400 && code < 500) return 'text-orange-600'
    if (code >= 500) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            {t('webhooks.deliveryLogs', 'Delivery Logs')}
          </DialogTitle>
          <DialogDescription>
            {t('webhooks.deliveryLogsDescription', 'View recent webhook delivery attempts and their status')}
            <div className="mt-2 p-2 bg-muted rounded text-sm font-mono">
              {webhook.url}
            </div>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : deliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6">
                <Activity className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                {t('webhooks.noDeliveries', 'No deliveries yet')}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('webhooks.noDeliveriesDescription', 'Webhook delivery logs will appear here once events are triggered')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deliveries.map((delivery) => {
                const isExpanded = expandedDelivery === delivery._id
                const responseCode = delivery.response?.status || delivery.response?.statusCode

                return (
                  <Collapsible
                    key={delivery._id}
                    open={isExpanded}
                    onOpenChange={() =>
                      setExpandedDelivery(isExpanded ? null : delivery._id)
                    }
                  >
                    <div className="rounded-lg border bg-card">
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            {/* Status and Event */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {getStatusIcon(delivery.status)}
                              <Badge variant="outline">{delivery.event}</Badge>
                              {getStatusBadge(delivery.status)}
                              {delivery.attempts > 1 && (
                                <Badge variant="outline" className="gap-1">
                                  <RefreshCw className="h-3 w-3" />
                                  {delivery.attempts} {t('webhooks.attempts', 'attempts')}
                                </Badge>
                              )}
                            </div>

                            {/* Response Code */}
                            {responseCode && (
                              <div className="flex items-center gap-2 text-sm">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className={cn('font-mono font-semibold', getResponseStatusColor(responseCode))}>
                                  {responseCode}
                                </span>
                              </div>
                            )}

                            {/* Error Message */}
                            {delivery.error && (
                              <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span className="break-all">{delivery.error}</span>
                              </div>
                            )}

                            {/* Timestamp */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(delivery.createdAt)}</span>
                              <span className="text-muted-foreground/70">
                                ({formatRelativeTime(delivery.createdAt)})
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {delivery.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRetry(delivery)}
                                disabled={retryMutation.isPending}
                              >
                                <RefreshCw
                                  className={cn(
                                    'h-3 w-3',
                                    isRTL ? 'ms-1' : 'me-1',
                                    retryMutation.isPending && 'animate-spin'
                                  )}
                                />
                                {t('webhooks.retry', 'Retry')}
                              </Button>
                            )}
                            <CollapsibleTrigger asChild>
                              <Button size="sm" variant="ghost">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <CollapsibleContent>
                        <Separator />
                        <div className="p-4 space-y-4 bg-muted/30">
                          {/* Payload */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              {t('webhooks.payload', 'Payload')}
                            </h4>
                            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                              <code>{JSON.stringify(delivery.payload, null, 2)}</code>
                            </pre>
                          </div>

                          {/* Response */}
                          {delivery.response && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                {t('webhooks.response', 'Response')}
                              </h4>
                              <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                                <code>{JSON.stringify(delivery.response, null, 2)}</code>
                              </pre>
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                {t('webhooks.deliveryId', 'Delivery ID')}:
                              </span>
                              <code className="ml-2 text-xs">{delivery._id}</code>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {t('webhooks.webhookId', 'Webhook ID')}:
                              </span>
                              <code className="ml-2 text-xs">{delivery.webhookId}</code>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {t('webhooks.created', 'Created')}:
                              </span>
                              <span className="ml-2 text-xs">{formatDate(delivery.createdAt)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {t('webhooks.updated', 'Updated')}:
                              </span>
                              <span className="ml-2 text-xs">{formatDate(delivery.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer Stats */}
        {deliveries.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {t('webhooks.showingDeliveries', 'Showing {{count}} recent deliveries', {
                  count: deliveries.length,
                })}
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span>
                    {deliveries.filter(d => d.status === 'success').length}{' '}
                    {t('webhooks.successful', 'successful')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-500" />
                  <span>
                    {deliveries.filter(d => d.status === 'failed').length}{' '}
                    {t('webhooks.failed', 'failed')}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Webhook,
  Plus,
  Trash2,
  Edit,
  MoreVertical,
  Activity,
  AlertTriangle,
  Loader2,
  Globe,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  History,
  Key,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import {
  useWebhooks,
  useWebhookStats,
  useDeleteWebhook,
  useEnableWebhook,
  useDisableWebhook,
  useTestWebhook,
} from '@/hooks/useWebhooks'
import { Webhook as WebhookType } from '@/services/webhookService'
import { cn } from '@/lib/utils'
import { WebhookDialog } from './webhook-dialog'
import { WebhookLogs } from './webhook-logs'

export function WebhooksSettings() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { data: webhooksData, isLoading } = useWebhooks()
  const { data: stats } = useWebhookStats()
  const deleteMutation = useDeleteWebhook()
  const enableMutation = useEnableWebhook()
  const disableMutation = useDisableWebhook()
  const testMutation = useTestWebhook()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [logsOpen, setLogsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookType | null>(null)
  const [editingWebhook, setEditingWebhook] = useState<WebhookType | null>(null)

  const webhooks = webhooksData?.webhooks || []

  const handleDelete = async () => {
    if (!selectedWebhook) return
    await deleteMutation.mutateAsync(selectedWebhook._id)
    setDeleteDialogOpen(false)
    setSelectedWebhook(null)
  }

  const handleToggleStatus = async (webhook: WebhookType) => {
    if (webhook.isActive) {
      await disableMutation.mutateAsync(webhook._id)
    } else {
      await enableMutation.mutateAsync(webhook._id)
    }
  }

  const handleTest = async (webhook: WebhookType) => {
    await testMutation.mutateAsync(webhook._id)
  }

  const handleEdit = (webhook: WebhookType) => {
    setEditingWebhook(webhook)
    setDialogOpen(true)
  }

  const handleViewLogs = (webhook: WebhookType) => {
    setSelectedWebhook(webhook)
    setLogsOpen(true)
  }

  const handleCreateNew = () => {
    setEditingWebhook(null)
    setDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPp', { locale: isRTL ? ar : undefined })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('webhooks.title', 'Webhooks')}
          </h2>
          <p className="text-muted-foreground">
            {t('webhooks.description', 'Manage webhooks for real-time event notifications')}
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
          {t('webhooks.createNew', 'Create Webhook')}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('webhooks.totalWebhooks', 'Total Webhooks')}
              </CardTitle>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWebhooks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('webhooks.activeWebhooks', 'Active Webhooks')}
              </CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeWebhooks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('webhooks.successRate', 'Success Rate')}
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.successRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.successfulDeliveries.toLocaleString()} / {stats.totalDeliveries.toLocaleString()} {t('webhooks.deliveries', 'deliveries')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            {t('webhooks.yourWebhooks', 'Your Webhooks')}
          </CardTitle>
          <CardDescription>
            {t('webhooks.manageDescription', 'Configure and monitor your webhook endpoints')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!webhooks || webhooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6">
                <Webhook className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                {t('webhooks.noWebhooks', 'No webhooks configured')}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                {t('webhooks.noWebhooksDescription', 'Create your first webhook to receive real-time notifications about events')}
              </p>
              <Button onClick={handleCreateNew} className="mt-4">
                <Plus className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                {t('webhooks.createFirst', 'Create First Webhook')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div
                  key={webhook._id}
                  className={cn(
                    'flex items-start justify-between rounded-lg border p-4 transition-colors',
                    webhook.isActive ? 'hover:bg-muted/50' : 'bg-muted/50 opacity-60'
                  )}
                >
                  <div className="flex-1 space-y-3">
                    {/* Status and URL */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {webhook.isActive ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <code className="text-sm font-mono">{webhook.url}</code>
                      </div>
                      {webhook.isActive ? (
                        <Badge variant="default" className="bg-green-500">
                          {t('webhooks.active', 'Active')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {t('webhooks.inactive', 'Inactive')}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    {webhook.description && (
                      <p className="text-sm text-muted-foreground">
                        {webhook.description}
                      </p>
                    )}

                    {/* Events */}
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.slice(0, 5).map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                      {webhook.events.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{webhook.events.length - 5} {t('webhooks.more', 'more')}
                        </Badge>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>
                          {t('webhooks.created', 'Created')}: {formatDate(webhook.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>
                          {t('webhooks.updated', 'Updated')}: {formatDate(webhook.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(webhook)}>
                        <Edit className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                        {t('webhooks.edit', 'Edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTest(webhook)}
                        disabled={!webhook.isActive || testMutation.isPending}
                      >
                        <Play className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                        {t('webhooks.test', 'Test')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewLogs(webhook)}>
                        <History className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                        {t('webhooks.viewLogs', 'View Logs')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(webhook)}
                        disabled={enableMutation.isPending || disableMutation.isPending}
                      >
                        {webhook.isActive ? (
                          <>
                            <Pause className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                            {t('webhooks.disable', 'Disable')}
                          </>
                        ) : (
                          <>
                            <Play className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                            {t('webhooks.enable', 'Enable')}
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedWebhook(webhook)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                        {t('webhooks.delete', 'Delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <WebhookDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        webhook={editingWebhook}
      />

      {/* Logs Dialog */}
      {selectedWebhook && (
        <WebhookLogs
          open={logsOpen}
          onOpenChange={setLogsOpen}
          webhook={selectedWebhook}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {t('webhooks.deleteTitle', 'Delete Webhook')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('webhooks.deleteDescription', 'Are you sure you want to delete this webhook? This action cannot be undone.')}
              {selectedWebhook && (
                <div className="mt-2 p-2 bg-muted rounded text-sm font-mono">
                  {selectedWebhook.url}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ms-2' : 'me-2')} />
                  {t('webhooks.deleting', 'Deleting...')}
                </>
              ) : (
                <>
                  <Trash2 className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                  {t('webhooks.delete', 'Delete')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

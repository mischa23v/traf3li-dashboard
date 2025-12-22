import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Webhook as WebhookIcon,
  Loader2,
  Shield,
  Globe,
  Key,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react'
import {
  useCreateWebhook,
  useUpdateWebhook,
  useWebhookEvents,
  useWebhookSecret,
  useRegenerateSecret,
} from '@/hooks/useWebhooks'
import { Webhook, WebhookEvent } from '@/services/webhookService'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { toast } from 'sonner'

interface WebhookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  webhook?: Webhook | null
}

// Default webhook events grouped by category
const WEBHOOK_EVENTS: WebhookEvent[] = [
  // Cases
  { name: 'case.created', description: 'When a new case is created', category: 'Cases' },
  { name: 'case.updated', description: 'When a case is updated', category: 'Cases' },
  { name: 'case.closed', description: 'When a case is closed', category: 'Cases' },
  { name: 'case.assigned', description: 'When a case is assigned', category: 'Cases' },

  // Invoices
  { name: 'invoice.created', description: 'When an invoice is created', category: 'Invoices' },
  { name: 'invoice.updated', description: 'When an invoice is updated', category: 'Invoices' },
  { name: 'invoice.paid', description: 'When an invoice is paid', category: 'Invoices' },
  { name: 'invoice.overdue', description: 'When an invoice becomes overdue', category: 'Invoices' },

  // Clients
  { name: 'client.created', description: 'When a new client is added', category: 'Clients' },
  { name: 'client.updated', description: 'When client information is updated', category: 'Clients' },
  { name: 'client.deleted', description: 'When a client is deleted', category: 'Clients' },

  // Payments
  { name: 'payment.received', description: 'When a payment is received', category: 'Payments' },
  { name: 'payment.failed', description: 'When a payment fails', category: 'Payments' },

  // Documents
  { name: 'document.uploaded', description: 'When a document is uploaded', category: 'Documents' },
  { name: 'document.signed', description: 'When a document is signed', category: 'Documents' },

  // Tasks
  { name: 'task.created', description: 'When a task is created', category: 'Tasks' },
  { name: 'task.completed', description: 'When a task is completed', category: 'Tasks' },

  // Staff
  { name: 'staff.onboarded', description: 'When a new staff member is onboarded', category: 'Staff' },
  { name: 'staff.offboarded', description: 'When a staff member is offboarded', category: 'Staff' },
]

export function WebhookDialog({ open, onOpenChange, webhook }: WebhookDialogProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const createMutation = useCreateWebhook()
  const updateMutation = useUpdateWebhook()
  const regenerateMutation = useRegenerateSecret()
  const { data: availableEvents } = useWebhookEvents()

  // Use backend events if available, otherwise use default
  const events = availableEvents && availableEvents.length > 0 ? availableEvents : WEBHOOK_EVENTS

  // Form state
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [customHeaders, setCustomHeaders] = useState<{ key: string; value: string }[]>([])
  const [showSecret, setShowSecret] = useState(false)

  // Load webhook secret only when needed
  const [fetchSecret, setFetchSecret] = useState(false)
  const { data: secretData } = useWebhookSecret(webhook?._id || '', fetchSecret)

  // Initialize form with webhook data
  useEffect(() => {
    if (webhook) {
      setUrl(webhook.url)
      setDescription(webhook.description || '')
      setSelectedEvents(webhook.events)
      setIsActive(webhook.isActive)
    } else {
      setUrl('')
      setDescription('')
      setSelectedEvents([])
      setIsActive(true)
      setCustomHeaders([])
    }
    setShowSecret(false)
    setFetchSecret(false)
  }, [webhook, open])

  const handleToggleEvent = (eventName: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventName)
        ? prev.filter(e => e !== eventName)
        : [...prev, eventName]
    )
  }

  const handleSelectAllInCategory = (category: string) => {
    const categoryEvents = events.filter(e => e.category === category).map(e => e.name)
    const allSelected = categoryEvents.every(e => selectedEvents.includes(e))

    if (allSelected) {
      setSelectedEvents(prev => prev.filter(e => !categoryEvents.includes(e)))
    } else {
      setSelectedEvents(prev => [...new Set([...prev, ...categoryEvents])])
    }
  }

  const handleAddHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }])
  }

  const handleRemoveHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index))
  }

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...customHeaders]
    newHeaders[index][field] = value
    setCustomHeaders(newHeaders)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim() || selectedEvents.length === 0) {
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      toast.error(t('webhooks.invalidUrl', 'Please enter a valid URL'))
      return
    }

    const data = {
      url: url.trim(),
      events: selectedEvents,
      description: description.trim() || undefined,
      isActive,
    }

    if (webhook) {
      await updateMutation.mutateAsync({ id: webhook._id, data })
    } else {
      await createMutation.mutateAsync(data)
    }

    onOpenChange(false)
  }

  const handleCopySecret = () => {
    if (secretData?.secret) {
      navigator.clipboard.writeText(secretData.secret)
      toast.success(t('webhooks.secretCopied', 'Secret copied to clipboard'))
    }
  }

  const handleRegenerateSecret = async () => {
    if (!webhook) return
    await regenerateMutation.mutateAsync(webhook._id)
    setFetchSecret(true)
  }

  const handleViewSecret = () => {
    if (!fetchSecret) {
      setFetchSecret(true)
    }
    setShowSecret(!showSecret)
  }

  // Group events by category
  const eventsByCategory = events.reduce((acc, event) => {
    if (!acc[event.category]) {
      acc[event.category] = []
    }
    acc[event.category].push(event)
    return acc
  }, {} as Record<string, WebhookEvent[]>)

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WebhookIcon className="h-5 w-5 text-blue-500" />
            {webhook ? t('webhooks.editWebhook', 'Edit Webhook') : t('webhooks.createWebhook', 'Create Webhook')}
          </DialogTitle>
          <DialogDescription>
            {t('webhooks.dialogDescription', 'Configure your webhook endpoint and select events to receive notifications')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t('webhooks.url', 'Webhook URL')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="webhook-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-domain.com/webhooks/endpoint"
              required
            />
            <p className="text-xs text-muted-foreground">
              {t('webhooks.urlHint', 'The HTTPS endpoint where webhook events will be sent')}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="webhook-description">
              {t('webhooks.description', 'Description')}
            </Label>
            <Textarea
              id="webhook-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('webhooks.descriptionPlaceholder', 'e.g., Production webhook for case notifications')}
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Active/Inactive Toggle */}
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="webhook-active" className="text-base">
                {t('webhooks.active', 'Active')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('webhooks.activeHint', 'Enable or disable this webhook')}
              </p>
            </div>
            <Switch
              id="webhook-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <Separator />

          {/* Events Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <Label>
                {t('webhooks.events', 'Events')} <span className="text-red-500">*</span>
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('webhooks.eventsHint', 'Select which events should trigger this webhook')}
            </p>

            {selectedEvents.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {t('webhooks.selectAtLeastOneEvent', 'Please select at least one event')}
                </p>
              </div>
            )}

            <Accordion type="multiple" className="w-full">
              {Object.entries(eventsByCategory).map(([category, categoryEvents]) => {
                const allSelected = categoryEvents.every(e => selectedEvents.includes(e.name))
                const someSelected = categoryEvents.some(e => selectedEvents.includes(e.name))

                return (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2 w-full">
                        <span>{category}</span>
                        {someSelected && (
                          <Badge variant="secondary" className="text-xs">
                            {categoryEvents.filter(e => selectedEvents.includes(e.name)).length} / {categoryEvents.length}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAllInCategory(category)}
                          className="mb-2"
                        >
                          {allSelected ? t('webhooks.deselectAll', 'Deselect All') : t('webhooks.selectAll', 'Select All')}
                        </Button>
                        <div className="grid gap-3">
                          {categoryEvents.map((event) => (
                            <div key={event.name} className="flex items-start space-x-2 space-x-reverse">
                              <Checkbox
                                id={event.name}
                                checked={selectedEvents.includes(event.name)}
                                onCheckedChange={() => handleToggleEvent(event.name)}
                              />
                              <div className="grid gap-1.5 leading-none flex-1">
                                <label
                                  htmlFor={event.name}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {event.name}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  {event.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>

          {/* Secret Key Section (Edit Mode Only) */}
          {webhook && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-500" />
                  <Label>{t('webhooks.secretKey', 'Secret Key')}</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('webhooks.secretKeyHint', 'Use this secret to verify webhook signatures')}
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showSecret ? 'text' : 'password'}
                      value={showSecret && secretData ? secretData.secret : '••••••••••••••••'}
                      readOnly
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleViewSecret}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopySecret}
                    disabled={!secretData}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegenerateSecret}
                    disabled={regenerateMutation.isPending}
                  >
                    <RefreshCw className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2', regenerateMutation.isPending && 'animate-spin')} />
                    {t('webhooks.regenerate', 'Regenerate')}
                  </Button>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!url.trim() || selectedEvents.length === 0 || isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ms-2' : 'me-2')} />
                  {webhook ? t('webhooks.updating', 'Updating...') : t('webhooks.creating', 'Creating...')}
                </>
              ) : (
                <>
                  <WebhookIcon className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                  {webhook ? t('webhooks.update', 'Update') : t('webhooks.create', 'Create')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plug, Search, Filter, Loader2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { IntegrationCard } from './integration-card'
import { useIntegrations } from '@/hooks/useIntegrations'
import { Integration, IntegrationCategory } from '@/services/integrationsService'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export function IntegrationsSettings() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { data: integrations, isLoading, isError, error } = useIntegrations()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all')
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [showConfigDialog, setShowConfigDialog] = useState(false)

  // Filter integrations
  const filteredIntegrations = integrations?.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.nameAr.includes(searchQuery) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.descriptionAr.includes(searchQuery)

    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Group by category
  const groupedIntegrations = filteredIntegrations?.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = []
    }
    acc[integration.category].push(integration)
    return acc
  }, {} as Record<IntegrationCategory, Integration[]>)

  // Category config
  const categories: Array<{ value: IntegrationCategory | 'all'; label: string; labelAr: string }> = [
    { value: 'all', label: 'All', labelAr: 'الكل' },
    { value: 'payment', label: 'Payment', labelAr: 'الدفع' },
    { value: 'communication', label: 'Communication', labelAr: 'التواصل' },
    { value: 'storage', label: 'Storage', labelAr: 'التخزين' },
    { value: 'calendar', label: 'Calendar', labelAr: 'التقويم' },
    { value: 'accounting', label: 'Accounting', labelAr: 'المحاسبة' },
  ]

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration)
    setShowConnectDialog(true)
  }

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration)
    setShowConfigDialog(true)
  }

  const handleConnectSubmit = () => {
    // TODO: Implement actual connection logic
    setShowConnectDialog(false)
    setSelectedIntegration(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    // Extract bilingual error message
    let errorMessage = t('integrations.loadError')

    if (error) {
      const err = error as any
      // Check for bilingual error properties
      if (err.messageEn && err.messageAr) {
        errorMessage = isRTL ? err.messageAr : err.messageEn
      } else if (err.message && typeof err.message === 'string' && err.message.includes(' | ')) {
        // Check for combined bilingual message format: "English | Arabic"
        const [en, ar] = err.message.split(' | ')
        errorMessage = isRTL ? ar : en
      } else if (err.message) {
        errorMessage = err.message
      }
    }

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {errorMessage}
        </AlertDescription>
      </Alert>
    )
  }

  const connectedCount = integrations?.filter((i) => i.status === 'connected').length || 0
  const totalCount = integrations?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Plug className="h-6 w-6 text-emerald-600" />
            {t('integrations.title')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('integrations.description')} • {connectedCount}/{totalCount} {t('integrations.connected')}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400", isRTL ? "right-3" : "left-3")} />
          <Input
            placeholder={t('integrations.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("w-full", isRTL ? "pr-10" : "pl-10")}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as IntegrationCategory | 'all')}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {isRTL ? cat.labelAr : cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs by Category */}
      <Tabs defaultValue="all" value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as IntegrationCategory | 'all')}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {categories.map((cat) => {
            const count = cat.value === 'all'
              ? integrations?.length
              : integrations?.filter((i) => i.category === cat.value).length
            return (
              <TabsTrigger key={cat.value} value={cat.value} className="gap-2">
                {isRTL ? cat.labelAr : cat.label}
                <span className="text-xs text-slate-500">({count || 0})</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredIntegrations && filteredIntegrations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  onConfigure={handleConfigure}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Plug className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('integrations.noIntegrations')}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
                {t('integrations.noIntegrationsDescription')}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('integrations.connectTo')} {selectedIntegration && (isRTL ? selectedIntegration.nameAr : selectedIntegration.name)}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration && (isRTL ? selectedIntegration.descriptionAr : selectedIntegration.description)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedIntegration?.requiredFields?.map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field}>{field}</Label>
                <Input
                  id={field}
                  placeholder={`${t('common.enter')} ${field}`}
                  type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('key') ? 'password' : 'text'}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConnectSubmit} className="bg-emerald-600 hover:bg-emerald-700">
              {t('integrations.connect')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Configure Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('integrations.configureIntegration')} {selectedIntegration && (isRTL ? selectedIntegration.nameAr : selectedIntegration.name)}
            </DialogTitle>
            <DialogDescription>
              {t('integrations.configureDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('integrations.configurationComingSoon')}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function (add to utils if needed)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

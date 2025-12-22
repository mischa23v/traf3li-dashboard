import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, Power, PowerOff, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Integration } from '@/services/integrationsService'
import { useDisconnectIntegration } from '@/hooks/useIntegrations'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface IntegrationCardProps {
  integration: Integration
  onConnect: (integration: Integration) => void
  onConfigure: (integration: Integration) => void
}

export function IntegrationCard({ integration, onConnect, onConfigure }: IntegrationCardProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const disconnectMutation = useDisconnectIntegration()
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)

  const getStatusBadge = () => {
    switch (integration.status) {
      case 'connected':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3 me-1" />
            {t('integrations.status.connected')}
          </Badge>
        )
      case 'disconnected':
        return (
          <Badge variant="outline" className="text-slate-500">
            <XCircle className="h-3 w-3 me-1" />
            {t('integrations.status.disconnected')}
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20">
            <Clock className="h-3 w-3 me-1" />
            {t('integrations.status.pending')}
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
            <XCircle className="h-3 w-3 me-1" />
            {t('integrations.status.error')}
          </Badge>
        )
      default:
        return null
    }
  }

  const handleDisconnect = async () => {
    await disconnectMutation.mutateAsync(integration.id)
    setShowDisconnectDialog(false)
  }

  return (
    <>
      <Card className="group hover:shadow-md transition-all duration-200 border-slate-200/60 hover:border-emerald-500/20">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Logo */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200 border border-slate-200/50">
                {integration.logo}
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base font-semibold">
                    {isRTL ? integration.nameAr : integration.name}
                  </CardTitle>
                  {integration.isPopular && (
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      {t('integrations.popular')}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm line-clamp-2">
                  {isRTL ? integration.descriptionAr : integration.description}
                </CardDescription>
                <div className="text-xs text-slate-500 mt-1">
                  {integration.provider}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="shrink-0">
              {getStatusBadge()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Connected Info */}
          {integration.status === 'connected' && integration.connectedAt && (
            <div className="text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
              {t('integrations.connectedAt')}: {new Date(integration.connectedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
              {integration.lastSyncedAt && (
                <> • {t('integrations.lastSynced')}: {new Date(integration.lastSyncedAt).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US')}</>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {integration.status === 'connected' ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => onConfigure(integration)}
                >
                  <Settings className="h-4 w-4" />
                  {t('integrations.configure')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700",
                    disconnectMutation.isPending && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => setShowDisconnectDialog(true)}
                  disabled={disconnectMutation.isPending}
                >
                  {disconnectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PowerOff className="h-4 w-4" />
                  )}
                  {t('integrations.disconnect')}
                </Button>
              </>
            ) : (
              <Button
                className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                size="sm"
                onClick={() => onConnect(integration)}
              >
                <Power className="h-4 w-4" />
                {t('integrations.connect')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('integrations.disconnectTitle')}</DialogTitle>
            <DialogDescription>
              {t('integrations.disconnectDescription', { name: isRTL ? integration.nameAr : integration.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisconnectDialog(false)}
              disabled={disconnectMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                t('integrations.disconnect')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

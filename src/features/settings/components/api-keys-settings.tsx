import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Key,
  Plus,
  Trash2,
  MoreVertical,
  Calendar,
  Activity,
  Shield,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useApiKeys, useRevokeApiKey, useApiKeyStats } from '@/hooks/useApiKeys'
import { CreateApiKeyDialog } from './create-api-key-dialog'
import { ApiKey } from '@/services/apiKeysService'
import { cn } from '@/lib/utils'

export function ApiKeysSettings() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { data: apiKeys, isLoading } = useApiKeys()
  const { data: stats } = useApiKeyStats()
  const revokeMutation = useRevokeApiKey()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null)

  const handleRevoke = async () => {
    if (!selectedKey) return
    await revokeMutation.mutateAsync(selectedKey.keyId)
    setRevokeDialogOpen(false)
    setSelectedKey(null)
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
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
            {t('apiKeys.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('apiKeys.description')}
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
          {t('apiKeys.createNewKey')}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('apiKeys.totalKeys')}
              </CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKeys}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('apiKeys.activeKeys')}
              </CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeKeys}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('apiKeys.totalRequests')}
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('apiKeys.yourApiKeys')}
          </CardTitle>
          <CardDescription>
            {t('apiKeys.manageKeysDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!apiKeys || apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6">
                <Key className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                {t('apiKeys.noKeys')}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                {t('apiKeys.noKeysDescription')}
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                <Plus className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                {t('apiKeys.createFirstKey')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => {
                const expired = isExpired(key.expiresAt)
                return (
                  <div
                    key={key._id}
                    className={cn(
                      'flex items-start justify-between rounded-lg border p-4 transition-colors',
                      expired ? 'bg-muted/50 opacity-60' : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="flex-1 space-y-3">
                      {/* Key Name and Status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{key.name}</h4>
                        {expired ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {t('apiKeys.expired')}
                          </Badge>
                        ) : key.isActive ? (
                          <Badge variant="default" className="bg-green-500">
                            {t('apiKeys.active')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {t('apiKeys.inactive')}
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      {key.description && (
                        <p className="text-sm text-muted-foreground">
                          {key.description}
                        </p>
                      )}

                      {/* Key Display */}
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                          {key.keyPrefix}•••••••••••••••••••••••••••••••{key.keySuffix}
                        </code>
                      </div>

                      {/* Scopes */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {key.scopes.map((scope) => (
                            <Badge key={scope} variant="outline" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {t('apiKeys.created')}: {formatDate(key.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className={expired ? 'text-red-500 font-medium' : ''}>
                            {t('apiKeys.expires')}: {formatDate(key.expiresAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          <span>
                            {key.lastUsedAt
                              ? `${t('apiKeys.lastUsed')}: ${formatDate(key.lastUsedAt)}`
                              : t('apiKeys.neverUsed')}
                          </span>
                        </div>
                      </div>

                      {/* Usage Count */}
                      <div className="text-xs text-muted-foreground">
                        {t('apiKeys.usageCount', { count: key.usageCount })}
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
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedKey(key)
                            setRevokeDialogOpen(true)
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                          {t('apiKeys.revoke')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateApiKeyDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {t('apiKeys.revokeKey')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('apiKeys.revokeKeyDescription', { keyName: selectedKey?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeMutation.isPending}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={revokeMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {revokeMutation.isPending ? (
                <>
                  <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ms-2' : 'me-2')} />
                  {t('apiKeys.revoking')}
                </>
              ) : (
                <>
                  <Trash2 className={cn('h-4 w-4', isRTL ? 'ms-2' : 'me-2')} />
                  {t('apiKeys.revoke')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

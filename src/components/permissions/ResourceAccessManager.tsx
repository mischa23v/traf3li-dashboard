/**
 * ResourceAccessManager Component
 * UI for managing access to specific resources
 */

'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useResourceAccess,
  useGrantResourceAccess,
  useRevokeResourceAccess,
} from '@/hooks/useEnterprisePermissions'
import type { ResourceAccess } from '@/types/permissions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  Plus,
  Users,
  Crown,
  Edit,
  Eye,
  Trash2,
  Clock,
  UserPlus,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

// ==================== TYPES ====================

interface ResourceAccessManagerProps {
  resourceType: string
  resourceId: string
  resourceName?: string
  className?: string
}

// ==================== HELPERS ====================

const accessLevelConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  owner: { icon: Crown, color: 'text-amber-600 bg-amber-100', label: 'permissions.accessLevel.owner' },
  full: { icon: ShieldCheck, color: 'text-purple-600 bg-purple-100', label: 'permissions.accessLevel.full' },
  edit: { icon: Edit, color: 'text-blue-600 bg-blue-100', label: 'permissions.accessLevel.edit' },
  view: { icon: Eye, color: 'text-green-600 bg-green-100', label: 'permissions.accessLevel.view' },
  none: { icon: Eye, color: 'text-gray-600 bg-gray-100', label: 'permissions.accessLevel.none' },
}

const grantedViaLabels: Record<string, string> = {
  policy: 'permissions.grantedVia.policy',
  relation: 'permissions.grantedVia.relation',
  role: 'permissions.grantedVia.role',
  direct: 'permissions.grantedVia.direct',
}

// ==================== COMPONENTS ====================

function AccessSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

function AccessRow({
  access,
  onRevoke,
  isRevoking,
}: {
  access: ResourceAccess
  onRevoke: (userId: string) => void
  isRevoking: boolean
}) {
  const { t, i18n } = useTranslation()
  const config = accessLevelConfig[access.accessLevel] || accessLevelConfig.view
  const Icon = config.icon

  const isExpired = access.expiresAt && new Date(access.expiresAt) < new Date()
  const willExpire = access.expiresAt && new Date(access.expiresAt) > new Date()

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border',
      isExpired && 'opacity-50 bg-muted'
    )}>
      <Avatar className="h-10 w-10">
        <AvatarImage src={`/api/users/${access.resourceId}/avatar`} />
        <AvatarFallback>{access.resourceName?.[0] || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{access.resourceName || access.resourceId}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className={cn('text-xs', config.color)}>
            <Icon className="me-1 h-3 w-3" />
            {t(config.label)}
          </Badge>
          <span>•</span>
          <span>{t(grantedViaLabels[access.grantedVia] || 'permissions.grantedVia.direct')}</span>
          {willExpire && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-600">
                <Clock className="h-3 w-3" />
                {format(new Date(access.expiresAt!), 'dd MMM yyyy', {
                  locale: i18n.language === 'ar' ? ar : undefined
                })}
              </span>
            </>
          )}
          {isExpired && (
            <>
              <span>•</span>
              <span className="text-destructive">{t('permissions.expired')}</span>
            </>
          )}
        </div>
      </div>
      {access.grantedVia === 'direct' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevoke(access.resourceId)}
          disabled={isRevoking}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

function GrantAccessDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { userId: string; accessLevel: string; expiresAt?: string; reason?: string }) => void
  isLoading: boolean
}) {
  const { t } = useTranslation()
  const [userId, setUserId] = useState('')
  const [accessLevel, setAccessLevel] = useState('view')
  const [expiresAt, setExpiresAt] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userId && accessLevel) {
      onSubmit({
        userId,
        accessLevel,
        expiresAt: expiresAt || undefined,
        reason: reason || undefined,
      })
    }
  }

  const resetForm = () => {
    setUserId('')
    setAccessLevel('view')
    setExpiresAt('')
    setReason('')
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen)
      if (!isOpen) resetForm()
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('permissions.grantAccess')}</DialogTitle>
          <DialogDescription>
            {t('permissions.grantAccessDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">{t('permissions.selectUser')}</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={t('permissions.userIdPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('permissions.accessLevel.label')}</Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">{t('permissions.accessLevel.view')}</SelectItem>
                  <SelectItem value="edit">{t('permissions.accessLevel.edit')}</SelectItem>
                  <SelectItem value="full">{t('permissions.accessLevel.full')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">{t('permissions.expiresAt')}</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t('permissions.expiresAtHint')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">{t('permissions.reason')}</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('permissions.reasonPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !userId}>
              {isLoading ? t('common.saving') : t('permissions.grant')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== MAIN COMPONENT ====================

export function ResourceAccessManager({
  resourceType,
  resourceId,
  resourceName,
  className,
}: ResourceAccessManagerProps) {
  const { t } = useTranslation()
  const [grantDialogOpen, setGrantDialogOpen] = useState(false)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [userToRevoke, setUserToRevoke] = useState<string | null>(null)

  const { data: accessList, isLoading } = useResourceAccess(resourceType, resourceId)
  const grantAccess = useGrantResourceAccess()
  const revokeAccess = useRevokeResourceAccess()

  const handleGrantAccess = (data: { userId: string; accessLevel: string; expiresAt?: string; reason?: string }) => {
    grantAccess.mutate(
      { resourceType, resourceId, data },
      { onSuccess: () => setGrantDialogOpen(false) }
    )
  }

  const handleRevokeAccess = () => {
    if (userToRevoke) {
      revokeAccess.mutate(
        { resourceType, resourceId, userId: userToRevoke },
        {
          onSuccess: () => {
            setRevokeDialogOpen(false)
            setUserToRevoke(null)
          },
        }
      )
    }
  }

  const openRevokeDialog = (userId: string) => {
    setUserToRevoke(userId)
    setRevokeDialogOpen(true)
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('permissions.resourceAccess')}
            </CardTitle>
            <CardDescription>
              {resourceName ? (
                <>
                  {t('permissions.accessFor')} <span className="font-medium">{resourceName}</span>
                </>
              ) : (
                t('permissions.resourceAccessDescription')
              )}
            </CardDescription>
          </div>
          <Button onClick={() => setGrantDialogOpen(true)}>
            <UserPlus className="me-2 h-4 w-4" />
            {t('permissions.grantAccess')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <AccessSkeleton />
        ) : !accessList || accessList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>{t('permissions.noAccessGranted')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {accessList.map((access) => (
              <AccessRow
                key={access.resourceId}
                access={access}
                onRevoke={openRevokeDialog}
                isRevoking={revokeAccess.isPending}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Grant Access Dialog */}
      <GrantAccessDialog
        open={grantDialogOpen}
        onOpenChange={setGrantDialogOpen}
        onSubmit={handleGrantAccess}
        isLoading={grantAccess.isPending}
      />

      {/* Revoke Confirmation */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('permissions.revokeAccess')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('permissions.revokeAccessConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeAccess}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('permissions.revoke')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default ResourceAccessManager

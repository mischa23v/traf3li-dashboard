/**
 * UserOverrideManager Component
 * Admin UI for managing per-user access overrides
 */

'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useUIAccessConfig,
  useAddUserOverride,
  useRemoveUserOverride,
  useAllSidebarItems,
  useAllPageAccess,
} from '@/hooks/useUIAccess'
import type { UserOverride, SidebarOverride, PageOverride } from '@/types/uiAccess'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  Trash2,
  Clock,
  User,
  Users,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface UserOverrideManagerProps {
  className?: string
}

// ═══════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════

function OverrideSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// OVERRIDE ROW COMPONENT
// ═══════════════════════════════════════════════════════════════

function OverrideRow({
  override,
  onRemove,
  isRemoving,
}: {
  override: UserOverride
  onRemove: (userId: string) => void
  isRemoving: boolean
}) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const isExpired = override.expiresAt && new Date(override.expiresAt) < new Date()

  const showItems = override.showSidebarItems || []
  const hideItems = override.hideSidebarItems || []
  const grantPages = override.grantPageAccess || []
  const denyPages = override.denyPageAccess || []

  return (
    <div className={cn(
      'border rounded-lg p-4',
      isExpired && 'opacity-60 bg-muted/50'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{override.userId}</p>
            {override.reason && (
              <p className="text-sm text-muted-foreground mt-1">
                {t('userOverride.reason')}: {override.reason}
              </p>
            )}
            {override.expiresAt && (
              <p className={cn(
                'text-xs flex items-center gap-1 mt-1',
                isExpired ? 'text-destructive' : 'text-muted-foreground'
              )}>
                <Clock className="h-3 w-3" />
                {isExpired ? t('userOverride.expired') : t('userOverride.expiresAt')}:{' '}
                {format(new Date(override.expiresAt), 'PPP', {
                  locale: isArabic ? ar : undefined
                })}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(override.userId)}
          disabled={isRemoving}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Override Details */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sidebar Overrides */}
        {(showItems.length > 0 || hideItems.length > 0) && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('userOverride.sidebarOverrides')}</p>
            {showItems.length > 0 && (
              <div>
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {t('userOverride.show')}:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {showItems.map((id) => (
                    <Badge key={id} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {hideItems.length > 0 && (
              <div>
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <EyeOff className="h-3 w-3" />
                  {t('userOverride.hide')}:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {hideItems.map((id) => (
                    <Badge key={id} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Page Overrides */}
        {(grantPages.length > 0 || denyPages.length > 0) && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('userOverride.pageOverrides')}</p>
            {grantPages.length > 0 && (
              <div>
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {t('userOverride.grant')}:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {grantPages.map((id) => (
                    <Badge key={id} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {denyPages.length > 0 && (
              <div>
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {t('userOverride.deny')}:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {denyPages.map((id) => (
                    <Badge key={id} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ADD OVERRIDE DIALOG
// ═══════════════════════════════════════════════════════════════

function AddOverrideDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  sidebarItems,
  pages,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  isLoading: boolean
  sidebarItems: any[]
  pages: any[]
}) {
  const { t } = useTranslation()
  const [userId, setUserId] = useState('')
  const [reason, setReason] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [showSidebarItems, setShowSidebarItems] = useState<string[]>([])
  const [hideSidebarItems, setHideSidebarItems] = useState<string[]>([])
  const [grantPageAccess, setGrantPageAccess] = useState<string[]>([])
  const [denyPageAccess, setDenyPageAccess] = useState<string[]>([])

  const resetForm = () => {
    setUserId('')
    setReason('')
    setExpiresAt('')
    setShowSidebarItems([])
    setHideSidebarItems([])
    setGrantPageAccess([])
    setDenyPageAccess([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    onSubmit({
      userId,
      reason: reason || undefined,
      expiresAt: expiresAt || undefined,
      showSidebarItems: showSidebarItems.length > 0 ? showSidebarItems : undefined,
      hideSidebarItems: hideSidebarItems.length > 0 ? hideSidebarItems : undefined,
      grantPageAccess: grantPageAccess.length > 0 ? grantPageAccess : undefined,
      denyPageAccess: denyPageAccess.length > 0 ? denyPageAccess : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen)
      if (!isOpen) resetForm()
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('userOverride.addOverride')}</DialogTitle>
          <DialogDescription>
            {t('userOverride.addOverrideDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* User ID */}
            <div className="space-y-2">
              <Label htmlFor="userId">{t('userOverride.userId')} *</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={t('userOverride.userIdPlaceholder')}
                required
              />
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">{t('userOverride.reason')}</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('userOverride.reasonPlaceholder')}
                rows={2}
              />
            </div>

            {/* Expires At */}
            <div className="space-y-2">
              <Label htmlFor="expiresAt">{t('userOverride.expiresAt')}</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            {/* Sidebar Overrides */}
            <div className="space-y-2">
              <Label>{t('userOverride.sidebarOverrides')}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-green-600 mb-2">{t('userOverride.showItems')}</p>
                  <div className="max-h-32 overflow-y-auto space-y-1 border rounded p-2">
                    {sidebarItems.map((item) => (
                      <label key={item.itemId} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={showSidebarItems.includes(item.itemId)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setShowSidebarItems([...showSidebarItems, item.itemId])
                              setHideSidebarItems(hideSidebarItems.filter(id => id !== item.itemId))
                            } else {
                              setShowSidebarItems(showSidebarItems.filter(id => id !== item.itemId))
                            }
                          }}
                        />
                        {item.label || item.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-red-600 mb-2">{t('userOverride.hideItems')}</p>
                  <div className="max-h-32 overflow-y-auto space-y-1 border rounded p-2">
                    {sidebarItems.map((item) => (
                      <label key={item.itemId} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={hideSidebarItems.includes(item.itemId)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setHideSidebarItems([...hideSidebarItems, item.itemId])
                              setShowSidebarItems(showSidebarItems.filter(id => id !== item.itemId))
                            } else {
                              setHideSidebarItems(hideSidebarItems.filter(id => id !== item.itemId))
                            }
                          }}
                        />
                        {item.label || item.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Page Overrides */}
            <div className="space-y-2">
              <Label>{t('userOverride.pageOverrides')}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-green-600 mb-2">{t('userOverride.grantAccess')}</p>
                  <div className="max-h-32 overflow-y-auto space-y-1 border rounded p-2">
                    {pages.map((page) => (
                      <label key={page.pageId} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={grantPageAccess.includes(page.pageId)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setGrantPageAccess([...grantPageAccess, page.pageId])
                              setDenyPageAccess(denyPageAccess.filter(id => id !== page.pageId))
                            } else {
                              setGrantPageAccess(grantPageAccess.filter(id => id !== page.pageId))
                            }
                          }}
                        />
                        {page.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-red-600 mb-2">{t('userOverride.denyAccess')}</p>
                  <div className="max-h-32 overflow-y-auto space-y-1 border rounded p-2">
                    {pages.map((page) => (
                      <label key={page.pageId} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={denyPageAccess.includes(page.pageId)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setDenyPageAccess([...denyPageAccess, page.pageId])
                              setGrantPageAccess(grantPageAccess.filter(id => id !== page.pageId))
                            } else {
                              setDenyPageAccess(denyPageAccess.filter(id => id !== page.pageId))
                            }
                          }}
                        />
                        {page.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !userId}>
              {isLoading ? t('common.saving') : t('common.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function UserOverrideManager({ className }: UserOverrideManagerProps) {
  const { t } = useTranslation()
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [userToRemove, setUserToRemove] = useState<string | null>(null)

  const { data: config, isLoading } = useUIAccessConfig()
  const { data: sidebarItems } = useAllSidebarItems()
  const { data: pages } = useAllPageAccess()
  const addOverride = useAddUserOverride()
  const removeOverride = useRemoveUserOverride()

  const overrides = config?.userOverrides || []

  const handleAddOverride = (data: any) => {
    addOverride.mutate(data, {
      onSuccess: () => setAddDialogOpen(false),
    })
  }

  const handleRemoveOverride = () => {
    if (userToRemove) {
      removeOverride.mutate(userToRemove, {
        onSuccess: () => {
          setRemoveDialogOpen(false)
          setUserToRemove(null)
        },
      })
    }
  }

  const openRemoveDialog = (userId: string) => {
    setUserToRemove(userId)
    setRemoveDialogOpen(true)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('userOverride.title', 'استثناءات المستخدمين')}
            </CardTitle>
            <CardDescription>
              {t('userOverride.description', 'تخصيص صلاحيات الوصول لمستخدمين محددين')}
            </CardDescription>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="me-2 h-4 w-4" />
            {t('userOverride.addOverride', 'إضافة استثناء')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <OverrideSkeleton />
        ) : overrides.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>{t('userOverride.noOverrides', 'لا توجد استثناءات للمستخدمين')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {overrides.map((override) => (
              <OverrideRow
                key={override.userId}
                override={override}
                onRemove={openRemoveDialog}
                isRemoving={removeOverride.isPending}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Override Dialog */}
      <AddOverrideDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddOverride}
        isLoading={addOverride.isPending}
        sidebarItems={sidebarItems || []}
        pages={pages || []}
      />

      {/* Remove Confirmation */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('userOverride.removeOverride')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('userOverride.removeOverrideConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveOverride}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default UserOverrideManager

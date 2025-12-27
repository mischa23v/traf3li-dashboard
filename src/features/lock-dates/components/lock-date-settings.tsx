/**
 * Lock Date Settings Component
 * Manage fiscal period locks
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Lock,
  Unlock,
  Calendar,
  History,
  AlertTriangle,
  Shield,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  useLockDates,
  useUpdateLockDate,
  useClearLockDate,
  useLockDateHistory,
} from '@/hooks/useLockDates'
import { LOCK_TYPE_CONFIGS, type LockType } from '@/types/lockDate'

interface LockDateSettingsProps {
  className?: string
  isAdmin?: boolean
}

export function LockDateSettings({ className, isAdmin = false }: LockDateSettingsProps) {
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [editingLock, setEditingLock] = React.useState<LockType | null>(null)
  const [newDate, setNewDate] = React.useState<Date | undefined>(undefined)
  const [reason, setReason] = React.useState('')
  const [calendarOpen, setCalendarOpen] = React.useState(false)

  // Disable all queries since backend is not implemented
  const { data: config, isLoading, error } = useLockDates(false)
  const { data: history } = useLockDateHistory(undefined, undefined, undefined, false)
  const updateLock = useUpdateLockDate()
  const clearLock = useClearLockDate()

  // Feature is not implemented - disable all interactions
  const isFeatureDisabled = true

  const handleUpdateLock = async () => {
    if (!editingLock || !newDate) return

    try {
      await updateLock.mutateAsync({
        lockType: editingLock,
        data: {
          lock_date: newDate.toISOString(),
          reason: reason || undefined,
          reasonAr: isArabic && reason ? reason : undefined,
        },
      })
      setEditingLock(null)
      setNewDate(undefined)
      setReason('')
    } catch {
      // Error handled by mutation
    }
  }

  const getLockDate = (lockType: LockType): string | undefined => {
    if (!config) return undefined
    switch (lockType) {
      case 'fiscal':
        return config.fiscalLockDate
      case 'tax':
        return config.taxLockDate
      case 'purchase':
        return config.purchaseLockDate
      case 'sale':
        return config.saleLockDate
      case 'hard':
        return config.hardLockDate
      default:
        return undefined
    }
  }

  const getLockColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'text-red-600 bg-red-50 dark:bg-red-950'
      case 'orange':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950'
      case 'green':
        return 'text-green-600 bg-green-50 dark:bg-green-950'
      case 'purple':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950'
      case 'blue':
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950'
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Coming Soon Alert - [BACKEND-PENDING] */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">
          {t('lockDates.featurePendingTitle')}
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          {t('lockDates.featurePendingDesc')}
        </AlertDescription>
      </Alert>

      {/* Lock Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t('lockDates.title')}
          </CardTitle>
          <CardDescription>
            {t('lockDates.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {LOCK_TYPE_CONFIGS.map((lockConfig) => {
              const lockDate = getLockDate(lockConfig.key)
              const isLocked = !!lockDate
              const isDisabled = isFeatureDisabled || (lockConfig.requiresAdmin && !isAdmin)

              return (
                <div
                  key={lockConfig.key}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border',
                    isLocked && getLockColor(lockConfig.color)
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        isLocked
                          ? getLockColor(lockConfig.color)
                          : 'bg-gray-100 dark:bg-gray-800'
                      )}
                    >
                      {isLocked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Unlock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {isArabic ? lockConfig.labelAr : lockConfig.label}
                        </h4>
                        {lockConfig.requiresAdmin && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="text-xs">
                                  <Shield className="h-3 w-3 me-1" />
                                  {t('lockDates.admin')}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t('lockDates.requiresAdmin')}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? lockConfig.descriptionAr : lockConfig.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {lockDate ? (
                      <div className="text-end">
                        <p className="font-medium">
                          {format(new Date(lockDate), 'PP', {
                            locale: isArabic ? ar : enUS,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('lockDates.lockedUntil')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {t('lockDates.notSet')}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isDisabled}
                        onClick={() => {
                          setEditingLock(lockConfig.key)
                          setNewDate(lockDate ? new Date(lockDate) : undefined)
                        }}
                      >
                        <Calendar className="h-4 w-4 me-1" />
                        {t('lockDates.edit')}
                      </Button>
                      {lockDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isDisabled}
                          onClick={() => clearLock.mutate(lockConfig.key)}
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {history && history.entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t('lockDates.history')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('lockDates.historyType')}</TableHead>
                  <TableHead>{t('lockDates.historyPrevious')}</TableHead>
                  <TableHead>{t('lockDates.historyNew')}</TableHead>
                  <TableHead>{t('lockDates.historyBy')}</TableHead>
                  <TableHead>{t('lockDates.historyDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.entries.slice(0, 10).map((entry) => {
                  const lockConfig = LOCK_TYPE_CONFIGS.find((c) => c.key === entry.lock_type)
                  const user =
                    typeof entry.changed_by === 'object' ? entry.changed_by : null

                  return (
                    <TableRow key={entry._id}>
                      <TableCell>
                        {lockConfig
                          ? isArabic
                            ? lockConfig.labelAr
                            : lockConfig.label
                          : entry.lock_type}
                      </TableCell>
                      <TableCell>
                        {entry.previous_date
                          ? format(new Date(entry.previous_date), 'PP', {
                              locale: isArabic ? ar : enUS,
                            })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(entry.new_date), 'PP', {
                          locale: isArabic ? ar : enUS,
                        })}
                      </TableCell>
                      <TableCell>
                        {user
                          ? `${user.firstName} ${user.lastName}`
                          : t('common.system')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(entry.changed_at), 'PPp', {
                          locale: isArabic ? ar : enUS,
                        })}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingLock} onOpenChange={() => setEditingLock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('lockDates.updateLockDate')}
            </DialogTitle>
            <DialogDescription>
              {editingLock &&
                (isArabic
                  ? LOCK_TYPE_CONFIGS.find((c) => c.key === editingLock)?.descriptionAr
                  : LOCK_TYPE_CONFIGS.find((c) => c.key === editingLock)?.description)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('lockDates.lockDate')}</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-start font-normal',
                      !newDate && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="me-2 h-4 w-4" />
                    {newDate
                      ? format(newDate, 'PPP', { locale: isArabic ? ar : enUS })
                      : t('lockDates.pickDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newDate}
                    onSelect={(date) => {
                      setNewDate(date)
                      setCalendarOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>{t('lockDates.reasonOptional')}</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('lockDates.reasonPlaceholder')}
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {t('lockDates.warning')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLock(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUpdateLock} disabled={!newDate || updateLock.isPending}>
              {updateLock.isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LockDateSettings

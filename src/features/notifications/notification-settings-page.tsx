/**
 * Notification Settings Page
 * Page for managing notification preferences
 */

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings, Bell, Mail, Smartphone, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useNotificationSettings, useUpdateNotificationSettings } from '@/hooks/useNotifications'
import type { NotificationSettings } from '@/types/notification'

export function NotificationSettingsPage() {
  const { t } = useTranslation()

  const { data: settings, isLoading } = useNotificationSettings()
  const updateSettingsMutation = useUpdateNotificationSettings()

  const [localSettings, setLocalSettings] = useState<Partial<NotificationSettings>>({})

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleToggle = (category: 'emailNotifications' | 'pushNotifications' | 'inAppNotifications', key: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category]?.[key],
      },
    }))
  }

  const handleQuietHoursToggle = () => {
    setLocalSettings((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled: !prev.quietHours?.enabled,
      },
    }))
  }

  const handleQuietHoursTimeChange = (type: 'startTime' | 'endTime', value: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [type]: value,
      },
    }))
  }

  const handleSave = () => {
    updateSettingsMutation.mutate(localSettings)
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettings)

  return (
    <>
      <Header fixed>
        <div className="flex items-center justify-between flex-1 gap-4">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t('notifications.settings.title', 'Notification Settings')}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('notifications.settings.description', 'Manage your notification preferences')}
              </p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={!hasChanges || updateSettingsMutation.isPending}>
            {updateSettingsMutation.isPending
              ? t('common.saving', 'Saving...')
              : t('common.save', 'Save Changes')}
          </Button>
        </div>
      </Header>

      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Backend Pending Alert */}
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>[BACKEND-PENDING]</strong>{' '}
                {t('notifications.settings.backendPendingWarning',
                  'Notification settings are currently stored locally. Server synchronization will be available soon.'
                )}{' '}
                |{' '}
                {t('notifications.settings.backendPendingWarningAr',
                  'يتم حفظ إعدادات الإشعارات محلياً حالياً. ستتوفر المزامنة مع الخادم قريباً.'
                )}
              </AlertDescription>
            </Alert>
          </>
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <CardTitle>{t('notifications.settings.email.title', 'Email Notifications')}</CardTitle>
                </div>
                <CardDescription>
                  {t('notifications.settings.email.description', 'Receive notifications via email')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'invoiceApproval', label: 'Invoice approvals' },
                  { key: 'timeEntryApproval', label: 'Time entry approvals' },
                  { key: 'expenseApproval', label: 'Expense approvals' },
                  { key: 'paymentReceived', label: 'Payment received' },
                  { key: 'invoiceOverdue', label: 'Invoice overdue' },
                  { key: 'budgetAlert', label: 'Budget alerts' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`email-${key}`} className="cursor-pointer">
                      {t(`notifications.settings.email.${key}`, label)}
                    </Label>
                    <Switch
                      id={`email-${key}`}
                      checked={localSettings.emailNotifications?.[key] ?? false}
                      onCheckedChange={() => handleToggle('emailNotifications', key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <CardTitle>{t('notifications.settings.push.title', 'Push Notifications')}</CardTitle>
                </div>
                <CardDescription>
                  {t('notifications.settings.push.description', 'Receive push notifications on your device')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'invoiceApproval', label: 'Invoice approvals' },
                  { key: 'timeEntryApproval', label: 'Time entry approvals' },
                  { key: 'expenseApproval', label: 'Expense approvals' },
                  { key: 'paymentReceived', label: 'Payment received' },
                  { key: 'invoiceOverdue', label: 'Invoice overdue' },
                  { key: 'budgetAlert', label: 'Budget alerts' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`push-${key}`} className="cursor-pointer">
                      {t(`notifications.settings.push.${key}`, label)}
                    </Label>
                    <Switch
                      id={`push-${key}`}
                      checked={localSettings.pushNotifications?.[key] ?? false}
                      onCheckedChange={() => handleToggle('pushNotifications', key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* In-App Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <CardTitle>{t('notifications.settings.inApp.title', 'In-App Notifications')}</CardTitle>
                </div>
                <CardDescription>
                  {t('notifications.settings.inApp.description', 'Receive notifications within the application')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'invoiceApproval', label: 'Invoice approvals' },
                  { key: 'timeEntryApproval', label: 'Time entry approvals' },
                  { key: 'expenseApproval', label: 'Expense approvals' },
                  { key: 'paymentReceived', label: 'Payment received' },
                  { key: 'invoiceOverdue', label: 'Invoice overdue' },
                  { key: 'budgetAlert', label: 'Budget alerts' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`inApp-${key}`} className="cursor-pointer">
                      {t(`notifications.settings.inApp.${key}`, label)}
                    </Label>
                    <Switch
                      id={`inApp-${key}`}
                      checked={localSettings.inAppNotifications?.[key] ?? false}
                      onCheckedChange={() => handleToggle('inAppNotifications', key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <CardTitle>{t('notifications.settings.quietHours.title', 'Quiet Hours')}</CardTitle>
                </div>
                <CardDescription>
                  {t(
                    'notifications.settings.quietHours.description',
                    'Pause notifications during specific hours'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours-enabled" className="cursor-pointer">
                    {t('notifications.settings.quietHours.enabled', 'Enable quiet hours')}
                  </Label>
                  <Switch
                    id="quiet-hours-enabled"
                    checked={localSettings.quietHours?.enabled ?? false}
                    onCheckedChange={handleQuietHoursToggle}
                  />
                </div>

                {localSettings.quietHours?.enabled && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-time">
                          {t('notifications.settings.quietHours.startTime', 'Start time')}
                        </Label>
                        <Select
                          value={localSettings.quietHours?.startTime ?? '22:00'}
                          onValueChange={(v) => handleQuietHoursTimeChange('startTime', v)}
                        >
                          <SelectTrigger id="start-time">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0')
                              return (
                                <SelectItem key={hour} value={`${hour}:00`}>
                                  {hour}:00
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end-time">
                          {t('notifications.settings.quietHours.endTime', 'End time')}
                        </Label>
                        <Select
                          value={localSettings.quietHours?.endTime ?? '08:00'}
                          onValueChange={(v) => handleQuietHoursTimeChange('endTime', v)}
                        >
                          <SelectTrigger id="end-time">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0')
                              return (
                                <SelectItem key={hour} value={`${hour}:00`}>
                                  {hour}:00
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  )
}

export default NotificationSettingsPage

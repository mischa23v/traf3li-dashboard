/**
 * Push Notification Settings Component
 * Allows users to enable/disable push notifications
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, BellOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
  showTestNotification,
} from '@/lib/push-notifications'

type PushStatus = 'loading' | 'unsupported' | 'denied' | 'prompt' | 'enabled' | 'disabled'

export function PushNotificationSettings() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<PushStatus>('loading')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check push notification status on mount
  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setStatus('loading')
    setError(null)

    // Check if push is supported
    if (!isPushSupported()) {
      setStatus('unsupported')
      return
    }

    // Check permission
    const permission = getNotificationPermission()

    if (permission === 'denied') {
      setStatus('denied')
      return
    }

    if (permission === 'default') {
      setStatus('prompt')
      return
    }

    // Check if subscribed
    const subscribed = await isSubscribedToPush()
    setStatus(subscribed ? 'enabled' : 'disabled')
  }

  const handleToggle = async (enabled: boolean) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (enabled) {
        const subscription = await subscribeToPush()
        if (subscription) {
          setStatus('enabled')
          setSuccess(t('pushSettings.enabledSuccess', 'Push notifications enabled'))
        } else {
          const permission = getNotificationPermission()
          if (permission === 'denied') {
            setStatus('denied')
            setError(t('pushSettings.permissionDenied', 'Permission denied. Please enable in browser settings.'))
          } else {
            setError(t('pushSettings.enableFailed', 'Failed to enable push notifications'))
          }
        }
      } else {
        const unsubscribed = await unsubscribeFromPush()
        if (unsubscribed) {
          setStatus('disabled')
          setSuccess(t('pushSettings.disabledSuccess', 'Push notifications disabled'))
        } else {
          setError(t('pushSettings.disableFailed', 'Failed to disable push notifications'))
        }
      }
    } catch (err: any) {
      setError(err.message || t('pushSettings.error', 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await showTestNotification()
      setSuccess(t('pushSettings.testSent', 'Test notification sent'))
    } catch (err: any) {
      setError(t('pushSettings.testFailed', 'Failed to send test notification'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnable = async () => {
    await handleToggle(true)
  }

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-500" />
          <CardTitle className="text-lg">
            {t('pushSettings.title', 'Push Notifications')}
          </CardTitle>
        </div>
        <CardDescription>
          {t('pushSettings.description', 'Receive notifications even when you\'re not using the app')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {status === 'loading' && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        )}

        {/* Unsupported Browser */}
        {status === 'unsupported' && (
          <Alert>
            <BellOff className="h-4 w-4" />
            <AlertDescription>
              {t('pushSettings.unsupported', 'Push notifications are not supported in this browser')}
            </AlertDescription>
          </Alert>
        )}

        {/* Permission Denied */}
        {status === 'denied' && (
          <Alert variant="destructive">
            <BellOff className="h-4 w-4" />
            <AlertDescription>
              {t('pushSettings.denied', 'Push notifications are blocked. Please enable them in your browser settings.')}
            </AlertDescription>
          </Alert>
        )}

        {/* Request Permission */}
        {status === 'prompt' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <Bell className="w-12 h-12 text-slate-300" />
            <p className="text-sm text-slate-500 text-center">
              {t('pushSettings.promptDescription', 'Enable push notifications to stay updated')}
            </p>
            <Button onClick={handleEnable} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
              ) : (
                <Bell className="w-4 h-4 me-2" />
              )}
              {t('pushSettings.enable', 'Enable Notifications')}
            </Button>
          </div>
        )}

        {/* Enabled/Disabled Toggle */}
        {(status === 'enabled' || status === 'disabled') && (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-toggle" className="font-medium">
                  {t('pushSettings.toggleLabel', 'Push Notifications')}
                </Label>
                <p className="text-sm text-slate-500">
                  {status === 'enabled'
                    ? t('pushSettings.statusEnabled', 'Notifications are enabled')
                    : t('pushSettings.statusDisabled', 'Notifications are disabled')}
                </p>
              </div>
              <Switch
                id="push-toggle"
                checked={status === 'enabled'}
                onCheckedChange={handleToggle}
                disabled={isLoading}
              />
            </div>

            {/* Test Notification Button */}
            {status === 'enabled' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4 me-2" />
                )}
                {t('pushSettings.testButton', 'Send Test Notification')}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default PushNotificationSettings

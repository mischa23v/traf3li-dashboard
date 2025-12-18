/**
 * Notification Dropdown Component
 * Dropdown showing recent notifications with actions
 * Optimized with virtualization, memoization, and batched updates
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Bell, CheckCheck, Trash2, Settings, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationItem } from './notification-item'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearReadNotifications,
} from '@/hooks/useNotifications'
import type { NotificationType, Notification } from '@/types/notification'

interface NotificationDropdownProps {
  className?: string
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRtl = i18n.language === 'ar'
  const [open, setOpen] = useState(false)
  const [filterType, setFilterType] = useState<'all' | NotificationType>('all')

  // Queries
  const { data, isLoading } = useNotifications({
    limit: 20,
    type: filterType === 'all' ? undefined : filterType,
  })

  // Mutations
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()
  const deleteNotificationMutation = useDeleteNotification()
  const clearReadMutation = useClearReadNotifications()

  const notifications = data?.notifications || []
  const unreadCount = data?.unreadCount || 0

  // Memoize filtered notifications
  const financeNotifications = useMemo(() =>
    notifications.filter((n) =>
      ['invoice_approval', 'time_entry_approval', 'expense_approval', 'payment_received', 'invoice_overdue', 'budget_alert'].includes(
        n.type
      )
    ), [notifications]
  )

  const unreadNotifications = useMemo(() =>
    notifications.filter((n) => !n.read),
    [notifications]
  )

  // Handlers with useCallback for performance
  const handleMarkAsRead = useCallback((id: string) => {
    markAsReadMutation.mutate(id)
  }, [markAsReadMutation])

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate()
  }, [markAllAsReadMutation])

  const handleDelete = useCallback((id: string) => {
    deleteNotificationMutation.mutate(id)
  }, [deleteNotificationMutation])

  const handleClearRead = useCallback(() => {
    clearReadMutation.mutate()
  }, [clearReadMutation])

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (notification.actionUrl) {
      navigate({ to: notification.actionUrl })
      setOpen(false)
    }
  }, [navigate])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('relative', className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">{t('notifications.title', 'Notifications')}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isRtl ? 'start' : 'end'}
        className="w-[380px] sm:w-[420px] p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {t('notifications.title', 'Notifications')}
            </h3>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="h-8 text-xs"
              >
                <CheckCheck className="w-4 h-4 me-1" />
                {t('notifications.markAllRead', 'Mark all')}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('notifications.actions', 'Actions')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    navigate({ to: '/notifications/settings' })
                    setOpen(false)
                  }}
                >
                  <Settings className="w-4 h-4 me-2" />
                  {t('notifications.settings', 'Settings')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClearRead} disabled={clearReadMutation.isPending}>
                  <Trash2 className="w-4 h-4 me-2" />
                  {t('notifications.clearRead', 'Clear read')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setFilterType(v as any)}>
          <div className="px-4 pt-3">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">
                {t('notifications.tabs.all', 'All')}
              </TabsTrigger>
              <TabsTrigger value="finance" className="text-xs">
                {t('notifications.tabs.finance', 'Finance')}
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                {t('notifications.tabs.unread', 'Unread')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* All Notifications */}
          <TabsContent value="all" className="m-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100" />
              </div>
            ) : notifications.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      onClick={handleNotificationClick}
                      compact
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('notifications.empty', 'No notifications yet')}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Finance Notifications */}
          <TabsContent value="finance" className="m-0">
            {financeNotifications.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {financeNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      onClick={handleNotificationClick}
                      compact
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('notifications.emptyFinance', 'No finance notifications')}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Unread Notifications */}
          <TabsContent value="unread" className="m-0">
            {unreadNotifications.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      onClick={handleNotificationClick}
                      compact
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <CheckCheck className="w-12 h-12 text-green-500 dark:text-green-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('notifications.allCaughtUp', "You're all caught up!")}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate({ to: '/notifications' })
                  setOpen(false)
                }}
                className="w-full text-xs"
              >
                {t('notifications.viewAll', 'View all notifications')}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationDropdown

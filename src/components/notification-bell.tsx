/**
 * Notification Bell Component
 * Displays notification icon with unread count and dropdown
 * Optimized with virtualization and memoization
 */

import { useState, memo, useCallback, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { FixedSizeList as VirtualList } from 'react-window'
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useNotifications, Notification } from '@/context/socket-provider'

// Virtualization constants
const BELL_ITEM_HEIGHT = 90
const BELL_LIST_HEIGHT = 300

// Notification type icons
const notificationIcons: Record<string, string> = {
  task_reminder: '📋',
  hearing_reminder: '⚖️',
  case_update: '📁',
  message: '💬',
  payment: '💰',
  general: '🔔',
}

// Notification type colors
const notificationColors: Record<string, string> = {
  task_reminder: 'bg-blue-100 text-blue-800',
  hearing_reminder: 'bg-purple-100 text-purple-800',
  case_update: 'bg-green-100 text-green-800',
  message: 'bg-amber-100 text-amber-800',
  payment: 'bg-emerald-100 text-emerald-800',
  general: 'bg-slate-100 text-slate-800',
}

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onClick: (notification: Notification) => void
}

const NotificationItem = memo(function NotificationItem({ notification, onRead, onClick }: NotificationItemProps) {
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const locale = isRtl ? ar : enUS

  // Memoize computed values for performance
  const { title, message, timeAgo } = useMemo(() => {
    const computedTitle = isRtl && notification.titleAr ? notification.titleAr : notification.title
    const computedMessage = isRtl && notification.messageAr ? notification.messageAr : notification.message
    const computedTimeAgo = formatDistanceToNow(new Date(notification.createdAt), {
      addSuffix: true,
      locale,
    })

    return { title: computedTitle, message: computedMessage, timeAgo: computedTimeAgo }
  }, [notification.titleAr, notification.title, notification.messageAr, notification.message, notification.createdAt, isRtl, locale])

  const handleClick = useCallback(() => {
    if (!notification.read) onRead(notification._id)
    onClick(notification)
  }, [notification, onRead, onClick])

  return (
    <div
      className={cn(
        'p-3 hover:bg-slate-50 transition-colors cursor-pointer',
        !notification.read && 'bg-blue-50/50'
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg',
            notificationColors[notification.type] || notificationColors.general
          )}
        >
          {notification.icon || notificationIcons[notification.type] || notificationIcons.general}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn('text-sm font-medium text-slate-900 line-clamp-1', !notification.read && 'font-semibold')}>
              {title}
            </p>
            {!notification.read && (
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
            )}
          </div>
          <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">{message}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500">{timeAgo}</span>
            {notification.link && (
              <ExternalLink className="w-3 h-3 text-slate-500" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export function NotificationBell() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [open, setOpen] = useState(false)

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications()

  // Memoize limited notifications list for better performance
  const displayNotifications = useMemo(() => notifications.slice(0, 20), [notifications])

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (notification.link) {
      navigate({ to: notification.link })
      setOpen(false)
    }
  }, [navigate])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t('notifications.bell', 'Notifications')}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -end-1 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 sm:w-96 p-0"
        align={isRtl ? 'start' : 'end'}
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-slate-900">
            {t('notifications.title', 'Notifications')}
          </h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 text-xs"
              >
                <CheckCheck className="w-4 h-4 me-1" />
                {t('notifications.markAllRead', 'Mark all read')}
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List - Virtualized for performance */}
        {displayNotifications.length > 0 ? (
          <VirtualList
            height={BELL_LIST_HEIGHT}
            itemCount={displayNotifications.length}
            itemSize={BELL_ITEM_HEIGHT}
            width="100%"
            className="scrollbar-thin"
          >
            {({ index, style }) => {
              const notification = displayNotifications[index]
              return (
                <div style={style} key={notification._id}>
                  <NotificationItem
                    notification={notification}
                    onRead={markAsRead}
                    onClick={handleNotificationClick}
                  />
                </div>
              )
            }}
          </VirtualList>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">
              {t('notifications.empty', 'No notifications yet')}
            </p>
          </div>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate({ to: '/notifications' })
                  setOpen(false)
                }}
                className="text-xs"
              >
                {t('notifications.viewAll', 'View all')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                className="text-xs text-slate-500 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3 me-1" />
                {t('notifications.clear', 'Clear')}
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default NotificationBell

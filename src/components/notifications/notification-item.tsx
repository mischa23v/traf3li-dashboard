/**
 * Notification Item Component
 * Displays a single notification with actions
 */

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Notification, NotificationType, NotificationPriority } from '@/types/notification'

// Notification type icons
const notificationIcons: Record<NotificationType, React.ReactNode> = {
  invoice_approval: <FileText className="w-5 h-5" />,
  time_entry_approval: <Clock className="w-5 h-5" />,
  expense_approval: <DollarSign className="w-5 h-5" />,
  payment_received: <CheckCircle className="w-5 h-5" />,
  invoice_overdue: <AlertCircle className="w-5 h-5" />,
  budget_alert: <TrendingUp className="w-5 h-5" />,
  system: <Bell className="w-5 h-5" />,
  task_reminder: <Clock className="w-5 h-5" />,
  hearing_reminder: <AlertCircle className="w-5 h-5" />,
  case_update: <FileText className="w-5 h-5" />,
  message: <Bell className="w-5 h-5" />,
  general: <Bell className="w-5 h-5" />,
}

// Notification type colors
const notificationColors: Record<NotificationType, string> = {
  invoice_approval: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  time_entry_approval: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  expense_approval: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  payment_received: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  invoice_overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  budget_alert: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  system: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  task_reminder: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  hearing_reminder: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  case_update: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  message: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  general: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
}

// Priority colors
const priorityColors: Record<NotificationPriority, string> = {
  low: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  onDelete?: (id: string) => void
  onClick?: (notification: Notification) => void
  showActions?: boolean
  compact?: boolean
}

export const NotificationItem = memo(function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
  showActions = true,
  compact = false,
}: NotificationItemProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRtl = i18n.language === 'ar'
  const locale = isRtl ? ar : enUS

  const title = isRtl && notification.titleAr ? notification.titleAr : notification.title
  const message = isRtl && notification.messageAr ? notification.messageAr : notification.message
  const actionLabel =
    isRtl && notification.actionLabelAr ? notification.actionLabelAr : notification.actionLabel

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale,
  })

  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification._id)
    }

    if (notification.actionUrl) {
      navigate({ to: notification.actionUrl })
    }

    onClick?.(notification)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(notification._id)
  }

  return (
    <div
      className={cn(
        'group relative p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer border-b last:border-b-0',
        !notification.read && 'bg-blue-50/30 dark:bg-blue-950/20',
        compact && 'p-3'
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            notificationColors[notification.type],
            compact && 'w-8 h-8'
          )}
        >
          {notificationIcons[notification.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p
                  className={cn(
                    'text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1',
                    !notification.read && 'font-semibold'
                  )}
                >
                  {title}
                </p>
                {notification.priority !== 'normal' && (
                  <Badge variant="outline" className={cn('text-xs', priorityColors[notification.priority])}>
                    {t(`notifications.priority.${notification.priority}`, notification.priority)}
                  </Badge>
                )}
              </div>
            </div>

            {!notification.read && (
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" aria-label={t('notifications.unread', 'Unread')} />
            )}
          </div>

          <p className={cn('text-sm text-slate-600 dark:text-slate-400 line-clamp-2', compact && 'line-clamp-1')}>
            {message}
          </p>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-500">{timeAgo}</span>

            {notification.actionUrl && actionLabel && (
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600 dark:text-blue-400">
                {actionLabel}
                <ExternalLink className="w-3 h-3 ms-1" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div
          className={cn(
            'absolute top-2 end-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
            isRtl && 'flex-row-reverse'
          )}
        >
          {!notification.read && onMarkAsRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                onMarkAsRead(notification._id)
              }}
              aria-label={t('notifications.markAsRead', 'Mark as read')}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleDelete}
              aria-label={t('notifications.delete', 'Delete')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
})

export default NotificationItem

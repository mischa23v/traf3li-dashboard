/**
 * Chatter Thread Component
 * Displays message list with timestamps, authors, notes, messages, and field tracking
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { format, formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import {
  MessageSquare,
  StickyNote,
  Bell,
  Star,
  Paperclip,
  MoreHorizontal,
  Trash2,
  Edit2,
  FileText,
  Download,
  Activity as ActivityIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import type { ThreadMessage, TrackingValue } from '@/types/message'
import { renderMentions } from '@/types/message'

interface ChatterThreadProps {
  messages: ThreadMessage[]
  isLoading?: boolean
  maxHeight?: number
  onToggleStar?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, body: string) => void
  className?: string
}

export function ChatterThread({
  messages,
  isLoading = false,
  maxHeight = 500,
  onToggleStar,
  onDelete,
  onEdit,
  className,
}: ChatterThreadProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  if (isLoading) {
    return (
      <div className={cn('space-y-4 p-4', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-12', className)}>
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          {t('common.noMessagesYet')}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {t('common.startConversation')}
        </p>
      </div>
    )
  }

  return (
    <ScrollArea style={{ height: maxHeight }} className={cn('', className)}>
      <div className="divide-y">
        {messages.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            isArabic={isArabic}
            onToggleStar={onToggleStar}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

// ==================== MESSAGE ITEM ====================

interface MessageItemProps {
  message: ThreadMessage
  isArabic: boolean
  onToggleStar?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, body: string) => void
}

function MessageItem({ message, isArabic, onToggleStar, onDelete, onEdit }: MessageItemProps) {
  const author = typeof message.author_id === 'object' ? message.author_id : null

  const getMessageIcon = () => {
    switch (message.message_type) {
      case 'notification':
        return <Bell className="h-4 w-4" />
      case 'activity_done':
        return <ActivityIcon className="h-4 w-4" />
      case 'stage_change':
        return <ActivityIcon className="h-4 w-4" />
      case 'auto_log':
        return <FileText className="h-4 w-4" />
      default:
        return message.is_internal ? <StickyNote className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />
    }
  }

  const { t: messageT } = useTranslation()

  const getMessageTypeLabel = () => {
    switch (message.message_type) {
      case 'notification':
        return messageT('common.notification')
      case 'activity_done':
        return messageT('common.activityDone')
      case 'stage_change':
        return messageT('common.stageChange')
      case 'auto_log':
        return messageT('common.autoLog')
      default:
        return null
    }
  }

  const typeLabel = getMessageTypeLabel()

  return (
    <div
      className={cn(
        'p-4 hover:bg-accent/50 transition-colors',
        message.is_internal &&
          'bg-yellow-50/50 dark:bg-yellow-950/20 border-s-4 border-yellow-400'
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-9 w-9 flex-shrink-0">
          {author && (
            <>
              <AvatarImage src={author.avatar} alt={`${author.firstName} ${author.lastName}`} />
              <AvatarFallback>
                {author.firstName?.[0]}
                {author.lastName?.[0]}
              </AvatarFallback>
            </>
          )}
          {!author && (
            <AvatarFallback>
              <FileText className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {author
                  ? `${author.firstName} ${author.lastName}`
                  : messageT('common.system')}
              </span>

              {message.is_internal && (
                <Badge variant="outline" className="text-xs bg-yellow-100 border-yellow-300">
                  <StickyNote className="h-3 w-3 me-1" />
                  {messageT('common.internal')}
                </Badge>
              )}

              {typeLabel && (
                <Badge variant="secondary" className="text-xs">
                  {getMessageIcon()}
                  <span className="ms-1">{typeLabel}</span>
                </Badge>
              )}

              {message.is_starred && (
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                  locale: isArabic ? ar : enUS,
                })}
              </span>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onToggleStar && (
                    <DropdownMenuItem onClick={() => onToggleStar(message._id)}>
                      <Star
                        className={cn(
                          'h-4 w-4 me-2',
                          message.is_starred && 'fill-yellow-400 text-yellow-400'
                        )}
                      />
                      {message.is_starred
                        ? messageT('common.unstar')
                        : messageT('common.star')}
                    </DropdownMenuItem>
                  )}
                  {onEdit && !message.is_internal && message.message_type === 'comment' && (
                    <DropdownMenuItem onClick={() => onEdit(message._id, message.body)}>
                      <Edit2 className="h-4 w-4 me-2" />
                      {messageT('common.edit')}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(message._id)}
                    >
                      <Trash2 className="h-4 w-4 me-2" />
                      {messageT('common.delete')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Subject (if present) */}
          {message.subject && (
            <div className="font-medium text-sm mb-1">{message.subject}</div>
          )}

          {/* Message Body */}
          {message.body && (
            <div
              className="prose prose-sm max-w-none dark:prose-invert text-sm"
              dangerouslySetInnerHTML={{ __html: renderMentions(message.body) }}
            />
          )}

          {/* Tracking Values (Field Changes) */}
          {message.tracking_value_ids && message.tracking_value_ids.length > 0 && (
            <div className="mt-3 space-y-1.5 bg-muted/50 rounded-md p-3">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                {messageT('common.changes')}:
              </div>
              {message.tracking_value_ids.map((tracking, idx) => (
                <TrackingItem key={idx} tracking={tracking} isArabic={isArabic} />
              ))}
            </div>
          )}

          {/* Attachments */}
          {message.attachment_ids && message.attachment_ids.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.attachment_ids.map((attachment) => (
                <AttachmentItem
                  key={typeof attachment === 'string' ? attachment : attachment._id}
                  attachment={attachment}
                  isArabic={isArabic}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== TRACKING ITEM ====================

interface TrackingItemProps {
  tracking: TrackingValue
  isArabic: boolean
}

function TrackingItem({ tracking, isArabic }: TrackingItemProps) {
  const { t: trackingT } = useTranslation()

  const getDisplayValue = (
    type: string,
    char?: string,
    int?: number,
    float?: number,
    datetime?: string,
    bool?: boolean
  ): string => {
    if (char !== undefined) return char
    if (int !== undefined) return String(int)
    if (float !== undefined) return String(float)
    if (datetime !== undefined) {
      return format(new Date(datetime), 'PPp', { locale: isArabic ? ar : enUS })
    }
    if (bool !== undefined) return bool ? trackingT('common.yes') : trackingT('common.no')
    return '-'
  }

  const oldValue = getDisplayValue(
    tracking.field_type,
    tracking.old_value_char,
    tracking.old_value_integer,
    tracking.old_value_float,
    tracking.old_value_datetime,
    tracking.old_value_boolean
  )

  const newValue = getDisplayValue(
    tracking.field_type,
    tracking.new_value_char,
    tracking.new_value_integer,
    tracking.new_value_float,
    tracking.new_value_datetime,
    tracking.new_value_boolean
  )

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-medium text-foreground">
        {isArabic && tracking.field_desc_ar ? tracking.field_desc_ar : tracking.field_desc}:
      </span>
      <span className="text-red-600 line-through">{oldValue}</span>
      <span className="text-muted-foreground">→</span>
      <span className="text-green-600 font-medium">{newValue}</span>
    </div>
  )
}

// ==================== ATTACHMENT ITEM ====================

interface AttachmentItemProps {
  attachment: any
  isArabic: boolean
}

function AttachmentItem({ attachment, isArabic }: AttachmentItemProps) {
  const { t: attachT } = useTranslation()

  if (typeof attachment === 'string') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-xs">
        <Paperclip className="h-3 w-3" />
        <span>{attachT('common.attachment')}</span>
      </div>
    )
  }

  const handleDownload = () => {
    if (attachment.url) {
      window.open(attachment.url, '_blank', 'noopener,noreferrer')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md text-xs cursor-pointer transition-colors group"
      onClick={handleDownload}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleDownload()
      }}
    >
      <Paperclip className="h-3 w-3 text-muted-foreground" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-medium text-foreground truncate">{attachment.name}</span>
        {attachment.size && (
          <span className="text-muted-foreground">{formatFileSize(attachment.size)}</span>
        )}
      </div>
      <Download className="h-3 w-3 ms-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

export default ChatterThread

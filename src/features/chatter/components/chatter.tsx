/**
 * Chatter Component
 * Main component for threaded discussions on any record
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { format, formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import DOMPurify from 'dompurify'
import {
  MessageSquare,
  StickyNote,
  Send,
  Star,
  Paperclip,
  Loader2,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useRecordThread,
  useCreateMessage,
  useCreateNote,
  useToggleMessageStar,
  useDeleteMessage,
} from '@/hooks/useMessages'
import type { ThreadMessage, ThreadResModel, TrackingValue } from '@/types/message'
import { renderMentions } from '@/types/message'

interface ChatterProps {
  resModel: ThreadResModel
  resId: string
  className?: string
  maxHeight?: number
}

export function Chatter({ resModel, resId, className, maxHeight = 400 }: ChatterProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [activeTab, setActiveTab] = React.useState<'messages' | 'activities'>('messages')
  const [message, setMessage] = React.useState('')
  const [isInternal, setIsInternal] = React.useState(false)

  const { data: thread, isLoading } = useRecordThread(resModel, resId)
  const createMessage = useCreateMessage()
  const createNote = useCreateNote()
  const toggleStar = useToggleMessageStar()
  const deleteMessage = useDeleteMessage()

  const handleSend = async () => {
    if (!message.trim()) return

    try {
      if (isInternal) {
        await createNote.mutateAsync({
          res_model: resModel,
          res_id: resId,
          body: message,
        })
      } else {
        await createMessage.mutateAsync({
          res_model: resModel,
          res_id: resId,
          body: message,
          is_internal: false,
        })
      }
      setMessage('')
    } catch {
      // Error handled by mutation
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend()
    }
  }

  const allMessages = React.useMemo(() => {
    if (!thread) return []
    return [
      ...(thread.comments || []),
      ...(thread.notes || []),
      ...(thread.notifications || []),
      ...(thread.tracking || []),
    ].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [thread])

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'messages' | 'activities')}>
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="messages"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <MessageSquare className="h-4 w-4 me-2" />
            {isArabic ? 'الرسائل' : 'Messages'}
            {allMessages.length > 0 && (
              <Badge variant="secondary" className="ms-2">
                {allMessages.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="activities"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <StickyNote className="h-4 w-4 me-2" />
            {isArabic ? 'الأنشطة' : 'Activities'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-0">
          {/* Message Composer */}
          <div className="p-4 border-b">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isArabic
                  ? isInternal
                    ? 'اكتب ملاحظة داخلية...'
                    : 'اكتب رسالة...'
                  : isInternal
                  ? 'Write an internal note...'
                  : 'Write a message...'
              }
              className="min-h-[80px] resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={isInternal ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setIsInternal(!isInternal)}
                  className={cn(
                    isInternal && 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  )}
                >
                  <StickyNote className="h-4 w-4 me-1" />
                  {isArabic ? 'ملاحظة داخلية' : 'Internal Note'}
                </Button>
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!message.trim() || createMessage.isPending || createNote.isPending}
              >
                {(createMessage.isPending || createNote.isPending) && (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                )}
                <Send className="h-4 w-4 me-2" />
                {isArabic ? 'إرسال' : 'Send'}
              </Button>
            </div>
          </div>

          {/* Message List */}
          <ScrollArea style={{ height: maxHeight }}>
            <div className="divide-y">
              {allMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mb-2" />
                  <p className="text-sm">
                    {isArabic ? 'لا توجد رسائل' : 'No messages yet'}
                  </p>
                </div>
              ) : (
                allMessages.map((msg) => (
                  <MessageItem
                    key={msg._id}
                    message={msg}
                    isArabic={isArabic}
                    onToggleStar={() => toggleStar.mutate(msg._id)}
                    onDelete={() => deleteMessage.mutate(msg._id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="activities" className="mt-0 p-4">
          <div className="text-center text-muted-foreground">
            {isArabic
              ? 'استخدم مكون الأنشطة المنفصل لإدارة الأنشطة'
              : 'Use the separate Activities component to manage activities'}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Message Item Component
interface MessageItemProps {
  message: ThreadMessage
  isArabic: boolean
  onToggleStar: () => void
  onDelete: () => void
}

function MessageItem({ message, isArabic, onToggleStar, onDelete }: MessageItemProps) {
  const author = typeof message.author_id === 'object' ? message.author_id : null

  const getMessageTypeLabel = () => {
    switch (message.message_type) {
      case 'notification':
        return isArabic ? 'إشعار' : 'Notification'
      case 'activity_done':
        return isArabic ? 'نشاط مكتمل' : 'Activity Done'
      case 'stage_change':
        return isArabic ? 'تغيير مرحلة' : 'Stage Change'
      case 'auto_log':
        return isArabic ? 'تسجيل تلقائي' : 'Auto Log'
      default:
        return null
    }
  }

  const typeLabel = getMessageTypeLabel()

  return (
    <div
      className={cn(
        'p-4 hover:bg-accent/50 transition-colors',
        message.is_internal && 'bg-yellow-50/50 dark:bg-yellow-950/20 border-s-4 border-yellow-400'
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          {author && (
            <>
              <AvatarImage src={author.avatar} />
              <AvatarFallback>
                {author.firstName?.[0]}
                {author.lastName?.[0]}
              </AvatarFallback>
            </>
          )}
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {author ? `${author.firstName} ${author.lastName}` : isArabic ? 'نظام' : 'System'}
              </span>
              {message.is_internal && (
                <Badge variant="outline" className="text-xs bg-yellow-100 border-yellow-300">
                  {isArabic ? 'داخلي' : 'Internal'}
                </Badge>
              )}
              {typeLabel && (
                <Badge variant="secondary" className="text-xs">
                  {typeLabel}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                  locale: isArabic ? ar : enUS,
                })}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onToggleStar}>
                    <Star
                      className={cn(
                        'h-4 w-4 me-2',
                        message.is_starred && 'fill-yellow-400 text-yellow-400'
                      )}
                    />
                    {message.is_starred
                      ? isArabic
                        ? 'إزالة من المميزة'
                        : 'Unstar'
                      : isArabic
                      ? 'تمييز'
                      : 'Star'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 me-2" />
                    {isArabic ? 'حذف' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Body */}
          {message.body && (
            <div
              className="mt-1 text-sm prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMentions(message.body)) }}
            />
          )}

          {/* Tracking Values */}
          {message.tracking_value_ids && message.tracking_value_ids.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.tracking_value_ids.map((tracking, idx) => (
                <TrackingItem
                  key={idx}
                  tracking={tracking}
                  isArabic={isArabic}
                />
              ))}
            </div>
          )}

          {/* Attachments */}
          {message.attachment_ids && message.attachment_ids.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.attachment_ids.map((attachment) => (
                <span
                  key={typeof attachment === 'string' ? attachment : attachment._id}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline cursor-pointer"
                  onClick={() => {
                    if (typeof attachment === 'object' && attachment.url) {
                      window.open(attachment.url, '_blank', 'noopener,noreferrer')
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && typeof attachment === 'object' && attachment.url) {
                      window.open(attachment.url, '_blank', 'noopener,noreferrer')
                    }
                  }}
                >
                  <Paperclip className="h-3 w-3" />
                  {typeof attachment === 'object' ? attachment.name : isArabic ? 'مرفق' : 'Attachment'}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Tracking Item Component
interface TrackingItemProps {
  tracking: TrackingValue
  isArabic: boolean
}

function TrackingItem({ tracking, isArabic }: TrackingItemProps) {
  const getDisplayValue = (
    _type: string,
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
    if (bool !== undefined) return bool ? (isArabic ? 'نعم' : 'Yes') : (isArabic ? 'لا' : 'No')
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
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="font-medium">
        {isArabic && tracking.field_desc_ar ? tracking.field_desc_ar : tracking.field_desc}:
      </span>
      <span className="text-red-500 line-through">{oldValue}</span>
      <span>→</span>
      <span className="text-green-600">{newValue}</span>
    </div>
  )
}

export default Chatter

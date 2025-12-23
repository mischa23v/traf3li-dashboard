/**
 * Chatter Input Component
 * Rich text input for messages with "Log Note" and "Send Message" toggle
 * Includes attachment upload and @mention support
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  MessageSquare,
  StickyNote,
  Send,
  Paperclip,
  X,
  Loader2,
  AtSign,
  FileText,
  Image,
  File,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import TipTapEditor from '@/components/tiptap-editor'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ThreadResModel } from '@/types/message'
import { validateFile, FILE_TYPES, SIZE_LIMITS } from '@/lib/file-validation'
import { toast } from 'sonner'

interface ChatterInputProps {
  resModel: ThreadResModel
  resId: string
  onSendMessage: (body: string, isInternal: boolean, attachments?: File[]) => Promise<void>
  isLoading?: boolean
  mentionSuggestions?: MentionUser[]
  onSearchMentions?: (query: string) => void
  className?: string
}

export interface MentionUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
}

export function ChatterInput({
  resModel,
  resId,
  onSendMessage,
  isLoading = false,
  mentionSuggestions = [],
  onSearchMentions,
  className,
}: ChatterInputProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [isInternal, setIsInternal] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [messageHtml, setMessageHtml] = React.useState('')
  const [attachments, setAttachments] = React.useState<File[]>([])
  const [showMentions, setShowMentions] = React.useState(false)
  const [mentionQuery, setMentionQuery] = React.useState('')

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Handle message change
  const handleMessageChange = (html: string, json: any) => {
    setMessageHtml(html)

    // Extract plain text for mention detection
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    const plainText = tempDiv.textContent || ''
    setMessage(plainText)

    // Detect @mentions
    const lastAtSymbol = plainText.lastIndexOf('@')
    if (lastAtSymbol !== -1) {
      const queryAfterAt = plainText.substring(lastAtSymbol + 1)
      // Check if there's a space after @
      if (!queryAfterAt.includes(' ')) {
        setMentionQuery(queryAfterAt)
        setShowMentions(true)
        if (onSearchMentions) {
          onSearchMentions(queryAfterAt)
        }
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  // Handle send
  const handleSend = async () => {
    if (!messageHtml.trim() && attachments.length === 0) return

    try {
      await onSendMessage(messageHtml, isInternal, attachments)
      // Clear form on success
      setMessage('')
      setMessageHtml('')
      setAttachments([])
    } catch (error) {
      // Error handled by parent
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to send
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate files
    const allowedTypes = [
      ...FILE_TYPES.IMAGES,
      ...FILE_TYPES.DOCUMENTS,
      ...FILE_TYPES.SPREADSHEETS,
      ...FILE_TYPES.TEXT,
    ]

    const validFiles: File[] = []
    for (const file of files) {
      const validation = validateFile(file, {
        allowedTypes,
        maxSize: SIZE_LIMITS.ATTACHMENT,
      })

      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.errorAr || validation.error}`)
      } else {
        validFiles.push(file)
      }
    }

    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles])
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle mention selection
  const handleMentionSelect = (user: MentionUser) => {
    // Replace the @query with mention markup
    const mentionMarkup = `@[${user.firstName} ${user.lastName}](user:${user._id})`
    const newMessage = message.substring(0, message.lastIndexOf('@')) + mentionMarkup + ' '

    setMessage(newMessage)
    setMessageHtml(newMessage)
    setShowMentions(false)
    setMentionQuery('')
  }

  // Get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    if (file.type.includes('pdf') || file.type.includes('document')) {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className={cn('border rounded-lg bg-background', className)}>
      {/* Editor */}
      <div onKeyDown={handleKeyDown}>
        <TipTapEditor
          content={messageHtml}
          onChange={handleMessageChange}
          placeholder={
            isArabic
              ? isInternal
                ? 'اكتب ملاحظة داخلية...'
                : 'اكتب رسالة...'
              : isInternal
              ? 'Write an internal note...'
              : 'Write a message...'
          }
          dir={isArabic ? 'rtl' : 'ltr'}
          minHeight="120px"
          className="border-0"
        />
      </div>

      {/* Mention Suggestions */}
      {showMentions && mentionSuggestions.length > 0 && (
        <div className="border-t p-2">
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-1">
              {mentionSuggestions.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  className="w-full flex items-center gap-2 p-2 hover:bg-accent rounded-md text-sm transition-colors"
                  onClick={() => handleMentionSelect(user)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback>
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="border-t p-3">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-xs"
              >
                {getFileIcon(file)}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                  <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="ms-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between p-3 border-t bg-muted/30">
        <div className="flex items-center gap-2">
          {/* Toggle Message Type */}
          <Button
            variant={isInternal ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setIsInternal(!isInternal)}
            className={cn(
              'gap-2',
              isInternal && 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            )}
          >
            {isInternal ? (
              <>
                <StickyNote className="h-4 w-4" />
                {isArabic ? 'ملاحظة داخلية' : 'Log Note'}
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                {isArabic ? 'رسالة' : 'Send Message'}
              </>
            )}
          </Button>

          {/* File Attachment */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
            {attachments.length > 0 && (
              <Badge variant="secondary" className="ms-2">
                {attachments.length}
              </Badge>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />

          {/* Mention Helper */}
          {onSearchMentions && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <AtSign className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {isArabic ? 'الإشارة إلى المستخدمين' : 'Mention Users'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? 'اكتب @ متبوعًا باسم المستخدم للإشارة إليه في رسالتك'
                      : 'Type @ followed by a name to mention someone in your message'}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Send Button */}
        <Button
          size="sm"
          onClick={handleSend}
          disabled={(!messageHtml.trim() && attachments.length === 0) || isLoading}
        >
          {isLoading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
          <Send className="h-4 w-4 me-2" />
          {isArabic ? 'إرسال' : 'Send'}
        </Button>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="px-3 pb-2 text-xs text-muted-foreground">
        {isArabic ? 'نصيحة: اضغط Ctrl+Enter للإرسال' : 'Tip: Press Ctrl+Enter to send'}
      </div>
    </div>
  )
}

export default ChatterInput

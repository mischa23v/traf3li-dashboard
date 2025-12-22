/**
 * Chatter/Message Types
 * Based on Odoo's mail.message model for threaded discussions
 */

// ═══════════════════════════════════════════════════════════════
// MESSAGE TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export type ThreadMessageType =
  | 'comment' // User comment
  | 'notification' // System notification
  | 'email' // Email message
  | 'activity_done' // Activity completion log
  | 'stage_change' // Pipeline stage change
  | 'auto_log' // Automated log entry

export type ThreadResModel =
  | 'Case'
  | 'Client'
  | 'Lead'
  | 'Contact'
  | 'Organization'
  | 'Task'
  | 'Invoice'
  | 'Document'

// ═══════════════════════════════════════════════════════════════
// USER & ATTACHMENT TYPES
// ═══════════════════════════════════════════════════════════════

export interface MessageAuthor {
  _id: string
  firstName: string
  lastName: string
  email?: string
  avatar?: string
}

export interface MessageAttachment {
  _id: string
  name: string
  filename: string
  mimetype: string
  size: number
  url: string
  createdAt: string
}

// ═══════════════════════════════════════════════════════════════
// TRACKING VALUE (Field change tracking)
// ═══════════════════════════════════════════════════════════════

export interface TrackingValue {
  field: string // Field name in database
  field_desc: string // Human-readable field name (English)
  field_desc_ar?: string // Human-readable field name (Arabic)
  field_type: 'char' | 'integer' | 'float' | 'date' | 'datetime' | 'selection' | 'many2one' | 'boolean'
  old_value_char?: string
  new_value_char?: string
  old_value_integer?: number
  new_value_integer?: number
  old_value_float?: number
  new_value_float?: number
  old_value_datetime?: string
  new_value_datetime?: string
  old_value_boolean?: boolean
  new_value_boolean?: boolean
}

// ═══════════════════════════════════════════════════════════════
// THREAD MESSAGE INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface ThreadMessage {
  _id: string
  res_model: ThreadResModel
  res_id: string
  parent_id?: string | ThreadMessage // For nested replies
  message_type: ThreadMessageType
  subtype?: string // e.g., 'mail.mt_note', 'mail.mt_comment'
  subject?: string
  body: string // HTML content
  bodyPlain?: string // Plain text version
  author_id: MessageAuthor | string
  partner_ids: (MessageAuthor | string)[] // Mentioned/notified users
  attachment_ids: MessageAttachment[]
  tracking_value_ids: TrackingValue[]
  is_internal: boolean // Internal note vs public comment
  starred_partner_ids: string[] // Users who starred this message
  is_starred?: boolean // For current user
  email_from?: string
  email_to?: string[]
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE CREATE/UPDATE
// ═══════════════════════════════════════════════════════════════

export interface CreateMessageData {
  res_model: ThreadResModel
  res_id: string
  parent_id?: string
  body: string
  is_internal?: boolean
  attachment_ids?: string[]
  partner_ids?: string[] // Users to mention/notify
  subject?: string
}

export interface CreateNoteData {
  res_model: ThreadResModel
  res_id: string
  body: string
  attachment_ids?: string[]
  partner_ids?: string[]
}

// ═══════════════════════════════════════════════════════════════
// RECORD THREAD (Grouped messages for a record)
// ═══════════════════════════════════════════════════════════════

export interface RecordThread {
  res_model: ThreadResModel
  res_id: string
  res_name?: string
  comments: ThreadMessage[]
  notes: ThreadMessage[]
  notifications: ThreadMessage[]
  activities: ThreadMessage[] // Activity completion logs
  tracking: ThreadMessage[] // Field change logs
  total_count: number
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE FILTERS & RESPONSES
// ═══════════════════════════════════════════════════════════════

export interface MessageFilters {
  res_model?: ThreadResModel
  res_id?: string
  message_type?: ThreadMessageType | ThreadMessageType[]
  author_id?: string
  is_internal?: boolean
  is_starred?: boolean
  search?: string
  date_from?: string
  date_to?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface MessageResponse {
  messages: ThreadMessage[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface MentionSearchResult {
  messages: ThreadMessage[]
  total: number
  unread_count: number
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE SUBTYPES (for filtering/display)
// ═══════════════════════════════════════════════════════════════

export const MESSAGE_SUBTYPES = {
  COMMENT: 'mail.mt_comment',
  NOTE: 'mail.mt_note',
  ACTIVITIES: 'mail.mt_activities',
  STAGE_CHANGE: 'mail.mt_stage_change',
  TRACKING: 'mail.mt_tracking',
} as const

// ═══════════════════════════════════════════════════════════════
// MENTION PARSING UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Mention format in body: @[User Name](user:userId)
 * This regex extracts mentions from message body
 */
export const MENTION_REGEX = /@\[([^\]]+)\]\(user:([^)]+)\)/g

export interface ParsedMention {
  displayName: string
  userId: string
  fullMatch: string
}

export function parseMentions(body: string): ParsedMention[] {
  const mentions: ParsedMention[] = []
  let match

  while ((match = MENTION_REGEX.exec(body)) !== null) {
    mentions.push({
      displayName: match[1],
      userId: match[2],
      fullMatch: match[0],
    })
  }

  return mentions
}

/**
 * Replace mentions with HTML for display
 */
export function renderMentions(body: string): string {
  return body.replace(
    MENTION_REGEX,
    '<span class="mention" data-user-id="$2">@$1</span>'
  )
}

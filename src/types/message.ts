/**
 * Chatter/Message Types
 * Based on Odoo's mail.message model for threaded discussions
 *
 * These types are used with the Message API endpoints:
 * - All message endpoints use /api/messages/* (NOT /api/thread-messages/*)
 * - See messageService.ts for full endpoint documentation
 */

import DOMPurify from 'dompurify'

// ═══════════════════════════════════════════════════════════════
// MESSAGE TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Message type classification
 * Used in API filters and message display logic
 */
export type ThreadMessageType =
  | 'comment' // User comment (public or internal)
  | 'notification' // System notification
  | 'email' // Email message
  | 'activity_done' // Activity completion log
  | 'stage_change' // Pipeline stage change
  | 'auto_log' // Automated log entry

/**
 * Resource model types that support threading
 * Used as res_model parameter in API requests
 */
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

/**
 * Message author/partner information
 * Populated in message responses from the API
 */
export interface MessageAuthor {
  _id: string
  firstName: string
  lastName: string
  email?: string
  avatar?: string
}

/**
 * Message attachment metadata
 * Returned when messages include attachments
 * Endpoint: Files are uploaded separately, then attached by ID
 */
export interface MessageAttachment {
  _id: string
  name: string
  filename: string
  mimetype: string
  size: number
  url: string // URL to download/view the attachment
  createdAt: string
}

// ═══════════════════════════════════════════════════════════════
// TRACKING VALUE (Field change tracking)
// ═══════════════════════════════════════════════════════════════

/**
 * Field change tracking for audit trail
 * Automatically generated when tracked fields are modified
 * Used in stage_change and auto_log message types
 */
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

/**
 * Main message/chatter object
 * Returned by all message API endpoints
 *
 * API Endpoints that return this type:
 * - GET /api/messages/:id - Single message
 * - POST /api/messages - Create message
 * - POST /api/messages/note - Create note
 * - PATCH /api/messages/:id - Update message
 * - POST /api/messages/:id/star - Toggle star
 */
export interface ThreadMessage {
  _id: string
  res_model: ThreadResModel // Type of record this message belongs to
  res_id: string // ID of the record
  parent_id?: string | ThreadMessage // For nested replies (not fully implemented)
  message_type: ThreadMessageType
  subtype?: string // e.g., 'mail.mt_note', 'mail.mt_comment'
  subject?: string
  body: string // HTML content
  bodyPlain?: string // Plain text version
  author_id: MessageAuthor | string // Message creator
  partner_ids: (MessageAuthor | string)[] // Mentioned/notified users
  attachment_ids: MessageAttachment[]
  tracking_value_ids: TrackingValue[] // Field changes (for audit logs)
  is_internal: boolean // Internal note vs public comment
  starred_partner_ids: string[] // Users who starred this message
  is_starred?: boolean // For current user (computed field)
  email_from?: string // For email message type
  email_to?: string[] // For email message type
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE CREATE/UPDATE
// ═══════════════════════════════════════════════════════════════

/**
 * Data for creating a new message/comment
 * Used with: POST /api/messages
 */
export interface CreateMessageData {
  res_model: ThreadResModel // Model type to attach message to
  res_id: string // Record ID to attach message to
  parent_id?: string // Parent message ID for replies (not fully implemented)
  body: string // HTML content of the message
  is_internal?: boolean // true = internal note, false = public comment
  attachment_ids?: string[] // Array of attachment IDs (upload files first)
  partner_ids?: string[] // User IDs to mention/notify
  subject?: string // Optional subject line
}

/**
 * Data for creating an internal note
 * Used with: POST /api/messages/note
 * Note: is_internal is automatically set to true by the service
 */
export interface CreateNoteData {
  res_model: ThreadResModel
  res_id: string
  body: string // HTML content of the note
  attachment_ids?: string[]
  partner_ids?: string[] // User IDs to mention/notify
}

// ═══════════════════════════════════════════════════════════════
// RECORD THREAD (Grouped messages for a record)
// ═══════════════════════════════════════════════════════════════

/**
 * Full thread for a specific record, with messages grouped by type
 * Returned by: GET /api/messages/thread/:resModel/:resId
 *
 * This provides a complete view of all messages for a record,
 * organized into categories for easier display in the UI
 */
export interface RecordThread {
  res_model: ThreadResModel
  res_id: string
  res_name?: string // Display name of the record
  comments: ThreadMessage[] // Public comments
  notes: ThreadMessage[] // Internal notes
  notifications: ThreadMessage[] // System notifications
  activities: ThreadMessage[] // Activity completion logs
  tracking: ThreadMessage[] // Field change audit logs
  total_count: number // Total number of messages across all types
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE FILTERS & RESPONSES
// ═══════════════════════════════════════════════════════════════

/**
 * Filter parameters for querying messages
 * Used with: GET /api/messages?[query params]
 *
 * All filters are optional and can be combined
 */
export interface MessageFilters {
  res_model?: ThreadResModel // Filter by model type
  res_id?: string // Filter by specific record
  message_type?: ThreadMessageType | ThreadMessageType[] // Single type or array
  author_id?: string // Filter by message author
  is_internal?: boolean // Filter internal notes vs public comments
  is_starred?: boolean // Filter starred messages
  search?: string // Full-text search in message body
  date_from?: string // Filter messages after this date
  date_to?: string // Filter messages before this date
  sortOrder?: 'asc' | 'desc' // Sort by creation date
  page?: number // Pagination page number
  limit?: number // Items per page
}

/**
 * Paginated message response
 * Returned by:
 * - GET /api/messages
 * - GET /api/messages/search
 * - GET /api/messages/starred
 */
export interface MessageResponse {
  messages: ThreadMessage[]
  total: number // Total count across all pages
  page: number // Current page number
  limit: number // Items per page
  hasMore: boolean // Whether more pages exist
}

/**
 * Mention-specific response with unread count
 * Returned by: GET /api/messages/mentions
 */
export interface MentionSearchResult {
  messages: ThreadMessage[] // Messages that mention current user
  total: number // Total mention count
  unread_count: number // Number of unread mentions
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE SUBTYPES (for filtering/display)
// ═══════════════════════════════════════════════════════════════

/**
 * Message subtype constants (Odoo mail.message subtypes)
 * These correspond to the 'subtype' field in ThreadMessage
 * Used for filtering and display logic in the UI
 */
export const MESSAGE_SUBTYPES = {
  COMMENT: 'mail.mt_comment', // User comment
  NOTE: 'mail.mt_note', // Internal note
  ACTIVITIES: 'mail.mt_activities', // Activity completion
  STAGE_CHANGE: 'mail.mt_stage_change', // Pipeline stage change
  TRACKING: 'mail.mt_tracking', // Field change tracking
} as const

// ═══════════════════════════════════════════════════════════════
// MENTION PARSING UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Mention format in body: @[User Name](user:userId)
 * This regex extracts mentions from message body
 *
 * Example: "@[John Doe](user:507f1f77bcf86cd799439011)"
 */
export const MENTION_REGEX = /@\[([^\]]+)\]\(user:([^)]+)\)/g

/**
 * Parsed mention result
 */
export interface ParsedMention {
  displayName: string // User's display name (e.g., "John Doe")
  userId: string // User's database ID
  fullMatch: string // The complete matched mention string
}

/**
 * Extract all mentions from a message body
 *
 * @param body - Message body HTML containing mentions
 * @returns Array of parsed mentions
 *
 * @example
 * const mentions = parseMentions("Hey @[John](user:123), can you review?")
 * // Returns: [{ displayName: "John", userId: "123", fullMatch: "@[John](user:123)" }]
 */
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
 * Convert mention syntax to HTML for display
 * SECURITY: Sanitizes input to prevent XSS attacks
 *
 * @param body - Message body with mention syntax
 * @returns Sanitized HTML string with mentions rendered as spans
 *
 * @example
 * renderMentions("Hey @[John](user:123)")
 * // Returns: "Hey <span class="mention" data-user-id="123">@John</span>"
 */
export function renderMentions(body: string): string {
  // First, escape any potentially dangerous HTML in the body
  // We need to preserve our mention syntax, so we:
  // 1. Extract mentions first
  // 2. Sanitize the body
  // 3. Re-apply mention formatting

  const mentions: Array<{ original: string; displayName: string; userId: string }> = []
  let match: RegExpExecArray | null

  // Reset regex state and extract all mentions
  const mentionRegex = new RegExp(MENTION_REGEX.source, 'g')
  while ((match = mentionRegex.exec(body)) !== null) {
    mentions.push({
      original: match[0],
      displayName: match[1],
      userId: match[2],
    })
  }

  // Sanitize the entire body first (this will escape any malicious HTML)
  let sanitizedBody = DOMPurify.sanitize(body, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })

  // Now safely replace mention syntax with styled spans
  // The display names are already sanitized by DOMPurify
  mentions.forEach(({ original, displayName, userId }) => {
    // Escape the original for use in regex
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Sanitize the display name and userId to be safe
    const safeDisplayName = DOMPurify.sanitize(displayName, { ALLOWED_TAGS: [] })
    const safeUserId = DOMPurify.sanitize(userId, { ALLOWED_TAGS: [] })

    sanitizedBody = sanitizedBody.replace(
      new RegExp(escapedOriginal, 'g'),
      `<span class="mention" data-user-id="${safeUserId}">@${safeDisplayName}</span>`
    )
  })

  return sanitizedBody
}

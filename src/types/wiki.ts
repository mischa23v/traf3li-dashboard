// ═══════════════════════════════════════════════════════════════
// ENUMS & CONSTANTS
// ═══════════════════════════════════════════════════════════════

export type WikiPageType =
  | 'note'
  | 'general'
  | 'pleading'
  | 'motion'
  | 'brief'
  | 'petition'
  | 'timeline'
  | 'evidence_log'
  | 'witness_notes'
  | 'interview_notes'
  | 'deposition'
  | 'legal_research'
  | 'precedent'
  | 'case_analysis'
  | 'strategy'
  | 'correspondence'
  | 'client_memo'
  | 'internal_memo'
  | 'meeting_notes'
  | 'court_documents'
  | 'hearing_notes'
  | 'judgment_analysis'
  | 'template'

export type WikiPageStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'published'
  | 'archived'

export type WikiConfidentialityLevel =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'highly_confidential'

export type WikiVisibility = 'private' | 'case_team' | 'firm_wide'

export type WikiCollectionType =
  | 'custom'
  | 'pleadings'
  | 'evidence'
  | 'research'
  | 'correspondence'
  | 'notes'
  | 'timeline'
  | 'witnesses'
  | 'court_documents'
  | 'client_communications'
  | 'internal_memos'

export type WikiPermissionLevel = 'view' | 'comment' | 'edit' | 'admin'

export type WikiRevisionChangeType =
  | 'create'
  | 'update'
  | 'restore'
  | 'seal'
  | 'unseal'
  | 'auto_save'
  | 'publish'
  | 'archive'

export type WikiCommentStatus = 'active' | 'resolved' | 'deleted'

export type WikiBacklinkType =
  | 'reference'
  | 'related'
  | 'parent'
  | 'child'
  | 'citation'
  | 'see_also'

export type WikiAttachmentCategory =
  | 'pleading'
  | 'evidence'
  | 'exhibit'
  | 'contract'
  | 'correspondence'
  | 'research'
  | 'judgment'
  | 'other'

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface WikiCollaborator {
  userId: string
  user?: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  role: 'author' | 'editor' | 'viewer'
  addedAt: string
  lastContributedAt?: string
}

export interface WikiPermission {
  userId: string
  level: WikiPermissionLevel
  grantedBy: string
  grantedAt: string
}

export interface WikiAttachment {
  _id: string
  attachmentId: string
  fileName: string
  fileNameAr?: string
  fileUrl: string
  fileKey: string
  fileType: string
  fileSize: number
  uploadedBy:
  | string
  | {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  uploadedAt: string
  isSealed: boolean
  isConfidential: boolean
  documentCategory: WikiAttachmentCategory
  // Version tracking
  currentVersion?: number
  versionCount?: number
  description?: string
  descriptionAr?: string
  lastModifiedBy?: string | { _id: string; firstName: string; lastName: string }
  lastModifiedAt?: string
}

export interface AttachmentVersion {
  versionNumber: number
  fileName: string
  fileUrl: string
  fileKey: string
  fileType?: string
  fileSize?: number
  uploadedBy?: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  uploadedAt: string
  changeNote?: string
  isCurrent?: boolean
  isRestored?: boolean
  restoredFrom?: number
}

export interface WikiPage {
  _id: string
  pageId: string

  // Content
  title: string
  titleAr?: string
  urlSlug: string
  content: unknown // ProseMirror JSON
  contentText?: string
  summary?: string
  summaryAr?: string
  icon?: string

  // Classification
  pageType: WikiPageType
  tags?: string[]

  // Hierarchy
  parentPageId?: string | WikiPage
  collectionId?: string | WikiCollection
  folderId?: string | WikiFolder // Standalone folder reference
  caseId?: string // Optional - for standalone wiki
  lawyerId: string
  clientId?: string
  order: number
  depth: number
  fullPath?: string

  // Entity Links (all optional - link later pattern)
  linkedCaseIds?: string[] // Link to multiple cases
  linkedClientIds?: string[] // Link to multiple clients
  linkedTaskIds?: string[] // Renamed for consistency
  linkedEventIds?: string[] // Renamed for consistency
  linkedReminderIds?: string[] // Renamed for consistency
  linkedDocumentIds?: string[] // Renamed for consistency
  linkedWikiPageIds?: string[] // Link to other wiki pages
  // Legacy fields for backward compatibility
  linkedTasks?: string[]
  linkedEvents?: string[]
  linkedReminders?: string[]
  linkedDocuments?: string[]
  linkedPages?: string[]
  linkedContacts?: string[]
  linkedOrganizations?: string[]

  // Version Control
  version: number
  revisionCount: number

  // Status & Workflow
  status: WikiPageStatus
  workflowState?: 'draft' | 'in_review' | 'approved' | 'published'
  reviewedBy?: string
  reviewedAt?: string
  approvedBy?: string
  approvedAt?: string
  publishedBy?: string
  publishedAt?: string

  // Security & Sealing
  isSealed: boolean
  sealedAt?: string
  sealedBy?: string
  sealReason?: string
  sealHistory?: Array<{
    action: 'seal' | 'unseal'
    by: string
    at: string
    reason?: string
  }>
  isConfidential: boolean
  confidentialityLevel: WikiConfidentialityLevel

  // Permissions
  visibility: WikiVisibility
  permissions?: WikiPermission[]

  // Locking
  isLocked: boolean
  lockedBy?: string
  lockedAt?: string
  lockExpiresAt?: string

  // Templates
  isTemplate: boolean
  templateCategory?: string
  templateDescription?: string

  // Attachments
  attachments?: WikiAttachment[]

  // Voice Memos
  voiceMemos?: WikiVoiceMemo[]
  voiceMemoCount?: number
  totalVoiceMemoDuration?: number

  // Collaborators
  collaborators?: WikiCollaborator[]
  createdBy:
  | string
  | { _id: string; firstName: string; lastName: string; avatar?: string }
  lastModifiedBy?:
  | string
  | { _id: string; firstName: string; lastName: string; avatar?: string }

  // Metadata
  viewCount: number
  lastViewedAt?: string
  wordCount?: number
  readingTime?: number

  // Pinning
  isPinned: boolean
  pinnedAt?: string
  pinnedBy?: string
  pinnedOrder?: number

  // Comments
  allowComments: boolean
  commentCount: number

  // Search/AI
  searchVector?: string
  aiSummary?: string
  aiKeywords?: string[]
  lastAiProcessedAt?: string

  // Calendar Integration
  showOnCalendar?: boolean
  calendarDate?: string
  calendarEndDate?: string
  calendarColor?: string

  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface WikiCollection {
  _id: string
  collectionId: string

  // Names & Display
  name: string
  nameAr?: string
  urlSlug: string
  description?: string
  descriptionAr?: string
  icon: string
  color: string

  // Hierarchy
  parentCollectionId?: string | WikiCollection
  order: number
  depth: number

  // Associations
  caseId?: string // Optional for standalone collections
  lawyerId: string

  // Collection Type
  collectionType: WikiCollectionType
  isDefault: boolean

  // Metadata
  pageCount: number
  subCollectionCount: number

  // Permissions
  visibility: WikiVisibility

  // Defaults for New Pages
  defaultPageType?: WikiPageType
  defaultConfidentialityLevel: WikiConfidentialityLevel

  // Audit
  createdBy: string
  lastModifiedBy?: string
  createdAt: string
  updatedAt: string

  // Tree view
  children?: WikiCollection[]
}

// ═══════════════════════════════════════════════════════════════
// STANDALONE WIKI FOLDER (User-centric organization)
// ═══════════════════════════════════════════════════════════════

export interface WikiFolder {
  _id: string
  folderId: string

  // Names & Display
  name: string
  nameAr?: string
  urlSlug?: string
  description?: string
  descriptionAr?: string
  icon: string
  color: string

  // Hierarchy
  parentFolderId?: string | WikiFolder
  order: number
  depth: number

  // Associations
  lawyerId: string
  caseId?: string // Optional - folder can be case-specific or standalone

  // Metadata
  pageCount: number
  subFolderCount: number

  // Permissions
  visibility: WikiVisibility

  // Defaults for New Pages
  defaultPageType?: WikiPageType
  defaultConfidentialityLevel?: WikiConfidentialityLevel

  // Audit
  createdBy: string
  lastModifiedBy?: string
  createdAt: string
  updatedAt: string

  // Tree view
  children?: WikiFolder[]
}

// ═══════════════════════════════════════════════════════════════
// ENTITY LINKING TYPES
// ═══════════════════════════════════════════════════════════════

export type WikiLinkableEntityType =
  | 'case'
  | 'client'
  | 'task'
  | 'event'
  | 'reminder'
  | 'document'
  | 'wiki'

export interface WikiLinkEntityRequest {
  entityType: WikiLinkableEntityType
  entityId: string
}

export interface WikiUnlinkEntityRequest {
  entityType: WikiLinkableEntityType
  entityId: string
}

export interface WikiLinkedEntity {
  entityType: WikiLinkableEntityType
  entityId: string
  linkedAt: string
  linkedBy?: string
}

export interface WikiRevision {
  _id: string
  pageId: string
  caseId?: string
  version: number

  // Content Snapshot
  title: string
  titleAr?: string
  content: unknown
  contentText?: string
  summary?: string
  summaryAr?: string

  // Change Tracking
  changeType: WikiRevisionChangeType
  changeSummary?: string
  changeSummaryAr?: string

  // Diff Statistics
  additions: number
  deletions: number
  wordCountChange: number
  wordCount?: number

  // Restoration Tracking
  isRestoration: boolean
  restoredFromVersion?: number

  // Author & Audit
  createdBy:
  | string
  | { _id: string; firstName: string; lastName: string; avatar?: string }
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface WikiBacklink {
  _id: string
  sourcePageId: string | WikiPage
  targetPageId: string | WikiPage
  anchorText?: string
  context?: string
  linkType: WikiBacklinkType
  position?: {
    blockIndex: number
    charOffset: number
  }
  caseId?: string
  isValid: boolean
  lastValidatedAt: string
  createdAt: string
}

export interface WikiCommentReaction {
  emoji: string
  userId: string
  createdAt: string
}

export interface WikiComment {
  _id: string
  pageId: string
  content: string
  contentHtml?: string

  // Thread Support
  parentCommentId?: string
  replyCount: number
  depth: number
  replies?: WikiComment[]

  // Inline Comment Support
  isInline: boolean
  selectionStart?: number
  selectionEnd?: number
  quotedText?: string
  blockId?: string

  // Status
  status: WikiCommentStatus
  resolvedAt?: string
  resolvedBy?: string | { _id: string; firstName: string; lastName: string }
  resolveNote?: string

  // Author
  userId:
  | string
  | { _id: string; firstName: string; lastName: string; avatar?: string }

  // Mentions
  mentions?: string[]

  // Reactions
  reactions?: WikiCommentReaction[]

  // Editing
  isEdited: boolean
  editedAt?: string
  editHistory?: Array<{ content: string; editedAt: string }>

  // Case reference
  caseId?: string

  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface WikiPageTreeItem {
  _id: string
  pageId: string
  title: string
  titleAr?: string
  urlSlug: string
  pageType: WikiPageType
  parentPageId?: string
  collectionId?: string
  order: number
  depth: number
  fullPath?: string
  icon?: string
  isPinned: boolean
  status: WikiPageStatus
  isSealed: boolean
  isLocked: boolean
  children?: WikiPageTreeItem[]
}

export interface WikiCollectionTreeItem extends WikiCollection {
  children?: WikiCollectionTreeItem[]
}

export interface WikiPageTreeResponse {
  pages: WikiPageTreeItem[]
  collections: WikiCollectionTreeItem[]
}

export interface WikiFolderTreeItem extends WikiFolder {
  children?: WikiFolderTreeItem[]
}

export interface WikiStandaloneTreeResponse {
  pages: WikiPageTreeItem[]
  folders: WikiFolderTreeItem[]
}

export interface WikiTagsResponse {
  tags: string[]
  tagCounts: Record<string, number>
}

export interface WikiLinkGraph {
  nodes: Array<{
    id: string
    title: string
    urlSlug: string
    pageType: WikiPageType
  }>
  edges: Array<{
    source: string
    target: string
    type: WikiBacklinkType
  }>
}

export interface WikiRevisionStats {
  totalRevisions: number
  totalAdditions: number
  totalDeletions: number
  contributorCount: number
  firstRevision: string | null
  lastRevision: string | null
}

export interface WikiStats {
  total: number
  byStatus: Record<WikiPageStatus, number>
  byType: Record<WikiPageType, number>
  pinned: number
  sealed: number
  confidential: number
  recentlyUpdated: number
}

// ═══════════════════════════════════════════════════════════════
// FORM TYPES
// ═══════════════════════════════════════════════════════════════

export interface CreateWikiPageInput {
  title: string
  titleAr?: string
  content?: unknown
  contentText?: string
  summary?: string
  pageType?: WikiPageType
  parentPageId?: string
  collectionId?: string
  folderId?: string // Standalone folder reference
  // All entity links are OPTIONAL - link later pattern
  caseId?: string // Optional - link to a case
  clientId?: string // Optional - link to a client
  linkedCaseIds?: string[] // Optional - link to multiple cases
  linkedClientIds?: string[] // Optional - link to multiple clients
  linkedTaskIds?: string[] // Optional - link to tasks
  linkedEventIds?: string[] // Optional - link to events
  linkedReminderIds?: string[] // Optional - link to reminders
  linkedDocumentIds?: string[] // Optional - link to documents
  linkedWikiPageIds?: string[] // Optional - link to other wiki pages
  // Legacy fields for backward compatibility
  linkedTasks?: string[]
  linkedEvents?: string[]
  linkedReminders?: string[]
  linkedDocuments?: string[]
  tags?: string[]
  isTemplate?: boolean
  visibility?: WikiVisibility
  isConfidential?: boolean
  // Calendar Integration
  showOnCalendar?: boolean
  calendarDate?: string
  calendarEndDate?: string
  calendarColor?: string
}

export type WikiExportFormat = 'pdf' | 'latex' | 'markdown' | 'preview'

export interface WikiExportResponse {
  format: WikiExportFormat
  fileName?: string
  downloadUrl?: string
  html?: string
}

export interface UpdateWikiPageInput extends Partial<CreateWikiPageInput> {
  linkedPages?: string[]
  changeSummary?: string
}

export interface CreateWikiCollectionInput {
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  icon?: string
  color?: string
  parentCollectionId?: string
  collectionType?: WikiCollectionType
  defaultPageType?: WikiPageType
  defaultConfidentialityLevel?: WikiConfidentialityLevel
  visibility?: WikiVisibility
}

export interface UpdateWikiCollectionInput
  extends Partial<CreateWikiCollectionInput> { }

// ═══════════════════════════════════════════════════════════════
// STANDALONE FOLDER FORM TYPES
// ═══════════════════════════════════════════════════════════════

export interface CreateWikiFolderInput {
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  icon?: string
  color?: string
  parentFolderId?: string
  caseId?: string // Optional - folder can be case-specific
  defaultPageType?: WikiPageType
  defaultConfidentialityLevel?: WikiConfidentialityLevel
  visibility?: WikiVisibility
}

export interface UpdateWikiFolderInput
  extends Partial<CreateWikiFolderInput> { }

export interface CreateWikiCommentInput {
  content: string
  contentHtml?: string
  parentCommentId?: string
  isInline?: boolean
  selectionStart?: number
  selectionEnd?: number
  quotedText?: string
  blockId?: string
  mentions?: string[]
}

// ═══════════════════════════════════════════════════════════════
// ATTACHMENT FORM TYPES
// ═══════════════════════════════════════════════════════════════

export interface UploadAttachmentInput {
  fileName: string
  fileType: string
  documentCategory?: WikiAttachmentCategory
  isConfidential?: boolean
}

export interface ConfirmAttachmentInput {
  fileName: string
  fileNameAr?: string
  fileKey: string
  fileUrl?: string
  fileType: string
  fileSize: number
  documentCategory?: WikiAttachmentCategory
  isConfidential?: boolean
}

export interface UpdateAttachmentInput {
  fileName?: string
  fileNameAr?: string
  documentCategory?: WikiAttachmentCategory
  isConfidential?: boolean
}

// ═══════════════════════════════════════════════════════════════
// ATTACHMENT VERSION TYPES
// ═══════════════════════════════════════════════════════════════

export interface AttachmentVersionHistoryResponse {
  attachmentId: string
  fileName: string
  currentVersion: number
  versionCount: number
  versions: AttachmentVersion[]
}

export interface UploadVersionInput {
  fileName: string
  fileType: string
}

export interface ConfirmVersionInput {
  fileName: string
  fileKey: string
  fileUrl?: string
  fileType?: string
  fileSize?: number
  changeNote?: string
}

// ═══════════════════════════════════════════════════════════════
// VOICE MEMO TYPES
// ═══════════════════════════════════════════════════════════════

export type WikiVoiceMemoFormat = 'mp3' | 'wav' | 'webm' | 'ogg' | 'm4a'

export interface WikiVoiceMemo {
  _id: string
  memoId: string

  // File info
  title: string
  titleAr?: string
  fileUrl: string
  fileKey: string
  fileSize: number
  duration: number // in seconds
  format: WikiVoiceMemoFormat

  // Transcription
  transcription?: string
  transcriptionAr?: string
  isTranscribed: boolean
  transcribedAt?: string

  // Security
  isSealed: boolean
  sealedAt?: string
  sealedBy?: string | { _id: string; firstName: string; lastName: string }
  sealReason?: string
  isConfidential: boolean

  // Recording info
  recordedBy:
  | string
  | { _id: string; firstName: string; lastName: string; avatar?: string }
  recordedAt: string

  // Metadata
  description?: string
  descriptionAr?: string

  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface WikiVoiceMemosResponse {
  voiceMemos: WikiVoiceMemo[]
  count: number
  totalDuration: number
}

export interface UploadVoiceMemoInput {
  fileName: string
  fileType: string
  duration?: number
  isConfidential?: boolean
}

export interface ConfirmVoiceMemoInput {
  fileKey: string
  fileType: string
  fileSize: number
  duration: number
  title?: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  isConfidential?: boolean
}

export interface UpdateVoiceMemoInput {
  title?: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  transcription?: string
  transcriptionAr?: string
}

export interface VoiceMemoUrlResponse {
  streamUrl: string
  downloadUrl: string
  fileName: string
  fileType: string
  fileSize: number
  duration: number
  expiresIn: number
}

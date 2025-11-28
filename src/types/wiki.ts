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
  caseId: string
  lawyerId: string
  clientId?: string
  order: number
  depth: number
  fullPath?: string

  // Entity Links
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
  caseId: string
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
  linkedTasks?: string[]
  linkedEvents?: string[]
  linkedReminders?: string[]
  linkedDocuments?: string[]
  tags?: string[]
  isTemplate?: boolean
  visibility?: WikiVisibility
  isConfidential?: boolean
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
  extends Partial<CreateWikiCollectionInput> {}

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

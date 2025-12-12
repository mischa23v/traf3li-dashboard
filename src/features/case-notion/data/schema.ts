import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// BLOCK TYPES
// ═══════════════════════════════════════════════════════════════

export const blockTypes = [
  'text',
  'heading_1',
  'heading_2',
  'heading_3',
  'bulleted_list',
  'numbered_list',
  'todo',
  'toggle',
  'quote',
  'callout',
  'divider',
  'code',
  'table',
  'image',
  'file',
  'bookmark',
  'embed',
  'synced_block',
  'template',
  'column_list',
  'column',
  'link_to_page',
  'mention',
  'equation',
  'timeline_entry',
  'party_statement',
  'evidence_item',
  'legal_citation',
] as const

export type BlockType = (typeof blockTypes)[number]

// ═══════════════════════════════════════════════════════════════
// RICH TEXT SCHEMA
// ═══════════════════════════════════════════════════════════════

export const richTextAnnotationSchema = z.object({
  bold: z.boolean().default(false),
  italic: z.boolean().default(false),
  strikethrough: z.boolean().default(false),
  underline: z.boolean().default(false),
  code: z.boolean().default(false),
  color: z.string().default('default'),
})

export type RichTextAnnotation = z.infer<typeof richTextAnnotationSchema>

export const richTextItemSchema = z.object({
  type: z.enum(['text', 'mention', 'equation']).default('text'),
  text: z.object({
    content: z.string(),
    link: z.string().optional(),
  }).optional(),
  mention: z.object({
    type: z.enum(['user', 'page', 'date', 'task', 'case', 'client']),
    id: z.string(),
    name: z.string().optional(),
  }).optional(),
  equation: z.object({
    expression: z.string(),
  }).optional(),
  annotations: richTextAnnotationSchema.optional(),
  plainText: z.string().optional(),
})

export type RichTextItem = z.infer<typeof richTextItemSchema>

// ═══════════════════════════════════════════════════════════════
// BLOCK SCHEMA
// ═══════════════════════════════════════════════════════════════

export const blockSchema: z.ZodType<Block> = z.lazy(() => z.object({
  _id: z.string(),
  type: z.enum(blockTypes),
  content: z.array(richTextItemSchema).default([]),
  properties: z.record(z.any()).default({}),
  children: z.array(blockSchema).default([]),
  parentId: z.string().optional(),
  pageId: z.string(),
  order: z.number().default(0),
  indent: z.number().default(0),
  isCollapsed: z.boolean().default(false),

  // For synced blocks
  isSyncedBlock: z.boolean().default(false),
  syncedFromBlockId: z.string().optional(),

  // For todo blocks
  checked: z.boolean().optional(),

  // For code blocks
  language: z.string().optional(),

  // For callout/quote blocks
  icon: z.string().optional(),
  color: z.string().optional(),

  // For table blocks
  tableData: z.object({
    headers: z.array(z.string()).optional(),
    rows: z.array(z.array(z.string())).optional(),
    hasHeaderRow: z.boolean().default(true),
    hasHeaderColumn: z.boolean().default(false),
  }).optional(),

  // For file/image blocks
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  caption: z.string().optional(),

  // For party statement blocks (plaintiff/defendant)
  partyType: z.enum(['plaintiff', 'defendant', 'witness', 'expert', 'judge']).optional(),
  statementDate: z.string().optional(),

  // For evidence blocks
  evidenceType: z.enum(['document', 'testimony', 'physical', 'digital', 'expert_opinion']).optional(),
  evidenceDate: z.string().optional(),
  evidenceSource: z.string().optional(),

  // For legal citation blocks
  citationType: z.enum(['law', 'regulation', 'case_precedent', 'legal_principle']).optional(),
  citationReference: z.string().optional(),

  // For timeline entries
  eventDate: z.string().optional(),
  eventType: z.string().optional(),

  // ═══════════════════════════════════════════════════════════════
  // WHITEBOARD/CANVAS POSITIONING (for brainstorm view)
  // ═══════════════════════════════════════════════════════════════

  // Canvas position for whiteboard view
  canvasX: z.number().optional(),
  canvasY: z.number().optional(),
  canvasWidth: z.number().optional(),
  canvasHeight: z.number().optional(),

  // Visual styling for whiteboard blocks
  blockColor: z.enum(['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),

  // Links to case entities
  linkedEventId: z.string().optional(),
  linkedTaskId: z.string().optional(),
  linkedHearingId: z.string().optional(),
  linkedDocumentId: z.string().optional(),

  // Block grouping for whiteboard
  groupId: z.string().optional(),
  groupName: z.string().optional(),

  // Collaboration
  lockedBy: z.string().optional(),
  lockedAt: z.string().optional(),
  lastEditedBy: z.string().optional(),
  lastEditedAt: z.string().optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}))

export interface Block {
  _id: string
  type: BlockType
  content: RichTextItem[]
  properties: Record<string, unknown>
  children: Block[]
  parentId?: string
  pageId: string
  order: number
  indent: number
  isCollapsed: boolean

  // Synced blocks
  isSyncedBlock: boolean
  syncedFromBlockId?: string

  // Todo
  checked?: boolean

  // Code
  language?: string

  // Callout/Quote
  icon?: string
  color?: string

  // Table
  tableData?: {
    headers?: string[]
    rows?: string[][]
    hasHeaderRow: boolean
    hasHeaderColumn: boolean
  }

  // File/Image
  fileUrl?: string
  fileName?: string
  caption?: string

  // Party statement
  partyType?: 'plaintiff' | 'defendant' | 'witness' | 'expert' | 'judge'
  statementDate?: string

  // Evidence
  evidenceType?: 'document' | 'testimony' | 'physical' | 'digital' | 'expert_opinion'
  evidenceDate?: string
  evidenceSource?: string

  // Legal citation
  citationType?: 'law' | 'regulation' | 'case_precedent' | 'legal_principle'
  citationReference?: string

  // Timeline
  eventDate?: string
  eventType?: string

  // Whiteboard/Canvas positioning
  canvasX?: number
  canvasY?: number
  canvasWidth?: number
  canvasHeight?: number

  // Visual styling for whiteboard
  blockColor?: 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gray'
  priority?: 'low' | 'medium' | 'high' | 'urgent'

  // Links to case entities
  linkedEventId?: string
  linkedTaskId?: string
  linkedHearingId?: string
  linkedDocumentId?: string

  // Block grouping
  groupId?: string
  groupName?: string

  // Collaboration
  lockedBy?: string
  lockedAt?: string
  lastEditedBy?: string
  lastEditedAt?: string

  createdAt?: string
  updatedAt?: string
}

// ═══════════════════════════════════════════════════════════════
// BLOCK CONNECTION SCHEMA (for whiteboard links)
// ═══════════════════════════════════════════════════════════════

export const blockConnectionSchema = z.object({
  _id: z.string(),
  pageId: z.string(),
  sourceBlockId: z.string(),
  targetBlockId: z.string(),
  connectionType: z.enum(['arrow', 'line', 'dashed', 'bidirectional']).default('arrow'),
  label: z.string().optional(),
  color: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type BlockConnection = z.infer<typeof blockConnectionSchema>

// ═══════════════════════════════════════════════════════════════
// PAGE SCHEMA
// ═══════════════════════════════════════════════════════════════

export const pageIconSchema = z.object({
  type: z.enum(['emoji', 'file', 'external']),
  emoji: z.string().optional(),
  url: z.string().optional(),
})

export type PageIcon = z.infer<typeof pageIconSchema>

export const pageCoverSchema = z.object({
  type: z.enum(['external', 'file', 'gradient']),
  url: z.string().optional(),
  gradient: z.string().optional(),
})

export type PageCover = z.infer<typeof pageCoverSchema>

export const caseNotionPageSchema = z.object({
  _id: z.string(),
  caseId: z.string(),
  title: z.string().min(1),
  titleAr: z.string().optional(),

  // Page type for different purposes
  pageType: z.enum([
    'general',           // General notes
    'strategy',          // Case strategy and planning
    'timeline',          // Case timeline/chronology
    'evidence',          // Evidence collection
    'arguments',         // Legal arguments
    'research',          // Legal research
    'meeting_notes',     // Meeting/hearing notes
    'correspondence',    // Client correspondence
    'witnesses',         // Witness information
    'discovery',         // Discovery documents
    'pleadings',         // Pleading drafts
    'settlement',        // Settlement discussions
    'brainstorm',        // Brainstorming sessions
  ]).default('general'),

  // Visual customization
  icon: pageIconSchema.optional(),
  cover: pageCoverSchema.optional(),

  // Page content
  blocks: z.array(blockSchema).default([]),

  // Wiki-style features
  parentPageId: z.string().optional(),
  childPageIds: z.array(z.string()).default([]),
  backlinks: z.array(z.object({
    pageId: z.string(),
    blockId: z.string(),
    pageTitle: z.string(),
  })).default([]),

  // Database views (for structured data)
  hasDatabase: z.boolean().default(false),
  databaseConfig: z.object({
    viewType: z.enum(['table', 'board', 'timeline', 'calendar', 'gallery', 'list', 'chart']).optional(),
    properties: z.array(z.object({
      name: z.string(),
      type: z.enum(['text', 'number', 'select', 'multi_select', 'date', 'person', 'checkbox', 'url', 'email', 'phone', 'relation', 'formula', 'rollup']),
      options: z.array(z.object({
        value: z.string(),
        color: z.string(),
      })).optional(),
    })).optional(),
    filters: z.array(z.record(z.any())).optional(),
    sorts: z.array(z.object({
      property: z.string(),
      direction: z.enum(['asc', 'desc']),
    })).optional(),
    groupBy: z.string().optional(),
  }).optional(),

  // Template support
  isTemplate: z.boolean().default(false),
  templateCategory: z.string().optional(),

  // Favorite/Pin
  isFavorite: z.boolean().default(false),
  isPinned: z.boolean().default(false),

  // Sharing
  isPublic: z.boolean().default(false),
  sharedWith: z.array(z.object({
    userId: z.string(),
    permission: z.enum(['view', 'comment', 'edit']),
  })).default([]),

  // Version control
  version: z.number().default(1),
  lastVersionAt: z.string().optional(),

  // ═══════════════════════════════════════════════════════════════
  // WHITEBOARD/BRAINSTORM VIEW SETTINGS
  // ═══════════════════════════════════════════════════════════════

  // View mode: document (default) or whiteboard/canvas
  viewMode: z.enum(['document', 'whiteboard']).default('document'),

  // Whiteboard canvas settings
  whiteboardConfig: z.object({
    canvasWidth: z.number().default(5000),
    canvasHeight: z.number().default(5000),
    zoom: z.number().default(1),
    panX: z.number().default(0),
    panY: z.number().default(0),
    gridEnabled: z.boolean().default(true),
    snapToGrid: z.boolean().default(true),
    gridSize: z.number().default(20),
  }).optional(),

  // Block connections for whiteboard view
  connections: z.array(blockConnectionSchema).default([]),

  // Metadata
  createdBy: z.string(),
  lastEditedBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().optional(),
  deletedAt: z.string().optional(),
})

export type CaseNotionPage = z.infer<typeof caseNotionPageSchema>

export type WhiteboardConfig = NonNullable<CaseNotionPage['whiteboardConfig']>

// ═══════════════════════════════════════════════════════════════
// SYNCED BLOCK SCHEMA
// ═══════════════════════════════════════════════════════════════

export const syncedBlockSchema = z.object({
  _id: z.string(),
  originalBlockId: z.string(),
  originalPageId: z.string(),
  syncedToPages: z.array(z.object({
    pageId: z.string(),
    blockId: z.string(),
  })).default([]),
  content: z.array(richTextItemSchema).default([]),
  properties: z.record(z.any()).default({}),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type SyncedBlock = z.infer<typeof syncedBlockSchema>

// ═══════════════════════════════════════════════════════════════
// TEMPLATE SCHEMA
// ═══════════════════════════════════════════════════════════════

export const pageTemplateSchema = z.object({
  _id: z.string(),
  firmId: z.string(),
  name: z.string().min(1),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  category: z.enum([
    'case_strategy',
    'client_meeting',
    'court_hearing',
    'legal_research',
    'evidence_analysis',
    'witness_interview',
    'settlement_negotiation',
    'case_timeline',
    'brainstorming',
    'custom',
  ]),
  icon: pageIconSchema.optional(),
  blocks: z.array(blockSchema).default([]),
  isGlobal: z.boolean().default(false), // Available to all firms
  isActive: z.boolean().default(true),
  usageCount: z.number().default(0),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type PageTemplate = z.infer<typeof pageTemplateSchema>

// ═══════════════════════════════════════════════════════════════
// COMMENT SCHEMA
// ═══════════════════════════════════════════════════════════════

export const blockCommentSchema = z.object({
  _id: z.string(),
  blockId: z.string(),
  pageId: z.string(),
  content: z.string(),
  parentCommentId: z.string().optional(), // For threaded comments
  mentions: z.array(z.string()).default([]), // User IDs mentioned
  isResolved: z.boolean().default(false),
  resolvedBy: z.string().optional(),
  resolvedAt: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type BlockComment = z.infer<typeof blockCommentSchema>

// ═══════════════════════════════════════════════════════════════
// ACTIVITY/HISTORY SCHEMA
// ═══════════════════════════════════════════════════════════════

export const pageActivitySchema = z.object({
  _id: z.string(),
  pageId: z.string(),
  userId: z.string(),
  userName: z.string(),
  action: z.enum([
    'created',
    'edited',
    'deleted',
    'restored',
    'shared',
    'unshared',
    'commented',
    'mentioned',
    'block_added',
    'block_deleted',
    'block_moved',
    'template_applied',
  ]),
  details: z.record(z.any()).optional(),
  createdAt: z.string(),
})

export type PageActivity = z.infer<typeof pageActivitySchema>

// ═══════════════════════════════════════════════════════════════
// INPUT/FILTER SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const createPageInputSchema = z.object({
  caseId: z.string(),
  title: z.string().min(1),
  titleAr: z.string().optional(),
  pageType: caseNotionPageSchema.shape.pageType.optional(),
  icon: pageIconSchema.optional(),
  cover: pageCoverSchema.optional(),
  parentPageId: z.string().optional(),
  templateId: z.string().optional(), // Apply template on creation
})

export type CreatePageInput = z.infer<typeof createPageInputSchema>

export const updatePageInputSchema = z.object({
  title: z.string().min(1).optional(),
  titleAr: z.string().optional(),
  pageType: caseNotionPageSchema.shape.pageType.optional(),
  icon: pageIconSchema.optional(),
  cover: pageCoverSchema.optional(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  blocks: z.array(blockSchema).optional(),
})

export type UpdatePageInput = z.infer<typeof updatePageInputSchema>

export const pageFiltersSchema = z.object({
  caseId: z.string().optional(),
  pageType: caseNotionPageSchema.shape.pageType.optional(),
  search: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  createdBy: z.string().optional(),
  parentPageId: z.string().optional(),
  isArchived: z.boolean().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

export type PageFilters = z.infer<typeof pageFiltersSchema>

// ═══════════════════════════════════════════════════════════════
// BLOCK OPERATIONS
// ═══════════════════════════════════════════════════════════════

export const createBlockInputSchema = z.object({
  pageId: z.string(),
  type: z.enum(blockTypes),
  content: z.array(richTextItemSchema).optional(),
  properties: z.record(z.any()).optional(),
  parentId: z.string().optional(),
  afterBlockId: z.string().optional(), // Insert after this block
  indent: z.number().optional(),
})

export type CreateBlockInput = z.infer<typeof createBlockInputSchema>

export const updateBlockInputSchema = z.object({
  content: z.array(richTextItemSchema).optional(),
  properties: z.record(z.any()).optional(),
  type: z.enum(blockTypes).optional(),
  checked: z.boolean().optional(),
  isCollapsed: z.boolean().optional(),
})

export type UpdateBlockInput = z.infer<typeof updateBlockInputSchema>

export const moveBlockInputSchema = z.object({
  blockId: z.string(),
  targetPageId: z.string().optional(), // Move to different page
  afterBlockId: z.string().optional(), // Position after this block
  parentId: z.string().optional(), // New parent block (for nesting)
  indent: z.number().optional(),
})

export type MoveBlockInput = z.infer<typeof moveBlockInputSchema>

// ═══════════════════════════════════════════════════════════════
// PAGE TYPE LABELS
// ═══════════════════════════════════════════════════════════════

export const pageTypeLabels = {
  general: { ar: 'ملاحظات عامة', en: 'General Notes' },
  strategy: { ar: 'استراتيجية القضية', en: 'Case Strategy' },
  timeline: { ar: 'الجدول الزمني', en: 'Timeline' },
  evidence: { ar: 'الأدلة', en: 'Evidence' },
  arguments: { ar: 'الحجج القانونية', en: 'Legal Arguments' },
  research: { ar: 'البحث القانوني', en: 'Legal Research' },
  meeting_notes: { ar: 'محاضر الاجتماعات', en: 'Meeting Notes' },
  correspondence: { ar: 'المراسلات', en: 'Correspondence' },
  witnesses: { ar: 'الشهود', en: 'Witnesses' },
  discovery: { ar: 'الاكتشاف', en: 'Discovery' },
  pleadings: { ar: 'المذكرات', en: 'Pleadings' },
  settlement: { ar: 'التسوية', en: 'Settlement' },
  brainstorm: { ar: 'العصف الذهني', en: 'Brainstorm' },
} as const

export const blockTypeLabels = {
  text: { ar: 'نص', en: 'Text' },
  heading_1: { ar: 'عنوان 1', en: 'Heading 1' },
  heading_2: { ar: 'عنوان 2', en: 'Heading 2' },
  heading_3: { ar: 'عنوان 3', en: 'Heading 3' },
  bulleted_list: { ar: 'قائمة نقطية', en: 'Bulleted List' },
  numbered_list: { ar: 'قائمة مرقمة', en: 'Numbered List' },
  todo: { ar: 'مهمة', en: 'To-do' },
  toggle: { ar: 'قائمة قابلة للطي', en: 'Toggle' },
  quote: { ar: 'اقتباس', en: 'Quote' },
  callout: { ar: 'تنبيه', en: 'Callout' },
  divider: { ar: 'فاصل', en: 'Divider' },
  code: { ar: 'كود', en: 'Code' },
  table: { ar: 'جدول', en: 'Table' },
  image: { ar: 'صورة', en: 'Image' },
  file: { ar: 'ملف', en: 'File' },
  bookmark: { ar: 'إشارة مرجعية', en: 'Bookmark' },
  embed: { ar: 'تضمين', en: 'Embed' },
  synced_block: { ar: 'كتلة متزامنة', en: 'Synced Block' },
  template: { ar: 'قالب', en: 'Template' },
  column_list: { ar: 'أعمدة', en: 'Columns' },
  column: { ar: 'عمود', en: 'Column' },
  link_to_page: { ar: 'رابط لصفحة', en: 'Link to Page' },
  mention: { ar: 'إشارة', en: 'Mention' },
  equation: { ar: 'معادلة', en: 'Equation' },
  timeline_entry: { ar: 'حدث زمني', en: 'Timeline Entry' },
  party_statement: { ar: 'أقوال الطرف', en: 'Party Statement' },
  evidence_item: { ar: 'عنصر دليل', en: 'Evidence Item' },
  legal_citation: { ar: 'استشهاد قانوني', en: 'Legal Citation' },
} as const

export const partyTypeLabels = {
  plaintiff: { ar: 'المدعي', en: 'Plaintiff' },
  defendant: { ar: 'المدعى عليه', en: 'Defendant' },
  witness: { ar: 'شاهد', en: 'Witness' },
  expert: { ar: 'خبير', en: 'Expert' },
  judge: { ar: 'القاضي', en: 'Judge' },
} as const

export const evidenceTypeLabels = {
  document: { ar: 'مستند', en: 'Document' },
  testimony: { ar: 'شهادة', en: 'Testimony' },
  physical: { ar: 'دليل مادي', en: 'Physical' },
  digital: { ar: 'دليل رقمي', en: 'Digital' },
  expert_opinion: { ar: 'رأي خبير', en: 'Expert Opinion' },
} as const

export const templateCategoryLabels = {
  case_strategy: { ar: 'استراتيجية القضية', en: 'Case Strategy' },
  client_meeting: { ar: 'اجتماع العميل', en: 'Client Meeting' },
  court_hearing: { ar: 'جلسة المحكمة', en: 'Court Hearing' },
  legal_research: { ar: 'البحث القانوني', en: 'Legal Research' },
  evidence_analysis: { ar: 'تحليل الأدلة', en: 'Evidence Analysis' },
  witness_interview: { ar: 'مقابلة الشهود', en: 'Witness Interview' },
  settlement_negotiation: { ar: 'مفاوضات التسوية', en: 'Settlement Negotiation' },
  case_timeline: { ar: 'الجدول الزمني للقضية', en: 'Case Timeline' },
  brainstorming: { ar: 'العصف الذهني', en: 'Brainstorming' },
  custom: { ar: 'مخصص', en: 'Custom' },
} as const

// ═══════════════════════════════════════════════════════════════
// WHITEBOARD LABELS & COLORS
// ═══════════════════════════════════════════════════════════════

export const blockColorLabels = {
  default: { ar: 'افتراضي', en: 'Default', bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-900' },
  red: { ar: 'أحمر', en: 'Red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900' },
  orange: { ar: 'برتقالي', en: 'Orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900' },
  yellow: { ar: 'أصفر', en: 'Yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900' },
  green: { ar: 'أخضر', en: 'Green', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900' },
  blue: { ar: 'أزرق', en: 'Blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
  purple: { ar: 'بنفسجي', en: 'Purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
  pink: { ar: 'وردي', en: 'Pink', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-900' },
  gray: { ar: 'رمادي', en: 'Gray', bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-900' },
} as const

export const blockPriorityLabels = {
  low: { ar: 'منخفض', en: 'Low', color: 'text-slate-500', bg: 'bg-slate-100' },
  medium: { ar: 'متوسط', en: 'Medium', color: 'text-blue-600', bg: 'bg-blue-100' },
  high: { ar: 'عالي', en: 'High', color: 'text-orange-600', bg: 'bg-orange-100' },
  urgent: { ar: 'عاجل', en: 'Urgent', color: 'text-red-600', bg: 'bg-red-100' },
} as const

export const connectionTypeLabels = {
  arrow: { ar: 'سهم', en: 'Arrow' },
  line: { ar: 'خط', en: 'Line' },
  dashed: { ar: 'متقطع', en: 'Dashed' },
  bidirectional: { ar: 'ثنائي الاتجاه', en: 'Bidirectional' },
} as const

/**
 * Case Rich Document Types
 * Types for rich text documents within cases
 */

// Document type options
export type RichDocumentType =
  | 'legal_memo'
  | 'contract_draft'
  | 'pleading'
  | 'motion'
  | 'brief'
  | 'letter'
  | 'notice'
  | 'agreement'
  | 'report'
  | 'notes'
  | 'other'

// Document status
export type RichDocumentStatus = 'draft' | 'review' | 'final' | 'archived'

// Text direction
export type TextDirection = 'rtl' | 'ltr' | 'auto'

// Language options
export type DocumentLanguage = 'ar' | 'en' | 'mixed'

// Previous version entry
export interface RichDocumentVersion {
  version: number
  content: string
  editedBy: string | {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
  }
  editedAt: string
  changeNote?: string
  isCurrent?: boolean
}

// Main Rich Document interface
export interface CaseRichDocument {
  _id: string
  caseId: string

  // Content
  title: string
  titleAr?: string
  content: string // HTML content from CKEditor

  // Classification
  documentType: RichDocumentType
  status: RichDocumentStatus

  // Language settings
  language: DocumentLanguage
  textDirection: TextDirection

  // Version tracking
  version: number
  previousVersions: RichDocumentVersion[]

  // Calendar integration
  showOnCalendar?: boolean
  calendarDate?: string
  calendarEndDate?: string
  calendarColor?: string

  // Metadata
  wordCount?: number
  createdBy: string | {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
  }
  createdAt: string
  updatedAt: string
}

// Create document input
export interface CreateRichDocumentInput {
  title: string
  titleAr?: string
  content: string
  documentType: RichDocumentType
  status?: RichDocumentStatus
  language?: DocumentLanguage
  textDirection?: TextDirection
  showOnCalendar?: boolean
  calendarDate?: string
  calendarEndDate?: string
  calendarColor?: string
  changeNote?: string
}

// Update document input
export interface UpdateRichDocumentInput {
  title?: string
  titleAr?: string
  content?: string
  documentType?: RichDocumentType
  status?: RichDocumentStatus
  language?: DocumentLanguage
  textDirection?: TextDirection
  showOnCalendar?: boolean
  calendarDate?: string
  calendarEndDate?: string
  calendarColor?: string
  changeNote?: string
}

// Export formats
export type RichDocumentExportFormat = 'pdf' | 'latex' | 'markdown' | 'preview'

// Export response
export interface RichDocumentExportResponse {
  format: RichDocumentExportFormat
  fileName?: string
  downloadUrl?: string
  html?: string
  latex?: string
  markdown?: string
}

// List filters
export interface RichDocumentFilters {
  documentType?: RichDocumentType
  status?: RichDocumentStatus
  search?: string
  page?: number
  limit?: number
}

// Labels for UI
export const richDocumentTypeLabels: Record<RichDocumentType, string> = {
  legal_memo: 'Legal Memo',
  contract_draft: 'Contract Draft',
  pleading: 'Pleading',
  motion: 'Motion',
  brief: 'Brief',
  letter: 'Letter',
  notice: 'Notice',
  agreement: 'Agreement',
  report: 'Report',
  notes: 'Notes',
  other: 'Other'
}

export const richDocumentTypeLabelsAr: Record<RichDocumentType, string> = {
  legal_memo: 'مذكرة قانونية',
  contract_draft: 'مسودة عقد',
  pleading: 'مرافعة',
  motion: 'طلب',
  brief: 'ملخص',
  letter: 'خطاب',
  notice: 'إشعار',
  agreement: 'اتفاقية',
  report: 'تقرير',
  notes: 'ملاحظات',
  other: 'أخرى'
}

export const richDocumentStatusLabels: Record<RichDocumentStatus, string> = {
  draft: 'Draft',
  review: 'Under Review',
  final: 'Final',
  archived: 'Archived'
}

export const richDocumentStatusLabelsAr: Record<RichDocumentStatus, string> = {
  draft: 'مسودة',
  review: 'قيد المراجعة',
  final: 'نهائي',
  archived: 'مؤرشف'
}

export const richDocumentStatusColors: Record<RichDocumentStatus, string> = {
  draft: 'amber',
  review: 'blue',
  final: 'emerald',
  archived: 'slate'
}

// Full Tailwind class names for rich document status colors (to avoid purge issues with dynamic interpolation)
export const getRichDocumentStatusColorClasses = (status: RichDocumentStatus): { bg: string; text: string; border: string } => {
  switch (status) {
    case 'draft':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
    case 'review':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
    case 'final':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
    case 'archived':
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
  }
}

/**
 * File Storage Types - Gold Standard Implementation
 *
 * Aligned with Backend API Contract v2.0.0
 * Storage Provider: Cloudflare R2 (S3-compatible)
 *
 * Features:
 * - Presigned URLs for secure direct uploads/downloads
 * - Malware scanning on all uploads (ClamAV)
 * - CloudTrail-style file access logging
 * - Multi-tenant isolation (firmId/lawyerId)
 *
 * @see docs/FRONTEND_DOCUMENT_SYSTEM_GUIDE.md
 */

// ============================================
// ENUMS & CONSTANTS
// ============================================

/**
 * Document categories for case documents
 */
export type DocumentCategory =
  | 'contract'
  | 'pleading'
  | 'evidence'
  | 'correspondence'
  | 'court_document'
  | 'financial'
  | 'identification'
  | 'other'

/**
 * HR document types
 */
export type HRDocumentType =
  | 'contract'
  | 'id_copy'
  | 'passport'
  | 'visa'
  | 'iqama'
  | 'certificate'
  | 'medical'
  | 'bank_letter'
  | 'other'

/**
 * Content format for TipTap documents
 */
export type ContentFormat = 'html' | 'tiptap-json'

/**
 * Storage type - 's3' means R2 (S3-compatible)
 */
export type StorageType = 'local' | 's3'

/**
 * Content disposition for downloads
 */
export type ContentDisposition = 'inline' | 'attachment'

// ============================================
// FILE SIZE LIMITS
// ============================================

/**
 * Maximum file sizes by category (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  /** Documents: 100 MB */
  DOCUMENTS: 100 * 1024 * 1024,
  /** Images: 10 MB */
  IMAGES: 10 * 1024 * 1024,
  /** Audio/Voice Memos: 50 MB */
  AUDIO: 50 * 1024 * 1024,
  /** Bank Imports: 10 MB */
  BANK_IMPORTS: 10 * 1024 * 1024,
  /** Task Attachments: 50 MB */
  TASK_ATTACHMENTS: 50 * 1024 * 1024,
  /** Case Documents: 50 MB */
  CASE_DOCUMENTS: 50 * 1024 * 1024,
  /** Client Attachments: 50 MB */
  CLIENT_ATTACHMENTS: 50 * 1024 * 1024,
  /** HR Documents: 50 MB */
  HR_DOCUMENTS: 50 * 1024 * 1024,
  /** Voice Memos: 25 MB */
  VOICE_MEMOS: 25 * 1024 * 1024,
} as const

/**
 * Presigned URL expiry times (in seconds)
 */
export const URL_EXPIRY = {
  /** Download URLs expire in 15 minutes */
  DOWNLOAD: 900,
  /** Upload URLs expire in 30 minutes */
  UPLOAD: 1800,
} as const

// ============================================
// ALLOWED MIME TYPES
// ============================================

/**
 * Allowed MIME types by category
 */
export const ALLOWED_MIME_TYPES = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/rtf',
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/tiff',
  ],
  audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/x-m4a',
  ],
  bankImports: [
    'text/csv',
    'application/csv',
    'application/x-ofx',
    'application/x-qif',
  ],
} as const

/**
 * Voice memo MIME types (subset of audio)
 */
export const VOICE_MEMO_MIME_TYPES = [
  'audio/webm',
  'audio/mp3',
  'audio/mpeg',
  'audio/m4a',
  'audio/wav',
  'audio/ogg',
] as const

// ============================================
// ERROR CODES
// ============================================

/**
 * File operation error codes
 */
export type FileErrorCode =
  | 'MALWARE_DETECTED'
  | 'SCAN_FAILED'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'UPLOAD_FAILED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'

// ============================================
// USER REFERENCE
// ============================================

/**
 * User reference (populated in responses)
 */
export interface UserRef {
  _id: string
  firstName: string
  lastName: string
}

// ============================================
// DOCUMENT INTERFACES
// ============================================

/**
 * Base document interface (shared fields)
 */
export interface BaseDocument {
  _id: string
  fileName: string
  fileKey?: string
  fileType: string
  fileSize: number
  storageType: StorageType
  uploadedBy: string | UserRef
  uploadedAt: string
}

/**
 * Case document
 */
export interface CaseDocument extends BaseDocument {
  category: DocumentCategory
  description?: string
  downloadUrl?: string
}

/**
 * Task attachment
 */
export interface TaskAttachment extends BaseDocument {
  downloadUrl?: string
  thumbnailUrl?: string
}

/**
 * Voice memo
 */
export interface VoiceMemo extends BaseDocument {
  duration?: number
  transcription?: string
  isVoiceMemo: true
  downloadUrl?: string
}

/**
 * TipTap document (rich text)
 */
export interface TipTapDocument extends BaseDocument {
  isEditable: true
  content?: string
  contentJson?: object
  contentFormat: ContentFormat
  lastEditedBy?: string | UserRef
  lastEditedAt?: string
}

/**
 * Document version for TipTap documents
 */
export interface DocumentVersion {
  _id: string
  version: number
  title: string
  documentContent?: string
  documentJson?: object
  contentFormat: ContentFormat
  fileSize: number
  changeNote?: string
  editedBy: string | UserRef
  createdAt: string
  isCurrent?: boolean
}

/**
 * Attachment version (S3 versioning)
 */
export interface AttachmentVersion {
  versionId: string
  lastModified: string
  size: number
  isLatest: boolean
  etag?: string
}

// ============================================
// API REQUEST TYPES
// ============================================

/**
 * Request to get presigned upload URL
 */
export interface GetUploadUrlRequest {
  filename: string
  contentType: string
  fileSize: number
  category?: DocumentCategory
}

/**
 * Request to confirm upload after uploading to R2
 */
export interface ConfirmUploadRequest {
  fileKey: string
  filename: string
  contentType: string
  size: number
  category?: DocumentCategory
  description?: string
}

/**
 * Request to create TipTap document
 */
export interface CreateTipTapDocumentRequest {
  title: string
  content: string
  contentJson?: object
  contentFormat?: ContentFormat
}

/**
 * Request to update TipTap document
 */
export interface UpdateTipTapDocumentRequest {
  title?: string
  content?: string
  contentJson?: object
  contentFormat?: ContentFormat
  changeNote?: string
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Response from get upload URL endpoint
 */
export interface UploadUrlResponse {
  success: true
  uploadUrl: string
  fileKey: string
  expiresIn: number
}

/**
 * Response from get download URL endpoint
 */
export interface DownloadUrlResponse {
  success: true
  downloadUrl: string
  document?: {
    _id: string
    fileName: string
    fileType: string
    fileSize: number
  }
  attachment?: {
    _id: string
    fileName: string
    fileType: string
    fileSize: number
  }
  versionId?: string | null
  disposition?: ContentDisposition
}

/**
 * Response from confirm upload endpoint
 */
export interface UploadConfirmResponse {
  success: true
  message: string
  document?: CaseDocument
  attachment?: TaskAttachment
  voiceMemo?: VoiceMemo
}

/**
 * Response from attachment versions endpoint
 */
export interface AttachmentVersionsResponse {
  success: true
  attachment: {
    _id: string
    fileName: string
    fileKey: string
  }
  versions: AttachmentVersion[]
}

/**
 * Response from document versions endpoint
 */
export interface DocumentVersionsResponse {
  success: true
  document: {
    _id: string
    fileName: string
    isEditable: boolean
  }
  versions: DocumentVersion[]
}

// ============================================
// ERROR RESPONSE TYPES
// ============================================

/**
 * Malware detected error response (400)
 */
export interface MalwareErrorResponse {
  success: false
  error: true
  message: string
  code: 'MALWARE_DETECTED'
  details: {
    fileName: string
    virus: string
    blocked: boolean
  }
}

/**
 * Scan failed error response (500)
 */
export interface ScanFailedResponse {
  success: false
  error: true
  message: string
  code: 'SCAN_FAILED'
}

/**
 * Validation error response (400)
 */
export interface ValidationErrorResponse {
  success: false
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
}

/**
 * Generic file error response
 */
export interface FileErrorResponse {
  success: false
  error?: boolean
  message: string
  code?: FileErrorCode
  details?: Record<string, unknown>
}

// ============================================
// LOCALIZED CONSTANTS
// ============================================

/**
 * Document categories with translations
 */
export const DOCUMENT_CATEGORIES: Record<DocumentCategory, { en: string; ar: string }> = {
  contract: { en: 'Contract', ar: 'عقد' },
  pleading: { en: 'Pleading', ar: 'مذكرة' },
  evidence: { en: 'Evidence', ar: 'دليل' },
  correspondence: { en: 'Correspondence', ar: 'مراسلات' },
  court_document: { en: 'Court Document', ar: 'وثيقة محكمة' },
  financial: { en: 'Financial', ar: 'مالي' },
  identification: { en: 'Identification', ar: 'هوية' },
  other: { en: 'Other', ar: 'أخرى' },
}

/**
 * HR document types with translations
 */
export const HR_DOCUMENT_TYPES: Record<HRDocumentType, { en: string; ar: string }> = {
  contract: { en: 'Employment Contract', ar: 'عقد العمل' },
  id_copy: { en: 'ID Copy', ar: 'صورة الهوية' },
  passport: { en: 'Passport', ar: 'جواز السفر' },
  visa: { en: 'Visa', ar: 'التأشيرة' },
  iqama: { en: 'Iqama', ar: 'الإقامة' },
  certificate: { en: 'Certificate', ar: 'شهادة' },
  medical: { en: 'Medical Report', ar: 'تقرير طبي' },
  bank_letter: { en: 'Bank Letter', ar: 'خطاب بنكي' },
  other: { en: 'Other', ar: 'أخرى' },
}

/**
 * Error messages with translations
 */
export const FILE_ERROR_MESSAGES: Record<FileErrorCode, { en: string; ar: string }> = {
  MALWARE_DETECTED: {
    en: 'File rejected: Malware detected',
    ar: 'ملف مرفوض: تم اكتشاف محتوى ضار',
  },
  SCAN_FAILED: {
    en: 'File safety check failed. Please try again.',
    ar: 'فشل التحقق من سلامة الملف. يرجى المحاولة مرة أخرى.',
  },
  FILE_TOO_LARGE: {
    en: 'File too large',
    ar: 'حجم الملف كبير جداً',
  },
  INVALID_FILE_TYPE: {
    en: 'File type not allowed',
    ar: 'نوع الملف غير مسموح به',
  },
  UPLOAD_FAILED: {
    en: 'Upload failed. Please try again.',
    ar: 'فشل الرفع. يرجى المحاولة مرة أخرى.',
  },
  UNAUTHORIZED: {
    en: 'Session expired. Please login again.',
    ar: 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.',
  },
  FORBIDDEN: {
    en: 'You do not have permission to access this file',
    ar: 'ليس لديك صلاحية للوصول إلى هذا الملف',
  },
  NOT_FOUND: {
    en: 'File not found',
    ar: 'الملف غير موجود',
  },
  VALIDATION_ERROR: {
    en: 'Invalid file data',
    ar: 'بيانات الملف غير صالحة',
  },
}

/**
 * File Validation Utilities - Gold Standard Implementation
 *
 * Client-side validation for defense in depth.
 * Backend also validates - this is to fail fast and improve UX.
 *
 * @see docs/FRONTEND_DOCUMENT_SYSTEM_GUIDE.md
 */

import {
  ALLOWED_MIME_TYPES,
  FILE_SIZE_LIMITS,
  VOICE_MEMO_MIME_TYPES,
} from '@/types/file-storage'

// ============================================
// VALIDATION RESULT TYPES
// ============================================

export interface ValidationResult {
  valid: boolean
  error?: {
    code: 'FILE_TOO_LARGE' | 'INVALID_FILE_TYPE' | 'EMPTY_FILE'
    message: string
    messageAr: string
  }
}

export type FileCategory = 'documents' | 'images' | 'audio' | 'bankImports' | 'all'

// ============================================
// FILE TYPE DETECTION
// ============================================

/**
 * Check if file is a voice memo
 */
export function isVoiceMemo(fileType: string): boolean {
  return VOICE_MEMO_MIME_TYPES.includes(fileType as (typeof VOICE_MEMO_MIME_TYPES)[number])
}

/**
 * Check if file is an image
 */
export function isImageFile(fileType: string): boolean {
  return ALLOWED_MIME_TYPES.images.includes(fileType as (typeof ALLOWED_MIME_TYPES.images)[number])
}

/**
 * Check if file is a document
 */
export function isDocumentFile(fileType: string): boolean {
  return ALLOWED_MIME_TYPES.documents.includes(fileType as (typeof ALLOWED_MIME_TYPES.documents)[number])
}

/**
 * Check if file is an audio file
 */
export function isAudioFile(fileType: string): boolean {
  return ALLOWED_MIME_TYPES.audio.includes(fileType as (typeof ALLOWED_MIME_TYPES.audio)[number])
}

/**
 * Check if file is a bank import file
 */
export function isBankImportFile(fileType: string): boolean {
  return ALLOWED_MIME_TYPES.bankImports.includes(fileType as (typeof ALLOWED_MIME_TYPES.bankImports)[number])
}

/**
 * Get file category from MIME type
 */
export function getFileCategory(fileType: string): FileCategory | null {
  if (isDocumentFile(fileType)) return 'documents'
  if (isImageFile(fileType)) return 'images'
  if (isAudioFile(fileType)) return 'audio'
  if (isBankImportFile(fileType)) return 'bankImports'
  return null
}

// ============================================
// FILE SIZE UTILITIES
// ============================================

/**
 * Format file size for display
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Get maximum file size for a category
 * @param category File category
 * @returns Maximum size in bytes
 */
export function getMaxFileSize(category: FileCategory): number {
  switch (category) {
    case 'documents':
      return FILE_SIZE_LIMITS.DOCUMENTS
    case 'images':
      return FILE_SIZE_LIMITS.IMAGES
    case 'audio':
      return FILE_SIZE_LIMITS.AUDIO
    case 'bankImports':
      return FILE_SIZE_LIMITS.BANK_IMPORTS
    case 'all':
    default:
      return FILE_SIZE_LIMITS.DOCUMENTS // Default to largest common limit
  }
}

// ============================================
// MIME TYPE UTILITIES
// ============================================

/**
 * Get MIME type from file extension (fallback)
 */
export function getMimeTypeFromExtension(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return null

  const mimeMap: Record<string, string> = {
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    rtf: 'application/rtf',
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    webm: 'audio/webm',
    ogg: 'audio/ogg',
    m4a: 'audio/x-m4a',
    // Bank imports
    csv: 'text/csv',
    ofx: 'application/x-ofx',
    qif: 'application/x-qif',
  }

  return mimeMap[ext] || null
}

/**
 * Get all allowed MIME types for a category
 */
export function getAllowedMimeTypes(category: FileCategory): readonly string[] {
  switch (category) {
    case 'documents':
      return ALLOWED_MIME_TYPES.documents
    case 'images':
      return ALLOWED_MIME_TYPES.images
    case 'audio':
      return ALLOWED_MIME_TYPES.audio
    case 'bankImports':
      return ALLOWED_MIME_TYPES.bankImports
    case 'all':
    default:
      return [
        ...ALLOWED_MIME_TYPES.documents,
        ...ALLOWED_MIME_TYPES.images,
        ...ALLOWED_MIME_TYPES.audio,
      ]
  }
}

/**
 * Get accept string for file input (for HTML input accept attribute)
 */
export function getAcceptString(category: FileCategory): string {
  const mimeTypes = getAllowedMimeTypes(category)
  return mimeTypes.join(',')
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate a file for upload
 *
 * @param file File to validate
 * @param category File category for validation rules
 * @param maxSize Optional max size override
 * @returns Validation result with error details if invalid
 *
 * @example
 * ```ts
 * const result = validateFile(file, 'documents')
 * if (!result.valid) {
 *   toast.error(result.error.messageAr)
 *   return
 * }
 * // Proceed with upload
 * ```
 */
export function validateFile(
  file: File,
  category: FileCategory = 'all',
  maxSize?: number
): ValidationResult {
  // Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: {
        code: 'EMPTY_FILE',
        message: 'File is empty',
        messageAr: 'الملف فارغ',
      },
    }
  }

  // Check file size
  const maxAllowedSize = maxSize || getMaxFileSize(category)
  if (file.size > maxAllowedSize) {
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `File too large. Maximum size is ${formatFileSize(maxAllowedSize)}`,
        messageAr: `حجم الملف كبير جداً. الحد الأقصى ${formatFileSize(maxAllowedSize)}`,
      },
    }
  }

  // Check MIME type
  const allowedTypes = getAllowedMimeTypes(category)
  let fileType = file.type

  // If browser doesn't provide MIME type, try to infer from extension
  if (!fileType) {
    const inferredType = getMimeTypeFromExtension(file.name)
    if (inferredType) {
      fileType = inferredType
    }
  }

  if (!fileType || !allowedTypes.includes(fileType)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'File type not allowed',
        messageAr: 'نوع الملف غير مسموح به',
      },
    }
  }

  return { valid: true }
}

/**
 * Validate multiple files
 *
 * @param files Array of files to validate
 * @param category File category for validation rules
 * @param maxSize Optional max size override
 * @returns Array of validation results (one per file)
 */
export function validateFiles(
  files: File[],
  category: FileCategory = 'all',
  maxSize?: number
): ValidationResult[] {
  return files.map((file) => validateFile(file, category, maxSize))
}

/**
 * Check if all files are valid
 */
export function areAllFilesValid(results: ValidationResult[]): boolean {
  return results.every((result) => result.valid)
}

/**
 * Get first error from validation results
 */
export function getFirstError(results: ValidationResult[]): ValidationResult['error'] | null {
  const failed = results.find((result) => !result.valid)
  return failed?.error || null
}

// ============================================
// VOICE MEMO VALIDATION
// ============================================

/**
 * Validate voice memo file
 * Specialized validation for voice memos with appropriate limits
 */
export function validateVoiceMemo(file: File): ValidationResult {
  // Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: {
        code: 'EMPTY_FILE',
        message: 'Voice memo is empty',
        messageAr: 'المذكرة الصوتية فارغة',
      },
    }
  }

  // Check file size (25 MB for voice memos)
  if (file.size > FILE_SIZE_LIMITS.VOICE_MEMOS) {
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `Voice memo too large. Maximum size is ${formatFileSize(FILE_SIZE_LIMITS.VOICE_MEMOS)}`,
        messageAr: `حجم المذكرة الصوتية كبير جداً. الحد الأقصى ${formatFileSize(FILE_SIZE_LIMITS.VOICE_MEMOS)}`,
      },
    }
  }

  // Check MIME type
  if (!isVoiceMemo(file.type)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Invalid audio format for voice memo',
        messageAr: 'صيغة صوت غير صالحة للمذكرة الصوتية',
      },
    }
  }

  return { valid: true }
}

// ============================================
// BANK IMPORT VALIDATION
// ============================================

/**
 * Validate bank import file (CSV, OFX, QIF)
 */
export function validateBankImportFile(file: File): ValidationResult {
  // Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: {
        code: 'EMPTY_FILE',
        message: 'Import file is empty',
        messageAr: 'ملف الاستيراد فارغ',
      },
    }
  }

  // Check file size (10 MB for bank imports)
  if (file.size > FILE_SIZE_LIMITS.BANK_IMPORTS) {
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `Import file too large. Maximum size is ${formatFileSize(FILE_SIZE_LIMITS.BANK_IMPORTS)}`,
        messageAr: `حجم ملف الاستيراد كبير جداً. الحد الأقصى ${formatFileSize(FILE_SIZE_LIMITS.BANK_IMPORTS)}`,
      },
    }
  }

  // Check MIME type or extension
  const fileType = file.type || getMimeTypeFromExtension(file.name)
  if (!fileType || !isBankImportFile(fileType)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Only CSV, OFX, and QIF files are allowed',
        messageAr: 'يُسمح فقط بملفات CSV و OFX و QIF',
      },
    }
  }

  return { valid: true }
}

// ============================================
// FILE EXTENSION UTILITIES
// ============================================

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Get safe filename (sanitized for storage)
 * Removes special characters that could cause issues
 */
export function getSafeFilename(filename: string): string {
  // Get extension
  const ext = getFileExtension(filename)
  // Get name without extension
  const name = filename.slice(0, -(ext.length + 1))
  // Sanitize: keep alphanumeric, Arabic chars, spaces, dashes, underscores
  const safeName = name
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  // Return with extension
  return ext ? `${safeName}.${ext}` : safeName
}

/**
 * Generate unique filename with timestamp
 */
export function generateUniqueFilename(filename: string): string {
  const ext = getFileExtension(filename)
  const name = filename.slice(0, -(ext.length + 1))
  const timestamp = Date.now()
  return ext ? `${name}-${timestamp}.${ext}` : `${name}-${timestamp}`
}

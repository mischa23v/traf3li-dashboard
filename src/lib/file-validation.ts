/**
 * File Upload Security Validation Utilities
 *
 * Provides client-side validation for file uploads including:
 * - MIME type validation
 * - File size limits
 * - Filename sanitization
 * - Extension whitelisting
 */

export interface FileValidationResult {
  valid: boolean
  error?: string
  errorAr?: string
}

export interface FileValidationOptions {
  allowedTypes?: string[]
  maxSize?: number // in bytes
  allowedExtensions?: string[]
}

// Common file type groups
export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  PRESENTATIONS: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  CSV: ['text/csv', 'application/vnd.ms-excel'],
  CALENDAR: ['text/calendar', 'application/ics'],
  AUDIO: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/webm'],
  ARCHIVES: ['application/zip', 'application/x-rar-compressed', 'application/x-zip-compressed'],
  TEXT: ['text/plain'],
} as const

// Size limits (in bytes)
export const SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024,      // 5MB
  LOGO: 2 * 1024 * 1024,        // 2MB
  DOCUMENT: 50 * 1024 * 1024,   // 50MB
  ATTACHMENT: 10 * 1024 * 1024, // 10MB
  AUDIO: 25 * 1024 * 1024,      // 25MB
} as const

/**
 * Sanitize filename to prevent path traversal and XSS
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, '_') // Allow alphanumeric, dots, underscores, and Arabic characters
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255) // Limit length
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Validate a single file
 */
export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const {
    allowedTypes = [],
    maxSize = SIZE_LIMITS.ATTACHMENT,
    allowedExtensions = [],
  } = options

  // Check if file exists
  if (!file) {
    return {
      valid: false,
      error: 'No file selected',
      errorAr: 'لم يتم اختيار ملف',
    }
  }

  // Validate file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
      errorAr: `حجم الملف يتجاوز الحد الأقصى ${maxSizeMB} ميجابايت`,
    }
  }

  // Validate MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed',
      errorAr: 'نوع الملف غير مسموح',
    }
  }

  // Validate file extension
  if (allowedExtensions.length > 0) {
    const extension = getFileExtension(file.name)
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension .${extension} not allowed`,
        errorAr: `امتداد الملف .${extension} غير مسموح`,
      }
    }
  }

  // Additional check: ensure MIME type and extension match
  if (allowedTypes.length > 0 && allowedExtensions.length > 0) {
    const extension = getFileExtension(file.name)
    const expectedMimeTypes: { [key: string]: string[] } = {
      'jpg': ['image/jpeg'],
      'jpeg': ['image/jpeg'],
      'png': ['image/png'],
      'gif': ['image/gif'],
      'webp': ['image/webp'],
      'svg': ['image/svg+xml'],
      'pdf': ['application/pdf'],
      'doc': ['application/msword'],
      'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'xls': ['application/vnd.ms-excel'],
      'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      'ppt': ['application/vnd.ms-powerpoint'],
      'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      'csv': ['text/csv', 'application/vnd.ms-excel'],
      'ics': ['text/calendar', 'application/ics'],
      'txt': ['text/plain'],
      'zip': ['application/zip', 'application/x-zip-compressed'],
      'rar': ['application/x-rar-compressed'],
      'mp3': ['audio/mpeg', 'audio/mp3'],
      'wav': ['audio/wav'],
      'ogg': ['audio/ogg'],
      'm4a': ['audio/m4a'],
      'webm': ['audio/webm', 'video/webm'],
    }

    const expectedTypes = expectedMimeTypes[extension]
    if (expectedTypes && !expectedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type does not match extension',
        errorAr: 'نوع الملف لا يطابق الامتداد',
      }
    }
  }

  return { valid: true }
}

/**
 * Validate multiple files
 */
export function validateFiles(
  files: File[] | FileList,
  options: FileValidationOptions = {}
): FileValidationResult {
  const fileArray = Array.from(files)

  if (fileArray.length === 0) {
    return {
      valid: false,
      error: 'No files selected',
      errorAr: 'لم يتم اختيار ملفات',
    }
  }

  for (const file of fileArray) {
    const result = validateFile(file, options)
    if (!result.valid) {
      return result
    }
  }

  return { valid: true }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Create accept attribute string from MIME types
 */
export function createAcceptString(types: string[]): string {
  // Convert MIME types to file extensions for better browser support
  const mimeToExt: { [key: string]: string } = {
    'image/jpeg': '.jpg,.jpeg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'text/csv': '.csv',
    'text/calendar': '.ics',
    'application/ics': '.ical',
    'text/plain': '.txt',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'audio/m4a': '.m4a',
  }

  const extensions = new Set<string>()
  types.forEach(type => {
    const ext = mimeToExt[type]
    if (ext) {
      ext.split(',').forEach(e => extensions.add(e))
    } else {
      extensions.add(type) // Fallback to MIME type
    }
  })

  return Array.from(extensions).join(',')
}

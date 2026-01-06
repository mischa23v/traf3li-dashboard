/**
 * Document Debug Logger - Gold Standard Implementation
 *
 * Comprehensive logging for all document/file operations.
 * Helps diagnose upload failures, malware errors, and API issues.
 *
 * Features:
 * - Color-coded console output
 * - Structured logging with timestamps
 * - Sensitive data sanitization
 * - Log level filtering
 * - Log export for support tickets
 *
 * Usage:
 * - Enable in development: Automatically enabled
 * - Enable in production: Set localStorage.setItem('DEBUG_DOCUMENTS', 'true')
 * - Disable: Set localStorage.setItem('DEBUG_DOCUMENTS', 'false')
 *
 * @see docs/FRONTEND_DOCUMENT_SYSTEM_GUIDE.md
 */

// ============================================
// TYPES
// ============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type DocumentOperation =
  | 'UPLOAD_START'
  | 'UPLOAD_PROGRESS'
  | 'UPLOAD_TO_R2'
  | 'UPLOAD_CONFIRM'
  | 'UPLOAD_SUCCESS'
  | 'UPLOAD_ERROR'
  | 'DOWNLOAD_START'
  | 'DOWNLOAD_URL_RECEIVED'
  | 'DOWNLOAD_SUCCESS'
  | 'DOWNLOAD_ERROR'
  | 'PREVIEW_START'
  | 'PREVIEW_SUCCESS'
  | 'PREVIEW_ERROR'
  | 'DELETE_START'
  | 'DELETE_SUCCESS'
  | 'DELETE_ERROR'
  | 'VALIDATION_START'
  | 'VALIDATION_SUCCESS'
  | 'VALIDATION_ERROR'
  | 'MALWARE_DETECTED'
  | 'SCAN_FAILED'
  | 'PRESIGNED_URL_REQUEST'
  | 'PRESIGNED_URL_RECEIVED'
  | 'PRESIGNED_URL_ERROR'
  | 'API_REQUEST'
  | 'API_RESPONSE'
  | 'API_ERROR'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  operation: DocumentOperation
  message: string
  data?: Record<string, unknown>
  error?: {
    message: string
    code?: string
    status?: number
    stack?: string
  }
  duration?: number
  fileInfo?: {
    name?: string
    type?: string
    size?: number
    category?: string
  }
}

// ============================================
// CONFIGURATION
// ============================================

const LOG_COLORS = {
  debug: '#6b7280', // gray
  info: '#3b82f6', // blue
  warn: '#f59e0b', // amber
  error: '#ef4444', // red
}

const OPERATION_ICONS: Record<string, string> = {
  UPLOAD: '📤',
  DOWNLOAD: '📥',
  PREVIEW: '👁️',
  DELETE: '🗑️',
  VALIDATION: '✅',
  MALWARE: '🦠',
  SCAN: '🔍',
  PRESIGNED: '🔑',
  API: '🌐',
}

// In-memory log storage for export
const LOG_BUFFER: LogEntry[] = []
const MAX_LOG_BUFFER_SIZE = 500

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if debug logging is enabled
 */
export function isDebugEnabled(): boolean {
  // Always enabled in development
  if (typeof window !== 'undefined') {
    const debugFlag = localStorage.getItem('DEBUG_DOCUMENTS')
    if (debugFlag !== null) {
      return debugFlag === 'true'
    }
    // Default: enabled in development, disabled in production
    return process.env.NODE_ENV === 'development'
  }
  return false
}

/**
 * Enable debug logging
 */
export function enableDebugLogging(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('DEBUG_DOCUMENTS', 'true')
    console.log('%c[DocumentDebug] Debug logging ENABLED', 'color: #22c55e; font-weight: bold')
  }
}

/**
 * Disable debug logging
 */
export function disableDebugLogging(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('DEBUG_DOCUMENTS', 'false')
    console.log('%c[DocumentDebug] Debug logging DISABLED', 'color: #ef4444; font-weight: bold')
  }
}

/**
 * Get operation icon
 */
function getOperationIcon(operation: DocumentOperation): string {
  const prefix = operation.split('_')[0]
  return OPERATION_ICONS[prefix] || '📄'
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data }

  // Keys to redact
  const sensitiveKeys = [
    'authorization',
    'token',
    'password',
    'secret',
    'key',
    'cookie',
    'session',
  ]

  // Keys to truncate (presigned URLs)
  const truncateKeys = ['uploadUrl', 'downloadUrl', 'presignedUrl', 'url']

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase()

    // Redact sensitive keys
    if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
      sanitized[key] = '[REDACTED]'
      continue
    }

    // Truncate URLs (keep first 50 chars + ...)
    if (truncateKeys.some((s) => lowerKey.includes(s)) && typeof sanitized[key] === 'string') {
      const url = sanitized[key] as string
      if (url.length > 80) {
        sanitized[key] = url.substring(0, 50) + '...[truncated]'
      }
    }
  }

  return sanitized
}

/**
 * Format file size for display
 */
function formatSize(bytes?: number): string {
  if (!bytes) return 'unknown'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// ============================================
// CORE LOGGER
// ============================================

/**
 * Main logging function
 */
function log(
  level: LogLevel,
  operation: DocumentOperation,
  message: string,
  data?: Record<string, unknown>,
  error?: Error | { message: string; code?: string; status?: number }
): void {
  if (!isDebugEnabled()) return

  const timestamp = new Date().toISOString()
  const icon = getOperationIcon(operation)
  const color = LOG_COLORS[level]

  // Create log entry
  const entry: LogEntry = {
    timestamp,
    level,
    operation,
    message,
    data: data ? sanitizeData(data) : undefined,
    error: error
      ? {
          message: error.message,
          code: (error as any).code,
          status: (error as any).status || (error as any).response?.status,
          stack: error instanceof Error ? error.stack : undefined,
        }
      : undefined,
  }

  // Add to buffer
  LOG_BUFFER.push(entry)
  if (LOG_BUFFER.length > MAX_LOG_BUFFER_SIZE) {
    LOG_BUFFER.shift()
  }

  // Console output
  const prefix = `%c[${icon} ${operation}]`
  const style = `color: ${color}; font-weight: bold`

  switch (level) {
    case 'debug':
      console.debug(prefix, style, message, data || '')
      break
    case 'info':
      console.info(prefix, style, message, data || '')
      break
    case 'warn':
      console.warn(prefix, style, message, data || '')
      break
    case 'error':
      console.error(prefix, style, message, { data, error })
      break
  }
}

// ============================================
// PUBLIC LOGGING API
// ============================================

export const documentLogger = {
  // ============================================
  // UPLOAD OPERATIONS
  // ============================================

  /**
   * Log upload start
   */
  uploadStart: (file: File, context: { caseId?: string; taskId?: string; category?: string }) => {
    log('info', 'UPLOAD_START', `Starting upload: ${file.name}`, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      formattedSize: formatSize(file.size),
      ...context,
    })
  },

  /**
   * Log upload progress
   */
  uploadProgress: (fileName: string, percent: number) => {
    if (percent % 25 === 0 || percent === 100) {
      // Log at 0, 25, 50, 75, 100%
      log('debug', 'UPLOAD_PROGRESS', `Upload progress: ${percent}%`, {
        fileName,
        percent,
      })
    }
  },

  /**
   * Log presigned URL request
   */
  presignedUrlRequest: (endpoint: string, data: Record<string, unknown>) => {
    log('debug', 'PRESIGNED_URL_REQUEST', `Requesting presigned URL: ${endpoint}`, data)
  },

  /**
   * Log presigned URL received
   */
  presignedUrlReceived: (fileKey: string, expiresIn?: number) => {
    log('info', 'PRESIGNED_URL_RECEIVED', `Presigned URL received`, {
      fileKey,
      expiresIn,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined,
    })
  },

  /**
   * Log presigned URL error
   */
  presignedUrlError: (error: Error, context?: Record<string, unknown>) => {
    log('error', 'PRESIGNED_URL_ERROR', `Failed to get presigned URL: ${error.message}`, context, error)
  },

  /**
   * Log R2 upload start
   */
  r2UploadStart: (uploadUrl: string, fileSize: number) => {
    log('debug', 'UPLOAD_TO_R2', `Uploading directly to R2`, {
      uploadUrl: uploadUrl.substring(0, 50) + '...',
      fileSize,
      formattedSize: formatSize(fileSize),
    })
  },

  /**
   * Log upload confirmation
   */
  uploadConfirm: (fileKey: string, data: Record<string, unknown>) => {
    log('debug', 'UPLOAD_CONFIRM', `Confirming upload with backend`, {
      fileKey,
      ...data,
    })
  },

  /**
   * Log upload success
   */
  uploadSuccess: (
    file: { name: string; size: number },
    documentId: string,
    duration?: number
  ) => {
    log('info', 'UPLOAD_SUCCESS', `Upload completed: ${file.name}`, {
      fileName: file.name,
      fileSize: file.size,
      formattedSize: formatSize(file.size),
      documentId,
      duration: duration ? `${duration}ms` : undefined,
    })
  },

  /**
   * Log upload error
   */
  uploadError: (
    file: { name: string; type: string; size: number },
    error: Error,
    step?: 'presigned' | 'r2' | 'confirm'
  ) => {
    log(
      'error',
      'UPLOAD_ERROR',
      `Upload failed at ${step || 'unknown'} step: ${error.message}`,
      {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        step,
      },
      error
    )
  },

  // ============================================
  // DOWNLOAD OPERATIONS
  // ============================================

  /**
   * Log download start
   */
  downloadStart: (documentId: string, disposition: 'inline' | 'attachment') => {
    log('info', 'DOWNLOAD_START', `Requesting download URL`, {
      documentId,
      disposition,
    })
  },

  /**
   * Log download URL received
   */
  downloadUrlReceived: (documentId: string, fileName?: string) => {
    log('info', 'DOWNLOAD_URL_RECEIVED', `Download URL received`, {
      documentId,
      fileName,
    })
  },

  /**
   * Log download success
   */
  downloadSuccess: (documentId: string, fileName?: string) => {
    log('info', 'DOWNLOAD_SUCCESS', `Download initiated: ${fileName || documentId}`, {
      documentId,
      fileName,
    })
  },

  /**
   * Log download error
   */
  downloadError: (documentId: string, error: Error) => {
    log('error', 'DOWNLOAD_ERROR', `Download failed: ${error.message}`, { documentId }, error)
  },

  // ============================================
  // PREVIEW OPERATIONS
  // ============================================

  /**
   * Log preview start
   */
  previewStart: (documentId: string) => {
    log('info', 'PREVIEW_START', `Opening preview`, { documentId })
  },

  /**
   * Log preview success
   */
  previewSuccess: (documentId: string, fileName?: string) => {
    log('info', 'PREVIEW_SUCCESS', `Preview opened: ${fileName || documentId}`, {
      documentId,
      fileName,
    })
  },

  /**
   * Log preview error
   */
  previewError: (documentId: string, error: Error) => {
    log('error', 'PREVIEW_ERROR', `Preview failed: ${error.message}`, { documentId }, error)
  },

  // ============================================
  // DELETE OPERATIONS
  // ============================================

  /**
   * Log delete start
   */
  deleteStart: (documentId: string, fileName?: string) => {
    log('info', 'DELETE_START', `Deleting document: ${fileName || documentId}`, {
      documentId,
      fileName,
    })
  },

  /**
   * Log delete success
   */
  deleteSuccess: (documentId: string) => {
    log('info', 'DELETE_SUCCESS', `Document deleted`, { documentId })
  },

  /**
   * Log delete error
   */
  deleteError: (documentId: string, error: Error) => {
    log('error', 'DELETE_ERROR', `Delete failed: ${error.message}`, { documentId }, error)
  },

  // ============================================
  // VALIDATION OPERATIONS
  // ============================================

  /**
   * Log validation start
   */
  validationStart: (file: { name: string; type: string; size: number }, category?: string) => {
    log('debug', 'VALIDATION_START', `Validating file: ${file.name}`, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      formattedSize: formatSize(file.size),
      category,
    })
  },

  /**
   * Log validation success
   */
  validationSuccess: (fileName: string) => {
    log('debug', 'VALIDATION_SUCCESS', `Validation passed: ${fileName}`, { fileName })
  },

  /**
   * Log validation error
   */
  validationError: (
    file: { name: string; type: string; size: number },
    errorCode: string,
    message: string
  ) => {
    log('warn', 'VALIDATION_ERROR', `Validation failed: ${message}`, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      errorCode,
    })
  },

  // ============================================
  // MALWARE OPERATIONS
  // ============================================

  /**
   * Log malware detection
   */
  malwareDetected: (fileName: string, virus: string) => {
    log(
      'error',
      'MALWARE_DETECTED',
      `🚨 MALWARE DETECTED in ${fileName}: ${virus}`,
      {
        fileName,
        virus,
        action: 'File upload blocked',
      }
    )
  },

  /**
   * Log scan failure
   */
  scanFailed: (fileName: string, error?: Error) => {
    log(
      'error',
      'SCAN_FAILED',
      `Malware scan failed for ${fileName}`,
      { fileName },
      error
    )
  },

  // ============================================
  // API OPERATIONS
  // ============================================

  /**
   * Log API request
   */
  apiRequest: (method: string, url: string, data?: Record<string, unknown>) => {
    log('debug', 'API_REQUEST', `${method} ${url}`, data)
  },

  /**
   * Log API response
   */
  apiResponse: (method: string, url: string, status: number, duration?: number) => {
    log('debug', 'API_RESPONSE', `${method} ${url} - ${status}`, {
      status,
      duration: duration ? `${duration}ms` : undefined,
    })
  },

  /**
   * Log API error
   */
  apiError: (
    method: string,
    url: string,
    error: Error & { response?: { status?: number; data?: unknown } }
  ) => {
    log(
      'error',
      'API_ERROR',
      `${method} ${url} failed: ${error.message}`,
      {
        status: error.response?.status,
        responseData: error.response?.data,
      },
      error
    )
  },

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get all logs from buffer
   */
  getLogs: (): LogEntry[] => {
    return [...LOG_BUFFER]
  },

  /**
   * Get logs filtered by level
   */
  getLogsByLevel: (level: LogLevel): LogEntry[] => {
    return LOG_BUFFER.filter((entry) => entry.level === level)
  },

  /**
   * Get logs filtered by operation
   */
  getLogsByOperation: (operationPrefix: string): LogEntry[] => {
    return LOG_BUFFER.filter((entry) => entry.operation.startsWith(operationPrefix))
  },

  /**
   * Clear log buffer
   */
  clearLogs: (): void => {
    LOG_BUFFER.length = 0
    console.log('%c[DocumentDebug] Log buffer cleared', 'color: #6b7280')
  },

  /**
   * Export logs for support ticket
   */
  exportLogs: (): string => {
    const logs = LOG_BUFFER.map((entry) => ({
      ...entry,
      // Remove stack traces for cleaner export
      error: entry.error
        ? { ...entry.error, stack: undefined }
        : undefined,
    }))
    return JSON.stringify(logs, null, 2)
  },

  /**
   * Download logs as file
   */
  downloadLogs: (): void => {
    const logs = documentLogger.exportLogs()
    const blob = new Blob([logs], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document-debug-logs-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
  },

  /**
   * Print summary to console
   */
  printSummary: (): void => {
    const errors = LOG_BUFFER.filter((e) => e.level === 'error')
    const warnings = LOG_BUFFER.filter((e) => e.level === 'warn')
    const uploads = LOG_BUFFER.filter((e) => e.operation.startsWith('UPLOAD'))
    const downloads = LOG_BUFFER.filter((e) => e.operation.startsWith('DOWNLOAD'))

    console.log('%c📊 Document Debug Summary', 'color: #3b82f6; font-weight: bold; font-size: 14px')
    console.table({
      'Total Logs': LOG_BUFFER.length,
      Errors: errors.length,
      Warnings: warnings.length,
      'Upload Operations': uploads.length,
      'Download Operations': downloads.length,
    })

    if (errors.length > 0) {
      console.log('%c🚨 Recent Errors:', 'color: #ef4444; font-weight: bold')
      errors.slice(-5).forEach((e) => {
        console.error(`[${e.operation}] ${e.message}`, e.error)
      })
    }
  },
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).documentLogger = documentLogger
  (window as any).enableDocumentDebug = enableDebugLogging
  (window as any).disableDocumentDebug = disableDebugLogging
}

export default documentLogger

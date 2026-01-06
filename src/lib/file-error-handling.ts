/**
 * File Error Handling - Gold Standard Implementation
 *
 * Handles malware detection, scan failures, and other file operation errors.
 * Provides bilingual error messages (English/Arabic).
 *
 * @see docs/FRONTEND_DOCUMENT_SYSTEM_GUIDE.md
 */

import type {
  FileErrorCode,
  FileErrorResponse,
  MalwareErrorResponse,
  ScanFailedResponse,
} from '@/types/file-storage'
import { FILE_ERROR_MESSAGES } from '@/types/file-storage'

// ============================================
// ERROR CLASSES
// ============================================

/**
 * Base class for file operation errors
 */
export class FileOperationError extends Error {
  public readonly code: FileErrorCode
  public readonly messageAr: string
  public readonly details?: Record<string, unknown>

  constructor(
    code: FileErrorCode,
    message: string,
    messageAr: string,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'FileOperationError'
    this.code = code
    this.messageAr = messageAr
    this.details = details
  }
}

/**
 * Malware detected error
 * Thrown when ClamAV detects malware in an uploaded file
 */
export class MalwareDetectedError extends FileOperationError {
  public readonly fileName: string
  public readonly virus: string
  public readonly blocked: boolean

  constructor(fileName: string, virus: string, blocked: boolean = false) {
    super(
      'MALWARE_DETECTED',
      `File rejected: Malware detected (${virus})`,
      `ملف مرفوض: تم اكتشاف محتوى ضار (${virus})`,
      { fileName, virus, blocked }
    )
    this.name = 'MalwareDetectedError'
    this.fileName = fileName
    this.virus = virus
    this.blocked = blocked
  }
}

/**
 * Scan failed error
 * Thrown when malware scanning service is unavailable
 */
export class ScanFailedError extends FileOperationError {
  constructor() {
    super(
      'SCAN_FAILED',
      FILE_ERROR_MESSAGES.SCAN_FAILED.en,
      FILE_ERROR_MESSAGES.SCAN_FAILED.ar
    )
    this.name = 'ScanFailedError'
  }
}

/**
 * File too large error
 */
export class FileTooLargeError extends FileOperationError {
  public readonly fileSize: number
  public readonly maxSize: number

  constructor(fileSize: number, maxSize: number) {
    super(
      'FILE_TOO_LARGE',
      FILE_ERROR_MESSAGES.FILE_TOO_LARGE.en,
      FILE_ERROR_MESSAGES.FILE_TOO_LARGE.ar,
      { fileSize, maxSize }
    )
    this.name = 'FileTooLargeError'
    this.fileSize = fileSize
    this.maxSize = maxSize
  }
}

/**
 * Invalid file type error
 */
export class InvalidFileTypeError extends FileOperationError {
  public readonly fileType: string
  public readonly allowedTypes: string[]

  constructor(fileType: string, allowedTypes: string[] = []) {
    super(
      'INVALID_FILE_TYPE',
      FILE_ERROR_MESSAGES.INVALID_FILE_TYPE.en,
      FILE_ERROR_MESSAGES.INVALID_FILE_TYPE.ar,
      { fileType, allowedTypes }
    )
    this.name = 'InvalidFileTypeError'
    this.fileType = fileType
    this.allowedTypes = allowedTypes
  }
}

/**
 * Upload failed error
 */
export class UploadFailedError extends FileOperationError {
  constructor(details?: Record<string, unknown>) {
    super(
      'UPLOAD_FAILED',
      FILE_ERROR_MESSAGES.UPLOAD_FAILED.en,
      FILE_ERROR_MESSAGES.UPLOAD_FAILED.ar,
      details
    )
    this.name = 'UploadFailedError'
  }
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Check if error response is a malware error
 */
export function isMalwareError(error: unknown): error is MalwareErrorResponse {
  if (!error || typeof error !== 'object') return false
  const e = error as Record<string, unknown>
  return e.code === 'MALWARE_DETECTED' && e.success === false
}

/**
 * Check if error response is a scan failed error
 */
export function isScanFailedError(error: unknown): error is ScanFailedResponse {
  if (!error || typeof error !== 'object') return false
  const e = error as Record<string, unknown>
  return e.code === 'SCAN_FAILED' && e.success === false
}

/**
 * Check if error is a FileOperationError
 */
export function isFileOperationError(error: unknown): error is FileOperationError {
  return error instanceof FileOperationError
}

/**
 * Check if error is a MalwareDetectedError
 */
export function isMalwareDetectedError(error: unknown): error is MalwareDetectedError {
  return error instanceof MalwareDetectedError
}

// ============================================
// ERROR PARSING
// ============================================

/**
 * Parse API error response and return appropriate error
 *
 * @param error Axios error or API response
 * @returns FileOperationError or original error
 *
 * @example
 * ```ts
 * try {
 *   await uploadFile(file)
 * } catch (error) {
 *   const fileError = parseFileError(error)
 *   if (fileError instanceof MalwareDetectedError) {
 *     toast.error(fileError.messageAr)
 *   }
 * }
 * ```
 */
export function parseFileError(error: unknown): FileOperationError | Error {
  // Check if it's already a FileOperationError
  if (isFileOperationError(error)) {
    return error
  }

  // Check Axios error response
  const response = (error as { response?: { data?: FileErrorResponse; status?: number } })?.response
  const data = response?.data

  if (data) {
    // Malware detected
    if (isMalwareError(data)) {
      return new MalwareDetectedError(
        data.details.fileName,
        data.details.virus,
        data.details.blocked
      )
    }

    // Scan failed
    if (isScanFailedError(data)) {
      return new ScanFailedError()
    }

    // Other error codes
    if (data.code && data.code in FILE_ERROR_MESSAGES) {
      const messages = FILE_ERROR_MESSAGES[data.code as FileErrorCode]
      return new FileOperationError(
        data.code as FileErrorCode,
        messages.en,
        messages.ar,
        data.details
      )
    }

    // Generic error with message
    if (data.message) {
      return new FileOperationError(
        'UPLOAD_FAILED',
        data.message,
        data.message, // Use same message if no Arabic
        data.details
      )
    }
  }

  // Check HTTP status codes
  const status = response?.status
  if (status) {
    switch (status) {
      case 401:
        return new FileOperationError(
          'UNAUTHORIZED',
          FILE_ERROR_MESSAGES.UNAUTHORIZED.en,
          FILE_ERROR_MESSAGES.UNAUTHORIZED.ar
        )
      case 403:
        return new FileOperationError(
          'FORBIDDEN',
          FILE_ERROR_MESSAGES.FORBIDDEN.en,
          FILE_ERROR_MESSAGES.FORBIDDEN.ar
        )
      case 404:
        return new FileOperationError(
          'NOT_FOUND',
          FILE_ERROR_MESSAGES.NOT_FOUND.en,
          FILE_ERROR_MESSAGES.NOT_FOUND.ar
        )
      case 400:
        return new FileOperationError(
          'VALIDATION_ERROR',
          FILE_ERROR_MESSAGES.VALIDATION_ERROR.en,
          FILE_ERROR_MESSAGES.VALIDATION_ERROR.ar
        )
    }
  }

  // Return original error if we couldn't parse it
  if (error instanceof Error) {
    return error
  }

  return new Error(String(error))
}

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

/**
 * Handle file upload error with appropriate user feedback
 *
 * @param error Error from upload operation
 * @param showToast Function to show toast notification
 * @param language Current language for message selection
 *
 * @example
 * ```ts
 * try {
 *   await uploadFile(file)
 * } catch (error) {
 *   handleFileUploadError(error, toast.error, i18n.language)
 * }
 * ```
 */
export function handleFileUploadError(
  error: unknown,
  showToast: (message: string) => void,
  language: 'ar' | 'en' = 'ar'
): void {
  const fileError = parseFileError(error)

  if (isFileOperationError(fileError)) {
    const message = language === 'ar' ? fileError.messageAr : fileError.message
    showToast(message)
    return
  }

  // Fallback for unknown errors
  showToast(
    language === 'ar'
      ? FILE_ERROR_MESSAGES.UPLOAD_FAILED.ar
      : FILE_ERROR_MESSAGES.UPLOAD_FAILED.en
  )
}

/**
 * Get bilingual error message
 */
export function getBilingualErrorMessage(error: unknown): { en: string; ar: string } {
  const fileError = parseFileError(error)

  if (isFileOperationError(fileError)) {
    return {
      en: fileError.message,
      ar: fileError.messageAr,
    }
  }

  return {
    en: error instanceof Error ? error.message : FILE_ERROR_MESSAGES.UPLOAD_FAILED.en,
    ar: FILE_ERROR_MESSAGES.UPLOAD_FAILED.ar,
  }
}

/**
 * Get error message in specified language
 */
export function getLocalizedErrorMessage(
  error: unknown,
  language: 'ar' | 'en' = 'ar'
): string {
  const messages = getBilingualErrorMessage(error)
  return language === 'ar' ? messages.ar : messages.en
}

// ============================================
// ERROR LOGGING
// ============================================

/**
 * Log file operation error for debugging
 * Does NOT log sensitive information
 */
export function logFileError(error: unknown, operation: string): void {
  const fileError = parseFileError(error)

  if (isFileOperationError(fileError)) {
    console.error(`[FileError] ${operation}:`, {
      code: fileError.code,
      message: fileError.message,
      // Don't log virus names in production for security
      hasDetails: !!fileError.details,
    })
  } else {
    console.error(`[FileError] ${operation}:`, error)
  }
}

// ============================================
// RETRY LOGIC
// ============================================

/**
 * Check if error is retryable
 * Some errors (like malware) should not be retried
 */
export function isRetryableError(error: unknown): boolean {
  const fileError = parseFileError(error)

  if (isFileOperationError(fileError)) {
    // These errors are NOT retryable
    const nonRetryable: FileErrorCode[] = [
      'MALWARE_DETECTED',
      'INVALID_FILE_TYPE',
      'FILE_TOO_LARGE',
      'UNAUTHORIZED',
      'FORBIDDEN',
    ]
    return !nonRetryable.includes(fileError.code)
  }

  // Network errors are generally retryable
  return true
}

/**
 * Retry file operation with exponential backoff
 *
 * @param operation Async operation to retry
 * @param maxRetries Maximum number of retries (default: 3)
 * @param baseDelay Base delay in ms (default: 1000)
 */
export async function retryFileOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Don't retry non-retryable errors
      if (!isRetryableError(error)) {
        throw error
      }

      // Don't wait after last attempt
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

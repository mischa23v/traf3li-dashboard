/**
 * Secure File Download Utilities
 *
 * Provides security functions for handling file downloads:
 * - Filename sanitization to prevent path traversal
 * - Safe blob URL management with automatic cleanup
 * - Download validation
 */

import { sanitizeFilename } from '@/lib/file-validation'

/**
 * Options for secure file download
 */
export interface SecureDownloadOptions {
  /** The blob to download */
  blob: Blob
  /** Original filename (will be sanitized) */
  filename: string
  /** MIME type to validate against (optional) */
  expectedMimeType?: string
  /** Maximum file size in bytes (optional) */
  maxSize?: number
}

/**
 * Validates downloaded blob content
 */
function validateDownloadedBlob(
  blob: Blob,
  options: { expectedMimeType?: string; maxSize?: number }
): { valid: boolean; error?: string } {
  // Check blob size
  if (options.maxSize && blob.size > options.maxSize) {
    return {
      valid: false,
      error: `File size ${blob.size} exceeds maximum allowed size ${options.maxSize}`,
    }
  }

  // Validate MIME type if provided
  if (options.expectedMimeType && blob.type !== options.expectedMimeType) {
    // Allow empty blob type as some backends don't set it
    if (blob.type !== '') {
      console.warn(
        `MIME type mismatch: expected ${options.expectedMimeType}, got ${blob.type}`
      )
    }
  }

  // Check for minimum blob size (empty files)
  if (blob.size === 0) {
    return {
      valid: false,
      error: 'Downloaded file is empty',
    }
  }

  return { valid: true }
}

/**
 * Safely downloads a blob with automatic cleanup and security checks
 *
 * @example
 * ```typescript
 * const blob = await api.downloadDocument(id)
 * secureDownload({
 *   blob,
 *   filename: 'document.pdf',
 *   expectedMimeType: 'application/pdf',
 *   maxSize: 50 * 1024 * 1024, // 50MB
 * })
 * ```
 */
export function secureDownload(options: SecureDownloadOptions): void {
  const { blob, filename, expectedMimeType, maxSize } = options

  // Validate blob
  const validation = validateDownloadedBlob(blob, {
    expectedMimeType,
    maxSize,
  })

  if (!validation.valid) {
    throw new Error(`Download validation failed: ${validation.error}`)
  }

  // Sanitize filename to prevent path traversal and XSS
  const safeFilename = sanitizeFilename(filename)

  // Create object URL
  const url = URL.createObjectURL(blob)

  try {
    // Create temporary link element
    const link = document.createElement('a')
    link.href = url
    link.download = safeFilename
    link.style.display = 'none'

    // Append to body, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } finally {
    // Always cleanup the object URL to prevent memory leaks
    // Use setTimeout to ensure download has started
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)
  }
}

/**
 * Creates a managed blob URL that can be cleaned up
 * Useful for previews where you need the URL but want guaranteed cleanup
 *
 * @example
 * ```typescript
 * const manager = createManagedBlobUrl(blob)
 * setPreviewUrl(manager.url)
 * // Later when done
 * manager.revoke()
 * ```
 */
export function createManagedBlobUrl(blob: Blob): {
  url: string
  revoke: () => void
} {
  const url = URL.createObjectURL(blob)
  let revoked = false

  return {
    url,
    revoke: () => {
      if (!revoked) {
        URL.revokeObjectURL(url)
        revoked = true
      }
    },
  }
}

/**
 * Cleanup multiple blob URLs
 */
export function revokeBlobUrls(urls: string[]): void {
  urls.forEach((url) => {
    try {
      URL.revokeObjectURL(url)
    } catch (error) {
      console.warn('Failed to revoke blob URL:', url, error)
    }
  })
}

/**
 * Extract safe filename from Content-Disposition header
 */
export function extractFilenameFromHeader(
  contentDisposition: string | null
): string | null {
  if (!contentDisposition) return null

  // Try to extract filename from Content-Disposition header
  // Handles both: filename="..." and filename*=UTF-8''...
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
  const matches = filenameRegex.exec(contentDisposition)

  if (matches && matches[1]) {
    let filename = matches[1].replace(/['"]/g, '')

    // Handle RFC 5987 encoded filenames (filename*=UTF-8''...)
    if (filename.includes('UTF-8')) {
      filename = decodeURIComponent(filename.split("''")[1] || filename)
    }

    // Sanitize the extracted filename
    return sanitizeFilename(filename)
  }

  return null
}

/**
 * Generate a safe filename with timestamp
 * Useful when original filename is not available or untrusted
 */
export function generateSafeFilename(
  prefix: string,
  extension: string
): string {
  const timestamp = new Date().toISOString().split('T')[0]
  const sanitizedPrefix = sanitizeFilename(prefix)
  const sanitizedExt = extension.replace(/[^a-zA-Z0-9]/g, '')

  return `${sanitizedPrefix}-${timestamp}.${sanitizedExt}`
}

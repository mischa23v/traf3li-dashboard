/**
 * Unified Storage Service - Gold Standard Implementation
 *
 * Handles all file storage operations:
 * - Direct upload to Cloudflare R2 using presigned URLs
 * - Download URL generation with expiry handling
 * - File preview and download triggers
 * - Progress tracking
 *
 * Storage Provider: Cloudflare R2 (S3-compatible)
 * Security: ClamAV malware scanning, CloudTrail-style audit logging
 *
 * @see docs/FRONTEND_DOCUMENT_SYSTEM_GUIDE.md
 */

import apiClient from '@/lib/api'
import type {
  UploadUrlResponse,
  DownloadUrlResponse,
  ContentDisposition,
  DocumentCategory,
  CaseDocument,
  TaskAttachment,
  VoiceMemo,
} from '@/types/file-storage'
import { validateFile, type FileCategory } from '@/lib/file-validation'
import {
  parseFileError,
  MalwareDetectedError,
  ScanFailedError,
  UploadFailedError,
  retryFileOperation,
} from '@/lib/file-error-handling'
import { documentLogger } from '@/lib/document-debug-logger'

// ============================================
// TYPES
// ============================================

export interface UploadOptions {
  /** Progress callback (0-100) */
  onProgress?: (percent: number) => void
  /** Abort signal for cancellation */
  signal?: AbortSignal
  /** File category for validation */
  category?: FileCategory
  /** Skip client-side validation */
  skipValidation?: boolean
}

export interface UploadResult {
  success: true
  fileKey: string
}

export interface PresignedUploadOptions extends UploadOptions {
  /** Document category (for case documents) */
  documentCategory?: DocumentCategory
  /** File description */
  description?: string
}

// ============================================
// CORE UPLOAD FUNCTIONS
// ============================================

/**
 * Upload file directly to R2 using presigned URL
 *
 * This is the core upload function - uploads directly to Cloudflare R2
 * bypassing the backend server for better performance.
 *
 * @param uploadUrl Presigned URL from backend
 * @param file File to upload
 * @param options Upload options
 * @returns Upload result
 *
 * @example
 * ```ts
 * // Step 1: Get presigned URL from backend
 * const { uploadUrl, fileKey } = await getUploadUrl(...)
 *
 * // Step 2: Upload directly to R2
 * await uploadToR2(uploadUrl, file, { onProgress: setProgress })
 *
 * // Step 3: Confirm upload with backend
 * await confirmUpload(fileKey, ...)
 * ```
 */
export async function uploadToR2(
  uploadUrl: string,
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { onProgress, signal, category = 'all', skipValidation = false } = options
  const startTime = Date.now()

  // Client-side validation (defense in depth)
  if (!skipValidation) {
    documentLogger.validationStart(file, category)
    const validation = validateFile(file, category)
    if (!validation.valid) {
      documentLogger.validationError(file, validation.error?.code || 'UNKNOWN', validation.error?.message || 'Validation failed')
      throw new UploadFailedError({
        code: validation.error?.code,
        message: validation.error?.message,
      })
    }
    documentLogger.validationSuccess(file.name)
  }

  documentLogger.r2UploadStart(uploadUrl, file.size)

  try {
    // Use XMLHttpRequest for progress tracking
    return await new Promise<UploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          documentLogger.uploadProgress(file.name, percent)
          if (onProgress) onProgress(percent)
        }
      })

      // Success handler
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const duration = Date.now() - startTime
          documentLogger.uploadSuccess({ name: file.name, size: file.size }, 'r2-direct', duration)
          resolve({ success: true, fileKey: '' }) // fileKey comes from initial request
        } else {
          const error = new UploadFailedError({ status: xhr.status, response: xhr.responseText })
          documentLogger.uploadError(file, error, 'r2')
          reject(error)
        }
      })

      // Error handler
      xhr.addEventListener('error', () => {
        const error = new UploadFailedError({ status: xhr.status })
        documentLogger.uploadError(file, error, 'r2')
        reject(error)
      })

      // Abort handler
      xhr.addEventListener('abort', () => {
        const error = new Error('Upload cancelled')
        documentLogger.uploadError(file, error, 'r2')
        reject(error)
      })

      // Handle abort signal
      if (signal) {
        signal.addEventListener('abort', () => {
          xhr.abort()
        })
      }

      // Send request
      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  } catch (error) {
    documentLogger.uploadError(file, error as Error, 'r2')
    throw parseFileError(error)
  }
}

/**
 * Upload file using fetch API (simpler, no progress)
 * Use this for small files or when progress isn't needed
 */
export async function uploadToR2Simple(
  uploadUrl: string,
  file: File
): Promise<UploadResult> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!response.ok) {
    throw new UploadFailedError({ status: response.status })
  }

  return { success: true, fileKey: '' }
}

// ============================================
// CASE DOCUMENT OPERATIONS
// ============================================

/**
 * Upload document to case using presigned URL flow
 *
 * Complete 3-step flow:
 * 1. Get presigned URL from backend
 * 2. Upload directly to R2
 * 3. Confirm upload with backend
 *
 * @example
 * ```ts
 * const document = await uploadCaseDocument(caseId, file, {
 *   documentCategory: 'contract',
 *   description: 'Main service contract',
 *   onProgress: setProgress,
 * })
 * ```
 */
export async function uploadCaseDocument(
  caseId: string,
  file: File,
  options: PresignedUploadOptions = {}
): Promise<CaseDocument> {
  const { onProgress, documentCategory = 'other', description } = options
  const startTime = Date.now()

  documentLogger.uploadStart(file, { caseId, category: documentCategory })

  try {
    // Step 1: Get presigned URL
    documentLogger.presignedUrlRequest(`/cases/${caseId}/documents/upload-url`, {
      filename: file.name,
      contentType: file.type,
      fileSize: file.size,
      category: documentCategory,
    })

    const { data: uploadData } = await apiClient.post<UploadUrlResponse>(
      `/cases/${caseId}/documents/upload-url`,
      {
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
        category: documentCategory,
      }
    )

    if (!uploadData.success || !uploadData.uploadUrl) {
      const error = new UploadFailedError({ step: 'getUploadUrl' })
      documentLogger.presignedUrlError(error, { caseId })
      throw error
    }

    documentLogger.presignedUrlReceived(uploadData.fileKey, uploadData.expiresIn)

    // Step 2: Upload directly to R2
    await uploadToR2(uploadData.uploadUrl, file, {
      onProgress: (percent) => {
        // Report 0-90% for upload, save 90-100% for confirmation
        if (onProgress) onProgress(Math.round(percent * 0.9))
      },
      category: 'documents',
    })

    // Step 3: Confirm upload with backend
    documentLogger.uploadConfirm(uploadData.fileKey, {
      filename: file.name,
      size: file.size,
      category: documentCategory,
    })

    const { data: confirmData } = await apiClient.post(
      `/cases/${caseId}/documents/confirm-upload`,
      {
        fileKey: uploadData.fileKey,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        category: documentCategory,
        description,
      }
    )

    if (onProgress) onProgress(100)

    const duration = Date.now() - startTime
    documentLogger.uploadSuccess({ name: file.name, size: file.size }, confirmData.document?._id || 'unknown', duration)

    return confirmData.document
  } catch (error) {
    documentLogger.uploadError(file, error as Error, 'presigned')
    throw error
  }
}

/**
 * Get download URL for case document
 */
export async function getCaseDocumentDownloadUrl(
  caseId: string,
  documentId: string,
  disposition: ContentDisposition = 'attachment'
): Promise<string> {
  documentLogger.downloadStart(documentId, disposition)
  try {
    const { data } = await apiClient.get<DownloadUrlResponse>(
      `/cases/${caseId}/documents/${documentId}/download-url`,
      { params: { disposition } }
    )
    documentLogger.downloadUrlReceived(documentId, data.document?.fileName)
    return data.downloadUrl
  } catch (error) {
    documentLogger.downloadError(documentId, error as Error)
    throw error
  }
}

/**
 * Delete case document
 */
export async function deleteCaseDocument(
  caseId: string,
  documentId: string
): Promise<void> {
  documentLogger.deleteStart(documentId)
  try {
    await apiClient.delete(`/cases/${caseId}/documents/${documentId}`)
    documentLogger.deleteSuccess(documentId)
  } catch (error) {
    documentLogger.deleteError(documentId, error as Error)
    throw error
  }
}

// ============================================
// TASK ATTACHMENT OPERATIONS
// ============================================

/**
 * Upload task attachment (multipart - includes malware scan)
 *
 * Uses multipart upload which goes through the backend.
 * Backend scans file for malware before storing in R2.
 *
 * @throws {MalwareDetectedError} If malware is found
 * @throws {ScanFailedError} If malware scanner is unavailable
 */
export async function uploadTaskAttachment(
  taskId: string,
  file: File,
  options: UploadOptions = {}
): Promise<TaskAttachment> {
  const { onProgress, signal, category = 'all', skipValidation = false } = options
  const startTime = Date.now()

  documentLogger.uploadStart(file, { taskId, category })

  // Client-side validation
  if (!skipValidation) {
    documentLogger.validationStart(file, category)
    const validation = validateFile(file, category)
    if (!validation.valid) {
      documentLogger.validationError(file, validation.error?.code || 'UNKNOWN', validation.error?.message || 'Validation failed')
      throw new UploadFailedError({
        code: validation.error?.code,
        message: validation.error?.message,
      })
    }
    documentLogger.validationSuccess(file.name)
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    documentLogger.apiRequest('POST', `/tasks/${taskId}/attachments`, { fileName: file.name, fileSize: file.size })

    const { data } = await apiClient.post(
      `/tasks/${taskId}/attachments`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            documentLogger.uploadProgress(file.name, percent)
            if (onProgress) onProgress(percent)
          }
        },
      }
    )

    const duration = Date.now() - startTime
    documentLogger.uploadSuccess({ name: file.name, size: file.size }, data.attachment?._id || 'unknown', duration)

    return data.attachment
  } catch (error) {
    const parsedError = parseFileError(error)

    // Log malware detection specifically
    if (parsedError instanceof MalwareDetectedError) {
      documentLogger.malwareDetected(file.name, parsedError.virus)
    } else if (parsedError instanceof ScanFailedError) {
      documentLogger.scanFailed(file.name, parsedError)
    } else {
      documentLogger.uploadError(file, parsedError, 'confirm')
    }

    throw parsedError
  }
}

/**
 * Get download URL for task attachment
 */
export async function getTaskAttachmentDownloadUrl(
  taskId: string,
  attachmentId: string,
  disposition: ContentDisposition = 'attachment',
  versionId?: string
): Promise<string> {
  documentLogger.downloadStart(attachmentId, disposition)

  try {
    const params: Record<string, string> = { disposition }
    if (versionId) params.versionId = versionId

    const { data } = await apiClient.get<DownloadUrlResponse>(
      `/tasks/${taskId}/attachments/${attachmentId}/download-url`,
      { params }
    )

    documentLogger.downloadUrlReceived(attachmentId, data.attachment?.fileName)
    return data.downloadUrl
  } catch (error) {
    documentLogger.downloadError(attachmentId, error as Error)
    throw error
  }
}

/**
 * Delete task attachment
 */
export async function deleteTaskAttachment(
  taskId: string,
  attachmentId: string
): Promise<void> {
  documentLogger.deleteStart(attachmentId)
  try {
    await apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
    documentLogger.deleteSuccess(attachmentId)
  } catch (error) {
    documentLogger.deleteError(attachmentId, error as Error)
    throw error
  }
}

// ============================================
// VOICE MEMO OPERATIONS
// ============================================

/**
 * Upload voice memo to task
 *
 * @throws {MalwareDetectedError} If malware is found
 * @throws {ScanFailedError} If malware scanner is unavailable
 */
export async function uploadVoiceMemo(
  taskId: string,
  file: Blob,
  duration: number,
  options: UploadOptions = {}
): Promise<VoiceMemo> {
  const { onProgress, signal } = options
  const startTime = Date.now()
  const fileName = `voice-memo-${Date.now()}.webm`

  documentLogger.uploadStart(
    { name: fileName, type: 'audio/webm', size: file.size } as File,
    { taskId, category: 'audio' }
  )

  const formData = new FormData()
  formData.append('file', file, fileName)
  formData.append('duration', String(duration))

  try {
    documentLogger.apiRequest('POST', `/tasks/${taskId}/voice-memos`, { fileName, duration })

    const { data } = await apiClient.post(
      `/tasks/${taskId}/voice-memos`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            documentLogger.uploadProgress(fileName, percent)
            if (onProgress) onProgress(percent)
          }
        },
      }
    )

    const uploadDuration = Date.now() - startTime
    documentLogger.uploadSuccess({ name: fileName, size: file.size }, data.voiceMemo?._id || 'unknown', uploadDuration)

    return data.voiceMemo
  } catch (error) {
    const parsedError = parseFileError(error)

    if (parsedError instanceof MalwareDetectedError) {
      documentLogger.malwareDetected(fileName, parsedError.virus)
    } else if (parsedError instanceof ScanFailedError) {
      documentLogger.scanFailed(fileName, parsedError)
    } else {
      documentLogger.uploadError({ name: fileName, type: 'audio/webm', size: file.size } as File, parsedError, 'confirm')
    }

    throw parsedError
  }
}

// ============================================
// CLIENT ATTACHMENT OPERATIONS
// ============================================

/**
 * Upload attachments to client (multiple files)
 *
 * @throws {MalwareDetectedError} If malware is found
 * @throws {ScanFailedError} If malware scanner is unavailable
 */
export async function uploadClientAttachments(
  clientId: string,
  files: File[],
  options: UploadOptions = {}
): Promise<TaskAttachment[]> {
  const { onProgress, signal } = options

  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  try {
    const { data } = await apiClient.post(
      `/clients/${clientId}/attachments`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percent)
          }
        },
      }
    )

    return data.attachments
  } catch (error) {
    throw parseFileError(error)
  }
}

/**
 * Delete client attachment
 */
export async function deleteClientAttachment(
  clientId: string,
  attachmentId: string
): Promise<void> {
  await apiClient.delete(`/clients/${clientId}/attachments/${attachmentId}`)
}

// ============================================
// HR DOCUMENT OPERATIONS
// ============================================

/**
 * Upload HR employee document
 */
export async function uploadHRDocument(
  employeeId: string,
  fileKey: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  documentType: string
): Promise<unknown> {
  const { data } = await apiClient.post(
    `/hr/employees/${employeeId}/documents`,
    {
      fileKey,
      fileName,
      fileSize,
      fileType,
      documentType,
      bucket: 'documents',
    }
  )

  return data.data
}

/**
 * Delete HR employee document
 */
export async function deleteHRDocument(
  employeeId: string,
  documentId: string
): Promise<void> {
  await apiClient.delete(`/hr/employees/${employeeId}/documents/${documentId}`)
}

// ============================================
// DOWNLOAD/PREVIEW UTILITIES
// ============================================

/**
 * Preview file in new tab (opens with inline disposition)
 *
 * @param getUrlFn Function that returns download URL
 *
 * @example
 * ```ts
 * await previewFile(() =>
 *   getCaseDocumentDownloadUrl(caseId, documentId, 'inline')
 * )
 * ```
 */
export async function previewFile(getUrlFn: () => Promise<string>): Promise<void> {
  const url = await getUrlFn()
  window.open(url, '_blank')
}

/**
 * Download file (triggers browser save dialog)
 *
 * @param getUrlFn Function that returns download URL
 * @param filename Optional filename for download
 *
 * @example
 * ```ts
 * await downloadFile(
 *   () => getCaseDocumentDownloadUrl(caseId, documentId, 'attachment'),
 *   'contract.pdf'
 * )
 * ```
 */
export async function downloadFile(
  getUrlFn: () => Promise<string>,
  filename?: string
): Promise<void> {
  const url = await getUrlFn()

  const a = document.createElement('a')
  a.href = url
  if (filename) a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * Get fresh download URL (URLs expire after 15 minutes)
 *
 * IMPORTANT: Don't cache presigned URLs! Always get a fresh URL before use.
 *
 * @param getUrlFn Function that returns download URL
 */
export async function getFreshDownloadUrl(
  getUrlFn: () => Promise<string>
): Promise<string> {
  return await retryFileOperation(getUrlFn, 2, 500)
}

// ============================================
// BANK IMPORT OPERATIONS
// ============================================

/**
 * Import bank transactions from CSV
 *
 * @throws {MalwareDetectedError} If malware is found
 */
export async function importBankCSV(
  file: File,
  options: UploadOptions = {}
): Promise<unknown> {
  const { onProgress, signal } = options

  const formData = new FormData()
  formData.append('file', file)

  try {
    const { data } = await apiClient.post(
      '/bank-reconciliation/import/csv',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percent)
          }
        },
      }
    )

    return data
  } catch (error) {
    throw parseFileError(error)
  }
}

/**
 * Import bank transactions from OFX
 *
 * @throws {MalwareDetectedError} If malware is found
 */
export async function importBankOFX(
  file: File,
  options: UploadOptions = {}
): Promise<unknown> {
  const { onProgress, signal } = options

  const formData = new FormData()
  formData.append('file', file)

  try {
    const { data } = await apiClient.post(
      '/bank-reconciliation/import/ofx',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percent)
          }
        },
      }
    )

    return data
  } catch (error) {
    throw parseFileError(error)
  }
}

/**
 * Import bank transactions to specific account
 *
 * @throws {MalwareDetectedError} If malware is found
 */
export async function importBankTransactions(
  accountId: string,
  file: File,
  options: UploadOptions = {}
): Promise<unknown> {
  const { onProgress, signal } = options

  const formData = new FormData()
  formData.append('file', file)

  try {
    const { data } = await apiClient.post(
      `/bank-transactions/import/${accountId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percent)
          }
        },
      }
    )

    return data
  } catch (error) {
    throw parseFileError(error)
  }
}

// ============================================
// GENERIC STORAGE OPERATIONS
// ============================================

/**
 * Upload file to generic R2 storage
 *
 * @throws {MalwareDetectedError} If malware is found
 */
export async function uploadToGenericStorage(
  file: File,
  options: UploadOptions = {}
): Promise<unknown> {
  const { onProgress, signal } = options

  const formData = new FormData()
  formData.append('file', file)

  try {
    const { data } = await apiClient.post(
      '/storage/r2/files',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percent)
          }
        },
      }
    )

    return data
  } catch (error) {
    throw parseFileError(error)
  }
}

// ============================================
// EXPORT DEFAULT SERVICE OBJECT
// ============================================

const storageService = {
  // Core
  uploadToR2,
  uploadToR2Simple,

  // Case documents
  uploadCaseDocument,
  getCaseDocumentDownloadUrl,
  deleteCaseDocument,

  // Task attachments
  uploadTaskAttachment,
  getTaskAttachmentDownloadUrl,
  deleteTaskAttachment,

  // Voice memos
  uploadVoiceMemo,

  // Client attachments
  uploadClientAttachments,
  deleteClientAttachment,

  // HR documents
  uploadHRDocument,
  deleteHRDocument,

  // Download/Preview
  previewFile,
  downloadFile,
  getFreshDownloadUrl,

  // Bank imports
  importBankCSV,
  importBankOFX,
  importBankTransactions,

  // Generic storage
  uploadToGenericStorage,
}

export default storageService

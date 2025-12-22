import api from './api'
import { type DocumentVersion } from '@/features/documents/data/schema'

/**
 * Semantic versioning type for document versions.
 * Follows semantic versioning conventions:
 * - major: Breaking changes or significant rewrites (e.g., 1.0.0 → 2.0.0)
 * - minor: New features or enhancements (e.g., 1.0.0 → 1.1.0)
 * - patch: Bug fixes or minor corrections (e.g., 1.0.0 → 1.0.1)
 *
 * @example
 * ```typescript
 * const versionType: VersionType = 'major'
 * ```
 */
export type VersionType = 'major' | 'minor' | 'patch'

/**
 * Result of comparing two document versions.
 * Provides detailed comparison metrics including size and time differences.
 *
 * @interface VersionComparison
 * @property {DocumentVersion} version1 - First version in the comparison
 * @property {DocumentVersion} version2 - Second version in the comparison
 * @property {number} sizeDifference - Size difference in bytes (positive if version2 is larger)
 * @property {number} timeDifference - Time difference in milliseconds (positive if version2 is newer)
 * @property {Object} metadata - Additional comparison metadata
 * @property {boolean} metadata.version1IsNewer - True if version1 was created after version2
 * @property {number} metadata.percentageSizeChange - Percentage change in file size
 *
 * @example
 * ```typescript
 * const comparison = await documentVersionService.compareVersions('doc123', 'v1', 'v2')
 * console.log(`Size changed by ${comparison.metadata.percentageSizeChange}%`)
 * ```
 */
export interface VersionComparison {
  version1: DocumentVersion
  version2: DocumentVersion
  sizeDifference: number
  timeDifference: number
  metadata: {
    version1IsNewer: boolean
    percentageSizeChange: number
  }
}

/**
 * Data required to upload a new document version.
 * Supports semantic versioning and metadata tagging.
 *
 * @interface UploadVersionData
 * @property {File} file - The file to upload as a new version
 * @property {string} [changeNote] - Optional description of changes in this version
 * @property {VersionType} [versionType] - Type of version change (major/minor/patch)
 * @property {string[]} [tags] - Optional tags for categorizing the version
 *
 * @example
 * ```typescript
 * const data: UploadVersionData = {
 *   file: selectedFile,
 *   changeNote: 'Fixed critical security vulnerability',
 *   versionType: 'patch',
 *   tags: ['security', 'urgent']
 * }
 * await documentVersionService.uploadVersion('doc123', data)
 * ```
 */
export interface UploadVersionData {
  file: File
  changeNote?: string
  versionType?: VersionType
  tags?: string[]
}

/**
 * Statistical information about all versions of a document.
 * Useful for analytics and storage management.
 *
 * @interface VersionStatistics
 * @property {number} totalVersions - Total number of versions for the document
 * @property {number} totalSize - Combined size of all versions in bytes
 * @property {number} averageSize - Average version size in bytes
 * @property {DocumentVersion | null} oldestVersion - The earliest version created
 * @property {DocumentVersion | null} newestVersion - The most recent version created
 * @property {string | null} mostActiveUploader - User who uploaded the most versions
 *
 * @example
 * ```typescript
 * const stats = await documentVersionService.getVersionStatistics('doc123')
 * console.log(`Document has ${stats.totalVersions} versions using ${stats.totalSize} bytes`)
 * ```
 */
export interface VersionStatistics {
  totalVersions: number
  totalSize: number
  averageSize: number
  oldestVersion: DocumentVersion | null
  newestVersion: DocumentVersion | null
  mostActiveUploader: string | null
}

/**
 * Document Version Management Service
 *
 * Provides comprehensive API for managing document versions with support for:
 * - Semantic versioning (major/minor/patch)
 * - Version comparison and diff generation
 * - Upload and download operations with progress tracking
 * - Version restoration and cleanup
 * - Statistics and analytics
 *
 * @namespace documentVersionService
 *
 * @example
 * ```typescript
 * // Upload a new version
 * await documentVersionService.uploadVersion('doc123', {
 *   file: myFile,
 *   versionType: 'minor',
 *   changeNote: 'Added new section'
 * })
 *
 * // Compare two versions
 * const comparison = await documentVersionService.compareVersions('doc123', 'v1', 'v2')
 *
 * // Restore an old version
 * await documentVersionService.restoreVersion('doc123', 'v1')
 * ```
 */
const documentVersionService = {
  /**
   * Retrieves all versions for a specific document.
   *
   * **API Endpoint:** `GET /documents/:documentId/versions`
   *
   * Returns versions sorted by creation date (newest first).
   * Includes metadata such as version number, file size, uploader, and change notes.
   *
   * @param {string} documentId - The unique identifier of the document
   * @returns {Promise<DocumentVersion[]>} Array of all document versions
   *
   * @throws {Error} If document not found or user lacks permissions
   *
   * @example
   * ```typescript
   * const versions = await documentVersionService.listVersions('doc123')
   * console.log(`Document has ${versions.length} versions`)
   * versions.forEach(v => console.log(`v${v.versionNumber}: ${v.changeNote}`))
   * ```
   */
  listVersions: async (documentId: string): Promise<DocumentVersion[]> => {
    const response = await api.get(`/documents/${documentId}/versions`)
    return response.data
  },

  /**
   * Retrieves detailed information about a specific document version.
   *
   * **API Endpoint:** `GET /documents/:documentId/versions/:versionId`
   *
   * Returns complete version metadata including file properties, uploader info,
   * timestamps, and associated tags.
   *
   * @param {string} documentId - The unique identifier of the document
   * @param {string} versionId - The unique identifier of the version
   * @returns {Promise<DocumentVersion>} The requested document version
   *
   * @throws {Error} If document or version not found, or user lacks permissions
   *
   * @example
   * ```typescript
   * const version = await documentVersionService.getVersion('doc123', 'ver456')
   * console.log(`Version ${version.versionNumber} uploaded by ${version.uploadedBy}`)
   * ```
   */
  getVersion: async (documentId: string, versionId: string): Promise<DocumentVersion> => {
    const response = await api.get(`/documents/${documentId}/versions/${versionId}`)
    return response.data
  },

  /**
   * Uploads a new version of a document with semantic versioning support.
   *
   * **API Endpoint:** `POST /documents/:documentId/versions`
   *
   * Creates a new version with automatic version numbering based on the specified
   * version type (major/minor/patch). Supports progress tracking for large files
   * and allows attaching metadata like change notes and tags.
   *
   * @param {string} documentId - The unique identifier of the document
   * @param {UploadVersionData} data - Version upload data including file and metadata
   * @param {function} [onProgress] - Optional callback for upload progress (0-100)
   * @returns {Promise<DocumentVersion>} The newly created document version
   *
   * @throws {Error} If file validation fails or upload is interrupted
   *
   * @example
   * ```typescript
   * // Upload with progress tracking
   * const newVersion = await documentVersionService.uploadVersion(
   *   'doc123',
   *   {
   *     file: selectedFile,
   *     changeNote: 'Updated financial data for Q4',
   *     versionType: 'minor',
   *     tags: ['finance', 'quarterly']
   *   },
   *   (progress) => console.log(`Upload: ${progress}%`)
   * )
   * ```
   */
  uploadVersion: async (
    documentId: string,
    data: UploadVersionData,
    onProgress?: (progress: number) => void
  ): Promise<DocumentVersion> => {
    const formData = new FormData()
    formData.append('file', data.file)
    if (data.changeNote) formData.append('changeNote', data.changeNote)
    if (data.versionType) formData.append('versionType', data.versionType)
    if (data.tags) formData.append('tags', JSON.stringify(data.tags))

    const response = await api.post(`/documents/${documentId}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
    return response.data
  },

  /**
   * Downloads a specific version of a document to the user's device.
   *
   * **API Endpoint:** `GET /documents/:documentId/versions/:versionId/download`
   *
   * Retrieves the file as a blob and triggers a browser download with the specified
   * filename. Automatically handles cleanup of temporary URLs.
   *
   * @param {string} documentId - The unique identifier of the document
   * @param {string} versionId - The unique identifier of the version to download
   * @param {string} fileName - The name to use for the downloaded file
   * @returns {Promise<void>} Resolves when download is initiated
   *
   * @throws {Error} If version not found or download fails
   *
   * @example
   * ```typescript
   * await documentVersionService.downloadVersion(
   *   'doc123',
   *   'ver456',
   *   'contract_v2.pdf'
   * )
   * ```
   */
  downloadVersion: async (
    documentId: string,
    versionId: string,
    fileName: string
  ): Promise<void> => {
    const response = await api.get(`/documents/${documentId}/versions/${versionId}/download`, {
      responseType: 'blob',
    })

    const blob = response.data
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  /**
   * Retrieves a temporary download URL for a specific version.
   *
   * **API Endpoint:** `GET /documents/:documentId/versions/:versionId/download-url`
   *
   * Returns a time-limited, signed URL that can be used to download the version
   * without additional authentication. Useful for sharing or embedding.
   *
   * @param {string} documentId - The unique identifier of the document
   * @param {string} versionId - The unique identifier of the version
   * @returns {Promise<string>} Temporary download URL
   *
   * @throws {Error} If version not found or URL generation fails
   *
   * @example
   * ```typescript
   * const url = await documentVersionService.getVersionDownloadUrl('doc123', 'ver456')
   * window.open(url, '_blank')
   * ```
   */
  getVersionDownloadUrl: async (
    documentId: string,
    versionId: string
  ): Promise<string> => {
    const response = await api.get(
      `/documents/${documentId}/versions/${versionId}/download-url`
    )
    return response.data.url || response.data
  },

  /**
   * Retrieves a temporary preview URL for a specific version.
   *
   * **API Endpoint:** `GET /documents/:documentId/versions/:versionId/preview-url`
   *
   * Returns a time-limited URL for previewing the document version in a viewer
   * without downloading. Supports common formats (PDF, images, text files).
   *
   * @param {string} documentId - The unique identifier of the document
   * @param {string} versionId - The unique identifier of the version
   * @returns {Promise<string>} Temporary preview URL
   *
   * @throws {Error} If version not found or preview unavailable for file type
   *
   * @example
   * ```typescript
   * const previewUrl = await documentVersionService.getVersionPreviewUrl('doc123', 'ver456')
   * // Display in iframe or modal
   * ```
   */
  getVersionPreviewUrl: async (
    documentId: string,
    versionId: string
  ): Promise<string> => {
    const response = await api.get(
      `/documents/${documentId}/versions/${versionId}/preview-url`
    )
    return response.data.url || response.data
  },

  /**
   * Restores a specific version as the current version of the document.
   *
   * **API Endpoint:** `POST /documents/:documentId/versions/:versionId/restore`
   *
   * Creates a new version that is a copy of the specified historical version,
   * effectively rolling back changes. The restored version becomes the current one
   * while preserving the complete version history.
   *
   * @param {string} documentId - The unique identifier of the document
   * @param {string} versionId - The unique identifier of the version to restore
   * @returns {Promise<DocumentVersion>} The newly created version (copy of restored version)
   *
   * @throws {Error} If version not found or restore operation fails
   *
   * @example
   * ```typescript
   * // Restore to previous version after incorrect update
   * const restoredVersion = await documentVersionService.restoreVersion('doc123', 'ver456')
   * console.log(`Restored to version ${restoredVersion.versionNumber}`)
   * ```
   */
  restoreVersion: async (
    documentId: string,
    versionId: string
  ): Promise<DocumentVersion> => {
    const response = await api.post(`/documents/${documentId}/versions/${versionId}/restore`)
    return response.data
  },

  /**
   * Deletes a specific document version.
   *
   * **API Endpoint:** `DELETE /documents/:documentId/versions/:versionId`
   *
   * Permanently removes a version from the document's history.
   * Note: Cannot delete the current active version. Delete operations are logged
   * for audit purposes.
   *
   * @param {string} documentId - The unique identifier of the document
   * @param {string} versionId - The unique identifier of the version to delete
   * @returns {Promise<void>} Resolves when deletion is complete
   *
   * @throws {Error} If version is current, not found, or user lacks permissions
   *
   * @example
   * ```typescript
   * await documentVersionService.deleteVersion('doc123', 'ver456')
   * console.log('Version deleted successfully')
   * ```
   */
  deleteVersion: async (documentId: string, versionId: string): Promise<void> => {
    await api.delete(`/documents/${documentId}/versions/${versionId}`)
  },

  /**
   * Deletes old versions while keeping a specified number of recent versions.
   *
   * **API Endpoint:** `POST /documents/:documentId/versions/cleanup`
   *
   * Helps manage storage by removing older versions automatically.
   * Always preserves the current version and specified number of recent versions.
   * Useful for implementing retention policies.
   *
   * @param {string} documentId - The unique identifier of the document
   * @param {number} [keepCount=5] - Number of recent versions to retain (default: 5)
   * @returns {Promise<{deletedCount: number}>} Object containing count of deleted versions
   *
   * @throws {Error} If cleanup operation fails
   *
   * @example
   * ```typescript
   * // Keep only last 3 versions
   * const result = await documentVersionService.deleteOldVersions('doc123', 3)
   * console.log(`Cleaned up ${result.deletedCount} old versions`)
   * ```
   */
  deleteOldVersions: async (
    documentId: string,
    keepCount: number = 5
  ): Promise<{ deletedCount: number }> => {
    const response = await api.post(`/documents/${documentId}/versions/cleanup`, {
      keepCount,
    })
    return response.data
  },

  /**
   * Compares two document versions and provides detailed metrics.
   *
   * **API Endpoint:** `GET /documents/:documentId/versions/compare`
   *
   * Analyzes differences between two versions including file size changes,
   * time elapsed, and percentage differences. Does not show content-level changes
   * (use getVersionDiff for that).
   *
   * @param {string} documentId - The unique identifier of the document
   * @param {string} versionId1 - The unique identifier of the first version
   * @param {string} versionId2 - The unique identifier of the second version
   * @returns {Promise<VersionComparison>} Detailed comparison metrics
   *
   * @throws {Error} If either version not found
   *
   * @example
   * ```typescript
   * const comparison = await documentVersionService.compareVersions('doc123', 'v1', 'v2')
   * if (comparison.metadata.percentageSizeChange > 50) {
   *   console.log('File size increased by more than 50%')
   * }
   * ```
   */
  compareVersions: async (
    documentId: string,
    versionId1: string,
    versionId2: string
  ): Promise<VersionComparison> => {
    const response = await api.get(
      `/documents/${documentId}/versions/compare?v1=${versionId1}&v2=${versionId2}`
    )
    return response.data
  },

  /**
   * Retrieves statistical information about all versions of a document.
   *
   * **API Endpoint:** `GET /documents/:documentId/versions/statistics`
   *
   * Provides analytics including total versions, storage usage, average file size,
   * and contributor information. Useful for dashboards and storage management.
   *
   * @param {string} documentId - The unique identifier of the document
   * @returns {Promise<VersionStatistics>} Statistical summary of all versions
   *
   * @throws {Error} If document not found or statistics unavailable
   *
   * @example
   * ```typescript
   * const stats = await documentVersionService.getVersionStatistics('doc123')
   * console.log(`Storage used: ${stats.totalSize / 1024 / 1024} MB`)
   * console.log(`Most active contributor: ${stats.mostActiveUploader}`)
   * ```
   */
  getVersionStatistics: async (documentId: string): Promise<VersionStatistics> => {
    const response = await api.get(`/documents/${documentId}/versions/statistics`)
    return response.data
  },

  /**
   * Generates a diff showing content-level changes between two text-based versions.
   *
   * **API Endpoint:** `GET /documents/:documentId/versions/diff`
   *
   * Creates a line-by-line comparison showing additions, deletions, and modifications.
   * Only works with text-based files (txt, md, code files, etc.).
   * Returns diff in unified or split format.
   *
   * @param {string} documentId - The unique identifier of the document
   * @param {string} versionId1 - The unique identifier of the first version (older)
   * @param {string} versionId2 - The unique identifier of the second version (newer)
   * @returns {Promise<{diff: string, format: 'unified' | 'split'}>} Diff content and format
   *
   * @throws {Error} If versions are not text-based or diff generation fails
   *
   * @example
   * ```typescript
   * const { diff, format } = await documentVersionService.getVersionDiff('doc123', 'v1', 'v2')
   * console.log(`Changes (${format} format):`)
   * console.log(diff)
   * ```
   */
  getVersionDiff: async (
    documentId: string,
    versionId1: string,
    versionId2: string
  ): Promise<{ diff: string; format: 'unified' | 'split' }> => {
    const response = await api.get(
      `/documents/${documentId}/versions/diff?v1=${versionId1}&v2=${versionId2}`
    )
    return response.data
  },

  /**
   * Retrieves the actual content of a text-based document version.
   *
   * **API Endpoint:** `GET /documents/:documentId/versions/:versionId/content`
   *
   * Returns the raw content as a string for text-based files.
   * Useful for displaying content in editors or generating previews.
   *
   * @param {string} documentId - The unique identifier of the document
   * @param {string} versionId - The unique identifier of the version
   * @returns {Promise<{content: string, mimeType: string}>} Version content and MIME type
   *
   * @throws {Error} If version is not text-based or content retrieval fails
   *
   * @example
   * ```typescript
   * const { content, mimeType } = await documentVersionService.getVersionContent('doc123', 'ver456')
   * if (mimeType === 'text/markdown') {
   *   // Render markdown
   * }
   * ```
   */
  getVersionContent: async (
    documentId: string,
    versionId: string
  ): Promise<{ content: string; mimeType: string }> => {
    const response = await api.get(`/documents/${documentId}/versions/${versionId}/content`)
    return response.data
  },

  /**
   * Updates metadata for an existing version without changing the file.
   *
   * **API Endpoint:** `PATCH /documents/:documentId/versions/:versionId`
   *
   * Allows updating change notes and tags after a version has been created.
   * Useful for adding documentation or categorization after upload.
   *
   * @param {string} documentId - The unique identifier of the document
   * @param {string} versionId - The unique identifier of the version to update
   * @param {Object} data - Metadata to update
   * @param {string} [data.changeNote] - Updated change note
   * @param {string[]} [data.tags] - Updated tags array
   * @returns {Promise<DocumentVersion>} Updated version with new metadata
   *
   * @throws {Error} If version not found or user lacks permissions
   *
   * @example
   * ```typescript
   * const updated = await documentVersionService.updateVersionMetadata(
   *   'doc123',
   *   'ver456',
   *   {
   *     changeNote: 'Fixed typos in section 3',
   *     tags: ['reviewed', 'approved']
   *   }
   * )
   * ```
   */
  updateVersionMetadata: async (
    documentId: string,
    versionId: string,
    data: { changeNote?: string; tags?: string[] }
  ): Promise<DocumentVersion> => {
    const response = await api.patch(`/documents/${documentId}/versions/${versionId}`, data)
    return response.data
  },

  /**
   * Calculates the next version number based on semantic versioning type.
   *
   * **Client-side utility function** (does not call API)
   *
   * Implements a simplified semantic versioning scheme:
   * - major: Increments to next multiple of 10 (e.g., 1.2 → 10)
   * - minor: Increments by 1 (e.g., 1.2 → 2.2)
   * - patch: Increments by 0.1 (e.g., 1.2 → 1.3)
   *
   * Note: For full semantic versioning (x.y.z format), consider using a library like 'semver'.
   *
   * @param {number} currentVersion - The current version number
   * @param {VersionType} type - The type of version increment (major/minor/patch)
   * @returns {number} The calculated next version number
   *
   * @example
   * ```typescript
   * const nextMinor = documentVersionService.calculateNextVersion(2.3, 'minor')
   * // Returns: 3.3
   *
   * const nextMajor = documentVersionService.calculateNextVersion(2.3, 'major')
   * // Returns: 10
   *
   * const nextPatch = documentVersionService.calculateNextVersion(2.3, 'patch')
   * // Returns: 2.4
   * ```
   */
  calculateNextVersion: (currentVersion: number, type: VersionType): number => {
    // Simple integer versioning: major = +10, minor = +1, patch = +0.1
    // For more complex semantic versioning, use a library like semver
    switch (type) {
      case 'major':
        return Math.ceil(currentVersion / 10) * 10 + 10
      case 'minor':
        return currentVersion + 1
      case 'patch':
        return currentVersion + 0.1
      default:
        return currentVersion + 1
    }
  },
}

export default documentVersionService

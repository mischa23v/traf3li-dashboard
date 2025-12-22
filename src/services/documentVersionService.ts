import api from './api'
import { type DocumentVersion } from '@/features/documents/data/schema'

// Version type for semantic versioning
export type VersionType = 'major' | 'minor' | 'patch'

// Version comparison result
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

// Version upload data
export interface UploadVersionData {
  file: File
  changeNote?: string
  versionType?: VersionType
  tags?: string[]
}

// Version statistics
export interface VersionStatistics {
  totalVersions: number
  totalSize: number
  averageSize: number
  oldestVersion: DocumentVersion | null
  newestVersion: DocumentVersion | null
  mostActiveUploader: string | null
}

const documentVersionService = {
  // List all versions for a document
  listVersions: async (documentId: string): Promise<DocumentVersion[]> => {
    const response = await api.get(`/documents/${documentId}/versions`)
    return response.data
  },

  // Get a specific version
  getVersion: async (documentId: string, versionId: string): Promise<DocumentVersion> => {
    const response = await api.get(`/documents/${documentId}/versions/${versionId}`)
    return response.data
  },

  // Upload new version with semantic versioning
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

  // Download specific version
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

  // Get download URL for version
  getVersionDownloadUrl: async (
    documentId: string,
    versionId: string
  ): Promise<string> => {
    const response = await api.get(
      `/documents/${documentId}/versions/${versionId}/download-url`
    )
    return response.data.url || response.data
  },

  // Get preview URL for version
  getVersionPreviewUrl: async (
    documentId: string,
    versionId: string
  ): Promise<string> => {
    const response = await api.get(
      `/documents/${documentId}/versions/${versionId}/preview-url`
    )
    return response.data.url || response.data
  },

  // Restore specific version (makes it the current version)
  restoreVersion: async (
    documentId: string,
    versionId: string
  ): Promise<DocumentVersion> => {
    const response = await api.post(`/documents/${documentId}/versions/${versionId}/restore`)
    return response.data
  },

  // Delete a specific version (cannot delete current version)
  deleteVersion: async (documentId: string, versionId: string): Promise<void> => {
    await api.delete(`/documents/${documentId}/versions/${versionId}`)
  },

  // Delete old versions (keep only N latest versions)
  deleteOldVersions: async (
    documentId: string,
    keepCount: number = 5
  ): Promise<{ deletedCount: number }> => {
    const response = await api.post(`/documents/${documentId}/versions/cleanup`, {
      keepCount,
    })
    return response.data
  },

  // Compare two versions
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

  // Get version statistics
  getVersionStatistics: async (documentId: string): Promise<VersionStatistics> => {
    const response = await api.get(`/documents/${documentId}/versions/statistics`)
    return response.data
  },

  // Get diff between two text-based versions
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

  // Get version content (for text-based files)
  getVersionContent: async (
    documentId: string,
    versionId: string
  ): Promise<{ content: string; mimeType: string }> => {
    const response = await api.get(`/documents/${documentId}/versions/${versionId}/content`)
    return response.data
  },

  // Update version metadata (change note, tags)
  updateVersionMetadata: async (
    documentId: string,
    versionId: string,
    data: { changeNote?: string; tags?: string[] }
  ): Promise<DocumentVersion> => {
    const response = await api.patch(`/documents/${documentId}/versions/${versionId}`, data)
    return response.data
  },

  // Calculate next version number based on type
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

import api from './api'

// Document categories
export const documentCategories = [
  'contract',
  'judgment',
  'evidence',
  'correspondence',
  'pleading',
  'other',
] as const

export type DocumentCategory = (typeof documentCategories)[number]

// Document modules for R2 bucket routing
export const documentModules = [
  'crm',
  'finance',
  'hr',
  'tasks',
  'judgments',
  'documents',
] as const

export type DocumentModule = (typeof documentModules)[number]

// Document interface
export interface Document {
  _id: string
  lawyerId: string
  fileName: string
  originalName: string
  fileType: string
  fileSize: number
  url: string
  category: DocumentCategory
  caseId?: string | { _id: string; caseNumber: string; title: string }
  clientId?: string | { _id: string; fullName: string }
  description?: string
  tags?: string[]
  isConfidential: boolean
  isEncrypted: boolean
  uploadedBy: string | { _id: string; fullName: string }
  version: number
  parentDocumentId?: string
  shareToken?: string
  shareExpiresAt?: string
  accessCount?: number
  lastAccessedAt?: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
    pageCount?: number
  }
  createdAt: string
  updatedAt: string
}

// Document version
export interface DocumentVersion {
  _id: string
  version: number
  fileName: string
  originalName: string
  fileSize: number
  url: string
  uploadedBy: string | { _id: string; fullName: string }
  changeNote?: string
  createdAt: string
}

// Document filters
export interface DocumentFilters {
  category?: string
  caseId?: string
  clientId?: string
  search?: string
  isConfidential?: boolean
  page?: number
  limit?: number
}

// Document stats
export interface DocumentStats {
  totalDocuments: number
  confidentialDocuments: number
  totalStorageUsed: number
  documentsThisMonth: number
  byCategory: {
    category: DocumentCategory
    count: number
    totalSize: number
  }[]
  byFileType: {
    fileType: string
    count: number
  }[]
}

// Response types
export interface DocumentsResponse {
  data: Document[]
  total: number
  page: number
  limit: number
}

// Create document metadata
export interface CreateDocumentData {
  category: DocumentCategory
  module?: DocumentModule
  caseId?: string
  clientId?: string
  description?: string
  tags?: string[]
  isConfidential?: boolean
}

// Upload URL request data
export interface GetUploadUrlData {
  fileName: string
  fileType: string
  category: DocumentCategory
  module?: DocumentModule
  clientId?: string
}

// Upload URL response
export interface UploadUrlResponse {
  uploadUrl: string
  fileKey: string
  bucket: string
  module: DocumentModule
  expiresIn: number
}

// Confirm upload data
export interface ConfirmUploadData {
  fileName: string
  fileKey: string
  bucket: string
  module: DocumentModule
  category: DocumentCategory
  caseId?: string
  clientId?: string
  description?: string
  tags?: string[]
  isConfidential?: boolean
  fileSize?: number
  fileType?: string
}

// Update document metadata
export interface UpdateDocumentData {
  category?: DocumentCategory
  description?: string
  tags?: string[]
  isConfidential?: boolean
}

const documentsService = {
  // Get all documents with filters
  getDocuments: async (filters?: DocumentFilters): Promise<DocumentsResponse> => {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.caseId) params.append('caseId', filters.caseId)
    if (filters?.clientId) params.append('clientId', filters.clientId)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.isConfidential !== undefined) {
      params.append('isConfidential', String(filters.isConfidential))
    }
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/documents?${params.toString()}`)
    return response.data
  },

  // Get single document
  getDocument: async (id: string): Promise<Document> => {
    const response = await api.get(`/documents/${id}`)
    return response.data
  },

  // Get presigned upload URL
  getUploadUrl: async (data: GetUploadUrlData): Promise<UploadUrlResponse> => {
    const response = await api.post('/documents/upload', data)
    return response.data
  },

  // Upload file directly to R2/S3 using presigned URL
  uploadFileToStorage: async (
    uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded * 100) / event.total)
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'))
      })

      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  },

  // Confirm document upload (save metadata to DB)
  confirmUpload: async (data: ConfirmUploadData): Promise<Document> => {
    const response = await api.post('/documents/confirm', data)
    return response.data
  },

  // Upload new document (two-step presigned URL flow)
  uploadDocument: async (
    file: File,
    metadata: CreateDocumentData,
    onProgress?: (progress: number) => void
  ): Promise<Document> => {
    // Step 1: Get presigned upload URL
    const uploadUrlData: GetUploadUrlData = {
      fileName: file.name,
      fileType: file.type,
      category: metadata.category,
      module: metadata.module,
      clientId: metadata.clientId,
    }

    const { uploadUrl, fileKey, bucket, module } = await documentsService.getUploadUrl(uploadUrlData)

    // Step 2: Upload file directly to R2/S3
    await documentsService.uploadFileToStorage(uploadUrl, file, onProgress)

    // Step 3: Confirm upload and save metadata
    const confirmData: ConfirmUploadData = {
      fileName: file.name,
      fileKey,
      bucket,
      module,
      category: metadata.category,
      caseId: metadata.caseId,
      clientId: metadata.clientId,
      description: metadata.description,
      tags: metadata.tags,
      isConfidential: metadata.isConfidential,
      fileSize: file.size,
      fileType: file.type,
    }

    return documentsService.confirmUpload(confirmData)
  },

  // Update document metadata
  updateDocument: async (id: string, data: UpdateDocumentData): Promise<Document> => {
    const response = await api.patch(`/documents/${id}`, data)
    return response.data
  },

  // Delete document
  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`)
  },

  // Get documents by case
  getDocumentsByCase: async (caseId: string): Promise<Document[]> => {
    const response = await api.get(`/documents/case/${caseId}`)
    return response.data
  },

  // Get documents by client
  getDocumentsByClient: async (clientId: string): Promise<Document[]> => {
    const response = await api.get(`/documents/client/${clientId}`)
    return response.data
  },

  // Get document statistics
  getDocumentStats: async (): Promise<DocumentStats> => {
    const response = await api.get('/documents/stats')
    return response.data
  },

  // Download document
  downloadDocument: async (id: string): Promise<Blob> => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    })
    return response.data
  },

  // Get download URL with disposition (for S3 presigned URLs)
  getDownloadUrl: async (
    id: string,
    disposition: 'inline' | 'attachment' = 'attachment'
  ): Promise<string> => {
    const response = await api.get(`/documents/${id}/download-url`, {
      params: { disposition },
    })
    return response.data.downloadUrl
  },

  // Get preview URL (inline disposition)
  getPreviewUrl: async (id: string): Promise<string> => {
    const response = await api.get(`/documents/${id}/download-url`, {
      params: { disposition: 'inline' },
    })
    return response.data.downloadUrl
  },

  // Generate shareable link
  shareDocument: async (
    id: string,
    expiresIn?: number // hours
  ): Promise<{ shareLink: string; expiresAt: string }> => {
    const response = await api.post(`/documents/${id}/share`, { expiresIn })
    return response.data
  },

  // Revoke shareable link
  revokeShareLink: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}/share`)
  },

  // Upload new version of document
  uploadDocumentVersion: async (
    id: string,
    file: File,
    changeNote?: string,
    onProgress?: (progress: number) => void
  ): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)
    if (changeNote) formData.append('changeNote', changeNote)

    const response = await api.post(`/documents/${id}/version`, formData, {
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

  // Get document versions
  getDocumentVersions: async (id: string): Promise<DocumentVersion[]> => {
    const response = await api.get(`/documents/${id}/versions`)
    return response.data
  },

  // Restore document version
  restoreDocumentVersion: async (
    documentId: string,
    versionId: string
  ): Promise<Document> => {
    const response = await api.post(`/documents/${documentId}/versions/${versionId}/restore`)
    return response.data
  },

  // Encrypt document
  encryptDocument: async (id: string): Promise<Document> => {
    const response = await api.post(`/documents/${id}/encrypt`)
    return response.data
  },

  // Decrypt document (returns temporary URL)
  decryptDocument: async (id: string): Promise<{ decryptedUrl: string }> => {
    const response = await api.post(`/documents/${id}/decrypt`)
    return response.data
  },

  // Search documents
  searchDocuments: async (query: string): Promise<Document[]> => {
    const response = await api.get(`/documents/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Get recent documents
  getRecentDocuments: async (limit: number = 10): Promise<Document[]> => {
    const response = await api.get(`/documents/recent?limit=${limit}`)
    return response.data
  },

  // Bulk delete documents
  bulkDeleteDocuments: async (ids: string[]): Promise<void> => {
    await api.post('/documents/bulk-delete', { ids })
  },

  // Move document to case
  moveDocumentToCase: async (documentId: string, caseId: string): Promise<Document> => {
    const response = await api.patch(`/documents/${documentId}/move`, { caseId })
    return response.data
  },

  // Get judgments (special category)
  getJudgments: async (caseId?: string): Promise<Document[]> => {
    const params = new URLSearchParams()
    params.append('category', 'judgment')
    if (caseId) params.append('caseId', caseId)
    const response = await api.get(`/documents?${params.toString()}`)
    return response.data.data || response.data
  },
}

export default documentsService

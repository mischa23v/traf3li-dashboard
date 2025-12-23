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
  caseId?: string
  clientId?: string
  description?: string
  tags?: string[]
  isConfidential?: boolean
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

  // Get upload URL (S3 presigned URL)
  getUploadUrl: async (
    fileName: string,
    fileType: string,
    metadata: CreateDocumentData
  ): Promise<{ uploadUrl: string; documentId: string }> => {
    const response = await api.post('/documents/upload', {
      fileName,
      fileType,
      ...metadata,
    })
    return response.data
  },

  // Confirm upload after uploading to S3
  confirmUpload: async (documentId: string): Promise<Document> => {
    const response = await api.post('/documents/confirm', { documentId })
    return response.data
  },

  /**
   * Upload new document (legacy/direct upload)
   *
   * @deprecated This method uses direct upload and is kept for backward compatibility.
   * For new implementations, please use the S3-based upload flow:
   * 1. Call getUploadUrl() to get a presigned S3 URL
   * 2. Upload the file directly to S3 using the presigned URL
   * 3. Call confirmUpload() to finalize the document record
   *
   * @example
   * // Preferred S3-based approach:
   * const { uploadUrl, documentId } = await documentsService.getUploadUrl(file.name, file.type, metadata)
   * await fetch(uploadUrl, { method: 'PUT', body: file })
   * const document = await documentsService.confirmUpload(documentId)
   */
  uploadDocument: async (
    file: File,
    metadata: CreateDocumentData,
    onProgress?: (progress: number) => void
  ): Promise<Document> => {
    console.warn(
      'documentsService.uploadDocument() is deprecated. ' +
      'Please use the S3-based upload flow (getUploadUrl + confirmUpload) for better performance and scalability.'
    )

    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', metadata.category)
    if (metadata.caseId) formData.append('caseId', metadata.caseId)
    if (metadata.clientId) formData.append('clientId', metadata.clientId)
    if (metadata.description) formData.append('description', metadata.description)
    if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags))
    if (metadata.isConfidential !== undefined) {
      formData.append('isConfidential', String(metadata.isConfidential))
    }

    const response = await api.post('/documents/upload', formData, {
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
    await api.post(`/documents/${id}/revoke-share`)
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

    const response = await api.post(`/documents/${id}/versions`, formData, {
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
    const response = await api.post(`/documents/${documentId}/move`, { caseId })
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

  // Get preview URL (with inline disposition for browser viewing)
  getPreviewUrl: async (id: string): Promise<string> => {
    const response = await api.get(`/documents/${id}/preview-url`)
    return response.data.url || response.data
  },

  // Get download URL (with attachment disposition)
  getDownloadUrl: async (id: string, disposition: 'inline' | 'attachment' = 'attachment'): Promise<string> => {
    const response = await api.get(`/documents/${id}/download-url?disposition=${disposition}`)
    return response.data.url || response.data
  },

  // Encrypt document
  encryptDocument: async (id: string): Promise<Document> => {
    const response = await api.post(`/documents/${id}/encrypt`)
    return response.data
  },

  // Decrypt document
  decryptDocument: async (id: string): Promise<Blob> => {
    const response = await api.post(`/documents/${id}/decrypt`, {
      responseType: 'blob',
    })
    return response.data
  },
}

export default documentsService

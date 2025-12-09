/**
 * Legal Document Service
 * Handles all legal document template and management API calls
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Legal Document Interface
 */
export interface LegalDocument {
  _id: string
  title: string
  description?: string
  category: string
  type: 'template' | 'contract' | 'agreement' | 'form' | 'other'
  content: string
  fileUrl?: string
  fileName?: string
  fileType?: string
  fileSize?: number
  language: 'ar' | 'en' | 'both'
  isPublic: boolean
  accessLevel: 'public' | 'internal' | 'restricted'
  tags?: string[]
  version?: string
  downloadCount: number
  createdBy: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

/**
 * Create Legal Document Data
 */
export interface CreateLegalDocumentData {
  title: string
  description?: string
  category: string
  type: 'template' | 'contract' | 'agreement' | 'form' | 'other'
  content: string
  fileUrl?: string
  fileName?: string
  fileType?: string
  fileSize?: number
  language?: 'ar' | 'en' | 'both'
  isPublic?: boolean
  accessLevel?: 'public' | 'internal' | 'restricted'
  tags?: string[]
  version?: string
}

/**
 * Legal Document Filters
 */
export interface LegalDocumentFilters {
  category?: string
  type?: string
  language?: string
  accessLevel?: string
  isPublic?: boolean
  search?: string
  page?: number
  limit?: number
}

/**
 * Legal Document Service Object
 */
const legalDocumentService = {
  /**
   * Get all legal documents (public + auth-based filtering)
   * GET /api/legal-documents
   */
  getDocuments: async (filters?: LegalDocumentFilters): Promise<{ data: LegalDocument[]; pagination: any }> => {
    try {
      const response = await apiClient.get('/legal-documents', { params: filters })
      return {
        data: response.data.documents || response.data.data || [],
        pagination: response.data.pagination || {
          total: response.data.total || 0,
          page: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
        },
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single legal document
   * GET /api/legal-documents/:_id
   */
  getDocument: async (id: string): Promise<LegalDocument> => {
    try {
      const response = await apiClient.get(`/legal-documents/${id}`)
      return response.data.document || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create legal document
   * POST /api/legal-documents
   */
  createDocument: async (data: CreateLegalDocumentData): Promise<LegalDocument> => {
    try {
      const response = await apiClient.post('/legal-documents', data)
      return response.data.document || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update legal document
   * PATCH /api/legal-documents/:_id
   */
  updateDocument: async (id: string, data: Partial<CreateLegalDocumentData>): Promise<LegalDocument> => {
    try {
      const response = await apiClient.patch(`/legal-documents/${id}`, data)
      return response.data.document || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete legal document
   * DELETE /api/legal-documents/:_id
   */
  deleteDocument: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/legal-documents/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Increment download count
   * POST /api/legal-documents/:_id/download
   */
  incrementDownload: async (id: string): Promise<LegalDocument> => {
    try {
      const response = await apiClient.post(`/legal-documents/${id}/download`)
      return response.data.document || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Upload legal document file
   * POST /api/legal-documents/:_id/upload
   */
  uploadDocumentFile: async (id: string, file: File): Promise<LegalDocument> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post(`/legal-documents/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.document || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Search legal documents
   * GET /api/legal-documents/search
   */
  searchDocuments: async (query: string, filters?: LegalDocumentFilters): Promise<{ data: LegalDocument[]; count: number }> => {
    try {
      const response = await apiClient.get('/legal-documents/search', {
        params: { q: query, ...filters },
      })
      return {
        data: response.data.documents || response.data.data || [],
        count: response.data.count || response.data.total || 0,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get documents by category
   * GET /api/legal-documents/category/:category
   */
  getDocumentsByCategory: async (category: string): Promise<LegalDocument[]> => {
    try {
      const response = await apiClient.get(`/legal-documents/category/${category}`)
      return response.data.documents || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get document categories
   * GET /api/legal-documents/categories
   */
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get('/legal-documents/categories')
      return response.data.categories || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Duplicate document
   * POST /api/legal-documents/:_id/duplicate
   */
  duplicateDocument: async (id: string): Promise<LegalDocument> => {
    try {
      const response = await apiClient.post(`/legal-documents/${id}/duplicate`)
      return response.data.document || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export document to PDF
   * GET /api/legal-documents/:_id/export
   */
  exportDocument: async (id: string, format: 'pdf' | 'docx' = 'pdf'): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/legal-documents/${id}/export`, {
        params: { format },
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default legalDocumentService

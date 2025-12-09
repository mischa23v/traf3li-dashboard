/**
 * Case Rich Document Service
 * Handles all rich document-related API calls for cases
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  CaseRichDocument,
  CreateRichDocumentInput,
  UpdateRichDocumentInput,
  RichDocumentFilters,
  RichDocumentExportFormat,
  RichDocumentExportResponse,
  RichDocumentVersion
} from '@/types/caseRichDocument'

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

interface ApiResponse<T> {
  success?: boolean
  error?: boolean
  data?: T
  document?: CaseRichDocument
  documents?: CaseRichDocument[]
  message?: string
}

interface ListResponse {
  success?: boolean
  error?: boolean
  data?: {
    documents: CaseRichDocument[]
    count: number
  }
  documents?: CaseRichDocument[]
  count?: number
}

interface VersionsResponse {
  success?: boolean
  error?: boolean
  data?: {
    versions: RichDocumentVersion[]
    totalVersions: number
  }
  versions?: RichDocumentVersion[]
}

// ═══════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════

export const caseRichDocumentService = {
  /**
   * List rich documents for a case
   * GET /api/cases/:caseId/rich-documents
   */
  list: async (
    caseId: string,
    filters?: RichDocumentFilters
  ): Promise<{ documents: CaseRichDocument[]; count: number }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.documentType) params.append('documentType', filters.documentType)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const queryString = params.toString()
      const url = queryString
        ? `/cases/${caseId}/rich-documents?${queryString}`
        : `/cases/${caseId}/rich-documents`

      const response = await apiClient.get<ListResponse>(url)

      // Handle both response formats
      const documents = response.data.data?.documents || response.data.documents || []
      const count = response.data.data?.count || response.data.count || documents.length

      return { documents, count }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get a single rich document
   * GET /api/cases/:caseId/rich-documents/:docId
   */
  get: async (caseId: string, docId: string): Promise<CaseRichDocument> => {
    try {
      const response = await apiClient.get<ApiResponse<CaseRichDocument>>(
        `/cases/${caseId}/rich-documents/${docId}`
      )
      return response.data.data?.document || response.data.document!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create a new rich document
   * POST /api/cases/:caseId/rich-documents
   */
  create: async (
    caseId: string,
    data: CreateRichDocumentInput
  ): Promise<CaseRichDocument> => {
    try {
      const response = await apiClient.post<ApiResponse<CaseRichDocument>>(
        `/cases/${caseId}/rich-documents`,
        data
      )
      return response.data.data?.document || response.data.document!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update a rich document
   * PATCH /api/cases/:caseId/rich-documents/:docId
   */
  update: async (
    caseId: string,
    docId: string,
    data: UpdateRichDocumentInput
  ): Promise<CaseRichDocument> => {
    try {
      const response = await apiClient.patch<ApiResponse<CaseRichDocument>>(
        `/cases/${caseId}/rich-documents/${docId}`,
        data
      )
      return response.data.data?.document || response.data.document!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete a rich document
   * DELETE /api/cases/:caseId/rich-documents/:docId
   */
  delete: async (caseId: string, docId: string): Promise<void> => {
    try {
      await apiClient.delete(`/cases/${caseId}/rich-documents/${docId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get version history for a document
   * GET /api/cases/:caseId/rich-documents/:docId/versions
   */
  getVersionHistory: async (
    caseId: string,
    docId: string
  ): Promise<{ versions: RichDocumentVersion[]; totalVersions: number }> => {
    try {
      const response = await apiClient.get<VersionsResponse>(
        `/cases/${caseId}/rich-documents/${docId}/versions`
      )
      const versions = response.data.data?.versions || response.data.versions || []
      const totalVersions = response.data.data?.totalVersions || versions.length
      return { versions, totalVersions }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Restore a previous version
   * POST /api/cases/:caseId/rich-documents/:docId/versions/:versionNumber/restore
   */
  restoreVersion: async (
    caseId: string,
    docId: string,
    versionNumber: number
  ): Promise<CaseRichDocument> => {
    try {
      const response = await apiClient.post<ApiResponse<CaseRichDocument>>(
        `/cases/${caseId}/rich-documents/${docId}/versions/${versionNumber}/restore`
      )
      return response.data.data?.document || response.data.document!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export document to PDF
   * GET /api/cases/:caseId/rich-documents/:docId/export/pdf
   */
  exportPdf: async (caseId: string, docId: string): Promise<RichDocumentExportResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<RichDocumentExportResponse>>(
        `/cases/${caseId}/rich-documents/${docId}/export/pdf`
      )
      return response.data.data!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export document to LaTeX
   * GET /api/cases/:caseId/rich-documents/:docId/export/latex
   */
  exportLatex: async (caseId: string, docId: string): Promise<RichDocumentExportResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<RichDocumentExportResponse>>(
        `/cases/${caseId}/rich-documents/${docId}/export/latex`
      )
      return response.data.data!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export document to Markdown
   * GET /api/cases/:caseId/rich-documents/:docId/export/markdown
   */
  exportMarkdown: async (caseId: string, docId: string): Promise<RichDocumentExportResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<RichDocumentExportResponse>>(
        `/cases/${caseId}/rich-documents/${docId}/export/markdown`
      )
      return response.data.data!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get HTML preview
   * GET /api/cases/:caseId/rich-documents/:docId/preview
   */
  getPreview: async (caseId: string, docId: string): Promise<RichDocumentExportResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<RichDocumentExportResponse>>(
        `/cases/${caseId}/rich-documents/${docId}/preview`
      )
      return response.data.data!
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }
}

export default caseRichDocumentService

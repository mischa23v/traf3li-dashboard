/**
 * Cases Service
 * Handles all case-related API calls matching the backend API
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

/**
 * Plaintiff (Labor Case)
 */
export interface Plaintiff {
  name?: string
  nationalId?: string
  phone?: string
  address?: string
  city?: string
}

/**
 * Company (Labor Case)
 */
export interface Company {
  name?: string
  registrationNumber?: string
  address?: string
  city?: string
}

/**
 * Labor Case Details
 */
export interface LaborCaseDetails {
  plaintiff?: Plaintiff
  company?: Company
}

/**
 * Claim Item
 */
export interface Claim {
  _id?: string
  type: string
  amount: number
  period?: string
  description?: string
}

/**
 * Timeline Event
 */
export interface TimelineEvent {
  _id?: string
  event: string
  date: string
  type: 'court' | 'filing' | 'deadline' | 'general'
  status: 'upcoming' | 'completed'
}

/**
 * Case Note
 */
export interface CaseNote {
  _id?: string
  text: string
  date: string
}

/**
 * Case Document
 */
export interface CaseDocument {
  _id?: string
  filename: string
  url?: string
  fileKey?: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: string
  category: 'contract' | 'evidence' | 'correspondence' | 'judgment' | 'pleading' | 'other'
  bucket: 'general' | 'judgments'
  description?: string
}

/**
 * Case Hearing
 */
export interface CaseHearing {
  _id?: string
  date: string
  location: string
  notes?: string
  attended: boolean
}

/**
 * Lawyer Reference
 */
export interface LawyerRef {
  _id: string
  username?: string
  firstName?: string
  lastName?: string
  image?: string
  email?: string
}

/**
 * Client Reference
 */
export interface ClientRef {
  _id: string
  username?: string
  firstName?: string
  lastName?: string
  name?: string
  image?: string
  email?: string
}

/**
 * Case Status Type
 */
export type CaseStatus = 'active' | 'closed' | 'appeal' | 'settlement' | 'on-hold' | 'completed' | 'won' | 'lost' | 'settled'

/**
 * Case Outcome Type
 */
export type CaseOutcome = 'won' | 'lost' | 'settled' | 'ongoing'

/**
 * Case Priority Type
 */
export type CasePriority = 'low' | 'medium' | 'high' | 'critical'

/**
 * Case Category Type
 */
export type CaseCategory = 'labor' | 'commercial' | 'civil' | 'criminal' | 'family' | 'administrative' | 'other'

/**
 * Full Case Interface - Matches Backend
 */
export interface Case {
  _id: string

  // Basic Info
  title: string
  description?: string
  category: CaseCategory
  startDate?: string
  endDate?: string

  // Parties
  lawyerId: LawyerRef | string
  clientId?: ClientRef | string
  clientName?: string
  clientPhone?: string
  contractId?: string

  // Labor Case Details
  laborCaseDetails?: LaborCaseDetails

  // Court Info
  caseNumber?: string
  court?: string
  judge?: string
  nextHearing?: string

  // Status & Progress
  status: CaseStatus
  outcome: CaseOutcome
  progress: number
  priority: CasePriority

  // Financial
  claimAmount: number
  expectedWinAmount: number

  // Arrays
  claims: Claim[]
  timeline: TimelineEvent[]
  notes: CaseNote[]
  documents: CaseDocument[]
  hearings: CaseHearing[]

  // Metadata
  source: 'platform' | 'external'
  createdAt: string
  updatedAt: string
}

/**
 * Create Case Data - For External Clients
 */
export interface CreateCaseData {
  title: string
  category: CaseCategory
  description?: string
  clientName?: string
  clientPhone?: string
  laborCaseDetails?: LaborCaseDetails
  caseNumber?: string
  court?: string
  startDate?: string
  priority?: CasePriority
}

/**
 * Create Case Data - From Platform Contract
 */
export interface CreateCaseFromContractData {
  contractId: string
  title: string
  category: CaseCategory
  description?: string
}

/**
 * Update Case Data
 */
export interface UpdateCaseData {
  title?: string
  description?: string
  category?: CaseCategory
  status?: CaseStatus
  priority?: CasePriority
  progress?: number
  claimAmount?: number
  expectedWinAmount?: number
  caseNumber?: string
  court?: string
  judge?: string
  nextHearing?: string
  laborCaseDetails?: LaborCaseDetails
}

/**
 * Add Note Data
 */
export interface AddNoteData {
  text: string
}

/**
 * Add Document Data
 */
export interface AddDocumentData {
  name: string
  url: string
  type: string
  size: number
  category: 'contract' | 'evidence' | 'correspondence' | 'other'
}

/**
 * Add Hearing Data
 */
export interface AddHearingData {
  date: string
  location: string
  notes?: string
}

/**
 * Add Claim Data
 */
export interface AddClaimData {
  type: string
  amount: number
  period?: string
  description?: string
}

/**
 * Update Note Data
 */
export interface UpdateNoteData {
  text: string
}

/**
 * Update Hearing Data
 */
export interface UpdateHearingData {
  date?: string
  location?: string
  notes?: string
  attended?: boolean
}

/**
 * Update Claim Data
 */
export interface UpdateClaimData {
  type?: string
  amount?: number
  period?: string
  description?: string
}

/**
 * Add Timeline Event Data
 */
export interface AddTimelineEventData {
  event: string
  date: string
  type: 'court' | 'filing' | 'deadline' | 'general'
  status: 'upcoming' | 'completed'
}

/**
 * Update Timeline Event Data
 */
export interface UpdateTimelineEventData {
  event?: string
  date?: string
  type?: 'court' | 'filing' | 'deadline' | 'general'
  status?: 'upcoming' | 'completed'
}

/**
 * Document Upload URL Request
 */
export interface GetUploadUrlData {
  filename: string
  contentType: string
  category: 'contract' | 'evidence' | 'correspondence' | 'judgment' | 'pleading' | 'other'
}

/**
 * Document Upload URL Response
 */
export interface UploadUrlResponse {
  uploadUrl: string
  fileKey: string
  bucket: 'general' | 'judgments'
}

/**
 * Confirm Document Upload Data
 */
export interface ConfirmUploadData {
  filename: string
  fileKey: string
  bucket: 'general' | 'judgments'
  type: string
  size: number
  category: 'contract' | 'evidence' | 'correspondence' | 'judgment' | 'pleading' | 'other'
  description?: string
}

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  _id: string
  userId: {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
  }
  action: 'create' | 'update' | 'delete' | 'view'
  resource: 'case' | 'document' | 'hearing' | 'note' | 'claim' | 'timeline'
  resourceId: string
  changes?: {
    before?: Record<string, any>
    after?: Record<string, any>
  }
  timestamp: string
}

/**
 * Case Filters
 */
export interface CaseFilters {
  status?: CaseStatus
  outcome?: CaseOutcome
  category?: CaseCategory
  priority?: CasePriority
  lawyerId?: string
  clientId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Pagination Info
 */
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

/**
 * Case Statistics (for dashboard)
 */
export interface CaseStatistics {
  total: number
  active: number
  closed: number
  won: number
  lost: number
  settled: number
  onHold: number
  highPriority: number
  totalClaimAmount: number
  avgProgress: number
}

// ==================== PIPELINE TYPES ====================

/**
 * Pipeline Stage
 */
export interface PipelineStage {
  id: string
  name: string
  nameAr: string
  order: number
  isMandatory?: boolean
  canEnd?: boolean
  isFinal?: boolean
  maxDurationDays?: number
}

/**
 * Case Pipeline Card (for pipeline view)
 */
export interface CasePipelineCard {
  _id: string
  caseNumber?: string
  title: string
  category: CaseCategory
  status: CaseStatus
  priority: CasePriority
  currentStage: string
  stageEnteredAt: string
  plaintiffName?: string
  defendantName?: string
  court?: string
  judge?: string
  nextHearing?: string
  claimAmount: number
  expectedWinAmount: number
  outcome?: CaseOutcome
  tasksCount: number
  notionPagesCount: number
  remindersCount: number
  eventsCount: number
  notesCount: number
  daysInCurrentStage: number
  latestNote?: {
    text: string
    date: string
  }
  createdAt: string
  updatedAt: string
}

/**
 * Pipeline Statistics
 */
export interface PipelineStatistics {
  totalCases: number
  activeCases: number
  byCategory: Record<string, number>
  byStage: Record<string, number>
  avgDaysInStage: number
  casesOverdue: number
  successRate: number
}

/**
 * Move to Stage Data
 */
export interface MoveCaseToStageData {
  newStage: string
  notes?: string
}

/**
 * End Case Data
 */
export interface EndCaseData {
  outcome: 'won' | 'lost' | 'settled'
  endReason: string
  finalAmount?: number
  notes?: string
  endDate?: string
}

// ==================== API RESPONSES ====================

interface CasesResponse {
  error: boolean
  cases: Case[]
  pagination?: PaginationInfo
}

interface CaseResponse {
  error: boolean
  case: Case
}

interface MessageResponse {
  error: boolean
  message: string
  case?: Case
}

interface UploadUrlApiResponse {
  error: boolean
  uploadUrl: string
  fileKey: string
  bucket: 'general' | 'judgments'
}

interface DownloadUrlResponse {
  error: boolean
  downloadUrl: string
  filename: string
}

interface AuditLogResponse {
  error: boolean
  logs: AuditLogEntry[]
}

interface StatisticsResponse {
  error: boolean
  statistics: CaseStatistics & {
    byCategory?: Record<string, number>
    byMonth?: Array<{ month: string; created: number; closed: number }>
    successRate?: number
    totalWonAmount?: number
  }
}

interface PipelineCasesResponse {
  error: boolean
  data?: {
    cases: CasePipelineCard[]
    count: number
    pagination?: PaginationInfo
  }
  cases?: CasePipelineCard[]
  count?: number
  pagination?: PaginationInfo
}

interface PipelineStatisticsResponse {
  error: boolean
  data?: PipelineStatistics
  statistics?: PipelineStatistics
}

interface PipelineStagesResponse {
  error: boolean
  data?: {
    category: string
    stages: PipelineStage[]
  }
  stages?: PipelineStage[]
}

// ==================== SERVICE ====================

const casesService = {
  /**
   * Get all cases with optional filters
   * GET /api/cases/
   */
  getCases: async (filters?: CaseFilters): Promise<{ cases: Case[]; total: number; pagination?: PaginationInfo }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.outcome) params.append('outcome', filters.outcome)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.priority) params.append('priority', filters.priority)
      if (filters?.lawyerId) params.append('lawyerId', filters.lawyerId)
      if (filters?.clientId) params.append('clientId', filters.clientId)
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.append('dateTo', filters.dateTo)
      if (filters?.search) params.append('search', filters.search)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

      const queryString = params.toString()
      const url = queryString ? `/cases?${queryString}` : '/cases'

      const response = await apiClient.get<CasesResponse>(url)
      return {
        cases: response.data.cases || [],
        total: response.data.pagination?.total || response.data.cases?.length || 0,
        pagination: response.data.pagination,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single case by ID
   * GET /api/cases/:id
   */
  getCase: async (id: string): Promise<Case> => {
    try {
      const response = await apiClient.get<CaseResponse>(`/cases/${id}`)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create new case (external client)
   * POST /api/cases/
   */
  createCase: async (data: CreateCaseData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>('/cases', data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create case from platform contract
   * POST /api/cases/
   */
  createCaseFromContract: async (data: CreateCaseFromContractData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>('/cases', data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update case
   * PATCH /api/cases/:id
   */
  updateCase: async (id: string, data: UpdateCaseData): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${id}`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add note to case
   * POST /api/cases/:id/note
   */
  addNote: async (id: string, data: AddNoteData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(`/cases/${id}/note`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add document to case
   * POST /api/cases/:id/document
   */
  addDocument: async (id: string, data: AddDocumentData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(`/cases/${id}/document`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add hearing to case
   * POST /api/cases/:id/hearing
   */
  addHearing: async (id: string, data: AddHearingData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(`/cases/${id}/hearing`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Add claim to case
   * POST /api/cases/:id/claim
   */
  addClaim: async (id: string, data: AddClaimData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(`/cases/${id}/claim`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update case progress
   * PATCH /api/cases/:id/progress
   */
  updateProgress: async (id: string, progress: number): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${id}/progress`, { progress })
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update case status
   * PATCH /api/cases/:id/status
   */
  updateStatus: async (id: string, status: CaseStatus): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${id}/status`, { status })
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update case outcome
   * PATCH /api/cases/:id/outcome
   */
  updateOutcome: async (id: string, outcome: CaseOutcome): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${id}/outcome`, { outcome })
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete case (if supported)
   * DELETE /api/cases/:id
   */
  deleteCase: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/cases/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Calculate case statistics from cases array
   */
  calculateStatistics: (cases: Case[]): CaseStatistics => {
    const stats: CaseStatistics = {
      total: cases.length,
      active: 0,
      closed: 0,
      won: 0,
      lost: 0,
      settled: 0,
      onHold: 0,
      highPriority: 0,
      totalClaimAmount: 0,
      avgProgress: 0,
    }

    let totalProgress = 0

    cases.forEach((c) => {
      // Status counts
      if (c.status === 'active') stats.active++
      if (c.status === 'closed' || c.status === 'completed') stats.closed++
      if (c.status === 'won') stats.won++
      if (c.status === 'lost') stats.lost++
      if (c.status === 'settled' || c.status === 'settlement') stats.settled++
      if (c.status === 'on-hold') stats.onHold++

      // Priority counts
      if (c.priority === 'high' || c.priority === 'critical') stats.highPriority++

      // Financial
      stats.totalClaimAmount += c.claimAmount || 0

      // Progress
      totalProgress += c.progress || 0
    })

    stats.avgProgress = cases.length > 0 ? Math.round(totalProgress / cases.length) : 0

    return stats
  },

  /**
   * Get case statistics from API
   * GET /api/cases/statistics
   */
  getStatistics: async (): Promise<CaseStatistics> => {
    try {
      const response = await apiClient.get<StatisticsResponse>('/cases/statistics')
      return response.data.statistics
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== NOTES CRUD ====================

  /**
   * Update note in case
   * PATCH /api/cases/:id/notes/:noteId
   */
  updateNote: async (caseId: string, noteId: string, data: UpdateNoteData): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${caseId}/notes/${noteId}`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete note from case
   * DELETE /api/cases/:id/notes/:noteId
   */
  deleteNote: async (caseId: string, noteId: string): Promise<Case> => {
    try {
      const response = await apiClient.delete<CaseResponse>(`/cases/${caseId}/notes/${noteId}`)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== HEARINGS CRUD ====================

  /**
   * Update hearing in case
   * PATCH /api/cases/:id/hearings/:hearingId
   */
  updateHearing: async (caseId: string, hearingId: string, data: UpdateHearingData): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${caseId}/hearings/${hearingId}`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete hearing from case
   * DELETE /api/cases/:id/hearings/:hearingId
   */
  deleteHearing: async (caseId: string, hearingId: string): Promise<Case> => {
    try {
      const response = await apiClient.delete<CaseResponse>(`/cases/${caseId}/hearings/${hearingId}`)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== CLAIMS CRUD ====================

  /**
   * Update claim in case
   * PATCH /api/cases/:id/claims/:claimId
   */
  updateClaim: async (caseId: string, claimId: string, data: UpdateClaimData): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${caseId}/claims/${claimId}`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete claim from case
   * DELETE /api/cases/:id/claims/:claimId
   */
  deleteClaim: async (caseId: string, claimId: string): Promise<Case> => {
    try {
      const response = await apiClient.delete<CaseResponse>(`/cases/${caseId}/claims/${claimId}`)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== TIMELINE CRUD ====================

  /**
   * Add timeline event to case
   * POST /api/cases/:id/timeline
   */
  addTimelineEvent: async (caseId: string, data: AddTimelineEventData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(`/cases/${caseId}/timeline`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update timeline event in case
   * PATCH /api/cases/:id/timeline/:eventId
   */
  updateTimelineEvent: async (caseId: string, eventId: string, data: UpdateTimelineEventData): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${caseId}/timeline/${eventId}`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete timeline event from case
   * DELETE /api/cases/:id/timeline/:eventId
   */
  deleteTimelineEvent: async (caseId: string, eventId: string): Promise<Case> => {
    try {
      const response = await apiClient.delete<CaseResponse>(`/cases/${caseId}/timeline/${eventId}`)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== DOCUMENT MANAGEMENT ====================

  /**
   * Get presigned URL for document upload
   * POST /api/cases/:id/documents/upload-url
   */
  getDocumentUploadUrl: async (caseId: string, data: GetUploadUrlData): Promise<UploadUrlResponse> => {
    try {
      const response = await apiClient.post<UploadUrlApiResponse>(`/cases/${caseId}/documents/upload-url`, data)
      return {
        uploadUrl: response.data.uploadUrl,
        fileKey: response.data.fileKey,
        bucket: response.data.bucket,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Confirm document upload (save metadata to DB)
   * POST /api/cases/:id/documents/confirm
   */
  confirmDocumentUpload: async (caseId: string, data: ConfirmUploadData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(`/cases/${caseId}/documents/confirm`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get presigned URL for document download
   * GET /api/cases/:id/documents/:docId/download
   */
  getDocumentDownloadUrl: async (caseId: string, docId: string): Promise<{ downloadUrl: string; filename: string }> => {
    try {
      const response = await apiClient.get<DownloadUrlResponse>(`/cases/${caseId}/documents/${docId}/download`)
      return {
        downloadUrl: response.data.downloadUrl,
        filename: response.data.filename,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete document from case
   * DELETE /api/cases/:id/documents/:docId
   */
  deleteDocument: async (caseId: string, docId: string): Promise<Case> => {
    try {
      const response = await apiClient.delete<CaseResponse>(`/cases/${caseId}/documents/${docId}`)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Upload file directly to S3 using presigned URL
   */
  uploadFileToS3: async (uploadUrl: string, file: File): Promise<void> => {
    try {
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })
    } catch (error: any) {
      throw new Error('Failed to upload file to storage')
    }
  },

  // ==================== AUDIT LOGGING ====================

  /**
   * Get audit history for case
   * GET /api/cases/:id/audit
   */
  getAuditHistory: async (caseId: string): Promise<AuditLogEntry[]> => {
    try {
      const response = await apiClient.get<AuditLogResponse>(`/cases/${caseId}/audit`)
      return response.data.logs || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== RICH DOCUMENTS (CKEditor) ====================

  /**
   * Create rich document (CKEditor content)
   * POST /api/cases/:id/rich-documents
   */
  createRichDocument: async (caseId: string, data: {
    title: string
    content: string
    category?: string
    tags?: string[]
  }): Promise<any> => {
    try {
      const response = await apiClient.post(`/cases/${caseId}/rich-documents`, data)
      return response.data.document || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get all rich documents for a case
   * GET /api/cases/:id/rich-documents
   */
  getRichDocuments: async (caseId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/cases/${caseId}/rich-documents`)
      return response.data.documents || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get single rich document
   * GET /api/cases/:id/rich-documents/:docId
   */
  getRichDocument: async (caseId: string, docId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/cases/${caseId}/rich-documents/${docId}`)
      return response.data.document || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update rich document
   * PATCH /api/cases/:id/rich-documents/:docId
   */
  updateRichDocument: async (caseId: string, docId: string, data: {
    title?: string
    content?: string
    category?: string
    tags?: string[]
  }): Promise<any> => {
    try {
      const response = await apiClient.patch(`/cases/${caseId}/rich-documents/${docId}`, data)
      return response.data.document || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete rich document
   * DELETE /api/cases/:id/rich-documents/:docId
   */
  deleteRichDocument: async (caseId: string, docId: string): Promise<void> => {
    try {
      await apiClient.delete(`/cases/${caseId}/rich-documents/${docId}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get rich document version history
   * GET /api/cases/:id/rich-documents/:docId/versions
   */
  getRichDocumentVersions: async (caseId: string, docId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/cases/${caseId}/rich-documents/${docId}/versions`)
      return response.data.versions || response.data.data || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Restore rich document to a previous version
   * POST /api/cases/:id/rich-documents/:docId/versions/:versionNumber/restore
   */
  restoreRichDocumentVersion: async (caseId: string, docId: string, versionNumber: number): Promise<any> => {
    try {
      const response = await apiClient.post(`/cases/${caseId}/rich-documents/${docId}/versions/${versionNumber}/restore`)
      return response.data.document || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export rich document to PDF
   * GET /api/cases/:id/rich-documents/:docId/export/pdf
   */
  exportRichDocumentToPdf: async (caseId: string, docId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/cases/${caseId}/rich-documents/${docId}/export/pdf`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export rich document to LaTeX
   * GET /api/cases/:id/rich-documents/:docId/export/latex
   */
  exportRichDocumentToLatex: async (caseId: string, docId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/cases/${caseId}/rich-documents/${docId}/export/latex`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export rich document to Markdown
   * GET /api/cases/:id/rich-documents/:docId/export/markdown
   */
  exportRichDocumentToMarkdown: async (caseId: string, docId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/cases/${caseId}/rich-documents/${docId}/export/markdown`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get rich document HTML preview
   * GET /api/cases/:id/rich-documents/:docId/preview
   */
  getRichDocumentPreview: async (caseId: string, docId: string): Promise<{ html: string }> => {
    try {
      const response = await apiClient.get(`/cases/${caseId}/rich-documents/${docId}/preview`)
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  // ==================== PIPELINE ====================

  /**
   * Get cases for pipeline view
   * GET /api/cases/pipeline
   */
  getPipelineCases: async (filters?: {
    category?: CaseCategory
    status?: CaseStatus
    stage?: string
    lawyerId?: string
    page?: number
    limit?: number
  }): Promise<{ cases: CasePipelineCard[]; count: number; pagination?: PaginationInfo }> => {
    try {
      const params = new URLSearchParams()
      if (filters?.category) params.append('category', filters.category)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.stage) params.append('stage', filters.stage)
      if (filters?.lawyerId) params.append('lawyerId', filters.lawyerId)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const queryString = params.toString()
      const url = queryString ? `/cases/pipeline?${queryString}` : '/cases/pipeline'

      const response = await apiClient.get<PipelineCasesResponse>(url)
      const cases = response.data.data?.cases || response.data.cases || []
      const count = response.data.data?.count || response.data.count || cases.length
      const pagination = response.data.data?.pagination || response.data.pagination

      return { cases, count, pagination }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get pipeline statistics
   * GET /api/cases/pipeline/statistics
   */
  getPipelineStatistics: async (): Promise<PipelineStatistics> => {
    try {
      const response = await apiClient.get<PipelineStatisticsResponse>('/cases/pipeline/statistics')
      return response.data.data || response.data.statistics!
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get valid stages for a case category
   * GET /api/cases/pipeline/stages/:category
   */
  getPipelineStages: async (category: CaseCategory): Promise<PipelineStage[]> => {
    try {
      const response = await apiClient.get<PipelineStagesResponse>(`/cases/pipeline/stages/${category}`)
      return response.data.data?.stages || response.data.stages || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Move case to a new stage
   * PATCH /api/cases/:id/stage
   */
  moveCaseToStage: async (caseId: string, data: MoveCaseToStageData): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${caseId}/stage`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * End case with outcome
   * PATCH /api/cases/:id/end
   */
  endCase: async (caseId: string, data: EndCaseData): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${caseId}/end`, data)
      return response.data.case
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default casesService

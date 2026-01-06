/**
 * Cases Service
 * Handles all case-related API calls matching the backend API
 *
 * ⚠️ IMPORTANT: Some endpoints are not yet implemented in the backend.
 * These endpoints will throw bilingual error messages when called.
 * See individual function documentation for implementation status.
 */

import apiClient, { handleApiError } from '@/lib/api'
import { formatBilingualError } from '@/lib/bilingualErrorHandler'
import { documentLogger } from '@/lib/document-debug-logger'

/**
 * Bilingual error messages for case operations
 */
const CASE_ERRORS = {
  NOT_IMPLEMENTED: {
    en: 'This feature is not available yet. Please contact support.',
    ar: 'هذه الميزة غير متاحة حالياً. يرجى التواصل مع الدعم.',
  },
  CASE_NOT_FOUND: {
    en: 'Case not found.',
    ar: 'القضية غير موجودة.',
  },
  CASE_CREATE_FAILED: {
    en: 'Failed to create case. Please try again.',
    ar: 'فشل إنشاء القضية. يرجى المحاولة مرة أخرى.',
  },
  CASE_UPDATE_FAILED: {
    en: 'Failed to update case. Please try again.',
    ar: 'فشل تحديث القضية. يرجى المحاولة مرة أخرى.',
  },
  CASE_DELETE_FAILED: {
    en: 'Failed to delete case. Please try again.',
    ar: 'فشل حذف القضية. يرجى المحاولة مرة أخرى.',
  },
  NOTE_OPERATION_FAILED: {
    en: 'Failed to perform note operation. Please try again.',
    ar: 'فشل تنفيذ عملية الملاحظة. يرجى المحاولة مرة أخرى.',
  },
  DOCUMENT_OPERATION_FAILED: {
    en: 'Failed to perform document operation. Please try again.',
    ar: 'فشل تنفيذ عملية المستند. يرجى المحاولة مرة أخرى.',
  },
  HEARING_OPERATION_FAILED: {
    en: 'Failed to perform hearing operation. Please try again.',
    ar: 'فشل تنفيذ عملية الجلسة. يرجى المحاولة مرة أخرى.',
  },
  CLAIM_OPERATION_FAILED: {
    en: 'Failed to perform claim operation. Please try again.',
    ar: 'فشل تنفيذ عملية المطالبة. يرجى المحاولة مرة أخرى.',
  },
  TIMELINE_OPERATION_FAILED: {
    en: 'Failed to perform timeline operation. Please try again.',
    ar: 'فشل تنفيذ عملية الجدول الزمني. يرجى المحاولة مرة أخرى.',
  },
  PIPELINE_OPERATION_FAILED: {
    en: 'Failed to perform pipeline operation. Please try again.',
    ar: 'فشل تنفيذ عملية المسار. يرجى المحاولة مرة أخرى.',
  },
  STATISTICS_FETCH_FAILED: {
    en: 'Failed to fetch statistics. Please try again.',
    ar: 'فشل جلب الإحصائيات. يرجى المحاولة مرة أخرى.',
  },
  AUDIT_FETCH_FAILED: {
    en: 'Failed to fetch audit history. Please try again.',
    ar: 'فشل جلب سجل المراجعة. يرجى المحاولة مرة أخرى.',
  },
  RICH_DOCUMENT_OPERATION_FAILED: {
    en: 'Failed to perform document operation. Please try again.',
    ar: 'فشل تنفيذ عملية المستند. يرجى المحاولة مرة أخرى.',
  },
  UPLOAD_FAILED: {
    en: 'Failed to upload file to storage.',
    ar: 'فشل رفع الملف إلى التخزين.',
  },
} as const

/**
 * Throws a bilingual error for not implemented endpoints
 */
function throwNotImplemented(feature: string): never {
  throw new Error(formatBilingualError({
    en: `${feature} is not implemented yet. ${CASE_ERRORS.NOT_IMPLEMENTED.en}`,
    ar: `${feature} غير متاح حالياً. ${CASE_ERRORS.NOT_IMPLEMENTED.ar}`,
  }))
}

/**
 * Enhanced error handler with bilingual messages
 */
function handleCaseError(error: any, operation: keyof typeof CASE_ERRORS): never {
  const errorMessage = CASE_ERRORS[operation]
  const apiError = handleApiError(error)

  // If we have a specific API error message, use it; otherwise use our bilingual message
  if (apiError && typeof apiError === 'string' && apiError.length > 0) {
    throw new Error(apiError)
  }

  throw new Error(formatBilingualError(errorMessage))
}

// ==================== TYPES ====================

/**
 * Party Type - Individual, Company, or Government
 */
export type PartyType = 'individual' | 'company' | 'government'

/**
 * Entity Type - Court, Committee, or Arbitration
 */
export type EntityType = 'court' | 'committee' | 'arbitration'

/**
 * Individual Party Details
 */
export interface IndividualParty {
  type: 'individual'
  name?: string
  nationalId?: string  // Saudi National ID (starts with 1) or Iqama (starts with 2)
  phone?: string
  email?: string
  address?: string
  city?: string
}

/**
 * Company Party Details
 */
export interface CompanyParty {
  type: 'company'
  companyName?: string
  crNumber?: string  // Commercial Registration Number (10 digits)
  address?: string
  city?: string
  representativeName?: string
  representativePosition?: string
}

/**
 * Government Party Details
 */
export interface GovernmentParty {
  type: 'government'
  entityName?: string
  representative?: string
}

/**
 * Party (Union type for Plaintiff/Defendant)
 */
export type Party = IndividualParty | CompanyParty | GovernmentParty

/**
 * Plaintiff (Labor Case) - Legacy support
 */
export interface Plaintiff {
  name?: string
  nationalId?: string
  phone?: string
  address?: string
  city?: string
}

/**
 * Company (Labor Case) - Legacy support
 */
export interface Company {
  name?: string
  registrationNumber?: string
  address?: string
  city?: string
}

/**
 * Labor Case Specific Details
 */
export interface LaborCaseSpecificDetails {
  jobTitle?: string
  employmentStartDate?: string
  employmentEndDate?: string
  monthlySalary?: number
  terminationReason?: string
}

/**
 * Personal Status (Family) Case Specific Details
 */
export interface PersonalStatusCaseDetails {
  marriageDate?: string
  marriageCity?: string
  childrenCount?: number
  children?: Array<{
    name: string
    birthDate?: string
    gender?: 'male' | 'female'
  }>
}

/**
 * Commercial Case Specific Details
 */
export interface CommercialCaseDetails {
  contractDate?: string
  contractValue?: number
  commercialPapers?: Array<{
    type: 'cheque' | 'promissory_note' | 'bill_of_exchange'
    number: string
    amount: number
    date?: string
    bankName?: string
    status?: 'pending' | 'bounced' | 'paid'
  }>
}

/**
 * Power of Attorney Details
 */
export interface PowerOfAttorneyDetails {
  poaNumber?: string
  poaDate?: string
  poaExpiry?: string
  poaScope?: 'general' | 'specific' | 'litigation'
  poaIssuer?: string  // كاتب العدل
}

/**
 * Team Assignment
 */
export interface TeamAssignment {
  assignedLawyer?: string
  assistants?: string[]
}

/**
 * Court Details
 */
export interface CourtDetails {
  entityType?: EntityType
  court?: string
  committee?: string
  arbitrationCenter?: string  // مركز التحكيم
  region?: string
  city?: string
  circuitNumber?: string
  judgeName?: string
}

/**
 * Labor Case Details (Extended)
 */
export interface LaborCaseDetails {
  plaintiff?: Plaintiff
  company?: Company
  // Extended labor case fields
  laborSpecific?: LaborCaseSpecificDetails
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
  subCategory?: string
  startDate?: string
  endDate?: string
  filingDate?: string
  internalReference?: string

  // Parties
  lawyerId: LawyerRef | string
  clientId?: ClientRef | string
  clientName?: string
  clientPhone?: string
  contractId?: string

  // Plaintiff Details (New comprehensive structure)
  plaintiff?: Party
  plaintiffType?: PartyType

  // Defendant Details (New comprehensive structure)
  defendant?: Party
  defendantType?: PartyType

  // Unified National Numbers (الرقم الوطني الموحد للمنشأة)
  plaintiffUnifiedNumber?: string
  defendantUnifiedNumber?: string

  // Legacy Labor Case Details (for backward compatibility)
  laborCaseDetails?: LaborCaseDetails

  // Case-Specific Details
  laborCaseSpecific?: LaborCaseSpecificDetails
  personalStatusDetails?: PersonalStatusCaseDetails
  commercialDetails?: CommercialCaseDetails

  // Court/Committee Info (Extended)
  courtDetails?: CourtDetails
  caseNumber?: string
  court?: string
  judge?: string
  nextHearing?: string

  // Power of Attorney
  powerOfAttorney?: PowerOfAttorneyDetails

  // Team Assignment
  team?: TeamAssignment

  // Case Subject & Legal Basis
  caseSubject?: string
  legalBasis?: string

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
  // Basic Info
  title: string
  category: CaseCategory
  subCategory?: string
  description?: string
  priority?: CasePriority
  filingDate?: string
  caseNumber?: string
  internalReference?: string
  startDate?: string

  // Court/Committee
  courtDetails?: CourtDetails
  court?: string  // Legacy support

  // Plaintiff
  plaintiff?: Party
  plaintiffType?: PartyType
  clientName?: string  // Legacy support
  clientPhone?: string  // Legacy support

  // Defendant
  defendant?: Party
  defendantType?: PartyType

  // Unified National Numbers (الرقم الوطني الموحد للمنشأة)
  plaintiffUnifiedNumber?: string
  defendantUnifiedNumber?: string

  // Case Details
  caseSubject?: string
  legalBasis?: string

  // Claims
  claims?: Array<{
    type: string
    amount: number
    period?: string
    description?: string
  }>

  // Case-Specific Details
  laborCaseDetails?: LaborCaseDetails  // Legacy support
  laborCaseSpecific?: LaborCaseSpecificDetails
  personalStatusDetails?: PersonalStatusCaseDetails
  commercialDetails?: CommercialCaseDetails

  // Power of Attorney
  powerOfAttorney?: PowerOfAttorneyDetails

  // Team Assignment
  team?: TeamAssignment
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
  // Basic Info
  title?: string
  description?: string
  category?: CaseCategory
  subCategory?: string
  status?: CaseStatus
  priority?: CasePriority
  progress?: number
  filingDate?: string
  internalReference?: string

  // Court Info
  courtDetails?: CourtDetails
  caseNumber?: string
  court?: string
  judge?: string
  nextHearing?: string

  // Financial
  claimAmount?: number
  expectedWinAmount?: number

  // Parties
  plaintiff?: Party
  plaintiffType?: PartyType
  defendant?: Party
  defendantType?: PartyType

  // Case Details
  caseSubject?: string
  legalBasis?: string

  // Case-Specific Details
  laborCaseDetails?: LaborCaseDetails
  laborCaseSpecific?: LaborCaseSpecificDetails
  personalStatusDetails?: PersonalStatusCaseDetails
  commercialDetails?: CommercialCaseDetails

  // Power of Attorney
  powerOfAttorney?: PowerOfAttorneyDetails

  // Team Assignment
  team?: TeamAssignment
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
   * ✅ IMPLEMENTED - GET /api/cases/
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
      const cases = response.data.cases || []
      return {
        cases,
        total: response.data.pagination?.total || cases.length || 0,
        pagination: response.data.pagination,
      }
    } catch (error: any) {
      handleCaseError(error, 'CASE_NOT_FOUND')
    }
  },

  /**
   * Get single case by ID
   * ✅ IMPLEMENTED - GET /api/cases/:id
   */
  getCase: async (id: string): Promise<Case> => {
    try {
      const response = await apiClient.get<CaseResponse>(`/cases/${id}`)
      return response.data.case
    } catch (error: any) {
      handleCaseError(error, 'CASE_NOT_FOUND')
    }
  },

  /**
   * Create new case (external client)
   * ✅ IMPLEMENTED - POST /api/cases/
   */
  createCase: async (data: CreateCaseData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>('/cases', data)
      return response.data.case
    } catch (error: any) {
      handleCaseError(error, 'CASE_CREATE_FAILED')
    }
  },

  /**
   * Create case from platform contract
   * ✅ IMPLEMENTED - POST /api/cases/
   */
  createCaseFromContract: async (data: CreateCaseFromContractData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>('/cases', data)
      return response.data.case
    } catch (error: any) {
      handleCaseError(error, 'CASE_CREATE_FAILED')
    }
  },

  /**
   * Update case
   * ✅ IMPLEMENTED - PATCH /api/cases/:id
   */
  updateCase: async (id: string, data: UpdateCaseData): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${id}`, data)
      return response.data.case
    } catch (error: any) {
      handleCaseError(error, 'CASE_UPDATE_FAILED')
    }
  },

  /**
   * Add note to case
   * ✅ IMPLEMENTED - POST /api/cases/:id/note
   */
  addNote: async (id: string, data: AddNoteData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(`/cases/${id}/note`, data)
      return response.data.case
    } catch (error: any) {
      handleCaseError(error, 'NOTE_OPERATION_FAILED')
    }
  },

  /**
   * Add document to case
   * ✅ IMPLEMENTED - POST /api/cases/:id/document
   */
  addDocument: async (id: string, data: AddDocumentData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(`/cases/${id}/document`, data)
      return response.data.case
    } catch (error: any) {
      handleCaseError(error, 'DOCUMENT_OPERATION_FAILED')
    }
  },

  /**
   * Add hearing to case
   * ✅ IMPLEMENTED - POST /api/cases/:id/hearing
   */
  addHearing: async (id: string, data: AddHearingData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(`/cases/${id}/hearing`, data)
      return response.data.case
    } catch (error: any) {
      handleCaseError(error, 'HEARING_OPERATION_FAILED')
    }
  },

  /**
   * Add claim to case
   * ❌ NOT IMPLEMENTED - POST /api/cases/:id/claim
   * Backend endpoint does not exist yet. Use updateCase() to update claims array instead.
   */
  addClaim: async (id: string, data: AddClaimData): Promise<Case> => {
    throwNotImplemented('Add Claim | إضافة مطالبة')
  },

  /**
   * Update case progress
   * ❌ NOT IMPLEMENTED - PATCH /api/cases/:id/progress
   * Backend endpoint does not exist yet. Use updateCase() with progress field instead.
   */
  updateProgress: async (id: string, progress: number): Promise<Case> => {
    throwNotImplemented('Update Progress | تحديث التقدم')
  },

  /**
   * Update case status
   * ✅ IMPLEMENTED - PATCH /api/cases/:id/status
   */
  updateStatus: async (id: string, status: CaseStatus): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${id}/status`, { status })
      return response.data.case
    } catch (error: any) {
      handleCaseError(error, 'CASE_UPDATE_FAILED')
    }
  },

  /**
   * Update case outcome
   * ✅ IMPLEMENTED - PATCH /api/cases/:id/outcome
   */
  updateOutcome: async (id: string, outcome: CaseOutcome): Promise<Case> => {
    try {
      const response = await apiClient.patch<CaseResponse>(`/cases/${id}/outcome`, { outcome })
      return response.data.case
    } catch (error: any) {
      handleCaseError(error, 'CASE_UPDATE_FAILED')
    }
  },

  /**
   * Delete case
   * ❌ NOT IMPLEMENTED - DELETE /api/cases/:id
   * Backend endpoint does not exist yet.
   */
  deleteCase: async (id: string): Promise<void> => {
    throwNotImplemented('Delete Case | حذف القضية')
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
   * ❌ NOT IMPLEMENTED - GET /api/cases/statistics
   * Use calculateStatistics() with local cases array instead.
   */
  getStatistics: async (): Promise<CaseStatistics> => {
    throwNotImplemented('Get Statistics | جلب الإحصائيات')
  },

  // ==================== NOTES CRUD ====================

  /**
   * Update note in case
   * ❌ NOT IMPLEMENTED - PATCH /api/cases/:id/notes/:noteId
   * Backend endpoint does not exist yet. Use updateCase() to modify notes array instead.
   */
  updateNote: async (caseId: string, noteId: string, data: UpdateNoteData): Promise<Case> => {
    throwNotImplemented('Update Note | تحديث الملاحظة')
  },

  /**
   * Delete note from case
   * ❌ NOT IMPLEMENTED - DELETE /api/cases/:id/notes/:noteId
   * Backend endpoint does not exist yet. Use updateCase() to modify notes array instead.
   */
  deleteNote: async (caseId: string, noteId: string): Promise<Case> => {
    throwNotImplemented('Delete Note | حذف الملاحظة')
  },

  // ==================== HEARINGS CRUD ====================

  /**
   * Update hearing in case
   * ❌ NOT IMPLEMENTED - PATCH /api/cases/:id/hearings/:hearingId
   * Backend endpoint does not exist yet. Use updateCase() to modify hearings array instead.
   */
  updateHearing: async (caseId: string, hearingId: string, data: UpdateHearingData): Promise<Case> => {
    throwNotImplemented('Update Hearing | تحديث الجلسة')
  },

  /**
   * Delete hearing from case
   * ❌ NOT IMPLEMENTED - DELETE /api/cases/:id/hearings/:hearingId
   * Backend endpoint does not exist yet. Use updateCase() to modify hearings array instead.
   */
  deleteHearing: async (caseId: string, hearingId: string): Promise<Case> => {
    throwNotImplemented('Delete Hearing | حذف الجلسة')
  },

  // ==================== CLAIMS CRUD ====================

  /**
   * Update claim in case
   * ❌ NOT IMPLEMENTED - PATCH /api/cases/:id/claims/:claimId
   * Backend endpoint does not exist yet. Use updateCase() to modify claims array instead.
   */
  updateClaim: async (caseId: string, claimId: string, data: UpdateClaimData): Promise<Case> => {
    throwNotImplemented('Update Claim | تحديث المطالبة')
  },

  /**
   * Delete claim from case
   * ❌ NOT IMPLEMENTED - DELETE /api/cases/:id/claims/:claimId
   * Backend endpoint does not exist yet. Use updateCase() to modify claims array instead.
   */
  deleteClaim: async (caseId: string, claimId: string): Promise<Case> => {
    throwNotImplemented('Delete Claim | حذف المطالبة')
  },

  // ==================== TIMELINE CRUD ====================

  /**
   * Add timeline event to case
   * ❌ NOT IMPLEMENTED - POST /api/cases/:id/timeline
   * Backend endpoint does not exist yet. Use updateCase() to modify timeline array instead.
   */
  addTimelineEvent: async (caseId: string, data: AddTimelineEventData): Promise<Case> => {
    throwNotImplemented('Add Timeline Event | إضافة حدث للجدول الزمني')
  },

  /**
   * Update timeline event in case
   * ❌ NOT IMPLEMENTED - PATCH /api/cases/:id/timeline/:eventId
   * Backend endpoint does not exist yet. Use updateCase() to modify timeline array instead.
   */
  updateTimelineEvent: async (caseId: string, eventId: string, data: UpdateTimelineEventData): Promise<Case> => {
    throwNotImplemented('Update Timeline Event | تحديث حدث الجدول الزمني')
  },

  /**
   * Delete timeline event from case
   * ❌ NOT IMPLEMENTED - DELETE /api/cases/:id/timeline/:eventId
   * Backend endpoint does not exist yet. Use updateCase() to modify timeline array instead.
   */
  deleteTimelineEvent: async (caseId: string, eventId: string): Promise<Case> => {
    throwNotImplemented('Delete Timeline Event | حذف حدث الجدول الزمني')
  },

  // ==================== DOCUMENT MANAGEMENT ====================
  // ✅ All document endpoints are now IMPLEMENTED using Cloudflare R2 storage
  // @see docs/FRONTEND_DOCUMENT_SYSTEM_GUIDE.md

  /**
   * Get presigned URL for document upload
   * ✅ IMPLEMENTED - POST /api/cases/:id/documents/upload-url
   *
   * Step 1 of presigned URL upload flow:
   * 1. Call this to get presigned URL
   * 2. Upload directly to R2 using uploadFileToR2()
   * 3. Call confirmDocumentUpload() to finalize
   */
  getDocumentUploadUrl: async (caseId: string, data: GetUploadUrlData): Promise<UploadUrlResponse> => {
    try {
      const response = await apiClient.post<UploadUrlApiResponse>(
        `/cases/${caseId}/documents/upload-url`,
        {
          filename: data.filename,
          contentType: data.contentType,
          fileSize: (data as any).fileSize, // Extended field
          category: data.category,
        }
      )
      return {
        uploadUrl: response.data.uploadUrl,
        fileKey: response.data.fileKey,
        bucket: response.data.bucket,
      }
    } catch (error: any) {
      handleCaseError(error, 'DOCUMENT_OPERATION_FAILED')
    }
  },

  /**
   * Confirm document upload (save metadata to DB)
   * ✅ IMPLEMENTED - POST /api/cases/:id/documents/confirm-upload
   *
   * Step 3 of presigned URL upload flow.
   * Call AFTER successfully uploading to R2.
   */
  confirmDocumentUpload: async (caseId: string, data: ConfirmUploadData): Promise<Case> => {
    try {
      const response = await apiClient.post<CaseResponse>(
        `/cases/${caseId}/documents/confirm-upload`,
        {
          fileKey: data.fileKey,
          filename: data.filename,
          contentType: data.type,
          size: data.size,
          category: data.category,
          description: data.description,
        }
      )
      return response.data.case
    } catch (error: any) {
      handleCaseError(error, 'DOCUMENT_OPERATION_FAILED')
    }
  },

  /**
   * Get presigned URL for document download
   * ✅ IMPLEMENTED - GET /api/cases/:id/documents/:docId/download-url
   *
   * URLs expire after 15 minutes - don't cache them!
   * Always get a fresh URL before download/preview.
   *
   * @param disposition 'attachment' for download, 'inline' for preview
   */
  getDocumentDownloadUrl: async (
    caseId: string,
    docId: string,
    disposition: 'attachment' | 'inline' = 'attachment'
  ): Promise<{ downloadUrl: string; filename: string }> => {
    try {
      const response = await apiClient.get<DownloadUrlResponse>(
        `/cases/${caseId}/documents/${docId}/download-url`,
        { params: { disposition } }
      )
      return {
        downloadUrl: response.data.downloadUrl,
        filename: (response.data as any).document?.fileName || 'download',
      }
    } catch (error: any) {
      handleCaseError(error, 'DOCUMENT_OPERATION_FAILED')
    }
  },

  /**
   * Delete document from case
   * ✅ IMPLEMENTED - DELETE /api/cases/:id/documents/:docId
   *
   * Deletes both the file from R2 storage and the metadata from DB.
   */
  deleteDocument: async (caseId: string, docId: string): Promise<void> => {
    try {
      await apiClient.delete(`/cases/${caseId}/documents/${docId}`)
    } catch (error: any) {
      handleCaseError(error, 'DOCUMENT_OPERATION_FAILED')
    }
  },

  /**
   * Upload file directly to R2 using presigned URL
   * ✅ UTILITY FUNCTION - Step 2 of presigned URL upload flow
   *
   * @example
   * ```ts
   * // Complete upload flow
   * const { uploadUrl, fileKey } = await casesService.getDocumentUploadUrl(caseId, {
   *   filename: file.name,
   *   contentType: file.type,
   *   category: 'contract',
   * })
   *
   * await casesService.uploadFileToR2(uploadUrl, file)
   *
   * const updatedCase = await casesService.confirmDocumentUpload(caseId, {
   *   fileKey,
   *   filename: file.name,
   *   type: file.type,
   *   size: file.size,
   *   category: 'contract',
   *   bucket: 'general',
   * })
   * ```
   */
  uploadFileToR2: async (uploadUrl: string, file: File): Promise<void> => {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }
    } catch (error: any) {
      throw new Error(formatBilingualError(CASE_ERRORS.UPLOAD_FAILED))
    }
  },

  /**
   * Upload document with progress tracking
   * ✅ UTILITY FUNCTION - Combines all 3 steps with progress
   *
   * @param onProgress Progress callback (0-100)
   */
  uploadDocument: async (
    caseId: string,
    file: File,
    category: 'contract' | 'evidence' | 'correspondence' | 'judgment' | 'pleading' | 'other',
    description?: string,
    onProgress?: (percent: number) => void
  ): Promise<Case> => {
    const startTime = Date.now()
    documentLogger.uploadStart(file, { caseId, category })

    try {
      // Step 1: Get presigned URL (5% progress)
      if (onProgress) onProgress(5)
      documentLogger.presignedUrlRequest(`/cases/${caseId}/documents/upload-url`, {
        filename: file.name,
        contentType: file.type,
        category,
      })

      const { uploadUrl, fileKey, bucket } = await casesService.getDocumentUploadUrl(caseId, {
        filename: file.name,
        contentType: file.type,
        category,
      })

      documentLogger.presignedUrlReceived(fileKey)

      // Step 2: Upload to R2 (5-90% progress)
      if (onProgress) onProgress(10)
      documentLogger.r2UploadStart(uploadUrl, file.size)

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            // Map 0-100 to 10-90
            const percent = 10 + Math.round((event.loaded / event.total) * 80)
            documentLogger.uploadProgress(file.name, Math.round((event.loaded / event.total) * 100))
            if (onProgress) onProgress(percent)
          }
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            const error = new Error(`Upload failed: ${xhr.status}`)
            documentLogger.uploadError(file, error, 'r2')
            reject(error)
          }
        })
        xhr.addEventListener('error', () => {
          const error = new Error('Upload failed')
          documentLogger.uploadError(file, error, 'r2')
          reject(error)
        })
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      // Step 3: Confirm upload (90-100% progress)
      if (onProgress) onProgress(90)
      documentLogger.uploadConfirm(fileKey, {
        filename: file.name,
        size: file.size,
        category,
      })

      const result = await casesService.confirmDocumentUpload(caseId, {
        fileKey,
        filename: file.name,
        type: file.type,
        size: file.size,
        category,
        description,
        bucket,
      })

      if (onProgress) onProgress(100)

      const duration = Date.now() - startTime
      documentLogger.uploadSuccess({ name: file.name, size: file.size }, 'case-document', duration)

      return result
    } catch (error: any) {
      documentLogger.uploadError(file, error, 'confirm')
      handleCaseError(error, 'DOCUMENT_OPERATION_FAILED')
    }
  },

  /**
   * Preview document (opens in new tab)
   * ✅ UTILITY FUNCTION
   */
  previewDocument: async (caseId: string, docId: string): Promise<void> => {
    documentLogger.previewStart(docId)
    try {
      const { downloadUrl, filename } = await casesService.getDocumentDownloadUrl(caseId, docId, 'inline')
      window.open(downloadUrl, '_blank')
      documentLogger.previewSuccess(docId, filename)
    } catch (error: any) {
      documentLogger.previewError(docId, error)
      throw error
    }
  },

  /**
   * Download document (triggers save dialog)
   * ✅ UTILITY FUNCTION
   */
  downloadDocument: async (caseId: string, docId: string, filename?: string): Promise<void> => {
    documentLogger.downloadStart(docId, 'attachment')
    try {
      const { downloadUrl, filename: defaultFilename } = await casesService.getDocumentDownloadUrl(
        caseId,
        docId,
        'attachment'
      )
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename || defaultFilename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      documentLogger.downloadSuccess(docId, filename || defaultFilename)
    } catch (error: any) {
      documentLogger.downloadError(docId, error)
      throw error
    }
  },

  /**
   * @deprecated Use uploadFileToR2 instead
   */
  uploadFileToS3: async (uploadUrl: string, file: File): Promise<void> => {
    console.warn('uploadFileToS3 is deprecated. Use uploadFileToR2 instead.')
    return casesService.uploadFileToR2(uploadUrl, file)
  },

  // ==================== AUDIT LOGGING ====================

  /**
   * Get audit history for case
   * ❌ NOT IMPLEMENTED - GET /api/cases/:id/audit
   * Backend endpoint does not exist yet.
   */
  getAuditHistory: async (caseId: string): Promise<AuditLogEntry[]> => {
    throwNotImplemented('Get Audit History | سجل المراجعة')
  },

  // ==================== RICH DOCUMENTS (CKEditor) ====================
  // ⚠️ All rich document endpoints are NOT IMPLEMENTED in backend

  /**
   * Create rich document (CKEditor content)
   * ❌ NOT IMPLEMENTED - POST /api/cases/:id/rich-documents
   */
  createRichDocument: async (caseId: string, data: {
    title: string
    content: string
    category?: string
    tags?: string[]
  }): Promise<any> => {
    throwNotImplemented('Create Rich Document | إنشاء مستند منسق')
  },

  /**
   * Get all rich documents for a case
   * ❌ NOT IMPLEMENTED - GET /api/cases/:id/rich-documents
   */
  getRichDocuments: async (caseId: string): Promise<any[]> => {
    throwNotImplemented('Get Rich Documents | جلب المستندات المنسقة')
  },

  /**
   * Get single rich document
   * ❌ NOT IMPLEMENTED - GET /api/cases/:id/rich-documents/:docId
   */
  getRichDocument: async (caseId: string, docId: string): Promise<any> => {
    throwNotImplemented('Get Rich Document | جلب المستند المنسق')
  },

  /**
   * Update rich document
   * ❌ NOT IMPLEMENTED - PATCH /api/cases/:id/rich-documents/:docId
   */
  updateRichDocument: async (caseId: string, docId: string, data: {
    title?: string
    content?: string
    category?: string
    tags?: string[]
  }): Promise<any> => {
    throwNotImplemented('Update Rich Document | تحديث المستند المنسق')
  },

  /**
   * Delete rich document
   * ❌ NOT IMPLEMENTED - DELETE /api/cases/:id/rich-documents/:docId
   */
  deleteRichDocument: async (caseId: string, docId: string): Promise<void> => {
    throwNotImplemented('Delete Rich Document | حذف المستند المنسق')
  },

  /**
   * Get rich document version history
   * ❌ NOT IMPLEMENTED - GET /api/cases/:id/rich-documents/:docId/versions
   */
  getRichDocumentVersions: async (caseId: string, docId: string): Promise<any[]> => {
    throwNotImplemented('Get Rich Document Versions | جلب إصدارات المستند')
  },

  /**
   * Restore rich document to a previous version
   * ❌ NOT IMPLEMENTED - POST /api/cases/:id/rich-documents/:docId/versions/:versionNumber/restore
   */
  restoreRichDocumentVersion: async (caseId: string, docId: string, versionNumber: number): Promise<any> => {
    throwNotImplemented('Restore Rich Document Version | استعادة إصدار المستند')
  },

  /**
   * Export rich document to PDF
   * ❌ NOT IMPLEMENTED - GET /api/cases/:id/rich-documents/:docId/export/pdf
   */
  exportRichDocumentToPdf: async (caseId: string, docId: string): Promise<Blob> => {
    throwNotImplemented('Export to PDF | تصدير إلى PDF')
  },

  /**
   * Export rich document to LaTeX
   * ❌ NOT IMPLEMENTED - GET /api/cases/:id/rich-documents/:docId/export/latex
   */
  exportRichDocumentToLatex: async (caseId: string, docId: string): Promise<Blob> => {
    throwNotImplemented('Export to LaTeX | تصدير إلى LaTeX')
  },

  /**
   * Export rich document to Markdown
   * ❌ NOT IMPLEMENTED - GET /api/cases/:id/rich-documents/:docId/export/markdown
   */
  exportRichDocumentToMarkdown: async (caseId: string, docId: string): Promise<Blob> => {
    throwNotImplemented('Export to Markdown | تصدير إلى Markdown')
  },

  /**
   * Get rich document HTML preview
   * ❌ NOT IMPLEMENTED - GET /api/cases/:id/rich-documents/:docId/preview
   */
  getRichDocumentPreview: async (caseId: string, docId: string): Promise<{ html: string }> => {
    throwNotImplemented('Get Document Preview | عرض المستند')
  },

  // ==================== PIPELINE ====================
  // ⚠️ All pipeline endpoints are NOT IMPLEMENTED in backend

  /**
   * Get cases for pipeline view
   * ❌ NOT IMPLEMENTED - GET /api/cases/pipeline
   * Use getCases() to fetch cases and transform them for pipeline view instead.
   */
  getPipelineCases: async (filters?: {
    category?: CaseCategory
    status?: CaseStatus
    stage?: string
    lawyerId?: string
    page?: number
    limit?: number
  }): Promise<{ cases: CasePipelineCard[]; count: number; pagination?: PaginationInfo }> => {
    throwNotImplemented('Get Pipeline Cases | جلب قضايا المسار')
  },

  /**
   * Get pipeline statistics
   * ❌ NOT IMPLEMENTED - GET /api/cases/pipeline/statistics
   * Use calculateStatistics() with filtered cases instead.
   */
  getPipelineStatistics: async (): Promise<PipelineStatistics> => {
    throwNotImplemented('Get Pipeline Statistics | إحصائيات المسار')
  },

  /**
   * Get valid stages for a case category
   * ❌ NOT IMPLEMENTED - GET /api/cases/pipeline/stages/:category
   * Define stages in frontend configuration instead.
   */
  getPipelineStages: async (category: CaseCategory): Promise<PipelineStage[]> => {
    throwNotImplemented('Get Pipeline Stages | مراحل المسار')
  },

  /**
   * Move case to a new stage
   * ❌ NOT IMPLEMENTED - PATCH /api/cases/:id/stage
   * Use updateCase() to update case stage/status instead.
   */
  moveCaseToStage: async (caseId: string, data: MoveCaseToStageData): Promise<Case> => {
    throwNotImplemented('Move Case to Stage | نقل القضية إلى مرحلة')
  },

  /**
   * End case with outcome
   * ❌ NOT IMPLEMENTED - PATCH /api/cases/:id/end
   * Use updateStatus() and updateOutcome() instead.
   */
  endCase: async (caseId: string, data: EndCaseData): Promise<Case> => {
    throwNotImplemented('End Case | إنهاء القضية')
  },
}

export default casesService

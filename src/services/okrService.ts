/**
 * OKR (Objectives & Key Results) Service
 * Handles all OKR-related API calls using Google's OKR methodology
 *
 * Key Concepts:
 * - OKR Score Range: 0.0 to 1.0 (Google methodology)
 * - Score Grades: 0.0-0.3 (Red/Off Track), 0.4-0.6 (Yellow/At Risk), 0.7-1.0 (Green/On Track)
 * - OKR Types: committed (must achieve 100%), aspirational (70% is success), learning (process matters)
 * - CFR: Conversations, Feedback, Recognition (continuous performance management)
 * - Check-in Format: PPP (Progress, Plans, Problems)
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export type OKRType = 'committed' | 'aspirational' | 'learning'
export type OKRStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'deferred'
export type OKRLevel = 'company' | 'department' | 'team' | 'individual'
export type OKRCadence = 'annual' | 'quarterly' | 'monthly'
export type KeyResultMetricType = 'percentage' | 'number' | 'currency' | 'binary' | 'milestone'
export type ScoreGrade = 'red' | 'yellow' | 'green'
export type ConfidenceLevel = 'low' | 'medium' | 'high'
export type CFRType = 'conversation' | 'feedback' | 'recognition'
export type CheckInStatus = 'scheduled' | 'completed' | 'missed' | 'cancelled'

// ==================== INTERFACES ====================

export interface KeyResultMilestone {
  milestoneId: string
  title: string
  titleAr: string
  targetDate: string
  completed: boolean
  completedAt?: string
  weight: number // 0-1
}

export interface KeyResult {
  keyResultId: string
  title: string
  titleAr: string
  description?: string
  descriptionAr?: string

  metricType: KeyResultMetricType
  startValue: number
  targetValue: number
  currentValue: number
  unit?: string
  unitAr?: string

  // For milestone-based key results
  milestones?: KeyResultMilestone[]

  // Scoring (Google methodology: 0.0 - 1.0)
  score: number // 0.0 to 1.0
  scoreGrade: ScoreGrade
  confidence: ConfidenceLevel

  weight: number // Weight within the objective (0-1)

  owner?: {
    ownerId: string
    ownerName: string
    ownerNameAr: string
  }

  dueDate?: string
  status: OKRStatus

  // Progress tracking
  progressHistory: {
    date: string
    value: number
    score: number
    note?: string
    updatedBy: string
  }[]

  createdAt: string
  updatedAt: string
}

export interface OKRCheckIn {
  checkInId: string
  okrId: string
  checkInDate: string
  status: CheckInStatus

  // PPP Format (Progress, Plans, Problems)
  progress: string // What was accomplished since last check-in
  progressAr?: string
  plans: string // What will be done next
  plansAr?: string
  problems: string // Blockers or challenges
  problemsAr?: string

  // Key Result updates
  keyResultUpdates: {
    keyResultId: string
    previousValue: number
    newValue: number
    confidence: ConfidenceLevel
    notes?: string
  }[]

  // Overall OKR confidence
  overallConfidence: ConfidenceLevel
  needsSupport: boolean
  supportNeeded?: string

  // Manager response
  managerResponse?: {
    respondedAt: string
    respondedBy: string
    comments: string
    actionItems?: string[]
  }

  createdBy: string
  createdAt: string
}

export interface CFR {
  cfrId: string
  okrId?: string // Optional link to OKR
  employeeId: string
  employeeName: string
  employeeNameAr: string

  type: CFRType

  // For conversations
  conversationTopic?: string
  conversationNotes?: string
  conversationDate?: string
  followUpDate?: string

  // For feedback
  feedbackContent?: string
  feedbackContentAr?: string
  feedbackGiver?: {
    giverId: string
    giverName: string
    giverNameAr: string
    relationship: 'manager' | 'peer' | 'subordinate' | 'cross_functional'
  }
  isPrivate?: boolean

  // For recognition
  recognitionMessage?: string
  recognitionMessageAr?: string
  recognitionCategory?: 'values_alignment' | 'goal_achievement' | 'collaboration' | 'innovation' | 'customer_focus' | 'other'
  isPublic?: boolean
  likes?: number

  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface OKRScoreHistory {
  date: string
  score: number
  scoreGrade: ScoreGrade
  keyResultScores: {
    keyResultId: string
    score: number
  }[]
}

export interface OKR {
  _id: string
  okrId: string // Formatted as "OKR-2025-Q1-0001"

  // Basic info
  title: string
  titleAr: string
  description?: string
  descriptionAr?: string

  // OKR configuration
  type: OKRType
  level: OKRLevel
  cadence: OKRCadence
  status: OKRStatus
  statusAr: string

  // Period
  period: {
    year: number
    quarter?: 1 | 2 | 3 | 4
    month?: number
    startDate: string
    endDate: string
    periodLabel: string // "Q1 2025" or "January 2025" or "FY 2025"
    periodLabelAr: string
  }

  // Ownership
  owner: {
    ownerId: string
    ownerName: string
    ownerNameAr: string
    ownerType: 'employee' | 'team' | 'department' | 'company'
  }

  // Parent OKR (for cascading)
  parentOkrId?: string
  parentOkr?: {
    okrId: string
    title: string
    titleAr: string
  }

  // Child OKRs
  childOkrIds?: string[]

  // Key Results
  keyResults: KeyResult[]

  // Scoring
  score: number // 0.0 to 1.0 (average of key results weighted by their weights)
  scoreGrade: ScoreGrade
  scoreHistory: OKRScoreHistory[]

  // Progress
  progress: number // 0-100 percentage
  lastCheckIn?: {
    checkInId: string
    date: string
    confidence: ConfidenceLevel
  }

  // Check-ins
  checkIns: OKRCheckIn[]
  checkInFrequency: 'weekly' | 'bi-weekly' | 'monthly'
  nextCheckInDate?: string

  // CFRs
  cfrs: CFR[]

  // Visibility
  visibility: 'public' | 'team' | 'private'

  // Alignment
  alignedTo?: {
    okrId: string
    title: string
    titleAr: string
    level: OKRLevel
  }[]

  // Tags
  tags?: string[]

  // Audit
  createdBy: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CreateOKRData {
  title: string
  titleAr: string
  description?: string
  descriptionAr?: string
  type: OKRType
  level: OKRLevel
  cadence: OKRCadence
  period: {
    year: number
    quarter?: 1 | 2 | 3 | 4
    month?: number
    startDate: string
    endDate: string
  }
  owner: {
    ownerId: string
    ownerType: 'employee' | 'team' | 'department' | 'company'
  }
  parentOkrId?: string
  keyResults: Omit<KeyResult, 'keyResultId' | 'score' | 'scoreGrade' | 'progressHistory' | 'createdAt' | 'updatedAt'>[]
  visibility?: 'public' | 'team' | 'private'
  checkInFrequency?: 'weekly' | 'bi-weekly' | 'monthly'
  alignedTo?: string[]
  tags?: string[]
}

export interface UpdateOKRData {
  title?: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  type?: OKRType
  status?: OKRStatus
  visibility?: 'public' | 'team' | 'private'
  checkInFrequency?: 'weekly' | 'bi-weekly' | 'monthly'
  tags?: string[]
}

export interface OKRFilters {
  level?: OKRLevel
  type?: OKRType
  status?: OKRStatus
  cadence?: OKRCadence
  ownerId?: string
  ownerType?: 'employee' | 'team' | 'department' | 'company'
  departmentId?: string
  year?: number
  quarter?: 1 | 2 | 3 | 4
  search?: string
  scoreGrade?: ScoreGrade
  page?: number
  limit?: number
  sortBy?: 'score' | 'progress' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface OKRsResponse {
  okrs: OKR[]
  total: number
  page: number
  limit: number
  summary: {
    totalActive: number
    avgScore: number
    onTrack: number
    atRisk: number
    offTrack: number
    byLevel: {
      level: OKRLevel
      count: number
      avgScore: number
    }[]
  }
}

export interface OKRStats {
  totalOkrs: number
  byStatus: {
    status: OKRStatus
    count: number
  }[]
  byType: {
    type: OKRType
    count: number
    avgScore: number
  }[]
  byLevel: {
    level: OKRLevel
    count: number
    avgScore: number
  }[]
  byScoreGrade: {
    grade: ScoreGrade
    count: number
    percentage: number
  }[]
  avgScore: number
  avgProgress: number
  checkInCompletionRate: number
  topPerformingOkrs: {
    okrId: string
    title: string
    titleAr: string
    score: number
    ownerName: string
  }[]
  needsAttentionOkrs: {
    okrId: string
    title: string
    titleAr: string
    score: number
    ownerName: string
    daysRemaining: number
  }[]
}

export interface CreateKeyResultData {
  title: string
  titleAr: string
  description?: string
  descriptionAr?: string
  metricType: KeyResultMetricType
  startValue: number
  targetValue: number
  currentValue?: number
  unit?: string
  unitAr?: string
  milestones?: Omit<KeyResultMilestone, 'milestoneId' | 'completed' | 'completedAt'>[]
  weight: number
  owner?: {
    ownerId: string
  }
  dueDate?: string
}

export interface UpdateKeyResultData {
  title?: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  currentValue?: number
  confidence?: ConfidenceLevel
  status?: OKRStatus
  milestones?: {
    milestoneId: string
    completed?: boolean
  }[]
}

export interface CreateCheckInData {
  progress: string
  progressAr?: string
  plans: string
  plansAr?: string
  problems: string
  problemsAr?: string
  keyResultUpdates: {
    keyResultId: string
    newValue: number
    confidence: ConfidenceLevel
    notes?: string
  }[]
  overallConfidence: ConfidenceLevel
  needsSupport: boolean
  supportNeeded?: string
}

export interface CreateCFRData {
  employeeId: string
  type: CFRType
  okrId?: string

  // Conversation fields
  conversationTopic?: string
  conversationNotes?: string
  conversationDate?: string
  followUpDate?: string

  // Feedback fields
  feedbackContent?: string
  feedbackContentAr?: string
  isPrivate?: boolean

  // Recognition fields
  recognitionMessage?: string
  recognitionMessageAr?: string
  recognitionCategory?: 'values_alignment' | 'goal_achievement' | 'collaboration' | 'innovation' | 'customer_focus' | 'other'
  isPublic?: boolean
}

// ==================== ERROR MESSAGES (BILINGUAL) ====================

const ERROR_MESSAGES = {
  FETCH_FAILED: {
    en: 'Failed to fetch OKRs',
    ar: 'فشل في جلب الأهداف والنتائج الرئيسية'
  },
  CREATE_FAILED: {
    en: 'Failed to create OKR',
    ar: 'فشل في إنشاء الهدف والنتائج الرئيسية'
  },
  UPDATE_FAILED: {
    en: 'Failed to update OKR',
    ar: 'فشل في تحديث الهدف والنتائج الرئيسية'
  },
  DELETE_FAILED: {
    en: 'Failed to delete OKR',
    ar: 'فشل في حذف الهدف والنتائج الرئيسية'
  },
  KEY_RESULT_FAILED: {
    en: 'Failed to process key result',
    ar: 'فشل في معالجة النتيجة الرئيسية'
  },
  CHECK_IN_FAILED: {
    en: 'Failed to process check-in',
    ar: 'فشل في معالجة المتابعة'
  },
  CFR_FAILED: {
    en: 'Failed to process CFR',
    ar: 'فشل في معالجة المحادثة/الملاحظات/التقدير'
  },
  STATS_FAILED: {
    en: 'Failed to fetch OKR statistics',
    ar: 'فشل في جلب إحصائيات الأهداف'
  },
  NOT_FOUND: {
    en: 'OKR not found',
    ar: 'الهدف غير موجود'
  },
  NETWORK_ERROR: {
    en: 'Network error. Please check your connection',
    ar: 'خطأ في الشبكة. يرجى التحقق من اتصالك'
  },
  INVALID_DATA: {
    en: 'Invalid OKR data',
    ar: 'بيانات الهدف غير صالحة'
  },
  SCORE_OUT_OF_RANGE: {
    en: 'OKR score must be between 0.0 and 1.0',
    ar: 'يجب أن تكون نتيجة الهدف بين 0.0 و 1.0'
  }
}

/**
 * Format bilingual error message
 */
const formatBilingualError = (errorKey: keyof typeof ERROR_MESSAGES, details?: string): string => {
  const message = ERROR_MESSAGES[errorKey]
  const bilingual = `${message.en} | ${message.ar}`
  return details ? `${bilingual}\n${details}` : bilingual
}

/**
 * Handle API error with bilingual messages
 */
const handleOKRError = (error: any, errorKey: keyof typeof ERROR_MESSAGES): never => {
  if (error?.status === 404) {
    throw new Error(formatBilingualError('NOT_FOUND'))
  }

  if (error?.message) {
    throw new Error(error.message)
  }

  if (error?.status === 0 || error?.code === 'CANCELLED' || error?.code === 'NETWORK_ERROR') {
    throw new Error(formatBilingualError('NETWORK_ERROR'))
  }

  if (error?.status === 400) {
    const details = error?.errors?.map((e: any) => `${e.field}: ${e.message}`).join(', ')
    throw new Error(formatBilingualError('INVALID_DATA', details))
  }

  const backendMessage = handleApiError(error)
  throw new Error(`${formatBilingualError(errorKey)}\n${backendMessage}`)
}

/**
 * Calculate score grade based on Google OKR methodology
 */
export const calculateScoreGrade = (score: number): ScoreGrade => {
  if (score < 0.4) return 'red'
  if (score < 0.7) return 'yellow'
  return 'green'
}

/**
 * Calculate weighted score for an OKR based on key results
 */
export const calculateOKRScore = (keyResults: KeyResult[]): number => {
  if (!keyResults.length) return 0

  const totalWeight = keyResults.reduce((sum, kr) => sum + kr.weight, 0)
  if (totalWeight === 0) return 0

  const weightedScore = keyResults.reduce((sum, kr) => sum + (kr.score * kr.weight), 0)
  return Math.round((weightedScore / totalWeight) * 100) / 100 // Round to 2 decimal places
}

// ==================== API FUNCTIONS ====================

const okrService = {
  // ==================== OKR CRUD ====================

  /**
   * Get all OKRs with filters
   */
  getOKRs: async (filters?: OKRFilters): Promise<OKRsResponse> => {
    try {
      const response = await apiClient.get('/hr/okrs', { params: filters })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Get single OKR by ID
   */
  getOKR: async (okrId: string): Promise<OKR> => {
    try {
      const response = await apiClient.get(`/hr/okrs/${okrId}`)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Get OKRs by employee
   */
  getEmployeeOKRs: async (employeeId: string, filters?: Omit<OKRFilters, 'ownerId'>): Promise<OKRsResponse> => {
    try {
      const response = await apiClient.get(`/hr/okrs/employee/${employeeId}`, { params: filters })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Get OKRs by department
   */
  getDepartmentOKRs: async (departmentId: string, filters?: OKRFilters): Promise<OKRsResponse> => {
    try {
      const response = await apiClient.get(`/hr/okrs/department/${departmentId}`, { params: filters })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Get company-level OKRs
   */
  getCompanyOKRs: async (filters?: OKRFilters): Promise<OKRsResponse> => {
    try {
      const response = await apiClient.get('/hr/okrs/company', { params: filters })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Create new OKR
   */
  createOKR: async (data: CreateOKRData): Promise<OKR> => {
    try {
      const response = await apiClient.post('/hr/okrs', data)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CREATE_FAILED')
    }
  },

  /**
   * Update OKR
   */
  updateOKR: async (okrId: string, data: UpdateOKRData): Promise<OKR> => {
    try {
      const response = await apiClient.put(`/hr/okrs/${okrId}`, data)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Delete OKR
   */
  deleteOKR: async (okrId: string): Promise<void> => {
    try {
      await apiClient.delete(`/hr/okrs/${okrId}`)
    } catch (error: any) {
      handleOKRError(error, 'DELETE_FAILED')
    }
  },

  /**
   * Archive OKR (soft delete)
   */
  archiveOKR: async (okrId: string): Promise<OKR> => {
    try {
      const response = await apiClient.patch(`/hr/okrs/${okrId}/archive`)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Clone OKR to new period
   */
  cloneOKR: async (okrId: string, newPeriod: { year: number; quarter?: 1 | 2 | 3 | 4; month?: number }): Promise<OKR> => {
    try {
      const response = await apiClient.post(`/hr/okrs/${okrId}/clone`, newPeriod)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CREATE_FAILED')
    }
  },

  // ==================== KEY RESULTS ====================

  /**
   * Add key result to OKR
   */
  addKeyResult: async (okrId: string, data: CreateKeyResultData): Promise<OKR> => {
    try {
      const response = await apiClient.post(`/hr/okrs/${okrId}/key-results`, data)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'KEY_RESULT_FAILED')
    }
  },

  /**
   * Update key result
   */
  updateKeyResult: async (okrId: string, keyResultId: string, data: UpdateKeyResultData): Promise<OKR> => {
    try {
      const response = await apiClient.put(`/hr/okrs/${okrId}/key-results/${keyResultId}`, data)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'KEY_RESULT_FAILED')
    }
  },

  /**
   * Delete key result
   */
  deleteKeyResult: async (okrId: string, keyResultId: string): Promise<OKR> => {
    try {
      const response = await apiClient.delete(`/hr/okrs/${okrId}/key-results/${keyResultId}`)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'KEY_RESULT_FAILED')
    }
  },

  /**
   * Update key result progress
   */
  updateKeyResultProgress: async (
    okrId: string,
    keyResultId: string,
    data: { currentValue: number; confidence: ConfidenceLevel; note?: string }
  ): Promise<OKR> => {
    try {
      const response = await apiClient.patch(`/hr/okrs/${okrId}/key-results/${keyResultId}/progress`, data)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'KEY_RESULT_FAILED')
    }
  },

  /**
   * Complete milestone
   */
  completeMilestone: async (okrId: string, keyResultId: string, milestoneId: string): Promise<OKR> => {
    try {
      const response = await apiClient.patch(
        `/hr/okrs/${okrId}/key-results/${keyResultId}/milestones/${milestoneId}/complete`
      )
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'KEY_RESULT_FAILED')
    }
  },

  // ==================== CHECK-INS ====================

  /**
   * Create check-in
   */
  createCheckIn: async (okrId: string, data: CreateCheckInData): Promise<OKR> => {
    try {
      const response = await apiClient.post(`/hr/okrs/${okrId}/check-ins`, data)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CHECK_IN_FAILED')
    }
  },

  /**
   * Get check-in history
   */
  getCheckInHistory: async (okrId: string): Promise<OKRCheckIn[]> => {
    try {
      const response = await apiClient.get(`/hr/okrs/${okrId}/check-ins`)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CHECK_IN_FAILED')
    }
  },

  /**
   * Add manager response to check-in
   */
  addManagerResponse: async (
    okrId: string,
    checkInId: string,
    data: { comments: string; actionItems?: string[] }
  ): Promise<OKR> => {
    try {
      const response = await apiClient.post(`/hr/okrs/${okrId}/check-ins/${checkInId}/response`, data)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CHECK_IN_FAILED')
    }
  },

  /**
   * Get pending check-ins (overdue or due soon)
   */
  getPendingCheckIns: async (filters?: { departmentId?: string; managerId?: string }): Promise<{
    overdue: { okrId: string; title: string; ownerName: string; daysOverdue: number }[]
    dueSoon: { okrId: string; title: string; ownerName: string; dueDate: string }[]
  }> => {
    try {
      const response = await apiClient.get('/hr/okrs/check-ins/pending', { params: filters })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CHECK_IN_FAILED')
    }
  },

  // ==================== CFR (Conversations, Feedback, Recognition) ====================

  /**
   * Create CFR
   */
  createCFR: async (data: CreateCFRData): Promise<CFR> => {
    try {
      const response = await apiClient.post('/hr/okrs/cfrs', data)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CFR_FAILED')
    }
  },

  /**
   * Get CFRs for employee
   */
  getEmployeeCFRs: async (employeeId: string, filters?: { type?: CFRType; dateFrom?: string; dateTo?: string }): Promise<CFR[]> => {
    try {
      const response = await apiClient.get(`/hr/okrs/cfrs/employee/${employeeId}`, { params: filters })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CFR_FAILED')
    }
  },

  /**
   * Get CFRs linked to OKR
   */
  getOKRCFRs: async (okrId: string): Promise<CFR[]> => {
    try {
      const response = await apiClient.get(`/hr/okrs/${okrId}/cfrs`)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CFR_FAILED')
    }
  },

  /**
   * Like recognition (increment like count)
   */
  likeRecognition: async (cfrId: string): Promise<CFR> => {
    try {
      const response = await apiClient.post(`/hr/okrs/cfrs/${cfrId}/like`)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CFR_FAILED')
    }
  },

  /**
   * Get public recognitions feed
   */
  getPublicRecognitions: async (filters?: { page?: number; limit?: number }): Promise<{ recognitions: CFR[]; total: number }> => {
    try {
      const response = await apiClient.get('/hr/okrs/cfrs/recognitions/public', { params: filters })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CFR_FAILED')
    }
  },

  // ==================== ALIGNMENT & HIERARCHY ====================

  /**
   * Get OKR hierarchy (parent and children)
   */
  getOKRHierarchy: async (okrId: string): Promise<{
    parent?: OKR
    current: OKR
    children: OKR[]
    alignedOkrs: OKR[]
  }> => {
    try {
      const response = await apiClient.get(`/hr/okrs/${okrId}/hierarchy`)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Align OKR to parent
   */
  alignOKR: async (okrId: string, parentOkrId: string): Promise<OKR> => {
    try {
      const response = await apiClient.patch(`/hr/okrs/${okrId}/align`, { parentOkrId })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Remove OKR alignment
   */
  removeAlignment: async (okrId: string): Promise<OKR> => {
    try {
      const response = await apiClient.patch(`/hr/okrs/${okrId}/unalign`)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Get alignment tree view
   */
  getAlignmentTree: async (filters?: { year?: number; quarter?: number; level?: OKRLevel }): Promise<{
    companyOkrs: (OKR & { departmentOkrs: (OKR & { teamOkrs: OKR[]; individualOkrs: OKR[] })[] })[]
  }> => {
    try {
      const response = await apiClient.get('/hr/okrs/alignment/tree', { params: filters })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'FETCH_FAILED')
    }
  },

  // ==================== STATISTICS & ANALYTICS ====================

  /**
   * Get OKR statistics
   */
  getOKRStats: async (filters?: { year?: number; quarter?: number; departmentId?: string }): Promise<OKRStats> => {
    try {
      const response = await apiClient.get('/hr/okrs/stats', { params: filters })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'STATS_FAILED')
    }
  },

  /**
   * Get score distribution
   */
  getScoreDistribution: async (filters?: { year?: number; quarter?: number; level?: OKRLevel }): Promise<{
    distribution: { range: string; count: number; percentage: number }[]
    avgScore: number
    medianScore: number
    byLevel: { level: OKRLevel; avgScore: number; count: number }[]
    byType: { type: OKRType; avgScore: number; count: number }[]
  }> => {
    try {
      const response = await apiClient.get('/hr/okrs/stats/distribution', { params: filters })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'STATS_FAILED')
    }
  },

  /**
   * Get employee OKR performance summary
   */
  getEmployeeOKRSummary: async (employeeId: string): Promise<{
    currentOkrs: OKR[]
    historicalScores: { period: string; avgScore: number; okrCount: number }[]
    avgScore: number
    totalCompleted: number
    strengths: string[]
    improvementAreas: string[]
  }> => {
    try {
      const response = await apiClient.get(`/hr/okrs/employee/${employeeId}/summary`)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'STATS_FAILED')
    }
  },

  /**
   * Get department OKR dashboard
   */
  getDepartmentOKRDashboard: async (departmentId: string, filters?: { year?: number; quarter?: number }): Promise<{
    summary: {
      totalOkrs: number
      avgScore: number
      onTrack: number
      atRisk: number
      offTrack: number
      completionRate: number
    }
    okrsByEmployee: {
      employeeId: string
      employeeName: string
      okrCount: number
      avgScore: number
      checkInRate: number
    }[]
    topPerformers: { employeeId: string; employeeName: string; avgScore: number }[]
    recentActivity: { type: string; description: string; timestamp: string }[]
  }> => {
    try {
      const response = await apiClient.get(`/hr/okrs/department/${departmentId}/dashboard`, { params: filters })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'STATS_FAILED')
    }
  },

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk create OKRs from template
   */
  bulkCreateFromTemplate: async (data: {
    templateId: string
    employeeIds: string[]
    period: { year: number; quarter?: number }
  }): Promise<{ created: number; okrs: OKR[] }> => {
    try {
      const response = await apiClient.post('/hr/okrs/bulk-create', data)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CREATE_FAILED')
    }
  },

  /**
   * Bulk update OKR status
   */
  bulkUpdateStatus: async (okrIds: string[], status: OKRStatus): Promise<{ updated: number }> => {
    try {
      const response = await apiClient.patch('/hr/okrs/bulk-status', { okrIds, status })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Close period (complete all active OKRs for a period)
   */
  closePeriod: async (data: { year: number; quarter?: number; departmentId?: string }): Promise<{
    closed: number
    avgScore: number
    distribution: { grade: ScoreGrade; count: number }[]
  }> => {
    try {
      const response = await apiClient.post('/hr/okrs/close-period', data)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'UPDATE_FAILED')
    }
  },

  // ==================== TEMPLATES ====================

  /**
   * Get OKR templates
   */
  getOKRTemplates: async (filters?: { level?: OKRLevel; departmentId?: string }): Promise<{
    templates: {
      templateId: string
      name: string
      nameAr: string
      level: OKRLevel
      objectiveTemplate: string
      objectiveTemplateAr: string
      keyResultTemplates: {
        title: string
        titleAr: string
        metricType: KeyResultMetricType
        targetValue: number
        weight: number
      }[]
      isActive: boolean
    }[]
  }> => {
    try {
      const response = await apiClient.get('/hr/okrs/templates', { params: filters })
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Create OKR template
   */
  createOKRTemplate: async (data: {
    name: string
    nameAr: string
    level: OKRLevel
    objectiveTemplate: string
    objectiveTemplateAr: string
    keyResultTemplates: {
      title: string
      titleAr: string
      metricType: KeyResultMetricType
      targetValue: number
      weight: number
    }[]
  }): Promise<{ templateId: string }> => {
    try {
      const response = await apiClient.post('/hr/okrs/templates', data)
      return response.data
    } catch (error: any) {
      handleOKRError(error, 'CREATE_FAILED')
    }
  }
}

export default okrService

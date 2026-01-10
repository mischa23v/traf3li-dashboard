/**
 * Nine-Box Grid Service
 * Handles all 9-Box Talent Grid Assessment API calls
 *
 * Key Concepts:
 * - 9-Box Grid: 3x3 matrix of Performance (Low/Medium/High) vs Potential (Low/Medium/High)
 * - Box Positions: 1-9 (1=Low Performance/Low Potential, 9=High Performance/High Potential)
 * - Used for talent management, succession planning, and development decisions
 *
 * Grid Layout:
 * ┌─────────────────────────────────────────────────┐
 * │    Potential   │   Low   │  Medium  │   High   │
 * ├────────────────┼─────────┼──────────┼──────────┤
 * │ High           │ Box 3   │  Box 6   │  Box 9   │
 * │ Performance    │ Enigma  │ Core     │  Star    │
 * ├────────────────┼─────────┼──────────┼──────────┤
 * │ Medium         │ Box 2   │  Box 5   │  Box 8   │
 * │ Performance    │ Dilemma │ Core     │ Growth   │
 * ├────────────────┼─────────┼──────────┼──────────┤
 * │ Low            │ Box 1   │  Box 4   │  Box 7   │
 * │ Performance    │ Action  │ Develop  │ Rough    │
 * │                │ Needed  │          │ Diamond  │
 * └────────────────┴─────────┴──────────┴──────────┘
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export type PerformanceLevel = 'low' | 'medium' | 'high'
export type PotentialLevel = 'low' | 'medium' | 'high'
export type BoxPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type AssessmentStatus = 'draft' | 'submitted' | 'calibrated' | 'finalized'

// ==================== CONSTANTS ====================

/**
 * 9-Box Grid Labels (Bilingual)
 */
export const NINE_BOX_LABELS: Record<BoxPosition, { en: string; ar: string; description: string; descriptionAr: string; actionRecommendation: string; actionRecommendationAr: string }> = {
  1: {
    en: 'Action Needed',
    ar: 'يحتاج إجراء',
    description: 'Low performance and low potential. May need performance improvement plan or exit.',
    descriptionAr: 'أداء منخفض وإمكانات منخفضة. قد يحتاج إلى خطة تحسين الأداء أو إنهاء.',
    actionRecommendation: 'Performance Improvement Plan (PIP) or managed transition',
    actionRecommendationAr: 'خطة تحسين الأداء أو انتقال مدار'
  },
  2: {
    en: 'Dilemma',
    ar: 'معضلة',
    description: 'Medium performance but low potential. May be in wrong role.',
    descriptionAr: 'أداء متوسط ​​ولكن إمكانات منخفضة. قد يكون في الدور الخاطئ.',
    actionRecommendation: 'Role reassessment, consider lateral move',
    actionRecommendationAr: 'إعادة تقييم الدور، النظر في النقل الجانبي'
  },
  3: {
    en: 'Enigma',
    ar: 'لغز',
    description: 'High performance but low potential. Valuable but limited growth.',
    descriptionAr: 'أداء عالي ولكن إمكانات منخفضة. قيّم ولكن نمو محدود.',
    actionRecommendation: 'Recognize and retain, expand current role depth',
    actionRecommendationAr: 'الاعتراف والاحتفاظ، توسيع عمق الدور الحالي'
  },
  4: {
    en: 'Develop',
    ar: 'تطوير',
    description: 'Low performance with medium potential. May need development.',
    descriptionAr: 'أداء منخفض مع إمكانات متوسطة. قد يحتاج إلى تطوير.',
    actionRecommendation: 'Targeted development, coaching, skill building',
    actionRecommendationAr: 'تطوير موجه، تدريب، بناء المهارات'
  },
  5: {
    en: 'Core Player',
    ar: 'لاعب أساسي',
    description: 'Medium performance and medium potential. Solid contributor.',
    descriptionAr: 'أداء متوسط ​​وإمكانات متوسطة. مساهم قوي.',
    actionRecommendation: 'Maintain engagement, provide growth opportunities',
    actionRecommendationAr: 'الحفاظ على المشاركة، توفير فرص النمو'
  },
  6: {
    en: 'Core Professional',
    ar: 'محترف أساسي',
    description: 'High performance with medium potential. Key contributor.',
    descriptionAr: 'أداء عالي مع إمكانات متوسطة. مساهم رئيسي.',
    actionRecommendation: 'Retain and reward, consider specialist track',
    actionRecommendationAr: 'الاحتفاظ والمكافأة، النظر في المسار المتخصص'
  },
  7: {
    en: 'Rough Diamond',
    ar: 'ماسة خام',
    description: 'Low performance but high potential. Needs development support.',
    descriptionAr: 'أداء منخفض ولكن إمكانات عالية. يحتاج دعم التطوير.',
    actionRecommendation: 'Intensive coaching, mentoring, stretch assignments',
    actionRecommendationAr: 'تدريب مكثف، توجيه، مهام تحدي'
  },
  8: {
    en: 'High Potential',
    ar: 'إمكانات عالية',
    description: 'Medium performance with high potential. Future leader.',
    descriptionAr: 'أداء متوسط ​​مع إمكانات عالية. قائد مستقبلي.',
    actionRecommendation: 'Accelerated development, leadership training, exposure',
    actionRecommendationAr: 'تطوير متسارع، تدريب قيادي، تعرض'
  },
  9: {
    en: 'Star',
    ar: 'نجم',
    description: 'High performance and high potential. Top talent.',
    descriptionAr: 'أداء عالي وإمكانات عالية. أفضل المواهب.',
    actionRecommendation: 'Succession candidate, retention priority, strategic projects',
    actionRecommendationAr: 'مرشح للتعاقب، أولوية الاحتفاظ، مشاريع استراتيجية'
  }
}

/**
 * Convert performance/potential levels to box position
 */
export const getLevelToBoxPosition = (performance: PerformanceLevel, potential: PotentialLevel): BoxPosition => {
  const performanceIndex = { low: 0, medium: 1, high: 2 }
  const potentialIndex = { low: 0, medium: 1, high: 2 }

  // Box calculation: (performance row * 3) + potential column + 1
  // But we want: Low perf at bottom (row 0), High perf at top (row 2)
  // And: Low potential left (col 0), High potential right (col 2)
  const row = performanceIndex[performance]
  const col = potentialIndex[potential]

  return ((row * 3) + col + 1) as BoxPosition
}

/**
 * Convert box position to performance/potential levels
 */
export const getBoxPositionLevels = (boxPosition: BoxPosition): { performance: PerformanceLevel; potential: PotentialLevel } => {
  const levels: PerformanceLevel[] = ['low', 'medium', 'high']
  const row = Math.floor((boxPosition - 1) / 3)
  const col = (boxPosition - 1) % 3

  return {
    performance: levels[row],
    potential: levels[col]
  }
}

// ==================== INTERFACES ====================

export interface NineBoxCriteria {
  criteriaId: string
  name: string
  nameAr: string
  category: 'performance' | 'potential'
  description: string
  descriptionAr: string
  weight: number // 0-1
  ratingScale: 1 | 2 | 3 | 4 | 5
}

export interface NineBoxRating {
  criteriaId: string
  criteriaName: string
  criteriaNameAr: string
  category: 'performance' | 'potential'
  rating: 1 | 2 | 3 | 4 | 5
  weight: number
  comments?: string
  commentsAr?: string
  evidence?: string[]
}

export interface NineBoxAssessment {
  _id: string
  assessmentId: string // Formatted as "9BOX-2025-0001"

  // Employee info
  employeeId: string
  employeeName: string
  employeeNameAr: string
  employeeNumber: string
  departmentId: string
  departmentName: string
  departmentNameAr: string
  positionTitle: string
  positionTitleAr: string
  managerId: string
  managerName: string
  managerNameAr: string

  // Assessment period
  assessmentPeriod: {
    year: number
    periodType: 'annual' | 'mid_year' | 'quarterly'
    startDate: string
    endDate: string
  }

  // Status
  status: AssessmentStatus
  statusAr: string

  // Ratings
  performanceRatings: NineBoxRating[]
  potentialRatings: NineBoxRating[]

  // Calculated scores
  performanceScore: number // 0-100
  potentialScore: number // 0-100

  // Box position
  performanceLevel: PerformanceLevel
  potentialLevel: PotentialLevel
  boxPosition: BoxPosition
  boxLabel: string
  boxLabelAr: string

  // Calibration
  calibration?: {
    originalBoxPosition: BoxPosition
    calibratedBoxPosition: BoxPosition
    calibrationSessionId: string
    calibratedAt: string
    calibratedBy: string
    calibratedByName: string
    adjustmentReason?: string
    adjustmentReasonAr?: string
  }

  // Recommendations
  recommendations: {
    actionPlan: string
    actionPlanAr: string
    developmentFocus: string[]
    developmentFocusAr: string[]
    suggestedMoves: ('promotion' | 'lateral_move' | 'retention' | 'development' | 'exit')[]
    successionCandidate: boolean
    highPotentialFlag: boolean
    retentionRisk: 'low' | 'medium' | 'high'
  }

  // Manager comments
  managerComments?: string
  managerCommentsAr?: string
  strengthsObserved?: string[]
  developmentAreas?: string[]

  // Related data
  linkedPerformanceReviewId?: string
  linkedOKRs?: string[]

  // Acknowledgement
  acknowledgement?: {
    acknowledgedAt: string
    employeeComments?: string
  }

  // Audit
  createdBy: string
  createdAt: string
  updatedAt: string
  submittedAt?: string
  finalizedAt?: string
}

export interface NineBoxCalibrationSession {
  _id: string
  sessionId: string
  sessionName: string
  sessionNameAr: string

  // Scope
  departmentId?: string
  departmentName?: string
  departmentNameAr?: string
  year: number
  periodType: 'annual' | 'mid_year'

  // Status
  status: 'scheduled' | 'in_progress' | 'completed'

  // Schedule
  scheduledDate: string
  completedAt?: string

  // Participants
  participants: {
    participantId: string
    participantName: string
    participantNameAr: string
    role: 'facilitator' | 'hr_business_partner' | 'department_head' | 'senior_leader'
  }[]

  // Assessments included
  assessmentIds: string[]
  assessmentCount: number

  // Grid distribution
  distribution: {
    boxPosition: BoxPosition
    count: number
    percentage: number
    employees: {
      employeeId: string
      employeeName: string
      employeeNameAr: string
      wasAdjusted: boolean
    }[]
  }[]

  // Summary
  summary?: {
    totalAssessments: number
    adjustedCount: number
    adjustmentRate: number
    topTalentCount: number // Boxes 8, 9
    actionNeededCount: number // Box 1
    avgPerformanceScore: number
    avgPotentialScore: number
  }

  // Audit
  createdBy: string
  createdAt: string
  updatedAt: string
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CreateNineBoxAssessmentData {
  employeeId: string
  assessmentPeriod: {
    year: number
    periodType: 'annual' | 'mid_year' | 'quarterly'
    startDate: string
    endDate: string
  }
  performanceRatings: Omit<NineBoxRating, 'criteriaName' | 'criteriaNameAr'>[]
  potentialRatings: Omit<NineBoxRating, 'criteriaName' | 'criteriaNameAr'>[]
  managerComments?: string
  managerCommentsAr?: string
  strengthsObserved?: string[]
  developmentAreas?: string[]
  linkedPerformanceReviewId?: string
  linkedOKRs?: string[]
}

export interface UpdateNineBoxAssessmentData {
  performanceRatings?: Omit<NineBoxRating, 'criteriaName' | 'criteriaNameAr'>[]
  potentialRatings?: Omit<NineBoxRating, 'criteriaName' | 'criteriaNameAr'>[]
  managerComments?: string
  managerCommentsAr?: string
  strengthsObserved?: string[]
  developmentAreas?: string[]
  recommendations?: Partial<NineBoxAssessment['recommendations']>
}

export interface NineBoxFilters {
  year?: number
  periodType?: 'annual' | 'mid_year' | 'quarterly'
  departmentId?: string
  managerId?: string
  status?: AssessmentStatus
  boxPosition?: BoxPosition
  performanceLevel?: PerformanceLevel
  potentialLevel?: PotentialLevel
  highPotentialOnly?: boolean
  retentionRisk?: 'low' | 'medium' | 'high'
  search?: string
  page?: number
  limit?: number
  sortBy?: 'employeeName' | 'boxPosition' | 'performanceScore' | 'potentialScore' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface NineBoxAssessmentsResponse {
  assessments: NineBoxAssessment[]
  total: number
  page: number
  limit: number
  summary: {
    totalAssessments: number
    distribution: { boxPosition: BoxPosition; count: number; percentage: number }[]
    avgPerformanceScore: number
    avgPotentialScore: number
    topTalent: number
    highPotential: number
    actionNeeded: number
  }
}

export interface NineBoxGridView {
  year: number
  periodType: 'annual' | 'mid_year'
  departmentId?: string
  departmentName?: string
  departmentNameAr?: string
  grid: {
    boxPosition: BoxPosition
    boxLabel: string
    boxLabelAr: string
    performanceLevel: PerformanceLevel
    potentialLevel: PotentialLevel
    employees: {
      assessmentId: string
      employeeId: string
      employeeName: string
      employeeNameAr: string
      positionTitle: string
      positionTitleAr: string
      performanceScore: number
      potentialScore: number
      tenureYears: number
      retentionRisk: 'low' | 'medium' | 'high'
      successionCandidate: boolean
    }[]
    count: number
    percentage: number
  }[]
  totalEmployees: number
  avgPerformanceScore: number
  avgPotentialScore: number
}

export interface NineBoxStats {
  totalAssessments: number
  completedAssessments: number
  pendingAssessments: number
  completionRate: number
  byStatus: { status: AssessmentStatus; count: number }[]
  distribution: { boxPosition: BoxPosition; count: number; percentage: number }[]
  byDepartment: {
    departmentId: string
    departmentName: string
    departmentNameAr: string
    totalAssessments: number
    avgPerformanceScore: number
    avgPotentialScore: number
    topTalentPercentage: number
  }[]
  trends: {
    period: string
    avgPerformanceScore: number
    avgPotentialScore: number
    topTalentCount: number
    actionNeededCount: number
  }[]
  topTalentList: {
    employeeId: string
    employeeName: string
    employeeNameAr: string
    departmentName: string
    boxPosition: BoxPosition
    successionCandidate: boolean
  }[]
  retentionRiskSummary: {
    risk: 'low' | 'medium' | 'high'
    count: number
    percentage: number
  }[]
}

export interface CreateCalibrationSessionData {
  sessionName: string
  sessionNameAr: string
  departmentId?: string
  year: number
  periodType: 'annual' | 'mid_year'
  scheduledDate: string
  participants: {
    participantId: string
    role: 'facilitator' | 'hr_business_partner' | 'department_head' | 'senior_leader'
  }[]
  assessmentIds: string[]
}

export interface CalibrateAssessmentData {
  newBoxPosition: BoxPosition
  adjustmentReason: string
  adjustmentReasonAr?: string
}

// ==================== ERROR MESSAGES (BILINGUAL) ====================

const ERROR_MESSAGES = {
  FETCH_FAILED: {
    en: 'Failed to fetch 9-Box assessments',
    ar: 'فشل في جلب تقييمات الشبكة التسعية'
  },
  CREATE_FAILED: {
    en: 'Failed to create 9-Box assessment',
    ar: 'فشل في إنشاء تقييم الشبكة التسعية'
  },
  UPDATE_FAILED: {
    en: 'Failed to update 9-Box assessment',
    ar: 'فشل في تحديث تقييم الشبكة التسعية'
  },
  DELETE_FAILED: {
    en: 'Failed to delete 9-Box assessment',
    ar: 'فشل في حذف تقييم الشبكة التسعية'
  },
  CALIBRATION_FAILED: {
    en: 'Failed to process calibration',
    ar: 'فشل في معالجة المعايرة'
  },
  STATS_FAILED: {
    en: 'Failed to fetch 9-Box statistics',
    ar: 'فشل في جلب إحصائيات الشبكة التسعية'
  },
  NOT_FOUND: {
    en: '9-Box assessment not found',
    ar: 'تقييم الشبكة التسعية غير موجود'
  },
  NETWORK_ERROR: {
    en: 'Network error. Please check your connection',
    ar: 'خطأ في الشبكة. يرجى التحقق من اتصالك'
  },
  INVALID_DATA: {
    en: 'Invalid 9-Box assessment data',
    ar: 'بيانات تقييم الشبكة التسعية غير صالحة'
  },
  CRITERIA_FAILED: {
    en: 'Failed to fetch 9-Box criteria',
    ar: 'فشل في جلب معايير الشبكة التسعية'
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
const handleNineBoxError = (error: any, errorKey: keyof typeof ERROR_MESSAGES): never => {
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
 * Calculate performance/potential level from score
 */
export const calculateLevel = (score: number): PerformanceLevel | PotentialLevel => {
  if (score < 40) return 'low'
  if (score < 70) return 'medium'
  return 'high'
}

/**
 * Calculate score from ratings
 */
export const calculateScoreFromRatings = (ratings: NineBoxRating[]): number => {
  if (!ratings.length) return 0

  const totalWeight = ratings.reduce((sum, r) => sum + r.weight, 0)
  if (totalWeight === 0) return 0

  const weightedScore = ratings.reduce((sum, r) => {
    // Convert 1-5 rating to 0-100 score
    const normalizedScore = ((r.rating - 1) / 4) * 100
    return sum + (normalizedScore * r.weight)
  }, 0)

  return Math.round(weightedScore / totalWeight)
}

// ==================== API FUNCTIONS ====================

const nineBoxService = {
  // ==================== ASSESSMENT CRUD ====================

  /**
   * Get all 9-Box assessments with filters
   */
  getNineBoxAssessments: async (filters?: NineBoxFilters): Promise<NineBoxAssessmentsResponse> => {
    try {
      const response = await apiClient.get('/hr/nine-box', { params: filters })
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Get single 9-Box assessment by ID
   */
  getNineBoxAssessment: async (assessmentId: string): Promise<NineBoxAssessment> => {
    try {
      const response = await apiClient.get(`/hr/nine-box/${assessmentId}`)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Get 9-Box assessments for employee
   */
  getEmployeeNineBoxHistory: async (employeeId: string): Promise<{
    assessments: NineBoxAssessment[]
    trend: {
      period: string
      boxPosition: BoxPosition
      performanceScore: number
      potentialScore: number
    }[]
    currentPosition: BoxPosition
    previousPosition?: BoxPosition
    movement: 'improved' | 'declined' | 'stable'
  }> => {
    try {
      const response = await apiClient.get(`/hr/nine-box/employee/${employeeId}`)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Get 9-Box grid view
   */
  getNineBoxGridView: async (filters?: { year?: number; periodType?: 'annual' | 'mid_year'; departmentId?: string }): Promise<NineBoxGridView> => {
    try {
      const response = await apiClient.get('/hr/nine-box/grid', { params: filters })
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Create 9-Box assessment
   */
  createNineBoxAssessment: async (data: CreateNineBoxAssessmentData): Promise<NineBoxAssessment> => {
    try {
      const response = await apiClient.post('/hr/nine-box', data)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'CREATE_FAILED')
    }
  },

  /**
   * Update 9-Box assessment
   */
  updateNineBoxAssessment: async (assessmentId: string, data: UpdateNineBoxAssessmentData): Promise<NineBoxAssessment> => {
    try {
      const response = await apiClient.put(`/hr/nine-box/${assessmentId}`, data)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Delete 9-Box assessment
   */
  deleteNineBoxAssessment: async (assessmentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/hr/nine-box/${assessmentId}`)
    } catch (error: any) {
      handleNineBoxError(error, 'DELETE_FAILED')
    }
  },

  /**
   * Submit assessment for review
   */
  submitAssessment: async (assessmentId: string): Promise<NineBoxAssessment> => {
    try {
      const response = await apiClient.patch(`/hr/nine-box/${assessmentId}/submit`)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Finalize assessment
   */
  finalizeAssessment: async (assessmentId: string): Promise<NineBoxAssessment> => {
    try {
      const response = await apiClient.patch(`/hr/nine-box/${assessmentId}/finalize`)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'UPDATE_FAILED')
    }
  },

  /**
   * Employee acknowledge assessment
   */
  acknowledgeAssessment: async (assessmentId: string, comments?: string): Promise<NineBoxAssessment> => {
    try {
      const response = await apiClient.post(`/hr/nine-box/${assessmentId}/acknowledge`, { comments })
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'UPDATE_FAILED')
    }
  },

  // ==================== CALIBRATION ====================

  /**
   * Get calibration sessions
   */
  getCalibrationSessions: async (filters?: { year?: number; status?: string; departmentId?: string }): Promise<NineBoxCalibrationSession[]> => {
    try {
      const response = await apiClient.get('/hr/nine-box/calibration-sessions', { params: filters })
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'CALIBRATION_FAILED')
    }
  },

  /**
   * Get single calibration session
   */
  getCalibrationSession: async (sessionId: string): Promise<NineBoxCalibrationSession> => {
    try {
      const response = await apiClient.get(`/hr/nine-box/calibration-sessions/${sessionId}`)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'CALIBRATION_FAILED')
    }
  },

  /**
   * Create calibration session
   */
  createCalibrationSession: async (data: CreateCalibrationSessionData): Promise<NineBoxCalibrationSession> => {
    try {
      const response = await apiClient.post('/hr/nine-box/calibration-sessions', data)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'CALIBRATION_FAILED')
    }
  },

  /**
   * Start calibration session
   */
  startCalibrationSession: async (sessionId: string): Promise<NineBoxCalibrationSession> => {
    try {
      const response = await apiClient.patch(`/hr/nine-box/calibration-sessions/${sessionId}/start`)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'CALIBRATION_FAILED')
    }
  },

  /**
   * Calibrate individual assessment
   */
  calibrateAssessment: async (
    sessionId: string,
    assessmentId: string,
    data: CalibrateAssessmentData
  ): Promise<NineBoxAssessment> => {
    try {
      const response = await apiClient.patch(
        `/hr/nine-box/calibration-sessions/${sessionId}/assessments/${assessmentId}/calibrate`,
        data
      )
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'CALIBRATION_FAILED')
    }
  },

  /**
   * Complete calibration session
   */
  completeCalibrationSession: async (sessionId: string): Promise<NineBoxCalibrationSession> => {
    try {
      const response = await apiClient.patch(`/hr/nine-box/calibration-sessions/${sessionId}/complete`)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'CALIBRATION_FAILED')
    }
  },

  /**
   * Get calibration session grid comparison (before vs after)
   */
  getCalibrationComparison: async (sessionId: string): Promise<{
    before: NineBoxGridView
    after: NineBoxGridView
    changes: {
      assessmentId: string
      employeeName: string
      employeeNameAr: string
      originalBox: BoxPosition
      calibratedBox: BoxPosition
      reason: string
    }[]
  }> => {
    try {
      const response = await apiClient.get(`/hr/nine-box/calibration-sessions/${sessionId}/comparison`)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'CALIBRATION_FAILED')
    }
  },

  // ==================== CRITERIA ====================

  /**
   * Get 9-Box assessment criteria
   */
  getNineBoxCriteria: async (): Promise<{
    performanceCriteria: NineBoxCriteria[]
    potentialCriteria: NineBoxCriteria[]
  }> => {
    try {
      const response = await apiClient.get('/hr/nine-box/criteria')
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'CRITERIA_FAILED')
    }
  },

  /**
   * Update 9-Box criteria
   */
  updateNineBoxCriteria: async (criteriaId: string, data: Partial<NineBoxCriteria>): Promise<NineBoxCriteria> => {
    try {
      const response = await apiClient.put(`/hr/nine-box/criteria/${criteriaId}`, data)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'CRITERIA_FAILED')
    }
  },

  // ==================== STATISTICS & ANALYTICS ====================

  /**
   * Get 9-Box statistics
   */
  getNineBoxStats: async (filters?: { year?: number; periodType?: 'annual' | 'mid_year'; departmentId?: string }): Promise<NineBoxStats> => {
    try {
      const response = await apiClient.get('/hr/nine-box/stats', { params: filters })
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'STATS_FAILED')
    }
  },

  /**
   * Get succession candidates from 9-Box
   */
  getSuccessionCandidates: async (filters?: { departmentId?: string; minBoxPosition?: BoxPosition }): Promise<{
    candidates: {
      employeeId: string
      employeeName: string
      employeeNameAr: string
      departmentName: string
      departmentNameAr: string
      positionTitle: string
      positionTitleAr: string
      boxPosition: BoxPosition
      boxLabel: string
      boxLabelAr: string
      performanceScore: number
      potentialScore: number
      tenureYears: number
      readinessLevel: 'ready_now' | 'ready_1_year' | 'ready_2_years' | 'ready_3_plus_years'
      developmentNeeds: string[]
    }[]
    total: number
    byDepartment: { departmentId: string; departmentName: string; count: number }[]
  }> => {
    try {
      const response = await apiClient.get('/hr/nine-box/succession-candidates', { params: filters })
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Get distribution comparison across periods
   */
  getDistributionTrend: async (filters?: { departmentId?: string; periods?: number }): Promise<{
    trends: {
      period: string
      year: number
      periodType: 'annual' | 'mid_year'
      distribution: { boxPosition: BoxPosition; count: number; percentage: number }[]
      avgPerformanceScore: number
      avgPotentialScore: number
    }[]
    improvement: {
      topTalentChange: number // percentage point change
      actionNeededChange: number
      overallTrend: 'improving' | 'declining' | 'stable'
    }
  }> => {
    try {
      const response = await apiClient.get('/hr/nine-box/trends', { params: filters })
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'STATS_FAILED')
    }
  },

  /**
   * Get retention risk analysis from 9-Box
   */
  getRetentionRiskAnalysis: async (filters?: { departmentId?: string; minBoxPosition?: BoxPosition }): Promise<{
    highRiskTalent: {
      employeeId: string
      employeeName: string
      employeeNameAr: string
      boxPosition: BoxPosition
      retentionRisk: 'high' | 'medium'
      riskFactors: string[]
      recommendedActions: string[]
    }[]
    riskByBox: {
      boxPosition: BoxPosition
      totalEmployees: number
      highRiskCount: number
      mediumRiskCount: number
    }[]
    summary: {
      totalHighRisk: number
      totalMediumRisk: number
      criticalRiskCount: number // High potential + High risk
    }
  }> => {
    try {
      const response = await apiClient.get('/hr/nine-box/retention-risk', { params: filters })
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'STATS_FAILED')
    }
  },

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk create assessments
   */
  bulkCreateAssessments: async (data: {
    employeeIds: string[]
    assessmentPeriod: {
      year: number
      periodType: 'annual' | 'mid_year' | 'quarterly'
      startDate: string
      endDate: string
    }
    linkedPerformanceReviewPeriod?: string
  }): Promise<{ created: number; assessments: NineBoxAssessment[] }> => {
    try {
      const response = await apiClient.post('/hr/nine-box/bulk-create', data)
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'CREATE_FAILED')
    }
  },

  /**
   * Export 9-Box data
   */
  exportNineBoxData: async (filters?: NineBoxFilters, format?: 'xlsx' | 'csv' | 'pdf'): Promise<Blob> => {
    try {
      const response = await apiClient.get('/hr/nine-box/export', {
        params: { ...filters, format: format || 'xlsx' },
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'FETCH_FAILED')
    }
  },

  /**
   * Send reminders for pending assessments
   */
  sendReminders: async (assessmentIds: string[]): Promise<{ sent: number }> => {
    try {
      const response = await apiClient.post('/hr/nine-box/send-reminders', { assessmentIds })
      return response.data
    } catch (error: any) {
      handleNineBoxError(error, 'UPDATE_FAILED')
    }
  }
}

export default nineBoxService

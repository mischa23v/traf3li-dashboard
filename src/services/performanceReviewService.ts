import api from './api'

// Types
export type ReviewType = 'annual' | 'mid_year' | 'quarterly' | 'probation' | 'project' | 'ad_hoc'
export type ReviewStatus = 'draft' | 'self_assessment' | 'manager_review' | 'calibration' | 'completed' | 'acknowledged'
export type RatingScale = 1 | 2 | 3 | 4 | 5
export type OverallRating = 'exceptional' | 'exceeds_expectations' | 'meets_expectations' | 'needs_improvement' | 'unsatisfactory'
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'exceeded' | 'not_achieved'
export type CompetencyCategory = 'core' | 'leadership' | 'technical' | 'legal' | 'client_service'
export type FeedbackType = 'peer' | 'subordinate' | 'client' | 'cross_functional'
export type RecommendationType = 'promotion' | 'salary_increase' | 'bonus' | 'training' | 'pip' | 'termination' | 'lateral_move' | 'retention_risk'

// Interfaces
export interface ReviewPeriod {
  startDate: string
  endDate: string
  reviewDueDate: string
  selfAssessmentDueDate: string
}

export interface SelfAssessment {
  completedAt?: string
  achievements: string[]
  challenges: string[]
  developmentAreas: string[]
  careerAspirations: string
  additionalComments: string
  overallSelfRating: RatingScale
}

export interface CompetencyRating {
  competencyId: string
  competencyName: string
  competencyNameAr: string
  category: CompetencyCategory
  selfRating?: RatingScale
  managerRating?: RatingScale
  weight: number
  comments: string
  examples: string[]
}

export interface Goal {
  goalId: string
  title: string
  titleAr: string
  description: string
  targetMetric: string
  actualResult?: string
  weight: number
  status: GoalStatus
  selfRating?: RatingScale
  managerRating?: RatingScale
  comments: string
  evidence: string[]
}

export interface KPI {
  kpiId: string
  name: string
  nameAr: string
  target: number
  actual: number
  unit: string
  weight: number
  achievement: number // percentage
  rating: RatingScale
}

export interface AttorneyMetrics {
  // Case Performance
  casesHandled: number
  casesWon: number
  casesSettled: number
  casesLost: number
  winRate: number
  avgCaseResolutionDays: number

  // Billing Performance
  billableHours: number
  billableTarget: number
  billingRealizationRate: number
  collectionRate: number
  revenueGenerated: number

  // Legal Work Quality
  appealRate: number
  clientComplaintRate: number
  peerReviewScore: number
  researchQualityScore: number
  documentQualityScore: number

  // Practice Development
  newClientsMatter: number
  crossSellRevenue: number
  publishedArticles: number
  speakingEngagements: number
  proBonoHours: number
}

export interface FeedbackProvider {
  providerId: string
  providerName: string
  providerNameAr: string
  relationship: FeedbackType
  requestedAt: string
  completedAt?: string
  status: 'pending' | 'completed' | 'declined'
}

export interface FeedbackResponse {
  providerId: string
  ratings: {
    competencyId: string
    rating: RatingScale
    comments: string
  }[]
  strengths: string[]
  developmentAreas: string[]
  overallComments: string
  submittedAt: string
}

export interface Feedback360 {
  providers: FeedbackProvider[]
  responses: FeedbackResponse[]
  aggregatedRatings: {
    competencyId: string
    avgRating: number
    responseCount: number
  }[]
  summary: {
    commonStrengths: string[]
    commonDevelopmentAreas: string[]
    overallSentiment: 'positive' | 'mixed' | 'negative'
  }
}

export interface ManagerAssessment {
  completedAt?: string
  overallComments: string
  strengths: string[]
  areasForImprovement: string[]
  overallRating: OverallRating
  ratingJustification: string
  potentialAssessment: 'high_potential' | 'promotable' | 'valued_contributor' | 'development_needed'
  recommendations: {
    type: RecommendationType
    details: string
    priority: 'high' | 'medium' | 'low'
  }[]
}

export interface DevelopmentPlanItem {
  itemId: string
  objective: string
  objectiveAr: string
  developmentArea: string
  actions: string[]
  resources: string[]
  targetDate: string
  successMeasures: string
  status: 'planned' | 'in_progress' | 'completed' | 'deferred'
  progress: number
}

export interface DevelopmentPlan {
  items: DevelopmentPlanItem[]
  trainingRecommendations: string[]
  mentorAssigned?: {
    mentorId: string
    mentorName: string
    mentorNameAr: string
    startDate: string
  }
  careerPath: {
    currentRole: string
    targetRole: string
    timeframe: string
    gapAnalysis: string[]
  }
}

export interface CalibrationData {
  calibrationSessionId?: string
  calibratedAt?: string
  calibratedBy?: string
  originalRating: OverallRating
  finalRating: OverallRating
  adjustmentReason?: string
  comparativeRanking?: number
  distributionBucket?: string
}

export interface ApprovalStep {
  stepNumber: number
  approverRole: string
  approverId?: string
  approverName?: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  actionDate?: string
  comments?: string
}

export interface PerformanceReview {
  _id: string
  reviewId: string
  employeeId: string
  employeeName: string
  employeeNameAr: string
  departmentId: string
  departmentName: string
  departmentNameAr: string
  positionTitle: string
  positionTitleAr: string
  managerId: string
  managerName: string
  managerNameAr: string

  reviewType: ReviewType
  reviewPeriod: ReviewPeriod
  status: ReviewStatus

  selfAssessment?: SelfAssessment
  competencies: CompetencyRating[]
  goals: Goal[]
  kpis: KPI[]

  // Attorney-specific (only for legal staff)
  isAttorney: boolean
  attorneyMetrics?: AttorneyMetrics

  // 360 Feedback (optional based on review type)
  feedback360?: Feedback360

  managerAssessment?: ManagerAssessment
  developmentPlan?: DevelopmentPlan
  calibration?: CalibrationData

  overallScore?: number
  finalRating?: OverallRating

  approvalWorkflow: ApprovalStep[]
  acknowledgement?: {
    acknowledgedAt: string
    employeeComments?: string
    disputeRaised: boolean
    disputeReason?: string
  }

  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface PerformanceReviewFilters {
  reviewType?: ReviewType
  status?: ReviewStatus
  departmentId?: string
  managerId?: string
  periodYear?: number
  finalRating?: OverallRating
  search?: string
  page?: number
  limit?: number
}

export interface ReviewTemplate {
  _id: string
  templateId: string
  name: string
  nameAr: string
  reviewType: ReviewType
  competencies: {
    competencyId: string
    name: string
    nameAr: string
    category: CompetencyCategory
    description: string
    weight: number
  }[]
  includeGoals: boolean
  includeKPIs: boolean
  include360Feedback: boolean
  includeAttorneyMetrics: boolean
  isActive: boolean
}

export interface CalibrationSession {
  _id: string
  sessionId: string
  sessionName: string
  sessionNameAr: string
  periodYear: number
  reviewType: ReviewType
  departmentId?: string
  status: 'scheduled' | 'in_progress' | 'completed'
  scheduledDate: string
  participants: {
    participantId: string
    name: string
    role: string
  }[]
  reviewsIncluded: string[]
  ratingDistribution: {
    rating: OverallRating
    count: number
    targetPercentage: number
    actualPercentage: number
  }[]
  completedAt?: string
}

// API Functions
export const performanceReviewService = {
  // Get all performance reviews with filters
  getPerformanceReviews: async (filters?: PerformanceReviewFilters) => {
    const response = await api.get<{ data: PerformanceReview[]; total: number; page: number; limit: number }>(
      '/hr/performance-reviews',
      { params: filters }
    )
    return response.data
  },

  // Get single performance review
  getPerformanceReview: async (reviewId: string) => {
    const response = await api.get<PerformanceReview>(`/hr/performance-reviews/${reviewId}`)
    return response.data
  },

  // Create new performance review
  createPerformanceReview: async (data: {
    employeeId: string
    reviewType: ReviewType
    reviewPeriod: ReviewPeriod
    templateId?: string
    goals?: Omit<Goal, 'goalId' | 'status' | 'selfRating' | 'managerRating'>[]
    kpis?: Omit<KPI, 'kpiId' | 'actual' | 'achievement' | 'rating'>[]
    include360Feedback?: boolean
    feedbackProviders?: Omit<FeedbackProvider, 'status' | 'requestedAt' | 'completedAt'>[]
  }) => {
    const response = await api.post<PerformanceReview>('/hr/performance-reviews', data)
    return response.data
  },

  // Update performance review
  updatePerformanceReview: async (reviewId: string, data: Partial<PerformanceReview>) => {
    const response = await api.patch<PerformanceReview>(`/hr/performance-reviews/${reviewId}`, data)
    return response.data
  },

  // Submit self-assessment
  submitSelfAssessment: async (reviewId: string, data: SelfAssessment & {
    competencyRatings: { competencyId: string; rating: RatingScale; comments: string }[]
    goalRatings: { goalId: string; rating: RatingScale; actualResult: string; comments: string }[]
  }) => {
    const response = await api.post<PerformanceReview>(`/hr/performance-reviews/${reviewId}/self-assessment`, data)
    return response.data
  },

  // Submit manager assessment
  submitManagerAssessment: async (reviewId: string, data: ManagerAssessment & {
    competencyRatings: { competencyId: string; rating: RatingScale; comments: string; examples: string[] }[]
    goalRatings: { goalId: string; rating: RatingScale; comments: string }[]
    kpiRatings?: { kpiId: string; actual: number }[]
    attorneyMetrics?: AttorneyMetrics
  }) => {
    const response = await api.post<PerformanceReview>(`/hr/performance-reviews/${reviewId}/manager-assessment`, data)
    return response.data
  },

  // Request 360 feedback
  request360Feedback: async (reviewId: string, providers: Omit<FeedbackProvider, 'status' | 'requestedAt' | 'completedAt'>[]) => {
    const response = await api.post<PerformanceReview>(`/hr/performance-reviews/${reviewId}/360-feedback/request`, { providers })
    return response.data
  },

  // Submit 360 feedback response
  submit360Feedback: async (reviewId: string, providerId: string, data: Omit<FeedbackResponse, 'providerId' | 'submittedAt'>) => {
    const response = await api.post<PerformanceReview>(`/hr/performance-reviews/${reviewId}/360-feedback/${providerId}`, data)
    return response.data
  },

  // Create development plan
  createDevelopmentPlan: async (reviewId: string, data: DevelopmentPlan) => {
    const response = await api.post<PerformanceReview>(`/hr/performance-reviews/${reviewId}/development-plan`, data)
    return response.data
  },

  // Update development plan item
  updateDevelopmentPlanItem: async (reviewId: string, itemId: string, data: Partial<DevelopmentPlanItem>) => {
    const response = await api.patch<PerformanceReview>(`/hr/performance-reviews/${reviewId}/development-plan/${itemId}`, data)
    return response.data
  },

  // Submit for calibration
  submitForCalibration: async (reviewId: string, calibrationSessionId: string) => {
    const response = await api.post<PerformanceReview>(`/hr/performance-reviews/${reviewId}/calibration`, { calibrationSessionId })
    return response.data
  },

  // Apply calibration result
  applyCalibration: async (reviewId: string, data: {
    finalRating: OverallRating
    adjustmentReason?: string
    comparativeRanking?: number
  }) => {
    const response = await api.post<PerformanceReview>(`/hr/performance-reviews/${reviewId}/calibration/apply`, data)
    return response.data
  },

  // Complete review
  completeReview: async (reviewId: string) => {
    const response = await api.post<PerformanceReview>(`/hr/performance-reviews/${reviewId}/complete`)
    return response.data
  },

  // Employee acknowledge review
  acknowledgeReview: async (reviewId: string, data: {
    employeeComments?: string
    disputeRaised?: boolean
    disputeReason?: string
  }) => {
    const response = await api.post<PerformanceReview>(`/hr/performance-reviews/${reviewId}/acknowledge`, data)
    return response.data
  },

  // Approve review step
  approveReviewStep: async (reviewId: string, stepNumber: number, data: { comments?: string }) => {
    const response = await api.post<PerformanceReview>(`/hr/performance-reviews/${reviewId}/approve/${stepNumber}`, data)
    return response.data
  },

  // Reject review step
  rejectReviewStep: async (reviewId: string, stepNumber: number, data: { comments: string }) => {
    const response = await api.post<PerformanceReview>(`/hr/performance-reviews/${reviewId}/reject/${stepNumber}`, data)
    return response.data
  },

  // Get review templates
  getReviewTemplates: async (reviewType?: ReviewType) => {
    const response = await api.get<ReviewTemplate[]>('/hr/performance-reviews/templates', { params: { reviewType } })
    return response.data
  },

  // Create review template
  createReviewTemplate: async (data: Omit<ReviewTemplate, '_id' | 'templateId'>) => {
    const response = await api.post<ReviewTemplate>('/hr/performance-reviews/templates', data)
    return response.data
  },

  // Get calibration sessions
  getCalibrationSessions: async (filters?: { periodYear?: number; status?: string; departmentId?: string }) => {
    const response = await api.get<CalibrationSession[]>('/hr/performance-reviews/calibration-sessions', { params: filters })
    return response.data
  },

  // Create calibration session
  createCalibrationSession: async (data: Omit<CalibrationSession, '_id' | 'sessionId' | 'status' | 'ratingDistribution' | 'completedAt'>) => {
    const response = await api.post<CalibrationSession>('/hr/performance-reviews/calibration-sessions', data)
    return response.data
  },

  // Complete calibration session
  completeCalibrationSession: async (sessionId: string) => {
    const response = await api.post<CalibrationSession>(`/hr/performance-reviews/calibration-sessions/${sessionId}/complete`)
    return response.data
  },

  // Get performance statistics
  getPerformanceStats: async (filters?: { periodYear?: number; departmentId?: string }) => {
    const response = await api.get<{
      totalReviews: number
      byStatus: { status: ReviewStatus; count: number }[]
      byRating: { rating: OverallRating; count: number; percentage: number }[]
      avgOverallScore: number
      completionRate: number
      overdueReviews: number
      upcomingDue: number
    }>('/hr/performance-reviews/stats', { params: filters })
    return response.data
  },

  // Get employee performance history
  getEmployeePerformanceHistory: async (employeeId: string) => {
    const response = await api.get<{
      reviews: PerformanceReview[]
      ratingTrend: { period: string; rating: OverallRating; score: number }[]
      strengthsOverTime: string[]
      developmentAreasOverTime: string[]
    }>(`/hr/performance-reviews/employee/${employeeId}/history`)
    return response.data
  },

  // Get team performance summary
  getTeamPerformanceSummary: async (managerId: string, periodYear?: number) => {
    const response = await api.get<{
      teamMembers: {
        employeeId: string
        employeeName: string
        employeeNameAr: string
        reviewStatus: ReviewStatus
        finalRating?: OverallRating
        overallScore?: number
      }[]
      ratingDistribution: { rating: OverallRating; count: number }[]
      avgTeamScore: number
      completedCount: number
      pendingCount: number
    }>(`/hr/performance-reviews/team/${managerId}/summary`, { params: { periodYear } })
    return response.data
  },

  // Bulk create reviews for department
  bulkCreateReviews: async (data: {
    departmentId?: string
    employeeIds?: string[]
    reviewType: ReviewType
    reviewPeriod: ReviewPeriod
    templateId: string
  }) => {
    const response = await api.post<{ created: number; reviews: PerformanceReview[] }>('/hr/performance-reviews/bulk-create', data)
    return response.data
  },

  // Send reminder
  sendReminder: async (reviewId: string, reminderType: 'self_assessment' | 'manager_review' | '360_feedback' | 'acknowledgement') => {
    const response = await api.post(`/hr/performance-reviews/${reviewId}/reminder`, { reminderType })
    return response.data
  },

  // Export reviews
  exportReviews: async (filters?: PerformanceReviewFilters, format: 'pdf' | 'excel' = 'excel') => {
    const response = await api.get('/hr/performance-reviews/export', {
      params: { ...filters, format },
      responseType: 'blob'
    })
    return response.data
  },
}

export default performanceReviewService
